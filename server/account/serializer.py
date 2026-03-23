from rest_framework import serializers
from account.models import IGBusinessAccount, IGAccessToken
from django.utils import timezone
from datetime import timedelta
from rest_framework.exceptions import ValidationError
import threading

from server.utils.rag_pipeline import rag_pipeline
from server.utils.logger import logger
from account.models import CustomUser
from django.contrib.auth.models import User

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = CustomUser
        fields = ['f_name', 'l_name', 'username', 'email']

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

class IGAccessTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = IGAccessToken
        fields = ["id", "access_token", "created_at", "updated_at", "expires_at"]
        read_only_fields = ["id", "created_at", "updated_at", "expires_at", "access_token"]


class IGBusinessAccountSerializer(serializers.ModelSerializer):
    # Read-only nested representation of the token object
    access_token_data = IGAccessTokenSerializer(source="access_token", read_only=True)

    # Raw token input field
    access_token = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = IGBusinessAccount
        fields = [
            "id",
            "business_account_id",
            "name",
            "username",
            "description",
            "logo",
            "access_token",       # write-only raw token
            "access_token_data",  # read-only nested data
            "created_at",
            "updated_at",
            "auto_reply_enabled",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "access_token_data"]

    def create(self, validated_data):
        raw_token = validated_data.pop("access_token", None)
        custom_user = self.context["request"].user.customuser

        # Create access token entry if provided
        if raw_token:
            token_obj = IGAccessToken.objects.create(
                custom_user=custom_user,
                access_token=raw_token,
                expires_at=timezone.now() + timedelta(days=60),
            )
            validated_data["access_token"] = token_obj
        else:
            raise ValidationError({"access_token": "Access token is required."})

        validated_data["custom_user"] = custom_user

        instance = super().create(validated_data)

        # Trigger background ingestion of business description into RAG
        try:
            if getattr(instance, "business_account_id", None):
                rag_pipeline.ingest_business(str(instance.business_account_id), instance.description, False)
                logger.info(f"Triggered RAG ingest for business {instance.business_account_id} on create")
        except Exception as e:
            logger.error(f"Failed to trigger RAG ingest on create: {e}")

        return instance

    def update(self, instance, validated_data):
        raw_token = validated_data.pop("access_token", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update token if provided
        if raw_token:
            old_token = instance.access_token
            old_token.access_token = raw_token
            old_token.expires_at = timezone.now() + timedelta(days=60)
            old_token.save()

        # Trigger background ingestion after update (if business id exists)
        try:
            business_id = getattr(instance, "business_account_id", None)
            if business_id:
                rag_pipeline.ingest_business(str(business_id), instance.description, False)
                logger.info(f"Triggered RAG ingest for business {business_id} on update")
        except Exception as e:
            logger.error(f"Failed to trigger RAG ingest on update: {e}")

        return instance

from rest_framework import serializers
from account.models import IGBusinessAccount, IGAccessToken
from django.utils import timezone
from datetime import timedelta
from rest_framework.exceptions import ValidationError



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

        return super().create(validated_data)

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

        return instance

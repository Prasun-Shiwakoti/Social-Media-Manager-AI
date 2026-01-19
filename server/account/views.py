
from datetime import timedelta, timezone
from django.contrib.auth.models import User
from django.core.signing import TimestampSigner, BadSignature, SignatureExpired


from rest_framework import serializers, viewsets, status
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken


from account.models import IGBusinessAccount, CustomUser, IGAccessToken
from account.serializer import IGBusinessAccountSerializer
from server.utils.logger import logger
from server.utils.instagram_api import fetch_long_lived_token, fetch_business_account_id


@api_view(['POST'])
def register(request):
    try:
        data = request.data
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        f_name = data.get('first_name')
        l_name = data.get('last_name')
        

        user = User.objects.create_user(username=username, email=email, password=password)
        custom_user = CustomUser.objects.create(user=user, f_name=f_name, l_name=l_name)

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
    
    except Exception as e:
        logger.error(f"Error occurred during registration:\n\t {str(e)}")
        return Response({
            'error': str(e)
        }, status=400)

    logger.info(f"User registered successfully: {username}")
    return Response({
        'message': 'User registered successfully.',
        'access_token': access_token,
        'refresh_token': refresh_token
    }, status=201)

@api_view(['GET'])
def insta_webhook_login(request):
    # Handle Instagram webhook login
    code = request.GET.get('code')
    state = request.GET.get("state")

    if not code:
        return Response({'error': 'Code parameter is missing'}, status=400)

    signer = TimestampSigner()
    try:
        custom_user_id = signer.unsign(state, max_age=300)
        custom_user = CustomUser.objects.get(id=custom_user_id)
        access_token = fetch_long_lived_token(code)

        if not access_token:
            logger.error("Failed to fetch long-lived access token")
            return Response({'error': 'Failed to fetch long-lived access token'}, status=500)
        
        IGAccessToken.objects.update_or_create(
            custom_user=custom_user,
            access_token=access_token,
            defaults={'expires_at': timezone.now() + timedelta(days=60)}
        )
        logger.info(f"Instagram webhook login successful for user: {custom_user.user.username}")
        return Response({'message': 'Instagram webhook login successful'}, status=200)

    except (BadSignature, SignatureExpired):
        return Response({'error': 'Invalid or expired state parameter'}, status=400)
    except Exception as e:
        logger.error(f"Error during Instagram webhook login: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def get_signed_state(request):
    try:
        signer = TimestampSigner()
        state = signer.sign(str(request.user.customuser.id))
        return Response({'state': state}, status=200)
    except Exception as e:
        logger.error(f"Error generating signed state: {str(e)}")
        return Response({'error': str(e)}, status=500)

class IsBusinessOwner(BasePermission):
    """Allow only the owner of the business account to access it."""

    def has_object_permission(self, request, view, obj):
        return obj.custom_user == request.user.customuser


class IGBusinessAccountViewSet(viewsets.ModelViewSet):
    serializer_class = IGBusinessAccountSerializer
    permission_classes = [IsAuthenticated, IsBusinessOwner]

    def get_queryset(self):
        user = self.request.user.customuser
        return IGBusinessAccount.objects.filter(custom_user=user)

    def create(self, request, *args, **kwargs):
        """Standard DRF create using the serializer's custom logic."""
        try:
            if 'business_account_id' not in request.data:
                print("Fetching business account id...")
                access_token = request.data.get('access_token')
                business_account_id = fetch_business_account_id(access_token)
                print(f"Fetched business account id: {business_account_id}")
                if not business_account_id:
                    return Response(
                        {"error": "Unable to fetch Business Account ID with provided access token."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                request.data['business_account_id'] = business_account_id

            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error while creating IG Business Account: {str(e)}")
            raise

    def update(self, request, *args, **kwargs):
        """Standard DRF update using serializer update logic."""
        try:
            return super().update(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error while updating IG Business Account: {str(e)}")
            raise

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            name = instance.name
            instance.delete()
            logger.info(f"Business account deleted: {name}")

            return Response(
                {"message": f"Business account '{name}' deleted successfully."},
                status=status.HTTP_204_NO_CONTENT,
            )
        except Exception as e:
            logger.error(f"Error while deleting IG Business Account: {str(e)}")
            raise


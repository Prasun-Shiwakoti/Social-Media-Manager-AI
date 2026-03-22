from django.urls import path, include
from rest_framework.routers import DefaultRouter
from account.views import register, IGBusinessAccountViewSet, UserProfileView, ChangePasswordView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Create a router and register the viewset
router = DefaultRouter()
router.register(r'business-accounts', IGBusinessAccountViewSet, basename='business-account')

urlpatterns = [
    path('register/', register, name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('password/', ChangePasswordView.as_view(), name='change-password'),
    path('', include(router.urls)),
]

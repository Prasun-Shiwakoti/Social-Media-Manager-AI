from django.urls import path, include
from rest_framework.routers import DefaultRouter
from account.views import register, IGBusinessAccountViewSet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Create a router and register the viewset
router = DefaultRouter()
router.register(r'business-accounts', IGBusinessAccountViewSet, basename='business-account')

urlpatterns = [
    path('register/', register, name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
]

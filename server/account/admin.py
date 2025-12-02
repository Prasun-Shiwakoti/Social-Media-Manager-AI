from django.contrib import admin
from account.models import CustomUser, IGBusinessAccount, IGAccessToken


# Register your models here.
@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('user', 'f_name', 'l_name', 'date_joined')
    search_fields = ('user__username', 'f_name', 'l_name')


@admin.register(IGBusinessAccount)
class IGBusinessAccountAdmin(admin.ModelAdmin):
    list_display = ('name', 'custom_user', 'business_account_id')
    search_fields = ('name', 'custom_user__user__username')


@admin.register(IGAccessToken)
class IGAccessTokenAdmin(admin.ModelAdmin):
    list_display = ('custom_user', 'access_token', 'expires_at')
    search_fields = ('custom_user__user__username', 'access_token')
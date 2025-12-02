from django.db import models
from django.contrib.auth.models import User


# Create your models here.
class CustomUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    date_joined = models.DateTimeField(auto_now_add=True)
    f_name = models.CharField(max_length=30, blank=True, null=True)
    l_name = models.CharField(max_length=30, blank=True, null=True)

    def __str__(self):
        return self.user.username
    
class IGAccessToken(models.Model):
    custom_user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    access_token = models.TextField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField()

    def __str__(self):
        return f"{self.custom_user.user.username} - {self.access_token[:10]}..."

class IGBusinessAccount(models.Model):
    custom_user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    business_account_id = models.CharField(max_length=100, blank=True, null=True)
    access_token = models.ForeignKey(IGAccessToken, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    logo = models.ImageField(upload_to='business_logos/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    auto_reply_enabled = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} - ({self.custom_user.user.username})"
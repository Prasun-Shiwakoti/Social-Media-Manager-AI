from django.contrib import admin
from .models import PostImage, InstagramPost

# Register your models here.
@admin.register(PostImage)
class PostImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'image_url', 'created_at')
    search_fields = ('image_url',)
    
@admin.register(InstagramPost)
class InstagramPostAdmin(admin.ModelAdmin):
    list_display = ('business_account', 'caption', 'is_posted', 'scheduled_time', 'created_at')
    search_fields = ('business_account__name', 'caption')
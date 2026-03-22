from django.urls import path
from dashboard.views import (
    generate_caption, 
    generate_image, 
    generate_post, 
    publish_post, 
    get_post,
    fetch_user_instagram_profile,
    get_all_instagram_posts,
    get_post_details,
    get_instagram_insights,
    get_instagram_post_insights,
    get_instagram_post_comments,
    get_sentiment_score,
    get_instagram_conversations,
    get_instagram_conversation_messages,
    reply_to_instagram_conversation,
)

urlpatterns = [
    # Post Generation APIs
    path('generate_caption/', generate_caption, name='generate_caption'),
    path('generate_image/', generate_image, name='generate_image'),
    path('generate_post/', generate_post, name='generate_post'),
    path('publish_post/', publish_post, name='publish_post'),
    
    # Post Management APIs
    path('post/<str:short_code>/', get_post, name='get_post'),
    
    # Instagram Profile & Posts APIs
    path('instagram/profile/', fetch_user_instagram_profile, name='fetch_instagram_profile'),
    path('instagram/posts/', get_all_instagram_posts, name='get_all_instagram_posts'),
    path('instagram/post/<str:media_id>/', get_post_details, name='get_post_details'),
    
    # Instagram Insights APIs
    path('instagram/insights/', get_instagram_insights, name='get_instagram_insights'),
    path('instagram/post/<str:media_id>/insights/', get_instagram_post_insights, name='get_instagram_post_insights'),
    
    # Instagram Comments APIs
    path('instagram/post/<str:media_id>/comments/', get_instagram_post_comments, name='get_instagram_post_comments'),

    # Instagram Conversations APIs
    path('instagram/conversations/', get_instagram_conversations, name='get_instagram_conversations'),
    path('instagram/conversations/<str:conversation_id>/messages/', get_instagram_conversation_messages, name='get_instagram_conversation_messages'),
    path('instagram/conversations/<str:conversation_id>/reply/', reply_to_instagram_conversation, name='reply_to_instagram_conversation'),

    # Sentiment Analysis API
    path('sentiment_analysis/', get_sentiment_score, name='get_sentiment_score'),

    
]

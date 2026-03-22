from celery import shared_task
from server.utils.instagram_api import create_and_publish_post
from server.utils.logger import logger




@shared_task
def schedule_post(image_url: str, caption: str, access_token: str, business_account_id: str, post_id):
    permalink, media_id = create_and_publish_post(image_url, caption, access_token, business_account_id)
    if permalink:
        try:
            from .models import InstagramPost
            post = InstagramPost.objects.get(id=post_id)
            post.is_posted = True
            post.short_code = permalink.split("/")[-2]
            post.post_id = media_id
            post.save()
        except InstagramPost.DoesNotExist:
            logger.error(f"InstagramPost with id {post_id} does not exist.")
            pass
    
    
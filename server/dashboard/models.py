from django.utils import timezone
from django.db import models
from account.models import IGBusinessAccount
from dashboard.tasks import schedule_post
from server.utils.instagram_api import create_and_publish_post
from server.utils.logger import logger
import threading
import time

def delayed_publish(absolute_url, caption, access_token, business_account_id, post_id, scheduled_time):
    wait_time = (scheduled_time - timezone.now()).total_seconds()
    if wait_time > 0:
        time.sleep(wait_time)
    
    # Call the task synchronously
    schedule_post(absolute_url, caption, access_token, business_account_id, post_id)



# Create your models here.
class PostImage(models.Model):
    image = models.ImageField(upload_to='post_images/')
    image_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.image:
            return f"Image: {self.image.url[:30]}..."
        return f"Image URL: {self.image_url[:30]}..."


class InstagramPost(models.Model):
    business_account = models.ForeignKey(IGBusinessAccount, on_delete=models.CASCADE)
    post_id = models.CharField(max_length=100, blank=True, null=True)
    caption = models.TextField()
    media = models.ForeignKey(PostImage, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_posted = models.BooleanField(default=False)
    scheduled_time = models.DateTimeField(null=True, blank=True)
    short_code = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"Post {self.business_account.name} - {self.caption[:30]}..."

    def publish_to_instagram(self, request):
        if self.media and not self.is_posted:
            if self.media.image:
                absolute_url = request.build_absolute_uri(self.media.image.url)
            else:
                absolute_url = self.media.image_url

            if self.scheduled_time and self.scheduled_time > timezone.now():
                thread = threading.Thread(
                    target=delayed_publish,
                    args=(
                        absolute_url, 
                        self.caption, 
                        self.business_account.access_token.access_token, 
                        self.business_account.business_account_id, 
                        self.id, 
                        self.scheduled_time
                    )
                )
                thread.daemon = True
                thread.start()
                
                logger.info(f"Post {self.id} scheduled locally to post at {self.scheduled_time}")
                print(f"Post {self.id} scheduled locally via daemon thread.")
                return -1, -1  # Indicate that the post is scheduled but not yet published
            else:
                post_link, media_id = create_and_publish_post(
                    image_url=absolute_url,
                    caption=self.caption,
                    access_token=self.business_account.access_token.access_token,
                    business_account_id=self.business_account.business_account_id,
                )

                if post_link:
                    self.is_posted = True
                    self.short_code = post_link.split("/")[-2]
                    self.post_id = media_id
                    self.save()   
                return post_link, media_id
        return False, False
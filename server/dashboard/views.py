import pytz
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated


from account.models import IGBusinessAccount
from .models import PostImage, InstagramPost 
from server.utils.logger import logger
from server.utils.llm_api_calls import expand_prompt, generate_image as generate_image_ai, generate_caption as generate_caption_ai
from server.utils.sentiment_model import predict_sentiment as analyze_sentiment
import server.utils.instagram_api as insta_api


from io import BytesIO
from datetime import datetime
from django.core.files.base import ContentFile


@api_view(['POST'])
def get_sentiment_score(request) -> Response:
    """API to get sentiment score for a given text."""
    try:
        text = request.data.get('text', '')
        if not text:
            return Response({"error": "Text is required."}, status=400)
        
        score = analyze_sentiment(text)
        return Response({"sentiment_score": score})
    except Exception as e:
        logger.error(f"Error analyzing sentiment: {str(e)}")
        return Response({"error": str(e)}, status=500)


def generate_post_assets(user_short_prompt: str):
    print("Expanding prompt...")
    expanded_prompt = expand_prompt(user_short_prompt)
    print("Expanded Prompt:", expanded_prompt)

    print("\nGenerating image...")
    image = generate_image_ai(expanded_prompt)
    print("Image generated.")

    print("\nGenerating caption...")
    caption = generate_caption_ai(expanded_prompt)
    print("Caption generated:", caption)

    return expanded_prompt, caption, image


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def fetch_user_instagram_profile(request) -> Response:
    """Fetch the Instagram Business Account profile details for the authenticated user."""
    try:
        custom_user = request.user.customuser
        business_account = IGBusinessAccount.objects.get(custom_user=custom_user)
        access_token = business_account.access_token.access_token

        profile_data = insta_api.fetch_business_account(access_token)

        return Response({"profile": profile_data}, status=200)
    
    except IGBusinessAccount.DoesNotExist:
        return Response({"error": "Instagram Business Account not found."}, status=404)
    
    except Exception as e:
        logger.error(f"Error fetching Instagram profile: {str(e)}")
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_caption(request) -> Response:
    """Generate a caption using LLM based on the short prompt."""
    try:
        short_prompt = request.data.get('short_prompt', '')
        expanded_prompt = request.data.get('expanded_prompt', None)

        caption = generate_caption_ai(expanded_prompt, old_caption=short_prompt)

        return Response({"caption": caption})
    except Exception as e:
        logger.error(f"Error generating caption: {str(e)}")
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_image(request) -> Response:
    """Generate an image using LLM based on the expanded prompt."""
    try:
        short_prompt = request.data.get('prompt', '')
        if not short_prompt:
            return Response({"error": "Prompt is required."}, status=400)
        
        expanded_prompt = expand_prompt(short_prompt)
        image = generate_image_ai(expanded_prompt)

        # Save image to PostImage model
        post_image = PostImage.objects.create(image=image)

        return Response({"image_url": post_image.image.url})
    except Exception as e:
        logger.error(f"Error generating image: {str(e)}")
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_post(request) -> Response:
    try:
        data = request.data

        prompt = data.get('prompt', '')
        expanded_prompt, caption, image = generate_post_assets(prompt)

        # Convert PIL Image to Django-compatible file
        img_io = BytesIO()
        image.save(img_io, format='WEBP', quality=85)  # or 'PNG', 'JPEG'
        img_io.seek(0)
        
        image_file = ContentFile(img_io.getvalue(), name=f'generated_{prompt[:30]}.webp')
        

        image = PostImage.objects.create(
            image=image_file,
        )

        logger.info(f"Generated post for user account {request.user.username}")
        return Response({
            'expanded_prompt': expanded_prompt,
            'caption': caption,
            'image_url': image.image.url,
        }, status=201)
    except Exception as e:
        logger.error(f"Error generating post: {str(e)}")
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([IsAuthenticated])
def publish_post(request):
    try:
        caption = request.data.get('caption', None)
        image_url = request.data.get('image_url', None)   
        image = request.FILES.get('image', None)
        scheduled_time = request.data.get('scheduled_time', None) # ISO format string, e.g. "2024-12-31T23:59:00Z"
        scheduled_time = datetime.fromisoformat(scheduled_time) if scheduled_time else None
        print("Before converting to UTC:", scheduled_time)
        #convert from local to utc
        if scheduled_time:
            scheduled_time = scheduled_time.astimezone(pytz.UTC)
        print("After converting to UTC:", scheduled_time)

        if image:
            post_image = PostImage.objects.create(image=image)
        elif image_url:
            post_image = PostImage.objects.create(image_url=image_url)
        else:
            return Response({'error': 'Image file or URL is required'}, status=400)
        
        business_account = IGBusinessAccount.objects.get(custom_user=request.user.customuser)
        post = InstagramPost.objects.create(
            business_account=business_account,
            caption=caption,
            media=post_image,
            scheduled_time=scheduled_time
        )
        post_link, media_id = post.publish_to_instagram(request=request)

        if post_link == -1:
            return Response({'message': 'Post scheduled successfully', 'scheduled_time': scheduled_time}, status=200)

        return Response({'message': 'Post published successfully', 'post_link': post_link, 'media_id': media_id}, status=200)

    except InstagramPost.DoesNotExist:
        return Response({'error': 'Post not found'}, status=404)

    except Exception as e:
        logger.error(f"Error publishing post: {e}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_post(request, short_code):
    """
    Use this to fetch instagram post created by our system.
    """
    try:
        post = InstagramPost.objects.get(short_code=short_code)
        
        if post.business_account != request.user.ig_business_account:
            return Response({'error': 'Unauthorized access'}, status=403)
        response_data = {
            'business_account': post.business_account.name,
            'caption': post.caption,
            'media_url': post.media.image.url if post.media else None,
            'created_at': post.created_at,
            'is_posted': post.is_posted,
            'post_id': post.id,
            'short_code': post.short_code,
        }
        return Response(response_data, status=200)
    except InstagramPost.DoesNotExist:
        return Response({'error': 'Post not found'}, status=404)

    except Exception as e:
        logger.error(f"Error fetching post {short_code}: {e}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_instagram_posts(request):
    """
    Use this to fetch all instagram posts of a user.
    """
    try:
        custom_user = request.user.customuser
        print(custom_user)
        business_account = IGBusinessAccount.objects.get(custom_user=custom_user)
        business_account_id = business_account.business_account_id
        access_token = business_account.access_token.access_token

        posts = insta_api.fetch_all_posts(business_account_id, access_token)
        return Response({'posts': posts}, status=200)
    
    except IGBusinessAccount.DoesNotExist:
        return Response({'error': 'Instagram Business Account not found'}, status=404)
    
    except Exception as e:
        logger.error(f"Error fetching Instagram posts: {e}")
        return Response({'error': str(e)}, status=500)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_post_details(request, media_id):
    try:
        custom_user = request.user.customuser
        business_account = IGBusinessAccount.objects.get(custom_user=custom_user)
        access_token = business_account.access_token.access_token

        post_details = insta_api.fetch_post_details(media_id, access_token)
        return Response({'post_details': post_details}, status=200)
    
    except IGBusinessAccount.DoesNotExist:
        return Response({'error': 'Instagram Business Account not found'}, status=404)
    
    except Exception as e:
        logger.error(f"Error fetching Instagram post details: {e}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_instagram_insights(request):
    try:
        custom_user = request.user.customuser
        business_account = IGBusinessAccount.objects.get(custom_user=custom_user)
        business_account_id = business_account.business_account_id
        access_token = business_account.access_token.access_token
        period = request.query_params.get('period', 'day')
        since = request.query_params.get('since', None)
        until = request.query_params.get('until', None)

        insights = insta_api.get_all_instagram_user_insights(business_account_id, access_token, since, until, period)
        return Response({'insights': insights}, status=200)
    
    except IGBusinessAccount.DoesNotExist:
        return Response({'error': 'Instagram Business Account not found'}, status=404)
    
    except Exception as e:
        logger.error(f"Error fetching Instagram insights: {e}")
        return Response({'error': str(e)}, status=500)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_instagram_post_insights(request, media_id):
    try:
        custom_user = request.user.customuser
        business_account = IGBusinessAccount.objects.get(custom_user=custom_user)
        access_token = business_account.access_token.access_token

        insights = insta_api.fetch_post_insights(media_id, access_token)
        return Response({'insights': insights}, status=200)
    
    except IGBusinessAccount.DoesNotExist:
        return Response({'error': 'Instagram Business Account not found'}, status=404)
    
    except Exception as e:
        logger.error(f"Error fetching Instagram post insights: {e}")
        return Response({'error': str(e)}, status=500)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_instagram_post_comments(request, media_id):
    try:
        custom_user = request.user.customuser
        business_account = IGBusinessAccount.objects.get(custom_user=custom_user)
        access_token = business_account.access_token.access_token

        comments = insta_api.fetch_comments(media_id, access_token)
        return Response({'comments': comments}, status=200)
    
    except IGBusinessAccount.DoesNotExist:
        return Response({'error': 'Instagram Business Account not found'}, status=404)
    
    except Exception as e:
        logger.error(f"Error fetching Instagram post comments: {e}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_instagram_conversations(request):
    """
    Fetch a paginated list of conversations for the authenticated user's
    Instagram business account.
    """
    try:
        custom_user = request.user.customuser
        business_account = IGBusinessAccount.objects.get(custom_user=custom_user)

        business_account_id = business_account.business_account_id
        access_token = business_account.access_token.access_token

        if not business_account_id:
            return Response({'error': 'Instagram Business Account ID not found'}, status=400)

        try:
            limit = int(request.query_params.get('limit', 50))
        except (TypeError, ValueError):
            limit = 50

        paginated = str(request.query_params.get('paginated', 'false')).lower() == 'true'

        if paginated:
            after = request.query_params.get('after')
            data = insta_api.fetch_conversations(
                business_account_id=business_account_id,
                access_token=access_token,
                limit=limit,
                after=after,
            )

            if data is None:
                return Response({'error': 'Failed to fetch conversations from Instagram API'}, status=502)

            conversations = data.get('data', [])
            paging = data.get('paging', {})

            return Response(
                {
                    'conversations': conversations,
                    'paging': {
                        'cursors': paging.get('cursors', {}),
                        'next': paging.get('next'),
                    },
                },
                status=200,
            )

        all_conversations = []
        after_cursor = None
        # Safety cap to avoid infinite loop on malformed pagination responses.
        max_pages = 100

        for _ in range(max_pages):
            data = insta_api.fetch_conversations(
                business_account_id=business_account_id,
                access_token=access_token,
                limit=limit,
                after=after_cursor,
            )

            if data is None:
                return Response({'error': 'Failed to fetch conversations from Instagram API'}, status=502)

            all_conversations.extend(data.get('data', []))
            paging = data.get('paging', {})
            after_cursor = (paging.get('cursors') or {}).get('after')

            if not paging.get('next') or not after_cursor:
                break

        return Response(
            {
                'conversations': all_conversations,
                'count': len(all_conversations),
                'paging': None,
            },
            status=200,
        )

    except IGBusinessAccount.DoesNotExist:
        return Response({'error': 'Instagram Business Account not found'}, status=404)

    except Exception as e:
        logger.error(f"Error fetching Instagram conversations: {e}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_instagram_conversation_messages(request, conversation_id):
    """
    Fetch a paginated list of messages for a specific conversation.
    """
    try:
        custom_user = request.user.customuser
        business_account = IGBusinessAccount.objects.get(custom_user=custom_user)

        business_account_id = business_account.business_account_id
        access_token = business_account.access_token.access_token

        if not business_account_id:
            return Response({'error': 'Instagram Business Account ID not found'}, status=400)

        try:
            limit = int(request.query_params.get('limit', 20))
        except (TypeError, ValueError):
            limit = 20

        before = request.query_params.get('before')
        after = request.query_params.get('after')

        data = insta_api.fetch_conversation_messages(
            conversation_id=conversation_id,
            access_token=access_token,
            limit=limit,
            before=before,
            after=after,
        )

        if data is None:
            return Response({'error': 'Failed to fetch conversation messages from Instagram API'}, status=502)

        raw_messages = data.get('data', [])
        normalized_messages = []

        for message in raw_messages:
            from_user = message.get('from', {}) or {}
            to_data = (message.get('to', {}) or {}).get('data', [])

            direction = 'incoming'
            if str(from_user.get('id')) == str(business_account_id):
                direction = 'outgoing'

            normalized_messages.append(
                {
                    'id': message.get('id'),
                    'text': message.get('message', ''),
                    'created_time': message.get('created_time'),
                    'direction': direction,
                    'from': {
                        'id': from_user.get('id'),
                        'username': from_user.get('username'),
                    },
                    'to': to_data,
                }
            )

        paging = data.get('paging', {})

        return Response(
            {
                'conversation_id': conversation_id,
                'messages': normalized_messages,
                'paging': {
                    'cursors': paging.get('cursors', {}),
                    'next': paging.get('next'),
                    'previous': paging.get('previous'),
                },
            },
            status=200,
        )

    except IGBusinessAccount.DoesNotExist:
        return Response({'error': 'Instagram Business Account not found'}, status=404)

    except Exception as e:
        logger.error(f"Error fetching Instagram conversation messages: {e}")
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reply_to_instagram_conversation(request, conversation_id):
    """
    Send a reply message to a specific conversation.
    """
    try:
        text = request.data.get('message', '')
        if not text or not str(text).strip():
            return Response({'error': 'message is required'}, status=400)

        custom_user = request.user.customuser
        business_account = IGBusinessAccount.objects.get(custom_user=custom_user)

        business_account_id = business_account.business_account_id
        access_token = business_account.access_token.access_token

        if not business_account_id:
            return Response({'error': 'Instagram Business Account ID not found'}, status=400)

        conversation_data = insta_api.fetch_conversation_participants(
            conversation_id=conversation_id,
            access_token=access_token,
        )
        me = insta_api.fetch_business_account(access_token)



        if conversation_data is None:
            return Response({'error': 'Failed to fetch conversation participants'}, status=502)

        participants = (conversation_data.get('participants') or {}).get('data', [])
        recipient = None
        for participant in participants:
            if str(participant.get('username')) != str(me.get('username')):
                recipient = participant
                break

        if not recipient:
            return Response({'error': 'Unable to determine conversation recipient'}, status=400)

        is_sent = insta_api.reply_to_message(
            recipient_id=recipient.get('id'),
            message=str(text).strip(),
            access_token=access_token,
            business_account_id=business_account_id,
        )

        if not is_sent:
            return Response({'error': 'Failed to send reply message'}, status=502)

        return Response(
            {
                'success': True,
                'conversation_id': conversation_id,
                'recipient_id': recipient.get('id'),
                'message': str(text).strip(),
            },
            status=200,
        )

    except IGBusinessAccount.DoesNotExist:
        return Response({'error': 'Instagram Business Account not found'}, status=404)

    except Exception as e:
        logger.error(f"Error replying to Instagram conversation: {e}")
        return Response({'error': str(e)}, status=500)
    


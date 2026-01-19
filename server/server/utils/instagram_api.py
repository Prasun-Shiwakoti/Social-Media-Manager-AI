import os
from .logger import logger
import requests


def fetch_business_account_id(access_token: str):
    url = 'https://graph.instagram.com/me'
    params = {
        'fields': 'id,username',
        'access_token': access_token
    }

    response = requests.get(url, params=params)

    if response.status_code == 200:
        data = response.json()
        account_id = data.get('id')
        return account_id
    else:
        logger.error(f'Error fetching account ID: {response.status_code} - {response.text}')
        return None


def generate_creation_object(image_url: str, caption: str, access_token: str, business_account_id: str):
    url = f'https://graph.instagram.com/v23.0/{business_account_id}/media'
    payload = {
        'image_url': image_url,
        'caption': caption,
        'access_token': access_token
    }

    response = requests.post(url, data=payload)

    if response.status_code == 200:
        data = response.json()
        creation_id = data.get('id')
        return creation_id
    else:
        logger.error(f'Error generating creation object: {response.status_code} - {response.text}')
        return None 


def publish_creation(creation_id: str, access_token: str, business_account_id: str):
    publish_url = f'https://graph.instagram.com/v23.0/{business_account_id}/media_publish'
    publish_payload = {
        'creation_id': creation_id,
        'access_token': access_token
    }

    publish_response = requests.post(publish_url, data=publish_payload)

    if publish_response.status_code == 200:
        logger.info('Media published successfully!')
        publish_data = publish_response.json()
        media_id = publish_data.get('id')
        return media_id
    else:
        logger.error(f'Error publishing media: {publish_response.status_code} - {publish_response.text}')
        return None


def get_post_permalink(media_id: str, access_token: str):
    media_url = f'https://graph.instagram.com/v23.0/{media_id}?fields=permalink&access_token={access_token}'
    media_response = requests.get(media_url)
    if media_response.status_code == 200:
        media_data = media_response.json()
        return media_data.get('permalink')
    else:
        logger.error(f'Error fetching post permalink: {media_response.status_code} - {media_response.text}')
        return None


def create_and_publish_post(image_url: str, caption: str, access_token: str, business_account_id: str):
    creation_id = generate_creation_object(image_url, caption, access_token, business_account_id)
    if creation_id:
        media_id = publish_creation(creation_id, access_token, business_account_id)
        if media_id:
            permalink = get_post_permalink(media_id, access_token)
            if permalink:
                logger.info(f'Post published successfully! View it at: {permalink}')
                return permalink, media_id
    return None


def fetch_long_lived_token(code: str) -> str:
    short_lived_token_url = 'https://api.instagram.com/oauth/access_token'
    long_lived_token_url = 'https://graph.instagram.com/access_token'

    client_id = os.getenv('INSTAGRAM_CLIENT_ID')
    client_secret = os.getenv('INSTAGRAM_CLIENT_SECRET')
    redirect_uri = os.getenv('INSTAGRAM_REDIRECT_URI')

    payload = {
        'client_id': client_id,
        'client_secret': client_secret,
        'grant_type': 'authorization_code',
        'redirect_uri': redirect_uri,
        'code': code
    }

    response = requests.post(short_lived_token_url, data=payload)

    if not response.status_code == 200:
        logger.error(f'Error fetching short-lived token: {response.status_code} - {response.text}')
        return None


    data = response.json()
    short_lived_token = data.get('access_token')

    long_lived_payload = {
        'grant_type': 'ig_exchange',
        'client_secret': client_secret,
        'access_token': short_lived_token
    }

    response = requests.post(long_lived_token_url, data=long_lived_payload)

    if response.status_code == 200:
        data = response.json()
        return data.get('access_token')
    else:
        logger.error(f'Error fetching long-lived token: {response.status_code} - {response.text}')
        return None


def fetch_all_posts(business_account_id: str, access_token: str):
    url = f'https://graph.instagram.com/v23.0/{business_account_id}/media'
    params = {
        'fields': 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp',
        'access_token': access_token
    }

    response = requests.get(url, params=params)

    if response.status_code == 200:
        data = response.json()
        posts = data.get('data', [])
        return posts
    else:
        logger.error(f'Error fetching posts: {response.status_code} - {response.text}')
        return None


def fetch_post_details(media_id: str, access_token: str):
    url = f'https://graph.instagram.com/v23.0/{media_id}'
    params = {
        'fields': 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp',
        'access_token': access_token
    }

    response = requests.get(url, params=params)

    if response.status_code == 200:
        data = response.json()
        return data
    else:
        logger.error(f'Error fetching post details: {response.status_code} - {response.text}')
        return None


def fetch_comments(media_id: str, access_token: str):
    url = f'https://graph.instagram.com/v23.0/{media_id}/comments'
    params = {
        'fields': 'id,text,username,timestamp',
        'access_token': access_token
    }

    response = requests.get(url, params=params)

    if response.status_code == 200:
        data = response.json()
        comments = data.get('data', [])
        return comments
    else:
        logger.error(f'Error fetching comments: {response.status_code} - {response.text}')
        return None
    

def fetch_post_insights(media_id: str, access_token: str, api_version: str = "v23.0"):
    url = f'https://graph.instagram.com/{api_version}/{media_id}/insights'

    params = {
        'metric': ','.join([
            'reach',
            'follower_count',
            'website_clicks',
            'profile_views',
            'online_followers',
            'accounts_engaged',
            'total_interactions',
            'likes',
            'comments',
            'shares',
            'saves',
            'replies',
            'engaged_audience_demographics',
            'reached_audience_demographics',
            'follower_demographics',
            'follows_and_unfollows',
            'profile_links_taps',
            'views',
            'threads_likes',
            'threads_replies',
            'reposts',
            'quotes',
            'threads_followers',
            'threads_follower_demographics',
            'content_views',
            'threads_views',
            'threads_clicks',
            'threads_reposts',
    ]),
    'access_token': access_token
}
    
    response = requests.get(url, params=params)

    if response.status_code == 200:
        data = response.json().get('data', [])

        result = {entry.get('name'): entry.get('values') or entry.get('value') for entry in data}
        return result
    else:
        logger.error(f'Error fetching post insights: {response.status_code} - {response.text}')
        return None


def fetch_account_and_audience_insights(user_id: str, access_token: str, api_version: str = "v23.0", duration='lifetime'):
    base_url = f'https://graph.instagram.com/{api_version}/{user_id}/insights'


    params_account = {
        'metric': ','.join([
            'reach',
            'follower_count',
            'website_clicks',
            'profile_views',
            'online_followers',
            'accounts_engaged',
            'total_interactions',
            'likes',
            'comments',
            'shares',
            'saves',
            'replies',
            'engaged_audience_demographics',
            'reached_audience_demographics',
            'follower_demographics',
            'follows_and_unfollows',
            'profile_links_taps',
            'views',
            'threads_likes',
            'threads_replies',
            'reposts',
            'quotes',
            'threads_followers',
            'threads_follower_demographics',
            'content_views',
            'threads_views',
            'threads_clicks',
            'threads_reposts',
        ]),

        'period': duration,  
        'access_token': access_token
    }

    resp_account = requests.get(base_url, params=params_account)

    print(resp_account.text)
    if resp_account.status_code != 200:
        logger.error(f'Error fetching account insights: {resp_account.status_code} - {resp_account.text}')
        account_metrics = None
    else:
        data_acc = resp_account.json().get('data', [])
        account_metrics = {e.get('name'): e.get('values') or e.get('value') for e in data_acc}

    
    params_demo = {
        'metric': ','.join([
            'follower_demographics',
            'reached_audience_demographics',
            'engaged_audience_demographics',
        ]),
        'metric_type': 'total_value',
        'access_token': access_token,
        'period': duration
    }

    resp_demo = requests.get(base_url, params=params_demo)
    print(resp_demo.text)
    if resp_demo.status_code != 200:
        demographics = None
        logger.warning(f'Could not fetch demographics: {resp_demo.status_code} - {resp_demo.text}')
    else:
        data_demo = resp_demo.json().get('data', [])
        demographics = {e.get('name'): e.get('values') or e.get('value') for e in data_demo}

    return {
        'account_metrics': account_metrics,
        'demographics': demographics
    }


def reply_to_message(recipient_id: str, message: str, access_token: str, business_account_id: str):
    url = f'https://graph.instagram.com/v23.0/{business_account_id}/messages'
    payload = {
        'recipient': {'id': recipient_id},
        'message': {'text': message},
        'access_token': access_token
    }
    resp = requests.post(url, json=payload)
    if resp.status_code == 200:
        logger.info(f"Replied to {recipient_id} with message: {message}")
    else:
        logger.error(f"Error replying to message: {resp.status_code} - {resp.text}")


def fetch_profile_info(business_account_id: str, access_token: str):
    url = f'https://graph.instagram.com/v23.0/{business_account_id}'
    params = {
        'fields': 'id,username,account_type,media_count',
        'access_token': access_token
    }

    response = requests.get(url, params=params)

    if response.status_code == 200:
        data = response.json()
        return data
    else:
        logger.error(f'Error fetching profile info: {response.status_code} - {response.text}')
        return None
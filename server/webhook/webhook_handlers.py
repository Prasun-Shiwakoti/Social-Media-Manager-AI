from django.conf import settings

from server.utils.logger import logger

from server.utils.instagram_api import fetch_others_accounts, reply_to_message
from account.models import IGBusinessAccount
from server.utils.rag_pipeline import rag_pipeline

COMMON_API_TOKEN = settings.COMMON_IG_ACCESS_TOKEN

def handle_message_webhook(payload):
    try:
        
        sender = payload['entry'][0]['messaging'][0]['sender']['id']
        recepient = payload['entry'][0]['messaging'][0]['recipient']['id']
        message = payload['entry'][0]['messaging'][0]['message']['text']
        timestamp = payload['entry'][0]['messaging'][0]['timestamp']
        is_echo = payload['entry'][0]['messaging'][0]['message'].get('is_echo', False)

        if not is_echo:
            sender_username = fetch_others_accounts(COMMON_API_TOKEN, sender).get('username', '')
            recepient_data = fetch_others_accounts(COMMON_API_TOKEN, recepient)
            
            recepient_username = recepient_data.get('username', '')
            receipient_id = recepient_data.get('id', '')

            logger.info(f"Received message from {sender_username} to {recepient_username}: {message}")

            recepient_account = IGBusinessAccount.objects.filter(business_account_id=receipient_id).first()

            if recepient_account and recepient_account.auto_reply_enabled:
                
                recepient_access_token = recepient_account.access_token.access_token
                reply_message = f"Hello {sender_username}! This is an automated reply from {recepient_account.name}. We have received your message and will get back to you shortly."

                print(f"\nGenerating reply for message: {message} from sender: {sender_username} to recepient: {recepient_username}")
                reply_message = rag_pipeline.answer(
                    query=message,
                    business_id=recepient_account.business_account_id
                )
                print(f"Generated reply: {reply_message}")
                success = reply_to_message(
                    recipient_id=sender,  # Replying to the sender
                    message=reply_message,
                    access_token=recepient_access_token,
                    business_account_id=recepient_account.business_account_id
                )
                if not success:
                    logger.error(f"Failed to send auto-reply to {sender_username} for message: {message}")
                    return False


                logger.info(f"Successfully replied to message from {sender_username} to {recepient_username} for message: {message}")
            return True
    
    except Exception as e:
        logger.error(f"Error handling message webhook: {str(e)}")
        return False
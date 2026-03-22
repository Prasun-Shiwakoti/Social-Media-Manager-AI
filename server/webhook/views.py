import json

from django.shortcuts import render
from django.http import HttpResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt

from server.utils.logger import logger
from .webhook_handlers import (
    handle_message_webhook
)

@csrf_exempt
# Create your views here.
def receive_webhook(request):
    # Logic to verify webhook goes here
    if request.method == 'GET':
        hub_mode = request.GET.get('hub.mode') 
        hub_challenge = request.GET.get('hub.challenge')
        hub_verify_token = request.GET.get('hub.verify_token')

        if hub_mode == 'subscribe' and hub_verify_token == settings.WEBHOOK_VERIFY_TOKEN:
            return HttpResponse(hub_challenge)  
    elif request.method == 'POST':
        payload = json.loads(request.body.decode('utf-8'))
        webhook_entry = payload.get('entry', [{}])[0]
        webhook_type = None

        if 'messaging' in webhook_entry:
            webhook_type = 'messages'

        logger.info(f"Received webhook of type: {webhook_type} with payload: {payload}")
        print(f"\nReceived webhook of type: {webhook_type} with payload: {payload}")
        match webhook_type:
            case 'messages':
                handle_message_webhook.delay(payload)
                
            case _:
                logger.warning(f"Received unsupported webhook type: {webhook_type}")
        
        return HttpResponse(status=200)
    else:
        return HttpResponse(status=400)
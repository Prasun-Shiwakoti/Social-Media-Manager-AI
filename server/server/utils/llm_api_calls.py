import os
import io

from huggingface_hub import InferenceClient
from PIL import Image

from dotenv import load_dotenv
load_dotenv()


# -------------------------------------------------------------------
# 1. Setup clients
# -------------------------------------------------------------------
HF_KEY = os.getenv("HF_API_KEY")

# Initialize inference client (used for all API calls)
inference_client = InferenceClient(
    api_key=HF_KEY
)

# -------------------------------------------------------------------
# 2. Generate expanded prompt from user input
# -------------------------------------------------------------------
def expand_prompt(short_prompt: str, expanded_prompt=None):
    messages = [
        {
            "role": "system",
            "content": (
                "Expand short prompts into long, vivid, detailed visual descriptions "
                "for image generation. No stories, only one paragraph."
            )
        },
        {
            "role": "user",
            "content": f"Expand this: {short_prompt}"
        }
    ]

    if expanded_prompt:
        messages[-1]["content"] += f"\nHowever dont make it somewhat like this : {expanded_prompt}. \nI need a better version of this."


    

    response = inference_client.chat.completions.create(
        model="meta-llama/Llama-3.3-70B-Instruct",
        messages=messages,
        max_tokens=300,
        temperature=0.7
    )

    return response.choices[0].message["content"].strip()



# -------------------------------------------------------------------
# 3. Generate image from expanded prompt
# -------------------------------------------------------------------
def generate_image(expanded_prompt: str) -> Image.Image:

    client = InferenceClient(
        provider="together",
        api_key=HF_KEY,
    )

    img = client.text_to_image(
        prompt=expanded_prompt,
        model="black-forest-labs/FLUX.1-dev",
        num_inference_steps=30
    )
    return img


# -------------------------------------------------------------------
# 4. Generate Instagram caption
# -------------------------------------------------------------------
def generate_caption(expanded_prompt: str, old_caption=None) -> str:
    messages = [
        {
            "role": "system",
            "content": (
                "Write a short, engaging Instagram caption (1-2 sentences)."
            ),
        },
        {
            "role": "user",
            "content": f"Write a caption for this image description: {expanded_prompt}"
        }
    ]
    if old_caption:
        messages[-1]["content"] += f"\nHowever dont make it somewhat like this : {old_caption}. \nI need a better version of this."

    response = inference_client.chat.completions.create(
        model="meta-llama/Llama-3.3-70B-Instruct",
        messages=messages,
        max_tokens=120,
        temperature=0.8
    )

    return response.choices[0].message["content"].strip()



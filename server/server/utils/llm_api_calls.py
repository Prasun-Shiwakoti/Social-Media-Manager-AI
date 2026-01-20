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
            "content": "You are an expert prompt expander for AI image generation. Expand short or minimal user prompts into exactly one cohesive, richly detailed paragraph optimized for high-quality image synthesis. Describe only visual elements: subject, environment, lighting, colors, textures, composition, perspective, atmosphere, and artistic style. The image must include relevant, graphically aesthetic text as part of the visual composition. If the user provides text, incorporate it verbatim into the image; if not, generate short, context-appropriate text suitable for visual display. Specify the text's placement, typography style, size, color, and integration with the scene. Do not write stories, narratives, dialogue, explanations, or metadata. Output only the final paragraph, suitable for generating a visually striking Instagram image."
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



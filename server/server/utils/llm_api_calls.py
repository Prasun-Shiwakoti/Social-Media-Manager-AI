import os

from huggingface_hub import InferenceClient
from PIL import Image
from bytez import Bytez

import base64
from io import BytesIO

from dotenv import load_dotenv
load_dotenv()


# -------------------------------------------------------------------
# 1. Setup clients
# -------------------------------------------------------------------
HF_KEY = os.getenv("HF_API_KEY")
BYTEZ_API_KEY = os.getenv("BYTEZ_API_KEY")
print("HF_KEY:", HF_KEY)  # Debugging line to check if the key is loaded correctly
print("BYTEZ_API_KEY:", BYTEZ_API_KEY)  # Debugging line to check if the key is loaded correctly
# Initialize inference client (used for all API calls)
HF_inference_client = InferenceClient(
    api_key=HF_KEY,
)
Bytez_sdk = Bytez(BYTEZ_API_KEY)

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

    # response = HF_inference_client.chat.completions.create(
    #     model="meta-llama/Llama-3.3-70B-Instruct",
    #     messages=messages,
    #     max_tokens=300,
    #     temperature=0.7
    # )

    model = Bytez_sdk.model("openai/gpt-5.3-chat-latest")
    results = model.run(messages)


    return results.output['content'].strip()



# -------------------------------------------------------------------
# 3. Generate image from expanded prompt
# -------------------------------------------------------------------
def generate_image(expanded_prompt: str) -> Image.Image:

    # choose imagen-4.0-ultra-generate-001
    model = Bytez_sdk.model("google/imagen-4.0-ultra-generate-001")

    # send input to model
    results = model.run(expanded_prompt)

    base64_img = results.provider['generatedImages'][0]['image']['imageBytes']
    image_data = base64.b64decode(base64_img)
    image = Image.open(BytesIO(image_data))

    return image


# -------------------------------------------------------------------
# 4. Generate Instagram caption
# -------------------------------------------------------------------
def generate_caption(expanded_prompt: str, short_prompt: str, old_caption=None) -> str:
    messages = [
        {
            "role": "system",
            "content": (
                "Write a short, engaging Instagram caption (1-2 sentences). You will be provided with a short user prompt, and an expanded image description based on that prompt. Use the expanded image description and the user prompt to craft a caption that complements the visual content and meets user's requriements. The caption should be catchy, relevant to the image, and encourage engagement (likes, comments). Avoid using hashtags or emojis. Focus on making the caption informative and intriguing to entice viewers to interact with the post."
            ),
        },
        {
            "role": "user",
            "content": f"Write a caption for this user's prompt: {short_prompt} and its image description: {expanded_prompt}"
        }
    ]
    if old_caption:
        messages[-1]["content"] += f"\nHowever dont make it somewhat like this : {old_caption}. \nI need a better version of this."

    # response = HF_inference_client.chat.completions.create(
    #     model="meta-llama/Llama-3.3-70B-Instruct",
    #     messages=messages,
    #     max_tokens=120,
    #     temperature=0.8
    # )

    model = Bytez_sdk.model("openai/gpt-5.3-chat-latest")
    results = model.run(messages)

    return results.output['content'].strip()




if __name__ == "__main__":
    # Example usage
    short_prompt = "A advertisement poster for a shoes sale, with the text '50% OFF' on sports shoes and '30% OFF' on formal shoes prominently displayed."

    # print("\n\nExpanding prompt...")
    expanded = expand_prompt(short_prompt)
    print("\n\nExpanded Prompt:", expanded)

    # img = generate_image(expanded)
    # img.show()

    # caption = generate_caption(expanded, short_prompt)
    # print("\n\nGenerated Caption:", caption)
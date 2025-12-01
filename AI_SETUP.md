# AI Image Generation Setup

This Brand Admin tool uses **Replicate API** with **FLUX.1 [schnell]** for fast, high-quality AI image generation.

## Setup Instructions

### 1. Get Your API Key

1. Go to [Replicate](https://replicate.com)
2. Sign up or log in
3. Navigate to [API Tokens](https://replicate.com/account/api-tokens)
4. Copy your API token

### 2. Add API Key to the Code

Open `script.js` and find this section near line 580:

```javascript
const AI_CONFIG = {
    apiKey: 'YOUR_REPLICATE_API_KEY_HERE', // Replace with your Replicate API key
    model: 'black-forest-labs/flux-schnell',
    endpoint: 'https://api.replicate.com/v1/predictions'
};
```

Replace `'YOUR_REPLICATE_API_KEY_HERE'` with your actual API key:

```javascript
const AI_CONFIG = {
    apiKey: 'r8_abc123...', // Your actual key
    model: 'black-forest-labs/flux-schnell',
    endpoint: 'https://api.replicate.com/v1/predictions'
};
```

### 3. Test It Out

1. Open `index.html` in your browser
2. Click the **"Gen AI"** tab
3. Enter a prompt like: `"coffee shop logo with a cup"`
4. Click send
5. Watch as 5 unique AI-generated images appear!

## How It Works

- **Model**: FLUX.1 [schnell] - Fast, high-quality image generation
- **Output**: 5 variations per prompt, 1:1 aspect ratio, PNG format
- **Prompt Enhancement**: Automatically adds "logo design, sticker style, clean background, professional branding" to your prompts
- **Cost**: ~$0.003 per image (very affordable)

## Pricing

Replicate charges per second of compute time:
- FLUX.1 [schnell]: ~$0.003 per image
- 5 images per generation: ~$0.015 per prompt

You can add credits to your account at [Replicate Billing](https://replicate.com/account/billing).

## Troubleshooting

If images aren't generating:

1. **Check Console**: Open browser DevTools (F12) and check the Console tab for errors
2. **Verify API Key**: Make sure you copied the entire key correctly
3. **Check Balance**: Ensure you have credits in your Replicate account
4. **CORS Issues**: If running locally, you may need to use a simple server (already set up with `python3 -m http.server`)

## Alternative APIs

If you prefer a different service, you can modify the code to use:

- **OpenAI DALL-E 3**: Higher quality, more expensive (~$0.04/image)
- **Stability AI**: Direct access to Stable Diffusion models
- **Hugging Face**: Free tier available, slower

Let me know if you need help switching to a different provider!

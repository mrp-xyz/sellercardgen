# Remove.bg API Setup Guide

## Step 1: Get Your API Key

1. Go to https://www.remove.bg/users/sign_up
2. Create a free account
3. Navigate to https://www.remove.bg/api#remove-background
4. Copy your API key from the dashboard

## Step 2: Add API Key to Config

1. Open `config.js` in this project
2. Replace `YOUR_REMOVE_BG_API_KEY_HERE` with your actual API key
3. Save the file

Example:
```javascript
const API_CONFIG = {
    removeBg: {
        apiKey: 'your-actual-api-key-here',
        endpoint: 'https://api.remove.bg/v1.0/removebg',
    }
};
```

## Step 3: Test the Integration

1. Open `index.html` in your browser
2. Navigate to "Logo processing" tab
3. Upload 1-8 logo images
4. Click "Continue" button
5. Watch as backgrounds are removed automatically!

## API Limits

### Free Tier
- 50 API calls per month
- Good for testing and prototyping

### Paid Plans
- Preview: 500 calls/month - $9/month
- Basic: 1,500 calls/month - $25/month
- Pro: 5,000 calls/month - $75/month
- See pricing: https://www.remove.bg/pricing

## How It Works

1. User uploads images (max 8)
2. Click "Continue" button
3. Each image is sent to remove.bg API
4. API removes background and returns PNG with transparency
5. Preview updates with processed images
6. User can download or continue with processed logos

## Important Notes

⚠️ **Security Warning**: This implementation exposes your API key in the browser. For production:
- Use a backend server to proxy API requests
- Store API key securely on the server
- Never commit API keys to version control

## Troubleshooting

### "Please add your remove.bg API key"
- Make sure you've replaced the placeholder in `config.js`
- Check that `config.js` is loaded before `script.js`

### "API request failed"
- Check your API key is valid
- Verify you haven't exceeded your monthly limit
- Check browser console for detailed error messages

### CORS Errors
- remove.bg API supports CORS for browser requests
- If you see CORS errors, try using a backend proxy instead

## API Documentation

Full API docs: https://www.remove.bg/api#api-reference


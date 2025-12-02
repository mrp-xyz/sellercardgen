# Brand Admin - Seller Card Generator

Automated seller card generator for Block's Cash App Neighborhoods ecosystem. Converts seller logos into clean, ready-to-use seller cards with intelligent background removal, color palette extraction, and WCAG-compliant contrast validation.

## Features

- **Automated Logo Processing**: Upload logos, get production-ready seller cards
- **Background Removal**: Powered by remove.bg API with smart cropping and centering
- **Intelligent Color Selection**: Extracts color palettes and validates contrast
- **WCAG AA Compliance**: Adaptive outline system ensures 3:1 contrast ratio
- **Quality Validation**: Multi-factor logo detection prevents photo uploads
- **Batch Processing**: Handle multiple logos simultaneously
- **Smart Defaults**: Automatically selects optimal background colors

## Quick Start

### Prerequisites
- Modern web browser (Chrome, Safari, or Firefox)
- remove.bg API key ([Get one free](https://remove.bg/api))

### Setup

1. **Clone this repository**
   ```bash
   git clone https://github.com/mrp-xyz/sellercardgen.git
   cd sellercardgen
   ```

2. **Configure API Key**
   
   ⚠️ **IMPORTANT**: Never commit your API key to git!
   
   - Copy the template file:
     ```bash
     cp config.template.js config.js
     ```
   - Open `config.js` in a text editor
   - Replace `'YOUR_REMOVE_BG_API_KEY_HERE'` with your actual API key
   - Get a free API key at: https://www.remove.bg/api
   
   ```javascript
   const API_CONFIG = {
       removeBg: {
           apiKey: 'your-actual-api-key-here',
           // ...
       }
   };
   ```

3. **Open in Browser**
   ```bash
   open index.html
   ```
   Or simply double-click `index.html` in Finder

### 🔒 Security Note

The `config.js` file is gitignored to protect your API key. Each developer needs to create their own `config.js` from the template.

### First Use

1. Enter your name when prompted (appears next to generated cards)
2. Click "Generate" tab
3. Upload logos (JPG or PNG, 150-2500px, under 5MB)
4. System automatically processes and generates seller cards
5. Choose from suggested background colors or customize

## Documentation

- **[Automation Logic](AUTOMATION_LOGIC.md)** - Detailed technical documentation of all processing steps
- **[Checkpoints](CHECKPOINT-16.md)** - Version history and feature updates
- **[API Setup](API_ENABLED.md)** - remove.bg API configuration guide
- **[Remove.bg Setup](REMOVE_BG_SETUP.md)** - API key setup instructions

## Project Structure

```
brand-admin/
├── index.html              # Main application
├── styles.css              # Arcade design system styles
├── script.js               # Core automation logic
├── config.js               # API configuration
├── fonts/                  # Cash Sans font family
├── check-credits.html      # API credit monitoring tool
├── clear-user-name.html    # Reset NUX for testing
└── AUTOMATION_LOGIC.md     # Engineering documentation
```

## Key Technologies

- **ColorThief.js** - Dominant color extraction
- **remove.bg API** - AI-powered background removal
- **Canvas API** - Logo validation and brightness analysis
- **localStorage** - Batch history persistence

## Automation Steps

1. **Logo Validation** - Quality gate with multi-factor scoring
2. **Color Extraction** - Extract 5-20 dominant colors from logo
3. **Background Detection** - Detect original background via edge sampling
4. **Background Removal** - remove.bg API with cropping/centering
5. **Brightness Analysis** - Calculate logo brightness for contrast
6. **Smart Default Selection** - Intelligent background color selection
7. **Contrast Validation** - Filter colors for WCAG AA compliance
8. **Adaptive Outline** - Dynamic outline based on luminance

## Browser Support

- Chrome (latest) ✅
- Safari (latest) ✅
- Firefox (latest) ✅

## API Credits

- Free tier: 50 credits/month
- 1 credit per logo processed
- Monitor usage via Settings tab

## Version

Current: **v1.0** (Checkpoint 16)
- Typography refinements
- Settings page alignment
- NUX polish
- Strict color contrast filtering

## Credits

Designed by @mpringle  
Built for Block's Cash App Neighborhoods


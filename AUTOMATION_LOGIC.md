# Automation Logic Documentation

## Overview
This document outlines the complete automation logic for the logo processing system, including all APIs, processing steps, intelligent algorithms, and validation criteria used in the Brand Admin tool.

---

## Step 0: Logo Validation (Pre-Processing Quality Gate)

### What happens
Before processing begins, each uploaded image is analyzed to determine if it's actually a logo or a photograph/complex illustration. This prevents wasting API credits on inappropriate files.

### Why this matters
- Protects API credits (remove.bg charges per image)
- Ensures quality results (system optimized for logos, not photos)
- Provides clear feedback to users about what works best

### Validation Criteria (Objective Measurements)

#### 1. **Color Complexity Analysis (INFORMATIONAL - NOT A HARD BLOCK)**
**Measurement**: Count unique colors (with palette reduction to 4-bit color depth)

**Important**: Color count alone does NOT reject a logo. Many legitimate logos have gradients, anti-aliasing, or shadows that increase color count. This is ONE signal among many.

- **Score -20 if > 100 unique colors**
  - Very high color complexity
  - Strong indicator of photo-like content
  - Combined with other signals, may reject

- **Score -10 if 50-100 colors**
  - High color count
  - Could be gradient logo or illustration
  - Allowed if other signals look good

- **Score -5 if 20-50 colors**
  - Moderate color count
  - Typical for logos with gradients/anti-aliasing
  - Generally acceptable
  
- **No penalty if < 20 colors**
  - Clean, simple color palette
  - Strong indicator of traditional logo

**Technical Implementation**:
```javascript
// Reduce 8-bit color (256 values) to 4-bit (16 values) per channel
// This is MORE forgiving for gradients/anti-aliasing than previous 5-bit
const reducedColor = Math.floor(pixelValue / 16);
// Count unique combinations using Set
```

**Why we changed this**: Previous version was too strict. Modern logos often use gradients, drop shadows, and anti-aliasing which create many intermediate colors. A flat rejection based on color count was rejecting valid logos.

#### 2. **Edge Density Analysis (Complexity Detection)**
**Measurement**: Sobel edge detection to measure detail complexity

Edge density is a STRONGER signal than color count, but still not used alone for rejection.

- **Score -30 if > 55% edge density**
  - Very high edge density = extremely detailed
  - Strong indicator of photograph
  - Combined with other signals, likely rejects

- **Score -15 if 40-55% edge density**
  - High edge density
  - May be detailed illustration or texture-heavy image
  - Warning signal

- **Score -5 if 25-40% edge density**
  - Moderate complexity
  - Could be complex logo with many elements
  - Generally acceptable
  
- **No penalty if < 25% edge density**
  - Clean, simple shapes
  - Typical logo characteristic

**Technical Implementation**:
```javascript
// Sobel operator calculates gradient magnitude
gx = surrounding pixels horizontal difference
gy = surrounding pixels vertical difference
magnitude = √(gx² + gy²)
edgeDensity = (pixels above threshold) / total pixels
```

**Why edge density matters more**: Unlike color count (which can be high due to gradients), edge density directly measures visual complexity. Logos should have clean, defined edges, not photographic detail.

#### 3. **File Size Efficiency**
**Measurement**: KB per 1000 pixels ratio

- **REJECT if > 5MB total**
  - Unnecessarily large for web logos
  - Likely high-resolution photograph

- **WARN if > 2MB**
  - Larger than typical logo needs
  - May indicate photo or unoptimized file

- **Efficiency Check**: File size (KB) ÷ (total pixels ÷ 1000)
  - Photos: typically > 0.5 KB/1000px (high compression needed)
  - Logos: typically < 0.3 KB/1000px (simple, compresses well)

#### 4. **File Format Check (STRICT REQUIREMENT)**
**Measurement**: File MIME type

- **REQUIRED**: JPG or PNG only
  - `image/jpeg` or `image/png` MIME types
  - Professional, web-compatible formats

- **REJECT ALL OTHERS**:
  - SVG (vector) - Not supported by remove.bg API
  - GIF - Animated/limited colors
  - WebP, HEIF - Modern but not universally supported
  - TIFF, BMP, PSD - Design files, not web-ready
  - Raw formats (CR2, NEF, etc.) - Camera files

**Reasoning**: 
- remove.bg API requires raster images
- JPG/PNG are universal standards
- Ensures consistent processing

**Score Impact**: 
- Wrong format = Immediate rejection (score: 0)
- PNG = +5 points (transparency support)
- JPG = Neutral (both are acceptable)

#### 5. **Dimension Limits (STRICT REQUIREMENT)**
**Measurement**: Image width and height in pixels

- **MINIMUM: 150x150px** (either dimension)
  - Below this, logos lack quality and detail
  - Too small for professional use
  - Won't scale well across contexts
  - **REJECT if < 150px**

- **MAXIMUM: 2500x2500px** (either dimension)
  - Industry standard for digital logo files
  - Covers high-DPI displays and print use
  - Above this indicates photograph or oversized file
  - Most platforms recommend 250-500px for web
  - Professional logos rarely exceed 2000px
  - **REJECT if > 2500px**

- **OPTIMAL RANGE**: 250px - 2000px
  - Perfect for web and print use
  - Balances quality with file size

**Reasoning**:
- Web logos: 250-500px typical
- High-res/Retina: 1000-2000px
- 2500px covers all professional use cases
- Larger = likely photograph

### Validation Scoring System (Multi-Factor Approach)

**KEY PRINCIPLE**: We use a **smart multi-factor system** that requires MULTIPLE failing signals to reject an image. No single criterion (except hard technical requirements) will reject a logo.

#### How Scoring Works

Each image receives a score from 0-100 based on all criteria:

**Starting score**: 100
- Color count: -5 to -20 (depending on severity)
- Edge density: -5 to -30 (depending on severity)  
- File size efficiency: -10 to -15
- Dimension issues: -40 each
- Format issues: -100 (instant fail)

**Score Ranges**:
- **80-100**: High confidence logo ✅
  - All checks pass or minor warnings only
  - Processed normally

- **60-79**: Likely logo ⚠️
  - Some warnings but overall acceptable
  - Processed with logged warnings

- **40-59**: Borderline ⚠️⚠️
  - Mixed characteristics
  - Could be complex logo or illustration
  - **STILL PROCESSED** unless multiple hard failures

- **30-39**: Questionable quality ⚠️⚠️⚠️
  - Multiple warning signals
  - **REJECTED only if 3+ warnings present**

- **0-29**: Very low quality ❌
  - Multiple failed checks or hard technical failures
  - REJECTED with specific error messages

#### Multi-Factor Rejection Logic

**Hard Blockers** (instant rejection):
1. Wrong file format (not JPG/PNG)
2. Dimensions out of range (< 150px or > 2500px)
3. File size > 5MB

**Soft Signals** (warning flags):
1. High color count
2. High edge density
3. Large file size ratio
4. File efficiency issues

**Rejection Rules**:
- ❌ **REJECT if**: Any hard blocker present
- ❌ **REJECT if**: Score < 30 AND 3+ warnings
- ✅ **ACCEPT if**: No hard blockers (even with low score)
- ✅ **ACCEPT if**: Score ≥ 30 (even with warnings)

**Why this matters**: Many modern logos have gradients, drop shadows, and anti-aliasing that increase color counts and complexity. We don't want to reject valid logos just because they're not "simple flat design". We only reject when MULTIPLE objective signals indicate it's clearly not a logo.

### Rejection Messages

Users receive specific, actionable feedback:

**Example hard rejections**:
- "Invalid file format (image/gif). Only JPG and PNG files are accepted"
- "Dimensions too large (4200x3800). Maximum: 2500x2500px"
- "Dimensions too small (95x120). Minimum: 150x150px"
- "File too large (8.3MB). Maximum: 5MB"

**Example multi-factor rejection**:
- "Multiple quality indicators suggest this is not a logo" (shown when score < 30 with 3+ warnings)

**Example warnings** (logged but processed):
- "High color count (78). Could be gradient logo or illustration"
- "Large file size (3.2MB). Logos typically under 2MB"
- "High complexity (45% edge density). May be detailed illustration"

### Process Flow

```
1. User uploads image
   ↓
2. VALIDATION CHECK (Step 0)
   ↓
3. File format check (instant)
   → If not JPG/PNG: REJECT (hard blocker)
   ↓
4. File size check (quick)
   → If > 5MB: REJECT (hard blocker)
   ↓
5. Load image, get dimensions
   → If > 2500px or < 150px: REJECT (hard blocker)
   ↓
6. Count unique colors (4-bit palette reduction)
   → Deduct points based on count (NOT a hard reject)
   ↓
7. Calculate edge density (Sobel operator)
   → Deduct points based on density (NOT a hard reject)
   ↓
8. Calculate file efficiency
   → Deduct points if inefficient (NOT a hard reject)
   ↓
9. SCORING & MULTI-FACTOR DECISION
   → Score < 30 AND 3+ warnings: REJECT
   → Has hard blockers: REJECT
   → Otherwise: ACCEPT
   ↓
5. Calculate edge density (Sobel operator)
   → If > 40% density: REJECT
   ↓
6. Calculate efficiency ratio
   → Affects score but doesn't block
   ↓
7. Combine all metrics into final score
   → Score < 40: REJECT with reasons
   → Score 40-79: ACCEPT with warnings
   → Score 80-100: ACCEPT confidently
   ↓
8. If ACCEPTED: Proceed to color extraction (Step 1)
   If REJECTED: Show error, don't process
```

### API Credits Protection

By rejecting inappropriate images **before** calling remove.bg:
- **Saves credits**: remove.bg charges per API call
- **Saves time**: No waiting for doomed processing
- **Better UX**: Immediate feedback instead of failed results

### Result
Only logo-appropriate images proceed to color extraction and background removal, ensuring efficient use of API credits and high-quality results.

---

## Step 1: Color Extraction (ColorThief API)

### What happens
Analyzes your original uploaded image to extract dominant colors.

### API
**ColorThief.js** (runs in your browser, no server call)

### Process
1. Reads the original uploaded image file
2. Extracts the 20 most dominant colors from the image (increased from 10 for better options)
3. Returns colors in RGB format: `[r, g, b]`

### Result
20 dominant colors extracted from your logo before any background removal

---

## Step 2: Color Similarity Filtering (Custom Algorithm)

### What happens
Filters extracted colors to only show significantly different options, preventing similar tones from cluttering the UI.

### API
**Custom Color Difference Calculator** (runs in browser)

### Process
1. **Calculate Color Difference** using Euclidean distance in RGB space:
   - Formula: `√[(R1-R2)² + (G1-G2)² + (B1-B2)²]`
   - Range: 0 (identical) to ~441 (maximum difference, e.g., black vs white)
   - Threshold: 60 units minimum difference required

2. **Filter for Distinct Colors**:
   - Start with empty list of distinct colors
   - For each ColorThief color:
     - Check if it's at least 60 units different from all existing distinct colors
     - If yes, add it to the list
     - If no, skip it (too similar)
   - Stop when we have 5 distinct colors

3. **Fallback for Low-Variety Logos**:
   - If fewer than 3 distinct colors found with threshold of 60
   - Lower threshold to 40 and try again
   - Ensures we always have at least a few options

### Technical Details
```javascript
// Example differences:
// #FFFFFF vs #FEFEFE = ~2 (nearly identical, filtered out)
// #000000 vs #1A1A1A = ~45 (very similar, filtered out)
// #FF0000 vs #FF6666 = ~102 (distinct enough, kept)
// #000000 vs #FFFFFF = ~441 (very distinct, kept)
```

### Result
3-5 significantly different colors that are visually distinct from each other

---

## Step 3: Contrast Filtering (WCAG Algorithm)

### What happens
Ensures selected colors are legible against the logo by checking contrast ratios.

### API
**Custom WCAG 2.1 Contrast Ratio Calculator** (runs in browser)

### Process
1. Calculates the relative luminance of each color using the WCAG formula:
   - Convert RGB to sRGB (0-1 range)
   - Apply gamma correction: `if (sRGB <= 0.03928) then sRGB/12.92 else ((sRGB+0.055)/1.055)^2.4`
   - Calculate luminance: `L = 0.2126*R + 0.7152*G + 0.0722*B`

2. Determines logo brightness by analyzing the logo itself:
   - Samples pixels from the logo area
   - Calculates average luminance
   - Classifies as "light" or "dark"

3. Calculates contrast ratio between each color and the logo:
   - Formula: `(L1 + 0.05) / (L2 + 0.05)` where L1 is the lighter luminance
   - WCAG AA standard requires minimum 4.5:1 for normal text
   - Our threshold: 3.0:1 minimum for background colors

4. Filters out colors that don't meet the contrast threshold
5. Combined with similarity filtering from Step 2

### Result
3-5 legible, distinct colors that provide sufficient contrast with your logo

---

## Step 3: Background Removal & Logo Processing (remove.bg API)

### What happens
Removes the background from your logo and centers/crops it in a standardized frame.

### API
**remove.bg API** (paid service, server-side)
- Endpoint: `https://api.remove.bg/v1.0/removebg`
- Authentication: API Key in header

### Process
1. Uploads your original logo image to remove.bg
2. API parameters sent:
   - `size`: `'auto'` - automatic size detection
   - `crop`: `'true'` - enables smart cropping
   - `crop_margin`: `'15%'` - adds 15% padding around the logo
   - `scale`: `'100%'` - maintains original resolution
   - `position`: `'center'` - centers the logo in the frame
   - `format`: `'png'` - outputs as PNG with transparency

3. remove.bg's AI:
   - Detects the foreground subject (your logo)
   - Removes the background completely
   - Centers the logo in a square frame
   - Adds proportional margins
   - Maintains aspect ratio

4. Returns processed image as PNG with transparent background

### Result
High-resolution PNG with transparent background, centered and cropped

### API Credits
- Each API call consumes 1 credit
- Credits are tracked via response headers:
  - `X-Credits-Charged`: Credits used for this request
  - `X-RateLimit-Remaining`: Credits remaining in your account
  - `X-RateLimit-Limit`: Total credits in your plan

---

## Step 4: Edge Color Detection (Custom Algorithm)

### What happens
Analyzes the edges of the original image to detect if there's a consistent background color.

### API
**Custom Edge Detection Algorithm** (runs in browser using Canvas API)

### Process
1. Loads the original image into an HTML5 Canvas
2. Samples pixels from all four edges:
   - Top edge: 20 pixels from top row
   - Bottom edge: 20 pixels from bottom row
   - Left edge: 20 pixels from left column
   - Right edge: 20 pixels from right column

3. Calculates the average color of all sampled edge pixels
4. Checks for color consistency:
   - If edges have similar colors (variance < threshold)
   - Returns the dominant edge color as "original background"

### Result
Detected original background color (if one exists), or `null` if edges are inconsistent

---

## Step 5: Intelligent Default Background Selection (Custom Algorithm)

### What happens
Automatically selects the best default background color for your logo preview.

### API
**Custom Smart Selection Algorithm** (runs in browser)

### Process

#### Priority 1: Detected Original Background (STRONGLY Preferred)
1. **Edge sampling**: Sample 8 points around the image edges (4 corners + 4 midpoints)
2. **Consistency check**: If ≥50% of edge pixels are the same color → high confidence (>60%)
3. **Brightness comparison**: Calculate brightness difference between logo and detected background
   - Formula: `|logoBrightness - backgroundBrightness|`
   - Threshold: Must be ≥50 for legibility
4. **Decision**:
   - If brightness difference ≥50: **USE detected background** ✓
   - If brightness difference <50: **TOO SIMILAR** → use opposite (dark→white, light→black)

**Why this matters**: The original background was chosen for a reason. A white cross on black should keep black. A black logo on white should keep white.

**Example**: 
- White cross logo, black edges detected → brightness diff = ~180 → **Use black** ✓
- Dark blue logo, dark gray edges detected → brightness diff = ~30 → **Use white instead** (avoid dark-on-dark)

#### Priority 2: Logo Brightness Analysis (Fallback)
If no consistent background detected (confidence <60%):
1. **Analyze logo pixels** (transparent background removed)
2. **Calculate average brightness**: 0-255 scale using perceived brightness formula
   - `0.299*R + 0.587*G + 0.114*B`
3. **Choose opposite**:
   - Logo brightness >128 (LIGHT logo) → **Black background** (#000000)
   - Logo brightness <128 (DARK logo) → **White background** (#FFFFFF)

**Rationale**: Maximum contrast ensures legibility when we don't know the original context

#### Priority 3: Absolute Fallback
If brightness analysis fails:
- Default to **White** (#FFFFFF)

### Result
One intelligently selected background color that ensures maximum legibility

---

## Step 6: Final Color Options UI (Smart Deduplication)

### What happens
Displays up to 7 distinct color options, intelligently filtering out duplicates and near-duplicates.

### Process
1. **Build Final Color List** (sequential checking):
   - Start with empty list
   - Consider White (#FFFFFF):
     - Check if significantly different from all colors in list (60+ units)
     - If yes, add to list
     - If no, skip (too similar to existing option)
   
   - Consider Black (#000000):
     - Check if significantly different from all colors in list
     - If yes, add to list
     - If no, skip (prevents showing both pure black and near-black)
   
   - Add ColorThief colors (3-5 colors from Steps 2-3):
     - For each ColorThief color:
       - Check if significantly different from all colors already in list
       - If yes, add to list
       - If no, skip (too similar)
       - Stop when list reaches 7 colors

2. **Result**: 3-7 color options, all significantly different from each other

3. **Examples**:
   - Logo with light background → Shows: White, 5 ColorThief colors (no black, too similar to dark ColorThief color)
   - Logo with dark background → Shows: Black, 5 ColorThief colors (no white, too similar to light ColorThief color)
   - Logo with varied colors → Shows: White, Black, 5 ColorThief colors = 7 total

### UI Display
1. Color options shown as 24x24px circles
2. Selected color highlighted with white ring
3. Hex value displayed below: `#000000`, `#FFFFFF`, or ColorThief hex
4. Logo with transparent background overlaid on colored card background

### Result
Real-time preview with 3-7 distinct, legible background color options

---

## Step 7: Adaptive Outline System (WCAG AA 3:1 Compliant)

### What happens
The card outline automatically adjusts its color (white or black) and opacity based on the background's luminance value, following WCAG non-text contrast standards to ensure optimal visibility across all card colors.

### Why this matters
- **WCAG Compliance**: Meets AA 3:1 contrast ratio for non-text content
- **Adaptive Intelligence**: Outline strength automatically increases on extreme light/dark backgrounds
- **Smart Color Switching**: Uses white outline on dark backgrounds, black outline on light backgrounds
- **Mid-tone Calculation**: For medium luminance values, calculates which outline color provides better contrast
- **Universal Accessibility**: Ensures all users can clearly distinguish card boundaries regardless of background choice

### Technical Implementation

#### **Luminance-Based Outline Rules**

The system calculates the relative luminance of the background color (0.0 - 1.0 scale) and applies the appropriate outline:

| Luminance Range | Card Color | Outline Stroke | Opacity | Rationale |
|----------------|------------|----------------|---------|-----------|
| 0.00 - 0.18 | Very dark/black | #FFFFFF (white) | 45% | Strongest white outline for maximum contrast |
| 0.18 - 0.35 | Dark | #FFFFFF (white) | 35% | Strong white outline for good visibility |
| 0.35 - 0.65 | Medium | Higher contrast of black or white | 25% | Calculates which provides better contrast |
| 0.65 - 0.82 | Light | #000000 (black) | 35% | Strong black outline for good visibility |
| 0.82 - 1.00 | Very light/white | #000000 (black) | 50% | Strongest black outline for maximum contrast |

#### **Luminance Calculation**

Uses the WCAG relative luminance formula:

```javascript
function getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}
```

#### **Adaptive Outline Function**

```javascript
function getAdaptiveOutline(backgroundColor) {
    const luminance = getLuminance(r, g, b);
    
    if (luminance <= 0.18) {
        return { color: '#FFFFFF', opacity: 0.45 };
    } else if (luminance <= 0.35) {
        return { color: '#FFFFFF', opacity: 0.35 };
    } else if (luminance <= 0.65) {
        // Calculate which provides better contrast
        const whiteContrast = getContrastRatio([255, 255, 255], [r, g, b]);
        const blackContrast = getContrastRatio([0, 0, 0], [r, g, b]);
        return whiteContrast > blackContrast 
            ? { color: '#FFFFFF', opacity: 0.25 }
            : { color: '#000000', opacity: 0.25 };
    } else if (luminance <= 0.82) {
        return { color: '#000000', opacity: 0.35 };
    } else {
        return { color: '#000000', opacity: 0.50 };
    }
}
```

#### **Application Points**
1. **Initial render**: Applied when card is first displayed with default background
2. **Color selection**: Updated dynamically when user selects different background color
3. **Lightbox view**: Applied with scaled stroke width (0.7px vs 0.5px)
4. **Smooth transitions**: 0.2s ease transition when outline changes

#### **Card Specifications**
- **Stroke width**: 0.5px (standard), 0.7px (lightbox at 140% scale)
- **Border radius**: 32px (standard), 45px (lightbox)
- **Transition**: `border-color 0.2s ease` for smooth color/opacity changes

### Design Rationale

**Why adaptive opacity levels?**
- **Extreme backgrounds need stronger outlines**: 45-50% opacity on pure black/white ensures clear definition
- **Mid-tones need subtlety**: 25-35% opacity prevents outline from being distracting
- **Graduated approach**: Smooth progression of opacity levels across luminance spectrum
- **WCAG-informed**: Opacity levels calibrated to meet AA 3:1 contrast ratio

**Why switch between black and white?**
- **Physics of contrast**: White provides best contrast on dark backgrounds, black on light
- **Mid-tone intelligence**: For ambiguous cases (0.35-0.65 luminance), calculate which provides better contrast
- **Avoids poor combinations**: Never uses white outline on white background or black on black
- **Accessibility-first**: Ensures maximum visibility for all users

**Why luminance-based (not simple brightness)?**
- **Perceptually accurate**: Luminance accounts for how human eyes perceive different colors
- **WCAG standard**: Uses the same formula as accessibility guidelines
- **Handles color accurately**: Green appears brighter than blue at same RGB value - luminance captures this
- **Industry best practice**: Same calculation used by accessibility tools worldwide

**Comparison to Static Approach**:
- ❌ **Static outline** (e.g., white at 20% everywhere):
  - Invisible on very light backgrounds
  - Too subtle on very dark backgrounds
  - One-size-fits-all doesn't optimize for extremes
- ✅ **Adaptive (current)**: Luminance-based dynamic outline
  - Optimized for every background color
  - Meets accessibility standards
  - Smooth transitions between colors
  - Future-proof for any color palette

### Visual Examples

**Pure White Card (#FFFFFF)**:
```
Luminance: 1.00 (very light/white range)
Outline: Black at 50% opacity
Result: Strong black outline ensures card doesn't disappear on light interfaces
Accessibility: Meets WCAG AA 3:1 contrast ratio
```

**Pure Black Card (#000000)**:
```
Luminance: 0.00 (very dark/black range)
Outline: White at 45% opacity
Result: Strong white outline provides clear definition against dark interface
Accessibility: Meets WCAG AA 3:1 contrast ratio
```

**Mid-tone Gray Card (#808080)**:
```
Luminance: ~0.50 (medium range)
Outline: Calculated - whichever of black/white provides better contrast at 25%
Result: Subtle but effective outline
Accessibility: Optimized for this specific gray value
```

**Dark Navy Card (#1A1A2E)**:
```
Luminance: ~0.05 (very dark range)
Outline: White at 45% opacity
Result: Clear white outline on dark navy
Accessibility: High contrast for visibility
```

**Light Cream Card (#F5F5DC)**:
```
Luminance: ~0.92 (very light range)
Outline: Black at 50% opacity
Result: Defined black outline on light cream
Accessibility: Strong contrast prevents disappearing
```

**Key Insight**: The adaptive system ensures every background color gets the optimal outline - strong enough for visibility, calibrated for accessibility, and smooth when transitioning between colors.

### Accessibility Benefits

1. **Improved Perception**: Users can clearly distinguish card boundaries
2. **Reduced Eye Strain**: Clear definition reduces visual effort
3. **Universal Design**: Works for all users regardless of visual acuity
4. **WCAG Compliance**: Ensures non-text content has sufficient contrast

### Result
All seller cards maintain clear visibility and definition across any background color, with a consistent, polished appearance in both grid and lightbox views.

---

## Technical Stack Summary

### Client-Side (Browser)
- **ColorThief.js**: Color extraction
- **Canvas API**: Image manipulation and edge detection
- **Custom WCAG Calculator**: Contrast ratio calculations
- **Vanilla JavaScript**: All processing logic

### Server-Side (External API)
- **remove.bg API**: Background removal and logo processing
- **API Key**: `CEJ8TU3u3GHnjoLVidQtGCos`

### File Processing
- **Input formats**: JPG, PNG, GIF, WebP
- **Output format**: PNG with transparency
- **Resolution**: Original resolution maintained
- **Max batch size**: 8 logos per upload

---

## Processing Flow Summary

```
1. User uploads image(s)
   ↓
2. VALIDATION: Analyze each image (Step 0)
   - Check file size (< 5MB)
   - Check dimensions (100-3000px)
   - Count unique colors (< 50)
   - Calculate edge density (< 40%)
   - Compute validation score (0-100)
   → If REJECTED: Show error, stop processing
   → If ACCEPTED: Continue to Step 3
   ↓
3. ColorThief extracts 20 colors from original
   ↓
4. Similarity filter reduces to 3-5 distinct colors (60+ unit difference)
   ↓
5. WCAG contrast filter ensures legibility (3.0:1 minimum)
   ↓
6. Edge detection analyzes original background
   ↓
7. Logo brightness is calculated
   ↓
8. remove.bg removes background & centers logo (1 API credit)
   → If FAILS: Mark as failed, show original + reason
   ↓
9. Smart algorithm selects default background
   ↓
10. Final color list built: White + Black + ColorThief (all checked for similarity)
   ↓
11. User sees processed logo with 3-7 distinct color options
   ↓
12. User can select any background color
   ↓
13. Final preview updates in real-time
```

---

## Error Handling

### remove.bg API Errors
- **429 Too Many Requests**: Rate limit exceeded
- **402 Payment Required**: No credits remaining
- **400 Bad Request**: Invalid image format
- **500 Server Error**: API service issue

### Client-Side Errors
- **Invalid file type**: Only images accepted
- **File too large**: Max 8 files per batch
- **CORS errors**: Handled with crossOrigin attribute
- **Color extraction failure**: Fallback to white/black defaults

---

## Performance Considerations

### Optimization Strategies
1. **Parallel processing**: ColorThief runs before API call
2. **Batch uploads**: Process up to 8 logos simultaneously
3. **Client-side caching**: Processed images stored in browser
4. **Lazy loading**: Images load as needed
5. **Spinner feedback**: Visual indication during processing

### API Rate Limits
- **remove.bg**: Based on subscription plan
- **ColorThief**: No limits (runs locally)
- **WCAG Calculator**: No limits (runs locally)

---

## Future Enhancements

### Potential Improvements
1. **AI-powered color palette generation**: Suggest complementary colors
2. **Batch export**: Download all processed logos at once
3. **Custom crop margins**: User-adjustable padding
4. **Format options**: Export as SVG, WebP, or other formats
5. **Color harmony analysis**: Suggest color schemes based on brand theory

---

*Last Updated: [Current Date]*
*Version: 1.0*


# Checkpoint 4 - Dark Mode Global Environment

## Date
November 20, 2025

## Summary
This checkpoint captures the Brand Admin interface with a complete dark mode global environment implementation, refined dropdown UX, and optimized preview backgrounds.

## Key Features

### Dark Mode Global Environment
- **Global background**: `#1a1a1a` (semantic/background/app)
- **Default preview mode**: Dark mode on page load
- All text elements use white (`#ffffff`) for high contrast
- Semantic color tokens applied throughout for consistency

### Preview Backgrounds
- **Light mode**: White background (`#ffffff`), no border
- **Tab mode**: Light gray background (`#f7f7f7`), no border
- **Dark mode**: Black background (`#000000`), no border (default)

### Dropdown UX Refinements
- Modern, elevated dropdown design with subtle shadow
- 4px gap between button and dropdown menu
- Clean styling: 12px border-radius, no visible borders
- Selected items: White background with black text for high contrast
- Hover state: Subtle white transparency overlay
- Regular weight text (400) for better readability
- Compact spacing: 2px gap between items, 10px/16px padding

### Color Picker
- Hex and opacity values: White text, directly editable
- Brand color pill: `#f0f0f0` background matching preview pills
- Hover states: Subtle white transparency

### UI Components
- **Dropdowns**: `#333333` background, white text and icons
- **Buttons**: 
  - Reset: `#333333` background, white text, lighter hover (`#404040`)
  - Save: White background (`#ffffff`), black text, lighter hover (`#d9d9d9`)
- **Logo previews**: `#333333` background, white text for monogram
- **Navigation tabs**: "Brand details" (active, white), "Generate brand sticker" (disabled), "Profile settings" (disabled)

### Card Interactions
- 3D tilt effect following cursor across entire page
- Smooth transitions between card sizes (XS, S, M, L, XL) with subtle spring easing
- Idle timeout: Card returns to resting state after 1.5s of cursor inactivity
- Coordinated transitions: Tilt pauses during size changes for smooth experience

### Responsive Design
- 24px grid system
- Preview scales dynamically while maintaining card proportions
- Brand identity rail remains right-aligned
- Smooth breakpoint transitions

## Technical Details

### Files Modified
- `index.html`: Updated default background to `bg-dark`, dropdown selected states
- `styles.css`: 
  - Global dark mode tokens and overrides
  - Refined dropdown menu styling (shadow, spacing, borders)
  - Preview background classes
  - Card transition timing with spring easing
- `script.js`: 
  - 3D tilt with idle timeout
  - Transition coordination (pauseTilt function)
  - Background dropdown default selection

### Design Tokens Used
- `semantic/background/app`: `#1a1a1a`
- `semantic/background/prominent`: `#333333`
- `semantic/background/inverse`: `#ffffff`
- `semantic/text/standard`: `#ffffff`
- `semantic/text/subtle`: `#878787`
- `semantic/text/inverse`: `#000000`
- `semantic/border/standard`: `#595959`

### Card Size Specifications
- **XL**: 361px × 452px, 40px border-radius, 135.6px font-size
- **L**: 289px × 362px, 32px border-radius, 108.48px font-size
- **M**: 217px × 271px, 24px border-radius, 81.36px font-size
- **S**: 145px × 181px, 16px border-radius, 54.24px font-size
- **XS**: 72px × 90px, 8px border-radius, 27.12px font-size

### Transition Timing
- Card size changes: `0.4s cubic-bezier(0.34, 1.2, 0.64, 1)` (subtle spring)
- 3D tilt: `0.2s ease-out`
- Tilt pause duration: 400ms during size transitions
- Idle timeout: 1500ms before returning to resting state

## Features Implemented
- ✅ Multi-logo upload with 4-up grid layout
- ✅ Brand color picker with HSL color space
- ✅ WCAG contrast logic for optimal stroke/logo colors
- ✅ Editable hex and opacity values (keyboard input)
- ✅ Card size dropdown (XS, S, M, L, XL)
- ✅ Background preview modes (Light, Tab, Dark)
- ✅ 3D tilt effect with cursor tracking and idle timeout
- ✅ Smooth card size transitions with spring easing
- ✅ Reset functionality (reverts to defaults)
- ✅ Save functionality with toast notification
- ✅ Responsive layout with 24px grid
- ✅ Dark mode global environment
- ✅ Modern dropdown UX with elevation and refined interactions

## Default State
- Card size: XL
- Background: Dark
- Brand color: `#b44e0e` (orange) at 100% opacity
- Logo: JB monogram (white text, Cash Sans font)
- Card background: Orange with 20% white border
- Global background: `#1a1a1a`

## Notes
- Figma MCP connection can be unstable; may require manual token extraction
- All dark mode tokens verified against Figma semantic color system
- Dropdown design follows modern UI patterns (macOS, iOS, Material Design)
- 3D tilt and size transitions are coordinated to prevent conflicts
- Toast notification uses Body/Label small typography (14pt Medium)

## Next Steps (Potential)
- Generate brand sticker tab (disabled)
- Profile settings tab (disabled)
- Additional preview modes or export functionality



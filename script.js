// Brand Admin - JavaScript with Color Picker Integration

class ColorPicker {
    constructor(onColorChange) {
        this.hue = 0;
        this.saturation = 100;
        this.lightness = 50;
        this.opacity = 100;
        this.onColorChange = onColorChange || (() => {});
        
        this.initializeElements();
        this.setupEventListeners();
        this.updateColorField();
        this.updateValueSlider();
        this.updateHexInput();
        this.updateOpacityInput();
        this.updateOpacitySliderPosition();
    }
    
    initializeElements() {
        this.colorField = document.getElementById('colorGradient');
        this.colorHandle = document.getElementById('colorHandle');
        this.hueSlider = document.getElementById('hueSlider');
        this.hueHandle = document.getElementById('hueHandle');
        this.valueSlider = document.getElementById('valueSlider');
        this.valueHandle = document.getElementById('valueHandle');
        this.hexValue = document.getElementById('colorPickerHexValue');
        this.opacityValue = document.getElementById('colorPickerOpacityValue');
        this.colorDot = document.getElementById('colorPickerColorDot');
    }
    
    setupEventListeners() {
        // Color field interaction
        this.setupColorFieldEvents();
        
        // Hue slider interaction
        this.setupSliderEvents(this.hueSlider, this.hueHandle, (percentage) => {
            this.hue = percentage * 360;
            this.updateColorField();
            this.updateValueSlider();
            this.updateHexInput();
            this.onColorChange(this.getColor());
        });
        
        // Value/Opacity slider interaction
        this.setupSliderEvents(this.valueSlider, this.valueHandle, (percentage) => {
            this.opacity = percentage * 100;
            this.updateOpacityInput();
            this.onColorChange(this.getColor());
        });
        
        // Hex value interaction - make it clickable and editable
        this.hexValue.addEventListener('click', (e) => {
            e.stopPropagation();
            this.makeEditable(this.hexValue, (newValue) => {
                if (this.isValidHex(newValue)) {
                    const hsl = this.hexToHsl(newValue);
                    this.hue = hsl.h;
                    this.saturation = hsl.s;
                    this.lightness = hsl.l;
                    this.updateColorField();
                    this.updateValueSlider();
                    this.updateSliderPositions();
                    this.onColorChange(this.getColor());
                }
            });
        });
        
        // Opacity value interaction - make it clickable and editable
        this.opacityValue.addEventListener('click', (e) => {
            e.stopPropagation();
            this.makeEditable(this.opacityValue, (newValue) => {
                let value = newValue.replace('%', '');
                let numValue = parseInt(value);
                
                if (!isNaN(numValue)) {
                    numValue = Math.max(0, Math.min(100, numValue));
                    this.opacity = numValue;
                    this.updateOpacitySliderPosition();
                    this.onColorChange(this.getColor());
                }
            }, {
                maxLength: 4,
                inputFilter: (value) => {
                    return value.replace(/[^\d%]/g, '').slice(0, 4);
                }
            });
        });
        
        // Prevent text selection during drag
        document.addEventListener('selectstart', (e) => {
            if (e.target.closest('.color-picker')) {
                e.preventDefault();
            }
        });
    }
    
    setupColorFieldEvents() {
        let isDragging = false;
        
        const handleMove = (e) => {
            if (!isDragging) return;
            
            const rect = this.colorField.getBoundingClientRect();
            const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
            const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
            
            this.saturation = (x / rect.width) * 100;
            this.lightness = 100 - (y / rect.height) * 100;
            
            this.updateColorFieldHandle();
            this.updateValueSlider();
            this.updateHexInput();
            this.onColorChange(this.getColor());
        };
        
        this.colorField.addEventListener('mousedown', (e) => {
            isDragging = true;
            handleMove(e);
            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', () => {
                isDragging = false;
                document.removeEventListener('mousemove', handleMove);
            }, { once: true });
        });
    }
    
    setupSliderEvents(slider, handle, callback) {
        let isDragging = false;
        
        const handleMove = (e) => {
            if (!isDragging) return;
            
            const rect = slider.getBoundingClientRect();
            const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
            const percentage = x / rect.width;
            
            handle.style.left = `${x - 7.5}px`;
            callback(percentage);
        };
        
        slider.addEventListener('mousedown', (e) => {
            isDragging = true;
            handleMove(e);
            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', () => {
                isDragging = false;
                document.removeEventListener('mousemove', handleMove);
            }, { once: true });
        });
    }
    
    updateColorField() {
        const hueColor = this.hslToHex(this.hue, 100, 50);
        
        this.colorField.style.background = `
            linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0)),
            linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0)),
            ${hueColor}
        `;
        this.updateColorFieldHandle();
    }
    
    updateColorFieldHandle() {
        const x = (this.saturation / 100) * this.colorField.offsetWidth;
        const y = (1 - this.lightness / 100) * this.colorField.offsetHeight;
        
        this.colorHandle.style.left = `${x}px`;
        this.colorHandle.style.top = `${y}px`;
    }
    
    updateValueSlider() {
        this.valueSlider.style.background = 'linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1))';
        this.updateOpacitySliderPosition();
    }
    
    updateOpacitySliderPosition() {
        const position = (this.opacity / 100) * this.valueSlider.offsetWidth;
        this.valueHandle.style.left = `${position - 7.5}px`;
    }
    
    updateSliderPositions() {
        const huePosition = (this.hue / 360) * this.hueSlider.offsetWidth;
        this.hueHandle.style.left = `${huePosition - 7.5}px`;
        
        this.updateOpacitySliderPosition();
        this.updateColorFieldHandle();
    }
    
    updateHexInput() {
        const hex = this.hslToHex(this.hue, this.saturation, this.lightness);
        this.hexValue.textContent = hex.toUpperCase();
        this.colorDot.style.backgroundColor = hex;
    }
    
    updateOpacityInput() {
        this.opacityValue.textContent = `${Math.round(this.opacity)}%`;
    }
    
    makeEditable(element, onComplete, options = {}) {
        const currentValue = element.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentValue;
        
        if (options.maxLength) {
            input.maxLength = options.maxLength;
        }
        
        const computedStyle = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        
        input.style.cssText = `
            font-family: ${computedStyle.fontFamily};
            font-weight: ${computedStyle.fontWeight};
            font-size: ${computedStyle.fontSize};
            line-height: ${computedStyle.lineHeight};
            letter-spacing: ${computedStyle.letterSpacing};
            color: ${computedStyle.color};
            background: transparent;
            border: none;
            outline: none;
            padding: 0;
            margin: 0;
            width: ${rect.width}px;
            height: ${rect.height}px;
            text-align: ${computedStyle.textAlign};
            display: ${computedStyle.display};
            box-sizing: border-box;
        `;
        
        element.parentNode.replaceChild(input, element);
        input.focus();
        input.select();
        
        if (options.inputFilter) {
            input.addEventListener('input', (e) => {
                const filteredValue = options.inputFilter(e.target.value);
                if (e.target.value !== filteredValue) {
                    e.target.value = filteredValue;
                }
            });
        }
        
        const handleComplete = () => {
            const newValue = input.value;
            input.parentNode.replaceChild(element, input);
            onComplete(newValue);
            if (element === this.hexValue) {
                this.updateHexInput();
            } else if (element === this.opacityValue) {
                this.updateOpacityInput();
            }
        };
        
        input.addEventListener('blur', handleComplete);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleComplete();
            }
            e.stopPropagation();
        });
        
        input.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    hslToHex(h, s, l) {
        h = h / 360;
        s = s / 100;
        l = l / 100;
        
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h * 6) % 2 - 1));
        const m = l - c / 2;
        
        let r, g, b;
        
        if (0 <= h && h < 1/6) {
            r = c; g = x; b = 0;
        } else if (1/6 <= h && h < 2/6) {
            r = x; g = c; b = 0;
        } else if (2/6 <= h && h < 3/6) {
            r = 0; g = c; b = x;
        } else if (3/6 <= h && h < 4/6) {
            r = 0; g = x; b = c;
        } else if (4/6 <= h && h < 5/6) {
            r = x; g = 0; b = c;
        } else {
            r = c; g = 0; b = x;
        }
        
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    hexToHsl(hex) {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;
        
        let h = 0;
        let s = 0;
        let l = (max + min) / 2;
        
        if (diff !== 0) {
            s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
            
            switch (max) {
                case r:
                    h = (g - b) / diff + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / diff + 2;
                    break;
                case b:
                    h = (r - g) / diff + 4;
                    break;
            }
            h /= 6;
        } else {
            h = this.hue / 360;
        }
        
        return {
            h: h * 360,
            s: s * 100,
            l: l * 100
        };
    }
    
    isValidHex(hex) {
        return /^#[0-9A-Fa-f]{6}$/.test(hex);
    }
    
    getColor() {
        return {
            hex: this.hslToHex(this.hue, this.saturation, this.lightness),
            hsl: { h: this.hue, s: this.saturation, l: this.lightness },
            opacity: this.opacity
        };
    }
    
    setColor(hex, opacity = null) {
        if (this.isValidHex(hex)) {
            const hsl = this.hexToHsl(hex);
            this.hue = hsl.h;
            this.saturation = hsl.s;
            this.lightness = hsl.l;
            
            if (opacity !== null) {
                this.opacity = Math.max(0, Math.min(100, opacity));
            }
            
            this.updateColorField();
            this.updateValueSlider();
            this.updateSliderPositions();
            this.updateHexInput();
            this.updateOpacityInput();
        }
    }
}

// Brand Admin Main Functionality
let colorPicker;
let currentClickedElement = null;

// Default state
const DEFAULT_STATE = {
    color: '#B44E0E',
    opacity: 100,
    selectedLogo: 'monogram',
    cardSize: 'xl',
    background: 'dark'
};

// Current state
let currentState = { ...DEFAULT_STATE };

// Toast notification
function showToast(message = 'Changes saved') {
    const toast = document.getElementById('saveToast');
    const toastText = toast.querySelector('span');
    toastText.textContent = message;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Reset functionality
function resetToDefaults() {
    // Reset color
    updateCardColor(DEFAULT_STATE.color, DEFAULT_STATE.opacity);
    
    // Reset to monogram (but keep uploaded logos in sidebar)
    const monogramOption = document.getElementById('logoMonogramOption');
    if (monogramOption) {
        monogramOption.click();
    }
    
    // Reset card size
    const cardSizeItems = document.querySelectorAll('#cardSizeMenu .dropdown-item');
    const xlItem = Array.from(cardSizeItems).find(item => item.dataset.size === DEFAULT_STATE.cardSize);
    if (xlItem) {
        xlItem.click();
    }
    
    // Reset background
    const backgroundItems = document.querySelectorAll('#backgroundMenu .dropdown-item');
    const tabItem = Array.from(backgroundItems).find(item => item.dataset.background === DEFAULT_STATE.background);
    if (tabItem) {
        tabItem.click();
    }
    
    // Update current state
    currentState = { ...DEFAULT_STATE };
    
    showToast('Reset to defaults');
}

// Save functionality
function saveChanges() {
    // Update current state with actual values
    const hexValue = document.getElementById('cardColorHex').textContent;
    const opacityValue = document.getElementById('cardOpacity').textContent;
    const selectedLogoOption = document.querySelector('.logo-option.selected');
    const cardSizeLabel = document.getElementById('cardSizeLabel').textContent.toLowerCase();
    const backgroundLabel = document.getElementById('backgroundLabel').textContent.toLowerCase();
    
    currentState = {
        color: hexValue,
        opacity: parseInt(opacityValue),
        selectedLogo: selectedLogoOption ? selectedLogoOption.dataset.type || 'image' : 'monogram',
        cardSize: cardSizeLabel,
        background: backgroundLabel
    };
    
    // In a real app, this would send data to a server
    console.log('Saved state:', currentState);
    
    showToast('Changes saved');
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Brand Admin - Ready');
    initializeBrandAdmin();
});

function initializeBrandAdmin() {
    // Load saved batches from localStorage
    loadBatchesFromStorage();
    
    // Check if user has already entered their name
    const userName = localStorage.getItem('userName');
    
    if (!userName) {
        // Show "Get started" view first
        showGetStartedView();
    } else {
        // User has already set their name, show logo processing
        showLogoProcessingView();
    }
    
    // Update nav tab to show we're on "Logo processing"
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
        if (tab.getAttribute('data-tab') === 'logo-processing') {
            tab.classList.add('nav-tab-active');
        } else {
            tab.classList.remove('nav-tab-active');
        }
    });
    
    // Initialize with Joy Bakeshop color
    const cardColor = '#B44E0E';
    updateCardColor(cardColor, 100);
    
    // Initialize card size to XL (matching Figma)
    const sellerCard = document.getElementById('sellerCard');
    if (sellerCard) {
        sellerCard.className = 'seller-card size-xl';
    }
    
    // Initialize color picker
    colorPicker = new ColorPicker((color) => {
        updateCardColor(color.hex, color.opacity);
    });
    
    // Setup event listeners
    setupColorPillClick();
    setupColorPickerPopup();
    setupCardSizeDropdown();
    setupBackgroundDropdown();
    setupLogoUpload();
    setup3DTilt();
    
    // Setup Reset and Save buttons
    const resetButton = document.querySelector('.sidebar-button-secondary');
    const saveButton = document.querySelector('.sidebar-button-primary');
    
    if (resetButton) {
        resetButton.addEventListener('click', resetToDefaults);
    }
    
    if (saveButton) {
        saveButton.addEventListener('click', saveChanges);
    }
    
    // Setup tab switching
    setupTabSwitching();
    // setupLogoProcessingTabs(); // Removed - simplified design
    setupGetStarted();
    setupLogoProcessingUpload();
    setupUploadMoreButton();
    setupLightbox();
    
    // Resize listener for sticky positioning
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(repositionColorPicker, 16);
    });
}

// Tab Switching Functionality
function setupTabSwitching() {
    const navTabs = document.querySelectorAll('.nav-tab:not(.nav-tab-disabled)');
    const views = {
        'logo-processing': document.getElementById('logoProcessingView'),
        'automation-logic': document.getElementById('automationLogicView'),
        'settings': document.getElementById('settingsView')
    };
    
    // Also need to hide processing results view when switching tabs
    const processingResultsView = document.getElementById('processingResultsView');
    
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            // Don't do anything if clicking the active tab
            if (tab.classList.contains('nav-tab-active')) {
                return;
            }
            
            // Update nav tab states
            navTabs.forEach(t => t.classList.remove('nav-tab-active'));
            tab.classList.add('nav-tab-active');
            
            // Hide ALL views first (including processing results)
            Object.values(views).forEach(view => {
                if (view) view.classList.remove('active');
            });
            if (processingResultsView) {
                processingResultsView.classList.remove('active');
            }
            
            // Show the target view
            if (views[targetTab]) {
                views[targetTab].classList.add('active');
            }
            
            // Special case: if switching to settings, load current name
            if (targetTab === 'settings') {
                const settingsNameInput = document.getElementById('settingsNameInput');
                if (settingsNameInput) {
                    const currentName = localStorage.getItem('userName');
                    if (currentName) {
                        settingsNameInput.value = currentName;
                    }
                }
            }
            
            // Special case: if switching to logo-processing, show processing results if we have batches
            if (targetTab === 'logo-processing' && processingBatches.length > 0) {
                // Hide the upload view and show processing results
                const logoProcessingView = document.getElementById('logoProcessingView');
                if (logoProcessingView) {
                    logoProcessingView.classList.remove('active');
                    logoProcessingView.classList.remove('overlay-mode');
                    
                    // Hide close button
                    const closeBtn = document.getElementById('logoProcessingClose');
                    if (closeBtn) {
                        closeBtn.style.display = 'none';
                    }
                }
                
                if (processingResultsView) {
                    processingResultsView.classList.add('active');
                }
            }
        });
    });
}

// Removed logo processing tabs - now using simplified upload-only design
// function setupLogoProcessingTabs() { ... }

// ============================================
// LOGO VALIDATION SYSTEM
// ============================================

// Count unique colors in an image (with palette reduction)
async function countUniqueColors(imageUrl) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Resize large images for faster processing
                const maxSize = 500;
                const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixels = imageData.data;
                
                // Use a Set to track unique colors
                // Reduce to 4-bit color space (16 values per channel = 4096 total possible colors)
                // This is more forgiving for logos with gradients/anti-aliasing
                const colorSet = new Set();
                
                for (let i = 0; i < pixels.length; i += 4) {
                    // Reduce color depth: 8 bits -> 4 bits per channel (16 values)
                    // This groups similar colors together better
                    const r = Math.floor(pixels[i] / 16);
                    const g = Math.floor(pixels[i + 1] / 16);
                    const b = Math.floor(pixels[i + 2] / 16);
                    const a = pixels[i + 3];
                    
                    // Skip fully transparent pixels
                    if (a > 10) {
                        colorSet.add(`${r},${g},${b}`);
                    }
                }
                
                resolve(colorSet.size);
            } catch (error) {
                console.error('Error counting colors:', error);
                resolve(0);
            }
        };
        
        img.onerror = () => resolve(0);
        img.src = imageUrl;
    });
}

// Calculate edge density using Sobel operator
async function calculateEdgeDensity(imageUrl) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Resize for performance
                const maxSize = 500;
                const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixels = imageData.data;
                const width = canvas.width;
                const height = canvas.height;
                
                // Convert to grayscale and apply Sobel edge detection
                let edgePixels = 0;
                const totalPixels = width * height;
                const threshold = 30; // Edge detection threshold
                
                for (let y = 1; y < height - 1; y++) {
                    for (let x = 1; x < width - 1; x++) {
                        // Sobel operator
                        const idx = (y * width + x) * 4;
                        
                        // Get surrounding pixels (simplified Sobel)
                        const getGray = (offset) => {
                            const i = idx + offset * 4;
                            return (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
                        };
                        
                        const gx = 
                            -getGray(-width - 1) - 2 * getGray(-1) - getGray(width - 1) +
                            getGray(-width + 1) + 2 * getGray(1) + getGray(width + 1);
                        
                        const gy = 
                            -getGray(-width - 1) - 2 * getGray(-width) - getGray(-width + 1) +
                            getGray(width - 1) + 2 * getGray(width) + getGray(width + 1);
                        
                        const magnitude = Math.sqrt(gx * gx + gy * gy);
                        
                        if (magnitude > threshold) {
                            edgePixels++;
                        }
                    }
                }
                
                const density = edgePixels / totalPixels;
                resolve(density);
            } catch (error) {
                console.error('Error calculating edge density:', error);
                resolve(0);
            }
        };
        
        img.onerror = () => resolve(0);
        img.src = imageUrl;
    });
}

// Validate if an image is likely a logo
async function validateLogoImage(file, imageUrl) {
    const validation = {
        isValid: true,
        warnings: [],
        errors: [],
        score: 100,
        metrics: {}
    };
    
    // 1. File format check (MUST be JPG or PNG)
    const fileType = file.type.toLowerCase();
    validation.metrics.fileType = fileType;
    
    if (!LOGO_VALIDATION.ALLOWED_FORMATS.includes(fileType)) {
        validation.errors.push(`Invalid file format (${fileType}). Only JPG and PNG files are accepted`);
        validation.score = 0;
        validation.isValid = false;
        return validation; // Return immediately - no point checking other criteria
    }
    
    // 2. File size check
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    validation.metrics.fileSize = file.size;
    validation.metrics.fileSizeMB = fileSizeMB;
    
    if (file.size > LOGO_VALIDATION.MAX_FILE_SIZE) {
        validation.errors.push(`File too large (${fileSizeMB}MB). Maximum: 5MB`);
        validation.score -= 30;
        validation.isValid = false;
    } else if (file.size > LOGO_VALIDATION.WARN_FILE_SIZE) {
        validation.warnings.push(`Large file size (${fileSizeMB}MB). Logos typically under 2MB`);
        validation.score -= 10;
    }
    
    // 3. Get image dimensions
    const dimensions = await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = () => resolve({ width: 0, height: 0 });
        img.src = imageUrl;
    });
    
    validation.metrics.width = dimensions.width;
    validation.metrics.height = dimensions.height;
    
    // Dimension checks (STRICT: must be within range)
    if (dimensions.width > LOGO_VALIDATION.MAX_DIMENSION || dimensions.height > LOGO_VALIDATION.MAX_DIMENSION) {
        validation.errors.push(`Dimensions too large (${dimensions.width}x${dimensions.height}). Maximum: ${LOGO_VALIDATION.MAX_DIMENSION}x${LOGO_VALIDATION.MAX_DIMENSION}px`);
        validation.score -= 40;
        validation.isValid = false;
    }
    
    if (dimensions.width < LOGO_VALIDATION.MIN_DIMENSION || dimensions.height < LOGO_VALIDATION.MIN_DIMENSION) {
        validation.errors.push(`Dimensions too small (${dimensions.width}x${dimensions.height}). Minimum: ${LOGO_VALIDATION.MIN_DIMENSION}x${LOGO_VALIDATION.MIN_DIMENSION}px`);
        validation.score -= 40;
        validation.isValid = false;
    }
    
    // 3. File size efficiency (KB per 1000 pixels)
    const totalPixels = dimensions.width * dimensions.height;
    const efficiency = (file.size / 1024) / (totalPixels / 1000);
    validation.metrics.sizeEfficiency = efficiency.toFixed(2);
    
    if (efficiency > LOGO_VALIDATION.MAX_SIZE_EFFICIENCY) {
        validation.warnings.push(`High file size ratio (${efficiency.toFixed(2)} KB/1000px). Suggests photo-like complexity`);
        validation.score -= 15;
    }
    
    // 4. Count unique colors (WARNING ONLY - not a hard rejection)
    const colorCount = await countUniqueColors(imageUrl);
    validation.metrics.uniqueColors = colorCount;
    
    // Color count is now INFORMATIONAL - many logos have gradients/anti-aliasing
    // We only use this as ONE signal among many
    if (colorCount > 100) {
        validation.warnings.push(`Very high color count (${colorCount}). May indicate photo-like complexity`);
        validation.score -= 20;
    } else if (colorCount > LOGO_VALIDATION.MAX_COLORS) {
        validation.warnings.push(`High color count (${colorCount}). Could be gradient logo or illustration`);
        validation.score -= 10;
    } else if (colorCount > LOGO_VALIDATION.WARN_COLORS) {
        validation.warnings.push(`Moderate color count (${colorCount}). Likely logo with gradients`);
        validation.score -= 5;
    }
    
    // 5. Calculate edge density
    const edgeDensity = await calculateEdgeDensity(imageUrl);
    validation.metrics.edgeDensity = (edgeDensity * 100).toFixed(1) + '%';
    
    // Edge density alone isn't enough to reject - combine with other signals
    if (edgeDensity > 0.55) {
        // Very high edge density (> 55%) = extremely detailed, likely photo
        validation.warnings.push(`Very high complexity (${(edgeDensity * 100).toFixed(0)}% edge density). Likely photograph`);
        validation.score -= 30;
    } else if (edgeDensity > LOGO_VALIDATION.MAX_EDGE_DENSITY) {
        validation.warnings.push(`High complexity (${(edgeDensity * 100).toFixed(0)}% edge density). May be detailed illustration`);
        validation.score -= 15;
    } else if (edgeDensity > LOGO_VALIDATION.WARN_EDGE_DENSITY) {
        validation.warnings.push(`Moderate complexity (${(edgeDensity * 100).toFixed(0)}% edge density). May be complex logo`);
        validation.score -= 5;
    }
    
    // 6. File format preference (already validated as JPG or PNG)
    if (fileType.includes('png')) {
        validation.score += 5; // PNG is preferred (supports transparency)
    } else if (fileType.includes('jpeg') || fileType.includes('jpg')) {
        validation.warnings.push('JPEG format. PNG is preferred for logos (supports transparency)');
        // No score penalty - both are allowed
    }
    
    // Final score classification
    validation.score = Math.max(0, Math.min(100, validation.score));
    
    // Multi-factor rejection logic: Only reject if MULTIPLE criteria suggest it's not a logo
    // Score alone isn't enough - we need hard blockers (errors) to reject
    const hasHardBlockers = validation.errors.length > 0;
    const hasMultipleWarnings = validation.warnings.length >= 3;
    const veryLowScore = validation.score < 30;
    
    // Override isValid based on smarter logic
    if (hasHardBlockers) {
        // Format errors, dimension errors, or file size errors remain hard blocks
        validation.isValid = false;
    } else if (veryLowScore && hasMultipleWarnings) {
        // Only reject if score is very low AND multiple warning signals
        validation.isValid = false;
        validation.errors.push('Multiple quality indicators suggest this is not a logo');
    } else {
        // Otherwise, allow it through (even with warnings)
        validation.isValid = true;
    }
    
    if (validation.score >= 80) {
        validation.confidence = 'High confidence logo';
    } else if (validation.score >= 60) {
        validation.confidence = 'Likely logo';
    } else if (validation.score >= 40) {
        validation.confidence = 'Borderline - complex logo or illustration';
    } else if (validation.score >= 20) {
        validation.confidence = 'Likely not a logo (processing anyway)';
    } else {
        validation.confidence = 'Low quality image';
    }
    
    console.log('Logo Validation:', validation);
    
    return validation;
}

// Get Started View Functions
function showGetStartedView() {
    const getStartedView = document.getElementById('getStartedView');
    const logoProcessingView = document.getElementById('logoProcessingView');
    const resultsView = document.getElementById('processingResultsView');
    
    // Hide all other views first
    document.querySelectorAll('.view-container').forEach(view => {
        view.classList.remove('active');
    });
    
    // Show only get started view
    if (getStartedView) {
        getStartedView.classList.add('active');
    }
}

function showLogoProcessingView() {
    const getStartedView = document.getElementById('getStartedView');
    const logoProcessingView = document.getElementById('logoProcessingView');
    const resultsView = document.getElementById('processingResultsView');
    
    // Hide get started view
    if (getStartedView) {
        getStartedView.classList.remove('active');
    }
    
    // If there are saved batches, show them in the background
    if (processingBatches.length > 0) {
        if (resultsView) {
            resultsView.classList.add('active');
            // Render the saved batches
            renderProcessingResults();
        }
    }
    
    // Show upload view as overlay on top
    if (logoProcessingView) {
        logoProcessingView.classList.add('active');
        logoProcessingView.classList.add('overlay-mode');
        
        // Show close button
        const closeBtn = document.getElementById('logoProcessingClose');
        if (closeBtn) {
            closeBtn.style.display = 'flex';
        }
    }
}

function setupGetStarted() {
    const getStartedBtn = document.getElementById('getStartedBtn');
    const userNameInput = document.getElementById('userNameInput');
    
    if (!getStartedBtn || !userNameInput) return;
    
    // Enable/disable button based on input
    userNameInput.addEventListener('input', () => {
        if (userNameInput.value.trim()) {
            getStartedBtn.disabled = false;
        } else {
            getStartedBtn.disabled = true;
        }
    });
    
    // Handle continue button click
    getStartedBtn.addEventListener('click', () => {
        const name = userNameInput.value.trim();
        if (name) {
            // Save name to localStorage
            localStorage.setItem('userName', name);
            // Show logo processing view
            showLogoProcessingView();
        }
    });
    
    // Handle Enter key in input
    userNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const name = userNameInput.value.trim();
            if (name) {
                localStorage.setItem('userName', name);
                showLogoProcessingView();
            }
        }
    });
    
    // Disable button initially
    getStartedBtn.disabled = true;
}

// Settings Page Functions
function setupSettings() {
    const settingsSaveBtn = document.getElementById('settingsSaveBtn');
    const settingsNameInput = document.getElementById('settingsNameInput');
    const settingsConfirmation = document.getElementById('settingsConfirmation');
    
    if (!settingsSaveBtn || !settingsNameInput) return;
    
    // Store the original name for comparison
    let originalName = localStorage.getItem('userName') || '';
    
    // Load current name into input
    if (originalName) {
        settingsNameInput.value = originalName;
    }
    
    // Handle save button click
    settingsSaveBtn.addEventListener('click', () => {
        const newName = settingsNameInput.value.trim();
        if (newName && newName !== originalName) {
            // Name was changed
            localStorage.setItem('userName', newName);
            originalName = newName; // Update the original for future comparisons
            if (settingsConfirmation) {
                settingsConfirmation.textContent = `Name updated to ${newName}`;
            }
            console.log('Name updated to:', newName);
        } else if (settingsConfirmation) {
            // Name unchanged or empty - clear confirmation
            settingsConfirmation.textContent = '';
        }
    });
    
    // Handle Enter key in input
    settingsNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const newName = settingsNameInput.value.trim();
            if (newName && newName !== originalName) {
                // Name was changed
                localStorage.setItem('userName', newName);
                originalName = newName; // Update the original for future comparisons
                if (settingsConfirmation) {
                    settingsConfirmation.textContent = `Name updated to ${newName}`;
                }
                console.log('Name updated to:', newName);
            } else if (settingsConfirmation) {
                // Name unchanged or empty - clear confirmation
                settingsConfirmation.textContent = '';
            }
        }
    });
}

// Store uploaded images
let uploadedImages = [];
let originalImages = []; // Store original versions before processing
const MAX_IMAGES = 8;
let processingTimestamp = null;
let processingBatches = []; // Store all processing batches
const MAX_BATCHES = 10; // Keep only the most recent 10 batches

// Logo Validation Thresholds
const LOGO_VALIDATION = {
    MAX_COLORS: 50,           // Maximum unique colors
    WARN_COLORS: 20,          // Warning threshold for colors
    MAX_EDGE_DENSITY: 0.40,   // Maximum edge pixel ratio (40%)
    WARN_EDGE_DENSITY: 0.25,  // Warning threshold (25%)
    MAX_FILE_SIZE: 5 * 1024 * 1024,  // 5MB
    WARN_FILE_SIZE: 2 * 1024 * 1024, // 2MB
    MAX_DIMENSION: 2500,      // Maximum width or height (industry standard for logos)
    MIN_DIMENSION: 150,       // Minimum width or height (required for quality)
    MAX_SIZE_EFFICIENCY: 0.5, // KB per 1000 pixels
    ALLOWED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png'] // Only JPG and PNG
};

// Debug function to show batch count in UI (hidden by default, press Shift+D to toggle)
function updateDebugInfo() {
    const stored = localStorage.getItem('processingBatches');
    let storedCount = 0;
    if (stored) {
        try {
            storedCount = JSON.parse(stored).length;
        } catch (e) {}
    }
    
    // Create or update debug display
    let debugEl = document.getElementById('batchDebug');
    if (!debugEl) {
        debugEl = document.createElement('div');
        debugEl.id = 'batchDebug';
        debugEl.style.cssText = 'position: fixed; top: 80px; right: 20px; background: #2a2a2a; color: #00ff00; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 13px; z-index: 10000; border: 2px solid #00ff00; min-width: 250px; display: none;';
        document.body.appendChild(debugEl);
        
        // Add keyboard shortcut to toggle debug (Shift+D)
        document.addEventListener('keydown', (e) => {
            if (e.shiftKey && e.key === 'D') {
                debugEl.style.display = debugEl.style.display === 'none' ? 'block' : 'none';
            }
        });
    }
    
    debugEl.innerHTML = `
        <div style="margin-bottom: 8px;"><strong>🔍 Debug Info (Shift+D to hide)</strong></div>
        <div>Memory: ${processingBatches.length} batches</div>
        <div>Storage: ${storedCount} batches</div>
        <div style="margin-top: 8px; font-size: 11px; color: #888;">
            ${processingBatches.map((b, i) => `Batch ${i+1}: ${b.processed?.length || 0} logos`).join('<br>')}
        </div>
    `;
}

// Load batches from localStorage on page load
// Re-filter color palettes for batches loaded from localStorage
// This fixes old batches saved before strict contrast filtering
async function refilterCachedBatchColors() {
    console.log('🎨 Re-filtering cached batch colors for better contrast...');
    let refiltered = 0;
    
    for (const batch of processingBatches) {
        if (!batch.processed) continue;
        
        for (const item of batch.processed) {
            // Skip failed items or items without colors/processedUrl
            if (item.failed || !item.colors || !item.processedUrl || item.colors.length === 0) {
                continue;
            }
            
            try {
                // Calculate logo brightness
                const logoBrightness = await getLogoBrightness(item.processedUrl);
                
                // Store it for use during rendering
                item.logoBrightness = logoBrightness;
                
                // Store original colors if not already stored
                if (!item.originalColors) {
                    item.originalColors = [...item.colors];
                }
                
                // Re-filter the colors (pass originalColors for similarity check)
                const filteredColors = filterColorsByLogoContrast(item.colors, logoBrightness, item.originalColors);
                
                // Only update if we actually filtered some out
                if (filteredColors.length < item.colors.length) {
                    console.log(`  Refiltered: ${item.colors.length} → ${filteredColors.length} colors`);
                    item.colors = filteredColors.length > 0 ? filteredColors : item.colors;
                    refiltered++;
                }
            } catch (error) {
                console.error('Error refiltering colors:', error);
                // Continue with next item
            }
        }
    }
    
    if (refiltered > 0) {
        console.log(`✓ Refiltered ${refiltered} images, saving to storage...`);
        saveBatchesToStorage();
    } else {
        console.log('✓ No colors needed refiltering');
    }
}

async function loadBatchesFromStorage() {
    console.log('🔄 loadBatchesFromStorage called');
    try {
        const stored = localStorage.getItem('processingBatches');
        console.log('Raw stored data exists:', !!stored);
        
        if (stored) {
            processingBatches = JSON.parse(stored);
            console.log('Parsed batches:', processingBatches.length);
            
            // Convert timestamp strings back to Date objects
            processingBatches.forEach(batch => {
                if (typeof batch.timestamp === 'string') {
                    batch.timestamp = new Date(batch.timestamp);
                }
            });
            
            // Re-filter color palettes for old cached batches
            // This fixes batches saved before the strict contrast filtering was implemented
            await refilterCachedBatchColors();
            
            console.log(`✓ Loaded ${processingBatches.length} batches from storage`);
            
            // Render the loaded batches
            if (processingBatches.length > 0) {
                renderProcessingResults();
            }
        } else {
            console.log('No stored batches found, starting fresh');
        }
    } catch (error) {
        console.error('❌ Error loading batches from storage:', error);
        processingBatches = [];
    }
    updateDebugInfo();
}

// Save batches to localStorage
function saveBatchesToStorage() {
    try {
        // Keep only the most recent MAX_BATCHES
        if (processingBatches.length > MAX_BATCHES) {
            processingBatches = processingBatches.slice(0, MAX_BATCHES);
        }
        
        console.log('Attempting to save batches:', processingBatches);
        const jsonString = JSON.stringify(processingBatches);
        console.log('JSON string length:', jsonString.length, 'bytes =', (jsonString.length / 1024 / 1024).toFixed(2), 'MB');
        
        // Check if too large for localStorage (usually 5-10MB limit)
        if (jsonString.length > 5000000) {
            console.error('⚠️ Data too large for localStorage! Reducing to 2 batches...');
            processingBatches = processingBatches.slice(0, 2);
            const reducedString = JSON.stringify(processingBatches);
            localStorage.setItem('processingBatches', reducedString);
            console.log(`✓ Saved ${processingBatches.length} batches (reduced)`);
        } else {
            localStorage.setItem('processingBatches', jsonString);
            console.log(`✓ Saved ${processingBatches.length} batches to storage`);
        }
        
        // Verify it was saved
        const verify = localStorage.getItem('processingBatches');
        console.log('Verification - stored data exists:', !!verify);
        if (verify) {
            const parsed = JSON.parse(verify);
            console.log('Verification - batches in storage:', parsed.length);
        }
        
        updateDebugInfo();
    } catch (error) {
        console.error('❌ Error saving batches to storage:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        
        // If quota exceeded, try saving just 1 batch
        if (error.name === 'QuotaExceededError') {
            console.log('Quota exceeded - trying with just 1 batch...');
            try {
                processingBatches = processingBatches.slice(0, 1);
                localStorage.setItem('processingBatches', JSON.stringify(processingBatches));
                console.log('✓ Saved 1 batch (quota limit)');
            } catch (e) {
                console.error('❌ Still failed:', e);
            }
        }
        
        updateDebugInfo();
    }
}

function setupLogoProcessingUpload() {
    const uploadArea = document.getElementById('logoUploadArea');
    const fileInput = document.getElementById('logoProcessingInput');
    const searchInput = document.getElementById('logoSearchInput');
    const previewGrid = document.getElementById('logoPreviewGrid');
    const continueContainer = document.getElementById('logoContinueContainer');
    const continueBtn = document.getElementById('logoContinueBtn');
    
    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.background = 'rgba(255, 255, 255, 0.05)';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.background = '';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.background = '';
        
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (files.length > 0) {
            handleLogoProcessingFiles(files);
        }
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
        if (files.length > 0) {
            handleLogoProcessingFiles(files);
        }
        fileInput.value = ''; // Reset input
    });
    
    // Continue button
    if (continueBtn) {
        continueBtn.addEventListener('click', async () => {
            if (uploadedImages.length === 0) {
                showToast('Please upload at least one image');
                return;
            }
            
            console.log('Processing images with remove.bg:', uploadedImages);
            await processImagesWithRemoveBg();
        });
    }
    
    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.trim();
            if (searchTerm.length > 0) {
                console.log('Searching for:', searchTerm);
                // TODO: Implement actual search functionality
            }
        });
        
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = e.target.value.trim();
                if (searchTerm.length > 0) {
                    handleLogoSearch(searchTerm);
                }
            }
        });
    }
}

async function handleLogoProcessingFiles(files) {
    const previewGrid = document.getElementById('logoPreviewGrid');
    const continueContainer = document.getElementById('logoContinueContainer');
    const errorDisplay = document.getElementById('logoValidationError');
    
    // Clear any previous errors
    if (errorDisplay) {
        errorDisplay.style.display = 'none';
        errorDisplay.textContent = '';
    }
    
    // Add files up to max limit
    for (let i = 0; i < files.length && uploadedImages.length < MAX_IMAGES; i++) {
        const file = files[i];
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            const imageUrl = e.target.result;
            
            // Validate the image
            const validation = await validateLogoImage(file, imageUrl);
            
            // If validation failed, show error in UI and skip
            if (!validation.isValid) {
                const errorMsg = validation.errors.join('. ');
                if (errorDisplay) {
                    errorDisplay.textContent = errorMsg;
                    errorDisplay.style.display = 'block';
                }
                console.warn('Image rejected:', file.name, validation);
                return;
            }
            
            // If there are warnings, log them but continue
            if (validation.warnings.length > 0) {
                console.warn(`⚠️ ${file.name}:`, validation.warnings);
            }
            
            const imageData = {
                id: Date.now() + Math.random(),
                url: imageUrl,
                file: file,
                validation: validation // Store validation results
            };
            
            uploadedImages.push(imageData);
            renderImagePreviews();
            
            // Show preview grid and continue button
            previewGrid.style.display = 'grid';
            continueContainer.style.display = 'flex';
            
            // Clear error on successful upload
            if (errorDisplay) {
                errorDisplay.style.display = 'none';
                errorDisplay.textContent = '';
            }
        };
        
        reader.readAsDataURL(file);
    }
    
    if (uploadedImages.length >= MAX_IMAGES) {
        if (errorDisplay) {
            errorDisplay.textContent = `Maximum ${MAX_IMAGES} images reached`;
            errorDisplay.style.display = 'block';
        }
    }
}

function renderImagePreviews() {
    const previewGrid = document.getElementById('logoPreviewGrid');
    previewGrid.innerHTML = '';
    
    uploadedImages.forEach((image, index) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'logo-preview-item';
        
        const img = document.createElement('img');
        img.src = image.url;
        img.alt = `Preview ${index + 1}`;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'logo-preview-remove';
        removeBtn.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
        `;
        
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeImage(image.id);
        });
        
        previewItem.appendChild(img);
        previewItem.appendChild(removeBtn);
        previewGrid.appendChild(previewItem);
    });
}

function removeImage(imageId) {
    uploadedImages = uploadedImages.filter(img => img.id !== imageId);
    renderImagePreviews();
    
    // Hide grid and continue button if no images
    if (uploadedImages.length === 0) {
        document.getElementById('logoPreviewGrid').style.display = 'none';
        document.getElementById('logoContinueContainer').style.display = 'none';
    }
}

function handleLogoSearch(searchTerm) {
    console.log('Searching for business:', searchTerm);
    showToast(`Searching for "${searchTerm}"...`);
    
    // TODO: Add actual search logic here
    // For now, just show a placeholder message
    setTimeout(() => {
        showToast('Search results coming soon!');
    }, 1500);
}

// Process images with remove.bg API
async function processImagesWithRemoveBg() {
    // Store original images before processing
    originalImages = uploadedImages.map(img => ({
        ...img,
        url: img.url // Keep original URL
    }));
    
    // Record processing timestamp
    processingTimestamp = new Date();
    
    // Check API key
    const apiKey = window.API_CONFIG?.removeBg?.apiKey;
    
    if (!apiKey || apiKey === 'YOUR_REMOVE_BG_API_KEY_HERE') {
        showToast('⚠️ Please add your remove.bg API key in config.js');
        console.error('Remove.bg API key not configured. Get your key at: https://www.remove.bg/api');
        return;
    }
    
    // Show spinner in Continue button
    const continueBtn = document.querySelector('.logo-continue-btn');
    const originalBtnText = continueBtn.textContent;
    continueBtn.innerHTML = '<span class="button-spinner"></span>';
    continueBtn.disabled = true;
    
    let successCount = 0;
    let errorCount = 0;
    
    // Initialize ColorThief
    const colorThief = new ColorThief();
    
    // Process each image
    for (let i = 0; i < uploadedImages.length; i++) {
        const image = uploadedImages[i];
        
        try {
            console.log(`Processing image ${i + 1}/${uploadedImages.length}...`);
            
            // Extract colors BEFORE background removal (from original image)
            const colors = await extractColorsFromImage(image.url, colorThief);
            uploadedImages[i].originalColors = colors; // Store unfiltered for similarity checking
            uploadedImages[i].colors = colors; // Will be filtered later
            uploadedImages[i].originalUrl = image.url; // Store original for background detection
            
            // Convert data URL to blob
            const blob = await dataURLtoBlob(image.url);
            
            // Create form data
            const formData = new FormData();
            formData.append('image_file', blob, image.file.name);
            formData.append('size', 'auto'); // Auto resolution
            formData.append('format', 'png'); // PNG output
            
            // Use remove.bg's built-in cropping and centering (uses 1 API credit)
            // Settings optimized for app icon style: centered, taking up most of frame
            formData.append('crop', 'true'); // Crop to foreground
            formData.append('crop_margin', '15%'); // 15% margin for breathing room
            formData.append('scale', '100%'); // Scale to fill frame
            formData.append('position', 'center'); // Center the subject
            
            // Call remove.bg API
            const response = await fetch('https://api.remove.bg/v1.0/removebg', {
                method: 'POST',
                headers: {
                    'X-Api-Key': apiKey
                },
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                const errorMsg = errorData.errors?.[0]?.title || 'API request failed';
                console.error('remove.bg API error:', errorData);
                
                // Determine user-friendly error reason
                let failureReason = errorMsg;
                if (response.status === 402) {
                    failureReason = 'No API credits remaining';
                } else if (response.status === 429) {
                    failureReason = 'Rate limit exceeded';
                } else if (response.status === 400) {
                    failureReason = 'Invalid image format or size';
                } else if (response.status === 500) {
                    failureReason = 'API service error';
                }
                
                // Mark this image as failed with reason
                uploadedImages[i].failed = true;
                uploadedImages[i].failureReason = failureReason;
                errorCount++;
                
                console.log(`Image ${i + 1} failed: ${failureReason}`);
                continue; // Skip to next image instead of throwing
            }
            
            // Extract credit information from response headers
            const creditsCharged = response.headers.get('X-Credits-Charged');
            const creditsRemaining = response.headers.get('X-RateLimit-Remaining');
            const creditsLimit = response.headers.get('X-RateLimit-Limit');
            
            // Store credit info (we'll use the last image's data for the batch)
            if (creditsRemaining !== null) {
                uploadedImages[i].creditsRemaining = parseInt(creditsRemaining);
                uploadedImages[i].creditsLimit = parseInt(creditsLimit);
                uploadedImages[i].creditsCharged = parseInt(creditsCharged);
            }
            
            // Get the processed image (background removed, cropped, and centered by remove.bg)
            const resultBlob = await response.blob();
            const resultUrl = URL.createObjectURL(resultBlob);
            
            // Update the image in our array
            uploadedImages[i].processedUrl = resultUrl;
            uploadedImages[i].processedBlob = resultBlob;
            uploadedImages[i].processed = true;
            
            // Calculate logo brightness to filter palette options
            const logoBrightness = await getLogoBrightness(resultUrl);
            
            // Store logo brightness for use during rendering
            uploadedImages[i].logoBrightness = logoBrightness;
            
            // Filter the palette options to remove clashing colors
            // This ensures the bubbles in the UI don't suggest low-contrast options
            // Pass the original colors for similarity checking against logo colors
            const filteredColors = filterColorsByLogoContrast(colors, logoBrightness, uploadedImages[i].originalColors);
            if (filteredColors.length > 0) {
                uploadedImages[i].colors = filteredColors;
                console.log(`Filtered palette from ${colors.length} to ${filteredColors.length} colors based on contrast`);
            }
            
            // Intelligently select best default background
            const bestBg = await selectBestDefaultBackground(
                uploadedImages[i].originalUrl,
                resultUrl,
                colors
            );
            uploadedImages[i].defaultBackground = bestBg;
            
            console.log(`Processed image ${i + 1}/${uploadedImages.length} - Extracted ${colors.length} colors from original, then removed background, cropped, and centered`);
            
            successCount++;
            
        } catch (error) {
            console.error(`Error processing image ${i + 1}:`, error);
            errorCount++;
            uploadedImages[i].failed = true;
            uploadedImages[i].failureReason = error.message || 'Unknown error occurred';
            uploadedImages[i].processed = false;
        }
    }
    
    // Restore button state
    continueBtn.innerHTML = originalBtnText;
    continueBtn.disabled = false;
    
    // Show error toast only if there were errors
    if (errorCount > 0) {
        showToast(`⚠️ Processed ${successCount} images, ${errorCount} failed`);
    }
    
    console.log('Processing complete:', { successCount, errorCount });
    
    // Get credit info from the last processed image
    const lastImage = uploadedImages[uploadedImages.length - 1];
    const creditsUsed = uploadedImages.length; // Each image = 1 credit
    
    // Convert blob URLs to compressed base64 data URLs for localStorage persistence
    console.log('Converting images to base64...');
    const processedWithDataUrls = [];
    
    for (let i = 0; i < uploadedImages.length; i++) {
        const img = uploadedImages[i];
        let dataUrl = img.processedUrl;
        
        // Convert blob URL to base64 with compression
        if (img.processedUrl && img.processedUrl.startsWith('blob:')) {
            try {
                const response = await fetch(img.processedUrl);
                const blob = await response.blob();
                
                // Create an image element to compress
                const imgElement = new Image();
                const blobUrl = URL.createObjectURL(blob);
                
                await new Promise((resolve, reject) => {
                    imgElement.onload = resolve;
                    imgElement.onerror = reject;
                    imgElement.src = blobUrl;
                });
                
                // Create canvas and compress to PNG
                const canvas = document.createElement('canvas');
                const maxSize = 600; // Max dimension (smaller to save space)
                let width = imgElement.width;
                let height = imgElement.height;
                
                // Scale down if too large
                if (width > maxSize || height > maxSize) {
                    if (width > height) {
                        height = (height / width) * maxSize;
                        width = maxSize;
                    } else {
                        width = (width / height) * maxSize;
                        height = maxSize;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                
                // Clear canvas to transparent
                ctx.clearRect(0, 0, width, height);
                
                // Draw image (preserves transparency)
                ctx.drawImage(imgElement, 0, 0, width, height);
                
                // Convert to PNG (preserves transparency)
                dataUrl = canvas.toDataURL('image/png');
                
                URL.revokeObjectURL(blobUrl);
                
                console.log(`✓ Image ${i + 1} compressed (${(dataUrl.length / 1024).toFixed(0)} KB)`);
            } catch (error) {
                console.error(`✗ Failed to convert image ${i + 1}:`, error);
                dataUrl = img.processedUrl; // Fallback to blob URL
            }
        }
        
        processedWithDataUrls.push({
            processedUrl: dataUrl,
            colors: img.colors || [],
            defaultBackground: img.defaultBackground,
            placeholder: false,
            failed: img.failed || false,
            failureReason: img.failureReason,
            originalUrl: img.originalUrl || originalImages[i]?.url
        });
    }
    
    console.log(`Converted ${processedWithDataUrls.length} images`);
    
    // Include both successful and failed images
    const allImages = processedWithDataUrls.map(img => {
        if (img.failed) {
            // For failed images, keep original URL and failure info
            return {
                failed: true,
                failureReason: img.failureReason,
                originalUrl: img.originalUrl || uploadedImages.find(u => u === img)?.url,
                colors: img.colors || []
            };
        } else {
            // For successful images, keep processed data
            return {
                processedUrl: img.processedUrl,
                colors: img.colors || [],
                defaultBackground: img.defaultBackground,
                placeholder: false
            };
        }
    });
    
    console.log(`${allImages.filter(i => !i.failed).length} succeeded, ${allImages.filter(i => i.failed).length} failed`);
    
    // Only save batch if we have at least one image (successful or failed)
    if (allImages.length === 0) {
        console.error('No images to save');
        return;
    }
    
    // Save this batch
    const batch = {
        timestamp: processingTimestamp,
        userName: localStorage.getItem('userName') || 'Unknown',
        processed: allImages,
        creditsUsed: creditsUsed,
        creditsRemaining: lastImage?.creditsRemaining,
        creditsLimit: lastImage?.creditsLimit
    };
    
    // Reload from storage first to ensure we have the latest data
    loadBatchesFromStorage();
    
    // Clean out any existing failed batches before adding new one
    processingBatches = processingBatches.filter(batch => {
        return batch.processed?.every(p => p.processedUrl && 
                                           (p.processedUrl.startsWith('data:') || p.processedUrl.startsWith('blob:')));
    });
    
    // Add to beginning of batches array (newest first)
    console.log('Before unshift - processingBatches.length:', processingBatches.length);
    processingBatches.unshift(batch);
    console.log('After unshift - processingBatches.length:', processingBatches.length);
    console.log('All batches:', processingBatches.map(b => b.timestamp));
    
    // Save to localStorage
    saveBatchesToStorage();
    
    // Log success message (no toast)
    console.log(`✅ Batch saved! Total batches in storage: ${processingBatches.length}`);
    
    // Show processing results screen
    setTimeout(() => {
        showProcessingResults();
    }, 500);
}

// Helper function to convert data URL to Blob
function dataURLtoBlob(dataURL) {
    return new Promise((resolve, reject) => {
        fetch(dataURL)
            .then(res => res.blob())
            .then(blob => resolve(blob))
            .catch(err => reject(err));
    });
}

// Calculate relative luminance for WCAG contrast formula
function getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Get adaptive outline based on card background luminance (WCAG AA 3:1 compliant)
function getAdaptiveOutline(backgroundColor) {
    let r, g, b;
    
    // Handle both hex and rgb/rgba formats
    if (backgroundColor.startsWith('#')) {
        // Parse hex color to RGB
        const hex = backgroundColor.replace('#', '');
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    } else if (backgroundColor.startsWith('rgb')) {
        // Parse rgb/rgba format: rgb(255, 255, 255) or rgba(255, 255, 255, 1)
        const matches = backgroundColor.match(/\d+/g);
        if (matches && matches.length >= 3) {
            r = parseInt(matches[0]);
            g = parseInt(matches[1]);
            b = parseInt(matches[2]);
        } else {
            // Fallback to white
            r = g = b = 255;
        }
    } else {
        // Fallback to white
        r = g = b = 255;
    }
    
    // Calculate relative luminance (0.0 - 1.0)
    const luminance = getLuminance(r, g, b);
    
    console.log(`🎨 Adaptive Outline: ${backgroundColor} → Luminance: ${luminance.toFixed(3)}`);
    
    // Apply outline rules based on luminance ranges
    // Based on WCAG non-text contrast standards
    
    if (luminance >= 0.00 && luminance <= 0.18) {
        // Very dark/black: White outline at 45%
        console.log('   → Very dark: White at 45%');
        return { color: '#FFFFFF', opacity: 0.45 };
    } else if (luminance > 0.18 && luminance <= 0.35) {
        // Dark: White outline at 35%
        console.log('   → Dark: White at 35%');
        return { color: '#FFFFFF', opacity: 0.35 };
    } else if (luminance > 0.35 && luminance <= 0.65) {
        // Medium: Higher contrast (black or white based on which provides better contrast)
        // For mid-tones, we calculate which provides better contrast
        const whiteContrast = getContrastRatio([255, 255, 255], [r, g, b]);
        const blackContrast = getContrastRatio([0, 0, 0], [r, g, b]);
        
        if (whiteContrast > blackContrast) {
            console.log('   → Medium: White at 25%');
            return { color: '#FFFFFF', opacity: 0.25 };
        } else {
            console.log('   → Medium: Black at 25%');
            return { color: '#000000', opacity: 0.25 };
        }
    } else if (luminance > 0.65 && luminance <= 0.82) {
        // Light: Black outline at 35%
        console.log('   → Light: Black at 35%');
        return { color: '#000000', opacity: 0.35 };
    } else {
        // Very light/white: Black outline at 50%
        console.log('   → Very light: Black at 50%');
        return { color: '#000000', opacity: 0.50 };
    }
}

// Calculate contrast ratio between two colors
function getContrastRatio(rgb1, rgb2) {
    const lum1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
    const lum2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
}

// Check if color has sufficient contrast for legibility
function hasGoodContrast(rgb) {
    // Check contrast against typical logo colors (white and black)
    const whiteContrast = getContrastRatio(rgb, [255, 255, 255]);
    const blackContrast = getContrastRatio(rgb, [0, 0, 0]);
    
    // WCAG AA requires 3:1 for large text/graphics
    // We use 2.5:1 as threshold to ensure logos remain visible
    const minContrast = 2.5;
    
    return whiteContrast >= minContrast || blackContrast >= minContrast;
}

// Detect if a color is likely a background color (appears at edges)
function detectBackgroundColor(imageUrl) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                // Sample pixels from edges (corners and midpoints)
                const edgePixels = [];
                const samplePoints = [
                    [0, 0], // Top-left
                    [img.width - 1, 0], // Top-right
                    [0, img.height - 1], // Bottom-left
                    [img.width - 1, img.height - 1], // Bottom-right
                    [Math.floor(img.width / 2), 0], // Top-middle
                    [Math.floor(img.width / 2), img.height - 1], // Bottom-middle
                    [0, Math.floor(img.height / 2)], // Left-middle
                    [img.width - 1, Math.floor(img.height / 2)] // Right-middle
                ];
                
                for (const [x, y] of samplePoints) {
                    const pixel = ctx.getImageData(x, y, 1, 1).data;
                    edgePixels.push([pixel[0], pixel[1], pixel[2]]);
                }
                
                // Find most common edge color
                const colorCounts = {};
                for (const rgb of edgePixels) {
                    const key = `${rgb[0]},${rgb[1]},${rgb[2]}`;
                    colorCounts[key] = (colorCounts[key] || 0) + 1;
                }
                
                // Get most frequent edge color
                let maxCount = 0;
                let bgColor = null;
                for (const [key, count] of Object.entries(colorCounts)) {
                    if (count > maxCount) {
                        maxCount = count;
                        const [r, g, b] = key.split(',').map(Number);
                        bgColor = [r, g, b];
                    }
                }
                
                // If most edges have same color (>50%), it's likely the background
                if (maxCount >= samplePoints.length * 0.5 && bgColor) {
                    const r = bgColor[0].toString(16).padStart(2, '0');
                    const g = bgColor[1].toString(16).padStart(2, '0');
                    const b = bgColor[2].toString(16).padStart(2, '0');
                    resolve({ color: `#${r}${g}${b}`, confidence: maxCount / samplePoints.length });
                } else {
                    resolve(null);
                }
            } catch (error) {
                console.error('Error detecting background:', error);
                resolve(null);
            }
        };
        
        img.onerror = () => resolve(null);
        img.src = imageUrl;
    });
}

// Get average brightness of logo (after background removal)
function getLogoBrightness(imageUrl) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixels = imageData.data;
                
                let totalBrightness = 0;
                let opaquePixels = 0;
                
                // Calculate average brightness of non-transparent pixels
                for (let i = 0; i < pixels.length; i += 4) {
                    const alpha = pixels[i + 3];
                    if (alpha > 20) { // Count almost all visible pixels (improved for thin logos)
                        const r = pixels[i];
                        const g = pixels[i + 1];
                        const b = pixels[i + 2];
                        // Perceived brightness formula
                        const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
                        totalBrightness += brightness;
                        opaquePixels++;
                    }
                }
                
                const avgBrightness = opaquePixels > 0 ? totalBrightness / opaquePixels : 128;
                resolve(avgBrightness); // 0-255 scale
            } catch (error) {
                console.error('Error calculating brightness:', error);
                resolve(128); // Default to middle brightness
            }
        };
        
        img.onerror = () => resolve(128);
        img.src = imageUrl;
    });
}

// Filter extracted colors to ensure they have good contrast against the logo
function filterColorsByLogoContrast(colors, logoBrightness, allLogoColors = []) {
    const filteredColors = [];
    
    console.log(`🎨 FILTERING COLORS - Logo brightness: ${logoBrightness.toFixed(0)}`);
    console.log(`🎨 Input colors:`, colors);
    
    // Alert for debugging - shows logo brightness
    if (logoBrightness !== undefined) {
        console.log(`⚠️ FILTER CALLED: Logo brightness = ${logoBrightness.toFixed(0)}`);
    } else {
        console.error(`❌ ERROR: logoBrightness is undefined!`);
        return colors; // Return original if brightness calc failed
    }
    
    for (const hex of colors) {
        const rgb = hexToRgb(hex);
        if (!rgb) {
            console.log(`⚠️ Skipping ${hex} - invalid hex`);
            continue;
        }
        
        const bgBrightness = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]);
        const diff = Math.abs(logoBrightness - bgBrightness);
        
        console.log(`  Testing ${hex}: bg=${bgBrightness.toFixed(0)}, diff=${diff.toFixed(0)}`);
        
        // STRICT categorical rules to prevent clashing:
        // 1. If background is very dark (< 60), logo MUST be very bright (> 150)
        if (bgBrightness < 60 && logoBrightness < 150) {
            console.log(`  ❌ FILTERED ${hex} - dark bg (${bgBrightness.toFixed(0)}) with non-bright logo (${logoBrightness.toFixed(0)})`);
            continue;
        }
        
        // 2. If background is very bright (> 195), logo MUST be dark (< 100)
        if (bgBrightness > 195 && logoBrightness > 100) {
            console.log(`  ❌ FILTERED ${hex} - bright bg (${bgBrightness.toFixed(0)}) with non-dark logo (${logoBrightness.toFixed(0)})`);
            continue;
        }
        
        // 3. General high contrast requirement (brightness)
        if (diff < 100) {
            console.log(`  ❌ FILTERED ${hex} - insufficient brightness contrast (${diff.toFixed(0)} < 100)`);
            continue;
        }
        
        // 4. Color similarity check (prevents red logo on red background)
        // If this color is being considered as a background, but it's also a logo color,
        // it will make that part of the logo invisible - REJECT IT
        let similarityCount = 0;
        for (const logoColor of allLogoColors) {
            const logoRgb = hexToRgb(logoColor);
            if (!logoRgb) continue;
            
            const colorDiff = getColorDifference(rgb, logoRgb);
            // Very strict threshold - if background is similar to ANY logo color, it's risky
            if (colorDiff < 150) {
                console.log(`  ⚠️ ${hex} similar to logo color ${logoColor} (diff: ${colorDiff})`);
                similarityCount++;
            }
        }
        
        // If this color is similar to 1 or more extracted logo colors, reject it
        // This prevents using logo colors as backgrounds
        if (similarityCount > 0) {
            console.log(`  ❌ FILTERED ${hex} - matches ${similarityCount} logo color(s), likely a logo color`);
            continue;
        }
        
        // Passed all checks
        console.log(`  ✅ KEPT ${hex} - good contrast (${diff.toFixed(0)})`);
        filteredColors.push(hex);
    }
    
    console.log(`🎨 RESULT: ${colors.length} → ${filteredColors.length} colors`);
    console.log(`🎨 Output colors:`, filteredColors);
    
    return filteredColors;
}

// Intelligently select best default background color
async function selectBestDefaultBackground(originalImageUrl, processedImageUrl, extractedColors) {
    // Step 1: Try to detect original background color from edges
    const detectedBg = await detectBackgroundColor(originalImageUrl);
    
    if (detectedBg && detectedBg.confidence > 0.6) {
        // High confidence background detected - STRONGLY prefer this
        const bgColor = detectedBg.color;
        
        console.log(`✓ Detected original background: ${bgColor} (confidence: ${(detectedBg.confidence * 100).toFixed(0)}%)`);
        
        // Check if this color is in the extracted palette (strong signal it's right)
        const isInPalette = extractedColors.some(c => {
            const diff = getColorDifference(
                hexToRgb(bgColor),
                hexToRgb(c)
            );
            return diff < 30; // Very close match
        });
        
        if (isInPalette) {
            console.log(`✓ Detected background is in ColorThief palette - using it!`);
            return bgColor;
        }
        
        // Use the detected background UNLESS it's clearly wrong for legibility
        // (e.g., white logo on white background)
        const logoBrightness = await getLogoBrightness(processedImageUrl);
        const bgRgb = [
            parseInt(bgColor.slice(1, 3), 16),
            parseInt(bgColor.slice(3, 5), 16),
            parseInt(bgColor.slice(5, 7), 16)
        ];
        const bgBrightness = (0.299 * bgRgb[0] + 0.587 * bgRgb[1] + 0.114 * bgRgb[2]);
        
        // Check if logo and background are too similar in brightness
        const brightnessDiff = Math.abs(logoBrightness - bgBrightness);
        
        // More lenient threshold - only reject if REALLY similar (< 50)
        if (brightnessDiff < 50) {
            // Logo and background are too similar - would be illegible
            console.log(`⚠️ Detected background too similar to logo (diff: ${brightnessDiff.toFixed(0)}), choosing opposite`);
            // Use opposite: if bg is dark, use white; if bg is light, use black
            if (bgBrightness < 128) {
                return '#FFFFFF';
            } else {
                return '#000000';
            }
        }
        
        // Detected background has good contrast - use it!
        console.log(`✓ Using detected background (good contrast, diff: ${brightnessDiff.toFixed(0)})`);
        return bgColor;
    }
    
    // Step 2: Fallback to legibility-based selection
    const logoBrightness = await getLogoBrightness(processedImageUrl);
    
    // If logo is light (> 128), prefer DARK background for contrast
    // If logo is dark (< 128), prefer LIGHT background for contrast
    if (logoBrightness > 128) {
        console.log(`Logo is light (brightness: ${logoBrightness.toFixed(0)}), defaulting to black`);
        return '#000000';
    } else {
        console.log(`Logo is dark (brightness: ${logoBrightness.toFixed(0)}), defaulting to white`);
        return '#FFFFFF';
    }
}

// Extract colors from image using ColorThief
// Convert hex color to RGB array
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}

// Calculate color difference using Delta E (simplified)
function getColorDifference(rgb1, rgb2) {
    // Simple Euclidean distance in RGB space
    // A more accurate method would use LAB color space, but this is sufficient
    const rDiff = rgb1[0] - rgb2[0];
    const gDiff = rgb1[1] - rgb2[1];
    const bDiff = rgb1[2] - rgb2[2];
    
    return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

// Check if a color is significantly different from existing colors
function isSignificantlyDifferent(newRgb, existingRgbs, threshold = 60) {
    // Threshold of 60 means colors must be at least this different
    // Range: 0 (identical) to ~441 (max difference in RGB space)
    
    for (const existingRgb of existingRgbs) {
        const diff = getColorDifference(newRgb, existingRgb);
        if (diff < threshold) {
            return false; // Too similar to an existing color
        }
    }
    return true; // Significantly different from all existing colors
}

async function extractColorsFromImage(imageUrl, colorThief) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        
        img.onload = () => {
            try {
                // Get more colors to have options after filtering (20 instead of 10)
                const palette = colorThief.getPalette(img, 20);
                
                // Filter for distinct colors with good contrast
                const distinctColors = [];
                const distinctRgbs = [];
                
                for (const rgb of palette) {
                    // Check if color has good contrast AND is significantly different
                    if (hasGoodContrast(rgb) && isSignificantlyDifferent(rgb, distinctRgbs)) {
                        const r = rgb[0].toString(16).padStart(2, '0');
                        const g = rgb[1].toString(16).padStart(2, '0');
                        const b = rgb[2].toString(16).padStart(2, '0');
                        distinctColors.push(`#${r}${g}${b}`);
                        distinctRgbs.push(rgb);
                        
                        // Stop at 5 colors (leaving room for white/black = max 7 total)
                        if (distinctColors.length >= 5) break;
                    }
                }
                
                // If we still don't have enough colors, lower the threshold
                if (distinctColors.length < 3) {
                    distinctColors.length = 0;
                    distinctRgbs.length = 0;
                    
                    for (const rgb of palette) {
                        if (hasGoodContrast(rgb) && isSignificantlyDifferent(rgb, distinctRgbs, 40)) {
                            const r = rgb[0].toString(16).padStart(2, '0');
                            const g = rgb[1].toString(16).padStart(2, '0');
                            const b = rgb[2].toString(16).padStart(2, '0');
                            distinctColors.push(`#${r}${g}${b}`);
                            distinctRgbs.push(rgb);
                            
                            // Stop at 5 colors (leaving room for white/black = max 7 total)
                            if (distinctColors.length >= 5) break;
                        }
                    }
                }
                
                console.log(`Extracted ${distinctColors.length} distinct colors (filtered for contrast & uniqueness)`);
                resolve(distinctColors);
            } catch (error) {
                console.error('Error extracting colors:', error);
                resolve([]); // Return empty array on error
            }
        };
        
        img.onerror = () => {
            console.error('Error loading image for color extraction');
            resolve([]); // Return empty array on error
        };
        
        img.src = imageUrl;
    });
}

// Center logo in frame using Canvas
async function centerLogoInFrame(imageUrl, frameSize = 600) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            // Create canvas
            const canvas = document.createElement('canvas');
            canvas.width = frameSize;
            canvas.height = frameSize;
            const ctx = canvas.getContext('2d');
            
            // Calculate scaling to fit within frame with padding
            const padding = 40; // 40px padding on each side
            const maxSize = frameSize - (padding * 2);
            
            let width = img.width;
            let height = img.height;
            
            // Scale down if image is larger than max size
            if (width > maxSize || height > maxSize) {
                const scale = Math.min(maxSize / width, maxSize / height);
                width = width * scale;
                height = height * scale;
            }
            
            // Calculate centered position
            const x = (frameSize - width) / 2;
            const y = (frameSize - height) / 2;
            
            // Draw image centered on canvas
            ctx.drawImage(img, x, y, width, height);
            
            // Convert to blob
            canvas.toBlob((blob) => {
                if (blob) {
                    const centeredUrl = URL.createObjectURL(blob);
                    resolve({ url: centeredUrl, blob: blob });
                } else {
                    reject(new Error('Failed to create blob'));
                }
            }, 'image/png');
        };
        
        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };
        
        img.src = imageUrl;
    });
}

// Download processed image as high-res PNG
function downloadProcessedImage(blob, originalFilename, index) {
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Generate filename: remove extension and add _processed suffix
    const nameWithoutExt = originalFilename.replace(/\.[^/.]+$/, '');
    const filename = `${nameWithoutExt}_processed_${index}.png`;
    
    link.href = url;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    
    // Note: Browser will save to default Downloads folder
    // User can manually organize into "processed" subfolder
    console.log(`Downloaded: ${filename}`);
}

// Select background color for processed logo
function selectBackgroundColor(batchIndex, imageIndex, color, buttonElement) {
    // Find the image container
    const imgContainer = document.querySelector(
        `.processed-logo-image[data-batch-index="${batchIndex}"][data-image-index="${imageIndex}"]`
    );
    
    if (!imgContainer) return;
    
    // Update background
    imgContainer.style.backgroundColor = color;
    
    // Apply adaptive outline based on new background color luminance
    const outline = getAdaptiveOutline(color);
    const outlineRgba = outline.color === '#FFFFFF' 
        ? `rgba(255, 255, 255, ${outline.opacity})`
        : `rgba(0, 0, 0, ${outline.opacity})`;
    imgContainer.style.border = `0.5px solid ${outlineRgba}`;
    
    // Update active state on buttons
    const bgColorRow = buttonElement.parentElement;
    bgColorRow.querySelectorAll('.bg-color-option').forEach(btn => {
        btn.classList.remove('active');
    });
    buttonElement.classList.add('active');
    
    // Update text label to show hex value
    const selectorWrapper = bgColorRow.parentElement;
    const textLabel = selectorWrapper.querySelector('.bg-color-hex-label');
    if (textLabel) {
        textLabel.textContent = color.toUpperCase();
    }
    
    // Update the batch data and save to localStorage
    if (processingBatches[batchIndex] && processingBatches[batchIndex].processed[imageIndex]) {
        processingBatches[batchIndex].processed[imageIndex].defaultBackground = color;
        saveBatchesToStorage();
    }
}

// Render processing results (can be called independently)
function renderProcessingResults() {
    // Render all batches
    const container = document.querySelector('.processing-results-container');
    container.innerHTML = '';
    
    console.log(`Rendering ${processingBatches.length} batches`, processingBatches);
    
    if (processingBatches.length === 0) {
        console.warn('No batches to render!');
        return;
    }
    
    processingBatches.forEach((batch, batchIndex) => {
        console.log(`Rendering batch ${batchIndex}:`, batch);
        // Create batch container
        const batchEl = document.createElement('div');
        batchEl.className = 'processing-batch';
        
        // Timestamp and credits row
        const headerRow = document.createElement('div');
        headerRow.className = 'processing-header-row';
        
        const timestampEl = document.createElement('div');
        timestampEl.className = 'processing-timestamp';
        const formatted = formatProcessingTimestamp(batch.timestamp);
        const userName = batch.userName || localStorage.getItem('userName') || 'Unknown';
        timestampEl.textContent = `Processed ${formatted} by ${userName}`;
        headerRow.appendChild(timestampEl);
        
        // Credits info
        if (batch.creditsRemaining !== undefined) {
            const creditsEl = document.createElement('div');
            creditsEl.className = 'processing-credits';
            creditsEl.textContent = `Credits used: ${batch.creditsUsed}`;
            headerRow.appendChild(creditsEl);
        }
        
        batchEl.appendChild(headerRow);
        
        // Content wrapper
        const contentEl = document.createElement('div');
        contentEl.className = 'processing-results-content';
        
        // Processed logos grid (no "Original" section)
        const processedGrid = document.createElement('div');
        processedGrid.className = 'processed-logos-grid';
        
        batch.processed.forEach((image, imageIndex) => {
            const item = document.createElement('div');
            item.className = 'processed-logo-item';
            
            // Check if this image failed processing
            if (image.failed) {
                // Show failure state with original logo and reason
                const failedSection = document.createElement('div');
                failedSection.className = 'processing-failed-section';
                
                const failedHeader = document.createElement('div');
                failedHeader.className = 'processing-failed-header';
                failedHeader.textContent = 'Processing failed';
                failedSection.appendChild(failedHeader);
                
                const failedReason = document.createElement('div');
                failedReason.className = 'processing-failed-reason';
                failedReason.textContent = `Reason: ${image.failureReason || 'Unknown error'}`;
                failedSection.appendChild(failedReason);
                
                item.appendChild(failedSection);
                
                // Show original logo
                if (image.originalUrl) {
                    const originalImg = document.createElement('img');
                    originalImg.src = image.originalUrl;
                    originalImg.className = 'processing-failed-image';
                    originalImg.alt = 'Original Logo';
                    item.appendChild(originalImg);
                }
                
                processedGrid.appendChild(item);
                return; // Skip normal rendering for failed images
            }
            
            // Logo image container with background (for successful processing)
            if (image.processedUrl) {
                const imgContainer = document.createElement('div');
                imgContainer.className = 'processed-logo-image';
                imgContainer.dataset.batchIndex = batchIndex;
                imgContainer.dataset.imageIndex = imageIndex;
                
                // Set intelligent default background
                const defaultBg = image.defaultBackground || '#FFFFFF';
                imgContainer.style.backgroundColor = defaultBg;
                
                // Apply adaptive outline based on luminance
                const outline = getAdaptiveOutline(defaultBg);
                const outlineRgba = outline.color === '#FFFFFF' 
                    ? `rgba(255, 255, 255, ${outline.opacity})`
                    : `rgba(0, 0, 0, ${outline.opacity})`;
                imgContainer.style.border = `0.5px solid ${outlineRgba}`;
                
                const img = document.createElement('img');
                img.src = image.processedUrl;
                img.alt = 'Processed Logo';
                
                // Debug: Log if image fails to load
                img.onerror = () => {
                    console.error(`Failed to load image for batch ${batchIndex}, image ${imageIndex}`);
                    console.error('Image URL:', image.processedUrl?.substring(0, 100) + '...');
                };
                
                img.onload = () => {
                    console.log(`✓ Image loaded for batch ${batchIndex}, image ${imageIndex}`);
                };
                
                imgContainer.appendChild(img);
                
                // Add click handler for lightbox
                imgContainer.style.cursor = 'pointer';
                imgContainer.addEventListener('click', () => {
                    // Get the actual background color (could be from style or default)
                    const bgColor = imgContainer.style.backgroundColor || defaultBg;
                    openSellerCardLightbox(image.processedUrl, bgColor);
                });
                
                item.appendChild(imgContainer);
            }
            
            // Background color section (matches Figma design)
            const bgColorSection = document.createElement('div');
            bgColorSection.className = 'bg-color-section';
            
            // Label
            const label = document.createElement('div');
            label.className = 'bg-color-label';
            label.textContent = 'Background color';
            bgColorSection.appendChild(label);
            
            // Color selector wrapper
            const selectorWrapper = document.createElement('div');
            selectorWrapper.className = 'bg-color-selector-wrapper';
            
            // Color buttons row
            const bgColorRow = document.createElement('div');
            bgColorRow.className = 'bg-color-selector';
            
            // Get intelligent default background
            const defaultBg = image.defaultBackground || '#FFFFFF';
            
            // Helper to check if a color is too similar to existing options
            const isTooSimilarToExisting = (hexColor, existingColors, threshold = 60) => {
                const rgb = hexToRgb(hexColor);
                if (!rgb) return false;
                
                for (const existingHex of existingColors) {
                    const existingRgb = hexToRgb(existingHex);
                    if (!existingRgb) continue;
                    
                    const diff = getColorDifference(rgb, existingRgb);
                    if (diff < threshold) return true;
                }
                return false;
            };
            
            // Build final color list, checking for similarity at each step
            const finalColorOptions = [];
            
            // Helper to check if a color has good contrast against the logo
            const hasGoodLogoContrast = (hexColor, logoBrightness) => {
                const rgb = hexToRgb(hexColor);
                if (!rgb || logoBrightness === undefined) return true; // Safe fallback
                
                const bgBrightness = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]);
                const diff = Math.abs(logoBrightness - bgBrightness);
                
                // Same strict rules as filterColorsByLogoContrast
                // If background is very dark (< 60), logo MUST be very bright (> 150)
                if (bgBrightness < 60 && logoBrightness < 150) return false;
                
                // If background is very bright (> 195), logo MUST be dark (< 100)
                if (bgBrightness > 195 && logoBrightness > 100) return false;
                
                // General high contrast requirement
                if (diff < 100) return false;
                
                // ADDITIONAL CHECK: Color similarity (for multi-color logos)
                // If the background color is similar to extracted logo colors, reject it
                // This prevents red background on red logo, blue on blue, etc.
                // Use originalColors (unfiltered) to catch all logo colors
                const checkColors = image.originalColors || image.colors || [];
                if (checkColors.length > 0) {
                    let similarityCount = 0;
                    for (const logoColor of checkColors) {
                        const logoRgb = hexToRgb(logoColor);
                        if (!logoRgb) continue;
                        
                        // Check color difference (not just brightness)
                        const colorDiff = getColorDifference(rgb, logoRgb);
                        
                        // Very strict threshold - if background is similar to ANY logo color
                        if (colorDiff < 150) {
                            similarityCount++;
                        }
                    }
                    
                    // If similar to 1 or more logo colors, reject
                    if (similarityCount > 0) {
                        console.log(`Filtered ${hexColor} - matches ${similarityCount} logo color(s)`);
                        return false;
                    }
                }
                
                return true;
            };
            
            // Use stored logo brightness (calculated during processing)
            const logoBrightness = image.logoBrightness;
            
            // Consider white first - but check contrast
            if (!isTooSimilarToExisting('#FFFFFF', finalColorOptions) && hasGoodLogoContrast('#FFFFFF', logoBrightness)) {
                finalColorOptions.push('#FFFFFF');
            }
            
            // Consider black - but check contrast
            if (!isTooSimilarToExisting('#000000', finalColorOptions) && hasGoodLogoContrast('#000000', logoBrightness)) {
                finalColorOptions.push('#000000');
            }
            
            // Add ColorThief colors, filtering for both similarity AND contrast
            if (image.colors && image.colors.length > 0) {
                for (const color of image.colors) {
                    // Stop if we already have 7 colors
                    if (finalColorOptions.length >= 7) break;
                    
                    // Check BOTH similarity to existing AND contrast against logo
                    if (!isTooSimilarToExisting(color, finalColorOptions) && hasGoodLogoContrast(color, logoBrightness)) {
                        finalColorOptions.push(color);
                    }
                }
            }
            
            // Render all final color options
            finalColorOptions.forEach(color => {
                const colorBtn = document.createElement('button');
                colorBtn.className = 'bg-color-option bg-color-swatch' + (defaultBg.toUpperCase() === color.toUpperCase() ? ' active' : '');
                colorBtn.style.backgroundColor = color;
                colorBtn.title = color;
                colorBtn.addEventListener('click', () => {
                    selectBackgroundColor(batchIndex, imageIndex, color, colorBtn);
                });
                bgColorRow.appendChild(colorBtn);
            });
            
            selectorWrapper.appendChild(bgColorRow);
            
            // Hex value text label (show default background)
            const hexLabel = document.createElement('div');
            hexLabel.className = 'bg-color-hex-label';
            hexLabel.textContent = defaultBg.toUpperCase();
            selectorWrapper.appendChild(hexLabel);
            
            bgColorSection.appendChild(selectorWrapper);
            item.appendChild(bgColorSection);
            processedGrid.appendChild(item);
        });
        
        contentEl.appendChild(processedGrid);
        batchEl.appendChild(contentEl);
        container.appendChild(batchEl);
        
        // Add divider between batches (not after last batch)
        if (batchIndex < processingBatches.length - 1) {
            const divider = document.createElement('div');
            divider.className = 'processing-batch-divider';
            divider.innerHTML = `
                <svg width="920" height="1" viewBox="0 0 920 1" fill="none">
                    <line x1="0" y1="0.5" x2="920" y2="0.5" stroke="#595959" stroke-width="1"/>
                </svg>
            `;
            container.appendChild(divider);
        }
    });
    
    // Show upload more button
    const uploadMoreBtn = document.getElementById('uploadMoreBtn');
    if (uploadMoreBtn) {
        uploadMoreBtn.style.display = 'flex';
    }
}

// Show processing results screen (handles view switching + rendering)
function showProcessingResults() {
    // Hide logo processing view and overlay mode
    const logoProcessingView = document.getElementById('logoProcessingView');
    logoProcessingView.classList.remove('active');
    logoProcessingView.classList.remove('overlay-mode');
    
    // Hide close button
    const closeBtn = document.getElementById('logoProcessingClose');
    if (closeBtn) {
        closeBtn.style.display = 'none';
    }
    
    // Show processing results view
    const resultsView = document.getElementById('processingResultsView');
    resultsView.classList.add('active');
    
    // Render the batches
    renderProcessingResults();
}

// Format timestamp for display
function formatProcessingTimestamp(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    
    return `${month} ${day} ${year} at ${hours}:${minutes} ${ampm}`;
}

// Setup lightbox functionality
function setupLightbox() {
    const lightboxOverlay = document.getElementById('lightboxOverlay');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.getElementById('lightboxClose');
    
    // Close lightbox
    const closeLightbox = () => {
        lightboxOverlay.classList.remove('active');
        setTimeout(() => {
            lightboxImage.src = '';
        }, 300);
    };
    
    // Close button
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    
    // Click outside image to close
    if (lightboxOverlay) {
        lightboxOverlay.addEventListener('click', (e) => {
            if (e.target === lightboxOverlay) {
                closeLightbox();
            }
        });
    }
    
    // Setup seller card lightbox close handlers
    const sellerCardLightboxClose = document.getElementById('sellerCardLightboxClose');
    const sellerCardLightboxOverlay = document.getElementById('sellerCardLightboxOverlay');
    
    if (sellerCardLightboxClose) {
        sellerCardLightboxClose.addEventListener('click', closeSellerCardLightbox);
    }
    
    if (sellerCardLightboxOverlay) {
        sellerCardLightboxOverlay.addEventListener('click', (e) => {
            if (e.target === sellerCardLightboxOverlay) {
                closeSellerCardLightbox();
            }
        });
    }
    
    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightboxOverlay.classList.contains('active')) {
            closeLightbox();
        }
    });
}

// Open lightbox with image
function openLightbox(imageSrc) {
    const lightboxOverlay = document.getElementById('lightboxOverlay');
    const lightboxImage = document.getElementById('lightboxImage');
    
    if (lightboxImage && lightboxOverlay) {
        lightboxImage.src = imageSrc;
        lightboxOverlay.classList.add('active');
    }
}

// Open seller card lightbox with background color
function openSellerCardLightbox(imageSrc, backgroundColor) {
    const lightboxOverlay = document.getElementById('sellerCardLightboxOverlay');
    const lightboxContent = document.getElementById('sellerCardLightboxContent');
    const lightboxImage = document.getElementById('sellerCardLightboxImage');
    
    if (lightboxImage && lightboxOverlay && lightboxContent) {
        lightboxImage.src = imageSrc;
        lightboxContent.style.backgroundColor = backgroundColor;
        
        // Apply adaptive outline based on background luminance (scaled for lightbox at 140%)
        console.log('🔍 Lightbox opening with background:', backgroundColor);
        const outline = getAdaptiveOutline(backgroundColor);
        const outlineRgba = outline.color === '#FFFFFF' 
            ? `rgba(255, 255, 255, ${outline.opacity})`
            : `rgba(0, 0, 0, ${outline.opacity})`;
        
        // Set full border property to ensure it applies
        const borderValue = `0.7px solid ${outlineRgba}`;
        console.log('   Setting lightbox border:', borderValue);
        lightboxContent.style.setProperty('border', borderValue, 'important');
        console.log('   Applied border:', lightboxContent.style.border);
        
        lightboxOverlay.classList.add('active');
        
        // Initialize 3D tilt for lightbox
        setupLightbox3DTilt();
    }
}

// Close seller card lightbox
function closeSellerCardLightbox() {
    const lightboxOverlay = document.getElementById('sellerCardLightboxOverlay');
    if (lightboxOverlay) {
        lightboxOverlay.classList.remove('active');
        
        // Clean up 3D tilt
        if (window.lightboxTiltCleanup) {
            window.lightboxTiltCleanup();
        }
    }
}

// 3D Tilt effect for lightbox card
function setupLightbox3DTilt() {
    const lightboxContent = document.getElementById('sellerCardLightboxContent');
    const lightboxOverlay = document.getElementById('sellerCardLightboxOverlay');
    
    if (!lightboxContent || !lightboxOverlay) return;
    
    let idleTimeout = null;
    
    const handleMouseMove = (e) => {
        // Only apply tilt when lightbox is active
        if (!lightboxOverlay.classList.contains('active')) return;
        
        // Clear existing timeout
        if (idleTimeout) {
            clearTimeout(idleTimeout);
        }
        
        // Get mouse position relative to window
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        // Calculate rotation with very subtle range (-8 to 8 degrees)
        const rotateY = (mouseX - 0.5) * 16;
        const rotateX = (mouseY - 0.5) * -16;
        
        // Calculate dynamic shadow based on tilt (very subtle)
        // Shadow moves opposite to tilt direction
        const shadowX = -rotateY * 1.2;
        const shadowY = rotateX * 1.2;
        const shadowBlur = 50 + (Math.abs(rotateX) + Math.abs(rotateY)) * 0.5;
        
        // Apply transform with subtle translateZ for depth
        lightboxContent.style.transform = `
            perspective(1000px)
            rotateX(${rotateX}deg) 
            rotateY(${rotateY}deg)
            translateZ(10px)
        `;
        lightboxContent.style.boxShadow = `
            ${shadowX}px ${shadowY}px ${shadowBlur}px rgba(0, 0, 0, 0.35)
        `;
        lightboxContent.style.transition = 'transform 0.15s ease-out, box-shadow 0.15s ease-out';
        
        // Set timeout to reset after 1.5 seconds of inactivity
        idleTimeout = setTimeout(() => {
            lightboxContent.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
            lightboxContent.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.3)';
            lightboxContent.style.transition = 'transform 0.6s ease-out, box-shadow 0.6s ease-out';
        }, 1500);
    };
    
    // Add event listener
    document.addEventListener('mousemove', handleMouseMove);
    
    // Store cleanup function
    window.lightboxTiltCleanup = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        if (idleTimeout) {
            clearTimeout(idleTimeout);
        }
        // Reset transform and shadow
        lightboxContent.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        lightboxContent.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.3)';
    };
}

// Setup upload more button
function setupUploadMoreButton() {
    const uploadMoreBtn = document.getElementById('uploadMoreBtn');
    const closeBtn = document.getElementById('logoProcessingClose');
    const logoProcessingView = document.getElementById('logoProcessingView');
    
    if (uploadMoreBtn) {
        uploadMoreBtn.addEventListener('click', () => {
            // Reset current batch state (but keep processingBatches history)
            uploadedImages = [];
            originalImages = [];
            processingTimestamp = null;
            
            // Clear grids
            document.getElementById('logoPreviewGrid').innerHTML = '';
            document.getElementById('logoPreviewGrid').style.display = 'none';
            document.getElementById('logoContinueContainer').style.display = 'none';
            
            // Show upload view as overlay
            logoProcessingView.classList.add('active');
            logoProcessingView.classList.add('overlay-mode');
            
            // Show close button
            closeBtn.style.display = 'flex';
        });
    }
    
    // Setup close button
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            // Hide upload view overlay
            logoProcessingView.classList.remove('active');
            logoProcessingView.classList.remove('overlay-mode');
            
            // Hide close button
            closeBtn.style.display = 'none';
        });
        
        // Close on overlay click (outside card)
        logoProcessingView.addEventListener('click', (e) => {
            if (e.target === logoProcessingView && logoProcessingView.classList.contains('overlay-mode')) {
                closeBtn.click();
            }
        });
    }
}

function setupColorPillClick() {
    const hexValue = document.getElementById('cardColorHex');
    const opacityValue = document.getElementById('cardOpacity');
    
    // Handle hex value editing
    if (hexValue) {
        hexValue.addEventListener('input', function(e) {
            let value = this.textContent.trim();
            
            // Auto-add # if missing
            if (value.length > 0 && !value.startsWith('#')) {
                value = '#' + value;
            }
            
            // Validate and update if valid hex
            if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                updateCardColor(value.toUpperCase(), getCurrentOpacity());
            }
        });
        
        hexValue.addEventListener('blur', function(e) {
            let value = this.textContent.trim();
            
            // Auto-add # if missing
            if (value.length > 0 && !value.startsWith('#')) {
                value = '#' + value;
            }
            
            // Validate and correct if needed
            if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
                // Revert to last valid color
                this.textContent = document.getElementById('cardColorDot').style.backgroundColor || '#B44E0E';
            } else {
                this.textContent = value.toUpperCase();
                updateCardColor(value.toUpperCase(), getCurrentOpacity());
            }
        });
        
        hexValue.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.blur();
            }
        });
    }
    
    // Handle opacity value editing
    if (opacityValue) {
        opacityValue.addEventListener('input', function(e) {
            let value = this.textContent.trim().replace('%', '');
            let numValue = parseInt(value);
            
            if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                const currentColor = document.getElementById('cardColorHex').textContent;
                updateCardColor(currentColor, numValue);
            }
        });
        
        opacityValue.addEventListener('blur', function(e) {
            let value = this.textContent.trim().replace('%', '');
            let numValue = parseInt(value);
            
            if (isNaN(numValue) || numValue < 0 || numValue > 100) {
                numValue = 100;
            }
            
            this.textContent = numValue + '%';
            const currentColor = document.getElementById('cardColorHex').textContent;
            updateCardColor(currentColor, numValue);
        });
        
        opacityValue.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.blur();
            }
        });
    }
}

function getCurrentOpacity() {
    const opacityText = document.getElementById('cardOpacity').textContent;
    return parseInt(opacityText.replace('%', '')) || 100;
}

function setupColorPickerPopup() {
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeColorPicker();
        }
    });
    
    // Close when clicking outside
    document.addEventListener('click', (e) => {
        const overlay = document.getElementById('colorPickerOverlay');
        
        if (overlay.classList.contains('active')) {
            if (!e.target.closest('.color-picker-popup') && 
                !e.target.closest('.color-pill')) {
                closeColorPicker();
            }
        }
    });
    
    const overlay = document.getElementById('colorPickerOverlay');
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeColorPicker();
        }
    });
}

function openColorPicker(currentColor, currentOpacity, clickedElement) {
    const overlay = document.getElementById('colorPickerOverlay');
    const popup = document.getElementById('colorPickerPopup');
    currentClickedElement = clickedElement;
    
    // Add active state to pill
    clickedElement.style.borderColor = '#000000';
    
    // Position popup
    const rect = clickedElement.getBoundingClientRect();
    const pillCenterY = rect.top + (rect.height / 2);
    
    popup.style.left = '0px';
    popup.style.top = '0px';
    popup.style.visibility = 'hidden';
    overlay.classList.add('active');
    
    const popupRect = popup.getBoundingClientRect();
    const popupWidth = popupRect.width;
    const popupHeight = popupRect.height;
    
    overlay.classList.remove('active');
    popup.style.visibility = 'visible';
    
    let left = rect.right + 24;
    let top = pillCenterY - (popupHeight / 2);
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (left + popupWidth > viewportWidth - 20) {
        left = rect.left - popupWidth - 24;
        
        if (left < 20) {
            left = Math.max(20, (viewportWidth - popupWidth) / 2);
        }
    }
    
    if (top < 20) {
        top = 20;
    } else if (top + popupHeight > viewportHeight - 20) {
        top = viewportHeight - popupHeight - 20;
        
        if (top < 20) {
            top = 20;
        }
    }
    
    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;
    
    overlay.classList.add('active');
    popup.classList.add('active');
    
    if (currentColor && colorPicker.isValidHex(currentColor)) {
        setTimeout(() => {
            colorPicker.setColor(currentColor, currentOpacity);
        }, 0);
    }
}

function repositionColorPicker() {
    if (!currentClickedElement) return;
    
    const overlay = document.getElementById('colorPickerOverlay');
    const popup = document.getElementById('colorPickerPopup');
    
    if (!overlay.classList.contains('active')) return;
    
    const rect = currentClickedElement.getBoundingClientRect();
    const pillCenterY = rect.top + (rect.height / 2);
    
    const popupRect = popup.getBoundingClientRect();
    const popupWidth = popupRect.width;
    const popupHeight = popupRect.height;
    
    let left = rect.right + 24;
    let top = pillCenterY - (popupHeight / 2);
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (left + popupWidth > viewportWidth - 20) {
        left = rect.left - popupWidth - 24;
        
        if (left < 20) {
            left = Math.max(20, (viewportWidth - popupWidth) / 2);
        }
    }
    
    if (top < 20) {
        top = 20;
    } else if (top + popupHeight > viewportHeight - 20) {
        top = viewportHeight - popupHeight - 20;
        
        if (top < 20) {
            top = 20;
        }
    }
    
    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;
}

function closeColorPicker() {
    const overlay = document.getElementById('colorPickerOverlay');
    const popup = document.getElementById('colorPickerPopup');
    
    overlay.classList.remove('active');
    popup.classList.remove('active');
    
    // Remove active state from pill
    if (currentClickedElement) {
        currentClickedElement.style.borderColor = '#959595';
    }
    
    currentClickedElement = null;
}

function setupCardSizeDropdown() {
    const cardSizeBtn = document.getElementById('cardSizeBtn');
    const cardSizeMenu = document.getElementById('cardSizeMenu');
    const cardSizeLabel = document.getElementById('cardSizeLabel');
    const sellerCard = document.getElementById('sellerCard');
    const previewContainer = document.querySelector('.card-preview-container');
    
    // Toggle dropdown
    cardSizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        cardSizeBtn.classList.toggle('active');
        cardSizeMenu.classList.toggle('active');
        // Close other dropdowns
        document.getElementById('backgroundBtn').classList.remove('active');
        document.getElementById('backgroundMenu').classList.remove('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#cardSizeBtn') && !e.target.closest('#cardSizeMenu')) {
            cardSizeBtn.classList.remove('active');
            cardSizeMenu.classList.remove('active');
        }
    });
    
    // Handle size selection
    const sizeItems = cardSizeMenu.querySelectorAll('.dropdown-item');
    sizeItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const size = item.getAttribute('data-size');
            
            // Update selected state
            sizeItems.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            
            // Update label
            cardSizeLabel.textContent = size.toUpperCase();
            
            // Pause tilt during transition
            if (window.pauseTilt) {
                window.pauseTilt(400);
            }
            
            // Reset transform before size change
            sellerCard.style.transform = 'rotateX(0deg) rotateY(0deg)';
            
            // Update card size class
            sellerCard.className = 'seller-card';
            sellerCard.classList.add(`size-${size}`);
            
            // Close dropdown
            cardSizeBtn.classList.remove('active');
            cardSizeMenu.classList.remove('active');
        });
    });
}

function showProfileMobileView() {
    const previewSection = document.querySelector('.preview-section');
    const previewContainer = document.querySelector('.card-preview-container');
    const sellerCard = document.getElementById('sellerCard');
    
    // Remove existing background classes
    previewContainer.className = 'card-preview-container profile-mobile-view';
    
    // Hide the original seller card
    sellerCard.style.display = 'none';
    
    // Create mobile phone mockup
    const phoneFrame = document.createElement('div');
    phoneFrame.className = 'mobile-phone-frame';
    phoneFrame.id = 'mobilePhoneFrame';
    
    const profileContent = document.createElement('div');
    profileContent.className = 'mobile-profile-content';
    
    // Profile header with card - NO status bar or nav bar
    const profileHeader = document.createElement('div');
    profileHeader.className = 'mobile-profile-header';
    
    // Clone the actual XS seller card - this way it inherits ALL the correct styles and behavior
    const mobileCard = sellerCard.cloneNode(true);
    mobileCard.id = 'mobileSellerCard';
    mobileCard.className = 'seller-card size-xs';
    mobileCard.style.display = 'block';
    
    // Store reference to update function
    window.updateMobileCard = function() {
        const mainCard = document.getElementById('sellerCard');
        if (!mainCard || !mobileCard) return;
        
        // Sync background color and opacity
        mobileCard.style.backgroundColor = mainCard.style.backgroundColor;
        mobileCard.style.opacity = mainCard.style.opacity;
        
        // Sync logo
        const mainLogoText = mainCard.querySelector('.logo-text');
        const mainLogoImg = mainCard.querySelector('.logo-image');
        const mobileLogoText = mobileCard.querySelector('.logo-text');
        const mobileLogoImg = mobileCard.querySelector('.logo-image');
        
        if (mainLogoText && mobileLogoText) {
            mobileLogoText.style.display = mainLogoText.style.display;
        }
        
        if (mainLogoImg && mobileLogoImg) {
            mobileLogoImg.src = mainLogoImg.src;
            mobileLogoImg.style.display = mainLogoImg.style.display;
        }
    };
    
    const profileName = document.createElement('h1');
    profileName.className = 'mobile-profile-name';
    profileName.textContent = 'Joy Bakeshop';
    
    const profileMeta = document.createElement('div');
    profileMeta.className = 'mobile-profile-meta';
    profileMeta.innerHTML = `
        <span>$joybakeshop</span>
        <span>·</span>
        <span class="category">Cafe</span>
    `;
    
    profileHeader.appendChild(mobileCard);
    profileHeader.appendChild(profileName);
    profileHeader.appendChild(profileMeta);
    
    // Force initial update after mobile card is created
    setTimeout(() => {
        if (window.updateMobileCard) {
            window.updateMobileCard();
        }
    }, 100);
    
    // Profile body
    const profileBody = document.createElement('div');
    profileBody.className = 'mobile-profile-body';
    
    // Placeholder elements
    const placeholder = document.createElement('div');
    placeholder.className = 'mobile-profile-placeholder';
    
    // Section 1
    const section1 = document.createElement('div');
    section1.className = 'mobile-profile-section';
    
    const sectionTitle1 = document.createElement('div');
    sectionTitle1.className = 'mobile-profile-section-title';
    
    const grid1 = document.createElement('div');
    grid1.className = 'mobile-profile-grid';
    
    for (let i = 0; i < 2; i++) {
        const card = createProfileCard();
        grid1.appendChild(card);
    }
    
    section1.appendChild(sectionTitle1);
    section1.appendChild(grid1);
    
    // Section 2
    const section2 = document.createElement('div');
    section2.className = 'mobile-profile-section';
    
    const grid2 = document.createElement('div');
    grid2.className = 'mobile-profile-grid';
    
    for (let i = 0; i < 2; i++) {
        const card = createProfileCard();
        grid2.appendChild(card);
    }
    
    section2.appendChild(grid2);
    
    // Assemble body
    profileBody.appendChild(placeholder);
    profileBody.appendChild(section1);
    profileBody.appendChild(section2);
    
    // Assemble content - NO status bar or nav bar
    profileContent.appendChild(profileHeader);
    profileContent.appendChild(profileBody);
    
    phoneFrame.appendChild(profileContent);
    previewContainer.appendChild(phoneFrame);
}

function hideProfileMobileView() {
    const phoneFrame = document.getElementById('mobilePhoneFrame');
    const sellerCard = document.getElementById('sellerCard');
    const previewContainer = document.querySelector('.card-preview-container');
    
    if (phoneFrame) {
        phoneFrame.remove();
    }
    
    // Clear the global update function
    window.updateMobileCard = null;
    
    // Show the original seller card
    if (sellerCard) {
        sellerCard.style.display = 'block';
    }
    
    // Preserve current background selection
    const currentBg = previewContainer.classList.contains('bg-light') ? 'bg-light' :
                      previewContainer.classList.contains('bg-dark') ? 'bg-dark' : 'bg-tab';
    previewContainer.className = 'card-preview-container';
    previewContainer.classList.add(currentBg);
}

function createProfileCard() {
    const card = document.createElement('div');
    card.className = 'mobile-profile-card';
    
    const image = document.createElement('div');
    image.className = 'mobile-profile-card-image';
    
    const text = document.createElement('div');
    text.className = 'mobile-profile-card-text';
    
    for (let i = 0; i < 3; i++) {
        const line = document.createElement('div');
        line.className = 'mobile-profile-card-text-line';
        text.appendChild(line);
    }
    
    card.appendChild(image);
    card.appendChild(text);
    
    return card;
}

function setupBackgroundDropdown() {
    const backgroundBtn = document.getElementById('backgroundBtn');
    const backgroundMenu = document.getElementById('backgroundMenu');
    const backgroundLabel = document.getElementById('backgroundLabel');
    const previewContainer = document.querySelector('.card-preview-container');
    
    // Toggle dropdown
    backgroundBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        backgroundBtn.classList.toggle('active');
        backgroundMenu.classList.toggle('active');
        // Close other dropdowns
        document.getElementById('cardSizeBtn').classList.remove('active');
        document.getElementById('cardSizeMenu').classList.remove('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#backgroundBtn') && !e.target.closest('#backgroundMenu')) {
            backgroundBtn.classList.remove('active');
            backgroundMenu.classList.remove('active');
        }
    });
    
    // Handle background selection
    const backgroundItems = backgroundMenu.querySelectorAll('.dropdown-item');
    backgroundItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const background = item.getAttribute('data-background');
            
            // Update selected state
            backgroundItems.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            
            // Update label
            const labelText = background.charAt(0).toUpperCase() + background.slice(1);
            backgroundLabel.textContent = labelText;
            
            // Update preview container background
            previewContainer.className = 'card-preview-container';
            previewContainer.classList.add(`bg-${background}`);
            
            // Close dropdown
            backgroundBtn.classList.remove('active');
            backgroundMenu.classList.remove('active');
        });
    });
}

function updateCardColor(hexColor, opacity) {
    // Validate hex color
    if (!/^#[0-9A-Fa-f]{6}$/.test(hexColor)) {
        return;
    }
    
    // Update pill display
    const hexElement = document.getElementById('cardColorHex');
    const dotElement = document.getElementById('cardColorDot');
    const opacityElement = document.getElementById('cardOpacity');
    
    if (hexElement && hexElement.textContent !== hexColor.toUpperCase()) {
        hexElement.textContent = hexColor.toUpperCase();
    }
    
    if (dotElement) {
        dotElement.style.backgroundColor = hexColor;
    }
    
    if (opacityElement && opacityElement.textContent !== `${Math.round(opacity)}%`) {
        opacityElement.textContent = `${Math.round(opacity)}%`;
    }
    
    // Update card preview
    const sellerCard = document.getElementById('sellerCard');
    
    if (sellerCard) {
        sellerCard.style.backgroundColor = hexColor;
        sellerCard.style.opacity = opacity / 100;
    }
    
    // Update mobile profile view if active
    if (window.updateMobileCard) {
        window.updateMobileCard();
    }
    
    // Logo preview stays light gray - no color change
}

function setupLogoUpload() {
    const addLogoOption = document.getElementById('addLogoOption');
    const fileInput = document.getElementById('logoUploadInput');
    const monogramOption = document.getElementById('logoMonogramOption');
    const logoOptionsContainer = document.querySelector('.logo-options');
    const cardLogoMonogram = document.getElementById('cardLogoMonogram');
    const cardLogoImage = document.getElementById('cardLogoImage');
    
    let currentLogoType = 'monogram';
    let uploadedLogos = [];
    let logoIdCounter = 0;
    
    // Set initial selection
    monogramOption.classList.add('selected');
    
    // Trigger file input when add logo button is clicked
    addLogoOption.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Handle file selection
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                const imageUrl = event.target.result;
                const logoId = `logo-${logoIdCounter++}`;
                
                // Create new logo option
                const newLogoOption = createLogoOption(logoId, imageUrl);
                
                // Insert before the add button
                logoOptionsContainer.insertBefore(newLogoOption, addLogoOption);
                
                // Store logo data
                uploadedLogos.push({ id: logoId, url: imageUrl, element: newLogoOption });
                
                // Deselect all and select new logo
                deselectAllLogos();
                newLogoOption.classList.add('selected');
                currentLogoType = logoId;
                
                // Update card preview
                updateCardLogo(logoId, imageUrl);
                
                // Force update mobile card if it exists
                setTimeout(() => {
                    if (window.updateMobileCard) {
                        window.updateMobileCard();
                    }
                }, 50);
            };
            
            reader.readAsDataURL(file);
        }
        
        // Reset file input
        fileInput.value = '';
    });
    
    // Click monogram option to select it
    monogramOption.addEventListener('click', () => {
        if (currentLogoType !== 'monogram') {
            deselectAllLogos();
            monogramOption.classList.add('selected');
            currentLogoType = 'monogram';
            updateCardLogo('monogram');
            
            // Force update mobile card
            setTimeout(() => {
                if (window.updateMobileCard) {
                    window.updateMobileCard();
                }
            }, 50);
        }
    });
    
    function createLogoOption(logoId, imageUrl) {
        const option = document.createElement('div');
        option.className = 'logo-preview logo-option';
        option.setAttribute('data-logo-id', logoId);
        
        const img = document.createElement('img');
        img.className = 'logo-image';
        img.src = imageUrl;
        img.alt = 'Uploaded Logo';
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-logo-btn';
        removeBtn.title = 'Remove logo';
        removeBtn.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
        `;
        
            // Click to select logo
            option.addEventListener('click', (e) => {
                if (!e.target.closest('.remove-logo-btn')) {
                    if (currentLogoType !== logoId) {
                        deselectAllLogos();
                        option.classList.add('selected');
                        currentLogoType = logoId;
                        updateCardLogo(logoId, imageUrl);
                        
                        // Force update mobile card
                        setTimeout(() => {
                            if (window.updateMobileCard) {
                                window.updateMobileCard();
                            }
                        }, 50);
                    }
                }
            });
        
        // Remove logo
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Remove from array
            uploadedLogos = uploadedLogos.filter(logo => logo.id !== logoId);
            
            // Remove from DOM
            option.remove();
            
            // If this was selected, switch to monogram
            if (currentLogoType === logoId) {
                deselectAllLogos();
                monogramOption.classList.add('selected');
                currentLogoType = 'monogram';
                updateCardLogo('monogram');
            }
        });
        
        option.appendChild(img);
        option.appendChild(removeBtn);
        
        return option;
    }
    
    function deselectAllLogos() {
        document.querySelectorAll('.logo-option').forEach(option => {
            option.classList.remove('selected');
        });
    }
    
    function updateCardLogo(type, imageUrl = null) {
        if (type === 'monogram') {
            cardLogoMonogram.style.display = 'block';
            cardLogoImage.style.display = 'none';
        } else if (imageUrl) {
            cardLogoImage.src = imageUrl;
            cardLogoImage.style.display = 'block';
            cardLogoImage.style.visibility = 'visible';
            cardLogoImage.style.opacity = '1';
            cardLogoMonogram.style.display = 'none';
        }
        
        // Update mobile profile view if active
        updateMobileProfileCard(type, imageUrl);
    }
    
    function updateMobileProfileCard(type, imageUrl = null) {
        // Use the global update function if it exists
        if (window.updateMobileCard) {
            window.updateMobileCard();
        }
    }
}

function setup3DTilt() {
    const card = document.getElementById('sellerCard');
    const container = document.querySelector('.card-preview-container');
    
    if (!card || !container) {
        console.error('Card or container not found');
        return;
    }
    
    console.log('✅ 3D Tilt initialized');
    
    let idleTimeout = null;
    let isTransitioning = false;
    
    document.addEventListener('mousemove', (e) => {
        // Don't apply tilt during size transitions
        if (isTransitioning) return;
        
        // Clear existing timeout
        if (idleTimeout) {
            clearTimeout(idleTimeout);
        }
        
        // Get mouse position relative to window
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        // Calculate rotation (-15 to 15 degrees)
        const rotateY = (mouseX - 0.5) * 30;
        const rotateX = (mouseY - 0.5) * -30;
        
        // Apply transform without overriding other transitions
        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        
        // Set timeout to reset after 1.5 seconds of inactivity
        idleTimeout = setTimeout(() => {
            card.style.transform = 'rotateX(0deg) rotateY(0deg)';
            console.log('Card reset to resting state');
        }, 1500);
    });
    
    // Expose function to pause tilt during transitions
    window.pauseTilt = function(duration) {
        isTransitioning = true;
        setTimeout(() => {
            isTransitioning = false;
        }, duration);
    };
}

// Export for potential future use
window.BrandAdmin = {
    updateCardColor,
    openColorPicker,
    closeColorPicker
};

window.ColorPicker = ColorPicker;

// Initialize Settings page when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupSettings);
} else {
    setupSettings();
}



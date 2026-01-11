/**
 * OBS Image Mask Generator
 * Main Application Script
 */

// ============================
// Configuration & State
// ============================

const config = {
    width: 1920,
    height: 1080,
    shape: 'rectangle',
    cornerRadius: 10, // percentage
    polygonSides: 6,
    rotation: 0,
    feathering: 0,
    inverted: false,
    borderEnabled: false,
    borderColor: '#9146ff',
    borderThickness: 4,
    aspectRatio: '16:9',
    aspectLocked: true,
    zoomMode: 'fit' // 'fit' or '100'
};

// Preset definitions
const presets = {
    classic: {
        width: 1920,
        height: 1080,
        shape: 'rectangle',
        cornerRadius: 8,
        rotation: 0,
        aspectRatio: '16:9'
    },
    circle: {
        width: 1080,
        height: 1080,
        shape: 'ellipse',
        cornerRadius: 0,
        rotation: 0,
        aspectRatio: '1:1'
    },
    bubble: {
        width: 800,
        height: 800,
        shape: 'rectangle',
        cornerRadius: 35,
        rotation: 0,
        aspectRatio: '1:1'
    },
    hex: {
        width: 1080,
        height: 1080,
        shape: 'polygon',
        polygonSides: 6,
        cornerRadius: 0,
        rotation: 0,
        aspectRatio: '1:1'
    },
    vertical: {
        width: 1080,
        height: 1920,
        shape: 'rectangle',
        cornerRadius: 5,
        rotation: 0,
        aspectRatio: '9:16'
    },
    triangle: {
        width: 1080,
        height: 1080,
        shape: 'polygon',
        polygonSides: 3,
        cornerRadius: 0,
        rotation: 0,
        aspectRatio: '1:1'
    }
};

// Aspect ratio values
const aspectRatios = {
    '16:9': 16 / 9,
    '4:3': 4 / 3,
    '1:1': 1,
    '9:16': 9 / 16,
    'free': null
};

// ============================
// DOM Elements
// ============================

const elements = {
    // Canvas
    canvas: document.getElementById('preview-canvas'),

    // Size inputs
    widthInput: document.getElementById('canvas-width'),
    heightInput: document.getElementById('canvas-height'),

    // Aspect ratio buttons
    aspectBtns: document.querySelectorAll('.aspect-btn'),

    // Shape buttons
    shapeBtns: document.querySelectorAll('.shape-btn'),

    // Control groups
    cornerRadiusGroup: document.getElementById('corner-radius-group'),
    polygonSidesGroup: document.getElementById('polygon-sides-group'),

    // Sliders and their value inputs
    cornerRadius: document.getElementById('corner-radius'),
    cornerRadiusValue: document.getElementById('corner-radius-value'),

    polygonSides: document.getElementById('polygon-sides'),
    polygonSidesValue: document.getElementById('polygon-sides-value'),

    rotation: document.getElementById('rotation'),
    rotationValue: document.getElementById('rotation-value'),

    feathering: document.getElementById('feathering'),
    featheringValue: document.getElementById('feathering-value'),

    // Toggles
    invertMode: document.getElementById('invert-mode'),
    enableBorder: document.getElementById('enable-border'),

    // Border controls
    borderControls: document.getElementById('border-controls'),
    borderColor: document.getElementById('border-color'),
    borderThickness: document.getElementById('border-thickness'),
    borderThicknessValue: document.getElementById('border-thickness-value'),

    // Download buttons
    downloadMask: document.getElementById('download-mask'),
    downloadBorder: document.getElementById('download-border'),

    // Preset cards
    presetCards: document.querySelectorAll('.preset-card'),

    // New: Canvas wrapper, dimension badge, zoom controls
    canvasWrapper: document.getElementById('canvas-wrapper'),
    canvasContainer: document.querySelector('.canvas-container'),
    dimensionBadge: document.getElementById('dimension-badge'),
    zoomFitBtn: document.getElementById('zoom-fit'),
    zoom100Btn: document.getElementById('zoom-100')
};

// Get 2D context
const ctx = elements.canvas.getContext('2d');

// ============================
// Drawing Functions
// ============================

let isDrawScheduled = false;

/**
 * Schedule a draw on the next animation frame
 * Optimizes INP by preventing main thread blocking during rapid inputs
 */
function requestDraw() {
    if (!isDrawScheduled) {
        isDrawScheduled = true;
        requestAnimationFrame(() => {
            draw();
            isDrawScheduled = false;
        });
    }
}

/**
 * Main draw function - renders the mask to canvas
 */
function draw() {
    const { width, height, shape, cornerRadius, polygonSides, rotation, feathering, inverted } = config;

    // Set canvas size
    elements.canvas.width = width;
    elements.canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Background color (black for normal, white for inverted)
    ctx.fillStyle = inverted ? '#ffffff' : '#000000';
    ctx.fillRect(0, 0, width, height);

    // Shape color (white for normal, black for inverted)
    ctx.fillStyle = inverted ? '#000000' : '#ffffff';

    // Apply feathering if needed
    if (feathering > 0) {
        ctx.shadowColor = inverted ? '#000000' : '#ffffff';
        ctx.shadowBlur = feathering;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    } else {
        ctx.shadowBlur = 0;
    }

    // Save context for rotation
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-width / 2, -height / 2);

    // Draw shape based on type
    ctx.beginPath();

    switch (shape) {
        case 'rectangle':
            drawRoundedRect(width, height, cornerRadius);
            break;
        case 'ellipse':
            drawEllipse(width, height);
            break;
        case 'polygon':
            drawPolygon(width, height, polygonSides);
            break;
    }

    ctx.fill();
    ctx.restore();

    // Update dimension badge and canvas scale
    updateDimensionBadge();
    updateCanvasScale();
}

/**
 * Draw a rounded rectangle
 */
function drawRoundedRect(width, height, radiusPercent) {
    const padding = 0;
    const x = padding;
    const y = padding;
    const w = width - (padding * 2);
    const h = height - (padding * 2);

    // Calculate actual radius from percentage
    const maxRadius = Math.min(w, h) / 2;
    const radius = (radiusPercent / 100) * maxRadius;

    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.arcTo(x + w, y, x + w, y + radius, radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
    ctx.lineTo(x + radius, y + h);
    ctx.arcTo(x, y + h, x, y + h - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
}

/**
 * Draw an ellipse
 */
function drawEllipse(width, height) {
    const cx = width / 2;
    const cy = height / 2;
    const rx = (width / 2) * 0.95;
    const ry = (height / 2) * 0.95;

    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.closePath();
}

/**
 * Draw a regular polygon
 */
function drawPolygon(width, height, sides) {
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 * 0.9;

    // Start from top (subtract 90 degrees)
    const startAngle = -Math.PI / 2;

    for (let i = 0; i <= sides; i++) {
        const angle = startAngle + (i * 2 * Math.PI / sides);
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.closePath();
}

/**
 * Draw border overlay (separate canvas for download)
 */
function drawBorder() {
    const { width, height, shape, cornerRadius, polygonSides, rotation, borderColor, borderThickness } = config;

    // Create temporary canvas
    const borderCanvas = document.createElement('canvas');
    borderCanvas.width = width;
    borderCanvas.height = height;
    const borderCtx = borderCanvas.getContext('2d');

    // Clear with transparency
    borderCtx.clearRect(0, 0, width, height);

    // Set stroke style
    borderCtx.strokeStyle = borderColor;
    borderCtx.lineWidth = borderThickness;

    // Save context for rotation
    borderCtx.save();
    borderCtx.translate(width / 2, height / 2);
    borderCtx.rotate((rotation * Math.PI) / 180);
    borderCtx.translate(-width / 2, -height / 2);

    // Draw shape outline
    borderCtx.beginPath();

    switch (shape) {
        case 'rectangle':
            drawRoundedRectPath(borderCtx, width, height, cornerRadius, borderThickness);
            break;
        case 'ellipse':
            drawEllipsePath(borderCtx, width, height, borderThickness);
            break;
        case 'polygon':
            drawPolygonPath(borderCtx, width, height, polygonSides, borderThickness);
            break;
    }

    borderCtx.stroke();
    borderCtx.restore();

    return borderCanvas;
}

function drawRoundedRectPath(ctx, width, height, radiusPercent, strokeWidth) {
    const padding = strokeWidth / 2;
    const x = padding;
    const y = padding;
    const w = width - (padding * 2);
    const h = height - (padding * 2);

    const maxRadius = Math.min(w, h) / 2;
    const radius = (radiusPercent / 100) * maxRadius;

    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.arcTo(x + w, y, x + w, y + radius, radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
    ctx.lineTo(x + radius, y + h);
    ctx.arcTo(x, y + h, x, y + h - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
}

function drawEllipsePath(ctx, width, height, strokeWidth) {
    const cx = width / 2;
    const cy = height / 2;
    const rx = (width / 2) - strokeWidth;
    const ry = (height / 2) - strokeWidth;

    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.closePath();
}

function drawPolygonPath(ctx, width, height, sides, strokeWidth) {
    const cx = width / 2;
    const cy = height / 2;
    const radius = (Math.min(width, height) / 2) - strokeWidth;

    const startAngle = -Math.PI / 2;

    for (let i = 0; i <= sides; i++) {
        const angle = startAngle + (i * 2 * Math.PI / sides);
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.closePath();
}

// ============================
// UI Update Functions
// ============================

/**
 * Update UI controls visibility based on shape
 */
function updateControlsVisibility() {
    const { shape } = config;

    // Corner radius - show for rectangle only
    elements.cornerRadiusGroup.classList.toggle('hidden', shape !== 'rectangle');

    // Polygon sides - show for polygon only
    elements.polygonSidesGroup.classList.toggle('hidden', shape !== 'polygon');
}

/**
 * Update aspect buttons active state
 */
function updateAspectButtons() {
    elements.aspectBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.ratio === config.aspectRatio);
    });
}

/**
 * Update shape buttons active state
 */
function updateShapeButtons() {
    elements.shapeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.shape === config.shape);
    });
}

/**
 * Sync slider with its number input
 */
function syncSliderAndInput(slider, input) {
    input.value = slider.value;
}

/**
 * Apply aspect ratio to dimensions
 */
function applyAspectRatio(changedDimension) {
    if (config.aspectRatio === 'free' || !config.aspectLocked) return;

    const ratio = aspectRatios[config.aspectRatio];
    if (!ratio) return;

    if (changedDimension === 'width') {
        config.height = Math.round(config.width / ratio);
        elements.heightInput.value = config.height;
    } else {
        config.width = Math.round(config.height * ratio);
        elements.widthInput.value = config.width;
    }
}

/**
 * Update the dimension badge to show current canvas size
 */
function updateDimensionBadge() {
    if (elements.dimensionBadge) {
        elements.dimensionBadge.textContent = `${config.width} × ${config.height} px`;
    }
}

/**
 * Update canvas scale to fit within container
 */
function updateCanvasScale() {
    if (!elements.canvasContainer) return;

    if (config.zoomMode === '100') {
        // 100% zoom - show at actual size (scrollable)
        elements.canvasContainer.classList.add('scrollable');
    } else {
        // Fit mode - CSS handles the max-width/max-height constraints
        elements.canvasContainer.classList.remove('scrollable');
    }
}

/**
 * Update zoom button active states
 */
function updateZoomButtons() {
    if (elements.zoomFitBtn && elements.zoom100Btn) {
        elements.zoomFitBtn.classList.toggle('active', config.zoomMode === 'fit');
        elements.zoom100Btn.classList.toggle('active', config.zoomMode === '100');
    }
}

// ============================
// Event Handlers
// ============================

/**
 * Apply a preset configuration
 */
function applyPreset(presetName) {
    const preset = presets[presetName];
    if (!preset) return;

    // Apply preset values
    Object.assign(config, preset);

    // Update UI
    elements.widthInput.value = config.width;
    elements.heightInput.value = config.height;

    if (preset.cornerRadius !== undefined) {
        elements.cornerRadius.value = config.cornerRadius;
        elements.cornerRadiusValue.value = config.cornerRadius;
    }

    if (preset.polygonSides !== undefined) {
        elements.polygonSides.value = config.polygonSides;
        elements.polygonSidesValue.value = config.polygonSides;
    }

    elements.rotation.value = config.rotation;
    elements.rotationValue.value = config.rotation;

    updateShapeButtons();
    updateAspectButtons();
    updateControlsVisibility();
    draw();
}

/**
 * Download canvas as PNG
 */
function downloadCanvas(canvas, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// ============================
// Event Listeners Setup
// ============================

function setupEventListeners() {
    // Preset cards
    elements.presetCards.forEach(card => {
        card.addEventListener('click', () => {
            applyPreset(card.dataset.preset);
        });
    });

    // Width input
    elements.widthInput.addEventListener('input', () => {
        config.width = parseInt(elements.widthInput.value) || 1920;
        applyAspectRatio('width');
        requestDraw();
    });

    // Height input
    elements.heightInput.addEventListener('input', () => {
        config.height = parseInt(elements.heightInput.value) || 1080;
        applyAspectRatio('height');
        requestDraw();
    });

    // Aspect ratio buttons
    elements.aspectBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            config.aspectRatio = btn.dataset.ratio;
            config.aspectLocked = config.aspectRatio !== 'free';
            updateAspectButtons();
            applyAspectRatio('width');
            requestDraw();
        });
    });

    // Shape buttons
    elements.shapeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            config.shape = btn.dataset.shape;
            updateShapeButtons();
            updateControlsVisibility();
            requestDraw();
        });
    });

    // Corner radius slider
    elements.cornerRadius.addEventListener('input', () => {
        config.cornerRadius = parseInt(elements.cornerRadius.value);
        syncSliderAndInput(elements.cornerRadius, elements.cornerRadiusValue);
        requestDraw();
    });

    elements.cornerRadiusValue.addEventListener('input', () => {
        const value = Math.min(50, Math.max(0, parseInt(elements.cornerRadiusValue.value) || 0));
        config.cornerRadius = value;
        elements.cornerRadius.value = value;
        elements.cornerRadiusValue.value = value;
        requestDraw();
    });

    // Polygon sides slider
    elements.polygonSides.addEventListener('input', () => {
        config.polygonSides = parseInt(elements.polygonSides.value);
        syncSliderAndInput(elements.polygonSides, elements.polygonSidesValue);
        requestDraw();
    });

    elements.polygonSidesValue.addEventListener('input', () => {
        const value = Math.min(12, Math.max(3, parseInt(elements.polygonSidesValue.value) || 3));
        config.polygonSides = value;
        elements.polygonSides.value = value;
        elements.polygonSidesValue.value = value;
        requestDraw();
    });

    // Rotation slider
    elements.rotation.addEventListener('input', () => {
        config.rotation = parseInt(elements.rotation.value);
        syncSliderAndInput(elements.rotation, elements.rotationValue);
        requestDraw();
    });

    elements.rotationValue.addEventListener('input', () => {
        const value = Math.min(360, Math.max(0, parseInt(elements.rotationValue.value) || 0));
        config.rotation = value;
        elements.rotation.value = value;
        elements.rotationValue.value = value;
        requestDraw();
    });

    // Feathering slider
    elements.feathering.addEventListener('input', () => {
        config.feathering = parseInt(elements.feathering.value);
        syncSliderAndInput(elements.feathering, elements.featheringValue);
        requestDraw();
    });

    elements.featheringValue.addEventListener('input', () => {
        const value = Math.min(50, Math.max(0, parseInt(elements.featheringValue.value) || 0));
        config.feathering = value;
        elements.feathering.value = value;
        elements.featheringValue.value = value;
        requestDraw();
    });

    // Invert mode toggle
    elements.invertMode.addEventListener('change', () => {
        config.inverted = elements.invertMode.checked;
        requestDraw();
    });

    // Border toggle
    elements.enableBorder.addEventListener('change', () => {
        config.borderEnabled = elements.enableBorder.checked;
        elements.borderControls.classList.toggle('hidden', !config.borderEnabled);
        elements.downloadBorder.classList.toggle('hidden', !config.borderEnabled);
    });

    // Border color
    elements.borderColor.addEventListener('input', () => {
        config.borderColor = elements.borderColor.value;
    });

    // Border thickness slider
    elements.borderThickness.addEventListener('input', () => {
        config.borderThickness = parseInt(elements.borderThickness.value);
        syncSliderAndInput(elements.borderThickness, elements.borderThicknessValue);
    });

    elements.borderThicknessValue.addEventListener('input', () => {
        const value = Math.min(50, Math.max(1, parseInt(elements.borderThicknessValue.value) || 4));
        config.borderThickness = value;
        elements.borderThickness.value = value;
        elements.borderThicknessValue.value = value;
    });

    // Download mask button
    elements.downloadMask.addEventListener('click', () => {
        const timestamp = Date.now();
        const shapeName = config.shape.charAt(0).toUpperCase() + config.shape.slice(1);
        downloadCanvas(elements.canvas, `OBS_Mask_${shapeName}_${config.width}x${config.height}_${timestamp}.png`);
    });

    // Download border button
    elements.downloadBorder.addEventListener('click', () => {
        const borderCanvas = drawBorder();
        const timestamp = Date.now();
        const shapeName = config.shape.charAt(0).toUpperCase() + config.shape.slice(1);
        downloadCanvas(borderCanvas, `OBS_Border_${shapeName}_${config.width}x${config.height}_${timestamp}.png`);
    });

    // Zoom controls
    if (elements.zoomFitBtn) {
        elements.zoomFitBtn.addEventListener('click', () => {
            config.zoomMode = 'fit';
            updateZoomButtons();
            updateCanvasScale();
        });
    }

    if (elements.zoom100Btn) {
        elements.zoom100Btn.addEventListener('click', () => {
            config.zoomMode = '100';
            updateZoomButtons();
            updateCanvasScale();
        });
    }

    // Window resize handler
    window.addEventListener('resize', () => {
        if (config.zoomMode === 'fit') {
            updateCanvasScale();
        }
    });
}

// ============================
// Initialization
// ============================

// ============================
// Cookie Consent
// ============================

function initCookieBanner() {
    if (localStorage.getItem('cookieConsent') === 'true') return;

    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.innerHTML = `
        <p>We use cookies to improve your experience and show personalized ads.</p>
        <button id="cookie-accept">Accept</button>
    `;
    document.body.appendChild(banner);

    document.getElementById('cookie-accept').addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'true');
        banner.style.display = 'none';
    });
}

function init() {
    setupEventListeners();
    updateControlsVisibility();
    draw();
    initCookieBanner();
}

// Start the app
document.addEventListener('DOMContentLoaded', init);

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
    independentCorners: false,
    cornerRadiusTL: 10,
    cornerRadiusTR: 10,
    cornerRadiusBR: 10,
    cornerRadiusBL: 10,
    polygonSides: 6,
    squircleCurvature: 3.5,
    starPoints: 5,
    starDepth: 50,
    rotation: 0,
    feathering: 0,
    inverted: false,
    borderEnabled: false,
    borderColor: '#9146ff',
    borderThickness: 4,
    aspectRatio: '16:9',
    aspectLocked: true,
    zoomMode: 'fit', // 'fit' or '100'
    webcamActive: false,
    isDownloading: false
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
    squircleCurvatureGroup: document.getElementById('squircle-curvature-group'),
    starControlsGroup: document.getElementById('star-controls-group'),

    // Sliders and their value inputs
    independentCorners: document.getElementById('independent-corners'),
    singleCornerWrap: document.getElementById('single-corner-wrap'),
    multiCornerWrap: document.getElementById('multi-corner-wrap'),

    cornerRadius: document.getElementById('corner-radius'),
    cornerRadiusValue: document.getElementById('corner-radius-value'),
    cornerTL: document.getElementById('corner-tl'),
    cornerTLValue: document.getElementById('corner-tl-value'),
    cornerTR: document.getElementById('corner-tr'),
    cornerTRValue: document.getElementById('corner-tr-value'),
    cornerBR: document.getElementById('corner-br'),
    cornerBRValue: document.getElementById('corner-br-value'),
    cornerBL: document.getElementById('corner-bl'),
    cornerBLValue: document.getElementById('corner-bl-value'),

    polygonSides: document.getElementById('polygon-sides'),
    polygonSidesValue: document.getElementById('polygon-sides-value'),

    squircleCurvature: document.getElementById('squircle-curvature'),
    squircleCurvatureValue: document.getElementById('squircle-curvature-value'),

    starPoints: document.getElementById('star-points'),
    starPointsValue: document.getElementById('star-points-value'),
    starDepth: document.getElementById('star-depth'),
    starDepthValue: document.getElementById('star-depth-value'),

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
    zoom100Btn: document.getElementById('zoom-100'),

    // Webcam
    webcamToggle: document.getElementById('webcam-toggle'),
    webcamVideo: document.getElementById('webcam-video'),

    // Tutorial video
    tutorialVideo: document.getElementById('tutorial-video')
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
    elements.canvas.style.aspectRatio = `${width} / ${height}`;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Background color (black for normal, white for inverted)
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = inverted ? '#ffffff' : '#000000';
    ctx.fillRect(0, 0, width, height);

    // Set composite mode for punching a hole if webcam is active, otherwise draw solid shape
    const isTransparentPreview = config.webcamActive && !config.isDownloading;
    if (isTransparentPreview) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = '#000000'; // Color doesn't matter, just needs full alpha
    } else {
        ctx.globalCompositeOperation = 'source-over';
        // Shape color (white for normal, black for inverted)
        ctx.fillStyle = inverted ? '#000000' : '#ffffff';
    }

    // Apply feathering if needed
    if (feathering > 0) {
        ctx.shadowColor = isTransparentPreview ? 'rgba(0,0,0,1)' : (inverted ? '#000000' : '#ffffff');
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

    // Determine stroke offset for mask so it perfectly aligns with border center
    const effectiveStroke = config.borderEnabled ? config.borderThickness : 0;

    // Draw shape based on type
    ctx.beginPath();
    switch (config.shape) {
        case 'rectangle':
            if (config.independentCorners) {
                drawAdvancedRoundedRectPath(ctx, width, height, config.cornerRadiusTL, config.cornerRadiusTR, config.cornerRadiusBR, config.cornerRadiusBL, effectiveStroke);
            } else {
                drawRoundedRectPath(ctx, width, height, config.cornerRadius, effectiveStroke);
            }
            break;
        case 'ellipse':
            drawEllipsePath(ctx, width, height, effectiveStroke);
            break;
        case 'polygon':
            drawPolygonPath(ctx, width, height, config.polygonSides, effectiveStroke);
            break;
        case 'squircle':
            drawSquirclePath(ctx, width, height, config.squircleCurvature, effectiveStroke);
            break;
        case 'star':
            drawStarPath(ctx, width, height, config.starPoints, config.starDepth, effectiveStroke);
            break;
    }

    ctx.fill();
    ctx.restore();

    // If border is enabled, draw it on the preview (but NOT when downloading the mask)
    if (config.borderEnabled && !config.isDownloading) {
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-width / 2, -height / 2);

        ctx.strokeStyle = config.borderColor;
        ctx.lineWidth = config.borderThickness;
        ctx.globalCompositeOperation = 'source-over';
        
        ctx.beginPath();
        switch (config.shape) {
            case 'rectangle':
                if (config.independentCorners) {
                    drawAdvancedRoundedRectPath(ctx, width, height, config.cornerRadiusTL, config.cornerRadiusTR, config.cornerRadiusBR, config.cornerRadiusBL, config.borderThickness);
                } else {
                    drawRoundedRectPath(ctx, width, height, config.cornerRadius, config.borderThickness);
                }
                break;
            case 'ellipse':
                drawEllipsePath(ctx, width, height, config.borderThickness);
                break;
            case 'polygon':
                drawPolygonPath(ctx, width, height, config.polygonSides, config.borderThickness);
                break;
            case 'squircle':
                drawSquirclePath(ctx, width, height, config.squircleCurvature, config.borderThickness);
                break;
            case 'star':
                drawStarPath(ctx, width, height, config.starPoints, config.starDepth, config.borderThickness);
                break;
        }
        ctx.stroke();
        ctx.restore();
    }

    // Update dimension badge and canvas scale
    updateDimensionBadge();
    updateCanvasScale();
}

function drawAdvancedRoundedRectPath(context, width, height, tl, tr, br, bl, strokeWidth) {
    const padding = strokeWidth / 2;
    const x = padding;
    const y = padding;
    const w = width - (padding * 2);
    const h = height - (padding * 2);

    const maxRadius = Math.min(w, h) / 2;
    const rTL = (tl / 100) * maxRadius;
    const rTR = (tr / 100) * maxRadius;
    const rBR = (br / 100) * maxRadius;
    const rBL = (bl / 100) * maxRadius;

    context.moveTo(x + rTL, y);
    context.lineTo(x + w - rTR, y);
    context.arcTo(x + w, y, x + w, y + rTR, rTR);
    context.lineTo(x + w, y + h - rBR);
    context.arcTo(x + w, y + h, x + w - rBR, y + h, rBR);
    context.lineTo(x + rBL, y + h);
    context.arcTo(x, y + h, x, y + h - rBL, rBL);
    context.lineTo(x, y + rTL);
    context.arcTo(x, y, x + rTL, y, rTL);
    context.closePath();
}

function drawSquirclePath(context, width, height, n, strokeWidth) {
    const padding = strokeWidth / 2;
    const w = width - (padding * 2);
    const h = height - (padding * 2);
    const a = w / 2;
    const b = h / 2;
    const cx = width / 2;
    const cy = height / 2;
    
    // Using a polyline approximation for the superellipse
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
        const t = (i * 2 * Math.PI) / steps;
        
        // Ensure we don't do Math.pow on negative numbers
        const cosT = Math.cos(t);
        const sinT = Math.sin(t);
        const signCos = Math.sign(cosT);
        const signSin = Math.sign(sinT);
        
        const x = cx + signCos * a * Math.pow(Math.abs(cosT), 2 / n);
        const y = cy + signSin * b * Math.pow(Math.abs(sinT), 2 / n);
        
        if (i === 0) {
            context.moveTo(x, y);
        } else {
            context.lineTo(x, y);
        }
    }
    context.closePath();
}

function drawStarPath(context, width, height, points, depth, strokeWidth) {
    const padding = strokeWidth / 2;
    const cx = width / 2;
    const cy = height / 2;
    const outerRadius = (Math.min(width, height) / 2) - padding;
    // depth is percentage 10 to 90, inverted so 90 is deeper
    const innerRadius = outerRadius * (1 - (depth / 100));

    const step = Math.PI / points;
    let rotation = (Math.PI / 2) * 3;
    let x, y;

    for (let i = 0; i < points; i++) {
        x = cx + Math.cos(rotation) * outerRadius;
        y = cy + Math.sin(rotation) * outerRadius;
        if (i === 0) {
            context.moveTo(x, y);
        } else {
            context.lineTo(x, y);
        }
        rotation += step;

        x = cx + Math.cos(rotation) * innerRadius;
        y = cy + Math.sin(rotation) * innerRadius;
        context.lineTo(x, y);
        rotation += step;
    }
    context.closePath();
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

    switch (config.shape) {
        case 'rectangle':
            if (config.independentCorners) {
                drawAdvancedRoundedRectPath(borderCtx, width, height, config.cornerRadiusTL, config.cornerRadiusTR, config.cornerRadiusBR, config.cornerRadiusBL, config.borderThickness);
            } else {
                drawRoundedRectPath(borderCtx, width, height, config.cornerRadius, config.borderThickness);
            }
            break;
        case 'ellipse':
            drawEllipsePath(borderCtx, width, height, config.borderThickness);
            break;
        case 'polygon':
            drawPolygonPath(borderCtx, width, height, config.polygonSides, config.borderThickness);
            break;
        case 'squircle':
            drawSquirclePath(borderCtx, width, height, config.squircleCurvature, config.borderThickness);
            break;
        case 'star':
            drawStarPath(borderCtx, width, height, config.starPoints, config.starDepth, config.borderThickness);
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
    
    // Squircle curvature
    elements.squircleCurvatureGroup.classList.toggle('hidden', shape !== 'squircle');
    
    // Star controls
    elements.starControlsGroup.classList.toggle('hidden', shape !== 'star');
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

/**
 * Handle WebCam toggle
 */
async function toggleWebcam() {
    if (config.webcamActive) {
        // Turn off
        const stream = elements.webcamVideo.srcObject;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        elements.webcamVideo.srcObject = null;
        elements.webcamVideo.style.display = 'none';
        config.webcamActive = false;
        elements.webcamToggle.textContent = '📷 Test with Webcam';
        elements.webcamToggle.style.background = '#9146ff';
        requestDraw();
    } else {
        // Turn on
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
            elements.webcamVideo.srcObject = stream;
            elements.webcamVideo.style.display = 'block';
            config.webcamActive = true;
            elements.webcamToggle.textContent = '⏹ Stop Webcam';
            elements.webcamToggle.style.background = '#e91e63';
            requestDraw();
        } catch (err) {
            alert('Could not access webcam. Please make sure you have a webcam connected and have granted browser permissions.');
            console.error('Webcam error:', err);
        }
    }
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

    // Independent Corners toggle
    elements.independentCorners.addEventListener('change', () => {
        config.independentCorners = elements.independentCorners.checked;
        elements.singleCornerWrap.classList.toggle('hidden', config.independentCorners);
        elements.multiCornerWrap.classList.toggle('hidden', !config.independentCorners);
        requestDraw();
    });

    // Corner radius slider (Global)
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
    
    // Advanced Corner TL
    elements.cornerTL.addEventListener('input', () => { config.cornerRadiusTL = parseInt(elements.cornerTL.value); syncSliderAndInput(elements.cornerTL, elements.cornerTLValue); requestDraw(); });
    elements.cornerTLValue.addEventListener('input', () => { const val = Math.min(50, Math.max(0, parseInt(elements.cornerTLValue.value) || 0)); config.cornerRadiusTL = val; elements.cornerTL.value = val; elements.cornerTLValue.value = val; requestDraw(); });
    // Advanced Corner TR
    elements.cornerTR.addEventListener('input', () => { config.cornerRadiusTR = parseInt(elements.cornerTR.value); syncSliderAndInput(elements.cornerTR, elements.cornerTRValue); requestDraw(); });
    elements.cornerTRValue.addEventListener('input', () => { const val = Math.min(50, Math.max(0, parseInt(elements.cornerTRValue.value) || 0)); config.cornerRadiusTR = val; elements.cornerTR.value = val; elements.cornerTRValue.value = val; requestDraw(); });
    // Advanced Corner BR
    elements.cornerBR.addEventListener('input', () => { config.cornerRadiusBR = parseInt(elements.cornerBR.value); syncSliderAndInput(elements.cornerBR, elements.cornerBRValue); requestDraw(); });
    elements.cornerBRValue.addEventListener('input', () => { const val = Math.min(50, Math.max(0, parseInt(elements.cornerBRValue.value) || 0)); config.cornerRadiusBR = val; elements.cornerBR.value = val; elements.cornerBRValue.value = val; requestDraw(); });
    // Advanced Corner BL
    elements.cornerBL.addEventListener('input', () => { config.cornerRadiusBL = parseInt(elements.cornerBL.value); syncSliderAndInput(elements.cornerBL, elements.cornerBLValue); requestDraw(); });
    elements.cornerBLValue.addEventListener('input', () => { const val = Math.min(50, Math.max(0, parseInt(elements.cornerBLValue.value) || 0)); config.cornerRadiusBL = val; elements.cornerBL.value = val; elements.cornerBLValue.value = val; requestDraw(); });

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

    // Squircle Curvature
    elements.squircleCurvature.addEventListener('input', () => {
        config.squircleCurvature = parseFloat(elements.squircleCurvature.value);
        syncSliderAndInput(elements.squircleCurvature, elements.squircleCurvatureValue);
        requestDraw();
    });
    elements.squircleCurvatureValue.addEventListener('input', () => {
        const val = Math.min(10, Math.max(1, parseFloat(elements.squircleCurvatureValue.value) || 3.5));
        config.squircleCurvature = val;
        elements.squircleCurvature.value = val;
        elements.squircleCurvatureValue.value = val;
        requestDraw();
    });

    // Star Controls
    elements.starPoints.addEventListener('input', () => {
        config.starPoints = parseInt(elements.starPoints.value);
        syncSliderAndInput(elements.starPoints, elements.starPointsValue);
        requestDraw();
    });
    elements.starPointsValue.addEventListener('input', () => {
        const val = Math.min(20, Math.max(3, parseInt(elements.starPointsValue.value) || 5));
        config.starPoints = val;
        elements.starPoints.value = val;
        elements.starPointsValue.value = val;
        requestDraw();
    });
    elements.starDepth.addEventListener('input', () => {
        config.starDepth = parseInt(elements.starDepth.value);
        syncSliderAndInput(elements.starDepth, elements.starDepthValue);
        requestDraw();
    });
    elements.starDepthValue.addEventListener('input', () => {
        const val = Math.min(90, Math.max(10, parseInt(elements.starDepthValue.value) || 50));
        config.starDepth = val;
        elements.starDepth.value = val;
        elements.starDepthValue.value = val;
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
        requestDraw();
    });

    // Border color
    elements.borderColor.addEventListener('input', () => {
        config.borderColor = elements.borderColor.value;
        requestDraw();
    });

    // Border thickness slider
    elements.borderThickness.addEventListener('input', () => {
        config.borderThickness = parseInt(elements.borderThickness.value);
        syncSliderAndInput(elements.borderThickness, elements.borderThicknessValue);
        requestDraw();
    });

    elements.borderThicknessValue.addEventListener('input', () => {
        const value = Math.min(50, Math.max(1, parseInt(elements.borderThicknessValue.value) || 4));
        config.borderThickness = value;
        elements.borderThickness.value = value;
        elements.borderThicknessValue.value = value;
        requestDraw();
    });

    // Download mask button
    elements.downloadMask.addEventListener('click', () => {
        config.isDownloading = true;
        draw(); // Force synchronous draw for solid mask
        
        const timestamp = Date.now();
        const shapeName = config.shape.charAt(0).toUpperCase() + config.shape.slice(1);
        downloadCanvas(elements.canvas, `OBS_Mask_${shapeName}_${config.width}x${config.height}_${timestamp}.png`);
        
        config.isDownloading = false;
        draw(); // Restore transparent preview if webcam is active
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

    // Webcam button
    if (elements.webcamToggle) {
        elements.webcamToggle.addEventListener('click', toggleWebcam);
    }

    // Window resize handler
    window.addEventListener('resize', () => {
        if (config.zoomMode === 'fit') {
            updateCanvasScale();
        }
    });

    // Lazy load tutorial video using Intersection Observer
    if (elements.tutorialVideo && 'IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    video.preload = 'auto'; // Change preload from none
                    // Once data starts loading, play the video
                    video.play().catch(e => console.warn('Autoplay prevented', e));
                    observer.unobserve(video);
                }
            });
        }, { rootMargin: '0px 0px 200px 0px' }); // Trigger 200px before it comes into view

        videoObserver.observe(elements.tutorialVideo);
    }
}

// ============================
// Initialization
// ============================

function init() {
    setupEventListeners();
    updateControlsVisibility();
    draw();
}

// Start the app
document.addEventListener('DOMContentLoaded', init);

/**
 * Stream Overlay Generator
 * Canvas-based overlay/webcam frame generator
 */

// ============================
// Configuration
// ============================

const config = {
    type: 'webcam-frame',
    width: 640,
    height: 360,
    text: '',
    primaryColor: '#9146FF',
    secondaryColor: '#772CE8',
    borderThickness: 8,
    cornerRadius: 16,
    glowEffect: true
};

// ============================
// DOM Elements
// ============================

const elements = {
    canvas: document.getElementById('overlay-canvas'),
    overlayTypes: document.querySelectorAll('.overlay-type-btn'),
    sizePresets: document.querySelectorAll('.size-btn'),
    overlayText: document.getElementById('overlay-text'),
    textGroup: document.getElementById('text-group'),
    primaryColor: document.getElementById('primary-color'),
    secondaryColor: document.getElementById('secondary-color'),
    colorThemes: document.querySelectorAll('.theme-btn'),
    borderThickness: document.getElementById('border-thickness'),
    thicknessValue: document.getElementById('thickness-value'),
    cornerRadius: document.getElementById('corner-radius'),
    radiusValue: document.getElementById('radius-value'),
    glowEffect: document.getElementById('glow-effect'),
    downloadBtn: document.getElementById('download-btn'),
    sizeInfo: document.getElementById('size-info'),
    previewWrapper: document.getElementById('preview-wrapper')
};

const ctx = elements.canvas.getContext('2d');

// ============================
// Drawing Functions
// ============================

function draw() {
    const { type, width, height, text, primaryColor, secondaryColor, borderThickness, cornerRadius, glowEffect } = config;

    // Set canvas size
    elements.canvas.width = width;
    elements.canvas.height = height;

    // Clear canvas with transparency
    ctx.clearRect(0, 0, width, height);

    // Draw based on type
    switch (type) {
        case 'webcam-frame':
            drawWebcamFrame(width, height, primaryColor, secondaryColor, borderThickness, cornerRadius, glowEffect);
            break;
        case 'starting-soon':
            drawSceneScreen(width, height, primaryColor, secondaryColor, cornerRadius, glowEffect, text || 'STARTING SOON', '⏳');
            break;
        case 'brb':
            drawSceneScreen(width, height, primaryColor, secondaryColor, cornerRadius, glowEffect, text || 'BE RIGHT BACK', '☕');
            break;
        case 'stream-ending':
            drawSceneScreen(width, height, primaryColor, secondaryColor, cornerRadius, glowEffect, text || 'STREAM ENDING', '👋');
            break;
    }

    // Update size info
    elements.sizeInfo.textContent = `${width} × ${height} pixels`;
}

function drawWebcamFrame(width, height, primary, secondary, thickness, radius, glow) {
    ctx.save();

    // Create gradient for border
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, primary);
    gradient.addColorStop(1, secondary);

    // Outer glow effect
    if (glow) {
        ctx.shadowColor = primary;
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    // Draw outer rounded rectangle (filled)
    ctx.beginPath();
    roundedRect(0, 0, width, height, radius);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Cut out inner area (transparent hole)
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    const innerRadius = Math.max(0, radius - thickness / 2);
    roundedRect(thickness, thickness, width - thickness * 2, height - thickness * 2, innerRadius);
    ctx.fill();

    ctx.restore();
}

function drawSceneScreen(width, height, primary, secondary, radius, glow, text, icon) {
    ctx.save();

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, primary);
    gradient.addColorStop(1, secondary);

    // Outer glow
    if (glow) {
        ctx.shadowColor = primary;
        ctx.shadowBlur = 30;
    }

    // Draw background
    ctx.beginPath();
    roundedRect(0, 0, width, height, radius);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Reset shadow for text
    ctx.shadowBlur = 0;

    // Draw icon
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const iconSize = Math.min(width, height) * 0.12;
    ctx.font = `${iconSize}px Arial, sans-serif`;
    ctx.fillStyle = 'white';
    ctx.fillText(icon, width / 2, height / 2 - iconSize);

    // Draw text
    const fontSize = Math.min(width * 0.05, 42);
    ctx.font = `800 ${fontSize}px Inter, sans-serif`;
    ctx.fillStyle = 'white';
    ctx.fillText(text.toUpperCase(), width / 2, height / 2 + fontSize * 0.8);

    // Add subtle pattern overlay
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < width; i += 4) {
        ctx.fillStyle = i % 8 === 0 ? 'white' : 'transparent';
        ctx.fillRect(i, 0, 2, height);
    }

    ctx.restore();
}

function roundedRect(x, y, width, height, radius) {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
}

// ============================
// Utility Functions
// ============================

function downloadOverlay() {
    const link = document.createElement('a');
    link.download = `stream-overlay-${config.type}-${config.width}x${config.height}.png`;
    link.href = elements.canvas.toDataURL('image/png');
    link.click();
}

function updateTextVisibility() {
    // Show text input for scene screens, hide for webcam frame
    if (config.type === 'webcam-frame') {
        elements.textGroup.style.display = 'none';
    } else {
        elements.textGroup.style.display = 'block';
    }
}

// ============================
// Event Listeners
// ============================

function setupEventListeners() {
    // Overlay type buttons
    elements.overlayTypes.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.overlayTypes.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            config.type = btn.dataset.type;
            updateTextVisibility();
            draw();
        });
    });

    // Size presets
    elements.sizePresets.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.sizePresets.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            config.width = parseInt(btn.dataset.width);
            config.height = parseInt(btn.dataset.height);
            draw();
        });
    });

    // Text input
    elements.overlayText.addEventListener('input', () => {
        config.text = elements.overlayText.value;
        draw();
    });

    // Color pickers
    elements.primaryColor.addEventListener('input', () => {
        config.primaryColor = elements.primaryColor.value;
        draw();
    });

    elements.secondaryColor.addEventListener('input', () => {
        config.secondaryColor = elements.secondaryColor.value;
        draw();
    });

    // Color themes
    elements.colorThemes.forEach(btn => {
        btn.addEventListener('click', () => {
            config.primaryColor = btn.dataset.primary;
            config.secondaryColor = btn.dataset.secondary;
            elements.primaryColor.value = btn.dataset.primary;
            elements.secondaryColor.value = btn.dataset.secondary;
            draw();
        });
    });

    // Border thickness
    elements.borderThickness.addEventListener('input', () => {
        config.borderThickness = parseInt(elements.borderThickness.value);
        elements.thicknessValue.textContent = config.borderThickness;
        draw();
    });

    // Corner radius
    elements.cornerRadius.addEventListener('input', () => {
        config.cornerRadius = parseInt(elements.cornerRadius.value);
        elements.radiusValue.textContent = config.cornerRadius;
        draw();
    });

    // Glow effect toggle
    elements.glowEffect.addEventListener('change', () => {
        config.glowEffect = elements.glowEffect.checked;
        draw();
    });

    // Download button
    elements.downloadBtn.addEventListener('click', downloadOverlay);
}

// ============================
// Initialization
// ============================

function init() {
    // Load Inter font
    const font = new FontFace('Inter', 'url(https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2)');
    font.load().then(() => {
        document.fonts.add(font);
        setupEventListeners();
        updateTextVisibility();
        draw();
    }).catch(() => {
        setupEventListeners();
        updateTextVisibility();
        draw();
    });
}

document.addEventListener('DOMContentLoaded', init);

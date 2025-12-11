/**
 * Twitch Panel Maker
 * Canvas-based panel generator
 */

// ============================
// Configuration
// ============================

const PANEL_WIDTH = 320;
const PANEL_HEIGHT = 160;

const config = {
    type: 'about',
    icon: '👤',
    text: 'ABOUT ME',
    style: 'gradient',
    primaryColor: '#9146FF',
    secondaryColor: '#772CE8',
    textColor: '#FFFFFF',
    cornerRadius: 12,
    showIcon: true
};

// ============================
// DOM Elements
// ============================

const elements = {
    canvas: document.getElementById('panel-canvas'),
    panelTypes: document.querySelectorAll('.panel-type-btn'),
    stylePresets: document.querySelectorAll('.style-btn'),
    panelText: document.getElementById('panel-text'),
    primaryColor: document.getElementById('primary-color'),
    secondaryColor: document.getElementById('secondary-color'),
    textColor: document.getElementById('text-color'),
    colorThemes: document.querySelectorAll('.theme-btn'),
    cornerRadius: document.getElementById('corner-radius'),
    radiusValue: document.getElementById('radius-value'),
    showIcon: document.getElementById('show-icon'),
    downloadBtn: document.getElementById('download-btn')
};

const ctx = elements.canvas.getContext('2d');

// ============================
// Drawing Functions
// ============================

function draw() {
    const { style, primaryColor, secondaryColor, textColor, cornerRadius, text, icon, showIcon } = config;

    // Clear canvas
    ctx.clearRect(0, 0, PANEL_WIDTH, PANEL_HEIGHT);

    // Draw background based on style
    drawBackground(style, primaryColor, secondaryColor, cornerRadius);

    // Draw icon and text
    drawContent(text, icon, textColor, showIcon);
}

function drawBackground(style, primary, secondary, radius) {
    ctx.save();

    // Create rounded rect path
    ctx.beginPath();
    roundedRect(0, 0, PANEL_WIDTH, PANEL_HEIGHT, radius);

    switch (style) {
        case 'gradient':
            const gradient = ctx.createLinearGradient(0, 0, PANEL_WIDTH, PANEL_HEIGHT);
            gradient.addColorStop(0, primary);
            gradient.addColorStop(1, secondary);
            ctx.fillStyle = gradient;
            ctx.fill();
            break;

        case 'solid':
            ctx.fillStyle = primary;
            ctx.fill();
            break;

        case 'outline':
            ctx.fillStyle = '#18181b';
            ctx.fill();
            ctx.strokeStyle = primary;
            ctx.lineWidth = 4;
            ctx.stroke();
            break;

        case 'glass':
            // Glass effect with semi-transparent fill
            const glassGradient = ctx.createLinearGradient(0, 0, 0, PANEL_HEIGHT);
            glassGradient.addColorStop(0, hexToRgba(primary, 0.4));
            glassGradient.addColorStop(1, hexToRgba(secondary, 0.2));
            ctx.fillStyle = glassGradient;
            ctx.fill();
            // Add border
            ctx.strokeStyle = hexToRgba(primary, 0.6);
            ctx.lineWidth = 2;
            ctx.stroke();
            // Add shine
            ctx.beginPath();
            roundedRect(4, 4, PANEL_WIDTH - 8, PANEL_HEIGHT / 3, radius - 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fill();
            break;

        case 'neon':
            // Dark background
            ctx.fillStyle = '#0e0e10';
            ctx.fill();
            // Neon glow effect
            ctx.shadowColor = primary;
            ctx.shadowBlur = 20;
            ctx.strokeStyle = primary;
            ctx.lineWidth = 3;
            ctx.stroke();
            // Inner glow
            ctx.shadowBlur = 10;
            ctx.stroke();
            break;
    }

    ctx.restore();
}

function drawContent(text, icon, color, showIcon) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;

    const centerX = PANEL_WIDTH / 2;
    const centerY = PANEL_HEIGHT / 2;

    if (showIcon) {
        // Draw icon
        ctx.font = '36px Arial, sans-serif';
        ctx.fillText(icon, centerX, centerY - 20);

        // Draw text
        ctx.font = '700 18px Inter, sans-serif';
        ctx.fillText(text.toUpperCase(), centerX, centerY + 30);
    } else {
        // Draw text only, centered
        ctx.font = '700 24px Inter, sans-serif';
        ctx.fillText(text.toUpperCase(), centerX, centerY);
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

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function downloadPanel() {
    const link = document.createElement('a');
    const panelType = config.text.toLowerCase().replace(/\s+/g, '-');
    link.download = `twitch-panel-${panelType}.png`;
    link.href = elements.canvas.toDataURL('image/png');
    link.click();
}

// ============================
// Event Listeners
// ============================

function setupEventListeners() {
    // Panel type buttons
    elements.panelTypes.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.panelTypes.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            config.type = btn.dataset.type;
            config.icon = btn.dataset.icon;
            config.text = btn.dataset.text;

            elements.panelText.value = config.text;
            draw();
        });
    });

    // Style presets
    elements.stylePresets.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.stylePresets.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            config.style = btn.dataset.style;
            draw();
        });
    });

    // Text input
    elements.panelText.addEventListener('input', () => {
        config.text = elements.panelText.value || 'PANEL';
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

    elements.textColor.addEventListener('input', () => {
        config.textColor = elements.textColor.value;
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

    // Corner radius
    elements.cornerRadius.addEventListener('input', () => {
        config.cornerRadius = parseInt(elements.cornerRadius.value);
        elements.radiusValue.textContent = config.cornerRadius;
        draw();
    });

    // Show icon toggle
    elements.showIcon.addEventListener('change', () => {
        config.showIcon = elements.showIcon.checked;
        draw();
    });

    // Download button
    elements.downloadBtn.addEventListener('click', downloadPanel);
}

// ============================
// Initialization
// ============================

function init() {
    // Load Inter font for canvas
    const font = new FontFace('Inter', 'url(https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2)');
    font.load().then(() => {
        document.fonts.add(font);
        setupEventListeners();
        draw();
    }).catch(() => {
        // Fallback if font fails to load
        setupEventListeners();
        draw();
    });
}

// Start the app
document.addEventListener('DOMContentLoaded', init);

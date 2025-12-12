/**
 * Stream Quality Checker
 * Calculates Bits Per Pixel (BPP) to assess stream quality
 */

// DOM Elements
const elements = {
    resolutionSelect: document.getElementById('resolution-select'),
    customResGroup: document.getElementById('custom-res-group'),
    customWidth: document.getElementById('custom-width'),
    customHeight: document.getElementById('custom-height'),
    fpsSelect: document.getElementById('fps-select'),
    bitrateSlider: document.getElementById('bitrate-slider'),
    bitrateInput: document.getElementById('bitrate-input'),
    motionButtons: document.querySelectorAll('.toggle-btn[data-motion]'),
    meterFill: document.getElementById('meter-fill'),
    bppValue: document.getElementById('bpp-value'),
    qualityLabel: document.getElementById('quality-label'),
    recTitle: document.getElementById('rec-title'),
    recText: document.getElementById('rec-text'),
    recommendationBox: document.getElementById('recommendation-box')
};

// State
let motionLevel = 'medium'; // 'low', 'medium', 'high'

// Quality thresholds (adjusted by motion level)
const thresholds = {
    low: { poor: 0.03, ok: 0.05, good: 0.08 },
    medium: { poor: 0.05, ok: 0.08, good: 0.1 },
    high: { poor: 0.07, ok: 0.1, good: 0.12 }
};

// Initialize
function init() {
    // Resolution select
    elements.resolutionSelect.addEventListener('change', () => {
        if (elements.resolutionSelect.value === 'custom') {
            elements.customResGroup.style.display = 'block';
        } else {
            elements.customResGroup.style.display = 'none';
        }
        calculate();
    });

    // Custom resolution inputs
    elements.customWidth.addEventListener('input', calculate);
    elements.customHeight.addEventListener('input', calculate);

    // FPS select
    elements.fpsSelect.addEventListener('change', calculate);

    // Bitrate slider
    elements.bitrateSlider.addEventListener('input', () => {
        elements.bitrateInput.value = elements.bitrateSlider.value;
        calculate();
    });

    // Bitrate input
    elements.bitrateInput.addEventListener('input', () => {
        elements.bitrateSlider.value = Math.min(elements.bitrateInput.value, 20000);
        calculate();
    });

    // Motion toggle
    elements.motionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.motionButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            motionLevel = btn.dataset.motion;
            calculate();
        });
    });

    // Initial calculation
    calculate();
}

// Get resolution
function getResolution() {
    const selectValue = elements.resolutionSelect.value;
    if (selectValue === 'custom') {
        return {
            width: parseInt(elements.customWidth.value) || 1920,
            height: parseInt(elements.customHeight.value) || 1080
        };
    }
    const [width, height] = selectValue.split('x').map(Number);
    return { width, height };
}

// Calculate BPP and quality
function calculate() {
    const { width, height } = getResolution();
    const fps = parseInt(elements.fpsSelect.value);
    const bitrateKbps = parseInt(elements.bitrateInput.value) || 6000;

    // BPP formula: bitrate / (width * height * fps)
    // Convert bitrate from Kbps to bps for calculation
    const bitrateBps = bitrateKbps * 1000;
    const pixelsPerSecond = width * height * fps;
    const bpp = bitrateBps / pixelsPerSecond;

    // Update BPP display
    elements.bppValue.textContent = bpp.toFixed(3) + ' BPP';

    // Determine quality level
    const t = thresholds[motionLevel];
    let qualityClass, qualityText, recTitle, recText;

    if (bpp < t.poor) {
        qualityClass = 'poor';
        qualityText = '❌ Poor Quality';
        recTitle = '⚠️ Action Required';
        recText = `Your bitrate is too low for ${width}x${height}. Either increase bitrate to ${Math.ceil(t.ok * pixelsPerSecond / 1000)} Kbps or lower resolution to 720p.`;
    } else if (bpp < t.ok) {
        qualityClass = 'ok';
        qualityText = '⚠️ Acceptable';
        recTitle = '💡 Could Be Better';
        recText = `Your stream will be watchable but may show artifacts in fast motion. Consider increasing bitrate or lowering resolution.`;
    } else if (bpp < t.good) {
        qualityClass = 'good';
        qualityText = '✅ Good Quality';
        recTitle = '👍 Settings Look Good';
        recText = `Your bitrate-to-resolution ratio is well balanced. Most viewers won't notice compression artifacts.`;
    } else {
        qualityClass = 'great';
        qualityText = '🌟 Excellent Quality';
        recTitle = '🎉 Optimal Settings';
        recText = `You're allocating plenty of bits per pixel. Your stream will look very sharp!`;
    }

    // Apply quality class
    elements.bppValue.className = 'bpp-value ' + qualityClass;
    elements.qualityLabel.className = 'quality-label ' + qualityClass;
    elements.qualityLabel.textContent = qualityText;
    elements.recTitle.textContent = recTitle;
    elements.recText.textContent = recText;

    // Update recommendation box border color
    const borderColors = {
        poor: '#ff4757',
        ok: '#ffaa00',
        good: '#00d26a',
        great: '#00ff88'
    };
    elements.recommendationBox.style.borderLeftColor = borderColors[qualityClass];

    // Update meter position (0-100%)
    // Map BPP to position: 0 = 0%, 0.15+ = 100%
    const meterPos = Math.min(Math.max(bpp / 0.15, 0), 1) * 100;
    elements.meterFill.style.left = `calc(${meterPos}% - 2px)`;
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);

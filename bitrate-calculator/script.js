/**
 * OBS Bitrate Calculator
 * Main Application Script
 */

// ============================
// Configuration
// ============================

const resolutions = {
    '720p': { width: 1280, height: 720, pixels: 1280 * 720 },
    '1080p': { width: 1920, height: 1080, pixels: 1920 * 1080 },
    '1440p': { width: 2560, height: 1440, pixels: 2560 * 1440 },
    '4k': { width: 3840, height: 2160, pixels: 3840 * 2160 }
};

// Motion factors affect required bitrate
const contentFactors = {
    'gaming-fast': 1.0,    // High motion (FPS, racing) - needs max bitrate
    'gaming-medium': 0.85, // Standard gaming - slightly less
    'chatting': 0.5,       // Low motion - much less needed
    'sports': 1.1          // Very high motion - needs even more
};

// Platform bitrate limits (Kbps)
const platformLimits = {
    'twitch': 6000,
    'youtube': 51000,
    'kick': 8000,
    'facebook': 8000
};

// Recommended bitrate ranges per resolution (at 60fps, gaming)
const bitrateRanges = {
    '720p': { min: 3000, optimal: 4500, max: 6000 },
    '1080p': { min: 4500, optimal: 6000, max: 9000 },
    '1440p': { min: 9000, optimal: 12000, max: 18000 },
    '4k': { min: 20000, optimal: 35000, max: 51000 }
};

// ============================
// DOM Elements
// ============================

const elements = {
    resolution: document.getElementById('resolution'),
    fps: document.getElementById('fps'),
    content: document.getElementById('content'),
    platform: document.getElementById('platform'),
    upload: document.getElementById('upload'),
    calculateBtn: document.getElementById('calculate-btn'),
    recommendedBitrate: document.getElementById('recommended-bitrate'),
    bitrateRange: document.getElementById('bitrate-range'),
    platformLimit: document.getElementById('platform-limit'),
    uploadHeadroom: document.getElementById('upload-headroom'),
    warningBox: document.getElementById('warning-box'),
    warningText: document.getElementById('warning-text'),
    tipsList: document.getElementById('tips-list')
};

// ============================
// Calculation Functions
// ============================

/**
 * Calculate optimal bitrate based on settings
 */
function calculateBitrate() {
    const resolution = elements.resolution.value;
    const fps = parseInt(elements.fps.value);
    const content = elements.content.value;
    const platform = elements.platform.value;
    const uploadMbps = parseFloat(elements.upload.value) || 10;

    // Get base values
    const resData = resolutions[resolution];
    const contentFactor = contentFactors[content];
    const platformMax = platformLimits[platform];
    const range = bitrateRanges[resolution];

    // Calculate FPS factor (60fps needs ~1.5x more than 30fps)
    const fpsFactor = fps === 60 ? 1.0 : 0.65;

    // Calculate recommended bitrate
    // Formula: optimal base * fps factor * content factor
    let recommended = Math.round(range.optimal * fpsFactor * contentFactor);

    // Calculate range
    let minBitrate = Math.round(range.min * fpsFactor * contentFactor);
    let maxBitrate = Math.round(range.max * fpsFactor * contentFactor);

    // Apply platform limits
    recommended = Math.min(recommended, platformMax);
    maxBitrate = Math.min(maxBitrate, platformMax);

    // Calculate upload headroom
    const uploadKbps = uploadMbps * 1000;
    const usagePercent = Math.round((recommended / uploadKbps) * 100);
    const headroom = 100 - usagePercent;

    // Update UI
    updateResults(recommended, minBitrate, maxBitrate, platformMax, headroom, uploadKbps);
    checkWarnings(recommended, uploadKbps, platformMax, resolution, platform);
    updateTips(platform, resolution, fps);
}

/**
 * Update the results display
 */
function updateResults(recommended, min, max, platformMax, headroom, uploadKbps) {
    elements.recommendedBitrate.textContent = recommended.toLocaleString();
    elements.bitrateRange.textContent = `${min.toLocaleString()} - ${max.toLocaleString()} Kbps`;
    elements.platformLimit.textContent = `${platformMax.toLocaleString()} Kbps`;

    if (headroom < 0) {
        elements.uploadHeadroom.textContent = 'Insufficient!';
        elements.uploadHeadroom.style.color = 'var(--error)';
    } else if (headroom < 20) {
        elements.uploadHeadroom.textContent = `${headroom}% (Low)`;
        elements.uploadHeadroom.style.color = 'var(--warning)';
    } else {
        elements.uploadHeadroom.textContent = `${headroom}% ✓`;
        elements.uploadHeadroom.style.color = 'var(--success)';
    }
}

/**
 * Check for warnings and display them
 */
function checkWarnings(recommended, uploadKbps, platformMax, resolution, platform) {
    const warnings = [];

    // Upload speed warning
    if (recommended > uploadKbps * 0.8) {
        warnings.push(`Your upload speed may be too low. Recommended: at least ${Math.ceil(recommended / 800)} Mbps upload.`);
    }

    // Platform-specific warnings
    if (platform === 'twitch' && resolution === '1440p') {
        warnings.push('Twitch\'s 6000 Kbps limit may not provide optimal quality at 1440p. Consider 1080p instead.');
    }

    if (platform === 'twitch' && resolution === '4k') {
        warnings.push('Twitch does not support 4K streaming. Maximum supported is 1080p at 60fps.');
    }

    // Show or hide warning box
    if (warnings.length > 0) {
        elements.warningText.textContent = warnings.join(' ');
        elements.warningBox.classList.remove('hidden');
    } else {
        elements.warningBox.classList.add('hidden');
    }
}

/**
 * Update tips based on settings
 */
function updateTips(platform, resolution, fps) {
    const tips = [
        'Use CBR (Constant Bitrate) for stable streaming',
        'Set Keyframe Interval to 2 seconds'
    ];

    if (platform === 'twitch') {
        tips.push('Twitch Partners get transcoding priority for viewer quality options');
    }

    if (platform === 'youtube') {
        tips.push('YouTube recommends using a higher bitrate than Twitch for better VOD quality');
    }

    if (fps === 60) {
        tips.push('60 FPS requires more bitrate but provides smoother gameplay footage');
    }

    if (resolution === '720p') {
        tips.push('720p is great for viewers with slower internet connections');
    }

    tips.push('Leave 20-30% upload speed headroom for stability');

    elements.tipsList.innerHTML = tips.map(tip => `<li>${tip}</li>`).join('');
}

// ============================
// Event Listeners
// ============================

function setupEventListeners() {
    elements.calculateBtn.addEventListener('click', calculateBitrate);

    // Auto-calculate on any input change
    elements.resolution.addEventListener('change', calculateBitrate);
    elements.fps.addEventListener('change', calculateBitrate);
    elements.content.addEventListener('change', calculateBitrate);
    elements.platform.addEventListener('change', calculateBitrate);
    elements.upload.addEventListener('input', debounce(calculateBitrate, 300));
}

/**
 * Debounce function for input fields
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================
// Initialization
// ============================

function init() {
    setupEventListeners();
    // Calculate with default values on page load
    calculateBitrate();
}

// Start the app
document.addEventListener('DOMContentLoaded', init);

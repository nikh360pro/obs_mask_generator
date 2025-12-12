/**
 * OBS Recording Size Calculator
 * Estimates file size based on bitrate and duration
 */

// DOM Elements
const elements = {
    bitrateSlider: document.getElementById('bitrate-slider'),
    bitrateInput: document.getElementById('bitrate-input'),
    presetButtons: document.querySelectorAll('.preset-btn'),
    hoursInput: document.getElementById('hours-input'),
    minutesInput: document.getElementById('minutes-input'),
    codecButtons: document.querySelectorAll('.toggle-btn[data-codec]'),
    audioBitrate: document.getElementById('audio-bitrate'),
    sizeValue: document.getElementById('size-value'),
    sizeLabel: document.getElementById('size-label'),
    videoSize: document.getElementById('video-size'),
    audioSize: document.getElementById('audio-size'),
    warningBox: document.getElementById('warning-box'),
    ref30min: document.getElementById('ref-30min'),
    ref1hr: document.getElementById('ref-1hr'),
    ref2hr: document.getElementById('ref-2hr'),
    ref4hr: document.getElementById('ref-4hr')
};

// State
let codec = 'h264'; // 'h264' or 'h265'

// Initialize
function init() {
    // Bitrate slider
    elements.bitrateSlider.addEventListener('input', () => {
        elements.bitrateInput.value = elements.bitrateSlider.value;
        updatePresetButtons();
        calculate();
    });

    // Bitrate input
    elements.bitrateInput.addEventListener('input', () => {
        elements.bitrateSlider.value = elements.bitrateInput.value;
        updatePresetButtons();
        calculate();
    });

    // Preset buttons
    elements.presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const bitrate = parseInt(btn.dataset.bitrate);
            elements.bitrateInput.value = bitrate;
            elements.bitrateSlider.value = bitrate;
            updatePresetButtons();
            calculate();
        });
    });

    // Duration inputs
    elements.hoursInput.addEventListener('input', calculate);
    elements.minutesInput.addEventListener('input', calculate);

    // Codec toggle
    elements.codecButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.codecButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            codec = btn.dataset.codec;
            calculate();
        });
    });

    // Audio bitrate
    elements.audioBitrate.addEventListener('change', calculate);

    // Initial calculation
    calculate();
}

// Update preset button active states
function updatePresetButtons() {
    const currentBitrate = parseInt(elements.bitrateInput.value);
    elements.presetButtons.forEach(btn => {
        const presetBitrate = parseInt(btn.dataset.bitrate);
        btn.classList.toggle('active', presetBitrate === currentBitrate);
    });
}

// Calculate file size
function calculate() {
    const videoBitrateKbps = parseInt(elements.bitrateInput.value) || 6000;
    const audioBitrateKbps = parseInt(elements.audioBitrate.value) || 320;
    const hours = parseInt(elements.hoursInput.value) || 0;
    const minutes = parseInt(elements.minutesInput.value) || 0;
    const totalSeconds = (hours * 3600) + (minutes * 60);

    if (totalSeconds === 0) {
        elements.sizeValue.textContent = '0 GB';
        elements.sizeLabel.textContent = 'Enter a duration';
        return;
    }

    // Calculate sizes in bytes
    // Formula: (bitrate_kbps * 1000 / 8) * seconds = bytes
    let videoSizeBytes = (videoBitrateKbps * 1000 / 8) * totalSeconds;
    let audioSizeBytes = (audioBitrateKbps * 1000 / 8) * totalSeconds;

    // Apply H.265 reduction (approximately 30% smaller)
    if (codec === 'h265') {
        videoSizeBytes *= 0.7;
    }

    const totalSizeBytes = videoSizeBytes + audioSizeBytes;

    // Convert to GB
    const videoSizeGB = videoSizeBytes / (1024 * 1024 * 1024);
    const audioSizeGB = audioSizeBytes / (1024 * 1024 * 1024);
    const totalSizeGB = totalSizeBytes / (1024 * 1024 * 1024);

    // Update display
    elements.sizeValue.textContent = formatSize(totalSizeGB);
    elements.sizeLabel.textContent = `For ${formatDuration(hours, minutes)} at ${videoBitrateKbps.toLocaleString()} Kbps`;
    elements.videoSize.textContent = formatSize(videoSizeGB);
    elements.audioSize.textContent = formatSize(audioSizeGB);

    // Show warning for large files
    if (totalSizeGB > 50) {
        elements.warningBox.style.display = 'flex';
    } else {
        elements.warningBox.style.display = 'none';
    }

    // Update quick reference table
    updateReferenceTable(videoBitrateKbps, audioBitrateKbps);
}

// Format size for display
function formatSize(sizeGB) {
    if (sizeGB < 1) {
        return (sizeGB * 1024).toFixed(0) + ' MB';
    } else if (sizeGB >= 1000) {
        return (sizeGB / 1024).toFixed(2) + ' TB';
    } else {
        return sizeGB.toFixed(2) + ' GB';
    }
}

// Format duration for display
function formatDuration(hours, minutes) {
    if (hours === 0) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else if (minutes === 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
        return `${hours}h ${minutes}m`;
    }
}

// Update reference table
function updateReferenceTable(videoBitrateKbps, audioBitrateKbps) {
    const durations = [
        { el: elements.ref30min, seconds: 1800 },
        { el: elements.ref1hr, seconds: 3600 },
        { el: elements.ref2hr, seconds: 7200 },
        { el: elements.ref4hr, seconds: 14400 }
    ];

    durations.forEach(({ el, seconds }) => {
        let videoBytes = (videoBitrateKbps * 1000 / 8) * seconds;
        let audioBytes = (audioBitrateKbps * 1000 / 8) * seconds;

        if (codec === 'h265') {
            videoBytes *= 0.7;
        }

        const totalGB = (videoBytes + audioBytes) / (1024 * 1024 * 1024);
        el.textContent = formatSize(totalGB);
    });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);

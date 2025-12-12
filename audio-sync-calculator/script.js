/**
 * OBS Audio Sync Calculator
 * Converts frame delay to milliseconds for OBS Sync Offset
 */

// DOM Elements
const elements = {
    fpsSelect: document.getElementById('fps-select'),
    customFpsGroup: document.getElementById('custom-fps-group'),
    customFps: document.getElementById('custom-fps'),
    framesInput: document.getElementById('frames-input'),
    toggleButtons: document.querySelectorAll('.toggle-btn'),
    calculateBtn: document.getElementById('calculate-btn'),
    offsetValue: document.getElementById('offset-value'),
    offsetLabel: document.getElementById('offset-label'),
    offsetCopy: document.getElementById('offset-copy'),
    actionButtons: document.getElementById('action-buttons'),
    copyBtn: document.getElementById('copy-btn')
};

// State
let direction = 'behind'; // 'behind' or 'ahead'
let lastCalculatedOffset = 0;

// Initialize
function init() {
    // FPS Select change
    elements.fpsSelect.addEventListener('change', handleFpsChange);
    
    // Toggle buttons
    elements.toggleButtons.forEach(btn => {
        btn.addEventListener('click', () => handleDirectionToggle(btn));
    });
    
    // Calculate button
    elements.calculateBtn.addEventListener('click', calculateOffset);
    
    // Copy button
    elements.copyBtn.addEventListener('click', copyOffset);
    
    // Auto-calculate on input change
    elements.framesInput.addEventListener('input', calculateOffset);
    elements.customFps.addEventListener('input', calculateOffset);
}

// Handle FPS dropdown change
function handleFpsChange() {
    const value = elements.fpsSelect.value;
    if (value === 'custom') {
        elements.customFpsGroup.style.display = 'block';
    } else {
        elements.customFpsGroup.style.display = 'none';
    }
    calculateOffset();
}

// Handle direction toggle
function handleDirectionToggle(clickedBtn) {
    elements.toggleButtons.forEach(btn => btn.classList.remove('active'));
    clickedBtn.classList.add('active');
    direction = clickedBtn.dataset.direction;
    calculateOffset();
}

// Get current FPS value
function getFps() {
    const selectValue = elements.fpsSelect.value;
    if (selectValue === 'custom') {
        return parseFloat(elements.customFps.value) || 60;
    }
    return parseFloat(selectValue);
}

// Calculate the offset
function calculateOffset() {
    const fps = getFps();
    const frames = parseFloat(elements.framesInput.value) || 0;
    
    if (fps <= 0 || frames < 0) {
        elements.offsetValue.textContent = '0 ms';
        elements.offsetLabel.textContent = 'Enter valid values';
        elements.actionButtons.style.display = 'none';
        return;
    }
    
    // Formula: (frames / fps) * 1000
    let offsetMs = Math.round((frames / fps) * 1000);
    
    // Apply direction
    // If audio is BEHIND video, we need NEGATIVE offset (advance audio)
    // If audio is AHEAD of video, we need POSITIVE offset (delay audio)
    if (direction === 'behind') {
        offsetMs = -offsetMs;
    }
    
    lastCalculatedOffset = offsetMs;
    
    // Update display
    const sign = offsetMs >= 0 ? '+' : '';
    elements.offsetValue.textContent = `${sign}${offsetMs} ms`;
    elements.offsetValue.className = 'result-value ' + (offsetMs >= 0 ? 'positive' : 'negative');
    
    // Update label
    if (offsetMs === 0) {
        elements.offsetLabel.textContent = 'No offset needed';
    } else if (offsetMs > 0) {
        elements.offsetLabel.textContent = 'This will DELAY your audio';
    } else {
        elements.offsetLabel.textContent = 'This will ADVANCE your audio';
    }
    
    // Update copy code
    elements.offsetCopy.textContent = offsetMs;
    
    // Show action buttons
    elements.actionButtons.style.display = 'flex';
}

// Copy offset to clipboard
function copyOffset() {
    const textToCopy = lastCalculatedOffset.toString();
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        elements.copyBtn.classList.add('copied');
        elements.copyBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
            Copied!
        `;
        
        setTimeout(() => {
            elements.copyBtn.classList.remove('copied');
            elements.copyBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy Value
            `;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);

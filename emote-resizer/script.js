/**
 * Twitch Emote Resizer
 * Main Application Script
 */

// ============================
// Configuration
// ============================

const platformSizes = {
    twitch: [
        { width: 28, height: 28, label: '1x' },
        { width: 56, height: 56, label: '2x' },
        { width: 112, height: 112, label: '3x' }
    ],
    discord: [
        { width: 128, height: 128, label: 'Emoji' },
        { width: 64, height: 64, label: 'Small' },
        { width: 32, height: 32, label: 'Tiny' }
    ],
    '7tv': [
        { width: 128, height: 128, label: '1x' },
        { width: 64, height: 64, label: '0.5x' },
        { width: 32, height: 32, label: '0.25x' }
    ],
    bttv: [
        { width: 28, height: 28, label: '1x' },
        { width: 56, height: 56, label: '2x' },
        { width: 112, height: 112, label: '3x' }
    ]
};

// ============================
// State
// ============================

let currentImage = null;
let currentPlatform = 'twitch';
let resizedImages = [];

// ============================
// DOM Elements
// ============================

const elements = {
    dropZone: document.getElementById('drop-zone'),
    fileInput: document.getElementById('file-input'),
    fileInfo: document.getElementById('file-info'),
    fileName: document.getElementById('file-name'),
    removeBtn: document.getElementById('remove-btn'),
    platformBtns: document.querySelectorAll('.platform-btn'),
    previewContainer: document.getElementById('preview-container'),
    downloadAllBtn: document.getElementById('download-all-btn')
};

// ============================
// Image Processing
// ============================

/**
 * Load image from file
 */
function loadImage(file) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            reject(new Error('Please upload an image file'));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

/**
 * Resize image to specified dimensions
 */
function resizeImage(img, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Use high quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Calculate aspect ratio fit
    const scale = Math.min(width / img.width, height / img.height);
    const x = (width - img.width * scale) / 2;
    const y = (height - img.height * scale) / 2;

    // Draw image centered and scaled
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

    return canvas.toDataURL('image/png');
}

/**
 * Process image for current platform
 */
function processImage(img) {
    const sizes = platformSizes[currentPlatform];
    resizedImages = sizes.map(size => ({
        ...size,
        dataUrl: resizeImage(img, size.width, size.height)
    }));
    displayPreviews();
}

// ============================
// UI Functions
// ============================

/**
 * Display resized image previews
 */
function displayPreviews() {
    const html = `
        <div class="preview-grid">
            ${resizedImages.map((img, index) => `
                <div class="preview-card">
                    <div class="preview-image-wrapper">
                        <img src="${img.dataUrl}" alt="${img.width}x${img.height} preview">
                    </div>
                    <span class="preview-size">${img.width}×${img.height}</span>
                    <span class="preview-label">${img.label}</span>
                    <button class="download-btn" data-index="${index}">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download
                    </button>
                </div>
            `).join('')}
        </div>
    `;

    elements.previewContainer.innerHTML = html;
    elements.downloadAllBtn.classList.remove('hidden');

    // Add download handlers
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            downloadImage(resizedImages[index]);
        });
    });
}

/**
 * Download a single image
 */
function downloadImage(img) {
    const link = document.createElement('a');
    const baseName = elements.fileName.textContent.replace(/\.[^/.]+$/, '');
    link.download = `${baseName}_${img.width}x${img.height}.png`;
    link.href = img.dataUrl;
    link.click();
}

/**
 * Download all images as individual files
 */
function downloadAllImages() {
    resizedImages.forEach((img, index) => {
        setTimeout(() => downloadImage(img), index * 200);
    });
}

/**
 * Reset the uploader
 */
function reset() {
    currentImage = null;
    resizedImages = [];
    elements.fileInput.value = '';
    elements.fileInfo.classList.add('hidden');
    elements.downloadAllBtn.classList.add('hidden');
    elements.previewContainer.innerHTML = `
        <div class="empty-state">
            <span class="emoji">📐</span>
            <p>Upload an image to see resized previews</p>
        </div>
    `;
}

/**
 * Handle file selection
 */
async function handleFile(file) {
    try {
        currentImage = await loadImage(file);
        elements.fileName.textContent = file.name;
        elements.fileInfo.classList.remove('hidden');
        processImage(currentImage);
    } catch (error) {
        alert(error.message);
    }
}

// ============================
// Event Listeners
// ============================

function setupEventListeners() {
    // Drop zone click
    elements.dropZone.addEventListener('click', () => {
        elements.fileInput.click();
    });

    // File input change
    elements.fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // Drag and drop
    elements.dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.dropZone.classList.add('drag-over');
    });

    elements.dropZone.addEventListener('dragleave', () => {
        elements.dropZone.classList.remove('drag-over');
    });

    elements.dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    // Remove button
    elements.removeBtn.addEventListener('click', reset);

    // Platform buttons
    elements.platformBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.platformBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPlatform = btn.dataset.platform;

            // Re-process if image is loaded
            if (currentImage) {
                processImage(currentImage);
            }
        });
    });

    // Download all button
    elements.downloadAllBtn.addEventListener('click', downloadAllImages);

    // Paste from clipboard
    document.addEventListener('paste', async (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (const item of items) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                    handleFile(file);
                    break;
                }
            }
        }
    });
}

// ============================
// Initialization
// ============================

function init() {
    setupEventListeners();
}

// Start the app
document.addEventListener('DOMContentLoaded', init);

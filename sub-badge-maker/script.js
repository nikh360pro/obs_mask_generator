/**
 * Twitch Sub Badge Maker
 * Resizes images to 18x18, 36x36, 72x72 pixels
 */

const BADGE_SIZES = [
    { size: 72, label: '72×72' },
    { size: 36, label: '36×36' },
    { size: 18, label: '18×18' }
];

const MAX_FILE_SIZE = 25 * 1024; // 25KB

const elements = {
    uploadZone: document.getElementById('upload-zone'),
    fileInput: document.getElementById('file-input'),
    fileInfo: document.getElementById('file-info'),
    previewImage: document.getElementById('preview-image'),
    fileName: document.getElementById('file-name'),
    fileDimensions: document.getElementById('file-dimensions'),
    removeBtn: document.getElementById('remove-btn'),
    badgesGrid: document.getElementById('badges-grid'),
    downloadAllBtn: document.getElementById('download-all-btn')
};

let originalImage = null;
let resizedImages = {};

// Upload zone events
elements.uploadZone.addEventListener('click', () => elements.fileInput.click());

elements.uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.uploadZone.classList.add('dragover');
});

elements.uploadZone.addEventListener('dragleave', () => {
    elements.uploadZone.classList.remove('dragover');
});

elements.uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.uploadZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleFile(file);
    }
});

elements.fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
});

elements.removeBtn.addEventListener('click', resetUpload);
elements.downloadAllBtn.addEventListener('click', downloadAllAsZip);

function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            showFileInfo(file, img);
            generateBadges(img);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function showFileInfo(file, img) {
    elements.uploadZone.style.display = 'none';
    elements.fileInfo.style.display = 'flex';
    elements.previewImage.src = img.src;
    elements.fileName.textContent = file.name;
    elements.fileDimensions.textContent = `${img.width} × ${img.height} px`;
}

function resetUpload() {
    originalImage = null;
    resizedImages = {};
    elements.uploadZone.style.display = 'block';
    elements.fileInfo.style.display = 'none';
    elements.fileInput.value = '';
    elements.downloadAllBtn.style.display = 'none';
    elements.badgesGrid.innerHTML = `
        <div class="badge-placeholder">
            <p>👆 Upload an image to see resized badges</p>
        </div>
    `;
}

function generateBadges(img) {
    elements.badgesGrid.innerHTML = '';
    resizedImages = {};

    BADGE_SIZES.forEach(({ size, label }) => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Enable smooth scaling for quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Calculate aspect ratio fit
        const scale = Math.min(size / img.width, size / img.height);
        const x = (size - img.width * scale) / 2;
        const y = (size - img.height * scale) / 2;

        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        // Get data URL and calculate size
        const dataUrl = canvas.toDataURL('image/png');
        const byteSize = Math.round((dataUrl.length * 3) / 4);

        resizedImages[size] = dataUrl;

        // Create badge item
        const badgeItem = document.createElement('div');
        badgeItem.className = 'badge-item';

        let sizeClass = '';
        let sizeNote = '';
        if (byteSize > MAX_FILE_SIZE) {
            sizeClass = 'error';
            sizeNote = ' (too large!)';
        } else if (byteSize > MAX_FILE_SIZE * 0.8) {
            sizeClass = 'warning';
            sizeNote = ' (close to limit)';
        }

        badgeItem.innerHTML = `
            <div class="badge-preview">
                <img src="${dataUrl}" alt="${label} badge" width="${size}" height="${size}">
            </div>
            <div class="badge-info">
                <p class="badge-size">${label} pixels</p>
                <p class="badge-filesize ${sizeClass}">${formatBytes(byteSize)}${sizeNote}</p>
            </div>
            <button class="download-btn" data-size="${size}">Download</button>
        `;

        badgeItem.querySelector('.download-btn').addEventListener('click', () => {
            downloadBadge(size, label);
        });

        elements.badgesGrid.appendChild(badgeItem);
    });

    elements.downloadAllBtn.style.display = 'flex';
}

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    return (bytes / 1024).toFixed(1) + ' KB';
}

function downloadBadge(size, label) {
    const dataUrl = resizedImages[size];
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.download = `badge_${size}x${size}.png`;
    link.href = dataUrl;
    link.click();
}

async function downloadAllAsZip() {
    if (Object.keys(resizedImages).length === 0) return;

    const zip = new JSZip();

    for (const [size, dataUrl] of Object.entries(resizedImages)) {
        const base64 = dataUrl.split(',')[1];
        zip.file(`badge_${size}x${size}.png`, base64, { base64: true });
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.download = 'twitch_sub_badges.zip';
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
}

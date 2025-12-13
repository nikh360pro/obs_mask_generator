// Emote Size Checker - Script

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const resultsSection = document.getElementById('results-section');
    const emotePreview = document.getElementById('emote-preview');
    const statusMessages = document.getElementById('status-messages');

    let currentImage = null;

    // Twitch requirements
    const requirements = {
        28: { maxSize: 25 * 1024, name: '1x' },
        56: { maxSize: 100 * 1024, name: '2x' },
        112: { maxSize: 1024 * 1024, name: '4x' }
    };

    // Drag and drop handlers
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFile(files[0]);
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFile(e.target.files[0]);
    });

    // Handle uploaded file
    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                currentImage = img;
                analyzeImage(img, file);
            };
            img.src = e.target.result;
            emotePreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Analyze the image
    function analyzeImage(img, file) {
        resultsSection.style.display = 'block';

        const width = img.naturalWidth;
        const height = img.naturalHeight;
        const fileSize = file.size;
        const format = file.type.split('/')[1].toUpperCase();
        const isSquare = width === height;

        // Update results
        document.getElementById('result-dimensions').textContent = `${width} × ${height} px`;
        document.getElementById('result-filesize').textContent = formatBytes(fileSize);
        document.getElementById('result-aspect').textContent = isSquare ? '1:1 (Square) ✓' : 'Not Square ✗';
        document.getElementById('result-format').textContent = format;

        // Style aspect ratio
        const aspectEl = document.getElementById('result-aspect');
        aspectEl.style.color = isSquare ? '#10b981' : '#ef4444';

        // Generate status messages
        const messages = [];

        if (isSquare) {
            messages.push({ type: 'success', text: '✓ Image is square (required for Twitch)' });
        } else {
            messages.push({ type: 'error', text: '✗ Image must be square. Current: ' + width + 'x' + height });
        }

        // Check standard sizes
        if (width === 28 && height === 28) {
            messages.push({ type: 'success', text: '✓ Perfect size for Twitch 1x emote' });
        } else if (width === 56 && height === 56) {
            messages.push({ type: 'success', text: '✓ Perfect size for Twitch 2x emote' });
        } else if (width === 112 && height === 112) {
            messages.push({ type: 'success', text: '✓ Perfect size for Twitch 4x emote' });
        } else if (isSquare && width >= 112) {
            messages.push({ type: 'success', text: '✓ Large enough to resize to all Twitch sizes' });
        } else if (isSquare) {
            messages.push({ type: 'warning', text: '⚠ Image may lose quality when resized larger' });
        }

        // File size check
        if (fileSize <= 1024 * 1024) {
            messages.push({ type: 'success', text: '✓ File size under 1MB limit' });
        } else {
            messages.push({ type: 'error', text: '✗ File too large (max 1MB)' });
        }

        // Format check
        if (format === 'PNG') {
            messages.push({ type: 'success', text: '✓ PNG format (recommended)' });
        } else if (format === 'GIF') {
            messages.push({ type: 'success', text: '✓ GIF format (animated emotes)' });
        } else {
            messages.push({ type: 'warning', text: '⚠ PNG recommended for transparency support' });
        }

        // Render messages
        statusMessages.innerHTML = messages.map(m =>
            `<div class="status-message ${m.type}">${m.text}</div>`
        ).join('');

        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Format bytes to human readable
    function formatBytes(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    // Resize and download
    document.querySelectorAll('.resize-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!currentImage) return;

            const size = parseInt(btn.dataset.size);
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');

            // Draw resized image
            ctx.drawImage(currentImage, 0, 0, size, size);

            // Download
            const link = document.createElement('a');
            link.download = `emote-${size}x${size}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    });
});

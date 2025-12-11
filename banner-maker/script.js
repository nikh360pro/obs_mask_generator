/**
 * Twitch Banner Maker
 * Creates profile (1200x480) and offline (1920x1080) banners
 */

const config = {
    type: 'profile',
    width: 1200,
    height: 480,
    mainText: 'YOUR NAME',
    subtitle: '',
    color1: '#9146FF',
    color2: '#2C2C2C',
    textColor: '#FFFFFF',
    showPattern: true
};

const elements = {
    canvas: document.getElementById('banner-canvas'),
    bannerTypes: document.querySelectorAll('.banner-type-btn'),
    mainText: document.getElementById('main-text'),
    subtitle: document.getElementById('subtitle'),
    color1: document.getElementById('color1'),
    color2: document.getElementById('color2'),
    textColor: document.getElementById('text-color'),
    colorThemes: document.querySelectorAll('.theme-btn'),
    showPattern: document.getElementById('show-pattern'),
    downloadBtn: document.getElementById('download-btn'),
    sizeInfo: document.getElementById('size-info')
};

const ctx = elements.canvas.getContext('2d');

function draw() {
    const { width, height, mainText, subtitle, color1, color2, textColor, showPattern } = config;

    // Set canvas size
    elements.canvas.width = width;
    elements.canvas.height = height;

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw pattern overlay
    if (showPattern) {
        drawPattern(width, height, color1);
    }

    // Draw text
    drawText(width, height, mainText, subtitle, textColor);

    // Update size info
    elements.sizeInfo.textContent = `${width} × ${height} pixels`;
}

function drawPattern(width, height, color) {
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;

    // Draw diagonal lines
    for (let i = -height; i < width + height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + height, height);
        ctx.stroke();
    }

    // Draw circles
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = 50 + Math.random() * 150;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

function drawText(width, height, mainText, subtitle, color) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;

    // Main text
    const mainSize = Math.min(width * 0.08, 80);
    ctx.font = `800 ${mainSize}px Inter, sans-serif`;

    // Add text shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    const mainY = subtitle ? height / 2 - mainSize * 0.3 : height / 2;
    ctx.fillText(mainText.toUpperCase(), width / 2, mainY);

    // Subtitle
    if (subtitle) {
        const subSize = Math.min(width * 0.025, 24);
        ctx.font = `500 ${subSize}px Inter, sans-serif`;
        ctx.shadowBlur = 5;
        ctx.fillText(subtitle, width / 2, mainY + mainSize * 0.8);
    }

    ctx.restore();
}

function downloadBanner() {
    const link = document.createElement('a');
    link.download = `twitch-${config.type}-banner-${config.width}x${config.height}.png`;
    link.href = elements.canvas.toDataURL('image/png');
    link.click();
}

// Event listeners
elements.bannerTypes.forEach(btn => {
    btn.addEventListener('click', () => {
        elements.bannerTypes.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        config.type = btn.dataset.type;
        config.width = parseInt(btn.dataset.width);
        config.height = parseInt(btn.dataset.height);
        draw();
    });
});

elements.mainText.addEventListener('input', () => {
    config.mainText = elements.mainText.value || 'YOUR NAME';
    draw();
});

elements.subtitle.addEventListener('input', () => {
    config.subtitle = elements.subtitle.value;
    draw();
});

elements.color1.addEventListener('input', () => {
    config.color1 = elements.color1.value;
    draw();
});

elements.color2.addEventListener('input', () => {
    config.color2 = elements.color2.value;
    draw();
});

elements.textColor.addEventListener('input', () => {
    config.textColor = elements.textColor.value;
    draw();
});

elements.colorThemes.forEach(btn => {
    btn.addEventListener('click', () => {
        config.color1 = btn.dataset.c1;
        config.color2 = btn.dataset.c2;
        elements.color1.value = btn.dataset.c1;
        elements.color2.value = btn.dataset.c2;
        draw();
    });
});

elements.showPattern.addEventListener('change', () => {
    config.showPattern = elements.showPattern.checked;
    draw();
});

elements.downloadBtn.addEventListener('click', downloadBanner);

// Initialize
function init() {
    const font = new FontFace('Inter', 'url(https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2)');
    font.load().then(() => {
        document.fonts.add(font);
        draw();
    }).catch(() => draw());
}

document.addEventListener('DOMContentLoaded', init);

// Aspect Ratio Calculator - Script

document.addEventListener('DOMContentLoaded', () => {
    const modeBtns = document.querySelectorAll('.mode-btn');
    const modeContents = document.querySelectorAll('.mode-content');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const ratioSelect = document.getElementById('ratio');
    const targetWidthInput = document.getElementById('targetWidth');
    const targetHeightInput = document.getElementById('targetHeight');
    const calculateBtn = document.getElementById('calculate-btn');

    // Results
    const resultRatio = document.getElementById('result-ratio');
    const resultDecimal = document.getElementById('result-decimal');
    const resultResolution = document.getElementById('result-resolution');
    const ratioDisplay = document.getElementById('ratio-display');
    const ratioName = document.getElementById('ratio-name');
    const previewBox = document.getElementById('preview-box');
    const resolutionList = document.getElementById('resolution-list');

    // Common resolutions for each aspect ratio
    const commonResolutions = {
        '16:9': [
            { w: 1920, h: 1080, name: '1080p' },
            { w: 1280, h: 720, name: '720p' },
            { w: 2560, h: 1440, name: '1440p' },
            { w: 3840, h: 2160, name: '4K' }
        ],
        '4:3': [
            { w: 1024, h: 768, name: 'XGA' },
            { w: 1600, h: 1200, name: 'UXGA' },
            { w: 800, h: 600, name: 'SVGA' }
        ],
        '21:9': [
            { w: 2560, h: 1080, name: 'UWFHD' },
            { w: 3440, h: 1440, name: 'UWQHD' },
            { w: 5120, h: 2160, name: '5K UW' }
        ],
        '9:16': [
            { w: 1080, h: 1920, name: 'Vertical HD' },
            { w: 720, h: 1280, name: 'Vertical 720p' },
            { w: 1440, h: 2560, name: 'Vertical QHD' }
        ],
        '1:1': [
            { w: 1080, h: 1080, name: 'Square HD' },
            { w: 720, h: 720, name: 'Square 720' },
            { w: 1440, h: 1440, name: 'Square QHD' }
        ],
        '3:2': [
            { w: 1080, h: 720, name: '1080×720' },
            { w: 1620, h: 1080, name: '1620×1080' },
            { w: 2160, h: 1440, name: '2160×1440' }
        ]
    };

    let currentMode = 'fromDimensions';

    // Mode toggle
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            modeContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            document.getElementById(currentMode).classList.add('active');
        });
    });

    // GCD function
    function gcd(a, b) {
        return b === 0 ? a : gcd(b, a % b);
    }

    // Calculate aspect ratio from dimensions
    function calculateFromDimensions(w, h) {
        const divisor = gcd(w, h);
        const ratioW = w / divisor;
        const ratioH = h / divisor;
        const decimal = (w / h).toFixed(3);

        return {
            ratio: `${ratioW}:${ratioH}`,
            decimal: decimal,
            width: w,
            height: h
        };
    }

    // Calculate dimensions from ratio
    function calculateFromRatio(ratio, targetW, targetH) {
        const [ratioW, ratioH] = ratio.split(':').map(Number);

        let w, h;
        if (targetW && !targetH) {
            w = targetW;
            h = Math.round(targetW * ratioH / ratioW);
        } else if (targetH && !targetW) {
            h = targetH;
            w = Math.round(targetH * ratioW / ratioH);
        } else if (targetW) {
            w = targetW;
            h = Math.round(targetW * ratioH / ratioW);
        }

        return {
            ratio: ratio,
            decimal: (ratioW / ratioH).toFixed(3),
            width: w,
            height: h
        };
    }

    // Update preview box aspect ratio
    function updatePreview(ratioW, ratioH) {
        const maxWidth = 160;
        const maxHeight = 120;

        let width, height;
        if (ratioW / ratioH > maxWidth / maxHeight) {
            width = maxWidth;
            height = maxWidth * ratioH / ratioW;
        } else {
            height = maxHeight;
            width = maxHeight * ratioW / ratioH;
        }

        previewBox.style.width = `${width}px`;
        previewBox.style.height = `${height}px`;
    }

    // Update resolution list
    function updateResolutionList(ratio) {
        const resolutions = commonResolutions[ratio] || commonResolutions['16:9'];
        resolutionList.innerHTML = resolutions.map(r =>
            `<button class="res-btn" data-res="${r.w}x${r.h}">${r.w}×${r.h} (${r.name})</button>`
        ).join('');

        ratioName.textContent = ratio;

        // Add click handlers to resolution buttons
        document.querySelectorAll('.res-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const [w, h] = btn.dataset.res.split('x').map(Number);
                widthInput.value = w;
                heightInput.value = h;
                calculate();
            });
        });
    }

    // Main calculate function
    function calculate() {
        let result;

        if (currentMode === 'fromDimensions') {
            const w = parseInt(widthInput.value) || 1920;
            const h = parseInt(heightInput.value) || 1080;
            result = calculateFromDimensions(w, h);
        } else {
            const ratio = ratioSelect.value;
            const targetW = parseInt(targetWidthInput.value) || 1920;
            const targetH = parseInt(targetHeightInput.value) || null;
            result = calculateFromRatio(ratio, targetW, targetH);
        }

        // Update display
        resultRatio.textContent = result.ratio;
        resultDecimal.textContent = result.decimal;
        resultResolution.textContent = `${result.width} × ${result.height}`;
        ratioDisplay.textContent = result.ratio;

        // Update preview
        const [rw, rh] = result.ratio.split(':').map(Number);
        updatePreview(rw, rh);

        // Update resolution list
        updateResolutionList(result.ratio);
    }

    // Event listeners
    calculateBtn.addEventListener('click', calculate);
    widthInput.addEventListener('input', calculate);
    heightInput.addEventListener('input', calculate);
    ratioSelect.addEventListener('change', calculate);
    targetWidthInput.addEventListener('input', () => {
        targetHeightInput.value = '';
        calculate();
    });
    targetHeightInput.addEventListener('input', () => {
        targetWidthInput.value = '';
        calculate();
    });

    // Initial calculation
    calculate();
});

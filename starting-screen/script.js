// Starting Screen Maker - Script

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('screen-canvas');
    const ctx = canvas.getContext('2d');

    const screenTypeSelect = document.getElementById('screen-type');
    const mainTextInput = document.getElementById('main-text');
    const subTextInput = document.getElementById('sub-text');
    const color1Input = document.getElementById('color1');
    const color2Input = document.getElementById('color2');
    const styleSelect = document.getElementById('style');
    const showDotsCheckbox = document.getElementById('show-dots');
    const downloadPngBtn = document.getElementById('download-png');
    const downloadHtmlBtn = document.getElementById('download-html');

    // Preset text for screen types
    const presets = {
        starting: { main: 'STARTING SOON', sub: 'Stream will begin shortly' },
        brb: { main: 'BE RIGHT BACK', sub: 'Taking a short break' },
        ending: { main: 'STREAM ENDING', sub: 'Thanks for watching!' },
        offline: { main: 'CURRENTLY OFFLINE', sub: 'Follow for notifications' }
    };

    let dotAnimation = 0;

    function draw() {
        const width = canvas.width;
        const height = canvas.height;
        const color1 = color1Input.value;
        const color2 = color2Input.value;
        const style = styleSelect.value;

        // Clear
        ctx.clearRect(0, 0, width, height);

        // Background
        if (style === 'minimal') {
            ctx.fillStyle = color2;
            ctx.fillRect(0, 0, width, height);
        } else if (style === 'glow' || style === 'particles') {
            ctx.fillStyle = color2;
            ctx.fillRect(0, 0, width, height);

            // Add subtle glow in center
            const glow = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
            glow.addColorStop(0, color1 + '22');
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, width, height);
        } else if (style === 'gradient') {
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, color2);
            gradient.addColorStop(0.5, color1 + '33');
            gradient.addColorStop(1, color2);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }

        // Main text
        const mainText = mainTextInput.value.toUpperCase();
        const subText = subTextInput.value;

        if (style === 'glow') {
            // Neon glow effect
            ctx.font = 'bold 100px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.shadowColor = color1;
            ctx.shadowBlur = 40;
            ctx.fillStyle = color1;
            ctx.fillText(mainText, width / 2, height / 2 - 40);

            ctx.shadowBlur = 80;
            ctx.fillText(mainText, width / 2, height / 2 - 40);

            ctx.shadowBlur = 0;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(mainText, width / 2, height / 2 - 40);
        } else {
            // Standard text
            ctx.font = 'bold 100px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(mainText, width / 2, height / 2 - 40);
        }

        // Subtext with optional animated dots
        let displaySubText = subText;
        if (showDotsCheckbox.checked) {
            const dots = '.'.repeat((dotAnimation % 3) + 1);
            displaySubText = subText + dots;
        }

        ctx.shadowBlur = 0;
        ctx.font = '400 36px Inter, sans-serif';
        ctx.fillStyle = '#AAAAAA';
        ctx.fillText(displaySubText, width / 2, height / 2 + 60);

        // Accent line
        ctx.fillStyle = color1;
        ctx.fillRect(width / 2 - 60, height / 2 + 100, 120, 4);
    }

    // Screen type presets
    screenTypeSelect.addEventListener('change', () => {
        const preset = presets[screenTypeSelect.value];
        mainTextInput.value = preset.main;
        subTextInput.value = preset.sub;
        draw();
    });

    // Event listeners
    [mainTextInput, subTextInput, color1Input, color2Input, styleSelect, showDotsCheckbox].forEach(el => {
        el.addEventListener('input', draw);
        el.addEventListener('change', draw);
    });

    document.querySelectorAll('.color-presets button').forEach(btn => {
        btn.addEventListener('click', () => {
            color1Input.value = btn.dataset.color;
            draw();
        });
    });

    // Animate dots
    setInterval(() => {
        dotAnimation++;
        if (showDotsCheckbox.checked) draw();
    }, 500);

    // Download PNG
    downloadPngBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'starting-soon-screen.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    // Download HTML
    downloadHtmlBtn.addEventListener('click', () => {
        const html = generateHTML();
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'starting-soon-screen.html';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    });

    function generateHTML() {
        const color1 = color1Input.value;
        const color2 = color2Input.value;
        const mainText = mainTextInput.value.toUpperCase();
        const subText = subTextInput.value;
        const style = styleSelect.value;

        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Starting Soon Screen</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: ${color2};
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            font-family: 'Inter', sans-serif;
            overflow: hidden;
        }
        ${style === 'glow' ? `
        .glow {
            position: absolute;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, ${color1}22 0%, transparent 70%);
            border-radius: 50%;
            animation: pulse 3s ease-in-out infinite;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.8; }
        }` : ''}
        ${style === 'particles' ? `
        .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: ${color1};
            border-radius: 50%;
            animation: float 5s ease-in-out infinite;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0); opacity: 0.3; }
            50% { transform: translateY(-30px); opacity: 0.8; }
        }` : ''}
        .main-text {
            font-size: 100px;
            font-weight: 700;
            color: white;
            ${style === 'glow' ? `text-shadow: 0 0 40px ${color1}, 0 0 80px ${color1};` : ''}
            z-index: 10;
        }
        .sub-text {
            font-size: 36px;
            color: #AAAAAA;
            margin-top: 20px;
            z-index: 10;
        }
        .accent-line {
            width: 120px;
            height: 4px;
            background: ${color1};
            margin-top: 40px;
            z-index: 10;
        }
    </style>
</head>
<body>
    ${style === 'glow' ? '<div class="glow"></div>' : ''}
    ${style === 'particles' ? Array.from({ length: 20 }, (_, i) =>
            `<div class="particle" style="left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation-delay:${i * 0.2}s"></div>`
        ).join('') : ''}
    <div class="main-text">${mainText}</div>
    <div class="sub-text">${subText}<span id="dots"></span></div>
    <div class="accent-line"></div>
    <script>
        let d = 0;
        setInterval(() => {
            d = (d + 1) % 4;
            document.getElementById('dots').textContent = '.'.repeat(d);
        }, 500);
    </script>
</body>
</html>`;
    }

    // Initial draw
    draw();
});

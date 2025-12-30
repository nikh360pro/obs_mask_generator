// Starting Screen Maker - Enhanced Script

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('screen-canvas');
    const ctx = canvas.getContext('2d');

    // Control elements
    const screenTypeSelect = document.getElementById('screen-type');
    const mainTextInput = document.getElementById('main-text');
    const subTextInput = document.getElementById('sub-text');
    const color1Input = document.getElementById('color1');
    const color2Input = document.getElementById('color2');
    const fontStyleSelect = document.getElementById('font-style');
    const styleSelect = document.getElementById('style');
    const bgStyleSelect = document.getElementById('bg-style');
    const showDotsCheckbox = document.getElementById('show-dots');
    const downloadPngBtn = document.getElementById('download-png');
    const downloadHtmlBtn = document.getElementById('download-html');

    // Social inputs
    const twitchInput = document.getElementById('twitch-handle');
    const youtubeInput = document.getElementById('youtube-handle');
    const discordInput = document.getElementById('discord-handle');
    const twitterInput = document.getElementById('twitter-handle');

    // Preset text for screen types
    const presets = {
        starting: { main: 'STARTING SOON', sub: 'Stream will begin shortly' },
        brb: { main: 'BE RIGHT BACK', sub: 'Taking a short break' },
        ending: { main: 'STREAM ENDING', sub: 'Thanks for watching!' },
        offline: { main: 'CURRENTLY OFFLINE', sub: 'Follow for notifications' }
    };

    let dotAnimation = 0;
    let pulsePhase = 0;

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    function drawBackground() {
        const width = canvas.width;
        const height = canvas.height;
        const color1 = color1Input.value;
        const color2 = color2Input.value;
        const bgStyle = bgStyleSelect.value;
        const style = styleSelect.value;

        // Clear
        ctx.clearRect(0, 0, width, height);

        // Background based on style
        if (bgStyle === 'solid') {
            ctx.fillStyle = color2;
            ctx.fillRect(0, 0, width, height);
        } else if (bgStyle === 'gradient-vertical') {
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, color2);
            gradient.addColorStop(1, color1 + '44');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        } else if (bgStyle === 'gradient-horizontal') {
            const gradient = ctx.createLinearGradient(0, 0, width, 0);
            gradient.addColorStop(0, color2);
            gradient.addColorStop(0.5, color1 + '33');
            gradient.addColorStop(1, color2);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        } else if (bgStyle === 'gradient-diagonal') {
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, color2);
            gradient.addColorStop(0.5, color1 + '33');
            gradient.addColorStop(1, color2);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        } else if (bgStyle === 'gradient-radial') {
            const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
            gradient.addColorStop(0, color1 + '33');
            gradient.addColorStop(1, color2);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }

        // Add effect overlay based on animation style
        if (style === 'glow' || style === 'particles') {
            const glow = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
            glow.addColorStop(0, color1 + '22');
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, width, height);
        } else if (style === 'pulse') {
            const pulseIntensity = Math.sin(pulsePhase) * 0.15 + 0.15;
            const glow = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
            glow.addColorStop(0, color1 + Math.floor(pulseIntensity * 255).toString(16).padStart(2, '0'));
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, width, height);
        }
    }

    function draw() {
        const width = canvas.width;
        const height = canvas.height;
        const color1 = color1Input.value;
        const style = styleSelect.value;
        const fontFamily = fontStyleSelect.value;

        drawBackground();

        // Main text
        const mainText = mainTextInput.value.toUpperCase();
        const subText = subTextInput.value;

        // Adjust font size for certain fonts
        let mainFontSize = 100;
        if (fontFamily === 'Press Start 2P') mainFontSize = 60;
        if (fontFamily === 'Permanent Marker') mainFontSize = 90;

        if (style === 'glow') {
            ctx.font = `bold ${mainFontSize}px "${fontFamily}", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.shadowColor = color1;
            ctx.shadowBlur = 40;
            ctx.fillStyle = color1;
            ctx.fillText(mainText, width / 2, height / 2 - 60);

            ctx.shadowBlur = 80;
            ctx.fillText(mainText, width / 2, height / 2 - 60);

            ctx.shadowBlur = 0;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(mainText, width / 2, height / 2 - 60);
        } else if (style === 'pulse') {
            const scale = 1 + Math.sin(pulsePhase) * 0.02;
            ctx.save();
            ctx.translate(width / 2, height / 2 - 60);
            ctx.scale(scale, scale);
            ctx.font = `bold ${mainFontSize}px "${fontFamily}", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(mainText, 0, 0);
            ctx.restore();
        } else {
            ctx.font = `bold ${mainFontSize}px "${fontFamily}", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(mainText, width / 2, height / 2 - 60);
        }

        // Subtext with optional animated dots
        let displaySubText = subText;
        if (showDotsCheckbox.checked) {
            const dots = '.'.repeat((dotAnimation % 3) + 1);
            displaySubText = subText + dots;
        }

        ctx.shadowBlur = 0;
        ctx.font = `400 36px "${fontFamily}", sans-serif`;
        ctx.fillStyle = '#AAAAAA';
        ctx.fillText(displaySubText, width / 2, height / 2 + 40);

        // Accent line
        ctx.fillStyle = color1;
        ctx.fillRect(width / 2 - 60, height / 2 + 80, 120, 4);

        // Social icons
        drawSocialIcons();
    }

    function drawSocialIcons() {
        const width = canvas.width;
        const height = canvas.height;
        const socials = [];

        if (twitchInput.value.trim()) socials.push({ icon: '🎮', text: twitchInput.value.trim() });
        if (youtubeInput.value.trim()) socials.push({ icon: '▶', text: youtubeInput.value.trim() });
        if (discordInput.value.trim()) socials.push({ icon: '💬', text: discordInput.value.trim() });
        if (twitterInput.value.trim()) socials.push({ icon: '𝕏', text: twitterInput.value.trim() });

        if (socials.length === 0) return;

        const totalWidth = socials.length * 200;
        let startX = (width - totalWidth) / 2 + 100;
        const y = height - 80;

        ctx.font = '24px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#888888';

        socials.forEach((social, i) => {
            const x = startX + i * 200;
            ctx.fillText(`${social.icon} ${social.text}`, x, y);
        });
    }

    // Screen type presets
    screenTypeSelect.addEventListener('change', () => {
        const preset = presets[screenTypeSelect.value];
        mainTextInput.value = preset.main;
        subTextInput.value = preset.sub;
        draw();
    });

    // Event listeners for all controls
    [mainTextInput, subTextInput, color1Input, color2Input, fontStyleSelect, styleSelect, bgStyleSelect, showDotsCheckbox,
        twitchInput, youtubeInput, discordInput, twitterInput].forEach(el => {
        el.addEventListener('input', draw);
        el.addEventListener('change', draw);
    });

    document.querySelectorAll('.color-presets button').forEach(btn => {
        btn.addEventListener('click', () => {
            color1Input.value = btn.dataset.color;
            draw();
        });
    });

    // Animate dots and pulse
    setInterval(() => {
        dotAnimation++;
        pulsePhase += 0.1;
        if (showDotsCheckbox.checked || styleSelect.value === 'pulse') draw();
    }, 100);

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
        const fontFamily = fontStyleSelect.value;
        const bgStyle = bgStyleSelect.value;

        // Social handles
        const socials = [];
        if (twitchInput.value.trim()) socials.push({ icon: '🎮', text: twitchInput.value.trim() });
        if (youtubeInput.value.trim()) socials.push({ icon: '▶', text: youtubeInput.value.trim() });
        if (discordInput.value.trim()) socials.push({ icon: '💬', text: discordInput.value.trim() });
        if (twitterInput.value.trim()) socials.push({ icon: '𝕏', text: twitterInput.value.trim() });

        const socialHTML = socials.length > 0 ? `
    <div class="socials">
        ${socials.map(s => `<span>${s.icon} ${s.text}</span>`).join('')}
    </div>` : '';

        // Background CSS
        let bgCSS = `background: ${color2};`;
        if (bgStyle === 'gradient-vertical') bgCSS = `background: linear-gradient(to bottom, ${color2}, ${color1}44);`;
        if (bgStyle === 'gradient-horizontal') bgCSS = `background: linear-gradient(to right, ${color2}, ${color1}33, ${color2});`;
        if (bgStyle === 'gradient-diagonal') bgCSS = `background: linear-gradient(135deg, ${color2}, ${color1}33, ${color2});`;
        if (bgStyle === 'gradient-radial') bgCSS = `background: radial-gradient(circle, ${color1}33, ${color2});`;

        // Font size adjustment
        let mainFontSize = '100px';
        if (fontFamily === 'Press Start 2P') mainFontSize = '60px';
        if (fontFamily === 'Permanent Marker') mainFontSize = '90px';

        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Starting Soon Screen</title>
    <link href="https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            ${bgCSS}
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            font-family: '${fontFamily}', sans-serif;
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
        ${style === 'pulse' ? `
        .main-text {
            animation: textPulse 2s ease-in-out infinite;
        }
        @keyframes textPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.03); }
        }` : ''}
        ${style === 'wave' ? `
        .main-text {
            animation: wave 3s ease-in-out infinite;
        }
        @keyframes wave {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
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
        ${style === 'spotlight' ? `
        .spotlight {
            position: absolute;
            width: 200%;
            height: 100%;
            background: linear-gradient(90deg, transparent, ${color1}22, transparent);
            animation: sweep 4s linear infinite;
        }
        @keyframes sweep {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }` : ''}
        ${style === 'glitch' ? `
        .main-text {
            animation: glitch 2s infinite;
        }
        @keyframes glitch {
            0%, 90%, 100% { transform: translate(0); }
            92% { transform: translate(-5px, 2px); }
            94% { transform: translate(5px, -2px); }
            96% { transform: translate(-3px, 0); }
            98% { transform: translate(3px, 0); }
        }` : ''}
        .main-text {
            font-size: ${mainFontSize};
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
        .socials {
            position: absolute;
            bottom: 60px;
            display: flex;
            gap: 40px;
            color: #888;
            font-size: 20px;
            font-family: Inter, sans-serif;
        }
    </style>
</head>
<body>
    ${style === 'glow' ? '<div class="glow"></div>' : ''}
    ${style === 'spotlight' ? '<div class="spotlight"></div>' : ''}
    ${style === 'particles' ? Array.from({ length: 20 }, (_, i) =>
            `<div class="particle" style="left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation-delay:${i * 0.2}s"></div>`
        ).join('') : ''}
    <div class="main-text">${mainText}</div>
    <div class="sub-text">${subText}<span id="dots"></span></div>
    <div class="accent-line"></div>
    ${socialHTML}
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

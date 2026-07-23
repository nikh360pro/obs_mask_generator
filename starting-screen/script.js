// Starting Screen Maker — Full Rewrite with Live Preview, Templates, Uploads, Countdown

document.addEventListener('DOMContentLoaded', () => {

    // ============================
    // DOM References
    // ============================
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
    const iframe = document.getElementById('live-preview');
    const previewWrapper = document.getElementById('preview-wrapper');

    // Social inputs
    const twitchInput = document.getElementById('twitch-handle');
    const youtubeInput = document.getElementById('youtube-handle');
    const discordInput = document.getElementById('discord-handle');
    const twitterInput = document.getElementById('twitter-handle');

    // Upload inputs
    const logoUpload = document.getElementById('logo-upload');
    const removeLogo = document.getElementById('remove-logo');
    const logoSizeSlider = document.getElementById('logo-size');
    const logoSizeVal = document.getElementById('logo-size-val');
    const logoSizeGroup = document.getElementById('logo-size-group');
    const bgUpload = document.getElementById('bg-upload');
    const removeBg = document.getElementById('remove-bg');
    const bgOpacitySlider = document.getElementById('bg-opacity');
    const bgOpacityVal = document.getElementById('bg-opacity-val');
    const bgOpacityGroup = document.getElementById('bg-opacity-group');

    // Countdown
    const showCountdown = document.getElementById('show-countdown');
    const countdownMinutes = document.getElementById('countdown-minutes');
    const countdownMinutesGroup = document.getElementById('countdown-minutes-group');

    // State
    let logoDataUrl = null;
    let bgDataUrl = null;

    // ============================
    // Templates
    // ============================
    const templates = {
        cyberpunk: {
            name: 'Cyberpunk Neon',
            font: 'Orbitron', color1: '#00FFFF', color2: '#0a0a2e',
            bgStyle: 'gradient-radial', animation: 'glow',
            mainText: 'STARTING SOON', subText: 'Stream will begin shortly'
        },
        lofi: {
            name: 'Cozy Lofi',
            font: 'Poppins', color1: '#c89566', color2: '#1a120b',
            bgStyle: 'gradient-vertical', animation: 'pulse',
            mainText: 'STARTING SOON', subText: 'grab a coffee & relax'
        },
        retro: {
            name: 'Retro Arcade',
            font: 'Press Start 2P', color1: '#00ff00', color2: '#000000',
            bgStyle: 'solid', animation: 'glitch',
            mainText: 'STARTING SOON', subText: 'Insert coin to continue'
        },
        minimal: {
            name: 'Clean Minimal',
            font: 'Inter', color1: '#555555', color2: '#111111',
            bgStyle: 'solid', animation: 'minimal',
            mainText: 'STARTING SOON', subText: 'Stream will begin shortly'
        },
        valorant: {
            name: 'Valorant Tryhard',
            font: 'Russo One', color1: '#ff4555', color2: '#0f1923',
            bgStyle: 'gradient-diagonal', animation: 'spotlight',
            mainText: 'STARTING SOON', subText: 'Ranked grind begins shortly'
        },
        ocean: {
            name: 'Ocean Wave',
            font: 'Righteous', color1: '#64ffda', color2: '#0a192f',
            bgStyle: 'gradient-vertical', animation: 'wave',
            mainText: 'STARTING SOON', subText: 'Stream will begin shortly'
        },
        pastel: {
            name: 'Pastel Cute',
            font: 'Poppins', color1: '#e8a0bf', color2: '#1a1028',
            bgStyle: 'gradient-radial', animation: 'pulse',
            mainText: 'STARTING SOON', subText: 'Hi cuties! Be right there~'
        },
        elite: {
            name: 'Dark Elite',
            font: 'Bebas Neue', color1: '#d4af37', color2: '#0a0a0a',
            bgStyle: 'gradient-radial', animation: 'glow',
            mainText: 'STARTING SOON', subText: 'Premium content loading'
        }
    };

    const presets = {
        starting: { main: 'STARTING SOON', sub: 'Stream will begin shortly' },
        brb: { main: 'BE RIGHT BACK', sub: 'Taking a short break' },
        ending: { main: 'STREAM ENDING', sub: 'Thanks for watching!' },
        offline: { main: 'CURRENTLY OFFLINE', sub: 'Follow for notifications' }
    };

    // ============================
    // Apply Template
    // ============================
    function applyTemplate(id) {
        const t = templates[id];
        if (!t) return;

        mainTextInput.value = t.mainText;
        subTextInput.value = t.subText;
        color1Input.value = t.color1;
        color2Input.value = t.color2;
        fontStyleSelect.value = t.font;
        styleSelect.value = t.animation;
        bgStyleSelect.value = t.bgStyle;

        // Update active card
        document.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
        document.querySelector(`[data-template="${id}"]`)?.classList.add('active');

        updatePreview();
    }

    document.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', () => applyTemplate(card.dataset.template));
    });

    // ============================
    // Screen Type Presets
    // ============================
    screenTypeSelect.addEventListener('change', () => {
        const preset = presets[screenTypeSelect.value];
        mainTextInput.value = preset.main;
        subTextInput.value = preset.sub;
        updatePreview();
    });

    // ============================
    // File Uploads
    // ============================
    logoUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            logoDataUrl = ev.target.result;
            removeLogo.style.display = 'inline-block';
            logoSizeGroup.style.display = 'flex';
            updatePreview();
        };
        reader.readAsDataURL(file);
    });

    removeLogo.addEventListener('click', () => {
        logoDataUrl = null;
        logoUpload.value = '';
        removeLogo.style.display = 'none';
        logoSizeGroup.style.display = 'none';
        updatePreview();
    });

    bgUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            bgDataUrl = ev.target.result;
            removeBg.style.display = 'inline-block';
            bgOpacityGroup.style.display = 'flex';
            updatePreview();
        };
        reader.readAsDataURL(file);
    });

    removeBg.addEventListener('click', () => {
        bgDataUrl = null;
        bgUpload.value = '';
        removeBg.style.display = 'none';
        bgOpacityGroup.style.display = 'none';
        updatePreview();
    });

    logoSizeSlider.addEventListener('input', () => {
        logoSizeVal.textContent = logoSizeSlider.value + 'px';
        updatePreview();
    });

    bgOpacitySlider.addEventListener('input', () => {
        bgOpacityVal.textContent = bgOpacitySlider.value + '%';
        updatePreview();
    });

    // ============================
    // Countdown Toggle
    // ============================
    showCountdown.addEventListener('change', () => {
        countdownMinutesGroup.style.display = showCountdown.checked ? 'flex' : 'none';
        updatePreview();
    });
    countdownMinutes.addEventListener('input', updatePreview);

    // ============================
    // Event Listeners (all controls)
    // ============================
    [mainTextInput, subTextInput, color1Input, color2Input, fontStyleSelect, styleSelect, bgStyleSelect, showDotsCheckbox,
        twitchInput, youtubeInput, discordInput, twitterInput].forEach(el => {
        el.addEventListener('input', updatePreview);
        el.addEventListener('change', updatePreview);
    });

    document.querySelectorAll('.color-presets button').forEach(btn => {
        btn.addEventListener('click', () => {
            color1Input.value = btn.dataset.color;
            updatePreview();
        });
    });

    // ============================
    // Scale iframe to fit wrapper
    // ============================
    function scalePreview() {
        const scale = previewWrapper.clientWidth / 1920;
        iframe.style.transform = `scale(${scale})`;
        // Set wrapper height to match scaled iframe
        previewWrapper.style.height = (1080 * scale) + 'px';
    }

    window.addEventListener('resize', scalePreview);
    scalePreview();

    // ============================
    // Generate Full HTML String
    // ============================
    function generateHTML() {
        const color1 = color1Input.value;
        const color2 = color2Input.value;
        const mainText = mainTextInput.value.toUpperCase();
        const subText = subTextInput.value;
        const style = styleSelect.value;
        const fontFamily = fontStyleSelect.value;
        const bgStyle = bgStyleSelect.value;
        const showDots = showDotsCheckbox.checked;
        const logoSize = logoSizeSlider.value;
        const bgDarkness = bgOpacitySlider.value;
        const countdownEnabled = showCountdown.checked;
        const countdownMins = parseInt(countdownMinutes.value) || 5;

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

        // Background image
        let bgImageCSS = '';
        let bgOverlayHTML = '';
        if (bgDataUrl) {
            bgImageCSS = `background-image: url('${bgDataUrl}'); background-size: cover; background-position: center;`;
            bgOverlayHTML = `<div style="position:absolute;inset:0;background:rgba(0,0,0,${bgDarkness / 100});z-index:1;"></div>`;
        }

        // Font size adjustment
        let mainFontSize = '100px';
        if (fontFamily === 'Press Start 2P') mainFontSize = '50px';
        if (fontFamily === 'Permanent Marker') mainFontSize = '90px';

        // Logo HTML
        const logoHTML = logoDataUrl ? `<img src="${logoDataUrl}" alt="Logo" style="width:${logoSize}px;height:auto;margin-bottom:20px;z-index:10;object-fit:contain;">` : '';

        // Countdown HTML
        const countdownHTML = countdownEnabled ? `
    <div class="countdown" id="countdown">${String(countdownMins).padStart(2, '0')}:00</div>` : '';

        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Starting Soon Screen</title>
    <link href="https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            ${bgDataUrl ? bgImageCSS : bgCSS}
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            font-family: '${fontFamily}', sans-serif;
            overflow: hidden;
            position: relative;
        }
        ${style === 'glow' ? `
        .glow {
            position: absolute;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, ${color1}22 0%, transparent 70%);
            border-radius: 50%;
            animation: pulse 3s ease-in-out infinite;
            z-index: 2;
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
            z-index: 2;
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
            z-index: 2;
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
            text-align: center;
            padding: 0 40px;
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
        .countdown {
            font-size: 72px;
            font-weight: 700;
            color: ${color1};
            margin-top: 30px;
            z-index: 10;
            letter-spacing: 4px;
            ${style === 'glow' ? `text-shadow: 0 0 20px ${color1}, 0 0 60px ${color1};` : ''}
        }
        .socials {
            position: absolute;
            bottom: 60px;
            display: flex;
            gap: 40px;
            color: #888;
            font-size: 20px;
            font-family: Inter, sans-serif;
            z-index: 10;
        }
    </style>
</head>
<body>
    ${bgOverlayHTML}
    ${style === 'glow' ? '<div class="glow"></div>' : ''}
    ${style === 'spotlight' ? '<div class="spotlight"></div>' : ''}
    ${style === 'particles' ? Array.from({ length: 20 }, (_, i) =>
            `<div class="particle" style="left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation-delay:${i * 0.2}s"></div>`
        ).join('') : ''}
    ${logoHTML}
    <div class="main-text">${mainText}</div>
    <div class="sub-text">${subText}${showDots ? '<span id="dots"></span>' : ''}</div>
    <div class="accent-line"></div>
    ${countdownHTML}
    ${socialHTML}
    <script>
        ${showDots ? `
        let d = 0;
        setInterval(() => {
            d = (d + 1) % 4;
            document.getElementById('dots').textContent = '.'.repeat(d);
        }, 500);` : ''}
        ${countdownEnabled ? `
        (function() {
            let total = ${countdownMins * 60};
            const el = document.getElementById('countdown');
            const tick = setInterval(() => {
                total--;
                if (total <= 0) { clearInterval(tick); el.textContent = 'LIVE!'; return; }
                const m = Math.floor(total / 60);
                const s = total % 60;
                el.textContent = String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
            }, 1000);
        })();` : ''}
    </script>
</body>
</html>`;
    }

    // ============================
    // Update Live Preview (iframe)
    // ============================
    let updateTimeout = null;
    function updatePreview() {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => {
            const html = generateHTML();
            iframe.srcdoc = html;
        }, 60);
    }

    // ============================
    // PNG Download (canvas-based)
    // ============================
    downloadPngBtn.addEventListener('click', () => {
        const canvas = document.getElementById('export-canvas');
        const ctx = canvas.getContext('2d');
        const width = 1920;
        const height = 1080;

        const color1 = color1Input.value;
        const color2 = color2Input.value;
        const style = styleSelect.value;
        const fontFamily = fontStyleSelect.value;
        const bgStyle = bgStyleSelect.value;
        const mainText = mainTextInput.value.toUpperCase();
        const subText = subTextInput.value;
        const logoSize = parseInt(logoSizeSlider.value);
        const countdownEnabled = showCountdown.checked;
        const countdownMins = parseInt(countdownMinutes.value) || 5;

        // Clear
        ctx.clearRect(0, 0, width, height);

        // Draw function (async for images)
        const drawCanvas = () => {
            // Background
            if (bgStyle === 'solid') {
                ctx.fillStyle = color2;
                ctx.fillRect(0, 0, width, height);
            } else if (bgStyle === 'gradient-vertical') {
                const g = ctx.createLinearGradient(0, 0, 0, height);
                g.addColorStop(0, color2); g.addColorStop(1, color1 + '44');
                ctx.fillStyle = g; ctx.fillRect(0, 0, width, height);
            } else if (bgStyle === 'gradient-horizontal') {
                const g = ctx.createLinearGradient(0, 0, width, 0);
                g.addColorStop(0, color2); g.addColorStop(0.5, color1 + '33'); g.addColorStop(1, color2);
                ctx.fillStyle = g; ctx.fillRect(0, 0, width, height);
            } else if (bgStyle === 'gradient-diagonal') {
                const g = ctx.createLinearGradient(0, 0, width, height);
                g.addColorStop(0, color2); g.addColorStop(0.5, color1 + '33'); g.addColorStop(1, color2);
                ctx.fillStyle = g; ctx.fillRect(0, 0, width, height);
            } else if (bgStyle === 'gradient-radial') {
                const g = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
                g.addColorStop(0, color1 + '33'); g.addColorStop(1, color2);
                ctx.fillStyle = g; ctx.fillRect(0, 0, width, height);
            }

            // Glow overlay
            if (style === 'glow' || style === 'particles') {
                const glow = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
                glow.addColorStop(0, color1 + '22'); glow.addColorStop(1, 'transparent');
                ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);
            }

            let yOffset = height / 2 - 60;

            // Logo
            if (logoDataUrl) {
                yOffset = height / 2 - 30; // shift text down a bit
            }

            // Main text
            let mainFontSize = 100;
            if (fontFamily === 'Press Start 2P') mainFontSize = 50;
            if (fontFamily === 'Permanent Marker') mainFontSize = 90;

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            if (style === 'glow') {
                ctx.font = `bold ${mainFontSize}px "${fontFamily}", sans-serif`;
                ctx.shadowColor = color1; ctx.shadowBlur = 40;
                ctx.fillStyle = color1;
                ctx.fillText(mainText, width / 2, yOffset);
                ctx.shadowBlur = 80;
                ctx.fillText(mainText, width / 2, yOffset);
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText(mainText, width / 2, yOffset);
            } else {
                ctx.font = `bold ${mainFontSize}px "${fontFamily}", sans-serif`;
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText(mainText, width / 2, yOffset);
            }

            // Subtext
            ctx.shadowBlur = 0;
            ctx.font = `400 36px "${fontFamily}", sans-serif`;
            ctx.fillStyle = '#AAAAAA';
            ctx.fillText(subText, width / 2, yOffset + 100);

            // Accent line
            ctx.fillStyle = color1;
            ctx.fillRect(width / 2 - 60, yOffset + 140, 120, 4);

            // Countdown
            if (countdownEnabled) {
                ctx.font = `bold 72px "${fontFamily}", sans-serif`;
                ctx.fillStyle = color1;
                if (style === 'glow') {
                    ctx.shadowColor = color1; ctx.shadowBlur = 30;
                }
                ctx.fillText(`${String(countdownMins).padStart(2, '0')}:00`, width / 2, yOffset + 210);
                ctx.shadowBlur = 0;
            }

            // Social icons
            const socials = [];
            if (twitchInput.value.trim()) socials.push({ icon: '🎮', text: twitchInput.value.trim() });
            if (youtubeInput.value.trim()) socials.push({ icon: '▶', text: youtubeInput.value.trim() });
            if (discordInput.value.trim()) socials.push({ icon: '💬', text: discordInput.value.trim() });
            if (twitterInput.value.trim()) socials.push({ icon: '𝕏', text: twitterInput.value.trim() });

            if (socials.length > 0) {
                const totalWidth = socials.length * 200;
                let startX = (width - totalWidth) / 2 + 100;
                ctx.font = '24px Inter, sans-serif';
                ctx.fillStyle = '#888888';
                socials.forEach((social, i) => {
                    ctx.fillText(`${social.icon} ${social.text}`, startX + i * 200, height - 80);
                });
            }

            // Download
            const link = document.createElement('a');
            link.download = 'starting-soon-screen.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        };

        // If background image exists, draw it first
        if (bgDataUrl) {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, width, height);
                // Dark overlay
                ctx.fillStyle = `rgba(0,0,0,${bgOpacitySlider.value / 100})`;
                ctx.fillRect(0, 0, width, height);

                // If logo, draw it
                if (logoDataUrl) {
                    const logoImg = new Image();
                    logoImg.onload = () => {
                        const lw = logoSize;
                        const lh = (logoImg.height / logoImg.width) * lw;
                        ctx.drawImage(logoImg, width / 2 - lw / 2, height / 2 - 160 - lh / 2, lw, lh);
                        drawCanvas();
                    };
                    logoImg.src = logoDataUrl;
                } else {
                    drawCanvas();
                }
            };
            img.src = bgDataUrl;
        } else if (logoDataUrl) {
            // No bg image but has logo
            const logoImg = new Image();
            logoImg.onload = () => {
                drawCanvas(); // Draw bg + text first, then overlay logo
                // Actually draw logo on top
                const lw = logoSize;
                const lh = (logoImg.height / logoImg.width) * lw;
                // Re-draw logo on top (need to draw bg first)
                ctx.clearRect(0, 0, width, height);
                drawCanvasBase();
                ctx.drawImage(logoImg, width / 2 - lw / 2, height / 2 - 160 - lh / 2, lw, lh);
                drawCanvasText();
            };
            logoImg.src = logoDataUrl;
        } else {
            drawCanvas();
        }

        // Helper to split drawing for logo layering
        function drawCanvasBase() {
            if (bgStyle === 'solid') {
                ctx.fillStyle = color2; ctx.fillRect(0, 0, width, height);
            } else if (bgStyle === 'gradient-radial') {
                const g = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
                g.addColorStop(0, color1 + '33'); g.addColorStop(1, color2);
                ctx.fillStyle = g; ctx.fillRect(0, 0, width, height);
            } else {
                ctx.fillStyle = color2; ctx.fillRect(0, 0, width, height);
            }
            if (style === 'glow') {
                const glow = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
                glow.addColorStop(0, color1 + '22'); glow.addColorStop(1, 'transparent');
                ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);
            }
        }

        function drawCanvasText() {
            let mainFontSize = 100;
            if (fontFamily === 'Press Start 2P') mainFontSize = 50;
            if (fontFamily === 'Permanent Marker') mainFontSize = 90;
            let yOffset = height / 2 - 30;

            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            if (style === 'glow') {
                ctx.font = `bold ${mainFontSize}px "${fontFamily}", sans-serif`;
                ctx.shadowColor = color1; ctx.shadowBlur = 40;
                ctx.fillStyle = color1;
                ctx.fillText(mainText, width / 2, yOffset);
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText(mainText, width / 2, yOffset);
            } else {
                ctx.font = `bold ${mainFontSize}px "${fontFamily}", sans-serif`;
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText(mainText, width / 2, yOffset);
            }
            ctx.shadowBlur = 0;
            ctx.font = `400 36px "${fontFamily}", sans-serif`;
            ctx.fillStyle = '#AAAAAA';
            ctx.fillText(subText, width / 2, yOffset + 100);
            ctx.fillStyle = color1;
            ctx.fillRect(width / 2 - 60, yOffset + 140, 120, 4);

            if (countdownEnabled) {
                ctx.font = `bold 72px "${fontFamily}", sans-serif`;
                ctx.fillStyle = color1;
                ctx.fillText(`${String(countdownMins).padStart(2, '0')}:00`, width / 2, yOffset + 210);
            }

            // Socials
            const socials = [];
            if (twitchInput.value.trim()) socials.push({ icon: '🎮', text: twitchInput.value.trim() });
            if (youtubeInput.value.trim()) socials.push({ icon: '▶', text: youtubeInput.value.trim() });
            if (discordInput.value.trim()) socials.push({ icon: '💬', text: discordInput.value.trim() });
            if (twitterInput.value.trim()) socials.push({ icon: '𝕏', text: twitterInput.value.trim() });
            if (socials.length > 0) {
                const totalWidth = socials.length * 200;
                let startX = (width - totalWidth) / 2 + 100;
                ctx.font = '24px Inter, sans-serif';
                ctx.fillStyle = '#888888';
                socials.forEach((s, i) => { ctx.fillText(`${s.icon} ${s.text}`, startX + i * 200, height - 80); });
            }

            // Download
            const link = document.createElement('a');
            link.download = 'starting-soon-screen.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    });

    // ============================
    // HTML Download
    // ============================
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

    // ============================
    // Initial Load
    // ============================
    applyTemplate('cyberpunk');
    updatePreview();
});

// Twitch Panel Generator - Main Script

// ==================== STATE ====================
const state = {
    text: 'ABOUT ME',
    font: 'Inter',
    fontSize: 24,
    textColor: '#ffffff',
    textAlign: 'center',
    textShadow: false,

    icon: 'none',
    iconPosition: 'left',

    useGradient: true,
    bgColor1: '#9146FF',
    bgColor2: '#6441A5',
    gradientAngle: 135,

    cornerRadius: 10,
    enableBorder: false,
    borderColor: '#ffffff',
    borderThickness: 2,

    panelHeight: 100,
    panelWidth: 320, // Fixed

    enableAnimation: false,
    animationType: 'glow',
    animationSpeed: 'medium',

    enableSound: false,
    panelCount: parseInt(localStorage.getItem('panelCount') || '0'),
    logoClicks: 0
};

// ==================== ICON MAP ====================
const iconMap = {
    none: '',
    user: '👤',
    heart: '❤️',
    star: '⭐',
    discord: '💬',
    twitter: '🐦',
    youtube: '▶️',
    instagram: '📷',
    tiktok: '🎵',
    money: '💰',
    calendar: '📅',
    rules: '📜',
    pc: '🖥️',
    gamepad: '🎮',
    music: '🎶',
    fire: '🔥',
    crown: '👑',
    trophy: '🏆',
    mic: '🎤',
    camera: '📹'
};

// ==================== THEME PRESETS ====================
const themes = {
    cyberpunk: {
        bgColor1: '#ff00ff',
        bgColor2: '#00ffff',
        textColor: '#ffffff',
        font: 'Bebas Neue',
        gradientAngle: 45
    },
    retro: {
        bgColor1: '#ff6b35',
        bgColor2: '#f7c59f',
        textColor: '#1a1a2e',
        font: 'Press Start 2P',
        gradientAngle: 180
    },
    cozy: {
        bgColor1: '#ffd6e0',
        bgColor2: '#c1e1c1',
        textColor: '#4a4a4a',
        font: 'Poppins',
        gradientAngle: 135
    },
    dark: {
        bgColor1: '#1a1a1a',
        bgColor2: '#2d2d2d',
        textColor: '#ffffff',
        font: 'Inter',
        gradientAngle: 180
    },
    valorant: {
        bgColor1: '#ff4655',
        bgColor2: '#0f1923',
        textColor: '#ffffff',
        font: 'Bebas Neue',
        gradientAngle: 135
    },
    minecraft: {
        bgColor1: '#5d8c3e',
        bgColor2: '#8b5a2b',
        textColor: '#ffffff',
        font: 'Roboto',
        gradientAngle: 180
    }
};

// ==================== PANEL PRESETS ====================
const panelPresets = {
    about: { text: 'ABOUT ME', icon: 'user' },
    donate: { text: 'DONATE', icon: 'money' },
    schedule: { text: 'SCHEDULE', icon: 'calendar' },
    discord: { text: 'DISCORD', icon: 'discord' },
    rules: { text: 'RULES', icon: 'rules' },
    specs: { text: 'PC SPECS', icon: 'pc' }
};

// ==================== DOM REFERENCES ====================
const canvas = document.getElementById('preview-canvas');
const ctx = canvas.getContext('2d');

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    initControls();
    initThemes();
    initPresets();
    initEasterEgg();
    updatePanelCounter();
    parseURLSettings();
    render();
});

// ==================== CONTROL BINDINGS ====================
function initControls() {
    // Text
    document.getElementById('panel-text').addEventListener('input', (e) => {
        state.text = e.target.value;
        playSound('click');
        render();
    });

    document.getElementById('font-select').addEventListener('change', (e) => {
        state.font = e.target.value;
        playSound('whoosh');
        render();
    });

    bindSlider('font-size', 'fontSize');
    bindColorPicker('text-color', 'textColor');

    // Alignment
    document.querySelectorAll('.align-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.align-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.textAlign = btn.dataset.align;
            playSound('click');
            render();
        });
    });

    document.getElementById('text-shadow').addEventListener('change', (e) => {
        state.textShadow = e.target.checked;
        render();
    });

    // Icons
    document.querySelectorAll('.icon-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.icon-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.icon = btn.dataset.icon;
            playSound('click');
            render();
        });
    });

    document.getElementById('icon-position').addEventListener('change', (e) => {
        state.iconPosition = e.target.value;
        render();
    });

    // Background
    document.getElementById('use-gradient').addEventListener('change', (e) => {
        state.useGradient = e.target.checked;
        document.getElementById('color2-group').classList.toggle('hidden', !e.target.checked);
        document.getElementById('gradient-angle-group').classList.toggle('hidden', !e.target.checked);
        render();
    });

    bindColorPicker('bg-color1', 'bgColor1');
    bindColorPicker('bg-color2', 'bgColor2');
    bindSlider('gradient-angle', 'gradientAngle');

    // Shape & Border
    bindSlider('corner-radius', 'cornerRadius');

    document.getElementById('enable-border').addEventListener('change', (e) => {
        state.enableBorder = e.target.checked;
        document.getElementById('border-controls').classList.toggle('hidden', !e.target.checked);
        render();
    });

    bindColorPicker('border-color', 'borderColor');
    bindSlider('border-thickness', 'borderThickness');

    // Size
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const height = parseInt(btn.dataset.height);
            state.panelHeight = height;
            document.getElementById('panel-height').value = height;
            document.getElementById('panel-height-value').value = height;
            playSound('click');
            render();
        });
    });

    bindSlider('panel-height', 'panelHeight', () => {
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    });

    // Animation
    document.getElementById('enable-animation').addEventListener('change', (e) => {
        state.enableAnimation = e.target.checked;
        document.getElementById('animation-controls').classList.toggle('hidden', !e.target.checked);
        document.getElementById('download-gif').disabled = !e.target.checked;
        render();
    });

    document.getElementById('animation-type').addEventListener('change', (e) => {
        state.animationType = e.target.value;
        render();
    });

    document.getElementById('animation-speed').addEventListener('change', (e) => {
        state.animationSpeed = e.target.value;
        render();
    });

    // Sound
    document.getElementById('enable-sound').addEventListener('change', (e) => {
        state.enableSound = e.target.checked;
    });

    // Downloads
    document.getElementById('download-png').addEventListener('click', downloadPNG);
    document.getElementById('download-gif').addEventListener('click', downloadGIF);
    document.getElementById('copy-link').addEventListener('click', copySettingsLink);
}

// ==================== HELPER: Slider Binding ====================
function bindSlider(id, stateKey, callback) {
    const slider = document.getElementById(id);
    const valueInput = document.getElementById(`${id}-value`);

    slider.addEventListener('input', (e) => {
        state[stateKey] = parseInt(e.target.value);
        valueInput.value = e.target.value;
        if (callback) callback();
        render();
    });

    valueInput.addEventListener('input', (e) => {
        state[stateKey] = parseInt(e.target.value);
        slider.value = e.target.value;
        if (callback) callback();
        render();
    });
}

// ==================== HELPER: Color Picker Binding ====================
function bindColorPicker(id, stateKey) {
    document.getElementById(id).addEventListener('input', (e) => {
        state[stateKey] = e.target.value;
        render();
    });
}

// ==================== THEME INIT ====================
function initThemes() {
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = themes[btn.dataset.theme];
            if (theme) {
                applyTheme(theme);
                playSound('whoosh');
            }
        });
    });
}

function applyTheme(theme) {
    state.bgColor1 = theme.bgColor1;
    state.bgColor2 = theme.bgColor2;
    state.textColor = theme.textColor;
    state.font = theme.font;
    state.gradientAngle = theme.gradientAngle;
    state.useGradient = true;

    // Update UI
    document.getElementById('bg-color1').value = theme.bgColor1;
    document.getElementById('bg-color2').value = theme.bgColor2;
    document.getElementById('text-color').value = theme.textColor;
    document.getElementById('font-select').value = theme.font;
    document.getElementById('gradient-angle').value = theme.gradientAngle;
    document.getElementById('gradient-angle-value').value = theme.gradientAngle;
    document.getElementById('use-gradient').checked = true;
    document.getElementById('color2-group').classList.remove('hidden');
    document.getElementById('gradient-angle-group').classList.remove('hidden');

    render();
}

// ==================== PRESET INIT ====================
function initPresets() {
    document.querySelectorAll('.preset-card').forEach(btn => {
        btn.addEventListener('click', () => {
            const presetName = btn.dataset.preset;

            if (presetName === 'surprise') {
                surpriseMe();
            } else {
                const preset = panelPresets[presetName];
                if (preset) {
                    state.text = preset.text;
                    state.icon = preset.icon;

                    document.getElementById('panel-text').value = preset.text;
                    document.querySelectorAll('.icon-btn').forEach(b => {
                        b.classList.toggle('active', b.dataset.icon === preset.icon);
                    });

                    playSound('whoosh');
                    render();
                }
            }
        });
    });
}

// ==================== SURPRISE ME! ====================
function surpriseMe() {
    const colors = ['#ff00ff', '#00ffff', '#ff6b35', '#9146FF', '#00d26a', '#ff4655', '#ffd700', '#00ff88'];
    const fonts = ['Inter', 'Montserrat', 'Bebas Neue', 'Poppins', 'Roboto'];
    const icons = Object.keys(iconMap).filter(k => k !== 'none');

    state.bgColor1 = colors[Math.floor(Math.random() * colors.length)];
    state.bgColor2 = colors[Math.floor(Math.random() * colors.length)];
    state.textColor = Math.random() > 0.5 ? '#ffffff' : '#1a1a2e';
    state.font = fonts[Math.floor(Math.random() * fonts.length)];
    state.gradientAngle = Math.floor(Math.random() * 360);
    state.cornerRadius = Math.floor(Math.random() * 30);
    state.icon = icons[Math.floor(Math.random() * icons.length)];
    state.useGradient = true;

    // Update UI
    document.getElementById('bg-color1').value = state.bgColor1;
    document.getElementById('bg-color2').value = state.bgColor2;
    document.getElementById('text-color').value = state.textColor;
    document.getElementById('font-select').value = state.font;
    document.getElementById('gradient-angle').value = state.gradientAngle;
    document.getElementById('gradient-angle-value').value = state.gradientAngle;
    document.getElementById('corner-radius').value = state.cornerRadius;
    document.getElementById('corner-radius-value').value = state.cornerRadius;

    document.querySelectorAll('.icon-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.icon === state.icon);
    });

    playSound('whoosh');
    render();
}

// ==================== EASTER EGG ====================
function initEasterEgg() {
    document.getElementById('logo').addEventListener('click', () => {
        state.logoClicks++;
        if (state.logoClicks >= 5) {
            state.logoClicks = 0;
            // Secret Twitch Purple theme
            applyTheme({
                bgColor1: '#9146FF',
                bgColor2: '#772ce8',
                textColor: '#ffffff',
                font: 'Montserrat',
                gradientAngle: 180
            });
            alert('🎉 Secret Twitch Purple unlocked!');
        }
    });
}

// ==================== PANEL COUNTER ====================
function updatePanelCounter() {
    document.getElementById('counter-value').textContent = state.panelCount;
}

function incrementPanelCount() {
    state.panelCount++;
    localStorage.setItem('panelCount', state.panelCount);
    updatePanelCounter();

    // Milestone messages
    const milestones = {
        5: '🎉 5 panels! Nice start!',
        10: '🔥 10 panels! You\'re on fire!',
        25: '⭐ 25 panels! Panel master!',
        50: '👑 50 panels! Absolute legend!',
        100: '🏆 100 panels! You\'re unstoppable!'
    };

    if (milestones[state.panelCount]) {
        setTimeout(() => alert(milestones[state.panelCount]), 500);
    }
}

// ==================== RENDER ====================
function render() {
    const { panelWidth, panelHeight, cornerRadius, useGradient, bgColor1, bgColor2, gradientAngle,
        enableBorder, borderColor, borderThickness, text, font, fontSize, textColor, textAlign,
        textShadow, icon, iconPosition } = state;

    // Update canvas size
    canvas.width = panelWidth;
    canvas.height = panelHeight;
    document.getElementById('dimension-badge').textContent = `${panelWidth} × ${panelHeight} px`;

    // Clear
    ctx.clearRect(0, 0, panelWidth, panelHeight);

    // Background
    ctx.save();
    roundRect(ctx, 0, 0, panelWidth, panelHeight, cornerRadius);
    ctx.clip();

    if (useGradient) {
        const angleRad = (gradientAngle - 90) * Math.PI / 180;
        const x1 = panelWidth / 2 - Math.cos(angleRad) * panelWidth / 2;
        const y1 = panelHeight / 2 - Math.sin(angleRad) * panelHeight / 2;
        const x2 = panelWidth / 2 + Math.cos(angleRad) * panelWidth / 2;
        const y2 = panelHeight / 2 + Math.sin(angleRad) * panelHeight / 2;

        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, bgColor1);
        gradient.addColorStop(1, bgColor2);
        ctx.fillStyle = gradient;
    } else {
        ctx.fillStyle = bgColor1;
    }
    ctx.fillRect(0, 0, panelWidth, panelHeight);
    ctx.restore();

    // Border
    if (enableBorder) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderThickness;
        roundRect(ctx, borderThickness / 2, borderThickness / 2,
            panelWidth - borderThickness, panelHeight - borderThickness, cornerRadius);
        ctx.stroke();
    }

    // Icon & Text
    const iconEmoji = iconMap[icon] || '';
    const hasIcon = icon !== 'none' && iconEmoji;

    ctx.font = `${fontSize}px "${font}", sans-serif`;
    ctx.fillStyle = textColor;
    ctx.textBaseline = 'middle';

    if (textShadow) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
    }

    const textWidth = ctx.measureText(text).width;
    const iconSize = fontSize * 1.2;
    const gap = 12; // Gap between icon and text

    let textX, textY, iconX, iconY;
    textY = panelHeight / 2;
    iconY = panelHeight / 2;

    if (iconPosition === 'top' && hasIcon) {
        // Icon above text
        iconY = panelHeight / 2 - fontSize / 2 - 5;
        textY = panelHeight / 2 + iconSize / 2;

        if (textAlign === 'left') {
            iconX = 20 + iconSize / 2;
            textX = 20;
            ctx.textAlign = 'left';
        } else if (textAlign === 'right') {
            iconX = panelWidth - 20 - iconSize / 2;
            textX = panelWidth - 20;
            ctx.textAlign = 'right';
        } else {
            iconX = panelWidth / 2;
            textX = panelWidth / 2;
            ctx.textAlign = 'center';
        }

        // Draw icon
        ctx.font = `${iconSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(iconEmoji, iconX, iconY);

        // Draw text
        ctx.font = `${fontSize}px "${font}", sans-serif`;
        ctx.textAlign = textAlign;
        ctx.fillText(text, textX, textY);

    } else if (hasIcon) {
        // Icon left or right of text - FIXED POSITIONING
        const totalWidth = iconSize + gap + textWidth;

        if (textAlign === 'center') {
            // Center the entire icon+text combo
            const startX = (panelWidth - totalWidth) / 2;

            if (iconPosition === 'left') {
                iconX = startX + iconSize / 2;
                textX = startX + iconSize + gap;
            } else {
                // icon on right
                textX = startX;
                iconX = startX + textWidth + gap + iconSize / 2;
            }
        } else if (textAlign === 'left') {
            if (iconPosition === 'left') {
                iconX = 20 + iconSize / 2;
                textX = 20 + iconSize + gap;
            } else {
                textX = 20;
                iconX = 20 + textWidth + gap + iconSize / 2;
            }
        } else {
            // right align
            if (iconPosition === 'right') {
                iconX = panelWidth - 20 - iconSize / 2;
                textX = panelWidth - 20 - iconSize - gap;
            } else {
                textX = panelWidth - 20;
                iconX = panelWidth - 20 - textWidth - gap - iconSize / 2;
            }
        }

        // Draw icon (always centered on its X position)
        ctx.font = `${iconSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(iconEmoji, iconX, iconY);

        // Draw text (always left-aligned from textX for consistency)
        ctx.font = `${fontSize}px "${font}", sans-serif`;
        ctx.textAlign = 'left';
        if (textAlign === 'right' && iconPosition !== 'right') {
            ctx.textAlign = 'right';
        }
        ctx.fillText(text, textX, textY);

    } else {
        // Text only
        if (textAlign === 'left') {
            textX = 20;
            ctx.textAlign = 'left';
        } else if (textAlign === 'right') {
            textX = panelWidth - 20;
            ctx.textAlign = 'right';
        } else {
            textX = panelWidth / 2;
            ctx.textAlign = 'center';
        }

        ctx.fillText(text, textX, textY);
    }

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
}

// ==================== HELPER: Round Rect ====================
function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

// ==================== DOWNLOAD PNG ====================
function downloadPNG() {
    render();

    const link = document.createElement('a');
    link.download = `twitch-panel-${state.text.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    // Confetti!
    if (typeof confetti !== 'undefined') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }

    playSound('ding');
    incrementPanelCount();
}

// ==================== DOWNLOAD GIF ====================
function downloadGIF() {
    alert('GIF export requires the gif.js library. For now, please download as PNG. Animated GIF support coming soon!');
}

// ==================== COPY SETTINGS LINK ====================
function copySettingsLink() {
    const settings = btoa(JSON.stringify({
        t: state.text,
        f: state.font,
        fs: state.fontSize,
        tc: state.textColor,
        ta: state.textAlign,
        ts: state.textShadow,
        i: state.icon,
        ip: state.iconPosition,
        ug: state.useGradient,
        c1: state.bgColor1,
        c2: state.bgColor2,
        ga: state.gradientAngle,
        cr: state.cornerRadius,
        eb: state.enableBorder,
        bc: state.borderColor,
        bt: state.borderThickness,
        h: state.panelHeight
    }));

    const url = `${window.location.origin}${window.location.pathname}#s=${settings}`;
    navigator.clipboard.writeText(url).then(() => {
        const btn = document.getElementById('copy-link');
        btn.textContent = '✓ Copied!';
        setTimeout(() => {
            btn.textContent = '📋 Copy Settings Link';
        }, 2000);
    });
}

// ==================== PARSE URL SETTINGS ====================
function parseURLSettings() {
    const hash = window.location.hash;
    if (hash.startsWith('#s=')) {
        try {
            const settings = JSON.parse(atob(hash.substring(3)));

            if (settings.t) state.text = settings.t;
            if (settings.f) state.font = settings.f;
            if (settings.fs) state.fontSize = settings.fs;
            if (settings.tc) state.textColor = settings.tc;
            if (settings.ta) state.textAlign = settings.ta;
            if (settings.ts !== undefined) state.textShadow = settings.ts;
            if (settings.i) state.icon = settings.i;
            if (settings.ip) state.iconPosition = settings.ip;
            if (settings.ug !== undefined) state.useGradient = settings.ug;
            if (settings.c1) state.bgColor1 = settings.c1;
            if (settings.c2) state.bgColor2 = settings.c2;
            if (settings.ga) state.gradientAngle = settings.ga;
            if (settings.cr) state.cornerRadius = settings.cr;
            if (settings.eb !== undefined) state.enableBorder = settings.eb;
            if (settings.bc) state.borderColor = settings.bc;
            if (settings.bt) state.borderThickness = settings.bt;
            if (settings.h) state.panelHeight = settings.h;

            // Sync UI with loaded state
            syncUIToState();
        } catch (e) {
            console.log('Failed to parse URL settings');
        }
    }
}

function syncUIToState() {
    document.getElementById('panel-text').value = state.text;
    document.getElementById('font-select').value = state.font;
    document.getElementById('font-size').value = state.fontSize;
    document.getElementById('font-size-value').value = state.fontSize;
    document.getElementById('text-color').value = state.textColor;
    document.getElementById('text-shadow').checked = state.textShadow;

    document.querySelectorAll('.align-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.align === state.textAlign);
    });

    document.querySelectorAll('.icon-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.icon === state.icon);
    });

    document.getElementById('icon-position').value = state.iconPosition;
    document.getElementById('use-gradient').checked = state.useGradient;
    document.getElementById('bg-color1').value = state.bgColor1;
    document.getElementById('bg-color2').value = state.bgColor2;
    document.getElementById('gradient-angle').value = state.gradientAngle;
    document.getElementById('gradient-angle-value').value = state.gradientAngle;
    document.getElementById('corner-radius').value = state.cornerRadius;
    document.getElementById('corner-radius-value').value = state.cornerRadius;
    document.getElementById('enable-border').checked = state.enableBorder;
    document.getElementById('border-color').value = state.borderColor;
    document.getElementById('border-thickness').value = state.borderThickness;
    document.getElementById('border-thickness-value').value = state.borderThickness;
    document.getElementById('panel-height').value = state.panelHeight;
    document.getElementById('panel-height-value').value = state.panelHeight;

    document.getElementById('color2-group').classList.toggle('hidden', !state.useGradient);
    document.getElementById('gradient-angle-group').classList.toggle('hidden', !state.useGradient);
    document.getElementById('border-controls').classList.toggle('hidden', !state.enableBorder);
}

// ==================== SOUND EFFECTS ====================
function playSound(type) {
    if (!state.enableSound) return;

    // Using Web Audio API for simple sounds
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    switch (type) {
        case 'click':
            oscillator.frequency.value = 800;
            gainNode.gain.value = 0.1;
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.05);
            break;
        case 'whoosh':
            oscillator.frequency.value = 400;
            oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
            gainNode.gain.value = 0.1;
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.1);
            break;
        case 'ding':
            oscillator.frequency.value = 1200;
            gainNode.gain.value = 0.15;
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.15);
            break;
    }
}

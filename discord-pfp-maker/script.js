// Discord PFP Maker - Script

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('pfp-canvas');
    const ctx = canvas.getContext('2d');

    // State
    let state = {
        shape: 'circle',
        bgType: 'gradient',
        color1: '#5865F2',
        color2: '#7289DA',
        icon: 'none',
        iconSize: 120,
        text: ''
    };

    // Icons mapping (emoji)
    const icons = {
        none: '',
        gaming: '🎮',
        controller: '🕹️',
        headphones: '🎧',
        fire: '🔥',
        star: '⭐',
        lightning: '⚡',
        sword: '⚔️',
        crown: '👑',
        skull: '💀',
        diamond: '💎',
        rocket: '🚀'
    };

    // Draw the PFP
    function draw() {
        const size = 512;
        const center = size / 2;

        // Clear
        ctx.clearRect(0, 0, size, size);

        // Create clipping path based on shape
        ctx.save();
        ctx.beginPath();

        switch (state.shape) {
            case 'circle':
                ctx.arc(center, center, center, 0, Math.PI * 2);
                break;
            case 'square':
                ctx.rect(0, 0, size, size);
                break;
            case 'rounded':
                roundedRect(ctx, 0, 0, size, size, 80);
                break;
            case 'hexagon':
                drawHexagon(ctx, center, center, center * 0.95);
                break;
        }
        ctx.clip();

        // Draw background
        let gradient;
        switch (state.bgType) {
            case 'gradient':
                gradient = ctx.createLinearGradient(0, 0, size, size);
                gradient.addColorStop(0, state.color1);
                gradient.addColorStop(1, state.color2);
                break;
            case 'solid':
                gradient = state.color1;
                break;
            case 'radial':
                gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
                gradient.addColorStop(0, state.color1);
                gradient.addColorStop(1, state.color2);
                break;
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        // Draw icon or text
        if (state.text) {
            ctx.font = `bold ${state.iconSize}px Inter, sans-serif`;
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(state.text.toUpperCase(), center, center);
        } else if (state.icon !== 'none') {
            ctx.font = `${state.iconSize}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(icons[state.icon], center, center);
        }

        ctx.restore();

        // Update preview sizes
        updatePreviews();
    }

    // Helper: rounded rectangle
    function roundedRect(ctx, x, y, w, h, r) {
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
    }

    // Helper: hexagon
    function drawHexagon(ctx, cx, cy, r) {
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
    }

    // Update preview canvases
    function updatePreviews() {
        ['128', '64', '32'].forEach(size => {
            const previewCanvas = document.querySelector(`#preview-${size} canvas`);
            const previewCtx = previewCanvas.getContext('2d');
            previewCtx.clearRect(0, 0, size, size);
            previewCtx.drawImage(canvas, 0, 0, parseInt(size), parseInt(size));
        });
    }

    // Event listeners
    // Shape buttons
    document.querySelectorAll('.shape-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.shape = btn.dataset.shape;
            draw();
        });
    });

    // Background type
    document.getElementById('bg-type').addEventListener('change', (e) => {
        state.bgType = e.target.value;
        document.getElementById('color2-group').style.display =
            e.target.value === 'solid' ? 'none' : 'block';
        draw();
    });

    // Colors
    document.getElementById('color1').addEventListener('input', (e) => {
        state.color1 = e.target.value;
        draw();
    });

    document.getElementById('color2').addEventListener('input', (e) => {
        state.color2 = e.target.value;
        draw();
    });

    // Color presets
    document.querySelectorAll('.color-preset').forEach(btn => {
        btn.addEventListener('click', () => {
            const parentGroup = btn.closest('.control-group');
            const input = parentGroup.querySelector('input[type="color"]');
            input.value = btn.dataset.color;
            if (input.id === 'color1') state.color1 = btn.dataset.color;
            else state.color2 = btn.dataset.color;
            draw();
        });
    });

    // Icons
    document.querySelectorAll('.icon-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.icon-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.icon = btn.dataset.icon;
            document.getElementById('icon-size-group').style.display =
                btn.dataset.icon === 'none' ? 'none' : 'block';
            draw();
        });
    });

    // Icon size
    document.getElementById('icon-size').addEventListener('input', (e) => {
        state.iconSize = parseInt(e.target.value);
        draw();
    });

    // Text input
    document.getElementById('text-input').addEventListener('input', (e) => {
        state.text = e.target.value;
        draw();
    });

    // Download
    document.getElementById('download-btn').addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'discord-pfp.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    // Initial draw
    draw();
});

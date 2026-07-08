document.addEventListener('DOMContentLoaded', () => {
    // Canvas & Context
    const canvas = document.getElementById('emote-canvas');
    const ctx = canvas.getContext('2d');

    // Controls
    const ctrlText = document.getElementById('ctrl-text');
    const ctrlFont = document.getElementById('ctrl-font');
    const ctrlColor1 = document.getElementById('ctrl-color1');
    const ctrlStroke = document.getElementById('ctrl-stroke');
    const ctrlStrokeWidth = document.getElementById('ctrl-stroke-width');

    function drawEmote() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const text = ctrlText.value.trim() || 'HYPE';
        const fontFamily = ctrlFont.value;
        const fill = ctrlColor1.value;
        const stroke = ctrlStroke.value;
        const strokeWidth = parseInt(ctrlStrokeWidth.value, 10);

        // Responsive font sizing based on length
        let fontSize = 400;
        if (text.length > 2) fontSize = 300;
        if (text.length > 3) fontSize = 220;
        if (text.length > 4) fontSize = 160;

        ctx.font = `${fontSize}px "${fontFamily}", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;

        const x = canvas.width / 2;
        const y = canvas.height / 2;

        // Draw Stroke (Outline)
        if (strokeWidth > 0) {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = strokeWidth * (fontSize / 100); // Scale stroke with font size
            ctx.strokeText(text, x, y);
        }

        // Draw Fill
        ctx.fillStyle = fill;
        ctx.fillText(text, x, y);
    }

    function downloadEmote(size) {
        // Create an offscreen canvas to scale the 500x500 design down
        const offscreen = document.createElement('canvas');
        offscreen.width = size;
        offscreen.height = size;
        const offCtx = offscreen.getContext('2d');
        
        // Use smooth scaling
        offCtx.imageSmoothingEnabled = true;
        offCtx.imageSmoothingQuality = 'high';
        
        // Draw the main canvas onto the offscreen canvas
        offCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, size, size);

        // Download
        const link = document.createElement('a');
        link.download = `emote_${ctrlText.value || 'HYPE'}_${size}x${size}.png`;
        link.href = offscreen.toDataURL('image/png');
        link.click();
    }

    // Bind Controls
    [ctrlText, ctrlFont, ctrlColor1, ctrlStroke, ctrlStrokeWidth].forEach(el => {
        el.addEventListener('input', drawEmote);
    });

    // Make sure fonts are loaded before initial draw
    document.fonts.ready.then(() => {
        drawEmote();
    });

    // Download Buttons
    document.getElementById('dl-112').addEventListener('click', () => downloadEmote(112));
    document.getElementById('dl-56').addEventListener('click', () => downloadEmote(56));
    document.getElementById('dl-28').addEventListener('click', () => downloadEmote(28));
});

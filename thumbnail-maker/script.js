// Stream Thumbnail Maker - Script

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('thumbnail-canvas');
    const ctx = canvas.getContext('2d');

    const titleInput = document.getElementById('title-text');
    const subtitleInput = document.getElementById('subtitle-text');
    const bgStyleSelect = document.getElementById('bg-style');
    const color1Input = document.getElementById('color1');
    const color2Input = document.getElementById('color2');
    const textStyleSelect = document.getElementById('text-style');
    const showLiveCheckbox = document.getElementById('show-live');
    const downloadBtn = document.getElementById('download-btn');

    function draw() {
        const width = canvas.width;
        const height = canvas.height;
        const color1 = color1Input.value;
        const color2 = color2Input.value;
        const bgStyle = bgStyleSelect.value;
        const textStyle = textStyleSelect.value;

        // Clear
        ctx.clearRect(0, 0, width, height);

        // Background
        if (bgStyle === 'gradient') {
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, color1);
            gradient.addColorStop(1, color2);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        } else if (bgStyle === 'solid') {
            ctx.fillStyle = color2;
            ctx.fillRect(0, 0, width, height);
        } else if (bgStyle === 'pattern') {
            ctx.fillStyle = color2;
            ctx.fillRect(0, 0, width, height);
            // Add diagonal lines pattern
            ctx.strokeStyle = color1 + '33';
            ctx.lineWidth = 40;
            for (let i = -height; i < width + height; i += 80) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i + height, height);
                ctx.stroke();
            }
        }

        // Text rendering
        const title = titleInput.value.toUpperCase();
        const subtitle = subtitleInput.value;

        if (textStyle === 'bold') {
            // Bold Impact style
            ctx.font = 'bold 140px Inter, sans-serif';
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Shadow
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;
            ctx.fillText(title, width / 2, height / 2 - 30);

            ctx.shadowBlur = 0;
            ctx.font = 'bold 48px Inter, sans-serif';
            ctx.fillStyle = color1;
            ctx.fillText(subtitle, width / 2, height / 2 + 80);
        } else if (textStyle === 'neon') {
            // Neon glow
            ctx.font = 'bold 130px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Glow layers
            ctx.shadowColor = color1;
            ctx.shadowBlur = 30;
            ctx.fillStyle = color1;
            ctx.fillText(title, width / 2, height / 2 - 30);

            ctx.shadowBlur = 60;
            ctx.fillText(title, width / 2, height / 2 - 30);

            ctx.shadowBlur = 0;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(title, width / 2, height / 2 - 30);

            ctx.font = 'bold 44px Inter, sans-serif';
            ctx.shadowColor = color1;
            ctx.shadowBlur = 15;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(subtitle, width / 2, height / 2 + 80);
        } else {
            // Clean modern
            ctx.font = '600 120px Inter, sans-serif';
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(title, width / 2, height / 2 - 20);

            ctx.font = '500 40px Inter, sans-serif';
            ctx.fillStyle = '#CCCCCC';
            ctx.fillText(subtitle, width / 2, height / 2 + 70);
        }

        ctx.shadowBlur = 0;

        // LIVE badge
        if (showLiveCheckbox.checked) {
            const badgeX = 50;
            const badgeY = 50;
            const badgeWidth = 120;
            const badgeHeight = 45;

            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 8);
            ctx.fill();

            // Dot
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(badgeX + 25, badgeY + badgeHeight / 2, 8, 0, Math.PI * 2);
            ctx.fill();

            // Text
            ctx.font = 'bold 22px Inter, sans-serif';
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText('LIVE', badgeX + 45, badgeY + badgeHeight / 2);
        }
    }

    // Event listeners
    [titleInput, subtitleInput, bgStyleSelect, color1Input, color2Input, textStyleSelect, showLiveCheckbox].forEach(el => {
        el.addEventListener('input', draw);
        el.addEventListener('change', draw);
    });

    document.querySelectorAll('.color-presets button').forEach(btn => {
        btn.addEventListener('click', () => {
            color1Input.value = btn.dataset.color;
            draw();
        });
    });

    // Download
    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'stream-thumbnail.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    // Initial draw
    draw();
});

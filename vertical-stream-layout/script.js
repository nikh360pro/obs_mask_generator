document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const boxes = document.querySelectorAll('.draggable-box');
    const bgColorInput = document.getElementById('bg-color');
    const webcamShapeSelect = document.getElementById('webcam-shape');
    const downloadBtn = document.getElementById('download-btn');
    const boxWebcam = document.getElementById('box-webcam');

    // Canvas scaling: 360x640 UI maps to 1080x1920 target
    const scale = 1080 / 360; 

    // Draggable logic
    let activeBox = null;
    let startY = 0, startX = 0;
    let initialTop = 0, initialLeft = 0;

    boxes.forEach(box => {
        box.addEventListener('mousedown', (e) => {
            activeBox = box;
            startY = e.clientY;
            startX = e.clientX;
            initialTop = parseInt(window.getComputedStyle(box).top) || 0;
            initialLeft = parseInt(window.getComputedStyle(box).left) || 0;
            box.style.zIndex = 10;
        });
    });

    document.addEventListener('mousemove', (e) => {
        if (!activeBox) return;
        
        const dy = e.clientY - startY;
        const dx = e.clientX - startX;

        let newTop = initialTop + dy;
        let newLeft = initialLeft + dx;

        // basic bounding constraints
        const parentRect = canvas.getBoundingClientRect();
        const boxRect = activeBox.getBoundingClientRect();

        if (newTop < 0) newTop = 0;
        if (newLeft < 0) newLeft = 0;
        if (newTop + boxRect.height > parentRect.height) newTop = parentRect.height - boxRect.height;
        if (newLeft + boxRect.width > parentRect.width) newLeft = parentRect.width - boxRect.width;

        activeBox.style.top = `${newTop}px`;
        activeBox.style.left = `${newLeft}px`;
    });

    document.addEventListener('mouseup', () => {
        if (activeBox) {
            activeBox.style.zIndex = 1;
            activeBox = null;
        }
    });

    // Settings
    bgColorInput.addEventListener('input', (e) => {
        canvas.style.backgroundColor = e.target.value;
    });

    webcamShapeSelect.addEventListener('change', (e) => {
        if (e.target.value === 'circle') {
            boxWebcam.style.borderRadius = '50%';
            boxWebcam.style.height = '160px';
        } else if (e.target.value === 'square') {
            boxWebcam.style.borderRadius = '0';
            boxWebcam.style.height = '160px';
        } else if (e.target.value === 'rectangle') {
            boxWebcam.style.borderRadius = '0';
            boxWebcam.style.height = '90px'; // 160x90 is 16:9
        }
    });

    // Download PNG
    downloadBtn.addEventListener('click', () => {
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = 1080;
        offscreenCanvas.height = 1920;
        const ctx = offscreenCanvas.getContext('2d');

        // Draw BG
        ctx.fillStyle = bgColorInput.value;
        ctx.fillRect(0, 0, 1080, 1920);

        // Draw boxes
        boxes.forEach(box => {
            const style = window.getComputedStyle(box);
            const top = parseInt(style.top) * scale;
            const left = parseInt(style.left) * scale;
            const width = parseInt(style.width) * scale;
            const height = parseInt(style.height) * scale;
            
            // Draw box bg
            ctx.fillStyle = style.backgroundColor;
            if (box.id === 'box-webcam' && webcamShapeSelect.value === 'circle') {
                ctx.beginPath();
                ctx.arc(left + width/2, top + height/2, width/2, 0, 2 * Math.PI);
                ctx.fill();
            } else {
                ctx.fillRect(left, top, width, height);
            }
            
            // Draw text
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.font = 'bold 40px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(box.innerText, left + width/2, top + height/2);
        });

        const link = document.createElement('a');
        link.download = 'vertical-stream-layout.png';
        link.href = offscreenCanvas.toDataURL('image/png');
        link.click();
    });
});

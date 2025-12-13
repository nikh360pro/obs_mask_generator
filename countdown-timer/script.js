// Countdown Timer - Script

document.addEventListener('DOMContentLoaded', () => {
    let totalSeconds = 300; // 5 minutes default
    let remainingSeconds = totalSeconds;
    let timerInterval = null;
    let isRunning = false;

    // DOM Elements
    const previewTimer = document.getElementById('preview-timer');
    const previewLabel = document.getElementById('preview-label');
    const timerPreview = document.getElementById('timer-preview');
    const minutesInput = document.getElementById('minutes');
    const secondsInput = document.getElementById('seconds');
    const timerLabelInput = document.getElementById('timer-label');
    const fontStyleSelect = document.getElementById('font-style');
    const textColorInput = document.getElementById('text-color');
    const bgTypeSelect = document.getElementById('bg-type');
    const bgColorInput = document.getElementById('bg-color');
    const bgColorGroup = document.getElementById('bg-color-group');
    const timerSizeInput = document.getElementById('timer-size');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const downloadBtn = document.getElementById('download-html');

    // Format seconds to MM:SS
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    // Update preview
    function updatePreview() {
        previewTimer.textContent = formatTime(remainingSeconds);
        previewLabel.textContent = timerLabelInput.value;
        previewTimer.style.color = textColorInput.value;
        previewLabel.style.color = textColorInput.value + '99';
        previewTimer.style.fontSize = timerSizeInput.value + 'px';

        // Font style
        switch (fontStyleSelect.value) {
            case 'digital':
                previewTimer.style.fontFamily = "'Orbitron', monospace";
                break;
            case 'modern':
                previewTimer.style.fontFamily = "'Inter', sans-serif";
                break;
            case 'bold':
                previewTimer.style.fontFamily = "Arial Black, sans-serif";
                break;
        }

        // Background
        switch (bgTypeSelect.value) {
            case 'transparent':
                timerPreview.style.background = 'rgba(37, 37, 37, 0.5)';
                bgColorGroup.style.display = 'none';
                break;
            case 'solid':
                timerPreview.style.background = bgColorInput.value;
                bgColorGroup.style.display = 'block';
                break;
            case 'gradient':
                timerPreview.style.background = `linear-gradient(135deg, ${bgColorInput.value} 0%, #1a1a1a 100%)`;
                bgColorGroup.style.display = 'block';
                break;
        }
    }

    // Timer functions
    function startTimer() {
        if (isRunning) return;
        isRunning = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;

        timerInterval = setInterval(() => {
            if (remainingSeconds > 0) {
                remainingSeconds--;
                updatePreview();
            } else {
                stopTimer();
            }
        }, 1000);
    }

    function stopTimer() {
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function resetTimer() {
        stopTimer();
        totalSeconds = parseInt(minutesInput.value) * 60 + parseInt(secondsInput.value);
        remainingSeconds = totalSeconds;
        updatePreview();
    }

    // Generate HTML file for OBS
    function generateHTML() {
        const fontFamily = fontStyleSelect.value === 'digital' ? "'Orbitron', sans-serif" :
            fontStyleSelect.value === 'modern' ? "'Inter', sans-serif" : "Arial Black, sans-serif";
        const bgStyle = bgTypeSelect.value === 'transparent' ? 'transparent' :
            bgTypeSelect.value === 'solid' ? bgColorInput.value :
                `linear-gradient(135deg, ${bgColorInput.value} 0%, #1a1a1a 100%)`;

        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Stream Countdown Timer</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Inter:wght@700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: ${bgStyle};
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            font-family: ${fontFamily};
        }
        .label {
            font-size: ${parseInt(timerSizeInput.value) / 4}px;
            color: ${textColorInput.value}99;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 10px;
        }
        .timer {
            font-size: ${timerSizeInput.value}px;
            font-weight: 700;
            color: ${textColorInput.value};
        }
    </style>
</head>
<body>
    <div class="label">${timerLabelInput.value}</div>
    <div class="timer" id="timer">${formatTime(totalSeconds)}</div>
    <script>
        let remaining = ${totalSeconds};
        const timerEl = document.getElementById('timer');
        
        function format(s) {
            return String(Math.floor(s/60)).padStart(2,'0') + ':' + String(s%60).padStart(2,'0');
        }
        
        setInterval(() => {
            if (remaining > 0) {
                remaining--;
                timerEl.textContent = format(remaining);
            }
        }, 1000);
    </script>
</body>
</html>`;
    }

    // Event Listeners
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', stopTimer);
    resetBtn.addEventListener('click', resetTimer);

    minutesInput.addEventListener('input', resetTimer);
    secondsInput.addEventListener('input', resetTimer);
    timerLabelInput.addEventListener('input', updatePreview);
    fontStyleSelect.addEventListener('change', updatePreview);
    textColorInput.addEventListener('input', updatePreview);
    bgTypeSelect.addEventListener('change', updatePreview);
    bgColorInput.addEventListener('input', updatePreview);
    timerSizeInput.addEventListener('input', updatePreview);

    // Preset durations
    document.querySelectorAll('.preset-durations button').forEach(btn => {
        btn.addEventListener('click', () => {
            minutesInput.value = btn.dataset.minutes;
            secondsInput.value = btn.dataset.seconds;
            resetTimer();
        });
    });

    // Preset labels
    document.querySelectorAll('.preset-labels button').forEach(btn => {
        btn.addEventListener('click', () => {
            timerLabelInput.value = btn.dataset.label;
            updatePreview();
        });
    });

    // Color presets
    document.querySelectorAll('.color-presets button').forEach(btn => {
        btn.addEventListener('click', () => {
            textColorInput.value = btn.dataset.color;
            updatePreview();
        });
    });

    // Download HTML
    downloadBtn.addEventListener('click', () => {
        const html = generateHTML();
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'stream-countdown-timer.html';
        a.click();
        URL.revokeObjectURL(url);
    });

    // Initial setup
    updatePreview();
});

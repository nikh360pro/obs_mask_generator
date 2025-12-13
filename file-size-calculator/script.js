// Video File Size Calculator - Script

document.addEventListener('DOMContentLoaded', () => {
    const videoBitrateInput = document.getElementById('video-bitrate');
    const audioBitrateSelect = document.getElementById('audio-bitrate');
    const hoursInput = document.getElementById('hours');
    const minutesInput = document.getElementById('minutes');
    const secondsInput = document.getElementById('seconds');
    const calculateBtn = document.getElementById('calculate-btn');

    // Results
    const fileSizeEl = document.getElementById('file-size');
    const sizeBreakdownEl = document.getElementById('size-breakdown');
    const totalBitrateEl = document.getElementById('total-bitrate');
    const perMinuteEl = document.getElementById('per-minute');
    const perHourEl = document.getElementById('per-hour');
    const displayDurationEl = document.getElementById('display-duration');
    const storageThisEl = document.getElementById('storage-this');
    const storage10El = document.getElementById('storage-10');
    const storage30El = document.getElementById('storage-30');

    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            videoBitrateInput.value = btn.dataset.value;
            calculate();
        });
    });

    // Duration buttons
    document.querySelectorAll('.duration-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            hoursInput.value = btn.dataset.hours;
            minutesInput.value = btn.dataset.minutes;
            secondsInput.value = 0;
            calculate();
        });
    });

    // Format bytes to human readable
    function formatBytes(bytes) {
        if (bytes < 1024) return bytes.toFixed(2) + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }

    // Format duration as HH:MM:SS
    function formatDuration(hours, minutes, seconds) {
        const h = String(hours).padStart(1, '0');
        const m = String(minutes).padStart(2, '0');
        const s = String(seconds).padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    // Calculate file size
    function calculate() {
        const videoBitrate = parseInt(videoBitrateInput.value) || 6000; // Kbps
        const audioBitrate = parseInt(audioBitrateSelect.value) || 160; // Kbps
        const hours = parseInt(hoursInput.value) || 0;
        const minutes = parseInt(minutesInput.value) || 0;
        const seconds = parseInt(secondsInput.value) || 0;

        const totalBitrate = videoBitrate + audioBitrate; // Kbps
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;

        // Calculate sizes in bytes
        // Size (bytes) = (bitrate in Kbps * 1000 / 8) * seconds
        const videoBytes = (videoBitrate * 1000 / 8) * totalSeconds;
        const audioBytes = (audioBitrate * 1000 / 8) * totalSeconds;
        const totalBytes = videoBytes + audioBytes;

        // Per minute and per hour
        const bytesPerMinute = (totalBitrate * 1000 / 8) * 60;
        const bytesPerHour = bytesPerMinute * 60;

        // Update display
        fileSizeEl.textContent = formatBytes(totalBytes);
        sizeBreakdownEl.textContent = `Video: ${formatBytes(videoBytes)} | Audio: ${formatBytes(audioBytes)}`;

        totalBitrateEl.textContent = totalBitrate.toLocaleString() + ' Kbps';
        perMinuteEl.textContent = formatBytes(bytesPerMinute);
        perHourEl.textContent = formatBytes(bytesPerHour);
        displayDurationEl.textContent = formatDuration(hours, minutes, seconds);

        // Storage calculations
        storageThisEl.textContent = formatBytes(totalBytes);
        storage10El.textContent = formatBytes(totalBytes * 10);
        storage30El.textContent = formatBytes(totalBytes * 30);

        // Animation
        fileSizeEl.style.animation = 'none';
        fileSizeEl.offsetHeight; // Trigger reflow
        fileSizeEl.style.animation = 'pulse 0.3s ease';
    }

    // Event listeners
    calculateBtn.addEventListener('click', calculate);
    videoBitrateInput.addEventListener('input', calculate);
    audioBitrateSelect.addEventListener('change', calculate);
    hoursInput.addEventListener('input', calculate);
    minutesInput.addEventListener('input', calculate);
    secondsInput.addEventListener('input', calculate);

    // Initial calculation
    calculate();
});

// Add pulse animation
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);

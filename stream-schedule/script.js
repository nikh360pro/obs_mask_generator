// Stream Schedule Generator - Script

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('schedule-canvas');
    const ctx = canvas.getContext('2d');
    const accentColorInput = document.getElementById('accent-color');
    const timezoneInput = document.getElementById('timezone');
    const bgStyleSelect = document.getElementById('bg-style');
    const downloadBtn = document.getElementById('download-btn');

    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    function formatTime(time) {
        const [hours, minutes] = time.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    }

    function getScheduleData() {
        const days = [];
        document.querySelectorAll('.day-row').forEach((row, i) => {
            const checkbox = row.querySelector('input[type="checkbox"]');
            const timeInput = row.querySelector('input[type="time"]');
            if (checkbox.checked) {
                days.push({
                    day: dayNames[i].substring(0, 3).toUpperCase(),
                    time: formatTime(timeInput.value)
                });
            }
        });
        return days;
    }

    function draw() {
        const width = canvas.width;
        const height = canvas.height;
        const accent = accentColorInput.value;
        const timezone = timezoneInput.value;
        const bgStyle = bgStyleSelect.value;
        const schedule = getScheduleData();

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Background
        if (bgStyle === 'dark') {
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, width, height);
        } else if (bgStyle === 'gradient') {
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, accent + '33');
            gradient.addColorStop(1, '#1a1a1a');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }
        // transparent = no fill

        // Header
        ctx.fillStyle = accent;
        ctx.fillRect(0, 0, width, 60);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('STREAM SCHEDULE', width / 2, 40);

        // Schedule items
        const startY = 80;
        const itemHeight = 45;
        const padding = 15;

        schedule.forEach((item, i) => {
            const y = startY + i * (itemHeight + 10);

            // Day background
            ctx.fillStyle = '#252525';
            ctx.beginPath();
            ctx.roundRect(padding, y, width - padding * 2, itemHeight, 8);
            ctx.fill();

            // Accent bar
            ctx.fillStyle = accent;
            ctx.beginPath();
            ctx.roundRect(padding, y, 6, itemHeight, [8, 0, 0, 8]);
            ctx.fill();

            // Day name
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 16px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(item.day, padding + 20, y + 28);

            // Time
            ctx.fillStyle = accent;
            ctx.font = '600 14px Inter, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(item.time, width - padding - 15, y + 28);
        });

        // Footer with timezone
        ctx.fillStyle = '#666666';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`All times in ${timezone}`, width / 2, height - 20);
    }

    // Event listeners
    document.querySelectorAll('.day-row input').forEach(input => {
        input.addEventListener('change', draw);
    });

    accentColorInput.addEventListener('input', draw);
    timezoneInput.addEventListener('input', draw);
    bgStyleSelect.addEventListener('change', draw);

    document.querySelectorAll('.color-presets button').forEach(btn => {
        btn.addEventListener('click', () => {
            accentColorInput.value = btn.dataset.color;
            draw();
        });
    });

    // Download
    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'stream-schedule.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    // Initial draw
    draw();
});

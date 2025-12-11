/**
 * Stream Schedule Generator
 * Creates schedule images for Twitch panels
 */

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const config = {
    timezone: 'EST',
    schedule: {
        Monday: { enabled: true, time: '7:00 PM' },
        Tuesday: { enabled: false, time: '' },
        Wednesday: { enabled: true, time: '7:00 PM' },
        Thursday: { enabled: false, time: '' },
        Friday: { enabled: true, time: '8:00 PM' },
        Saturday: { enabled: true, time: '3:00 PM' },
        Sunday: { enabled: true, time: '3:00 PM' }
    },
    bgColor: '#18181B',
    accentColor: '#9146FF',
    textColor: '#EFEFF1'
};

const elements = {
    canvas: document.getElementById('schedule-canvas'),
    timezone: document.getElementById('timezone'),
    entries: document.querySelectorAll('.schedule-entry'),
    bgColor: document.getElementById('bg-color'),
    accentColor: document.getElementById('accent-color'),
    textColor: document.getElementById('text-color'),
    downloadBtn: document.getElementById('download-btn')
};

const ctx = elements.canvas.getContext('2d');

function draw() {
    const WIDTH = 320;
    const HEIGHT = 400;
    const PADDING = 20;

    elements.canvas.width = WIDTH;
    elements.canvas.height = HEIGHT;

    // Background
    ctx.fillStyle = config.bgColor;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Header
    ctx.fillStyle = config.accentColor;
    ctx.fillRect(0, 0, WIDTH, 60);

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 18px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('STREAM SCHEDULE', WIDTH / 2, 32);

    // Timezone
    ctx.font = '500 12px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText(`All times in ${config.timezone}`, WIDTH / 2, 50);

    // Schedule entries
    let y = 80;
    const ROW_HEIGHT = 42;

    DAYS.forEach((day, index) => {
        const entry = config.schedule[day];
        const isEnabled = entry.enabled && entry.time;

        // Alternating row background
        if (index % 2 === 0) {
            ctx.fillStyle = hexToRgba(config.textColor, 0.03);
            ctx.fillRect(PADDING, y, WIDTH - PADDING * 2, ROW_HEIGHT);
        }

        // Day name
        ctx.textAlign = 'left';
        ctx.font = isEnabled ? '600 14px Inter, sans-serif' : '400 14px Inter, sans-serif';
        ctx.fillStyle = isEnabled ? config.textColor : hexToRgba(config.textColor, 0.4);
        ctx.fillText(day, PADDING + 10, y + 26);

        // Time or OFF
        ctx.textAlign = 'right';
        if (isEnabled) {
            ctx.fillStyle = config.accentColor;
            ctx.font = '700 14px Inter, sans-serif';
            ctx.fillText(entry.time, WIDTH - PADDING - 10, y + 26);
        } else {
            ctx.fillStyle = hexToRgba(config.textColor, 0.3);
            ctx.font = '400 12px Inter, sans-serif';
            ctx.fillText('OFF', WIDTH - PADDING - 10, y + 26);
        }

        y += ROW_HEIGHT;
    });

    // Footer line
    ctx.fillStyle = config.accentColor;
    ctx.fillRect(PADDING, HEIGHT - 30, WIDTH - PADDING * 2, 2);
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function downloadSchedule() {
    const link = document.createElement('a');
    link.download = 'stream-schedule.png';
    link.href = elements.canvas.toDataURL('image/png');
    link.click();
}

function updateEntryState(entry) {
    const checkbox = entry.querySelector('input[type="checkbox"]');
    const timeInput = entry.querySelector('.time-input');

    if (checkbox.checked) {
        entry.classList.remove('disabled');
        timeInput.disabled = false;
    } else {
        entry.classList.add('disabled');
        timeInput.disabled = true;
    }
}

// Event listeners
elements.timezone.addEventListener('input', () => {
    config.timezone = elements.timezone.value || 'EST';
    draw();
});

elements.entries.forEach(entry => {
    const day = entry.dataset.day;
    const checkbox = entry.querySelector('input[type="checkbox"]');
    const timeInput = entry.querySelector('.time-input');

    checkbox.addEventListener('change', () => {
        config.schedule[day].enabled = checkbox.checked;
        updateEntryState(entry);
        draw();
    });

    timeInput.addEventListener('input', () => {
        config.schedule[day].time = timeInput.value;
        draw();
    });

    // Initialize state
    updateEntryState(entry);
});

elements.bgColor.addEventListener('input', () => {
    config.bgColor = elements.bgColor.value;
    draw();
});

elements.accentColor.addEventListener('input', () => {
    config.accentColor = elements.accentColor.value;
    draw();
});

elements.textColor.addEventListener('input', () => {
    config.textColor = elements.textColor.value;
    draw();
});

elements.downloadBtn.addEventListener('click', downloadSchedule);

// Initialize
function init() {
    const font = new FontFace('Inter', 'url(https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2)');
    font.load().then(() => {
        document.fonts.add(font);
        draw();
    }).catch(() => draw());
}

document.addEventListener('DOMContentLoaded', init);

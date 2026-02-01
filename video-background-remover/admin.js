const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : 'https://api.mattmyvid.com'; // Adjust as needed

// The Secret Key (Matches Server)
const ADMIN_KEY = "my_super_secret_admin_key_2026";

// State
let pollInterval;
let safeCap = 4.0;

// DOM Elements
const slider = document.getElementById('vram-slider');
const settingLabel = document.getElementById('current-setting');
const maxLabel = document.getElementById('max-limit');
const gpuName = document.getElementById('gpu-name');
const gpuStatus = document.getElementById('gpu-status');

// Metrics
const activeUsers = document.getElementById('active-users');
const dailyVideos = document.getElementById('daily-videos');
const totalRuntime = document.getElementById('total-runtime');

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    await initDashboard();

    // Setup Slider Listener
    slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        updateSliderUI(val);
    });

    // Save on release
    slider.addEventListener('change', async (e) => {
        const val = parseFloat(e.target.value);
        await saveConfig(val);
    });

    // Start Polling
    pollInterval = setInterval(updateStats, 5000);
});

async function initDashboard() {
    try {
        const token = localStorage.getItem('firebaseToken'); // Ideally use this
        // Use Admin Key if available, otherwise fallback to token
        const headers = {
            'x-admin-key': ADMIN_KEY,
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };

        const res = await fetch(`${API_URL}/api/admin/hardware`, { headers });
        if (!res.ok) throw new Error("Failed to load hardware info");

        const data = await res.json();

        // Update Hardware Info
        gpuName.textContent = data.gpu_name || "Unknown GPU";
        gpuStatus.textContent = `Total VRAM: ${data.total_vram_gb} GB`;

        // Update Slider Constraints (The 80% Safety Cap)
        safeCap = data.safe_cap_gb || 4.0;
        slider.max = safeCap;
        maxLabel.textContent = `Max Safe: ${safeCap} GB`;

        // Set current value
        const currentLimit = data.current_config?.safe_limit_gb || 4.0;
        slider.value = currentLimit;
        updateSliderUI(currentLimit);

        // Update Initial Stats
        updateStatsUI(data.stats);

    } catch (e) {
        console.error("Init Error", e);
        // Fallback for demo if offline
        gpuName.textContent = "Server Offline";
    }
}

function updateSliderUI(val) {
    settingLabel.textContent = `${val.toFixed(1)} GB`;
    // Visual feedback
    if (val < (safeCap * 0.5)) {
        settingLabel.style.color = "#4ade80"; // Green (Safe)
    } else {
        settingLabel.style.color = "#f59e0b"; // Amber (Performance)
    }
}

async function saveConfig(val) {
    try {
        const token = localStorage.getItem('firebaseToken');
        const headers = {
            'Content-Type': 'application/json',
            'x-admin-key': ADMIN_KEY,
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };

        await fetch(`${API_URL}/api/admin/config`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ safe_limit_gb: val })
        });

    } catch (e) {
        console.error("Save Error", e);
        alert("Failed to save config");
    }
}

async function updateStats() {
    try {
        const token = localStorage.getItem('firebaseToken');
        const headers = {
            'x-admin-key': ADMIN_KEY,
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };

        const res = await fetch(`${API_URL}/api/admin/stats`, { headers });
        if (res.ok) {
            const stats = await res.json();
            updateStatsUI(stats);
        }
    } catch (e) {
        console.error("Polling Error", e);
    }
}

function updateStatsUI(stats) {
    if (!stats) return;

    // Animate numbers? For now just set text
    activeUsers.textContent = stats.active_users || 0;
    dailyVideos.textContent = stats.daily_videos || 0;

    // Format runtime
    const seconds = stats.total_runtime_seconds || 0;
    const mins = Math.floor(seconds / 60);
    const hrs = (mins / 60).toFixed(1);

    if (mins < 60) {
        totalRuntime.textContent = `${mins}m`;
    } else {
        totalRuntime.textContent = `${hrs}h`;
    }
}

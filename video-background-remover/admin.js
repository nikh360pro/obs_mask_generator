const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : 'https://removebg.obsmaskgenerator.com';

// The Secret Key (Matches Server)
const ADMIN_KEY = "my_super_secret_admin_key_2026";

// State
let pollInterval;
let safeCap = 4.0;

// DOM Elements - GPU
const slider = document.getElementById('vram-slider');
const settingLabel = document.getElementById('current-setting');
const maxLabel = document.getElementById('max-limit');
const gpuName = document.getElementById('gpu-name');
const gpuStatus = document.getElementById('gpu-status');

// DOM Elements - New Sliders
const ramSlider = document.getElementById('ram-slider');
const ramSetting = document.getElementById('ram-setting');
const cpuSlider = document.getElementById('cpu-slider');
const cpuSetting = document.getElementById('cpu-setting');
const resSlider = document.getElementById('res-slider');
const resSetting = document.getElementById('res-setting');

// Metrics
const activeUsers = document.getElementById('active-users');
const dailyVideos = document.getElementById('daily-videos');
const totalRuntime = document.getElementById('total-runtime');

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    await initDashboard();

    // GPU VRAM Slider
    slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        updateSliderUI(val);
    });
    slider.addEventListener('change', async (e) => {
        await saveConfig({ safe_limit_gb: parseFloat(e.target.value) });
    });

    // RAM Slider
    ramSlider.addEventListener('input', (e) => {
        ramSetting.textContent = `${parseFloat(e.target.value)} GB`;
    });
    ramSlider.addEventListener('change', async (e) => {
        await saveConfig({ max_ram_gb: parseFloat(e.target.value) });
    });

    // CPU Slider
    cpuSlider.addEventListener('input', (e) => {
        cpuSetting.textContent = `${parseInt(e.target.value)} cores`;
    });
    cpuSlider.addEventListener('change', async (e) => {
        await saveConfig({ max_cpu_cores: parseInt(e.target.value) });
    });

    // Resolution Slider
    resSlider.addEventListener('input', (e) => {
        resSetting.textContent = `${parseInt(e.target.value)}p`;
    });
    resSlider.addEventListener('change', async (e) => {
        await saveConfig({ max_resolution: parseInt(e.target.value) });
    });

    // Start Polling
    pollInterval = setInterval(updateStats, 5000);

    // Manual Save Button
    const saveBtn = document.getElementById('save-config-btn');
    const saveStatus = document.getElementById('save-status');

    saveBtn.addEventListener('click', async () => {
        // Gather all values
        const config = {
            safe_limit_gb: parseFloat(slider.value),
            max_ram_gb: parseFloat(ramSlider.value),
            max_cpu_cores: parseInt(cpuSlider.value),
            max_resolution: parseInt(resSlider.value)
        };

        // Save
        saveBtn.disabled = true;
        saveBtn.textContent = "Saving...";

        await saveConfig(config);

        // Success Feedback
        saveBtn.textContent = "Saved!";
        saveBtn.style.background = "#22c55e"; // Green
        saveStatus.style.opacity = "1";

        // Reset button after 2 seconds
        setTimeout(() => {
            saveBtn.disabled = false;
            saveBtn.textContent = "💾 Save Changes";
            saveBtn.style.background = "#2563eb"; // Blue
            saveStatus.style.opacity = "0";
        }, 2000);
    });
});

async function initDashboard() {
    try {
        const headers = {
            'x-admin-key': ADMIN_KEY
        };

        const res = await fetch(`${API_URL}/api/admin/hardware`, { headers });
        if (!res.ok) throw new Error("Failed to load hardware info");

        const data = await res.json();

        // Update Hardware Info
        gpuName.textContent = data.gpu_name || "Unknown GPU";
        gpuStatus.textContent = `Total VRAM: ${data.total_vram_gb} GB`;

        // Update GPU Slider Constraints
        safeCap = data.safe_cap_gb || 4.0;
        slider.max = safeCap;
        maxLabel.textContent = `Max: ${safeCap} GB`;

        // Set current values from server config
        const config = data.current_config || {};

        // GPU
        const gpuLimit = config.safe_limit_gb || 4.0;
        slider.value = gpuLimit;
        updateSliderUI(gpuLimit);

        // RAM
        const ramLimit = config.max_ram_gb || 4.0;
        ramSlider.value = ramLimit;
        ramSetting.textContent = `${ramLimit} GB`;

        // CPU
        const cpuLimit = config.max_cpu_cores || 4;
        cpuSlider.value = cpuLimit;
        cpuSetting.textContent = `${cpuLimit} cores`;

        // Resolution
        const resLimit = config.max_resolution || 480;
        resSlider.value = resLimit;
        resSetting.textContent = `${resLimit}p`;

        // Update Initial Stats
        updateStatsUI(data.stats);

    } catch (e) {
        console.error("Init Error", e);
        gpuName.textContent = "Server Offline";
    }
}

function updateSliderUI(val) {
    settingLabel.textContent = `${val.toFixed(1)} GB`;
    if (val < (safeCap * 0.5)) {
        settingLabel.style.color = "#4ade80"; // Green
    } else {
        settingLabel.style.color = "#f59e0b"; // Amber
    }
}

async function saveConfig(configUpdate) {
    try {
        const headers = {
            'Content-Type': 'application/json',
            'x-admin-key': ADMIN_KEY
        };

        const res = await fetch(`${API_URL}/api/admin/config`, {
            method: 'POST',
            headers,
            body: JSON.stringify(configUpdate)
        });

        if (res.ok) {
            console.log("Config saved:", configUpdate);
        }

    } catch (e) {
        console.error("Save Error", e);
        alert("Failed to save config");
    }
}

async function updateStats() {
    try {
        const headers = {
            'x-admin-key': ADMIN_KEY
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

    activeUsers.textContent = stats.active_users || 0;
    dailyVideos.textContent = stats.daily_videos || 0;

    const seconds = stats.total_runtime_seconds || 0;
    const mins = Math.floor(seconds / 60);
    const hrs = (mins / 60).toFixed(1);

    if (mins < 60) {
        totalRuntime.textContent = `${mins}m`;
    } else {
        totalRuntime.textContent = `${hrs}h`;
    }
}

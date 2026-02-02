/**
 * SAM2 Mission Control - Admin Dashboard
 * Comprehensive resource monitoring, presets, and smart mode management
 */

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : window.location.origin;

// Admin key for authentication (matches .env ADMIN_SECRET)
const ADMIN_KEY = "nQC_z_ZlLLU_RDIpwFVJgT1KeZLPbEXi9J-yksPEkIrZgWsEcxTLJKXywn4C20kqTD8SOpPlEvAbCNHCEQacHw";

// State
const state = {
    smartModeEnabled: false,
    currentPreset: null,
    config: {},
    pollInterval: null,
    systemLimits: {
        maxVram: 12,
        maxRam: 16,
        maxCores: 8
    }
};

// DOM Elements
const elements = {
    // GPU
    gpuName: document.getElementById('gpu-name'),
    gpuUtil: document.getElementById('gpu-util'),
    gpuTemp: document.getElementById('gpu-temp'),
    gpuMemBar: document.getElementById('gpu-mem-bar'),
    gpuMemText: document.getElementById('gpu-mem-text'),

    // CPU
    cpuUsage: document.getElementById('cpu-usage'),
    cpuCores: document.getElementById('cpu-cores'),
    cpuCoreBars: document.getElementById('cpu-core-bars'),

    // RAM
    ramUsage: document.getElementById('ram-usage'),
    ramTotal: document.getElementById('ram-total'),
    ramBar: document.getElementById('ram-bar'),
    ramAvailable: document.getElementById('ram-available'),

    // Queue
    queuePending: document.getElementById('queue-pending'),
    queueCurrent: document.getElementById('queue-current'),
    queueJobId: document.getElementById('queue-job-id'),
    queueJobStage: document.getElementById('queue-job-stage'),
    queueJobBar: document.getElementById('queue-job-bar'),

    // Sliders
    sliderVram: document.getElementById('slider-vram'),
    sliderRam: document.getElementById('slider-ram'),
    sliderCpu: document.getElementById('slider-cpu'),
    sliderBatch: document.getElementById('slider-batch'),
    valueVram: document.getElementById('value-vram'),
    valueRam: document.getElementById('value-ram'),
    valueCpu: document.getElementById('value-cpu'),
    valueBatch: document.getElementById('value-batch'),
    valueRes: document.getElementById('value-res'),

    // Smart Mode
    smartToggle: document.getElementById('smart-toggle'),
    smartStatus: document.getElementById('smart-status'),
    smartTier: document.getElementById('smart-tier'),
    smartLoad: document.getElementById('smart-load'),
    smartAction: document.getElementById('smart-action'),
    autoBadge: document.getElementById('auto-badge'),

    // Stats
    statVideos: document.getElementById('stat-videos'),
    statRuntime: document.getElementById('stat-runtime'),
    statUsers: document.getElementById('stat-users'),

    // Status
    statusBadge: document.getElementById('status-badge')
};

// API Helper
async function apiCall(endpoint, method = 'GET', body = null) {
    const headers = {
        'x-admin-key': ADMIN_KEY,
        'Content-Type': 'application/json'
    };

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    try {
        const res = await fetch(`${API_URL}${endpoint}`, options);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return await res.json();
    } catch (e) {
        console.error(`API call failed: ${endpoint}`, e);
        throw e;
    }
}

// Initialize Dashboard
async function initDashboard() {
    try {
        const data = await apiCall('/api/admin/hardware');

        // Set system limits
        state.systemLimits.maxVram = data.safe_cap_gb || 12;
        state.systemLimits.maxRam = data.ram_total_gb || 16;
        state.systemLimits.maxCores = data.cpu_cores_total || 8;

        // Update slider max values
        elements.sliderVram.max = state.systemLimits.maxVram;
        elements.sliderRam.max = state.systemLimits.maxRam;
        elements.sliderCpu.max = state.systemLimits.maxCores;

        // Set current config values
        if (data.current_config) {
            state.config = data.current_config;
            updateSlidersFromConfig(data.current_config);
        }

        // Update smart mode state
        if (data.smart_mode) {
            state.smartModeEnabled = data.smart_mode.enabled;
            updateSmartModeUI(data.smart_mode);
        }

        // Update all displays
        updateHardwareUI(data);
        updateQueueUI(data.queue_status);
        updateStatsUI(data.stats);

        // Create CPU core bars
        createCpuCoreBars(data.cpu_cores_total || 8);

        // Setup event listeners
        setupEventListeners();

        // Start polling
        state.pollInterval = setInterval(pollHardware, 2000);

        console.log('Dashboard initialized');
    } catch (e) {
        console.error('Init failed:', e);
        elements.statusBadge.textContent = 'Offline';
        elements.statusBadge.style.background = 'rgba(239, 68, 68, 0.2)';
        elements.statusBadge.style.color = '#f87171';
    }
}

// Poll hardware data
async function pollHardware() {
    try {
        const data = await apiCall('/api/admin/hardware');
        updateHardwareUI(data);
        updateQueueUI(data.queue_status);
        updateStatsUI(data.stats);

        if (data.smart_mode) {
            state.smartModeEnabled = data.smart_mode.enabled;
            updateSmartModeUI(data.smart_mode);
        }

        // Update config if smart mode changed it
        if (data.current_config && state.smartModeEnabled) {
            updateSlidersFromConfig(data.current_config);
        }
    } catch (e) {
        console.error('Poll failed:', e);
    }
}

// Update Hardware UI
function updateHardwareUI(data) {
    // GPU
    elements.gpuName.textContent = data.gpu_name || 'Unknown GPU';
    elements.gpuUtil.textContent = `${data.gpu_utilization_percent || 0}% Utilization`;

    // GPU Temperature
    const temp = data.gpu_temperature_c || 0;
    elements.gpuTemp.textContent = `${temp}C`;
    elements.gpuTemp.className = 'temp-indicator ' + (
        temp < 60 ? 'temp-cool' : temp < 75 ? 'temp-warm' : 'temp-hot'
    );

    // GPU Memory
    const vramUsed = data.gpu_memory_used_gb || 0;
    const vramTotal = data.total_vram_gb || 1;
    const vramPercent = (vramUsed / vramTotal) * 100;
    elements.gpuMemBar.style.width = `${vramPercent}%`;
    elements.gpuMemBar.className = 'progress-fill ' + getProgressColor(vramPercent);
    elements.gpuMemText.textContent = `${vramUsed.toFixed(1)} / ${vramTotal.toFixed(1)} GB VRAM`;

    // CPU
    elements.cpuUsage.textContent = `${Math.round(data.cpu_usage_percent || 0)}%`;
    elements.cpuCores.textContent = `${data.cpu_cores_total || 0} cores`;

    // CPU per-core bars
    if (data.cpu_per_core && data.cpu_per_core.length > 0) {
        updateCpuCoreBars(data.cpu_per_core);
    }

    // RAM
    const ramUsed = data.ram_used_gb || 0;
    const ramTotal = data.ram_total_gb || 1;
    const ramPercent = (ramUsed / ramTotal) * 100;
    elements.ramUsage.textContent = `${ramUsed.toFixed(1)} GB`;
    elements.ramTotal.textContent = `of ${ramTotal.toFixed(1)} GB`;
    elements.ramBar.style.width = `${ramPercent}%`;
    elements.ramBar.className = 'progress-fill ' + getProgressColor(ramPercent);
    elements.ramAvailable.textContent = `${(data.ram_available_gb || 0).toFixed(1)} GB available`;
}

// Update Queue UI
function updateQueueUI(queueStatus) {
    if (!queueStatus) return;

    elements.queuePending.textContent = queueStatus.pending_jobs || 0;

    if (queueStatus.processing_job) {
        elements.queueCurrent.style.display = 'block';
        elements.queueJobId.textContent = queueStatus.processing_job.job_id;
        elements.queueJobStage.textContent = queueStatus.processing_job.stage || 'processing';
        const percent = queueStatus.processing_job.percent || 0;
        elements.queueJobBar.style.width = `${percent}%`;
    } else {
        elements.queueCurrent.style.display = 'none';
    }
}

// Update Stats UI
function updateStatsUI(stats) {
    if (!stats) return;

    elements.statVideos.textContent = stats.daily_videos || 0;
    elements.statUsers.textContent = stats.active_users || 0;

    // Format runtime
    const seconds = stats.total_runtime_seconds || 0;
    const mins = Math.floor(seconds / 60);
    const hrs = (mins / 60).toFixed(1);
    elements.statRuntime.textContent = mins < 60 ? `${mins}m` : `${hrs}h`;
}

// Update Smart Mode UI
function updateSmartModeUI(smartMode) {
    const enabled = smartMode.enabled;

    // Toggle switch
    elements.smartToggle.classList.toggle('active', enabled);

    // Status text
    elements.smartStatus.textContent = enabled ? 'Enabled' : 'Disabled';
    elements.smartStatus.style.color = enabled ? '#4ade80' : '#64748b';

    // Tier
    const tierNames = {
        'no_crash': 'No Crash',
        'performance': 'Performance',
        'heavy': 'Heavy'
    };
    elements.smartTier.textContent = enabled ? (tierNames[smartMode.current_tier] || smartMode.current_tier) : '--';

    // Load score
    const snapshot = smartMode.metrics_snapshot || {};
    elements.smartLoad.textContent = enabled ? `${snapshot.composite_load || 0}%` : '--';

    // Last action
    if (enabled && smartMode.scaling_history && smartMode.scaling_history.length > 0) {
        const lastEvent = smartMode.scaling_history[smartMode.scaling_history.length - 1];
        elements.smartAction.textContent = lastEvent.reason || '--';
    } else {
        elements.smartAction.textContent = '--';
    }

    // Auto badge and slider state
    elements.autoBadge.style.display = enabled ? 'inline' : 'none';
    setControlsEnabled(!enabled);

    // Update preset buttons
    updatePresetButtons(enabled ? 'smart' : null);
}

// Update sliders from config
function updateSlidersFromConfig(config) {
    if (config.safe_limit_gb !== undefined) {
        elements.sliderVram.value = config.safe_limit_gb;
        elements.valueVram.textContent = `${config.safe_limit_gb.toFixed(1)} GB`;
    }
    if (config.max_ram_gb !== undefined) {
        elements.sliderRam.value = config.max_ram_gb;
        elements.valueRam.textContent = `${config.max_ram_gb.toFixed(1)} GB`;
    }
    if (config.max_cpu_cores !== undefined) {
        elements.sliderCpu.value = config.max_cpu_cores;
        elements.valueCpu.textContent = `${config.max_cpu_cores} cores`;
    }
    if (config.batch_frames !== undefined) {
        elements.sliderBatch.value = config.batch_frames;
        elements.valueBatch.textContent = `${config.batch_frames} frames`;
    }
    if (config.max_resolution !== undefined) {
        updateResolutionButtons(config.max_resolution);
    }
}

// Update resolution buttons
function updateResolutionButtons(resolution) {
    document.querySelectorAll('.res-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.res) === resolution);
    });
    elements.valueRes.textContent = `${resolution}p`;
}

// Update preset buttons
function updatePresetButtons(activePreset) {
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.preset === activePreset);
    });
}

// Enable/disable controls
function setControlsEnabled(enabled) {
    elements.sliderVram.disabled = !enabled;
    elements.sliderRam.disabled = !enabled;
    elements.sliderCpu.disabled = !enabled;
    elements.sliderBatch.disabled = !enabled;
    document.querySelectorAll('.res-btn').forEach(btn => btn.disabled = !enabled);
}

// Create CPU core bars
function createCpuCoreBars(count) {
    elements.cpuCoreBars.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const bar = document.createElement('div');
        bar.className = 'core-bar';
        bar.innerHTML = '<div class="core-fill green" style="height: 0%"></div>';
        elements.cpuCoreBars.appendChild(bar);
    }
}

// Update CPU core bars
function updateCpuCoreBars(perCore) {
    const bars = elements.cpuCoreBars.querySelectorAll('.core-fill');
    perCore.forEach((usage, i) => {
        if (bars[i]) {
            bars[i].style.height = `${usage}%`;
            bars[i].className = 'core-fill ' + getProgressColor(usage);
        }
    });
}

// Get progress bar color class
function getProgressColor(percent) {
    if (percent < 50) return 'green';
    if (percent < 80) return 'yellow';
    return 'red';
}

// Setup event listeners
function setupEventListeners() {
    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
    });

    // Smart mode toggle
    elements.smartToggle.addEventListener('click', toggleSmartMode);

    // Sliders
    elements.sliderVram.addEventListener('input', (e) => {
        elements.valueVram.textContent = `${parseFloat(e.target.value).toFixed(1)} GB`;
    });
    elements.sliderVram.addEventListener('change', (e) => {
        saveConfig({ safe_limit_gb: parseFloat(e.target.value) });
    });

    elements.sliderRam.addEventListener('input', (e) => {
        elements.valueRam.textContent = `${parseFloat(e.target.value).toFixed(1)} GB`;
    });
    elements.sliderRam.addEventListener('change', (e) => {
        saveConfig({ max_ram_gb: parseFloat(e.target.value) });
    });

    elements.sliderCpu.addEventListener('input', (e) => {
        elements.valueCpu.textContent = `${e.target.value} cores`;
    });
    elements.sliderCpu.addEventListener('change', (e) => {
        saveConfig({ max_cpu_cores: parseInt(e.target.value) });
    });

    elements.sliderBatch.addEventListener('input', (e) => {
        elements.valueBatch.textContent = `${e.target.value} frames`;
    });
    elements.sliderBatch.addEventListener('change', (e) => {
        saveConfig({ batch_frames: parseInt(e.target.value) });
    });

    // Resolution buttons
    document.querySelectorAll('.res-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.disabled) return;
            const res = parseInt(btn.dataset.res);
            updateResolutionButtons(res);
            saveConfig({ max_resolution: res });
        });
    });
}

// Apply preset
async function applyPreset(presetName) {
    try {
        const data = await apiCall(`/api/admin/preset/${presetName}`, 'POST');
        console.log('Preset applied:', data);

        if (presetName === 'smart') {
            state.smartModeEnabled = true;
        } else {
            state.smartModeEnabled = false;
            if (data.config) {
                updateSlidersFromConfig(data.config);
            }
        }

        updatePresetButtons(presetName);
    } catch (e) {
        console.error('Failed to apply preset:', e);
        alert('Failed to apply preset');
    }
}

// Toggle smart mode
async function toggleSmartMode() {
    try {
        const newState = !state.smartModeEnabled;
        const data = await apiCall('/api/admin/smart-mode', 'POST', { enabled: newState });
        state.smartModeEnabled = data.smart_mode.enabled;
        updateSmartModeUI(data.smart_mode);
        updatePresetButtons(newState ? 'smart' : null);
    } catch (e) {
        console.error('Failed to toggle smart mode:', e);
    }
}

// Save config
async function saveConfig(configUpdate) {
    try {
        const data = await apiCall('/api/admin/config', 'POST', configUpdate);
        console.log('Config saved:', data);

        // Smart mode gets disabled on manual config change
        if (data.smart_mode_enabled === false) {
            state.smartModeEnabled = false;
            updatePresetButtons(null);
            elements.autoBadge.style.display = 'none';
            setControlsEnabled(true);
        }
    } catch (e) {
        console.error('Failed to save config:', e);
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initDashboard);

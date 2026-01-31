// SAM2 Video Background Remover - Frontend Logic

const API_URL = 'https://removebg.obsmaskgenerator.com';

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyCtaTvetSWLVmMwZuWkiPzXG_N2T26rABc",
    authDomain: "mattmyvid.firebaseapp.com",
    projectId: "mattmyvid",
    storageBucket: "mattmyvid.firebasestorage.app",
    messagingSenderId: "542355121753",
    appId: "1:542355121753:web:d921b929e046010fc43348",
    measurementId: "G-8B60GVWXRV"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized");
} catch (e) {
    console.error("Firebase init failed (Did you update config?):", e);
}

const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// State
let currentFile = null;
let jobId = null;
let pollInterval = null;
let selectionPoints = [];
let currentBrushType = 'keep';
let firstFrameDataUrl = null;
let canvasScale = 1;

// Elements
const sections = {
    upload: document.getElementById('upload-section'),
    selection: document.getElementById('selection-section'),
    processing: document.getElementById('processing-section'),
    complete: document.getElementById('complete-section'),
    error: document.getElementById('error-section')
};

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
    setupUploadHandlers();
    setupSelectionHandlers();
    setupButtonHandlers();
    setupAuthHandlers();
    checkHealth();
}

function setupAuthHandlers() {
    const btnLogin = document.getElementById('btn-login');
    const btnLogout = document.getElementById('btn-logout');
    const userProfile = document.getElementById('user-profile');
    const userAvatar = document.getElementById('user-avatar');
    const cookieBanner = document.getElementById('cookie-banner');
    const btnAcceptCookies = document.getElementById('btn-accept-cookies');

    // Handle broken images
    userAvatar.onerror = () => {
        userAvatar.src = "https://api.dicebear.com/9.x/avataaars/svg?seed=fallback";
    };

    // Cookie Consent Logic
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
        cookieBanner.style.display = 'block';
    }

    btnAcceptCookies.addEventListener('click', () => {
        localStorage.setItem('cookie_consent', 'true');
        cookieBanner.style.display = 'none';

        // Explicitly set persistence when user accepts
        auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(() => {
                console.log("Persistence set to LOCAL");
            })
            .catch((error) => {
                console.error("Persistence error:", error);
            });
    });

    // Ensure persistence is checked on load
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .catch(console.error);

    btnLogin.addEventListener('click', () => {
        // Use popup for better cross-domain compatibility
        auth.signInWithPopup(provider)
            .then((result) => {
                console.log('Login successful:', result.user.email);
            })
            .catch(e => {
                console.error('Login error:', e);
                alert('Login failed: ' + e.message);
            });
    });

    // No redirect handling needed - using popup auth

    btnLogout.addEventListener('click', () => {
        auth.signOut();
    });

    // Monitor Auth State
    auth.onAuthStateChanged(user => {
        updateAuthButtons(user); // Update action buttons

        if (user) {
            btnLogin.style.display = 'none';
            userProfile.style.display = 'flex';

            if (user.photoURL) {
                userAvatar.src = user.photoURL;
            } else {
                userAvatar.src = "https://api.dicebear.com/9.x/avataaars/svg?seed=" + user.uid;
            }

            console.log("User logged in:", user.email);
        } else {
            btnLogin.style.display = 'block';
            userProfile.style.display = 'none';
            console.log("User logged out");
        }
    });
}

function updateAuthButtons(user) {
    const btnPreview = document.getElementById('btn-preview');
    const btnProcess = document.getElementById('btn-process');

    // Clone to remove old event listeners to prevent duplicates/logic conflicts
    // ACTUALLY, better to just handle the logic inside the click handler, 
    // but the user strongly requested changing the TEXT.

    if (user) {
        btnPreview.textContent = 'Preview Mask';
        btnProcess.textContent = 'Process Video';
        btnPreview.classList.remove('btn-login-required');
        btnProcess.classList.remove('btn-login-required');
    } else {
        btnPreview.textContent = 'Login to Preview Mask';
        btnProcess.textContent = 'Login to Process Video';
        btnPreview.classList.add('btn-login-required');
        btnProcess.classList.add('btn-login-required');
    }
}

function showSection(id) {
    Object.values(sections).forEach(s => s.classList.remove('active'));
    sections[id].classList.add('active');
}

// Health Check
async function checkHealth() {
    try {
        const res = await fetch(`${API_URL}/api/health`);
        const data = await res.json();
        console.log('Server health:', data);
        if (data.cuda_available) {
            console.log(`GPU: ${data.gpu_name}`);
        }
    } catch (e) {
        console.warn('Server not available:', e);
    }
}

// Upload Handlers
function setupUploadHandlers() {
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');

    uploadZone.addEventListener('click', () => fileInput.click());

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('video/')) {
            handleFileSelect(file);
        } else {
            alert('Please drop a video file');
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    });
}

async function handleFileSelect(file) {
    currentFile = file;

    // Extract first frame
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.muted = true;

    video.onloadedmetadata = () => {
        if (video.duration > 10) {
            alert(`Video is too long (${video.duration.toFixed(1)}s). Maximum duration is 10 seconds.`);
            URL.revokeObjectURL(video.src);
            currentFile = null;
            document.getElementById('file-input').value = ''; // Reset input
            return;
        }
    };

    video.onloadeddata = () => {
        if (!currentFile) return; // Abort if rejected
        video.currentTime = 0.1; // Seek slightly to ensure frame is loaded
    };

    video.onseeked = () => {
        if (!currentFile) return; // Abort if rejected

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        firstFrameDataUrl = canvas.toDataURL('image/png');

        // Display on selection canvas
        displayFirstFrame();

        URL.revokeObjectURL(video.src);
        selectionPoints = [];
        updatePointsList();
        showSection('selection');
    };
}

function displayFirstFrame() {
    const canvas = document.getElementById('selection-canvas');
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;

    const img = new Image();
    img.onload = () => {
        const containerWidth = container.clientWidth;
        const maxHeight = window.innerHeight * 0.7; // Match CSS 70vh

        // Start by trying to fit width
        let targetWidth = containerWidth;
        let scale = targetWidth / img.width;
        let targetHeight = img.height * scale;

        // If height is too big, constrain by height
        if (targetHeight > maxHeight) {
            targetHeight = maxHeight;
            scale = targetHeight / img.height;
            targetWidth = img.width * scale;
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        canvasScale = scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = firstFrameDataUrl;
}

// Selection Handlers
function setupSelectionHandlers() {
    const canvas = document.getElementById('selection-canvas');
    const btnKeep = document.getElementById('btn-keep');
    const btnRemove = document.getElementById('btn-remove');
    const btnClear = document.getElementById('btn-clear');
    const btnPreview = document.getElementById('btn-preview');
    const btnProcess = document.getElementById('btn-process');

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        selectionPoints.push({ x, y, type: currentBrushType });
        drawPoints();
        updatePointsList();
    });

    btnKeep.addEventListener('click', () => {
        currentBrushType = 'keep';
        btnKeep.classList.add('active');
        btnRemove.classList.remove('active');
    });

    btnRemove.addEventListener('click', () => {
        currentBrushType = 'remove';
        btnRemove.classList.add('active');
        btnKeep.classList.remove('active');
    });

    btnClear.addEventListener('click', () => {
        selectionPoints = [];
        clearMaskOverlay();
        redrawCanvas();
        updatePointsList();
    });

    btnPreview.addEventListener('click', () => {
        if (auth.currentUser) {
            previewMask();
        } else {
            auth.signInWithPopup(provider).then(() => previewMask()).catch(e => alert('Login required: ' + e.message));
        }
    });

    btnProcess.addEventListener('click', () => {
        if (auth.currentUser) {
            startProcessing();
        } else {
            auth.signInWithPopup(provider).then(() => startProcessing()).catch(e => alert('Login required: ' + e.message));
        }
    });
}

function drawPoints() {
    const canvas = document.getElementById('selection-canvas');
    const ctx = canvas.getContext('2d');

    // Redraw frame first
    const img = new Image();
    img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Draw all points
        selectionPoints.forEach((point, index) => {
            const x = point.x * canvas.width;
            const y = point.y * canvas.height;

            // Outer circle
            ctx.beginPath();
            ctx.arc(x, y, 12, 0, Math.PI * 2);
            ctx.fillStyle = point.type === 'keep' ? 'rgba(0, 212, 170, 0.3)' : 'rgba(255, 71, 87, 0.3)';
            ctx.fill();

            // Inner circle
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fillStyle = point.type === 'keep' ? '#00d4aa' : '#ff4757';
            ctx.fill();

            // Border
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Label
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(point.type === 'keep' ? '+' : '-', x, y);
        });
    };
    img.src = firstFrameDataUrl;
}

function redrawCanvas() {
    const canvas = document.getElementById('selection-canvas');
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawPoints();
    };
    img.src = firstFrameDataUrl;
}

function updatePointsList() {
    const list = document.getElementById('points-list');
    if (selectionPoints.length === 0) {
        list.innerHTML = '<p>Click on the image to add selection points</p>';
    } else {
        const keepCount = selectionPoints.filter(p => p.type === 'keep').length;
        const removeCount = selectionPoints.filter(p => p.type === 'remove').length;
        list.innerHTML = `
            <p>
                <span style="color:#00d4aa">● ${keepCount} Keep</span>
                &nbsp;|&nbsp;
                <span style="color:#ff4757">● ${removeCount} Remove</span>
            </p>
        `;
    }
}

function clearMaskOverlay() {
    document.getElementById('mask-overlay').style.backgroundImage = '';
}

// Preview Mask
async function previewMask() {
    if (selectionPoints.length === 0) {
        alert('Please add at least one selection point');
        return;
    }

    const btn = document.getElementById('btn-preview');
    btn.textContent = 'Generating...';
    btn.disabled = true;

    try {
        const headers = { 'Content-Type': 'application/json' };

        // Get Token if User is Logged In
        const user = auth.currentUser;
        if (user) {
            const token = await user.getIdToken();
            headers['Authorization'] = `Bearer ${token}`;
        } else {
            // Should not happen due to UI logic, but good safety
            throw new Error("Please login to preview mask");
        }

        const response = await fetch(`${API_URL}/api/preview-mask`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                image: firstFrameDataUrl,
                points: selectionPoints
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || 'Failed to generate mask');
        }

        const data = await response.json();

        // Display mask overlay
        const overlay = document.getElementById('mask-overlay');
        overlay.style.backgroundImage = `url(${data.mask})`;

    } catch (error) {
        alert('Failed to preview mask: ' + error.message);
    } finally {
        btn.textContent = 'Preview Mask';
        btn.disabled = false;
    }
}

// Start Processing
async function startProcessing() {
    if (!currentFile) {
        alert('Please select a video first');
        return;
    }

    if (selectionPoints.length === 0) {
        alert('Please add at least one selection point');
        return;
    }

    showSection('processing');
    clearMaskOverlay();

    try {
        const formData = new FormData();
        formData.append('file', currentFile);
        formData.append('points', JSON.stringify(selectionPoints));

        // Get Token if User is Logged In
        const user = auth.currentUser;
        const headers = {};
        if (user) {
            const token = await user.getIdToken();
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/api/upload`, {
            method: 'POST',
            body: formData,
            headers: headers // Add headers here
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || 'Upload failed');
        }

        const data = await response.json();
        jobId = data.job_id;

        // Start polling for status
        pollStatus();

    } catch (error) {
        showError(error.message);
    }
}

function pollStatus() {
    pollInterval = setInterval(async () => {
        try {
            const response = await fetch(`${API_URL}/api/status/${jobId}`);
            const data = await response.json();

            updateProgress(data);

            if (data.status === 'complete') {
                clearInterval(pollInterval);
                showComplete();
            } else if (data.status === 'error') {
                clearInterval(pollInterval);
                showError(data.message);
            }
        } catch (error) {
            clearInterval(pollInterval);
            showError(error.message);
        }
    }, 500);
}

function updateProgress(data) {
    const fill = document.getElementById('progress-fill');
    const stage = document.getElementById('progress-stage');
    const percent = document.getElementById('progress-percent');
    const status = document.getElementById('processing-status');

    fill.style.width = `${data.percent || 0}%`;
    stage.textContent = data.stage || 'Processing';
    percent.textContent = `${data.percent || 0}%`;

    // Handle Queued State
    if (data.status === 'queued') {
        status.innerHTML = `<strong>${data.message || 'Waiting in line...'}</strong>`;
        fill.classList.add('queued'); // Add striped/pulsing effect via CSS
    } else {
        status.textContent = data.message || 'Processing...';
        fill.classList.remove('queued');
    }

    // Update step indicators
    const steps = ['extract', 'segment', 'composite', 'encode'];
    const stageMap = {
        'extracting': 0,
        'loading': 1,
        'segmenting': 1,
        'compositing': 2,
        'encoding': 3,
        'complete': 4
    };

    const currentStep = stageMap[data.stage] || 0;
    steps.forEach((step, index) => {
        const el = document.getElementById(`step-${step}`);
        el.classList.remove('active', 'complete');
        if (index < currentStep) {
            el.classList.add('complete');
        } else if (index === currentStep) {
            el.classList.add('active');
        }
    });
}

function showComplete() {
    const video = document.getElementById('result-video');
    video.src = `${API_URL}/api/download/${jobId}`;
    showSection('complete');
}

function showError(message) {
    document.getElementById('error-message').textContent = message;
    showSection('error');
}

// Button Handlers
function setupButtonHandlers() {
    document.getElementById('btn-download').addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = `${API_URL}/api/download/${jobId}`;
        link.download = `greenscreen_${jobId}.mp4`;
        link.click();
    });

    document.getElementById('btn-new').addEventListener('click', reset);
    document.getElementById('btn-retry').addEventListener('click', reset);
}

function reset() {
    currentFile = null;
    jobId = null;
    selectionPoints = [];
    firstFrameDataUrl = null;
    if (pollInterval) clearInterval(pollInterval);

    document.getElementById('progress-fill').style.width = '0%';
    document.getElementById('file-input').value = '';
    clearMaskOverlay();

    showSection('upload');
}

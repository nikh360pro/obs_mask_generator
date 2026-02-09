// SAM2 Video Background Remover - Frontend Logic

// Dynamic API URL based on environment
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'  // Local development
    : 'https://removebg.obsmaskgenerator.com';  // Production

// Google Analytics 4 - GDPR Compliant Conditional Loading
// Measurement ID loaded from server to keep it out of version control
let ga4MeasurementId = null;

async function loadGA4() {
    if (typeof gtag !== 'undefined') {
        console.log('GA4 already loaded');
        return;
    }

    // Fetch GA4 config from server if not already loaded
    if (!ga4MeasurementId) {
        try {
            const response = await fetch(`${API_URL}/api/analytics-config`);
            const config = await response.json();
            ga4MeasurementId = config.measurementId;
        } catch (e) {
            console.error('Failed to load GA4 config:', e);
            return;
        }
    }

    if (!ga4MeasurementId) {
        console.warn('GA4 measurement ID not configured');
        return;
    }

    // Dynamically load GA4 script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ga4MeasurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;  // Make gtag globally available
    gtag('js', new Date());
    gtag('config', ga4MeasurementId);

    console.log('GA4 loaded after cookie consent');
}

// Check cookie consent and load GA4 if accepted
const cookieConsent = localStorage.getItem('cookie_consent');
if (cookieConsent === 'true') {
    loadGA4();
}

// Firebase - initialized asynchronously from server config
let auth = null;
let provider = null;
let firebaseInitialized = false;

async function initFirebase() {
    if (firebaseInitialized) return;

    try {
        // Fetch Firebase config from server (keeps API key out of git)
        const response = await fetch(`${API_URL}/api/firebase-config`);
        if (!response.ok) {
            throw new Error(`Failed to fetch Firebase config: ${response.status}`);
        }
        const firebaseConfig = await response.json();

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        provider = new firebase.auth.GoogleAuthProvider();
        firebaseInitialized = true;
        console.log("Firebase initialized from server config");

        // Now setup auth state listener
        setupAuthStateListener();
    } catch (e) {
        console.error("Firebase init failed:", e);
        // Show error to user
        const btnLogin = document.getElementById('btn-login');
        if (btnLogin) {
            btnLogin.textContent = 'Auth Unavailable';
            btnLogin.disabled = true;
        }
    }
}

// State
let currentFile = null;
let jobId = null;
let pollInterval = null;
let selectionPoints = [];
let currentBrushType = 'keep';
let firstFrameDataUrl = null;
let canvasScale = 1;
let isWatermarkRemoved = false; // Viral Feature State
let uploadController = null;  // Global abort controller for upload
let uploadTimeoutId = null;   // Global timeout ID for upload

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

async function init() {
    setupUploadHandlers();
    setupSelectionHandlers();
    setupButtonHandlers();
    setupCookieHandlers();
    setupViralHandlers(); // Initialize Viral Feature
    checkHealth();

    // Initialize Firebase asynchronously (fetches config from server)
    await initFirebase();
}

function setupCookieHandlers() {
    const cookieBanner = document.getElementById('cookie-banner');
    const btnAcceptCookies = document.getElementById('btn-accept-cookies');

    // Cookie Consent Logic
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
        cookieBanner.style.display = 'block';
    }

    btnAcceptCookies.addEventListener('click', () => {
        localStorage.setItem('cookie_consent', 'true');
        cookieBanner.style.display = 'none';

        // Load Google Analytics after consent (GDPR compliant)
        loadGA4();

        // Set persistence if Firebase is ready
        if (auth) {
            auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
                .then(() => {
                    console.log("Persistence set to LOCAL");
                })
                .catch((error) => {
                    console.error("Persistence error:", error);
                });
        }
    });
}

function setupAuthStateListener() {
    // Called after Firebase is initialized
    const btnLogin = document.getElementById('btn-login');
    const btnLogout = document.getElementById('btn-logout');
    const userProfile = document.getElementById('user-profile');
    const userAvatar = document.getElementById('user-avatar');

    // Handle broken images
    userAvatar.onerror = () => {
        userAvatar.src = "https://api.dicebear.com/9.x/avataaars/svg?seed=fallback";
    };

    // Ensure persistence is set on load
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .catch(console.error);

    btnLogin.addEventListener('click', () => {
        if (!auth) {
            alert('Authentication not available. Please refresh the page.');
            return;
        }
        // Ensure persistence is set before sign in
        auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(() => {
                return auth.signInWithPopup(provider);
            })
            .catch(e => alert(e.message));
    });

    btnLogout.addEventListener('click', () => {
        if (auth) {
            auth.signOut();
        }
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

    // Track video upload start (GA4 Event #1)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'video_upload_start', {
            'event_category': 'engagement',
            'event_label': file.type,
            'file_size_mb': (file.size / (1024 * 1024)).toFixed(2)
        });
    }

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

    // Handle both mouse clicks and touch events
    function handlePointSelection(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        const x = (clientX - rect.left) / rect.width;
        const y = (clientY - rect.top) / rect.height;

        selectionPoints.push({ x, y, type: currentBrushType });
        drawPoints();
        updatePointsList();

        // Track point added (GA4 Event #7)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'point_added', {
                'event_category': 'engagement',
                'event_label': currentBrushType,
                'point_count': selectionPoints.length
            });
        }
    }

    // Mouse click support
    canvas.addEventListener('click', (e) => {
        handlePointSelection(e.clientX, e.clientY);
    });

    // Touch event support for mobile
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent scrolling/zooming
        const touch = e.touches[0];
        handlePointSelection(touch.clientX, touch.clientY);
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
        if (!auth) {
            alert('Authentication not ready. Please wait or refresh the page.');
            return;
        }
        if (auth.currentUser) {
            previewMask();
        } else {
            auth.signInWithPopup(provider).catch(e => alert(e.message));
        }
    });

    btnProcess.addEventListener('click', async () => {
        console.log('[Process] Button clicked - currentFile:', currentFile ? currentFile.name : 'NULL', 'points:', selectionPoints.length);

        if (!auth) {
            alert('Authentication not ready. Please wait or refresh the page.');
            return;
        }

        const userEmail = auth.currentUser ? auth.currentUser.email : 'not logged in';
        console.log('[Process] Auth state:', userEmail);

        if (auth.currentUser) {
            try {
                await startProcessing();
            } catch (e) {
                console.error('[Process] Error:', e);
                alert('Processing error: ' + (e.message || 'Unknown error'));
                showError(e.message || 'Processing failed');
            }
        } else {
            // User not logged in, trigger login
            console.log('[Process] User not logged in, showing login popup');
            auth.signInWithPopup(provider).catch(e => {
                console.error('[Process] Login error:', e);
                alert('Login failed: ' + e.message);
            });
        }
    });
}

function drawPoints() {
    const canvas = document.getElementById('selection-canvas');
    const ctx = canvas.getContext('2d');

    // Detect mobile for larger touch targets
    const isMobile = window.innerWidth < 768;
    const outerRadius = isMobile ? 16 : 12;
    const innerRadius = isMobile ? 12 : 8;

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
            ctx.arc(x, y, outerRadius, 0, Math.PI * 2);
            ctx.fillStyle = point.type === 'keep' ? 'rgba(0, 212, 170, 0.3)' : 'rgba(255, 71, 87, 0.3)';
            ctx.fill();

            // Inner circle
            ctx.beginPath();
            ctx.arc(x, y, innerRadius, 0, Math.PI * 2);
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
        const user = auth ? auth.currentUser : null;
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

        // Track preview generated (GA4 Event #8)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'preview_generated', {
                'event_category': 'engagement',
                'point_count': selectionPoints.length
            });
        }

    } catch (error) {
        alert('Failed to preview mask: ' + error.message);

        // Track error (GA4 Event #6)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'error_occurred', {
                'event_category': 'error',
                'event_label': 'preview_mask_failed',
                'error_message': error.message
            });
        }
    } finally {
        btn.textContent = 'Preview Mask';
        btn.disabled = false;
    }
}

// Start Processing
async function startProcessing() {
    console.log('[startProcessing] Called');
    console.log('[startProcessing] currentFile:', currentFile ? currentFile.name : 'null');
    console.log('[startProcessing] selectionPoints:', selectionPoints.length);

    if (!currentFile) {
        alert('Please select a video first');
        return;
    }

    if (selectionPoints.length === 0) {
        alert('Please add at least one selection point');
        return;
    }

    console.log('[startProcessing] Showing processing section');
    showSection('processing');
    clearMaskOverlay();

    // CRITICAL FIX: Clean up any previous upload controller/timeout before starting new upload
    if (uploadController) {
        console.log('[startProcessing] Cleaning up previous upload controller');
        uploadController = null;
    }
    if (uploadTimeoutId) {
        console.log('[startProcessing] Clearing previous upload timeout');
        clearTimeout(uploadTimeoutId);
        uploadTimeoutId = null;
    }

    try {
        const formData = new FormData();
        formData.append('file', currentFile);
        formData.append('points', JSON.stringify(selectionPoints));
        formData.append('remove_watermark', isWatermarkRemoved); // Send Viral Flag

        // Get Token if User is Logged In
        const user = auth ? auth.currentUser : null;
        console.log('[startProcessing] Getting token for user:', user ? user.email : 'none');
        const headers = {};
        if (user) {
            const token = await user.getIdToken();
            console.log('[startProcessing] Token obtained');
            headers['Authorization'] = `Bearer ${token}`;
        }

        console.log('[startProcessing] Sending upload request to:', `${API_URL}/api/upload-video`);

        // Create new controller and timeout for this upload
        uploadController = new AbortController();
        uploadTimeoutId = setTimeout(() => {
            console.log('[startProcessing] Upload timeout reached, aborting');
            uploadController.abort();
        }, 60000); // 60s timeout

        let response;
        try {
            response = await fetch(`${API_URL}/api/upload-video`, {
                method: 'POST',
                body: formData,
                headers: headers,
                signal: uploadController.signal
            });
        } catch (fetchError) {
            clearTimeout(uploadTimeoutId);
            uploadTimeoutId = null;
            console.error('[startProcessing] Fetch error:', fetchError);
            throw new Error(fetchError.name === 'AbortError' ? 'Upload timed out' : `Network error: ${fetchError.message}`);
        }
        clearTimeout(uploadTimeoutId);
        uploadTimeoutId = null;

        console.log('[startProcessing] Response status:', response.status);
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || 'Upload failed');
        }

        const data = await response.json();
        jobId = data.job_id;
        console.log('[startProcessing] Job ID:', jobId);

        // Track upload complete and processing start (GA4 Events #2 & #3)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'video_upload_complete', {
                'event_category': 'conversion',
                'event_label': currentFile.type,
                'file_size_mb': (currentFile.size / (1024 * 1024)).toFixed(2)
            });
            gtag('event', 'processing_start', {
                'event_category': 'conversion',
                'point_count': selectionPoints.length,
                'job_id': jobId
            });
        }

        // Start polling for status
        pollStatus();

    } catch (error) {
        showError(error.message);

        // Track error (GA4 Event #6)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'error_occurred', {
                'event_category': 'error',
                'event_label': 'upload_failed',
                'error_message': error.message
            });
        }
    }
}

function pollStatus() {
    // Clear any existing poll interval first
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
    console.log('[pollStatus] Starting polling for job:', jobId);
    pollInterval = setInterval(async () => {
        try {
            const response = await fetch(`${API_URL}/api/status/${jobId}`);
            const data = await response.json();

            updateProgress(data);

            if (data.status === 'complete') {
                clearInterval(pollInterval);
                showComplete();

                // Track processing complete (GA4 Event #4)
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'processing_complete', {
                        'event_category': 'conversion',
                        'job_id': jobId
                    });
                }
            } else if (data.status === 'error') {
                clearInterval(pollInterval);
                showError(data.message);

                // Track error (GA4 Event #6)
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'error_occurred', {
                        'event_category': 'error',
                        'event_label': 'processing_failed',
                        'error_message': data.message
                    });
                }
            }
        } catch (error) {
            clearInterval(pollInterval);
            showError(error.message);

            // Track error (GA4 Event #6)
            if (typeof gtag !== 'undefined') {
                gtag('event', 'error_occurred', {
                    'event_category': 'error',
                    'event_label': 'polling_failed',
                    'error_message': error.message
                });
            }
        }
    }, 2000);  // Poll every 2 seconds (30 requests/min limit)
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

        // Track video download (GA4 Event #5)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'video_download', {
                'event_category': 'conversion',
                'job_id': jobId
            });
        }
    });

    document.getElementById('btn-new').addEventListener('click', reset);
    document.getElementById('btn-retry').addEventListener('click', reset);
}

// Viral Feature Handlers
function setupViralHandlers() {
    const btnShare = document.getElementById('btn-share-watermark');
    const status = document.getElementById('viral-status');

    btnShare.addEventListener('click', async () => {
        const shareData = {
            title: 'Free AI Video Background Remover',
            text: 'Check out this free tool to remove video backgrounds without a green screen!',
            url: 'https://obsmaskgenerator.com/video-background-remover/'
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareData.url);
                alert('Link copied to clipboard! Share it to unlock.');
            }

            // Unlock Feature
            isWatermarkRemoved = true;
            btnShare.style.display = 'none';
            status.style.display = 'block';

        } catch (err) {
            console.log('Share canceled:', err);
        }
    });
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

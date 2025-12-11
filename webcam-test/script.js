/**
 * Webcam Test
 * Tests camera and microphone before streaming
 */

let stream = null;
let audioContext = null;
let analyser = null;
let animationId = null;
let isMirrored = true;

const elements = {
    video: document.getElementById('video'),
    placeholder: document.getElementById('video-placeholder'),
    startBtn: document.getElementById('start-btn'),
    mirrorBtn: document.getElementById('mirror-btn'),
    resolution: document.getElementById('resolution'),
    fps: document.getElementById('fps'),
    cameraName: document.getElementById('camera-name'),
    audioBar: document.getElementById('audio-bar'),
    audioLabel: document.getElementById('audio-label')
};

async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 60 } },
            audio: true
        });

        elements.video.srcObject = stream;
        elements.video.classList.add('active', 'mirrored');
        elements.placeholder.classList.add('hidden');

        elements.startBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
            </svg>
            Stop Camera
        `;
        elements.startBtn.classList.add('stop');
        elements.mirrorBtn.disabled = false;

        // Get video track info
        const videoTrack = stream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();

        elements.resolution.textContent = `${settings.width} × ${settings.height}`;
        elements.fps.textContent = `${settings.frameRate || 30} fps`;
        elements.cameraName.textContent = videoTrack.label || 'Unknown';

        // Setup audio meter
        setupAudioMeter(stream);

    } catch (error) {
        console.error('Error accessing camera:', error);
        elements.placeholder.innerHTML = `
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <p>Camera access denied or not available</p>
        `;
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }

    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }

    elements.video.srcObject = null;
    elements.video.classList.remove('active', 'mirrored');
    elements.placeholder.classList.remove('hidden');
    elements.placeholder.innerHTML = `
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M23 7l-7 5 7 5V7z"/>
            <rect x="1" y="5" width="15" height="14" rx="2"/>
        </svg>
        <p>Click "Start Camera" to begin</p>
    `;

    elements.startBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 7l-7 5 7 5V7z"/>
            <rect x="1" y="5" width="15" height="14" rx="2"/>
        </svg>
        Start Camera
    `;
    elements.startBtn.classList.remove('stop');
    elements.mirrorBtn.disabled = true;

    elements.resolution.textContent = '--';
    elements.fps.textContent = '--';
    elements.cameraName.textContent = '--';
    elements.audioBar.style.width = '0%';
    elements.audioLabel.textContent = 'Microphone not active';
}

function setupAudioMeter(stream) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    function updateMeter() {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const percentage = Math.min(100, (average / 128) * 100);

        elements.audioBar.style.width = `${percentage}%`;

        if (percentage > 5) {
            elements.audioLabel.textContent = 'Microphone active ✓';
        } else {
            elements.audioLabel.textContent = 'Speak to test microphone...';
        }

        animationId = requestAnimationFrame(updateMeter);
    }

    updateMeter();
}

function toggleMirror() {
    isMirrored = !isMirrored;
    elements.video.classList.toggle('mirrored', isMirrored);
    elements.mirrorBtn.classList.toggle('active', isMirrored);
}

// Event listeners
elements.startBtn.addEventListener('click', () => {
    if (stream) {
        stopCamera();
    } else {
        startCamera();
    }
});

elements.mirrorBtn.addEventListener('click', toggleMirror);

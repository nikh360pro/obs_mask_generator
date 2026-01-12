const fs = require('fs');
const path = require('path');

// Load DB
const dbPath = path.join(__dirname, 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Template for generated pages
const template = (game, gpu) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Can I Stream ${game.name} on ${gpu.name}? (2026 Benchmark)</title>
    <meta name="description" content="Check benchmark and recommended OBS settings for streaming ${game.name} with ${gpu.name}. Find out if your PC can handle 1080p 60fps streaming.">
    <link rel="stylesheet" href="../../../style.css">
    <link rel="stylesheet" href="../../../assets/css/common.css">
    <link rel="canonical" href="https://obsmaskgenerator.com/can-i-stream/${game.id}/${gpu.id}/">
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-C84663S6K3"></script>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4560264570048889"
        crossorigin="anonymous"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', 'G-C84663S6K3');
    </script>
</head>
<body>
    <div class="app-container">
        <nav class="navbar">
            <div class="nav-content">
                <a href="/" class="nav-logo">OBS Mask Generator</a>
                <div class="nav-links">
                    <a href="/">Home</a>
                    <a href="/settings-generator/">Settings Gen</a>
                    <a href="/can-i-stream/">Can I Stream?</a>
                </div>
            </div>
        </nav>

        <main style="max-width: 800px; margin: 40px auto; padding: 20px;">
            <div class="breadcrumbs" style="margin-bottom: 20px; font-size: 0.9em; color: var(--text-secondary);">
                <a href="/can-i-stream/" style="color: var(--text-secondary);">Can I Stream It?</a> > 
                <span>${game.name}</span>
            </div>

            <h1>Can I Stream ${game.name} with ${gpu.name}?</h1>

            <div class="answer-box" style="
                background: ${calculateHeadroom(gpu, game) >= 0 ? 'rgba(0, 245, 147, 0.1)' : 'rgba(235, 4, 0, 0.1)'};
                border: 1px solid ${calculateHeadroom(gpu, game) >= 0 ? '#00f593' : '#eb0400'};
                padding: 25px;
                border-radius: 12px;
                margin: 30px 0;
            ">
                <h2 style="margin-top: 0;">${calculateHeadline(gpu, game)}</h2>
                <p>${calculateDescription(gpu, game)}</p>
            </div>

            <h2>Recommended OBS Settings</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background: var(--bg-secondary); border-radius: 8px; overflow: hidden;">
                <tr style="background: var(--bg-tertiary);">
                    <th style="text-align: left; padding: 15px;">Setting</th>
                    <th style="padding: 15px;">Value</th>
                </tr>
                <tr>
                    <td style="padding: 15px; border-bottom: 1px solid var(--border-color);">Encoder</td>
                    <td style="padding: 15px; border-bottom: 1px solid var(--border-color);">${gpu.encoder.split('/')[0]}</td>
                </tr>
                <tr>
                    <td style="padding: 15px; border-bottom: 1px solid var(--border-color);">Resolution</td>
                    <td style="padding: 15px; border-bottom: 1px solid var(--border-color);">${calculateHeadroom(gpu, game) >= 0 ? '1920x1080' : '1280x720'}</td>
                </tr>
                <tr>
                    <td style="padding: 15px; border-bottom: 1px solid var(--border-color);">Bitrate</td>
                    <td style="padding: 15px; border-bottom: 1px solid var(--border-color);">${calculateHeadroom(gpu, game) >= 0 ? '6000 Kbps' : '4500 Kbps'}</td>
                </tr>
            </table>

            <div style="margin-top: 50px; text-align: center;">
                <a href="/can-i-stream/" class="download-btn primary">Open Calculator</a>
            </div>

            <div style="margin-top: 50px; border-top: 1px solid var(--border-color); padding-top: 20px; font-size: 0.8em; color: #848494; text-align: center;">
                <p><em>Methodology: Efficiency estimates are based on hardware specifications (CUDA/Stream Processors, VRAM, Encoder Generation) and theoretical performance tiers. Real-world performance may vary based on specific driver versions, thermal throttling, and background processes.</em></p>
            </div>
        </main>
    </div>
</body>
</html>`;

// Logic Helper (Duplicated from frontend for simplicity)
function calculateHeadroom(gpu, game) {
    let encoderBonus = (gpu.tier === 'S' || gpu.tier === 'A') ? 20 : 0;
    return (gpu.score - game.score) + encoderBonus;
}

function calculateHeadline(gpu, game) {
    const score = calculateHeadroom(gpu, game);
    if (score >= 20) return "✅ Yes, Perfect Performance";
    if (score >= 0) return "⚠️ Yes, but check settings";
    return "❌ Likely to Lag";
}

function calculateDescription(gpu, game) {
    const score = calculateHeadroom(gpu, game);
    if (score >= 20) return `The **${gpu.name}** is a powerful Tier ${gpu.tier} card. It can easily handle streaming **${game.name}** while maintaining a smooth stream.`;
    if (score >= 0) return `The **${gpu.name}** meets the requirements for **${game.name}**, but you should monitor performance. We recommend using the **${gpu.encoder.split('/')[0]}** encoder to offload work.`;
    return `**${game.name}** is a heavy game, and the **${gpu.name}** (Tier ${gpu.tier}) might struggle to encode and render simultaneously. Consider lowering in-game graphics or streaming at 720p.`;
}

// Generate all combinations
console.log("Generating Pages...");

db.games.forEach(game => {
    const gameDir = path.join(__dirname, game.id);
    if (!fs.existsSync(gameDir)) fs.mkdirSync(gameDir);

    db.gpus.forEach(gpu => {
        const gpuDir = path.join(gameDir, gpu.id);
        if (!fs.existsSync(gpuDir)) fs.mkdirSync(gpuDir);

        const html = template(game, gpu);
        fs.writeFileSync(path.join(gpuDir, 'index.html'), html);
        console.log(`Generated: ${game.id}/${gpu.id}`);
    });
});

console.log("Done!");

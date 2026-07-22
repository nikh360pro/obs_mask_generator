const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const dataDir = path.join(rootDir, 'data');
const canIStreamDir = path.join(rootDir, 'can-i-stream');
const sitemapPath = path.join(rootDir, 'sitemap.xml');

// Load Data
const gamesData = JSON.parse(fs.readFileSync(path.join(dataDir, 'games.json'), 'utf8')).games;
const gpusData = JSON.parse(fs.readFileSync(path.join(dataDir, 'gpus.json'), 'utf8')).gpus;

let newUrls = [];

function getVerdict(gpuIntensity, gpuTier) {
    // A simplified logic to determine if the GPU can stream the game
    const intensityMap = { 'very-low': 1, 'low': 2, 'medium': 3, 'high': 4, 'very-high': 5 };
    const tierMap = { 'entry': 1, 'budget': 2, 'mid-range': 3, 'mid-high': 4, 'high-end': 5, 'flagship': 6 };
    
    const intensityScore = intensityMap[gpuIntensity] || 3;
    const tierScore = tierMap[gpuTier] || 3;
    
    if (tierScore >= intensityScore + 1) return { score: "Perfect ✅", color: "#00f593" };
    if (tierScore >= intensityScore) return { score: "Great ✅", color: "#9146ff" };
    if (tierScore >= intensityScore - 1) return { score: "Good ✅", color: "#ffb800" };
    if (tierScore >= intensityScore - 2) return { score: "Struggling ⚠️ (Use 720p)", color: "#ff5050" };
    return { score: "Not Recommended ❌", color: "#ff5050" };
}

function generateHTML(game, gpu, verdict) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/svg+xml" href="../../../favicon.svg">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Can I Stream ${game.name} on a ${gpu.name}? | OBS Performance Check</title>
    <meta name="description" content="Check if the ${gpu.name} can stream ${game.name}. Best OBS settings, encoding presets, and expected streaming performance.">
    <link rel="canonical" href="https://obsmaskgenerator.com/can-i-stream/${game.slug}/${gpu.slug}/">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../../../blog/blog-style.css">
    <link rel="stylesheet" href="../../../assets/css/common.css">
    <script src="/components.js" defer></script>
</head>
<body>
    <header class="blog-header">
        <div class="header-content"><a href="../../../" class="logo">OBS Tools</a>
            <nav><a href="../../../">Tools</a><a href="../../../blog/">Blog</a></nav>
        </div>
    </header>
    <main class="blog-container">
        <article class="blog-article">
            <div class="article-header">
                <div class="breadcrumb"><a href="../../../">Home</a> › <a href="../../">Can I Stream?</a> › ${game.name}</div>
                <h1>Can I Stream ${game.name} on a ${gpu.name}?</h1>
            </div>
            <div class="article-content">
                <div style="background: rgba(145, 70, 255, 0.1); border-left: 4px solid ${verdict.color}; padding: 1.5rem; margin: 2rem 0; border-radius: 4px;">
                    <h3 style="margin-top: 0; color: ${verdict.color};">Verdict: ${verdict.score}</h3>
                    <p>The <strong>${gpu.name}</strong> (${gpu.encoder} encoder) handles ${game.name} at this tier. ${game.notes}</p>
                </div>
                <h2>Recommended OBS Settings</h2>
                <ul>
                    <li><strong>Encoder:</strong> ${gpu.encoder} (${gpu.encoder_gen})</li>
                    <li><strong>Bitrate (1080p60):</strong> ${gpu.recommended_bitrate_1080p60} Kbps</li>
                    <li><strong>Preset:</strong> ${gpu.recommended_preset}</li>
                    <li><strong>AV1 Support:</strong> ${gpu.av1_support ? 'Yes - Use it for YouTube!' : 'No - Stick to H.264 or HEVC.'}</li>
                </ul>
                <div class="cta-box">
                    <h3>⚙️ Get Full Custom Settings</h3>
                    <a href="../../../settings-generator/" class="cta-button">Open Settings Generator →</a>
                </div>
            </div>
        </article>
    </main>
    <footer class="footer"><p>Free OBS Tools</p></footer>
</body>
</html>`;
}

if (!fs.existsSync(canIStreamDir)) {
    fs.mkdirSync(canIStreamDir);
}

gamesData.forEach(game => {
    const gameDir = path.join(canIStreamDir, game.slug);
    if (!fs.existsSync(gameDir)) {
        fs.mkdirSync(gameDir);
    }

    gpusData.forEach(gpu => {
        const gpuDir = path.join(gameDir, gpu.slug);
        if (!fs.existsSync(gpuDir)) {
            fs.mkdirSync(gpuDir);
        }

        const verdict = getVerdict(game.gpu_intensity, gpu.tier);
        const html = generateHTML(game, gpu, verdict);
        
        fs.writeFileSync(path.join(gpuDir, 'index.html'), html, 'utf8');
        
        // Add to new URLs list
        newUrls.push(`https://obsmaskgenerator.com/can-i-stream/${game.slug}/${gpu.slug}/`);
    });
});

console.log(`Generated ${gamesData.length * gpusData.length} pages successfully!`);

// Simple logic to append to sitemap
if (fs.existsSync(sitemapPath) && newUrls.length > 0) {
    let sitemap = fs.readFileSync(sitemapPath, 'utf8');
    let urlsXml = newUrls.map(url => `  <url>\n    <loc>${url}</loc>\n    <changefreq>monthly</changefreq>\n  </url>`).join('\n');
    
    if (sitemap.includes('</urlset>')) {
        sitemap = sitemap.replace('</urlset>', `${urlsXml}\n</urlset>`);
        fs.writeFileSync(sitemapPath, sitemap, 'utf8');
        console.log(`Added ${newUrls.length} URLs to sitemap.xml`);
    }
}

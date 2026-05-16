
# GPU page generator for Subnautica 2 can-i-stream pages
# Run: powershell -ExecutionPolicy Bypass -File generate_subnautica2_pages.ps1

$basePath = "d:\xyz\obs_tool\can-i-stream\subnautica-2"

$gpus = @(
    @{ id="rtx-4090";   name="NVIDIA GeForce RTX 4090";   encoder="AV1 / NVENC (Ada)"; vram="24GB"; tier="S"; verdict="Perfect Performance"; color="#00f593"; emoji="✅"; res="1440p or 1080p"; fps="60"; bitrate="9000"; preset="P5"; note="Your RTX 4090 will handle Subnautica 2 with no compromises. Stream at 1440p if your upload allows, or use 1080p AV1 on YouTube for stunning quality. DLSS is optional at this tier." },
    @{ id="rtx-4080";   name="NVIDIA GeForce RTX 4080";   encoder="AV1 / NVENC (Ada)"; vram="16GB"; tier="S"; verdict="Perfect Performance"; color="#00f593"; emoji="✅"; res="1080p"; fps="60"; bitrate="8000"; preset="P5"; note="The RTX 4080 handles Subnautica 2 effortlessly. Use AV1 encoding on YouTube for outstanding stream quality. Enable DLSS Quality for extra headroom in dense biome areas." },
    @{ id="rtx-4070";   name="NVIDIA GeForce RTX 4070";   encoder="AV1 / NVENC (Ada)"; vram="12GB"; tier="A"; verdict="Great Performance"; color="#9146ff"; emoji="✅"; res="1080p"; fps="60"; bitrate="6000"; preset="P5"; note="The RTX 4070 is a great streaming GPU for Subnautica 2. Enable DLSS Quality in-game to ensure smooth encoding. You should have no dropped frames on a clean system." },
    @{ id="rtx-4070-ti"; name="NVIDIA GeForce RTX 4070 Ti"; encoder="AV1 / NVENC (Ada)"; vram="12GB"; tier="S"; verdict="Perfect Performance"; color="#00f593"; emoji="✅"; res="1080p"; fps="60"; bitrate="8000"; preset="P5"; note="The RTX 4070 Ti handles Subnautica 2 with headroom to spare. AV1 encoding gives you premium stream quality. Lower Global Illumination to Medium for extra stability." },
    @{ id="rtx-4060-ti"; name="NVIDIA GeForce RTX 4060 Ti"; encoder="AV1 / NVENC (Ada)"; vram="8GB"; tier="A"; verdict="Great Performance"; color="#9146ff"; emoji="✅"; res="1080p"; fps="60"; bitrate="6000"; preset="P5"; note="The RTX 4060 Ti handles Subnautica 2 well. Enable DLSS Quality to maintain 60fps in demanding scenes. 8GB VRAM is sufficient but set Texture Quality to Medium to avoid VRAM overflow." },
    @{ id="rtx-4060";   name="NVIDIA GeForce RTX 4060";   encoder="AV1 / NVENC (Ada)"; vram="8GB"; tier="A"; verdict="Good Performance"; color="#9146ff"; emoji="✅"; res="1080p"; fps="60"; bitrate="6000"; preset="P5"; note="The RTX 4060 can stream Subnautica 2 at 1080p 60fps. Enable DLSS Quality mode in-game and lower Global Illumination to Medium. Set Texture Quality to Medium to stay within 8GB VRAM limits." },
    @{ id="rtx-3080";   name="NVIDIA GeForce RTX 3080";   encoder="NVENC (Ampere)"; vram="10GB"; tier="A"; verdict="Great Performance"; color="#9146ff"; emoji="✅"; res="1080p"; fps="60"; bitrate="8000"; preset="P5"; note="The RTX 3080 is excellent for streaming Subnautica 2. It does not have AV1 but NVENC H.264 at this tier is still very high quality. Enable DLSS Quality in-game. Watch your 10GB VRAM on High texture settings." },
    @{ id="rtx-3070";   name="NVIDIA GeForce RTX 3070";   encoder="NVENC (Ampere)"; vram="8GB"; tier="A"; verdict="Good Performance"; color="#9146ff"; emoji="✅"; res="1080p"; fps="60"; bitrate="6000"; preset="P5"; note="The RTX 3070 handles Subnautica 2 at 1080p streaming well. Enable DLSS Quality in-game, lower Global Illumination to Medium, and set Texture Quality to Medium to stay within 8GB VRAM." },
    @{ id="rtx-3060";   name="NVIDIA GeForce RTX 3060";   encoder="NVENC (Ampere)"; vram="12GB"; tier="B"; verdict="Good Performance"; color="#9146ff"; emoji="✅"; res="1080p"; fps="60"; bitrate="6000"; preset="P5"; note="The RTX 3060's 12GB VRAM is a hidden advantage for Subnautica 2. Enable DLSS Quality, set Global Illumination to Medium, and enjoy 1080p streaming. The Ampere NVENC encoder is still excellent quality." },
    @{ id="rtx-3050";   name="NVIDIA GeForce RTX 3050";   encoder="NVENC (Ampere)"; vram="8GB"; tier="B"; verdict="Optimized Settings Needed"; color="#ffb800"; emoji="⚠️"; res="1080p"; fps="60"; bitrate="5000"; preset="P4"; note="The RTX 3050 can stream Subnautica 2 with careful optimization. Enable DLSS Quality, set Global Illumination and Shadows to Low, disable Frame Generation, and use FSR Quality mode. Monitor GPU usage and drop to 720p if frames become unstable." },
    @{ id="gtx-1660-super"; name="NVIDIA GeForce GTX 1660 Super"; encoder="NVENC (Turing)"; vram="6GB"; tier="C"; verdict="720p Recommended"; color="#ffb800"; emoji="⚠️"; res="720p"; fps="60"; bitrate="4500"; preset="P4"; note="The GTX 1660 Super will struggle at 1080p with Subnautica 2's UE5 demands. Stream at 720p 60fps with in-game settings on Medium, FSR Quality enabled, and all UE5 features (Lumen, Nanite effects) at their minimum. 6GB VRAM requires Medium textures." },
    @{ id="gtx-1650";   name="NVIDIA GeForce GTX 1650";   encoder="NVENC"; vram="4GB"; tier="D"; verdict="Very Challenging"; color="#ff5050"; emoji="⚠️"; res="720p"; fps="30"; bitrate="3500"; preset="Performance"; note="The GTX 1650 will have a very hard time with Subnautica 2. Set everything to Low, enable FSR Performance mode, cap FPS at 60 in-game, and stream at 720p 30fps. 4GB VRAM is a significant bottleneck for a UE5 title. Consider upgrading before streaming this game." },
    @{ id="rx-7900-xtx"; name="AMD Radeon RX 7900 XTX";  encoder="AV1 / AMF"; vram="24GB"; tier="S"; verdict="Perfect Performance"; color="#00f593"; emoji="✅"; res="1440p or 1080p"; fps="60"; bitrate="9000"; preset="Quality"; note="The RX 7900 XTX is an elite streaming GPU for Subnautica 2. Use AMF AV1 encoding for YouTube. FSR can be disabled at this tier. Stream at 1440p if your upload bandwidth allows." },
    @{ id="rx-7800-xt"; name="AMD Radeon RX 7800 XT";    encoder="AV1 / AMF"; vram="16GB"; tier="A"; verdict="Great Performance"; color="#9146ff"; emoji="&#x2705;"; res="1080p"; fps="60"; bitrate="6000"; preset="Quality"; note="The RX 7800 XT handles Subnautica 2 excellently with its 16GB VRAM - no VRAM overflow issues at any texture setting. Use AMF H.264 or AV1 (YouTube). Enable FSR Quality for extra headroom." },
    @{ id="rx-7600";    name="AMD Radeon RX 7600";        encoder="AV1 / AMF"; vram="8GB"; tier="B"; verdict="Good Performance"; color="#9146ff"; emoji="✅"; res="1080p"; fps="60"; bitrate="6000"; preset="Quality"; note="The RX 7600 can stream Subnautica 2 at 1080p with FSR Quality enabled and Global Illumination set to Medium. Its 8GB VRAM is adequate with Medium texture settings. Use AMF H.264 for Twitch streaming." },
    @{ id="rx-580";     name="AMD Radeon RX 580";         encoder="AMF (Older)"; vram="8GB"; tier="D"; verdict="Very Challenging"; color="#ff5050"; emoji="⚠️"; res="720p"; fps="30"; bitrate="3000"; preset="Performance"; note="The RX 580 was not designed for Unreal Engine 5 titles. Set all in-game graphics to Low, enable FSR Performance mode, and stream at 720p 30fps. Older AMF encoding quality is limited. Expect performance issues in complex biome areas." }
)

function Get-PageContent($gpu) {
    $resDisplay = if ($gpu.res -eq "720p") { "1280x720" } elseif ($gpu.res -eq "1440p or 1080p") { "2560x1440" } else { "1920x1080" }
    $tierColor = switch ($gpu.tier) {
        "S" { "#00f593" }
        "A" { "#9146ff" }
        "B" { "#ffb800" }
        default { "#ff5050" }
    }
    $verdictClass = if ($gpu.color -eq "#00f593") { "verdict-yes" } elseif ($gpu.color -eq "#9146ff") { "verdict-yes" } elseif ($gpu.color -eq "#ffb800") { "verdict-ok" } else { "verdict-no" }
    $boxBg = if ($gpu.color -eq "#00f593") { "rgba(0,245,147,0.1)" } elseif ($gpu.color -eq "#9146ff") { "rgba(145,70,255,0.1)" } elseif ($gpu.color -eq "#ffb800") { "rgba(255,184,0,0.1)" } else { "rgba(255,80,80,0.1)" }

    return @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Can I Stream Subnautica 2 on $($gpu.name)? (2026)</title>
    <meta name="description" content="Can your $($gpu.name) stream Subnautica 2? Get recommended OBS settings, bitrate, and resolution for this Unreal Engine 5 game. Instant answer with GPU benchmark data.">
    <link rel="canonical" href="https://obsmaskgenerator.com/can-i-stream/subnautica-2/$($gpu.id)/">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-C84663S6K3"></script>
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-C84663S6K3');</script>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4560264570048889" crossorigin="anonymous"></script>
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Can I stream Subnautica 2 with $($gpu.name)?","acceptedAnswer":{"@type":"Answer","text":"$($gpu.emoji) $($gpu.verdict). Recommended: $($gpu.res) at $($gpu.fps)fps, $($gpu.bitrate) Kbps, using $($gpu.encoder) encoder. $($gpu.note)"}},{"@type":"Question","name":"What OBS settings for Subnautica 2 with $($gpu.name)?","acceptedAnswer":{"@type":"Answer","text":"Use $($gpu.encoder) encoder, $($gpu.bitrate) Kbps CBR, $($resDisplay) output resolution, $($gpu.fps) FPS, $($gpu.preset) preset, 2-second keyframe interval. Enable DLSS or FSR Quality in Subnautica 2 to reduce GPU load."}}]}</script>
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://obsmaskgenerator.com/"},{"@type":"ListItem","position":2,"name":"Can I Stream?","item":"https://obsmaskgenerator.com/can-i-stream/"},{"@type":"ListItem","position":3,"name":"Subnautica 2","item":"https://obsmaskgenerator.com/can-i-stream/subnautica-2/"},{"@type":"ListItem","position":4,"name":"$($gpu.name)","item":"https://obsmaskgenerator.com/can-i-stream/subnautica-2/$($gpu.id)/"}]}</script>
    <link rel="stylesheet" href="../../../style.css">
    <link rel="stylesheet" href="../../../assets/css/common.css">
    <style>
        .answer-box { padding: 2rem; border-radius: 12px; margin: 2rem 0; background: $boxBg; border: 1px solid $($gpu.color); }
        .answer-box h2 { margin-top: 0; color: $($gpu.color); }
        .settings-table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; background: var(--bg-secondary); border-radius: 8px; overflow: hidden; }
        .settings-table th, .settings-table td { padding: 0.9rem 1rem; text-align: left; border-bottom: 1px solid var(--border-color); }
        .settings-table th { background: var(--bg-tertiary); font-weight: 600; }
        .settings-table tr:last-child td { border-bottom: none; }
        .tip-box { background: rgba(145,70,255,0.08); border-left: 4px solid #9146ff; padding: 1rem 1.5rem; border-radius: 0 8px 8px 0; margin: 1.5rem 0; }
        .related-links { display: flex; flex-wrap: wrap; gap: 0.75rem; margin: 1.5rem 0; }
        .related-link { background: var(--bg-tertiary); padding: 0.5rem 1rem; border-radius: 6px; color: var(--accent-primary); text-decoration: none; font-size: 0.88rem; }
        .related-link:hover { background: rgba(145,70,255,0.15); }
        .breadcrumbs { margin-bottom: 1.5rem; font-size: 0.9em; color: var(--text-secondary); }
        .breadcrumbs a { color: var(--text-secondary); text-decoration: none; }
        .breadcrumbs a:hover { color: var(--accent-primary); }
    </style>
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
            <div class="breadcrumbs">
                <a href="/can-i-stream/">Can I Stream?</a> › <a href="/can-i-stream/subnautica-2/">Subnautica 2</a> › $($gpu.name)
            </div>

            <h1>Can I Stream Subnautica 2 on $($gpu.name)?</h1>

            <div class="answer-box">
                <h2>$($gpu.emoji) $($gpu.verdict)</h2>
                <p>$($gpu.note)</p>
            </div>

            <h2>Recommended OBS Settings</h2>
            <table class="settings-table">
                <tr><th>Setting</th><th>Recommended Value</th></tr>
                <tr><td>Encoder</td><td>$($gpu.encoder)</td></tr>
                <tr><td>Resolution</td><td>$($resDisplay)</td></tr>
                <tr><td>Frame Rate</td><td>$($gpu.fps) FPS</td></tr>
                <tr><td>Bitrate (Twitch)</td><td>$($gpu.bitrate) Kbps</td></tr>
                <tr><td>Rate Control</td><td>CBR</td></tr>
                <tr><td>Keyframe Interval</td><td>2 seconds</td></tr>
                <tr><td>Preset</td><td>$($gpu.preset)</td></tr>
                <tr><td>VRAM</td><td>$($gpu.vram)</td></tr>
            </table>

            <div class="tip-box">
                <strong>💡 Key Tip for Subnautica 2:</strong> Enable <strong>DLSS Quality</strong> (NVIDIA) or <strong>FSR Quality</strong> (AMD) in-game. Subnautica 2 uses Unreal Engine 5 with Lumen lighting — this setting gives OBS the GPU headroom it needs to encode without stuttering. Also lower <strong>Global Illumination</strong> to Medium in the game's graphics settings.
            </div>

            <h2>In-Game Settings Checklist</h2>
            <table class="settings-table">
                <tr><th>In-Game Setting</th><th>Recommended Value</th></tr>
                <tr><td>Upscaling (DLSS/FSR)</td><td>Quality mode</td></tr>
                <tr><td>Global Illumination</td><td>Medium</td></tr>
                <tr><td>Shadow Quality</td><td>Medium</td></tr>
                <tr><td>Frame Generation</td><td>Off (while streaming)</td></tr>
                <tr><td>Motion Blur</td><td>Off</td></tr>
                <tr><td>FPS Cap</td><td>120 or 144</td></tr>
            </table>

            <h2>Related Pages</h2>
            <div class="related-links">
                <a href="/can-i-stream/subnautica-2/" class="related-link">← All Subnautica 2 GPUs</a>
                <a href="/settings-generator/subnautica-2/" class="related-link">📖 Full Subnautica 2 Guide</a>
                <a href="/settings-generator/" class="related-link">⚙️ Settings Generator</a>
                <a href="/guides/encoding-overloaded/" class="related-link">🔧 Fix Encoding Overloaded</a>
                <a href="/can-i-stream/" class="related-link">🎮 Can I Stream Other Games?</a>
            </div>

            <div style="margin-top:2rem; border-top: 1px solid var(--border-color); padding-top: 1.5rem; font-size: 0.8em; color: #848494; text-align: center;">
                <p><em>Methodology: Performance estimates are based on GPU tier scores, VRAM capacity, encoder generation, and Subnautica 2 UE5 benchmark data. Real-world results may vary based on driver version, system thermals, and background processes.</em></p>
            </div>
        </main>

        <footer class="footer">
            <p>Free OBS Tools | <a href="/privacy-policy.html">Privacy</a> | <a href="/settings-generator/">Settings Generator</a></p>
        </footer>
    </div>
</body>
</html>
"@
}

foreach ($gpu in $gpus) {
    $dir = Join-Path $basePath $gpu.id
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    $content = Get-PageContent $gpu
    $filePath = Join-Path $dir "index.html"
    [System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
    Write-Host "Created: $filePath"
}

Write-Host "`nDone! Generated $($gpus.Count) GPU pages for Subnautica 2."

const builds = {
    "entry": {
        "title": "Entry-Level Streaming Build (1080p60)",
        "desc": "Perfect for beginners. Can stream lightweight games like Valorant, League of Legends, and Minecraft without dropping frames.",
        "parts": [
            {
                "type": "CPU",
                "name": "Intel Core i3-13100F",
                "reason": "Cheap and provides enough single-core performance for esports titles.",
                "link": "#"
            },
            {
                "type": "GPU",
                "name": "NVIDIA GeForce RTX 3060 12GB",
                "reason": "The 12GB of VRAM is crucial for gaming while streaming, and the NVENC encoder handles OBS perfectly.",
                "link": "#"
            },
            {
                "type": "RAM",
                "name": "16GB (2x8GB) DDR4-3200",
                "reason": "16GB is the bare minimum for streaming in 2026.",
                "link": "#"
            }
        ]
    },
    "mid": {
        "title": "Mid-Range Streaming Build (1440p / High FPS)",
        "desc": "The sweet spot. Streams modern AAA games like Cyberpunk and Helldivers 2 flawlessly while supporting AV1 encoding.",
        "parts": [
            {
                "type": "CPU",
                "name": "AMD Ryzen 5 7600X",
                "reason": "Excellent multi-core performance for multitasking (OBS, Discord, Game, Chrome).",
                "link": "#"
            },
            {
                "type": "GPU",
                "name": "NVIDIA GeForce RTX 4070 Super",
                "reason": "Supports AV1 encoding for YouTube streaming. Incredibly efficient.",
                "link": "#"
            },
            {
                "type": "RAM",
                "name": "32GB (2x16GB) DDR5-6000",
                "reason": "32GB gives you plenty of headroom for heavy games and browser tabs.",
                "link": "#"
            }
        ]
    },
    "high": {
        "title": "Enthusiast Dual-PC Replacement (4K / Maximum Quality)",
        "desc": "So powerful you don't need a dual-PC setup anymore. Streams any game at max settings without breaking a sweat.",
        "parts": [
            {
                "type": "CPU",
                "name": "AMD Ryzen 7 7800X3D",
                "reason": "The absolute best gaming CPU on the market, preventing CPU bottlenecks.",
                "link": "#"
            },
            {
                "type": "GPU",
                "name": "NVIDIA GeForce RTX 4090",
                "reason": "Dual NVENC encoders mean you can stream to Twitch and record in 4K simultaneously without performance loss.",
                "link": "#"
            },
            {
                "type": "RAM",
                "name": "64GB (2x32GB) DDR5-6000",
                "reason": "Never worry about closing background apps again.",
                "link": "#"
            }
        ]
    }
};

document.querySelectorAll('.budget-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Remove active class
        document.querySelectorAll('.budget-btn').forEach(b => b.classList.remove('active'));
        // Add active class to clicked
        e.target.classList.add('active');
        
        const budget = e.target.dataset.budget;
        renderBuild(budget);
    });
});

function renderBuild(budgetKey) {
    const build = builds[budgetKey];
    const display = document.getElementById('build-display');
    
    let html = `
        <h2 style="color: var(--accent-primary); margin-top:0;">${build.title}</h2>
        <p style="color: var(--text-secondary); margin-bottom: 2rem; font-size: 1.1rem;">${build.desc}</p>
    `;
    
    build.parts.forEach(part => {
        html += `
            <div class="part-card">
                <div class="part-info">
                    <span style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted);">${part.type}</span>
                    <h3>${part.name}</h3>
                    <p>${part.reason}</p>
                </div>
                <a href="${part.link}" class="amazon-btn" target="_blank">Check Amazon Price</a>
            </div>
        `;
    });
    
    display.innerHTML = html;
    display.classList.remove('active');
    // Trigger reflow to restart animation
    void display.offsetWidth;
    display.classList.add('active');
}

// Click the first button by default
document.querySelector('.budget-btn[data-budget="mid"]').click();

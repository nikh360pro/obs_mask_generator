document.addEventListener("DOMContentLoaded", () => {
    const generateBtn = document.getElementById("generateBtn");
    const gameInput = document.getElementById("gameInput");
    const vibeSelect = document.getElementById("vibeSelect");
    const platformSelect = document.getElementById("platformSelect");
    const resultsArea = document.getElementById("resultsArea");
    const titlesList = document.getElementById("titlesList");
    const viewHistoryBtn = document.getElementById("viewHistoryBtn");

    // The live Cloudflare Worker proxy URL that hides the API key
    const WORKER_URL = "https://groq-proxy.nikh360pro.workers.dev";

    // Load history from local storage
    const loadHistory = () => {
        const history = JSON.parse(localStorage.getItem("titleHistory") || "[]");
        return history;
    };

    const saveToHistory = (titles) => {
        const history = loadHistory();
        const newHistory = [...titles, ...history].slice(0, 50); // Keep last 50
        localStorage.setItem("titleHistory", JSON.stringify(newHistory));
    };

    const renderTitles = (titles) => {
        titlesList.innerHTML = "";
        titles.forEach(title => {
            const cleanTitle = title.replace(/^[\d\.\-\*]\s*/, "").trim();
            if (!cleanTitle) return;
            const card = document.createElement("div");
            card.className = "title-card";
            card.innerHTML = `
                <span style="font-size: 1.1rem; font-weight: 600;">${cleanTitle}</span>
                <button onclick="navigator.clipboard.writeText(\`${cleanTitle}\`); this.textContent='Copied!'; setTimeout(() => this.textContent='Copy', 2000);">Copy</button>
            `;
            titlesList.appendChild(card);
        });
        resultsArea.style.display = "block";
    };

    viewHistoryBtn.addEventListener("click", () => {
        const history = loadHistory();
        if (history.length === 0) {
            alert("Your history is empty!");
            return;
        }
        renderTitles(history);
        document.querySelector("#resultsArea h3").textContent = "Your Title History:";
    });

    generateBtn.addEventListener("click", async () => {
        const game = gameInput.value.trim();
        const vibe = vibeSelect.value;
        const platform = platformSelect.value;

        if (!game) {
            alert("Please enter a game name!");
            return;
        }

        generateBtn.disabled = true;
        generateBtn.textContent = "Generating... ⏳";
        document.querySelector("#resultsArea h3").textContent = "Your Generated Titles:";
        titlesList.innerHTML = "";
        resultsArea.style.display = "block";

        let platformRules = "";
        if (platform === "twitch") platformRules = "Make them community-focused, maybe include brackets like [DROPS] or [ENG] if appropriate. Max 60 chars.";
        if (platform === "youtube") platformRules = "Make them highly searchable for algorithms, capitalize important keywords, high click-through rate clickbait. Max 70 chars.";
        if (platform === "kick") platformRules = "Make them edgy, unfiltered, and highly clickable for a mature audience.";

        const prompt = `You are an expert ${platform} streamer. Generate 5 catchy, highly clickable stream titles for playing ${game} with a ${vibe} vibe. ${platformRules} Do not include quotes, numbers, or bullet points in the output. Just output 5 lines of text for the titles. Then, on a 6th line, output 5 highly relevant hashtags separated by spaces (e.g. #VTuber #Ranked). Use 1 or 2 relevant emojis per title.`;

        try {
            const response = await fetch(WORKER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.8
                })
            });

            if (!response.ok) {
                throw new Error("Failed to connect to AI server. Make sure your Worker is online!");
            }

            const data = await response.json();
            const lines = data.choices[0].message.content.split("\n").filter(t => t.trim().length > 0);
            
            // The last line should be the tags, the rest are titles
            let titles = lines;
            let tags = "";
            if (lines.length >= 6 && lines[lines.length - 1].includes("#")) {
                tags = lines.pop(); // Remove the tags line and store it
            } else if (lines[lines.length - 1].includes("#")) {
                tags = lines.pop();
            }

            saveToHistory(titles);
            renderTitles(titles);

            // Append Tags to the UI
            if (tags) {
                const tagCard = document.createElement("div");
                tagCard.className = "title-card";
                tagCard.style.marginTop = "20px";
                tagCard.style.background = "rgba(145, 70, 255, 0.1)";
                tagCard.style.borderColor = "#9146ff";
                tagCard.innerHTML = `
                    <div style="display: flex; flex-direction: column;">
                        <span style="font-size: 0.8rem; color: #9146ff; font-weight: 700; margin-bottom: 4px; text-transform: uppercase;">Generated Tags</span>
                        <span style="font-size: 1.1rem; font-weight: 600; color: #fff;">${tags}</span>
                    </div>
                    <button style="background: #9146ff;" onclick="navigator.clipboard.writeText(\`${tags}\`); this.textContent=''Copied!''; setTimeout(() => this.textContent=''Copy'', 2000);">Copy</button>
                `;
                titlesList.appendChild(tagCard);
            }

        } catch (error) {
            titlesList.innerHTML = `<p style="color: #ff5050;">Error: ${error.message}</p>`;
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = "Generate Titles 🚀";
        }
    });
});
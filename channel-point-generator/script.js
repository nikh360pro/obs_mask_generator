/**
 * Channel Point Ideas Generator - Script
 * Calls Cloudflare Worker to get AI-generated reward ideas
 * Rate limited: 5 generations per day
 */

const WORKER_URL = 'https://channel-point-api.nikh360pro.workers.dev';
const MAX_REQUESTS_PER_DAY = 5;
const MAX_REWARDS = 5;

document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    generateBtn.addEventListener('click', generateRewards);
    updateRemainingCount();
});

// Check how many requests remaining today
function getRemainingRequests() {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('channelpoint_usage');

    if (stored) {
        const data = JSON.parse(stored);
        if (data.date === today) {
            return MAX_REQUESTS_PER_DAY - data.count;
        }
    }
    return MAX_REQUESTS_PER_DAY;
}

// Increment usage count
function incrementUsage() {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('channelpoint_usage');

    let data = { date: today, count: 0 };
    if (stored) {
        data = JSON.parse(stored);
        if (data.date !== today) {
            data = { date: today, count: 0 };
        }
    }
    data.count++;
    localStorage.setItem('channelpoint_usage', JSON.stringify(data));
}

// Update UI with remaining count
function updateRemainingCount() {
    const remaining = getRemainingRequests();
    const btnText = document.getElementById('btn-text');
    const generateBtn = document.getElementById('generate-btn');

    if (remaining <= 0) {
        btnText.textContent = 'Daily Limit Reached';
        generateBtn.disabled = true;
    } else {
        btnText.textContent = `Generate Ideas (${remaining} left today)`;
        generateBtn.disabled = false;
    }
}

async function generateRewards() {
    const remaining = getRemainingRequests();
    if (remaining <= 0) {
        alert('You have reached your daily limit of 5 generations. Come back tomorrow!');
        return;
    }

    const generateBtn = document.getElementById('generate-btn');
    const btnText = document.getElementById('btn-text');
    const rewardsContainer = document.getElementById('rewards-container');

    const game = document.getElementById('game').value;
    const vibe = document.getElementById('vibe').value;
    const rewardType = document.getElementById('reward-type').value;
    const keywords = document.getElementById('keywords').value.trim();

    // Show loading state
    generateBtn.disabled = true;
    generateBtn.classList.add('loading');
    btnText.textContent = 'Generating...';
    rewardsContainer.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>AI is creating unique reward ideas for you...</p>
        </div>
    `;

    try {
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ game, vibe, rewardType, keywords })
        });

        if (!response.ok) {
            throw new Error('Failed to generate rewards');
        }

        const data = await response.json();

        // Parse rewards from AI response
        let rewards = [];
        if (data.choices && data.choices[0] && data.choices[0].message) {
            const content = data.choices[0].message.content;
            rewards = parseRewards(content);
        }

        if (rewards.length === 0) {
            throw new Error('No rewards generated');
        }

        // Increment usage after successful generation
        incrementUsage();

        // Display rewards
        rewardsContainer.innerHTML = rewards.map(reward => `
            <div class="reward-card" onclick="copyReward(this, '${escapeHtml(reward.name)}', '${escapeHtml(reward.description)}', '${reward.points}')">
                <div class="reward-header">
                    <span class="reward-name">${escapeHtml(reward.name)}</span>
                    <span class="reward-points">${reward.points} pts</span>
                </div>
                <p class="reward-description">${escapeHtml(reward.description)}</p>
                <span class="copy-hint">Click to copy</span>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error:', error);
        rewardsContainer.innerHTML = `
            <div class="error-state">
                <p>⚠️ Could not generate rewards. Please try again.</p>
                <p style="font-size: 0.8rem; margin-top: 8px;">Error: ${error.message}</p>
            </div>
        `;
    } finally {
        generateBtn.classList.remove('loading');
        updateRemainingCount();
    }
}

// Parse AI response into structured rewards
function parseRewards(content) {
    const rewards = [];
    const lines = content.split('\n').filter(line => line.trim());

    for (const line of lines) {
        // Try to parse "NAME | DESCRIPTION | POINTS" format
        if (line.includes('|')) {
            const parts = line.split('|').map(p => p.trim());
            if (parts.length >= 3) {
                const name = parts[0].replace(/^[\d\.\-\*\•]+\s*/, '').trim();
                const description = parts[1].trim();
                const pointsMatch = parts[2].match(/[\d,]+/);
                const points = pointsMatch ? pointsMatch[0].replace(',', '') : '1000';

                if (name && description) {
                    rewards.push({ name, description, points });
                }
            }
        }
        // Fallback: try to extract from other formats
        else if (line.match(/^\d+[\.\)]/)) {
            const cleaned = line.replace(/^\d+[\.\)]\s*/, '').trim();
            const colonIndex = cleaned.indexOf(':');
            if (colonIndex > 0) {
                const name = cleaned.substring(0, colonIndex).trim();
                const rest = cleaned.substring(colonIndex + 1).trim();
                const pointsMatch = rest.match(/\(?([\d,]+)\s*(?:pts?|points?)?\)?$/i);
                const points = pointsMatch ? pointsMatch[1].replace(',', '') : '1000';
                const description = rest.replace(/\(?([\d,]+)\s*(?:pts?|points?)?\)?$/i, '').trim();

                if (name && description) {
                    rewards.push({ name, description, points });
                }
            }
        }

        if (rewards.length >= MAX_REWARDS) break;
    }

    return rewards;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// Copy reward to clipboard
function copyReward(element, name, description, points) {
    const text = `${name} - ${description} (${points} points)`;
    navigator.clipboard.writeText(text).then(() => {
        element.classList.add('copied');

        setTimeout(() => {
            element.classList.remove('copied');
        }, 2000);
    });
}

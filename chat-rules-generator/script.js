/**
 * AI Chat Rules Generator
 * Uses Cloudflare Worker for AI generation
 */

const API_URL = 'https://chat-rules-generator.nikh360pro.workers.dev';

const elements = {
    channelVibe: document.getElementById('channel-vibe'),
    strictness: document.getElementById('strictness'),
    specificBans: document.getElementById('specific-bans'),
    ruleCount: document.getElementById('rule-count'),
    generateBtn: document.getElementById('generate-btn'),
    loadingState: document.getElementById('loading-state'),
    rulesContainer: document.getElementById('rules-container'),
    actionButtons: document.getElementById('action-buttons'),
    copyBtn: document.getElementById('copy-btn'),
    regenerateBtn: document.getElementById('regenerate-btn')
};

let generatedRules = [];

async function generateRules() {
    const vibe = elements.channelVibe.value;
    const strictness = elements.strictness.value;
    const specificBans = elements.specificBans.value;
    const ruleCount = elements.ruleCount.value;

    // Show loading state
    elements.generateBtn.disabled = true;
    elements.loadingState.style.display = 'flex';
    elements.rulesContainer.innerHTML = '';
    elements.actionButtons.style.display = 'none';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vibe, strictness, specificBans, ruleCount })
        });

        if (!response.ok) {
            throw new Error('Failed to generate rules');
        }

        const data = await response.json();
        generatedRules = parseRules(data.rules);
        displayRules(generatedRules);
    } catch (error) {
        console.error('Error:', error);
        elements.rulesContainer.innerHTML = `
            <div class="placeholder-message">
                <p>❌ Error generating rules. Please try again.</p>
            </div>
        `;
    } finally {
        elements.generateBtn.disabled = false;
        elements.loadingState.style.display = 'none';
    }
}

function parseRules(rulesText) {
    // Split by newlines and filter out empty lines
    const lines = rulesText.split('\n').filter(line => line.trim());
    const rules = [];

    for (const line of lines) {
        // Remove numbering like "1.", "1)", "1:" at the start
        const cleaned = line.replace(/^\d+[\.\)\:]\s*/, '').trim();
        if (cleaned && cleaned.length > 5) {
            rules.push(cleaned);
        }
    }

    return rules;
}

function displayRules(rules) {
    if (rules.length === 0) {
        elements.rulesContainer.innerHTML = `
            <div class="placeholder-message">
                <p>No rules generated. Please try again.</p>
            </div>
        `;
        return;
    }

    const html = rules.map((rule, index) => `
        <div class="rule-item">
            <span class="rule-number">${index + 1}</span>
            <span class="rule-text">${rule}</span>
        </div>
    `).join('');

    elements.rulesContainer.innerHTML = html;
    elements.actionButtons.style.display = 'flex';
}

function copyAllRules() {
    if (generatedRules.length === 0) return;

    const text = generatedRules.map((rule, i) => `${i + 1}. ${rule}`).join('\n');

    navigator.clipboard.writeText(text).then(() => {
        elements.copyBtn.classList.add('copied');
        elements.copyBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
            Copied!
        `;

        setTimeout(() => {
            elements.copyBtn.classList.remove('copied');
            elements.copyBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy All Rules
            `;
        }, 2000);
    });
}

// Event listeners
elements.generateBtn.addEventListener('click', generateRules);
elements.copyBtn.addEventListener('click', copyAllRules);
elements.regenerateBtn.addEventListener('click', generateRules);

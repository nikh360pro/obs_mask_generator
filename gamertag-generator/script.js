/**
 * AI Gamertag Generator - Script
 * Calls Cloudflare Worker to get AI-generated names
 */

// IMPORTANT: Replace this with your Cloudflare Worker URL after you create it
const WORKER_URL = 'https://gamertag-api.nikh360pro.workers.dev';

document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const btnText = document.getElementById('btn-text');
    const namesContainer = document.getElementById('names-container');

    generateBtn.addEventListener('click', generateNames);
});

async function generateNames() {
    const generateBtn = document.getElementById('generate-btn');
    const btnText = document.getElementById('btn-text');
    const namesContainer = document.getElementById('names-container');

    const style = document.getElementById('style').value;
    const keywords = document.getElementById('keywords').value.trim();
    const platform = document.getElementById('platform').value;

    // Show loading state
    generateBtn.disabled = true;
    generateBtn.classList.add('loading');
    btnText.textContent = 'Generating...';
    namesContainer.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>AI is creating unique names for you...</p>
        </div>
    `;

    try {
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ style, keywords, platform })
        });

        if (!response.ok) {
            throw new Error('Failed to generate names');
        }

        const data = await response.json();

        // Parse names from AI response
        let names = [];
        if (data.choices && data.choices[0] && data.choices[0].message) {
            const content = data.choices[0].message.content;
            names = content.split('\n')
                .map(name => name.replace(/^[\d\.\-\*\•]+\s*/, '').trim())
                .filter(name => name.length > 0 && name.length < 30);
        }

        if (names.length === 0) {
            throw new Error('No names generated');
        }

        // Display names
        namesContainer.innerHTML = names.map(name => `
            <div class="name-card" onclick="copyName(this, '${name.replace(/'/g, "\\'")}')">
                <span class="name">${name}</span>
                <svg class="copy-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error:', error);
        namesContainer.innerHTML = `
            <div class="error-state">
                <p>⚠️ Could not generate names. Please try again.</p>
                <p style="font-size: 0.8rem; margin-top: 8px;">Error: ${error.message}</p>
            </div>
        `;
    } finally {
        generateBtn.disabled = false;
        generateBtn.classList.remove('loading');
        btnText.textContent = 'Generate Names';
    }
}

function copyName(element, name) {
    navigator.clipboard.writeText(name).then(() => {
        // Show copied state
        element.classList.add('copied');
        const icon = element.querySelector('.copy-icon');
        icon.innerHTML = '<path d="M20 6L9 17l-5-5"/>';

        setTimeout(() => {
            element.classList.remove('copied');
            icon.innerHTML = '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>';
        }, 2000);
    });
}

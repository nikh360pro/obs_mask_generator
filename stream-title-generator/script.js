/**
 * AI Stream Title Generator
 * Main Application Script
 */

// ============================
// Configuration
// ============================

// IMPORTANT: Replace with your deployed Cloudflare Worker URL
const API_URL = 'https://stream-title-generator.nikh360pro.workers.dev';

// ============================
// DOM Elements
// ============================

const elements = {
    game: document.getElementById('game'),
    customGameGroup: document.getElementById('custom-game-group'),
    customGame: document.getElementById('custom-game'),
    vibe: document.getElementById('vibe'),
    keywords: document.getElementById('keywords'),
    generateBtn: document.getElementById('generate-btn'),
    btnText: document.getElementById('btn-text'),
    titlesContainer: document.getElementById('titles-container')
};

// ============================
// API Functions
// ============================

/**
 * Generate titles via Cloudflare Worker API
 */
async function generateTitles() {
    const game = elements.game.value === 'custom'
        ? elements.customGame.value
        : elements.game.options[elements.game.selectedIndex].text.replace(/^.{2}\s/, ''); // Remove emoji

    const vibe = elements.vibe.value;
    const keywords = elements.keywords.value.trim();

    if (elements.game.value === 'custom' && !game.trim()) {
        showError('Please enter a game name');
        return;
    }

    // Show loading state
    setLoading(true);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ game, vibe, keywords })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // Parse the AI response
        const content = data.choices?.[0]?.message?.content || '';
        const titles = parseTitles(content);

        if (titles.length === 0) {
            throw new Error('No titles generated. Please try again.');
        }

        displayTitles(titles);

    } catch (error) {
        console.error('Error generating titles:', error);
        showError(error.message || 'Failed to generate titles. Please try again.');
    } finally {
        setLoading(false);
    }
}

/**
 * Parse AI response into array of titles
 */
function parseTitles(content) {
    // Split by newlines and filter out empty lines
    const lines = content.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        // Remove numbering like "1." or "1)" or "- "
        .map(line => line.replace(/^[\d]+[.\)]\s*/, '').replace(/^[-•]\s*/, ''))
        .filter(line => line.length > 0 && line.length < 150); // Filter out too long lines

    return lines.slice(0, 5); // Return max 5 titles
}

// ============================
// UI Functions
// ============================

/**
 * Display generated titles
 */
function displayTitles(titles) {
    elements.titlesContainer.innerHTML = titles.map(title => `
        <div class="title-card" data-title="${escapeHtml(title)}">
            <span class="title-text">${escapeHtml(title)}</span>
            <svg class="copy-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
        </div>
    `).join('');

    // Add click handlers for copying
    document.querySelectorAll('.title-card').forEach(card => {
        card.addEventListener('click', () => copyTitle(card));
    });
}

/**
 * Copy title to clipboard
 */
async function copyTitle(card) {
    const title = card.dataset.title;

    try {
        await navigator.clipboard.writeText(title);

        // Show copied state
        card.classList.add('copied');
        card.querySelector('.copy-icon').innerHTML = `
            <polyline points="20 6 9 17 4 12" />
        `;

        // Reset after 2 seconds
        setTimeout(() => {
            card.classList.remove('copied');
            card.querySelector('.copy-icon').innerHTML = `
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            `;
        }, 2000);

    } catch (error) {
        console.error('Failed to copy:', error);
    }
}

/**
 * Show error message
 */
function showError(message) {
    elements.titlesContainer.innerHTML = `
        <div class="error-state">
            <p>⚠️ ${escapeHtml(message)}</p>
        </div>
    `;
}

/**
 * Set loading state
 */
function setLoading(isLoading) {
    elements.generateBtn.disabled = isLoading;

    if (isLoading) {
        elements.btnText.textContent = 'Generating...';
        elements.generateBtn.classList.add('loading');
        elements.titlesContainer.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>AI is crafting your titles...</p>
            </div>
        `;
    } else {
        elements.btnText.textContent = 'Generate Titles';
        elements.generateBtn.classList.remove('loading');
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================
// Event Listeners
// ============================

function setupEventListeners() {
    // Generate button
    elements.generateBtn.addEventListener('click', generateTitles);

    // Show/hide custom game input
    elements.game.addEventListener('change', () => {
        if (elements.game.value === 'custom') {
            elements.customGameGroup.classList.remove('hidden');
            elements.customGame.focus();
        } else {
            elements.customGameGroup.classList.add('hidden');
        }
    });

    // Allow Enter key to generate
    elements.keywords.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generateTitles();
        }
    });

    elements.customGame.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generateTitles();
        }
    });
}

// ============================
// Initialization
// ============================

function init() {
    setupEventListeners();
}

// Start the app
document.addEventListener('DOMContentLoaded', init);

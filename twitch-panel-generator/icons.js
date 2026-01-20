// Twitch Panel Generator - Icon Library
// Note: Currently using emoji icons for simplicity
// This file is reserved for future SVG icon expansion

const ICONS = {
    // Social
    discord: '💬',
    twitter: '🐦',
    youtube: '▶️',
    instagram: '📷',
    tiktok: '🎵',
    facebook: '📘',
    twitch: '📺',

    // Common Panels
    user: '👤',
    about: '👤',
    donate: '💰',
    money: '💰',
    schedule: '📅',
    calendar: '📅',
    rules: '📜',
    faq: '❓',
    specs: '🖥️',
    pc: '🖥️',

    // Gaming
    gamepad: '🎮',
    controller: '🎮',
    trophy: '🏆',
    crown: '👑',
    fire: '🔥',
    star: '⭐',

    // Stream
    mic: '🎤',
    camera: '📹',
    music: '🎶',
    headphones: '🎧',

    // Misc
    heart: '❤️',
    link: '🔗',
    mail: '✉️',
    chat: '💭',
    gift: '🎁',
    rocket: '🚀',
    bolt: '⚡',
    sparkle: '✨',
    diamond: '💎',
    gem: '💎',

    // None
    none: ''
};

// Export for use in main script
if (typeof module !== 'undefined') {
    module.exports = ICONS;
}

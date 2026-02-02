# Universal Component Injection System

## Overview

This system allows you to manage reusable components (banners, notifications, etc.) across **all pages** from a single file. No need to edit multiple HTML files!

**Key File:** [`components.js`](components.js)

---

## How It Works

1. **One central configuration** - All components defined in `components.js`
2. **Automatic injection** - Components inject into placeholder `<div>` elements
3. **Enable/disable instantly** - Set `enabled: true/false` to show/hide everywhere
4. **Update once, apply everywhere** - Change HTML/CSS in one place

---

## Quick Start

### Add a New Component

Edit [`components.js`](components.js):

```javascript
GlobalComponents.myComponent = {
    enabled: true,               // Set false to disable
    targetId: 'global-my-component', // Where to inject
    html: `<div>My Component HTML</div>`,

    // Optional: Add functions
    close: function() { /* ... */ },
    init: function() { /* ... */ }
};
```

Then add placeholder to your HTML pages:
```html
<div id="global-my-component"></div>
```

### Remove a Component (All Pages)

In [`components.js`](components.js):
```javascript
GlobalComponents.banner = {
    enabled: false,  // ← Just change this!
    // ... rest stays the same
};
```

Banner will disappear from all pages instantly!

---

## Current Components

### 1. Launch Banner

**Status:** ✅ Enabled
**Location:** `#global-banner`
**Pages:** All pages (index, faq, contact, privacy, terms, obs-background-remover, admin)

**Features:**
- Video showcase with demo.webm
- "NEW LAUNCH" animated badge
- "Try It Now" CTA button
- Close button with localStorage persistence
- Auto-hides if user dismissed it before

**To Remove:**
```javascript
// In components.js line 13:
enabled: false,  // Was: true
```

**To Customize:**
```javascript
// Change text
html: `
    <h3 class="banner-title">Your New Title!</h3>
    <p class="banner-description">Your tagline here</p>
`

// Change video
<source src="assets/your-video.webm" type="video/webm">

// Change badge text
NEW LAUNCH → BETA RELEASE
```

---

## Pages Updated

All pages now use this system:

- ✅ [`index.html`](index.html) - Main page
- ✅ [`faq.html`](faq.html) - FAQ page
- ✅ [`contact.html`](contact.html) - Contact page
- ✅ [`privacy.html`](privacy.html) - Privacy policy
- ✅ [`terms.html`](terms.html) - Terms of service
- ✅ [`obs-background-remover.html`](obs-background-remover.html) - OBS tool page
- ✅ [`admin.html`](admin.html) - Admin dashboard

Each page has:
1. Placeholder: `<div id="global-banner"></div>`
2. Script: `<script src="components.js"></script>`

---

## Common Use Cases

### Temporarily Hide Banner (Testing)

```javascript
enabled: false,
```

### Change Banner Message (Holiday/Event)

```javascript
html: `
    <h3>🎄 Holiday Sale - 50% Off Premium!</h3>
    <p>Limited time offer</p>
`
```

### Add New Notification Bar

```javascript
GlobalComponents.notification = {
    enabled: true,
    targetId: 'global-notification',
    html: `
        <div class="notification-bar">
            <p>Server maintenance tonight 10 PM - 12 AM</p>
        </div>
    `
};
```

Then add to all pages:
```html
<div id="global-notification"></div>
```

### A/B Testing Different Messages

```javascript
// Randomly show different messages
const messages = [
    "Click. Remove. Done.",
    "AI Background Removal in Seconds",
    "No Green Screen Needed"
];

html: `
    <p>${messages[Math.floor(Math.random() * messages.length)]}</p>
`
```

---

## Technical Details

### Initialization

Components auto-inject on page load:
```javascript
document.addEventListener('DOMContentLoaded', () => GlobalComponents.init());
```

### How Injection Works

1. Loops through all components in `GlobalComponents`
2. Checks if `enabled: true`
3. Finds target element by `targetId`
4. Injects HTML: `target.innerHTML = component.html`
5. Calls `component.init()` if exists

### Component Structure

```javascript
{
    enabled: boolean,      // Show/hide
    targetId: string,      // CSS ID to inject into
    html: string,          // HTML content
    init: function,        // Optional: Run after injection
    [customFunction]: fn   // Optional: Custom methods
}
```

### Debugging

Open browser console to see injection logs:
```
✅ Component "banner" injected into #global-banner
⚠️ Component "notification" target #global-notification not found
```

---

## Best Practices

1. **Test before deploying** - Enable locally first
2. **Keep components independent** - Don't rely on other components
3. **Use semantic IDs** - `global-banner`, not `div1`
4. **Comment disabled components** - Leave them in code for reuse
5. **Version control** - Git commit before major changes

---

## Troubleshooting

### Component not showing?

1. Check `enabled: true` in `components.js`
2. Verify `<div id="targetId"></div>` exists in HTML
3. Check browser console for errors
4. Clear cache (Ctrl+Shift+R)

### Banner shows on wrong pages?

Each page needs placeholder:
```html
<div id="global-banner"></div>
```

Remove from pages where you don't want it.

### Styling issues?

Component inherits styles from `style.css`:
- `.launch-banner` - Main banner styles (lines 780-1000+)
- `.banner-*` - Banner child elements

Update in `style.css`, not `components.js`.

---

## Migration Notes

### Old System (Before)
- Banner HTML hardcoded in every page
- Banner functions in inline `<script>` tags
- Changes required editing 7+ files

### New System (After)
- Banner HTML in `components.js` only
- Banner functions in `GlobalComponents.banner.*`
- Changes require editing 1 file

**Migration Status:** ✅ Complete (Feb 2, 2026)

---

## Future Enhancements

Potential additions:

- **Cookie consent bar** - GDPR compliance
- **Promo countdown timer** - Limited-time offers
- **Feature announcement** - New tool updates
- **Beta tester signup** - Early access forms
- **Social proof** - "100+ users today" ticker

All can be added without touching HTML pages!

---

## Support

Questions? Check:
1. [`components.js`](components.js) - Source code with comments
2. Browser console - Injection logs and errors
3. [`style.css`](style.css) lines 780+ - Banner styles

---

**Last Updated:** February 2, 2026
**Version:** 1.0
**Status:** Production Ready ✅

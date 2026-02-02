/**
 * Universal Component Injection System
 *
 * This script dynamically injects reusable components (like banners, headers, footers)
 * into all pages. To update/remove components across the entire site, just modify this file.
 *
 * Usage:
 * 1. Add <script src="components.js"></script> before </body> on every page
 * 2. Add placeholder divs: <div id="global-banner"></div>
 * 3. Components auto-inject on page load
 */

const GlobalComponents = {
    /**
     * Launch Banner Component - Promotes Video Background Remover Tool
     * Shows on promotional pages (FAQ, Contact, Privacy, Terms)
     * Hidden on tool pages (index.html, obs-background-remover.html) to avoid self-promotion
     */
    banner: {
        enabled: true,
        targetId: 'global-banner', // Where to inject (must exist on page)

        // Pages where banner should NOT show (tool pages)
        excludePages: ['index.html', 'obs-background-remover.html'],

        html: `
            <div class="launch-banner" id="launchBanner">
                <button class="banner-close" onclick="GlobalComponents.banner.close()">×</button>
                <div class="banner-content">
                    <div class="banner-video">
                        <video autoplay loop muted playsinline class="banner-demo-video">
                            <source src="assets/demo.webm" type="video/webm">
                        </video>
                        <div class="banner-badge">
                            <span class="badge-dot"></span>
                            NEW LAUNCH
                        </div>
                    </div>
                    <div class="banner-text">
                        <h3 class="banner-title">🎉 Free Video Background Remover is Live!</h3>
                        <p class="banner-description">Click. Remove. Done.</p>
                        <button class="banner-cta" onclick="GlobalComponents.banner.goToTool()">Try It Now →</button>
                    </div>
                </div>
            </div>
        `,

        // Banner-specific functions
        close: function() {
            const banner = document.getElementById('launchBanner');
            if (!banner) return;

            banner.style.animation = 'slideUp 0.3s ease-out forwards';
            setTimeout(() => {
                banner.style.display = 'none';
                localStorage.setItem('bannerClosed', 'true');
            }, 300);
        },

        goToTool: function() {
            // Redirect to video background remover tool
            window.location.href = 'index.html';
        },

        // Check if current page should show banner
        shouldShow: function() {
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            return !this.excludePages.includes(currentPage);
        },

        // Check if user already dismissed banner and if page is excluded
        init: function() {
            const banner = document.getElementById('launchBanner');
            if (!banner) return;

            // Hide if page is in exclude list (tool pages)
            if (!this.shouldShow()) {
                banner.style.display = 'none';
                console.log('Banner hidden: Tool page detected');
                return;
            }

            // Hide if user previously dismissed it
            if (localStorage.getItem('bannerClosed') === 'true') {
                banner.style.display = 'none';
                console.log('Banner hidden: User dismissed');
            }
        }
    },

    /**
     * Example: Notification Bar Component (disabled by default)
     * Uncomment and set enabled: true to activate
     */
    // notification: {
    //     enabled: false,
    //     targetId: 'global-notification',
    //     html: `
    //         <div class="notification-bar">
    //             <p>🎉 New feature: Batch video processing now available!</p>
    //             <button onclick="GlobalComponents.notification.close()">×</button>
    //         </div>
    //     `
    // },

    /**
     * Initialize all enabled components
     */
    init: function() {
        // Inject all enabled components
        Object.keys(this).forEach(key => {
            const component = this[key];

            // Skip non-component properties (like 'init' function)
            if (typeof component !== 'object' || !component.enabled) return;

            // Find target element
            const target = document.getElementById(component.targetId);
            if (!target) {
                console.warn(`Component "${key}" target #${component.targetId} not found on this page`);
                return;
            }

            // Inject HTML
            target.innerHTML = component.html;

            // Run component-specific init if exists
            if (component.init && typeof component.init === 'function') {
                component.init();
            }

            console.log(`✅ Component "${key}" injected into #${component.targetId}`);
        });
    }
};

// Auto-initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GlobalComponents.init());
} else {
    GlobalComponents.init();
}

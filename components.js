/**
 * GLOBAL Component Injection System - OBS Mask Generator
 *
 * This script manages site-wide components (banners, notifications, etc.)
 * Loaded on ALL pages across the entire obsmaskgenerator.com website
 */

const GlobalComponents = {
    /**
     * Video Background Remover Promotion Banner
     * Shows on ALL pages EXCEPT video-background-remover tool pages
     */
    banner: {
        enabled: true,
        targetId: 'global-banner',

        // Exclude video-background-remover pages (the tool itself)
        excludePaths: [
            '/video-background-remover/',
            '/video-background-remover/index.html',
            '/video-background-remover/obs-background-remover.html'
        ],

        html: `
            <div class="launch-banner" id="launchBanner">
                <button class="banner-close" onclick="GlobalComponents.banner.close()">×</button>
                <div class="banner-content">
                    <div class="banner-video">
                        <video autoplay loop muted playsinline class="banner-demo-video">
                            <source src="/video-background-remover/assets/demo.webm" type="video/webm">
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

        close: function() {
            const banner = document.getElementById('launchBanner');
            if (!banner) return;

            banner.style.animation = 'slideUp 0.3s ease-out forwards';
            setTimeout(() => {
                banner.style.display = 'none';
                localStorage.setItem('videoBgBannerClosed', 'true');
            }, 300);
        },

        goToTool: function() {
            window.location.href = '/video-background-remover/';
        },

        shouldShow: function() {
            const currentPath = window.location.pathname;

            // Check if current page is in exclude list
            for (const path of this.excludePaths) {
                if (currentPath.includes(path)) {
                    return false;
                }
            }

            return true;
        },

        init: function() {
            const banner = document.getElementById('launchBanner');
            if (!banner) return;

            // Hide if on video-background-remover pages (self-promotion)
            if (!this.shouldShow()) {
                banner.style.display = 'none';
                console.log('[Banner] Hidden: Tool page detected');
                return;
            }

            // Hide if user previously dismissed
            if (localStorage.getItem('videoBgBannerClosed') === 'true') {
                banner.style.display = 'none';
                console.log('[Banner] Hidden: User dismissed');
            } else {
                console.log('[Banner] Showing promotion banner');
            }
        }
    },

    /**
     * Initialize all enabled components
     */
    init: function() {
        Object.keys(this).forEach(key => {
            const component = this[key];

            if (typeof component !== 'object' || !component.enabled) return;

            const target = document.getElementById(component.targetId);
            if (!target) {
                console.warn(`[Components] Target #${component.targetId} not found`);
                return;
            }

            // Inject HTML
            target.innerHTML = component.html;

            // Run component init
            if (component.init && typeof component.init === 'function') {
                component.init();
            }
        });
    }
};

// Auto-initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GlobalComponents.init());
} else {
    GlobalComponents.init();
}

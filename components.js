/**
 * GLOBAL Component Injection System - OBS Mask Generator
 *
 * This script manages site-wide components (banners, notifications, etc.)
 * Loaded on ALL pages across the entire obsmaskgenerator.com website
 */

const GlobalComponents = {
    /**
     * Cookie Consent Banner (GDPR Compliant)
     * Shows on first visit, saves consent to localStorage
     */
    cookieConsent: {
        enabled: true,
        targetId: 'cookie-consent-banner',

        html: `
            <div class="cookie-consent" id="cookieConsentBanner" style="
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: rgba(20, 20, 30, 0.98);
                backdrop-filter: blur(10px);
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                padding: 20px;
                z-index: 10000;
                display: none;
                animation: slideUpFade 0.3s ease-out;
            ">
                <div style="max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 300px;">
                        <p style="margin: 0; color: #fff; font-size: 0.95rem; line-height: 1.5;">
                            🍪 We use cookies to improve your experience and analyze site traffic. 
                            <a href="/privacy-policy.html" style="color: #00f593; text-decoration: underline;">Learn more</a>
                        </p>
                    </div>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button onclick="GlobalComponents.cookieConsent.decline()" style="
                            padding: 12px 24px;
                            background: transparent;
                            border: 1px solid rgba(255, 255, 255, 0.2);
                            color: #fff;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 0.9rem;
                            transition: all 0.2s;
                        " onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='transparent'">
                            Decline
                        </button>
                        <button onclick="GlobalComponents.cookieConsent.accept()" style="
                            padding: 12px 24px;
                            background: linear-gradient(135deg, #00f593, #00c689);
                            border: none;
                            color: #000;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 0.9rem;
                            transition: all 0.2s;
                        " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                            Accept All
                        </button>
                    </div>
                </div>
            </div>
        `,

        accept: function() {
            localStorage.setItem('cookie_consent', 'true');
            this.close();
            // GA4 consent handled by ga4ConsentMode
            if (GlobalComponents.ga4ConsentMode) {
                GlobalComponents.ga4ConsentMode.grantConsent();
            }
        },

        decline: function() {
            localStorage.setItem('cookie_consent', 'false');
            this.close();
            // Ensure GA4 stays denied
            if (GlobalComponents.ga4ConsentMode) {
                GlobalComponents.ga4ConsentMode.revokeConsent();
            }
        },

        close: function() {
            const banner = document.getElementById('cookieConsentBanner');
            if (!banner) return;
            
            banner.style.animation = 'slideDownFade 0.3s ease-out forwards';
            setTimeout(() => {
                banner.style.display = 'none';
            }, 300);
        },


        init: function() {
            // Add CSS animations
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideUpFade {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes slideDownFade {
                    from { transform: translateY(0); opacity: 1; }
                    to { transform: translateY(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);

            const banner = document.getElementById('cookieConsentBanner');
            if (!banner) {
                console.warn('[Cookie Consent] Banner element not found');
                return;
            }

            const consent = localStorage.getItem('cookie_consent');

            if (consent === null) {
                // First visit - show banner
                banner.style.display = 'block';
                console.log('[Cookie Consent] Showing banner (first visit)');
            } else if (consent === 'true') {
                // User accepted - GA4 consent handled by ga4ConsentMode
                console.log('[Cookie Consent] Already accepted');
            } else {
                // User declined
                console.log('[Cookie Consent] User declined cookies');
            }
        }
    },

    /**
     * Google Analytics 4 with Consent Mode v2
     * Loads GA4 immediately in "denied" state, updates consent dynamically
     * GDPR compliant - no tracking until user accepts cookies
     */
    ga4ConsentMode: {
        measurementId: 'G-C84663S6K3',

        init: function() {
            // Skip on localhost
            if (window.location.hostname === 'localhost') {
                console.log('[GA4 Consent Mode] Skipped - localhost detected');
                return;
            }

            // Step 1: Initialize dataLayer BEFORE GA4 script loads
            window.dataLayer = window.dataLayer || [];
            function gtag() { dataLayer.push(arguments); }
            window.gtag = gtag;

            // Step 2: Set default consent to "denied" (GDPR compliant)
            gtag('consent', 'default', {
                'analytics_storage': 'denied'
            });

            // Step 3: Load GA4 script (loads ONCE, immediately)
            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://www.googletagmanager.com/gtag/js?id=' + this.measurementId;
            document.head.appendChild(script);

            // Step 4: Initialize GA4 (in denied state)
            gtag('js', new Date());
            gtag('config', this.measurementId, {
                'anonymize_ip': true
            });

            console.log('[GA4 Consent Mode] Initialized in denied state');

            // Step 5: Auto-grant if user already accepted cookies
            const consent = localStorage.getItem('cookie_consent');
            if (consent === 'true') {
                this.grantConsent();
            }
        },

        grantConsent: function() {
            if (!window.gtag) {
                console.warn('[GA4 Consent Mode] gtag not loaded yet');
                return;
            }

            // Update consent to "granted" (enables tracking)
            gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });

            console.log('[GA4 Consent Mode] Consent granted - tracking enabled');
        },

        revokeConsent: function() {
            if (!window.gtag) return;

            // Update consent to "denied" (disables tracking)
            gtag('consent', 'update', {
                'analytics_storage': 'denied'
            });

            console.log('[GA4 Consent Mode] Consent revoked - tracking disabled');
        }
    },

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
                // Save dismissed state with version
                localStorage.setItem('videoBgBannerClosed', 'true');
                localStorage.setItem('videoBgBannerVersion', '1.0');
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

            // IMPORTANT: Clear old localStorage keys from testing phase
            // This ensures banner shows for all users after site-wide deployment
            const oldKeys = ['bannerClosed', 'bannerDismissed'];
            oldKeys.forEach(key => {
                if (localStorage.getItem(key)) {
                    localStorage.removeItem(key);
                    console.log('[Banner] Cleared old key:', key);
                }
            });

            // Check banner version - reset if version changed (force show new banners)
            const BANNER_VERSION = '1.0';
            const dismissedVersion = localStorage.getItem('videoBgBannerVersion');

            if (dismissedVersion !== BANNER_VERSION) {
                // New banner version - clear dismissed flag
                localStorage.removeItem('videoBgBannerClosed');
                console.log('[Banner] New version detected, resetting dismissal');
            }

            // Hide if user dismissed current version
            if (localStorage.getItem('videoBgBannerClosed') === 'true') {
                banner.style.display = 'none';
                console.log('[Banner] Hidden: User dismissed version', BANNER_VERSION);
            } else {
                console.log('[Banner] Showing promotion banner version', BANNER_VERSION);
            }
        }
    },

    /**
     * Initialize all enabled components
     */
    _initialized: false,

    init: function() {
        // Prevent double initialization
        if (this._initialized) {
            console.log('[Components] Already initialized, skipping');
            return;
        }
        this._initialized = true;

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

        // Initialize GA4 Consent Mode (runs independently of other components)
        if (this.ga4ConsentMode && this.ga4ConsentMode.init) {
            this.ga4ConsentMode.init();
        }
    }
};

// Auto-initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GlobalComponents.init());
} else {
    GlobalComponents.init();
}

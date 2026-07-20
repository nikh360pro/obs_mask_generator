/**
 * GLOBAL Component Injection System - OBS Mask Generator
 *
 * This script manages site-wide components (banners, notifications, etc.)
 * Loaded on ALL pages across the entire obsmaskgenerator.com website
 */

const GlobalComponents = {
    /**
     * Google Analytics 4 with Consent Mode v2
     * Loads GA4 immediately in "denied" state, updates consent dynamically
     * GDPR compliant - no tracking until user accepts cookies via AdSense CMP
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
            // Note: AdSense CMP will automatically update consent when user accepts
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
     * Initialize all enabled components
     */
    _initialized: false,

    mynofiPromoBanner: {
        enabled: true,
        injectBody: true,
        html: `
            <style>
                .mynofi-promo-banner {
                    display: flex; align-items: center; justify-content: center;
                    background-color: #18181b; color: #efeff1;
                    padding: 12px 24px; text-decoration: none;
                    font-family: 'Inter', system-ui, sans-serif;
                    transition: background-color 0.15s ease;
                }
                .mynofi-promo-banner:hover { background-color: #1f1f23; }
                .mynofi-banner-content { display: flex; align-items: center; gap: 16px; width: 100%; justify-content: center; }
                .mynofi-banner-badge { background: #9146ff; color: #fff; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
                .mynofi-banner-text { font-size: 14px; font-weight: 400; color: #d3d3d9; }
                .mynofi-banner-text strong { color: #fff; font-weight: 600; }
                .mynofi-banner-link { color: #bf94ff; font-weight: 500; font-size: 14px; display: flex; align-items: center; gap: 4px; }
                .mynofi-banner-link:hover { color: #a970ff; text-decoration: underline; }
                @media (max-width: 768px) {
                    .mynofi-banner-content { flex-direction: column; gap: 8px; text-align: center; }
                    .mynofi-banner-text { font-size: 13px; line-height: 1.4; }
                }
            </style>
            <a href="/mynofi/" class="mynofi-promo-banner">
                <div class="mynofi-banner-content">
                    <span class="mynofi-banner-badge">New Tool</span>
                    <div class="mynofi-banner-text">
                        <strong>OBS crashed without you noticing?</strong> Protect your recordings with the Mynofi failsafe alert system.
                    </div>
                    <div class="mynofi-banner-link">
                        See how it works <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </div>
                </div>
            </a>
        `,
        init: function() {
            // Check exclusion list
            const exclusions = ['/mynofi', 'terms', 'privacy', 'contact', 'about'];
            const currentPath = window.location.pathname.toLowerCase();
            const isExcluded = exclusions.some(path => currentPath.includes(path));
            
            if (isExcluded) {
                // If excluded, remove the injected banner container
                const bannerContainer = document.getElementById('mynofiPromoBanner-container');
                if (bannerContainer) bannerContainer.remove();
            }
        }
    },

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

            if (component.injectBody) {
                const container = document.createElement('div');
                container.id = key + '-container';
                container.innerHTML = component.html;
                document.body.insertBefore(container, document.body.firstChild);
                
                if (component.init && typeof component.init === 'function') {
                    component.init();
                }
                return;
            }

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

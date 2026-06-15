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

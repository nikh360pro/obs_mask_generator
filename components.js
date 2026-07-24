/**
 * GLOBAL Component Injection System - OBS Mask Generator
 *
 * This script manages site-wide components (banners, notifications, etc.)
 * Loaded on ALL pages across the entire obsmaskgenerator.com website
 */

const GlobalComponents = {
    /**
     * Google Analytics 4 (Standard Tracking)
     * Centralized GA4 tracking for all 1400+ pages.
     */
    ga4ConsentMode: {
        measurementId: 'G-C84663S6K3',

        init: function() {
            // Skip on localhost
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log('[GA4] Skipped - localhost detected');
                return;
            }

            // Prevent double initialization if already loaded
            if (window.dataLayer && window.dataLayer.some(item => item[0] === 'config' && item[1] === this.measurementId)) {
                return;
            }

            // Step 1: Initialize dataLayer BEFORE GA4 script loads
            window.dataLayer = window.dataLayer || [];
            function gtag() { dataLayer.push(arguments); }
            window.gtag = gtag;

            // Step 2: Load GA4 script (loads ONCE, immediately)
            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://www.googletagmanager.com/gtag/js?id=' + this.measurementId;
            document.head.appendChild(script);

            // Step 3: Initialize GA4
            gtag('js', new Date());
            gtag('config', this.measurementId, {
                'anonymize_ip': true
            });

            console.log('[GA4] Initialized standard tracking via components.js');
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
                .mynofi-promo-banner-v2 {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    z-index: 9999;
                    background: linear-gradient(180deg, #18181b 0%, #111113 100%);
                    border-top: 1px solid rgba(145, 70, 255, 0.3);
                    box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5), 0 -2px 10px rgba(145, 70, 255, 0.1);
                    padding: 24px 36px;
                    text-decoration: none;
                    font-family: 'Inter', system-ui, sans-serif;
                    transition: all 0.2s ease;
                    touch-action: pan-x;
                }

                .mynofi-promo-banner-v2:hover {
                    background: linear-gradient(180deg, #1f1f23 0%, #151518 100%);
                    border-top: 1px solid rgba(145, 70, 255, 0.5);
                }

                .mynofi-banner-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 36px;
                }

                .mynofi-banner-left {
                    display: flex;
                    align-items: center;
                    gap: 30px;
                    flex: 1;
                }

                .mynofi-banner-logo-wrap {
                    position: relative;
                    width: 96px;
                    height: 96px;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .mynofi-banner-logo {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }

                .mynofi-banner-text-wrap {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .mynofi-banner-title {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    font-size: 24px;
                    font-weight: 700;
                    color: #ffffff;
                    letter-spacing: -0.01em;
                }

                .mynofi-banner-badge {
                    background: #9146ff;
                    color: #fff;
                    font-size: 14px;
                    font-weight: 800;
                    padding: 4px 12px;
                    border-radius: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .mynofi-banner-desc {
                    font-size: 20px;
                    font-weight: 400;
                    color: #adadb8;
                    line-height: 1.4;
                }
                
                .mynofi-banner-desc strong {
                    color: #efeff1;
                    font-weight: 600;
                }

                .mynofi-banner-cta {
                    background: #9146ff;
                    color: #ffffff;
                    padding: 15px 30px;
                    border-radius: 12px;
                    font-size: 20px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-shrink: 0;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                }

                .mynofi-promo-banner-v2:hover .mynofi-banner-cta {
                    background: #a970ff;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(145, 70, 255, 0.3);
                }

                @media (max-width: 768px) {
                    .mynofi-promo-banner-v2 {
                        padding: 12px 16px;
                    }
                    .mynofi-banner-container {
                        flex-direction: column;
                        text-align: center;
                        gap: 12px;
                    }
                    .mynofi-banner-left {
                        flex-direction: row; /* Align logo and text horizontally on mobile to save space */
                        gap: 12px;
                        text-align: left;
                    }
                    .mynofi-banner-logo-wrap {
                        width: 44px;
                        height: 44px;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.5);
                    }
                    .mynofi-banner-title {
                        justify-content: flex-start;
                        font-size: 15px;
                        gap: 8px;
                    }
                    .mynofi-banner-badge {
                        font-size: 10px;
                        padding: 2px 6px;
                    }
                    .mynofi-banner-desc {
                        font-size: 13px;
                        line-height: 1.3;
                    }
                    .mynofi-banner-cta {
                        width: 100%;
                        justify-content: center;
                        padding: 10px;
                        font-size: 15px;
                        border-radius: 8px;
                    }
                }
            </style>
            <a href="/mynofi/" class="mynofi-promo-banner-v2">
                <div class="mynofi-banner-container">
                    
                    <div class="mynofi-banner-left">
                        <div class="mynofi-banner-logo-wrap">
                            <!-- Absolute path so logo loads correctly on any sub-page -->
                            <img src="/mynofi/assets/logo.webp" alt="Mynofi Logo" class="mynofi-banner-logo">
                        </div>
                        
                        <div class="mynofi-banner-text-wrap">
                            <div class="mynofi-banner-title">
                                Stop Missing Recordings
                                <span class="mynofi-banner-badge">New Tool</span>
                            </div>
                            <div class="mynofi-banner-desc">
                                <strong>OBS crashed without you noticing?</strong> Protect your footage with the Mynofi failsafe desktop alert system.
                            </div>
                        </div>
                    </div>

                    <div class="mynofi-banner-cta">
                        See how it works
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
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
                
                // Remove any padding
                document.body.style.paddingBottom = "0px";
            } else {
                // Dynamically add massive padding to the body so the 1.5x banner doesn't cover footer links
                const isMobile = window.innerWidth <= 768;
                document.body.style.paddingBottom = isMobile ? "130px" : "180px";
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

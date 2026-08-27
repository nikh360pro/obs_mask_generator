/**
 * GLOBAL Component Injection System - OBS Mask Generator
 *
 * This script manages site-wide components (banners, notifications, etc.)
 * Loaded on ALL pages across the entire obsmaskgenerator.com website
 */

const GlobalComponents = {
    /**
     * Google Tag Manager (Bot Protection & Tracking)
     * Centralized GTM for all 1400+ pages. Replaces direct GA4 to prevent bot spam.
     */
    gtmContainer: {
        containerId: 'GTM-KS8RFC9V',

        init: function() {
            // Skip on localhost
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log('[GTM] Skipped - localhost detected');
                return;
            }

            // Prevent double initialization
            if (document.getElementById('gtm-script-tag')) {
                return;
            }

            // Step 1: Initialize GTM script
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;
            j.id = 'gtm-script-tag';
            f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer',this.containerId);

            // Step 2: Inject noscript iframe for GTM
            const noscript = document.createElement('noscript');
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.googletagmanager.com/ns.html?id=${this.containerId}`;
            iframe.height = "0";
            iframe.width = "0";
            iframe.style.display = "none";
            iframe.style.visibility = "hidden";
            noscript.appendChild(iframe);
            document.body.insertBefore(noscript, document.body.firstChild);

            console.log('[GTM] Initialized standard tracking via components.js');
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
                    transform: translateY(150%);
                    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease, border-color 0.2s ease;
                    touch-action: pan-x;
                }

                .mynofi-promo-banner-v2.show-banner {
                    transform: translateY(0);
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
                                Your recording could be dead right now.
                            </div>
                            <div class="mynofi-banner-desc">
                                Mynofi fires an instant desktop alert when OBS, ShadowPlay or Audacity stops unexpectedly. No more silent crashes.
                            </div>
                        </div>
                    </div>

                    <div class="mynofi-banner-cta">
                        Get Mynofi
                        <span style="background:rgba(0,245,147,0.2);color:#00f593;border-radius:4px;padding:2px 8px;font-size:0.72em;font-weight:700;letter-spacing:0.02em;">Free</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </div>

                </div>
            </a>
        `,
        init: function() {
            // Exclusion — homepage uses exact match so '/' does not match every path
            const exclusions = [
                '/mynofi', 'terms', 'privacy', 'contact', 'about', 'stream-analyzer',
                '/obs-background-removal', '/virtual-background-no-green-screen',
                '/remove-video-background', '/webcam-background-blur',
                '/vertical-stream-layout', '/starting-screen', '/overlay-generator'
            ];
            const currentPath = window.location.pathname.toLowerCase();
            const isHomepage = (currentPath === '/');
            const isExcluded = isHomepage || exclusions.some(path => currentPath.includes(path));
            
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

                // Add delay for sliding up the banner
                setTimeout(() => {
                    const banner = document.querySelector(".mynofi-promo-banner-v2");
                    if (banner) banner.classList.add("show-banner");
                }, 10000);
            }
        }
    },

    segforgePromoBanner: {
        enabled: true,
        injectBody: true,
        html: `
            <style>
                .sf-promo-banner { position:fixed; bottom:0; left:0; right:0; z-index:9999; transform:translateY(110%); transition:transform 0.65s cubic-bezier(0.16,1,0.3,1); overflow:hidden; font-family:'Inter',system-ui,sans-serif; }
                .sf-promo-banner.sf-show { transform:translateY(0); }
                .sf-promo-video { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:0; }
                .sf-promo-overlay { position:absolute; inset:0; background:linear-gradient(90deg,rgba(10,10,12,0.96) 0%,rgba(10,10,12,0.84) 55%,rgba(10,10,12,0.38) 100%); z-index:1; border-top:1px solid rgba(145,70,255,0.35); box-shadow:0 -12px 48px rgba(0,0,0,0.6),0 -2px 12px rgba(145,70,255,0.12); }
                .sf-promo-inner { position:relative; z-index:2; max-width:1200px; margin:0 auto; padding:20px 28px; display:flex; align-items:center; gap:22px; }
                .sf-promo-logo { flex-shrink:0; width:72px; height:72px; border-radius:18px; overflow:hidden; background:rgba(0,0,0,0.35); border:1px solid rgba(255,255,255,0.08); box-shadow:0 0 28px rgba(0,210,110,0.22),0 4px 16px rgba(0,0,0,0.5); }
                .sf-promo-logo img { width:100%; height:100%; object-fit:cover; display:block; }
                .sf-promo-text { flex:1; display:flex; flex-direction:column; gap:5px; min-width:0; }
                .sf-promo-eyebrow { font-size:11px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#00d26a; display:flex; align-items:center; gap:6px; }
                .sf-promo-eyebrow::before { content:''; flex-shrink:0; width:6px; height:6px; border-radius:50%; background:#00d26a; animation:sf-pulse 2s ease-in-out infinite; }
                @keyframes sf-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(0,210,106,0.5);} 50%{box-shadow:0 0 0 5px rgba(0,210,106,0);} }
                .sf-promo-title { font-size:19px; font-weight:700; color:#fff; line-height:1.25; letter-spacing:-0.01em; }
                .sf-promo-title span { background:linear-gradient(90deg,#00d26a,#00b359); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
                .sf-promo-desc { font-size:14px; color:#adadb8; line-height:1.4; }
                .sf-promo-desc strong { color:#efeff1; font-weight:600; }
                .sf-promo-pills { display:flex; gap:8px; flex-wrap:wrap; margin-top:4px; }
                .sf-promo-pill { font-size:11px; font-weight:500; color:#848494; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:100px; padding:2px 10px; }
                .sf-promo-cta { flex-shrink:0; display:inline-flex; align-items:center; gap:10px; background:linear-gradient(135deg,#9146ff,#7a36e0); color:#fff; font-size:16px; font-weight:700; padding:14px 26px; border-radius:12px; text-decoration:none; transition:all 0.2s ease; white-space:nowrap; box-shadow:0 4px 20px rgba(145,70,255,0.35); }
                .sf-promo-cta:hover { background:linear-gradient(135deg,#a970ff,#9146ff); transform:translateY(-2px); box-shadow:0 8px 28px rgba(145,70,255,0.5); }
                .sf-promo-free { background:rgba(0,210,106,0.2); color:#00d26a; border-radius:6px; padding:2px 8px; font-size:12px; font-weight:700; }
                .sf-promo-dismiss { flex-shrink:0; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); color:#848494; width:32px; height:32px; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s ease; align-self:flex-start; margin-top:4px; }
                .sf-promo-dismiss:hover { background:rgba(255,255,255,0.1); color:#efeff1; border-color:rgba(255,255,255,0.2); }
                .sf-promo-dots { position:absolute; bottom:8px; right:16px; z-index:3; display:flex; gap:5px; align-items:center; }
                .sf-promo-dot { width:5px; height:5px; border-radius:50%; background:rgba(255,255,255,0.25); transition:all 0.3s ease; cursor:pointer; }
                .sf-promo-dot.sf-active { width:18px; border-radius:3px; background:#00d26a; }
                @media(max-width:700px){.sf-promo-inner{padding:14px 16px;gap:12px;flex-wrap:wrap;}.sf-promo-logo{width:48px;height:48px;border-radius:12px;}.sf-promo-title{font-size:15px;}.sf-promo-desc{font-size:12px;}.sf-promo-pills{display:none;}.sf-promo-cta{width:100%;justify-content:center;font-size:14px;padding:12px 20px;}}
            </style>
            <div class="sf-promo-banner" id="sf-promo-banner" role="region" aria-label="SegForge promotion">
                <video class="sf-promo-video" id="sf-promo-video" muted autoplay playsinline aria-hidden="true">
                    <source src="/segforge/videos/can_do/video-bg-remover.mp4" type="video/mp4">
                </video>
                <div class="sf-promo-overlay"></div>
                <div class="sf-promo-dots" id="sf-promo-dots" aria-hidden="true">
                    <div class="sf-promo-dot sf-active" data-sfidx="0"></div>
                    <div class="sf-promo-dot" data-sfidx="1"></div>
                    <div class="sf-promo-dot" data-sfidx="2"></div>
                    <div class="sf-promo-dot" data-sfidx="3"></div>
                    <div class="sf-promo-dot" data-sfidx="4"></div>
                </div>
                <div class="sf-promo-inner">
                    <div class="sf-promo-logo"><img src="/segforge/segforge_logo.webp" alt="SegForge" width="72" height="72"></div>
                    <div class="sf-promo-text">
                        <div class="sf-promo-eyebrow">Adobe Premiere Pro Plugin</div>
                        <div class="sf-promo-title">Remove Video Backgrounds <span>Without a Green Screen</span></div>
                        <div class="sf-promo-desc"><strong>SegForge</strong> uses Meta's SAM2 AI inside your Premiere Pro timeline. Point, click, get a clean masked video in minutes.</div>
                        <div class="sf-promo-pills">
                            <span class="sf-promo-pill">&#9889; One-time payment</span>
                            <span class="sf-promo-pill">&#128274; No subscription</span>
                            <span class="sf-promo-pill">&#128421;&#65039; Runs 100% locally</span>
                            <span class="sf-promo-pill">&#127967; Windows only</span>
                        </div>
                    </div>
                    <a href="https://nikhonet.gumroad.com/l/video-background-remover-plugin" target="_blank" rel="noopener" class="sf-promo-cta" aria-label="Get SegForge free on Gumroad">
                        Get SegForge <span class="sf-promo-free">Free</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </a>
                    <button class="sf-promo-dismiss" id="sf-promo-dismiss" aria-label="Dismiss SegForge banner">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
            </div>
        `,
        init: function() {
            var allowlist = ['/', '/obs-background-removal/', '/virtual-background-no-green-screen/', '/remove-video-background/', '/webcam-background-blur/', '/vertical-stream-layout/', '/starting-screen/', '/overlay-generator/'];
            var cp = window.location.pathname.toLowerCase();
            var ok = allowlist.some(function(p){ return p==='/' ? cp==='/' : cp.indexOf(p)===0; });
            if (!ok) { var c=document.getElementById('segforgePromoBanner-container'); if(c)c.remove(); return; }
            var vids=['/segforge/videos/can_do/video-bg-remover.mp4','/segforge/videos/can_do/green-screen-video.mp4','/segforge/videos/can_do/video-background-removal.mp4','/segforge/videos/can_do/video-background-remover-free.mp4','/segforge/videos/can_do/youtube-video-background-remover.mp4'];
            var idx=0, vid=document.getElementById('sf-promo-video'), dots=document.querySelectorAll('.sf-promo-dot'), banner=document.getElementById('sf-promo-banner'), dismiss=document.getElementById('sf-promo-dismiss');
            function play(i){ idx=i; vid.src=vids[i]; vid.load(); vid.play().catch(function(){}); dots.forEach(function(d,j){d.classList.toggle('sf-active',j===i);}); }
            vid.addEventListener('ended',function(){ play((idx+1)%vids.length); });
            dots.forEach(function(d){ d.addEventListener('click',function(){ play(parseInt(d.dataset.sfidx,10)); }); });
            dismiss.addEventListener('click',function(e){ e.stopPropagation(); banner.style.transition='transform 0.4s cubic-bezier(0.4,0,1,1)'; banner.classList.remove('sf-show'); vid.pause(); });
            document.body.style.paddingBottom = window.innerWidth<=700 ? '130px' : '140px';
            setTimeout(function(){ banner.classList.add('sf-show'); vid.play().catch(function(){}); }, 10000);
        }
    },
    crossPromoPopup: {
        enabled: true,
        injectBody: true,
        html: `
        <style>
            .promo-modal-bg { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 9999; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
            .promo-modal-bg.show { opacity: 1; pointer-events: all; }
            .promo-modal { background: #161623; border: 1px solid rgba(99,102,241,0.3); border-radius: 16px; padding: 40px; max-width: 480px; width: 90%; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5); position: relative; transform: translateY(20px); transition: transform 0.3s; }
            .promo-modal-bg.show .promo-modal { transform: translateY(0); }
            .promo-modal h2 { font-size: 1.8rem; color: #f8fafc; margin: 0 0 10px; line-height: 1.2; }
            .promo-modal h2 em { color: #a855f7; font-style: normal; }
            .promo-modal p.hook { font-size: 1.2rem; font-weight: 600; color: #ef4444; margin-bottom: 15px; }
            .promo-modal p.desc { color: #94a3b8; font-size: 0.95rem; line-height: 1.6; margin-bottom: 24px; }
            .promo-input { width: 100%; background: #0f0f17; border: 1px solid rgba(99,102,241,0.2); color: #fff; padding: 14px 16px; border-radius: 8px; font-size: 1rem; margin-bottom: 16px; box-sizing: border-box; outline: none; transition: border-color 0.2s; }
            .promo-input:focus { border-color: #a855f7; }
            .promo-btn { width: 100%; background: linear-gradient(135deg, #a855f7, #7c3aed); color: #fff; border: none; padding: 14px; border-radius: 8px; font-size: 1.1rem; font-weight: 700; cursor: pointer; transition: transform 0.2s, opacity 0.2s; }
            .promo-btn:hover { transform: translateY(-2px); opacity: 0.95; }
            .promo-close { position: absolute; top: 16px; right: 20px; background: none; border: none; color: #64748b; font-size: 1.5rem; cursor: pointer; transition: color 0.2s; }
            .promo-close:hover { color: #fff; }
        </style>
        <div class="promo-modal-bg" id="global-promo-modal">
            <div class="promo-modal">
                <button class="promo-close" onclick="document.getElementById('global-promo-modal').classList.remove('show')">Ã—</button>
                <h2>Emotes are great.<br>But <em>Viewers</em> are better.</h2>
                <p class="hook">Stop streaming to an empty room.</p>
                <p class="desc">You just spent time upgrading your stream, but who is going to see it? Enter your Twitch username below to discover exactly why your channel isn't growing and get a personalized 30-day plan.</p>
                <input type="text" id="global-promo-username" class="promo-input" placeholder="Your Twitch Username..." spellcheck="false">
                <button class="promo-btn" onclick="const u=document.getElementById('global-promo-username').value.trim();if(u)window.location.href='/stream-analyzer/?username='+encodeURIComponent(u);">ðŸš€ Analyze My Channel Now</button>
            </div>
        </div>
        `
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

        // Initialize GTM (runs independently of other components)
        if (this.gtmContainer && this.gtmContainer.init) {
            this.gtmContainer.init();
        }
    }
};

// Auto-initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GlobalComponents.init());
} else {
    GlobalComponents.init();
}

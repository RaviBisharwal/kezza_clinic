/**
 * Kezza Clinic - Ultra-Fast Zero-Refresh SPA Navigation Engine
 * 
 * Provides seamless, instantaneous transitions between sections and pages
 * without harsh browser reloads or white screen flashes:
 * 1. Intercepts internal link clicks
 * 2. Fetches target page HTML in the background with DOMParser
 * 3. Smoothly swaps the <main> content container (140ms hardware-accelerated fade)
 * 4. Updates document title, meta tags, and URL via history.pushState()
 * 5. Handles anchor scrolling (e.g. /#locations) after page transition
 * 6. Keeps persistent components (Navbar, Footer, Kezza AI Floating Chat Widget) mounted!
 * 7. Supports native browser Back/Forward (popstate)
 * 8. Re-initializes page modules (TeleCRM forms, smooth scroll, animations)
 */

(function () {
    'use strict';

    if (typeof window === 'undefined' || !window.fetch || !window.DOMParser || !window.history.pushState) {
        return; // Fallback to native browser navigation on ancient browsers
    }

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cache = new Map(); // In-memory HTML cache for instantaneous sub-millisecond swaps
    let isTransitioning = false;
    const routeEventMarker = '__kezzaRouteNavigationHandled';

    // ── 1. Top Loading Bar ───────────────────────────────────────────
    let topBar = null;
    function getTopBar() {
        if (!topBar) {
            topBar = document.getElementById('kzSpaBar');
            if (!topBar && document.body) {
                topBar = document.createElement('div');
                topBar.id = 'kzSpaBar';
                topBar.setAttribute('aria-hidden', 'true');
                topBar.style.cssText = `
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    height: 3px !important;
                    background: linear-gradient(90deg, #00afc0, #00c4d6, #f39c12) !important;
                    box-shadow: 0 0 10px rgba(0, 175, 192, 0.7) !important;
                    z-index: 100003 !important;
                    transform-origin: 0% 50% !important;
                    transform: scaleX(0);
                    opacity: 0;
                    pointer-events: none !important;
                    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease !important;
                `;
                document.body.prepend(topBar);
            }
        }
        return topBar;
    }

    function startLoading() {
        const bar = getTopBar();
        if (bar) {
            bar.style.transition = 'transform 0.3s ease, opacity 0.15s ease';
            bar.style.opacity = '1';
            bar.style.transform = 'scaleX(0.4)';
        }
    }

    function advanceLoading() {
        const bar = getTopBar();
        if (bar) {
            bar.style.transform = 'scaleX(0.75)';
        }
    }

    function finishLoading() {
        const bar = getTopBar();
        if (bar) {
            bar.style.transition = 'transform 0.15s ease, opacity 0.25s ease';
            bar.style.transform = 'scaleX(1)';
            setTimeout(function () {
                bar.style.opacity = '0';
                setTimeout(function () {
                    bar.style.transform = 'scaleX(0)';
                }, 250);
            }, 120);
        }
    }

    // ── 2. Content Container Detection ───────────────────────────────
    function getMainContainer(doc) {
        return doc.querySelector('main') ||
            doc.querySelector('#main-content') ||
            doc.querySelector('.service-page-main') ||
            doc.querySelector('.content-wrap') ||
            null;
    }

    function isSameOriginAndInternal(url) {
        try {
            const parsed = new URL(url, window.location.origin);
            if (parsed.origin !== window.location.origin) return false;

            const path = parsed.pathname.toLowerCase();
            // Don't intercept files, downloads, or tools with heavy camera/WASM state
            if (/\.(pdf|zip|jpg|jpeg|png|webp|svg|xml|json|mp4|webm)$/i.test(path)) return false;
            if (path.includes('face-scanner.html') || path.includes('/face-scanner')) return false;

            return true;
        } catch (e) {
            return false;
        }
    }

    // ── 3. Smooth Page Swap & State Update ───────────────────────────
    async function loadPage(targetUrl, pushToHistory = true, hashTarget = null) {
        if (isTransitioning) return;
        isTransitioning = true;
        startLoading();

        try {
            let htmlText = cache.get(targetUrl);
            if (!htmlText) {
                advanceLoading();
                const response = await fetch(targetUrl, {
                    headers: { 'X-Requested-With': 'Kezza-SPA' }
                });

                if (!response.ok) {
                    throw new Error('HTTP ' + response.status);
                }
                htmlText = await response.text();
                // Cache for rapid instant back/forward navigation
                if (cache.size < 30) {
                    cache.set(targetUrl, htmlText);
                }
            }

            const parser = new DOMParser();
            const newDoc = parser.parseFromString(htmlText, 'text/html');

            const currentMain = getMainContainer(document);
            const newMain = getMainContainer(newDoc);

            if (!currentMain || !newMain) {
                // Fallback to normal navigation if structure differs
                window.location.href = targetUrl;
                return;
            }

            // 1. Smooth Fade-out of current view
            if (!prefersReducedMotion) {
                currentMain.style.transition = 'opacity 0.12s ease-out, transform 0.12s ease-out';
                currentMain.style.opacity = '0';
                currentMain.style.transform = 'translateY(4px)';
                await new Promise(r => setTimeout(r, 120));
            }

            // 2. Update Document Head & Metadata
            document.title = newDoc.title || document.title;

            // Update meta description
            const newMetaDesc = newDoc.querySelector('meta[name="description"]');
            const currentMetaDesc = document.querySelector('meta[name="description"]');
            if (newMetaDesc && currentMetaDesc) {
                currentMetaDesc.setAttribute('content', newMetaDesc.getAttribute('content'));
            }

            // Update canonical link
            const newCanonical = newDoc.querySelector('link[rel="canonical"]');
            const currentCanonical = document.querySelector('link[rel="canonical"]');
            if (newCanonical && currentCanonical) {
                currentCanonical.setAttribute('href', newCanonical.getAttribute('href'));
            }

            // 3. Swap Content
            currentMain.parentNode.replaceChild(newMain, currentMain);

            // 4. Update History State
            if (pushToHistory) {
                window.history.pushState({ spa: true, url: targetUrl }, newDoc.title, targetUrl);
            }

            // 5. Scroll Position: To Anchor or Top
            const targetHash = hashTarget || (targetUrl.includes('#') ? '#' + targetUrl.split('#')[1] : null);
            if (targetHash && targetHash.length > 1) {
                let targetId = targetHash.substring(1);
                if (targetId === 'clinics') targetId = 'locations';
                if (targetId === 'why-kezza') targetId = 'about';

                const targetEl = document.getElementById(targetId) ||
                    (targetId === 'about' ? document.querySelector('.why-kezza-section') : null) ||
                    (targetId === 'locations' ? document.querySelector('.kz-branches') : null) ||
                    (targetId === 'contact' ? document.querySelector('.contact-cta-section') : null);

                if (targetEl) {
                    const navbarEl = document.querySelector('.navbar');
                    const offset = (navbarEl ? navbarEl.offsetHeight : 80) + 12;
                    const targetTop = targetEl.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop || 0) - offset;
                    window.scrollTo({
                        top: Math.max(0, Math.round(targetTop)),
                        behavior: prefersReducedMotion ? 'auto' : 'smooth'
                    });
                } else {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                }
            } else {
                window.scrollTo({ top: 0, behavior: 'instant' });
            }

            // 6. Smooth Fade-in of new view
            if (!prefersReducedMotion) {
                newMain.style.opacity = '0';
                newMain.style.transform = 'translateY(6px)';
                newMain.style.transition = 'opacity 0.15s ease-in, transform 0.15s ease-in';
                requestAnimationFrame(function () {
                    newMain.style.opacity = '1';
                    newMain.style.transform = 'translateY(0)';
                });
            }

            // 7. Update Navbar Active Link
            updateNavbarState(targetUrl);

            // 8. Re-initialize page modules
            reinitPageModules();

            // 9. Analytics / GTM event
            if (window.dataLayer && Array.isArray(window.dataLayer)) {
                window.dataLayer.push({
                    event: 'pageview',
                    page: window.location.pathname,
                    title: document.title
                });
            }

            // 10. Custom Event for other scripts
            document.dispatchEvent(new CustomEvent('kezza:page-loaded', { detail: { url: targetUrl } }));

        } catch (err) {
            console.warn('SPA Navigation fallback to hard reload:', err);
            window.location.href = targetUrl;
        } finally {
            finishLoading();
            isTransitioning = false;
        }
    }

    // ── 4. Re-initialization of Page Modules ─────────────────────────
    function reinitPageModules() {
        // Re-calculate smooth scroll limits and back-to-top button
        if (window.KezzaSmoothScroll && typeof window.KezzaSmoothScroll.refresh === 'function') {
            window.KezzaSmoothScroll.refresh();
        }

        // Re-trigger reveal animations if available
        if (window.initProAnimations && typeof window.initProAnimations === 'function') {
            window.initProAnimations();
        }

        // Close mobile drawer if left open
        const navMenu = document.getElementById('navMenu');
        const hamburger = document.getElementById('hamburger');
        const backdrop = document.getElementById('navBackdrop');
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            if (hamburger) hamburger.classList.remove('active');
            if (backdrop) backdrop.classList.remove('active');
            document.body.classList.remove('nav-drawer-open');
            document.documentElement.classList.remove('nav-drawer-open');
        }

        // Update footer year dynamically
        document.querySelectorAll('.footer-year').forEach(function (el) {
            el.textContent = new Date().getFullYear();
        });
    }

    // ── 5. Navbar Active Class Update ────────────────────────────────
    function updateNavbarState(targetUrl) {
        const navMenu = document.getElementById('navMenu');
        if (!navMenu) return;

        let pathname = '';
        try {
            pathname = new URL(targetUrl, window.location.origin).pathname.replace(/\/index\.html$/, '/');
        } catch (e) {
            pathname = targetUrl;
        }

        const isHome = pathname === '/' || pathname === '';
        const links = navMenu.querySelectorAll('a');

        links.forEach(function (a) {
            const href = a.getAttribute('href');
            if (!href) return;

            let linkPath = '';
            try {
                linkPath = new URL(href, window.location.origin).pathname.replace(/\/index\.html$/, '/');
            } catch (e) {
                linkPath = href;
            }

            if (isHome) {
                if (href === '/' || href === '#home') {
                    a.classList.add('active');
                } else if (!a.closest('.services-dropdown-menu')) {
                    a.classList.remove('active');
                }
            } else {
                if (linkPath === pathname && !href.startsWith('#')) {
                    a.classList.add('active');
                } else if (!a.closest('.services-dropdown-menu')) {
                    a.classList.remove('active');
                }
            }
        });
    }

    // ── 6. Click Interception Handler ────────────────────────────────
    function initSpaClickInterception() {
        document.addEventListener('click', function (e) {
            // Don't intercept modified clicks (Cmd/Ctrl + click to open in new tab)
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.defaultPrevented || e[routeEventMarker]) return;

            const link = e.target.closest('a');
            if (!link) return;

            // Don't intercept opt-outs, modals, tabs, or dropdown triggers
            if (link.getAttribute('data-no-spa') === 'true' ||
                link.getAttribute('data-bs-toggle') ||
                link.getAttribute('data-toggle') ||
                link.classList.contains('services-nav-toggle') ||
                link.closest('.services-nav-toggle')) {
                return;
            }

            const href = link.getAttribute('href');
            if (!href || href === '#' || href === 'javascript:void(0)') return;

            // Protocols to ignore
            if (href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('javascript:')) return;

            // Check if internal
            if (!isSameOriginAndInternal(href)) return;

            let targetUrl;
            try {
                targetUrl = new URL(href, window.location.origin);
            } catch (err) {
                return;
            }

            const currentPath = window.location.pathname.replace(/\/index\.html$/, '/');
            const targetPath = targetUrl.pathname.replace(/\/index\.html$/, '/');

            // Case A: Same page with hash -> Handled smoothly by smooth-scroll.js
            if (currentPath === targetPath && targetUrl.hash) {
                return;
            }

            // Case B: Same page with no hash -> Scroll to top smoothly
            if (currentPath === targetPath && !targetUrl.hash) {
                e[routeEventMarker] = true;
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
                return;
            }

            // Case C: Cross-page transition -> Intercept via SPA
            e[routeEventMarker] = true;
            e.preventDefault();
            loadPage(targetUrl.href, true, targetUrl.hash || null);
        }, { passive: false });
    }

    // ── 7. Popstate (Back/Forward Browser Buttons) ────────────────────
    window.addEventListener('popstate', function (e) {
        if (e[routeEventMarker]) return;
        e[routeEventMarker] = true;
        const url = window.location.href;
        loadPage(url, false, window.location.hash || null);
    });

    // ── 8. Initialize on DOM Ready ───────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSpaClickInterception);
    } else {
        initSpaClickInterception();
    }

    // Public API
    window.KezzaSpaRouter = {
        navigate: function (url, hash) {
            loadPage(url, true, hash);
        },
        preload: function (url) {
            if (isSameOriginAndInternal(url) && !cache.has(url)) {
                fetch(url, { headers: { 'X-Requested-With': 'Kezza-SPA' } })
                    .then(r => r.text())
                    .then(html => cache.set(url, html))
                    .catch(() => {});
            }
        }
    };
})();

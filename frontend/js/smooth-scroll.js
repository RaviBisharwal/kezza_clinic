/**
 * Kezza Clinic - Executive Smooth Scrolling & Interaction Engine
 * 
 * 1. Zero Wheel-Hijacking: Native 120Hz/60Hz hardware-accelerated compositor scrolling
 *    (macOS trackpads, Magic Mouse, precision touchpads & touch devices glide with zero stutter)
 * 2. Silky In-Page Anchor Navigation with fixed navbar offset awareness
 * 3. Executive Reading Progress Bar (Signature Kezza Teal-Gold Gradient)
 * 4. Dynamic Navbar Elevation on Scroll (Frosted glassmorphism)
 * 5. Minimalist Luxury Back-to-Top Floating Button
 */

(function () {
    'use strict';

    if (typeof window === 'undefined') return;

    const NAV_OFFSET = 90; // Height of fixed navbar + breathing clearance
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const routeEventMarker = '__kezzaRouteNavigationHandled';

    // ── 1. Silky Smooth Anchor Navigation ────────────────────────────
    function isHomepage() {
        const p = window.location.pathname;
        return p === '/' || p === '/index.html' || p === '' || p.endsWith('/frontend/') || p.endsWith('/frontend/index.html');
    }

    function isCurrentPage(href) {
        try {
            const u = new URL(href, window.location.origin);
            const currentPath = window.location.pathname.replace(/\/index\.html$/, '/');
            const targetPath = u.pathname.replace(/\/index\.html$/, '/');
            return currentPath === targetPath;
        } catch (e) {
            return false;
        }
    }

    function closeMobileDrawer() {
        const navMenu = document.getElementById('navMenu');
        const hamburger = document.getElementById('hamburger');
        const backdrop = document.getElementById('navBackdrop');
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            if (hamburger) {
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
            if (backdrop) backdrop.classList.remove('active');
            document.body.classList.remove('nav-drawer-open');
            document.documentElement.classList.remove('nav-drawer-open');
        }
    }

    function updateActiveNavLink(targetHash) {
        const navMenu = document.getElementById('navMenu');
        if (!navMenu) return;
        const links = navMenu.querySelectorAll('a');
        links.forEach(function (a) {
            const h = a.getAttribute('href');
            if (!h) return;
            const cleanH = h.startsWith('/#') ? h.slice(1) : h;
            const cleanTarget = targetHash.startsWith('/#') ? targetHash.slice(1) : targetHash;

            const isMatch = (cleanH === cleanTarget) ||
                (cleanTarget === '#locations' && (cleanH === '#locations' || cleanH === '#clinics' || cleanH === 'locations/' || cleanH === '/locations/')) ||
                (cleanTarget === '#about' && (cleanH === '#about' || cleanH === '/about/' || cleanH === 'about/')) ||
                (cleanTarget === '#contact' && (cleanH === '#contact' || cleanH === '/contact/' || cleanH === 'contact/')) ||
                (cleanTarget === '#home' && (cleanH === '#home' || cleanH === '/' || cleanH === ''));

            if (isMatch) {
                a.classList.add('active');
            } else if (!a.closest('.services-dropdown-menu') && !a.classList.contains('services-nav-toggle')) {
                a.classList.remove('active');
            }
        });
    }

    function scrollToTargetElement(targetEl, targetHash) {
        if (!targetEl) return;
        let currentOffset = NAV_OFFSET;
        const navbarEl = document.querySelector('.navbar');
        const stickyStripEl = document.querySelector('.service-nav-strip, .sticky-nav');
        if (navbarEl) {
            currentOffset = navbarEl.offsetHeight;
            if (stickyStripEl) {
                currentOffset += stickyStripEl.offsetHeight;
            }
            currentOffset += 12;
        }
        const computedMargin = parseInt(window.getComputedStyle(targetEl).scrollMarginTop, 10);
        if (!isNaN(computedMargin) && computedMargin > 0) {
            currentOffset = computedMargin;
        }

        const targetTop = targetEl.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop || 0) - currentOffset;

        window.scrollTo({
            top: Math.max(0, Math.round(targetTop)),
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });

        if (targetHash && history.pushState) {
            history.pushState(null, null, targetHash);
        }

        if (targetHash) {
            updateActiveNavLink(targetHash);
        }
    }

    function initAnchorGlide() {
        document.addEventListener('click', function (e) {
            const link = e.target.closest('a');
            if (!link) return;

            // Don't intercept if element is inside a modal or tabs controller or has data-no-smooth
            if (link.getAttribute('data-bs-toggle') || link.getAttribute('data-toggle') || link.getAttribute('data-no-smooth')) return;

            const href = link.getAttribute('href');
            if (!href || href === '#' || href === 'javascript:void(0)' || href.startsWith('tel:') || href.startsWith('mailto:')) return;

            let targetId = null;

            // Case 1: Standard anchor link like #locations, #contact, #about, #home
            if (href.startsWith('#') && href.length > 1) {
                targetId = href.substring(1);
            }
            // Case 2: Root relative anchor like /#locations, /#about, /#contact on homepage
            else if ((href.startsWith('/#') || href.startsWith('./#')) && (isHomepage() || isCurrentPage(href))) {
                targetId = href.split('#')[1];
            }
            // Case 3: Same page URL with hash
            else if (href.includes('#') && isCurrentPage(href)) {
                targetId = href.split('#')[1];
            }
            // Case 4: On homepage, map section URLs like about/, locations/, contact/ to in-page sections
            else if (isHomepage()) {
                const cleanHref = href.replace(/^\/+|\/+$/g, '');
                if (cleanHref === 'about' || cleanHref === 'about/index.html') {
                    targetId = 'about';
                } else if (cleanHref === 'locations' || cleanHref === 'locations/index.html' || cleanHref === 'clinics') {
                    targetId = 'locations';
                } else if (cleanHref === 'contact' || cleanHref === 'contact/index.html') {
                    targetId = 'contact';
                } else if (cleanHref === '' || cleanHref === 'index.html') {
                    targetId = 'home';
                }
            }

            if (!targetId) return;

            // Resolve section aliases
            if (targetId === 'clinics') targetId = 'locations';
            if (targetId === 'why-kezza') targetId = 'about';

            let targetEl = document.getElementById(targetId);
            if (!targetEl && targetId === 'about') {
                targetEl = document.querySelector('.why-kezza-section');
            }
            if (!targetEl && targetId === 'locations') {
                targetEl = document.querySelector('.kz-branches');
            }
            if (!targetEl && targetId === 'contact') {
                targetEl = document.querySelector('.contact-cta-section');
            }
            if (!targetEl && targetId === 'home') {
                targetEl = document.querySelector('.hero-section') || document.body;
            }

            if (targetEl) {
                e.preventDefault();
                closeMobileDrawer();
                scrollToTargetElement(targetEl, '#' + targetId);
            }
        }, { passive: false });
    }

    // ── 1b. ScrollSpy for Live Navigation Highlighting ────────────────
    function initScrollSpy() {
        if (!isHomepage()) return;

        const sections = [
            { id: 'home', selector: '#home, .hero-section' },
            { id: 'about', selector: '#about, .why-kezza-section' },
            { id: 'services', selector: '#services, .services-master-section' },
            { id: 'results', selector: '#results, .gallery-section' },
            { id: 'reviews', selector: '#reviews, .testimonials-section' },
            { id: 'locations', selector: '#locations, #clinics, .kz-branches' },
            { id: 'contact', selector: '#contact, .contact-cta-section' }
        ];

        let activeId = 'home';
        let spyTimer = null;

        function updateSpy() {
            const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
            const threshold = scrollY + 180;
            let current = 'home';

            for (let i = 0; i < sections.length; i++) {
                const el = document.querySelector(sections[i].selector);
                if (el) {
                    const top = el.offsetTop;
                    if (threshold >= top) {
                        current = sections[i].id;
                    }
                }
            }

            if (current !== activeId) {
                activeId = current;
                updateActiveNavLink('#' + current);
            }
        }

        window.addEventListener('scroll', function () {
            if (!spyTimer) {
                spyTimer = requestAnimationFrame(function () {
                    updateSpy();
                    spyTimer = null;
                });
            }
        }, { passive: true });

        setTimeout(updateSpy, 250);
    }

    // ── 1c. Initial Hash Smooth Glide on Page Load ───────────────────
    function handleInitialHash() {
        const hash = window.location.hash;
        if (!hash || hash.length <= 1) return;
        setTimeout(function () {
            let targetId = hash.substring(1);
            if (targetId === 'clinics') targetId = 'locations';
            if (targetId === 'why-kezza') targetId = 'about';

            const targetEl = document.getElementById(targetId) ||
                (targetId === 'about' ? document.querySelector('.why-kezza-section') : null) ||
                (targetId === 'locations' ? document.querySelector('.kz-branches') : null) ||
                (targetId === 'contact' ? document.querySelector('.contact-cta-section') : null);

            if (targetEl) {
                scrollToTargetElement(targetEl, hash);
            }
        }, 150);
    }

    // ── 2. Reading Progress Indicator ────────────────────────────────
    let progressBar = null;
    function initProgressBar() {
        if (!document.getElementById('kzScrollProgressStyle')) {
            const style = document.createElement('style');
            style.id = 'kzScrollProgressStyle';
            style.textContent = `
                #kzScrollProgress {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    height: 3px !important;
                    background: linear-gradient(90deg, #00abba 0%, #00c4d6 40%, #00AFC0 85%, #00AFC0 100%) !important;
                    box-shadow: 0 1px 8px rgba(0, 171, 186, 0.45) !important;
                    transform-origin: 0% 50% !important;
                    transform: scaleX(0);
                    z-index: 10002 !important;
                    pointer-events: none !important;
                    will-change: transform !important;
                    transition: opacity 0.25s ease !important;
                }
                #kzBackToTop {
                    position: fixed !important;
                    bottom: 24px !important;
                    left: 24px !important;
                    width: 42px !important;
                    height: 42px !important;
                    border-radius: 50% !important;
                    background: rgba(10, 18, 36, 0.97) !important;
                    border: 1.5px solid rgba(0, 175, 192, 0.5) !important;
                    -webkit-backdrop-filter: none !important;
                    backdrop-filter: none !important;
                    color: #00AFC0 !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    font-size: 14px !important;
                    cursor: pointer !important;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35), 0 0 15px rgba(0, 171, 186, 0.15) !important;
                    opacity: 0 !important;
                    visibility: hidden !important;
                    transform: translateY(12px) translateZ(0) !important;
                    transition: all 0.32s cubic-bezier(0.16, 1, 0.3, 1) !important;
                    z-index: 995 !important;
                    outline: none !important;
                    -webkit-tap-highlight-color: transparent !important;
                    padding: 0 !important;
                    margin: 0 !important;
                }
                #kzBackToTop i {
                    color: #00AFC0 !important;
                    font-size: 14px !important;
                    transition: transform 0.25s ease, color 0.25s ease !important;
                    display: inline-block !important;
                    line-height: 1 !important;
                }
                #kzBackToTop.is-visible {
                    opacity: 1 !important;
                    visibility: visible !important;
                    transform: translateY(0) translateZ(0) !important;
                }
                #kzBackToTop:hover {
                    background: linear-gradient(135deg, #00abba 0%, #008f9c 100%) !important;
                    border-color: #00c4d6 !important;
                    box-shadow: 0 10px 28px rgba(0, 171, 186, 0.5) !important;
                    transform: translateY(-3px) scale(1.06) translateZ(0) !important;
                }
                #kzBackToTop:hover i {
                    color: #ffffff !important;
                    transform: translateY(-1px) !important;
                }
                @media (max-width: 1024px) {
                    #kzBackToTop,
                    #kzBackToTop.is-visible {
                        display: none !important;
                        opacity: 0 !important;
                        visibility: hidden !important;
                        pointer-events: none !important;
                    }
                }
            `;
            (document.head || document.documentElement).appendChild(style);
        }

        if (progressBar) return;
        progressBar = document.getElementById('kzScrollProgress');
        if (!progressBar && document.body) {
            progressBar = document.createElement('div');
            progressBar.id = 'kzScrollProgress';
            progressBar.setAttribute('aria-hidden', 'true');
            document.body.prepend(progressBar);
        }
    }

    // ── 3. Back-to-Top Floating Button ───────────────────────────────
    let backToTopBtn = null;
    function initBackToTop() {
        if (backToTopBtn) return;
        backToTopBtn = document.getElementById('kzBackToTop');
        if (!backToTopBtn && document.body) {
            backToTopBtn = document.createElement('button');
            backToTopBtn.id = 'kzBackToTop';
            backToTopBtn.type = 'button';
            backToTopBtn.setAttribute('aria-label', 'Scroll back to top');
            backToTopBtn.title = 'Back to top';
            backToTopBtn.innerHTML = '<i class="fas fa-chevron-up" aria-hidden="true"></i>';
            document.body.appendChild(backToTopBtn);

            backToTopBtn.addEventListener('click', function (e) {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: prefersReducedMotion ? 'auto' : 'smooth'
                });
            });
        }
    }

    // ── 4. Unified Lightweight Scroll Listener ───────────────────────
    let ticking = false;
    const navbar = document.querySelector('.navbar');
    let cachedMaxScroll = 0;

    function measureMaxScroll() {
        const docH = Math.max(
            document.body ? document.body.scrollHeight : 0,
            document.documentElement ? document.documentElement.scrollHeight : 0
        );
        const winH = window.innerHeight || (document.documentElement ? document.documentElement.clientHeight : 0) || 0;
        cachedMaxScroll = Math.max(0, docH - winH);
    }

    function updateScrollState() {
        if (!progressBar) {
            progressBar = document.getElementById('kzScrollProgress');
        }
        if (!backToTopBtn) {
            backToTopBtn = document.getElementById('kzBackToTop');
        }

        const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

        // If at the very top of the page, initial state is clean with zero layout queries
        if (scrollY === 0) {
            if (progressBar) progressBar.style.opacity = '0';
            if (navbar && navbar.classList.contains('is-scrolled')) navbar.classList.remove('is-scrolled');
            if (backToTopBtn && backToTopBtn.classList.contains('is-visible')) backToTopBtn.classList.remove('is-visible');
            ticking = false;
            return;
        }

        if (cachedMaxScroll <= 0) {
            measureMaxScroll();
        }

        // Update Reading Progress Bar via GPU transform (zero layout thrashing)
        if (progressBar) {
            if (cachedMaxScroll > 10) {
                const progress = Math.min(Math.max(scrollY / cachedMaxScroll, 0), 1);
                progressBar.style.transform = 'scaleX(' + progress.toFixed(4) + ')';
                progressBar.style.opacity = '1';
            } else {
                progressBar.style.opacity = '0';
            }
        }

        // Navbar Scroll Elevation
        if (navbar) {
            if (scrollY > 30) {
                if (!navbar.classList.contains('is-scrolled')) {
                    navbar.classList.add('is-scrolled');
                }
            } else {
                if (navbar.classList.contains('is-scrolled')) {
                    navbar.classList.remove('is-scrolled');
                }
            }
        }

        // Back-to-Top Button Visibility
        if (backToTopBtn) {
            if (scrollY > 350) {
                if (!backToTopBtn.classList.contains('is-visible')) {
                    backToTopBtn.classList.add('is-visible');
                }
            } else {
                if (backToTopBtn.classList.contains('is-visible')) {
                    backToTopBtn.classList.remove('is-visible');
                }
            }
        }

        ticking = false;
    }

    let scrollEndTimer = null;
    function onScroll() {
        if (document.body && !document.body.classList.contains('is-scrolling')) {
            document.body.classList.add('is-scrolling');
        }
        clearTimeout(scrollEndTimer);
        scrollEndTimer = setTimeout(function () {
            if (document.body) {
                document.body.classList.remove('is-scrolling');
            }
        }, 120);

        if (!ticking) {
            requestAnimationFrame(updateScrollState);
            ticking = true;
        }
    }

    let resizeTimer = null;
    function onResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            measureMaxScroll();
            updateScrollState();
        }, 120);
    }

    // ── 5. Seamless Zero-Refresh SPA Page Router ─────────────────────
    const spaCache = new Map();
    let isTransitioning = false;

    function getMainContainer(doc) {
        return doc.querySelector('main') ||
            doc.querySelector('#main-content') ||
            doc.querySelector('.service-page-main') ||
            doc.querySelector('.content-wrap') ||
            null;
    }

    function isInternalHtmlLink(url) {
        try {
            const parsed = new URL(url, window.location.origin);
            if (parsed.origin !== window.location.origin) return false;
            const path = parsed.pathname.toLowerCase();
            if (/\.(pdf|zip|jpg|jpeg|png|webp|svg|xml|json|mp4|webm)$/i.test(path)) return false;
            if (path.includes('face-scanner.html') || path.includes('/face-scanner')) return false;
            return true;
        } catch (e) {
            return false;
        }
    }

    async function loadSpaPage(targetUrl, pushHistory = true, hashTarget = null) {
        if (isTransitioning) return;
        isTransitioning = true;

        if (progressBar) {
            progressBar.style.transition = 'transform 0.25s ease, opacity 0.15s ease';
            progressBar.style.opacity = '1';
            progressBar.style.transform = 'scaleX(0.45)';
        }

        try {
            let htmlText = spaCache.get(targetUrl);
            if (!htmlText) {
                if (progressBar) progressBar.style.transform = 'scaleX(0.75)';
                const res = await fetch(targetUrl, {
                    headers: { 'X-Requested-With': 'Kezza-SPA' }
                });
                if (!res.ok) throw new Error('HTTP ' + res.status);
                htmlText = await res.text();
                if (spaCache.size < 30) spaCache.set(targetUrl, htmlText);
            }

            const parser = new DOMParser();
            const newDoc = parser.parseFromString(htmlText, 'text/html');

            const currentMain = getMainContainer(document);
            const newMain = getMainContainer(newDoc);

            if (!currentMain || !newMain) {
                window.location.href = targetUrl;
                return;
            }

            // 1. Fade out current content
            if (!prefersReducedMotion) {
                currentMain.style.transition = 'opacity 0.12s ease-out, transform 0.12s ease-out';
                currentMain.style.opacity = '0';
                currentMain.style.transform = 'translateY(4px)';
                await new Promise(r => setTimeout(r, 120));
            }

            // 2. Update Document Head
            document.title = newDoc.title || document.title;
            const newMeta = newDoc.querySelector('meta[name="description"]');
            const curMeta = document.querySelector('meta[name="description"]');
            if (newMeta && curMeta) curMeta.setAttribute('content', newMeta.getAttribute('content'));

            const newCanon = newDoc.querySelector('link[rel="canonical"]');
            const curCanon = document.querySelector('link[rel="canonical"]');
            if (newCanon && curCanon) curCanon.setAttribute('href', newCanon.getAttribute('href'));

            // 3. Swap Main Content
            currentMain.parentNode.replaceChild(newMain, currentMain);

            // 4. Update URL History
            if (pushHistory) {
                window.history.pushState({ spa: true, url: targetUrl }, newDoc.title, targetUrl);
            }

            // 5. Scroll Position
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
                    scrollToTargetElement(targetEl, targetHash);
                } else {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                }
            } else {
                window.scrollTo({ top: 0, behavior: 'instant' });
            }

            // 6. Fade in new content
            if (!prefersReducedMotion) {
                newMain.style.opacity = '0';
                newMain.style.transform = 'translateY(6px)';
                newMain.style.transition = 'opacity 0.15s ease-in, transform 0.15s ease-in';
                requestAnimationFrame(function () {
                    newMain.style.opacity = '1';
                    newMain.style.transform = 'translateY(0)';
                });
            }

            // 7. Refresh page state & listeners
            measureMaxScroll();
            updateScrollState();
            closeMobileDrawer();

            if (window.initProAnimations && typeof window.initProAnimations === 'function') {
                window.initProAnimations();
            }

            document.querySelectorAll('.footer-year').forEach(function (el) {
                el.textContent = new Date().getFullYear();
            });

            if (window.dataLayer && Array.isArray(window.dataLayer)) {
                window.dataLayer.push({
                    event: 'pageview',
                    page: window.location.pathname,
                    title: document.title
                });
            }

            document.dispatchEvent(new CustomEvent('kezza:page-loaded', { detail: { url: targetUrl } }));

        } catch (err) {
            console.warn('SPA Navigation fallback to native:', err);
            window.location.href = targetUrl;
        } finally {
            if (progressBar) {
                progressBar.style.transform = 'scaleX(1)';
                setTimeout(function () {
                    progressBar.style.opacity = '0';
                    setTimeout(function () {
                        progressBar.style.transform = 'scaleX(0)';
                    }, 250);
                }, 120);
            }
            isTransitioning = false;
        }
    }

    function initSpaRouter() {
        document.addEventListener('click', function (e) {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.defaultPrevented || e[routeEventMarker]) return;

            const link = e.target.closest('a');
            if (!link) return;

            if (link.getAttribute('data-no-spa') === 'true' ||
                link.getAttribute('data-bs-toggle') ||
                link.getAttribute('data-toggle') ||
                link.classList.contains('services-nav-toggle') ||
                link.closest('.services-nav-toggle')) {
                return;
            }

            const href = link.getAttribute('href');
            if (!href || href === '#' || href === 'javascript:void(0)' || href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('whatsapp:')) return;

            if (!isInternalHtmlLink(href)) return;

            let targetUrl;
            try {
                targetUrl = new URL(href, window.location.origin);
            } catch (err) {
                return;
            }

            const currentPath = window.location.pathname.replace(/\/index\.html$/, '/');
            const targetPath = targetUrl.pathname.replace(/\/index\.html$/, '/');

            // If on same page and clicking an anchor -> smooth-scroll handles it
            if (currentPath === targetPath && targetUrl.hash) {
                return;
            }

            // If clicking the current page with no hash -> smoothly scroll to top
            if (currentPath === targetPath && !targetUrl.hash) {
                e[routeEventMarker] = true;
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
                return;
            }

            // Cross-page navigation -> load via SPA
            e[routeEventMarker] = true;
            e.preventDefault();
            loadSpaPage(targetUrl.href, true, targetUrl.hash || null);
        }, { passive: false });

        window.addEventListener('popstate', function (event) {
            if (event[routeEventMarker]) return;
            event[routeEventMarker] = true;
            loadSpaPage(window.location.href, false, window.location.hash || null);
        });
    }

    // Initialise on DOM Ready
    function initScrollSuite() {
        initAnchorGlide();
        initProgressBar();
        initBackToTop();
        initScrollSpy();
        handleInitialHash();
        // Cross-page routing and browser history are owned by soft-navigation.js.
        // Keeping a second SPA click/popstate handler here caused Back to lose scroll state.
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScrollSuite);
    } else {
        initScrollSuite();
    }

    window.addEventListener('load', measureMaxScroll, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize, { passive: true });

    // Public API
    window.KezzaSmoothScroll = {
        refresh: function () {
            measureMaxScroll();
            updateScrollState();
        },
        scrollTo: function (y) {
            window.scrollTo({
                top: Math.max(0, y),
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
        },
        scrollToElement: function (selector) {
            const el = document.querySelector(selector);
            if (el) {
                const targetTop = el.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop || 0) - NAV_OFFSET;
                window.scrollTo({
                    top: Math.max(0, Math.round(targetTop)),
                    behavior: prefersReducedMotion ? 'auto' : 'smooth'
                });
            }
        }
    };
})();

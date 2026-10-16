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

    // ── 1. Silky Smooth Anchor Navigation ──────────────────────────────────────────────
    // Cache navbar height once on first anchor click or resize — never measure layout on page load
    var _cachedNavH = NAV_OFFSET;
    var _navHTimer = null;
    function _refreshNavH() {
        var nb = document.querySelector('.navbar');
        var strip = document.querySelector('.service-nav-strip, .sticky-nav');
        if (nb) {
            _cachedNavH = nb.getBoundingClientRect().height || NAV_OFFSET;
            if (strip && strip.offsetParent !== null) _cachedNavH += strip.getBoundingClientRect().height || 0;
            _cachedNavH += 12;
        }
    }
    window.addEventListener('resize', function() { clearTimeout(_navHTimer); _navHTimer = setTimeout(_refreshNavH, 150); }, { passive: true });

    function initAnchorGlide() {
        document.addEventListener('click', function (e) {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;

            const hash = link.getAttribute('href');
            if (!hash || hash === '#' || hash.length <= 1) return;

            // Don't intercept if element is inside a modal or tabs controller
            if (link.getAttribute('data-bs-toggle') || link.getAttribute('data-toggle')) return;

            try {
                const targetEl = document.querySelector(hash);
                if (targetEl) {
                    e.preventDefault();
                    if (_cachedNavH === NAV_OFFSET) _refreshNavH();
                    let currentOffset = _cachedNavH;
                    const computedMargin = parseInt(window.getComputedStyle(targetEl).scrollMarginTop, 10);
                    if (!isNaN(computedMargin) && computedMargin > 0) {
                        currentOffset = computedMargin;
                    }

                    const targetTop = targetEl.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop || 0) - currentOffset;

                    window.scrollTo({
                        top: Math.max(0, Math.round(targetTop)),
                        behavior: prefersReducedMotion ? 'auto' : 'smooth'
                    });

                    // Update URL cleanly without jump
                    if (history.pushState) {
                        history.pushState(null, null, hash);
                    }
                }
            } catch (err) {
                // Ignore selector syntax errors for malformed hashes
            }
        }, { passive: false });
    }

    // ── 2. Reading Progress Indicator & Back-to-Top Button (Lazy Created on 1st Scroll) ──
    let progressBar = null;
    let backToTopBtn = null;
    let widgetsInitialized = false;

    function lazyInitWidgets() {
        if (widgetsInitialized) return;
        widgetsInitialized = true;

        if (!progressBar) {
            progressBar = document.getElementById('kzScrollProgress');
            if (!progressBar && document.body) {
                progressBar = document.createElement('div');
                progressBar.id = 'kzScrollProgress';
                progressBar.setAttribute('aria-hidden', 'true');
                document.body.prepend(progressBar);
            }
        }

        if (!backToTopBtn) {
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
    }

    // ── 3. Unified Lightweight Scroll Listener ───────────────────────
    let ticking = false;
    let cachedMaxScroll = 0;
    const navbar = document.querySelector('.navbar');

    function getMaxScroll() {
        if (cachedMaxScroll > 0) return cachedMaxScroll;
        cachedMaxScroll = Math.max(
            document.body ? document.body.scrollHeight : 0,
            document.documentElement ? document.documentElement.scrollHeight : 0
        ) - window.innerHeight;
        return cachedMaxScroll;
    }

    function updateScrollState() {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

        // If at the very top of the page, avoid querying scrollHeight/layout entirely
        if (scrollY <= 0) {
            if (progressBar) {
                progressBar.style.transform = 'scaleX(0)';
                progressBar.style.opacity = '0';
            }
            if (navbar && navbar.classList.contains('is-scrolled')) {
                navbar.classList.remove('is-scrolled');
            }
            if (backToTopBtn && backToTopBtn.classList.contains('is-visible')) {
                backToTopBtn.classList.remove('is-visible');
            }
            ticking = false;
            return;
        }

        const maxScroll = getMaxScroll();

        // Update Reading Progress Bar via GPU transform
        if (progressBar) {
            if (maxScroll > 10) {
                const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
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

    function onScroll() {
        if (!widgetsInitialized) lazyInitWidgets();
        if (!ticking) {
            requestAnimationFrame(updateScrollState);
            ticking = true;
        }
    }

    function onResize() {
        cachedMaxScroll = 0; // invalidate cached document height
        onScroll();
    }

    function boot() {
        initAnchorGlide();
        const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        if (scrollY > 0) {
            lazyInitWidgets();
            requestAnimationFrame(updateScrollState);
        }
    }

    // Initialise on DOM Ready without synchronous layout measurement
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    // Public API
    window.KezzaSmoothScroll = {
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

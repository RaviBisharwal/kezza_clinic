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

    // ── 1. Silky Smooth Anchor Navigation ────────────────────────────
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
                    const targetTop = targetEl.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop || 0) - NAV_OFFSET;

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
                    background: rgba(10, 18, 36, 0.94) !important;
                    border: 1.5px solid rgba(0, 175, 192, 0.5) !important;
                    backdrop-filter: blur(12px) !important;
                    -webkit-backdrop-filter: blur(12px) !important;
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
                @media (max-width: 768px) {
                    #kzBackToTop {
                        bottom: 84px !important;
                        left: 16px !important;
                        width: 38px !important;
                        height: 38px !important;
                    }
                    #kzBackToTop i {
                        font-size: 13px !important;
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

    function updateScrollState() {
        if (!progressBar) {
            progressBar = document.getElementById('kzScrollProgress');
        }
        if (!backToTopBtn) {
            backToTopBtn = document.getElementById('kzBackToTop');
        }

        const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        const maxScroll = Math.max(
            document.body ? document.body.scrollHeight : 0,
            document.documentElement ? document.documentElement.scrollHeight : 0
        ) - window.innerHeight;

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
        if (!ticking) {
            requestAnimationFrame(updateScrollState);
            ticking = true;
        }
    }

    // Initialise on DOM Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            initAnchorGlide();
            initProgressBar();
            initBackToTop();
            updateScrollState();
        });
    } else {
        initAnchorGlide();
        initProgressBar();
        initBackToTop();
        updateScrollState();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

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

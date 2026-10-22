/**
 * Kezza Hair & Skin Clinic — Professional Animation & Micro-Interaction Suite
 * High-performance, zero-dependency, 60fps GPU-accelerated motion engine:
 * 1. Intelligent IntersectionObserver scroll-driven reveal with automatic grid stagger
 * 2. Real-time reading depth scroll progress bar
 * 3. Eased live count-up animation for clinical metrics & statistics
 * 4. Interactive 3D perspective tilt on desktop cards
 * 5. Glassmorphism navbar state on scroll
 * 6. Interactive Before & After comparison slider (Touch + Mouse)
 * 7. Testimonial category filters with spring transitions
 * 8. Full accessibility compliance (prefers-reduced-motion)
 */

(function () {
    'use strict';

    function initAnimationSuite() {
        initScrollProgressBar();
        initNavbarScrollEffect();
        initScrollReveal();
        initCountUpStats();
        initInteractiveTilt();
        initBeforeAfterSlider();
        initTestimonialFilters();
        initOffscreenPause();
    }

    /* ── 0. Pause looping animations (hero slideshow, trust ticker) while they
            are scrolled out of view — they kept the phone busy for nothing. ── */
    function initOffscreenPause() {
        if (!('IntersectionObserver' in window)) return;
        const targets = document.querySelectorAll('.hero-section, .hero-slideshow, .kz-trust-strip, [data-pause-offscreen]');
        if (!targets.length) return;
        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => entry.target.classList.toggle('kz-offscreen', !entry.isIntersecting));
        }, { rootMargin: '80px 0px' });
        targets.forEach(t => io.observe(t));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAnimationSuite);
    } else {
        initAnimationSuite();
    }

    /* ── 1. Top Reading Scroll Progress Bar ── */
    function initScrollProgressBar() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (document.getElementById('kz-scroll-progress')) return;
        // smooth-scroll.js already draws the reading-progress bar on pages that load it.
        if (document.getElementById('kzScrollProgress') || window.KezzaSmoothScroll) return;

        const progressBar = document.createElement('div');
        progressBar.id = 'kz-scroll-progress';
        progressBar.setAttribute('aria-hidden', 'true');
        document.body.appendChild(progressBar);

        let ticking = false;
        let cachedDocHeight = 0;
        function measureDocHeight() {
            cachedDocHeight = Math.max(0, document.documentElement.scrollHeight - document.documentElement.clientHeight);
        }

        function updateProgress() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop === 0) {
                ticking = false;
                return;
            }
            if (cachedDocHeight <= 0) {
                measureDocHeight();
            }
            if (cachedDocHeight > 0) {
                const percent = Math.min(100, Math.max(0, (scrollTop / cachedDocHeight) * 100));
                progressBar.style.width = '100%';
                progressBar.style.transformOrigin = '0 50%';
                progressBar.style.transform = 'scaleX(' + (percent / 100).toFixed(4) + ')';
            }
            ticking = false;
        }

        let resizeTimer = null;
        function onResize() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                measureDocHeight();
                updateProgress();
            }, 120);
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(updateProgress);
                ticking = true;
            }
        }, { passive: true });
        window.addEventListener('resize', onResize, { passive: true });
        window.addEventListener('orientationchange', onResize, { passive: true });
        window.addEventListener('load', measureDocHeight, { passive: true });
    }

    /* ── 2. Glassmorphic Navbar Dynamic Scroll State ── */
    function initNavbarScrollEffect() {
        if (window.KezzaSmoothScroll) return; // smooth-scroll.js already handles navbar scroll state cleanly
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        let ticking = false;
        function checkNav() {
            const top = window.pageYOffset || document.documentElement.scrollTop;
            if (top > 30) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(checkNav);
                ticking = true;
            }
        }, { passive: true });
        checkNav();
    }

    /* ── 3. Scroll-Driven Reveal Engine with Auto-Stagger ── */
    function initScrollReveal() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.querySelectorAll('.pro-reveal, .pro-reveal-scale, .pro-reveal-left, .pro-reveal-right')
                .forEach(el => el.classList.add('is-revealed'));
            return;
        }

        // Auto-enrich key sections and card grids across all pages
        const cardSelectors = [
            // Headings and Section Intros
            '.dc-center-head', '.sm-center-head', '.section-header', '.kz-center-head',
            '.services-section-header', '.explainer-text', '.viewer-header',
            
            // Clinical Verdict & Highlight Callouts
            '.dc-verdict-box', '.sm-verdict-box', '.verdict-box', '.explainer-in-short',
            
            // Grids & Cards
            '.dc-treatment-card', '.sm-treatment-card', '.treatment-card', '.benefit-card',
            '.service-card', '.category-card', '.related-service-card',
            
            // Steps & Journey Cards
            '.dc-step-card', '.sm-step-card', '.step-card', '.process-step', '.journey-step',
            
            // Causes & Candidacy Cards
            '.dc-cause-card', '.sm-cause-card', '.cause-card', '.candidacy-card',
            
            // Metrics & Stats
            '.dc-metric-card', '.sm-metric-card', '.stat-box', '.stat-box-pro', '.confidence-item',
            
            // Branches & Locations
            '.dc-branch-card', '.sm-branch-card', '.branch-card', '.kz-branch',
            
            // Reviews & Testimonials
            '.dc-review-card', '.sm-review-card', '.patient-comment-card', '.testi-card-pro',
            
            // Showcases & Media
            '.dc-ba-card', '.sm-ba-card', '.service-media-frame', '.explainer-media',
            '.ba-slider-container', '.dc-hero-media-wrap', '.sm-hero-media-wrap',
            
            // Interactive tabs & viewers
            '.dc-tab-panel', '.sm-tab-panel', '.services-interactive-viewer',
            
            // FAQs
            '.dc-faq-item', '.sm-faq-item', '.kz-faq-item',
            
            // Bottom banners
            '.dc-bottom-cta-banner', '.sm-bottom-cta-banner', '.contact-cta-section'
        ];

        // Process elements and assign stagger delays based on sibling index
        const allTargetCards = document.querySelectorAll(cardSelectors.join(', '));
        allTargetCards.forEach(el => {
            if (!el.classList.contains('pro-reveal') && !el.classList.contains('pro-reveal-scale')) {
                // Large hero image wraps and Before/After cards get scale reveal
                if (
                    el.classList.contains('dc-hero-media-wrap') ||
                    el.classList.contains('sm-hero-media-wrap') ||
                    el.classList.contains('dc-ba-card') ||
                    el.classList.contains('sm-ba-card') ||
                    el.classList.contains('dc-verdict-box') ||
                    el.classList.contains('sm-verdict-box')
                ) {
                    el.classList.add('pro-reveal-scale');
                } else {
                    el.classList.add('pro-reveal');
                }

                // If in a parent grid, assign a stagger class
                const parent = el.parentElement;
                if (parent && parent.children.length > 1) {
                    const idx = Array.prototype.indexOf.call(parent.children, el);
                    const staggerNum = (idx % 6) + 1;
                    el.classList.add('stagger-' + staggerNum);
                }
            }
        });

        const reveals = document.querySelectorAll('.pro-reveal, .pro-reveal-scale, .pro-reveal-left, .pro-reveal-right');
        if (!reveals.length) return;

        if ('IntersectionObserver' in window) {
            const revealObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-revealed');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                root: null,
                threshold: 0.05,
                rootMargin: '120px 0px 40px 0px'
            });

            reveals.forEach(el => {
                revealObserver.observe(el);
            });
        } else {
            reveals.forEach(el => el.classList.add('is-revealed'));
        }
    }

    /* ── 4. Live Count-Up Animation for Metrics & Stats ── */
    function initCountUpStats() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        // Auto-tag numeric stats that don't have data-count
        const autoStatElements = document.querySelectorAll('.dc-metric-value, .sm-metric-value, .stat-box .stat-num');
        autoStatElements.forEach(el => {
            if (!el.hasAttribute('data-count')) {
                const text = el.textContent.trim();
                // Check if text starts with or contains numbers e.g. "98%", "3-6", "30-60", "70%+", "10,000+"
                const match = text.match(/^(\d+(?:,\d+)?)/);
                if (match && !text.includes('–') && !text.includes('-')) {
                    const num = parseInt(match[1].replace(/,/g, ''), 10);
                    if (num > 0) {
                        const suffix = text.slice(match[0].length);
                        el.setAttribute('data-count', num);
                        el.setAttribute('data-suffix', suffix);
                        el.classList.add('stat-number-pro');
                    }
                }
            }
        });

        const statElements = document.querySelectorAll('.stat-number-pro[data-count]');
        if (!statElements.length) return;

        function animateSingleCounter(el) {
            const target = parseInt(el.getAttribute('data-count'), 10) || 0;
            const prefix = el.getAttribute('data-prefix') || '';
            const suffix = el.getAttribute('data-suffix') || '';
            const duration = 1600; // ms
            const startTime = performance.now();

            function easeOutExpo(x) {
                return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
            }

            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const currentVal = Math.floor(easeOutExpo(progress) * target);

                el.textContent = `${prefix}${currentVal.toLocaleString()}${suffix}`;

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    el.textContent = `${prefix}${target.toLocaleString()}${suffix}`;
                }
            }

            requestAnimationFrame(updateCounter);
        }

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateSingleCounter(entry.target);
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15 });

            statElements.forEach(el => observer.observe(el));
        } else {
            statElements.forEach(el => animateSingleCounter(el));
        }
    }

    /* ── 5. Interactive 3D Perspective Tilt on Desktop Cards ── */
    function initInteractiveTilt() {
        if (window.matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches) return;

        const tiltElements = document.querySelectorAll(
            '.stat-box-pro, .dc-metric-card, .sm-metric-card, .dc-treatment-card, .sm-treatment-card, .benefit-card'
        );
        if (!tiltElements.length) return;

        tiltElements.forEach(card => {
            let isHovered = false;
            let cardRect = null;

            card.addEventListener('mouseenter', () => {
                isHovered = true;
                cardRect = card.getBoundingClientRect();
                card.style.transition = 'transform 0.12s ease-out, box-shadow 0.25s ease, border-color 0.25s ease';
            });

            card.addEventListener('mousemove', e => {
                if (!isHovered || (document.body && document.body.classList.contains('is-scrolling'))) return;
                if (!cardRect) {
                    cardRect = card.getBoundingClientRect();
                }
                const x = e.clientX - cardRect.left;
                const y = e.clientY - cardRect.top;
                const centerX = cardRect.width / 2;
                const centerY = cardRect.height / 2;

                // Subtle micro-tilt angle max ±5 degrees
                const rotateX = ((y - centerY) / centerY) * -5;
                const rotateY = ((x - centerX) / centerX) * 5;

                card.style.transform = `perspective(900px) translateY(-7px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
            });

            card.addEventListener('mouseleave', () => {
                isHovered = false;
                cardRect = null;
                card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease, border-color 0.35s ease';
                card.style.transform = '';
            });
        });
    }

    /* ── 6. Interactive Before/After Transformation Slider ── */
    function initBeforeAfterSlider() {
        const container = document.querySelector('.ba-slider-container');
        if (!container) return;

        const beforeWrap = container.querySelector('.ba-img-before-wrap');
        const divider = container.querySelector('.ba-divider');
        const beforeImg = beforeWrap ? beforeWrap.querySelector('img') : null;

        if (!beforeWrap || !divider || !beforeImg) return;

        let isDragging = false;
        let cachedSliderRect = null;

        function applyDimensions(w, h) {
            if (beforeImg && w > 0 && h > 0) {
                beforeImg.style.width = Math.round(w) + 'px';
                beforeImg.style.height = Math.round(h) + 'px';
            }
        }

        if (window.ResizeObserver) {
            const ro = new ResizeObserver(entries => {
                for (const entry of entries) {
                    if (entry.contentRect && entry.contentRect.width > 0) {
                        applyDimensions(entry.contentRect.width, entry.contentRect.height);
                    }
                }
            });
            ro.observe(container);
        } else {
            function syncFallback() {
                const rect = container.getBoundingClientRect();
                applyDimensions(rect.width, rect.height);
            }
            window.addEventListener('resize', syncFallback);
            window.addEventListener('orientationchange', syncFallback);
            beforeImg.addEventListener('load', syncFallback);
            requestAnimationFrame(syncFallback);
        }

        function setPosition(xPos) {
            if (!cachedSliderRect) {
                cachedSliderRect = container.getBoundingClientRect();
            }
            const rect = cachedSliderRect;
            let offsetX = xPos - rect.left;

            const minX = rect.width * 0.05;
            const maxX = rect.width * 0.95;
            offsetX = Math.max(minX, Math.min(offsetX, maxX));

            const percentage = (offsetX / rect.width) * 100;
            beforeWrap.style.width = percentage + '%';
            divider.style.left = percentage + '%';
            const handle = divider.querySelector('.ba-handle');
            if (handle) {
                handle.setAttribute('aria-valuenow', String(Math.round(percentage)));
            }
        }

        function getClientX(e) {
            if (e.clientX !== undefined) return e.clientX;
            if (e.touches && e.touches.length > 0) return e.touches[0].clientX;
            if (e.changedTouches && e.changedTouches.length > 0) return e.changedTouches[0].clientX;
            return null;
        }

        function onPointerDown(e) {
            isDragging = true;
            cachedSliderRect = container.getBoundingClientRect();
            container.style.cursor = 'ew-resize';
            const clientX = getClientX(e);
            if (clientX !== null) setPosition(clientX);
        }

        function onPointerMove(e) {
            if (!isDragging) return;
            const clientX = getClientX(e);
            if (clientX !== null) setPosition(clientX);
        }

        function onPointerUp() {
            isDragging = false;
            cachedSliderRect = null;
            container.style.cursor = 'default';
        }

        container.addEventListener('mousedown', onPointerDown);
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);

        container.addEventListener('touchstart', onPointerDown, { passive: true });
        window.addEventListener('touchmove', onPointerMove, { passive: true });
        window.addEventListener('touchend', onPointerUp, { passive: true });
        window.addEventListener('touchcancel', onPointerUp, { passive: true });
    }

    /* ── 7. Testimonial Category Filters ── */
    function initTestimonialFilters() {
        const filterBtns = document.querySelectorAll('.testi-filter-btn');
        const cards = document.querySelectorAll('.testi-card-pro');
        if (!filterBtns.length || !cards.length) return;

        filterBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                const filter = this.getAttribute('data-filter');
                if (!filter) return;

                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                let visibleIndex = 0;
                cards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    const shouldShow = (filter === 'all' || category === filter);

                    if (shouldShow) {
                        card.style.display = 'flex';
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(12px)';
                        setTimeout(() => {
                            card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, visibleIndex * 45);
                        visibleIndex++;
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

})();

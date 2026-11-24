/**
 * Kezza Clinic — Home Page Upgrade
 * Progressive enhancements layered on top of the existing scripts. Every block
 * bails out quietly if its markup is absent, so this file is safe to include on
 * any page. Count-up stats and the before/after drag live in pro-animations.js;
 * this file only ADDS keyboard access and ARIA to that slider.
 */
(function () {
    'use strict';

    /* ── 1. Services: reveal the remaining treatments (phones only) ────── */
    function initServicesReveal() {
        var viewer = document.getElementById('servicesViewer');
        var btn = document.getElementById('servicesMoreBtn');
        if (!viewer || !btn) return;

        btn.addEventListener('click', function () {
            var collapsed = viewer.classList.toggle('kz-svc-collapsed');
            btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
            btn.innerHTML = (collapsed ? 'View All Treatments' : 'Show Fewer Treatments') +
                ' <i class="fas fa-arrow-down" aria-hidden="true"></i>';
        });

        // Switching category tabs re-collapses so the button stays truthful
        document.querySelectorAll('.viewer-tabs-nav [data-category], .service-category-card').forEach(function (t) {
            t.addEventListener('click', function () {
                viewer.classList.add('kz-svc-collapsed');
                btn.setAttribute('aria-expanded', 'false');
                btn.innerHTML = 'View All Treatments <i class="fas fa-arrow-down" aria-hidden="true"></i>';
            });
        });
    }

    /* ── 1b. Verticals Carousel: horizontal scroll tracks, arrows, drag, and sticky nav ── */
    function initVerticalsCarousel() {
        var tracks = document.querySelectorAll('.kz-cards-scroll-track');
        if (!tracks.length) return;

        tracks.forEach(function (track) {
            var container = track.closest('.kz-cards-scroll-container') || track.parentElement;
            var verticalBlock = track.closest('.kz-vertical-block');
            var prevBtn = verticalBlock ? verticalBlock.querySelector('.kz-scroll-prev') : null;
            var nextBtn = verticalBlock ? verticalBlock.querySelector('.kz-scroll-next') : null;
            var progressBar = container ? container.querySelector('.kz-scroll-progress-fill') : null;

            function getScrollAmount() {
                var firstCard = track.querySelector('.treatment-item-card');
                return firstCard ? (firstCard.offsetWidth + 22) : 340;
            }

            function updateControls() {
                var maxScroll = track.scrollWidth - track.clientWidth;
                if (prevBtn) {
                    var atStart = track.scrollLeft <= 5;
                    prevBtn.disabled = atStart;
                    prevBtn.style.opacity = atStart ? '0.35' : '1';
                    prevBtn.style.pointerEvents = atStart ? 'none' : 'auto';
                }
                if (nextBtn) {
                    var atEnd = track.scrollLeft >= maxScroll - 5;
                    nextBtn.disabled = atEnd;
                    nextBtn.style.opacity = atEnd ? '0.35' : '1';
                    nextBtn.style.pointerEvents = atEnd ? 'none' : 'auto';
                }
                if (progressBar && maxScroll > 0) {
                    var pct = Math.min(100, Math.max(16, (track.scrollLeft / maxScroll) * 100));
                    progressBar.style.width = pct + '%';
                }
            }

            if (prevBtn) {
                prevBtn.addEventListener('click', function () {
                    track.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
                });
            }
            if (nextBtn) {
                nextBtn.addEventListener('click', function () {
                    track.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
                });
            }

            track.addEventListener('scroll', function () {
                requestAnimationFrame(updateControls);
            }, { passive: true });

            // Mouse Drag to Scroll
            var isDown = false;
            var startX = 0;
            var scrollLeftStart = 0;

            track.addEventListener('mousedown', function (e) {
                if (e.target.closest('a, button')) return;
                isDown = true;
                track.classList.add('is-dragging');
                startX = e.pageX - track.offsetLeft;
                scrollLeftStart = track.scrollLeft;
            });
            window.addEventListener('mouseup', function () {
                if (isDown) {
                    isDown = false;
                    track.classList.remove('is-dragging');
                }
            });
            track.addEventListener('mousemove', function (e) {
                if (!isDown) return;
                e.preventDefault();
                var x = e.pageX - track.offsetLeft;
                var walk = (x - startX) * 1.4;
                track.scrollLeft = scrollLeftStart - walk;
            });

            updateControls();
        });

        // Tab switching: Show ONLY the selected vertical
        var navBtns = document.querySelectorAll('.kz-vnav-btn[data-tab]');
        var verticalBlocks = document.querySelectorAll('.kz-vertical-block[data-vertical]');

        function switchVerticalTab(tabName) {
            navBtns.forEach(function (btn) {
                var isActive = btn.getAttribute('data-tab') === tabName;
                btn.classList.toggle('active', isActive);
                btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });

            verticalBlocks.forEach(function (block) {
                var isActive = block.getAttribute('data-vertical') === tabName;
                block.classList.toggle('active', isActive);
                if (isActive) {
                    var track = block.querySelector('.kz-cards-scroll-track');
                    if (track) {
                        setTimeout(function () {
                            track.dispatchEvent(new Event('scroll'));
                        }, 50);
                    }
                }
            });
        }

        navBtns.forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                var tab = btn.getAttribute('data-tab');
                if (tab) {
                    switchVerticalTab(tab);
                }
            });
        });
    }

    /* ── 2. Before/After slider: keyboard + ARIA ───────────────────────────
       pro-animations.js already handles mouse and touch. This adds the
       accessible half without touching that logic.                          */
    function initComparisonA11y() {
        var container = document.querySelector('.ba-slider-container');
        if (!container) return;

        var beforeWrap = container.querySelector('.ba-img-before-wrap');
        var divider = container.querySelector('.ba-divider');
        var handle = container.querySelector('.ba-handle');
        if (!beforeWrap || !divider || !handle) return;

        handle.setAttribute('role', 'slider');
        handle.setAttribute('tabindex', '0');
        handle.setAttribute('aria-label', 'Before and after comparison. Use the left and right arrow keys to reveal more of each image.');
        handle.setAttribute('aria-valuemin', '5');
        handle.setAttribute('aria-valuemax', '95');
        handle.setAttribute('aria-valuenow', '50');
        handle.setAttribute('aria-orientation', 'horizontal');

        function currentPct() {
            var v = parseFloat(beforeWrap.style.width);
            return isNaN(v) ? 50 : v;
        }

        function setPct(pct) {
            pct = Math.max(5, Math.min(95, pct));
            beforeWrap.style.width = pct + '%';
            divider.style.left = pct + '%';
            handle.setAttribute('aria-valuenow', String(Math.round(pct)));
        }

        handle.addEventListener('keydown', function (e) {
            var step = e.shiftKey ? 10 : 2;
            var pct = currentPct();

            switch (e.key) {
                case 'ArrowLeft':
                case 'ArrowDown':  setPct(pct - step); break;
                case 'ArrowRight':
                case 'ArrowUp':    setPct(pct + step); break;
                case 'Home':       setPct(5);  break;
                case 'End':        setPct(95); break;
                case 'PageDown':   setPct(pct - 10); break;
                case 'PageUp':     setPct(pct + 10); break;
                default: return;
            }
            e.preventDefault();
        });
    }

    /* ── 3. FAQ accordion ──────────────────────────────────────────────── */
    function initFaq() {
        var items = document.querySelectorAll('.kz-faq-item');
        if (!items.length) return;

        items.forEach(function (item) {
            var btn = item.querySelector('.kz-faq-q');
            var panel = item.querySelector('.kz-faq-a');
            if (!btn || !panel) return;

            btn.addEventListener('click', function () {
                var isOpen = item.classList.contains('is-open');

                // Single-open accordion
                items.forEach(function (other) {
                    other.classList.remove('is-open');
                    var ob = other.querySelector('.kz-faq-q');
                    if (ob) ob.setAttribute('aria-expanded', 'false');
                });

                if (!isOpen) {
                    item.classList.add('is-open');
                    btn.setAttribute('aria-expanded', 'true');
                }
            });
        });
    }

    /* ── 4. Auto-dismiss the chat teaser so it stops covering content ──── */
    function initTeaserAutoDismiss() {
        var tries = 0;
        var timer = setInterval(function () {
            tries++;
            var tip = document.querySelector('.kezza-chat-tooltip');
            if (tip) {
                clearInterval(timer);
                setTimeout(function () {
                    tip.style.transition = 'opacity .4s ease, transform .4s ease';
                    tip.style.opacity = '0';
                    tip.style.transform = 'translateY(8px)';
                    setTimeout(function () {
                        if (tip.parentNode) tip.style.display = 'none';
                    }, 420);
                }, 7000);
            }
            if (tries > 40) clearInterval(timer);
        }, 500);
    }

    /* ── 5. Branch clinic locations filter tabs ──────────────────────── */
    function initBranchFilters() {
        var filterBtns = document.querySelectorAll('.kz-visit-pill-btn');
        var branches = document.querySelectorAll('.kz-branch-grid .kz-branch');
        if (!filterBtns.length || !branches.length) return;

        filterBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var city = this.getAttribute('data-city') || 'all';

                filterBtns.forEach(function (b) { b.classList.remove('active'); });
                this.classList.add('active');

                branches.forEach(function (branch) {
                    var branchCity = branch.getAttribute('data-city');
                    if (city === 'all' || branchCity === city) {
                        branch.style.display = 'flex';
                        branch.style.opacity = '0';
                        branch.style.transform = 'translateY(12px)';
                        setTimeout(function () {
                            branch.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
                            branch.style.opacity = '1';
                            branch.style.transform = 'translateY(0)';
                        }, 25);
                    } else {
                        branch.style.display = 'none';
                    }
                });
            });
        });
    }

    function boot() {
        initServicesReveal();
        initVerticalsCarousel();
        initComparisonA11y();
        initFaq();
        initTeaserAutoDismiss();
        initBranchFilters();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();

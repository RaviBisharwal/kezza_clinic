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

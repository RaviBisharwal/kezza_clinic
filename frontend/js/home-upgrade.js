/**
 * Kezza Clinic — Home Page Upgrade
 * Progressive enhancements layered on top of the existing scripts. Every block
 * bails out quietly if its markup is absent, so this file is safe to include on
 * any page. Nothing here replaces existing behaviour:
 *   - Count-up stats and the before/after drag already live in pro-animations.js.
 *     This file only ADDS keyboard access and ARIA to that slider.
 *   - Doctor filtering also lives in pro-animations.js and keeps working; the
 *     "View All" collapse is released the moment a filter is used.
 */
(function () {
    'use strict';

    var reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── 1. Doctors: reveal the remaining specialists ──────────────────── */
    function initDoctorsReveal() {
        var grid = document.getElementById('doctorsGrid');
        var btn = document.getElementById('doctorsMoreBtn');
        if (!grid || !btn) return;

        var total = grid.querySelectorAll('.doctor-card').length;
        var labelEl = btn;

        function expand() {
            if (!grid.classList.contains('kz-collapsed')) return;
            grid.classList.remove('kz-collapsed');
            btn.setAttribute('aria-expanded', 'true');
            labelEl.innerHTML = 'Show Fewer Specialists <i class="fas fa-arrow-down" aria-hidden="true"></i>';
        }

        function collapse() {
            grid.classList.add('kz-collapsed');
            btn.setAttribute('aria-expanded', 'false');
            labelEl.innerHTML = 'View All ' + total + ' Specialists <i class="fas fa-arrow-down" aria-hidden="true"></i>';
            // Keep the section header in view when collapsing
            var sec = document.getElementById('doctors');
            if (sec) sec.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        }

        btn.addEventListener('click', function () {
            if (grid.classList.contains('kz-collapsed')) expand();
            else collapse();
        });

        // Filtering must never be hidden behind the collapse
        document.querySelectorAll('.doc-filter-btn').forEach(function (f) {
            f.addEventListener('click', expand);
        });
    }


    /* ── 1b. Services: reveal the remaining treatments (phones only) ───── */
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

    /* ── 2. Testimonials: avatar initial next to each author ───────────── */
    function initTestimonialAuthors() {
        var rail = document.getElementById('testiRail');
        if (!rail) return;

        rail.querySelectorAll('.testimonial-card').forEach(function (card) {
            if (card.querySelector('.kz-testi-author')) return;

            // The author sits in a bare <span> between the quote and "Read More"
            var nameEl = null;
            card.querySelectorAll('span').forEach(function (sp) {
                if (nameEl) return;
                if (sp.classList.length === 0 && sp.textContent.trim()) nameEl = sp;
            });
            if (!nameEl) return;

            var name = nameEl.textContent.trim();
            var initial = name.charAt(0).toUpperCase();

            var row = document.createElement('div');
            row.className = 'kz-testi-author';

            var av = document.createElement('span');
            av.className = 'kz-testi-avatar';
            av.setAttribute('aria-hidden', 'true');
            av.textContent = initial;

            nameEl.parentNode.insertBefore(row, nameEl);
            row.appendChild(av);
            row.appendChild(nameEl);
        });
    }

    /* ── 3. Before/After slider: keyboard + ARIA ───────────────────────────
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

    /* ── 4. FAQ accordion ──────────────────────────────────────────────── */
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

    /* ── 5. Auto-dismiss the chat teaser so it stops covering content ──── */
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

    /* ── 6. Branch clinic locations filter tabs ──────────────────────── */
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
        initDoctorsReveal();
        initServicesReveal();
        initTestimonialAuthors();
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

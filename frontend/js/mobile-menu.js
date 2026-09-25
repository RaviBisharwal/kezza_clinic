// Mobile and Tablet Navigation Drawer Controller - Universal script for all pages
(function() {
    'use strict';

    function initMobileMenu() {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('navMenu');
        if (!hamburger || !navMenu) return;

        // Idempotency guard. If this script is included twice on a page, binding a
        // second set of listeners makes one tap open AND close the drawer, so the
        // menu appears completely dead. Bail out if we have already initialised.
        if (hamburger.dataset.kezzaMenuBound === 'true') return;
        hamburger.dataset.kezzaMenuBound = 'true';

        // 1. Ensure Backdrop exists
        let backdrop = document.getElementById('navBackdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.id = 'navBackdrop';
            backdrop.className = 'nav-backdrop';
            document.body.appendChild(backdrop);
        }

        // 2. Ensure Panel Header exists inside navMenu
        let drawerHeader = navMenu.querySelector('.nav-drawer-header');
        if (!drawerHeader) {
            drawerHeader = document.createElement('li');
            drawerHeader.className = 'nav-drawer-header';
            drawerHeader.innerHTML = `
                <a href="/index.html" class="drawer-logo" aria-label="Kezza Clinic Home">
                    <img src="/images/logo.png" alt="Kezza Clinic" width="120" height="45">
                </a>
                <button type="button" class="drawer-close-btn" id="drawerCloseBtn" aria-label="Close navigation menu">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            `;
            navMenu.insertBefore(drawerHeader, navMenu.firstChild);
        }

        // 3. Ensure Drawer Footer Actions exist inside navMenu
        let drawerCta = navMenu.querySelector('.nav-drawer-cta');
        if (!drawerCta) {
            drawerCta = document.createElement('li');
            drawerCta.className = 'nav-drawer-cta';
            drawerCta.innerHTML = `
                <a href="tel:+919284517427" class="btn-drawer-call"><i class="fas fa-phone-alt"></i> Call 9284517427</a>
                <a href="#chat-consultant" class="btn-drawer-book" data-open-chatbot-consultant><i class="fab fa-whatsapp"></i> Book Consultation</a>
            `;
            navMenu.appendChild(drawerCta);
        }

        const drawerCloseBtn = document.getElementById('drawerCloseBtn');
        let previouslyFocusedElement = null;

        function isDrawerOpen() {
            return navMenu.classList.contains('active');
        }

        function openDrawer() {
            previouslyFocusedElement = document.activeElement;
            navMenu.classList.add('active');
            hamburger.classList.add('active');
            hamburger.setAttribute('aria-expanded', 'true');
            if (backdrop) {
                backdrop.classList.add('active');
            }
            document.body.classList.add('nav-drawer-open');
            document.documentElement.classList.add('nav-drawer-open');

            // Move focus into the drawer panel
            setTimeout(() => {
                if (drawerCloseBtn) {
                    drawerCloseBtn.focus();
                } else {
                    const firstLink = navMenu.querySelector('a');
                    if (firstLink) firstLink.focus();
                }
            }, 60);
        }

        function closeDrawer() {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            if (backdrop) {
                backdrop.classList.remove('active');
            }
            document.body.classList.remove('nav-drawer-open');
            document.documentElement.classList.remove('nav-drawer-open');

            // Return focus to hamburger or previous element
            if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
                previouslyFocusedElement.focus();
            } else if (hamburger) {
                hamburger.focus();
            }
        }

        hamburger.setAttribute('aria-haspopup', 'true');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Open navigation menu');

        // Toggle from hamburger
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isDrawerOpen()) {
                closeDrawer();
            } else {
                openDrawer();
            }
        });

        // Close on X button
        if (drawerCloseBtn) {
            drawerCloseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeDrawer();
            });
        }

        // Close on Backdrop click
        if (backdrop) {
            backdrop.addEventListener('click', (e) => {
                e.stopPropagation();
                closeDrawer();
            });
        }

        // Close on real navigation link click only
        navMenu.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link || !navMenu.contains(link)) return;

            const href = link.getAttribute('href');
            // Skip non-navigating links, javascript links, and hash-only links
            if (!href || href === 'javascript:void(0)' || href.startsWith('#')) {
                return;
            }

            // Skip accordion toggles and headers
            if (link.classList.contains('services-nav-toggle') || link.closest('.services-nav-toggle') ||
                link.classList.contains('services-cat-header') || link.closest('.services-cat-header') ||
                link.classList.contains('services-mega-toggle') || link.closest('.services-mega-toggle')) {
                return;
            }

            // Genuinely navigating link clicked: close drawer
            closeDrawer();
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isDrawerOpen()) {
                closeDrawer();
            }
        });

        // Focus trap inside drawer while open
        navMenu.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab' || !isDrawerOpen()) return;

            const focusables = navMenu.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])');
            const visibleFocusables = Array.from(focusables).filter(el => {
                return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
            });

            if (visibleFocusables.length === 0) return;

            const firstEl = visibleFocusables[0];
            const lastEl = visibleFocusables[visibleFocusables.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstEl) {
                    e.preventDefault();
                    lastEl.focus();
                }
            } else {
                if (document.activeElement === lastEl) {
                    e.preventDefault();
                    firstEl.focus();
                }
            }
        });

        // Fallback document outside click
        document.addEventListener('click', (e) => {
            if (isDrawerOpen() && !navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                closeDrawer();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileMenu);
    } else {
        initMobileMenu();
    }
})();

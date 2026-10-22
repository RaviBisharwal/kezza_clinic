(function () {
    "use strict";

    function initMobileMenu() {
        const hamburger = document.getElementById("hamburger");
        const navMenu = document.getElementById("navMenu");
        if (!hamburger || !navMenu || hamburger.dataset.kezzaMenuBound === "true") {
            return;
        }
        hamburger.dataset.kezzaMenuBound = "true";

        // 1. Ensure Backdrop exists
        let backdrop = document.getElementById("navBackdrop");
        if (!backdrop) {
            backdrop = document.createElement("div");
            backdrop.id = "navBackdrop";
            backdrop.className = "nav-backdrop";
            document.body.appendChild(backdrop);
        }

        // 2. Ensure Drawer Header exists inside navMenu (strictly mobile-only)
        let drawerHeader = navMenu.querySelector(".nav-drawer-header");
        if (!drawerHeader) {
            drawerHeader = document.createElement("li");
            drawerHeader.className = "nav-drawer-header";
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

        // 3. Ensure Drawer CTA exists inside navMenu (strictly mobile-only)
        let drawerCta = navMenu.querySelector(".nav-drawer-cta");
        if (!drawerCta) {
            drawerCta = document.createElement("li");
            drawerCta.className = "nav-drawer-cta";
            drawerCta.innerHTML = `
                <a href="tel:+919284517427" class="btn-drawer-call"><i class="fas fa-phone-alt"></i> Call 9284517427</a>
                <a href="contact.html" class="btn-drawer-book"><i class="fas fa-calendar-check"></i> Book Consultation</a>
            `;
            navMenu.appendChild(drawerCta);
        }

        const closeBtn = document.getElementById("drawerCloseBtn");
        let lastActiveEl = null;

        function isOpen() {
            return navMenu.classList.contains("active");
        }

        function openMenu() {
            lastActiveEl = document.activeElement;
            navMenu.classList.add("active");
            hamburger.classList.add("active");
            hamburger.setAttribute("aria-expanded", "true");
            if (backdrop) backdrop.classList.add("active");
            document.body.classList.add("nav-drawer-open");
            document.documentElement.classList.add("nav-drawer-open");

            setTimeout(() => {
                if (closeBtn) {
                    closeBtn.focus();
                } else {
                    const firstLink = navMenu.querySelector("a");
                    if (firstLink) firstLink.focus();
                }
            }, 60);
        }

        function closeMenu() {
            navMenu.classList.remove("active");
            hamburger.classList.remove("active");
            hamburger.setAttribute("aria-expanded", "false");
            if (backdrop) backdrop.classList.remove("active");
            document.body.classList.remove("nav-drawer-open");
            document.documentElement.classList.remove("nav-drawer-open");

            if (lastActiveEl && typeof lastActiveEl.focus === "function") {
                lastActiveEl.focus();
            } else if (hamburger) {
                hamburger.focus();
            }
        }

        hamburger.setAttribute("aria-haspopup", "true");
        hamburger.setAttribute("aria-expanded", "false");
        hamburger.setAttribute("aria-label", "Open navigation menu");

        // Click to toggle
        hamburger.addEventListener("click", function (e) {
            e.stopPropagation();
            if (isOpen()) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // Close button click
        if (closeBtn) {
            closeBtn.addEventListener("click", function (e) {
                e.stopPropagation();
                closeMenu();
            });
        }

        // Backdrop click
        if (backdrop) {
            backdrop.addEventListener("click", function (e) {
                e.stopPropagation();
                closeMenu();
            });
        }

        // Close drawer on navigation link click (except dropdown toggles)
        navMenu.addEventListener("click", function (e) {
            const link = e.target.closest("a");
            if (!link || !navMenu.contains(link)) return;

            // Handle Book Consultation CTA
            if (link.hasAttribute("data-open-chatbot-consultant")) {
                const href = (link.getAttribute("href") || "").toLowerCase();
                if (href.indexOf("contact.html") !== -1) {
                    closeMenu();
                    return; // allow normal navigation to contact page
                }
                e.preventDefault();
                closeMenu();
                if (window.kezzaAi && typeof window.kezzaAi.openModal === "function") {
                    window.kezzaAi.openModal();
                } else {
                    const modal = document.getElementById("kezzaAiModal");
                    if (modal) modal.style.display = "flex";
                }
                return;
            }

            const href = link.getAttribute("href");
            if (!href || href === "javascript:void(0)" || href.startsWith("#")) {
                if (link.classList.contains("services-nav-toggle") || link.closest(".services-nav-toggle")) {
                    return; // keep drawer open for services dropdown
                }
            }

            if (
                link.classList.contains("services-nav-toggle") ||
                link.closest(".services-nav-toggle") ||
                link.classList.contains("services-cat-header") ||
                link.closest(".services-cat-header") ||
                link.classList.contains("services-mega-toggle") ||
                link.closest(".services-mega-toggle")
            ) {
                return;
            }

            closeMenu();
        });

        // Close on ESC key
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && isOpen()) {
                closeMenu();
            }
        });

        // Trap focus inside drawer when open
        navMenu.addEventListener("keydown", function (e) {
            if (e.key !== "Tab" || !isOpen()) return;

            const focusables = navMenu.querySelectorAll(
                'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            const visible = Array.from(focusables).filter(
                (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0
            );

            if (visible.length === 0) return;

            const first = visible[0];
            const last = visible[visible.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });

        // Close on click outside
        document.addEventListener("click", function (e) {
            if (isOpen() && !navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                closeMenu();
            }
        });

        // Automatically close drawer when window resizes to desktop
        window.addEventListener("resize", function () {
            if (window.innerWidth > 1024 && isOpen()) {
                closeMenu();
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initMobileMenu);
    } else {
        initMobileMenu();
    }
})();

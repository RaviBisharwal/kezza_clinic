/**
 * Kezza Hair & Skin Clinic — Accordion Services Dropdown Controller
 * Controls dropdown toggle, accordion expand/collapse, outside click, ESC key, and mobile menu.
 */
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        // ── 1. SERVICE CATEGORY CARDS & INTERACTIVE VIEWER CONTROLLER ──
        const categoryCards = document.querySelectorAll('.service-category-card[data-category]');
        const tabButtons    = document.querySelectorAll('.viewer-tab-btn[data-category]');
        const tabPanels     = document.querySelectorAll('.treatment-tab-panel[data-category]');
        const viewerSection = document.getElementById('servicesViewer');

        function switchCategory(categoryName, shouldScroll) {
            categoryCards.forEach(card => {
                if (card.getAttribute('data-category') === categoryName) {
                    card.classList.add('active-category');
                } else {
                    card.classList.remove('active-category');
                }
            });

            tabButtons.forEach(btn => {
                if (btn.getAttribute('data-category') === categoryName) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            tabPanels.forEach(panel => {
                if (panel.getAttribute('data-category') === categoryName) {
                    panel.classList.add('active');
                } else {
                    panel.classList.remove('active');
                }
            });

            if (shouldScroll && viewerSection) {
                const headerOffset = 90;
                const elementPosition = viewerSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }

        categoryCards.forEach(card => {
            card.addEventListener('click', function(e) {
                const category = this.getAttribute('data-category');
                if (category) {
                    e.preventDefault();
                    switchCategory(category, true);
                }
            });
        });

        tabButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const category = this.getAttribute('data-category');
                if (category) {
                    switchCategory(category, false);
                }
            });
        });

        // ── 2. SERVICES DROPDOWN & ACCORDION SUB-BRANCHES CONTROLLER ────
        const dropdownItems = document.querySelectorAll('.nav-item-services-dropdown, .nav-item-services-mega');

        dropdownItems.forEach(dropdownItem => {
            const toggleBtn = dropdownItem.querySelector('.services-nav-toggle, .services-mega-toggle, #servicesNavToggle, #servicesMegaToggle');
            const menuCard  = dropdownItem.querySelector('.services-dropdown-menu, .services-mega-menu, #servicesDropdownMenu, #servicesMegaMenu');
            const accordionItems = dropdownItem.querySelectorAll('.services-cat-item');

            let isDropdownOpen = false;
            let dropdownHoverTimer = null;
            let categoryHoverTimer = null;
            const HOVER_INTENT_MS = 170; // 170ms hover-intent delay prevents rapid flickering

            function openDropdown() {
                isDropdownOpen = true;
                dropdownItem.classList.add('services-dropdown-open', 'dropdown-active', 'services-mega-open', 'mega-active');
                if (window.innerWidth <= 992) {
                    dropdownItem.classList.add('mobile-dropdown-open', 'mobile-mega-open');
                }
                if (toggleBtn) {
                    toggleBtn.setAttribute('aria-expanded', 'true');
                }
            }

            function closeDropdown() {
                isDropdownOpen = false;
                clearTimeout(dropdownHoverTimer);
                clearTimeout(categoryHoverTimer);
                dropdownItem.classList.remove(
                    'services-dropdown-open', 'dropdown-active', 'mobile-dropdown-open',
                    'services-mega-open', 'mega-active', 'mobile-mega-open'
                );
                if (toggleBtn) {
                    toggleBtn.setAttribute('aria-expanded', 'false');
                }
            }

            function toggleDropdown(e) {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                if (isDropdownOpen) {
                    closeDropdown();
                } else {
                    openDropdown();
                }
            }

            function collapseAllAccordions() {
                accordionItems.forEach(item => {
                    item.classList.remove('is-expanded');
                    const header = item.querySelector('.services-cat-header');
                    if (header) {
                        header.setAttribute('aria-expanded', 'false');
                    }
                });
            }

            function scrollCategoryIntoView(targetItem, container) {
                if (!targetItem || !container) return;

                setTimeout(() => {
                    if (window.innerWidth > 992) {
                        const containerRect = container.getBoundingClientRect();
                        const itemRect = targetItem.getBoundingClientRect();
                        const currentScrollTop = container.scrollTop;
                        const relativeTop = itemRect.top - containerRect.top + currentScrollTop;
                        const targetScrollTop = Math.max(0, relativeTop - 8);

                        container.scrollTo({
                            top: targetScrollTop,
                            behavior: 'smooth'
                        });
                    } else {
                        const navMenu = document.getElementById('navMenu') || document.querySelector('.nav-menu');
                        const navbar = document.querySelector('.navbar');
                        const navHeight = navbar ? navbar.offsetHeight : 70;

                        if (navMenu && (navMenu.scrollHeight > navMenu.clientHeight)) {
                            const menuRect = navMenu.getBoundingClientRect();
                            const itemRect = targetItem.getBoundingClientRect();
                            const currentScrollTop = navMenu.scrollTop;
                            const relativeTop = itemRect.top - menuRect.top + currentScrollTop;

                            navMenu.scrollTo({
                                top: Math.max(0, relativeTop - 12),
                                behavior: 'smooth'
                            });
                        } else {
                            const itemY = targetItem.getBoundingClientRect().top + window.pageYOffset - (navHeight + 16);
                            window.scrollTo({
                                top: Math.max(0, itemY),
                                behavior: 'smooth'
                            });
                        }
                    }
                }, 50);
            }

            function expandCategory(targetItem, shouldScroll = true) {
                if (!targetItem) return;

                // 1. Collapse all other categories
                accordionItems.forEach(item => {
                    if (item !== targetItem) {
                        item.classList.remove('is-expanded');
                        const header = item.querySelector('.services-cat-header');
                        if (header) {
                            header.setAttribute('aria-expanded', 'false');
                        }
                    }
                });

                // 2. Expand target category
                targetItem.classList.add('is-expanded');
                const header = targetItem.querySelector('.services-cat-header');
                if (header) {
                    header.setAttribute('aria-expanded', 'true');
                }

                // 3. Smooth internal scroll
                if (shouldScroll) {
                    scrollCategoryIntoView(targetItem, menuCard);
                }
            }

            function toggleCategoryAccordion(targetItem) {
                const isCurrentlyExpanded = targetItem.classList.contains('is-expanded');
                if (isCurrentlyExpanded) {
                    targetItem.classList.remove('is-expanded');
                    const header = targetItem.querySelector('.services-cat-header');
                    if (header) {
                        header.setAttribute('aria-expanded', 'false');
                    }
                } else {
                    expandCategory(targetItem, true);
                }
            }

            // ── Accordion Category Event Listeners (Hover-to-Expand with Intent) ──
            accordionItems.forEach(item => {
                const headerBtn = item.querySelector('.services-cat-header');

                // 1. Desktop: Automatic expansion on hover with 170ms intent delay
                item.addEventListener('mouseenter', function() {
                    if (window.innerWidth > 992) {
                        clearTimeout(categoryHoverTimer);
                        if (item.classList.contains('is-expanded')) return;

                        categoryHoverTimer = setTimeout(() => {
                            expandCategory(item, true);
                        }, HOVER_INTENT_MS);
                    }
                });

                // Cancel intent delay if cursor quickly passes over and leaves
                item.addEventListener('mouseleave', function() {
                    if (window.innerWidth > 992) {
                        clearTimeout(categoryHoverTimer);
                    }
                });

                if (headerBtn) {
                    // 2. Click / Tap Handler: Tap-to-toggle on mobile, instant expand on desktop
                    headerBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        clearTimeout(categoryHoverTimer);
                        openDropdown();

                        if (window.innerWidth <= 992) {
                            toggleCategoryAccordion(item);
                        } else {
                            expandCategory(item, true);
                        }
                    });

                    // 3. Keyboard Accessibility: Enter/Space to toggle, Focus to expand
                    headerBtn.addEventListener('keydown', function(e) {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            openDropdown();
                            toggleCategoryAccordion(item);
                        }
                    });

                    headerBtn.addEventListener('focus', function() {
                        if (window.innerWidth > 992) {
                            clearTimeout(categoryHoverTimer);
                            categoryHoverTimer = setTimeout(() => {
                                expandCategory(item, true);
                            }, 100);
                        }
                    });
                }
            });

            if (toggleBtn) {
                toggleBtn.setAttribute('role', 'button');
                toggleBtn.setAttribute('aria-haspopup', 'true');
                toggleBtn.setAttribute('aria-expanded', 'false');
                if (menuCard) {
                    toggleBtn.setAttribute('aria-controls', menuCard.id || 'servicesDropdownMenu');
                    menuCard.setAttribute('role', 'region');
                    menuCard.setAttribute('aria-label', 'Services Menu');
                }

                // Click toggle
                toggleBtn.addEventListener('click', toggleDropdown);

                // Desktop Dropdown Open on Navbar Hover
                dropdownItem.addEventListener('mouseenter', () => {
                    if (window.innerWidth > 992) {
                        clearTimeout(dropdownHoverTimer);
                        dropdownItem.classList.add('dropdown-active', 'mega-active');
                    }
                });

                dropdownItem.addEventListener('mouseleave', () => {
                    if (window.innerWidth > 992) {
                        if (!isDropdownOpen) {
                            dropdownHoverTimer = setTimeout(() => {
                                dropdownItem.classList.remove('dropdown-active', 'mega-active');
                            }, 450);
                        }
                    }
                });
            }

            // Prevent clicks inside menu card from bubbling up to document click handler
            if (menuCard) {
                menuCard.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const clickedLink = e.target.closest('a');
                    if (clickedLink) {
                        closeDropdown();
                        const navMenu = document.getElementById('navMenu');
                        const hamburger = document.getElementById('hamburger');
                        if (navMenu && navMenu.classList.contains('active')) {
                            navMenu.classList.remove('active');
                        }
                        if (hamburger && hamburger.classList.contains('active')) {
                            hamburger.classList.remove('active');
                        }
                    }
                });

                menuCard.addEventListener('mouseenter', () => {
                    clearTimeout(dropdownHoverTimer);
                    dropdownItem.classList.add('dropdown-active', 'mega-active');
                });
            }

            // Close on Outside Click
            document.addEventListener('click', (e) => {
                if (!dropdownItem.contains(e.target)) {
                    closeDropdown();
                }
            });

            // Close on ESC Key Press
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && (isDropdownOpen || dropdownItem.classList.contains('dropdown-active') || dropdownItem.classList.contains('mega-active'))) {
                    closeDropdown();
                    if (toggleBtn) {
                        toggleBtn.focus();
                    }
                }
            });
        });
    });
})();

// Kezza Clinic - Unified Quick Actions & Scroll Enhancements
// Loaded on every page. Paths are root-relative (/js/…) so they also work on
// pages inside folders such as /hair-transplant/ and /blog/<post>/.
(function () {
    // Phones/tablets: a tap also fires "mouseenter/mouseover/mousemove". Several page
    // scripts use those for desktop hover effects (cards that lift, tilt or zoom), which
    // made cards jump on every tap and stay stuck in the hover pose. Ignore them on
    // touch-only devices; clicks and taps are not affected.
    if (window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
        ['mouseenter', 'mouseover', 'mousemove'].forEach(function (type) {
            window.addEventListener(type, function (e) { e.stopPropagation(); }, true);
        });
    }

    var CHATBOT_SRC = '/js/kezza-ai.min.js?v=123f2287';
    var SCANNER_CSS = '/css/bundle-scanner-modal.min.css?v=43d56733';
    var SCANNER_JS = '/js/scanner-modal.min.js?v=e7fbbc22';

    // ── Chatbot: promptly load the chat script so the assistant FAB is always ready
    var chatbotRequested = false;
    function loadChatbot(onReady) {
        if (window.KezzaAI || document.querySelector('script[src*="kezza-ai."]')) {
            if (onReady) {
                var s0 = document.querySelector('script[src*="kezza-ai."]');
                if (window.KezzaAI || !s0) onReady(); else s0.addEventListener('load', function () { onReady(); }, { once: true });
            }
            return;
        }
        chatbotRequested = true;
        var sc = document.createElement('script');
        sc.src = CHATBOT_SRC;
        sc.defer = true;
        if (onReady) sc.onload = function () { onReady(); };
        (document.body || document.head || document.documentElement).appendChild(sc);
    }
    window.kezzaLoadChatbot = loadChatbot;

    function scheduleChatbot() {
        var path = (window.location.pathname || '').toLowerCase();
        if (path.indexOf('admin') !== -1) return;

        // Progressive lazy loading: load chatbot only on user interaction or idle time
        // This eliminates 212KB JS execution during initial first-paint & render.
        var loaded = false;
        function triggerLoad() {
            if (loaded) return;
            loaded = true;
            ['pointerdown', 'touchstart', 'scroll', 'keydown'].forEach(function (ev) {
                window.removeEventListener(ev, triggerLoad, { passive: true });
            });
            loadChatbot();
        }

        ['pointerdown', 'touchstart', 'scroll', 'keydown'].forEach(function (ev) {
            window.addEventListener(ev, triggerLoad, { passive: true, once: true });
        });

        // Idle fallback so the floating chat button is ready if the user is reading quietly
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(function () {
                setTimeout(triggerLoad, 3000);
            }, { timeout: 5000 });
        } else {
            setTimeout(triggerLoad, 3500);
        }
    }

    function loadSoftNavigation() {
        if (document.querySelector('script[data-kezza-soft-navigation]')) return;
        var script = document.createElement('script');
        script.src = '/js/soft-navigation.min.js?v=cb78fba8';
        script.async = false;
        script.defer = true;
        script.dataset.kezzaSoftNavigation = 'true';
        document.body.appendChild(script);
    }

    function bindBookingNavigation() {
        if (document.documentElement.dataset.kzBookingNavigationBound === 'true') return;
        document.documentElement.dataset.kzBookingNavigationBound = 'true';

        var routeEventMarker = '__kezzaRouteNavigationHandled';

        function normalizePath(path) {
            var normalized = path.replace(/\/index\.html$/i, '/');
            return normalized.endsWith('/') ? normalized : normalized + '/';
        }

        document.addEventListener('click', function (event) {
            if (event.defaultPrevented || event[routeEventMarker] || event.metaKey || event.ctrlKey ||
                event.shiftKey || event.altKey || (event.button !== 0 && event.detail !== 0)) return;

            var link = event.target.closest('a[href]');
            if (!link || link.target && link.target.toLowerCase() !== '_self' || link.hasAttribute('download')) return;

            var targetUrl;
            try {
                targetUrl = new URL(link.href, window.location.href);
            } catch (error) {
                return;
            }

            if (targetUrl.origin !== window.location.origin || normalizePath(targetUrl.pathname) !== '/contact/') return;

            var label = [link.textContent, link.getAttribute('aria-label'), link.getAttribute('title')]
                .filter(Boolean).join(' ').toLowerCase();
            if (!/\b(book|booking|consultation|appointment|visit|slot)\b/.test(label)) return;

            if (!targetUrl.hash) targetUrl.hash = 'contact-form-anchor';
            var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            var mobileMotion = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
            var motionDuration = reducedMotion ? 0 : (mobileMotion ? 420 : 300);
            if (normalizePath(window.location.pathname) === '/contact/') {
                event.preventDefault();
                event[routeEventMarker] = true;
                if (link.dataset.kzBookingPending !== 'true') {
                    link.dataset.kzBookingPending = 'true';
                    link.classList.add('kz-booking-navigation-active');
                    link.setAttribute('aria-busy', 'true');
                    window.setTimeout(function () {
                        link.dataset.kzBookingPending = 'false';
                        link.classList.remove('kz-booking-navigation-active');
                        link.removeAttribute('aria-busy');
                    }, motionDuration);
                }
                var contactFormAnchor = document.getElementById('contact-form-anchor');
                if (contactFormAnchor) {
                    contactFormAnchor.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
                } else {
                    window.location.assign(targetUrl.href);
                }
                return;
            }

            event.preventDefault();
            event[routeEventMarker] = true;
            if (link.dataset.kzBookingPending === 'true') return;

            link.dataset.kzBookingPending = 'true';
            link.classList.add('kz-booking-navigation-active');
            link.setAttribute('aria-busy', 'true');

            window.setTimeout(function () {
                try {
                    if (window.KezzaSoftNavigation && typeof window.KezzaSoftNavigation.navigate === 'function') {
                        window.KezzaSoftNavigation.navigate(targetUrl.href);
                    } else {
                        window.location.assign(targetUrl.href);
                    }
                } catch (error) {
                    window.location.assign(targetUrl.href);
                }
            }, reducedMotion ? 0 : (mobileMotion ? 420 : 300));
        }, true);
    }

    var videoObserver = null;
    var observedVideos = new WeakSet();
    function observeVideos(scope) {
        if (!('IntersectionObserver' in window)) return;
        if (!videoObserver) {
            videoObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    var video = entry.target;
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
                        video.muted = true;
                        video.playsInline = true;
                        var playPromise = video.play();
                        if (playPromise !== undefined) playPromise.catch(function () {});
                    } else if (!video.paused) {
                        video.pause();
                    }
                });
            }, { threshold: [0.1, 0.25, 0.5] });
        }
        (scope || document).querySelectorAll('video').forEach(function (video) {
            if (observedVideos.has(video)) return;
            observedVideos.add(video);
            video.muted = true;
            video.setAttribute('muted', '');
            video.setAttribute('playsinline', '');
            videoObserver.observe(video);
        });
    }

    window.KezzaQuickActions = {
        refresh: function () {
            observeVideos(document.getElementById('kz-route-outlet') || document);
        }
    };

    function initQuickActions() {
        // 1. Auto-Play / Pause Videos when Scrolled into View
        observeVideos(document);

        // 2. Floating Quick Dock — stays out of the way while people read or book
        (function initDock() {
            var dock = document.querySelector('.floating-quick-dock');
            if (!dock) return;
            var lastScrollY = window.scrollY || 0;
            var hiddenForScroll = lastScrollY > 72;

            function isCompactViewport() {
                return !!(window.matchMedia && window.matchMedia('(max-width: 1024px), (hover: none)').matches);
            }

            function syncDock() {
                var chatOpen = document.body.classList.contains('kezza-chat-open') || !!document.querySelector('#kezzaChatWindow.open');
                var menuOpen = document.body.classList.contains('services-menu-open') || !!document.querySelector('.services-dropdown-open');
                var modalOpen = document.body.classList.contains('ks-modal-open') || !!document.querySelector('.ks-modal.ks-active');
                var compact = isCompactViewport();
                var contactSection = document.querySelector('.contact-form-section');
                var contactRect = contactSection && contactSection.getBoundingClientRect();
                var contactInView = !!(contactRect && contactRect.bottom > 0 && contactRect.top < window.innerHeight);
                var formFocused = !!(contactSection && contactSection.contains(document.activeElement));

                if (!compact) hiddenForScroll = false;
                if (chatOpen || menuOpen || modalOpen || (compact && (hiddenForScroll || contactInView || formFocused))) {
                    dock.classList.add('dock-hidden');
                } else {
                    dock.classList.remove('dock-hidden');
                }
            }

            function onDockScroll() {
                var currentY = Math.max(0, window.scrollY || 0);
                var delta = currentY - lastScrollY;

                if (!isCompactViewport()) {
                    hiddenForScroll = false;
                } else if (currentY <= 72) {
                    hiddenForScroll = false;
                } else if (delta > 5) {
                    hiddenForScroll = true;
                } else if (delta < -5) {
                    hiddenForScroll = false;
                }

                lastScrollY = currentY;
                syncDock();
            }

            // The contact page is form-first, so keep the dock from covering its
            // fields and submit button even when the page opens at scroll position 0.
            syncDock();
            window.addEventListener('scroll', onDockScroll, { passive: true });
            window.addEventListener('resize', syncDock, { passive: true });
            document.addEventListener('kezzaChatStateChange', syncDock);
            document.addEventListener('focusin', syncDock);
            document.addEventListener('focusout', syncDock);
            document.addEventListener('kezza:routechange', function () {
                lastScrollY = window.scrollY || 0;
                hiddenForScroll = isCompactViewport() && lastScrollY > 72;
                syncDock();
            });
        })();

        // 3. AI Scanner entry points. scanner-launch.js binds the nav link, hero
        //    button and dock button itself; this catches the remaining links to
        //    face-scanner.html and opens the popup instead of leaving the page.
        var scannerLoading = false;
        function openScannerModal() {
            if (typeof window.openKezzaScanner === 'function') { window.openKezzaScanner(); return; }
            if (window.KezzaScannerModal && typeof window.KezzaScannerModal.open === 'function') { window.KezzaScannerModal.open(); return; }
            if (scannerLoading) return;
            scannerLoading = true;
            if (!document.querySelector('link[href*="scanner-modal."]')) {
                var cssLink = document.createElement('link');
                cssLink.rel = 'stylesheet';
                cssLink.href = SCANNER_CSS;
                document.head.appendChild(cssLink);
            }
            var script = document.createElement('script');
            script.src = SCANNER_JS;
            script.defer = true;
            script.onload = function () {
                scannerLoading = false;
                if (window.KezzaScannerModal && typeof window.KezzaScannerModal.open === 'function') window.KezzaScannerModal.open();
            };
            script.onerror = function () { scannerLoading = false; window.location.href = '/face-scanner.html'; };
            document.body.appendChild(script);
        }

        document.addEventListener('click', function (e) {
            var trigger = e.target.closest('.nav-scanner-link, .btn-scanner-hero, .dock-scan, [data-open-scanner-modal], a[href*="face-scanner.html"]');
            if (!trigger) return;
            if (trigger.dataset.ksBound) return; // already handled by scanner-launch.js
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
            var path = (window.location.pathname || '').toLowerCase();
            if (path.indexOf('face-scanner') !== -1) return; // already on the scanner page
            e.preventDefault();
            openScannerModal();
        });

        // (The automatic scanner popup lives only in scanner-launch.js: once per
        //  visit, about 6 seconds after the page opens. This file used to open it
        //  a second time after 2.5 seconds.)

        // 4. Header / Drawer "Book Consultation" opens the AI chat consultant
        function openChatbotConsultant() {
            var navMenu = document.getElementById('navMenu') || document.querySelector('.nav-links');
            var hamburger = document.getElementById('hamburger');
            var backdrop = document.getElementById('drawerBackdrop') || document.getElementById('navBackdrop');
            if (navMenu) navMenu.classList.remove('active');
            if (hamburger) {
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
            if (backdrop) backdrop.classList.remove('active');
            document.body.classList.remove('nav-drawer-open');
            document.documentElement.classList.remove('nav-drawer-open');

            if (typeof window.openKezzaChat === 'function') { window.openKezzaChat(true); return; }
            loadChatbot(function () {
                setTimeout(function () {
                    if (typeof window.openKezzaChat === 'function') {
                        window.openKezzaChat(true);
                    } else {
                        var f = document.getElementById('kezzaChatFab');
                        if (f) f.click();
                    }
                }, 120);
            });
        }
        window.kezzaOpenChatConsultant = openChatbotConsultant;

        document.addEventListener('click', function (e) {
            var btn = e.target.closest('.btn-drawer-book, [data-open-chatbot-consultant]');
            if (btn) {
                var targetHref = (btn.getAttribute('href') || '').toLowerCase();
                if (targetHref.indexOf('contact') !== -1) {
                    return; // allow normal navigation to contact page consultation form
                }
                e.preventDefault();
                e.stopPropagation();
                openChatbotConsultant();
            }
        });

        // ── 5. Universal Conversion Tracking (Phone & WhatsApp Clicks) ───────
        document.addEventListener('click', function (e) {
            var telLink = e.target.closest('a[href^="tel:"]');
            if (telLink) {
                var phoneNum = (telLink.getAttribute('href') || '').replace(/^tel:/i, '').trim();
                try {
                    window.dataLayer = window.dataLayer || [];
                    window.dataLayer.push({
                        event: 'click_to_call',
                        phone_number: phoneNum,
                        link_text: (telLink.innerText || '').trim().slice(0, 50),
                        page_path: window.location.pathname
                    });
                    if (typeof window.gtag === 'function') {
                        window.gtag('event', 'click_to_call', {
                            event_category: 'engagement',
                            event_label: phoneNum,
                            value: 1
                        });
                    }
                    if (typeof window.fbq === 'function') {
                        window.fbq('trackCustom', 'ClickToCall', { phone: phoneNum });
                    }
                } catch (err) {}
                return;
            }

            var waLink = e.target.closest('a[href*="wa.me"], a[href*="whatsapp.com"], .btn-wa, .cty-btn-wa, .dock-wa');
            if (waLink) {
                var waHref = waLink.getAttribute('href') || '';
                try {
                    window.dataLayer = window.dataLayer || [];
                    window.dataLayer.push({
                        event: 'click_whatsapp',
                        target_url: waHref,
                        link_text: (waLink.innerText || '').trim().slice(0, 50),
                        page_path: window.location.pathname
                    });
                    if (typeof window.gtag === 'function') {
                        window.gtag('event', 'click_whatsapp', {
                            event_category: 'engagement',
                            event_label: waHref,
                            value: 1
                        });
                    }
                    if (typeof window.fbq === 'function') {
                        window.fbq('trackCustom', 'ClickWhatsApp', { url: waHref });
                    }
                } catch (err) {}
            }
        }, { capture: true, passive: true });

        // ── 6. Professional Social Share & Link Copy Engine ───────────────────
        function showShareToast(msg) {
            var existing = document.getElementById('kzShareToast');
            if (existing) existing.remove();
            var toast = document.createElement('div');
            toast.id = 'kzShareToast';
            toast.className = 'kz-share-toast';
            toast.innerHTML = '<i class="fas fa-check-circle" aria-hidden="true"></i> <span>' + (msg || 'Link copied to clipboard!') + '</span>';
            document.body.appendChild(toast);
            requestAnimationFrame(function () {
                toast.classList.add('show');
            });
            setTimeout(function () {
                toast.classList.remove('show');
                setTimeout(function () { toast.remove(); }, 350);
            }, 2600);
        }
        window.kzShowShareToast = showShareToast;

        function fallbackCopy(text) {
            var tempInput = document.createElement('input');
            tempInput.value = text;
            tempInput.style.position = 'fixed';
            tempInput.style.opacity = '0';
            document.body.appendChild(tempInput);
            tempInput.select();
            try {
                document.execCommand('copy');
                showShareToast('Link copied to clipboard! Share on WhatsApp or social media.');
            } catch (err) {}
            document.body.removeChild(tempInput);
        }

        document.addEventListener('click', function (e) {
            var copyBtn = e.target.closest('.kz-share-copy, .btn-copy-link');
            if (copyBtn) {
                e.preventDefault();
                var url = copyBtn.getAttribute('data-url') || window.location.href;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(url).then(function () {
                        showShareToast('Link copied to clipboard! Share on WhatsApp or social media.');
                    }).catch(function () {
                        fallbackCopy(url);
                    });
                } else {
                    fallbackCopy(url);
                }
                return;
            }

            var shareTrigger = e.target.closest('.social-icon.share-trigger');
            if (shareTrigger) {
                e.preventDefault();
                var pageUrl = window.location.href;
                var pageTitle = document.title || 'Kezza Hair & Skin Clinic';
                if (navigator.share) {
                    navigator.share({
                        title: pageTitle,
                        url: pageUrl
                    }).catch(function () {});
                } else {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(pageUrl).then(function () {
                            showShareToast('Page link copied to clipboard!');
                        });
                    } else {
                        fallbackCopy(pageUrl);
                    }
                }
            }
        });

        scheduleChatbot();
        bindBookingNavigation();
        loadSoftNavigation();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initQuickActions);
    } else {
        initQuickActions();
    }
})();

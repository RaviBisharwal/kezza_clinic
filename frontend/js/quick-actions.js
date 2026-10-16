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

    var CHATBOT_SRC = '/js/kezza-ai.min.js?v=24892922';
    var SCANNER_CSS = '/css/bundle-scanner-modal.min.css?v=b1c1b442';
    var SCANNER_JS = '/js/scanner-modal.min.js?v=978a3a40';

    // ── Chatbot: load the (large) chat script when the browser is idle or on the
    //    first tap/click/keypress, instead of while the page is still loading.
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
        document.body.appendChild(sc);
    }
    window.kezzaLoadChatbot = loadChatbot;

    function scheduleChatbot() {
        var path = (window.location.pathname || '').toLowerCase();
        if (path.indexOf('admin') !== -1) return;
        var isMobile = (window.innerWidth <= 768) || (window.matchMedia && window.matchMedia('(max-width: 768px)').matches);
        if (isMobile) return; // on mobile devices, load on demand when user clicks consultation or chat
        var started = false;
        function go() {
            if (started) return;
            started = true;
            ['click', 'keydown', 'focusin'].forEach(function (ev) { window.removeEventListener(ev, go, true); });
            loadChatbot();
        }
        ['click', 'keydown', 'focusin'].forEach(function (ev) { window.addEventListener(ev, go, { capture: true, passive: true }); });
        function idle() {
            if ('requestIdleCallback' in window) requestIdleCallback(go, { timeout: 4000 });
            else setTimeout(go, 3000);
        }
        if (document.readyState === 'complete') setTimeout(idle, 4000);
        else window.addEventListener('load', function () { setTimeout(idle, 4000); }, { once: true });
    }

    document.addEventListener('DOMContentLoaded', function () {
        // 1. Auto-Play / Pause Videos when Scrolled into View
        var allVideos = document.querySelectorAll('video');
        if (allVideos.length > 0 && 'IntersectionObserver' in window) {
            var videoObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    var video = entry.target;
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
                        video.muted = true;
                        video.playsInline = true;
                        var p = video.play();
                        if (p !== undefined) p.catch(function () {});
                    } else if (!video.paused) {
                        video.pause();
                    }
                });
            }, { threshold: [0.1, 0.25, 0.5] });

            allVideos.forEach(function (v) {
                v.muted = true;
                v.setAttribute('muted', '');
                v.setAttribute('playsinline', '');
                videoObserver.observe(v);
            });
        }

        // 2. Floating Quick Dock — hide while scrolling, reappear after scroll stops
        (function initDockScroll() {
            var dock = document.querySelector('.floating-quick-dock');
            if (!dock) return;
            var ticking = false, hideTimer = null, isHidden = false;
            window.addEventListener('scroll', function () {
                clearTimeout(hideTimer);
                if (!ticking) {
                    requestAnimationFrame(function () {
                        if (!isHidden) { dock.classList.add('dock-hidden'); isHidden = true; }
                        ticking = false;
                    });
                    ticking = true;
                }
                hideTimer = setTimeout(function () {
                    if (isHidden) { dock.classList.remove('dock-hidden'); isHidden = false; }
                }, 400);
            }, { passive: true });
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
            if (hamburger) hamburger.classList.remove('active');
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
            var btn = e.target.closest('.nav-cta .btn-primary, .btn-drawer-book, [data-open-chatbot-consultant]');
            if (btn) {
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

        scheduleChatbot();
    });
})();

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

    var CHATBOT_SRC = '/js/kezza-ai.min.js?v=22f8879e';
    var SCANNER_CSS = '/css/bundle-scanner-modal.min.css?v=43d56733';
    var SCANNER_JS = '/js/scanner-modal.min.js?v=5517a74b';

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
        loadChatbot();
    }

    function initQuickActions() {
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

        // 2. Floating Quick Dock — reliably visible; syncs cleanly with full modals & chat
        (function initDock() {
            var dock = document.querySelector('.floating-quick-dock');
            if (!dock) return;
            dock.classList.remove('dock-initial-hidden', 'dock-hidden');

            function syncDock() {
                var chatOpen = document.body.classList.contains('kezza-chat-open') || !!document.querySelector('#kezzaChatWindow.open');
                var menuOpen = document.body.classList.contains('services-menu-open') || !!document.querySelector('.services-dropdown-open');
                var modalOpen = document.body.classList.contains('ks-modal-open') || !!document.querySelector('.ks-modal.ks-active');
                if (chatOpen || menuOpen || modalOpen) {
                    dock.classList.add('dock-hidden');
                } else {
                    dock.classList.remove('dock-hidden');
                }
            }

            window.addEventListener('resize', syncDock, { passive: true });
            document.addEventListener('kezzaChatStateChange', syncDock);
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
                var targetHref = (btn.getAttribute('href') || '').toLowerCase();
                if (targetHref.indexOf('contact.html') !== -1) {
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
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initQuickActions);
    } else {
        initQuickActions();
    }
})();

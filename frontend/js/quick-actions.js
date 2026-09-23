// Kezza Clinic - Unified Quick Actions & Scroll Enhancements
document.addEventListener('DOMContentLoaded', () => {
    // 1. Auto-Play / Pause Videos when Scrolled into View
    const allVideos = document.querySelectorAll('video');
    if (allVideos.length > 0 && 'IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
                    video.muted = true;
                    video.playsInline = true;
                    const p = video.play();
                    if (p !== undefined) p.catch(() => {});
                } else {
                    if (!video.paused) video.pause();
                }
            });
        }, { threshold: [0.1, 0.25, 0.5] });

        allVideos.forEach(v => {
            v.muted = true;
            v.setAttribute('muted', '');
            v.setAttribute('playsinline', '');
            videoObserver.observe(v);
        });
    }

    // 2. Floating Quick Dock — hide while scrolling, reappear after scroll stops
    (function initDockScroll() {
        const dock = document.querySelector('.floating-quick-dock');
        if (!dock) return;

        let ticking = false;
        let hideTimer = null;
        let isHidden = false;

        function hideDock() {
            if (!isHidden) {
                dock.classList.add('dock-hidden');
                isHidden = true;
            }
        }

        function showDock() {
            if (isHidden) {
                dock.classList.remove('dock-hidden');
                isHidden = false;
            }
        }

        window.addEventListener('scroll', function () {
            // Clear any pending show-timer on each scroll tick
            clearTimeout(hideTimer);

            if (!ticking) {
                requestAnimationFrame(function () {
                    hideDock();
                    ticking = false;
                });
                ticking = true;
            }

            // Show dock 0.4s after the last scroll event
            hideTimer = setTimeout(showDock, 400);
        }, { passive: true });
    })();

    // 3. Lazy-Loaded AI Scanner Lead-Capture Modal Trigger
    let scannerAssetsLoading = false;

    function openScannerModalLazy() {
        if (window.KezzaScannerModal && typeof window.KezzaScannerModal.open === 'function') {
            window.KezzaScannerModal.open();
            return;
        }

        if (scannerAssetsLoading) return;
        scannerAssetsLoading = true;

        // 1. Inject CSS if not already present
        if (!document.querySelector('link[href*="scanner-modal.css"]')) {
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = 'css/scanner-modal.css?v=6.0';
            document.head.appendChild(cssLink);
        }

        // 2. Inject JS and open modal once loaded
        if (!document.querySelector('script[src*="scanner-modal.js"]')) {
            const script = document.createElement('script');
            script.src = 'js/scanner-modal.js?v=6.4';
            script.defer = true;
            script.onload = () => {
                scannerAssetsLoading = false;
                if (window.KezzaScannerModal && typeof window.KezzaScannerModal.open === 'function') {
                    window.KezzaScannerModal.open();
                }
            };
            script.onerror = () => {
                scannerAssetsLoading = false;
                console.error('Failed to load Kezza AI Scanner modal assets.');
            };
            document.body.appendChild(script);
        }
    }

    // Intercept all AI Scanner entry points across all pages
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.nav-scanner-link, .btn-scanner-hero, .dock-scan, [data-open-scanner-modal], a[href*="face-scanner.html"]');
        if (trigger) {
            e.preventDefault();
            e.stopPropagation();
            openScannerModalLazy();
        }
    });

    // 4. Auto-open AI Scanner modal once per session
    if (!sessionStorage.getItem('kz_scanner_shown')) {
        setTimeout(function () {
            openScannerModalLazy();
            sessionStorage.setItem('kz_scanner_shown', '1');
        }, 2500);
    }
});


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

    // 2. Auto-Hide Floating Quick Dock during Active Scrolling
    const dockEl = document.getElementById('floatingQuickDock');
    let scrollStopTimer = null;

    if (dockEl) {
        window.addEventListener('scroll', () => {
            dockEl.classList.add('dock-hidden');
            clearTimeout(scrollStopTimer);
            scrollStopTimer = setTimeout(() => {
                dockEl.classList.remove('dock-hidden');
            }, 350);
        }, { passive: true });
    }

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
            cssLink.href = 'css/scanner-modal.css?v=5.0';
            document.head.appendChild(cssLink);
        }

        // 2. Inject JS and open modal once loaded
        if (!document.querySelector('script[src*="scanner-modal.js"]')) {
            const script = document.createElement('script');
            script.src = 'js/scanner-modal.js?v=5.0';
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
});


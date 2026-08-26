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
});

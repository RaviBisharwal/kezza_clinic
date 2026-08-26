// Kezza Clinic - Main Script

document.addEventListener('DOMContentLoaded', function() {

    // Navbar scroll effect - add shadow when scrolled
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.boxShadow = 'none';
            }
        });
    }

    // Add lazy loading to below-fold images
    const images = document.querySelectorAll('img');
    images.forEach(function(img, index) {
        // Skip first 2 images (hero), lazy load the rest
        if (index > 1) {
            img.setAttribute('loading', 'lazy');
        }
    });

    // Auto-Play videos automatically on scroll when in viewport
    const videos = document.querySelectorAll('video');
    if ('IntersectionObserver' in window) {
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

        videos.forEach(function(video) {
            video.muted = true;
            video.setAttribute('muted', '');
            video.setAttribute('playsinline', '');
            videoObserver.observe(video);
        });
    }
});

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

    // Add preload="none" to videos so they don't auto-download
    const videos = document.querySelectorAll('video');
    videos.forEach(function(video) {
        video.setAttribute('preload', 'metadata');
    });
});

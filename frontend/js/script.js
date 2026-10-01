// Kezza Clinic - Main Script (home, hair transplant, blog and location pages)
// Video autoplay lives in quick-actions.js and the services category switcher in
// services-navigation.js; both are loaded on every page that loads this file.

document.addEventListener('DOMContentLoaded', function() {

    // Navbar scroll effect - add shadow when scrolled (state-guarded + RAF)
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        let isScrolled = false;
        let ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(function() {
                    const shouldBeScrolled = (window.pageYOffset || document.documentElement.scrollTop || 0) > 50;
                    if (shouldBeScrolled !== isScrolled) {
                        isScrolled = shouldBeScrolled;
                        navbar.style.boxShadow = isScrolled ? '0 2px 20px rgba(0, 0, 0, 0.1)' : 'none';
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // Lazy-load every image except the first two (hero)
    document.querySelectorAll('img').forEach(function(img, index) {
        if (index > 1) img.setAttribute('loading', 'lazy');
    });
});

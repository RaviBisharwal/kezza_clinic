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

    // ── Interactive Services Category & Tab Switcher ──────────────
    const categoryCards = document.querySelectorAll('.service-category-card');
    const viewerTabs = document.querySelectorAll('.viewer-tab-btn');
    const tabPanels = document.querySelectorAll('.treatment-tab-panel');
    const servicesViewer = document.getElementById('servicesViewer');

    function switchServiceCategory(catName, shouldScroll = false) {
        if (!catName) return;

        // 1. Update top category cards
        categoryCards.forEach(card => {
            if (card.getAttribute('data-category') === catName) {
                card.classList.add('active-category');
            } else {
                card.classList.remove('active-category');
            }
        });

        // 2. Update viewer tab buttons
        viewerTabs.forEach(tab => {
            if (tab.getAttribute('data-category') === catName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // 3. Update tab panels
        tabPanels.forEach(panel => {
            if (panel.getAttribute('data-category') === catName) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });

        // 4. Smooth scroll to viewer if triggered from category card click
        if (shouldScroll && servicesViewer) {
            const yOffset = -90;
            const y = servicesViewer.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }

    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const cat = this.getAttribute('data-category');
            switchServiceCategory(cat, true);
        });
    });

    viewerTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.stopPropagation();
            const cat = this.getAttribute('data-category');
            switchServiceCategory(cat, false);
        });
    });

    // ── Expandable Doctor Story / Bio Details ─────────────────────
    document.querySelectorAll('.doctor-card').forEach(card => {
        const readMoreBtn = card.querySelector('.doctor-read-more-btn');
        if (readMoreBtn) {
            readMoreBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const isExpanded = card.classList.toggle('is-expanded');
                const label = this.querySelector('.read-more-text');
                if (label) {
                    label.textContent = isExpanded ? 'Show Less' : '... More Info';
                }
                this.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
            });
        }
    });
});

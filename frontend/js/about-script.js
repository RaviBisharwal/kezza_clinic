// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;
        try {
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        } catch (err) {}
    });
});

// Optimized Single RAF Scroll Handler
(function() {
    let ticking = false;
    let isScrolled = false;
    let navbar = null;
    let heroImage = null;
    let particles = null;
    let heroContent = null;

    document.addEventListener('DOMContentLoaded', function() {
        navbar = document.querySelector('.navbar');
        heroImage = document.querySelector('.hero-image img');
        particles = document.querySelectorAll('.particles');
        heroContent = document.querySelector('.hero-content');
    });

    function onScrollTick() {
        const scrolled = window.pageYOffset || document.documentElement.scrollTop || 0;

        // Navbar styling (only mutate when crossing 50px threshold)
        const shouldBeScrolled = scrolled > 50;
        if (shouldBeScrolled !== isScrolled && navbar) {
            isScrolled = shouldBeScrolled;
            if (isScrolled) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = 'none';
            }
        }

        // Hero parallax (only active while hero is near viewport)
        if (scrolled < window.innerHeight) {
            if (heroImage) {
                heroImage.style.transform = `translate3d(0, ${scrolled * -0.25}px, 0)`;
            }
            if (particles && particles.length > 0) {
                const rate = scrolled * -0.15;
                particles.forEach(p => {
                    p.style.transform = `translate3d(0, ${rate}px, 0)`;
                });
            }
            if (heroContent) {
                heroContent.style.opacity = Math.max(0, 1 - scrolled / 500);
            }
        }

        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(onScrollTick);
            ticking = true;
        }
    }, { passive: true });
})();

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            
            // Special handling for different animation types
            if (entry.target.classList.contains('value-card')) {
                entry.target.style.animation = 'bounceIn 0.8s ease forwards';
            }
            if (entry.target.classList.contains('tech-card')) {
                entry.target.style.animation = 'slideUp 0.8s ease forwards';
            }
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll(
        '.value-card, .doctor-card, .tech-card, .branch-card, .testimonial-card'
    );
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
});

// Mouse move parallax for hero image
document.addEventListener('DOMContentLoaded', function() {
    const heroImage = document.querySelector('.hero-image img');
    const heroSection = document.querySelector('.about-hero-section');
    
    if (heroImage && heroSection) {
        heroSection.addEventListener('mousemove', function(e) {
            const rect = heroSection.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            
            const moveX = (x - 0.5) * 20;
            const moveY = (y - 0.5) * 20;
            
            heroImage.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
        
        heroSection.addEventListener('mouseleave', function() {
            heroImage.style.transform = 'translate(0, 0)';
        });
    }
});

// Video playback handled smoothly by IntersectionObserver in quick-actions.js

// Enhanced hover effects for cards
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.value-card, .doctor-card, .tech-card, .branch-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.02)';
            this.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.2)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
        });
    });
});

// Testimonials carousel auto-rotation
document.addEventListener('DOMContentLoaded', function() {
    const testimonials = document.querySelectorAll('.testimonial-card');
    let currentTestimonial = 0;
    
    function highlightTestimonial(index) {
        testimonials.forEach((testimonial, i) => {
            if (i === index) {
                testimonial.style.transform = 'scale(1.05)';
                testimonial.style.background = 'rgba(255, 255, 255, 0.2)';
            } else {
                testimonial.style.transform = 'scale(1)';
                testimonial.style.background = 'rgba(255, 255, 255, 0.1)';
            }
        });
    }
    
    function nextTestimonial() {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        highlightTestimonial(currentTestimonial);
    }
    
    // Auto-rotate testimonials every 4 seconds
    if (testimonials.length > 0) {
        highlightTestimonial(0);
        setInterval(nextTestimonial, 4000);
    }
});

// Animated counters for statistics (if needed)
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    }
    
    updateCounter();
}

// Enhanced button interactions
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-consultation, .whatsapp-btn');
    
    buttons.forEach(button => {
        // Ripple effect
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
        
        // Hover effects
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
            this.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.2)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });
});

// Scroll-triggered animations for specific elements
const scrollAnimations = {
    '.gold-divider': {
        animation: 'expandWidth 1.5s ease forwards',
        delay: 500
    },
    '.gold-accent-line': {
        animation: 'expandWidth 1s ease forwards',
        delay: 300
    }
};

Object.keys(scrollAnimations).forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
        const elementObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.animation = scrollAnimations[selector].animation;
                    }, scrollAnimations[selector].delay);
                    elementObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        elementObserver.observe(element);
    });
});



// Loading animation
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Enhanced scroll effects handled in unified RAF loop above

// Add CSS for ripple effect
const rippleCSS = `
.ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple-animation 0.6s linear;
    pointer-events: none;
}

@keyframes ripple-animation {
    to {
        transform: scale(4);
        opacity: 0;
    }
}

.value-icon {
    animation: bounce 2s infinite;
}

@keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
    }
    40% {
        transform: translateY(-10px);
    }
    60% {
        transform: translateY(-5px);
    }
}
`;

const style = document.createElement('style');
style.textContent = rippleCSS;
document.head.appendChild(style);

// Lazy loading for images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
});

// Enhanced micro-interactions
document.addEventListener('DOMContentLoaded', function() {
    // Add shine effect to doctor cards
    const doctorCards = document.querySelectorAll('.doctor-card');
    doctorCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const shine = document.createElement('div');
            shine.className = 'shine-effect';
            shine.style.cssText = `
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                transition: left 0.5s ease;
                pointer-events: none;
            `;
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(shine);
            
            setTimeout(() => {
                shine.style.left = '100%';
            }, 50);
            
            setTimeout(() => {
                shine.remove();
            }, 600);
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

    // ── Interactive Patient Review Filters ────────────────────────
    const filterPills = document.querySelectorAll('.reviews-filter-pill');
    const reviewCards = document.querySelectorAll('.reviews-grid .review-card');

    if (filterPills.length > 0 && reviewCards.length > 0) {
        filterPills.forEach(pill => {
            pill.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter') || 'all';

                // Toggle active filter state
                filterPills.forEach(p => p.classList.remove('active'));
                this.classList.add('active');

                // Filter cards with smooth transition
                reviewCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    if (filter === 'all' || category === filter) {
                        card.style.display = 'flex';
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(12px)';
                        setTimeout(() => {
                            card.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 20);
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // ── Video Interactive Play Overlay Triggers ───────────────────
    const videoWraps = document.querySelectorAll('.review-video-wrap');
    videoWraps.forEach(wrap => {
        const video = wrap.querySelector('video');
        const overlay = wrap.querySelector('.video-interactive-overlay');
        if (!video || !overlay) return;

        // Click overlay to play/pause
        overlay.addEventListener('click', function(e) {
            e.stopPropagation();
            if (video.paused) {
                // Pause other playing videos to avoid noise overlap
                document.querySelectorAll('.review-video-wrap video').forEach(v => {
                    if (v !== video && !v.paused) {
                        v.pause();
                    }
                });
                video.play().catch(() => {});
            } else {
                video.pause();
            }
        });

        // Sync overlay visibility with video events
        video.addEventListener('play', () => overlay.classList.add('is-playing'));
        video.addEventListener('pause', () => overlay.classList.remove('is-playing'));
        video.addEventListener('ended', () => overlay.classList.remove('is-playing'));
    });
});

console.log('Kezza Clinic About page loaded successfully! ✨');
// In-page anchor scrolling (with the fixed-navbar offset) is handled by smooth-scroll.js.
// Optimized Single RAF Scroll Handler
(function() {
    let ticking = false;
    let isScrolled = false;
    let navbar = null;
    let heroImage = null;
    let heroContent = null;

    document.addEventListener('DOMContentLoaded', function() {
        navbar = document.querySelector('.navbar');
        heroImage = document.querySelector('.hero-image');
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
            if (heroContent) {
                heroContent.style.opacity = Math.max(0, 1 - scrolled / 600);
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

// Mouse move parallax for hero image
document.addEventListener('DOMContentLoaded', function() {
    const heroImage = document.querySelector('.hero-image');
    const heroSection = document.querySelector('.branches-hero-section');
    
    if (heroImage && heroSection) {
        heroSection.addEventListener('mousemove', function(e) {
            const rect = heroSection.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            
            const moveX = (x - 0.5) * 15;
            const moveY = (y - 0.5) * 15;
            
            heroImage.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
        
        heroSection.addEventListener('mouseleave', function() {
            heroImage.style.transform = 'translate(0, 0)';
        });
    }
});

// Button hover effects with ripple
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn-gold, .btn-navy, .btn-primary, .btn-cta-phone, .btn-cta-whatsapp, .btn-cta-consultation');
    
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
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
        
        // Enhanced hover effects
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02) translateZ(10px)';
            this.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.2)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1) translateZ(0)';
        });
    });
});

// Add CSS for additional animations
const additionalCSS = `
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

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
`;

const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);

// Loading animation
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});


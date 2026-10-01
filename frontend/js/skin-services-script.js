// In-page anchor scrolling (with the fixed-navbar offset) is handled by smooth-scroll.js.
// Optimized Single RAF Scroll Handler
(function() {
    let ticking = false;
    let isScrolled = false;
    let navbar = null;

    document.addEventListener('DOMContentLoaded', function() {
        navbar = document.querySelector('.navbar');
    });

    function onScrollTick() {
        const scrolled = window.pageYOffset || document.documentElement.scrollTop || 0;

        // Navbar styling (only mutate when crossing 50px threshold)
        const shouldBeScrolled = scrolled > 50;
        if (shouldBeScrolled !== isScrolled && navbar) {
            isScrolled = shouldBeScrolled;
            if (isScrolled) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.08)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = 'none';
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

// Interactive Sub-Navigation ScrollSpy
document.addEventListener('DOMContentLoaded', function() {
    const subnavPills = document.querySelectorAll('.subnav-pill');
    if (!subnavPills.length) return;

    const sections = Array.from(subnavPills).map(pill => {
        const id = pill.getAttribute('href').replace('#', '');
        return document.getElementById(id);
    }).filter(Boolean);

    function updateActivePill() {
        const scrollPos = (window.pageYOffset || document.documentElement.scrollTop || 0) + 160;
        let currentSection = null;

        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            const top = section.offsetTop;
            const height = section.offsetHeight;
            if (scrollPos >= top && scrollPos < top + height) {
                currentSection = section;
                break;
            }
        }

        if (currentSection) {
            const targetId = currentSection.id;
            subnavPills.forEach(pill => {
                const href = pill.getAttribute('href').replace('#', '');
                if (href === targetId) {
                    pill.classList.add('active');
                } else {
                    pill.classList.remove('active');
                }
            });
        }
    }

    window.addEventListener('scroll', updateActivePill, { passive: true });
    updateActivePill();
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            
            // Special animations for different elements
            if (entry.target.classList.contains('pigmentation-card')) {
                entry.target.style.animation = 'slideInSequential 0.8s ease forwards';
            }
            if (entry.target.classList.contains('medical-card')) {
                entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
            }
            if (entry.target.classList.contains('faq-item')) {
                entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
            }
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll(
        '.pigmentation-card, .medical-card, .timeline-step, .faq-item'
    );
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
});

// Staggered animation for pigmentation cards
document.addEventListener('DOMContentLoaded', function() {
    const pigmentationCards = document.querySelectorAll('.pigmentation-card');
    pigmentationCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
    });
});

// Mouse move parallax for hero image
document.addEventListener('DOMContentLoaded', function() {
    const heroImage = document.querySelector('.hero-image img');
    const heroSection = document.querySelector('.skin-hero-section');
    
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

// FAQ Accordion functionality
document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    otherAnswer.style.maxHeight = '0';
                }
            });
            
            // Toggle current item
            if (isActive) {
                item.classList.remove('active');
                answer.style.maxHeight = '0';
            } else {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });
});

// Enhanced hover effects for service images
document.addEventListener('DOMContentLoaded', function() {
    const serviceImages = document.querySelectorAll('.service-image img, .pigmentation-card img, .laser-hero-image img');
    
    serviceImages.forEach(img => {
        img.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.08)';
            this.style.filter = 'brightness(1.1)';
        });
        
        img.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.filter = 'brightness(1)';
        });
    });
});

// Button hover effects with ripple
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn-gold, .btn-navy, .btn-primary, .btn-consultation');
    
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
        
        // Enhanced hover effects
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
            this.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.2)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = 'none';
        });
    });
});

// Card hover effects with shimmer
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.pigmentation-card, .medical-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.02)';
            this.style.boxShadow = '0 25px 50px rgba(212, 175, 55, 0.2)';
            
            // Add shimmer effect
            const shimmer = document.createElement('div');
            shimmer.className = 'card-shimmer';
            shimmer.style.cssText = `
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                transition: left 0.6s ease;
                pointer-events: none;
                z-index: 1;
            `;
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(shimmer);
            
            setTimeout(() => {
                shimmer.style.left = '100%';
            }, 50);
            
            setTimeout(() => {
                shimmer.remove();
            }, 700);
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
        });
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

// Video playback handled smoothly by IntersectionObserver in quick-actions.js

// Smooth reveal animations for content sections
document.addEventListener('DOMContentLoaded', function() {
    const contentSections = document.querySelectorAll('.service-content, .section-header, .laser-content');
    
    const contentObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.2 });
    
    contentSections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'all 0.8s ease';
        contentObserver.observe(section);
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

@keyframes pulse {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.1);
    }
    100% {
        transform: scale(1);
    }
}

.medical-icon {
    animation: bounce 2s infinite;
}

.step-number {
    position: relative;
    overflow: hidden;
}

.step-number::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: left 0.5s ease;
}

.timeline-step:hover .step-number::before {
    left: 100%;
}

.sparkle-particles {
    animation: sparkleFloat 8s ease-in-out infinite;
}

@keyframes sparkleFloat {
    0%, 100% {
        transform: translateY(0px) rotate(0deg);
    }
    50% {
        transform: translateY(-10px) rotate(180deg);
    }
}
`;

const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);

// Staggered animation delay for medical cards
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.medical-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
});

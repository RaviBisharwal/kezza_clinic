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

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
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
            if (entry.target.classList.contains('hairline-card')) {
                entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
            }
            if (entry.target.classList.contains('treatment-card')) {
                entry.target.style.animation = 'slideUp 0.8s ease forwards';
            }
            if (entry.target.classList.contains('timeline-step')) {
                entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
            }
            if (entry.target.classList.contains('faq-item')) {
                entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
            }
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll(
        '.hairline-card, .treatment-card, .timeline-step, .faq-item'
    );
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
});

// Parallax effect for hero image
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const heroImage = document.querySelector('.hero-image img');
    
    if (heroImage && scrolled < window.innerHeight) {
        const rate = scrolled * -0.3;
        heroImage.style.transform = `translateY(${rate}px)`;
    }
});

// Mouse move parallax for hero image
document.addEventListener('DOMContentLoaded', function() {
    const heroImage = document.querySelector('.hero-image img');
    const heroSection = document.querySelector('.hair-hero-section');
    
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

// Video controls and effects
document.addEventListener('DOMContentLoaded', function() {
    const videos = document.querySelectorAll('video');
    
    videos.forEach(video => {
        // Add hover glow effect to video containers
        const container = video.closest('.video-container');
        if (container) {
            container.addEventListener('mouseenter', function() {
                this.style.boxShadow = '0 25px 50px rgba(212, 175, 55, 0.5)';
                this.style.borderColor = '#F4E4BC';
            });
            
            container.addEventListener('mouseleave', function() {
                this.style.boxShadow = '0 20px 40px rgba(212, 175, 55, 0.3)';
                this.style.borderColor = '#D4AF37';
            });
        }
    });
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
    const serviceImages = document.querySelectorAll('.service-image img, .treatment-card img');
    
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

// Timeline step hover effects
document.addEventListener('DOMContentLoaded', function() {
    const timelineSteps = document.querySelectorAll('.timeline-step');
    
    timelineSteps.forEach((step, index) => {
        step.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            
            // Add ripple effect
            const stepNumber = this.querySelector('.step-number');
            stepNumber.style.animation = 'pulse 0.6s ease';
        });
        
        step.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            
            const stepNumber = this.querySelector('.step-number');
            stepNumber.style.animation = 'none';
        });
        
        // Staggered animation on scroll
        setTimeout(() => {
            step.style.animationDelay = `${index * 0.1}s`;
        }, 100);
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

// Scroll-triggered animations for dividers
const scrollAnimations = {
    '.gold-border-highlight': {
        animation: 'expandWidth 1.5s ease forwards',
        delay: 500
    },
    '.gold-divider': {
        animation: 'expandWidth 1s ease forwards',
        delay: 300
    },
    '.gold-underline': {
        animation: 'expandWidth 1s ease forwards',
        delay: 400
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

// Enhanced scroll effects
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    
    // Parallax for hair particles
    const particles = document.querySelectorAll('.hair-particles');
    particles.forEach(particle => {
        const rate = scrolled * -0.2;
        particle.style.transform = `translateY(${rate}px)`;
    });
    
    // Fade effect for hero content on scroll
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        const opacity = Math.max(0, 1 - scrolled / 600);
        heroContent.style.opacity = opacity;
    }
});

// Service card interactions
document.addEventListener('DOMContentLoaded', function() {
    const serviceCards = document.querySelectorAll('.treatment-card, .hairline-card');
    
    serviceCards.forEach(card => {
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

.card-icon {
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
`;

const style = document.createElement('style');
style.textContent = additionalCSS;
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

// Video auto-play on scroll (muted)
function handleVideoOnScroll() {
    const videos = document.querySelectorAll('video');
    
    videos.forEach(video => {
        const rect = video.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isVisible && video.paused) {
            video.muted = true;
            video.play().catch(e => console.log('Video autoplay prevented'));
        } else if (!isVisible && !video.paused) {
            video.pause();
        }
    });
}

window.addEventListener('scroll', handleVideoOnScroll);

// Smooth reveal animations for content sections
document.addEventListener('DOMContentLoaded', function() {
    const contentSections = document.querySelectorAll('.service-content, .section-header');
    
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

console.log('Kezza Hair Services page loaded successfully! 💇‍♂️');
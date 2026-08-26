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
            if (entry.target.classList.contains('why-card')) {
                entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
            }
            if (entry.target.classList.contains('process-step')) {
                entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
            }
            if (entry.target.classList.contains('case-study')) {
                entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
            }
            if (entry.target.classList.contains('faq-item')) {
                entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
            }
            if (entry.target.classList.contains('service-detail-card')) {
                entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
            }
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll(
        '.why-card, .process-step, .case-study, .faq-item, .service-detail-card, .gallery-item'
    );
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
});

// Staggered animation for cards
document.addEventListener('DOMContentLoaded', function() {
    const whyCards = document.querySelectorAll('.why-card');
    whyCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
    
    const processSteps = document.querySelectorAll('.process-step');
    processSteps.forEach((step, index) => {
        step.style.animationDelay = `${index * 0.15}s`;
    });
    
    const caseStudies = document.querySelectorAll('.case-study');
    caseStudies.forEach((study, index) => {
        study.style.animationDelay = `${index * 0.1}s`;
    });
});

// Parallax effect for hero image
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const heroImage = document.querySelector('.hero-image');
    
    if (heroImage && scrolled < window.innerHeight) {
        const rate = scrolled * -0.3;
        heroImage.style.transform = `translateY(${rate}px)`;
    }
});

// Mouse move parallax for hero image
document.addEventListener('DOMContentLoaded', function() {
    const heroImage = document.querySelector('.hero-image');
    const heroSection = document.querySelector('.pmu-hero-section');
    
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

// Enhanced hover effects for service cards
document.addEventListener('DOMContentLoaded', function() {
    const serviceCards = document.querySelectorAll('.service-detail-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) rotateX(2deg) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) rotateX(0) scale(1)';
        });
    });
});

// 3D tilt effect for why cards
document.addEventListener('DOMContentLoaded', function() {
    const whyCards = document.querySelectorAll('.why-card');
    
    whyCards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });
});

// Process step hover effects with enhanced animations
document.addEventListener('DOMContentLoaded', function() {
    const processSteps = document.querySelectorAll('.process-step');
    
    processSteps.forEach((step, index) => {
        step.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) rotateX(5deg) scale(1.05) translateZ(40px)';
            
            // Add pulse effect to step number
            const stepNumber = this.querySelector('.step-number');
            stepNumber.style.animation = 'pulse 0.6s ease';
        });
        
        step.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) rotateX(0) scale(1) translateZ(0)';
            
            const stepNumber = this.querySelector('.step-number');
            stepNumber.style.animation = 'none';
        });
    });
});

// Button hover effects with ripple
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn-gold, .btn-navy, .btn-primary, .btn-cta-phone, .btn-cta-whatsapp');
    
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

// Card hover effects with shimmer
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.why-card, .case-study, .service-detail-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
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
    });
});

// Scroll-triggered animations for dividers
const scrollAnimations = {
    '.gold-underline': {
        animation: 'expandWidth 1.5s ease forwards',
        delay: 500
    },
    '.gold-divider': {
        animation: 'expandWidth 1s ease forwards',
        delay: 300
    },
    '.gold-divider-small': {
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

// Enhanced scroll effects
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    
    // Parallax for sparkle particles
    const particles = document.querySelectorAll('.sparkle-particles');
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

// Smooth reveal animations for content sections
document.addEventListener('DOMContentLoaded', function() {
    const contentSections = document.querySelectorAll('.section-content, .section-header, .aftercare-list');
    
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

// Gallery item hover effects
document.addEventListener('DOMContentLoaded', function() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const placeholder = this.querySelector('.image-placeholder');
            placeholder.style.transform = 'rotateY(-10deg) scale(1.05) translateZ(30px)';
        });
        
        item.addEventListener('mouseleave', function() {
            const placeholder = this.querySelector('.image-placeholder');
            placeholder.style.transform = 'rotateY(0) scale(1) translateZ(0)';
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

// Enhanced why card icon animations
document.addEventListener('DOMContentLoaded', function() {
    const whyCards = document.querySelectorAll('.why-card');
    
    whyCards.forEach((card, index) => {
        // Staggered animation delay
        card.style.animationDelay = `${index * 0.1}s`;
        
        // Enhanced hover with icon animation
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.why-icon');
            icon.style.animation = 'bounceIcon 0.6s ease';
            icon.style.transform = 'scale(1.2) rotateY(360deg)';
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.why-icon');
            icon.style.animation = 'floatIcon 3s ease-in-out infinite';
            icon.style.transform = 'scale(1) rotateY(0deg)';
        });
    });
});

// Aftercare list item interactions
document.addEventListener('DOMContentLoaded', function() {
    const aftercareItems = document.querySelectorAll('.aftercare-items li');
    
    aftercareItems.forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.05}s`;
        
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(10px) translateZ(10px)';
            this.style.borderLeftColor = 'var(--gold)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0) translateZ(0)';
            this.style.borderLeftColor = 'var(--primary)';
        });
    });
});

// Service detail card image parallax
document.addEventListener('DOMContentLoaded', function() {
    const serviceCards = document.querySelectorAll('.service-detail-card');
    
    serviceCards.forEach(card => {
        const image = card.querySelector('.service-detail-image');
        
        if (image) {
            card.addEventListener('mousemove', function(e) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;
                
                image.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
            });
            
            card.addEventListener('mouseleave', function() {
                image.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
            });
        }
    });
});

// CTA button pulse animation on scroll
document.addEventListener('DOMContentLoaded', function() {
    const ctaSection = document.querySelector('.final-cta-section');
    const ctaButtons = document.querySelectorAll('.btn-cta-phone, .btn-cta-whatsapp');
    
    if (ctaSection) {
        const ctaObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    ctaButtons.forEach((button, index) => {
                        setTimeout(() => {
                            button.style.animation = 'pulse 1s ease';
                            setTimeout(() => {
                                button.style.animation = '';
                            }, 1000);
                        }, index * 200);
                    });
                }
            });
        }, { threshold: 0.5 });
        
        ctaObserver.observe(ctaSection);
    }
});

console.log('Kezza Permanent Makeup page loaded successfully! ✨');


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
        particles = document.querySelectorAll('.hair-particles');
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

// Legacy observer removed in favor of unified initScrollReveal() below

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

// Enhanced scroll effects handled in unified RAF loop above

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

// Video playback handled smoothly by IntersectionObserver in quick-actions.js

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
/* ══════════════════════════════════════════════════════════════
   HAIR LOSS SCALE SECTION — Scroll-Triggered Animations
══════════════════════════════════════════════════════════════ */
(function initHairLossScale() {
    let animated = false;

    // IntersectionObserver for cards and stat cards
    const cardObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                cardObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    // Observe Norwood cards with staggered delay
    document.querySelectorAll('.norwood-card').forEach((card, i) => {
        card.style.transitionDelay = `${i * 0.08}s`;
        cardObserver.observe(card);
    });

    // Observe stat cards with staggered delay
    document.querySelectorAll('.hls-stat-card').forEach((card, i) => {
        card.style.transitionDelay = `${i * 0.1}s`;
        cardObserver.observe(card);
    });

    // Animate cause bars + damage meters + SVG rings on scroll into view
    const causesSection = document.querySelector('.hls-causes');
    if (causesSection) {
        const causesObserver = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !animated) {
                animated = true;

                // Animate cause bar fills
                document.querySelectorAll('.cause-bar-fill').forEach((bar, i) => {
                    const w = parseInt(bar.dataset.width || 0, 10);
                    setTimeout(() => {
                        bar.style.width = w + '%';
                    }, i * 120);
                });

                causesObserver.disconnect();
            }
        }, { threshold: 0.25 });
        causesObserver.observe(causesSection);
    }

    // Animate damage meter bars when each card comes into view
    const meterObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fill = entry.target.querySelector('.meter-fill');
                if (fill) {
                    // Already has inline width set, just trigger transition
                    const w = fill.style.width;
                    fill.style.width = '0';
                    setTimeout(() => { fill.style.width = w; }, 80);
                }
                meterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    document.querySelectorAll('.norwood-card').forEach(card => {
        meterObserver.observe(card);
    });

    // Animate SVG ring circles (stat cards)
    const ringObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate the circle stroke-dashoffset
                const circles = entry.target.querySelectorAll('.hls-radial circle:last-child');
                circles.forEach(circle => {
                    const targetOffset = circle.getAttribute('stroke-dashoffset');
                    circle.setAttribute('stroke-dashoffset', '226'); // start at 0
                    setTimeout(() => {
                        circle.style.strokeDashoffset = targetOffset;
                    }, 100);
                });
                ringObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    document.querySelectorAll('.hls-stat-card').forEach(card => {
        ringObserver.observe(card);
    });

})();

// ── Verified Hair Transplant Transformation Showcase Controller ──
(function() {
    function initTransformationShowcase() {
        const toggleBtns = document.querySelectorAll('.transformation-view-controls .view-toggle-btn');
        const sideBySideWrap = document.getElementById('htSideBySideWrap');
        const sliderWrap = document.getElementById('htInteractiveSliderWrap');
        const rangeInput = document.getElementById('htRangeSlider');
        
        // 1. View Switcher (Interactive Split Slider vs Side-by-Side)
        if (toggleBtns.length && sideBySideWrap && sliderWrap) {
            toggleBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const targetView = this.getAttribute('data-view');
                    toggleBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');

                    if (targetView === 'slider') {
                        sideBySideWrap.style.display = 'none';
                        sliderWrap.style.display = 'block';
                    } else {
                        sliderWrap.style.display = 'none';
                        sideBySideWrap.style.display = 'grid';
                    }
                });
            });
        }

        // 2. Real Interactive Split Slider Controller
        if (sliderWrap) {
            function setSliderPos(val) {
                val = Math.max(0, Math.min(100, parseFloat(val)));
                sliderWrap.style.setProperty('--slider-pos', `${val}%`);
                if (rangeInput) rangeInput.value = val;
            }

            // Sync with range input (supports mouse drag, keyboard arrows, and mobile touch scrubbing)
            if (rangeInput) {
                rangeInput.addEventListener('input', function() {
                    setSliderPos(this.value);
                });
                rangeInput.addEventListener('change', function() {
                    setSliderPos(this.value);
                });
            }

            // Pointer events for direct click/drag on any part of the image
            function updateFromPointer(e) {
                const rect = sliderWrap.getBoundingClientRect();
                if (rect.width <= 0) return;
                const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                setSliderPos(pct);
            }

            sliderWrap.addEventListener('pointerdown', function(e) {
                // If user didn't directly hit range input, set pointer capture and update
                try { sliderWrap.setPointerCapture(e.pointerId); } catch(err) {}
                updateFromPointer(e);
            });

            sliderWrap.addEventListener('pointermove', function(e) {
                if (e.buttons === 1) {
                    updateFromPointer(e);
                }
            });

            sliderWrap.addEventListener('pointerup', function(e) {
                try { sliderWrap.releasePointerCapture(e.pointerId); } catch(err) {}
            });

            // Set initial state to 50%
            setSliderPos(50);

            // Subtle intro hint animation on first scroll into view
            let hasAnimatedHint = false;
            const hintObserver = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && !hasAnimatedHint) {
                    hasAnimatedHint = true;
                    let i = 0;
                    const sequence = [50, 44, 38, 45, 58, 53, 50];
                    const timer = setInterval(() => {
                        if (i >= sequence.length) {
                            clearInterval(timer);
                            return;
                        }
                        setSliderPos(sequence[i]);
                        i++;
                    }, 110);
                    hintObserver.disconnect();
                }
            }, { threshold: 0.35 });
            hintObserver.observe(sliderWrap);
        }

        // 3. High-Definition Lightbox / Image Inspection Modal
        const zoomCards = document.querySelectorAll('.ht-ba-visual-card');
        const modal = document.getElementById('htLightboxModal');
        const modalImg = document.getElementById('htLightboxImg');
        const modalCaption = document.getElementById('htLightboxCaption');
        const modalClose = document.getElementById('htLightboxClose');

        if (modal && modalImg) {
            zoomCards.forEach(card => {
                card.addEventListener('click', function() {
                    const img = this.querySelector('img');
                    const title = this.querySelector('.ht-ba-info-title')?.textContent.trim() || '';
                    const desc = this.querySelector('.ht-ba-info-desc')?.textContent.trim() || '';
                    if (img) {
                        modalImg.src = img.src;
                        modalImg.alt = img.alt;
                        if (modalCaption) {
                            modalCaption.innerHTML = `<strong>${title}</strong> &mdash; ${desc}`;
                        }
                        modal.classList.add('active');
                        document.body.style.overflow = 'hidden';
                    }
                });
            });

            function closeModal() {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }

            if (modalClose) {
                modalClose.addEventListener('click', closeModal);
            }
            modal.addEventListener('click', function(e) {
                if (e.target === modal) closeModal();
            });
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    closeModal();
                }
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTransformationShowcase);
    } else {
        initTransformationShowcase();
    }
})();

// ── Premium "Website Wali Feel" Interactive Animation System ──
(function() {
    // 1. Scroll-Driven Reveal Engine
    function initScrollReveal() {
        const revealElements = document.querySelectorAll(
            '.reveal-on-scroll, .service-showcase-split, .hairline-card-v2, .process-card-step, .norwood-card, .mini-service-card, .treatment-card, .faq-item, .timeline-step, .patient-comment-card, .surgeon-comment-box'
        );

        if (!('IntersectionObserver' in window)) {
            revealElements.forEach(el => el.classList.add('is-revealed'));
            return;
        }

        const revealObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                    obs.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(el => {
            el.classList.add('reveal-on-scroll');
            revealObserver.observe(el);
        });
    }

    // 2. High-Precision Eased Counter Animation
    function initStatCounters() {
        const counterElements = document.querySelectorAll('.counter-stat');
        if (!counterElements.length) return;

        const counterObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseFloat(el.getAttribute('data-target') || 0);
                    const prefix = el.getAttribute('data-prefix') || '';
                    const suffix = el.getAttribute('data-suffix') || '';
                    const format = el.getAttribute('data-format') || '';
                    const isDecimal = String(target).includes('.');
                    const duration = 1800; // ms
                    const startTime = performance.now();

                    function updateNumber(now) {
                        const elapsed = now - startTime;
                        const progress = Math.min(1, elapsed / duration);
                        // Easing: easeOutExpo
                        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                        const current = target * ease;

                        let displayVal;
                        if (isDecimal) {
                            displayVal = current.toFixed(1);
                        } else if (format === 'comma') {
                            displayVal = Math.floor(current).toLocaleString();
                        } else {
                            displayVal = Math.floor(current);
                        }

                        el.textContent = `${prefix}${displayVal}${suffix}`;

                        if (progress < 1) {
                            requestAnimationFrame(updateNumber);
                        } else {
                            let finalVal = isDecimal ? target.toFixed(1) : (format === 'comma' ? target.toLocaleString() : target);
                            el.textContent = `${prefix}${finalVal}${suffix}`;
                        }
                    }

                    requestAnimationFrame(updateNumber);
                    obs.unobserve(el);
                }
            });
        }, { threshold: 0.2 });

        counterElements.forEach(el => counterObserver.observe(el));
    }

    // 3. Smart Sub-Navigation Scroll-Spy & Smooth Auto-Center
    function initSubnavScrollSpy() {
        const navPills = document.querySelectorAll('.hair-subnav-pills .subnav-pill');
        const navContainer = document.getElementById('hairSubnavPills');
        if (!navPills.length) return;

        const sections = [];
        navPills.forEach(pill => {
            const href = pill.getAttribute('href');
            if (href && href.startsWith('#')) {
                const sec = document.querySelector(href);
                if (sec) {
                    sections.push({ id: href, section: sec, pill: pill });
                }
            }
        });

        if (!sections.length) return;

        let activeId = '';
        function updateActivePill() {
            const scrollY = window.pageYOffset || document.documentElement.scrollTop;
            const triggerOffset = 220; // Trigger threshold below top

            let currentSec = null;
            for (let i = sections.length - 1; i >= 0; i--) {
                const top = sections[i].section.offsetTop - triggerOffset;
                if (scrollY >= top) {
                    currentSec = sections[i];
                    break;
                }
            }

            if (!currentSec && sections.length) {
                currentSec = sections[0];
            }

            if (currentSec && currentSec.id !== activeId) {
                activeId = currentSec.id;
                navPills.forEach(p => p.classList.remove('active'));
                currentSec.pill.classList.add('active');

                // Smoothly scroll the pill into the center of the subnav bar if overflowed
                if (navContainer) {
                    const pillLeft = currentSec.pill.offsetLeft;
                    const pillWidth = currentSec.pill.offsetWidth;
                    const containerWidth = navContainer.offsetWidth;
                    const targetScroll = pillLeft - (containerWidth / 2) + (pillWidth / 2);
                    navContainer.scrollTo({
                        left: Math.max(0, targetScroll),
                        behavior: 'smooth'
                    });
                }
            }
        }

        window.addEventListener('scroll', function() {
            requestAnimationFrame(updateActivePill);
        }, { passive: true });

        // Initial run
        setTimeout(updateActivePill, 200);
    }

    // 4. Subtle 3D Card Hover Micro-Interactions
    function initCardMicroInteractions() {
        const cards = document.querySelectorAll('.service-showcase-split, .hairline-card-v2, .stat-box');
        cards.forEach(card => {
            card.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -3;
                const rotateY = ((x - centerX) / centerX) * 3;
                this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = '';
            });
        });
    }

    function initAll() {
        initScrollReveal();
        initStatCounters();
        initSubnavScrollSpy();
        initCardMicroInteractions();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();



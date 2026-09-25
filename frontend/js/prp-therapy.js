/**
 * Kezza Hair & Skin Clinic — PRP & GFC Therapy Interactive Script
 * Enhanced Animations, ScrollSpy, Stat Counters, FAQ Accordion & Mobile Navigation
 */
document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ── 1. Mobile Menu & Service Dropdown Toggles ───────────────
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const servicesToggle = document.getElementById('servicesNavToggle');
    const servicesDropdown = document.getElementById('servicesDropdownMenu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    if (servicesToggle && servicesDropdown) {
        servicesToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = servicesDropdown.classList.toggle('show');
            servicesToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        document.addEventListener('click', (e) => {
            if (!servicesToggle.contains(e.target) && !servicesDropdown.contains(e.target)) {
                servicesDropdown.classList.remove('show');
                servicesToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ── 2. FAQ Accordion ───────────────────────────────────────
    const faqItems = document.querySelectorAll('.prp-faq-item');
    
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.prp-faq-question');
        if (questionBtn) {
            questionBtn.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all other FAQ items for clean single-view accordion
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        const otherBtn = otherItem.querySelector('.prp-faq-question');
                        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                    }
                });
                
                // Toggle clicked item
                if (isActive) {
                    item.classList.remove('active');
                    questionBtn.setAttribute('aria-expanded', 'false');
                } else {
                    item.classList.add('active');
                    questionBtn.setAttribute('aria-expanded', 'true');
                }
            });
        }
    });

    // ── 3. Scroll Reveal & Timeline Progress Animations ────────
    const revealElements = document.querySelectorAll(
        '.prp-stat-card, .prp-step-card, .prp-candidacy-box, .prp-timeline-card, .patient-comment-card, .patient-review-action-card, .prp-media-showcase, .prp-doctor-quote-box, .prp-table-responsive'
    );
    
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');

                    // If timeline card, animate its progress fill bar
                    if (entry.target.classList.contains('prp-timeline-card')) {
                        const fill = entry.target.querySelector('.prp-tl-progress-fill');
                        if (fill) {
                            const targetWidth = fill.style.width;
                            fill.style.width = '0%';
                            requestAnimationFrame(() => {
                                setTimeout(() => {
                                    fill.style.transition = 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
                                    fill.style.width = targetWidth;
                                }, 150);
                            });
                        }
                    }

                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(el => {
            el.classList.add('prp-reveal');
            revealObserver.observe(el);
        });
    } else {
        revealElements.forEach(el => el.classList.add('is-visible'));
    }

    // ── 4. Navbar Elevation & Reading Progress Bar ─────────────
    const navbar = document.querySelector('.navbar');
    const progressBar = document.getElementById('kzScrollProgress');

    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        // Navbar elevation on scroll
        if (navbar) {
            if (scrollY > 30) {
                navbar.classList.add('is-scrolled');
            } else {
                navbar.classList.remove('is-scrolled');
            }
        }

        // Reading progress calculation
        if (progressBar) {
            const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            if (docHeight > 0) {
                const scrollPercent = (scrollY / docHeight);
                progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, scrollPercent))})`;
            }
        }
    }, { passive: true });

    // ── 5. Smooth In-Page Anchor Scrolling ─────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#' && targetId.length > 1) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    const headerOffset = 110;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // ── 6. Sub-Navigation ScrollSpy with Horizontal Auto-Scroll 
    const subnavPills = document.querySelectorAll('.prp-subnav-pill');
    const subnavContainer = document.querySelector('.prp-subnav-pills');

    if (subnavPills.length > 0) {
        const sections = [];
        subnavPills.forEach(pill => {
            const hash = pill.getAttribute('href');
            if (hash && hash.startsWith('#')) {
                const sec = document.querySelector(hash);
                if (sec) sections.push({ id: hash, el: sec, pill: pill });
            }
        });

        window.addEventListener('scroll', () => {
            const scrollY = window.pageYOffset || document.documentElement.scrollTop;
            const triggerOffset = 190;

            let currentSection = sections[0];
            for (let i = 0; i < sections.length; i++) {
                const secTop = sections[i].el.getBoundingClientRect().top + scrollY - triggerOffset;
                if (scrollY >= secTop) {
                    currentSection = sections[i];
                }
            }

            if (currentSection) {
                subnavPills.forEach(p => p.classList.remove('active'));
                currentSection.pill.classList.add('active');

                // Auto-center active pill horizontally on mobile
                if (subnavContainer) {
                    const pillLeft = currentSection.pill.offsetLeft;
                    const pillWidth = currentSection.pill.offsetWidth;
                    const containerWidth = subnavContainer.offsetWidth;
                    subnavContainer.scrollTo({
                        left: pillLeft - (containerWidth / 2) + (pillWidth / 2),
                        behavior: 'smooth'
                    });
                }
            }
        }, { passive: true });
    }

    // ── 7. Clinical PRP Stages & Before/After Showcase Interactive Controller ──
    const stagesCard = document.getElementById('prpStagesCard');
    const stageBtns = document.querySelectorAll('.prp-stage-btn');
    const stagePins = document.querySelectorAll('.prp-stage-pin');
    const quadrantBoxes = document.querySelectorAll('.quadrant-box');
    const captionTitle = document.getElementById('captionTitle');
    const captionDesc = document.getElementById('captionDesc');
    const captionIcon = document.querySelector('#prpStageCaption .caption-icon i');
    const stageCaption = document.getElementById('prpStageCaption');

    const stageData = {
        1: {
            title: "Stage 1 (1st PRP): Initial Follicular Awakening",
            desc: "Targeted micro-delivery of autologous growth factors directly to dormant follicular roots. Stimulates micro-capillary vascularity and initiates the awakening of miniaturized hair follicles.",
            icon: "fa-syringe"
        },
        2: {
            title: "Stage 2 (2nd PRP): Early Telogen to Anagen Sprouting",
            desc: "Visible shift from resting telogen to active anagen growth. Early sprouted vellus hairs strengthen along the anterior hairline as nourishing micro-circulation expands.",
            icon: "fa-seedling"
        },
        3: {
            title: "Stage 3 (3rd PRP): Caliber Thickening & Parting Narrowing",
            desc: "Significant shaft caliber maturation. Miniature hairs convert into pigmented terminal shafts, visibly tightening hairline gaps and reducing daily shedding to baseline.",
            icon: "fa-chart-line"
        },
        4: {
            title: "Stage 4 (4th PRP): Peak Canopy Density & Sustained Coverage",
            desc: "Full maturation of the renewed follicular canopy. Optimal shaft diameter, robust root tensile strength, and sustained aesthetic coverage across hairline and vertex crown.",
            icon: "fa-crown"
        }
    };

    let activeStageIndex = 1;
    let autoStageTimer = null;
    let isUserHoveringStages = false;

    function setPrpStage(stageNum, isManual = false) {
        stageNum = parseInt(stageNum, 10);
        if (stageNum < 1 || stageNum > 4) return;
        activeStageIndex = stageNum;

        // 1. Update Card dataset
        if (stagesCard) {
            stagesCard.setAttribute('data-active-stage', stageNum);
        }

        // 2. Update Stage Nav Buttons
        stageBtns.forEach(btn => {
            const btnStage = parseInt(btn.getAttribute('data-stage'), 10);
            const isActive = btnStage === stageNum;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        // 3. Update Pin markers
        stagePins.forEach(pin => {
            const pinStage = parseInt(pin.getAttribute('data-stage'), 10);
            pin.classList.toggle('active', pinStage === stageNum);
        });

        // 4. Update Quadrant Focus boxes
        quadrantBoxes.forEach(box => {
            const boxStage = parseInt(box.getAttribute('data-stage'), 10);
            box.classList.toggle('active', boxStage === stageNum);
        });

        // 5. Update Dynamic Caption with smooth cross-fade
        const data = stageData[stageNum];
        if (data && stageCaption) {
            stageCaption.style.opacity = '0.4';
            stageCaption.style.transform = 'translateY(3px)';
            setTimeout(() => {
                if (captionTitle) captionTitle.textContent = data.title;
                if (captionDesc) captionDesc.textContent = data.desc;
                if (captionIcon) {
                    captionIcon.className = 'fas ' + data.icon;
                }
                stageCaption.style.opacity = '1';
                stageCaption.style.transform = 'translateY(0)';
            }, 140);
        }

        // If user manually clicked, reset auto timer
        if (isManual && autoStageTimer) {
            clearInterval(autoStageTimer);
            startAutoStageCycle();
        }
    }

    // Attach click listeners to stage buttons
    stageBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const stage = btn.getAttribute('data-stage');
            setPrpStage(stage, true);
        });
    });

    // Attach click listeners to pins & quadrants
    stagePins.forEach(pin => {
        pin.addEventListener('click', () => {
            const stage = pin.getAttribute('data-stage');
            setPrpStage(stage, true);
        });
    });

    quadrantBoxes.forEach(box => {
        box.addEventListener('click', () => {
            const stage = box.getAttribute('data-stage');
            setPrpStage(stage, true);
        });
    });

    // Pause auto cycle on hover
    if (stagesCard) {
        stagesCard.addEventListener('mouseenter', () => {
            isUserHoveringStages = true;
        });
        stagesCard.addEventListener('mouseleave', () => {
            isUserHoveringStages = false;
        });
    }

    function startAutoStageCycle() {
        autoStageTimer = setInterval(() => {
            if (!isUserHoveringStages) {
                let next = activeStageIndex + 1;
                if (next > 4) next = 1;
                setPrpStage(next, false);
            }
        }, 4500);
    }

    // Start auto cycle only when visible in viewport
    if (stagesCard && 'IntersectionObserver' in window) {
        const stageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!autoStageTimer) startAutoStageCycle();
                } else {
                    if (autoStageTimer) {
                        clearInterval(autoStageTimer);
                        autoStageTimer = null;
                    }
                }
            });
        }, { threshold: 0.2 });
        stageObserver.observe(stagesCard);
    } else {
        startAutoStageCycle();
    }

    // ── 8. Before & After View Mode Controller ────────────────
    const baViewport = document.getElementById('prpBaViewport');
    const baModeBtns = document.querySelectorAll('.ba-mode-btn');

    if (baViewport && baModeBtns.length > 0) {
        baModeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.getAttribute('data-mode');
                
                baModeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                baViewport.classList.remove('focus-before', 'focus-after');
                if (mode === 'before') {
                    baViewport.classList.add('focus-before');
                } else if (mode === 'after') {
                    baViewport.classList.add('focus-after');
                }
            });
        });
    }

    // ── 9. Timeline Cards Sync with Showcase Stages ───────────
    const tlStageLinks = document.querySelectorAll('.prp-tl-stage-link');
    tlStageLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetStage = link.getAttribute('data-target-stage');
            if (targetStage) {
                setPrpStage(targetStage, true);
                if (stagesCard) {
                    const offsetTop = stagesCard.getBoundingClientRect().top + window.pageYOffset - 120;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // ── 10. Verified Patient Reviews Executive Carousel Slider ───────
    function initReviewsCarousel() {
        const carousel = document.getElementById('prpReviewsCarousel');
        const viewport = document.getElementById('prpReviewsViewport');
        const track = document.getElementById('prpReviewsTrack');
        const prevBtn = document.getElementById('prpReviewsPrevBtn');
        const nextBtn = document.getElementById('prpReviewsNextBtn');
        const dotsContainer = document.getElementById('prpReviewsDots');

        if (!carousel || !viewport || !track || !prevBtn || !nextBtn) return;

        const slides = Array.from(track.querySelectorAll('.prp-review-slide'));
        const totalSlides = slides.length;
        if (totalSlides === 0) return;

        let currentIndex = 0;
        let autoplayTimer = null;
        let isInteracting = false;

        function getCardsPerView() {
            const w = window.innerWidth;
            if (w > 1024) return 3;
            if (w > 768) return 2;
            return 1;
        }

        function getMaxIndex() {
            const cardsPerView = getCardsPerView();
            return Math.max(0, totalSlides - cardsPerView);
        }

        function createDots() {
            if (!dotsContainer) return;
            dotsContainer.innerHTML = '';
            const maxIndex = getMaxIndex();
            const count = maxIndex + 1;
            for (let i = 0; i < count; i++) {
                const dot = document.createElement('button');
                dot.className = 'prp-review-dot' + (i === currentIndex ? ' active' : '');
                dot.setAttribute('type', 'button');
                dot.setAttribute('role', 'tab');
                dot.setAttribute('aria-label', `Go to review slide ${i + 1} of ${count}`);
                dot.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
                dot.addEventListener('click', () => {
                    goToSlide(i);
                    resetAutoplay();
                });
                dotsContainer.appendChild(dot);
            }
        }

        function updateDots() {
            if (!dotsContainer) return;
            const dots = dotsContainer.querySelectorAll('.prp-review-dot');
            dots.forEach((dot, idx) => {
                const isActive = idx === currentIndex;
                dot.classList.toggle('active', isActive);
                dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });
        }

        function updateSlider(animate = true) {
            const maxIndex = getMaxIndex();
            if (currentIndex > maxIndex) currentIndex = maxIndex;

            const slideEl = slides[0];
            if (!slideEl) return;

            const slideRect = slideEl.getBoundingClientRect();
            const slideWidth = slideRect.width;
            const trackStyle = window.getComputedStyle(track);
            const gap = parseFloat(trackStyle.columnGap || trackStyle.gap) || 24;
            const step = slideWidth + gap;

            track.style.transition = animate ? 'transform 0.55s cubic-bezier(0.2, 0.8, 0.25, 1)' : 'none';
            track.style.transform = `translateX(-${currentIndex * step}px)`;

            updateDots();
        }

        function goToSlide(index, animate = true) {
            const maxIndex = getMaxIndex();
            if (index < 0) {
                currentIndex = maxIndex;
            } else if (index > maxIndex) {
                currentIndex = 0;
            } else {
                currentIndex = index;
            }
            updateSlider(animate);
        }

        function nextSlide() {
            const maxIndex = getMaxIndex();
            if (currentIndex >= maxIndex) {
                goToSlide(0);
            } else {
                goToSlide(currentIndex + 1);
            }
        }

        function prevSlide() {
            const maxIndex = getMaxIndex();
            if (currentIndex <= 0) {
                goToSlide(maxIndex);
            } else {
                goToSlide(currentIndex - 1);
            }
        }

        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            prevSlide();
            resetAutoplay();
        });

        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            nextSlide();
            resetAutoplay();
        });

        // ── Autoplay controller with hover/touch pause ────────
        function startAutoplay() {
            stopAutoplay();
            autoplayTimer = setInterval(() => {
                if (!isInteracting) {
                    nextSlide();
                }
            }, 4500);
        }

        function stopAutoplay() {
            if (autoplayTimer) {
                clearInterval(autoplayTimer);
                autoplayTimer = null;
            }
        }

        function resetAutoplay() {
            stopAutoplay();
            startAutoplay();
        }

        carousel.addEventListener('mouseenter', () => { isInteracting = true; });
        carousel.addEventListener('mouseleave', () => { isInteracting = false; });
        carousel.addEventListener('focusin', () => { isInteracting = true; });
        carousel.addEventListener('focusout', () => { isInteracting = false; });

        // ── Touch swipe support ──────────────────────────────
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        viewport.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                touchEndX = touchStartX;
                touchEndY = touchStartY;
                isInteracting = true;
                stopAutoplay();
            }
        }, { passive: true });

        viewport.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1) {
                touchEndX = e.touches[0].clientX;
                touchEndY = e.touches[0].clientY;
            }
        }, { passive: true });

        viewport.addEventListener('touchend', () => {
            isInteracting = false;
            const diffX = touchStartX - touchEndX;
            const diffY = touchStartY - touchEndY;
            // Only trigger if horizontal movement exceeds vertical and is > 35px
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
                if (diffX > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }
            startAutoplay();
        });

        // ── Keyboard navigation ──────────────────────────────
        carousel.setAttribute('tabindex', '0');
        carousel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevSlide();
                resetAutoplay();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextSlide();
                resetAutoplay();
            }
        });

        // ── Window resize debounce ───────────────────────────
        let lastCardsPerView = getCardsPerView();
        let resizeTimer = null;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const currentCards = getCardsPerView();
                if (currentCards !== lastCardsPerView) {
                    lastCardsPerView = currentCards;
                    createDots();
                }
                updateSlider(false);
            }, 120);
        });

        createDots();
        updateSlider(false);
        startAutoplay();
    }

    initReviewsCarousel();
});


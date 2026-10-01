/**
 * Kezza Clinic - Professional Animation Suite
 * High-performance, zero-dependency animations:
 * 1. IntersectionObserver scroll reveal engine
 * 2. Eased live count-up animation for clinical statistics
 * 3. Interactive Before & After transformation slider (Touch + Mouse)
 * 4. Testimonial filters and stat-box tilt micro-interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initCountUpStats();
    initBeforeAfterSlider();
    initTestimonialFilters();
    initStatBoxTilt();
});

/* ── 1. Scroll-Driven Reveal Engine ── */
function initScrollReveal() {
    const reveals = document.querySelectorAll('.pro-reveal');
    if (!reveals.length) return;

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                    // Unobserve once revealed for peak performance
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        reveals.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback for older browsers
        reveals.forEach(el => el.classList.add('is-revealed'));
    }
}

/* ── 2. Live Count-Up Animation for Stats ── */
function initCountUpStats() {
    const statElements = document.querySelectorAll('.stat-number-pro[data-count]');
    if (!statElements.length) return;

    function animateSingleCounter(el) {
        const target = parseInt(el.getAttribute('data-count'), 10) || 0;
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 1800; // ms
        const startTime = performance.now();

        function easeOutExpo(x) {
            return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
        }

        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentVal = Math.floor(easeOutExpo(progress) * target);

            el.textContent = `${prefix}${currentVal.toLocaleString()}${suffix}`;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                el.textContent = `${prefix}${target.toLocaleString()}${suffix}`;
            }
        }

        requestAnimationFrame(updateCounter);
    }

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateSingleCounter(entry.target);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        statElements.forEach(el => observer.observe(el));
    } else {
        statElements.forEach(el => animateSingleCounter(el));
    }
}

/* ── 3. Interactive Draggable Before/After Comparison Slider ── */
function initBeforeAfterSlider() {
    const container = document.querySelector('.ba-slider-container');
    if (!container) return;

    const beforeWrap = container.querySelector('.ba-img-before-wrap');
    const divider = container.querySelector('.ba-divider');
    const beforeImg = beforeWrap ? beforeWrap.querySelector('img') : null;

    if (!beforeWrap || !divider || !beforeImg) return;

    let isDragging = false;

    function syncImageWidth() {
        const rect = container.getBoundingClientRect();
        if (beforeImg) {
            beforeImg.style.width = rect.width + 'px';
            beforeImg.style.height = rect.height + 'px';
        }
    }

    window.addEventListener('resize', syncImageWidth);
    syncImageWidth();

    function setPosition(xPos) {
        const rect = container.getBoundingClientRect();
        let offsetX = xPos - rect.left;

        // Clamp between 5% and 95%
        const minX = rect.width * 0.05;
        const maxX = rect.width * 0.95;
        offsetX = Math.max(minX, Math.min(offsetX, maxX));

        const percentage = (offsetX / rect.width) * 100;
        beforeWrap.style.width = percentage + '%';
        divider.style.left = percentage + '%';
    }

    // Pointer / Mouse events
    function onPointerDown(e) {
        isDragging = true;
        container.style.cursor = 'ew-resize';
        setPosition(e.clientX || (e.touches && e.touches[0].clientX));
    }

    function onPointerMove(e) {
        if (!isDragging) return;
        const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0].clientX);
        if (clientX !== undefined) {
            setPosition(clientX);
        }
    }

    function onPointerUp() {
        isDragging = false;
        container.style.cursor = 'default';
    }

    // Mouse listeners
    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    // Touch listeners
    container.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });
}

/* ── 4. Testimonial Category Filters ── */
function initTestimonialFilters() {
    const filterBtns = document.querySelectorAll('.testi-filter-btn');
    const cards = document.querySelectorAll('.testi-card-pro');
    if (!filterBtns.length || !cards.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const filter = this.getAttribute('data-filter');
            if (!filter) return;

            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            let visibleIndex = 0;
            cards.forEach(card => {
                const category = card.getAttribute('data-category');
                const shouldShow = (filter === 'all' || category === filter);

                if (shouldShow) {
                    card.style.display = 'flex';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(12px)';
                    setTimeout(() => {
                        card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, visibleIndex * 50);
                    visibleIndex++;
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

/* ── 5. Interactive 3D Perspective Tilt for Stat Boxes ── */
function initStatBoxTilt() {
    const boxes = document.querySelectorAll('.stat-box-pro');
    if (!boxes.length) return;

    // Skip tilt on touch devices or reduced motion
    if (window.matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches) return;

    boxes.forEach(box => {
        let isHovered = false;

        box.addEventListener('mouseenter', () => {
            isHovered = true;
            box.style.transition = 'transform 0.15s ease-out, box-shadow 0.3s ease, border-color 0.3s ease';
        });

        box.addEventListener('mousemove', e => {
            if (!isHovered) return;
            const rect = box.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Micro-tilt angle max ±8 degrees
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            box.style.transform = `perspective(1000px) translateY(-14px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`;
        });

        box.addEventListener('mouseleave', () => {
            isHovered = false;
            box.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, border-color 0.4s ease';
            box.style.transform = '';
        });
    });
}


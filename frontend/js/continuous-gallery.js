/**
 * Kezza Clinic - Continuous Horizontal Image Carousel
 * Implements silky-smooth linear auto-scroll (Right -> Left),
 * seamless infinite looping, desktop hover pause, and touch swipe with momentum.
 */
(function () {
    'use strict';

    function initContinuousGallery() {
        const viewport = document.getElementById('galleryCarouselViewport');
        const track = document.getElementById('galleryCarouselTrack');

        if (!viewport || !track) return;

        const cards = track.querySelectorAll('.gallery-carousel-card');
        if (cards.length < 2) return;

        // Switch track to JS-controlled RAF loop
        track.classList.add('js-controlled');

        // State variables
        let currentX = 0;
        let halfWidth = 0;
        let baseSpeed = 180; // pixels per second (~3.0px at 60fps - fast, lively continuous scroll)
        let isHovered = false;
        let isDragging = false;
        let isMomentum = false;
        let dragStartX = 0;
        let dragLastX = 0;
        let dragVelocityX = 0;
        let lastTimestamp = performance.now();
        let animationFrameId = null;

        // Respect user's motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Calculate the exact wrap distance based on layout
        function updateDimensions() {
            if (cards.length >= 8) {
                // Measure exact distance between item 0 and cloned item 7
                const offset0 = cards[0].offsetLeft;
                const offset7 = cards[7].offsetLeft;
                if (offset7 > offset0) {
                    halfWidth = offset7 - offset0;
                } else {
                    halfWidth = track.scrollWidth / 2;
                }
            } else {
                halfWidth = track.scrollWidth / 2;
            }
        }

        // Wait for images to load if necessary to get perfect subpixel offsets
        updateDimensions();
        window.addEventListener('load', updateDimensions);

        let resizeTimer = null;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(updateDimensions, 100);
        });

        // Apply hardware-accelerated transform
        function render() {
            // Keep currentX within [-halfWidth, 0)
            if (halfWidth > 0) {
                while (currentX <= -halfWidth) {
                    currentX += halfWidth;
                }
                while (currentX > 0) {
                    currentX -= halfWidth;
                }
            }
            track.style.transform = `translate3d(${currentX.toFixed(2)}px, 0, 0)`;
        }

        // Main Animation Loop
        function animate(now) {
            const dt = Math.min((now - lastTimestamp) / 1000, 0.1); // clamp delta in case of tab freeze
            lastTimestamp = now;

            if (!prefersReducedMotion && !isDragging) {
                if (isMomentum) {
                    // Decay momentum swipe smoothly
                    currentX += dragVelocityX * dt;
                    dragVelocityX *= Math.pow(0.1, dt); // gentle friction decay
                    if (Math.abs(dragVelocityX) < 15) {
                        isMomentum = false;
                        dragVelocityX = 0;
                    }
                    render();
                } else if (!isHovered) {
                    // Constant linear movement Right -> Left
                    currentX -= baseSpeed * dt;
                    render();
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        }

        // Hover pause for desktop
        viewport.addEventListener('mouseenter', () => {
            isHovered = true;
        });

        viewport.addEventListener('mouseleave', () => {
            isHovered = false;
        });

        // Touch & Pointer Drag Interactions
        let lastMoveTime = 0;
        let pointerMoved = false;

        viewport.addEventListener('pointerdown', (e) => {
            // Allow primary mouse or single touch
            if (e.button !== 0) return;

            isDragging = true;
            isMomentum = false;
            pointerMoved = false;
            dragStartX = e.clientX;
            dragLastX = e.clientX;
            lastMoveTime = performance.now();
            dragVelocityX = 0;

            viewport.classList.add('is-dragging');
            try {
                viewport.setPointerCapture(e.pointerId);
            } catch (err) {
                // Ignore if pointer capture fails
            }
        });

        viewport.addEventListener('pointermove', (e) => {
            if (!isDragging) return;

            const currentClientX = e.clientX;
            const deltaX = currentClientX - dragLastX;
            const now = performance.now();
            const dt = Math.max((now - lastMoveTime) / 1000, 0.005);

            if (Math.abs(currentClientX - dragStartX) > 4) {
                pointerMoved = true;
            }

            currentX += deltaX;
            // Instantaneous velocity (with smoothing)
            const instantV = deltaX / dt;
            dragVelocityX = dragVelocityX * 0.4 + instantV * 0.6;

            dragLastX = currentClientX;
            lastMoveTime = now;

            render();
        });

        function endDrag(e) {
            if (!isDragging) return;
            isDragging = false;
            viewport.classList.remove('is-dragging');

            try {
                if (viewport.hasPointerCapture(e.pointerId)) {
                    viewport.releasePointerCapture(e.pointerId);
                }
            } catch (err) {
                // Ignore
            }

            // If dragged with sufficient speed, trigger momentum glide
            if (Math.abs(dragVelocityX) > 40) {
                isMomentum = true;
            } else {
                dragVelocityX = 0;
                isMomentum = false;
            }
        }

        viewport.addEventListener('pointerup', endDrag);
        viewport.addEventListener('pointercancel', endDrag);

        // Pause animation on page hide/tab switch to preserve resources
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
            } else {
                lastTimestamp = performance.now();
                if (!animationFrameId) {
                    animationFrameId = requestAnimationFrame(animate);
                }
            }
        });

        // Start animation
        animationFrameId = requestAnimationFrame(animate);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initContinuousGallery);
    } else {
        initContinuousGallery();
    }
})();

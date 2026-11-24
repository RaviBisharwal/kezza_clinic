/**
 * Kezza Hair & Skin Clinic — Hair System & Wig Interactive Stepper Controller
 * Controls the 5-step workflow tabs, smooth transitions, and keyboard accessibility.
 * Enhanced with horizontal-only pill centering and glitch-free scrollspy.
 */
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.workflow-nav-btn[data-step]');
    const panels = document.querySelectorAll('.workflow-panel[data-step]');
    const pipelineFill = document.getElementById('workflowPipelineFill');

    if (!navButtons.length || !panels.length) return;

    function activateStep(stepId) {
      const currentNum = parseInt(stepId, 10) || 1;

      // 1. Update horizontal pipeline fill progress
      if (pipelineFill && navButtons.length > 1) {
        const pct = ((currentNum - 1) / (navButtons.length - 1)) * 100;
        pipelineFill.style.width = pct + '%';
      }

      // 2. Update stage node buttons (active, completed, aria)
      navButtons.forEach(btn => {
        const btnStep = parseInt(btn.getAttribute('data-step'), 10);
        const isCurrent = btnStep === currentNum;
        const isPast = btnStep < currentNum;

        btn.classList.toggle('active', isCurrent);
        btn.classList.toggle('is-completed', isPast);
        btn.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
      });

      // 3. Switch active panel & animate clinical graph bars
      panels.forEach(panel => {
        const panelStep = parseInt(panel.getAttribute('data-step'), 10);
        const isCurrent = panelStep === currentNum;

        if (isCurrent) {
          panel.style.display = 'grid';
          // Trigger reflow for CSS opacity/transform transition
          void panel.offsetWidth;
          panel.classList.add('active');
          panel.removeAttribute('hidden');

          // Animate graph bars in this active stage
          const bars = panel.querySelectorAll('.graph-bar-fill');
          bars.forEach(bar => {
            const targetWidth = bar.getAttribute('data-width') || '100%';
            bar.style.width = '0%';
            setTimeout(() => {
              bar.style.width = targetWidth;
            }, 60);
          });
        } else {
          panel.classList.remove('active');
          panel.style.display = 'none';
          panel.setAttribute('hidden', 'true');
        }
      });
    }

    // Initialize first stage graph bars smoothly on page load
    setTimeout(() => {
      activateStep('1');
    }, 120);

    // Wire up step navigation buttons
    navButtons.forEach((btn, index) => {
      btn.addEventListener('click', function() {
        const stepId = this.getAttribute('data-step');
        if (stepId) activateStep(stepId);
      });

      btn.addEventListener('keydown', function(e) {
        let newIndex = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          newIndex = (index + 1) % navButtons.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          newIndex = (index - 1 + navButtons.length) % navButtons.length;
        }

        if (newIndex !== null) {
          e.preventDefault();
          navButtons[newIndex].focus();
          const stepId = navButtons[newIndex].getAttribute('data-step');
          if (stepId) activateStep(stepId);
        }
      });
    });

    // Wire up Previous & Next buttons in stage cards
    document.querySelectorAll('.btn-stage-prev[data-prev]').forEach(btn => {
      btn.addEventListener('click', function() {
        const prevStep = this.getAttribute('data-prev');
        if (prevStep) activateStep(prevStep);
      });
    });

    document.querySelectorAll('.btn-stage-next[data-next]').forEach(btn => {
      btn.addEventListener('click', function() {
        const nextStep = this.getAttribute('data-next');
        if (nextStep) activateStep(nextStep);
      });
    });

    // ── Quick Navigation Strip Scrollspy & Centering ──
    const stripLinks = document.querySelectorAll('.service-nav-strip .nav-strip-link');
    const navStrip = document.getElementById('serviceNavStrip');

    if (stripLinks.length) {
      const sectionIds = Array.from(stripLinks)
        .map(link => link.getAttribute('href'))
        .filter(href => href && href.startsWith('#'));

      const sections = sectionIds
        .map(id => document.querySelector(id))
        .filter(Boolean);

      // Centering pill HORIZONTALLY only — NEVER call window/ancestor scrollIntoView
      function setActiveLink(activeHref) {
        stripLinks.forEach(link => {
          const isMatch = link.getAttribute('href') === activeHref;
          link.classList.toggle('active', isMatch);
          if (isMatch) {
            const list = link.closest('.nav-strip-list');
            if (list && list.scrollWidth > list.clientWidth) {
              const linkRect = link.getBoundingClientRect();
              const listRect = list.getBoundingClientRect();
              const targetLeft = list.scrollLeft + (linkRect.left - listRect.left) - (list.clientWidth / 2) + (linkRect.width / 2);
              list.scrollTo({ left: targetLeft, behavior: 'smooth' });
            }
          }
        });
      }

      let isClickScrolling = false;
      let clickScrollTimer = null;

      // Update active pill highlight on click with debounce against scrollspy fighting
      stripLinks.forEach(link => {
        link.addEventListener('click', function() {
          const targetId = this.getAttribute('href');
          if (targetId && targetId.startsWith('#')) {
            setActiveLink(targetId);
            isClickScrolling = true;
            clearTimeout(clickScrollTimer);
            clickScrollTimer = setTimeout(() => {
              isClickScrolling = false;
            }, 900);
          }
        });
      });

      // Intersection Observer for scrollspy (only when not animating from click)
      if ('IntersectionObserver' in window && sections.length) {
        const observer = new IntersectionObserver((entries) => {
          if (isClickScrolling) return;
          const visible = entries.filter(e => e.isIntersecting);
          if (visible.length) {
            // Pick section closest to reading line
            visible.sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
            const id = '#' + visible[0].target.id;
            setActiveLink(id);
          }
        }, {
          rootMargin: '-15% 0px -60% 0px',
          threshold: [0, 0.25]
        });

        sections.forEach(sec => observer.observe(sec));
      }

      // Sticky state observer
      if (navStrip && 'IntersectionObserver' in window) {
        const sentinel = document.createElement('div');
        sentinel.style.height = '1px';
        sentinel.style.marginBottom = '-1px';
        sentinel.setAttribute('aria-hidden', 'true');
        navStrip.parentNode.insertBefore(sentinel, navStrip);

        const stickyObserver = new IntersectionObserver(([entry]) => {
          navStrip.classList.toggle('is-stuck', !entry.isIntersecting);
        }, { threshold: 0 });

        stickyObserver.observe(sentinel);
      }
    }
  });
})();


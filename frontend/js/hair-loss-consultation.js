/**
 * Kezza Hair & Skin Clinic — Hair Loss Consultation & Restoration
 * Interactive Stage Filtering, Modality Filtering & Booking Integration
 */
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    // ── Stage Filter Pills ──────────────────────────────────────────
    const stageFilters = document.querySelectorAll('.hlc-stages-section .hlc-filter-btn');
    const stageCards = document.querySelectorAll('.hlc-stage-card');
    const featuredCard = document.querySelector('.hlc-featured-card');

    if (stageFilters.length > 0) {
      stageFilters.forEach(function(btn) {
        btn.addEventListener('click', function() {
          stageFilters.forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');

          const filter = btn.getAttribute('data-filter') || 'all';

          stageCards.forEach(function(card) {
            const categories = (card.getAttribute('data-category') || '').split(' ');
            if (filter === 'all' || categories.includes(filter)) {
              card.style.display = '';
              card.style.opacity = '1';
            } else {
              card.style.display = 'none';
            }
          });

          if (featuredCard) {
            const featCategories = (featuredCard.getAttribute('data-category') || '').split(' ');
            if (filter === 'all' || featCategories.includes(filter)) {
              featuredCard.style.display = '';
              featuredCard.style.opacity = '1';
            } else {
              featuredCard.style.display = 'none';
            }
          }
        });
      });
    }

    // ── Modality Comparison Filter Pills ───────────────────────────
    const modalityFilters = document.querySelectorAll('.hlc-comparison-section .hlc-filter-btn');
    const modalityCards = document.querySelectorAll('.hlc-modality-card');

    if (modalityFilters.length > 0) {
      modalityFilters.forEach(function(btn) {
        btn.addEventListener('click', function() {
          modalityFilters.forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');

          const filter = btn.getAttribute('data-modality') || 'all';

          modalityCards.forEach(function(card) {
            const cat = card.getAttribute('data-category') || '';
            if (filter === 'all' || cat === filter) {
              card.style.display = '';
              card.style.opacity = '1';
            } else {
              card.style.display = 'none';
            }
          });
        });
      });
    }

    // ── Accordion Exclusive Toggle ─────────────────────────────────
    const faqItems = document.querySelectorAll('.hlc-faq-item');
    faqItems.forEach(function(item) {
      item.addEventListener('toggle', function() {
        if (item.open) {
          faqItems.forEach(function(other) {
            if (other !== item && other.open) {
              other.removeAttribute('open');
            }
          });
        }
      });
    });

    // ── Phone Input & WhatsApp CTA Integration ──────────────────────
    const phoneInput = document.getElementById('hlcPhoneInput');
    const waBtn = document.getElementById('hlcWaBtn');

    if (phoneInput && waBtn) {
      const baseWaHref = waBtn.getAttribute('href');
      phoneInput.addEventListener('input', function() {
        const val = phoneInput.value.trim();
        if (val) {
          const customMsg = encodeURIComponent('Hi Kezza Clinic, I would like to book a Hair Loss Consultation. My contact number is ' + val);
          waBtn.setAttribute('href', 'https://wa.me/919284517427?text=' + customMsg);
        } else {
          waBtn.setAttribute('href', baseWaHref);
        }
      });
    }
  });
})();

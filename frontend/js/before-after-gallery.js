/**
 * Kezza Clinic — Before & After Gallery Engine
 * Category filtering, interactive split-screen comparison slider, and direct booking triggers.
 */
(function() {
  'use strict';

  function initFilterTabs() {
    var filterBtns = document.querySelectorAll('.ba-filter-btn');
    var cards = document.querySelectorAll('.ba-card');

    filterBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        filterBtns.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');

        var filter = btn.getAttribute('data-filter');
        cards.forEach(function(card) {
          var category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  function initSplitSliders() {
    var splitBoxes = document.querySelectorAll('.ba-split-view');

    splitBoxes.forEach(function(box) {
      var beforeWrap = box.querySelector('.ba-split-before-wrap');
      var handle = box.querySelector('.ba-slider-handle');
      if (!beforeWrap || !handle) return;

      var isDragging = false;

      function updatePosition(xCoord) {
        var rect = box.getBoundingClientRect();
        var offsetX = xCoord - rect.left;
        var percent = (offsetX / rect.width) * 100;

        if (percent < 5) percent = 5;
        if (percent > 95) percent = 95;

        beforeWrap.style.width = percent + '%';
        handle.style.left = percent + '%';
      }

      function onStart(e) {
        isDragging = true;
        var clientX = e.touches ? e.touches[0].clientX : e.clientX;
        updatePosition(clientX);
      }

      function onMove(e) {
        if (!isDragging) return;
        var clientX = e.touches ? e.touches[0].clientX : e.clientX;
        updatePosition(clientX);
      }

      function onEnd() {
        isDragging = false;
      }

      box.addEventListener('mousedown', onStart);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onEnd);

      box.addEventListener('touchstart', onStart, { passive: true });
      window.addEventListener('touchmove', onMove, { passive: true });
      window.addEventListener('touchend', onEnd);
    });
  }

  function initBookCTAs() {
    document.querySelectorAll('.ba-book-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        var card = btn.closest('.ba-card');
        var treatment = card ? card.querySelector('.ba-card-title').textContent : 'Consultation';
        if (window.KezzaBooking && typeof window.KezzaBooking.open === 'function') {
          window.KezzaBooking.open(treatment);
        } else {
          window.location.href = '/book-appointment.html?treatment=' + encodeURIComponent(treatment);
        }
      });
    });
  }

  function init() {
    initFilterTabs();
    initSplitSliders();
    initBookCTAs();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

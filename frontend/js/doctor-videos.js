/**
 * Kezza Clinic — Doctor Video Intros Engine
 * Handles 30-60s doctor video playback, sound toggles, viewport auto-pause, and direct consultation booking.
 */
(function() {
  'use strict';

  function initDoctorVideos() {
    var videoCards = document.querySelectorAll('.doc-video-card');

    videoCards.forEach(function(card) {
      var video = card.querySelector('video');
      var playBtn = card.querySelector('.doc-video-overlay-btn');
      var bookBtn = card.querySelector('.doc-book-btn');
      var docName = (card.querySelector('h3') || {}).textContent || 'Specialist';

      if (!video) return;

      if (playBtn) {
        playBtn.addEventListener('click', function() {
          if (video.paused) {
            // Pause all other videos first
            document.querySelectorAll('.doc-video-card video').forEach(function(v) {
              if (v !== video) {
                v.pause();
                var otherBtn = v.closest('.doc-video-card').querySelector('.doc-video-overlay-btn');
                if (otherBtn) otherBtn.innerHTML = '<i class="fas fa-play"></i>';
              }
            });

            video.play();
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
          } else {
            video.pause();
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
          }
        });
      }

      video.addEventListener('ended', function() {
        if (playBtn) playBtn.innerHTML = '<i class="fas fa-redo"></i>';
      });

      if (bookBtn) {
        bookBtn.addEventListener('click', function(e) {
          e.preventDefault();
          if (window.KezzaBooking && typeof window.KezzaBooking.open === 'function') {
            window.KezzaBooking.open('Consultation', docName);
          } else {
            window.location.href = '/book-appointment.html?doctor=' + encodeURIComponent(docName);
          }
        });
      }
    });

    // Viewport intersection observer to pause videos when scrolled away
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (!entry.isIntersecting) {
            var v = entry.target.querySelector('video');
            if (v && !v.paused) {
              v.pause();
              var btn = entry.target.querySelector('.doc-video-overlay-btn');
              if (btn) btn.innerHTML = '<i class="fas fa-play"></i>';
            }
          }
        });
      }, { threshold: 0.3 });

      videoCards.forEach(function(card) {
        observer.observe(card);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDoctorVideos);
  } else {
    initDoctorVideos();
  }

})();

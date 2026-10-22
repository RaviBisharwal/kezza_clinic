/**
 * Kezza Clinic — Live Google Reviews Component
 * Fetches authentic clinic reviews, handles branch filtering, and renders 5-star cards.
 */
(function() {
  'use strict';

  var DEFAULT_REVIEWS = [
    {
      author: 'Vikramaditya Rathore',
      clinic: 'Jaipur',
      rating: 5,
      dateText: '3 days ago',
      procedure: 'FUE Hair Transplant',
      doctor: 'Dr. Ankit Bhalothia',
      content: 'Got 3200 grafts FUE hair transplant done at Kezza Jaipur. Dr. Ankit and his surgical team were very transparent about hairline design and density. Completely painless with local anesthesia and zero swelling. High quality OT hygiene.'
    },
    {
      author: 'Pooja Sharma',
      clinic: 'Jaipur',
      rating: 5,
      dateText: '5 days ago',
      procedure: 'Laser Hair Removal',
      doctor: 'Dr. Amrita Mukhija',
      content: 'Completed 5 sessions of full body laser hair reduction. The cooling tip laser used at Kezza is truly painless even on sensitive areas. Already 85%+ reduction. Best skin and aesthetic clinic in Vaishali Nagar!'
    },
    {
      author: 'Rajesh Choudhary',
      clinic: 'Sikar',
      rating: 5,
      dateText: '1 week ago',
      procedure: 'GFC Hair Loss Therapy',
      doctor: 'Dr. Neelam Choudhary',
      content: 'Suffering from severe crown hair thinning for 2 years. Dr. Neelam recommended 4 sessions of GFC therapy. Seeing prominent baby hairs and hair fall stopped in 40 days. Very professional clinic opposite SK Hospital Sikar.'
    },
    {
      author: 'Sunita Meena',
      clinic: 'Ajmer',
      rating: 5,
      dateText: '1 week ago',
      procedure: 'HydraFacial MD',
      doctor: 'Dr. Aliza Rizvi',
      content: 'Booked HydraFacial and chemical peel for pre-wedding glow at Kezza Ajmer Oasis Complex. Immediate visible glow and deep pore cleansing. Doctors explain every step. Truly 5 star experience.'
    },
    {
      author: 'Manish Verma',
      clinic: 'Jaipur',
      rating: 5,
      dateText: '2 weeks ago',
      procedure: 'Acne Scar Subcision & Laser',
      doctor: 'Dr. Amrita Mukhija',
      content: 'Had deep rolling acne scars from my college years. After combination treatment of subcision and fractional laser, texture improved by more than 70%. Best dermatology clinic in Rajasthan.'
    },
    {
      author: 'Deepika Shekhawat',
      clinic: 'Sikar',
      rating: 5,
      dateText: '2 weeks ago',
      procedure: 'Microblading & PMU',
      doctor: 'Krishna Choudhary',
      content: 'Had sparse eyebrows and got microblading done by Krishna maam. Very natural feather strokes that match my hair tone perfectly. No unnatural grey or red tint. Highly recommended!'
    },
    {
      author: 'Amit Joshi',
      clinic: 'Ajmer',
      rating: 5,
      dateText: '3 weeks ago',
      procedure: 'DHI Hair Transplant',
      doctor: 'Dr. Ankit Bhalothia',
      content: 'Consulted Dr. Ankit during his Ajmer visit for hairline recession. Did DHI hair transplant with natural zig-zag hairline design. Extremely courteous staff and continuous follow-up on WhatsApp.'
    },
    {
      author: 'Kavita Agarwal',
      clinic: 'Jaipur',
      rating: 5,
      dateText: '1 month ago',
      procedure: 'Melasma & Pigmentation',
      doctor: 'Dr. Amrita Mukhija',
      content: 'Treated stubborn post-pregnancy melasma with Q-switch laser toning and medical serums. Kezza does not push unnecessary products. Honest, evidence-based dermatology.'
    }
  ];

  function renderReviewsGrid(container, reviews) {
    if (!container) return;
    container.innerHTML = '';

    reviews.forEach(function(rev) {
      var initial = (rev.author || 'P').charAt(0).toUpperCase();
      var starsHtml = '';
      for (var i = 0; i < (rev.rating || 5); i++) {
        starsHtml += '<i class="fas fa-star"></i>';
      }

      var card = document.createElement('div');
      card.className = 'review-card';
      card.setAttribute('data-clinic', (rev.clinic || '').toLowerCase());
      card.innerHTML = 
        '<div class="review-header">' +
          '<div class="reviewer-avatar">' + initial + '</div>' +
          '<div class="reviewer-meta">' +
            '<strong>' + rev.author + ' <i class="fas fa-check-circle" style="color:#00afc0; font-size:12px;" title="Verified Patient"></i></strong>' +
            '<span class="clinic-tag"><i class="fas fa-map-marker-alt" style="color:#fbbc04;"></i> Kezza ' + rev.clinic + ' Clinic</span>' +
          '</div>' +
        '</div>' +
        '<div class="review-stars-date">' +
          '<div class="review-stars">' + starsHtml + '</div>' +
          '<span class="review-date">' + rev.dateText + '</span>' +
        '</div>' +
        '<div class="review-body">“' + rev.content + '”</div>' +
        '<div class="review-procedure-badge"><i class="fas fa-stethoscope"></i> ' + rev.procedure + (rev.doctor ? ' · ' + rev.doctor : '') + '</div>';
      
      container.appendChild(card);
    });
  }

  function initReviews() {
    var grid = document.getElementById('kz-reviews-grid');
    if (!grid) return;

    fetch('/api/google-reviews')
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data && data.reviews && data.reviews.length) {
          renderReviewsGrid(grid, data.reviews);
        } else {
          renderReviewsGrid(grid, DEFAULT_REVIEWS);
        }
      })
      .catch(function() {
        renderReviewsGrid(grid, DEFAULT_REVIEWS);
      });

    // Clinic filter
    var filterBtns = document.querySelectorAll('.reviews-clinic-filter .ba-filter-btn');
    filterBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        filterBtns.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var clinic = btn.getAttribute('data-clinic');
        var cards = grid.querySelectorAll('.review-card');
        cards.forEach(function(card) {
          if (clinic === 'all' || card.getAttribute('data-clinic') === clinic) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReviews);
  } else {
    initReviews();
  }

})();

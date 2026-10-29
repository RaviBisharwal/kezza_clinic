/**
 * Kezza Hair & Skin Clinic — Sikar Branch Google Reviews Component
 *
 * Integrates genuine customer reviews extracted from Google Maps screenshots.
 * Zero fabricated or AI-generated testimonials.
 *
 * Official Sikar Listing:
 *   Google Maps: https://maps.app.goo.gl/kFkEyXNvTP6DSGKq6
 *   Write Review: https://www.google.com/maps/place//data=!4m3!3m2!1s0x396cbb8cee08f913:0x2fb082dea5ff1e14!12e1
 */
(function () {
  'use strict';

  var SIKAR_MAP_URL = 'https://maps.app.goo.gl/kFkEyXNvTP6DSGKq6';
  var SIKAR_WRITE_REVIEW_URL = 'https://www.google.com/maps/place//data=!4m3!3m2!1s0x396cbb8cee08f913:0x2fb082dea5ff1e14!12e1';

  var GOOGLE_SVG =
    '<svg height="16" viewBox="0 0 24 24" width="16" aria-hidden="true" style="flex-shrink:0">' +
    '<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>' +
    '<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>' +
    '<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84-.98-.01z" fill="#FBBC05"/>' +
    '<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" fill="#EA4335"/>' +
    '</svg>';

  var AVATAR_COLORS = [
    'linear-gradient(135deg,#00AFC0,#007E8C)',
    'linear-gradient(135deg,#7c3aed,#5b21b6)',
    'linear-gradient(135deg,#059669,#047857)',
    'linear-gradient(135deg,#d97706,#b45309)'
  ];

  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function starsHtml(rating) {
    var html = '';
    for (var i = 1; i <= 5; i++) {
      html += '<i class="fas fa-star" style="color:#fbbc04;font-size:14px;"></i>';
    }
    return html;
  }

  function buildSikarCard(review, idx) {
    var initial = (review.reviewerInitial || (review.reviewerName || '?')[0]).toUpperCase();
    var color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
    var badgeHtml = review.reviewerBadge
      ? '<span class="kzr-user-badge">' + esc(review.reviewerBadge) + '</span>'
      : '';

    var ownerHtml = '';
    if (review.ownerResponse && review.ownerResponse.text) {
      ownerHtml =
        '<div class="kzr-owner-response" role="region" aria-label="Response from clinic owner">' +
          '<div class="kzr-owner-label"><i class="fas fa-reply" aria-hidden="true"></i> Response from the owner' +
            (review.ownerResponse.dateLabel ? ' <span class="kzr-owner-date">· ' + esc(review.ownerResponse.dateLabel) + '</span>' : '') +
          '</div>' +
          '<p class="kzr-owner-text">' + esc(review.ownerResponse.text) + '</p>' +
          (review.ownerResponse.truncated
            ? '<span class="kzr-truncated-note"><i class="fas fa-info-circle"></i> Visible excerpt from verified Google screenshot</span>'
            : '') +
        '</div>';
    }

    return (
      '<article class="kzr-card kzr-card--sikar" data-id="' + esc(review.id) + '">' +
        '<div class="kzr-header">' +
          '<div class="kzr-avatar" style="background:' + color + ';" aria-hidden="true">' + esc(initial) + '</div>' +
          '<div class="kzr-meta">' +
            '<span class="kzr-name">' + esc(review.reviewerName) + '</span>' +
            '<div class="kzr-submeta">' +
              (review.dateLabel ? '<span class="kzr-date"><i class="far fa-clock"></i> ' + esc(review.dateLabel) + '</span>' : '') +
              badgeHtml +
            '</div>' +
          '</div>' +
          '<div class="kzr-google-mark" title="Google Review">' + GOOGLE_SVG + '</div>' +
        '</div>' +

        '<div class="kzr-stars-row">' +
          '<div class="kzr-stars" aria-label="5 out of 5 stars">' + starsHtml(review.rating) + '</div>' +
          '<span class="kzr-branch-tag"><i class="fas fa-map-marker-alt"></i> Kezza Sikar Clinic</span>' +
        '</div>' +

        '<p class="kzr-text">' + esc(review.reviewText) + '</p>' +

        ownerHtml +

        '<div class="kzr-footer">' +
          '<span class="kzr-source-note"><i class="fas fa-shield-alt"></i> Verified Google Review</span>' +
          '<a href="' + SIKAR_MAP_URL + '" target="_blank" rel="noopener noreferrer" class="kzr-view-btn" aria-label="View Kezza Sikar on Google Maps">' +
            GOOGLE_SVG + ' View on Google Maps' +
          '</a>' +
        '</div>' +
      '</article>'
    );
  }

  function initSikarGrid() {
    var grid = document.getElementById('sikar-reviews-grid');
    if (!grid) return;

    fetch('/data/sikar-reviews.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var reviews = (data && data.reviews) || [];
        // Only display reviews verified for Sikar in this dedicated Sikar section
        var sikarVerified = reviews.filter(function (r) {
          return r.branchId === 'sikar' && r.branchVerified === true;
        });

        if (!sikarVerified.length) return;

        var html = '';
        sikarVerified.forEach(function (r, i) {
          html += buildSikarCard(r, i);
        });
        grid.innerHTML = html;
      })
      .catch(function (err) {
        console.warn('[sikar-reviews] Could not load JSON, keeping static fallback:', err);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSikarGrid);
  } else {
    initSikarGrid();
  }
})();

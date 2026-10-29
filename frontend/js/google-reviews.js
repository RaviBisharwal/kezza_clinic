/**
 * Kezza Clinic — Genuine Google Reviews Component
 *
 * Loads authentic reviews from /data/genuine-reviews.json
 * (records extracted verbatim from Google Maps screenshots supplied by the clinic owner).
 *
 * NO fabricated review data is present in this file.
 * Branch assignments are only applied where the source screenshot explicitly
 * names a clinic branch in the review text or the owner response.
 *
 * Used by:  reviews.html  →  #kz-reviews-grid  (branch-filter mode)
 *           index.html    →  #testiGrid         (tab mode via kezza-reviews.js)
 */
(function () {
  'use strict';

  /* ── Google logo SVG (4-colour) ────────────────────────────────── */
  var GOOGLE_SVG =
    '<svg height="16" viewBox="0 0 24 24" width="16" aria-hidden="true" style="flex-shrink:0">' +
    '<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>' +
    '<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>' +
    '<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84-.98-.01z" fill="#FBBC05"/>' +
    '<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" fill="#EA4335"/>' +
    '</svg>';

  /* ── Avatar gradient palette ────────────────────────────────────── */
  var AVATAR_COLORS = [
    'linear-gradient(135deg,#00AFC0,#007E8C)',
    'linear-gradient(135deg,#7c3aed,#5b21b6)',
    'linear-gradient(135deg,#059669,#047857)',
    'linear-gradient(135deg,#d97706,#b45309)',
    'linear-gradient(135deg,#db2777,#9d174d)',
    'linear-gradient(135deg,#0284c7,#075985)',
  ];

  /* ── Branch map URLs (verified Google Maps short-links) ─────────── */
  var BRANCH_URLS = {
    jaipur: 'https://maps.app.goo.gl/4eUGixic35V777yd8',
    sikar:  'https://maps.app.goo.gl/kFkEyXNvTP6DSGKq6',
    ajmer:  'https://maps.app.goo.gl/zMajvKmT5N7coswJA',
  };
  /* Fallback generic link used when branch is unknown */
  var FALLBACK_URL = 'https://share.google/AVMKsdLAtZlxgm9PO';

  /* ── Utility: HTML-escape ───────────────────────────────────────── */
  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ── Utility: render 5-star row ─────────────────────────────────── */
  function starsHtml(rating) {
    var html = '';
    for (var i = 1; i <= 5; i++) {
      html += '<i class="fas fa-star' + (i <= rating ? '' : ' fa-regular') + '" style="color:' + (i <= rating ? '#fbbc04' : '#cbd5e1') + ';font-size:13px;"></i>';
    }
    return html;
  }

  /* ── Build a single review card ─────────────────────────────────── */
  function buildCard(review, idx) {
    var initial  = (review.reviewerName || '?')[0].toUpperCase();
    var color    = AVATAR_COLORS[idx % AVATAR_COLORS.length];
    var mapUrl   = (review.branchId && BRANCH_URLS[review.branchId]) || FALLBACK_URL;

    /* ─── Badges row ────────────────────────────────────────────── */
    var badges = '';
    if (review.translated) {
      badges += '<span class="kzr-badge kzr-badge--translate" title="Translated by Google from ' + esc(review.translatedFrom || 'another language') + '">' +
                '<i class="fas fa-language"></i> Translated from ' + esc(review.translatedFrom || 'Hindi') + '</span>';
    }
    if (review.edited) {
      badges += '<span class="kzr-badge kzr-badge--edited"><i class="fas fa-pencil-alt"></i> Edited</span>';
    }

    /* ─── Branch label (only when confirmed) ────────────────────── */
    var branchHtml = '';
    if (review.branchId) {
      var branchLabels = { jaipur: 'Kezza Jaipur', sikar: 'Kezza Sikar', ajmer: 'Kezza Ajmer' };
      branchHtml = '<span class="kzr-branch-tag"><i class="fas fa-map-marker-alt"></i> ' + esc(branchLabels[review.branchId] || review.branchId) + '</span>';
    }

    /* ─── Owner response block ───────────────────────────────────── */
    var ownerHtml = '';
    if (review.ownerResponse && review.ownerResponse.text) {
      var respText = review.ownerResponse.text;
      var truncNote = review.ownerResponse.truncated
        ? '<em class="kzr-truncated-note">(Response truncated in source screenshot — full text not available)</em>'
        : '';
      ownerHtml =
        '<div class="kzr-owner-response">' +
          '<div class="kzr-owner-label"><i class="fas fa-reply"></i> Response from the owner' +
            (review.ownerResponse.dateLabel ? ' <span class="kzr-owner-date">· ' + esc(review.ownerResponse.dateLabel) + '</span>' : '') +
          '</div>' +
          '<p class="kzr-owner-text">' + esc(respText) + '</p>' +
          truncNote +
        '</div>';
    }

    /* ─── Assemble card ──────────────────────────────────────────── */
    return '<div class="kzr-card" data-branch="' + esc(review.branchId || 'unconfirmed') + '" data-id="' + esc(review.id) + '">' +

      /* Header */
      '<div class="kzr-header">' +
        '<div class="kzr-avatar" style="background:' + color + ';">' + esc(initial) + '</div>' +
        '<div class="kzr-meta">' +
          '<span class="kzr-name">' + esc(review.reviewerName) + '</span>' +
          (review.dateLabel ? '<span class="kzr-date">' + esc(review.dateLabel) + '</span>' : '') +
        '</div>' +
        '<div class="kzr-google-mark">' + GOOGLE_SVG + '</div>' +
      '</div>' +

      /* Stars + branch */
      '<div class="kzr-stars-row">' +
        starsHtml(review.rating) +
        branchHtml +
      '</div>' +

      /* Badges */
      (badges ? '<div class="kzr-badges-row">' + badges + '</div>' : '') +

      /* Review text */
      '<p class="kzr-text">' + esc(review.reviewText) + '</p>' +

      /* Owner response */
      ownerHtml +

      /* Footer: View on Google */
      '<div class="kzr-footer">' +
        '<span class="kzr-source-note"><i class="fas fa-shield-alt"></i> Genuine Google Review</span>' +
        '<a href="' + esc(mapUrl) + '" target="_blank" rel="noopener noreferrer" class="kzr-view-btn">' +
          GOOGLE_SVG + ' View on Google' +
        '</a>' +
      '</div>' +

    '</div>';
  }

  /* ── Render a list of reviews into a container ───────────────────── */
  function render(container, reviews) {
    if (!container) return;
    if (!reviews || !reviews.length) {
      container.innerHTML =
        '<div class="kzr-empty">' +
          GOOGLE_SVG +
          '<p>No reviews found for this filter.</p>' +
        '</div>';
      return;
    }
    var html = '';
    reviews.forEach(function (r, i) { html += buildCard(r, i); });
    container.innerHTML = html;
  }

  /* ── reviews.html mode: filter buttons + #kz-reviews-grid ──────── */
  function initReviewsPage() {
    var grid = document.getElementById('kz-reviews-grid');
    if (!grid) return;

    fetch('/data/genuine-reviews.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var allReviews = data.reviews || [];

        /* Initial render — all reviews */
        render(grid, allReviews);

        /* Branch filter buttons */
        var filterBtns = document.querySelectorAll('.reviews-clinic-filter .ba-filter-btn');
        filterBtns.forEach(function (btn) {
          btn.addEventListener('click', function () {
            filterBtns.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');

            var clinic = (btn.getAttribute('data-clinic') || '').toLowerCase();
            var filtered;
            if (clinic === 'all') {
              filtered = allReviews;
            } else {
              filtered = allReviews.filter(function (r) {
                return (r.branchId || '').toLowerCase() === clinic;
              });
            }
            render(grid, filtered);
          });
        });
      })
      .catch(function (err) {
        console.warn('[kezza genuine-reviews] Could not load reviews JSON:', err);
        grid.innerHTML =
          '<div class="kzr-empty">' +
            GOOGLE_SVG +
            '<p>Could not load reviews. Please refresh the page.</p>' +
          '</div>';
      });
  }

  /* ── index.html mode: tab switcher + #testiGrid ──────────────────── */
  function initHomePage() {
    var grid    = document.getElementById('testiGrid');
    var tabs    = document.getElementById('testiClinicTabs');
    var loading = document.getElementById('testiLoading');
    if (!grid) return;

    fetch('/data/genuine-reviews.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (loading) loading.style.display = 'none';
        var allReviews = data.reviews || [];

        /* Default: show all reviews on home page (no tab active means show all) */
        var active = 'all';
        renderHome(grid, allReviews, active);

        if (tabs) {
          tabs.addEventListener('click', function (e) {
            var btn = e.target.closest('.testi-clinic-tab');
            if (!btn) return;
            var clinic = (btn.getAttribute('data-clinic') || '').toLowerCase();
            if (clinic === active) return;
            active = clinic;
            tabs.querySelectorAll('.testi-clinic-tab').forEach(function (b) {
              b.classList.toggle('active', b === btn);
            });
            var subset = clinic === 'all'
              ? allReviews
              : allReviews.filter(function (r) { return (r.branchId || '') === clinic; });
            renderHome(grid, subset, clinic);
          });
        }
      })
      .catch(function (err) {
        console.warn('[kezza genuine-reviews home] Could not load reviews JSON:', err);
        if (loading) loading.style.display = 'none';
        /* Show a gentle error — do NOT fall back to fake reviews */
        grid.innerHTML =
          '<div class="testi-error-state">' +
            GOOGLE_SVG +
            '<p>Could not load Google reviews right now.<br>' +
            '<a href="' + FALLBACK_URL + '" target="_blank" rel="noopener noreferrer" class="btn-google-rate" style="margin-top:8px">' +
              '<i class="fab fa-google"></i> Read Reviews on Google Maps' +
            '</a></p>' +
          '</div>';
      });
  }

  /* ── Compact card for the home page testi-grid ───────────────────── */
  function renderHome(grid, reviews, active) {
    if (!reviews || !reviews.length) {
      var label = active === 'all' ? 'this clinic' : (active.charAt(0).toUpperCase() + active.slice(1));
      grid.innerHTML =
        '<div class="testi-error-state">' +
          GOOGLE_SVG +
          '<p>No verified reviews loaded for <strong>' + esc(label) + '</strong> yet.<br>' +
          '<small>Branch assignments are only confirmed where the review explicitly names a branch.</small></p>' +
          '<a href="' + (BRANCH_URLS[active] || FALLBACK_URL) + '" target="_blank" rel="noopener noreferrer" class="btn-google-rate" style="margin-top:8px">' +
            '<i class="fab fa-google"></i> View on Google Maps' +
          '</a>' +
        '</div>';
      return;
    }

    var html = '';
    var AVATAR_COLORS_LOCAL = AVATAR_COLORS;
    reviews.forEach(function (review, idx) {
      var initial = (review.reviewerName || '?')[0].toUpperCase();
      var color   = AVATAR_COLORS_LOCAL[idx % AVATAR_COLORS_LOCAL.length];
      var mapUrl  = (review.branchId && BRANCH_URLS[review.branchId]) || FALLBACK_URL;

      var translBadge = review.translated
        ? '<span class="testi-translate-badge"><i class="fas fa-language"></i> Translated</span>'
        : '';

      html += '<a class="testi-card-pro" href="' + esc(mapUrl) + '" rel="noopener noreferrer" target="_blank">' +
        '<div class="testi-card-top">' +
          '<div class="testi-stars">' + starsHtml(review.rating) + '</div>' +
          '<span class="testi-google-badge">' + GOOGLE_SVG + ' Genuine Google Review</span>' +
        '</div>' +
        '<p class="testi-quote">' +
          esc((review.reviewText || '').slice(0, 320)) +
          (review.reviewText && review.reviewText.length > 320 ? '…' : '') +
        '</p>' +
        '<div class="testi-card-footer">' +
          '<div class="kz-testi-author">' +
            '<div class="kz-testi-avatar" style="background:' + color + ';">' + esc(initial) + '</div>' +
            '<div class="kz-testi-author-info">' +
              '<span class="kz-testi-name">' + esc(review.reviewerName) + '</span>' +
              (review.dateLabel ? '<span class="kz-testi-location"><i class="fas fa-clock"></i> ' + esc(review.dateLabel) + '</span>' : '') +
            '</div>' +
          '</div>' +
          translBadge +
          '<span class="testi-view-link" title="Read Review on Google"><i class="fab fa-google"></i></span>' +
        '</div>' +
      '</a>';
    });
    grid.innerHTML = html;
  }

  /* ── Init: detect which page we are on ──────────────────────────── */
  function init() {
    if (document.getElementById('kz-reviews-grid')) {
      initReviewsPage();
    } else if (document.getElementById('testiGrid')) {
      initHomePage();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

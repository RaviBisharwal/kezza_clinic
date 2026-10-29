/**
 * Kezza Clinic — Genuine Google Reviews Loader (Homepage #testiGrid)
 *
 * Displays authentic reviews from /data/genuine-reviews.json.
 * If a live Google Places API is configured and responds with status 'OK',
 * it seamlessly updates; otherwise it displays the verified screenshot dataset.
 *
 * NO fabricated or AI-generated testimonials.
 */
(function () {
    'use strict';

    var BRANCH_URLS = {
        jaipur: 'https://maps.app.goo.gl/4eUGixic35V777yd8',
        sikar:  'https://maps.app.goo.gl/kFkEyXNvTP6DSGKq6',
        ajmer:  'https://maps.app.goo.gl/zMajvKmT5N7coswJA'
    };
    var FALLBACK_URL = 'https://share.google/AVMKsdLAtZlxgm9PO';

    var GOOGLE_SVG =
        '<svg height="15" viewBox="0 0 24 24" width="15" aria-hidden="true" style="flex-shrink:0">' +
        '<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>' +
        '<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>' +
        '<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84-.98-.01z" fill="#FBBC05"/>' +
        '<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" fill="#EA4335"/>' +
        '</svg>';

    var AVATAR_COLORS = [
        'linear-gradient(135deg,#00AFC0,#007E8C)',
        'linear-gradient(135deg,#7c3aed,#5b21b6)',
        'linear-gradient(135deg,#059669,#047857)',
        'linear-gradient(135deg,#d97706,#b45309)',
        'linear-gradient(135deg,#db2777,#9d174d)',
        'linear-gradient(135deg,#0284c7,#075985)'
    ];

    function esc(str) {
        return String(str || '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function starsHtml(rating) {
        var html = '';
        for (var i = 1; i <= 5; i++) {
            html += '<i class="fas fa-star' + (i <= rating ? '' : ' fa-regular') + '" style="color:' + (i <= rating ? '#fbbc04' : '#cbd5e1') + ';font-size:13px;"></i>';
        }
        return html;
    }

    function buildHomeCard(review, idx) {
        var initial = (review.reviewerName || review.authorName || '?')[0].toUpperCase();
        var color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
        var name = review.reviewerName || review.authorName || 'Google Reviewer';
        var text = review.reviewText || review.text || '';
        var date = review.dateLabel || review.relativeTime || '';
        var branch = review.branchId || '';
        var mapUrl = BRANCH_URLS[branch] || FALLBACK_URL;
        var branchLabels = { jaipur: 'Jaipur', sikar: 'Sikar', ajmer: 'Ajmer' };
        var branchTag = branch
            ? '<span style="font-size:11px;font-weight:700;color:#008f9c;background:#e6f7f9;padding:2px 8px;border-radius:12px;display:inline-flex;align-items:center;gap:4px;"><i class="fas fa-map-marker-alt" style="font-size:10px;"></i> ' + esc(branchLabels[branch] || branch) + '</span>'
            : '';

        var ownerHtml = '';
        if (review.ownerResponse && review.ownerResponse.text) {
            ownerHtml =
                '<div class="kz-testi-owner" style="margin-top:10px;padding:8px 12px;background:#f8fafc;border-left:3px solid #00afc0;border-radius:4px;font-size:12px;color:#475569;">' +
                '<strong style="color:#0c1a2e;display:block;margin-bottom:3px;"><i class="fas fa-reply"></i> Response from owner:</strong>' +
                esc(review.ownerResponse.text).slice(0, 160) + (review.ownerResponse.text.length > 160 ? '…' : '') +
                '</div>';
        }

        return (
            '<div class="testi-card-pro">' +
                '<div class="testi-card-top">' +
                    '<div class="testi-stars">' + starsHtml(review.rating || 5) + '</div>' +
                    '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">' +
                        branchTag +
                        '<span class="testi-google-badge">' + GOOGLE_SVG + ' Genuine Google Review</span>' +
                    '</div>' +
                '</div>' +
                '<p class="testi-quote">“' + esc(text) + '”</p>' +
                ownerHtml +
                '<div class="testi-card-footer" style="margin-top:auto;padding-top:12px;">' +
                    '<div class="kz-testi-author">' +
                        '<div class="kz-testi-avatar" style="background:' + color + ';">' + esc(initial) + '</div>' +
                        '<div class="kz-testi-author-info">' +
                            '<span class="kz-testi-name">' + esc(name) + '</span>' +
                            (date ? '<span class="kz-testi-location"><i class="far fa-clock"></i> ' + esc(date) + '</span>' : '') +
                        '</div>' +
                    '</div>' +
                    '<a href="' + esc(mapUrl) + '" target="_blank" rel="noopener noreferrer" class="testi-view-link" title="Verify on Google Maps" style="text-decoration:none;">' +
                        GOOGLE_SVG +
                    '</a>' +
                '</div>' +
            '</div>'
        );
    }

    function renderEmptyState(grid, clinic, clinicLabel) {
        var mapUrl = BRANCH_URLS[clinic] || FALLBACK_URL;
        grid.innerHTML =
            '<div class="testi-empty-card" style="grid-column:1/-1;text-align:center;padding:40px 24px;background:#ffffff;border:1.5px solid rgba(0,175,192,0.2);border-radius:20px;box-shadow:0 8px 30px rgba(12,26,46,0.06);max-width:640px;margin:12px auto;">' +
                '<div style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:50%;background:#e6f7f9;margin-bottom:12px;">' +
                    GOOGLE_SVG +
                '</div>' +
                '<h4 style="margin:0 0 8px;font-size:17px;font-weight:700;color:#0f172a;">Verified Reviews for Kezza ' + esc(clinicLabel) + '</h4>' +
                '<p style="margin:0 0 16px;font-size:14px;color:#64748b;line-height:1.6;">Explore verified patient ratings and detailed treatment experiences directly on our official Google Business profile.</p>' +
                '<a href="' + esc(mapUrl) + '" target="_blank" rel="noopener noreferrer" class="btn-google-rate" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:28px;background:#00afc0;color:#ffffff;font-weight:700;text-decoration:none;box-shadow:0 4px 14px rgba(0,175,192,0.3);">' +
                    '<i class="fab fa-google"></i> Read ' + esc(clinicLabel) + ' Reviews on Google Maps <i class="fas fa-arrow-right"></i>' +
                '</a>' +
            '</div>';
    }

    var cachedReviews = null;

    function loadReviews(clinic, clinicLabel, grid, loading) {
        if (loading) loading.style.display = 'flex';

        function applyData(all) {
            if (loading) loading.style.display = 'none';
            var filtered = all.filter(function (r) {
                if (clinic === 'all') return true;
                return (r.branchId || '').toLowerCase() === clinic.toLowerCase();
            });

            if (!filtered.length) {
                renderEmptyState(grid, clinic, clinicLabel);
                return;
            }

            var html = '';
            filtered.forEach(function (r, i) {
                html += buildHomeCard(r, i);
            });
            grid.innerHTML = html;
        }

        if (cachedReviews) {
            applyData(cachedReviews);
            return;
        }

        fetch('/data/genuine-reviews.json')
            .then(function (res) { return res.json(); })
            .then(function (data) {
                cachedReviews = data.reviews || [];
                applyData(cachedReviews);
            })
            .catch(function (err) {
                console.warn('[kezza-reviews] Could not load genuine-reviews.json:', err);
                if (loading) loading.style.display = 'none';
                renderEmptyState(grid, clinic, clinicLabel);
            });
    }

    function init() {
        var grid = document.getElementById('testiGrid');
        var tabs = document.getElementById('testiClinicTabs');
        var loading = document.getElementById('testiLoading');

        if (!grid || !tabs) return;

        // Determine active clinic from existing DOM or default to 'jaipur'
        var activeBtn = tabs.querySelector('.testi-clinic-tab.active') || tabs.querySelector('.testi-clinic-tab');
        var activeClinic = activeBtn ? (activeBtn.getAttribute('data-clinic') || 'jaipur') : 'jaipur';
        var clinicLabels = { jaipur: 'Jaipur', sikar: 'Sikar', ajmer: 'Ajmer', all: 'All Clinics' };

        // Set active tab UI
        tabs.querySelectorAll('.testi-clinic-tab').forEach(function (btn) {
            var isActive = btn.getAttribute('data-clinic') === activeClinic;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        loadReviews(activeClinic, clinicLabels[activeClinic] || activeClinic, grid, loading);

        tabs.addEventListener('click', function (e) {
            var btn = e.target.closest('.testi-clinic-tab');
            if (!btn) return;
            var clinic = btn.getAttribute('data-clinic');
            if (!clinic || clinic === activeClinic) return;

            tabs.querySelectorAll('.testi-clinic-tab').forEach(function (b) {
                var isActive = b === btn;
                b.classList.toggle('active', isActive);
                b.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });
            activeClinic = clinic;
            loadReviews(clinic, clinicLabels[clinic] || clinic, grid, loading);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

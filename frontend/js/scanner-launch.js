/**
 * Kezza AI Scanner launcher.
 * Opens the scanner as a full-screen popup from any entry point
 * (header nav link, hero CTA, floating dock) instead of navigating away.
 * Automatically triggers popup 0.6 seconds after website open.
 */
(function () {
  var isSubdir = window.location.pathname.includes('/hair-transplant/');
  var basePath = isSubdir ? '../' : '';
  var SELECTORS = '.nav-scanner-link, .btn-scanner-hero, .dock-scan, [data-open-scanner-modal]';
  var CSS_URL = basePath + 'css/scanner-modal.css?v=6.5';
  var JS_URL  = basePath + 'js/scanner-modal.js?v=6.5';
  var loading = null;

  function loadOnce() {
    if (loading) return loading;
    loading = new Promise(function (resolve, reject) {
      if (!document.querySelector('link[href*="scanner-modal.css"]')) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = CSS_URL;
        document.head.appendChild(link);
      }
      if (window.KezzaScannerModal) { resolve(); return; }
      var s = document.createElement('script');
      s.src = JS_URL;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('scanner assets failed')); };
      document.body.appendChild(s);
    });
    return loading;
  }

  function openScanner(e) {
    if (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // let new-tab clicks work
      e.preventDefault();
    }
    loadOnce().then(function () {
      if (window.KezzaScannerModal && window.KezzaScannerModal.open) {
        window.KezzaScannerModal.open();
      } else {
        window.location.href = basePath + 'face-scanner.html';
      }
    }).catch(function () {
      window.location.href = basePath + 'face-scanner.html'; // graceful fallback
    });
  }

  // Expose so the chat widget (and anything else) can open the scanner too
  window.openKezzaScanner = openScanner;

  function bind() {
    document.querySelectorAll(SELECTORS).forEach(function (el) {
      if (el.dataset.ksBound) return;
      el.dataset.ksBound = '1';
      el.addEventListener('click', openScanner);
      // Warm the assets on hover/touch so the popup feels instant
      el.addEventListener('mouseenter', loadOnce, { once: true, passive: true });
      el.addEventListener('touchstart', loadOnce, { once: true, passive: true });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind, { once: true });
  } else {
    bind();
  }

  // Deep link: /face-scanner.html#scanner or any page with #scanner opens it
  if (window.location.hash === '#scanner') openScanner();

  // ── Automatic Popup on Website Open (6 seconds = 6000ms) ──
  var path = (window.location.pathname || '').toLowerCase();
  var isScannerPage = path.endsWith('face-scanner.html') || path.endsWith('face-scanner');
  var isAdminPage   = path.includes('admin');

  if (!isScannerPage && !isAdminPage) {
    // Pre-warm assets in the background so opening at 6s is completely instant
    loadOnce();

    // Trigger popup after exactly 6 seconds (6000ms)
    setTimeout(function () {
      openScanner();
    }, 6000);
  }
})();

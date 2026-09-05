/**
 * Kezza AI Scanner launcher.
 * Opens the scanner as a full-screen popup from any entry point
 * (header nav link, hero CTA, floating dock) instead of navigating away.
 *
 * The 86KB of scanner assets are fetched only on first use, so this file
 * is the only cost on initial page load. The href="face-scanner.html" on
 * each link is kept as a no-JS / failure fallback.
 */
(function () {
  var SELECTORS = '.nav-scanner-link, .btn-scanner-hero, .dock-scan';
  var CSS_URL = 'css/scanner-modal.css';
  var JS_URL  = 'js/scanner-modal.js';
  var loading = null;

  function loadOnce() {
    if (loading) return loading;
    loading = new Promise(function (resolve, reject) {
      if (!document.querySelector('link[href="' + CSS_URL + '"]')) {
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
        window.location.href = 'face-scanner.html';
      }
    }).catch(function () {
      window.location.href = 'face-scanner.html'; // graceful fallback
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
})();

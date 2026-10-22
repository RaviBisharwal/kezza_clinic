/**
 * Kezza AI Scanner launcher.
 * Opens the scanner as a full-screen popup from any entry point
 * (header nav link, hero CTA, floating dock) instead of navigating away,
 * and shows it once per visit about 6 seconds after the page opens.
 *
 * The popup's files (about 70 KB) are fetched shortly before the automatic popup,
 * or as soon as a visitor touches/hovers a scanner button, rather than while the
 * page itself is still loading.
 */
(function () {
  var SELECTORS = '.nav-scanner-link, .btn-scanner-hero, .dock-scan, [data-open-scanner-modal]';
  var CSS_URL = '/css/bundle-scanner-modal.min.css?v=43d56733';
  var JS_URL  = '/js/scanner-modal.min.js?v=5517a74b';
  var AUTO_KEY = 'kezza_scanner_auto_shown';
  var loading = null;

  function loadOnce() {
    if (loading) return loading;
    loading = new Promise(function (resolve, reject) {
      if (!document.querySelector('link[href*="scanner-modal."]')) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = CSS_URL;
        document.head.appendChild(link);
      }
      if (window.KezzaScannerModal) { resolve(); return; }
      var s = document.createElement('script');
      s.src = JS_URL;
      s.onload = function () { resolve(); };
      s.onerror = function () { loading = null; reject(new Error('scanner assets failed')); };
      document.body.appendChild(s);
    });
    return loading;
  }

  function markShown() {
    try {
      sessionStorage.setItem(AUTO_KEY, 'true');
      sessionStorage.setItem('kz_scanner_shown', '1');
    } catch (err) {}
  }

  function openScanner(e) {
    if (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // let new-tab clicks work
      e.preventDefault();
    }
    markShown();
    loadOnce().then(function () {
      if (window.KezzaScannerModal && window.KezzaScannerModal.open) {
        window.KezzaScannerModal.open();
      } else {
        window.location.href = '/face-scanner.html';
      }
    }).catch(function () {
      window.location.href = '/face-scanner.html'; // graceful fallback
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

  // ── Automatic popup: once per visit, ~6 s after the page opens ──
  var path = (window.location.pathname || '').toLowerCase();
  var isScannerPage = path.endsWith('face-scanner.html') || path.endsWith('face-scanner');
  var isAdminPage   = path.indexOf('admin') !== -1;
  var alreadyShown = false;
  try { alreadyShown = sessionStorage.getItem(AUTO_KEY) === 'true'; } catch (err) { alreadyShown = false; }
  if (isScannerPage || isAdminPage || alreadyShown) return;

  // Never pop up over something the visitor is busy with.
  function visitorIsBusy() {
    if (document.hidden) return true;
    var a = document.activeElement;
    if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.tagName === 'SELECT' || a.isContentEditable)) return true;
    if (document.body.classList.contains('nav-drawer-open')) return true;
    var chat = document.getElementById('kezzaChatWindow');
    if (chat && chat.classList.contains('open')) return true;
    var promo = document.getElementById('kezzaScannerModalBackdrop');
    if (promo && promo.classList.contains('is-visible')) return true;
    return false;
  }

  var tries = 0;
  function autoOpen() {
    try { if (sessionStorage.getItem(AUTO_KEY) === 'true') return; } catch (err) {}
    if (visitorIsBusy() && tries < 4) { tries++; setTimeout(autoOpen, 4000); return; }
    if (visitorIsBusy()) return;
    openScanner();
  }

  // Fetch the popup files ~1.5 s before showing it, while the browser is idle.
  setTimeout(function () {
    if ('requestIdleCallback' in window) requestIdleCallback(function () { loadOnce().catch(function () {}); }, { timeout: 1200 });
    else loadOnce().catch(function () {});
  }, 4500);
  setTimeout(autoOpen, 6000);
})();

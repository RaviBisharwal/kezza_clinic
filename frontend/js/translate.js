/* Kezza Clinic - EN / Hindi language switcher (Google Translate on demand). */
(function() {
  "use strict";
  var u = "kz_user_lang", d = "googtrans";
  function h() {
    try {
      var e = localStorage.getItem(u);
      if (e === "hi" || e === "en") return e;
    } catch (a) {
    }
    var n = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
    if (n) {
      var t = decodeURIComponent(n[1]);
      if (t.indexOf("/hi") !== -1) return "hi";
      if (t.indexOf("/en") !== -1) return "en";
    }
    return window.location.pathname.indexOf("/hi/") === 0 ? "hi" : "en";
  }
  var o = h();
  function v(e) {
    var n = e === "hi" ? "/en/hi" : "/en/en", t = window.location.hostname, a = ["", "; domain=" + t, "; domain=." + t], r = t.split(".");
    r.length > 2 && a.push("; domain=." + r.slice(-2).join(".")), a.forEach(function(i) {
      document.cookie = d + "=" + n + "; path=/" + i, e === "en" && (document.cookie = d + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/" + i);
    });
  }
  function s(e) {
    o = e;
    var n = document.querySelectorAll(".kz-lang-btn");
    n.forEach(function(t) {
      var a = t.getAttribute("data-lang");
      a === e ? (t.classList.add("active"), t.setAttribute("aria-pressed", "true")) : (t.classList.remove("active"), t.setAttribute("aria-pressed", "false"));
    });
  }
  window.kzSwitchLanguage = function(e) {
    if (e) {
      var n = o;
      try {
        localStorage.setItem(u, e);
      } catch (r) {
      }
      if (v(e), s(e), e === "en" && window.location.pathname.indexOf("/hi/") === 0) {
        var t = window.location.pathname.replace(/^\/hi\//, "/");
        window.location.href = t;
        return;
      }
      var a = document.querySelector(".goog-te-combo");
      if (a && n !== e) {
        a.value = e, a.dispatchEvent(new Event("change")), e === "en" && setTimeout(function() {
          window.location.reload();
        }, 300);
        return;
      }
      n !== e && window.location.reload();
    }
  }, window.googleTranslateElementInit = function() {
    if (!(!window.google || !window.google.translate)) {
      new window.google.translate.TranslateElement({ pageLanguage: "en", includedLanguages: "en,hi", autoDisplay: false, layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE }, "google_translate_element");
      var e = 0, n = setInterval(function() {
        var t = document.querySelector(".goog-te-combo");
        e++, t ? (clearInterval(n), o === "hi" && t.value !== "hi" && (t.value = "hi", t.dispatchEvent(new Event("change")))) : e > 25 && clearInterval(n);
      }, 150);
    }
  };
  function w() {
    if (!document.getElementById("google_translate_element")) {
      var e = document.createElement("div");
      e.id = "google_translate_element", e.style.display = "none", e.setAttribute("aria-hidden", "true"), document.body.appendChild(e);
    }
    if (!document.getElementById("kz-google-translate-script")) {
      var n = document.createElement("script");
      n.id = "kz-google-translate-script", n.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit", n.async = true, n.defer = true, document.body.appendChild(n);
    }
  }
  function g(e) {
    var n = e ? "kz-lang-switcher kz-lang-switcher-mobile notranslate" : "kz-lang-switcher notranslate", t = o !== "hi" ? " active" : "", a = o === "hi" ? " active" : "";
    return '<div class="' + n + '" translate="no" role="group" aria-label="Select Language"><i class="fas fa-globe kz-globe-icon" aria-hidden="true"></i><button type="button" class="kz-lang-btn' + t + '" data-lang="en" aria-label="EN - English" title="English">EN</button><span class="kz-lang-sep" aria-hidden="true">/</span><button type="button" class="kz-lang-btn' + a + '" data-lang="hi" aria-label="\u0939\u093F\u0902\u0926\u0940" title="\u0939\u093F\u0902\u0926\u0940">\u0939\u093F\u0902\u0926\u0940</button></div>';
  }
  function E() {
    var e = document.getElementById("kzFloatingLang");
    e && e.parentNode && e.parentNode.removeChild(e);
    var n = document.querySelectorAll(".nav-menu-lang-item");
    n.forEach(function(l) {
      l && l.parentNode && l.parentNode.removeChild(l);
    });
    var t = document.querySelector(".nav-cta");
    if (t && !t.querySelector(".kz-lang-switcher")) {
      var a = document.createElement("div");
      a.innerHTML = g(false);
      var r = t.querySelector(".btn-nav-call");
      r ? t.insertBefore(a.firstElementChild, r) : t.insertBefore(a.firstElementChild, t.firstChild);
    }
    var i = document.getElementById("hamburger") || document.querySelector(".hamburger"), c = document.querySelector(".nav-container");
    if (i && c && !c.querySelector(".kz-lang-switcher-mobile")) {
      var f = document.createElement("div");
      f.innerHTML = g(true), c.insertBefore(f.firstElementChild, i);
    }
    b();
  }
  function b() {
    var e = document.querySelectorAll(".kz-lang-btn");
    e.forEach(function(n) {
      n.hasAttribute("data-kz-bound") || (n.setAttribute("data-kz-bound", "true"), n.addEventListener("click", function(t) {
        t.preventDefault();
        var a = n.getAttribute("data-lang");
        a && window.kzSwitchLanguage(a);
      }));
    });
  }
  function p() {
    var e = document.querySelectorAll('a[href^="tel:"], .btn-nav-call, .dock-call');
    e.forEach(function(t) {
      t.classList.add("notranslate"), t.setAttribute("translate", "no");
    });
    var n = document.querySelectorAll(".nav-logo, .footer-logo, .brand-name");
    n.forEach(function(t) {
      t.classList.add("notranslate"), t.setAttribute("translate", "no");
    });
  }
  function m() {
    p(), E(), s(o);
    // Google Translate (about 200 KB of extra scripts) is only loaded when the visitor has
    // chosen Hindi on an English page. Choosing Hindi stores the choice and reloads the page,
    // so the translator still starts automatically.
    if (o === "hi" && !/^hi/i.test(document.documentElement.lang || "")) w();
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", m) : m();
})();

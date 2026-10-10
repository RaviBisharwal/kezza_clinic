document.addEventListener("DOMContentLoaded", function () {
  // 1. Navbar Scroll Glassmorphism
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    let isScrolled = false, ticking = false;
    window.addEventListener("scroll", function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          const scrolled = (window.pageYOffset || document.documentElement.scrollTop || 0) > 30;
          if (scrolled !== isScrolled) {
            isScrolled = scrolled;
            navbar.classList.toggle("is-scrolled", isScrolled);
            navbar.classList.toggle("scrolled", isScrolled);
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // 2. Lazy Loading for Images
  document.querySelectorAll("img").forEach(function (img, idx) {
    if (idx > 1 && !img.hasAttribute("loading")) {
      img.setAttribute("loading", "lazy");
    }
  });

  // 3. Dynamic Back Button for Breadcrumbs
  function ensureBackButton() {
    const breadcrumbNavs = document.querySelectorAll('.service-breadcrumbs, .sm-breadcrumbs, .dc-breadcrumbs, [aria-label="Breadcrumb"]');
    breadcrumbNavs.forEach(function (bc) {
      if (bc.querySelector('.kz-back-btn')) return;
      const ol = bc.querySelector('ol, ul');
      if (!ol) return;
      
      const isHindi = (document.documentElement.lang && document.documentElement.lang.startsWith('hi')) || window.location.pathname.startsWith('/hi/');
      const labelText = isHindi ? 'वापस' : 'Back';
      const titleText = isHindi ? 'वापस जाएँ' : 'Go Back';
      
      const btn = document.createElement('a');
      btn.className = 'kz-back-btn';
      btn.setAttribute('aria-label', titleText);
      btn.setAttribute('title', titleText);
      btn.href = 'javascript:void(0);';
      btn.innerHTML = '<i class="fas fa-arrow-left" aria-hidden="true"></i> <span>' + labelText + '</span>';
      
      const links = ol.querySelectorAll('a');
      let fallback = '/';
      if (links.length >= 2) {
        fallback = links[links.length - 1].getAttribute('href') || '/';
      } else if (links.length === 1) {
        fallback = links[0].getAttribute('href') || '/';
      }
      
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (window.history.length > 1 && document.referrer && document.referrer.indexOf(window.location.hostname) !== -1) {
          window.history.back();
        } else {
          window.location.href = fallback;
        }
      });
      
      let wrap = bc.querySelector('.sp-breadcrumb-wrap, .dc-breadcrumb-wrap, .sm-breadcrumb-wrap');
      if (!wrap) {
        wrap = document.createElement('div');
        wrap.className = 'sp-breadcrumb-wrap';
        wrap.style.display = 'flex';
        wrap.style.alignItems = 'center';
        wrap.style.gap = '12px';
        wrap.style.flexWrap = 'wrap';
        ol.parentNode.insertBefore(wrap, ol);
        wrap.appendChild(btn);
        wrap.appendChild(ol);
      } else {
        wrap.insertBefore(btn, wrap.firstChild);
      }
    });
  }
  ensureBackButton();

  // 4. Floating Back to Top Button
  function ensureBackToTop() {
    let topBtn = document.getElementById('kzBackToTop');
    if (!topBtn) {
      topBtn = document.createElement('button');
      topBtn.type = 'button';
      topBtn.id = 'kzBackToTop';
      topBtn.setAttribute('aria-label', 'Scroll back to top');
      topBtn.setAttribute('title', 'Back to top');
      topBtn.innerHTML = '<i class="fas fa-chevron-up" aria-hidden="true"></i>';
      document.body.appendChild(topBtn);
    }
    
    topBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    window.addEventListener('scroll', function () {
      if ((window.pageYOffset || document.documentElement.scrollTop || 0) > 320) {
        topBtn.classList.add('is-visible');
      } else {
        topBtn.classList.remove('is-visible');
      }
    }, { passive: true });
  }
  ensureBackToTop();

  // 5. Global Chatbot Trigger for "Book Consultation" Buttons
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-open-chatbot-consultant], a[href="#chat-consultant"], .btn-drawer-book');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      
      // Close mobile drawer if active
      const navMenu = document.getElementById('navMenu');
      const hamburger = document.getElementById('hamburger');
      const navBackdrop = document.getElementById('navBackdrop');
      if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        if (hamburger) hamburger.classList.remove('active');
        if (navBackdrop) navBackdrop.classList.remove('active');
        document.body.classList.remove('nav-drawer-open');
        document.documentElement.classList.remove('nav-drawer-open');
      }
      
      if (typeof window.openKezzaChat === 'function') {
        window.openKezzaChat(true);
        return;
      }
      const fab = document.getElementById('kezzaChatFab');
      if (fab) {
        fab.click();
        return;
      }
      if (!document.querySelector('script[src*="kezza-ai.js"]')) {
        const s = document.createElement('script');
        s.src = '/js/kezza-ai.js?v=a3cc0339';
        s.defer = true;
        s.onload = function () {
          setTimeout(function () {
            const f = document.getElementById('kezzaChatFab');
            if (f) f.click();
          }, 150);
        };
        document.body.appendChild(s);
      }
    }
  });
});

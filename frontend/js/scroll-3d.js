/**
 * Kezza Clinic - 3D background logo.
 *
 * Desktop (mouse + wide screen): the slow 360° spin is a CSS animation
 * (kzLogoSpin in scroll-3d.css) that runs on the GPU, and this script only adds
 * the scroll / mouse tilt. Its animation loop runs while the logo is still
 * easing towards the new position and then stops, so an idle page does no work.
 *
 * Phones, tablets and "reduce motion": the logo stays still. The old version
 * re-rendered the logo 60 times a second for as long as the page was open,
 * which made scrolling stutter on phones and drained the battery.
 */
(function () {
  var container = document.querySelector('.scroll3d-bg');
  if (!container) return;
  var img = container.querySelector('img');
  if (!img) return;
  var mq = window.matchMedia ? window.matchMedia('(min-width: 1025px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)') : null;
  if (!mq || !mq.matches) return;

  // Wrap the image so the tilt (here) and the spin (CSS, on the image) combine.
  var tilt = document.createElement('span');
  tilt.className = 'scroll3d-tilt';
  img.parentNode.insertBefore(tilt, img);
  tilt.appendChild(img);
  container.classList.add('is-animated');

  var targetY = window.pageYOffset || document.documentElement.scrollTop || 0;
  var currentY = targetY;
  var mouseX = 0, mouseY = 0, curMouseX = 0, curMouseY = 0;
  var running = false;

  function frame() {
    currentY += (targetY - currentY) * 0.1;
    curMouseX += (mouseX - curMouseX) * 0.06;
    curMouseY += (mouseY - curMouseY) * 0.06;

    var ry = (currentY * 0.25 + curMouseX * 12) % 360;
    var rx = Math.sin(currentY * 0.0025) * 8 - curMouseY * 10;
    var rz = Math.sin(currentY * 0.0015) * 2;
    var tz = Math.cos(currentY * 0.003) * 15;
    tilt.style.transform = 'translate3d(0,0,' + tz.toFixed(1) + 'px) rotateX(' + rx.toFixed(2) +
      'deg) rotateY(' + ry.toFixed(2) + 'deg) rotateZ(' + rz.toFixed(2) + 'deg)';

    if (Math.abs(targetY - currentY) > 0.5 || Math.abs(mouseX - curMouseX) > 0.002 || Math.abs(mouseY - curMouseY) > 0.002) {
      requestAnimationFrame(frame);
    } else {
      running = false;
    }
  }

  function kick() {
    if (!running) { running = true; requestAnimationFrame(frame); }
  }

  window.addEventListener('scroll', function () {
    targetY = window.pageYOffset || document.documentElement.scrollTop || 0;
    kick();
  }, { passive: true });

  window.addEventListener('mousemove', function (e) {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    kick();
  }, { passive: true });

  // Pause the CSS spin while the tab is in the background.
  document.addEventListener('visibilitychange', function () {
    container.classList.toggle('is-paused', document.hidden);
  });

  kick();
})();

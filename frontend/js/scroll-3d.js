/**
 * Kezza Clinic - 3D Background Scroll Rotation with LERP physics
 * Interpolates rotation angles smoothly to eliminate wheel notches / stutter.
 */
(function(){
  var img = document.querySelector('.scroll3d-bg img');
  if(!img) return;
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;

  var targetY = window.pageYOffset || document.documentElement.scrollTop || 0;
  var currentY = targetY;
  var isRunning = false;

  function render() {
    // Smooth LERP damping
    currentY += (targetY - currentY) * 0.14;
    var ry = currentY * 0.18;
    var rx = Math.sin(currentY / 500) * 14;
    var rz = currentY * 0.04;
    img.style.transform = 'translate3d(0,0,0) rotateY(' + ry.toFixed(2) + 'deg) rotateX(' + rx.toFixed(2) + 'deg) rotateZ(' + rz.toFixed(2) + 'deg)';

    if (Math.abs(targetY - currentY) > 0.3) {
      requestAnimationFrame(render);
    } else {
      currentY = targetY;
      isRunning = false;
    }
  }

  function onScroll() {
    targetY = window.pageYOffset || document.documentElement.scrollTop || 0;
    if (!isRunning) {
      isRunning = true;
      requestAnimationFrame(render);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  render();
})();

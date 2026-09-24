/**
 * Kezza Clinic - 3D Background Scroll Rotation with LERP physics
 * Interpolates rotation angles smoothly to eliminate wheel notches / stutter.
 */
(function(){
  var container = document.querySelector('.scroll3d-bg');
  if(!container) return;
  var img = container.querySelector('img');
  if(!img) return;
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;

  var targetY = window.pageYOffset || document.documentElement.scrollTop || 0;
  var currentY = targetY;
  var ambientAngle = 0;
  var lastTime = performance.now();
  var mouseX = 0;
  var mouseY = 0;
  var currentMouseX = 0;
  var currentMouseY = 0;

  function render(now) {
    var dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    // Smooth LERP damping on scroll & mouse
    currentY += (targetY - currentY) * 0.1;
    currentMouseX += (mouseX - currentMouseX) * 0.05;
    currentMouseY += (mouseY - currentMouseY) * 0.05;

    // Continuous 360° 3D rotation (ambient ~20 deg/s) + scroll-driven rotation
    ambientAngle = (ambientAngle + dt * 20) % 360;
    var scrollRot = currentY * 0.25;
    var totalRy = (ambientAngle + scrollRot + currentMouseX * 12) % 360;

    // Natural subtle 3D perspective tilts
    var rx = Math.sin(currentY * 0.0025) * 8 - currentMouseY * 10;
    var rz = Math.sin(currentY * 0.0015) * 2;
    var tz = Math.cos(currentY * 0.003) * 15;

    img.style.transform = 'translate3d(0, 0, ' + tz.toFixed(1) + 'px) ' +
                          'rotateX(' + rx.toFixed(2) + 'deg) ' +
                          'rotateY(' + totalRy.toFixed(2) + 'deg) ' +
                          'rotateZ(' + rz.toFixed(2) + 'deg)';

    requestAnimationFrame(render);
  }

  function onScroll() {
    targetY = window.pageYOffset || document.documentElement.scrollTop || 0;
  }

  function onMouseMove(e) {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  window.addEventListener('mousemove', onMouseMove, { passive: true });

  requestAnimationFrame(function(time){
    lastTime = time;
    render(time);
  });
})();

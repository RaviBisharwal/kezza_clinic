(function(){
  var img=document.querySelector('.scroll3d-bg img');
  if(!img) return;
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  var ticking=false;
  function update(){
    var y=window.pageYOffset||document.documentElement.scrollTop||0;
    var ry=(y*0.18);              // spin around Y axis
    var rx=Math.sin(y/500)*14;    // gentle tilt
    var rz=(y*0.04);              // slight roll
    img.style.transform='rotateY('+ry+'deg) rotateX('+rx+'deg) rotateZ('+rz+'deg)';
    ticking=false;
  }
  function onScroll(){ if(!ticking){ requestAnimationFrame(update); ticking=true; } }
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll,{passive:true});
  update();
})();

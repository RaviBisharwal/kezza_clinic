// Auto-play homepage videos when scrolled into view (muted = allowed by browsers)
(function(){
  var vids = document.querySelectorAll('video');
  if(!vids.length) return;
  function tryPlay(v){ v.muted = true; var p = v.play(); if(p && p.catch) p.catch(function(){}); }
  if(!('IntersectionObserver' in window)){ vids.forEach(tryPlay); return; }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ tryPlay(e.target); } else { e.target.pause(); }
    });
  }, { threshold: 0.25 });
  vids.forEach(function(v){ io.observe(v); });
})();

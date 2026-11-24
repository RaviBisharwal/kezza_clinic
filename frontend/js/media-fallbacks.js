/* Graceful media fallback: original clinic photos/videos are never replaced unless the requested file fails. */
(function(){
  'use strict';
  var F='/images/fallbacks/';
  function pathOf(el){var raw=(el.getAttribute('src')||el.getAttribute('poster')||'').toLowerCase();try{return decodeURIComponent(raw);}catch(e){return raw;}}
  function isCaseImage(p,alt){return /before[-_ ]?after|before|after|patient[-_ ]?(case|result|photo)|clinical[-_ ]?result|transformation|outcome|hairline[-_ ]?restoration/.test(p+' '+(alt||'').toLowerCase());}
  function chooseFallback(p,alt){
    if(/logo\.(png|webp|jpe?g|svg)|\bkezza[-_ ]?logo/.test(p))return F+'logo.webp';
    if(/doctor|dr[-_ ]?[a-z]|\bdoctor\d/.test(p))return F+'clinical-team.webp';
    if(/hair|scalp|follic|transplant|prp|gfc|wig|beard/.test(p))return F+'hair-restoration.webp';
    if(/laser|electrolysis|hair[-_ ]?removal|q[-_ ]?switch|ipl/.test(p))return F+'laser-treatment.webp';
    if(/lip|microblad|eyeliner|permanent[-_ ]?makeup|pmu|neutralization/.test(p))return F+'permanent-makeup.webp';
    if(/hifu|cryo|body|weight|stretch[-_ ]?mark|contour/.test(p))return F+'body-treatment.webp';
    if(/skin|acne|scar|pigment|peel|hydra|facial|botox|glutathione|dark[-_ ]?circle/.test(p))return F+'skin-treatment.webp';
    if(/branch|location|clinic|building|reception|map/.test(p))return F+'clinic-location.webp';
    return F+'generic-media.webp';
  }
  function addCaseNote(img){
    var host=img.closest('.ba-img-container,.ba-slider-container,.case-img-pair,.ba-gallery-card,.before-after-section,.sm-ba-container,.dc-ba-container,.prp-ba-container');
    if(!host)host=img.parentElement;
    if(!host)return;
    // Clear image/source elements so a missing patient image is never replaced with an unrelated image.
    var pic=img.closest('picture');
    if(pic){pic.querySelectorAll('source').forEach(function(s){s.removeAttribute('srcset');});}
    img.style.display='none';
    if(host.querySelector('.kz-media-placeholder'))return;
    var box=document.createElement('div');box.className='kz-media-placeholder kz-media-placeholder--case';box.setAttribute('role','note');
    var strong=document.createElement('strong');strong.textContent='Patient case photo unavailable';box.appendChild(strong);
    var small=document.createElement('small');small.textContent='The original image was not included in this archive. Add the consented, verified case photo before publishing this section. Individual results vary.';box.appendChild(small);
    host.appendChild(box);
  }
  function imgError(event){
    var img=event.target;
    if(!img||img.tagName!=='IMG'||img.dataset.kzFallbackApplied==='1')return;
    var p=pathOf(img), alt=img.getAttribute('alt')||'';
    if(isCaseImage(p,alt)){addCaseNote(img);img.dataset.kzFallbackApplied='1';return;}
    img.dataset.kzFallbackApplied='1';
    var picture=img.closest('picture');
    if(picture)picture.querySelectorAll('source').forEach(function(s){s.removeAttribute('srcset');});
    var fallback=chooseFallback(p,alt);
    img.setAttribute('src',fallback);img.removeAttribute('srcset');img.removeAttribute('sizes');
    if(/doctor|dr[-_ ]?[a-z]|\bdoctor\d/.test(p))img.alt='Kezza clinical team image placeholder';
    else if(/logo/.test(p))img.alt='Kezza Hair & Skin Clinic';
    else img.alt='Illustrative Kezza Hair & Skin Clinic information card; original image unavailable';
  }
  function mediaError(event){
    var el=event.target;
    if(!el||el.tagName!=='VIDEO'||el.dataset.kzFallbackApplied==='1')return;
    el.dataset.kzFallbackApplied='1';el.style.display='none';
    var host=el.parentElement||el.parentNode;if(!host||host.querySelector('.kz-video-fallback'))return;
    var box=document.createElement('div');box.className='kz-video-fallback';box.setAttribute('role','note');
    var strong=document.createElement('strong');strong.textContent='Video preview unavailable';box.appendChild(strong);
    var small=document.createElement('small');small.textContent='The original video file was not included in this archive. Restore it to show the video here.';box.appendChild(small);host.appendChild(box);
  }
  document.addEventListener('error',imgError,true);
  document.addEventListener('error',mediaError,true);
})();

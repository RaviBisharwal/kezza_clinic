(function(){"use strict";if(typeof window=="undefined")return;const m=90,s=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;function u(){document.addEventListener("click",function(o){const n=o.target.closest('a[href^="#"]');if(!n)return;const i=n.getAttribute("href");if(!(!i||i==="#"||i.length<=1)&&!(n.getAttribute("data-bs-toggle")||n.getAttribute("data-toggle")))try{const l=document.querySelector(i);if(l){o.preventDefault();let a=m;const b=document.querySelector(".navbar"),k=document.querySelector(".service-nav-strip, .sticky-nav");b&&(a=b.offsetHeight,k&&(a+=k.offsetHeight),a+=12);const d=parseInt(window.getComputedStyle(l).scrollMarginTop,10);!isNaN(d)&&d>0&&(a=d);const x=l.getBoundingClientRect().top+(window.pageYOffset||document.documentElement.scrollTop||0)-a;window.scrollTo({top:Math.max(0,Math.round(x)),behavior:s?"auto":"smooth"}),history.pushState&&history.pushState(null,null,i)}}catch(l){}},{passive:!1})}let e=null;function f(){if(!document.getElementById("kzScrollProgressStyle")){const o=document.createElement("style");o.id="kzScrollProgressStyle",o.textContent=`
                #kzScrollProgress {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    height: 3px !important;
                    background: linear-gradient(90deg, #00abba 0%, #00c4d6 40%, #00AFC0 85%, #00AFC0 100%) !important;
                    box-shadow: 0 1px 8px rgba(0, 171, 186, 0.45) !important;
                    transform-origin: 0% 50% !important;
                    transform: scaleX(0);
                    z-index: 10002 !important;
                    pointer-events: none !important;
                    will-change: transform !important;
                    transition: opacity 0.25s ease !important;
                }
                #kzBackToTop {
                    position: fixed !important;
                    bottom: 24px !important;
                    left: 24px !important;
                    width: 42px !important;
                    height: 42px !important;
                    border-radius: 50% !important;
                    background: rgba(10, 18, 36, 0.94) !important;
                    border: 1.5px solid rgba(0, 175, 192, 0.5) !important;
                    backdrop-filter: blur(12px) !important;
                    -webkit-backdrop-filter: blur(12px) !important;
                    color: #00AFC0 !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    font-size: 14px !important;
                    cursor: pointer !important;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35), 0 0 15px rgba(0, 171, 186, 0.15) !important;
                    opacity: 0 !important;
                    visibility: hidden !important;
                    transform: translateY(12px) translateZ(0) !important;
                    transition: all 0.32s cubic-bezier(0.16, 1, 0.3, 1) !important;
                    z-index: 995 !important;
                    outline: none !important;
                    -webkit-tap-highlight-color: transparent !important;
                    padding: 0 !important;
                    margin: 0 !important;
                }
                #kzBackToTop i {
                    color: #00AFC0 !important;
                    font-size: 14px !important;
                    transition: transform 0.25s ease, color 0.25s ease !important;
                    display: inline-block !important;
                    line-height: 1 !important;
                }
                #kzBackToTop.is-visible {
                    opacity: 1 !important;
                    visibility: visible !important;
                    transform: translateY(0) translateZ(0) !important;
                }
                #kzBackToTop:hover {
                    background: linear-gradient(135deg, #00abba 0%, #008f9c 100%) !important;
                    border-color: #00c4d6 !important;
                    box-shadow: 0 10px 28px rgba(0, 171, 186, 0.5) !important;
                    transform: translateY(-3px) scale(1.06) translateZ(0) !important;
                }
                #kzBackToTop:hover i {
                    color: #ffffff !important;
                    transform: translateY(-1px) !important;
                }
                @media (max-width: 768px) {
                    #kzBackToTop {
                        bottom: 84px !important;
                        left: 16px !important;
                        width: 38px !important;
                        height: 38px !important;
                    }
                    #kzBackToTop i {
                        font-size: 13px !important;
                    }
                }
            `,(document.head||document.documentElement).appendChild(o)}e||(e=document.getElementById("kzScrollProgress"),!e&&document.body&&(e=document.createElement("div"),e.id="kzScrollProgress",e.setAttribute("aria-hidden","true"),document.body.prepend(e)))}let t=null;function g(){t||(t=document.getElementById("kzBackToTop"),!t&&document.body&&(t=document.createElement("button"),t.id="kzBackToTop",t.type="button",t.setAttribute("aria-label","Scroll back to top"),t.title="Back to top",t.innerHTML='<i class="fas fa-chevron-up" aria-hidden="true"></i>',document.body.appendChild(t),t.addEventListener("click",function(o){o.preventDefault(),window.scrollTo({top:0,behavior:s?"auto":"smooth"})})))}let c=!1;const r=document.querySelector(".navbar");function p(){e||(e=document.getElementById("kzScrollProgress")),t||(t=document.getElementById("kzBackToTop"));const o=window.pageYOffset||document.documentElement.scrollTop||0,n=Math.max(document.body?document.body.scrollHeight:0,document.documentElement?document.documentElement.scrollHeight:0)-window.innerHeight;if(e)if(n>10){const i=Math.min(Math.max(o/n,0),1);e.style.transform="scaleX("+i.toFixed(4)+")",e.style.opacity="1"}else e.style.opacity="0";r&&(o>30?r.classList.contains("is-scrolled")||r.classList.add("is-scrolled"):r.classList.contains("is-scrolled")&&r.classList.remove("is-scrolled")),t&&(o>350?t.classList.contains("is-visible")||t.classList.add("is-visible"):t.classList.contains("is-visible")&&t.classList.remove("is-visible")),c=!1}function h(){c||(requestAnimationFrame(p),c=!0)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",function(){u(),f(),g(),p()}):(u(),f(),g(),p()),window.addEventListener("scroll",h,{passive:!0}),window.addEventListener("resize",h,{passive:!0}),window.KezzaSmoothScroll={scrollTo:function(o){window.scrollTo({top:Math.max(0,o),behavior:s?"auto":"smooth"})},scrollToElement:function(o){const n=document.querySelector(o);if(n){const i=n.getBoundingClientRect().top+(window.pageYOffset||document.documentElement.scrollTop||0)-m;window.scrollTo({top:Math.max(0,Math.round(i)),behavior:s?"auto":"smooth"})}}}})();

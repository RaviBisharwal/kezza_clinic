(function(){let a=!1,e=!1,n=null,t=null,o=null;document.addEventListener("DOMContentLoaded",function(){n=document.querySelector(".navbar"),t=document.querySelector(".hero-image"),o=document.querySelector(".hero-content")});function i(){const s=window.pageYOffset||document.documentElement.scrollTop||0,r=s>50;r!==e&&n&&(e=r,e?(n.style.background="rgba(255, 255, 255, 0.98)",n.style.boxShadow="0 2px 20px rgba(0, 0, 0, 0.1)"):(n.style.background="rgba(255, 255, 255, 0.95)",n.style.boxShadow="none")),s<window.innerHeight&&(t&&(t.style.transform=`translate3d(0, ${s*-.25}px, 0)`),o&&(o.style.opacity=Math.max(0,1-s/600))),a=!1}window.addEventListener("scroll",function(){a||(requestAnimationFrame(i),a=!0)},{passive:!0})})(),document.addEventListener("DOMContentLoaded",function(){const a=document.querySelector(".hero-image"),e=document.querySelector(".branches-hero-section");a&&e&&(e.addEventListener("mousemove",function(n){const t=e.getBoundingClientRect(),o=(n.clientX-t.left)/t.width,i=(n.clientY-t.top)/t.height,s=(o-.5)*15,r=(i-.5)*15;a.style.transform=`translate(${s}px, ${r}px)`}),e.addEventListener("mouseleave",function(){a.style.transform="translate(0, 0)"}))}),document.addEventListener("DOMContentLoaded",function(){document.querySelectorAll(".btn-gold, .btn-navy, .btn-primary, .btn-cta-phone, .btn-cta-whatsapp, .btn-cta-consultation").forEach(e=>{e.addEventListener("click",function(n){const t=document.createElement("span"),o=this.getBoundingClientRect(),i=Math.max(o.width,o.height),s=n.clientX-o.left-i/2,r=n.clientY-o.top-i/2;t.style.width=t.style.height=i+"px",t.style.left=s+"px",t.style.top=r+"px",t.classList.add("ripple"),this.style.position="relative",this.style.overflow="hidden",this.appendChild(t),setTimeout(()=>{t.remove()},600)}),e.addEventListener("mouseenter",function(){this.style.transform="translateY(-3px) scale(1.02) translateZ(10px)",this.style.boxShadow="0 15px 35px rgba(0, 0, 0, 0.2)"}),e.addEventListener("mouseleave",function(){this.style.transform="translateY(0) scale(1) translateZ(0)"})})});const additionalCSS=`
.ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple-animation 0.6s linear;
    pointer-events: none;
}

@keyframes ripple-animation {
    to {
        transform: scale(4);
        opacity: 0;
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
`,style=document.createElement("style");style.textContent=additionalCSS,document.head.appendChild(style),window.addEventListener("load",function(){document.body.style.opacity="0",document.body.style.transition="opacity 0.5s ease",setTimeout(()=>{document.body.style.opacity="1"},100)});

(function(){let n=!1,t=!1,o=null;document.addEventListener("DOMContentLoaded",function(){o=document.querySelector(".navbar")});function e(){const s=(window.pageYOffset||document.documentElement.scrollTop||0)>50;s!==t&&o&&(t=s,t?(o.style.background="rgba(255, 255, 255, 0.98)",o.style.boxShadow="0 2px 20px rgba(0, 0, 0, 0.1)"):(o.style.background="rgba(255, 255, 255, 0.95)",o.style.boxShadow="none")),n=!1}window.addEventListener("scroll",function(){n||(requestAnimationFrame(e),n=!0)},{passive:!0})})();const observerOptions={threshold:.1,rootMargin:"0px 0px -50px 0px"},observer=new IntersectionObserver(function(n){n.forEach(t=>{t.isIntersecting&&(t.target.style.opacity="1",t.target.style.transform="translateY(0)",t.target.classList.contains("why-contact-card")&&(t.target.style.animation="floatUp 0.8s ease forwards"),t.target.classList.contains("faq-item")&&(t.target.style.animation="fadeInUp 0.8s ease forwards"),observer.unobserve(t.target))})},observerOptions);document.addEventListener("DOMContentLoaded",function(){document.querySelectorAll(".branch-card, .why-contact-card, .faq-item").forEach(t=>{t.style.opacity="0",t.style.transform="translateY(30px)",t.style.transition="all 0.6s ease",observer.observe(t)})}),document.addEventListener("DOMContentLoaded",function(){const n=document.querySelector(".hero-image img"),t=document.querySelector(".contact-hero-section");n&&t&&(t.addEventListener("mousemove",function(o){const e=t.getBoundingClientRect(),a=(o.clientX-e.left)/e.width,s=(o.clientY-e.top)/e.height,r=(a-.5)*15,i=(s-.5)*15;n.style.transform=`translate(${r}px, ${i}px)`}),t.addEventListener("mouseleave",function(){n.style.transform="translate(0, 0)"}))}),document.addEventListener("DOMContentLoaded",function(){const n=document.querySelectorAll(".faq-item");n.forEach(t=>{const o=t.querySelector(".faq-question"),e=t.querySelector(".faq-answer");o.addEventListener("click",function(){const a=t.classList.contains("active");n.forEach(s=>{if(s!==t){s.classList.remove("active");const r=s.querySelector(".faq-answer");r.style.maxHeight="0"}}),a?(t.classList.remove("active"),e.style.maxHeight="0"):(t.classList.add("active"),e.style.maxHeight=e.scrollHeight+"px")})})}),document.addEventListener("DOMContentLoaded",function(){document.querySelectorAll(".btn-gold, .btn-navy, .btn-primary, .btn-appointment, .directions-btn, .submit-btn").forEach(t=>{t.addEventListener("click",function(o){const e=document.createElement("span"),a=this.getBoundingClientRect(),s=Math.max(a.width,a.height),r=o.clientX-a.left-s/2,i=o.clientY-a.top-s/2;e.style.width=e.style.height=s+"px",e.style.left=r+"px",e.style.top=i+"px",e.classList.add("ripple"),this.appendChild(e),setTimeout(()=>{e.remove()},600)}),t.addEventListener("mouseenter",function(){this.style.transform="translateY(-3px) scale(1.02)",this.style.boxShadow="0 15px 35px rgba(0, 0, 0, 0.2)"}),t.addEventListener("mouseleave",function(){this.style.transform="translateY(0) scale(1)",this.style.boxShadow="none"})})}),document.addEventListener("DOMContentLoaded",function(){document.querySelectorAll(".branch-card, .why-contact-card, .form-card, .info-card").forEach(t=>{t.addEventListener("mouseenter",function(){this.style.transform="translateY(-10px) scale(1.02)",this.style.boxShadow="0 25px 50px rgba(0, 0, 0, 0.15)"}),t.addEventListener("mouseleave",function(){this.style.transform="translateY(0) scale(1)",this.style.boxShadow="0 10px 30px rgba(0, 0, 0, 0.1)"})})}),window.addEventListener("load",function(){document.body.style.opacity="0",document.body.style.transition="opacity 0.5s ease",setTimeout(()=>{document.body.style.opacity="1"},100)}),document.addEventListener("DOMContentLoaded",function(){document.querySelectorAll(".form-group input, .form-group select, .form-group textarea").forEach(t=>{t.addEventListener("focus",function(){this.parentNode.classList.add("focused")}),t.addEventListener("blur",function(){this.parentNode.classList.remove("focused"),this.value?this.parentNode.classList.add("filled"):this.parentNode.classList.remove("filled")})})});const additionalCSS=`
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

.form-group.focused label {
    color: var(--gold);
}

.form-group.filled label {
    color: var(--navy);
}

.card-icon {
    animation: bounce 2s infinite;
}

.floating-particles {
    animation: floatParticles 8s ease-in-out infinite;
}

@keyframes floatParticles {
    0%, 100% {
        transform: translateY(0px) rotate(0deg);
    }
    50% {
        transform: translateY(-15px) rotate(180deg);
    }
}
`,style=document.createElement("style");style.textContent=additionalCSS,document.head.appendChild(style);

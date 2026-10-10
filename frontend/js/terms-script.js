(function(){let t=!1,e=!1;const n=document.querySelector(".navbar");function o(){const i=(window.pageYOffset||document.documentElement.scrollTop||0)>50;i!==e&&n&&(e=i,e?(n.style.background="rgba(255, 255, 255, 0.98)",n.style.boxShadow="0 2px 20px rgba(0, 0, 0, 0.1)"):(n.style.background="rgba(255, 255, 255, 0.95)",n.style.boxShadow="none")),t=!1}window.addEventListener("scroll",function(){t||(requestAnimationFrame(o),t=!0)},{passive:!0})})();const observerOptions={threshold:.1,rootMargin:"0px 0px -50px 0px"},observer=new IntersectionObserver(function(t){t.forEach(e=>{e.isIntersecting&&(e.target.style.opacity="1",e.target.style.transform="translateY(0)",observer.unobserve(e.target))})},observerOptions);document.addEventListener("DOMContentLoaded",function(){document.querySelectorAll(".terms-section").forEach(e=>{e.style.opacity="0",e.style.transform="translateY(30px)",e.style.transition="all 0.6s ease",observer.observe(e)})}),document.addEventListener("DOMContentLoaded",function(){const t=document.querySelector(".gold-underline");if(t){const e=new IntersectionObserver(n=>{n.forEach(o=>{o.isIntersecting&&(o.target.style.animation="expandWidth 1.5s ease forwards",e.unobserve(o.target))})},{threshold:.5});e.observe(t)}}),window.addEventListener("load",function(){document.body.style.opacity="0",document.body.style.transition="opacity 0.5s ease",setTimeout(()=>{document.body.style.opacity="1"},100)}),document.addEventListener("DOMContentLoaded",function(){const t=document.createElement("button");t.className="print-btn",t.innerHTML="🖨️ Print",t.style.cssText=`
        position: fixed;
        bottom: 90px;
        right: 30px;
        background: var(--navy, #333333);
        color: var(--white);
        border: none;
        padding: 12px 20px;
        border-radius: 25px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
        z-index: 1000;
    `,t.addEventListener("click",function(){window.print()}),t.addEventListener("mouseenter",function(){this.style.background="var(--gold, #00AFC0)",this.style.color="var(--navy, #333333)",this.style.transform="translateY(-2px)"}),t.addEventListener("mouseleave",function(){this.style.background="var(--navy, #333333)",this.style.color="var(--white)",this.style.transform="translateY(0)"}),document.body.appendChild(t);function e(){window.innerWidth<=768?t.style.display="none":t.style.display="block"}e(),window.addEventListener("resize",e)}),document.addEventListener("DOMContentLoaded",function(){document.querySelectorAll(".terms-section h2").forEach(e=>{e.style.cursor="pointer",e.title="Click to copy link to this section",e.addEventListener("click",function(){const n=this.textContent.toLowerCase().replace(/[^a-z0-9]+/g,"-"),o=window.location.origin+window.location.pathname+"#"+n;if(navigator.clipboard)navigator.clipboard.writeText(o).then(()=>{showNotification("Link copied to clipboard!")});else{const i=document.createElement("textarea");i.value=o,document.body.appendChild(i),i.select(),document.execCommand("copy"),document.body.removeChild(i),showNotification("Link copied to clipboard!")}})})});function showNotification(t,e=3e3){const n=document.createElement("div");n.className="notification",n.textContent=t,n.style.cssText=`
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--gold, #00AFC0);
        color: var(--navy, #333333);
        padding: 15px 25px;
        border-radius: 5px;
        font-weight: 600;
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `,document.body.appendChild(n),setTimeout(()=>{n.style.transform="translateX(0)"},100),setTimeout(()=>{n.style.transform="translateX(400px)",setTimeout(()=>{n.parentNode&&n.remove()},300)},e)}document.addEventListener("keydown",function(t){if(!(t.target&&t.target.closest&&t.target.closest('input, textarea, select, [contenteditable="true"]'))&&((t.key==="t"||t.key==="T")&&!t.ctrlKey&&!t.altKey&&!t.metaKey&&window.scrollTo({top:0,behavior:"smooth"}),t.key==="p"||t.key==="P")){if(t.ctrlKey||t.metaKey)return;t.altKey||(t.preventDefault(),window.print())}}),document.addEventListener("DOMContentLoaded",function(){const t=document.createElement("div");t.className="shortcuts-info",t.innerHTML=`
        <small style="
            position: fixed;
            bottom: 76px;
            left: 24px;
            color: #999;
            font-size: 12px;
            z-index: 1000;
        ">
            Shortcuts: T = Top, P = Print, Ctrl+P = Print Dialog
        </small>
    `,document.body.appendChild(t);function e(){window.innerWidth<=768?t.style.display="none":t.style.display="block"}e(),window.addEventListener("resize",e)});const additionalCSS=`
@media (max-width: 768px) {
    .print-btn,
    .shortcuts-info {
        display: none !important;
    }
}
`,style=document.createElement("style");style.textContent=additionalCSS,document.head.appendChild(style);

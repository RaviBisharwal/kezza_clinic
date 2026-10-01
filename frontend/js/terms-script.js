// In-page anchor scrolling (with the fixed-navbar offset) is handled by smooth-scroll.js.
// Optimized Navbar scroll effect
(function() {
    let ticking = false;
    let isScrolled = false;
    const navbar = document.querySelector('.navbar');

    function updateNav() {
        const scrolled = (window.pageYOffset || document.documentElement.scrollTop || 0) > 50;
        if (scrolled !== isScrolled && navbar) {
            isScrolled = scrolled;
            if (isScrolled) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = 'none';
            }
        }
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateNav);
            ticking = true;
        }
    }, { passive: true });
})();

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.terms-section');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
});

// Scroll-triggered animation for gold underline
document.addEventListener('DOMContentLoaded', function() {
    const goldUnderline = document.querySelector('.gold-underline');
    
    if (goldUnderline) {
        const underlineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'expandWidth 1.5s ease forwards';
                    underlineObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        underlineObserver.observe(goldUnderline);
    }
});

// The back-to-top button and reading-progress bar come from the site-wide smooth-scroll.js.

// Loading animation
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Print functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add print button (optional)
    const printBtn = document.createElement('button');
    printBtn.className = 'print-btn';
    printBtn.innerHTML = '🖨️ Print';
    printBtn.style.cssText = `
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
    `;
    
    printBtn.addEventListener('click', function() {
        window.print();
    });
    
    printBtn.addEventListener('mouseenter', function() {
        this.style.background = 'var(--gold, #00AFC0)';
        this.style.color = 'var(--navy, #333333)';
        this.style.transform = 'translateY(-2px)';
    });
    
    printBtn.addEventListener('mouseleave', function() {
        this.style.background = 'var(--navy, #333333)';
        this.style.color = 'var(--white)';
        this.style.transform = 'translateY(0)';
    });
    
    document.body.appendChild(printBtn);
    
    // Hide print button on mobile
    function checkPrintButtonVisibility() {
        if (window.innerWidth <= 768) {
            printBtn.style.display = 'none';
        } else {
            printBtn.style.display = 'block';
        }
    }
    
    checkPrintButtonVisibility();
    window.addEventListener('resize', checkPrintButtonVisibility);
});

// Copy link functionality for sections
document.addEventListener('DOMContentLoaded', function() {
    const sectionHeadings = document.querySelectorAll('.terms-section h2');
    
    sectionHeadings.forEach(heading => {
        heading.style.cursor = 'pointer';
        heading.title = 'Click to copy link to this section';
        
        heading.addEventListener('click', function() {
            const sectionId = this.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const url = window.location.origin + window.location.pathname + '#' + sectionId;
            
            // Copy to clipboard
            if (navigator.clipboard) {
                navigator.clipboard.writeText(url).then(() => {
                    showNotification('Link copied to clipboard!');
                });
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = url;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showNotification('Link copied to clipboard!');
            }
        });
    });
});

// Simple notification system
function showNotification(message, duration = 3000) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
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
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, duration);
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    // Never hijack keys while the visitor is typing (chatbot, forms)
    if (e.target && e.target.closest && e.target.closest('input, textarea, select, [contenteditable="true"]')) return;

    // Press 'T' to scroll to top
    if (e.key === 't' || e.key === 'T') {
        if (!e.ctrlKey && !e.altKey && !e.metaKey) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }
    
    // Press 'P' to print
    if (e.key === 'p' || e.key === 'P') {
        if (e.ctrlKey || e.metaKey) {
            // Let browser handle Ctrl+P
            return;
        }
        if (!e.altKey) {
            e.preventDefault();
            window.print();
        }
    }
});

// Keyboard shortcuts hint (sits just above the site-wide back-to-top button)
document.addEventListener('DOMContentLoaded', function() {
    const shortcutsInfo = document.createElement('div');
    shortcutsInfo.className = 'shortcuts-info';
    shortcutsInfo.innerHTML = `
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
    `;
    
    document.body.appendChild(shortcutsInfo);
    
    // Hide on mobile
    function checkShortcutsVisibility() {
        if (window.innerWidth <= 768) {
            shortcutsInfo.style.display = 'none';
        } else {
            shortcutsInfo.style.display = 'block';
        }
    }
    
    checkShortcutsVisibility();
    window.addEventListener('resize', checkShortcutsVisibility);
});

// Hide the print button and the shortcut hint on phones
const additionalCSS = `
@media (max-width: 768px) {
    .print-btn,
    .shortcuts-info {
        display: none !important;
    }
}
`;

const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);

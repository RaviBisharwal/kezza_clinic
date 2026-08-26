// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;
        try {
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        } catch (err) {}
    });
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

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

// Scroll to Top Button
document.addEventListener('DOMContentLoaded', function() {
    // Create scroll to top button
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.className = 'scroll-to-top';
    scrollToTopBtn.innerHTML = '↑';
    scrollToTopBtn.setAttribute('aria-label', 'Scroll to top');
    document.body.appendChild(scrollToTopBtn);
    
    // Show/hide scroll to top button
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });
    
    // Scroll to top functionality
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const navMenu = document.querySelector('.nav-menu');
    const navToggle = document.createElement('div');
    navToggle.className = 'nav-toggle';
    navToggle.innerHTML = '☰';
    navToggle.style.display = 'none';
    navToggle.style.fontSize = '24px';
    navToggle.style.cursor = 'pointer';
    navToggle.style.color = 'var(--navy)';
    
    document.querySelector('.nav-container').appendChild(navToggle);
    
    function checkScreenSize() {
        if (window.innerWidth <= 768) {
            navToggle.style.display = 'block';
            navMenu.style.display = 'none';
        } else {
            navToggle.style.display = 'none';
            navMenu.style.display = 'flex';
        }
    }
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    navToggle.addEventListener('click', function() {
        if (navMenu.style.display === 'none' || navMenu.style.display === '') {
            navMenu.style.display = 'flex';
            navMenu.style.flexDirection = 'column';
            navMenu.style.position = 'absolute';
            navMenu.style.top = '100%';
            navMenu.style.left = '0';
            navMenu.style.right = '0';
            navMenu.style.background = 'white';
            navMenu.style.padding = '20px';
            navMenu.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
        } else {
            navMenu.style.display = 'none';
        }
    });
});

// Loading animation
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Reading progress indicator
document.addEventListener('DOMContentLoaded', function() {
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #D4AF37, #F4E4BC);
        z-index: 10000;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);
    
    // Update progress on scroll
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    });
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
        background: var(--navy);
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
        this.style.background = 'var(--gold)';
        this.style.color = 'var(--navy)';
        this.style.transform = 'translateY(-2px)';
    });
    
    printBtn.addEventListener('mouseleave', function() {
        this.style.background = 'var(--navy)';
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

// Highlight current section in navigation (if TOC is added)
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.terms-section');
    const tocLinks = document.querySelectorAll('.table-of-contents a');
    
    if (tocLinks.length > 0) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    tocLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '-20% 0px -70% 0px'
        });
        
        sections.forEach(section => {
            if (section.id) {
                sectionObserver.observe(section);
            }
        });
    }
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
        background: var(--gold);
        color: var(--navy);
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

// Add keyboard shortcuts info (optional)
document.addEventListener('DOMContentLoaded', function() {
    const shortcutsInfo = document.createElement('div');
    shortcutsInfo.className = 'shortcuts-info';
    shortcutsInfo.innerHTML = `
        <small style="
            position: fixed;
            bottom: 10px;
            left: 20px;
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

// Add CSS for active TOC links
const additionalCSS = `
.table-of-contents a.active {
    color: var(--gold);
    font-weight: 600;
}

.reading-progress {
    box-shadow: 0 2px 4px rgba(212, 175, 55, 0.3);
}

@media (max-width: 768px) {
    .print-btn,
    .shortcuts-info {
        display: none !important;
    }
    
    .scroll-to-top {
        bottom: 20px;
        right: 20px;
    }
}
`;

const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);

console.log('Kezza Terms & Conditions page loaded successfully! 📋');
// Initialize animations
AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true
});

// Initialize Vanta.js background (only if element exists)
if (document.getElementById("vanta-bg")) {
    VANTA.GLOBE({
        el: "#vanta-bg",
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x667eea,
        backgroundColor: 0xf8fafc,
        size: 0.8
    });
}

// Contact Form Submission (only if form exists)
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const form = e.target;
        const data = {
            name: form.name.value,
            email: form.email.value,
            subject: form.subject.value,
            message: form.message.value
        };
        const endpoint = 'https://formspree.io/f/mjkedzyv';
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                document.getElementById('formStatus').classList.remove('hidden');
                form.reset();
            } else {
                document.getElementById('formStatus').textContent = "Failed to send. Please try again.";
                document.getElementById('formStatus').classList.remove('hidden');
                document.getElementById('formStatus').classList.add('text-red-600');
            }
        } catch {
            document.getElementById('formStatus').textContent = "Failed to send. Please try again.";
            document.getElementById('formStatus').classList.remove('hidden');
            document.getElementById('formStatus').classList.add('text-red-600');
        }
    });
}

// Projects Carousel Scroll (only if carousel exists)
const carousel = document.getElementById('projectsCarousel');
const scrollLeftBtn = document.getElementById('scrollLeft');
const scrollRightBtn = document.getElementById('scrollRight');
const scrollLeftDesktop = document.getElementById('scrollLeftDesktop');
const scrollRightDesktop = document.getElementById('scrollRightDesktop');

if (carousel) {
    // Calculate scroll distance based on screen size
    function getScrollDistance() {
        if (window.innerWidth <= 480) {
            return 260 + 16; // card width + margin for small phones
        } else if (window.innerWidth <= 768) {
            return 280 + 16; // card width + margin for mobile
        } else {
            return 360; // desktop scroll distance
        }
    }
    
    // Check if we're at the start (mobile-aware)
    function isAtStart() {
        if (window.innerWidth <= 768) {
            // Mobile: account for the centering padding
            const centerPadding = window.innerWidth <= 480 ? 
                (window.innerWidth - 260) / 2 : 
                (window.innerWidth - 280) / 2;
            return carousel.scrollLeft <= centerPadding + 10; // 10px tolerance
        } else {
            return carousel.scrollLeft <= 0;
        }
    }
    
    // Check if we're at the end (mobile-aware)
    function isAtEnd() {
        if (window.innerWidth <= 768) {
            // Mobile: account for the centering padding
            const centerPadding = window.innerWidth <= 480 ? 
                (window.innerWidth - 260) / 2 : 
                (window.innerWidth - 280) / 2;
            const maxScroll = carousel.scrollWidth - carousel.clientWidth;
            return carousel.scrollLeft >= maxScroll - centerPadding - 10; // 10px tolerance
        } else {
            const maxScroll = carousel.scrollWidth - carousel.clientWidth;
            return carousel.scrollLeft >= maxScroll - 5;
        }
    }
    
    // Scroll left function
    function scrollLeft() {
        const scrollDistance = getScrollDistance();
        
        if (isAtStart()) {
            // If at the beginning, scroll to the end
            if (window.innerWidth <= 768) {
                // Mobile: scroll to last card position
                const centerPadding = window.innerWidth <= 480 ? 
                    (window.innerWidth - 260) / 2 : 
                    (window.innerWidth - 280) / 2;
                const maxScroll = carousel.scrollWidth - carousel.clientWidth;
                carousel.scrollTo({ 
                    left: maxScroll - centerPadding, 
                    behavior: 'smooth' 
                });
            } else {
                // Desktop: scroll to end
                carousel.scrollTo({ left: carousel.scrollWidth, behavior: 'smooth' });
            }
        } else {
            carousel.scrollBy({ left: -scrollDistance, behavior: 'smooth' });
        }
    }
    
    // Scroll right function
    function scrollRight() {
        const scrollDistance = getScrollDistance();
        
        if (isAtEnd()) {
            // If at the end, scroll to the beginning
            if (window.innerWidth <= 768) {
                // Mobile: scroll to first card position (centered)
                const centerPadding = window.innerWidth <= 480 ? 
                    (window.innerWidth - 260) / 2 : 
                    (window.innerWidth - 280) / 2;
                carousel.scrollTo({ 
                    left: centerPadding, 
                    behavior: 'smooth' 
                });
            } else {
                // Desktop: scroll to start
                carousel.scrollTo({ left: 0, behavior: 'smooth' });
            }
        } else {
            carousel.scrollBy({ left: scrollDistance, behavior: 'smooth' });
        }
    }
    
    // Attach event listeners for mobile arrows
    if (scrollLeftBtn && scrollRightBtn) {
        scrollLeftBtn.onclick = scrollLeft;
        scrollRightBtn.onclick = scrollRight;
    }
    
    // Attach event listeners for desktop arrows
    if (scrollLeftDesktop && scrollRightDesktop) {
        scrollLeftDesktop.onclick = scrollLeft;
        scrollRightDesktop.onclick = scrollRight;
    }
    
    // Update arrow visibility based on scroll position
    function updateArrowVisibility() {
        const atStart = isAtStart();
        const atEnd = isAtEnd();
        
        // Update mobile arrows
        if (scrollLeftBtn && scrollRightBtn) {
            scrollLeftBtn.style.opacity = atStart ? '0.5' : '1';
            scrollRightBtn.style.opacity = atEnd ? '0.5' : '1';
        }
        
        // Update desktop arrows
        if (scrollLeftDesktop && scrollRightDesktop) {
            scrollLeftDesktop.style.opacity = atStart ? '0.5' : '1';
            scrollRightDesktop.style.opacity = atEnd ? '0.5' : '1';
        }
    }
    
    // Update arrow states on scroll
    carousel.addEventListener('scroll', updateArrowVisibility);
    
    // Update arrow states on window resize
    window.addEventListener('resize', updateArrowVisibility);
    
    // Initial check
    updateArrowVisibility();
}

// Animate section title underline on section hover
document.querySelectorAll('.section-title-container').forEach(container => {
    const underline = container.querySelector('.section-title-underline');
    if (underline) {
        container.addEventListener('mouseenter', () => {
            underline.classList.add('active');
        });
        container.addEventListener('mouseleave', () => {
            underline.classList.remove('active');
        });
    }
});

// Enhanced mobile menu functionality with proper active states
function updateActiveNavStates() {
    const currentPage = window.location.pathname;
    const currentHash = window.location.hash;
    
    // Remove existing active states
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active-page', 'transition-none', 'font-bold');
    });
    
    // Apply active state based on current section
    if (currentPage.includes('projects.html')) {
        // Projects page - activate Projects nav
        document.querySelectorAll('a[href="projects.html"]').forEach(link => {
            link.classList.add('active-page', 'transition-none', 'font-bold');
        });
    } else {
        // Index page - check hash for sections or default to Home
        if (currentHash === '#about') {
            document.querySelectorAll('a[href="index.html#about"], a[href="#about"]').forEach(link => {
                link.classList.add('active-page', 'transition-none', 'font-bold');
            });
        } else if (currentHash === '#skills') {
            document.querySelectorAll('a[href="index.html#skills"], a[href="#skills"]').forEach(link => {
                link.classList.add('active-page', 'transition-none', 'font-bold');
            });
        } else if (currentHash === '#experience') {
            document.querySelectorAll('a[href="index.html#experience"], a[href="#experience"]').forEach(link => {
                link.classList.add('active-page', 'transition-none', 'font-bold');
            });
        } else {
            // Default to Home if no specific section or on intro
            document.querySelectorAll('a[href="index.html"]').forEach(link => {
                link.classList.add('active-page', 'transition-none', 'font-bold');
            });
        }
    }
}

// Click away to close mobile menu
document.addEventListener('click', function(event) {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu'); 
    const hamburgerLabel = document.querySelector('label[for="menu-toggle"]');
    const hamburgerContainer = document.querySelector('.md\\:hidden');

    if (
        menuToggle &&
        menuToggle.checked &&
        mobileMenu &&
        !mobileMenu.contains(event.target) &&
        !hamburgerLabel.contains(event.target) &&
        !hamburgerContainer.contains(event.target) &&
        event.target !== menuToggle
    ) {
        menuToggle.checked = false;
    }
});

// Close mobile menu when clicking navigation links
document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', function() {
        const menuToggle = document.getElementById('menu-toggle');
        if (menuToggle) {
            menuToggle.checked = false;
        }
    });
});

// Close mobile menu on scroll
let scrollTimeout;
window.addEventListener('scroll', function() {
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle && menuToggle.checked) {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            menuToggle.checked = false;
        }, 100);
    }
});

// Fetch and display version from VERSION file
async function loadVersion() {
    try {
        const response = await fetch('/VERSION');
        if (response.ok) {
            const version = await response.text();
            const versionElement = document.getElementById('version-display');
            if (versionElement) {
                versionElement.textContent = version.trim();
            }
        } else {
            console.warn('Could not fetch version file');
        }
    } catch (error) {
        console.warn('Error fetching version:', error);
        // Fallback to current hardcoded version if fetch fails
    }
}

// CONSOLIDATED DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Feather icons
    feather.replace();
    
    // Update active nav states
    updateActiveNavStates();
    
    // Load version from VERSION file
    loadVersion();
    
    // Back to Top Button functionality
    const backToTopButton = document.getElementById('backToTop');
    if (backToTopButton) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });
        
        // Smooth scroll to top when clicked
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    const carousel = document.getElementById('projectsCarousel');
    if (carousel) {
        // Apply centering after a brief delay
        requestAnimationFrame(() => {
            setTimeout(() => {
                carousel.classList.add('loaded');
            }, 150);
        });
    }
});

// Update active states when hash changes (for same-page navigation)
window.addEventListener('hashchange', updateActiveNavStates);

// Update active states when page loads (for direct links)
window.addEventListener('load', updateActiveNavStates);
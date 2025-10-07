/* ===== INITIALIZATION ===== */
// Initialize AOS animations
AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true
});

// Initialize Vanta.js background
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

/* ===== CAROUSEL FUNCTIONALITY ===== */
const carousel = document.getElementById('projectsCarousel');
const scrollLeftBtn = document.getElementById('scrollLeft');
const scrollRightBtn = document.getElementById('scrollRight');
const scrollLeftDesktop = document.getElementById('scrollLeftDesktop');
const scrollRightDesktop = document.getElementById('scrollRightDesktop');

if (carousel) {
    function getScrollDistance() {
        if (window.innerWidth <= 480) {
            return 260 + 16;
        } else if (window.innerWidth <= 768) {
            return 280 + 16;
        } else {
            return 360;
        }
    }
    
    function isAtStart() {
        if (window.innerWidth <= 768) {
            const centerPadding = window.innerWidth <= 480 ? 
                (window.innerWidth - 260) / 2 : 
                (window.innerWidth - 280) / 2;
            return carousel.scrollLeft <= centerPadding + 10;
        } else {
            return carousel.scrollLeft <= 0;
        }
    }
    
    function isAtEnd() {
        if (window.innerWidth <= 768) {
            const centerPadding = window.innerWidth <= 480 ? 
                (window.innerWidth - 260) / 2 : 
                (window.innerWidth - 280) / 2;
            const maxScroll = carousel.scrollWidth - carousel.clientWidth;
            return carousel.scrollLeft >= maxScroll - centerPadding - 10;
        } else {
            const maxScroll = carousel.scrollWidth - carousel.clientWidth;
            return carousel.scrollLeft >= maxScroll - 5;
        }
    }
    
    function scrollLeft() {
        const scrollDistance = getScrollDistance();
        
        if (isAtStart()) {
            if (window.innerWidth <= 768) {
                const centerPadding = window.innerWidth <= 480 ? 
                    (window.innerWidth - 260) / 2 : 
                    (window.innerWidth - 280) / 2;
                const maxScroll = carousel.scrollWidth - carousel.clientWidth;
                carousel.scrollTo({ 
                    left: maxScroll - centerPadding, 
                    behavior: 'smooth' 
                });
            } else {
                carousel.scrollTo({ left: carousel.scrollWidth, behavior: 'smooth' });
            }
        } else {
            carousel.scrollBy({ left: -scrollDistance, behavior: 'smooth' });
        }
    }
    
    function scrollRight() {
        const scrollDistance = getScrollDistance();
        
        if (isAtEnd()) {
            if (window.innerWidth <= 768) {
                const centerPadding = window.innerWidth <= 480 ? 
                    (window.innerWidth - 260) / 2 : 
                    (window.innerWidth - 280) / 2;
                carousel.scrollTo({ 
                    left: centerPadding, 
                    behavior: 'smooth' 
                });
            } else {
                carousel.scrollTo({ left: 0, behavior: 'smooth' });
            }
        } else {
            carousel.scrollBy({ left: scrollDistance, behavior: 'smooth' });
        }
    }
    
    function updateArrowVisibility() {
        const atStart = isAtStart();
        const atEnd = isAtEnd();
        
        if (scrollLeftBtn && scrollRightBtn) {
            scrollLeftBtn.style.opacity = atStart ? '0.5' : '1';
            scrollRightBtn.style.opacity = atEnd ? '0.5' : '1';
        }
        
        if (scrollLeftDesktop && scrollRightDesktop) {
            scrollLeftDesktop.style.opacity = atStart ? '0.5' : '1';
            scrollRightDesktop.style.opacity = atEnd ? '0.5' : '1';
        }
    }
    
    // Attach event listeners
    if (scrollLeftBtn && scrollRightBtn) {
        scrollLeftBtn.onclick = scrollLeft;
        scrollRightBtn.onclick = scrollRight;
    }
    
    if (scrollLeftDesktop && scrollRightDesktop) {
        scrollLeftDesktop.onclick = scrollLeft;
        scrollRightDesktop.onclick = scrollRight;
    }
    
    // Event listeners
    carousel.addEventListener('scroll', updateArrowVisibility);
    window.addEventListener('resize', updateArrowVisibility);
    updateArrowVisibility();
}

/* ===== NAVIGATION FUNCTIONALITY ===== */
function updateActiveNavStates() {
    const currentPage = window.location.pathname;
    const currentHash = window.location.hash;
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active-page', 'transition-none', 'font-bold');
    });
    
    if (currentPage.includes('projects.html')) {
        document.querySelectorAll('a[href="projects.html"]').forEach(link => {
            link.classList.add('active-page', 'transition-none', 'font-bold');
        });
    } else {
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
            document.querySelectorAll('a[href="index.html"]').forEach(link => {
                link.classList.add('active-page', 'transition-none', 'font-bold');
            });
        }
    }
}

/* ===== MOBILE MENU FUNCTIONALITY ===== */
// Close mobile menu when clicking outside
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

/* ===== CONTACT FORM ===== */
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

/* ===== UTILITY FUNCTIONS ===== */
// Section title animations
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

// Version loading
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
    }
}

/* ===== EVENT LISTENERS ===== */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Feather icons
    feather.replace();
    
    // Update active nav states
    updateActiveNavStates();
    
    // Load version
    loadVersion();
    
    // Back to Top Button
    const backToTopButton = document.getElementById('backToTop');
    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });
        
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Carousel loading animation fix
    if (carousel) {
        requestAnimationFrame(() => {
            setTimeout(() => {
                carousel.classList.add('loaded');
            }, 150);
        });
    }
});

// Navigation state updates
window.addEventListener('hashchange', updateActiveNavStates);
window.addEventListener('load', updateActiveNavStates);
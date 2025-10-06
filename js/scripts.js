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

if (carousel && scrollLeftBtn && scrollRightBtn) {
    scrollLeftBtn.onclick = () => {
        if (carousel.scrollLeft <= 0) {
            carousel.scrollTo({ left: carousel.scrollWidth, behavior: 'smooth' });
        } else {
            carousel.scrollBy({ left: -360, behavior: 'smooth' });
        }
    };

    scrollRightBtn.onclick = () => {
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        if (carousel.scrollLeft >= maxScroll - 5) {
            carousel.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            carousel.scrollBy({ left: 360, behavior: 'smooth' });
        }
    };
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

// Function to update active nav states based on current section
function updateActiveNavStates() {
    const currentPage = window.location.pathname;
    const currentHash = window.location.hash;
    
    // Remove existing active states
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active-page');
    });
    
    // Apply active state based on current section
    if (currentPage.includes('projects.html')) {
        // Projects page - activate Projects nav
        document.querySelectorAll('a[href="projects.html"]').forEach(link => {
            link.classList.add('active-page');
        });
    } else {
        // Index page - check hash for sections
        if (currentHash === '#about') {
            document.querySelectorAll('a[href="index.html#about"], a[href="#about"]').forEach(link => {
                link.classList.add('active-page');
            });
        } else if (currentHash === '#skills') {
            document.querySelectorAll('a[href="index.html#skills"], a[href="#skills"]').forEach(link => {
                link.classList.add('active-page');
            });
        } else if (currentHash === '#experience') {
            document.querySelectorAll('a[href="index.html#experience"], a[href="#experience"]').forEach(link => {
                link.classList.add('active-page');
            });
        } else {
            // Default to Home if no specific section
            document.querySelectorAll('a[href="index.html"]').forEach(link => {
                link.classList.add('active-page');
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
});

// Update active states when hash changes (for same-page navigation)
window.addEventListener('hashchange', updateActiveNavStates);

// Update active states when page loads (for direct links)
window.addEventListener('load', updateActiveNavStates);
/* ===== INITIALIZATION ===== */
// Initialize AOS animations
AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true
});

// Initialize Vanta.js background
if (document.getElementById('vanta-bg')) {
    VANTA.GLOBE({
        el: '#vanta-bg',
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

/* ===== ENHANCED CAROUSEL WITH FIXED INFINITE LOOP ===== */
document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.getElementById('projectsCarousel');
    const leftBtn = document.getElementById('scrollLeft');
    const rightBtn = document.getElementById('scrollRight');
    
    if (!carousel || !leftBtn || !rightBtn) return;
    
    // Get all project cards
    const cards = carousel.querySelectorAll('.project-card');
    const totalCards = cards.length;
    
    if (totalCards === 0) return;
    
    // Calculate scroll distance based on card width + gap
    function getScrollDistance() {
        const screenWidth = window.innerWidth;
        if (screenWidth <= 480) return 280; // 260px card + 20px gap
        if (screenWidth <= 768) return 300; // 280px card + 20px gap
        return 380; // 340px card + 40px gap
    }
    
    // Get card width including gap
    function getCardWidth() {
        const screenWidth = window.innerWidth;
        if (screenWidth <= 480) return 280;
        if (screenWidth <= 768) return 300;
        return 380;
    }
    
    // Check if we're at the start (improved logic)
    function isAtStart() {
        return carousel.scrollLeft <= 5; // Reduced tolerance
    }
    
    // Check if we're at the end (improved logic)
    function isAtEnd() {
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        const currentScroll = carousel.scrollLeft;
        const threshold = 5; // Small threshold for detection
        
        console.log('End check:', {
            currentScroll,
            maxScroll,
            difference: maxScroll - currentScroll,
            isAtEnd: currentScroll >= maxScroll - threshold
        });
        
        return currentScroll >= maxScroll - threshold;
    }
    
    // Enhanced scroll function with proper infinite loop
    function scrollToCard(direction) {
        const cardWidth = getCardWidth();
        const currentScroll = carousel.scrollLeft;
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        
        console.log('Scroll attempt:', {
            direction,
            currentScroll,
            maxScroll,
            cardWidth,
            isAtStart: isAtStart(),
            isAtEnd: isAtEnd()
        });
        
        if (direction === 'left') {
            if (isAtStart()) {
                // At start, jump to end for infinite loop
                console.log('Jumping to end from start');
                carousel.scrollTo({
                    left: maxScroll,
                    behavior: 'smooth'
                });
            } else {
                // Normal scroll left
                const targetScroll = Math.max(0, currentScroll - cardWidth);
                console.log('Scrolling left to:', targetScroll);
                carousel.scrollTo({
                    left: targetScroll,
                    behavior: 'smooth'
                });
            }
        } else { // direction === 'right'
            if (isAtEnd()) {
                // At end, jump to start for infinite loop
                console.log('Jumping to start from end');
                carousel.scrollTo({
                    left: 0,
                    behavior: 'smooth'
                });
            } else {
                // Normal scroll right
                const targetScroll = Math.min(maxScroll, currentScroll + cardWidth);
                console.log('Scrolling right to:', targetScroll);
                carousel.scrollTo({
                    left: targetScroll,
                    behavior: 'smooth'
                });
            }
        }
    }
    
    // Event listeners for navigation buttons
    leftBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Left button clicked');
        scrollToCard('left');
    });
    
    rightBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Right button clicked');
        scrollToCard('right');
    });
    
    // Keyboard navigation with infinite loop
    carousel.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            scrollToCard('left');
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            scrollToCard('right');
        }
    });
    
    // Enhanced touch/swipe support
    let isDown = false;
    let startX;
    let scrollLeftStart;
    let hasMoved = false;
    
    carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        hasMoved = false;
        startX = e.pageX - carousel.offsetLeft;
        scrollLeftStart = carousel.scrollLeft;
        carousel.style.cursor = 'grabbing';
        carousel.style.userSelect = 'none';
    });
    
    carousel.addEventListener('mouseleave', () => {
        if (isDown && hasMoved) {
            snapToNearestCard();
        }
        isDown = false;
        carousel.style.cursor = 'grab';
        carousel.style.userSelect = 'auto';
    });
    
    carousel.addEventListener('mouseup', () => {
        if (isDown && hasMoved) {
            snapToNearestCard();
        }
        isDown = false;
        carousel.style.cursor = 'grab';
        carousel.style.userSelect = 'auto';
    });
    
    carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        hasMoved = true;
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeftStart - walk;
    });
    
    // Touch events for mobile
    carousel.addEventListener('touchstart', (e) => {
        isDown = true;
        hasMoved = false;
        startX = e.touches[0].pageX - carousel.offsetLeft;
        scrollLeftStart = carousel.scrollLeft;
    });
    
    carousel.addEventListener('touchend', () => {
        if (isDown && hasMoved) {
            snapToNearestCard();
        }
        isDown = false;
    });
    
    carousel.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        hasMoved = true;
        const x = e.touches[0].pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeftStart - walk;
    });
    
    // Snap to nearest card after dragging
    function snapToNearestCard() {
        const cardWidth = getCardWidth();
        const currentScroll = carousel.scrollLeft;
        const nearestCardIndex = Math.round(currentScroll / cardWidth);
        const targetScroll = Math.min(
            carousel.scrollWidth - carousel.clientWidth,
            nearestCardIndex * cardWidth
        );
        
        carousel.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });
    }
    
    // Update arrow states (visual feedback)
    function updateArrowStates() {
        // For infinite loop, arrows are always enabled
        leftBtn.style.opacity = '1';
        rightBtn.style.opacity = '1';
        
        // Optional: slight dimming at edges for visual feedback
        if (isAtStart()) {
            leftBtn.style.opacity = '0.7';
        }
        
        if (isAtEnd()) {
            rightBtn.style.opacity = '0.7';
        }
    }
    
    // Update arrow states on scroll
    carousel.addEventListener('scroll', updateArrowStates);
    
    // Initialize
    carousel.style.cursor = 'grab';
    updateArrowStates();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        setTimeout(() => {
            snapToNearestCard();
            updateArrowStates();
        }, 100);
    });
    
    // Debug: Log scroll events
    carousel.addEventListener('scroll', () => {
        console.log('Scroll position:', carousel.scrollLeft, '/', carousel.scrollWidth - carousel.clientWidth);
    });
});

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
                document.getElementById('formStatus').textContent = 'Failed to send. Please try again.';
                document.getElementById('formStatus').classList.remove('hidden');
                document.getElementById('formStatus').classList.add('text-red-600');
            }
        } catch {
            document.getElementById('formStatus').textContent = 'Failed to send. Please try again.';
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
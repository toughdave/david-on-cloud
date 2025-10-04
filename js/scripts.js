// Initialize animations
AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true
});

// Initialize Vanta.js background
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

// Initialize Feather Icons
feather.replace();

// Contact Form Submission (using Formspree as a simple solution)
document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
        name: form.name.value,
        email: form.email.value,
        subject: form.subject.value,
        message: form.message.value
    };
    // Replace with your Formspree endpoint or similar service
    const endpoint = 'https://formspree.io/f/mjkedzyv'; // <-- Use the same as your form action!
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

// Projects Carousel Scroll with looping animation
const carousel = document.getElementById('projectsCarousel');
const scrollLeftBtn = document.getElementById('scrollLeft');
const scrollRightBtn = document.getElementById('scrollRight');

scrollLeftBtn.onclick = () => {
    // If already at the start, animate to the end
    if (carousel.scrollLeft <= 0) {
        carousel.scrollTo({ left: carousel.scrollWidth, behavior: 'smooth' });
    } else {
        carousel.scrollBy({ left: -360, behavior: 'smooth' });
    }
};

scrollRightBtn.onclick = () => {
    // If already at (or near) the end, animate to the start
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    if (carousel.scrollLeft >= maxScroll - 5) {
        carousel.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
        carousel.scrollBy({ left: 360, behavior: 'smooth' });
    }
};

// Mobile menu toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuButton.addEventListener('click', function() {
    mobileMenu.classList.toggle('active');
    if (mobileMenu.classList.contains('active')) {
        mobileMenuButton.querySelector('i').setAttribute('data-feather', 'x');
    } else {
        mobileMenuButton.querySelector('i').setAttribute('data-feather', 'menu');
    }
    feather.replace();
});

// Close mobile menu when clicking on a link
const mobileMenuLinks = mobileMenu.querySelectorAll('a');
mobileMenuLinks.forEach(link => {
    link.addEventListener('click', function() {
        mobileMenu.classList.remove('active');
        mobileMenuButton.querySelector('i').setAttribute('data-feather', 'menu');
        feather.replace();
    });
});

// Animate section title underline on section hover
document.querySelectorAll('.section-title-container').forEach(container => {
    const underline = container.querySelector('.section-title-underline');
    container.addEventListener('mouseenter', () => {
        underline.classList.add('active');
    });
    container.addEventListener('mouseleave', () => {
        underline.classList.remove('active');
    });
});
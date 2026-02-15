/* ===== CONFIGURATION ===== */
window.siteConfig = {
    settings: {
        shootingStarInterval: 25000,
        defaultFunMode: true,
        vanta: {
            dark: { color: "#7c3aed", color2: "#6366f1", backgroundColor: "#0f172a" },
            light: { color: "#667eea", color2: "#f8fafc", backgroundColor: "#f8fafc" }
        }
    }
};

// Load external config
fetch('js/config.json?v=' + Date.now())
    .then(response => response.json())
    .then(data => {
        if (data && data.settings) {
            window.siteConfig.settings = { ...window.siteConfig.settings, ...data.settings };
            if (typeof document !== 'undefined') {
                document.dispatchEvent(new Event('siteconfig:loaded'));
            }
            // Re-initialize effects if config loaded after page load
            if (document.readyState === 'complete') {
                const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                if (typeof initVanta === 'function') initVanta();
            }
        }
    })
    .catch(err => console.log('Using default config'));

// Load and render projects dynamically
const loadProjects = () => {
    fetch('js/projects.json?v=' + Date.now())
        .then(response => response.json())
        .then(data => {
            if (!data || !data.projects) return;
            
            const projectsList = document.getElementById('projectsList');
            const projectsCarousel = document.getElementById('projectsCarousel');
            const allProjects = Array.isArray(data.projects) ? data.projects : [];
            const getProjectSummary = (project) => project.summary || project.description || '';
            const isMobileCarousel = window.matchMedia('(max-width: 768px)').matches;
            const getCarouselSummary = (project) => {
                if (isMobileCarousel && project.mobileSummary) return project.mobileSummary;
                return getProjectSummary(project);
            };
            const getProjectDetails = (project) => Array.isArray(project.details) ? project.details : [];
            const getProjectImpact = (project) => Array.isArray(project.impact) ? project.impact : [];
            const encodeProjectPayload = (project) => {
                const summary = getProjectSummary(project);
                const payload = {
                    id: project.id || '',
                    title: project.title,
                    summary,
                    details: getProjectDetails(project),
                    impact: getProjectImpact(project),
                    tags: project.tags || [],
                    image: project.image,
                    category: project.category || 'other',
                    posted: project.posted,
                    modified: project.modified,
                    link: project.link || '',
                    linkText: project.linkText || '',
                    pdf: project.pdf || '',
                    images: project.images || []
                };
                return encodeURIComponent(JSON.stringify(payload));
            };

            // 1. Render Projects Page (List View)
            if (projectsList) {
                projectsList.innerHTML = '';
                const sortedProjects = [...allProjects].sort((a, b) => {
                    return new Date(b.posted).getTime() - new Date(a.posted).getTime();
                });

                sortedProjects.forEach((project, index) => {
                    const uniqueId = `body-dyn-${index}`;
                    const summary = getProjectSummary(project);
                    const projectPayload = encodeProjectPayload(project);
                    const tagsHtml = (project.tags || []).map(tag => 
                        `<span class="px-2 py-1 bg-gray-100 rounded-full text-xs">${tag}</span>`
                    ).join('');

                    const stickerText = project.ribbonText || 'Published';
                    const publishedSticker = (project.published && project.showRibbon !== false) ? `<span class="published-sticker">${stickerText}</span>` : '';
                    const cardHtml = `
                        <div data-aos="fade-up" class="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 w-full flex flex-col md:flex-row project-card" data-category="${project.category || 'other'}" data-project="${projectPayload}" style="position:relative;">
                            ${publishedSticker}
                            <div class="w-full md:w-1/3 flex-shrink-0">
                                <img src="${project.image}" alt="${project.title}" class="w-full h-full object-cover" loading="lazy" decoding="async">
                            </div>
                            <div class="p-8 flex flex-col flex-1 justify-start">
                                <div class="project-times-row project-times-row--top">
                                    <time class="project-time project-time-posted" data-posted="${project.posted}" datetime="${project.posted}"></time>
                                    ${project.modified ? `<time class="project-time project-time-updated" data-modified="${project.modified}" datetime="${project.modified}"></time>` : ''}
                                </div>
                                <h3 class="text-xl font-semibold mb-2">${project.title}</h3>
                                <p class="text-gray-600 card-body" id="${uniqueId}">
                                    ${summary}
                                </p>
                                <button type="button" class="more-link" data-target="${uniqueId}" aria-controls="${uniqueId}" aria-expanded="false" data-collapsed-label="Read more..." data-expanded-label="Show less">
                                    <span class="more-link-text">Read more...</span>
                                    <span class="more-link-icon" aria-hidden="true"></span>
                                </button>
                                <div class="flex flex-wrap gap-2 mb-4 mt-3">
                                    ${tagsHtml}
                                </div>
                                <div class="project-card-footer mt-auto">
                                    <div class="flex justify-end items-center">
                                        <a href="#projects" class="text-indigo-600 font-medium hover:text-indigo-800 flex items-center view-link">
                                            View Project <i data-feather="arrow-right" class="ml-2 w-4 h-4"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    projectsList.insertAdjacentHTML('beforeend', cardHtml);
                });
            }

            // 2. Render Home Page (Carousel View - Featured Only)
            if (projectsCarousel) {
                projectsCarousel.innerHTML = '';
                const featuredProjects = allProjects.filter(p => p.featured);
                
                // Weighted Random Shuffle: Random but slightly favoring recent
                if (featuredProjects.length > 0) {
                    const times = featuredProjects.map(p => new Date(p.modified || p.posted).getTime());
                    const maxTime = Math.max(...times);
                    const minTime = Math.min(...times);
                    const timeRange = maxTime - minTime || 1;

                    featuredProjects.forEach(p => {
                        const timeVal = new Date(p.modified || p.posted).getTime();
                        const normTime = (timeVal - minTime) / timeRange; // 0.0 (oldest) to 1.0 (newest)
                        // Score = Random (0-1) + Recency Bias (0-0.5)
                        // Higher score = appears earlier
                        p._shuffleScore = Math.random() + (normTime * 0.5);
                    });
                    featuredProjects.sort((a, b) => b._shuffleScore - a._shuffleScore);
                }

                featuredProjects.forEach((project) => {
                    const summary = getCarouselSummary(project);
                    const projectPayload = encodeProjectPayload(project);
                    const tagsHtml = (project.tags || []).map(tag => 
                        `<span class="project-tag">${tag}</span>`
                    ).join('');

                    const stickerTextC = project.ribbonText || 'Published';
                    const publishedStickerC = (project.published && project.showRibbon !== false) ? `<span class="published-sticker">${stickerTextC}</span>` : '';
                    const cardHtml = `
                        <div class="project-card" data-aos="fade-up" data-category="${project.category || 'other'}" data-project="${projectPayload}">
                            ${publishedStickerC}
                            <img src="${project.image}" alt="${project.title}" loading="lazy" decoding="async">
                            <div class="project-card-content">
                                <div class="project-times-row project-times-row--top">
                                    <time class="project-time project-time-posted" data-posted="${project.posted}" datetime="${project.posted}"></time>
                                    ${project.modified ? `<time class="project-time project-time-updated" data-modified="${project.modified}" datetime="${project.modified}"></time>` : ''}
                                </div>
                                <h3>${project.title}</h3>
                                <p>${summary}</p>
                                <div class="project-tags">
                                    ${tagsHtml}
                                </div>
                                <div class="flex justify-end items-center mt-auto pt-4">
                                    <a href="projects.html" class="text-indigo-600 font-medium hover:text-indigo-800 flex items-center view-link">
                                        View Project <i data-feather="arrow-right" class="ml-2 w-4 h-4"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    `;
                    projectsCarousel.insertAdjacentHTML('beforeend', cardHtml);
                });
                
                // Trigger carousel readiness (if logic depends on content presence)
                if (window.initCarousel) window.initCarousel();
            }

            // Re-initialize components
            if (typeof feather !== 'undefined') feather.replace();
            if (typeof window.setupProjectCardReveal === 'function') window.setupProjectCardReveal();
            if (typeof window.setupProjectFilters === 'function') window.setupProjectFilters();
            if (typeof window.updateViewLinks === 'function') window.updateViewLinks();
            if (typeof window.refreshProjectOverflow === 'function') window.refreshProjectOverflow();
            if (typeof updateTimes === 'function') updateTimes();
            
            // Refresh AOS
            if (typeof AOS !== 'undefined') {
                setTimeout(() => AOS.refresh(), 100);
            }

            // Equalize carousel card heights based on tallest card
            if (projectsCarousel) {
                const equalizeCarouselCards = () => {
                    const cards = projectsCarousel.querySelectorAll('.project-card');
                    if (!cards.length) return;
                    cards.forEach(c => { c.style.height = 'auto'; c.style.minHeight = 'auto'; });
                    let maxH = 0;
                    cards.forEach(c => { const h = c.scrollHeight; if (h > maxH) maxH = h; });
                    if (maxH > 0) cards.forEach(c => { c.style.height = maxH + 'px'; c.style.minHeight = maxH + 'px'; });
                };
                // Wait for images to load then equalize
                const imgs = projectsCarousel.querySelectorAll('img');
                let loaded = 0;
                const onLoad = () => { loaded++; if (loaded >= imgs.length) equalizeCarouselCards(); };
                imgs.forEach(img => {
                    if (img.complete) { loaded++; } else { img.addEventListener('load', onLoad); img.addEventListener('error', onLoad); }
                });
                if (loaded >= imgs.length) equalizeCarouselCards();
                // Also equalize after a fallback delay
                setTimeout(equalizeCarouselCards, 1500);
                window._equalizeCarouselCards = equalizeCarouselCards;
            }

        })
        .catch(err => console.error('Error loading projects:', err));
};

/* ===== DARK MODE THEME SWITCHER ===== */
// Initialize theme before page renders to prevent flash
(function() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
})();

/* ===== INITIALIZATION ===== */
// Initialize AOS animations
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (typeof AOS !== 'undefined') {
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        disable: prefersReducedMotion
    });
} else {
    console.warn('[AOS] Skipped: AOS library not available.');
}

    // Initialize Vanta.js background
    let vantaEffect = null;
    const initVanta = () => {
        if (prefersReducedMotion) {
            console.log('[Vanta] Skipped: prefers-reduced-motion is enabled');
            return;
        }
        if (!document.getElementById('vanta-bg')) {
            console.warn('[Vanta] Skipped: #vanta-bg element not found');
            return;
        }
        if (typeof VANTA === 'undefined' || typeof VANTA.GLOBE !== 'function') {
            console.warn('[Vanta] Skipped: VANTA.GLOBE not available. CDN may have failed to load.');
            return;
        }
        if (typeof THREE === 'undefined') {
            console.warn('[Vanta] Skipped: THREE.js not available. CDN may have failed to load.');
            return;
        }
        try {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            // Destroy existing instance if parameters need to change
            if (vantaEffect) {
                vantaEffect.destroy();
                vantaEffect = null;
            }
            vantaEffect = VANTA.GLOBE({
                el: '#vanta-bg',
                THREE: THREE,
                mouseControls: true,
                touchControls: true,
                gyroControls: false,
                minHeight: 200.00,
                minWidth: 200.00,
                scale: 1.00,
                color: isDark ? window.siteConfig.settings.vanta.dark.color : window.siteConfig.settings.vanta.light.color,
                color2: isDark ? window.siteConfig.settings.vanta.dark.color2 : window.siteConfig.settings.vanta.light.color2,
                backgroundColor: isDark ? window.siteConfig.settings.vanta.dark.backgroundColor : window.siteConfig.settings.vanta.light.backgroundColor,
                backgroundAlpha: isDark ? 0 : 1,
                size: 0.8,
                scaleMobile: 1.50
            });
            console.log('[Vanta] Globe initialized successfully');
            // Fade in vanta after a short delay so page background is visible first
            const vantaEl = document.getElementById('vanta-bg');
            if (vantaEl) {
                setTimeout(() => vantaEl.classList.add('vanta-ready'), 400);
            }
        } catch (err) {
            console.error('[Vanta] Initialization failed:', err);
        }
    };
    
    // Single init path: wait for page load, then delay so background renders first
    window.addEventListener('load', () => {
        setTimeout(() => { if (!vantaEffect) initVanta(); }, 600);
    });

    /* ===== VANTA VERTICAL PARALLAX ===== */
    let vantaParallaxTicking = false;
    const vantaBgEl = document.getElementById('vanta-bg');
    const isMobileScrollReduce = window.matchMedia('(max-width: 768px)').matches;
    if (vantaBgEl && !isMobileScrollReduce) {
        window.addEventListener('scroll', () => {
            if (!vantaParallaxTicking) {
                vantaParallaxTicking = true;
                requestAnimationFrame(() => {
                    const scrollY = window.scrollY || window.pageYOffset;
                    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                    const scrollFraction = maxScroll > 0 ? scrollY / maxScroll : 0;
                    const maxParallax = window.innerHeight * 0.12;
                    vantaBgEl.style.transform = `translateY(${scrollFraction * maxParallax}px)`;
                    vantaParallaxTicking = false;
                });
            }
        }, { passive: true });
    }

    /* ===== ENHANCED CAROUSEL WITH INFINITE LOOP ===== */
    document.addEventListener('DOMContentLoaded', function() {
    const isMobileScrollReduce = window.matchMedia('(max-width: 768px)').matches;
    if (isMobileScrollReduce) {
        let scrollTimer = null;
        window.addEventListener('scroll', () => {
            document.body.classList.add('is-scrolling');
            if (scrollTimer) clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                document.body.classList.remove('is-scrolling');
            }, 200);
        }, { passive: true });
    }
        const carousel = document.getElementById('projectsCarousel');
        const leftBtn = document.getElementById('scrollLeft');
        const rightBtn = document.getElementById('scrollRight');
        
        if (!carousel || !leftBtn || !rightBtn) return;

        // DYNAMIC getter for cards
        const getCards = () => Array.from(carousel.querySelectorAll('.project-card'));
        
        // Visible = not dimmed AND not hidden by filters
        const getVisibleCards = () => getCards().filter(c =>
            !c.classList.contains('fun-filter-dim') && !c.classList.contains('fun-filter-hidden')
        );

        // Find the card closest to the carousel centre (among visible cards only)
        const getActiveVisibleIndex = () => {
            const visible = getVisibleCards();
            if (visible.length === 0) return -1;
            
            // Priority 1: If manual navigation just happened, trust the is-active class
            const activeIdx = visible.findIndex(c => c.classList.contains('is-active'));
            if (activeIdx !== -1 && manualNav) return activeIdx;

            // Priority 2: If content fits (no scroll), trust is-active or default to 0
            if (carousel.scrollWidth <= carousel.clientWidth + 5) {
                return activeIdx !== -1 ? activeIdx : 0;
            }
            
            // Priority 3: Geometric center (for scroll/swipe)
            const maxScroll = carousel.scrollWidth - carousel.clientWidth;
            if (carousel.scrollLeft <= 10) return 0;
            if (carousel.scrollLeft >= maxScroll - 10) return visible.length - 1;

            const cx = carousel.getBoundingClientRect().left + carousel.clientWidth / 2;
            let best = 0;
            let bestDist = Infinity;
            visible.forEach((card, i) => {
                const r = card.getBoundingClientRect();
                const d = Math.abs(r.left + r.width / 2 - cx);
                if (d < bestDist) { bestDist = d; best = i; }
            });
            return best;
        };

        const setActiveCard = (card) => {
            getCards().forEach(c => c.classList.remove('is-active'));
            if (card) card.classList.add('is-active');
        };

        const scrollToCard = (card, behavior = 'smooth') => {
            if (!card) return;
            const cardW = card.getBoundingClientRect().width;
            const target = card.offsetLeft - (carousel.clientWidth - cardW) / 2;
            const max = carousel.scrollWidth - carousel.clientWidth;
            if (carousel.scrollWidth <= carousel.clientWidth) return;
            carousel.scrollTo({ left: Math.max(0, Math.min(target, max)), behavior });
        };

        // Navigation state
        let manualNav = false;
        let manualNavTimer;

        // Navigate
        function navigate(direction) {
            const visible = getVisibleCards();
            if (visible.length === 0) return;
            
            let curIdx = visible.findIndex(c => c.classList.contains('is-active'));
            if (curIdx === -1) curIdx = getActiveVisibleIndex(); 
            
            let next;
            if (direction === 'right') {
                next = curIdx + 1 >= visible.length ? 0 : curIdx + 1;
            } else {
                next = curIdx - 1 < 0 ? visible.length - 1 : curIdx - 1;
            }

            const targetCard = visible[next];
            manualNav = true;
            clearTimeout(manualNavTimer);
            
            scrollToCard(targetCard, 'smooth');
            setActiveCard(targetCard);
            
            manualNavTimer = setTimeout(() => { manualNav = false; }, 600);
        }
        
        // Listeners (attached once)
        leftBtn.addEventListener('click', (e) => { e.preventDefault(); navigate('left'); });
        rightBtn.addEventListener('click', (e) => { e.preventDefault(); navigate('right'); });
        
        carousel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') { e.preventDefault(); navigate('left'); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); navigate('right'); }
        });
        
        // Drag support
        let isDown = false, startX, scrollLeftStart, hasMoved = false;
        carousel.addEventListener('mousedown', (e) => {
            isDown = true; hasMoved = false; manualNav = false;
            startX = e.pageX - carousel.offsetLeft;
            scrollLeftStart = carousel.scrollLeft;
            carousel.style.cursor = 'grabbing';
            carousel.style.userSelect = 'none';
        });
        const endDrag = () => {
            if (isDown && hasMoved) snapToNearest();
            isDown = false;
            carousel.style.cursor = 'grab';
            carousel.style.userSelect = 'auto';
        };
        carousel.addEventListener('mouseleave', endDrag);
        carousel.addEventListener('mouseup', endDrag);
        carousel.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault(); hasMoved = true;
            carousel.scrollLeft = scrollLeftStart - (e.pageX - carousel.offsetLeft - startX) * 2;
        });
        carousel.addEventListener('touchstart', () => {
            manualNav = false;
            carousel.style.scrollBehavior = 'auto';
        }, { passive: true });
        carousel.addEventListener('touchend', () => {
            carousel.style.scrollBehavior = 'smooth';
        }, { passive: true });
        
        function snapToNearest() {
            const idx = getActiveVisibleIndex();
            const visible = getVisibleCards();
            if (idx >= 0 && visible[idx]) {
                scrollToCard(visible[idx]);
                setActiveCard(visible[idx]);
            }
        }
        
        leftBtn.style.opacity = '1';
        rightBtn.style.opacity = '1';
        
        let scrollTimeout;
        carousel.addEventListener('scroll', () => {
            if (manualNav) return; 
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const idx = getActiveVisibleIndex();
                const visible = getVisibleCards();
                if (idx >= 0 && visible[idx]) setActiveCard(visible[idx]);
            }, 120);
        });
        
        // Handle resize
        window.addEventListener('resize', () => { setTimeout(snapToNearest, 100); });

        // Expose init function for dynamic content
        window.initCarousel = () => {
            carousel.classList.remove('loaded');
            // Give layout a moment to settle then snap
            requestAnimationFrame(() => {
                const visible = getVisibleCards();
                if (visible.length > 0) { 
                    setActiveCard(visible[0]); 
                    // Don't scroll to 0 immediately if we want to keep position, 
                    // but for new load it's fine.
                    // If reloading, maybe resetting to 0 is good.
                    carousel.scrollLeft = 0; 
                }
                setTimeout(() => carousel.classList.add('loaded'), 150);
            });
        };
    });

    /* ===== NAVIGATION FUNCTIONALITY ===== */
const setActiveNavLink = (targetId) => {
    const cleanedId = (targetId || '').replace('#', '').trim();
    const normalized = cleanedId === 'intro' || cleanedId === 'home' || cleanedId === ''
        ? 'home'
        : cleanedId;

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active-page', 'transition-none', 'font-bold');
    });
    // Also clear from contact button (not a .nav-link)
    const contactBtn = document.getElementById('nav-contact-btn');
    if (contactBtn) {
        contactBtn.classList.remove('active-page', 'transition-none', 'font-bold');
    }

    if (normalized === 'projects') {
        const onProjectsPage = window.location.pathname.includes('projects.html');
        if (onProjectsPage) {
            // On projects page: highlight all projects links (desktop + mobile)
            document.querySelectorAll('a[href="projects.html"]').forEach(link => {
                if (link.classList.contains('btn-explore-universe')) return;
                link.classList.add('active-page', 'transition-none', 'font-bold');
            });
        }
        // On index page: only highlight the desktop nav link (not mobile menu)
        const projectsLink = document.getElementById('nav-projects-link');
        if (projectsLink) {
            projectsLink.classList.add('active-page', 'transition-none', 'font-bold');
        }
        return;
    }

    if (normalized === 'home') {
        document.querySelectorAll('a[href="index.html"]').forEach(link => {
            link.classList.add('active-page', 'transition-none', 'font-bold');
        });
        return;
    }

    document.querySelectorAll(`a[href="index.html#${normalized}"], a[href="#${normalized}"]`).forEach(link => {
        // Contact button needs smooth transitions (FLIP + ::before fill) — skip transition-none
        if (link.id === 'nav-contact-btn') {
            link.classList.add('active-page', 'font-bold');
        } else {
            link.classList.add('active-page', 'transition-none', 'font-bold');
        }
    });
};

function updateActiveNavStates() {
    const currentPage = window.location.pathname;
    const currentHash = window.location.hash;

    if (currentPage.includes('projects.html')) {
        setActiveNavLink('projects');
        return;
    }

    if (currentHash) {
        setActiveNavLink(currentHash);
        return;
    }

    setActiveNavLink('home');
}

const setupScrollSpy = () => {
    if (window.location.pathname.includes('projects.html')) return;
    const sectionIds = ['intro', 'about', 'skills', 'experience', 'projects', 'contact'];
    const sections = sectionIds
        .map((id) => document.getElementById(id))
        .filter(Boolean);
    if (!sections.length) return;

    const visibilityMap = new Map();
    sections.forEach((section) => visibilityMap.set(section.id, 0));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            visibilityMap.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        });

        const sorted = Array.from(visibilityMap.entries()).sort((a, b) => b[1] - a[1]);
        if (!sorted.length) return;
        const [activeId, ratio] = sorted[0];
        
        if (ratio > 0) {
            setActiveNavLink(activeId);
            
            // Handle Contact Button Active State
            const contactBtn = document.getElementById('nav-contact-btn');
            if (contactBtn) {
                if (activeId === 'contact') {
                    contactBtn.classList.add('active-contact');
                } else {
                    contactBtn.classList.remove('active-contact');
                }
            }

            // Handle Projects Nav Morphing
            const projectsContainer = document.querySelector('.nav-item-projects');
            const projectsLink = document.getElementById('nav-projects-link');
            // Helper to get or create the text span if it was wiped
            const getProjectTextSpan = () => {
                let span = projectsLink.querySelector('.nav-link-text');
                if (!span) {
                    // Restore span if missing
                    const text = projectsLink.textContent;
                    projectsLink.textContent = '';
                    span = document.createElement('span');
                    span.className = 'nav-link-text';
                    span.textContent = text;
                    projectsLink.appendChild(span);
                }
                return span;
            };
            
            if (projectsContainer && projectsLink) {
                const projectsText = getProjectTextSpan();
                
                // FLIP animation helper: smoothly slide ALL sibling nav items
                const flipNavSiblings = (callback) => {
                    const navItems = Array.from(document.querySelectorAll('.nav-links > *'));
                    // FIRST: capture current positions
                    const firstRects = navItems.map(el => el.getBoundingClientRect());
                    
                    // Execute the layout change
                    callback();
                    
                    // LAST: capture new positions & INVERT + PLAY
                    requestAnimationFrame(() => {
                        navItems.forEach((el, i) => {
                            const lastRect = el.getBoundingClientRect();
                            const deltaX = firstRects[i].left - lastRect.left;
                            if (Math.abs(deltaX) > 0.5) {
                                el.style.transition = 'none';
                                el.style.transform = `translateX(${deltaX}px)`;
                                requestAnimationFrame(() => {
                                    el.style.transition = 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)';
                                    el.style.transform = '';
                                });
                            }
                        });
                    });
                };
                
                if (activeId === 'projects') {
                    if (!projectsContainer.classList.contains('mode-featured')) {
                        // Phase 1: Hide current text
                        projectsText.classList.add('morphing');
                        
                        // Phase 2: Swap text (still hidden) and start FLIP early
                        setTimeout(() => {
                            flipNavSiblings(() => {
                                projectsContainer.classList.add('mode-featured');
                                projectsText.textContent = 'Featured Projects';
                                projectsLink.setAttribute('href', '#projects');
                            });
                            // Phase 3: Reveal text after siblings are already moving
                            setTimeout(() => {
                                projectsText.classList.remove('morphing');
                            }, 100);
                        }, 120);
                    }
                } else {
                    if (projectsContainer.classList.contains('mode-featured')) {
                        // Phase 1: Hide current text
                        projectsText.classList.add('morphing');
                        
                        setTimeout(() => {
                            flipNavSiblings(() => {
                                projectsContainer.classList.remove('mode-featured');
                                projectsText.textContent = 'Projects';
                                projectsLink.setAttribute('href', 'projects.html');
                            });
                            setTimeout(() => {
                                projectsText.classList.remove('morphing');
                            }, 100);
                        }, 120);
                    }
                }
            }
        }
    }, {
        rootMargin: '-35% 0px -45% 0px',
        threshold: [0, 0.2, 0.4, 0.6]
    });

    sections.forEach((section) => observer.observe(section));
};

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* ===== MOBILE MENU FUNCTIONALITY ===== */
// Use pure CSS via checkbox + label (Tailwind peer utility). No JS needed here.

// Auto-close mobile menu on same-page anchor navigation
(function() {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (!menuToggle || !mobileMenu) return;

    function isSamePageAnchor(link) {
        try {
            const url = new URL(link.getAttribute('href', 2) || '', window.location.href);
            if (!url.hash) return false;
            const normalize = (p) => (p || '/').replace(/\/+$/, '') || '/';
            const current = normalize(window.location.pathname);
            const target = normalize(url.pathname || '/');
            if (target === current) return true;
            if (target.endsWith('/index.html') && (current === '/' || current.endsWith('/index.html'))) return true;
            return false;
        } catch { return false; }
    }

    mobileMenu.querySelectorAll('a, button').forEach(link => {
        link.addEventListener('click', () => {
            if (isSamePageAnchor(link)) {
                setTimeout(() => { menuToggle.checked = false; }, 0);
            }
        });
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        const menuLabel = document.querySelector('label[for="menu-toggle"]');
        if (menuToggle.checked && 
            !mobileMenu.contains(e.target) && 
            (!menuLabel || !menuLabel.contains(e.target)) &&
            e.target !== menuToggle) {
            menuToggle.checked = false;
        }
    });

    // Close on scroll
    window.addEventListener('scroll', () => {
        if (menuToggle.checked) {
            menuToggle.checked = false;
        }
    }, { passive: true });
})();

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

// Footer year auto-update
function updateFooterYear() {
    const yearElement = document.getElementById('year-display');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Version loading
async function loadVersion() {
    try {
        const response = await fetch('/VERSION?v=' + Date.now());
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
    // Initialize theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');
    
    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
    }
    
    // Set initial icon state
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    updateThemeIcon(currentTheme);
    
    // Theme toggle click handler
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
            scheduleShootingStar();
            // Re-init Vanta to update colors based on new theme
            if (typeof initVanta === 'function') {
                initVanta();
            }
        });
    }

    // Fun mode toggle
    const funButtons = document.querySelectorAll('[data-fun-toggle]');
    const funElements = document.querySelectorAll('[data-fun-element]');
    const funMessageElements = document.querySelectorAll('.fun-message');
    const funLabButton = document.querySelector('[data-fun-lab-toggle]');
    const funLabPanel = document.getElementById('funLabPanel');
    const funLabClose = document.querySelector('[data-fun-lab-close]');
    const roverSelect = document.querySelector('[data-fun-rover]');
    const vantaRadios = document.querySelectorAll('[data-fun-vanta]');
    const vantaBg = document.getElementById('vanta-bg');
    const funModeKey = 'fun-mode';
    const funRoverKey = 'fun-rover-style';
    const funVantaKey = 'fun-vanta-mode';
    const funMessageTimers = new Map();
    let starTexturesApplied = false;

    // Generate a seamless tileable star texture via canvas
    const generateStarTexture = (size, starCount, palette) => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const pad = 6; // wrap padding for seamless tiling

        for (let i = 0; i < starCount; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const r = 0.4 + Math.random() * 1.2;
            const color = palette[Math.floor(Math.random() * palette.length)];
            const alpha = 0.25 + Math.random() * 0.55;

            const drawDot = (dx, dy) => {
                ctx.beginPath();
                ctx.arc(dx, dy, r, 0, Math.PI * 2);
                ctx.fillStyle = color.replace('ALPHA', alpha.toFixed(2));
                ctx.fill();
            };

            drawDot(x, y);
            // Wrap near edges for seamless tiling
            if (x < pad) drawDot(x + size, y);
            if (x > size - pad) drawDot(x - size, y);
            if (y < pad) drawDot(x, y + size);
            if (y > size - pad) drawDot(x, y - size);
            if (x < pad && y < pad) drawDot(x + size, y + size);
            if (x > size - pad && y > size - pad) drawDot(x - size, y - size);
            if (x < pad && y > size - pad) drawDot(x + size, y - size);
            if (x > size - pad && y < pad) drawDot(x - size, y + size);
        }
        return canvas.toDataURL('image/png');
    };

    const applyStarTextures = () => {
        if (starTexturesApplied) return;
        starTexturesApplied = true;

        const darkPalette = [
            'rgba(226, 232, 240, ALPHA)',
            'rgba(129, 140, 248, ALPHA)',
            'rgba(244, 114, 182, ALPHA)',
            'rgba(186, 230, 253, ALPHA)',
            'rgba(255, 255, 255, ALPHA)'
        ];

        // Generate two differently-seeded textures for variety
        const tex1 = generateStarTexture(512, 180, darkPalette);
        const tex2 = generateStarTexture(384, 120, darkPalette);

        // Set as CSS custom properties on body
        document.body.style.setProperty('--star-tex-1', `url(${tex1})`);
        document.body.style.setProperty('--star-tex-2', `url(${tex2})`);
    };

    const removeStarTextures = () => {
        document.body.style.removeProperty('--star-tex-1');
        document.body.style.removeProperty('--star-tex-2');
        starTexturesApplied = false;
    };
    let analystSparkTimer = null;
    let roverBuddies = [];
    let roverStates = [];
    let roverFrameId = null;
    let roverActive = false;
    let roverFooterVisible = false;
    let roverObserver = null;
    let funRoverStyle = localStorage.getItem(funRoverKey) || 'rover';
    let funVantaMode = localStorage.getItem(funVantaKey) || 'dim';
    let funImmersive = localStorage.getItem('fun_immersive') === 'true'; // Unified toggle
    let shootingStarTimer = null;
    let isShootingStarActive = false;

    const isDarkFunMode = () => (
        document.body.classList.contains('fun-mode')
        && document.documentElement.getAttribute('data-theme') === 'dark'
    );

    const triggerShootingStar = () => {
        // Guard: skip if tab is hidden, mode is wrong, or a star is already flying
        if (!isDarkFunMode() || prefersReducedMotion) return;
        if (document.hidden || isShootingStarActive) return;
        
        isShootingStarActive = true;
        
        // Create a fresh element for every star to ensure CSS variables update correctly
        const star = document.createElement('div');
        star.className = 'fun-shooting-star';
        star.setAttribute('aria-hidden', 'true');
        document.body.appendChild(star);
        
        // Broaden mobile check to include tablets/larger phones
        const isMobile = window.innerWidth < 1024;
        
        // Calculate the exact trajectory angle based on the CSS animation path (130vw, 50vh)
        const dx = window.innerWidth * 1.3;
        const dy = window.innerHeight * 0.5;
        const trajectoryAngle = Math.atan2(dy, dx) * (180 / Math.PI);
        
        const topPos = randomBetween(5, 45);
        
        const angleVariance = isMobile ? randomBetween(0, 10) : randomBetween(-2, 5);
        const angle = trajectoryAngle + angleVariance;
        
        // Mobile/medium: 550-800ms (fast streak)
        // Desktop: 700-1100ms (scenic glide)
        const duration = isMobile ? randomBetween(550, 800) : randomBetween(700, 1100);
        
        star.style.top = `${topPos}%`;
        star.style.setProperty('--star-angle', `${angle}deg`);
        star.style.setProperty('--shooting-duration', `${duration}ms`);
        
        // Trigger animation
        requestAnimationFrame(() => {
            star.classList.add('is-active');
        });
        
        // Cleanup after animation
        star.addEventListener('animationend', () => {
            star.remove();
            isShootingStarActive = false;
        });
    };

    // Timer management for shooting stars
    const scheduleShootingStar = () => {
        clearTimeout(shootingStarTimer);
        if (!isDarkFunMode() || prefersReducedMotion) return;

        // Show shooting star based on config interval ONLY if no scrolling and tab is visible
        const interval = window.siteConfig?.settings?.shootingStarInterval || 25000;
        shootingStarTimer = setTimeout(() => {
            triggerShootingStar();
            scheduleShootingStar();
        }, interval);
    };

    // Pause/resume on tab visibility to prevent accumulated bursts
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearTimeout(shootingStarTimer);
        } else {
            // Restart fresh countdown when tab becomes visible again
            scheduleShootingStar();
        }
    });

    // Reset timer on scroll
    let scrollResetTimer = null;
    const resetShootingStarTimer = () => {
        if (!isDarkFunMode()) return;
        clearTimeout(shootingStarTimer);
        if (scrollResetTimer) clearTimeout(scrollResetTimer);
        
        scrollResetTimer = setTimeout(() => {
            scheduleShootingStar();
        }, 200);
    };
    window.addEventListener('scroll', resetShootingStarTimer, { passive: true });

    const roverStyleOptions = ['rover', 'hopper', 'skimmer', 'orb', 'drone', 'squad', 'none'];
    if (!roverStyleOptions.includes(funRoverStyle)) {
        funRoverStyle = 'none';
    }
    if (!['dim', 'off'].includes(funVantaMode)) {
        funVantaMode = 'dim';
    }

    const updateFunButtons = (enabled) => {
        funButtons.forEach((button) => {
            if (button.type === 'checkbox') {
                button.checked = enabled;
                button.setAttribute('aria-checked', enabled ? 'true' : 'false');
            } else {
                // Update label span if present, otherwise set textContent
                const label = button.querySelector('.fun-lab-label');
                if (label) {
                    label.textContent = enabled ? 'Fun Lab' : 'Fun Lab';
                } else {
                    button.textContent = enabled ? 'Fun Mode: On' : 'Fun Mode';
                }
            }
            button.setAttribute('aria-pressed', enabled ? 'true' : 'false');
        });
    };

    const setFunLabOpen = (open) => {
        if (!funLabPanel) return;
        funLabPanel.classList.toggle('is-open', open);
        funLabPanel.setAttribute('aria-hidden', open ? 'false' : 'true');
        if (funLabButton) {
            funLabButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        }
    };

    const syncFunLabInputs = () => {
        if (roverSelect) roverSelect.value = funRoverStyle;
        vantaRadios.forEach((radio) => {
            radio.checked = radio.value === funVantaMode;
        });
        const immersiveCheck = document.querySelector('[data-fun-immersive]');
        if (immersiveCheck) {
            immersiveCheck.checked = funImmersive;
            immersiveCheck.setAttribute('aria-pressed', funImmersive ? 'true' : 'false');
        }
    };

    const applyVantaMode = (mode, enabled) => {
        document.body.classList.toggle('fun-vanta-dim', enabled && mode === 'dim');
        document.body.classList.toggle('fun-vanta-off', enabled && mode === 'off');
        if (vantaBg) {
            vantaBg.setAttribute('aria-hidden', enabled && mode === 'off' ? 'true' : 'false');
        }
    };

    const applySkillAnimations = (enabled, funEnabled) => {
        document.body.classList.toggle('fun-skills-on', funEnabled && enabled);
        if (funEnabled && enabled) {
            setupSkillConstellations();
        } else {
            // Optional: teardown or just let CSS hide it
        }
    };

    const applySystemConsole = (enabled, funEnabled) => {
        document.body.classList.toggle('fun-console-on', funEnabled && enabled);
    };

    const applyExperienceLogs = (enabled, funEnabled) => {
        document.body.classList.toggle('fun-logs-on', funEnabled && enabled);
    };

    const setupStickySectionTitles = () => {
        const stickyTitles = Array.from(document.querySelectorAll('.sticky-section-title'));
        const stickyFilters = Array.from(document.querySelectorAll('#projects .fun-project-filters'));

        const updateStickyStates = () => {
            stickyTitles.forEach((title) => {
                const stickyTop = parseFloat(getComputedStyle(title).top) || 0;
                const rect = title.getBoundingClientRect();
                // Check if element is at the sticky position (within tolerance)
                // Wider threshold (5px) ensures mobile momentum scrolling still triggers
                const isSticky = Math.abs(rect.top - stickyTop) < 5;
                title.classList.toggle('is-sticky', isSticky);
            });
            stickyFilters.forEach((filters) => {
                const stickyTop = parseFloat(getComputedStyle(filters).top) || 0;
                const rect = filters.getBoundingClientRect();
                const isSticky = Math.abs(rect.top - stickyTop) < 5;
                filters.classList.toggle('is-sticky', isSticky);
            });
        };

        let ticking = false;
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                updateStickyStates();
                ticking = false;
            });
        };

        updateStickyStates();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', updateStickyStates);
    };

    const clearFunMessageTimers = () => {
        funMessageTimers.forEach((timerId) => clearTimeout(timerId));
        funMessageTimers.clear();
        funMessageElements.forEach((element) => element.classList.remove('is-fading'));
    };

    const startFunMessageRotation = () => {
        if (prefersReducedMotion) return;
        funMessageElements.forEach((element) => {
            const rawMessages = element.dataset.messages;
            if (!rawMessages) return;
            const messages = rawMessages.split('|').map((entry) => entry.trim()).filter(Boolean);
            if (messages.length < 2) return;

            // Use typing effect for footer ticker
            const isTicker = element.classList.contains('footer-ticker-text');
            if (isTicker) {
                // Collect all segments from all message groups
                const allSegments = [];
                messages.forEach(msg => {
                    msg.split('•').map(s => s.trim()).filter(Boolean).forEach(s => allSegments.push(s));
                });
                if (allSegments.length === 0) return;

                let segIdx = 0;
                const typeSpeed = 35;
                const eraseSpeed = 18;
                const pauseAfterType = 2200;
                const pauseAfterErase = 300;

                const typeSegment = () => {
                    const text = allSegments[segIdx];
                    let charIdx = 0;
                    element.textContent = '';

                    const typeChar = () => {
                        if (charIdx <= text.length) {
                            element.textContent = text.substring(0, charIdx);
                            charIdx++;
                            funMessageTimers.set(element, setTimeout(typeChar, typeSpeed));
                        } else {
                            // Pause then erase
                            funMessageTimers.set(element, setTimeout(eraseSegment, pauseAfterType));
                        }
                    };

                    const eraseSegment = () => {
                        let eraseIdx = text.length;
                        const eraseChar = () => {
                            if (eraseIdx >= 0) {
                                element.textContent = text.substring(0, eraseIdx);
                                eraseIdx--;
                                funMessageTimers.set(element, setTimeout(eraseChar, eraseSpeed));
                            } else {
                                segIdx = (segIdx + 1) % allSegments.length;
                                funMessageTimers.set(element, setTimeout(typeSegment, pauseAfterErase));
                            }
                        };
                        eraseChar();
                    };

                    typeChar();
                };

                funMessageTimers.set(element, setTimeout(typeSegment, 800));
                return;
            }

            // Default fade rotation for non-ticker elements
            let index = 0;
            const rotate = () => {
                index = (index + 1) % messages.length;
                element.classList.add('is-fading');
                const fadeDelay = 280;
                const timerId = setTimeout(() => {
                    element.textContent = messages[index];
                    element.classList.remove('is-fading');
                    const nextDelay = randomBetween(3200, 5200);
                    funMessageTimers.set(element, setTimeout(rotate, nextDelay));
                }, fadeDelay);
                funMessageTimers.set(element, timerId);
            };

            const initialDelay = randomBetween(2600, 4200);
            funMessageTimers.set(element, setTimeout(rotate, initialDelay));
        });
    };

    const setupProjectFilters = () => {
        // Sort projects by date (newest first) if on projects page
        if (window.location.pathname.includes('projects.html')) {
            const projectsList = document.getElementById('projectsList');
            if (projectsList) {
                const cards = Array.from(projectsList.children);
                cards.sort((a, b) => {
                    const getPostedDate = (card) => {
                        const timeEl = card.querySelector('time[data-posted]');
                        const dateStr = timeEl ? (timeEl.getAttribute('data-posted') || timeEl.getAttribute('datetime')) : '';
                        return dateStr ? new Date(dateStr).getTime() : 0;
                    };
                    return getPostedDate(b) - getPostedDate(a); // Descending order
                });
                cards.forEach(card => projectsList.appendChild(card));
            }
        }

        const filterGroups = document.querySelectorAll('.fun-project-filters');
        filterGroups.forEach((group) => {
            const scopeSelector = group.dataset.filterScope;
            if (!scopeSelector) return;
            const scope = document.querySelector(scopeSelector);
            if (!scope) return;

            const filterMode = group.dataset.filterMode || 'hide';
            const items = group.dataset.filterItems === 'children'
                ? Array.from(scope.children)
                : Array.from(scope.querySelectorAll('.project-card'));

            const updateItemInteractivity = (item, disabled) => {
                const controls = item.querySelectorAll('a, button, [role="button"]');
                controls.forEach((control) => {
                    if (disabled) {
                        if (control.dataset.funDisabled !== 'true') {
                            const prevTabIndex = control.getAttribute('tabindex');
                            control.dataset.prevTabindex = prevTabIndex === null ? '' : prevTabIndex;
                            control.dataset.funDisabled = 'true';
                        }
                        control.setAttribute('tabindex', '-1');
                        control.setAttribute('aria-disabled', 'true');
                    } else if (control.dataset.funDisabled === 'true') {
                        control.removeAttribute('aria-disabled');
                        const prevTabIndex = control.dataset.prevTabindex;
                        if (prevTabIndex === undefined || prevTabIndex === '') {
                            control.removeAttribute('tabindex');
                        } else {
                            control.setAttribute('tabindex', prevTabIndex);
                        }
                        delete control.dataset.prevTabindex;
                        delete control.dataset.funDisabled;
                    }
                });
            };

            const refreshAosVisibility = () => {
                if (typeof AOS === 'undefined') return;
                items.forEach((item) => {
                    if (item.classList.contains('fun-filter-hidden')) return;
                    if (item.hasAttribute('data-aos')) {
                        item.classList.add('aos-animate');
                    }
                });
                if (typeof AOS.refreshHard === 'function') {
                    AOS.refreshHard();
                } else if (typeof AOS.refresh === 'function') {
                    AOS.refresh();
                }
            };

            const applyFilter = (button, shouldScroll = true) => {
                if (typeof window.closeProjectModal === 'function') {
                    window.closeProjectModal();
                }

                const filter = button.dataset.filter || 'all';
                const keywords = (button.dataset.keywords || '')
                    .split(',')
                    .map((value) => value.trim().toLowerCase())
                    .filter(Boolean);
                let firstMatch = null;
                const shouldFlip = shouldScroll && !prefersReducedMotion && !scope.classList.contains('carousel-track');
                const firstRects = shouldFlip ? new Map() : null;

                if (shouldFlip) {
                    items.forEach((item) => {
                        if (item.classList.contains('fun-filter-hidden')) return;
                        firstRects.set(item, item.getBoundingClientRect());
                    });
                }

                group.querySelectorAll('.fun-filter-btn').forEach((btn) => {
                    const isActive = btn === button;
                    btn.classList.toggle('is-active', isActive);
                    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
                });

                items.forEach((item) => {
                    const text = item.textContent.toLowerCase();
                    const category = item.dataset.category; 
                    let matches = false;
                    
                    if (filter === 'all') {
                        matches = true;
                    } else if (category && category === filter) {
                        matches = true;
                    } else {
                        // Fallback to keyword search
                        matches = keywords.some((keyword) => text.includes(keyword));
                    }

                    if (matches && !firstMatch) {
                        firstMatch = item;
                    }

                    const allowFocus = !scope.classList.contains('carousel-track');
                    item.classList.toggle('fun-filter-hit', filter !== 'all' && matches);
                    item.classList.toggle('fun-filter-focus', allowFocus && filter !== 'all' && matches && item === firstMatch);

                    if (filterMode === 'soft') {
                        item.classList.toggle('fun-filter-dim', !matches);
                        item.classList.remove('fun-filter-hidden');
                    } else {
                        item.classList.toggle('fun-filter-hidden', !matches);
                        item.classList.remove('fun-filter-dim');
                    }

                    const disableInteractions = filterMode === 'soft' ? !matches : !matches;
                    updateItemInteractivity(item, disableInteractions);
                });

                // Refresh AOS after layout updates to prevent gaps
                requestAnimationFrame(() => {
                    refreshAosVisibility();
                });

                if (shouldScroll || shouldFlip) {
                    const target = filter === 'all' ? items[0] : firstMatch;
                    items.forEach((item) => {
                        item.classList.toggle('is-active', item === target);
                    });

                    if (shouldScroll && scope.classList.contains('carousel-track') && target) {
                        const cardWidth = target.getBoundingClientRect().width || target.offsetWidth;
                        const targetLeft = target.offsetLeft - (scope.clientWidth - cardWidth) / 2;
                        const max = scope.scrollWidth - scope.clientWidth;
                        if (scope.scrollWidth > scope.clientWidth + 1) {
                            scope.scrollTo({
                                left: Math.max(0, Math.min(targetLeft, max)),
                                behavior: 'smooth'
                            });
                        }
                    }

                    // Scroll to top of list if needed (only for list view)
                    if (shouldScroll && !scope.classList.contains('carousel-track')) {
                        const stickyOffset = 220;
                        const listTop = scope.getBoundingClientRect().top + window.scrollY - stickyOffset;
                        window.scrollTo({
                            top: Math.max(0, listTop),
                            behavior: 'smooth'
                        });
                    }

                    requestAnimationFrame(() => {
                        if (shouldFlip && firstRects) {
                            items.forEach((item) => {
                                if (item.classList.contains('fun-filter-hidden')) return;
                                const firstRect = firstRects.get(item);
                                if (!firstRect) return;
                                const lastRect = item.getBoundingClientRect();
                                const deltaX = firstRect.left - lastRect.left;
                                const deltaY = firstRect.top - lastRect.top;

                                if (Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0) {
                                    item.style.transition = 'none';
                                    item.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

                                    requestAnimationFrame(() => {
                                        item.style.transition = 'transform 0.5s cubic-bezier(0.2, 0, 0.2, 1)';
                                        item.style.transform = '';
                                    });
                                }
                            });
                        }
                    });
                }
            };

            // Attach listeners using cloning to prevent duplicates on re-init
            group.querySelectorAll('.fun-filter-btn').forEach((btn) => {
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                newBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    applyFilter(newBtn, true);
                });
            });

            // Re-apply current filter if one is active, otherwise default
            const currentActive = group.querySelector('.fun-filter-btn.is-active');
            if (currentActive) {
                // Don't scroll on re-init
                applyFilter(currentActive, false);
            } else {
                const defaultButton = group.querySelector('.fun-filter-btn');
                if (defaultButton) {
                    applyFilter(defaultButton, false);
                }
            }
        });
    };

    const roverProfiles = {
        rover: {
            style: 'rover',
            motion: 'ground',
            speedRange: [2, 6],
            bounceRange: [4, 8],
            gravity: 0.18,
            floorOffset: 10,
            wobble: 1.4,
            timeStep: 0.022,
            spinRange: [12, 18]
        },
        hopper: {
            style: 'hopper',
            motion: 'ground',
            speedRange: [2, 5],
            bounceRange: [6, 10],
            gravity: 0.35,
            floorOffset: 0,
            wobble: 0.6,
            timeStep: 0.026,
            spinRange: [14, 22]
        },
        skimmer: {
            style: 'skimmer',
            motion: 'glide',
            speedRange: [2, 5],
            floatAmpRange: [6, 14],
            driftAmpRange: [16, 28],
            baseHeight: 0.72,
            floorOffset: 22,
            wobble: 1.6,
            timeStep: 0.02,
            spinRange: [16, 24]
        },
        orb: {
            style: 'orb',
            motion: 'float',
            speedRange: [1, 3],
            floatAmpRange: [10, 20],
            driftAmpRange: [20, 32],
            baseHeight: 0.35,
            wobble: 1.1,
            timeStep: 0.018
        },
        drone: {
            style: 'drone',
            motion: 'float',
            speedRange: [2, 4],
            floatAmpRange: [8, 16],
            driftAmpRange: [18, 34],
            baseHeight: 0.25,
            wobble: 1.2,
            timeStep: 0.02,
            spinRange: [12, 20]
        }
    };

    const roverRosters = {
        rover: ['rover'],
        orb: ['orb'],
        drone: ['drone'],
        hopper: ['hopper'],
        skimmer: ['skimmer'],
        squad: ['rover', 'hopper', 'orb', 'drone', 'skimmer']
    };

    const getRoverRoster = (style) => {
        const roster = roverRosters[style] || [style];
        return roster.filter((value, index, array) => (
            array.indexOf(value) === index && roverProfiles[value]
        ));
    };

    const clearRoverBuddies = () => {
        roverStates = [];
        roverBuddies.forEach((buddy) => buddy.remove());
        roverBuddies = [];
    };

    const roverQuips = [
        "This site runs on 100% pure creativity!",
        "I found zero bugs here. Just features!",
        "David's code is cleaner than my chassis!",
        "Scanning for awesomeness... found it!",
        "10/10 would visit again.",
        "My sensors detect high quality data structures.",
        "Optimized for fun and function!",
        "Beep boop! This portfolio rocks!",
        "Data integrity verified: Excellent.",
        "I could bounce around here all day!",
        "Systems nominal. Aesthetic operational.",
        "Have you seen the cool projects yet?",
        "Searching for loose semicolons... none found!",
        "This UI is smoother than my wheel bearings."
    ];

    const concerningQuips = [
        "Wait... did something just move in the shadows?",
        "I'm picking up strange energy readings here...",
        "Why is the footer planet vibrating?",
        "There are things in this code... ancient things.",
        "My sensors are glitching. Is that a ghost?",
        "I swear I heard a binary whisper.",
        "Do not look directly at the void.",
        "Searching for mythical bugs... found a trace.",
        "Alert: Anomalous data detected in sector 7.",
        "Is it just me, or is the background watching us?",
        "I think we are not alone in this DOM.",
        "Scavenging for lost packets... it's dark down here."
    ];

    const showRoverQuip = (buddy) => {
        // Remove existing bubble if any
        let bubble = buddy.querySelector('.rover-quip-bubble');
        if (bubble) bubble.remove();

        // Create new bubble
        bubble = document.createElement('div');
        bubble.className = 'rover-quip-bubble';
        
        // 30% chance for a concerning message
        const useConcerning = Math.random() < 0.3;
        const text = useConcerning 
            ? concerningQuips[Math.floor(Math.random() * concerningQuips.length)]
            : roverQuips[Math.floor(Math.random() * roverQuips.length)];
            
        if (useConcerning) bubble.classList.add('is-alert');
        
        bubble.textContent = text;
        buddy.appendChild(bubble);

        // Position - slightly random to feel natural
        bubble.style.left = `${randomBetween(-20, 20)}px`;
        bubble.style.bottom = '45px'; // Above the rover

        // Animate in
        requestAnimationFrame(() => {
            bubble.classList.add('is-visible');
        });

        // Animate rover reaction (small jump)
        const originalTransform = buddy.style.transform;
        // Jitter shake if alerting, normal jump if happy
        if (useConcerning) {
             buddy.style.transform = `${originalTransform} rotate(10deg) scale(1.1)`;
             setTimeout(() => { buddy.style.transform = `${originalTransform} rotate(-10deg) scale(1.1)`; }, 100);
             setTimeout(() => { buddy.style.transform = originalTransform; }, 200);
        } else {
             buddy.style.transform = `${originalTransform} scale(1.2)`;
             setTimeout(() => { buddy.style.transform = originalTransform; }, 200);
        }

        // Remove after delay
        setTimeout(() => {
            bubble.classList.remove('is-visible');
            setTimeout(() => bubble.remove(), 500);
        }, 3000);
    };

    const createRoverBuddy = (profileName, index, total) => {
        const profile = roverProfiles[profileName];
        if (!profile) return;
        const buddy = document.createElement('div');
        buddy.className = 'fun-rover-buddy';
        buddy.dataset.style = profile.style;
        buddy.dataset.motion = profile.motion;
        buddy.setAttribute('aria-hidden', 'true');
        // Allow clicks
        buddy.style.pointerEvents = 'auto';
        buddy.style.cursor = 'pointer';
        
        const spinRange = profile.spinRange || [14, 20];
        buddy.style.setProperty('--wheel-speed', `${randomBetween(spinRange[0], spinRange[1]) / 10}s`);
        
        let extraParts = '';
        if (profile.style === 'hopper') {
             extraParts = `
                <span class="rover-leg rover-leg-left"></span>
                <span class="rover-leg rover-leg-right"></span>
             `;
        }
        if (profile.style === 'drone' || profile.style === 'skimmer') {
             extraParts += `<span class="rover-headlight"></span>`;
        }

        buddy.innerHTML = `
            <span class="rover-glow"></span>
            ${extraParts}
            <span class="rover-body"></span>
            <span class="rover-visor"></span>
            <span class="rover-wheel rover-wheel-left"></span>
            <span class="rover-wheel rover-wheel-right"></span>
            <span class="rover-antenna"></span>
            <span class="rover-fin"></span>
        `;
        
        // Add click listener for quips
        buddy.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering other things
            showRoverQuip(buddy);
        });

        const footer = document.querySelector('footer');
        if (footer) {
            footer.appendChild(buddy);
        } else {
            document.body.appendChild(buddy);
        }

        const rect = buddy.getBoundingClientRect();
        const width = rect.width || 60;
        const height = rect.height || 32;
        
        // Use footer dimensions for X positioning
        const containerWidth = footer ? footer.clientWidth : window.innerWidth;
        const spacing = (containerWidth - width - 40) / Math.max(total, 1);
        const baseX = Math.max(16, Math.min(containerWidth - width - 16, spacing * (index + 0.6)));
        
        const speed = randomBetween(profile.speedRange[0], profile.speedRange[1]) / 10;
        const floatAmp = profile.floatAmpRange
            ? randomBetween(profile.floatAmpRange[0], profile.floatAmpRange[1])
            : 0;
        const driftAmp = profile.driftAmpRange
            ? randomBetween(profile.driftAmpRange[0], profile.driftAmpRange[1])
            : 0;
        const state = {
            element: buddy,
            profile,
            width,
            height,
            x: baseX,
            baseX,
            y: 0, // Initial Y will be set by bounds
            vx: speed * (Math.random() < 0.5 ? -1 : 1),
            vy: profile.motion === 'ground' ? -randomBetween(4, 12) / 10 : 0,
            gravity: profile.gravity || 0,
            bounce: profile.bounceRange ? randomBetween(profile.bounceRange[0], profile.bounceRange[1]) / 10 : 0,
            baseY: 0,
            floatAmp,
            driftAmp,
            phase: Math.random() * Math.PI * 2,
            time: Math.random() * 4,
            timeStep: profile.timeStep || 0.02,
            wobble: profile.wobble || 1.2,
            floor: 0,
            ceiling: 0,
            maxX: 0,
            hopperState: 'hopping', // 'hopping' or 'scavenging'
            scavengeTimer: 0
        };
        roverBuddies.push(buddy);
        roverStates.push(state);
    };

    const updateRoverStyle = () => {
        updateRoverVisibility();
    };

    const updateRoverBounds = (state) => {
        const footer = document.querySelector('footer');
        if (!footer) return;
        const rect = state.element.getBoundingClientRect();
        const width = rect.width || state.width || 60;
        const height = rect.height || state.height || 32;
        state.width = width;
        state.height = height;
        
        // Use footer dimensions
        const containerWidth = footer.clientWidth;
        const containerHeight = footer.clientHeight;
        
        state.maxX = Math.max(0, containerWidth - width - 16);
        if (state.profile.motion === 'ground') {
            const floorOffset = state.profile.floorOffset || 10;
            // Floor is relative to footer bottom
            state.floor = containerHeight - height - floorOffset;
            state.ceiling = Math.max(containerHeight * 0.2, state.floor - height * 4);
        } else {
            // For floaters, keep them in the upper/middle part of footer
            const base = containerHeight * 0.5;
            state.baseY = Math.min(containerHeight - height - 20, Math.max(20, base));
        }
    };

    const renderRover = (state) => {
        const drift = Math.sin(state.time * 1.6 + state.phase) * state.wobble;
        const tilt = Math.max(-8, Math.min(8, state.vx * 10)) + drift;
        
        // Hopper squash/stretch visual
        if (state.profile.style === 'hopper') {
            const legs = state.element.querySelectorAll('.rover-leg');
            const nearFloor = state.y >= state.floor - 2;
            const rising = state.vy < -2;
            const isScavenging = state.hopperState === 'scavenging';
            
            // Gentle squash on ground, mild stretch when rising, neutral mid-air
            // Scavenging: flat legs
            const scaleY = isScavenging ? 0.9 : (nearFloor ? 0.78 : (rising ? 1.15 : 1));
            const scaleX = isScavenging ? 1.05 : (nearFloor ? 1.12 : (rising ? 0.92 : 1));
            
            legs.forEach(leg => {
                leg.style.transform = `scaleY(${nearFloor || isScavenging ? 0.65 : 1})`;
            });
            state.element.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) rotate(${tilt}deg) scaleX(${scaleX}) scaleY(${scaleY})`;
            return;
        }
        
        state.element.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) rotate(${tilt}deg)`;
    };

    const animateRover = () => {
        if (!roverStates.length) return;
        roverStates.forEach((state) => {
            updateRoverBounds(state);
            state.time += state.timeStep;
            if (state.profile.motion === 'ground') {
                state.vy += state.gravity;
                state.x += state.vx;
                state.y += state.vy;

                if (state.y >= state.floor) {
                    state.y = state.floor;
                    
                    if (state.profile.style === 'hopper') {
                         if (state.hopperState === 'scavenging') {
                             // Scavenge behavior: move slowly or stop
                             state.vy = 0; // Stick to floor
                             state.scavengeTimer -= 0.016; // Approx 60fps
                             if (state.scavengeTimer <= 0) {
                                 state.hopperState = 'hopping';
                                 // Big jump to start hopping
                                 state.vy = -randomBetween(state.profile.bounceRange[0], state.profile.bounceRange[1]);
                                 // Regular speed
                                 state.vx = (Math.random() < 0.5 ? -1 : 1) * (randomBetween(state.profile.speedRange[0], state.profile.speedRange[1]) / 10);
                             }
                         } else {
                             // Hopping behavior
                             // 40% chance to switch to scavenging on landing
                             if (Math.random() < 0.4) {
                                 state.hopperState = 'scavenging';
                                 state.scavengeTimer = randomBetween(2, 6); // 2-6 seconds
                                 state.vx = (Math.random() < 0.5 ? -1 : 1) * (randomBetween(1, 3) / 10); // Slow crawl
                                 state.vy = 0;
                             } else {
                                 // Keep hopping
                                 state.vy = -randomBetween(state.profile.bounceRange[0], state.profile.bounceRange[1]);
                                 const dir = state.vx >= 0 ? 1 : -1;
                                 const flip = Math.random() < 0.25 ? -1 : 1; 
                                 state.vx = dir * flip * (randomBetween(state.profile.speedRange[0], state.profile.speedRange[1]) / 10);
                             }
                         }
                    } else {
                        state.vy *= -state.bounce;
                    }
                }

                if (state.y <= state.ceiling) {
                    state.y = state.ceiling;
                    state.vy = Math.abs(state.vy);
                }
            } else {
                state.baseX += state.vx;
                const lift = Math.cos(state.time + state.phase) * state.floatAmp;
                const sway = Math.sin(state.time * 0.9 + state.phase) * state.driftAmp;
                state.y = state.baseY + lift;
                state.x = state.baseX + sway;
            }

            if (state.profile.motion === 'ground') {
                if (state.x <= 8 || state.x >= state.maxX) {
                    state.vx *= -1;
                    state.x = Math.max(8, Math.min(state.x, state.maxX));
                }
            } else {
                if (state.baseX <= 8 || state.baseX >= state.maxX) {
                    state.vx *= -1;
                    state.baseX = Math.max(8, Math.min(state.baseX, state.maxX));
                }
            }

            renderRover(state);
        });
        roverFrameId = requestAnimationFrame(animateRover);
    };

    const startRoverBuddy = () => {
        clearRoverBuddies();
        const roster = getRoverRoster(funRoverStyle);
        const footer = document.querySelector('footer');
        // Only spawn if footer exists; otherwise abort (footer-only display)
        if (!footer) return;

        roverActive = true;
        roster.forEach((profileName, index) => createRoverBuddy(profileName, index, roster.length));
        roverStates.forEach((state) => {
            updateRoverBounds(state);
            if (state.profile.motion === 'ground') {
                state.y = state.floor;
            } else {
                state.y = state.baseY;
            }
            renderRover(state);
        });
        if (prefersReducedMotion) return;
        if (roverFrameId) cancelAnimationFrame(roverFrameId);
        roverFrameId = requestAnimationFrame(animateRover);
    };

    const stopRoverBuddy = () => {
        if (roverFrameId) {
            cancelAnimationFrame(roverFrameId);
            roverFrameId = null;
        }
        roverActive = false;
        clearRoverBuddies();
    };

    const updateRoverVisibility = () => {
        const shouldRun = roverFooterVisible
            && document.body.classList.contains('fun-mode')
            && funRoverStyle !== 'none';
        if (shouldRun && !roverActive) {
            startRoverBuddy();
        } else if (!shouldRun && roverActive) {
            stopRoverBuddy();
        }
    };

    const observeRoverFooter = () => {
        if (roverObserver) return;
        const footer = document.querySelector('footer');
        if (!footer || !('IntersectionObserver' in window)) return;
        roverObserver = new IntersectionObserver((entries) => {
            roverFooterVisible = entries.some((entry) => entry.isIntersecting);
            updateRoverVisibility();
        }, {
            root: null,
            rootMargin: '0px 0px 240px 0px',
            threshold: 0.01
        });
        roverObserver.observe(footer);
    };

    const getSkillVisualType = (title) => {
        const label = title.toLowerCase();
        if (label.includes('data')) return 'data';
        if (label.includes('automation')) return 'automation';
        if (label.includes('operating')) return 'os';
        if (label.includes('infrastructure')) return 'infra';
        if (label.includes('network')) return 'network';
        if (label.includes('systems')) return 'systems';
        return 'systems';
    };

    const skillVisualTemplates = {
        systems: `
            <span class="circuit-line line-x"></span>
            <span class="circuit-line line-x line-x2"></span>
            <span class="circuit-line line-y"></span>
            <span class="circuit-line line-y line-y2"></span>
            <span class="circuit-node node-a"></span>
            <span class="circuit-node node-b"></span>
            <span class="circuit-node node-c"></span>
        `,
        data: `
            <span class="radar-ring ring-1"></span>
            <span class="radar-ring ring-2"></span>
            <span class="radar-ring ring-3"></span>
            <span class="radar-sweep"></span>
            <span class="radar-dot dot-1"></span>
            <span class="radar-dot dot-2"></span>
            <span class="radar-dot dot-3"></span>
        `,
        automation: `
            <svg viewBox="0 0 120 60" aria-hidden="true">
                <path class="flow-path" d="M8 48 C 30 20, 60 20, 112 12" />
                <circle class="flow-node" cx="8" cy="48" r="3" />
                <circle class="flow-node" cx="55" cy="26" r="2.4" />
                <circle class="flow-node" cx="112" cy="12" r="3" />
                <circle class="flow-spark" cx="84" cy="18" r="2.2" />
            </svg>
        `,
        os: `
            <span class="terminal-line line-1"></span>
            <span class="terminal-line line-2"></span>
            <span class="terminal-line line-3"></span>
            <span class="terminal-line line-4"></span>
            <span class="terminal-cursor"></span>
            <span class="terminal-scan"></span>
        `,
        infra: `
            <span class="rack-unit unit-1"></span>
            <span class="rack-unit unit-2"></span>
            <span class="rack-unit unit-3"></span>
            <span class="rack-light light-1"></span>
            <span class="rack-light light-2"></span>
            <span class="rack-light light-3"></span>
        `,
        network: `
            <span class="net-line line-1"></span>
            <span class="net-line line-2"></span>
            <span class="net-line line-3"></span>
            <span class="net-node node-1"></span>
            <span class="net-node node-2"></span>
            <span class="net-node node-3"></span>
            <span class="net-node node-4"></span>
            <span class="net-pulse"></span>
        `
    };

    const setupSkillConstellations = () => {
        document.querySelectorAll('.skill-card').forEach((card) => {
            const existing = card.querySelector('.skill-constellation');
            if (existing) existing.remove();
            const existingSpark = card.querySelector('.skill-spark');
            if (existingSpark) existingSpark.remove();

            const title = card.querySelector('h3')?.textContent || '';
            const type = getSkillVisualType(title);
            const constellation = document.createElement('div');
            constellation.className = 'skill-constellation';
            constellation.dataset.visual = type;
            constellation.setAttribute('aria-hidden', 'true');
            constellation.style.setProperty('--constellation-delay', `${randomBetween(0, 12) / 10}s`);
            constellation.innerHTML = skillVisualTemplates[type] || skillVisualTemplates.systems;
            card.appendChild(constellation);
        });
    };

    const setupAnalystSparks = () => {
        document.querySelectorAll('.analyst-spark span').forEach((bar) => {
            if (bar.dataset.baseHeight) return;
            const baseHeight = bar.style.getPropertyValue('--bar') || `${randomBetween(50, 90)}%`;
            bar.dataset.baseHeight = baseHeight.trim();
            bar.style.setProperty('--bar', bar.dataset.baseHeight);
            bar.style.setProperty('--spark-delay', `${randomBetween(0, 8) / 10}s`);
        });
    };

    const startAnalystSparkCycle = () => {
        if (prefersReducedMotion) return;
        setupAnalystSparks();
        if (analystSparkTimer) clearInterval(analystSparkTimer);
        const bars = Array.from(document.querySelectorAll('.analyst-spark span'));
        analystSparkTimer = setInterval(() => {
            bars.forEach((bar) => {
                const baseValue = parseFloat(bar.dataset.baseHeight || '70');
                if (Number.isNaN(baseValue)) return;
                const next = Math.min(95, Math.max(35, baseValue + randomBetween(-16, 16)));
                bar.style.setProperty('--bar', `${next}%`);
                bar.style.setProperty('--spark-delay', `${randomBetween(0, 8) / 10}s`);
            });
        }, 1800);
    };

    const stopAnalystSparkCycle = () => {
        if (analystSparkTimer) {
            clearInterval(analystSparkTimer);
            analystSparkTimer = null;
        }
        document.querySelectorAll('.analyst-spark span').forEach((bar) => {
            if (bar.dataset.baseHeight) {
                bar.style.setProperty('--bar', bar.dataset.baseHeight);
            }
        });
    };

    const ensureViewLinkText = (link) => {
        let textSpan = link.querySelector('.view-link-text');
        if (textSpan) return textSpan;
        const textNodes = Array.from(link.childNodes).filter((node) => node.nodeType === Node.TEXT_NODE);
        const textContent = textNodes.map((node) => node.textContent).join(' ').trim() || 'View Project';
        textNodes.forEach((node) => node.remove());
        textSpan = document.createElement('span');
        textSpan.className = 'view-link-text';
        textSpan.textContent = textContent;
        link.insertBefore(textSpan, link.firstChild);
        return textSpan;
    };

    const timeAgo = (input) => {
        const now = new Date();
        const date = input instanceof Date ? input : new Date(input);
        if (Number.isNaN(date.getTime())) return 'recently';
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return 'just now';
        if (diff < 3600) {
            const minutes = Math.floor(diff / 60);
            return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        }
        if (diff < 86400) {
            const hours = Math.floor(diff / 3600);
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        }
        if (diff < 604800) {
            const days = Math.floor(diff / 86400);
            return `${days} day${days !== 1 ? 's' : ''} ago`;
        }
        if (diff < 2592000) {
            const weeks = Math.floor(diff / 604800);
            return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
        }
        if (diff < 31536000) {
            const months = Math.floor(diff / 2592000);
            return `${months} month${months !== 1 ? 's' : ''} ago`;
        }
        const years = Math.floor(diff / 31536000);
        return `${years} year${years !== 1 ? 's' : ''} ago`;
    };

    const setViewLinkHint = (link) => {
        const textSpan = ensureViewLinkText(link);
        if (!textSpan.dataset.originalText) {
            textSpan.dataset.originalText = textSpan.textContent.trim();
        }
        
        // Calculate modification date text
        let revealText = "No modifications yet";
        const card = link.closest('.project-card') || link.closest('.project-list-card');
        if (card) {
            const timeEl = card.querySelector('time[data-modified]');
            const postedEl = card.querySelector('time[data-posted]');
            if (timeEl) {
                const dateStr = timeEl.getAttribute('data-modified') || timeEl.getAttribute('datetime');
                if (dateStr) {
                    try {
                        const date = new Date(dateStr);
                        if (!Number.isNaN(date.getTime())) {
                            let isUnmodified = false;
                            if (postedEl) {
                                const postedStr = postedEl.getAttribute('data-posted') || postedEl.getAttribute('datetime');
                                const postedDate = postedStr ? new Date(postedStr) : null;
                                if (postedDate && !Number.isNaN(postedDate.getTime())) {
                                    isUnmodified = Math.abs(date - postedDate) < 60000;
                                }
                            }
                            revealText = isUnmodified
                                ? 'No modifications yet'
                                : `Modified: ${timeAgo(date)}`;
                        }
                    } catch (e) {}
                }
            }
        }
        
        link.setAttribute('data-reveal-text', revealText);
    };

    const parseProjectPayload = (card) => {
        if (!card) return null;
        const rawPayload = card.getAttribute('data-project');
        if (!rawPayload) return null;
        try {
            return JSON.parse(decodeURIComponent(rawPayload));
        } catch (err) {
            console.warn('Unable to parse project payload', err);
            return null;
        }
    };

    const modalState = {
        overlay: null,
        activeTrigger: null,
        closeTimer: null,
        sourceCard: null
    };

    const getSourceCard = (trigger) => {
        if (!trigger) return null;
        return trigger.closest('.project-card') || trigger.closest('.project-list-card') || trigger.closest('#projectsList > div');
    };

    const applyModalMorph = (modalCard, sourceCard) => {
        if (!modalCard || !sourceCard) return false;
        const cardRect = sourceCard.getBoundingClientRect();
        const modalRect = modalCard.getBoundingClientRect();
        if (!modalRect.width || !modalRect.height) return false;
        const cardCenterX = cardRect.left + cardRect.width / 2;
        const cardCenterY = cardRect.top + cardRect.height / 2;
        const modalCenterX = modalRect.left + modalRect.width / 2;
        const modalCenterY = modalRect.top + modalRect.height / 2;
        const translateX = cardCenterX - modalCenterX;
        const translateY = cardCenterY - modalCenterY;
        const scaleX = Math.max(cardRect.width / modalRect.width, 0.1);
        const scaleY = Math.max(cardRect.height / modalRect.height, 0.1);
        const sourceRadius = window.getComputedStyle(sourceCard).borderRadius || '1rem';
        modalCard.style.setProperty('--modal-translate-x', `${translateX}px`);
        modalCard.style.setProperty('--modal-translate-y', `${translateY}px`);
        modalCard.style.setProperty('--modal-scale-x', scaleX.toFixed(3));
        modalCard.style.setProperty('--modal-scale-y', scaleY.toFixed(3));
        modalCard.style.setProperty('--modal-radius', sourceRadius);
        return true;
    };

    const resetModalMorph = (modalCard) => {
        if (!modalCard) return;
        modalCard.style.removeProperty('--modal-translate-x');
        modalCard.style.removeProperty('--modal-translate-y');
        modalCard.style.removeProperty('--modal-scale-x');
        modalCard.style.removeProperty('--modal-scale-y');
        modalCard.style.removeProperty('--modal-radius');
    };

    const applyModalMorphInstant = (modalCard, sourceCard) => {
        if (!modalCard || !sourceCard) return false;
        const prevTransition = modalCard.style.transition;
        modalCard.style.transition = 'none';
        const didApply = applyModalMorph(modalCard, sourceCard);
        modalCard.offsetHeight; // force reflow
        modalCard.style.transition = prevTransition;
        return didApply;
    };

    const resetModalMorphInstant = (modalCard) => {
        if (!modalCard) return;
        const prevTransition = modalCard.style.transition;
        modalCard.style.transition = 'none';
        resetModalMorph(modalCard);
        modalCard.offsetHeight; // force reflow
        modalCard.style.transition = prevTransition;
    };

    const setModalScrollbarCompensation = (enabled) => {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        const value = enabled && scrollbarWidth > 0 ? `${scrollbarWidth}px` : '0px';
        document.documentElement.style.setProperty('--modal-scrollbar-width', value);
    };

    const buildImpactCards = (impact = []) => {
        if (!impact.length) return '';
        return impact.map(item => `
            <div class="project-modal-impact-card">
                <span class="impact-value">${item.value || ''}</span>
                <span class="impact-label">${item.label || ''}</span>
                ${item.detail ? `<span class="impact-detail">${item.detail}</span>` : ''}
            </div>
        `).join('');
    };

    const buildDetails = (details = [], images = []) => {
        if (!details.length) return '<p>No additional details yet.</p>';
        const imagesByIndex = {};
        (images || []).forEach(img => {
            const idx = img.afterDetail ?? -1;
            if (!imagesByIndex[idx]) imagesByIndex[idx] = [];
            imagesByIndex[idx].push(img);
        });
        const buildImg = (img) => {
            const darkSrc = img.srcDark ? ` data-dark-src="${img.srcDark}"` : '';
            const caption = img.caption ? `<figcaption class="project-detail-img-caption">${img.caption}</figcaption>` : '';
            return `<figure class="project-detail-figure">
                <img class="project-detail-img${img.srcDark ? ' has-dark-variant' : ''}" src="${img.src}"${darkSrc} alt="${img.alt || ''}" loading="lazy" decoding="async">
                ${caption}
            </figure>`;
        };
        let html = '';
        details.forEach((detail, i) => {
            html += `<p>${detail}</p>`;
            if (imagesByIndex[i]) html += imagesByIndex[i].map(buildImg).join('');
        });
        return html;
    };

    const buildTags = (tags = []) => {
        if (!tags.length) return '';
        return tags.map(tag => `<span class="project-modal-tag">${tag}</span>`).join('');
    };

    const ensureProjectModal = () => {
        if (modalState.overlay) return modalState.overlay;
        const overlay = document.createElement('div');
        overlay.className = 'project-modal-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        overlay.innerHTML = `
            <div class="project-modal-card" role="dialog" aria-modal="true" aria-label="Project details" tabindex="-1">
                <button type="button" class="project-modal-close close-control" aria-label="Close project details">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
                <div class="project-modal-content"></div>
            </div>
        `;
        document.body.appendChild(overlay);
        const closeBtn = overlay.querySelector('.project-modal-close');

        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                closeProjectModal();
            }
        });

        closeBtn.addEventListener('click', () => closeProjectModal());

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && document.body.classList.contains('project-modal-open')) {
                closeProjectModal();
            }
        });

        modalState.overlay = overlay;
        return overlay;
    };

    const renderProjectModal = (project) => {
        const overlay = ensureProjectModal();
        const content = overlay.querySelector('.project-modal-content');
        const postedText = project.posted ? `Posted · ${timeAgo(project.posted)}` : 'Posted recently';
        const modifiedText = project.modified ? `Updated · ${timeAgo(project.modified)}` : '';
        content.innerHTML = `
            <div class="project-modal-header">
                <div class="project-modal-image">
                    <img src="${project.image || ''}" alt="${project.title || 'Project image'}" loading="lazy" decoding="async">
                </div>
                <div class="project-modal-intro">
                    <div class="project-modal-dates">
                        <p class="project-modal-date">${postedText}</p>
                        ${modifiedText ? `<p class="project-modal-date project-modal-date--updated">${modifiedText}</p>` : ''}
                    </div>
                    <h3 id="project-modal-title">${project.title || 'Project details'}</h3>
                </div>
                <p class="project-modal-summary">${project.summary || ''}</p>
                <div class="project-modal-tags">${buildTags(project.tags)}</div>
                ${project.link || project.pdf ? `
                    <div class="project-modal-links">
                        ${project.link ? `<a href="${project.link}" target="_blank" rel="noopener noreferrer" class="project-modal-link"><i data-feather="external-link" class="w-4 h-4"></i> ${project.linkText || 'View Publication'}</a>` : ''}
                        ${project.pdf ? `<a href="${project.pdf}" target="_blank" rel="noopener noreferrer" class="project-modal-link project-modal-link--pdf"><i data-feather="file-text" class="w-4 h-4"></i> Download PDF</a>` : ''}
                    </div>
                ` : ''}
            </div>
            <div class="project-modal-body">
                <div class="project-modal-section">
                    <h4>Project details</h4>
                    <div class="project-modal-details">${buildDetails(project.details, project.images)}</div>
                </div>
                ${project.impact && project.impact.length ? `
                    <div class="project-modal-section">
                        <h4>Impact metrics</h4>
                        <div class="project-modal-impact-grid">
                            ${buildImpactCards(project.impact)}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
        // Swap detail images for dark mode variants
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        content.querySelectorAll('.project-detail-img.has-dark-variant').forEach(img => {
            const darkSrc = img.getAttribute('data-dark-src');
            const lightSrc = img.src;
            if (!img.dataset.lightSrc) img.dataset.lightSrc = lightSrc;
            if (isDark && darkSrc) img.src = darkSrc;
        });
    };

    const openProjectModal = (project, trigger) => {
        if (!project) return;
        if (modalState.closeTimer) {
            clearTimeout(modalState.closeTimer);
            modalState.closeTimer = null;
        }
        const overlay = ensureProjectModal();
        modalState.activeTrigger = trigger || null;
        const modalCard = overlay.querySelector('.project-modal-card');
        const sourceCard = getSourceCard(trigger);
        modalState.sourceCard = sourceCard || null;

        renderProjectModal(project);
        overlay.classList.remove('is-closing');
        delete overlay.dataset.closing;

        // Align image vertical center with intro container (dates + title)
        // Uses position:relative + top (not transform) because the mobile CSS
        // animation with forwards fill overrides inline transform values.
        const alignImageToTitle = (instant) => {
            const intro = overlay.querySelector('.project-modal-intro');
            const image = overlay.querySelector('.project-modal-image');
            if (!intro || !image) return;
            // Subtract current top offset to get the base (un-shifted) image center
            const currentTop = parseFloat(image.style.top) || 0;
            const introRect = intro.getBoundingClientRect();
            const imageRect = image.getBoundingClientRect();
            const introCenterY = introRect.top + introRect.height / 2;
            const baseImageCenterY = (imageRect.top - currentTop) + imageRect.height / 2;
            const offset = Math.max(0, introCenterY - baseImageCenterY);
            if (instant) {
                image.style.transition = 'none';
                image.style.top = `${offset}px`;
                image.offsetHeight; // force reflow
                image.style.transition = '';
            } else {
                image.style.top = `${offset}px`;
            }
        };

        // Scroll listener: toggle compact header with hysteresis to prevent jitter
        const modalBody = overlay.querySelector('.project-modal-body');
        const modalHeader = overlay.querySelector('.project-modal-header');
        let headerShrinkEnabled = false;

        // Determine if body content is long enough for header shrink to fully complete.
        const checkHeaderShrinkEligibility = () => {
            if (!modalBody || !modalHeader) return false;
            const scrollable = modalBody.scrollHeight - modalBody.clientHeight;
            const headerH = modalHeader.offsetHeight;
            const estimatedGain = headerH * 0.45;
            return scrollable > (80 + estimatedGain);
        };

        if (modalBody && modalHeader) {
            // Re-align image after header transition completes (not mid-animation)
            let alignPending = false;
            modalHeader.addEventListener('transitionend', (e) => {
                if (e.target !== modalHeader || alignPending) return;
                alignPending = true;
                requestAnimationFrame(() => {
                    alignImageToTitle();
                    alignPending = false;
                });
            });

            modalBody.onscroll = () => {
                if (!headerShrinkEnabled) return;
                const st = modalBody.scrollTop;
                if (st > 80 && !modalHeader.classList.contains('is-scrolled')) {
                    modalHeader.classList.add('is-scrolled');
                } else if (st <= 15 && modalHeader.classList.contains('is-scrolled')) {
                    modalHeader.classList.remove('is-scrolled');
                }
            };
        }

        // Position modal at source card, start invisible
        modalCard.style.setProperty('--modal-card-opacity', '0');
        if (sourceCard) {
            applyModalMorphInstant(modalCard, sourceCard);
            sourceCard.classList.add('project-card--morphing');
        }

        setModalScrollbarCompensation(true);
        document.body.classList.add('project-modal-open');
        document.documentElement.classList.add('project-modal-open');
        overlay.classList.add('is-active');
        overlay.setAttribute('aria-hidden', 'false');

        // Crossfade: source card fades out, modal fades in + morphs to center
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (sourceCard) sourceCard.style.opacity = '0';
                modalCard.style.setProperty('--modal-card-opacity', '1');
                modalCard.style.setProperty('--modal-translate-x', '0px');
                modalCard.style.setProperty('--modal-translate-y', '0px');
                modalCard.style.setProperty('--modal-scale-x', '1');
                modalCard.style.setProperty('--modal-scale-y', '1');
                modalCard.style.setProperty('--modal-radius', '1.5rem');
                modalCard.focus({ preventScroll: true });
            });
        });

        // Clean up morphing class after animation completes
        const morphDuration = prefersReducedMotion ? 0 : 420;
        setTimeout(() => {
            if (sourceCard) sourceCard.classList.remove('project-card--morphing');
        }, morphDuration);

        // Align image after ALL animations complete (morph + CSS entrance animations)
        // Mobile entrance animations: image 0.15s delay+0.5s=650ms, intro 0.25s+0.5s=750ms
        const alignDelay = prefersReducedMotion ? 50 : Math.max(morphDuration + 30, 800);
        setTimeout(() => {
            alignImageToTitle(true);
            headerShrinkEnabled = checkHeaderShrinkEligibility();
        }, alignDelay);
    };

    const closeProjectModal = () => {
        if (!modalState.overlay) return;
        const overlay = modalState.overlay;
        if (!overlay.classList.contains('is-active')) {
            modalState.activeTrigger = null;
            return;
        }
        if (overlay.dataset.closing === 'true') return;

        if (modalState.closeTimer) {
            clearTimeout(modalState.closeTimer);
            modalState.closeTimer = null;
        }

        overlay.dataset.closing = 'true';
        const modalCard = overlay.querySelector('.project-modal-card');
        const sourceCard = modalState.sourceCard || getSourceCard(modalState.activeTrigger);

        // Prepare source card for crossfade back in
        if (sourceCard) {
            sourceCard.classList.add('project-card--morphing');
            sourceCard.style.opacity = '0';
            sourceCard.offsetHeight; // force reflow so transition starts from 0
        }

        // Add is-closing (switches to close easing, starts backdrop fade)
        overlay.classList.add('is-closing');

        // Morph modal to card position + fade out, fade source card back in
        requestAnimationFrame(() => {
            if (sourceCard) {
                applyModalMorph(modalCard, sourceCard);
                sourceCard.style.opacity = '1';
            }
            modalCard.style.setProperty('--modal-card-opacity', '0');
        });

        const closeDuration = prefersReducedMotion ? 0 : 420;

        modalState.closeTimer = setTimeout(() => {
            // Full cleanup after animation completes
            overlay.classList.remove('is-active', 'is-closing');
            overlay.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('project-modal-open');
            document.documentElement.classList.remove('project-modal-open');
            setModalScrollbarCompensation(false);
            resetModalMorphInstant(modalCard);
            modalCard.style.setProperty('--modal-card-opacity', '0');

            if (sourceCard) {
                sourceCard.classList.remove('project-card--morphing');
                sourceCard.style.removeProperty('opacity');
            }
            if (modalState.activeTrigger) {
                modalState.activeTrigger.setAttribute('aria-expanded', 'false');
                modalState.activeTrigger.focus({ preventScroll: true });
            }
            modalState.activeTrigger = null;
            modalState.sourceCard = null;
            delete overlay.dataset.closing;
            modalState.closeTimer = null;
        }, closeDuration);
    };

    window.closeProjectModal = closeProjectModal;

    const setupProjectCardReveal = () => {
        ensureProjectModal();
        document.querySelectorAll('.view-link').forEach((link) => {
            if (link.dataset.funRevealBound) return;
            link.dataset.funRevealBound = 'true';
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const card = link.closest('.project-card') || link.closest('.project-list-card') || link.closest('#projectsList > div');
                if (!card) return;
                const project = parseProjectPayload(card);
                if (!project) return;
                link.setAttribute('aria-expanded', 'true');
                openProjectModal(project, link);
            });
        });

        // Mobile: make entire carousel card surface clickable
        const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches
            || ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
        if (isTouchDevice) {
            document.querySelectorAll('#projectsCarousel .project-card').forEach((card) => {
                if (card.dataset.cardTapBound) return;
                card.dataset.cardTapBound = 'true';
                card.style.cursor = 'pointer';
                card.addEventListener('click', (event) => {
                    // Don't intercept if user tapped a link/button directly
                    if (event.target.closest('a, button')) return;
                    // Don't open modal for greyed-out or hidden filtered cards
                    if (card.classList.contains('fun-filter-dim') || card.classList.contains('fun-filter-hidden')) return;
                    const project = parseProjectPayload(card);
                    if (!project) return;
                    const link = card.querySelector('.view-link');
                    if (link) link.setAttribute('aria-expanded', 'true');
                    openProjectModal(project, link || card);
                });
            });
        }
    };

    const updateViewLinks = () => {
        document.querySelectorAll('.view-link').forEach((link) => {
            link.classList.add('fun-view-link');
            setViewLinkHint(link);
            if (!link.hasAttribute('aria-expanded')) {
                link.setAttribute('aria-expanded', 'false');
            }
        });
    };

    window.setupProjectCardReveal = setupProjectCardReveal;
    window.setupProjectFilters = setupProjectFilters;
    window.updateViewLinks = updateViewLinks;

    const brightStarColors = ['', 'star-blue', 'star-pink'];
    let brightStarsCreated = false;

    const createBrightStars = () => {
        if (brightStarsCreated) return;
        brightStarsCreated = true;
        const sections = document.querySelectorAll('.fun-galaxy-section, .fun-star-scatter');
        sections.forEach((section) => {
            const count = 2 + Math.floor(Math.random() * 2); // 2–3 stars per section
            for (let i = 0; i < count; i++) {
                const star = document.createElement('span');
                const colorClass = brightStarColors[Math.floor(Math.random() * brightStarColors.length)];
                star.className = `fun-bright-star${colorClass ? ' ' + colorClass : ''}`;
                star.style.left = `${8 + Math.random() * 84}%`;
                star.style.top = `${8 + Math.random() * 84}%`;
                // Wide range of durations and offsets so each star twinkles independently
                star.style.setProperty('--twinkle-duration', `${5 + Math.random() * 8}s`);
                star.style.setProperty('--twinkle-delay', `${Math.random() * 10}s`);
                star.setAttribute('aria-hidden', 'true');
                section.appendChild(star);
            }
        });
    };

    const removeBrightStars = () => {
        document.querySelectorAll('.fun-bright-star').forEach((star) => star.remove());
        brightStarsCreated = false;
    };

    const setFunMode = (enabled) => {
        document.body.classList.toggle('fun-mode', enabled);
        document.documentElement.classList.toggle('fun-mode-active', enabled); // For Vanta visibility
        updateFunButtons(enabled);
        funElements.forEach((element) => {
            element.setAttribute('aria-hidden', enabled ? 'false' : 'true');
        });
        applyVantaMode(funVantaMode, enabled);
        
        // Apply sub-feature toggles - all controlled by funImmersive
        applySkillAnimations(funImmersive, enabled);
        applySystemConsole(funImmersive, enabled);
        applyExperienceLogs(funImmersive, enabled);

        scheduleShootingStar();
        
        if (enabled) {
            applyStarTextures();
            startAnalystSparkCycle();
            clearFunMessageTimers();
            startFunMessageRotation();
            observeRoverFooter();
            updateRoverVisibility();
            createBrightStars();
            if (typeof AOS !== 'undefined' && AOS.refresh) {
                AOS.refresh();
            }
        } else {
            clearFunMessageTimers();
            stopAnalystSparkCycle();
            stopRoverBuddy();
            removeBrightStars();
            removeStarTextures();
        }
        localStorage.setItem(funModeKey, enabled ? 'on' : 'off');
    };

    funButtons.forEach((button) => {
        const handler = () => {
            const enabled = button.type === 'checkbox'
                ? button.checked
                : !document.body.classList.contains('fun-mode');
            setFunMode(enabled);
            // Ensure localStorage reflects the toggle state
            localStorage.setItem(funModeKey, enabled ? 'on' : 'off');
        };
        if (button.type === 'checkbox') {
            button.addEventListener('change', handler);
        } else {
            button.addEventListener('click', handler);
        }
    });

    // Event listener for unified Immersive toggle
    const immersiveCheck = document.querySelector('[data-fun-immersive]');
    if (immersiveCheck) {
        immersiveCheck.addEventListener('change', (e) => {
            funImmersive = e.target.checked;
            localStorage.setItem('fun_immersive', funImmersive);
            const enabled = document.body.classList.contains('fun-mode');
            applySkillAnimations(funImmersive, enabled);
            applySystemConsole(funImmersive, enabled);
            applyExperienceLogs(funImmersive, enabled);
            e.target.setAttribute('aria-pressed', funImmersive ? 'true' : 'false');
        });
    }

    if (funLabButton && funLabPanel) {
        funLabButton.addEventListener('click', () => {
            const isOpen = funLabPanel.classList.contains('is-open');
            setFunLabOpen(!isOpen);
        });
    }

    if (funLabClose) {
        funLabClose.addEventListener('click', () => setFunLabOpen(false));
    }

    if (roverSelect) {
        roverSelect.addEventListener('change', (event) => {
            funRoverStyle = event.target.value;
            localStorage.setItem(funRoverKey, funRoverStyle);
            updateRoverStyle();
        });
    }

    vantaRadios.forEach((radio) => {
        radio.addEventListener('change', () => {
            if (!radio.checked) return;
            funVantaMode = radio.value;
            localStorage.setItem(funVantaKey, funVantaMode);
            applyVantaMode(funVantaMode, document.body.classList.contains('fun-mode'));
        });
    });

    document.addEventListener('click', (event) => {
        if (!funLabPanel || !funLabButton || !funLabPanel.classList.contains('is-open')) return;
        const wrap = funLabButton.closest('.fun-lab-button-wrap');
        if (funLabPanel.contains(event.target) || (wrap && wrap.contains(event.target)) || funLabButton.contains(event.target)) return;
        setFunLabOpen(false);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            setFunLabOpen(false);
        }
    });

    window.addEventListener('resize', () => {
        if (!roverStates.length) return;
        roverStates.forEach((state) => {
            updateRoverBounds(state);
            if (state.profile.motion === 'ground') {
                state.y = state.floor;
            } else {
                state.y = state.baseY;
            }
            state.baseX = Math.max(8, Math.min(state.baseX, state.maxX));
            state.x = Math.max(8, Math.min(state.x, state.maxX));
            renderRover(state);
        });
    });

    const storedFunMode = localStorage.getItem(funModeKey);
    const shouldFollowConfigDefault = storedFunMode === null;
    const funModeEnabled = shouldFollowConfigDefault
        ? !!window.siteConfig?.settings?.defaultFunMode
        : storedFunMode !== 'off';
    syncFunLabInputs();
    setFunLabOpen(false);
    setupProjectCardReveal(); // Initialize universally
    setFunMode(funModeEnabled);

    document.addEventListener('siteconfig:loaded', () => {
        if (shouldFollowConfigDefault) {
            const configDefault = !!window.siteConfig?.settings?.defaultFunMode;
            if (document.body.classList.contains('fun-mode') !== configDefault) {
                setFunMode(configDefault);
            }
        }

        // Always re-sync immersive effects from CMS config
        const cfgImmersive = window.siteConfig?.settings?.immersiveEffects;
        if (typeof cfgImmersive === 'boolean') {
            funImmersive = cfgImmersive;
            const enabled = document.body.classList.contains('fun-mode');
            applySkillAnimations(funImmersive, enabled);
            applySystemConsole(funImmersive, enabled);
            applyExperienceLogs(funImmersive, enabled);
            syncFunLabInputs();
        }
    });
    
    // Initialize Feather icons
    feather.replace();
    
    // Global setup
    setupStickySectionTitles();
    loadProjects(); // Load dynamic projects
    setupProjectFilters();
    setupProjectCardReveal();
    updateViewLinks();

    // Update active nav states
    updateActiveNavStates();
    setupScrollSpy();
    
    // Load version
    loadVersion();

    // Update footer year
    updateFooterYear();

    // Hero typing effect
    const typingElement = document.getElementById('typing-text');
    if (typingElement) {
        const fullText = typingElement.dataset.text || typingElement.textContent.trim();
        const forceTyping = typingElement.dataset.forceTyping === 'true';
        if (prefersReducedMotion && !forceTyping) {
            typingElement.textContent = fullText;
        } else {
            let index = 0;
            let isDeleting = false;

            const typingRange = { min: 70, max: 130 };
            const deletingRange = { min: 40, max: 90 };
            const hesitationChance = 0.16;
            const hesitationDelay = { min: 120, max: 320 };
            const endPauseRange = { min: 2600, max: 3800 };
            const decisionPauseRange = { min: 700, max: 1200 };
            const restartPauseRange = { min: 600, max: 1000 };

            const addHesitation = () => (
                Math.random() < hesitationChance
                    ? randomBetween(hesitationDelay.min, hesitationDelay.max)
                    : 0
            );

            const tick = () => {
                if (!isDeleting) {
                    index = Math.min(index + 1, fullText.length);
                    typingElement.textContent = fullText.slice(0, index);
                    if (index === fullText.length) {
                        const hold = randomBetween(endPauseRange.min, endPauseRange.max);
                        const decision = randomBetween(decisionPauseRange.min, decisionPauseRange.max);
                        setTimeout(() => {
                            isDeleting = true;
                            setTimeout(tick, decision);
                        }, hold);
                        return;
                    }
                    const delay = randomBetween(typingRange.min, typingRange.max) + addHesitation();
                    setTimeout(tick, delay);
                } else {
                    index = Math.max(index - 1, 0);
                    typingElement.textContent = fullText.slice(0, index);
                    if (index === 0) {
                        isDeleting = false;
                        const restart = randomBetween(restartPauseRange.min, restartPauseRange.max);
                        setTimeout(tick, restart);
                        return;
                    }
                    const delay = randomBetween(deletingRange.min, deletingRange.max) + addHesitation() / 2;
                    setTimeout(tick, delay);
                }
            };

            typingElement.textContent = '';
            setTimeout(tick, randomBetween(400, 900));
        }
    }
    
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
    
    // Fix mailto: links on mobile — prevent email clients from using anchor text as display name
    document.addEventListener('click', (e) => {
        const mailLink = e.target.closest('a[href^="mailto:"]');
        if (!mailLink) return;
        e.preventDefault();
        const email = mailLink.getAttribute('href').replace('mailto:', '').split('?')[0];
        window.location.href = 'mailto:' + encodeURIComponent(email).replace(/%40/g, '@');
    });

    // Carousel loading animation fix
    const carousel = document.getElementById('projectsCarousel');
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
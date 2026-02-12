/* ===== SITE LOADER — CMS-driven dynamic content & section visibility ===== */
(function () {
    'use strict';

    const JSON_BASE = window.location.pathname.includes('projects.html') ? '' : '';
    const SECTION_MAP = {
        hero:         '#intro',
        about:        '#about',
        skills:       '#skills',
        experience:   '#experience',
        projects:     '#projects',
        process:      '#process',
        testimonials: '#testimonials',
        contact:      '#contact'
    };

    const NAV_HREFS = {
        hero:         ['index.html', 'index.html#intro', '#intro', '#'],
        about:        ['index.html#about', '#about'],
        skills:       ['index.html#skills', '#skills'],
        experience:   ['index.html#experience', '#experience'],
        projects:     ['projects.html', 'index.html#projects', '#projects'],
        process:      ['index.html#process', '#process'],
        testimonials: ['index.html#testimonials', '#testimonials'],
        contact:      ['index.html#contact', '#contact']
    };

    /* ── Helpers ── */
    function fetchJSON(path) {
        const cacheBust = path + (path.includes('?') ? '&' : '?') + '_v=' + Date.now();
        return fetch(cacheBust).then(r => r.ok ? r.json() : null).catch(() => null);
    }

    function escapeHTML(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    function buildEmailLink(email) {
        return `<a href="mailto:${escapeHTML(email)}" class="contact-email-text">${escapeHTML(email)}</a>`;
    }

    function buildLocationLink(location) {
        const q = encodeURIComponent(location + ', Canada');
        return `<a href="https://www.google.com/maps/search/${q}" class="contact-location-text" target="_blank" rel="noopener noreferrer">${escapeHTML(location)}</a>`;
    }

    /* ── Section Visibility ── */
    function applySectionVisibility(sections) {
        if (!sections) return;
        Object.keys(sections).forEach(key => {
            const visible = sections[key];
            const sel = SECTION_MAP[key];
            if (!sel) return;
            const el = document.querySelector(sel);
            if (el) {
                el.style.display = visible ? '' : 'none';
                el.setAttribute('data-section-visible', visible ? 'true' : 'false');
            }
            if (!visible) {
                const hrefs = NAV_HREFS[key] || [];
                document.querySelectorAll('nav a, .mobile-menu a, #mobile-menu a').forEach(link => {
                    const h = link.getAttribute('href');
                    if (hrefs.some(ref => h === ref || h.endsWith(ref))) {
                        link.style.display = 'none';
                    }
                });
            }
        });
    }

    /* ── Vanta Settings ── */
    function applyVantaSettings(vanta) {
        if (!vanta) return;
        if (vanta.mode === 'off') {
            document.documentElement.style.setProperty('--vanta-opacity', '0');
            if (window.vantaEffect) { window.vantaEffect.destroy(); window.vantaEffect = null; }
        } else if (vanta.mode === 'dim') {
            document.documentElement.style.setProperty('--vanta-opacity', String(vanta.opacity * 0.4));
        } else {
            document.documentElement.style.setProperty('--vanta-opacity', String(vanta.opacity));
        }
    }

    /* ── Hero Renderer ── */
    function renderHero(data) {
        if (!data) return;
        const section = document.querySelector('#intro');
        if (!section) return;

        const typingEl = section.querySelector('#typing-text');
        if (typingEl) {
            typingEl.setAttribute('data-text', data.title);
            typingEl.textContent = data.title;
        }

        const subtitleEl = section.querySelector('h2');
        if (subtitleEl) subtitleEl.textContent = data.subtitle;

        const badge = section.querySelector('.availability-badge');
        if (badge) {
            const dot = badge.querySelector('.availability-dot');
            badge.textContent = '';
            if (dot) badge.appendChild(dot);
            badge.appendChild(document.createTextNode(' ' + data.availabilityText));
        }

        const resumeLink = section.querySelector('.resume-link');
        if (resumeLink && data.resumePath) resumeLink.setAttribute('href', data.resumePath);

        const portrait = section.querySelector('.hero-portrait-img');
        if (portrait && data.profileImage) {
            portrait.setAttribute('src', data.profileImage);
        }

        const intro = section.querySelector('.hero-content > div > div > p.text-lg');
        if (!intro) {
            const ps = section.querySelectorAll('.hero-content p');
            ps.forEach(p => {
                if (p.classList.contains('text-lg')) p.textContent = data.introText;
            });
        } else {
            intro.textContent = data.introText;
        }

        const tagsContainer = section.querySelector('.hero-tags');
        if (tagsContainer && data.heroTags) {
            tagsContainer.innerHTML = data.heroTags.map(t =>
                `<span class="px-3 py-1 rounded-full bg-white/10 border border-white/20">${escapeHTML(t)}</span>`
            ).join('');
        }

        const btns = section.querySelectorAll('.hero-actions a');
        if (btns.length >= 1 && data.primaryCTA) {
            btns[0].textContent = data.primaryCTA.text;
            btns[0].setAttribute('href', data.primaryCTA.href);
        }
        if (btns.length >= 2 && data.secondaryCTA) {
            btns[1].textContent = data.secondaryCTA.text;
            btns[1].setAttribute('href', data.secondaryCTA.href);
        }
    }

    /* ── About Renderer ── */
    function renderAbout(data) {
        if (!data) return;
        const section = document.querySelector('#about');
        if (!section) return;

        const title = section.querySelector('.section-title-container h2');
        if (title) title.textContent = data.sectionTitle || 'About Me';

        const summaryContainer = section.querySelector('[data-aos="fade-right"]');
        if (summaryContainer && data.professionalSummary) {
            const ps = summaryContainer.querySelectorAll('p.text-gray-600');
            data.professionalSummary.forEach((text, i) => {
                if (ps[i]) ps[i].textContent = text;
            });
        }

        const eduContainer = section.querySelector('.space-y-6');
        if (eduContainer && data.education) {
            eduContainer.innerHTML = data.education.map(e => `
                <div>
                    <h4 class="font-medium">${escapeHTML(e.degree)}</h4>
                    <p class="text-gray-600">${escapeHTML(e.institution)} &bull; ${escapeHTML(e.year)}</p>
                </div>
            `).join('');
        }

        if (data.additionalExperience) {
            const addExp = section.querySelector('.border-t.border-gray-200 p');
            if (addExp) addExp.textContent = data.additionalExperience;
        }
    }

    /* ── Skills Renderer ── */
    function renderSkills(data) {
        if (!data) return;
        const section = document.querySelector('#skills');
        if (!section) return;

        const title = section.querySelector('.section-title-container h2');
        if (title) title.textContent = data.sectionTitle || 'My Skills';

        const grid = section.querySelector('.grid.md\\:grid-cols-2.lg\\:grid-cols-3');
        if (grid && data.categories) {
            grid.innerHTML = data.categories.map((cat, i) => `
                <div data-aos="fade-up" ${i > 0 ? `data-aos-delay="${i * 100}"` : ''} class="skill-card bg-white p-6 rounded-xl shadow-md transition duration-300">
                    <div class="flex items-center mb-4">
                        <div class="p-3 bg-indigo-100 rounded-full mr-4">
                            <i data-feather="${escapeHTML(cat.icon)}" class="text-indigo-600"></i>
                        </div>
                        <h3 class="text-lg font-bold">${escapeHTML(cat.title)}</h3>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        ${cat.items.map(item => `<span class="px-3 py-1 bg-gray-100 rounded-full text-sm">${escapeHTML(item)}</span>`).join('')}
                    </div>
                </div>
            `).join('');
            if (typeof feather !== 'undefined') feather.replace();
        }
    }

    /* ── Experience Renderer ── */
    function renderExperience(data) {
        if (!data) return;
        const section = document.querySelector('#experience');
        if (!section) return;

        const title = section.querySelector('.section-title-container h2');
        if (title) title.textContent = data.sectionTitle || 'Work Experience';

        const container = section.querySelector('.space-y-8');
        if (container && data.entries) {
            container.innerHTML = data.entries.map((exp, i) => `
                <div data-aos="fade-up" ${i > 0 ? `data-aos-delay="${i * 100}"` : ''} class="experience-item relative">
                    <div class="experience-card" style="--experience-image: url('${exp.backgroundImage || ''}'); --experience-inset-image: url('${exp.insetImage || ''}');">
                        <div class="experience-card-content">
                            <div>
                                <h3 class="experience-title">${escapeHTML(exp.title)}</h3>
                                <p class="experience-meta">${escapeHTML(exp.company)} - ${escapeHTML(exp.location)} &bull; ${escapeHTML(exp.period)}</p>
                                <p class="experience-summary"><span class="experience-summary-title">Focus:</span> ${escapeHTML(exp.focus)}</p>
                                <p class="experience-bullet-title">Key outcomes</p>
                                <ul class="experience-list">
                                    ${exp.outcomes.map(o => `<li>${escapeHTML(o)}</li>`).join('')}
                                </ul>
                                ${exp.logLine ? `<div class="experience-log" data-fun-element aria-hidden="true">
                                    <span class="log-label">System log</span>
                                    <span class="log-line">${escapeHTML(exp.logLine)}</span>
                                </div>` : ''}
                            </div>
                        </div>
                        <div class="experience-inset" aria-hidden="true" style="background-image: url('${exp.insetImage || ''}');"></div>
                    </div>
                </div>
            `).join('');
        }
    }

    /* ── Process Renderer ── */
    function renderProcess(data) {
        if (!data) return;
        const section = document.querySelector('#process');
        if (!section) return;

        const title = section.querySelector('.section-title-container h2');
        if (title) title.textContent = data.sectionTitle || 'Process & Services';

        const subtitle = section.querySelector('.section-title-container + p');
        if (subtitle && data.subtitle) subtitle.textContent = data.subtitle;

        const grid = section.querySelector('.process-grid');
        if (grid && data.steps) {
            grid.innerHTML = data.steps.map((step, i) => `
                <div data-aos="fade-up" ${i > 0 ? `data-aos-delay="${i * 100}"` : ''} class="process-card">
                    <div class="process-icon" aria-hidden="true">
                        <i data-feather="${escapeHTML(step.icon)}"></i>
                    </div>
                    <h3>${escapeHTML(step.title)}</h3>
                    <p>${escapeHTML(step.description)}</p>
                    <ul class="process-list">
                        ${step.items.map(item => `<li>${escapeHTML(item)}</li>`).join('')}
                    </ul>
                </div>
            `).join('');
            if (typeof feather !== 'undefined') feather.replace();
        }

        const tagsContainer = section.querySelector('.process-tags');
        if (tagsContainer && data.tags) {
            tagsContainer.innerHTML = data.tags.map(tag =>
                `<span class="process-tag">${escapeHTML(tag)}</span>`
            ).join('');
        }
    }

    /* ── Testimonials Renderer ── */
    function renderTestimonials(data) {
        if (!data) return;
        const section = document.querySelector('#testimonials');
        if (!section) return;

        const title = section.querySelector('.section-title-container h2');
        if (title) title.textContent = data.sectionTitle || 'Testimonials';

        const subtitle = section.querySelector('.section-title-container + p');
        if (subtitle && data.subtitle) subtitle.textContent = data.subtitle;

        const grid = section.querySelector('.testimonial-grid');
        if (grid && data.entries) {
            grid.innerHTML = data.entries.map((t, i) => `
                <figure data-aos="fade-up" ${i > 0 ? `data-aos-delay="${i * 150}"` : ''} class="testimonial-card">
                    <div class="testimonial-quote">
                        <span class="testimonial-mark" aria-hidden="true">&ldquo;</span>
                        <p class="testimonial-text">${escapeHTML(t.quote)}</p>
                    </div>
                    <figcaption class="testimonial-author">
                        <div class="testimonial-avatar" aria-hidden="true">${escapeHTML(t.initial)}</div>
                        <div>
                            <div class="testimonial-name">${escapeHTML(t.name)}</div>
                            <div class="testimonial-role">${escapeHTML(t.role)}</div>
                        </div>
                    </figcaption>
                </figure>
            `).join('');
        }
    }

    /* ── Contact Renderer ── */
    function renderContact(data) {
        if (!data) return;
        const section = document.querySelector('#contact');
        if (!section) return;

        const title = section.querySelector('.section-title-container h2');
        if (title) title.textContent = data.sectionTitle || 'Get In Touch';

        const heading = section.querySelector('h3.text-2xl');
        if (heading && data.heading) heading.textContent = data.heading;

        const subtitle = section.querySelector('p.text-gray-600.mb-8');
        if (subtitle && data.subtitle) subtitle.textContent = data.subtitle;

        if (data.emails) {
            const emailBlock = section.querySelector('.contact-email-block');
            if (emailBlock) {
                emailBlock.innerHTML = data.emails.map((em, i) => `
                    <div class="contact-email-line ${i > 0 ? 'contact-email-line--secondary' : ''}">
                        <span class="contact-email-label">${escapeHTML(em.label)}</span>
                        ${buildEmailLink(em.address)}
                    </div>
                `).join('');
            }
        }

        if (data.location) {
            const locEl = section.querySelector('.flex.items-center:last-of-type .contact-location-text');
            if (locEl) {
                const q = encodeURIComponent(data.location + ', Canada');
                locEl.href = 'https://www.google.com/maps/search/' + q;
                locEl.textContent = data.location;
            }
        }

        if (data.socialLinks) {
            const socials = section.querySelector('.contact-socials');
            if (socials) {
                socials.innerHTML = data.socialLinks.map(s =>
                    `<a href="${escapeHTML(s.url)}" class="contact-social-btn" aria-label="${escapeHTML(s.label)}">
                        <i data-feather="${escapeHTML(s.platform)}" class="text-gray-700"></i>
                    </a>`
                ).join('');
                if (typeof feather !== 'undefined') feather.replace();
            }
        }

        if (data.formAction) {
            const form = section.querySelector('#contactForm');
            if (form) form.setAttribute('action', data.formAction);
        }
    }

    /* ── Footer Renderer ── */
    function renderFooter(data) {
        if (!data) return;
        const footer = document.querySelector('footer');
        if (!footer) return;

        const titleEl = footer.querySelector('h2');
        if (titleEl && data.title) titleEl.textContent = data.title;

        const tagline = footer.querySelector('p.text-gray-400');
        if (tagline && data.tagline) tagline.textContent = data.tagline;

        if (data.socialLinks) {
            const socialsContainer = footer.querySelector('.flex.justify-center.space-x-6');
            if (socialsContainer) {
                socialsContainer.innerHTML = data.socialLinks.map(s =>
                    `<a href="${escapeHTML(s.url)}" class="text-gray-400 hover:text-white transition" target="_blank" rel="noopener" aria-label="${escapeHTML(s.label)}">
                        <i data-feather="${escapeHTML(s.platform)}"></i>
                    </a>`
                ).join('');
                if (typeof feather !== 'undefined') feather.replace();
            }
        }

        if (data.copyrightText) {
            const copy = footer.querySelector('.text-gray-500.text-sm');
            if (copy) {
                const year = new Date().getFullYear();
                copy.innerHTML = `&copy; ${year} ${escapeHTML(data.copyrightText)}`;
            }
        }
    }

    /* ── Fun Mode CMS Defaults ── */
    function applyFunModeDefaults(settings) {
        if (!settings) return;
        if (settings.roverStyle && !localStorage.getItem('fun-rover-style')) {
            localStorage.setItem('fun-rover-style', settings.roverStyle);
        }
        if (typeof settings.immersiveEffects === 'boolean' && localStorage.getItem('fun_immersive') === null) {
            localStorage.setItem('fun_immersive', String(settings.immersiveEffects));
        }
        if (settings.defaultFunVantaMode && !localStorage.getItem('fun-vanta-mode')) {
            localStorage.setItem('fun-vanta-mode', settings.defaultFunVantaMode);
        }
    }

    /* ── Main Loader ── */
    async function loadSiteContent() {
        const isIndex = !window.location.pathname.includes('projects.html');
        if (!isIndex) return;

        const [config, hero, about, skills, experience, process, testimonials, contact, footerData] = await Promise.all([
            fetchJSON('js/config.json'),
            fetchJSON('js/hero.json'),
            fetchJSON('js/about.json'),
            fetchJSON('js/skills.json'),
            fetchJSON('js/experience.json'),
            fetchJSON('js/process.json'),
            fetchJSON('js/testimonials.json'),
            fetchJSON('js/contact.json'),
            fetchJSON('js/footer.json')
        ]);

        if (config && config.settings) {
            applySectionVisibility(config.settings.sections);
            applyVantaSettings(config.settings.vanta);
            applyFunModeDefaults(config.settings);
        }

        renderHero(hero);
        renderAbout(about);
        renderSkills(skills);
        renderExperience(experience);
        renderProcess(process);
        renderTestimonials(testimonials);
        renderContact(contact);
        renderFooter(footerData);

        if (typeof feather !== 'undefined') feather.replace();
        if (typeof AOS !== 'undefined') setTimeout(() => AOS.refresh(), 150);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadSiteContent);
    } else {
        loadSiteContent();
    }
})();

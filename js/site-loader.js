/* ===== SITE LOADER — CMS-driven dynamic content & section visibility ===== */
(function () {
    'use strict';

    const SECTION_MAP = {
        hero:         '#intro',
        about:        '#about',
        skills:       '#skills',
        toolsPlatforms:'#tools-platforms',
        scriptLibrary:'#script-library',
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
        toolsPlatforms:['index.html#tools-platforms', '#tools-platforms'],
        scriptLibrary:['index.html#script-library', '#script-library'],
        experience:   ['index.html#experience', '#experience'],
        projects:     ['projects.html', 'index.html#projects', '#projects'],
        process:      ['index.html#process', '#process'],
        testimonials: ['index.html#testimonials', '#testimonials'],
        contact:      ['index.html#contact', '#contact']
    };

    const DEFAULT_SECTION_ORDER = [
        'hero',
        'about',
        'experience',
        'projects',
        'skills',
        'toolsPlatforms',
        'scriptLibrary',
        'process',
        'testimonials',
        'contact'
    ];

    const DEFAULT_NAV_ORDER = [
        'hero',
        'about',
        'experience',
        'projects',
        'skills',
        'toolsPlatforms',
        'scriptLibrary',
        'process',
        'testimonials',
        'contact'
    ];

    const DEFAULT_PRIMARY_NAV_ORDER = ['hero', 'about', 'experience', 'projects'];
    const DEFAULT_SECONDARY_NAV_ORDER = ['skills', 'toolsPlatforms', 'scriptLibrary', 'process', 'testimonials'];
    const SCROLL_RESTORE_STORAGE_KEY = 'site-scroll-positions-v1';

    const BUILTIN_NAV_ITEMS = {
        hero: {
            key: 'hero',
            label: 'Home',
            group: 'primary',
            sectionKey: 'hero',
            indexHref: 'index.html',
            projectsHref: 'index.html'
        },
        about: {
            key: 'about',
            label: 'About',
            group: 'primary',
            sectionKey: 'about',
            indexHref: 'index.html#about',
            projectsHref: 'index.html#about'
        },
        experience: {
            key: 'experience',
            label: 'Experience',
            group: 'primary',
            sectionKey: 'experience',
            indexHref: 'index.html#experience',
            projectsHref: 'index.html#experience'
        },
        projects: {
            key: 'projects',
            label: 'Projects',
            group: 'primary',
            sectionKey: 'projects',
            indexHref: 'projects.html',
            projectsHref: 'projects.html'
        },
        skills: {
            key: 'skills',
            label: 'Skills',
            group: 'secondary',
            sectionKey: 'skills',
            indexHref: 'index.html#skills',
            projectsHref: 'index.html#skills'
        },
        toolsPlatforms: {
            key: 'toolsPlatforms',
            label: 'Tools',
            group: 'secondary',
            sectionKey: 'toolsPlatforms',
            indexHref: 'index.html#tools-platforms',
            projectsHref: 'index.html#tools-platforms'
        },
        scriptLibrary: {
            key: 'scriptLibrary',
            label: 'Scripts',
            group: 'secondary',
            sectionKey: 'scriptLibrary',
            indexHref: 'index.html#script-library',
            projectsHref: 'index.html#script-library'
        },
        process: {
            key: 'process',
            label: 'Services',
            group: 'secondary',
            sectionKey: 'process',
            indexHref: 'index.html#process',
            projectsHref: 'index.html#process'
        },
        testimonials: {
            key: 'testimonials',
            label: 'Testimonials',
            group: 'secondary',
            sectionKey: 'testimonials',
            indexHref: 'index.html#testimonials',
            projectsHref: 'index.html#testimonials'
        }
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

    function normalizeOrderEntry(entry) {
        if (typeof entry === 'string') return entry.trim();
        if (!entry || typeof entry !== 'object') return '';
        if (typeof entry.section === 'string') return entry.section.trim();
        if (typeof entry.item === 'string') return entry.item.trim();
        const firstString = Object.values(entry).find(value => typeof value === 'string');
        return firstString ? firstString.trim() : '';
    }

    function resolveOrder(rawOrder, fallback) {
        const allowedKeys = new Set(Object.keys(SECTION_MAP));
        const normalized = Array.isArray(rawOrder)
            ? rawOrder.map(normalizeOrderEntry).filter(Boolean)
            : [];
        const resolved = [];

        normalized.forEach((key) => {
            if (allowedKeys.has(key) && !resolved.includes(key)) {
                resolved.push(key);
            }
        });

        (Array.isArray(fallback) ? fallback : []).forEach((key) => {
            if (allowedKeys.has(key) && !resolved.includes(key)) {
                resolved.push(key);
            }
        });

        return resolved;
    }

    function normalizeNavKey(entry) {
        if (typeof entry === 'string') return entry.trim();
        if (!entry || typeof entry !== 'object') return '';
        if (typeof entry.key === 'string') return entry.key.trim();
        return normalizeOrderEntry(entry);
    }

    function resolveNavOrder(rawOrder, fallback, allowedKeys) {
        const normalized = Array.isArray(rawOrder)
            ? rawOrder.map(normalizeNavKey).filter(Boolean)
            : [];
        const resolved = [];

        normalized.forEach((key) => {
            if (allowedKeys.has(key) && !resolved.includes(key)) {
                resolved.push(key);
            }
        });

        (Array.isArray(fallback) ? fallback : []).forEach((key) => {
            if (allowedKeys.has(key) && !resolved.includes(key)) {
                resolved.push(key);
            }
        });

        return resolved;
    }

    function normalizeCustomNavItems(rawItems) {
        if (!Array.isArray(rawItems)) return [];
        return rawItems
            .map((item) => {
                if (!item || typeof item !== 'object') return null;
                const key = typeof item.key === 'string' ? item.key.trim() : '';
                if (!key) return null;
                const label = typeof item.label === 'string' && item.label.trim() ? item.label.trim() : key;
                const indexHref = typeof item.indexHref === 'string' ? item.indexHref.trim() : '';
                if (!indexHref) return null;
                const projectsHref = typeof item.projectsHref === 'string' ? item.projectsHref.trim() : '';
                const group = item.group === 'primary' ? 'primary' : 'secondary';
                return {
                    key,
                    label,
                    group,
                    sectionKey: '',
                    indexHref,
                    projectsHref,
                    openInNewTab: !!item.openInNewTab,
                    isCustom: true
                };
            })
            .filter(Boolean);
    }

    function getNavItemLabel(item, fallbackKey) {
        if (item && typeof item.label === 'string' && item.label.trim()) {
            return item.label.trim();
        }
        return fallbackKey || '';
    }

    function getNavItemHref(item, isProjectsPage) {
        if (!item) return '#';
        const indexHref = typeof item.indexHref === 'string' ? item.indexHref.trim() : '';
        const projectsHref = typeof item.projectsHref === 'string' ? item.projectsHref.trim() : '';

        if (isProjectsPage) {
            const projectsTarget = projectsHref || indexHref;
            if (projectsTarget.startsWith('#')) {
                return `index.html${projectsTarget}`;
            }
            return projectsTarget || '#';
        }

        return indexHref || projectsHref || '#';
    }

    function buildNavigationCatalog(settings) {
        const catalog = new Map();
        Object.keys(BUILTIN_NAV_ITEMS).forEach((key) => {
            catalog.set(key, { ...BUILTIN_NAV_ITEMS[key], key, isCustom: false, openInNewTab: false });
        });
        normalizeCustomNavItems(settings && settings.customNavItems).forEach((item) => {
            catalog.set(item.key, item);
        });
        return catalog;
    }

    function isSectionVisibleForNav(sectionKey) {
        if (!sectionKey || sectionKey === 'projects') return true;
        const visibility = window.__siteSectionVisibility;
        if (!visibility || typeof visibility !== 'object') return true;
        if (!Object.prototype.hasOwnProperty.call(visibility, sectionKey)) return true;
        return visibility[sectionKey] !== false;
    }

    function applyNavAnchorState(anchor, item, isProjectsPage, options = {}) {
        if (!anchor || !item) return;
        const label = getNavItemLabel(item, item.key);
        const href = getNavItemHref(item, isProjectsPage);
        anchor.setAttribute('href', href);
        anchor.setAttribute('data-nav-key', item.key);

        if (item.openInNewTab) {
            anchor.setAttribute('target', '_blank');
            anchor.setAttribute('rel', 'noopener noreferrer');
        } else {
            anchor.removeAttribute('target');
            anchor.removeAttribute('rel');
        }

        if (!options.preserveText) {
            const textSpan = anchor.querySelector('.nav-link-text');
            if (textSpan) {
                textSpan.textContent = label;
            } else {
                anchor.textContent = label;
            }
        }
    }

    function createPrimaryNavLink(item, isMobile) {
        const link = document.createElement('a');
        link.className = isMobile
            ? 'nav-link text-gray-700 transition relative nav-item-generated'
            : 'nav-link text-gray-700 transition relative nav-item-generated';
        link.setAttribute('data-nav-key', item.key);
        return link;
    }

    function updatePrimaryNavNode(node, item, isProjectsPage) {
        if (!node || !item) return;
        node.style.display = '';

        if (node.matches('a')) {
            applyNavAnchorState(node, item, isProjectsPage);
            return;
        }

        const nestedProjectsLink = node.querySelector('#nav-projects-link');
        if (nestedProjectsLink) {
            applyNavAnchorState(nestedProjectsLink, item, isProjectsPage);
            return;
        }

        const nestedAnchor = node.querySelector('a[href]');
        if (nestedAnchor) {
            applyNavAnchorState(nestedAnchor, item, isProjectsPage);
        }
    }

    function syncPrimaryNavContainer(container, primaryKeys, catalog, isProjectsPage, isMobile) {
        if (!container) return;

        const initialChildren = Array.from(container.children);
        const existingByKey = new Map();

        initialChildren.forEach((child) => {
            const key = child.getAttribute('data-nav-key');
            if (key && !existingByKey.has(key)) {
                existingByKey.set(key, child);
            }
        });

        const usedNodes = new Set();

        primaryKeys.forEach((key) => {
            const item = catalog.get(key);
            if (!item) return;
            if (item.sectionKey && !isSectionVisibleForNav(item.sectionKey)) return;

            let node = existingByKey.get(key);
            if (!node) {
                if (!isMobile && key === 'projects') return;
                node = createPrimaryNavLink(item, isMobile);
            }

            updatePrimaryNavNode(node, item, isProjectsPage);
            container.appendChild(node);
            usedNodes.add(node);
        });

        Array.from(container.children).forEach((child) => {
            if (usedNodes.has(child)) return;
            if (child.classList.contains('nav-item-generated')) {
                child.remove();
            } else {
                child.style.display = 'none';
            }
        });
    }

    function getFixedNavOffset() {
        const nav = document.querySelector('nav[aria-label="Main navigation"]');
        if (!nav) return 0;
        const height = nav.getBoundingClientRect().height;
        return Number.isFinite(height) ? height + 12 : 0;
    }

    function getNavigationType() {
        if (typeof performance === 'undefined' || typeof performance.getEntriesByType !== 'function') {
            return '';
        }
        const entry = performance.getEntriesByType('navigation')[0];
        return entry && typeof entry.type === 'string' ? entry.type : '';
    }

    function getScrollRestorePageKey() {
        const path = window.location.pathname || '/';
        const query = window.location.search || '';
        return `${path}${query}`;
    }

    function readScrollRestoreMap() {
        try {
            const raw = sessionStorage.getItem(SCROLL_RESTORE_STORAGE_KEY);
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch (_) {
            return {};
        }
    }

    function writeScrollRestoreMap(store) {
        try {
            sessionStorage.setItem(SCROLL_RESTORE_STORAGE_KEY, JSON.stringify(store));
        } catch (_) {
            // Ignore storage quota/privacy-mode failures.
        }
    }

    function saveCurrentScrollPosition() {
        const pageKey = getScrollRestorePageKey();
        if (!pageKey) return;
        const top = Math.max(0, Math.round(window.scrollY || window.pageYOffset || 0));
        const store = readScrollRestoreMap();
        store[pageKey] = top;
        writeScrollRestoreMap(store);
    }

    function shouldRestoreSavedScrollPosition() {
        if (window.location.hash) return false;
        const navigationType = getNavigationType();
        return navigationType === 'reload' || navigationType === 'back_forward';
    }

    function getSavedScrollPosition() {
        const pageKey = getScrollRestorePageKey();
        if (!pageKey) return null;
        const store = readScrollRestoreMap();
        const value = store[pageKey];
        return Number.isFinite(value) ? value : null;
    }

    function scheduleSavedScrollRestore(top) {
        if (!Number.isFinite(top)) return;
        const attempts = [0, 120, 300, 650];
        attempts.forEach((delay) => {
            window.setTimeout(() => {
                window.scrollTo(0, Math.max(0, top));
            }, delay);
        });
    }

    function realignHashTargetForFixedNav() {
        const hash = window.location.hash || '';
        if (!hash || hash === '#') return;

        const targetId = decodeURIComponent(hash.slice(1));
        if (!targetId) return;

        const target = document.getElementById(targetId);
        if (!target || target.getAttribute('data-section-visible') === 'false') return;

        const targetTop = target.getBoundingClientRect().top + window.scrollY - getFixedNavOffset();
        window.scrollTo({
            top: Math.max(0, targetTop),
            behavior: 'auto'
        });
    }

    function scheduleHashRealign() {
        if (!window.location.hash) return;
        requestAnimationFrame(() => {
            realignHashTargetForFixedNav();
            window.setTimeout(realignHashTargetForFixedNav, 180);
        });
    }

    window.addEventListener('pagehide', saveCurrentScrollPosition, { capture: true });
    window.addEventListener('beforeunload', saveCurrentScrollPosition, { capture: true });

    function buildSecondaryDropdownLink(item, isProjectsPage, isMobile) {
        const link = document.createElement('a');
        link.setAttribute('data-nav-key', item.key);

        if (isMobile) {
            link.className = 'nav-link text-gray-700 transition relative mobile-secondary-item';
        } else {
            link.className = 'secondary-dropdown-link flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium transition-colors rounded-lg mx-2';
        }

        applyNavAnchorState(link, item, isProjectsPage);
        return link;
    }

    function animateNavTextSwap(node, nextText, animate) {
        if (!node) return;
        if (!animate || node.textContent === nextText) {
            node.textContent = nextText;
            return;
        }

        const activeTimer = Number(node.dataset.morphTimer || '0');
        if (activeTimer) {
            window.clearTimeout(activeTimer);
        }

        node.classList.add('morphing');
        const timer = window.setTimeout(() => {
            node.textContent = nextText;
            node.classList.remove('morphing');
            node.dataset.morphTimer = '';
        }, 130);
        node.dataset.morphTimer = String(timer);
    }

    function renderSecondaryDropdownList(listNode, keys, currentKey, catalog, isProjectsPage, isMobile) {
        if (!listNode) return;
        listNode.innerHTML = '';

        let rendered = 0;
        keys
            .filter((key) => key !== currentKey)
            .forEach((key) => {
                const item = catalog.get(key);
                if (!item) return;
                const link = buildSecondaryDropdownLink(item, isProjectsPage, isMobile);
                listNode.appendChild(link);
                rendered += 1;
            });

        return rendered;
    }

    function setSecondaryNavCurrentKey(nextKey, options = {}) {
        const state = window.__siteSecondaryNavState;
        if (!state || !Array.isArray(state.keys) || !state.keys.length) return false;
        if (!state.keys.includes(nextKey)) return false;
        if (!options.force && state.currentKey === nextKey) return true;

        const item = state.catalog.get(nextKey);
        if (!item) return false;

        const animate = options.animate === true;
        state.currentKey = nextKey;
        window.__siteSecondaryNavCurrentKey = nextKey;

        const desktopLink = document.getElementById('nav-secondary-primary-link');
        const desktopText = document.getElementById('nav-secondary-primary-text');
        const mobileLink = document.getElementById('mobile-secondary-primary-link');
        const mobileText = document.getElementById('mobile-secondary-primary-text');

        if (desktopLink) {
            const desktopLabel = getNavItemLabel(item, item.key);
            applyNavAnchorState(desktopLink, item, state.isProjectsPage, { preserveText: true });
            desktopLink.setAttribute('data-secondary-current-key', nextKey);
            if (desktopText) animateNavTextSwap(desktopText, desktopLabel, animate);
        }

        if (mobileLink) {
            const mobileLabel = getNavItemLabel(item, item.key);
            applyNavAnchorState(mobileLink, item, state.isProjectsPage, { preserveText: true });
            mobileLink.setAttribute('data-secondary-current-key', nextKey);
            if (mobileText) animateNavTextSwap(mobileText, mobileLabel, animate);
        }

        const desktopCount = renderSecondaryDropdownList(
            document.getElementById('nav-secondary-dropdown-list'),
            state.keys,
            nextKey,
            state.catalog,
            state.isProjectsPage,
            false
        );
        const mobileCount = renderSecondaryDropdownList(
            document.getElementById('mobile-secondary-dropdown-list'),
            state.keys,
            nextKey,
            state.catalog,
            state.isProjectsPage,
            true
        );

        const desktopDropdown = document.getElementById('nav-secondary-dropdown');
        if (desktopDropdown) {
            desktopDropdown.style.display = desktopCount > 0 ? '' : 'none';
        }

        const mobileDetails = document.getElementById('mobile-secondary-details');
        if (mobileDetails) {
            mobileDetails.style.display = mobileCount > 0 ? '' : 'none';
            if (mobileCount <= 0) mobileDetails.open = false;
        }

        return true;
    }

    function applySecondaryNavigation(secondaryKeys, catalog, isProjectsPage) {
        const desktopShell = document.getElementById('desktop-secondary-nav');
        const mobileShell = document.getElementById('mobile-secondary-nav');
        const hasSecondary = secondaryKeys.length > 0;

        if (desktopShell) desktopShell.style.display = hasSecondary ? '' : 'none';
        if (mobileShell) mobileShell.style.display = hasSecondary ? '' : 'none';

        if (!hasSecondary) {
            window.__siteSecondaryNavState = { keys: [], currentKey: '', catalog: new Map(), isProjectsPage };
            window.__siteSecondaryNavOrder = [];
            window.__siteSecondaryNavDefaultKey = '';
            window.__siteSecondaryNavCurrentKey = '';
            window.__setSecondaryNavCurrentKey = () => false;
            return;
        }

        const current = window.__siteSecondaryNavCurrentKey;
        const initialKey = secondaryKeys.includes(current) ? current : secondaryKeys[0];
        window.__siteSecondaryNavOrder = secondaryKeys.slice();
        window.__siteSecondaryNavDefaultKey = secondaryKeys[0];
        window.__siteSecondaryNavState = {
            keys: secondaryKeys.slice(),
            currentKey: initialKey,
            catalog,
            isProjectsPage
        };
        window.__setSecondaryNavCurrentKey = (key, opts = {}) => setSecondaryNavCurrentKey(key, opts);

        setSecondaryNavCurrentKey(initialKey, { force: true, animate: false });
    }

    function applyGroupedNavigation(settings) {
        const isProjectsPage = window.location.pathname.includes('projects.html');
        const catalog = buildNavigationCatalog(settings);
        const allowedKeys = new Set(Array.from(catalog.keys()));

        const customPrimaryDefaults = Array.from(catalog.values())
            .filter((item) => item.group === 'primary' && !DEFAULT_PRIMARY_NAV_ORDER.includes(item.key))
            .map((item) => item.key);
        const customSecondaryDefaults = Array.from(catalog.values())
            .filter((item) => item.group === 'secondary' && !DEFAULT_SECONDARY_NAV_ORDER.includes(item.key))
            .map((item) => item.key);

        const primaryFallback = [...DEFAULT_PRIMARY_NAV_ORDER, ...customPrimaryDefaults];
        const secondaryFallback = [...DEFAULT_SECONDARY_NAV_ORDER, ...customSecondaryDefaults];

        const primaryRaw = settings && settings.primaryNavOrder ? settings.primaryNavOrder : null;
        const secondaryRaw = settings && settings.secondaryNavOrder ? settings.secondaryNavOrder : null;

        const primaryKeys = resolveNavOrder(primaryRaw, primaryFallback, allowedKeys)
            .filter((key) => {
                const item = catalog.get(key);
                if (!item) return false;
                if (item.sectionKey && !isSectionVisibleForNav(item.sectionKey)) return false;
                return true;
            });

        const primaryKeySet = new Set(primaryKeys);
        const secondaryKeys = resolveNavOrder(secondaryRaw, secondaryFallback, allowedKeys)
            .filter((key) => {
                if (primaryKeySet.has(key)) return false;
                const item = catalog.get(key);
                if (!item) return false;
                if (item.sectionKey && !isSectionVisibleForNav(item.sectionKey)) return false;
                return true;
            });

        window.__siteNavOrder = resolveOrder(settings && settings.navOrder, DEFAULT_NAV_ORDER);
        window.__sitePrimaryNavOrder = primaryKeys.slice();
        window.__siteSecondaryNavOrder = secondaryKeys.slice();
        window.__siteNavCatalog = Array.from(catalog.entries()).reduce((acc, [key, item]) => {
            acc[key] = {
                label: item.label,
                group: item.group,
                sectionKey: item.sectionKey || '',
                indexHref: item.indexHref || '',
                projectsHref: item.projectsHref || '',
                openInNewTab: !!item.openInNewTab
            };
            return acc;
        }, {});

        syncPrimaryNavContainer(document.getElementById('desktop-primary-nav'), primaryKeys, catalog, isProjectsPage, false);
        syncPrimaryNavContainer(document.getElementById('mobile-primary-nav'), primaryKeys, catalog, isProjectsPage, true);
        applySecondaryNavigation(secondaryKeys, catalog, isProjectsPage);

        const contactBtn = document.getElementById('nav-contact-btn');
        if (contactBtn) {
            contactBtn.classList.add('ml-4');
        }
    }

    function applySectionOrder(rawOrder) {
        const main = document.querySelector('#main-content');
        if (!main) return;

        const sectionOrder = resolveOrder(rawOrder, DEFAULT_SECTION_ORDER);
        window.__siteSectionOrder = sectionOrder.slice();

        sectionOrder.forEach((key) => {
            const selector = SECTION_MAP[key];
            if (!selector) return;
            const section = main.querySelector(selector);
            if (section && section.parentElement === main) {
                main.appendChild(section);
            }
        });
    }

    /* ── Section Visibility ── */
    function applySectionVisibility(sections) {
        if (!sections) return;
        window.__siteSectionVisibility = sections;
        Object.keys(sections).forEach(key => {
            const visible = sections[key];
            const sel = SECTION_MAP[key];
            if (!sel) return;
            const el = document.querySelector(sel);
            if (el) {
                el.style.display = visible ? '' : 'none';
                el.setAttribute('data-section-visible', visible ? 'true' : 'false');
            }

            if (!visible && key === 'projects') {
                const projectsContainer = document.querySelector('.nav-item-projects');
                const projectsLink = document.getElementById('nav-projects-link');
                if (projectsContainer) {
                    projectsContainer.classList.remove('mode-featured');
                }
                if (projectsLink) {
                    const textSpan = projectsLink.querySelector('.nav-link-text');
                    projectsLink.setAttribute('href', 'projects.html');
                    if (textSpan) {
                        textSpan.classList.remove('morphing');
                        textSpan.textContent = 'Projects';
                    } else {
                        projectsLink.textContent = 'Projects';
                    }
                }
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

    /* ── Scripts Library Renderer ── */
    function renderScriptLibrary(data) {
        if (!data) return;
        const section = document.querySelector('#script-library');
        if (!section) return;

        const title = section.querySelector('.section-title-container h2');
        if (title) title.textContent = data.sectionTitle || 'Scripts Library';

        const subtitle = section.querySelector('.scripts-library-subtitle');
        if (subtitle && data.subtitle) subtitle.textContent = data.subtitle;

        const grid = section.querySelector('#scriptLibraryGrid');
        const filtersHost = section.querySelector('#scriptLibraryFilters');
        const countEl = section.querySelector('#scriptLibraryCount');
        const entries = Array.isArray(data.entries) ? data.entries : [];
        const filterLabels = (data.filterLabels && typeof data.filterLabels === 'object') ? data.filterLabels : {};
        const getCategory = (entry) => String(entry.category || 'other').toLowerCase();
        const categories = Array.from(new Set(entries.map(getCategory)));
        let activeFilter = 'all';

        const formatFilterLabel = (key) => {
            if (!key) return 'Other';
            if (filterLabels[key]) return String(filterLabels[key]);
            return key.charAt(0).toUpperCase() + key.slice(1);
        };

        if (filtersHost) {
            const filterButtons = [
                '<button type="button" class="scripts-library-filter-btn is-active" data-filter="all" role="tab" aria-selected="true">All</button>',
                ...categories.map((key) => `<button type="button" class="scripts-library-filter-btn" data-filter="${escapeHTML(key)}" role="tab" aria-selected="false">${escapeHTML(formatFilterLabel(key))}</button>`)
            ];
            filtersHost.innerHTML = filterButtons.join('');
        }

        const renderCards = (filter) => {
            const filtered = entries.filter((entry) => filter === 'all' || getCategory(entry) === filter);

            if (grid) {
                if (!filtered.length) {
                    grid.innerHTML = '<div class="scripts-library-loading">No script families in this view yet.</div>';
                } else {
                    grid.innerHTML = filtered.map((entry, i) => {
                        const category = getCategory(entry);
                        const repoAction = entry.repoUrl
                            ? `<a href="${escapeHTML(entry.repoUrl)}" target="_blank" rel="noopener noreferrer" class="script-library-action script-library-action--repo">Family folder <i data-feather="folder" class="w-4 h-4"></i></a>`
                            : '';
                        const sampleAction = entry.sampleUrl
                            ? `<a href="${escapeHTML(entry.sampleUrl)}" target="_blank" rel="noopener noreferrer" class="script-library-action script-library-action--sample">View sample <i data-feather="external-link" class="w-4 h-4"></i></a>`
                            : '';
                        const actionsHtml = (repoAction || sampleAction)
                            ? `<div class="script-library-actions">${repoAction}${sampleAction}</div>`
                            : '';

                        return `
                            <article data-aos="fade-up" ${i > 0 ? `data-aos-delay="${Math.min(i * 80, 320)}"` : ''} class="script-library-card" data-script-category="${escapeHTML(category)}">
                                <header class="script-library-card-header">
                                    <span class="script-library-icon" aria-hidden="true"><i data-feather="${escapeHTML(entry.icon || 'code')}"></i></span>
                                    <div>
                                        <h3>${escapeHTML(entry.title || '')}</h3>
                                        <p class="script-library-summary">${escapeHTML(entry.summary || '')}</p>
                                    </div>
                                </header>
                                <div class="script-library-stack">
                                    ${(entry.stack || []).map(item => `<span class="script-library-stack-item">${escapeHTML(item)}</span>`).join('')}
                                </div>
                                <p class="script-library-path">${escapeHTML(entry.path || '')}</p>
                                <ul class="script-library-highlights">
                                    ${(entry.highlights || []).map(item => `<li>${escapeHTML(item)}</li>`).join('')}
                                </ul>
                                ${actionsHtml}
                            </article>
                        `;
                    }).join('');
                }
            }

            if (countEl) {
                const prefix = filter === 'all'
                    ? 'All categories'
                    : `${formatFilterLabel(filter)} category`;
                countEl.textContent = `${prefix}: ${filtered.length} of ${entries.length} script families`;
            }

            if (typeof feather !== 'undefined') feather.replace();
        };

        if (filtersHost && !filtersHost.dataset.bound) {
            filtersHost.dataset.bound = 'true';
            filtersHost.addEventListener('click', (event) => {
                const button = event.target.closest('.scripts-library-filter-btn');
                if (!button) return;
                const nextFilter = button.getAttribute('data-filter') || 'all';
                if (nextFilter === activeFilter) return;
                activeFilter = nextFilter;

                filtersHost.querySelectorAll('.scripts-library-filter-btn').forEach((btn) => {
                    const isActive = btn === button;
                    btn.classList.toggle('is-active', isActive);
                    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
                });

                renderCards(activeFilter);
            });
        }

        renderCards(activeFilter);

        const cta = section.querySelector('.scripts-library-cta');
        if (cta && data.cta) {
            if (data.cta.href) cta.setAttribute('href', data.cta.href);
            const ctaText = escapeHTML(data.cta.text || 'Explore Full Script Repository');
            cta.innerHTML = `${ctaText} <i data-feather="arrow-up-right" class="w-4 h-4"></i>`;
        }

        if (typeof feather !== 'undefined') feather.replace();
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
            const badgeText = document.createElement('span');
            badgeText.className = 'availability-text';
            badgeText.textContent = data.availabilityText || '';
            badge.appendChild(badgeText);
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

        if (summaryContainer && data.location) {
            const locationLink = summaryContainer.querySelector('.contact-location-text');
            if (locationLink) {
                const locationLabel = String(data.location).trim();
                const mapQueryLabel = locationLabel.replace(/\s*\(.*\)\s*/g, '').trim();
                const q = encodeURIComponent((mapQueryLabel || locationLabel) + ', Canada');
                locationLink.href = 'https://www.google.com/maps/search/' + q;
                locationLink.textContent = locationLabel;
            }
        }

        if (summaryContainer && data.email) {
            const emailLink = summaryContainer.querySelector('.contact-email-text');
            if (emailLink) {
                const emailLabel = String(data.email).trim();
                emailLink.href = `mailto:${emailLabel}`;
                emailLink.textContent = emailLabel;
            }
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

    /* ── Tools & Platforms Renderer ── */
    function renderToolsPlatforms(data) {
        if (!data) return;
        const section = document.querySelector('#tools-platforms');
        if (!section) return;

        const title = section.querySelector('.section-title-container h2');
        if (title) title.textContent = data.sectionTitle || 'Tools & Platforms';

        const subtitle = section.querySelector('.tools-platforms-subtitle');
        if (subtitle && data.subtitle) subtitle.textContent = data.subtitle;

        const grid = section.querySelector('.tools-platforms-grid');
        const categories = Array.isArray(data.categories) ? data.categories : [];
        if (grid) {
            grid.innerHTML = categories.map((cat, i) => {
                const items = Array.isArray(cat.items) ? cat.items : [];
                return `
                    <article data-aos="fade-up" ${i > 0 ? `data-aos-delay="${Math.min(i * 80, 320)}"` : ''} class="tools-platform-card bg-white p-6 rounded-xl shadow-md transition duration-300">
                        <header class="flex items-center mb-4">
                            <div class="p-3 bg-indigo-100 rounded-full mr-4">
                                <i data-feather="${escapeHTML(cat.icon || 'tool')}" class="text-indigo-600"></i>
                            </div>
                            <h3 class="text-lg font-bold">${escapeHTML(cat.title || '')}</h3>
                        </header>
                        <ul class="space-y-3">
                            ${items.map((item) => `
                                <li class="text-sm text-gray-700 leading-relaxed">
                                    <span class="font-semibold text-gray-900">${escapeHTML(item.name || '')}:</span>
                                    ${escapeHTML(item.usage || '')}
                                </li>
                            `).join('')}
                        </ul>
                    </article>
                `;
            }).join('');
            if (typeof feather !== 'undefined') feather.replace();
        }
    }

    /* ── Experience Renderer ── */
    function renderExperience(data) {
        if (!data) return;
        const section = document.querySelector('#experience');
        if (!section) return;

        const EXPERIENCE_PREVIEW_COUNT = 5;

        const title = section.querySelector('.section-title-container h2');
        if (title) title.textContent = data.sectionTitle || 'Work Experience';

        const container = section.querySelector('.space-y-8');
        if (container && data.entries) {
            container.innerHTML = data.entries.map((exp, i) => {
                const outcomes = Array.isArray(exp.outcomes) ? exp.outcomes : [];
                const visibleOutcomes = outcomes.slice(0, EXPERIENCE_PREVIEW_COUNT);
                const hiddenOutcomes = outcomes.slice(EXPERIENCE_PREVIEW_COUNT);
                const listId = `experience-outcomes-${i}`;
                return `
                <div data-aos="fade-up" ${i > 0 ? `data-aos-delay="${i * 100}"` : ''} class="experience-item relative">
                    <div class="experience-card" style="--experience-image: url('${exp.backgroundImage || ''}'); --experience-inset-image: url('${exp.insetImage || ''}');">
                        <div class="experience-card-content">
                            <div>
                                <h3 class="experience-title">${escapeHTML(exp.title)}</h3>
                                <p class="experience-meta">${escapeHTML(exp.company)} - ${escapeHTML(exp.location)} &bull; ${escapeHTML(exp.period)}</p>
                                <p class="experience-summary"><span class="experience-summary-title">Focus:</span> ${escapeHTML(exp.focus)}</p>
                                <p class="experience-bullet-title">Key outcomes</p>
                                <ul class="experience-list" id="${listId}">
                                    ${visibleOutcomes.map(o => `<li>${escapeHTML(o)}</li>`).join('')}
                                    ${hiddenOutcomes.map(o => `<li class="experience-list-item-extra">${escapeHTML(o)}</li>`).join('')}
                                </ul>
                                ${hiddenOutcomes.length ? `<button type="button" class="more-link experience-more-link" data-target="${listId}" aria-controls="${listId}" aria-expanded="false" data-collapsed-label="Read more..." data-expanded-label="Show less">
                                    <span class="more-link-text">Read more...</span>
                                    <span class="more-link-icon" aria-hidden="true"></span>
                                </button>` : ''}
                                ${exp.logLine ? `<div class="experience-log" data-fun-element aria-hidden="true">
                                    <span class="log-label">System log</span>
                                    <span class="log-line">${escapeHTML(exp.logLine)}</span>
                                </div>` : ''}
                            </div>
                        </div>
                        <div class="experience-inset" aria-hidden="true" style="background-image: url('${exp.insetImage || ''}');"></div>
                    </div>
                </div>
            `;
            }).join('');
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
                const locationLabel = String(data.location).trim();
                const mapQueryLabel = locationLabel.replace(/\s*\(.*\)\s*/g, '').trim();
                const q = encodeURIComponent((mapQueryLabel || locationLabel) + ', Canada');
                locEl.href = 'https://www.google.com/maps/search/' + q;
                locEl.textContent = locationLabel;
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
        if (typeof settings.immersiveEffects === 'boolean') {
            localStorage.setItem('fun_immersive', String(settings.immersiveEffects));
        }
        if (settings.defaultFunVantaMode && !localStorage.getItem('fun-vanta-mode')) {
            localStorage.setItem('fun-vanta-mode', settings.defaultFunVantaMode);
        }
    }

    /* ── Main Loader ── */
    async function loadSiteContent() {
        const isIndex = !window.location.pathname.includes('projects.html');
        const shouldRestoreScroll = shouldRestoreSavedScrollPosition();
        const savedScrollTop = shouldRestoreScroll ? getSavedScrollPosition() : null;
        const config = await fetchJSON('js/config.json');

        if (config && config.settings) {
            if (isIndex) {
                applySectionOrder(config.settings.sectionOrder);
            }
            applySectionVisibility(config.settings.sections);
            applyGroupedNavigation(config.settings);
            applyVantaSettings(config.settings.vanta);
            applyFunModeDefaults(config.settings);
        } else {
            if (isIndex) {
                applySectionOrder(DEFAULT_SECTION_ORDER);
            }
            applyGroupedNavigation({
                navOrder: DEFAULT_NAV_ORDER,
                primaryNavOrder: DEFAULT_PRIMARY_NAV_ORDER,
                secondaryNavOrder: DEFAULT_SECONDARY_NAV_ORDER,
                customNavItems: []
            });
        }

        if (typeof document !== 'undefined') {
            document.dispatchEvent(new CustomEvent('site-settings-applied', {
                detail: {
                    settings: config && config.settings ? config.settings : null
                }
            }));
        }

        if (!isIndex) {
            if (typeof feather !== 'undefined') feather.replace();
            scheduleHashRealign();
            scheduleSavedScrollRestore(savedScrollTop);
            return;
        }

        const [hero, about, skills, toolsPlatforms, scriptLibrary, experience, process, testimonials, contact, footerData] = await Promise.all([
            fetchJSON('js/hero.json'),
            fetchJSON('js/about.json'),
            fetchJSON('js/skills.json'),
            fetchJSON('js/tools-platforms.json'),
            fetchJSON('js/script-library.json'),
            fetchJSON('js/experience.json'),
            fetchJSON('js/process.json'),
            fetchJSON('js/testimonials.json'),
            fetchJSON('js/contact.json'),
            fetchJSON('js/footer.json')
        ]);

        renderHero(hero);
        renderAbout(about);
        renderSkills(skills);
        renderToolsPlatforms(toolsPlatforms);
        renderScriptLibrary(scriptLibrary);
        renderExperience(experience);
        renderProcess(process);
        renderTestimonials(testimonials);
        renderContact(contact);
        renderFooter(footerData);

        if (typeof feather !== 'undefined') feather.replace();
        if (typeof AOS !== 'undefined') setTimeout(() => AOS.refresh(), 150);
        scheduleHashRealign();
        scheduleSavedScrollRestore(savedScrollTop);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadSiteContent);
    } else {
        loadSiteContent();
    }
})();

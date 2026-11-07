#!/usr/bin/env node
/**
 * Generate one static, indexable page per project, plus sitemap.xml.
 *
 * Why: projects open in a modal at projects.html?project=<id>. That URL
 * declares projects.html as its canonical page, so search engines fold all
 * 21 projects into one listing and none can be found on its own, and sharing
 * one shows the generic site preview. These pages give every project its own
 * URL, title, description, share card and structured data, with the case
 * study rendered as HTML (the .md files are served as downloads).
 *
 * Outputs (committed, because Porkbun serves the repository as-is):
 *   projects/<id>.html   one per project in js/projects.json
 *   sitemap.xml          home, projects.html and every project page
 *
 * Deterministic: dates come from the CMS data, never the clock or file times,
 * so CI regenerates byte-identical files. npm run audit fails on drift.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://davidoncloud.com';
const OUT_DIR = 'projects';
const PERSON = {
    '@type': 'Person',
    name: 'Tope David Matthew',
    alternateName: 'David',
    url: `${SITE}/`,
    jobTitle: 'Systems & Data Analyst and IT Administrator',
    sameAs: ['https://www.linkedin.com/in/tope-david-m-48076969', 'https://github.com/toughdave']
};

const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const exists = rel => fs.existsSync(path.join(ROOT, rel));

const esc = value => String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const safeUrl = (url, { relative = true } = {}) => {
    const raw = String(url || '').trim();
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) return raw;
    if (relative && /^\/?[\w./-]/.test(raw) && !/^[a-z][\w+.-]*:/i.test(raw)) return '/' + raw.replace(/^\//, '');
    return '';
};

const isoDate = value => {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
};

const humanDate = value => {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
};

// Prefer the optimized copy written by scripts/optimize_images.py.
const webImage = src => {
    const rel = String(src || '').replace(/^\//, '');
    if (!rel || /^https?:/i.test(rel)) return src;
    const web = rel.replace(/\.(png|jpe?g)$/i, '-web.webp');
    return '/' + (web !== rel && exists(web) ? web : rel);
};

const trimDescription = text => {
    const clean = String(text || '').replace(/\s+/g, ' ').trim();
    if (clean.length <= 158) return clean;
    return clean.slice(0, 155).replace(/\s+\S*$/, '') + '...';
};

// Same transformation the project modal applies (js/scripts.js).
const formatDetail = text => esc(text)
    .replace(/\bWork Context:/g, '<strong>Work Context:</strong>')
    .replace(/\bCurrent Implementation:/g, '<strong>Current Implementation:</strong>')
    .replace(/(https?:\/\/[^\s<]+[^\s<.,;:)])/g, '<a href="$1" rel="noopener">$1</a>');

const splitDetail = text => {
    const raw = String(text || '').trim();
    const match = /\bCurrent Implementation:/i.exec(raw);
    if (!match) return raw ? [raw] : [];
    return [raw.slice(0, match.index).trim(), raw.slice(match.index).trim()].filter(Boolean);
};

const impactValue = value => {
    const raw = String(value || '').trim();
    if (/^\d+(?:\.\d+)?%$/.test(raw)) return `About ${raw}`;
    const k = raw.match(/^(\d+(?:\.\d+)?)\s*[Kk](\+?)$/);
    if (k) return Math.round(Number(k[1]) * 1000).toLocaleString('en-US') + k[2];
    return raw;
};

// Markdown to HTML for the case studies. Mirrors renderCaseStudyMarkdown in
// js/scripts.js so a case study reads the same in the modal and on its page.
const renderMarkdown = source => {
    const lines = String(source || '').replace(/\r\n/g, '\n').split('\n');
    const out = [];
    let list = null;
    let code = false;
    let para = [];
    const inline = text => esc(text)
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
        .replace(/\[([^\]]+)\]\(([^)\s"'<>]+)\)/g, (m, label, url) => {
            const safe = safeUrl(url);
            return safe ? `<a href="${esc(safe)}"${/^https?:/.test(safe) ? ' rel="noopener"' : ''}>${label}</a>` : label;
        });
    const closeList = () => { if (list) { out.push(`</${list}>`); list = null; } };
    const closePara = () => { if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para = []; } };
    for (const line of lines) {
        if (line.trim().startsWith('```')) { closePara(); closeList(); out.push(code ? '</code></pre>' : '<pre><code>'); code = !code; continue; }
        if (code) { out.push(esc(line) + '\n'); continue; }
        if (!line.trim()) { closePara(); closeList(); continue; }
        const h = line.match(/^(#{1,6})\s+(.*)$/);
        if (h) {
            closePara(); closeList();
            // The page title is the only h1; case-study headings start at h2.
            const level = Math.min(6, h[1].length + 1);
            out.push(`<h${level}>${inline(h[2])}</h${level}>`);
            continue;
        }
        if (/^\s*([-*_])\s*\1\s*\1[\s\S]*$/.test(line.trim())) { closePara(); closeList(); out.push('<hr>'); continue; }
        const b = line.match(/^\s*[-*+]\s+(.*)$/);
        if (b) { closePara(); if (list !== 'ul') { closeList(); out.push('<ul>'); list = 'ul'; } out.push(`<li>${inline(b[1])}</li>`); continue; }
        const o = line.match(/^\s*\d+[.)]\s+(.*)$/);
        if (o) { closePara(); if (list !== 'ol') { closeList(); out.push('<ol>'); list = 'ol'; } out.push(`<li>${inline(o[1])}</li>`); continue; }
        closeList();
        para.push(line.trim());
    }
    closePara(); closeList();
    if (code) out.push('</code></pre>');
    return out.join('\n');
};

// The case study repeats the project title as its first heading; drop it.
const caseStudyBody = markdown => markdown.replace(/^\s*#\s+[^\n]*\n/, '');

const figure = (img, eager = false) => {
    const src = webImage(img.src);
    if (!src) return '';
    return `<figure>
        <img src="${esc(src)}" alt="${esc(img.alt || '')}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">
        ${img.caption ? `<figcaption>${esc(img.caption)}</figcaption>` : ''}
      </figure>`;
};

const STYLE = `
:root { color-scheme: light dark; --bg: #f8fafc; --card: #fff; --ink: #0f172a; --muted: #475569; --line: #e2e8f0; --accent: #4f46e5; --accent-ink: #312e81; --chip: #eef2ff; }
@media (prefers-color-scheme: dark) { :root { --bg: #0b1120; --card: #111a2e; --ink: #e2e8f0; --muted: #94a3b8; --line: #23304a; --accent: #a5b4fc; --accent-ink: #c7d2fe; --chip: #1e2745; } }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--ink); font: 16px/1.65 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
a { color: var(--accent); }
.wrap { max-width: 760px; margin: 0 auto; padding: 0 20px; }
header.site { border-bottom: 1px solid var(--line); background: var(--card); }
header.site .wrap { display: flex; flex-wrap: wrap; gap: 8px 20px; align-items: center; justify-content: space-between; padding-block: 14px; }
header.site .name { font-weight: 700; text-decoration: none; color: var(--ink); }
header.site .name span { display: block; font-weight: 400; font-size: 13px; color: var(--muted); }
header.site nav { display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: 15px; }
main { padding-block: 32px 48px; overflow-wrap: anywhere; }
.crumbs { font-size: 14px; color: var(--muted); margin-bottom: 12px; }
h1 { font-size: clamp(1.7rem, 4vw, 2.3rem); line-height: 1.2; margin: 0 0 10px; }
.dates { font-size: 14px; color: var(--muted); margin: 0 0 18px; }
.summary { font-size: 1.12rem; font-weight: 500; margin: 0 0 18px; }
.tags { display: flex; flex-wrap: wrap; gap: 8px; padding: 0; margin: 0 0 22px; list-style: none; }
.tags li { background: var(--chip); color: var(--accent-ink); border-radius: 999px; padding: 3px 12px; font-size: 13px; }
.actions { display: flex; flex-wrap: wrap; gap: 10px; margin: 0 0 28px; }
.actions a { display: inline-block; padding: 8px 16px; border-radius: 8px; border: 1px solid var(--line); background: var(--card); text-decoration: none; font-size: 15px; }
.actions a.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
@media (prefers-color-scheme: dark) { .actions a.primary { color: #0b1120; } }
figure { margin: 22px 0; }
figure img { display: block; width: 100%; height: auto; border-radius: 12px; border: 1px solid var(--line); background: var(--card); }
figure.lead img { aspect-ratio: 16 / 10; object-fit: cover; }
figcaption { font-size: 14px; color: var(--muted); margin-top: 6px; }
section { margin-top: 34px; }
h2 { font-size: 1.35rem; margin: 30px 0 10px; }
h3 { font-size: 1.12rem; margin: 22px 0 8px; }
.impact { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; }
.impact div { background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 14px 16px; }
.impact strong { display: block; font-size: 1.35rem; color: var(--accent); }
.impact span { display: block; font-weight: 600; }
.impact small { display: block; color: var(--muted); font-size: 14px; }
code { font-family: ui-monospace, "JetBrains Mono", monospace; font-size: 0.9em; background: var(--chip); padding: 1px 5px; border-radius: 4px; overflow-wrap: anywhere; }
pre { overflow-x: auto; background: var(--chip); padding: 12px 14px; border-radius: 8px; }
pre code { background: none; padding: 0; }
.case-study { border-top: 1px solid var(--line); }
footer.site { border-top: 1px solid var(--line); color: var(--muted); font-size: 14px; }
footer.site .wrap { padding-block: 24px; display: flex; flex-wrap: wrap; gap: 8px 20px; justify-content: space-between; }
`;

const buildPage = (project, caseStudyMarkdown) => {
    const url = `${SITE}/${OUT_DIR}/${project.id}.html`;
    const description = trimDescription(project.summary);
    const lead = project.image ? webImage(project.image) : '';
    const leadAbsolute = lead ? SITE + lead : `${SITE}/img/branding/portfolio-preview-2026-09.jpg`;
    const posted = isoDate(project.posted);
    const modified = isoDate(project.modified) || posted;

    const imagesByIndex = {};
    (project.images || []).forEach(img => { (imagesByIndex[img.afterDetail ?? -1] ||= []).push(img); });

    const details = (project.details || []).map((detail, i) =>
        splitDetail(detail).map(p => `<p>${formatDetail(p)}</p>`).join('\n') + (imagesByIndex[i] || []).map(img => figure(img)).join('')
    ).join('\n');

    const impact = (project.impact || []).length ? `
      <section aria-labelledby="impact">
        <h2 id="impact">Impact</h2>
        <div class="impact">
          ${project.impact.map(m => `<div><strong>${esc(impactValue(m.value))}</strong><span>${esc(m.label || '')}</span>${m.detail ? `<small>${esc(m.detail)}</small>` : ''}</div>`).join('\n          ')}
        </div>
      </section>` : '';

    const links = [];
    links.push(`<a class="primary" href="/projects.html?project=${esc(project.id)}">Open in the portfolio</a>`);
    const source = safeUrl(project.sourceUrl, { relative: false });
    if (source) links.push(`<a href="${esc(source)}" rel="noopener">${esc(project.sourceText || 'Live source')}</a>`);
    const external = /^https?:/i.test(project.link || '') ? safeUrl(project.link, { relative: false }) : '';
    if (external) links.push(`<a href="${esc(external)}" rel="noopener">${esc(project.linkText || 'View publication')}</a>`);
    const pdf = safeUrl(project.pdf);
    if (pdf) links.push(`<a href="${esc(pdf)}">Download PDF</a>`);
    links.push('<a href="/docs/T-David-Matthew-Resume-Information-Systems-Analyst.pdf">Resume (PDF)</a>');

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'CreativeWork',
                '@id': `${url}#work`,
                name: project.title,
                headline: project.title,
                description,
                url,
                image: leadAbsolute,
                datePublished: posted || undefined,
                dateModified: modified || undefined,
                keywords: (project.tags || []).join(', '),
                author: PERSON,
                isPartOf: { '@type': 'CollectionPage', name: 'Projects', url: `${SITE}/projects.html` }
            },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
                    { '@type': 'ListItem', position: 2, name: 'Projects', item: `${SITE}/projects.html` },
                    { '@type': 'ListItem', position: 3, name: project.title, item: url }
                ]
            }
        ]
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- Generated by scripts/generate_project_pages.js from js/projects.json. Do not edit by hand. -->
  <title>${esc(project.title)} | Tope David Matthew</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${esc(url)}">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="David on Cloud">
  <meta property="og:locale" content="en_CA">
  <meta property="og:title" content="${esc(project.title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${esc(url)}">
  <meta property="og:image" content="${esc(leadAbsolute)}">
  <meta property="og:image:alt" content="${esc(project.title)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(project.title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${esc(leadAbsolute)}">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
  </script>
  <style>${STYLE}</style>
</head>
<body>
  <header class="site">
    <div class="wrap">
      <a class="name" href="/">Tope David Matthew<span>Systems &amp; Data Analyst | IT Administrator</span></a>
      <nav aria-label="Site">
        <a href="/">Home</a>
        <a href="/projects.html">All projects</a>
        <a href="/docs/T-David-Matthew-Resume-Information-Systems-Analyst.pdf">Resume</a>
        <a href="/#contact">Contact</a>
      </nav>
    </div>
  </header>
  <main class="wrap">
    <p class="crumbs"><a href="/projects.html">Projects</a> / ${esc(project.title)}</p>
    <article>
      <h1>${esc(project.title)}</h1>
      <p class="dates">${posted ? `Posted <time datetime="${posted}">${esc(humanDate(project.posted))}</time>` : ''}${modified && modified !== posted ? ` · Updated <time datetime="${modified}">${esc(humanDate(project.modified))}</time>` : ''}</p>
      <p class="summary">${esc(project.summary || '')}</p>
      ${(project.tags || []).length ? `<ul class="tags" aria-label="Topics">${project.tags.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
      <div class="actions">
        ${links.join('\n        ')}
      </div>
      ${lead ? `<figure class="lead"><img src="${esc(lead)}" alt="${esc(project.title)}" fetchpriority="high" decoding="async"></figure>` : ''}
      <section aria-labelledby="details">
        <h2 id="details">Project details</h2>
        ${details || '<p>Details are being written up.</p>'}
      </section>${impact}
      ${caseStudyMarkdown ? `<section class="case-study" aria-labelledby="case-study">
        <h2 id="case-study">Case study</h2>
        ${renderMarkdown(caseStudyBody(caseStudyMarkdown))}
      </section>` : ''}
    </article>
  </main>
  <footer class="site">
    <div class="wrap">
      <span>Tope David Matthew · Toronto, ON · Open to work</span>
      <a href="/projects.html">Back to all projects</a>
    </div>
  </footer>
</body>
</html>
`;
};

const buildSitemap = (projects) => {
    const latest = projects.map(p => isoDate(p.modified) || isoDate(p.posted)).filter(Boolean).sort().pop();
    const entry = (loc, lastmod) => `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`;
    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        entry(`${SITE}/`),
        entry(`${SITE}/projects.html`, latest),
        ...projects.map(p => entry(`${SITE}/${OUT_DIR}/${p.id}.html`, isoDate(p.modified) || isoDate(p.posted))),
        '</urlset>',
        ''
    ].join('\n');
};

const main = () => {
    const projects = JSON.parse(read('js/projects.json')).projects || [];
    const valid = projects.filter(p => /^[a-z0-9][a-z0-9-]*$/.test(p.id || ''));
    if (valid.length !== projects.length) {
        throw new Error('Every project id must be lowercase letters, digits and hyphens to become a page name.');
    }

    fs.mkdirSync(path.join(ROOT, OUT_DIR), { recursive: true });
    const wanted = new Set();
    for (const project of valid) {
        const md = /\.md$/i.test(project.link || '') && exists(project.link.replace(/^\//, ''))
            ? read(project.link.replace(/^\//, '')) : '';
        const file = `${OUT_DIR}/${project.id}.html`;
        wanted.add(file);
        fs.writeFileSync(path.join(ROOT, file), buildPage(project, md), 'utf8');
    }
    // Remove pages for projects that no longer exist.
    for (const name of fs.readdirSync(path.join(ROOT, OUT_DIR))) {
        const file = `${OUT_DIR}/${name}`;
        if (name.endsWith('.html') && !wanted.has(file)) fs.rmSync(path.join(ROOT, file));
    }
    fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), buildSitemap(valid), 'utf8');
    console.log(`Generated ${valid.length} project pages and sitemap.xml`);
};

main();

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const problems = [];
const resourceKeys = new Set(['href', 'image', 'pdf', 'resumePath', 'profileImage', 'src', 'link', 'sourceUrl', 'formAction', 'url']);

function checkReference(value, source, base = root) {
    if (typeof value !== 'string' || !value || value.startsWith('#')) return;
    if (/^(?:https?:|mailto:|tel:|data:|\/\/)/i.test(value)) return;
    if (/^[a-z][a-z\d+.-]*:/i.test(value)) { problems.push(`${source}: unsupported URL ${value}`); return; }
    const relative = decodeURIComponent(value.split(/[?#]/)[0]);
    if (!relative) return;
    const target = path.resolve(value.startsWith('/') ? root : base, relative.replace(/^\//, ''));
    if (!target.startsWith(root + path.sep) && target !== root) {
        problems.push(`${source}: reference escapes the site: ${value}`);
    } else if (!fs.existsSync(target)) problems.push(`${source}: missing ${value}`);
}

function walkJson(value, source) {
    if (Array.isArray(value)) { value.forEach(item => walkJson(item, source)); return; }
    if (!value || typeof value !== 'object') return;
    for (const [key, item] of Object.entries(value)) {
        if (resourceKeys.has(key)) checkReference(item, source);
        if (typeof item === 'object') walkJson(item, source);
    }
}

for (const name of fs.readdirSync(path.join(root, 'js'))) {
    const file = path.join(root, 'js', name);
    if (name.endsWith('.json')) {
        try { walkJson(JSON.parse(fs.readFileSync(file, 'utf8')), `js/${name}`); }
        catch (error) { problems.push(`js/${name}: ${error.message}`); }
    }
    if (name.endsWith('.js')) {
        const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
        if (result.status !== 0) problems.push(result.stderr || `${name}: syntax check failed`);
    }
}
for (const name of ['index.html', 'projects.html']) {
    const html = fs.readFileSync(path.join(root, name), 'utf8');
    for (const match of html.matchAll(/\b(?:href|src|action)\s*=\s*["']([^"']+)["']/g)) checkReference(match[1], name);
    if ((html.match(/<h1\b/g) || []).length !== 1) problems.push(`${name}: expected one h1`);
    if (!/<button[^>]*id="menu-toggle"[^>]*aria-label="Open navigation"/.test(html)) problems.push(`${name}: navigation toggle must be a labelled button`);
    if (html.includes('tailwindcss-cdn.js')) problems.push(`${name}: development CSS compiler is still loaded`);
}
const projects = JSON.parse(fs.readFileSync(path.join(root, 'js/projects.json'), 'utf8')).projects;
const ids = new Set();
for (const project of projects) {
    if (!project.id || ids.has(project.id)) problems.push(`projects.json: missing or duplicate project ID ${project.id}`);
    ids.add(project.id);
    if (!project.title || !(project.summary || project.description)) problems.push(`projects.json: incomplete project ${project.id}`);
    if (project.details && !Array.isArray(project.details)) problems.push(`projects.json: details must be an array (${project.id})`);
}
for (const name of ['robots.txt', 'sitemap.xml', 'css/utilities.css']) {
    if (!fs.existsSync(path.join(root, name))) problems.push(`Missing required public file: ${name}`);
}
if (problems.length) {
    console.error(problems.join('\n'));
    process.exitCode = 1;
} else console.log('JavaScript syntax, CMS data, page headings and local resource references passed.');

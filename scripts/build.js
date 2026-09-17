#!/usr/bin/env node
// Copy only public site files; never copy the repository into its own output.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const entries = [
    'index.html', 'projects.html', 'index.html.md', 'projects.html.md',
    'VERSION', 'robots.txt', 'sitemap.xml', 'site.webmanifest',
    'favicon.ico', 'favicon.svg', 'favicon-96x96.png', 'apple-touch-icon.png',
    'web-app-manifest-192x192.png', 'web-app-manifest-512x512.png',
    'llms.txt', 'llms-full.txt', 'css', 'js', 'img', 'static', 'docs', 'admin'
];
if (output !== path.join(root, 'dist')) throw new Error('Invalid build output path');
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const entry of entries) {
    const source = path.join(root, entry);
    if (!fs.existsSync(source)) continue;
    fs.cpSync(source, path.join(output, entry), {
        recursive: true,
        filter: file => !file.endsWith(':Zone.Identifier') && !file.endsWith('/tailwind.css')
    });
}
console.log('Public site built in dist/.');

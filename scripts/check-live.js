#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const version = fs.readFileSync(path.join(__dirname, '..', 'VERSION'), 'utf8').trim();
const site = 'https://davidoncloud.com';
const resources = ['/', '/projects.html', '/css/utilities.css', '/js/contact-form.js', '/robots.txt', '/sitemap.xml'];

async function check() {
    const results = await Promise.all(resources.map(async resource => {
        const response = await fetch(site + resource + '?release=' + version, { signal: AbortSignal.timeout(15000) });
        if (!response.ok) throw new Error(`${resource}: HTTP ${response.status}`);
        const text = await response.text();
        if (resource.endsWith('.html') || resource === '/') {
            if (!text.includes('css/utilities.css?v=' + version) || !text.includes('aria-label="Open navigation"')) {
                throw new Error(`${resource}: release ${version} is not live yet`);
            }
        }
        return resource;
    }));
    console.log(`Release ${version} verified at ${site}: ${results.join(', ')}`);
}

(async () => {
    for (let attempt = 1; attempt <= 20; attempt++) {
        try { await check(); return; }
        catch (error) {
            if (attempt === 20) throw error;
            console.log(`Waiting for Porkbun (${attempt}/20): ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, 15000));
        }
    }
})().catch(error => { console.error(error.message); process.exitCode = 1; });

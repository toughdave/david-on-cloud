#!/usr/bin/env node
// Content audit gate. Checks the site against scripts/fact-lock.json: the settled
// employment facts, the banned-claim list, structural floors that guard against
// silently dropping content, and the recruiter-facing SEO floors.
//
//   node scripts/audit.js              check the working tree
//   node scripts/audit.js --snapshot   write a baseline fingerprint, then check
//   node scripts/audit.js --compare    check, then diff against the last baseline
//
// Exit code 0 means safe to ship. Anything else means stop.

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const lock = JSON.parse(fs.readFileSync(path.join(root, 'scripts', 'fact-lock.json'), 'utf8'));
const baselinePath = path.join(root, '.audit-baseline.json');

const failures = [];
const warnings = [];
const passes = [];

const red = s => `\u001b[31m${s}\u001b[0m`;
const green = s => `\u001b[32m${s}\u001b[0m`;
const yellow = s => `\u001b[33m${s}\u001b[0m`;
const dim = s => `\u001b[2m${s}\u001b[0m`;

const fail = (gate, message) => failures.push({ gate, message });
const warn = (gate, message) => warnings.push({ gate, message });
const pass = message => passes.push(message);

const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const exists = relative => fs.existsSync(path.join(root, relative));

function cmsFiles() {
    return fs.readdirSync(path.join(root, 'js'))
        .filter(name => name.endsWith('.json'))
        .map(name => `js/${name}`);
}

// ---------------------------------------------------------------- gate 1: files
function gateRequiredFiles() {
    const missing = lock.requiredFiles.filter(file => !exists(file));
    if (missing.length) fail('files', `missing required file(s): ${missing.join(', ')}`);
    else pass(`${lock.requiredFiles.length} required files present`);
}

// ------------------------------------------------------- gate 2: required facts
function gateRequiredPhrases() {
    for (const [file, phrases] of Object.entries(lock.requiredPhrases)) {
        if (!exists(file)) { fail('facts', `${file} is missing`); continue; }
        const text = read(file);
        const absent = phrases.filter(phrase => !text.includes(phrase));
        if (absent.length) fail('facts', `${file} no longer states: ${absent.map(p => JSON.stringify(p)).join(', ')}`);
        else pass(`${file} states all ${phrases.length} locked facts`);
    }
}

// -------------------------------------------------------- gate 3: banned claims
function caseStudyFiles() {
    const dir = path.join(root, 'docs', 'case-studies');
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter(name => name.endsWith('.md')).map(name => `docs/case-studies/${name}`);
}

function gateBannedPhrases() {
    const pages = exists('projects') ? fs.readdirSync(path.join(root, 'projects')).filter(n => n.endsWith('.html')).map(n => `projects/${n}`) : [];
    const targets = [...cmsFiles(), ...caseStudyFiles(), ...pages, 'index.html', 'projects.html'];
    const banned = lock.bannedPhrases.global;
    let hits = 0;
    for (const file of targets) {
        if (!exists(file)) continue;
        const text = read(file);
        for (const phrase of banned) {
            if (text.includes(phrase)) { fail('banned', `${file} contains banned claim ${JSON.stringify(phrase)}`); hits++; }
        }
    }
    if (!hits) pass(`no banned claims in ${targets.length} content files`);
}

function gateBannedExperiencePatterns() {
    if (!exists('js/experience.json')) return;
    const text = read('js/experience.json');
    let hits = 0;
    for (const source of lock.bannedInExperience.patterns) {
        const re = new RegExp(source, 'i');
        const match = text.match(re);
        if (match) { fail('banned', `js/experience.json matches banned pattern /${source}/ at ${JSON.stringify(match[0].slice(0, 60))}`); hits++; }
    }
    if (!hits) pass('experience entries carry no banned framing');
}

// ------------------------------------------------- gate 4: nothing silently lost
function gateStructuralFloors() {
    for (const [file, rule] of Object.entries(lock.structuralFloors)) {
        if (file.startsWith('_')) continue;
        if (!exists(file)) { fail('structure', `${file} is missing`); continue; }
        let data;
        try { data = JSON.parse(read(file)); }
        catch (error) { fail('structure', `${file} is not valid JSON: ${error.message}`); continue; }
        const list = data[rule.key];
        if (!Array.isArray(list)) { fail('structure', `${file}: ${rule.key} is not an array`); continue; }
        if (list.length < rule.minCount) fail('structure', `${file}: ${rule.key} dropped to ${list.length}, floor is ${rule.minCount}`);
        else pass(`${file}: ${list.length} ${rule.key} (floor ${rule.minCount})`);
    }
}

// ------------------------------------------------- gate 5: project link coverage
function gateProjectIntegrity() {
    if (!exists('js/projects.json')) return;
    const projects = JSON.parse(read('js/projects.json')).projects || [];
    const noLink = projects.filter(p => !p.link).map(p => p.id);
    if (noLink.length) fail('projects', `projects without a case-study link: ${noLink.join(', ')}`);
    const noId = projects.filter(p => !p.id).length;
    if (noId) fail('projects', `${noId} project(s) without an id`);
    const ids = projects.map(p => p.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (dupes.length) fail('projects', `duplicate project ids: ${[...new Set(dupes)].join(', ')}`);
    const featured = projects.filter(p => p.featured);
    if (featured.length !== 4) warn('projects', `${featured.length} featured projects; the homepage grid expects 4`);
    if (!noLink.length && !noId && !dupes.length) pass(`${projects.length} projects, all with ids and case-study links`);
}

// ------------------------------------------------------------- gate 6: SEO floor
function gateSeo() {
    for (const [file, rule] of Object.entries(lock.seo)) {
        if (file.startsWith('_')) continue;
        if (!exists(file)) { fail('seo', `${file} is missing`); continue; }
        const text = read(file);
        const absent = rule.mustContain.filter(phrase => !text.includes(phrase));
        if (absent.length) fail('seo', `${file} missing: ${absent.map(p => JSON.stringify(p)).join(', ')}`);
        else pass(`${file} meets the SEO floor (${rule.mustContain.length} checks)`);
    }
    // JSON-LD must actually parse.
    for (const file of ['index.html', 'projects.html']) {
        if (!exists(file)) continue;
        const blocks = [...read(file).matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
        if (!blocks.length) { warn('seo', `${file} has no JSON-LD block`); continue; }
        blocks.forEach((block, i) => {
            try { JSON.parse(block[1]); pass(`${file} JSON-LD block ${i + 1} parses`); }
            catch (error) { fail('seo', `${file} JSON-LD block ${i + 1} is invalid: ${error.message}`); }
        });
    }
}

// ----------------------------------------------------------- gate 7: resume PDF
function pdfText(relative) {
    const script = [
        'import sys',
        'try:',
        '    import pypdf',
        'except ImportError:',
        '    sys.exit(3)',
        'r = pypdf.PdfReader(sys.argv[1])',
        'print(len(r.pages))',
        'print("\\n".join(p.extract_text() or "" for p in r.pages))'
    ].join('\n');
    try {
        const out = execFileSync('python3', ['-c', script, path.join(root, relative)], { encoding: 'utf8' });
        const newline = out.indexOf('\n');
        return { pages: Number(out.slice(0, newline)), text: out.slice(newline + 1) };
    } catch (error) {
        if (error.status === 3) return { unavailable: true };
        return { error: error.message };
    }
}

function gateResume() {
    const rule = lock.resume;
    if (!exists(rule.path)) { fail('resume', `${rule.path} is missing`); return; }

    const result = pdfText(rule.path);
    if (result.unavailable) { warn('resume', 'pypdf not installed; resume text checks skipped'); return; }
    if (result.error) { fail('resume', `could not read ${rule.path}: ${result.error}`); return; }

    const { text, pages } = result;
    const flat = text.replace(/\s+/g, ' ');

    if (pages > rule.maxPages) fail('resume', `resume is ${pages} pages, maximum is ${rule.maxPages}`);
    else pass(`resume is ${pages} page(s)`);

    const absent = rule.mustContain.filter(p => !flat.includes(p));
    if (absent.length) fail('resume', `resume missing: ${absent.map(p => JSON.stringify(p)).join(', ')}`);
    else pass(`resume states all ${rule.mustContain.length} locked facts`);

    const present = rule.mustNotContain.filter(p => flat.includes(p));
    if (present.length) fail('resume', `resume contains banned text: ${present.map(p => JSON.stringify(p)).join(', ')}`);
    else pass(`resume carries none of the ${rule.mustNotContain.length} banned strings`);

    for (const ch of rule.mustNotContainChars) {
        if (text.includes(ch)) fail('resume', `resume contains banned character U+${ch.codePointAt(0).toString(16).toUpperCase()} (em dash as prose interrupter)`);
    }
    if (!rule.mustNotContainChars.some(c => text.includes(c))) pass('resume has no em dashes');

    const eduRe = new RegExp(rule.educationMustNotMatch);
    const eduHit = text.match(eduRe);
    if (eduHit) fail('resume', `education line carries a date: ${JSON.stringify(eduHit[0].slice(0, 70))}`);
    else pass('education section carries no dates');
}

// ------------------------------------------------------ gate 8: generated docs
function generatedSnapshot() {
    const files = ['llms.txt', 'index.html.md', 'projects.html.md', 'sitemap.xml'];
    if (exists('projects')) {
        for (const name of fs.readdirSync(path.join(root, 'projects'))) if (name.endsWith('.html')) files.push(`projects/${name}`);
    }
    return new Map(files.filter(exists).map(f => [f, read(f)]));
}

function gateGeneratedDocs() {
    const before = generatedSnapshot();
    try {
        execFileSync(process.execPath, [path.join(root, 'scripts', 'generate_llm_docs.js')], { stdio: 'pipe' });
        execFileSync(process.execPath, [path.join(root, 'scripts', 'generate_project_pages.js')], { stdio: 'pipe' });
    } catch (error) {
        fail('generated', `generator failed: ${error.message}`);
        return;
    }
    const after = generatedSnapshot();
    const changed = [...after.keys()].filter(f => before.get(f) !== after.get(f));
    const removed = [...before.keys()].filter(f => !after.has(f));
    if (changed.length || removed.length) {
        fail('generated', `regenerated and changed: ${[...changed, ...removed.map(f => `${f} (removed)`)].join(', ')}. Commit the regenerated files`);
        return;
    }
    pass(`llms docs, ${[...after.keys()].filter(f => f.startsWith('projects/')).length} project pages and sitemap.xml are in sync with the CMS`);

    // Every local file a generated page points at must exist.
    const missing = [];
    for (const [file, html] of after) {
        if (!file.startsWith('projects/')) continue;
        for (const m of html.matchAll(/\b(?:href|src)="(\/[^"#?]*)/g)) {
            const target = decodeURIComponent(m[1]).replace(/^\//, '');
            if (target && !exists(target) && !exists(path.join(target, 'index.html'))) missing.push(`${file} -> /${target}`);
        }
    }
    // Share cards must use JPG or PNG: LinkedIn and some other link-preview
    // crawlers do not reliably render WebP.
    const webpCards = [];
    for (const [file, html] of [...after, ['index.html', read('index.html')], ['projects.html', read('projects.html')]]) {
        if (!/\.html$/.test(file)) continue;
        for (const m of html.matchAll(/<meta (?:property|name)="(?:og:image|twitter:image)" content="([^"]+)"/g)) {
            if (/\.webp(?:$|\?)/i.test(m[1])) webpCards.push(file);
        }
    }
    if (webpCards.length) fail('generated', `share images must be JPG or PNG, not WebP: ${[...new Set(webpCards)].join(', ')}`);
    else pass('share-card images are JPG or PNG on every page');
    if (missing.length) fail('generated', `project pages reference missing files: ${[...new Set(missing)].slice(0, 8).join(', ')}`);
    else pass('every local link and image on the project pages exists');
}

// ------------------------------------------------------ gate 9: performance
function gatePerformance() {
    const rule = lock.performance;
    if (!rule) return;
    const budget = rule.imageBudgetKB * 1024;

    // Every image the homepage loads up front must fit the budget.
    const over = [];
    let checked = 0;
    for (const [file, keys] of Object.entries(rule.imageSources)) {
        if (!exists(file)) continue;
        const refs = [];
        const walk = value => {
            if (Array.isArray(value)) { value.forEach(walk); return; }
            if (!value || typeof value !== 'object') return;
            for (const [key, item] of Object.entries(value)) {
                if (keys.includes(key) && typeof item === 'string' && item) refs.push(item);
                else if (typeof item === 'object') walk(item);
            }
        };
        walk(JSON.parse(read(file)));
        for (const ref of refs) {
            const local = ref.replace(/^\//, '').split(/[?#]/)[0];
            if (!exists(local)) continue; // missing files are the references gate's job
            checked++;
            const size = fs.statSync(path.join(root, local)).size;
            if (size > budget) over.push(`${local} (${Math.round(size / 1024)}KB)`);
        }
    }
    if (over.length) fail('perf', `images over the ${rule.imageBudgetKB}KB homepage budget: ${over.join(', ')}. Run python3 scripts/optimize_images.py and point the CMS at the -web.webp output`);
    else pass(`${checked} homepage images within the ${rule.imageBudgetKB}KB budget`);

    // Fonts: the compressed format must be offered first.
    const css = read('css/style.css');
    const faces = [...css.matchAll(/@font-face\s*{[^}]*}/g)].map(m => m[0]);
    const badFaces = faces.filter(face => {
        const first = face.match(/src:\s*url\(([^)]+)\)\s*format\(["']?([\w-]+)/);
        return !first || first[2] !== rule.fontFormatFirst;
    });
    const missingFonts = faces.flatMap(face => [...face.matchAll(/url\(["']?\/?([^"')]+)["']?\)/g)].map(m => m[1])).filter(f => !exists(f));
    if (badFaces.length) fail('perf', `${badFaces.length} @font-face rule(s) do not offer ${rule.fontFormatFirst} first`);
    else if (missingFonts.length) fail('perf', `font files missing: ${missingFonts.join(', ')}`);
    else pass(`${faces.length} @font-face rules serve ${rule.fontFormatFirst} first`);

    // Third-party iframes must wait for the reader to approach them.
    const eager = [];
    for (const file of rule.deferredIframesIn) {
        if (!exists(file)) continue;
        for (const tag of read(file).match(/<iframe\b[^>]*>/g) || []) {
            if (/\ssrc\s*=\s*["']https?:/i.test(tag)) eager.push(`${file}: ${tag.slice(0, 70)}`);
        }
    }
    if (eager.length) fail('perf', `iframes load eagerly instead of via data-src: ${eager.join(' | ')}`);
    else pass('third-party iframes are deferred until near view');

    // The hero must not be hidden behind a scroll-animation library.
    const hidden = rule.noAnimationHiddenIn;
    if (hidden && exists(hidden.file)) {
        const html = read(hidden.file);
        const start = html.indexOf(hidden.sectionStart);
        const end = html.indexOf(hidden.sectionEnd, start);
        if (start < 0 || end < 0) warn('perf', `could not locate the hero in ${hidden.file}`);
        else if (/\sdata-aos=/.test(html.slice(start, end))) fail('perf', 'the hero carries data-aos, which hides it until JavaScript runs and delays the largest paint');
        else pass('hero is visible from the first frame (no data-aos)');
    }
}

// -------------------------------------------------- gate 10: hosting limits
function walkFiles(relative, out = []) {
    const full = path.join(root, relative);
    if (!fs.existsSync(full)) return out;
    if (fs.statSync(full).isFile()) { out.push(relative); return out; }
    for (const name of fs.readdirSync(full)) walkFiles(path.join(relative, name), out);
    return out;
}

function gateHosting() {
    const rule = lock.hosting;
    if (!rule) return;
    const files = rule.publicRoots.flatMap(r => walkFiles(r)).filter(f => !f.endsWith(':Zone.Identifier'));

    const tooBig = files.filter(f => !rule.localOnlyFiles.includes(f) && fs.statSync(path.join(root, f)).size > rule.maxServedFileBytes);
    if (tooBig.length) fail('hosting', `files over the ${(rule.maxServedFileBytes / 1e6).toFixed(1)}MB per-file cap: ${tooBig.join(', ')}`);
    else pass(`all ${files.length} public files are under the ${(rule.maxServedFileBytes / 1e6).toFixed(1)}MB per-file cap`);

    const blocked = files.filter(f => rule.blockedNames.includes(path.basename(f)));
    if (blocked.length) fail('hosting', `the host refuses these file names: ${blocked.join(', ')}`);
    else if (rule.blockedNames.length) pass(`no public file uses a name the host blocks (${rule.blockedNames.join(', ')})`);
}

// --------------------------------------------------------- gate 11: the CMS
function gateCms() {
    const rule = lock.cms;
    if (!rule || !exists(rule.adminPage)) { fail('cms', 'admin page missing'); return; }
    const html = read(rule.adminPage);

    // 1. The config link must point at a file that exists and the host serves.
    const link = html.match(/<link[^>]*rel="cms-config-url"[^>]*>/);
    const href = link && (link[0].match(/href="([^"]+)"/) || [])[1];
    if (!href) { fail('cms', 'admin page has no cms-config-url link, so Decap would look for admin/config.yml, which does not exist'); return; }
    const configFile = href.replace(/^\//, '');
    if (!exists(configFile)) { fail('cms', `cms-config-url points at ${href}, which does not exist`); return; }
    if ((lock.hosting?.blockedNames || []).includes(path.basename(configFile))) fail('cms', `${href} uses a name the host blocks`);

    // 2. The CDN copy must be pinned to the vendored bytes.
    if (exists(rule.vendoredBundle)) {
        const hash = 'sha384-' + require('node:crypto').createHash('sha384').update(fs.readFileSync(path.join(root, rule.vendoredBundle))).digest('base64');
        const pinned = [...html.matchAll(/sha384-[A-Za-z0-9+/=]+/g)].map(m => m[0]);
        if (!pinned.length) fail('cms', 'the CDN script has no integrity hash');
        else if (pinned.some(h => h !== hash)) fail('cms', `integrity hash does not match ${rule.vendoredBundle}; update both together`);
        else pass('CMS script is pinned to the vendored bytes by integrity hash');
    }

    // 3. The config must parse and declare every field the content files use,
    //    or a CMS save can silently drop fields it does not know about.
    let yaml;
    try { yaml = require('js-yaml'); } catch { warn('cms', 'js-yaml not installed; CMS config not parsed'); return; }
    let config;
    try { config = yaml.load(read(configFile)); }
    catch (error) { fail('cms', `${configFile} is not valid YAML: ${error.message}`); return; }
    if (!config?.backend?.name) fail('cms', `${configFile} has no backend`);

    const declared = new Map();
    for (const collection of config.collections || []) {
        for (const entry of collection.files || []) {
            const names = new Set();
            const walk = fields => (fields || []).forEach(f => { names.add(f.name); walk(f.fields); if (f.field) names.add(f.field.name); });
            walk(entry.fields);
            declared.set(entry.file, names);
        }
    }
    const gaps = [];
    for (const file of rule.contentFiles) {
        if (!exists(file)) continue;
        const names = declared.get(file);
        if (!names) { gaps.push(`${file} is not editable in the CMS`); continue; }
        const keys = new Set();
        const walk = v => {
            if (Array.isArray(v)) return v.forEach(walk);
            if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) { keys.add(k); walk(x); }
        };
        walk(JSON.parse(read(file)));
        const missing = [...keys].filter(k => !names.has(k));
        if (missing.length) gaps.push(`${file}: ${missing.join(', ')}`);
    }
    if (gaps.length) fail('cms', `content fields the CMS config does not declare (a CMS save could drop them): ${gaps.join('; ')}`);
    else pass(`${configFile} parses and declares every field in ${rule.contentFiles.length} content files`);
}

// ------------------------------------------------------ gate 12: analytics
function gateAnalytics() {
    const rule = lock.analytics;
    if (!rule) return;
    const pages = rule.pages.flatMap(pattern => {
        if (!pattern.includes('*')) return exists(pattern) ? [pattern] : [];
        const dir = path.dirname(pattern);
        return exists(dir) ? fs.readdirSync(path.join(root, dir)).filter(n => n.endsWith('.html')).map(n => `${dir}/${n}`) : [];
    });
    const missing = pages.filter(file => !read(file).includes(rule.tag));
    const strays = pages.filter(file => (read(file).match(/cloud\.umami\.is\/script\.js/g) || []).length !== 1);
    const leaked = rule.mustNotAppearIn.filter(file => exists(file) && read(file).includes('umami'));
    if (missing.length) fail('analytics', `pages without the exact analytics tag: ${missing.join(', ')}`);
    else if (strays.length) fail('analytics', `pages loading the analytics script other than exactly once: ${strays.join(', ')}`);
    else pass(`analytics tag present exactly once on all ${pages.length} public pages`);
    if (leaked.length) fail('analytics', `analytics must not run on: ${leaked.join(', ')}`);
}

// ----------------------------------------------------------------- fingerprint
function fingerprint() {
    const snap = { takenAt: new Date().toISOString(), counts: {}, titles: {}, bytes: {} };
    for (const [file, rule] of Object.entries(lock.structuralFloors)) {
        if (file.startsWith('_') || !exists(file)) continue;
        try {
            const list = JSON.parse(read(file))[rule.key];
            if (Array.isArray(list)) snap.counts[`${file}:${rule.key}`] = list.length;
        } catch { /* reported by the structure gate */ }
    }
    if (exists('js/projects.json')) {
        snap.titles['projects'] = JSON.parse(read('js/projects.json')).projects.map(p => p.id).sort();
    }
    if (exists('js/experience.json')) {
        snap.titles['experience'] = JSON.parse(read('js/experience.json')).entries.map(e => `${e.title} @ ${e.company} (${e.period})`);
    }
    for (const file of lock.requiredFiles) {
        if (exists(file)) snap.bytes[file] = fs.statSync(path.join(root, file)).size;
    }
    return snap;
}

function compareToBaseline() {
    if (!fs.existsSync(baselinePath)) { warn('baseline', 'no baseline recorded; run with --snapshot first'); return; }
    const base = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
    const now = fingerprint();
    console.log(dim(`\nBaseline taken ${base.takenAt}`));

    for (const [key, was] of Object.entries(base.counts)) {
        const is = now.counts[key];
        if (is === undefined) { fail('baseline', `${key} disappeared since the baseline`); continue; }
        if (is < was) fail('baseline', `${key} fell from ${was} to ${is}`);
        else if (is > was) console.log(`  ${green('+')} ${key}: ${was} -> ${is}`);
    }
    const lostProjects = (base.titles.projects || []).filter(id => !(now.titles.projects || []).includes(id));
    if (lostProjects.length) fail('baseline', `projects removed since the baseline: ${lostProjects.join(', ')}`);

    const wasExp = base.titles.experience || [];
    const isExp = now.titles.experience || [];
    wasExp.forEach(entry => { if (!isExp.includes(entry)) console.log(`  ${yellow('~')} experience changed, was: ${entry}`); });
    isExp.forEach(entry => { if (!wasExp.includes(entry)) console.log(`  ${green('~')} experience now:      ${entry}`); });
}

// ------------------------------------------------------------------------ main
const args = process.argv.slice(2);

if (args.includes('--snapshot')) {
    fs.writeFileSync(baselinePath, JSON.stringify(fingerprint(), null, 2));
    console.log(green('Baseline written to .audit-baseline.json'));
}

console.log('\nContent audit against scripts/fact-lock.json\n');

gateRequiredFiles();
gateRequiredPhrases();
gateBannedPhrases();
gateBannedExperiencePatterns();
gateStructuralFloors();
gateProjectIntegrity();
gateSeo();
gateResume();
gateGeneratedDocs();
gatePerformance();
gateHosting();
gateCms();
gateAnalytics();

if (args.includes('--compare')) compareToBaseline();

console.log('');
passes.forEach(message => console.log(`  ${green('ok')}   ${message}`));
warnings.forEach(({ gate, message }) => console.log(`  ${yellow('warn')} [${gate}] ${message}`));
failures.forEach(({ gate, message }) => console.log(`  ${red('FAIL')} [${gate}] ${message}`));

console.log(`\n${passes.length} passed, ${warnings.length} warning(s), ${failures.length} failure(s)\n`);

if (failures.length) {
    console.error(red('Audit failed. Do not ship.'));
    process.exit(1);
}
console.log(green('Audit passed.'));

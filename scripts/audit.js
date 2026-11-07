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
    const targets = [...cmsFiles(), ...caseStudyFiles(), 'index.html', 'projects.html'];
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
function gateGeneratedDocs() {
    const before = ['llms.txt', 'index.html.md', 'projects.html.md']
        .filter(exists)
        .map(f => [f, read(f)]);
    try {
        execFileSync(process.execPath, [path.join(root, 'scripts', 'generate_llm_docs.js')], { stdio: 'pipe' });
    } catch (error) {
        fail('llm-docs', `generator failed: ${error.message}`);
        return;
    }
    const drifted = before.filter(([file, text]) => read(file) !== text).map(([file]) => file);
    if (drifted.length) fail('llm-docs', `regenerated and changed: ${drifted.join(', ')} — commit the regenerated files`);
    else pass('llms.txt and the .md mirrors are in sync with the CMS');
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

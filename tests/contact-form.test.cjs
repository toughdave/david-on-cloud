const { test } = require('node:test');
const assert = require('node:assert/strict');
const { initializeContactForm } = require('../js/contact-form.js');

function fixture(request) {
    const classes = new Set(['hidden']);
    const status = { textContent: '', classList: {
        add: (...names) => names.forEach(name => classes.add(name)),
        remove: (...names) => names.forEach(name => classes.delete(name))
    } };
    const button = { disabled: false };
    const fields = { name: 'Example Visitor', email: 'visitor@example.com', subject: 'Hello', message: 'Test message' };
    const form = {
        action: 'https://formspree.io/f/configured-destination',
        // Deliberately collide with the native form.name property.
        name: '', resets: 0, attrs: {},
        querySelector: selector => selector.includes('status') ? status : button,
        setAttribute: (key, value) => { form.attrs[key] = value; },
        addEventListener: (type, handler) => { form.submit = handler; },
        reset: () => { form.resets++; }
    };
    const originalFormData = global.FormData;
    global.FormData = class { constructor(input) { assert.equal(input, form); } *[Symbol.iterator]() { yield* Object.entries(fields); } };
    initializeContactForm(form, request);
    return { form, status, button, fields, classes, submit: () => form.submit({ preventDefault() {} }), restore: () => { global.FormData = originalFormData; } };
}

test('uses the configured destination and includes the visitor name', async () => {
    let captured;
    const f = fixture(async (url, options) => { captured = { url, options }; return { ok: true }; });
    try {
        await f.submit();
        assert.equal(captured.url, f.form.action);
        assert.deepEqual(JSON.parse(captured.options.body), f.fields);
        assert.equal(f.form.resets, 1);
        assert.match(f.status.textContent, /has been sent/);
    } finally { f.restore(); }
});

test('a successful retry replaces the previous failure text and styling', async () => {
    let attempts = 0;
    const f = fixture(async () => ({ ok: ++attempts > 1 }));
    try {
        await f.submit();
        assert.match(f.status.textContent, /could not be sent/);
        assert.equal(f.form.resets, 0);
        assert.ok(f.classes.has('text-red-600'));
        await f.submit();
        assert.match(f.status.textContent, /has been sent/);
        assert.ok(!f.classes.has('text-red-600'));
        assert.ok(f.classes.has('text-green-600'));
        assert.equal(f.form.resets, 1);
    } finally { f.restore(); }
});

test('network failure preserves input and re-enables the form', async () => {
    const f = fixture(async () => { throw new Error('Network unavailable'); });
    try {
        await f.submit();
        assert.equal(f.form.resets, 0);
        assert.equal(f.button.disabled, false);
        assert.equal(f.form.attrs['aria-busy'], 'false');
        assert.match(f.status.textContent, /email link/);
    } finally { f.restore(); }
});

test('duplicate submits cannot start a second request while one is pending', async () => {
    let finish, calls = 0;
    const f = fixture(() => { calls++; return new Promise(resolve => { finish = resolve; }); });
    try {
        const pending = f.submit();
        await f.submit();
        assert.equal(calls, 1);
        assert.equal(f.button.disabled, true);
        assert.equal(f.form.attrs['aria-busy'], 'true');
        finish({ ok: true });
        await pending;
        assert.equal(f.button.disabled, false);
    } finally { f.restore(); }
});

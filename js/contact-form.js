/* Contact form: preserve input on failure and announce each request's result. */
function initializeContactForm(form, request = fetch) {
    if (!form) return;
    const status = form.querySelector('[role="status"]') || document.getElementById('formStatus');
    const button = form.querySelector('button[type="submit"]');
    let sending = false;
    const showStatus = (message, failed = false) => {
        status.textContent = message;
        status.classList.remove('hidden', 'text-red-600', 'text-green-600');
        status.classList.add(failed ? 'text-red-600' : 'text-green-600');
    };
    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (sending) return;
        sending = true;
        button.disabled = true;
        form.setAttribute('aria-busy', 'true');
        showStatus('Sending your message…');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        try {
            const data = Object.fromEntries(new FormData(form));
            const response = await request(form.action, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(data),
                signal: controller.signal
            });
            if (!response.ok) throw new Error('Message was not accepted');
            showStatus('Thank you! Your message has been sent.');
            form.reset();
        } catch {
            showStatus('Your message could not be sent. Please try again or use the email link.', true);
        } finally {
            clearTimeout(timeout);
            sending = false;
            button.disabled = false;
            form.setAttribute('aria-busy', 'false');
        }
    });
}

if (typeof document !== 'undefined') initializeContactForm(document.getElementById('contactForm'));
if (typeof module !== 'undefined') module.exports = { initializeContactForm };

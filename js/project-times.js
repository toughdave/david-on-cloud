function timeAgo(date) {
    const now = new Date();
    const posted = new Date(date);
    const diff = Math.floor((now - posted) / 1000);

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff/60)} minute${Math.floor(diff/60) !== 1 ? 's' : ''} ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)} hour${Math.floor(diff/3600) !== 1 ? 's' : ''} ago`;
    if (diff < 604800) return `${Math.floor(diff/86400)} day${Math.floor(diff/86400) !== 1 ? 's' : ''} ago`;
    if (diff < 2592000) return `${Math.floor(diff/604800)} week${Math.floor(diff/604800) !== 1 ? 's' : ''} ago`;
    if (diff < 31536000) return `${Math.floor(diff/2592000)} month${Math.floor(diff/2592000) !== 1 ? 's' : ''} ago`;
    return `${Math.floor(diff/31536000)} year${Math.floor(diff/31536000) !== 1 ? 's' : ''} ago`;
}

function updateTimes() {
    document.querySelectorAll('[data-posted]').forEach(el => {
        const postedDate = el.getAttribute('data-posted');
        if (!postedDate) return;
        el.textContent = 'Posted · ' + timeAgo(postedDate);
    });
    document.querySelectorAll('[data-modified]').forEach(el => {
        const modifiedDate = el.getAttribute('data-modified');
        if (!modifiedDate) return;
        el.textContent = 'Updated · ' + timeAgo(modifiedDate);
    });
}
const TIME_UPDATE_INTERVAL = 60000;
let timeIntervalId = null;

function startTimeUpdates() {
    if (timeIntervalId) return;
    updateTimes();
    timeIntervalId = setInterval(updateTimes, TIME_UPDATE_INTERVAL);
}

function stopTimeUpdates() {
    if (!timeIntervalId) return;
    clearInterval(timeIntervalId);
    timeIntervalId = null;
}

startTimeUpdates();

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopTimeUpdates();
    } else {
        startTimeUpdates();
    }
});

// "More" link logic with overflow detection
const OVERFLOW_RECHECK_DELAY = 120;
const MOBILE_INTERACTION_REDUCE_QUERY = '(max-width: 768px)';
let interactionReduceTimer = 0;

const pulseMobileInteractionReduce = (duration = 240) => {
    if (!window.matchMedia(MOBILE_INTERACTION_REDUCE_QUERY).matches) return;
    document.body.classList.add('is-interacting');
    if (interactionReduceTimer) {
        window.clearTimeout(interactionReduceTimer);
    }
    interactionReduceTimer = window.setTimeout(() => {
        document.body.classList.remove('is-interacting');
        interactionReduceTimer = 0;
    }, duration);
};

const getCardBodyFromLink = (link) => {
    const targetId = link.getAttribute('data-target');
    if (targetId) {
        const body = document.getElementById(targetId);
        if (body) return body;
    }
    const previous = link.previousElementSibling;
    if (previous && previous.classList.contains('card-body')) return previous;
    return null;
};

const getMoreLinkFromBody = (body) => {
    const next = body.nextElementSibling;
    if (next && next.classList.contains('more-link')) return next;
    if (body.id) {
        const scoped = body.parentElement?.querySelector(`.more-link[data-target="${body.id}"]`);
        if (scoped) return scoped;
    }
    return null;
};

const updateMoreLinkState = (link, isExpanded) => {
    if (!link) return;
    const collapsedLabel = link.dataset.collapsedLabel || 'Read more...';
    const expandedLabel = link.dataset.expandedLabel || 'Show less';
    const textEl = link.querySelector('.more-link-text');
    const nextLabel = isExpanded ? expandedLabel : collapsedLabel;
    if (textEl) {
        textEl.textContent = nextLabel;
    } else {
        link.textContent = nextLabel;
    }
    link.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    link.classList.toggle('is-expanded', isExpanded);
};

function checkTextOverflow() {
    document.querySelectorAll('.card-body').forEach(body => {
        const moreLink = getMoreLinkFromBody(body);
        if (!moreLink) return;

        const isExpanded = body.classList.contains('expanded');
        const isOverflowing = body.scrollHeight > body.clientHeight + 1;
        const shouldShow = isOverflowing || isExpanded;

        if (shouldShow) {
            moreLink.style.display = 'inline-flex';
            body.classList.toggle('has-overflow', isOverflowing && !isExpanded);
        } else {
            moreLink.style.display = 'none';
            body.classList.remove('has-overflow');
            body.classList.remove('expanded');
        }

        updateMoreLinkState(moreLink, isExpanded && shouldShow);
    });
}

const scheduleOverflowCheck = (delay = OVERFLOW_RECHECK_DELAY) => {
    setTimeout(checkTextOverflow, delay);
};

window.refreshProjectOverflow = scheduleOverflowCheck;

// Run after DOM is loaded and fonts/styles are applied
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => scheduleOverflowCheck());
} else {
    scheduleOverflowCheck();
}

if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => scheduleOverflowCheck());
}

// Re-check on window resize
window.addEventListener('resize', () => scheduleOverflowCheck());

// Delegate click handling so dynamically injected cards work
document.addEventListener('click', (event) => {
    const link = event.target.closest('.more-link');
    if (!link) return;
    const body = getCardBodyFromLink(link);
    if (!body) return;

    pulseMobileInteractionReduce();

    const isExpanded = body.classList.toggle('expanded');
    updateMoreLinkState(link, isExpanded);
    if (!isExpanded) {
        scheduleOverflowCheck();
    } else {
        body.classList.remove('has-overflow');
    }
});
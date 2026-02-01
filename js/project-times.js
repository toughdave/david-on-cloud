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
        el.textContent = 'Date posted: ' + timeAgo(el.getAttribute('data-posted'));
    });
    document.querySelectorAll('[data-modified]').forEach(el => {
        el.textContent = 'Last modified: ' + timeAgo(el.getAttribute('data-modified'));
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

// "More..." link logic with overflow detection
function checkTextOverflow() {
    document.querySelectorAll('.card-body').forEach(body => {
        const moreLink = body.nextElementSibling;
        if (!moreLink || !moreLink.classList.contains('more-link')) return;
        
        // Check if text is actually overflowing (clamped)
        const isOverflowing = body.scrollHeight > body.clientHeight;
        
        if (isOverflowing) {
            // Show fade and "more..." link
            body.classList.add('has-overflow');
            moreLink.style.display = 'inline-flex';
        } else {
            // Hide fade and "more..." link
            body.classList.remove('has-overflow');
            moreLink.style.display = 'none';
            moreLink.setAttribute('aria-expanded', 'false');
        }
    });
}

// Run after DOM is loaded and fonts/styles are applied
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(checkTextOverflow, 100);
    });
} else {
    setTimeout(checkTextOverflow, 100);
}

// Re-check on window resize
window.addEventListener('resize', checkTextOverflow);

document.querySelectorAll('.more-link').forEach(link => {
    link.addEventListener('click', function() {
        const targetId = link.getAttribute('data-target');
        const body = document.getElementById(targetId);
        if (body.classList.contains('expanded')) {
            body.classList.remove('expanded');
            link.textContent = 'more...';
            link.setAttribute('aria-expanded', 'false');
            // Re-check overflow after collapse
            setTimeout(checkTextOverflow, 100);
        } else {
            body.classList.add('expanded');
            link.textContent = 'less...';
            link.setAttribute('aria-expanded', 'true');
        }
    });
});
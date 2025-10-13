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
setInterval(updateTimes, 1000);
updateTimes();

// "More..." link logic
document.querySelectorAll('.more-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = link.getAttribute('data-target');
        const body = document.getElementById(targetId);
        if (body.classList.contains('expanded')) {
            body.classList.remove('expanded');
            link.textContent = 'more...';
        } else {
            body.classList.add('expanded');
            link.textContent = 'less...';
        }
    });
});
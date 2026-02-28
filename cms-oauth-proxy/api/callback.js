const STATE_COOKIE_NAME = 'decap_oauth_state';

function parseCookies(cookieHeader) {
  return String(cookieHeader || '')
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce((acc, entry) => {
      const [name, ...rest] = entry.split('=');
      if (!name) return acc;
      acc[name] = decodeURIComponent(rest.join('='));
      return acc;
    }, {});
}

function clearStateCookie(req) {
  const host = String(req.headers.host || '');
  const isLocalhost = /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host);
  const attributes = [
    `${STATE_COOKIE_NAME}=`,
    'Path=/',
    'Max-Age=0',
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (!isLocalhost) attributes.push('Secure');
  return attributes.join('; ');
}

function resolveAllowedOrigin() {
  const configured = String(process.env.ALLOWED_ORIGIN || 'https://www.davidoncloud.com').trim();
  return configured.replace(/\/+$/, '') || 'https://www.davidoncloud.com';
}

function sendOAuthPopupResponse(req, res, status, content, allowedOrigin) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Set-Cookie', clearStateCookie(req));
  res.status(200).send(postMessageHTML(status, content, allowedOrigin));
}

export default async function handler(req, res) {
  const { code, state } = req.query;
  const allowedOrigin = resolveAllowedOrigin();

  if (!code) {
    res.status(400).send('Missing code parameter');
    return;
  }

  if (!state) {
    sendOAuthPopupResponse(req, res, 'error', JSON.stringify({ error: 'missing_state' }), allowedOrigin);
    return;
  }

  const cookieState = parseCookies(req.headers.cookie || '')[STATE_COOKIE_NAME] || '';
  if (!cookieState || cookieState !== String(state)) {
    sendOAuthPopupResponse(req, res, 'error', JSON.stringify({ error: 'invalid_state' }), allowedOrigin);
    return;
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    res.status(500).send('OAuth credentials not configured');
    return;
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const data = await tokenResponse.json();

    if (data.error) {
      sendOAuthPopupResponse(req, res, 'error', JSON.stringify(data), allowedOrigin);
      return;
    }

    const token = data.access_token;
    const provider = 'github';
    sendOAuthPopupResponse(req, res, 'success', JSON.stringify({ token, provider }), allowedOrigin);
  } catch (err) {
    sendOAuthPopupResponse(req, res, 'error', err.message, allowedOrigin);
  }
}

function postMessageHTML(status, content, allowedOrigin) {
  const safeStatus = String(status || 'error').replace(/[^a-z]/gi, '').toLowerCase();
  const safeContent = String(content || '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r?\n/g, '\\n');
  const safeAllowedOrigin = JSON.stringify(String(allowedOrigin || 'https://www.davidoncloud.com'));

  return `<!DOCTYPE html>
<html>
<head><title>CMS OAuth</title></head>
<body>
<script>
(function() {
  var targetOrigin = ${safeAllowedOrigin};
  if (!window.opener) {
    setTimeout(function() { window.close(); }, 100);
    return;
  }

  function receiveMessage(e) {
    if (e.origin !== targetOrigin) return;
    window.removeEventListener("message", receiveMessage, false);
    window.opener.postMessage(
      'authorization:github:${safeStatus}:${safeContent}',
      targetOrigin
    );
    setTimeout(function() { window.close(); }, 250);
  }

  window.addEventListener("message", receiveMessage, false);
  window.opener.postMessage("authorizing:github", targetOrigin);
})();
</script>
</body>
</html>`;
}

import { randomBytes } from 'node:crypto';

const STATE_COOKIE_NAME = 'decap_oauth_state';
const STATE_TTL_SECONDS = 600;

function buildStateCookie(req, value, maxAgeSeconds) {
  const host = String(req.headers.host || '');
  const isLocalhost = /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host);
  const attributes = [
    `${STATE_COOKIE_NAME}=${value}`,
    'Path=/',
    `Max-Age=${maxAgeSeconds}`,
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (!isLocalhost) attributes.push('Secure');
  return attributes.join('; ');
}

export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const host = String(req.headers.host || '');
  const isLocalhost = /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host);

  if (!clientId) {
    res.status(500).send('GITHUB_CLIENT_ID not configured');
    return;
  }

  const scope = 'public_repo,user';
  const configuredCallback = process.env.OAUTH_CALLBACK_URL;
  if (!configuredCallback && !isLocalhost) {
    res.status(500).send('OAUTH_CALLBACK_URL not configured');
    return;
  }
  const redirectUri = configuredCallback || `http://${host}/callback`;
  const state = randomBytes(32).toString('hex');
  const query = new URLSearchParams({
    client_id: clientId,
    scope,
    redirect_uri: redirectUri,
    state,
  });
  const authUrl =
    `https://github.com/login/oauth/authorize` +
    `?${query.toString()}`;

  res.writeHead(302, {
    Location: authUrl,
    'Set-Cookie': buildStateCookie(req, state, STATE_TTL_SECONDS),
    'Cache-Control': 'no-store',
  });
  res.end();
}

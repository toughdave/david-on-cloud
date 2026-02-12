export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;

  if (!clientId) {
    res.status(500).send('GITHUB_CLIENT_ID not configured');
    return;
  }

  const scope = 'repo,user';
  const authUrl =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${clientId}` +
    `&scope=${scope}` +
    `&redirect_uri=${encodeURIComponent(process.env.OAUTH_CALLBACK_URL || `https://${req.headers.host}/callback`)}`;

  res.writeHead(302, { Location: authUrl });
  res.end();
}

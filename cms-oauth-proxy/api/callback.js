export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    res.status(400).send('Missing code parameter');
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
      const errorContent = JSON.stringify(data);
      res.status(200).send(postMessageHTML('error', errorContent));
      return;
    }

    const token = data.access_token;
    const provider = 'github';
    res.status(200).send(postMessageHTML('success', JSON.stringify({ token, provider })));
  } catch (err) {
    res.status(200).send(postMessageHTML('error', err.message));
  }
}

function postMessageHTML(status, content) {
  return `<!DOCTYPE html>
<html>
<head><title>CMS OAuth</title></head>
<body>
<script>
(function() {
  function sendMsg(msg) {
    if (window.opener) {
      window.opener.postMessage(msg, '*');
      setTimeout(function() { window.close(); }, 200);
    }
  }
  sendMsg('authorization:github:${status}:${content.replace(/'/g, "\\'")}');
})();
</script>
</body>
</html>`;
}

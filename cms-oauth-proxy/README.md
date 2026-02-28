# CMS OAuth Proxy for davidoncloud.com

A lightweight GitHub OAuth proxy enabling Decap CMS authentication.
Deploy this as a standalone Vercel project (separate from the main site).

## Environment Variables (set in Vercel dashboard)

| Variable | Description |
|----------|-------------|
| `GITHUB_CLIENT_ID` | From your GitHub OAuth App |
| `GITHUB_CLIENT_SECRET` | From your GitHub OAuth App |
| `OAUTH_CALLBACK_URL` | Full callback URL for the proxy (for example `https://david-on-cloud-cms-oauth.vercel.app/callback`) |
| `ALLOWED_ORIGIN` | Main site origin allowed for popup postMessage (for example `https://www.davidoncloud.com`) |

## OAuth Scope

- The proxy requests `public_repo,user` by default.
- If you later switch to a private repository for CMS content, update the scope to `repo,user` in `api/auth.js` and verify access requirements first.

## Deployment

```bash
cd cms-oauth-proxy
npx vercel --prod
```

Or connect this folder to Vercel via the dashboard (import from GitHub, set root directory to `cms-oauth-proxy`).

## After Deployment

1. Copy the Vercel deployment URL (e.g. `https://david-on-cloud-cms-oauth.vercel.app`)
2. Update your GitHub OAuth App's callback URL to: `https://<your-vercel-url>/callback`
3. Update `admin/config.yml` in the main site with `base_url: https://<your-vercel-url>`
4. Set `OAUTH_CALLBACK_URL` and `ALLOWED_ORIGIN` in Vercel to match production values.

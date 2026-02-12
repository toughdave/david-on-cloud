# CMS OAuth Proxy for davidoncloud.com

A lightweight GitHub OAuth proxy enabling Decap CMS authentication.
Deploy this as a standalone Vercel project (separate from the main site).

## Environment Variables (set in Vercel dashboard)

| Variable | Description |
|----------|-------------|
| `GITHUB_CLIENT_ID` | From your GitHub OAuth App |
| `GITHUB_CLIENT_SECRET` | From your GitHub OAuth App |

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

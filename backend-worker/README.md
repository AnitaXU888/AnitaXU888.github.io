# Cloudflare Workers Proxy (Free)

This is the free deployment path without Render or credit card.
It proxies `/api/ai-match` to Tencent LKEAP and keeps your API key in Worker secrets.

## 1) Install Wrangler

```bash
npm install -g wrangler
wrangler login
```

## 2) Deploy from this folder

```bash
cd backend-worker
wrangler secret put UPSTREAM_API_KEY
```

When prompted, paste your Tencent key.

Then deploy:

```bash
wrangler deploy
```

Wrangler will print a URL like:

`https://anita-ai-match-proxy.<subdomain>.workers.dev`

## 3) Configure environment vars (optional but recommended)

You can edit `wrangler.toml` for:

- `UPSTREAM_API_ENDPOINT`
- `UPSTREAM_AUTH_SCHEME`
- `DEFAULT_MODEL`
- `ALLOWED_ORIGINS`

Then redeploy:

```bash
wrangler deploy
```

## 4) Health check

```bash
curl https://<your-worker-domain>/health
```

## 5) Frontend endpoint

Set in `index.html`:

```js
endpoint: "https://<your-worker-domain>/api/ai-match"
```

## 6) Local dev

```bash
wrangler dev
```

Local endpoint:

`http://127.0.0.1:8787/api/ai-match`

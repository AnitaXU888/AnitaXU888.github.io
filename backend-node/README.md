# AI Match Proxy (Node)

This service is the backend proxy for your portfolio AI matcher.
Frontend calls `/api/ai-match`, and this server forwards requests to Tencent LKEAP.

## 1) Local run

```bash
cd backend-node
npm install
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000
UPSTREAM_API_KEY=your_new_tencent_key
UPSTREAM_API_ENDPOINT=https://api.lkeap.cloud.tencent.com
UPSTREAM_AUTH_SCHEME=Bearer
DEFAULT_MODEL=deepseek-v3
ALLOWED_ORIGINS=
```

Start:

```bash
npm start
```

Health check:

```bash
GET http://localhost:3000/health
```

## 2) Frontend endpoint

Your `index.html` already defaults to:

- local: `http://localhost:3000/api/ai-match`
- production: `https://YOUR_BACKEND_DOMAIN/api/ai-match`

Replace `YOUR_BACKEND_DOMAIN` with your deployed backend domain.

## 3) Deploy on Render

1. Create a new Web Service, root directory: `backend-node`
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Add environment variables:
   - `UPSTREAM_API_KEY`
   - `UPSTREAM_API_ENDPOINT` (can be just `https://api.lkeap.cloud.tencent.com`)
   - `UPSTREAM_AUTH_SCHEME` (`Bearer`)
   - `DEFAULT_MODEL` (your available model)
   - `ALLOWED_ORIGINS` (your GitHub Pages domain)

## 4) Security notes

- Never expose `UPSTREAM_API_KEY` in frontend.
- If an old key was leaked, revoke it immediately and rotate to a new one.

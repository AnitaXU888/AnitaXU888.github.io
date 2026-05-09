import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DEFAULT_UPSTREAM_ENDPOINT = "https://api.lkeap.cloud.tencent.com/v1/chat/completions";
const DEFAULT_MODEL = process.env.DEFAULT_MODEL || "deepseek-v3";
const UPSTREAM_AUTH_SCHEME = process.env.UPSTREAM_AUTH_SCHEME || "Bearer";

function resolveUpstreamEndpoint(rawEndpoint) {
  const endpoint = (rawEndpoint || DEFAULT_UPSTREAM_ENDPOINT).trim();
  if (!endpoint) return DEFAULT_UPSTREAM_ENDPOINT;
  if (/\/v1\/chat\/completions$/i.test(endpoint)) return endpoint;
  return `${endpoint.replace(/\/+$/, "")}/v1/chat/completions`;
}

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Origin not allowed"));
  }
}));

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_, res) => {
  res.json({ ok: true, service: "ai-match-proxy" });
});

app.post("/api/ai-match", async (req, res) => {
  try {
    const apiKey = process.env.UPSTREAM_API_KEY || process.env.DASHSCOPE_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "server_missing_upstream_api_key" });
      return;
    }

    const { model, messages, temperature } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "messages_required" });
      return;
    }

    const selectedModel = model || DEFAULT_MODEL;
    const upstreamEndpoint = resolveUpstreamEndpoint(process.env.UPSTREAM_API_ENDPOINT);
    const safeTemp = typeof temperature === "number" ? temperature : 0.2;

    const upstreamResp = await fetch(upstreamEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${UPSTREAM_AUTH_SCHEME} ${apiKey}`
      },
      body: JSON.stringify({
        model: selectedModel,
        messages,
        temperature: safeTemp,
        stream: false
      })
    });

    const raw = await upstreamResp.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = { raw };
    }
    res.status(upstreamResp.status).json(data);
  } catch (error) {
    console.error("AI proxy error:", error);
    res.status(500).json({ error: "proxy_internal_error", detail: String(error) });
  }
});

app.listen(PORT, () => {
  const upstreamEndpoint = resolveUpstreamEndpoint(process.env.UPSTREAM_API_ENDPOINT);
  console.log(`AI proxy is running on http://localhost:${PORT}`);
  console.log(`Upstream endpoint: ${upstreamEndpoint}`);
});

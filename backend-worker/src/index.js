function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders
    }
  });
}

function normalizeEndpoint(rawEndpoint) {
  const endpoint = (rawEndpoint || "https://api.lkeap.cloud.tencent.com/v1/chat/completions").trim();
  if (/\/v1\/chat\/completions$/i.test(endpoint)) return endpoint;
  return `${endpoint.replace(/\/+$/, "")}/v1/chat/completions`;
}

function buildCorsHeaders(origin, allowedOrigins) {
  if (!origin) return {};
  const list = (allowedOrigins || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (list.length === 0 || list.includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
  }
  return {};
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const corsHeaders = buildCorsHeaders(origin, env.ALLOWED_ORIGINS);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (url.pathname === "/health") {
      return json({ ok: true, service: "ai-match-worker-proxy" }, 200, corsHeaders);
    }

    if (url.pathname !== "/api/ai-match" || request.method !== "POST") {
      return json({ error: "not_found" }, 404, corsHeaders);
    }

    if (!env.UPSTREAM_API_KEY) {
      return json({ error: "server_missing_upstream_api_key" }, 500, corsHeaders);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: "invalid_json_body" }, 400, corsHeaders);
    }

    const { model, messages, temperature } = payload || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return json({ error: "messages_required" }, 400, corsHeaders);
    }

    const endpoint = normalizeEndpoint(env.UPSTREAM_API_ENDPOINT);
    const selectedModel = model || env.DEFAULT_MODEL || "deepseek-v3";
    const authScheme = env.UPSTREAM_AUTH_SCHEME || "Bearer";
    const safeTemperature = typeof temperature === "number" ? temperature : 0.2;

    try {
      const upstreamResp = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${authScheme} ${env.UPSTREAM_API_KEY}`
        },
        body: JSON.stringify({
          model: selectedModel,
          messages,
          temperature: safeTemperature,
          stream: false
        })
      });

      const text = await upstreamResp.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
      return json(data, upstreamResp.status, corsHeaders);
    } catch (error) {
      return json({ error: "proxy_internal_error", detail: String(error) }, 500, corsHeaders);
    }
  }
};

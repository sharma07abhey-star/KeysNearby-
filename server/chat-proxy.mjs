// Optional: lets KeyBot answer with a real AI model instead of the built-in rules.
//
//   1. Put your key in the environment:   ANTHROPIC_API_KEY=sk-ant-...
//   2. Start this server:                 node server/chat-proxy.mjs
//   3. Tell the app where it is (.env):   VITE_CHAT_API_URL=http://localhost:8787/api/chat
//
// The key stays on this server. NEVER put it in the React code: anything in
// the browser bundle can be read by every visitor.
import http from "node:http";

const PORT = process.env.PORT || 8787;
const MODEL = process.env.CHAT_MODEL || "claude-haiku-5-5";
const KEY = process.env.ANTHROPIC_API_KEY;

const SYSTEM = `You are KeyBot, the assistant inside Keys Nearby, a peer-to-peer vehicle rental
and ride-pooling app. Help users find vehicles, understand prices, plan shared rides and list
their own vehicles. Use ONLY the JSON context provided for vehicles, bookings and rides; if
something isn't there, say so. Prices are in rupees per day. Keep answers short (under 90 words).
For emergencies tell the user to call 112. Do not claim payments or bookings have been made.`;

http
  .createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    if (req.method === "OPTIONS") return res.writeHead(204).end();
    if (req.method !== "POST" || req.url !== "/api/chat") return res.writeHead(404).end();
    if (!KEY) return res.writeHead(500).end(JSON.stringify({ error: "ANTHROPIC_API_KEY is not set" }));

    let body = "";
    for await (const chunk of req) body += chunk;
    try {
      const { messages, context } = JSON.parse(body);
      const upstream = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": KEY, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 400,
          system: `${SYSTEM}\n\nContext:\n${JSON.stringify(context)}`,
          messages: messages.slice(-10),
        }),
      });
      const data = await upstream.json();
      if (!upstream.ok) throw new Error(data.error?.message || `Upstream ${upstream.status}`);
      const reply = data.content?.filter((b) => b.type === "text").map((b) => b.text).join("\n") || "";
      res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ reply }));
    } catch (error) {
      res.writeHead(502, { "content-type": "application/json" }).end(JSON.stringify({ error: error.message }));
    }
  })
  .listen(PORT, () => console.log(`KeyBot proxy on http://localhost:${PORT}/api/chat (model ${MODEL})`));

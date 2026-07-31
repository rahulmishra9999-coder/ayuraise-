import { createFileRoute } from "@tanstack/react-router";

type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Live chat endpoint. Prefers Anthropic Claude (ANTHROPIC_API_KEY); falls back to
 * OpenAI (OPENAI_API_KEY), then the legacy Lovable gateway (LOVABLE_API_KEY).
 * Always streams plain-text tokens — the client just appends them.
 */
export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: ChatMsg[]; system?: string };
        const messages = Array.isArray(body.messages) ? body.messages : [];
        const system = body.system ?? "";

        if (process.env.ANTHROPIC_API_KEY) return claude(system, messages, process.env.ANTHROPIC_API_KEY);
        if (process.env.OPENAI_API_KEY) return openai(system, messages, process.env.OPENAI_API_KEY);
        if (process.env.LOVABLE_API_KEY) return lovable(system, messages, process.env.LOVABLE_API_KEY);
        return new Response(
          "No AI key configured. Add ANTHROPIC_API_KEY (or OPENAI_API_KEY) to your .env, then restart.",
          { status: 500 },
        );
      },
    },
  },
});

const textStreamHeaders = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-cache",
};

/* ---------------- Anthropic Claude ---------------- */
async function claude(system: string, messages: ChatMsg[], key: string) {
  // Claude takes system separately and only user/assistant turns in `messages`.
  const turns = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role, content: m.content }));

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      stream: true,
      system,
      messages: turns,
    }),
  });
  if (!upstream.ok || !upstream.body) return upstreamError(upstream);

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      let buf = "";
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const parts = buf.split("\n\n");
          buf = parts.pop() ?? "";
          for (const part of parts) {
            for (const line of part.split("\n")) {
              if (!line.startsWith("data:")) continue;
              const payload = line.slice(5).trim();
              if (!payload || payload === "[DONE]") continue;
              try {
                const json = JSON.parse(payload);
                if (json.type === "content_block_delta" && typeof json.delta?.text === "string") {
                  controller.enqueue(encoder.encode(json.delta.text));
                }
              } catch { /* ignore keep-alives */ }
            }
          }
        }
        controller.close();
      } catch (err) { controller.error(err); }
    },
  });
  return new Response(stream, { headers: textStreamHeaders });
}

/* ---------------- OpenAI (fallback) ---------------- */
async function openai(system: string, messages: ChatMsg[], key: string) {
  const finalMessages: ChatMsg[] = system ? [{ role: "system", content: system }, ...messages] : messages;
  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini", stream: true, messages: finalMessages }),
  });
  if (!upstream.ok || !upstream.body) return upstreamError(upstream);
  return new Response(openAIStyleStream(upstream.body), { headers: textStreamHeaders });
}

/* ---------------- Lovable (legacy fallback) ---------------- */
async function lovable(system: string, messages: ChatMsg[], key: string) {
  const finalMessages: ChatMsg[] = system ? [{ role: "system", content: system }, ...messages] : messages;
  const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "google/gemini-2.5-flash", stream: true, messages: finalMessages }),
  });
  if (!upstream.ok || !upstream.body) return upstreamError(upstream);
  return new Response(openAIStyleStream(upstream.body), { headers: textStreamHeaders });
}

/* OpenAI-style SSE → plain text tokens (shared by OpenAI + Lovable). */
function openAIStyleStream(body: ReadableStream<Uint8Array>) {
  return new ReadableStream({
    async start(controller) {
      const reader = body.getReader();
      let buf = "";
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const parts = buf.split("\n\n");
          buf = parts.pop() ?? "";
          for (const part of parts) {
            for (const line of part.split("\n")) {
              if (!line.startsWith("data:")) continue;
              const payload = line.slice(5).trim();
              if (payload === "[DONE]") { controller.close(); return; }
              try {
                const json = JSON.parse(payload);
                const delta = json.choices?.[0]?.delta?.content;
                if (typeof delta === "string" && delta.length) controller.enqueue(encoder.encode(delta));
              } catch { /* ignore */ }
            }
          }
        }
        controller.close();
      } catch (err) { controller.error(err); }
    },
  });
}

async function upstreamError(upstream: Response) {
  const text = await upstream.text().catch(() => "");
  const status = upstream.status === 429 ? 429 : upstream.status === 402 ? 402 : 500;
  return new Response(text || "AI provider error", { status });
}

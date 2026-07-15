import { createFileRoute } from "@tanstack/react-router";

type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: ChatMsg[]; system?: string };
        const messages = Array.isArray(body.messages) ? body.messages : [];
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const finalMessages: ChatMsg[] = body.system
          ? [{ role: "system", content: body.system }, ...messages]
          : messages;

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            stream: true,
            messages: finalMessages,
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const text = await upstream.text().catch(() => "");
          const status = upstream.status === 429 ? 429 : upstream.status === 402 ? 402 : 500;
          return new Response(text || "AI gateway error", { status });
        }

        // Transform OpenAI-style SSE into a plain text stream of tokens.
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
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
                    if (payload === "[DONE]") {
                      controller.close();
                      return;
                    }
                    try {
                      const json = JSON.parse(payload);
                      const delta = json.choices?.[0]?.delta?.content;
                      if (typeof delta === "string" && delta.length) {
                        controller.enqueue(encoder.encode(delta));
                      }
                    } catch {
                      // ignore malformed keep-alive chunks
                    }
                  }
                }
              }
              controller.close();
            } catch (err) {
              controller.error(err);
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      },
    },
  },
});

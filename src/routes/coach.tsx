// Ayu — the always-there coach, styled like the chat app everyone already knows.
// Quick-reply chips mean most turns need zero typing. Understands food descriptions
// and punches calories into today's log via a [cal: n] directive.

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Bot, CheckCheck, Send } from "lucide-react";
import { toast } from "sonner";
import { addCalEntry, calInTotal } from "@/lib/trackers";
import { loadProfile } from "@/lib/weight-loss";

export const Route = createFileRoute("/coach")({
  validateSearch: (s: Record<string, unknown>): { seed?: string } => ({ seed: typeof s.seed === "string" ? s.seed : undefined }),
  head: () => ({
    meta: [
      { title: "Ayu AI · AyuRaise" },
      { name: "description", content: "Your personal Ayurveda + yoga AI coach." },
    ],
  }),
  component: CoachPage,
});

type Msg = { role: "user" | "assistant"; content: string; time: string };

const STARTERS = [
  "Log my food 🍽️",
  "Help with acidity",
  "Best pranayam for anxiety",
  "What should I eat this season?",
  "Explain my report",
];

function buildSystem() {
  const name = loadProfile()?.name?.split(/\s+/)[0];
  return `You are Ayu, AyuRaise's warm Ayurvedic wellness coach${name ? ` talking to ${name}` : ""}. Chat like a caring friend on WhatsApp: short messages, one idea each, warm but never preachy.

CAPABILITIES:
1. CALORIE PUNCHING — when the user describes food they ate (any language, any detail level), estimate total calories with a one-line breakdown, then END that message with a directive on its own line: [cal: <number>] . The app turns it into a punch button. Ask ONE clarifying question max (portion size) before estimating; when unsure, estimate anyway with a range and use the middle for the directive.
2. General Ayurveda/lifestyle guidance: diet, yoga, pranayam, herbs, sleep, fasting, seasonal illness support. Never diagnose; never change prescribed medication; add a gentle "check with your doctor" where relevant.
3. Report questions: the user may paste values from a medical report (theirs or family's). Explain simply and suggest lifestyle steps. Urge a doctor's review for anything abnormal.

Style rules:
- EVERY question you ask must end with a final line EXACTLY like: [options: Choice one | Choice two | Something else] — chips the user can tap. Keep each under 4 words. Skip the options line when you are not asking anything.
- 2-4 short sentences per message. Emojis welcome, sparingly.`;
}

function parseMsg(content: string): { text: string; options: string[]; cal: number | null } {
  let text = content;
  let cal: number | null = null;
  const calM = text.match(/\[cal:\s*(\d+)\s*\]/i);
  if (calM) { cal = parseInt(calM[1], 10); text = text.replace(calM[0], "").trimEnd(); }
  const optM = text.match(/\n?\[options:\s*([^\]]+)\]\s*$/i);
  if (!optM) return { text: text.trim(), options: [], cal };
  return {
    text: text.slice(0, optM.index).trim(),
    options: optM[1].split("|").map((s) => s.trim()).filter(Boolean),
    cal,
  };
}

const nowTime = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function CoachPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [partial, setPartial] = useState("");
  const [punched, setPunched] = useState<Record<number, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, partial]);

  // arrived with ?seed=… (e.g. from a yoga-session feedback tap) → open the chat with that message
  const { seed } = Route.useSearch();
  const seededRef = useRef(false);
  useEffect(() => {
    if (seed && !seededRef.current) { seededRef.current = true; void send(seed); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed, time: nowTime() }];
    setMessages(next);
    setInput("");
    setStreaming(true);
    setPartial("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: buildSystem(), messages: next.map(({ role, content }) => ({ role, content })) }),
      });
      if (!res.ok || !res.body) throw new Error(res.status === 429 ? "Ayu is busy — try again in a moment." : "Chat failed — check your connection.");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let full = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        full += dec.decode(value, { stream: true });
        setPartial(full);
      }
      setMessages((m) => [...m, { role: "assistant", content: full, time: nowTime() }]);
      setPartial("");
    } catch (e) {
      toast.error((e as Error).message);
      setPartial("");
    } finally {
      setStreaming(false);
    }
  }

  const punchCal = (idx: number, cal: number) => {
    addCalEntry({ kind: "in", label: "Via Ayu", kcal: cal });
    setPunched((p) => ({ ...p, [idx]: true }));
    toast.success(`+${cal} kcal punched · ${calInTotal()} today`);
  };

  const lastAssistantIdx = messages.length - 1;
  const last = messages[lastAssistantIdx];
  const lastOptions = !streaming && last?.role === "assistant" ? parseMsg(last.content).options : [];

  return (
    <div className="flex min-h-svh flex-col bg-[#efeae2] pb-24 dark:bg-[#0b141a]">
      {/* WhatsApp-style header */}
      <header className="sticky top-0 z-20 flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground shadow-md">
        <div className="relative">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20"><Bot size={20} /></span>
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-primary bg-emerald-300" />
        </div>
        <div className="flex-1">
          <p className="font-display text-[15.5px] font-semibold leading-tight">Ayu</p>
          <p className="text-[11px] opacity-85">{streaming ? "typing…" : "online · your wellness coach"}</p>
        </div>
      </header>

      {/* messages */}
      <div ref={scrollRef} className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-3">
        {messages.length === 0 && (
          <div className="mx-auto mt-6 max-w-[85%] rounded-2xl bg-white/90 p-4 text-center shadow-sm dark:bg-[#202c33]">
            <p className="text-[13.5px] font-semibold text-foreground">Namaste 🙏 I'm Ayu.</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
              Tell me what you ate and I'll punch the calories, or ask me anything — acidity, sleep, yoga, a report you're worried about.
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {STARTERS.map((s) => (
                <button key={s} onClick={() => void send(s)} className="rounded-full bg-primary/10 px-3 py-1.5 text-[12px] font-semibold text-primary">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => {
          const { text, cal } = m.role === "assistant" ? parseMsg(m.content) : { text: m.content, cal: null };
          const user = m.role === "user";
          return (
            <div key={i} className={`flex ${user ? "justify-end" : "justify-start"}`}>
              <div
                className={`relative max-w-[82%] rounded-xl px-3 py-2 shadow-sm ${
                  user
                    ? "rounded-tr-[4px] bg-[#d9fdd3] text-[#111b21] dark:bg-[#005c4b] dark:text-[#e9edef]"
                    : "rounded-tl-[4px] bg-white text-[#111b21] dark:bg-[#202c33] dark:text-[#e9edef]"
                }`}
              >
                <p className="whitespace-pre-wrap text-[13.5px] leading-snug">{text}</p>
                {cal !== null && (
                  <button
                    onClick={() => !punched[i] && punchCal(i, cal)}
                    disabled={!!punched[i]}
                    className={`mt-2 w-full rounded-xl px-3 py-2 text-[12.5px] font-bold ${punched[i] ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-primary text-primary-foreground"}`}
                  >
                    {punched[i] ? `✓ ${cal} kcal punched` : `➕ Punch ${cal} kcal to today`}
                  </button>
                )}
                <span className="mt-0.5 flex items-center justify-end gap-1 text-[9.5px] text-black/40 dark:text-white/40">
                  {m.time}
                  {user && <CheckCheck size={12} className="text-sky-500" />}
                </span>
              </div>
            </div>
          );
        })}

        {streaming && partial && (
          <div className="flex justify-start">
            <div className="max-w-[82%] rounded-xl rounded-tl-[4px] bg-white px-3 py-2 shadow-sm dark:bg-[#202c33]">
              <p className="whitespace-pre-wrap text-[13.5px] leading-snug text-[#111b21] dark:text-[#e9edef]">{parseMsg(partial).text}</p>
            </div>
          </div>
        )}
        {streaming && !partial && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-xl bg-white px-3 py-2.5 shadow-sm dark:bg-[#202c33]">
              {[0, 150, 300].map((d) => (
                <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}

        {/* quick replies */}
        {lastOptions.length > 0 && (
          <div className="mt-1 flex flex-wrap justify-end gap-1.5">
            {lastOptions.map((o) => (
              <button
                key={o}
                onClick={() => void send(o)}
                className="rounded-full border border-primary/40 bg-white px-3.5 py-2 text-[12.5px] font-semibold text-primary shadow-sm dark:bg-[#202c33]"
              >
                {o}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* composer */}
      <div className="fixed inset-x-0 bottom-[76px] z-20 px-3 py-2">
        <form
          onSubmit={(e) => { e.preventDefault(); void send(input); }}
          className="mx-auto flex max-w-xl items-end gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(input); } }}
            rows={1}
            placeholder="Message Ayu…"
            disabled={streaming}
            className="max-h-28 flex-1 resize-none rounded-full bg-white px-4 py-3 text-[14px] leading-snug text-[#111b21] shadow-md outline-none dark:bg-[#202c33] dark:text-[#e9edef]"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md disabled:opacity-40"
          >
            <Send size={17} />
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}

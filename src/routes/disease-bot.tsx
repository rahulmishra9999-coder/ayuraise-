import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import {
  DISEASES, SEASONAL_DISEASES, TOOL_META, getDisease,
  type ToolKey, type Track,
} from "@/lib/diseases";
import {
  saveDiseasePlan, startDiseasePipeline, getDiseasePipeline, PIPELINE_ROUTE,
  type DiseasePlan,
} from "@/lib/disease-plan";
import { ArrowLeft, Bot, RotateCcw, Send, Sparkles, User } from "lucide-react";
import { toast } from "sonner";

type BotMode = "open" | "verify" | "acute";

export const Route = createFileRoute("/disease-bot")({
  validateSearch: (s: Record<string, unknown>) => ({
    slug: typeof s.slug === "string" ? (s.slug as string) : undefined,
    tool: typeof s.tool === "string" ? (s.tool as string) : undefined,
    mode: (s.mode === "open" || s.mode === "verify" || s.mode === "acute")
      ? (s.mode as BotMode)
      : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Plan bot · AyuRaise" },
      { name: "description", content: "Chat with the AyuRaise AI plan coach to build a personalised disease-management plan." },
    ],
  }),
  component: DiseaseBot,
});

type Msg = { role: "user" | "assistant"; content: string };

const TOOL_KEYS = Object.keys(TOOL_META) as ToolKey[];

function buildSystemPrompt(mode: BotMode, slug?: string, tool?: string) {
  const disease = slug ? getDisease(slug) : undefined;
  const chronicList = DISEASES.map((d) => `- ${d.slug}: ${d.name}`).join("\n");
  const seasonalList = SEASONAL_DISEASES.map((d) => `- ${d.slug}: ${d.name}`).join("\n");
  const toolList = TOOL_KEYS.map((k) => `- ${k}: ${TOOL_META[k].label}`).join("\n");

  const planDirective = `When the plan is ready, your FINAL message must START with the exact line "Here's your personalised plan", then short bulleted sections per chosen tool, then on the VERY LAST line output a machine directive in EXACTLY this format (the app parses it, the user won't mind seeing it):
[plan: slug=<condition-slug>; track=manage OR prevent; tools=<comma-separated tool keys>; secondary=<comma-separated slugs or empty>; sequence=<slug@days or empty>]
Use tool keys only from the tool list. Put diet last if included. Never add [options: ...] to this final message.`;

  const safety = `Safety: never diagnose; never tell the user to start, stop or change prescribed medication; add a gentle "check with your doctor" note where relevant. Recommend the highest-starred tools first and mention which are less useful for this condition.`;

  const chipRule = `EVERY question message MUST end with a final line EXACTLY like:
[options: Choice one | Choice two | Something else]
Keep each choice under 4 words and always include an escape option (Something else / Skip / Nothing else). One short, warm question per message.`;

  const starInfo = disease
    ? `Selected condition: ${disease.name} (slug: ${disease.slug}). Tool relevance (0-5 stars): ${TOOL_KEYS.map((k) => `${k}=${disease.relevance[k]}`).join(", ")}.`
    : "";

  if (mode === "acute") {
    return `You are AyuRaise's calm, quick Ayurvedic helper for a SEASONAL / ACUTE illness${disease ? ` (${disease.name})` : ""}. Keep it short — the user may be unwell.

Flow:
1. Warm one-line intro, then ask the main symptom / how they feel.
2. Ask how many days it's been and how severe (mild / moderate / severe).
3. RED-FLAG SCREEN — ask if they have any danger signs for this illness${disease ? ` (for ${disease.name}: ${disease.basic.redFlags.join("; ")})` : ""}. If YES to any: STOP the plan, urge them to see a doctor now, and give only safe supportive care (fluids, rest). Do not build a multi-step plan.
4. If no red flags: give a focused "next few days" relief plan — herbs, home remedies, diet and rest. Light yoga only in recovery.

${chipRule}
${safety}

Available seasonal conditions:
${seasonalList}

Available tools:
${toolList}

${starInfo}
For acute illness, when you give the relief plan, START the final message with "Here's your relief plan" and end with the plan directive:
[plan: slug=<slug>; track=manage; tools=<remedies,herbs,diet,...>; secondary=; sequence=]
If red flags were present, do NOT emit a plan directive — just the safety guidance.`;
  }

  // open + verify (chronic)
  const verifyIntro = mode === "verify" && disease
    ? `The user opened this from the ${disease.name} page. FIRST verify they actually have it before building: ask if a doctor diagnosed it, roughly when, whether they're on medication, and any recent test values or current symptoms. If their answers suggest they do NOT have it, gently offer: build a PREVENTION plan instead, or switch to the real concern. Then continue.`
    : "";

  return `You are AyuRaise's warm, concise Ayurvedic wellness coach — like a good doctor, not a form. You build a personalised plan to MANAGE or PREVENT a chronic condition. Takes about 2–3 minutes.

${verifyIntro}

Flow (skip anything already known):
1. Warm intro + first question.
2. Do they HAVE the condition, are they AT RISK, or does a FAMILY member have it? (sets track = manage vs prevent)
3. PRIMARY condition (from the chronic list) — only if unclear.
4. Ask about a SECONDARY concern or symptom they'd also like to address (optional).
   - Triage the secondary: (a) if it's really just a SYMPTOM of the primary, say so and fold it in; (b) if the two CONFLICT (a good intervention for one would worsen the other), recommend PRIMARY-FIRST: "let's work on <primary> for a month, then add <secondary>" and set sequence=<secondary-slug@30>; (c) if compatible and both matter, build a COMBINED plan and list the secondary in secondary=.
5. Age range + biological sex.
6. Current medication or major restrictions.
7. Which tools to include — present the options WITH their star ratings and steer toward the highest-starred. Mention any tool that's not advised for this condition.
8. Daily time they can commit (minutes).
9. One open-ended "anything else I should know?" with a "Nothing else" chip.
10. A reflection message that STARTS with the exact line "Here's what I learned about you" — 4–5 first-person bullets (goal, strengths, biggest opportunity, gentle risk note, tone). NO options line.
11. The final plan message (see directive below).

${chipRule}
${planDirective}
${safety}

Available chronic conditions:
${chronicList}

Available tools:
${toolList}

${starInfo}
${tool ? `They're especially interested in the "${TOOL_META[tool as ToolKey]?.label ?? tool}" tool — emphasise it.` : ""}`;
}

/* ---------------- plan directive parsing ---------------- */

interface PlanDirective {
  slug: string;
  track: Track;
  tools: ToolKey[];
  secondary: string[];
  phase2?: { slug: string; days: number };
}

function parsePlanDirective(content: string, fallbackSlug?: string): PlanDirective | null {
  const m = content.match(/\[plan:\s*([^\]]+)\]/i);
  if (!m) return null;
  const fields: Record<string, string> = {};
  for (const part of m[1].split(";")) {
    const [k, ...rest] = part.split("=");
    if (k && rest.length) fields[k.trim().toLowerCase()] = rest.join("=").trim();
  }
  const slug = fields.slug || fallbackSlug;
  if (!slug || !getDisease(slug)) return null;

  const track: Track = fields.track === "prevent" ? "prevent" : "manage";
  const tools = (fields.tools || "")
    .split(",").map((t) => t.trim()).filter((t): t is ToolKey => TOOL_KEYS.includes(t as ToolKey));
  const secondary = (fields.secondary || "")
    .split(",").map((s) => s.trim()).filter((s) => s && getDisease(s));

  let phase2: PlanDirective["phase2"];
  const seq = (fields.sequence || "").trim();
  if (seq && seq.includes("@")) {
    const [s, d] = seq.split("@");
    if (getDisease(s.trim())) phase2 = { slug: s.trim(), days: parseInt(d, 10) || 30 };
  }
  return { slug, track, tools: tools.length ? tools : [], secondary, phase2 };
}

function directiveToPlan(dir: PlanDirective): DiseasePlan {
  const disease = getDisease(dir.slug)!;
  // fall back to top-3 starred tools if the model gave none
  let tools = dir.tools;
  if (tools.length === 0) {
    tools = (Object.keys(disease.relevance) as ToolKey[])
      .filter((t) => disease.relevance[t] > 0 && disease.readyPlans[t])
      .sort((a, b) => disease.relevance[b] - disease.relevance[a])
      .slice(0, 4);
  }
  const phase2 = dir.phase2
    ? { slug: dir.phase2.slug, name: getDisease(dir.phase2.slug)!.short, startAfterDays: dir.phase2.days }
    : undefined;
  return {
    slug: dir.slug,
    name: disease.name,
    track: dir.track,
    tools,
    secondary: dir.secondary.length ? dir.secondary : undefined,
    phase2,
    durationDays: 30,
    createdAt: Date.now(),
  };
}

/* ---------------- component ---------------- */

function DiseaseBot() {
  const { slug, tool, mode: modeParam } = Route.useSearch();
  const mode: BotMode = modeParam ?? "open";
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [assistantPartial, setAssistantPartial] = useState("");
  const [building, setBuilding] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const kickedRef = useRef(false);

  const disease = slug ? getDisease(slug) : undefined;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, assistantPartial]);

  useEffect(() => {
    if (!streaming) inputRef.current?.focus();
  }, [streaming]);

  useEffect(() => {
    if (kickedRef.current || messages.length > 0 || streaming) return;
    kickedRef.current = true;
    const intro = disease
      ? mode === "acute"
        ? `I'm not feeling well — I think it's ${disease.name}.`
        : `I'd like to build a plan for ${disease.name}.`
      : "Hi! Help me build a plan.";
    void send(intro, { silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function send(text: string, opts?: { silent?: boolean }) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    const newUserMsg: Msg = { role: "user", content: trimmed };
    const nextMessages: Msg[] = opts?.silent ? messages : [...messages, newUserMsg];
    if (!opts?.silent) setMessages(nextMessages);
    setInput("");
    setStreaming(true);
    setAssistantPartial("");

    const modelMessages = [...(opts?.silent ? messages : nextMessages), ...(opts?.silent ? [newUserMsg] : [])];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: buildSystemPrompt(mode, slug, tool),
          messages: modelMessages,
        }),
      });
      if (!res.ok || !res.body) {
        if (res.status === 429) throw new Error("Rate limit — try again in a moment.");
        if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Backend → Settings.");
        throw new Error((await res.text()) || "Chat failed");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setAssistantPartial(full);
      }
      setMessages((m) => [...m, { role: "assistant", content: full }]);
      setAssistantPartial("");
    } catch (e) {
      toast.error((e as Error).message);
      setAssistantPartial("");
    } finally {
      setStreaming(false);
    }
  }

  function handleReset() {
    if (!confirm("Start a new conversation?")) return;
    setMessages([]);
    kickedRef.current = false;
  }

  // Find a plan directive across assistant messages (or a plan message even without directive).
  const planMsg = [...messages].reverse().find(
    (m) => m.role === "assistant" && /here'?s your (personalis?ed|relief) plan/i.test(m.content),
  );
  const directive = planMsg ? parsePlanDirective(planMsg.content, slug) : null;
  const canBuildPlan = !!planMsg && mode !== "acute" ? !!planMsg : false;
  // acute mode: allow building if a directive is present (no red-flag stop)
  const canBuildAcute = mode === "acute" && !!directive;

  function buildPlan() {
    setBuilding(true);
    try {
      const dir = directive ?? (slug && getDisease(slug)
        ? { slug, track: "manage" as Track, tools: [] as ToolKey[], secondary: [] as string[] }
        : null);
      if (!dir) {
        toast.error("Couldn't read the plan — try telling me your condition again.");
        setBuilding(false);
        return;
      }
      const plan = directiveToPlan(dir);
      saveDiseasePlan(plan);
      startDiseasePipeline(plan.slug, getDisease(plan.slug)!.short, plan.tools);
      toast.success("Plan created 🌿");
      const pipe = getDiseasePipeline();
      if (pipe && pipe.steps.length > 0) {
        navigate({ to: PIPELINE_ROUTE[pipe.steps[0]] });
      } else {
        navigate({ to: "/disease/$slug", params: { slug: plan.slug } });
      }
    } catch {
      toast.error("Something went wrong building the plan.");
      setBuilding(false);
    }
  }

  const showBuild = (canBuildPlan || canBuildAcute) && !streaming;
  const modeLabel = mode === "acute" ? "Relief chat" : mode === "verify" ? "Verify & build" : "Plan bot";

  return (
    <div className="flex min-h-svh flex-col pb-28" style={{ background: "var(--gradient-hero)" }}>
      <header className="flex items-center justify-between gap-3 px-5 pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-3">
          <Link to="/section/disease" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-card/70 text-foreground ring-1 ring-border/60">
            <ArrowLeft size={16} />
          </Link>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"><Bot size={16} /></span>
            <div>
              <p className="font-display text-[15px] font-semibold leading-none">{modeLabel}</p>
              <p className="text-[11px] text-muted-foreground">{disease ? `Focus: ${disease.short}` : "Ask me anything"}</p>
            </div>
          </div>
        </div>
        <button onClick={handleReset} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-card/70 text-foreground ring-1 ring-border/60" title="New conversation">
          <RotateCcw size={15} />
        </button>
      </header>

      <div ref={scrollRef} className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-2 overflow-y-auto px-4">
        {messages.map((m, i) => {
          const isLastAssistant = m.role === "assistant" && i === messages.length - 1 && !streaming;
          const { text, options } = parseMessage(m.content);
          const isReflection = m.role === "assistant" && /here'?s what i learned about you/i.test(text);
          const isPlan = m.role === "assistant" && /here'?s your (personalis?ed|relief) plan/i.test(text);
          return (
            <div key={i} className="flex flex-col gap-2">
              <Bubble role={m.role} content={text} accent={isReflection ? "reflection" : isPlan ? "plan" : undefined} />
              {isLastAssistant && options.length > 0 && (
                <div className="ml-8 flex flex-wrap gap-2">
                  {options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => void send(opt)}
                      className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-[12.5px] font-medium text-primary transition hover:bg-primary hover:text-primary-foreground"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {streaming && assistantPartial && <Bubble role="assistant" content={parseMessage(assistantPartial).text} />}

        {streaming && !assistantPartial && (
          <div className="flex justify-start"><div className="flex items-center gap-1 rounded-2xl bg-card px-3 py-2 ring-1 ring-border/60">
            <Dot /><Dot delay="150ms" /><Dot delay="300ms" />
          </div></div>
        )}

        {showBuild && (
          <div className="my-3 flex justify-center">
            <button
              onClick={buildPlan}
              disabled={building}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-50"
            >
              <Sparkles size={15} /> {building ? "Building…" : "Build my plan"}
            </button>
          </div>
        )}
      </div>

      {/* composer */}
      <div className="fixed inset-x-0 bottom-[76px] z-30 border-t border-border/60 bg-background/95 backdrop-blur px-3 py-2">
        <form
          onSubmit={(e) => { e.preventDefault(); void send(input); }}
          className="mx-auto flex max-w-xl items-end gap-2"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(input); }
            }}
            rows={1}
            placeholder="Type your reply…"
            className="max-h-32 flex-1 resize-none rounded-2xl bg-card px-3 py-2.5 text-[14px] leading-snug text-foreground shadow-sm ring-1 ring-border/60 focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={streaming}
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}

function Bubble({ role, content, accent }: { role: "user" | "assistant"; content: string; accent?: "reflection" | "plan" }) {
  const assistantBg =
    accent === "reflection"
      ? "bg-gradient-to-br from-primary/15 via-primary/5 to-secondary/10 text-foreground ring-1 ring-primary/30"
      : accent === "plan"
      ? "bg-primary/10 text-foreground ring-1 ring-primary/40"
      : "bg-card text-foreground ring-1 ring-border/60";
  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[85%] items-end gap-2 ${role === "user" ? "flex-row-reverse" : ""}`}>
        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${role === "user" ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"}`}>
          {role === "user" ? <User size={12} /> : <Bot size={12} />}
        </span>
        <div className={`whitespace-pre-wrap rounded-2xl px-3 py-2 text-[13.5px] leading-snug shadow-sm ${role === "user" ? "bg-primary text-primary-foreground" : assistantBg}`}>
          {content}
        </div>
      </div>
    </div>
  );
}

function Dot({ delay = "0ms" }: { delay?: string }) {
  return <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: delay }} />;
}

/** Strip both the [options: ...] chips and the [plan: ...] directive from display text. */
function parseMessage(content: string): { text: string; options: string[] } {
  let text = content.replace(/\n?\[plan:\s*[^\]]+\]\s*$/i, "").trimEnd();
  const match = text.match(/\n?\[options:\s*([^\]]+)\]\s*$/i);
  if (!match) return { text, options: [] };
  const options = match[1].split("|").map((s) => s.trim()).filter(Boolean);
  return { text: text.slice(0, match.index).trimEnd(), options };
}

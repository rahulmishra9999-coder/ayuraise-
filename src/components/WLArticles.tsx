// "Coach Reads" — the article library for the Weight Loss Learn section.
// Evidence-based long-form content in a swipeable, phone-first reader.

import { useEffect, useState } from "react";
import { X, BookOpen, ChevronRight, Clock } from "lucide-react";
import { WL_ARTICLES, type WLArticle } from "@/lib/wl-articles";

const READ_KEY = "ayuraise.wl.articles";

function loadRead(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.localStorage.getItem(READ_KEY) || "{}"); } catch { return {}; }
}

function markRead(id: string) {
  if (typeof window === "undefined") return;
  try {
    const r = loadRead();
    r[id] = true;
    window.localStorage.setItem(READ_KEY, JSON.stringify(r));
  } catch {}
}

export function WLArticlesSection() {
  const [open, setOpen] = useState<WLArticle | null>(null);
  const [read, setRead] = useState<Record<string, boolean>>({});
  useEffect(() => { setRead(loadRead()); }, [open]);

  return (
    <>
      <div className="space-y-2.5">
        {WL_ARTICLES.map((a, idx) => (
          <button
            key={a.id}
            onClick={() => setOpen(a)}
            className="tile flex w-full items-center gap-3 rounded-3xl bg-card p-3 text-left ring-1 ring-border/60 animate-float-up"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-sm"
              style={{ background: a.tint }}
            >
              {a.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="line-clamp-2 font-display text-[13.5px] font-semibold leading-snug text-foreground">
                {a.title}
              </span>
              <span className="mt-1 flex items-center gap-2 text-[10.5px] font-medium text-muted-foreground">
                <span className="rounded-full bg-secondary px-2 py-0.5 font-semibold text-foreground/70">{a.tag}</span>
                <span className="flex items-center gap-0.5"><Clock size={10} /> {a.minutes} min read</span>
                {read[a.id] && <span className="font-semibold text-primary">✓ read</span>}
              </span>
            </span>
            <ChevronRight size={16} className="shrink-0 text-muted-foreground" />
          </button>
        ))}
      </div>

      {open && <ArticleReader article={open} onClose={() => { markRead(open.id); setOpen(null); }} />}
    </>
  );
}

function ArticleReader({ article, onClose }: { article: WLArticle; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <div className="relative flex max-h-[94svh] w-full max-w-md flex-col overflow-hidden rounded-t-[32px] bg-card sm:rounded-[32px]">
        {/* hero */}
        <div className="relative shrink-0 px-6 pb-5 pt-8" style={{ background: article.tint }}>
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-foreground shadow-sm"
          >
            <X size={14} />
          </button>
          <span className="text-5xl drop-shadow-sm">{article.emoji}</span>
          <h2 className="mt-3 font-display text-[22px] font-bold leading-tight text-foreground">{article.title}</h2>
          <p className="mt-1.5 flex items-center gap-2 text-[11px] font-semibold text-foreground/70">
            <BookOpen size={12} /> {article.tag} · {article.minutes} min read
          </p>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-6 pb-8 pt-5">
          {/* staircase intro */}
          <div className="space-y-3.5">
            {article.intro.map((line, i) => (
              <p key={i} className="text-[15.5px] leading-relaxed text-foreground/90 animate-float-up" style={{ animationDelay: `${i * 150}ms` }}>
                {line}
              </p>
            ))}
          </div>

          {article.sections.map((s) => (
            <section key={s.h} className="mt-7">
              <h3 className="font-display text-[16.5px] font-bold text-foreground">{s.h}</h3>
              {s.paras?.map((p, i) => (
                <p key={i} className="mt-2.5 text-[14.5px] leading-relaxed text-foreground/85">{p}</p>
              ))}
              {s.bullets && (
                <ul className="mt-3 space-y-2.5">
                  {s.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-[14.5px] leading-relaxed text-foreground/85">
                      <span className="mt-0.5 shrink-0 text-saffron">◆</span> {b}
                    </li>
                  ))}
                </ul>
              )}
              {s.items && (
                <div className="mt-3 overflow-hidden rounded-2xl ring-1 ring-border/60">
                  {s.items.map((row, i) => (
                    <div
                      key={i}
                      className={`flex items-baseline justify-between gap-3 px-3.5 py-2.5 ${i % 2 === 0 ? "bg-secondary/40" : "bg-card"}`}
                    >
                      <span className="text-[13.5px] font-medium leading-snug text-foreground/90">{row.label}</span>
                      <span className="shrink-0 text-right text-[12px] font-semibold text-primary">{row.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}

          <button
            onClick={onClose}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
          >
            Done reading ✓
          </button>
        </div>
      </div>
    </div>
  );
}

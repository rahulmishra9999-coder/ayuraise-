# Disease Management — Feature Design

_AyuRaise · Designed 2026-07-14 · Status: proposal_

## 0. What exists today (and what this design does with it)

| Existing piece | Where | Fate in this design |
|---|---|---|
| Disease hub with star-rated tools + ready plans | `src/routes/section.disease.tsx`, `disease.$slug.tsx`, `src/lib/diseases.ts` | **Becomes the single Disease Management hub** — extended, not replaced |
| `/heal` hub (17 goals, herbs/nuskhe/aushadi tab content) | `src/routes/heal.tsx`, `src/lib/heal.ts` | **Merged in.** Its herbs/nuskhe/aushadi content moves into `diseases.ts`; `/heal` and BottomNav "Heal" tab redirect to the new hub |
| Disease bot (chat, option chips, scripted system prompt) | `src/routes/disease-bot.tsx`, `src/routes/api/chat.ts` | **Reused & upgraded** — becomes the personalized-plan builder for both entry points |
| Combined-plan wizard | `src/routes/combined-plan.tsx` | Kept as the non-chat fallback; bot hands off to it with pre-filled params (current behavior) |
| Weight-loss pattern (Education state → Plan state, PlanFlow, pipeline) | `section.weight-loss.tsx`, `WLPipeline.tsx`, `lib/weight-loss.ts` | **Template.** Disease plans follow the same two-state page + cross-section pipeline |
| Saved-plans aggregator | `src/lib/savedPlans.ts`, `my-plans.tsx` | Gets a `"Disease"` category so disease plans appear in My Plans + Dashboard |
| Stars component (0–3, inline) | `disease.$slug.tsx:49` | **Extracted to `src/components/Stars.tsx` and extended to 0–5** |

---

## 1. Information architecture

```
/section/disease                     ← Disease Management hub
├─ [Create My Plan]                  ← big CTA ABOVE the disease grid → /disease-bot (open mode)
├─ Chronic & Lifestyle               ← sub-section 1 (grid of conditions)
│   └─ /disease/$slug                ← per-disease page (tabs below)
│       ├─ Understand   (science, causes, symptoms, red flags, do's & don'ts)
│       ├─ Learn        (lessons/modules, articles, quiz)
│       ├─ Manage       (star-rated tools → ready-made plan per tool)
│       └─ [Build my personalized {disease} plan] → /disease-bot?slug=… (verify mode)
└─ Seasonal & Acute                  ← sub-section 2 (grid of conditions)
    └─ /disease/$slug (kind=seasonal) ← lighter page (see §6)
        ├─ Quick Relief  (ready-made: herbs, remedies, diet, rest)
        ├─ Know It       (what/why, red flags → "see a doctor now" card)
        └─ [Talk to Ayu about my symptoms] → /disease-bot?slug=…&mode=acute
```

**Diseases — Chronic & Lifestyle** (criterion: manageable via herbs, lifestyle, food, yoga, meditation):
diabetes · heart disease · hypertension/BP · migraine · asthma · kidney health · PCOD · thyroid · fatty liver · arthritis/knee pain · obesity · cholesterol · gut health · sleep disorders
(the last four absorbed from `/heal`'s `HEALTH_GOALS`)

**Diseases — Seasonal & Acute:**
dengue · malaria · cough/cold/flu · fever · typhoid · seasonal allergies · stomach infection/diarrhea · sore throat

---

## 2. Data model (`src/lib/diseases.ts` — extended)

```ts
type DiseaseKind = "chronic" | "seasonal";

// widen ToolKey: add the three missing healing modes from heal.ts
type ToolKey =
  | "yoga" | "meditation" | "exercise" | "diet"
  | "if" | "fasting" | "detox"
  | "herbs"      // ayurvedic herbs (ashwagandha, giloy, …)
  | "remedies";  // desi nuskhe / home remedies

interface DiseaseInfo {
  slug: string;
  name: string;
  kind: DiseaseKind;
  gradient: string;                    // existing --gradient-* token
  basic: { what: string; causes: string[]; symptoms: string[]; redFlags: string[] };
  dosDonts: { dos: string[]; donts: string[] };
  relevance: Record<ToolKey, 0|1|2|3|4|5>;   // ★ rating per tool (was 0–3)
  readyPlans: Partial<Record<ToolKey, ReadyPlan>>;
  learn: { lessons: Lesson[]; articles: Article[]; quizId: string };
  prevention: {                        // NEW — the second user track
    riskFactors: RiskFactor[];         // drives the risk questionnaire
    note: string;                      // "why prevention matters for this one"
  };
}

interface ReadyPlan {
  title: string;
  tiers: {
    manage: PlanItem[];    // has the disease — full-strength protocol
    prevent: PlanItem[];   // prevention track — lighter version
  };
}

interface RiskFactor {
  id: string;
  question: string;               // "Does a parent or sibling have diabetes?"
  weight: number;                 // contribution to risk score
  options: { label: string; score: number }[];
}
```

**Prevention tier rule of thumb** (so content authoring stays simple): `prevent` = same interventions as `manage` with reduced frequency/intensity + risk-factor-specific habits. Where the lists would be identical, author once and mark items `tier: "both" | "manage" | "prevent"` instead of duplicating.

**Star semantics (0–5):**
- ★★★★★ core, evidence-strong (e.g. diet for diabetes)
- ★★★★ high impact
- ★★★ solid support
- ★★ helpful adjunct
- ★ minor / optional
- 0 not applicable (hidden from Manage tab)

Migration note: existing `relevance` values 1/2/3 map to 2/3/5 as a starting point, then hand-tune.

---

## 3. Per-disease page (chronic) — `/disease/$slug`

Follows the weight-loss two-state pattern:

### State A — no plan yet (education state)
1. **Hero** (gradient, name, one-liner) + **track switch**: two pills — `I have this` / `I want to prevent it`. Persisted per disease (`ayuraise.disease.<slug>.track`). Everything below re-renders for the chosen track.
2. **Understand tab** — science hero (reuse `ScienceHero` pattern), causes, symptoms, red-flags callout, Do's & Don'ts grid.
3. **Learn tab** — `LessonsGrid`/`LessonPlayer` (already built for weight loss: illustration → concept → quiz → takeaway), articles list, full quiz via `QuizRunner`.
4. **Manage tab** — tools sorted by star rating (existing behavior), now 0–5 stars, now including **Herbs** and **Home Remedies** rows. Tapping a tool opens the ready-made plan sheet (existing) showing the **tier matching the selected track**, with the existing "Use as-is" / "Customize for me" choice.
5. **Sticky footer CTA** — `Build my personalized {disease} plan` → `/disease-bot?slug=diabetes&mode=verify`.

For the **prevention track**, insert one extra card between hero and tabs:
- **Risk check** — a 6–10 question inline quiz built from `prevention.riskFactors` (family history, weight, activity, diet pattern, sleep, stress, age band). Output: risk band (Low / Moderate / High) + an honest horizon statement ("with current habits, elevated risk within ~5–10 years" — banded, never a fake-precise date) + "these 3 habits move your risk the most" (derived from the highest-weighted factors they scored on). Stored at `ayuraise.disease.<slug>.risk`.

### State B — plan exists (mirror of weight-loss plan state)
1. **My Journey card** — condition, track, start date, key metric if applicable (HbA1c / BP / weight — user-entered, optional), plan duration progress.
2. **My Plans row** (`SavedModulesRow` pattern) — horizontal cards for each tool the user picked (Yoga · Diet · Herbs · …) each linking to its section page with progress %.
3. **Today's tasks** — checklist assembled from the picked tools' daily items.
4. **Check-in** — condition-appropriate log (BP reading, fasting sugar, symptom severity 1–5) + reminders (reuse `SimpleCheckIn` pattern).
5. **Keep learning** — lessons again.

---

## 4. The bot — one bot, three modes (`/disease-bot`)

All three reuse the existing chat UI, streaming `/api/chat`, option-chips (`[options: …]`), and system-prompt-scripted flow. `mode` is a query param that selects the script `buildSystemPrompt(mode, slug?)`.

### Mode 1 — `open` ("Create My Plan" above the ready-made grid)
Script outline:
1. Greet → ask **primary concern** `[options: chips of common conditions | "something else"]`.
2. Ask **secondary concerns** (multi-pick allowed) + free-text **symptoms**.
3. Offer **report upload** — "you can upload recent test reports (photo or PDF)". *(v1: attach image → send to the gateway as multimodal input if supported; fallback: user types key values — HbA1c, BP, TSH… The script asks for the 2–3 values that matter for the named condition.)*
4. **Triage logic** (encoded in the prompt):
   - If a "secondary" is actually a **symptom of the primary** (e.g. fatigue + diabetes) → say so, fold it into the primary plan.
   - If primary & secondary **conflict** (interventions for one would aggravate the other, e.g. intense fasting for weight vs. kidney issues) → recommend **primary-first sequencing**: "Let's work on {primary} for 1 month, then layer in {secondary}." Plan stores `phase2: {slug, startAfterDays: 30}` and the app surfaces a reminder when phase 2 unlocks.
   - If **compatible and both important** → build a **combined plan** (union of tools, items tagged by condition, conflicts resolved toward the safer option).
5. **Tool selection** — bot presents the intervention list *with star ratings inline* ("Diet ★★★★★, Yoga ★★★★, …") and asks the user to pick; nudges toward including at least the 5★ tools.
6. Confirmation summary ("Here's what I learned about you" — existing pattern) → **"Build my plan"** button → plan generation (§5).

### Mode 2 — `verify` (entered from a ready-made disease page)
Before building, the bot confirms the user actually has the condition and isn't just using the page as an entry point:
1. "Before we build your {disease} plan — a few quick checks." Asks: diagnosed by a doctor? when? on medication? recent test values? current symptoms?
2. If answers suggest they **don't** have it → gently switch: "Sounds like you may not have {disease} — would you like a **prevention plan** instead, or is something else the real concern?" `[options: prevention plan | different problem | I do have it]`.
3. Asks: **"Any secondary issue you'd also like to work on?"** → if yes, joins the Mode-1 triage logic at step 4.
4. Continues to tool selection → build.

### Mode 3 — `acute` (seasonal sub-section)
Short, remedy-focused conversation: symptoms → duration → severity → red-flag screen (see §6 safety) → serves the matching ready-made acute protocol with any adjustments, heavy on herbs/remedies/diet/rest. No multi-week plan, no pipeline — output is a "next 5–7 days" card saved to dashboard.

**Persistence:** wire the bot into the already-built but unused `src/lib/bot.functions.ts` (`bot_conversations`/`bot_messages` tables exist with `disease_slug` column). One migration change needed: drop `UNIQUE(user_id)` → `UNIQUE(user_id, disease_slug)` so users can have one conversation per condition.

---

## 5. Plan generation & where plans show up

When the bot (any mode) finishes, it emits a structured plan spec; the client materializes it:

```
ayuraise.disease.<slug>.plan   ← master record: {track, tools[], tier, phase2?, createdAt, durationDays}
+ per-tool writes into the EXISTING section keys:
  ayuraise.yogaPlans / exercisePlans / dietPlan(s) / fastingPlans / detoxPlans
  (tagged with source: "disease:<slug>" so sections can badge them)
+ ayuraise.plan                ← umbrella summary (home page card, existing)
```

Then it calls a **generalized pipeline** (extract `WLPipeline.tsx` → `src/components/PlanPipeline.tsx`, parameterized by source key) that walks the user through each picked section — "Step 2 of 4 · Yoga" banners on the section pages — exactly like weight loss does today.

**Surfacing (the "user can reach it from anywhere" requirement):**
- **Section pages** (Yoga/Exercise/Diet/Fasting/Detox): plans tagged `disease:<slug>` render with a small condition badge ("For your Diabetes plan").
- **Dashboard**: new `DiseasePlanCard` next to the existing `DietPlanCard` — today's disease tasks + check-in shortcut. (Dashboard's demo-data cards get their first real data source here.)
- **My Plans** (`savedPlans.ts`): add `"Disease"` category reading `ayuraise.disease.*.plan`.
- **Home**: existing `ayuraise.plan` summary card already picks it up.

Herbs & Remedies don't have section pages — they render **inside the disease plan page** (State B) as their own cards, and their daily items feed Today's Tasks.

---

## 6. Seasonal & Acute sub-section

Lighter page template (`kind === "seasonal"` renders a different layout in the same `disease.$slug.tsx` route):

1. **Hero** + urgency-appropriate tone.
2. **Red-flag card FIRST** — "See a doctor immediately if:" (dengue: bleeding gums, severe abdominal pain, platelet drop; typhoid: sustained high fever…). This is non-negotiable placement: acute illnesses are where wrong self-care is dangerous.
3. **Quick Relief plan** (ready-made, no personalization needed to start): sections ordered **Herbs → Home remedies (nuskhe) → Diet (what to eat/avoid) → Rest & gentle movement**. Yoga/exercise appear only as "gentle/recovery" items; no fasting/IF/detox for most acute conditions (suppressed via `relevance: 0`).
4. **Recovery diet** for the convalescence week.
5. **[Talk to Ayu about my symptoms]** → bot `acute` mode (§4).
6. Mini "Know it" section: transmission/cause, duration expectations, prevention for next season.

No tracks, no risk quiz, no pipeline — speed to relief is the design goal.

---

## 7. Safety layer (applies everywhere)

- Standing disclaimer component on every Manage tab / plan sheet / bot session: complements, never replaces, medical care; **never advise stopping or changing prescribed medication** (bot system prompts must state this explicitly).
- Red-flag screens: chronic pages keep the existing red-flags callout; the acute bot runs a red-flag question **before** giving remedies and short-circuits to "please see a doctor now, here's what you can do meanwhile" when triggered.
- Risk predictions are **bands, not dates**, and framed as modifiable ("here's what moves it").
- Contradiction table (small static map in `diseases.ts`): tool × condition exclusions (e.g. fasting × kidney disease, intense pranayama × uncontrolled hypertension) — consulted by both ready-made rendering and the bot prompt.

---

## 8. Build order (each phase shippable)

1. **Foundation** — extend `diseases.ts` (kind, 0–5 relevance, herbs/remedies ToolKeys, tiers), extract `Stars` (0–5) + `PlanPipeline`, merge `/heal` content in, redirect `/heal` + BottomNav → `/section/disease`, hub page with two sub-section grids + "Create My Plan" CTA on top.
2. **Chronic disease page v2** — track switch, tabs (Understand/Learn/Manage), tiered ready plans, herbs & remedies rows, prevention risk quiz.
3. **Bot modes** — `verify` and `open` scripts with triage logic + tool selection with stars + plan spec emission; plan materialization into section keys; pipeline; dashboard card; My Plans category.
4. **Seasonal sub-section** — data for 8 acute conditions, lighter page template, `acute` bot mode with red-flag screening.
5. **Persistence & polish** — wire bot to Supabase (`bot.functions.ts`), report-upload multimodal input, phase-2 unlock reminders, check-in metrics per condition.

---

## 9. Open decisions (recommendations bolded)

1. `/heal` merge — **recommended** (content is good, having two hubs confuses nav). Alternative: keep `/heal` as a symptom-oriented alias browsing the same data.
2. Plan storage — **stay localStorage in v1** (consistent with every other section); move plans to Supabase in phase 5+ when accounts matter for cross-device.
3. Stars 0–5 vs current 0–3 — **0–5 as specified** (richer prioritization signal for tool picking).
4. Report upload v1 — **typed key-values first** (HbA1c, BP…), image/PDF multimodal as fast-follow, since the Lovable gateway's multimodal support needs a spike.

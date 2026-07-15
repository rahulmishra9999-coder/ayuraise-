# Weight Loss + Dashboard Redesign Plan

Big scope. Splitting into phases so we can ship incrementally. Everything reuses existing routes and libraries — no new routing.

## Phase 1 — Weight Loss page ("My Plan")

File: `src/routes/section.weight-loss.tsx`

### 1. Layout & spacing
- Collapse the large gap between the sticky top bar and Section 01. Remove the "01 · My Journey" section number/label styling; rename section to **"My Plan"**.
- Rename anywhere "Journey" appears in this page to "My Plan" (nav pill, headings, floating nav).

### 2. My Plan card (when plan exists) — colorful + informative
Replace the flat three-stat row with a colorful grouped card:

```text
┌──────────────────────────────────────────────┐
│  MY PLAN                     [Edit] [Delete] │
│                                              │
│  Start 78kg ──── Current 74.2kg ──── Tgt 68  │
│  ▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░  (mini sparkline)   │
│                                              │
│  [Target wt]  [Target date]  [Pace]          │
│   68 kg        Sep 30        0.5 kg/wk       │
│   (tap edit)   (tap edit)    (auto)          │
└──────────────────────────────────────────────┘
```

- **Current** = latest punch weight; if no punches, current = start weight (clearly labeled "Starting weight" until first punch).
- **Progress %** only shown once at least 1 punch exists. Formula: `(start - current) / (start - target) * 100`, clamped 0–100. Hide it entirely otherwise (fixes the fake 63%).
- Mini line chart from start → punches → target (uses existing punch data).
- Each of Target weight / Target date / Pace is individually tappable → opens a small edit sheet.
- **Two-variable rule**: user edits any 2 of {target weight, target date, pace}. The third auto-recomputes using existing `projectedDateFromPace` / derived pace math. After save, show a bot dialog: *"Your new pace is X kg/week. Adjust your diet/yoga/exercise plans to match?"* with buttons: Adjust Diet, Adjust Yoga, Adjust Exercise, Keep as is. Each button routes to the respective section's plan flow with new pace in context.
- **Edit / Delete plan** buttons in the card header. Delete asks for confirmation, clears `ayuraise.wl.plan` via existing helpers.

### 3. Connected modules row
Below My Plan card: horizontal row of tiles for Diet, Yoga, Exercise, Meditation plans that the user has already created. Each tile:
- Icon + name + "tap to open" 
- Clicking navigates to that section's plan view.
- Missing modules show a subtle "+ Add" tile instead — no forced upsell block.

### 4. Weight punch (simplified)
Remove the daily/twice/weekly cadence toggle. Single card:
- One numeric input + "Log weight" button.
- Small text: *"Punch whenever you like."*
- Toggle: "Remind me to weigh in" → opens reminder sheet (in-app notification / WhatsApp — WA stubbed as coming soon; in-app uses Notification API).
- Progress chart appears only after ≥1 punch.

### 5. When NO plan exists (education-first)
- Remove the "Movement / Habits / Nutrition" category grouping.
- Single flat grid of learning modules (flash cards, science bites, do's & don'ts) — the previous module set, ungrouped.
- Bottom CTA: **Create My Plan**.
- After creation: page flips to the plan-first layout above.

### 6. Floating bot icon
- Fixed bottom-right FAB (above BottomNav) linking to `/coach` or opening inline chat. Present on both states.

### 7. "Learn more" → Academy
- A "More" link on the modules section opens `/diet.academy` style Learn Academy (reuse existing academy route pattern; for weight loss we just link to a filtered view — no new route).

## Phase 2 — Naming consistency
- Diet section: rename "Journey" → **"My Diet Plan"** (`src/routes/section.diet.tsx`).
- Yoga section: expose **"My Yoga Plan"** card if a saved plan exists (`src/routes/section.yoga.tsx`).
- Exercise / Meditation: same treatment where a saved plan exists.

## Phase 3 — Dashboard hub

File: `src/routes/dashboard.tsx`

### Dynamic checklist (tools-driven)
Replace the static "Today's plan" cards with a dynamic checklist generated from what the user actually has:
- Diet plan → "Eat today's meals" + optional "Log calories"
- Fasting plan → "16h IF window"
- Water goal → "2L water" (existing water widget rolls into this)
- Yoga plan → "20 min yoga"
- Exercise plan → "20 min workout"
- Meditation plan → "10 min meditation"
- Steps goal → "8k steps" (Apple Health / step tracker sync stubbed as "Connect" for now)
- Reflection → "10 min reflection"

Each item: check off manually, or auto-check when the underlying section is completed. List rebuilds whenever user adds/removes a tool.

### My Plans strip
Below checklist: horizontal strip of the user's saved plans (Weight Loss, Diet, Yoga, Exercise, Meditation). Each card is the same visual language as the section-level "My Plan" cards. Tap → deep link to that section.

### Weight progress
Uses the same punch data; small chart + latest weight, target, mini progress ring. Tap → weight-loss section.

### Goals row
Small chips: 2000 cal · 16h IF · 2L water · 8k steps · 20m yoga · 20m ex · 10m meditation · 10m reflection. Tinted green when complete.

## Phase 4 — Shared "My Plan" card component

Create `src/components/MyPlanCard.tsx` — a single reusable card used in:
- Weight Loss section
- Diet section
- Yoga section
- Dashboard "My Plans" strip

Props: title, icon, gradient, primary stats, edit handler, delete handler, open handler. Keeps visual language consistent.

## Technical notes

- All storage stays in `localStorage` under existing keys (`ayuraise.wl.plan`, `ayuraise.wl.punches`, `ayuraise.dietPlan`, saved yoga/exercise/meditation via existing `savedPlans.ts`).
- Two-variable pace math lives in `src/lib/weight-loss.ts`: add `deriveThird({targetKg, currentKg, targetDate?, paceKgWeek?})` helper.
- Bot dialog after pace change: reuse existing shadcn `Dialog`.
- Floating FAB: new small component `src/components/CoachFab.tsx`.
- No routing changes. No new server functions. No DB changes.

## Suggested build order

1. Phase 1.1–1.5 (weight-loss redesign) + shared `MyPlanCard`.
2. Phase 1.6 floating bot FAB.
3. Phase 2 naming + section "My Plan" cards.
4. Phase 3 dashboard hub.

Given the size, I'll ship Phase 1 first, then check in with you before Phase 2–4.

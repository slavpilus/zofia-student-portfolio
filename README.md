# Handoff: Student Competency Portfolio → Next.js on Vercel

## Overview
An interactive, single-page tracker for a UK **Police Constable Degree Apprenticeship (PCDA)** student portfolio. A student (or their assessor) works through **15 competency units** containing **~95 sub-competencies**. Because several competencies must be evidenced more than once, there are **157 discrete "evidence" slots** in total. Each evidence slot cycles through three states — **Pending → In progress → Done** — and the whole dashboard (a completion ring, counts, per-unit bars, an evidence heat-map, and 19 "focus areas") is derived live from those slot states. The student can add free-text notes per competency, filter to outstanding work, filter by focus area, switch between three dashboard layouts and five colour themes, and Export / Import / Print their progress.

The goal of this handoff is to rebuild this prototype as a **fully-fledged Next.js (App Router) web app deployed to Vercel**, with real persistence (per-user accounts) instead of the prototype's `localStorage`.

## About the Design Files
The files in `design-reference/` are a **design reference created in HTML** — a working prototype that demonstrates the intended look, data model, and behaviour. **They are not production code to copy directly.** `Student Portfolio.dc.html` is authored in a bespoke streaming-component runtime (`support.js`); do not port that runtime. Instead, **recreate the design in idiomatic Next.js + React**, reusing the exact tokens, layout, copy, and data model documented below.

To view the prototype: open `design-reference/Student Portfolio.dc.html` in a browser (it loads `support.js` from the same folder). All state persists to `localStorage` under the key `psp:v2`.

## Fidelity
**High-fidelity (hifi).** Colours, typography, spacing, radii, and interactions are final. Recreate the UI pixel-accurately. The type is **IBM Plex Sans** (UI) + **IBM Plex Mono** (labels, codes, counts) via Google Fonts. All colour is driven by CSS custom properties so that five themes can swap instantly — preserve that architecture (see **Design Tokens / Theming**).

---

## Recommended Architecture (Next.js + Vercel)

- **Framework:** Next.js 14/15, **App Router**, TypeScript.
- **Rendering:** The page shell (header, unit scaffolding) can be a Server Component; all interactive pieces (state cycling, filters, layout/theme switch, notes) are **Client Components** (`"use client"`). Because the whole view is state-driven, a single top-level client component holding the portfolio state (mirroring the prototype) is acceptable and simplest.
- **Styling:** Tailwind CSS **or** CSS Modules — either is fine. **Keep the CSS-variable theming**: define the theme variable sets (below) and set them on a wrapper element; every colour references `var(--…)`. If using Tailwind, map the variables to `theme.extend.colors` using `rgb(var(--…))`/`var(--…)`.
- **State:** One reducer/store shaped like the prototype state (see **State Management**). `useReducer` + Context, Zustand, or Jotai all work.
- **Persistence (replace `localStorage`):**
  - **Auth:** Add sign-in (NextAuth/Auth.js, Clerk, or Supabase Auth). Each student owns one portfolio.
  - **Database:** Vercel Postgres (with Drizzle/Prisma) or Supabase. Suggested tables: `users`, `portfolios` (one per user: `name`, `date`, layout/theme prefs), `evidence` (`portfolio_id`, `slot_key`, `status`), `notes` (`portfolio_id`, `comp_code`, `body`). Alternatively store the whole progress blob as JSONB for a first cut.
  - **API:** Route Handlers (`app/api/…/route.ts`) or Server Actions to read/update status and notes. Debounce writes (notes especially).
  - Keep an **optimistic UI** so cycling a marker feels instant (as in the prototype), then persist.
- **Static competency data:** The 15 units / competencies / focus areas are fixed reference data — ship them as a typed constant module (`lib/portfolio-data.ts`), not in the DB. See **Data Model** for the full dataset.
- **Export / Import / Print:**
  - *Export* → download current progress as `…_portfolio.json` (`{ statuses, notes, name, date, version:2 }`).
  - *Import* → file picker, parse JSON, replace `statuses`/`notes`/`name`/`date`, persist.
  - *Print* → `window.print()`; include the print CSS (below) so a clean summary prints.
- **Deploy:** Vercel. Env vars for DB/auth. `next/font` for IBM Plex (avoids FOUT vs. `<link>`).
- **Accessibility:** markers and focus rows are buttons — keep them keyboard-operable with `aria-pressed`/`aria-label` describing state (e.g. `"3.1 evidence 2 of 3 — Done"`); respect `prefers-reduced-motion` (already gated in the prototype).

---

## Screens / Views
This is a **single screen** with three interchangeable **layouts** (a "View" switch at the top). The **competency list** (the core, in the centre `<main>`) and the **Focus areas** right rail are identical across all three; only the summary/overview treatment differs.

### Global chrome — top control bar (all layouts)
- Full-width bar, `max-width:1240px`, centred, `padding:22px 24px 0`, `display:flex; justify-content:space-between; flex-wrap:wrap; gap:20px`.
- **Left — "VIEW" switch:** mono label `View` (`IBM Plex Mono`, 10px, 600, uppercase, letter-spacing .12em, colour `--muted`) + a segmented control (rounded 11px, `--card` bg, `--border`, 3px padding) with three buttons: **Command**, **Analytics**, **Sidebar**. Active button: `--accent` bg, white text, radius 8px, `7px 13px`, 11.5px/600. Inactive: transparent bg, `--sub` text.
- **Middle — "THEME" swatches:** mono label `Theme` + five swatch buttons. Each swatch is `48×26px`, radius 8px, `overflow:hidden`, split into three vertical stripes showing that theme's `accent / done / prog` colours. Selected swatch: `2px solid var(--accent)` + `0 0 0 2px var(--accentSoft)` ring; others `1px solid var(--border)`.
- **Right — actions:** three controls, `gap:8px`.
  - **Export** — secondary button: `8px 13px`, radius 9px, `1px solid var(--border)`, `--card` bg, `--body` text, 11.5px/600. Downloads progress JSON.
  - **Import** — a `<label>` styled identically to Export, wrapping a visually-hidden `<input type="file" accept="application/json,.json">` (absolute, `opacity:0`, fills the label). Loads progress JSON.
  - **Print** — primary button: `8px 14px`, radius 9px, `1px solid var(--accent)`, `--accent` bg, white text. Calls `window.print()`.

### Competency list — `<main>` (identical in all layouts)
Lives in a flex row (`max-width:1240px`, `gap:22px`, `align-items:flex-start`, `padding:20px 24px 90px`). `<main>` is `flex:1; min-width:0`.

**Toolbar row** (`no-print`, `margin:0 2px 16px`, flex, wrap, `gap:10px`, centre):
- **Outstanding only** — toggle button. Off: `1px solid var(--border)`, `--card`, `--body`. On: `--accent` bg, white. (`padding:9px 16px`, radius 10px, 12px/600.) Hides every evidence that is Done — i.e. shows only competencies not fully complete.
- **Expand notes** / **Collapse all** — secondary buttons (`9px 14px`, radius 10px, `1px solid var(--border)`, `--card`, `--body`, 12px/600). Expand/collapse all note textareas.
- Hint text (mono, 11px, `--muted`): `Click a marker to cycle: Pending → In progress → Done`.

**Unit card** (repeated ×15; `id="unit-{n}"`, `class="unit-card"`):
- Card: `--card` bg, `1px solid var(--border)`, radius 16px, `padding:22px 24px`, `margin-bottom:14px`, shadow `0 1px 3px rgba(16,24,40,.04)`, `scroll-margin-top:16px`. Entrance: staggered `fadeUp`; hover: `box-shadow:0 8px 24px rgba(16,24,40,.09)`.
- **Header:** a `36×36` rounded-10 badge (`--accentSoft` bg, `--accent` text, mono 15px/700) with the unit number; the unit **name** (IBM Plex Sans, 15.5px/700, `letter-spacing:-.01em`); and a **per-unit progress bar** — a 7px `--track` track containing a `--done` segment then a `--prog` segment (widths = done% / in-progress% of that unit's evidences), with a mono count `uDone / uTot` at the right.
- **Competency row** (repeated per sub-competency; card `1px solid var(--line)`, radius 12px, `padding:13px 15px`, `--card2` bg):
  - **Left:** the code (e.g. `3.4a`) in mono 11px/600 `--accent`; then the title (IBM Plex Sans 13.5px/1.45, `--body`); and — if the competency is linked to a focus area — a small **focus tag** pill below the title (`2px 9px`, radius 20px, `--accentSoft` bg, `--accent` text, mono 10px/600 uppercase) showing the focus-area name.
  - **Right (controls):** the mono label `EVIDENCE`; then **N evidence markers** (N = required count for that competency); then a mono tally `d / N` (green when complete, else `--muted`); then a **notes toggle** button (`32×29`, radius 8px, glyph `✎`; when open it takes `--accent` border + `--accentSoft` bg).
    - **Evidence marker** = a `30×30`, radius-8 button showing its index (1..N). **Pending:** `1px dashed var(--chipPendBorder)`, `--chipPendBg`, `--chipPendInk`. **In progress:** solid `--prog` bg, white. **Done:** solid `--done` bg, white. Click cycles Pending → In progress → Done → Pending. `transition:all .12s`.
  - **Notes:** when expanded, a full-width `<textarea>` (`margin-top:11px`, `min-height:66px`, radius 10px, `1px solid var(--border)`, `--card` bg, 13px/1.5) placeholder `Evidence, reflections, assessor notes…`.
  - **Group sub-headers:** Unit 10 only — its competencies are split into two themes shown as inline dividers: **"Interviewing victims & witnesses"** (10.1–10.10) and **"Interviewing suspects"** (10.11–10.22). Render as a row: mono 11px/600 uppercase `--accent` label + a `1px` `--line` rule filling the remaining width, shown before the first competency of each group. (Data-driven via each competency's optional `group` field — show the header when the group changes.)

### Focus areas — right rail `<aside>` (identical in all layouts)
- Sticky (`top:16px`), `width:256px`, `order:3` (always rightmost), `align-self:flex-start`, `no-print`. Card: `--card`, `1px solid var(--border)`, radius 16px, `padding:16px 15px`.
- Header: `Focus areas` (IBM Plex Sans 13.5px/700) + mono `{completeCount}/{19}` at right; sub-line (11px, `--sub`): `Complete when all linked evidences are signed off.`
- If a focus filter is active, a full-width **Clear "{name}" ✕** button (`--accent` border, `--accentSoft` bg, `--accent` text).
- Scrollable list (`max-height:calc(100vh - 150px); overflow:auto`) of **19 focus-area rows**. Each row is a **plain toggle button** (`class="frow"`): a status **dot** (`8×8`, radius 2px, coloured by aggregate status) + the focus-area **name** (11.5px/600, truncates). **No progress bar and no count** in the row. Active row: `--accentSoft` bg + `1px solid var(--accent)`. Inactive: transparent bg + transparent 1px border. Hover: `translateX(3px)`.
- **Behaviour:** clicking a focus row filters the whole competency list to just that focus area's linked competencies (single-select — clicking another replaces it; clicking the active one clears). A focus area's dot/status is **Done** only when *all* its linked evidences are Done, **In progress** if any are Done/in-progress, else **Not started**.

### Layout A — "Command" (default)
Above `<main>`, full-width (`max-width:1240px`):
- **Header card** (`fadeUp`): left — a 10×30 `--accent` accent bar + title **"Student Competency Portfolio"** (20px/700, `-.015em`) + mono sub-label `PC DEGREE APPRENTICESHIP · 15 UNITS` (`--muted`, uppercase, .1em); below it **Student** text input (radius 10px, `--input` bg, `--border`, 230px) and a **Date** input. Right — a **124px completion ring** (see Ring) with `{pct}%` + `COMPLETE`, and a **counts stack**: Done / In progress / Pending each = coloured dot + big number (21px/700) + label, then a dashed-top line `{remaining} of {total} evidences left`. Full-width **stacked overall bar** below (12px, `--track` track, `--done` then `--prog` segments).
- **Evidence map card** (`fadeUp`, `no-print`): title `Evidence map` + a legend (Done/In progress/Pending swatches). Then, per unit, a labelled block `UNIT {n}` above an **8-column grid of 15×15 cells** — one cell per evidence, coloured `--done` / `--prog` / `--pendCell`. Clicking a cell cycles that evidence's status (with a tooltip `"{code} · evidence i/N — {label}"`). Footer hint (mono, `--muted`): `Tip — each square is one required evidence. Click to cycle its status.`

### Layout B — "Analytics"
Above `<main>`: a slim title row (title + Student/Date inputs inline), then a **KPI row** of four cards (`--card`, radius 16px):
1. Overall completion — a **104px ring** + "Overall completion" + `{done} of {total} evidences done` + `{remaining} remaining`.
2/3/4. **Done / In progress / Pending** — each: coloured dot + mono uppercase label, a big 32px/700 number, and a 6px mini bar whose width is that state's share of total.
Then a **Unit progress** card: a row per unit — number badge + unit name (truncates) + a 150px stacked mini-bar (done/prog) + mono `uDone/uTot`, each row an anchor link to `#unit-{n}`.

### Layout C — "Sidebar"
A three-pane view: **left `<aside>`** (sticky, 296px) with title, compact Student/Date inputs, a **120px ring**, a compact Done/Prog/Pend triple, an overall stacked bar, and a scrollable **Units index** (number + name + tiny stacked bar, each an anchor to `#unit-{n}`); the **centre `<main>`** (competency list); and the **right Focus-areas rail**.

### The completion ring (all layouts)
Two concentric SVG circles, group rotated `-90deg`. Track circle `stroke:var(--track)`, `stroke-width:12` (11 for the 104px ring). Progress circle `stroke:var(--done)`, `stroke-linecap:round`, `stroke-dasharray="{filled} {circumference}"` where `filled = pct/100 × 2πr`. Radii used: **r=52** (124px & 120px rings, circumference ≈ 326.7) and **r=44** (104px ring, circ ≈ 276.5). Centre shows `{pct}%` (30px/700) + mono `COMPLETE`. On load the progress arc **draws in** via a `ringDraw` keyframe animating `stroke-dashoffset` from `--circ` to 0; `stroke-dasharray` transitions (`.6s`) when pct changes.

---

## Interactions & Behavior
- **Cycle evidence:** click any marker (in a row) or any heat-map cell → `pending → progress → done → pending`. Updates every derived value (ring, counts, bars, focus statuses, heat-map) live and persists.
- **Notes:** toggle per competency; typing persists (debounce on the server). Expand/Collapse-all act on all rows.
- **Outstanding-only filter:** hides Done evidences / fully-complete competencies; combines with the focus filter; units with nothing left to show are hidden.
- **Focus filter:** single-select; filters the list to the focus area's competencies; **Clear** in the rail resets it.
- **View switch:** Command / Analytics / Sidebar — persisted.
- **Theme switch:** five themes — persisted; swaps CSS variables instantly.
- **Export / Import / Print** as above.
- **Animations (gate behind `prefers-reduced-motion`):**
  - `fadeUp` (`opacity 0→1`, `translateY(10px)→0`, `.5s cubic-bezier(.2,.7,.3,1)`) on the summary card, evidence-map card, focus rail, and each unit card (staggered `.03s` per card up to `.21s`).
  - Ring draw-in (`ringDraw`, `1.05s cubic-bezier(.4,0,.2,1)`).
  - All progress-bar fills and the ring **transition their width/dasharray** (`.55–.6s`) so marking evidence glides.
  - Unit-card hover raises shadow; focus rows shift `translateX(3px)`; every button presses with `transform:scale(.96)` on `:active`.

## State Management
Mirror the prototype's state object (persist the first four per user; `expanded`/`filterOutstanding`/`focusFilter` are ephemeral UI state):
- `statuses`: `Record<string,'pending'|'progress'|'done'>` keyed by **`"{code}#{i}"`** (i = 0-based evidence index), default `pending`.
- `notes`: `Record<string,string>` keyed by competency `code`.
- `name`: string. `date`: ISO `YYYY-MM-DD` (default today).
- `layout`: `'A'|'B'|'C'` (default `'A'`). `theme`: one of the five keys (default `'slate'`).
- `expanded`: `Record<code, boolean>`; `filterOutstanding`: boolean; `focusFilter`: focus id | null.

**Derived each render:** totals (`total/done/prog/pend`, `pct`), per-unit done/prog counts + bar widths, per-focus done/total + status, the heat-map cells, and the unit list (after focus + outstanding filters). Cycle logic: `order=['pending','progress','done']; next = order[(order.indexOf(cur)+1)%3]`.

## Design Tokens

**Typography:** `IBM Plex Sans` (400/500/600/700) for UI; `IBM Plex Mono` (400/500/600) for codes, counts, labels, tips. Load via `next/font/google`.

**Semantic CSS variables** (set per theme on the root wrapper; every colour uses `var(--…)`):
`--bg --card --card2 --ink --body --sub --muted --border --line --track --input --accent --accentSoft --done --prog --pendDot --pendCell --doneBg --doneInk --progBg --progInk --pendBg --pendInk --chipPendBg --chipPendBorder --chipPendInk`

**Themes** (id → name → key values; full sets are in `design-reference/Student Portfolio.dc.html` → `Component.THEMES`):
- **slate — "Slate & Blue"** (default): `--bg:#eef1f6 --card:#ffffff --card2:#fbfcfe --ink:#1b2230 --body:#3a4453 --sub:#667085 --muted:#8a94a6 --border:#e2e7ef --line:#eaeef4 --track:#eef1f5 --input:#f8fafc --accent:#2f6fed --accentSoft:rgba(47,111,237,.10) --done:#12a150 --prog:#e08a00 --pendDot:#8a94a6 --pendCell:#c8d0dc --doneBg:#e7f6ee --doneInk:#12a150 --progBg:#fbf1df --progInk:#b46f00 --pendBg:#eef1f5 --pendInk:#64748b --chipPendBg:#f4f6fa --chipPendBorder:#cdd5e0 --chipPendInk:#9aa4b2`
- **midnight — "Midnight"** (dark): `--bg:#0e1420 --card:#18202f --card2:#141b28 --ink:#e9edf6 --body:#c4ccdb --sub:#98a3ba --muted:#6d7a93 --border:#28324a --line:#222b40 --track:#222b40 --input:#141b28 --accent:#5b8cff --accentSoft:rgba(91,140,255,.16) --done:#1db877 --prog:#f0a83a --pendDot:#7e8aa6 --pendCell:#38425c --doneBg:rgba(29,184,119,.16) --doneInk:#4fd39c --progBg:rgba(240,168,58,.16) --progInk:#f2bd68 --pendBg:rgba(126,138,166,.16) --pendInk:#a9b3c9 --chipPendBg:#1b2334 --chipPendBorder:#374363 --chipPendInk:#8492ad`
- **pinkgold — "Pink & Gold"**: `--bg:#faf4f6 --card:#ffffff --card2:#fdf8fa --ink:#3a2731 --body:#5c414d --sub:#8c6c78 --muted:#b295a1 --border:#f0dde5 --line:#f4e8ee --track:#f3e4ea --input:#fdf6f9 --accent:#c8437f --accentSoft:rgba(200,67,127,.12) --done:#c1962f --prog:#e07aa6 --pendDot:#bda3af --pendCell:#ecd7e0 --doneBg:#f7edd6 --doneInk:#9c7618 --progBg:#fce7f0 --progInk:#b8477f --pendBg:#f2e6ec --pendInk:#9a7d8b --chipPendBg:#fbf3f7 --chipPendBorder:#ecd3de --chipPendInk:#b295a1`
- **forest — "Forest & Clay"**: `--bg:#eef2ef --card:#ffffff --card2:#f8faf8 --ink:#1c2a24 --body:#374a41 --sub:#5f7268 --muted:#8b9a92 --border:#dde6e0 --line:#e7eee9 --track:#e8efea --input:#f6f9f7 --accent:#12866f --accentSoft:rgba(18,134,111,.12) --done:#4a9d54 --prog:#c98a3c --pendDot:#8b9a92 --pendCell:#c8d5cd --doneBg:#e4f4ea --doneInk:#237a45 --progBg:#f6ecd9 --progInk:#9a6a22 --pendBg:#e9efeb --pendInk:#5f7268 --chipPendBg:#f2f6f3 --chipPendBorder:#cdd8d1 --chipPendInk:#93a29a`
- **graphite — "Graphite"**: `--bg:#f3f4f6 --card:#ffffff --card2:#fafbfc --ink:#161a20 --body:#39414d --sub:#606a78 --muted:#98a1ad --border:#e4e7ec --line:#eef0f3 --track:#eceef1 --input:#f7f8fa --accent:#3a4657 --accentSoft:rgba(58,70,87,.10) --done:#3f9d6a --prog:#c58a3e --pendDot:#98a1ad --pendCell:#cbd1da --doneBg:#e8f4ee --doneInk:#2f7a50 --progBg:#f6edda --progInk:#8f6522 --pendBg:#eceef2 --pendInk:#5a6470 --chipPendBg:#f4f6f8 --chipPendBorder:#d3d9e0 --chipPendInk:#98a1ad`

**Spacing / radii / shadows:** card radius 16–18px; inner rows 10–12px; buttons 8–10px; markers 8px; pills 20px. Card shadow `0 1px 3px rgba(16,24,40,.04–.05)`; hover `0 8px 24px rgba(16,24,40,.09)`. Container `max-width:1240px`, `24px` side padding; column gap `22px`.

**Print CSS** (recreate): hide `.no-print`; show `.print-only` (the per-competency status badge = `d/N done`, coloured by `--doneBg/--doneInk` etc.); white background; unit cards `break-inside:avoid`, no shadow, no entrance animation.

## Assets
None external. No images, logos, or icon libraries — the only "icon" is the `✎` glyph on the notes toggle (use any pencil icon from your icon set). All visuals are CSS/SVG. Fonts: IBM Plex Sans + IBM Plex Mono (Google Fonts / `next/font`).

## Data Model (ship as typed reference data — `lib/portfolio-data.ts`)
The complete, authoritative dataset lives in `design-reference/Student Portfolio.dc.html` in three static arrays — copy them verbatim:
- **`Component.DATA`** — the 15 units. Each unit: `{ num, name, comps: [{ code, req, title, group? }] }`. `req` is how many evidences that competency needs (1–3). `group` appears only on Unit 10's competencies (`'Interviewing victims & witnesses'` for 10.1–10.10, `'Interviewing suspects'` for 10.11–10.22). Sum of all `req` = **157**.
- **`Component.FOCUS`** — the 19 focus areas: `{ id, name, codes: [competencyCode, …] }`. A focus area is Done when every evidence of every listed competency is Done. (E.g. `{id:15, name:'Victim interview', codes:['10.2A']}`, `{id:5, name:'Conflict', codes:['4.1','4.2','4.3','4.4','4.5a','4.5b','4.6']}`.)
- **`Component.THEMES` / `THEME_ORDER`** — the five theme variable sets and their order (also transcribed above).

Unit names (for quick reference): 1 Operating with Law, Professional Practice and the Code of Ethics · 2 Processes for Management of Information / Intelligence · 3 Initial Response · 4 Managing Conflict · 5 Support to Vulnerable People, Victims & Witnesses · 6 Police Powers and Suspects · 7 Conducting Police Searches · 8 Conducting Police Searches of a Person · 9 Conducting Investigations · 10 Interviewing Victims, Witnesses and Suspects · 11 Community Policing and Partnership Working · 12 Response Policing · 13 Roads Policing · 14 Information, Intelligence and Evidence · 15 Digital Investigations & Criminal Justice.

## Files
- `design-reference/Student Portfolio.dc.html` — the full hifi prototype (markup + logic + the `DATA`, `FOCUS`, `THEMES` constants). Primary source of truth.
- `design-reference/support.js` — the prototype's runtime (reference only; **do not port**).

## Suggested build order
1. Scaffold Next.js (App Router, TS) + Tailwind/CSS Modules; wire `next/font` IBM Plex; add the theme variable sets + a `data-theme` (or inline `style`) wrapper.
2. Port `DATA` / `FOCUS` / `THEMES` into `lib/portfolio-data.ts`.
3. Build the competency list + evidence markers + notes with local reducer state; implement the derived selectors (totals, per-unit, per-focus, heat-map).
4. Add the three layouts (Command / Analytics / Sidebar) and the ring/bars.
5. Add filters (Outstanding, Focus rail), View + Theme switches, Export/Import/Print, animations.
6. Add auth + DB persistence + Route Handlers/Server Actions with optimistic updates.
7. Deploy to Vercel; set env vars; verify print output.

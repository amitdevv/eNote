# eNote Design System

A minimal, content-first design language inspired by Linear — cozy spacing, subtle depth, neutral grays, and one soft accent. Built on Tailwind + Radix primitives (via shadcn-style copy-paste components).

---

## 1. Principles

Two north-star principles, borrowed from Linear's 2025 refresh — they earn their place at the top because they actually resolve design arguments:

> **Don't compete for attention you haven't earned.**
> Navigation, chrome, and orientation recede. The note is the hero. When something becomes visually loud, ask: has this element earned that attention today?

> **Structure should be felt, not seen.**
> Hierarchy comes from rhythm, spacing, and subtle tone shifts — not from borders, dividers, and boxes stacked on boxes.

Everything below descends from those two:

1. **Chrome recedes, content leads.** Sidebar is dimmer than content. Main surface is the brightest thing on screen. Controls are low-contrast until hovered.
2. **Warm neutrals, not cool neutrals.** Our grays have a faint warm tint — less clinical, more paper-like. Pure blue-tinted grays feel sterile at density.
3. **One accent + one bounded palette.** Emerald (`#10B981`) is reserved for identity (workspace avatar, pin, selected state, focus rings). Labels/statuses/priorities use the separate 12-hue palette in §2.6 — never the brand green. Buttons and rows stay neutral.
4. **Soft depth over hard edges.** `shadow-xs` + 1px translucent border beats a 2px solid border. Fewer separators overall; if two elements are on different surfaces, you don't need a line between them.
5. **Rounded, restrained.** 8px default radius. 12px for surfaces/cards. 9999px for pill controls. Never 4px (too sharp), never 16px (too playful).
6. **Text hierarchy by weight + shade, not size.** Three sizes cover 95% of the UI: 12px (meta), 13px (body UI), 16px (content). Differentiate via weight (400/500/600) and ink shade.
7. **Motion is subtle.** 150–200ms ease-out for hover/focus/active. No bouncy springs in nav. Reserve `framer-motion` for modals, onboarding, and sheet transitions.
8. **Dark mode is first-class.** Every token has a dark equivalent; no ad-hoc `dark:` overrides in component code.
9. **Strip decorative treatments.** No colored backgrounds behind team/workspace icons. No icon drop shadows. No gradients except the one subtle group-header lift.
10. **Form constrains function.** When we add AI, structured UI shapes what the model does — not the reverse. A chat box is a weak, generic form. Shape-specific inputs (a "summarize this note" button on a note, a "find related" action on a tag) produce more consistent, lower-variance outcomes. *(From Linear's* Design for the AI age*.)*
11. **Workbench, not chatbot.** AI is one tool on a bench, not the bench itself. The note — not the assistant — is always the focus. Humans stay in the loop on every AI action (preview, accept, reject). *(Same article.)*
12. **A redesign is visual refinement, not atomic disassembly.** When we do bigger sweeps (every 2–3 years, per Linear's cadence), we polish the existing shape; we don't re-architect navigation and structure at the same time.

---

## 2. Tokens

**Color strategy:** warm neutrals, not cool. Our grays carry a faint hint of yellow/red (hue ~40°) instead of blue — closer to parchment than steel. Saturation stays under 4% so the warmth is felt but never seen.

**Label colors are user-assigned, not hashed.** Users pick a color from the 12-entry palette (§2.6) when they create a label in Settings. The choice is stored on the `labels` row and rendered everywhere the label appears. No automatic hashing, no "work is always amber" magic — the user gets a small swatch picker and decides. Orphan label names (referenced by a note but no longer in the user's label set) render in `stone` so they're still visible but obviously demoted.

**Highlights follow the same curation pattern.** A separate `highlights` table holds user-named highlight styles (name + hex color, picked from the palette's `bg` tints in §2.6). In the editor, select text → Highlight button in the bubble menu → pick from your highlights. The **hex is stored on the TipTap mark directly**, not resolved at render — so deleting or editing a highlight definition doesn't retroactively change text already highlighted. This is a deliberate difference from labels (where we resolve by name), because editing note content is an infrequent action, but writing is a frequent one: users would be confused if their yellow passages mysteriously turned pink because they tweaked a definition.

> **Future direction — LCH + 3 variables.** Linear rebuilt their theming on LCH (perceptually uniform) and expose only three inputs: `base`, `accent`, `contrast`. Every surface and ink shade is derived. We'll migrate when we add user themes; for now the static tokens below are the source of truth. When the migration happens, these tokens become derived values, not declared ones.

### 2.1 Color (light)

| Token | Hex | Usage |
|---|---|---|
| `--surface-app` | `#F4F3F1` | Page / sidebar — warm, dimmed |
| `--surface-panel` | `#FDFCFA` | Main content card, popovers — brightest |
| `--surface-raised` | `#FFFFFE` | Elevated buttons, inputs |
| `--surface-muted` | `#EFEEEC` | Selected tab, subtle fill |
| `--surface-active` | `#E6E4E1` | Active sidebar item, pressed |
| `--ink-strong` | `#1C1B19` | Headings, active item |
| `--ink-default` | `#2E2D2A` | Body, workspace name |
| `--ink-muted` | `#5C5A56` | Sidebar items, secondary |
| `--ink-subtle` | `#6B6965` | Tabs, captions |
| `--ink-placeholder` | `#A09E9A` | Placeholder, disabled |
| `--line-subtle` | `#F0EEEB` | Section dividers |
| `--line-default` | `#E2E0DC` | Inputs, cards |
| `--brand` | `#10B981` | Avatar, active identity (rationed) |
| `--brand-fg` | `#FFFFFF` | Text on brand |

### 2.2 Color (dark)

Dark mode also warm-leaning — grays toward `#1A1917` (warm black) rather than `#111114` (cool black).

| Token | Hex | Usage |
|---|---|---|
| `--surface-app` | `#0F0E0D` | Page / sidebar |
| `--surface-panel` | `#171614` | Main content |
| `--surface-raised` | `#1E1C1A` | Elevated buttons |
| `--surface-muted` | `#252320` | Selected tab |
| `--surface-active` | `#2E2B27` | Active item |
| `--ink-strong` | `#F5F4F2` | Headings |
| `--ink-default` | `#D6D4D0` | Body |
| `--ink-muted` | `#9C9A95` | Sidebar |
| `--ink-subtle` | `#807E78` | Captions |
| `--ink-placeholder` | `#57554F` | Placeholder |
| `--line-subtle` | `#1F1E1B` | Dividers |
| `--line-default` | `#2A2825` | Inputs |
| `--brand` | `#12B5D0` | Lifted for contrast in dark |

### 2.3 Spacing

Use Tailwind defaults. Canonical values:
- `1` (4px) — icon↔label inside pills
- `1.5` (6px) — icon↔label inside nav rows
- `2` (8px) — card padding, icon button padding
- `3` (12px) — section padding
- `4` (16px) — page gutters
- `6` (24px) — section gap

### 2.4 Radius

| Token | Value | Usage |
|---|---|---|
| `rounded-md` | `6px` | Inputs, small chips |
| `rounded-lg` | `8px` | **Default.** Buttons, nav items, list rows |
| `rounded-xl` | `12px` | Cards, main surface, popovers |
| `rounded-full` | `9999px` | Icon buttons, tabs, avatars |

### 2.5 Shadow

| Token | Value | Usage |
|---|---|---|
| `shadow-xs` | `0 1px 1px rgba(0,0,0,.04), 0 3px 6px rgba(0,0,0,.02)` | Raised buttons, pills |
| `shadow-sm` | `0 3px 6px -2px rgba(0,0,0,.02), 0 1px 1px rgba(0,0,0,.04)` | Main content card |
| `shadow-md` | `0 8px 24px -4px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.04)` | Popovers, dropdowns |
| `shadow-lg` | `0 16px 48px -8px rgba(0,0,0,.12), 0 4px 8px rgba(0,0,0,.06)` | Modals |

Dark mode: same structure, swap `rgba(0,0,0,*)` → `rgba(0,0,0,.35)` and add a top-edge highlight `inset 0 1px 0 rgba(255,255,255,.04)` for raised surfaces.

### 2.6 Accent palette — labels, statuses, priorities

Linear's colored-dot + tinted-pill pattern is the one place the app earns color.
Each label string hashes deterministically to a palette entry (see
`src/features/notes/labelColor.ts`) so `work` is always the same amber,
`idea` always the same blue — no per-user config.

Rules:
- Use the palette only for **labels, statuses, and priorities**. Never for chrome or body surfaces.
- A pill has three parts: **dot** (the color signal), **bg** (quiet tint), **text** (readable on the tint).
- On the notes list row we use `size="xs"` (20px tall); on the editor and filters `size="sm"` (24px).
- The dot is also used alone (without the pill) in pickers, where the label text sits next to it — matches Linear's status picker.

| Family | `--dot` | `--bg` | `--text` |
|---|---|---|---|
| amber | `#F59E0B` | `#FEF3C7` | `#92400E` |
| yellow | `#EAB308` | `#FEF9C3` | `#854D0E` |
| lime | `#84CC16` | `#ECFCCB` | `#3F6212` |
| green | `#22C55E` | `#DCFCE7` | `#166534` |
| teal | `#14B8A6` | `#CCFBF1` | `#115E59` |
| cyan | `#06B6D4` | `#CFFAFE` | `#155E75` |
| blue | `#3B82F6` | `#DBEAFE` | `#1E40AF` |
| indigo | `#6366F1` | `#E0E7FF` | `#3730A3` |
| purple | `#A855F7` | `#F3E8FF` | `#6B21A8` |
| pink | `#EC4899` | `#FCE7F3` | `#9D174D` |
| red | `#EF4444` | `#FEE2E2` | `#991B1B` |
| stone | `#78716C` | `#F5F5F4` | `#44403C` |

**Why 12 entries, not 6 or 20?** Six is too few — frequent collisions between
unrelated labels. Twenty means adjacent hues are indistinguishable. Twelve
lets every label feel distinct while staying within a curated set.

**Dark mode note** (when we add it): keep the dots, swap the bg to `color-mix(dot, #000 70%)` and text to `color-mix(dot, #FFF 60%)`. Already roughed in §2.2.

### 2.7 Typography

**Font stack:** `Inter Variable, system-ui, sans-serif` for UI. `Geist` for branded content. Monospace: `Fira Code, ui-monospace`.

| Size | Line height | Weight | Usage |
|---|---|---|---|
| `text-[11px]` | `16px` | 400 | Avatar initials |
| `text-xs` (12px) | `16px` | 500 | Section labels, meta |
| `text-[13px]` | `normal` | 500 | Nav items, buttons, tabs (**most common**) |
| `text-sm` (14px) | `20px` | 400 | Workspace name, tooltips |
| `text-base` (16px) | `24px` | 400 | List titles, content |
| `text-lg` (18px) | `28px` | 600 | Page titles |
| `text-2xl` (24px) | `32px` | 600 | Section headings |

**Letter spacing:** `-0.01em` on size ≥ 14px. Default otherwise.

### 2.8 Motion

| Token | Value | Usage |
|---|---|---|
| `transition-fast` | `150ms cubic-bezier(.4,0,.2,1)` | Hover, focus |
| `transition-base` | `200ms cubic-bezier(.4,0,.2,1)` | Open/close, toggles |
| `transition-slow` | `300ms cubic-bezier(.16,1,.3,1)` | Modal, sheet (spring-ish ease) |

Never animate `background-color` on parent rows when children have hover states — flicker. Use `background-image` transitions or opacity layers.

---

## 3. Component library choice

**Decision: stay on Radix + Tailwind (shadcn pattern).** Reasoning below.

| Library | Fit for eNote | Notes |
|---|---|---|
| **Radix + shadcn (current)** | ✅ Best | Headless, accessible, copy-paste — you own the code. Matches the Linear aesthetic. No vendor lock-in. |
| **Ark UI** | ⚠️ Comparable | Framework-agnostic, slightly better multi-select UX. Migration cost not worth it for solo personal use. |
| **React Aria (Adobe)** | ⚠️ Overkill | Best-in-class accessibility. Verbose. Great for enterprise apps, heavy for a notes app. |
| **Headless UI** | ❌ Limited | Tailwind Labs. Fewer primitives (no context menu, no toast, no tooltip). Don't downgrade. |
| **Base UI (MUI)** | ❌ Immature | Very new, fewer primitives than Radix, MUI opinions leak through. |
| **Material / Chakra / Mantine** | ❌ Wrong fit | Styled systems. Would fight Tailwind + the minimal aesthetic. |

**What to add on top of Radix:**
- `cmdk` — command palette (⌘K) when we add global search / quick nav
- `sonner` — already installed. Keep for toasts.
- `react-hotkeys-hook` — keyboard shortcuts (Linear-style `c` for create, `g i` for inbox)
- `vaul` — bottom sheets on mobile when we do Capacitor wrap

**What to drop:**
- Unused `@radix-ui/*` packages from package.json (audit after component refactor).

---

## 4. Component catalog

Each primitive lives in `src/components/ui/`. Pattern: `forwardRef`, `cva` variants, `cn` merger, Radix-backed where applicable.

### 4.1 Primitives (foundation — rebuild these first)

- `Button` — `default` | `secondary` | `ghost` | `outline` | `destructive` | `link`. Sizes `sm` (28px) | `md` (32px) | `lg` (40px) | `icon` (28px square).
- `IconButton` — pill (round, 28px), square (8px radius). Hover raises via `shadow-xs`.
- `Input` — 32px height, 13px text, border `--border-default`, focus ring `--accent` at 20% alpha.
- `Textarea` — same token as Input, min-height 80px.
- `Label` — 12px medium, `--text-muted`.
- `Kbd` — inline keyboard shortcut rendering (`⌘K`).
- `Separator` — 1px `--border-subtle`.
- `Spinner` — replaces `Loader2` usage; standardize size.

### 4.2 Composite (build after primitives)

- `NavItem` — sidebar row. Icon + label + optional count badge. Active = `surface-active` + `ink-strong`.
- `NavSection` — collapsible group header (e.g. "Workspace", "Your teams").
- `TabBar` — pill tabs (like the Active / Backlog row in Figma). Active = `surface-muted` + `ink-strong`.
- `Card` — `surface-panel` + `shadow-sm` + `rounded-xl` + 1px `line-subtle`.
- `ListRow` — note row. Left icon slot, title, meta, right-side slot (date, avatar).
- `GroupHeader` — the gradient "In Progress 1" bar. Subtle horizontal gradient, 36px tall.
- `EmptyState` — centered icon + title + caption + optional CTA.
- `Avatar` — initials or image, `rounded-lg` for workspace, `rounded-full` for people.
- `Badge` / `Chip` — count indicators, tag pills.
- `LabelChip` — tinted pill with colored dot + label text. `xs` (20px) / `sm` (24px) / `md` (28px). Hashes string to §2.6 palette.
- `LabelDot` — dot only, for pickers where text sits beside it.
- `LabelEditor` — inline tag input with chips, Enter/comma commits, Backspace removes last, auto-strips `#`, lowercases, dedupes.
- `Breadcrumb` — `Workspace › ID › Title` pattern for detail views. `ink-default` 13px medium, `ink-subtle` chevron separator. Truncates middle segment on narrow widths.
- `PropertyCard` — 316px right-rail card. `surface-raised` + `rounded-[10px]` + 1px `#F7F7F7` border + `shadow-xs`. Header: label 13px regular `ink-subtle` + caret. Rows: 28px pill buttons with 14–16px icon + label.
- `PillGroup` — horizontal segmented group of icon buttons (e.g. copy URL / copy ID / copy branch / copy-as-prompt). Single rounded container, 1px divider between segments, no gaps. 28px tall.
- `ActivityItem` — timeline row. 14px avatar bullet on the left, inline text `ink-subtle` 12px, `·` dot separator, relative timestamp ("15d ago"). No background; relies on spacing rhythm alone.
- `CommentBox` — card-wrapped textarea. `surface-raised` + `rounded-lg` + `shadow-xs`. Icon actions (attach, submit) pinned bottom-right, 24px rounded-icon buttons. Min-height 84px, grows with content.
- `Toolbar` — bottom-fixed action bar (like Linear's "Ask Linear" strip). `surface-app` bg, 28px tall content, right-aligned actions.

### 4.3 Overlays

- `Dialog` — `shadow-lg`, `rounded-xl`, max-width 520px, 24px padding.
- `DropdownMenu` — `shadow-md`, `rounded-lg`, 4px padding, 28px item height.
- `Popover` — same as dropdown.
- `Tooltip` — `--text-strong` bg, `--bg-surface` text, 11px, 6px padding.
- `Toast` — via sonner, styled to match surface + shadow-md.
- `CommandMenu` — cmdk wrapper. ⌘K.

### 4.4 App shell (highest level)

- `AppLayout` — grid: sidebar (244px, collapsible to 56px) + content.
- `Sidebar` — 244px, bg `--bg-app`.
- `ContentFrame` — 1px border + rounded-xl + shadow-sm, sits on `--bg-app`.
- `PageHeader` — 43px tall, title + actions, border-bottom `--border-subtle`.
- `FilterBar` — below PageHeader, tab pills + filter/display icon buttons on the right.
- `BottomBar` — "Ask AI" equivalent (our AI assistant entry, if we add one).

---

## 5. Page patterns

Derived from the Figma reference (Linear's Issues view), adapted to notes.

### Notes list view
```
┌─ Sidebar ────────┬─ ContentFrame ────────────────────────┐
│ Workspace menu   │ PageHeader: "Notes" + star + bell     │
│ Inbox            ├───────────────────────────────────────┤
│ My notes         │ FilterBar: All / Recent / Archived    │
│                  ├───────────────────────────────────────┤
│ ▼ Workspace      │ GroupHeader: "Today   3"              │
│   Projects       │   ListRow: title, tags, date          │
│   Views          │   ListRow: ...                        │
│                  │ GroupHeader: "This week  12"          │
│ ▼ Your teams     │   ...                                 │
│   amitwork       │                                       │
│     Notes (*)    │                                       │
│     Projects     │                                       │
└──────────────────┴───────────────────────────────────────┘
```

### Note detail view (editor)
Derived from Figma node `2:311`. This is the core working surface.

```
┌─ Sidebar ────────┬─ ContentFrame ─────────────────────────────────────┐
│ (same as list)   │ Header (44px, border-b):                           │
│                  │   Breadcrumb: Workspace › ID › "Title"             │
│                  │   Right-side: ⭐ favorite · ⋯ more                 │
│                  ├──────────────────────────┬─────────────────────────┤
│                  │                          │ PillGroup (top-right):  │
│                  │  # Note title (24/32,    │   copy URL · copy ID ·  │
│                  │    Inter Display, semi)  │   copy branch · copy-   │
│                  │                          │   as-prompt / work-on   │
│                  │  😀 add reaction  📎     │                         │
│                  │  + Add sub-notes         │ PropertyCard:           │
│                  │                          │   ▸ Properties          │
│                  │  ─── divider ───         │     ● In Progress       │
│                  │                          │     ▪ Low priority      │
│                  │  ## Activity   Unsub 👤  │     ● Amit Chaudhary    │
│                  │                          │                         │
│                  │  ● Linear created the    │ PropertyCard:           │
│                  │    issue · 15d ago       │   ▸ Labels              │
│                  │                          │     + Add label         │
│                  │  ┌ CommentBox ─────────┐ │                         │
│                  │  │  (textarea)         │ │ PropertyCard:           │
│                  │  │                  📎↑│ │   ▸ Project             │
│                  │  └─────────────────────┘ │     + Add to project    │
└──────────────────┴──────────────────────────┴─────────────────────────┘
                                                                Ask AI →
```

**Layout rules:**
- Main column: max-width ~640px, centered with 60px left gutter.
- Right rail: 316px wide, 10px padding from edge, stack of `PropertyCard`s with 8px gap.
- Title: **24px / 32px line, Inter Display semi-bold, -0.16px tracking**, `ink-strong`.
- Divider between title/meta and Activity: 1px `line-default`, full column width.
- Activity items have no card — pure timeline on surface.
- CommentBox sits inside the main column, not the rail. Focus reveals submit button opacity.

### Settings view

### Settings view
- Two-column: left nav (160px) inside ContentFrame, right detail.
- Group settings by: Account, Appearance, Editor, Shortcuts, Data.

---

## 6. Accessibility

- Every interactive element has a visible focus ring (`focus-visible:ring-2 ring-[--accent]/40`).
- Color is never the only signal — icons + text accompany state.
- Tap targets ≥ 40×40px on mobile, ≥ 28×28px with padded hit areas on desktop.
- Keyboard: every nav item and button reachable via Tab. ⌘K opens command palette. Esc closes overlays.
- Reduced motion: respect `prefers-reduced-motion` — drop the slide-in, keep only the opacity fade.

---

## 7. Implementation order

1. **Tokens** — extend `tailwind.config.js` + `index.css` with the tokens above. *(small)*
2. **Primitives** — rebuild `Button`, `IconButton`, `Input`, `Label`, `Kbd`, `Spinner`. *(medium)*
3. **Composites** — `NavItem`, `NavSection`, `TabBar`, `Card`, `ListRow`, `GroupHeader`, `EmptyState`. *(medium)*
4. **Shell** — rebuild `Sidebar`, `AppLayout`, `PageHeader`, `FilterBar` using new primitives. *(medium)*
5. **Pages** — migrate notes list, editor, settings to new shell. *(large, incremental)*
6. **Overlays polish** — Dialog, DropdownMenu, Popover, Tooltip, CommandMenu. *(medium)*
7. **Motion pass** — add subtle transitions + page transitions. *(small)*
8. **Dark mode audit** — verify every token pair, fix hardcoded `dark:` classes. *(medium)*

Each step is a self-contained PR. The app stays usable throughout — we are not rewriting all at once.

---

## 8. Anti-patterns to avoid

- ❌ Inline hex colors. Always use tokens.
- ❌ `shadow-2xl`, loud drop shadows. Stay subtle.
- ❌ Gradients as fills (okay as 1% lift on group headers).
- ❌ Icon-only buttons without `aria-label`.
- ❌ Custom spacing values outside the scale (no `mt-[7px]`).
- ❌ Multiple accent colors. One accent. Period.
- ❌ Long multi-line tooltips. Two lines max.
- ❌ New font families unless the user picks one in settings.

---

## 9. Process — design before code

From Linear's *Design is more than code*:

> "My worry isn't the code or the tools themselves. It's a decline in consideration."
> "While the outcome is the goal, spending time on the journey can make the outcome better."
> "Tools carry opinions."

eNote is solo and AI-assisted, which makes the temptation to skip straight to code stronger, not weaker. LLMs will happily implement whatever you ask — including the wrong thing, beautifully. Guardrails:

### Two stages, always

1. **Conceptual** — before any code for a non-trivial change:
   - State the problem in one sentence. Is it real? Who felt it?
   - Sketch in words, paper, or screenshots. Not in JSX.
   - Identify the one decision that matters most (layout? density? motion?). The rest follows.
2. **Execution** — code only after the concept is chosen:
   - Implement the simplest version that tests the concept.
   - Self-review against the principles in §1. If it violates one, the concept was wrong, not the code.

For trivial changes (rename, fix bug, style tweak), skip stage 1. Don't skip it to save time on anything else — you'll spend that time twice in rework.

### What "consideration" looks like here

- A new component gets a purpose sentence before a signature.
- A token rename gets a search across the codebase, not just an add.
- A new surface color gets asked: do we actually need a new shade, or does an existing one work?
- An animation gets asked: what does this tell the user? If nothing, delete it.
- A "small" visual tweak gets viewed at both 100% and 200% zoom, light and dark.

### Tools carry opinions

- **Tailwind** wants you to use utility classes. Good default, but fight it when tokens belong in `@layer components` (e.g. `surface-panel` classes).
- **Radix** wants unstyled + headless. Good — we own the styling.
- **shadcn** wants copy-paste. Good — we own the components.
- **Figma** wants pixel-perfect. Don't mistake fidelity for correctness. The reference is a *vector* for our design, not a *target*.
- **Claude Code / LLMs** want to be helpful and ship fast. Helpful to push back on "add a card here" when the answer might be "remove a card somewhere else."

---

## 10. AI in eNote — design stance

From Linear's *Design for the AI age* (Karri Saarinen):

> "Form acts as a way to set the context."
> "A chat interface is a very weak and generic form."
> "Humans stay in the loop, and design still has a massive role to visualize how to make this new world more approachable and understandable."

**Our rules when we add AI features:**

1. **Shape-specific actions beat a global chat box.** Before adding "Ask eNote anywhere," add: summarize-this-note, extract-tasks, find-related, suggest-tags. Each lives where it operates.
2. **AI output is a preview, not a commit.** Any AI-generated edit appears as a diff overlay the user accepts/rejects. Never silently rewrite a note.
3. **The note is the hero, the assistant is the side rail.** If we add a chat pane, it's collapsible and narrow. The note doesn't shrink.
4. **No generic "AI" branding.** No sparkles icon spam, no "✨" on every feature, no purple gradients. AI features use the same neutral ink + brand accent as everything else.
5. **"Copy as prompt" is a first-class action.** On every note and every selection — ship the user's content to their model of choice (ChatGPT, Claude, local LLMs) with one click. This is "workbench," not lock-in.
6. **Determinism where it matters.** Search, filters, and navigation never route through an LLM. AI only runs when the user asks.

---

## 11. Mobile — ProKit, not consumer gloss

From Linear's *Linear spin on Liquid Glass* (Robb Böhnke):

> "When you touch an element, it lifts up slightly, providing quick pulse feedback."
> Avoid refraction — "it can make dense professional interfaces harder to read."

**Rules for the mobile wrap (Capacitor or Tauri, whenever we build it):**

1. **Touch lifts, not ripples.** On press, an element gains 1px shadow and ~1.5% brightness — never a material ripple or scale-down jiggle.
2. **No refraction, no glass distortion.** Translucency is fine for sheets/modals; refractive blur is not — it kills legibility on the dense list view.
3. **Tab bar custom-built.** Not platform-stock. Built from our `NavItem` primitive. Supports >5 destinations and matches desktop sidebar patterns visually.
4. **Respect accessibility contrast.** If the system is set to Increase Contrast, our translucent surfaces drop to opaque equivalents.
5. **Density stays compact.** We do not inflate padding "for touch" — tap targets extend via invisible padding, visual density matches desktop. Notes look the same shape on both platforms.
6. **Same tokens, same shadows.** Mobile doesn't get a different palette. Any dark-mode tweaks happen in the shared token layer.

---

## 12. Design debt — the 2–3 year sweep

From Linear's *A design reset* (Part I):

> "If your product evolves fast, you should be paying this debt every 2–3 years."
> "If you update just one module or view at a time, the overall experience becomes more disjointed."
> "A redesign should not completely disassemble the product to its atomic parts."

**Our cadence:**

- Daily/weekly: small changes, tokens only, never break the visual rhythm.
- Quarterly: audit one surface (e.g. settings, empty states) for alignment with this doc. Fix drift.
- Every 2–3 years: a holistic visual sweep. Update tokens, typography, or the accent — but not navigation structure at the same time. One variable at a time.

**The "concept car" rule.** When exploring a bigger change, label it conceptual in the filename and PR title (e.g. `concept-sidebar-compact.tsx`). This lowers defensiveness in review and makes it easier to ship 20% of the idea if the full thing doesn't work.

---

## 13. Inspiration & references

- **Linear** — primary reference. Cozy density, warm neutrals, pill tabs.
  - [*Behind the latest design refresh*](https://linear.app/now/behind-the-latest-design-refresh) — two north-star principles in §1.
  - [*Design is more than code*](https://linear.app/now/design-is-more-than-code) — §9 Process.
  - [*Design for the AI age*](https://linear.app/now/design-for-the-ai-age) — §10 AI stance.
  - [*A Linear spin on Liquid Glass*](https://linear.app/now/linear-liquid-glass) — §11 Mobile.
  - [*A design reset (Part I)*](https://linear.app/now/a-design-reset) + [*How we redesigned the Linear UI (Part II)*](https://linear.app/now/how-we-redesigned-the-linear-ui) — §12 Design debt, LCH note in §2.
- **Notion** — nav hierarchy, empty states.
- **Vercel Dashboard** — subtle shadows, Geist typography.
- **Raycast** — command palette, keyboard-first.
- **Arc / Things 3** — for spring easing on overlays.

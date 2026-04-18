# eNote v2 — Rebuild Plan

Living checklist for the rebuild. Updated as we go. Companion to `DESIGN.md` (visual system) — this doc is architecture + execution.

## Thesis

Build a minimal notes app with Linear-level craft. Architect so todos + calendar slot in later without rewrite.

## Stack (frozen)

| Layer | Choice | Why |
|---|---|---|
| Framework | React 18 + Vite + TypeScript | Already working, no reason to switch |
| Router | react-router-dom v7 | Already installed |
| Server state | **TanStack Query v5** | Correct tool for async data; Zustand was wrong for this |
| Client UI state | Zustand v5 | Lean, local-only state |
| Styling | Tailwind + shadcn/Radix pattern | Per DESIGN.md §3 |
| DB + Auth | Supabase (Postgres) | Already wired, RLS is great for personal app |
| Editor | **TipTap** (minimal extensions) | Markdown, blocks, small bundle |
| Command palette | **cmdk** | De facto standard, Radix-compatible |
| Shortcuts | **react-hotkeys-hook** | Lean, hook-based |
| Icons | @hugeicons/react | Already migrated |
| Date | date-fns | Already installed |
| Toasts | sonner | Already installed |

## Folder structure (frozen)

```
src/
├── app/                    # shell: router, providers, root
│   ├── App.tsx
│   ├── routes.tsx
│   └── providers.tsx
├── features/
│   ├── notes/              # THE core domain
│   │   ├── api.ts          # typed Supabase queries/mutations
│   │   ├── hooks.ts        # useNotes, useNote, useCreateNote
│   │   ├── store.ts        # Zustand: UI state only (draft, etc.)
│   │   ├── types.ts
│   │   └── components/     # NoteList, NoteDetail, NoteEditor, NoteRow
│   ├── auth/
│   │   ├── AuthProvider.tsx
│   │   ├── hooks.ts        # useAuth, useSession
│   │   └── components/     # LoginPage
│   ├── settings/
│   │   └── components/     # SettingsPage
│   └── _future/            # placeholder for todos, calendar, tags
│       └── README.md
├── shared/
│   ├── components/
│   │   ├── ui/             # primitives: Button, Input, Card, Kbd, Spinner
│   │   └── app/            # composites: Sidebar, PageHeader, CommandMenu
│   ├── hooks/              # useDebounce, useMediaQuery
│   └── lib/
│       ├── supabase.ts     # client + Database types
│       ├── cn.ts
│       ├── date.ts
│       └── icons.ts
├── styles/
│   └── index.css           # design tokens (moved from src/)
└── main.tsx
```

**Rule:** features may import from `shared/` and `features/_future/` may import from nothing. Features **may not** cross-import (notes cannot import from auth directly — go through shared hooks).

## Database schema (new)

See `supabase/migrations/20260418000000_reset.sql`.

Core tables:
- `profiles` — 1:1 with `auth.users`
- `notes` — title, content (jsonb for TipTap), archived, pinned, timestamps, full-text search

Reserved (commented in migration, activate later):
- `tasks` — for todos phase
- `events` — for calendar phase
- `tags` — for tagging phase

RLS: user only sees their own rows.

## Execution phases

### Phase 1 — Foundation (this turn)
- [x] Write `PLAN.md` (this file)
- [x] Write migration SQL
- [ ] Delete legacy `src/` (keep bootstrap files)
- [ ] Add deps: `@tanstack/react-query`, `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-placeholder`, `cmdk`, `react-hotkeys-hook`
- [ ] Create new folder structure with skeleton files
- [ ] Wire app shell: providers → router → minimal notes page that says "OK"
- [ ] Supabase client with new Database types
- [ ] Auth context (minimal: magic-link login)
- [ ] `npm run build` passes
- [ ] User runs migration SQL in Supabase dashboard

### Phase 2 — Core flows (next turn)
- [ ] Sidebar (from DESIGN.md §5 — workspace, inbox, your teams, bottom help)
- [ ] NotesList view (grouped by date, GroupHeader from DESIGN.md)
- [ ] NoteDetail view (layout from DESIGN.md §5.2 — breadcrumb, right rail)
- [ ] TipTap editor with auto-save (debounced)
- [ ] Full-text search (Postgres `fts` column)
- [ ] Command palette (⌘K) — Create note, Search, Open settings
- [ ] Shortcuts: `c` create, `/` focus search, `⌘K` palette, `esc` close

### Phase 3 — Polish
- [ ] Dark mode audit (every token pair)
- [ ] Motion pass (framer-motion for modal/sheet transitions only)
- [ ] Settings page (account, appearance)
- [ ] Empty states
- [ ] Keyboard-first polish (focus rings, Tab order)

### Phase 4 — Mobile wrap
- [ ] Capacitor init
- [ ] Android APK build
- [ ] Test on physical device

### Phase 5 (later) — Expand
- [ ] Todos (activate `tasks` table + sidebar entry)
- [ ] Calendar
- [ ] Tags

## What we dropped (moved to `_future/` conceptually — actually deleted, can be resurrected from git)

- Image-to-text (Tesseract) — huge bundle, niche
- Excalidraw — huge dep, not core
- Font selector / size selector — premature customization
- Landing page — not needed for personal use (login is the first screen)

## What we're intentionally not building in MVP

- Real-time collab (Supabase Realtime later if needed)
- File attachments / images
- Multi-theme
- Public note sharing
- Export/import

## Verification at end of each phase

- `npm run build` passes
- `npm run lint` passes
- Manually exercise: login → create note → edit → search → logout

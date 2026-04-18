# _future

Reserved for post-MVP features. Sidebar shows these as disabled entries so the
app's shape is visible but the code isn't built yet.

Planned:
- `tasks/` — todos. Schema reserved in the migration. Sidebar hook: "Tasks".
- `calendar/` — events. Schema reserved. Sidebar hook: "Calendar".
- `tags/` — tagging. Schema reserved. Tag picker in note detail view.

When activating one of these:
1. Uncomment the relevant block in `supabase/migrations/` and push.
2. Move the folder out of `_future/` into `src/features/`.
3. Update `Sidebar.tsx` to enable the entry.
4. Nothing else cross-imports — isolation is the whole point.

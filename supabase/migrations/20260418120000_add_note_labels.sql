-- Add a labels column to notes. Simple text[] — no separate tags table yet,
-- that's a Phase 5 upgrade. For personal use this is enough.

alter table public.notes
  add column if not exists labels text[] not null default '{}';

-- Index for contains-queries ("notes with label X")
create index if not exists notes_labels_idx on public.notes using gin(labels);

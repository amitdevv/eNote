-- Labels as first-class records. Users curate them in Settings with a chosen
-- colour; notes reference them by name via the existing notes.labels text[].
-- Orphans (a label name in notes.labels that no longer has a row here) are
-- tolerated at the UI layer — they render in the neutral "stone" palette.

create table if not exists public.labels (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  name       text not null,
  -- One of: amber, yellow, lime, green, teal, cyan, blue, indigo, purple, pink, red, stone
  color      text not null default 'stone',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists labels_user_idx on public.labels(user_id);

alter table public.labels enable row level security;

drop policy if exists "labels_select_own" on public.labels;
drop policy if exists "labels_insert_own" on public.labels;
drop policy if exists "labels_update_own" on public.labels;
drop policy if exists "labels_delete_own" on public.labels;

create policy "labels_select_own" on public.labels for select using (auth.uid() = user_id);
create policy "labels_insert_own" on public.labels for insert with check (auth.uid() = user_id);
create policy "labels_update_own" on public.labels for update using (auth.uid() = user_id);
create policy "labels_delete_own" on public.labels for delete using (auth.uid() = user_id);

drop trigger if exists labels_touch_updated_at on public.labels;
create trigger labels_touch_updated_at
  before update on public.labels
  for each row execute function public.touch_updated_at();

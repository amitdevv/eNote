-- User-curated text-highlight styles, mirroring the labels pattern.
-- The editor stores the resolved hex directly on the mark (TipTap's
-- Highlight extension with multicolor), so deleting a highlight
-- definition does not affect text already marked.

create table if not exists public.highlights (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  name       text not null,
  color      text not null default '#FEF9C3', -- hex background
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists highlights_user_idx on public.highlights(user_id);

alter table public.highlights enable row level security;

drop policy if exists "highlights_select_own" on public.highlights;
drop policy if exists "highlights_insert_own" on public.highlights;
drop policy if exists "highlights_update_own" on public.highlights;
drop policy if exists "highlights_delete_own" on public.highlights;

create policy "highlights_select_own" on public.highlights for select using (auth.uid() = user_id);
create policy "highlights_insert_own" on public.highlights for insert with check (auth.uid() = user_id);
create policy "highlights_update_own" on public.highlights for update using (auth.uid() = user_id);
create policy "highlights_delete_own" on public.highlights for delete using (auth.uid() = user_id);

drop trigger if exists highlights_touch_updated_at on public.highlights;
create trigger highlights_touch_updated_at
  before update on public.highlights
  for each row execute function public.touch_updated_at();

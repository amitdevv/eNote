-- Per-user appearance preferences (density, UI font, editor font).
-- One row per user, keyed on profiles.id so it cascades cleanly on account
-- delete. The row is created lazily on first write from the client.

create table if not exists public.user_settings (
  user_id      uuid primary key references public.profiles(id) on delete cascade,
  density      text not null default 'default'
               check (density in ('compact','default','comfortable')),
  ui_font      text not null default 'inter'
               check (ui_font in ('inter','geist','system')),
  editor_font  text not null default 'inter'
               check (editor_font in ('inter','geist','lora','mono')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.user_settings enable row level security;

drop policy if exists "user_settings_select_own" on public.user_settings;
drop policy if exists "user_settings_insert_own" on public.user_settings;
drop policy if exists "user_settings_update_own" on public.user_settings;

create policy "user_settings_select_own" on public.user_settings
  for select using (auth.uid() = user_id);
create policy "user_settings_insert_own" on public.user_settings
  for insert with check (auth.uid() = user_id);
create policy "user_settings_update_own" on public.user_settings
  for update using (auth.uid() = user_id);

drop trigger if exists user_settings_touch_updated_at on public.user_settings;
create trigger user_settings_touch_updated_at
  before update on public.user_settings
  for each row execute function public.touch_updated_at();

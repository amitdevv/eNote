-- eNote v2 — fresh schema reset
-- Date: 2026-04-18
-- Run this in Supabase Dashboard → SQL Editor → Run.
-- Safe for this project because there are no real users yet.

-- ============================================================================
-- 1. Drop legacy tables
-- ============================================================================

drop table if exists public.notes cascade;
drop table if exists public.user_profiles cascade;
drop table if exists public.folders cascade;
drop function if exists public.get_total_user_count() cascade;
drop function if exists public.get_user_profiles_count() cascade;

-- ============================================================================
-- 2. Extensions
-- ============================================================================

create extension if not exists "pgcrypto";  -- gen_random_uuid

-- ============================================================================
-- 3. profiles (1:1 with auth.users)
-- ============================================================================

create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  display_name text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.profiles is 'Public profile data, 1:1 with auth.users.';

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- 4. notes — the core domain
-- ============================================================================

create table public.notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null default 'Untitled',
  -- content is TipTap JSON doc; plain-text mirror for search
  content     jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  content_text text not null default '',
  archived    boolean not null default false,
  pinned      boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.notes is 'User notes. content is TipTap JSON; content_text is the plain-text mirror for full-text search.';

create index notes_user_id_idx       on public.notes(user_id);
create index notes_user_updated_idx  on public.notes(user_id, updated_at desc);
create index notes_user_archived_idx on public.notes(user_id, archived);
create index notes_user_pinned_idx   on public.notes(user_id, pinned) where pinned;

-- Full-text search column + GIN index
alter table public.notes add column fts tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content_text, '')), 'B')
  ) stored;

create index notes_fts_idx on public.notes using gin(fts);

-- Auto-update updated_at on every row change
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger notes_touch_updated_at
  before update on public.notes
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- 5. Row-level security
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.notes    enable row level security;

-- profiles: user can read/update only their own row. Insert is handled by trigger.
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- notes: user can do everything with their own notes, nothing with others'.
create policy "notes_select_own" on public.notes
  for select using (auth.uid() = user_id);

create policy "notes_insert_own" on public.notes
  for insert with check (auth.uid() = user_id);

create policy "notes_update_own" on public.notes
  for update using (auth.uid() = user_id);

create policy "notes_delete_own" on public.notes
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- 6. Reserved future tables (commented until needed)
-- ============================================================================

-- When we add todos:
-- create table public.tasks (
--   id             uuid primary key default gen_random_uuid(),
--   user_id        uuid not null references public.profiles(id) on delete cascade,
--   source_note_id uuid references public.notes(id) on delete set null,
--   title          text not null,
--   done           boolean not null default false,
--   due_at         timestamptz,
--   created_at     timestamptz not null default now(),
--   updated_at     timestamptz not null default now()
-- );

-- When we add calendar:
-- create table public.events (
--   id          uuid primary key default gen_random_uuid(),
--   user_id     uuid not null references public.profiles(id) on delete cascade,
--   title       text not null,
--   starts_at   timestamptz not null,
--   ends_at     timestamptz,
--   all_day     boolean not null default false,
--   created_at  timestamptz not null default now(),
--   updated_at  timestamptz not null default now()
-- );

-- When we add tagging:
-- create table public.tags (
--   id         uuid primary key default gen_random_uuid(),
--   user_id    uuid not null references public.profiles(id) on delete cascade,
--   name       text not null,
--   color      text,
--   created_at timestamptz not null default now(),
--   unique (user_id, name)
-- );
-- create table public.note_tags (
--   note_id uuid references public.notes(id) on delete cascade,
--   tag_id  uuid references public.tags(id) on delete cascade,
--   primary key (note_id, tag_id)
-- );

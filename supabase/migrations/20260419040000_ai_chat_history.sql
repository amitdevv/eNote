-- AI layer — chat history (full ChatGPT-style persistence).
--
-- Two tables:
--   ai_conversations — one row per chat thread (title + timestamps).
--   ai_turns         — one row per question/answer pair, with sources.
--
-- Both RLS-scoped. Turns cascade on conversation delete; both cascade on
-- profile delete so an account-delete wipes history cleanly.

-- ============================================================================
-- ai_conversations
-- ============================================================================

create table if not exists public.ai_conversations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  title      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_conversations_user_updated_idx
  on public.ai_conversations(user_id, updated_at desc);

alter table public.ai_conversations enable row level security;

drop policy if exists "ai_conversations_select_own"  on public.ai_conversations;
drop policy if exists "ai_conversations_insert_own"  on public.ai_conversations;
drop policy if exists "ai_conversations_update_own"  on public.ai_conversations;
drop policy if exists "ai_conversations_delete_own"  on public.ai_conversations;

create policy "ai_conversations_select_own" on public.ai_conversations
  for select using (auth.uid() = user_id);
create policy "ai_conversations_insert_own" on public.ai_conversations
  for insert with check (auth.uid() = user_id);
create policy "ai_conversations_update_own" on public.ai_conversations
  for update using (auth.uid() = user_id);
create policy "ai_conversations_delete_own" on public.ai_conversations
  for delete using (auth.uid() = user_id);

drop trigger if exists ai_conversations_touch_updated_at on public.ai_conversations;
create trigger ai_conversations_touch_updated_at
  before update on public.ai_conversations
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- ai_turns
-- ============================================================================
-- user_id is denormalized to keep RLS simple (no join needed). sources is
-- a jsonb blob of {n, id, title, preview, similarity} — the same shape the
-- chat UI already renders.

create table if not exists public.ai_turns (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  question        text not null,
  answer          text not null default '',
  sources         jsonb not null default '[]'::jsonb,
  error           text,
  created_at      timestamptz not null default now()
);

create index if not exists ai_turns_conversation_idx
  on public.ai_turns(conversation_id, created_at);

alter table public.ai_turns enable row level security;

drop policy if exists "ai_turns_select_own"  on public.ai_turns;
drop policy if exists "ai_turns_insert_own"  on public.ai_turns;
drop policy if exists "ai_turns_update_own"  on public.ai_turns;
drop policy if exists "ai_turns_delete_own"  on public.ai_turns;

create policy "ai_turns_select_own" on public.ai_turns
  for select using (auth.uid() = user_id);
create policy "ai_turns_insert_own" on public.ai_turns
  for insert with check (auth.uid() = user_id);
create policy "ai_turns_update_own" on public.ai_turns
  for update using (auth.uid() = user_id);
create policy "ai_turns_delete_own" on public.ai_turns
  for delete using (auth.uid() = user_id);

-- Touch conversation.updated_at when a new turn lands, so the history list
-- can order by "most recent activity" without a join.
create or replace function public.touch_ai_conversation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.ai_conversations
     set updated_at = now()
   where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists ai_turns_touch_conversation on public.ai_turns;
create trigger ai_turns_touch_conversation
  after insert on public.ai_turns
  for each row execute function public.touch_ai_conversation();

-- Tasks feature
-- Date: 2026-04-18

create table public.tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null check (length(title) > 0),
  done        boolean not null default false,
  done_at     timestamptz,
  due_at      timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.tasks is 'User todos. done_at flips with done for ordering completed items by recency.';

create index tasks_user_idx         on public.tasks(user_id);
create index tasks_user_done_idx    on public.tasks(user_id, done);
create index tasks_user_created_idx on public.tasks(user_id, created_at desc);

-- Auto-update updated_at (reuses touch_updated_at from the reset migration)
create trigger tasks_touch_updated_at
  before update on public.tasks
  for each row execute function public.touch_updated_at();

-- Keep done_at in sync with done transitions
create or replace function public.tasks_sync_done_at()
returns trigger
language plpgsql
as $$
begin
  if new.done is distinct from old.done then
    new.done_at = case when new.done then now() else null end;
  end if;
  return new;
end;
$$;

create trigger tasks_sync_done_at
  before update on public.tasks
  for each row execute function public.tasks_sync_done_at();

-- RLS
alter table public.tasks enable row level security;

create policy "tasks_select_own" on public.tasks
  for select using (auth.uid() = user_id);

create policy "tasks_insert_own" on public.tasks
  for insert with check (auth.uid() = user_id);

create policy "tasks_update_own" on public.tasks
  for update using (auth.uid() = user_id);

create policy "tasks_delete_own" on public.tasks
  for delete using (auth.uid() = user_id);

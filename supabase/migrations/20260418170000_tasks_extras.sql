-- Tasks: description + priority
-- Date: 2026-04-18
-- Priority follows Todoist's 1-4 scale (1 = highest, 4 = none).

alter table public.tasks
  add column description text not null default '',
  add column priority    int  not null default 4 check (priority between 1 and 4);

create index tasks_user_due_idx on public.tasks(user_id, due_at);

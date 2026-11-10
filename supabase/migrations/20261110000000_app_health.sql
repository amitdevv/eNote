-- A dedicated public sentinel for read-only availability checks.
-- Contains no user data. The scheduled job cannot insert, change, or delete it.
begin;

create table public.app_health (
  id smallint primary key check (id = 1),
  status text not null check (status = 'ok')
);

comment on table public.app_health is
  'Single non-sensitive sentinel row for external database health checks.';

alter table public.app_health enable row level security;
revoke all on table public.app_health from public, anon, authenticated;
grant select on table public.app_health to anon, authenticated;

create policy app_health_read on public.app_health
  for select to anon, authenticated
  using (id = 1);

insert into public.app_health (id, status) values (1, 'ok');

commit;

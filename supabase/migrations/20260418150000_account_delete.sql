-- Self-service account deletion
-- Date: 2026-04-18
-- Adds an RPC the logged-in user can call to permanently delete their auth row.
-- ON DELETE CASCADE on public.profiles and public.notes does the rest.

create or replace function public.delete_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_user() from public;
grant execute on function public.delete_user() to authenticated;

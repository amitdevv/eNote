-- AI layer — per-user, per-day usage counters.
--
-- Google's Gemini API doesn't expose a "quota remaining" endpoint, so we
-- track our own consumption. One row per (user, UTC day, action). RLS lets
-- a user read their own rows; Edge Functions bump via an atomic RPC so we
-- don't race on `count + 1`.

create table if not exists public.ai_usage (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  day         date not null default (now() at time zone 'utc')::date,
  action      text not null check (action in ('embed','ask')),
  count       int  not null default 0,
  updated_at  timestamptz not null default now(),
  primary key (user_id, day, action)
);

alter table public.ai_usage enable row level security;

drop policy if exists "ai_usage_select_own" on public.ai_usage;
create policy "ai_usage_select_own" on public.ai_usage
  for select using (auth.uid() = user_id);
-- no insert/update/delete policies: writes happen only via the
-- SECURITY DEFINER RPC below, which the service role invokes from Edge Functions.

create or replace function public.bump_ai_usage(action_kind text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if action_kind not in ('embed','ask') then
    raise exception 'invalid action_kind: %', action_kind;
  end if;
  insert into public.ai_usage (user_id, day, action, count)
  values (auth.uid(), (now() at time zone 'utc')::date, action_kind, 1)
  on conflict (user_id, day, action)
  do update set count = ai_usage.count + 1, updated_at = now();
end;
$$;

comment on function public.bump_ai_usage is
  'Atomic increment of the caller (auth.uid()) daily usage counter for the given action kind.';

-- Allow both authenticated users (calling as themselves via the RPC) and
-- the service role to invoke. service_role bypasses RLS but still
-- resolves auth.uid() from the JWT context when called from an Edge
-- Function that forwards the user JWT.
grant execute on function public.bump_ai_usage(text) to authenticated, service_role;

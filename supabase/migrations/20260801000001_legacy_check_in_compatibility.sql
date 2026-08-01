-- Temporary compatibility for frontend builds deployed before the privacy
-- hardening migration. This restores only the old five-argument check-in RPC.
-- Precise coordinates remain in the owner/admin-only verification table.

begin;

create or replace function public.create_mountain_check_in(
  p_mountain_id text,
  p_trail_id text,
  p_note text,
  p_lat numeric,
  p_lng numeric
)
returns public.check_ins
language sql
security definer
set search_path = public
as $$
  select public.create_mountain_check_in(
    p_mountain_id,
    p_trail_id,
    p_note,
    p_lat,
    p_lng,
    null::numeric
  );
$$;

revoke all on function public.create_mountain_check_in(text, text, text, numeric, numeric) from public, anon;
grant execute on function public.create_mountain_check_in(text, text, text, numeric, numeric) to authenticated;

commit;

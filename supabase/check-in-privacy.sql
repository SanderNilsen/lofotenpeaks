-- Apply once to existing Supabase projects after deploying the profile update.
-- Safe to rerun. Row-level security still controls which check-in rows are
-- visible; these grants also prevent public selection of sensitive columns.

begin;

revoke select on table public.check_ins from anon, authenticated;

grant select (
  id,
  user_id,
  mountain_id,
  trail_id,
  checked_in_at,
  check_in_day,
  points,
  note,
  status,
  created_at
) on table public.check_ins to anon, authenticated;

commit;

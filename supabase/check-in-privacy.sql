-- Legacy emergency patch only. Do not use this as the current privacy migration.
-- It restricts column grants but does not move precise coordinates out of the
-- public check_ins table. Apply every file in supabase/migrations instead.
-- Retained only to document the earlier production hardening step.

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

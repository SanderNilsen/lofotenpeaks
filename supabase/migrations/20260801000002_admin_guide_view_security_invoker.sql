-- Ensure the admin guide view evaluates permissions and RLS as the querying user.
begin;

alter view public.admin_mountain_guides
set (security_invoker = true, security_barrier = true);

commit;

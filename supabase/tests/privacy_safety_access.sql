-- Read-only assertions for the privacy/safety migration.
-- Run after 20260801000000_privacy_safety_moderation.sql.

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'check_ins'
      and column_name in ('location', 'distance_to_summit_meters', 'photo_path')
  ) then
    raise exception 'Precise verification fields still exist on public.check_ins';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'check_in_verifications'
      and column_name = 'location_accuracy_meters'
  ) then
    raise exception 'Private check-in verification storage is incomplete';
  end if;

  if not coalesce((
    select c.relrowsecurity
    from pg_class as c
    join pg_namespace as n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'check_in_verifications'
  ), false) then
    raise exception 'RLS is not enabled on public.check_in_verifications';
  end if;

  if has_table_privilege('anon', 'public.check_in_verifications', 'select') then
    raise exception 'Anonymous role can select private check-in verification records';
  end if;

  if not has_table_privilege('authenticated', 'public.check_in_verifications', 'select') then
    raise exception 'Authenticated role lacks owner-scoped verification access';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'check_in_verifications'
      and qual like '%auth.uid()%user_id%'
      and qual like '%is_admin%'
  ) then
    raise exception 'Check-in verification RLS does not cover owner and admin access';
  end if;

  if not has_column_privilege('anon', 'public.check_ins', 'id', 'select') then
    raise exception 'Anonymous role cannot read intended public check-in summary fields';
  end if;

  if has_column_privilege('anon', 'public.trails', 'gpx_storage_path', 'select')
    or has_column_privilege('authenticated', 'public.trails', 'gpx_storage_path', 'select')
    or has_column_privilege('authenticated', 'public.trails', 'reviewed_by', 'select') then
    raise exception 'Internal trail storage or review fields are selectable directly';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'mountain_guides'
      and column_name in ('gpx_storage_path', 'reviewed_by', 'next_review_due')
  ) then
    raise exception 'Public mountain guide view exposes internal trail fields';
  end if;

  if has_table_privilege('anon', 'public.comments', 'insert')
    or has_table_privilege('authenticated', 'public.comments', 'insert') then
    raise exception 'Comments can bypass the validated server RPC';
  end if;

  if has_table_privilege('anon', 'public.user_hikes', 'insert')
    or has_table_privilege('authenticated', 'public.user_hikes', 'insert') then
    raise exception 'Hike recommendations can bypass the validated server RPC';
  end if;

  if has_table_privilege('anon', 'public.legal_acceptances', 'select')
    or has_table_privilege('authenticated', 'public.legal_acceptances', 'insert')
    or has_table_privilege('authenticated', 'public.legal_acceptances', 'update')
    or has_table_privilege('authenticated', 'public.legal_acceptances', 'delete') then
    raise exception 'Legal acceptance history grants are too broad';
  end if;

  if has_table_privilege('anon', 'public.content_reports', 'select')
    or has_table_privilege('authenticated', 'public.content_reports', 'insert')
    or has_table_privilege('authenticated', 'public.route_corrections', 'insert')
    or has_table_privilege('authenticated', 'public.moderation_actions', 'insert')
    or has_table_privilege('authenticated', 'public.moderation_actions', 'update') then
    raise exception 'Reporting or moderation tables can bypass protected RPCs';
  end if;

  if has_function_privilege(
    'anon',
    'public.create_mountain_check_in(text,text,text,numeric,numeric,numeric)',
    'execute'
  ) then
    raise exception 'Anonymous role can execute the summit check-in RPC';
  end if;

  if not has_function_privilege(
    'authenticated',
    'public.create_mountain_check_in(text,text,text,numeric,numeric,numeric)',
    'execute'
  ) then
    raise exception 'Authenticated role cannot execute the summit check-in RPC';
  end if;

  if has_function_privilege('anon', 'public.delete_my_account(text)', 'execute') then
    raise exception 'Anonymous role can execute account deletion';
  end if;

  if not has_function_privilege('authenticated', 'public.delete_my_account(text)', 'execute') then
    raise exception 'Authenticated role cannot execute account deletion';
  end if;

  if has_function_privilege('authenticated', 'public.has_current_terms_acceptance(uuid)', 'execute') then
    raise exception 'Internal Terms helper is directly executable by users';
  end if;

  if has_function_privilege('anon', 'public.accept_current_legal_documents(text,text,text)', 'execute')
    or not has_function_privilege(
      'authenticated',
      'public.accept_current_legal_documents(text,text,text)',
      'execute'
    ) then
    raise exception 'Terms acceptance RPC privileges are incorrect';
  end if;

  if has_function_privilege('anon', 'public.submit_content_report(text,uuid,text,text)', 'execute')
    or not has_function_privilege(
      'authenticated',
      'public.submit_content_report(text,uuid,text,text)',
      'execute'
    ) then
    raise exception 'Comment reporting RPC privileges are incorrect';
  end if;

  if has_function_privilege(
    'anon',
    'public.submit_route_correction(text,text,text,text,text,date)',
    'execute'
  ) or not has_function_privilege(
    'authenticated',
    'public.submit_route_correction(text,text,text,text,text,date)',
    'execute'
  ) then
    raise exception 'Route correction RPC privileges are incorrect';
  end if;

  if has_function_privilege(
    'anon',
    'public.admin_moderate_comment(uuid,text,uuid,text,text)',
    'execute'
  ) then
    raise exception 'Anonymous role can execute an admin moderation RPC';
  end if;

  if not exists (
    select 1
    from public.legal_document_versions
    where document_type = 'terms'
      and current_version = '2026-08-01'
      and requires_acceptance = true
  ) then
    raise exception 'Current Terms version is not configured for acceptance';
  end if;

  if not exists (
    select 1 from pg_views
    where schemaname = 'public' and viewname = 'admin_comment_report_queue'
  ) or not exists (
    select 1 from pg_views
    where schemaname = 'public' and viewname = 'admin_route_correction_queue'
  ) then
    raise exception 'Admin moderation queues are missing';
  end if;

  if position('get_admin_mountain_guides' in pg_get_viewdef('public.admin_mountain_guides'::regclass, true)) = 0 then
    raise exception 'Admin guide view is not using the restricted guide reader';
  end if;

  if not exists (
    select 1
    from pg_class as c
    join pg_namespace as n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'admin_mountain_guides'
      and coalesce(c.reloptions, array[]::text[]) @> array['security_invoker=true']
  ) then
    raise exception 'Admin guide view must use security_invoker';
  end if;

  if position(
    'is_admin' in pg_get_functiondef('public.get_admin_mountain_guides()'::regprocedure)
  ) = 0 then
    raise exception 'Admin guide reader is missing its server-side admin check';
  end if;

  if has_function_privilege(
    'anon',
    'public.get_admin_mountain_guides()',
    'execute'
  ) or not has_function_privilege(
    'authenticated',
    'public.get_admin_mountain_guides()',
    'execute'
  ) then
    raise exception 'Admin guide reader privileges are incorrect';
  end if;
end;
$$;

select 'privacy_safety_access assertions passed' as result;

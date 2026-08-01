-- Transactional behaviour tests for privacy, ownership, moderation, and deletion.
-- All temporary users and records are rolled back at the end of the script.

begin;

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
select
  '00000000-0000-0000-0000-000000000000'::uuid,
  test_user.id,
  'authenticated',
  'authenticated',
  test_user.email,
  '',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object(
    'display_name', test_user.display_name,
    'terms_accepted', true,
    'terms_version', '2026-08-01',
    'privacy_acknowledged', true,
    'privacy_version', '2026-08-01'
  ),
  now(),
  now(),
  '',
  '',
  '',
  ''
from (
  values
    ('00000000-0000-4000-8000-000000000101'::uuid, 'privacy-owner@audit.invalid', 'Audit Owner'),
    ('00000000-0000-4000-8000-000000000102'::uuid, 'privacy-other@audit.invalid', 'Audit Other'),
    ('00000000-0000-4000-8000-000000000103'::uuid, 'privacy-admin@audit.invalid', 'Audit Admin'),
    ('00000000-0000-4000-8000-000000000104'::uuid, 'privacy-delete@audit.invalid', 'Audit Delete')
) as test_user(id, email, display_name);

insert into public.admin_users (user_id)
values ('00000000-0000-4000-8000-000000000103'::uuid);

do $$
begin
  if (
    select count(*)
    from public.legal_acceptances
    where user_id in (
      '00000000-0000-4000-8000-000000000101'::uuid,
      '00000000-0000-4000-8000-000000000102'::uuid,
      '00000000-0000-4000-8000-000000000103'::uuid,
      '00000000-0000-4000-8000-000000000104'::uuid
    )
  ) <> 8 then
    raise exception 'Registration did not record both legal document records for each test user';
  end if;
end;
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000101', true);
select set_config(
  'request.jwt.claims',
  jsonb_build_object(
    'sub', '00000000-0000-4000-8000-000000000101',
    'role', 'authenticated',
    'iat', floor(extract(epoch from now()))::bigint
  )::text,
  true
);

do $$
declare
  selected_mountain_id text;
  selected_trail_id text;
  summit_lat numeric;
  summit_lng numeric;
  rate_limit_blocked boolean := false;
begin
  select
    m.id,
    t.id,
    extensions.st_y(m.summit::extensions.geometry),
    extensions.st_x(m.summit::extensions.geometry)
  into selected_mountain_id, selected_trail_id, summit_lat, summit_lng
  from public.mountains as m
  join public.trails as t on t.mountain_id = m.id and t.published = true
  where m.published = true and m.summit is not null
  order by m.id, t.id
  limit 1;

  if selected_mountain_id is null then
    raise exception 'A published mountain and trail are required for behaviour tests';
  end if;

  perform public.accept_current_legal_documents('2026-08-01', '2026-08-01', 'database-test');

  if (
    select count(*) from public.legal_acceptances
    where user_id = auth.uid()
  ) <> 2 then
    raise exception 'Repeated legal acceptance created duplicate history rows';
  end if;

  perform public.create_mountain_check_in(
    selected_mountain_id,
    selected_trail_id,
    'Owner behaviour test',
    summit_lat,
    summit_lng,
    5
  );

  perform public.create_trail_comment(selected_mountain_id, selected_trail_id, 'Owner audit comment one');
  perform public.create_trail_comment(selected_mountain_id, selected_trail_id, 'Owner audit comment two');
  perform public.create_trail_comment(selected_mountain_id, selected_trail_id, 'Owner audit comment three');

  begin
    perform public.create_trail_comment(selected_mountain_id, selected_trail_id, 'Owner audit comment four');
  exception when sqlstate 'P0001' then
    rate_limit_blocked := true;
  end;

  if not rate_limit_blocked then
    raise exception 'Comment rate limiting did not block the fourth comment in ten minutes';
  end if;

  perform public.create_hike_recommendation(
    'Owner audit recommendation',
    'A temporary recommendation created by the rollback-only database test.',
    'moderate'::public.difficulty_level
  );
end;
$$;

reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000102', true);
select set_config(
  'request.jwt.claims',
  jsonb_build_object(
    'sub', '00000000-0000-4000-8000-000000000102',
    'role', 'authenticated',
    'iat', floor(extract(epoch from now()))::bigint
  )::text,
  true
);

do $$
declare
  selected_mountain_id text;
  selected_trail_id text;
  summit_lat numeric;
  summit_lng numeric;
begin
  select
    m.id,
    t.id,
    extensions.st_y(m.summit::extensions.geometry),
    extensions.st_x(m.summit::extensions.geometry)
  into selected_mountain_id, selected_trail_id, summit_lat, summit_lng
  from public.mountains as m
  join public.trails as t on t.mountain_id = m.id and t.published = true
  where m.published = true and m.summit is not null
  order by m.id, t.id
  limit 1;

  perform public.create_mountain_check_in(
    selected_mountain_id,
    selected_trail_id,
    'Other behaviour test',
    summit_lat,
    summit_lng,
    8
  );
  perform public.create_trail_comment(selected_mountain_id, selected_trail_id, 'Other public audit comment');
end;
$$;

reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000101', true);
select set_config(
  'request.jwt.claims',
  jsonb_build_object(
    'sub', '00000000-0000-4000-8000-000000000101',
    'role', 'authenticated',
    'iat', floor(extract(epoch from now()))::bigint
  )::text,
  true
);

do $$
declare
  other_comment_id uuid;
  selected_trail_id text;
  duplicate_report_blocked boolean := false;
  moderation_blocked boolean := false;
  admin_guide_blocked boolean := false;
begin
  begin
    perform 1 from public.admin_mountain_guides limit 1;
  exception when insufficient_privilege then
    admin_guide_blocked := true;
  end;

  if not admin_guide_blocked then
    raise exception 'A non-admin can execute the administrator guide reader';
  end if;

  if (select count(*) from public.check_in_verifications) <> 1 then
    raise exception 'An authenticated user can read verification evidence other than their own';
  end if;

  select c.id into other_comment_id
  from public.comments as c
  where c.user_id = '00000000-0000-4000-8000-000000000102'::uuid
  limit 1;

  select c.trail_id into selected_trail_id
  from public.comments as c
  where c.id = other_comment_id;

  perform public.submit_content_report(
    'comment',
    other_comment_id,
    'dangerous',
    'Owner report created by the rollback-only database test.'
  );

  begin
    perform public.submit_content_report('comment', other_comment_id, 'dangerous', null);
  exception when unique_violation then
    duplicate_report_blocked := true;
  end;

  if not duplicate_report_blocked then
    raise exception 'Duplicate active reports were not blocked';
  end if;

  perform public.submit_route_correction(
    selected_trail_id,
    'safety',
    'Upper route',
    'Rollback-only route correction with enough detail for validation.',
    'https://example.com/audit-source',
    current_date
  );

  begin
    perform public.admin_moderate_comment(
      other_comment_id,
      'hide',
      (select r.id from public.content_reports as r where r.target_id = other_comment_id limit 1),
      null,
      'A non-admin must not be able to save this note.'
    );
  exception when insufficient_privilege then
    moderation_blocked := true;
  end;

  if not moderation_blocked then
    raise exception 'A non-admin could execute comment moderation';
  end if;
end;
$$;

reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000103', true);
select set_config(
  'request.jwt.claims',
  jsonb_build_object(
    'sub', '00000000-0000-4000-8000-000000000103',
    'role', 'authenticated',
    'iat', floor(extract(epoch from now()))::bigint
  )::text,
  true
);

do $$
declare
  report_record record;
  correction_id uuid;
  recommendation_id uuid;
begin
  if not exists (select 1 from public.admin_mountain_guides) then
    raise exception 'Administrator cannot read the administrator guide view';
  end if;

  if (
    select count(*)
    from public.check_in_verifications
    where user_id in (
      '00000000-0000-4000-8000-000000000101'::uuid,
      '00000000-0000-4000-8000-000000000102'::uuid
    )
  ) <> 2 then
    raise exception 'Administrator cannot read all check-in verification records';
  end if;

  select * into report_record
  from public.content_reports
  where reporter_user_id = '00000000-0000-4000-8000-000000000101'::uuid
  limit 1;

  perform public.admin_moderate_comment(
    report_record.target_id,
    'hide',
    report_record.id,
    null,
    'Hidden by the rollback-only moderation test.'
  );

  select id into correction_id
  from public.route_corrections
  where submitter_user_id = '00000000-0000-4000-8000-000000000101'::uuid
  limit 1;

  perform public.admin_review_route_correction(
    correction_id,
    'accepted',
    'Accepted by the rollback-only route-correction test.'
  );

  select id into recommendation_id
  from public.user_hikes
  where user_id = '00000000-0000-4000-8000-000000000101'::uuid
  limit 1;

  perform public.admin_moderate_hike_recommendation(
    recommendation_id,
    'approve',
    'Approved by the rollback-only recommendation test.'
  );

  if not exists (
    select 1 from public.moderation_actions
    where actor_user_id = auth.uid()
      and content_type in ('comment', 'route_correction', 'hike_recommendation')
  ) then
    raise exception 'Administrator decisions were not written to the moderation audit log';
  end if;
end;
$$;

reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000101', true);
select set_config(
  'request.jwt.claims',
  jsonb_build_object(
    'sub', '00000000-0000-4000-8000-000000000101',
    'role', 'authenticated',
    'iat', floor(extract(epoch from now()))::bigint
  )::text,
  true
);

do $$
declare
  owner_check_in_id uuid;
  owner_comment_id uuid;
  owner_hike_id uuid;
begin
  select id into owner_check_in_id
  from public.check_ins
  where user_id = auth.uid()
  limit 1;

  select id into owner_comment_id
  from public.comments
  where user_id = auth.uid() and deleted_at is null
  order by created_at
  limit 1;

  select id into owner_hike_id
  from public.user_hikes
  where user_id = auth.uid()
  limit 1;

  perform public.delete_own_check_in(owner_check_in_id);
  perform public.delete_own_comment(owner_comment_id);
  perform public.withdraw_hike_recommendation(owner_hike_id);

  if exists (select 1 from public.check_ins where id = owner_check_in_id) then
    raise exception 'Owner check-in deletion did not remove the public activity record';
  end if;

  if exists (select 1 from public.check_in_verifications where check_in_id = owner_check_in_id) then
    raise exception 'Owner check-in deletion left orphaned private location evidence';
  end if;

  if coalesce((select points from public.leaderboard where user_id = auth.uid()), -1) <> 0 then
    raise exception 'Leaderboard points did not recalculate after check-in deletion';
  end if;

  if not exists (
    select 1 from public.comments
    where id = owner_comment_id
      and visibility_status = 'removed'
      and deleted_by_author = true
      and deleted_at is not null
  ) then
    raise exception 'Owner comment deletion did not apply the deletion marker';
  end if;

  if exists (select 1 from public.user_hikes where id = owner_hike_id and removed_at is null) then
    raise exception 'Published hike recommendation was not removed by its author';
  end if;
end;
$$;

reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000104', true);
select set_config(
  'request.jwt.claims',
  jsonb_build_object(
    'sub', '00000000-0000-4000-8000-000000000104',
    'role', 'authenticated',
    'iat', floor(extract(epoch from now()))::bigint
  )::text,
  true
);

do $$
declare
  selected_mountain_id text;
  selected_trail_id text;
  summit_lat numeric;
  summit_lng numeric;
  target_comment_id uuid;
begin
  select
    m.id,
    t.id,
    extensions.st_y(m.summit::extensions.geometry),
    extensions.st_x(m.summit::extensions.geometry)
  into selected_mountain_id, selected_trail_id, summit_lat, summit_lng
  from public.mountains as m
  join public.trails as t on t.mountain_id = m.id and t.published = true
  where m.published = true and m.summit is not null
  order by m.id, t.id
  limit 1;

  perform public.create_mountain_check_in(
    selected_mountain_id,
    selected_trail_id,
    'Account deletion behaviour test',
    summit_lat,
    summit_lng,
    5
  );
  perform public.create_trail_comment(
    selected_mountain_id,
    selected_trail_id,
    'Comment whose author will be deleted by the audit test'
  );
  perform public.create_hike_recommendation(
    'Deleted account recommendation',
    'This recommendation exists only inside a rolled-back database test.',
    'moderate'::public.difficulty_level
  );
  perform public.submit_route_correction(
    selected_trail_id,
    'route_description',
    null,
    'Account deletion correction retained without the submitting user reference.',
    null,
    current_date
  );

  select c.id into target_comment_id
  from public.comments as c
  where c.user_id = '00000000-0000-4000-8000-000000000101'::uuid
    and c.visibility_status = 'published'
  limit 1;

  perform public.submit_content_report(
    'comment',
    target_comment_id,
    'privacy',
    'Report retained without the deleted reporter reference.'
  );
end;
$$;

reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000101', true);
select set_config(
  'request.jwt.claims',
  jsonb_build_object(
    'sub', '00000000-0000-4000-8000-000000000101',
    'role', 'authenticated',
    'iat', floor(extract(epoch from now()))::bigint
  )::text,
  true
);

do $$
declare
  deleted_author_comment_id uuid;
begin
  select c.id into deleted_author_comment_id
  from public.comments as c
  where c.user_id = '00000000-0000-4000-8000-000000000104'::uuid
  limit 1;

  perform public.submit_content_report(
    'comment',
    deleted_author_comment_id,
    'other',
    'Audit deleted author snapshot'
  );
end;
$$;

reset role;

insert into public.moderation_actions (
  actor_user_id,
  content_type,
  target_id,
  action,
  internal_note
) values (
  '00000000-0000-4000-8000-000000000104'::uuid,
  'account_test',
  'account-delete-test',
  'test',
  'Rollback-only audit record'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000104', true);
select set_config(
  'request.jwt.claims',
  jsonb_build_object(
    'sub', '00000000-0000-4000-8000-000000000104',
    'role', 'authenticated',
    'iat', floor(extract(epoch from now()))::bigint
  )::text,
  true
);
select public.delete_my_account('DELETE');
reset role;

do $$
begin
  if exists (
    select 1 from auth.users
    where id = '00000000-0000-4000-8000-000000000104'::uuid
  ) then
    raise exception 'Account deletion did not remove the Auth identity';
  end if;

  if exists (
    select 1 from public.profiles
    where id = '00000000-0000-4000-8000-000000000104'::uuid
  ) or exists (
    select 1 from public.check_ins
    where user_id = '00000000-0000-4000-8000-000000000104'::uuid
  ) or exists (
    select 1 from public.check_in_verifications
    where user_id = '00000000-0000-4000-8000-000000000104'::uuid
  ) or exists (
    select 1 from public.comments
    where user_id = '00000000-0000-4000-8000-000000000104'::uuid
  ) or exists (
    select 1 from public.user_hikes
    where user_id = '00000000-0000-4000-8000-000000000104'::uuid
  ) or exists (
    select 1 from public.legal_acceptances
    where user_id = '00000000-0000-4000-8000-000000000104'::uuid
  ) then
    raise exception 'Account deletion left active account or contribution records';
  end if;

  if exists (
    select 1 from public.route_corrections
    where submitter_user_id = '00000000-0000-4000-8000-000000000104'::uuid
  ) or exists (
    select 1 from public.content_reports
    where reporter_user_id = '00000000-0000-4000-8000-000000000104'::uuid
  ) or exists (
    select 1 from public.moderation_actions
    where actor_user_id = '00000000-0000-4000-8000-000000000104'::uuid
  ) then
    raise exception 'Retained review records still identify the deleted account through a foreign key';
  end if;

  if not exists (
    select 1 from public.route_corrections
    where details = 'Account deletion correction retained without the submitting user reference.'
      and submitter_user_id is null
  ) or not exists (
    select 1 from public.content_reports
    where details = 'Report retained without the deleted reporter reference.'
      and reporter_user_id is null
  ) or not exists (
    select 1 from public.moderation_actions
    where target_id = 'account-delete-test'
      and actor_user_id is null
  ) then
    raise exception 'Limited review records were not retained in detached form';
  end if;
end;
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000103', true);
select set_config(
  'request.jwt.claims',
  jsonb_build_object(
    'sub', '00000000-0000-4000-8000-000000000103',
    'role', 'authenticated',
    'iat', floor(extract(epoch from now()))::bigint
  )::text,
  true
);

do $$
begin
  if not exists (
    select 1 from public.admin_comment_report_queue
    where details = 'Audit deleted author snapshot'
      and author_name = 'Deleted user'
  ) then
    raise exception 'Deleted comment author is not anonymised in the moderation queue';
  end if;
end;
$$;

reset role;

rollback;

select 'privacy_safety_behaviour assertions passed' as result;

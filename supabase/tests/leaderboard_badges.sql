-- Transactional tests for server-authoritative rankings and achievements.
-- Run after 20260802000000_leaderboard_badges.sql. All records are rolled back.

begin;

do $$
begin
  if has_function_privilege('anon', 'public.get_my_badges()', 'execute')
    or has_function_privilege('anon', 'public.get_my_leaderboard_position(text,text)', 'execute') then
    raise exception 'Anonymous users can execute owner-only community RPCs';
  end if;

  if has_function_privilege('authenticated', 'public.badge_progress_for_user(uuid)', 'execute')
    or has_function_privilege(
      'authenticated',
      'public.leaderboard_position_at(uuid,text,text,timestamptz)',
      'execute'
    ) then
    raise exception 'Authenticated users can execute internal aggregate helpers';
  end if;

  if not has_function_privilege(
    'authenticated',
    'public.get_my_badges()',
    'execute'
  ) or not has_function_privilege(
    'anon',
    'public.get_leaderboard(text,text,integer,integer,text)',
    'execute'
  ) then
    raise exception 'Public or owner leaderboard/badge RPC grants are incomplete';
  end if;
end;
$$;

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
  '2026-01-01 00:00:00+00'::timestamptz,
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object(
    'display_name', test_user.display_name,
    'terms_accepted', true,
    'terms_version', (
      select current_version
      from public.legal_document_versions
      where document_type = 'terms'
    ),
    'privacy_acknowledged', true,
    'privacy_version', (
      select current_version
      from public.legal_document_versions
      where document_type = 'privacy'
    )
  ),
  '2026-01-01 00:00:00+00'::timestamptz,
  '2026-01-01 00:00:00+00'::timestamptz,
  '',
  '',
  '',
  ''
from (
  values
    ('00000000-0000-4000-8000-000000000211'::uuid, 'leader-one@test.invalid', 'Leader One'),
    ('00000000-0000-4000-8000-000000000212'::uuid, 'leader-two@test.invalid', 'Leader Two'),
    ('00000000-0000-4000-8000-000000000213'::uuid, 'leader-three@test.invalid', 'Leader Three'),
    ('00000000-0000-4000-8000-000000000214'::uuid, 'tie-first@test.invalid', 'Tie First'),
    ('00000000-0000-4000-8000-000000000215'::uuid, 'tie-second@test.invalid', 'Tie Second'),
    ('00000000-0000-4000-8000-000000000216'::uuid, 'outside@test.invalid', 'Outside Hiker'),
    ('00000000-0000-4000-8000-000000000217'::uuid, 'boundary@test.invalid', 'Boundary Hiker'),
    ('00000000-0000-4000-8000-000000000218'::uuid, 'rejected@test.invalid', 'Rejected Activity')
) as test_user(id, email, display_name);

insert into public.mountains (
  id,
  slug,
  name,
  region,
  height_meters,
  difficulty,
  check_in_points,
  published
)
select
  'leaderboard-test-mountain-' || value,
  'leaderboard-test-mountain-' || value,
  'Leaderboard Test Mountain ' || value,
  'Lofoten',
  400 + value,
  'hard'::public.difficulty_level,
  20,
  true
from generate_series(1, 5) as value;

insert into public.trails (id, mountain_id, slug, name, difficulty, published)
select
  'leaderboard-test-trail-' || value,
  'leaderboard-test-mountain-' || value,
  'leaderboard-test-trail-' || value,
  'Leaderboard Test Trail ' || value,
  'hard'::public.difficulty_level,
  true
from generate_series(1, 5) as value;

-- Five unique summits and 100 approved points.
insert into public.check_ins (user_id, mountain_id, trail_id, checked_in_at, check_in_day, points, status)
select
  '00000000-0000-4000-8000-000000000211'::uuid,
  'leaderboard-test-mountain-' || value,
  'leaderboard-test-trail-' || value,
  ('2026-06-' || lpad(value::text, 2, '0') || ' 10:00:00+00')::timestamptz,
  ('2026-06-' || lpad(value::text, 2, '0'))::date,
  20,
  'approved'::public.moderation_status
from generate_series(1, 5) as value;

-- Four unique summits and 80 approved points.
insert into public.check_ins (user_id, mountain_id, trail_id, checked_in_at, check_in_day, points, status)
select
  '00000000-0000-4000-8000-000000000212'::uuid,
  'leaderboard-test-mountain-' || value,
  'leaderboard-test-trail-' || value,
  ('2026-06-' || lpad((10 + value)::text, 2, '0') || ' 10:00:00+00')::timestamptz,
  ('2026-06-' || lpad((10 + value)::text, 2, '0'))::date,
  20,
  'approved'::public.moderation_status
from generate_series(1, 4) as value;

-- Three unique summits and 60 approved points.
insert into public.check_ins (user_id, mountain_id, trail_id, checked_in_at, check_in_day, points, status)
select
  '00000000-0000-4000-8000-000000000213'::uuid,
  'leaderboard-test-mountain-' || value,
  'leaderboard-test-trail-' || value,
  ('2026-06-' || lpad((20 + value)::text, 2, '0') || ' 10:00:00+00')::timestamptz,
  ('2026-06-' || lpad((20 + value)::text, 2, '0'))::date,
  20,
  'approved'::public.moderation_status
from generate_series(1, 3) as value;

-- Equal primary score, unique summits, check-ins, and reached timestamp.
-- Stable user ID ordering must put ...214 before ...215.
insert into public.check_ins (user_id, mountain_id, trail_id, checked_in_at, check_in_day, points, status)
values
  ('00000000-0000-4000-8000-000000000214', 'leaderboard-test-mountain-1', 'leaderboard-test-trail-1', '2026-06-01 09:00:00+00', '2026-06-01', 10, 'approved'),
  ('00000000-0000-4000-8000-000000000214', 'leaderboard-test-mountain-1', 'leaderboard-test-trail-1', '2026-06-02 09:00:00+00', '2026-06-02', 10, 'approved'),
  ('00000000-0000-4000-8000-000000000214', 'leaderboard-test-mountain-2', 'leaderboard-test-trail-2', '2026-06-03 09:00:00+00', '2026-06-03', 10, 'approved'),
  ('00000000-0000-4000-8000-000000000215', 'leaderboard-test-mountain-1', 'leaderboard-test-trail-1', '2026-06-01 09:00:00+00', '2026-06-01', 10, 'approved'),
  ('00000000-0000-4000-8000-000000000215', 'leaderboard-test-mountain-1', 'leaderboard-test-trail-1', '2026-06-02 09:00:00+00', '2026-06-02', 10, 'approved'),
  ('00000000-0000-4000-8000-000000000215', 'leaderboard-test-mountain-2', 'leaderboard-test-trail-2', '2026-06-03 09:00:00+00', '2026-06-03', 10, 'approved'),
  ('00000000-0000-4000-8000-000000000216', 'leaderboard-test-mountain-1', 'leaderboard-test-trail-1', '2026-06-01 08:00:00+00', '2026-06-01', 5, 'approved'),
  ('00000000-0000-4000-8000-000000000216', 'leaderboard-test-mountain-2', 'leaderboard-test-trail-2', '2026-06-02 08:00:00+00', '2026-06-02', 999, 'rejected');

-- Europe/Oslo boundaries: week starts 2026-07-26 22:00 UTC and month starts
-- 2026-07-31 22:00 UTC for the fixed reference below.
insert into public.check_ins (user_id, mountain_id, trail_id, checked_in_at, check_in_day, points, status)
values
  ('00000000-0000-4000-8000-000000000217', 'leaderboard-test-mountain-1', 'leaderboard-test-trail-1', '2026-07-26 21:59:59+00', '2026-07-26', 7, 'approved'),
  ('00000000-0000-4000-8000-000000000217', 'leaderboard-test-mountain-2', 'leaderboard-test-trail-2', '2026-07-26 22:00:00+00', '2026-07-27', 7, 'approved'),
  ('00000000-0000-4000-8000-000000000217', 'leaderboard-test-mountain-3', 'leaderboard-test-trail-3', '2026-07-31 21:59:59+00', '2026-07-31', 7, 'approved'),
  ('00000000-0000-4000-8000-000000000217', 'leaderboard-test-mountain-4', 'leaderboard-test-trail-4', '2026-07-31 22:00:00+00', '2026-08-01', 7, 'approved'),
  ('00000000-0000-4000-8000-000000000218', 'leaderboard-test-mountain-1', 'leaderboard-test-trail-1', '2026-06-01 07:00:00+00', '2026-06-01', 500, 'rejected');

insert into public.comments (user_id, mountain_id, body, status, visibility_status, created_at)
select
  '00000000-0000-4000-8000-000000000213'::uuid,
  'leaderboard-test-mountain-1',
  'Approved leaderboard badge comment ' || value,
  'approved'::public.moderation_status,
  'published',
  ('2026-05-' || lpad(value::text, 2, '0') || ' 10:00:00+00')::timestamptz
from generate_series(1, 5) as value;

insert into public.comments (user_id, mountain_id, body, status, visibility_status, created_at)
select
  '00000000-0000-4000-8000-000000000218'::uuid,
  'leaderboard-test-mountain-1',
  'Rejected leaderboard badge comment ' || value,
  'rejected'::public.moderation_status,
  'hidden',
  ('2026-05-' || lpad(value::text, 2, '0') || ' 11:00:00+00')::timestamptz
from generate_series(1, 5) as value;

insert into public.user_hikes (user_id, title, body, difficulty, status, created_at, updated_at)
select
  '00000000-0000-4000-8000-000000000212'::uuid,
  'Approved recommendation ' || value,
  'Approved recommendation used by the rollback-only achievement test.',
  'moderate'::public.difficulty_level,
  'approved'::public.moderation_status,
  ('2026-04-' || lpad(value::text, 2, '0') || ' 10:00:00+00')::timestamptz,
  ('2026-04-' || lpad(value::text, 2, '0') || ' 10:00:00+00')::timestamptz
from generate_series(1, 3) as value;

insert into public.user_hikes (user_id, title, body, difficulty, status, created_at, updated_at)
select
  '00000000-0000-4000-8000-000000000218'::uuid,
  'Rejected recommendation ' || value,
  'Rejected recommendation used by the rollback-only achievement test.',
  'moderate'::public.difficulty_level,
  'rejected'::public.moderation_status,
  ('2026-04-' || lpad(value::text, 2, '0') || ' 11:00:00+00')::timestamptz,
  ('2026-04-' || lpad(value::text, 2, '0') || ' 11:00:00+00')::timestamptz
from generate_series(1, 3) as value;

do $$
declare
  first_tie_rank bigint;
  second_tie_rank bigint;
  outside_rank bigint;
  week_points bigint;
  month_points bigint;
  award_count integer;
begin
  if (
    select points
    from public.leaderboard_position_at(
      '00000000-0000-4000-8000-000000000216',
      'all_time',
      'points',
      '2026-08-02 12:00:00+00'
    )
  ) <> 5 then
    raise exception 'Rejected check-ins changed leaderboard points';
  end if;

  if (
    select unique_summits
    from public.leaderboard_position_at(
      '00000000-0000-4000-8000-000000000214',
      'all_time',
      'points',
      '2026-08-02 12:00:00+00'
    )
  ) <> 2 then
    raise exception 'Duplicate visits counted as duplicate unique summits';
  end if;

  select rank into first_tie_rank
  from public.leaderboard_position_at(
    '00000000-0000-4000-8000-000000000214',
    'all_time',
    'points',
    '2026-08-02 12:00:00+00'
  );

  select rank into second_tie_rank
  from public.leaderboard_position_at(
    '00000000-0000-4000-8000-000000000215',
    'all_time',
    'points',
    '2026-08-02 12:00:00+00'
  );

  if first_tie_rank >= second_tie_rank then
    raise exception 'Leaderboard tie-breaker is not deterministic';
  end if;

  select rank into outside_rank
  from public.leaderboard_position_at(
    '00000000-0000-4000-8000-000000000216',
    'all_time',
    'points',
    '2026-08-02 12:00:00+00'
  );

  if outside_rank <= 3 then
    raise exception 'Outside user test fixture unexpectedly appears in top results';
  end if;

  select points into week_points
  from public.leaderboard_position_at(
    '00000000-0000-4000-8000-000000000217',
    'week',
    'points',
    '2026-08-02 12:00:00+00'
  );

  select points into month_points
  from public.leaderboard_position_at(
    '00000000-0000-4000-8000-000000000217',
    'month',
    'points',
    '2026-08-02 12:00:00+00'
  );

  if week_points <> 21 or month_points <> 7 then
    raise exception 'Week or month boundary filtering is incorrect: week %, month %', week_points, month_points;
  end if;

  perform public.recalculate_user_badges('00000000-0000-4000-8000-000000000214');
  perform public.recalculate_user_badges('00000000-0000-4000-8000-000000000214');

  select count(*) into award_count
  from public.user_badges
  where user_id = '00000000-0000-4000-8000-000000000214'
    and badge_id = 'trail_starter';

  if award_count <> 1 then
    raise exception 'Badge reconciliation created a duplicate award';
  end if;

  if not exists (
    select 1 from public.user_badges
    where user_id = '00000000-0000-4000-8000-000000000214'
      and badge_id = 'hard_hitter'
  ) then
    raise exception 'Hard Hitter was not awarded at its approved threshold';
  end if;

  if exists (
    select 1 from public.user_badges
    where user_id = '00000000-0000-4000-8000-000000000218'
  ) then
    raise exception 'Rejected activity unlocked a badge';
  end if;

  if exists (
    select 1
    from public.badge_progress_for_user('00000000-0000-4000-8000-000000000211')
    where current_progress > target
  ) then
    raise exception 'Badge progress exceeded its target';
  end if;

  if not exists (
    select 1 from public.user_badges
    where user_id = '00000000-0000-4000-8000-000000000213'
      and badge_id = 'community_voice'
  ) or not exists (
    select 1 from public.user_badges
    where user_id = '00000000-0000-4000-8000-000000000212'
      and badge_id = 'trail_contributor'
  ) then
    raise exception 'Approved contribution badges were not awarded';
  end if;

  if exists (
    select 1
    from public.get_leaderboard('all_time', 'points', 100, 0, 'Leader') result
    where to_jsonb(result) ?| array['email', 'username', 'bio', 'points_total']
  ) then
    raise exception 'Leaderboard endpoint exposed private or internal profile fields';
  end if;
end;
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000216', true);
select set_config(
  'request.jwt.claims',
  jsonb_build_object(
    'sub', '00000000-0000-4000-8000-000000000216',
    'role', 'authenticated',
    'iat', extract(epoch from '2026-08-02 12:00:00+00'::timestamptz)::bigint
  )::text,
  true
);

do $$
begin
  if not exists (
    select 1
    from public.get_my_leaderboard_position('all_time', 'points')
    where user_id = auth.uid()
      and rank > 3
  ) then
    raise exception 'Signed-in user position was not returned outside top results';
  end if;

  if exists (
    select 1
    from public.get_my_badges() result
    where to_jsonb(result) ?| array['user_id', 'email', 'username', 'bio']
  ) then
    raise exception 'Badge endpoint exposed private account fields';
  end if;
end;
$$;

reset role;

rollback;

select 'leaderboard_badges assertions passed' as result;

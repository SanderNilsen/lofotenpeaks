begin;

create table if not exists public.badge_definitions (
  id text primary key,
  name text not null,
  description text not null,
  icon_name text not null,
  threshold integer not null check (threshold > 0),
  sort_order integer not null unique,
  is_active boolean not null default true
);

insert into public.badge_definitions (
  id,
  name,
  description,
  icon_name,
  threshold,
  sort_order
)
values
  ('first_summit', 'First Summit', 'Reach your first unique approved summit.', 'flag', 1, 10),
  ('trail_starter', 'Trail Starter', 'Complete 3 approved check-ins.', 'footprints', 3, 20),
  ('peak_collector', 'Peak Collector', 'Reach 5 unique approved summits.', 'mountain', 5, 30),
  ('summit_seeker', 'Summit Seeker', 'Reach 10 unique approved summits.', 'telescope', 10, 40),
  ('lofoten_legend', 'Lofoten Legend', 'Reach 20 unique approved summits.', 'crown', 20, 50),
  ('hard_hitter', 'Hard Hitter', 'Complete 3 approved check-ins on Hard hikes.', 'pickaxe', 3, 60),
  ('consistent_climber', 'Consistent Climber', 'Record an approved check-in during 3 consecutive calendar months.', 'calendar-check', 3, 70),
  ('community_voice', 'Community Voice', 'Have 5 approved and published comments.', 'message-circle', 5, 80),
  ('trail_contributor', 'Trail Contributor', 'Have 3 approved hike recommendations.', 'map-pinned', 3, 90),
  ('summit_regular', 'Summit Regular', 'Complete 10 approved check-ins.', 'repeat-2', 10, 100)
on conflict (id) do update
set
  name = excluded.name,
  description = excluded.description,
  icon_name = excluded.icon_name,
  threshold = excluded.threshold,
  sort_order = excluded.sort_order,
  is_active = true;

create table if not exists public.user_badges (
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id text not null references public.badge_definitions(id) on delete cascade,
  earned_at timestamptz not null,
  notified_at timestamptz,
  primary key (user_id, badge_id)
);

create index if not exists check_ins_approved_leaderboard_idx
  on public.check_ins (user_id, checked_in_at, mountain_id)
  include (points, trail_id)
  where status = 'approved';

create index if not exists comments_approved_badges_idx
  on public.comments (user_id, created_at)
  where status = 'approved'
    and visibility_status = 'published'
    and deleted_at is null;

create index if not exists user_hikes_approved_badges_idx
  on public.user_hikes (user_id, updated_at)
  where status = 'approved'
    and removed_at is null;

alter table public.badge_definitions enable row level security;
alter table public.user_badges enable row level security;

drop policy if exists "Badge definitions are public" on public.badge_definitions;
create policy "Badge definitions are public"
on public.badge_definitions
for select
using (is_active = true);

drop policy if exists "Users can read their own badges" on public.user_badges;
create policy "Users can read their own badges"
on public.user_badges
for select
to authenticated
using (auth.uid() = user_id);

revoke all on table public.badge_definitions from public, anon, authenticated;
grant select on table public.badge_definitions to anon, authenticated;

revoke all on table public.user_badges from public, anon, authenticated;
grant select on table public.user_badges to authenticated;

create or replace function public.badge_progress_for_user(p_user_id uuid)
returns table (
  badge_id text,
  current_progress integer,
  target integer,
  qualified_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  with approved_check_ins as (
    select
      ci.checked_in_at,
      ci.mountain_id,
      coalesce(t.difficulty::text, m.difficulty::text) as difficulty
    from public.check_ins ci
    join public.mountains m on m.id = ci.mountain_id
    left join public.trails t on t.id = ci.trail_id
    where ci.user_id = p_user_id
      and ci.status = 'approved'
  ),
  summit_firsts as (
    select mountain_id, min(checked_in_at) as first_reached_at
    from approved_check_ins
    group by mountain_id
  ),
  approved_comments as (
    select c.created_at
    from public.comments c
    where c.user_id = p_user_id
      and c.status = 'approved'
      and c.visibility_status = 'published'
      and c.deleted_at is null
  ),
  approved_recommendations as (
    select uh.updated_at
    from public.user_hikes uh
    where uh.user_id = p_user_id
      and uh.status = 'approved'
      and uh.removed_at is null
  ),
  active_months as (
    select
      date_trunc('month', checked_in_at at time zone 'Europe/Oslo') as month_start,
      min(checked_in_at) as first_check_in
    from approved_check_ins
    group by date_trunc('month', checked_in_at at time zone 'Europe/Oslo')
  ),
  numbered_months as (
    select
      month_start,
      first_check_in,
      row_number() over (order by month_start) as month_number
    from active_months
  ),
  grouped_months as (
    select
      month_start,
      first_check_in,
      month_start - (month_number::integer * interval '1 month') as run_group
    from numbered_months
  ),
  month_runs as (
    select
      run_group,
      min(month_start) as first_month,
      count(*)::integer as month_count
    from grouped_months
    group by run_group
  ),
  activity_totals as (
    select
      (select count(*)::integer from approved_check_ins) as check_in_count,
      (select count(*)::integer from summit_firsts) as unique_summit_count,
      (select count(*)::integer from approved_check_ins where difficulty = 'hard') as hard_check_in_count,
      (select count(*)::integer from approved_comments) as comment_count,
      (select count(*)::integer from approved_recommendations) as recommendation_count,
      coalesce((select max(month_count) from month_runs), 0)::integer as consecutive_month_count
  ),
  calculated as (
    select
      bd.id as badge_id,
      bd.threshold as target,
      case bd.id
        when 'first_summit' then totals.unique_summit_count
        when 'trail_starter' then totals.check_in_count
        when 'peak_collector' then totals.unique_summit_count
        when 'summit_seeker' then totals.unique_summit_count
        when 'lofoten_legend' then totals.unique_summit_count
        when 'hard_hitter' then totals.hard_check_in_count
        when 'consistent_climber' then totals.consecutive_month_count
        when 'community_voice' then totals.comment_count
        when 'trail_contributor' then totals.recommendation_count
        when 'summit_regular' then totals.check_in_count
        else 0
      end as raw_progress,
      case bd.id
        when 'first_summit' then (
          select sf.first_reached_at
          from summit_firsts sf
          order by sf.first_reached_at, sf.mountain_id
          offset (bd.threshold - 1) limit 1
        )
        when 'peak_collector' then (
          select sf.first_reached_at
          from summit_firsts sf
          order by sf.first_reached_at, sf.mountain_id
          offset (bd.threshold - 1) limit 1
        )
        when 'summit_seeker' then (
          select sf.first_reached_at
          from summit_firsts sf
          order by sf.first_reached_at, sf.mountain_id
          offset (bd.threshold - 1) limit 1
        )
        when 'lofoten_legend' then (
          select sf.first_reached_at
          from summit_firsts sf
          order by sf.first_reached_at, sf.mountain_id
          offset (bd.threshold - 1) limit 1
        )
        when 'trail_starter' then (
          select aci.checked_in_at
          from approved_check_ins aci
          order by aci.checked_in_at, aci.mountain_id
          offset (bd.threshold - 1) limit 1
        )
        when 'hard_hitter' then (
          select aci.checked_in_at
          from approved_check_ins aci
          where aci.difficulty = 'hard'
          order by aci.checked_in_at, aci.mountain_id
          offset (bd.threshold - 1) limit 1
        )
        when 'consistent_climber' then (
          select gm.first_check_in
          from month_runs mr
          join grouped_months gm
            on gm.run_group = mr.run_group
           and gm.month_start = mr.first_month + ((bd.threshold - 1) * interval '1 month')
          where mr.month_count >= bd.threshold
          order by gm.first_check_in
          limit 1
        )
        when 'community_voice' then (
          select ac.created_at
          from approved_comments ac
          order by ac.created_at
          offset (bd.threshold - 1) limit 1
        )
        when 'trail_contributor' then (
          select ar.updated_at
          from approved_recommendations ar
          order by ar.updated_at
          offset (bd.threshold - 1) limit 1
        )
        when 'summit_regular' then (
          select aci.checked_in_at
          from approved_check_ins aci
          order by aci.checked_in_at, aci.mountain_id
          offset (bd.threshold - 1) limit 1
        )
        else null
      end as qualified_at
    from public.badge_definitions bd
    cross join activity_totals totals
    where bd.is_active = true
  )
  select
    calculated.badge_id,
    least(calculated.raw_progress, calculated.target)::integer as current_progress,
    calculated.target,
    calculated.qualified_at
  from calculated
  order by (
    select definitions.sort_order
    from public.badge_definitions definitions
    where definitions.id = calculated.badge_id
  );
$$;

revoke all on function public.badge_progress_for_user(uuid) from public, anon, authenticated;

create or replace function public.recalculate_user_badges(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.user_badges ub
  where ub.user_id = p_user_id
    and not exists (
      select 1
      from public.badge_progress_for_user(p_user_id) progress
      where progress.badge_id = ub.badge_id
        and progress.qualified_at is not null
    );

  insert into public.user_badges (user_id, badge_id, earned_at)
  select p_user_id, progress.badge_id, progress.qualified_at
  from public.badge_progress_for_user(p_user_id) progress
  where progress.qualified_at is not null
  on conflict (user_id, badge_id) do update
  set earned_at = excluded.earned_at;
end;
$$;

revoke all on function public.recalculate_user_badges(uuid) from public, anon, authenticated;

create or replace function public.recalculate_badges_after_activity_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recalculate_user_badges(old.user_id);
    return old;
  end if;

  perform public.recalculate_user_badges(new.user_id);

  if tg_op = 'UPDATE' and old.user_id is distinct from new.user_id then
    perform public.recalculate_user_badges(old.user_id);
  end if;

  return new;
end;
$$;

revoke all on function public.recalculate_badges_after_activity_change() from public, anon, authenticated;

drop trigger if exists check_ins_recalculate_badges on public.check_ins;
create trigger check_ins_recalculate_badges
after insert or update or delete on public.check_ins
for each row execute function public.recalculate_badges_after_activity_change();

drop trigger if exists comments_recalculate_badges on public.comments;
create trigger comments_recalculate_badges
after insert or update or delete on public.comments
for each row execute function public.recalculate_badges_after_activity_change();

drop trigger if exists user_hikes_recalculate_badges on public.user_hikes;
create trigger user_hikes_recalculate_badges
after insert or update or delete on public.user_hikes
for each row execute function public.recalculate_badges_after_activity_change();

create or replace function public.get_my_badges()
returns table (
  badge_id text,
  name text,
  description text,
  icon_name text,
  current_progress integer,
  target integer,
  badge_state text,
  earned_at timestamptz,
  is_new boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required.';
  end if;

  perform public.recalculate_user_badges(current_user_id);

  return query
  select
    definitions.id,
    definitions.name,
    definitions.description,
    definitions.icon_name,
    progress.current_progress,
    progress.target,
    case
      when awards.badge_id is not null then 'unlocked'
      when progress.current_progress > 0 then 'in_progress'
      else 'locked'
    end,
    awards.earned_at,
    awards.badge_id is not null and awards.notified_at is null
  from public.badge_definitions definitions
  join public.badge_progress_for_user(current_user_id) progress
    on progress.badge_id = definitions.id
  left join public.user_badges awards
    on awards.user_id = current_user_id
   and awards.badge_id = definitions.id
  where definitions.is_active = true
  order by definitions.sort_order;
end;
$$;

revoke all on function public.get_my_badges() from public, anon;
grant execute on function public.get_my_badges() to authenticated;

create or replace function public.acknowledge_my_badges(p_badge_ids text[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required.';
  end if;

  update public.user_badges
  set notified_at = coalesce(notified_at, now())
  where user_id = current_user_id
    and badge_id = any(coalesce(p_badge_ids, array[]::text[]));
end;
$$;

revoke all on function public.acknowledge_my_badges(text[]) from public, anon;
grant execute on function public.acknowledge_my_badges(text[]) to authenticated;

create or replace function public.leaderboard_rankings_at(
  p_timeframe text,
  p_metric text,
  p_reference_at timestamptz
)
returns table (
  rank bigint,
  user_id uuid,
  display_name text,
  avatar_url text,
  points bigint,
  unique_summits bigint,
  approved_check_ins bigint,
  score_reached_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if p_timeframe not in ('week', 'month', 'all_time') then
    raise exception 'Invalid leaderboard timeframe.';
  end if;

  if p_metric not in ('points', 'unique_summits', 'approved_check_ins') then
    raise exception 'Invalid leaderboard metric.';
  end if;

  return query
  with approved_activity as (
    select
      ci.user_id,
      ci.mountain_id,
      ci.points::bigint as awarded_points,
      ci.checked_in_at
    from public.check_ins ci
    where ci.status = 'approved'
      and ci.checked_in_at <= p_reference_at
      and (
        p_timeframe = 'all_time'
        or (
          p_timeframe = 'week'
          and ci.checked_in_at at time zone 'Europe/Oslo'
            >= date_trunc('week', p_reference_at at time zone 'Europe/Oslo')
        )
        or (
          p_timeframe = 'month'
          and ci.checked_in_at at time zone 'Europe/Oslo'
            >= date_trunc('month', p_reference_at at time zone 'Europe/Oslo')
        )
      )
  ),
  activity_totals as (
    select
      aa.user_id,
      sum(aa.awarded_points)::bigint as points,
      count(*)::bigint as approved_check_ins,
      max(aa.checked_in_at) as latest_check_in
    from approved_activity aa
    group by aa.user_id
  ),
  summit_firsts as (
    select
      aa.user_id,
      aa.mountain_id,
      min(aa.checked_in_at) as first_reached_at
    from approved_activity aa
    group by aa.user_id, aa.mountain_id
  ),
  summit_totals as (
    select
      sf.user_id,
      count(*)::bigint as unique_summits,
      max(sf.first_reached_at) as latest_unique_summit
    from summit_firsts sf
    group by sf.user_id
  ),
  scores as (
    select
      totals.user_id,
      coalesce(nullif(trim(profile.display_name), ''), nullif(trim(profile.username), ''), 'Lofoten hiker') as display_name,
      profile.avatar_url,
      totals.points,
      summits.unique_summits,
      totals.approved_check_ins,
      case p_metric
        when 'unique_summits' then summits.latest_unique_summit
        else totals.latest_check_in
      end as score_reached_at,
      case p_metric
        when 'points' then totals.points
        when 'unique_summits' then summits.unique_summits
        when 'approved_check_ins' then totals.approved_check_ins
      end as primary_score
    from activity_totals totals
    join summit_totals summits on summits.user_id = totals.user_id
    join public.profiles profile on profile.id = totals.user_id
  ),
  ranked as (
    select
      row_number() over (
        order by
          scores.primary_score desc,
          scores.unique_summits desc,
          scores.approved_check_ins desc,
          scores.score_reached_at asc,
          scores.user_id asc
      ) as rank,
      scores.*
    from scores
  )
  select
    ranked.rank,
    ranked.user_id,
    ranked.display_name,
    ranked.avatar_url,
    ranked.points,
    ranked.unique_summits,
    ranked.approved_check_ins,
    ranked.score_reached_at
  from ranked
  order by ranked.rank;
end;
$$;

revoke all on function public.leaderboard_rankings_at(text, text, timestamptz) from public, anon, authenticated;

create or replace function public.get_leaderboard(
  p_timeframe text default 'all_time',
  p_metric text default 'points',
  p_limit integer default 20,
  p_offset integer default 0,
  p_search text default null
)
returns table (
  rank bigint,
  user_id uuid,
  display_name text,
  avatar_url text,
  points bigint,
  unique_summits bigint,
  approved_check_ins bigint,
  score_reached_at timestamptz,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if p_limit < 1 or p_limit > 100 then
    raise exception 'Leaderboard limit must be between 1 and 100.';
  end if;

  if p_offset < 0 then
    raise exception 'Leaderboard offset cannot be negative.';
  end if;

  return query
  with filtered as (
    select rankings.*
    from public.leaderboard_rankings_at(p_timeframe, p_metric, now()) rankings
    where nullif(trim(p_search), '') is null
      or rankings.display_name ilike '%' || trim(p_search) || '%'
  )
  select
    filtered.rank,
    filtered.user_id,
    filtered.display_name,
    filtered.avatar_url,
    filtered.points,
    filtered.unique_summits,
    filtered.approved_check_ins,
    filtered.score_reached_at,
    count(*) over ()::bigint
  from filtered
  order by filtered.rank
  limit p_limit
  offset p_offset;
end;
$$;

revoke all on function public.get_leaderboard(text, text, integer, integer, text) from public;
grant execute on function public.get_leaderboard(text, text, integer, integer, text) to anon, authenticated;

create or replace function public.leaderboard_position_at(
  p_user_id uuid,
  p_timeframe text,
  p_metric text,
  p_reference_at timestamptz
)
returns table (
  rank bigint,
  user_id uuid,
  display_name text,
  avatar_url text,
  points bigint,
  unique_summits bigint,
  approved_check_ins bigint,
  score_reached_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select rankings.*
  from public.leaderboard_rankings_at(p_timeframe, p_metric, p_reference_at) rankings
  where rankings.user_id = p_user_id;
$$;

revoke all on function public.leaderboard_position_at(uuid, text, text, timestamptz) from public, anon, authenticated;

create or replace function public.get_my_leaderboard_position(
  p_timeframe text default 'all_time',
  p_metric text default 'points'
)
returns table (
  rank bigint,
  user_id uuid,
  display_name text,
  avatar_url text,
  points bigint,
  unique_summits bigint,
  approved_check_ins bigint,
  score_reached_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required.';
  end if;

  return query
  select rankings.*
  from public.leaderboard_position_at(current_user_id, p_timeframe, p_metric, now()) rankings;
end;
$$;

revoke all on function public.get_my_leaderboard_position(text, text) from public, anon;
grant execute on function public.get_my_leaderboard_position(text, text) to authenticated;

do $$
declare
  profile_record record;
begin
  for profile_record in select id from public.profiles loop
    perform public.recalculate_user_badges(profile_record.id);
  end loop;
end;
$$;

commit;

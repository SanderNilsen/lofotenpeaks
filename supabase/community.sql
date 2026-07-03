-- Community feature layer for check-ins and leaderboard progress.
-- Safe to rerun after supabase/schema.sql has been applied.

drop view if exists public.leaderboard;

create or replace view public.leaderboard
with (security_invoker = true) as
select
  p.id as user_id,
  coalesce(p.display_name, p.username, 'Hiker') as display_name,
  p.avatar_url,
  coalesce(sum(c.points) filter (where c.status = 'approved'), 0)::integer as points,
  count(c.id) filter (where c.status = 'approved')::integer as check_in_count,
  count(distinct c.mountain_id) filter (where c.status = 'approved')::integer as completed_mountains,
  max(c.checked_in_at) filter (where c.status = 'approved') as last_check_in_at
from public.profiles p
left join public.check_ins c on c.user_id = p.id
group by p.id, p.display_name, p.username, p.avatar_url
order by points desc, completed_mountains desc, check_in_count desc, last_check_in_at asc nulls last;

grant select on public.leaderboard to anon, authenticated;

create or replace function public.create_mountain_check_in(
  p_mountain_id text,
  p_trail_id text default null,
  p_note text default null,
  p_lat numeric default null,
  p_lng numeric default null
)
returns public.check_ins
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  inserted_check_in public.check_ins;
  submitted_location extensions.geography;
begin
  if auth.uid() is null then
    raise exception 'Sign in required' using errcode = '42501';
  end if;

  if (p_lat is null and p_lng is not null) or (p_lat is not null and p_lng is null) then
    raise exception 'Both latitude and longitude are required when saving location'
      using errcode = '22023';
  end if;

  if p_lat is not null and (p_lat < -90 or p_lat > 90 or p_lng < -180 or p_lng > 180) then
    raise exception 'Location coordinates are outside valid latitude/longitude ranges'
      using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.mountains as m
    where m.id = p_mountain_id
      and m.published = true
  ) then
    raise exception 'Published mountain not found' using errcode = 'P0002';
  end if;

  if p_trail_id is not null and not exists (
    select 1
    from public.trails as t
    where t.id = p_trail_id
      and t.mountain_id = p_mountain_id
      and t.published = true
  ) then
    raise exception 'Published trail not found for this mountain' using errcode = 'P0002';
  end if;

  if p_lat is not null then
    submitted_location := extensions.st_setsrid(
      extensions.st_makepoint(p_lng, p_lat),
      4326
    )::extensions.geography;
  end if;

  insert into public.check_ins (
    user_id,
    mountain_id,
    trail_id,
    note,
    points,
    status,
    location,
    distance_to_summit_meters
  )
  select
    auth.uid(),
    m.id,
    p_trail_id,
    nullif(trim(coalesce(p_note, '')), ''),
    10,
    'approved',
    submitted_location,
    case
      when submitted_location is null or m.summit is null then null
      else extensions.st_distance(submitted_location, m.summit)
    end
  from public.mountains as m
  where m.id = p_mountain_id
    and m.published = true
  returning * into inserted_check_in;

  return inserted_check_in;
end;
$$;

grant execute on function public.create_mountain_check_in(
  text,
  text,
  text,
  numeric,
  numeric
) to authenticated;

-- Keep the PostgREST view contract without granting private trail columns to
-- every authenticated user. The definer function has one narrow purpose and
-- performs an explicit server-side admin check before reading guide records.
begin;

create or replace function public.get_admin_mountain_guides()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  guide_rows jsonb;
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  select coalesce(
    jsonb_agg(to_jsonb(guide_row) order by guide_row.mountain_name, guide_row.trail_name),
    '[]'::jsonb
  )
  into guide_rows
  from (
    select
      m.id as mountain_id,
      m.slug as mountain_slug,
      m.name as mountain_name,
      m.region,
      m.height_meters,
      m.check_in_radius_meters,
      m.check_in_points,
      case when m.summit is null then null else extensions.st_y(m.summit::extensions.geometry) end as summit_lat,
      case when m.summit is null then null else extensions.st_x(m.summit::extensions.geometry) end as summit_lng,
      m.difficulty as mountain_difficulty,
      m.summary as mountain_summary,
      m.description as mountain_description,
      m.weather_location_id,
      m.hero_image_path,
      m.published as mountain_published,
      t.id as trail_id,
      t.slug as trail_slug,
      t.name as trail_name,
      t.summary as trail_summary,
      t.description as trail_description,
      t.length_km,
      t.elevation_gain_meters,
      t.estimated_duration,
      t.difficulty as trail_difficulty,
      case when t.start_point is null then null else extensions.st_y(t.start_point::extensions.geometry) end as start_lat,
      case when t.start_point is null then null else extensions.st_x(t.start_point::extensions.geometry) end as start_lng,
      case when t.end_point is null then null else extensions.st_y(t.end_point::extensions.geometry) end as end_lat,
      case when t.end_point is null then null else extensions.st_x(t.end_point::extensions.geometry) end as end_lng,
      t.route_geojson,
      t.route_note,
      t.gpx_storage_path,
      t.safety_notes,
      t.guide,
      t.published as trail_published,
      t.last_reviewed_at,
      t.reviewed_by,
      t.review_status,
      t.next_review_due,
      coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', ti.id,
            'filePath', ti.file_path,
            'alt', ti.alt,
            'source', ti.source,
            'license', ti.license,
            'creditUrl', ti.credit_url,
            'sortOrder', ti.sort_order
          ) order by ti.sort_order, ti.id
        ) filter (where ti.id is not null),
        '[]'::jsonb
      ) as images
    from public.mountains as m
    left join public.trails as t on t.mountain_id = m.id
    left join public.trail_images as ti on ti.trail_id = t.id
    group by m.id, t.id
  ) as guide_row;

  return guide_rows;
end;
$$;

revoke all on function public.get_admin_mountain_guides() from public, anon;
grant execute on function public.get_admin_mountain_guides() to authenticated;

drop view if exists public.admin_mountain_guides;

create view public.admin_mountain_guides
with (security_invoker = true, security_barrier = true) as
select *
from jsonb_to_recordset(public.get_admin_mountain_guides()) as guide (
  mountain_id text,
  mountain_slug text,
  mountain_name text,
  region text,
  height_meters integer,
  check_in_radius_meters integer,
  check_in_points integer,
  summit_lat double precision,
  summit_lng double precision,
  mountain_difficulty public.difficulty_level,
  mountain_summary text,
  mountain_description text,
  weather_location_id text,
  hero_image_path text,
  mountain_published boolean,
  trail_id text,
  trail_slug text,
  trail_name text,
  trail_summary text,
  trail_description text,
  length_km numeric,
  elevation_gain_meters integer,
  estimated_duration text,
  trail_difficulty public.difficulty_level,
  start_lat double precision,
  start_lng double precision,
  end_lat double precision,
  end_lng double precision,
  route_geojson jsonb,
  route_note text,
  gpx_storage_path text,
  safety_notes jsonb,
  guide jsonb,
  trail_published boolean,
  last_reviewed_at date,
  reviewed_by text,
  review_status text,
  next_review_due date,
  images jsonb
);

grant select on public.admin_mountain_guides to authenticated;

commit;

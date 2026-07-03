-- Admin CMS layer for Lofoten Peaks.
-- Safe to rerun after the base schema has been applied.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

grant execute on function public.is_admin() to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'admin_users' and policyname = 'Admins can read admin users'
  ) then
    create policy "Admins can read admin users"
    on public.admin_users for select
    using (public.is_admin());
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'mountains' and policyname = 'Admins can read all mountains'
  ) then
    create policy "Admins can read all mountains"
    on public.mountains for select
    using (public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'mountains' and policyname = 'Admins can insert mountains'
  ) then
    create policy "Admins can insert mountains"
    on public.mountains for insert
    with check (public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'mountains' and policyname = 'Admins can update mountains'
  ) then
    create policy "Admins can update mountains"
    on public.mountains for update
    using (public.is_admin())
    with check (public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'mountains' and policyname = 'Admins can delete mountains'
  ) then
    create policy "Admins can delete mountains"
    on public.mountains for delete
    using (public.is_admin());
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'trails' and policyname = 'Admins can read all trails'
  ) then
    create policy "Admins can read all trails"
    on public.trails for select
    using (public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'trails' and policyname = 'Admins can insert trails'
  ) then
    create policy "Admins can insert trails"
    on public.trails for insert
    with check (public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'trails' and policyname = 'Admins can update trails'
  ) then
    create policy "Admins can update trails"
    on public.trails for update
    using (public.is_admin())
    with check (public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'trails' and policyname = 'Admins can delete trails'
  ) then
    create policy "Admins can delete trails"
    on public.trails for delete
    using (public.is_admin());
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'trail_images' and policyname = 'Admins can insert trail images'
  ) then
    create policy "Admins can insert trail images"
    on public.trail_images for insert
    with check (public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'trail_images' and policyname = 'Admins can update trail images'
  ) then
    create policy "Admins can update trail images"
    on public.trail_images for update
    using (public.is_admin())
    with check (public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'trail_images' and policyname = 'Admins can delete trail images'
  ) then
    create policy "Admins can delete trail images"
    on public.trail_images for delete
    using (public.is_admin());
  end if;
end $$;

alter table public.trails add column if not exists gpx_storage_path text;
alter table public.trails add column if not exists safety_notes jsonb not null default '[]'::jsonb;
alter table public.trails add column if not exists guide jsonb not null default '{}'::jsonb;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'mountain-images',
  'mountain-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'trail-gpx',
  'trail-gpx',
  false,
  2097152,
  null
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Mountain images are public'
  ) then
    create policy "Mountain images are public"
    on storage.objects for select
    using (bucket_id = 'mountain-images');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admins can upload mountain images'
  ) then
    create policy "Admins can upload mountain images"
    on storage.objects for insert
    with check (bucket_id = 'mountain-images' and public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admins can update mountain images'
  ) then
    create policy "Admins can update mountain images"
    on storage.objects for update
    using (bucket_id = 'mountain-images' and public.is_admin())
    with check (bucket_id = 'mountain-images' and public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admins can delete mountain images'
  ) then
    create policy "Admins can delete mountain images"
    on storage.objects for delete
    using (bucket_id = 'mountain-images' and public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admins can read trail GPX files'
  ) then
    create policy "Admins can read trail GPX files"
    on storage.objects for select
    using (bucket_id = 'trail-gpx' and public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admins can upload trail GPX files'
  ) then
    create policy "Admins can upload trail GPX files"
    on storage.objects for insert
    with check (bucket_id = 'trail-gpx' and public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admins can update trail GPX files'
  ) then
    create policy "Admins can update trail GPX files"
    on storage.objects for update
    using (bucket_id = 'trail-gpx' and public.is_admin())
    with check (bucket_id = 'trail-gpx' and public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Admins can delete trail GPX files'
  ) then
    create policy "Admins can delete trail GPX files"
    on storage.objects for delete
    using (bucket_id = 'trail-gpx' and public.is_admin());
  end if;
end $$;

drop view if exists public.admin_mountain_guides;
drop view if exists public.mountain_guides;

create or replace view public.mountain_guides
with (security_invoker = true) as
select
  m.id as mountain_id,
  m.slug as mountain_slug,
  m.name as mountain_name,
  m.region,
  m.height_meters,
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
      )
      order by ti.sort_order, ti.id
    ) filter (where ti.id is not null),
    '[]'::jsonb
  ) as images
from public.mountains m
left join public.trails t
  on t.mountain_id = m.id
  and t.published = true
left join public.trail_images ti
  on ti.trail_id = t.id
where m.published = true
group by
  m.id,
  m.slug,
  m.name,
  m.region,
  m.height_meters,
  m.summit,
  m.difficulty,
  m.summary,
  m.description,
  m.weather_location_id,
  m.hero_image_path,
  m.published,
  t.id,
  t.slug,
  t.name,
  t.summary,
  t.description,
  t.length_km,
  t.elevation_gain_meters,
  t.estimated_duration,
  t.difficulty,
  t.start_point,
  t.end_point,
  t.route_geojson,
  t.route_note,
  t.gpx_storage_path,
  t.safety_notes,
  t.guide,
  t.published;

grant select on public.mountain_guides to anon, authenticated;

create or replace view public.admin_mountain_guides
with (security_invoker = true) as
select
  m.id as mountain_id,
  m.slug as mountain_slug,
  m.name as mountain_name,
  m.region,
  m.height_meters,
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
      )
      order by ti.sort_order, ti.id
    ) filter (where ti.id is not null),
    '[]'::jsonb
  ) as images
from public.mountains m
left join public.trails t
  on t.mountain_id = m.id
left join public.trail_images ti
  on ti.trail_id = t.id
group by
  m.id,
  m.slug,
  m.name,
  m.region,
  m.height_meters,
  m.summit,
  m.difficulty,
  m.summary,
  m.description,
  m.weather_location_id,
  m.hero_image_path,
  m.published,
  t.id,
  t.slug,
  t.name,
  t.summary,
  t.description,
  t.length_km,
  t.elevation_gain_meters,
  t.estimated_duration,
  t.difficulty,
  t.start_point,
  t.end_point,
  t.route_geojson,
  t.route_note,
  t.gpx_storage_path,
  t.safety_notes,
  t.guide,
  t.published;

grant select on public.admin_mountain_guides to authenticated;

drop function if exists public.admin_create_mountain_guide(
  text,
  text,
  text,
  text,
  integer,
  numeric,
  numeric,
  public.difficulty_level,
  text,
  text,
  text,
  text,
  numeric,
  integer,
  text,
  numeric,
  numeric,
  text
);

drop function if exists public.admin_update_mountain_guide(
  text,
  text,
  text,
  text,
  text,
  integer,
  numeric,
  numeric,
  public.difficulty_level,
  text,
  text,
  text,
  text,
  numeric,
  integer,
  text,
  numeric,
  numeric,
  text
);

create or replace function public.admin_create_mountain_guide(
  p_mountain_id text,
  p_slug text,
  p_name text,
  p_region text,
  p_height_meters integer,
  p_summit_lat numeric,
  p_summit_lng numeric,
  p_difficulty public.difficulty_level,
  p_summary text,
  p_description text,
  p_weather_location_id text,
  p_hero_image_path text,
  p_trail_length_km numeric,
  p_trail_elevation_gain_meters integer,
  p_trail_estimated_duration text,
  p_start_lat numeric,
  p_start_lng numeric,
  p_route_note text default null,
  p_route_geojson jsonb default null,
  p_gpx_storage_path text default null,
  p_safety_notes jsonb default '[]'::jsonb,
  p_guide jsonb default '{}'::jsonb
)
returns table (mountain_id text, trail_id text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  clean_slug text := lower(trim(p_slug));
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  if p_route_geojson is not null
    and (
      p_route_geojson->>'type' <> 'LineString'
      or jsonb_typeof(p_route_geojson->'coordinates') <> 'array'
      or jsonb_array_length(p_route_geojson->'coordinates') < 2
    )
  then
    raise exception 'Route GPX must parse to a GeoJSON LineString with at least two coordinates'
      using errcode = '22023';
  end if;

  insert into public.mountains (
    id,
    slug,
    name,
    region,
    height_meters,
    summit,
    difficulty,
    summary,
    description,
    weather_location_id,
    hero_image_path,
    published
  ) values (
    p_mountain_id,
    clean_slug,
    p_name,
    p_region,
    p_height_meters,
    extensions.st_setsrid(extensions.st_makepoint(p_summit_lng, p_summit_lat), 4326)::extensions.geography,
    p_difficulty,
    p_summary,
    p_description,
    nullif(p_weather_location_id, ''),
    nullif(p_hero_image_path, ''),
    true
  );

  insert into public.trails (
    id,
    mountain_id,
    slug,
    name,
    summary,
    description,
    length_km,
    elevation_gain_meters,
    estimated_duration,
    difficulty,
    start_point,
    end_point,
    route_geojson,
    route_note,
    gpx_storage_path,
    safety_notes,
    guide,
    published
  ) values (
    p_mountain_id,
    p_mountain_id,
    clean_slug,
    p_name,
    p_summary,
    p_description,
    p_trail_length_km,
    p_trail_elevation_gain_meters,
    p_trail_estimated_duration,
    p_difficulty,
    extensions.st_setsrid(extensions.st_makepoint(p_start_lng, p_start_lat), 4326)::extensions.geography,
    extensions.st_setsrid(extensions.st_makepoint(p_summit_lng, p_summit_lat), 4326)::extensions.geography,
    p_route_geojson,
    coalesce(
      nullif(p_route_note, ''),
      case
        when p_route_geojson is not null then 'Route line uses uploaded GPX coordinate data for planning preview. Verify locally before hiking.'
        else 'Route line uses start and summit coordinates until GPX route data is uploaded. Verify locally before hiking.'
      end
    ),
    nullif(p_gpx_storage_path, ''),
    coalesce(p_safety_notes, '[]'::jsonb),
    coalesce(p_guide, '{}'::jsonb),
    true
  );

  return query select p_mountain_id, p_mountain_id;
end;
$$;

grant execute on function public.admin_create_mountain_guide(
  text,
  text,
  text,
  text,
  integer,
  numeric,
  numeric,
  public.difficulty_level,
  text,
  text,
  text,
  text,
  numeric,
  integer,
  text,
  numeric,
  numeric,
  text,
  jsonb,
  text,
  jsonb,
  jsonb
) to authenticated;

create or replace function public.admin_update_mountain_guide(
  p_mountain_id text,
  p_trail_id text,
  p_slug text,
  p_name text,
  p_region text,
  p_height_meters integer,
  p_summit_lat numeric,
  p_summit_lng numeric,
  p_difficulty public.difficulty_level,
  p_summary text,
  p_description text,
  p_weather_location_id text,
  p_hero_image_path text,
  p_trail_length_km numeric,
  p_trail_elevation_gain_meters integer,
  p_trail_estimated_duration text,
  p_start_lat numeric,
  p_start_lng numeric,
  p_route_note text default null,
  p_route_geojson jsonb default null,
  p_gpx_storage_path text default null,
  p_safety_notes jsonb default '[]'::jsonb,
  p_guide jsonb default '{}'::jsonb
)
returns table (mountain_id text, trail_id text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  clean_slug text := lower(trim(p_slug));
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  if p_route_geojson is not null
    and (
      p_route_geojson->>'type' <> 'LineString'
      or jsonb_typeof(p_route_geojson->'coordinates') <> 'array'
      or jsonb_array_length(p_route_geojson->'coordinates') < 2
    )
  then
    raise exception 'Route GPX must parse to a GeoJSON LineString with at least two coordinates'
      using errcode = '22023';
  end if;

  update public.mountains
  set
    slug = clean_slug,
    name = p_name,
    region = p_region,
    height_meters = p_height_meters,
    summit = extensions.st_setsrid(extensions.st_makepoint(p_summit_lng, p_summit_lat), 4326)::extensions.geography,
    difficulty = p_difficulty,
    summary = p_summary,
    description = p_description,
    weather_location_id = nullif(p_weather_location_id, ''),
    hero_image_path = nullif(p_hero_image_path, ''),
    published = true
  where id = p_mountain_id;

  if not found then
    raise exception 'Mountain guide not found' using errcode = 'P0002';
  end if;

  update public.trails as tr
  set
    slug = clean_slug,
    name = p_name,
    summary = p_summary,
    description = p_description,
    length_km = p_trail_length_km,
    elevation_gain_meters = p_trail_elevation_gain_meters,
    estimated_duration = p_trail_estimated_duration,
    difficulty = p_difficulty,
    start_point = extensions.st_setsrid(extensions.st_makepoint(p_start_lng, p_start_lat), 4326)::extensions.geography,
    end_point = extensions.st_setsrid(extensions.st_makepoint(p_summit_lng, p_summit_lat), 4326)::extensions.geography,
    route_geojson = coalesce(p_route_geojson, tr.route_geojson),
    route_note = coalesce(
      nullif(p_route_note, ''),
      case
        when p_route_geojson is not null then 'Route line uses uploaded GPX coordinate data for planning preview. Verify locally before hiking.'
        else tr.route_note
      end
    ),
    gpx_storage_path = coalesce(nullif(p_gpx_storage_path, ''), tr.gpx_storage_path),
    safety_notes = coalesce(p_safety_notes, '[]'::jsonb),
    guide = coalesce(p_guide, '{}'::jsonb),
    published = true
  where tr.id = p_trail_id
    and tr.mountain_id = p_mountain_id;

  if not found then
    raise exception 'Trail guide not found' using errcode = 'P0002';
  end if;

  return query select p_mountain_id, p_trail_id;
end;
$$;

grant execute on function public.admin_update_mountain_guide(
  text,
  text,
  text,
  text,
  text,
  integer,
  numeric,
  numeric,
  public.difficulty_level,
  text,
  text,
  text,
  text,
  numeric,
  integer,
  text,
  numeric,
  numeric,
  text,
  jsonb,
  text,
  jsonb,
  jsonb
) to authenticated;

create or replace function public.admin_set_mountain_guide_published(
  p_mountain_id text,
  p_trail_id text,
  p_published boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  update public.mountains
  set published = coalesce(p_published, false)
  where id = p_mountain_id;

  if not found then
    raise exception 'Mountain guide not found' using errcode = 'P0002';
  end if;

  update public.trails
  set published = coalesce(p_published, false)
  where id = p_trail_id
    and mountain_id = p_mountain_id;

  if not found then
    raise exception 'Trail guide not found' using errcode = 'P0002';
  end if;
end;
$$;

grant execute on function public.admin_set_mountain_guide_published(text, text, boolean) to authenticated;

create or replace function public.admin_delete_mountain_guide(p_mountain_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  delete from public.mountains as m
  where m.id = p_mountain_id;

  if not found then
    raise exception 'Mountain guide not found' using errcode = 'P0002';
  end if;
end;
$$;

grant execute on function public.admin_delete_mountain_guide(text) to authenticated;

create or replace function public.admin_add_trail_image(
  p_trail_id text,
  p_file_path text,
  p_alt text default null,
  p_source text default null,
  p_license text default null,
  p_credit_url text default null,
  p_sort_order integer default null
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_id bigint;
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  insert into public.trail_images (
    trail_id,
    file_path,
    alt,
    source,
    license,
    credit_url,
    sort_order
  ) values (
    p_trail_id,
    p_file_path,
    nullif(p_alt, ''),
    nullif(p_source, ''),
    nullif(p_license, ''),
    nullif(p_credit_url, ''),
    coalesce(
      p_sort_order,
      (
        select coalesce(max(ti.sort_order), 0) + 10
        from public.trail_images as ti
        where ti.trail_id = p_trail_id
      )
    )
  )
  returning id into inserted_id;

  return inserted_id;
end;
$$;

grant execute on function public.admin_add_trail_image(
  text,
  text,
  text,
  text,
  text,
  text,
  integer
) to authenticated;

create or replace function public.admin_update_trail_image(
  p_image_id bigint,
  p_alt text default null,
  p_source text default null,
  p_license text default null,
  p_credit_url text default null,
  p_sort_order integer default 0
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  update public.trail_images as ti
  set
    alt = nullif(p_alt, ''),
    source = nullif(p_source, ''),
    license = nullif(p_license, ''),
    credit_url = nullif(p_credit_url, ''),
    sort_order = coalesce(p_sort_order, ti.sort_order)
  where ti.id = p_image_id;

  if not found then
    raise exception 'Trail image not found' using errcode = 'P0002';
  end if;
end;
$$;

grant execute on function public.admin_update_trail_image(
  bigint,
  text,
  text,
  text,
  text,
  integer
) to authenticated;

create or replace function public.admin_delete_trail_image(p_image_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  delete from public.trail_images as ti
  where ti.id = p_image_id;

  if not found then
    raise exception 'Trail image not found' using errcode = 'P0002';
  end if;
end;
$$;

grant execute on function public.admin_delete_trail_image(bigint) to authenticated;

-- Privacy, safety, moderation, and account-control hardening.
-- Apply after schema.sql, admin.sql, and community.sql.

begin;

-- Legal document versions and server-recorded acceptance.
create table public.legal_document_versions (
  document_type text primary key check (document_type in ('terms', 'privacy')),
  current_version text not null,
  requires_acceptance boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.legal_document_versions (document_type, current_version, requires_acceptance)
values
  ('terms', '2026-08-01', true),
  ('privacy', '2026-08-01', false)
on conflict (document_type) do update
set
  current_version = excluded.current_version,
  requires_acceptance = excluded.requires_acceptance,
  updated_at = now();

create table public.legal_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_type text not null references public.legal_document_versions(document_type),
  document_version text not null,
  accepted_at timestamptz not null default now(),
  source text not null default 'web',
  unique (user_id, document_type, document_version)
);

-- Exact check-in evidence is structurally separate from public activity rows.
create table public.check_in_verifications (
  check_in_id uuid primary key references public.check_ins(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  location extensions.geography(point, 4326),
  distance_to_summit_meters numeric(8, 2),
  location_accuracy_meters numeric(8, 2),
  verification_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint check_in_accuracy_range check (
    location_accuracy_meters is null or location_accuracy_meters between 0 and 5000
  ),
  constraint check_in_verification_has_evidence check (
    location is not null
    or distance_to_summit_meters is not null
    or verification_metadata <> '{}'::jsonb
  )
);

insert into public.check_in_verifications (
  check_in_id,
  user_id,
  location,
  distance_to_summit_meters,
  verification_metadata,
  created_at
)
select
  c.id,
  c.user_id,
  c.location,
  c.distance_to_summit_meters,
  jsonb_strip_nulls(jsonb_build_object('legacyPhotoPath', c.photo_path)),
  c.created_at
from public.check_ins as c
where c.location is not null
  or c.distance_to_summit_meters is not null
  or c.photo_path is not null
on conflict (check_in_id) do nothing;

drop function if exists public.create_mountain_check_in(text, text, text, numeric, numeric);

alter table public.check_ins
  drop column location,
  drop column distance_to_summit_meters,
  drop column photo_path;

alter table public.check_ins
add constraint check_in_note_length check (note is null or char_length(note) <= 240) not valid;

-- Moderation state and audit records.
alter table public.comments
  add column visibility_status text not null default 'published'
    check (visibility_status in ('published', 'hidden', 'removed')),
  add column deleted_at timestamptz,
  add column deleted_by_author boolean not null default false;

alter table public.user_hikes
  add column removal_requested_at timestamptz,
  add column removed_at timestamptz;

alter table public.trails
  add column last_reviewed_at date,
  add column reviewed_by text,
  add column review_status text not null default 'unreviewed'
    check (review_status in ('unreviewed', 'reviewed', 'needs_review')),
  add column next_review_due date;

create table public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid references auth.users(id) on delete set null,
  content_type text not null
    check (content_type in ('comment', 'profile', 'hike_recommendation', 'check_in')),
  target_id uuid not null,
  reason text not null check (
    reason in ('spam', 'harassment', 'dangerous', 'misleading', 'privacy', 'illegal', 'copyright', 'other')
  ),
  details text,
  status text not null default 'open'
    check (status in ('open', 'under_review', 'action_taken', 'no_action_required', 'closed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id) on delete set null,
  resolution_note text,
  content_snapshot jsonb not null default '{}'::jsonb,
  constraint content_report_details_length check (details is null or char_length(details) <= 500)
);

create unique index content_reports_open_unique_idx
on public.content_reports (reporter_user_id, content_type, target_id)
where status in ('open', 'under_review');

create table public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  content_type text not null,
  target_id text not null,
  action text not null,
  public_reason text,
  internal_note text,
  content_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.route_corrections (
  id uuid primary key default gen_random_uuid(),
  trail_id text not null references public.trails(id) on delete cascade,
  submitter_user_id uuid references auth.users(id) on delete set null,
  category text not null
    check (
      category in (
        'route_description', 'map_gpx', 'trailhead', 'parking_access', 'difficulty',
        'duration_distance', 'safety', 'broken_link', 'other'
      )
    ),
  affected_section text,
  details text not null,
  source_url text,
  observed_on date,
  status text not null default 'submitted'
    check (status in ('submitted', 'under_review', 'accepted', 'rejected', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id) on delete set null,
  resolution_note text,
  constraint route_correction_details_length check (char_length(details) between 20 and 2000),
  constraint route_correction_section_length check (affected_section is null or char_length(affected_section) <= 120),
  constraint route_correction_source_length check (source_url is null or char_length(source_url) <= 500)
);

create trigger route_corrections_set_updated_at
before update on public.route_corrections
for each row execute function public.set_updated_at();

create index legal_acceptances_user_idx on public.legal_acceptances (user_id);
create index check_in_verifications_user_idx on public.check_in_verifications (user_id);
create index content_reports_status_idx on public.content_reports (status, created_at);
create index moderation_actions_target_idx on public.moderation_actions (content_type, target_id, created_at);
create index route_corrections_status_idx on public.route_corrections (status, created_at);

alter table public.legal_document_versions enable row level security;
alter table public.legal_acceptances enable row level security;
alter table public.check_in_verifications enable row level security;
alter table public.content_reports enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.route_corrections enable row level security;

create policy "Legal versions are public"
on public.legal_document_versions for select
using (true);

create policy "Users can read own legal acceptances"
on public.legal_acceptances for select
using (auth.uid() = user_id or public.is_admin());

create policy "Users can read own check-in verification"
on public.check_in_verifications for select
using (auth.uid() = user_id or public.is_admin());

create policy "Users can read own reports"
on public.content_reports for select
using (auth.uid() = reporter_user_id or public.is_admin());

create policy "Admins can read moderation actions"
on public.moderation_actions for select
using (public.is_admin());

create policy "Users can read own route corrections"
on public.route_corrections for select
using (auth.uid() = submitter_user_id or public.is_admin());

drop policy if exists "Approved comments are public" on public.comments;
drop policy if exists "Users can create own comments" on public.comments;
create policy "Published comments are public"
on public.comments for select
using (
  (status = 'approved' and visibility_status = 'published')
  or auth.uid() = user_id
  or public.is_admin()
);

drop policy if exists "Approved user hikes are public" on public.user_hikes;
drop policy if exists "Users can create own hikes" on public.user_hikes;
create policy "Published user hikes are public"
on public.user_hikes for select
using (
  (status = 'approved' and removal_requested_at is null and removed_at is null)
  or auth.uid() = user_id
  or public.is_admin()
);

-- Explicit API grants keep public queries on the intended summary fields.
revoke all on public.legal_acceptances from anon, authenticated;
grant select on public.legal_acceptances to authenticated;
grant select on public.legal_document_versions to anon, authenticated;

revoke all on public.check_in_verifications from anon, authenticated;
grant select on public.check_in_verifications to authenticated;

revoke select on table public.check_ins from anon, authenticated;
grant select (
  id, user_id, mountain_id, trail_id, checked_in_at, check_in_day,
  points, note, status, created_at
) on table public.check_ins to anon, authenticated;

-- Keep private GPX object paths and internal review provenance out of direct
-- public trail queries. Public maps use parsed route_geojson instead.
revoke select on table public.trails from anon, authenticated;
grant select (
  id, mountain_id, slug, name, summary, description, length_km,
  elevation_gain_meters, estimated_duration, difficulty, start_point, end_point,
  route_geojson, route_note, safety_notes, guide, published,
  last_reviewed_at, review_status, created_at, updated_at
) on table public.trails to anon, authenticated;

revoke all on public.content_reports from anon, authenticated;
grant select on public.content_reports to authenticated;

revoke all on public.moderation_actions from anon, authenticated;
grant select on public.moderation_actions to authenticated;

revoke all on public.route_corrections from anon, authenticated;
grant select on public.route_corrections to authenticated;

revoke select, insert, update, delete on public.comments from anon, authenticated;
grant select (
  id, user_id, mountain_id, trail_id, parent_comment_id, body, status,
  visibility_status, deleted_at, deleted_by_author, created_at, updated_at
) on public.comments to anon, authenticated;

revoke select, insert, update, delete on public.user_hikes from anon, authenticated;
grant select (
  id, user_id, mountain_id, trail_id, title, body, difficulty, status,
  removal_requested_at, removed_at, created_at, updated_at
) on public.user_hikes to anon, authenticated;

create or replace function public.has_current_terms_acceptance(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_user_id is not null and exists (
    select 1
    from public.legal_acceptances as la
    join public.legal_document_versions as ldv
      on ldv.document_type = la.document_type
    where la.user_id = p_user_id
      and la.document_type = 'terms'
      and la.document_version = ldv.current_version
  );
$$;

revoke all on function public.has_current_terms_acceptance(uuid) from public, anon, authenticated;

create or replace function public.require_current_terms_acceptance()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Sign in required' using errcode = '42501';
  end if;

  if not public.has_current_terms_acceptance(auth.uid()) then
    raise exception 'Accept the current Terms of Service in Account settings before contributing.'
      using errcode = '42501';
  end if;
end;
$$;

revoke all on function public.require_current_terms_acceptance() from public, anon, authenticated;

create or replace function public.get_my_legal_acceptance_status()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'termsVersion', (select current_version from public.legal_document_versions where document_type = 'terms'),
    'privacyVersion', (select current_version from public.legal_document_versions where document_type = 'privacy'),
    'acceptedTermsVersion', (
      select document_version
      from public.legal_acceptances
      where user_id = auth.uid() and document_type = 'terms'
      order by accepted_at desc
      limit 1
    ),
    'acknowledgedPrivacyVersion', (
      select document_version
      from public.legal_acceptances
      where user_id = auth.uid() and document_type = 'privacy'
      order by accepted_at desc
      limit 1
    ),
    'termsAcceptedAt', (
      select accepted_at
      from public.legal_acceptances
      where user_id = auth.uid() and document_type = 'terms'
      order by accepted_at desc
      limit 1
    )
  )
  where auth.uid() is not null;
$$;

revoke all on function public.get_my_legal_acceptance_status() from public, anon;
grant execute on function public.get_my_legal_acceptance_status() to authenticated;

create or replace function public.accept_current_legal_documents(
  p_terms_version text,
  p_privacy_version text,
  p_source text default 'account-settings'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_terms text;
  current_privacy text;
begin
  if auth.uid() is null then
    raise exception 'Sign in required' using errcode = '42501';
  end if;

  select current_version into current_terms
  from public.legal_document_versions
  where document_type = 'terms';

  select current_version into current_privacy
  from public.legal_document_versions
  where document_type = 'privacy';

  if p_terms_version is distinct from current_terms
    or p_privacy_version is distinct from current_privacy then
    raise exception 'The legal documents changed. Reload the page and review the current versions.'
      using errcode = '22023';
  end if;

  insert into public.legal_acceptances (user_id, document_type, document_version, source)
  values
    (auth.uid(), 'terms', current_terms, left(coalesce(nullif(btrim(p_source), ''), 'account-settings'), 80)),
    (auth.uid(), 'privacy', current_privacy, left(coalesce(nullif(btrim(p_source), ''), 'account-settings'), 80))
  on conflict (user_id, document_type, document_version) do nothing;

  return public.get_my_legal_acceptance_status();
end;
$$;

revoke all on function public.accept_current_legal_documents(text, text, text) from public, anon;
grant execute on function public.accept_current_legal_documents(text, text, text) to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_terms text;
  current_privacy text;
begin
  select current_version into current_terms
  from public.legal_document_versions
  where document_type = 'terms';

  select current_version into current_privacy
  from public.legal_document_versions
  where document_type = 'privacy';

  if new.raw_user_meta_data->>'terms_accepted' is distinct from 'true'
    or new.raw_user_meta_data->>'terms_version' is distinct from current_terms
    or new.raw_user_meta_data->>'privacy_acknowledged' is distinct from 'true'
    or new.raw_user_meta_data->>'privacy_version' is distinct from current_privacy then
    raise exception 'Current Terms acceptance and Privacy Policy acknowledgement are required.'
      using errcode = '42501';
  end if;

  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    case
      when char_length(btrim(coalesce(new.raw_user_meta_data->>'display_name', ''))) between 2 and 60
        and btrim(new.raw_user_meta_data->>'display_name')
          !~* '[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+'
      then btrim(new.raw_user_meta_data->>'display_name')
      else 'Hiker'
    end,
    new.raw_user_meta_data->>'avatar_url'
  );

  insert into public.legal_acceptances (user_id, document_type, document_version, source)
  values
    (new.id, 'terms', current_terms, 'registration'),
    (new.id, 'privacy', current_privacy, 'registration');

  return new;
end;
$$;

create or replace function public.create_mountain_check_in(
  p_mountain_id text,
  p_trail_id text,
  p_note text,
  p_lat numeric,
  p_lng numeric,
  p_accuracy numeric
)
returns public.check_ins
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  inserted_check_in public.check_ins;
  submitted_location extensions.geography;
  summit_distance_meters numeric;
  allowed_radius_meters integer;
  awarded_points integer;
  clean_note text := nullif(btrim(coalesce(p_note, '')), '');
begin
  perform public.require_current_terms_acceptance();

  if p_lat is null or p_lng is null then
    raise exception 'Location is required for summit check-in' using errcode = '22023';
  end if;

  if p_lat < -90 or p_lat > 90 or p_lng < -180 or p_lng > 180 then
    raise exception 'Location coordinates are outside valid latitude/longitude ranges' using errcode = '22023';
  end if;

  if p_accuracy is not null and (p_accuracy < 0 or p_accuracy > 5000) then
    raise exception 'Location accuracy is outside the accepted range' using errcode = '22023';
  end if;

  if clean_note is not null and char_length(clean_note) > 240 then
    raise exception 'Check-in notes must be 240 characters or fewer' using errcode = '22023';
  end if;

  submitted_location := extensions.st_setsrid(
    extensions.st_makepoint(p_lng, p_lat),
    4326
  )::extensions.geography;

  select
    case when m.summit is null then null else extensions.st_distance(submitted_location, m.summit) end,
    m.check_in_radius_meters,
    m.check_in_points
  into summit_distance_meters, allowed_radius_meters, awarded_points
  from public.mountains as m
  where m.id = p_mountain_id and m.published = true;

  if not found then
    raise exception 'Published mountain not found' using errcode = 'P0002';
  end if;

  if summit_distance_meters is null then
    raise exception 'Summit location is missing for this mountain' using errcode = '22023';
  end if;

  if summit_distance_meters > allowed_radius_meters then
    raise exception 'You need to be within % meters of the summit to check in.', allowed_radius_meters
      using errcode = '22023';
  end if;

  if p_trail_id is not null and not exists (
    select 1 from public.trails as t
    where t.id = p_trail_id and t.mountain_id = p_mountain_id and t.published = true
  ) then
    raise exception 'Published trail not found for this mountain' using errcode = 'P0002';
  end if;

  insert into public.check_ins (user_id, mountain_id, trail_id, note, points, status)
  values (auth.uid(), p_mountain_id, p_trail_id, clean_note, awarded_points, 'approved')
  returning * into inserted_check_in;

  insert into public.check_in_verifications (
    check_in_id, user_id, location, distance_to_summit_meters,
    location_accuracy_meters, verification_metadata
  ) values (
    inserted_check_in.id,
    auth.uid(),
    submitted_location,
    summit_distance_meters,
    p_accuracy,
    jsonb_build_object('method', 'browser-geolocation', 'verifiedAt', now())
  );

  return inserted_check_in;
end;
$$;

revoke all on function public.create_mountain_check_in(text, text, text, numeric, numeric, numeric) from public, anon;
grant execute on function public.create_mountain_check_in(text, text, text, numeric, numeric, numeric) to authenticated;

create or replace function public.delete_own_check_in(p_check_in_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Sign in required' using errcode = '42501';
  end if;

  delete from public.check_ins as c
  where c.id = p_check_in_id and c.user_id = auth.uid();

  if not found then
    raise exception 'Check-in not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.delete_own_check_in(uuid) from public, anon;
grant execute on function public.delete_own_check_in(uuid) to authenticated;

create or replace function public.create_trail_comment(
  p_mountain_id text,
  p_trail_id text,
  p_body text
)
returns public.comments
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_comment public.comments;
  clean_body text := btrim(coalesce(p_body, ''));
  link_count integer;
begin
  perform public.require_current_terms_acceptance();

  if char_length(clean_body) not between 2 and 1200 then
    raise exception 'Comments must be between 2 and 1200 characters' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.trails as t
    where t.id = p_trail_id
      and t.mountain_id = p_mountain_id
      and t.published = true
  ) then
    raise exception 'Published trail not found' using errcode = 'P0002';
  end if;

  if (
    select count(*) from public.comments as c
    where c.user_id = auth.uid() and c.created_at > now() - interval '10 minutes'
  ) >= 3 then
    raise exception 'Please wait before posting another comment' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.comments as c
    where c.user_id = auth.uid()
      and c.trail_id = p_trail_id
      and lower(btrim(c.body)) = lower(clean_body)
      and c.created_at > now() - interval '24 hours'
  ) then
    raise exception 'This comment was already posted' using errcode = '23505';
  end if;

  link_count := (
    char_length(lower(clean_body)) - char_length(replace(lower(clean_body), 'http', ''))
  ) / 4;

  if link_count > 2 then
    raise exception 'Comments can contain at most two links' using errcode = '22023';
  end if;

  insert into public.comments (
    user_id, mountain_id, trail_id, body, status, visibility_status
  ) values (
    auth.uid(), p_mountain_id, p_trail_id, clean_body, 'approved', 'published'
  ) returning * into inserted_comment;

  return inserted_comment;
end;
$$;

revoke all on function public.create_trail_comment(text, text, text) from public, anon;
grant execute on function public.create_trail_comment(text, text, text) to authenticated;

create or replace function public.delete_own_comment(p_comment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Sign in required' using errcode = '42501';
  end if;

  update public.comments as c
  set
    status = 'rejected',
    visibility_status = 'removed',
    deleted_at = now(),
    deleted_by_author = true
  where c.id = p_comment_id and c.user_id = auth.uid();

  if not found then
    raise exception 'Comment not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.delete_own_comment(uuid) from public, anon;
grant execute on function public.delete_own_comment(uuid) to authenticated;

create or replace function public.submit_content_report(
  p_content_type text,
  p_target_id uuid,
  p_reason text,
  p_details text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  report_id uuid;
  clean_details text := nullif(btrim(coalesce(p_details, '')), '');
  target_snapshot jsonb;
begin
  perform public.require_current_terms_acceptance();

  if p_content_type <> 'comment' then
    raise exception 'This content type cannot be reported here' using errcode = '22023';
  end if;

  if p_reason not in ('spam', 'harassment', 'dangerous', 'misleading', 'privacy', 'illegal', 'copyright', 'other') then
    raise exception 'Choose a valid report reason' using errcode = '22023';
  end if;

  if clean_details is not null and char_length(clean_details) > 500 then
    raise exception 'Report details must be 500 characters or fewer' using errcode = '22023';
  end if;

  select jsonb_build_object(
    'body', c.body,
    'userId', c.user_id,
    'trailId', c.trail_id,
    'mountainId', c.mountain_id,
    'createdAt', c.created_at
  )
  into target_snapshot
  from public.comments as c
  where c.id = p_target_id and c.status = 'approved' and c.visibility_status = 'published';

  if target_snapshot is null then
    raise exception 'Comment not found' using errcode = 'P0002';
  end if;

  if target_snapshot->>'userId' = auth.uid()::text then
    raise exception 'You cannot report your own comment' using errcode = '22023';
  end if;

  if (
    select count(*) from public.content_reports as r
    where r.reporter_user_id = auth.uid() and r.created_at > now() - interval '1 hour'
  ) >= 5 then
    raise exception 'Please wait before submitting another report' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.content_reports as r
    where r.reporter_user_id = auth.uid()
      and r.content_type = p_content_type
      and r.target_id = p_target_id
      and r.status in ('open', 'under_review')
  ) then
    raise exception 'You already reported this comment' using errcode = '23505';
  end if;

  insert into public.content_reports (
    reporter_user_id, content_type, target_id, reason, details, content_snapshot
  ) values (
    auth.uid(), p_content_type, p_target_id, p_reason, clean_details, target_snapshot
  ) returning id into report_id;

  return report_id;
end;
$$;

revoke all on function public.submit_content_report(text, uuid, text, text) from public, anon;
grant execute on function public.submit_content_report(text, uuid, text, text) to authenticated;

create or replace function public.create_hike_recommendation(
  p_title text,
  p_body text,
  p_difficulty public.difficulty_level
)
returns public.user_hikes
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_hike public.user_hikes;
  clean_title text := btrim(coalesce(p_title, ''));
  clean_body text := nullif(btrim(coalesce(p_body, '')), '');
begin
  perform public.require_current_terms_acceptance();

  if char_length(clean_title) not between 4 and 80 then
    raise exception 'Recommendation titles must be between 4 and 80 characters' using errcode = '22023';
  end if;

  if clean_body is not null and char_length(clean_body) > 1200 then
    raise exception 'Recommendation details must be 1200 characters or fewer' using errcode = '22023';
  end if;

  if (
    select count(*) from public.user_hikes as h
    where h.user_id = auth.uid() and h.created_at > now() - interval '1 hour'
  ) >= 3 then
    raise exception 'Please wait before submitting another recommendation' using errcode = 'P0001';
  end if;

  insert into public.user_hikes (user_id, title, body, difficulty, status)
  values (auth.uid(), clean_title, clean_body, p_difficulty, 'pending')
  returning * into inserted_hike;

  return inserted_hike;
end;
$$;

revoke all on function public.create_hike_recommendation(text, text, public.difficulty_level) from public, anon;
grant execute on function public.create_hike_recommendation(text, text, public.difficulty_level) to authenticated;

create or replace function public.withdraw_hike_recommendation(p_hike_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_hike public.user_hikes;
begin
  if auth.uid() is null then
    raise exception 'Sign in required' using errcode = '42501';
  end if;

  select * into saved_hike
  from public.user_hikes as h
  where h.id = p_hike_id and h.user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Recommendation not found' using errcode = 'P0002';
  end if;

  if saved_hike.status in ('pending', 'rejected') then
    delete from public.user_hikes where id = p_hike_id;
    return 'deleted';
  end if;

  update public.user_hikes
  set status = 'rejected', removal_requested_at = now(), removed_at = now()
  where id = p_hike_id;

  insert into public.moderation_actions (
    actor_user_id, content_type, target_id, action, public_reason, content_snapshot
  ) values (
    auth.uid(), 'hike_recommendation', p_hike_id::text, 'author_removed',
    'Removed by the author',
    jsonb_build_object('title', saved_hike.title, 'body', saved_hike.body, 'status', saved_hike.status)
  );

  return 'removed';
end;
$$;

revoke all on function public.withdraw_hike_recommendation(uuid) from public, anon;
grant execute on function public.withdraw_hike_recommendation(uuid) to authenticated;

create or replace function public.submit_route_correction(
  p_trail_id text,
  p_category text,
  p_affected_section text,
  p_details text,
  p_source_url text default null,
  p_observed_on date default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  correction_id uuid;
  clean_details text := btrim(coalesce(p_details, ''));
  clean_source text := nullif(btrim(coalesce(p_source_url, '')), '');
begin
  perform public.require_current_terms_acceptance();

  if p_category not in (
    'route_description', 'map_gpx', 'trailhead', 'parking_access', 'difficulty',
    'duration_distance', 'safety', 'broken_link', 'other'
  ) then
    raise exception 'Choose a valid correction category' using errcode = '22023';
  end if;

  if char_length(clean_details) not between 20 and 2000 then
    raise exception 'Correction details must be between 20 and 2000 characters' using errcode = '22023';
  end if;

  if clean_source is not null and clean_source !~* '^https?://' then
    raise exception 'Source links must start with http:// or https://' using errcode = '22023';
  end if;

  if not exists (select 1 from public.trails where id = p_trail_id and published = true) then
    raise exception 'Published trail not found' using errcode = 'P0002';
  end if;

  if (
    select count(*) from public.route_corrections as rc
    where rc.submitter_user_id = auth.uid() and rc.created_at > now() - interval '1 hour'
  ) >= 5 then
    raise exception 'Please wait before submitting another correction' using errcode = 'P0001';
  end if;

  insert into public.route_corrections (
    trail_id, submitter_user_id, category, affected_section, details, source_url, observed_on
  ) values (
    p_trail_id,
    auth.uid(),
    p_category,
    nullif(left(btrim(coalesce(p_affected_section, '')), 120), ''),
    clean_details,
    clean_source,
    p_observed_on
  ) returning id into correction_id;

  return correction_id;
end;
$$;

revoke all on function public.submit_route_correction(text, text, text, text, text, date) from public, anon;
grant execute on function public.submit_route_correction(text, text, text, text, text, date) to authenticated;

create or replace function public.delete_my_account(p_confirmation text)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
  issued_at bigint := coalesce((auth.jwt()->>'iat')::bigint, 0);
begin
  if current_user_id is null then
    raise exception 'Sign in required' using errcode = '42501';
  end if;

  if p_confirmation is distinct from 'DELETE' then
    raise exception 'Type DELETE to confirm account deletion' using errcode = '22023';
  end if;

  if issued_at = 0 or extract(epoch from now())::bigint - issued_at > 900 then
    raise exception 'Recent sign-in required. Sign out, sign in again, and retry within 15 minutes.'
      using errcode = '42501';
  end if;

  delete from auth.users as u where u.id = current_user_id;

  if not found then
    raise exception 'Account not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.delete_my_account(text) from public, anon;
grant execute on function public.delete_my_account(text) to authenticated;

-- Admin-only queues and actions.
create or replace view public.admin_comment_report_queue
with (security_invoker = true) as
select
  r.id as report_id,
  r.reason,
  r.details,
  r.status as report_status,
  r.created_at as reported_at,
  r.resolved_at,
  r.resolution_note,
  r.target_id as comment_id,
  (c.id is not null) as comment_available,
  coalesce(c.body, r.content_snapshot->>'body', '[Comment no longer available]') as comment_body,
  coalesce(c.visibility_status, 'removed') as visibility_status,
  coalesce(c.created_at, (r.content_snapshot->>'createdAt')::timestamptz) as comment_created_at,
  coalesce(c.trail_id, r.content_snapshot->>'trailId') as trail_id,
  t.name as trail_name,
  t.slug as trail_slug,
  coalesce(nullif(btrim(author.display_name), ''), author.username, 'Deleted user') as author_name
from public.content_reports as r
left join public.comments as c on c.id = r.target_id
left join public.profiles as author on author.id = coalesce(
  c.user_id,
  nullif(r.content_snapshot->>'userId', '')::uuid
)
left join public.trails as t on t.id = coalesce(c.trail_id, r.content_snapshot->>'trailId')
where r.content_type = 'comment'
  and public.is_admin();

create or replace view public.admin_user_hike_queue
with (security_invoker = true) as
select
  h.id,
  h.title,
  h.body,
  h.difficulty,
  h.status,
  h.created_at,
  h.removal_requested_at,
  coalesce(nullif(btrim(p.display_name), ''), p.username, 'Hiker') as author_name
from public.user_hikes as h
left join public.profiles as p on p.id = h.user_id
where (h.status = 'pending' or h.removal_requested_at is not null)
  and public.is_admin();

create or replace view public.admin_route_correction_queue
with (security_invoker = true) as
select
  rc.id,
  rc.trail_id,
  t.name as trail_name,
  t.slug as trail_slug,
  rc.category,
  rc.affected_section,
  rc.details,
  rc.source_url,
  rc.observed_on,
  rc.status,
  rc.created_at,
  coalesce(nullif(btrim(p.display_name), ''), p.username, 'Hiker') as submitter_name
from public.route_corrections as rc
join public.trails as t on t.id = rc.trail_id
left join public.profiles as p on p.id = rc.submitter_user_id
where rc.status in ('submitted', 'under_review')
  and public.is_admin();

grant select on public.admin_comment_report_queue to authenticated;
grant select on public.admin_user_hike_queue to authenticated;
grant select on public.admin_route_correction_queue to authenticated;

create or replace function public.admin_moderate_comment(
  p_comment_id uuid,
  p_action text,
  p_report_id uuid default null,
  p_public_reason text default null,
  p_internal_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_comment public.comments;
  clean_note text := nullif(btrim(coalesce(p_internal_note, '')), '');
  report_snapshot jsonb := '{}'::jsonb;
  comment_exists boolean := false;
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  if p_report_id is not null then
    select r.content_snapshot into report_snapshot
    from public.content_reports as r
    where r.id = p_report_id and r.target_id = p_comment_id
    for update;

    if not found then
      raise exception 'Comment report not found' using errcode = 'P0002';
    end if;
  end if;

  select * into saved_comment from public.comments where id = p_comment_id for update;
  comment_exists := found;

  if p_action not in ('under_review', 'publish', 'hide', 'remove', 'no_action') then
    raise exception 'Choose a valid moderation action' using errcode = '22023';
  end if;

  if p_action in ('publish', 'hide', 'remove', 'no_action') and clean_note is null then
    raise exception 'Add a decision note before completing moderation' using errcode = '22023';
  end if;

  if not comment_exists and (p_report_id is null or p_action in ('publish', 'hide')) then
    raise exception 'Comment is no longer available' using errcode = 'P0002';
  end if;

  if p_action = 'publish' then
    if saved_comment.deleted_by_author then
      raise exception 'An author-deleted comment cannot be restored' using errcode = '22023';
    end if;

    update public.comments
    set status = 'approved', visibility_status = 'published', deleted_at = null
    where id = p_comment_id;
  elsif p_action = 'hide' then
    update public.comments set status = 'rejected', visibility_status = 'hidden' where id = p_comment_id;
  elsif p_action = 'remove' and comment_exists then
    update public.comments set status = 'rejected', visibility_status = 'removed', deleted_at = now() where id = p_comment_id;
  end if;

  if p_report_id is not null then
    update public.content_reports
    set
      status = case
        when p_action = 'under_review' then 'under_review'
        when p_action = 'no_action' then 'no_action_required'
        else 'action_taken'
      end,
      resolved_at = case when p_action = 'under_review' then null else now() end,
      resolved_by = case when p_action = 'under_review' then null else auth.uid() end,
      resolution_note = clean_note
    where id = p_report_id and target_id = p_comment_id;

  elsif p_action = 'under_review' then
    raise exception 'A report is required to start review' using errcode = '22023';
  end if;

  insert into public.moderation_actions (
    actor_user_id, content_type, target_id, action, public_reason, internal_note, content_snapshot
  ) values (
    auth.uid(), 'comment', p_comment_id::text, p_action,
    nullif(btrim(coalesce(p_public_reason, '')), ''),
    clean_note,
    case
      when comment_exists then jsonb_build_object(
        'body', saved_comment.body,
        'status', saved_comment.status,
        'visibilityStatus', saved_comment.visibility_status,
        'userId', saved_comment.user_id,
        'trailId', saved_comment.trail_id
      )
      else report_snapshot
    end
  );
end;
$$;

revoke all on function public.admin_moderate_comment(uuid, text, uuid, text, text) from public, anon;
grant execute on function public.admin_moderate_comment(uuid, text, uuid, text, text) to authenticated;

create or replace function public.admin_moderate_hike_recommendation(
  p_hike_id uuid,
  p_action text,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_hike public.user_hikes;
  clean_note text := nullif(btrim(coalesce(p_note, '')), '');
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  select * into saved_hike from public.user_hikes where id = p_hike_id for update;
  if not found then
    raise exception 'Recommendation not found' using errcode = 'P0002';
  end if;

  if clean_note is null then
    raise exception 'Add a decision note before completing moderation' using errcode = '22023';
  end if;

  if p_action = 'approve' then
    update public.user_hikes set status = 'approved', removal_requested_at = null, removed_at = null where id = p_hike_id;
  elsif p_action = 'reject' then
    update public.user_hikes set status = 'rejected' where id = p_hike_id;
  elsif p_action = 'remove' then
    update public.user_hikes set status = 'rejected', removed_at = now() where id = p_hike_id;
  else
    raise exception 'Choose a valid moderation action' using errcode = '22023';
  end if;

  insert into public.moderation_actions (
    actor_user_id, content_type, target_id, action, internal_note, content_snapshot
  ) values (
    auth.uid(), 'hike_recommendation', p_hike_id::text, p_action,
    clean_note,
    jsonb_build_object('title', saved_hike.title, 'body', saved_hike.body, 'status', saved_hike.status)
  );
end;
$$;

revoke all on function public.admin_moderate_hike_recommendation(uuid, text, text) from public, anon;
grant execute on function public.admin_moderate_hike_recommendation(uuid, text, text) to authenticated;

create or replace function public.admin_review_route_correction(
  p_correction_id uuid,
  p_action text,
  p_resolution_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_correction public.route_corrections;
  clean_note text := nullif(btrim(coalesce(p_resolution_note, '')), '');
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  select * into saved_correction from public.route_corrections where id = p_correction_id for update;
  if not found then
    raise exception 'Correction report not found' using errcode = 'P0002';
  end if;

  if p_action not in ('under_review', 'accepted', 'rejected', 'closed') then
    raise exception 'Choose a valid review action' using errcode = '22023';
  end if;

  if p_action in ('accepted', 'rejected', 'closed') and clean_note is null then
    raise exception 'Add a resolution note before completing review' using errcode = '22023';
  end if;

  update public.route_corrections
  set
    status = p_action,
    resolved_at = case when p_action in ('accepted', 'rejected', 'closed') then now() else null end,
    resolved_by = case when p_action in ('accepted', 'rejected', 'closed') then auth.uid() else null end,
    resolution_note = clean_note
  where id = p_correction_id;

  insert into public.moderation_actions (
    actor_user_id, content_type, target_id, action, internal_note, content_snapshot
  ) values (
    auth.uid(), 'route_correction', p_correction_id::text, p_action,
    clean_note,
    jsonb_build_object(
      'trailId', saved_correction.trail_id,
      'category', saved_correction.category,
      'details', saved_correction.details,
      'status', saved_correction.status
    )
  );
end;
$$;

revoke all on function public.admin_review_route_correction(uuid, text, text) from public, anon;
grant execute on function public.admin_review_route_correction(uuid, text, text) to authenticated;

create or replace function public.admin_update_route_review(
  p_trail_id text,
  p_review_status text,
  p_last_reviewed_at date,
  p_reviewed_by text,
  p_next_review_due date
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

  if p_review_status not in ('unreviewed', 'reviewed', 'needs_review') then
    raise exception 'Choose a valid route review status' using errcode = '22023';
  end if;

  if p_review_status = 'reviewed' and p_last_reviewed_at is null then
    raise exception 'A review date is required for reviewed routes' using errcode = '22023';
  end if;

  update public.trails
  set
    review_status = p_review_status,
    last_reviewed_at = p_last_reviewed_at,
    reviewed_by = nullif(left(btrim(coalesce(p_reviewed_by, '')), 120), ''),
    next_review_due = p_next_review_due
  where id = p_trail_id;

  if not found then
    raise exception 'Trail not found' using errcode = 'P0002';
  end if;

  insert into public.moderation_actions (
    actor_user_id, content_type, target_id, action, internal_note, content_snapshot
  ) values (
    auth.uid(),
    'trail_review',
    p_trail_id,
    'review_metadata_updated',
    nullif(left(btrim(coalesce(p_reviewed_by, '')), 120), ''),
    jsonb_build_object(
      'reviewStatus', p_review_status,
      'lastReviewedAt', p_last_reviewed_at,
      'nextReviewDue', p_next_review_due
    )
  );
end;
$$;

revoke all on function public.admin_update_route_review(text, text, date, text, date) from public, anon;
grant execute on function public.admin_update_route_review(text, text, date, text, date) to authenticated;

-- Rebuild guide views so public route freshness and admin review fields are available.
drop view if exists public.admin_mountain_guides;
drop view if exists public.mountain_guides;

create view public.mountain_guides
with (security_invoker = true) as
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
  t.safety_notes,
  t.guide,
  t.published as trail_published,
  t.last_reviewed_at,
  t.review_status,
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
left join public.trails as t on t.mountain_id = m.id and t.published = true
left join public.trail_images as ti on ti.trail_id = t.id
where m.published = true
group by m.id, t.id;

create view public.admin_mountain_guides
with (security_barrier = true) as
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
where public.is_admin()
group by m.id, t.id;

grant select on public.mountain_guides to anon, authenticated;
grant select on public.admin_mountain_guides to authenticated;

commit;

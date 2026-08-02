-- Keep summit check-ins close enough to represent reaching the peak while
-- allowing for normal phone GPS accuracy.

begin;

update public.mountains
set check_in_radius_meters = 200
where check_in_radius_meters > 200;

alter table public.mountains
  drop constraint if exists mountains_check_in_radius_range;

alter table public.mountains
  add constraint mountains_check_in_radius_range
  check (check_in_radius_meters between 25 and 200);

commit;

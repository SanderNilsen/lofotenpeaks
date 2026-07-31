-- One-time wording migration for existing Supabase content.
-- This is safe to run more than once: each replacement only matches the old text.

begin;

update public.mountains
set description = replace(description, 'in eastern Lofoten', 'near Henningsvær')
where id = 'festvagtind'
  and description like '%in eastern Lofoten%';

update public.mountains
set description = replace(description, 'in central Lofoten', 'on Vestvågøya')
where id = 'himmeltindan'
  and description like '%in central Lofoten%';

update public.mountains
set summary = replace(summary, 'eastern Lofoten', 'Austvågøya')
where id = 'glomtinden'
  and summary like '%eastern Lofoten%';

update public.mountains
set
  summary = replace(summary, 'over central Lofoten', 'across Vestvågøya'),
  description = replace(description, 'central Lofoten summit', 'Vestvågøya summit')
where id = 'justadtinden'
  and (
    summary like '%over central Lofoten%'
    or description like '%central Lofoten summit%'
  );

update public.trails
set description = replace(description, 'in central Lofoten', 'on Vestvågøya')
where id = 'himmeltindan'
  and description like '%in central Lofoten%';

update public.trails
set summary = replace(summary, 'central Lofoten', 'Vestvågøya')
where id = 'justadtinden'
  and summary like '%central Lofoten%';

update public.trails
set description = replace(
  description,
  'central and western Lofoten',
  'Flakstadøya, Vestvågøya and the surrounding fjords'
)
where id = 'stornappstinden'
  and description like '%central and western Lofoten%';

commit;

-- A successful migration returns no rows from this verification query.
select 'mountain' as content_type, id, summary, description
from public.mountains
where concat_ws(' ', summary, description) ~* '(western|central|eastern) Lofoten'
union all
select 'trail' as content_type, id, summary, description
from public.trails
where concat_ws(' ', summary, description) ~* '(western|central|eastern) Lofoten';

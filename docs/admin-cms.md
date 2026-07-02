# Admin CMS Setup

The frontend has an `/admin` route for adding and updating mountain guides in Supabase instead of editing static files.

## Database Setup

Run the admin layer after the base schema and seed have already been applied:

```bash
npx -y supabase db query --linked --file supabase/admin.sql
```

If the CLI is not logged in, either run `npx -y supabase login` first, or paste `supabase/admin.sql` into the Supabase SQL editor.

If existing seeded trails are missing planning notes after adding the admin CMS fields, run:

```bash
npx -y supabase db query --linked --file supabase/guide-notes.sql
```

## Grant Admin Access

After `supabase/admin.sql` has been applied, add your own logged-in account to `public.admin_users`.

```sql
insert into public.admin_users (user_id)
select id
from auth.users
where email = 'your-email@example.com'
on conflict do nothing;
```

The `/admin` page checks this table before allowing content changes.

## What Admin Can Manage

The current admin screen supports:

- creating one mountain with one matching trail
- editing existing mountain/trail guide fields
- summit and trailhead coordinates
- difficulty, height, route summary, route note, and description
- planning notes for parking, trailhead, best season, suitable audience, gear, access, and before-you-go checklist
- safety notes shown on the public hiking guide page
- GPX upload for replacing straight route lines with parsed route coordinates
- one hero image uploaded to the `mountain-images` Supabase Storage bucket
- gallery images stored in Supabase Storage and registered in `public.trail_images`
- editing, deleting, and reordering gallery image metadata
- optional image source, license, and credit URL metadata

Deleting whole guides, multiple trails per mountain, and moderation tools should come after the basic create/edit flow is working.

GPX files are stored in the private `trail-gpx` bucket. The public site reads the parsed `route_geojson` value from the `mountain_guides` view, not the raw GPX file.

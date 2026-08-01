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

Community check-ins and leaderboard progress use a separate SQL layer:

```bash
npx -y supabase db query --linked --file supabase/community.sql
```

Finally, apply every file in `supabase/migrations` in filename order. The current privacy and moderation migration is
required: it removes precise coordinates from public check-in rows and installs the legal, reporting, deletion,
moderation, correction, and route-review controls. See `docs/database-operations.md` for the deployment checklist.

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
- publishing and drafting guides
- deleting whole guides when their connected community records can also be removed
- summit and trailhead coordinates
- summit check-in radius and points awarded per check-in
- difficulty, height, route summary, route note, and description
- planning notes for parking, trailhead, best season, suitable audience, gear, access, and before-you-go checklist
- safety notes shown on the public hiking guide page
- editorial route-review status, last-reviewed date, reviewer, and optional next-review date
- GPX upload for replacing straight route lines with parsed route coordinates
- gallery images stored in Supabase Storage and registered in `public.trail_images`
- selecting one gallery image as the mountain hero image
- editing, deleting, and reordering gallery image metadata
- optional image source, license, and credit URL metadata
- reviewing reported comments, hiding/removing/restoring comments, and recording private decision notes
- approving or rejecting text hike recommendations and confirming author removal requests
- reviewing route-correction submissions

The moderation workspace is available under the **Community review** tab. It is protected by server-side admin checks;
the route is not the security boundary.

GPX files are stored in the private `trail-gpx` bucket. The public site reads the parsed `route_geojson` value from the `mountain_guides` view, not the raw GPX file.

The public site reads from `public.mountain_guides`, which only returns published content and excludes private GPX paths
and internal reviewer details. The admin page reads from `public.admin_mountain_guides`, which returns drafts and those
internal fields only when `public.is_admin()` succeeds.

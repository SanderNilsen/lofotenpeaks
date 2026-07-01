# Admin CMS Setup

The frontend has an `/admin` route for adding and updating mountain guides in Supabase instead of editing static files.

## Database Setup

Run the admin layer after the base schema and seed have already been applied:

```bash
npx -y supabase db query --linked --file supabase/admin.sql
```

If the CLI is not logged in, either run `npx -y supabase login` first, or paste `supabase/admin.sql` into the Supabase SQL editor.

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
- one hero image uploaded to the `mountain-images` Supabase Storage bucket
- gallery images stored in Supabase Storage and registered in `public.trail_images`
- optional image source, license, and credit URL metadata

GPX upload, deleting guides, multiple trails per mountain, and moderation tools should come after the basic create/edit flow is working.

# Admin CMS Setup

The frontend has an `/admin` route for adding mountain guides to Supabase instead of editing static files.

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

The `/admin` page checks this table before allowing mountain uploads.

## What Admin Can Create

The first version creates:

- one mountain
- one matching trail
- summit and trailhead coordinates
- difficulty, height, route summary, route note, and description
- one hero image uploaded to the `mountain-images` Supabase Storage bucket

Gallery images, GPX upload, editing existing guides, and deleting guides should come after the basic create flow is working.

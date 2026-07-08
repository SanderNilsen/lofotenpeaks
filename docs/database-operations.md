# Database Operations

This project uses Supabase as the backend for auth, guide content, check-ins, comments, user hikes, poster routes, and future shop orders.

## SQL Files

- `supabase/schema.sql`: base schema for a new Supabase project
- `supabase/admin.sql`: admin CMS policies, views, storage buckets, and admin RPC functions
- `supabase/community.sql`: check-in RPC and leaderboard progress view
- `supabase/guide-notes.sql`: one-time content patch for existing MVP guide planning notes
- `supabase/seed.sql`: one-time starter mountain/trail records; conflicts are ignored so Admin edits are not overwritten

## Apply Order

For a fresh project, run:

```bash
npx -y supabase db query --linked --file supabase/schema.sql
npx -y supabase db query --linked --file supabase/seed.sql
npx -y supabase db query --linked --file supabase/admin.sql
npx -y supabase db query --linked --file supabase/community.sql
npx -y supabase db query --linked --file supabase/guide-notes.sql
```

After the first import, do not use `seed.sql` as the normal way to update guide content. Edit mountains, trails, GPX routes, images, and guide notes through `/admin` so Supabase remains the live source of truth. Re-running `seed.sql` only inserts missing starter records because it uses `on conflict do nothing`.

For the existing project, run only the files that changed. After this update:

```bash
npx -y supabase db query --linked --file supabase/admin.sql
npx -y supabase db query --linked --file supabase/community.sql
```

The same SQL can also be pasted into the Supabase SQL editor if the CLI is unavailable.

## Backup Before Larger Changes

Before running destructive migrations or changing policies, create a backup:

1. Open Supabase Dashboard.
2. Go to Project Settings -> Database -> Backups.
3. Download or restore from the latest backup depending on your plan.

For local records of schema/data changes, you can also dump the linked database:

```bash
mkdir -p supabase/backups
npx -y supabase db dump --linked --file supabase/backups/latest.sql
```

Do not commit real `.env.local`, Supabase tokens, service role keys, or exported private user data.

## Safety Rules

- Prefer publishing/drafting guides over deleting them.
- Delete a guide only when its connected check-ins and comments can also be removed.
- Keep user-submitted hikes in `pending` until admin moderation exists.
- Keep poster routes private to the owner until a real checkout/fulfillment flow exists.
- Run `npm run build` after frontend or SQL API changes that affect page data.

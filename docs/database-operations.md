# Database Operations

This project uses Supabase as the backend for auth, guide content, check-ins, comments, and user hikes.

## SQL Files

- `supabase/schema.sql`: base schema for a new Supabase project
- `supabase/admin.sql`: admin CMS policies, views, storage buckets, and admin RPC functions
- `supabase/community.sql`: check-in RPC and leaderboard progress view
- `supabase/migrations/20260801000000_privacy_safety_moderation.sql`: private location evidence, versioned legal acceptance, self-service account controls, reporting, moderation, and route review dates
- `supabase/migrations/20260801000001_legacy_check_in_compatibility.sql`: temporary five-argument check-in RPC compatibility without re-exposing location evidence
- `supabase/migrations/20260801000002_admin_guide_view_security_invoker.sql`: makes the admin guide view enforce the querying user's permissions and RLS policies
- `supabase/migrations/20260801000003_secure_admin_guide_reader.sql`: preserves the admin view contract while keeping private guide fields behind a server-side admin check
- `supabase/tests/privacy_safety_access.sql`: read-only assertions for critical grants, RLS, and RPC access
- `supabase/tests/privacy_safety_behaviour.sql`: rollback-only owner/admin, moderation, rate-limit, and deletion behaviour tests
- `scripts/verify-public-privacy.sh`: direct anonymous REST test proving precise coordinate queries are blocked

## Apply Order

For a fresh project, run:

```bash
npx -y supabase db query --linked --file supabase/schema.sql
npx -y supabase db query --linked --file supabase/admin.sql
npx -y supabase db query --linked --file supabase/community.sql
npx -y supabase db query --linked --file supabase/migrations/20260801000000_privacy_safety_moderation.sql
npx -y supabase db query --linked --file supabase/migrations/20260801000001_legacy_check_in_compatibility.sql
npx -y supabase db query --linked --file supabase/migrations/20260801000002_admin_guide_view_security_invoker.sql
npx -y supabase db query --linked --file supabase/migrations/20260801000003_secure_admin_guide_reader.sql
npx -y supabase db query --linked --file supabase/tests/privacy_safety_access.sql
npx -y supabase db query --linked --file supabase/tests/privacy_safety_behaviour.sql
npm run verify:public-privacy
```

After setup, create and edit mountains, trails, GPX routes, images, and guide notes through `/admin` so Supabase remains the live source of truth. A fresh project starts without guide content until an administrator adds it.

For the existing project, take a database backup and then run:

```bash
npx -y supabase db query --linked --file supabase/migrations/20260801000000_privacy_safety_moderation.sql
npx -y supabase db query --linked --file supabase/migrations/20260801000001_legacy_check_in_compatibility.sql
npx -y supabase db query --linked --file supabase/migrations/20260801000002_admin_guide_view_security_invoker.sql
npx -y supabase db query --linked --file supabase/migrations/20260801000003_secure_admin_guide_reader.sql
npx -y supabase db query --linked --file supabase/tests/privacy_safety_access.sql
npx -y supabase db query --linked --file supabase/tests/privacy_safety_behaviour.sql
npm run verify:public-privacy
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
- Review pending hike recommendations, comment reports, and route corrections in `/admin`.
- Keep administrator GPX originals in the private `trail-gpx` bucket; publish only parsed route geometry.
- Never add precise check-in coordinates back to `public.check_ins` or a public view.
- Treat the legacy check-in wrapper as temporary frontend compatibility, not permission to weaken privacy controls.
- Run `npm run build` after frontend or SQL API changes that affect page data.

## Emergency Frontend Rollback

If the previous frontend must be redeployed after the privacy migration, apply:

```bash
npx -y supabase db query --linked --file supabase/migrations/20260801000001_legacy_check_in_compatibility.sql
```

This restores the old five-argument check-in RPC only. It intentionally preserves private location storage and the new
access controls. A full database rollback must use a verified backup and a separately reviewed migration.

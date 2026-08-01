# Lofoten Peaks

Lofoten Peaks is being rebuilt as a React information site for mountains and hiking trails in Lofoten, Norway.

## Stack

- React
- Vite
- styled-components
- React Router
- React Leaflet + OpenStreetMap tiles
- Supabase for auth, database, and storage

## Backend Direction

Supabase is the live source of truth for published mountain guides and account features. Static records in `src/data`
remain as a development fallback when Supabase is not configured.

The current backend includes:

- Supabase Auth for registration/login
- Postgres tables for mountains, trails, user hikes, and comments
- Supabase Storage for administrator-managed guide images and private guide GPX files
- Row Level Security for permissions
- Check-ins and leaderboard tables/views
- Private summit-location verification records separated from public check-in activity
- Versioned Terms acceptance, contribution removal, comment reporting, route corrections, and admin moderation

See:

- `docs/backend-auth-plan.md`
- `docs/admin-cms.md`
- `docs/database-operations.md`
- `supabase/schema.sql`
- `supabase/migrations/20260801000000_privacy_safety_moderation.sql`
- `supabase/migrations/20260801000003_secure_admin_guide_reader.sql`

## Project Structure

```txt
public/
  images/
src/
  components/
    common/
    layout/
    mountains/
    trails/
  data/
  features/
    auth/
    home/
    mountains/
    trails/
  lib/
    supabase/
  styles/
supabase/
```

## Running Locally

```bash
npm install
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env.local` when a Supabase project is ready:

```bash
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

The site still builds without these values. Backend calls should only be used after the variables are configured locally
and in the production deployment secrets.

## Build

```bash
npm run build
```

After applying database privacy migrations, verify the anonymous API boundary:

```bash
npm run verify:public-privacy
```

## Content Note

Starter records must remain drafts until exact coordinates, route geometry, distances, difficulty, access, and safety
notes have been reviewed. Public users can submit route corrections, but only an administrator can change or publish a
guide, its GPX route, or its photos.

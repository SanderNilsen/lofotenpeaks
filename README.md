# Lofoten Peaks

Lofoten Peaks is being rebuilt as a React information site for mountains and hiking trails in Lofoten, Norway.

## Stack

- React
- Vite
- styled-components
- React Router
- React Leaflet + OpenStreetMap tiles
- Supabase planned for auth, database, and storage

## Backend Direction

Phase 1 uses static local data in `src/data`. This keeps the MVP simple while the content structure and UI are still changing.

Later phases can move the same data shape into Supabase. The first backend/auth scaffolding is now included:

- Supabase Auth for registration/login
- Postgres tables for mountains, trails, user hikes, and comments
- Supabase Storage for user-uploaded photos
- Row Level Security for permissions
- Check-ins and leaderboard tables/views
- GPX/poster route storage structure

See:

- `docs/backend-auth-plan.md`
- `supabase/schema.sql`

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

The site still builds without these values. Backend calls should only be used after the variables are configured locally and in Netlify.

## Build

```bash
npm run build
```

## Content Note

The current mountain and trail records are starter data for development. Verify exact coordinates, route geometry, distances, difficulty, and safety notes before publishing the site as a real hiking guide.

# Lofoten Peaks

Lofoten Peaks is being rebuilt as a React information site for mountains and hiking trails in Lofoten, Norway.

## Stack

- React
- Vite
- styled-components
- React Router
- React Leaflet + OpenStreetMap tiles

## Backend Direction

Phase 1 uses static local data in `src/data`. This keeps the MVP simple while the content structure and UI are still changing.

Later phases can move the same data shape into Supabase:

- Supabase Auth for registration/login
- Postgres tables for mountains, trails, user hikes, and comments
- Supabase Storage for user-uploaded photos
- Row Level Security for permissions

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
    home/
    mountains/
    trails/
  lib/
  styles/
```

## Running Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Content Note

The current mountain and trail records are starter data for development. Verify exact coordinates, route geometry, distances, difficulty, and safety notes before publishing the site as a real hiking guide.

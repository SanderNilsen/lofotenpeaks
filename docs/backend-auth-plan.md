# Backend and Auth Plan

Recommended backend: Supabase.

Supabase fits this project because it gives us authentication, Postgres data tables, file storage, row-level security, and enough API surface to build the next phases without writing a custom backend immediately.

## Phase 2A - Backend Foundation

Goal: create the backend project and connect the frontend safely.

Tasks:

- Create a Supabase project.
- Run `supabase/schema.sql` in the Supabase SQL editor.
- Create storage buckets:
  - `avatars`
  - `check-in-photos`
  - `user-hike-photos`
  - `gpx-routes`
  - `poster-previews`
- Add frontend environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Add the same environment variables in Netlify.
- Keep existing static mountain/trail data until the database content is verified.

## Phase 2B - Authentication

Goal: users can register, log in, log out, and manage a basic profile.

Frontend tasks:

- Add login/register pages.
- Add auth state provider.
- Add header account menu.
- Add profile page.
- Show signed-in-only actions without blocking public guide pages.

Backend tables:

- `profiles`

Auth rules:

- Public users can read public profile display data.
- Signed-in users can update only their own profile.
- New Supabase Auth users automatically get a profile row.

## Phase 2C - Mountain Check-Ins and Points

Goal: registered users can check in at mountain tops and earn points.

Backend tables:

- `check_ins`
- `leaderboard` view

Recommended first rules:

- 10 points per approved check-in.
- One check-in per user per mountain per day.
- Store optional GPS location and distance to summit.
- Show leaderboard from approved check-ins only.

Anti-cheat can start simple:

- Frontend checks browser geolocation.
- Backend stores submitted coordinates.
- Later, add stricter validation with an Edge Function:
  - Require user to be within a chosen radius of the summit.
  - Reject impossible travel speed between check-ins.
  - Flag suspicious repeated attempts.

## Phase 2D - Comments and User Hikes

Goal: signed-in users can comment and post hike recommendations.

Backend tables:

- `comments`
- `user_hikes`

Recommended moderation:

- Start with comments approved by default if this is a school/personal project.
- Add `status` now so moderation can be introduced later without changing the schema.
- Let users edit their own comments/hikes.
- Public users only see approved comments/hikes.

## Phase 2E - GPS Upload and Poster Routes

Goal: users can upload GPX files for route previews and future custom posters.

Backend tables:

- `poster_routes`
- `shop_orders`

Storage:

- Store original GPX files in `gpx-routes`.
- Store generated poster preview images in `poster-previews`.

Recommended flow:

- User uploads a GPX file.
- Frontend parses it for preview.
- Store the original GPX and a simplified GeoJSON route.
- Later, send poster/order metadata to a payment or print provider.

## Phase 2F - Shop Integration

Goal: sell t-shirts and posters without building a full e-commerce backend from scratch.

Recommended approach:

- Use Stripe Checkout, Shopify, or a print-on-demand provider for payments and fulfillment.
- Store only local references in Supabase:
  - user id
  - poster route id
  - payment provider
  - provider order id
  - order status

Do not store card details in Supabase.

## Data Migration Order

1. Keep static frontend data as the source of truth during setup.
2. Create Supabase tables and storage buckets.
3. Seed mountains and trails from `src/data`.
4. Switch read-only guide pages to fetch from Supabase.
5. Add auth.
6. Add check-ins and leaderboard.
7. Add comments and user hikes.
8. Add GPS uploads and poster routes.
9. Add shop integration.

## Current Implementation State

- Static MVP guide pages remain unchanged for public users.
- Supabase schema is prepared in `supabase/schema.sql`.
- Frontend Supabase client scaffolding lives under `src/lib/supabase`.
- Real backend calls should be added after `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured.

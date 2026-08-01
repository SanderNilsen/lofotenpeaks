# Backend and Auth Architecture

Supabase is the production backend for Lofoten Peaks. It provides email/password authentication, PostgreSQL, Row Level
Security, RPC functions, and storage for administrator-managed guide media.

## Current Scope

- Public mountain guides, parsed route geometry, images, maps, weather, and safety notes
- Email/password accounts and editable profiles
- Location-verified summit check-ins, points, and a leaderboard
- Public comments with owner removal and signed-in reporting
- Moderated text hike recommendations
- Signed-in route corrections reviewed by administrators
- Versioned Terms acceptance and Privacy Policy acknowledgement
- Self-service account deletion after recent authentication
- Admin guide publishing, image/GPX management, route review dates, and moderation queues

## Privacy Boundaries

- Public check-in rows contain activity summaries only.
- Exact coordinates, reported browser accuracy, and calculated summit distance live in `check_in_verifications`.
- Anonymous users have no access to that verification table.
- Signed-in users can read only their own verification evidence; administrators can read it when necessary.
- Original guide GPX files remain in the private `trail-gpx` bucket. Public guide maps use parsed GeoJSON.
- Legal acceptance timestamps and versions are recorded by server-side functions.
- Account deletion removes account-linked records or disconnects the user identity from limited moderation records.

## Contribution Controls

Comments, recommendations, reports, and corrections must use server RPCs. Direct client inserts are revoked so rate
limits, validation, current-Terms checks, and moderation status cannot be bypassed by changing frontend code.

Administrators review:

- reported comments;
- pending or removal-requested hike recommendations; and
- submitted route corrections.

Moderation decisions create a restricted audit record.

## Deliberately Unsupported

The current product does not support user GPX uploads, user photo uploads, ratings, saved hikes, social login, payments,
bookings, a newsletter, or a shop. Do not describe or imitate these features in the frontend without a reviewed backend,
privacy model, moderation process, and retention policy.

## Operational Requirements

1. Apply SQL in the order documented in `docs/database-operations.md`.
2. Run `supabase/tests/privacy_safety_access.sql` after the privacy migration.
3. Verify anonymous REST responses in the production Supabase project before deploying the matching frontend.
4. Review provider regions, processing agreements, log retention, backups, and international transfer safeguards.
5. Define fixed retention periods for moderation records, reports, route corrections, logs, backups, and Analytics.
6. Review route content periodically and record the date in the admin guide editor.

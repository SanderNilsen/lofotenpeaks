# Privacy, Safety, and Moderation Migration

Migrations:

- `supabase/migrations/20260801000000_privacy_safety_moderation.sql`
- `supabase/migrations/20260801000001_legacy_check_in_compatibility.sql`
- `supabase/migrations/20260801000002_admin_guide_view_security_invoker.sql`
- `supabase/migrations/20260801000003_secure_admin_guide_reader.sql`

## What Changes

- Moves precise check-in coordinates, accuracy, and summit distance to a private verification table.
- Removes those fields from public check-in rows.
- Records versioned Terms acceptance and Privacy Policy acknowledgement.
- Requires current Terms acceptance before check-ins or community contributions.
- Adds owner controls for check-ins, comments, recommendations, and account deletion.
- Adds comment reports, route corrections, admin moderation queues, and moderation audit records.
- Adds route review status and review dates to guide records.
- Makes the administrator guide view evaluate permissions and RLS as the querying user.
- Reads private admin guide fields through a narrowly granted function with an explicit server-side admin check.

## Production Procedure

1. Confirm the latest Supabase backup is restorable.
2. Pause frontend deployment until the migration and assertions pass.
3. Apply the migration after `schema.sql`, `admin.sql`, and `community.sql` are already present.
4. Run `supabase/tests/privacy_safety_access.sql` and the rollback-only `privacy_safety_behaviour.sql` test.
5. Verify the anonymous REST role cannot select `check_in_verifications` or request a `location` field from `check_ins`.
6. Deploy the matching frontend.
7. Test registration, existing-user Terms acceptance, check-in, deletion, reporting, correction submission, and admin review.

## Compatibility And Recovery

The compatibility migration restores the old five-argument check-in RPC while preserving all privacy hardening. Use it
only when temporarily redeploying an earlier frontend build. It is not a rollback of the privacy controls. Do not move
precise coordinates back into public activity rows. A complete database rollback requires a verified pre-migration
backup and a separately reviewed recovery plan.

## Manual Decisions Still Required

- Fixed retention periods for verification evidence, reports, moderation records, corrections, logs, backups, and legal records
- Supabase project region, DPA, subprocessors, and international transfer safeguards
- Uniweb log and backup retention
- Google Analytics property settings and retention
- Intended minimum age for account features
- Operational response time for route safety corrections and content reports
- Whether Digital Services Act notice, statement-of-reasons, and appeal duties apply to this service and operating model

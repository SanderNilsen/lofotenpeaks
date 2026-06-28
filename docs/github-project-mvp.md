# Lofoten Peaks MVP Project Board

## Board Fields

- Status: Backlog, Ready, In Progress, Review, Done
- Phase: Phase 0 Review, Phase 1 MVP, Phase 2 Users, Phase 3 Social
- Type: Content, Frontend, Data, QA, Deploy, Documentation
- Priority: High, Medium, Low

## Milestones

- Phase 0 - Review and migration plan
- Phase 1 - Static hiking guide MVP
- Phase 2 - User accounts and check-ins
- Phase 3 - Social features and moderation

## Phase 1 MVP Issues

### Content Pages

- [ ] Reinebringen guide content QA
  - Phase: Phase 1 MVP
  - Type: Content
  - Priority: High
  - Check trail facts, guide notes, map preview, image credits, and safety notes.

- [ ] Ryten / Kvalvika guide content QA
  - Phase: Phase 1 MVP
  - Type: Content
  - Priority: High
  - Check trail facts, guide notes, map preview, image credits, and safety notes.

- [ ] Festvågtind guide content QA
  - Phase: Phase 1 MVP
  - Type: Content
  - Priority: High
  - Check trail facts, guide notes, map preview, image credits, and safety notes.

- [ ] Offersøykammen guide content QA
  - Phase: Phase 1 MVP
  - Type: Content
  - Priority: Medium
  - Check trail facts, guide notes, map preview, image credits, and safety notes.

- [ ] Tjeldbergtind guide content QA
  - Phase: Phase 1 MVP
  - Type: Content
  - Priority: Medium
  - Check trail facts, guide notes, map preview, image credits, and safety notes.

- [ ] Himmeltindan guide content QA
  - Phase: Phase 1 MVP
  - Type: Content
  - Priority: High
  - Check trail facts, restricted summit wording, guide notes, map preview, image credits, and safety notes.

- [ ] Mannen guide content QA
  - Phase: Phase 1 MVP
  - Type: Content
  - Priority: Medium
  - Check trail facts, guide notes, map preview, image credits, and safety notes.

- [ ] Munken guide content QA
  - Phase: Phase 1 MVP
  - Type: Content
  - Priority: High
  - Check longer-route warnings, guide notes, map preview, image credits, and safety notes.

### Frontend Features

- [ ] Mountains page search and filters
  - Phase: Phase 1 MVP
  - Type: Frontend
  - Priority: High
  - Verify search, difficulty filter, region filter, route-length filter, reset action, and empty state.

- [ ] Hiking guide page planning sections
  - Phase: Phase 1 MVP
  - Type: Frontend
  - Priority: High
  - Verify parking, trailhead, season, suitability, gear, access, and before-you-go sections render consistently.

- [ ] Weather panel integration
  - Phase: Phase 1 MVP
  - Type: Frontend
  - Priority: Medium
  - Verify full weather panel on `/mountains` and compact nearest-location panel on each guide page.

- [ ] Image credits display
  - Phase: Phase 1 MVP
  - Type: Frontend
  - Priority: Medium
  - Verify credits load from `/credits/unsplash-credits.json` and missing credits fail gracefully.

- [ ] SEO metadata
  - Phase: Phase 1 MVP
  - Type: Frontend
  - Priority: Medium
  - Verify document titles, meta descriptions, canonical links, Open Graph, and Twitter card tags.

### QA and Release

- [ ] Mobile responsive QA
  - Phase: Phase 1 MVP
  - Type: QA
  - Priority: High
  - Check 360px, 390px, 768px, 1024px, and desktop widths for header, filters, cards, maps, gallery, sidebar, and footer.

- [ ] Browser QA
  - Phase: Phase 1 MVP
  - Type: QA
  - Priority: Medium
  - Check latest Chrome, Safari, Firefox, and mobile Safari.

- [ ] Accessibility QA
  - Phase: Phase 1 MVP
  - Type: QA
  - Priority: Medium
  - Check keyboard navigation, form labels, alt text, heading order, focus visibility, and color contrast.

- [ ] Netlify deployment QA
  - Phase: Phase 1 MVP
  - Type: Deploy
  - Priority: High
  - Build locally, deploy to Netlify, verify routes, refresh behavior, assets, weather calls, image credits, and maps.

- [ ] MVP README update
  - Phase: Phase 1 MVP
  - Type: Documentation
  - Priority: Low
  - Document current stack, local dev commands, static data structure, image/credit workflow, and planned backend phases.

## Later Backlog

- [ ] Decide backend for auth, user hikes, comments, and mountain-top check-ins.
- [ ] Design check-in and points data model.
- [ ] Design leaderboard page.
- [ ] Plan poster shop and GPS route upload flow.

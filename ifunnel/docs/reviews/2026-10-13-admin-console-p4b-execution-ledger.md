# SDD ledger — plan: /Users/daothinh/ikame-ifunnel/ifunnel/docs/plans/2026-10-13-admin-console-p4b.md

Spec: /Users/daothinh/ikame-ifunnel/ifunnel/docs/specs/2026-10-13-admin-console-p4b-design.md
Worktree: /Users/daothinh/ikf-platform-admin-p4b, branch feat/admin-console-p4b, base 2af9add.
Scratch reference commits (tree must match after each task, except package-lock/artefacts): T1 64e59cf, T2 84517a4, T3 5c8229c, T4 d4b96dc, T5 f37b692, T6 e654a7e, T7 da2867e, T8 ca8877c, T9 9123c16 (repo: <scratchpad>/p4b-scratch, branch scratch/admin-console-p4b).

## Pre-flight scan
| Pair / task | Produces → consumes | Finding |
|---|---|---|
| T1 → T2 | loadScope/isGlobalGrant → requireGrant/hasGrant | consistent (scratch built T2 on T1) |
| T2 → T3,T4,T5 | requireGrant(pool, grant(s), {app, notFound}), resolvers, req.scope → routes | consistent; B4/B8 recorded in plan |
| T3 → T6, T8 | users/tokens API + error codes (last_global_admin, cannot_lock_self, invalid_roles) → CLI, SPA | consistent; spec's self_lockout superseded by B5 |
| T2 → T7, T8 | /v1/auth/me {global, apps} → SPA me | consistent |
| T4,T5 share src/http/* and publisher/* | T5 patches on top of T4 | sequential patches from scratch; apply in order |
| T7 → T8 | canGlobal/canAll/AllApps → Users pages | consistent (B11) |
| T7,T8 → T9 | selectors, behaviour → e2e | consistent |
| Each task self-consistency | tests vs code byte-exact from scratch commits, red runs recorded | clean |
| Global Constraints vs tasks | "unassigned funnels global only" vs B6/B9; "/ for non-global" vs B11 | head already rewritten to the rulings |
Ruling: plan rulings B1–B13 stand as written — they were measured in scratch — cost if wrong: SPA canAll one-line flip + tests.

## Tasks
Task 1: complete — 5c98350, core-api 630/68, tree == 64e59cf (review pending)
Task 1 review: spec ✅, quality approved; minors parked (disabled test assertion weak; token roleIn null by design; claims.test one-off flake) — Ruling: park, no fix round — byte-identical to verified scratch; cost if wrong: one test assertion later
Task 2: complete — acbc4d9, core-api 653/69, tree == 84517a4 (review pending)
Task 2 review: spec ✅, approved. Carry-forward checks: (a) T4/T5 review — notFound bodies must equal each handler 404 (code+detail) [B4]; (b) T5 review — no route left on requireRole once tokens can carry app_id (B9); (c) body resolvers return null not undefined. Ruling: no fix round now — items are verified at the tasks that own them; cost if wrong: final review catches it
Task 3: complete — 8d32eee, core-api 666/71, tree == 5c8229c (review pending)
Task 3 review: spec ✅, approved; 5 minors parked (no concurrent-demote test; non-global admin 403 untested; self role change while global blocked; dup email+unknown app → 404 order; re-grant audit noise). Ruling: park for final review — none load-bearing; cost if wrong: small follow-up tests
Task 4: complete — 74d628d, core-api 685/72, tree == d4b96dc (review pending)
Task 4 review: spec ✅ (B4 bodies match), quality: changes requested — I1 upload with body app_id onto an unassigned funnel moves it into that app without checking publisher there; M1 new-slug race without app_id; M2 prices 404 body untested; M3 B9 cases (Task 5 owns). Ruling: fix I1+M1+M2 as a separate fix commit AFTER Task 5 commits (T5 is mid-flight in the same worktree; T4 fix touches versions.js + tests) — cost: later tree-diffs vs scratch will also show these files
Task 5: complete — 9ab909b, core-api 702/74, tree == f37b692 (review pending). Plan nit: brief said 41 for 3-file run, actual 40 (totals match)
Task 5 review: spec ✅ (B4/B9/B10/requireRole checks pass), quality: changes requested.
Ruling B14: PUT /v1/routes/:host, rollback and delete also need `router` in the app of the funnel currently live at that prefix (and rollback: of the target funnel), checked BEFORE the confirm-409 so no foreign slug leaks — spec §2 row says only body/live funnel; the intent (no cross-app interference on shared hosts) wins — cost if wrong: a global/default-role router does these anyway (unchanged)
Ruling: Minor #1 fix (onRequest `any` guard admin / support on grants DELETE and resend-email so tokens without the grant get 403 as before); Minor #2 (FOR SHARE waits on R2 upload) parked — latency only, no deadlock; Minor #3–#5 parked for final review.
Fix order: T4 fix (running) then T5 fix, same worktree, sequential.
Task 4 fix round 1: e38d2ed (I1 + M1 + M2), core-api 704/74 — re-review pending
Task 4 re-review: I1, M1, M2 addressed, no new findings. Task 4: complete (with fix e38d2ed). M3 parked → final review
Task 5 fix round 1: 27ccb68 (B14 + Minor #1), core-api 706/74 — re-review pending
Task 6: complete — c0e6b04, cli 243/24, packages/cli tree == e654a7e (review pending)
Task 5 re-review: Important #1 (B14) and Minor #1 addressed, no new findings, no new deadlock path. Task 5: complete (with fix 27ccb68). Noted pre-existing: rollback does not re-apply 4a domain_app_mismatch → final review
Task 7: complete — ab765ba, admin 228/27, apps/admin tree == da2867e; red 14/12 vs plan 13/13 (green identical — red count is order-sensitive, ruling: accept) (review pending)
Task 6 review: spec ✅, approved; minors/nits parked (generic message for user_app_not_found etc.; admin token role usage text; no warning for no-access user; admin ls column width)
Task 8: complete — cd7f9c7, admin 242/28, tree == ca8877c (review pending)
Task 8 review: spec ✅, approved; minors parked (snap-back not asserted; no reload after failed write; dialog a11y as existing; load/act duplication; exact email self check)
Task 7 review: spec ✅ (B11/B12 hold), quality: changes requested. Ruling: fix Important (Domains Sync appId={d.app_id ?? null}) + Minors effectiveRole fallback to me.role for ids not in me.apps (server does the same), CustomerDetail Thu hồi/Cấp quyền by grant app, app pickers (New funnel, FunnelSettings) only apps where editor — after Task 9 commits (avoid concurrent commits in one worktree). Park: Customers one-frame flicker, red-count note — cost: cosmetic
Task 9: complete — 1f2facd, demo 133/24, tree == 9123c16 for demo/docs (review pending)
Task 9 review: spec ✅, approved. Ruling: B14 sentence in runbook §13/§14 + CLAUDE.md goes into the final fix wave (docs only)
Task 7 fix round 1: 87090da (Important + 3 minors), admin 247/28 — re-review pending
Task 7 re-review: all ruled findings addressed, no new blocking. Task 7: complete (with fix 87090da)
Task 10: full run in progress
Task 10 step 1: paddle 34, event-schema 145, funnel-lint 35, sdk 159 (8154 B), cli 243/24, edge-router 106, event-consumer 8+27, core-api 706/74, route-match 35, admin 247/28 — all green; demo re-run pending
Task 10 step 1: demo 133/24 at 87090da, no e2e ports left. Final review pending
Final review: ready with fixes, no Critical/Important. Ruling (one fix wave): fix M5 docs (B14 sentence, rollback/delete wording, default-role audit/unassigned, app tokens on shared hosts), M2 (GET funnel omits live[].previous when its funnel is outside the caller scope; SPA Rollback only when previous present), M6 (CLI hint for --role admin without --global). Park M1 (server answers 403 correctly; 4a-origin half), M3 (foreign from_slug in audit — operator-facing, low), M4 (race-only 409 wording) — cost: minor leaks of a slug name in narrow cases, listed in PR as follow-ups. Pre-existing err.message logs (trySync, billing.js:33) out of diff → follow-up
Final fix wave: caaf179 df87621 0b8b00c — core-api 707/74, admin 248/28, cli 244/24 — re-review pending
Final re-review: M2, M5, M6 addressed; ready. New minor (viewer-not-router sees Rollback, server 403) parked with M1

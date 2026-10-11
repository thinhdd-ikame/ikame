# Admin Console đợt 2 — SDD execution ledger

Copied from the git-ignored SDD workspace at the end of execution (2026-10-11). Branch `feat/admin-console-p2` e1b92cf..331299d.

```
# SDD ledger — plan: /Users/daothinh/ikame-ifunnel/ifunnel/docs/plans/2026-10-11-admin-console-p2.md

Spec: /Users/daothinh/ikame-ifunnel/ifunnel/docs/specs/2026-10-11-admin-console-p2-design.md
Worktree: /Users/daothinh/ikf-platform-admin-p2, branch feat/admin-console-p2 from e1b92cf (feat/admin-console-p1). PR base: feat/admin-console-p1.
Env: DOCKER_HOST=unix://$HOME/.colima/default/docker.sock TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock TF_PLUGIN_CACHE_DIR=$HOME/.terraform.d/plugin-cache
Baseline e1b92cf: core-api 408/43, admin 44/7, funnel-lint 31/2, cli 129/13, demo:test 113/19, paddle 31, sdk 159 (8154 B), tf edge 11/core-service 6/stack 12.

## Pre-flight scan (plan author replayed every block on fresh e1b92cf: tree hash identical after each task)

| Pair / task | Produces vs consumes | Found |
|---|---|---|
| T1 ↔ T2 | admin_users_role_check adds 'support' ↔ USER_ROLES/USER_GRANTS | consistent |
| T1 ↔ T3 | manual_grants(id, customer_id, app_id, key, expires_at, reason, granted_by, revoked_at, revoked_by) ↔ loadSources manual rows; entitlements_source_check + 'manual' | consistent |
| T2 ↔ T4/5/6/9 | grants 'support', 'prices:read', 'apps:read', 'router' ↔ requireRole strings on new routes (A1/A2) | consistent |
| T3 ↔ T4 | recompute(c, customerId, now) with manual in desired ↔ grants API calls lockCustomer + recompute in tx | consistent (A14) |
| T4 ↔ T5 | T4 creates customerByRef/listEntitlements in identity/customers.js and grantView in grants.js; T5 moves grantView into customers.js and grants.js imports it | consistent (order T4→T5) |
| T5 ↔ T12 | report v2 shape {customer_ref, paddle_customer_id, created_at, user_id_rotated_at, has_email, checkouts, subscriptions, entitlements, manual_grants, links, deliveries, claim} ↔ CustomerDetail sections | consistent (A5) |
| T6 ↔ T12 | resend {queued, checkout_id} / rotate {rotated_at, email_queued} ↔ SPA actions | consistent (A15) |
| T7 ↔ T10 | priceView {id, name, product_name, amount_minor, currency, interval, status} ↔ priceLabel/badges | consistent (A23 archived) |
| T8 ↔ T10 | listFunnelPrices {plans, plan_keys, unmapped} ↔ PricesTab rows/badges; planKeysFromHtml exported from funnel-lint (A12) | consistent |
| T9 ↔ T11 | updateApp EDITABLE 7 fields, listDeliveries {items, next_before, counts}, no GET /v1/apps/:id (A24) ↔ AppDetail reads list | consistent |
| T2 ↔ T10–13 | RequireGrant, NAV by grants ↔ each screen adds its own route + menu item (A22); grants.test.jsx updated per task (allowed) | consistent |
| T13 ↔ T14 | final menu order spec §3 ↔ e2e selectors | consistent |
| T14 ↔ Global | e2e ports 8857/8158/8859/8858/8861/8862, DB ikf_admin_p2_test (A19); rate limit exact /v1/paddle/prices + prefix /v1/customers/ (A18, old tf assert narrowed — allowed) | consistent |
| Each task self | mechanically verified by author (replay hash match) | clean |
| Rubric | no test that asserts nothing / no verbatim duplication mandated found in interfaces; A3 duplicates the grants table in SPA but pins equality by test | accepted |

Ruling: A3 (SPA keeps its own copy of USER_GRANTS, equality pinned by a test importing core's table) accepted over a shared package — SPA may not import core-api at runtime; cost if wrong: two tables drift only if the test is deleted.

## Progress
Task 1: minor (deferred): cosmetic column alignment in 006; schema test lacks expires_at non-null / revoked_by-only cases
Task 1: complete (commits e1b92cf..3bf9aec, review clean; core-api 411/44)
Task 2: minor (deferred): grants.test.jsx editor half of RequireGrant test can match the loading state (plan-mandated weakness; can() table tests pin it); RequireGrant shows "Cần quyền" while loading if used outside RequireAuth (never happens in App.jsx)
Task 2: complete (commits 3bf9aec..1b1ced1, review clean; core 420/45, cli 130/13, SPA 56/8)
Task 3: note: entitlement-sync F4 (two concurrent senders) flaked once under full-suite load, passed alone and on rerun — pre-existing test, watch in Task 15
Task 3: minor (deferred): better() tie-break compares source_id as text (manual '10' beats '9'; manual beats sub/one-time on exact tie) — deterministic, only source_id affected
Task 3: complete (commits 1b1ced1..039429f, review clean; core 429/46)
Task 4: minor (deferred): server accepts any Date-parsable expires_at (typo → year 99998, Feb 30 rollover, no-offset read in server TZ) — tighten to ISO 8601 with offset (candidate for final fix wave); CLI --expires checks prefix only; grants :id schema has no maximum (1e20 → BIGINT overflow 500); JS vs DB clock mix
Task 4: complete (commits 039429f..2990a08, review clean; core 443/47, cli 140/14)
Task 5: Ruling: checkout_id lookup must filter transactions by paid status (plan's subquery lacked it; spec A7 says only paid checkouts) — fix in round 1 with a test; also accept lowercase checkout ids (ULID is case-insensitive) — cost if wrong: one extra WHERE clause.
Task 5: fix round 1/5 (3 addressed, 0 open — paid-only checkout lookup + checkouts[], lowercase ULID, {foo} 400 case; commits 662a691..d7b3f13)
Task 5: minor (deferred): claim_tokens side of the checkout_id UNION has no paid filter (tokens only exist after a paid checkout)
Task 5: complete (commits 2990a08..d7b3f13, review clean after 1 fix round; core 457/48, cli 143/14)
Task 6: Ruling: api.resendEmail stays retry:true (plan); the controller's dispatch text "neither retried" was wrong — resend reset is idempotent, a duplicate email is the worst case — cost if wrong: one duplicate email.
Task 6: minor (deferred): rotate rethrows non-no_claim/no_email resend errors after the rotation committed (500 hides success) — candidate for final fix wave; resend on a handoff=claim app whose token is used_at returns queued:true but the link answers 409 (consider 409 claim_used); latest checkout ordered by created_at
Task 6: complete (commits d7b3f13..9868557, review clean; core 466/49, cli 146/14)
Task 7: ⚠️ resolved: paddleHttpError is pre-existing billing code (codes only, reviewed in billing plan); makeApp forwards now (cache TTL test green); DEMO_PRICES.old — seed/purchase-deps tests green, full demo:test in Task 15
Task 7: minor (deferred): catalog cache doesn't coalesce concurrent misses (inflight promise, ~4 lines); Number(amount) may be NaN → null; non-Paddle errors become 500 (correct per A11)
Task 7: complete (commits 9868557..5f85a92, review clean; core 470/50, paddle 34)
Task 8: ⚠️ resolved: SPA imports nothing from plans yet (Task 10 will); package exports unchanged; plan-keys test green per implementer (473)
Task 8: minor (deferred): plan scan runs before validateBundle (cheap, 28 ms worst case); no test pinning "re-upload writes no audit / doesn't overwrite keys"
Task 8: complete (commits 5f85a92..dcef366, review clean; core 473/51, funnel-lint 35/3, cli 142/13)
Task 9: minor (deferred): webhooks next_before non-null on exact last page; counts query outside items snapshot; reconcile audit inside try → DB failure after success reported as paddle error; merged-row validation blocks unrelated edits on legacy-invalid rows
Task 9: complete (commits dcef366..91b40df, review clean; core 487/52, cli 148/14)
Task 10: Ruling: plan-mandated gaps fixed — plan maps must use Object.hasOwn / null-prototype objects (plan keys come from editor HTML), 422 handler needs a general fallback; also render the mapped pri_ as a synthetic option when absent from the catalog — cost if wrong: a few lines in PricesTab.
Task 10: fix round 1/5 (3 addressed, 0 open — hasOwn get() + null-proto maps, 422 general fallback, synthetic option; commits 791b8e5..c365fab)
Task 10: minor (deferred): row-error text "undefined: undefined" when a 422 item lacks code/reason; clearing the pri_ field on a saved row is a no-op (only Gỡ removes); no unmount cancel on loads
Task 10: complete (commits 91b40df..c365fab, review clean after 1 fix round; SPA 66/9)
Task 11: Ruling: rotate dialog shows `force` only after 409 key_rotation_pending (brief wording wins over the plan's code block); also fix EditApp remount wiping "Đã lưu" (same class as phase 1 FunnelSettings) — cost if wrong: a few lines in AppDetail.
Task 11: fix round 1/5 (2 addressed, 0 open — force only after 409, EditApp keyed on app.id; commits 1161acf..090e48a)
Task 11: minor (deferred): EditApp draft initialised once → stale fields after another admin's edit (last-write-wins); webhook filter change leaves old items/cursor until response; no dedupe by event_id on append; resend collapses loaded pages; bundle_ids compared as string; no_fields/app_not_found rendering via ErrorNote untested
Task 11: complete (commits c365fab..090e48a, review clean after 1 fix round; SPA 76/10)
Task 12: Ruling: add pending guards to grant confirm and Gửi lại (plan code lacked them; double-click → duplicate grants/emails/audit rows); also lowercase cus_ refs accepted, Tìm disabled while pending, disabled-reason title on Gửi lại — cost if wrong: a few state flags.
Task 12: fix round 1/5 (5 addressed, 0 open — pending guards, tooltip, lowercase ref, Tìm disabled + stale guard; commits ae1da65..c75f577)
Task 12: minor (deferred): Enter with an invalid query while a search is pending leaves Tìm disabled (setBusy(false) missing in the invalid branch); done() doesn't clear page error; stale c/notice on :ref change; expires_at error not next to the date input; no tests for Tìm pending/stale guard
Task 12: complete (commits 090e48a..c75f577, review clean after 1 fix round; SPA 93/11)
Task 13: minor (deferred): Lọc/Tải thêm have no ordering guard (stale page can append to a new filter; admin read-only); no dedupe by id on append; Tải thêm visible briefly during filter change; no test for disabled Chạy reconcile / reconcile not called for non-admin
Task 13: complete (commits c75f577..8b02eb7, review clean; SPA 99/12)
Task 14: ⚠️ resolved: rate-limit-path.test.js pre-existed (64ee9f2), not added by this task; Cloudflare plan support for starts_with in rate-limit rules unverifiable (mock provider only) — runbook/PR note
Task 14: minor (deferred): no tftest run with expect_failures on rate_limited_prefixes validation; seedSupportUser returns the email even if the row has another role/disabled; e2e failure diffs could print a fake user_id; runbook email_queued:false sentence omits the no_claim case
Task 14: complete (commits 8b02eb7..f33c597, review clean; demo:test 115/20, e2e 11.9 s, tf edge 12/core-service 6/stack 12)
Final review: dispatched (opus) over e1b92cf..f33c597 in parallel with Task 15
Task 15: complete (verification only at f33c597: core-api 487/52 (rate-limit-path test already inside), cli 148/14, funnel-lint 35/3, paddle 34, admin 99/12, demo:test 115/20, sdk 159 (8154 B), edge-router 106, event-schema 145, route-match 35, event-consumer 8+27; tf edge 12/core-service 6/stack 12, validate staging+prod OK, fmt + actionlint clean; ports free; tree clean)
Final review (opus): verdict "mergeable after fixes". I1 Tạo app no pending guard + server race (two POSTs pass exists check; second put overwrites webhook secret shown by the first); I2 webhook Gửi lại no pending guard; I3 rotate user_id with no email/claim = lockout (OTP restore doesn't apply to user_id handoff) but runbook/dialog say OTP restore. Minors to fix now: #4 rotate rethrows after commit; #5 stuck Tìm on invalid query; #6 runbook says grant reason is in audit; #7 grant id no maximum; #8 plan_keys stored unfiltered/uncapped. Deferred: all other minors (triaged). Rulings A3/T5/T6/T10/T11/T12: reviewer agrees. Ledger correction: reconcile audit failure → 500 internal, not paddle error.
Ruling: fix wave scope = I1 (SPA guard + pg_advisory_xact_lock around check→put→insert in createApp) + I2 + I3 (runbook + dialog pre-confirm warning) + minors #4 #5 #6 #7 #8; everything else deferred — cost if wrong: a second round after re-review.
Fix wave: dispatched (opus), FIX_BASE f33c597
Final fix wave: done (commits f33c597..331299d: f2d8750 I1+I2 advisory lock + guards, e2493e3 I3 + #4 #5 #6 #7, 331299d #8). Totals: core-api 492, SPA 105, demo:test 115, build OK, ports free, tree clean. Implementer concerns: all webhook rows disabled while one resend pends; rotate warning log carries {code} only.
Scoped re-review: dispatched (opus) over f33c597..331299d
Scoped re-review (opus): all 8 findings ADDRESSED; fix diff: no Important; minors: runbook "fix email in Paddle then Gửi lại" also needs a reconcile/renewal to refresh customers.email (no customer.updated handler); no_claim grouped with no_email but remedy differs; concurrency test can't prove the lock path was hit; hashtext int4 key shares keyspace (harmless).
Ruling: park the two runbook wording items + test-strength note (no second fix wave) — listed in PR Pending — cost if wrong: an ops person follows an incomplete runbook step once.
Branch complete at 331299d. Next: push, PR #7 (base feat/admin-console-p1), archive, delete workspace.
```

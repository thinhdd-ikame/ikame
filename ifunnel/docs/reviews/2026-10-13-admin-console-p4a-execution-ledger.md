# SDD ledger — plan: /Users/daothinh/ikame-ifunnel/ifunnel/docs/plans/2026-10-12-admin-console-p4a.md
Spec: /Users/daothinh/ikame-ifunnel/ifunnel/docs/specs/2026-10-12-admin-console-p4a-design.md (read; binding).
Worktree: /Users/daothinh/ikf-platform-admin-p4a, branch feat/admin-console-p4a, base e1e4f11 (feat/admin-console-ui).
Scratch source of every patch: /private/tmp/claude-501/-Users-daothinh-ikame-ifunnel/64af12e1-7f42-4742-9565-69e968ce9482/scratchpad/p4a-scratch — Task→commit: 1 b1c9b1e, 2 1442e62, 3 a5fa57f, 4 346b1a0, 5 64ba54a, 6 526514e, 7 f06f253, 8 d6048d2, 9 8d7b37d, 10 272701b, 11 e5b0f57, 12 3df9767. After each task: `git diff --stat <scratch-commit> HEAD` must be empty (lockfile/artefacts excepted).

## Pre-flight scan (2026-10-12)

| Pair / task | Shared file or interface | Produces vs consumes | Finding |
|---|---|---|---|
| T1 ↔ T2 | `src/identity/apps.js`, `src/http/catalog.js`, `audit(...,{app_id})` | T1 adds signature + `funnel.app` app_id; T2 adds `assignFunnelApp`, `funnel.create/version.upload/funnel.pixel` app_id, `?app=` | consistent (patches from sequential commits) |
| T2 ↔ T3 | `src/publisher/catalog.js` (`listFunnels`/`listDomains`), `src/http/catalog.js` | T2 `listFunnels({app})`, T3 `listDomains({app})` + `app` pattern reuse | consistent |
| T3 ↔ T4 | `listDomains({app})` returns app + shared | T4 `appSummary` filters out NULL | consistent (A15) |
| T2 ↔ T4 | `listFunnels({app})` | T4 summary consumes | consistent |
| T4 ↔ T6 | `apps` existence check (`app_not_found`) | T6 checks `apps` before ClickHouse | consistent (A19) |
| T1–T6 ↔ T7 | HTTP shapes | CLI consumes exactly the shapes T2–T6 produce | consistent (T7 tests use fake servers mirroring shapes) |
| T1–T6 ↔ T8 | HTTP shapes | client methods in `api.js` | consistent (T8 `api.test.js`) |
| T8 ↔ T9/T10/T11 | `App.jsx`, `styles.css`, `OverviewTable.jsx`, `useAppContext` | sequential patches on the same files | consistent (applied in order; patch context from previous commit) |
| T9 ↔ T12 | Dashboard `/` has no `overview-row` | T12 fixes `admin-p3-e2e` to read app overview | consistent (A29) |
| T2 ↔ T12 | first upload needs `app_id` | T12 demo sends it; demo tests red between T2 and T12 (plan says so) | accepted: plan orders T12 last; `demo:test` only in T12/T13 |
| T7 `--no-app` | server refuses null | CLI keeps flag, prints message (A20) | ruling recorded in plan |
| each task | tests vs code | derived from one tested commit each | self-consistent |
| rubric | no assert-free tests, no duplicated logic blocks | T9 extracts shared table helpers; T2 `checkUploadApp` single source | none found |

Preflight rulings: none needed beyond those already in the plan's adjustment table (A1–A30).
BASE_T1=e1e4f11
Task 1: implementer 14e9c55; tree == scratch b1c9b1e (git diff --stat empty); review: spec ✅, quality Approved.
Task 1: Ruling: `GET /v1/audit?app=<unknown>` returns an empty list, not 404 — audit history must stay readable after an app is removed (no FK by design); 404 `app_not_found` applies to `GET /v1/apps/:id`, `/summary`, `/plans`, `/v1/analytics/overview?app=`, `/v1/customers/lookup.app_id` only (plan Global Constraints line to be corrected in the docs commit) — cost if wrong: one handler check later.
Task 1: minor (deferred): 007 backfill of old `funnel.app` rows uses the funnel's current app instead of `details->>'app_id'` (COALESCE would be more accurate); old `entitlement.grant` rows (target customer:, details.app_id) stay NULL; test splits 007 on `;` after stripping comments (fragile coupling, plan-mandated).
Task 1: complete (commits e1e4f11..14e9c55, review clean; full core-api run by controller: see below)
BASE_T2=14e9c55
Task 2: implementer 6a37e8a; tree == scratch 1442e62 (git diff --stat empty); plan patch for versions.js verified byte-identical to scratch diff (implementer mangled its heredoc copy, applied by hand — no plan defect).
Task 2: review: spec ✅, quality Approved.
Task 2: minor (deferred): pre-lint funnel read is unlocked, a concurrent PUT can make lint run with a stale app kind (only the `no_get_app_hook` warning affected; plan-mandated A6); `app_required` detail differs (`POST /v1/funnels` no detail, upload/PUT `detail: {funnel}`); stale comment `setFunnelApp` "(null = none)" in src/identity/apps.js; `checkUploadApp` runs twice on a new slug (harmless); no test for the two-concurrent-first-uploads path.
Task 2: complete (commits 14e9c55..6a37e8a, review clean)
BASE_T3=6a37e8a
Task 3: implementer f3fb016; tree == scratch a5fa57f.
Task 3: review: spec ✅, quality Approved.
Task 3: Ruling: `GET /v1/funnels?app=<unknown>` and `GET /v1/domains?app=<unknown>` return 200 (empty / shared-only), not 404 — the plan's adjustment A8 already decided this for list routes; the Global Constraints sentence "app không tồn tại → 404" applies to the non-list routes only (fix the wording in the plan docs commit) — cost if wrong: a 2-line check per list route.
Task 3: minor (deferred): funnel reassignment (`assignFunnelApp`) can move a live funnel to app Y while it is live on an app-X host — no domain check (cross-task invariant, out of 4a spec; flag in final review); demo host upsert never resets `app_id` (stale app in a persisted demo DB); no concurrency test for publish vs PUT /v1/domains; no-op domain updates still audited.
Task 3: complete (commits 6a37e8a..f3fb016, review clean)
Attribution change: from Task 4 on, commit trailer = `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` (session attribution update).
BASE_T4=f3fb016
Task 4: implementer a349fef; tree == scratch 346b1a0.
Task 4: review: spec ✅, quality Approved.
Task 4: minor (deferred): appPlans uses listFunnels (live-route query) + N× listFunnelPrices (N+1, admin scale ok); /plans multi-funnel ordering and null plan_keys branch untested; count fixtures small (2 routes on one funnel would pin no-double-count harder); RESERVED_APP_IDS enforced only in createApp.
Task 4: complete (commits f3fb016..a349fef, review clean)
BASE_T5=a349fef
Task 5: implementer 1833a50; tree == scratch 64ba54a.
Task 5: review: spec ✅, quality Approved.
Task 5: minor (deferred): scoped subscriptions LEFT JOIN is effectively inner; 404 ordering not pinned by a test with a non-matching identifier; no test for a customer reached by customer_ref whose data is only in another app.
Task 5: complete (commits a349fef..1833a50, review clean)
BASE_T6=1833a50
Task 6: implementer d8bdfb9; tree == scratch 526514e.
Task 6: review: spec ✅, quality Approved.
Task 6: minor (deferred): funnelSlugs and moneyOverview are separate reads (a reassignment in between gives a money row app_id null for ≤ one cache TTL); `app` missing from the analytics access log line; no test for 404-before-ClickHouse with ClickHouse down, nor `?app=none` → 404; `SELECT 1 FROM apps` runs on cache hits.
Task 6: complete (commits 1833a50..d8bdfb9, review clean)
BASE_T7=d8bdfb9
Task 7: implementer 808be46; tree == scratch f06f253.
Task 7: review: spec ✅, quality Approved.
Task 7: minor (deferred): CLI `app_not_found` without detail prints "undefined"; `publish.js` APP_ID regex duplicates main.js APP_ID_RE; `funnel ls --app none` undocumented alias of --unassigned; no `domain ls` 404 test.
Task 7: complete (commits d8bdfb9..808be46, review clean)
BASE_T8=808be46
Task 8: implementer 0874721; tree == scratch d6048d2.
Task 8: review: spec ✅, quality Approved.
Task 8: Ruling: the two plan-mandated transient gaps (global "New funnel" sends no app_id → 400 until Task 9; five in-app menu links hit the catch-all until Tasks 9–11) stand — the plan closes both in the next tasks and the branch ships only as a whole — cost if wrong: none once Task 11 lands.
Task 8: minor (deferred): `useApp` (app-context.jsx) has no stale-response guard (AppSettings/AppWebhooks could show the previous app if switched mid-request); `AppsProvider.reload` no ordering guard; "Tạo funnel" test does not check `?new=1`; save test does not assert `listApps` reload; "← Tất cả app" arrow not aria-hidden; switcher shows no error when listApps fails.
Task 8: complete (commits 808be46..0874721, review clean)
BASE_T9=0874721
Task 9: implementer 7d2adb0; tree == scratch 8d7b37d.
Task 9: review: spec ✅, quality Approved.
Task 9: minor (deferred): Funnels filter setParams drops `?new=1`; switching /apps/a/funnels → /apps/b/funnels keeps typed slug/pick/error state (a typed slug could be created in the new app — add key={appId}); funnels null after list error shows "Đang tải…" (pre-existing); Dashboard name comparator never returns 0 (unstable equal names); names flicker ids→names while apps load; no stale-filter test.
Task 9: complete (commits 0874721..7d2adb0, review clean)
BASE_T10=7d2adb0
Task 10: implementer 8011f37; tree == scratch 272701b.
Task 10: review: spec ✅, quality Approved.
Task 10: minor (deferred): Domains.jsx load has no stale-response guard and keeps error/notice across appId change; no in-flight guard on assign (double PUT race); breadcrumb shows raw app id until apps load; mis-indented <h1> in FunnelDetail.jsx (plan-mandated, cosmetic); no test for 409 without detail fallback.
Task 10: complete (commits 7d2adb0..8011f37, review clean)
BASE_T11=8011f37
Task 11: implementer 47c08dc; tree == scratch e5b0f57.
Task 11: review: spec ✅, quality Approved; 3 Important plan-mandated (stale responses when switching app: AppPlans effect, Audit load + "Tải thêm" append, CustomerDetail not reset on ref/appId change).
Task 11: Ruling: the 3 plan-mandated stale-response findings are real; fix them in ONE batched fix wave after the final whole-branch review, together with the same class of minors from Tasks 8–10 (useApp guard, Domains load guard + error reset, Funnels key={appId}/state reset, Customers found/hint reset) — one consistent request-token/ignore pattern across the SPA instead of four piecemeal rounds; nothing in Task 12 builds on these files' internals — cost if wrong: a fast app switch can briefly show the previous app's rows until then.
Task 11: minor (deferred): revoke/rotate reload app_id untested; viewer test on in-app /customers doesn't assert no lookup; failed getAppPlans untested; audit chip shows raw app_id.
Task 11: complete (commits 8011f37..47c08dc, 3 Important deferred by ruling to the final fix wave)
BASE_T12=47c08dc
Task 12: implementer ddd171a; tree == scratch 3df9767; demo:test 132/132 first run.
Task 12: review: spec ✅, quality Approved.
Task 12: minor (deferred): `api` helper in demo/lib/funnels.mjs may be dead now; plain `npm run demo` after a purchase run rewrites app URLs to demo.test (harmless, comment); funnel_app_mismatch retry only unit-tested; e2e host-dropdown count-sensitive.
Task 12: complete (commits 47c08dc..ddd171a, review clean)
Task 13: full branch green at ddd171a — paddle 34, event-schema 145, funnel-lint 35, sdk 159 (8154 B), cli 203, edge-router 106, event-consumer 8+27, core-api 613, route-match 35, admin 197, demo 132; git status clean.
Final review (opus): With fixes — 0 Critical; Important: funnel move while live on another app's domain, funnel.prices audit app_id, SPA stale-response batch (useApp can rotate the wrong app's key); Minor: 007 OR-join lock cost, detail shapes, CLI mismatch JSON, stale comment, plan wording.
Final: Ruling: fix wave = Important 1–3 + Minor 4–8 in one dispatch; defer Dashboard zero-activity rows and "leaving an app" audit (spec gaps, noted for 4b) — cost if wrong: an idle app has no Dashboard row; app X's audit misses a move-out event.
Final: Ruling: plan Global Constraints wording on 404 for list routes corrected in the docs repo (controller, docs-only).
FIX_BASE=ddd171a
Final fix wave: 3cf43f4 5e82c2f 719abb7 9caa051 (core-api 616, cli 207, admin 210, demo 132).
Final re-review: findings 1–8, 3a–3g ADDRESSED; new breakage: Important deadlock (unrequested `FOR SHARE OF f` in setRoute vs setFunnelPixel lock order); Minor: Domains `assigning` stuck after a sync during an assign; `useLatest` no unmount bump; publish lock waits on R2 upload.
Final: Ruling: revert the unrequested `FOR SHARE OF f` in publisher/routes.js (smallest change that removes the deadlock; the publish-vs-move race it targeted is the same class as the out-of-scope setDomain-vs-move write skew, both deferred to 4b with a note) and fix Domains stuck `assigning` (always clear it in the same-app case) — applied by the same implementer as the ruling's execution, not a second wave — cost if wrong: a publish racing an app move can land a foreign funnel on an app host until the next publish check.
Final: parked — setDomain vs assignFunnelApp write skew (concurrent domain assign + funnel move both pass) — Ruling: real, rare (two admin actions on the same funnel/host within ms), deferred to 4b where per-app scoping reworks these paths; note in PR.
Final: parked — useLatest has no unmount bump (React 18 no-op setState; Customers.search may navigate after leaving the page, pre-existing) — Ruling: cosmetic, defer.

# Admin Console đợt 3 — Execution ledger (subagent-driven)

Nhánh `feat/admin-console-p3` (331299d → 2f22148, 19 commit), PR #8 base `feat/admin-console-p2`. Implementer sonnet + reviewer sonnet/opus mỗi task; final review opus; một đợt sửa (opus) + re-review opus. Bản sao ledger `.superpowers/sdd/.../progress.md` lúc kết thúc, kèm danh sách deferred.

---

# SDD ledger — plan: /Users/daothinh/ikame-ifunnel/ifunnel/docs/plans/2026-10-12-admin-console-p3.md

Spec: /Users/daothinh/ikame-ifunnel/ifunnel/docs/specs/2026-10-11-admin-console-p3-design.md (read; binding authority).
Worktree: /Users/daothinh/ikf-platform-admin-p3, branch feat/admin-console-p3 from feat/admin-console-p2@331299d. PR base feat/admin-console-p2 (#7).
Constraints: constraints.md (plan header + A1–A20 + Global Constraints). Briefs: task-N-brief.md (1..13).
Env for every dispatch: DOCKER_HOST=unix://$HOME/.colima/default/docker.sock TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock TF_PLUGIN_CACHE_DIR=$HOME/.terraform.d/plugin-cache. `npm run demo:test` alone, serially.
Started 2026-10-12 09:23. BASE at start: 331299d.

## Pre-flight scan (plan read once, 2026-10-12)

Pairs sharing a file or interface:

| Tasks | Produces → consumes | Finding |
|---|---|---|
| 1 ↔ 3 | `funnel_hourly` columns (funnel, hour, v, name, screen, country, ua_class, utm_source, utm_campaign, sessions AggregateFunction) → `queries.js` `where()`/`COUNTS`, `uniqExactMerge(h.sessions)` | Match; A5 alias `h.` used in every query. OK |
| 1 ↔ 11 | `002` two statements + `clickhouse/backfill/002_funnel_hourly.sql`, `sqlStatements`/`BACKFILL_DIR` in `demo/lib/stack.mjs` → demo `startStack` applies DDL + backfill each start | Match (A4). OK |
| 2 ↔ 6 | `ClickhouseError.kind` auth/client/unavailable → route `answer()` maps any ClickhouseError to 503 + log `{route, kind, status}` | Match (A6, A19). OK |
| 2 ↔ 11 | `createClickhouse({url,user,password,database,fetch,timeoutMs})` → demo injects a client via `buildApp({deps})` | Match; demo does not modify `services/`. OK |
| 2 ↔ 12 | `ANALYTICS_SECRETS` = clickhouse-url / clickhouse-reader-user / clickhouse-reader-password; env `CLICKHOUSE_DATABASE` → Terraform stack `secret_arns` + `core_environment` + runbook | Same names in both tasks. OK |
| 3+4 ↔ 5 | `versionsSeen, eventSeries, eventTotals, screenSteps, otherEvents, eventBreakdown, eventOverview` (3) and `funnelIdOf, moneySeries, moneyBreakdown, moneyOverview` (4) → `analyticsService` (5) merges by bucket/key, fills 0, caches 30 s | Names identical in Task 5 test fakes and real modules. OK |
| 5 ↔ 6 | `resolveRange` 400 `invalid_range {reason, by, max_days}`; service responses overview/funnel/breakdown → routes schema + status codes | Match (A9, A10). OK |
| 6 ↔ 7 | Route JSON `{range, by, versions, series, steps, milestones, events}` → `ikf stats` printing | Match; CLI has its own `ZERO_DECIMAL` (A17). OK |
| 6 ↔ 8 | Routes → SPA client `getOverview/getFunnelStats/getFunnelBreakdown` | Match. OK |
| 8 ↔ 9 ↔ 10 | `format.js`, `RangePicker`, `LineChart`, `Bars` (8) → `Dashboard` (9) → `StatsTab` (10); `analyticsOff`, `AnalyticsError`, `Loading` defined in 9 and reused in 10 | Consistent; 9 and 10 both edit `test/helpers.jsx` (fake client) — sequential, additive. OK |
| 9 ↔ 10 ↔ 11 | data-testids `overview-row`, `step`, `milestone`, `breakdown-row`, tab label `Số liệu`, heading `Dashboard` → e2e p3 | Same labels. OK |
| 10 ↔ existing tests | A13 tab in URL: `funnels.test.jsx`, `publish.test.jsx`, `demo/test/admin-e2e.test.mjs` switch to `?tab=main` | Allowed by Global Constraints list; meaning kept. OK |
| 11 ↔ 12 | e2e ports 8877/8178/8879/8878/8881/8882, DB `ikf_admin_p3_test` (11); edge prefix `/v1/analytics/` (12) | No overlap with p1/p2 ports. OK |
| 12 ↔ 2 | Terraform `CLICKHOUSE_DATABASE = "ikf"` fixed (A18) vs core default `ikf` in `loadConfig` | Consistent. OK |

Per-task self-consistency:

| Task | Tests vs code vs files | Finding |
|---|---|---|
| 1 | DDL test creates `ikf_writer`/`ikf_reader` (needs `CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1`, A14) and checks DEFINER insert path; `stack.test.mjs` only adds 2 tests | OK |
| 2 | `config.test.js` adds exactly `analytics: { clickhouseDatabase: 'ikf' }`; setup logs `analytics disabled, missing: …` without secrets | OK |
| 3 | Month-partition and `v`-filter tests pinned (Review Focus 2, 3) | OK |
| 4 | Revenue by `billed_at` fallback `paddle_updated_at`, PAID from `billing/sync.js`, refunds from outbox topics | OK |
| 5 | Range rounding + limits; "events, no money" test (Review Focus 1); cache 30 s keyed `route|slug|from|to|by|dim|v` | OK |
| 6 | `failing`/`slow` → 503 + log kind only (Review Focus 5); tokens publisher/router read (A11) | OK |
| 7 | `--days` 1..90, `--by hour` > 14 d exit 2; 11 tests | OK |
| 8 | `fmtMoney` zero-decimal (Review Focus 4); charts SVG only, no new deps | OK |
| 9 | `auth.test.jsx` "/ is the Dashboard", `grants.test.jsx` menu lists gain `Dashboard` first; 404 and 503 → "chưa bật" card (A12) | OK |
| 10 | 503 card + other tabs work; version-with-no-events card; A20 percentages | OK |
| 11 | `demo:events -- --seed` writes ClickHouse + Postgres; e2e seeds `ikf_admin_p3_test` only; demo.test counts unchanged (A15) | OK |
| 12 | edge test asserts full identity expression with `/v1/analytics/`; stack test one new run; runbook A1 definer note | OK |
| 13 | Rerun only; expected counts core 548/59, admin 128/15, cli 159/15, demo 124/22, edge 13, stack 13 | OK |

Rubric conflicts: none found (no asserting-nothing tests, no mandated verbatim duplication; CLI `ZERO_DECIMAL` duplicates the SPA table by design, A17 — ruled acceptable: packages must not depend on the SPA).

Scan clean. Rulings before Task 1:
- Ruling: A1 (`SQL SECURITY DEFINER` on the MV) is adopted as a spec correction, not a deviation — without it the collector breaks (verified in scratch) — cost if wrong: an extra clause on the view; runbook already says to create the view with a persistent admin.
- Ruling: A8 revenue includes renewals and is bucketed by billing time; spec said "join by sid" which is not needed for any requested total — cost if wrong: dashboard revenue differs from a "first purchase only" reading; documented in runbook and PR body.

## Task log

### Task 1 — DDL `002_funnel_hourly.sql` + MV + backfill + demo statements
- BASE 331299d. Implementer sonnet → DONE, commit f0f4ac2. Baseline at 331299d matched plan (core 492, admin 105, cli 148, demo 115, tf 12/6/12). GREEN: funnel-hourly 6/6, demo stack 7/7, core-api 498 (53 files), demo:test 117 (20 files). No flakes.
- Review package review-331299d..f0f4ac2.diff; reviewer sonnet dispatched.
- Review: ✅ spec, Approved, 0 Important. Minor deferred: (a) `sqlStatements`/apply loop duplicated in test helper vs `demo/lib/stack.mjs` (plan-mandated: demo and services cannot import each other) — Ruling: keep, note for final review; (b) `;` at end of a comment line would split a statement (current files safe) — defer; (c) `count()==2` on ReplacingMergeTree could flake if a background merge runs between inserts — defer, watch in rerun.
- Task 1: complete (f0f4ac2).

### Task 2 — ClickHouse client + analyticsDeps + config/server
- BASE f0f4ac2. Implementer sonnet → DONE, commit b10bc3a. RED as brief; GREEN 3 files 17/17 (incl. real container round-trip), core-api 505 (55 files).
- Review package review-f0f4ac2..b10bc3a.diff; reviewer sonnet dispatched.
- Review: ✅ spec, Needs fixes. Important #1: JSONEachRow parse outside the sanitising try → raw SyntaxError with body snippet (no kind, not retried). Minors: non-OK body never cancelled; `btoa` throws on non-Latin1; `String(v)` on nullish params; no malformed-body test.
- Ruling: fix #1 + minors 1–2 (one-liners) in fix round 1; defer nullish-param handling (callers in Tasks 3–4 pass scalars only) — cost if wrong: a literal 'undefined' param reaches ClickHouse → client error → 503, visible in tests.
- Fix round 1 (resume implementer sonnet), fix base b10bc3a.
- Fix round 1 → commit 0957ddb (parse failures → ClickhouseError unavailable + retry; error bodies cancelled; Buffer base64). Focused tests green (2 files); full core-api suite not rerun by implementer. Re-review package review-b10bc3a..0957ddb.diff; re-reviewer sonnet dispatched.
- Re-review: all 3 addressed, no new breakage. Task 2: complete (0957ddb). Note: full core-api suite not rerun after fix; Task 3's full-suite run covers it.

### Task 3 — `queries.js` (SQL on funnel_hourly)
- BASE 0957ddb. Implementer sonnet dispatched (asked to run full core-api suite, expected 56/514).
- Implementer → DONE_WITH_CONCERNS, commit 153c138. RED module missing; GREEN 9/9; full core-api 56 files / 515 tests (plan 514 + 1 from Task 2 fix round — expected; Expected counts for later tasks are +1 from here on). Review package review-0957ddb..153c138.diff; reviewer sonnet dispatched.
- Review: ✅ spec, Approved, 0 Important. Minors: (1) UInt64 → number relies on server default `output_format_json_quote_64bit_integers` (checked: no coercion in queries.js/clickhouse.js). Ruling: add `output_format_json_quote_64bit_integers: '0'` to the client query string in the final fix wave (one line in Task 2's file, pins behaviour across server configs) — cost if wrong: none, explicit setting; (2) `v && …` treats v=0 as no filter — versions start at 1, defer; (3) totals row unguarded — aggregate without GROUP BY always yields one row, defer.
- Task 3: complete (153c138).

### Task 4 — `revenue.js` (Postgres money)
- BASE 153c138. Implementer sonnet dispatched.
- Implementer → DONE, commit 5392f09. RED module missing; GREEN 5/5; full core-api 57 files / 520 tests. Review package review-153c138..5392f09.diff; reviewer sonnet dispatched.
- Review: ✅ spec, Approved, 0 Important. 520 = 519 + Task 2 fix test (confirmed, not noise). Minors deferred: breakdown `v` keys sort lexicographically in revenue.js (service.js merges and re-sorts by sessions — check in Task 5 review); overview refund `::bigint` cast on our own outbox payload; `if (v)` with v=0; coverage breadth (exclusive `to`, non-UTC session tz).
- Task 4: complete (5392f09).

### Task 5 — `service.js` (range, merge, cache)
- BASE 5392f09. Implementer sonnet dispatched.
- Implementer → DONE, commit 5e56fc6. RED module missing; GREEN 11/11; full core-api 58 files / 531 tests. Review package review-5392f09..5e56fc6.diff; reviewer sonnet dispatched.
- Review: ✅ spec, Approved, 0 Important. Minors: (1) `by` not validated in service — Task 6 route schema must enforce enum {hour, day} (carried to Task 6 dispatch + review); (2) breakdown `v` key ties sort as text ('10' < '9') — Ruling: defer to final fix wave together with Task 4's note (numeric compare when dim === 'v'); (3) `Queries.BREAKDOWN_LIMIT` from the real module not the injected one — cosmetic; (4) `funnelIdOf` runs on cache hits (cheap, keeps deleted funnels from serving cache) — accept; (5) cached object returned by reference — Task 6 must not mutate responses (carried); (6) test-strength notes.
- Task 5: complete (5e56fc6).

### Task 6 — routes `src/http/analytics.js` + conditional registration
- BASE 5e56fc6. Implementer sonnet dispatched.
- Implementer → DONE, commit 4305f10. RED 17 failed/1 passed; GREEN 18/18; full core-api 59 files / 549 tests. Review package review-5e56fc6..4305f10.diff; reviewer opus dispatched (auth/log surface).
- Review (opus): ✅ spec, Approved, 0 Important. Minors: unknown query keys stripped by Fastify default (same as all routes); 549 vs brief 548 = Task 2 fix test (reconciled here); coverage gaps (cache-control absent on 400/404, plain error → 500).
- Task 6: complete (4305f10).

### Task 7 — CLI `ikf stats`
- BASE 4305f10. Implementer sonnet dispatched.
- Implementer → DONE, commit 3cdff63. RED 11 failed; GREEN 11/11; full cli 15 files / 159 tests. Review package review-4305f10..3cdff63.diff; reviewer sonnet dispatched.
- Review: ✅ spec, Approved, 0 Important. Minors deferred: `Number(values.days)` accepts `1e1`; two-decimal assumption for non-zero-decimal currencies (Paddle has none with 3); `slug` not URI-encoded in `funnelStats` (validated by SLUG_RE first); coverage of `--days=7`.
- Task 7: complete (3cdff63).

### Task 8 — SPA client + format + RangePicker + charts
- BASE 3cdff63. Implementer sonnet dispatched.
- Implementer → DONE, commit 34cdf0f. RED missing import; GREEN 9/9; full admin 13 files / 114 tests; build OK. Review package review-3cdff63..34cdf0f.diff; reviewer sonnet dispatched.
- Review: ✅ spec, Approved, 0 Important. Minors (all plan-mandated) deferred: y-max shows floored 1 on all-zero series and no thousands separator; keys by label/t (breakdown keys unique per GROUP BY); negative/NaN bar value unclamped; SVG a11y; `ZERO_DECIMAL` case-sensitive (API returns upper-case ISO codes); `query` helper shadowed by `lookupCustomers(query)` param; coverage gaps. Candidates for final fix wave if the final reviewer flags: y-max formatting.
- Task 8: complete (34cdf0f).

### Task 9 — SPA Dashboard
- BASE 34cdf0f. Implementer sonnet dispatched.
- Implementer → DONE, commit 0beb619. RED 12 failed/14 passed (3 files) as brief; GREEN 26/26; full admin 14 files / 121 tests, no warnings; build OK. Review package review-34cdf0f..0beb619.diff; reviewer sonnet dispatched.
- Review: ✅ spec, Approved, 0 Important. Minors deferred: no effect cleanup on unmount (token already guards; React 18 ignores); slug comparator never returns 0; cosmetic guard.
- Task 9: complete (0beb619).

### Task 10 — SPA Funnel detail → tab Số liệu
- BASE 0beb619. Implementer sonnet dispatched (runs admin suite + demo e2e đợt 1 alone).
- Implementer → DONE, commit 7e2e729. RED 7 failed/121 passed; GREEN admin 15 files / 128 tests, no warnings; build OK; e2e đợt 1 (`?tab=main`) 1 passed. Ports free after. Review package review-0beb619..7e2e729.diff; reviewer sonnet dispatched.
- Review: ✅ spec, Approved, 0 Important. Minors (plan-mandated): (1) non-monotonic milestones render "rơi -50.0%" — candidate for final fix wave (clamp at 0); (2) unknown/ungranted `?tab=` falls to Tổng quan with no `aria-selected` — candidate (normalise to stats); (3) `setParams({tab})` drops other params (none exist today); (4) version select desyncs after a stats error; (5) coverage gaps.
- Task 10: complete (7e2e729).

### Task 11 — Demo (ClickHouse deps, sample seed, e2e đợt 3, README)
- BASE 7e2e729. Implementer sonnet dispatched (runs `demo:test` alone once).
- Implementer → DONE, commit 5799d7a. sample 6/6 (RED module missing); e2e đợt 3 1 passed; `demo:test` 22 files / 124 tests, no flakes; ports free; shared `ikf` DB untouched. Optional intermediate e2e RED skipped (brief marked it optional) — accepted. Review package review-7e2e729..5799d7a.diff; reviewer sonnet dispatched.
- Review: ✅ spec, Approved, 0 Important. Minors: `--seed` without `--funnel` seeds every funnel row while README says "published" — candidate for final fix wave (reword README or filter); plain Error for a missing funnel on the CLI path; e2e DB `ikf_admin_p3_test` never dropped (p2 same); `toBe(432)` checks generated data.
- Task 11: complete (5799d7a).

### Task 12 — Terraform + runbook + CLAUDE.md
- BASE 5799d7a. Implementer sonnet dispatched.
- Implementer → DONE, commit 9c820e5. RED edge 11/2 fail, stack 12/1 fail; GREEN edge 13, core-service 6, stack 13; fmt clean; staging/prod validate OK; rate-limit-path test 1 passed. Review package review-5799d7a..9c820e5.diff; reviewer sonnet dispatched. Task 13 rerun started in background in parallel.
- Review: ✅ spec, Approved, 0 Important. Minors: runbook grants `ikf_reader` SELECT on `ikf.events` too though queries read only `funnel_hourly` — Ruling: narrow to `funnel_hourly` in runbook + Task 1 test (fix wave; plan-mandated deviation, safer: a leaked reader credential cannot read raw `sid`/ip_hash) — cost if wrong: a future query on `events` needs a GRANT (documented); consumer-insert check lives under step 2 but refers to step 1 — move into step 1 (fix wave); `clickhouse client` password prompt unmentioned.
- Task 12: complete (9c820e5).

### Task 13 — full rerun + final review
- Rerun started in background at HEAD 9c820e5 (log task-13-rerun.log). Final whole-branch reviewer (opus) dispatched on 331299d..9c820e5, report → final-review.md.
- Task 13 rerun at 9c820e5: paddle 34, event-schema 145, funnel-lint 35, sdk 159 (8154 B gzip unchanged), cli 159 (15 files), edge-router 106, event-consumer 8+27, core-api 549 (59 files), route-match 35, admin 128 (15 files); demo:test 123/124 — the one failure is the pre-existing `paddle-fake` 1 ms flake (passes alone: 7/7); terraform fmt clean; edge 13 / core-service 6 / stack 13; staging + prod validate OK; tree clean; no listeners left. Task 13: complete (pending final review fix wave → rerun again after).
- Final review (opus): Ready to merge **with fixes** — 0 Critical, 2 Important (I1 slow-ClickHouse queries never cancelled server-side + retried → add `max_execution_time`/`cancel_http_readonly_queries_on_client_close` settings; I2 runbook: Cloud SQL console can capture a personal DEFINER, no rollback), 6 Minor (M1 new funnel lands on Số liệu; M2 money hidden when no events; M3 no in-flight coalescing; M4 overview lists ClickHouse-only slugs; M5 no Postgres indexes; M6 partial first day bucket). Agrees with all 8 fix-wave candidates; promotes none of the parked.
- Ruling: ONE fix wave = I1, I2, candidates 1–8, M1–M4 (brief `fix-wave-brief.md`, 4 commits). Left out: M5 (indexes — already in plan "Theo sau" 4; add when volume warrants), M6 (cosmetic partial-day bucket). Cost if wrong: a later migration / a label.
- Fix-wave implementer: opus (cross-cutting, 3 workspaces + docs), dispatched.
- Fix wave (opus) → DONE_WITH_CONCERNS: aebecc8 (core-api: F1 settings `max_execution_time`/`cancel_http_readonly_queries_on_client_close`/`output_format_json_quote_64bit_integers`, F2 coalescing, F3 numeric v tie-break, F4 overview drops unknown slugs, F5 reader grant narrowed, F6 definer `ikf_mv` verified on 25.8), b64f8c2 (admin: F7 "tăng x%", F8 `?tab=` normalised, F9 new funnel → `?tab=main`, F10 money shown without events, F11 y-max real max), 319a175 (README --seed wording), ae40d6b (runbook: definer ikf_mv, no SQL console, consumer check + rollback in §1, reader funnel_hourly only + not readonly=1, lag check). Deviations accepted: `analytics-setup.test.js` URL assertion also edited (needed); F16 `readonly=1` → `unavailable` (verified), runbook matches. core-api 554 (was 549), admin 132 (was 128), build OK.
- Scoped re-review (opus) dispatched on 9c820e5..ae40d6b → final-rereview.md. Final full rerun started in background (final-rerun.log).


---

# Deferred findings and rulings — plan 2026-10-12-admin-console-p3 (Tasks 1–11)

Per-task reviews approved every task; one fix round (Task 2). Items below were judged Minor by the task reviewers and parked for the final whole-branch review. The final reviewer should treat them as known, judge whether any rises above Minor in the whole-branch view, and may add to the fix-wave list.

## Fix-wave candidates (controller rulings so far)
1. `services/core-api/src/analytics/clickhouse.js` — add `output_format_json_quote_64bit_integers: '0'` to the query string so UInt64 counts come back as numbers regardless of server config (today relies on 25.8 default; Tasks 3–5 assume numbers).
2. Breakdown `v` keys tie-break as text (`'10' < '9'`) in `revenue.js` and `service.js` — compare numerically when `dim === 'v'`.
3. `apps/admin/src/components/StatsTab.jsx` — non-monotonic milestones render "rơi -50.0%" (checkout_click is funnel-emitted, leads is `lead`); clamp at 0 or label "tăng".
4. `apps/admin/src/pages/FunnelDetail.jsx` — unknown `?tab=` or `?tab=prices` without `prices:read` falls to Tổng quan with no `aria-selected`; normalise to `stats`.
5. `demo/events.mjs` `--seed` without `--funnel` seeds every `funnels` row; README says "every published funnel" — filter or reword.
6. `apps/admin/src/components/charts/LineChart.jsx` — `y-max` shows the floored 1 on an all-zero series and no thousands separator; show `fmtNum(real max)`.

7. `docs/runbooks/analytics.md` + `services/core-api/test/funnel-hourly.test.js` — `ikf_reader` is granted SELECT on `ikf.events` as well; queries read only `funnel_hourly`. Narrow the grant to `funnel_hourly` (least privilege: a leaked reader credential must not read raw `sid`/`ip_hash`).
8. `docs/runbooks/analytics.md` — the "check the consumer still inserts" step sits under step 2 but refers to step 1; move it into step 1.

## Parked (no action unless the final reviewer disagrees)
- Task 1: `sqlStatements`/apply loop duplicated between `test/helpers/clickhouse.js` and `demo/lib/stack.mjs` (plan-mandated: demo and services cannot import each other); `;` at the end of a `--` comment line would split a statement (current SQL safe); `count()==2` on ReplacingMergeTree could flake under a background merge.
- Task 2: `String(v)` on nullish params (callers pass scalars only).
- Task 3/4: `v && …` treats v=0 as no filter (versions start at 1); overview refunds `::bigint` cast on our own outbox payload; totals row unguarded (aggregate w/o GROUP BY always one row).
- Task 5: `funnelIdOf` runs on cache hits (cheap, keeps deleted funnels from serving cache); `Queries.BREAKDOWN_LIMIT` read from the real module not the injected one; cached objects returned by reference (routes don't mutate).
- Task 6: unknown query keys stripped by Fastify default (same as every route); coverage: cache-control absent on 400/404, plain error → 500.
- Task 7: `Number(values.days)` accepts `1e1`; two-decimal assumption for non-zero-decimal currencies; `slug` not URI-encoded in `funnelStats` (SLUG_RE first).
- Task 8: keys by label/t (breakdown keys unique); negative/NaN bar value unclamped; SVG a11y (`role="img"` hides `<title>`); `ZERO_DECIMAL` case-sensitive (API returns upper-case codes); `query` helper shadowed by a `lookupCustomers(query)` param in `api.js`.
- Task 9: no effect cleanup on unmount (token guards); slug comparator never returns 0.
- Task 10: `setParams({tab})` drops other params (none exist); version select desyncs after a stats error.
- Task 11: plain `Error` for a missing funnel on the CLI `--seed --funnel` path; e2e DB `ikf_admin_p3_test` never dropped (same as p2); `toBe(432)` checks generated data.

## Rulings made during execution
- A1 (`SQL SECURITY DEFINER` on the MV) adopted as a spec correction (verified in scratch: without it `ikf_writer` inserts fail).
- A8 revenue includes renewals, bucketed by billing time; no `sid` join between stores.
- Task 2 fix round: parse failures of a 200 body → `ClickhouseError('unavailable')` + one retry; non-OK bodies cancelled; Buffer base64 for Basic auth.
- Test counts: core-api is +1 vs the plan from Task 3 on (Task 2 fix-round test): 549 at Task 6.
- Task 11: optional intermediate e2e RED skipped — accepted.

# Analytics like FunnelFox (KPIs, Conversion rate, Transactions, Cohorts) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** console section **Số liệu** with Tổng quan (8 KPIs + Δ, trend, group-by, CSV), Conversion rate, Transactions (cursor list + CSV) and Cohorts (LTV, Renewal %, Churn %), read live from Postgres money and ClickHouse sessions.

**Architecture:** migration 014 adds `transaction_adjustments` (refunds/chargebacks, written by billing sync, backfilled from outbox) and two indexes; a Postgres module derives per-subscription facts (type, start, churn) at read time; new analytics modules (kpis, series, conversion, transactions, cohorts) behind the existing 30 s cached `analyticsService` and `/v1/analytics/*` grant/scoping; SPA tabs, CLI commands, a 6-month subscription demo seeder and e2e.

**Tech Stack:** Node ESM, Fastify 5, Postgres 17 + ClickHouse 25.8 (Testcontainers via colima: `export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock TESTCONTAINERS_RYUK_DISABLED=true TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=$HOME/.colima/default/docker.sock`), Vitest, React SPA (happy-dom + Testing Library), Playwright demo e2e.

**Spec:** `ifunnel/docs/specs/2026-10-20-analytics-cohorts-design.md` (the authority).

**Worktree:** `/Users/daothinh/ikf-platform-analytics`, branch `feat/analytics-cohorts` (base `main` f53a762).

**Ruling P0:** not scratch-verified; tasks give interfaces, files and tests; implementers write the code test-first in the neighbouring style (`src/analytics/revenue.js`, `queries.js`, `service.js`, `src/http/analytics.js`, `test/analytics-*.test.js`).

## Global Constraints

- SDK (`packages/sdk`) and edge (`workers/`) unchanged; SDK bundle byte-identical.
- Never sum amounts across currencies; money is `{currency, amount_minor}` lists, ARPU/ARPPU/LTV/cohorts take one `currency`.
- PAID statuses = `PAID` from `src/billing/sync.js` (`paid`, `completed`); billed time = `COALESCE(t.billed_at, t.paddle_updated_at)`.
- Every SQL value bound (`$n` / ClickHouse `{name:Type}`); no string-built values; dimension/metric names only from fixed whitelists.
- Logs: no email, `user_id`, token, `err.message` of SQL/ClickHouse errors, SQL params, IP or UA. Lists show `customer_ref` only.
- Grants/scoping exactly as `/v1/analytics/overview` (p4a/p4b): viewer; `app` out of scope → `404 app_not_found`; limited viewer without `app` → their apps only, never unassigned funnels; `funnel` out of scope → `404 funnel_not_found`.
- Range limits: `by=day` ≤ 90 days, `week` ≤ 182 days, `month` ≤ 366 days → else `400 invalid_range`; week = ISO Monday UTC; month = UTC calendar month.
- Migration starts `SET LOCAL lock_timeout = '5s'`; idempotent.
- Commit trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; no bare `git stash`. SPA/CLI copy Vietnamese, metric names as FunnelFox (Net revenue, ARPU, ARPPU, LTV, Churn rate); error codes English.
- The demo must not change `services/`, `workers/`, `packages/` (demo tasks only touch `demo/`, docs).

## Review Focus

1. A subscription whose first transaction has no `checkout_id` (renewal-only data, unmapped price) → counted with `subscriptions.funnel_id`/`plan_key`, never dropped from totals; with `funnel_id` NULL it is invisible to a scoped viewer. Test in Task 2.
2. A refund in a later period than its payment → net of that later period goes down (may be negative), the payment period unchanged; in cohorts the refund lands in its own period. Tests in Tasks 2 and 4.
3. Transactions with identical `billed_at` across a page boundary → no row repeated or skipped (cursor = `billed_at|paddle_transaction_id`). Test in Task 3.
4. CSV cells starting with `=`, `+`, `-`, `@` or containing `,` `"` newline → quoted and formula-guarded (server and client CSV). Tests in Tasks 3 and 6.
5. Range/currency with no data (new app, JPY only) → zeros/nulls and empty tables, never a 500 or NaN in the UI. Tests in Tasks 2, 4, 6.

---

### Task 1: Migration 014 + billing sync adjustments

**Files:**
- Create: `services/core-api/migrations/014_analytics.sql` (spec §1 verbatim)
- Modify: `services/core-api/src/billing/sync.js` (adjustment branch ~:184-196: insert `transaction_adjustments` in the same DB transaction as the outbox row, `ON CONFLICT (paddle_adjustment_id) DO NOTHING`, `created_at` = adjustment `created_at` from Paddle, kind `refund`/`chargeback`); `services/core-api/src/analytics/revenue.js` (`moneyOverview` refunds read `transaction_adjustments` instead of `outbox`; same answers)
- Test: `services/core-api/test/analytics-schema.test.js` (new), extend the sync/reconcile test that covers adjustments (find with `grep -ln adjustment services/core-api/test`), `analytics-revenue.test.js` stays green

**Interfaces (produces):** table `transaction_adjustments(paddle_adjustment_id PK, paddle_transaction_id, kind, amount_minor, currency, created_at)`; `export const ADJUSTMENT_KINDS = ['refund', 'chargeback']` in `sync.js`.

- [ ] Tests: migration applies twice; backfill copies one refund and one chargeback outbox row, skips a payload without `adjustment_id`; sync of an approved refund writes one row and a replay writes none; a rejected chargeback writes none; overview refunds unchanged (existing tests) → fail → implement → full core-api suite green
- [ ] Commit `feat(core): transaction_adjustments (migration 014), sync writes refunds/chargebacks`

### Task 2: Money facts, KPIs and series

**Files:**
- Create: `services/core-api/src/analytics/money.js`, `services/core-api/src/analytics/kpis.js`, `services/core-api/src/analytics/periods.js`
- Modify: `services/core-api/src/analytics/queries.js` (sessions per bucket for `by=week|month` and per group `country|device|v|utm_source|utm_campaign|funnel` from `funnel_hourly`, `name = 'page_load'` sessions as today's overview counts them)
- Test: `services/core-api/test/analytics-money.test.js`, `analytics-kpis.test.js`, `analytics-periods.test.js`

**Interfaces (produces):**
- `periods.js`: `resolvePeriodRange({from, to, by}, nowMs)` → `{from: Date, to: Date, by}` (snaps `from` down / `to` up to the unit, limits from Global Constraints, `400 invalid_range` with `{reason, by, max_days}`); `periodStarts(range)` → epoch ms[]; `previousRange(range)` → range of equal length just before; `PG_TRUNC = {day: 'day', week: 'week', month: 'month'}` (Postgres `date_trunc(unit, ts, 'UTC')`; week is ISO Monday); ClickHouse equivalents `toStartOfDay/toMonday/toStartOfMonth` with `'UTC'`.
- `money.js`:
  - `SUB_FACTS_CTE` (SQL text, bound params only via callers) yielding per subscription: `paddle_subscription_id, customer_id, funnel_id, app_id, v, plan_key, utm_source, utm_campaign, started_at, paid_started_at, trial (bool), churned_at` (spec decisions 5–6; first-purchase checkout via the subscription's first paid transaction's `checkout_id`, fallback `subscriptions.funnel_id`/`plan_key`).
  - `TX_TYPED_CTE` yielding every paid transaction with `type ∈ ('free_trial','trial_conversion','new','renewal','one_time')` and its first-purchase dims (one-time: its own checkout).
  - `scopeSql({app, appIds, funnelId}, args)` → `" AND …"` on `app_id`/`funnel_id` (appIds excludes NULL app).
  - `moneySeries(pool, {range, metric, group, currency, scope})` → `{buckets, series:[{key, points}]}` for `net_revenue, gross_revenue, refunds` (points = `[{currency, amount_minor}]`, or number when `currency` given), `new_subscriptions, active_subscriptions, churned, churn_rate, trials_started, trials_converted, purchases, arppu`.
  - `GROUPS_MONEY = ['app','funnel','v','plan','utm_source','utm_campaign','currency']`, `GROUPS_SESSIONS = ['funnel','v','utm_source','utm_campaign','country','device']`.
- `kpis.js`: `kpis({pool, clickhouse}, {range, currency, scope})` → spec §2 `kpis` answer for one range; `kpisWithPrevious(...)` adds `previous` + `previous_kpis`; ClickHouse error → `sessions/arpu/start_to_purchase: null`, `analytics: 'unavailable'` (money still answered); rates null when base 0.

- [ ] Tests (Postgres + ClickHouse containers, fixture builder in `test/helpers/` creating customers/subscriptions/transactions/checkouts/adjustments with explicit times):
  - type classification: trial($0) → conversion → 2 renewals; direct new → renewal; one-time; refund of the 2nd renewal in a later month
  - active at period end counts a running trial and excludes a canceled sub; scheduled cancel still active; churn rate = churned / (active at start + new)
  - net = gross − refunds bucketed by own time (later refund makes that month negative)
  - week buckets start Monday 00:00 UTC; month buckets on the 1st; range limits 400
  - subscription whose first transaction has no checkout → counted via `subscriptions.funnel_id`; NULL funnel hidden from `appIds` scope (Review Focus 1)
  - two currencies never summed; `currency` given → numbers; no data → zeros / null rates (Review Focus 5)
  - kpis previous period; ClickHouse down → money present, sessions null
- [ ] Implement → pass → full core-api suite green
- [ ] Commit `feat(core): analytics money facts, KPIs and series`

### Task 3: Conversion rates and transactions list

**Files:**
- Create: `services/core-api/src/analytics/conversion.js`, `services/core-api/src/analytics/transactions.js`, `services/core-api/src/analytics/csv.js`
- Test: `services/core-api/test/analytics-conversion.test.js`, `analytics-transactions.test.js`, `analytics-csv.test.js`

**Interfaces (produces):**
- `conversion({pool, clickhouse}, {range, scope})` → `{rates:{start_to_2nd, second_to_lead, start_to_checkout, checkout_to_purchase, start_to_purchase, start_to_subscription, trial_to_paid}: {value|null, num, den}, previous: {…}, series:{<rate>:[{t, value|null}]}}`. Start = sessions with `screen_view` screen 1 (fallback `page_load`), 2nd = screen 2, lead = `lead`, checkout = `checkout_click` (ClickHouse `funnel_hourly`); purchase = paid checkouts (Postgres); subscription = paid checkouts whose transaction has a subscription; trial_to_paid = free trials started in range with a later `trial_conversion`.
- `listTransactions(pool, {range, scope, type, status, currency, before, limit=50})` → `{items, next_before, summary}` (spec §2; `before` = `"<ISO billed>|<paddle_transaction_id>"`, order `billed DESC, id DESC`, `limit` 1..200, `status` filter over all statuses, default only PAID; `refunded_minor` = sum of adjustments of the row).
- `transactionsCsv(pool, q)` → string; > 10 000 rows → `HttpError(413, 'too_many_rows')`.
- `toCsv(header: string[], rows: any[][])` → RFC 4180, CRLF, cells starting with `= + - @` prefixed `'`.

- [ ] Tests: each rate on a fixture (num/den exact), ClickHouse down → Postgres rates present, ClickHouse ones null; paging over 5 rows with equal `billed_at` and limit 2 → all 5 once (Review Focus 3); filters type/status/currency/funnel; summary per currency; CSV quoting/injection (Review Focus 4) and 413 cap (inject a small cap for the test via an option `maxRows`)
- [ ] Implement → pass → commit `feat(core): conversion rates, transactions list and CSV`

### Task 4: Cohorts

**Files:** Create `services/core-api/src/analytics/cohorts.js`; Test `services/core-api/test/analytics-cohorts.test.js`.

**Interfaces (produces):** `cohorts(pool, {range, by, mode, currency, group, scope, filters:{plan, utm_source}}, {now})` → `{currency, by, periods, cohorts:[{key?, start, size, values}], summary:{size, values}, ltv}`; `mode ∈ ['revenue_cumulative','revenue_incremental','arppu_cumulative','renewal','churn']`; `values[k] = null` for periods not reached (period start > now); `ltv` only for revenue modes (`total net / size`, minor units, per cohort as `cohorts[i].ltv` and overall); summary: totals for revenue modes, size-weighted average otherwise; `group ∈ ['funnel','plan','utm_source']` → cohorts keyed `{key, start}`.

- [ ] Tests on one hand-computed fixture (3 monthly cohorts, sizes 4/3/2): every mode's matrix exactly; refund lands in its own period and can make an incremental cell negative (Review Focus 2); P0 includes the first payment; free-trial customers join the cohort at their first paid > 0 transaction; not-reached cells null; currency filter excludes other-currency customers; group by plan; empty scope → `cohorts: []` (Review Focus 5); week cohorts on Mondays
- [ ] Implement → pass → commit `feat(core): subscription cohorts (LTV, renewal, churn)`

### Task 5: HTTP routes + service wiring

**Files:** Modify `services/core-api/src/analytics/service.js` (methods `kpis`, `series`, `conversion`, `transactions`, `transactionsCsv`, `cohorts`; cache key includes scope + every query field; transactions list and CSV **not** cached), `services/core-api/src/http/analytics.js` (spec §2 routes and schemas, `additionalProperties: false`, enums from the whitelists, `group_not_supported` 400 for a metric/group pair the module rejects, CSV `content-type: text/csv; charset=utf-8`, `content-disposition: attachment; filename="transactions.csv"`, `cache-control: private, no-store` on transactions). Test `services/core-api/test/analytics-v2-http.test.js`.

- [ ] Tests: role table (viewer 200, limited viewer scoped, out-of-scope app/funnel 404 identical body), each schema (bad enum, `limit` 201, range too long), ClickHouse 503 only for routes whose answer has no Postgres part (none of the new ones: they degrade to nulls), CSV headers, existing analytics HTTP tests untouched
- [ ] Implement → pass → full core-api suite → commit `feat(core): /v1/analytics kpis, series, conversion, transactions, cohorts`

### Task 6: Admin console Số liệu

**Files:**
- Create: `apps/admin/src/pages/Analytics.jsx`, `pages/analytics/{Overview,Conversion,Transactions,Cohorts}.jsx`, `components/{KpiCard,HeatTable,AnalyticsFilters}.jsx`, `lib/csv.js`
- Modify: `apps/admin/src/App.jsx` (`/analytics`, `/apps/:id/analytics`, `/` → `/analytics`), `Layout.jsx` (NAV "Dashboard" → "Số liệu" `/analytics`; APP_NAV entry "Số liệu"), `api.js` (`getKpis, getSeries, getConversion, listTransactions, transactionsCsvUrl, getCohorts`), `test/helpers.jsx` (fake defaults), `components/RangePicker.jsx` (presets 7/14/30/90/180/365 d, "Tháng này", "Tháng trước" for the new pages only; existing callers unchanged)
- Test: `apps/admin/test/analytics-*.test.jsx`

Behaviour per spec §3: filters in the URL query (`range, by, app, funnel, currency, tab-specific`), KPI Δ colour (green = better; churn lower is better), Top 5/10/All, client CSV via `lib/csv.js` (same quoting/guard as server), transactions "Tải thêm" via `next_before`, customer link only with `support` in the app, cohort heat cells scaled to the 95th percentile with "—" for null, mode/granularity/currency/group selects, LTV column only in revenue modes. The old Dashboard page content becomes the Tổng quan group-by table (per app/funnel rows) — keep its `data-testid="overview-row"` so existing tests and the p3 e2e keep passing.

- [ ] Tests: tabs + URL round trip (reload keeps filters), KPI card values/Δ colours incl. churn inversion and null → "—", series group Top 5, CSV content (Review Focus 4), transactions paging and support-only link, cohort heat table (null cells, LTV column toggling), empty states (Review Focus 5), existing dashboard tests updated only where the route moved
- [ ] `npm test -w @ikf/admin` and `npm run build -w @ikf/admin` green → commit `feat(admin): Số liệu — KPIs, conversion rate, transactions, cohorts`

### Task 7: CLI

**Files:** `packages/cli/src/main.js`, `packages/cli/src/api.js`; Test `packages/cli/test/analytics-v2.test.js`. Commands per spec §4 (`ikf kpis`, `ikf tx ls`, `ikf cohorts`), usage text, whitelist; money printed per currency with `fmt` helpers already used by `ikf stats`.

- [ ] Tests (fake API like `stats.test.js`): argument validation, output tables, `--days` → range, `--mode` mapping (`revenue` → `revenue_cumulative`)
- [ ] Implement → pass → commit `feat(cli): kpis, tx ls, cohorts`

### Task 8: Demo seeder, e2e, docs

**Files:** `demo/lib/sample-subs.mjs` (spec §5; deterministic PRNG seeded by funnel slug; fixed ids `sub_demo_*`, `txn_demo_*`, `adj_demo_*`, `ctm_demo_*`; idempotent `ON CONFLICT DO NOTHING`; writes Postgres only — sessions from the existing 3-day sample), `demo/events.mjs` (`--seed` also runs it), `demo/test/analytics-e2e.test.mjs` (own ports e.g. 9077/8378/9079/9078/9081/9082, DB `ikf_analytics_test`; flow of spec §5), `demo/README.md`, runbook `docs/runbooks/analytics.md` new section "Số liệu (KPIs, Conversion, Transactions, Cohorts)" with every metric's definition (spec decisions 3–11), CLAUDE.md conventions bullet.

- [ ] e2e green, `npm run demo:test` green → commit `feat(demo): 6-month subscription sample, analytics e2e; docs`

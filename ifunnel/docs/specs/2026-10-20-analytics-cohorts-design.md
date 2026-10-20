# Analytics like FunnelFox: Overview KPIs, Conversion rate, Transactions, Cohorts (LTV, churn) — Design Spec

> The console's numbers grow from "sessions → paid + gross revenue per funnel" (admin console p3) to the FunnelFox analytics set: KPI cards with change vs the previous period, a trend chart and a group-by table; conversion rates; a transactions list; subscription cohorts with LTV, renewal and churn. Code lives in `ikf-platform`, branch `feat/analytics-cohorts`, cut from `main` (f53a762). Requested in chat on 2026-10-20 ("làm thêm LTV và churn theo cohort, cả conversion rate, transactions, cohorts … làm luôn, giống FunnelFox"); every choice below is a ruling, modelled on FunnelFox's Analytics docs (funnelfox.com/docs/dashboard/analytics).

**Goal:** the growth team reads, in our console, the numbers they read in FunnelFox today — net revenue, subscriptions, churn, ARPU/ARPPU, step conversion, every transaction, and how much a cohort of buyers is worth after N weeks/months — so FunnelFox is not needed to judge a funnel.

**Definition of done:**
- **Demo:** `npm run demo` → `npm run demo:events -- --seed` also writes 6 months of customers, subscriptions (weekly and monthly, some with a free trial), renewals, cancellations and refunds → console **Số liệu**: Tổng quan shows the 8 KPI cards with a delta, the trend chart and the group-by table; Conversion rate shows the rate cards and the step bars; Transactions lists rows with type New / Renewal / Trial / Trial conversion / One-time and a refund mark, filters and a CSV download; Cohorts shows a monthly cohort table with LTV, a heatmap and the Renewal % / Churn % modes. Playwright e2e covers this.
- **No SDK or edge change;** the SDK bundle stays byte-identical.
- **Old tests:** every existing test passes; the existing `/v1/analytics/*` routes answer as before.

## Decisions

| # | Item | Choice |
|---|---|---|
| 1 | Where | One console section **Số liệu** (`/analytics`, and `/apps/:id/analytics` with the app fixed) with tabs **Tổng quan · Conversion rate · Transactions · Cohorts**. Nav "Dashboard" becomes "Số liệu" (same first place); `/` redirects to `/analytics`. The funnel page's "Số liệu" tab stays as is |
| 2 | Who | `viewer` (in the app, or `'any'` filtered to scope like the overview, p4b) for every tab; the Transactions list shows `customer_ref` to all viewers but links to the customer page only for `support` (refs are not PII; emails never appear) |
| 3 | Money source | Postgres only. **Gross** = `transactions.amount_minor` of paid rows (`PAID` = `paid`, `completed`), tax included as today. **Refunds** = a new table `transaction_adjustments` (refund + chargeback, amount, currency, time) written by billing sync and backfilled from `outbox`. **Net** = gross − refunds, both bucketed by their own time (a refund lands in its own period, may make a period negative, as in FunnelFox) |
| 4 | Currency | Never summed across currencies. KPI money cards and the table show one line per currency (as today). Cohorts, ARPU, ARPPU and LTV take one **currency** (select; default the currency with the most paid transactions in range) |
| 5 | Transaction type | Computed per subscription at read time from its paid transactions in `billed_at` order: amount 0 first → **Free trial**; first amount > 0 after a free trial → **Trial conversion**; first amount > 0 otherwise → **New**; later > 0 → **Renewal**; no `paddle_subscription_id` → **One-time**. (Paddle bills a free trial as a $0 transaction) |
| 6 | Subscription facts | Start = first paid transaction (any amount); paid start = first amount > 0; churned at = `canceled_at` when `status = 'canceled'` (a scheduled cancel or `past_due` is not churn yet). Active at t = paid start ≤ t and not churned at t; a running free trial counts as active (FunnelFox: "paid subscriptions and running trials") |
| 7 | KPIs (Tổng quan) | Net revenue · New subscriptions (paid start in period) · Active subscriptions (at range end) · Sessions · ARPU (net / sessions) · ARPPU (net / unique paying customers in period) · Churn rate (churned in period / (active at period start + new in period)) · Start → Purchase (paid checkouts / sessions). Each with Δ % vs the previous period of equal length. ARPU/ARPPU use the chosen currency |
| 8 | Trend + group by | Clicking a card picks the metric for a line chart by **day / week / month** (week = ISO Monday, UTC). Group by: **App · Funnel · Version · Plan · UTM source · UTM campaign · Currency** (money metrics: via the first purchase's checkout); Sessions also by Country and Device (ClickHouse); a dimension the metric lacks is disabled. Table shows Top 5 / Top 10 / All, sortable, **CSV** (client-side) |
| 9 | Conversion rate | Rates per range and funnel filter: Start → 2nd screen, 2nd screen → Lead (email), Start → Checkout click, Checkout click → Purchase, Start → Purchase, Start → Subscription (paid checkouts with a subscription), Trial → Paid (free trials started in range that converted, by their subscription). Each a card with Δ; a line chart of the selected rate by day/week/month; and **By step** bars (first-screen-relative) + line (previous-step %) for one chosen funnel, reusing `funnel_hourly` |
| 10 | Transactions list | Newest first, keyset cursor (`before` = `billed_at|paddle_transaction_id`, `next_before` in the answer), page 50 (max 200). Columns: time (UTC), customer ref, app, funnel@v, plan, type, status, amount, currency, refunded amount. Filters: range, app, funnel, type, status, currency. Summary above the table: count and gross / refunds / net per currency for the filtered range. **CSV**: `GET …/transactions.csv` with the same filters, at most 10 000 rows (`413 too_many_rows` above) |
| 11 | Cohorts | Unit = **paying customer** (customer with a paid transaction amount > 0 in scope; scope = app / funnel / plan / UTM filters via the first purchase's checkout). Cohort = calendar period (day / week / month) of the customer's first paid > 0 transaction in scope, within the range. Columns P0…Pn (n until now; "—" for periods not reached). Modes: **Revenue (cumulative)** (net per period summed up, with LTV = total net / size), **Revenue (incremental)**, **ARPPU (cumulative)** (cumulative net / size), **Renewal %** (customers with a Renewal or Trial conversion transaction in period k / size, k ≥ 1), **Churn %** (customers whose every subscription in scope is churned by the end of period k / size). Summary row: total for revenue, size-weighted average for the others. Heatmap scaled to the 95th percentile. Group by Funnel · Plan · UTM source (one block per group, Top 5/10/All). Range max 12 months by month, 26 weeks by week, 90 days by day |
| 12 | Freshness | Live from Postgres (FunnelFox refreshes daily); the 30 s cache of the analytics service covers every new route |
| 13 | Ranges | New ranges for money tabs: 7 / 14 / 30 / 90 / 180 / 365 days and "Tháng này", "Tháng trước". Sessions come from ClickHouse (13-month TTL): ranges past that show sessions only for the covered part with a note |
| 14 | Not available | Country, device, payment method and card type on money (we do not store them on a checkout); Acceptance rate, Payment attempts, Upsells (no upsell product yet). Listed in §8 |

## 1. Data — migration `014_analytics.sql`

```sql
SET LOCAL lock_timeout = '5s';
CREATE TABLE transaction_adjustments (
  paddle_adjustment_id  TEXT PRIMARY KEY,
  paddle_transaction_id TEXT NOT NULL,
  kind                  TEXT NOT NULL CHECK (kind IN ('refund', 'chargeback')),
  amount_minor          BIGINT NOT NULL,
  currency              TEXT NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL
);
CREATE INDEX transaction_adjustments_by_time ON transaction_adjustments (created_at);
CREATE INDEX transaction_adjustments_by_tx ON transaction_adjustments (paddle_transaction_id);
-- backfill from the outbox (idempotent)
INSERT INTO transaction_adjustments (paddle_adjustment_id, paddle_transaction_id, kind, amount_minor, currency, created_at)
SELECT o.payload->>'adjustment_id', o.payload->>'paddle_transaction_id',
       CASE o.topic WHEN 'payment.refunded' THEN 'refund' ELSE 'chargeback' END,
       (o.payload->>'amount_minor')::bigint, o.payload->>'currency', o.created_at
  FROM outbox o
 WHERE o.topic IN ('payment.refunded', 'payment.chargeback') AND o.payload ? 'adjustment_id'
ON CONFLICT DO NOTHING;
CREATE INDEX transactions_by_billed ON transactions ((COALESCE(billed_at, paddle_updated_at)));
CREATE INDEX subscriptions_by_canceled ON subscriptions (canceled_at) WHERE status = 'canceled';
```

Billing sync writes a `transaction_adjustments` row in the same transaction as the outbox row for an approved refund / non-rejected chargeback (`ON CONFLICT (paddle_adjustment_id) DO NOTHING`; created_at = the adjustment's Paddle `created_at`). The existing refund numbers of the p3 overview switch to this table (same values).

A SQL view-free helper module builds the per-subscription facts (decision 5–6) as a CTE used by the new queries: `sub_tx` = paid transactions with `row_number()` per subscription and the first-purchase checkout (`funnel_id`, `v`, `plan_key`, `attribution`) via the subscription's first transaction's `checkout_id` (fallback `subscriptions.funnel_id`/`plan_key`).

## 2. core-api

`src/analytics/money.js` (new; Postgres), `src/analytics/kpis.js`, `src/analytics/cohorts.js`, `src/analytics/transactions.js`, wired through `analyticsService` (cache) and `src/http/analytics.js`:

| Route | Query | Answer |
|---|---|---|
| `GET /v1/analytics/kpis` | `from, to, app?, funnel?, currency?` | `{range, previous, currency, kpis: {net_revenue:[{currency, amount_minor}], gross_revenue, refunds, new_subscriptions, active_subscriptions, sessions, arpu, arppu, churn_rate, start_to_purchase}, previous_kpis: {…}}` — rates as fractions (0..1) or null when the base is 0; `sessions`/`arpu`/`start_to_purchase` null + `analytics: 'unavailable'` when ClickHouse is down |
| `GET /v1/analytics/series` | `metric, from, to, by=day|week|month, group?, app?, funnel?, currency?` | `{buckets:[t], series:[{key, points:[value|{currency, amount_minor}]}]}`; `group` absent → one series `key: 'all'`; Top-N is client-side |
| `GET /v1/analytics/conversion` | `from, to, by, app?, funnel?` | `{rates: {start_to_2nd, second_to_lead, start_to_checkout, checkout_to_purchase, start_to_purchase, start_to_subscription, trial_to_paid}: {value, num, den}, previous: {…}, series: {rate: [{t, value}]}}` |
| `GET /v1/analytics/transactions` | `from, to, app?, funnel?, type?, status?, currency?, before?, limit?` | `{items:[{paddle_transaction_id, billed_at, customer_ref, app_id, funnel, v, plan_key, type, status, amount_minor, currency, refunded_minor}], next_before, summary:[{currency, count, gross, refunds, net}]}` |
| `GET /v1/analytics/transactions.csv` | same, no cursor | `text/csv`, header row, ≤ 10 000 rows else `413 too_many_rows` |
| `GET /v1/analytics/cohorts` | `from, to, by=day|week|month, mode, currency, group?, app?, funnel?, plan?, utm_source?` | `{currency, by, periods: n, cohorts:[{key?, start, size, values:[number|null]}], summary:{size, values}, ltv?}` |

`metric` ∈ `net_revenue, gross_revenue, refunds, new_subscriptions, active_subscriptions, churned, churn_rate, trials_started, trials_converted, sessions, arpu, arppu, purchases`. `group` ∈ decision 8 (`app, funnel, v, plan, utm_source, utm_campaign, currency, country, device`); an unsupported metric/group pair → `400 group_not_supported`. Grants and scoping exactly as `/v1/analytics/overview` (p4a/p4b: `app` out of scope → 404 `app_not_found`; limited viewer without `app` → their apps, never unassigned funnels; `funnel` slug resolved within scope, else 404 `funnel_not_found`). Range rules: `by=day` ≤ 90 days, `week` ≤ 26 weeks (182 days), `month` ≤ 12 months (366 days) → else `400 invalid_range`; periods snap to UTC day/ISO week/month starts. All parameters bound; never string-built.

Logs as today (no `err.message`, no SQL params). Transactions list rows carry `customer_ref` only (never email, `user_id`, IP, UA).

## 3. Admin console

- **Layout:** `pages/Analytics.jsx` with the tab bar and shared filter bar (range preset, granularity day/week/month, app (global only), funnel, currency). Filters live in the URL query (`?range=30d&by=week&funnel=…&currency=USD`) so a view can be shared.
- **Tổng quan:** 8 `KpiCard`s (value, Δ % green/red with the right direction — lower is better for churn), selected card → `LineChart` of `/series`; group-by select + Top 5/10/All + sortable table + **Tải CSV**.
- **Conversion rate:** 7 rate cards (value %, `num/den` under it, Δ), the selected rate's line; "By step" for the chosen funnel: `Bars` (vs first screen) + previous-step % column.
- **Transactions:** summary strip per currency, filters (type, status), table with "Tải thêm" (cursor), refunded amounts in red, customer ref links to `/customers/:ref` for support, **Tải CSV** (server).
- **Cohorts:** mode select (Revenue cumulative, Revenue incremental, ARPPU cumulative, Renewal %, Churn %), granularity, currency, group by; table Cohort · Size · LTV (revenue modes) · P0…Pn heat cells, "—" not reached, summary row; a `LineChart` of the average per period above it.
- Components: `components/KpiCard.jsx`, `components/HeatTable.jsx`, `components/AnalyticsFilters.jsx`, `lib/csv.js` (RFC 4180 quoting; formula-leading `=+-@` prefixed with `'`). Copy Vietnamese; metric names stay as FunnelFox names them (Net revenue, ARPU, LTV …).

## 4. CLI

`ikf kpis [--app <id>] [--days N] [--currency C]`, `ikf tx ls [--app] [--funnel] [--type] [--days N] [--limit N]`, `ikf cohorts [--app] [--by week|month] [--mode revenue|renewal|churn] [--currency C]` (table output, like `ikf stats`).

## 5. Demo

`demo/lib/sample-subs.mjs`: deterministic 6 months of paying customers on the sample funnels: weekly (`1w`) and monthly (`1m`) plans, ~30 % with a free trial ($0 first transaction, ~60 % converting), renewals each period until a churn drawn per customer (~15 %/period), a few refunds and one chargeback, 2 currencies (USD mostly, JPY a few), checkouts with version and UTM. `npm run demo:events -- --seed` calls it after the 3-day sample; idempotent (fixed ids). e2e `demo/test/analytics-e2e.test.mjs` (own ports and DB `ikf_analytics_test`): the four tabs show non-empty numbers, a cohort table with ≥ 5 monthly rows and a falling Renewal %, Transactions paging + CSV download, filters in the URL survive reload.

## 6. Testing

| Unit | What |
|---|---|
| migration 014 | idempotent apply, backfill from outbox rows (refund, chargeback, missing adjustment_id skipped) |
| sync | refund/chargeback writes an adjustment row once (replay safe), rejected chargeback none |
| money/type | classification table (trial → conversion → renewals; direct; one-time; refund in later period), active/churned at boundaries, churn rate base, week/month bucketing (UTC, ISO Monday), multi-currency never summed |
| kpis/series/conversion | known fixtures → exact numbers; previous period; ClickHouse down → sessions null, money still there; group by each dimension; unsupported pair 400 |
| transactions | cursor paging stable with equal `billed_at`, filters, summary, CSV quoting/injection guard, 10 000 cap |
| cohorts | each mode on a hand-computed fixture (incl. refund making a period negative, not-reached "—", summary weighting, LTV), group by, scope filters |
| HTTP | grants and scoping (viewer, limited viewer, out-of-scope app/funnel 404), schemas, range limits |
| SPA | tabs + URL filters, KPI delta colours, CSV, transactions paging, cohort heatmap and modes |
| CLI | kpis / tx ls / cohorts |
| Demo e2e | §5 |

## 7. Performance

Queries scan `transactions` / `subscriptions` by time index; pilot scale (≤ 10⁶ transactions) answers well under a second. Each answer is cached 30 s per (route, scope, query). If cohorts get slow at scale, a nightly materialized table is the next step (out of scope).

## 8. Out of scope

Country / device / payment method / card type on money; upsell metrics; acceptance rate and payment attempts; experiment as a group-by (the A/B page has its numbers); daily snapshot tables; custom date pickers beyond the presets; editing anything from these pages.

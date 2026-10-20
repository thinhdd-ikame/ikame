# Analytics like FunnelFox — final review (branch f53a762..0aabe05) and fix wave

Reviewer verdict: needs fixes (0 Critical, 7 Important, 7 Minor). Security: scoping, cache keys, bound SQL, CSV guard, no PII — all sound.


## Important
1. KPI/Conversion Δ biased: current range includes future time (periods.js:48 ceilTo; previousRange periods.js:63-69; used kpis.js:66-72, conversion.js:111). Compare against {from: prev.from, to: prev.from + elapsed} where elapsed = min(range.to, now) − range.from (months: same day-of-month/time). Tests with now mid-day and mid-month.
2. Cohorts average line drops to 0: LineChart.jsx:14,21,61 uses p[key] ?? 0 → break the line at nulls (segments, no fill under gaps, "—" in tooltip). cohorts.js:142 periods counted from range.from → periods = max reach of existing cohorts, trailing all-null columns cut (respect R13 cap). Tests both sides.
3. Start → Purchase series (kpis.js:118, Overview METRICS den 'sessions') must use the same screen-1 sessions (page_load fallback) as the card (R11) — grouped by the same keys; ungrouped may reuse conversion series. Card, chart, group table, Conversion tab agree. Test.
4. Pool starvation: give analytics its own small pg pool (max 4, statement_timeout 15s) created in server wiring (server.js) and passed to analyticsService/routes, or a concurrency limiter in analyticsService (max 4 concurrent PG queries). Fold the 9 moneyTotals flows into one query with FILTER aggregates if straightforward; move paidAtStart into the Promise.all.
5. Migration 014 backfill guard: add AND o.payload ? 'paddle_transaction_id' AND o.payload->>'amount_minor' ~ '^-?\d+$' AND o.payload ? 'currency' (migration not yet released — edit 014 in place). Test with a bad outbox row.
6. Tổng quan old block range: send the snapped kpis range (to capped at now, clamped to 90 days) to /overview; show the snapped range (UTC) under the filters.
7. CLI crash: main.js:836 (t.type ?? '—').padEnd(16), t.customer_ref ?? '—'; test with --status past_due row type null.

## Minor (do these too)
M1. service.js:214 cohorts cache key → JSON.stringify of all fields.
M2. Transactions.jsx:85 relabel summary refunds/net "Refund của các giao dịch này" (+ runbook note).
M3. One default-currency rule: cohorts use the same as KPIs (most paid > 0 transactions in range, money.js:120).
M4. LineChart y-axis: widen PAD.l (~64) or compact number format; scale from min(0, realMin) so negative values render above/below baseline correctly.
M5. Transactions CSV link: on 413/401 show a message instead of raw JSON (fetch HEAD/GET first or check count ≤ 10000 from summary).
M6. money.js:61 PURCHASES_CTE per-row currency subquery → DISTINCT ON join.
M7. Delete unused ADJUSTMENT_KINDS or use it.

## Fix wave

Commits 7b05191, f6a7119, bc4c6f6 — all 14 findings addressed (re-review). The I6 change introduced a refetch loop on Tổng quan (Critical, re-review); fixed in 877ceae with a real-clock test (124 /overview calls before, 1 after). e2e full-suite flake fixed in 4c59a4f.

Final test counts: core-api 102 files / 1131 tests, admin 34 / 365, cli 27 / 332, demo 32 / 158, SDK size test green.

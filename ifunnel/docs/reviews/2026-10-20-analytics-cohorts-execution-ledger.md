# SDD ledger — plan: /Users/daothinh/ikame-ifunnel/ifunnel/docs/plans/2026-10-20-analytics-cohorts.md
Spec: ifunnel/docs/specs/2026-10-20-analytics-cohorts-design.md (copy in workspace spec.md). Base f53a762.

## Pre-flight scan
| Pair / task | Produces → consumes | Finding |
|---|---|---|
| T1→T2,T3,T4 | transaction_adjustments table → refunds in money/cohorts/transactions | consistent |
| T2→T3 | periods.js, money.js (TX_TYPED_CTE, scopeSql) → conversion/transactions | consistent |
| T2→T4 | SUB_FACTS_CTE, TX_TYPED_CTE, periods → cohorts | consistent |
| T2,T3,T4→T5 | module fns → service/http | T2 lists `sessions`,`arpu` as series metrics but moneySeries is Postgres-only — see R1 |
| T5 vs spec §2 | 503 policy | plan says new routes degrade to nulls; series metric=sessions has no Postgres part — see R2 |
| T5→T6,T7 | HTTP shapes → SPA/CLI clients | consistent (spec §2 table) |
| T6 | RangePicker presets incl. months | self-consistent; existing callers unchanged |
| T8 | demo-only writes | respects "demo must not change services/" |
| T1 self | migration + sync + overview switch | consistent |
| T2 self | tests cover decisions 5–7 | consistent |
| T3 self | CSV cap testable via maxRows | consistent |
| T4 self | ok | consistent |

Ruling R1: `series(...)` for every metric (incl. sessions, arpu = net/sessions per bucket, start_to_purchase) lives in kpis.js in Task 2, combining moneySeries + ClickHouse sessions — the plan's metric list needs one owner — cost if wrong: small move between files.
Ruling R2: `/v1/analytics/series` with metric `sessions` or `arpu` and ClickHouse down → 503 analytics_unavailable (nothing to show); every other new route degrades to nulls — matches existing 503 semantics — cost if wrong: an error card instead of an empty chart.
Task 1: env incident — implementer ran `docker rm -f $(docker ps -q)` (removed ikf-demo containers; recreated by controller on the same volumes, data intact). Root cause of hung startDb: colima hostagent port forwarding broken (ssh -O forward from hostagent exit 255 since this morning); fixed by `colima restart`. Rule carried to every dispatch: no docker commands outside the test suites.
Task 1: minor (deferred): lock_timeout test checks presence not position; backfill lacks guard for missing paddle_transaction_id/amount_minor; ADJUSTMENT_KINDS unused; fakes lack adjustment created_at
Task 1: complete (commits f53a762..d070887, review clean)
Ruling R3: scope = {app, appIds, funnelId} across modules — one shape for T2–T5 — cost if wrong: rename.
Ruling R4: Sessions = sessions with page_load, as the existing overview — keeps Tổng quan and old Dashboard equal — cost if wrong: small count difference vs FunnelFox "visits".
Task 2: dispatched (base d070887, opus)
Ruling R5: churned (churn_rate numerator and 'churned' metric) counts only subscriptions with a paid start (amount > 0); a free trial canceled before paying is not churn — FunnelFox churn is over paid subscriptions — cost if wrong: churn slightly lower than FF if FF counts trials.
Ruling R6: churn_rate base = paid subscriptions active at period start (paid_started_at < t, not churned) + paid new in period; running trials stay in active_subscriptions only — numerator and base must be the same population — cost if wrong: churn % differs slightly from FF.
Ruling R7: range limits apply after snapping, as bucket counts: day ≤ 90, week ≤ 26, month ≤ 12 buckets → else 400 invalid_range — matches the spec's "26 weeks / 12 months" wording — cost if wrong: a 27th week rejected.
Ruling R8: churned_at falls back to paddle_updated_at when status='canceled' and canceled_at is NULL — accepted (Paddle normally sets canceled_at) — cost if wrong: churn time off by the last update.
Task 2: minor (deferred): ~21 concurrent PG queries per kpisWithPrevious (fold flows later if slow); date strings without zone → Task 5 schema must require Z/date-only.
Ruling R7 (amended): bucket caps day 91, week 27, month 13 — a rolling range (to = now) touches one extra partial period, so presets 90 d / 26 w / 12 m must pass — cost if wrong: one extra bucket allowed.
Task 2: fix round 1/5 (4 addressed, 0 open — R5 churn paid-only, R6 base, R7 caps, topCurrency>0; commits c842f66..2a07136)
Task 2: minor (deferred): moneyTotals field renamed paid_active_at_start (SPA uses it); paidAtStart sequential; old service.js MAX_DAYS unchanged; intermittent pg 57P01 at container shutdown
Task 2: complete (commits d070887..2a07136, review clean)
Task 3: dispatched (base 2a07136, sonnet)
Ruling R9: conversion rates use independent distinct-session counts and are not clamped (may exceed 100% in rare cases) — honest numbers, funnel_hourly has no per-session paths — cost if wrong: an odd >100% cell the user may question.
Task 3: minor (deferred): CSV LIMIT interpolated not bound; non-PAID status rows net can go negative (refunds with gross 0); page_load fallback per range vs per bucket; no test for default limit 50 / short cursor fraction
Ruling R10: "By step" (decision 9) owned by Task 5 (conversion route adds `steps` from queries.js screenSteps when `funnel` is given) and Task 6 (bars + previous-step %) — reviewer found it unowned — cost if wrong: none.
Ruling R11: KPI start_to_purchase uses the conversion module's start_to_purchase (screen-1 sessions, page_load fallback) so both tabs show one number; wired in Task 5 service — cost if wrong: KPI slightly differs from old dashboard paid/session %.
Task 3: complete (commits 2a07136..77a2729, review clean)
Ruling R12: cohorts — Renewal % P0 = null (renewal shown from period 1, as FF); Churn % over paid-start subscriptions, one-time-only customers never churn; refunds count only in the cohort currency; P columns run until now — fills decision 11 gaps — cost if wrong: table shape tweak.
Task 4: dispatched (base 77a2729, opus)
Ruling R13: cohort period columns capped at the bucket caps (day 91, week 27, month 13) — applied in Task 5 service (truncate values, set periods) — a year-old day range would otherwise return ~365 columns — cost if wrong: late columns hidden.
Ruling R14: cohort Churn % is a current-state snapshot (customer churned at the latest churned_at only if every paid subscription is canceled now); a resubscribed customer is not churned — simple and stable; point-in-time churn deferred — cost if wrong: churn % slightly low for resubscribers.
Task 4: minor (deferred): renewals counted in any currency vs money in cohort currency; revenue_cumulative summary drops as young cohorts end (label in SPA); missing tests for group funnel/utm_source, day cohorts, utm filter 400, by≠range.by; extra default-currency pass; no red run (mutation checks instead)
Task 4: complete (commits 77a2729..b7ed564, review clean)
Task 5: dispatched (base b7ed564, sonnet)
Ruling R15: kpis/transactions accept by and are capped like other routes; the SPA sends by=week for 180 d and by=month for 365 d (snapped) — one range rule everywhere — cost if wrong: a 365-day transactions view starts at a month boundary.
Task 5: minor (deferred, fix in final wave): cohorts cache key '|' join collision on free-text plan/utm_source → use JSON.stringify; no limited-viewer-after-global cache test; no HTTP 413 test; cohort ltv not truncated with R13
Task 5: review clean; awaiting controller full-suite run
Task 5: controller full suite: 102 files, 1123 tests passed
Task 5: complete (commits b7ed564..a5c7cbd, review clean)
Task 6: dispatched (base a5c7cbd, opus)
Ruling R16: group-by table for rate metrics must not average per-period rates — ARPU = Σnet/Σsessions and Start→Purchase = Σpurchases/Σsessions per group (fetch component series), ARPPU and Churn rate show "—" in the group table with a note (not additive); Active subscriptions = last value (ok) — averaging rates misleads — cost if wrong: fewer numbers in the table.
Task 6: fix round 1/5 (5 addressed, 0 open — R16 group ratios, overview 90-day clamp, TTL note, currency group, minors; commits 338c8d0..715d7dd)
Task 6: minor (deferred): busy ignores nums/dens loads; cross-origin CSV link cookie only testable in e2e (Task 8); demo e2e selectors "Dashboard" heading + waitForURL('/') must be updated in Task 8
Task 6: complete (commits a5c7cbd..715d7dd, review clean)
Task 7: dispatched (base 715d7dd, sonnet)
Task 7: fix round 1/5 (4 addressed, 0 open — perVisitorMoney ARPU/ARPPU, tx ls nulls/hint, cohort money(), boundary tests; commits 3afb3ef..be889d6, implementer amended its fix commit)
Task 7: complete (commits 715d7dd..be889d6, review clean)
Task 8: dispatched (base be889d6, opus)
Task 8: minor (deferred, for final wave): y-axis top label clipped in LineChart; Cohorts average line drops to 0 at the end (null periods treated as 0?); sidebar background stops at viewport height in full-page screenshots; demo conversion inflated (3-day sessions vs 6 months checkouts — by design); 2 chargebacks (one per funnel)
Task 8: fix round 1/5 (2 addressed, 0 open — e2e drops own DBs + seeds twice, stronger assertions; commits 3bcabb0..0aabe05)
Task 8: complete (commits be889d6..0aabe05, review clean)
Final review: dispatched (f53a762..HEAD, opus)
Final review: needs fixes — 7 Important (Δ bias partial period, cohort null→0 line + trailing columns, Start→Purchase series mismatch, pool starvation, 014 backfill guard, old block range, CLI null type crash) + 7 minors; one fix wave dispatched (opus) with final-findings.md
Ruling R17: one extra targeted fix (not a second wave) for the Critical refetch loop the fix wave introduced in Overview.jsx (snappedRange reads Date.now each render) — shipping an endless /overview loop is not acceptable and the fix is one memo — cost if wrong: one more small review.
Final fix wave: 14/14 addressed (commits 0aabe05..bc4c6f6); re-review found Critical refetch loop from I6 → fixed in 877ceae (controller verified diff + real-clock test: overview 124 calls before, 1 after)
Final review: clean after fix wave
Task 8: fix round 2 (e2e full-suite flake: every DOM read after a switch polls; commit 4c59a4f); demo:test 32 files/158 tests green

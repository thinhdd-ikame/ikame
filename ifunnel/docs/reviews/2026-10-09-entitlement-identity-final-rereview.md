# Final fix wave re-review: f93b64d..d51e725 (9 commits)

Scope: fix list 1–13 from final-review.md, the controller rulings, and the fix diff. The review was read-only; no code was changed.

## Finding verdicts

1. **F1 indexes**: ADDRESSED.
   - `004_entitlements.sql` (tail) adds all 6 indexes plus `magic_links_by_checkout`.
   - Each index matches its query:
     - `subscriptions(customer_id)` and `transactions(customer_id)` match the `loadSources` filters.
     - `outbox(aggregate_id, topic)` matches the `aggregate_id = … AND topic = ANY($2)` EXISTS check. It is plain, not partial, as the review required.
     - `transactions(checkout_id)` matches `claimForCheckout`.
     - `webhook_deliveries((payload->>'customer_ref'), id DESC)` matches `customers.js:22` exactly.
     - `magic_links_by_checkout` (partial on `IS NOT NULL`) is used by `checkout_id = $1`, because the equality implies NOT NULL.
     - `claim_tokens_unsent(next_email_at) WHERE emailed_at IS NULL` matches the F4 claim subquery.
   - Small note: `transactions_by_subscription` is `billed_at DESC` (NULLS FIRST), but the query sorts `DESC NULLS LAST`. The index still serves the `paddle_subscription_id` lookup and then sorts a handful of rows. Not a defect.
   - The EXPLAIN test (`enable_seqscan off`) is present.
2. **F2 backfill on attach / re-key**: ADDRESSED.
   - `identity/apps.js` `setFunnelApp`: one tx, queues only when `app_id` really changes.
   - `billing/prices.js`: queues when the mapping diff shows a change.
   - `entitlements.js` `queueFunnelRecompute`.
   - `sync.js` drains the queue as recompute only, with no claim token.
   - Tests cover pre-attach buyers, one-time buyers, detach, re-key, a race with a tick, bounded drain and a parked failure.
   - Runbook §4 covers the step order and the backfill.
   - The d51e725 wait/requeue logic is correct, because `INSERT … ON CONFLICT DO UPDATE` against a row the tick holds `FOR UPDATE`:
     - waits for the tick;
     - if the tick deleted the row, re-inserts it (speculative insert retry);
     - otherwise updates `queued_at`.
   - The admin change is therefore always recomputed by a later tick with the committed mapping. See N1 for the deadlock caveat.
3. **F3 claim window + magic cap**: ADDRESSED.
   - `link.js` `claimForCheckout` computes `closed` from `checkouts.completed_at`.
   - Billing sets that column in `billing/sync.js:160` when the checkout's own `paddle_transaction_id` reaches PAID. Every checkout is created with that id (`checkout.js:79`), so the column is set reliably.
   - The window check runs before the `kind` branch, so the app `app_link` path is bounded too. A test covers the app path.
   - The cap of 5 is counted under `checkouts FOR UPDATE`, so it is exact under concurrency. There is a concurrency test.
4. **F4 claim emails decoupled**: ADDRESSED.
   - Own `claim_email` loop.
   - The claim is one autocommit `UPDATE … IN (SELECT … FOR UPDATE SKIP LOCKED)`.
   - No lock is held across SES.
   - Backoff is 60 s, then 600 s.
   - Can two processes send the same email at once? Not within one claim window:
     - SKIP LOCKED skips a row that is locked while the claim is in flight;
     - after the claim commits, the EvalPlanQual recheck sees `next_email_at` in the future and excludes the row.
   - The duplicate windows that remain are:
     - a crash, or a failed `emailed_at` UPDATE, after a successful send, which resends after 60 s or 600 s. This is acceptable: it was already accepted as at-least-once.
     - N2.
5. **F5 partial refunds**: ADDRESSED.
   - Billing `sync.js:184-195` writes `type: adj.type ?? null` for refund and chargeback adjustments.
   - The transaction is re-read from Paddle with `?include=customer,adjustments` (`packages/paddle/src/index.js:78`). Paddle's adjustment `type` is `full | partial`, and reconcile reuses `adjustmentTopic`.
   - `REVERSES` in `entitlements.js` reverses on a chargeback always, and on a refund unless `payload->>'type' = 'partial'` (IS DISTINCT FROM).
   - A missing key or JSON null therefore counts as full, which matches the claim.
   - Both the subscription and the one-time queries use it, and both are tested.
   - **Product decision still open for the user:** partial refunds keep access.
6. **F6 rotate-key guard**: ADDRESSED.
   - The conditional UPDATE is atomic, so concurrent rotations serialize and the second one gets 409.
   - Force semantics are correct: the previous key K0 is dropped at once, and the current key K1 becomes the 24 h previous key.
   - The docs and runbook describe this accurately.
   - The body schema rejects `force: "yes"` (400).
   - The CLI sends no body unless `--force`.
7. **F7 resend lock order**: ADDRESSED.
   - `webhooks.js` `resendDelivery` locks `{linkedBefore, byRef}` in ascending order.
   - A third customer is locked last; this is documented, and Postgres resolves any deadlock there.
   - Ids are normalised with `Number`, which also fixes the old string-vs-number `!==` comparison.
   - There is a test.
8. **Doc: canceled subscription has no grace**: ADDRESSED. See app-backend.md §3.
9. **Doc: early redeem → 404, retry**: ADDRESSED. See app-backend.md §3, plus the error-table row. `[]` applies only to magic link and OTP.
10. **Doc: Express raw body is a Buffer**: ADDRESSED. See app-backend.md §4.1.
11. **Doc: retries re-signed, same `Ikf-Event-Id`**: ADDRESSED. See app-backend.md §4, rule 4.
12. **Doc: only the newest OTP code works**: ADDRESSED. See app-backend.md §2.2.
13. **Runbook: DB access note + first-enable backlog**: ADDRESSED.
    - The "Database access" section exists. Its command has not been run yet, and it is flagged as "try read-only on staging first".
    - The re-enable backlog note includes the suppression UPDATE.

## New findings in the fix diff

- **N1 (Minor): the F2 attach path can deadlock 3-way with billing sync and the tick. Postgres detects it, and every party recovers.**
  - `setFunnelApp` takes `funnels … FOR UPDATE` (`identity/apps.js:124`). FOR UPDATE conflicts with the FK `KEY SHARE` that billing takes on `funnels` when it writes `subscriptions` or `checkouts`. The cycle is:
    - billing `syncMessage` holds customer X (the `upsertCustomer` DO UPDATE) and waits on funnel F (FK on the subscriptions write);
    - admin holds F and waits on queue row X (the DO UPDATE added in d51e725);
    - the tick holds queue row X and waits on customer X (`lockCustomer`).
  - Postgres aborts one of the three after `deadlock_timeout`, and each recovers:
    - billing: SQS retries the message;
    - tick: the per-customer SAVEPOINT parks X;
    - admin: the PUT returns 500, and the operator re-runs it.
  - The same FOR UPDATE also blocks `createCheckout` inserts (the paywall path) on that funnel while the admin tx waits on a tick.
  - Fix (one word): `SELECT … FOR NO KEY UPDATE`. A plain UPDATE of `app_id` needs no more than that, and it does not conflict with KEY SHARE, which breaks the cycle.
  - So, to the question "is it deadlock-free with sync's locks?": the admin/tick pair is deadlock-free, but the three-party cycle with billing is not.
- **N2 (Minor): the F4 lease (60 s) is shorter than the worst-case batch time (20 × 10 s SES timeout = 200 s).**
  - When SES is slow and more than one core-api task runs (autoscaled, `api_min_tasks`), another task re-claims a row still waiting in the first task's batch. That sends a duplicate email and spends an extra attempt.
  - The impact is duplicate emails only while SES is degraded. Within at-least-once it is acceptable, but it could easily be avoided:
    - make the first backoff ≥ batch × timeout (e.g. 300 s);
    - or claim a smaller batch;
    - or claim one row at a time.
- **N3 (Minor, docs/cost): F2 enqueue cost.**
  - The queue fill is one `INSERT … SELECT … UNION` over `subscriptions.funnel_id` and `checkouts.funnel_id`, which have no index (a seq scan, once per admin change). For a funnel with N buyers it inserts N rows in one tx. 100k rows is fine for Postgres, but the PUT can also wait up to one tick on held rows.
  - The drain rate is 100 per 2 s tick, so 100k buyers take about 35 min or more. The runbook's "within seconds" holds only for small funnels: say "≈ N/50 seconds".
  - `setFunnelPrices` also re-queues every buyer when a plan is merely **added** or removed. Recompute is idempotent, so this costs load only.
  - Each tick can now hold up to 200 customer locks (100 outbox + 100 queue) in one tx.
- **N4 (Minor): F4 crash on the 3rd claim.**
  - If the process dies between the 3rd claim (attempts = 3) and the send, the email is never sent and no alarm fires.
  - The window is narrow. The link still shows on the funnel, and OTP restore works.

No Critical or Important findings.

## Out-of-scope observations

- `adjustmentTopic` ignores `chargeback_reverse` and `credit_reverse`: a won chargeback dispute never restores access. This is pre-existing billing behaviour.
- A leak of the *current* key cannot be killed at once: any rotation keeps it valid for 24 h. This is by design.

## Tests (run at d51e725, colima Docker)

| Suite | Result |
|---|---|
| root `npm test` | exit 0 |
| core-api | 324 / 31 files, including migrate.test (004 applies from empty, re-run is a no-op, concurrent migrate OK) |
| cli | 114 |
| sdk | 152 / 11 files; bundle 8123 B gzip |
| edge-router | 101 |
| event-schema | 138 |
| paddle | 31 |
| route-match | 35 |
| event-consumer | 7 + 27 |
| SDK e2e (`IKF_FUNNELS_DIR=…/funnel-development`) | 11/11 passed |

## Verdict

**Merge-ready.** All 13 fixes are addressed, with no new Critical or Important findings. N1 (a one-word change to `FOR NO KEY UPDATE`) and N2 (lengthen the first email backoff) are recommended, cheap follow-ups and do not block the merge. F5 (partial refunds keep access) still needs the user's product sign-off.

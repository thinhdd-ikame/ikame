# Final whole-branch review: feat/entitlement-identity (ffb2d21..f93b64d, 17 commits)

Reviewer seat: final cross-task integration review. Read-only; no code changed.
Inputs: spec `2026-10-09-entitlement-identity-design.md`, plan (E1–E21, Global Constraints, Review Focus), ledger `progress.md` (rulings and parked minors), per-task reviews 7/12, and the source at f93b64d. I reviewed it in passes: (1) migration 004 against every query that touches it, (2) the end-to-end flows across sync, link, otp, webhooks and the SDK, (3) locking, (4) server.js wiring and the disabled mode, (5) PII and secrets, (6) the docs against the code, and (7) the billing touches against E16 and Task 4b.

## Test evidence (run at f93b64d)

| Suite | Result |
|---|---|
| `npm test` (all workspaces, colima Docker) | exit 0 |
| core-api | 307 passed / 31 files (matches ledger) |
| sdk | 152 passed / 11 files; bundle 8123 B gzip (≤ 8192) |
| sdk e2e (playwright) | 11/11 |
| cli | 113 |
| edge-router | 101 |
| paddle | 31 · event-schema 138 · route-match 35 · event-consumer 7 + 27 |
| terraform edge / stack | 10 / 11 passed |

## Strengths

- **Idempotency is real.** recompute starts from scratch on every call (`identity/entitlements.js:77-123`). It writes only visible changes and queues deliveries only for apps that changed. Replays, duplicates and racing workers therefore add nothing, and the Review Focus 1 tests prove it against Postgres.
- **The batch design follows E9 well.** One transaction holds the `SKIP LOCKED` outbox rows, with a SAVEPOINT per customer. `sync_failures` adds backoff for failing customers without changing the billing outbox schema. Alarms fire after COMMIT, and error codes are logged, never messages (`identity/sync.js:56-106`).
- **Locking is consistent and free of cycles on the main paths.** Every writer of a customer's entitlements or links takes `customers FOR UPDATE` first (`lockCustomer`). sync takes customers in ascending id order. Redeem and verify lock their token or code row, then the customer. `sendClaimEmails` never takes a customer lock. I found no deadlock cycle between sync, sweep, link, redeem and verify (resend is a small exception, Minor 2).
- **Webhook ordering is correct across tasks.** The `NOT EXISTS` check for an older pending row, plus `FOR UPDATE OF d SKIP LOCKED`, plus the customer lock around every delivery insert, means a user's deliveries are committed in id order and sent in id order (`identity/webhooks.js:78-85`).
- **The OTP anti-enumeration fix is solid.** Strangers get decoy rows, run the same queries in the same order, the SES send is not awaited, and the HTML is escaped.
- **The resend ruling is implemented cleanly** (new event with the current state, `resent_from`), and the docs tell backends to drop older `created_at`.
- **The disabled mode is clean.** Missing `claim-token-key` or `MAIL_FROM` means no identity routes, no workers, and an outbox that just waits (`server.js`, `identity/setup.js:58-72`). Admin `/v1/apps` is also off, which is consistent.
- **Billing touches stay within E16 + Task 4b**, and nothing else in billing changed. Specifically: `billing/prices.js` (COALESCE keeps the existing key), `http/prices.js` (schema), `http/funnels.js` (`app_id`, `pixel_id` optional), 004's ALTERs, and the listed test edits.
- **PII stays out of the places this branch writes.** No email appears in webhook payloads, claim links, `last_error`, alarm text or logs (sync and otp log `email_hash` only). The CS lookup uses a POST body (E10). Secrets are kept as sha256, and the webhook secret is in Secrets Manager with IAM scoped to `ikf/<env>/app-webhook/*`.
- **The docs carry a test vector that a test keeps in sync**, and CI runs when `docs/integration/**` changes.

## Issues

### Critical (must fix)

None.

### Important (should fix before merge)

#### I1. Migration 004 has no indexes for the recompute and claim hot queries, so every recompute scans the billing tables in full

- **Where:**
  - `services/core-api/src/identity/entitlements.js:12-37` runs, for every customer recompute:
    - `subscriptions WHERE customer_id = $1`;
    - `transactions WHERE paddle_subscription_id = …` (a correlated subquery per subscription);
    - `transactions WHERE customer_id = $1`;
    - `outbox WHERE topic = ANY($2) AND aggregate_id = …`, twice.
  - `identity/link.js:118-121` runs `transactions WHERE checkout_id = $1` on every browser poll of `GET …/claim`.
  - `003_billing.sql` indexes none of these columns. It has only `transactions_by_updated`, `outbox_unpublished` (partial on `published_at IS NULL`), and the PK/unique constraints.
- **Failure scenario:** the outbox and transactions grow forever: billing never purges, and every purchase and renewal adds 1–3 outbox rows.
  - A sync tick handles up to 100 customers. Each customer runs 3–4 sequential scans of `outbox` and `transactions`, plus one per subscription.
  - At a few hundred thousand outbox rows a tick takes seconds to tens of seconds. It holds up to 100 customer row locks for that whole time, so redeem, verify and magic calls for those buyers block (backend timeouts mean failed links). Refund propagation lags as well.
  - The sweep repeats the same work for 200 customers.
  - `GET …/claim` for web2web scans `transactions` every 2 s per paying browser.
- **Fix:** 004 is unreleased, so add the indexes there:
  ```sql
  CREATE INDEX subscriptions_by_customer ON subscriptions (customer_id);
  CREATE INDEX transactions_by_customer ON transactions (customer_id);
  CREATE INDEX transactions_by_subscription ON transactions (paddle_subscription_id, billed_at DESC);
  CREATE INDEX transactions_by_checkout ON transactions (checkout_id);
  CREATE INDEX outbox_by_aggregate ON outbox (aggregate_id, topic);
  CREATE INDEX webhook_deliveries_by_customer_ref ON webhook_deliveries ((payload->>'customer_ref'), id DESC); -- parked Task 8 minor
  ```
  These are additive indexes on billing tables. E16 lists only ALTERs, so record a one-line ruling ("indexes on billing tables for identity reads are allowed").
  Use a plain (aggregate_id, topic) index, not a partial index: `topic = ANY($2)` with a bound array cannot match a partial-index predicate.
  Add an `EXPLAIN` assertion or a schema test that the indexes exist.

#### I2. Buyers who paid before their funnel was attached to an app never get entitlements or a claim, and cannot restore by email

- **Where:**
  - `identity/sync.js:79-95` and `entitlements.js:25,35` (`f.app_id IS NOT NULL`): an outbox row whose funnel has no app at processing time is recomputed to nothing and marked `published_at`.
  - `identity/apps.js:112-122` (`setFunnelApp`) and `billing/prices.js` (an `@key` change) trigger no recompute.
  - The runbook orders the steps as: §2 turns identity on (secret + redeploy), then §4 runs `ikf funnel set --app`.
- **Failure scenario:** a Starlyn funnel has been selling through billing for weeks.
  1. Ops follows the runbook. At §2 the worker starts and drains the whole backlog: every `payment.succeeded` and subscription row is recomputed with no app, so it gets no entitlements, no claim token and no email, and is marked published.
  2. At §4 the funnel gets `--app starlyn`. Nothing re-runs.
  3. Every existing buyer has zero `entitlements` rows. "Restore purchase" by email gets a decoy (`customerForEmail` requires an entitlement row in the app), so they can never get in.
  4. One-time (add-on) buyers never generate another event. Subscribers only recover at their next renewal, up to a month later for monthly plans.

  The same thing happens to any funnel attached to an app after it has sold, which is the normal onboarding path for each new app. This directly defeats the spec goal ("Người đã trả tiền trên web vào được app").
- **Fix (code):** in the same transaction as `setFunnelApp` (and as a price-key change), queue a recompute for the funnel's customers. The customers come from `subscriptions.funnel_id` and from `transactions` joined to `checkouts.funnel_id`. Use a small table, e.g. `entitlement_recompute (customer_id PK)`, that the sync loop drains each tick under the same lock and SAVEPOINT rules as outbox customers. Do not replay the outbox: that would also mint claim tokens and email every past buyer. Whether to email past buyers should be a separate, explicit decision.
- **Fix (docs):** state in the runbook that attaching a funnel to an app backfills its buyers. Until the code lands, give the manual backfill and order §4 before §2.
- Add a test: purchase on a funnel with no app → attach the app → after one tick the buyer has entitlements and OTP verify links them.

#### I3. `checkout_id` became a bearer credential, but it is stored in ClickHouse and access logs, and `GET …/claim` answers it forever (web2web: unlimited magic links)

- **Where:**
  - `identity/link.js:105-131`.
  - `http/claim.js`: the Origin check is a request header, so any non-browser client can forge it.
  - `packages/sdk/src/checkout.js:121`: `track('checkout_complete', { plan, checkout_id })` goes to ClickHouse; `scrub` keeps ULIDs.
  - The Fastify access log records `/v1/checkout/<id>/claim`.
  - E12 leaves this endpoint without a rate limit.
- **Failure scenario:** anyone with read access to analytics (an analyst, a BI tool, or a leaked ClickHouse credential) takes a `checkout_id` and calls `GET /v1/checkout/<id>/claim` with any allowed Origin.
  - **web2web:** this mints a fresh 15-minute magic link on every call, with no time limit (the transaction is completed forever). The attacker redeems it to their own account. Repeating three times fills the 3-link cap, so the real buyer gets `link.revoked` and loses what they paid for. They can re-link by OTP, which revokes one attacker link, and the attacker can repeat.
  - **app:** the claim token is returned until it is used (7 days), so a buyer who restores only by OTP can have their token redeemed by someone else.

  E1 and E13 accepted "whoever knows checkout_id can get the token" on the premise that the id is hard to guess. They did not account for this branch's own SDK writing it to analytics. I am not re-litigating E1/E13; this is a cheap bound that keeps them intact.
- **Fix:**
  - Answer `GET …/claim` only while `checkouts.completed_at > now() - interval '1 hour'`. The SDK needs 20 s; the email carries the claim after that. After the window, return 404 `claim_window_closed` or 202 → SDK stop.
  - For `web`, cap magic links per checkout (e.g. ≤ 5 rows for the checkout, which needs a `checkout_id` column on `magic_links`). This also closes the parked Task 6 minor ("magic link per call, unbounded").
  - Add tests for both.
  - Optionally (billing-owned, follow-up): stop sending `checkout_id` in `checkout_complete` props.

#### I4. Claim emails run inline in the entitlement-sync loop and hold claim_tokens row locks across SES calls

- **Where:** `identity/sync.js:215-218` (one loop: `syncOutbox` then `sendClaimEmails`) and `identity/sync.js:156-196`. Up to 20 rows are locked `FOR UPDATE` while each `mailer.send` is awaited one after another, with a 10 s timeout each (`setup.js:33`). Retries come every tick (≈ 2 s), so all 3 attempts are spent within a few seconds.
- **Failure scenario:** SES is degraded and calls hang until the 10 s abort.
  - Each loop iteration then spends up to 20 × 10 s = 200 s in `sendClaimEmails` before the next `syncOutbox`. Refunds, cancels and new purchases stop propagating for minutes at a time, for as long as new purchases keep arriving.
  - During those 200 s, `/v1/claims/redeem` for any of the locked tokens blocks on `SELECT … FOR UPDATE`, and the app backend times out.
  - A short SES blip of ~6 s exhausts all 3 attempts, and the buyer never gets the email.

  This is the parked Task 9 "stacked SES timeouts" and Task 5 "email retry spacing". I promote them because they couple the non-critical email path to the critical entitlement path.
- **Fix:**
  - Run `sendClaimEmails` in its own `loop('claim_email', …)`.
  - Claim rows in a short transaction: set `email_attempts = email_attempts + 1, next_email_at = now() + backoff` with `SKIP LOCKED` and commit, then send without holding locks, then set `emailed_at`. Use backoff of e.g. 1 min / 10 min, which needs a `next_email_at` column in 004.
  - Optionally send with bounded concurrency.

#### I5. Any approved refund, including a partial goodwill refund, switches the entitlement off

- **Where:** `identity/entitlements.js:15-21,30`. The reversal is `EXISTS outbox topic IN (payment.refunded, payment.chargeback)` regardless of `payload.type`; billing writes `type` (full or partial) into the payload.
- **Failure scenario:** support issues a $1 partial refund to calm an unhappy weekly subscriber, or a tax correction is refunded. The next tick sends `entitlement.updated` with `active: false`, and the buyer loses premium they are still paying for. The spec says "Refund hoặc chargeback: quyền tắt", but it is silent on partial refunds, and a reasonable buyer and support agent would expect a partial refund not to revoke access. The ledger parked this as a product decision.
- **Fix:** get the product decision before merge. The default I recommend is a one-line change: `AND (o.topic = 'payment.chargeback' OR o.payload->>'type' = 'full')`, in both queries, with a compute/sync test for each case. If product wants partial refunds to revoke, record the ruling and say so in `docs/integration/app-backend.md`.

### Minor

1. **A second rotation inside 24 h drops the key in production at once** (`identity/apps.js:78-88`, parked Task 3). If ops rotates again before the backend has deployed the first new key, the original key goes out with no grace period, and every identity call returns 401 (restores fail). **Fix before merge (cheap):** return `409 rotation_in_progress` while `prev_key_expires_at > now()`, unless the request passes `force: true` (CLI `--force`).
2. **resendDelivery locks two customers in arbitrary order** (`identity/webhooks.js:183-187`), while sync locks in ascending order. A deadlock is possible: Postgres resolves it and the sync side parks that customer, so the effect is small. **Fix before merge (one line):** lock `min(a, b)` then `max(a, b)`.
3. **Docs vs code (Task 12 carry, all fix before merge)** in `docs/integration/app-backend.md`:
   - Lines 80-81: "period end + 3 days of grace" is true only for active, trialing and past_due. Canceled has no grace (`expires_at` = period end).
   - Lines 83-84: "Redeeming before iFunnel has processed the payment works: you get `entitlements: []`" is wrong for claim tokens. The token row exists only after sync, so an early redeem is `404 claim_not_found`. The sentence is true only for magic links and OTP. Say so, and tell backends to retry a 404 for a few seconds.
   - §4 Express example: `express.raw` gives a `Buffer`; say that it is used as-is or as `rawBody.toString('utf8')`.
   - §4: retries are re-signed with a new `t` and the same `Ikf-Event-Id`.
   - §2.2: "use the most recent code" (parked Task 7 minor 3).
   - Runbook §5.5 / Operations: who has DB access to staging and how (`next_attempt_at`, `sync_failures`), and the I2 backfill.
4. **Parked minors that can stay (follow-ups, no user harm at current scale):**
   - Task 1: kind-field check, `claim_tokens` without FK, schema test gaps, no OTP/magic cleanup (add a retention job later).
   - Task 2: duplicate test input, inactive entitlement with `expires_at: null` (docs say check `active`), invalid date string.
   - Task 3: concurrent same-id create overwriting the secret, orphan secret, wrong-kind fields dropped, test gaps.
   - Task 4: unused `ENTITLEMENT_KEY_RE`, `app_id` committed before pixel validation.
   - Task 5: double claim email on crash (at-least-once), clock skew, customerRef rewrite, >200 sweep test.
   - Task 6: expired-token test without a `used_at` assert, no two-customer race test, expiry vs app clock.
   - Task 7: concurrent send race (spam bounded by the edge limit), test gaps.
   - Task 8: transaction open during POSTs (bounded at 10 s), cross-app head-of-line in the 20-row batch, `arrayBuffer`, secret cache stampede, throttle test.
   - Task 9: shutdown drain vs the 10 s exit, HTTP closing after workers, billing alarm logging `err.message`.
   - Task 10: handler overwrite on a non-`<a>` element, test gaps, `location.assign` throw.
   - Task 11: the four CLI minors.
   - New:
     - The SDK stops polling on a 5xx (`checkout.js` `claim`); retrying 5xx would be nicer, and the email covers it.
     - `ikf customer show <email>` puts the email in shell history (operator machine only).
     - The first enable after a long disabled period emails claim links to the whole backlog (document it in the runbook).

## Recommendations

- Put an `EXPLAIN (FORMAT JSON)` smoke test on the recompute queries in CI, so a missing index shows up as a test failure, not as a production incident.
- Treat `checkout_id` as sensitive platform-wide (the billing follow-up in I3).
- When the identity code is next touched, add a retention job for `otp_codes`, `magic_links`, `claim_tokens` and delivered `webhook_deliveries`.

## Declined to judge

- E1/E13 (a derived token, and a fresh magic link per call): rulings kept. I3 only bounds them in time and count.
- E6/E7 grace and latest-payment semantics: decided in the plan. Not re-litigated.
- E18 (OTP links only the newest customer with that email): decided.
- The Task 8 resend ruling and the Task 7 decoy ruling: decided. I checked that both are implemented correctly.
- The 3-link cap revoking the oldest link even when it is the buyer's current device: spec decision #4.
- The pre-existing `appHandoffUrl()` appending `email=` in 8 funnels (E11): outside this branch (HTML funnels are not edited).
- The demo backend (E17): moved out of the plan.
- Throughput above the current scale (a sweep of 200 per 5 min, 20 webhooks per second): not exercised by the spec's exit criteria.

## Assessment

**Ready to merge? With fixes.**

**Reasoning:** the core design is sound and well tested: idempotent recompute, ordered signed webhooks, enumeration-safe OTP and a clean disabled mode. Five integration gaps would hurt real buyers or operations at launch, all cheap to fix:
- missing indexes on the hot recompute and claim queries;
- buyers on funnels attached after they bought are stranded;
- `checkout_id` exposure turns `GET …/claim` into an unbounded takeover path for web2web;
- SES slowness stalls entitlement sync;
- partial refunds revoke access.

## Fix list before merge

1. **I1:** add indexes in 004 on `subscriptions(customer_id)`, `transactions(customer_id)`, `transactions(paddle_subscription_id, billed_at DESC)`, `transactions(checkout_id)`, `outbox(aggregate_id, topic)` and `webhook_deliveries((payload->>'customer_ref'), id DESC)`. Record an E16 ruling for the additive billing-table indexes.
2. **I2:** attaching a funnel to an app (and changing a plan's entitlement key) queues a recompute of that funnel's existing buyers, through a drained `entitlement_recompute` table with no claim emails. Add a test, and put the backfill and step order in the runbook.
3. **I3:** `GET /v1/checkout/:id/claim` answers only within 1 h of `checkouts.completed_at`, and caps magic links per checkout (closes the parked Task 6 E13 minor). Add tests.
4. **I4:** run claim emails in their own loop. Claim rows in a short transaction (no row lock across SES), and space retries with `next_email_at` backoff (closes the parked Task 5 retry-spacing and Task 9 stacked-timeout minors).
5. **I5:** get the product decision on partial refunds. By default only full refunds and chargebacks revoke (`payload->>'type' = 'full'`). Add tests and a doc line.
6. **Minor 1:** rotate-key returns 409 while the previous key is still in its 24 h window, unless forced (CLI `--force`).
7. **Minor 2:** resendDelivery locks the two customers in ascending id order.
8. **Doc:** canceled subscriptions have no grace; `expires_at` is the period end.
9. **Doc:** an early claim redeem is `404 claim_not_found` (retry briefly); `entitlements: []` applies only to magic link and OTP.
10. **Doc:** the Express raw body is a Buffer; use it as-is or `toString('utf8')`.
11. **Doc:** retries are re-signed with a new `t` and keep the same `Ikf-Event-Id`.
12. **Doc:** OTP: the newest code is the valid one.
13. **Runbook:** a DB-access note (who and how, for `next_attempt_at` and `sync_failures`), and a note that the first enable emails claim links to the backlog.

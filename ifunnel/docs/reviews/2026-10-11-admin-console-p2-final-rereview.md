# Admin Console đợt 2 — Fix wave + scoped re-review

- Range `f33c597..331299d` (3 commit), re-reviewer Claude Opus, 2026-10-11. Final review: `2026-10-11-admin-console-p2-final-review.md`.
- Verdict: **all 8 findings addressed**; fix diff has no Important issue; runbook wording items parked (below).

## Fix wave commits
| SHA | Finding | Change |
|---|---|---|
| f2d8750 | I1, I2 | `createApp` runs in `withTx` with `pg_advisory_xact_lock(hashtext('app:'+id))` before the exists check → put → insert (two concurrent creates: one 201, one 409, `put` once; test with `Promise.all` on the real pool). SPA `Apps.jsx` `busy` guard on Tạo app; `AppDetail.jsx` pending guard on webhook Gửi lại (all rows disabled while one pends). |
| e2493e3 | I3, #4, #5, #6, #7 | Runbook: no self-service recovery after rotate without email/claim (OTP does not apply to `handoff=user_id`); dialog warns before confirm when `!has_email || !claim`. Rotate: post-commit resend errors caught, log `{code}` only, `email_queued:false`. `Customers.jsx` invalid query no longer leaves `Tìm` stuck. Runbook: grant reason lives on the grant, not in audit. Grant `:id` `maximum: MAX_SAFE_INTEGER`. |
| 331299d | #8 | `versions.plan_keys` filtered by `PLAN_KEY_RE` (from `billing/prices.js`), capped at 50 (sorted order, as `planKeysFromHtml` already sorts). |

Totals after the wave: core-api 492, admin SPA 105, `demo:test` 115, build OK, ports free, tree clean.

## Parked (ruling in ledger)
- Runbook "fix the email in Paddle, then Gửi lại" also needs a reconcile run (or the next renewal) to refresh `customers.email` — there is no `customer.updated` handler.
- Runbook groups `no_claim` with `no_email` but the remedy differs; "grant on a new customer" wording is unclear (grants need an existing customer and do not deliver a `user_id`).
- Concurrency test forces overlap with a 50 ms `put` delay but cannot prove the lock path was taken; assertions still hold either way.
- `hashtext` int4 advisory key shares the keyspace with `kv:<host>` and the migration lock (collision = short wait only).
- Out of scope: `createApp` holds a pool connection + lock during the Secrets Manager `put`; a `put` that succeeds before a non-23505 INSERT failure orphans a secret (overwritten on retry).

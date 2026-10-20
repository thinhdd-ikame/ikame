# Self-care cancel — whole-branch review (2026-10-16)

Range `b19d8ec..a67137e` (37 files, +1805). Reviewer: Opus, read-only. Verdict: **Ready to merge with fixes**.

## Alignment

The branch delivers spec §1–§8:
- migration 010 exactly as specified;
- `hostApps` per decision 4;
- buyers and strangers run identical queries, with decoy rows;
- host-bound bearer sessions;
- `Origin`-derived host, with the preview host refused;
- `no-store` on every answer;
- the §3 cancel/resume table, followed by an inline `syncMessage`;
- the customer audit actor (migration 011);
- the edge page behind the live-host check;
- the manage link in the purchase email;
- the admin badge and audit label;
- the demo fake, panel, e2e test and runbook.

The seams between tasks hold:
- **Page ↔ API contract:** fields, error codes and the 401 flow match.
- **CORS:** production is cross-origin (preflight with `authorization`); the demo is same-origin, and its proxy injects `Origin`.
- **Turnstile:** the token is bound to the page host.
- **Scoping:** recomputed on every request.
- **Webhook deduplication:** the inline sync writes the outbox; the later webhook sees the row is not older and returns.
- **Entitlements:**
  - a scheduled cancel keeps `active`;
  - `cancel_scheduled` is emitted once;
  - an immediate cancel of a `past_due` subscription ends access, because Paddle nulls the period.

## Findings

| # | Sev | Finding | Outcome |
|---|---|---|---|
| 1 | Important | Demo "Hết kỳ" kept `current_billing_period` in the future, so access stayed on (breaks the spec's definition of done); the e2e only checked text | Fixed: the fake nulls the period on cancel (immediately and endPeriod), 409 on already-canceled; the e2e asserts the entitlement is inactive |
| 2 | Important | Migration 011 ALTERs hot `audit_log` without `lock_timeout` | Fixed: `SET LOCAL lock_timeout = '5s'` |
| 3 | Minor | "3 per hour" OTP limit not atomic under parallel sends | Fixed: advisory xact lock on (email_hash, host); test with 5 parallel sends → 3 |
| 4 | Minor | Targeted lockout: verify has no Turnstile, attempts per row | PR note + runbook (support cancels from Admin); later: per-hour attempt count or Turnstile after 2 failures |
| 5 | Minor | Mailer microtask work ran before the reply | Fixed: `setImmediate` |
| 6 | Minor | Resume on an already-canceled sub could report success via R1 | Fixed: `wantedResume` excludes `canceled` |
| 7 | Minor | e2e never exercises the production cross-origin path | PR note (inject tests cover the preflight) |
| 8 | Minor | Turnstile `action` not checked | Accepted, same as checkout; tokens are single-use |
| 9 | Minor | No CLAUDE.md conventions bullet | Fixed |
| — | parked | `account_paddle_failed` logged before R1 recovery; audit after re-read; claim query inner join to checkouts | Fixed: log only on final failure (`account_paddle_recovered` otherwise); audit right after the Paddle change; `client_url` read through a correlated subselect in RETURNING |

## Declined to judge
- **Resume is not announced to app backends** (spec §10 parks `subscription.cancel_removed`). Recorded as a PR note.
- **Zero-decimal currencies:** parked under ruling R6.
- **Real Paddle edge cases** (cancel while a pause is scheduled; trialing + `next_billing_period`). These need a sandbox check.
- **Turnstile site-key domain list:** an ops matter, shared with checkout.

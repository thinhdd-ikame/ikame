# Self-care cancel — final re-review (2026-10-16)

Fix commit `7d08bc7`. Reviewer: Opus, scoped to the fix wave. **Verdict: Approved.** The reviewer re-ran `account-otp`, `account-subscriptions` and `sdk-handoff` against Postgres: 51/51 pass.

| Item | Result |
|---|---|
| 1. Fake Paddle nulls the period on cancel / end-period | ✅ Every demo reader handles null. Core sync maps `current_billing_period?.ends_at ?? null` to `current_period_end`, and `compute.js` treats canceled + null as inactive. The e2e asserts the subscription entitlement is inactive after "Hết kỳ" |
| 2. Migration 011 `lock_timeout` | ✅ |
| 3. Atomic OTP rate limit | ✅ |
| 4. Paddle failure logging, audit order, resume on canceled, new tests | ✅ <ul><li>The audit is written right after the Paddle change, so it still only records real changes: the 409, 404 and 502 paths come first.</li><li>A recovered 4xx is audited, because the change did happen.</li></ul> |
| 5. Claim query | ✅ `checkouts` was removed from FROM, so `FOR UPDATE SKIP LOCKED` stays on `claim_tokens` only. A missing checkout row still mails, without the link |
| 6. Docs (runbook limits, CLAUDE.md bullet) | ✅ |

Item 3 in detail:
- Buyer and stranger run the same sequence: BEGIN, advisory lock, count, buyers, INSERT, COMMIT. The rate-limited path runs BEGIN, lock, count, COMMIT.
- The lock is xact-scoped, and the client is released in `finally`.
- Mail is sent via `setImmediate` after commit. Errors are logged by code only.

Remaining minors, not blocking:
- The demo panel still offers Expire/Renew on a canceled subscription, which real Paddle would refuse. This affects the demo only.
- If `audit()` throws after Paddle has applied the change, the buyer sees a 500 although the change happened.

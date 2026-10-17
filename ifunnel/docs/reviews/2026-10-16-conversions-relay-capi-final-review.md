# Final review — Conversions Relay (Meta CAPI), PR #12

Branch `feat/conversions-relay-capi` 0b8b00c..ab9ea18, reviewer: most capable model, 2026-10-16. Verdict: **Ready to merge: with fixes.**

## Strengths
- Claim → send → write is correct for several core-api processes: one `UPDATE … FROM (SELECT … FOR UPDATE SKIP LOCKED)` lease, HTTP outside any transaction, result writes guarded by `status='pending' AND attempts=<claimed>`.
- Token secrecy holds on every path (JSON body only, codes-only logs, last4 in audit/API, stdin-only CLI, password input in SPA, IAM without DeleteSecret).
- PII discipline: `capi_events` holds none, `client_url` stripped, IP/UA swept at 30 days.
- Permissions match đợt 4b (viewer reads, admin in app writes, resend by the event's app).
- Renewal attribution from the subscription's earliest checkout.

## Important (fixed in the fix wave)
1. Renewals after the 30-day sweep sent as `website` without `client_user_agent` (Meta requires UA) → `website` only with URL and UA.
2. Meta throttling/transient codes on 400/403 and HTTP 408 classified dead or as token errors → retry, checked first.
3. One malformed outbox payload blocked enqueue for 7 days → filtered in the enqueue WHERE.
4. One invalid event killed a chunk of 50 → send-time `too_old` skip; `client_ip` validated with `net.isIP`.
5. Token rotation across ECS tasks: stale cache up to 10 minutes → cache invalidated by `apps.capi_token_set_at`.
6. $0 trial transactions sent as Purchase value 0 → `skipped zero_value`.

## Minor
Fixed: CLI echoed a bad app id (a swapped token would print); alarm subject prefix "ikf billing:"; `Promise.all` → `allSettled` in send; wrong CapiSettings comment.
Deferred (in PR): `event_source_url` is only the funnel origin in production (referrer-policy); enqueue-side no_token race (PUT again); no bulk resend; `dead_24h` by `created_at`; 009 index built non-concurrently.

## Ledger triage
Fix before merge: Task 3 throttling codes, Task 4 poison row, Task 1 client_ip validation, Task 7 echo, Task 5 allSettled + alarm prefix, Task 8 comment. Defer: the rest (see ledger).

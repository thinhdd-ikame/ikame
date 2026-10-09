# SDD ledger — plan: /Users/daothinh/ikame-ifunnel/ifunnel/docs/plans/2026-10-09-entitlement-identity.md
Spec: /Users/daothinh/ikame-ifunnel/ifunnel/docs/specs/2026-10-09-entitlement-identity-design.md
Worktree: /Users/daothinh/ikf-platform-entitlement, branch feat/entitlement-identity from ffb2d21 (created by controller before Task 1).

## Pre-flight scan
| Pair / task | Produces → consumes | Finding |
|---|---|---|
| T1→all | 004 tables/cols, resetDb | consistent with T3–T8 consumers |
| T2→T5 | computeEntitlements signature | matches |
| T3→T4,T6,T7,T8,T11 | tokens.js, apps.js, requireApp, helpers seedApp/fakeSecrets | T7 extends appForKey with `name` — planned evolution, not a conflict |
| T3/T8 share src/http/apps.js | T8 appends routes | sequential, OK |
| T4→T5,T11 | setFunnelApp, entitlement_key | matches |
| T5→T6,T7,T8,T9 | entitlements.js, claims.js, sync.js, mailer, helpers | matches |
| T6/T7 share src/http/identity.js, plugin gate | T7 adds deps.mailer to gate | planned evolution |
| T8→T9,T12 | webhooks.js signPayload/verifySignature/secretCache | matches |
| T6→T10 | GET /v1/checkout/:id/claim 200/202/404 | matches |
| T3,T4,T8→T11 | API endpoints | matches |
| per task | tests vs code | plan blocks were executed byte-for-byte twice in scratch by the plan author; no self-contradiction found |
Billing-code touches limited to table E16 (reviewers: check this).
Ruling: Task 1 Step "create branch/worktree" already done by controller — implementer skips it — cost if wrong: none.
Task 1: dispatched implementer (BASE ffb2d21)
Task 1: complete — 9e0bd94 — core-api 212. Review: spec ✅ quality approved; 4 minor parked (kind-field check, claim_tokens no FK to checkouts, schema test gaps, no OTP/magic cleanup) — Ruling: park; all come from plan/spec text, revisit at final review — cost if wrong: small follow-up migration.
Task 2: complete — f70c2b4 — core-api 235/0 skipped (reviewer run). Review approved; minors parked: duplicate refund/chargeback test input; inactive entitlement may report expires_at null (pick latest past end?) — revisit at final review; invalid date string → Invalid Date; default now. Ruling: park — plan-mandated, low impact — cost if wrong: small fix later.
Note: implementers must export Docker env (Task 2 run skipped 122 DB tests).
Task 3: complete — b4f3d06 — core-api 242/0. Review approved. Ruling: key auth by SQL lookup on sha256(key) satisfies constant-time intent (lookup by hash leaks nothing about the key) — cost if wrong: none. Parked minors: same-id concurrent create may overwrite secret (consider create-only put in Task 9/final), orphan secret on non-23505 failure, second rotate within 24h drops first key immediately, wrong-kind fields silently dropped, test gaps (no-store on rotate, admin role).
Task 4: complete — 7d10f4c — core-api 247/0. Review approved, billing behaviour preserved. Parked minors: unused ENTITLEMENT_KEY_RE export; re-PUT prices without entitlement_key resets custom key to premium (PUT = full replace; check CLI keeps @key — Task 11); app_id committed before pixel validation in combined PUT.
Task 5: review — needs fixes (3 Important, all from plan code). Rulings:
- I1 SES error text may contain buyer email → log/alarm only err.name/code + email_hash, never err.message — spec "log has no email" — cost if wrong: less debug detail.
- I2 poison outbox rows loop forever / head-of-line block → new table sync_failures(customer_id PK, attempts, next_at, last_error_code) appended to 004 (unreleased); failed customer gets backoff min(2s*2^attempts, 1h), selection skips customers with next_at > now (outbox and sweep), success deletes the row, alarm `sync_failing` once attempts reaches 5 — keeps billing outbox schema untouched (E16) — cost if wrong: one extra table.
- I3 add SAVEPOINT isolation test (A fails, B committed, A rows unpublished) + backoff test.
- Minors parked: double claim email on crash (accepted, at-least-once), email retry spacing, clock skew, SES timeout (Task 9 sesMailer should set a timeout — carry to Task 9), customerRef rewrite, partial refund semantics (product decision), >200 sweep test.
Task 5: fix round 1 dispatched (resume implementer)
Task 5: fix round 1 — b128977 (sync_failures table + backoff, no err.message, isolation tests) — re-review: all 3 Important addressed; 3 new minors.
Task 5: fix round 2 — bbb1d93 (loop catch errCode, alarms fired after COMMIT, cast guard) — controller inspected diff, OK.
Task 5: complete — fb8e40e..bbb1d93 — core-api 265/0. NOTE: test counts now +6 over plan Expected for later tasks (plan 259 → 265). Carry to Task 9: sesMailer needs a send timeout.
Task 6: complete — d0d2fba — core-api 275/0. Review (opus) approved; lock order safe. Parked minors: GET …/claim for web creates a magic link per call, unbounded (E13) — consider reuse/limit at final review; expired-token test doesn't assert used_at; no test for two customers racing for one app_user_id; expiry vs app clock.
Task 7: review (opus) — Important (plan-mandated): verify lockout (401→429 after 5) reveals buyer vs stranger. Ruling: fix — sendOtp always inserts an otp_codes row (stranger/no-entitlement → customer_id NULL, random never-mailed code, same rate-limit counting); verify on a NULL-customer row behaves identically (401, attempts, 429) and can never link even on a matching code — spec RF3 forbids enumeration — cost if wrong: dead rows in otp_codes. Also escape app.name in OTP email HTML (Minor 4). Other minors parked.
Task 7: fix round 1 dispatched
Task 7: fix round 1 — 280ec9b (decoy otp rows customer_id NULL, verify never links decoy, esc app name) — controller inspected source diff, OK.
Task 7: complete — 04e7279..280ec9b — core-api 287/0 (plan Expected +10 from here: plan 277 → 287).
Task 8: review (opus) approved with 1 Important (plan gap): resending an old dead delivery can restore stale state. Ruling: resend no longer replays the old payload — it enqueues a NEW delivery (new event id) carrying the user's CURRENT full state (active link → entitlement.updated with entitlementsOf; no active link → link.revoked with []), original stays dead; response returns the new event_id. Docs (Task 12) also tell backends to ignore events older than the last applied created_at. — webhooks are full-state, so current state is always the correct thing to send — cost if wrong: an extra delivery row per resend.
Parked minors: tx open during POSTs, cross-app head-of-line in shared 20 batch, arrayBuffer, secret cache stampede, no index on payload->>customer_ref, throttle test. Carry to Task 9: pass secretCache(...) and billing createAlarm (throttled) to the sender; sesMailer timeout.
Task 8: fix round 1 dispatched
Task 8: fix round 1 — bd145c7 (resend = new delivery with current state, resent_from) — accepted on report (well-scoped, tests cover stale + revoked + 404).
Task 8: complete — 4473bb4..bd145c7 — core-api 300/0 (offset +12 vs plan).
Task 9: complete — cb935e5 — core-api 305/0. Review approved. Carry to Task 12: IAM must grant CreateSecret, PutSecretValue, GetSecretValue on ikf/<env>/app-webhook/* and ses:SendEmail (check existing). Parked minors: shutdown drain vs 10s force exit with SES sends, HTTP closes after workers (billing order), stacked SES timeouts, concurrent create secret overwrite, billing alarm logs err.message.
Task 10: complete — 19445d5 — sdk 152, edge-router 101, e2e 11/11, bundle 8123. Review approved. Parked minors: onclick overwrites handler on non-<a>, test gaps (http:/data:, bad JSON, double checkout_complete), location.assign throw → repoll.
Task 11: implemented 0fa8bf5 (cli 113) — under review. Approved deviations: resend prints new id + resent_from, retry:false.
Ruling (Task 4 follow-up, load-bearing): PUT /v1/funnels/:slug/prices with a plan that omits entitlement_key must KEEP the plan's existing key; 'premium' only for a plan that has no row yet — otherwise re-setting prices without @key silently turns an add-on (tarot_2027) into premium, granting premium to add-on buyers — cost if wrong: an operator cannot reset a key to premium without typing @premium (acceptable). Dispatched as "Task 4b" fix.
Task 11: complete — 0fa8bf5 — cli 113. Review approved. Parked minors: no retry:false test for resend, generic error text for app_* codes, --dead+--resend, weak email check. Prices key reset handled server-side (Task 4b), not in CLI.
Task 4b: complete — 9d88aa3 — core-api 306, cli 113 — controller inspected diff (COALESCE on insert/update), OK.
Task 12: complete — f93b64d — core-api 307, tf edge 10 / stack 11, actionlint 0, all workspaces green. Review approved; doc minors carried to final fix wave (canceled has no grace; early claim redeem → 404 not []; raw body Buffer; retries re-signed with new t, same event id; runbook DB access note).
## Final review
Final review (opus) at f93b64d: ready after fixes — 0 Critical, 5 Important, fix list 1–13. All tests green.
Rulings for the fix wave:
- F1 indexes: allowed on billing tables too (additive CREATE INDEX IF NOT EXISTS in 004; extends E16) — hot recompute path — cost if wrong: small write overhead.
- F2 backfill on attach / key change: identity-owned queue table (not billing outbox), processed by entitlement-sync tick, recompute only, no claim emails; runbook order fixed — cost if wrong: extra table.
- F3 GET /v1/checkout/:id/claim answers only within 1h of checkout completion (else 404), max 5 magic links per checkout (then 429) — cost if wrong: late web2web buyers use OTP restore.
- F4 claim emails in their own loop, short claim tx, next_email_at backoff.
- F5 partial refunds: default per reviewer — only full refunds + chargebacks revoke, IF the outbox payload carries enough to tell full vs partial; otherwise keep current behaviour and document. Flag to user as product decision.
- F6 rotate-key 409 while previous key valid unless force. F7 lock ascending ids in resend. F8–F13 docs/runbook.
Final fix wave dispatched (one opus implementer).
Final fix wave: f93b64d..d51e725 (9 commits) — core-api 324, cli 114, sdk 152, all green. F5 implemented (Paddle adjustment type full/partial).
Residual N1/N2 fixed by controller — f6406a2 — core-api 324. N3/N4 + chargeback_reverse + emergency key revoke parked as follow-ups. Branch complete; NOT pushed (contains unpushed billing commits).

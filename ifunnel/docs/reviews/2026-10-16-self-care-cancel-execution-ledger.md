# Self-care cancel — execution ledger (2026-10-16)

Copied from the SDD workspace at the end of the run. Branch `feat/self-care-cancel` (base b19d8ec).

Spec: /Users/daothinh/ikame-ifunnel/ifunnel/docs/specs/2026-10-16-self-care-cancel-design.md
Branch feat/self-care-cancel base b19d8ec

## Pre-flight scan
| Pair / task | Shared | Finding |
|---|---|---|
| T1→T3 | paddle.cancelSubscription/clearScheduledChange | consistent names |
| T2→T3/T4 | hostApps, loadSession(customerIds) | consistent |
| T3→T4 | list/cancel/resume signatures | consistent |
| T4→T6 | route paths, error codes, data-ikf attrs → T7 e2e | consistent |
| T5 | customers.js cancel_at, audit actor {kind:'customer'} from T3 | T5 must render the actor T3 writes — noted in brief |
| T7 | Turnstile in demo for account page | open: demo may need TURNSTILE_JS_URL override — T7 decides |
Ruling P0: plan not scratch-verified (user asked for no check-ins) — cost: more fix rounds.
Task 1: implemented 62d2cb7→e31c37f (trailer fixed by controller)
Task 1 review: Approved-with-note. Important = report misstates retries (client retries every method incl. POST on timeout/5xx/429).
Ruling R1: keep the client as is (no opt-out); Task 3 handles it — on a Paddle 4xx from cancel/resume, re-read getSubscription and treat "already in the wanted state" (cancel scheduled / canceled; or no scheduled change for resume) as success, else 502. Covers lost-response retries and double clicks. Cost if wrong: a rare 502 the user can retry.
Task 1: complete (e31c37f)
Task 2: implemented 6dccd37. Review: Needs fixes — Important: buyer-only brandFor query (enumeration timing), no same-queries test; Minor decoy/cross-host tests.
Ruling R2: sendAccountOtp takes `brand` from the caller (route computes brandFor once per request). Task 4 brief amended.
Task 2: fix round 1 dispatched (resume implementer)
Task 2 fix round 1: 476d791 — controller re-checked otp.js diff (brand from caller, no buyer-only query) + 15 tests reported green. Task 2: complete (476d791)
Task 3: implemented 8588706 (DONE_WITH_CONCERNS: added migration 011 for audit actor kind 'customer')
Task 3 review: Approved. Migration 011 (actor_kind 'customer') judged correct. Minors parked for final fix wave: (1) account_paddle_failed logged before R1 recovery; (2) audit after re-read → write right after paddleChange; (3) double-click two audit rows (accept); (4) >90d canceled → 404 (accept, ruling: invisible to buyer); (5) account.* rows show in domain audit history via details.host (accept, note in PR); (6) resume other-app test + log assertion.
Task 3: complete (8588706)
Ruling R3: Task 5 runs in parallel with Task 4 (disjoint files: identity/sync.js, identity/customers.js, SPA vs http/account.js, app.js); each adds only its own paths. Cost if wrong: a rebase-free commit interleave, nothing more.
Task 5: implemented c932def
Task 4: implemented 059d0f4
Task 5 review: Approved. Minors parked: inner join checkouts in claim query (→ LEFT JOIN in final wave), no scheme recheck (accept), test gap query/fragment. Task 5: complete (c932def)
Task 6: implemented e814dc2
Task 4 review: Needs fixes — Important: Turnstile hostname not bound to host (copy checkout). Rulings R4: preflight skips hostApps (keep, comment); R5: logout idempotent 204 without/with bad bearer (keep, comment). Fix round 1 dispatched (resume implementer).
Task 4 fix round 1: 22b059a — controller checked diff (hostname bound; demo verifier already returns the funnel host). Task 4: complete (22b059a)
Task 6 review: Needs fixes — 409 message erased, no frame-ancestors/XFO, past_due confirm text false; minors (null period, price line, info style, plans error, turnstile reset, index.js err.message log, data-ikf test). Ruling R6: zero-decimal currencies (amount_minor/100) parked — Paddle amounts for JPY/KRW; note in PR. Fix round 1 dispatched.
Task 6 fix round 1: 9fb98cd — scoped re-review (happy-dom harness) Approved. Task 6: complete (9fb98cd)
Task 7: implemented a67137e
Task 7 review: Approved. Minors parked: e2e funnel version fetch guess, fake doesn't 409 on canceled, runbook paused→409 line. Task 7: complete (a67137e)
Final review: With fixes — Important: demo Hết kỳ leaves access on (fake period); migration 011 lacks lock_timeout. Minors taken: atomic rate limit, setImmediate mail, resume-on-canceled, CLAUDE.md bullet + parked minors. Declined/PR notes: verify lockout by attacker, cancel_removed topic, e2e same-origin, turnstile action unchecked, zero-decimal currencies. Final fix dispatched.
Final re-review: Approved (7d08bc7). Minor left: demo panel Expire/Renew on canceled sub; audit-throw-after-Paddle nit.

## Commits

- 7d08bc7 fix: final review wave (fake Paddle cancel nulls period, atomic OTP rate limit, audit order, claim LEFT JOIN, docs)
- a67137e feat(demo): self-care cancel in the demo; e2e; runbook
- 9fb98cd fix(edge-router): account page review fixes
- 22b059a fix(core-api): account otp/send binds Turnstile to the host
- e814dc2 feat(edge-router): self-care account page
- 059d0f4 feat(core-api): /v1/account routes
- c932def feat: manage-subscription link in purchase email; admin shows scheduled cancel
- 8588706 feat(core-api): account subscriptions list, cancel and resume
- 476d791 fix(core-api): account OTP send runs the same queries for buyer and stranger
- 6dccd37 feat(core-api): account OTP and host-scoped sessions
- e31c37f feat(paddle): subscription cancel and clear scheduled change; migration 010 account tables

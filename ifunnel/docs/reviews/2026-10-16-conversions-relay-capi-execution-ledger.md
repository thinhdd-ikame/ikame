# SDD ledger — plan: /Users/daothinh/ikame-ifunnel/ifunnel/docs/plans/2026-10-16-conversions-relay-capi.md
Spec: /Users/daothinh/ikame-ifunnel/ifunnel/docs/specs/2026-10-16-conversions-relay-capi-design.md
Branch feat/conversions-relay-capi from 0b8b00c. Scratch reference commits (byte-exact source of plan blocks): T1 476a513, T2 2cf8233, T3 c1c4fca, T4 6af4432, T5 d9d2663, T6 9860af6, T7 47883f6, T8 8e366f3, T9 4cb0b85 (scratchpad/capi-scratch).

## Preflight scan
| Rows | Produces → consumes | Found |
|---|---|---|
| T1 → T4/T5/T6 | migration 009 tables/columns; checkout client_ip/ua/url, attribution.ads_consent | consistent (scratch built sequentially on same tree) |
| T2 → T1 | SDK ads_consent values = server whitelist granted/denied/unknown_required | consistent |
| T3 → T5 | buildEvent/buildBody/classify/retryDelay/toValue/hashEmail/externalId | consistent |
| T4 → T5/T6 | enqueue, checkoutFor, sweepClientData, reviveNoToken | consistent |
| T5 → T6/T9 | capiTokens cached store (get/put/clear/drop), startConversions, memoryTokenStore, cachedTokenStore | consistent |
| T6 → T7/T8 | routes + error codes | consistent |
| T8 → T9 | data-testids | consistent |
| T1,T5 share core-api config/test files | config.test.js changed only in T5; migrate.test.js only T1 | ok |
| Each task self-consistent | tests vs code come from the same verified commit | ok |
| Plan-mandated changes to existing tests | T1 migrate.test.js, T2 two toEqual tests, T5 config.test.js, T8 three nav tests | allowed, listed in tasks |
Scan clean. Execution check: after each task `git diff --stat <scratch-commit> HEAD` must be empty (except package-lock/artefacts).
Ruling: run task N review in parallel with task N+1 implementation — reviews read a frozen diff file and each tree is checked byte-equal to its scratch commit; fixes from a review land as later commits — cost if wrong: a fix may need rebasing over the next task's commit (small, sequential files).
Task 1: implemented 6e8fb1a (tree == scratch 476a513); core-api 718 (75 files); review dispatched
Task 1: minor (deferred): client_ip stored unvalidated (from cf-connecting-ip/req.ip) — relay should treat as untrusted for client_ip_address
Task 1: Ruling: reviewer minor "trailer should be Sonnet" rejected — session attribution rule is Claude Opus 5.5 — cost if wrong: none (cosmetic)
Task 1: complete (commits 0b8b00c..6e8fb1a, review clean)
Task 2: implemented 5e4ea80 (tree == scratch 2cf8233); sdk 163, edge-router 106, bundle 8183 B
Ruling: rewrote local commit messages (trailer was on subject line) with filter-branch, not pushed — Task 1 = 668a375, Task 2 = 5b8218e; trees unchanged — cost if wrong: none
Task 2: minor (deferred): adsConsent passes any non-null consent.value through; server whitelist (Task 1) is the backstop
Task 2: complete (commits 668a375..5b8218e, review clean)
Task 3: implemented 27b0c1e (tree == scratch c1c4fca); core-api 734
Task 3: minor (deferred, ASK FINAL REVIEW TO FIX): classify treats Meta throttling codes (1, 2, 4, 17, 32, 613) on HTTP 400 and HTTP 408 as dead — should be retry (spec: "other 400 = bad payload")
Task 3: minor (deferred): retryDelay(NaN/undefined) returns undefined; toValue `/1` no-op; vacuous 'example.com/jane' assertion
Task 3: complete (commits 5b8218e..27b0c1e, review clean)
Task 4: implemented f07f818+3b7235f squashed to 557723d (tree == scratch 6af4432); core-api 744
Task 4: minor (deferred, ASK FINAL REVIEW): one malformed outbox payload (NOT NULL violation) rolls back every enqueue tick for 7 days — guard in WHERE or SAVEPOINT per row
Task 4: minor (deferred): enqueue holds outbox row locks over ~2 round trips/row (entitlement-sync skips them meanwhile) — LATERAL + multi-row insert
Task 4: minor (deferred): sweep has no partial index on checkouts(created_at) WHERE client_ip/ua NOT NULL; `now` option untested; reviveNoToken uses DB now()
Task 4: complete (commits 27b0c1e..557723d, review clean)
Task 5: implemented c37428c (tree == scratch d9d2663); core-api 767 (79)
Task 5: review → Needs fixes. Important #1: unconditional no_token skip (relay.js:246) races a token PUT (reviveNoToken no-op on claimed rows) → rows stranded skipped. Fix round 1 queued after Task 6 commits (same worktree): guarded skip + test; also Minor #1 (result writes guarded by status='pending' AND attempts=claimed).
Task 5: minor (deferred): Promise.all leaves groups untracked on error (allSettled); N+1 checkoutFor in send; no note() on no_app/no_pixel path; dead META_GRAPH_URL missing-check in setup.js; alarm subject prefix "ikf billing:"; external_id omitted when customer_id null (record as adjustment)
Task 6: implemented 8184901 (tree == scratch 9860af6); core-api 781 (81)
Task 6: minor (deferred): no test for capiTokens.put/clear throwing; concurrent PUTs can desync last4 vs secret (lock apps row first); appSummary TypeError if app deleted mid-request; ?app= empty → bad_request not app_required. ⚠️ last_error holds codes only — confirmed: classify() returns codes only (Task 3), secrets_<err.name> (Task 5)
Task 6: complete (commits c37428c..8184901, review clean)
Task 5: fix round 1 committed cdbcf4f (core-api 783/81); re-review dispatched
Task 5: fix round 1/5 (2 addressed, 1 new Important — set_at present but secret null → rows re-claimed forever with growing attempts; commits 8184901..cdbcf4f). Round 2 queued after Task 7 commits: guard-blocked no_token → markRetry 'no_token_secret'.
Task 7: implemented 637affb (packages/cli == scratch 47883f6); cli 274 (25)
Task 7: minor (deferred): capiAppId echoes the typed value (a token typed in the app slot would be printed back); status shows max 10 dead with no "more" hint; default stdin wiring untested
Task 7: complete (commits cdbcf4f..637affb, review clean)
Task 5: fix round 2 committed c76bd98 (core-api 785/81); re-review dispatched
Task 5: fix round 2/5 (1 addressed, 0 open; commits 637affb..c76bd98)
Task 5: minor (deferred): `rest` in no_token branch counts rows another worker already moved (metrics/log only)
Task 5: complete (commits 557723d..c37428c + fixes cdbcf4f, c76bd98; review clean after 2 rounds)
Task 8: implemented 9951fc7 (apps/admin == scratch 8e366f3); admin 271 (30), build ok
Task 8: minor (deferred): CapiSettings comment says input cleared "whatever the answer" but only on success (comment wrong); token save resets unsaved test-code edit; resend reloads page 1 only
Task 8: complete (commits c76bd98..9951fc7, review clean)
Task 9: implemented ab9ea18 (demo/infra/docs == scratch 4cb0b85); demo 137 (26), terraform test 13/13
Task 9: minor (deferred): stack.mjs capi relies on purchase⇒shop implicitly; seedCapi result unchecked unless caller throws; e2e http() JSON.parse on any body; fake-graph red phase not observed
Task 9: complete (commits 9951fc7..ab9ea18, review clean)
Task 10: full suite at ab9ea18: paddle 34, event-schema 145, funnel-lint 35, sdk 163, cli 274, edge-router 106 (8183 B), event-consumer 8+27, core-api 785 (81), route-match 35, admin 271 (30), build ok; demo 137 (26) from Task 9 run
Final review: Ready with fixes. Important 1–6 (renewal website w/o UA; transient Meta codes; poison outbox row; chunk poisoning by stale/invalid events; stale token cache across tasks; $0 trial Purchase). Fix wave dispatched (final-fix-brief.md) incl. minors 7–10.
Ruling: renewal/any event without client_ua → system_generated — Meta requires UA for website — cost if wrong: slightly lower match quality on renewals
Ruling: transient Meta codes {1,2,4,17,32,613,80004} or is_transient, and HTTP 408 → retry, checked before token branch — cost if wrong: a few extra retries
Ruling: malformed outbox rows filtered in enqueue WHERE (never enqueued, no alarm) — cost if wrong: such a payment silently not sent (can't happen with current writer)
Ruling: send-time too_old skip + client_ip validated with net.isIP; no per-event chunk splitting — cost if wrong: one bad event can still kill a chunk of ≤50
Ruling: token cache invalidated by apps.capi_token_set_at — cost if wrong: none
Ruling: value_minor <= 0 → skipped zero_value (009 edited in place, not deployed) — cost if wrong: $0 trials invisible to Meta (spec says no StartTrial)
Ruling: deferred — client_url is only the funnel origin in prod (referrer-policy strict-origin-when-cross-origin); enqueue-side no_token race (PUT again fixes); bulk resend; dead_24h by created_at; 009 index built non-concurrently (check outbox size before deploy) — listed in PR
Final fix wave: commits b4cd290, 1129989, ecafca9, fee2a59, 8c511f6 (core-api 799, cli 275, admin 271, demo 137)
Ruling: skip order changed to no_app, no_pixel, no_consent, zero_value, no_token, too_old (spec said no_token before no_consent) — otherwise a later token sends non-consented purchases — cost if wrong: none (more conservative)
Ruling: reviveNoToken turns $0 no_token rows into zero_value (fixer addition) — accepted
Final fix wave re-review (ab9ea18..b19d8ec): items 1–10 + consent-order ruling ADDRESSED, no new Critical/Important. Pushed b19d8ec, PR #12.

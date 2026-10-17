# Admin Console đợt 1 — SDD execution ledger

Copied from the git-ignored SDD workspace at the end of execution (2026-10-11). Branch `feat/admin-console-p1` d47ebdf..e1b92cf.

```
# SDD ledger — plan: /Users/daothinh/ikame-ifunnel/ifunnel/docs/plans/2026-10-11-admin-console-p1.md

Spec: /Users/daothinh/ikame-ifunnel/ifunnel/docs/specs/2026-10-11-admin-console-p1-design.md
Worktree: /Users/daothinh/ikf-platform-admin, branch feat/admin-console-p1 from d47ebdf (feat/demo-purchase). PR base: feat/demo-purchase.
Env for tests: DOCKER_HOST=unix://$HOME/.colima/default/docker.sock TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock TF_PLUGIN_CACHE_DIR=$HOME/.terraform.d/plugin-cache
Note: live demo:purchase tunnel still running from /Users/daothinh/ikf-platform-demo-purchase (ports 8080/8787/8788/8790/8791, compose containers). Must be stopped before Task 14/16 demo:test.

## Pre-flight scan (plan verified end-to-end by its author: every block applied in order on fresh d47ebdf matched the scratch tree)

| Pair / task | Produces vs consumes | Found |
|---|---|---|
| T1 ↔ T2 | audit_log(actor, actor_kind, action, target, details) ↔ audit(db, actor, action, target, details) | consistent |
| T2 ↔ T3 | T2 makes req.actor token object; T3 replaces auth.js wholesale, adds user actors | consistent (order T2→T3) |
| T3 ↔ T8 | src/admin/users.js: T3 creates ensureLocalAdmin only; T8 replaces whole file keeping it | consistent |
| T3 ↔ T4 | config.admin {appEnv, localUser} → T4 adds origin/apiOrigin/googleClientId; both touch config.test.js | consistent |
| T4 ↔ T10 | cors.js adminCors(app, origin) → T10 adds expose x-request-id | consistent |
| T5 ↔ T12 | funnelDetail live[] → T12 adds previous; GET /v1/funnels keeps {host,prefix,v} | consistent |
| T6 ↔ T7 ↔ T11 | lint(html,{slug,app,mediaOrigins,maxBytes}), SCRIPT_ALLOWLIST, MAX_BYTES, byteLength, configFunnel | consistent |
| T2 ↔ T7 | lintCounts(report) (T2) vs versions.lint_report {errors, warnings, client?} (T7, A14) | consistent per author's full run |
| T10 ↔ T11/12/13 | App.jsx routes added incrementally; api.js syncHost added T13 | consistent |
| T3/T4 ↔ T14 | buildApp deps.admin {appEnv:'local', origin, localUser}; demo host demo.localhost (A11) | consistent |
| T3 ↔ T15 | ADMIN_LOCAL_USER refused: config, buildApp, core-service tf, deploy-config | consistent (A20) |
| T8 ↔ T9 | CLI admin uses GET/POST/PUT /v1/admin/users | consistent |
| T14/T16 vs Global | ports 8792 admin, e2e 8837/8138/8839/8842, DB ikf_admin_test | consistent |
| Each task self | tests vs code vs files: mechanically verified by author (applied in order, byte match) | clean |
| Rubric: T6 corpus.test.js "report, does not fail" | a test that asserts nothing | Ruling below |

Ruling: T6 corpus test keeps the report role but must assert at least that lint ran on every file without throwing and that the corpus count > 0, and must skip (not fail) when funnel-development is absent — spec wants the report, rubric wants an assertion; costs nothing if wrong (one extra expect).
Ruling: live demo tunnel will be stopped by the controller before Task 14 (demo:test needs the fixed ports) — user offered to say when to stop it; stopping is reversible (npm run demo:purchase restarts) — cost if wrong: user loses the current tunnel URL.

## Progress
Task 1: minor (deferred): no index on admin_sessions.user_id (admin scale, harmless); admin-schema test pins exact audit_log index list
Task 1: complete (commits d47ebdf..42f3108, review clean; core-api 350/36 files)
Task 2: Ruling: prices audit after COMMIT (plan-mandated, treated prices as single-statement) conflicts with the spec rule "audit inside the change's transaction when there is one"; setFunnelPrices is BEGIN…COMMIT — fix: pass actor into setFunnelPrices, audit before COMMIT — cost if wrong: one extra parameter on a billing function.
Task 2: minor (deferred): audit insert failure after token/app key creation loses the one-time secret (500 after success); actorOf(undefined) throws TypeError; funnel.pixel audits no-op; funnel.prices details don't distinguish set vs removed; "failed change writes no audit row" test fails before any audit call (does not prove rollback)
Task 2: fix round 1/5 (1 addressed, 0 open — prices audit moved inside setFunnelPrices tx; commits d3de8be..c85c98c)
Task 2: complete (commits 42f3108..c85c98c, review clean after 1 fix round; core-api 356/37 files)
Task 3: ⚠️ resolved: audit() accepts user actor (actorOf passes objects through; local-login audit test green); makeApp forwards deps.admin (local-login test green)
Task 3: minor (deferred): failed-CSRF write still touches session before check; readCookie takes first ikf_admin (sibling-subdomain cookie shadowing, consider __Host- later); unknown role → 500 (USER_GRANTS[role] ?? []); duplicate sha256 in auth.js vs sessions.js + repeated authenticate preamble; CSRF test lacks DELETE and editor→admin-only route cases; clientIp trusts cf-connecting-ip (local route only)
Task 3: complete (commits c85c98c..4e47dbe, review clean; core-api 371/38 files)
Task 4: minor (deferred): safeReturn allows non-ASCII → 500 ERR_INVALID_CHAR on final redirect after session created (restrict to printable ASCII); "expired attempt" test fails on HMAC not on expiry (add readAttempt unit test); exchange non-JSON / no id_token untested; dead `extra` param in fail(); CORS Vary: Origin only on match and overwrites existing Vary
Task 4: complete (commits 4e47dbe..36e528f, review clean; core-api 386/39 files)
Task 5: ⚠️ resolved: lint_report holds {code, message, line?} only (Task 6 design, no source snippets); audit details verified secret-free in Task 2 review
Task 5: minor (deferred): `_` in action filter is a LIKE wildcard; next_before non-null on exact last page; listDomains inner JOIN host_revs drops domains without host_revs; GET /v1/funnels/:slug 400 for slugs outside creation pattern; test gaps (409 leaves no audit row, before invalid, empty catalog)
Task 5: complete (commits 36e528f..cc3399f, review clean; core-api 392/40 files)
Task 6: Ruling: quadratic worst case in lint (TAG/SCRIPT_BLOCK regex scan to EOF per unclosed start, email loop lastIndexOf/slice per match) is plan-mandated but lint runs on core-api's event loop for every upload — fix with linear scanning + timing test; corpus numbers and scenario tests must stay identical — cost if wrong: an hour of rework in one package.
Task 6: minor (deferred): link href findings use image/video message; HTML comments not stripped; underAny case-sensitive (fails safe); no tests for module script / protocol-relative / link href
Task 6: fix round 1/5 (1 addressed, 0 open — linear scans + pathological test; commits f14c15a..6bd1c79)
Task 6: complete (commits cc3399f..6bd1c79, review clean after 1 fix round; funnel-lint 31 tests, corpus unchanged)
Task 7: Ruling: publish lint check (409 version_lint_failed) cannot fire on rows uploaded before this change (no `errors` key) — platform is pre-release, no production versions exist, so no backfill/re-lint; the check applies from migration 005 onward and Task 15's runbook must say so — cost if wrong: one stale pre-release version with a lint error could be published.
Task 7: minor (deferred): CLI lints without mediaOrigins (media-library scripts refused locally but accepted by server); upload response omits warnings so CLI never shows no_get_app_hook; formatApiError drops detail.warnings; validateBundle 413 bundle_too_large now unreachable from upload route
Task 7: complete (commits 6bd1c79..0886892, review clean; core-api 399/41, cli 121/12)
Task 8: minor (deferred): two admins can disable/demote each other leaving zero admins (only self-lockout blocked); whitespace-only email → invalid_email with empty detail; coverage gap PUT name-only for non-self
Task 8: complete (commits 0886892..d508e86, review clean; core-api 403/42)
Task 9: ⚠️ resolved: admin_users.email stored lowercase (Task 8 createUser + 005 constraint); `log` exists in server.js (used by sibling loops, node --check clean)
Task 9: minor (deferred): stopSessionSweep doesn't await an in-flight tick; interval test timing-sensitive (20/10/60 ms); disable command tests stub api via io
Task 9: complete (commits d508e86..5775e67, review clean; core-api 405/43, cli 129/13)
Task 10: ⚠️ resolved: root package.json workspaces includes apps/* (grep confirmed)
Task 10: minor (deferred): Login.jsx navigates to unvalidated ?return= (client-side open redirect; server safeReturn blocks the OAuth side) — candidate for final fix wave; write retried after CSRF refresh bypasses onUnauthorized on 401; no test for retry-then-403; loading flash on /login; no cancellation on me() probe
Task 10: complete (commits 5775e67..b52c912, review clean; SPA 15/3, core-api 406/43, vite build OK)
Task 11: ⚠️ resolved: styles.css from Task 10 already defines .drop/.badge/.findings/.qr/.card (grep); client pre-check uses configFunnel/byteLength/MAX_BYTES only by plan design, full lint on server
Task 11: minor (deferred): FunnelSettings remount on key change wipes "Đã lưu" message; file input value never reset (re-pick same file no change event); 422 detail assumed arrays, file.text() not try/catch, finding keys may collide; Qr promise no catch; list error + "Đang tải…" shown together; detail reload error hidden; slug not encodeURIComponent in list link
Task 11: complete (commits b52c912..06bf821, review clean; SPA 23/4)
Task 12: minor (deferred): PublishDialog uses stale listDomains on 409 funnel_change_requires_confirmation (checkbox never appears, must reopen); "Publish lần đầu tại /" text before domains load / no active hosts; publishing already-live version shows vN → vN; notice never clears; rollback KV-pending text omits target; version_lint_failed detail codes not shown; rollback reload not asserted
Task 12: complete (commits 06bf821..335ed9b, review clean; SPA 29/5, core-api 407/43)
Task 13: ⚠️ resolved: RoleButton need=admin greys for editor/viewer (Task 10 role.test); server lowercases emails (Task 8); ErrorNote renders codes generically (same as other pages)
Task 13: minor (deferred): Audit stale-cursor race on filter change + out-of-order responses + double-click duplicate pages; old rows stay on failed reload; details(d) throws on null; ?target= read only on mount; no empty states on Domains/Audit/Users; Domains notice never clears; own-row check case-sensitive; test gaps (Sync as editor/viewer, cannot_lock_self/user_exists messages)
Task 13: complete (commits 335ed9b..38032a0, review clean; SPA 35/6)
Note: live demo:purchase (PID 3312) stopped by controller before Task 14; ports 8080/8787/8788/8790/8791 free; compose containers kept.
Task 14: minor (deferred): `playwright` imported by demo e2e but only declared in @ikf/sdk (hoisting), README lacks `npx playwright install chromium` — candidate for final fix wave; e2e builds into shared ADMIN_BUILD_DIR; viewer 403 asserts status only; ikf_admin_test never reset; SPA fallback keyed on "no extension"; startup banner prints admin email (console, plan-mandated); partial RED
Task 14: complete (commits 38032a0..298e700, review clean; demo:test 109/19, e2e 5.6 s)
Task 15: ⚠️ resolved: smoke marker <div id="root"></div> present in apps/admin/index.html (grep); route-before-Worker order is documented in runbook §4 (apply twice) — unverifiable without a real Cloudflare account
Task 15: minor (deferred): admin.yml pre-check builds "$API_ORIGIN/v1/auth/me" without stripping a trailing slash (misleading failure); pre-check/smoke curl have no --max-time and job no timeout-minutes; _headers lacks CSP + explicit Cache-Control for index.html — candidates for final fix wave; workers route created before the Worker exists (first apply may need the runbook's two-step); runbook §4 step order cosmetic
Task 15: complete (commits 298e700..c5c9419, review clean; tf edge 11/core-service 6/stack 12, SPA 41/7, actionlint clean)
Task 16: complete (verification only at c5c9419: core-api 407/43, cli 129/13, funnel-lint 31/2, admin 41/7, demo:test 109/19, sdk 159 (8154 B gzip), edge-router 106, event-schema 145, paddle 31, route-match 35, event-consumer 8+27; tf edge 11/core-service 6/stack 12, validate staging+prod OK, actionlint clean; ports free; tree clean)
Note: Task 16 agent observed another session's `npm run demo:test` in /Users/daothinh/ikf-platform-demo on the same fixed ports during its rerun (outside this plan; both runs passed).
Final review: dispatched on opus over d47ebdf..c5c9419 (package review-d47ebdf..c5c9419.diff)
Final review (opus): verdict "mergeable after fixes". C1 demo tunnel exposes local admin sign-in via cookie path (proxy only blocks Authorization); I2 validateBundle CSS_URL/IMG_BLOCK regexes backtrack (350 s on 1 MB hostile upload) defeating the T6 ruling; I3 UploadBox input value never reset (re-pick same file ignored); I4 cookie shadowing from same-site preview pages → rename to __Host-ikf_admin. Minors to fix before merge per triage: safeReturn ASCII-only; Login ?return= guard; playwright devDependency + README install line; admin.yml trailing slash/--max-time/timeout-minutes; runbook line on zero-admin recovery. All other deferred minors: defer (triaged). Rulings T2/T6/T7/corpus/tunnel-stop: reviewer agrees.
Ruling: fix wave scope = C1 + I2 + I3 + I4 + the five cheap minors above; everything else stays deferred — cost if wrong: a second round after re-review.
Ruling: for C1, both layers — proxy refuses /v1/auth/*, /v1/admin/* and any request carrying an ikf_admin/__Host-ikf_admin cookie; and with --tunnel the admin console is off unless --admin-user is passed explicitly (SPA stays local on 8792 → localhost API, never via tunnel) — cost if wrong: demo:purchase users lose the console unless they pass the flag.
Fix wave: dispatched (opus), FIX_BASE c5c9419
Final fix wave: done (commits c5c9419..e1b92cf: 483753b C1 proxy+options, 2da88ac I2 linear validateBundle, c6f0f2f I3 input reset, 13c8508 I4 __Host- cookie + m1 + m2, e1b92cf m3 + m4 + m5). Totals: core-api 408, SPA 44, funnel-lint 31, demo:test 113 (admin e2e green with __Host- cookie on http localhost), actionlint clean, ports free, tree clean.
Ruling: fixer also replaced the CONFIG_FUNNEL regex in validate.js with the linear scanner (same results) and left the --admin-user default on in `--host` purchase mode (no tunnel; proxy 403 still covers) — accepted; cost if wrong: none observable.
Scoped re-review: dispatched (opus) over c5c9419..e1b92cf
Scoped re-review (opus): all 9 findings ADDRESSED; fix diff: no Important; minors: I-1 proxy path rule tested on raw req.url (find-my-way decodes %61uth) — bypass only creates an unusable session when --tunnel --admin-user x; I-2 url( ) degenerate input now passes (matches lint); I-3 timing test omits CONFIG={ input. Out of scope: Safari + Secure cookie on http localhost unverified.
Ruling: park I-1/I-2/I-3 (no second fix wave; I-1 is demo tooling, attacker cannot use the session through the tunnel) — listed in PR Pending — cost if wrong: audit noise/session rows in a demo run with an explicit --admin-user over a public tunnel.
Branch complete at e1b92cf. Next: push, PR #6 (base feat/demo-purchase), archive ledger + reviews into ikame/ifunnel/docs/reviews, delete workspace.
```

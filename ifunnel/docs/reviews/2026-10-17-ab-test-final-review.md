# Final whole-branch review: A/B test (feat/ab-test, b04987a..0e891a1)

Read-only review. No files were changed except this report.

## Verdict: Ready with fixes

The seams hold, the hand-resolved rebase spots are correct, and the SDK is unchanged. Two Important items must be fixed before the PR: one edge test is flaky, and nothing tests the experiments cascade through `removeDomain`.

## Test results

Env: `DOCKER_HOST=colima`, `TESTCONTAINERS_RYUK_DISABLED=true`, `TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE`.

| Suite | Result |
|---|---|
| `npm test -w @ikf/core-api` | 93 files, **1024 passed** |
| `npm test -w @ikf/edge-router` | 9 files, 135 tests. **Flaky**: the first run had 1 failure. Over 11 reruns, `experiment.test.js > edge fetch with arms > no cookie: some arm is served…` failed 5 times (see I1). |
| `npm test -w @ikf/admin` | 31 files, **316 passed**. `npm run build -w @ikf/admin` passes (only the usual react-router "use client" warning). |
| `npm test -w @ikf/cli` | 26 files, **298 passed** |
| `npm run demo:test` | 30 files, **150 passed** (includes `ab-e2e`, `domains-e2e`, `account-e2e`, `capi-e2e`) |
| SDK bundle | `git diff b04987a..HEAD -- packages/sdk workers/event-consumer` is empty. `injectIkf` destructures only `funnel, v, rev, country, pixel, preview`, so `exp`/`arm` never reach `__IKF`. Demo build: `ikf sdk 00fafbb5699c: 8183 bytes gzip`. |

## Rebase conflict spots (checked)

- `services/core-api/test/migrate.test.js`: lists 012 then 013, and the table list has `experiment_arms` and `experiments` in sorted order. OK.
- `apps/admin/src/components/ErrorNote.jsx`: the custom-domains strings are kept, the experiment functions are added, and `errorText` falls through when a function answers null. OK, but see M2 on the wording.
- `apps/admin/src/pages/Domains.jsx`: the Gỡ, Sync and assign buttons and the dialog state are kept. The A/B button shows only on `status === 'active'`, so pending custom hosts get no button. OK, apart from the parked M1.
- `packages/cli/src/main.js`: `domain add/check/rm` usage and `customDomainCommand` are kept, `ab` is added, and the `ab` command dispatch is in place. OK.
- `CLAUDE.md` and `demo/README.md`: both sides are kept, ports are unique (ab 8977/8278/8979/8978/8981/8982, db `ikf_ab_test`). OK.

## Seams

- **Core KV ↔ edge.** `syncHost` adds `exp` and `arms[{arm,funnel,v,bundle,pixel,weight}]` (arm 0 first) only while the experiment runs. `pickArm` reads that exact shape. The route's own `funnel/v/bundle` stay arm 0's, so old Workers are unaffected. Pixel changes on a challenger re-project the host (`setFunnelPixel` UNION, tested).
- **Core HTTP ↔ SPA/CLI.** Bodies and fields match: `cr` is a fraction, `confidence` is a % with one decimal or null, `rpv.amount_minor_per_visitor`, `also_live_at`, `analytics`, `kv_sync`. The stop body is `{winner_arm}`. Start and stop are not retried in the CLI.
- **Stats ↔ formatting.** CR is rendered `×100, 2dp`. Confidence shows "—" for arm 0 and "Chưa đủ dữ liệu" when null. When analytics is unavailable, visitors, CR and rpv show "—" and purchases and revenue stay. Revenue per visitor loses precision (M3).

## Custom domains interaction

- `removeDomain` refuses any host with routes (`domain_has_routes`), and `removeRoute` refuses while an experiment runs (`experiment_running`). So only stopped experiments can be cascaded. Lock order: domains row FOR UPDATE, then `DELETE domains` cascades to experiments and arms. This is the same first lock as start and stop, so there is no cycle. **No test goes through `removeDomain`**: the only cascade test (`experiments.test.js:294`) does a raw `DELETE FROM domains`. See I2.
- Pending hosts: `inHostTx` refuses `pending` for both start and stop. An active host never goes back to pending (`applyCheck`: `moved` keeps it active), so a running experiment can never be stuck unstoppable.
- Disabled hosts: start is refused. Stop is allowed for winner 0, and a challenger winner gets `409 domain_disabled`. This matches decision 4.
- `setDomain` app assignment checks only the funnels in routes. That is enough, because every arm shares arm 0's app and app changes of arm funnels are blocked (`funnel_in_experiment`).
- Turnstile: the feature does not touch the widget sync. No interaction.

## Security

- Cookie `ikfx_<id>`: the value is validated (`^(0|[1-9]\d?)$` and must be an arm of the route). The cookie is `Secure; HttpOnly; SameSite=Lax`. `Path` is the validated prefix. Randomness is unbiased (`crypto.getRandomValues` with rejection sampling). The preview host never splits.
- Scope: GET of an out-of-scope experiment returns the same `experiment_not_found` 404 (`appOfExperiment`). Start uses `appOfRoute` in a preHandler and re-checks `allowed()` under the host lock. Stop re-checks the winner's funnel app. The list is filtered to `visibleApps`. `?app=` out of scope returns `app_not_found`.
- Logs: the stats warning carries only `experiment_id`, `kind` and `status`. No PII. ClickHouse values are bound parameters. The `LIMIT` is a sanitised number.
- The experiment name is free text, rendered as React text (safe). The CLI prints it raw (M5).

## Concurrency (lock order)

| Path | Order |
|---|---|
| setRoute / rollback / removeRoute | domains row, then `noExperiment` read, then funnels FOR SHARE |
| startExperiment | domains row, then experiments read, then funnels FOR SHARE OF f, then INSERT (unique index backstop gives 409) |
| stopExperiment | domains row (allowDisabled), then experiments row FOR UPDATE, then winner's funnel FOR SHARE, then routes |
| setFunnelApp | `lockFunnelDomains` (route hosts ∪ running-experiment hosts, asc), then funnels, then `assignFunnelApp` reads experiments (409) |
| setFunnelPixel | domains (route ∪ experiment hosts), then funnels UPDATE, then re-read hosts |
| setDomain | domains row, then funnels FOR SHARE |
| removeDomain | domains row, then cascade experiments/arms |

Nothing takes a domains lock after a funnels or experiments lock, so there is no cycle. The start-vs-app-change race is resolved by the funnel row (re-review traced it, and the I1 tests cover it). `test/lock-order.test.js` has no experiment pair (M6, optional).

## Stats correctness

- The window is `[started_at, ended_at|now)`, both sides the same for ClickHouse and Postgres. The visitors query pairs funnel and v positionally (`arrayZip`) after an `IN` prefilter.
- Purchases are completed checkouts whose `client_url` host matches (scheme, port and path stripped, lower-cased) and whose `(slug, v)` is an arm. Revenue is the first paid transaction per checkout, per currency.
- The z-test is pooled and two-sided. The Φ approximation (A&S 7.1.26) is accurate enough for 1 decimal. Thresholds: n < 100 on either arm, or c0 + c1 < 5, gives null. These match decision 6.
- Edge case: if purchases > visitors (checkouts without events, e.g. ad blockers), `cr > 1` and pooled > 1 make `se` NaN, so p = 1 and confidence shows 0.0% instead of "Chưa đủ dữ liệu". This is rare and only a Minor (M4).

## Findings

| # | Sev | file:line | Problem | Concrete fix |
|---|---|---|---|---|
| I1 | Important | workers/edge-router/test/experiment.test.js:79-86 (fixture :7-14, beforeEach :61-64) | Flaky (~36%, 5 of 11 reruns failed). The fixture has 3 arms (arm 2 → `bundles/c/v3/index.html`, weight 20), but `beforeEach` never puts that bundle and the regex allows only `[01]`. When arm 2 is drawn, the GET is a 502 and/or the HEAD has no Set-Cookie. CI would fail at random. | In `beforeEach`, `env.BUNDLES.put('bundles/c/v3/index.html', page('C3'))`, and widen both regexes to `[012]`. Better still, make the test deterministic: send the request with a cookie for an unknown arm (`ikfx_42=7`) and assert a re-pick, or stub through the `random` seam if one is exposed. Rerun `npm test -w @ikf/edge-router` 20× to confirm. |
| I2 | Important | services/core-api/test/experiments.test.js:294-303 (raw DELETE); src/domains/custom.js:182 | The ON DELETE CASCADE is exercised only by a raw `DELETE FROM domains`. No test goes through `removeDomain`, the only production path (the controller required one after the rebase, per re-review-fix1). | Add a test, in `domains-custom.test.js` or `experiments.test.js`, on an **active custom host** (addDomain + check to active, fake saas): publish, start an experiment, `removeDomain` → `409 domain_has_routes`; `removeRoute` → `409 experiment_running`; stop (winner 0), removeRoute, `removeDomain` succeeds → `experiments` and `experiment_arms` are empty for the host, the audit has `experiment.start`, `experiment.stop` and `domain.remove`, and the KV key is deleted. |
| M1 | Minor (parked T5) | apps/admin/src/pages/Domains.jsx:241 | On a shared host (`app_id` null) the A/B button needs an admin grant in all apps. An admin of only the funnel's app sees it disabled, although core would allow it. | Gate with the route funnel's app. `GET /v1/domains` routes carry no app, so either leave the button enabled for anyone with admin in some app (`appId="any"`-style check) and let StartExperiment's app lookup plus the 403 decide, or add `app_id` to the route rows in the listing. **Do in the fix wave.** |
| M2 | Minor | apps/admin/src/components/ErrorNote.jsx:22, :32 | The map is global, but `domain_disabled` now says "…trước khi chọn bản thắng khác bản gốc" for every caller (publish, rollback, A/B start on a disabled host). `route_not_found` says "publish một bản trước" also for rollback/delete. | Use neutral wording: `domain_disabled` → "Domain đang tắt (disabled): bật lại trước." and `route_not_found` → "Chưa có route ở host/prefix này." (or return null unless `e.detail` has the start shape). The CLI already scopes these with `cmd === 'ab'`. |
| M3 | Minor (parked T5) | apps/admin/src/pages/ExperimentDetail.jsx:14; packages/cli/src/main.js:592 (+ `money` :704); services/core-api/src/experiments/stats.js:133 | rpv goes through 2-decimal major-unit money: 12.34 minor/visitor shows as 0.12, and values under 0.5 minor show 0.00. | Format rpv with 4 decimals of the major unit (e.g. `(minor/100).toFixed(4)`, zero-decimal currencies 2dp) in both SPA and CLI. Core may keep `round(…, 2)` (minor units). **Do in the fix wave.** |
| M4 | Minor | services/core-api/src/experiments/stats.js:31-36, :41 | With purchases > visitors (checkouts without events), `pooled > 1` makes `se` NaN, p = 1 and confidence 0.0%. That reads as "no difference" instead of "no data". | In `confidence`, return null when `c0 > n0 || c1 > n1`, and add one unit test. |
| M5 | Minor | services/core-api/src/http/experiments.js:17 | `name` allows control characters. The CLI prints names raw (`ab ls`/`show`), so ANSI escape injection reaches the terminal of whoever lists. | Schema pattern `^[^\\u0000-\\u001f\\u007f]*\\S[^\\u0000-\\u001f\\u007f]*$` (or strip on output in the CLI), plus one 400 test. |
| M6 | Minor (parked T5) | apps/admin/src/useExperiments.js:10-21 | The `live` flag lives in `reload` and is set false only in `finally`. The effect has no cleanup, so after an app switch a slow earlier response overwrites the map (wrong or missing A/B badges, and the Rollback/A/B buttons follow). | Use `useLatest` (as ExperimentDetail does), or return a cleanup from the effect that sets `cancelled = true`. **Do in the fix wave.** |
| M7 | Minor (parked T5) | apps/admin/src/pages/FunnelDetail.jsx (publish/delete actions) | Only Rollback is disabled while a test runs. Publish and delete return 409 (now a clear sentence). | Optional: disable them with the same title. Can be deferred. |
| M8 | Minor (parked T5) | apps/admin/src/components/StartExperiment.jsx:78, StopExperiment.jsx:27 | The dialogs have no focus move, Escape or trap. The existing console dialogs are the same. | Defer to a console-wide dialog change. |
| M9 | Minor | services/core-api/test/lock-order.test.js | It has no experiment pair (start or stop vs setFunnelApp/setFunnelPixel). The order is correct by reading, and the I1 block test covers one direction. | Optional: add `startExperiment` vs `setFunnelApp` on the challenger funnel to the gated two-connection harness. Can be deferred. |

Counts: **0 Critical, 2 Important, 9 Minor.**

## Fix wave brief

One implementer, one commit (`fix(ab): final review fixes`), then rerun the suites below.

1. **I1** edge flaky test: add the `c/v3` bundle in `beforeEach`, widen the `[01]` regexes to `[012]` (or make the test deterministic). Run `npm test -w @ikf/edge-router` 20 times in a loop; all must be green.
2. **I2** `removeDomain` cascade test on an active custom host, through the real functions (start → removeDomain 409 domain_has_routes → removeRoute 409 experiment_running → stop → removeRoute → removeDomain OK → experiments and arms gone, audit kept, KV key deleted). Keep or replace the raw-DELETE test.
3. **M1** Domains A/B button on shared hosts: don't require an all-apps admin. Enable for an admin in some app and let the form's app lookup and the server's 403 decide (or carry the route's app). Add an SPA test: an admin of only app X on a shared host can open the form for a funnel of X.
4. **M2** ErrorNote neutral wording for `domain_disabled` and `route_not_found`, and update the SPA tests that assert them.
5. **M3** rpv shown with 4 decimals (SPA `perVisitor`, CLI `rpvText`), with tests for a value under one minor unit.
6. **M4** `confidence` → null when purchases exceed visitors on either arm, plus a unit test.
7. **M5** reject control characters in `name` (schema), plus a 400 test.
8. **M6** `useRunningExperiments`: stale-response guard (useLatest or effect cleanup), plus a test that switches app with a delayed first response.

Deferred (note in the PR): M7 (disable publish/delete while running), M8 (dialog focus handling, console-wide), M9 (lock-order harness pair).

Verify after the wave: core-api, edge-router (×20), admin (+ build), cli, and `npm run demo:test` (ab-e2e and domains-e2e must stay green).

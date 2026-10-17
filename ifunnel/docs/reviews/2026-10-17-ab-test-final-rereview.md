# Final re-review: A/B test fix wave (0e891a1..7749c1b)

Read-only scoped review. Re-ran `npm test -w @ikf/edge-router` (9 files, 135 passed) and `npm test -w @ikf/admin` (31 files, 323 passed). Demo tests not run, as instructed.

## Verdict: Approved

No Critical, no Important remaining.

## Items

| Item | Result |
|---|---|
| I1 edge flaky test | Fixed. `c/v3` bundle is stored in `beforeEach`; the test loops 30 GET+HEAD pairs and checks cookie arm in `[012]`, matching `x-ikf`, matching body, HEAD 200 with cookie. A missing arm now fails every run, not randomly. |
| I2 removeDomain cascade | Fixed. Real functions on an active custom host: removeDomain 409 `domain_has_routes`, removeRoute 409 `experiment_running`, stop, removeRoute, removeDomain; domain, experiments, arms and KV key are gone; audit order start, stop, remove. |
| M1 shared-host button | Fixed. `canAny` (canAll or a grant in some app) with `appId="any"` only when `d.app_id` is null; hosts with an app keep the exact per-app check. StartExperiment adds `mayStart` (canIn on the live funnel's app) and disables Bắt đầu with a `need-admin` note. The server is untouched: start still uses the `appOfRoute` preHandler plus the re-check under the host lock, so a 403 still decides. SPA tests cover admin of the funnel's app, admin of another app, and no admin. |
| M2 neutral wording | Fixed. `domain_disabled` and `route_not_found` are neutral in the SPA map, safe for publish, rollback, delete and A/B start. The CLI keeps its specific text only under `cmd === 'ab'`. Test asserts both strings. |
| M3 rpv decimals | Fixed in SPA (`fmtPerVisitor`) and CLI (`perVisitorMoney`): 4 decimals of the major unit, 2 for zero-decimal currencies. Tests cover values below one minor unit. |
| M4 confidence | Fixed. Null when `c0 > n0` or `c1 > n1`; unit test includes the boundary (equal gives 0). |
| M5 name control chars | Fixed. `allOf` with `\S` and `^[^\x00-\x1f\x7f]*$`; ESC, newline and DEL give 400; a Unicode name is still accepted. |
| M6 stale badges | Fixed. `useLatest` guard in `useRunningExperiments`; stale-app test (h) uses a delayed first response. |

## Regressions

None found. Core runtime change is limited to `stats.js` and the `name` schema. M7 to M9 remain deferred (PR note).

## Minor notes (no action required)

- A user admin only in another app now sees an enabled A/B button on a shared host; the form blocks submit and the server would 403. This is the intended M1 trade-off.

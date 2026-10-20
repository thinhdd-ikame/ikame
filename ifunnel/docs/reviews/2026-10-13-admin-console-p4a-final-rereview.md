# Admin console đợt 4a — fix wave report and re-review outcome

Re-review of the fix wave (ddd171a..9caa051): findings 1–8 and 3a–3g ADDRESSED. New breakage: an unrequested `FOR SHARE OF f` lock in setRoute deadlocked with setFunnelPixel (Important) — reverted by ruling in 2af9add; Domains `assigning` could stick after a same-app sync (Minor) — fixed in 2af9add with a test. Parked for 4b: setDomain vs funnel-move write skew; publish vs move; useLatest has no unmount bump.

---

# Final-review fix wave: admin console đợt 4a (base ddd171a)

Status: DONE_WITH_CONCERNS. All 8 findings are fixed. The concerns are minor and listed at the end.

Commits on `feat/admin-console-p4a` (not pushed):
- `3cf43f4` fix(core-api): refuse moving a live funnel off its app's domain; prices audit carries app_id; detail shapes; 007 backfill split
- `5e82c2f` fix(cli): messages for funnel_live_on_app_domain and domain_app_mismatch; app_not_found names the typed id
- `719abb7` fix(admin): only the newest answer renders when the app changes; per-app state resets; live-route error on app change
- `9caa051` docs: funnel_live_on_app_domain in CLAUDE.md and runbook §13

## Important

### 1. A funnel moved to another app while live on the old app's domain
- Server, `services/core-api/src/identity/apps.js:198-210`: `assignFunnelApp`, the helper shared by `PUT /v1/funnels/:slug` and the first-upload assignment, now runs a query before the UPDATE. It looks for routes of the funnel on hosts where `domains.app_id IS NOT NULL AND <> new`. If any exist, it answers `409 funnel_live_on_app_domain {routes:[{host,prefix}]}`, sorted by host and prefix. Shared hosts do not count, so the upload path (plan A5) still passes.
- Race, `services/core-api/src/publisher/routes.js:59-66`: `setRoute` reads the funnel row `FOR SHARE OF f`. Both app-change paths lock the funnel row (`FOR NO KEY UPDATE` or `FOR UPDATE`), so a publish and a move now run one after the other. Without this lock, a concurrent publish could pass the check by reading the funnel's old app.
- SPA, `apps/admin/src/components/FunnelSettings.jsx:10-12, 57-62`: shows "Funnel đang chạy trên domain của app khác: host/prefix, …. Gỡ route trước khi đổi app."
- CLI, `packages/cli/src/main.js:516-523`: lists each `host+prefix`, then the hint `ikf route rm <host><prefix>`.
- Docs: a CLAUDE.md convention line, plus runbook `docs/runbooks/admin-console.md` §13 step 2.
- Tests:
  - core-api `test/routes-app.test.js`, two cases:
    - "a funnel live on its app's domain cannot move…": the move is refused with routes sorted; the app is unchanged; there is no funnel.app audit row; the move is allowed after `DELETE` of both routes.
    - "…live only on shared hosts moves freely; an unassigned one too".
  - The upload path stays covered by the existing `funnels-app.test.js` case "uploading with app_id onto an unassigned funnel assigns it".
  - SPA `test/stale-app.test.jsx` "FunnelSettings… 409 funnel_live_on_app_domain".
  - CLI `test/errors-app.test.js` "funnel set --app while live…".
- RED: the core-api move test failed (status 200 ≠ 409). The SPA test failed (`'Lỗi 409 funnel_live_on_app_domain'` ≠ the sentence). The CLI test failed (raw JSON). GREEN: all pass.

### 2. The `funnel.prices` audit row had no app_id
- `services/core-api/src/billing/prices.js:12-20`: new `funnelRow` returns `{id, app_id}`. Line 88 reads it, and line 124 passes `{ app_id: appId }` to `audit`.
- Test: `test/funnel-app.test.js` "prices: the funnel.prices audit row carries the funnel's app (final review #2)".
- RED: `[{app_id:null}]` ≠ `[{app_id:'starlyn'}]`. GREEN: passes.

### 3. Stale responses when switching apps (SPA)
One helper is used everywhere: `apps/admin/src/useLatest.js`. `begin()` returns `isLatest()`, and only the newest request may set state.

- **a.** `app-context.jsx:39-52` `useApp`: `getApp` is guarded, and so is `reload` after a rotate or save.
- **b.** `pages/Domains.jsx`
  - `load` is guarded (lines 41-49).
  - On an app change, the effect clears `domains`, `error`, `notice` and `assigning` (lines 50-57).
  - `assign` runs one at a time: `assigning` disables the select, "Bỏ gán" and "Gán vào app" (lines 73-91, 123, 141, 149). An answer that arrives after an app switch is dropped.
  - A 409 `domain_has_foreign_routes` renders only `ForeignRoutes`, which now has `role="alert"` (lines 12, 173).
- **c.** `pages/CustomerDetail.jsx:111-129`: the lookup is guarded. `c`, `error`, `notice` and `dialog` reset when `ref` or `appId` changes.
- **d.** `pages/AppPlans.jsx:16-23`: guarded, and reset when the app id changes.
- **e.** `pages/Audit.jsx:27-73, 115`
  - The list-on-screen token is `shown`. `fetchPage` takes that token, so "Tải thêm" appends only to the same app and filter.
  - `items`, `next`, `error` and `loadingMore` reset on a filter or app change.
  - `?target=` is read on every URL change, not only once.
  - "Tải thêm" is disabled while loading.
- **f.** `pages/Funnels.jsx:29-51, 75`
  - The list effect now uses `useLatest`; the old `live` flag is gone, so the pattern is the same everywhere.
  - `slug`, `pick` and `error` reset when `appId` changes.
  - The filter goes through `pickFilter`, which edits only `?app=` and keeps `?new=1`.
- **g.** `pages/Customers.jsx:38-61`: on an app change it calls `begin()`, which drops a search still in flight, and resets `found`, `hint`, `error` and `busy`. The old ad-hoc `latest` ref was replaced by `useLatest`.

Tests, all new in `apps/admin/test/stale-app.test.jsx`. Out-of-order tests use deferred fakes and navigate inside one MemoryRouter, so the page stays mounted.
- a: an older getApp(starlyn) resolves after tarot-web, and Tarot Web is shown.
- b: an older list is dropped, and the alert is cleared on the switch.
- c: two cases. An older customer ref resolves last and the newer one is shown. When the app changes, the previous customer is cleared while the new one loads.
- d: AppPlans out-of-order.
- e: two cases.
  - Out-of-order list: a "Tải thêm" for starlyn resolves after the switch to tarot-web and does not append.
  - A new `?target=` in the URL reloads the list.
- f: two cases. The slug and error reset. The filter keeps `?new=1` (checked in the URL).
- g: results and hint reset.
- Domains: two cases. Controls are disabled while `setDomain` is pending. A 409 shows one alert only.

`test/domains.test.jsx` (2 assertions): updated to the one-message rule. The alert is now the route list, and there is no "Lỗi 409" line.

RED: 12 of 13 failed before the fix. Saved in the scratchpad as `spa-red.log`. The `?new=1` test passed at first because it only checked focus. I rewrote it to check the URL, and then it failed with `null ≠ '1'`. GREEN: all pass.

## Minor

### 4. Migration 007
- `services/core-api/migrations/007_apps_container.sql`: the OR UPDATE is split into two equality UPDATEs (`target = 'funnel:'||slug`, and `details->>'slug' = slug`). Both keep `a.app_id IS NULL`, so they stay idempotent, and the comments contain no `;`.
- `src/db/migrate.js` runs each file inside BEGIN/COMMIT, so I added `SET LOCAL lock_timeout = '5s'` at line 5.
- Test: `test/apps-container.test.js` now expects 4 backfill statements instead of 3. The idempotency case and the other 007 cases pass, and so does `migrate.test.js`.

### 5. Error detail shapes
- `app_not_found` is now `{app_id}` everywhere:
  - `http/apps.js:84`
  - `identity/app-summary.js:10`
  - `identity/apps.js:133` (rotate-key)
  - `identity/apps.js:161` (update)
- `POST /v1/funnels` `app_required` now sends `{funnel: slug}` (`http/catalog.js:39`).
- Tests updated:
  - `apps-read.test.js` (3 assertions) and `apps-p2.test.js`.
  - `funnels-app.test.js`, POST case.
  - `apps.test.js`, which now also asserts the rotate-key 404 body.
  - RED: 7 failed. GREEN: all pass.
- SPA test fakes now use `{app_id}`: `test/helpers.jsx`, `test/apps-fixtures.js`, `test/app-overview.test.jsx`.
- The CLI reader now uses `app_id`, then the typed id (see #8). The `id` fallback is removed.

### 6. CLI `domain_app_mismatch`
- `packages/cli/src/main.js:524-528`: prints "Domain thuộc app X, funnel thuộc app Y|chưa gán. Chỉ publish lên domain của app đó hoặc domain dùng chung (ikf domain ls --app <id>)."
- Tests: `test/errors-app.test.js`, both the assigned and the unassigned case. RED: raw JSON was printed. GREEN: passes.

### 7. Stale comment
- `identity/apps.js:183-184`: "(null = none)" is replaced with "never null: the handler answers app_required, decision #5".

### 8. CLI `app_not_found` without detail
- `main.js:506-515, 618, 661, 703`: `typedApp` is `--app`, or the id given to `ikf app …`. `formatApiError(e, cmd, typedApp)` falls back to it, and to "Không có app này" when there is none.
- Tests: `test/errors-app.test.js` for `app show ghost` and `funnel create --app phantom`. RED: printed "undefined". GREEN: passes.

## Final full runs (at HEAD 9caa051)
- core-api `npm test -w @ikf/core-api`: `Test Files 67 passed (67)` / `Tests 616 passed (616)`. No hook timeouts, so no re-runs were needed. It was also 67/616 after the server commit.
- cli `npm test -w @ikf/cli`: `Test Files 21 passed (21)` / `Tests 207 passed (207)`.
- admin `npm test -w @ikf/admin`: `Test Files 26 passed (26)` / `Tests 210 passed (210)`.
- build `VITE_API_BASE=https://api.example.com npm run build -w @ikf/admin`: built, one CSS file (`index-*.css` 14.75 kB).
- `npm run demo:test`, run alone: `Test Files 23 passed (23)` / `Tests 132 passed (132)`.
  - The other worktree's demo was listening on 8080, 8787, 8790 and 8792. demo:test does not bind those ports (they only appear as Host header strings), so I left that demo alone.

## Concerns / not done
- The `FOR SHARE OF f` lock in `setRoute` is my addition, beyond the finding's text. It makes publish and app-move run one after the other. No test covers the race, because it needs timing that two Testcontainers connections cannot drive reliably. Its side effect: a publish now briefly waits behind a concurrent upload of the same funnel, which holds the row `FOR UPDATE`.
- In Domains, an assign or sync calls `begin()` and so drops a list load still in flight. Every success path reloads afterwards. A failed assign can therefore leave the list from before, which is not stale for that app.
- An Audit `?target=` change keeps the action filter the person picked.
- No new dependencies. `demo/` is unchanged. `.superpowers/` is left unstaged.

## Re-review follow-up (controller ruling)

Commit: `2af9add` fix: revert the setRoute funnel row lock (deadlock with setFunnelPixel); Domains assign survives a same-app reload

1. **Lock reverted.** `services/core-api/src/publisher/routes.js` is back to the unlocked read from ddd171a (`git checkout ddd171a -- …`). The added comment is removed with it. No test had been added for the lock. The deadlock was: `inHostTx` locks `domains`, then waits on the funnel row, while `setFunnelPixel` locks the funnel row, then `domains`. The publish-vs-move race is deferred to đợt 4b. The `funnel_live_on_app_domain` check in `assignFunnelApp` stays.
2. **Domains no longer stuck on `assigning`.**
   - In `apps/admin/src/pages/Domains.jsx`, an assign used to share the list-load token (`begin()`), so a sync's `load()` orphaned it. The assign now captures `sameApp.current`, a second `useLatest` token that is bumped only by the app-change effect.
   - A newer list load in the same app no longer drops the assign answer: it clears `assigning`, shows its notice or error, and reloads the list. Only an answer that arrives after an app switch is dropped.
   - Test: `apps/admin/test/stale-app.test.jsx` "a sync that reloads the list while an assign is pending does not leave the controls disabled (re-review)". RED against the previous Domains.jsx: `expected true to be false` (button still disabled). GREEN after the fix.

Runs:
- focused: `routes-app`, `routes`, `funnel-app`: 3 files / 25 tests. `stale-app` + `domains`: 2 files / 21 tests.
- core-api full: `Test Files 67 passed (67)` / `Tests 616 passed (616)`.
- admin full: `Test Files 26 passed (26)` / `Tests 211 passed (211)`.
- build: OK, one CSS file.
- demo:test: not re-run. No demo test touches setRoute locking or the Domains page.

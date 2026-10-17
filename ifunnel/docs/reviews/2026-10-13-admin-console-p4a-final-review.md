# Final-review fix wave — admin console đợt 4a (base ddd171a)

Fix ALL of the following in this one wave. Each item: what, where, the fix. Keep every existing test's meaning; add the tests named.

## Important

1. **Funnel moved to another app while live on the old app's domain.** `services/core-api/src/identity/apps.js` `setFunnelApp` → `assignFunnelApp` (PUT /v1/funnels/:slug {app_id: Y}) checks no routes. Fix: in the same transaction, before the UPDATE, refuse when the funnel has routes on hosts where `domains.app_id IS NOT NULL AND domains.app_id <> $new` → `409 funnel_live_on_app_domain {routes: [{host, prefix}]}`. The upload path (unassigned funnel assigned on first upload, plan A5) must keep working (an unassigned funnel can only be live on shared hosts, so the check passes there — keep it in the shared helper so both paths are covered). SPA: `apps/admin/src/components/FunnelSettings.jsx` shows the error with the route list (Vietnamese: "Funnel đang chạy trên domain của app khác: <host><prefix>… Gỡ route trước khi đổi app."). CLI: `packages/cli/src/main.js` `formatApiError` gets a message for `funnel_live_on_app_domain` listing the routes. Tests: core-api (move refused while live on an X host; allowed when only on shared hosts; allowed after route delete), SPA (error rendered), CLI (message).
2. **`funnel.prices` audit has no `app_id`.** `services/core-api/src/billing/prices.js` (~line 119, `setFunnelPrices`): select the funnel's `app_id` with its id and pass `{ app_id }` to `audit(...)`. Test: price change → audit row has the funnel's `app_id` (extend an existing prices/audit test or the audit-coverage test).
3. **Stale responses when switching apps (SPA).** Introduce ONE small shared helper (e.g. `apps/admin/src/useLatest.js` exporting a hook that returns a guard/token so only the newest request may set state; or the `ignore` flag in effect cleanup — pick one pattern and use it everywhere below), and reset per-app state when `appId`/`ref` changes:
   a. `apps/admin/src/app-context.jsx` `useApp`: guard the `getApp` response (an older `getApp(a)` must never render under `/apps/b/*`; AppSettings rotate/save and AppWebhooks resend act on the shown app).
   b. `apps/admin/src/pages/Domains.jsx` `load`: guard; clear `error`/`notice` on `appId` change; also add an in-flight guard on assign (disable controls while `setDomain` is pending) and stop rendering both `ErrorNote` and `ForeignRoutes` for the same 409 (show only `ForeignRoutes` for `domain_has_foreign_routes`).
   c. `apps/admin/src/pages/CustomerDetail.jsx`: reset `c`, `error`, `notice` on `ref`/`appId` change; guard the lookup.
   d. `apps/admin/src/pages/AppPlans.jsx`: guard; reset on `appId` change.
   e. `apps/admin/src/pages/Audit.jsx`: guard `load`; "Tải thêm" must not append to a list for a different filter/app (token per filter); reset `items`/`next` on filter/app change; read `target` from the URL on change, not only once.
   f. `apps/admin/src/pages/Funnels.jsx`: reset typed slug / `pick` / `error` on `appId` change (or `key={appId}` on the route element in `App.jsx`); the app filter's `setParams` keeps other params (`?new=1`).
   g. `apps/admin/src/pages/Customers.jsx`: reset `found`, `hint`, `error` on `appId` change.
   Tests: one SPA test per page a–e with out-of-order fake responses (resolve B before A → B shown), plus f/g state reset.

## Minor (do them in this wave)

4. **Migration 007 lock/backfill cost.** `services/core-api/migrations/007_apps_container.sql`: 007 is unreleased, so edit it in place: split the `target = 'funnel:'||slug OR details->>'slug' = slug` UPDATE into two equality UPDATEs (both `WHERE a.app_id IS NULL`), keep idempotency, keep comments free of `;` (the test splits on `;`). Optionally `SET LOCAL lock_timeout = '5s'` at the top (only if `src/db/migrate.js` runs each file in a transaction — check; if not, skip and say so). The 007 tests must still pass.
5. **Error detail shapes.** `app_not_found` detail must be `{app_id}` everywhere (today `{id}` in `services/core-api/src/http/apps.js` and `src/identity/app-summary.js`); `POST /v1/funnels` `app_required` gets `detail: {funnel: slug}` like upload/PUT. Update the tests that assert those shapes, and the CLI/SPA readers (the CLI already reads `app_id ?? id`; keep the fallback harmless or simplify).
6. **CLI `domain_app_mismatch` prints raw JSON** on `ikf route set`: add a message like the SPA's ("Domain thuộc app <host_app>, funnel thuộc app <funnel_app|chưa gán>."). Test.
7. **Stale comment** `setFunnelApp` "(null = none)" in `services/core-api/src/identity/apps.js` — fix.
8. **CLI `app_not_found` without detail prints "undefined"** — fall back to the id the user typed.

## Not in this wave (ruled out)
- Dashboard rows for apps with no activity, audit of a domain/funnel leaving an app, everything else in deferred.md marked fine-to-defer.

## Rules
Commit trailer: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Several commits are fine (e.g. server, CLI, SPA). Run: core-api full, cli full, admin full + build, and `npm run demo:test` once at the end (alone). Do not modify `demo/` unless a demo test needs a shape update; never touch other worktrees; never kill processes/containers you did not start (demo on 8080/8787/8790/8792 from another worktree).

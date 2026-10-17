# Final whole-branch review — admin console đợt 4b (per-app permissions)

Range `2af9add..87090da` (12 commits), worktree `/Users/daothinh/ikf-platform-admin-p4b`. Read-only review, done in passes: core-api auth/scope/resolvers → every HTTP route → publisher lock paths → SPA → CLI → docs. I ran no tests and relied on the stated status at 87090da (core-api 706, cli 243, admin 247, all green). Authority: spec, plan rulings B1–B13, and ledger B14 plus the parked list. Parked items are not raised again unless noted.

## Strengths

- `requireGrant` (auth.js:79-101) is small and has one meaning. Global grants short-circuit first, so tokens without an app keep today's reach exactly. `'any'` uses the default role. Resolver results follow one convention: `undefined` means the handler answers, `null` means default role or global. A GET only 404s when the caller lacks viewer (B7). `req.scope` is reused across onRequest and preHandler.
- B4 holds on every resolver GET. The out-of-scope body equals the missing-resource body for `funnel_not_found {funnel}`, `funnel_not_found` (analytics), `app_not_found {app_id}`, `domain_not_found {host}` and audit `?app=`.
- Lists filter in the handler with the same predicate (`hasGrant(scope,'viewer', id|null)`): apps, funnels (`?app=none` is empty for scoped callers), domains and the shared-host routes inside them, routes on a shared host, and the overview, whose cache key includes the app list.
- B14 runs inside the host transaction, before the confirm-409, so a foreign slug is never named on the write path.
- The lock order is consistent, as described in §3 below.
- `last_global_admin` locks every active global row in id order before it counts. `cannot_lock_self` covers `global:false`.
- Migration 008 is minimal and its backfill is exact.

## 1. Authorization: every route

Notation: `G` = `app:'global'`; `any(g)` = the grant in some app or by the default role; `R(x)` = a resolver.

| Route | Guard | Notes |
|---|---|---|
| GET /v1/auth/me | requireSession | tokens 401; apps = `scope.appIds()` with `roleIn` |
| POST /v1/auth/logout | requireSession | — |
| GET /v1/auth/google(+callback) | public (local or OIDC) | ensureLocalAdmin → global |
| POST /v1/apps | G router | router token without app passes, as before |
| PUT /v1/apps/:id | R(appOfApp) router | |
| GET /v1/apps | any viewer, filtered | |
| GET /v1/apps/:id, /summary | R(appOfApp) viewer, 404 app_not_found | |
| GET /v1/apps/:id/plans | R(appOfApp) prices:read | viewer in app → 403 (B7) |
| POST /v1/apps/:id/rotate-key | R(appOfApp) router | |
| GET /v1/apps/:id/webhooks | R(:id) apps:read, 404 app_not_found | B8 |
| POST /v1/apps/:id/webhooks/:event_id/resend | R(appOfApp) router | `resendDelivery` filters `app_id = :id` ✅ |
| GET /v1/funnels | any viewer, filtered | |
| POST /v1/funnels | any publisher + preHandler R(body.app_id) | |
| GET /v1/funnels/:slug | R(appOfFunnel) viewer, funnel_not_found | see M2 (`live[].previous.slug`) |
| PUT /v1/funnels/:slug | R(appOfFunnel) [router, editor] + handler `hasGrant` on the target app | |
| POST /v1/funnels/:slug/versions | any publisher + preHandler R(funnel app or body.app_id) + handler re-check | see M4 |
| GET /v1/funnels/:slug/prices | R(appOfFunnel) prices:read, funnel_not_found | |
| PUT /v1/funnels/:slug/prices | R(appOfFunnel) router | |
| GET /v1/paddle/prices | any prices:read | no app data |
| GET /v1/domains | any viewer, filtered | |
| PUT /v1/domains/:host | G admin | |
| GET /v1/routes/:host | any viewer + R(appOfHost ?? undefined) viewer, domain_not_found; routes filtered | |
| PUT /v1/routes/:host | any router + preHandler R(body.funnel) + B14 in tx | |
| POST /v1/routes/:host/rollback | any router + preHandler R(appOfRoute) + B14 (cur, to) in tx | |
| DELETE /v1/routes/:host | any router + preHandler R(appOfRoute) + B14 in tx | |
| POST /v1/routes/:host/sync | any router + R(appOfHost) | a shared host needs the default role or global |
| POST /v1/customers/lookup | any support + preHandler R(body.app_id); no app_id → `hasGrant(support,null)` else 400 app_required | report is app-filtered |
| POST /v1/customers/:ref/resend-email | any support + R(appOfClaim) | see M1 |
| POST /v1/customers/:ref/rotate-user-id | G admin | |
| POST /v1/customers/:ref/grants | any admin + preHandler R(body.app_id) | |
| DELETE /v1/customers/:ref/grants/:id | any admin + R(appOfGrant) | revokeGrant also matches the customer ✅ |
| GET /v1/audit | any viewer + (`?app` → R(query.app) viewer, app_not_found; else `hasGrant(viewer,null)` or 403) | |
| GET /v1/analytics/overview | any viewer; `?app` out of scope → 404 app_not_found in the handler; else appIds filter | |
| GET /v1/analytics/funnels/:slug[/breakdown] | R(appOfFunnel) viewer, funnel_not_found | |
| /v1/admin/users (GET, POST, PUT :id, PUT/DELETE :id/apps/:app_id) | G admin | |
| POST /v1/tokens | G admin | |
| POST /v1/billing/reconcile, GET /v1/billing/outbox | G admin | |
| checkout, claim, identity (requireApp app key), sdk, paddle webhook, google | not admin auth; unchanged by this branch | |

`requireRole` has no route left (B9 carry-forward ✅). No write runs without a check. On GET existence leaks, the only one I found is the slug in `previous` (M2) and in audit rows (M3). Query arrays (`?app=a&app=b`) reach resolvers before validation, but they resolve to the default role or none, and the schema then 400s. That gives no escalation.

TOCTOU between a resolver and its handler (prices with Paddle calls before the tx, pixel, upload, resend) is the parked T5 Minor #5. I am not raising it again: every case needs a concurrent app move by a more privileged actor, and the outcome is one action the caller was allowed a moment earlier.

## 2. Existing users and tokens after 008 (Review Focus 1 and 4)

- `admin` → global, which is `USER_GRANTS.admin` on every route and the same as before.
- viewer/support/editor → default role. `grantsIn(any id)` and `defaultGrants` equal the old grants, so every route that was open to them still answers the same way. This includes unknown app ids, unassigned funnels, audit without `?app`, lookup without `app_id`, and the shared-host sync. The only routes that turned global were already admin-only.
- Tokens without an app: `globalGrants = tokenGrants(roles)` short-circuits every check, so router and publisher tokens behave exactly as with `requireRole`. The `'publisher'` vs old `['editor','publisher']` on POST /v1/funnels is equivalent for both persons and tokens.
- Verdict: unchanged access ✅.

## 3. Lock order

Every path that takes both locks does so in this order:

| Path | Lock order |
|---|---|
| setDomain | host FOR UPDATE → live funnels FOR SHARE ORDER BY id |
| setFunnelApp | hosts asc → funnel NO KEY UPDATE |
| publishVersion assign | hosts asc → funnel FOR UPDATE |
| setRoute and rollback | host → funnel FOR SHARE |
| setFunnelPixel | hosts asc → funnel UPDATE → host_revs only |

- The plain upload takes only the funnel lock.
- syncHost uses an advisory lock plus host_revs and no domain or funnel lock.
- setFunnelPrices takes only an FK KEY SHARE.
- I found no path that locks a domain after a funnel, and no cycle.
- `ORDER BY … FOR UPDATE` locks rows in sorted order (LockRows sits above Sort).
- The one new long hold is the plain upload's funnel FOR UPDATE across R2 blocking `setRoute` FOR SHARE while it holds the host row. That is parked T5 Minor #2: latency only, no deadlock. I am not raising it again.

## 4. SPA ↔ server, CLI ↔ server

After 87090da, buttons match the server, with the two exceptions below (M1, M2): Sync, grants, pickers, Publish, Upload, Pixel/App, Giá, AppSettings, Webhooks resend, Billing, Tạo app, rotate user_id and Users. `canAll` equals `hasGrant(…, null)` and `canGlobal` equals global routes (B11). `effectiveRole` mirrors `roleIn`. The CLI maps `last_global_admin`, `cannot_lock_self`, `invalid_roles`, `not_found` and `forbidden`.

## 5. Logs and audit

- No new log line in core-api.
- New audit details:
  - `admin.user.create {email, role, global}`
  - `admin.user.app_grant {email, app_id, role}`
  - `admin.user.app_revoke {email, app_id}`
  - `admin.user.update {email, role, global}`
  - `token.create {name, roles}` with the `app_id` column
- All `email` values are operator emails. There is no customer data, no user_id and no secret ✅.

## Issues

### Critical (Must Fix)

None.

### Important (Should Fix)

None.

### Minor (Nice to Have)

**M1. CustomerDetail "Gửi lại" can be enabled where the server refuses, and in an app it acts on another app's claim.**
- Location: apps/admin/src/pages/CustomerDetail.jsx:295 vs services/core-api/src/http/customers.js:55-56 and identity/customer-actions.js:17-20.
- In `/apps/starlyn/customers/:ref` the report shows Starlyn's claim (app-filtered), and the button is gated on `support` in the URL app.
- The server resolves and resends the customer's **newest claim in any app** (`appOfClaim`).
- Scenario: a buyer of both Starlyn and Calmio whose newest checkout is Calmio's.
  - `support@` (Starlyn-only, the demo's own scoped user) clicks Gửi lại and gets "forbidden".
  - A default-role support person gets the Calmio email sent while looking at Starlyn's claim. That half is from 4a.
- Fix: send `app_id` to resend-email and resolve the newest claim in that app, or at least gate the button on `appOfClaim`'s app. Otherwise, document that it only works for the newest claim.

**M2. `GET /v1/funnels/:slug` discloses the slug of an out-of-scope funnel, and the Rollback button can be enabled where B14 refuses.**
- Location: services/core-api/src/publisher/catalog.js:76-89 (`live[].previous.slug`); apps/admin/src/pages/FunnelDetail.jsx:104; publisher/routes.js:128.
- On a shared host, the previous version at a prefix can belong to another app's funnel.
- A Starlyn-only viewer sees `previous: {slug: 'chatchi-…'}`, which is a GET leak of a foreign slug. B4's intent is that out-of-scope resources are not disclosed.
- A Starlyn-only admin sees Rollback enabled, and the server answers 403 (`allowed(to.app_id)`).
- Fix: in `liveWithPrevious`, return `pf.app_id` and let the handler null out `previous.slug` when `!hasGrant(viewer, app)`. Gate Rollback on `previous`'s app as well. Low impact: shared hosts only.

**M3. Audit rows of app A can name app B's funnel.**
- Location: publisher/routes.js `route.publish` / `route.rollback` audits with `from_slug`, filed under the new funnel's app.
- `GET /v1/audit?app=A` therefore shows `from_slug` of a B funnel replaced on a shared host.
- After B14 only an actor with router in both apps can produce such a row, so this is a residual disclosure to A viewers only. Accept, or drop `from_slug` when the apps differ.

**M4. Upload race: 409 `funnel_app_mismatch {app_id}` before the scope check.**
- Location: services/core-api/src/http/versions.js:23-24.
- `checkUploadApp` runs before `hasGrant(scope,'publisher', funnel.app_id)`.
- Scenario: a scoped Starlyn editor uploads a new slug with `app_id: starlyn`, and someone else creates the same slug in Calmio between the preHandler and the handler. The editor then gets `409 {app_id:'calmio'}` instead of 403.
- The window is tiny, and the slug namespace is global anyway. Swapping the two lines would make the 403 win.

**M5. Docs out of date after B14 and B6.**
- docs/runbooks/admin-console.md:162 says "Rollback, route delete … are not checked against apps". Since B14 they are permission-checked: router in the app of the funnel taken off or put back. The domain-app rule is still not applied to them. CLAUDE.md:73 "rollback/delete/sync unchecked" needs the same nuance, and the B14 sentence the ledger scheduled for the final fix wave is still missing from both files.
- Runbook:168 lists "the audit across apps and unassigned funnels" as global-only. Per B6/B9 a person with a default role also has them.
- Runbook:194 says an app token "cannot touch … shared domains". In fact it can publish, roll back and delete its own funnels' routes on shared hosts (demo hosts are shared). It only cannot sync or assign them. The sentence would mislead someone setting up per-app CI.

**M6. CLI `ikf admin add --role admin` without `--global` silently creates a non-global admin.**
- Location: packages/cli/src/main.js `adminAdd`.
- Before 008, `--role admin` meant full admin. Now it gives admin in every app without Users, Billing or tokens. The runbook's bootstrap line was updated, but an operator using the old habit gets a person who cannot open Settings › Users.
- Fix: a one-line hint when `role === 'admin' && !global` ("không phải global: thêm --global để quản lý Users/Billing").

## Declined to judge (set aside, one line each)

- Pre-existing `err.message` in logs: publisher/routes.js `trySync` (`log.warn({host, err: err.message})`) and http/billing.js:33. These are not in this diff; worth a follow-up against the log rule.
- 4a decision "rollback/delete/sync not checked against the host's app" (`domain_app_mismatch` on rollback). I am not raising it as a 4b finding: it is an explicit 4a ruling, and B14 already narrows who can do it.
- Write routes without an `any` gate (PUT /v1/funnels/:slug, PUT prices) answer 404 for a missing slug and 403 for an existing out-of-scope one. Spec decision #5 accepts 403 on writes, and slugs are public in URLs.
- Parked items I agree with and did not raise again:
  - T1, T3, T6, T8 minors.
  - T5 #2 (R2 hold) and #5 (TOCTOU).
  - T7 Customers flicker.
- Old CLI builds crash on `ikf admin ls` when a user has role NULL (`u.role.padEnd`). This is a version-skew concern, not this branch's code.
- `me` goes stale until reload after role changes. The server is authoritative, and pages fall back to AppNotFound or 403.

## Assessment

**Ready to merge: With fixes.** The fixes are mainly docs (M5, already scheduled in the ledger). M1–M4 and M6 are small and can be follow-ups.

**Reasoning:** Every admin route is guarded at the right scope. Existing users and tokens keep exact prior access. Lock order is uniform with no cycle. The remaining issues are narrow disclosures on shared hosts, one SPA/server mismatch on resend, and stale docs.

# Final whole-branch review: feat/demo-purchase 2cd090a..ae84951

Reviewer: final cross-task review (one pass by me, no sub-reviewers). Read-only: no code was changed.
Scope: 27 commits. Tasks 1–8 are the production web funnel SDK compat. Then the merge of feat/local-demo (6741bdf), the production demo hook (4fbb3c1), and the demo purchase tooling (c089fe1..ae84951).
Authority: the specs `2026-10-11-web-funnel-sdk-compat-design.md` and `2026-10-11-demo-purchase-design.md`, and the plan's C1–C9, D1–D13, Global Constraints and Review Focus 1–5. Ledger rulings are treated as decided.

## Test runs (at ae84951, Docker via colima)

| Suite | Result |
|---|---|
| `npm test` (root, all workspaces) | exit 0 |
| cli | 118 / 118 (12 files) |
| event-schema | 145 / 145 |
| paddle | 31 / 31 |
| route-match | 35 / 35 |
| sdk | 156 / 156 (11 files); bundle **8154 B gzip** (≤ 8192) |
| core-api | 344 / 344 (34 files) |
| edge-router | 106 / 106 (7 files) |
| event-consumer | 8 + 27 |
| `npm run demo:test` (alone) | 100 / 100 (17 files); `purchase.test.mjs` 4 / 4, not skipped (13.3 s) |
| Terraform `infra/modules/edge` | 10 passed |
| Terraform `infra/stack` | 11 passed |

Note: a first `npm test` run without `DOCKER_HOST` failed every Testcontainers suite in core-api (an environment problem, not a code problem). The rerun with the documented env is green. The working tree was clean afterwards.

## Diff stat per top-level directory (production is untouched except the hook)

- **Production, Tasks 1–8:** `services/core-api` (migration 004, identity/*, http/{sdk,identity,apps}.js, app.js, tests), `packages/{cli,event-schema}`, `infra/modules/edge` (rate-limit path + test), `docs/{integration,runbooks}`.
- **Merge 6741bdf** (feat/local-demo): `demo/**`, `CLAUDE.md` (Local demo section), `.gitignore`, root `package.json` (scripts + devDependencies esbuild/miniflare/pg/vitest), and a lockfile re-hoist. I compared resolved versions per consumer before and after:
  - The sdk still gets esbuild 0.25.12.
  - wrangler still gets 0.28.1; the 0.28.2 that was hoisted to root before now sits under vite.
  - vitest 3.2.7, wrangler 4.148.0, miniflare/workerd 4.20260310 / 1.20260310.1 and happy-dom are unchanged.
  - No production dependency changed version.
- **Hook 4fbb3c1:** `packages/sdk/src/checkout.js` (+2 lines), `workers/edge-router/src/pay.js` (+3), `workers/edge-router/scripts/{deploy-config.js (new), render-config.mjs}`, plus tests.
- **Demo commits c089fe1..ae84951:** outside `demo/` they touch only `package.json` (+`demo:purchase`, +`qrcode-terminal`) and `package-lock.json` (+10 lines, qrcode-terminal). They make zero changes to `services/`, `workers/` or `packages/`.

## Strengths

- **sdk-contract.js really is the single source of truth for the endpoint (C1).**
  - core-api (`http/sdk.js`) reads it, and so do the core tests and `docs-vector.test.js`, which ties the docs section to the constants.
  - The demo smoke test imports it, and the fake app page reads it at runtime through `/_demo/sdk-contract.json`.
  - A grep for `check-purchased-web-funnel|is_pro|expires_at|bundle_id` turns up the rest:
    - Remaining literals: the log key `is_pro` in `sdk.js:49` (that is the spec's log format, not the contract), the Terraform rate-limit path, the docs (pinned by a test), `demo/README.md`, and one routing table in `demo/test/proxy.test.mjs`.
    - Unpinned: only the Terraform path and the demo files; see M1.
- **The check-purchased hardening holds together across tasks** (Review Focus 2).
  - The encapsulated plugin uses a lenient `*` parser, and its plugin-scoped error handler maps any 4xx to `200 not-pro`; 5xx gives 503.
  - `removeAllContentTypeParsers` does not leak to sibling plugins: claim, checkout and webhook tests all pass.
  - Logging is safe: `user_hash` is logged only for UUID-shaped input, and `app_id` only after the value matches an app. The DB error path logs the code only.
- **C3/C8 are implemented exactly** (Review Focus 3 and 4).
  - The query `active AND (expires_at IS NULL OR expires_at > now())` closes the 5-minute sweep gap.
  - `usesUserId = kind==='app' && handoff==='user_id'` is used consistently in all of these: `claimForCheckout`, `redeemClaim`, `sendOtp`/`verifyOtp`, `sendClaimEmails`, and createClaimForCheckout (whose SQL already filters `kind='app'`).
  - `appView` returns `null` handoff for web apps.
  - Claim, OTP, magic-link and webhook tests pass unchanged apart from `APP_BODY.handoff='claim'`.
- **No webhook can be sent for a user_id app:** `app_links` can only be created through claim redeem (blocked), OTP verify (blocked) or magic links (web apps only), so `recompute` has no link to deliver to. Webhook payloads hold `customer_ref` plus entitlements, never `user_id`.
- **user_id leak sweep (Review Focus 1).** A grep of `services/ workers/ packages/` src for `user_id` (excluding `app_user_id`) finds it only in these places:
  - SQL reads;
  - `userAppLinkFor`;
  - the CS lookup (`customerReport`, POST body, admin only) and `ikf customer show`;
  - the AUTH endpoint (POST body, C2).

  It never appears in a log call, a URL of our API, an outbox or webhook payload, or a ClickHouse column. The `app_handoff {url}` event is scrubbed by the UUID rule on both the SDK and the collector side (same `@ikf/event-schema`; the bundle contains the regex). The event envelope carries `path` (pathname only), never the query.
- **The PADDLE_JS_URL hook is closed off for production (Review Focus 5).**
  - The edge only emits `__IKF.paddle.js` for `https://` values, and the SDK only loads `https:` values.
  - `deploy-config.js` refuses the variable whether it comes from the job env or from `wrangler.json`, and it is the only producer of deployed Worker vars (D1).
  - A funnel author who sets `__IKF.paddle.js` themselves gains nothing: they already run arbitrary script on their own page.
  - The demo cannot be switched on in prod because nothing in `services/` or `workers/` reads a demo flag. Fake Paddle, Turnstile, SES and the queue are injected only through `buildApp({deps})` from `demo/lib/purchase.mjs`, and the core-api Dockerfile does not ship `demo/`.
- **Migration 004 still applies as a whole:** `migrate.test`, `entitlements-schema.test` and the demo's `migrate()` all pass. `gen_random_uuid()` is core in PG ≥ 13 (RDS is pinned to 17). `ADD COLUMN … DEFAULT gen_random_uuid()` backfills existing billing customers with distinct values.
- **The demo smoke test runs real production code end to end.** The path is: `POST /v1/checkout` through the proxy with the purchase host and Origin → fake Paddle signed webhooks → real `/v1/paddle/webhook` → real billing-sync (with the Paddle re-read) → outbox → real entitlement-sync → real claim endpoint → real check-purchased.
  - The test also covers full refund → FREE, and expire (`past_due` + 4 days) → FREE, then renew → PRO.
  - It asserts that captured core and worker logs contain neither the email nor the user_id.
  - `stop()` frees every port.
  - Signal handling is careful too: the tunnel registers exit/SIGINT/SIGTERM cleanup with a SIGKILL fallback, and `run.mjs` takes over the signals from Miniflare's hook.
- **No secrets in the diff.** The only key-like values are the declared non-secret demo constants (`DEMO_CLAIM_KEY`, `DEMO_WEBHOOK_SECRET`, `ikf_demo_admin`, the Cloudflare test sitekey `1x000…AA`, `test_demo`) and test fixtures.

## Issues

### Critical (Must Fix)

None.

### Important (Should Fix)

#### I1. The user_id app link is served before the entitlement exists; the SDK can cache FREE right after payment

- **Where:** `services/core-api/src/identity/link.js:126-133` (`claimForCheckout`, `usesUserId` branch).
- **What:** For `handoff = user_id` the link is returned as soon as `transactions.status = 'completed'`. Billing-sync writes that status, together with the `payment.succeeded` outbox row. The entitlement, however, is written later by entitlement-sync, which ticks every 2 s, takes 100 rows per tick, and can park a failing customer for up to 1 h. The `claim` path does not have this gap: it waits for the `claim_tokens` row, which `syncOutbox` writes in the same SAVEPOINT as `recompute()`. So a claim link always appears after the entitlement exists. Task 3 followed spec §2 literally, and the per-task review could not see the timing against Task 4's reader.
- **Failure scenario:** The buyer already has the app installed.
  1. The funnel's 2 s claim poll gets the link within about 1 s of `transaction.completed`.
  2. The buyer taps "Get the app".
  3. Adjust opens the app at once, and IKameSDK sees a new `user_id`, so it checks immediately.
  4. Entitlement-sync has not ticked yet, or is backlogged, or the customer is parked in `sync_failures`. The answer is `{is_pro:false}`.
  5. The SDK stores FREE and only checks again on the next app open. A buyer who has just paid sees FREE.

  The smoke test itself has to poll `until(is_pro)` for up to 10 s after getting the link, which shows the window exists.
- **Fix (one line, no new state):** Gate the user_id branch on the same row the claim path uses, i.e. `EXISTS (SELECT 1 FROM claim_tokens WHERE checkout_id = $1)` together with the completed transaction.
  - For user_id apps that row is the "email tracking" row, and it is written after `recompute` in the same savepoint.
  - The SDK's 20 s poll and the 1 h window are unchanged.
  - The trade-off is that a funnel attached to the app after the sale has no claim token. Its buyer then sees no link, but they cannot be served the link reliably anyway and they still get support via `ikf customer show`.
  - Add a test: a completed transaction with no outbox processing gives `202` pending; after `syncOutbox` it gives `200 {app_link}`.
  - Spec §2 says "khi transaction … completed" and also "độ trễ … = chu kỳ entitlement-sync". The executor should rule on this as a small spec adjustment.

#### I2. The rollout runbook's verify steps and exit criterion are wrong for the default (`user_id`) app it now creates

- **Where:** `docs/runbooks/entitlement-identity.md`.
  - **:36-37:** The example app `starlyn` is now created with `--handoff user_id`.
  - **:77-84 (steps 2–5):** These verify claim redeem, `link.created`, "Restore purchase → email code", `link.revoked` and webhooks for the same `starlyn`, none of which exists for a user_id app.
  - **:89-90 (step 7, exit criterion):** The query divides linked customers by all customers with `claim_tokens`. User_id apps get one `claim_tokens` row per checkout (the email tracking row) and never an `app_link`.
  - **:49-50:** The text says past buyers "restore with the email code". There is no OTP for a user_id app.
- **Failure scenario:** An operator follows the runbook on staging for a user_id app.
  - Steps 2–5 cannot pass.
  - The exit criterion reads close to 0 % for user_id buyers. It either blocks the rollout, or gets waved through so the gate means nothing.
  - Past buyers of a funnel attached later to a user_id app are told they can "restore by email code". They cannot: with no claim token, no email and no OTP, the only path is `ikf customer show` through support.
- **Fix:**
  - Label steps 2–5 "claim apps only", using a separate `--handoff claim` test app or saying so explicitly.
  - Make step 6 the user_id verification.
  - Restrict the step 7 query to `JOIN apps a ON a.id = ct.app_id AND a.handoff = 'claim'`.
  - State the user_id exit criterion separately, for example "step 6 passes for N staging buyers; email received for ≥ 98 % (`emailed_at IS NOT NULL`)".
  - In §4 (backfill), add: "user_id apps: past buyers get no link; support sends the link built from `ikf customer show`."

### Minor (Nice to Have)

- **M1. Rate-limit path not pinned to `sdk-contract.PATH`.** In `infra/modules/edge/variables.tf:29` the path is a literal. When the swagger renames `PATH` (the reason C1 exists), the docs-vector test catches the docs, but nothing catches Terraform: the public, unauthenticated endpoint would silently lose its 50/10 s rule. Fix: extend `services/core-api/test/docs-vector.test.js` (or a sibling test) to read `variables.tf` and expect `"${PATH}"`.
- **M2. The demo proxy exposes core's admin API on the public tunnel with a well-known token.**
  - Where: `demo/lib/proxy.mjs:9` sends all of `/v1/*` to core, and `demo/lib/stack.mjs:20` sets `DEMO_TOKEN = 'ikf_demo_admin'`, which sits in the repo.
  - Anyone who learns the `*.trycloudflare.com` URL (it is shown as a QR code, shared, or kept in phone history) can call `/v1/apps`, `/v1/funnels/*` (publish arbitrary HTML/JS on that origin) and the CS lookup (emails → user_id) while the demo runs. The data is demo-only, so the severity is low.
  - Fix: have the proxy answer 403 to any `/v1/*` request that carries an `authorization` header. The phone flow (checkout, claim, check-purchased, Paddle webhook) never sends one, and local CLI use goes straight to 127.0.0.1:8080.
- **M3. CLAUDE.md out of date.** `CLAUDE.md:70` says demo code "must not change `services/`, `workers/` or `packages/`", but this branch adds the sanctioned `__IKF.paddle.js` hook there. The section also does not list `npm run demo:purchase`. Fix: add "except the `PADDLE_JS_URL` → `__IKF.paddle.js` hook (refused by deploy-config.js)" and the new script.
- **M4. Deep-link parameter name outside the contract module.** The name `user_id` is hard-coded in `claims.js:19` and in the fake app's `pickUserId`. This is part of the SDK contract too (the SDK docs require the param to be named `user_id`). Optional: add `DEEPLINK_USER_ID_PARAM` to `sdk-contract.js` and to `contractJson()`.
- **M5. The smoke test covers neither the in-browser SDK path nor the fake app's JS.** It calls `POST /v1/checkout` and the claim endpoint directly. The SDK's claim polling and `attach(app_link)` are covered by sdk unit tests, and the overlay by `paddle-js.test`. A real phone run was done in Task 14 (ledger). This is acceptable; I note it so nobody assumes otherwise.
- Parked minors from per-task reviews: decisions are in the fix list and in "Not required before merge" below.

## Declined to judge

- **A leaked checkout_id gives a permanent credential.** `GET /v1/checkout/:id/claim` returns a permanent bearer `user_id` to anyone who holds the `checkout_id` (which reaches logs and ClickHouse) within 1 h of completion. The Origin check can be spoofed outside a browser. The spec accepts the 1 h window explicitly (§2), and revocation is out of scope (§6). Before this branch a leaked checkout_id gave a single-use claim token; now it gives permanent access. Recorded for a later revocation spec.
- **user_id reaches third parties by design** (spec §2/§6): Adjust (`deep_link` query), SES/email body, and the device. Nothing to fix here.
- **C4 strictness:** a `bundle_id` that matches no app gives FREE. This is a plan ruling; the runbook warns about it.
- **C5 claim-app email HTML:** `"` is now `&quot;` (Task 3 minor 1). It renders the same in mail clients, and only the wording of C5's "byte-identical" claim is wrong. Not a code issue.
- **Unsigned NOT_AUTH requests:** the SDK does not sign check-purchased calls, and spec §6 accepts that.
- **The PADDLE_JS_URL Worker *secret* path (Task 9 minor 1):** only someone who can already deploy Worker code can set it. A runbook smoke check is the agreed mitigation (fix list).

## Fix list before merge

1. **I1:** In `link.js:126-133`, serve the user_id `app_link` only once the checkout's `claim_tokens` row exists (written after `recompute`). Add a pending → ready test. The executor rules on the spec §2 wording.
2. **I2:** Runbook: mark §5 steps 2–5 claim-only, filter step 7 to `handoff='claim'`, add a user_id exit criterion, and fix the §4 backfill text (no email code for user_id apps; support link via `ikf customer show`).
3. **M1:** Pin the Terraform `rate_limited_paths` entry to `sdk-contract.PATH` with a test.
4. **M2:** Demo proxy: 403 on `/v1/*` requests that carry `authorization`.
5. **M3:** CLAUDE.md: note the sanctioned hook exception and `npm run demo:purchase`.
6. **Task 8 doc minor:** `app-backend.md:7`: drop "the default" (the CLI requires `--handoff`).
7. **Task 8 doc minor:** `app-backend.md:22`: add "(URL-encoded in the real link, see step 4)".
8. **Task 9 minor 1:** In the runbook (or `scripts/smoke-edge.sh`), add a check that a deployed funnel's `__IKF.paddle` has no `js` key, plus "never `wrangler secret put PADDLE_JS_URL`".
9. **Task 9 minors 2–3:** SDK `checkout.test.js`: add rows for `''`, `123` and `'//cdn.evil/x.js'` → PADDLE_JS. In `pay.test.js:102-103`, change `toEqual` to `toStrictEqual`.
10. **Task 3 minor 2 + Task 5 minor:** add log-capture tests that the user_id never appears in core logs on the claim-email failure path and on `POST /v1/web-funnel/entitlements`.
11. **Task 13 minors:**
    - `demo/server/index.mjs:23`: make an over-limit body reject with 413 instead of hanging.
    - Require `content-type: application/json` on the POST actions (cuts cross-site form posts to 127.0.0.1:8791).
    - Have `pages.mjs` `esc()` escape `'`.
12. **Task 14 minors:**
    - `demo/run.mjs:78-79`: wrap the shutdown in `try { await stack.stop() } finally { await tunnel?.stop() }`.
    - Add the README troubleshooting line for "cloudflared exited (code N) before giving a URL".

**Not required before merge** (parked; demo-only or cosmetic):
- Task 1 test gaps.
- Task 3 minors 1 and 3: C5 wording; `LIMIT 1` without `ORDER BY`.
- Task 7 CLI: web plus handoff flags is silently ignored; empty `--bundle-ids`; `user_id: undefined` on an old server.
- Task 10: fake Paddle fidelity (refund cap, timestamp compare, renew semantics, queue waiter leak).
- Task 11: hop-by-hop headers, `/_demox` test.
- Task 12: webhook-secret store empty on the 409 path; Miniflare/proxy logs not captured.
- Task 14: mixed-case `--host`, `--funnel` without `--purchase`.
- M4, M5.

## Assessment

**Ready to merge: With fixes.**

**Reasoning:** The production side integrates correctly end to end:
- checkout → billing → entitlement-sync → user_id link → email → check-purchased is wired correctly;
- refund and expiry turn pro off;
- claim and web apps are unaffected;
- the user_id stays out of logs, our URLs, ClickHouse and webhooks;
- the demo hook cannot reach a deployed Worker;
- all suites are green.

One integration timing gap (I1) can show a buyer who has just paid FREE, and the rollout runbook mis-gates user_id apps (I2). Both are small, local fixes.

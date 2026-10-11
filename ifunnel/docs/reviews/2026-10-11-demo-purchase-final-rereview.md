# Final fix wave re-review: feat/demo-purchase ae84951..d47ebdf (12 commits)

Scoped re-review: each item on the final-review fix list, plus new problems in the fix diff. Rulings I1 and M2 from progress.md are treated as decided. No code was changed, and the working tree was clean afterwards.

## Finding verdicts

1. **I1: serve the user_id app_link only once the claim_tokens marker exists.** ADDRESSED.
   - `services/core-api/src/identity/link.js:127-135` adds `AND EXISTS (SELECT 1 FROM claim_tokens WHERE checkout_id = $1)` to the user_id branch only. The claim branch (`:137-140`) and the web branch (`:141+`) are unchanged.
   - The marker is inserted by `createClaimForCheckout` (`claims.js:24-45`), called in `syncOutbox` (`sync.js:94-102`) inside the same SAVEPOINT as `recompute()` and the same outer transaction. So the marker is visible only after the entitlement has committed. The "pro at the first check" assertion in `purchase.test.mjs` is deterministic, not timing luck.
   - Before the marker exists the function returns `null`, so the route answers 202. After it, the route answers 200 `{app_link}`. Test: `sdk-handoff.test.js` checks 202 → `buyWeekly` → still 202 with 0 entitlements → `tick()` → 200.
   - Query cost: `claim_tokens.checkout_id` is `UNIQUE` (`004_entitlements.sql:71`), so the EXISTS is a single index probe. Postgres plans it as a one-time InitPlan because it is not correlated. `transactions_by_checkout` already covers the outer query. No new cost.
   - SDK budget: 11 tries × 2 s (`CLAIM_POLL_TRIES`/`CLAIM_POLL_MS`) gives about 20 s. The extra wait is at most one `OUTBOX_INTERVAL_MS` = 2 s tick after billing-sync. The claim path already had this exact dependency, so user_id apps now match claim apps. A customer parked in `sync_failures` gets no on-page link, which is the accepted trade-off; the email follows later.
   - Spec §2 was updated by the controller (ikame `033e6a9`). `app-backend.md` A.2 now says "once … the buyer's entitlement exists".
2. **I2: runbook gates for user_id apps.** ADDRESSED. `docs/runbooks/entitlement-identity.md`:
   - §5 has a preamble marking steps 1–5 claim-only, run on a separate `--handoff claim` app.
   - Step 7 joins `a.handoff = 'claim'`.
   - New step 8 is the user_id exit criterion (`emailed_at` ≥ 98 %).
   - The §4 backfill text now covers user_id apps: support sends the link from `ikf customer show`.
3. **M1: pin the Terraform rate-limit path to sdk-contract PATH.** ADDRESSED. `services/core-api/test/rate-limit-path.test.js` parses the `rate_limited_paths` default and the module tftest, and expects PATH in both.
4. **M2: proxy 403 on /v1/* with Authorization.** ADDRESSED. `demo/lib/proxy.mjs:23-28` checks `target === 'core' && req.headers.authorization !== undefined`. Core authenticates only through `Authorization` (`src/auth.js:23`, `src/identity/apps.js:123`), so no other header gets past the check. The test covers GET and POST, mixed case, a no-header pass-through to core, and `/_demo` with the header unaffected.
5. **M3: CLAUDE.md.** ADDRESSED. `CLAUDE.md:70` now lists `demo:purchase`, the sanctioned hook exception and buildApp-only fakes.
6. **app-backend.md "the default".** ADDRESSED (`docs/integration/app-backend.md:7`).
7. **app-backend.md URL-encoded note.** ADDRESSED (`docs/integration/app-backend.md:21-24`).
8. **Runbook check for no `js` key, and never a PADDLE_JS_URL secret.** ADDRESSED. `docs/runbooks/billing-paddle.md:60-69` has the curl/grep check on a live URL, plus the `wrangler secret list`/`delete` commands.
9. **SDK rows `''`, `123`, `'//cdn.evil/x.js'`, and toStrictEqual.** ADDRESSED. `packages/sdk/test/checkout.test.js:70-72`; `workers/edge-router/test/pay.test.js:101-102`.
10. **Log tests for user_id on the claim-email failure path and on web-funnel/entitlements.** ADDRESSED.
    - Both tests exist (`sdk-handoff.test.js` last test; `web-funnel-auth.test.js` last test).
    - The fix for the leak the test found is at `src/http/identity.js:63-71`: catch, log `{code}` only, throw `HttpError(500,'internal')`.
    - Response codes are unchanged. `webFunnelEntitlements` (`purchased.js:25-30`) throws no HttpError, so the catch cannot turn a 4xx into a 500. Schema 400 and `requireApp` 401 happen before the handler. A DB failure still gives `500 {"error":"internal"}`, the same body as the generic handler.
11. **Demo server 413, 415 and `esc()` apostrophe.** ADDRESSED.
    - `demo/server/index.mjs:18-41` (413 and drain), `:80-91` (415, `/_demo/null` exempt), `pages.mjs:2`.
    - No legitimate caller breaks: every browser POST to `/_demo/*` sends `content-type: application/json`. That covers the panel (`pages.mjs:25`), the fake Paddle.js (`paddle-js.mjs:43`) and the fake app (`app-page.mjs:62`; that page posts check-purchased to `/v1/…`, not to the demo server).
    - The `; charset=utf-8` form passes; a test covers it.
12. **stopDemo try/finally and the README line.** ADDRESSED.
    - `demo/lib/tunnel.mjs:71-77`: `try { stack.stop() } finally { tunnel?.stop() }`.
    - `run.mjs:78-83` prints the error and exits 1. The 10 s `unref` exit guard stays.
    - The README troubleshooting row was added.
    - Tests cover the order and the stack-failure path.

## M2: legitimate paths through the proxy

| Path | Sends Authorization? | Result |
|---|---|---|
| SDK `POST /v1/checkout`, `GET /v1/checkout/:id/claim`, `GET /v1/checkout/:id` | no (content-type only, `credentials:'omit'`) | forwarded |
| SDK collector `POST /_ikf/c` | no; target edge | unaffected |
| Fake app check-purchased `POST /v1/payment/check-purchased-web-funnel` | no | forwarded |
| `/_media/*`, `/_demo/*` | n/a | not core, unaffected |
| Fake Paddle webhook, seed, publish | n/a | go to `127.0.0.1:<core>` directly, not through the proxy |

Evidence:
- `purchase.test.mjs` runs checkout → claim → check-purchased (green, 4/4).
- `proxy.test.mjs` passes a no-header `/v1` request through to core.

## Global error handler and user_id: leak sweep

Routes that receive a user_id as input:
- `POST /v1/payment/check-purchased-web-funnel`: its own plugin error handler logs the code only (`sdk.js:26-31`, `:43-45`).
- `POST /v1/web-funnel/entitlements`: fixed in this wave.

No other route takes a user_id in a body, path or query. A grep of `src/` for `user_id` without `app_user_id` finds only:
- these two routes;
- SQL reads in `purchased.js`, `link.js` and `sync.js`;
- `customers.js`, the CS lookup, which takes an **email** and returns the user_id;
- `userAppLinkFor`, which builds `new URL(tracker)` before the user_id is added, so a URL error carries no user_id.

`GET /v1/checkout/:id/claim` binds only `checkout_id`. `sendClaimEmails` catches its own errors (covered by the new test). `app_user_id` belongs to the app and is not a bearer secret.

Conclusion: the generic handler's `req.log.error(err)` is no real user_id leak today. It is a latent risk if a future route takes a user_id. Keep the follow-up already ledgered: make the generic handler log `{code, name}` only.

## New breakage in the fix diff

None at Critical or Important.

- **Minor:** `demo/server/index.mjs:28`: after the 413 the `data` listener stays attached and drains the rest of the body. The response sends `connection: close`, so the socket closes after the reply. This is demo-only, and the drain matches its comment. Noted, not a defect.

## Out-of-scope observations

- **Minor (ikame spec, not this repo):** `2026-10-11-web-funnel-sdk-compat-design.md:40` still says "Không tạo `claim_tokens`" right after `:39` now relies on the `claim_tokens` marker. This is correct in context (the endpoint creates none; entitlement-sync does), but readers may stumble on it. Suggested wording: "endpoint không tạo `claim_tokens`".
- **Follow-up (already in progress.md):** the generic 500 handler logs `err.message`; see the leak sweep above.

## Test runs (at d47ebdf; DOCKER_HOST=colima, TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock)

| Suite | Result |
|---|---|
| `npm test` (root) | exit 0 |
| cli | 118 / 118 |
| event-schema | 145 / 145 |
| paddle | 31 / 31 |
| route-match | 35 / 35 |
| sdk | 159 / 159; bundle 8154 B gzip |
| core-api | 347 / 347 (35 files) |
| edge-router | 106 / 106 |
| event-consumer | 8 + 27 |
| `npm run demo:test` (alone) | 105 / 105 (17 files); `purchase.test.mjs` 4 / 4, not skipped (13.5 s) |

Terraform was not rerun; no infra files changed.

## Verdict

**Fix round:** all 12 findings are addressed, with no new Critical or Important breakage. **Merge-ready.**

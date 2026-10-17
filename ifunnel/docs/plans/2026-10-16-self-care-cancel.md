# Self-care Cancel Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** a buyer cancels or resumes their own subscription on `https://<funnel-host>/_ikf/account` after an email code.

**Architecture:** edge-served inline page → core-api `/v1/account/*` (CORS, host-scoped OTP + bearer session) → Paddle cancel / clear scheduled change → inline billing `syncMessage`. Data in migration 010.

**Tech Stack:** Node ESM, Fastify 5, Postgres 17 (Testcontainers), Vitest, Cloudflare Worker (vitest-pool-workers), React SPA, Playwright demo.

**Spec:** `ifunnel/docs/specs/2026-10-16-self-care-cancel-design.md` (binding). Code: `/Users/daothinh/ikf-platform-cancel`, branch `feat/self-care-cancel` from `feat/conversions-relay-capi` (b19d8ec).

> **Ruling P0 (plan form):** unlike earlier plans this one was not transcribed from a scratch implementation: the user asked for a run without check-ins, and each task here is small and has close precedents in the codebase (`identity/otp.js`, `http/checkout.js`, `edge-router/src/pay.js`). Each task gives exact interfaces, file paths and test cases; implementers write the code TDD against them, following the named precedent. Cost if wrong: more review-fix rounds.

## Global Constraints

- Logs and audit: no email (only `email_hash`), no code, no session token, no `user_id`, no `err.message`, no SQL with parameters.
- Every response from `/v1/account/*` has `cache-control: no-store`.
- `otp/send` answers identically (status, body, same queries in the same order) for buyer, stranger and rate-limited email; the mail is not awaited.
- Errors are `HttpError(status, code)` → `{error}`; 404 for another customer's subscription is the same body as a missing one (`not_found`).
- Commit messages: subject line alone, body optional, and the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` as the last line after a blank line — write them with a heredoc (`git commit -F - <<'EOF'`). Never on the subject line.
- Never touch other worktrees, `~/ikame/funnel`, processes or containers you did not start. Never `terraform apply`. No bare `git stash`.
- Test env: `export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock`.

## Review Focus

1. Enumeration through timing or shape on `otp/send` / `otp/verify` (stranger vs buyer vs locked) — tests compare responses and the decoy path.
2. Session of host A used on host B, or a subscription of another app served by the same customer email — tests for wrong-host 401 and app-filter 404.
3. Double click on Cancel → two Paddle calls; second must see the scheduled cancel (after inline sync) or Paddle's idempotent answer — test that an already-scheduled cancel makes no Paddle call.
4. Inline sync failure after Paddle succeeded must still answer 200 with Paddle's entity — test.
5. Shared host serving two apps lists both apps' subscriptions but never a third app's — `hostApps` test.

---

### Task 1: Migration 010 + `@ikf/paddle` cancel / clear methods

**Files:** Create `services/core-api/migrations/010_account.sql`; modify `packages/paddle/src/index.js`; tests in `packages/paddle/test/` (follow the existing client test file) and the core-api migration test if one lists migrations.

**Produces:** tables `account_otps`, `account_sessions` exactly as spec §1; `paddle.cancelSubscription(id, { effectiveFrom })` → `data('POST', '/subscriptions/<id>/cancel', { effective_from: effectiveFrom })` (only `'next_billing_period'` | `'immediately'`, else throw `TypeError`); `paddle.clearScheduledChange(id)` → `data('PATCH', '/subscriptions/<id>', { scheduled_change: null })`. Both use the existing `id()` path guard.

- [ ] Tests: each method's method/URL/body against a fake fetch; bad `effectiveFrom` throws; a malformed id is refused like `getSubscription`. Check how `request` retries: a POST must not be retried after a timeout if the client already distinguishes; if it retries every method, keep that behaviour and note it in the report.
- [ ] Migration applies on a fresh DB (core-api test helpers run all migrations).
- [ ] Commit `feat(paddle): subscription cancel and clear scheduled change; migration 010 account tables`.

### Task 2: Host scope, account OTP and sessions (`src/account/`)

**Files:** Create `services/core-api/src/account/scope.js`, `otp.js`, `session.js`; tests `services/core-api/test/account-otp.test.js` (Postgres via existing helpers — copy the setup of `test/otp*.test.js` or the nearest identity OTP test).

**Consumes:** `emailHash`, `sha256`, `randomToken`, `safeEqual` from `src/identity/tokens.js`.

**Produces:**
- `hostApps(db, host) → Promise<string[]>`: `domains.app_id` when the active domain has one; else `SELECT DISTINCT f.app_id FROM routes r JOIN funnels f ON f.id = r.funnel_id WHERE r.host = $1 AND f.app_id IS NOT NULL` (check the real `routes` columns in `001_publisher.sql` and adjust the join); inactive/unknown host → `[]`. Sorted.
- `brandFor(db, host, apps)`: the app's `name` when `apps.length === 1`, else `host`.
- `ACCOUNT_OTP_TTL_MINUTES = 10`, `ACCOUNT_OTP_MAX_ATTEMPTS = 5`, `ACCOUNT_OTP_MAX_PER_HOUR = 3`, `ACCOUNT_SESSION_MINUTES = 30`.
- `sendAccountOtp(pool, { host, apps, email, mailer, log })`: as `identity/otp.js sendOtp` (read it first and mirror its structure): rate count on `account_otps` (email_hash, host, last hour) → return silently at 3; buyers = `SELECT DISTINCT c.id FROM customers c JOIN subscriptions s ON s.customer_id = c.id JOIN funnels f ON f.id = s.funnel_id WHERE lower(btrim(c.email)) = $1 AND f.app_id = ANY($2)`; insert a row (decoy = empty `customer_ids`) with `code_hash = sha256(`${h}:${host}:${code}`)`; mail only when buyers exist, not awaited, errors logged as `account_otp_email_failed` with `err.code ?? err.name`. Mail: subject `Your ${brand} code: ${code}`, text + escaped html, "It expires in 10 minutes. If you did not ask for it, ignore this email." Mail `to` = the email of the newest buyer customer row.
- `verifyAccountOtp(pool, { host, email, code }) → { session, expires_at }`: first `DELETE FROM account_otps WHERE ctid IN (SELECT ctid … expires_at < now() - interval '1 day' LIMIT 500)` and the same for `account_sessions`; then in one transaction: latest row for (email_hash, host) with `used_at IS NULL AND expires_at > now()` `FOR UPDATE`; `attempts + 1`; fail (`HttpError(400,'invalid_code')`) when no row, `attempts > 5` after increment, empty `customer_ids`, or `!safeEqual(code_hash, expected)`; else `used_at = now()`, insert session `token_hash = sha256(token)`, `customer_ids`, `expires_at = now() + 30 min`. Code must match `/^\d{6}$/` else `invalid_code` without touching rows.
- `loadSession(db, { host, authorization }) → { customerIds, host }`: header must be `Bearer <TOKEN_RE>`; row by `token_hash`, `expires_at > now()`, `host` equal → else `HttpError(401,'session_expired')`.
- `endSession(db, { host, authorization })`: delete the row if it matches; never throws for a missing one.

- [ ] Tests: hostApps (domain app, shared host by routes with two apps, unknown/disabled host); send for buyer (row with ids + one mail) / stranger (decoy, no mail) / 4th in an hour (no row, no mail) / other-app-only buyer on this host = stranger; returned value identical in all; verify right code → session row with hashed token; wrong ×5 then right → invalid; expired; decoy; code from host A on host B; used code twice; loadSession wrong host / expired / malformed header; endSession.
- [ ] Commit `feat(core-api): account OTP and host-scoped sessions`.

### Task 3: Subscriptions list, cancel, resume (`src/account/subscriptions.js`)

**Files:** Create `services/core-api/src/account/subscriptions.js`; test `services/core-api/test/account-subscriptions.test.js`.

**Consumes:** Task 1 paddle methods; `syncMessage` from `src/billing/sync.js`; `audit` from `src/audit.js`.

**Produces:**
- `listSubscriptions(db, { customerIds, apps }) → item[]`; item = `{ id, plan, status, amount_minor, currency, current_period_end, cancel_at }` per spec §2 (amount from the latest `transactions` row of that subscription with `status IN ('paid','completed')` ordered by `billed_at DESC NULLS LAST`; `amount_minor` as a Number). `canceled` only when `canceled_at > now() - interval '90 days'`.
- `getOwnSubscription(db, { id, customerIds, apps }) → item & { app_id, raw_status, scheduled }` or throw `HttpError(404,'not_found')`.
- `cancelSubscription({ pool, paddle, log }, { id, customerIds, apps, host })` and `resumeSubscription(…)` per spec §3 table; after Paddle 2xx run `syncMessage({ pool, paddle, log }, { entity: 'subscription', entity_id: id })` in try/catch (`log.warn({ code }, 'account_sync_failed')`); then re-read with `getOwnSubscription`; if the sync failed, overlay Paddle's returned `status`, `scheduled_change` and `current_billing_period.ends_at` on the item. Paddle throws → `HttpError(502,'paddle_unavailable')` (log `account_paddle_failed` with `err.code ?? err.name`, never the message). Audit via `audit(pool, { kind: 'customer' }, 'account.cancel'|'account.resume', id, { host, effective }, { app_id })` — check `actorOf`/audit storage accepts this actor shape (if `actor` must be a string or `{kind,name}`, use `{ kind: 'customer', name: 'customer' }`). Logs `account_cancel` / `account_resume` with `{ subscription: id, host }`.

- [ ] Tests (fake paddle object recording calls; seed customers/funnels/apps/subscriptions/transactions directly): list filters by apps and customers, 90-day canceled rule, amount from latest paid txn, `cancel_at` from `scheduled_change`; every §3 row incl. no Paddle call for an already-scheduled cancel and `immediately` for `past_due`; other customer / other app → 404; Paddle error → 502 and no audit; sync failure → 200 with Paddle overlay; audit row written once per real change.
- [ ] Commit `feat(core-api): account subscriptions list, cancel and resume`.

### Task 4: HTTP plugin + wiring

**Files:** Create `services/core-api/src/http/account.js`; modify `services/core-api/src/app.js` (register when `deps.pool && deps.paddle && deps.turnstile && deps.mailer`); test `services/core-api/test/http-account.test.js` (follow `test/http-checkout*.test.js` for building the app with fake deps).

**Consumes:** Tasks 2–3; `allowedOrigin` from `src/billing/cors.js`; deps `previewBaseUrl`, `turnstile` (verify(token, ip) → `{ok}`; throws `TurnstileUnavailableError`).

**Produces:** routes of spec §2. `onRequest` hook: origin allowed and host ≠ preview host → else 403 `origin_not_allowed`; set `access-control-allow-origin`, `vary: origin`, `cache-control: no-store`; compute `req.accountHost`, `req.accountApps = await hostApps(pool, host)`; empty → 404 `account_unavailable` (after CORS headers). OPTIONS preflight for every path: methods `GET, POST`, headers `content-type, authorization`, max-age 600. Schemas: email string 3..254, `turnstile_token` 1..4096, code string maxLength 12, `:id` pattern `^sub_[a-z0-9]{26}$`. Turnstile: `!ok` → 400 `turnstile_failed`; unavailable → 503 `turnstile_unavailable` (look at how checkout maps it and copy). Turnstile `ip` = `cf-connecting-ip ?? req.ip`.

- [ ] Tests: CORS refused for unknown origin and for the preview host; preflight headers; send → 200 `{}` and turnstile failure codes; verify → session; list/cancel/resume/logout through real handlers with fake paddle; 401 without/with bad bearer; no-store on every answer incl. errors; unknown host with no apps → 404.
- [ ] Commit `feat(core-api): /v1/account routes`.

### Task 5: Claim email link + admin badge

**Files:** modify `services/core-api/src/identity/sync.js` (`claimEmail(app, link, { reusable, manageUrl })`, `sendClaimEmails` query reads `ck.client_url` and checks `domains` active), `services/core-api/src/identity/customers.js` (subscriptions select adds `CASE WHEN s.scheduled_change->>'action' = 'cancel' THEN s.scheduled_change->>'effective_at' END AS cancel_at`), `apps/admin/src/pages/CustomerDetail.jsx` (badge `Hủy cuối kỳ <date>` using the page's existing date formatter), the audit page's actor rendering if it would crash or print `[object Object]` for `{kind:'customer'}` (show "Khách hàng"); tests next to the existing ones for each.

- [ ] Tests: `claimEmail` with/without `manageUrl` (text and escaped html); `sendClaimEmails` passes `https://<host>/_ikf/account` only for an active-domain `client_url`, none for null or inactive; customer API returns `cancel_at`; SPA renders the badge; audit row with customer actor renders.
- [ ] Commit `feat: manage-subscription link in purchase email; admin shows scheduled cancel`.

### Task 6: Edge page `GET /_ikf/account`

**Files:** Create `workers/edge-router/src/account.js`; modify `workers/edge-router/src/index.js` (before the generic `/_ikf/` branch, same live-host check and 503 handling as `/_ikf/pay`); test `workers/edge-router/test/account.test.js` (follow the pay page test).

**Produces:** `accountConfig(env)` → `{ api: env.API_ORIGIN, sitekey: env.TURNSTILE_SITEKEY }` when `API_ORIGIN` matches `^https://[^/]+$` and sitekey set, else null → 404. `accountResponse(request, url, env)`: GET/HEAD only (else 405), headers `content-type: text/html; charset=utf-8`, `cache-control: no-store`, `x-robots-tag: noindex`, `referrer-policy: no-referrer`, CSP `default-src 'none'; script-src 'unsafe-inline' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; connect-src <api>; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'`. Page per spec §5: plain JS (ES2017, no build), config embedded with `JSON.stringify(cfg).replace(/</g,'\\u003c')`, every dynamic text through `textContent`, session in `sessionStorage` key `ikf_account`, `fetch(api + path, { credentials: 'omit' })`, Turnstile explicit render with `action: 'account'`, dates with `toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'})`, price `Intl.NumberFormat(undefined,{style:'currency',currency}).format(amount_minor/100)`. Data attributes for e2e: `data-ikf="email"`, `"send"`, `"code"`, `"verify"`, `"sub"` (card, with `data-id`), `"cancel"`, `"confirm-cancel"`, `"resume"`, `"status"` (the card's status line), `"signout"`, `"message"`.

- [ ] Tests: 404 on preview host / unrouted host / missing config; 405 on POST; headers incl. CSP containing the API origin; body contains the escaped config and no raw `</script` from config; HEAD has no body.
- [ ] Commit `feat(edge-router): self-care account page`.

### Task 7: Demo, e2e, docs

**Files:** `demo/lib/paddle-fake.mjs` (cancel: set `scheduled_change = {action:'cancel', effective_at: current_billing_period.ends_at, resume_at: null}` and emit `subscription.updated`; `immediately`: `status='canceled'`, `canceled_at`, emit `subscription.canceled`; PATCH with `scheduled_change: null`: clear and emit `subscription.updated`; new `endPeriod(subId)` applying a scheduled cancel → `canceled`), the fake's HTTP router (find where `/subscriptions/:id` GET is served and add the two routes), the demo panel (`demo/server/*`, add **Hết kỳ** next to Renew/Expire), demo edge env (`TURNSTILE_SITEKEY` is already set when billing is on — confirm; the page's Turnstile must pass in the demo: if the demo serves a fake Turnstile script for checkout, reuse it via the same URL override mechanism or add `TURNSTILE_JS_URL` like `PADDLE_JS_URL`, demo-only), `demo/test/account-e2e.test.mjs` (Playwright on its own ports/DB like `capi-e2e.test.mjs`): buy → `/_ikf/account` → code from the demo mailbox → cancel → "Ends on" + admin customer badge → resume → "Renews on" → cancel → panel Hết kỳ → "Canceled". Docs: runbook section "Trang tự hủy" in `docs/runbooks/` (where billing/identity runbooks live), `CLAUDE.md` one bullet under conventions, demo README line.

- [ ] Tests: fake Paddle unit tests for the three changes; e2e passes; full `npm test` green; SDK bundle unchanged.
- [ ] Commit `feat(demo): self-care cancel in the demo; e2e; runbook`.

# Self-care Cancel Page — Design Spec

> A buyer cancels (or un-cancels) their own subscription from a page on the funnel's domain, after proving their email with a 6-digit code. Code lives in `ikf-platform`, branch `feat/self-care-cancel`, cut from `feat/conversions-relay-capi` (PR #12). Scope chosen in chat on 2026-10-16 (OTP page of our own; cancel + resume); the user then asked for the rest to be decided without further check-ins, so every remaining choice below is a ruling.

**Goal:** a paying customer stops their renewal in under a minute without writing to support, keeps access until the end of the period they paid for, and can undo it before that date.

**Definition of done:**
- **Demo:** buy a Starlyn/witch-power subscription in the demo → open `/_ikf/account` on the funnel host (also linked from the purchase email) → enter email → read the code in the demo mailbox → see the plan → **Cancel** → page shows "Ends on <date>" and Admin › Customer shows "Hủy cuối kỳ" → **Keep my plan** → back to "Renews on <date>". The demo panel's "Hết kỳ" applies a scheduled cancel (status `canceled`, entitlement off). Playwright e2e covers this flow.
- **No enumeration:** `otp/send` answers the same for a buyer, a stranger and a rate-limited email; `otp/verify` answers `invalid_code` the same way for all of them.
- **No PII leak:** logs and audit hold no email, code, session token, `user_id` or `err.message`.
- **Old tests:** every existing test passes; the SDK bundle does not change.

## Decisions

| # | Item | Choice |
|---|---|---|
| 1 | Access | Our own page + email OTP (chosen in chat) |
| 2 | Scope | List subscriptions, cancel at period end, resume a scheduled cancel (chosen in chat). No invoices, pause, plan change or retention offer |
| 3 | Where | Edge-served page `GET /_ikf/account` on any live funnel host (same pattern as `/_ikf/pay`), calling core-api cross-origin at `API_ORIGIN` |
| 4 | Scope key | The **host**. A session and its codes belong to one host. The apps a host serves = `domains.app_id` if set, else the distinct `funnels.app_id` of the funnels routed on it. Subscriptions are shown only if their funnel's app is in that set (a shared host shows every app it serves) |
| 5 | Codes | New table `account_otps` (not `otp_codes`): app restore codes and account codes can never be swapped, and the existing OTP code stays untouched |
| 6 | Session | Opaque 32-byte token, only its sha256 stored, 30 min, bound to the host; sent as `Authorization: Bearer` (no cookie → no CSRF) and kept in `sessionStorage` |
| 7 | Bot guard | Turnstile on `otp/send` (action `account`), like checkout |
| 8 | Paddle | Cancel = `POST /subscriptions/{id}/cancel {effective_from:"next_billing_period"}` (`past_due` → `"immediately"`). Resume = `PATCH /subscriptions/{id} {scheduled_change:null}`. After a 2xx, core runs the normal billing `syncMessage` for that subscription inline so the page and admin update at once; the webhook then dedups as usual |
| 9 | Email link | The claim email gets "Manage your subscription: https://<host>/_ikf/account" when the checkout's `client_url` host is an active domain; otherwise the line is left out |
| 10 | Language | Customer-facing page and email in English (as the existing emails) |

## 1. Data — migration `010_account.sql`

```sql
CREATE TABLE account_otps (
  id           BIGSERIAL PRIMARY KEY,
  email_hash   TEXT NOT NULL,
  host         TEXT NOT NULL,
  customer_ids BIGINT[] NOT NULL DEFAULT '{}',  -- empty: decoy row for an email with no subscription here (never mailed, never verifies)
  code_hash    TEXT NOT NULL,                   -- sha256("<email_hash>:<host>:<code>")
  expires_at   TIMESTAMPTZ NOT NULL,            -- created_at + 10 min
  attempts     INT NOT NULL DEFAULT 0,          -- max 5
  used_at      TIMESTAMPTZ NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX account_otps_by_email ON account_otps (email_hash, host, id DESC);

CREATE TABLE account_sessions (
  token_hash   TEXT PRIMARY KEY,
  host         TEXT NOT NULL,
  customer_ids BIGINT[] NOT NULL,
  expires_at   TIMESTAMPTZ NOT NULL,            -- created_at + 30 min
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Expired rows (`expires_at < now() - interval '1 day'`) are deleted at the start of each `otp/verify`, limited to 500 rows per call.

## 2. core-api — `src/account/*` + `src/http/account.js`

Registered when `pool`, `paddle`, `turnstile` and `mailer` are present. All routes: CORS through the existing `allowedOrigin` **minus the preview host** (403 `origin_not_allowed`), `cache-control: no-store`, preflight allows `GET, POST` and headers `content-type, authorization`. The host is `new URL(Origin).hostname`.

`hostApps(db, host)` → `string[]`: as decision 4. Empty → every route answers `404 account_unavailable`.

| Route | Body | Answer |
|---|---|---|
| `POST /v1/account/otp/send` | `{email, turnstile_token}` | Always `200 {}` after Turnstile passes (`400 turnstile_failed`, `503 turnstile_unavailable`). At most 3 codes per (email_hash, host) per hour, then silently nothing. Buyer = customers whose `lower(btrim(email))` matches and who have ≥1 subscription whose funnel's app is in `hostApps`. Buyer and stranger run the same queries; a stranger gets a decoy row (empty `customer_ids`). Mail (not awaited): subject `Your <brand> code: 123456`, brand = app name when the host serves one app, else the host |
| `POST /v1/account/otp/verify` | `{email, code}` | Latest unused, unexpired row for (email_hash, host); `attempts + 1`; wrong code, no row, decoy, or `attempts > 5` → `400 invalid_code`. Right → `used_at = now()`, new session → `200 {session, expires_at}` |
| `GET /v1/account/subscriptions` | — | `{subscriptions:[{id, plan, status, amount_minor, currency, current_period_end, cancel_at}]}`. `plan` = `plan_key`; amount/currency = latest paid transaction of that subscription (null if none); `cancel_at` = `scheduled_change.effective_at` when `scheduled_change.action = 'cancel'`, else null. Statuses shown: `active`, `trialing`, `past_due`, `paused`, `canceled` (canceled only if `canceled_at` is within 90 days). Newest first |
| `POST /v1/account/subscriptions/:id/cancel` | — | See §3 → `200 {subscription}` (same shape as one list item) |
| `POST /v1/account/subscriptions/:id/resume` | — | See §3 → `200 {subscription}` |
| `POST /v1/account/logout` | — | Deletes the session → `204` |

Session check (every route but `otp/*`): `Authorization: Bearer <43 chars>`; row with that `token_hash`, `expires_at > now()`, same `host` → else `401 session_expired`. A subscription that is not one of the session's customers' or whose funnel's app is not in `hostApps(host)` → `404 not_found` (same body as missing).

## 3. Cancel and resume rules

| Current state | Cancel | Resume |
|---|---|---|
| `active`/`trialing`, no scheduled cancel | Paddle cancel `next_billing_period` | `409 nothing_to_resume` |
| `active`/`trialing`, cancel scheduled | `200` unchanged, no Paddle call | Paddle PATCH `scheduled_change: null` |
| `past_due` | Paddle cancel `immediately` | `409 nothing_to_resume` |
| `paused`, `canceled` | `409 not_cancelable` | `409 nothing_to_resume` |

- Paddle call fails → `502 paddle_unavailable` (page: "Something went wrong, try again"). The request is per click; no queue.
- After 2xx: `syncMessage({pool, paddle, log}, {entity: 'subscription', entity_id: id})`. If that sync throws, log `account_sync_failed` (code only) and answer from Paddle's returned entity; the webhook catches up.
- Audit: `account.cancel` / `account.resume`, actor `{kind: 'customer'}`, target = subscription id, details `{host, effective: 'next_billing_period'|'immediately'}`, `app_id` = the funnel's app.
- Logs: `account_cancel` / `account_resume` with subscription id and host only.

## 4. `@ikf/paddle`

Two client methods: `cancelSubscription(id, {effectiveFrom})` → `POST /subscriptions/{id}/cancel` and `clearScheduledChange(id)` → `PATCH /subscriptions/{id}` with `{scheduled_change: null}`. Both return `data`. Same timeouts/retries as other writes (POST is not retried on timeout; PATCH is idempotent).

## 5. Edge — `GET /_ikf/account`

Only on live funnel hosts (same check as `/_ikf/pay`), only when `API_ORIGIN` and `TURNSTILE_SITEKEY` are set (else 404). `GET`/`HEAD` only. Inline HTML+JS page, no external script but Turnstile, `x-robots-tag: noindex`, `cache-control: no-store`, CSP limited to self, `challenges.cloudflare.com` and `API_ORIGIN`.

Screens: **Email** (input + Turnstile + "Send code") → **Code** ("We sent a code to …", 6-digit input, "Resend") → **Plans** (one card per subscription: plan, price/period, "Renews on <date>" / "Ends on <date>" / "Payment overdue" / "Canceled"; button **Cancel subscription** with a confirm "You keep access until <date>" / **Keep my plan**) → "Sign out". `401` anywhere → back to Email with "Your session expired". No subscriptions → "We found no subscription for this email on this site."

## 6. Claim email

`claimEmail` gains an optional `manageUrl`; text and html add "Manage your subscription: <url>". `sendClaimEmails` reads the checkout's `client_url`, takes its origin if its host is an active domain, and passes `<origin>/_ikf/account`.

## 7. Admin console

Customer detail's subscription rows show a "Hủy cuối kỳ <date>" badge when `scheduled_change.action = 'cancel'` (the customer API returns `cancel_at`). The audit page shows the `account.*` actions with actor "Khách hàng".

## 8. Demo

- Fake Paddle: `POST /subscriptions/:id/cancel` and `PATCH /subscriptions/:id`, emitting `subscription.updated` (or `subscription.canceled` for `immediately`); new panel action **Hết kỳ** that applies a scheduled cancel (status `canceled`, period ended) and emits `subscription.canceled`.
- The demo edge has `TURNSTILE_SITEKEY` set to Cloudflare's always-pass test key; core's demo Turnstile verifier already passes.
- Playwright e2e `account-e2e`: buy → open `/_ikf/account` → code from demo mailbox → cancel → admin badge → resume → cancel → "Hết kỳ" → shows Canceled.

## 9. Testing

| Unit | What |
|---|---|
| `hostApps` | domain app set / shared host by routes / unknown host |
| OTP send/verify | buyer, stranger (decoy), rate limit, wrong code ×5 lockout, expired, cross-host code, same response shape |
| Sessions | expired, wrong host, logout |
| Subscriptions list | app filter, other customer's sub → 404, canceled > 90 days hidden, amount from latest paid txn |
| Cancel/resume | every row of the §3 table with a fake Paddle; Paddle error → 502; inline sync failure still 200; audit row |
| HTTP | CORS (preview host refused), schemas, no-store |
| `@ikf/paddle` | method/path/body of both calls |
| Edge | 404 off-route host / missing config, headers, page embeds config safely |
| Claim email | with and without `manageUrl` |
| Admin SPA | badge |
| Demo e2e | §8 |

## 10. Out of scope (later)

Retention/downgrade offer before cancel (P2), invoices, payment-method update (Paddle portal session), pause, a "subscription.cancel_removed" topic for app backends, a per-IP limit on `otp/send` beyond Turnstile.

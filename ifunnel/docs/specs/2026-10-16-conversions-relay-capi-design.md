# Conversions Relay — Meta CAPI — Design Spec

> Sends every Paddle payment to Meta through the Conversions API, so web funnel campaigns can optimise on real revenue. The code lives in the `ikf-platform` repo, on a new branch cut from `feat/admin-console-p4b` (PR #11). The design was approved in chat on 2026-10-16.

**Goal:** every successful payment, first purchase and renewal alike, reaches the Meta pixel of its funnel within 5 minutes as a `Purchase` with the real amount. It is sent once only, and with no unhashed PII. Checkout never waits on Meta.

**Definition of done:**
- **Demo:** buy one Starlyn purchase and one renewal. The fake Graph API receives 2 `Purchase` events with `event_id` = `paddle_transaction_id`, and the Conversions page of `starlyn` shows `sent`. When the fake server switches to errors, the next purchase moves to `dead` after its retries. "Gửi lại" then gets it to `sent`. Playwright e2e covers this flow.
- **Postgres concurrency:** two relay workers running against real Postgres never send the same `event_id` twice. Every `payment.succeeded` in the outbox from the last 7 days produces exactly one `capi_events` row.
- **No PII leak:** the body sent to Meta has no raw email. Logs and audit have no email, IP, user-agent, `user_id`, token or `err.message`.
- **Old tests:** every existing test passes, and the SDK bundle grows only by the `ads_consent` field.

## Decisions (2026-10-16, approved)

| # | Item | Choice |
|---|---|---|
| 1 | Scope | **Meta CAPI only.** Adjust S2S waits until the claim step carries the adid (later round) |
| 2 | Events | **Every successful charge** → `Purchase`, `event_id = paddle_transaction_id`, value = amount actually charged. No StartTrial, no refund sent to Meta |
| 3 | CAPI token | **Per app** (a Business Manager system-user token that owns the app's pixels), entered in the app's Settings, stored in Secrets Manager |
| 4 | Approach | Postgres delivery table (`capi_events`) + two ticks inside core-api, same pattern as `webhook_deliveries`; `dead` = DLQ. No new SQS/Terraform queue |
| 5 | Reading the outbox | Anti-join over the last 7 days (`UNIQUE (outbox_id)`), no cursor; entitlement's `published_at` stays untouched |
| 6 | Consent | Consent required but not granted (EU…) → `skipped no_consent`, nothing sent |
| 7 | IP/UA | Stored on the checkout for **30 days**, then cleared; later renewals are sent without IP/UA |
| 8 | Skip order (amended after the final review, 2026-10-16) | `no_app`, `no_pixel`, `no_consent`, `zero_value` ($0 trial transactions), `no_token`, `too_old`: permanent reasons first, so entering a token later never sends a non-consented or $0 purchase. An event is `website` only with both page URL and user-agent, otherwise `system_generated` |

## 1. Data — migration `009_capi.sql`

```sql
ALTER TABLE apps ADD COLUMN capi_token_last4  TEXT NULL;
ALTER TABLE apps ADD COLUMN capi_token_set_at TIMESTAMPTZ NULL;
ALTER TABLE apps ADD COLUMN capi_test_code    TEXT NULL CONSTRAINT apps_capi_test_code_check CHECK (capi_test_code ~ '^TEST[0-9A-Za-z]{1,20}$');

ALTER TABLE checkouts ADD COLUMN client_ip  TEXT NULL;   -- cleared 30 days after created_at
ALTER TABLE checkouts ADD COLUMN client_ua  TEXT NULL;   -- max 512 chars; cleared together with client_ip

CREATE TABLE capi_events (
  id              BIGSERIAL PRIMARY KEY,
  outbox_id       BIGINT NOT NULL UNIQUE REFERENCES outbox (id),
  event_id        TEXT NOT NULL UNIQUE,                  -- = paddle_transaction_id
  app_id          TEXT NULL REFERENCES apps (id),        -- NULL: funnel not assigned to an app
  funnel_id       BIGINT NULL REFERENCES funnels (id),
  pixel_id        TEXT NULL,                             -- funnel pixel at the time the row was created
  value_minor     BIGINT NOT NULL,
  currency        TEXT NOT NULL,
  event_time      TIMESTAMPTZ NOT NULL,                  -- billed_at, else outbox.created_at
  status          TEXT NOT NULL DEFAULT 'pending'
                    CONSTRAINT capi_events_status_check CHECK (status IN ('pending', 'sent', 'skipped', 'dead')),
  skip_reason     TEXT NULL
                    CONSTRAINT capi_events_skip_check CHECK (skip_reason IN ('no_app', 'no_pixel', 'no_consent', 'zero_value', 'no_token', 'too_old')),
  attempts        INT NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_error      TEXT NULL,                             -- Meta error code/subcode or 'http_<status>' / 'network'; never a message
  test_code       TEXT NULL,                             -- test_event_code used when it was sent
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at         TIMESTAMPTZ NULL
);
CREATE INDEX capi_events_due    ON capi_events (next_attempt_at, id) WHERE status = 'pending';
CREATE INDEX capi_events_by_app ON capi_events (app_id, id DESC);
CREATE INDEX outbox_payment_recent ON outbox (created_at, id) WHERE topic = 'payment.succeeded';
```

- The token is **never in Postgres**. It lives in Secrets Manager at `ikf/<env>/app-capi/<app_id>`, the same way as `app-webhook/<id>`. Postgres only keeps the last 4 characters and the time it was set.
- `capi_events` never holds an email, IP, UA, fbc or fbp. The relay reads them from `customers`/`checkouts` at send time.

## 2. Relay — `services/core-api/src/conversions/`

**Tick 1: `enqueue`** (every 15s, batch 200, inside one transaction)
- Selects `payment.succeeded` outbox rows where `created_at > now() - 7 days` and no `capi_events` row exists (`LEFT JOIN … IS NULL`), ordered by id with `FOR UPDATE OF o SKIP LOCKED`.
- Inserts with `ON CONFLICT (outbox_id) DO NOTHING`.
- How the row is filled:
  - **Funnel:** by `payload.funnel` (slug) → `funnels.id`, `app_id`, `pixel_id`.
  - **Amount:** `value_minor`/`currency` come from the payload, the same number as the Dashboard revenue.
  - **`event_time`:** `transactions.billed_at`, else `outbox.created_at`.
- When the row is `skipped` at creation:

  | Reason | When |
  |---|---|
  | `no_app` | Funnel unknown, or `app_id` NULL |
  | `no_pixel` | `pixel_id` NULL |
  | `no_token` | App has `capi_token_set_at` NULL |
  | `no_consent` | The checkout has `attribution.ads_consent = 'denied'` or `'unknown_required'` |
  | `too_old` | `event_time` older than 7 days (Meta rejects it) |

**Tick 2: `send`** (every 10s)
- Takes `pending` rows with `next_attempt_at <= now()` (SKIP LOCKED, up to 200) and groups them by `(app_id, pixel_id)`. Each group is one POST of up to 50 events: `POST {META_GRAPH_URL}/{pixel_id}/events`, with the token in the `access_token` form field, never in the query string or logs. When the app has a `capi_test_code`, the body adds `test_event_code`.
- **Locking:** the HTTP call runs **outside** the transaction that holds the rows. The tick first claims the rows by setting `next_attempt_at = now() + 2 minutes` and `attempts = attempts + 1`, commits, sends, then writes the result. A worker that dies mid-send lets the rows come back after 2 minutes. Meta deduplicates by `event_id` + `event_name` (48h), so a resend after a crash is not counted twice.
- Building one event:
  - **Event fields:**
    - `event_name: 'Purchase'`;
    - `event_id`;
    - `event_time` (epoch seconds);
    - `action_source: 'website'`;
    - `event_source_url` = `https://<host>/<slug>` of the original checkout, when known.
  - **`custom_data`:**
    - `value = value_minor / 10^d`, where `d = 0` for `JPY`, `KRW` and `d = 2` for everything else;
    - `currency`;
    - `content_ids: [<funnel slug>]`;
    - `content_type: 'product'`.
  - **`user_data`:**
    - `em: [sha256(lower(trim(email)))]` when the customer has an email;
    - `external_id: [sha256('ikf:' + customers.id)]`;
    - `fbc`, `fbp`;
    - `client_ip_address`, `client_user_agent` while they are still there.
  - **Attribution source:** the checkout by `transactions.checkout_id`. A renewal has no checkout, so it uses the earliest transaction of the same `paddle_subscription_id` that has a `checkout_id`. With no checkout found, the event is sent with `em` + `external_id` only.
- **Results:**

  | Outcome | What happens |
  |---|---|
  | 200 | Every event in the batch becomes `sent`, `sent_at = now()`, with `test_code` noted |
  | 401/403, or Meta error `code 190` (bad/expired token) | Group goes `dead` with `last_error`; alarm `capi_token_invalid {app_id}` once per app per hour; token cache dropped |
  | Other 400 (bad payload) | The group goes `dead` immediately |
  | 429, 5xx, timeout (10s), network | `next_attempt_at` by attempt: 1m, 5m, 30m, 2h, 6h; after attempt 6 → `dead` |

- **Token:** read through `secrets.get('app-capi/<id>')` and cached 10 minutes. On a cache miss with no secret, the row becomes `skipped no_token`.
- **Logs:** only `{app_id, pixel_id, count, status, error_code}`. Never the body, token, email, IP, UA or `err.message`.

**Tick 3: `sweep`** (hourly)
- `UPDATE checkouts SET client_ip = NULL, client_ua = NULL WHERE created_at < now() - 30 days AND client_ip IS NOT NULL` (in batches of 1000).

**Startup:** the relay starts only when `META_GRAPH_URL` is set and the secrets client is available. Otherwise core-api logs `conversions disabled, missing: …`, the same way identity does. `capi_events` simply waits; the 7-day window still applies when it comes back.

**When a token is entered:** `PUT /v1/apps/:id/capi` with a new token turns that app's `skipped no_token` rows from the last 7 days back into `pending` (`attempts = 0`, `next_attempt_at = now()`), in the same transaction as the `apps` update.

## 3. Checkout and SDK

- **SDK:** `attribution()` adds `ads_consent`:
  - `'granted'` when consent is not required or was granted;
  - `'denied'` when it was refused;
  - `'unknown_required'` when it is required and the visitor has not answered yet.
  
  This is a single field, and the bundle must stay under the current budget.
- **`cleanAttribution`:** keeps `ads_consent` only when it is one of the 3 values. A missing value is treated as `'granted'` for checkouts made before this change. Those come from older bundles that did not ask, the same as the browser Pixel behaved then.
- **`POST /v1/checkout`:** stores `client_ip` (the IP Fastify already uses for Turnstile) and `client_ua` (the `user-agent` header, cut to 512 characters) on the new checkout.

## 4. API, admin console, CLI

**Routes** (per-app permissions from đợt 4b; out of scope means GET → 404 and writes → 403)

| Route | Permission | Notes |
|---|---|---|
| `GET /v1/apps/:id/capi` | viewer in the app | `{token_last4, token_set_at, test_code, counts_24h: {sent, skipped, dead, pending}, pixel_funnels_without_token}` |
| `PUT /v1/apps/:id/capi` `{token?, test_code?}` | admin in the app | `token: string` sets/replaces it (put to Secrets Manager first, then the row); `token: null` removes it (secret deleted, row cleared); `test_code: null` clears it. Audit `app.capi_token` `{action: 'set'|'clear', last4}` / `app.capi_test_code` `{test_code}` |
| `GET /v1/capi-events?app=<id>&status=&before=` | viewer in the app | 50 rows per page, newest first: `{id, event_id, funnel, value_minor, currency, event_time, status, skip_reason, attempts, last_error, test_code, sent_at}` |
| `POST /v1/capi-events/:id/resend` | admin in the event's app | Only `dead` rows: back to `pending`, `attempts = 0`, `next_attempt_at = now()`. Any other status → `409 not_dead`. Audit `capi.resend` |

- The token is validated as 20–400 characters of `[A-Za-z0-9_-]` (`400 invalid_token`). Core-api never returns it, and a token response always shows only `last4`.
- `GET /v1/apps/:id/summary` gains `capi: {configured, dead_24h}` for the app overview warning.

**SPA**
- **Settings tab "Meta CAPI":**
  - Token field (password type) with "Lưu" and "Xoá token" (confirm); `••••abcd · đặt lúc …`.
  - Test code field with an explanation: "Khi có test code, sự kiện chỉ hiện ở Test Events, không vào số liệu thật."
  - Editable by an app `admin`; everyone else sees it read-only.
- **Conversions page** (`/apps/:id/conversions`, in the app menu):
  - The 24h counts, a status filter and the table above.
  - The skip reason shown in Vietnamese ("Funnel chưa có pixel", "App chưa có token", "Khách không đồng ý quảng cáo", …).
  - A "Gửi lại" button on `dead` rows for an app admin.
- **App overview** shows a warning:
  - "Có funnel gắn pixel nhưng app chưa có token CAPI — Purchase chưa gửi về Meta." when `pixel_funnels_without_token > 0`;
  - "N sự kiện CAPI lỗi trong 24h" when `dead_24h > 0`, linking to Conversions?status=dead.

**CLI**
- `ikf capi status --app <id>`: counts by status in 24h and the 10 most recent `dead` rows with their error codes.
- `ikf capi token set <app>`: reads the token from stdin (`echo $TOKEN | ikf capi token set starlyn`) and errors when stdin is a TTY with nothing piped. `ikf capi token clear <app>`. `ikf capi test-code <app> <code|off>`.
- `ikf capi resend <id>`.
- Readable messages for `invalid_token`, `not_dead`, `forbidden` and `not_found`.

## 5. Config, infra, demo, tests, out of scope

- **Config:** `META_GRAPH_URL`, default `https://graph.facebook.com/v21.0`. Changing the Graph version is a config change, not a code change.
- **Terraform:** IAM for the core-api task gets `secretsmanager:PutSecretValue/CreateSecret/DeleteSecret/GetSecretValue` on `ikf/<env>/app-capi/*`. No new queue. Do not `apply`; the user runs it.
- **Demo:**
  - `demo/fake-graph` is a small HTTP server that records requests, has a mode switch (`ok` / `error500` / `token_invalid`) and its own port.
  - Seed: Starlyn has a token and test code; one purchase plus one renewal (a simulated Paddle webhook for `subscription_recurring`).
  - The e2e uses its own ports and its own DB, like 4a/4b.
  - The runbook gets a "Meta CAPI" section: create the system-user token, assign the pixel, enter the token, test with a test code, remove the test code.
- **Tests:**
  - **Unit:**
    - `buildEvent`: hashing after trim/lowercase, value for JPY/KRW/USD, renewal attribution, no checkout, IP/UA cleared.
    - The enqueue skip reasons.
    - The backoff table.
    - Error classification (`190` → dead + alarm, 5xx → retry, 400 → dead).
  - **Integration (Testcontainers Postgres):**
    - Anti-join, 7-day window, `ON CONFLICT`.
    - Two `send` workers in parallel with a barrier: each `event_id` is POSTed once.
    - A crash mid-send means the row returns after 2 minutes.
    - Entering a token revives `no_token` rows.
    - The 30-day sweep.
  - **Permissions table:** 3 user kinds (global, admin of A, viewer of A) × the 4 new routes, plus the `capi` field of `/summary`.
  - **Leak guard:** the captured logs contain no email, IP or token, and the body sent to the fake Graph has no raw email.
  - **SPA and CLI tests:** for the new pages and commands.
  - **e2e:** the flow in "Definition of done".
- **Out of scope:**
  - Adjust S2S, which needs the adid in the claim contract with the mobile team.
  - StartTrial / Lead / InitiateCheckout from the server.
  - Sending refunds or chargebacks to Meta.
  - Browser `Purchase` + dedup.
  - pLTV / predicted value.
  - A per-funnel or per-pixel token.
  - Retroactive sending of payments older than 7 days.

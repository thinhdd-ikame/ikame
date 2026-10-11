# iKame Funnel Platform — Billing (Paddle) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** User mua gói subscription hoặc add-on một lần ngay trong funnel bằng Paddle.js inline (overlay), kể cả trong in-app browser FB/IG/TikTok (có trang dự phòng `/_ikf/pay`). Core lưu đúng khách hàng, giao dịch, subscription; mỗi lần chuyển trạng thái ghi **đúng một** dòng `outbox`. Email không bao giờ nằm trên URL, trong event hay ClickHouse.

**Architecture:**
- **`@ikf/paddle`** (mới, Node): client Paddle Billing API (Bearer key, timeout 10s, retry 2 lần với 5xx/429/mạng, sandbox/live) + `verifyWebhook` (HMAC-SHA256 trên `${ts}:${rawBody}`, lệch ≤ 300s) + `signWebhook` cho test/e2e.
- **`core-api` module billing** (sửa): `PUT/GET /v1/funnels/:slug/prices`, `POST /v1/checkout` (CORS theo `domains` + preview host, Turnstile Siteverify, Paddle `POST /transactions`), `GET /v1/checkout/:id`, `POST /v1/paddle/webhook` (raw body, chữ ký, `webhook_inbox`, SQS), `POST /v1/billing/reconcile`, `GET /v1/billing/outbox`. Worker **`billing-sync`** chạy cùng process: long-poll SQS `ikf-<env>-webhooks`, đọc lại trạng thái mới nhất từ Paddle, một transaction Postgres/message, ghi `outbox` (khóa `dedupe_key` UNIQUE).
- **`@ikf/sdk`** (sửa): bắt `checkout_click` → Turnstile (`interaction-only`) → `POST {api}/v1/checkout` → nạp Paddle.js v2 động (không bundle) → `Checkout.open({transactionId})`; `checkout.completed` → `IkFunnel.completePurchase(plan)`; chặn chuyển trang sang `checkoutUrl`; `?ikf_paid=` chỉ tin sau khi core trả `completed`.
- **Worker `edge-router`** (sửa): `__IKF.paddle = {env, clientToken}`, `__IKF.turnstile`, `__IKF.api`; trang `GET /_ikf/pay?txn=&ret=` (ret cùng host).
- **CLI** (sửa): `ikf funnel prices set|ls`, `ikf billing reconcile --since`, `ikf billing outbox ls`, `ikf publish` cảnh báo plan chưa map giá.
- **Infra** (sửa): secret `paddle-client-token`, rate limit `/v1/checkout` 10/phút/IP, webhook không bị rate limit, ECS env `PADDLE_ENV` + `ALARM_TOPIC_ARN`, `sns:Publish`, Turnstile cho cả funnel host.

**Tech Stack:** Node.js 22 trên CI (local Node 26) · JavaScript ESM · npm workspaces · Fastify 5 · `pg` 8 · `@aws-sdk/client-sqs` + `@aws-sdk/client-sns` v3 · Vitest ~3.2 · happy-dom 20 · esbuild 0.25 · `@cloudflare/vitest-pool-workers` ^0.12.0 · `@testcontainers/postgresql` 11 · `@playwright/test` ~1.63 · Terraform + Cloudflare provider `~> 5.0` + AWS provider.

**Spec:** `ifunnel/docs/specs/2026-10-09-billing-paddle-design.md`. Xây trên plan `ifunnel/docs/plans/2026-10-08-runtime-sdk-collector.md`.

**Repo / nhánh:** code nằm trong `/Users/daothinh/ikf-platform`, nhánh mới `feat/billing-paddle` cắt từ `feat/runtime-sdk-collector` (HEAD `053769a`). Task 1 tạo nhánh.

**Môi trường chạy test (local):**
```bash
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock          # Docker qua colima
export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock     # cho Testcontainers (Postgres)
export TF_PLUGIN_CACHE_DIR=$HOME/.terraform.d/plugin-cache            # Terraform
```
actionlint: `docker run --rm -v "$PWD:/repo" -w /repo rhysd/actionlint:latest`.

Số test ghi ở mỗi task là số **thật** khi chạy toàn bộ code của plan này trên bản sao `feat/runtime-sdk-collector@053769a` (Node 26, colima). Mốc ban đầu: core-api 104, sdk 109, cli 70, edge-router 77.

## Điều chỉnh so với spec (phát hiện khi khảo sát 69 `demo.html`, Paddle API và code hiện có, 2026-10-09)

| # | Spec | Plan làm | Lý do |
|---|---|---|---|
| B1 | `POST /transactions` với `customer: {email}` | Core gọi `POST /customers {email}`; `409 customer_already_exists` → lấy `ctm_…` trong `detail`; rồi tạo transaction với `customer_id`. Không lấy được id → tạo transaction **không** có customer (user nhập email trong form Paddle) | Paddle Billing API không nhận `customer: {email}` ở `POST /transactions`, chỉ nhận `customer_id`. Client có thêm `createCustomer`, `getCustomer` |
| B2 | Worker đọc `GET /transactions/{id}` | `GET /transactions/{id}?include=customer,adjustments`; message subscription thì gọi thêm `GET /customers/{id}` | Cần email cho `customers` và danh sách adjustment để ghi refund/chargeback |
| B3 | "Mỗi lần chuyển trạng thái ghi đúng một dòng outbox" | Thêm cột `outbox.dedupe_key TEXT UNIQUE`, `INSERT … ON CONFLICT (dedupe_key) DO NOTHING`. Key: `<topic>:<sub>:<paddle updated_at>`, `payment.succeeded:<txn>`, `payment.refunded:<adj>`, `payment.chargeback:<adj>` | Bảo đảm ở tầng DB, kể cả khi hai worker chạy song song hoặc code có lỗi |
| B4 | Refund/chargeback "được duyệt" | Refund: `action='refund'` **và** `status='approved'`. Chargeback: `action='chargeback'` (mọi status trừ `rejected`). Mỗi adjustment ghi một lần (B3), **không** phụ thuộc guard `updated_at` của transaction | Adjustment không chắc làm đổi `updated_at` của transaction gốc → guard sẽ bỏ sót refund |
| B5 | `checkouts.status = 'completed'` khi có `custom_data.checkout_id` | Chỉ khi transaction ở `paid` hoặc `completed`, và khớp `checkouts.paddle_transaction_id`. Transaction `canceled` → checkout `created` thành `abandoned` | `transaction.created` cũng mang `custom_data`; Paddle báo `paid` trước `completed` vài giây — SDK đang poll tối đa 20s |
| B6 | Bảng chuyển trạng thái subscription | Thêm `paused → active/trialing` = `subscription.resumed`. `(chưa có) → past_due/paused/canceled` chỉ ghi topic của dòng "bất kỳ → …" nếu có | Entitlement (spec sau) cần biết khi subscription chạy lại; spec không có dòng này |
| B7 | SDK phát `purchase_complete {plan, checkout_id}` | SDK phát **`checkout_complete {plan, checkout_id}`**; `purchase_complete` để funnel tự phát | 44/44 `completePurchase` trong funnel đã `emit('purchase_complete', …)` → đếm đôi. Lưu ý: bộ lọc PII (`@ikf/event-schema`, ≥ 7 chữ số liền) có thể bỏ `checkout_id` ở số ít ULID; nguồn chuẩn vẫn là `outbox` |
| B8 | "SDK chặn mọi lần funnel chuyển trang sang `checkoutUrl`" | SDK đặt rỗng mọi giá trị `window.IkFunnel.config.checkoutUrl` (ngay khi chạy, lúc `DOMContentLoaded`, trước mỗi event) và gỡ `#demock` (sheet "Demo checkout" có nút Pay giả) khi mở Paddle | Không chặn được `location.href = …`; 49/69 funnel lộ `config: CONFIG` (cùng object) qua `IkFunnel`. 26 funnel hiện sheet demo khi `checkoutUrl` rỗng — nút "Pay" của nó gọi `completePurchase` không cần trả tiền |
| B9 | "Không tin `?paid=`" | Khi có `__IKF.paddle`, SDK **xóa `paid` khỏi URL** (`history.replaceState`) trước khi script funnel chạy; `ikf_paid` cũng bị xóa sau khi đọc | 54 funnel tự đọc `?paid=` để mở khóa; SDK chạy trước script funnel (chèn ngay sau `__IKF`) |
| B10 | Turnstile "chế độ ẩn" | Giữ widget `managed` sẵn có, SDK render với `appearance: 'interaction-only'`; widget thêm hostname funnel (`funnel_domains`) | Chỉ hiện khi Cloudflare cần tương tác, không cần widget/secret thứ hai. Widget cũ chỉ cho zone platform → Siteverify từ chối token trên domain funnel |
| B11 | Core kiểm tra Turnstile | Thêm: `hostname` của Siteverify phải trùng host của `Origin` | Token lấy từ trang khác không dùng lại được |
| B12 | `ikf billing reconcile` "gọi Paddle, so DB, đẩy SQS" | CLI gọi `POST /v1/billing/reconcile {since_seconds}` (quyền `admin`), core làm phần còn lại; `ikf billing outbox ls` gọi `GET /v1/billing/outbox` | CLI không giữ Paddle API key, DB hay quyền SQS |
| B13 | `/_ikf/pay?txn=&ret=`, trả tiền xong "chuyển về `ret` kèm `?ikf_paid=`" | SDK đặt sẵn `ikf_paid=<checkout_id>` vào `ret`; trang pay chỉ `location.replace(ret)` | Trang pay không cần biết `checkout_id`; URL giữ đúng dạng spec |
| B14 | Thông báo lỗi trong SDK ("Không xác minh được, thử lại"…) | Chữ tiếng Anh: `We couldn't verify you. Try again.`, `Open in browser`, `Confirming your payment, please wait...` | Funnel bán cho thị trường US, toàn bộ copy funnel là tiếng Anh |
| B15 | Rate limit `/v1/checkout` 10/phút | Tách `/v1/checkout` khỏi rule API cũ (5/10s) thành rule thứ 3: `period = 60`, `requests_per_period = 10`. Webhook `/v1/paddle/webhook` không nằm trong rule nào (có test) | Zone platform cần gói cho ≥ 3 rule rate limit và period 60s (Task 0) |
| B16 | "cho phép IP Paddle gọi webhook" | Không lọc IP; webhook không bị rate limit, an toàn dựa trên chữ ký | IP Paddle khác nhau giữa sandbox/live và có thể đổi; chữ ký + `ts` đủ chặn giả mạo |
| B17 | Alarm `paddle_auth_failed` "tối đa 1 lần / 15 phút" | SNS qua `@aws-sdk/client-sns`, chặn tần suất bằng Redis `SET alarm:<kind> NX EX 900`, Redis lỗi thì chặn trong bộ nhớ của task | Nhiều task ECS dùng chung một cửa sổ 15 phút |
| B18 | `ikf publish` cảnh báo "key trong `CONFIG.plans`" | Lấy key ở cả `plans:{…}` và `checkoutUrl:{…}` (gồm `addon`) | `addon` chỉ có trong `checkoutUrl`, không có trong `plans` |
| B19 | Mọi env có đủ 3 rule rate limit (chốt sau khi viết plan, 2026-10-09) | Module `edge` thêm biến `ratelimit_full = bool` (mặc định `true`). `false` → ruleset `http_ratelimit` của zone platform chỉ còn **một** rule: `/v1/checkout` (60s / 10). Stack truyền `ratelimit_full = var.env == "prod"`. Rule `/_ikf/c` trên các zone funnel (module `funnel-domains`, mỗi zone 1 rule) giữ nguyên ở mọi env | Zone platform prod dùng gói Business (3 rule); staging giữ gói Free (1 rule) để không tốn thêm. Kiểm tra k6 giới hạn `/_ikf/c` của zone platform làm trên prod lúc pilot |

## Global Constraints

- Code trong repo `ikf-platform`, nhánh `feat/billing-paddle`. HTML funnel **không sửa**.
- Không bao giờ làm hỏng funnel: mọi đường billing trong SDK bọc `try/catch`; lỗi checkout chỉ phát `checkout_error {reason}` và hiện thông báo, funnel vẫn chạy.
- **Email**: chỉ đi trình duyệt → body `POST /v1/checkout` → Paddle (`POST /customers`). Không nằm trong `checkouts`, `outbox`, event, log, URL. Chỉ lưu ở `customers.email`.
- **Paddle API**: base `https://sandbox-api.paddle.com` (staging) / `https://api.paddle.com` (prod), `Authorization: Bearer <paddle-api-key>`, timeout **10s** mỗi lần, retry **2** lần với 5xx/429/mạng/timeout (chờ 500ms, 1000ms). 401/403 → `paddle_auth_failed` + alarm. Endpoints dùng: `POST /transactions`, `GET /transactions/{id}?include=customer,adjustments`, `GET /transactions?updated_at[GT]=…&order_by=updated_at[ASC]&per_page=200` (theo `meta.pagination.next`), `GET /subscriptions/{id}`, `GET /prices/{id}`, `GET /discounts/{id}`, `GET /customers/{id}`, `POST /customers`.
- **Webhook**: `POST /v1/paddle/webhook`, body thô **≤ 1MB** (`1048576`, lớn hơn → `413`), header `Paddle-Signature: ts=<unix>;h1=<hex>`, HMAC-SHA256(`<ts>:<rawBody>`, `paddle-webhook-secret`), so sánh hằng thời gian, `|now − ts| ≤ 300s`; sai → `401 invalid_signature`, log không kèm body. Inbox + SQS trong một transaction DB; lỗi → `503`.
- **SQS** `ikf-<env>-webhooks`: message `{"event_id","event_type","entity":"subscription"|"transaction","entity_id"}`; `adjustment.*` → transaction gốc. Worker: `WaitTimeSeconds 20`, `MaxNumberOfMessages 10`, visibility **60s**, `maxReceiveCount 5` → DLQ `ikf-<env>-webhooks-dlq` (alarm có sẵn).
- **Worker**: đọc Paddle trước, rồi **một** transaction Postgres/message: `SELECT … FOR UPDATE`, bỏ qua nếu `updated_at` Paddle **không lớn hơn** `paddle_updated_at`, upsert, outbox, `webhook_inbox.processed_at`. `attempts` tăng ngoài transaction (đếm cả lần lỗi). Lỗi → không xóa message.
- **Outbox**: đúng một dòng mỗi lần chuyển (`dedupe_key` UNIQUE). Topic: `subscription.activated|converted|past_due|recovered|paused|resumed|canceled|cancel_scheduled`, `payment.succeeded|refunded|chargeback`. Spec này chỉ ghi, không đọc.
- **Checkout API**: `POST /v1/checkout` body `{funnel, v, plan, sid, email?, attribution?, turnstile_token}` (≤ 16KB) → `201 {checkout_id, transaction_id}`; `403 origin_not_allowed|turnstile_failed`, `404 funnel_not_found`, `422 plan_not_mapped`, `503 paddle_unavailable|turnstile_unavailable`. `GET /v1/checkout/:id` → `{checkout_id, status, plan}`. CORS: `Origin` phải là `https://<host>` với host trong `domains` `active` hoặc preview host.
- **Rate limit Cloudflare**: `/v1/checkout` **10 request / 60 giây / IP**; `/v1/paddle/webhook` không bị rate limit.
- **SDK**: ≤ **8192** byte gzip (có test). Paddle.js `https://cdn.paddle.com/paddle/v2/paddle.js` và Turnstile `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit` nạp động, mỗi script một lần. Retry `/v1/checkout` 1 lần sau **1s** (503/mạng); Turnstile thử lại 1 lần. `ikf_paid`: `GET /v1/checkout/<id>` mỗi **2s**, tối đa **20s**; chỉ `status == 'completed'` mới gọi `completePurchase`. Không chạy ở preview.
- **`__IKF`** = `{funnel, v, rev, country, pixel, preview?, paddle?: {env, clientToken}, turnstile?, api?}`; ba khóa billing chỉ có khi Worker có đủ `PADDLE_ENV`, `PADDLE_CLIENT_TOKEN`, `TURNSTILE_SITEKEY`, `API_ORIGIN` (https) và không phải preview.
- **Ngân sách SDK**: hiện 5438 byte gzip; sau Task 10 là 7516, sau Task 11 là 7791 (≤ 8192).
- **Môi trường**: staging = Paddle **sandbox**, prod = **live**. Secret theo env trong Secrets Manager: `paddle-api-key`, `paddle-webhook-secret`, `paddle-client-token` (mới), `turnstile-secret`. Không có giá trị secret trong Terraform hay git.

## Review Focus

1. **Webhook trùng / sai thứ tự / muộn làm ghi outbox hai lần**: Paddle gửi lại, gửi `subscription.updated` trước `subscription.created`, hai worker nhận cùng entity. Test: Task 7 (`replaying every message in any order, twice, gives the same rows and one outbox row per transition`, `a late message for an older state writes nothing`, `two workers racing on a new subscription write it once`), Task 6 (`a duplicate event_id is acknowledged without a second SQS message`).
2. **Mở khóa bằng URL giả** (`?paid=`, `?ikf_paid=` tự gõ, nút "Pay" của sheet demo): Test: Task 11 (`ikf_paid: completePurchase only after core says completed`, `a forged ikf_paid that never completes never unlocks`, `strips ?paid= before the funnel can read it`), Task 10 (`removes the demo checkout sheet when Paddle opens`), Task 5 (`GET /v1/checkout/:id returns status and plan only`).
3. **Email lọt ra URL / event / ClickHouse / log**: Test: Task 5 (`email goes to Paddle only: not stored in checkouts, not logged`), Task 10 (`blocks navigation to checkoutUrl`, `email goes only in the /v1/checkout body`), Task 13 (không request nào ngoài `/v1/checkout` chứa email).
4. **Chữ ký webhook sai vì body bị parse/serialize lại**: Test: Task 1 (`rejects a re-serialized body`), Task 6 (`verifies the exact bytes: a re-serialized body is 401`, `accepts a validly signed body that JSON.parse would reformat`).
5. **Worker chết giữa chừng / Paddle lỗi**: phải rollback toàn bộ và chạy lại cho đúng một outbox. Test: Task 7 (`a crash after the outbox insert rolls everything back; the redelivery writes it once`, `Paddle down: throws, nothing written`), Task 6 (`a failing handler leaves the message for redelivery`, `stop() ends the long poll`).

## File Structure (repo `ikf-platform`, phần mới/sửa)

```
ikf-platform/
├── packages/
│   ├── paddle/                                 # MỚI: @ikf/paddle
│   │   ├── package.json, src/index.js          # createPaddleClient, PaddleError, verifyWebhook, signWebhook
│   │   └── test/{client,webhook}.test.js
│   ├── sdk/
│   │   ├── src/checkout.js                     # MỚI: Turnstile → /v1/checkout → Paddle.js, ikf_paid, chặn checkoutUrl
│   │   ├── src/index.js                        # SỬA: nối checkout vào createSdk
│   │   ├── test/{checkout,paid}.test.js        # MỚI
│   │   ├── e2e/billing.spec.js, e2e/server.js  # MỚI/SỬA: Playwright với Paddle giả
│   └── cli/
│       ├── src/{main,api,publish}.js           # SỬA: funnel prices, billing reconcile/outbox, cảnh báo publish
│       ├── src/plans.js                        # MỚI: planKeysFromHtml
│       └── test/{prices,billing,plans}.test.js # MỚI; sửa publish.test.js
├── services/core-api/
│   ├── package.json, Dockerfile                # SỬA: @ikf/paddle, @ikf/event-schema, client-sqs, client-sns
│   ├── migrations/003_billing.sql              # MỚI
│   ├── src/app.js, src/config.js, src/server.js  # SỬA
│   ├── src/billing/{ulid,errors,prices,turnstile,cors,checkout,queue,webhook,sync,reconcile,alarm,setup}.js   # MỚI
│   ├── src/http/{prices,checkout,webhook,billing}.js   # MỚI
│   └── test/{billing-schema,prices,checkout,turnstile,webhook,queue,sync,reconcile,alarm,setup}.test.js, test/helpers/{paddle,queue}.js
│       (sửa: test/{migrate,config}.test.js, test/helpers/{db,app}.js)
├── workers/edge-router/
│   ├── src/{index,inject}.js                   # SỬA: __IKF billing, /_ikf/pay
│   ├── src/pay.js                              # MỚI
│   ├── wrangler.json, vitest.config.js, scripts/render-config.mjs   # SỬA
│   └── test/pay.test.js (mới), test/inject.test.js (thêm)
├── infra/modules/edge/                         # SỬA: rule /v1/checkout, Turnstile domains
├── infra/stack/{main,outputs,variables}.tf + tests   # SỬA: paddle-client-token, PADDLE_ENV, ALARM_TOPIC_ARN, sns:Publish
├── infra/envs/{staging,prod}/main.tf          # SỬA: output paddle_env
├── .github/workflows/{core-api,packages,edge-router}.yml   # SỬA
└── docs/runbooks/billing-paddle.md             # MỚI
```

---

### Task 0: Chuẩn bị đầu vào (thủ công, không có code)

Ai làm: Tech Lead + người giữ tài khoản Paddle. Task 1–11, 13 làm được ngay. Task 12 (apply) và "Theo sau" cần các mục này.

- [ ] **Step 1: Paddle sandbox + live.** Hai tài khoản (sandbox cho staging, live cho prod). Mỗi tài khoản:
  - API key (Developer tools → Authentication) quyền đọc/ghi transactions, customers; đọc prices, discounts, subscriptions, adjustments.
  - Client-side token (bắt đầu `test_` ở sandbox, `live_` ở live).
  - Notification destination: URL `https://api.<zone>/v1/paddle/webhook`, type `webhook`, event: `transaction.*`, `subscription.*`, `adjustment.*`. Ghi lại secret key (`pdl_ntfset_…`).
  - Website approval: thêm **mọi** domain funnel + preview host (Paddle chỉ mở checkout trên domain đã duyệt).
  - Default payment link: `https://<một funnel host>/_ikf/pay` (Paddle bắt buộc có).
- [ ] **Step 2: Product/price.** Cho 2 funnel pilot: price gói tuần (recurring, có giá giới thiệu dùng discount hoặc trial) và price add-on `one_time`. Ghi `pri_…`/`dsc_…` để chạy `ikf funnel prices set` (phần "Theo sau").
- [ ] **Step 3: Gói zone platform.** Kiểm tra zone cho phép **≥ 3** rule rate limit và `period = 60` (Free: 1 rule, chỉ 10s). Không đủ thì báo Tech Lead nâng gói trước khi apply Task 12.
- [ ] **Step 4: Turnstile.** Widget `ikf-<env>` có giới hạn số hostname theo gói; kiểm tra số `funnel_domains` + 1 không vượt.
- [ ] **Step 5: Lưu tất cả** vào password manager; giá trị vào Secrets Manager ở "Theo sau", không đi qua git/chat.

---
### Task 1: Nhánh mới + `@ikf/paddle` (client API + chữ ký webhook)

**Files:**
- Create: `packages/paddle/package.json`, `packages/paddle/src/index.js`
- Test: `packages/paddle/test/client.test.js`, `packages/paddle/test/webhook.test.js`

**Interfaces:**
- Produces (`@ikf/paddle`, dùng ở Task 3, 5, 6, 7, 8, 9, 13):
  - Hằng: `PADDLE_BASE_URLS = {sandbox: 'https://sandbox-api.paddle.com', live: 'https://api.paddle.com'}`, `PADDLE_TIMEOUT_MS = 10000`, `PADDLE_RETRIES = 2`, `WEBHOOK_TOLERANCE_SEC = 300`.
  - `class PaddleError extends Error { kind: 'auth'|'not_found'|'client'|'unavailable', status: number, code: string, detail?: string }`.
  - `createPaddleClient({apiKey, env: 'sandbox'|'live', fetch?, timeoutMs?, retries?, sleep?}) → PaddleClient`:
    - `env`
    - `createTransaction(body) → txn` (`POST /transactions`)
    - `getTransaction(id) → txn` (`GET /transactions/{id}?include=customer,adjustments`; `txn.customer`, `txn.adjustments[]`)
    - `getSubscription(id)`, `getPrice(id)`, `getDiscount(id)`, `getCustomer(id)` → `data`
    - `createCustomer({email}) → customer` (`POST /customers`; trùng email → `PaddleError{kind:'client', code:'customer_already_exists', detail:'… ctm_…'}`)
    - `listTransactions({updatedAfter: string}) → txn[]` (mọi trang, chỉ theo `next` cùng host)
  - `verifyWebhook(rawBody: Buffer|string, header: string|undefined, secret: string, now = Date.now(), toleranceSec = 300) → {ok: true} | {ok: false, reason: 'no_secret'|'missing'|'malformed'|'stale'|'mismatch'}`
  - `signWebhook(rawBody, secret, ts = now giây) → 'ts=<ts>;h1=<hex>'`

- [ ] **Step 1: Tạo nhánh**

```bash
cd /Users/daothinh/ikf-platform
git fetch origin && git checkout feat/runtime-sdk-collector && git pull --ff-only
git checkout -b feat/billing-paddle
```

- [ ] **Step 2: Tạo package**

```bash
mkdir -p packages/paddle/src packages/paddle/test
```

`packages/paddle/package.json`:

```json
{
  "name": "@ikf/paddle",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": "./src/index.js",
  "engines": { "node": ">=22" },
  "scripts": { "test": "vitest run" },
  "devDependencies": { "vitest": "~3.2.0" }
}
```

- [ ] **Step 3: Viết test fail**

`packages/paddle/test/webhook.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { signWebhook, verifyWebhook, WEBHOOK_TOLERANCE_SEC } from '../src/index.js';

const SECRET = 'pdl_ntfset_test_secret';
const NOW = Date.UTC(2026, 9, 9, 10, 0, 0);
const TS = Math.floor(NOW / 1000);
// Paddle signs the bytes it sent; keep odd spacing to prove nothing re-serializes them.
const RAW = '{"event_id":"evt_01","event_type":"transaction.completed", "data":{"id":"txn_01"}}';

describe('verifyWebhook', () => {
  it('accepts the signature Paddle computes over `${ts}:${rawBody}`', () => {
    expect(verifyWebhook(RAW, signWebhook(RAW, SECRET, TS), SECRET, NOW)).toEqual({ ok: true });
    expect(verifyWebhook(Buffer.from(RAW), signWebhook(RAW, SECRET, TS), SECRET, NOW)).toEqual({ ok: true });
  });

  it('accepts any of several h1 values (secret rotation)', () => {
    const good = signWebhook(RAW, SECRET, TS).split(';')[1];
    expect(verifyWebhook(RAW, `ts=${TS};h1=${'0'.repeat(64)};${good}`, SECRET, NOW)).toEqual({ ok: true });
  });

  it('rejects a re-serialized body', () => {
    const header = signWebhook(RAW, SECRET, TS);
    expect(verifyWebhook(JSON.stringify(JSON.parse(RAW)), header, SECRET, NOW)).toEqual({ ok: false, reason: 'mismatch' });
  });

  it('rejects another secret', () => {
    expect(verifyWebhook(RAW, signWebhook(RAW, 'other', TS), SECRET, NOW)).toEqual({ ok: false, reason: 'mismatch' });
  });

  it(`rejects timestamps more than ${WEBHOOK_TOLERANCE_SEC}s away, both directions`, () => {
    expect(verifyWebhook(RAW, signWebhook(RAW, SECRET, TS - 301), SECRET, NOW)).toEqual({ ok: false, reason: 'stale' });
    expect(verifyWebhook(RAW, signWebhook(RAW, SECRET, TS + 301), SECRET, NOW)).toEqual({ ok: false, reason: 'stale' });
    expect(verifyWebhook(RAW, signWebhook(RAW, SECRET, TS - 300), SECRET, NOW)).toEqual({ ok: true });
  });

  it.each([
    [undefined, 'missing'],
    ['', 'missing'],
    ['h1=abc', 'malformed'],
    [`ts=${TS}`, 'malformed'],
    [`ts=abc;h1=${'a'.repeat(64)}`, 'malformed'],
    [`ts=${TS};h1=xyz`, 'malformed'],
    [`ts=${TS};h1=${'a'.repeat(63)}`, 'malformed'],
  ])('rejects header %j as %s', (header, reason) => {
    expect(verifyWebhook(RAW, header, SECRET, NOW)).toEqual({ ok: false, reason });
  });

  it('rejects when no secret is configured', () => {
    expect(verifyWebhook(RAW, signWebhook(RAW, SECRET, TS), '', NOW)).toEqual({ ok: false, reason: 'no_secret' });
  });
});
```

`packages/paddle/test/client.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { createPaddleClient, PaddleError, PADDLE_BASE_URLS } from '../src/index.js';

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
const paddleError = (status, code, detail = code) => json(status, { error: { type: 'request_error', code, detail } });

// fetch fake: replies in order, records every call.
function fakeFetch(...replies) {
  const calls = [];
  const fn = async (url, init = {}) => {
    calls.push({ url, method: init.method ?? 'GET', headers: init.headers, body: init.body ? JSON.parse(init.body) : undefined, signal: init.signal });
    const next = replies.shift();
    if (!next) throw new Error('no reply scripted');
    if (next instanceof Error) throw next;
    return typeof next === 'function' ? next(url, init) : next;
  };
  fn.calls = calls;
  return fn;
}
const noSleep = async () => {};
const client = (fetch, extra = {}) => createPaddleClient({ apiKey: 'pdl_sdbx_apikey', env: 'sandbox', fetch, sleep: noSleep, ...extra });

describe('createPaddleClient', () => {
  it('uses the sandbox or live base URL with a Bearer key', async () => {
    const f = fakeFetch(json(200, { data: { id: 'pri_1' } }), json(200, { data: { id: 'pri_1' } }));
    await client(f).getPrice('pri_1');
    await client(f, { env: 'live' }).getPrice('pri_1');
    expect(f.calls.map((c) => c.url)).toEqual([
      'https://sandbox-api.paddle.com/prices/pri_1',
      'https://api.paddle.com/prices/pri_1',
    ]);
    expect(f.calls[0].headers.authorization).toBe('Bearer pdl_sdbx_apikey');
    expect(PADDLE_BASE_URLS).toEqual({ sandbox: 'https://sandbox-api.paddle.com', live: 'https://api.paddle.com' });
  });

  it('rejects an unknown env', () => {
    expect(() => createPaddleClient({ apiKey: 'k', env: 'prod' })).toThrow(/sandbox or live/);
  });

  it('POST /transactions sends the JSON body and returns data', async () => {
    const f = fakeFetch(json(201, { data: { id: 'txn_1', status: 'ready' } }));
    const body = { items: [{ price_id: 'pri_1', quantity: 1 }], custom_data: { checkout_id: 'c1' } };
    expect(await client(f).createTransaction(body)).toEqual({ id: 'txn_1', status: 'ready' });
    expect(f.calls[0]).toMatchObject({ method: 'POST', url: 'https://sandbox-api.paddle.com/transactions', body });
    expect(f.calls[0].headers['content-type']).toBe('application/json');
  });

  it('GET endpoints, with the includes the sync worker needs', async () => {
    const f = fakeFetch(...Array.from({ length: 5 }, () => json(200, { data: {} })));
    const c = client(f);
    await c.getTransaction('txn_1');
    await c.getSubscription('sub_1');
    await c.getDiscount('dsc_1');
    await c.getCustomer('ctm_1');
    await c.createCustomer({ email: 'a@b.co' });
    expect(f.calls.map((x) => `${x.method} ${x.url.replace('https://sandbox-api.paddle.com', '')}`)).toEqual([
      'GET /transactions/txn_1?include=customer%2Cadjustments',
      'GET /subscriptions/sub_1',
      'GET /discounts/dsc_1',
      'GET /customers/ctm_1',
      'POST /customers',
    ]);
    expect(f.calls[4].body).toEqual({ email: 'a@b.co' });
  });

  it('escapes ids into the path', async () => {
    const f = fakeFetch(json(200, { data: {} }));
    await client(f).getPrice('../x');
    expect(f.calls[0].url).toBe('https://sandbox-api.paddle.com/prices/..%2Fx');
  });

  it('retries 5xx, 429 and network errors twice, then gives up as unavailable', async () => {
    const f = fakeFetch(json(502, {}), json(429, {}), new TypeError('fetch failed'));
    const err = await client(f).getPrice('pri_1').catch((e) => e);
    expect(err).toBeInstanceOf(PaddleError);
    expect(err).toMatchObject({ kind: 'unavailable', status: 0 });
    expect(f.calls).toHaveLength(3);
  });

  it('succeeds when a retry succeeds', async () => {
    const f = fakeFetch(json(503, {}), json(200, { data: { id: 'pri_1' } }));
    expect(await client(f).getPrice('pri_1')).toEqual({ id: 'pri_1' });
  });

  it('times out each attempt after 10s by default', async () => {
    const seen = [];
    const hang = (url, init) => {
      seen.push(init.signal);
      return new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(init.signal.reason)));
    };
    const f = fakeFetch(hang, hang, hang);
    const err = await client(f, { timeoutMs: 20 }).getPrice('pri_1').catch((e) => e);
    expect(err).toMatchObject({ kind: 'unavailable' });
    expect(seen).toHaveLength(3);
    expect(seen.every((s) => s.aborted)).toBe(true);
  });

  it.each([
    [401, 'authentication_missing', 'auth'],
    [403, 'forbidden', 'auth'],
    [404, 'entity_not_found', 'not_found'],
    [409, 'customer_already_exists', 'client'],
    [400, 'bad_request', 'client'],
  ])('maps %i %s to kind %s without retrying', async (status, code, kind) => {
    const f = fakeFetch(paddleError(status, code, `detail of ${code}`));
    const err = await client(f).getPrice('pri_1').catch((e) => e);
    expect(err).toMatchObject({ kind, status, code, detail: `detail of ${code}` });
    expect(f.calls).toHaveLength(1);
  });

  it('listTransactions follows meta.pagination.next until has_more is false', async () => {
    const next = 'https://sandbox-api.paddle.com/transactions?after=txn_2&per_page=200';
    const f = fakeFetch(
      json(200, { data: [{ id: 'txn_1' }, { id: 'txn_2' }], meta: { pagination: { per_page: 200, next, has_more: true } } }),
      json(200, { data: [{ id: 'txn_3' }], meta: { pagination: { per_page: 200, next: 'https://x', has_more: false } } }),
    );
    const out = await client(f).listTransactions({ updatedAfter: '2026-10-08T10:00:00.000Z' });
    expect(out.map((t) => t.id)).toEqual(['txn_1', 'txn_2', 'txn_3']);
    expect(f.calls[0].url).toBe(
      'https://sandbox-api.paddle.com/transactions?updated_at%5BGT%5D=2026-10-08T10%3A00%3A00.000Z&order_by=updated_at%5BASC%5D&per_page=200',
    );
    expect(f.calls[1].url).toBe(next);
  });

  it('refuses to follow a pagination link to another host', async () => {
    const f = fakeFetch(json(200, { data: [], meta: { pagination: { next: 'https://evil.example/transactions', has_more: true } } }));
    await expect(client(f).listTransactions({ updatedAfter: '2026-10-08T10:00:00Z' })).rejects.toThrow(/pagination/);
  });
});
```

- [ ] **Step 4: Chạy test, xác nhận FAIL**

Run:
```bash
npm install --no-audit --no-fund    # link workspace mới vào node_modules + package-lock.json
npm test -w @ikf/paddle
```
Expected: FAIL — `Cannot find module '../src/index.js'` ở cả 2 file.

- [ ] **Step 5: Implement**

`packages/paddle/src/index.js`:

```js
import { createHmac, timingSafeEqual } from 'node:crypto';

export const PADDLE_BASE_URLS = { sandbox: 'https://sandbox-api.paddle.com', live: 'https://api.paddle.com' };
export const PADDLE_TIMEOUT_MS = 10_000;
export const PADDLE_RETRIES = 2;
export const WEBHOOK_TOLERANCE_SEC = 300;

// kind: 'auth' (401/403: wrong key, alarm), 'not_found' (404), 'client' (other 4xx),
// 'unavailable' (5xx/429/network/timeout after retries).
export class PaddleError extends Error {
  constructor(kind, { status = 0, code = kind, detail } = {}) {
    super(`paddle ${kind}${code !== kind ? ` (${code})` : ''}`);
    this.kind = kind;
    this.status = status;
    this.code = code;
    this.detail = detail;
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function createPaddleClient({
  apiKey,
  env,
  fetch: doFetch = globalThis.fetch,
  timeoutMs = PADDLE_TIMEOUT_MS,
  retries = PADDLE_RETRIES,
  sleep = wait,
}) {
  const base = PADDLE_BASE_URLS[env];
  if (!base) throw new Error(`paddle env must be sandbox or live, got ${JSON.stringify(env)}`);
  const id = encodeURIComponent;

  async function request(method, pathOrUrl, body) {
    const url = pathOrUrl.startsWith('https://') ? pathOrUrl : base + pathOrUrl;
    for (let attempt = 0; ; attempt += 1) {
      let res;
      try {
        res = await doFetch(url, {
          method,
          headers: {
            authorization: `Bearer ${apiKey}`,
            accept: 'application/json',
            ...(body !== undefined && { 'content-type': 'application/json' }),
          },
          body: body === undefined ? undefined : JSON.stringify(body),
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch {
        res = null; // network error or timeout
      }
      if (res && res.ok) return res.json();
      const retryable = !res || res.status >= 500 || res.status === 429;
      if (retryable) {
        if (attempt < retries) {
          await sleep(500 * 2 ** attempt);
          continue;
        }
        throw new PaddleError('unavailable', { status: 0 });
      }
      const err = (await res.json().catch(() => ({}))).error ?? {};
      const kind = res.status === 401 || res.status === 403 ? 'auth' : res.status === 404 ? 'not_found' : 'client';
      throw new PaddleError(kind, { status: res.status, code: err.code ?? kind, detail: err.detail });
    }
  }
  const data = async (method, path, body) => (await request(method, path, body)).data;

  return {
    env,
    createTransaction: (body) => data('POST', '/transactions', body),
    getTransaction: (txnId) => data('GET', `/transactions/${id(txnId)}?include=customer%2Cadjustments`),
    getSubscription: (subId) => data('GET', `/subscriptions/${id(subId)}`),
    getPrice: (priceId) => data('GET', `/prices/${id(priceId)}`),
    getDiscount: (discountId) => data('GET', `/discounts/${id(discountId)}`),
    getCustomer: (customerId) => data('GET', `/customers/${id(customerId)}`),
    createCustomer: ({ email }) => data('POST', '/customers', { email }),
    // Every transaction updated after `updatedAfter` (RFC 3339), oldest update first, all pages.
    async listTransactions({ updatedAfter }) {
      const q = new URLSearchParams({ 'updated_at[GT]': updatedAfter, order_by: 'updated_at[ASC]', per_page: '200' });
      let next = `/transactions?${q}`;
      const out = [];
      for (;;) {
        const page = await request('GET', next);
        out.push(...(page.data ?? []));
        const p = page.meta?.pagination;
        if (!p?.has_more || !p.next) return out;
        if (!p.next.startsWith(`${base}/`)) throw new Error(`unexpected pagination link: ${p.next}`);
        next = p.next;
      }
    },
  };
}

const hmacHex = (secret, ts, raw) => createHmac('sha256', secret).update(`${ts}:`).update(raw).digest('hex');

// Paddle-Signature: ts=<unix seconds>;h1=<hex HMAC-SHA256 of "<ts>:<raw body>"> (several h1 during secret rotation).
// rawBody must be the exact bytes received (Buffer or string), never a re-serialized object.
export function verifyWebhook(rawBody, header, secret, now = Date.now(), toleranceSec = WEBHOOK_TOLERANCE_SEC) {
  if (!secret) return { ok: false, reason: 'no_secret' };
  if (typeof header !== 'string' || !header) return { ok: false, reason: 'missing' };
  let ts = null;
  const h1 = [];
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    if (k === 'ts') ts = v;
    else if (k === 'h1') h1.push(v);
  }
  if (!ts || !/^\d{1,12}$/.test(ts) || !h1.length || !h1.every((h) => /^[0-9a-f]{64}$/i.test(h))) {
    return { ok: false, reason: 'malformed' };
  }
  if (Math.abs(Math.floor(now / 1000) - Number(ts)) > toleranceSec) return { ok: false, reason: 'stale' };
  const expected = Buffer.from(hmacHex(secret, ts, rawBody), 'hex');
  const ok = h1.some((h) => timingSafeEqual(Buffer.from(h, 'hex'), expected));
  return ok ? { ok: true } : { ok: false, reason: 'mismatch' };
}

// For tests and the e2e fake Paddle: the header Paddle would send for this body.
export function signWebhook(rawBody, secret, ts = Math.floor(Date.now() / 1000)) {
  return `ts=${ts};h1=${hmacHex(secret, String(ts), rawBody)}`;
}
```

- [ ] **Step 6: Chạy test, xác nhận PASS**

Run: `npm test -w @ikf/paddle`
Expected: `Test Files  2 passed (2)`, `Tests  28 passed (28)`.

- [ ] **Step 7: Commit**

```bash
git add package-lock.json packages/paddle
git commit -m "feat(paddle): Paddle Billing API client + webhook signature check"
```

---

### Task 2: core-api — migration `003_billing.sql`

**Files:**
- Create: `services/core-api/migrations/003_billing.sql`
- Modify: `services/core-api/test/helpers/db.js` (`resetDb`), `services/core-api/test/migrate.test.js`
- Test: `services/core-api/test/billing-schema.test.js` (mới)

**Interfaces:**
- Produces (dùng ở Task 3, 5, 6, 7, 8):
  - `funnel_prices (funnel_id, plan_key ^[A-Za-z0-9_-]{1,40}$, paddle_price_id, paddle_discount_id NULL, kind 'recurring'|'one_time', updated_by, updated_at)`, PK `(funnel_id, plan_key)`, index theo `paddle_price_id`.
  - `customers (id BIGSERIAL, paddle_customer_id UNIQUE, email, created_at)` — chỗ duy nhất có email.
  - `checkouts (id ULID PK, paddle_transaction_id UNIQUE NOT NULL, funnel_id, v, plan_key, sid, attribution JSONB, status 'created'|'completed'|'abandoned', created_at, completed_at)` — không có cột email.
  - `transactions (paddle_transaction_id PK, customer_id NULL, paddle_subscription_id NULL, checkout_id NULL, status, origin, amount_minor BIGINT, currency, billed_at NULL, paddle_updated_at)`.
  - `subscriptions (paddle_subscription_id PK, customer_id NOT NULL, funnel_id NULL, plan_key NULL, status, current_period_end, canceled_at, scheduled_change JSONB, paddle_updated_at)`.
  - `webhook_inbox (event_id PK, event_type, occurred_at, received_at, processed_at NULL, attempts INT DEFAULT 0)`.
  - `outbox (id BIGSERIAL, topic, aggregate_id, dedupe_key UNIQUE, payload JSONB, created_at, published_at NULL)` (B3).
  - `resetDb` truncate thêm 7 bảng billing.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/billing-schema.test.js`:

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';

const CK = '01JA0000000000000000000001';

describe('003_billing schema', () => {
  let db;
  let funnelId;
  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    funnelId = (await db.pool.query("INSERT INTO funnels (slug, created_by) VALUES ('aivideo', 't') RETURNING id")).rows[0].id;
  });

  const price = (planKey, kind = 'recurring') =>
    db.pool.query(
      "INSERT INTO funnel_prices (funnel_id, plan_key, paddle_price_id, kind, updated_by) VALUES ($1, $2, 'pri_1', $3, 't')",
      [funnelId, planKey, kind],
    );

  it('funnel_prices: one row per (funnel, plan); plan keys and kinds are checked', async () => {
    await price('1w');
    await price('addon', 'one_time');
    await expect(price('1w')).rejects.toThrow(/funnel_prices_pkey/);
    await expect(price('bad key')).rejects.toThrow(/funnel_prices_plan_key_check/);
    await expect(price('m1', 'lifetime')).rejects.toThrow(/funnel_prices_kind_check/);
  });

  it('checkouts: ULID ids, known statuses, one checkout per Paddle transaction, no email column', async () => {
    const insert = (id, txn, status = 'created') =>
      db.pool.query(
        "INSERT INTO checkouts (id, paddle_transaction_id, funnel_id, v, plan_key, sid, status) VALUES ($1, $2, $3, 1, '1w', 's', $4)",
        [id, txn, funnelId, status],
      );
    await insert(CK, 'txn_1');
    await expect(insert('not-a-ulid', 'txn_2')).rejects.toThrow(/checkouts_id_check/);
    await expect(insert('01JA0000000000000000000002', 'txn_1')).rejects.toThrow(/checkouts_paddle_transaction_id_key/);
    await expect(insert('01JA0000000000000000000003', 'txn_3', 'paid')).rejects.toThrow(/checkouts_status_check/);
    const cols = await db.pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'checkouts'");
    expect(cols.rows.map((r) => r.column_name)).not.toContain('email');
  });

  it('outbox: a dedupe key can be written once', async () => {
    const add = () =>
      db.pool.query(
        "INSERT INTO outbox (topic, aggregate_id, dedupe_key, payload) VALUES ('payment.succeeded', 'txn_1', 'payment.succeeded:txn_1', '{}') ON CONFLICT (dedupe_key) DO NOTHING",
      );
    expect((await add()).rowCount).toBe(1);
    expect((await add()).rowCount).toBe(0);
  });

  it('subscriptions need a customer; funnel may be NULL (unmapped price)', async () => {
    await expect(
      db.pool.query("INSERT INTO subscriptions (paddle_subscription_id, customer_id, status, paddle_updated_at) VALUES ('sub_1', 999, 'active', now())"),
    ).rejects.toThrow(/subscriptions_customer_id_fkey/);
    const c = (await db.pool.query("INSERT INTO customers (paddle_customer_id, email) VALUES ('ctm_1', 'a@b.co') RETURNING id")).rows[0].id;
    await db.pool.query(
      "INSERT INTO subscriptions (paddle_subscription_id, customer_id, funnel_id, status, paddle_updated_at) VALUES ('sub_1', $1, NULL, 'active', now())",
      [c],
    );
  });
});
```

`services/core-api/test/migrate.test.js`, test đầu tiên: thay

```js
    expect(await migrate(db.pool)).toEqual(['001_publisher.sql', '002_funnel_pixel.sql']);
```
bằng
```js
    expect(await migrate(db.pool)).toEqual(['001_publisher.sql', '002_funnel_pixel.sql', '003_billing.sql']);
```
và thay
```js
      'api_tokens', 'domains', 'funnels', 'host_revs', 'route_events', 'routes', 'schema_migrations', 'versions',
    ]);
```
bằng
```js
      'api_tokens', 'checkouts', 'customers', 'domains', 'funnel_prices', 'funnels', 'host_revs', 'outbox',
      'route_events', 'routes', 'schema_migrations', 'subscriptions', 'transactions', 'versions', 'webhook_inbox',
    ]);
```

`services/core-api/test/helpers/db.js`, trong `resetDb`: thay

```js
    'TRUNCATE route_events, routes, host_revs, versions, funnels, domains, api_tokens RESTART IDENTITY CASCADE',
```
bằng
```js
    `TRUNCATE route_events, routes, host_revs, versions, funnels, domains, api_tokens,
              funnel_prices, checkouts, transactions, subscriptions, customers, webhook_inbox, outbox RESTART IDENTITY CASCADE`,
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run:
```bash
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock
npm test -w @ikf/core-api
```
Expected: FAIL — `resetDb` báo `relation "funnel_prices" does not exist` (≈ 53 test fail ở mọi file dùng `resetDb`), `migrate` thiếu `003_billing.sql`.

- [ ] **Step 3: Implement**

`services/core-api/migrations/003_billing.sql`:

```sql
CREATE TABLE funnel_prices (
  funnel_id          BIGINT NOT NULL REFERENCES funnels (id),
  plan_key           TEXT NOT NULL CONSTRAINT funnel_prices_plan_key_check CHECK (plan_key ~ '^[A-Za-z0-9_-]{1,40}$'),
  paddle_price_id    TEXT NOT NULL,
  paddle_discount_id TEXT NULL,
  kind               TEXT NOT NULL CONSTRAINT funnel_prices_kind_check CHECK (kind IN ('recurring', 'one_time')),
  updated_by         TEXT NOT NULL,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (funnel_id, plan_key)
);
CREATE INDEX funnel_prices_by_price ON funnel_prices (paddle_price_id);

-- The only place an email is stored.
CREATE TABLE customers (
  id                 BIGSERIAL PRIMARY KEY,
  paddle_customer_id TEXT NOT NULL UNIQUE,
  email              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE checkouts (
  id                    TEXT PRIMARY KEY CONSTRAINT checkouts_id_check CHECK (id ~ '^[0-7][0-9A-HJKMNP-TV-Z]{25}$'),
  paddle_transaction_id TEXT NOT NULL UNIQUE,
  funnel_id             BIGINT NOT NULL REFERENCES funnels (id),
  v                     INT NOT NULL,
  plan_key              TEXT NOT NULL,
  sid                   TEXT NOT NULL,
  attribution           JSONB NOT NULL DEFAULT '{}',
  status                TEXT NOT NULL DEFAULT 'created'
                          CONSTRAINT checkouts_status_check CHECK (status IN ('created', 'completed', 'abandoned')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at          TIMESTAMPTZ NULL
);

CREATE TABLE transactions (
  paddle_transaction_id  TEXT PRIMARY KEY,
  customer_id            BIGINT NULL REFERENCES customers (id),
  paddle_subscription_id TEXT NULL,
  checkout_id            TEXT NULL,
  status                 TEXT NOT NULL,
  origin                 TEXT NOT NULL,
  amount_minor           BIGINT NOT NULL,
  currency               TEXT NOT NULL,
  billed_at              TIMESTAMPTZ NULL,
  paddle_updated_at      TIMESTAMPTZ NOT NULL
);
CREATE INDEX transactions_by_updated ON transactions (paddle_updated_at);

CREATE TABLE subscriptions (
  paddle_subscription_id TEXT PRIMARY KEY,
  customer_id            BIGINT NOT NULL REFERENCES customers (id),
  funnel_id              BIGINT NULL REFERENCES funnels (id),
  plan_key               TEXT NULL,
  status                 TEXT NOT NULL,
  current_period_end     TIMESTAMPTZ NULL,
  canceled_at            TIMESTAMPTZ NULL,
  scheduled_change       JSONB NULL,
  paddle_updated_at      TIMESTAMPTZ NOT NULL
);

CREATE TABLE webhook_inbox (
  event_id     TEXT PRIMARY KEY,
  event_type   TEXT NOT NULL,
  occurred_at  TIMESTAMPTZ NOT NULL,
  received_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ NULL,
  attempts     INT NOT NULL DEFAULT 0
);

-- dedupe_key makes "one row per transition" a database guarantee, not just a code path.
CREATE TABLE outbox (
  id           BIGSERIAL PRIMARY KEY,
  topic        TEXT NOT NULL,
  aggregate_id TEXT NOT NULL,
  dedupe_key   TEXT NOT NULL UNIQUE,
  payload      JSONB NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ NULL
);
CREATE INDEX outbox_unpublished ON outbox (id) WHERE published_at IS NULL;
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

Run: `npm test -w @ikf/core-api`
Expected: `Test Files  12 passed (12)`, `Tests  108 passed (108)`.

- [ ] **Step 5: Commit**

```bash
git add services/core-api
git commit -m "feat(core-api): billing schema (003_billing.sql)"
```

---

### Task 3: core-api — map giá `PUT/GET /v1/funnels/:slug/prices`

**Files:**
- Create: `services/core-api/src/billing/errors.js`, `services/core-api/src/billing/prices.js`, `services/core-api/src/http/prices.js`
- Create (test helper): `services/core-api/test/helpers/paddle.js`
- Modify: `services/core-api/package.json` (dep `@ikf/paddle`), `services/core-api/src/app.js`, `services/core-api/test/helpers/app.js` (`makeApp(pool, extra)`)
- Test: `services/core-api/test/prices.test.js`

**Interfaces:**
- Consumes: `PaddleError`, `PaddleClient.getPrice/getDiscount` (Task 1); bảng `funnel_prices` (Task 2); `requireRole`, `HttpError`.
- Produces:
  - `paddleHttpError(err, {log, alarm}) → Promise<Error>`: `PaddleError` `auth` → log `paddle_auth_failed` + `alarm('paddle_auth_failed', msg)` + `HttpError(503,'paddle_unavailable')`; `unavailable` → `HttpError(503,'paddle_unavailable')`; lỗi khác trả nguyên (Task 5, 8 dùng lại).
  - `PLAN_KEY_RE = /^[A-Za-z0-9_-]{1,40}$/`, `PRICE_ID_RE = /^pri_[a-z0-9]{26}$/`, `DISCOUNT_ID_RE = /^dsc_[a-z0-9]{26}$/`.
  - `setFunnelPrices(pool, paddle, {slug, plans, actor, log, alarm})`, `listFunnelPrices(db, slug)` → `{funnel, plans: {<key>: {price_id, discount_id, kind: 'recurring'|'one_time', updated_by, updated_at}}}`.
  - `PUT /v1/funnels/:slug/prices` (role `router`), body `{"plans": {"<key>": {"price_id","discount_id"?} | null}}` (gộp: key có trong body được ghi, `null` xóa) → `200` map đầy đủ; `422 {"error":"invalid_price"|"invalid_discount","detail":[{code, plan, price_id|discount_id, reason: 'malformed'|'not_found'|<status Paddle>}]}`; `404 funnel_not_found`; `503 paddle_unavailable`.
  - `GET /v1/funnels/:slug/prices` (role `router` hoặc `publisher`) → cùng shape. CLI dùng ở Task 4.
  - `buildApp` deps mới: `paddle` (PaddleClient), `alarm(kind, message) → Promise` (tùy chọn). Đăng ký khi có `pool` + `paddle`.
  - Test helper `fakePaddle()` (cùng bề mặt `PaddleClient` + `state`, `calls`, `fail(kind)`, `ok()`, `price()`, `discount()`, `customer()`, `transaction()`, `subscription()`), `paddleTxn(o)`, `paddleSub(o)`, hằng `PRICE_W1`, `PRICE_ADDON`, `PRICE_OTHER`, `DISCOUNT` — dùng ở Task 5, 7, 8.

- [ ] **Step 1: Thêm dependency**

```bash
npm pkg set 'dependencies.@ikf/paddle=*' -w @ikf/core-api
npm install --no-audit --no-fund
```

- [ ] **Step 2: Viết test helper + test fail**

`services/core-api/test/helpers/paddle.js`:

```js
import { PaddleError } from '@ikf/paddle';

export const PRICE_W1 = 'pri_01aaaaaaaaaaaaaaaaaaaaaaaa';
export const PRICE_ADDON = 'pri_01bbbbbbbbbbbbbbbbbbbbbbbb';
export const PRICE_OTHER = 'pri_01cccccccccccccccccccccccc';
export const DISCOUNT = 'dsc_01dddddddddddddddddddddddd';

const pad = (prefix, n) => `${prefix}_${String(n).padStart(26, '0')}`;

// Paddle-shaped objects for scripted scenarios.
export function paddleTxn(o = {}) {
  return {
    id: o.id ?? pad('txn', 1),
    status: o.status ?? 'completed',
    customer_id: o.customer_id === undefined ? 'ctm_1' : o.customer_id,
    subscription_id: o.subscription_id ?? null,
    origin: o.origin ?? 'web',
    currency_code: o.currency ?? 'USD',
    custom_data: o.custom_data ?? null,
    billed_at: o.billed_at ?? '2026-10-09T10:00:00.000000Z',
    updated_at: o.updated_at ?? '2026-10-09T10:00:00.000000Z',
    items: [{ price: { id: o.price_id ?? PRICE_W1 }, quantity: 1 }],
    details: { totals: { grand_total: String(o.amount ?? 1367), currency_code: o.currency ?? 'USD' } },
    adjustments: o.adjustments ?? [],
  };
}

export function paddleSub(o = {}) {
  return {
    id: o.id ?? 'sub_1',
    status: o.status ?? 'active',
    customer_id: o.customer_id ?? 'ctm_1',
    custom_data: o.custom_data ?? null,
    items: [{ price: { id: o.price_id ?? PRICE_W1 }, quantity: 1 }],
    current_billing_period: o.period_end === null ? null : { starts_at: '2026-10-09T10:00:00Z', ends_at: o.period_end ?? '2026-10-16T10:00:00Z' },
    canceled_at: o.canceled_at ?? null,
    scheduled_change: o.scheduled_change ?? null,
    updated_at: o.updated_at ?? '2026-10-09T10:00:00.000000Z',
  };
}

// In-memory Paddle with the same surface as createPaddleClient(); seed state, flip failures, read calls.
export function fakePaddle() {
  const state = { prices: new Map(), discounts: new Map(), customers: new Map(), transactions: new Map(), subscriptions: new Map() };
  const calls = [];
  let failing = null;
  let seq = 0;

  const guard = (name, ...args) => {
    calls.push([name, ...args]);
    if (failing === 'auth') throw new PaddleError('auth', { status: 401, code: 'authentication_malformed' });
    if (failing) throw new PaddleError(failing, { status: 0 });
  };
  const found = (map, id) => {
    if (!map.has(id)) throw new PaddleError('not_found', { status: 404, code: 'entity_not_found', detail: `${id} not found` });
    return structuredClone(map.get(id));
  };

  return {
    env: 'sandbox',
    state,
    calls,
    fail(kind = 'unavailable') {
      failing = kind;
    },
    ok() {
      failing = null;
    },
    price(id, { status = 'active', recurring = true } = {}) {
      state.prices.set(id, { id, status, billing_cycle: recurring ? { interval: 'week', frequency: 1 } : null });
    },
    discount(id, status = 'active') {
      state.discounts.set(id, { id, status });
    },
    customer(id, email) {
      state.customers.set(id, { id, email });
    },
    transaction(t) {
      state.transactions.set(t.id, structuredClone(t));
    },
    subscription(s) {
      state.subscriptions.set(s.id, structuredClone(s));
    },
    async createTransaction(body) {
      guard('createTransaction', body);
      seq += 1;
      const t = paddleTxn({
        id: pad('txn', 1000 + seq),
        status: body.customer_id ? 'ready' : 'draft',
        customer_id: body.customer_id ?? null,
        custom_data: body.custom_data,
        price_id: body.items[0].price_id,
      });
      state.transactions.set(t.id, t);
      return structuredClone(t);
    },
    async getTransaction(id) {
      guard('getTransaction', id);
      const t = found(state.transactions, id);
      return { ...t, customer: t.customer_id ? structuredClone(state.customers.get(t.customer_id) ?? null) : null };
    },
    async getSubscription(id) {
      guard('getSubscription', id);
      return found(state.subscriptions, id);
    },
    async getPrice(id) {
      guard('getPrice', id);
      return found(state.prices, id);
    },
    async getDiscount(id) {
      guard('getDiscount', id);
      return found(state.discounts, id);
    },
    async getCustomer(id) {
      guard('getCustomer', id);
      return found(state.customers, id);
    },
    async createCustomer({ email }) {
      guard('createCustomer', { email });
      for (const c of state.customers.values()) {
        if (c.email === email) {
          throw new PaddleError('client', { status: 409, code: 'customer_already_exists', detail: `customer email conflicts with customer of id ${c.id}` });
        }
      }
      seq += 1;
      const c = { id: pad('ctm', seq), email };
      state.customers.set(c.id, c);
      return structuredClone(c);
    },
    async listTransactions({ updatedAfter }) {
      guard('listTransactions', { updatedAfter });
      return [...state.transactions.values()]
        .filter((t) => t.updated_at > updatedAfter)
        .sort((a, b) => a.updated_at.localeCompare(b.updated_at))
        .map((t) => structuredClone(t));
    },
  };
}
```

`services/core-api/test/helpers/app.js`: thay

```js
export async function makeApp(pool) {
  const store = fakeStore();
  const kv = fakeKv();
  const app = buildApp({ deps: { pool, store, kv, mediaOrigins: ['https://media.test/'], previewBaseUrl: PREVIEW } });
```
bằng
```js
// extra: billing deps (paddle, turnstile, queue, webhookSecret, alarm) for the tests that need them.
export async function makeApp(pool, extra = {}) {
  const store = fakeStore();
  const kv = fakeKv();
  const app = buildApp({ deps: { pool, store, kv, mediaOrigins: ['https://media.test/'], previewBaseUrl: PREVIEW, ...extra } });
```

`services/core-api/test/prices.test.js`:

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, tokenFor, bearer, seedVersions } from './helpers/app.js';
import { fakePaddle, PRICE_W1, PRICE_ADDON, PRICE_OTHER, DISCOUNT } from './helpers/paddle.js';

describe('funnel price mapping', () => {
  let db;
  let app;
  let store;
  let paddle;
  let alarms;
  let router;

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    paddle = fakePaddle();
    paddle.price(PRICE_W1);
    paddle.price(PRICE_ADDON, { recurring: false });
    paddle.price(PRICE_OTHER, { status: 'archived' });
    paddle.discount(DISCOUNT);
    alarms = [];
    ({ app, store } = await makeApp(db.pool, { paddle, alarm: async (kind) => alarms.push(kind) }));
    router = await tokenFor(db.pool, 'router');
    await seedVersions(db.pool, store, 'aivideo', 1);
  });
  afterEach(() => app.close());

  const put = (slug, plans, token = router) =>
    app.inject({ method: 'PUT', url: `/v1/funnels/${slug}/prices`, headers: bearer(token), payload: { plans } });
  const get = (slug, token = router) => app.inject({ method: 'GET', url: `/v1/funnels/${slug}/prices`, headers: bearer(token) });

  it('validates each price and discount with Paddle, infers the kind, and returns the whole map', async () => {
    const res = await put('aivideo', { '1w': { price_id: PRICE_W1, discount_id: DISCOUNT }, addon: { price_id: PRICE_ADDON } });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.funnel).toBe('aivideo');
    expect(body.plans).toEqual({
      '1w': { price_id: PRICE_W1, discount_id: DISCOUNT, kind: 'recurring', updated_by: 'router', updated_at: expect.any(String) },
      addon: { price_id: PRICE_ADDON, discount_id: null, kind: 'one_time', updated_by: 'router', updated_at: expect.any(String) },
    });
    expect(paddle.calls.map((c) => c[0]).sort()).toEqual(['getDiscount', 'getPrice', 'getPrice']);
    expect((await get('aivideo')).json()).toEqual(body);
  });

  it('merges: keys not in the body stay, null removes a key', async () => {
    await put('aivideo', { '1w': { price_id: PRICE_W1 }, addon: { price_id: PRICE_ADDON } });
    const res = await put('aivideo', { addon: null, m1: { price_id: PRICE_W1 } });
    expect(Object.keys(res.json().plans).sort()).toEqual(['1w', 'm1']);
  });

  it('422 invalid_price for unknown, archived or malformed prices, listing every problem; nothing is saved', async () => {
    const res = await put('aivideo', {
      a: { price_id: 'pri_01zzzzzzzzzzzzzzzzzzzzzzzz' },
      b: { price_id: PRICE_OTHER },
      c: { price_id: 'price-1' },
      d: { price_id: PRICE_W1 },
    });
    expect(res.statusCode).toBe(422);
    expect(res.json()).toEqual({
      error: 'invalid_price',
      detail: [
        { code: 'invalid_price', plan: 'a', price_id: 'pri_01zzzzzzzzzzzzzzzzzzzzzzzz', reason: 'not_found' },
        { code: 'invalid_price', plan: 'b', price_id: PRICE_OTHER, reason: 'archived' },
        { code: 'invalid_price', plan: 'c', price_id: 'price-1', reason: 'malformed' },
      ],
    });
    expect((await get('aivideo')).json().plans).toEqual({});
  });

  it('422 invalid_discount for an unknown or inactive discount', async () => {
    paddle.discount('dsc_01eeeeeeeeeeeeeeeeeeeeeeee', 'expired');
    const res = await put('aivideo', { '1w': { price_id: PRICE_W1, discount_id: 'dsc_01eeeeeeeeeeeeeeeeeeeeeeee' } });
    expect(res.statusCode).toBe(422);
    expect(res.json().detail).toEqual([
      { code: 'invalid_discount', plan: '1w', discount_id: 'dsc_01eeeeeeeeeeeeeeeeeeeeeeee', reason: 'expired' },
    ]);
  });

  it('503 paddle_unavailable when Paddle is down; 503 + alarm when the API key is rejected', async () => {
    paddle.fail('unavailable');
    expect((await put('aivideo', { '1w': { price_id: PRICE_W1 } })).json()).toEqual({ error: 'paddle_unavailable' });
    expect(alarms).toEqual([]);
    paddle.fail('auth');
    const res = await put('aivideo', { '1w': { price_id: PRICE_W1 } });
    expect(res.statusCode).toBe(503);
    expect(alarms).toEqual(['paddle_auth_failed']);
  });

  it('404 for an unknown funnel, 400 for a bad plan key or body', async () => {
    expect((await put('nope', { '1w': { price_id: PRICE_W1 } })).json()).toEqual({ error: 'funnel_not_found', detail: { funnel: 'nope' } });
    expect((await get('nope')).statusCode).toBe(404);
    expect((await put('aivideo', { 'bad key': { price_id: PRICE_W1 } })).statusCode).toBe(400);
    expect((await put('aivideo', {})).statusCode).toBe(400);
    expect((await put('aivideo', { '1w': { discount_id: DISCOUNT } })).statusCode).toBe(400);
  });

  it('router (or admin) sets prices; publisher may read them', async () => {
    const publisher = await tokenFor(db.pool, 'publisher');
    expect((await put('aivideo', { '1w': { price_id: PRICE_W1 } }, publisher)).statusCode).toBe(403);
    expect((await get('aivideo', publisher)).statusCode).toBe(200);
  });
});
```

- [ ] **Step 3: Chạy test, xác nhận FAIL**

Run: `npm test -w @ikf/core-api`
Expected: FAIL — `prices.test.js` 7 test fail (`404` cho `PUT /v1/funnels/aivideo/prices`), 108 test cũ vẫn pass.

- [ ] **Step 4: Implement**

`services/core-api/src/billing/errors.js`:

```js
import { PaddleError } from '@ikf/paddle';
import { HttpError } from '../errors.js';

// Paddle down or our key rejected → 503 for the caller. A rejected key also raises the
// paddle_auth_failed alarm (rate-limited inside alarm()). Anything else is rethrown unchanged.
export async function paddleHttpError(err, { log, alarm }) {
  if (!(err instanceof PaddleError) || (err.kind !== 'auth' && err.kind !== 'unavailable')) return err;
  if (err.kind === 'auth') {
    log?.error({ status: err.status, code: err.code }, 'paddle_auth_failed');
    try {
      await alarm?.('paddle_auth_failed', `Paddle rejected the API key (HTTP ${err.status} ${err.code})`);
    } catch {
      // an alarm failure must not change the reply
    }
  } else {
    log?.warn('paddle_unavailable');
  }
  return new HttpError(503, 'paddle_unavailable');
}
```

`services/core-api/src/billing/prices.js`:

```js
import { PaddleError } from '@ikf/paddle';
import { HttpError } from '../errors.js';
import { paddleHttpError } from './errors.js';

export const PLAN_KEY_RE = /^[A-Za-z0-9_-]{1,40}$/;
export const PRICE_ID_RE = /^pri_[a-z0-9]{26}$/;
export const DISCOUNT_ID_RE = /^dsc_[a-z0-9]{26}$/;

async function funnelId(db, slug) {
  const { rows } = await db.query('SELECT id FROM funnels WHERE slug = $1', [slug]);
  if (!rows.length) throw new HttpError(404, 'funnel_not_found', { funnel: slug });
  return rows[0].id;
}

// Returns null when Paddle says the entity does not exist; rethrows outages.
async function lookup(fn) {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof PaddleError && err.kind === 'not_found') return null;
    throw err;
  }
}

async function checkPlan(paddle, plan, { price_id: priceId, discount_id: discountId = null }) {
  const problems = [];
  let kind = null;
  if (!PRICE_ID_RE.test(priceId)) {
    problems.push({ code: 'invalid_price', plan, price_id: priceId, reason: 'malformed' });
  } else {
    const price = await lookup(() => paddle.getPrice(priceId));
    if (!price) problems.push({ code: 'invalid_price', plan, price_id: priceId, reason: 'not_found' });
    else if (price.status !== 'active') problems.push({ code: 'invalid_price', plan, price_id: priceId, reason: price.status });
    else kind = price.billing_cycle ? 'recurring' : 'one_time';
  }
  if (discountId !== null) {
    if (!DISCOUNT_ID_RE.test(discountId)) {
      problems.push({ code: 'invalid_discount', plan, discount_id: discountId, reason: 'malformed' });
    } else {
      const discount = await lookup(() => paddle.getDiscount(discountId));
      if (!discount) problems.push({ code: 'invalid_discount', plan, discount_id: discountId, reason: 'not_found' });
      else if (discount.status !== 'active') problems.push({ code: 'invalid_discount', plan, discount_id: discountId, reason: discount.status });
    }
  }
  return { problems, row: { plan, priceId, discountId, kind } };
}

export async function listFunnelPrices(db, slug) {
  const id = await funnelId(db, slug);
  const { rows } = await db.query(
    `SELECT plan_key, paddle_price_id, paddle_discount_id, kind, updated_by, updated_at
       FROM funnel_prices WHERE funnel_id = $1 ORDER BY plan_key`,
    [id],
  );
  const plans = {};
  for (const r of rows) {
    plans[r.plan_key] = {
      price_id: r.paddle_price_id,
      discount_id: r.paddle_discount_id,
      kind: r.kind,
      updated_by: r.updated_by,
      updated_at: r.updated_at.toISOString(),
    };
  }
  return { funnel: slug, plans };
}

// plans: { <plan_key>: {price_id, discount_id?} | null }. Merge: listed keys are upserted, null deletes.
// Every price/discount is checked with Paddle first; any problem → 422 with all problems, nothing saved.
export async function setFunnelPrices(pool, paddle, { slug, plans, actor, log, alarm }) {
  const id = await funnelId(pool, slug);
  const checks = [];
  try {
    for (const [plan, value] of Object.entries(plans)) {
      if (!PLAN_KEY_RE.test(plan)) throw new HttpError(400, 'invalid_plan_key', { plan });
      if (value !== null) checks.push(await checkPlan(paddle, plan, value));
    }
  } catch (err) {
    throw await paddleHttpError(err, { log, alarm });
  }
  const problems = checks.flatMap((c) => c.problems);
  if (problems.length) throw new HttpError(422, problems[0].code, problems);

  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    for (const [plan, value] of Object.entries(plans)) {
      if (value === null) await c.query('DELETE FROM funnel_prices WHERE funnel_id = $1 AND plan_key = $2', [id, plan]);
    }
    for (const { row } of checks) {
      await c.query(
        `INSERT INTO funnel_prices (funnel_id, plan_key, paddle_price_id, paddle_discount_id, kind, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (funnel_id, plan_key) DO UPDATE
           SET paddle_price_id = EXCLUDED.paddle_price_id, paddle_discount_id = EXCLUDED.paddle_discount_id,
               kind = EXCLUDED.kind, updated_by = EXCLUDED.updated_by, updated_at = now()`,
        [id, row.plan, row.priceId, row.discountId, row.kind, actor],
      );
    }
    await c.query('COMMIT');
  } catch (err) {
    await c.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    c.release();
  }
  return listFunnelPrices(pool, slug);
}
```

`services/core-api/src/http/prices.js`:

```js
import { requireRole } from '../auth.js';
import { listFunnelPrices, setFunnelPrices } from '../billing/prices.js';

const params = {
  type: 'object',
  required: ['slug'],
  properties: { slug: { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{1,62}$' } },
};

const planValue = {
  anyOf: [
    { type: 'null' },
    {
      type: 'object',
      required: ['price_id'],
      properties: {
        price_id: { type: 'string', maxLength: 64 },
        discount_id: { type: ['string', 'null'], maxLength: 64 },
      },
    },
  ],
};

export default async function pricesHttp(app, { pool, paddle, alarm }) {
  app.put(
    '/v1/funnels/:slug/prices',
    {
      onRequest: requireRole(pool, 'router'),
      schema: {
        params,
        body: {
          type: 'object',
          required: ['plans'],
          properties: {
            plans: {
              type: 'object',
              minProperties: 1,
              maxProperties: 50,
              propertyNames: { pattern: '^[A-Za-z0-9_-]{1,40}$' },
              additionalProperties: planValue,
            },
          },
        },
      },
    },
    async (req) => setFunnelPrices(pool, paddle, { slug: req.params.slug, plans: req.body.plans, actor: req.actor, log: req.log, alarm }),
  );

  app.get('/v1/funnels/:slug/prices', { onRequest: requireRole(pool, ['router', 'publisher']), schema: { params } }, async (req) =>
    listFunnelPrices(pool, req.params.slug),
  );
}
```

`services/core-api/src/app.js`: thêm import sau dòng `import funnelsHttp from './http/funnels.js';`

```js
import pricesHttp from './http/prices.js';
```
và đăng ký ngay sau `if (deps?.kv) app.register(funnelsHttp, deps);`:

```js
  if (deps?.pool && deps?.paddle) app.register(pricesHttp, deps);
```

- [ ] **Step 5: Chạy test, xác nhận PASS**

Run: `npm test -w @ikf/core-api`
Expected: `Test Files  13 passed (13)`, `Tests  115 passed (115)`.

- [ ] **Step 6: Commit**

```bash
git add package-lock.json services/core-api
git commit -m "feat(core-api): funnel price mapping validated against Paddle"
```

---

### Task 4: CLI `ikf funnel prices set|ls` + cảnh báo khi `ikf publish`

**Files:**
- Create: `packages/cli/src/plans.js`
- Modify: `packages/cli/src/api.js`, `packages/cli/src/main.js`, `packages/cli/src/publish.js`
- Test: `packages/cli/test/plans.test.js`, `packages/cli/test/prices.test.js` (mới); thêm `describe` vào cuối `packages/cli/test/publish.test.js`

**Interfaces:**
- Consumes: `PUT/GET /v1/funnels/:slug/prices` (Task 3).
- Produces:
  - `planKeysFromHtml(html) → string[]` (key cấp 1 của `plans:{…}` và `checkoutUrl:{…}` đầu tiên, sort, không trùng) (B18).
  - `api.setPrices(slug, plans)` (PUT, retry), `api.listPrices(slug)` (GET, retry).
  - Lệnh: `ikf funnel prices set <slug> <plan>=pri_…[:dsc_…] … | <plan>=-`, `ikf funnel prices ls <slug>`; in `"<funnel>: N plan"` rồi mỗi dòng `"  <plan padEnd 12> <price_id>  <discount_id|- padEnd 30>  <kind>"`. Sai cú pháp → exit 2; lỗi API → exit 1 qua `formatApiError` sẵn có.
  - `ikf publish`: sau 3 dòng cũ, nếu có plan chưa map → `CẢNH BÁO: plan chưa map giá Paddle: <a, b>` + `  Chạy: ikf funnel prices set <slug> <plan>=pri_…[:dsc_…]`; tra cứu lỗi → `CẢNH BÁO: không kiểm tra được map giá Paddle (<msg>)`. Exit code không đổi.

- [ ] **Step 1: Viết test fail**

`packages/cli/test/plans.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { planKeysFromHtml } from '../src/plans.js';

describe('planKeysFromHtml', () => {
  it('reads the top-level keys of CONFIG.plans and CONFIG.checkoutUrl (addon lives only in checkoutUrl)', () => {
    const html = `<script>const CONFIG={slug:'x',
      plans:{'1w':{name:'1 week',intro:'$13.67',price:'$49.99'},"4w":{name:'4, weeks {x}',sub:{a:1}},m12:{price:'$99'}},
      checkoutUrl:{'1w':'',addon:'' , m12 : ''},upsell:{plans:{z:1}}};</script>`;
    expect(planKeysFromHtml(html)).toEqual(['1w', '4w', 'addon', 'm12']);
  });

  it('ignores a checkoutUrl that is a single string, and pages without plans', () => {
    expect(planKeysFromHtml("const CONFIG={checkoutUrl:'',expiresMin:null}")).toEqual([]);
    expect(planKeysFromHtml('<p>hi</p>')).toEqual([]);
  });

  it('skips braces and quotes inside strings and template literals', () => {
    const html = "plans:{weekly:{name:'a}b',note:\"c{d\",tpl:`e}${'f'}`},yearly:{price:'$1'}}";
    expect(planKeysFromHtml(html)).toEqual(['weekly', 'yearly']);
  });

  it('survives an unterminated object', () => {
    expect(planKeysFromHtml('plans:{a:{b:1},c:')).toEqual(['a', 'c']);
  });
});
```

`packages/cli/test/prices.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { run } from '../src/main.js';
import { createApi } from '../src/api.js';

const W1 = 'pri_01aaaaaaaaaaaaaaaaaaaaaaaa';
const ADDON = 'pri_01bbbbbbbbbbbbbbbbbbbbbbbb';
const DSC = 'dsc_01dddddddddddddddddddddddd';

function io(api = {}) {
  const lines = [];
  const errors = [];
  return { lines, errors, opts: { out: (l) => lines.push(l), err: (l) => errors.push(l), env: {}, deps: { api } } };
}
const map = {
  funnel: 'aivideo',
  plans: {
    '1w': { price_id: W1, discount_id: DSC, kind: 'recurring', updated_by: 'router', updated_at: '2026-10-09T10:00:00.000Z' },
    addon: { price_id: ADDON, discount_id: null, kind: 'one_time', updated_by: 'router', updated_at: '2026-10-09T10:00:00.000Z' },
  },
};
const printed = [
  'aivideo: 2 plan',
  `  1w           ${W1}  ${DSC}  recurring`,
  `  addon        ${ADDON}  ${'-'.padEnd(30)}  one_time`,
];

describe('ikf funnel prices', () => {
  it('set sends plan=price[:discount] pairs and prints the resulting map', async () => {
    const calls = [];
    const t = io({ setPrices: async (slug, plans) => { calls.push([slug, plans]); return map; } });
    expect(await run(['funnel', 'prices', 'set', 'aivideo', `1w=${W1}:${DSC}`, `addon=${ADDON}`, 'old=-'], t.opts)).toBe(0);
    expect(calls).toEqual([['aivideo', { '1w': { price_id: W1, discount_id: DSC }, addon: { price_id: ADDON }, old: null }]]);
    expect(t.lines).toEqual(printed);
  });

  it('ls prints the map, or says there is none', async () => {
    const t = io({ listPrices: async () => map });
    expect(await run(['funnel', 'prices', 'ls', 'aivideo'], t.opts)).toBe(0);
    expect(t.lines).toEqual(printed);
    const empty = io({ listPrices: async () => ({ funnel: 'aivideo', plans: {} }) });
    await run(['funnel', 'prices', 'ls', 'aivideo'], empty.opts);
    expect(empty.lines).toEqual(['aivideo: chưa map plan nào (ikf funnel prices set aivideo <plan>=pri_…)']);
  });

  it.each([
    [['funnel', 'prices', 'set', 'aivideo'], 'cần ít nhất một <plan>=pri_…[:dsc_…]'],
    [['funnel', 'prices', 'set', 'aivideo', '1w'], 'không hiểu "1w"; dạng đúng: <plan>=pri_…[:dsc_…] hoặc <plan>=-'],
    [['funnel', 'prices', 'set', 'aivideo', '1w=price_1'], 'không hiểu "1w=price_1"; dạng đúng: <plan>=pri_…[:dsc_…] hoặc <plan>=-'],
    [['funnel', 'prices', 'set', 'aivideo', `1w=${W1}`, `1w=${ADDON}`], 'plan "1w" xuất hiện 2 lần'],
    [['funnel', 'prices', 'ls', 'Bad Slug'], 'slug không hợp lệ: "Bad Slug"'],
  ])('exits 2 on bad usage %j', async (argv, msg) => {
    const t = io({ setPrices: async () => { throw new Error('must not be called'); } });
    expect(await run(argv, t.opts)).toBe(2);
    expect(t.errors).toEqual([msg]);
  });

  it('prints every Paddle problem from a 422', async () => {
    const { ApiError } = await import('../src/api.js');
    const t = io({
      setPrices: async () => {
        throw new ApiError(422, { error: 'invalid_price', detail: [{ code: 'invalid_price', plan: '1w', price_id: W1, reason: 'archived' }] });
      },
    });
    expect(await run(['funnel', 'prices', 'set', 'aivideo', `1w=${W1}`], t.opts)).toBe(1);
    expect(t.errors).toEqual([`Lỗi 422 invalid_price\n  {"code":"invalid_price","plan":"1w","price_id":"${W1}","reason":"archived"}`]);
  });
});

describe('api prices', () => {
  it('PUT and GET /v1/funnels/:slug/prices', async () => {
    const calls = [];
    const fetch = async (url, init) => {
      calls.push({ url, method: init.method, body: init.body && JSON.parse(init.body) });
      return new Response(JSON.stringify(map), { status: 200 });
    };
    const api = createApi({ api: 'https://api.x', token: 't' }, { fetch, sleep: async () => {} });
    await api.setPrices('aivideo', { '1w': { price_id: W1 } });
    await api.listPrices('aivideo');
    expect(calls).toEqual([
      { url: 'https://api.x/v1/funnels/aivideo/prices', method: 'PUT', body: { plans: { '1w': { price_id: W1 } } } },
      { url: 'https://api.x/v1/funnels/aivideo/prices', method: 'GET', body: undefined },
    ]);
  });
});
```

`packages/cli/test/publish.test.js`: thêm vào **cuối file**:

```js
describe('ikf publish: unmapped plan warning', () => {
  const html = "<script>const CONFIG={funnel:'aivideo',plans:{'1w':{price:'$1'},m1:{price:'$2'}},checkoutUrl:{'1w':'',m1:'',addon:''}}</script>";
  const publish = async () => ({ funnel: 'aivideo', v: 4, created: true, preview_url: 'p' });

  it('warns about plans in CONFIG without a Paddle price, and still succeeds', async () => {
    const folder = await funnelFolder(html);
    const lines = [];
    const code = await run(['publish', folder, '--slug', 'aivideo'], {
      out: (l) => lines.push(l),
      env: {},
      deps: {
        runner: async () => ({ code: 0, output: '' }),
        api: { publish, listPrices: async () => ({ funnel: 'aivideo', plans: { '1w': { price_id: 'pri_x' } } }) },
      },
    });
    expect(code).toBe(0);
    expect(lines.slice(-2)).toEqual([
      'CẢNH BÁO: plan chưa map giá Paddle: addon, m1',
      '  Chạy: ikf funnel prices set aivideo <plan>=pri_…[:dsc_…]',
    ]);
  });

  it('says nothing when every plan is mapped', async () => {
    const folder = await funnelFolder(html);
    const lines = [];
    const plans = { '1w': {}, m1: {}, addon: {} };
    await run(['publish', folder, '--slug', 'aivideo'], {
      out: (l) => lines.push(l),
      env: {},
      deps: { runner: async () => ({ code: 0, output: '' }), api: { publish, listPrices: async () => ({ funnel: 'aivideo', plans }) } },
    });
    expect(lines.join('\n')).not.toContain('CẢNH BÁO');
  });

  it('a failing price lookup is only a warning', async () => {
    const folder = await funnelFolder(html);
    const lines = [];
    const code = await run(['publish', folder, '--slug', 'aivideo'], {
      out: (l) => lines.push(l),
      env: {},
      deps: {
        runner: async () => ({ code: 0, output: '' }),
        api: { publish, listPrices: async () => { throw new Error('down'); } },
      },
    });
    expect(code).toBe(0);
    expect(lines.at(-1)).toBe('CẢNH BÁO: không kiểm tra được map giá Paddle (down)');
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run: `npm test -w @ikf/cli`
Expected: FAIL — `plans.test.js` không tìm thấy `../src/plans.js`; `prices.test.js` exit 2 (usage) thay vì 0; 3 test publish mới thiếu dòng `CẢNH BÁO`. 70 test cũ vẫn pass.

- [ ] **Step 3: Implement**

`packages/cli/src/plans.js`:

```js
// Top-level keys of the first `plans:{…}` and `checkoutUrl:{…}` object literals in a funnel's CONFIG.
// A tiny scanner (strings, template literals and nesting aware), not a JS parser: CONFIG is data.
export function planKeysFromHtml(html) {
  const keys = new Set();
  for (const name of ['plans', 'checkoutUrl']) {
    const m = new RegExp(`\\b${name}\\s*:\\s*\\{`).exec(html);
    if (m) for (const k of objectKeys(html, m.index + m[0].length)) keys.add(k);
  }
  return [...keys].sort();
}

function objectKeys(s, start) {
  const keys = [];
  let depth = 1;
  let expectKey = true;
  let i = start;
  while (i < s.length && depth > 0) {
    const c = s[i];
    if (c === '"' || c === "'" || c === '`') {
      const end = skipString(s, i);
      if (depth === 1 && expectKey) {
        const after = s.slice(end).match(/^\s*:/);
        if (after) keys.push(s.slice(i + 1, end - 1));
        expectKey = false;
      }
      i = end;
      continue;
    }
    if (c === '{' || c === '[' || c === '(') depth += 1;
    else if (c === '}' || c === ']' || c === ')') depth -= 1;
    else if (c === ',' && depth === 1) expectKey = true;
    else if (depth === 1 && expectKey && /[A-Za-z0-9_$]/.test(c)) {
      const word = /^[A-Za-z0-9_$-]+/.exec(s.slice(i))[0];
      if (/^\s*:/.test(s.slice(i + word.length))) keys.push(word);
      expectKey = false;
      i += word.length;
      continue;
    }
    i += 1;
  }
  return keys;
}

function skipString(s, i) {
  const q = s[i];
  let j = i + 1;
  while (j < s.length && s[j] !== q) j += s[j] === '\\' ? 2 : 1;
  return j + 1;
}
```

`packages/cli/src/api.js`: thêm ngay sau dòng `setFunnel: …`:

```js
    // Idempotent: the same map twice gives the same result.
    setPrices: (slug, plans) => call('PUT', `/v1/funnels/${slug}/prices`, { body: { plans }, retry: true }),
    listPrices: (slug) => call('GET', `/v1/funnels/${slug}/prices`, { retry: true }),
```

`packages/cli/src/main.js`:

1. Trong `USAGE`, ngay sau dòng `  ikf funnel set <slug> --pixel <id> | --no-pixel` thêm:
```
  ikf funnel prices set <slug> <plan>=pri_…[:dsc_…] … (<plan>=- để gỡ)
  ikf funnel prices ls <slug>
```
2. Ngay trước `async function funnelCommand(` thêm:
```js
const PAIR_RE = /^([A-Za-z0-9_-]{1,40})=(?:(-)|(pri_[a-z0-9]{26})(?::(dsc_[a-z0-9]{26}))?)$/;

function printPrices(out, r) {
  const keys = Object.keys(r.plans);
  if (!keys.length) {
    out(`${r.funnel}: chưa map plan nào (ikf funnel prices set ${r.funnel} <plan>=pri_…)`);
    return;
  }
  out(`${r.funnel}: ${keys.length} plan`);
  for (const k of keys) {
    const p = r.plans[k];
    out(`  ${k.padEnd(12)} ${p.price_id}  ${(p.discount_id ?? '-').padEnd(30)}  ${p.kind}`);
  }
}

async function pricesCommand(api, args, out) {
  const [action, slug, ...pairs] = args;
  if (!['set', 'ls'].includes(action) || !slug) throw new UsageError(USAGE);
  if (!SLUG_RE.test(slug)) throw new UsageError(`slug không hợp lệ: "${slug}"`);
  if (action === 'ls') {
    printPrices(out, await api.listPrices(slug));
    return 0;
  }
  if (!pairs.length) throw new UsageError('cần ít nhất một <plan>=pri_…[:dsc_…]');
  const plans = {};
  for (const pair of pairs) {
    const m = PAIR_RE.exec(pair);
    if (!m) throw new UsageError(`không hiểu "${pair}"; dạng đúng: <plan>=pri_…[:dsc_…] hoặc <plan>=-`);
    if (Object.hasOwn(plans, m[1])) throw new UsageError(`plan "${m[1]}" xuất hiện 2 lần`);
    plans[m[1]] = m[2] ? null : { price_id: m[3], ...(m[4] && { discount_id: m[4] }) };
  }
  printPrices(out, await api.setPrices(slug, plans));
  return 0;
}

```
3. Dòng đầu thân `funnelCommand` (trước `const slug = args[0];`) thêm:
```js
  if (sub === 'prices') return pricesCommand(api, args, out);
```

`packages/cli/src/publish.js`: thêm import sau dòng `import { findToolsDir, runLocalChecks } from './checks.js';`

```js
import { planKeysFromHtml } from './plans.js';
```
thay
```js
  out(`Gắn vào traffic: ikf route set <host>/<path> ${res.funnel}@v${res.v}`);
  return res;
}
```
bằng
```js
  out(`Gắn vào traffic: ikf route set <host>/<path> ${res.funnel}@v${res.v}`);
  await warnUnmappedPlans({ api, slug, html, out });
  return res;
}

// Warning only: a funnel may be published before its prices exist.
async function warnUnmappedPlans({ api, slug, html, out }) {
  const keys = planKeysFromHtml(html);
  if (!keys.length) return;
  let mapped;
  try {
    mapped = (await api.listPrices(slug)).plans;
  } catch (err) {
    out(`CẢNH BÁO: không kiểm tra được map giá Paddle (${err.message})`);
    return;
  }
  const missing = keys.filter((k) => !Object.hasOwn(mapped, k));
  if (!missing.length) return;
  out(`CẢNH BÁO: plan chưa map giá Paddle: ${missing.join(', ')}`);
  out(`  Chạy: ikf funnel prices set ${slug} <plan>=pri_…[:dsc_…]`);
}
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

Run: `npm test -w @ikf/cli`
Expected: `Test Files  10 passed (10)`, `Tests  86 passed (86)`.

- [ ] **Step 5: Commit**

```bash
git add packages/cli
git commit -m "feat(cli): ikf funnel prices set|ls, publish warns about unmapped plans"
```

---

### Task 5: core-api — `POST /v1/checkout` (Turnstile, CORS, Paddle transaction) + `GET /v1/checkout/:id`

**Files:**
- Create: `services/core-api/src/billing/{ulid,turnstile,cors,checkout}.js`, `services/core-api/src/http/checkout.js`
- Modify: `services/core-api/package.json` (dep `@ikf/event-schema`), `services/core-api/src/app.js`
- Test: `services/core-api/test/checkout.test.js`, `services/core-api/test/turnstile.test.js`

**Interfaces:**
- Consumes: `PaddleClient.createCustomer/createTransaction`, `PaddleError` (Task 1); `paddleHttpError` (Task 3); bảng `checkouts`, `funnel_prices`, `domains`, `versions`; `cleanAttr` (`@ikf/event-schema`); test helper `fakePaddle` (Task 3).
- Produces:
  - `ulid(now?, bytes?) → string` (tạo `checkout_id`, cùng định dạng ULID với SDK).
  - `createTurnstileVerifier({secret, fetch?, timeoutMs = 5000}) → verify(token, ip?) → Promise<{ok: boolean, hostname: string|null, codes: string[]}>`; `TurnstileUnavailableError`; `SITEVERIFY_URL`. Server dùng ở Task 9.
  - `allowedOrigin(db, origin, previewHost) → Promise<boolean>`.
  - `cleanAttribution(a) → {utm_*, fbclid, ttclid, gclid, fbc?, fbp?}`.
  - `createCheckout({pool, paddle, turnstile, log, alarm}, {origin, ip, body}) → {checkout_id, transaction_id}`; Paddle body `{items:[{price_id, quantity:1}], discount_id?, customer_id?, custom_data:{checkout_id, sid, funnel, v, plan}}` (B1). `getCheckout(db, id) → {checkout_id, status, plan}`.
  - HTTP (SDK dùng ở Task 10, 11):
    - `OPTIONS /v1/checkout`, `OPTIONS /v1/checkout/:id` → `204` + `access-control-allow-origin: <origin>`, `-methods: GET, POST`, `-headers: content-type`, `-max-age: 600`, `vary: origin`.
    - `POST /v1/checkout` body `{funnel, v, plan, sid (ULID), email?, attribution?, turnstile_token}` (≤ 16KB) → `201 {"checkout_id","transaction_id"}`; lỗi `403 origin_not_allowed|turnstile_failed`, `404 funnel_not_found {funnel, v}`, `422 plan_not_mapped {funnel, plan}`, `503 turnstile_unavailable|paddle_unavailable`, `400`, `413`.
    - `GET /v1/checkout/:id` → `200 {"checkout_id","status":"created"|"completed"|"abandoned","plan"}` (`cache-control: no-store`); `404 checkout_not_found`.
  - `buildApp` deps mới: `turnstile` (hàm `verify`). Đăng ký khi có `pool` + `paddle` + `turnstile`. IP lấy từ `cf-connecting-ip`.

- [ ] **Step 1: Thêm dependency**

```bash
npm pkg set 'dependencies.@ikf/event-schema=*' -w @ikf/core-api
npm install --no-audit --no-fund
```

- [ ] **Step 2: Viết test fail**

`services/core-api/test/checkout.test.js`:

```js
import { Writable } from 'node:stream';
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { isUlid } from '@ikf/event-schema';
import { buildApp } from '../src/app.js';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, seedVersions, PREVIEW } from './helpers/app.js';
import { fakeKv, fakeStore } from './helpers/fakes.js';
import { fakePaddle, PRICE_W1, PRICE_ADDON, DISCOUNT } from './helpers/paddle.js';

const ORIGIN = 'https://try.aivideo.app';
const SID = '01JA0000000000000000000002';
const EMAIL = 'buyer.person@example.com';

describe('POST /v1/checkout', () => {
  let db;
  let app;
  let paddle;
  let turnstileCalls;
  let turnstileReply;
  let alarms;

  const turnstile = async (token, ip) => {
    turnstileCalls.push({ token, ip });
    if (turnstileReply instanceof Error) throw turnstileReply;
    return turnstileReply;
  };

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    paddle = fakePaddle();
    turnstileCalls = [];
    turnstileReply = { ok: true, hostname: 'try.aivideo.app', codes: [] };
    alarms = [];
    let store;
    ({ app, store } = await makeApp(db.pool, { paddle, turnstile, alarm: async (kind) => alarms.push(kind) }));
    await seedVersions(db.pool, store, 'aivideo', 2);
    await db.pool.query("INSERT INTO domains (host, status) VALUES ('try.aivideo.app', 'active'), ('old.aivideo.app', 'disabled')");
    const fid = (await db.pool.query("SELECT id FROM funnels WHERE slug = 'aivideo'")).rows[0].id;
    await db.pool.query(
      `INSERT INTO funnel_prices (funnel_id, plan_key, paddle_price_id, paddle_discount_id, kind, updated_by)
       VALUES ($1, '1w', $2, $3, 'recurring', 't'), ($1, 'addon', $4, NULL, 'one_time', 't')`,
      [fid, PRICE_W1, DISCOUNT, PRICE_ADDON],
    );
  });
  afterEach(() => app.close());

  const body = (extra = {}) => ({
    funnel: 'aivideo', v: 2, plan: '1w', sid: SID, turnstile_token: 'tok',
    attribution: { utm_source: 'meta', utm_content: '120200000000000000', fbclid: 'IwAR1', fbc: 'fb.1.1760000000000.IwAR1', fbp: 'fb.1.1760000000000.1234567890', junk: 'x', utm_term: EMAIL },
    ...extra,
  });
  const post = (payload, headers = {}) =>
    app.inject({ method: 'POST', url: '/v1/checkout', headers: { origin: ORIGIN, 'cf-connecting-ip': '203.0.113.9', ...headers }, payload });

  it('creates a Paddle transaction for the mapped price and stores the checkout', async () => {
    const res = await post(body());
    expect(res.statusCode).toBe(201);
    const { checkout_id: checkoutId, transaction_id: txnId } = res.json();
    expect(isUlid(checkoutId)).toBe(true);
    expect(txnId).toMatch(/^txn_/);
    expect(res.headers['access-control-allow-origin']).toBe(ORIGIN);
    expect(turnstileCalls).toEqual([{ token: 'tok', ip: '203.0.113.9' }]);
    expect(paddle.calls).toEqual([
      ['createTransaction', {
        items: [{ price_id: PRICE_W1, quantity: 1 }],
        discount_id: DISCOUNT,
        custom_data: { checkout_id: checkoutId, sid: SID, funnel: 'aivideo', v: 2, plan: '1w' },
      }],
    ]);
    const { rows } = await db.pool.query('SELECT * FROM checkouts');
    expect(rows).toEqual([expect.objectContaining({
      id: checkoutId, paddle_transaction_id: txnId, v: 2, plan_key: '1w', sid: SID, status: 'created', completed_at: null,
      attribution: { utm_source: 'meta', utm_content: '120200000000000000', fbclid: 'IwAR1', fbc: 'fb.1.1760000000000.IwAR1', fbp: 'fb.1.1760000000000.1234567890' },
    })]);
  });

  it('add-on: one_time price, no discount', async () => {
    await post(body({ plan: 'addon' }));
    expect(paddle.calls[0][1]).toEqual({
      items: [{ price_id: PRICE_ADDON, quantity: 1 }],
      custom_data: expect.objectContaining({ plan: 'addon' }),
    });
  });

  it('email: creates the Paddle customer, or reuses the one Paddle says already has it', async () => {
    const first = await post(body({ email: ` ${EMAIL} ` }));
    expect(first.statusCode).toBe(201);
    expect(paddle.calls[0]).toEqual(['createCustomer', { email: EMAIL }]);
    const customerId = paddle.calls[1][1].customer_id;
    expect(customerId).toMatch(/^ctm_/);
    await post(body({ email: EMAIL }));
    expect(paddle.calls[3][1].customer_id).toBe(customerId); // 409 customer_already_exists → same id
  });

  it('a malformed email is ignored, not sent and not an error', async () => {
    expect((await post(body({ email: 'not an email' }))).statusCode).toBe(201);
    expect(paddle.calls.map((c) => c[0])).toEqual(['createTransaction']);
    expect(paddle.calls[0][1].customer_id).toBeUndefined();
  });

  it('email goes to Paddle only: not stored in checkouts, not logged', async () => {
    const lines = [];
    const stream = new Writable({ write(chunk, _enc, cb) { lines.push(chunk.toString()); cb(); } });
    const logged = buildApp({
      logger: { level: 'trace', stream },
      deps: { pool: db.pool, store: fakeStore(), kv: fakeKv(), mediaOrigins: [], previewBaseUrl: PREVIEW, paddle, turnstile },
    });
    await logged.ready();
    const send = (payload) => logged.inject({ method: 'POST', url: '/v1/checkout', headers: { origin: ORIGIN }, payload });
    expect((await send(body({ email: EMAIL }))).statusCode).toBe(201);
    paddle.fail('auth');
    expect((await send(body({ email: EMAIL }))).statusCode).toBe(503);
    paddle.ok();
    expect((await send(body({ email: EMAIL, v: 'x' }))).statusCode).toBe(400);
    await logged.close();
    const stored = JSON.stringify((await db.pool.query('SELECT * FROM checkouts')).rows);
    expect(stored).not.toContain('buyer.person');
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.join('')).not.toContain('buyer.person');
  });

  it('403 turnstile_failed when Siteverify says no, or the token was issued for another host', async () => {
    turnstileReply = { ok: false, hostname: null, codes: ['invalid-input-response'] };
    expect((await post(body())).json()).toEqual({ error: 'turnstile_failed' });
    turnstileReply = { ok: true, hostname: 'evil.example', codes: [] };
    const res = await post(body());
    expect(res.statusCode).toBe(403);
    expect(paddle.calls).toEqual([]);
  });

  it('503 turnstile_unavailable when Siteverify cannot be reached', async () => {
    const { TurnstileUnavailableError } = await import('../src/billing/turnstile.js');
    turnstileReply = new TurnstileUnavailableError('down');
    expect((await post(body())).json()).toEqual({ error: 'turnstile_unavailable' });
  });

  it('404 for an unknown funnel version, 422 plan_not_mapped for an unmapped plan', async () => {
    expect((await post(body({ v: 9 }))).json()).toEqual({ error: 'funnel_not_found', detail: { funnel: 'aivideo', v: 9 } });
    const res = await post(body({ plan: 'm12' }));
    expect(res.statusCode).toBe(422);
    expect(res.json()).toEqual({ error: 'plan_not_mapped', detail: { funnel: 'aivideo', plan: 'm12' } });
    expect(paddle.calls).toEqual([]);
  });

  it('503 paddle_unavailable when Paddle is down or rejects the call; alarm when the key is rejected', async () => {
    paddle.fail('unavailable');
    expect((await post(body())).json()).toEqual({ error: 'paddle_unavailable' });
    paddle.fail('client');
    expect((await post(body())).statusCode).toBe(503);
    expect(alarms).toEqual([]);
    paddle.fail('auth');
    expect((await post(body())).statusCode).toBe(503);
    expect(alarms).toEqual(['paddle_auth_failed']);
    expect((await db.pool.query('SELECT count(*)::int AS n FROM checkouts')).rows[0].n).toBe(0);
  });

  it('400 for a malformed body, 413 above 16KB', async () => {
    expect((await post(body({ sid: 'nope' }))).statusCode).toBe(400);
    expect((await post(body({ turnstile_token: undefined }))).statusCode).toBe(400);
    expect((await post(body({ attribution: { utm_source: 'x'.repeat(17000) } }))).statusCode).toBe(413);
  });
});

describe('checkout CORS and GET /v1/checkout/:id', () => {
  let db;
  let app;
  let store;
  const turnstile = async () => ({ ok: true, hostname: 'try.aivideo.app', codes: [] });

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    ({ app, store } = await makeApp(db.pool, { paddle: fakePaddle(), turnstile }));
    await seedVersions(db.pool, store, 'aivideo', 1);
    await db.pool.query("INSERT INTO domains (host, status) VALUES ('try.aivideo.app', 'active'), ('old.aivideo.app', 'disabled')");
  });
  afterEach(() => app.close());

  const preflight = (origin, url = '/v1/checkout') =>
    app.inject({ method: 'OPTIONS', url, headers: { ...(origin && { origin }), 'access-control-request-method': 'POST', 'access-control-request-headers': 'content-type' } });

  it('preflight from an active funnel domain or the preview host', async () => {
    for (const origin of [ORIGIN, PREVIEW]) {
      const res = await preflight(origin);
      expect(res.statusCode).toBe(204);
      expect(res.headers).toMatchObject({
        'access-control-allow-origin': origin,
        'access-control-allow-methods': 'GET, POST',
        'access-control-allow-headers': 'content-type',
        'access-control-max-age': '600',
        vary: 'origin',
      });
    }
    expect((await preflight(ORIGIN, '/v1/checkout/01JA0000000000000000000001')).statusCode).toBe(204);
  });

  it.each([
    ['unknown host', 'https://evil.example'],
    ['disabled domain', 'https://old.aivideo.app'],
    ['plain http', 'http://try.aivideo.app'],
    ['origin with a path', 'https://try.aivideo.app/x'],
    ['no origin', undefined],
  ])('403 origin_not_allowed: %s', async (_name, origin) => {
    const res = await preflight(origin);
    expect(res.statusCode).toBe(403);
    expect(res.json()).toEqual({ error: 'origin_not_allowed' });
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('GET /v1/checkout/:id returns status and plan only', async () => {
    const fid = (await db.pool.query("SELECT id FROM funnels WHERE slug = 'aivideo'")).rows[0].id;
    await db.pool.query(
      `INSERT INTO checkouts (id, paddle_transaction_id, funnel_id, v, plan_key, sid, attribution, status)
       VALUES ('01JA0000000000000000000001', 'txn_1', $1, 1, 'addon', $2, '{"utm_source":"meta"}', 'completed')`,
      [fid, SID],
    );
    const res = await app.inject({ method: 'GET', url: '/v1/checkout/01JA0000000000000000000001', headers: { origin: ORIGIN } });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ checkout_id: '01JA0000000000000000000001', status: 'completed', plan: 'addon' });
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.headers['access-control-allow-origin']).toBe(ORIGIN);
  });

  it('GET: 404 unknown id, 400 malformed id, 403 foreign origin', async () => {
    const get = (id, origin = ORIGIN) => app.inject({ method: 'GET', url: `/v1/checkout/${id}`, headers: { origin } });
    expect((await get('01JA0000000000000000000009')).json()).toEqual({ error: 'checkout_not_found' });
    expect((await get('nope')).statusCode).toBe(400);
    expect((await get('01JA0000000000000000000009', 'https://evil.example')).statusCode).toBe(403);
  });
});
```

`services/core-api/test/turnstile.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { createTurnstileVerifier, SITEVERIFY_URL, TurnstileUnavailableError } from '../src/billing/turnstile.js';

describe('createTurnstileVerifier', () => {
  it('POSTs secret, token and IP as a form to Siteverify and returns success + hostname', async () => {
    const calls = [];
    const fetch = async (url, init) => {
      calls.push({ url, init });
      return new Response(JSON.stringify({ success: true, hostname: 'try.x.com', 'error-codes': [] }), { status: 200 });
    };
    const verify = createTurnstileVerifier({ secret: 's3cret', fetch });
    expect(await verify('tok', '203.0.113.9')).toEqual({ ok: true, hostname: 'try.x.com', codes: [] });
    expect(calls[0].url).toBe(SITEVERIFY_URL);
    expect(calls[0].init.method).toBe('POST');
    expect(Object.fromEntries(new URLSearchParams(calls[0].init.body))).toEqual({ secret: 's3cret', response: 'tok', remoteip: '203.0.113.9' });
  });

  it('a failed check is not an error', async () => {
    const fetch = async () => new Response(JSON.stringify({ success: false, 'error-codes': ['timeout-or-duplicate'] }), { status: 200 });
    expect(await createTurnstileVerifier({ secret: 's', fetch })('tok')).toEqual({ ok: false, hostname: null, codes: ['timeout-or-duplicate'] });
  });

  it('network errors and 5xx are TurnstileUnavailableError', async () => {
    const down = createTurnstileVerifier({ secret: 's', fetch: async () => { throw new TypeError('fetch failed'); } });
    await expect(down('tok')).rejects.toBeInstanceOf(TurnstileUnavailableError);
    const err = createTurnstileVerifier({ secret: 's', fetch: async () => new Response('', { status: 502 }) });
    await expect(err('tok')).rejects.toBeInstanceOf(TurnstileUnavailableError);
  });
});
```

- [ ] **Step 3: Chạy test, xác nhận FAIL**

Run: `npm test -w @ikf/core-api`
Expected: FAIL — `turnstile.test.js` không tìm thấy `../src/billing/turnstile.js`; `checkout.test.js` 18 test fail (`404` cho `/v1/checkout`). 115 test cũ pass.

- [ ] **Step 4: Implement**

`services/core-api/src/billing/ulid.js`:

```js
import { randomBytes } from 'node:crypto';

const ENC = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

// 48-bit ms timestamp + 80 random bits, Crockford base32 (26 chars) — same format as the SDK's ids.
export function ulid(now = Date.now(), bytes = randomBytes(16)) {
  let t = now;
  let time = '';
  for (let i = 0; i < 10; i += 1) {
    time = ENC[t % 32] + time;
    t = Math.floor(t / 32);
  }
  let rand = '';
  for (let i = 0; i < 16; i += 1) rand += ENC[bytes[i] % 32];
  return time + rand;
}
```

`services/core-api/src/billing/turnstile.js`:

```js
export const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export class TurnstileUnavailableError extends Error {}

// verify(token, ip?) → {ok, hostname, codes}; throws TurnstileUnavailableError when Siteverify is unreachable.
export function createTurnstileVerifier({ secret, fetch: doFetch = globalThis.fetch, timeoutMs = 5000 }) {
  return async function verify(token, ip) {
    let res;
    try {
      res = await doFetch(SITEVERIFY_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret, response: token, ...(ip && { remoteip: ip }) }).toString(),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (err) {
      throw new TurnstileUnavailableError(`siteverify unreachable: ${err.message}`);
    }
    if (!res.ok) throw new TurnstileUnavailableError(`siteverify HTTP ${res.status}`);
    const body = await res.json().catch(() => ({}));
    return { ok: body.success === true, hostname: body.hostname ?? null, codes: body['error-codes'] ?? [] };
  };
}
```

`services/core-api/src/billing/cors.js`:

```js
// Checkout is called cross-origin from funnel pages: only https origins of an active funnel domain
// (the domains table, synced from Terraform) or the preview host may call it.
export async function allowedOrigin(db, origin, previewHost) {
  if (typeof origin !== 'string') return false;
  let url;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:' || url.origin !== origin) return false;
  if (url.hostname === previewHost) return true;
  const { rows } = await db.query("SELECT 1 FROM domains WHERE host = $1 AND status = 'active'", [url.hostname]);
  return rows.length > 0;
}
```

`services/core-api/src/billing/checkout.js`:

```js
import { cleanAttr } from '@ikf/event-schema';
import { PaddleError } from '@ikf/paddle';
import { HttpError } from '../errors.js';
import { paddleHttpError } from './errors.js';
import { TurnstileUnavailableError } from './turnstile.js';
import { ulid } from './ulid.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FBC_RE = /^fb\.1\.\d{10,16}\.[A-Za-z0-9_-]{1,500}$/;
const FBP_RE = /^fb\.1\.\d{10,16}\.\d{1,20}$/;

// UTM + click ids (no value containing an email) and the Meta cookies; nothing else from the browser.
export function cleanAttribution(a) {
  const src = a && typeof a === 'object' ? a : {};
  return {
    ...cleanAttr(src),
    ...(typeof src.fbc === 'string' && FBC_RE.test(src.fbc) && { fbc: src.fbc }),
    ...(typeof src.fbp === 'string' && FBP_RE.test(src.fbp) && { fbp: src.fbp }),
  };
}

// Paddle has no "customer by email" on POST /transactions: create the customer, or take the id
// Paddle reports in its 409. null → the transaction goes without a customer (user types the email).
async function resolveCustomer(paddle, email) {
  try {
    return (await paddle.createCustomer({ email })).id;
  } catch (err) {
    if (!(err instanceof PaddleError) || err.kind !== 'client') throw err;
    const m = err.code === 'customer_already_exists' ? /\bctm_[a-z0-9]+\b/.exec(err.detail ?? '') : null;
    return m ? m[0] : null;
  }
}

export async function createCheckout({ pool, paddle, turnstile, log, alarm }, { origin, ip, body }) {
  const { funnel, v, plan, sid } = body;
  let check;
  try {
    check = await turnstile(body.turnstile_token, ip);
  } catch (err) {
    if (err instanceof TurnstileUnavailableError) throw new HttpError(503, 'turnstile_unavailable');
    throw err;
  }
  if (!check.ok || check.hostname !== new URL(origin).hostname) throw new HttpError(403, 'turnstile_failed');

  const f = await pool.query(
    'SELECT f.id FROM funnels f JOIN versions v ON v.funnel_id = f.id WHERE f.slug = $1 AND v.n = $2',
    [funnel, v],
  );
  if (!f.rows.length) throw new HttpError(404, 'funnel_not_found', { funnel, v });
  const funnelId = f.rows[0].id;
  const p = await pool.query(
    'SELECT paddle_price_id, paddle_discount_id FROM funnel_prices WHERE funnel_id = $1 AND plan_key = $2',
    [funnelId, plan],
  );
  if (!p.rows.length) throw new HttpError(422, 'plan_not_mapped', { funnel, plan });
  const { paddle_price_id: priceId, paddle_discount_id: discountId } = p.rows[0];

  const checkoutId = ulid();
  const email = typeof body.email === 'string' && EMAIL_RE.test(body.email.trim()) ? body.email.trim() : null;
  let txn;
  try {
    const customerId = email ? await resolveCustomer(paddle, email) : null;
    txn = await paddle.createTransaction({
      items: [{ price_id: priceId, quantity: 1 }],
      ...(discountId && { discount_id: discountId }),
      ...(customerId && { customer_id: customerId }),
      custom_data: { checkout_id: checkoutId, sid, funnel, v, plan },
    });
  } catch (err) {
    const mapped = await paddleHttpError(err, { log, alarm });
    if (mapped instanceof PaddleError) {
      log?.error({ status: mapped.status, code: mapped.code }, 'paddle_rejected_transaction');
      throw new HttpError(503, 'paddle_unavailable');
    }
    throw mapped;
  }

  await pool.query(
    `INSERT INTO checkouts (id, paddle_transaction_id, funnel_id, v, plan_key, sid, attribution)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [checkoutId, txn.id, funnelId, v, plan, sid, cleanAttribution(body.attribution)],
  );
  return { checkout_id: checkoutId, transaction_id: txn.id };
}

export async function getCheckout(db, id) {
  const { rows } = await db.query('SELECT id, status, plan_key FROM checkouts WHERE id = $1', [id]);
  if (!rows.length) throw new HttpError(404, 'checkout_not_found');
  return { checkout_id: rows[0].id, status: rows[0].status, plan: rows[0].plan_key };
}
```

`services/core-api/src/http/checkout.js`:

```js
import { createCheckout, getCheckout } from '../billing/checkout.js';
import { allowedOrigin } from '../billing/cors.js';

const ULID = '^[0-7][0-9A-HJKMNP-TV-Z]{25}$';

export default async function checkoutHttp(app, deps) {
  const { pool, previewBaseUrl } = deps;
  const previewHost = new URL(previewBaseUrl).hostname;

  // CORS for the routes of this plugin only; a foreign origin never reaches a handler.
  app.addHook('onRequest', async (req, reply) => {
    const origin = req.headers.origin;
    if (!(await allowedOrigin(pool, origin, previewHost))) {
      return reply.code(403).header('cache-control', 'no-store').send({ error: 'origin_not_allowed' });
    }
    reply.header('access-control-allow-origin', origin).header('vary', 'origin');
  });

  const preflight = async (req, reply) =>
    reply
      .code(204)
      .header('access-control-allow-methods', 'GET, POST')
      .header('access-control-allow-headers', 'content-type')
      .header('access-control-max-age', '600')
      .send();
  app.options('/v1/checkout', preflight);
  app.options('/v1/checkout/:id', preflight);

  app.post(
    '/v1/checkout',
    {
      bodyLimit: 16 * 1024,
      schema: {
        body: {
          type: 'object',
          required: ['funnel', 'v', 'plan', 'sid', 'turnstile_token'],
          properties: {
            funnel: { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{1,62}$' },
            v: { type: 'integer', minimum: 1 },
            plan: { type: 'string', pattern: '^[A-Za-z0-9_-]{1,40}$' },
            sid: { type: 'string', pattern: ULID },
            email: { type: 'string', maxLength: 254 },
            attribution: { type: 'object' },
            turnstile_token: { type: 'string', minLength: 1, maxLength: 4096 },
          },
        },
      },
    },
    async (req, reply) => {
      const ip = req.headers['cf-connecting-ip'] ?? req.ip;
      const out = await createCheckout(
        { ...deps, log: req.log },
        { origin: req.headers.origin, ip, body: req.body },
      );
      reply.code(201).header('cache-control', 'no-store');
      return out;
    },
  );

  app.get(
    '/v1/checkout/:id',
    { schema: { params: { type: 'object', required: ['id'], properties: { id: { type: 'string', pattern: ULID } } } } },
    async (req, reply) => {
      reply.header('cache-control', 'no-store');
      return getCheckout(pool, req.params.id);
    },
  );
}
```

`services/core-api/src/app.js`: thêm import sau `import pricesHttp from './http/prices.js';`

```js
import checkoutHttp from './http/checkout.js';
```
và đăng ký ngay sau dòng `pricesHttp`:

```js
  if (deps?.pool && deps?.paddle && deps?.turnstile) app.register(checkoutHttp, deps);
```

- [ ] **Step 5: Chạy test, xác nhận PASS**

Run: `npm test -w @ikf/core-api`
Expected: `Test Files  15 passed (15)`, `Tests  136 passed (136)`.

- [ ] **Step 6: Commit**

```bash
git add package-lock.json services/core-api
git commit -m "feat(core-api): POST /v1/checkout (Turnstile, CORS, Paddle transaction) + GET status"
```

---

### Task 6: core-api — webhook `POST /v1/paddle/webhook` (raw body, chữ ký, inbox, SQS) + hàng đợi SQS

**Files:**
- Create: `services/core-api/src/billing/queue.js`, `services/core-api/src/billing/webhook.js`, `services/core-api/src/http/webhook.js`
- Create (test helper): `services/core-api/test/helpers/queue.js`
- Modify: `services/core-api/package.json` (dep `@aws-sdk/client-sqs`), `services/core-api/src/app.js`
- Test: `services/core-api/test/queue.test.js`, `services/core-api/test/webhook.test.js`

**Interfaces:**
- Consumes: `verifyWebhook`, `signWebhook` (Task 1); bảng `webhook_inbox` (Task 2).
- Produces:
  - Hằng `RECEIVE_WAIT_SECONDS = 20`, `RECEIVE_MAX_MESSAGES = 10`, `VISIBILITY_TIMEOUT_SECONDS = 60`.
  - `Queue` = `{send(body: object) → Promise<void>, receive({signal?}) → Promise<{id, receiptHandle, receiveCount, body: object|null}[]>, delete(receiptHandle) → Promise<void>}`.
  - `createSqsQueue({client: SQSClient, queueUrl}) → Queue` (dùng ở Task 9).
  - `startQueueWorker({queue, handle(body, message) → Promise, log, errorBackoffMs = 5000}) → stop(): Promise<void>` (Task 9 nối `handle = syncMessage` của Task 7).
  - SQS message `{"event_id","event_type","entity":"subscription"|"transaction","entity_id"}` (Task 7 đọc, Task 8 reconcile gửi cùng dạng).
  - `entityOf(event) → {entity, entity_id} | null`, `isPaddleEvent(e)`, `acceptWebhook(pool, queue, event) → 'queued'|'duplicate'|'ignored'`.
  - `POST /v1/paddle/webhook` (không cần token) → `200 {"status":"queued"|"duplicate"|"ignored"}`; `401 {"error":"invalid_signature"}`; `400 bad_request`; `413`; `503 {"error":"unavailable"}`.
  - `buildApp` deps mới: `queue`, `webhookSecret`, `now?`. Đăng ký khi có `pool` + `queue` + `webhookSecret`.
  - Test helper `fakeQueue()` → `Queue` + `sent[]`, `deleted[]`, `fail(on)`, `redeliver()`, `inFlight`, `pending` (Task 7, 8 dùng).

- [ ] **Step 1: Thêm dependency**

```bash
npm install --no-audit --no-fund @aws-sdk/client-sqs -w @ikf/core-api
```

- [ ] **Step 2: Viết test helper + test fail**

`services/core-api/test/helpers/queue.js`:

```js
// In-memory SQS with the createSqsQueue() surface. receive() long-polls: it waits for a send() or
// for the abort signal. redeliver() plays the visibility timeout: in-flight messages come back.
export function fakeQueue() {
  const pending = [];
  const inFlight = new Map();
  const waiters = new Set();
  let failing = false;
  let seq = 0;
  const wake = () => {
    for (const w of waiters) w();
    waiters.clear();
  };
  return {
    sent: [],
    deleted: [],
    fail(on = true) {
      failing = on;
    },
    async send(body) {
      if (failing) throw new Error('sqs unavailable');
      this.sent.push(structuredClone(body));
      seq += 1;
      pending.push({ id: `m${seq}`, receiptHandle: `rh${seq}`, body: structuredClone(body), receiveCount: 0 });
      wake();
    },
    async receive({ signal } = {}) {
      if (!pending.length) {
        await new Promise((resolve) => {
          waiters.add(resolve);
          signal?.addEventListener('abort', resolve, { once: true });
        });
      }
      const batch = pending.splice(0, 10);
      for (const m of batch) {
        m.receiveCount += 1;
        inFlight.set(m.receiptHandle, m);
      }
      return batch.map((m) => ({ ...m, body: structuredClone(m.body) }));
    },
    async delete(receiptHandle) {
      inFlight.delete(receiptHandle);
      this.deleted.push(receiptHandle);
    },
    redeliver() {
      pending.push(...inFlight.values());
      inFlight.clear();
      wake();
    },
    get inFlight() {
      return inFlight.size;
    },
    get pending() {
      return pending.length;
    },
  };
}
```

`services/core-api/test/queue.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { createSqsQueue, startQueueWorker } from '../src/billing/queue.js';
import { fakeQueue } from './helpers/queue.js';

const URL = 'https://sqs.us-east-1.amazonaws.com/111111111111/ikf-staging-webhooks';
const quiet = { error: () => {}, warn: () => {}, info: () => {} };

describe('createSqsQueue (AWS SDK v3 commands)', () => {
  const client = (reply = {}) => {
    const sent = [];
    return { sent, send: async (cmd, opts) => { sent.push({ name: cmd.constructor.name, input: cmd.input, opts }); return reply; } };
  };

  it('send: JSON body to the queue', async () => {
    const c = client();
    await createSqsQueue({ client: c, queueUrl: URL }).send({ event_id: 'evt_1' });
    expect(c.sent).toEqual([{ name: 'SendMessageCommand', input: { QueueUrl: URL, MessageBody: '{"event_id":"evt_1"}' }, opts: undefined }]);
  });

  it('receive: long poll 20s, up to 10, visibility 60s, abortable; parses bodies', async () => {
    const c = client({
      Messages: [
        { MessageId: 'a', ReceiptHandle: 'rh-a', Body: '{"x":1}', Attributes: { ApproximateReceiveCount: '3' } },
        { MessageId: 'b', ReceiptHandle: 'rh-b', Body: 'not json' },
      ],
    });
    const signal = new AbortController().signal;
    const out = await createSqsQueue({ client: c, queueUrl: URL }).receive({ signal });
    expect(c.sent[0]).toEqual({
      name: 'ReceiveMessageCommand',
      input: { QueueUrl: URL, MaxNumberOfMessages: 10, WaitTimeSeconds: 20, VisibilityTimeout: 60, MessageSystemAttributeNames: ['ApproximateReceiveCount'] },
      opts: { abortSignal: signal },
    });
    expect(out).toEqual([
      { id: 'a', receiptHandle: 'rh-a', receiveCount: 3, body: { x: 1 } },
      { id: 'b', receiptHandle: 'rh-b', receiveCount: 1, body: null },
    ]);
  });

  it('receive with no messages returns []', async () => {
    expect(await createSqsQueue({ client: client({}), queueUrl: URL }).receive()).toEqual([]);
  });

  it('delete: by receipt handle', async () => {
    const c = client();
    await createSqsQueue({ client: c, queueUrl: URL }).delete('rh-a');
    expect(c.sent[0]).toMatchObject({ name: 'DeleteMessageCommand', input: { QueueUrl: URL, ReceiptHandle: 'rh-a' } });
  });
});

describe('startQueueWorker', () => {
  const until = async (cond) => {
    for (let i = 0; i < 200 && !cond(); i += 1) await new Promise((r) => setTimeout(r, 5));
    expect(cond()).toBe(true);
  };

  it('hands each message to the handler and deletes it on success', async () => {
    const q = fakeQueue();
    const seen = [];
    const stop = startQueueWorker({ queue: q, handle: async (body) => seen.push(body), log: quiet });
    await q.send({ n: 1 });
    await q.send({ n: 2 });
    await until(() => q.deleted.length === 2);
    expect(seen).toEqual([{ n: 1 }, { n: 2 }]);
    await stop();
  });

  it('a failing handler leaves the message for redelivery', async () => {
    const q = fakeQueue();
    let calls = 0;
    const errors = [];
    const stop = startQueueWorker({
      queue: q,
      handle: async () => {
        calls += 1;
        if (calls === 1) throw new Error('paddle down');
      },
      log: { ...quiet, error: (o, msg) => errors.push([msg, o.err, o.receive_count]) },
    });
    await q.send({ n: 1 });
    await until(() => calls === 1);
    expect(q.deleted).toEqual([]);
    expect(q.inFlight).toBe(1);
    expect(errors).toEqual([['billing_sync_failed', 'paddle down', 1]]);
    q.redeliver(); // visibility timeout ran out
    await until(() => q.deleted.length === 1);
    expect(calls).toBe(2);
    await stop();
  });

  it('stop() ends the long poll', async () => {
    const q = fakeQueue();
    const stop = startQueueWorker({ queue: q, handle: async () => {}, log: quiet });
    const t = Date.now();
    await stop();
    expect(Date.now() - t).toBeLessThan(500);
  });

  it('backs off after a receive error and keeps polling', async () => {
    let n = 0;
    const errors = [];
    const queue = {
      receive: async () => {
        n += 1;
        if (n === 1) throw new Error('throttled');
        return n === 2 ? [{ id: 'a', receiptHandle: 'rh', body: { ok: true }, receiveCount: 1 }] : new Promise(() => {});
      },
      delete: async () => {},
    };
    const seen = [];
    const stop = startQueueWorker({ queue, handle: async (b) => seen.push(b), log: { ...quiet, error: (o, m) => errors.push(m) }, errorBackoffMs: 10 });
    await until(() => seen.length === 1);
    expect(errors).toEqual(['queue_receive_failed']);
    stop(); // the hung receive cannot be aborted by this fake; stop() must not throw
  });
});
```

`services/core-api/test/webhook.test.js`:

```js
import { Writable } from 'node:stream';
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { signWebhook } from '@ikf/paddle';
import { buildApp } from '../src/app.js';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, PREVIEW } from './helpers/app.js';
import { fakeKv, fakeStore } from './helpers/fakes.js';
import { fakeQueue } from './helpers/queue.js';

const SECRET = 'pdl_ntfset_test';
const event = (type, data, id = 'evt_01') => ({ event_id: id, event_type: type, occurred_at: '2026-10-09T10:00:00.000000Z', notification_id: 'ntf_1', data });
const rawOf = (e) => JSON.stringify(e, null, 1); // Paddle's exact bytes; deliberately not compact

describe('POST /v1/paddle/webhook', () => {
  let db;
  let app;
  let queue;

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    queue = fakeQueue();
    ({ app } = await makeApp(db.pool, { queue, webhookSecret: SECRET }));
  });
  afterEach(() => app.close());

  const deliver = (raw, signature = signWebhook(raw, SECRET), target = app) =>
    target.inject({ method: 'POST', url: '/v1/paddle/webhook', headers: { 'content-type': 'application/json', 'paddle-signature': signature }, payload: raw });
  const inbox = async () => (await db.pool.query('SELECT event_id, event_type, processed_at, attempts FROM webhook_inbox ORDER BY event_id')).rows;

  it('stores a verified transaction event in the inbox and queues its entity', async () => {
    const res = await deliver(rawOf(event('transaction.completed', { id: 'txn_1', status: 'completed' })));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'queued' });
    expect(queue.sent).toEqual([{ event_id: 'evt_01', event_type: 'transaction.completed', entity: 'transaction', entity_id: 'txn_1' }]);
    expect(await inbox()).toEqual([{ event_id: 'evt_01', event_type: 'transaction.completed', processed_at: null, attempts: 0 }]);
  });

  it('subscription.* queue the subscription; adjustment.* queue the original transaction', async () => {
    await deliver(rawOf(event('subscription.updated', { id: 'sub_1' }, 'evt_a')));
    await deliver(rawOf(event('adjustment.updated', { id: 'adj_1', transaction_id: 'txn_9' }, 'evt_b')));
    expect(queue.sent.map((m) => [m.entity, m.entity_id])).toEqual([['subscription', 'sub_1'], ['transaction', 'txn_9']]);
  });

  it('other event types are kept as processed and not queued', async () => {
    expect((await deliver(rawOf(event('customer.updated', { id: 'ctm_1' })))).json()).toEqual({ status: 'ignored' });
    expect(queue.sent).toEqual([]);
    expect((await inbox())[0].processed_at).toBeInstanceOf(Date);
  });

  it('a duplicate event_id is acknowledged without a second SQS message', async () => {
    const raw = rawOf(event('subscription.created', { id: 'sub_1' }));
    await deliver(raw);
    const again = await deliver(raw);
    expect(again.statusCode).toBe(200);
    expect(again.json()).toEqual({ status: 'duplicate' });
    expect(queue.sent).toHaveLength(1);
  });

  it('verifies the exact bytes: a re-serialized body is 401', async () => {
    const raw = rawOf(event('transaction.completed', { id: 'txn_1' }));
    const res = await deliver(JSON.stringify(JSON.parse(raw)), signWebhook(raw, SECRET));
    expect(res.statusCode).toBe(401);
    expect(queue.sent).toEqual([]);
  });

  it('accepts a validly signed body that JSON.parse would reformat', async () => {
    const raw = '{ "event_id" : "evt_\\u0030\\u0031", "event_type":"transaction.paid",\n "occurred_at":"2026-10-09T10:00:00Z", "data":{"id":"txn_\\u0031"} }';
    const res = await deliver(raw);
    expect(res.statusCode).toBe(200);
    expect(queue.sent).toEqual([{ event_id: 'evt_01', event_type: 'transaction.paid', entity: 'transaction', entity_id: 'txn_1' }]);
  });

  it('401 for a missing, stale or forged signature, and the body is never logged', async () => {
    const lines = [];
    const stream = new Writable({ write(chunk, _enc, cb) { lines.push(chunk.toString()); cb(); } });
    const logged = buildApp({
      logger: { level: 'trace', stream },
      deps: { pool: db.pool, store: fakeStore(), kv: fakeKv(), mediaOrigins: [], previewBaseUrl: PREVIEW, queue, webhookSecret: SECRET },
    });
    await logged.ready();
    const raw = rawOf(event('transaction.completed', { id: 'txn_1', customer: { email: 'leak.me@example.com' } }));
    const old = Math.floor(Date.now() / 1000) - 301;
    for (const sig of ['', signWebhook(raw, SECRET, old), signWebhook(raw, 'wrong-secret')]) {
      const res = await deliver(raw, sig, logged);
      expect(res.statusCode).toBe(401);
      expect(res.json()).toEqual({ error: 'invalid_signature' });
    }
    await logged.close();
    expect(lines.join('')).toContain('paddle_webhook_rejected');
    expect(lines.join('')).not.toContain('leak.me');
    expect(await inbox()).toEqual([]);
  });

  it('503 when SQS is down; the inbox row is rolled back so the retry is queued', async () => {
    const raw = rawOf(event('transaction.completed', { id: 'txn_1' }));
    queue.fail();
    expect((await deliver(raw)).statusCode).toBe(503);
    expect(await inbox()).toEqual([]);
    queue.fail(false);
    expect((await deliver(raw)).json()).toEqual({ status: 'queued' });
    expect(queue.sent).toHaveLength(1);
  });

  it('503 when the database is down', async () => {
    const broken = { query: async () => { throw new Error('db down'); }, connect: async () => { throw new Error('db down'); } };
    const down = buildApp({ deps: { pool: broken, store: fakeStore(), kv: fakeKv(), mediaOrigins: [], previewBaseUrl: PREVIEW, queue, webhookSecret: SECRET } });
    await down.ready();
    expect((await deliver(rawOf(event('transaction.completed', { id: 'txn_1' })), undefined, down)).statusCode).toBe(503);
    await down.close();
  });

  it('400 for a signed body that is not a Paddle event, 413 above 1MB', async () => {
    expect((await deliver('{"hello":1}')).statusCode).toBe(400);
    expect((await deliver('not json')).statusCode).toBe(400);
    const big = rawOf(event('transaction.completed', { id: 'txn_1', pad: 'x'.repeat(1024 * 1024) }));
    expect((await deliver(big)).statusCode).toBe(413);
  });
});
```

- [ ] **Step 3: Chạy test, xác nhận FAIL**

Run: `npm test -w @ikf/core-api`
Expected: FAIL — `queue.test.js` không tìm thấy `../src/billing/queue.js`; `webhook.test.js` 10 test fail (`404`). 136 test cũ pass.

- [ ] **Step 4: Implement**

`services/core-api/src/billing/queue.js`:

```js
import { DeleteMessageCommand, ReceiveMessageCommand, SendMessageCommand } from '@aws-sdk/client-sqs';

export const RECEIVE_WAIT_SECONDS = 20;
export const RECEIVE_MAX_MESSAGES = 10;
export const VISIBILITY_TIMEOUT_SECONDS = 60;

const parse = (s) => {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
};

// The queue surface billing uses: send(body), receive({signal}) → [{id, receiptHandle, receiveCount, body}], delete(receiptHandle).
export function createSqsQueue({ client, queueUrl }) {
  return {
    async send(body) {
      await client.send(new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: JSON.stringify(body) }));
    },
    async receive({ signal } = {}) {
      const res = await client.send(
        new ReceiveMessageCommand({
          QueueUrl: queueUrl,
          MaxNumberOfMessages: RECEIVE_MAX_MESSAGES,
          WaitTimeSeconds: RECEIVE_WAIT_SECONDS,
          VisibilityTimeout: VISIBILITY_TIMEOUT_SECONDS,
          MessageSystemAttributeNames: ['ApproximateReceiveCount'],
        }),
        signal ? { abortSignal: signal } : undefined,
      );
      return (res.Messages ?? []).map((m) => ({
        id: m.MessageId,
        receiptHandle: m.ReceiptHandle,
        receiveCount: Number(m.Attributes?.ApproximateReceiveCount ?? 1),
        body: parse(m.Body),
      }));
    },
    async delete(receiptHandle) {
      await client.send(new DeleteMessageCommand({ QueueUrl: queueUrl, ReceiptHandle: receiptHandle }));
    },
  };
}

// Long-poll loop. A message is deleted only after handle() resolves; otherwise it comes back after
// the visibility timeout, and SQS moves it to the DLQ after maxReceiveCount (5) receives.
// Returns stop(): aborts the poll, lets the message being handled finish, resolves when the loop ends.
export function startQueueWorker({ queue, handle, log = console, errorBackoffMs = 5000 }) {
  const ac = new AbortController();
  const pause = (ms) =>
    new Promise((resolve) => {
      const t = setTimeout(resolve, ms);
      ac.signal.addEventListener('abort', () => {
        clearTimeout(t);
        resolve();
      }, { once: true });
    });

  const done = (async () => {
    while (!ac.signal.aborted) {
      let messages;
      try {
        messages = await queue.receive({ signal: ac.signal });
      } catch (err) {
        if (ac.signal.aborted) break;
        log.error({ err: err.message }, 'queue_receive_failed');
        await pause(errorBackoffMs);
        continue;
      }
      for (const m of messages) {
        if (ac.signal.aborted) break; // not handled: back on the queue after the visibility timeout
        try {
          await handle(m.body, m);
          await queue.delete(m.receiptHandle);
        } catch (err) {
          log.error({ err: err.message, message_id: m.id, receive_count: m.receiveCount }, 'billing_sync_failed');
        }
      }
    }
  })();

  return async function stop() {
    ac.abort();
    await done;
  };
}
```

`services/core-api/src/billing/webhook.js`:

```js
// Which entity the sync worker must re-read for a Paddle event; null = not billing state we keep.
export function entityOf(event) {
  const type = typeof event.event_type === 'string' ? event.event_type : '';
  const data = event.data && typeof event.data === 'object' ? event.data : {};
  if (type.startsWith('subscription.') && typeof data.id === 'string') return { entity: 'subscription', entity_id: data.id };
  if (type.startsWith('transaction.') && typeof data.id === 'string') return { entity: 'transaction', entity_id: data.id };
  if (type.startsWith('adjustment.') && typeof data.transaction_id === 'string') {
    return { entity: 'transaction', entity_id: data.transaction_id };
  }
  return null;
}

export function isPaddleEvent(e) {
  return (
    e !== null && typeof e === 'object' &&
    typeof e.event_id === 'string' && /^[A-Za-z0-9_-]{1,100}$/.test(e.event_id) &&
    typeof e.event_type === 'string' && e.event_type.length <= 100 &&
    typeof e.occurred_at === 'string' && !Number.isNaN(Date.parse(e.occurred_at))
  );
}

// Inbox row and SQS message commit together: if SQS fails the row is rolled back, so Paddle's retry
// is not mistaken for a duplicate. Returns 'queued' | 'duplicate' | 'ignored'.
export async function acceptWebhook(pool, queue, event) {
  const target = entityOf(event);
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    const ins = await c.query(
      `INSERT INTO webhook_inbox (event_id, event_type, occurred_at, processed_at)
       VALUES ($1, $2, $3, CASE WHEN $4::boolean THEN now() END)
       ON CONFLICT (event_id) DO NOTHING`,
      [event.event_id, event.event_type, event.occurred_at, target === null],
    );
    if (ins.rowCount === 0) {
      await c.query('COMMIT');
      return 'duplicate';
    }
    if (target) await queue.send({ event_id: event.event_id, event_type: event.event_type, ...target });
    await c.query('COMMIT');
    return target ? 'queued' : 'ignored';
  } catch (err) {
    await c.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    c.release();
  }
}
```

`services/core-api/src/http/webhook.js`:

```js
import { verifyWebhook } from '@ikf/paddle';
import { acceptWebhook, isPaddleEvent } from '../billing/webhook.js';

export const WEBHOOK_BODY_LIMIT = 1024 * 1024;

// Encapsulated plugin: the raw-buffer parser below replaces JSON parsing for this route only.
// The signature covers the exact bytes Paddle sent, so the body must never be parsed and re-serialized first.
export default async function webhookHttp(app, { pool, queue, webhookSecret, now = Date.now }) {
  app.removeAllContentTypeParsers();
  app.addContentTypeParser('*', { parseAs: 'buffer', bodyLimit: WEBHOOK_BODY_LIMIT }, (req, body, done) => done(null, body));

  app.post('/v1/paddle/webhook', { bodyLimit: WEBHOOK_BODY_LIMIT }, async (req, reply) => {
    const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
    const check = verifyWebhook(raw, req.headers['paddle-signature'], webhookSecret, now());
    if (!check.ok) {
      req.log.warn({ reason: check.reason, bytes: raw.length }, 'paddle_webhook_rejected');
      return reply.code(401).send({ error: 'invalid_signature' });
    }
    let event;
    try {
      event = JSON.parse(raw.toString('utf8'));
    } catch {
      event = null;
    }
    if (!isPaddleEvent(event)) return reply.code(400).send({ error: 'bad_request' });
    try {
      return { status: await acceptWebhook(pool, queue, event) };
    } catch (err) {
      req.log.error({ err: err.message, event_id: event.event_id }, 'paddle_webhook_store_failed');
      return reply.code(503).send({ error: 'unavailable' });
    }
  });
}
```

`services/core-api/src/app.js`: thêm import sau `import checkoutHttp from './http/checkout.js';`

```js
import webhookHttp from './http/webhook.js';
```
và đăng ký ngay sau dòng `checkoutHttp`:

```js
  if (deps?.pool && deps?.queue && deps?.webhookSecret) app.register(webhookHttp, deps);
```

- [ ] **Step 5: Chạy test, xác nhận PASS**

Run: `npm test -w @ikf/core-api`
Expected: `Test Files  17 passed (17)`, `Tests  154 passed (154)`.

- [ ] **Step 6: Commit**

```bash
git add package-lock.json services/core-api
git commit -m "feat(core-api): Paddle webhook (raw body, signature, inbox, SQS) + SQS queue worker loop"
```

---

### Task 7: core-api — worker `billing-sync`: đọc lại Paddle, state machine, outbox đúng một lần

**Files:**
- Create: `services/core-api/src/billing/sync.js`
- Test: `services/core-api/test/sync.test.js`

**Interfaces:**
- Consumes: `PaddleClient.getTransaction/getSubscription/getCustomer` (Task 1); bảng `customers`, `subscriptions`, `transactions`, `checkouts`, `funnel_prices`, `webhook_inbox`, `outbox` (Task 2); message SQS + `startQueueWorker` + `fakeQueue` (Task 6); `fakePaddle`, `paddleTxn`, `paddleSub` (Task 3); `isUlid` (`@ikf/event-schema`).
- Produces:
  - `subscriptionTopics(prev: {status, scheduled_change}|null, next) → string[]` (spec §4 + B6).
  - `syncMessage({pool, paddle, log}, msg: {event_id?, event_type?, entity, entity_id}) → Promise<void>` — handler của `startQueueWorker` (Task 9) và reconcile (Task 8). Throw → không ghi gì.
  - Outbox (Task "conversions-relay"/"entitlement" sau này đọc):
    - `subscription.*`: `aggregate_id = sub id`, `dedupe_key = "<topic>:<sub>:<paddle updated_at>"`, payload `{paddle_subscription_id, status, previous_status, customer_id, funnel, plan, current_period_end, canceled_at, scheduled_change}`.
    - `payment.succeeded`: `dedupe_key = "payment.succeeded:<txn>"`, payload `{paddle_transaction_id, amount_minor, currency, origin, checkout_id, sid, funnel, plan, customer_id, paddle_subscription_id}`.
    - `payment.refunded` / `payment.chargeback`: `aggregate_id = txn`, `dedupe_key = "<topic>:<adj>"`, payload `{paddle_transaction_id, adjustment_id, amount_minor, currency, type, customer_id, paddle_subscription_id}`.
    - `customer_id` = `customers.id` nội bộ, không bao giờ email.
  - Log `unmapped_price {price_id, ref}` (warn).

Kịch bản Paddle giả (scripted): mỗi test đặt trạng thái **cuối** (hoặc từng bước) vào `fakePaddle`, rồi gửi message theo thứ tự bất kỳ. Worker luôn đọc lại Paddle, nên thứ tự message không quyết định kết quả; guard `updated_at` chặn bản đọc cũ; `dedupe_key` chặn ghi đôi kể cả khi hai worker chạy song song (lỗi `23505` → chạy lại transaction một lần).

- [ ] **Step 1: Viết test fail**

`services/core-api/test/sync.test.js`:

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { signWebhook } from '@ikf/paddle';
import { startQueueWorker } from '../src/billing/queue.js';
import { subscriptionTopics, syncMessage } from '../src/billing/sync.js';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, seedVersions } from './helpers/app.js';
import { fakePaddle, paddleSub, paddleTxn, PRICE_W1, PRICE_ADDON, PRICE_OTHER } from './helpers/paddle.js';
import { fakeQueue } from './helpers/queue.js';
import { fakeStore } from './helpers/fakes.js';

const CK = '01JA0000000000000000000001';
const CK2 = '01JA0000000000000000000003';
const CK3 = '01JA0000000000000000000004';
const SID = '01JA0000000000000000000002';
const T = (n) => `2026-10-09T10:00:0${n}.123456Z`;
const custom = (checkoutId, plan = '1w') => ({ checkout_id: checkoutId, sid: SID, funnel: 'aivideo', v: 1, plan });
const sub = (id = 'sub_1') => ({ event_id: `evt_${Math.random()}`, event_type: 'subscription.updated', entity: 'subscription', entity_id: id });
const txn = (id) => ({ event_id: `evt_${Math.random()}`, event_type: 'transaction.updated', entity: 'transaction', entity_id: id });

describe('subscriptionTopics', () => {
  const s = (status, action) => ({ status, scheduled_change: action ? { action, effective_at: T(9) } : null });
  it.each([
    [null, s('trialing'), ['subscription.activated']],
    [null, s('active'), ['subscription.activated']],
    [s('trialing'), s('active'), ['subscription.converted']],
    [s('active'), s('past_due'), ['subscription.past_due']],
    [s('past_due'), s('active'), ['subscription.recovered']],
    [s('active'), s('paused'), ['subscription.paused']],
    [s('paused'), s('active'), ['subscription.resumed']],
    [s('past_due'), s('canceled'), ['subscription.canceled']],
    [null, s('canceled'), ['subscription.canceled']],
    [s('active'), s('active', 'cancel'), ['subscription.cancel_scheduled']],
    [s('active', 'cancel'), s('active', 'cancel'), []],
    [s('active', 'cancel'), s('canceled'), ['subscription.canceled']],
    [s('trialing'), s('active', 'cancel'), ['subscription.converted', 'subscription.cancel_scheduled']],
    [s('active'), s('active'), []],
    [null, s('past_due'), []],
  ])('%j → %j = %j', (prev, next, topics) => expect(subscriptionTopics(prev, next)).toEqual(topics));
});

describe('billing-sync worker', () => {
  let db;
  let paddle;
  let warnings;
  const log = { warn: (o, m) => warnings.push([m, o]), error: () => {}, info: () => {} };
  const sync = (msg, pool = db.pool) => syncMessage({ pool, paddle, log }, msg);
  const outbox = async () => (await db.pool.query('SELECT topic, aggregate_id, dedupe_key, payload FROM outbox ORDER BY id')).rows;
  const topics = async () => (await outbox()).map((r) => r.topic);

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    warnings = [];
    paddle = fakePaddle();
    paddle.customer('ctm_1', 'buyer@example.com');
    await seedVersions(db.pool, fakeStore(), 'aivideo', 1);
    const fid = (await db.pool.query("SELECT id FROM funnels WHERE slug = 'aivideo'")).rows[0].id;
    await db.pool.query(
      `INSERT INTO funnel_prices (funnel_id, plan_key, paddle_price_id, kind, updated_by)
       VALUES ($1, '1w', $2, 'recurring', 't'), ($1, 'addon', $3, 'one_time', 't')`,
      [fid, PRICE_W1, PRICE_ADDON],
    );
    for (const [id, t] of [[CK, 'txn_a'], [CK2, 'txn_c'], [CK3, 'txn_d']]) {
      await db.pool.query(
        "INSERT INTO checkouts (id, paddle_transaction_id, funnel_id, v, plan_key, sid) VALUES ($1, $2, $3, 1, '1w', $4)",
        [id, t, fid, SID],
      );
    }
  });

  it('new subscription: customer with email, row with funnel/plan, subscription.activated', async () => {
    paddle.subscription(paddleSub({ status: 'trialing', custom_data: custom(CK), updated_at: T(1) }));
    await sync(sub());
    expect((await db.pool.query('SELECT paddle_customer_id, email FROM customers')).rows).toEqual([{ paddle_customer_id: 'ctm_1', email: 'buyer@example.com' }]);
    const row = (await db.pool.query('SELECT * FROM subscriptions')).rows[0];
    expect(row).toMatchObject({ paddle_subscription_id: 'sub_1', customer_id: '1', plan_key: '1w', status: 'trialing', scheduled_change: null });
    expect(row.funnel_id).not.toBeNull();
    expect(await outbox()).toEqual([{
      topic: 'subscription.activated', aggregate_id: 'sub_1', dedupe_key: `subscription.activated:sub_1:${T(1)}`,
      payload: {
        paddle_subscription_id: 'sub_1', status: 'trialing', previous_status: null, customer_id: 1, funnel: 'aivideo', plan: '1w',
        current_period_end: '2026-10-16T10:00:00Z', canceled_at: null, scheduled_change: null,
      },
    }]);
  });

  it('each transition writes exactly one outbox row, duplicates write none', async () => {
    const steps = [
      [{ status: 'trialing' }, 'subscription.activated'],
      [{ status: 'active' }, 'subscription.converted'],
      [{ status: 'past_due' }, 'subscription.past_due'],
      [{ status: 'active' }, 'subscription.recovered'],
      [{ status: 'active', scheduled_change: { action: 'cancel', effective_at: '2026-11-01T00:00:00Z', resume_at: null } }, 'subscription.cancel_scheduled'],
      [{ status: 'paused' }, 'subscription.paused'],
      [{ status: 'active' }, 'subscription.resumed'],
      [{ status: 'canceled', canceled_at: '2026-10-09T11:00:00Z' }, 'subscription.canceled'],
    ];
    for (const [i, [state]] of steps.entries()) {
      paddle.subscription(paddleSub({ ...state, updated_at: `2026-10-09T10:00:${String(10 + i)}.000001Z` }));
      await sync(sub());
      await sync(sub()); // Paddle retry / second event for the same state
    }
    expect(await topics()).toEqual(steps.map((s) => s[1]));
  });

  it('a late message for an older state writes nothing', async () => {
    paddle.subscription(paddleSub({ status: 'canceled', updated_at: T(5) }));
    await sync(sub());
    paddle.subscription(paddleSub({ status: 'active', updated_at: T(2) })); // stale read
    await sync(sub());
    expect((await db.pool.query('SELECT status FROM subscriptions')).rows).toEqual([{ status: 'canceled' }]);
    expect(await topics()).toEqual(['subscription.canceled']);
  });

  it('completed transaction: payment.succeeded with checkout attribution; checkout completed', async () => {
    paddle.subscription(paddleSub({ status: 'active', custom_data: custom(CK), updated_at: T(1) }));
    paddle.transaction(paddleTxn({ id: 'txn_a', status: 'completed', subscription_id: 'sub_1', custom_data: custom(CK), updated_at: T(2) }));
    await sync(txn('txn_a'));
    expect((await db.pool.query('SELECT * FROM transactions')).rows).toEqual([expect.objectContaining({
      paddle_transaction_id: 'txn_a', customer_id: '1', paddle_subscription_id: 'sub_1', checkout_id: CK,
      status: 'completed', origin: 'web', amount_minor: '1367', currency: 'USD',
    })]);
    expect((await db.pool.query('SELECT id, status FROM checkouts ORDER BY id')).rows).toEqual([
      { id: CK, status: 'completed' }, { id: CK2, status: 'created' }, { id: CK3, status: 'created' },
    ]);
    const rows = await outbox();
    expect(rows.map((r) => r.topic)).toEqual(['subscription.activated', 'payment.succeeded']);
    expect(rows[1].payload).toEqual({
      paddle_transaction_id: 'txn_a', amount_minor: 1367, currency: 'USD', origin: 'web', checkout_id: CK, sid: SID,
      funnel: 'aivideo', plan: '1w', customer_id: 1, paddle_subscription_id: 'sub_1',
    });
    expect(JSON.stringify(rows)).not.toContain('buyer@example.com');
  });

  it('paid completes the checkout before completed; payment.succeeded only once completed', async () => {
    paddle.transaction(paddleTxn({ id: 'txn_c', status: 'paid', price_id: PRICE_ADDON, custom_data: custom(CK2, 'addon'), updated_at: T(1) }));
    await sync(txn('txn_c'));
    expect((await db.pool.query('SELECT status FROM checkouts WHERE id = $1', [CK2])).rows[0].status).toBe('completed');
    expect(await topics()).toEqual([]);
    paddle.transaction(paddleTxn({ id: 'txn_c', status: 'completed', price_id: PRICE_ADDON, custom_data: custom(CK2, 'addon'), updated_at: T(2) }));
    await sync(txn('txn_c'));
    await sync(txn('txn_c'));
    expect(await topics()).toEqual(['payment.succeeded']);
    expect((await outbox())[0].payload.plan).toBe('addon');
  });

  it('a canceled transaction abandons its checkout', async () => {
    paddle.transaction(paddleTxn({ id: 'txn_d', status: 'canceled', customer_id: null, custom_data: custom(CK3), updated_at: T(1) }));
    await sync(txn('txn_d'));
    expect((await db.pool.query('SELECT status FROM checkouts WHERE id = $1', [CK3])).rows[0].status).toBe('abandoned');
  });

  it('refund and chargeback write one row each; pending or rejected adjustments write nothing', async () => {
    const adj = (id, action, status) => ({ id, action, status, type: 'full', totals: { total: '1367', currency_code: 'USD' } });
    paddle.transaction(paddleTxn({ id: 'txn_a', custom_data: custom(CK), updated_at: T(1), adjustments: [adj('adj_1', 'refund', 'pending_approval'), adj('adj_2', 'refund', 'rejected')] }));
    await sync(txn('txn_a'));
    expect(await topics()).toEqual(['payment.succeeded']);
    // Same transaction updated_at: adjustments are still read (B4).
    paddle.transaction(paddleTxn({ id: 'txn_a', custom_data: custom(CK), updated_at: T(1), adjustments: [adj('adj_1', 'refund', 'approved'), adj('adj_3', 'chargeback', 'approved')] }));
    await sync(txn('txn_a'));
    await sync(txn('txn_a'));
    const rows = await outbox();
    expect(rows.map((r) => [r.topic, r.dedupe_key])).toEqual([
      ['payment.succeeded', 'payment.succeeded:txn_a'],
      ['payment.refunded', 'payment.refunded:adj_1'],
      ['payment.chargeback', 'payment.chargeback:adj_3'],
    ]);
    expect(rows[1].payload).toEqual({
      paddle_transaction_id: 'txn_a', adjustment_id: 'adj_1', amount_minor: 1367, currency: 'USD', type: 'full', customer_id: 1, paddle_subscription_id: null,
    });
  });

  it('unmapped price: stored with funnel NULL, logs unmapped_price, still writes outbox', async () => {
    paddle.subscription(paddleSub({ status: 'active', price_id: PRICE_OTHER, updated_at: T(1) }));
    await sync(sub());
    expect((await db.pool.query('SELECT funnel_id, plan_key FROM subscriptions')).rows).toEqual([{ funnel_id: null, plan_key: null }]);
    expect(warnings).toEqual([['unmapped_price', { price_id: PRICE_OTHER, ref: 'sub_1' }]]);
    expect(await topics()).toEqual(['subscription.activated']);
  });

  it('a price mapped in a funnel is resolved even without custom_data (e.g. a renewal)', async () => {
    paddle.transaction(paddleTxn({ id: 'txn_r', origin: 'subscription_recurring', custom_data: null, updated_at: T(1) }));
    await sync(txn('txn_r'));
    expect((await outbox())[0].payload).toMatchObject({ funnel: 'aivideo', plan: '1w', checkout_id: null, sid: null, origin: 'subscription_recurring' });
  });

  it('marks the inbox row processed; attempts count every try', async () => {
    await db.pool.query("INSERT INTO webhook_inbox (event_id, event_type, occurred_at) VALUES ('evt_x', 'subscription.created', now())");
    paddle.subscription(paddleSub({ updated_at: T(1) }));
    paddle.fail('unavailable');
    const msg = { event_id: 'evt_x', event_type: 'subscription.created', entity: 'subscription', entity_id: 'sub_1' };
    await expect(sync(msg)).rejects.toThrow(/unavailable/);
    paddle.ok();
    await sync(msg);
    const row = (await db.pool.query("SELECT processed_at, attempts FROM webhook_inbox WHERE event_id = 'evt_x'")).rows[0];
    expect(row.attempts).toBe(2);
    expect(row.processed_at).toBeInstanceOf(Date);
  });

  it('Paddle down: throws, nothing written', async () => {
    paddle.subscription(paddleSub({ updated_at: T(1) }));
    paddle.fail('unavailable');
    await expect(sync(sub())).rejects.toThrow();
    expect((await db.pool.query('SELECT count(*)::int AS n FROM subscriptions')).rows[0].n).toBe(0);
    expect(await outbox()).toEqual([]);
  });

  it('a crash after the outbox insert rolls everything back; the redelivery writes it once', async () => {
    await db.pool.query("INSERT INTO webhook_inbox (event_id, event_type, occurred_at) VALUES ('evt_c', 'transaction.completed', now())");
    paddle.subscription(paddleSub({ status: 'active', custom_data: custom(CK), updated_at: T(1) }));
    paddle.transaction(paddleTxn({ id: 'txn_a', subscription_id: 'sub_1', custom_data: custom(CK), updated_at: T(2) }));
    const crashing = {
      query: (...a) => db.pool.query(...a),
      connect: async () => {
        const c = await db.pool.connect();
        return {
          query: (sql, params) => (/SET processed_at/.test(sql) ? Promise.reject(new Error('worker killed')) : c.query(sql, params)),
          release: () => c.release(),
        };
      },
    };
    const msg = { event_id: 'evt_c', event_type: 'transaction.completed', entity: 'transaction', entity_id: 'txn_a' };
    await expect(sync(msg, crashing)).rejects.toThrow('worker killed');
    for (const table of ['customers', 'subscriptions', 'transactions', 'outbox']) {
      expect((await db.pool.query(`SELECT count(*)::int AS n FROM ${table}`)).rows[0].n).toBe(0);
    }
    expect((await db.pool.query('SELECT status FROM checkouts WHERE id = $1', [CK])).rows[0].status).toBe('created');
    await sync(msg);
    await sync(msg);
    expect(await topics()).toEqual(['subscription.activated', 'payment.succeeded']);
  });

  it('two workers racing on a new subscription write it once', async () => {
    paddle.subscription(paddleSub({ status: 'active', updated_at: T(1) }));
    await Promise.all([sync(sub()), sync(sub()), sync(sub())]);
    expect((await db.pool.query('SELECT count(*)::int AS n FROM subscriptions')).rows[0].n).toBe(1);
    expect(await topics()).toEqual(['subscription.activated']);
  });

  it('rejects a malformed message (it ends in the DLQ)', async () => {
    await expect(sync({ entity: 'customer', entity_id: 'ctm_1' })).rejects.toThrow(/bad billing message/);
    await expect(sync(null)).rejects.toThrow(/bad billing message/);
  });

  it('replaying every message in any order, twice, gives the same rows and one outbox row per transition', async () => {
    const adj = (id, action) => ({ id, action, status: 'approved', type: 'full', totals: { total: '4999', currency_code: 'USD' } });
    paddle.subscription(paddleSub({ status: 'active', custom_data: custom(CK), updated_at: T(5) }));
    paddle.transaction(paddleTxn({ id: 'txn_a', subscription_id: 'sub_1', custom_data: custom(CK), updated_at: T(3) }));
    paddle.transaction(paddleTxn({ id: 'txn_b', subscription_id: 'sub_1', origin: 'subscription_recurring', amount: 4999, custom_data: custom(CK), updated_at: T(6), adjustments: [adj('adj_1', 'refund')] }));
    paddle.transaction(paddleTxn({ id: 'txn_c', price_id: PRICE_ADDON, amount: 999, custom_data: custom(CK2, 'addon'), updated_at: T(4), adjustments: [adj('adj_2', 'chargeback')] }));
    paddle.transaction(paddleTxn({ id: 'txn_d', status: 'canceled', customer_id: null, custom_data: custom(CK3), updated_at: T(2) }));
    const messages = [
      sub(), sub(), sub(),
      txn('txn_a'), txn('txn_a'), txn('txn_a'),
      txn('txn_b'), txn('txn_b'), txn('txn_b'),
      txn('txn_c'), txn('txn_c'),
      txn('txn_d'),
    ];
    let seed = 7;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    const shuffled = () => {
      const a = [...messages];
      for (let i = a.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rand() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };
    const snapshot = async () => ({
      customers: (await db.pool.query('SELECT id, paddle_customer_id, email FROM customers ORDER BY id')).rows,
      subscriptions: (await db.pool.query('SELECT paddle_subscription_id, customer_id, funnel_id, plan_key, status, paddle_updated_at FROM subscriptions ORDER BY 1')).rows,
      transactions: (await db.pool.query('SELECT paddle_transaction_id, customer_id, status, amount_minor, checkout_id, paddle_updated_at FROM transactions ORDER BY 1')).rows,
      checkouts: (await db.pool.query('SELECT id, status FROM checkouts ORDER BY id')).rows,
      outbox: (await db.pool.query('SELECT topic, aggregate_id, dedupe_key, payload FROM outbox ORDER BY dedupe_key')).rows,
    });
    const snapshots = [];
    for (let run = 0; run < 5; run += 1) {
      await db.pool.query('TRUNCATE customers, transactions, subscriptions, outbox, webhook_inbox RESTART IDENTITY CASCADE');
      await db.pool.query("UPDATE checkouts SET status = 'created', completed_at = NULL");
      for (const m of [...shuffled(), ...shuffled()]) await sync(m);
      snapshots.push(await snapshot());
    }
    for (const s of snapshots.slice(1)) expect(s).toEqual(snapshots[0]);
    expect(snapshots[0].outbox.map((r) => r.dedupe_key)).toEqual([
      'payment.chargeback:adj_2',
      'payment.refunded:adj_1',
      'payment.succeeded:txn_a',
      'payment.succeeded:txn_b',
      'payment.succeeded:txn_c',
      `subscription.activated:sub_1:${T(5)}`,
    ]);
    expect(snapshots[0].checkouts.map((c) => c.status)).toEqual(['completed', 'completed', 'abandoned']);
  });
});

describe('webhook → SQS → worker → outbox', () => {
  let db;
  let app;
  let stop;
  afterEach(async () => {
    await stop?.();
    await app?.close();
  });
  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());

  it('a signed Paddle event ends as one outbox row, and the message is deleted', async () => {
    await resetDb(db.pool);
    const paddle = fakePaddle();
    paddle.customer('ctm_1', 'buyer@example.com');
    paddle.subscription(paddleSub({ status: 'active', updated_at: T(1) }));
    const queue = fakeQueue();
    ({ app } = await makeApp(db.pool, { queue, webhookSecret: 'whsec' }));
    stop = startQueueWorker({ queue, handle: (m) => syncMessage({ pool: db.pool, paddle, log: console }, m), log: console });
    const raw = JSON.stringify({ event_id: 'evt_1', event_type: 'subscription.created', occurred_at: T(1), data: { id: 'sub_1' } });
    for (let i = 0; i < 2; i += 1) {
      await app.inject({ method: 'POST', url: '/v1/paddle/webhook', headers: { 'content-type': 'application/json', 'paddle-signature': signWebhook(raw, 'whsec') }, payload: raw });
    }
    for (let i = 0; i < 200 && queue.deleted.length < 1; i += 1) await new Promise((r) => setTimeout(r, 10));
    expect(queue.deleted).toHaveLength(1);
    expect((await db.pool.query('SELECT topic FROM outbox')).rows).toEqual([{ topic: 'subscription.activated' }]);
    expect((await db.pool.query('SELECT attempts, processed_at IS NOT NULL AS done FROM webhook_inbox')).rows).toEqual([{ attempts: 1, done: true }]);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run: `npm test -w @ikf/core-api`
Expected: FAIL — `sync.test.js` không tìm thấy `../src/billing/sync.js`; 154 test cũ pass.

- [ ] **Step 3: Implement**

`services/core-api/src/billing/sync.js`:

```js
import { isUlid } from '@ikf/event-schema';

const ENTITIES = new Set(['subscription', 'transaction']);
const PAID = new Set(['paid', 'completed']);

// Outbox topics for one subscription change (spec §4 + B6). prev = stored row or null.
export function subscriptionTopics(prev, next) {
  const before = prev?.status ?? null;
  const after = next.status;
  const topics = [];
  if (before !== after) {
    if (before === null && (after === 'trialing' || after === 'active')) topics.push('subscription.activated');
    else if (before === 'trialing' && after === 'active') topics.push('subscription.converted');
    else if (before === 'active' && after === 'past_due') topics.push('subscription.past_due');
    else if (before === 'past_due' && after === 'active') topics.push('subscription.recovered');
    else if (before === 'paused' && (after === 'active' || after === 'trialing')) topics.push('subscription.resumed');
    else if (after === 'paused') topics.push('subscription.paused');
    else if (after === 'canceled') topics.push('subscription.canceled');
  }
  const wasCancel = prev?.scheduled_change?.action === 'cancel';
  if (next.scheduled_change?.action === 'cancel' && !wasCancel) topics.push('subscription.cancel_scheduled');
  return topics;
}

async function addOutbox(c, topic, aggregateId, dedupeKey, payload) {
  await c.query(
    `INSERT INTO outbox (topic, aggregate_id, dedupe_key, payload) VALUES ($1, $2, $3, $4)
     ON CONFLICT (dedupe_key) DO NOTHING`,
    [topic, aggregateId, dedupeKey, payload],
  );
}

// Which funnel/plan a Paddle price belongs to: custom_data first (set by POST /v1/checkout), then
// any mapping of that price. null → unmapped_price (row is kept with funnel_id NULL).
async function resolvePlan(c, { priceId, customData, ref, log }) {
  if (!priceId) return null;
  const slug = typeof customData?.funnel === 'string' ? customData.funnel : null;
  const key = typeof customData?.plan === 'string' ? customData.plan : null;
  const select = `SELECT fp.funnel_id, f.slug AS funnel, fp.plan_key AS plan
                    FROM funnel_prices fp JOIN funnels f ON f.id = fp.funnel_id`;
  if (slug && key) {
    const { rows } = await c.query(`${select} WHERE f.slug = $1 AND fp.plan_key = $2 AND fp.paddle_price_id = $3`, [slug, key, priceId]);
    if (rows.length) return rows[0];
  }
  const { rows } = await c.query(`${select} WHERE fp.paddle_price_id = $1 ORDER BY fp.funnel_id, fp.plan_key LIMIT 1`, [priceId]);
  if (rows.length) return rows[0];
  log?.warn({ price_id: priceId, ref }, 'unmapped_price');
  return null;
}

async function upsertCustomer(c, customer) {
  const { rows } = await c.query(
    `INSERT INTO customers (paddle_customer_id, email) VALUES ($1, $2)
     ON CONFLICT (paddle_customer_id) DO UPDATE SET email = EXCLUDED.email
     RETURNING id`,
    [customer.id, customer.email ?? null],
  );
  return Number(rows[0].id);
}

async function customerIdOf(c, paddleCustomerId) {
  if (!paddleCustomerId) return null;
  const { rows } = await c.query('SELECT id FROM customers WHERE paddle_customer_id = $1', [paddleCustomerId]);
  return rows.length ? Number(rows[0].id) : null;
}

async function syncSubscription(c, sub, log) {
  const cur = (
    await c.query(
      `SELECT status, scheduled_change, paddle_updated_at < $2::timestamptz AS older
         FROM subscriptions WHERE paddle_subscription_id = $1 FOR UPDATE`,
      [sub.id, sub.updated_at],
    )
  ).rows[0];
  if (cur && !cur.older) return; // same or older state than the one we have
  const customerId = await customerIdOf(c, sub.customer_id);
  const plan = await resolvePlan(c, { priceId: sub.items?.[0]?.price?.id, customData: sub.custom_data, ref: sub.id, log });
  const values = [
    sub.id, customerId, plan?.funnel_id ?? null, plan?.plan ?? null, sub.status,
    sub.current_billing_period?.ends_at ?? null, sub.canceled_at ?? null,
    sub.scheduled_change ? JSON.stringify(sub.scheduled_change) : null, sub.updated_at,
  ];
  if (cur) {
    await c.query(
      `UPDATE subscriptions SET customer_id = $2, funnel_id = $3, plan_key = $4, status = $5, current_period_end = $6,
              canceled_at = $7, scheduled_change = $8, paddle_updated_at = $9
        WHERE paddle_subscription_id = $1`,
      values,
    );
  } else {
    // Plain INSERT: a concurrent worker inserting the same id fails here and its message is retried.
    await c.query(
      `INSERT INTO subscriptions (paddle_subscription_id, customer_id, funnel_id, plan_key, status, current_period_end,
                                  canceled_at, scheduled_change, paddle_updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      values,
    );
  }
  for (const topic of subscriptionTopics(cur ?? null, sub)) {
    await addOutbox(c, topic, sub.id, `${topic}:${sub.id}:${sub.updated_at}`, {
      paddle_subscription_id: sub.id,
      status: sub.status,
      previous_status: cur?.status ?? null,
      customer_id: customerId,
      funnel: plan?.funnel ?? null,
      plan: plan?.plan ?? null,
      current_period_end: sub.current_billing_period?.ends_at ?? null,
      canceled_at: sub.canceled_at ?? null,
      scheduled_change: sub.scheduled_change ?? null,
    });
  }
}

const adjustmentTopic = (a) =>
  a.action === 'refund' && a.status === 'approved' ? 'payment.refunded'
    : a.action === 'chargeback' && a.status !== 'rejected' ? 'payment.chargeback'
      : null;

async function syncTransaction(c, txn, log) {
  const cur = (
    await c.query(
      `SELECT status, paddle_updated_at < $2::timestamptz AS older
         FROM transactions WHERE paddle_transaction_id = $1 FOR UPDATE`,
      [txn.id, txn.updated_at],
    )
  ).rows[0];
  const customerId = await customerIdOf(c, txn.customer_id);
  const data = txn.custom_data ?? {};
  const checkoutId = isUlid(data.checkout_id) ? data.checkout_id : null;

  if (!cur || cur.older) {
    const amount = String(txn.details?.totals?.grand_total ?? txn.details?.totals?.total ?? '0');
    const values = [
      txn.id, customerId, txn.subscription_id ?? null, checkoutId, txn.status, txn.origin ?? 'unknown', amount,
      txn.currency_code, txn.billed_at ?? null, txn.updated_at,
    ];
    if (cur) {
      await c.query(
        `UPDATE transactions SET customer_id = $2, paddle_subscription_id = $3, checkout_id = $4, status = $5, origin = $6,
                amount_minor = $7, currency = $8, billed_at = $9, paddle_updated_at = $10
          WHERE paddle_transaction_id = $1`,
        values,
      );
    } else {
      await c.query(
        `INSERT INTO transactions (paddle_transaction_id, customer_id, paddle_subscription_id, checkout_id, status, origin,
                                   amount_minor, currency, billed_at, paddle_updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        values,
      );
    }
    if (PAID.has(txn.status)) {
      await c.query(
        "UPDATE checkouts SET status = 'completed', completed_at = now() WHERE paddle_transaction_id = $1 AND status <> 'completed'",
        [txn.id],
      );
    } else if (txn.status === 'canceled') {
      await c.query("UPDATE checkouts SET status = 'abandoned' WHERE paddle_transaction_id = $1 AND status = 'created'", [txn.id]);
    }
    if (txn.status === 'completed' && cur?.status !== 'completed') {
      const plan = await resolvePlan(c, { priceId: txn.items?.[0]?.price?.id, customData: data, ref: txn.id, log });
      await addOutbox(c, 'payment.succeeded', txn.id, `payment.succeeded:${txn.id}`, {
        paddle_transaction_id: txn.id,
        amount_minor: Number(amount),
        currency: txn.currency_code,
        origin: txn.origin ?? null,
        checkout_id: checkoutId,
        sid: isUlid(data.sid) ? data.sid : null,
        funnel: plan?.funnel ?? null,
        plan: plan?.plan ?? null,
        customer_id: customerId,
        paddle_subscription_id: txn.subscription_id ?? null,
      });
    }
  }

  // Adjustments are not guarded by the transaction's updated_at (B4); dedupe_key makes each one count once.
  for (const adj of txn.adjustments ?? []) {
    const topic = adjustmentTopic(adj);
    if (!topic) continue;
    await addOutbox(c, topic, txn.id, `${topic}:${adj.id}`, {
      paddle_transaction_id: txn.id,
      adjustment_id: adj.id,
      amount_minor: Number(adj.totals?.total ?? 0),
      currency: adj.totals?.currency_code ?? adj.currency_code ?? txn.currency_code,
      type: adj.type ?? null,
      customer_id: customerId,
      paddle_subscription_id: txn.subscription_id ?? null,
    });
  }
}

function checkMessage(msg) {
  if (!msg || !ENTITIES.has(msg.entity) || typeof msg.entity_id !== 'string' || !msg.entity_id) {
    throw new Error(`bad billing message: ${JSON.stringify(msg)?.slice(0, 200)}`);
  }
}

// One SQS message: re-read the entity from Paddle (never trust the webhook payload), then write
// customers/subscriptions/transactions/checkouts/outbox and mark the inbox row in ONE transaction.
// Any throw → nothing is written, the message stays on the queue.
export async function syncMessage({ pool, paddle, log }, msg) {
  checkMessage(msg);
  if (msg.event_id) await pool.query('UPDATE webhook_inbox SET attempts = attempts + 1 WHERE event_id = $1', [msg.event_id]);

  let txn = null;
  let sub = null;
  const customers = new Map();
  if (msg.entity === 'transaction') {
    txn = await paddle.getTransaction(msg.entity_id);
    if (txn.customer?.id) customers.set(txn.customer.id, txn.customer);
    if (txn.subscription_id) sub = await paddle.getSubscription(txn.subscription_id);
  } else {
    sub = await paddle.getSubscription(msg.entity_id);
  }
  if (sub?.customer_id && !customers.has(sub.customer_id)) customers.set(sub.customer_id, await paddle.getCustomer(sub.customer_id));

  const write = async () => {
    const c = await pool.connect();
    try {
      await c.query('BEGIN');
      for (const customer of customers.values()) await upsertCustomer(c, customer);
      if (sub) await syncSubscription(c, sub, log);
      if (txn) await syncTransaction(c, txn, log);
      if (msg.event_id) {
        await c.query('UPDATE webhook_inbox SET processed_at = COALESCE(processed_at, now()) WHERE event_id = $1', [msg.event_id]);
      }
      await c.query('COMMIT');
    } catch (err) {
      await c.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      c.release();
    }
  };
  try {
    await write();
  } catch (err) {
    if (err.code !== '23505') throw err;
    await write(); // another worker created the same row first; now it is there to lock and compare
  }
}
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

Run: `npm test -w @ikf/core-api`
Expected: `Test Files  18 passed (18)`, `Tests  185 passed (185)` (`sync.test.js`: 31).

- [ ] **Step 5: Commit**

```bash
git add services/core-api
git commit -m "feat(core-api): billing-sync worker: re-read Paddle, state machine, exactly-once outbox"
```

---

### Task 8: Đối soát `reconcile` + xem `outbox` (core API + CLI)

**Files:**
- Create: `services/core-api/src/billing/reconcile.js`, `services/core-api/src/http/billing.js`
- Modify: `services/core-api/src/app.js`, `packages/cli/src/api.js`, `packages/cli/src/main.js`
- Test: `services/core-api/test/reconcile.test.js`, `packages/cli/test/billing.test.js`

**Interfaces:**
- Consumes: `PaddleClient.listTransactions` (Task 1); `paddleHttpError` (Task 3); `Queue.send` + message shape (Task 6); bảng `transactions`, `outbox`.
- Produces:
  - `reconcile({pool, paddle, queue, since: Date|string}) → {since: ISO, checked, missing, stale, enqueued}`; message gửi đi `{event_id: "reconcile:<txn>:<updated_at>", event_type: "reconcile", entity: "transaction", entity_id}` — worker Task 7 xử lý như webhook (không có dòng inbox → bỏ qua phần inbox).
  - `listOutbox(db, {topic?, limit = 50, beforeId?}) → {items: [{id, topic, aggregate_id, payload, created_at, published_at}]}` (mới nhất trước).
  - `POST /v1/billing/reconcile` (role `admin`) body `{"since_seconds": 60..2592000}` → `200` object trên; `503 paddle_unavailable|queue_unavailable`.
  - `GET /v1/billing/outbox?topic=&limit=1..200&before_id=` (role `admin`) → `{items}`.
  - `buildApp` deps: `now?` (mặc định `Date.now`). Đăng ký khi có `pool` + `paddle` + `queue`.
  - CLI: `api.reconcile(sinceSeconds)` (không retry), `api.listOutbox({topic?, limit?})`; lệnh `ikf billing reconcile --since <n><m|h|d>` (≤ 30d) và `ikf billing outbox ls [--topic] [--limit 1..200]`.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/reconcile.test.js`:

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { reconcile } from '../src/billing/reconcile.js';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, tokenFor, bearer } from './helpers/app.js';
import { fakePaddle, paddleTxn } from './helpers/paddle.js';
import { fakeQueue } from './helpers/queue.js';

const NOW = Date.parse('2026-10-09T12:00:00Z');

describe('billing reconcile + outbox listing', () => {
  let db;
  let app;
  let paddle;
  let queue;
  let admin;

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    paddle = fakePaddle();
    queue = fakeQueue();
    ({ app } = await makeApp(db.pool, { paddle, queue, now: () => NOW }));
    admin = await tokenFor(db.pool, 'admin');
    // In Paddle: a (in sync), b (DB has older status), c (missing from DB), old (before the window).
    paddle.transaction(paddleTxn({ id: 'txn_a', status: 'completed', updated_at: '2026-10-09T11:00:00.000001Z' }));
    paddle.transaction(paddleTxn({ id: 'txn_b', status: 'completed', updated_at: '2026-10-09T11:30:00.000001Z' }));
    paddle.transaction(paddleTxn({ id: 'txn_c', status: 'paid', updated_at: '2026-10-09T11:45:00Z' }));
    paddle.transaction(paddleTxn({ id: 'txn_old', status: 'completed', updated_at: '2026-10-08T01:00:00Z' }));
    const insert = (id, status, at) =>
      db.pool.query(
        `INSERT INTO transactions (paddle_transaction_id, status, origin, amount_minor, currency, paddle_updated_at)
         VALUES ($1, $2, 'web', 100, 'USD', $3)`,
        [id, status, at],
      );
    await insert('txn_a', 'completed', '2026-10-09T11:00:00.000001Z');
    await insert('txn_b', 'paid', '2026-10-09T11:20:00Z');
  });
  afterEach(() => app.close());

  it('reconcile(): asks Paddle for the window, queues missing and stale transactions only', async () => {
    const r = await reconcile({ pool: db.pool, paddle, queue, since: new Date('2026-10-09T00:00:00Z') });
    expect(r).toEqual({ since: '2026-10-09T00:00:00.000Z', checked: 3, missing: 1, stale: 1, enqueued: 2 });
    expect(paddle.calls).toEqual([['listTransactions', { updatedAfter: '2026-10-09T00:00:00.000Z' }]]);
    expect(queue.sent).toEqual([
      { event_id: 'reconcile:txn_b:2026-10-09T11:30:00.000001Z', event_type: 'reconcile', entity: 'transaction', entity_id: 'txn_b' },
      { event_id: 'reconcile:txn_c:2026-10-09T11:45:00Z', event_type: 'reconcile', entity: 'transaction', entity_id: 'txn_c' },
    ]);
  });

  it('POST /v1/billing/reconcile: admin only, since_seconds back from now', async () => {
    const post = (body, token = admin) => app.inject({ method: 'POST', url: '/v1/billing/reconcile', headers: bearer(token), payload: body });
    const res = await post({ since_seconds: 86400 });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ since: '2026-10-08T12:00:00.000Z', checked: 3, missing: 1, stale: 1, enqueued: 2 });
    expect((await post({ since_seconds: 86400 }, await tokenFor(db.pool, 'router'))).statusCode).toBe(403);
    expect((await post({ since_seconds: 10 })).statusCode).toBe(400);
    expect((await post({ since_seconds: 40 * 86400 })).statusCode).toBe(400);
  });

  it('503 when Paddle or SQS is down', async () => {
    const post = () => app.inject({ method: 'POST', url: '/v1/billing/reconcile', headers: bearer(admin), payload: { since_seconds: 3600 } });
    paddle.fail('unavailable');
    expect((await post()).json()).toEqual({ error: 'paddle_unavailable' });
    paddle.ok();
    queue.fail();
    expect((await post()).json()).toEqual({ error: 'queue_unavailable' });
  });

  it('GET /v1/billing/outbox: newest first, filter by topic, page with before_id', async () => {
    for (const [topic, agg] of [['payment.succeeded', 'txn_a'], ['subscription.activated', 'sub_1'], ['payment.succeeded', 'txn_b']]) {
      await db.pool.query('INSERT INTO outbox (topic, aggregate_id, dedupe_key, payload) VALUES ($1, $2, $3, $4)', [topic, agg, `${topic}:${agg}`, { x: agg }]);
    }
    const get = (qs, token = admin) => app.inject({ method: 'GET', url: `/v1/billing/outbox${qs}`, headers: bearer(token) });
    const all = (await get('')).json().items;
    expect(all.map((i) => [i.id, i.topic, i.aggregate_id])).toEqual([[3, 'payment.succeeded', 'txn_b'], [2, 'subscription.activated', 'sub_1'], [1, 'payment.succeeded', 'txn_a']]);
    expect(all[0]).toEqual({ id: 3, topic: 'payment.succeeded', aggregate_id: 'txn_b', payload: { x: 'txn_b' }, created_at: expect.any(String), published_at: null });
    expect((await get('?topic=payment.succeeded&limit=1')).json().items.map((i) => i.id)).toEqual([3]);
    expect((await get('?topic=payment.succeeded&before_id=3')).json().items.map((i) => i.id)).toEqual([1]);
    expect((await get('?limit=500')).statusCode).toBe(400);
    expect((await get('', await tokenFor(db.pool, 'publisher'))).statusCode).toBe(403);
  });
});
```

`packages/cli/test/billing.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { run } from '../src/main.js';
import { createApi } from '../src/api.js';

function io(api = {}) {
  const lines = [];
  const errors = [];
  return { lines, errors, opts: { out: (l) => lines.push(l), err: (l) => errors.push(l), env: {}, deps: { api } } };
}

describe('ikf billing reconcile', () => {
  it.each([
    ['30m', 1800],
    ['24h', 86400],
    ['7d', 604800],
  ])('--since %s sends %i seconds and prints the mismatch count', async (since, seconds) => {
    const calls = [];
    const t = io({ reconcile: async (s) => { calls.push(s); return { since: '2026-10-08T12:00:00.000Z', checked: 40, missing: 1, stale: 2, enqueued: 3 }; } });
    expect(await run(['billing', 'reconcile', '--since', since], t.opts)).toBe(0);
    expect(calls).toEqual([seconds]);
    expect(t.lines).toEqual([
      'Đối soát giao dịch Paddle cập nhật từ 2026-10-08T12:00:00.000Z: 40 giao dịch.',
      'Lệch: 3 (thiếu trong DB: 1, cũ hơn Paddle: 2). Đã đẩy 3 vào hàng đợi đồng bộ.',
    ]);
  });

  it('says when there is nothing to fix', async () => {
    const t = io({ reconcile: async () => ({ since: 's', checked: 5, missing: 0, stale: 0, enqueued: 0 }) });
    await run(['billing', 'reconcile', '--since', '1h'], t.opts);
    expect(t.lines[1]).toBe('Lệch: 0. DB khớp với Paddle.');
  });

  it.each([[[]], [['--since', '5']], [['--since', '0h']], [['--since', '31d']], [['--since', '2w']]])('exits 2 for %j', async (args) => {
    const t = io({ reconcile: async () => { throw new Error('must not be called'); } });
    expect(await run(['billing', 'reconcile', ...args], t.opts)).toBe(2);
    expect(t.errors).toEqual(['cần --since <số><m|h|d>, tối đa 30d (ví dụ --since 24h)']);
  });
});

describe('ikf billing outbox ls', () => {
  const items = [
    { id: 12, topic: 'payment.succeeded', aggregate_id: 'txn_b', payload: {}, created_at: '2026-10-09T11:00:00.000Z', published_at: null },
    { id: 11, topic: 'subscription.activated', aggregate_id: 'sub_1', payload: {}, created_at: '2026-10-09T10:00:00.000Z', published_at: '2026-10-09T10:00:05.000Z' },
  ];

  it('prints newest first with publish state; passes --topic and --limit', async () => {
    const calls = [];
    const t = io({ listOutbox: async (q) => { calls.push(q); return { items }; } });
    expect(await run(['billing', 'outbox', 'ls', '--topic', 'payment.succeeded', '--limit', '20'], t.opts)).toBe(0);
    expect(calls).toEqual([{ topic: 'payment.succeeded', limit: 20 }]);
    expect(t.lines).toEqual([
      '12  2026-10-09T11:00:00.000Z  payment.succeeded         txn_b  chờ gửi',
      '11  2026-10-09T10:00:00.000Z  subscription.activated    sub_1  đã gửi',
    ]);
  });

  it('empty outbox; bad --limit', async () => {
    const t = io({ listOutbox: async () => ({ items: [] }) });
    await run(['billing', 'outbox', 'ls'], t.opts);
    expect(t.lines).toEqual(['(outbox trống)']);
    const bad = io({ listOutbox: async () => ({ items }) });
    expect(await run(['billing', 'outbox', 'ls', '--limit', '0'], bad.opts)).toBe(2);
    expect(bad.errors).toEqual(['--limit phải từ 1 đến 200']);
  });

  it('unknown billing subcommand prints usage', async () => {
    const t = io();
    expect(await run(['billing', 'refund'], t.opts)).toBe(2);
    expect(t.errors[0]).toContain('ikf billing reconcile --since <24h|7d|…>');
  });
});

describe('api billing', () => {
  it('POST /v1/billing/reconcile is not retried; GET /v1/billing/outbox builds the query', async () => {
    const calls = [];
    const fetch = async (url, init) => {
      calls.push({ url, method: init.method, body: init.body && JSON.parse(init.body) });
      return new Response(JSON.stringify({ error: 'paddle_unavailable' }), { status: 503 });
    };
    const api = createApi({ api: 'https://api.x', token: 't' }, { fetch, sleep: async () => {} });
    await expect(api.reconcile(3600)).rejects.toMatchObject({ status: 503, code: 'paddle_unavailable' });
    expect(calls).toEqual([{ url: 'https://api.x/v1/billing/reconcile', method: 'POST', body: { since_seconds: 3600 } }]);
    calls.length = 0;
    await api.listOutbox({ topic: 'payment.succeeded', limit: 5 }).catch(() => {});
    expect(calls[0].url).toBe('https://api.x/v1/billing/outbox?topic=payment.succeeded&limit=5');
    await api.listOutbox({}).catch(() => {});
    expect(calls.at(-1).url).toBe('https://api.x/v1/billing/outbox');
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run:
```bash
npm test -w @ikf/core-api
npm test -w @ikf/cli
```
Expected: core-api FAIL — không tìm thấy `../src/billing/reconcile.js` (185 test cũ pass); cli FAIL — 13 test của `billing.test.js` (exit 2 vì `billing` chưa là lệnh), 86 test cũ pass.

- [ ] **Step 3: Implement (core-api)**

`services/core-api/src/billing/reconcile.js`:

```js
// Webhooks can be lost. Compare every Paddle transaction updated since `since` with our row and
// queue the missing or stale ones for the normal sync worker (same message shape as the webhook).
export async function reconcile({ pool, paddle, queue, since }) {
  const updatedAfter = new Date(since).toISOString();
  const list = await paddle.listTransactions({ updatedAfter });
  if (!list.length) return { since: updatedAfter, checked: 0, missing: 0, stale: 0, enqueued: 0 };
  const { rows } = await pool.query(
    `SELECT p.id, t.paddle_transaction_id IS NULL AS missing,
            (t.paddle_transaction_id IS NOT NULL AND (t.status <> p.status OR t.paddle_updated_at < p.updated_at)) AS stale
       FROM unnest($1::text[], $2::text[], $3::timestamptz[]) AS p(id, status, updated_at)
       LEFT JOIN transactions t ON t.paddle_transaction_id = p.id`,
    [list.map((t) => t.id), list.map((t) => t.status), list.map((t) => t.updated_at)],
  );
  const off = new Map(rows.filter((r) => r.missing || r.stale).map((r) => [r.id, r]));
  let enqueued = 0;
  for (const t of list) {
    if (!off.has(t.id)) continue;
    await queue.send({ event_id: `reconcile:${t.id}:${t.updated_at}`, event_type: 'reconcile', entity: 'transaction', entity_id: t.id });
    enqueued += 1;
  }
  return {
    since: updatedAfter,
    checked: list.length,
    missing: rows.filter((r) => r.missing).length,
    stale: rows.filter((r) => r.stale).length,
    enqueued,
  };
}

export async function listOutbox(db, { topic = null, limit = 50, beforeId = null } = {}) {
  const { rows } = await db.query(
    `SELECT id, topic, aggregate_id, payload, created_at, published_at FROM outbox
      WHERE ($1::text IS NULL OR topic = $1) AND ($2::bigint IS NULL OR id < $2)
      ORDER BY id DESC LIMIT $3`,
    [topic, beforeId, limit],
  );
  return {
    items: rows.map((r) => ({
      id: Number(r.id),
      topic: r.topic,
      aggregate_id: r.aggregate_id,
      payload: r.payload,
      created_at: r.created_at.toISOString(),
      published_at: r.published_at ? r.published_at.toISOString() : null,
    })),
  };
}
```

`services/core-api/src/http/billing.js`:

```js
import { requireRole } from '../auth.js';
import { paddleHttpError } from '../billing/errors.js';
import { listOutbox, reconcile } from '../billing/reconcile.js';
import { HttpError } from '../errors.js';

export const MAX_RECONCILE_SECONDS = 30 * 86400;

export default async function billingHttp(app, { pool, paddle, queue, alarm, now = Date.now }) {
  const admin = requireRole(pool, 'admin');

  app.post(
    '/v1/billing/reconcile',
    {
      onRequest: admin,
      schema: {
        body: {
          type: 'object',
          required: ['since_seconds'],
          properties: { since_seconds: { type: 'integer', minimum: 60, maximum: MAX_RECONCILE_SECONDS } },
        },
      },
    },
    async (req) => {
      const since = new Date(now() - req.body.since_seconds * 1000);
      // Wrap queue.send so an SQS outage is told apart from a Paddle one.
      const guardedQueue = {
        send: async (body) => {
          try {
            await queue.send(body);
          } catch (err) {
            req.log.error({ err: err.message }, 'reconcile_enqueue_failed');
            throw new HttpError(503, 'queue_unavailable');
          }
        },
      };
      try {
        const r = await reconcile({ pool, paddle, queue: guardedQueue, since });
        req.log.info(r, 'billing_reconcile');
        return r;
      } catch (err) {
        throw await paddleHttpError(err, { log: req.log, alarm });
      }
    },
  );

  app.get(
    '/v1/billing/outbox',
    {
      onRequest: admin,
      schema: {
        querystring: {
          type: 'object',
          properties: {
            topic: { type: 'string', pattern: '^[a-z_]+\\.[a-z_]+$' },
            limit: { type: 'integer', minimum: 1, maximum: 200, default: 50 },
            before_id: { type: 'integer', minimum: 1 },
          },
        },
      },
    },
    async (req) => listOutbox(pool, { topic: req.query.topic ?? null, limit: req.query.limit, beforeId: req.query.before_id ?? null }),
  );
}
```

`services/core-api/src/app.js`: thêm import sau `import webhookHttp from './http/webhook.js';`

```js
import billingHttp from './http/billing.js';
```
và đăng ký ngay sau dòng `webhookHttp`:

```js
  if (deps?.pool && deps?.paddle && deps?.queue) app.register(billingHttp, deps);
```

- [ ] **Step 4: Implement (CLI)**

`packages/cli/src/api.js`: thêm ngay sau dòng `listPrices: …` (Task 4):

```js
    // Not retried: a reconcile that timed out may still be running and queueing.
    reconcile: (sinceSeconds) => call('POST', '/v1/billing/reconcile', { body: { since_seconds: sinceSeconds }, retry: false }),
    listOutbox: ({ topic, limit } = {}) => {
      const qs = new URLSearchParams({ ...(topic && { topic }), ...(limit && { limit: String(limit) }) }).toString();
      return call('GET', `/v1/billing/outbox${qs ? `?${qs}` : ''}`, { retry: true });
    },
```

`packages/cli/src/main.js`:

1. Trong `USAGE`, ngay sau dòng `  ikf funnel prices ls <slug>` thêm:
```
  ikf billing reconcile --since <24h|7d|…>
  ikf billing outbox ls [--topic <topic>] [--limit <n>]
```
2. Ngay trước `export function formatApiError(e) {` thêm:
```js
const DURATION_RE = /^([1-9]\d*)([mhd])$/;
const UNIT_SECONDS = { m: 60, h: 3600, d: 86400 };

async function billingCommand(api, sub, args, values, out) {
  if (sub === 'reconcile') {
    const m = DURATION_RE.exec(values.since ?? '');
    const seconds = m ? Number(m[1]) * UNIT_SECONDS[m[2]] : 0;
    if (!seconds || seconds > 30 * 86400) throw new UsageError('cần --since <số><m|h|d>, tối đa 30d (ví dụ --since 24h)');
    const r = await api.reconcile(seconds);
    const off = r.missing + r.stale;
    out(`Đối soát giao dịch Paddle cập nhật từ ${r.since}: ${r.checked} giao dịch.`);
    out(off
      ? `Lệch: ${off} (thiếu trong DB: ${r.missing}, cũ hơn Paddle: ${r.stale}). Đã đẩy ${r.enqueued} vào hàng đợi đồng bộ.`
      : 'Lệch: 0. DB khớp với Paddle.');
    return 0;
  }
  if (sub === 'outbox' && args[0] === 'ls') {
    const limit = values.limit === undefined ? undefined : Number(values.limit);
    if (limit !== undefined && !(Number.isInteger(limit) && limit >= 1 && limit <= 200)) throw new UsageError('--limit phải từ 1 đến 200');
    const { items } = await api.listOutbox({ topic: values.topic, limit });
    if (!items.length) out('(outbox trống)');
    for (const i of items) {
      out(`${i.id}  ${i.created_at}  ${i.topic.padEnd(25)} ${i.aggregate_id}  ${i.published_at ? 'đã gửi' : 'chờ gửi'}`);
    }
    return 0;
  }
  throw new UsageError(USAGE);
}

```
3. Trong `parseArgs` `options`, sau `env: { type: 'string' },` thêm:
```js
        since: { type: 'string' },
        topic: { type: 'string' },
        limit: { type: 'string' },
```
4. Thay
```js
    if (!['route', 'publish', 'funnel', 'events'].includes(cmd)) throw new UsageError(USAGE);
```
bằng
```js
    if (!['route', 'publish', 'funnel', 'events', 'billing'].includes(cmd)) throw new UsageError(USAGE);
```
5. Ngay sau `if (cmd === 'funnel') return await funnelCommand(api, sub, rest, values, out);` thêm:
```js
    if (cmd === 'billing') return await billingCommand(api, sub, rest, values, out);
```

- [ ] **Step 5: Chạy test, xác nhận PASS**

Run:
```bash
npm test -w @ikf/core-api
npm test -w @ikf/cli
```
Expected: core-api `Test Files  19 passed (19)`, `Tests  189 passed (189)`; cli `Test Files  11 passed (11)`, `Tests  99 passed (99)`.

- [ ] **Step 6: Commit**

```bash
git add services/core-api packages/cli
git commit -m "feat(billing): reconcile against Paddle + outbox listing (core API and CLI)"
```

---

### Task 9: core-api — nối billing vào `server.js` (config, secrets, SQS, SNS alarm, chạy/dừng worker) + Dockerfile

**Files:**
- Create: `services/core-api/src/billing/alarm.js`, `services/core-api/src/billing/setup.js`
- Modify: `services/core-api/package.json` (dep `@aws-sdk/client-sns`), `services/core-api/src/config.js`, `services/core-api/src/server.js`, `services/core-api/Dockerfile`
- Test: `services/core-api/test/alarm.test.js`, `services/core-api/test/setup.test.js` (mới); `services/core-api/test/config.test.js` (thay toàn bộ)

**Interfaces:**
- Consumes: `createPaddleClient` (Task 1), `createTurnstileVerifier` (Task 5), `createSqsQueue`, `startQueueWorker` (Task 6), `syncMessage` (Task 7), `loadSecrets` (có sẵn).
- Produces:
  - Env ECS (Task 12 đặt): `PADDLE_ENV` (`sandbox`|`live`, bắt buộc; `APP_ENV=staging` → `sandbox`, `APP_ENV=prod` → `live`), `WEBHOOK_QUEUE_URL` (bắt buộc, đã có trong ECS env), `ALARM_TOPIC_ARN` (tùy chọn).
  - `loadConfig(env).billing = {paddleEnv, webhookQueueUrl, alarmTopicArn: string|null}`.
  - `ALARM_WINDOW_SECONDS = 900`; `memoryThrottle(now?)`, `redisThrottle(redis, fallback)` (`SET alarm:<kind> 1 NX EX 900`), `snsPublisher({client, topicArn}) → (subject, message)`, `createAlarm({publish, throttle, log}) → alarm(kind, message)` (không bao giờ throw; subject `ikf billing: <kind>`).
  - `BILLING_SECRETS = ['paddle-api-key', 'paddle-webhook-secret', 'turnstile-secret']`; `billingDeps({config, secrets, sqsClient, snsClient, redis?, fetch?, log}) → {deps: {paddle, turnstile, queue, webhookSecret, alarm} | null, missing: string[]}` (B17). Thiếu secret → billing tắt, phần còn lại của API vẫn chạy.
  - `server.js`: đọc thêm 3 secret, `buildApp` nhận `...billing.deps`, `startQueueWorker` với `syncMessage`; SIGTERM: `stopResync()` → `await stopBillingSync()` → `app.close()`.
  - Image chứa `packages/paddle` và `packages/event-schema`.

- [ ] **Step 1: Thêm dependency**

```bash
npm install --no-audit --no-fund @aws-sdk/client-sns -w @ikf/core-api
```

- [ ] **Step 2: Viết test fail**

`services/core-api/test/config.test.js` (thay toàn bộ):

```js
import { describe, it, expect } from 'vitest';
import { loadConfig } from '../src/config.js';
import { loadSecrets } from '../src/secrets.js';

const ENV = {
  DB_HOST: 'proxy', DB_USER: 'u', DB_PASSWORD: 'p', DB_SECRET_ARN: 'arn:db-secret', REDIS_HOST: 'r',
  CF_ACCOUNT_ID: 'acc', R2_BUCKET: 'ikf-bundles-staging', KV_NAMESPACE_ID: 'ns',
  MEDIA_ORIGINS: ' https://media.test/funnels/ , https://media2.test/ ',
  PREVIEW_BASE_URL: 'https://preview.ikf-staging.example/',
  SECRETS_PREFIX: 'ikf/staging/',
  APP_ENV: 'staging',
  PADDLE_ENV: 'sandbox',
  WEBHOOK_QUEUE_URL: 'https://sqs.us-east-1.amazonaws.com/111111111111/ikf-staging-webhooks',
  ALARM_TOPIC_ARN: 'arn:aws:sns:us-east-1:111111111111:ikf-staging-alarms',
};

describe('loadConfig', () => {
  it('parses the environment', () => {
    expect(loadConfig(ENV)).toEqual({
      db: { host: 'proxy', user: 'u', password: 'p', secretArn: 'arn:db-secret' },
      redisHost: 'r',
      cfAccountId: 'acc',
      r2Bucket: 'ikf-bundles-staging',
      kvNamespaceId: 'ns',
      mediaOrigins: ['https://media.test/funnels/', 'https://media2.test/'],
      previewBaseUrl: 'https://preview.ikf-staging.example',
      secretsPrefix: 'ikf/staging/',
      billing: {
        paddleEnv: 'sandbox',
        webhookQueueUrl: 'https://sqs.us-east-1.amazonaws.com/111111111111/ikf-staging-webhooks',
        alarmTopicArn: 'arn:aws:sns:us-east-1:111111111111:ikf-staging-alarms',
      },
    });
  });

  it('requires the Paddle env and the webhook queue; the alarm topic is optional', () => {
    const { PADDLE_ENV, WEBHOOK_QUEUE_URL, ALARM_TOPIC_ARN, ...rest } = ENV;
    expect(() => loadConfig(rest)).toThrow('missing env: PADDLE_ENV, WEBHOOK_QUEUE_URL');
    expect(loadConfig({ ...ENV, ALARM_TOPIC_ARN: '' }).billing.alarmTopicArn).toBeNull();
  });

  it('staging must use the Paddle sandbox and prod the live account', () => {
    expect(() => loadConfig({ ...ENV, PADDLE_ENV: 'prod' })).toThrow('PADDLE_ENV must be sandbox or live');
    expect(() => loadConfig({ ...ENV, PADDLE_ENV: 'live' })).toThrow('APP_ENV staging needs PADDLE_ENV=sandbox');
    expect(() => loadConfig({ ...ENV, APP_ENV: 'prod' })).toThrow('APP_ENV prod needs PADDLE_ENV=live');
    expect(loadConfig({ ...ENV, APP_ENV: 'prod', PADDLE_ENV: 'live' }).billing.paddleEnv).toBe('live');
  });

  it('names every missing variable', () => {
    const { R2_BUCKET, KV_NAMESPACE_ID, ...rest } = ENV;
    expect(() => loadConfig(rest)).toThrow('missing env: R2_BUCKET, KV_NAMESPACE_ID');
  });

  it('requires the DB secret ARN so rotated passwords can be refetched', () => {
    const { DB_SECRET_ARN, ...rest } = ENV;
    expect(() => loadConfig(rest)).toThrow('missing env: DB_SECRET_ARN');
  });

  it('rejects media origins that are not https', () => {
    expect(() => loadConfig({ ...ENV, MEDIA_ORIGINS: 'http://media.test/' })).toThrow(/https/);
  });
});

describe('loadSecrets', () => {
  const client = (values) => ({
    send: async (cmd) => {
      const v = values[cmd.input.SecretId];
      if (v instanceof Error) throw v;
      return { SecretString: v };
    },
  });
  const notFound = Object.assign(new Error('no value'), { name: 'ResourceNotFoundException' });

  it('returns values by short name and null for secrets without a value', async () => {
    const out = await loadSecrets('ikf/staging/', ['a', 'b'], client({ 'ikf/staging/a': 'A', 'ikf/staging/b': notFound }));
    expect(out).toEqual({ a: 'A', b: null });
  });

  it('rethrows other errors', async () => {
    const denied = Object.assign(new Error('denied'), { name: 'AccessDeniedException' });
    await expect(loadSecrets('p/', ['a'], client({ 'p/a': denied }))).rejects.toThrow('denied');
  });
});
```

`services/core-api/test/alarm.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { createAlarm, memoryThrottle, redisThrottle, snsPublisher, ALARM_WINDOW_SECONDS } from '../src/billing/alarm.js';

describe('billing alarms', () => {
  it('publishes once per kind per 15 minutes', async () => {
    let now = 0;
    const sent = [];
    const alarm = createAlarm({ publish: async (s, m) => sent.push([s, m]), throttle: memoryThrottle(() => now), log: { error: () => {} } });
    await alarm('paddle_auth_failed', 'key rejected');
    await alarm('paddle_auth_failed', 'key rejected');
    await alarm('other', 'x');
    now = ALARM_WINDOW_SECONDS * 1000 + 1;
    await alarm('paddle_auth_failed', 'again');
    expect(sent).toEqual([
      ['ikf billing: paddle_auth_failed', 'key rejected'],
      ['ikf billing: other', 'x'],
      ['ikf billing: paddle_auth_failed', 'again'],
    ]);
  });

  it('redis throttle: SET alarm:<kind> NX EX 900 decides; falls back to memory when Redis fails', async () => {
    const calls = [];
    let reply = 'OK';
    const redis = { set: async (...a) => { calls.push(a); if (reply instanceof Error) throw reply; return reply; } };
    const fallbackNow = 0;
    const t = redisThrottle(redis, memoryThrottle(() => fallbackNow));
    expect(await t('k')).toBe(true);
    reply = null;
    expect(await t('k')).toBe(false);
    expect(calls[0]).toEqual(['alarm:k', '1', { NX: true, EX: 900 }]);
    reply = new Error('redis down');
    expect(await t('z')).toBe(true);
    expect(await t('z')).toBe(false);
  });

  it('a failing publish is logged, never thrown', async () => {
    const errors = [];
    const alarm = createAlarm({ publish: async () => { throw new Error('sns down'); }, throttle: memoryThrottle(), log: { error: (o, m) => errors.push([m, o.err]) } });
    await expect(alarm('k', 'm')).resolves.toBeUndefined();
    expect(errors).toEqual([['alarm_publish_failed', 'sns down']]);
  });

  it('snsPublisher sends a PublishCommand to the topic', async () => {
    const sent = [];
    const publish = snsPublisher({ client: { send: async (cmd) => sent.push([cmd.constructor.name, cmd.input]) }, topicArn: 'arn:aws:sns:us-east-1:1:t' });
    await publish('subj', 'msg');
    expect(sent).toEqual([['PublishCommand', { TopicArn: 'arn:aws:sns:us-east-1:1:t', Subject: 'subj', Message: 'msg' }]]);
  });
});
```

`services/core-api/test/setup.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { billingDeps, BILLING_SECRETS } from '../src/billing/setup.js';

const config = { paddleEnv: 'sandbox', webhookQueueUrl: 'https://sqs.example/ikf-staging-webhooks', alarmTopicArn: 'arn:aws:sns:us-east-1:1:alarms' };
const secrets = { 'paddle-api-key': 'pdl_sdbx_k', 'paddle-webhook-secret': 'pdl_ntfset_s', 'turnstile-secret': 'ts' };
const log = { warn: () => {}, error: () => {} };

describe('billingDeps', () => {
  it('builds the Paddle client, Turnstile verifier, SQS queue, webhook secret and alarm from config + secrets', async () => {
    const sqsSent = [];
    const snsSent = [];
    const fetchCalls = [];
    const { deps, missing } = billingDeps({
      config,
      secrets,
      sqsClient: { send: async (cmd) => { sqsSent.push(cmd.input); return {}; } },
      snsClient: { send: async (cmd) => snsSent.push(cmd.input) },
      redis: null,
      fetch: async (url, init) => { fetchCalls.push([url, init.headers?.authorization]); return new Response('{"data":{"id":"pri_1"}}', { status: 200 }); },
      log,
    });
    expect(missing).toEqual([]);
    expect(deps.webhookSecret).toBe('pdl_ntfset_s');
    expect(deps.paddle.env).toBe('sandbox');
    await deps.paddle.getPrice('pri_1');
    expect(fetchCalls[0]).toEqual(['https://sandbox-api.paddle.com/prices/pri_1', 'Bearer pdl_sdbx_k']);
    await deps.queue.send({ a: 1 });
    expect(sqsSent).toEqual([{ QueueUrl: config.webhookQueueUrl, MessageBody: '{"a":1}' }]);
    await deps.alarm('paddle_auth_failed', 'm');
    await deps.alarm('paddle_auth_failed', 'm');
    expect(snsSent).toEqual([{ TopicArn: config.alarmTopicArn, Subject: 'ikf billing: paddle_auth_failed', Message: 'm' }]);
    expect(typeof deps.turnstile).toBe('function');
  });

  it('a missing secret disables billing (the rest of core keeps running) and names it', () => {
    expect(BILLING_SECRETS).toEqual(['paddle-api-key', 'paddle-webhook-secret', 'turnstile-secret']);
    const { deps, missing } = billingDeps({ config, secrets: { ...secrets, 'paddle-webhook-secret': null }, sqsClient: {}, snsClient: {}, log });
    expect(deps).toBeNull();
    expect(missing).toEqual(['paddle-webhook-secret']);
  });

  it('no alarm topic: alarms are only logged', async () => {
    const errors = [];
    const { deps } = billingDeps({ config: { ...config, alarmTopicArn: null }, secrets, sqsClient: {}, snsClient: { send: async () => { throw new Error('must not publish'); } }, log: { ...log, error: (o, m) => errors.push(m) } });
    await deps.alarm('paddle_auth_failed', 'm');
    expect(errors).toEqual(['alarm']);
  });
});
```

- [ ] **Step 3: Chạy test, xác nhận FAIL**

Run: `npm test -w @ikf/core-api`
Expected: FAIL — `alarm.test.js`, `setup.test.js` không tìm thấy module; `config.test.js` 3 test fail (thiếu `billing`, không báo thiếu `PADDLE_ENV`). 188 test khác pass.

- [ ] **Step 4: Implement**

`services/core-api/src/config.js` (thay toàn bộ):

```js
const REQUIRED = [
  'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_SECRET_ARN', 'REDIS_HOST',
  'CF_ACCOUNT_ID', 'R2_BUCKET', 'KV_NAMESPACE_ID', 'MEDIA_ORIGINS', 'PREVIEW_BASE_URL', 'SECRETS_PREFIX',
  'PADDLE_ENV', 'WEBHOOK_QUEUE_URL',
];

// Staging must never charge real cards, prod must never take sandbox payments.
const PADDLE_ENV_FOR = { staging: 'sandbox', prod: 'live' };

export function loadConfig(env = process.env) {
  const missing = REQUIRED.filter((k) => !env[k]);
  if (missing.length) throw new Error(`missing env: ${missing.join(', ')}`);
  const mediaOrigins = env.MEDIA_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean);
  for (const origin of mediaOrigins) {
    if (new URL(origin).protocol !== 'https:') throw new Error(`MEDIA_ORIGINS entries must be https: ${origin}`);
  }
  if (!['sandbox', 'live'].includes(env.PADDLE_ENV)) throw new Error('PADDLE_ENV must be sandbox or live');
  const expected = PADDLE_ENV_FOR[env.APP_ENV];
  if (expected && env.PADDLE_ENV !== expected) throw new Error(`APP_ENV ${env.APP_ENV} needs PADDLE_ENV=${expected}`);
  return {
    db: { host: env.DB_HOST, user: env.DB_USER, password: env.DB_PASSWORD, secretArn: env.DB_SECRET_ARN },
    redisHost: env.REDIS_HOST,
    cfAccountId: env.CF_ACCOUNT_ID,
    r2Bucket: env.R2_BUCKET,
    kvNamespaceId: env.KV_NAMESPACE_ID,
    mediaOrigins,
    previewBaseUrl: env.PREVIEW_BASE_URL.replace(/\/+$/, ''),
    secretsPrefix: env.SECRETS_PREFIX,
    billing: {
      paddleEnv: env.PADDLE_ENV,
      webhookQueueUrl: env.WEBHOOK_QUEUE_URL,
      alarmTopicArn: env.ALARM_TOPIC_ARN || null,
    },
  };
}
```

`services/core-api/src/billing/alarm.js`:

```js
import { PublishCommand } from '@aws-sdk/client-sns';

export const ALARM_WINDOW_SECONDS = 15 * 60;

// throttle(kind) → true when this alarm may go out now (at most once per window per kind).
export function memoryThrottle(now = Date.now) {
  const last = new Map();
  return async (kind) => {
    const t = now();
    if (last.has(kind) && t - last.get(kind) < ALARM_WINDOW_SECONDS * 1000) return false;
    last.set(kind, t);
    return true;
  };
}

// Shared across ECS tasks through Redis; if Redis is down, each task throttles on its own.
export function redisThrottle(redis, fallback = memoryThrottle()) {
  return async (kind) => {
    try {
      return (await redis.set(`alarm:${kind}`, '1', { NX: true, EX: ALARM_WINDOW_SECONDS })) === 'OK';
    } catch {
      return fallback(kind);
    }
  };
}

export function snsPublisher({ client, topicArn }) {
  return (subject, message) => client.send(new PublishCommand({ TopicArn: topicArn, Subject: subject, Message: message }));
}

// alarm(kind, message): never throws; a failed publish is only logged.
export function createAlarm({ publish, throttle, log }) {
  return async (kind, message) => {
    try {
      if (!(await throttle(kind))) return;
      await publish(`ikf billing: ${kind}`, message);
    } catch (err) {
      log.error({ kind, err: err.message }, 'alarm_publish_failed');
    }
  };
}
```

`services/core-api/src/billing/setup.js`:

```js
import { createPaddleClient } from '@ikf/paddle';
import { createAlarm, memoryThrottle, redisThrottle, snsPublisher } from './alarm.js';
import { createSqsQueue } from './queue.js';
import { createTurnstileVerifier } from './turnstile.js';

export const BILLING_SECRETS = ['paddle-api-key', 'paddle-webhook-secret', 'turnstile-secret'];

// Everything billing needs, from config.billing + Secrets Manager values. A missing secret value
// turns billing off (routes not registered, worker not started) instead of failing the whole API.
export function billingDeps({ config, secrets, sqsClient, snsClient, redis = null, fetch = globalThis.fetch, log }) {
  const missing = BILLING_SECRETS.filter((n) => !secrets[n]);
  if (missing.length) return { deps: null, missing };
  const throttle = redis ? redisThrottle(redis, memoryThrottle()) : memoryThrottle();
  const publish = config.alarmTopicArn
    ? snsPublisher({ client: snsClient, topicArn: config.alarmTopicArn })
    : async (subject, message) => log.error({ subject, message }, 'alarm');
  return {
    missing,
    deps: {
      paddle: createPaddleClient({ apiKey: secrets['paddle-api-key'], env: config.paddleEnv, fetch }),
      turnstile: createTurnstileVerifier({ secret: secrets['turnstile-secret'], fetch }),
      queue: createSqsQueue({ client: sqsClient, queueUrl: config.webhookQueueUrl }),
      webhookSecret: secrets['paddle-webhook-secret'],
      alarm: createAlarm({ publish, throttle, log }),
    },
  };
}
```

`services/core-api/src/server.js` (thay toàn bộ):

```js
import { SNSClient } from '@aws-sdk/client-sns';
import { SQSClient } from '@aws-sdk/client-sqs';
import pg from 'pg';
import { createClient } from 'redis';
import { buildApp } from './app.js';
import { ensureToken } from './auth.js';
import { loadConfig } from './config.js';
import { migrate } from './db/migrate.js';
import { createPasswordProvider, invalidateOnAuthError } from './db/password.js';
import { loadSecrets } from './secrets.js';
import { createR2Store } from './publisher/bundle-store.js';
import { createKvClient } from './publisher/route-kv.js';
import { startResync } from './publisher/resync.js';
import { startQueueWorker } from './billing/queue.js';
import { BILLING_SECRETS, billingDeps } from './billing/setup.js';
import { syncMessage } from './billing/sync.js';

const REQUIRED_SECRETS = ['cf-kv-api-token', 'r2-access-key-id', 'r2-secret-access-key'];

const config = loadConfig();
const secrets = await loadSecrets(config.secretsPrefix, [...REQUIRED_SECRETS, 'bootstrap-admin-token', ...BILLING_SECRETS]);
const missing = REQUIRED_SECRETS.filter((n) => !secrets[n]);
if (missing.length) {
  console.error(`missing secret values: ${missing.map((n) => config.secretsPrefix + n).join(', ')}`);
  process.exit(1);
}

// RDS rotates the managed master password; read it per new connection (cached) instead of the
// value injected at task start, and drop the cache when the proxy rejects it.
const dbPassword = createPasswordProvider({ secretArn: config.db.secretArn });
const pool = invalidateOnAuthError(new pg.Pool({
  host: config.db.host,
  port: 5432,
  database: 'ikf',
  user: config.db.user,
  password: () => dbPassword.get(),
  ssl: { rejectUnauthorized: true },
  max: 10,
  idleTimeoutMillis: 30000,
}), dbPassword);
pool.on('error', (err) => console.error('pg pool error', err.message));

const redis = createClient({ url: `rediss://${config.redisHost}:6379` });
redis.on('error', (err) => console.error('redis error', err.message));
await redis.connect().catch((err) => console.error('redis connect failed', err.message));

await migrate(pool);
if (secrets['bootstrap-admin-token']) {
  await ensureToken(pool, { name: 'bootstrap', roles: ['admin'], token: secrets['bootstrap-admin-token'] });
}

const store = createR2Store({
  accountId: config.cfAccountId,
  bucket: config.r2Bucket,
  accessKeyId: secrets['r2-access-key-id'],
  secretAccessKey: secrets['r2-secret-access-key'],
});
const kv = createKvClient({
  accountId: config.cfAccountId,
  namespaceId: config.kvNamespaceId,
  apiToken: secrets['cf-kv-api-token'],
});

const region = process.env.AWS_REGION || 'us-east-1';
const billing = billingDeps({
  config: config.billing,
  secrets,
  sqsClient: new SQSClient({ region }),
  snsClient: new SNSClient({ region }),
  redis,
  log: { warn: (o, m) => console.warn(m, JSON.stringify(o)), error: (o, m) => console.error(m, JSON.stringify(o)) },
});
if (!billing.deps) {
  // Billing off until the values are entered; publishing and routing keep working.
  console.error(`billing disabled, missing secret values: ${billing.missing.map((n) => config.secretsPrefix + n).join(', ')}`);
}

const app = buildApp({
  logger: true,
  checks: {
    db: () => pool.query('select 1'),
    cache: () => redis.ping(),
  },
  deps: { pool, store, kv, mediaOrigins: config.mediaOrigins, previewBaseUrl: config.previewBaseUrl, ...billing.deps },
});

const stopResync = startResync({ pool, kv, log: app.log });
// billing-sync: long-polls the webhooks queue in this process (spec §1).
const stopBillingSync = billing.deps
  ? startQueueWorker({
    queue: billing.deps.queue,
    handle: (msg) => syncMessage({ pool, paddle: billing.deps.paddle, log: app.log }, msg),
    log: app.log,
  })
  : async () => {};

let shuttingDown = false;
const shutdown = async () => {
  if (shuttingDown) return;
  shuttingDown = true;
  setTimeout(() => process.exit(1), 10_000).unref();
  stopResync();
  await stopBillingSync(); // ends the long poll; the message in hand finishes or returns to the queue
  await app.close();
  await Promise.allSettled([pool.end(), redis.quit()]);
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

await app.listen({ host: '0.0.0.0', port: 8080 });
```

`services/core-api/Dockerfile` (thay toàn bộ):

```dockerfile
# Build context is the repo root: docker build -f services/core-api/Dockerfile .
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY packages/route-match/package.json packages/route-match/
COPY packages/paddle/package.json packages/paddle/
COPY packages/event-schema/package.json packages/event-schema/
COPY services/core-api/package.json services/core-api/
RUN npm ci --omit=dev -w @ikf/core-api
COPY packages/route-match/src packages/route-match/src
COPY packages/paddle/src packages/paddle/src
COPY packages/event-schema/src packages/event-schema/src
COPY services/core-api/src services/core-api/src
COPY services/core-api/migrations services/core-api/migrations
WORKDIR /app/services/core-api
USER node
EXPOSE 8080
CMD ["node", "src/server.js"]
```

- [ ] **Step 5: Chạy test, xác nhận PASS**

Run: `npm test -w @ikf/core-api`
Expected: `Test Files  21 passed (21)`, `Tests  198 passed (198)`.

- [ ] **Step 6: Kiểm tra image (server.js không có unit test, như trước)**

```bash
node --check services/core-api/src/server.js
docker build -q -f services/core-api/Dockerfile -t ikf-core-api-billing-check .
docker run --rm --entrypoint node ikf-core-api-billing-check -e "Promise.all(['./src/billing/setup.js','./src/billing/sync.js','./src/app.js'].map(m=>import(m))).then(()=>console.log('container-imports-ok'))"
docker rmi ikf-core-api-billing-check
```
Expected: không lỗi cú pháp; dòng `container-imports-ok` (mọi workspace billing có trong image).

- [ ] **Step 7: Commit**

```bash
git add package-lock.json services/core-api
git commit -m "feat(core-api): wire billing (Paddle, Turnstile, SQS, SNS alarm) and start billing-sync with the API"
```

---

### Task 10: SDK — checkout trong funnel (Turnstile → `/v1/checkout` → Paddle.js), chặn `checkoutUrl`

**Files:**
- Create: `packages/sdk/src/checkout.js`
- Modify: `packages/sdk/src/index.js`
- Test: `packages/sdk/test/checkout.test.js`

**Interfaces:**
- Consumes: `__IKF.paddle = {env: 'sandbox'|'live', clientToken}`, `__IKF.turnstile` (sitekey), `__IKF.api` (origin core, ví dụ `https://api.<zone>`) — Worker đặt ở Task 11; `POST /v1/checkout` (Task 5); funnel: `window.IkFunnel.config.checkoutUrl`, `IkFunnel.completePurchase(plan)`, `IkFunnel.checkoutEmail?()`; event `ikfunnel:checkout_click {plan}`.
- Produces:
  - Hằng `PADDLE_JS`, `TURNSTILE_JS`; `isInApp(ua)`; `scriptLoader(doc) → load(src): Promise` (một tag mỗi src, lỗi thì cho thử lại).
  - `createCheckout(win, {cfg, sid, track, attribution, loadScript?, fetch?, wait?}) → {enabled, start(plan), blockNav(), complete(plan, checkoutId), notice(text, action?)}` — Task 11 dùng `complete` và `notice`.
  - `createSdk(win, deps)` nhận thêm `deps.loadScript`, `deps.fetch`, `deps.wait` (chỉ để test).
  - Event SDK phát: `checkout_complete {plan, checkout_id}` (B7), `checkout_close {plan}`, `checkout_error {reason, plan}` với `reason` ∈ `turnstile_failed | plan_not_mapped | paddle_unavailable | network | http_<status> | paddle_load_failed | paddle_error | …`.
  - Thông báo: phần tử `#ikf-pay` (shadow DOM, đáy màn hình): `We couldn't verify you. Try again.` / `Checkout is unavailable right now.` / `Payment could not load.` (nút `Try again`) hoặc `Payment cannot open in this app.` (link `Open in browser` → `/_ikf/pay?txn=<txn>&ret=<URL funnel + ikf_paid=<checkout_id>>`) (B13, B14).
  - Paddle: `Paddle.Environment.set('sandbox')` khi sandbox, `Paddle.Initialize({token, eventCallback})` một lần, `Paddle.Checkout.open({transactionId, settings: {displayMode: 'overlay', variant: 'one-page'}})`; `checkout.completed` → `completePurchase(plan)` đúng một lần + `Paddle.Checkout.close()`.
  - B8: rỗng hóa `IkFunnel.config.checkoutUrl` (ngay khi chạy, `DOMContentLoaded`, trước mỗi event), gỡ `#demock` khi checkout xong bước khởi tạo (thành công hay lỗi).

Lưu ý: `checkout_id` trong event `checkout_complete` đi qua bộ lọc PII của `@ikf/event-schema` (giá trị có ≥ 7 chữ số liền bị bỏ) — test dùng ULID thực tế, không dùng ULID toàn số 0.

- [ ] **Step 1: Viết test fail**

`packages/sdk/test/checkout.test.js`:

```js
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { createSdk } from '../src/index.js';
import { isInApp, scriptLoader, PADDLE_JS, TURNSTILE_JS } from '../src/checkout.js';

const ORIGINAL_DISPATCH = window.dispatchEvent;
const API = 'https://api.ikf.example';
const EMAIL = 'buyer.person@example.com';
// A realistic ULID: the PII filter drops values with 7+ digits in a row, so avoid long zero runs.
const CK = '01JAXKZ8TQ4M7RP2W9HC3VNBD5';
const UA = window.navigator.userAgent;
let posted;
let fetches;
let replies;
let loads;
let loadFails;
let waits;
let paddle;
let turnstileReplies;
let purchases;

const flushAll = async () => {
  for (let i = 0; i < 20; i += 1) await Promise.resolve();
};
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

function fakePaddle() {
  const p = {
    env: null,
    init: null,
    opened: [],
    closed: 0,
    Environment: { set: (e) => { p.env = e; } },
    Initialize: (o) => { p.init = o; },
    Checkout: { open: (o) => p.opened.push(o), close: () => { p.closed += 1; } },
    emit: (name, data = {}) => p.init.eventCallback({ name, data }),
  };
  return p;
}

const IKF = (extra = {}) => ({
  funnel: 'aivideo', v: 3, rev: 7, country: 'US', pixel: null,
  paddle: { env: 'sandbox', clientToken: 'test_client_token' }, turnstile: '0x4AAAAAAA', api: API, ...extra,
});

function boot(ikf = IKF(), { url = 'https://try.x.com/promo?utm_source=meta' } = {}) {
  window.happyDOM.setURL(url);
  window.__IKF = ikf;
  return createSdk(window, {
    now: () => Date.UTC(2026, 9, 9, 10, 0, 0),
    transport: (u, body) => {
      posted.push(...JSON.parse(body).events);
      return 'ok';
    },
    setTimer: () => 1,
    clearTimer: () => {},
    fetch: async (u, init) => {
      fetches.push({ url: u, init, body: JSON.parse(init.body) });
      const r = replies.shift();
      if (r instanceof Error) throw r;
      return r;
    },
    wait: async (ms) => waits.push(ms),
    loadScript: async (src) => {
      loads.push(src);
      if (loadFails.includes(src)) throw new Error('blocked');
      if (src === PADDLE_JS) window.Paddle = paddle;
      if (src === TURNSTILE_JS) {
        window.turnstile = {
          render: (el, opts) => {
            const r = turnstileReplies.shift() ?? 'ok';
            queueMicrotask(() => (r === 'ok' ? opts.callback(`tok${fetches.length}`) : opts['error-callback']()));
            return 'w1';
          },
          remove: () => {},
        };
      }
    },
  });
}

// What a funnel does: emit checkout_click, then (checkoutUrl empty) open its own demo sheet.
function clickBuy(plan = '1w') {
  window.dispatchEvent(new CustomEvent('ikfunnel:checkout_click', { detail: { plan, price: '$13.67', url: '' } }));
  const demo = document.createElement('div');
  demo.id = 'demock';
  document.body.appendChild(demo);
}
const names = () => posted.map((e) => e.name);
const event = (name) => posted.find((e) => e.name === name);
const notice = () => document.getElementById('ikf-pay')?.shadowRoot;

function clearCookies() {
  for (const c of document.cookie.split(';')) {
    const n = c.split('=')[0].trim();
    if (n) document.cookie = `${n}=; Path=/; Max-Age=0`;
  }
}
afterAll(clearCookies);

beforeEach(() => {
  clearCookies();
  window.dispatchEvent = ORIGINAL_DISPATCH;
  for (const k of ['IKF', '__IKF', 'IkFunnel', 'Paddle', 'turnstile', 'dataLayer', 'ikfEvents']) delete window[k];
  window.sessionStorage.clear();
  window.localStorage.clear();
  document.head.innerHTML = '';
  document.body.innerHTML = '';
  Object.defineProperty(window.navigator, 'userAgent', { configurable: true, get: () => UA });
  posted = [];
  fetches = [];
  replies = [];
  loads = [];
  loadFails = [];
  waits = [];
  turnstileReplies = [];
  purchases = [];
  paddle = fakePaddle();
  window.IkFunnel = {
    config: { checkoutUrl: { '1w': `https://pay.example/?email=${encodeURIComponent(EMAIL)}`, addon: 'https://pay.example/a' } },
    completePurchase: (plan) => purchases.push(plan),
    checkoutEmail: () => EMAIL,
  };
});

describe('SDK checkout', () => {
  it('checkout_click → Turnstile → POST /v1/checkout → Paddle overlay (sandbox)', async () => {
    replies.push(json(201, { checkout_id: CK, transaction_id: 'txn_01aaaaaaaaaaaaaaaaaaaaaaaa' }));
    const sdk = boot();
    clickBuy('1w');
    await flushAll();
    expect(loads).toEqual([TURNSTILE_JS, PADDLE_JS]);
    expect(fetches).toHaveLength(1);
    expect(fetches[0].url).toBe(`${API}/v1/checkout`);
    expect(fetches[0].init).toMatchObject({ method: 'POST', credentials: 'omit', headers: { 'content-type': 'application/json' } });
    expect(fetches[0].body).toEqual({
      funnel: 'aivideo', v: 3, plan: '1w', sid: sdk.attribution().sid, email: EMAIL,
      attribution: { utm_source: 'meta', fbc: null, fbp: expect.any(String) }, turnstile_token: 'tok0',
    });
    expect(paddle.env).toBe('sandbox');
    expect(paddle.init.token).toBe('test_client_token');
    expect(paddle.opened).toEqual([{ transactionId: 'txn_01aaaaaaaaaaaaaaaaaaaaaaaa', settings: { displayMode: 'overlay', variant: 'one-page' } }]);
  });

  it('checkout.completed → completePurchase(plan) once, checkout_complete, overlay closed, no checkout_close', async () => {
    replies.push(json(201, { checkout_id: CK, transaction_id: 'txn_1' }));
    boot();
    clickBuy('addon');
    await flushAll();
    paddle.emit('checkout.completed');
    paddle.emit('checkout.completed');
    paddle.emit('checkout.closed');
    window.IKF.flush();
    expect(purchases).toEqual(['addon']);
    expect(paddle.closed).toBe(1);
    expect(event('checkout_complete').props).toEqual({ plan: 'addon', checkout_id: CK });
    expect(names()).not.toContain('checkout_close');
    expect(names()).not.toContain('purchase_complete'); // the funnel's completePurchase emits that one (B7)
  });

  it('closing the overlay without paying → checkout_close, no purchase', async () => {
    replies.push(json(201, { checkout_id: CK, transaction_id: 'txn_1' }));
    boot();
    clickBuy();
    await flushAll();
    paddle.emit('checkout.closed');
    window.IKF.flush();
    expect(purchases).toEqual([]);
    expect(event('checkout_close').props).toEqual({ plan: '1w' });
  });

  it('live env does not switch Paddle to sandbox', async () => {
    replies.push(json(201, { checkout_id: CK, transaction_id: 'txn_1' }));
    boot(IKF({ paddle: { env: 'live', clientToken: 'live_x' } }));
    clickBuy();
    await flushAll();
    expect(paddle.env).toBeNull();
    expect(paddle.init.token).toBe('live_x');
  });

  it.each([
    ['without __IKF.paddle', { paddle: undefined }],
    ['without a Turnstile sitekey', { turnstile: undefined }],
    ['in preview', { preview: true }],
  ])('does nothing %s (and leaves checkoutUrl alone)', async (_n, extra) => {
    boot(IKF(extra));
    clickBuy();
    await flushAll();
    expect(fetches).toEqual([]);
    expect(loads).toEqual([]);
    expect(window.IkFunnel.config.checkoutUrl['1w']).toContain('pay.example');
  });

  it('blocks navigation to checkoutUrl (object or string), also when IkFunnel appears later', async () => {
    boot();
    expect(window.IkFunnel.config.checkoutUrl).toEqual({ '1w': '', addon: '' });
    window.IkFunnel = { config: { checkoutUrl: 'https://pay.example/?email=x%40y.z' } };
    document.dispatchEvent(new Event('DOMContentLoaded'));
    expect(window.IkFunnel.config.checkoutUrl).toBe('');
    window.IkFunnel.config.checkoutUrl = 'https://again.example/';
    window.dispatchEvent(new CustomEvent('ikfunnel:screen_view', { detail: { index: 3 } }));
    expect(window.IkFunnel.config.checkoutUrl).toBe('');
  });

  it('email goes only in the /v1/checkout body', async () => {
    replies.push(json(201, { checkout_id: CK, transaction_id: 'txn_1' }));
    boot();
    window.dispatchEvent(new CustomEvent('ikfunnel:checkout_click', { detail: { plan: '1w', url: `https://pay.example/?email=${encodeURIComponent(EMAIL)}`, email: EMAIL } }));
    await flushAll();
    paddle.emit('checkout.completed');
    window.IKF.flush();
    expect(JSON.stringify(posted)).not.toContain('buyer.person');
    expect(fetches[0].url).not.toContain('buyer');
    expect(fetches[0].body.email).toBe(EMAIL);
    expect(window.location.href).not.toContain('buyer');
  });

  it('no checkoutEmail(), or a non-string → no email field', async () => {
    replies.push(json(201, { checkout_id: CK, transaction_id: 'txn_1' }));
    window.IkFunnel.checkoutEmail = () => ({ email: EMAIL });
    boot();
    clickBuy();
    await flushAll();
    expect('email' in fetches[0].body).toBe(false);
  });

  it('removes the demo checkout sheet when Paddle opens', async () => {
    replies.push(json(201, { checkout_id: CK, transaction_id: 'txn_1' }));
    boot();
    clickBuy();
    expect(document.getElementById('demock')).not.toBeNull();
    await flushAll();
    expect(document.getElementById('demock')).toBeNull();
  });

  it('Turnstile fails twice → checkout_error turnstile_failed, a retry notice, no POST, no demo sheet', async () => {
    turnstileReplies.push('fail', 'fail');
    boot();
    clickBuy();
    await flushAll();
    window.IKF.flush();
    expect(fetches).toEqual([]);
    expect(event('checkout_error').props).toEqual({ reason: 'turnstile_failed', plan: '1w' });
    expect(notice().textContent).toContain("We couldn't verify you. Try again.");
    expect(document.getElementById('demock')).toBeNull();
    replies.push(json(201, { checkout_id: CK, transaction_id: 'txn_1' }));
    notice().querySelector('button').click();
    await flushAll();
    expect(paddle.opened).toHaveLength(1);
    expect(document.getElementById('ikf-pay')).toBeNull();
  });

  it('Turnstile fails once → retried, checkout continues', async () => {
    turnstileReplies.push('fail');
    replies.push(json(201, { checkout_id: CK, transaction_id: 'txn_1' }));
    boot();
    clickBuy();
    await flushAll();
    expect(paddle.opened).toHaveLength(1);
  });

  it('503 or network error → one retry after 1s with a fresh Turnstile token', async () => {
    replies.push(json(503, { error: 'paddle_unavailable' }), json(201, { checkout_id: CK, transaction_id: 'txn_1' }));
    boot();
    clickBuy();
    await flushAll();
    expect(waits).toEqual([1000]);
    expect(fetches.map((f) => f.body.turnstile_token)).toEqual(['tok0', 'tok1']);
    expect(paddle.opened).toHaveLength(1);
  });

  it('still failing after the retry → checkout_error with the reason and a retry notice', async () => {
    replies.push(new TypeError('offline'), json(503, { error: 'paddle_unavailable' }));
    boot();
    clickBuy();
    await flushAll();
    window.IKF.flush();
    expect(event('checkout_error').props).toEqual({ reason: 'paddle_unavailable', plan: '1w' });
    expect(notice().textContent).toContain('Checkout is unavailable right now.');
  });

  it('403 turnstile_failed from core → verify notice; 422 plan_not_mapped → checkout_error only', async () => {
    replies.push(json(403, { error: 'turnstile_failed' }));
    boot();
    clickBuy();
    await flushAll();
    expect(notice().textContent).toContain("We couldn't verify you.");
    document.getElementById('ikf-pay').remove();
    replies.push(json(422, { error: 'plan_not_mapped' }));
    clickBuy('m12');
    await flushAll();
    window.IKF.flush();
    expect(posted.filter((e) => e.name === 'checkout_error').map((e) => e.props.reason)).toEqual(['turnstile_failed', 'plan_not_mapped']);
    expect(document.getElementById('ikf-pay')).toBeNull();
    expect(fetches).toHaveLength(2); // 4xx is not retried
  });

  it('Paddle.js blocked inside the Facebook app → "Open in browser" to /_ikf/pay with ret carrying ikf_paid', async () => {
    Object.defineProperty(window.navigator, 'userAgent', { configurable: true, get: () => 'Mozilla/5.0 (iPhone) [FBAN/FBIOS;FBAV/450.0]' });
    loadFails.push(PADDLE_JS);
    replies.push(json(201, { checkout_id: CK, transaction_id: 'txn_01aaaaaaaaaaaaaaaaaaaaaaaa' }));
    boot();
    clickBuy();
    await flushAll();
    window.IKF.flush();
    expect(event('checkout_error').props).toEqual({ reason: 'paddle_load_failed', plan: '1w' });
    const a = notice().querySelector('a');
    expect(a.textContent).toBe('Open in browser');
    const href = new URL(a.getAttribute('href'), 'https://try.x.com');
    expect(href.pathname).toBe('/_ikf/pay');
    expect(href.searchParams.get('txn')).toBe('txn_01aaaaaaaaaaaaaaaaaaaaaaaa');
    const ret = new URL(href.searchParams.get('ret'));
    expect(ret.host).toBe('try.x.com');
    expect(ret.searchParams.get('ikf_paid')).toBe(CK);
    expect(ret.searchParams.get('utm_source')).toBe('meta');
  });

  it('checkout.error in a TikTok webview → "Open in browser"; in a normal browser → "Try again"', async () => {
    Object.defineProperty(window.navigator, 'userAgent', { configurable: true, get: () => 'Mozilla/5.0 (Linux; Android 14) musical_ly_2023' });
    replies.push(json(201, { checkout_id: CK, transaction_id: 'txn_1' }));
    boot();
    clickBuy();
    await flushAll();
    paddle.emit('checkout.error');
    expect(notice().querySelector('a').textContent).toBe('Open in browser');
    Object.defineProperty(window.navigator, 'userAgent', { configurable: true, get: () => UA });
    paddle.emit('checkout.error');
    expect(notice().querySelector('button').textContent).toBe('Try again');
  });

  it('a second click while one checkout is starting is ignored', async () => {
    replies.push(json(201, { checkout_id: CK, transaction_id: 'txn_1' }));
    boot();
    clickBuy();
    clickBuy();
    await flushAll();
    expect(fetches).toHaveLength(1);
  });

  it('never breaks the funnel: throwing fetch, completePurchase or checkoutEmail', async () => {
    window.IkFunnel.completePurchase = () => { throw new Error('funnel bug'); };
    window.IkFunnel.checkoutEmail = () => { throw new Error('funnel bug'); };
    replies.push(json(201, { checkout_id: CK, transaction_id: 'txn_1' }));
    boot();
    clickBuy();
    await flushAll();
    expect(() => paddle.emit('checkout.completed')).not.toThrow();
    window.IKF.flush();
    expect(names()).toContain('checkout_complete');
  });
});

describe('helpers', () => {
  it.each([
    ['Mozilla/5.0 (iPhone) [FBAN/FBIOS;FBAV/450.0]', true],
    ['Mozilla/5.0 Instagram 300.0', true],
    ['Mozilla/5.0 (Linux) BytedanceWebview/d8a21c6', true],
    ['Mozilla/5.0 (Macintosh) Safari/605.1.15', false],
    [undefined, false],
  ])('isInApp(%j) = %s', (ua, v) => expect(isInApp(ua)).toBe(v));

  const fakeDoc = () => {
    const tags = [];
    const doc = {
      tags,
      createElement: () => ({ remove() { tags.splice(tags.indexOf(this), 1); } }),
      head: { appendChild: (s) => tags.push(s) },
    };
    return doc;
  };

  it('scriptLoader appends one async script per src and resolves on load', async () => {
    const doc = fakeDoc();
    const load = scriptLoader(doc);
    const a = load('https://cdn.example/x.js');
    expect(load('https://cdn.example/x.js')).toBe(a);
    expect(doc.tags).toHaveLength(1);
    expect(doc.tags[0]).toMatchObject({ async: true, src: 'https://cdn.example/x.js' });
    doc.tags[0].onload();
    await expect(a).resolves.toBeUndefined();
  });

  it('scriptLoader forgets a failed src so it can be retried', async () => {
    const doc = fakeDoc();
    const load = scriptLoader(doc);
    const a = load('https://cdn.example/y.js');
    doc.tags[0].onerror();
    await expect(a).rejects.toThrow('load https://cdn.example/y.js');
    expect(load('https://cdn.example/y.js')).not.toBe(a);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run: `npm test -w @ikf/sdk`
Expected: FAIL — `checkout.test.js` không tìm thấy `../src/checkout.js`; 109 test cũ pass.

- [ ] **Step 3: Implement**

`packages/sdk/src/checkout.js`:

```js
export const PADDLE_JS = 'https://cdn.paddle.com/paddle/v2/paddle.js';
export const TURNSTILE_JS = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const INAPP_RE = /FBAN|FBAV|FB_IAB|FBIOS|Instagram|musical_ly|BytedanceWebview|TikTok|trill_/i;

export const isInApp = (ua) => INAPP_RE.test(ua || '');

// One <script> per src; resolves on load, rejects on error.
export function scriptLoader(doc) {
  const cache = {};
  return (src) => {
    if (!cache[src]) {
      cache[src] = new Promise((resolve, reject) => {
        const s = doc.createElement('script');
        s.async = true;
        s.src = src;
        s.onload = resolve;
        s.onerror = () => {
          delete cache[src];
          s.remove();
          reject(new Error('load ' + src));
        };
        (doc.head || doc.documentElement).appendChild(s);
      });
    }
    return cache[src];
  };
}

const NOTICE_CSS = ':host{all:initial}.n{margin:0 auto;max-width:560px;padding:14px 16px;background:#111;color:#fff;font:14px/1.4 system-ui,sans-serif;border-radius:12px 12px 0 0;display:flex;gap:12px;align-items:center;justify-content:space-between}a,button{font:inherit;border:0;border-radius:8px;padding:9px 16px;background:#fff;color:#111;font-weight:600;text-decoration:none}';

const fail = (reason, retry) => Object.assign(new Error(reason), { reason, retry: Boolean(retry) });

// Paddle checkout inside the funnel. Billing is on only with __IKF.paddle + turnstile + api, never in preview.
export function createCheckout(win, { cfg, sid, track, attribution, loadScript, fetch: doFetch, wait }) {
  const doc = win.document;
  const enabled = Boolean(cfg.paddle && cfg.paddle.clientToken && cfg.turnstile && cfg.api && !cfg.preview);
  const load = loadScript || scriptLoader(doc);
  const pause = wait || ((ms) => new Promise((r) => win.setTimeout(r, ms)));
  const http = doFetch || ((u, o) => win.fetch(u, o));
  let busy = false;
  let current = null;
  let paddleReady = null;

  function blockNav() {
    if (!enabled) return;
    try {
      const c = win.IkFunnel && win.IkFunnel.config;
      const u = c && c.checkoutUrl;
      if (u && typeof u === 'object') for (const k of Object.keys(u)) u[k] = '';
      else if (typeof u === 'string' && u) c.checkoutUrl = '';
    } catch {
      // read-only config: nothing to do
    }
  }

  function removeDemo() {
    try {
      const d = doc.getElementById('demock');
      if (d) d.remove();
    } catch {
      // ignore
    }
  }

  function notice(text, action) {
    try {
      const old = doc.getElementById('ikf-pay');
      if (old) old.remove();
      const host = doc.createElement('div');
      host.id = 'ikf-pay';
      host.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:2147483647';
      const root = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
      const act = !action ? '' : action.href ? '<a target="_blank" rel="noopener"></a>' : '<button></button>';
      root.innerHTML = `<style>${NOTICE_CSS}</style><div class="n" role="alert"><span></span>${act}</div>`;
      root.querySelector('span').textContent = text;
      const el = action && root.querySelector('a,button');
      if (el) {
        el.textContent = action.label;
        if (action.href) el.setAttribute('href', action.href);
        else el.addEventListener('click', () => { host.remove(); action.run(); });
      }
      (doc.body || doc.documentElement).appendChild(host);
    } catch {
      // no notice: the funnel still works
    }
  }

  function email() {
    try {
      const f = win.IkFunnel && win.IkFunnel.checkoutEmail;
      const e = typeof f === 'function' ? f() : null;
      return typeof e === 'string' && e ? e : null;
    } catch {
      return null;
    }
  }

  function complete(plan, checkoutId) {
    track('checkout_complete', { plan, checkout_id: checkoutId });
    try {
      if (win.IkFunnel && typeof win.IkFunnel.completePurchase === 'function') win.IkFunnel.completePurchase(plan);
    } catch {
      // the funnel's own handler failed; the purchase is still recorded server-side
    }
  }

  async function turnstileToken() {
    await load(TURNSTILE_JS);
    return new Promise((resolve, reject) => {
      const el = doc.createElement('div');
      el.style.cssText = 'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:2147483647';
      (doc.body || doc.documentElement).appendChild(el);
      let id;
      const done = (fn, v) => {
        try {
          win.turnstile.remove(id);
        } catch {
          // already gone
        }
        el.remove();
        fn(v);
      };
      id = win.turnstile.render(el, {
        sitekey: cfg.turnstile,
        appearance: 'interaction-only',
        action: 'checkout',
        callback: (t) => done(resolve, t),
        'error-callback': () => done(reject, fail('turnstile_failed')),
        'timeout-callback': () => done(reject, fail('turnstile_failed')),
      });
    });
  }

  async function post(plan, token) {
    const e = email();
    let res = null;
    try {
      res = await http(`${cfg.api}/v1/checkout`, {
        method: 'POST',
        credentials: 'omit',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ funnel: cfg.funnel, v: cfg.v, plan, sid, ...(e && { email: e }), attribution: attribution(), turnstile_token: token }),
      });
    } catch {
      throw fail('network', true);
    }
    if (res.ok) return res.json();
    let code = `http_${res.status}`;
    try {
      code = (await res.json()).error || code;
    } catch {
      // keep http_<status>
    }
    throw fail(code, res.status >= 500);
  }

  // Turnstile tokens are single use: a retry after a 503 gets a fresh one.
  async function create(plan) {
    for (let attempt = 0; ; attempt += 1) {
      let token;
      try {
        token = await turnstileToken();
      } catch {
        try {
          token = await turnstileToken();
        } catch {
          throw fail('turnstile_failed');
        }
      }
      try {
        return await post(plan, token);
      } catch (err) {
        if (attempt === 0 && err.retry) {
          await pause(1000);
          continue;
        }
        throw err;
      }
    }
  }

  function payUrl(cur) {
    const ret = new URL(win.location.href);
    ret.searchParams.set('ikf_paid', cur.checkoutId);
    return `/_ikf/pay?txn=${encodeURIComponent(cur.transactionId)}&ret=${encodeURIComponent(ret.href)}`;
  }

  function fallback(cur, reason) {
    track('checkout_error', { reason, plan: cur.plan });
    if (isInApp(win.navigator && win.navigator.userAgent)) {
      notice('Payment cannot open in this app.', { label: 'Open in browser', href: payUrl(cur) });
    } else {
      notice('Payment could not load.', { label: 'Try again', run: () => start(cur.plan) });
    }
  }

  function onPaddleEvent(e) {
    const cur = current;
    if (!cur || !e) return;
    try {
      if (e.name === 'checkout.completed' && !cur.done) {
        cur.done = true;
        complete(cur.plan, cur.checkoutId);
        win.Paddle.Checkout.close();
      } else if (e.name === 'checkout.closed') {
        if (!cur.done) track('checkout_close', { plan: cur.plan });
        current = null;
      } else if (e.name === 'checkout.error') {
        fallback(cur, 'paddle_error');
      }
    } catch {
      // never break the funnel
    }
  }

  function paddle() {
    if (!paddleReady) {
      paddleReady = load(PADDLE_JS).then(() => {
        const P = win.Paddle;
        if (cfg.paddle.env === 'sandbox') P.Environment.set('sandbox');
        P.Initialize({ token: cfg.paddle.clientToken, eventCallback: onPaddleEvent });
        return P;
      });
      paddleReady.catch(() => {
        paddleReady = null;
      });
    }
    return paddleReady;
  }

  async function start(plan) {
    if (!enabled || busy || typeof plan !== 'string' || !plan) return;
    busy = true;
    blockNav();
    try {
      let created;
      try {
        created = await create(plan);
      } catch (err) {
        const reason = err.reason || 'error';
        track('checkout_error', { reason, plan });
        if (reason === 'turnstile_failed') notice("We couldn't verify you. Try again.", { label: 'Try again', run: () => start(plan) });
        else if (reason !== 'plan_not_mapped') notice('Checkout is unavailable right now.', { label: 'Try again', run: () => start(plan) });
        return;
      }
      current = { plan, checkoutId: created.checkout_id, transactionId: created.transaction_id, done: false };
      let P;
      try {
        P = await paddle();
      } catch {
        fallback(current, 'paddle_load_failed');
        return;
      }
      removeDemo();
      P.Checkout.open({ transactionId: current.transactionId, settings: { displayMode: 'overlay', variant: 'one-page' } });
    } catch {
      // never break the funnel
    } finally {
      removeDemo(); // the funnel's "Demo checkout" sheet has a fake Pay button
      busy = false;
    }
  }

  if (enabled) {
    blockNav();
    doc.addEventListener('DOMContentLoaded', blockNav);
  }

  return { enabled, start, blockNav, complete, notice };
}
```

`packages/sdk/src/index.js`:

1. Thêm import sau `import { installCapture } from './capture.js';`:
```js
import { createCheckout } from './checkout.js';
```
2. Thay `safeTrack` và thêm `checkout` ngay trước `installCapture(win, safeTrack, now);`:
```js
  const safeTrack = (name, detail) => {
    try {
      checkout.blockNav();
      track(name, detail);
      if (name === 'checkout_click' && detail && typeof detail.plan === 'string') checkout.start(detail.plan);
    } catch {
      // never break the funnel
    }
  };

  const checkout = createCheckout(win, {
    cfg,
    sid,
    track: (name, detail) => {
      try {
        track(name, detail);
      } catch {
        // never break the funnel
      }
    },
    attribution: () => ({ ...attr, fbc: readCookie(doc, '_fbc'), fbp: readCookie(doc, '_fbp') }),
    loadScript: deps.loadScript,
    fetch: deps.fetch,
    wait: deps.wait,
  });
```

- [ ] **Step 4: Chạy test, xác nhận PASS + kích thước**

Run:
```bash
npm test -w @ikf/sdk
node packages/sdk/scripts/build.mjs
```
Expected: `Test Files  8 passed (8)`, `Tests  136 passed (136)` (gồm `build.test.js` ≤ 8192 byte); build in `ikf sdk <hash>: 7516 bytes gzip` (±vài byte theo esbuild).

- [ ] **Step 5: Commit**

```bash
git add packages/sdk
git commit -m "feat(sdk): Paddle checkout from checkout_click (Turnstile, /v1/checkout, Paddle.js), block checkoutUrl"
```

---

### Task 11: Xác nhận `ikf_paid` với core, xóa `?paid=`; edge-router `__IKF.paddle/turnstile/api` + trang `/_ikf/pay`

**Files:**
- Create: `workers/edge-router/src/pay.js`
- Modify: `packages/sdk/src/checkout.js`, `packages/sdk/src/index.js`, `workers/edge-router/src/inject.js`, `workers/edge-router/src/index.js`, `workers/edge-router/scripts/render-config.mjs`
- Test: `packages/sdk/test/paid.test.js`, `workers/edge-router/test/pay.test.js` (mới); thêm `describe` vào cuối `workers/edge-router/test/inject.test.js`

**Interfaces:**
- Consumes: `GET /v1/checkout/:id` (Task 5); `createCheckout`, `complete`, `notice` (Task 10).
- Produces:
  - SDK: `PAID_POLL_MS = 2000`, `PAID_POLL_TRIES = 11` (t = 0…20s); `createCheckout(...).confirmation: Promise<boolean> | null`; `window.IKF.paid() → Promise<boolean> | null`. Có billing: xóa `paid` và `ikf_paid` khỏi URL bằng `history.replaceState` trước script funnel (B9); `ikf_paid` hợp lệ (ULID) → poll; `completed` → `complete(plan, checkout_id)` sau `DOMContentLoaded`; hết 20s → notice `Confirming your payment, please wait...`.
  - Worker env (Task 12 đặt): vars `PADDLE_ENV` (`sandbox`|`live`), `TURNSTILE_SITEKEY`, `API_ORIGIN` (`https://api.<zone>`), secret `PADDLE_CLIENT_TOKEN`.
  - `billingConfig(env) → {paddle: {env, clientToken}, turnstile, api} | null` (đủ cả 4 mới bật); `safeReturn(ret, url) → string|null`; `payResponse(request, url, env)`.
  - `injectIkf(html, target, {sdkSrc, billing?})`: `__IKF` thêm `paddle`, `turnstile`, `api` sau các key cũ, không bao giờ ở preview.
  - `GET /_ikf/pay?txn=txn_<26>&ret=<URL tuyệt đối cùng host + protocol>` → `200` HTML (`no-store`, `noindex`, `referrer-policy: no-referrer`) nạp `PADDLE_JS`, `Checkout.open({transactionId: txn})`, `checkout.completed` → `location.replace(ret)`; `400` nếu `txn`/`ret` sai; `404` khi billing chưa cấu hình; `405` method khác.
  - `render-config.mjs`: thêm vars `PADDLE_ENV`, `TURNSTILE_SITEKEY`, `API_ORIGIN` (rỗng = tắt); `PADDLE_ENV` khác `sandbox|live` hoặc `WORKER_ENV=prod` với `sandbox` → exit 1.

- [ ] **Step 1: Viết test fail**

`packages/sdk/test/paid.test.js`:

```js
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { createSdk } from '../src/index.js';
import { PAID_POLL_MS } from '../src/checkout.js';

const ORIGINAL_DISPATCH = window.dispatchEvent;
const API = 'https://api.ikf.example';
const CK = '01JAXKZ8TQ4M7RP2W9HC3VNBD5';
let posted;
let fetches;
let replies;
let waits;
let purchases;

const json = (status, body) => new Response(JSON.stringify(body), { status });
const IKF = (extra = {}) => ({
  funnel: 'aivideo', v: 3, rev: 7, country: 'US', pixel: null,
  paddle: { env: 'sandbox', clientToken: 'test_client_token' }, turnstile: '0x4AAAAAAA', api: API, ...extra,
});

function boot(url, ikf = IKF()) {
  window.happyDOM.setURL(url);
  window.__IKF = ikf;
  return createSdk(window, {
    now: () => Date.UTC(2026, 9, 9, 10, 0, 0),
    transport: (u, body) => {
      posted.push(...JSON.parse(body).events);
      return 'ok';
    },
    setTimer: () => 1,
    clearTimer: () => {},
    fetch: async (u, init) => {
      fetches.push({ url: u, init });
      const r = replies.shift() ?? json(200, { checkout_id: CK, status: 'created', plan: 'addon' });
      if (r instanceof Error) throw r;
      return r;
    },
    wait: async (ms) => waits.push(ms),
    loadScript: async () => {},
  });
}

function clearCookies() {
  for (const c of document.cookie.split(';')) {
    const n = c.split('=')[0].trim();
    if (n) document.cookie = `${n}=; Path=/; Max-Age=0`;
  }
}
afterAll(clearCookies);

beforeEach(() => {
  clearCookies();
  window.dispatchEvent = ORIGINAL_DISPATCH;
  for (const k of ['IKF', '__IKF', 'IkFunnel', 'dataLayer', 'ikfEvents']) delete window[k];
  window.sessionStorage.clear();
  window.localStorage.clear();
  document.body.innerHTML = '';
  posted = [];
  fetches = [];
  replies = [];
  waits = [];
  purchases = [];
  window.IkFunnel = { config: { checkoutUrl: {} }, completePurchase: (plan) => purchases.push(plan) };
});

describe('return from /_ikf/pay (ikf_paid) and ?paid=', () => {
  it('strips ?paid= before the funnel can read it, keeping the rest of the URL', () => {
    boot('https://try.x.com/promo?paid=1w&utm_source=meta#s3');
    expect(window.location.search).toBe('?utm_source=meta');
    expect(window.location.hash).toBe('#s3');
    expect(fetches).toEqual([]);
    expect(purchases).toEqual([]);
  });

  it('ikf_paid: completePurchase only after core says completed', async () => {
    replies.push(json(200, { checkout_id: CK, status: 'created', plan: 'addon' }), json(503, {}), json(200, { checkout_id: CK, status: 'completed', plan: 'addon' }));
    boot(`https://try.x.com/promo?utm_source=meta&ikf_paid=${CK}`);
    expect(window.location.search).toBe('?utm_source=meta');
    expect(await window.IKF.paid()).toBe(true);
    expect(fetches.map((f) => f.url)).toEqual(Array(3).fill(`${API}/v1/checkout/${CK}`));
    expect(fetches[0].init).toEqual({ credentials: 'omit' });
    expect(waits).toEqual([PAID_POLL_MS, PAID_POLL_MS]);
    expect(purchases).toEqual(['addon']);
    window.IKF.flush();
    expect(posted.find((e) => e.name === 'checkout_complete').props).toEqual({ plan: 'addon', checkout_id: CK });
  });

  it('a forged ikf_paid that never completes never unlocks: 20s of polling, then a "please wait" notice', async () => {
    replies.push(new TypeError('offline'), json(404, { error: 'checkout_not_found' }));
    boot(`https://try.x.com/promo?ikf_paid=${CK}`);
    expect(await window.IKF.paid()).toBe(false);
    expect(fetches).toHaveLength(11);
    expect(waits.reduce((a, b) => a + b, 0)).toBe(20000);
    expect(purchases).toEqual([]);
    expect(document.getElementById('ikf-pay').shadowRoot.textContent).toContain('Confirming your payment, please wait...');
  });

  it('a malformed ikf_paid is removed and ignored', () => {
    boot('https://try.x.com/promo?ikf_paid=../../x');
    expect(window.location.search).toBe('');
    expect(window.IKF.paid()).toBeNull();
    expect(fetches).toEqual([]);
  });

  it('waits for the funnel script (DOMContentLoaded) before calling completePurchase', async () => {
    replies.push(json(200, { checkout_id: CK, status: 'completed', plan: '1w' }));
    Object.defineProperty(document, 'readyState', { configurable: true, get: () => 'loading' });
    try {
      boot(`https://try.x.com/promo?ikf_paid=${CK}`);
      await window.IKF.paid();
      expect(purchases).toEqual([]);
      document.dispatchEvent(new Event('DOMContentLoaded'));
      expect(purchases).toEqual(['1w']);
    } finally {
      delete document.readyState;
    }
  });

  it('without Paddle (or in preview) the URL is left to the funnel, as before', () => {
    boot('https://try.x.com/promo?paid=1w', IKF({ paddle: undefined }));
    expect(window.location.search).toBe('?paid=1w');
    delete window.IKF;
    boot(`https://try.x.com/promo?ikf_paid=${CK}`, IKF({ preview: true }));
    expect(window.location.search).toBe(`?ikf_paid=${CK}`);
    expect(fetches).toEqual([]);
  });
});
```

`workers/edge-router/test/pay.test.js`:

```js
import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { describe, it, expect, beforeEach } from 'vitest';
import worker from '../src/index.js';
import { billingConfig, safeReturn, PADDLE_JS } from '../src/pay.js';
import { resetRouteMemory } from '../src/routes.js';

const HOST = 'try.aivideo.app';
const TXN = 'txn_01aaaaaaaaaaaaaaaaaaaaaaaa';
const BILLING = { PADDLE_ENV: 'sandbox', PADDLE_CLIENT_TOKEN: 'test_client_token', TURNSTILE_SITEKEY: '0x4AAAAAAA', API_ORIGIN: 'https://api.ikf-staging.example' };
const withBilling = { ...env, ...BILLING };

async function call(url, init = {}, e = withBilling) {
  const ctx = createExecutionContext();
  const res = await worker.fetch(new Request(url, init), e, ctx);
  await waitOnExecutionContext(ctx);
  return res;
}
const ret = (u = `https://${HOST}/promo?utm_source=meta&ikf_paid=01JAXKZ8TQ4M7RP2W9HC3VNBD5`) => encodeURIComponent(u);

beforeEach(async () => {
  resetRouteMemory();
  await env.ROUTES.put(`route:${HOST}`, JSON.stringify({ rev: 2, routes: [{ prefix: '/', bundle: 'b/x.html', funnel: 'aivideo', v: 1, pixel: null }] }));
  await env.BUNDLES.put('b/x.html', '<head></head>');
});

describe('GET /_ikf/pay', () => {
  it('serves a minimal page that opens Paddle for this transaction and returns to ret when paid', async () => {
    const res = await call(`https://${HOST}/_ikf/pay?txn=${TXN}&ret=${ret()}`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('text/html; charset=utf-8');
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(res.headers.get('x-robots-tag')).toBe('noindex');
    const html = await res.text();
    expect(html).toContain(`<script src="${PADDLE_JS}"></script>`);
    expect(html).toContain("Paddle.Environment.set('sandbox')");
    const cfg = JSON.parse(/\}\)\((\{.*\})\)<\/script>/.exec(html)[1]);
    expect(cfg).toEqual({ env: 'sandbox', token: 'test_client_token', txn: TXN, ret: `https://${HOST}/promo?utm_source=meta&ikf_paid=01JAXKZ8TQ4M7RP2W9HC3VNBD5` });
    expect(html).toContain("e.name==='checkout.completed')location.replace(c.ret)");
  });

  it.each([
    ['another host', ret('https://evil.example/promo')],
    ['a sibling subdomain', ret(`https://x.${HOST}/`)],
    ['http instead of https', ret(`http://${HOST}/`)],
    ['javascript:', ret('javascript:alert(1)')],
    ['a relative path', ret('/promo')],
    ['nothing', ''],
  ])('400 when ret is %s', async (_n, r) => {
    expect((await call(`https://${HOST}/_ikf/pay?txn=${TXN}&ret=${r}`)).status).toBe(400);
  });

  it.each(['', 'txn_1', 'pri_01aaaaaaaaaaaaaaaaaaaaaaaa', `${TXN}"><script>`])('400 for txn %j', async (txn) => {
    expect((await call(`https://${HOST}/_ikf/pay?txn=${encodeURIComponent(txn)}&ret=${ret()}`)).status).toBe(400);
  });

  it('cannot break out of the inline script', async () => {
    const html = await (await call(`https://${HOST}/_ikf/pay?txn=${TXN}&ret=${ret(`https://${HOST}/p?x=</script><b>`)}`)).text();
    expect(html).not.toContain('</script><b>');
  });

  it('404 when billing is not configured; 405 for POST', async () => {
    expect((await call(`https://${HOST}/_ikf/pay?txn=${TXN}&ret=${ret()}`, {}, env)).status).toBe(404);
    expect((await call(`https://${HOST}/_ikf/pay?txn=${TXN}&ret=${ret()}`, { method: 'POST' })).status).toBe(405);
  });
});

describe('__IKF billing keys', () => {
  const ikf = async (url, e) => JSON.parse(/window\.__IKF=(\{.*?\})<\/script>/.exec(await (await call(url, {}, e)).text())[1]);

  it('live funnels get paddle, turnstile and api', async () => {
    expect(await ikf(`https://${HOST}/`, withBilling)).toEqual({
      funnel: 'aivideo', v: 1, rev: 2, country: null, pixel: null,
      paddle: { env: 'sandbox', clientToken: 'test_client_token' }, turnstile: '0x4AAAAAAA', api: 'https://api.ikf-staging.example',
    });
  });

  it('previews never do', async () => {
    await env.BUNDLES.put('bundles/aivideo/v1/index.html', '<head></head>');
    const doc = await ikf(`https://${env.PREVIEW_HOST}/aivideo/v1/`, withBilling);
    expect(doc).toEqual({ funnel: 'aivideo', v: 1, rev: 0, country: null, pixel: null, preview: true });
  });

  it.each([
    ['PADDLE_ENV', 'prod'],
    ['PADDLE_CLIENT_TOKEN', ''],
    ['TURNSTILE_SITEKEY', undefined],
    ['API_ORIGIN', 'http://api.x'],
  ])('incomplete config (%s=%j) adds none of them', async (k, v) => {
    const doc = await ikf(`https://${HOST}/`, { ...withBilling, [k]: v });
    expect(Object.keys(doc)).toEqual(['funnel', 'v', 'rev', 'country', 'pixel']);
    expect(billingConfig({ ...BILLING, [k]: v })).toBeNull();
  });

  it('safeReturn keeps same-host absolute URLs only', () => {
    const u = new URL(`https://${HOST}/_ikf/pay`);
    expect(safeReturn(`https://${HOST}/a?b=1#c`, u)).toBe(`https://${HOST}/a?b=1#c`);
    expect(safeReturn(`https://${HOST}:8443/a`, u)).toBeNull();
  });
});
```

`workers/edge-router/test/inject.test.js`: thêm vào **cuối file**:

```js
describe('injectIkf billing', () => {
  const B = { paddle: { env: 'live', clientToken: 'live_x' }, turnstile: '0x4A', api: 'https://api.x' };

  it('adds paddle, turnstile and api after the existing keys', () => {
    expect(injectIkf('', T, { sdkSrc: null, billing: B })).toBe(
      '<script>window.__IKF={"funnel":"aivideo","v":3,"rev":7,"country":"VN","pixel":"123456789012345","paddle":{"env":"live","clientToken":"live_x"},"turnstile":"0x4A","api":"https://api.x"}</script>',
    );
  });

  it('never on previews', () => {
    expect(injectIkf('', { ...T, preview: true }, { sdkSrc: null, billing: B })).not.toContain('paddle');
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run:
```bash
npm test -w @ikf/sdk
npm test -w @ikf/edge-router
```
Expected: sdk FAIL — `paid.test.js`: URL còn `paid=`, `window.IKF.paid` không phải hàm (136 test cũ pass); edge-router FAIL — `pay.test.js` không tìm thấy `../src/pay.js`, 2 test `injectIkf billing` fail (77 test cũ pass).

- [ ] **Step 3: Implement SDK**

`packages/sdk/src/checkout.js`:

1. Ngay trước dòng `const fail = (reason, retry) =>` thêm:
```js
const ULID_RE = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
export const PAID_POLL_MS = 2000;
export const PAID_POLL_TRIES = 11; // t = 0, 2, …, 20 s

```
2. Thay đoạn cuối của `createCheckout`:
```js
  if (enabled) {
    blockNav();
    doc.addEventListener('DOMContentLoaded', blockNav);
  }

  return { enabled, start, blockNav, complete, notice };
```
bằng
```js
  // B9: funnels unlock on ?paid= by themselves; with Paddle on, the URL is never trusted.
  // Runs before any funnel script (the SDK tag follows __IKF). Returns the ikf_paid checkout id, if valid.
  function takePaidParams() {
    try {
      const url = new URL(win.location.href);
      const ck = url.searchParams.get('ikf_paid');
      if (!url.searchParams.has('paid') && ck === null) return null;
      url.searchParams.delete('paid');
      url.searchParams.delete('ikf_paid');
      win.history.replaceState(win.history.state, '', url.pathname + url.search + url.hash);
      return ck && ULID_RE.test(ck) ? ck : null;
    } catch {
      return null;
    }
  }

  const whenReady = (fn) => {
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  };

  // Back from /_ikf/pay: unlock only once core says the checkout is completed (webhook processed).
  async function confirm(ck) {
    for (let i = 0; i < PAID_POLL_TRIES; i += 1) {
      if (i) await pause(PAID_POLL_MS);
      try {
        const res = await http(`${cfg.api}/v1/checkout/${ck}`, { credentials: 'omit' });
        const body = res.ok ? await res.json() : null;
        if (body && body.status === 'completed') {
          whenReady(() => complete(body.plan, ck));
          return true;
        }
      } catch {
        // keep polling
      }
    }
    whenReady(() => notice('Confirming your payment, please wait...'));
    return false;
  }

  let confirmation = null;
  if (enabled) {
    blockNav();
    doc.addEventListener('DOMContentLoaded', blockNav);
    const ck = takePaidParams();
    if (ck) confirmation = confirm(ck);
  }

  return { enabled, start, blockNav, complete, notice, confirmation };
```

`packages/sdk/src/index.js`: trong object `api`, sau `flush: () => queue.flush(),` thêm:
```js
    paid: () => checkout.confirmation,
```

- [ ] **Step 4: Implement edge-router**

`workers/edge-router/src/pay.js`:

```js
import { errorResponse } from './responses.js';

const TXN_RE = /^txn_[a-z0-9]{26}$/;
export const PADDLE_JS = 'https://cdn.paddle.com/paddle/v2/paddle.js';

// __IKF billing keys, only when every value is configured (spec §1): {paddle: {env, clientToken}, turnstile, api}.
export function billingConfig(env) {
  const ok =
    (env.PADDLE_ENV === 'sandbox' || env.PADDLE_ENV === 'live') &&
    env.PADDLE_CLIENT_TOKEN && env.TURNSTILE_SITEKEY && /^https:\/\/[^/]+$/.test(env.API_ORIGIN || '');
  if (!ok) return null;
  return { paddle: { env: env.PADDLE_ENV, clientToken: env.PADDLE_CLIENT_TOKEN }, turnstile: env.TURNSTILE_SITEKEY, api: env.API_ORIGIN };
}

// `ret` must be an absolute URL on the host serving this page, so the page cannot redirect elsewhere.
export function safeReturn(ret, url) {
  try {
    const r = new URL(ret);
    return r.protocol === url.protocol && r.host === url.host ? r.href : null;
  } catch {
    return null;
  }
}

const page = (cfg) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Secure checkout</title></head><body style="font:16px system-ui,sans-serif;text-align:center;padding:40px 16px"><p id="m">Loading secure checkout...</p><script src="${PADDLE_JS}"></script><script>(function(c){try{if(c.env==='sandbox')Paddle.Environment.set('sandbox');Paddle.Initialize({token:c.token,eventCallback:function(e){if(e&&e.name==='checkout.completed')location.replace(c.ret)}});Paddle.Checkout.open({transactionId:c.txn,settings:{displayMode:'overlay',variant:'one-page'}})}catch(e){document.getElementById('m').textContent='Checkout could not load. Please try again.'}})(${JSON.stringify(cfg).replace(/</g, '\\u003c')})</script></body></html>`;

// GET /_ikf/pay?txn=<paddle transaction>&ret=<funnel URL with ikf_paid>: the webview fallback (spec §3.6).
export function payResponse(request, url, env) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return errorResponse(request, 405, { allow: 'GET, HEAD' });
  const billing = billingConfig(env);
  if (!billing) return errorResponse(request, 404);
  const txn = url.searchParams.get('txn') || '';
  const ret = safeReturn(url.searchParams.get('ret') || '', url);
  if (!TXN_RE.test(txn) || !ret) return new Response('Bad request', { status: 400, headers: { 'content-type': 'text/plain', 'cache-control': 'no-store' } });
  const html = page({ env: billing.paddle.env, token: billing.paddle.clientToken, txn, ret });
  return new Response(request.method === 'HEAD' ? null : html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex',
      'referrer-policy': 'no-referrer',
      'x-content-type-options': 'nosniff',
    },
  });
}
```

`workers/edge-router/src/inject.js`: thay

```js
// sdkSrc null (SDK_ENABLED kill switch off) injects __IKF only.
export function injectIkf(html, { funnel, v, rev, country = null, pixel = null, preview }, { sdkSrc }) {
  const data = JSON.stringify({ funnel, v, rev, country, pixel, ...(preview && { preview: true }) }).replace(/</g, '\\u003c');
```
bằng
```js
// sdkSrc null (SDK_ENABLED kill switch off) injects __IKF only. billing ({paddle, turnstile, api}) is
// added for live funnels only, never on preview.
export function injectIkf(html, { funnel, v, rev, country = null, pixel = null, preview }, { sdkSrc, billing = null }) {
  const data = JSON.stringify({
    funnel, v, rev, country, pixel, ...(preview && { preview: true }), ...(!preview && billing),
  }).replace(/</g, '\\u003c');
```

`workers/edge-router/src/index.js`:
1. Thêm import sau `import { injectIkf } from './inject.js';`:
```js
import { billingConfig, payResponse } from './pay.js';
```
2. Ngay trước `const reserved = url.pathname.toLowerCase();` thêm:
```js
    if (url.pathname === '/_ikf/pay') return payResponse(request, url, env);
```
3. Thay `{ sdkSrc: sdkEnabled ? SDK_PATH : null }` bằng `{ sdkSrc: sdkEnabled ? SDK_PATH : null, billing: billingConfig(env) }`.

`workers/edge-router/scripts/render-config.mjs`:
1. Ngay sau dòng `const SDK_ENABLED = …;` thêm:
```js
// Billing (__IKF.paddle/turnstile/api, /_ikf/pay): all three vars plus the PADDLE_CLIENT_TOKEN secret, or off.
const PADDLE_ENV = process.env.PADDLE_ENV || '';
if (PADDLE_ENV && !['sandbox', 'live'].includes(PADDLE_ENV)) {
  console.error('PADDLE_ENV must be sandbox or live');
  process.exit(1);
}
if (WORKER_ENV === 'prod' && PADDLE_ENV === 'sandbox') {
  console.error('prod must not use the Paddle sandbox');
  process.exit(1);
}
const billingVars = { PADDLE_ENV, TURNSTILE_SITEKEY: process.env.TURNSTILE_SITEKEY || '', API_ORIGIN: process.env.API_ORIGIN || '' };
```
2. Thay `vars: { ...base.vars, PREVIEW_HOST, SDK_ENABLED },` bằng `vars: { ...base.vars, PREVIEW_HOST, SDK_ENABLED, ...billingVars },`.

- [ ] **Step 5: Chạy test, xác nhận PASS**

Run:
```bash
npm test -w @ikf/sdk
npm test -w @ikf/edge-router
node packages/sdk/scripts/build.mjs
cd workers/edge-router
WORKER_ENV=staging KV_NAMESPACE_ID=ns R2_BUCKET=b PREVIEW_HOST=p PADDLE_ENV=sandbox TURNSTILE_SITEKEY=0x4A API_ORIGIN=https://api.x node scripts/render-config.mjs | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).vars))"
WORKER_ENV=prod KV_NAMESPACE_ID=ns R2_BUCKET=b PREVIEW_HOST=p PADDLE_ENV=sandbox node scripts/render-config.mjs; echo "exit $?"
cd ../..
```
Expected: sdk `Test Files  9 passed (9)`, `Tests  142 passed (142)`; edge-router `Test Files  6 passed (6)`, `Tests  99 passed (99)`; SDK `7791 bytes gzip` (≤ 8192); vars in ra `PREVIEW_HOST: 'p', SDK_ENABLED: 'false', PADDLE_ENV: 'sandbox', TURNSTILE_SITEKEY: '0x4A', API_ORIGIN: 'https://api.x'`; lệnh prod in `prod must not use the Paddle sandbox`, `exit 1`.

- [ ] **Step 6: Commit**

```bash
git add packages/sdk workers/edge-router
git commit -m "feat(billing): confirm ikf_paid with core, strip ?paid=, __IKF billing keys and /_ikf/pay fallback page"
```

---

### Task 12: Hạ tầng — secret `paddle-client-token`, rate limit `/v1/checkout`, Turnstile cho funnel host, `PADDLE_ENV` + alarm; CI; runbook

> **Điều chỉnh B19 (chốt 2026-10-09, sau khi viết plan): bắt buộc làm trong task này.**
> - `infra/modules/edge`: thêm `variable "ratelimit_full" { type = bool, default = true }`. Khi `false`, `cloudflare_ruleset.ratelimit` chỉ chứa rule `/v1/checkout` (period 60, 10 request), bỏ rule API và rule `/_ikf/c`.
> - `infra/stack/main.tf`: truyền `ratelimit_full = var.env == "prod"` vào `module "edge"`.
> - Test module `edge`: thêm run `ratelimit_full = false` → `length(cloudflare_ruleset.ratelimit.rules) == 1` và expression chứa `"/v1/checkout"`. Giữ các assert cũ cho `ratelimit_full = true` (thứ tự rule giữ nguyên với API là `rules[0]`).
> - Test stack: env `staging` → 1 rule; env `prod` → 3 rule.
> - Runbook: ghi rằng staging chỉ rate limit `/v1/checkout`; kiểm tra k6 giới hạn `/_ikf/c` của zone platform làm trên prod khi pilot.

**Files:**
- Modify: `infra/modules/edge/{main,variables,outputs}.tf`, `infra/modules/edge/tests/edge.tftest.hcl`, `infra/stack/{main,outputs}.tf`, `infra/stack/tests/stack.tftest.hcl`, `infra/envs/{staging,prod}/main.tf`
- Modify: `.github/workflows/{core-api,packages,edge-router}.yml`
- Create: `docs/runbooks/billing-paddle.md`

**Interfaces:**
- Consumes: env/secret names của Task 9 (`PADDLE_ENV`, `WEBHOOK_QUEUE_URL`, `ALARM_TOPIC_ARN`, `paddle-api-key`, `paddle-webhook-secret`, `turnstile-secret`) và Task 11 (`PADDLE_ENV`, `TURNSTILE_SITEKEY`, `API_ORIGIN`, secret Worker `PADDLE_CLIENT_TOKEN`).
- Produces:
  - Secret `ikf/<env>/paddle-client-token` (giá trị nhập tay theo runbook).
  - `local.paddle_env = var.env == "prod" ? "live" : "sandbox"` → ECS env `PADDLE_ENV`; output `paddle_env` (stack + envs).
  - ECS env `ALARM_TOPIC_ARN`; task policy statement `Alarms` (`sns:Publish` trên topic alarm).
  - Module edge: `rate_limited_paths` mặc định `["/v1/otp", "/v1/claim"]`; rule thứ 3 `/v1/checkout` `period = 60`, `requests_per_period = var.checkout_requests_per_minute` (10); biến `turnstile_extra_domains` (stack truyền `keys(var.funnel_domains)`); output `turnstile_domains`.
  - CI: core-api chạy test `@ikf/paddle`, `@ikf/event-schema`; packages chạy `@ikf/paddle`; edge-router render config với `vars.PADDLE_ENV`, `vars.TURNSTILE_SITEKEY`, `vars.API_ORIGIN`.

- [ ] **Step 1: Viết test Terraform fail**

`infra/modules/edge/tests/edge.tftest.hcl`: thay khối `run "sensitive_paths_are_rate_limited" { … }` bằng:

```hcl
run "sensitive_paths_are_rate_limited" {
  command = apply

  assert {
    condition     = alltrue([for p in ["/v1/otp", "/v1/claim"] : strcontains(cloudflare_ruleset.ratelimit.rules[0].expression, "\"${p}\"")])
    error_message = "OTP and claim must be rate limited."
  }
}

run "checkout_is_limited_to_10_per_minute_per_ip" {
  command = apply

  assert {
    condition = (
      cloudflare_ruleset.ratelimit.rules[2].expression == "(http.host eq \"api.ikf-staging.example\" and http.request.uri.path eq \"/v1/checkout\")" &&
      cloudflare_ruleset.ratelimit.rules[2].ratelimit.period == 60 &&
      cloudflare_ruleset.ratelimit.rules[2].ratelimit.requests_per_period == 10 &&
      contains(cloudflare_ruleset.ratelimit.rules[2].ratelimit.characteristics, "ip.src")
    )
    error_message = "/v1/checkout must be limited to 10 requests per 60 seconds per IP."
  }

  assert {
    condition     = !strcontains(cloudflare_ruleset.ratelimit.rules[0].expression, "/v1/checkout")
    error_message = "/v1/checkout must not also fall under the 5-per-10s API rule."
  }
}

run "paddle_webhook_is_never_rate_limited" {
  command = apply

  assert {
    condition     = alltrue([for r in cloudflare_ruleset.ratelimit.rules : !strcontains(r.expression, "/v1/paddle")])
    error_message = "Paddle retries webhooks; a rate limit would drop billing events."
  }
}

run "turnstile_covers_funnel_hosts" {
  command = apply

  variables {
    turnstile_extra_domains = ["try.aivideo.app"]
  }

  assert {
    condition     = cloudflare_turnstile_widget.this.domains == tolist(["ikf-staging.example", "try.aivideo.app"])
    error_message = "Turnstile must accept tokens from funnel hosts (checkout)."
  }
}

```

và trong `run "collector_is_rate_limited_per_ip"`, thay assert đầu:

```hcl
    condition     = length(cloudflare_ruleset.ratelimit.rules) == 2 && cloudflare_ruleset.ratelimit.rules[1].expression == "(http.request.uri.path eq \"/_ikf/c\")"
    error_message = "The ratelimit ruleset must keep the API rule first and add one rule for /_ikf/c."
```
bằng
```hcl
    condition     = length(cloudflare_ruleset.ratelimit.rules) == 3 && cloudflare_ruleset.ratelimit.rules[1].expression == "(http.request.uri.path eq \"/_ikf/c\")"
    error_message = "The ratelimit ruleset must keep the API rule first, /_ikf/c second and /v1/checkout third."
```

`infra/stack/tests/stack.tftest.hcl`: thêm vào **cuối file**:

```hcl

run "billing_wiring" {
  command = apply

  variables {
    funnel_domains = { "try.aivideo.app" = { zone_id = "1a2b3c4d5e6f708192a3b4c5d6e7f801" } }
  }

  assert {
    condition     = alltrue([for n in ["paddle-api-key", "paddle-webhook-secret", "paddle-client-token"] : contains(keys(module.security.secret_arns), n)])
    error_message = "Billing needs the Paddle API key, webhook secret and client token secrets."
  }

  assert {
    condition     = local.core_environment["PADDLE_ENV"] == "live" && output.paddle_env == "live"
    error_message = "prod must use the live Paddle account."
  }

  assert {
    condition     = local.core_environment["WEBHOOK_QUEUE_URL"] == module.queues.queue_urls["webhooks"] && local.core_environment["ALARM_TOPIC_ARN"] == module.observability.alarm_topic_arn
    error_message = "core-api needs the webhooks queue and the alarm topic."
  }

  assert {
    condition     = anytrue([for s in data.aws_iam_policy_document.task.statement : s.sid == "Alarms" && contains(s.actions, "sns:Publish") && contains(s.resources, module.observability.alarm_topic_arn)])
    error_message = "core-api may publish billing alarms to the alarm topic."
  }

  assert {
    condition     = contains(module.edge.turnstile_domains, "try.aivideo.app")
    error_message = "Turnstile must accept tokens from funnel hosts."
  }
}

run "staging_uses_the_paddle_sandbox" {
  command = apply

  variables {
    env = "staging"
  }

  assert {
    condition     = local.core_environment["PADDLE_ENV"] == "sandbox"
    error_message = "staging must use the Paddle sandbox."
  }
}
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run:
```bash
export TF_PLUGIN_CACHE_DIR=$HOME/.terraform.d/plugin-cache
(cd infra/modules/edge && terraform init -backend=false -input=false >/dev/null && terraform test)
(cd infra/stack && terraform init -backend=false -input=false >/dev/null && terraform test)
```
Expected: edge FAIL (`rules[2]` không tồn tại, biến `turnstile_extra_domains` chưa khai báo); stack FAIL (`paddle-client-token` không có, `PADDLE_ENV` không có, `module.edge.turnstile_domains` không tồn tại).

- [ ] **Step 3: Implement**

`infra/modules/edge/variables.tf`: thay default của `rate_limited_paths`:

```hcl
  default = ["/v1/otp", "/v1/checkout", "/v1/claim"]
```
bằng
```hcl
  default = ["/v1/otp", "/v1/claim"]
```
và thêm vào cuối file:

```hcl

variable "checkout_requests_per_minute" {
  description = "Per-IP limit on /v1/checkout (creates a Paddle transaction)."
  type        = number
  default     = 10
}

variable "turnstile_extra_domains" {
  description = "Funnel hosts outside the platform zone where the Turnstile widget runs (checkout)."
  type        = list(string)
  default     = []
}
```

`infra/modules/edge/main.tf`:
1. Rule đầu: `description = "Throttle OTP, checkout and claim per IP"` → `description = "Throttle OTP and claim per IP"`.
2. Ngay sau rule `/_ikf/c` (trước `}]` đóng `rules`), thêm rule thứ 3:
```hcl
    }, {
    # Each call creates a Paddle transaction. /v1/paddle/webhook is deliberately in no rule.
    description = "Throttle checkout creation per IP"
    expression  = "(http.host eq \"${local.api_fqdn}\" and http.request.uri.path eq \"/v1/checkout\")"
    action      = "block"
    ratelimit = {
      characteristics     = ["ip.src", "cf.colo.id"]
      period              = 60
      requests_per_period = var.checkout_requests_per_minute
      mitigation_timeout  = 60
    }
```
3. Trong `cloudflare_turnstile_widget.this`: `domains = [var.zone_name]` → `domains = concat([var.zone_name], var.turnstile_extra_domains)`.

`infra/modules/edge/outputs.tf`: thêm vào cuối:
```hcl

output "turnstile_domains" {
  value = cloudflare_turnstile_widget.this.domains
}
```

`infra/stack/main.tf`:
1. Trong `locals` đầu file, `secret_names` thêm `"paddle-client-token"` sau `"paddle-webhook-secret"`, và sau `]` thêm:
```hcl
  # Staging never charges real cards; prod never takes sandbox payments.
  paddle_env = var.env == "prod" ? "live" : "sandbox"
```
2. Cuối `data "aws_iam_policy_document" "task"` (sau statement `Email`) thêm:
```hcl
  # Billing alarm paddle_auth_failed (core-api src/billing/alarm.js).
  statement {
    sid       = "Alarms"
    actions   = ["sns:Publish"]
    resources = [module.observability.alarm_topic_arn]
  }
```
3. Trong `core_environment` sau `PREVIEW_BASE_URL = …` thêm:
```hcl
    PADDLE_ENV        = local.paddle_env
    ALARM_TOPIC_ARN   = module.observability.alarm_topic_arn
```
4. Trong `module "edge"` sau `origin_auth_secret = …` thêm:
```hcl
  # Checkout runs Turnstile on funnel hosts, not only on the platform zone.
  turnstile_extra_domains = keys(var.funnel_domains)
```

`infra/stack/outputs.tf`: thêm vào cuối:
```hcl

output "paddle_env" {
  value = local.paddle_env
}
```

`infra/envs/staging/main.tf` và `infra/envs/prod/main.tf`: sau dòng `output "event_alarms_user" …` thêm:
```hcl
output "paddle_env" { value = module.stack.paddle_env }
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

Run:
```bash
terraform fmt -recursive infra && terraform fmt -check -recursive infra
(cd infra/modules/edge && terraform test)
(cd infra/stack && terraform test)
(cd infra/envs/staging && terraform init -backend=false -input=false >/dev/null && terraform validate)
(cd infra/envs/prod && terraform init -backend=false -input=false >/dev/null && terraform validate)
```
Expected: fmt không đổi gì; edge `Success! 9 passed, 0 failed.`; stack `Success! 10 passed, 0 failed.`; hai env `Success! The configuration is valid.`

- [ ] **Step 5: CI**

`.github/workflows/core-api.yml`: hai dòng `paths:` thành
```yaml
    paths: ["services/core-api/**", "packages/route-match/**", "packages/paddle/**", "packages/event-schema/**", "package-lock.json", ".github/workflows/core-api.yml"]
```
và bước test thành
```yaml
      - run: npm test -w @ikf/route-match -w @ikf/paddle -w @ikf/event-schema -w @ikf/core-api
```

`.github/workflows/packages.yml`: bước test thành
```yaml
      - run: npm test -w @ikf/route-match -w @ikf/event-schema -w @ikf/paddle -w @ikf/sdk -w @ikf/cli
```

`.github/workflows/edge-router.yml`: trong bước "Render wrangler config", sau `SDK_ENABLED: ${{ vars.SDK_ENABLED }}` thêm:
```yaml
          # Billing: all three set (plus the PADDLE_CLIENT_TOKEN Worker secret) turns on __IKF.paddle and /_ikf/pay.
          PADDLE_ENV: ${{ vars.PADDLE_ENV }}
          TURNSTILE_SITEKEY: ${{ vars.TURNSTILE_SITEKEY }}
          API_ORIGIN: ${{ vars.API_ORIGIN }}
```

Run: `docker run --rm -v "$PWD:/repo" -w /repo rhysd/actionlint:latest`
Expected: không có output, exit 0.

- [ ] **Step 6: Runbook**

`docs/runbooks/billing-paddle.md`:

````markdown
# Runbook: billing (Paddle)

First rollout of Paddle checkout per environment: staging (Paddle **sandbox**) end to end first, then prod
(Paddle **live**). Follow the steps **in order**. No secret value goes into git, a shell history or a chat.

Billing is off until every piece is configured:
- core-api registers `/v1/checkout`, `/v1/paddle/webhook`, `/v1/billing/*` and starts `billing-sync` only when
  the secrets `paddle-api-key`, `paddle-webhook-secret` and `turnstile-secret` have values (otherwise it logs
  `billing disabled, missing secret values: …` and keeps serving everything else);
- edge-router adds `__IKF.paddle/turnstile/api` and serves `/_ikf/pay` only when the GitHub variables
  `PADDLE_ENV`, `TURNSTILE_SITEKEY`, `API_ORIGIN` and the Worker secret `PADDLE_CLIENT_TOKEN` are all set.

## 0. Before you start

- Paddle account per env with: API key, client-side token, a notification destination
  `https://api.<zone>/v1/paddle/webhook` (events `transaction.*`, `subscription.*`, `adjustment.*`) and its secret,
  every funnel host + the preview host approved as a website, a default payment link `https://<funnel host>/_ikf/pay`.
- Platform zone plan allows 3 rate-limit rules and a 60-second period (`/v1/checkout` rule).

## 1. Terraform

`terraform apply` the env. It adds the secret `ikf/<env>/paddle-client-token`, the `/v1/checkout` rate limit
(10 / 60 s / IP), Turnstile on funnel hosts, ECS env `PADDLE_ENV` (`sandbox` on staging, `live` on prod) and
`ALARM_TOPIC_ARN`, and `sns:Publish` for core-api. Apply **before** deploying core-api: the new image refuses
to start without `PADDLE_ENV`.

## 2. Secret values (Secrets Manager)

```bash
for n in paddle-api-key paddle-webhook-secret paddle-client-token; do
  read -rsp "$n: " v; echo
  aws secretsmanager put-secret-value --secret-id "ikf/<env>/$n" --secret-string "$v"
done
```

`turnstile-secret` is written by Terraform. Restart core-api (`aws ecs update-service --force-new-deployment`)
so it reads the values.

## 3. edge-router

GitHub environment variables: `PADDLE_ENV` (`sandbox`|`live`), `TURNSTILE_SITEKEY`
(`terraform output turnstile_sitekey`), `API_ORIGIN` (`https://<terraform output api_fqdn>`). Then:

```bash
aws secretsmanager get-secret-value --secret-id ikf/<env>/paddle-client-token --query SecretString --output text \
  | npx wrangler secret put PADDLE_CLIENT_TOKEN --name ikf-edge-router-<env>
```

Re-run the edge-router workflow. Check: a funnel page source has `"paddle":{"env":"sandbox"` (staging) and
`https://<funnel host>/_ikf/pay?txn=txn_00000000000000000000000000&ret=https%3A%2F%2F<funnel host>%2F` answers 200.

## 4. Prices

```bash
ikf funnel prices set <slug> 1w=pri_…[:dsc_…] addon=pri_…
ikf funnel prices ls <slug>
```

`ikf publish` warns about plans in a funnel's `CONFIG` that have no price.

## 5. Verify (staging, sandbox cards)

Card `4242 4242 4242 4242`, any future date, CVC `100`; 3DS: `4000 0038 0000 0446`.

1. Weekly plan: pay in the overlay → the funnel goes to its next screen; `ikf billing outbox ls` shows
   `subscription.activated` and `payment.succeeded`, once each.
2. Add-on: `payment.succeeded` with plan `addon`.
3. 3DS card: same as 1 after the challenge.
4. Refund the weekly transaction in the Paddle dashboard → one `payment.refunded`.
5. Paddle dashboard → Notifications → resend any event → `ikf billing outbox ls` unchanged.
6. In-app browsers (FB, IG, TikTok): checkout inline, or "Open in browser" → pay → back on the funnel, unlocked
   after "Confirming your payment" at most 20 s.
7. `ikf billing reconcile --since 24h` → `Lệch: 0`.

## Operations

- **Lost webhooks / long outage:** `ikf billing reconcile --since 7d` (max 30d) queues every transaction that is
  missing or stale; the worker re-reads it from Paddle.
- **Messages in `ikf-<env>-webhooks-dlq`** (alarm): a message failed 5 times. Fix the cause (logs:
  `billing_sync_failed`), then redrive: `aws sqs start-message-move-task --source-arn <dlq arn>`.
- **Alarm `paddle_auth_failed`** (max 1 per 15 minutes): the API key was revoked or is from the other
  environment. Put the right key (step 2) and force a new deployment. Checkout answers 503 until then.
- **Turn billing off quickly:** unset the GitHub variable `PADDLE_ENV` and re-run edge-router: funnels stop
  starting Paddle checkouts (their own demo/`checkoutUrl` flow is back). Webhooks keep being processed.
````

- [ ] **Step 7: Commit**

```bash
git add infra .github docs/runbooks/billing-paddle.md
git commit -m "infra(billing): paddle-client-token, /v1/checkout rate limit, Turnstile on funnel hosts, PADDLE_ENV + alarms; CI; runbook"
```

---

### Task 13: Playwright — checkout trên 2 funnel thật với Paddle giả

**Files:**
- Modify: `packages/sdk/e2e/server.js` (thay toàn bộ: thêm `billing`, core giả, trang `/_ikf/pay` thật)
- Create: `packages/sdk/e2e/billing.spec.js`

**Interfaces:**
- Consumes: `injectIkf(..., {billing})`, `payResponse` (Task 11), SDK build (Task 10–11), funnel thật `nebula/witch-power` (Starlyn) và `chat-ai-character/chai-kpop-idol` (ChatChi) — cả hai có plan `1w` + `addon`, sheet `#demock`, tự đọc `?paid=`.
- Produces:
  - `startFunnelServer({file, funnel, country?, pixel?, billing?})` → `{origin, posts, checkout: {bodies, status, plan, statusReads}, events(), close()}`; `E2E_CHECKOUT_ID`, `E2E_TXN`. Không truyền `billing` thì giống hệt bản cũ (`funnels.spec.js` không đổi).
  - Paddle.js / Turnstile giả qua `page.route` (`window.__paddle`, `window.__paddleEmit(name)`).
  - Không gọi Paddle thật; thư mục funnel thiếu → skip.

- [ ] **Step 1: Server + test**

`packages/sdk/e2e/server.js` (thay toàn bộ):

```js
// Serves a real demo.html the way the edge-router Worker does: same injectIkf, same SDK bundle,
// and records every POST /_ikf/c body. With billing: true it also plays core-api for checkout
// (POST /v1/checkout, GET /v1/checkout/:id) and serves the Worker's real /_ikf/pay page.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { injectIkf } from '../../../workers/edge-router/src/inject.js';
import { payResponse } from '../../../workers/edge-router/src/pay.js';
import { buildSdk } from '../scripts/build.mjs';

export const E2E_CHECKOUT_ID = '01JAXKZ8TQ4M7RP2W9HC3VNBD5';
export const E2E_TXN = 'txn_01e2eaaaaaaaaaaaaaaaaaaaaa';
const PAY_ENV = { PADDLE_ENV: 'sandbox', PADDLE_CLIENT_TOKEN: 'test_e2e_token', TURNSTILE_SITEKEY: '1x00000000000000000000AA', API_ORIGIN: 'https://api.e2e.test' };

export async function startFunnelServer({ file, funnel, country = 'US', pixel = '123456789012345', billing = false }) {
  const { code, hash } = await buildSdk({ write: false });
  const sdkSrc = `/_ikf/sdk.${hash}.js`;
  const posts = [];
  const checkout = { bodies: [], status: 'created', plan: null, statusReads: 0 };
  let origin = '';
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, origin);
      const readBody = async () => {
        let body = '';
        for await (const chunk of req) body += chunk;
        return body;
      };
      if (req.method === 'POST' && url.pathname === '/_ikf/c') {
        posts.push({ contentType: req.headers['content-type'], origin: req.headers.origin, body: await readBody() });
        res.writeHead(204).end();
        return;
      }
      if (url.pathname === sdkSrc) {
        res.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8' }).end(code);
        return;
      }
      if (url.pathname === '/promo') {
        const extra = billing
          ? { paddle: { env: 'sandbox', clientToken: PAY_ENV.PADDLE_CLIENT_TOKEN }, turnstile: PAY_ENV.TURNSTILE_SITEKEY, api: origin }
          : null;
        const html = injectIkf(await readFile(file, 'utf8'), { funnel, v: 1, rev: 1, country, pixel, preview: false }, { sdkSrc, billing: extra });
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache' }).end(html);
        return;
      }
      if (billing && req.method === 'POST' && url.pathname === '/v1/checkout') {
        const body = JSON.parse(await readBody());
        checkout.bodies.push(body);
        checkout.plan = body.plan;
        res.writeHead(201, { 'content-type': 'application/json' }).end(JSON.stringify({ checkout_id: E2E_CHECKOUT_ID, transaction_id: E2E_TXN }));
        return;
      }
      if (billing && req.method === 'GET' && url.pathname.startsWith('/v1/checkout/')) {
        if (url.pathname !== `/v1/checkout/${E2E_CHECKOUT_ID}`) {
          res.writeHead(404, { 'content-type': 'application/json' }).end('{"error":"checkout_not_found"}');
          return;
        }
        checkout.statusReads += 1;
        res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ checkout_id: E2E_CHECKOUT_ID, status: checkout.status, plan: checkout.plan }));
        return;
      }
      if (billing && url.pathname === '/_ikf/pay') {
        const r = payResponse(new Request(url.href), url, PAY_ENV);
        res.writeHead(r.status, Object.fromEntries(r.headers)).end(await r.text());
        return;
      }
      res.writeHead(404).end();
    } catch (err) {
      res.writeHead(500).end(String(err));
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
  return {
    origin,
    posts,
    checkout,
    events: () => posts.flatMap((p) => JSON.parse(p.body).events),
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}
```

`packages/sdk/e2e/billing.spec.js`:

```js
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect, devices } from '@playwright/test';
import { startFunnelServer, E2E_CHECKOUT_ID, E2E_TXN } from './server.js';

const DIR = process.env.IKF_FUNNELS_DIR || '/Users/daothinh/ikame/funnel/funnel-development';
const EMAIL = 'e2e.person@example.com';
const FB_UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/450.0.0.0;]';

// Two real funnels with a weekly plan and a one-time add-on, a demo checkout sheet and their own ?paid= unlock.
const DEMOS = [
  { name: 'Starlyn witch-power', path: 'nebula/witch-power/demo.html', funnel: 'witch-power' },
  { name: 'ChatChi kpop-idol', path: 'chat-ai-character/chai-kpop-idol/demo.html', funnel: 'chai-kpop-idol' },
];

// Stand-ins for Paddle.js v2 and Turnstile: record calls, let the test fire Paddle events.
const FAKE_PADDLE = `window.__paddle={opened:[],closed:0,env:null,init:null};
window.Paddle={Environment:{set:function(e){window.__paddle.env=e}},Initialize:function(o){window.__paddle.init=o},
Checkout:{open:function(o){window.__paddle.opened.push(o)},close:function(){window.__paddle.closed++}}};
window.__paddleEmit=function(n){window.__paddle.init.eventCallback({name:n,data:{}})};`;
const FAKE_TURNSTILE = "window.turnstile={render:function(el,o){setTimeout(function(){o.callback('e2e-token')},10);return 'w1'},remove:function(){}};";

async function route(page, srv, { blockPaddle = () => false } = {}) {
  await page.route('https://cdn.paddle.com/**', (r) => (blockPaddle() ? r.abort() : r.fulfill({ contentType: 'text/javascript', body: FAKE_PADDLE })));
  await page.route('https://challenges.cloudflare.com/**', (r) => r.fulfill({ contentType: 'text/javascript', body: FAKE_TURNSTILE }));
  await page.route((url) => !url.href.startsWith(srv.origin) && !/cdn\.paddle\.com|challenges\.cloudflare\.com/.test(url.host), (r) => r.abort());
}

const ready = (page) => page.waitForFunction(() => typeof window.checkout === 'function' && !!window.IKF && !!window.IkFunnel);
const flushNames = async (page, srv) => {
  await page.evaluate(() => window.IKF.flush());
  return srv.events().map((e) => e.name);
};

test.describe('Paddle checkout on real funnels (fake Paddle)', () => {
  test.skip(!existsSync(DIR), `IKF_FUNNELS_DIR not found: ${DIR}`);

  for (const demo of DEMOS) {
    test(`${demo.name}: inline overlay, unlock only on checkout.completed, email only in /v1/checkout`, async ({ page }) => {
      const file = join(DIR, demo.path);
      test.skip(!existsSync(file), `missing ${file}`);
      const srv = await startFunnelServer({ file, funnel: demo.funnel, billing: true });
      const urls = [];
      const errors = [];
      page.on('request', (r) => urls.push(r.url()));
      page.on('pageerror', (e) => errors.push(e.message));
      try {
        await route(page, srv);
        await page.goto(`${srv.origin}/promo?utm_source=meta`);
        await ready(page);
        expect(await page.evaluate(() => Object.values(window.IkFunnel.config.checkoutUrl).every((v) => v === ''))).toBe(true);

        await page.evaluate((email) => {
          window.IkFunnel.checkoutEmail = () => email;
          window.checkout('1w');
        }, EMAIL);
        await expect.poll(() => page.evaluate(() => window.__paddle?.opened.length ?? 0)).toBe(1);
        expect(await page.evaluate(() => window.__paddle.opened[0])).toEqual({ transactionId: E2E_TXN, settings: { displayMode: 'overlay', variant: 'one-page' } });
        expect(await page.evaluate(() => window.__paddle.env)).toBe('sandbox');
        expect(await page.locator('#demock').count()).toBe(0);
        expect(srv.checkout.bodies).toEqual([expect.objectContaining({
          funnel: demo.funnel, v: 1, plan: '1w', email: EMAIL, turnstile_token: 'e2e-token', attribution: expect.objectContaining({ utm_source: 'meta' }),
        })]);
        expect(await flushNames(page, srv)).not.toContain('purchase_complete');

        await page.evaluate(() => window.__paddleEmit('checkout.completed'));
        await expect.poll(() => flushNames(page, srv)).toEqual(expect.arrayContaining(['checkout_click', 'checkout_complete', 'purchase_complete']));
        const events = srv.events();
        expect(events.filter((e) => e.name === 'purchase_complete')).toHaveLength(1);
        expect(events.find((e) => e.name === 'checkout_complete').props).toEqual({ plan: '1w', checkout_id: E2E_CHECKOUT_ID });

        expect(srv.posts.map((p) => p.body).join('\n')).not.toContain('e2e.person');
        expect(urls.join('\n')).not.toContain('e2e.person');
        expect(page.url()).not.toContain('e2e.person');
        expect(errors).toEqual([]);
      } finally {
        await srv.close();
      }
    });
  }

  test('in-app webview: Paddle.js blocked → Open in browser → /_ikf/pay → back, unlocked only after core confirms', async ({ browser }) => {
    const demo = DEMOS[0];
    const file = join(DIR, demo.path);
    test.skip(!existsSync(file), `missing ${file}`);
    const srv = await startFunnelServer({ file, funnel: demo.funnel, billing: true });
    const context = await browser.newContext({ ...devices['Pixel 7'], userAgent: FB_UA });
    const page = await context.newPage();
    let blockPaddle = true;
    try {
      await route(page, srv, { blockPaddle: () => blockPaddle });
      await page.goto(`${srv.origin}/promo?utm_source=meta`);
      await ready(page);
      await page.evaluate(() => window.checkout('addon'));
      const link = page.locator('#ikf-pay a');
      await expect(link).toHaveText('Open in browser');
      const href = await link.getAttribute('href');

      blockPaddle = false; // the "real" browser can load Paddle
      await page.goto(srv.origin + href);
      await expect.poll(() => page.evaluate(() => window.__paddle?.opened[0]?.transactionId)).toBe(E2E_TXN);
      await page.evaluate(() => window.__paddleEmit('checkout.completed'));
      await page.waitForURL(/\/promo/);
      await ready(page);
      expect(page.url()).not.toContain('ikf_paid');
      await expect.poll(() => srv.checkout.statusReads).toBeGreaterThan(0);
      expect(await flushNames(page, srv)).not.toContain('purchase_complete'); // still 'created'

      srv.checkout.status = 'completed'; // the webhook has been processed
      await expect.poll(() => flushNames(page, srv), { timeout: 10_000 }).toContain('purchase_complete');
      expect(srv.events().find((e) => e.name === 'checkout_complete').props).toEqual({ plan: 'addon', checkout_id: E2E_CHECKOUT_ID });
    } finally {
      await context.close();
      await srv.close();
    }
  });

  test('forged ?paid= and ?ikf_paid= never unlock', async ({ page }) => {
    const demo = DEMOS[0];
    const file = join(DIR, demo.path);
    test.skip(!existsSync(file), `missing ${file}`);
    const srv = await startFunnelServer({ file, funnel: demo.funnel, billing: true });
    try {
      await route(page, srv);
      await page.goto(`${srv.origin}/promo?paid=1w&ikf_paid=01JAZZZZZZZZZZZZZZZZZZZZZZ`);
      await ready(page);
      expect(new URL(page.url()).search).toBe('');
      expect(await page.evaluate(() => (typeof S === 'object' && S ? Boolean(S.paid) : false))).toBe(false);
      await page.waitForTimeout(3000);
      expect(await flushNames(page, srv)).not.toContain('purchase_complete');
      expect(srv.checkout.statusReads).toBe(0); // unknown checkout: 404, never "completed"
    } finally {
      await srv.close();
    }
  });
});
```

- [ ] **Step 2: Chạy**

Run: `npm run e2e -w @ikf/sdk`
Expected: `11 passed` (7 test cũ của `funnels.spec.js` + 4 test billing). Lúc viết plan, đổi tạm `takePaidParams` để không xóa `paid` thì test `forged ?paid=…` fail với `Received: "?paid=1w"` — test này ghim Review Focus 2.

Run thêm (skip khi không có thư mục funnel): `IKF_FUNNELS_DIR=/nonexistent npm run e2e -w @ikf/sdk`
Expected: `10 skipped`, `1 passed` (test thuần `carriesUserData` có sẵn).

- [ ] **Step 3: Chạy lại toàn bộ test của nhánh**

```bash
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock
npm test -w @ikf/paddle -w @ikf/event-schema -w @ikf/sdk -w @ikf/cli -w @ikf/edge-router -w @ikf/event-consumer -w @ikf/core-api -w @ikf/route-match
```
Expected: paddle 28, event-schema 138, sdk 142, cli 99, edge-router 99, event-consumer 7 + 27, core-api 198, route-match 35 — tất cả PASS.

- [ ] **Step 4: Commit**

```bash
git add packages/sdk/e2e
git commit -m "test(sdk): Playwright billing on two real funnels with fake Paddle: inline, webview fallback, forged paid"
```

---

## Theo sau (thủ công, ngoài phạm vi plan này)

Checklist E2E trên **Paddle sandbox** (điều kiện xong của spec), làm theo `docs/runbooks/billing-paddle.md` sau khi Task 0 xong và nhánh đã merge:

1. `terraform apply` staging → nhập 3 secret Paddle → force new deployment core-api → log không còn `billing disabled`.
2. GitHub vars edge-router (`PADDLE_ENV=sandbox`, `TURNSTILE_SITEKEY`, `API_ORIGIN`) + `wrangler secret put PADDLE_CLIENT_TOKEN` → deploy → trang funnel có `"paddle":{"env":"sandbox"`.
3. `ikf funnel prices set witch-power 1w=pri_…:dsc_… addon=pri_…` và tương tự cho `chai-kpop-idol`; `ikf publish` không còn cảnh báo.
4. Trên 2 funnel pilot (Chrome Android + Safari iOS):
   - gói tuần, thẻ `4242 4242 4242 4242` → funnel sang màn tiếp; `ikf billing outbox ls` có đúng 1 `subscription.activated` + 1 `payment.succeeded`;
   - add-on → 1 `payment.succeeded` với `plan: addon`;
   - thẻ 3DS `4000 0038 0000 0446` → như trên sau bước xác thực;
   - refund gói tuần trên dashboard → đúng 1 `payment.refunded`.
5. Dashboard Paddle → Notifications → gửi lại 5 event bất kỳ (kể cả cũ) → `ikf billing outbox ls` không thêm dòng, `SELECT status FROM subscriptions` không đổi.
6. In-app browser FB, IG, TikTok (link trong tin nhắn/bài viết): inline được thì trả tiền inline; không được thì "Open in browser" → trả tiền → quay về funnel, "Confirming your payment" ≤ 20s rồi mở khóa.
7. Email: `SELECT count(*) FROM events WHERE arrayExists(v -> match(v, '@'), mapValues(props))` (ClickHouse) = 0; log CloudWatch core-api không chứa email test.
8. `ikf billing reconcile --since 24h` → `Lệch: 0`. Tạm tắt notification destination, mua 1 lần, bật lại, chạy reconcile → `Lệch: 1`, chạy lại sau 1 phút → `Lệch: 0`.
9. Đổi tạm `paddle-api-key` sai → checkout trả 503, nhận đúng 1 email alarm `paddle_auth_failed` trong 15 phút → sửa lại.
10. Lặp 1–9 trên prod với Paddle **live** (thẻ thật, refund ngay).

---

## Self-Review

**Spec coverage:**

| Spec | Task |
|---|---|
| Mục tiêu / điều kiện xong (E2E sandbox, replay webhook sai thứ tự/trùng/muộn, reconcile = 0) | 7 (replay test), 13 (local, Paddle giả), "Theo sau" 4–8 (sandbox) |
| Quyết định #1 Paddle.js inline + `completePurchase` + dự phòng `/_ikf/pay` | 10, 11, 13 |
| Quyết định #2 map giá ở core theo funnel, kiểm tra Paddle, client không gửi `price_id` | 3, 4, 5 |
| Quyết định #3 email chỉ trình duyệt → body → Paddle | 5 (B1), 10, 13 |
| Quyết định #4 phạm vi: khách hàng, giao dịch, subscription, state machine, outbox | 2, 7 |
| Quyết định #5 inbox → SQS → worker đọc lại Paddle, guard `updated_at` | 6, 7, 9 |
| §1 `packages/paddle` (timeout 10s, retry 2, sandbox/live, `verifyWebhook`) | 1 |
| §1 core-api module billing + worker cùng process | 3, 5, 6, 7, 8, 9 |
| §1 SDK, edge-router, CLI, infra | 10–11, 11, 4 + 8, 12 |
| §2 migration `003_billing.sql` (7 bảng, email chỉ ở `customers`, `amount_minor`) | 2 (+B3 `dedupe_key`) |
| §2 `funnel_id NULL` + log `unmapped_price` | 7 |
| §3.1–3.2 `checkout_click`, Turnstile ẩn, body `/v1/checkout`, `checkoutEmail()` | 10 (+B10) |
| §3.3 Turnstile, funnel@v, `422 plan_not_mapped`, ULID, `POST /transactions`, CORS | 5 (+B1, B11) |
| §3.4–3.5 nạp Paddle.js, sandbox, `Checkout.open`, `checkout.completed/closed/error` | 10 (+B7) |
| §3.6 webview: nút "Mở trong trình duyệt", `/_ikf/pay`, `ret` cùng host, `?ikf_paid=` | 10, 11, 13 (+B13) |
| §3.7 `ikf_paid` poll 2s/20s, chỉ `completed` | 11, 13 |
| §3.8 add-on `one_time` | 3 (kind), 5, 7, 13 |
| §3.9 chặn chuyển trang `checkoutUrl` | 10 (+B8) |
| `GET /v1/checkout/:id` không trả email | 5 |
| Rate limit `/v1/checkout` 10/phút/IP | 12 (+B15) |
| §4 webhook (1MB, chữ ký, 300s, 401, inbox, SQS, 503) | 1, 6 |
| §4 worker (long-poll 20s/10, visibility 60s, FOR UPDATE, guard, upsert, checkout completed, inbox, xóa/không xóa, DLQ 5) | 6, 7, 9 (+B5) |
| §4 bảng state machine + topic outbox, refund, chargeback, đúng một dòng | 7 (+B3, B4, B6) |
| §4 `ikf billing reconcile` (phân trang, đẩy phần lệch, in số lệch) | 1 (`listTransactions`), 8 (+B12) |
| §5 `PUT/GET /v1/funnels/:slug/prices`, `invalid_price/invalid_discount`, CLI `prices set/ls`, cảnh báo `ikf publish` | 3, 4 (+B18) |
| §6 bảng xử lý lỗi | Turnstile: 5, 10; 503/mạng retry 1s: 10; 422: 5, 10; Paddle.js lỗi/webview: 10, 13; `ikf_paid` 20s: 11; Paddle lỗi tạo transaction: 1, 5; 401/403 + alarm 15 phút: 3, 5, 9 (+B17); webhook sai chữ ký: 6; worker gọi Paddle lỗi: 6, 7; price chưa map: 7; webhook mất: 8 |
| §6 staging sandbox / prod live, secret tách theo env, `paddle-client-token` | 9 (config guard), 11 (render-config guard), 12 |
| §7 bảng kiểm thử (từng tầng) | 1, 5, 6, 7, 3/4/8, 10/11, 11 (pool-workers), 13 + "Theo sau" (sandbox, webview thủ công) |
| §8 ngoài phạm vi (entitlement, relay, trang hủy, sửa 12 funnel, `checkoutEmail` trong funnel) | không có task (đúng) |

**Placeholder:** không có "TBD"/"tương tự Task N". Giá trị thật (API key, client token, webhook secret, `pri_…`, sitekey) là đầu vào Task 0 / runbook, không phải phần thiếu của plan. Toàn bộ code đã chạy trên bản sao `feat/runtime-sdk-collector@053769a` (Node 26, colima): số test ở mỗi task là số thật; image core-api đã build và import được các module billing; `terraform test`/`validate`, `terraform fmt -check`, actionlint đều sạch.

**Nhất quán tên / kiểu:**
- `PaddleClient` (Task 1) = `fakePaddle()` (Task 3) = thứ `billingDeps` tạo (Task 9): `createTransaction`, `getTransaction` (kèm `customer`, `adjustments`), `getSubscription`, `getPrice`, `getDiscount`, `getCustomer`, `createCustomer`, `listTransactions({updatedAfter})`.
- `PaddleError.kind` `auth|not_found|client|unavailable` → `paddleHttpError` (Task 3) dùng ở Task 5, 8.
- `Queue` `{send, receive({signal}), delete}`: `createSqsQueue` (Task 6) = `fakeQueue` (Task 6) = deps webhook (6), reconcile (8), `billingDeps` + `startQueueWorker` (9).
- Message SQS `{event_id, event_type, entity, entity_id}`: `acceptWebhook` (6) → `syncMessage` (7) ← `reconcile` (8, `event_type: 'reconcile'`).
- `buildApp` deps: `paddle`, `alarm` (3), `turnstile` (5), `queue`, `webhookSecret`, `now` (6, 8) — `server.js` truyền `...billing.deps` (9).
- `POST /v1/checkout` body/response (5) = SDK `post()` (10) = core giả e2e (13); `GET /v1/checkout/:id` `{checkout_id, status, plan}` (5) = SDK `confirm()` (11) = e2e (13).
- `__IKF` `{…, paddle: {env, clientToken}, turnstile, api}`: `billingConfig`/`injectIkf` (11) → `createCheckout` đọc `cfg.paddle/turnstile/api/preview` (10) → server e2e dùng chính `injectIkf` (13).
- `/_ikf/pay?txn=&ret=` : SDK `payUrl` (10) → `payResponse` (11) → e2e (13); `ret` mang sẵn `ikf_paid` (B13).
- Env/secret: `PADDLE_ENV` (core config 9, render-config 11, Terraform `local.paddle_env` 12), `WEBHOOK_QUEUE_URL`, `ALARM_TOPIC_ARN` (9 ↔ 12), `PADDLE_CLIENT_TOKEN`/`TURNSTILE_SITEKEY`/`API_ORIGIN` (11 ↔ 12 CI ↔ runbook), secret `paddle-client-token` (12 ↔ runbook).
- Topic outbox + `dedupe_key` (7) = mô tả Global Constraints = `ikf billing outbox ls` (8).

**Review Focus đã ghim:** 1 → Task 6 + 7; 2 → Task 5 + 10 + 11 + 13; 3 → Task 5 + 10 + 13; 4 → Task 1 + 6; 5 → Task 6 + 7.

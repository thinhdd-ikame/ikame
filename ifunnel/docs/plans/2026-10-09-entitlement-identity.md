# iKame Funnel Platform — Entitlement + Identity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Người đã trả tiền trên web vào được app (web2app) hoặc web product (web2web) với đúng quyền đã mua, kể cả khi đổi máy hay cài lại. Backend app vẫn quyết định premium; iFunnel liên kết người mua với `app_user_id` (claim token qua Adjust deep link, OTP email, magic link) và đẩy **toàn bộ** quyền hiện tại sang backend app bằng webhook có chữ ký mỗi khi quyền đổi. Chạy lại toàn bộ outbox không sinh webhook thừa.

**Architecture:**
- **Migration `004_entitlements.sql`**: `apps`, `entitlements`, `app_links`, `claim_tokens`, `otp_codes`, `magic_links`, `webhook_deliveries`; `funnels.app_id`, `funnel_prices.entitlement_key`, `customers.ref` (`cus_<ULID>`).
- **`core-api` module `identity`** (mới, `src/identity/*`): `computeEntitlements` (hàm thuần) → `recompute` (ghi `entitlements`, tạo delivery `entitlement.updated` cho mỗi link đang hoạt động của app có thay đổi); link (tối đa 3, `link.revoked`); claim token (dẫn xuất HMAC từ `claim-token-key`, DB chỉ giữ sha256), OTP, magic link; app registry + API key `ikfa_…`; secret webhook theo app trong Secrets Manager.
- **Worker `entitlement-sync`** (cùng process): mỗi 2s lấy ≤ 100 dòng `outbox` chưa `published_at` (`FOR UPDATE SKIP LOCKED`), gom theo khách, `recompute`, tạo claim token cho `payment.succeeded`, đánh dấu `published_at`; gửi email claim (SES) sau commit; mỗi 5 phút quét quyền hết hạn.
- **Worker `webhook-sender`** (cùng process): mỗi giây gửi delivery cũ nhất còn `pending` của mỗi `(app, app_user_id)`, ký `Ikf-Signature: t=…,v1=…`, retry `[1m,5m,30m,2h,6h,12h,24h]`, rồi `dead` + alarm SNS (throttle Redis của billing).
- **HTTP**: app-backend API (`/v1/claims/redeem`, `/v1/otp/send|verify`, `/v1/magic/redeem`, `/v1/users/:id/entitlements`, Bearer API key của app); trình duyệt `GET /v1/checkout/:id/claim` (CORS như checkout); admin `/v1/apps*`, `/v1/customers/lookup`; `PUT /v1/funnels/:slug {app_id}`, prices `entitlement_key`.
- **`@ikf/sdk`** (sửa): sau `checkout_complete` poll `GET /v1/checkout/:id/claim` (2s, tối đa 20s); `app_link` → `IkFunnel.appLink(url)` | `[data-ikf="get-app"]` | URL app trong `IkFunnel.config`; web2web chuyển sang `return_url?ikf_ml=`.
- **CLI** (sửa): `ikf app create|ls|rotate-key|webhooks`, `ikf funnel set --app`, `ikf funnel prices set … plan=price[:discount][@key]`, `ikf customer show <email>`.
- **Infra** (sửa): secret `claim-token-key`, IAM `ikf/<env>/app-webhook/*`, rule rate limit cho 4 endpoint identity. **Docs**: `docs/integration/app-backend.md` (test vector chữ ký có test giữ đồng bộ), `docs/runbooks/entitlement-identity.md`.

**Tech Stack:** Node.js 22 trên CI (local Node 26) · JavaScript ESM · npm workspaces · Fastify 5 · `pg` 8 · `@aws-sdk/client-secrets-manager` + `client-sesv2` (mới) + `client-sns` v3 · `redis` 4 · Vitest ~3.2 · happy-dom 20 · esbuild 0.25 · `@testcontainers/postgresql` 11 · Terraform + AWS/Cloudflare provider (mock).

**Spec:** `ifunnel/docs/specs/2026-10-09-entitlement-identity-design.md`. Xây trên plan `ifunnel/docs/plans/2026-10-09-billing-paddle.md` (spec billing: `ifunnel/docs/specs/2026-10-09-billing-paddle-design.md`).

**Repo / nhánh / worktree:** repo `/Users/daothinh/ikf-platform`. Nhánh mới **`feat/entitlement-identity`** cắt từ đầu `feat/billing-paddle` — đã kiểm với tip **`ffb2d21761a9c5b725bb417470b857e0f4808564`** (`docs(billing): outbox consumers key on paddle_transaction_id + origin, never checkout_id`). Code nằm trong worktree mới **`/Users/daothinh/ikf-platform-entitlement`** (Task 1 tạo cả nhánh lẫn worktree). **Không bao giờ** đụng `/Users/daothinh/ikf-platform-billing` (session khác đang làm billing ở đó). Mọi lệnh trong plan chạy từ thư mục gốc của worktree mới.

**Môi trường chạy test (local):**
```bash
cd /Users/daothinh/ikf-platform-entitlement
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock          # Docker qua colima
export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock     # Testcontainers (Postgres)
export TF_PLUGIN_CACHE_DIR=$HOME/.terraform.d/plugin-cache            # Terraform (chỉ mock provider)
```
actionlint: colima chỉ mount `$HOME`, nên chép `.github` vào một thư mục tạm trong `$HOME` có `git init` rồi chạy `docker run --rm -v "$D:/repo" -w /repo rhysd/actionlint:latest` (xem Task 12).

Số test ghi ở mỗi task là số **thật** khi chạy toàn bộ code của plan này trên bản sao `feat/billing-paddle@ffb2d21` (Node 26, colima), rồi chạy lại **nguyên văn các khối trong file plan này** trên một bản sao sạch thứ hai (cây kết quả trùng từng byte). Mốc ban đầu tại `ffb2d21`: core-api 206 (21 file), sdk 146 (10 file, bundle **7828** byte gzip), cli 99, edge-router 101, paddle 31, event-schema 138, route-match 35, event-consumer 7 + 27; Terraform edge 10, stack 10. Nhánh billing tự pass toàn bộ test của nó.

Nếu lúc thực thi `feat/billing-paddle` đã đi xa hơn `ffb2d21`: chạy lại mốc ban đầu (Task 1 Step 2); nếu số khác, ghi lại và điều chỉnh các con số "Expected" theo chênh lệch, nhưng **không** sửa code billing ngoài các chỗ plan này nêu (bảng E16).

## Điều chỉnh so với spec (phát hiện khi đọc code billing tại `ffb2d21`, khảo sát 69 `demo.html`, và chạy thử, 2026-10-09)

| # | Spec | Plan làm | Lý do |
|---|---|---|---|
| E1 | Claim token 32 byte ngẫu nhiên, DB chỉ lưu `sha256`; `GET /v1/checkout/:id/claim` trả `app_link` chứa token | Token **dẫn xuất**: `base64url(HMAC-SHA256(claim-token-key, "claim:" + checkout_id))` (32 byte). DB vẫn chỉ lưu `sha256(token)`; email và `GET …/claim` tính lại cùng một token. Secret mới `claim-token-key` (Secrets Manager, nhập tay); thiếu thì identity tắt | Chỉ lưu hash thì không thể hiện lại token lần thứ hai (email lúc sync, web lúc SDK poll). Bảo mật tương đương spec: ai biết `checkout_id` vốn đã lấy được token qua `GET …/claim` |
| E2 | Gửi email claim trong bước sync; "SES lỗi: retry 3 lần, log + alarm" | Thêm cột `claim_tokens.email_attempts`, `emailed_at`. Email gửi **sau** khi transaction tạo token đã commit, mỗi tick thử lại dòng chưa gửi, tối đa 3 lần, rồi log `claim_email_failed` + alarm | Gửi trong transaction thì crash sau khi gửi làm gửi lại, crash trước commit làm mất; tách ra thì không mất, không trùng |
| E3 | `customer_ref = cus_<ULID>` "gán cho mỗi khách" | `ALTER TABLE customers ADD COLUMN ref` (unique, check định dạng), gán lần đầu cần (`COALESCE`) | `customers` là bảng của billing; không sửa code billing để gán lúc tạo |
| E4 | `app_links … UNIQUE (app_id, app_user_id)` | Unique **một phần**: `(app_id, app_user_id) WHERE revoked_at IS NULL`; dòng bị thu hồi giữ làm lịch sử | Với UNIQUE đầy đủ, một `app_user_id` đã bị `link.revoked` không bao giờ liên kết lại được (kể cả với chính khách đó) |
| E5 | One-time active "nếu không có adjustment refund/chargeback đã duyệt" | Đọc refund/chargeback từ chính `outbox` (`topic IN ('payment.refunded','payment.chargeback') AND aggregate_id = <txn>`), không phụ thuộc `published_at` | Billing không có bảng adjustment; outbox (khóa `dedupe_key`) là nơi duy nhất ghi nhận refund/chargeback đã duyệt (B4) |
| E6 | `active`, `trialing`: active (không điều kiện), `expires_at = cpe + 3 ngày` | Cả `active`/`trialing`/`past_due` đều active **khi `now < cpe + 3 ngày`** (cpe NULL → active, không hạn) | Mất webhook gia hạn thì premium không được thành vĩnh viễn (reconcile sẽ sửa); và lượt quét hết hạn phải hội tụ (không chọn lại cùng khách mỗi 5 phút) |
| E7 | "Refund hoặc chargeback: quyền tắt và có webhook ngay" (không nói về subscription) | Subscription tắt khi **payment `completed` mới nhất** của nó có refund/chargeback | Bảng §4 chỉ dựa trên status; Paddle không tự hủy subscription khi refund, nên thiếu dòng này thì refund gói tuần vẫn để premium tới hết kỳ |
| E8 | Map quyền "qua `checkout` hoặc `price_id`" | Subscription: `subscriptions.funnel_id/plan_key` → `funnel_prices.entitlement_key` (mapping đã xóa → `premium`). One-time: transaction `completed`, không có subscription, qua `checkouts` → plan có `kind = 'one_time'` | `transactions` không lưu `price_id`; điều kiện `one_time` chặn trường hợp transaction đầu của subscription lưu trước khi có `subscription_id` bị coi là mua vĩnh viễn. Hệ quả (runbook): muốn đổi quyền của add-on thì đổi `@key`, đừng xóa mapping |
| E9 | "Với mỗi khách, trong một transaction" | Một transaction cho cả lô (giữ khóa `SKIP LOCKED` trên các dòng outbox) + `SAVEPOINT` cho mỗi khách; khách lỗi chỉ để lại dòng của mình | Khóa dòng outbox và cập nhật `published_at` phải cùng một connection; transaction riêng mỗi khách sẽ tự chặn chính nó |
| E10 | `GET /v1/customers?email=` | `POST /v1/customers/lookup {email}` (quyền `admin`); CLI vẫn là `ikf customer show <email>` | Email trên query string lọt vào access log của Fastify/ALB/Cloudflare, trái "Log không có email" |
| E11 | SDK: không có `appLink`, không có `data-ikf="get-app"` thì "gắn vào `IkFunnel.config.appUrl`" | Đặt `config.appUrl`, và **cả** `appUrlAndroid`, `appStoreUrl`, `playStoreUrl` nếu funnel có các khóa này | Khảo sát: 17 funnel có `appUrl`, `appHandoffUrl()` ưu tiên `appUrlAndroid` trên Android, nút store dùng thẳng `appStoreUrl`/`playStoreUrl` → chỉ đặt `appUrl` thì mất claim. Hiện chưa funnel nào có `IkFunnel.appLink` hay `data-ikf="get-app"`. **Lưu ý cho team nội dung:** `appHandoffUrl()` của 8 funnel nebula/scanner tự nối `email=…` vào link app — lỗi có sẵn, SDK không chặn được (như 12 funnel của billing) |
| E12 | Rate limit `/v1/otp/*`, `/v1/claims/*` | Rule cũ dùng `in {"/v1/otp" "/v1/claim"}` (khớp đúng chuỗi) nên **chưa từng khớp** endpoint thật; sửa thành 4 đường dẫn chính xác `/v1/otp/send`, `/v1/otp/verify`, `/v1/claims/redeem`, `/v1/magic/redeem`, giới hạn **50/10s/IP** (trước 5). `GET /v1/checkout/:id/claim` không thuộc rule. Staging (B19) không có rule này | Người gọi là backend app (ít IP, nhiều user): 5/10s chặn cả app. Chống dò OTP nằm ở core (3 mã/giờ/email, 5 lần/mã). `in {}` dùng được ở mọi gói, không cần hàm `starts_with`. Endpoint claim của trình duyệt được SDK poll và id là ULID khó đoán |
| E13 | Web2web: "API trả `return_url?ikf_ml=<magic_token>`" | `GET …/claim` của app `web` tạo **một magic link mới mỗi lần gọi** khi transaction của checkout đã `completed`; app `web` không có claim token | Như E1, token gốc không hiện lại được; magic link sống 15 phút, dùng một lần nên tạo mới là an toàn |
| E14 | Lịch retry `[1m … 24h]`, "Retry tới 24 giờ" | 7 khoảng → 8 lần gửi, lần thứ 8 lỗi thì `dead` (tổng ≈ 44,6 giờ). Resend đặt `attempts = 0` | Đọc "24 giờ" là khoảng cuối; resend giữ `attempts` cũ thì lỗi một lần là `dead` ngay |
| E15 | Alarm "throttle qua Redis như billing" | Dùng lại nguyên `createAlarm/redisThrottle/snsPublisher` của billing (không sửa): kind `webhook_dead:<app>` (1 lần/15 phút/app), `claim_email_failed`; subject vẫn bắt đầu `ikf billing: ` | Không sửa code billing chỉ để đổi tiền tố subject |
| E16 | — | Code billing chỉ bị sửa ở chỗ spec bắt buộc: 004 `ALTER` `funnels`, `funnel_prices`, `customers`; `billing/prices.js` + `http/prices.js` thêm `entitlement_key`; `http/funnels.js` nhận `app_id` (`pixel_id` thôi bắt buộc). Test cũ được sửa theo: `prices.test.js` (core, CLI), `funnel.test.js` (CLI), `paid.test.js` (SDK, thêm 1 fetch claim), `config.test.js`, `migrate.test.js`, `helpers/db.js` | Ghi rõ để reviewer biết phần nào chạm vào billing |
| E17 | Demo local: backend app giả trong `npm run demo` | Không làm trong plan này (chuyển sang "Theo sau") | `npm run demo` nằm ở nhánh `feat/local-demo`, không xếp chồng lên `feat/billing-paddle` |
| E18 | OTP "chỉ gửi khi email có `customers` với ít nhất một quyền trong app" | Tra `lower(btrim(customers.email))` (index mới), cần ≥ 1 dòng `entitlements` của app (active hay không); nhiều khách cùng email → khách mới nhất. Lệnh SES **không được await** trong request | Trả lời không chờ SES nên thời gian phản hồi không lộ email nào là người mua (Review Focus 3) |
| E19 | — | Identity bật khi có `claim-token-key` **và** `MAIL_FROM` (env đã có từ plan infra); thiếu thì log `identity disabled, missing: …`, outbox chờ (`published_at` NULL) | Giống cách billing tự tắt khi thiếu secret |
| E20 | `funnels.app_id` | Giữ cột cũ `funnels.app TEXT` (từ 001, không code nào dùng) nguyên trạng | Không phá dữ liệu cũ; FK mới là `app_id` đúng tên spec |
| E21 | Payload webhook theo thứ tự khóa trong spec | Payload lưu `JSONB`, nên thứ tự khóa trên dây là thứ tự của Postgres; chữ ký ký đúng byte đã gửi | Tài liệu tích hợp yêu cầu kiểm chữ ký trên body thô, không phụ thuộc thứ tự khóa |

## Global Constraints

- Code trong repo `ikf-platform`, nhánh `feat/entitlement-identity`, worktree `/Users/daothinh/ikf-platform-entitlement`. HTML funnel **không sửa**. Không sửa code billing ngoài bảng E16.
- **Không làm hỏng funnel**: mọi đường mới trong SDK bọc `try/catch`; lỗi claim chỉ dừng poll. Bundle SDK ≤ **8192** byte gzip (test có sẵn) — sau Task 10 là **8123**.
- **Bí mật chỉ lưu hash**: API key app (`ikfa_` + 43 base64url), claim token, magic token, mã OTP: chỉ `sha256` (OTP: `sha256(email_hash + ":" + code)`). Bản gốc hiện một lần (tạo app, email, `GET …/claim`). Webhook secret (`whsec_` + 43) ở Secrets Manager `ikf/<env>/app-webhook/<app_id>`, đọc khi gửi, cache **10 phút**.
- **Email**: chỉ ở `customers.email`. Log dùng `email_hash = sha256(lower(trim(email)))`. Link claim, payload webhook, URL không có email. Tra khách bằng `POST` body (E10).
- **So sánh hằng thời gian** cho token, mã, chữ ký (`timingSafeEqual`); token tra theo hash.
- **Claim**: dùng một lần, **7 ngày**, một token mỗi checkout (`claim_tokens.checkout_id` unique), token dẫn xuất (E1). `app_link = <adjust_tracker_url>?deep_link=<urlencode("<scheme>://claim?t=<token>")>` (giữ query sẵn có của tracker). Magic link **15 phút**. OTP: 6 chữ số, **10 phút**, **5** lần sai/mã, **3** mã/giờ/(email_hash, app), `send` luôn `200 {}`.
- **Liên kết**: tối đa **3** link hoạt động mỗi (khách, app); link thứ 4 thu hồi link cũ nhất (`link.revoked`, `entitlements: []`). User đã gắn khách khác → `409 app_user_linked_elsewhere`. Khóa hàng `customers` (`FOR UPDATE`) tuần tự hóa recompute và link của cùng khách.
- **Lỗi API**: `404 claim_not_found` (không có / app khác), `409 claim_used` (cùng user gọi lại → `200` idempotent), `410 claim_expired`; `magic_*` tương tự; `401 otp_invalid`, `429 otp_locked`; `401 unauthorized` (key sai/hết hạn, key cũ còn **24 giờ** sau rotate).
- **Quyền** (`computeEntitlements`, thuần): `active|trialing|past_due` → active khi `now < cpe + 3 ngày` (E6); `canceled` → active khi `now < cpe`; `paused`/khác → off; refund/chargeback payment mới nhất → off (E7). One-time → active trừ khi bị refund/chargeback, `expires_at = NULL`. Nhiều nguồn: active nếu một nguồn active, hạn xa nhất, NULL = vĩnh viễn.
- **`entitlement-sync`**: mỗi **2s**, ≤ **100** dòng outbox `published_at IS NULL` theo `id`, `FOR UPDATE SKIP LOCKED`; recompute từ đầu ⇒ chạy lại/trùng không sinh delivery. Quét hết hạn mỗi **5 phút** (≤ 200 khách/lượt). Email claim sau commit, ≤ 3 lần.
- **Webhook**: `POST <webhook_url>`, `Content-Type: application/json`, `Ikf-Event-Id: <ulid>`, `Ikf-Signature: t=<unix>,v1=<hex HMAC-SHA256("<t>.<rawBody>", secret)>`; payload `{id, type, created_at, app_id, app_user_id, customer_ref, entitlements[]}` — luôn **toàn bộ** quyền của user trong app. Timeout **10s**, 2xx = delivered, 3xx/4xx/5xx/timeout = lỗi; lịch `[1m, 5m, 30m, 2h, 6h, 12h, 24h]` rồi `dead` + alarm `webhook_dead:<app>` (≤ 1/15 phút/app). Mỗi tick ≤ 20 delivery, chỉ delivery `pending` cũ nhất của mỗi `(app_id, app_user_id)`; `dead` không chặn.
- **CORS** `GET /v1/checkout/:id/claim`: như `/v1/checkout` (origin https của domain `active` hoặc preview host).
- **Rate limit Cloudflare** (prod, `ratelimit_full`): `/v1/otp/send`, `/v1/otp/verify`, `/v1/claims/redeem`, `/v1/magic/redeem` **50 / 10s / IP** (E12).
- **Môi trường**: secret mới `claim-token-key` (giá trị nhập tay). `MAIL_FROM = no-reply@mail.<zone>` đã có trong task env. Không giá trị secret trong Terraform hay git.

## Review Focus

1. **Outbox trùng / chạy lại sinh webhook thừa** (worker crash, Paddle gửi lại, hai task ECS cùng chạy, đặt lại `published_at`). Test: Task 5 `Review Focus 1: replaying the whole outbox, a duplicate webhook and two racing workers add no webhook`, `a crash before published_at rolls the whole batch back; the rerun writes everything once`, `claim token: one per checkout …` (email gửi đúng 1 lần sau replay).
2. **Claim token dùng lại hoặc dùng chéo app** (user thứ hai, app khác, hai request đua). Test: Task 6 `Review Focus 2: a claim token is single use, bound to its app; a retry by the same user is idempotent`, `two users racing for one token: exactly one wins`, `409 app_user_linked_elsewhere; the token stays unused`; magic link: `web2web: … single use, 15 minutes, app bound`.
3. **Dò email qua OTP send** (nội dung, header hay thời gian trả lời khác nhau giữa người mua và người lạ). Test: Task 7 `Review Focus 3: a stranger, or a buyer without entitlements in this app, gets the same 200 {} and no email`, `Review Focus 3: the reply does not wait for SES (a hanging send still answers at once)`, `SES failure is logged with email_hash only, never the email`.
4. **Thứ tự webhook theo user / delivery chết chặn hàng** (và gửi đôi khi nhiều sender). Test: Task 8 `Review Focus 4: per user in order; a failing delivery holds back only that user; a dead one stops blocking`, `two senders at once never POST a delivery twice nor a user out of order`.
5. **Hết ân hạn mà không có event nào** (hủy hết kỳ, past_due quá 3 ngày, mất webhook gia hạn) không được tính lại. Test: Task 5 `cancel: premium stays until the period ends; the sweep turns it off with no event, then converges`; Task 2 các dòng `past_due after grace`, `active, period ended 4 days ago: grace over`, `canceled, period over (no grace)`.

## File Structure (repo `ikf-platform`, phần mới/sửa)

```
ikf-platform/
├── services/core-api/
│   ├── package.json                              # SỬA: @aws-sdk/client-sesv2
│   ├── migrations/004_entitlements.sql           # MỚI
│   ├── src/app.js, src/config.js, src/server.js  # SỬA: đăng ký route identity, config identity, chạy 2 worker
│   ├── src/billing/prices.js                     # SỬA (E16): entitlement_key
│   ├── src/http/{funnels,prices}.js              # SỬA: app_id, entitlement_key
│   ├── src/http/{apps,identity,claim}.js         # MỚI: admin apps/webhooks/customers, API backend app, GET claim (CORS)
│   ├── src/identity/
│   │   ├── compute.js        # computeEntitlements (thuần)
│   │   ├── tokens.js         # sha256, safeEqual, emailHash, API key, claimTokenFor (HMAC)
│   │   ├── apps.js           # createApp, listApps, rotateKey, appForKey, requireApp, setFunnelApp
│   │   ├── entitlements.js   # loadSources, recompute, entitlementsOf, customerRef, addDelivery, lockCustomer
│   │   ├── claims.js         # appLinkFor, createClaimForCheckout
│   │   ├── sync.js           # syncOutbox, sweepExpired, sendClaimEmails, startEntitlementSync
│   │   ├── link.js           # withTx, link, linkView, redeemClaim, redeemMagic, userEntitlements, claimForCheckout
│   │   ├── otp.js            # sendOtp, verifyOtp, customerForEmail
│   │   ├── webhooks.js       # signPayload, verifySignature, secretCache, sendDue, startWebhookSender, list/resend
│   │   ├── customers.js      # customerReport
│   │   └── setup.js          # secretsManagerStore, sesMailer, identityDeps
│   └── test/{entitlements-schema,compute,apps,funnel-app,entitlement-sync,claims,otp,webhooks,identity-setup,docs-vector}.test.js
│       test/helpers/identity.js (mới); sửa test/{migrate,prices,config}.test.js, test/helpers/db.js
├── packages/sdk/src/{checkout,index}.js          # SỬA: claim + attach; test/claim.test.js (mới), test/paid.test.js (sửa)
├── packages/cli/src/{main,api}.js                # SỬA; test/app.test.js (mới), test/{prices,funnel}.test.js (sửa)
├── infra/modules/edge/{main,variables}.tf + tests       # SỬA: 4 đường dẫn identity, 50/10s
├── infra/stack/main.tf + tests                   # SỬA: claim-token-key, IAM AppWebhookSecrets
├── .github/workflows/core-api.yml                # SỬA: chạy khi docs/integration đổi (test vector)
└── docs/integration/app-backend.md, docs/runbooks/entitlement-identity.md   # MỚI
```

---

### Task 0: Chuẩn bị đầu vào (thủ công, không có code)

Ai làm: Tech Lead + team mobile của app pilot. Task 1–12 làm được ngay; "Theo sau" (staging) cần các mục này.

- [ ] **Step 1: App pilot.** Chọn app pilot (ví dụ Starlyn). Lấy từ team mobile/backend: Adjust tracker URL (`https://app.adjust.com/<token>` hoặc link `*.go.link`), deep-link scheme (`starlyn`), URL webhook https của backend app (staging + prod).
- [ ] **Step 2: Adjust.** Xác nhận tracker chuyển `deep_link` thành deferred deep link khi cài mới (với link `go.link` có thể cần `adj_deep_link`; nếu vậy báo lại để đổi tên tham số trong `appLinkFor`).
- [ ] **Step 3: SES production access** cho region `us-east-1` (tài khoản SES mới ở sandbox chỉ gửi tới địa chỉ đã verify).
- [ ] **Step 4: Gói zone.** Prod giữ ≥ 3 rule rate limit (B19); staging không có rule identity.
- [ ] **Step 5:** Gửi `docs/integration/app-backend.md` (Task 12) cho team backend app sớm để họ làm song song.

---

### Task 1: Nhánh + worktree mới; migration `004_entitlements.sql`

**Files:**
- Create: `services/core-api/migrations/004_entitlements.sql`
- Modify: —
- Test: `services/core-api/test/entitlements-schema.test.js`, `services/core-api/test/helpers/db.js`, `services/core-api/test/migrate.test.js`

**Interfaces:**
- Consumes: bảng billing `funnels`, `funnel_prices`, `customers`, `checkouts`, `transactions`, `subscriptions`, `outbox` (`003_billing.sql`).
- Produces (dùng ở mọi task sau): bảng `apps`, `entitlements`, `app_links` (unique một phần, E4), `claim_tokens` (+ `email_attempts`, `emailed_at`, E2), `otp_codes`, `magic_links`, `webhook_deliveries`; cột `funnels.app_id`, `funnel_prices.entitlement_key` (mặc định `premium`), `customers.ref` (E3); `resetDb` xóa cả bảng mới.

- [ ] **Step 1: Tạo nhánh + worktree (ghi lại SHA tip billing)**

```bash
git -C /Users/daothinh/ikf-platform rev-parse feat/billing-paddle
# đã kiểm với ffb2d21761a9c5b725bb417470b857e0f4808564; khác thì xem ghi chú ở đầu plan
git -C /Users/daothinh/ikf-platform worktree add -b feat/entitlement-identity /Users/daothinh/ikf-platform-entitlement feat/billing-paddle
cd /Users/daothinh/ikf-platform-entitlement
npm ci
```

Không `checkout` trong `/Users/daothinh/ikf-platform-billing`; nhánh billing đang được dùng ở đó, worktree mới chỉ đọc ref của nó.

- [ ] **Step 2: Chạy mốc ban đầu**

```bash
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock
npm test -w @ikf/core-api -w @ikf/sdk -w @ikf/cli -w @ikf/edge-router 2>&1 | grep -E "Test Files|Tests  "
node packages/sdk/scripts/build.mjs
```

Expected (tại `ffb2d21`): core-api `21 passed (21)` / `206 passed (206)`, sdk `10` / `146`, cli `11` / `99`, edge-router `6` / `101`; `ikf sdk 3b1ab03df207: 7828 bytes gzip`.

- [ ] **Step 3: Viết test fail**

Schema test mới, và hai file test cũ phải biết các bảng mới (`migrate.test.js` liệt kê bảng; `resetDb` truncate chúng).

`services/core-api/test/entitlements-schema.test.js` (tạo mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';

const EV = '01JA0000000000000000000009';

describe('004_entitlements schema', () => {
  let db;
  let customerId;
  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    customerId = (await db.pool.query("INSERT INTO customers (paddle_customer_id, email) VALUES ('ctm_1', 'a@b.co') RETURNING id")).rows[0].id;
    await db.pool.query(
      `INSERT INTO apps (id, name, kind, adjust_tracker_url, deeplink_scheme, webhook_url, api_key_hash)
       VALUES ('starlyn', 'Starlyn', 'app', 'https://app.adjust.com/abc', 'starlyn', 'https://be.example/hook', 'h1')`,
    );
  });

  const app = (id, kind, extra = {}) =>
    db.pool.query(
      'INSERT INTO apps (id, name, kind, adjust_tracker_url, deeplink_scheme, return_url, api_key_hash) VALUES ($1, $1, $2, $3, $4, $5, $6)',
      [id, kind, extra.adjust ?? null, extra.scheme ?? null, extra.ret ?? null, `k-${id}-${Math.random()}`],
    );

  it('apps: id format, kind, and the fields each kind needs', async () => {
    await app('tarot-web', 'web', { ret: 'https://tarot.example/welcome' });
    await expect(app('Bad_Id', 'web', { ret: 'https://x' })).rejects.toThrow(/apps_id_check/);
    await expect(app('kiosk', 'tv', { ret: 'https://x' })).rejects.toThrow(/apps_kind_check/);
    await expect(app('noscheme', 'app', { adjust: 'https://app.adjust.com/x' })).rejects.toThrow(/apps_kind_fields_check/);
    await expect(app('noreturn', 'web')).rejects.toThrow(/apps_kind_fields_check/);
    await expect(app('badscheme', 'app', { adjust: 'https://a', scheme: 'Star lyn' })).rejects.toThrow(/apps_deeplink_scheme_check/);
  });

  it('funnels get app_id (FK), funnel_prices get entitlement_key (default premium, checked)', async () => {
    const f = (await db.pool.query("INSERT INTO funnels (slug, created_by, app_id) VALUES ('witch-power', 't', 'starlyn') RETURNING id")).rows[0].id;
    await expect(db.pool.query("INSERT INTO funnels (slug, created_by, app_id) VALUES ('other', 't', 'nope')")).rejects.toThrow(/funnels_app_id_fkey/);
    await db.pool.query("INSERT INTO funnel_prices (funnel_id, plan_key, paddle_price_id, kind, updated_by) VALUES ($1, '1w', 'pri_1', 'recurring', 't')", [f]);
    const { rows } = await db.pool.query('SELECT entitlement_key FROM funnel_prices WHERE funnel_id = $1', [f]);
    expect(rows[0].entitlement_key).toBe('premium');
    await expect(
      db.pool.query("INSERT INTO funnel_prices (funnel_id, plan_key, paddle_price_id, kind, updated_by, entitlement_key) VALUES ($1, 'addon', 'pri_2', 'one_time', 't', 'Tarot 2027')", [f]),
    ).rejects.toThrow(/funnel_prices_entitlement_key_check/);
  });

  it('customers.ref is cus_<ULID> and unique', async () => {
    await db.pool.query(`UPDATE customers SET ref = 'cus_${EV}' WHERE id = $1`, [customerId]);
    await expect(db.pool.query("UPDATE customers SET ref = 'cus_1' WHERE id = $1", [customerId])).rejects.toThrow(/customers_ref_check/);
    const c2 = (await db.pool.query("INSERT INTO customers (paddle_customer_id) VALUES ('ctm_2') RETURNING id")).rows[0].id;
    await expect(db.pool.query(`UPDATE customers SET ref = 'cus_${EV}' WHERE id = $1`, [c2])).rejects.toThrow(/customers_ref_key/);
  });

  it('app_links: one ACTIVE link per (app, app_user_id); a revoked one can be linked again', async () => {
    const link = () => db.pool.query("INSERT INTO app_links (customer_id, app_id, app_user_id) VALUES ($1, 'starlyn', 'u1') RETURNING id", [customerId]);
    const first = (await link()).rows[0].id;
    await expect(link()).rejects.toThrow(/app_links_active_user/);
    await db.pool.query('UPDATE app_links SET revoked_at = now() WHERE id = $1', [first]);
    await link();
    await expect(db.pool.query("INSERT INTO app_links (customer_id, app_id, app_user_id) VALUES ($1, 'starlyn', '')", [customerId])).rejects.toThrow(/app_links_app_user_id_check/);
  });

  it('claim_tokens: at most one per checkout; NULL checkout allowed many times', async () => {
    const claim = (hash, ck) =>
      db.pool.query("INSERT INTO claim_tokens (token_hash, customer_id, app_id, checkout_id, expires_at) VALUES ($1, $2, 'starlyn', $3, now() + interval '7 days')", [hash, customerId, ck]);
    await claim('h1', EV);
    await expect(claim('h2', EV)).rejects.toThrow(/claim_tokens_checkout_id_key/);
    await claim('h3', null);
    await claim('h4', null);
  });

  it('entitlements and webhook_deliveries check their enums; event ids are ULIDs and unique', async () => {
    await expect(
      db.pool.query("INSERT INTO entitlements (customer_id, app_id, key, active, source, source_id) VALUES ($1, 'starlyn', 'premium', true, 'gift', 'x')", [customerId]),
    ).rejects.toThrow(/entitlements_source_check/);
    const delivery = (eventId, type = 'link.created', status = 'pending') =>
      db.pool.query("INSERT INTO webhook_deliveries (event_id, app_id, app_user_id, type, payload, status) VALUES ($1, 'starlyn', 'u1', $2, '{}', $3)", [eventId, type, status]);
    await delivery(EV);
    await expect(delivery(EV)).rejects.toThrow(/webhook_deliveries_event_id_key/);
    await expect(delivery('evt_1')).rejects.toThrow(/webhook_deliveries_event_id_check/);
    await expect(delivery('01JA0000000000000000000010', 'user.deleted')).rejects.toThrow(/webhook_deliveries_type_check/);
    await expect(delivery('01JA0000000000000000000011', 'link.created', 'failed')).rejects.toThrow(/webhook_deliveries_status_check/);
  });
});
```

`services/core-api/test/helpers/db.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/test/helpers/db.js b/services/core-api/test/helpers/db.js
index d1dfa7b..edd0ebd 100644
--- a/services/core-api/test/helpers/db.js
+++ b/services/core-api/test/helpers/db.js
@@ -18,6 +18,7 @@ export async function startDb({ migrate = true } = {}) {
 export async function resetDb(pool) {
   await pool.query(
     `TRUNCATE route_events, routes, host_revs, versions, funnels, domains, api_tokens,
-              funnel_prices, checkouts, transactions, subscriptions, customers, webhook_inbox, outbox RESTART IDENTITY CASCADE`,
+              funnel_prices, checkouts, transactions, subscriptions, customers, webhook_inbox, outbox,
+              apps, entitlements, app_links, claim_tokens, otp_codes, magic_links, webhook_deliveries RESTART IDENTITY CASCADE`,
   );
 }
PATCH
```

`services/core-api/test/migrate.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/test/migrate.test.js b/services/core-api/test/migrate.test.js
index 65e7199..3cec7f4 100644
--- a/services/core-api/test/migrate.test.js
+++ b/services/core-api/test/migrate.test.js
@@ -10,14 +10,15 @@ describe('migrate', () => {
   afterAll(() => db.stop());
 
   it('applies the publisher schema once and is idempotent', async () => {
-    expect(await migrate(db.pool)).toEqual(['001_publisher.sql', '002_funnel_pixel.sql', '003_billing.sql']);
+    expect(await migrate(db.pool)).toEqual(['001_publisher.sql', '002_funnel_pixel.sql', '003_billing.sql', '004_entitlements.sql']);
     expect(await migrate(db.pool)).toEqual([]);
     const { rows } = await db.pool.query(
       "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY 1",
     );
     expect(rows.map((r) => r.table_name)).toEqual([
-      'api_tokens', 'checkouts', 'customers', 'domains', 'funnel_prices', 'funnels', 'host_revs', 'outbox',
-      'route_events', 'routes', 'schema_migrations', 'subscriptions', 'transactions', 'versions', 'webhook_inbox',
+      'api_tokens', 'app_links', 'apps', 'checkouts', 'claim_tokens', 'customers', 'domains', 'entitlements',
+      'funnel_prices', 'funnels', 'host_revs', 'magic_links', 'otp_codes', 'outbox', 'route_events', 'routes',
+      'schema_migrations', 'subscriptions', 'transactions', 'versions', 'webhook_deliveries', 'webhook_inbox',
     ]);
   });
 
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api
```

Expected: FAIL — `relation "apps" does not exist` ở `resetDb`: `Test Files  13 failed | 9 passed (22)`, `Tests  118 failed | 94 passed (212)`.

- [ ] **Step 5: Implement**

`services/core-api/migrations/004_entitlements.sql` (tạo mới):

```sql
-- Apps that receive entitlements. Keys and secrets are never stored in clear: the API key as sha256,
-- the webhook secret in Secrets Manager (ikf/<env>/app-webhook/<id>).
CREATE TABLE apps (
  id                  TEXT PRIMARY KEY CONSTRAINT apps_id_check CHECK (id ~ '^[a-z0-9][a-z0-9-]{1,30}$'),
  name                TEXT NOT NULL,
  kind                TEXT NOT NULL CONSTRAINT apps_kind_check CHECK (kind IN ('app', 'web')),
  adjust_tracker_url  TEXT NULL,
  deeplink_scheme     TEXT NULL CONSTRAINT apps_deeplink_scheme_check CHECK (deeplink_scheme ~ '^[a-z][a-z0-9+.-]{1,30}$'),
  return_url          TEXT NULL,
  webhook_url         TEXT NULL,
  api_key_hash        TEXT NOT NULL UNIQUE,
  prev_api_key_hash   TEXT NULL UNIQUE,
  prev_key_expires_at TIMESTAMPTZ NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT apps_kind_fields_check CHECK (
    (kind = 'app' AND adjust_tracker_url IS NOT NULL AND deeplink_scheme IS NOT NULL)
    OR (kind = 'web' AND return_url IS NOT NULL)
  )
);

ALTER TABLE funnels ADD COLUMN app_id TEXT NULL REFERENCES apps (id);
ALTER TABLE funnel_prices
  ADD COLUMN entitlement_key TEXT NOT NULL DEFAULT 'premium'
    CONSTRAINT funnel_prices_entitlement_key_check CHECK (entitlement_key ~ '^[a-z0-9_]{1,40}$');

-- customer_ref (cus_<ULID>): stable, reveals nothing; assigned on first use.
ALTER TABLE customers
  ADD COLUMN ref TEXT NULL UNIQUE CONSTRAINT customers_ref_check CHECK (ref ~ '^cus_[0-7][0-9A-HJKMNP-TV-Z]{25}$');
-- OTP looks a buyer up by email (lowercased, trimmed).
CREATE INDEX customers_by_email ON customers (lower(btrim(email)));

CREATE TABLE entitlements (
  customer_id BIGINT NOT NULL REFERENCES customers (id),
  app_id      TEXT NOT NULL REFERENCES apps (id),
  key         TEXT NOT NULL,
  active      BOOLEAN NOT NULL,
  expires_at  TIMESTAMPTZ NULL,
  source      TEXT NOT NULL CONSTRAINT entitlements_source_check CHECK (source IN ('subscription', 'one_time')),
  source_id   TEXT NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (customer_id, app_id, key)
);
CREATE INDEX entitlements_expiring ON entitlements (expires_at) WHERE active;

-- One active link per (app, app_user_id); revoked rows stay as history (E4).
CREATE TABLE app_links (
  id          BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customers (id),
  app_id      TEXT NOT NULL REFERENCES apps (id),
  app_user_id TEXT NOT NULL CONSTRAINT app_links_app_user_id_check CHECK (length(app_user_id) BETWEEN 1 AND 128),
  linked_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at  TIMESTAMPTZ NULL
);
CREATE UNIQUE INDEX app_links_active_user ON app_links (app_id, app_user_id) WHERE revoked_at IS NULL;
CREATE INDEX app_links_by_customer ON app_links (customer_id, app_id) WHERE revoked_at IS NULL;

CREATE TABLE claim_tokens (
  token_hash     TEXT PRIMARY KEY,
  customer_id    BIGINT NOT NULL REFERENCES customers (id),
  app_id         TEXT NOT NULL REFERENCES apps (id),
  checkout_id    TEXT NULL UNIQUE,
  expires_at     TIMESTAMPTZ NOT NULL,
  used_at        TIMESTAMPTZ NULL,
  email_attempts INT NOT NULL DEFAULT 0,
  emailed_at     TIMESTAMPTZ NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX claim_tokens_unsent ON claim_tokens (created_at) WHERE emailed_at IS NULL;

CREATE TABLE otp_codes (
  id         BIGSERIAL PRIMARY KEY,
  email_hash TEXT NOT NULL,
  app_id     TEXT NOT NULL REFERENCES apps (id),
  code_hash  TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts   INT NOT NULL DEFAULT 0,
  used_at    TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX otp_codes_by_email ON otp_codes (email_hash, app_id, id DESC);

CREATE TABLE magic_links (
  token_hash  TEXT PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customers (id),
  app_id      TEXT NOT NULL REFERENCES apps (id),
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE webhook_deliveries (
  id              BIGSERIAL PRIMARY KEY,
  event_id        TEXT NOT NULL UNIQUE CONSTRAINT webhook_deliveries_event_id_check CHECK (event_id ~ '^[0-7][0-9A-HJKMNP-TV-Z]{25}$'),
  app_id          TEXT NOT NULL REFERENCES apps (id),
  app_user_id     TEXT NOT NULL,
  type            TEXT NOT NULL CONSTRAINT webhook_deliveries_type_check CHECK (type IN ('entitlement.updated', 'link.created', 'link.revoked')),
  payload         JSONB NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CONSTRAINT webhook_deliveries_status_check CHECK (status IN ('pending', 'delivered', 'dead')),
  attempts        INT NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_error      TEXT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at    TIMESTAMPTZ NULL
);
CREATE INDEX webhook_deliveries_due ON webhook_deliveries (next_attempt_at, id) WHERE status = 'pending';
CREATE INDEX webhook_deliveries_by_user ON webhook_deliveries (app_id, app_user_id, id) WHERE status = 'pending';
CREATE INDEX webhook_deliveries_by_app ON webhook_deliveries (app_id, id DESC);
```

- [ ] **Step 6: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api
```

Expected: `Test Files  22 passed (22)`, `Tests  212 passed (212)`.

- [ ] **Step 7: Commit**

```bash
git add services/core-api
git commit -m "feat(core-api): 004_entitlements migration (apps, entitlements, links, claims, OTP, magic links, webhook deliveries)"
```

---

### Task 2: `computeEntitlements` — hàm thuần + bảng kịch bản

**Files:**
- Create: `services/core-api/src/identity/compute.js`
- Test: `services/core-api/test/compute.test.js`

**Interfaces:**
- Produces (`src/identity/compute.js`, dùng ở Task 5):
  - `GRACE_MS = 3 ngày`.
  - `computeEntitlements({subscriptions: [{id, app_id, key, status, current_period_end: Date|string|null, reversed}], oneTimes: [{id, app_id, key, reversed}], now: Date}) → [{app_id, key, active, expires_at: Date|null, source: 'subscription'|'one_time', source_id}]`, sắp theo `app_id`, `key`. Nguồn thiếu `app_id` hoặc `key` bị bỏ qua. Không đổi input.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/compute.test.js` (tạo mới):

```js
import { describe, it, expect } from 'vitest';
import { computeEntitlements, GRACE_MS } from '../src/identity/compute.js';

const NOW = new Date('2026-10-09T10:00:00Z');
const H = 3600_000;
const D = 24 * H;
const at = (ms) => new Date(NOW.getTime() + ms);
const sub = (o = {}) => ({ id: 'sub_1', app_id: 'starlyn', key: 'premium', status: 'active', current_period_end: at(7 * D), reversed: false, ...o });
const one = (o = {}) => ({ id: 'txn_1', app_id: 'starlyn', key: 'tarot_2027', reversed: false, ...o });
const ent = (o) => ({ app_id: 'starlyn', key: 'premium', source: 'subscription', source_id: 'sub_1', ...o });
const run = (subscriptions = [], oneTimes = []) => computeEntitlements({ subscriptions, oneTimes, now: NOW });

describe('computeEntitlements', () => {
  it('grace is 3 days', () => expect(GRACE_MS).toBe(3 * D));

  it.each([
    ['active', sub(), ent({ active: true, expires_at: at(10 * D) })],
    ['trialing', sub({ status: 'trialing', current_period_end: at(3 * D) }), ent({ active: true, expires_at: at(6 * D) })],
    ['active, period ended 2 days ago (renewal webhook late): still in grace', sub({ current_period_end: at(-2 * D) }), ent({ active: true, expires_at: at(D) })],
    ['active, period ended 4 days ago: grace over', sub({ current_period_end: at(-4 * D) }), ent({ active: false, expires_at: at(-D) })],
    ['active without a period: no end', sub({ current_period_end: null }), ent({ active: true, expires_at: null })],
    ['past_due inside grace', sub({ status: 'past_due', current_period_end: at(-1 * D) }), ent({ active: true, expires_at: at(2 * D) })],
    ['past_due after grace', sub({ status: 'past_due', current_period_end: at(-3 * D - 1) }), ent({ active: false, expires_at: at(-1) })],
    ['past_due exactly at the grace end is off', sub({ status: 'past_due', current_period_end: at(-3 * D) }), ent({ active: false, expires_at: NOW })],
    ['canceled, period still running', sub({ status: 'canceled', current_period_end: at(H) }), ent({ active: true, expires_at: at(H) })],
    ['canceled, period over (no grace)', sub({ status: 'canceled', current_period_end: at(-H) }), ent({ active: false, expires_at: at(-H) })],
    ['canceled without a period', sub({ status: 'canceled', current_period_end: null }), ent({ active: false, expires_at: null })],
    ['paused', sub({ status: 'paused' }), ent({ active: false, expires_at: null })],
    ['unknown status is off', sub({ status: 'mystery' }), ent({ active: false, expires_at: null })],
    ['latest payment refunded or charged back', sub({ reversed: true }), ent({ active: false, expires_at: at(10 * D) })],
    ['period end given as an ISO string', sub({ current_period_end: '2026-10-16T10:00:00.000Z' }), ent({ active: true, expires_at: at(10 * D) })],
  ])('subscription: %s', (_, s, expected) => {
    expect(run([s])).toEqual([expected]);
  });

  it.each([
    ['bought', one(), { active: true }],
    ['refunded', one({ reversed: true }), { active: false }],
    ['charged back', one({ reversed: true }), { active: false }],
  ])('one-time: %s (never expires)', (_, o, { active }) => {
    expect(run([], [o])).toEqual([{ app_id: 'starlyn', key: 'tarot_2027', active, expires_at: null, source: 'one_time', source_id: 'txn_1' }]);
  });

  it('several sources for one (app, key): active if any is, the farthest end wins, NULL means forever', () => {
    const lapsed = sub({ id: 'sub_old', status: 'canceled', current_period_end: at(-D) });
    const running = sub({ id: 'sub_new', current_period_end: at(2 * D) });
    const longer = sub({ id: 'sub_long', status: 'canceled', current_period_end: at(20 * D) });
    expect(run([lapsed, running])).toEqual([ent({ active: true, expires_at: at(5 * D), source_id: 'sub_new' })]);
    expect(run([running, longer])).toEqual([ent({ active: true, expires_at: at(20 * D), source_id: 'sub_long' })]);
    const lifetime = one({ id: 'txn_life', key: 'premium' });
    expect(run([running], [lifetime])).toEqual([ent({ active: true, expires_at: null, source: 'one_time', source_id: 'txn_life' })]);
    expect(run([running], [one({ id: 'txn_life', key: 'premium', reversed: true })])).toEqual([ent({ active: true, expires_at: at(5 * D), source_id: 'sub_new' })]);
  });

  it('all sources off: inactive, reporting the latest end any of them had', () => {
    const a = sub({ id: 'sub_a', status: 'canceled', current_period_end: at(-5 * D) });
    const b = sub({ id: 'sub_b', status: 'canceled', current_period_end: at(-D) });
    expect(run([a, b])).toEqual([ent({ active: false, expires_at: at(-D), source_id: 'sub_b' })]);
  });

  it('keeps apps and keys apart, sorted by app then key; sources without an app or key are ignored', () => {
    const out = run(
      [sub({ app_id: 'zodiac' }), sub({ id: 'sub_2' }), sub({ id: 'sub_x', app_id: null }), sub({ id: 'sub_y', key: null })],
      [one(), one({ id: 'txn_2', app_id: 'zodiac', key: 'addon' })],
    );
    expect(out.map((e) => [e.app_id, e.key, e.source_id])).toEqual([
      ['starlyn', 'premium', 'sub_2'],
      ['starlyn', 'tarot_2027', 'txn_1'],
      ['zodiac', 'addon', 'txn_2'],
      ['zodiac', 'premium', 'sub_1'],
    ]);
  });

  it('nothing bought: no entitlements; the input is not mutated', () => {
    expect(run()).toEqual([]);
    const input = [sub()];
    const copy = structuredClone(input);
    run(input);
    expect(input).toEqual(copy);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/compute.test.js
```

Expected: FAIL — `Cannot find module '../src/identity/compute.js'` (`Test Files  1 failed (1)`, `Tests  no tests`).

- [ ] **Step 3: Implement**

`services/core-api/src/identity/compute.js` (tạo mới):

```js
export const GRACE_MS = 3 * 24 * 3600_000;

const toDate = (v) => (v === null || v === undefined ? null : v instanceof Date ? new Date(v.getTime()) : new Date(v));

// One subscription → {active, expires_at} (spec §4; E6: active/trialing are bounded by the grace end too,
// so a lost renewal webhook cannot leave premium on forever and the expiry sweep always converges).
function fromSubscription(s, now) {
  const end = toDate(s.current_period_end);
  let active = false;
  let expires = null;
  if (s.status === 'active' || s.status === 'trialing' || s.status === 'past_due') {
    expires = end ? new Date(end.getTime() + GRACE_MS) : null;
    active = expires === null || now < expires;
  } else if (s.status === 'canceled') {
    expires = end;
    active = end !== null && now < end;
  }
  return { active: active && !s.reversed, expires_at: expires, source: 'subscription', source_id: s.id };
}

// Better source first: active, then never-ending, then the farthest end, then by id (stable).
function better(a, b) {
  if (a.active !== b.active) return a.active ? a : b;
  if ((a.expires_at === null) !== (b.expires_at === null)) return a.expires_at === null ? a : b;
  if (a.expires_at && b.expires_at && a.expires_at.getTime() !== b.expires_at.getTime()) {
    return a.expires_at > b.expires_at ? a : b;
  }
  return a.source_id <= b.source_id ? a : b;
}

// Pure: what a customer is entitled to right now. Inputs are already resolved to (app_id, key);
// `reversed` = refund or chargeback on the one-time payment / the subscription's latest payment.
// → [{app_id, key, active, expires_at: Date|null, source, source_id}] sorted by app_id, key.
export function computeEntitlements({ subscriptions = [], oneTimes = [], now = new Date() }) {
  const best = new Map();
  const add = (appId, key, candidate) => {
    if (!appId || !key) return;
    const id = `${appId}\u0000${key}`;
    const cur = best.get(id);
    best.set(id, { appId, key, e: cur ? better(cur.e, candidate) : candidate });
  };
  for (const s of subscriptions) add(s.app_id, s.key, fromSubscription(s, now));
  for (const t of oneTimes) {
    add(t.app_id, t.key, { active: !t.reversed, expires_at: null, source: 'one_time', source_id: t.id });
  }
  return [...best.values()]
    .sort((a, b) => (a.appId === b.appId ? (a.key < b.key ? -1 : 1) : a.appId < b.appId ? -1 : 1))
    .map(({ appId, key, e }) => ({ app_id: appId, key, active: e.active, expires_at: e.expires_at, source: e.source, source_id: e.source_id }));
}
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/compute.test.js
npm test -w @ikf/core-api
```

Expected: `compute.test.js`: `Tests  23 passed (23)`; toàn bộ core-api `Test Files  23 passed (23)`, `Tests  235 passed (235)`.

- [ ] **Step 5: Commit**

```bash
git add services/core-api
git commit -m "feat(core-api): computeEntitlements, a pure function of subscriptions and one-time payments"
```

---

### Task 3: App registry: `POST/GET /v1/apps`, `rotate-key`, API key của app

**Files:**
- Create: `services/core-api/src/http/apps.js`, `services/core-api/src/identity/apps.js`, `services/core-api/src/identity/tokens.js`
- Modify: `services/core-api/src/app.js`
- Test: `services/core-api/test/apps.test.js`, `services/core-api/test/helpers/identity.js`

**Interfaces:**
- Produces:
  - `src/identity/tokens.js`: `sha256(s)`, `randomToken(bytes=32)`, `emailHash(email)`, `safeEqual(a, b)`, `API_KEY_RE`, `TOKEN_RE` (43 base64url), `newApiKey()`, `newWebhookSecret()`, `claimTokenFor(key, checkoutId)` (E1).
  - `src/identity/apps.js`: `createApp(pool, webhookSecrets, body) → {app, api_key, webhook_secret}` (`400 invalid_app` kèm danh sách lỗi, `409 app_exists`, `503 secrets_unavailable`), `listApps(db)`, `rotateKey(pool, id) → {app, api_key}` (`404 app_not_found`), `appForKey(db, key) → {id, name, kind, adjust_tracker_url, deeplink_scheme, return_url}|null` (Task 7 thêm `name`), `requireApp(pool)` (hook `onRequest`, đặt `req.caller`, sai → `401 {"error":"unauthorized"}`).
  - `webhookSecrets` = `{get(appId) → string|null, put(appId, secret)}` (fake ở test; Secrets Manager ở Task 9).
  - HTTP (quyền `router`; `admin` qua mọi kiểm tra): `POST /v1/apps` → `201` + `cache-control: no-store`; `GET /v1/apps`; `POST /v1/apps/:id/rotate-key`. Plugin đăng ký khi có `deps.pool && deps.webhookSecrets`. `app.decorateRequest('caller', null)`.
  - Test helper `test/helpers/identity.js`: `fakeSecrets()`, `APP_BODY` (Starlyn, kind `app`), `WEB_BODY` (tarot-web, kind `web`), `seedApp(pool, secrets?, body?)`.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/apps.test.js` (tạo mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import Fastify from 'fastify';
import { startDb, resetDb } from './helpers/db.js';
import { bearer, makeApp, sha, tokenFor } from './helpers/app.js';
import { APP_BODY, WEB_BODY, fakeSecrets } from './helpers/identity.js';
import { appForKey, requireApp } from '../src/identity/apps.js';

describe('app registry: POST/GET /v1/apps, rotate-key, app API keys', () => {
  let db;
  let app;
  let secrets;
  let router;
  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    secrets = fakeSecrets();
    ({ app } = await makeApp(db.pool, { webhookSecrets: secrets }));
    router = await tokenFor(db.pool, 'router');
  });

  const create = (body = APP_BODY, token = router) =>
    app.inject({ method: 'POST', url: '/v1/apps', headers: bearer(token), payload: body });

  it('create returns the API key and webhook secret once; DB keeps only the key hash, the secret goes to the store', async () => {
    const res = await create();
    expect(res.statusCode).toBe(201);
    expect(res.headers['cache-control']).toBe('no-store');
    const out = res.json();
    expect(out.api_key).toMatch(/^ikfa_[A-Za-z0-9_-]{43}$/);
    expect(out.webhook_secret).toMatch(/^whsec_[A-Za-z0-9_-]{43}$/);
    expect(out.app).toMatchObject({ id: 'starlyn', kind: 'app', deeplink_scheme: 'starlyn', return_url: null, prev_key_expires_at: null });
    expect(secrets.values.get('starlyn')).toBe(out.webhook_secret);
    const row = (await db.pool.query('SELECT * FROM apps')).rows[0];
    expect(row.api_key_hash).toBe(sha(out.api_key));
    expect(JSON.stringify(row)).not.toContain(out.api_key);
    expect(JSON.stringify(row)).not.toContain(out.webhook_secret);

    const list = await app.inject({ method: 'GET', url: '/v1/apps', headers: bearer(router) });
    expect(list.json().apps.map((a) => a.id)).toEqual(['starlyn']);
    expect(list.body).not.toContain('ikfa_');
    expect(list.body).not.toContain('whsec_');
  });

  it('a web app needs return_url, an app needs an https Adjust tracker and a scheme', async () => {
    expect((await create(WEB_BODY)).statusCode).toBe(201);
    const bad = await create({ ...APP_BODY, id: 'zodiac', adjust_tracker_url: 'http://app.adjust.com/x', deeplink_scheme: 'Zo diac' });
    expect(bad.statusCode).toBe(400);
    expect(bad.json()).toEqual({
      error: 'invalid_app',
      detail: [{ field: 'adjust_tracker_url', reason: 'https_required' }, { field: 'deeplink_scheme', reason: 'format' }],
    });
    expect((await create({ ...WEB_BODY, id: 'w2', return_url: undefined })).json().detail).toEqual([{ field: 'return_url', reason: 'https_required' }]);
    expect((await create({ ...WEB_BODY, id: 'w3', webhook_url: 'https://u:p@x.example/h' })).json().detail).toEqual([{ field: 'webhook_url', reason: 'https_required' }]);
  });

  it('an existing id is 409 and its secret is not overwritten', async () => {
    await create();
    const before = secrets.values.get('starlyn');
    const res = await create({ ...APP_BODY, name: 'Again' });
    expect(res.statusCode).toBe(409);
    expect(res.json().error).toBe('app_exists');
    expect(secrets.values.get('starlyn')).toBe(before);
  });

  it('secret store down: 503 and no app row', async () => {
    secrets.fail();
    const res = await create();
    expect(res.statusCode).toBe(503);
    expect(res.json()).toEqual({ error: 'secrets_unavailable' });
    expect((await db.pool.query('SELECT count(*)::int AS n FROM apps')).rows[0].n).toBe(0);
  });

  it('needs the router role', async () => {
    expect((await create(APP_BODY, await tokenFor(db.pool, 'publisher'))).statusCode).toBe(403);
    expect((await app.inject({ method: 'POST', url: '/v1/apps', payload: APP_BODY })).statusCode).toBe(401);
  });

  it('rotate-key: the new key works at once, the old one for 24 hours only', async () => {
    const { api_key: oldKey } = (await create()).json();
    const res = await app.inject({ method: 'POST', url: '/v1/apps/starlyn/rotate-key', headers: bearer(router) });
    expect(res.statusCode).toBe(200);
    const { api_key: newKey, app: view } = res.json();
    expect(newKey).not.toBe(oldKey);
    const hours = (new Date(view.prev_key_expires_at) - Date.now()) / 3600_000;
    expect(hours).toBeGreaterThan(23.9);
    expect(hours).toBeLessThan(24.01);
    expect((await appForKey(db.pool, newKey)).id).toBe('starlyn');
    expect((await appForKey(db.pool, oldKey)).id).toBe('starlyn');
    await db.pool.query("UPDATE apps SET prev_key_expires_at = now() - interval '1 second'");
    expect(await appForKey(db.pool, oldKey)).toBeNull();
    expect((await app.inject({ method: 'POST', url: '/v1/apps/nope/rotate-key', headers: bearer(router) })).statusCode).toBe(404);
  });

  it('requireApp: 401 for a missing, malformed or unknown key; sets req.caller for a good one', async () => {
    const { api_key: key } = (await create()).json();
    const f = Fastify();
    f.decorateRequest('caller', null);
    f.get('/who', { onRequest: requireApp(db.pool) }, async (req) => ({ app: req.caller.id, kind: req.caller.kind }));
    const who = (authorization) => f.inject({ method: 'GET', url: '/who', headers: authorization ? { authorization } : {} });
    expect((await who(`Bearer ${key}`)).json()).toEqual({ app: 'starlyn', kind: 'app' });
    for (const h of [undefined, 'Bearer nope', `Bearer ikfa_${'A'.repeat(43)}`, key]) {
      const res = await who(h);
      expect(res.statusCode).toBe(401);
      expect(res.json()).toEqual({ error: 'unauthorized' });
    }
    await f.close();
  });
});
```

`services/core-api/test/helpers/identity.js` (tạo mới):

```js
import { createApp } from '../../src/identity/apps.js';

// In-memory per-app webhook secret store with the surface of the Secrets Manager one (Task 9).
export function fakeSecrets() {
  const values = new Map();
  let failing = false;
  return {
    values,
    gets: 0,
    fail(on = true) {
      failing = on;
    },
    async get(appId) {
      this.gets += 1;
      if (failing) throw new Error('secrets manager down');
      return values.get(appId) ?? null;
    },
    async put(appId, secret) {
      if (failing) throw new Error('secrets manager down');
      values.set(appId, secret);
    },
  };
}

export const APP_BODY = {
  id: 'starlyn',
  name: 'Starlyn',
  kind: 'app',
  adjust_tracker_url: 'https://app.adjust.com/abc123',
  deeplink_scheme: 'starlyn',
  webhook_url: 'https://be.starlyn.example/ikf/webhook',
};
export const WEB_BODY = {
  id: 'tarot-web',
  name: 'Tarot Web',
  kind: 'web',
  return_url: 'https://tarot.example/welcome',
  webhook_url: 'https://tarot.example/ikf/webhook',
};

// Creates an app through the real code path; returns {app, api_key, webhook_secret}.
export const seedApp = (pool, secrets = fakeSecrets(), body = APP_BODY) => createApp(pool, secrets, body);
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api
```

Expected: FAIL — `apps.test.js`: `Cannot find module '../../src/identity/apps.js'` (từ `helpers/identity.js`); 235 test cũ pass (`Test Files  1 failed | 23 passed (24)`).

- [ ] **Step 3: Implement**

`services/core-api/src/app.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/app.js b/services/core-api/src/app.js
index 1537f62..f7ae580 100644
--- a/services/core-api/src/app.js
+++ b/services/core-api/src/app.js
@@ -9,10 +9,12 @@ import pricesHttp from './http/prices.js';
 import checkoutHttp from './http/checkout.js';
 import webhookHttp from './http/webhook.js';
 import billingHttp from './http/billing.js';
+import appsHttp from './http/apps.js';
 
 export function buildApp({ checks = {}, timeoutMs = 1000, logger = false, deps } = {}) {
   const app = Fastify({ logger });
   app.decorateRequest('actor', null);
+  app.decorateRequest('caller', null); // the app row behind an app API key (identity routes)
 
   app.setErrorHandler((err, req, reply) => {
     if (err instanceof HttpError) {
@@ -49,6 +51,7 @@ export function buildApp({ checks = {}, timeoutMs = 1000, logger = false, deps }
   if (deps?.pool && deps?.paddle && deps?.turnstile) app.register(checkoutHttp, deps);
   if (deps?.pool && deps?.queue && deps?.webhookSecret) app.register(webhookHttp, deps);
   if (deps?.pool && deps?.paddle && deps?.queue) app.register(billingHttp, deps);
+  if (deps?.pool && deps?.webhookSecrets) app.register(appsHttp, deps);
 
   return app;
 }
PATCH
```

`services/core-api/src/http/apps.js` (tạo mới):

```js
import { requireRole } from '../auth.js';
import { createApp, listApps, rotateKey } from '../identity/apps.js';

const url = { type: 'string', minLength: 1, maxLength: 500 };
const idParams = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{1,30}$' } },
};

// App registry (spec §6), role router (admin passes every role check).
export default async function appsHttp(app, { pool, webhookSecrets }) {
  const router = requireRole(pool, 'router');

  app.post(
    '/v1/apps',
    {
      onRequest: router,
      schema: {
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['id', 'name', 'kind', 'webhook_url'],
          properties: {
            id: { type: 'string', maxLength: 31 },
            name: { type: 'string', minLength: 1, maxLength: 80 },
            kind: { type: 'string', enum: ['app', 'web'] },
            adjust_tracker_url: url,
            deeplink_scheme: { type: 'string', maxLength: 31 },
            return_url: url,
            webhook_url: url,
          },
        },
      },
    },
    async (req, reply) => {
      const out = await createApp(pool, webhookSecrets, req.body);
      reply.code(201).header('cache-control', 'no-store');
      return out;
    },
  );

  app.get('/v1/apps', { onRequest: router }, async () => listApps(pool));

  app.post('/v1/apps/:id/rotate-key', { onRequest: router, schema: { params: idParams } }, async (req, reply) => {
    reply.header('cache-control', 'no-store');
    return rotateKey(pool, req.params.id);
  });
}
```

`services/core-api/src/identity/apps.js` (tạo mới):

```js
import { HttpError } from '../errors.js';
import { API_KEY_RE, newApiKey, newWebhookSecret, sha256 } from './tokens.js';

export const APP_ID_RE = /^[a-z0-9][a-z0-9-]{1,30}$/;
export const SCHEME_RE = /^[a-z][a-z0-9+.-]{1,30}$/;
export const PREV_KEY_HOURS = 24;

const COLUMNS = 'id, name, kind, adjust_tracker_url, deeplink_scheme, return_url, webhook_url, prev_key_expires_at, created_at';

export const appView = (r) => ({
  id: r.id,
  name: r.name,
  kind: r.kind,
  adjust_tracker_url: r.adjust_tracker_url,
  deeplink_scheme: r.deeplink_scheme,
  return_url: r.return_url,
  webhook_url: r.webhook_url,
  prev_key_expires_at: r.prev_key_expires_at ? r.prev_key_expires_at.toISOString() : null,
  created_at: r.created_at.toISOString(),
});

function httpsUrl(v) {
  try {
    const u = new URL(v);
    return u.protocol === 'https:' && !u.username && !u.password;
  } catch {
    return false;
  }
}

function checkApp(b) {
  const problems = [];
  if (!APP_ID_RE.test(b.id)) problems.push({ field: 'id', reason: 'format' });
  if (!httpsUrl(b.webhook_url)) problems.push({ field: 'webhook_url', reason: 'https_required' });
  if (b.kind === 'app') {
    if (!httpsUrl(b.adjust_tracker_url)) problems.push({ field: 'adjust_tracker_url', reason: 'https_required' });
    if (!SCHEME_RE.test(b.deeplink_scheme ?? '')) problems.push({ field: 'deeplink_scheme', reason: 'format' });
  } else if (!httpsUrl(b.return_url)) {
    problems.push({ field: 'return_url', reason: 'https_required' });
  }
  if (problems.length) throw new HttpError(400, 'invalid_app', problems);
}

// Returns the API key and webhook secret once; only the key's sha256 is kept, the secret goes to
// Secrets Manager before the row exists (an app never exists without its secret).
export async function createApp(pool, webhookSecrets, b) {
  checkApp(b);
  const exists = await pool.query('SELECT 1 FROM apps WHERE id = $1', [b.id]);
  if (exists.rows.length) throw new HttpError(409, 'app_exists', { id: b.id });
  const apiKey = newApiKey();
  const secret = newWebhookSecret();
  try {
    await webhookSecrets.put(b.id, secret);
  } catch {
    throw new HttpError(503, 'secrets_unavailable');
  }
  const isApp = b.kind === 'app';
  try {
    const { rows } = await pool.query(
      `INSERT INTO apps (id, name, kind, adjust_tracker_url, deeplink_scheme, return_url, webhook_url, api_key_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING ${COLUMNS}`,
      [b.id, b.name, b.kind, isApp ? b.adjust_tracker_url : null, isApp ? b.deeplink_scheme : null,
        isApp ? null : b.return_url, b.webhook_url, sha256(apiKey)],
    );
    return { app: appView(rows[0]), api_key: apiKey, webhook_secret: secret };
  } catch (err) {
    if (err.code === '23505') throw new HttpError(409, 'app_exists', { id: b.id });
    throw err;
  }
}

export async function listApps(db) {
  const { rows } = await db.query(`SELECT ${COLUMNS} FROM apps ORDER BY id`);
  return { apps: rows.map(appView) };
}

// New key now; the old one keeps working for 24 hours (spec §6).
export async function rotateKey(pool, id) {
  const apiKey = newApiKey();
  const { rows } = await pool.query(
    `UPDATE apps SET prev_api_key_hash = api_key_hash, prev_key_expires_at = now() + make_interval(hours => $3),
            api_key_hash = $2
      WHERE id = $1 RETURNING ${COLUMNS}`,
    [id, sha256(apiKey), PREV_KEY_HOURS],
  );
  if (!rows.length) throw new HttpError(404, 'app_not_found', { id });
  return { app: appView(rows[0]), api_key: apiKey };
}

export async function appForKey(db, key) {
  if (!API_KEY_RE.test(key ?? '')) return null;
  const h = sha256(key);
  const { rows } = await db.query(
    `SELECT id, kind, adjust_tracker_url, deeplink_scheme, return_url FROM apps
      WHERE api_key_hash = $1 OR (prev_api_key_hash = $1 AND prev_key_expires_at > now())`,
    [h],
  );
  return rows[0] ?? null;
}

// onRequest hook for the app-backend API: Bearer <app api key> → req.caller = app row, else 401.
export function requireApp(pool) {
  return async (req, reply) => {
    const m = /^Bearer (\S+)$/.exec(req.headers.authorization ?? '');
    const app = m ? await appForKey(pool, m[1]) : null;
    if (!app) return reply.code(401).header('cache-control', 'no-store').send({ error: 'unauthorized' });
    req.caller = app;
  };
}
```

`services/core-api/src/identity/tokens.js` (tạo mới):

```js
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const sha256 = (s) => createHash('sha256').update(s).digest('hex');
export const randomToken = (bytes = 32) => randomBytes(bytes).toString('base64url');
export const emailHash = (email) => sha256(String(email).trim().toLowerCase());

// Constant-time string compare (tokens, codes, signatures).
export function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}

export const API_KEY_RE = /^ikfa_[A-Za-z0-9_-]{43}$/;
export const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;
export const newApiKey = () => `ikfa_${randomToken(32)}`;
export const newWebhookSecret = () => `whsec_${randomToken(32)}`;

// E1: the claim token is derived from the checkout id with a server key, so the email and
// GET /v1/checkout/:id/claim show the same single-use token while the DB keeps only its sha256.
export const claimTokenFor = (key, checkoutId) => createHmac('sha256', key).update(`claim:${checkoutId}`).digest('base64url');
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api
```

Expected: `Test Files  24 passed (24)`, `Tests  242 passed (242)` (`apps.test.js`: 7).

- [ ] **Step 5: Commit**

```bash
git add services/core-api
git commit -m "feat(core-api): app registry (POST/GET /v1/apps, rotate-key) and app API key auth"
```

---

### Task 4: Funnel → app (`PUT /v1/funnels/:slug {app_id}`) và plan → `entitlement_key`

**Files:**
- Create: —
- Modify: `services/core-api/src/billing/prices.js`, `services/core-api/src/http/funnels.js`, `services/core-api/src/http/prices.js`, `services/core-api/src/identity/apps.js`
- Test: `services/core-api/test/funnel-app.test.js`, `services/core-api/test/prices.test.js`

**Interfaces:**
- Consumes: `seedApp` (Task 3), `fakePaddle`, `PRICE_W1`, `PRICE_ADDON` (billing test helper).
- Produces:
  - `setFunnelApp(db, {slug, appId}) → {funnel, app_id}` (`404 app_not_found` khi FK sai, `404 funnel_not_found`).
  - `PUT /v1/funnels/:slug` body `{pixel_id?, app_id?}` (ít nhất một; `app_id`: `const null` hoặc `^[a-z0-9][a-z0-9-]{1,30}$`) → gộp kết quả `{funnel, app_id?, …kết quả pixel}`.
  - `PUT /v1/funnels/:slug/prices`: mỗi plan nhận thêm `entitlement_key` (`^[a-z0-9_]{1,40}$`, mặc định `premium`); `GET` trả `entitlement_key` (E16: `prices.test.js` cũ sửa theo).

- [ ] **Step 1: Viết test fail**

`services/core-api/test/funnel-app.test.js` (tạo mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, tokenFor, bearer, seedVersions } from './helpers/app.js';
import { fakePaddle, PRICE_W1, PRICE_ADDON } from './helpers/paddle.js';
import { seedApp } from './helpers/identity.js';

describe('funnel → app (PUT /v1/funnels/:slug app_id) and plan → entitlement_key', () => {
  let db;
  let app;
  let store;
  let router;
  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    const paddle = fakePaddle();
    paddle.price(PRICE_W1);
    paddle.price(PRICE_ADDON, { recurring: false });
    ({ app, store } = await makeApp(db.pool, { paddle }));
    router = await tokenFor(db.pool, 'router');
    await seedVersions(db.pool, store, 'witch-power', 1);
    await seedApp(db.pool);
  });
  afterEach(() => app.close());

  const put = (body, slug = 'witch-power') => app.inject({ method: 'PUT', url: `/v1/funnels/${slug}`, headers: bearer(router), payload: body });
  const appOf = async () => (await db.pool.query("SELECT app_id FROM funnels WHERE slug = 'witch-power'")).rows[0].app_id;

  it('sets and clears the app of a funnel', async () => {
    const res = await put({ app_id: 'starlyn' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ funnel: 'witch-power', app_id: 'starlyn' });
    expect(await appOf()).toBe('starlyn');
    expect((await put({ app_id: null })).json()).toEqual({ funnel: 'witch-power', app_id: null });
    expect(await appOf()).toBeNull();
  });

  it('app and pixel in one call', async () => {
    const res = await put({ app_id: 'starlyn', pixel_id: '123456789' });
    expect(res.json()).toMatchObject({ funnel: 'witch-power', app_id: 'starlyn', pixel_id: '123456789', kv_sync: 'ok' });
  });

  it('404 for an unknown app or funnel, 400 for a malformed id or an empty body', async () => {
    expect((await put({ app_id: 'nope' })).json()).toEqual({ error: 'app_not_found', detail: { app_id: 'nope' } });
    expect((await put({ app_id: 'starlyn' }, 'missing')).json()).toEqual({ error: 'funnel_not_found', detail: { funnel: 'missing' } });
    expect((await put({ app_id: 'Bad App' })).statusCode).toBe(400);
    expect((await put({ app_id: '' })).statusCode).toBe(400);
    expect((await put({})).statusCode).toBe(400);
    expect(await appOf()).toBeNull();
  });

  const putPrices = (plans) =>
    app.inject({ method: 'PUT', url: '/v1/funnels/witch-power/prices', headers: bearer(router), payload: { plans } });

  it('prices: entitlement_key per plan, default premium; listed back', async () => {
    const res = await putPrices({ '1w': { price_id: PRICE_W1 }, addon: { price_id: PRICE_ADDON, entitlement_key: 'tarot_2027' } });
    expect(res.statusCode).toBe(200);
    expect(res.json().plans['1w'].entitlement_key).toBe('premium');
    expect(res.json().plans.addon.entitlement_key).toBe('tarot_2027');
    await putPrices({ '1w': { price_id: PRICE_W1, entitlement_key: 'vip' } });
    const list = await app.inject({ method: 'GET', url: '/v1/funnels/witch-power/prices', headers: bearer(router) });
    expect(Object.fromEntries(Object.entries(list.json().plans).map(([k, v]) => [k, v.entitlement_key]))).toEqual({ '1w': 'vip', addon: 'tarot_2027' });
  });

  it('prices: a malformed entitlement_key is 400 and nothing is saved', async () => {
    for (const key of ['Tarot', 'a-b', '', 'x'.repeat(41)]) {
      expect((await putPrices({ '1w': { price_id: PRICE_W1, entitlement_key: key } })).statusCode).toBe(400);
    }
    expect((await db.pool.query('SELECT count(*)::int AS n FROM funnel_prices')).rows[0].n).toBe(0);
  });
});
```

`services/core-api/test/prices.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/test/prices.test.js b/services/core-api/test/prices.test.js
index dd2049e..e05b8f7 100644
--- a/services/core-api/test/prices.test.js
+++ b/services/core-api/test/prices.test.js
@@ -39,8 +39,8 @@ describe('funnel price mapping', () => {
     const body = res.json();
     expect(body.funnel).toBe('aivideo');
     expect(body.plans).toEqual({
-      '1w': { price_id: PRICE_W1, discount_id: DISCOUNT, kind: 'recurring', updated_by: 'router', updated_at: expect.any(String) },
-      addon: { price_id: PRICE_ADDON, discount_id: null, kind: 'one_time', updated_by: 'router', updated_at: expect.any(String) },
+      '1w': { price_id: PRICE_W1, discount_id: DISCOUNT, kind: 'recurring', entitlement_key: 'premium', updated_by: 'router', updated_at: expect.any(String) },
+      addon: { price_id: PRICE_ADDON, discount_id: null, kind: 'one_time', entitlement_key: 'premium', updated_by: 'router', updated_at: expect.any(String) },
     });
     expect(paddle.calls.map((c) => c[0]).sort()).toEqual(['getDiscount', 'getPrice', 'getPrice']);
     expect((await get('aivideo')).json()).toEqual(body);
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api
```

Expected: FAIL — `Test Files  2 failed | 23 passed (25)`, `Tests  6 failed | 241 passed (247)`: `funnel-app.test.js` 5 (`app_id` bị bỏ qua, không có `entitlement_key`), `prices.test.js` 1 (`validates each price …`: thiếu `entitlement_key`).

- [ ] **Step 3: Implement**

`services/core-api/src/billing/prices.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/billing/prices.js b/services/core-api/src/billing/prices.js
index 12cc6f2..221813f 100644
--- a/services/core-api/src/billing/prices.js
+++ b/services/core-api/src/billing/prices.js
@@ -5,6 +5,7 @@ import { paddleHttpError } from './errors.js';
 export const PLAN_KEY_RE = /^[A-Za-z0-9_-]{1,40}$/;
 export const PRICE_ID_RE = /^pri_[a-z0-9]{26}$/;
 export const DISCOUNT_ID_RE = /^dsc_[a-z0-9]{26}$/;
+export const ENTITLEMENT_KEY_RE = /^[a-z0-9_]{1,40}$/;
 
 async function funnelId(db, slug) {
   const { rows } = await db.query('SELECT id FROM funnels WHERE slug = $1', [slug]);
@@ -22,7 +23,7 @@ async function lookup(fn) {
   }
 }
 
-async function checkPlan(paddle, plan, { price_id: priceId, discount_id: discountId = null }) {
+async function checkPlan(paddle, plan, { price_id: priceId, discount_id: discountId = null, entitlement_key: key = 'premium' }) {
   const problems = [];
   let kind = null;
   if (!PRICE_ID_RE.test(priceId)) {
@@ -42,13 +43,13 @@ async function checkPlan(paddle, plan, { price_id: priceId, discount_id: discoun
       else if (discount.status !== 'active') problems.push({ code: 'invalid_discount', plan, discount_id: discountId, reason: discount.status });
     }
   }
-  return { problems, row: { plan, priceId, discountId, kind } };
+  return { problems, row: { plan, priceId, discountId, kind, key } };
 }
 
 export async function listFunnelPrices(db, slug) {
   const id = await funnelId(db, slug);
   const { rows } = await db.query(
-    `SELECT plan_key, paddle_price_id, paddle_discount_id, kind, updated_by, updated_at
+    `SELECT plan_key, paddle_price_id, paddle_discount_id, kind, entitlement_key, updated_by, updated_at
        FROM funnel_prices WHERE funnel_id = $1 ORDER BY plan_key`,
     [id],
   );
@@ -58,6 +59,7 @@ export async function listFunnelPrices(db, slug) {
       price_id: r.paddle_price_id,
       discount_id: r.paddle_discount_id,
       kind: r.kind,
+      entitlement_key: r.entitlement_key,
       updated_by: r.updated_by,
       updated_at: r.updated_at.toISOString(),
     };
@@ -89,12 +91,12 @@ export async function setFunnelPrices(pool, paddle, { slug, plans, actor, log, a
     }
     for (const { row } of checks) {
       await c.query(
-        `INSERT INTO funnel_prices (funnel_id, plan_key, paddle_price_id, paddle_discount_id, kind, updated_by)
-         VALUES ($1, $2, $3, $4, $5, $6)
+        `INSERT INTO funnel_prices (funnel_id, plan_key, paddle_price_id, paddle_discount_id, kind, entitlement_key, updated_by)
+         VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (funnel_id, plan_key) DO UPDATE
            SET paddle_price_id = EXCLUDED.paddle_price_id, paddle_discount_id = EXCLUDED.paddle_discount_id,
-               kind = EXCLUDED.kind, updated_by = EXCLUDED.updated_by, updated_at = now()`,
-        [id, row.plan, row.priceId, row.discountId, row.kind, actor],
+               kind = EXCLUDED.kind, entitlement_key = EXCLUDED.entitlement_key, updated_by = EXCLUDED.updated_by, updated_at = now()`,
+        [id, row.plan, row.priceId, row.discountId, row.kind, row.key, actor],
       );
     }
     await c.query('COMMIT');
PATCH
```

`services/core-api/src/http/funnels.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/http/funnels.js b/services/core-api/src/http/funnels.js
index 6c2382b..c018a17 100644
--- a/services/core-api/src/http/funnels.js
+++ b/services/core-api/src/http/funnels.js
@@ -1,4 +1,6 @@
 import { requireRole } from '../auth.js';
+import { HttpError } from '../errors.js';
+import { setFunnelApp } from '../identity/apps.js';
 import { setFunnelPixel } from '../publisher/funnels.js';
 
 export default async function funnelsHttp(app, { pool, kv }) {
@@ -14,11 +16,23 @@ export default async function funnelsHttp(app, { pool, kv }) {
         },
         body: {
           type: 'object',
-          required: ['pixel_id'],
-          properties: { pixel_id: { type: ['string', 'null'] } },
+          properties: {
+            pixel_id: { type: ['string', 'null'] },
+            // const null, not type null: Ajv type coercion would turn "" into null and unlink the app.
+            app_id: { anyOf: [{ const: null }, { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{1,30}$' }] },
+          },
         },
       },
     },
-    async (req) => setFunnelPixel(pool, kv, { slug: req.params.slug, pixelId: req.body.pixel_id, log: req.log }),
+    async (req) => {
+      const has = (k) => Object.hasOwn(req.body, k);
+      if (!has('pixel_id') && !has('app_id')) throw new HttpError(400, 'bad_request', 'pixel_id or app_id required');
+      const out = { funnel: req.params.slug };
+      if (has('app_id')) Object.assign(out, await setFunnelApp(pool, { slug: req.params.slug, appId: req.body.app_id }));
+      if (has('pixel_id')) {
+        Object.assign(out, await setFunnelPixel(pool, kv, { slug: req.params.slug, pixelId: req.body.pixel_id, log: req.log }));
+      }
+      return out;
+    },
   );
 }
PATCH
```

`services/core-api/src/http/prices.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/http/prices.js b/services/core-api/src/http/prices.js
index 4e9ab0c..478ff11 100644
--- a/services/core-api/src/http/prices.js
+++ b/services/core-api/src/http/prices.js
@@ -18,6 +18,7 @@ const planValue = {
       properties: {
         price_id: { type: 'string', maxLength: 64 },
         discount_id: { type: ['string', 'null'], maxLength: 64 },
+        entitlement_key: { type: 'string', pattern: '^[a-z0-9_]{1,40}$' },
       },
     },
   ],
PATCH
```

`services/core-api/src/identity/apps.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/identity/apps.js b/services/core-api/src/identity/apps.js
index bc51314..95da310 100644
--- a/services/core-api/src/identity/apps.js
+++ b/services/core-api/src/identity/apps.js
@@ -107,3 +107,16 @@ export function requireApp(pool) {
     req.caller = app;
   };
 }
+
+// PUT /v1/funnels/:slug {app_id}: which app a funnel's buyers get entitlements in (null = none).
+export async function setFunnelApp(db, { slug, appId }) {
+  let rows;
+  try {
+    ({ rows } = await db.query('UPDATE funnels SET app_id = $2 WHERE slug = $1 RETURNING slug', [slug, appId]));
+  } catch (err) {
+    if (err.code === '23503') throw new HttpError(404, 'app_not_found', { app_id: appId });
+    throw err;
+  }
+  if (!rows.length) throw new HttpError(404, 'funnel_not_found', { funnel: slug });
+  return { funnel: slug, app_id: appId };
+}
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api
```

Expected: `Test Files  25 passed (25)`, `Tests  247 passed (247)`.

- [ ] **Step 5: Commit**

```bash
git add services/core-api
git commit -m "feat(core-api): funnels.app_id via PUT /v1/funnels/:slug, entitlement_key per plan in prices"
```

---

### Task 5: Worker `entitlement-sync`: outbox → tính lại quyền → delivery; claim token + email; quét hết hạn

Đây là task trọng tâm. `recompute` tính lại **toàn bộ** quyền của một khách từ `subscriptions`/`transactions`/`checkouts`/`funnel_prices`/`outbox` (E5, E7, E8), so với bảng `entitlements`, và chỉ tạo delivery khi phần **nhìn thấy được** (`active`, `expires_at`) đổi — nên chạy lại hay trùng outbox không sinh webhook (Review Focus 1). Test dùng **chính** `syncMessage` của billing + `fakePaddle` để tạo outbox, nên hợp đồng outbox giữa hai spec được kiểm thật.

**Files:**
- Create: `services/core-api/src/identity/claims.js`, `services/core-api/src/identity/entitlements.js`, `services/core-api/src/identity/sync.js`
- Modify: —
- Test: `services/core-api/test/entitlement-sync.test.js`, `services/core-api/test/helpers/identity.js`

**Interfaces:**
- Consumes: `computeEntitlements` (Task 2); `ulid` (`src/billing/ulid.js`), `isUlid` (`@ikf/event-schema`); outbox billing: `payload.customer_id` (id nội bộ), `payment.succeeded.payload.checkout_id`, `payment.refunded|chargeback.aggregate_id = paddle_transaction_id`; `syncMessage`, `fakePaddle`, `paddleSub`, `paddleTxn` (test).
- Produces:
  - `src/identity/entitlements.js`: `loadSources(c, customerId)`, `recompute(c, customerId, now) → {apps, deliveries}` (trong transaction của caller, khóa hàng khách), `entitlementsOf(c, customerId, appId) → [{key, active, expires_at: iso|null}]`, `customerRef(c, id) → 'cus_<ULID>'`, `addDelivery(c, {appId, appUserId, type, customerRef, entitlements, now?}) → eventId`, `lockCustomer(c, id)`.
  - `src/identity/claims.js`: `CLAIM_TTL_DAYS = 7`, `appLinkFor(app, token)`, `createClaimForCheckout(c, {claimKey, checkoutId, customerId, log}) → bool`.
  - `src/identity/sync.js`: `syncOutbox({pool, claimKey, log, now?}) → {rows, published, deliveries, claims}`, `sweepExpired({pool, log, now?}) → {customers, deliveries}`, `claimEmail(app, link) → {subject, text, html}`, `sendClaimEmails({pool, mailer, claimKey, alarm, log}) → {sent}`, `startEntitlementSync({pool, mailer, claimKey, alarm, log, outboxMs=2000, sweepMs=300000}) → stop()`.
  - `mailer` = `{send({to, subject, text, html})}` (fake ở test; SES ở Task 9).
  - Test helper (thêm vào `helpers/identity.js`): `fakeMailer()`, `CLAIM_KEY`, `CK`, `CK2`, `SID`, `custom(checkoutId, plan)`, `inDays(d)`, `seedShop(pool, {secrets?, app?})` (funnel `witch-power` → app, plan `1w` → `premium`, `addon` → `tarot_2027`, checkout `CK`/`txn_a`, `CK2`/`txn_c`).

- [ ] **Step 1: Viết test fail**

`services/core-api/test/entitlement-sync.test.js` (tạo mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { syncMessage } from '../src/billing/sync.js';
import { sendClaimEmails, startEntitlementSync, sweepExpired, syncOutbox } from '../src/identity/sync.js';
import { appLinkFor } from '../src/identity/claims.js';
import { claimTokenFor } from '../src/identity/tokens.js';
import { startDb, resetDb } from './helpers/db.js';
import { sha } from './helpers/app.js';
import { fakePaddle, paddleSub, paddleTxn, PRICE_ADDON } from './helpers/paddle.js';
import { APP_BODY, CK, CK2, CLAIM_KEY, WEB_BODY, custom, fakeMailer, inDays, seedApp, seedShop } from './helpers/identity.js';

const T = (n) => `2026-10-09T10:00:0${n}.123456Z`;
const txnMsg = (id) => ({ event_id: `evt_${Math.random()}`, event_type: 'transaction.updated', entity: 'transaction', entity_id: id });
const subMsg = () => ({ event_id: `evt_${Math.random()}`, event_type: 'subscription.updated', entity: 'subscription', entity_id: 'sub_1' });
const plus3d = (iso) => new Date(new Date(iso).getTime() + 3 * 86400_000);

describe('entitlement-sync', () => {
  let db;
  let paddle;
  let mailer;
  let alarms;
  let logs;
  const log = { warn: (o, m) => logs.push([m, o]), error: (o, m) => logs.push([m, o]), info: () => {} };
  const bill = (msg) => syncMessage({ pool: db.pool, paddle, log }, msg);
  const tick = (pool = db.pool) => syncOutbox({ pool, claimKey: CLAIM_KEY, log });
  const emails = () => sendClaimEmails({ pool: db.pool, mailer, claimKey: CLAIM_KEY, alarm: async (k) => alarms.push(k), log });
  const q = async (sql, p) => (await db.pool.query(sql, p)).rows;
  const deliveries = () => q('SELECT app_user_id, type, payload FROM webhook_deliveries ORDER BY id');
  const ents = () => q('SELECT app_id, key, active, expires_at, source, source_id FROM entitlements ORDER BY app_id, key');
  const unpublished = async () => (await q('SELECT count(*)::int AS n FROM outbox WHERE published_at IS NULL'))[0].n;
  const link = (userId, revoked = false) =>
    db.pool.query(
      "INSERT INTO app_links (customer_id, app_id, app_user_id, revoked_at) SELECT id, 'starlyn', $1, $2 FROM customers WHERE paddle_customer_id = 'ctm_1'",
      [userId, revoked ? new Date() : null],
    );
  const END = inDays(7);
  const buyWeekly = async (o = {}) => {
    paddle.subscription(paddleSub({ status: 'active', custom_data: custom(CK), period_end: END, updated_at: T(1), ...o }));
    paddle.transaction(paddleTxn({ id: 'txn_a', subscription_id: 'sub_1', custom_data: custom(CK), updated_at: T(2) }));
    await bill(txnMsg('txn_a'));
  };
  const buyAddon = async (adjustments = [], updatedAt = T(3)) => {
    paddle.transaction(paddleTxn({ id: 'txn_c', price_id: PRICE_ADDON, amount: 999, custom_data: custom(CK2, 'addon'), updated_at: updatedAt, adjustments }));
    await bill(txnMsg('txn_c'));
  };
  const adj = (id, action) => ({ id, action, status: 'approved', type: 'full', totals: { total: '999', currency_code: 'USD' } });

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    await seedShop(db.pool);
    paddle = fakePaddle();
    paddle.customer('ctm_1', 'buyer@example.com');
    mailer = fakeMailer();
    alarms = [];
    logs = [];
  });

  it('weekly plan: premium until period end + 3 days; one entitlement.updated with the full app state per ACTIVE link', async () => {
    await buyWeekly();
    await link('u1');
    await link('gone', true);
    expect(await tick()).toMatchObject({ rows: 2, published: 2, deliveries: 1, claims: 1 });
    expect(await ents()).toEqual([
      { app_id: 'starlyn', key: 'premium', active: true, expires_at: plus3d(END), source: 'subscription', source_id: 'sub_1' },
    ]);
    expect(await unpublished()).toBe(0);
    const [d] = await deliveries();
    expect(d.app_user_id).toBe('u1');
    expect(d.payload).toEqual({
      id: expect.stringMatching(/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/),
      type: 'entitlement.updated',
      created_at: expect.any(String),
      app_id: 'starlyn',
      app_user_id: 'u1',
      customer_ref: expect.stringMatching(/^cus_[0-7][0-9A-HJKMNP-TV-Z]{25}$/),
      entitlements: [{ key: 'premium', active: true, expires_at: plus3d(END).toISOString() }],
    });
    expect((await deliveries()).length).toBe(1);
  });

  it('Review Focus 1: replaying the whole outbox, a duplicate webhook and two racing workers add no webhook', async () => {
    await buyWeekly();
    await link('u1');
    await tick();
    expect(await deliveries()).toHaveLength(1);
    await db.pool.query('UPDATE outbox SET published_at = NULL');
    await tick();
    await tick();
    await bill(txnMsg('txn_a')); // Paddle resends the same webhook
    await tick();
    await db.pool.query('UPDATE outbox SET published_at = NULL');
    await Promise.all([tick(), tick(), tick()]);
    expect(await unpublished()).toBe(0);
    expect(await deliveries()).toHaveLength(1);
    expect((await q('SELECT count(*)::int AS n FROM claim_tokens'))[0].n).toBe(1);
  });

  it('add-on: tarot_2027 forever; a refund turns it off and notifies at once', async () => {
    await buyAddon();
    await link('u1');
    await tick();
    expect(await ents()).toEqual([{ app_id: 'starlyn', key: 'tarot_2027', active: true, expires_at: null, source: 'one_time', source_id: 'txn_c' }]);
    await buyAddon([adj('adj_1', 'refund')], T(4));
    await tick();
    expect((await ents())[0].active).toBe(false);
    expect((await deliveries()).map((d) => d.payload.entitlements)).toEqual([
      [{ key: 'tarot_2027', active: true, expires_at: null }],
      [{ key: 'tarot_2027', active: false, expires_at: null }],
    ]);
  });

  it('a chargeback on the latest subscription payment turns premium off', async () => {
    await buyWeekly();
    await tick();
    paddle.transaction(paddleTxn({ id: 'txn_a', subscription_id: 'sub_1', custom_data: custom(CK), updated_at: T(5), adjustments: [{ ...adj('adj_9', 'chargeback'), status: 'pending_approval' }] }));
    await bill(txnMsg('txn_a'));
    await tick();
    expect((await ents())[0]).toMatchObject({ key: 'premium', active: false });
  });

  it('cancel: premium stays until the period ends; the sweep turns it off with no event, then converges', async () => {
    await buyWeekly();
    await link('u1');
    await tick();
    const soon = new Date(Date.now() + 3600_000).toISOString();
    paddle.subscription(paddleSub({ status: 'canceled', custom_data: custom(CK), period_end: soon, canceled_at: T(3), updated_at: T(3) }));
    await bill(subMsg());
    await tick();
    expect((await ents())[0]).toMatchObject({ active: true, expires_at: new Date(soon) });
    expect(await sweepExpired({ pool: db.pool, log })).toEqual({ customers: 0, deliveries: 0 });
    const later = () => new Date(Date.now() + 2 * 3600_000);
    expect(await sweepExpired({ pool: db.pool, log, now: later })).toEqual({ customers: 1, deliveries: 1 });
    expect((await ents())[0]).toMatchObject({ active: false });
    expect(await sweepExpired({ pool: db.pool, log, now: later })).toEqual({ customers: 0, deliveries: 0 });
    expect((await deliveries()).map((d) => d.payload.entitlements[0].active)).toEqual([true, true, false]);
  });

  it('claim token: one per checkout, only its sha256 stored, 7 days; emailed once with the app link and no email in it', async () => {
    await buyWeekly();
    await tick();
    const token = claimTokenFor(CLAIM_KEY, CK);
    const [row] = await q('SELECT token_hash, app_id, checkout_id, expires_at, used_at FROM claim_tokens');
    expect(row).toMatchObject({ token_hash: sha(token), app_id: 'starlyn', checkout_id: CK, used_at: null });
    expect((row.expires_at - Date.now()) / 86400_000).toBeGreaterThan(6.99);
    expect(await emails()).toEqual({ sent: 1 });
    await db.pool.query('UPDATE outbox SET published_at = NULL');
    await tick();
    expect(await emails()).toEqual({ sent: 0 });
    expect(mailer.sent).toHaveLength(1);
    const m = mailer.sent[0];
    expect(m.to).toBe('buyer@example.com');
    const appLink = appLinkFor(APP_BODY, token);
    expect(appLink).toBe(`https://app.adjust.com/abc123?deep_link=starlyn%3A%2F%2Fclaim%3Ft%3D${token}`);
    expect(m.text).toContain(appLink);
    expect(m.html).toContain(appLink.replace(/&/g, '&amp;'));
    expect(appLink).not.toContain('buyer');
  });

  it('no claim token for a web app or for a funnel without an app; the funnel without app gets no entitlement either', async () => {
    await seedApp(db.pool, undefined, WEB_BODY);
    await db.pool.query("UPDATE funnels SET app_id = 'tarot-web'");
    await buyAddon();
    await tick();
    expect(await ents()).toEqual([expect.objectContaining({ app_id: 'tarot-web', key: 'tarot_2027', active: true })]);
    await db.pool.query('UPDATE funnels SET app_id = NULL');
    await buyWeekly();
    await tick();
    expect(await unpublished()).toBe(0);
    expect((await q('SELECT count(*)::int AS n FROM claim_tokens'))[0].n).toBe(0);
    expect((await ents()).map((e) => e.key)).toEqual(['tarot_2027']);
  });

  it('SES failing: 3 attempts, then one claim_email_failed alarm; logs carry email_hash, never the email', async () => {
    mailer.fail();
    await buyWeekly();
    await tick();
    for (let i = 0; i < 5; i += 1) await emails();
    expect(mailer.sent).toEqual([]);
    expect((await q('SELECT email_attempts, emailed_at FROM claim_tokens'))[0]).toEqual({ email_attempts: 3, emailed_at: null });
    expect(alarms).toEqual(['claim_email_failed']);
    expect(logs.filter(([m]) => m === 'claim_email_failed')).toHaveLength(3);
    expect(JSON.stringify(logs)).not.toContain('buyer@example.com');
    expect(logs[0][1].email_hash).toBe(sha('buyer@example.com'));
  });

  it('SES fails once, then the next tick sends', async () => {
    mailer.fail(1);
    await buyWeekly();
    await tick();
    await emails();
    await emails();
    expect(mailer.sent).toHaveLength(1);
    expect(alarms).toEqual([]);
  });

  it('a crash before published_at rolls the whole batch back; the rerun writes everything once', async () => {
    await buyWeekly();
    await link('u1');
    const crashing = {
      connect: async () => {
        const c = await db.pool.connect();
        return {
          query: (sql, params) => (/SET published_at/.test(sql) ? Promise.reject(new Error('worker killed')) : c.query(sql, params)),
          release: () => c.release(),
        };
      },
    };
    await expect(tick(crashing)).rejects.toThrow('worker killed');
    expect(await ents()).toEqual([]);
    expect(await deliveries()).toEqual([]);
    expect((await q('SELECT count(*)::int AS n FROM claim_tokens'))[0].n).toBe(0);
    expect(await unpublished()).toBe(2);
    await tick();
    await tick();
    expect(await deliveries()).toHaveLength(1);
    expect(await ents()).toHaveLength(1);
  });

  it('outbox rows without a customer are only marked published', async () => {
    await db.pool.query("INSERT INTO outbox (topic, aggregate_id, dedupe_key, payload) VALUES ('payment.succeeded', 'txn_x', 'k1', '{\"customer_id\": null}')");
    expect(await tick()).toMatchObject({ rows: 1, published: 1, deliveries: 0 });
  });

  it('startEntitlementSync processes the outbox and sends claim emails until stopped', async () => {
    await buyWeekly();
    const stop = startEntitlementSync({ pool: db.pool, mailer, claimKey: CLAIM_KEY, alarm: async () => {}, log, outboxMs: 20, sweepMs: 20 });
    for (let i = 0; i < 100 && mailer.sent.length === 0; i += 1) await new Promise((r) => setTimeout(r, 20));
    await stop();
    expect(await unpublished()).toBe(0);
    expect(mailer.sent).toHaveLength(1);
  });
});
```

`services/core-api/test/helpers/identity.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/test/helpers/identity.js b/services/core-api/test/helpers/identity.js
index 342ca44..4b2c4b5 100644
--- a/services/core-api/test/helpers/identity.js
+++ b/services/core-api/test/helpers/identity.js
@@ -40,3 +40,49 @@ export const WEB_BODY = {
 
 // Creates an app through the real code path; returns {app, api_key, webhook_secret}.
 export const seedApp = (pool, secrets = fakeSecrets(), body = APP_BODY) => createApp(pool, secrets, body);
+
+// In-memory SES: records what was sent; fail(n) makes the next n sends throw (Infinity = always).
+export function fakeMailer() {
+  const sent = [];
+  let failures = 0;
+  return {
+    sent,
+    fail(n = Infinity) {
+      failures = n;
+    },
+    async send(msg) {
+      if (failures > 0) {
+        failures -= 1;
+        throw new Error('ses throttled');
+      }
+      sent.push(msg);
+    },
+  };
+}
+
+export const CLAIM_KEY = 'test-claim-key-0123456789abcdef0123456789';
+export const CK = '01JA0000000000000000000001';
+export const CK2 = '01JA0000000000000000000003';
+export const SID = '01JA0000000000000000000002';
+export const custom = (checkoutId, plan = '1w') => ({ checkout_id: checkoutId, sid: SID, funnel: 'witch-power', v: 1, plan });
+export const inDays = (d) => new Date(Date.now() + d * 86400_000).toISOString();
+
+// Funnel witch-power@v1 → app (default Starlyn, kind app); plans 1w (recurring → premium) and
+// addon (one_time → tarot_2027); checkouts CK (1w, txn_a) and CK2 (addon, txn_c).
+export async function seedShop(pool, { secrets = fakeSecrets(), app = APP_BODY } = {}) {
+  const { seedVersions } = await import('./app.js');
+  const { fakeStore } = await import('./fakes.js');
+  const { PRICE_W1, PRICE_ADDON } = await import('./paddle.js');
+  await seedVersions(pool, fakeStore(), 'witch-power', 1);
+  const created = await seedApp(pool, secrets, app);
+  const funnelId = (await pool.query("UPDATE funnels SET app_id = $1 WHERE slug = 'witch-power' RETURNING id", [app.id])).rows[0].id;
+  await pool.query(
+    `INSERT INTO funnel_prices (funnel_id, plan_key, paddle_price_id, kind, entitlement_key, updated_by)
+     VALUES ($1, '1w', $2, 'recurring', 'premium', 't'), ($1, 'addon', $3, 'one_time', 'tarot_2027', 't')`,
+    [funnelId, PRICE_W1, PRICE_ADDON],
+  );
+  for (const [id, txn, plan] of [[CK, 'txn_a', '1w'], [CK2, 'txn_c', 'addon']]) {
+    await pool.query('INSERT INTO checkouts (id, paddle_transaction_id, funnel_id, v, plan_key, sid) VALUES ($1, $2, $3, 1, $4, $5)', [id, txn, funnelId, plan, SID]);
+  }
+  return { ...created, funnelId };
+}
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api
```

Expected: FAIL — `entitlement-sync.test.js`: `Cannot find module '../src/identity/sync.js'`; 247 test cũ pass.

- [ ] **Step 3: Implement**

`services/core-api/src/identity/claims.js` (tạo mới):

```js
import { claimTokenFor, sha256 } from './tokens.js';

export const CLAIM_TTL_DAYS = 7;

// <adjust_tracker_url>?deep_link=<url-encoded "<scheme>://claim?t=<token>"> (spec §3). Never an email.
export function appLinkFor(app, token) {
  const u = new URL(app.adjust_tracker_url);
  u.searchParams.set('deep_link', `${app.deeplink_scheme}://claim?t=${token}`);
  return u.toString();
}

// payment.succeeded with a checkout of a funnel whose app is kind 'app' → one claim token per checkout
// (unique checkout_id; the token is derived, so a replay inserts nothing). Returns true if inserted.
export async function createClaimForCheckout(c, { claimKey, checkoutId, customerId, log }) {
  const { rows } = await c.query(
    `SELECT a.id AS app_id FROM checkouts ck JOIN funnels f ON f.id = ck.funnel_id JOIN apps a ON a.id = f.app_id
      WHERE ck.id = $1 AND a.kind = 'app'`,
    [checkoutId],
  );
  if (!rows.length) return false;
  if (!customerId) {
    log?.warn({ checkout_id: checkoutId }, 'claim_skipped_no_customer');
    return false;
  }
  const token = claimTokenFor(claimKey, checkoutId);
  const r = await c.query(
    `INSERT INTO claim_tokens (token_hash, customer_id, app_id, checkout_id, expires_at)
     VALUES ($1, $2, $3, $4, now() + make_interval(days => $5)) ON CONFLICT DO NOTHING`,
    [sha256(token), customerId, rows[0].app_id, checkoutId, CLAIM_TTL_DAYS],
  );
  return r.rowCount === 1;
}
```

`services/core-api/src/identity/entitlements.js` (tạo mới):

```js
import { ulid } from '../billing/ulid.js';
import { computeEntitlements } from './compute.js';

const REVERSAL_TOPICS = ['payment.refunded', 'payment.chargeback'];

// Everything computeEntitlements needs for one customer, resolved to (app_id, key).
// - subscription → its funnel's app, key of its plan (default 'premium' if the plan mapping is gone);
//   reversed = refund/chargeback on its latest completed payment (E7);
// - one-time = completed transaction without subscription, from a checkout whose plan is a one_time price
//   (E8: refunds/chargebacks live only in the outbox, billing has no adjustments table).
export async function loadSources(c, customerId) {
  const subs = await c.query(
    `SELECT s.paddle_subscription_id AS id, f.app_id, COALESCE(fp.entitlement_key, 'premium') AS key, s.status,
            s.current_period_end,
            EXISTS (
              SELECT 1 FROM outbox o
               WHERE o.topic = ANY($2) AND o.aggregate_id = (
                 SELECT t.paddle_transaction_id FROM transactions t
                  WHERE t.paddle_subscription_id = s.paddle_subscription_id AND t.status = 'completed'
                  ORDER BY t.billed_at DESC NULLS LAST, t.paddle_updated_at DESC LIMIT 1)
            ) AS reversed
       FROM subscriptions s
       JOIN funnels f ON f.id = s.funnel_id
       LEFT JOIN funnel_prices fp ON fp.funnel_id = s.funnel_id AND fp.plan_key = s.plan_key
      WHERE s.customer_id = $1 AND f.app_id IS NOT NULL`,
    [customerId, REVERSAL_TOPICS],
  );
  const ones = await c.query(
    `SELECT t.paddle_transaction_id AS id, f.app_id, fp.entitlement_key AS key,
            EXISTS (SELECT 1 FROM outbox o WHERE o.topic = ANY($2) AND o.aggregate_id = t.paddle_transaction_id) AS reversed
       FROM transactions t
       JOIN checkouts ck ON ck.id = t.checkout_id
       JOIN funnels f ON f.id = ck.funnel_id
       JOIN funnel_prices fp ON fp.funnel_id = ck.funnel_id AND fp.plan_key = ck.plan_key AND fp.kind = 'one_time'
      WHERE t.customer_id = $1 AND t.status = 'completed' AND t.paddle_subscription_id IS NULL AND f.app_id IS NOT NULL`,
    [customerId, REVERSAL_TOPICS],
  );
  return { subscriptions: subs.rows, oneTimes: ones.rows };
}

const iso = (d) => (d ? new Date(d).toISOString() : null);
const sameEnd = (a, b) => (a ? new Date(a).getTime() : null) === (b ? new Date(b).getTime() : null);

// Webhook view of one customer's entitlements in one app: [{key, active, expires_at}] by key.
export async function entitlementsOf(c, customerId, appId) {
  const { rows } = await c.query(
    'SELECT key, active, expires_at FROM entitlements WHERE customer_id = $1 AND app_id = $2 ORDER BY key',
    [customerId, appId],
  );
  return rows.map((r) => ({ key: r.key, active: r.active, expires_at: iso(r.expires_at) }));
}

// cus_<ULID>, assigned once.
export async function customerRef(c, customerId) {
  const { rows } = await c.query('UPDATE customers SET ref = COALESCE(ref, $2) WHERE id = $1 RETURNING ref', [customerId, `cus_${ulid()}`]);
  return rows[0].ref;
}

export async function addDelivery(c, { appId, appUserId, type, customerRef: ref, entitlements, now = new Date() }) {
  const eventId = ulid(now.getTime());
  const payload = {
    id: eventId, type, created_at: now.toISOString(), app_id: appId, app_user_id: appUserId, customer_ref: ref, entitlements,
  };
  await c.query(
    'INSERT INTO webhook_deliveries (event_id, app_id, app_user_id, type, payload) VALUES ($1, $2, $3, $4, $5)',
    [eventId, appId, appUserId, type, payload],
  );
  return eventId;
}

// Serializes everything that writes one customer's entitlements or links (recompute, link, revoke).
export const lockCustomer = (c, customerId) => c.query('SELECT id FROM customers WHERE id = $1 FOR UPDATE', [customerId]);

// Spec §4 steps 1-2, inside the caller's transaction: recompute, write what changed, and queue one
// entitlement.updated (full app state) per active link of every app whose entitlements changed.
// Recomputing from scratch makes it idempotent: replays and duplicates change nothing and send nothing.
export async function recompute(c, customerId, now = new Date()) {
  await lockCustomer(c, customerId);
  const desired = computeEntitlements({ ...(await loadSources(c, customerId)), now });
  const current = new Map(
    (await c.query('SELECT app_id, key, active, expires_at, source, source_id FROM entitlements WHERE customer_id = $1', [customerId]))
      .rows.map((r) => [`${r.app_id}\u0000${r.key}`, r]),
  );
  const changed = new Set();
  for (const d of desired) {
    const id = `${d.app_id}\u0000${d.key}`;
    const cur = current.get(id);
    current.delete(id);
    const visible = !cur || cur.active !== d.active || !sameEnd(cur.expires_at, d.expires_at);
    if (!visible && cur.source === d.source && cur.source_id === d.source_id) continue;
    await c.query(
      `INSERT INTO entitlements (customer_id, app_id, key, active, expires_at, source, source_id, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, now())
       ON CONFLICT (customer_id, app_id, key) DO UPDATE
         SET active = EXCLUDED.active, expires_at = EXCLUDED.expires_at, source = EXCLUDED.source,
             source_id = EXCLUDED.source_id, updated_at = now()`,
      [customerId, d.app_id, d.key, d.active, d.expires_at, d.source, d.source_id],
    );
    if (visible) changed.add(d.app_id);
  }
  // A source that no longer resolves (funnel moved to another app, plan unmapped): switch it off.
  for (const cur of current.values()) {
    if (!cur.active) continue;
    await c.query('UPDATE entitlements SET active = false, updated_at = now() WHERE customer_id = $1 AND app_id = $2 AND key = $3', [customerId, cur.app_id, cur.key]);
    changed.add(cur.app_id);
  }
  const apps = [...changed].sort();
  if (!apps.length) return { apps, deliveries: 0 };
  const ref = await customerRef(c, customerId);
  let deliveries = 0;
  for (const appId of apps) {
    const ents = await entitlementsOf(c, customerId, appId);
    const links = await c.query(
      'SELECT app_user_id FROM app_links WHERE customer_id = $1 AND app_id = $2 AND revoked_at IS NULL ORDER BY id',
      [customerId, appId],
    );
    for (const { app_user_id: appUserId } of links.rows) {
      await addDelivery(c, { appId, appUserId, type: 'entitlement.updated', customerRef: ref, entitlements: ents, now });
      deliveries += 1;
    }
  }
  return { apps, deliveries };
}
```

`services/core-api/src/identity/sync.js` (tạo mới):

```js
import { isUlid } from '@ikf/event-schema';
import { appLinkFor, createClaimForCheckout } from './claims.js';
import { recompute } from './entitlements.js';
import { claimTokenFor, emailHash } from './tokens.js';

export const OUTBOX_BATCH = 100;
export const OUTBOX_INTERVAL_MS = 2000;
export const SWEEP_INTERVAL_MS = 5 * 60_000;
export const SWEEP_BATCH = 200;
export const CLAIM_EMAIL_ATTEMPTS = 3;

const customerOf = (payload) => (Number.isSafeInteger(payload?.customer_id) ? payload.customer_id : null);

// One tick of entitlement-sync (spec §4): up to 100 unpublished outbox rows (SKIP LOCKED), grouped by
// customer; per customer (a SAVEPOINT): recompute + claim token for payment.succeeded with a checkout;
// then published_at = now() for the rows done. One customer's failure leaves only its rows for later.
export async function syncOutbox({ pool, claimKey, log, now = () => new Date() }) {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    const { rows } = await c.query(
      `SELECT id, topic, payload FROM outbox WHERE published_at IS NULL ORDER BY id LIMIT ${OUTBOX_BATCH} FOR UPDATE SKIP LOCKED`,
    );
    const byCustomer = new Map();
    const done = [];
    for (const r of rows) {
      const cid = customerOf(r.payload);
      if (cid === null) done.push(r.id);
      else byCustomer.set(cid, [...(byCustomer.get(cid) ?? []), r]);
    }
    let deliveries = 0;
    let claims = 0;
    for (const [cid, list] of [...byCustomer].sort((a, b) => a[0] - b[0])) {
      await c.query('SAVEPOINT customer');
      try {
        deliveries += (await recompute(c, cid, now())).deliveries;
        for (const r of list) {
          if (r.topic === 'payment.succeeded' && isUlid(r.payload.checkout_id)) {
            if (await createClaimForCheckout(c, { claimKey, checkoutId: r.payload.checkout_id, customerId: cid, log })) claims += 1;
          }
        }
        await c.query('RELEASE SAVEPOINT customer');
        done.push(...list.map((r) => r.id));
      } catch (err) {
        await c.query('ROLLBACK TO SAVEPOINT customer');
        log?.error({ customer_id: cid, err: err.message }, 'entitlement_sync_failed');
      }
    }
    if (done.length) await c.query('UPDATE outbox SET published_at = now() WHERE id = ANY($1::bigint[])', [done]);
    await c.query('COMMIT');
    return { rows: rows.length, published: done.length, deliveries, claims };
  } catch (err) {
    await c.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    c.release();
  }
}

// Every 5 minutes: entitlements whose end passed with no event (grace over, canceled period over).
export async function sweepExpired({ pool, log, now = () => new Date() }) {
  const { rows } = await pool.query(
    `SELECT DISTINCT customer_id FROM entitlements WHERE active AND expires_at < $1 ORDER BY customer_id LIMIT ${SWEEP_BATCH}`,
    [now()],
  );
  let deliveries = 0;
  for (const { customer_id: cid } of rows) {
    const c = await pool.connect();
    try {
      await c.query('BEGIN');
      deliveries += (await recompute(c, Number(cid), now())).deliveries;
      await c.query('COMMIT');
    } catch (err) {
      await c.query('ROLLBACK').catch(() => {});
      log?.error({ customer_id: Number(cid), err: err.message }, 'entitlement_sweep_failed');
    } finally {
      c.release();
    }
  }
  return { customers: rows.length, deliveries };
}

export function claimEmail(app, link) {
  const subject = `Your ${app.name} access is ready`;
  const text = [
    `Thanks for your purchase! Open ${app.name} with this link to unlock what you bought:`,
    '',
    link,
    '',
    'The link works once and expires in 7 days.',
    `On another phone, or after reinstalling, open ${app.name}, choose "Restore purchase" and enter this email address: we send you a 6-digit code.`,
  ].join('\n');
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const html = `<p>Thanks for your purchase! Open ${esc(app.name)} to unlock what you bought:</p>`
    + `<p><a href="${esc(link)}">Open ${esc(app.name)}</a></p>`
    + '<p>The link works once and expires in 7 days.</p>'
    + `<p>On another phone, or after reinstalling, open ${esc(app.name)}, choose "Restore purchase" and enter this email address: we send you a 6-digit code.</p>`;
  return { subject, text, html };
}

// Claim emails go out after the token's transaction committed (a crash never loses one): pending rows
// are retried each tick up to 3 attempts, then claim_email_failed is logged + alarmed (spec §7).
// The link still shows on the web page whatever happens here.
export async function sendClaimEmails({ pool, mailer, claimKey, alarm, log }) {
  const c = await pool.connect();
  let sent = 0;
  try {
    await c.query('BEGIN');
    const { rows } = await c.query(
      `SELECT ct.token_hash, ct.checkout_id, ct.email_attempts, cu.email, a.id AS app_id, a.name, a.adjust_tracker_url, a.deeplink_scheme
         FROM claim_tokens ct JOIN customers cu ON cu.id = ct.customer_id JOIN apps a ON a.id = ct.app_id
        WHERE ct.emailed_at IS NULL AND ct.email_attempts < $1 AND ct.checkout_id IS NOT NULL AND ct.expires_at > now()
        ORDER BY ct.created_at LIMIT 20 FOR UPDATE OF ct SKIP LOCKED`,
      [CLAIM_EMAIL_ATTEMPTS],
    );
    for (const r of rows) {
      if (!r.email) {
        await c.query('UPDATE claim_tokens SET email_attempts = $2 WHERE token_hash = $1', [r.token_hash, CLAIM_EMAIL_ATTEMPTS]);
        log?.warn({ checkout_id: r.checkout_id }, 'claim_email_no_address');
        continue;
      }
      const link = appLinkFor(r, claimTokenFor(claimKey, r.checkout_id));
      try {
        await mailer.send({ to: r.email, ...claimEmail(r, link) });
        await c.query('UPDATE claim_tokens SET emailed_at = now(), email_attempts = email_attempts + 1 WHERE token_hash = $1', [r.token_hash]);
        sent += 1;
      } catch (err) {
        const attempts = r.email_attempts + 1;
        await c.query('UPDATE claim_tokens SET email_attempts = $2 WHERE token_hash = $1', [r.token_hash, attempts]);
        const info = { checkout_id: r.checkout_id, email_hash: emailHash(r.email), attempts, err: err.message };
        log?.warn(info, 'claim_email_failed');
        if (attempts >= CLAIM_EMAIL_ATTEMPTS) await alarm?.('claim_email_failed', `Claim email failed ${attempts} times (app ${r.app_id}, checkout ${r.checkout_id}): ${err.message}`);
      }
    }
    await c.query('COMMIT');
    return { sent };
  } catch (err) {
    await c.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    c.release();
  }
}

// Runs in the core-api process. Each loop waits for its own previous run (no overlap); stop() resolves
// when both loops are idle.
export function startEntitlementSync({ pool, mailer, claimKey, alarm, log, outboxMs = OUTBOX_INTERVAL_MS, sweepMs = SWEEP_INTERVAL_MS }) {
  let stopped = false;
  const timers = new Map();
  const running = new Set();
  const loop = (name, ms, fn) => {
    const tick = async () => {
      if (stopped) return;
      const p = fn().catch((err) => log?.error({ err: err.message }, `${name}_failed`));
      running.add(p);
      await p;
      running.delete(p);
      if (!stopped) timers.set(name, setTimeout(tick, ms));
    };
    timers.set(name, setTimeout(tick, 0));
  };
  loop('entitlement_sync', outboxMs, async () => {
    await syncOutbox({ pool, claimKey, log });
    await sendClaimEmails({ pool, mailer, claimKey, alarm, log });
  });
  loop('entitlement_sweep', sweepMs, () => sweepExpired({ pool, log }));
  return async function stop() {
    stopped = true;
    for (const t of timers.values()) clearTimeout(t);
    await Promise.allSettled([...running]);
  };
}
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api
```

Expected: `Test Files  26 passed (26)`, `Tests  259 passed (259)` (`entitlement-sync.test.js`: 12).

- [ ] **Step 5: Commit**

```bash
git add services/core-api
git commit -m "feat(core-api): entitlement-sync worker: outbox \u2192 recompute \u2192 deliveries, claim tokens + email, expiry sweep"
```

---

### Task 6: Liên kết: claim redeem, magic link, `GET /v1/users/:id/entitlements`, `GET /v1/checkout/:id/claim`

**Files:**
- Create: `services/core-api/src/http/claim.js`, `services/core-api/src/http/identity.js`, `services/core-api/src/identity/link.js`
- Modify: `services/core-api/src/app.js`
- Test: `services/core-api/test/claims.test.js`

**Interfaces:**
- Consumes: `requireApp` (Task 3); `recompute`, `addDelivery`, `customerRef`, `entitlementsOf`, `lockCustomer`, `appLinkFor`, `seedShop`, `syncOutbox` (Task 5); `allowedOrigin` (`src/billing/cors.js`).
- Produces:
  - `src/identity/link.js`: `MAX_ACTIVE_LINKS = 3`, `MAGIC_TTL_MINUTES = 15`, `withTx(pool, fn)` (lỗi `23505` chạy lại 1 lần), `link(c, {customerId, appId, appUserId}) → {created}`, `linkUser(pool, args)`, `redeemClaim(pool, {app, token, appUserId})`, `redeemMagic(...)` → `{customer_ref, entitlements}`, `userEntitlements(db, {appId, appUserId}) → {entitlements}`, `claimForCheckout(pool, {claimKey, checkoutId}) → {app_link}|{return_url}|null` (`404 checkout_not_found|no_app`). Task 7 đổi tên `view` → `linkView` (export).
  - HTTP `src/http/identity.js` (Bearer API key app, `cache-control: no-store`): `POST /v1/claims/redeem`, `POST /v1/magic/redeem`, `GET /v1/users/:app_user_id/entitlements`; `APP_USER_ID` schema (1–128 ký tự ASCII in được, không khoảng trắng). `src/http/claim.js`: `GET /v1/checkout/:id/claim` → `200` / `202 {"status":"pending"}` (CORS như checkout).
  - `deps.claimKey` bật hai plugin (Task 7 thêm điều kiện `deps.mailer` cho plugin identity).

- [ ] **Step 1: Viết test fail**

`services/core-api/test/claims.test.js` (tạo mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { syncMessage } from '../src/billing/sync.js';
import { syncOutbox } from '../src/identity/sync.js';
import { appLinkFor } from '../src/identity/claims.js';
import { claimTokenFor } from '../src/identity/tokens.js';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, sha } from './helpers/app.js';
import { fakePaddle, paddleSub, paddleTxn, PRICE_ADDON } from './helpers/paddle.js';
import { APP_BODY, CK, CK2, CLAIM_KEY, WEB_BODY, custom, fakeMailer, fakeSecrets, inDays, seedApp, seedShop } from './helpers/identity.js';

const ORIGIN = 'https://try.witch.example';
const T = (n) => `2026-10-09T10:00:0${n}.123456Z`;
const TOKEN2 = 'B'.repeat(43);

describe('claim, magic link, linking, user entitlements', () => {
  let db;
  let app;
  let key;
  let paddle;
  const log = { warn: () => {}, error: () => {}, info: () => {} };
  const q = async (sql, p) => (await db.pool.query(sql, p)).rows;
  const call = (method, url, payload, apiKey = key) =>
    app.inject({ method, url, payload, headers: apiKey ? { authorization: `Bearer ${apiKey}` } : {} });
  const redeem = (token, appUserId, apiKey) => call('POST', '/v1/claims/redeem', { token, app_user_id: appUserId }, apiKey);
  const claimGet = (id = CK, origin = ORIGIN) => app.inject({ method: 'GET', url: `/v1/checkout/${id}/claim`, headers: { origin } });
  const types = async () => (await q('SELECT app_user_id, type FROM webhook_deliveries ORDER BY id')).map((r) => `${r.type}:${r.app_user_id}`);
  const buyWeekly = async () => {
    paddle.subscription(paddleSub({ status: 'active', custom_data: custom(CK), period_end: inDays(7), updated_at: T(1) }));
    paddle.transaction(paddleTxn({ id: 'txn_a', subscription_id: 'sub_1', custom_data: custom(CK), updated_at: T(2) }));
    await syncMessage({ pool: db.pool, paddle, log }, { entity: 'transaction', entity_id: 'txn_a' });
  };
  const tick = () => syncOutbox({ pool: db.pool, claimKey: CLAIM_KEY, log });
  const customer1 = async () => Number((await q("SELECT id FROM customers WHERE paddle_customer_id = 'ctm_1'"))[0].id);
  // An extra single-use token for a customer, as entitlement-sync would create it (no checkout).
  const extraToken = async (customerId, token, { appId = 'starlyn', days = 7 } = {}) =>
    db.pool.query(
      'INSERT INTO claim_tokens (token_hash, customer_id, app_id, expires_at) VALUES ($1, $2, $3, now() + make_interval(days => $4))',
      [sha(token), customerId, appId, days],
    );

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    const secrets = fakeSecrets();
    ({ api_key: key } = await seedShop(db.pool, { secrets }));
    await db.pool.query("INSERT INTO domains (host, status) VALUES ('try.witch.example', 'active')");
    paddle = fakePaddle();
    paddle.customer('ctm_1', 'buyer@example.com');
    ({ app } = await makeApp(db.pool, { webhookSecrets: secrets, claimKey: CLAIM_KEY, mailer: fakeMailer() }));
  });
  afterEach(() => app.close());

  it('GET /v1/checkout/:id/claim: 202 until entitlement-sync made the token, then the app link (CORS: funnel origins only)', async () => {
    await buyWeekly();
    const pending = await claimGet();
    expect(pending.statusCode).toBe(202);
    expect(pending.json()).toEqual({ status: 'pending' });
    await tick();
    const res = await claimGet();
    expect(res.statusCode).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe(ORIGIN);
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.json()).toEqual({ app_link: appLinkFor(APP_BODY, claimTokenFor(CLAIM_KEY, CK)) });
    expect((await claimGet(CK, 'https://evil.example')).statusCode).toBe(403);
    expect((await claimGet('01JA0000000000000000000099')).json()).toEqual({ error: 'checkout_not_found' });
    await db.pool.query('UPDATE funnels SET app_id = NULL');
    expect((await claimGet()).json()).toEqual({ error: 'no_app' });
  });

  it('redeem links the user, returns customer_ref + entitlements, and queues link.created', async () => {
    await buyWeekly();
    await tick();
    const res = await redeem(claimTokenFor(CLAIM_KEY, CK), 'u1');
    expect(res.statusCode).toBe(200);
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.json()).toEqual({
      customer_ref: expect.stringMatching(/^cus_[0-7][0-9A-HJKMNP-TV-Z]{25}$/),
      entitlements: [{ key: 'premium', active: true, expires_at: expect.any(String) }],
    });
    expect(await types()).toEqual(['link.created:u1']);
    const [d] = await q("SELECT payload FROM webhook_deliveries WHERE type = 'link.created'");
    expect(d.payload.entitlements).toEqual(res.json().entitlements);
    expect(d.payload.customer_ref).toBe(res.json().customer_ref);
    const ents = await call('GET', '/v1/users/u1/entitlements');
    expect(ents.json()).toEqual({ entitlements: res.json().entitlements });
    expect((await call('GET', '/v1/users/nobody/entitlements')).json()).toEqual({ entitlements: [] });
  });

  it('Review Focus 2: a claim token is single use, bound to its app; a retry by the same user is idempotent', async () => {
    await buyWeekly();
    await tick();
    const token = claimTokenFor(CLAIM_KEY, CK);
    expect((await redeem(token, 'u1')).statusCode).toBe(200);
    const again = await redeem(token, 'u1');
    expect(again.statusCode).toBe(200);
    expect(await types()).toEqual(['link.created:u1']);
    expect((await redeem(token, 'u2')).json()).toEqual({ error: 'claim_used' });
    const { api_key: otherKey } = await seedApp(db.pool, fakeSecrets(), { ...APP_BODY, id: 'zodiac' });
    const cross = await redeem(token, 'u1', otherKey);
    expect(cross.statusCode).toBe(404);
    expect(cross.json()).toEqual({ error: 'claim_not_found' });
    expect((await redeem('A'.repeat(43), 'u1')).statusCode).toBe(404);
    expect((await redeem('short', 'u1')).statusCode).toBe(404);
    expect((await redeem(token, 'u1', 'ikfa_wrong')).statusCode).toBe(401);
  });

  it('two users racing for one token: exactly one wins', async () => {
    await buyWeekly();
    await tick();
    const token = claimTokenFor(CLAIM_KEY, CK);
    const codes = (await Promise.all(['r1', 'r2', 'r3'].map((u) => redeem(token, u)))).map((r) => r.statusCode).sort();
    expect(codes).toEqual([200, 409, 409]);
    expect((await q('SELECT count(*)::int AS n FROM app_links'))[0].n).toBe(1);
  });

  it('expired token is 410; the token is not consumed', async () => {
    await buyWeekly();
    await extraToken(await customer1(), TOKEN2, { days: -1 });
    expect((await redeem(TOKEN2, 'u1')).json()).toEqual({ error: 'claim_expired' });
  });

  it('409 app_user_linked_elsewhere; the token stays unused', async () => {
    await buyWeekly();
    await tick();
    await redeem(claimTokenFor(CLAIM_KEY, CK), 'u1');
    const other = Number((await q("INSERT INTO customers (paddle_customer_id, email) VALUES ('ctm_2', 'b@example.com') RETURNING id"))[0].id);
    await extraToken(other, TOKEN2);
    expect((await redeem(TOKEN2, 'u1')).json()).toEqual({ error: 'app_user_linked_elsewhere' });
    expect((await q('SELECT used_at FROM claim_tokens WHERE token_hash = $1', [sha(TOKEN2)]))[0].used_at).toBeNull();
  });

  it('a 4th link replaces the oldest: link.revoked (empty entitlements) for it, at most 3 active', async () => {
    await buyWeekly();
    await tick();
    const cid = await customer1();
    const tokens = [claimTokenFor(CLAIM_KEY, CK), 'C'.repeat(43), 'D'.repeat(43), 'E'.repeat(43)];
    for (const t of tokens.slice(1)) await extraToken(cid, t);
    for (const [i, t] of tokens.entries()) expect((await redeem(t, `u${i + 1}`)).statusCode).toBe(200);
    expect(await types()).toEqual(['link.created:u1', 'link.created:u2', 'link.created:u3', 'link.revoked:u1', 'link.created:u4']);
    const revoked = (await q("SELECT payload FROM webhook_deliveries WHERE type = 'link.revoked'"))[0].payload;
    expect(revoked.entitlements).toEqual([]);
    expect((await q('SELECT app_user_id FROM app_links WHERE revoked_at IS NULL ORDER BY id')).map((r) => r.app_user_id)).toEqual(['u2', 'u3', 'u4']);
    expect((await call('GET', '/v1/users/u1/entitlements')).json()).toEqual({ entitlements: [] });
  });

  it('redeem before the Paddle webhook is processed: links with no entitlements, the update arrives later', async () => {
    const cid = Number((await q("INSERT INTO customers (paddle_customer_id, email) VALUES ('ctm_1', 'buyer@example.com') RETURNING id"))[0].id);
    await extraToken(cid, TOKEN2);
    expect((await redeem(TOKEN2, 'u1')).json().entitlements).toEqual([]);
    await buyWeekly();
    await tick();
    expect(await types()).toEqual(['link.created:u1', 'entitlement.updated:u1']);
  });

  it('web2web: return_url?ikf_ml=<magic token> once paid; the magic token is single use, 15 minutes, app bound', async () => {
    const { api_key: webKey } = await seedApp(db.pool, fakeSecrets(), WEB_BODY);
    await db.pool.query("UPDATE funnels SET app_id = 'tarot-web'");
    expect((await claimGet(CK2)).statusCode).toBe(202);
    paddle.transaction(paddleTxn({ id: 'txn_c', price_id: PRICE_ADDON, custom_data: custom(CK2, 'addon'), updated_at: T(3) }));
    await syncMessage({ pool: db.pool, paddle, log }, { entity: 'transaction', entity_id: 'txn_c' });
    await tick();
    const { return_url: url } = (await claimGet(CK2)).json();
    const u = new URL(url);
    expect(`${u.origin}${u.pathname}`).toBe('https://tarot.example/welcome');
    const ml = u.searchParams.get('ikf_ml');
    expect(ml).toMatch(/^[A-Za-z0-9_-]{43}$/);
    const [row] = await q('SELECT token_hash, expires_at FROM magic_links');
    expect(row.token_hash).toBe(sha(ml));
    expect((row.expires_at - Date.now()) / 60_000).toBeGreaterThan(14.9);
    const magic = (token, userId, k = webKey) => call('POST', '/v1/magic/redeem', { token, app_user_id: userId }, k);
    expect((await magic(ml, 'w1', key)).json()).toEqual({ error: 'magic_not_found' });
    const ok = await magic(ml, 'w1');
    expect(ok.json().entitlements).toEqual([{ key: 'tarot_2027', active: true, expires_at: null }]);
    expect((await magic(ml, 'w2')).json()).toEqual({ error: 'magic_used' });
    await db.pool.query("UPDATE magic_links SET used_at = NULL, expires_at = now() - interval '1 second'");
    expect((await magic(ml, 'w3')).json()).toEqual({ error: 'magic_expired' });
  });

  it('400 for a malformed app_user_id; 401 without a key', async () => {
    expect((await redeem('A'.repeat(43), 'has space')).statusCode).toBe(400);
    expect((await redeem('A'.repeat(43), 'x'.repeat(129))).statusCode).toBe(400);
    expect((await redeem('A'.repeat(43), 'u1', null)).statusCode).toBe(401);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api
```

Expected: FAIL — `claims.test.js` `Tests  10 failed (10)` (route chưa có → `404`); các file khác pass.

- [ ] **Step 3: Implement**

`services/core-api/src/app.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/app.js b/services/core-api/src/app.js
index f7ae580..48aa74c 100644
--- a/services/core-api/src/app.js
+++ b/services/core-api/src/app.js
@@ -10,6 +10,8 @@ import checkoutHttp from './http/checkout.js';
 import webhookHttp from './http/webhook.js';
 import billingHttp from './http/billing.js';
 import appsHttp from './http/apps.js';
+import identityHttp from './http/identity.js';
+import claimHttp from './http/claim.js';
 
 export function buildApp({ checks = {}, timeoutMs = 1000, logger = false, deps } = {}) {
   const app = Fastify({ logger });
@@ -52,6 +54,8 @@ export function buildApp({ checks = {}, timeoutMs = 1000, logger = false, deps }
   if (deps?.pool && deps?.queue && deps?.webhookSecret) app.register(webhookHttp, deps);
   if (deps?.pool && deps?.paddle && deps?.queue) app.register(billingHttp, deps);
   if (deps?.pool && deps?.webhookSecrets) app.register(appsHttp, deps);
+  if (deps?.pool && deps?.claimKey) app.register(identityHttp, deps);
+  if (deps?.pool && deps?.claimKey) app.register(claimHttp, deps);
 
   return app;
 }
PATCH
```

`services/core-api/src/http/claim.js` (tạo mới):

```js
import { ULID_RE } from '@ikf/event-schema';
import { allowedOrigin } from '../billing/cors.js';
import { claimForCheckout } from '../identity/link.js';

// GET /v1/checkout/:id/claim from the funnel page after checkout_complete: same CORS rule as checkout.
export default async function claimHttp(app, { pool, previewBaseUrl, claimKey }) {
  const previewHost = new URL(previewBaseUrl).hostname;
  app.addHook('onRequest', async (req, reply) => {
    const origin = req.headers.origin;
    if (!(await allowedOrigin(pool, origin, previewHost))) {
      return reply.code(403).header('cache-control', 'no-store').send({ error: 'origin_not_allowed' });
    }
    reply.header('access-control-allow-origin', origin).header('vary', 'origin');
  });
  app.options('/v1/checkout/:id/claim', async (req, reply) =>
    reply.code(204).header('access-control-allow-methods', 'GET').header('access-control-max-age', '600').send());
  app.get(
    '/v1/checkout/:id/claim',
    { schema: { params: { type: 'object', required: ['id'], properties: { id: { type: 'string', pattern: ULID_RE.source } } } } },
    async (req, reply) => {
      reply.header('cache-control', 'no-store');
      const out = await claimForCheckout(pool, { claimKey, checkoutId: req.params.id });
      if (!out) return reply.code(202).send({ status: 'pending' });
      return out;
    },
  );
}
```

`services/core-api/src/http/identity.js` (tạo mới):

```js
import { requireApp } from '../identity/apps.js';
import { redeemClaim, redeemMagic, userEntitlements } from '../identity/link.js';

export const APP_USER_ID = { type: 'string', minLength: 1, maxLength: 128, pattern: '^[\\x21-\\x7e]+$' };
const tokenBody = {
  type: 'object',
  required: ['token', 'app_user_id'],
  properties: { token: { type: 'string', maxLength: 200 }, app_user_id: APP_USER_ID },
};

// The app-backend API (spec §3): Authorization: Bearer <app api key>. Nothing here is cacheable.
export default async function identityHttp(app, deps) {
  const { pool } = deps;
  app.addHook('onRequest', requireApp(pool));
  app.addHook('onSend', async (req, reply) => {
    reply.header('cache-control', 'no-store');
  });

  app.post('/v1/claims/redeem', { schema: { body: tokenBody } }, async (req) =>
    redeemClaim(pool, { app: req.caller, token: req.body.token, appUserId: req.body.app_user_id }));

  app.post('/v1/magic/redeem', { schema: { body: tokenBody } }, async (req) =>
    redeemMagic(pool, { app: req.caller, token: req.body.token, appUserId: req.body.app_user_id }));

  app.get(
    '/v1/users/:app_user_id/entitlements',
    { schema: { params: { type: 'object', required: ['app_user_id'], properties: { app_user_id: APP_USER_ID } } } },
    async (req) => userEntitlements(pool, { appId: req.caller.id, appUserId: req.params.app_user_id }),
  );
}
```

`services/core-api/src/identity/link.js` (tạo mới):

```js
import { HttpError } from '../errors.js';
import { appLinkFor } from './claims.js';
import { addDelivery, customerRef, entitlementsOf, lockCustomer } from './entitlements.js';
import { claimTokenFor, randomToken, sha256, TOKEN_RE } from './tokens.js';

export const MAX_ACTIVE_LINKS = 3;
export const MAGIC_TTL_MINUTES = 15;

// One transaction; a unique violation (two customers racing for one app_user_id) retries once, and the
// retry then sees the winner's link → 409.
export async function withTx(pool, fn) {
  for (let attempt = 0; ; attempt += 1) {
    const c = await pool.connect();
    try {
      await c.query('BEGIN');
      const out = await fn(c);
      await c.query('COMMIT');
      return out;
    } catch (err) {
      await c.query('ROLLBACK').catch(() => {});
      if (err.code === '23505' && attempt === 0) continue;
      throw err;
    } finally {
      c.release();
    }
  }
}

const view = async (c, customerId, appId) => ({
  customer_ref: await customerRef(c, customerId),
  entitlements: await entitlementsOf(c, customerId, appId),
});

// Spec §3 "Liên kết", inside the caller's transaction.
export async function link(c, { customerId, appId, appUserId }) {
  await lockCustomer(c, customerId);
  const existing = await c.query(
    'SELECT customer_id FROM app_links WHERE app_id = $1 AND app_user_id = $2 AND revoked_at IS NULL FOR UPDATE',
    [appId, appUserId],
  );
  if (existing.rows.length) {
    if (Number(existing.rows[0].customer_id) === Number(customerId)) return { created: false };
    throw new HttpError(409, 'app_user_linked_elsewhere');
  }
  const ref = await customerRef(c, customerId);
  const active = (
    await c.query(
      'SELECT id, app_user_id FROM app_links WHERE customer_id = $1 AND app_id = $2 AND revoked_at IS NULL ORDER BY linked_at, id FOR UPDATE',
      [customerId, appId],
    )
  ).rows;
  while (active.length >= MAX_ACTIVE_LINKS) {
    const oldest = active.shift();
    await c.query('UPDATE app_links SET revoked_at = now() WHERE id = $1', [oldest.id]);
    await addDelivery(c, { appId, appUserId: oldest.app_user_id, type: 'link.revoked', customerRef: ref, entitlements: [] });
  }
  await c.query('INSERT INTO app_links (customer_id, app_id, app_user_id) VALUES ($1, $2, $3)', [customerId, appId, appUserId]);
  await addDelivery(c, { appId, appUserId, type: 'link.created', customerRef: ref, entitlements: await entitlementsOf(c, customerId, appId) });
  return { created: true };
}

export const linkUser = (pool, args) =>
  withTx(pool, async (c) => {
    await link(c, args);
    return view(c, args.customerId, args.appId);
  });

// Single-use token (claim_tokens or magic_links) → link. Order: unknown/other app 404, used 409 (but the
// same user again is an idempotent 200, for a backend retrying after a lost reply), expired 410.
async function redeem(pool, table, notFound, used, expired, { app, token, appUserId }) {
  if (!TOKEN_RE.test(token ?? '')) throw new HttpError(404, notFound);
  return withTx(pool, async (c) => {
    const { rows } = await c.query(`SELECT customer_id, app_id, expires_at, used_at FROM ${table} WHERE token_hash = $1 FOR UPDATE`, [sha256(token)]);
    const t = rows[0];
    if (!t || t.app_id !== app.id) throw new HttpError(404, notFound);
    const customerId = Number(t.customer_id);
    if (t.used_at) {
      const mine = await c.query(
        'SELECT 1 FROM app_links WHERE app_id = $1 AND app_user_id = $2 AND customer_id = $3 AND revoked_at IS NULL',
        [app.id, appUserId, customerId],
      );
      if (!mine.rows.length) throw new HttpError(409, used);
      return view(c, customerId, app.id);
    }
    if (t.expires_at <= new Date()) throw new HttpError(410, expired);
    await link(c, { customerId, appId: app.id, appUserId });
    await c.query(`UPDATE ${table} SET used_at = now() WHERE token_hash = $1`, [sha256(token)]);
    return view(c, customerId, app.id);
  });
}

export const redeemClaim = (pool, args) => redeem(pool, 'claim_tokens', 'claim_not_found', 'claim_used', 'claim_expired', args);
export const redeemMagic = (pool, args) => redeem(pool, 'magic_links', 'magic_not_found', 'magic_used', 'magic_expired', args);

export async function userEntitlements(db, { appId, appUserId }) {
  const { rows } = await db.query(
    'SELECT customer_id FROM app_links WHERE app_id = $1 AND app_user_id = $2 AND revoked_at IS NULL',
    [appId, appUserId],
  );
  if (!rows.length) return { entitlements: [] };
  return { entitlements: await entitlementsOf(db, rows[0].customer_id, appId) };
}

// GET /v1/checkout/:id/claim (spec §3.2, §3.4): {app_link} | {return_url} | null (= 202 pending).
export async function claimForCheckout(pool, { claimKey, checkoutId }) {
  const { rows } = await pool.query(
    `SELECT a.id, a.kind, a.adjust_tracker_url, a.deeplink_scheme, a.return_url, (f.app_id IS NOT NULL) AS has_app
       FROM checkouts ck JOIN funnels f ON f.id = ck.funnel_id LEFT JOIN apps a ON a.id = f.app_id WHERE ck.id = $1`,
    [checkoutId],
  );
  if (!rows.length) throw new HttpError(404, 'checkout_not_found');
  const app = rows[0];
  if (!app.has_app) throw new HttpError(404, 'no_app');
  if (app.kind === 'app') {
    const claim = await pool.query('SELECT 1 FROM claim_tokens WHERE checkout_id = $1', [checkoutId]);
    return claim.rows.length ? { app_link: appLinkFor(app, claimTokenFor(claimKey, checkoutId)) } : null;
  }
  const paid = await pool.query(
    "SELECT customer_id FROM transactions WHERE checkout_id = $1 AND status = 'completed' AND customer_id IS NOT NULL LIMIT 1",
    [checkoutId],
  );
  if (!paid.rows.length) return null;
  const token = randomToken(32);
  await pool.query(
    'INSERT INTO magic_links (token_hash, customer_id, app_id, expires_at) VALUES ($1, $2, $3, now() + make_interval(mins => $4))',
    [sha256(token), paid.rows[0].customer_id, app.id, MAGIC_TTL_MINUTES],
  );
  const u = new URL(app.return_url);
  u.searchParams.set('ikf_ml', token);
  return { return_url: u.toString() };
}
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api
```

Expected: `Test Files  27 passed (27)`, `Tests  269 passed (269)` (`claims.test.js`: 10).

- [ ] **Step 5: Commit**

```bash
git add services/core-api
git commit -m "feat(core-api): claim + magic-link redeem, linking (max 3, link.revoked), user entitlements, GET /v1/checkout/:id/claim"
```

---

### Task 7: Khôi phục bằng email: `POST /v1/otp/send`, `POST /v1/otp/verify`

**Files:**
- Create: `services/core-api/src/identity/otp.js`
- Modify: `services/core-api/src/app.js`, `services/core-api/src/http/identity.js`, `services/core-api/src/identity/apps.js`, `services/core-api/src/identity/link.js`
- Test: `services/core-api/test/otp.test.js`

**Interfaces:**
- Consumes: `link`, `withTx` (Task 6), `emailHash`, `safeEqual`, `sha256` (Task 3), `mailer` (Task 5).
- Produces (`src/identity/otp.js`): `OTP_TTL_MINUTES = 10`, `OTP_MAX_ATTEMPTS = 5`, `OTP_MAX_PER_HOUR = 3`, `customerForEmail(db, email, appId)`, `sendOtp(pool, {app, email, mailer, log})` (không await SES, E18), `verifyOtp(pool, {app, email, code, appUserId}) → {customer_ref, entitlements}` (`401 otp_invalid` — lần sai được **commit**; `429 otp_locked`). Route trong `src/http/identity.js`; `appForKey` trả thêm `name` (tên app trong email). Plugin identity cần `deps.mailer`.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/otp.test.js` (tạo mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { syncMessage } from '../src/billing/sync.js';
import { syncOutbox } from '../src/identity/sync.js';
import { sendOtp } from '../src/identity/otp.js';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, sha } from './helpers/app.js';
import { fakePaddle, paddleSub, paddleTxn } from './helpers/paddle.js';
import { APP_BODY, CK, CLAIM_KEY, custom, fakeMailer, fakeSecrets, inDays, seedApp, seedShop } from './helpers/identity.js';

const T = (n) => `2026-10-09T10:00:0${n}.123456Z`;

describe('OTP restore: POST /v1/otp/send, /v1/otp/verify', () => {
  let db;
  let app;
  let key;
  let mailer;
  const q = async (sql, p) => (await db.pool.query(sql, p)).rows;
  const post = (url, payload, apiKey = key) => app.inject({ method: 'POST', url, payload, headers: { authorization: `Bearer ${apiKey}` } });
  const send = (email, apiKey) => post('/v1/otp/send', { email }, apiKey);
  const verify = (code, appUserId = 'u1', email = 'buyer@example.com', apiKey = key) => post('/v1/otp/verify', { email, code, app_user_id: appUserId }, apiKey);
  const lastCode = () => /code is (\d{6})/.exec(mailer.sent.at(-1).text)[1];
  const wrong = (code) => String((Number(code) + 1) % 1_000_000).padStart(6, '0');

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    const secrets = fakeSecrets();
    ({ api_key: key } = await seedShop(db.pool, { secrets }));
    const paddle = fakePaddle();
    paddle.customer('ctm_1', 'Buyer@Example.com');
    const log = { warn: () => {}, error: () => {}, info: () => {} };
    paddle.subscription(paddleSub({ status: 'active', custom_data: custom(CK), period_end: inDays(7), updated_at: T(1) }));
    paddle.transaction(paddleTxn({ id: 'txn_a', subscription_id: 'sub_1', custom_data: custom(CK), updated_at: T(2) }));
    await syncMessage({ pool: db.pool, paddle, log }, { entity: 'transaction', entity_id: 'txn_a' });
    await syncOutbox({ pool: db.pool, claimKey: CLAIM_KEY, log });
    mailer = fakeMailer();
    ({ app } = await makeApp(db.pool, { webhookSecrets: secrets, claimKey: CLAIM_KEY, mailer }));
  });
  afterEach(() => app.close());

  it('a buyer gets a 6-digit code; the right code links the user like a claim (email matched case/space-insensitively)', async () => {
    const res = await send('  buyer@EXAMPLE.com ');
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({});
    expect(mailer.sent).toHaveLength(1);
    expect(mailer.sent[0].to).toBe('Buyer@Example.com');
    const code = lastCode();
    const [row] = await q('SELECT email_hash, code_hash, expires_at FROM otp_codes');
    expect(row.email_hash).toBe(sha('buyer@example.com'));
    expect(row.code_hash).not.toContain(code);
    expect((row.expires_at - Date.now()) / 60_000).toBeGreaterThan(9.9);
    const ok = await verify(code);
    expect(ok.statusCode).toBe(200);
    expect(ok.json()).toEqual({ customer_ref: expect.stringMatching(/^cus_/), entitlements: [{ key: 'premium', active: true, expires_at: expect.any(String) }] });
    expect((await q('SELECT type, app_user_id FROM webhook_deliveries'))).toEqual([{ type: 'link.created', app_user_id: 'u1' }]);
    expect((await verify(code, 'u2')).json()).toEqual({ error: 'otp_invalid' });
  });

  it('Review Focus 3: a stranger, or a buyer without entitlements in this app, gets the same 200 {} and no email', async () => {
    const known = await send('buyer@example.com');
    const strangers = [await send('nobody@example.com'), await send('not-an-email')];
    const { api_key: zodiacKey } = await seedApp(db.pool, fakeSecrets(), { ...APP_BODY, id: 'zodiac' });
    strangers.push(await send('buyer@example.com', zodiacKey));
    for (const r of strangers) {
      expect(r.statusCode).toBe(known.statusCode);
      expect(r.body).toBe(known.body);
      expect(r.headers['content-type']).toBe(known.headers['content-type']);
    }
    expect(mailer.sent).toHaveLength(1);
    expect((await q('SELECT count(*)::int AS n FROM otp_codes'))[0].n).toBe(1);
    expect((await verify(lastCode(), 'z1', 'buyer@example.com', zodiacKey)).json()).toEqual({ error: 'otp_invalid' });
  });

  it('Review Focus 3: the reply does not wait for SES (a hanging send still answers at once)', async () => {
    const hanging = { send: () => new Promise(() => {}) };
    const { app: slow } = await makeApp(db.pool, { webhookSecrets: fakeSecrets(), claimKey: CLAIM_KEY, mailer: hanging });
    const res = await slow.inject({ method: 'POST', url: '/v1/otp/send', payload: { email: 'buyer@example.com' }, headers: { authorization: `Bearer ${key}` } });
    expect(res.statusCode).toBe(200);
    await slow.close();
  });

  it('at most 3 codes per hour per (email, app)', async () => {
    for (let i = 0; i < 5; i += 1) expect((await send('buyer@example.com')).statusCode).toBe(200);
    expect(mailer.sent).toHaveLength(3);
    await db.pool.query("UPDATE otp_codes SET created_at = now() - interval '61 minutes'");
    await send('buyer@example.com');
    expect(mailer.sent).toHaveLength(4);
  });

  it('5 wrong codes lock the code: the right one is then 429 otp_locked', async () => {
    await send('buyer@example.com');
    const code = lastCode();
    for (let i = 0; i < 5; i += 1) expect((await verify(wrong(code))).json()).toEqual({ error: 'otp_invalid' });
    expect((await q('SELECT attempts FROM otp_codes'))[0].attempts).toBe(5);
    const locked = await verify(code);
    expect(locked.statusCode).toBe(429);
    expect(locked.json()).toEqual({ error: 'otp_locked' });
    expect((await verify('12ab56')).statusCode).toBe(429);
  });

  it('an expired code, a code before any send, or a non-numeric code is 401 otp_invalid', async () => {
    expect((await verify('123456')).statusCode).toBe(401);
    await send('buyer@example.com');
    expect((await verify('abcdef')).json()).toEqual({ error: 'otp_invalid' });
    await db.pool.query("UPDATE otp_codes SET expires_at = now() - interval '1 second'");
    expect((await verify(lastCode())).json()).toEqual({ error: 'otp_invalid' });
  });

  it('only the latest code counts', async () => {
    await send('buyer@example.com');
    const first = lastCode();
    await send('buyer@example.com');
    if (first !== lastCode()) expect((await verify(first)).statusCode).toBe(401);
    expect((await verify(lastCode())).statusCode).toBe(200);
  });

  it('SES failure is logged with email_hash only, never the email', async () => {
    const logs = [];
    const failing = { send: async () => { throw new Error('ses down'); } };
    const appRow = { id: 'starlyn', name: 'Starlyn' };
    await sendOtp(db.pool, { app: appRow, email: 'buyer@example.com', mailer: failing, log: { warn: (o, m) => logs.push([m, o]), info: () => {} } });
    await new Promise((r) => setTimeout(r, 10));
    expect(logs).toEqual([['otp_email_failed', { email_hash: sha('buyer@example.com'), app_id: 'starlyn', err: 'ses down' }]]);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api
```

Expected: FAIL — `otp.test.js`: `Cannot find module '../src/identity/otp.js'`; 269 test cũ pass.

- [ ] **Step 3: Implement**

`services/core-api/src/app.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/app.js b/services/core-api/src/app.js
index 48aa74c..80aac1f 100644
--- a/services/core-api/src/app.js
+++ b/services/core-api/src/app.js
@@ -54,7 +54,7 @@ export function buildApp({ checks = {}, timeoutMs = 1000, logger = false, deps }
   if (deps?.pool && deps?.queue && deps?.webhookSecret) app.register(webhookHttp, deps);
   if (deps?.pool && deps?.paddle && deps?.queue) app.register(billingHttp, deps);
   if (deps?.pool && deps?.webhookSecrets) app.register(appsHttp, deps);
-  if (deps?.pool && deps?.claimKey) app.register(identityHttp, deps);
+  if (deps?.pool && deps?.claimKey && deps?.mailer) app.register(identityHttp, deps);
   if (deps?.pool && deps?.claimKey) app.register(claimHttp, deps);
 
   return app;
PATCH
```

`services/core-api/src/http/identity.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/http/identity.js b/services/core-api/src/http/identity.js
index 41f41e3..f399dd8 100644
--- a/services/core-api/src/http/identity.js
+++ b/services/core-api/src/http/identity.js
@@ -1,5 +1,6 @@
 import { requireApp } from '../identity/apps.js';
 import { redeemClaim, redeemMagic, userEntitlements } from '../identity/link.js';
+import { sendOtp, verifyOtp } from '../identity/otp.js';
 
 export const APP_USER_ID = { type: 'string', minLength: 1, maxLength: 128, pattern: '^[\\x21-\\x7e]+$' };
 const tokenBody = {
@@ -10,7 +11,7 @@ const tokenBody = {
 
 // The app-backend API (spec §3): Authorization: Bearer <app api key>. Nothing here is cacheable.
 export default async function identityHttp(app, deps) {
-  const { pool } = deps;
+  const { pool, mailer } = deps;
   app.addHook('onRequest', requireApp(pool));
   app.addHook('onSend', async (req, reply) => {
     reply.header('cache-control', 'no-store');
@@ -22,6 +23,30 @@ export default async function identityHttp(app, deps) {
   app.post('/v1/magic/redeem', { schema: { body: tokenBody } }, async (req) =>
     redeemMagic(pool, { app: req.caller, token: req.body.token, appUserId: req.body.app_user_id }));
 
+  const email = { type: 'string', minLength: 3, maxLength: 254 };
+  app.post(
+    '/v1/otp/send',
+    { schema: { body: { type: 'object', required: ['email'], properties: { email } } } },
+    async (req) => {
+      await sendOtp(pool, { app: req.caller, email: req.body.email, mailer, log: req.log });
+      return {};
+    },
+  );
+
+  app.post(
+    '/v1/otp/verify',
+    {
+      schema: {
+        body: {
+          type: 'object',
+          required: ['email', 'code', 'app_user_id'],
+          properties: { email, code: { type: 'string', maxLength: 12 }, app_user_id: APP_USER_ID },
+        },
+      },
+    },
+    async (req) => verifyOtp(pool, { app: req.caller, email: req.body.email, code: req.body.code, appUserId: req.body.app_user_id }),
+  );
+
   app.get(
     '/v1/users/:app_user_id/entitlements',
     { schema: { params: { type: 'object', required: ['app_user_id'], properties: { app_user_id: APP_USER_ID } } } },
PATCH
```

`services/core-api/src/identity/apps.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/identity/apps.js b/services/core-api/src/identity/apps.js
index 95da310..8c9f77c 100644
--- a/services/core-api/src/identity/apps.js
+++ b/services/core-api/src/identity/apps.js
@@ -91,7 +91,7 @@ export async function appForKey(db, key) {
   if (!API_KEY_RE.test(key ?? '')) return null;
   const h = sha256(key);
   const { rows } = await db.query(
-    `SELECT id, kind, adjust_tracker_url, deeplink_scheme, return_url FROM apps
+    `SELECT id, name, kind, adjust_tracker_url, deeplink_scheme, return_url FROM apps
       WHERE api_key_hash = $1 OR (prev_api_key_hash = $1 AND prev_key_expires_at > now())`,
     [h],
   );
PATCH
```

`services/core-api/src/identity/link.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/identity/link.js b/services/core-api/src/identity/link.js
index eaa4508..ac81456 100644
--- a/services/core-api/src/identity/link.js
+++ b/services/core-api/src/identity/link.js
@@ -26,7 +26,7 @@ export async function withTx(pool, fn) {
   }
 }
 
-const view = async (c, customerId, appId) => ({
+export const linkView = async (c, customerId, appId) => ({
   customer_ref: await customerRef(c, customerId),
   entitlements: await entitlementsOf(c, customerId, appId),
 });
@@ -62,7 +62,7 @@ export async function link(c, { customerId, appId, appUserId }) {
 export const linkUser = (pool, args) =>
   withTx(pool, async (c) => {
     await link(c, args);
-    return view(c, args.customerId, args.appId);
+    return linkView(c, args.customerId, args.appId);
   });
 
 // Single-use token (claim_tokens or magic_links) → link. Order: unknown/other app 404, used 409 (but the
@@ -80,12 +80,12 @@ async function redeem(pool, table, notFound, used, expired, { app, token, appUse
         [app.id, appUserId, customerId],
       );
       if (!mine.rows.length) throw new HttpError(409, used);
-      return view(c, customerId, app.id);
+      return linkView(c, customerId, app.id);
     }
     if (t.expires_at <= new Date()) throw new HttpError(410, expired);
     await link(c, { customerId, appId: app.id, appUserId });
     await c.query(`UPDATE ${table} SET used_at = now() WHERE token_hash = $1`, [sha256(token)]);
-    return view(c, customerId, app.id);
+    return linkView(c, customerId, app.id);
   });
 }
 
PATCH
```

`services/core-api/src/identity/otp.js` (tạo mới):

```js
import { randomInt } from 'node:crypto';
import { HttpError } from '../errors.js';
import { link, linkView, withTx } from './link.js';
import { emailHash, safeEqual, sha256 } from './tokens.js';

export const OTP_TTL_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_MAX_PER_HOUR = 3;

const norm = (email) => String(email).trim().toLowerCase();
const codeHash = (h, code) => sha256(`${h}:${code}`);

// The buyer behind an email, if they have at least one entitlement row in this app (latest customer wins).
export async function customerForEmail(db, email, appId) {
  const { rows } = await db.query(
    `SELECT c.id, c.email FROM customers c
      WHERE lower(btrim(c.email)) = $1
        AND EXISTS (SELECT 1 FROM entitlements e WHERE e.customer_id = c.id AND e.app_id = $2)
      ORDER BY c.id DESC LIMIT 1`,
    [norm(email), appId],
  );
  return rows[0] ?? null;
}

// POST /v1/otp/send: always 200 {} to the caller (spec §3). A code is stored and mailed only for a buyer
// with entitlements in this app, at most 3 per hour per (email_hash, app). The SES call is NOT awaited, so
// the reply time does not tell a buyer's email from a stranger's (Review Focus 3).
export async function sendOtp(pool, { app, email, mailer, log }) {
  const h = emailHash(email);
  const recent = await pool.query(
    "SELECT count(*)::int AS n FROM otp_codes WHERE email_hash = $1 AND app_id = $2 AND created_at > now() - interval '1 hour'",
    [h, app.id],
  );
  if (recent.rows[0].n >= OTP_MAX_PER_HOUR) {
    log?.info({ email_hash: h, app_id: app.id }, 'otp_rate_limited');
    return;
  }
  const customer = await customerForEmail(pool, email, app.id);
  if (!customer) return;
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  await pool.query(
    'INSERT INTO otp_codes (email_hash, app_id, code_hash, expires_at) VALUES ($1, $2, $3, now() + make_interval(mins => $4))',
    [h, app.id, codeHash(h, code), OTP_TTL_MINUTES],
  );
  const name = app.name ?? app.id;
  Promise.resolve()
    .then(() => mailer.send({
      to: customer.email,
      subject: `Your ${name} code: ${code}`,
      text: `Your ${name} code is ${code}. It expires in ${OTP_TTL_MINUTES} minutes. If you did not ask for it, ignore this email.`,
      html: `<p>Your ${name} code is <b>${code}</b>.</p><p>It expires in ${OTP_TTL_MINUTES} minutes. If you did not ask for it, ignore this email.</p>`,
    }))
    .catch((err) => log?.warn({ email_hash: h, app_id: app.id, err: err.message }, 'otp_email_failed'));
}

// POST /v1/otp/verify: the latest unused code of (email_hash, app). Wrong → 401 otp_invalid (the attempt
// is counted and committed); 5 wrong → 429 otp_locked; right → link like a claim (spec §3).
export async function verifyOtp(pool, { app, email, code, appUserId }) {
  const h = emailHash(email);
  const out = await withTx(pool, async (c) => {
    const { rows } = await c.query(
      `SELECT id, code_hash, attempts, expires_at FROM otp_codes
        WHERE email_hash = $1 AND app_id = $2 AND used_at IS NULL ORDER BY id DESC LIMIT 1 FOR UPDATE`,
      [h, app.id],
    );
    const row = rows[0];
    if (!row || row.expires_at <= new Date()) return { error: [401, 'otp_invalid'] };
    if (row.attempts >= OTP_MAX_ATTEMPTS) return { error: [429, 'otp_locked'] };
    if (!/^\d{6}$/.test(String(code)) || !safeEqual(codeHash(h, code), row.code_hash)) {
      await c.query('UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1', [row.id]);
      return { error: [401, 'otp_invalid'] };
    }
    const customer = await customerForEmail(c, email, app.id);
    if (!customer) return { error: [401, 'otp_invalid'] };
    await link(c, { customerId: Number(customer.id), appId: app.id, appUserId });
    await c.query('UPDATE otp_codes SET used_at = now() WHERE id = $1', [row.id]);
    return { view: await linkView(c, Number(customer.id), app.id) };
  });
  if (out.error) throw new HttpError(...out.error);
  return out.view;
}
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api
```

Expected: `Test Files  28 passed (28)`, `Tests  277 passed (277)` (`otp.test.js`: 8).

- [ ] **Step 5: Commit**

```bash
git add services/core-api
git commit -m "feat(core-api): OTP restore (send always 200, 3/hour, 5 attempts, SES not awaited) + verify links the user"
```

---

### Task 8: Worker `webhook-sender` + `ikf app webhooks` API + tra cứu khách

Test dùng một **server HTTP thật** trên `127.0.0.1` làm backend app (`startReceiver`) và `fetch` thật, nên chữ ký được kiểm trên đúng byte đi qua mạng. Test vector chữ ký được chạy ra từ code và dùng lại trong `docs/integration/app-backend.md` (Task 12 có test giữ hai nơi khớp nhau).

**Files:**
- Create: `services/core-api/src/identity/customers.js`, `services/core-api/src/identity/webhooks.js`
- Modify: `services/core-api/src/http/apps.js`
- Test: `services/core-api/test/helpers/identity.js`, `services/core-api/test/webhooks.test.js`

**Interfaces:**
- Consumes: `addDelivery` (Task 5), `safeEqual` (Task 3), `seedApp`, `fakeSecrets`, `fakeMailer`, `CLAIM_KEY` (helpers).
- Produces:
  - `src/identity/webhooks.js`: `RETRY_SCHEDULE_MS`, `SEND_TIMEOUT_MS = 10000`, `SEND_BATCH = 20`, `SEND_INTERVAL_MS = 1000`, `SECRET_CACHE_MS = 600000`, `signPayload(rawBody, secret, t) → 't=<t>,v1=<hex>'`, `verifySignature(rawBody, header, secret, nowMs?, toleranceSec=300) → bool`, `retryDelay(failures) → ms|null`, `secretCache(store, {ttlMs?, now?}) → {get}`, `sendDue({pool, secrets, fetch?, alarm, log, now?, timeoutMs?}) → {delivered, failed, dead}`, `startWebhookSender({pool, secrets, fetch?, alarm, log, intervalMs?}) → stop()`, `listDeliveries(db, {appId, status?, limit?})`, `resendDelivery(db, {appId, eventId}) → item|null`.
  - `src/identity/customers.js`: `customerReport(db, email) → {customers: [{customer_ref, paddle_customer_id, created_at, entitlements, links, deliveries}]}` (không trả email).
  - HTTP (thêm vào `src/http/apps.js`): `GET /v1/apps/:id/webhooks?status=&limit=` (router), `POST /v1/apps/:id/webhooks/:event_id/resend` (router, `404 delivery_not_found`), `POST /v1/customers/lookup {email}` (admin, E10).
  - Test helper `startReceiver()` → `{url, requests: [{headers, raw}], reply(...status|'hang'), close()}`.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/helpers/identity.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/test/helpers/identity.js b/services/core-api/test/helpers/identity.js
index 4b2c4b5..5686da4 100644
--- a/services/core-api/test/helpers/identity.js
+++ b/services/core-api/test/helpers/identity.js
@@ -86,3 +86,30 @@ export async function seedShop(pool, { secrets = fakeSecrets(), app = APP_BODY }
   }
   return { ...created, funnelId };
 }
+
+// A local app backend: records each webhook (raw body + headers); reply(status | 'hang') per request.
+export async function startReceiver() {
+  const { createServer } = await import('node:http');
+  const requests = [];
+  const replies = [];
+  const server = createServer((req, res) => {
+    const chunks = [];
+    req.on('data', (c) => chunks.push(c));
+    req.on('end', () => {
+      requests.push({ headers: req.headers, raw: Buffer.concat(chunks).toString('utf8') });
+      const r = replies.length ? replies.shift() : 200;
+      if (r === 'hang') return;
+      res.writeHead(r, r >= 300 && r < 400 ? { location: 'https://elsewhere.example/' } : {}).end('ok');
+    });
+  });
+  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
+  return {
+    url: `http://127.0.0.1:${server.address().port}/hook`,
+    requests,
+    reply: (...r) => replies.push(...r),
+    close: () => new Promise((resolve) => {
+      server.closeAllConnections();
+      server.close(resolve);
+    }),
+  };
+}
PATCH
```

`services/core-api/test/webhooks.test.js` (tạo mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { addDelivery } from '../src/identity/entitlements.js';
import { RETRY_SCHEDULE_MS, secretCache, sendDue, signPayload, startWebhookSender, verifySignature } from '../src/identity/webhooks.js';
import { startDb, resetDb } from './helpers/db.js';
import { bearer, makeApp, tokenFor } from './helpers/app.js';
import { APP_BODY, CLAIM_KEY, fakeMailer, fakeSecrets, seedApp, startReceiver } from './helpers/identity.js';

// Test vector, also printed in docs/integration/app-backend.md.
const VECTOR = {
  secret: 'whsec_test_0123456789',
  t: 1791540000,
  body: '{"id":"01K75Z0000000000000000000A","type":"entitlement.updated","app_id":"starlyn","app_user_id":"u_42","customer_ref":"cus_01K75Z0000000000000000000B","created_at":"2026-10-09T10:00:00.000Z","entitlements":[{"key":"premium","active":true,"expires_at":"2026-10-19T10:00:00.000Z"}]}',
};

describe('webhook signature', () => {
  it('matches the published test vector', () => {
    expect(signPayload(VECTOR.body, VECTOR.secret, VECTOR.t)).toBe(
      't=1791540000,v1=421e1124afa0a302d87e554e4460e51e349505be5250f3ec74c41465b17901bf',
    );
  });

  it('verifySignature: exact bytes, right secret, |now - t| <= 300s', () => {
    const header = signPayload(VECTOR.body, VECTOR.secret, VECTOR.t);
    const at = VECTOR.t * 1000;
    expect(verifySignature(VECTOR.body, header, VECTOR.secret, at)).toBe(true);
    expect(verifySignature(VECTOR.body, header, VECTOR.secret, at + 300_000)).toBe(true);
    expect(verifySignature(VECTOR.body, header, VECTOR.secret, at + 301_000)).toBe(false);
    expect(verifySignature(JSON.stringify(JSON.parse(VECTOR.body), null, 1), header, VECTOR.secret, at)).toBe(false);
    expect(verifySignature(VECTOR.body, header, 'whsec_other', at)).toBe(false);
    expect(verifySignature(VECTOR.body, 'v1=abc', VECTOR.secret, at)).toBe(false);
    expect(verifySignature(VECTOR.body, undefined, VECTOR.secret, at)).toBe(false);
  });
});

describe('webhook-sender', () => {
  let db;
  let rx;
  let store;
  let secrets;
  let alarms;
  let customerId;
  const q = async (sql, p) => (await db.pool.query(sql, p)).rows;
  const send = (o = {}) => sendDue({ pool: db.pool, secrets, alarm: async (k) => alarms.push(k), log: { warn: () => {}, error: () => {} }, ...o });
  const deliver = async (appUserId, n = 1, appId = 'starlyn') => {
    const c = await db.pool.connect();
    try {
      for (let i = 0; i < n; i += 1) {
        await addDelivery(c, { appId, appUserId, type: 'entitlement.updated', customerRef: 'cus_01K75Z0000000000000000000B', entitlements: [{ key: 'premium', active: i % 2 === 0, expires_at: null }] });
      }
    } finally {
      c.release();
    }
  };
  const rows = () => q('SELECT event_id, app_user_id, status, attempts, last_error, next_attempt_at - now() AS wait FROM webhook_deliveries ORDER BY id');
  const due = () => db.pool.query("UPDATE webhook_deliveries SET next_attempt_at = now() WHERE status = 'pending'");

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    rx = await startReceiver();
    store = fakeSecrets();
    secrets = secretCache(store);
    alarms = [];
    await seedApp(db.pool, store, APP_BODY);
    await db.pool.query('UPDATE apps SET webhook_url = $1', [rx.url]);
    customerId = (await q("INSERT INTO customers (paddle_customer_id) VALUES ('ctm_1') RETURNING id"))[0].id;
  });
  afterEach(() => rx.close());

  it('POSTs the stored payload, signed over the exact body with the app secret; 2xx → delivered', async () => {
    await deliver('u1');
    expect(await send()).toEqual({ delivered: 1, failed: 0, dead: 0 });
    const [r] = rx.requests;
    const [row] = await q('SELECT event_id, payload, status, attempts, delivered_at FROM webhook_deliveries');
    expect(r.headers['content-type']).toBe('application/json');
    expect(r.headers['ikf-event-id']).toBe(row.event_id);
    expect(JSON.parse(r.raw)).toEqual(row.payload);
    expect(verifySignature(r.raw, r.headers['ikf-signature'], store.values.get('starlyn'))).toBe(true);
    expect(row).toMatchObject({ status: 'delivered', attempts: 1 });
    expect(row.delivered_at).not.toBeNull();
    expect(await send()).toEqual({ delivered: 0, failed: 0, dead: 0 });
    expect(rx.requests).toHaveLength(1);
  });

  it('retry schedule 1m, 5m, 30m, 2h, 6h, 12h, 24h; the 8th failure is dead with ONE alarm per app per window', async () => {
    await deliver('u1');
    rx.reply(...Array(8).fill(500));
    const waits = [];
    for (let i = 0; i < 7; i += 1) {
      expect(await send()).toEqual({ delivered: 0, failed: 1, dead: 0 });
      const [r] = await rows();
      expect(r).toMatchObject({ status: 'pending', attempts: i + 1, last_error: 'http_500' });
      waits.push(Math.round(((r.wait.days ?? 0) * 86400 + (r.wait.hours ?? 0) * 3600 + (r.wait.minutes ?? 0) * 60 + (r.wait.seconds ?? 0)) / 60));
      await due();
    }
    expect(waits).toEqual(RETRY_SCHEDULE_MS.map((ms) => ms / 60_000));
    expect(await send()).toEqual({ delivered: 0, failed: 0, dead: 1 });
    expect((await rows())[0]).toMatchObject({ status: 'dead', attempts: 8 });
    expect(alarms).toEqual(['webhook_dead:starlyn']);
  });

  it('Review Focus 4: per user in order; a failing delivery holds back only that user; a dead one stops blocking', async () => {
    await deliver('u1', 2);
    await deliver('u2');
    rx.reply(500, 200);
    expect(await send()).toEqual({ delivered: 1, failed: 1, dead: 0 });
    expect(rx.requests.map((r) => JSON.parse(r.raw).app_user_id)).toEqual(['u1', 'u2']);
    await db.pool.query("UPDATE webhook_deliveries SET next_attempt_at = now() WHERE app_user_id = 'u1' AND attempts = 0");
    expect(await send()).toEqual({ delivered: 0, failed: 0, dead: 0 }); // u1's 2nd waits behind its 1st
    await db.pool.query("UPDATE webhook_deliveries SET status = 'dead' WHERE app_user_id = 'u1' AND attempts = 1");
    expect(await send()).toEqual({ delivered: 1, failed: 0, dead: 0 });
    const sent = rx.requests.map((r) => JSON.parse(r.raw));
    expect(sent[2].app_user_id).toBe('u1');
    expect(sent[2].entitlements[0].active).toBe(false); // the 2nd delivery of u1
  });

  it('two senders at once never POST a delivery twice nor a user out of order', async () => {
    await deliver('u1', 3);
    await deliver('u2', 2);
    for (let i = 0; i < 4; i += 1) await Promise.all([send(), send(), send()]);
    const ids = rx.requests.map((r) => r.headers['ikf-event-id']);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(5);
    const order = (await q('SELECT event_id, app_user_id FROM webhook_deliveries ORDER BY id'));
    for (const u of ['u1', 'u2']) {
      expect(ids.filter((id) => order.find((o) => o.event_id === id).app_user_id === u)).toEqual(order.filter((o) => o.app_user_id === u).map((o) => o.event_id));
    }
  });

  it('timeout, redirect and a missing secret are failures', async () => {
    await deliver('u1');
    await deliver('u2');
    rx.reply('hang', 302);
    await send({ timeoutMs: 200 });
    expect((await rows()).map((r) => r.last_error).sort()).toEqual(['http_302', 'timeout']);
    store.values.delete('starlyn');
    await due();
    await send({ secrets: secretCache(store) });
    expect((await rows()).map((r) => r.last_error)).toEqual(['no_secret', 'no_secret']);
  });

  it('the secret is read once per 10 minutes per app', async () => {
    let now = 0;
    const cache = secretCache(store, { now: () => now });
    await cache.get('starlyn');
    await cache.get('starlyn');
    expect(store.gets).toBe(1);
    now = 10 * 60_000;
    await cache.get('starlyn');
    expect(store.gets).toBe(2);
  });

  it('startWebhookSender delivers until stopped', async () => {
    await deliver('u1');
    const stop = startWebhookSender({ pool: db.pool, secrets, alarm: async () => {}, log: { warn: () => {}, error: () => {} }, intervalMs: 20 });
    for (let i = 0; i < 100 && !rx.requests.length; i += 1) await new Promise((r) => setTimeout(r, 20));
    await stop();
    expect(rx.requests).toHaveLength(1);
  });

  describe('admin API', () => {
    let app;
    let router;
    beforeEach(async () => {
      ({ app } = await makeApp(db.pool, { webhookSecrets: store, claimKey: CLAIM_KEY, mailer: fakeMailer() }));
      router = await tokenFor(db.pool, 'router');
    });
    afterEach(() => app.close());

    it('lists dead deliveries and resends one (pending, due now, schedule restarts)', async () => {
      await deliver('u1');
      await db.pool.query("UPDATE webhook_deliveries SET status = 'dead', attempts = 8, last_error = 'http_500'");
      const [{ event_id: ev }] = await q('SELECT event_id FROM webhook_deliveries');
      const list = await app.inject({ method: 'GET', url: '/v1/apps/starlyn/webhooks?status=dead', headers: bearer(router) });
      expect(list.json().items).toEqual([expect.objectContaining({ event_id: ev, status: 'dead', attempts: 8, last_error: 'http_500', app_user_id: 'u1' })]);
      const res = await app.inject({ method: 'POST', url: `/v1/apps/starlyn/webhooks/${ev}/resend`, headers: bearer(router) });
      expect(res.json()).toMatchObject({ event_id: ev, status: 'pending', attempts: 0, last_error: null });
      expect(await send()).toEqual({ delivered: 1, failed: 0, dead: 0 });
      expect((await app.inject({ method: 'POST', url: '/v1/apps/starlyn/webhooks/01JA0000000000000000000099/resend', headers: bearer(router) })).statusCode).toBe(404);
    });

    it('customer lookup (admin only): entitlements, links and recent deliveries by email in the body', async () => {
      await db.pool.query("UPDATE customers SET email = 'Buyer@Example.com', ref = 'cus_01K75Z0000000000000000000B'");
      await db.pool.query("INSERT INTO entitlements (customer_id, app_id, key, active, source, source_id) VALUES ($1, 'starlyn', 'premium', true, 'one_time', 'txn_1')", [customerId]);
      await db.pool.query("INSERT INTO app_links (customer_id, app_id, app_user_id) VALUES ($1, 'starlyn', 'u1')", [customerId]);
      await deliver('u1');
      const lookup = (token) => app.inject({ method: 'POST', url: '/v1/customers/lookup', headers: bearer(token), payload: { email: ' buyer@example.com' } });
      expect((await lookup(router)).statusCode).toBe(403);
      const res = await lookup(await tokenFor(db.pool, 'admin'));
      expect(res.statusCode).toBe(200);
      const [c] = res.json().customers;
      expect(c).toMatchObject({ customer_ref: 'cus_01K75Z0000000000000000000B', paddle_customer_id: 'ctm_1' });
      expect(c.entitlements).toEqual([expect.objectContaining({ app_id: 'starlyn', key: 'premium', active: true })]);
      expect(c.links).toEqual([expect.objectContaining({ app_user_id: 'u1', revoked_at: null })]);
      expect(c.deliveries).toEqual([expect.objectContaining({ type: 'entitlement.updated', status: 'pending' })]);
      expect(res.body).not.toContain('Buyer@Example.com');
    });
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api
```

Expected: FAIL — `webhooks.test.js`: `Cannot find module '../src/identity/webhooks.js'`; 277 test cũ pass.

- [ ] **Step 3: Implement**

`services/core-api/src/http/apps.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/http/apps.js b/services/core-api/src/http/apps.js
index 9c1c4fd..b8e2fb7 100644
--- a/services/core-api/src/http/apps.js
+++ b/services/core-api/src/http/apps.js
@@ -1,5 +1,8 @@
 import { requireRole } from '../auth.js';
+import { HttpError } from '../errors.js';
 import { createApp, listApps, rotateKey } from '../identity/apps.js';
+import { customerReport } from '../identity/customers.js';
+import { listDeliveries, resendDelivery } from '../identity/webhooks.js';
 
 const url = { type: 'string', minLength: 1, maxLength: 500 };
 const idParams = {
@@ -46,4 +49,54 @@ export default async function appsHttp(app, { pool, webhookSecrets }) {
     reply.header('cache-control', 'no-store');
     return rotateKey(pool, req.params.id);
   });
+
+  app.get(
+    '/v1/apps/:id/webhooks',
+    {
+      onRequest: router,
+      schema: {
+        params: idParams,
+        querystring: {
+          type: 'object',
+          properties: {
+            status: { type: 'string', enum: ['pending', 'delivered', 'dead'] },
+            limit: { type: 'integer', minimum: 1, maximum: 200, default: 50 },
+          },
+        },
+      },
+    },
+    async (req) => listDeliveries(pool, { appId: req.params.id, status: req.query.status ?? null, limit: req.query.limit }),
+  );
+
+  app.post(
+    '/v1/apps/:id/webhooks/:event_id/resend',
+    {
+      onRequest: router,
+      schema: {
+        params: {
+          type: 'object',
+          required: ['id', 'event_id'],
+          properties: { ...idParams.properties, event_id: { type: 'string', pattern: '^[0-7][0-9A-HJKMNP-TV-Z]{25}$' } },
+        },
+      },
+    },
+    async (req) => {
+      const out = await resendDelivery(pool, { appId: req.params.id, eventId: req.params.event_id });
+      if (!out) throw new HttpError(404, 'delivery_not_found');
+      return out;
+    },
+  );
+
+  // CS lookup, admin only (spec §6; E10: POST so the email stays out of URLs and access logs).
+  app.post(
+    '/v1/customers/lookup',
+    {
+      onRequest: requireRole(pool, 'admin'),
+      schema: { body: { type: 'object', required: ['email'], properties: { email: { type: 'string', minLength: 3, maxLength: 254 } } } },
+    },
+    async (req, reply) => {
+      reply.header('cache-control', 'no-store');
+      return customerReport(pool, req.body.email);
+    },
+  );
 }
PATCH
```

`services/core-api/src/identity/customers.js` (tạo mới):

```js
const iso = (d) => (d ? d.toISOString() : null);

// CS lookup (E10: POST body, so the email never sits in a URL or an access log).
export async function customerReport(db, email) {
  const { rows: customers } = await db.query(
    'SELECT id, ref, paddle_customer_id, created_at FROM customers WHERE lower(btrim(email)) = $1 ORDER BY id',
    [String(email).trim().toLowerCase()],
  );
  const out = [];
  for (const c of customers) {
    const ents = await db.query(
      'SELECT app_id, key, active, expires_at, source, source_id, updated_at FROM entitlements WHERE customer_id = $1 ORDER BY app_id, key',
      [c.id],
    );
    const links = await db.query(
      'SELECT app_id, app_user_id, linked_at, revoked_at FROM app_links WHERE customer_id = $1 ORDER BY id',
      [c.id],
    );
    const deliveries = c.ref
      ? await db.query(
        `SELECT event_id, app_id, app_user_id, type, status, attempts, last_error, created_at FROM webhook_deliveries
          WHERE payload->>'customer_ref' = $1 ORDER BY id DESC LIMIT 20`,
        [c.ref],
      )
      : { rows: [] };
    out.push({
      customer_ref: c.ref,
      paddle_customer_id: c.paddle_customer_id,
      created_at: iso(c.created_at),
      entitlements: ents.rows.map((e) => ({ ...e, expires_at: iso(e.expires_at), updated_at: iso(e.updated_at) })),
      links: links.rows.map((l) => ({ ...l, linked_at: iso(l.linked_at), revoked_at: iso(l.revoked_at) })),
      deliveries: deliveries.rows.map((d) => ({ ...d, created_at: iso(d.created_at) })),
    });
  }
  return { customers: out };
}
```

`services/core-api/src/identity/webhooks.js` (tạo mới):

```js
import { createHmac } from 'node:crypto';
import { safeEqual } from './tokens.js';

const MIN = 60_000;
export const RETRY_SCHEDULE_MS = [1 * MIN, 5 * MIN, 30 * MIN, 120 * MIN, 360 * MIN, 720 * MIN, 1440 * MIN];
export const SEND_TIMEOUT_MS = 10_000;
export const SEND_BATCH = 20;
export const SEND_INTERVAL_MS = 1000;
export const SECRET_CACHE_MS = 10 * MIN;
export const SIGNATURE_TOLERANCE_SEC = 300;

// Ikf-Signature: t=<unix>,v1=<hex HMAC-SHA256("<t>.<rawBody>", secret)> (spec §5).
export function signPayload(rawBody, secret, t) {
  const v1 = createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex');
  return `t=${t},v1=${v1}`;
}

// What an app backend does (docs/integration/app-backend.md); used by our tests and the demo.
export function verifySignature(rawBody, header, secret, nowMs = Date.now(), toleranceSec = SIGNATURE_TOLERANCE_SEC) {
  const m = /^t=(\d{1,12}),v1=([0-9a-f]{64})$/.exec(header ?? '');
  if (!m) return false;
  if (Math.abs(Math.floor(nowMs / 1000) - Number(m[1])) > toleranceSec) return false;
  return safeEqual(signPayload(rawBody, secret, m[1]), `t=${m[1]},v1=${m[2]}`);
}

// Delay before the next attempt after `failures` failed attempts; null → dead.
export const retryDelay = (failures) => RETRY_SCHEDULE_MS[failures - 1] ?? null;

// Per-app webhook secret from the store (Secrets Manager), cached 10 minutes.
export function secretCache(store, { ttlMs = SECRET_CACHE_MS, now = Date.now } = {}) {
  const cache = new Map();
  return {
    async get(appId) {
      const hit = cache.get(appId);
      if (hit && now() - hit.at < ttlMs) return hit.value;
      const value = await store.get(appId);
      if (value) cache.set(appId, { value, at: now() });
      return value;
    },
  };
}

async function post(row, { secrets, fetch, now, timeoutMs }) {
  try {
    if (!row.webhook_url) return 'no_webhook_url';
    const secret = await secrets.get(row.app_id);
    if (!secret) return 'no_secret';
    const body = JSON.stringify(row.payload);
    const res = await fetch(row.webhook_url, {
      method: 'POST',
      redirect: 'manual',
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        'content-type': 'application/json',
        'user-agent': 'ikf-webhooks/1',
        'ikf-event-id': row.event_id,
        'ikf-signature': signPayload(body, secret, Math.floor(now() / 1000)),
      },
      body,
    });
    await res.arrayBuffer().catch(() => {});
    return res.status >= 200 && res.status < 300 ? null : `http_${res.status}`;
  } catch (err) {
    return err.name === 'TimeoutError' ? 'timeout' : String(err.message).slice(0, 200);
  }
}

// One tick of webhook-sender (spec §5): due pending deliveries, only the OLDEST pending one per
// (app, app_user_id) so a user's webhooks arrive in order (a dead one no longer blocks: it is not
// pending), SKIP LOCKED across tasks. 2xx → delivered; else the retry schedule, then dead + alarm.
export async function sendDue({ pool, secrets, fetch = globalThis.fetch, alarm, log, now = Date.now, timeoutMs = SEND_TIMEOUT_MS }) {
  const c = await pool.connect();
  const out = { delivered: 0, failed: 0, dead: 0 };
  try {
    await c.query('BEGIN');
    const { rows } = await c.query(
      `SELECT d.id, d.event_id, d.app_id, d.app_user_id, d.payload, d.attempts, a.webhook_url
         FROM webhook_deliveries d JOIN apps a ON a.id = d.app_id
        WHERE d.status = 'pending' AND d.next_attempt_at <= now()
          AND NOT EXISTS (SELECT 1 FROM webhook_deliveries e
                           WHERE e.app_id = d.app_id AND e.app_user_id = d.app_user_id AND e.status = 'pending' AND e.id < d.id)
        ORDER BY d.id LIMIT ${SEND_BATCH} FOR UPDATE OF d SKIP LOCKED`,
    );
    const errors = await Promise.all(rows.map((r) => post(r, { secrets, fetch, now, timeoutMs })));
    for (const [i, r] of rows.entries()) {
      const error = errors[i];
      const attempts = r.attempts + 1;
      if (!error) {
        await c.query("UPDATE webhook_deliveries SET status = 'delivered', attempts = $2, delivered_at = now(), last_error = NULL WHERE id = $1", [r.id, attempts]);
        out.delivered += 1;
        continue;
      }
      const delay = retryDelay(attempts);
      if (delay === null) {
        await c.query("UPDATE webhook_deliveries SET status = 'dead', attempts = $2, last_error = $3 WHERE id = $1", [r.id, attempts, error]);
        log?.error({ app_id: r.app_id, event_id: r.event_id, attempts, error }, 'webhook_dead');
        await alarm?.(`webhook_dead:${r.app_id}`, `Webhook ${r.event_id} to app ${r.app_id} is dead after ${attempts} attempts (${error}). Resend: ikf app webhooks ${r.app_id} --resend ${r.event_id}`);
        out.dead += 1;
      } else {
        await c.query(
          'UPDATE webhook_deliveries SET attempts = $2, last_error = $3, next_attempt_at = now() + make_interval(secs => $4) WHERE id = $1',
          [r.id, attempts, error, delay / 1000],
        );
        log?.warn({ app_id: r.app_id, event_id: r.event_id, attempts, error }, 'webhook_failed');
        out.failed += 1;
      }
    }
    await c.query('COMMIT');
    return out;
  } catch (err) {
    await c.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    c.release();
  }
}

export function startWebhookSender({ pool, secrets, fetch, alarm, log, intervalMs = SEND_INTERVAL_MS }) {
  let stopped = false;
  let timer = null;
  let running = Promise.resolve();
  const tick = () => {
    if (stopped) return;
    running = sendDue({ pool, secrets, fetch, alarm, log })
      .catch((err) => log?.error({ err: err.message }, 'webhook_sender_failed'))
      .then(() => {
        if (!stopped) timer = setTimeout(tick, intervalMs);
      });
  };
  timer = setTimeout(tick, 0);
  return async function stop() {
    stopped = true;
    clearTimeout(timer);
    await running;
  };
}

const item = (r) => ({
  event_id: r.event_id,
  type: r.type,
  app_user_id: r.app_user_id,
  status: r.status,
  attempts: r.attempts,
  next_attempt_at: r.next_attempt_at.toISOString(),
  last_error: r.last_error,
  created_at: r.created_at.toISOString(),
  delivered_at: r.delivered_at ? r.delivered_at.toISOString() : null,
});
const ITEM_COLUMNS = 'event_id, type, app_user_id, status, attempts, next_attempt_at, last_error, created_at, delivered_at';

export async function listDeliveries(db, { appId, status = null, limit = 50 }) {
  const { rows } = await db.query(
    `SELECT ${ITEM_COLUMNS} FROM webhook_deliveries WHERE app_id = $1 AND ($2::text IS NULL OR status = $2) ORDER BY id DESC LIMIT $3`,
    [appId, status, limit],
  );
  return { items: rows.map(item) };
}

// `ikf app webhooks <app> --resend <event_id>`: back to pending, due now, schedule restarts.
export async function resendDelivery(db, { appId, eventId }) {
  const { rows } = await db.query(
    `UPDATE webhook_deliveries SET status = 'pending', attempts = 0, next_attempt_at = now(), last_error = NULL, delivered_at = NULL
      WHERE app_id = $1 AND event_id = $2 RETURNING ${ITEM_COLUMNS}`,
    [appId, eventId],
  );
  if (!rows.length) return null;
  return item(rows[0]);
}
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api
for i in 1 2 3; do npm test -w @ikf/core-api -- test/webhooks.test.js 2>&1 | grep "Tests  "; done
```

Expected: `Test Files  29 passed (29)`, `Tests  288 passed (288)` (`webhooks.test.js`: 11); ba lần chạy riêng đều `Tests  11 passed (11)` (test đua giữa các sender ổn định).

- [ ] **Step 5: Commit**

```bash
git add services/core-api
git commit -m "feat(core-api): webhook-sender (signed, per-user order, retry schedule, dead + alarm), resend/list, customer lookup"
```

---

### Task 9: Nối identity vào `server.js`: config, Secrets Manager, SES, alarm, chạy/dừng 2 worker

**Files:**
- Create: `services/core-api/src/identity/setup.js`
- Modify: `services/core-api/src/config.js`, `services/core-api/src/server.js`, `services/core-api/package.json`, `package-lock.json`
- Test: `services/core-api/test/config.test.js`, `services/core-api/test/identity-setup.test.js`

**Interfaces:**
- Consumes: `startEntitlementSync` (Task 5), `startWebhookSender`, `secretCache` (Task 8), `createAlarm`, `memoryThrottle`, `redisThrottle`, `snsPublisher` (`src/billing/alarm.js`, không sửa — E15).
- Produces:
  - `loadConfig()` thêm `identity: {mailFrom: MAIL_FROM|null, secretsPrefix, alarmTopicArn}` (`config.test.js` sửa theo).
  - `src/identity/setup.js`: `IDENTITY_SECRETS = ['claim-token-key']`, `secretsManagerStore({client, prefix})` (`<prefix>app-webhook/<app>`; `CreateSecret`, gặp `ResourceExistsException` thì `PutSecretValue`; `ResourceNotFoundException` → `null`), `sesMailer({client, from})` (SESv2 `SendEmail`, text + html), `identityDeps({config, secrets, secretsClient, sesClient, snsClient, redis?, log}) → {deps: {webhookSecrets, claimKey, mailer}|null, missing, secrets?, alarm?}` (E19).
  - `server.js`: đọc `claim-token-key`, spread `identity.deps` vào `buildApp`, chạy `entitlement-sync` + `webhook-sender` khi bật, dừng cả hai lúc `SIGTERM` (sau billing-sync).

- [ ] **Step 1: Thêm dependency**

```bash
npm install @aws-sdk/client-sesv2@^3.1148.0 -w @ikf/core-api
```

Expected: `services/core-api/package.json` có `"@aws-sdk/client-sesv2": "^3.1148.0"`; `package-lock.json` đổi.

- [ ] **Step 2: Viết test fail**

`services/core-api/test/config.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/test/config.test.js b/services/core-api/test/config.test.js
index c952943..ea29632 100644
--- a/services/core-api/test/config.test.js
+++ b/services/core-api/test/config.test.js
@@ -12,6 +12,7 @@ const ENV = {
   PADDLE_ENV: 'sandbox',
   WEBHOOK_QUEUE_URL: 'https://sqs.us-east-1.amazonaws.com/111111111111/ikf-staging-webhooks',
   ALARM_TOPIC_ARN: 'arn:aws:sns:us-east-1:111111111111:ikf-staging-alarms',
+  MAIL_FROM: 'no-reply@mail.ikf-staging.example',
 };
 
 describe('loadConfig', () => {
@@ -30,6 +31,11 @@ describe('loadConfig', () => {
         webhookQueueUrl: 'https://sqs.us-east-1.amazonaws.com/111111111111/ikf-staging-webhooks',
         alarmTopicArn: 'arn:aws:sns:us-east-1:111111111111:ikf-staging-alarms',
       },
+      identity: {
+        mailFrom: 'no-reply@mail.ikf-staging.example',
+        secretsPrefix: 'ikf/staging/',
+        alarmTopicArn: 'arn:aws:sns:us-east-1:111111111111:ikf-staging-alarms',
+      },
     });
   });
 
@@ -37,6 +43,7 @@ describe('loadConfig', () => {
     const { PADDLE_ENV, WEBHOOK_QUEUE_URL, ALARM_TOPIC_ARN, ...rest } = ENV;
     expect(() => loadConfig(rest)).toThrow('missing env: PADDLE_ENV, WEBHOOK_QUEUE_URL');
     expect(loadConfig({ ...ENV, ALARM_TOPIC_ARN: '' }).billing.alarmTopicArn).toBeNull();
+    expect(loadConfig({ ...ENV, MAIL_FROM: '' }).identity.mailFrom).toBeNull();
   });
 
   it('staging must use the Paddle sandbox and prod the live account', () => {
PATCH
```

`services/core-api/test/identity-setup.test.js` (tạo mới):

```js
import { describe, it, expect } from 'vitest';
import { IDENTITY_SECRETS, identityDeps, secretsManagerStore, sesMailer } from '../src/identity/setup.js';

const config = { mailFrom: 'no-reply@mail.ikf.example', secretsPrefix: 'ikf/prod/', alarmTopicArn: 'arn:aws:sns:us-east-1:1:alarms' };
const log = { warn: () => {}, error: () => {} };
const awsError = (name) => Object.assign(new Error(name), { name });

// Fake AWS client: records {command name, input}; replies from a script keyed by command name.
function fakeClient(replies = {}) {
  const calls = [];
  return {
    calls,
    async send(cmd) {
      const name = cmd.constructor.name;
      calls.push([name, cmd.input]);
      const r = replies[name];
      const v = typeof r === 'function' ? r(cmd.input) : r;
      if (v instanceof Error) throw v;
      return v ?? {};
    },
  };
}

describe('identity setup', () => {
  it('Secrets Manager store: ikf/<env>/app-webhook/<app>; create, or put a new value if it exists; missing → null', async () => {
    const client = fakeClient({ GetSecretValueCommand: { SecretString: 'whsec_x' } });
    const store = secretsManagerStore({ client, prefix: 'ikf/prod/' });
    expect(await store.get('starlyn')).toBe('whsec_x');
    await store.put('starlyn', 'whsec_new');
    expect(client.calls).toEqual([
      ['GetSecretValueCommand', { SecretId: 'ikf/prod/app-webhook/starlyn' }],
      ['CreateSecretCommand', { Name: 'ikf/prod/app-webhook/starlyn', SecretString: 'whsec_new' }],
    ]);
    const existing = fakeClient({ CreateSecretCommand: awsError('ResourceExistsException'), GetSecretValueCommand: awsError('ResourceNotFoundException') });
    const s2 = secretsManagerStore({ client: existing, prefix: 'ikf/prod/' });
    await s2.put('starlyn', 'whsec_2');
    expect(existing.calls[1]).toEqual(['PutSecretValueCommand', { SecretId: 'ikf/prod/app-webhook/starlyn', SecretString: 'whsec_2' }]);
    expect(await s2.get('starlyn')).toBeNull();
    const down = secretsManagerStore({ client: fakeClient({ GetSecretValueCommand: awsError('ThrottlingException') }), prefix: 'p/' });
    await expect(down.get('a')).rejects.toThrow('ThrottlingException');
  });

  it('SES mailer sends text + html from MAIL_FROM', async () => {
    const client = fakeClient();
    await sesMailer({ client, from: config.mailFrom }).send({ to: 'b@example.com', subject: 'S', text: 'T', html: '<p>H</p>' });
    expect(client.calls).toEqual([['SendEmailCommand', {
      FromEmailAddress: 'no-reply@mail.ikf.example',
      Destination: { ToAddresses: ['b@example.com'] },
      Content: { Simple: { Subject: { Data: 'S', Charset: 'UTF-8' }, Body: { Text: { Data: 'T', Charset: 'UTF-8' }, Html: { Data: '<p>H</p>', Charset: 'UTF-8' } } } },
    }]]);
  });

  it('builds deps (store, claim key, mailer) + cached secrets + alarm once per window', async () => {
    const sns = fakeClient();
    const sm = fakeClient({ GetSecretValueCommand: { SecretString: 'whsec_x' } });
    const out = identityDeps({ config, secrets: { 'claim-token-key': 'k' }, secretsClient: sm, sesClient: fakeClient(), snsClient: sns, log });
    expect(out.missing).toEqual([]);
    expect(out.deps.claimKey).toBe('k');
    expect(Object.keys(out.deps).sort()).toEqual(['claimKey', 'mailer', 'webhookSecrets']);
    await out.secrets.get('starlyn');
    await out.secrets.get('starlyn');
    expect(sm.calls).toHaveLength(1);
    await out.alarm('webhook_dead:starlyn', 'm');
    await out.alarm('webhook_dead:starlyn', 'm');
    await out.alarm('webhook_dead:zodiac', 'm');
    expect(sns.calls.map(([, i]) => i.Subject)).toEqual(['ikf billing: webhook_dead:starlyn', 'ikf billing: webhook_dead:zodiac']);
  });

  it('no claim-token-key or no MAIL_FROM: identity off, naming what is missing', () => {
    expect(IDENTITY_SECRETS).toEqual(['claim-token-key']);
    expect(identityDeps({ config, secrets: {}, log })).toEqual({ deps: null, missing: ['claim-token-key'] });
    expect(identityDeps({ config: { ...config, mailFrom: null }, secrets: { 'claim-token-key': 'k' }, log })).toEqual({ deps: null, missing: ['MAIL_FROM'] });
  });
});
```

- [ ] **Step 3: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api
```

Expected: FAIL — `Test Files  2 failed | 28 passed (30)`, `Tests  2 failed | 286 passed (288)`: `identity-setup.test.js` `Cannot find module '../src/identity/setup.js'`; `config.test.js` 2 (thiếu `identity`).

- [ ] **Step 4: Implement**

`services/core-api/src/config.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/config.js b/services/core-api/src/config.js
index da53307..42b4232 100644
--- a/services/core-api/src/config.js
+++ b/services/core-api/src/config.js
@@ -31,5 +31,10 @@ export function loadConfig(env = process.env) {
       webhookQueueUrl: env.WEBHOOK_QUEUE_URL,
       alarmTopicArn: env.ALARM_TOPIC_ARN || null,
     },
+    identity: {
+      mailFrom: env.MAIL_FROM || null,
+      secretsPrefix: env.SECRETS_PREFIX,
+      alarmTopicArn: env.ALARM_TOPIC_ARN || null,
+    },
   };
 }
PATCH
```

`services/core-api/src/identity/setup.js` (tạo mới):

```js
import { CreateSecretCommand, GetSecretValueCommand, PutSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { SendEmailCommand } from '@aws-sdk/client-sesv2';
import { createAlarm, memoryThrottle, redisThrottle, snsPublisher } from '../billing/alarm.js';
import { secretCache } from './webhooks.js';

export const IDENTITY_SECRETS = ['claim-token-key'];

// Per-app webhook secrets at <prefix>app-webhook/<app_id> (spec §2), e.g. ikf/prod/app-webhook/starlyn.
export function secretsManagerStore({ client, prefix }) {
  const name = (appId) => `${prefix}app-webhook/${appId}`;
  return {
    async get(appId) {
      try {
        return (await client.send(new GetSecretValueCommand({ SecretId: name(appId) }))).SecretString ?? null;
      } catch (err) {
        if (err.name === 'ResourceNotFoundException') return null;
        throw err;
      }
    },
    async put(appId, secret) {
      try {
        await client.send(new CreateSecretCommand({ Name: name(appId), SecretString: secret }));
      } catch (err) {
        if (err.name !== 'ResourceExistsException') throw err;
        await client.send(new PutSecretValueCommand({ SecretId: name(appId), SecretString: secret }));
      }
    },
  };
}

export function sesMailer({ client, from }) {
  return {
    send: ({ to, subject, text, html }) =>
      client.send(new SendEmailCommand({
        FromEmailAddress: from,
        Destination: { ToAddresses: [to] },
        Content: {
          Simple: {
            Subject: { Data: subject, Charset: 'UTF-8' },
            Body: { Text: { Data: text, Charset: 'UTF-8' }, ...(html && { Html: { Data: html, Charset: 'UTF-8' } }) },
          },
        },
      })),
  };
}

// Identity is off (routes not registered, workers not started) until claim-token-key has a value and
// MAIL_FROM is set; publishing, routing and billing keep working.
export function identityDeps({ config, secrets, secretsClient, sesClient, snsClient, redis = null, log }) {
  const missing = IDENTITY_SECRETS.filter((n) => !secrets[n]);
  if (!config.mailFrom) missing.push('MAIL_FROM');
  if (missing.length) return { deps: null, missing };
  const store = secretsManagerStore({ client: secretsClient, prefix: config.secretsPrefix });
  const publish = config.alarmTopicArn
    ? snsPublisher({ client: snsClient, topicArn: config.alarmTopicArn })
    : async (subject, message) => log.error({ subject, message }, 'alarm');
  return {
    missing,
    deps: { webhookSecrets: store, claimKey: secrets['claim-token-key'], mailer: sesMailer({ client: sesClient, from: config.mailFrom }) },
    secrets: secretCache(store),
    alarm: createAlarm({ publish, throttle: redis ? redisThrottle(redis, memoryThrottle()) : memoryThrottle(), log }),
  };
}
```

`services/core-api/src/server.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/server.js b/services/core-api/src/server.js
index 769abaf..7a5895f 100644
--- a/services/core-api/src/server.js
+++ b/services/core-api/src/server.js
@@ -1,3 +1,5 @@
+import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
+import { SESv2Client } from '@aws-sdk/client-sesv2';
 import { SNSClient } from '@aws-sdk/client-sns';
 import { SQSClient } from '@aws-sdk/client-sqs';
 import pg from 'pg';
@@ -14,11 +16,14 @@ import { startResync } from './publisher/resync.js';
 import { startQueueWorker } from './billing/queue.js';
 import { BILLING_SECRETS, billingDeps } from './billing/setup.js';
 import { syncMessage } from './billing/sync.js';
+import { IDENTITY_SECRETS, identityDeps } from './identity/setup.js';
+import { startEntitlementSync } from './identity/sync.js';
+import { startWebhookSender } from './identity/webhooks.js';
 
 const REQUIRED_SECRETS = ['cf-kv-api-token', 'r2-access-key-id', 'r2-secret-access-key'];
 
 const config = loadConfig();
-const secrets = await loadSecrets(config.secretsPrefix, [...REQUIRED_SECRETS, 'bootstrap-admin-token', ...BILLING_SECRETS]);
+const secrets = await loadSecrets(config.secretsPrefix, [...REQUIRED_SECRETS, 'bootstrap-admin-token', ...BILLING_SECRETS, ...IDENTITY_SECRETS]);
 const missing = REQUIRED_SECRETS.filter((n) => !secrets[n]);
 if (missing.length) {
   console.error(`missing secret values: ${missing.map((n) => config.secretsPrefix + n).join(', ')}`);
@@ -76,13 +81,28 @@ if (!billing.deps) {
   console.error(`billing disabled, missing secret values: ${billing.missing.map((n) => config.secretsPrefix + n).join(', ')}`);
 }
 
+const log = { info: (o, m) => console.log(m, JSON.stringify(o)), warn: (o, m) => console.warn(m, JSON.stringify(o)), error: (o, m) => console.error(m, JSON.stringify(o)) };
+const identity = identityDeps({
+  config: config.identity,
+  secrets,
+  secretsClient: new SecretsManagerClient({ region, requestHandler: { requestTimeout: 10_000, connectionTimeout: 5_000 } }),
+  sesClient: new SESv2Client({ region, requestHandler: { requestTimeout: 10_000, connectionTimeout: 5_000 } }),
+  snsClient: new SNSClient({ region, requestHandler: { requestTimeout: 10_000, connectionTimeout: 5_000 } }),
+  redis,
+  log,
+});
+if (!identity.deps) {
+  // Entitlements off until the values are entered; the outbox simply waits (published_at stays NULL).
+  console.error(`identity disabled, missing: ${identity.missing.join(', ')}`);
+}
+
 const app = buildApp({
   logger: true,
   checks: {
     db: () => pool.query('select 1'),
     cache: () => redis.ping(),
   },
-  deps: { pool, store, kv, mediaOrigins: config.mediaOrigins, previewBaseUrl: config.previewBaseUrl, ...billing.deps },
+  deps: { pool, store, kv, mediaOrigins: config.mediaOrigins, previewBaseUrl: config.previewBaseUrl, ...billing.deps, ...identity.deps },
 });
 
 const stopResync = startResync({ pool, kv, log: app.log });
@@ -95,6 +115,14 @@ const stopBillingSync = billing.deps
   })
   : async () => {};
 
+// entitlement-sync + webhook-sender run in this process too (spec §1).
+const stopEntitlementSync = identity.deps
+  ? startEntitlementSync({ pool, mailer: identity.deps.mailer, claimKey: identity.deps.claimKey, alarm: identity.alarm, log })
+  : async () => {};
+const stopWebhookSender = identity.deps
+  ? startWebhookSender({ pool, secrets: identity.secrets, alarm: identity.alarm, log })
+  : async () => {};
+
 let shuttingDown = false;
 const shutdown = async () => {
   if (shuttingDown) return;
@@ -102,6 +130,7 @@ const shutdown = async () => {
   setTimeout(() => process.exit(1), 10_000).unref();
   stopResync();
   await stopBillingSync(); // ends the long poll; the message in hand finishes or returns to the queue
+  await Promise.all([stopEntitlementSync(), stopWebhookSender()]); // the tick in hand commits or rolls back
   await app.close();
   await Promise.allSettled([pool.end(), redis.quit()]);
   process.exit(0);
PATCH
```

- [ ] **Step 5: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api
```

Expected: `Test Files  30 passed (30)`, `Tests  292 passed (292)`.

- [ ] **Step 6: Kiểm tra `server.js` và image (server.js không có unit test, như billing)**

```bash
node --check services/core-api/src/server.js
docker build -q -f services/core-api/Dockerfile -t ikf-core-ent-check .
docker run --rm --entrypoint node ikf-core-ent-check -e "Promise.all(['./src/identity/setup.js','./src/identity/sync.js','./src/identity/webhooks.js','./src/app.js'].map(m=>import(m))).then(()=>console.log('container-imports-ok'))"
docker rmi -f ikf-core-ent-check
```

Expected: không lỗi cú pháp; `container-imports-ok` (Dockerfile không cần sửa: `client-sesv2` vào image qua `npm ci -w @ikf/core-api`).

- [ ] **Step 7: Commit**

```bash
git add package-lock.json services/core-api
git commit -m "feat(core-api): wire identity (claim key, SES, per-app secrets, alarm) and run entitlement-sync + webhook-sender in process"
```

---

### Task 10: SDK: lấy `app_link` sau `checkout_complete`, gắn vào nút get-app; web2web sang `return_url`

`complete()` là điểm chung của cả luồng Paddle inline lẫn luồng `?ikf_paid=` (billing Task 10–11), nên claim bắt đầu ở đó, đúng một lần mỗi trang. Ngân sách: bundle tăng từ 7828 lên **8123** byte gzip (≤ 8192, còn 69 byte) — giữ code gọn, không thêm event mới.

**Files:**
- Create: —
- Modify: `packages/sdk/src/checkout.js`, `packages/sdk/src/index.js`
- Test: `packages/sdk/test/claim.test.js`, `packages/sdk/test/paid.test.js`

**Interfaces:**
- Consumes: `GET {api}/v1/checkout/:id/claim` (Task 6): `200 {app_link}` | `200 {return_url}` | `202` | `404`.
- Produces (`packages/sdk/src/checkout.js`): `CLAIM_POLL_MS = 2000`, `CLAIM_POLL_TRIES = 11`; `claim(ck)` poll tới khi khác `202` (lỗi mạng: thử tiếp; `404`/khác: dừng), chỉ nhận URL `https://`; `attach(url)`: `IkFunnel.appLink(url)` → mọi `[data-ikf="get-app"]` (`<a>`: `href`; phần tử khác: `onclick` → `location.assign`) → `IkFunnel.config.appUrl` + `appUrlAndroid`/`appStoreUrl`/`playStoreUrl` nếu có (E11); `return_url` → `location.assign`. `createCheckout(...)` trả thêm `claimed()`; `window.IKF.claim()` → promise hoặc `null`. `paid.test.js` sửa theo (thêm 1 fetch claim, E16).

- [ ] **Step 1: Viết test fail**

`packages/sdk/test/claim.test.js` (tạo mới):

```js
import { describe, it, expect } from 'vitest';
import { CLAIM_POLL_MS } from '../src/checkout.js';
import { API, CK, IKF, boot, h, installBillingHarness, json } from './helpers/billing.js';

installBillingHarness();

const LINK = 'https://app.adjust.com/abc123?deep_link=starlyn%3A%2F%2Fclaim%3Ft%3DTOKEN';
const CLAIM_URL = `${API}/v1/checkout/${CK}/claim`;
// Back from /_ikf/pay with a completed checkout; then the claim replies.
async function paidThen(...claimReplies) {
  h.replies.push(json(200, { checkout_id: CK, status: 'completed', plan: '1w' }), ...claimReplies);
  boot(IKF(), { url: `https://try.x.com/promo?ikf_paid=${CK}` });
  await window.IKF.paid();
  return window.IKF.claim();
}
const claimFetches = () => h.fetches.filter((f) => f.url === CLAIM_URL);

describe('claim after checkout_complete (app_link / return_url)', () => {
  it('polls GET /v1/checkout/:id/claim every 2s while 202, then hands app_link to IkFunnel.appLink', async () => {
    const got = [];
    window.IkFunnel.appLink = (u) => got.push(u);
    window.IkFunnel.config.appUrl = 'https://zodiac.go.link?adj_t=x';
    const out = await paidThen(json(202, { status: 'pending' }), json(202, { status: 'pending' }), json(200, { app_link: LINK }));
    expect(out).toEqual({ app_link: LINK });
    expect(claimFetches()).toHaveLength(3);
    expect(claimFetches()[0].init).toEqual({ credentials: 'omit' });
    expect(h.waits).toEqual([CLAIM_POLL_MS, CLAIM_POLL_MS]);
    expect(got).toEqual([LINK]);
    expect(window.IkFunnel.config.appUrl).toBe('https://zodiac.go.link?adj_t=x');
  });

  it('no appLink hook: every [data-ikf="get-app"] gets the link (anchors by href, others on click)', async () => {
    document.body.innerHTML = '<a data-ikf="get-app" href="https://apps.apple.com/x">Get</a><button data-ikf="get-app">Open</button><a id="other" href="https://x.example/">x</a>';
    await paidThen(json(200, { app_link: LINK }));
    expect(document.querySelector('a[data-ikf]').getAttribute('href')).toBe(LINK);
    expect(typeof document.querySelector('button').onclick).toBe('function');
    expect(document.getElementById('other').getAttribute('href')).toBe('https://x.example/');
    expect(window.IkFunnel.config.appUrl).toBeUndefined();
  });

  it('neither: the funnel config app URLs (appUrl always; appUrlAndroid / store URLs when the funnel has them)', async () => {
    Object.assign(window.IkFunnel.config, { appUrl: '', appUrlAndroid: 'https://zodiac.go.link?adj_t=a', appStoreUrl: 'https://apps.apple.com/x' });
    await paidThen(json(200, { app_link: LINK }));
    const c = window.IkFunnel.config;
    expect([c.appUrl, c.appUrlAndroid, c.appStoreUrl]).toEqual([LINK, LINK, LINK]);
    expect('playStoreUrl' in c).toBe(false);
  });

  it('web2web: goes to return_url?ikf_ml=…', async () => {
    const ret = 'https://tarot.example/welcome?ikf_ml=MAGIC';
    await paidThen(json(200, { return_url: ret }));
    expect(window.location.href).toBe(ret);
  });

  it('gives up after 20s of pending, and at once on 404 (funnel without app); ignores a non-https link', async () => {
    expect(await paidThen(...Array(11).fill(0).map(() => json(202, { status: 'pending' })))).toBeNull();
    expect(claimFetches()).toHaveLength(11);
    expect(h.waits.reduce((a, b) => a + b, 0)).toBe(20000);
    delete window.IKF;
    h.fetches = [];
    expect(await paidThen(json(404, { error: 'no_app' }))).toBeNull();
    expect(claimFetches()).toHaveLength(1);
    delete window.IKF;
    h.fetches = [];
    window.IkFunnel.appLink = () => { throw new Error('must not be called'); };
    expect(await paidThen(json(200, { app_link: 'javascript:alert(1)' }))).toBeNull();
  });

  it('only once per page, and never without billing', async () => {
    await paidThen(json(200, { app_link: LINK }));
    expect(claimFetches()).toHaveLength(1);
    delete window.IKF;
    h.fetches = [];
    boot(IKF({ paddle: undefined }), { url: `https://try.x.com/promo?ikf_paid=${CK}` });
    expect(window.IKF.claim()).toBeNull();
    expect(h.fetches).toEqual([]);
  });
});
```

`packages/sdk/test/paid.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/packages/sdk/test/paid.test.js b/packages/sdk/test/paid.test.js
index e74e3c3..e9c0462 100644
--- a/packages/sdk/test/paid.test.js
+++ b/packages/sdk/test/paid.test.js
@@ -16,11 +16,12 @@ describe('return from /_ikf/pay (ikf_paid) and ?paid=', () => {
   });
 
   it('ikf_paid: completePurchase only after core says completed', async () => {
-    h.replies.push(json(200, { checkout_id: CK, status: 'created', plan: 'addon' }), json(503, {}), json(200, { checkout_id: CK, status: 'completed', plan: 'addon' }));
+    h.replies.push(json(200, { checkout_id: CK, status: 'created', plan: 'addon' }), json(503, {}), json(200, { checkout_id: CK, status: 'completed', plan: 'addon' }), json(404, { error: 'no_app' }));
     at(`https://try.x.com/promo?utm_source=meta&ikf_paid=${CK}`);
     expect(window.location.search).toBe('?utm_source=meta');
     expect(await window.IKF.paid()).toBe(true);
-    expect(h.fetches.map((f) => f.url)).toEqual(Array(3).fill(`${API}/v1/checkout/${CK}`));
+    // then the claim lookup (Task 10), which stops on 404 no_app
+    expect(h.fetches.map((f) => f.url)).toEqual([...Array(3).fill(`${API}/v1/checkout/${CK}`), `${API}/v1/checkout/${CK}/claim`]);
     expect(h.fetches[0].init).toEqual({ credentials: 'omit' });
     expect(h.waits).toEqual([PAID_POLL_MS, PAID_POLL_MS]);
     expect(h.purchases).toEqual(['addon']);
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/sdk
```

Expected: FAIL — `Test Files  2 failed | 9 passed (11)`, `Tests  7 failed | 145 passed (152)` (`claim.test.js` 6: `window.IKF.claim is not a function`; `paid.test.js` 1: chưa có fetch `/claim`).

- [ ] **Step 3: Implement**

`packages/sdk/src/checkout.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/packages/sdk/src/checkout.js b/packages/sdk/src/checkout.js
index 11e0929..6c82ddb 100644
--- a/packages/sdk/src/checkout.js
+++ b/packages/sdk/src/checkout.js
@@ -44,6 +44,11 @@ const NOTICE_CSS = ':host{all:initial}.n{margin:0 auto;max-width:560px;padding:1
 export const PAID_POLL_MS = 2000;
 export const PAID_POLL_TRIES = 11; // t = 0, 2, …, 20 s
 
+export const CLAIM_POLL_MS = 2000;
+export const CLAIM_POLL_TRIES = 11; // t = 0, 2, …, 20 s
+const APP_KEYS = ['appUrlAndroid', 'appStoreUrl', 'playStoreUrl'];
+const https = (u) => typeof u === 'string' && /^https:\/\//.test(u);
+
 const fail = (reason, retry) => Object.assign(new Error(reason), { reason, retry: Boolean(retry) });
 
 // Paddle checkout inside the funnel. Billing is on only with __IKF.paddle + turnstile + api, never in preview.
@@ -56,6 +61,7 @@ export function createCheckout(win, { cfg, sid, track, attribution, loadScript,
   let busy = false;
   let current = null;
   let paddleReady = null;
+  let claiming = null;
 
   function blockNav() {
     if (!enabled) return;
@@ -118,6 +124,54 @@ export function createCheckout(win, { cfg, sid, track, attribution, loadScript,
     } catch {
       // the funnel's own handler failed; the purchase is still recorded server-side
     }
+    if (!claiming) claiming = claim(checkoutId);
+  }
+
+  // Spec §3.3: IkFunnel.appLink(url), else every [data-ikf="get-app"], else the funnel's app URLs (E11).
+  function attach(url) {
+    try {
+      const F = win.IkFunnel;
+      if (F && typeof F.appLink === 'function') return F.appLink(url);
+      const els = doc.querySelectorAll('[data-ikf="get-app"]');
+      if (els.length) {
+        for (const el of els) {
+          if (el.tagName === 'A') el.href = url;
+          else el.onclick = () => win.location.assign(url);
+        }
+        return;
+      }
+      const c = F && F.config;
+      if (c) {
+        c.appUrl = url;
+        for (const k of APP_KEYS) if (typeof c[k] === 'string') c[k] = url;
+      }
+    } catch {
+      // never break the funnel
+    }
+  }
+
+  // After checkout_complete: GET /v1/checkout/<id>/claim every 2 s for up to 20 s (spec §3.2).
+  async function claim(ck) {
+    for (let i = 0; i < CLAIM_POLL_TRIES; i += 1) {
+      if (i) await pause(CLAIM_POLL_MS);
+      try {
+        const res = await http(`${cfg.api}/v1/checkout/${ck}/claim`, { credentials: 'omit' });
+        if (res.status === 202) continue;
+        const b = res.ok ? await res.json() : {};
+        if (https(b.return_url)) {
+          win.location.assign(b.return_url);
+          return b;
+        }
+        if (https(b.app_link)) {
+          whenReady(() => attach(b.app_link));
+          return b;
+        }
+        return null;
+      } catch {
+        // keep polling
+      }
+    }
+    return null;
   }
 
   async function turnstileToken() {
@@ -328,5 +382,5 @@ export function createCheckout(win, { cfg, sid, track, attribution, loadScript,
     if (ck) confirmation = confirm(ck);
   }
 
-  return { enabled, start, blockNav, complete, notice, confirmation };
+  return { enabled, start, blockNav, complete, notice, confirmation, claimed: () => claiming };
 }
PATCH
```

`packages/sdk/src/index.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/packages/sdk/src/index.js b/packages/sdk/src/index.js
index 85aa8b9..74946ba 100644
--- a/packages/sdk/src/index.js
+++ b/packages/sdk/src/index.js
@@ -122,6 +122,7 @@ export function createSdk(win, deps = {}) {
     attribution: () => ({ ...attr, fbc: readCookie(doc, '_fbc'), fbp: readCookie(doc, '_fbp'), sid, aid: getAid() }),
     flush: () => queue.flush(),
     paid: () => checkout.confirmation,
+    claim: () => checkout.claimed(),
   };
   win.IKF = api;
   return api;
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/sdk
node packages/sdk/scripts/build.mjs
npm test -w @ikf/edge-router
```

Expected: sdk `Test Files  11 passed (11)`, `Tests  152 passed (152)` (gồm `build.test.js` ≤ 8192); `ikf sdk 048813807adf: 8123 bytes gzip`; edge-router `Test Files  6 passed (6)`, `Tests  101 passed (101)` (Worker nhúng bundle mới, không đổi gì khác).

- [ ] **Step 5: Commit**

```bash
git add packages/sdk
git commit -m "feat(sdk): after checkout_complete fetch the claim; app_link to IkFunnel.appLink / get-app buttons / app URLs, web2web to return_url"
```

---

### Task 11: CLI: `ikf app …`, `ikf funnel set --app`, `prices … @key`, `ikf customer show`

**Files:**
- Create: —
- Modify: `packages/cli/src/api.js`, `packages/cli/src/main.js`
- Test: `packages/cli/test/app.test.js`, `packages/cli/test/funnel.test.js`, `packages/cli/test/prices.test.js`

**Interfaces:**
- Consumes: `POST/GET /v1/apps`, `POST /v1/apps/:id/rotate-key` (Task 3), `PUT /v1/funnels/:slug {app_id}`, prices `entitlement_key` (Task 4), `GET /v1/apps/:id/webhooks`, `POST …/resend`, `POST /v1/customers/lookup` (Task 8).
- Produces: `createApi` thêm `createApp` (không retry), `listApps`, `rotateKey` (không retry), `listWebhooks(id, {status})`, `resendWebhook(id, eventId)`, `lookupCustomer(email)` (POST body). Lệnh: `ikf app create <id> --name --kind app|web [--adjust --scheme | --return-url] --webhook`, `ikf app ls`, `ikf app rotate-key <id>`, `ikf app webhooks <id> [--dead] [--resend <event_id>]`, `ikf funnel set <slug> [--pixel|--no-pixel] [--app|--no-app]`, `ikf funnel prices set <slug> <plan>=pri_…[:dsc_…][@key]` (in thêm cột key), `ikf customer show <email>`. Test cũ `prices.test.js`, `funnel.test.js` sửa theo (E16).

- [ ] **Step 1: Viết test fail**

`packages/cli/test/app.test.js` (tạo mới):

```js
import { describe, it, expect } from 'vitest';
import { run } from '../src/main.js';
import { createApi } from '../src/api.js';
import { io } from './helpers/io.js';

const KEY = `ikfa_${'k'.repeat(43)}`;
const SECRET = `whsec_${'s'.repeat(43)}`;
const EV = '01K75Z0000000000000000000A';
const appView = { id: 'starlyn', name: 'Starlyn', kind: 'app', webhook_url: 'https://be.example/hook', prev_key_expires_at: null };

describe('ikf app', () => {
  it('create (kind app) sends the fields and prints the key and secret once', async () => {
    const calls = [];
    const t = io({ createApp: async (b) => { calls.push(b); return { app: appView, api_key: KEY, webhook_secret: SECRET }; } });
    expect(await run(['app', 'create', 'starlyn', '--name', 'Starlyn', '--kind', 'app', '--adjust', 'https://app.adjust.com/abc', '--scheme', 'starlyn', '--webhook', 'https://be.example/hook'], t.opts)).toBe(0);
    expect(calls).toEqual([{ id: 'starlyn', name: 'Starlyn', kind: 'app', webhook_url: 'https://be.example/hook', adjust_tracker_url: 'https://app.adjust.com/abc', deeplink_scheme: 'starlyn' }]);
    expect(t.lines).toEqual([
      'starlyn (app) đã tạo.',
      'Hai giá trị dưới đây chỉ hiện MỘT lần: lưu vào password manager rồi gửi riêng cho team backend app.',
      `  API key:        ${KEY}`,
      `  Webhook secret: ${SECRET}`,
    ]);
  });

  it('create (kind web) sends return_url', async () => {
    const calls = [];
    const t = io({ createApp: async (b) => { calls.push(b); return { app: { ...appView, id: 'tarot-web', kind: 'web' }, api_key: KEY, webhook_secret: SECRET }; } });
    await run(['app', 'create', 'tarot-web', '--name', 'Tarot', '--kind', 'web', '--return-url', 'https://tarot.example/welcome', '--webhook', 'https://tarot.example/h'], t.opts);
    expect(calls[0]).toEqual({ id: 'tarot-web', name: 'Tarot', kind: 'web', webhook_url: 'https://tarot.example/h', return_url: 'https://tarot.example/welcome' });
  });

  it.each([
    [['app', 'create', 'starlyn', '--kind', 'app'], 'cần --name, --kind app|web và --webhook <url>'],
    [['app', 'create', 'starlyn', '--name', 'S', '--kind', 'app', '--webhook', 'https://x'], 'app kiểu app cần --adjust <url> và --scheme <scheme>'],
    [['app', 'create', 'w', '--name', 'S', '--kind', 'web', '--webhook', 'https://x'], 'app id không hợp lệ: "w"'],
    [['app', 'create', 'tw', '--name', 'S', '--kind', 'web', '--webhook', 'https://x'], 'app kiểu web cần --return-url <url>'],
    [['app', 'webhooks', 'starlyn', '--resend', 'evt_1'], 'event id không hợp lệ: "evt_1"'],
    [['customer', 'show', 'not-an-email'], expect.stringContaining('Cách dùng')],
  ])('exits 2 on bad usage %j', async (argv, msg) => {
    const t = io({ createApp: async () => { throw new Error('must not be called'); } });
    expect(await run(argv, t.opts)).toBe(2);
    expect(t.errors).toEqual([msg]);
  });

  it('ls and rotate-key', async () => {
    const t = io({
      listApps: async () => ({ apps: [appView] }),
      rotateKey: async () => ({ app: { ...appView, prev_key_expires_at: '2026-10-10T10:00:00.000Z' }, api_key: KEY }),
    });
    await run(['app', 'ls'], t.opts);
    await run(['app', 'rotate-key', 'starlyn'], t.opts);
    expect(t.lines).toEqual([
      `starlyn              app  Starlyn                  https://be.example/hook`,
      `starlyn: API key mới (chỉ hiện MỘT lần): ${KEY}`,
      'Key cũ còn dùng được tới 2026-10-10T10:00:00.000Z.',
    ]);
  });

  it('webhooks --dead lists dead deliveries; --resend puts one back', async () => {
    const calls = [];
    const item = { event_id: EV, created_at: '2026-10-09T10:00:00.000Z', type: 'entitlement.updated', app_user_id: 'u_42', status: 'dead', attempts: 8, last_error: 'http_500' };
    const t = io({
      listWebhooks: async (id, o) => { calls.push(['list', id, o]); return { items: [item] }; },
      resendWebhook: async (id, ev) => { calls.push(['resend', id, ev]); return { ...item, status: 'pending', attempts: 0 }; },
    });
    await run(['app', 'webhooks', 'starlyn', '--dead'], t.opts);
    await run(['app', 'webhooks', 'starlyn', '--resend', EV], t.opts);
    expect(calls).toEqual([['list', 'starlyn', { status: 'dead' }], ['resend', 'starlyn', EV]]);
    expect(t.lines).toEqual([
      `${EV}  2026-10-09T10:00:00.000Z  entitlement.updated u_42                 dead      8  http_500`,
      `${EV}: đặt lại pending, gửi trong vài giây.`,
    ]);
  });
});

describe('ikf funnel set --app', () => {
  it('sends app_id only (no pixel output), or null with --no-app; app and pixel together', async () => {
    const calls = [];
    const t = io({ setFunnel: async (slug, body) => { calls.push(body); return { funnel: slug, app_id: body.app_id ?? null, pixel_id: body.pixel_id, hosts: [], synced: 0, kv_sync: 'ok', propagation_seconds: 90 }; } });
    await run(['funnel', 'set', 'witch-power', '--app', 'starlyn'], t.opts);
    await run(['funnel', 'set', 'witch-power', '--no-app'], t.opts);
    await run(['funnel', 'set', 'witch-power', '--app', 'starlyn', '--pixel', '123456'], t.opts);
    expect(calls).toEqual([{ app_id: 'starlyn' }, { app_id: null }, { pixel_id: '123456', app_id: 'starlyn' }]);
    expect(t.lines).toEqual([
      'witch-power: app starlyn',
      'witch-power: đã gỡ app',
      'witch-power: app starlyn',
      'witch-power: pixel 123456',
      'Đã đồng bộ 0/0 host.',
    ]);
  });

  it('rejects --app with --no-app and a malformed id', async () => {
    const t = io();
    expect(await run(['funnel', 'set', 'witch-power', '--app', 'x1', '--no-app'], t.opts)).toBe(2);
    expect(await run(['funnel', 'set', 'witch-power', '--app', 'Bad'], t.opts)).toBe(2);
    expect(t.errors).toEqual(['cần đúng một trong --app <id> hoặc --no-app', 'app id không hợp lệ: "Bad"']);
  });
});

describe('ikf customer show', () => {
  it('prints entitlements, links and recent webhooks for each customer with that email', async () => {
    const calls = [];
    const t = io({
      lookupCustomer: async (email) => {
        calls.push(email);
        return {
          customers: [{
            customer_ref: 'cus_01K75Z0000000000000000000B', paddle_customer_id: 'ctm_1', created_at: '2026-10-09T10:00:00.000Z',
            entitlements: [{ app_id: 'starlyn', key: 'premium', active: true, expires_at: '2026-10-19T10:00:00.000Z', source: 'subscription', source_id: 'sub_1' }],
            links: [{ app_id: 'starlyn', app_user_id: 'u_42', linked_at: '2026-10-09T10:01:00.000Z', revoked_at: null }],
            deliveries: [{ event_id: EV, type: 'link.created', app_id: 'starlyn', app_user_id: 'u_42', status: 'delivered', attempts: 1 }],
          }],
        };
      },
    });
    expect(await run(['customer', 'show', 'buyer@example.com'], t.opts)).toBe(0);
    expect(calls).toEqual(['buyer@example.com']);
    expect(t.lines).toEqual([
      'cus_01K75Z0000000000000000000B  ctm_1  từ 2026-10-09T10:00:00.000Z',
      '  Quyền:',
      '    starlyn/premium  active  hết hạn 2026-10-19T10:00:00.000Z  (subscription sub_1)',
      '  Liên kết:',
      '    starlyn/u_42  từ 2026-10-09T10:01:00.000Z',
      '  Webhook gần đây:',
      `    ${EV}  link.created  starlyn/u_42  delivered (1)`,
    ]);
    const none = io({ lookupCustomer: async () => ({ customers: [] }) });
    await run(['customer', 'show', 'x@example.com'], none.opts);
    expect(none.lines).toEqual(['Không có khách nào với email này.']);
  });
});

describe('api: identity calls', () => {
  const fakeFetch = (statuses) => {
    const calls = [];
    const fetch = async (url, init) => {
      calls.push({ url, method: init.method, body: init.body ? JSON.parse(init.body) : undefined });
      return new Response('{}', { status: statuses.shift() ?? 200 });
    };
    return { calls, fetch };
  };

  it('createApp and rotateKey are never retried; lookupCustomer POSTs the email in the body, never the URL', async () => {
    const f = fakeFetch([503, 503, 503]);
    const api = createApi({ api: 'https://api.x', token: 't' }, { fetch: f.fetch, sleep: async () => {} });
    await expect(api.createApp({ id: 'a' })).rejects.toMatchObject({ status: 503 });
    await expect(api.rotateKey('a')).rejects.toMatchObject({ status: 503 });
    expect(f.calls.map((c) => [c.method, c.url])).toEqual([['POST', 'https://api.x/v1/apps'], ['POST', 'https://api.x/v1/apps/a/rotate-key']]);
    await api.lookupCustomer('buyer@example.com');
    expect(f.calls[3]).toEqual({ url: 'https://api.x/v1/customers/lookup', method: 'POST', body: { email: 'buyer@example.com' } });
    await api.listWebhooks('a', { status: 'dead' });
    expect(f.calls.at(-1).url).toBe('https://api.x/v1/apps/a/webhooks?status=dead');
  });
});
```

`packages/cli/test/funnel.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/packages/cli/test/funnel.test.js b/packages/cli/test/funnel.test.js
index 3acc226..358df90 100644
--- a/packages/cli/test/funnel.test.js
+++ b/packages/cli/test/funnel.test.js
@@ -40,7 +40,7 @@ describe('ikf funnel set', () => {
   });
 
   it.each([
-    [['funnel', 'set', 'aivideo'], 'cần đúng một trong --pixel <id> hoặc --no-pixel'],
+    [['funnel', 'set', 'aivideo'], 'cần --pixel <id> | --no-pixel và/hoặc --app <id> | --no-app'],
     [['funnel', 'set', 'aivideo', '--pixel', '1', '--no-pixel'], 'cần đúng một trong --pixel <id> hoặc --no-pixel'],
     [['funnel', 'set', 'aivideo', '--pixel', '12ab56'], 'Pixel ID phải là 6-20 chữ số, nhận được "12ab56"'],
     [['funnel', 'set', 'Bad Slug', '--no-pixel'], 'slug không hợp lệ: "Bad Slug"'],
@@ -53,7 +53,7 @@ describe('ikf funnel set', () => {
   it('exits 2 with usage for an unknown funnel subcommand', async () => {
     const t = io();
     expect(await run(['funnel', 'rm', 'aivideo'], t.opts)).toBe(2);
-    expect(t.errors[0]).toContain('ikf funnel set <slug> --pixel <id> | --no-pixel');
+    expect(t.errors[0]).toContain('ikf funnel set <slug> [--pixel <id> | --no-pixel] [--app <id> | --no-app]');
   });
 });
 
PATCH
```

`packages/cli/test/prices.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/packages/cli/test/prices.test.js b/packages/cli/test/prices.test.js
index f660647..bfac110 100644
--- a/packages/cli/test/prices.test.js
+++ b/packages/cli/test/prices.test.js
@@ -10,22 +10,22 @@ const DSC = 'dsc_01dddddddddddddddddddddddd';
 const map = {
   funnel: 'aivideo',
   plans: {
-    '1w': { price_id: W1, discount_id: DSC, kind: 'recurring', updated_by: 'router', updated_at: '2026-10-09T10:00:00.000Z' },
-    addon: { price_id: ADDON, discount_id: null, kind: 'one_time', updated_by: 'router', updated_at: '2026-10-09T10:00:00.000Z' },
+    '1w': { price_id: W1, discount_id: DSC, kind: 'recurring', entitlement_key: 'premium', updated_by: 'router', updated_at: '2026-10-09T10:00:00.000Z' },
+    addon: { price_id: ADDON, discount_id: null, kind: 'one_time', entitlement_key: 'tarot_2027', updated_by: 'router', updated_at: '2026-10-09T10:00:00.000Z' },
   },
 };
 const printed = [
   'aivideo: 2 plan',
-  `  1w           ${W1}  ${DSC}  recurring`,
-  `  addon        ${ADDON}  ${'-'.padEnd(30)}  one_time`,
+  `  1w           ${W1}  ${DSC}  recurring  premium`,
+  `  addon        ${ADDON}  ${'-'.padEnd(30)}  one_time   tarot_2027`,
 ];
 
 describe('ikf funnel prices', () => {
   it('set sends plan=price[:discount] pairs and prints the resulting map', async () => {
     const calls = [];
     const t = io({ setPrices: async (slug, plans) => { calls.push([slug, plans]); return map; } });
-    expect(await run(['funnel', 'prices', 'set', 'aivideo', `1w=${W1}:${DSC}`, `addon=${ADDON}`, 'old=-'], t.opts)).toBe(0);
-    expect(calls).toEqual([['aivideo', { '1w': { price_id: W1, discount_id: DSC }, addon: { price_id: ADDON }, old: null }]]);
+    expect(await run(['funnel', 'prices', 'set', 'aivideo', `1w=${W1}:${DSC}`, `addon=${ADDON}@tarot_2027`, 'old=-'], t.opts)).toBe(0);
+    expect(calls).toEqual([['aivideo', { '1w': { price_id: W1, discount_id: DSC }, addon: { price_id: ADDON, entitlement_key: 'tarot_2027' }, old: null }]]);
     expect(t.lines).toEqual(printed);
   });
 
@@ -40,8 +40,8 @@ describe('ikf funnel prices', () => {
 
   it.each([
     [['funnel', 'prices', 'set', 'aivideo'], 'cần ít nhất một <plan>=pri_…[:dsc_…]'],
-    [['funnel', 'prices', 'set', 'aivideo', '1w'], 'không hiểu "1w"; dạng đúng: <plan>=pri_…[:dsc_…] hoặc <plan>=-'],
-    [['funnel', 'prices', 'set', 'aivideo', '1w=price_1'], 'không hiểu "1w=price_1"; dạng đúng: <plan>=pri_…[:dsc_…] hoặc <plan>=-'],
+    [['funnel', 'prices', 'set', 'aivideo', '1w'], 'không hiểu "1w"; dạng đúng: <plan>=pri_…[:dsc_…][@key] hoặc <plan>=-'],
+    [['funnel', 'prices', 'set', 'aivideo', '1w=price_1'], 'không hiểu "1w=price_1"; dạng đúng: <plan>=pri_…[:dsc_…][@key] hoặc <plan>=-'],
     [['funnel', 'prices', 'set', 'aivideo', `1w=${W1}`, `1w=${ADDON}`], 'plan "1w" xuất hiện 2 lần'],
     [['funnel', 'prices', 'ls', 'Bad Slug'], 'slug không hợp lệ: "Bad Slug"'],
   ])('exits 2 on bad usage %j', async (argv, msg) => {
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/cli
```

Expected: FAIL — `Test Files  3 failed | 9 passed (12)`, `Tests  19 failed | 94 passed (113)` (`app.test.js` + các dòng mới của `prices`/`funnel`).

- [ ] **Step 3: Implement**

`packages/cli/src/api.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/packages/cli/src/api.js b/packages/cli/src/api.js
index 01fb0b4..8379454 100644
--- a/packages/cli/src/api.js
+++ b/packages/cli/src/api.js
@@ -62,6 +62,16 @@ export function createApi({ api, token }, { fetch: doFetch = fetch, retries = 3,
       const qs = new URLSearchParams({ ...(topic && { topic }), ...(limit && { limit: String(limit) }) }).toString();
       return call('GET', `/v1/billing/outbox${qs ? `?${qs}` : ''}`, { retry: true });
     },
+    // Not retried: a lost reply would leave an app whose key and secret nobody saw (create again → 409).
+    createApp: (body) => call('POST', '/v1/apps', { body, retry: false }),
+    listApps: () => call('GET', '/v1/apps', { retry: true }),
+    // Not retried: a second rotation would revoke the key the first one returned.
+    rotateKey: (id) => call('POST', `/v1/apps/${id}/rotate-key`, { retry: false }),
+    listWebhooks: (id, { status } = {}) => call('GET', `/v1/apps/${id}/webhooks${status ? `?status=${status}` : ''}`, { retry: true }),
+    // Idempotent: resending twice leaves one pending delivery.
+    resendWebhook: (id, eventId) => call('POST', `/v1/apps/${id}/webhooks/${eventId}/resend`, { retry: true }),
+    // POST, so the email is never in a URL (E10).
+    lookupCustomer: (email) => call('POST', '/v1/customers/lookup', { body: { email }, retry: true }),
     // Never retried: if the first call succeeded but the reply was lost, a retry would roll back twice.
     rollback: (host, prefix) => call('POST', `/v1/routes/${host}/rollback`, { body: { prefix }, retry: false }),
     removeRoute: (host, prefix) => call('DELETE', `/v1/routes/${host}?prefix=${q(prefix)}`, { retry: false }),
PATCH
```

`packages/cli/src/main.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/packages/cli/src/main.js b/packages/cli/src/main.js
index 6aa4b09..b7a31a9 100755
--- a/packages/cli/src/main.js
+++ b/packages/cli/src/main.js
@@ -17,11 +17,17 @@ const USAGE = `Cách dùng:
   ikf route rm <host>[/prefix]
   ikf route ls <host>
   ikf route sync <host>
-  ikf funnel set <slug> --pixel <id> | --no-pixel
-  ikf funnel prices set <slug> <plan>=pri_…[:dsc_…] … (<plan>=- để gỡ)
+  ikf funnel set <slug> [--pixel <id> | --no-pixel] [--app <id> | --no-app]
+  ikf funnel prices set <slug> <plan>=pri_…[:dsc_…][@<entitlement_key>] … (<plan>=- để gỡ; key mặc định premium)
   ikf funnel prices ls <slug>
   ikf billing reconcile --since <24h|7d|…>
   ikf billing outbox ls [--topic <topic>] [--limit <n>]
+  ikf app create <id> --name <tên> --kind app --adjust <url> --scheme <scheme> --webhook <url>
+  ikf app create <id> --name <tên> --kind web --return-url <url> --webhook <url>
+  ikf app ls
+  ikf app rotate-key <id>
+  ikf app webhooks <id> [--dead] [--resend <event_id>]
+  ikf customer show <email>
   ikf events replay-dlq --env <staging|prod>   (cần CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN)`;
 
 const where = (r) => `${r.host}${r.prefix === '/' ? '/' : r.prefix}`;
@@ -47,7 +53,9 @@ function printList(out, r) {
 const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,62}$/;
 const PIXEL_RE = /^[0-9]{6,20}$/;
 
-const PAIR_RE = /^([A-Za-z0-9_-]{1,40})=(?:(-)|(pri_[a-z0-9]{26})(?::(dsc_[a-z0-9]{26}))?)$/;
+const PAIR_RE = /^([A-Za-z0-9_-]{1,40})=(?:(-)|(pri_[a-z0-9]{26})(?::(dsc_[a-z0-9]{26}))?(?:@([a-z0-9_]{1,40}))?)$/;
+const APP_ID_RE = /^[a-z0-9][a-z0-9-]{1,30}$/;
+const EVENT_ID_RE = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
 
 function printPrices(out, r) {
   const keys = Object.keys(r.plans);
@@ -58,7 +66,7 @@ function printPrices(out, r) {
   out(`${r.funnel}: ${keys.length} plan`);
   for (const k of keys) {
     const p = r.plans[k];
-    out(`  ${k.padEnd(12)} ${p.price_id}  ${(p.discount_id ?? '-').padEnd(30)}  ${p.kind}`);
+    out(`  ${k.padEnd(12)} ${p.price_id}  ${(p.discount_id ?? '-').padEnd(30)}  ${p.kind.padEnd(9)}  ${p.entitlement_key ?? 'premium'}`);
   }
 }
 
@@ -74,9 +82,9 @@ async function pricesCommand(api, args, out) {
   const plans = {};
   for (const pair of pairs) {
     const m = PAIR_RE.exec(pair);
-    if (!m) throw new UsageError(`không hiểu "${pair}"; dạng đúng: <plan>=pri_…[:dsc_…] hoặc <plan>=-`);
+    if (!m) throw new UsageError(`không hiểu "${pair}"; dạng đúng: <plan>=pri_…[:dsc_…][@key] hoặc <plan>=-`);
     if (Object.hasOwn(plans, m[1])) throw new UsageError(`plan "${m[1]}" xuất hiện 2 lần`);
-    plans[m[1]] = m[2] ? null : { price_id: m[3], ...(m[4] && { discount_id: m[4] }) };
+    plans[m[1]] = m[2] ? null : { price_id: m[3], ...(m[4] && { discount_id: m[4] }), ...(m[5] && { entitlement_key: m[5] }) };
   }
   printPrices(out, await api.setPrices(slug, plans));
   return 0;
@@ -87,9 +95,20 @@ async function funnelCommand(api, sub, args, values, out) {
   const slug = args[0];
   if (sub !== 'set' || !slug) throw new UsageError(USAGE);
   if (!SLUG_RE.test(slug)) throw new UsageError(`slug không hợp lệ: "${slug}"`);
-  if ((values.pixel === undefined) === !values['no-pixel']) throw new UsageError('cần đúng một trong --pixel <id> hoặc --no-pixel');
+  const pixelSet = values.pixel !== undefined || values['no-pixel'];
+  const appSet = values.app !== undefined || values['no-app'];
+  if (!pixelSet && !appSet) throw new UsageError('cần --pixel <id> | --no-pixel và/hoặc --app <id> | --no-app');
+  if (values.pixel !== undefined && values['no-pixel']) throw new UsageError('cần đúng một trong --pixel <id> hoặc --no-pixel');
+  if (values.app !== undefined && values['no-app']) throw new UsageError('cần đúng một trong --app <id> hoặc --no-app');
   if (values.pixel !== undefined && !PIXEL_RE.test(values.pixel)) throw new UsageError(`Pixel ID phải là 6-20 chữ số, nhận được "${values.pixel}"`);
-  const r = await api.setFunnel(slug, { pixel_id: values['no-pixel'] ? null : values.pixel });
+  if (values.app !== undefined && !APP_ID_RE.test(values.app)) throw new UsageError(`app id không hợp lệ: "${values.app}"`);
+  const body = {
+    ...(pixelSet && { pixel_id: values['no-pixel'] ? null : values.pixel }),
+    ...(appSet && { app_id: values['no-app'] ? null : values.app }),
+  };
+  const r = await api.setFunnel(slug, body);
+  if (appSet) out(r.app_id ? `${r.funnel}: app ${r.app_id}` : `${r.funnel}: đã gỡ app`);
+  if (!pixelSet) return 0;
   out(r.pixel_id ? `${r.funnel}: pixel ${r.pixel_id}` : `${r.funnel}: đã tắt pixel`);
   out(`Đã đồng bộ ${r.synced}/${r.hosts.length} host${r.hosts.length ? `: ${r.hosts.join(', ')}` : ''}.`);
   if (r.kv_sync === 'pending') {
@@ -100,6 +119,77 @@ async function funnelCommand(api, sub, args, values, out) {
   return 0;
 }
 
+async function appCommand(api, sub, args, values, out) {
+  const id = args[0];
+  if (sub === 'ls') {
+    const { apps } = await api.listApps();
+    if (!apps.length) out('(chưa có app nào)');
+    for (const a of apps) out(`${a.id.padEnd(20)} ${a.kind.padEnd(4)} ${a.name.padEnd(24)} ${a.webhook_url ?? '-'}`);
+    return 0;
+  }
+  if (!['create', 'rotate-key', 'webhooks'].includes(sub) || !id) throw new UsageError(USAGE);
+  if (!APP_ID_RE.test(id)) throw new UsageError(`app id không hợp lệ: "${id}"`);
+  if (sub === 'create') {
+    if (!values.name || !values.webhook || !['app', 'web'].includes(values.kind)) {
+      throw new UsageError('cần --name, --kind app|web và --webhook <url>');
+    }
+    if (values.kind === 'app' && (!values.adjust || !values.scheme)) throw new UsageError('app kiểu app cần --adjust <url> và --scheme <scheme>');
+    if (values.kind === 'web' && !values['return-url']) throw new UsageError('app kiểu web cần --return-url <url>');
+    const r = await api.createApp({
+      id,
+      name: values.name,
+      kind: values.kind,
+      webhook_url: values.webhook,
+      ...(values.kind === 'app' ? { adjust_tracker_url: values.adjust, deeplink_scheme: values.scheme } : { return_url: values['return-url'] }),
+    });
+    out(`${r.app.id} (${r.app.kind}) đã tạo.`);
+    out('Hai giá trị dưới đây chỉ hiện MỘT lần: lưu vào password manager rồi gửi riêng cho team backend app.');
+    out(`  API key:        ${r.api_key}`);
+    out(`  Webhook secret: ${r.webhook_secret}`);
+    return 0;
+  }
+  if (sub === 'rotate-key') {
+    const r = await api.rotateKey(id);
+    out(`${id}: API key mới (chỉ hiện MỘT lần): ${r.api_key}`);
+    out(`Key cũ còn dùng được tới ${r.app.prev_key_expires_at}.`);
+    return 0;
+  }
+  if (values.resend !== undefined) {
+    if (!EVENT_ID_RE.test(values.resend)) throw new UsageError(`event id không hợp lệ: "${values.resend}"`);
+    const r = await api.resendWebhook(id, values.resend);
+    out(`${r.event_id}: đặt lại pending, gửi trong vài giây.`);
+    return 0;
+  }
+  const { items } = await api.listWebhooks(id, { status: values.dead ? 'dead' : undefined });
+  if (!items.length) out(values.dead ? '(không có webhook dead)' : '(chưa có webhook)');
+  for (const i of items) {
+    out(`${i.event_id}  ${i.created_at}  ${i.type.padEnd(19)} ${i.app_user_id.padEnd(20)} ${i.status.padEnd(9)} ${i.attempts}  ${i.last_error ?? ''}`.trimEnd());
+  }
+  return 0;
+}
+
+async function customerCommand(api, sub, args, out) {
+  const email = args[0];
+  if (sub !== 'show' || !email || !email.includes('@')) throw new UsageError(USAGE);
+  const { customers } = await api.lookupCustomer(email);
+  if (!customers.length) out('Không có khách nào với email này.');
+  for (const c of customers) {
+    out(`${c.customer_ref ?? '(chưa có customer_ref)'}  ${c.paddle_customer_id}  từ ${c.created_at}`);
+    out('  Quyền:');
+    if (!c.entitlements.length) out('    (không có)');
+    for (const e of c.entitlements) {
+      out(`    ${e.app_id}/${e.key}  ${e.active ? 'active' : 'off'}  hết hạn ${e.expires_at ?? 'không'}  (${e.source} ${e.source_id})`);
+    }
+    out('  Liên kết:');
+    if (!c.links.length) out('    (không có)');
+    for (const l of c.links) out(`    ${l.app_id}/${l.app_user_id}  từ ${l.linked_at}${l.revoked_at ? `  thu hồi ${l.revoked_at}` : ''}`);
+    out('  Webhook gần đây:');
+    if (!c.deliveries.length) out('    (không có)');
+    for (const d of c.deliveries) out(`    ${d.event_id}  ${d.type}  ${d.app_id}/${d.app_user_id}  ${d.status} (${d.attempts})`);
+  }
+  return 0;
+}
+
 const DURATION_RE = /^([1-9]\d*)([mhd])$/;
 const UNIT_SECONDS = { m: 60, h: 3600, d: 86400 };
 
@@ -215,6 +305,16 @@ export async function run(argv, { out = console.log, err = console.error, env =
         since: { type: 'string' },
         topic: { type: 'string' },
         limit: { type: 'string' },
+        app: { type: 'string' },
+        'no-app': { type: 'boolean', default: false },
+        name: { type: 'string' },
+        kind: { type: 'string' },
+        adjust: { type: 'string' },
+        scheme: { type: 'string' },
+        'return-url': { type: 'string' },
+        webhook: { type: 'string' },
+        dead: { type: 'boolean', default: false },
+        resend: { type: 'string' },
       },
     });
     const [cmd, sub, ...rest] = positionals;
@@ -224,7 +324,7 @@ export async function run(argv, { out = console.log, err = console.error, env =
       out('Đã lưu thông tin đăng nhập.');
       return 0;
     }
-    if (!['route', 'publish', 'funnel', 'events', 'billing'].includes(cmd)) throw new UsageError(USAGE);
+    if (!['route', 'publish', 'funnel', 'events', 'billing', 'app', 'customer'].includes(cmd)) throw new UsageError(USAGE);
     if (cmd === 'events') return await eventsCommand(sub, values, out, env, deps);
     if (cmd === 'publish' && (!sub || !values.slug)) throw new UsageError('cách dùng: ikf publish <folder> --slug <slug>');
     const api = deps.api ?? createApi(await loadCredentials(env));
@@ -234,6 +334,8 @@ export async function run(argv, { out = console.log, err = console.error, env =
     }
     if (cmd === 'funnel') return await funnelCommand(api, sub, rest, values, out);
     if (cmd === 'billing') return await billingCommand(api, sub, rest, values, out);
+    if (cmd === 'app') return await appCommand(api, sub, rest, values, out);
+    if (cmd === 'customer') return await customerCommand(api, sub, rest, out);
     return await routeCommand(api, sub, rest, values, out);
   } catch (e) {
     if (e instanceof UsageError) {
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/cli
```

Expected: `Test Files  12 passed (12)`, `Tests  113 passed (113)`.

- [ ] **Step 5: Commit**

```bash
git add packages/cli
git commit -m "feat(cli): ikf app create|ls|rotate-key|webhooks, funnel set --app, prices plan=price@key, customer show"
```

---

### Task 12: Hạ tầng (secret, IAM, rate limit) + `docs/integration/app-backend.md` + runbook + CI; chạy lại toàn nhánh

Tài liệu tích hợp là **deliverable** cho team backend app. Test vector trong đó (`whsec_test_0123456789`, `t = 1791540000` = 2026-10-09T10:00:00Z, body JSON một dòng) cho chữ ký `v1=421e1124afa0a302d87e554e4460e51e349505be5250f3ec74c41465b17901bf` — giá trị chạy ra từ `signPayload` (Task 8 ghim nó), và `docs-vector.test.js` đọc chính file markdown để hai nơi không lệch. Hai đoạn mã kiểm chữ ký (Node, Python 3.9+) đã chạy với vector này và trả `true`.

**Files:**
- Create: `docs/integration/app-backend.md`, `docs/runbooks/entitlement-identity.md`
- Modify: `.github/workflows/core-api.yml`, `infra/modules/edge/main.tf`, `infra/modules/edge/variables.tf`, `infra/stack/main.tf`
- Test: `infra/modules/edge/tests/edge.tftest.hcl`, `infra/stack/tests/stack.tftest.hcl`, `services/core-api/test/docs-vector.test.js`

**Interfaces:**
- Consumes: `signPayload`, `verifySignature` (Task 8); toàn bộ API (Task 3–8); module `edge` (`ratelimit_full`, B19), `security` (`secret_names`).
- Produces: biến `rate_limited_paths` (4 đường dẫn chính xác) + `rate_limit_requests_per_10s = 50` (E12); secret `ikf/<env>/claim-token-key`; IAM `AppWebhookSecrets` (`CreateSecret`, `PutSecretValue`, `GetSecretValue` trên `arn:aws:secretsmanager:<region>:<account>:secret:ikf/<env>/app-webhook/*`); `data.aws_caller_identity.current`; workflow core-api chạy khi `docs/integration/**` đổi; `docs/integration/app-backend.md`; `docs/runbooks/entitlement-identity.md`. Quyền `ses:SendEmail` và env `MAIL_FROM` đã có từ plan infra (không đổi).

- [ ] **Step 1: Viết test fail**

`infra/modules/edge/tests/edge.tftest.hcl` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/infra/modules/edge/tests/edge.tftest.hcl b/infra/modules/edge/tests/edge.tftest.hcl
index f856275..3dd21e9 100644
--- a/infra/modules/edge/tests/edge.tftest.hcl
+++ b/infra/modules/edge/tests/edge.tftest.hcl
@@ -36,8 +36,13 @@ run "sensitive_paths_are_rate_limited" {
   command = apply
 
   assert {
-    condition     = alltrue([for p in ["/v1/otp", "/v1/claim"] : strcontains(cloudflare_ruleset.ratelimit.rules[0].expression, "\"${p}\"")])
-    error_message = "OTP and claim must be rate limited."
+    condition     = alltrue([for p in ["/v1/otp/send", "/v1/otp/verify", "/v1/claims/redeem", "/v1/magic/redeem"] : strcontains(cloudflare_ruleset.ratelimit.rules[0].expression, "\"${p}\"")])
+    error_message = "The real OTP, claim and magic-link paths must be rate limited."
+  }
+
+  assert {
+    condition     = cloudflare_ruleset.ratelimit.rules[0].ratelimit.requests_per_period == 50 && cloudflare_ruleset.ratelimit.rules[0].ratelimit.period == 10
+    error_message = "Identity endpoints: 50 requests per 10 seconds per IP (app backends call them)."
   }
 }
 
PATCH
```

`infra/stack/tests/stack.tftest.hcl` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/infra/stack/tests/stack.tftest.hcl b/infra/stack/tests/stack.tftest.hcl
index 4f6d392..c1e2eba 100644
--- a/infra/stack/tests/stack.tftest.hcl
+++ b/infra/stack/tests/stack.tftest.hcl
@@ -55,6 +55,11 @@ mock_provider "cloudflare" {
 
 mock_provider "random" {}
 
+override_data {
+  target = data.aws_caller_identity.current
+  values = { account_id = "111111111111" }
+}
+
 variables {
   env                   = "prod"
   region                = "us-east-1"
@@ -243,3 +248,26 @@ run "staging_uses_the_paddle_sandbox_and_free_plan_rate_limit" {
     error_message = "staging (Free plan) rate-limits only /v1/checkout."
   }
 }
+
+run "identity_wiring" {
+  command = apply
+
+  assert {
+    condition     = contains(keys(module.security.secret_arns), "claim-token-key")
+    error_message = "core-api needs the claim-token-key secret (claim tokens are derived from it)."
+  }
+
+  assert {
+    condition = anytrue([for s in data.aws_iam_policy_document.task.statement : (
+      s.sid == "AppWebhookSecrets" &&
+      length(setsubtract(["secretsmanager:CreateSecret", "secretsmanager:PutSecretValue", "secretsmanager:GetSecretValue"], s.actions)) == 0 &&
+      length(s.resources) == 1 && contains(s.resources, "arn:aws:secretsmanager:us-east-1:111111111111:secret:ikf/prod/app-webhook/*")
+    )])
+    error_message = "core-api may create, update and read only ikf/<env>/app-webhook/* secrets."
+  }
+
+  assert {
+    condition     = anytrue([for s in data.aws_iam_policy_document.task.statement : s.sid == "Email" && contains(s.actions, "ses:SendEmail")]) && local.core_environment["MAIL_FROM"] == "no-reply@mail.ikf.example"
+    error_message = "core-api sends claim and OTP emails through SES from no-reply@mail.<zone>."
+  }
+}
PATCH
```

`services/core-api/test/docs-vector.test.js` (tạo mới):

```js
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { signPayload, verifySignature } from '../src/identity/webhooks.js';

const DOC = new URL('../../../docs/integration/app-backend.md', import.meta.url);

describe('docs/integration/app-backend.md', () => {
  it('its signature test vector is what core-api signs', () => {
    const md = readFileSync(DOC, 'utf8');
    const field = (name) => new RegExp(`^${name}\\s+= (.+)$`, 'm').exec(md)[1];
    const [secret, t, body, signature] = ['secret', 't', 'body', 'signature'].map(field);
    expect(signPayload(body, secret, Number(t))).toBe(signature);
    expect(verifySignature(body, signature, secret, Number(t) * 1000)).toBe(true);
    expect(md).toContain(`Ikf-Signature: ${signature}`);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
(cd infra/modules/edge && terraform init -backend=false -input=false >/dev/null && terraform test -no-color | tail -3)
(cd infra/stack && terraform init -backend=false -input=false >/dev/null && terraform test -no-color | grep -E "fail|Success|Failure")
npm test -w @ikf/core-api -- test/docs-vector.test.js 2>&1 | grep -E "ENOENT|Tests  "
```

Expected: edge `run "sensitive_paths_are_rate_limited"... fail`, `Failure! 9 passed, 1 failed.`; stack `run "identity_wiring"... fail`, `Failure! 10 passed, 1 failed.`; `docs-vector.test.js` FAIL `ENOENT … docs/integration/app-backend.md`.

- [ ] **Step 3: Implement**

`.github/workflows/core-api.yml` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/.github/workflows/core-api.yml b/.github/workflows/core-api.yml
index 448ca7a..90f8119 100644
--- a/.github/workflows/core-api.yml
+++ b/.github/workflows/core-api.yml
@@ -2,10 +2,10 @@ name: core-api
 
 on:
   pull_request:
-    paths: ["services/core-api/**", "packages/route-match/**", "packages/paddle/**", "packages/event-schema/**", "package-lock.json", ".github/workflows/core-api.yml"]
+    paths: ["services/core-api/**", "packages/route-match/**", "packages/paddle/**", "packages/event-schema/**", "docs/integration/**", "package-lock.json", ".github/workflows/core-api.yml"]
   push:
     branches: [main]
-    paths: ["services/core-api/**", "packages/route-match/**", "packages/paddle/**", "packages/event-schema/**", "package-lock.json", ".github/workflows/core-api.yml"]
+    paths: ["services/core-api/**", "packages/route-match/**", "packages/paddle/**", "packages/event-schema/**", "docs/integration/**", "package-lock.json", ".github/workflows/core-api.yml"]
 
 permissions:
   contents: read
PATCH
```

`docs/integration/app-backend.md` (tạo mới):

````markdown
# iFunnel → app backend integration

For the backend team of an app that sells through iFunnel funnels (web2app) or a web product (web2web).
iFunnel takes the payment on the web (Paddle) and keeps the **entitlements** a buyer paid for. **Your backend
stays the place that decides premium**: it links its own user account to the buyer, then iFunnel pushes every
entitlement change (renewal, cancel, refund, chargeback) to your backend as a signed webhook.

Base URL: `https://api.<zone>` (staging and prod differ; ask the platform team). All bodies are JSON.

## 1. What you get from the platform team

Created with `ikf app create` (shown once, sent to you out of band):

| Value | Looks like | Keep it |
|---|---|---|
| App id | `starlyn` | in config |
| API key | `ikfa_` + 43 chars | secret, server side only — never in the mobile app |
| Webhook secret | `whsec_` + 43 chars | secret, server side only |

You give them: your webhook URL (https), and for a mobile app your Adjust tracker URL and deep-link scheme
(e.g. `starlyn`); for a web product the URL buyers land on (`return_url`).

The API key can be rotated (`ikf app rotate-key`): the old key keeps working for **24 hours**, deploy the new one
within that window.

## 2. Flows

### 2.1 Bought on the web, opens the app (claim token)

1. After payment the funnel's "Get the app" button points to
   `<adjust tracker>?deep_link=<scheme>://claim?t=<token>` and the buyer gets the same link by email.
2. Adjust installs/opens the app with the deep link `<scheme>://claim?t=<token>` (deferred deep link on first
   install). The app sends `token` to **your backend** together with its own user id.
3. Your backend calls `POST /v1/claims/redeem` (below) and stores what comes back.

The token is single use and lives 7 days. It contains no email or personal data.

### 2.2 Another phone, reinstall, or the token is gone (email code)

1. The app asks for the email used at checkout → your backend calls `POST /v1/otp/send`. The reply is always
   `200 {}` (it never tells whether the email bought anything); a 6-digit code is emailed only to a buyer.
2. The user types the code → your backend calls `POST /v1/otp/verify` with the email, code and user id.

Codes live 10 minutes, 5 wrong tries lock a code, at most 3 codes per email per hour.

### 2.3 Web product (web2web, magic link)

After payment the funnel sends the buyer to `<return_url>?ikf_ml=<token>`. Your web backend calls
`POST /v1/magic/redeem` with that token and the user id it creates or signs in. The token is single use and
lives 15 minutes. Remove `ikf_ml` from the URL once read.

## 3. API (your backend → iFunnel)

Every call: `Authorization: Bearer <api key>`. Wrong or expired key → `401 {"error":"unauthorized"}`.
`app_user_id` is your stable user id: 1–128 printable ASCII characters, no spaces.

| Endpoint | Body | 200 reply |
|---|---|---|
| `POST /v1/claims/redeem` | `{"token", "app_user_id"}` | `{"customer_ref", "entitlements"}` |
| `POST /v1/otp/send` | `{"email"}` | `{}` (always) |
| `POST /v1/otp/verify` | `{"email", "code", "app_user_id"}` | `{"customer_ref", "entitlements"}` |
| `POST /v1/magic/redeem` | `{"token", "app_user_id"}` | `{"customer_ref", "entitlements"}` |
| `GET /v1/users/{app_user_id}/entitlements` | — | `{"entitlements"}` (`[]` if not linked) |

`entitlements` is the **full** list for this app:

```json
{
  "customer_ref": "cus_01K75Z0000000000000000000B",
  "entitlements": [
    { "key": "premium", "active": true, "expires_at": "2026-10-19T10:00:00.000Z" },
    { "key": "tarot_2027", "active": true, "expires_at": null }
  ]
}
```

- `key` comes from the plan bought (`premium` unless the platform team named it otherwise).
- `expires_at: null` = no end (one-time purchase). A subscription's `expires_at` is its period end + 3 days of
  grace; you get a webhook when it renews, and one when it ends. Check `active`, not the date.
- `customer_ref` identifies the buyer without personal data. Store it; support looks buyers up by it.
- Redeeming before iFunnel has processed the payment works: you get `entitlements: []` and an
  `entitlement.updated` webhook seconds later.

Errors (`{"error": "<code>"}`):

| Status | Code | Meaning |
|---|---|---|
| 404 | `claim_not_found` / `magic_not_found` | unknown token, or a token of another app |
| 409 | `claim_used` / `magic_used` | already used by another user (the same user again gets 200: safe to retry) |
| 410 | `claim_expired` / `magic_expired` | too old; use the email code |
| 401 | `otp_invalid` | wrong or expired code |
| 429 | `otp_locked` | 5 wrong tries; send a new code |
| 409 | `app_user_linked_elsewhere` | this user id is already linked to another buyer |
| 400 | `bad_request` | malformed body |

**Links.** One buyer can be linked to at most **3** of your user ids at a time. A 4th link removes the oldest:
you get `link.revoked` for that user id (with `entitlements: []`) — remove the web entitlements from it.

## 4. Webhooks (iFunnel → your backend)

```
POST <your webhook url>
Content-Type: application/json
Ikf-Event-Id: 01K75Z0000000000000000000A
Ikf-Signature: t=1791540000,v1=421e1124afa0a302d87e554e4460e51e349505be5250f3ec74c41465b17901bf

{"id":"01K75Z…","type":"entitlement.updated","created_at":"…","app_id":"starlyn","app_user_id":"u_42",
 "customer_ref":"cus_01K75Z…","entitlements":[{"key":"premium","active":true,"expires_at":"…"}]}
```

| `type` | When | `entitlements` |
|---|---|---|
| `link.created` | a redeem / OTP verify / magic redeem linked `app_user_id` | full current list |
| `entitlement.updated` | anything changed: purchase, renewal, cancel, period end, refund, chargeback | full current list |
| `link.revoked` | the link was replaced by a newer one (max 3) | `[]` |

Handling rules:
1. **Verify the signature first** (below); reject with 401 on failure.
2. **Overwrite, don't merge**: every payload carries the full list for that user in this app; replace what you
   stored from iFunnel with it. Keys absent from the list are not entitled.
3. **Deduplicate by `id`** (= `Ikf-Event-Id`): a resend after a timeout can deliver the same event twice.
4. Reply **2xx within 10 seconds**; do slow work after replying. Anything else (timeout, 3xx, 4xx, 5xx) is
   retried after 1 min, 5 min, 30 min, 2 h, 6 h, 12 h and 24 h, then the event is marked dead and the platform
   team is alerted (they can resend it).
5. Events for one `app_user_id` arrive **in order**: the next one waits until the previous one is delivered or dead.
   If you were down, `GET /v1/users/{app_user_id}/entitlements` gives the current state at any time.

### 4.1 Signature

`Ikf-Signature: t=<unix seconds>,v1=<hex>` where `hex = HMAC-SHA256(key = webhook secret, message = "<t>.<raw body>")`.

- Use the **raw request bytes**; parsing and re-serializing the JSON changes them and breaks the signature.
- Compare in constant time. Reject if `|now − t| > 300` seconds.

Test vector (your verifier must accept exactly this; the core-api test suite checks this file):

```text
secret    = whsec_test_0123456789
t         = 1791540000
body      = {"id":"01K75Z0000000000000000000A","type":"entitlement.updated","app_id":"starlyn","app_user_id":"u_42","customer_ref":"cus_01K75Z0000000000000000000B","created_at":"2026-10-09T10:00:00.000Z","entitlements":[{"key":"premium","active":true,"expires_at":"2026-10-19T10:00:00.000Z"}]}
signature = t=1791540000,v1=421e1124afa0a302d87e554e4460e51e349505be5250f3ec74c41465b17901bf
```

Node.js (Express: `app.post('/ikf/webhook', express.raw({ type: 'application/json' }), handler)`):

```js
import { createHmac, timingSafeEqual } from 'node:crypto';

export function verifyIkf(rawBody, header, secret, nowSec = Math.floor(Date.now() / 1000)) {
  const m = /^t=(\d+),v1=([0-9a-f]{64})$/.exec(header ?? '');
  if (!m || Math.abs(nowSec - Number(m[1])) > 300) return false;
  const want = createHmac('sha256', secret).update(`${m[1]}.${rawBody}`).digest();
  return timingSafeEqual(want, Buffer.from(m[2], 'hex'));
}
```

Python:

```python
import hashlib, hmac, re, time
from typing import Optional

def verify_ikf(raw_body: bytes, header: str, secret: str, now: Optional[int] = None) -> bool:
    m = re.fullmatch(r"t=(\d+),v1=([0-9a-f]{64})", header or "")
    if not m or abs((now or int(time.time())) - int(m.group(1))) > 300:
        return False
    want = hmac.new(secret.encode(), m.group(1).encode() + b"." + raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(want, m.group(2))
```

## 5. Checklist before going live

- [ ] API key and webhook secret only on the server; the app talks to your backend, never to iFunnel.
- [ ] Deep link `<scheme>://claim?t=…` handled on first launch (Adjust deferred deep link) and while running.
- [ ] "Restore purchase with email" screen calling `/v1/otp/send` then `/v1/otp/verify`.
- [ ] Webhook endpoint: raw-body signature check (passes the vector above), dedupe by `id`, overwrite, 2xx fast.
- [ ] `link.revoked` removes web entitlements from that user.
- [ ] `409 app_user_linked_elsewhere`: tell the user this purchase belongs to another account (support has
      `customer_ref`).
- [ ] Staging run: buy on a staging funnel with a Paddle sandbox card → install → open → premium; second phone →
      restore with email → premium; refund in the Paddle sandbox → premium off within a minute.
````

`docs/runbooks/entitlement-identity.md` (tạo mới):

````markdown
# Runbook: entitlement + identity

Rollout per environment (staging first). Needs billing live (docs/runbooks/billing-paddle.md). No secret value
goes into git, a shell history or a chat.

Identity is off until it is configured: core-api registers `/v1/apps`, `/v1/claims/*`, `/v1/otp/*`,
`/v1/magic/*`, `/v1/users/*`, `/v1/checkout/:id/claim` and starts `entitlement-sync` + `webhook-sender` only when
the secret `claim-token-key` has a value and `MAIL_FROM` is set (otherwise it logs
`identity disabled, missing: …`). While off, `outbox.published_at` stays NULL: nothing is lost, the worker
catches up when it starts.

## 1. Terraform

`terraform apply` the env: secret `ikf/<env>/claim-token-key` (empty), IAM `AppWebhookSecrets`
(`ikf/<env>/app-webhook/*`), identity rate-limit paths (prod only: staging's Free plan keeps one rule, B19).

## 2. Secret value

```bash
aws secretsmanager put-secret-value --secret-id ikf/<env>/claim-token-key \
  --secret-string "$(openssl rand -base64 48)"
```
Changing it later invalidates every unused claim link (buyers fall back to the email code). Then force a new
deployment of core-api; the log must not say `identity disabled`.

## 3. SES

`mail.<zone>` is verified by the email module (DKIM). A new SES account is in the **sandbox**: request production
access for the region before real buyers, or only verified addresses receive claim/OTP emails.

## 4. App + funnels

```bash
ikf app create starlyn --name "Starlyn" --kind app --adjust https://app.adjust.com/<token> --scheme starlyn \
  --webhook https://<app backend>/ikf/webhook          # prints API key + webhook secret ONCE
ikf funnel set witch-power --app starlyn
ikf funnel prices set witch-power 1w=pri_…:dsc_… addon=pri_…@tarot_2027
```
Send the key and secret to the app backend team through the password manager, with
`docs/integration/app-backend.md`.

## 5. Verify (staging)

1. Buy the weekly plan on the funnel (sandbox card) → the "Get the app" link becomes the Adjust link within ~20 s;
   claim email arrives.
2. App on a test phone opens through the link → backend redeems → premium. `ikf customer show <email>` lists the
   link and a delivered `link.created`.
3. Second phone → "Restore purchase" → email code → premium; third + fourth phone → the first gets `link.revoked`.
4. Refund in the Paddle dashboard → `entitlement.updated` with `active: false` within a minute.
5. Stop the app backend's webhook endpoint, cause a change → `ikf app webhooks starlyn` shows retries; after the
   schedule (or by setting `next_attempt_at` in a staging DB) → dead + one alarm email; restore the endpoint and
   `ikf app webhooks starlyn --resend <event_id>` → delivered.
6. Exit criterion (spec): ≥ 98% of paid staging buyers linked —
   `SELECT count(DISTINCT ct.customer_id) FILTER (WHERE l.id IS NOT NULL)::float / count(DISTINCT ct.customer_id) FROM claim_tokens ct LEFT JOIN app_links l ON l.customer_id = ct.customer_id AND l.app_id = ct.app_id;`

## Operations

- Dead webhooks: alarm `ikf billing: webhook_dead:<app>` (once per 15 min per app). `ikf app webhooks <app> --dead`,
  fix the backend, `--resend <event_id>`.
- Claim email failing: alarm `claim_email_failed`; buyers still see the link on the funnel and can restore by email.
- Key leaked: `ikf app rotate-key <app>`; the old key stops after 24 h.
````

`infra/modules/edge/main.tf` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/infra/modules/edge/main.tf b/infra/modules/edge/main.tf
index 1c48bae..9de0a9f 100644
--- a/infra/modules/edge/main.tf
+++ b/infra/modules/edge/main.tf
@@ -53,7 +53,7 @@ resource "cloudflare_ruleset" "origin_auth" {
 locals {
   ratelimit_api_rules = [
     {
-      description = "Throttle OTP and claim per IP"
+      description = "Throttle the app-backend identity API (OTP, claim, magic link) per IP"
       expression  = "(http.host eq \"${local.api_fqdn}\" and http.request.uri.path in {${local.paths}})"
       action      = "block"
       ratelimit = {
PATCH
```

`infra/modules/edge/variables.tf` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/infra/modules/edge/variables.tf b/infra/modules/edge/variables.tf
index d529879..89cb143 100644
--- a/infra/modules/edge/variables.tf
+++ b/infra/modules/edge/variables.tf
@@ -24,13 +24,15 @@ variable "origin_auth_secret" {
 }
 
 variable "rate_limited_paths" {
-  type    = list(string)
-  default = ["/v1/otp", "/v1/claim"]
+  description = "App-backend identity endpoints (exact paths; the rule is an `in` set)."
+  type        = list(string)
+  default     = ["/v1/otp/send", "/v1/otp/verify", "/v1/claims/redeem", "/v1/magic/redeem"]
 }
 
 variable "rate_limit_requests_per_10s" {
-  type    = number
-  default = 5
+  description = "Per-IP limit on the identity endpoints. Callers are app backends (few IPs, many users), so it is a ceiling against a runaway client; OTP abuse is limited per email in core."
+  type        = number
+  default     = 50
 }
 
 variable "collector_requests_per_10s" {
PATCH
```

`infra/stack/main.tf` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/infra/stack/main.tf b/infra/stack/main.tf
index 44d865b..1ce9f8d 100644
--- a/infra/stack/main.tf
+++ b/infra/stack/main.tf
@@ -3,7 +3,7 @@ locals {
   worker_script_name = "ikf-edge-router-${var.env}"
   secret_names = [
     "paddle-api-key", "paddle-webhook-secret", "paddle-client-token", "meta-capi-token", "adjust-s2s-token", "clickhouse-url",
-    "cf-kv-api-token", "r2-access-key-id", "r2-secret-access-key", "bootstrap-admin-token",
+    "cf-kv-api-token", "r2-access-key-id", "r2-secret-access-key", "bootstrap-admin-token", "claim-token-key",
   ]
   # Staging never charges real cards; prod never takes sandbox payments.
   paddle_env = var.env == "prod" ? "live" : "sandbox"
@@ -11,6 +11,8 @@ locals {
 
 data "cloudflare_ip_ranges" "cf" {}
 
+data "aws_caller_identity" "current" {}
+
 resource "random_password" "origin_auth" {
   length  = 48
   special = false
@@ -126,6 +128,12 @@ data "aws_iam_policy_document" "task" {
     actions   = ["secretsmanager:GetSecretValue"]
     resources = [module.database.master_secret_arn]
   }
+  # Per-app webhook secrets: core creates them at `ikf app create` and reads them to sign webhooks.
+  statement {
+    sid       = "AppWebhookSecrets"
+    actions   = ["secretsmanager:CreateSecret", "secretsmanager:PutSecretValue", "secretsmanager:GetSecretValue"]
+    resources = ["arn:aws:secretsmanager:${var.region}:${data.aws_caller_identity.current.account_id}:secret:ikf/${var.env}/app-webhook/*"]
+  }
   statement {
     sid       = "Email"
     actions   = ["ses:SendEmail"]
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
terraform fmt -check -recursive infra
(cd infra/modules/edge && terraform test -no-color | tail -1)
(cd infra/stack && terraform test -no-color | tail -1)
for e in staging prod; do (cd infra/envs/$e && terraform init -backend=false -input=false >/dev/null && terraform validate -no-color); done
D=$HOME/.cache/ent-actionlint; rm -rf "$D"; mkdir -p "$D" && cp -r .github "$D/" && (cd "$D" && git init -q && docker run --rm -v "$D:/repo" -w /repo rhysd/actionlint:latest); echo "actionlint exit $?"; rm -rf "$D"
npm test -w @ikf/paddle -w @ikf/event-schema -w @ikf/sdk -w @ikf/cli -w @ikf/edge-router -w @ikf/event-consumer -w @ikf/core-api -w @ikf/route-match 2>&1 | grep -E "Test Files|Tests  "
```

Expected: fmt không in gì; edge `Success! 10 passed, 0 failed.`; stack `Success! 11 passed, 0 failed.`; hai env `Success! The configuration is valid.`; `actionlint exit 0`; workspace: paddle 31, event-schema 138, sdk 152, cli 113, edge-router 101, event-consumer 7 + 27, core-api **293** (31 file), route-match 35 — tất cả PASS.

- [ ] **Step 5: Commit**

```bash
git add .github docs/integration docs/runbooks infra/modules infra/stack services/core-api
git commit -m "infra(identity): claim-token-key, app-webhook secrets IAM, identity rate-limit paths; docs: app-backend integration + runbook"
```

---

## Theo sau (thủ công, ngoài phạm vi plan này)

Làm theo `docs/runbooks/entitlement-identity.md` sau khi Task 0 xong, nhánh đã review + merge, billing đã chạy trên staging:

1. `terraform apply` staging → `aws secretsmanager put-secret-value --secret-id ikf/staging/claim-token-key --secret-string "$(openssl rand -base64 48)"` → force new deployment core-api → log không còn `identity disabled`.
2. `ikf app create starlyn … --webhook <backend staging>` (gửi key + secret qua password manager), `ikf funnel set witch-power --app starlyn`, `ikf funnel prices set witch-power 1w=pri_…:dsc_… addon=pri_…@tarot_2027`.
3. **Demo local** (E17): khi `feat/local-demo` được rebase lên nhánh này, thêm backend app giả vào `npm run demo` (mua bằng Paddle giả → claim → webhook đến, dùng `verifySignature`).
4. Staging, app pilot thật (cần team mobile): mua trên funnel → nút get-app thành link Adjust trong ≤ 20s, email claim tới → cài app → mở → premium; máy thứ hai khôi phục bằng email → premium; máy thứ 4 → máy đầu nhận `link.revoked`; refund trên Paddle sandbox → `entitlement.updated` `active:false` trong 1 phút.
5. Tắt endpoint webhook của backend app → `ikf app webhooks starlyn` thấy retry; dead → đúng 1 email alarm `webhook_dead:starlyn` trong 15 phút → bật lại, `--resend` → delivered.
6. Đặt `published_at = NULL` cho toàn bộ outbox staging → sau 1 phút `SELECT count(*) FROM webhook_deliveries` không đổi (điều kiện xong của spec).
7. Đo tiêu chí ≥ 98% người trả tiền vào được app (truy vấn trong runbook §5.6) sau ≥ 50 lượt mua pilot.
8. Team nội dung: bỏ `email=` khỏi `appHandoffUrl()` ở 8 funnel nebula/scanner (E11).

---

## Self-Review

**Spec coverage:**

| Spec | Task |
|---|---|
| Mục tiêu: người trả tiền vào được app / web product, đổi máy, cài lại | 5 (quyền), 6 (claim, magic), 7 (OTP), 10 (SDK), "Theo sau" 4 |
| Điều kiện xong: ≥ 98% trên staging | "Theo sau" 7 (truy vấn ở runbook) |
| Điều kiện xong: chạy lại outbox không sinh webhook thừa | 5 (Review Focus 1), "Theo sau" 6 |
| Điều kiện xong: `docs/integration/app-backend.md` + test vector | 8 (vector), 12 (tài liệu + `docs-vector.test.js`) |
| Quyết định #1 backend app quyết định premium | 6–8 (API + webhook ghi đè), 12 (tài liệu) |
| Quyết định #2 S2S: claim token / OTP → backend app → iFunnel bằng API key; webhook có chữ ký | 3 (API key), 6, 7, 8 |
| Quyết định #3 quyền theo `entitlement_key`, theo `funnels.app_id`; subscription có hạn, one-time vĩnh viễn trừ refund/chargeback | 1, 2, 4, 5 (+E5, E7, E8) |
| Quyết định #4 tối đa 3 link, link thứ 4 → `link.revoked`; claim một lần, 7 ngày | 5 (TTL), 6 |
| Quyết định #5 `entitlement-sync` tính lại toàn bộ → `webhook_deliveries`; `webhook-sender` retry + alarm | 5, 8, 9 |
| §1 module identity, 2 worker cùng process, SDK, CLI, docs, infra | 3–9, 10, 11, 12 |
| §2 migration (mọi bảng + 2 `ALTER`), chỉ lưu sha256, `email_hash`, secret theo app ở Secrets Manager + cache 10 phút, key `ikfa_<43>` | 1 (+E2, E3, E4), 3, 8, 9 |
| §3 luồng web: claim token + email SES từ `no-reply@mail.<zone>` (một lần/checkout) | 5 (+E1, E2), 9, 12 |
| §3 SDK poll `/claim` 2s/20s, `app_link` dạng Adjust `deep_link`, `202 pending`, thứ tự gắn nút, web2web `return_url?ikf_ml=` | 6 (+E13), 10 (+E11) |
| §3 bảng endpoint backend app (redeem, otp send/verify, magic, entitlements) | 6, 7 |
| §3 OTP (6 số, 10 phút, 5 lần, 3/giờ, chỉ gửi cho người mua) | 7 (+E18) |
| §3 quy tắc liên kết (idempotent, 409, thu hồi cũ nhất, `link.created`) + `customer_ref` | 6 (+E3) |
| §4 tính quyền (bảng trạng thái, ân hạn, one-time, nhiều nguồn), so sánh + 1 delivery/link/app thay đổi, `published_at`, claim một lần, quét 5 phút, hàm thuần + test bảng | 2 (+E6), 5 (+E9) |
| §5 webhook (header, payload toàn bộ quyền, `link.revoked` rỗng), sender 1s, SKIP LOCKED, cũ nhất/user, timeout 10s, lịch retry, dead + alarm 15 phút/app, dead không chặn, resend, test vector | 8 (+E14, E15, E21), 9, 11, 12 |
| §6 quản trị: `POST /v1/apps` (key + secret một lần, secret vào Secrets Manager), rotate-key 24h, `PUT /v1/funnels/:slug app_id`, prices `entitlement_key`, tra khách, CLI | 3, 4, 8 (+E10), 11 |
| §7 bảng lỗi | claim 404/409/410 + app khác: 6; OTP 401/429: 7; email lạ 200: 7; key sai/hết hạn 401: 3; 409 elsewhere: 6; redeem trước webhook Paddle: 6; backend ngừng → retry/dead/alarm/resend/GET: 8, 11; worker chết: 5; refund/chargeback: 5; SES lỗi 3 lần + alarm, link vẫn trên web: 5, 10 |
| §7 bảo mật: hằng thời gian, rate limit, log không email, link không email | 3, 6, 7, 8 (`safeEqual`), 12 (+E12), 5/7 (log `email_hash`), 5 (link) |
| §8 bảng kiểm thử theo tầng | compute: 2; sync: 5; claim/OTP/magic: 6, 7; sender: 8; SDK: 10; CLI + admin API: 3, 4, 8, 11; demo local: "Theo sau" 3 (E17); staging: "Theo sau" 4 |
| §9 ngoài phạm vi (SDK mobile, IAP store, SSO, trang hủy, CAPI/Adjust relay) | không có task (đúng); `published_at` chỉ là con trỏ của entitlement |

**Placeholder:** không có "TBD"/"tương tự Task N". Mọi khối code là nội dung thật đã chạy: toàn bộ 12 task chạy trên bản sao `feat/billing-paddle@ffb2d21`, rồi các khối của chính file plan này được chạy lại tuần tự trên một bản sao sạch thứ hai (số RED/GREEN ở mỗi task là output của lần chạy lại đó; cây cuối trùng với bản thứ nhất). Image core-api build được và import được module identity; `terraform test`/`validate`/`fmt -check`, actionlint sạch. Giá trị thật (key, secret, tracker URL, webhook URL) là đầu vào Task 0 / runbook.

**Nhất quán tên / kiểu:**
- `webhookSecrets` `{get, put}`: `fakeSecrets` (3) = `secretsManagerStore` (9) → `createApp` (3), `secretCache` (8, 9).
- `mailer` `{send({to, subject, text, html})}`: `fakeMailer` (5) = `sesMailer` (9) → `sendClaimEmails` (5), `sendOtp` (7).
- `claimKey` → `claimTokenFor` (3) → `createClaimForCheckout`, `sendClaimEmails` (5), `claimForCheckout` (6); secret `claim-token-key` (9 ↔ 12 ↔ runbook).
- Payload delivery `{id, type, created_at, app_id, app_user_id, customer_ref, entitlements}`: `addDelivery` (5) → `link` (6) → `sendDue` (8) → tài liệu (12); `entitlements` `[{key, active, expires_at}]` = phản hồi redeem/verify/GET (6, 7) = SDK không dùng.
- `GET /v1/checkout/:id/claim` `{app_link}|{return_url}|202|404` (6) = SDK `claim()` (10).
- `alarm(kind, message)` của billing: `webhook_dead:<app>` (8), `claim_email_failed` (5) ← `identityDeps.alarm` (9).
- `appLinkFor` (5) dùng cho email (5) và `GET …/claim` (6); test so cùng chuỗi `https://app.adjust.com/abc123?deep_link=starlyn%3A%2F%2Fclaim%3Ft%3D<token>`.
- Route admin (3, 8) = `createApi` CLI (11): `/v1/apps`, `/v1/apps/:id/rotate-key`, `/v1/apps/:id/webhooks[?status=]`, `/v1/apps/:id/webhooks/:event_id/resend`, `/v1/customers/lookup`.

**Review Focus đã ghim:** 1 → Task 5; 2 → Task 6; 3 → Task 7; 4 → Task 8; 5 → Task 5 + Task 2.

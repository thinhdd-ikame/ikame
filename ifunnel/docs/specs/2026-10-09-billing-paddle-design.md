# Billing (Paddle) — Design Spec

> Subsystem số 4 trong [master plan](../plans/2026-10-05-ikame-funnel-platform.md) §10. Xây trên [Edge Router + Publisher](2026-10-06-edge-router-publisher-design.md) và [Runtime SDK + Collector](2026-10-08-runtime-sdk-collector-design.md) (repo `thinhdd-ikame/ikf-platform`).

**Mục tiêu:** user mua gói subscription hoặc add-on một lần ngay trong funnel, bằng form inline của Paddle, kể cả khi mở trong in-app browser của FB/IG/TikTok. Core lưu đúng trạng thái tiền: khách hàng, giao dịch, subscription. Mỗi thay đổi ghi vào `outbox` để entitlement và conversions-relay dùng sau. Email không bao giờ nằm trên URL.

**Điều kiện xong:**
- E2E trên Paddle sandbox pass: mua gói tuần, mua add-on, thẻ yêu cầu 3DS, refund.
- Chạy lại toàn bộ webhook theo thứ tự ngẫu nhiên, trùng và muộn: trạng thái cuối giống nhau, không có outbox trùng.
- `ikf billing reconcile` trên sandbox cho độ lệch bằng 0.

## Quyết định đã chốt (2026-10-09)

| # | Hạng mục | Lựa chọn |
|---|---|---|
| 1 | Nơi checkout | Paddle.js inline (overlay) ngay trong funnel. SDK gọi `IkFunnel.completePurchase(plan)` khi trả tiền xong. Dự phòng cho webview: nút "Mở trong trình duyệt" mở trang `/_ikf/pay` |
| 2 | Map giá | Lưu ở core theo từng funnel: `plan_key` → `paddle_price_id` (+ `paddle_discount_id`). Core kiểm tra với Paddle API khi đặt. Client không bao giờ gửi `price_id` |
| 3 | Email | Funnel cung cấp qua `IkFunnel.checkoutEmail()` (tùy chọn). Email chỉ đi trình duyệt → `POST /v1/checkout` (body) → Paddle. Không vào event hay ClickHouse |
| 4 | Phạm vi | Khách hàng, giao dịch, subscription, state machine và `outbox`. **Không** gồm cấp quyền, gửi CAPI/Adjust, trang hủy |
| 5 | Webhook | Inbox → SQS → worker đọc lại trạng thái mới nhất từ Paddle API, chỉ ghi khi `updated_at` mới hơn bản đang có |

## Hiện trạng funnel (khảo sát 69 `demo.html`, 2026-10-09)

- Bấm mua thì funnel phát `checkout_click {plan}`. Nếu `CONFIG.checkoutUrl[plan]` có giá trị, funnel chuyển trang và gắn `plan` + UTM. **12 funnel còn gắn cả email lên URL.**
- 56 funnel có `IkFunnel.completePurchase(plan)`, 54 funnel đọc `?paid=`.
- Có gói giá giới thiệu (ví dụ `'1w': $13.67, renew $49.99/month`) và add-on mua một lần (`addon`, `oneTime: true`) ở 27 funnel.

## 1. Thành phần

| Unit | Chạy ở | Trách nhiệm |
|---|---|---|
| `packages/paddle` | Dùng chung (Node) | Client Paddle API (fetch, timeout 10s, retry 2 lần với 5xx/429/mạng, sandbox/live), `verifyWebhook(rawBody, header, secret, now)` |
| `services/core-api` module `billing` | ECS | `POST /v1/checkout`, `GET /v1/checkout/:id`, `POST /v1/paddle/webhook`, `PUT/GET /v1/funnels/:slug/prices` |
| `services/core-api` worker `billing-sync` | ECS (cùng process) | Long-poll SQS `webhooks`, đọc lại trạng thái từ Paddle, cập nhật DB và outbox |
| `packages/sdk` (sửa) | Trình duyệt | Bắt `checkout_click`, Turnstile, gọi `/v1/checkout`, nạp Paddle.js, `completePurchase`, luồng dự phòng `?ikf_paid=` |
| `workers/edge-router` (sửa) | Worker | `__IKF.paddle = {env, clientToken}`, `__IKF.turnstile = <sitekey>`, `__IKF.api = <api origin>`; trang `GET /_ikf/pay?txn=` |
| `packages/cli` (sửa) | Local | `ikf funnel prices set\|ls`, `ikf billing reconcile`, `ikf billing outbox ls` |
| `infra` (sửa) | Terraform | Secret `paddle-client-token` (thêm), rate limit `/v1/checkout`, cho phép IP Paddle gọi webhook |

## 2. Dữ liệu (migration `003_billing.sql`)

```sql
funnel_prices (funnel_id FK, plan_key TEXT, paddle_price_id TEXT, paddle_discount_id TEXT NULL,
               kind TEXT CHECK (kind IN ('recurring','one_time')), updated_by, updated_at,
               PRIMARY KEY (funnel_id, plan_key))
customers     (id BIGSERIAL, paddle_customer_id TEXT UNIQUE, email TEXT, created_at)
checkouts     (id TEXT PK /* ULID */, paddle_transaction_id TEXT UNIQUE, funnel_id FK, v INT,
               plan_key TEXT, sid TEXT, attribution JSONB,
               status TEXT CHECK (status IN ('created','completed','abandoned')), created_at, completed_at)
transactions  (paddle_transaction_id TEXT PK, customer_id FK NULL, paddle_subscription_id TEXT NULL,
               checkout_id TEXT NULL, status TEXT, origin TEXT, amount_minor BIGINT, currency TEXT,
               billed_at TIMESTAMPTZ NULL, paddle_updated_at TIMESTAMPTZ)
subscriptions (paddle_subscription_id TEXT PK, customer_id FK, funnel_id FK NULL, plan_key TEXT NULL,
               status TEXT, current_period_end TIMESTAMPTZ NULL, canceled_at TIMESTAMPTZ NULL,
               scheduled_change JSONB NULL, paddle_updated_at TIMESTAMPTZ)
webhook_inbox (event_id TEXT PK, event_type TEXT, occurred_at TIMESTAMPTZ, received_at, processed_at NULL, attempts INT)
outbox        (id BIGSERIAL PK, topic TEXT, aggregate_id TEXT, payload JSONB, created_at, published_at NULL)
```

- Email chỉ nằm trong `customers` (Postgres). `checkouts` không lưu email.
- Tiền lưu bằng `amount_minor` cùng `currency`, đúng như Paddle trả về.
- `funnel_id NULL` trên `subscriptions` nghĩa là price chưa được map (log `unmapped_price`).

## 3. Luồng checkout

1. User bấm mua. Funnel phát `checkout_click {plan}` và không chuyển trang (với `checkoutUrl` rỗng, mặc định ở mọi funnel).
2. Khi có `__IKF.paddle` và không phải preview, SDK chạy Turnstile ở chế độ ẩn (sitekey `__IKF.turnstile`), rồi gọi `POST {__IKF.api}/v1/checkout` với body `{ funnel, v, plan, sid, email?, attribution, turnstile_token }`. `email` lấy từ `IkFunnel.checkoutEmail?.()` nếu hàm có và trả chuỗi.
3. Core:
   - kiểm tra Turnstile (Siteverify, secret `turnstile-secret`);
   - kiểm tra `funnel@v` tồn tại;
   - kiểm tra `plan` có trong `funnel_prices` (thiếu thì `422 plan_not_mapped`);
   - tạo `checkout_id` (ULID), rồi gọi Paddle `POST /transactions` với `items: [{price_id, quantity: 1}]`, `discount_id?`, `customer: {email}?`, `custom_data: {checkout_id, sid, funnel, v, plan}`;
   - ghi `checkouts`, trả `{checkout_id, transaction_id}`.
   - CORS chỉ cho phép origin là domain funnel đang active và preview host.
4. SDK nạp `https://cdn.paddle.com/paddle/v2/paddle.js` một lần, gọi `Paddle.Environment.set('sandbox')` nếu là sandbox, `Paddle.Initialize({ token: clientToken, eventCallback })`, rồi `Paddle.Checkout.open({ transactionId, settings: { displayMode: 'overlay', variant: 'one-page' } })`.
5. Event của Paddle:
   - `checkout.completed`: SDK gọi `IkFunnel.completePurchase(plan)` và phát `purchase_complete {plan, checkout_id}`.
   - `checkout.closed` khi chưa trả tiền: SDK phát `checkout_close`.
   - `checkout.error`: xem bước 6.
6. **Dự phòng cho webview.** Khi UA là in-app (FB/IG/TikTok) **và** Paddle.js tải lỗi hoặc có `checkout.error`, SDK hiện nút "Mở trong trình duyệt" trỏ tới `https://<host>/_ikf/pay?txn=<transaction_id>&ret=<url encode của funnel URL>`.
   - Worker trả một trang tối giản chạy Paddle.js với `transactionId` đó, trên cùng domain đã được Paddle duyệt.
   - `ret` chỉ được phép là URL cùng host.
   - Trả tiền xong, trang chuyển về `ret` kèm `?ikf_paid=<checkout_id>`.
7. Khi URL có `ikf_paid`, SDK gọi `GET /v1/checkout/<id>`, thử lại mỗi 2 giây trong tối đa 20 giây. Chỉ khi `status == 'completed'` mới gọi `completePurchase(plan)`. **Không tin `?paid=` hay `ikf_paid` trên URL nếu chưa xác nhận.**
8. Add-on mua một lần dùng đúng luồng trên với `plan = 'addon'`, map tới price `one_time`.
9. **Chặn email trên URL:** khi `__IKF.paddle` có giá trị, SDK chặn mọi lần funnel chuyển trang sang `checkoutUrl`.

`GET /v1/checkout/:id` trả `{checkout_id, status, plan}` và không trả email.

Rate limit Cloudflare: `/v1/checkout` tối đa 10 request mỗi phút mỗi IP (thêm vào ruleset hiện có).

## 4. Webhook và worker đồng bộ

**`POST /v1/paddle/webhook`:**
1. Đọc body thô, tối đa 1MB. Kiểm tra `Paddle-Signature: ts=<unix>;h1=<hex>`: HMAC-SHA256(`<ts>:<rawBody>`, `paddle-webhook-secret`), so sánh hằng thời gian, `|now − ts| ≤ 300s`. Sai thì `401`.
2. `INSERT INTO webhook_inbox … ON CONFLICT (event_id) DO NOTHING`. Đã có thì trả `200` ngay.
3. Gửi SQS `webhooks`: `{event_id, event_type, entity: 'subscription'|'transaction', entity_id}`. Event `adjustment.*` có entity là transaction gốc.
4. Trả `200`. Ghi DB hoặc gửi SQS lỗi thì trả `503`.

**Worker `billing-sync`:** long-poll SQS (`WaitTimeSeconds 20`, tối đa 10 message), visibility 60s. Với mỗi message:
1. Đọc lại từ Paddle: `GET /subscriptions/{id}` hoặc `GET /transactions/{id}`, và lấy thêm subscription nếu transaction có `subscription_id`.
2. Chạy một transaction Postgres:
   - khóa bằng `SELECT … FOR UPDATE`;
   - nếu `updated_at` của Paddle không lớn hơn `paddle_updated_at` thì bỏ qua;
   - upsert `customers`, `transactions`, `subscriptions`;
   - nếu `custom_data.checkout_id` có giá trị thì đặt `checkouts.status = 'completed'`;
   - so trạng thái cũ với mới để ghi outbox;
   - đặt `webhook_inbox.processed_at`, tăng `attempts`.
3. Thành công thì xóa message. Lỗi thì không xóa; message quay lại sau visibility timeout, quá 5 lần thì vào DLQ (đã có alarm).

**State machine và topic outbox:**

| Từ | Sang | Topic |
|---|---|---|
| (chưa có) | `trialing` / `active` | `subscription.activated` |
| `trialing` | `active` | `subscription.converted` |
| `active` | `past_due` | `subscription.past_due` |
| `past_due` | `active` | `subscription.recovered` |
| bất kỳ | `paused` | `subscription.paused` |
| bất kỳ | `canceled` | `subscription.canceled` |
| `scheduled_change.action` chuyển sang `cancel` | | `subscription.cancel_scheduled` |

| Transaction | Topic |
|---|---|
| chuyển sang `completed` | `payment.succeeded` `{paddle_transaction_id, amount_minor, currency, origin, checkout_id, sid, funnel, plan, customer_id, paddle_subscription_id}` |
| adjustment refund được duyệt | `payment.refunded` |
| adjustment chargeback | `payment.chargeback` |

Mỗi lần chuyển trạng thái ghi **đúng một** dòng outbox. Spec này chỉ ghi outbox, không đọc.

**Đối soát:** `ikf billing reconcile --since <duration>` gọi `GET /transactions?updated_at[GT]=…` (có phân trang), so với DB, và đẩy những transaction lệch hoặc thiếu vào SQS. Lệnh in ra số bản ghi lệch.

## 5. Map giá

- `PUT /v1/funnels/:slug/prices` (quyền `router`), body `{ plans: { "<plan_key>": { price_id, discount_id? } } }`. Core gọi Paddle `GET /prices/{id}` (price phải `active`; recurring hay one_time suy từ `billing_cycle`) và `GET /discounts/{id}` (phải `active`). Lỗi thì `422 invalid_price` hoặc `invalid_discount` kèm chi tiết.
- `GET /v1/funnels/:slug/prices`.
- CLI: `ikf funnel prices set <slug> 1w=pri_x[:dsc_y] addon=pri_z`, `ikf funnel prices ls <slug>`.
- `ikf publish` in cảnh báo cho các key trong `CONFIG.plans` chưa có map. Chỉ cảnh báo, không chặn.

## 6. Xử lý lỗi

| Tình huống | Xử lý |
|---|---|
| Turnstile lỗi, sau 1 lần thử lại | SDK hiện "Không xác minh được, thử lại". Core trả `403 turnstile_failed` |
| `/v1/checkout` trả `503` hoặc mất mạng | SDK thử lại 1 lần sau 1s, vẫn lỗi thì hiện thông báo kèm nút thử lại và phát `checkout_error {reason}` |
| `422 plan_not_mapped` | Phát `checkout_error`, funnel không bị kẹt |
| Paddle.js lỗi hoặc `checkout.error` trong webview | Nút "Mở trong trình duyệt" |
| `ikf_paid` chưa `completed` sau 20s | "Đang xác nhận thanh toán, vui lòng chờ". Không gọi `completePurchase` |
| Paddle API lỗi khi tạo transaction | Retry 2 lần, vẫn lỗi thì `503 paddle_unavailable` |
| Paddle API trả `401`/`403` | `503`, log `paddle_auth_failed`, alarm SNS (tối đa 1 lần mỗi 15 phút) |
| Webhook sai chữ ký hoặc `ts` quá hạn | `401`, log không kèm body |
| Worker gọi Paddle lỗi | Không xóa message, retry, cuối cùng vào DLQ |
| Price chưa được map | Vẫn lưu với `funnel_id NULL`, log `unmapped_price`, vẫn ghi outbox |
| Webhook bị mất | `ikf billing reconcile` |

Staging dùng **Paddle sandbox**, prod dùng live. Key tách riêng theo env trong Secrets Manager: `paddle-api-key`, `paddle-webhook-secret` (đã có từ plan infra) và `paddle-client-token` (thêm mới).

## 7. Kiểm thử

| Tầng | Nội dung | Công cụ |
|---|---|---|
| `packages/paddle` | Chữ ký: đúng, sai, quá hạn, sai định dạng; client: retry, timeout, map lỗi, sandbox/live | Vitest |
| Checkout | Turnstile; `422`; body gửi Paddle; không lưu email; CORS; `503` | Vitest + Postgres (Testcontainers) + Paddle giả |
| Webhook | `401`; event trùng; DB hoặc SQS lỗi trả `503` | Vitest + Postgres + SQS giả |
| Worker | Mỗi bước chuyển ghi đúng 1 outbox; sai thứ tự, trùng, muộn cho cùng trạng thái cuối; refund, chargeback; checkout completed; `unmapped_price` | Vitest + Postgres + Paddle giả theo kịch bản |
| Map giá + CLI + reconcile | Kiểm tra price/discount; `ls`; reconcile đẩy đúng phần lệch | Vitest |
| SDK | Bắt `checkout_click`; Turnstile rồi checkout rồi Paddle; `completePurchase` chỉ gọi sau `completed`; không chạy ở preview; chặn `checkoutNav`; xác nhận `ikf_paid` với core | Vitest + happy-dom |
| Worker `/_ikf/pay` | Chỉ cho `ret` cùng host; trang nạp Paddle với `txn` | vitest-pool-workers |
| E2E sandbox | 2 funnel thật: gói tuần, add-on, 3DS, refund; gửi lại webhook từ dashboard không đổi gì | Playwright + Paddle sandbox (chạy tay, cần Task 0) |
| Webview | FB/IG/TikTok: inline, hoặc nút "Mở trong trình duyệt" quay về đúng trạng thái | Thủ công trên staging |

## 8. Ngoài phạm vi

- Cấp quyền, claim app, magic link: spec `entitlement-identity`.
- Đọc outbox để gửi CAPI Purchase và Adjust S2S: spec `conversions-relay`.
- Trang tự hủy subscription: spec riêng, nhỏ, làm ngay sau billing.
- Giảm giá khi user định thoát, đổi gói, upsell bằng one-time charge trên subscription: P2.
- PSP dự phòng (Stripe): P3.
- Sửa 12 funnel đang gắn email lên URL, và thêm `IkFunnel.checkoutEmail()` vào funnel: việc của team nội dung (SDK đã chặn đường chuyển trang).

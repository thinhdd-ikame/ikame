# Entitlement + Identity — Design Spec

> Subsystem số 5 trong [master plan](../plans/2026-10-05-ikame-funnel-platform.md) §10. Xây trên [Billing (Paddle)](2026-10-09-billing-paddle-design.md), đọc `outbox` mà billing ghi. Repo `thinhdd-ikame/ikf-platform`, nhánh xếp chồng lên `feat/billing-paddle`.

**Mục tiêu:** người đã trả tiền trên web vào được app (web2app) hoặc web product (web2web) và có đúng quyền đã mua, kể cả khi đổi máy hay cài lại. Backend của app vẫn là nơi quyết định premium. iFunnel liên kết người mua với tài khoản app, rồi đẩy mọi thay đổi quyền (gia hạn, hủy, hoàn tiền) sang backend app qua webhook có chữ ký.

**Điều kiện xong:**
- Trên staging, ít nhất 98% người đã trả tiền vào được app (exit criteria của master plan).
- Chạy lại toàn bộ outbox không sinh webhook thừa.
- Có tài liệu tích hợp cho team backend app (`docs/integration/app-backend.md`), kèm test vector chữ ký.

## Quyết định đã chốt (2026-10-09)

| # | Hạng mục | Lựa chọn |
|---|---|---|
| 1 | Premium trong app | App có backend riêng với tài khoản user. Backend app quyết định premium, iFunnel giữ quyền của các giao dịch trên web |
| 2 | Liên kết | Server-to-server. App lấy claim token (Adjust deferred deep link) hoặc dùng OTP email, gửi cho backend app. Backend app gọi iFunnel bằng API key của app. iFunnel gửi webhook có chữ ký mỗi khi quyền đổi |
| 3 | Mô hình quyền | Quyền có tên theo từng plan: `funnel_prices.entitlement_key` (ví dụ `1w → premium`, `addon → tarot_2027`), theo app của funnel (`funnels.app_id`). Subscription có thời hạn, one-time thì vĩnh viễn trừ khi bị refund hay chargeback |
| 4 | Số tài khoản liên kết | Tối đa 3 `app_user_id` đang hoạt động cho mỗi người mua trong mỗi app; liên kết thứ 4 thay cho liên kết cũ nhất (gửi webhook `link.revoked`). Claim token dùng một lần, sống 7 ngày |
| 5 | Kiến trúc | Worker `entitlement-sync` đọc outbox, **tính lại toàn bộ quyền** của từng khách, rồi ghi `webhook_deliveries`. Worker `webhook-sender` gửi đi, có retry và alarm |

## 1. Thành phần

| Unit | Chạy ở | Trách nhiệm |
|---|---|---|
| `services/core-api` module `identity` | ECS | Claim token, OTP, redeem, liên kết, magic link, API cho backend app |
| `services/core-api` worker `entitlement-sync` | ECS (cùng process) | Đọc outbox, tính lại quyền, tạo delivery, quét các quyền hết hạn |
| `services/core-api` worker `webhook-sender` | ECS (cùng process) | Gửi webhook có chữ ký, retry, `dead` + alarm, gửi tuần tự theo user |
| `packages/sdk` (sửa) | Trình duyệt | Lấy `app_link` sau `checkout_complete`, gắn vào nút get-app; web2web chuyển sang `return_url?ikf_ml=` |
| `packages/cli` (sửa) | Local | `ikf app create\|ls\|rotate-key\|webhooks`, `ikf funnel set --app`, `ikf funnel prices set … plan=price[:discount][@key]`, `ikf customer show <email>` |
| `docs/integration/app-backend.md` | Repo | Hợp đồng cho backend app: endpoint, webhook, chữ ký, test vector, ví dụ |
| `infra` (sửa) | Terraform | Rate limit `/v1/otp/*`, `/v1/claims/*`; quyền SES; secret webhook theo app |

## 2. Dữ liệu (migration `004_entitlements.sql`)

```sql
apps               (id TEXT PK CHECK (id ~ '^[a-z0-9][a-z0-9-]{1,30}$'), name TEXT, kind TEXT CHECK (kind IN ('app','web')),
                    adjust_tracker_url TEXT NULL, deeplink_scheme TEXT NULL, return_url TEXT NULL,
                    webhook_url TEXT NULL, api_key_hash TEXT UNIQUE, prev_api_key_hash TEXT NULL,
                    prev_key_expires_at TIMESTAMPTZ NULL, created_at)
ALTER TABLE funnels       ADD COLUMN app_id TEXT NULL REFERENCES apps(id);
ALTER TABLE funnel_prices ADD COLUMN entitlement_key TEXT NOT NULL DEFAULT 'premium'
                          CHECK (entitlement_key ~ '^[a-z0-9_]{1,40}$');
entitlements       (customer_id, app_id, key, active BOOL, expires_at TIMESTAMPTZ NULL,
                    source TEXT CHECK (source IN ('subscription','one_time')), source_id TEXT, updated_at,
                    PRIMARY KEY (customer_id, app_id, key))
app_links          (id BIGSERIAL, customer_id, app_id, app_user_id TEXT, linked_at, revoked_at NULL,
                    UNIQUE (app_id, app_user_id))
claim_tokens       (token_hash TEXT PK, customer_id, app_id, checkout_id TEXT, expires_at, used_at NULL)
otp_codes          (id BIGSERIAL, email_hash TEXT, app_id, code_hash TEXT, expires_at, attempts INT, used_at NULL, created_at)
magic_links        (token_hash TEXT PK, customer_id, app_id, expires_at, used_at NULL)
webhook_deliveries (id BIGSERIAL, event_id TEXT UNIQUE /* ULID */, app_id, app_user_id TEXT, type TEXT,
                    payload JSONB, status TEXT CHECK (status IN ('pending','delivered','dead')),
                    attempts INT, next_attempt_at, last_error TEXT NULL, created_at, delivered_at NULL)
```

- Token, OTP, API key và magic link chỉ lưu `sha256`. Bản gốc chỉ xuất hiện một lần, lúc tạo.
- `email_hash = sha256(lowercase(trim(email)))`. Email gốc chỉ nằm ở `customers.email`.
- Webhook secret của mỗi app nằm trong Secrets Manager tại `ikf/<env>/app-webhook/<app_id>`, vì phải đọc được bản gốc để ký. Core đọc secret này khi gửi và cache 10 phút.
- API key của app có dạng `ikfa_<43 base64url>`.

## 3. Luồng claim

**Trên web, sau khi trả tiền:**
1. `entitlement-sync` xử lý `payment.succeeded` có `checkout_id`. Nếu funnel có `app_id` và app có kiểu `app`, nó tạo một claim token (32 byte, sống 7 ngày, dùng một lần), rồi gửi email cho người mua (SES, gửi từ `no-reply@mail.<zone>`). Email có link app và hướng dẫn khôi phục bằng email.
2. SDK, sau `checkout_complete`, gọi `GET /v1/checkout/:id/claim` (không cần token; id là ULID khó đoán), thử lại mỗi 2 giây trong tối đa 20 giây. Kết quả:
   - `{ app_link }` với `app_link = <adjust_tracker_url>?deep_link=<url-encoded "<scheme>://claim?t=<token>">`;
   - hoặc `{ return_url }` với web2web (xem bước 4);
   - hoặc `202 pending`.
3. SDK gắn `app_link` vào các nút get-app. Thứ tự ưu tiên: `IkFunnel.appLink(url)` nếu funnel có hàm này; nếu không thì mọi phần tử có `data-ikf="get-app"`; nếu không có nữa thì gắn vào `IkFunnel.config.appUrl`.
4. **Web2web** (app kiểu `web`): API trả `return_url?ikf_ml=<magic_token>` (sống 15 phút, dùng một lần), và SDK chuyển trang sang đó.

**Từ backend app tới iFunnel** (header `Authorization: Bearer <app_api_key>`, base `https://api.<zone>`):

| Endpoint | Body | Trả về |
|---|---|---|
| `POST /v1/claims/redeem` | `{ token, app_user_id }` | `{ customer_ref, entitlements: [{key, active, expires_at}] }` |
| `POST /v1/otp/send` | `{ email }` | `200 {}` luôn luôn |
| `POST /v1/otp/verify` | `{ email, code, app_user_id }` | giống redeem |
| `POST /v1/magic/redeem` | `{ token, app_user_id }` | giống redeem |
| `GET /v1/users/:app_user_id/entitlements` | — | `{ entitlements }` (rỗng nếu chưa liên kết) |

- **OTP:** 6 chữ số, sống 10 phút, sai tối đa 5 lần mỗi mã, gửi tối đa 3 mã mỗi giờ cho mỗi `(email_hash, app)`. Chỉ thực sự gửi email khi email đó có `customers` với ít nhất một quyền trong app này.
- **Liên kết** (dùng chung cho redeem, verify và magic):
  - nếu `(app_id, app_user_id)` đã liên kết với **chính khách này**: không làm gì, trả quyền hiện tại;
  - nếu đã liên kết với **khách khác**: `409 app_user_linked_elsewhere`;
  - nếu khách đã có 3 liên kết đang hoạt động trong app: thu hồi liên kết cũ nhất và tạo delivery `link.revoked` cho `app_user_id` đó;
  - tạo liên kết mới và delivery `link.created`.
- `customer_ref` là một id ổn định, không lộ thông tin (`cus_<ULID>` gán cho mỗi khách), để backend app lưu và CS tra cứu.

## 4. Tính quyền

**`entitlement-sync`** chạy mỗi 2 giây: lấy tối đa 100 dòng `outbox` có `published_at IS NULL` theo `id`, dùng `FOR UPDATE SKIP LOCKED`, rồi gom theo khách. Với mỗi khách, trong một transaction:
1. Tính `desired = computeEntitlements(customer)` từ `subscriptions`, `transactions`, `funnel_prices` (qua `checkout` hoặc `price_id` để biết `entitlement_key`) và `funnels.app_id`:
   - **subscription** cho quyền `(app, key)`:
     - `active`, `trialing`: active, `expires_at = current_period_end + 3 ngày`;
     - `past_due`: active nếu `now < current_period_end + 3 ngày`;
     - `canceled`: active nếu `now < current_period_end`;
     - `paused`: không active.
   - **one-time:** active nếu transaction `completed` và không có adjustment refund hay chargeback đã duyệt; `expires_at = NULL`.
   - Nhiều nguồn cho cùng `(app, key)`: active nếu có ít nhất một nguồn active; `expires_at` lấy giá trị xa nhất, `NULL` nghĩa là vĩnh viễn.
2. So với bảng `entitlements`. Với mỗi app có thay đổi, ghi lại bảng và tạo **một** delivery `entitlement.updated` cho mỗi `app_link` đang hoạt động của khách trong app đó, payload chứa **toàn bộ** quyền của app.
3. Đặt `published_at = now()` cho các dòng outbox đã xử lý.
4. `payment.succeeded` có `checkout_id` thì tạo thêm claim token và email (§3), chỉ một lần cho mỗi checkout (`claim_tokens.checkout_id` unique khi khác null).

**Lượt quét hết hạn** chạy mỗi 5 phút: chọn các khách có `entitlements.active = true AND expires_at < now()`, rồi chạy lại bước 1–2 cho họ.

`computeEntitlements` là hàm thuần (nhận dữ liệu, trả về danh sách quyền), có test bảng riêng.

## 5. Webhook sang backend app

```
POST <apps.webhook_url>
Content-Type: application/json
Ikf-Event-Id: <ulid>
Ikf-Signature: t=<unix>,v1=<hex HMAC-SHA256("<t>.<rawBody>", webhook_secret)>

{ "id": "<ulid>", "type": "entitlement.updated" | "link.created" | "link.revoked",
  "created_at": "<iso>", "app_id": "starlyn", "app_user_id": "...", "customer_ref": "cus_…",
  "entitlements": [ { "key": "premium", "active": true, "expires_at": "<iso>|null" } ] }
```

- Mỗi payload có **toàn bộ** quyền hiện tại của user trong app. Backend app ghi đè, không phải gộp phần chênh lệch. `link.revoked` gửi `entitlements: []`.
- **`webhook-sender`:**
  - mỗi giây lấy delivery `pending` có `next_attempt_at <= now()` theo `id`, dùng `SKIP LOCKED`;
  - chỉ lấy delivery **cũ nhất còn pending** của mỗi `(app_id, app_user_id)`, nên các delivery của một user đi đúng thứ tự;
  - POST với timeout 10 giây.
- Nhận 2xx thì `delivered`. Lỗi thì `attempts + 1`, `next_attempt_at` theo lịch `[1m, 5m, 30m, 2h, 6h, 12h, 24h]`; hết lịch thì `dead`, kèm alarm SNS (tối đa 1 lần mỗi 15 phút cho mỗi app, throttle qua Redis như billing).
- Delivery `dead` không chặn các delivery sau của user đó.
- `ikf app webhooks <app> [--dead] [--resend <event_id>]`: resend đặt lại `status = pending`, `next_attempt_at = now()`.
- Tài liệu tích hợp có test vector: một secret, một `t`, một body và chữ ký mong đợi.

## 6. Quản trị (CLI và API, quyền `admin` hoặc `router`)

- `POST /v1/apps` `{id, name, kind, adjust_tracker_url?, deeplink_scheme?, return_url?, webhook_url}` → trả **API key và webhook secret một lần duy nhất**. Webhook secret được ghi vào Secrets Manager.
- `POST /v1/apps/:id/rotate-key`: key mới; key cũ dùng tiếp 24 giờ rồi hết hiệu lực.
- `PUT /v1/funnels/:slug` nhận thêm `app_id`; `PUT /v1/funnels/:slug/prices` nhận thêm `entitlement_key` cho mỗi plan (mặc định `premium`).
- `GET /v1/customers?email=` (quyền `admin`): khách, quyền, liên kết, delivery gần đây (cho CS).
- CLI: `ikf app create|ls|rotate-key|webhooks`, `ikf funnel set <slug> --app <id>`, `ikf funnel prices set <slug> 1w=pri_x@premium addon=pri_y@tarot_2027`, `ikf customer show <email>`.

## 7. Xử lý lỗi

| Tình huống | Xử lý |
|---|---|
| Claim token hết hạn / đã dùng / không có | `410 claim_expired` / `409 claim_used` / `404 claim_not_found` |
| Token thuộc app khác | `404 claim_not_found` |
| OTP sai / bị khóa | `401 otp_invalid` / `429 otp_locked` |
| Email không có giao dịch | `200`, không gửi email |
| API key sai hoặc hết hạn | `401` |
| `app_user_id` đã gắn với khách khác | `409 app_user_linked_elsewhere` |
| Redeem trước khi webhook Paddle xử lý xong | Redeem thành công, quyền có thể rỗng; webhook `entitlement.updated` đến sau |
| Backend app ngừng | Retry tới 24 giờ, rồi `dead` + alarm, resend bằng CLI; backend app có thể gọi `GET /entitlements` để đồng bộ |
| Worker chết giữa chừng | Outbox chưa có `published_at` được lấy lại; tính lại toàn bộ nên idempotent |
| Refund hoặc chargeback | Quyền tắt và có webhook ngay |
| SES lỗi | Retry 3 lần, rồi log + alarm; link claim vẫn hiện trên web |

**Bảo mật:**
- So sánh hằng thời gian cho token, mã và chữ ký.
- Rate limit Cloudflare cho `/v1/otp/*` và `/v1/claims/*`.
- Log không có email, chỉ `email_hash`.
- Link claim không chứa email.

## 8. Kiểm thử

| Tầng | Nội dung | Công cụ |
|---|---|---|
| `computeEntitlements` | Bảng kịch bản subscription (mọi trạng thái, ân hạn, canceled còn và hết kỳ, paused), one-time (mua, refund, chargeback), nhiều nguồn, nhiều app | Vitest |
| `entitlement-sync` | Outbox → quyền + delivery; chạy lại và trùng outbox không sinh delivery thừa; quét hết hạn; claim token + email chỉ một lần cho mỗi checkout; crash rồi chạy lại vẫn đúng | Vitest + Postgres (Testcontainers) + SES giả |
| Claim, OTP, magic | Dùng một lần, hết hạn, sai app; OTP sai 5 lần, giới hạn gửi; email lạ trả `200`; giới hạn 3 liên kết kèm `link.revoked`; redeem lại là idempotent; `409 app_user_linked_elsewhere` | Vitest + Postgres |
| `webhook-sender` | Chữ ký khớp test vector; lịch retry; `dead` + alarm; thứ tự theo user; resend | Vitest + server HTTP giả |
| SDK | Lấy `app_link`, gắn vào nút get-app theo thứ tự ưu tiên; web2web chuyển sang `return_url?ikf_ml=` | Vitest + happy-dom |
| CLI + admin API | `app create` (trả key một lần), `rotate-key` (key cũ còn 24 giờ), `webhooks`, `customer show`, `funnel set --app`, `prices … @key` | Vitest |
| Demo local | Backend app giả trong `npm run demo`: mua bằng Paddle giả, claim, webhook đến | Chạy tay |
| Staging | App pilot thật: mua trên web → cài app → mở → có premium; máy thứ hai khôi phục bằng email | Thủ công (cần Task 0 + team mobile) |

## 9. Ngoài phạm vi

- App SDK phía mobile (đọc deep link Adjust, gọi backend app): việc của team mobile, theo `docs/integration/app-backend.md`.
- Gộp với in-app purchase của App Store / Google Play.
- SSO giữa nhiều sản phẩm.
- Trang hủy subscription: spec tiếp theo.
- Gửi CAPI / Adjust S2S từ outbox: spec `conversions-relay` (spec này chỉ đánh dấu `published_at` cho phần entitlement; conversions-relay sẽ có con trỏ riêng).

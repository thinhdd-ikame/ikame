# Admin Console đợt 2 (Billing + Identity) — Design Spec

> Nối tiếp đợt 1 (`2026-10-11-admin-console-p1-design.md`, code PR #6 `feat/admin-console-p1`). Đưa giá/plan, app registry + webhook, khách hàng, reconcile lên console; thêm role `support`; thêm quyền cấp thủ công và cấp lại `user_id`. Code trong repo `ikf-platform`, nhánh mới cắt từ `feat/admin-console-p1`.

**Mục tiêu:** ops đặt giá Paddle cho từng plan của funnel không cần CLI; dev đăng ký/sửa app, xoay key, xem và gửi lại webhook; CS tra khách theo email / `cus_…` / checkout id, xem quyền và lịch sử, gửi lại email link app; admin cấp/thu hồi quyền thủ công, cấp lại `user_id` bị lộ, chạy reconcile. Mọi thao tác có audit; không email khách, không `user_id` trong log, audit hay response console.

**Điều kiện xong:**
- Trên demo (`npm run demo`): admin map giá từ catalog Paddle giả → mua bằng Paddle giả → support tra khách theo email thấy checkout, subscription, quyền → admin cấp quyền thủ công, app giả hiện key mới → thu hồi → gửi lại email thấy trong hộp thư → cấp lại `user_id`, app giả FREE cho đến khi mở link mới. e2e Playwright chạy đúng luồng này.
- `support` không vào được Funnels upload, Giá, Apps sửa, Users; `editor` không thấy màn Khách hàng. Toàn bộ test cũ pass.

## Quyết định (2026-10-11)

| # | Hạng mục | Lựa chọn |
|---|---|---|
| 1 | Người dùng | Ops (giá), dev (app/webhook), CS (khách) ngang nhau |
| 2 | Chọn giá | Dropdown từ **catalog Paddle** (core-api proxy `listPrices`), vẫn cho dán `pri_…` |
| 3 | Màn khách | Tra cứu + xem; **gửi lại email**; **cấp lại `user_id`** (admin); **cấp/gia hạn quyền thủ công** (admin) |
| 4 | Quyền | Thêm role **`support`**; chuyển `can()` của SPA từ thang sang bảng grants |
| 5 | App/webhook/billing | Đủ như CLI: tạo/sửa app, xoay key, webhook list + gửi lại, reconcile, outbox. Không DLQ Cloudflare |
| 6 | Kiến trúc | Mở rộng core-api có chủ đích (bảng `manual_grants`, `versions.plan_keys`, catalog proxy, report v2); SPA chỉ gọi API |

## 1. Role và dữ liệu

### Role
- `USER_ROLES = ['viewer','support','editor','admin']`. Migration `006_admin_p2.sql` nới `admin_users_role_check`.
- Grants (core `USER_GRANTS`, SPA `GRANTS` cùng bảng):

| Role | Grants |
|---|---|
| viewer | `viewer` |
| support | `viewer`, `support` |
| editor | `viewer`, `editor`, `publisher`, `prices:read`, `apps:read` |
| admin | tất cả (`viewer, support, editor, publisher, prices:read, apps:read, router, admin`) |

- Token `ikf_` giữ nguyên nghĩa; token `router`/`admin` thoả `prices:read`, `apps:read`; token `publisher` thoả `prices:read`.
- SPA: `can(role, need)` tra bảng grants (không còn `RANK`); `RoleButton` giữ API; nav ẩn mục theo grants.
- Self-lockout (đợt 1) giữ: admin không tự hạ role/khoá.

### `manual_grants` (mới)
```
id BIGSERIAL PK, customer_id → customers, app_id → apps, key TEXT (ENTITLEMENT_KEY_RE),
expires_at TIMESTAMPTZ NULL, reason TEXT NOT NULL (1..200), granted_by TEXT NOT NULL,
created_at, revoked_at NULL, revoked_by NULL; index (customer_id) WHERE revoked_at IS NULL
```
- `computeEntitlements({subscriptions, oneTimes, manual, now})` nhận input thứ ba `manual: [{id, app_id, key, expires_at}]`: `active = expires_at IS NULL OR expires_at > now`, `source='manual'`, `source_id = id`. Luật chọn nguồn `better()` không đổi.
- `entitlements.source` CHECK thêm `'manual'`.
- `loadSources` nạp grant `revoked_at IS NULL`. Grant hết hạn vẫn nạp (inactive) để `sweepExpired` tắt đúng và không bị tắt sớm.
- Thu hồi = `revoked_at`, không xoá; recompute ngay sau đó.

### `versions.plan_keys TEXT[]` (mới, NULL cho bản cũ)
- `planKeysFromHtml(html)` chuyển từ `packages/cli/src/plans.js` sang `@ikf/funnel-lint` (export thêm, không dependency); CLI import lại từ đó. Server trích khi upload (sau lint, trước validate).
- `GET /v1/funnels/:slug/prices` trả `plan_keys` của bản **mới nhất** có `plan_keys`, và `unmapped` = plan trong HTML chưa có giá.

### `customers.user_id_rotated_at TIMESTAMPTZ NULL` (mới)
- Cấp lại: `UPDATE customers SET user_id = gen_random_uuid(), user_id_rotated_at = now()`. Không tombstone UUID cũ. Audit chỉ ghi `customer_ref`.
- Hệ quả (ghi vào dialog + runbook): mọi app đã cài mất pro cho tới khi mở link mới từ email gửi lại; claim page (60 phút sau mua) vẫn trả link mới.

### Audit mới
`app.update {id, fields}`, `webhook.resend {app_id, event_id}`, `customer.resend_email {customer_ref, checkout_id}`, `customer.rotate_user_id {customer_ref}`, `entitlement.grant {customer_ref, app_id, key, expires_at, grant_id}`, `entitlement.revoke {customer_ref, grant_id}`, `billing.reconcile {since_seconds, enqueued}`. Target `customer:<customer_ref>`, `app:<id>`, `billing`. Ghi trong transaction của thay đổi; reconcile ghi sau khi xong.

## 2. API (core-api)

Mọi route theo cơ chế đợt 1 (cookie + CSRF hoặc token). Response có PII → `cache-control: no-store`. Log chỉ `customer_ref` + code.

| Route | Role | Hành vi |
|---|---|---|
| `GET /v1/paddle/prices` | `prices:read` | `@ikf/paddle` thêm `listPrices({status, include})` (dùng `pages()`); core cache in-process 60 s; trả `{prices:[{id, name, product_name, amount_minor, currency, interval: {unit, frequency}|null, status}]}`; lỗi Paddle → `503 paddle_unavailable` |
| `GET /v1/funnels/:slug/prices` | `prices:read` | Như cũ + `plan_keys`, `unmapped` |
| `PUT /v1/funnels/:slug/prices` | admin | Không đổi |
| `PUT /v1/apps/:id` | admin | Body ⊆ `{name, webhook_url, adjust_tracker_url, deeplink_scheme, return_url, deeplink_path, bundle_ids}` (≥ 1 field, `additionalProperties:false`); không đổi `kind`/`handoff`; validate như `checkApp`; `404 app_not_found`; audit trong tx |
| `GET /v1/apps/:id/webhooks` | `apps:read` | Thêm `before` (id cursor) → `{items, next_before, counts:{pending, delivered, dead}}` |
| `POST /v1/apps/:id/webhooks/:event_id/resend` | admin | Như cũ + audit |
| `POST /v1/customers/lookup` | `support` | Body đúng **một** trong `{email}`, `{customer_ref}` (`cus_…`), `{checkout_id}`; trả `{customers:[report]}`. Report: `customer_ref, created_at, user_id_rotated_at, checkouts[{id, funnel, v, plan_key, status, created_at, completed_at, amount_minor, currency}], subscriptions[{id, funnel, plan_key, status, current_period_end, canceled_at}], entitlements[{app_id, key, active, expires_at, source, source_id}], manual_grants[{id, app_id, key, expires_at, reason, granted_by, created_at, revoked_at}], links[…], deliveries (20 mới nhất), claim {checkout_id, emailed_at, email_attempts, expires_at}|null`. **Không có `user_id`, không có email** trong body (email là input) |
| `POST /v1/customers/:ref/resend-email` | `support` | Chọn `claim_tokens` của checkout mới nhất của khách (app kind `app`); `UPDATE … SET emailed_at=NULL, email_attempts=0, next_email_at=now(), expires_at=GREATEST(expires_at, now()+7d)`; `404 no_claim` nếu không có; `409 no_email` nếu khách không có email; trả `{queued:true, checkout_id}`; audit |
| `POST /v1/customers/:ref/rotate-user-id` | admin | Trong tx: update `user_id` + `user_id_rotated_at`, audit; sau commit gọi logic resend-email (bỏ qua `404 no_claim`); trả `{rotated_at, email_queued}` |
| `POST /v1/customers/:ref/grants` | admin | `{app_id, key, expires_at|null, reason}`; `400 invalid_grant {field}` (app không tồn tại, key sai, hạn trong quá khứ); trong tx: insert + audit + `lockCustomer` + `recompute` (webhook bắn như thường); trả `{grant, entitlements}` |
| `DELETE /v1/customers/:ref/grants/:id` | admin | `revoked_at/revoked_by` + audit + recompute; `404 grant_not_found`; `409 already_revoked` |
| `POST /v1/billing/reconcile` | admin | Như cũ + audit sau khi xong |
| `GET /v1/billing/outbox` | admin | Không đổi |

- `:ref` khớp `^cus_[0-9A-HJKMNP-TV-Z]{26}$`; khách không tồn tại → `404 customer_not_found`.
- Rate limit Cloudflare (`ratelimit_full`): thêm `/v1/customers/*`, `/v1/paddle/*` vào nhóm identity.
- CLI: `ikf admin add --role support`; `ikf customer show <email|cus_…>`; `ikf customer grant <ref> --app <id> --key <k> [--expires <ISO>] --reason <text>`; `ikf customer revoke <ref> <grant_id>`; `ikf customer resend-email <ref>`; `ikf customer rotate-user-id <ref> --yes`; `ikf app update <id> [--name …] [--webhook …] …`.

## 3. Màn hình (SPA `apps/admin`)

Stack đợt 1 (React, react-router, một CSS, `RoleButton`, `ErrorNote`, fake client trong test).

- **Funnel detail → tab Giá** (`prices:read` xem, admin sửa): bảng = hợp `plan_keys` ∪ `funnel_prices`. Cột: plan · Paddle price (dropdown từ `/v1/paddle/prices` hiện `tên — số tiền/chu kỳ`, ô lọc, cho dán `pri_…`) · discount · entitlement key (mặc định `premium`) · gỡ. Badge **Chưa có giá** (plan trong HTML chưa map) và **Không dùng** (giá map cho plan không còn). Lưu = một `PUT`; lỗi `422` hiện theo dòng. Không có `plan_keys` (bản cũ) → bảng chỉ từ `funnel_prices` + dòng "Upload lại để đọc plan".
- **Apps** (`/apps`, `apps:read`; admin ghi): danh sách (id, kind, handoff, webhook_url, `prev_key_expires_at`). **Tạo app**: form theo kind; sau tạo hộp **một lần** `api_key` + `webhook_secret` ("chép ngay, không hiện lại"). **Chi tiết**: sửa (`PUT`), **Xoay key** (dialog: key cũ sống 24 h, tick `force`), tab **Webhooks**: counts, lọc status, **Gửi lại** (admin), Tải thêm.
- **Khách hàng** (`/customers`, `support`): ô tìm (email / `cus_…` / checkout id, tự nhận dạng). Nhiều kết quả → danh sách. Chi tiết: tóm tắt (ref, created, `user_id` đã xoay lúc), **Quyền** (nguồn `manual` có nhãn + lý do + nút Thu hồi admin), **Mua hàng** (checkout, subscription), **Link app**, **Webhook** (20), **Email link app** (gửi lúc, số lần, nút **Gửi lại** support+). Khối **Hành động admin**: **Cấp quyền** (dialog app/key/hạn/lý do), **Cấp lại user_id** (dialog cảnh báo). Link "Xem audit" → `/audit?target=customer:<ref>`. Không hiển thị `user_id`.
- **Billing** (`/billing`, admin): **Reconcile** chọn 24 h / 7 d / 30 d → counts; **Outbox** lọc topic, cursor.
- **Users**: dropdown thêm `support` kèm mô tả role.
- Nav: Funnels · Apps · Khách hàng · Domains · Billing · Audit · Settings; ẩn theo grants; route bị chặn hiện "Cần quyền …".

## 4. Worker, demo, hạ tầng, kiểm thử

- **entitlement-sync**: `loadSources` nạp `manual_grants`; `sweepExpired` tự xử lý grant có hạn; không worker mới. Vòng "tắt nguồn không còn" giữ nguyên vì manual nằm trong `desired`.
- **Email**: tái dùng vòng `sendClaimEmails` (retry/backoff/alarm sẵn có); không gửi trực tiếp trong request.
- **Paddle**: `listPrices` thêm vào `@ikf/paddle` và Paddle giả (`demo/lib/paddle-fake.mjs`, 3 giá mẫu: `1w`, `addon`, một giá `archived`).
- **Demo**: seed `support@ikameglobal.com` (support); `--admin-user` vẫn admin. e2e mới `demo/test/admin-p2-e2e.test.mjs` theo luồng ở "Điều kiện xong" (cổng riêng như e2e đợt 1, DB `ikf_admin_test`).
- **Hạ tầng**: không secret mới; rate limit thêm 2 đường dẫn (Terraform test); runbook `admin-console.md` thêm mục "Hỗ trợ khách" (resend, rotate, grant) + "Role support".
- **Kiểm thử**: migration 006; `computeEntitlements` với manual (ưu tiên vs subscription, hạn, revoke); recompute giữ/tắt grant đúng, bắn `entitlement.updated`; lookup 3 kiểu, body không chứa `user_id`/email; resend reset cột + worker gửi (mailer giả) + 404/409; rotate → `check-purchased` false với UUID cũ, true với mới, email queued; bảng quyền 4 role × route mới; `listPrices` phân trang + cache 60 s + 503; `plan_keys` trích lúc upload + `unmapped`; `PUT /v1/apps/:id` validate/audit; SPA từng màn với fake client; CLI lệnh mới; e2e; log/audit không email, không `user_id`.

## 5. Ngoài phạm vi
Xoá app; xoay webhook secret; DLQ Cloudflare; refund/cancel từ console (làm trên Paddle); reconcile async/tiến độ; tra theo Paddle transaction id; dashboard ClickHouse (đợt 3); nhiều workspace; tombstone `user_id` cũ.

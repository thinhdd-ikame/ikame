# Web Funnel SDK Compat — Design Spec

> Mở rộng spec Entitlement + Identity (`2026-10-09-entitlement-identity-design.md`, code trên `feat/entitlement-identity`, PR #4) để khớp với cách **IKameSDK** (iOS 1.6.3, KMP module `:billing`) kiểm tra người mua trên web funnel. Không thay thế thiết kế claim token / webhook / OTP; thêm một đường bàn giao thứ hai và một endpoint public cho SDK.

**Mục tiêu:** app mobile đang dùng IKameSDK nhận được trạng thái pro sau khi người dùng trả tiền trên funnel của iFunnel **mà không sửa code app**, chỉ đổi `baseUrl` của web funnel sang API iFunnel.

**Điều kiện xong:**
- Sau thanh toán, nút get-app của funnel mở link Adjust có `deep_link=<scheme>://open?user_id=<uuid>`; email sau thanh toán chứa cùng link đó.
- `POST /v1/payment/check-purchased-web-funnel` trả lời đúng format SDK đọc (theo swagger `api-slt-aio`), `is_pro` đúng với bảng `entitlements`, và tắt sau refund / hết hạn như spec entitlement.
- App `handoff = claim` (mô hình cũ) chạy y như trước; toàn bộ test cũ pass.

## Bối cảnh: SDK làm gì (tài liệu developers.begamob.com, đọc 2026-10-10)

- Định danh người mua là **`user_id`** trong Adjust deeplink (direct scheme, universal link, deferred). Tên param bắt buộc `user_id`. SDK bỏ qua placeholder chưa điền (`user_id={email}`) và lấy giá trị hợp lệ cuối cùng.
- Mode **NOT_AUTH** (khuyến nghị cho app): SDK tự gọi `POST {baseUrl}/payment/check-purchased-web-funnel`, nhận `is_pro` + `expires_at`, gộp vào trạng thái billing (`isAnyProductPurchased()`, product id sentinel `ik_web_funnel`). Lỗi mạng/parse → SDK giữ cache cũ, không hạ pro.
- Mode **AUTH**: backend của app tự trả `Bool` cho SDK qua `IKWebFunnelClient`, endpoint gợi ý `/api/v1/payment/get-web-funnel-purchased`.
- SDK check khi có `user_id` mới và mỗi lần mở app (áp cache trước, check nền sau). `user_id` + trạng thái lưu local.

Mô hình này là **pull theo `user_id` vĩnh viễn**; thiết kế entitlement hiện tại là **push** (claim token một lần, webhook, OTP). Hai bên không nói chuyện được với nhau nếu không có lớp này.

## Quyết định (2026-10-10)

| # | Hạng mục | Lựa chọn |
|---|---|---|
| 1 | Ai trả lời SDK | **iFunnel trả lời trực tiếp.** App đặt `baseUrl = https://api.<zone>/v1`. Không đi qua `api-slt-aio.begamob.com` |
| 2 | `user_id` | **UUID v4 do iFunnel cấp cho mỗi khách** (`customers.user_id`), không bao giờ là email |
| 3 | Mô hình cũ | Giữ nguyên (claim token, webhook, OTP) cho app mode AUTH có backend riêng; chọn theo `apps.handoff` |
| 4 | Format request/response | **Lấy từ swagger `api-slt-aio`** (user gửi sau). Mọi tên field trong spec này là tạm và được đánh dấu *(swagger)* |

## 1. Dữ liệu

- `customers.user_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE` — thêm vào migration `004_entitlements.sql` (chưa release). Chỉ thêm cột; code billing tạo khách không đổi (E16). Index unique có sẵn phục vụ tra cứu của endpoint.
- `apps.handoff TEXT NOT NULL DEFAULT 'user_id' CHECK (handoff IN ('user_id','claim'))`. Chỉ có nghĩa với `kind = 'app'`; app `web` bỏ qua.
- `apps.deeplink_path TEXT NOT NULL DEFAULT 'open'` (`^[a-z0-9_-]{1,32}$`): phần sau `scheme://` trong deep link. SDK không quan tâm path, nhưng mỗi app có thể đã đăng ký route riêng.
- `user_id` là **bí mật kiểu token**: ai có nó là có pro, vĩnh viễn. Không log nguyên văn (log `sha256(user_id)`), không đưa vào event ClickHouse, không đưa vào payload webhook, chỉ đi qua https. Không có cơ chế thu hồi riêng trong phạm vi này (xem §6).

## 2. Bàn giao sang app (`handoff = user_id`)

- `GET /v1/checkout/:id/claim` (SDK web poll sau `checkout_complete`): với app `handoff = user_id`, khi transaction của checkout đã `completed` → `200 {app_link}` với
  `app_link = <adjust_tracker_url>?deep_link=<urlencode("<scheme>://<deeplink_path>?user_id=<uuid>")>` (giữ query sẵn có của tracker). Không tạo `claim_tokens`. Cửa sổ 1 giờ sau `completed_at` và `404` ngoài cửa sổ giữ như hiện tại (E-fix F3), vì `checkout_id` có trong log/ClickHouse.
- Email sau thanh toán (`sendClaimEmails`): nội dung như email claim hiện tại nhưng link là `app_link` ở trên. Đây là đường **khôi phục** khi đổi máy / cài lại: mở link trong email → app nhận lại `user_id`. Để tái dùng cơ chế gửi/retry sẵn có, worker vẫn tạo một dòng `claim_tokens` cho checkout (cột `token_hash` giữ hash của một token ngẫu nhiên không dùng tới), dòng này chỉ đóng vai trò "đã gửi email chưa". `POST /v1/claims/redeem` với app `handoff = user_id` → `404 claim_not_found`.
- `entitlement-sync` không tạo `webhook_deliveries` cho app `handoff = user_id` (không có `app_links`). `link.revoked`, giới hạn 3 link, OTP: không áp dụng cho app này. `POST /v1/otp/send` cho app này vẫn trả `200 {}` và không làm gì; `verify` → `401 otp_invalid`.

## 3. Endpoint cho SDK (mode NOT_AUTH)

`POST /v1/payment/check-purchased-web-funnel` — public, không auth, không CORS (SDK gọi từ native, không phải trình duyệt), `cache-control: no-store`.

| Phần | Giá trị | Nguồn |
|---|---|---|
| Body | `{ user_id }` + các field SDK gửi kèm (app/bundle id, platform, …) | *(swagger)* |
| Response 200 | `{ is_pro: bool, expires_at: ISO-8601 \| null }` | *(swagger: tên field, kiểu `expires_at`, giá trị khi vĩnh viễn)* |
| `user_id` sai định dạng / không tồn tại | `200 { is_pro: false, expires_at: null }` | Không trả 4xx: SDK coi lỗi là "giữ cache", trả 4xx sẽ giữ pro cũ mãi |
| Phạm vi app | Nếu body có định danh app → chỉ quyền của app đó (map qua cột mới `apps.bundle_ids TEXT[]`, *(swagger)*); nếu không → mọi quyền của khách | *(swagger)* |
| `is_pro` | có ≥ 1 dòng `entitlements` của khách với `active = true` (sau khi lọc app) | — |
| `expires_at` | hạn xa nhất trong các quyền active; quyền vĩnh viễn → `null` *(swagger có thể yêu cầu mốc xa)* | — |
| Lỗi DB | `503 { error: 'unavailable' }` | SDK giữ cache |

- Rate limit Cloudflare (prod, `ratelimit_full`): thêm đường dẫn này vào nhóm identity (50/10s/IP). SDK check mỗi lần mở app, một IP NAT có nhiều user → không đặt thấp hơn.
- Log: `check_purchased {user_hash, is_pro, app_id?}` — không có `user_id` nguyên văn.
- Endpoint này đọc `entitlements` đã tính sẵn, không tính lại; độ trễ sau thanh toán = chu kỳ `entitlement-sync` (2 s).

## 4. Mode AUTH (backend app tự trả Bool)

`GET /v1/web-funnel/users/:user_id/entitlements` — Bearer API key `ikfa_` của app → `200 { customer_ref, entitlements: [{key, active, expires_at}] }` chỉ của app đó; `user_id` lạ → `200 { customer_ref: null, entitlements: [] }`. Backend app tự quyết `Bool` trả cho SDK. Không cần `app_links`.

## 5. CLI, tài liệu, hạ tầng

- `ikf app create … --handoff user_id|claim [--deeplink-path open]`; `ikf app ls` hiện `handoff`.
- `ikf customer show <email>` hiện `user_id` (admin, cần để hỗ trợ khách).
- `docs/integration/app-backend.md`: thêm mục đầu tiên **"App dùng IKameSDK"**: đổi `baseUrl`, test bằng link có `user_id`, mode AUTH gọi §4. Mục claim/webhook/OTP chuyển xuống "App có backend riêng, handoff = claim".
- Runbook: `handoff` chọn lúc tạo app, đổi sau phải cân nhắc (khách cũ đã nhận link kiểu cũ).
- Infra: chỉ thêm đường dẫn rate limit; không secret mới.
- Funnel (team nội dung): không cần nối `email=` vào link app nữa; SDK web tự gắn `app_link`.

## 6. Ngoài phạm vi / rủi ro ghi nhận

- Thu hồi `user_id` bị lộ (cấp lại UUID cho khách): chưa làm; `ikf customer show` cho biết `user_id` để hỗ trợ thủ công.
- Chữ ký / chống giả mạo cho endpoint NOT_AUTH: SDK không ký request, chấp nhận theo thiết kế của SDK.
- `api-slt-aio.begamob.com` và FunnelFox: không tích hợp, không migrate khách cũ.

## 7. Kiểm thử

- Migration: cột mới, default, unique.
- `claim`: app `user_id` → `app_link` đúng format, không tạo claim token thật, email chứa link; app `claim` → như cũ.
- `check-purchased`: pro sau pay; false sau refund toàn phần; false sau hết hạn + 3 ngày (gói tuần); `user_id` lạ → `200 false`; lọc theo app khi body có định danh; không log `user_id`.
- Mode AUTH endpoint: đúng app, key sai → `401`.
- CLI: cờ mới; tài liệu: test vector cũ không đổi.
- Rate limit: Terraform test thêm đường dẫn.

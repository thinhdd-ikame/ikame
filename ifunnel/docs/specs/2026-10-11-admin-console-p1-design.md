# Admin Console — Đợt 1: Nền + Publish — Design Spec

> Subsystem `admin-console` của master plan, chia 3 đợt (quyết định 2026-10-11): **đợt 1 Nền + Publish** (spec này), đợt 2 Billing + Identity, đợt 3 Dashboard. Code trong repo `ikf-platform`: SPA mới `apps/admin`, core-api thêm auth phiên + route đọc, package mới `@ikf/funnel-lint`. Xây trên `feat/demo-purchase` (PR #5).

**Mục tiêu:** team nội dung tự đưa funnel lên web (upload `demo.html`, xem preview trên điện thoại), người phụ trách bấm Publish lên domain thật và Rollback khi cần — tất cả qua trình duyệt, đăng nhập Google của công ty, có nhật ký ai làm gì. Thay cho CLI `ikf` trong các việc này; CLI vẫn dùng được.

**Điều kiện xong:**
- Đăng nhập bằng Google `ikameglobal.com`; email chưa được cấp quyền bị từ chối rõ ràng.
- Editor upload `demo.html` → thấy kết quả lint → mở preview (QR) → Admin publish lên host/prefix → URL live chạy với `__IKF` → Rollback một bấm về bản trước.
- Mọi thao tác đổi dữ liệu (từ web lẫn CLI) có trong Audit.
- E2E trên `npm run demo` đi trọn luồng trên; viewer không gọi được API ghi.

## Quyết định (2026-10-11)

| # | Hạng mục | Lựa chọn |
|---|---|---|
| 1 | Phạm vi | Admin đầy đủ, chia 3 đợt; đợt 1 = đăng nhập, phân quyền, funnel list/detail, upload, preview, publish, rollback, domain, pixel, gán app, audit, users |
| 2 | Đăng nhập | Google Workspace `ikameglobal.com` (OIDC, kiểm `hd`); role `admin` / `editor` / `viewer` trong Postgres; admin đầu seed bằng CLI |
| 3 | Nguồn funnel | Upload `demo.html` từ máy (ảnh đã nằm trên thư viện S3 chung); lấy từ GitHub để sau |
| 4 | Giao diện | SPA tĩnh `apps/admin` (Vite + React, JavaScript), deploy Worker static assets tại `admin.<zone>`, gọi `api.<zone>` |
| 5 | Ai publish | Editor upload + preview + pixel/app + domain; **chỉ Admin** publish / rollback / users. Viewer chỉ đọc |
| 6 | Cookie | Chỉ cho `api.<zone>` (không `Domain=.<zone>`); SPA gọi API `credentials: include`, CORS origin `https://admin.<zone>` |

## 1. Kiến trúc

```
trình duyệt ─► admin.<zone>   Worker `ikf-admin` (static assets, SPA)
                  │ fetch https://api.<zone>/v1/*  (cookie ikf_admin cho api.<zone>, header X-Ikf-Csrf)
                  ▼
              api.<zone>  core-api ── Postgres (admin_users, admin_sessions, audit_log + bảng sẵn có)
                  └─ Google OIDC (client id/secret trong Secrets Manager)
```

- **Đăng nhập:** `GET /v1/auth/google` (state ký HMAC, nonce, PKCE) → Google → `GET /v1/auth/google/callback` → đổi code lấy `id_token`, kiểm chữ ký (JWKS Google, cache 1 giờ), `iss`, `aud`, `exp`, `nonce`, `email_verified`, `hd = ikameglobal.com` → tìm `admin_users` theo `lower(email)`, chưa `disabled_at` → tạo phiên 12 giờ, cookie `ikf_admin=<session id>; HttpOnly; Secure; SameSite=Lax; Path=/` cho host `api.<zone>` → redirect `https://admin.<zone>/`. Email không có trong `admin_users` → redirect `admin.<zone>/login?error=not_allowed` (không tạo tài khoản, log `admin_login_denied {email_hash}`).
- **Phiên:** `admin_sessions`; gia hạn `expires_at` khi dùng (tối đa 7 ngày tính từ lúc tạo); `POST /v1/auth/logout` xóa; `GET /v1/auth/me` → `{email, name, role, csrf}`. Dọn phiên hết hạn mỗi giờ (worker trong process).
- **CSRF:** double-submit: `csrf` ngẫu nhiên trong phiên, SPA lấy từ `/v1/auth/me`, gửi header `X-Ikf-Csrf` ở mọi request không phải GET; xác thực bằng cookie mà thiếu/sai header → `403 csrf`. Xác thực bằng token `ikf_` không cần.
- **Xác thực chung:** `requireRole(pool, roles)` hiện có mở rộng: nếu có cookie phiên hợp lệ → `req.actor = {kind: 'user', email, role}`; nếu không, token `ikf_` như cũ → `req.actor = {kind: 'token', name, roles}`. Mapping role người ↔ role token: viewer ⊂ editor ⊂ admin; route cũ khai báo `['router']`, `['publisher']`, `['admin']` được ánh xạ: `publisher` ← editor+, `router` ← admin, `admin` ← admin.
- **CORS:** core-api cho phép origin `https://admin.<zone>` (và `http://localhost:8792` khi `APP_ENV=local`) với `credentials`, methods GET/POST/PUT/DELETE, headers `content-type, x-ikf-csrf`. Không đụng CORS checkout.
- **Local:** `npm run demo` phục vụ SPA ở `http://localhost:8792` (Vite dev hoặc build), cờ `--admin-user <email>` tạo phiên không qua Google — chỉ khi `APP_ENV=local`; ở staging/prod core từ chối khởi động nếu biến này có (test như `PADDLE_JS_URL`).

## 2. Dữ liệu

Migration `005_admin.sql`:
- `admin_users (id BIGSERIAL, email TEXT UNIQUE CHECK lower, name TEXT, role TEXT CHECK IN ('admin','editor','viewer'), disabled_at TIMESTAMPTZ NULL, created_by TEXT, created_at)`.
- `admin_sessions (id TEXT PK ulid, user_id BIGINT FK, csrf TEXT, created_at, expires_at, last_seen_at, ip_hash TEXT, ua TEXT)`; index `(expires_at)`.
- `audit_log (id BIGSERIAL, at TIMESTAMPTZ DEFAULT now(), actor TEXT, actor_kind TEXT CHECK IN ('user','token'), action TEXT, target TEXT, details JSONB NOT NULL DEFAULT '{}')`; index `(target, at DESC)`, `(at DESC)`. `actor` = email người hoặc tên token. Không email khách, không secret, không `user_id` khách.

Hành động audit (đợt 1): `version.upload {slug, v, sha256, lint: {errors, warnings}}`, `route.publish {host, prefix, slug, from_v, to_v}`, `route.rollback {host, prefix, slug, from_v, to_v}`, `route.delete`, `domain.create`, `domain.sync {status}`, `funnel.create`, `funnel.pixel {pixel_id}`, `funnel.app {app_id}`, `admin.user.create|update|disable {email, role}`, `auth.login`, `auth.login_denied`.

## 3. API

Tất cả route dưới `/v1`, JSON, nhận cookie phiên hoặc token. Quyền theo role người (token giữ ánh xạ §1).

| Method | Path | Quyền | Ghi chú |
|---|---|---|---|
| GET | `/auth/google`, `/auth/google/callback`; POST `/auth/logout`; GET `/auth/me` | — / phiên | §1 |
| GET | `/funnels` | viewer | `[{slug, latest_v, live: [{host, prefix, v}], pixel_id, app_id, updated_at}]` |
| POST | `/funnels` | editor | `{slug}` → tạo funnel rỗng (`^[a-z0-9][a-z0-9-]{1,62}$`); `409 funnel_exists` |
| GET | `/funnels/:slug` | viewer | `{slug, pixel_id, app_id, versions: [{v, sha256, size, lint, created_by, created_at, preview_url}], live: [...]}` |
| POST | `/funnels/:slug/versions` (có sẵn) | editor | body HTML; **server lint** (§4); lỗi mức `error` → `422 lint_failed {report}`; trùng sha256 → `200 {created: false, v}` |
| PUT | `/funnels/:slug` (có sẵn) | editor | `{pixel_id?, app_id?}` |
| GET | `/domains` | viewer | `[{host, status, dns: [...], routes: [{prefix, slug, v}], created_at}]` |
| PUT | `/domains/:host` (có sẵn) | editor | trả hướng dẫn DNS |
| POST | `/routes/:host/sync` (có sẵn) | editor | kiểm trạng thái Cloudflare |
| GET | `/routes/:host` (có sẵn) | viewer | |
| PUT | `/routes/:host` (có sẵn) | **admin** | publish `{prefix, funnel, v}`; thêm kiểm: version tồn tại, lint không `error`, host `active` |
| POST | `/routes/:host/rollback`, DELETE `/routes/:host` (có sẵn) | **admin** | |
| GET | `/apps` (có sẵn) | viewer | để chọn app khi gán |
| GET | `/audit?target=&action=&limit=50&before=` | viewer | mới nhất trước |
| GET/POST/PUT | `/admin/users`, `/admin/users/:id` | admin | tạo `{email, name, role}`, đổi role, `disabled_at`; không tự khóa chính mình |

Preview: `preview_url = https://preview.<zone>/<slug>/v<n>` (có sẵn từ publisher); bản chưa publish vẫn xem được. SPA hiện QR của URL này.

## 4. Lint phía server — `@ikf/funnel-lint`

Package mới, **tĩnh, không phụ thuộc repo `ikame`** (bộ `funnel/tools` mà CLI chạy — smoke, screens — vẫn ở CLI như kiểm tra trước khi upload). `lint(html, {slug}) → {errors: [{code, message, line?}], warnings: [...]}`:

| Mức | Mã | Điều kiện |
|---|---|---|
| error | `config_funnel_missing` / `config_funnel_mismatch` | không có `CONFIG.funnel` hoặc khác slug |
| error | `relative_media` | `src`/`srcset`/`url(` trỏ `img/…` hay đường dẫn tương đối (ảnh phải ở thư viện S3) |
| error | `email_in_url` | `email=`/`{email}` trong `checkoutUrl`, `appUrl*`, link app (E11/B-rules) |
| error | `external_script` | `<script src>` ngoài danh sách cho phép (Paddle, Cloudflare Turnstile, Meta, Google Fonts, thư viện S3) |
| error | `too_large` | > 2 MB |
| warn | `no_get_app_hook` | funnel app không có `appUrl`/`data-ikf="get-app"`/`IkFunnel.appLink` |
| warn | `inline_demo_checkout` | còn `#demock` / `demoCheckout()` (SDK sẽ bỏ, chỉ nhắc) |
| warn | `missing_meta_viewport` | |

Core lint mọi bản upload (CLI lẫn web); CLI cũng gọi package này trước khi gửi để báo sớm. `versions.lint_report` lưu kết quả này.

## 5. Màn hình (SPA)

Khung: thanh trái Funnels · Domains · Audit · Settings; góc trên email + role; nút ghi bị mờ theo role, tooltip ghi lý do.

1. **Login:** nút Google; `?error=not_allowed` → "Email chưa được cấp quyền, liên hệ admin".
2. **Funnels:** bảng slug · bản mới nhất · live tại (host/prefix, v) · pixel · app · cập nhật; tìm theo slug; **New funnel**.
3. **Funnel detail:**
   - Upload: kéo thả / chọn `demo.html`; SPA kiểm trước kích thước + `CONFIG.funnel` đúng slug; gửi server; lỗi lint → không tạo bản, liệt kê; cảnh báo → bản có nhãn.
   - Versions: v · ngày · ai · size · lint · **Preview** (mở tab + QR) · **Publish** (admin).
   - Publish dialog: chọn host (chỉ `active`) + prefix; hiện "đang live: v3 → v5" hoặc "publish lần đầu"; xác nhận → URL live.
   - Live: các route trỏ tới funnel; **Rollback** (admin) hiện "v5 → v3", xác nhận.
   - Settings: Pixel ID; App (chọn từ `/apps`).
4. **Domains:** host · trạng thái · số route; **Add domain** → bản ghi DNS cần tạo → **Check**.
5. **Audit:** thời gian · ai · hành động · đối tượng; lọc theo funnel/host.
6. **Settings → Users:** thêm email + role, đổi role, khóa.

Lỗi: 401 → về Login, giữ đường dẫn để quay lại; 403 csrf → tải lại `/auth/me` rồi thử lại một lần; 5xx → thông báo kèm `request id`; mạng → thử lại. Không đầu tư thiết kế thị giác ở đợt 1 (một bộ CSS gọn, không UI kit nặng).

## 6. Hạ tầng và deploy

- Terraform: DNS `admin.<zone>` → Worker `ikf-admin` (route `admin.<zone>/*`); secret `google-oauth-client-secret` (+ var `GOOGLE_OAUTH_CLIENT_ID`, `ADMIN_ORIGIN`); CORS origin cho core-api qua env `ADMIN_ORIGIN`.
- CI: workflow `admin.yml` — test SPA, build, `wrangler deploy` (static assets), sau khi core-api deploy; `deploy-config` từ chối `ADMIN_LOCAL_USER` như `PADDLE_JS_URL`.
- Runbook `docs/runbooks/admin-console.md`: tạo OAuth client trên Google Cloud (redirect URI `https://api.<zone>/v1/auth/google/callback` theo env), đặt secret, seed admin `ikf admin add <email> --role admin`, kiểm đăng nhập staging → prod, xử lý "không đăng nhập được", thu hồi quyền người nghỉ.

## 7. Kiểm thử

- **core-api:** OIDC callback với `id_token` ký bằng khóa test (JWKS giả): sai `hd`, chưa cấp quyền, hết hạn, `aud` sai, `nonce` sai → từ chối; phiên: hết hạn, logout, gia hạn, trần 7 ngày; CSRF thiếu/sai → 403, token không cần; phân quyền từng route theo 3 role và theo token; `/funnels`, `/funnels/:slug`, `/domains` đúng dữ liệu live; upload lỗi lint → 422 không tạo bản; publish kiểm version/lint/host; audit ghi đủ các hành động; users (không tự khóa mình); `ADMIN_LOCAL_USER` ngoài local → không khởi động.
- **`@ikf/funnel-lint`:** bảng kịch bản + chạy trên toàn bộ `demo.html` trong `funnel-development` (báo cáo số funnel lỗi theo mã, không fail test).
- **SPA:** Vitest + Testing Library: hiển thị theo role, upload → lint → version, publish dialog, rollback, 401/403; e2e Playwright trên `npm run demo --admin-user`: upload funnel thật → preview → publish → URL live có `__IKF` → rollback.
- **Terraform:** DNS/Worker/secret với mock; `deploy-config` test.

## 8. Ngoài phạm vi (đợt 1)

Giá, app registry, khách, webhook, reconcile (đợt 2); dashboard ClickHouse (đợt 3); xóa funnel/version; nhiều workspace; sửa HTML trong trình duyệt; lấy funnel từ GitHub; thông báo Slack; SSO ngoài Google; 2FA riêng (dựa vào Google).

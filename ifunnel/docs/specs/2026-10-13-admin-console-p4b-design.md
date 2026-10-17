# Admin Console đợt 4b (Quyền theo app) — Design Spec

> Nối tiếp đợt 4a (PR #10, app là đơn vị quản lý). Thêm quyền theo từng app: một người có thể là `editor` ở Starlyn và `viewer` ở ChatChi; token `ikf_` có thể gắn một app; global admin quản lý mọi thứ. Code trong repo `ikf-platform`, nhánh mới cắt từ `feat/admin-console-p4a`. Thiết kế đã duyệt trong chat 2026-10-12.

**Mục tiêu:** cho team của từng app vào console mà chỉ thấy và sửa được app của mình; mọi việc ảnh hưởng nhiều app (tạo app, Users, Billing, domain, token, audit toàn hệ thống) chỉ global admin làm.

**Điều kiện xong:**
- Trên demo: `demo@ikameglobal.com` là global admin (thấy mọi app, "Tất cả app", Users, Billing); `support@ikameglobal.com` chỉ có `support` ở `starlyn` → switcher chỉ có Starlyn, không có "Tất cả app", không thấy Users/Billing/Domains toàn cục; mở `/apps/calmio` → "Không tìm thấy app". e2e Playwright chạy đúng luồng này.
- Mọi route có tài nguyên thuộc app kiểm role **trong app đó**; GET ngoài phạm vi → `404`, ghi → `403`; route chỉ dành global → `403` cho người không global. Test bảng quyền: 3 kiểu người (global, admin của app A, viewer của app A) × mọi route.
- Mọi test cũ pass; người dùng hiện có sau migration giữ đúng quyền cũ (admin → global, role khác → role mặc định trên mọi app).

## Quyết định (2026-10-12, đã duyệt)

| # | Hạng mục | Lựa chọn |
|---|---|---|
| 1 | Mô hình | **Role theo từng app** + cờ **global** |
| 2 | Global admin | Thấy và sửa mọi app; riêng: tạo app, Users, Billing/reconcile, Domains (gán/đổi trạng thái), token, Audit toàn hệ thống, funnel chưa gán |
| 3 | Role mặc định | `admin_users.role` thành role **mặc định** cho app không có dòng riêng; `NULL` = không vào app nào ngoài các dòng riêng |
| 4 | Token | `api_tokens.app_id` nullable: có app → chỉ route của app đó; không app → như hiện nay |
| 5 | Ngoài phạm vi | GET → `404 not_found` (không lộ app tồn tại); ghi → `403 forbidden` |
| 6 | Liệt kê không `?app=` | Trả hợp các app trong phạm vi; global = tất cả |

## 1. Dữ liệu — migration `008_app_roles.sql`

```sql
ALTER TABLE admin_users ADD COLUMN global BOOLEAN NOT NULL DEFAULT false;
UPDATE admin_users SET global = true WHERE role = 'admin';
ALTER TABLE admin_users ALTER COLUMN role DROP NOT NULL;          -- NULL = không có role mặc định
CREATE TABLE admin_user_apps (
  user_id    BIGINT NOT NULL REFERENCES admin_users (id) ON DELETE CASCADE,
  app_id     TEXT   NOT NULL REFERENCES apps (id),
  role       TEXT   NOT NULL CONSTRAINT admin_user_apps_role_check CHECK (role IN ('admin', 'editor', 'support', 'viewer')),
  created_by TEXT   NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, app_id)
);
CREATE INDEX admin_user_apps_by_app ON admin_user_apps (app_id);
ALTER TABLE api_tokens ADD COLUMN app_id TEXT NULL REFERENCES apps (id);
```

- Ràng buộc trong code: `global = true` ⇒ role hiệu lực mọi app là `admin` (bỏ qua `role`, `admin_user_apps`); luôn còn ít nhất **một** global admin chưa disabled (`409 last_global_admin`); không tự bỏ cờ global của chính mình (`409 self_lockout`, như luật "không tự khoá" đợt 1).
- Người cũ: `role = 'admin'` → global (giữ quyền như cũ); `viewer/support/editor` → role mặc định trên mọi app (giữ quyền như cũ, trừ việc toàn cục chỉ global làm — họ vốn không làm được).

## 2. Phạm vi và kiểm quyền (core-api)

### Phạm vi của người gọi
- `src/admin/scope.js`: `loadScope(pool, actor)` → `{ global: bool, roleIn(appId) → role | null, apps(): app_id[] }`, tính **mỗi request** từ DB (đổi quyền có hiệu lực ngay; một query join `admin_users` + `admin_user_apps` + `apps`).
  - Người: global → `admin` mọi app; không global → `admin_user_apps.role` của app, không có thì `admin_users.role` (có thể `NULL`).
  - Token không app: như hiện nay, coi như global với grants của token roles (`router`/`admin` token như cũ; `admin` token = global).
  - Token có app: grants của token roles chỉ trong app đó; không global.
- Grants trong một app dùng **bảng `USER_GRANTS` hiện có** (viewer ⊂ support ⊂ editor ⊂ admin, kèm `publisher`, `prices:read`, `apps:read`, `router`). Không đổi bảng.

### Middleware
- `requireGrant(pool, grant, { app })` thay dần `requireRole`:
  - `app: 'global'` → chỉ global (người global hoặc token không app có grant) — `403 forbidden` cho người khác.
  - `app: (req, db) => app_id | null | undefined` → resolver tìm app của tài nguyên (từ params/body/query, hoặc tra DB: funnel theo slug, host theo `domains.app_id`, checkout theo funnel, grant theo `manual_grants.app_id`, webhook theo app). `null` (funnel chưa gán / domain dùng chung) → chỉ global (trừ ngoại lệ ở bảng dưới); tài nguyên không tồn tại → để handler trả 404 như cũ.
  - `app: 'any'` → đủ nếu người gọi có `grant` ở **ít nhất một** app (route liệt kê tự lọc theo phạm vi).
  - Không đủ quyền: phương thức an toàn (GET/HEAD) → `404 {error: 'not_found'}`; ghi → `403 {error: 'forbidden'}`.
  - Gắn `req.scope` cho handler.
- `requireRole` cũ giữ làm alias `requireGrant(pool, grant, { app: 'global' })` cho route chưa chuyển; plan chuyển hết route có tài nguyên thuộc app.

### Bảng route (thay đổi so với 4a)

| Route | Phạm vi |
|---|---|
| `GET /v1/apps` | `any` viewer; trả các app trong phạm vi (global: tất cả) |
| `POST /v1/apps` | global (`router`) |
| `GET /v1/apps/:id`, `/summary` | viewer trong `:id` |
| `GET /v1/apps/:id/plans` | `prices:read` trong `:id` |
| `PUT /v1/apps/:id`, `POST /v1/apps/:id/rotate-key`, `POST …/webhooks/:event_id/resend` | `router` (admin) trong `:id` |
| `GET /v1/apps/:id/webhooks` | `apps:read` trong `:id` |
| `GET /v1/funnels` | `any` viewer; lọc theo phạm vi; `?app=none` chỉ global (người khác → danh sách rỗng) |
| `POST /v1/funnels {slug, app_id}` | `publisher` (editor) trong `app_id` |
| `GET /v1/funnels/:slug`, analytics `funnels/:slug[/breakdown]` | viewer trong app của funnel; funnel chưa gán → global |
| `POST /v1/funnels/:slug/versions` | `publisher` trong app của funnel; slug mới → trong `app_id` của body |
| `PUT /v1/funnels/:slug {pixel_id?, app_id?}` | `publisher` trong app hiện tại; đổi app → **thêm** `publisher` trong app mới |
| `GET/PUT /v1/funnels/:slug/prices` | `prices:read` / `router` trong app của funnel |
| `GET /v1/domains` | `any` viewer; domain của các app trong phạm vi + dùng chung |
| `PUT /v1/domains/:host` | global (`admin`) |
| `GET /v1/routes/:host` | viewer trong app của host; host dùng chung → `any` viewer, chỉ trả route của funnel trong phạm vi |
| `PUT /v1/routes/:host` (publish), rollback, delete | `router` trong app của **funnel** của route (publish: funnel trong body; rollback/delete: funnel đang live ở prefix); host của app khác vẫn bị luật 4a chặn |
| `POST /v1/routes/:host/sync` | `router` trong app của host; host dùng chung → global |
| `GET /v1/paddle/prices` | `any` `prices:read` |
| `POST /v1/customers/lookup` | `support` trong `app_id`; **người không global bắt buộc `app_id`** (`400 app_required`) |
| `POST /v1/customers/:ref/grants`, `DELETE …/grants/:id` | `admin` trong app của grant (`app_id` body / dòng grant) |
| `POST /v1/customers/:ref/resend-email` | `support` trong app của checkout của claim |
| `POST /v1/customers/:ref/rotate-user-id` | global (`admin`) — đụng mọi app của khách |
| `GET /v1/analytics/overview` | `any` viewer; không `?app=` → chỉ funnel trong phạm vi (global: tất cả) |
| `GET /v1/audit` | có `?app=` → viewer trong app; không `?app=` → global |
| `GET/POST/PUT /v1/admin/users…`, `POST /v1/tokens`, `/v1/billing/*` | global |

### Users và token
- `GET /v1/admin/users` trả mỗi người `{id, email, name, role, global, disabled_at, apps: [{app_id, role}]}`.
- `POST /v1/admin/users {email, name?, role?: role|null, global?: bool, apps?: [{app_id, role}]}`; `PUT /v1/admin/users/:id {role?, name?, disabled?, global?}`.
- Mới: `PUT /v1/admin/users/:id/apps/:app_id {role}` (upsert), `DELETE /v1/admin/users/:id/apps/:app_id`. Audit `admin.user.app_grant|app_revoke {email, app_id, role}` với cột `app_id`.
- `POST /v1/tokens {name, roles, app_id?}`; token có app không được role `admin` (`400 invalid_roles`) — token app chỉ `publisher`/`router`.
- `GET /v1/auth/me` → `{email, name, role, global, csrf, apps: [{id, name, role}]}` (app trong phạm vi + role hiệu lực).

### Audit
- Ghi như 4a; thêm `admin.user.app_grant|app_revoke`, `admin.user.update` khi đổi `global` (`details: {email, global}`), `token.create` có `app_id` (cột).

## 3. SPA

- `auth.jsx`/`roles.js`: quyền tính theo app: `can(me, need, appId)` dùng `me.apps` (role trong app) hoặc `me.global`; menu toàn cục (`NAV`) chỉ global; người không global vào `/` → chuyển tới app đầu tiên trong phạm vi (không app nào → trang "Bạn chưa được cấp app nào, liên hệ admin").
- Switcher: chỉ app trong `me.apps`; option "Tất cả app" chỉ global.
- `APP_NAV` và nút theo role **trong app đang xem** (`RoleButton`, `RequireGrant` nhận `appId` từ `useAppContext()`).
- Trang trong app với app ngoài phạm vi: API trả 404 → "Không tìm thấy app <id>." (đã có ở Tổng quan; áp cho mọi trang trong app).
- Funnel detail: lấy app từ funnel; quyền theo app đó (nút Upload/Publish/Giá).
- **Settings › Users** (global): bảng người dùng thêm cột Global và cột "App"; trang chi tiết người dùng: cờ Global, role mặc định (kể cả "Không"), bảng app × role (thêm/đổi/xoá). Lỗi `last_global_admin`, `self_lockout` hiện rõ.
- Customers trong app giữ nguyên (đã gửi `app_id`); `/customers` toàn cục chỉ global.

## 4. CLI

- `ikf admin add <email> --role <role|none> [--global] [--app <id>:<role> …]`; `ikf admin ls` thêm cột global và app; `ikf admin grant <email> <app> <role>`; `ikf admin revoke <email> <app>`; `ikf admin global <email> on|off`.
- `ikf token create <name> --roles publisher[,router] [--app <id>]` (lệnh mới; in token một lần).
- Lỗi `not_found` cho tài nguyên ngoài phạm vi in "Không tìm thấy (hoặc bạn không có quyền)".

## 5. Demo, hạ tầng, kiểm thử, ngoài phạm vi

- **Demo:** `demo@ikameglobal.com` global; `support@ikameglobal.com` → `role NULL` + `admin_user_apps (starlyn, support)`; token demo `ikf_demo_admin` vẫn global. e2e `demo/test/admin-p4b-e2e.test.mjs` (cổng/DB riêng `ikf_admin_p4b_test`, build `demo/.build/admin-p4b/`): global thấy 3 app + "Tất cả app" + Users; tạo người `viewer` chỉ ở `calmio` qua Settings › Users; đăng nhập bằng session của người đó → switcher chỉ Calmio, `/apps/starlyn` → "Không tìm thấy app", nút Upload bị khoá; `support@` tra khách trong Starlyn được, `/customers` toàn cục không có trong menu.
- **Hạ tầng:** không đổi Terraform. Runbook `admin-console.md` thêm mục "Quyền theo app" (cấp/thu quyền, token theo app, luật global cuối cùng).
- **Kiểm thử:** migration 008 (cột, bảng, người cũ admin → global, idempotent dữ liệu); `loadScope` (global, dòng riêng, role mặc định, `NULL`, token có/không app); `requireGrant` (404 GET / 403 ghi / global-only / `any`); **bảng quyền route** 3 kiểu người × mọi route ở bảng §2; liệt kê lọc theo phạm vi (apps, funnels, domains, overview, audit); `last_global_admin`, `self_lockout`; Users API mới + audit; token có app (không `admin`, chỉ route của app); `auth/me` mới; SPA (switcher theo phạm vi, menu toàn cục ẩn, chuyển hướng `/`, nút theo role trong app, Settings › Users app × role); CLI; e2e; log/audit không email khách, không `user_id`.
- **Ngoài phạm vi:** mời người dùng qua email; SSO ngoài Google; quyền theo funnel; workspace/tenant tách DB; giới hạn theo domain; xoá app.
- **Gộp các mục hoãn từ 4a** (làm trong đợt này vì cùng đường kiểm quyền): khoá đúng thứ tự giữa gán domain, đổi app của funnel và publish (write skew 4a) — `setDomain`, `assignFunnelApp`, `setRoute` khoá theo **cùng thứ tự: `domains` (theo host, tăng dần) rồi `funnels`**; test hai kết nối song song cho cả ba cặp.

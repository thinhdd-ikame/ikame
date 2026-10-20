# Admin Console đợt 4a (App là đơn vị quản lý) — Design Spec

> Nối tiếp đợt 1–3 (PR #6, #7, #8) và restyle (#9). Biến **app** (bảng `apps`, có từ entitlement-identity) thành đơn vị quản lý cao nhất của console: mỗi funnel, domain, khách hàng, số liệu đều nhìn được "theo app". Code trong repo `ikf-platform`, nhánh mới cắt từ `feat/admin-console-ui`. Đợt 4b (quyền theo app) là spec riêng, xếp sau đợt này.

**Mục tiêu:** người vận hành mở console chọn một app (Starlyn, ChatChi, CoinIdentify…) và thấy trọn bộ của app đó — funnels, số liệu, giá, khách hàng, domain, webhook — mà không phải lọc bằng mắt trong các bảng chung; funnel mới bắt buộc thuộc một app; funnel của app này không publish được lên domain của app khác.

**Điều kiện xong:**
- Trên demo (`npm run demo` + `demo:events -- --seed`): sidebar có ô chọn app với 3 app mẫu; vào một app thấy Tổng quan (KPI + bảng funnel của app), Funnels, Giá, Khách hàng, Domains, Webhooks, Cài đặt; Dashboard toàn cục hiện mỗi app một dòng KPI. e2e Playwright: tạo app → tạo funnel trong app → upload → publish lên domain dùng chung → Tổng quan app có funnel đó; publish lên domain của app khác bị chặn `domain_app_mismatch`.
- `POST /v1/funnels` không có `app_id` → 400 `app_required`; upload lần đầu một slug mới không kèm `app_id` → 400 `app_required`.
- Mọi test cũ pass (đổi fixture để gán app); bundle SDK không đổi.

## Quyết định (2026-10-12)

| # | Hạng mục | Lựa chọn |
|---|---|---|
| 1 | App với funnel | **Bắt buộc** cho funnel mới; funnel cũ `app_id NULL` vào nhóm "Chưa gán" để gán dần; cột vẫn nullable đợt này (NOT NULL ở đợt sau khi nhóm rỗng) |
| 2 | Quyền theo app | **Có, nhưng ở đợt 4b**: role theo từng app + global admin. Đợt 4a chuẩn bị chỗ: `audit_log.app_id`, tham số `app` trên mọi route liệt kê |
| 3 | Domain | Thuộc **đúng một app** (`domains.app_id`), hoặc **dùng chung** (`NULL`: demo, preview, host thử). Một app có 1..n domain. Publish chỉ lên domain của app funnel hoặc domain dùng chung |
| 4 | Số liệu theo app | **Không đổi schema ClickHouse**: core-api lấy slug của app từ Postgres, lọc `funnel IN (…)`. Số cũ dùng được ngay; đổi app của funnel thì số theo kịp |
| 5 | Chuyển funnel sang app khác | Cho phép như hiện nay (`PUT /v1/funnels/:slug {app_id}`, recompute quyền), **không** cho gỡ về `NULL` |
| 6 | SPA | Không thêm dependency; ngữ cảnh app nằm trong URL `/apps/:id/…`, không dùng state ẩn |

## 1. Dữ liệu — migration `007_apps_container.sql`

```sql
ALTER TABLE domains   ADD COLUMN app_id TEXT NULL REFERENCES apps (id);
CREATE INDEX domains_by_app ON domains (app_id) WHERE app_id IS NOT NULL;
ALTER TABLE audit_log ADD COLUMN app_id TEXT NULL;           -- không FK: giữ dòng khi app bị xoá sau này
CREATE INDEX audit_log_by_app ON audit_log (app_id, at DESC) WHERE app_id IS NOT NULL;
ALTER TABLE funnels   DROP COLUMN app;                        -- cột TEXT từ 001, không code nào dùng
-- Điền app cho audit cũ (best effort, idempotent): target funnel:<slug> và details->>'slug' → funnels.app_id;
-- target app:<id> → id; target domain:<host> → domains.app_id (sau khi gán).
```

- `funnels.app_id` giữ nullable. `apps` không đổi cột.
- Ràng buộc nghiệp vụ (trong code, không CHECK): funnel mới phải có app; domain gán app chỉ khi không có route live của funnel thuộc app khác.

## 2. Core-api

### Tạo funnel và upload
- `POST /v1/funnels` body `{slug, app_id}` (`app_id` **bắt buộc**, pattern app id); thiếu → `400 app_required`; app không tồn tại → `404 app_not_found`; `409 funnel_exists` như cũ. Audit `funnel.create {slug, app_id}`.
- `POST /v1/funnels/:slug/versions`: body thêm `app_id?`. Funnel chưa có trong DB: có `app_id` → tạo funnel với app rồi upload (audit `funnel.create` + `version.upload`); không có → `400 app_required`. Funnel đã có: bỏ qua `app_id` nếu trùng, khác → `409 funnel_app_mismatch` (đổi app phải qua `PUT`). `publishVersion` không còn tự `INSERT … ON CONFLICT DO NOTHING` không app.
- `PUT /v1/funnels/:slug {app_id}`: `null` → `400 app_required`; còn lại như đợt 2 (recompute quyền, audit `funnel.app`).
- `GET /v1/funnels?app=<id>`: chỉ funnel của app; `app=none` → funnel chưa gán. Mỗi dòng đã có `app_id`.

### Domain và publish
- `PUT /v1/domains/:host` (admin) body `{status?, app_id?}` (≥ 1 field; `app_id: null` = dùng chung). Gán app khi host đang có route live của funnel thuộc app khác (hoặc chưa gán) → `409 domain_has_foreign_routes {routes: [{prefix, slug, app_id}]}`. Audit `domain.sync {host, status, app_id}` với cột `app_id` = app của domain.
- `GET /v1/domains?app=<id>`: domain của app **và** domain dùng chung (cả hai đều publish được); mỗi dòng thêm `app_id`. `app=none` → chỉ dùng chung.
- `PUT /v1/routes/:host` (publish): thêm kiểm **sau** các kiểm hiện có: `domains.app_id IS NULL` hoặc `= funnels.app_id` của funnel; funnel chưa gán app chỉ lên được domain dùng chung → `409 domain_app_mismatch {host_app, funnel_app}`. Rollback/delete/sync không kiểm (đường khẩn cấp; rollback chỉ quay về route đã từng hợp lệ).
- `GET /v1/routes/:host` không đổi.

### Apps
- `GET /v1/apps` (viewer): mỗi app thêm `funnels_count`, `domains_count`, `live_routes_count` (3 COUNT trong một query).
- **Mới** `GET /v1/apps/:id` (viewer): `appView` + 3 count; `404 app_not_found`. SPA thôi lọc client-side.
- **Mới** `GET /v1/apps/:id/summary` (viewer): `{app: appView, funnels: [{slug, latest_v, live: [{host, prefix, v}], pixel_id, updated_at}], domains: [{host, status, routes: [{prefix, slug, v}]}]}` — funnel và domain của app (không gồm domain dùng chung).
- **Mới** `GET /v1/apps/:id/plans` (`prices:read`): `{plans: [{slug, plan, price_id, discount_id, entitlement_key, unmapped}]}` hợp từ `funnel_prices` ∪ `plan_keys` bản mới nhất của từng funnel trong app (cùng logic tab Giá). Chỉ đọc; sửa vẫn ở tab Giá của funnel.

### Khách hàng
- `POST /v1/customers/lookup` body thêm `app_id?`. Có `app_id`: `checkouts`/`subscriptions` chỉ funnel của app; `entitlements`/`manual_grants`/`links`/`deliveries` chỉ `app_id` đó; `claim` chỉ khi checkout thuộc app, khác → `null`; khách không có gì trong app → bỏ khỏi `customers`. Không `app_id` → như cũ. Vẫn không có `user_id`/email trong body trả về.
- `POST /v1/customers/:ref/grants` không đổi (đã có `app_id`); audit `entitlement.grant|revoke` điền cột `app_id`.

### Audit
- `audit(db, actor, action, target, details, {app_id} = {})` — tham số thứ 6 tuỳ chọn ghi cột `app_id`. Điền ở: `funnel.*`, `version.upload` (app của funnel), `route.*` (app của funnel được publish/rollback), `domain.sync` (app của domain), `app.*` (chính app), `entitlement.grant|revoke`, `webhook.resend`, `funnel.app` (app **mới**). Không điền: `auth.*`, `token.*`, `billing.*`, `admin.user.*`, `customer.resend_email|rotate_user_id`.
- `GET /v1/audit?app=<id>` → `app_id = $app` (kết hợp được với `target`/`action`). Mỗi item trả thêm `app_id`.

### Analytics
- `GET /v1/analytics/overview?from&to&app=<id>`: lọc slug theo `funnels.app_id` ở **cả hai** nguồn (ClickHouse `funnel IN ({slugs:Array(String)})`, Postgres `f.app_id = $1`); không có `app` → mọi funnel. Mỗi dòng thêm `app_id` (null = chưa gán). Cache key thêm `app`. App không tồn tại → `404 app_not_found`; app không có funnel → `funnels: []` (không gọi ClickHouse).
- `funnels/:slug` và `breakdown` không đổi.
- `ikf stats --app <id> [--days] [--by]`: in bảng overview của app + dòng tổng.

### CLI (`packages/cli`)
- `funnel create <slug> --app <id>`; `funnel ls [--app <id>|--unassigned]`.
- `publish <folder> --slug <slug> [--app <id>]`: gửi `app_id` khi có; server trả `app_required` → CLI in "Funnel mới cần --app <id>".
- `domain ls [--app <id>]`; `domain set <host> [--status active|disabled] [--app <id> | --shared]`.
- `app show <id>`; `app ls` in thêm 3 count.

## 3. SPA (`apps/admin`)

- **Ngữ cảnh app = URL.** `/apps/:id/*` là "trong app"; mọi URL khác là "toàn cục". Hook `useAppContext()` đọc `:id` từ route; không state ẩn, không localStorage.
- **Sidebar:** trên cùng ô chọn app (`<select data-testid="app-switcher">`: "Tất cả app" + từng app theo tên; đổi → điều hướng). Dưới là menu theo ngữ cảnh:
  - Toàn cục: Dashboard `/` · Funnels `/funnels` · Apps `/apps` · Khách hàng `/customers` · Domains `/domains` · Billing · Audit · Settings (như nay).
  - Trong app: Tổng quan `/apps/:id` · Funnels `/apps/:id/funnels` · Giá `/apps/:id/plans` (`prices:read`) · Khách hàng `/apps/:id/customers` (`support`) · Domains `/apps/:id/domains` · Webhooks `/apps/:id/webhooks` (`apps:read`) · Audit `/apps/:id/audit` · Cài đặt `/apps/:id/settings` (`apps:read` xem, admin sửa/xoay key). Dưới cùng link "← Tất cả app".
- **Dashboard toàn cục** (`/`): hàng KPI tổng (đã có) + **bảng theo app** (`data-testid="app-row"`: app · funnels · sessions · leads · checkouts · paid · paid/session · doanh thu · refund), nhóm từ `overview` theo `app_id` phía client; dòng cuối **"Chưa gán"** khi có funnel `app_id = null` (link `/funnels?app=none`). Click app → `/apps/:id`. Bảng funnel cũ chuyển vào `/apps/:id`.
- **Apps** (`/apps`): thẻ mỗi app (tên, kind, 3 count) + nút Tạo app (admin, form đợt 2). Click → `/apps/:id`.
- **Tổng quan app** (`/apps/:id`): tên/kind, `RangePicker`, hàng KPI của app, bảng funnel của app (= Dashboard đợt 3 lọc `app`), khối Domains của app (host, route live), nút "Tạo funnel".
- **Funnels trong app**: bảng như `/funnels` nhưng chỉ app; dialog Tạo funnel app điền sẵn và khoá. `/funnels` toàn cục thêm cột App + dropdown lọc (`?app=`; `none` = Chưa gán); dialog tạo funnel toàn cục có dropdown app **bắt buộc**.
- **Giá trong app** (`/apps/:id/plans`): bảng chỉ đọc từ `/plans`, link mỗi dòng → tab Giá của funnel; badge Chưa có giá/Không dùng như đợt 2.
- **Khách hàng trong app**: màn Khách hàng đợt 2 gọi lookup với `app_id`; tiêu đề "Khách hàng của <app>"; chi tiết chỉ hiện dữ liệu của app. Cấp quyền trong app điền sẵn `app_id`.
- **Domains trong app**: hai nhóm "Của app" và "Dùng chung"; admin có nút **Gán vào app** trên domain dùng chung và **Bỏ gán** trên domain của app (`PUT {app_id}`); lỗi `domain_has_foreign_routes` hiện danh sách route chặn. `/domains` toàn cục thêm cột App.
- **Webhooks / Cài đặt**: tách từ `AppDetail` đợt 2 thành hai route; nội dung không đổi.
- **Funnel detail** (`/funnels/:slug`): breadcrumb `App › slug` (link về `/apps/:id`); funnel chưa gán → thẻ vàng "Chưa gán app" + select (editor) không còn lựa chọn trống. `PublishDialog`: dropdown domain chỉ gồm domain của app funnel + dùng chung (từ `/domains?app=`), funnel chưa gán chỉ thấy dùng chung kèm ghi chú.
- **Audit**: `/audit` thêm lọc app; `/apps/:id/audit` = `/audit?app=`.
- Deep link cũ (`/funnels/:slug`, `/apps/:id`, `/customers/:ref`) giữ nguyên; `/apps/:id` giờ là Tổng quan (thông tin sửa app chuyển sang `/settings`).
- Client thêm: `getApp(id)`, `getAppSummary(id)`, `getAppPlans(id)`, `setDomain(host, body)`, `listFunnels({app})`, `listDomains({app})`, `listAudit({…, app})`, `getOverview({from, to, app})`, `lookupCustomers({…, app_id})`, `createFunnel({slug, app_id})`, `uploadVersion(slug, html, {app_id})`.

## 4. Demo, hạ tầng, kiểm thử, ngoài phạm vi

- **Demo:** `seed.mjs` tạo 3 app mẫu kind `app`, handoff `user_id` (`starlyn` ← `moon-reading`, `calmio` ← `calmio-calm-kids`, `ewa` ← `ewa-books`; tên "<App> (demo)", tracker/scheme giả); `publishFunnels` gửi `app_id` ở upload đầu; host demo (`localhost`, LAN IP, host admin, host purchase) giữ dùng chung; `demo:purchase` dùng app của `chosen[0]` thay vì cố định `starlyn`. e2e `demo/test/admin-p4a-e2e.test.mjs` (cổng và DB riêng `ikf_admin_p4a_test`, build dir `demo/.build/admin-p4a/`): chọn app trong switcher → Tổng quan có funnel + KPI > 0 sau seed → tạo funnel trong app → upload → publish lên `localhost` (dùng chung) thành công → domain `other.localhost` (e2e tạo qua `PUT /v1/domains`, gán cho app khác) không có trong dropdown publish và `PUT /v1/routes` lên đó trả `domain_app_mismatch` → Dashboard toàn cục có 3 dòng app.
- **Hạ tầng:** không đổi Terraform. Runbook `docs/runbooks/admin-console.md` thêm mục "Gán funnel/domain vào app sau khi lên 007" (CLI `funnel set --app`, `domain set --app`), và lưu ý `ikf publish` slug mới cần `--app`.
- **Kiểm thử:** migration 007 idempotent + backfill audit; `POST /v1/funnels` thiếu/sai app; upload slug mới có/không `app_id`, `funnel_app_mismatch`; `PUT funnels` null → 400; `?app=` và `app=none` cho funnels/domains/audit; `PUT domains` app_id + `domain_has_foreign_routes`; publish `domain_app_mismatch` (3 trường hợp: khác app, funnel chưa gán lên domain app, domain chung ok); `GET apps/:id`, `summary`, `plans`, 3 count; lookup theo app (lọc đủ 6 khối, không `user_id`/email); audit `app_id` cho từng action; overview theo app khớp tổng từng funnel, cache key, 404; CLI mới; SPA từng màn với fake client (switcher, app-row + Chưa gán, funnels lọc, tạo funnel bắt buộc app, PublishDialog lọc domain, Domains gán/bỏ gán, breadcrumb); bảng quyền 4 role × route mới; e2e; log/audit không email, không `user_id`.
- **Ngoài phạm vi:** quyền theo app (4b); xoá/archive app; chuyển funnel sang app khác kèm chuyển quyền khách (hiện recompute theo app mới, không migrate); tạo domain qua API (vẫn Terraform + `sync-domains.sh`); `funnels.app_id NOT NULL`; cột `app` trong ClickHouse; cài đặt Paddle theo app.

## 5. Chuẩn bị cho đợt 4b (không code ở 4a)

4b thêm `admin_user_apps (email, app_id, role)` + cờ `admin_users.global`, `api_tokens.app_id`, và một `scope` trên `req` để mọi route có tham số `app` tự ép theo quyền người gọi. 4a để sẵn: tham số `app` nhất quán trên mọi route liệt kê, `audit_log.app_id`, ngữ cảnh app trong URL của SPA, và `GET /v1/apps/:id` làm điểm kiểm quyền duy nhất khi vào app.

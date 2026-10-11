# iKame Funnel Platform — Admin Console đợt 1 (Nền + Publish) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Team nội dung tự upload `demo.html`, xem lint + preview (QR) trên điện thoại; admin publish lên host/prefix và rollback một bấm — qua trình duyệt, đăng nhập Google `ikameglobal.com`, mọi thao tác đổi dữ liệu (web lẫn CLI) có trong Audit; CLI `ikf` vẫn dùng được.

**Architecture:**
- **core-api**: migration `005_admin.sql` (`admin_users`, `admin_sessions`, `audit_log`); `src/audit.js` ghi audit trong chính transaction của thay đổi; `requireRole` mở rộng: cookie phiên `ikf_admin` (người, CSRF `X-Ikf-Csrf` cho mọi request ghi) trước, rồi token `ikf_`; role người `viewer ⊂ editor ⊂ admin` (editor thoả `publisher`, admin thoả mọi role). Google OIDC (`/v1/auth/google` → Google → `/v1/auth/google/callback`): code + PKCE S256, state + nonce trong cookie `ikf_oauth` ký HMAC, `id_token` kiểm bằng JWKS Google (`jose`, cache 1 giờ) + `iss`/`aud`/`exp`/`nonce`/`email_verified`/`hd`. Phiên 12 giờ trượt, trần 7 ngày; dọn mỗi giờ trong process. CORS chỉ cho `ADMIN_ORIGIN`. Route đọc mới: `GET/POST /v1/funnels`, `GET /v1/funnels/:slug`, `GET /v1/domains`, `GET /v1/audit`; users: `GET/POST/PUT /v1/admin/users`. Upload chạy `@ikf/funnel-lint` (lỗi → `422 lint_failed`); publish từ chối bản có lỗi lint. Mỗi response có `x-request-id` (UUID).
- **`@ikf/funnel-lint`** (package mới, không phụ thuộc gì, chạy được trong trình duyệt): `lint(html, {slug, app, mediaOrigins, maxBytes})` theo bảng spec §4; CLI chạy trước khi upload.
- **CLI**: lint trước upload, in lỗi `lint_failed` của server; `ikf admin add|ls|disable`.
- **`apps/admin`** (workspace mới): SPA Vite + React (JavaScript, JSX qua esbuild của Vite, không plugin), `react-router` 7, `qrcode`; client API `credentials: include` + CSRF + thử lại; Login, Funnels, Funnel detail (upload, versions, lint, preview + QR, publish, live/rollback, settings), Domains, Audit, Users. Deploy: Worker `ikf-admin-<env>` (static assets, SPA fallback) tại `admin.<zone>`.
- **Demo**: `npm run demo` build SPA và phục vụ ở `http://localhost:8792`, `--admin-user` (mặc định `demo@ikameglobal.com`) đăng nhập không qua Google (`APP_ENV=local`); host `demo.localhost` để publish; e2e Playwright upload → preview → publish → live có `__IKF` → rollback.
- **Infra/CI**: DNS + Worker route `admin.<zone>` (module edge), secret `google-oauth-client-secret`, env `ADMIN_ORIGIN`/`API_ORIGIN`/`GOOGLE_OAUTH_CLIENT_ID`; module core-service từ chối `ADMIN_LOCAL_USER`; workflow `admin.yml`; runbook `docs/runbooks/admin-console.md`; `CLAUDE.md`.

**Tech Stack:** Node.js 22 trên CI (local Node 26) · JavaScript ESM · npm workspaces · Fastify 5 · `pg` 8 · `jose` 6 (mới, core-api) · Vitest ~3.2 · happy-dom 20 · `@testcontainers/postgresql` 11 · React 19 · react-router 7 · Vite 7 (đã có qua Vitest; thêm devDependency gốc + của SPA) · `qrcode` 1.5 · `@testing-library/react` 16 + `@testing-library/dom` 10 · Playwright 1.63 (đã có ở `@ikf/sdk`) · Miniflare 4 · wrangler 4 · Terraform + Cloudflare provider (mock).

**Spec:** `ifunnel/docs/specs/2026-10-11-admin-console-p1-design.md`. Bối cảnh: `ifunnel/docs/specs/2026-10-06-edge-router-publisher-design.md` (publisher, route, domain do Terraform quản lý, preview), `ifunnel/docs/specs/2026-10-09-local-demo-design.md`, `ifunnel/docs/specs/2026-10-11-demo-purchase-design.md`.

**Repo / nhánh / worktree:** repo `/Users/daothinh/ikf-platform`. Nhánh mới **`feat/admin-console-p1`** cắt từ **`feat/demo-purchase`** — đã kiểm với tip **`d47ebdf`** (`fix(demo): stop the tunnel even when the stack fails to stop; README line for cloudflared exiting (fix list 12)`). Code nằm trong worktree mới **`/Users/daothinh/ikf-platform-admin`** (Task 1 tạo; controller có thể đã tạo sẵn — khi đó Task 1 Step 1 chỉ kiểm). **Không bao giờ** đụng working tree `/Users/daothinh/ikf-platform-*` khác (session khác dùng; worktree mới chỉ đọc ref của chúng). Mọi lệnh trong plan chạy từ gốc worktree mới. Quy ước repo: `CLAUDE.md` ở gốc repo.

**Môi trường chạy test (local):**
```bash
cd /Users/daothinh/ikf-platform-admin
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock          # Docker qua colima (colima start)
export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock     # Testcontainers (Postgres)
export TF_PLUGIN_CACHE_DIR=$HOME/.terraform.d/plugin-cache            # Terraform (chỉ mock provider)
```
Demo (Task 14, 16) cần thêm: `docker compose` (README demo), Chromium của Playwright (`~/Library/Caches/ms-playwright`, đã có từ `npm run e2e -w @ikf/sdk`; thiếu thì `npx playwright install chromium`), funnel `ewa-books` ở `~/ikame/funnel/funnel-development/learning/ewa-books/demo.html` (nhánh `funnel` của repo ikame; e2e tự skip nếu thiếu). **`npm run demo:test` không bao giờ chạy song song với một demo test khác** (cổng cố định).

Số test ghi ở mỗi task là số **thật** khi chạy toàn bộ code của plan này trên bản sao `feat/demo-purchase@d47ebdf` (Node 26, colima, 2026-10-11); mỗi khối code / patch trong plan được sinh trực tiếp từ cây đã chạy test đó (trùng từng byte), bước "FAIL" được chạy thật trên cây chưa có phần implement của task. Mốc ban đầu tại `d47ebdf`: core-api **347** (35 file), sdk **159** (11 file, bundle **8154** byte gzip), cli **118** (12 file), edge-router **106** (7 file), event-schema **145**, paddle **31**, route-match **35**, event-consumer **8 + 27**, `npm run demo:test` **105** (17 file); Terraform edge **10**, core-service **5**, stack **11**.

Nếu lúc thực thi `feat/demo-purchase` đã đi xa hơn `d47ebdf`: chạy lại mốc (Task 1 Step 2); số khác thì ghi lại và chỉnh các con số "Expected" theo chênh lệch; patch không áp được thì đọc phần code tương ứng và áp tay đúng nội dung, không sửa gì ngoài phạm vi task. `package-lock.json` không in trong plan: các bước `npm install` sinh nó (phiên bản patch mới hơn trong cùng range là bình thường).

## Điều chỉnh so với spec (phát hiện khi đọc code tại `d47ebdf`, khảo sát 69 `demo.html` trong `funnel-development`, và chạy thử, 2026-10-11)

| # | Spec | Plan làm | Lý do |
|---|---|---|---|
| A1 | `admin_sessions.id TEXT PK ulid` | Cookie = 32 byte ngẫu nhiên (base64url); `admin_sessions.id` = **sha256** của nó | ULID chỉ có 80 bit ngẫu nhiên và lộ thời điểm; lưu hash thì đọc được DB cũng không có phiên sống (như `api_tokens`) |
| A2 | CSRF "double-submit" | Token CSRF ngẫu nhiên lưu trong phiên, trả ở `/v1/auth/me`, so khớp hằng-thời-gian với `X-Ikf-Csrf` ở mọi method trừ GET/HEAD/OPTIONS; sai/thiếu → `403 {error:'csrf'}`; token `ikf_` không cần | Đúng cơ chế spec mô tả (synchronizer token); không cần cookie thứ hai |
| A3 | `req.actor = {kind:'user', email, role}` / `{kind:'token', name, roles}` | Thêm `name` (email hoặc tên token) và `userId` cho người: `{kind:'user', name, email, role, userId}` / `{kind:'token', name, roles}`. Hàm publisher nhận `actor` là chuỗi **hoặc** object (`actorOf`), cột `created_by`/`updated_by`/`actor` lưu `name` | Demo (`demo/lib/funnels.mjs`) và test cũ gọi publisher với chuỗi; không phải sửa chúng |
| A4 | Ánh xạ role: route cũ `['router']`, `['publisher']`, `['admin']` | Như spec cho người (editor ⇒ `publisher`, admin ⇒ mọi role). Token: mọi token hợp lệ thoả `viewer`; route mới khai báo cả role người lẫn role token (`POST /v1/funnels`: `['editor','publisher']`). `PUT /v1/funnels/:slug`: `['router','editor']` (spec: editor; token publisher vẫn **không** được như cũ). `GET /v1/routes/:host`, `GET /v1/apps`: `viewer` (trước: router/publisher, router) | Token giữ đúng nghĩa cũ; người theo bảng quyền spec §3 |
| A5 | `PUT /domains/:host` (editor) "trả hướng dẫn DNS"; `POST /routes/:host/sync` (editor) "kiểm trạng thái Cloudflare"; `GET /domains` có `dns`, `created_at`; màn Domains "Add domain → bản ghi DNS → Check" | `PUT /v1/domains/:host` **giữ admin**, không đổi hành vi (chỉ thêm audit); `POST /v1/routes/:host/sync` giữ nghĩa đồng bộ KV, role `router` (admin). `GET /v1/domains` = `{domains:[{host, status, rev, kv_synced_rev, routes:[{prefix, slug, v}]}]}`. Màn Domains: danh sách + nút **Sync** (admin, khi KV chậm hơn DB) + "Thêm domain" là hướng dẫn Terraform | Spec publisher (quyết định #5, §Dữ liệu): domain là zone khai báo bằng Terraform, "Không tạo domain qua API"; `domains` không có cột DNS/thời điểm; bản ghi DNS do module `funnel-domains` tạo |
| A6 | Hành động audit: … `domain.create`, `domain.sync {status}` … | `domain.sync {host, status}` ở `PUT /v1/domains`; **không** có `domain.create` (không API nào tạo domain). Thêm: `token.create {name, roles}`, `funnel.prices {slug, plans}`, `app.create {id, kind}`, `app.rotate_key {id}`; `route.publish`/`route.rollback` thêm `from_slug` khi đổi funnel. Không audit: webhook resend, `billing/reconcile` (vận hành), `customers/lookup` (đọc). Target: `funnel:<slug>`, `route:<host><prefix>`, `domain:<host>`, `user:<email>`, `token:<name>`, `app:<id>` | "Mọi thao tác đổi dữ liệu có trong Audit" (điều kiện xong); không bao giờ ghi key, secret, giá trị token |
| A7 | `GET /audit?target=&action=&limit=50&before=` | `target=funnel:<slug>` / `domain:<host>` khớp cả dòng route của funnel/host đó (`details.slug` / `details.host`); `action=route` khớp cả họ `route.*`; `before` = `id` (con trỏ), trả `{items, next_before}`; `limit` 1..200 | Màn Audit "lọc theo funnel/host" cần thấy publish/rollback, vốn có target là route |
| A8 | "state ký HMAC, nonce, PKCE" | state, nonce, PKCE verifier, đường dẫn quay lại nằm trong cookie `ikf_oauth` ký HMAC-SHA256 (`HttpOnly; Secure; SameSite=Lax; Path=/v1/auth/google; Max-Age=600`), khoá dẫn từ client secret; callback so `state` với cookie | Verifier không được đi qua URL (cùng chỗ với `code` thì PKCE vô nghĩa); không thêm secret mới |
| A9 | Từ chối: email không trong `admin_users` → `login?error=not_allowed`, log `admin_login_denied {email_hash}` | `not_allowed` cho: `hd` khác, email chưa cấp, người bị khoá. `invalid_token` (chữ ký/`iss`/`aud`/`exp`/`nonce`/`email_verified`), `state` (cookie attempt thiếu/sai/hết hạn), `google` (Google báo lỗi, đổi code thất bại). Audit `auth.login_denied {reason}` chỉ khi Google xác nhận một tài khoản công ty (hd đúng); còn lại chỉ log `admin_login_failed {reason}` | Không ghi email người ngoài công ty vào audit; người dùng thấy thông điệp đúng nguyên nhân |
| A10 | Config: `google-oauth-client-secret`, `GOOGLE_OAUTH_CLIENT_ID`, `ADMIN_ORIGIN` | Thêm env **`API_ORIGIN`** (`https://api.<zone>`, gốc của redirect URI). `ADMIN_ORIGIN`/`API_ORIGIN` phải là origin https (http chỉ khi `APP_ENV=local`). Thiếu một trong 4 → admin tắt (không route `/v1/auth/*`, không CORS), log `admin console disabled, missing: …`, token vẫn chạy | Redirect URI phải cố định đúng như khai báo ở Google; giống cách billing/identity bật khi đủ giá trị |
| A11 | CORS: `https://admin.<zone>` "(và `http://localhost:8792` khi `APP_ENV=local`)"; `--admin-user <email>` | CORS cho đúng `deps.admin.origin` (prod: `ADMIN_ORIGIN`; demo: `http://localhost:<cổng admin>`). Đăng nhập local qua chính `GET /v1/auth/google` (cùng nút trên SPA): tạo/bật lại admin `--admin-user`, tạo phiên, redirect. `--admin-user` mặc định `demo@ikameglobal.com` (SPA luôn có trong `npm run demo`). Demo thêm host **`demo.localhost`** để publish từ console | e2e chạy ở cổng riêng; API từ chối host không có dấu chấm (`localhost`), Chromium đưa `*.localhost` về máy này |
| A12 | `too_large` > 2 MB | **1 MiB** (= `MAX_BUNDLE_BYTES` của publisher). Lint chạy **trước** `validateBundle`: lỗi upload trả `422 lint_failed {errors, warnings}` (thay `413 bundle_too_large`, `422 slug_mismatch` / `media_origin_not_allowed` cho URL tương đối); `validateBundle` vẫn là cổng thứ hai (URL tuyệt đối ngoài `MEDIA_ORIGINS`). `validateBundle` dùng cùng allowlist script với lint (trước: không cho script ngoài nào) | Publisher đã từ chối > 1 MiB; hai ngưỡng khác nhau thì SPA kiểm trước vô nghĩa. Một định dạng lỗi cho SPA/CLI |
| A13 | `lint(html, {slug})`; `no_get_app_hook` "funnel app"; `email_in_url` | `lint(html, {slug, app, mediaOrigins, maxBytes})`. `no_get_app_hook` chỉ khi funnel gắn app `kind = 'app'` (server tra `funnels.app_id`). `email_in_url`: `?email=` / `&email=` / `{email}` / `{{email}}` trong một chuỗi (có `://`, `?`, `&` hoặc `=`) — dạng `URLSearchParams({email})` (witch-power) không bắt được tĩnh. `relative_media` thêm `<link href>` tương đối. Thông điệp tiếng Việt, kèm `line` | Lint tĩnh chỉ thấy chữ; báo cáo khảo sát (Task 6): 10/69 funnel `email_in_url` đều là `{{email}}` FunnelFox thật |
| A14 | `versions.lint_report` lưu kết quả lint | Lưu báo cáo server `{errors, warnings}` + báo cáo CLI cũ dưới `client` (nếu có); audit `version.upload` ghi số đếm `{errors, warnings}` | Không mất kết quả smoke của CLI |
| A15 | Publish "thêm kiểm: version tồn tại, lint không error, host active" | Version tồn tại / host active đã có (`404 version_not_found`, `409 domain_disabled`, `404 domain_not_found`); thêm `409 version_lint_failed {funnel, v, errors:[code]}` (chỉ bản cũ, vì upload có lỗi đã bị chặn) | |
| A16 | Response `GET /funnels` là mảng; `GET /funnels/:slug` `live: [...]` | Bọc object: `{funnels}`, `{domains}`, `{users}`, `{items, next_before}`. `live[]` của `GET /v1/funnels/:slug` có thêm `previous: {slug, v} \| null` (bản rollback sẽ về, theo `route_events` như `rollbackRoute`) | Thêm field không phá client; Rollback dialog phải hiện "v5 → v3" |
| A17 | Users: tạo `{email, name, role}`, đổi role, `disabled_at`; không tự khoá mình | Email phải `@ikameglobal.com` (`400 invalid_email`), chữ thường; trùng → `409 user_exists`. `PUT {role?, name?, disabled?}`; tự khoá **hoặc tự hạ quyền** → `409 cannot_lock_self`; khoá xoá ngay mọi phiên của người đó | Google chỉ cho `hd = ikameglobal.com`; tự hạ quyền admin cũng là tự khoá khỏi Users |
| A18 | "5xx → thông báo kèm request id" | core: `genReqId` = UUID, header `x-request-id` mọi response, CORS `access-control-expose-headers: x-request-id` | Fastify mặc định không trả request id, id dạng `req-1` không duy nhất giữa các task |
| A19 | SPA Vite + React | JSX qua esbuild của Vite (`esbuild.jsx = 'automatic'`, không `@vitejs/plugin-react`); **react-router 7** (8.x đòi Node ≥ 22.22); QR là SVG (`qrcode.toString`); SPA dùng `@ikf/funnel-lint` (kiểm trước size + `CONFIG.funnel`) và `@ikf/route-match` (chuẩn hoá prefix); API base cố định lúc build (`VITE_API_BASE`); giờ hiển thị UTC | Ít dependency; Node 22 trên CI |
| A20 | CI `admin.yml` "sau khi core-api deploy"; `deploy-config` từ chối `ADMIN_LOCAL_USER` | Job deploy chung concurrency `ikf-deploy-<env>` với core/infra và **dừng nếu `GET $API_ORIGIN/v1/auth/me` ≠ 401** (core chưa có admin); `apps/admin/scripts/deploy-config.js` từ chối `ADMIN_LOCAL_USER` và `VITE_API_BASE` không phải origin https. Thêm validation module `core-service` từ chối `ADMIN_LOCAL_USER` trong env task. Worker route + DNS `admin.<zone>` (AAAA `100::` proxied) trong module `edge`; `public/_headers` (frame DENY, nosniff) | Không có cách "chờ workflow khác" đơn giản; kiểm trạng thái thật của core thay thế. Chặn biến local ở cả 4 nơi có thể đưa nó vào môi trường deploy |
| A21 | Dọn phiên "mỗi giờ (worker trong process)" | `startSessionSweep` chạy luôn (không phụ thuộc admin bật), log `admin_sessions_swept {removed}` / `admin_sessions_sweep_failed {code}` (không bao giờ `err.message`) | Phiên còn trong DB dù admin tạm tắt |

## Global Constraints

- Code trong repo `ikf-platform`, nhánh `feat/admin-console-p1`, worktree `/Users/daothinh/ikf-platform-admin`. JavaScript (không TypeScript). HTML funnel **không sửa**.
- **Test cũ giữ nguyên ý nghĩa**: chỉ được sửa đúng các chỗ task nêu (`migrate.test.js` danh sách bảng, `helpers/db.js` TRUNCATE, `entitlement-sync.test.js` thêm `actor`, `config.test.js` khối `admin`, `helpers/pages.js` thêm meta viewport, `publish.test.js` mã lỗi upload theo A12, `cli/test/publish.test.js` trang hợp lệ).
- **Log không email khách, không `user_id`, không `err.message`** (chỉ code). Email người dùng admin được nằm trong `audit_log` (actor, target); trong log chỉ là `email_hash = sha256(lower(email))`.
- Audit không bao giờ chứa key, secret, giá trị token, email khách hay `user_id` khách. Ghi audit **trong transaction của thay đổi** nếu thay đổi có transaction (version, route, pixel, app, domain, funnel, users); thay đổi một câu lệnh (token, prices, apps) ghi ngay sau khi thành công.
- Cookie phiên: `ikf_admin=<32 byte base64url>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`, chỉ cho host `api.<zone>` (không `Domain=`). Phiên 12 giờ từ lần dùng cuối, tối đa 7 ngày từ lúc đăng nhập.
- Quyền: viewer đọc; editor upload, tạo funnel, đặt pixel/app; **chỉ admin** publish, rollback, gỡ route, users, token. Token giữ nguyên nghĩa (`publisher`, `router`, `admin`).
- `ADMIN_LOCAL_USER` (đăng nhập không qua Google) **chỉ `APP_ENV=local`**: `loadConfig` và `buildApp` từ chối khởi động, module Terraform `core-service` và `apps/admin/scripts/deploy-config.js` từ chối.
- Lint: lỗi mức `error` không tạo version (`422 lint_failed`); `@ikf/funnel-lint` không dependency, không Node built-in (chạy trong SPA). Ngưỡng `too_large` = 1 MiB.
- SPA: dependency runtime chỉ `react`, `react-dom`, `react-router`, `qrcode` + 2 workspace (`@ikf/funnel-lint`, `@ikf/route-match`); không UI kit; một file CSS.
- Demo: cổng admin **8792**; e2e dùng cổng riêng `8837/8138/8839/8842` và DB `ikf_admin_test`. Bundle SDK không đổi (**8154** byte gzip).

## Review Focus

1. **Phiên còn sống sau khi người đó bị khoá / hết hạn** (khoá trong Users, xoá khỏi danh sách, phiên quá 7 ngày, cookie cũ sau logout). Test: Task 3 `401 with no cookie, an unknown cookie, an expired session, a disabled person, or only a token`, `a session is extended by 12 hours on use, never past 7 days from sign-in`, `POST /v1/auth/logout deletes the session…`; Task 8 `change a role; disable (their sessions end at once)…`; Task 9 `deletes expired sessions only`.
2. **Trang khác dùng cookie admin để ghi** (thiếu/sai CSRF, origin lạ được CORS, checkout bị đổi CORS). Test: Task 3 `CSRF: a write with the cookie needs X-Ikf-Csrf…`; Task 4 `CORS: only the admin origin, with credentials, on /v1/* (not checkout)…`; Task 10 SPA `403 csrf: reloads /v1/auth/me and retries the write once`.
3. **Đăng nhập giả** (id_token domain khác, aud/iss khác, hết hạn, khoá lạ, nonce cũ, state giả/hết hạn, cookie attempt bị sửa). Test: Task 4 `rejects %s → login?error=%s, no session` (8 dòng), `state: no attempt cookie, a tampered or expired one…`.
4. **Funnel lỗi lên traffic thật** (ảnh tương đối, `email=` trong link app, script ngoài, bản cũ có lỗi lint, editor/viewer bấm publish). Test: Task 6 bảng kịch bản; Task 7 `lint errors → 422 lint_failed…`, `publish checks: … its lint has no errors…`; Task 3 bảng quyền 3 role; Task 12 `editors and viewers see Publish and Rollback greyed out`; Task 14 e2e viewer `403`.
5. **Email/secret lọt ra log hoặc môi trường deploy** (email người đăng nhập bị từ chối, message lỗi mạng, `ADMIN_LOCAL_USER` ở staging/prod). Test: Task 4 `…log only the email hash`, `…expect(logs).not.toContain('network down')`; Task 9 `a failure logs its code only`; Task 3 `buildApp refuses a local admin user when APP_ENV is %s`, `ADMIN_LOCAL_USER: refused unless APP_ENV=local`; Task 15 `rejects_the_local_admin_sign_in`, `refuses ADMIN_LOCAL_USER…`.

## File Structure (repo `ikf-platform`, phần mới/sửa)

```
ikf-platform/
├── package.json                                     # SỬA: workspaces + apps/*, devDependency vite (demo build SPA)
├── .gitignore                                       # SỬA: apps/admin/dist/
├── CLAUDE.md                                        # SỬA: apps/admin, funnel-lint, quy ước audit/role/ADMIN_LOCAL_USER, demo
├── .github/workflows/{admin.yml (mới), core-api.yml, packages.yml, infra.yml}
├── docs/runbooks/admin-console.md                   # MỚI
├── services/core-api/
│   ├── migrations/005_admin.sql                     # MỚI: admin_users, admin_sessions, audit_log
│   ├── Dockerfile, package.json                     # SỬA: jose, @ikf/funnel-lint
│   ├── src/audit.js                                 # MỚI: audit(), actorOf(), listAudit()
│   ├── src/auth.js                                  # SỬA: authenticate (cookie → token), USER_ROLES, requireSession
│   ├── src/app.js, src/config.js, src/server.js     # SỬA: request id, CORS, đăng ký route admin; config admin; adminDeps + sweep
│   ├── src/admin/{sessions,google,setup,cors,users,sweep}.js            # MỚI
│   ├── src/http/{auth,google,catalog,users}.js                          # MỚI
│   ├── src/http/{versions,routes,funnels,domains,tokens,prices,apps}.js # SỬA: lint, role, audit
│   ├── src/publisher/{publish,routes,funnels,validate}.js, src/identity/apps.js   # SỬA: audit, lint check, allowlist
│   ├── src/publisher/catalog.js                     # MỚI: listFunnels, funnelDetail, createFunnel, listDomains
│   └── test/{admin-schema,audit,sessions,google,catalog,upload-lint,users,session-sweep}.test.js, test/helpers/admin.js (mới);
│       sửa test/{migrate,config,publish,validate,entitlement-sync,app}.test.js, test/helpers/{db,pages}.js
├── packages/funnel-lint/{package.json, src/index.js, test/{lint,corpus}.test.js}   # MỚI
├── packages/cli/{package.json, src/{publish,main,api}.js}                          # SỬA: lint trước upload, ikf admin
│   └── test/admin.test.js (mới); test/publish.test.js (sửa)
├── apps/admin/                                      # MỚI (workspace @ikf/admin)
│   ├── package.json, index.html, vite.config.js, wrangler.json, public/_headers
│   ├── scripts/{deploy-config.js, render-config.mjs}
│   ├── src/{main.jsx, App.jsx, Layout.jsx, api.js, auth.jsx, roles.js, config.js, format.js, styles.css}
│   ├── src/pages/{Login,Funnels,FunnelDetail,Domains,Audit,Users}.jsx
│   ├── src/components/{RoleButton,ErrorNote,UploadBox,LintBadge,Qr,FunnelSettings,PublishDialog,RollbackDialog}.jsx
│   └── test/{setup.js, helpers.jsx, api.test.js, auth.test.jsx, role.test.jsx, funnels.test.jsx, publish.test.jsx, pages.test.jsx, deploy-config.test.js}
├── demo/{run.mjs, README.md, lib/{options,stack}.mjs}   # SỬA: --admin-user, SPA 8792, host demo.localhost
│   ├── lib/admin.mjs                                # MỚI: buildAdmin, startAdminServer
│   └── test/{admin-server,admin-e2e}.test.mjs       # MỚI
└── infra/
    ├── modules/edge/{main,variables,outputs}.tf + tests   # SỬA: DNS + Worker route admin.<zone>
    ├── modules/core-service/variables.tf + tests          # SỬA: từ chối ADMIN_LOCAL_USER
    ├── stack/{main,variables,outputs}.tf + tests          # SỬA: secret, env ADMIN_ORIGIN/API_ORIGIN/GOOGLE_OAUTH_CLIENT_ID
    └── envs/{staging,prod}/main.tf                        # SỬA: biến google_oauth_client_id, outputs admin
```

---

### Task 1: Nhánh + worktree; migration `005_admin.sql` (`admin_users`, `admin_sessions`, `audit_log`)

**Files:**
- Create: `services/core-api/migrations/005_admin.sql`
- Test: `services/core-api/test/admin-schema.test.js` (mới); Modify: `services/core-api/test/migrate.test.js`, `services/core-api/test/helpers/db.js`

**Interfaces:**
- Consumes: `migrate(pool)` (`src/db/migrate.js`, áp file `.sql` theo thứ tự tên), `startDb`/`resetDb` (`test/helpers/db.js`).
- Produces: bảng `admin_users (id BIGSERIAL, email TEXT UNIQUE CHECK lower + dạng email, name TEXT DEFAULT '', role IN ('admin','editor','viewer'), disabled_at, created_by, created_at)` — constraint `admin_users_email_key`, `admin_users_email_check`, `admin_users_role_check`; `admin_sessions (id TEXT PK = sha256 cookie, user_id → admin_users ON DELETE CASCADE, csrf, created_at, expires_at, last_seen_at, ip_hash, ua)` + index `admin_sessions_by_expiry (expires_at)`; `audit_log (id BIGSERIAL, at DEFAULT now(), actor, actor_kind IN ('user','token'), action, target, details JSONB DEFAULT '{}')` + index `audit_log_by_target (target, at DESC)`, `audit_log_by_at (at DESC)`. `resetDb` xoá cả 3 bảng.

- [ ] **Step 1: Tạo nhánh + worktree (ghi lại SHA)**

```bash
git -C /Users/daothinh/ikf-platform rev-parse --short feat/demo-purchase
# đã kiểm với d47ebdf; khác thì xem ghi chú ở đầu plan
git -C /Users/daothinh/ikf-platform worktree add -b feat/admin-console-p1 /Users/daothinh/ikf-platform-admin feat/demo-purchase
cd /Users/daothinh/ikf-platform-admin
npm ci
```

Nếu controller đã tạo sẵn worktree: chỉ kiểm `git -C /Users/daothinh/ikf-platform-admin rev-parse --abbrev-ref HEAD` in `feat/admin-console-p1` và `git log -1 --format=%h` là tip của `feat/demo-purchase`, rồi `npm ci`. Không `checkout` trong các worktree khác.

- [ ] **Step 2: Chạy mốc ban đầu**

```bash
npm test -w @ikf/core-api -w @ikf/sdk -w @ikf/cli -w @ikf/edge-router -w @ikf/event-schema 2>&1 | grep -E "Test Files|Tests  |bytes gzip"
```

Expected (tại `d47ebdf`): core-api `35 passed (35)` / `347 passed (347)`, sdk `11` / `159`, cli `12` / `118`, edge-router `7` / `106` (`ikf sdk d1a533c86611: 8154 bytes gzip`), event-schema `145`.

- [ ] **Step 3: Viết test fail**

`services/core-api/test/admin-schema.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';

describe('005_admin schema', () => {
  let db;
  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(() => resetDb(db.pool));

  const user = (email, role = 'editor') =>
    db.pool.query("INSERT INTO admin_users (email, name, role, created_by) VALUES ($1, 'N', $2, 'test') RETURNING id", [email, role]);

  it('admin_users: lowercase unique email, role admin | editor | viewer, enabled by default', async () => {
    const id = (await user('an@ikameglobal.com')).rows[0].id;
    const { rows } = await db.pool.query('SELECT role, disabled_at, created_by, created_at FROM admin_users WHERE id = $1', [id]);
    expect(rows[0]).toMatchObject({ role: 'editor', disabled_at: null, created_by: 'test' });
    expect(rows[0].created_at).toBeInstanceOf(Date);
    await expect(user('an@ikameglobal.com')).rejects.toThrow(/admin_users_email_key/);
    await expect(user('An@ikameglobal.com')).rejects.toThrow(/admin_users_email_check/);
    await expect(user('not-an-email')).rejects.toThrow(/admin_users_email_check/);
    await expect(user('b@ikameglobal.com', 'owner')).rejects.toThrow(/admin_users_role_check/);
  });

  it('admin_sessions: belong to a user and go with it; expires_at is indexed', async () => {
    const id = (await user('an@ikameglobal.com')).rows[0].id;
    await db.pool.query(
      "INSERT INTO admin_sessions (id, user_id, csrf, expires_at) VALUES ('s1', $1, 'c1', now() + interval '12 hours')",
      [id],
    );
    await expect(
      db.pool.query("INSERT INTO admin_sessions (id, user_id, csrf, expires_at) VALUES ('s2', 999, 'c', now())"),
    ).rejects.toThrow(/admin_sessions_user_id_fkey/);
    await db.pool.query('DELETE FROM admin_users WHERE id = $1', [id]);
    expect((await db.pool.query('SELECT count(*)::int AS n FROM admin_sessions')).rows[0].n).toBe(0);
    const idx = await db.pool.query("SELECT indexdef FROM pg_indexes WHERE tablename = 'admin_sessions' AND indexname = 'admin_sessions_by_expiry'");
    expect(idx.rows[0].indexdef).toMatch(/\(expires_at\)/);
  });

  it('audit_log: actor_kind user | token, details default {}, newest-first indexes', async () => {
    const { rows } = await db.pool.query(
      "INSERT INTO audit_log (actor, actor_kind, action, target) VALUES ('ci', 'token', 'route.publish', 'route:a.example/') RETURNING at, details",
    );
    expect(rows[0].details).toEqual({});
    expect(rows[0].at).toBeInstanceOf(Date);
    await expect(
      db.pool.query("INSERT INTO audit_log (actor, actor_kind, action, target) VALUES ('x', 'robot', 'a', 't')"),
    ).rejects.toThrow(/audit_log_actor_kind_check/);
    const idx = await db.pool.query("SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'audit_log' ORDER BY indexname");
    expect(idx.rows.map((r) => r.indexname)).toEqual(['audit_log_by_at', 'audit_log_by_target', 'audit_log_pkey']);
    expect(idx.rows[1].indexdef).toMatch(/\(target, at DESC\)/);
  });
});
```

`services/core-api/test/migrate.test.js` và `services/core-api/test/helpers/db.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/test/helpers/db.js b/services/core-api/test/helpers/db.js
index 20d0d26..89fbf7b 100644
--- a/services/core-api/test/helpers/db.js
+++ b/services/core-api/test/helpers/db.js
@@ -20,6 +20,6 @@ export async function resetDb(pool) {
     `TRUNCATE route_events, routes, host_revs, versions, funnels, domains, api_tokens,
               funnel_prices, checkouts, transactions, subscriptions, customers, webhook_inbox, outbox,
               apps, entitlements, app_links, claim_tokens, otp_codes, magic_links, webhook_deliveries, sync_failures,
-              entitlement_recompute RESTART IDENTITY CASCADE`,
+              entitlement_recompute, admin_sessions, admin_users, audit_log RESTART IDENTITY CASCADE`,
   );
 }
diff --git a/services/core-api/test/migrate.test.js b/services/core-api/test/migrate.test.js
index 16106f5..3ce000b 100644
--- a/services/core-api/test/migrate.test.js
+++ b/services/core-api/test/migrate.test.js
@@ -10,13 +10,13 @@ describe('migrate', () => {
   afterAll(() => db.stop());
 
   it('applies the publisher schema once and is idempotent', async () => {
-    expect(await migrate(db.pool)).toEqual(['001_publisher.sql', '002_funnel_pixel.sql', '003_billing.sql', '004_entitlements.sql']);
+    expect(await migrate(db.pool)).toEqual(['001_publisher.sql', '002_funnel_pixel.sql', '003_billing.sql', '004_entitlements.sql', '005_admin.sql']);
     expect(await migrate(db.pool)).toEqual([]);
     const { rows } = await db.pool.query(
       "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY 1",
     );
     expect(rows.map((r) => r.table_name)).toEqual([
-      'api_tokens', 'app_links', 'apps', 'checkouts', 'claim_tokens', 'customers', 'domains', 'entitlement_recompute', 'entitlements',
+      'admin_sessions', 'admin_users', 'api_tokens', 'app_links', 'apps', 'audit_log', 'checkouts', 'claim_tokens', 'customers', 'domains', 'entitlement_recompute', 'entitlements',
       'funnel_prices', 'funnels', 'host_revs', 'magic_links', 'otp_codes', 'outbox', 'route_events', 'routes',
       'schema_migrations', 'subscriptions', 'sync_failures', 'transactions', 'versions', 'webhook_deliveries', 'webhook_inbox',
     ]);
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/admin-schema.test.js test/migrate.test.js 2>&1 | grep -E "×|Tests  "
```

Expected: 3 test `005_admin schema` FAIL (`TRUNCATE` bảng chưa có) và `migrate > applies the publisher schema once and is idempotent` FAIL; `Tests  4 failed | 4 passed (8)`.

- [ ] **Step 5: Implement**

`services/core-api/migrations/005_admin.sql` (mới):

```sql
-- Admin console (spec admin-console-p1 §2): people who sign in with Google, their sessions, and the audit log.
CREATE TABLE admin_users (
  id          BIGSERIAL PRIMARY KEY,
  email       TEXT NOT NULL CONSTRAINT admin_users_email_key UNIQUE
                CONSTRAINT admin_users_email_check CHECK (email = lower(email) AND email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  name        TEXT NOT NULL DEFAULT '',
  role        TEXT NOT NULL CONSTRAINT admin_users_role_check CHECK (role IN ('admin', 'editor', 'viewer')),
  disabled_at TIMESTAMPTZ NULL,
  created_by  TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- id = sha256 of the cookie value: a database read never yields a live session (like api_tokens).
CREATE TABLE admin_sessions (
  id           TEXT PRIMARY KEY,
  user_id      BIGINT NOT NULL REFERENCES admin_users (id) ON DELETE CASCADE,
  csrf         TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at   TIMESTAMPTZ NOT NULL,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_hash      TEXT NULL,
  ua           TEXT NULL
);
CREATE INDEX admin_sessions_by_expiry ON admin_sessions (expires_at);

-- actor = a person's email or a token's name. Never a buyer's email, a secret or a buyer's user_id.
CREATE TABLE audit_log (
  id         BIGSERIAL PRIMARY KEY,
  at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor      TEXT NOT NULL,
  actor_kind TEXT NOT NULL CONSTRAINT audit_log_actor_kind_check CHECK (actor_kind IN ('user', 'token')),
  action     TEXT NOT NULL,
  target     TEXT NOT NULL,
  details    JSONB NOT NULL DEFAULT '{}'
);
CREATE INDEX audit_log_by_target ON audit_log (target, at DESC);
CREATE INDEX audit_log_by_at ON audit_log (at DESC);
```

- [ ] **Step 6: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/admin-schema.test.js test/migrate.test.js 2>&1 | grep -E "Tests  "
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  8 passed (8)`; toàn bộ core-api `Test Files  36 passed (36)`, `Tests  350 passed (350)`.

- [ ] **Step 7: Commit**

```bash
git add services/core-api
git commit -m "feat(core-api): migration 005 admin_users, admin_sessions, audit_log (admin console)"
```

---

### Task 2: Audit helper + ghi audit ở mọi thao tác đổi dữ liệu hiện có

**Files:**
- Create: `services/core-api/src/audit.js`
- Modify: `services/core-api/src/auth.js` (`req.actor` thành object), `src/publisher/{publish,routes,funnels}.js`, `src/identity/apps.js` (`setFunnelApp`), `src/http/{funnels,domains,tokens,prices,apps}.js`
- Test: `services/core-api/test/audit.test.js` (mới); Modify: `services/core-api/test/entitlement-sync.test.js` (gọi `setFunnelApp` với `actor`)

**Interfaces:**
- Consumes: bảng `audit_log` (Task 1); `withTx(pool, fn)` (`src/identity/link.js`).
- Produces: `actorOf(a)` → `{kind, name, …}` (chuỗi = token); `audit(db, actor, action, target, details = {})` (db = pool hoặc client của transaction); `lintCounts(report)` → `{errors, warnings}` (`src/publisher/publish.js`). `req.actor = {kind: 'token', name, roles}` (Task 3 thêm người). `setFunnelPixel(pool, kv, {slug, pixelId, actor, log})`, `setFunnelApp(pool, {slug, appId, actor})` nhận thêm `actor`. Hành động: `version.upload`, `route.publish`, `route.rollback`, `route.delete`, `domain.sync`, `funnel.pixel`, `funnel.app`, `token.create`, `funnel.prices`, `app.create`, `app.rotate_key`; target `funnel:<slug>`, `route:<host><prefix>`, `domain:<host>`, `token:<name>`, `app:<id>`.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/audit.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, tokenFor, bearer, sha } from './helpers/app.js';
import { fakeSecrets, APP_BODY } from './helpers/identity.js';
import { fakePaddle, PRICE_W1 } from './helpers/paddle.js';
import { funnelHtml } from './helpers/pages.js';

// Spec admin-console-p1 §2: every change, from the CLI (a token) or the web (a person), lands in audit_log.
describe('audit log of changes', () => {
  let db;
  let app;
  let admin;
  let publisher;

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    const paddle = fakePaddle();
    paddle.price(PRICE_W1);
    ({ app } = await makeApp(db.pool, { webhookSecrets: fakeSecrets(), paddle }));
    admin = await tokenFor(db.pool, 'admin');
    publisher = await tokenFor(db.pool, 'publisher');
    await db.pool.query("INSERT INTO domains (host, status) VALUES ('a.example.com', 'active')");
    await db.pool.query("INSERT INTO host_revs (host) VALUES ('a.example.com')");
  });
  afterEach(() => app.close());

  const call = (method, url, payload, token = admin) => app.inject({ method, url, headers: bearer(token), ...(payload && { payload }) });
  const upload = (marker, token = publisher) => {
    const html = funnelHtml('aivideo', marker);
    return call('POST', '/v1/funnels/aivideo/versions', { html, sha256: sha(html) }, token);
  };
  const rows = async () =>
    (await db.pool.query('SELECT actor, actor_kind, action, target, details FROM audit_log ORDER BY id')).rows;

  it('version.upload once per new version (a re-upload of the same html adds nothing), actor = token name', async () => {
    await upload('one');
    await upload('one');
    const html = funnelHtml('aivideo', 'one');
    expect(await rows()).toEqual([
      {
        actor: 'publisher', actor_kind: 'token', action: 'version.upload', target: 'funnel:aivideo',
        details: { slug: 'aivideo', v: 1, sha256: sha(html), lint: { errors: 0, warnings: 0 } },
      },
    ]);
  });

  it('route.publish / route.rollback / route.delete with from_v and to_v; a no-op publish adds nothing', async () => {
    await upload('one');
    await upload('two');
    await call('PUT', '/v1/routes/a.example.com', { prefix: '/', funnel: 'aivideo', v: 1 });
    await call('PUT', '/v1/routes/a.example.com', { prefix: '/', funnel: 'aivideo', v: 2 });
    await call('PUT', '/v1/routes/a.example.com', { prefix: '/', funnel: 'aivideo', v: 2 });
    await call('POST', '/v1/routes/a.example.com/rollback', { prefix: '/' });
    await call('DELETE', '/v1/routes/a.example.com?prefix=/');
    const route = (await rows()).filter((r) => r.action.startsWith('route.'));
    const base = { actor: 'admin', actor_kind: 'token', target: 'route:a.example.com/' };
    const at = { host: 'a.example.com', prefix: '/', slug: 'aivideo' };
    expect(route).toEqual([
      { ...base, action: 'route.publish', details: { ...at, from_v: null, to_v: 1 } },
      { ...base, action: 'route.publish', details: { ...at, from_v: 1, to_v: 2 } },
      { ...base, action: 'route.rollback', details: { ...at, from_v: 2, to_v: 1 } },
      { ...base, action: 'route.delete', details: { ...at, v: 1 } },
    ]);
  });

  it('a publish that moves a route to another funnel records the funnel it left', async () => {
    await upload('one');
    const other = funnelHtml('other-funnel', 'x');
    await call('POST', '/v1/funnels/other-funnel/versions', { html: other, sha256: sha(other) }, publisher);
    await call('PUT', '/v1/routes/a.example.com', { prefix: '/', funnel: 'aivideo', v: 1 });
    await call('PUT', '/v1/routes/a.example.com', { prefix: '/', funnel: 'other-funnel', v: 1, confirm_funnel_change: true });
    expect((await rows()).at(-1).details).toEqual({
      host: 'a.example.com', prefix: '/', slug: 'other-funnel', from_v: 1, from_slug: 'aivideo', to_v: 1,
    });
  });

  it('a failed change writes no audit row', async () => {
    await call('PUT', '/v1/routes/a.example.com', { prefix: '/', funnel: 'aivideo', v: 9 });
    await call('POST', '/v1/routes/a.example.com/rollback', { prefix: '/' });
    expect(await rows()).toEqual([]);
  });

  it('domain.sync, funnel.pixel, funnel.app (only when it changes), token.create', async () => {
    await call('PUT', '/v1/domains/b.example.com', { status: 'disabled' });
    await upload('one');
    await call('PUT', '/v1/funnels/aivideo', { pixel_id: '123456789' });
    await call('POST', '/v1/apps', APP_BODY);
    await call('PUT', '/v1/funnels/aivideo', { app_id: 'starlyn' });
    await call('PUT', '/v1/funnels/aivideo', { app_id: 'starlyn' });
    await call('POST', '/v1/tokens', { name: 'ci', roles: ['publisher'] });
    expect((await rows()).map((r) => [r.action, r.target, r.details])).toEqual([
      ['domain.sync', 'domain:b.example.com', { host: 'b.example.com', status: 'disabled' }],
      ['version.upload', 'funnel:aivideo', expect.objectContaining({ v: 1 })],
      ['funnel.pixel', 'funnel:aivideo', { slug: 'aivideo', pixel_id: '123456789' }],
      ['app.create', 'app:starlyn', { id: 'starlyn', kind: 'app' }],
      ['funnel.app', 'funnel:aivideo', { slug: 'aivideo', app_id: 'starlyn' }],
      ['token.create', 'token:ci', { name: 'ci', roles: ['publisher'] }],
    ]);
  });

  it('funnel.prices names the plans; app.rotate_key; never a key, a secret or a token value', async () => {
    await upload('one');
    await call('PUT', '/v1/funnels/aivideo/prices', { plans: { '1w': { price_id: PRICE_W1 } } });
    const created = (await call('POST', '/v1/apps', APP_BODY)).json();
    const rotated = (await call('POST', '/v1/apps/starlyn/rotate-key')).json();
    const token = (await call('POST', '/v1/tokens', { name: 'ci', roles: ['publisher'] })).json().token;
    const all = await rows();
    expect(all.map((r) => [r.action, r.details])).toEqual([
      ['version.upload', expect.any(Object)],
      ['funnel.prices', { slug: 'aivideo', plans: ['1w'] }],
      ['app.create', { id: 'starlyn', kind: 'app' }],
      ['app.rotate_key', { id: 'starlyn' }],
      ['token.create', { name: 'ci', roles: ['publisher'] }],
    ]);
    const text = JSON.stringify(all);
    for (const secret of [created.api_key, created.webhook_secret, rotated.api_key, token]) expect(text).not.toContain(secret);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/audit.test.js 2>&1 | grep -E "×|Tests  "
```

Expected: `Tests  5 failed | 1 passed (6)` (chỉ `a failed change writes no audit row` pass: chưa có dòng nào).

- [ ] **Step 3: Implement**

`services/core-api/src/audit.js` (mới; Task 5 thêm `listAudit` vào cuối file):

```js
// Audit log (spec admin-console-p1 §2). Rows are written with the caller's client: inside the change's own
// transaction where it has one, so a change and its audit row commit (or roll back) together.

// A publisher function's actor: req.actor ({kind, name, ...}) from HTTP, or a plain name (demo, tests) = a token.
export const actorOf = (a) => (typeof a === 'string' ? { kind: 'token', name: a } : a);

export async function audit(db, actor, action, target, details = {}) {
  const who = actorOf(actor);
  await db.query(
    'INSERT INTO audit_log (actor, actor_kind, action, target, details) VALUES ($1, $2, $3, $4, $5)',
    [who.name, who.kind, action, target, details],
  );
}
```

`req.actor` thành object, publisher + HTTP ghi audit (áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/auth.js b/services/core-api/src/auth.js
index 94934b9..1f8b5c3 100644
--- a/services/core-api/src/auth.js
+++ b/services/core-api/src/auth.js
@@ -29,6 +29,6 @@ export function requireRole(pool, role) {
     if (!roles.includes('admin') && !wanted.some((r) => roles.includes(r))) {
       return reply.code(403).send({ error: 'forbidden' });
     }
-    req.actor = name;
+    req.actor = { kind: 'token', name, roles };
   };
 }
diff --git a/services/core-api/src/http/apps.js b/services/core-api/src/http/apps.js
index e9b61fd..bd8ca4e 100644
--- a/services/core-api/src/http/apps.js
+++ b/services/core-api/src/http/apps.js
@@ -1,3 +1,4 @@
+import { audit } from '../audit.js';
 import { requireRole } from '../auth.js';
 import { HttpError } from '../errors.js';
 import { createApp, listApps, rotateKey } from '../identity/apps.js';
@@ -41,6 +42,7 @@ export default async function appsHttp(app, { pool, webhookSecrets }) {
     },
     async (req, reply) => {
       const out = await createApp(pool, webhookSecrets, req.body);
+      await audit(pool, req.actor, 'app.create', `app:${out.app.id}`, { id: out.app.id, kind: out.app.kind });
       reply.code(201).header('cache-control', 'no-store');
       return out;
     },
@@ -57,7 +59,9 @@ export default async function appsHttp(app, { pool, webhookSecrets }) {
     },
     async (req, reply) => {
       reply.header('cache-control', 'no-store');
-      return rotateKey(pool, req.params.id, { force: req.body?.force === true });
+      const out = await rotateKey(pool, req.params.id, { force: req.body?.force === true });
+      await audit(pool, req.actor, 'app.rotate_key', `app:${req.params.id}`, { id: req.params.id });
+      return out;
     },
   );
 
diff --git a/services/core-api/src/http/domains.js b/services/core-api/src/http/domains.js
index c7aa387..097e26f 100644
--- a/services/core-api/src/http/domains.js
+++ b/services/core-api/src/http/domains.js
@@ -1,4 +1,6 @@
+import { audit } from '../audit.js';
 import { requireRole } from '../auth.js';
+import { withTx } from '../identity/link.js';
 import { hostParams } from './schemas.js';
 
 // Called by scripts/sync-domains.sh after terraform apply; Terraform owns the list of domains.
@@ -15,11 +17,14 @@ export default async function domainsHttp(app, { pool }) {
     async (req) => {
       const { host } = req.params;
       const { status } = req.body;
-      await pool.query(
-        'INSERT INTO domains (host, status) VALUES ($1, $2) ON CONFLICT (host) DO UPDATE SET status = EXCLUDED.status',
-        [host, status],
-      );
-      await pool.query('INSERT INTO host_revs (host) VALUES ($1) ON CONFLICT (host) DO NOTHING', [host]);
+      await withTx(pool, async (c) => {
+        await c.query(
+          'INSERT INTO domains (host, status) VALUES ($1, $2) ON CONFLICT (host) DO UPDATE SET status = EXCLUDED.status',
+          [host, status],
+        );
+        await c.query('INSERT INTO host_revs (host) VALUES ($1) ON CONFLICT (host) DO NOTHING', [host]);
+        await audit(c, req.actor, 'domain.sync', `domain:${host}`, { host, status });
+      });
       return { host, status };
     },
   );
diff --git a/services/core-api/src/http/funnels.js b/services/core-api/src/http/funnels.js
index c018a17..6c19a1c 100644
--- a/services/core-api/src/http/funnels.js
+++ b/services/core-api/src/http/funnels.js
@@ -28,9 +28,9 @@ export default async function funnelsHttp(app, { pool, kv }) {
       const has = (k) => Object.hasOwn(req.body, k);
       if (!has('pixel_id') && !has('app_id')) throw new HttpError(400, 'bad_request', 'pixel_id or app_id required');
       const out = { funnel: req.params.slug };
-      if (has('app_id')) Object.assign(out, await setFunnelApp(pool, { slug: req.params.slug, appId: req.body.app_id }));
+      if (has('app_id')) Object.assign(out, await setFunnelApp(pool, { slug: req.params.slug, appId: req.body.app_id, actor: req.actor }));
       if (has('pixel_id')) {
-        Object.assign(out, await setFunnelPixel(pool, kv, { slug: req.params.slug, pixelId: req.body.pixel_id, log: req.log }));
+        Object.assign(out, await setFunnelPixel(pool, kv, { slug: req.params.slug, pixelId: req.body.pixel_id, actor: req.actor, log: req.log }));
       }
       return out;
     },
diff --git a/services/core-api/src/http/prices.js b/services/core-api/src/http/prices.js
index 478ff11..461d5f2 100644
--- a/services/core-api/src/http/prices.js
+++ b/services/core-api/src/http/prices.js
@@ -1,3 +1,4 @@
+import { audit } from '../audit.js';
 import { requireRole } from '../auth.js';
 import { listFunnelPrices, setFunnelPrices } from '../billing/prices.js';
 
@@ -46,7 +47,12 @@ export default async function pricesHttp(app, { pool, paddle, alarm }) {
         },
       },
     },
-    async (req) => setFunnelPrices(pool, paddle, { slug: req.params.slug, plans: req.body.plans, actor: req.actor, log: req.log, alarm }),
+    async (req) => {
+      const { slug } = req.params;
+      const out = await setFunnelPrices(pool, paddle, { slug, plans: req.body.plans, actor: req.actor.name, log: req.log, alarm });
+      await audit(pool, req.actor, 'funnel.prices', `funnel:${slug}`, { slug, plans: Object.keys(req.body.plans) });
+      return out;
+    },
   );
 
   app.get('/v1/funnels/:slug/prices', { onRequest: requireRole(pool, ['router', 'publisher']), schema: { params } }, async (req) =>
diff --git a/services/core-api/src/http/tokens.js b/services/core-api/src/http/tokens.js
index 77e8d05..fb7eec2 100644
--- a/services/core-api/src/http/tokens.js
+++ b/services/core-api/src/http/tokens.js
@@ -1,3 +1,4 @@
+import { audit } from '../audit.js';
 import { ROLES, createToken, requireRole } from '../auth.js';
 import { HttpError } from '../errors.js';
 
@@ -21,6 +22,7 @@ export default async function tokensHttp(app, { pool }) {
       const { name, roles } = req.body;
       if (!roles.every((r) => ROLES.includes(r))) throw new HttpError(400, 'invalid_roles', { allowed: ROLES });
       const token = await createToken(pool, { name, roles });
+      await audit(pool, req.actor, 'token.create', `token:${name}`, { name, roles });
       reply.code(201);
       return { name, roles, token };
     },
diff --git a/services/core-api/src/identity/apps.js b/services/core-api/src/identity/apps.js
index 9fb00c1..a1353e7 100644
--- a/services/core-api/src/identity/apps.js
+++ b/services/core-api/src/identity/apps.js
@@ -1,3 +1,4 @@
+import { audit } from '../audit.js';
 import { HttpError } from '../errors.js';
 import { queueFunnelRecompute } from './entitlements.js';
 import { withTx } from './link.js';
@@ -130,7 +131,7 @@ export function requireApp(pool) {
 // PUT /v1/funnels/:slug {app_id}: which app a funnel's buyers get entitlements in (null = none). A real
 // change queues the funnel's existing buyers for a recompute in the same transaction (ruling F2), so buyers
 // from before the attach get their entitlements (and can restore by email) without a new billing event.
-export async function setFunnelApp(pool, { slug, appId }) {
+export async function setFunnelApp(pool, { slug, appId, actor }) {
   return withTx(pool, async (c) => {
     const { rows } = await c.query('SELECT id, app_id FROM funnels WHERE slug = $1 FOR NO KEY UPDATE', [slug]);
     if (!rows.length) throw new HttpError(404, 'funnel_not_found', { funnel: slug });
@@ -142,6 +143,7 @@ export async function setFunnelApp(pool, { slug, appId }) {
       throw err;
     }
     await queueFunnelRecompute(c, rows[0].id);
+    await audit(c, actor, 'funnel.app', `funnel:${slug}`, { slug, app_id: appId });
     return { funnel: slug, app_id: appId };
   });
 }
diff --git a/services/core-api/src/publisher/funnels.js b/services/core-api/src/publisher/funnels.js
index d82482d..37b25f9 100644
--- a/services/core-api/src/publisher/funnels.js
+++ b/services/core-api/src/publisher/funnels.js
@@ -1,3 +1,4 @@
+import { audit } from '../audit.js';
 import { HttpError } from '../errors.js';
 import { PROPAGATION_SECONDS, syncHost } from './routes.js';
 
@@ -5,7 +6,7 @@ export const PIXEL_RE = /^[0-9]{6,20}$/;
 
 // Saves the pixel, bumps rev on every host routing to any version of the funnel (so the resync
 // job re-projects them if KV fails now), then re-projects those hosts.
-export async function setFunnelPixel(pool, kv, { slug, pixelId, log }) {
+export async function setFunnelPixel(pool, kv, { slug, pixelId, actor, log }) {
   if (pixelId !== null && !PIXEL_RE.test(pixelId)) throw new HttpError(400, 'invalid_pixel_id', { pixel_id: pixelId });
   const c = await pool.connect();
   let hosts;
@@ -13,6 +14,7 @@ export async function setFunnelPixel(pool, kv, { slug, pixelId, log }) {
     await c.query('BEGIN');
     const f = await c.query('UPDATE funnels SET pixel_id = $2 WHERE slug = $1 RETURNING id', [slug, pixelId]);
     if (!f.rows.length) throw new HttpError(404, 'funnel_not_found', { funnel: slug });
+    await audit(c, actor, 'funnel.pixel', `funnel:${slug}`, { slug, pixel_id: pixelId });
     hosts = (
       await c.query(
         `SELECT DISTINCT r.host FROM routes r JOIN versions v ON v.id = r.version_id
diff --git a/services/core-api/src/publisher/publish.js b/services/core-api/src/publisher/publish.js
index 6280567..83394f3 100644
--- a/services/core-api/src/publisher/publish.js
+++ b/services/core-api/src/publisher/publish.js
@@ -1,17 +1,24 @@
 import { createHash } from 'node:crypto';
+import { actorOf, audit } from '../audit.js';
 import { HttpError } from '../errors.js';
 import { StoreUnavailableError } from './bundle-store.js';
 
 export const sha256Hex = (s) => createHash('sha256').update(s).digest('hex');
 export const bundleKey = (slug, n) => `bundles/${slug}/v${n}/index.html`;
+// A lint report as counts (old CLI reports have no errors/warnings lists: 0).
+export const lintCounts = (r) => ({
+  errors: Array.isArray(r?.errors) ? r.errors.length : 0,
+  warnings: Array.isArray(r?.warnings) ? r.warnings.length : 0,
+});
 
 export async function publishVersion({ pool, store, previewBaseUrl }, { slug, html, lintReport = {}, actor }) {
+  const who = actorOf(actor);
   const sha256 = sha256Hex(html);
   const result = (v, created) => ({ funnel: slug, v, sha256, created, previewUrl: `${previewBaseUrl}/${slug}/v${v}` });
   const client = await pool.connect();
   try {
     await client.query('BEGIN');
-    await client.query('INSERT INTO funnels (slug, created_by) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING', [slug, actor]);
+    await client.query('INSERT INTO funnels (slug, created_by) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING', [slug, who.name]);
     // The row lock serializes publishes of one funnel: n is allocated once and no two R2 writes race.
     const funnelId = (await client.query('SELECT id FROM funnels WHERE slug = $1 FOR UPDATE', [slug])).rows[0].id;
     const latest = (
@@ -33,8 +40,9 @@ export async function publishVersion({ pool, store, previewBaseUrl }, { slug, ht
     await client.query(
       `INSERT INTO versions (funnel_id, n, sha256, r2_key, size, lint_report, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
-      [funnelId, n, sha256, key, Buffer.byteLength(html, 'utf8'), lintReport, actor],
+      [funnelId, n, sha256, key, Buffer.byteLength(html, 'utf8'), lintReport, who.name],
     );
+    await audit(client, who, 'version.upload', `funnel:${slug}`, { slug, v: n, sha256, lint: lintCounts(lintReport) });
     await client.query('COMMIT');
     return result(n, true);
   } catch (err) {
diff --git a/services/core-api/src/publisher/routes.js b/services/core-api/src/publisher/routes.js
index fb2b8bc..f006cba 100644
--- a/services/core-api/src/publisher/routes.js
+++ b/services/core-api/src/publisher/routes.js
@@ -1,4 +1,5 @@
 import { isValidPrefix, normalizePath, sortRoutes } from '@ikf/route-match';
+import { actorOf, audit } from '../audit.js';
 import { HttpError } from '../errors.js';
 import { routeKey } from './route-kv.js';
 
@@ -52,6 +53,7 @@ async function trySync(pool, kv, host, log) {
 
 export async function setRoute(pool, kv, { host, prefix, slug, v, actor, confirmFunnelChange = false, log }) {
   const p = checkPrefix(prefix);
+  const who = actorOf(actor);
   const out = await inHostTx(pool, host, {}, async (c) => {
     const ver = (
       await c.query('SELECT v.id FROM versions v JOIN funnels f ON f.id = v.funnel_id WHERE f.slug = $1 AND v.n = $2', [slug, v])
@@ -66,12 +68,15 @@ export async function setRoute(pool, kv, { host, prefix, slug, v, actor, confirm
         `INSERT INTO routes (host, path_prefix, version_id, updated_by) VALUES ($1, $2, $3, $4)
          ON CONFLICT (host, path_prefix)
          DO UPDATE SET version_id = EXCLUDED.version_id, updated_by = EXCLUDED.updated_by, updated_at = now()`,
-        [host, p, ver.id, actor],
+        [host, p, ver.id, who.name],
       );
       await c.query(
         'INSERT INTO route_events (host, path_prefix, from_version, to_version, actor) VALUES ($1, $2, $3, $4, $5)',
-        [host, p, cur?.version_id ?? null, ver.id, actor],
+        [host, p, cur?.version_id ?? null, ver.id, who.name],
       );
+      await audit(c, who, 'route.publish', `route:${host}${p}`, {
+        host, prefix: p, slug, from_v: cur?.n ?? null, ...(cur && cur.slug !== slug && { from_slug: cur.slug }), to_v: v,
+      });
     }
     return { host, prefix: p, funnel: slug, v };
   });
@@ -80,6 +85,7 @@ export async function setRoute(pool, kv, { host, prefix, slug, v, actor, confirm
 
 export async function rollbackRoute(pool, kv, { host, prefix, actor, log }) {
   const p = checkPrefix(prefix);
+  const who = actorOf(actor);
   const out = await inHostTx(pool, host, {}, async (c) => {
     const cur = await currentRoute(c, host, p);
     if (!cur) throw new HttpError(404, 'route_not_found', { host, prefix: p });
@@ -91,15 +97,18 @@ export async function rollbackRoute(pool, kv, { host, prefix, actor, log }) {
     ).rows[0];
     if (!last?.from_version) throw new HttpError(409, 'no_previous_version', { host, prefix: p });
     await c.query('UPDATE routes SET version_id = $3, updated_by = $4, updated_at = now() WHERE host = $1 AND path_prefix = $2', [
-      host, p, last.from_version, actor,
+      host, p, last.from_version, who.name,
     ]);
     await c.query(
       'INSERT INTO route_events (host, path_prefix, from_version, to_version, actor) VALUES ($1, $2, $3, $4, $5)',
-      [host, p, cur.version_id, last.from_version, actor],
+      [host, p, cur.version_id, last.from_version, who.name],
     );
     const to = (
       await c.query('SELECT f.slug, v.n FROM versions v JOIN funnels f ON f.id = v.funnel_id WHERE v.id = $1', [last.from_version])
     ).rows[0];
+    await audit(c, who, 'route.rollback', `route:${host}${p}`, {
+      host, prefix: p, slug: to.slug, from_v: cur.n, ...(cur.slug !== to.slug && { from_slug: cur.slug }), to_v: to.n,
+    });
     return { host, prefix: p, funnel: to.slug, v: to.n };
   });
   return { ...out, ...(await trySync(pool, kv, host, log)) };
@@ -107,14 +116,16 @@ export async function rollbackRoute(pool, kv, { host, prefix, actor, log }) {
 
 export async function removeRoute(pool, kv, { host, prefix, actor, log }) {
   const p = checkPrefix(prefix);
+  const who = actorOf(actor);
   const out = await inHostTx(pool, host, { allowDisabled: true }, async (c) => {
     const cur = await currentRoute(c, host, p);
     if (!cur) throw new HttpError(404, 'route_not_found', { host, prefix: p });
     await c.query('DELETE FROM routes WHERE host = $1 AND path_prefix = $2', [host, p]);
     await c.query(
       'INSERT INTO route_events (host, path_prefix, from_version, to_version, actor) VALUES ($1, $2, $3, NULL, $4)',
-      [host, p, cur.version_id, actor],
+      [host, p, cur.version_id, who.name],
     );
+    await audit(c, who, 'route.delete', `route:${host}${p}`, { host, prefix: p, slug: cur.slug, v: cur.n });
     return { host, prefix: p, funnel: cur.slug, v: cur.n };
   });
   return { ...out, ...(await trySync(pool, kv, host, log)) };
PATCH
```

`setFunnelApp` giờ cần `actor` (test cũ gọi thẳng hàm):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/test/entitlement-sync.test.js b/services/core-api/test/entitlement-sync.test.js
index 167ec3d..11449e8 100644
--- a/services/core-api/test/entitlement-sync.test.js
+++ b/services/core-api/test/entitlement-sync.test.js
@@ -328,7 +328,7 @@ describe('entitlement-sync', () => {
 
   describe('F2: backfill when a funnel gets an app or a plan changes its key', () => {
     const queued = async () => (await q('SELECT customer_id::int AS id FROM entitlement_recompute ORDER BY 1')).map((r) => r.id);
-    const attach = (appId) => setFunnelApp(db.pool, { slug: 'witch-power', appId });
+    const attach = (appId) => setFunnelApp(db.pool, { slug: 'witch-power', appId, actor: 'test' });
 
     it('a buyer from before the attach gets entitlements, a linked user is notified, OTP restore works; no claim token or email', async () => {
       await db.pool.query('UPDATE funnels SET app_id = NULL');
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/audit.test.js 2>&1 | grep -E "Tests  "
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  6 passed (6)`; toàn bộ `Test Files  37 passed (37)`, `Tests  356 passed (356)` (`prices.test.js` vẫn thấy `updated_by: 'router'` vì route truyền `req.actor.name`).

- [ ] **Step 5: Commit**

```bash
git add services/core-api
git commit -m "feat(core-api): audit log for every change (versions, routes, domains, pixel, app, tokens, prices, apps)"
```

---

### Task 3: Phiên + CSRF + `requireRole` (cookie → token, role người) + `/v1/auth/me`, `/v1/auth/logout`, đăng nhập local

**Files:**
- Create: `services/core-api/src/admin/sessions.js`, `src/admin/users.js` (chỉ `ensureLocalAdmin`; Task 8 thay cả file), `src/http/auth.js`
- Modify: `services/core-api/src/auth.js` (thay toàn bộ), `src/app.js`, `src/config.js`, `src/http/{routes,funnels,apps}.js` (role)
- Test: `services/core-api/test/sessions.test.js`, `test/helpers/admin.js` (mới); Modify: `services/core-api/test/config.test.js`

**Interfaces:**
- Consumes: `admin_users`, `admin_sessions` (Task 1); `audit` (Task 2).
- Produces:
  - `src/admin/sessions.js`: `SESSION_COOKIE = 'ikf_admin'`, `SESSION_HOURS = 12`, `SESSION_MAX_DAYS = 7`, `sha256(s)`, `readCookie(header, name)`, `sameSecret(a, b)`, `sessionCookie(token)`, `clearedSessionCookie()`, `createSession(db, {userId, ip, ua})` → `{token, csrf}`, `touchSession(db, token)` → `{csrf, userId, email, name, role} | null` (gia hạn), `endSession(db, token)`.
  - `src/auth.js`: `ROLES` (token), `USER_ROLES = ['viewer','editor','admin']`, `authenticate(pool, req)` → `{actor, grants, session?} | {status, error}`, `requireRole(pool, roles)` (đặt `req.actor`, `req.session`), `requireSession(pool)`.
  - `req.actor` người: `{kind: 'user', name: email, email, role, userId}`; `req.session`: `{csrf, userId, email, name, role, token}`.
  - `buildApp({deps: {admin: {appEnv, origin, localUser?}}})`: đăng ký `src/http/auth.js` (`GET /v1/auth/me`, `POST /v1/auth/logout`, và `GET /v1/auth/google` local khi có `localUser`); ném lỗi nếu `localUser` mà `appEnv !== 'local'`. `safeReturn(path)` (`src/http/auth.js`).
  - `loadConfig(env).admin = {appEnv, localUser}`; ném lỗi khi `ADMIN_LOCAL_USER` mà `APP_ENV !== 'local'`.
  - `ensureLocalAdmin(db, email)` → `{id, email, name, role}`.
  - Test helper `signIn(pool, email, role)` → `{id, token, cookie, csrf, headers(write = true)}`, `ADMIN_ORIGIN`.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/helpers/admin.js` (mới):

```js
import { createSession, SESSION_COOKIE } from '../../src/admin/sessions.js';

export const ADMIN_ORIGIN = 'https://admin.ikf-staging.example';

// An enabled person with this role and a fresh session: {id, cookie, csrf, headers(write?)}.
export async function signIn(pool, email, role) {
  const { rows } = await pool.query(
    "INSERT INTO admin_users (email, name, role, created_by) VALUES ($1, $2, $3, 'test') RETURNING id",
    [email, email.split('@')[0], role],
  );
  const id = Number(rows[0].id);
  const { token, csrf } = await createSession(pool, { userId: id });
  const cookie = `${SESSION_COOKIE}=${token}`;
  return { id, token, cookie, csrf, headers: (write = true) => ({ cookie, ...(write && { 'x-ikf-csrf': csrf }) }) };
}
```

`services/core-api/test/sessions.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, tokenFor, bearer, sha, seedVersions } from './helpers/app.js';
import { ADMIN_ORIGIN, signIn } from './helpers/admin.js';
import { fakeSecrets } from './helpers/identity.js';
import { funnelHtml } from './helpers/pages.js';
import { buildApp } from '../src/app.js';

describe('admin console sessions, CSRF and roles', () => {
  let db;
  let app;
  let store;

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    ({ app, store } = await makeApp(db.pool, { admin: { origin: ADMIN_ORIGIN, appEnv: 'staging' }, webhookSecrets: fakeSecrets() }));
    await db.pool.query("INSERT INTO domains (host, status) VALUES ('a.example.com', 'active')");
    await db.pool.query("INSERT INTO host_revs (host) VALUES ('a.example.com')");
  });
  afterEach(() => app.close());

  const me = (headers) => app.inject({ method: 'GET', url: '/v1/auth/me', headers });

  it('GET /v1/auth/me: the signed-in person and the CSRF token, never cached', async () => {
    const an = await signIn(db.pool, 'an@ikameglobal.com', 'editor');
    const res = await me(an.headers(false));
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ email: 'an@ikameglobal.com', name: 'an', role: 'editor', csrf: an.csrf });
    expect(res.headers['cache-control']).toBe('no-store');
  });

  it('401 with no cookie, an unknown cookie, an expired session, a disabled person, or only a token', async () => {
    const an = await signIn(db.pool, 'an@ikameglobal.com', 'admin');
    expect((await me({})).statusCode).toBe(401);
    expect((await me({ cookie: 'ikf_admin=nope' })).json()).toEqual({ error: 'unauthorized' });
    expect((await me(bearer(await tokenFor(db.pool, 'admin')))).statusCode).toBe(401);
    await db.pool.query("UPDATE admin_users SET disabled_at = now() WHERE id = $1", [an.id]);
    expect((await me(an.headers(false))).statusCode).toBe(401);
    await db.pool.query('UPDATE admin_users SET disabled_at = NULL WHERE id = $1', [an.id]);
    expect((await me(an.headers(false))).statusCode).toBe(200);
    await db.pool.query("UPDATE admin_sessions SET expires_at = now() - interval '1 second'");
    expect((await me(an.headers(false))).statusCode).toBe(401);
  });

  it('a session is extended by 12 hours on use, never past 7 days from sign-in', async () => {
    const an = await signIn(db.pool, 'an@ikameglobal.com', 'viewer');
    const hoursLeft = async () =>
      Number((await db.pool.query('SELECT extract(epoch FROM expires_at - now()) / 3600 AS h FROM admin_sessions')).rows[0].h);
    await db.pool.query("UPDATE admin_sessions SET expires_at = now() + interval '1 hour'");
    await me(an.headers(false));
    expect(await hoursLeft()).toBeCloseTo(12, 1);
    await db.pool.query("UPDATE admin_sessions SET created_at = now() - interval '6 days 22 hours'");
    await me(an.headers(false));
    expect(await hoursLeft()).toBeCloseTo(2, 1);
    await db.pool.query("UPDATE admin_sessions SET created_at = now() - interval '7 days', expires_at = now() + interval '1 minute'");
    await me(an.headers(false));
    expect(await hoursLeft()).toBeLessThanOrEqual(0);
    expect((await me(an.headers(false))).statusCode).toBe(401);
  });

  it('POST /v1/auth/logout deletes the session and clears the cookie', async () => {
    const an = await signIn(db.pool, 'an@ikameglobal.com', 'viewer');
    const res = await app.inject({ method: 'POST', url: '/v1/auth/logout', headers: an.headers() });
    expect(res.statusCode).toBe(204);
    expect(res.headers['set-cookie']).toBe('ikf_admin=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
    expect((await db.pool.query('SELECT count(*)::int AS n FROM admin_sessions')).rows[0].n).toBe(0);
    expect((await me(an.headers(false))).statusCode).toBe(401);
  });

  it('CSRF: a write with the cookie needs X-Ikf-Csrf (missing or wrong → 403 csrf); reads and tokens do not', async () => {
    const an = await signIn(db.pool, 'an@ikameglobal.com', 'editor');
    await seedVersions(db.pool, store, 'aivideo', 1);
    const pixel = (headers) => app.inject({ method: 'PUT', url: '/v1/funnels/aivideo', headers, payload: { pixel_id: '123456' } });
    expect((await pixel({ cookie: an.cookie })).json()).toEqual({ error: 'csrf' });
    expect((await pixel({ cookie: an.cookie, 'x-ikf-csrf': `${an.csrf}x` })).statusCode).toBe(403);
    expect((await pixel({ cookie: an.cookie, 'x-ikf-csrf': an.csrf })).statusCode).toBe(200);
    expect((await app.inject({ method: 'GET', url: '/v1/routes/a.example.com', headers: { cookie: an.cookie } })).statusCode).toBe(200);
    expect((await pixel(bearer(await tokenFor(db.pool, 'router')))).statusCode).toBe(200);
    const logout = await app.inject({ method: 'POST', url: '/v1/auth/logout', headers: { cookie: an.cookie } });
    expect(logout.json()).toEqual({ error: 'csrf' });
  });

  // Spec §3: viewer reads; editor uploads, sets pixel/app; only admin publishes, rolls back, issues tokens.
  it.each([
    ['viewer', [200, 403, 403, 403, 403]],
    ['editor', [200, 201, 200, 403, 403]],
    ['admin', [200, 201, 200, 200, 201]],
  ])('%s: read routes, upload, set pixel, publish, issue a token → %j', async (role, codes) => {
    const p = await signIn(db.pool, `${role}@ikameglobal.com`, role);
    await seedVersions(db.pool, store, 'aivideo', 1);
    const html = funnelHtml('aivideo', 'two');
    const got = [
      await app.inject({ method: 'GET', url: '/v1/routes/a.example.com', headers: p.headers(false) }),
      await app.inject({ method: 'POST', url: '/v1/funnels/aivideo/versions', headers: p.headers(), payload: { html, sha256: sha(html) } }),
      await app.inject({ method: 'PUT', url: '/v1/funnels/aivideo', headers: p.headers(), payload: { pixel_id: '123456' } }),
      await app.inject({ method: 'PUT', url: '/v1/routes/a.example.com', headers: p.headers(), payload: { prefix: '/', funnel: 'aivideo', v: 1 } }),
      await app.inject({ method: 'POST', url: '/v1/tokens', headers: p.headers(), payload: { name: 'ci', roles: ['publisher'] } }),
    ].map((r) => r.statusCode);
    expect(got).toEqual(codes);
  });

  it('a person is the actor: created_by, route updated_by and the audit row carry the email, kind user', async () => {
    const boss = await signIn(db.pool, 'boss@ikameglobal.com', 'admin');
    const html = funnelHtml('aivideo', 'one');
    await app.inject({ method: 'POST', url: '/v1/funnels/aivideo/versions', headers: boss.headers(), payload: { html, sha256: sha(html) } });
    await app.inject({ method: 'PUT', url: '/v1/routes/a.example.com', headers: boss.headers(), payload: { prefix: '/', funnel: 'aivideo', v: 1 } });
    expect((await db.pool.query('SELECT created_by FROM versions')).rows[0].created_by).toBe('boss@ikameglobal.com');
    expect((await db.pool.query('SELECT updated_by FROM routes')).rows[0].updated_by).toBe('boss@ikameglobal.com');
    const { rows } = await db.pool.query('SELECT DISTINCT actor, actor_kind FROM audit_log');
    expect(rows).toEqual([{ actor: 'boss@ikameglobal.com', actor_kind: 'user' }]);
  });

  it('tokens keep their meaning: publisher uploads but cannot set a pixel or publish; any token reads routes and apps', async () => {
    const publisher = await tokenFor(db.pool, 'publisher');
    await seedVersions(db.pool, store, 'aivideo', 1);
    const put = (url, payload) => app.inject({ method: 'PUT', url, headers: bearer(publisher), payload });
    expect((await put('/v1/funnels/aivideo', { pixel_id: '123456' })).statusCode).toBe(403);
    expect((await put('/v1/routes/a.example.com', { prefix: '/', funnel: 'aivideo', v: 1 })).statusCode).toBe(403);
    expect((await app.inject({ method: 'GET', url: '/v1/routes/a.example.com', headers: bearer(publisher) })).statusCode).toBe(200);
    expect((await app.inject({ method: 'GET', url: '/v1/apps', headers: bearer(publisher) })).statusCode).toBe(200);
  });
});

describe('local sign-in (ADMIN_LOCAL_USER, npm run demo --admin-user)', () => {
  let db;
  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(() => resetDb(db.pool));

  it('GET /v1/auth/google signs the local admin in without Google and returns to the admin app', async () => {
    const { app } = await makeApp(db.pool, { admin: { origin: 'http://localhost:8792', appEnv: 'local', localUser: 'Dev@ikameglobal.com' } });
    const res = await app.inject({ method: 'GET', url: '/v1/auth/google?return=/funnels/aivideo' });
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('http://localhost:8792/funnels/aivideo');
    expect(res.headers['set-cookie']).toMatch(/^ikf_admin=[A-Za-z0-9_-]{43}; HttpOnly; Secure; SameSite=Lax; Path=\/; Max-Age=604800$/);
    const cookie = res.headers['set-cookie'].split(';')[0];
    expect((await app.inject({ method: 'GET', url: '/v1/auth/me', headers: { cookie } })).json()).toMatchObject({ email: 'dev@ikameglobal.com', role: 'admin' });
    const evil = await app.inject({ method: 'GET', url: '/v1/auth/google?return=//evil.example/x' });
    expect(evil.headers.location).toBe('http://localhost:8792/');
    const { rows } = await db.pool.query('SELECT actor, actor_kind, action, details FROM audit_log ORDER BY id LIMIT 1');
    expect(rows[0]).toEqual({ actor: 'dev@ikameglobal.com', actor_kind: 'user', action: 'auth.login', details: { method: 'local' } });
    await app.close();
  });

  it.each(['staging', 'prod', undefined])('buildApp refuses a local admin user when APP_ENV is %s', (appEnv) => {
    expect(() => buildApp({ deps: { pool: db.pool, admin: { origin: ADMIN_ORIGIN, appEnv, localUser: 'dev@ikameglobal.com' } } })).toThrow(
      'admin.localUser is for APP_ENV=local only',
    );
  });
});
```

`services/core-api/test/config.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/test/config.test.js b/services/core-api/test/config.test.js
index ea29632..394943e 100644
--- a/services/core-api/test/config.test.js
+++ b/services/core-api/test/config.test.js
@@ -36,6 +36,18 @@ describe('loadConfig', () => {
         secretsPrefix: 'ikf/staging/',
         alarmTopicArn: 'arn:aws:sns:us-east-1:111111111111:ikf-staging-alarms',
       },
+      admin: { appEnv: 'staging', localUser: null },
+    });
+  });
+
+  // Spec admin-console-p1 §1: the demo's sign-in without Google never starts outside APP_ENV=local.
+  it('ADMIN_LOCAL_USER: refused unless APP_ENV=local', () => {
+    for (const APP_ENV of ['staging', 'prod', undefined]) {
+      const env = { ...ENV, APP_ENV, PADDLE_ENV: APP_ENV === 'prod' ? 'live' : 'sandbox', ADMIN_LOCAL_USER: 'dev@ikameglobal.com' };
+      expect(() => loadConfig(env)).toThrow('ADMIN_LOCAL_USER is for APP_ENV=local only; unset it');
+    }
+    expect(loadConfig({ ...ENV, APP_ENV: 'local', ADMIN_LOCAL_USER: 'dev@ikameglobal.com' }).admin).toEqual({
+      appEnv: 'local', localUser: 'dev@ikameglobal.com',
     });
   });
 
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/sessions.test.js test/config.test.js 2>&1 | grep -E "FAIL|Test Files|Tests  "
```

Expected: `test/sessions.test.js` FAIL khi import (`src/admin/sessions.js` chưa có); config `parses the environment` và `ADMIN_LOCAL_USER: refused unless APP_ENV=local` FAIL; `Tests  2 failed | 7 passed (9)`.

- [ ] **Step 3: Implement**

`services/core-api/src/admin/sessions.js` (mới):

```js
// Admin console sessions (spec admin-console-p1 §1): a random cookie value for api.<zone>; the database keeps
// only its sha256. A session lasts 12 hours from its last use, never more than 7 days from sign-in.
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'ikf_admin';
export const SESSION_HOURS = 12;
export const SESSION_MAX_DAYS = 7;

export const sha256 = (s) => createHash('sha256').update(s).digest('hex');

export function readCookie(header, name) {
  for (const part of (header ?? '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim() || null;
  }
  return null;
}

// Both strings, same length, same bytes; never throws.
export function sameSecret(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export const sessionCookie = (token) =>
  `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_MAX_DAYS * 86400}`;
export const clearedSessionCookie = () => `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;

export async function createSession(db, { userId, ip = null, ua = null }) {
  const token = randomBytes(32).toString('base64url');
  const csrf = randomBytes(24).toString('base64url');
  await db.query(
    `INSERT INTO admin_sessions (id, user_id, csrf, expires_at, ip_hash, ua)
     VALUES ($1, $2, $3, now() + make_interval(hours => $4), $5, $6)`,
    [sha256(token), userId, csrf, SESSION_HOURS, ip ? sha256(ip) : null, ua ? ua.slice(0, 200) : null],
  );
  return { token, csrf };
}

// The live session behind a cookie value (extended on use), or null: unknown, expired, or its user disabled.
export async function touchSession(db, token) {
  const { rows } = await db.query(
    `UPDATE admin_sessions s
        SET expires_at = LEAST(now() + make_interval(hours => $2), s.created_at + make_interval(days => $3)), last_seen_at = now()
       FROM admin_users u
      WHERE s.id = $1 AND s.expires_at > now() AND u.id = s.user_id AND u.disabled_at IS NULL
     RETURNING s.csrf, u.id AS user_id, u.email, u.name, u.role`,
    [sha256(token), SESSION_HOURS, SESSION_MAX_DAYS],
  );
  if (!rows.length) return null;
  const r = rows[0];
  return { csrf: r.csrf, userId: Number(r.user_id), email: r.email, name: r.name, role: r.role };
}

export async function endSession(db, token) {
  await db.query('DELETE FROM admin_sessions WHERE id = $1', [sha256(token)]);
}
```

`services/core-api/src/auth.js` (thay toàn bộ nội dung):

```js
import { createHash, randomBytes } from 'node:crypto';
import { SESSION_COOKIE, readCookie, sameSecret, touchSession } from './admin/sessions.js';

// Token roles (api_tokens.roles) and people's roles (admin_users.role, spec admin-console-p1 §1).
export const ROLES = ['publisher', 'router', 'admin'];
export const USER_ROLES = ['viewer', 'editor', 'admin'];

// What a role satisfies when a route asks for it: viewer ⊂ editor ⊂ admin; a route that asks for a token
// role maps as publisher ← editor+, router ← admin, admin ← admin.
const USER_GRANTS = {
  viewer: ['viewer'],
  editor: ['viewer', 'editor', 'publisher'],
  admin: ['viewer', 'editor', 'publisher', 'router', 'admin'],
};
// Every valid token may read; an admin token passes every check.
const tokenGrants = (roles) => (roles.includes('admin') ? USER_GRANTS.admin : ['viewer', ...roles]);
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const sha256 = (s) => createHash('sha256').update(s).digest('hex');

export async function createToken(pool, { name, roles }) {
  const token = `ikf_${randomBytes(32).toString('base64url')}`;
  await pool.query('INSERT INTO api_tokens (name, token_sha256, roles) VALUES ($1, $2, $3)', [name, sha256(token), roles]);
  return token;
}

export async function ensureToken(pool, { name, roles, token }) {
  await pool.query(
    'INSERT INTO api_tokens (name, token_sha256, roles) VALUES ($1, $2, $3) ON CONFLICT (token_sha256) DO NOTHING',
    [name, sha256(token), roles],
  );
}

// A valid session cookie first (a person), else a Bearer ikf_ token. A person's write needs X-Ikf-Csrf.
// → {actor, grants, session?} or {status, error}.
export async function authenticate(pool, req) {
  const cookie = readCookie(req.headers.cookie, SESSION_COOKIE);
  const session = cookie ? await touchSession(pool, cookie) : null;
  if (session) {
    if (!SAFE_METHODS.has(req.method) && !sameSecret(req.headers['x-ikf-csrf'], session.csrf)) return { status: 403, error: 'csrf' };
    const actor = { kind: 'user', name: session.email, email: session.email, role: session.role, userId: session.userId };
    return { actor, grants: USER_GRANTS[session.role], session: { ...session, token: cookie } };
  }
  const m = /^Bearer (\S+)$/.exec(req.headers.authorization ?? '');
  const { rows } = m
    ? await pool.query('SELECT name, roles FROM api_tokens WHERE token_sha256 = $1 AND revoked_at IS NULL', [sha256(m[1])])
    : { rows: [] };
  if (!rows.length) return { status: 401, error: 'unauthorized' };
  const { name, roles } = rows[0];
  return { actor: { kind: 'token', name, roles }, grants: tokenGrants(roles) };
}

export function requireRole(pool, role) {
  const wanted = Array.isArray(role) ? role : [role];
  return async (req, reply) => {
    const who = await authenticate(pool, req);
    if (who.error) return reply.code(who.status).send({ error: who.error });
    if (!wanted.some((r) => who.grants.includes(r))) return reply.code(403).send({ error: 'forbidden' });
    req.actor = who.actor;
    req.session = who.session ?? null;
  };
}

// Routes only a signed-in person uses (/v1/auth/me, /v1/auth/logout): a token is 401.
export function requireSession(pool) {
  return async (req, reply) => {
    const who = await authenticate(pool, req);
    if (who.error) return reply.code(who.status).send({ error: who.error });
    if (!who.session) return reply.code(401).send({ error: 'unauthorized' });
    req.actor = who.actor;
    req.session = who.session;
  };
}
```

`services/core-api/src/admin/users.js` (mới):

```js
// admin_users: the people who may sign in to the admin console (spec admin-console-p1 §2).

// The local demo's --admin-user (APP_ENV=local only): an enabled admin, created on first use.
export async function ensureLocalAdmin(db, email) {
  const { rows } = await db.query(
    `INSERT INTO admin_users (email, name, role, created_by) VALUES ($1, 'Local admin', 'admin', 'local')
     ON CONFLICT (email) DO UPDATE SET role = 'admin', disabled_at = NULL
     RETURNING id, email, name, role`,
    [email.trim().toLowerCase()],
  );
  return { ...rows[0], id: Number(rows[0].id) };
}
```

`services/core-api/src/http/auth.js` (mới):

```js
import { audit } from '../audit.js';
import { requireSession } from '../auth.js';
import { clearedSessionCookie, createSession, endSession, sessionCookie } from '../admin/sessions.js';
import { ensureLocalAdmin } from '../admin/users.js';

// Where to send the browser after sign-in: a path inside the admin app, nothing else.
export const safeReturn = (r) => (typeof r === 'string' && /^\/(?!\/)[^\\\s]*$/.test(r) ? r : '/');

const clientIp = (req) => req.headers['cf-connecting-ip'] ?? req.ip;

// Sign-in, session and sign-out (spec admin-console-p1 §1). `admin.localUser` (local demo only) signs in
// without Google; Google OIDC is in http/google.js.
export default async function authHttp(app, { pool, admin }) {
  const session = requireSession(pool);

  app.get('/v1/auth/me', { onRequest: session }, async (req, reply) => {
    reply.header('cache-control', 'no-store');
    const s = req.session;
    return { email: s.email, name: s.name, role: s.role, csrf: s.csrf };
  });

  app.post('/v1/auth/logout', { onRequest: session }, async (req, reply) => {
    await endSession(pool, req.session.token);
    reply.header('set-cookie', clearedSessionCookie());
    return reply.code(204).send();
  });

  if (admin.localUser) {
    app.get('/v1/auth/google', async (req, reply) => {
      const user = await ensureLocalAdmin(pool, admin.localUser);
      const { token } = await createSession(pool, { userId: user.id, ip: clientIp(req), ua: req.headers['user-agent'] });
      await audit(pool, { kind: 'user', name: user.email }, 'auth.login', `user:${user.email}`, { method: 'local' });
      reply.header('set-cookie', sessionCookie(token));
      return reply.redirect(`${admin.origin}${safeReturn(req.query.return)}`, 302);
    });
  }
}
```

`app.js` (đăng ký, từ chối `localUser` ngoài local), `config.js`, role của các route (áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/app.js b/services/core-api/src/app.js
index c93b038..14b061f 100644
--- a/services/core-api/src/app.js
+++ b/services/core-api/src/app.js
@@ -13,10 +13,14 @@ import appsHttp from './http/apps.js';
 import identityHttp from './http/identity.js';
 import claimHttp from './http/claim.js';
 import sdkHttp from './http/sdk.js';
+import authHttp from './http/auth.js';
 
 export function buildApp({ checks = {}, timeoutMs = 1000, logger = false, deps } = {}) {
+  // The local demo's sign-in without Google must never run in a deployed environment (spec admin-console-p1 §1).
+  if (deps?.admin?.localUser && deps.admin.appEnv !== 'local') throw new Error('admin.localUser is for APP_ENV=local only');
   const app = Fastify({ logger });
   app.decorateRequest('actor', null);
+  app.decorateRequest('session', null); // the admin console session behind the request's cookie, if any
   app.decorateRequest('caller', null); // the app row behind an app API key (identity routes)
 
   app.setErrorHandler((err, req, reply) => {
@@ -58,6 +62,7 @@ export function buildApp({ checks = {}, timeoutMs = 1000, logger = false, deps }
   if (deps?.pool && deps?.claimKey && deps?.mailer) app.register(identityHttp, deps);
   if (deps?.pool && deps?.claimKey) app.register(claimHttp, deps);
   if (deps?.pool && deps?.claimKey) app.register(sdkHttp, deps);
+  if (deps?.pool && deps?.admin) app.register(authHttp, deps);
 
   return app;
 }
diff --git a/services/core-api/src/config.js b/services/core-api/src/config.js
index 42b4232..5203e76 100644
--- a/services/core-api/src/config.js
+++ b/services/core-api/src/config.js
@@ -17,6 +17,8 @@ export function loadConfig(env = process.env) {
   if (!['sandbox', 'live'].includes(env.PADDLE_ENV)) throw new Error('PADDLE_ENV must be sandbox or live');
   const expected = PADDLE_ENV_FOR[env.APP_ENV];
   if (expected && env.PADDLE_ENV !== expected) throw new Error(`APP_ENV ${env.APP_ENV} needs PADDLE_ENV=${expected}`);
+  // Signs in without Google: the local demo only, never staging or prod (spec admin-console-p1 §1).
+  if (env.ADMIN_LOCAL_USER && env.APP_ENV !== 'local') throw new Error('ADMIN_LOCAL_USER is for APP_ENV=local only; unset it');
   return {
     db: { host: env.DB_HOST, user: env.DB_USER, password: env.DB_PASSWORD, secretArn: env.DB_SECRET_ARN },
     redisHost: env.REDIS_HOST,
@@ -36,5 +38,9 @@ export function loadConfig(env = process.env) {
       secretsPrefix: env.SECRETS_PREFIX,
       alarmTopicArn: env.ALARM_TOPIC_ARN || null,
     },
+    admin: {
+      appEnv: env.APP_ENV || null,
+      localUser: env.ADMIN_LOCAL_USER || null,
+    },
   };
 }
diff --git a/services/core-api/src/http/apps.js b/services/core-api/src/http/apps.js
index bd8ca4e..e6c008c 100644
--- a/services/core-api/src/http/apps.js
+++ b/services/core-api/src/http/apps.js
@@ -48,7 +48,8 @@ export default async function appsHttp(app, { pool, webhookSecrets }) {
     },
   );
 
-  app.get('/v1/apps', { onRequest: router }, async () => listApps(pool));
+  // Any signed-in person picks an app for a funnel from this list (spec admin-console-p1 §3).
+  app.get('/v1/apps', { onRequest: requireRole(pool, 'viewer') }, async () => listApps(pool));
 
   // {force: true} rotates even while the previous key is still in its 24h window (it then stops at once).
   app.post(
diff --git a/services/core-api/src/http/funnels.js b/services/core-api/src/http/funnels.js
index 6c19a1c..df3c3fc 100644
--- a/services/core-api/src/http/funnels.js
+++ b/services/core-api/src/http/funnels.js
@@ -7,7 +7,8 @@ export default async function funnelsHttp(app, { pool, kv }) {
   app.put(
     '/v1/funnels/:slug',
     {
-      onRequest: requireRole(pool, 'router'),
+      // People: editor and admin (spec admin-console-p1 §3); tokens: router, as before.
+      onRequest: requireRole(pool, ['router', 'editor']),
       schema: {
         params: {
           type: 'object',
diff --git a/services/core-api/src/http/routes.js b/services/core-api/src/http/routes.js
index 6eabc21..e10a0ca 100644
--- a/services/core-api/src/http/routes.js
+++ b/services/core-api/src/http/routes.js
@@ -8,7 +8,7 @@ export default async function routesHttp(app, { pool, kv }) {
   const router = requireRole(pool, 'router');
   const prefixBody = { type: 'object', required: ['prefix'], properties: { prefix: prefixSchema } };
 
-  app.get('/v1/routes/:host', { onRequest: requireRole(pool, ['router', 'publisher']), schema: { params: hostParams } }, async (req) =>
+  app.get('/v1/routes/:host', { onRequest: requireRole(pool, 'viewer'), schema: { params: hostParams } }, async (req) =>
     listRoutes(pool, req.params.host),
   );
 
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/sessions.test.js test/config.test.js 2>&1 | grep -E "Tests  "
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  23 passed (23)` (sessions 14, config 9); toàn bộ `Test Files  38 passed (38)`, `Tests  371 passed (371)` (test cũ của apps/routes/funnels không đổi: token giữ nghĩa cũ).

- [ ] **Step 5: Commit**

```bash
git add services/core-api
git commit -m "feat(core-api): admin sessions, CSRF, people's roles in requireRole, /v1/auth/me|logout, local sign-in (APP_ENV=local only)"
```

---

### Task 4: Đăng nhập Google OIDC (state + nonce + PKCE, JWKS, `hd`) + config/secret + CORS cho `ADMIN_ORIGIN`

**Files:**
- Create: `services/core-api/src/admin/{google,setup,cors}.js`, `src/http/google.js`
- Modify: `services/core-api/package.json` (+ `jose`), `src/app.js`, `src/config.js`, `src/server.js`
- Test: `services/core-api/test/google.test.js` (mới); Modify: `services/core-api/test/config.test.js`

**Interfaces:**
- Consumes: `createSession`, `readCookie`, `sameSecret`, `sessionCookie`, `sha256` (Task 3); `safeReturn` (`src/http/auth.js`, Task 3); `audit` (Task 2).
- Produces:
  - `src/admin/google.js`: `GOOGLE_AUTH_URL`, `GOOGLE_TOKEN_URL`, `GOOGLE_JWKS_URL`, `GOOGLE_ISSUERS`, `ALLOWED_HD = 'ikameglobal.com'`, `OAUTH_COOKIE = 'ikf_oauth'`, `ATTEMPT_SECONDS = 600`, `OidcError(code)`, `googleKeys()`, `attemptKey(clientSecret)`, `challenge(verifier)`, `newAttempt(key, returnTo, now?)` → `{attempt: {s, n, v, r, e}, value}`, `readAttempt(key, value, now?)`, `attemptCookie(value)`, `clearedAttemptCookie()`, `authorizeUrl({clientId, redirectUri, attempt})`, `exchangeCode({fetch, clientId, clientSecret, redirectUri, code, verifier})` → id_token, `verifyIdToken(idToken, {keys, clientId, nonce})` → `{email, name}`.
  - `src/admin/setup.js`: `ADMIN_SECRETS = ['google-oauth-client-secret']`, `adminDeps({config, secrets, prefix, keys, fetch})` → `{deps: {admin: {appEnv, origin, apiOrigin, google: {clientId, clientSecret, keys, fetch}}} | null, missing}`.
  - `src/admin/cors.js`: `adminCors(app, origin)`.
  - `loadConfig(env).admin = {appEnv, localUser, origin, apiOrigin, googleClientId}` (env `ADMIN_ORIGIN`, `API_ORIGIN`, `GOOGLE_OAUTH_CLIENT_ID`).
  - Redirect lỗi: `${origin}/login?error=not_allowed|invalid_token|state|google`. Audit `auth.login {method: 'google'}`, `auth.login_denied {reason: 'not_allowed'|'disabled'}`; log `admin_login {email_hash, role}`, `admin_login_denied {email_hash, reason}`, `admin_login_failed {reason}`.

- [ ] **Step 1: Thêm `jose`**

```bash
npm install jose@^6.2.12 -w @ikf/core-api
```

- [ ] **Step 2: Viết test fail**

`services/core-api/test/google.test.js` (mới; khoá RSA test + `createLocalJWKSet` thay JWKS Google, `fetch` giả cho token endpoint):

```js
import { Writable } from 'node:stream';
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from 'jose';
import { startDb, resetDb } from './helpers/db.js';
import { ADMIN_ORIGIN } from './helpers/admin.js';
import { buildApp } from '../src/app.js';
import { adminDeps } from '../src/admin/setup.js';
import { challenge, GOOGLE_TOKEN_URL } from '../src/admin/google.js';

const API_ORIGIN = 'https://api.ikf-staging.example';
const CLIENT_ID = 'cid.apps.googleusercontent.com';
const CALLBACK = `${API_ORIGIN}/v1/auth/google/callback`;

describe('Google sign-in (OIDC + PKCE)', () => {
  let db;
  let app;
  let key;
  let otherKey;
  let token; // what the fake token endpoint returns next
  let exchanges;
  let logs;

  beforeAll(async () => {
    db = await startDb();
    key = await generateKeyPair('RS256');
    otherKey = await generateKeyPair('RS256');
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    const jwk = { ...(await exportJWK(key.publicKey)), kid: 'k1', alg: 'RS256' };
    exchanges = [];
    token = null;
    logs = [];
    const fetch = async (url, init) => {
      exchanges.push({ url, body: Object.fromEntries(new URLSearchParams(init.body)) });
      if (token instanceof Error) throw token;
      return new Response(JSON.stringify(token === 'bad' ? { error: 'invalid_grant' } : { id_token: token }), { status: token === 'bad' ? 400 : 200 });
    };
    const admin = adminDeps({
      config: { appEnv: 'staging', origin: ADMIN_ORIGIN, apiOrigin: API_ORIGIN, googleClientId: CLIENT_ID },
      secrets: { 'google-oauth-client-secret': 'shh' },
      keys: createLocalJWKSet({ keys: [jwk] }),
      fetch,
    });
    const stream = new Writable({ write(chunk, _enc, cb) { logs.push(chunk.toString()); cb(); } });
    app = buildApp({ logger: { level: 'info', stream }, deps: { pool: db.pool, ...admin.deps } });
    await app.ready();
    await db.pool.query("INSERT INTO admin_users (email, name, role, created_by) VALUES ('an@ikameglobal.com', '', 'editor', 'test')");
  });
  afterEach(() => app.close());

  const idToken = (claims = {}, { signer = key.privateKey, exp = '5m' } = {}) =>
    new SignJWT({ email: 'An@ikameglobal.com', email_verified: true, hd: 'ikameglobal.com', name: 'An Nguyen', ...claims })
      .setProtectedHeader({ alg: 'RS256', kid: 'k1' })
      .setIssuer(claims.iss ?? 'https://accounts.google.com')
      .setAudience(claims.aud ?? CLIENT_ID)
      .setSubject('1234')
      .setIssuedAt()
      .setExpirationTime(exp)
      .sign(signer);

  // Starts a sign-in; returns what the callback needs.
  async function start(path = '/v1/auth/google?return=/funnels/aivideo') {
    const res = await app.inject({ method: 'GET', url: path });
    const url = new URL(res.headers.location);
    const cookie = res.headers['set-cookie'].split(';')[0];
    return { res, url, cookie, state: url.searchParams.get('state'), nonce: url.searchParams.get('nonce') };
  }
  const callback = (s, query = {}, cookie = s.cookie) =>
    app.inject({ method: 'GET', url: `/v1/auth/google/callback?${new URLSearchParams({ state: s.state, code: 'c0de', ...query })}`, headers: { cookie } });
  const sessions = async () => (await db.pool.query('SELECT count(*)::int AS n FROM admin_sessions')).rows[0].n;

  it('/v1/auth/google: redirect to Google with state, nonce, S256 PKCE, hd and the callback; a 10-minute attempt cookie', async () => {
    const s = await start();
    expect(s.res.statusCode).toBe(302);
    expect(`${s.url.origin}${s.url.pathname}`).toBe('https://accounts.google.com/o/oauth2/v2/auth');
    expect(Object.fromEntries(s.url.searchParams)).toEqual({
      client_id: CLIENT_ID, redirect_uri: CALLBACK, response_type: 'code', scope: 'openid email profile',
      state: expect.stringMatching(/^[A-Za-z0-9_-]{32}$/), nonce: expect.stringMatching(/^[A-Za-z0-9_-]{32}$/),
      code_challenge: expect.stringMatching(/^[A-Za-z0-9_-]{43}$/), code_challenge_method: 'S256', hd: 'ikameglobal.com', prompt: 'select_account',
    });
    expect(s.res.headers['set-cookie']).toMatch(/^ikf_oauth=[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43}; HttpOnly; Secure; SameSite=Lax; Path=\/v1\/auth\/google; Max-Age=600$/);
    expect(s.res.headers['set-cookie']).not.toContain(s.nonce);
  });

  it('callback: an enabled company account gets a session and returns to where it started', async () => {
    const s = await start();
    token = await idToken({ nonce: s.nonce });
    const res = await callback(s);
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe(`${ADMIN_ORIGIN}/funnels/aivideo`);
    const [cleared, session] = res.headers['set-cookie'];
    expect(cleared).toMatch(/^ikf_oauth=; .*Max-Age=0$/);
    expect(session).toMatch(/^ikf_admin=[A-Za-z0-9_-]{43}; HttpOnly; Secure; SameSite=Lax; Path=\/; Max-Age=604800$/);
    expect(exchanges).toEqual([{
      url: GOOGLE_TOKEN_URL,
      body: { code: 'c0de', client_id: CLIENT_ID, client_secret: 'shh', redirect_uri: CALLBACK, grant_type: 'authorization_code', code_verifier: expect.any(String) },
    }]);
    expect(challenge(exchanges[0].body.code_verifier)).toBe(s.url.searchParams.get('code_challenge'));
    const me = await app.inject({ method: 'GET', url: '/v1/auth/me', headers: { cookie: session.split(';')[0] } });
    expect(me.json()).toMatchObject({ email: 'an@ikameglobal.com', name: 'An Nguyen', role: 'editor' });
    const { rows } = await db.pool.query('SELECT actor, actor_kind, action, target, details FROM audit_log');
    expect(rows).toEqual([{ actor: 'an@ikameglobal.com', actor_kind: 'user', action: 'auth.login', target: 'user:an@ikameglobal.com', details: { method: 'google' } }]);
  });

  it.each([
    ['another Workspace domain (hd)', 'not_allowed', { hd: 'gmail.com' }, {}],
    ['no hd (a personal Gmail)', 'not_allowed', { hd: undefined }, {}],
    ['an expired id_token', 'invalid_token', {}, { exp: '-1m' }],
    ['another client (aud)', 'invalid_token', { aud: 'other-client' }, {}],
    ['another issuer', 'invalid_token', { iss: 'https://evil.example' }, {}],
    ['a key not in the JWKS', 'invalid_token', {}, { other: true }],
    ['a replayed nonce', 'invalid_token', { nonce: 'from-another-attempt' }, {}],
    ['an unverified email', 'invalid_token', { email_verified: false }, {}],
  ])('rejects %s → login?error=%s, no session', async (_name, error, claims, opts) => {
    const s = await start();
    token = await idToken({ nonce: s.nonce, ...claims }, { exp: opts.exp, signer: opts.other ? otherKey.privateKey : key.privateKey });
    const res = await callback(s);
    expect(res.headers.location).toBe(`${ADMIN_ORIGIN}/login?error=${error}`);
    expect(res.headers['set-cookie']).toMatch(/^ikf_oauth=;/);
    expect(await sessions()).toBe(0);
  });

  it('an email that has no access, or is disabled → not_allowed, audit auth.login_denied, log only the email hash', async () => {
    let s = await start();
    token = await idToken({ nonce: s.nonce, email: 'stranger@ikameglobal.com' });
    expect((await callback(s)).headers.location).toBe(`${ADMIN_ORIGIN}/login?error=not_allowed`);
    await db.pool.query("UPDATE admin_users SET disabled_at = now() WHERE email = 'an@ikameglobal.com'");
    s = await start();
    token = await idToken({ nonce: s.nonce });
    expect((await callback(s)).headers.location).toBe(`${ADMIN_ORIGIN}/login?error=not_allowed`);
    expect(await sessions()).toBe(0);
    const { rows } = await db.pool.query('SELECT actor, action, details FROM audit_log ORDER BY id');
    expect(rows).toEqual([
      { actor: 'stranger@ikameglobal.com', action: 'auth.login_denied', details: { reason: 'not_allowed' } },
      { actor: 'an@ikameglobal.com', action: 'auth.login_denied', details: { reason: 'disabled' } },
    ]);
    const text = logs.join('');
    expect(text).toContain('admin_login_denied');
    expect(text).toMatch(/"email_hash":"[0-9a-f]{64}"/);
    expect(text).not.toMatch(/stranger@|an@ikameglobal/i);
  });

  it('state: no attempt cookie, a tampered or expired one, or another state → error=state; Google errors → error=google', async () => {
    const s = await start();
    token = await idToken({ nonce: s.nonce });
    expect((await callback(s, {}, '')).headers.location).toBe(`${ADMIN_ORIGIN}/login?error=state`);
    expect((await callback(s, {}, `${s.cookie}x`)).headers.location).toBe(`${ADMIN_ORIGIN}/login?error=state`);
    expect((await callback(s, { state: 'other' })).headers.location).toBe(`${ADMIN_ORIGIN}/login?error=state`);
    const [body] = s.cookie.slice('ikf_oauth='.length).split('.');
    const old = JSON.parse(Buffer.from(body, 'base64url').toString());
    const forged = `ikf_oauth=${Buffer.from(JSON.stringify({ ...old, e: 1 })).toString('base64url')}.${s.cookie.split('.')[1]}`;
    expect((await callback(s, {}, forged)).headers.location).toBe(`${ADMIN_ORIGIN}/login?error=state`);
    expect((await callback(s, { error: 'access_denied' })).headers.location).toBe(`${ADMIN_ORIGIN}/login?error=google`);
    token = 'bad';
    expect((await callback(s)).headers.location).toBe(`${ADMIN_ORIGIN}/login?error=google`);
    token = new Error('network down');
    expect((await callback(s)).headers.location).toBe(`${ADMIN_ORIGIN}/login?error=google`);
    expect(await sessions()).toBe(0);
    expect(logs.join('')).not.toContain('network down');
  });

  it('CORS: only the admin origin, with credentials, on /v1/* (not checkout); preflight lists methods and headers', async () => {
    const pre = await app.inject({ method: 'OPTIONS', url: '/v1/funnels', headers: { origin: ADMIN_ORIGIN, 'access-control-request-method': 'POST' } });
    expect(pre.statusCode).toBe(204);
    expect(pre.headers).toMatchObject({
      'access-control-allow-origin': ADMIN_ORIGIN, 'access-control-allow-credentials': 'true',
      'access-control-allow-methods': 'GET, POST, PUT, DELETE', 'access-control-allow-headers': 'content-type, x-ikf-csrf', vary: 'Origin',
    });
    const get = await app.inject({ method: 'GET', url: '/v1/auth/me', headers: { origin: ADMIN_ORIGIN } });
    expect(get.statusCode).toBe(401);
    expect(get.headers['access-control-allow-origin']).toBe(ADMIN_ORIGIN);
    for (const [origin, url] of [['https://evil.example', '/v1/auth/me'], [ADMIN_ORIGIN, '/v1/checkout'], [ADMIN_ORIGIN, '/livez']]) {
      const res = await app.inject({ method: 'GET', url, headers: { origin } });
      expect(res.headers['access-control-allow-origin'], `${origin} ${url}`).toBeUndefined();
    }
  });
});

describe('adminDeps', () => {
  const config = { appEnv: 'prod', origin: 'https://admin.ikf.example', apiOrigin: 'https://api.ikf.example', googleClientId: 'cid' };
  it('off, naming what is missing, until both origins, the client id and the client secret are set', () => {
    expect(adminDeps({ config: { appEnv: 'prod' }, secrets: {}, prefix: 'ikf/prod/', keys: {} })).toEqual({
      deps: null, missing: ['ADMIN_ORIGIN', 'API_ORIGIN', 'GOOGLE_OAUTH_CLIENT_ID', 'ikf/prod/google-oauth-client-secret'],
    });
    const on = adminDeps({ config, secrets: { 'google-oauth-client-secret': 's' }, keys: {} });
    expect(on.missing).toEqual([]);
    expect(on.deps.admin).toMatchObject({ appEnv: 'prod', origin: config.origin, apiOrigin: config.apiOrigin, google: { clientId: 'cid', clientSecret: 's' } });
  });
});
```

`services/core-api/test/config.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/test/config.test.js b/services/core-api/test/config.test.js
index 394943e..47d3df1 100644
--- a/services/core-api/test/config.test.js
+++ b/services/core-api/test/config.test.js
@@ -36,7 +36,7 @@ describe('loadConfig', () => {
         secretsPrefix: 'ikf/staging/',
         alarmTopicArn: 'arn:aws:sns:us-east-1:111111111111:ikf-staging-alarms',
       },
-      admin: { appEnv: 'staging', localUser: null },
+      admin: { appEnv: 'staging', localUser: null, origin: null, apiOrigin: null, googleClientId: null },
     });
   });
 
@@ -46,11 +46,23 @@ describe('loadConfig', () => {
       const env = { ...ENV, APP_ENV, PADDLE_ENV: APP_ENV === 'prod' ? 'live' : 'sandbox', ADMIN_LOCAL_USER: 'dev@ikameglobal.com' };
       expect(() => loadConfig(env)).toThrow('ADMIN_LOCAL_USER is for APP_ENV=local only; unset it');
     }
-    expect(loadConfig({ ...ENV, APP_ENV: 'local', ADMIN_LOCAL_USER: 'dev@ikameglobal.com' }).admin).toEqual({
+    expect(loadConfig({ ...ENV, APP_ENV: 'local', ADMIN_LOCAL_USER: 'dev@ikameglobal.com' }).admin).toMatchObject({
       appEnv: 'local', localUser: 'dev@ikameglobal.com',
     });
   });
 
+  it('admin: ADMIN_ORIGIN and API_ORIGIN are https origins (http only for APP_ENV=local); GOOGLE_OAUTH_CLIENT_ID', () => {
+    const env = { ...ENV, ADMIN_ORIGIN: 'https://admin.ikf-staging.example/', API_ORIGIN: 'https://api.ikf-staging.example', GOOGLE_OAUTH_CLIENT_ID: 'cid' };
+    expect(loadConfig(env).admin).toEqual({
+      appEnv: 'staging', localUser: null, origin: 'https://admin.ikf-staging.example', apiOrigin: 'https://api.ikf-staging.example', googleClientId: 'cid',
+    });
+    for (const bad of ['http://admin.ikf-staging.example', 'https://admin.ikf-staging.example/app', 'admin.ikf-staging.example']) {
+      expect(() => loadConfig({ ...env, ADMIN_ORIGIN: bad })).toThrow(`ADMIN_ORIGIN must be an https origin (no path): ${bad}`);
+    }
+    expect(() => loadConfig({ ...env, API_ORIGIN: 'http://api.x' })).toThrow('API_ORIGIN must be an https origin');
+    expect(loadConfig({ ...env, APP_ENV: 'local', ADMIN_ORIGIN: 'http://localhost:8792' }).admin.origin).toBe('http://localhost:8792');
+  });
+
   it('requires the Paddle env and the webhook queue; the alarm topic is optional', () => {
     const { PADDLE_ENV, WEBHOOK_QUEUE_URL, ALARM_TOPIC_ARN, ...rest } = ENV;
     expect(() => loadConfig(rest)).toThrow('missing env: PADDLE_ENV, WEBHOOK_QUEUE_URL');
PATCH
```

- [ ] **Step 3: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/google.test.js test/config.test.js 2>&1 | grep -E "FAIL|Test Files|Tests  "
```

Expected: `test/google.test.js` FAIL khi import (`src/admin/setup.js` chưa có); config `parses the environment` và `admin: ADMIN_ORIGIN and API_ORIGIN are https origins…` FAIL; `Tests  2 failed | 8 passed (10)`.

- [ ] **Step 4: Implement**

`services/core-api/src/admin/google.js` (mới):

```js
// Google Workspace sign-in (spec admin-console-p1 §1): authorization code + PKCE (S256), state and nonce;
// the id_token's signature is checked against Google's JWKS (cached 1 hour), then iss, aud, exp, nonce,
// email_verified and hd.
import { createHash, createHmac, randomBytes } from 'node:crypto';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { sameSecret } from './sessions.js';

export const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
export const GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
export const GOOGLE_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];
export const ALLOWED_HD = 'ikameglobal.com';
export const OAUTH_COOKIE = 'ikf_oauth';
export const ATTEMPT_SECONDS = 600;
const TOKEN_TIMEOUT_MS = 10_000;

export class OidcError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

export const googleKeys = () => createRemoteJWKSet(new URL(GOOGLE_JWKS_URL), { cacheMaxAge: 3_600_000 });

// HMAC key for the sign-in attempt cookie, derived from the client secret (no extra secret to manage).
export const attemptKey = (clientSecret) => createHash('sha256').update(`ikf-admin-oauth\0${clientSecret}`).digest();

const rand = (n = 24) => randomBytes(n).toString('base64url');
const sign = (key, body) => createHmac('sha256', key).update(body).digest('base64url');
export const challenge = (verifier) => createHash('sha256').update(verifier).digest('base64url');

// One sign-in attempt: state, nonce, PKCE verifier and the path to return to, signed, in a short-lived cookie.
export function newAttempt(key, returnTo, now = Date.now()) {
  const attempt = { s: rand(), n: rand(), v: rand(32), r: returnTo, e: Math.floor(now / 1000) + ATTEMPT_SECONDS };
  const body = Buffer.from(JSON.stringify(attempt)).toString('base64url');
  return { attempt, value: `${body}.${sign(key, body)}` };
}

export function readAttempt(key, value, now = Date.now()) {
  const [body, mac, extra] = (value ?? '').split('.');
  if (!body || !mac || extra !== undefined || !sameSecret(mac, sign(key, body))) return null;
  let attempt;
  try {
    attempt = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  return attempt && typeof attempt.e === 'number' && attempt.e > now / 1000 ? attempt : null;
}

export const attemptCookie = (value) => `${OAUTH_COOKIE}=${value}; HttpOnly; Secure; SameSite=Lax; Path=/v1/auth/google; Max-Age=${ATTEMPT_SECONDS}`;
export const clearedAttemptCookie = () => `${OAUTH_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/v1/auth/google; Max-Age=0`;

export function authorizeUrl({ clientId, redirectUri, attempt }) {
  const q = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state: attempt.s,
    nonce: attempt.n,
    code_challenge: challenge(attempt.v),
    code_challenge_method: 'S256',
    hd: ALLOWED_HD,
    prompt: 'select_account',
  });
  return `${GOOGLE_AUTH_URL}?${q}`;
}

// The id_token for an authorization code; OidcError('exchange') on any failure.
export async function exchangeCode({ fetch, clientId, clientSecret, redirectUri, code, verifier }) {
  let res;
  try {
    res = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code', code_verifier: verifier,
      }).toString(),
      signal: AbortSignal.timeout(TOKEN_TIMEOUT_MS),
    });
  } catch {
    throw new OidcError('exchange');
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok || typeof body.id_token !== 'string') throw new OidcError('exchange');
  return body.id_token;
}

// {email, name} of a verified company account; OidcError('invalid_token' | 'nonce' | 'email_unverified' | 'hd').
export async function verifyIdToken(idToken, { keys, clientId, nonce }) {
  let payload;
  try {
    ({ payload } = await jwtVerify(idToken, keys, { issuer: GOOGLE_ISSUERS, audience: clientId, algorithms: ['RS256'] }));
  } catch {
    throw new OidcError('invalid_token');
  }
  if (!sameSecret(payload.nonce, nonce)) throw new OidcError('nonce');
  if (payload.email_verified !== true || typeof payload.email !== 'string') throw new OidcError('email_unverified');
  if (payload.hd !== ALLOWED_HD) throw new OidcError('hd');
  return { email: payload.email.toLowerCase(), name: typeof payload.name === 'string' ? payload.name.slice(0, 200) : '' };
}
```

`services/core-api/src/admin/setup.js` (mới):

```js
import { googleKeys } from './google.js';

export const ADMIN_SECRETS = ['google-oauth-client-secret'];

// Admin console sign-in is off (no /v1/auth/* routes, no CORS) until ADMIN_ORIGIN, API_ORIGIN,
// GOOGLE_OAUTH_CLIENT_ID and the client secret are all set; tokens keep working.
export function adminDeps({ config, secrets, prefix = '', keys = googleKeys(), fetch = globalThis.fetch }) {
  const missing = [];
  if (!config.origin) missing.push('ADMIN_ORIGIN');
  if (!config.apiOrigin) missing.push('API_ORIGIN');
  if (!config.googleClientId) missing.push('GOOGLE_OAUTH_CLIENT_ID');
  for (const n of ADMIN_SECRETS) if (!secrets[n]) missing.push(prefix + n);
  if (missing.length) return { deps: null, missing };
  return {
    deps: {
      admin: {
        appEnv: config.appEnv,
        origin: config.origin,
        apiOrigin: config.apiOrigin,
        google: { clientId: config.googleClientId, clientSecret: secrets['google-oauth-client-secret'], keys, fetch },
      },
    },
    missing,
  };
}
```

`services/core-api/src/admin/cors.js` (mới; Task 10 thêm một dòng `expose-headers`):

```js
// The admin SPA (https://admin.<zone>) calls api.<zone> with its session cookie (spec admin-console-p1 §1).
// Only that origin, only /v1/*, never checkout (it has its own CORS for funnel origins).
export function adminCors(app, origin) {
  app.addHook('onRequest', async (req, reply) => {
    if (req.headers.origin !== origin || !req.url.startsWith('/v1/') || req.url.startsWith('/v1/checkout')) return undefined;
    reply.header('access-control-allow-origin', origin);
    reply.header('access-control-allow-credentials', 'true');
    reply.header('vary', 'Origin');
    if (req.method !== 'OPTIONS') return undefined;
    reply.header('access-control-allow-methods', 'GET, POST, PUT, DELETE');
    reply.header('access-control-allow-headers', 'content-type, x-ikf-csrf');
    reply.header('access-control-max-age', '600');
    return reply.code(204).send();
  });
}
```

`services/core-api/src/http/google.js` (mới):

```js
import { audit } from '../audit.js';
import { createSession, readCookie, sameSecret, sessionCookie, sha256 } from '../admin/sessions.js';
import {
  OAUTH_COOKIE, attemptCookie, attemptKey, authorizeUrl, clearedAttemptCookie, exchangeCode, newAttempt, readAttempt, verifyIdToken,
} from '../admin/google.js';
import { safeReturn } from './auth.js';

const clientIp = (req) => req.headers['cf-connecting-ip'] ?? req.ip;
// Logs carry a hash of a person's email, never the email (project rule).
const emailHash = (email) => sha256(email.toLowerCase());

// GET /v1/auth/google → Google → GET /v1/auth/google/callback (spec admin-console-p1 §1).
export default async function googleHttp(app, { pool, admin }) {
  const { clientId, clientSecret, keys, fetch } = admin.google;
  const key = attemptKey(clientSecret);
  const redirectUri = `${admin.apiOrigin}/v1/auth/google/callback`;

  app.get('/v1/auth/google', async (req, reply) => {
    const { attempt, value } = newAttempt(key, safeReturn(req.query.return));
    reply.header('set-cookie', attemptCookie(value)).header('cache-control', 'no-store');
    return reply.redirect(authorizeUrl({ clientId, redirectUri, attempt }), 302);
  });

  app.get('/v1/auth/google/callback', async (req, reply) => {
    reply.header('set-cookie', clearedAttemptCookie()).header('cache-control', 'no-store');
    const fail = (error, reason, extra = {}) => {
      req.log.warn({ reason, ...extra }, 'admin_login_failed');
      return reply.redirect(`${admin.origin}/login?error=${error}`, 302);
    };
    const attempt = readAttempt(key, readCookie(req.headers.cookie, OAUTH_COOKIE));
    if (!attempt || !sameSecret(req.query.state, attempt.s)) return fail('state', 'state');
    if (req.query.error || typeof req.query.code !== 'string') return fail('google', 'google_error');

    let who;
    try {
      const idToken = await exchangeCode({ fetch, clientId, clientSecret, redirectUri, code: req.query.code, verifier: attempt.v });
      who = await verifyIdToken(idToken, { keys, clientId, nonce: attempt.n });
    } catch (err) {
      if (err.code === 'exchange') return fail('google', 'exchange');
      return fail(err.code === 'hd' ? 'not_allowed' : 'invalid_token', err.code ?? 'error');
    }

    const user = (
      await pool.query('SELECT id, email, name, role, disabled_at FROM admin_users WHERE email = $1', [who.email])
    ).rows[0];
    if (!user || user.disabled_at) {
      const reason = user ? 'disabled' : 'not_allowed';
      await audit(pool, { kind: 'user', name: who.email }, 'auth.login_denied', `user:${who.email}`, { reason });
      req.log.warn({ email_hash: emailHash(who.email), reason }, 'admin_login_denied');
      return reply.redirect(`${admin.origin}/login?error=not_allowed`, 302);
    }
    if (!user.name && who.name) await pool.query('UPDATE admin_users SET name = $2 WHERE id = $1', [user.id, who.name]);
    const { token } = await createSession(pool, { userId: user.id, ip: clientIp(req), ua: req.headers['user-agent'] });
    await audit(pool, { kind: 'user', name: user.email }, 'auth.login', `user:${user.email}`, { method: 'google' });
    req.log.info({ email_hash: emailHash(user.email), role: user.role }, 'admin_login');
    reply.header('set-cookie', sessionCookie(token)); // Fastify appends: the attempt cookie stays cleared
    return reply.redirect(`${admin.origin}${safeReturn(attempt.r)}`, 302);
  });
}
```

`app.js` (CORS, đăng ký Google khi không có `localUser`), `config.js` (origin https), `server.js` (secret + `adminDeps`) (áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/app.js b/services/core-api/src/app.js
index 14b061f..29a474e 100644
--- a/services/core-api/src/app.js
+++ b/services/core-api/src/app.js
@@ -14,6 +14,8 @@ import identityHttp from './http/identity.js';
 import claimHttp from './http/claim.js';
 import sdkHttp from './http/sdk.js';
 import authHttp from './http/auth.js';
+import googleHttp from './http/google.js';
+import { adminCors } from './admin/cors.js';
 
 export function buildApp({ checks = {}, timeoutMs = 1000, logger = false, deps } = {}) {
   // The local demo's sign-in without Google must never run in a deployed environment (spec admin-console-p1 §1).
@@ -21,6 +23,7 @@ export function buildApp({ checks = {}, timeoutMs = 1000, logger = false, deps }
   const app = Fastify({ logger });
   app.decorateRequest('actor', null);
   app.decorateRequest('session', null); // the admin console session behind the request's cookie, if any
+  if (deps?.admin?.origin) adminCors(app, deps.admin.origin);
   app.decorateRequest('caller', null); // the app row behind an app API key (identity routes)
 
   app.setErrorHandler((err, req, reply) => {
@@ -63,6 +66,7 @@ export function buildApp({ checks = {}, timeoutMs = 1000, logger = false, deps }
   if (deps?.pool && deps?.claimKey) app.register(claimHttp, deps);
   if (deps?.pool && deps?.claimKey) app.register(sdkHttp, deps);
   if (deps?.pool && deps?.admin) app.register(authHttp, deps);
+  if (deps?.pool && deps?.admin?.google && !deps.admin.localUser) app.register(googleHttp, deps);
 
   return app;
 }
diff --git a/services/core-api/src/config.js b/services/core-api/src/config.js
index 5203e76..0b69a36 100644
--- a/services/core-api/src/config.js
+++ b/services/core-api/src/config.js
@@ -7,6 +7,21 @@ const REQUIRED = [
 // Staging must never charge real cards, prod must never take sandbox payments.
 const PADDLE_ENV_FOR = { staging: 'sandbox', prod: 'live' };
 
+// An origin (scheme://host[:port], no path): https, or http only for the local demo.
+function origin(env, name) {
+  const v = env[name];
+  if (!v) return null;
+  let u = null;
+  try {
+    u = new URL(v);
+  } catch {
+    // reported below
+  }
+  const ok = u && u.origin === v.replace(/\/$/, '') && (u.protocol === 'https:' || (env.APP_ENV === 'local' && u.protocol === 'http:'));
+  if (!ok) throw new Error(`${name} must be an https origin (no path): ${v}`);
+  return u.origin;
+}
+
 export function loadConfig(env = process.env) {
   const missing = REQUIRED.filter((k) => !env[k]);
   if (missing.length) throw new Error(`missing env: ${missing.join(', ')}`);
@@ -41,6 +56,9 @@ export function loadConfig(env = process.env) {
     admin: {
       appEnv: env.APP_ENV || null,
       localUser: env.ADMIN_LOCAL_USER || null,
+      origin: origin(env, 'ADMIN_ORIGIN'),
+      apiOrigin: origin(env, 'API_ORIGIN'),
+      googleClientId: env.GOOGLE_OAUTH_CLIENT_ID || null,
     },
   };
 }
diff --git a/services/core-api/src/server.js b/services/core-api/src/server.js
index 7a5895f..f815461 100644
--- a/services/core-api/src/server.js
+++ b/services/core-api/src/server.js
@@ -17,13 +17,14 @@ import { startQueueWorker } from './billing/queue.js';
 import { BILLING_SECRETS, billingDeps } from './billing/setup.js';
 import { syncMessage } from './billing/sync.js';
 import { IDENTITY_SECRETS, identityDeps } from './identity/setup.js';
+import { ADMIN_SECRETS, adminDeps } from './admin/setup.js';
 import { startEntitlementSync } from './identity/sync.js';
 import { startWebhookSender } from './identity/webhooks.js';
 
 const REQUIRED_SECRETS = ['cf-kv-api-token', 'r2-access-key-id', 'r2-secret-access-key'];
 
 const config = loadConfig();
-const secrets = await loadSecrets(config.secretsPrefix, [...REQUIRED_SECRETS, 'bootstrap-admin-token', ...BILLING_SECRETS, ...IDENTITY_SECRETS]);
+const secrets = await loadSecrets(config.secretsPrefix, [...REQUIRED_SECRETS, 'bootstrap-admin-token', ...BILLING_SECRETS, ...IDENTITY_SECRETS, ...ADMIN_SECRETS]);
 const missing = REQUIRED_SECRETS.filter((n) => !secrets[n]);
 if (missing.length) {
   console.error(`missing secret values: ${missing.map((n) => config.secretsPrefix + n).join(', ')}`);
@@ -96,13 +97,19 @@ if (!identity.deps) {
   console.error(`identity disabled, missing: ${identity.missing.join(', ')}`);
 }
 
+const admin = adminDeps({ config: config.admin, secrets, prefix: config.secretsPrefix });
+if (!admin.deps) {
+  // Admin console sign-in off until the values are entered; tokens (CLI) keep working.
+  console.error(`admin console disabled, missing: ${admin.missing.join(', ')}`);
+}
+
 const app = buildApp({
   logger: true,
   checks: {
     db: () => pool.query('select 1'),
     cache: () => redis.ping(),
   },
-  deps: { pool, store, kv, mediaOrigins: config.mediaOrigins, previewBaseUrl: config.previewBaseUrl, ...billing.deps, ...identity.deps },
+  deps: { pool, store, kv, mediaOrigins: config.mediaOrigins, previewBaseUrl: config.previewBaseUrl, ...billing.deps, ...identity.deps, ...admin.deps },
 });
 
 const stopResync = startResync({ pool, kv, log: app.log });
PATCH
```

- [ ] **Step 5: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/google.test.js test/config.test.js 2>&1 | grep -E "Tests  "
node --check services/core-api/src/server.js
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  24 passed (24)` (google 14, config 10); toàn bộ `Test Files  39 passed (39)`, `Tests  386 passed (386)`.

- [ ] **Step 6: Commit**

```bash
git add services/core-api package-lock.json
git commit -m "feat(core-api): Google Workspace sign-in (OIDC code + PKCE, JWKS, hd), admin config + secret, CORS for ADMIN_ORIGIN"
```

---

### Task 5: Route đọc `GET /v1/funnels`, `POST /v1/funnels`, `GET /v1/funnels/:slug`, `GET /v1/domains`, `GET /v1/audit`

**Files:**
- Create: `services/core-api/src/publisher/catalog.js`, `src/http/catalog.js`
- Modify: `services/core-api/src/audit.js` (+ `listAudit`), `src/app.js`
- Test: `services/core-api/test/catalog.test.js` (mới)

**Interfaces:**
- Consumes: `requireRole` (Task 3: `'viewer'`, `['editor','publisher']`), `audit` (Task 2), `withTx`.
- Produces:
  - `listFunnels(pool)` → `[{slug, latest_v, live: [{host, prefix, v}], pixel_id, app_id, updated_at}]` (mới thay đổi trước).
  - `funnelDetail(pool, slug, previewBaseUrl)` → `{slug, pixel_id, app_id, created_by, created_at, versions: [{v, sha256, size, lint, created_by, created_at, preview_url}], live}`; `404 funnel_not_found`. (Task 12 thêm `previous` vào `live`.)
  - `createFunnel(pool, {slug, actor})` (audit `funnel.create`); `409 funnel_exists`.
  - `listDomains(pool)` → `[{host, status, rev, kv_synced_rev, routes: [{prefix, slug, v}]}]`.
  - `listAudit(pool, {target, action, limit, before})` → `{items: [{id, at, actor, actor_kind, action, target, details}], next_before}`.
  - HTTP: `GET /v1/funnels` → `{funnels}`, `POST /v1/funnels {slug}` → 201 + chi tiết, `GET /v1/funnels/:slug`, `GET /v1/domains` → `{domains}`, `GET /v1/audit?target&action&limit&before`.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/catalog.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, tokenFor, bearer, seedVersions, PREVIEW } from './helpers/app.js';
import { signIn } from './helpers/admin.js';

describe('admin console reads: funnels, domains, audit', () => {
  let db;
  let app;
  let store;
  let admin;
  let viewer;

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    ({ app, store } = await makeApp(db.pool));
    admin = await tokenFor(db.pool, 'admin');
    viewer = await signIn(db.pool, 'vi@ikameglobal.com', 'viewer');
    for (const [host, status] of [['a.example.com', 'active'], ['b.example.com', 'disabled']]) {
      await db.pool.query('INSERT INTO domains (host, status) VALUES ($1, $2)', [host, status]);
      await db.pool.query('INSERT INTO host_revs (host) VALUES ($1)', [host]);
    }
  });
  afterEach(() => app.close());

  const get = (url, headers = viewer.headers(false)) => app.inject({ method: 'GET', url, headers });
  const publish = (host, prefix, funnel, v) =>
    app.inject({ method: 'PUT', url: `/v1/routes/${host}`, headers: bearer(admin), payload: { prefix, funnel, v, confirm_funnel_change: true } });

  it('GET /v1/funnels: latest version, where it is live, pixel, app; most recently changed first', async () => {
    await seedVersions(db.pool, store, 'aivideo', 2);
    await seedVersions(db.pool, store, 'tarot', 1);
    await db.pool.query("INSERT INTO funnels (slug, created_by, pixel_id) VALUES ('empty-one', 't', '123456')");
    await publish('a.example.com', '/', 'aivideo', 1);
    await publish('a.example.com', '/promo', 'aivideo', 2);
    const res = await get('/v1/funnels');
    expect(res.statusCode).toBe(200);
    const { funnels } = res.json();
    expect(funnels.map((f) => f.slug)).toEqual(['aivideo', 'empty-one', 'tarot']);
    expect(funnels[0]).toEqual({
      slug: 'aivideo', latest_v: 2, pixel_id: null, app_id: null, updated_at: expect.any(String),
      live: [{ host: 'a.example.com', prefix: '/', v: 1 }, { host: 'a.example.com', prefix: '/promo', v: 2 }],
    });
    expect(funnels[1]).toMatchObject({ slug: 'empty-one', latest_v: null, live: [], pixel_id: '123456' });
  });

  it('POST /v1/funnels: an editor creates an empty funnel (audited); 409 if it exists; 400 bad slug; viewer 403', async () => {
    const ed = await signIn(db.pool, 'ed@ikameglobal.com', 'editor');
    const create = (slug, headers = ed.headers()) => app.inject({ method: 'POST', url: '/v1/funnels', headers, payload: { slug } });
    const res = await create('new-funnel');
    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual({
      slug: 'new-funnel', pixel_id: null, app_id: null, created_by: 'ed@ikameglobal.com', created_at: expect.any(String), versions: [], live: [],
    });
    expect((await create('new-funnel')).json()).toEqual({ error: 'funnel_exists', detail: { funnel: 'new-funnel' } });
    expect((await create('Bad Slug')).statusCode).toBe(400);
    expect((await create('x')).statusCode).toBe(400);
    expect((await create('other', viewer.headers())).statusCode).toBe(403);
    expect((await create('by-token', bearer(await tokenFor(db.pool, 'publisher')))).statusCode).toBe(201);
    const { rows } = await db.pool.query("SELECT actor, action, target FROM audit_log WHERE action = 'funnel.create' ORDER BY id");
    expect(rows).toEqual([
      { actor: 'ed@ikameglobal.com', action: 'funnel.create', target: 'funnel:new-funnel' },
      { actor: 'publisher', action: 'funnel.create', target: 'funnel:by-token' },
    ]);
  });

  it('GET /v1/funnels/:slug: versions newest first with lint report, author, size and preview URL; where it is live', async () => {
    await seedVersions(db.pool, store, 'aivideo', 2);
    await db.pool.query("UPDATE versions SET lint_report = '{\"errors\":[],\"warnings\":[{\"code\":\"missing_meta_viewport\"}]}' WHERE n = 2");
    await publish('a.example.com', '/', 'aivideo', 2);
    const body = (await get('/v1/funnels/aivideo')).json();
    expect(body.versions.map((v) => v.v)).toEqual([2, 1]);
    expect(body.versions[0]).toEqual({
      v: 2, sha256: expect.stringMatching(/^[0-9a-f]{64}$/), size: expect.any(Number),
      lint: { errors: [], warnings: [{ code: 'missing_meta_viewport' }] }, created_by: 'seed', created_at: expect.any(String),
      preview_url: `${PREVIEW}/aivideo/v2`,
    });
    expect(body.live).toEqual([{ host: 'a.example.com', prefix: '/', v: 2 }]);
    expect((await get('/v1/funnels/nope')).json()).toEqual({ error: 'funnel_not_found', detail: { funnel: 'nope' } });
  });

  it('GET /v1/domains: status, revisions and the routes on each host', async () => {
    await seedVersions(db.pool, store, 'aivideo', 1);
    await publish('a.example.com', '/', 'aivideo', 1);
    expect((await get('/v1/domains')).json()).toEqual({
      domains: [
        { host: 'a.example.com', status: 'active', rev: 1, kv_synced_rev: 1, routes: [{ prefix: '/', slug: 'aivideo', v: 1 }] },
        { host: 'b.example.com', status: 'disabled', rev: 0, kv_synced_rev: 0, routes: [] },
      ],
    });
  });

  it('GET /v1/audit: newest first; funnel:<slug> and domain:<host> include their route rows; action family; paging', async () => {
    await seedVersions(db.pool, store, 'aivideo', 2);
    await seedVersions(db.pool, store, 'tarot', 1);
    await publish('a.example.com', '/', 'aivideo', 1);
    await publish('a.example.com', '/t', 'tarot', 1);
    await app.inject({ method: 'PUT', url: '/v1/domains/c.example.com', headers: bearer(admin), payload: { status: 'active' } });
    const actions = async (qs) => (await get(`/v1/audit${qs}`)).json().items.map((i) => `${i.action} ${i.target}`);
    expect(await actions('')).toEqual([
      'domain.sync domain:c.example.com', 'route.publish route:a.example.com/t', 'route.publish route:a.example.com/',
      'version.upload funnel:tarot', 'version.upload funnel:aivideo', 'version.upload funnel:aivideo',
    ]);
    expect(await actions('?target=funnel:aivideo')).toEqual([
      'route.publish route:a.example.com/', 'version.upload funnel:aivideo', 'version.upload funnel:aivideo',
    ]);
    expect(await actions('?target=domain:a.example.com')).toEqual(['route.publish route:a.example.com/t', 'route.publish route:a.example.com/']);
    expect(await actions('?action=route')).toEqual(['route.publish route:a.example.com/t', 'route.publish route:a.example.com/']);
    const page1 = (await get('/v1/audit?limit=4')).json();
    expect(page1.items).toHaveLength(4);
    expect(page1.items[0]).toEqual({
      id: 6, at: expect.any(String), actor: 'admin', actor_kind: 'token', action: 'domain.sync', target: 'domain:c.example.com',
      details: { host: 'c.example.com', status: 'active' },
    });
    const page2 = (await get(`/v1/audit?limit=4&before=${page1.next_before}`)).json();
    expect(page2.items.map((i) => i.id)).toEqual([2, 1]);
    expect(page2.next_before).toBeNull();
    expect((await get('/v1/audit?limit=500')).statusCode).toBe(400);
  });

  it('reads need a session or a token', async () => {
    for (const url of ['/v1/funnels', '/v1/funnels/aivideo', '/v1/domains', '/v1/audit']) {
      expect((await get(url, {})).statusCode, url).toBe(401);
    }
    expect((await get('/v1/domains', bearer(await tokenFor(db.pool, 'publisher')))).statusCode).toBe(200);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/catalog.test.js 2>&1 | grep -E "×|Tests  "
```

Expected: `Tests  6 failed (6)` (404 cho mọi route mới).

- [ ] **Step 3: Implement**

`services/core-api/src/publisher/catalog.js` (mới):

```js
// Read side of the admin console (spec admin-console-p1 §3): funnels, their versions and where they are live, domains.
import { audit } from '../audit.js';
import { HttpError } from '../errors.js';
import { withTx } from '../identity/link.js';

const iso = (d) => (d ? d.toISOString() : null);

async function liveByFunnel(db, funnelId = null) {
  const { rows } = await db.query(
    `SELECT v.funnel_id, r.host, r.path_prefix AS prefix, v.n AS v
       FROM routes r JOIN versions v ON v.id = r.version_id
      WHERE $1::bigint IS NULL OR v.funnel_id = $1
      ORDER BY r.host, r.path_prefix`,
    [funnelId],
  );
  const out = new Map();
  for (const r of rows) {
    const id = String(r.funnel_id);
    if (!out.has(id)) out.set(id, []);
    out.get(id).push({ host: r.host, prefix: r.prefix, v: r.v });
  }
  return out;
}

// Newest change first: a new version, a route change or the funnel's creation.
export async function listFunnels(pool) {
  const { rows } = await pool.query(
    `SELECT f.id, f.slug, f.pixel_id, f.app_id, lv.n AS latest_v,
            GREATEST(f.created_at, lv.created_at, lr.updated_at) AS updated_at
       FROM funnels f
       LEFT JOIN LATERAL (SELECT n, created_at FROM versions WHERE funnel_id = f.id ORDER BY n DESC LIMIT 1) lv ON true
       LEFT JOIN LATERAL (
         SELECT max(r.updated_at) AS updated_at FROM routes r JOIN versions v ON v.id = r.version_id WHERE v.funnel_id = f.id
       ) lr ON true
      ORDER BY updated_at DESC, f.slug`,
  );
  const live = await liveByFunnel(pool);
  return rows.map((r) => ({
    slug: r.slug,
    latest_v: r.latest_v ?? null,
    live: live.get(String(r.id)) ?? [],
    pixel_id: r.pixel_id,
    app_id: r.app_id,
    updated_at: iso(r.updated_at),
  }));
}

export async function funnelDetail(pool, slug, previewBaseUrl) {
  const f = (await pool.query('SELECT id, slug, pixel_id, app_id, created_by, created_at FROM funnels WHERE slug = $1', [slug])).rows[0];
  if (!f) throw new HttpError(404, 'funnel_not_found', { funnel: slug });
  const versions = (
    await pool.query('SELECT n, sha256, size, lint_report, created_by, created_at FROM versions WHERE funnel_id = $1 ORDER BY n DESC', [f.id])
  ).rows;
  return {
    slug: f.slug,
    pixel_id: f.pixel_id,
    app_id: f.app_id,
    created_by: f.created_by,
    created_at: iso(f.created_at),
    versions: versions.map((v) => ({
      v: v.n,
      sha256: v.sha256,
      size: v.size,
      lint: v.lint_report,
      created_by: v.created_by,
      created_at: iso(v.created_at),
      preview_url: previewBaseUrl ? `${previewBaseUrl}/${f.slug}/v${v.n}` : null,
    })),
    live: (await liveByFunnel(pool, f.id)).get(String(f.id)) ?? [],
  };
}

// An empty funnel (no version yet), so an editor can start from the web.
export async function createFunnel(pool, { slug, actor }) {
  await withTx(pool, async (c) => {
    const { rows } = await c.query(
      'INSERT INTO funnels (slug, created_by) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING RETURNING id',
      [slug, actor.name],
    );
    if (!rows.length) throw new HttpError(409, 'funnel_exists', { funnel: slug });
    await audit(c, actor, 'funnel.create', `funnel:${slug}`, { slug });
  });
}

export async function listDomains(pool) {
  const domains = (
    await pool.query('SELECT d.host, d.status, h.rev, h.kv_synced_rev FROM domains d JOIN host_revs h USING (host) ORDER BY d.host')
  ).rows;
  const routes = (
    await pool.query(
      `SELECT r.host, r.path_prefix AS prefix, f.slug, v.n AS v
         FROM routes r JOIN versions v ON v.id = r.version_id JOIN funnels f ON f.id = v.funnel_id
        ORDER BY r.host, r.path_prefix`,
    )
  ).rows;
  return domains.map((d) => ({
    host: d.host,
    status: d.status,
    rev: Number(d.rev),
    kv_synced_rev: Number(d.kv_synced_rev),
    routes: routes.filter((r) => r.host === d.host).map(({ prefix, slug, v }) => ({ prefix, slug, v })),
  }));
}
```

`services/core-api/src/http/catalog.js` (mới):

```js
import { listAudit } from '../audit.js';
import { requireRole } from '../auth.js';
import { createFunnel, funnelDetail, listDomains, listFunnels } from '../publisher/catalog.js';

const SLUG = { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{1,62}$' };
const slugParams = { type: 'object', required: ['slug'], properties: { slug: SLUG } };

// Admin console reads (any signed-in person or token) and funnel creation (spec admin-console-p1 §3).
export default async function catalogHttp(app, { pool, previewBaseUrl = null }) {
  const viewer = requireRole(pool, 'viewer');

  app.get('/v1/funnels', { onRequest: viewer }, async () => ({ funnels: await listFunnels(pool) }));

  app.post(
    '/v1/funnels',
    {
      onRequest: requireRole(pool, ['editor', 'publisher']),
      schema: { body: { type: 'object', required: ['slug'], additionalProperties: false, properties: { slug: SLUG } } },
    },
    async (req, reply) => {
      await createFunnel(pool, { slug: req.body.slug, actor: req.actor });
      reply.code(201);
      return funnelDetail(pool, req.body.slug, previewBaseUrl);
    },
  );

  app.get('/v1/funnels/:slug', { onRequest: viewer, schema: { params: slugParams } }, async (req) =>
    funnelDetail(pool, req.params.slug, previewBaseUrl),
  );

  app.get('/v1/domains', { onRequest: viewer }, async () => ({ domains: await listDomains(pool) }));

  app.get(
    '/v1/audit',
    {
      onRequest: viewer,
      schema: {
        querystring: {
          type: 'object',
          additionalProperties: false,
          properties: {
            target: { type: 'string', minLength: 1, maxLength: 300 },
            action: { type: 'string', pattern: '^[a-z_.]{1,64}$' },
            limit: { type: 'integer', minimum: 1, maximum: 200, default: 50 },
            before: { type: 'integer', minimum: 1 },
          },
        },
      },
    },
    async (req) => listAudit(pool, req.query),
  );
}
```

`audit.js` (+ `listAudit`), `app.js` (đăng ký) (áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/app.js b/services/core-api/src/app.js
index 29a474e..f889c66 100644
--- a/services/core-api/src/app.js
+++ b/services/core-api/src/app.js
@@ -15,6 +15,7 @@ import claimHttp from './http/claim.js';
 import sdkHttp from './http/sdk.js';
 import authHttp from './http/auth.js';
 import googleHttp from './http/google.js';
+import catalogHttp from './http/catalog.js';
 import { adminCors } from './admin/cors.js';
 
 export function buildApp({ checks = {}, timeoutMs = 1000, logger = false, deps } = {}) {
@@ -54,6 +55,7 @@ export function buildApp({ checks = {}, timeoutMs = 1000, logger = false, deps }
 
   if (deps?.pool) app.register(tokensHttp, deps);
   if (deps?.pool) app.register(domainsHttp, deps);
+  if (deps?.pool) app.register(catalogHttp, deps);
   if (deps?.store) app.register(versionsHttp, deps);
   if (deps?.kv) app.register(routesHttp, deps);
   if (deps?.kv) app.register(funnelsHttp, deps);
diff --git a/services/core-api/src/audit.js b/services/core-api/src/audit.js
index 6840817..9a814ed 100644
--- a/services/core-api/src/audit.js
+++ b/services/core-api/src/audit.js
@@ -11,3 +11,21 @@ export async function audit(db, actor, action, target, details = {}) {
     [who.name, who.kind, action, target, details],
   );
 }
+
+// Newest first. target: exact, and funnel:<slug> / domain:<host> also match the route rows of that funnel / host.
+// action: exact, or a family ("route" = route.*). before: an id from the previous page's next_before.
+export async function listAudit(pool, { target = null, action = null, limit = 50, before = null } = {}) {
+  const slug = target?.startsWith('funnel:') ? target.slice('funnel:'.length) : null;
+  const host = target?.startsWith('domain:') ? target.slice('domain:'.length) : null;
+  const { rows } = await pool.query(
+    `SELECT id, at, actor, actor_kind, action, target, details FROM audit_log
+      WHERE ($1::text IS NULL OR target = $1 OR details->>'slug' = $2 OR details->>'host' = $3)
+        AND ($4::text IS NULL OR action = $4 OR action LIKE $4 || '.%')
+        AND ($5::bigint IS NULL OR id < $5)
+      ORDER BY id DESC
+      LIMIT $6`,
+    [target, slug, host, action, before, limit],
+  );
+  const items = rows.map((r) => ({ ...r, id: Number(r.id), at: r.at.toISOString() }));
+  return { items, next_before: items.length === limit ? items.at(-1).id : null };
+}
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/catalog.test.js 2>&1 | grep -E "Tests  "
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  6 passed (6)`; toàn bộ `Test Files  40 passed (40)`, `Tests  392 passed (392)`.

- [ ] **Step 5: Commit**

```bash
git add services/core-api
git commit -m "feat(core-api): admin console reads: funnels (list, detail, create), domains, audit"
```

---

### Task 6: Package `@ikf/funnel-lint` (luật tĩnh spec §4) + báo cáo trên `funnel-development`

**Files:**
- Create: `packages/funnel-lint/package.json`, `packages/funnel-lint/src/index.js`
- Test: `packages/funnel-lint/test/lint.test.js` (bảng kịch bản), `packages/funnel-lint/test/corpus.test.js` (báo cáo, không fail)
- Modify: `.github/workflows/packages.yml` (chạy test package mới)

**Interfaces:**
- Consumes: — (không dependency, không Node built-in).
- Produces: `lint(html, {slug = null, app = null, mediaOrigins = [], maxBytes = MAX_BYTES})` → `{errors: [{code, message, line?}], warnings: [...]}`; mã lỗi `too_large`, `config_funnel_missing`, `config_funnel_mismatch`, `relative_media`, `email_in_url`, `external_script`; cảnh báo `no_get_app_hook` (chỉ khi `app === 'app'`), `inline_demo_checkout`, `missing_meta_viewport`. `MAX_BYTES = 1048576`, `SCRIPT_ALLOWLIST` (Paddle, Turnstile, Meta, Google Fonts), `configFunnel(html)` → slug | null, `byteLength(s)`.

- [ ] **Step 1: Package + test fail**

`packages/funnel-lint/package.json` (mới):

```json
{
  "name": "@ikf/funnel-lint",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": "./src/index.js",
  "sideEffects": false,
  "scripts": { "test": "vitest run" },
  "devDependencies": { "vitest": "~3.2.0" }
}
```

`packages/funnel-lint/test/lint.test.js` (mới):

```js
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { lint, configFunnel, MAX_BYTES, SCRIPT_ALLOWLIST } from '../src/index.js';

// A clean funnel page; parts can be swapped per scenario.
const page = ({
  head = '<meta name="viewport" content="width=device-width,initial-scale=1">',
  body = '<img src="https://media.ikf.example/aivideo/hero.jpg">',
  script = "const CONFIG={funnel:'aivideo',appUrl:'https://app.adjust.com/abc'};",
} = {}) => `<!doctype html>\n<html><head>${head}</head>\n<body>${body}\n<script>${script}</script>\n</body></html>`;

const codes = (r) => ({ errors: r.errors.map((e) => e.code), warnings: r.warnings.map((w) => w.code) });

describe('lint (spec admin-console-p1 §4)', () => {
  it('a clean page: no errors, no warnings', () => {
    expect(lint(page(), { slug: 'aivideo', app: 'app' })).toEqual({ errors: [], warnings: [] });
  });

  // Scenario table: [name, page parts, options, expected codes].
  it.each([
    ['CONFIG.funnel missing', { script: 'const x=1;' }, {}, { errors: ['config_funnel_missing'], warnings: [] }],
    ['CONFIG.funnel is another slug', { script: "const CONFIG={funnel:'other'};" }, {}, { errors: ['config_funnel_mismatch'], warnings: [] }],
    ['an <img> with img/…', { body: '<img src="img/hero.jpg">' }, {}, { errors: ['relative_media'], warnings: [] }],
    ['a root-relative src', { body: '<video poster="/p.jpg" src="https://m.example/v.mp4"></video>' }, {}, { errors: ['relative_media'], warnings: [] }],
    ['a relative srcset entry', { body: '<img src="https://m.example/a.jpg" srcset="https://m.example/a2.jpg 2x, b.jpg 3x">' }, {}, { errors: ['relative_media'], warnings: [] }],
    ['url() in <style>', { head: '<meta name="viewport" content="x"><style>.a{background:url(img/bg.png)}</style>' }, {}, { errors: ['relative_media'], warnings: [] }],
    ['url() in a style attribute', { body: '<div style="background-image:url(\'bg.webp\')"></div>' }, {}, { errors: ['relative_media'], warnings: [] }],
    ['an IMG map value left relative', { script: "const CONFIG={funnel:'aivideo',appUrl:'x'};const IMG=/*IMG-START*/{'img/a.jpg':'img/a.jpg'}/*IMG-END*/;" }, {}, { errors: ['relative_media'], warnings: [] }],
    ['an img/ literal outside the IMG map', { script: "const CONFIG={funnel:'aivideo',appUrl:'x'};const IMG=/*IMG-START*/{'img/a.jpg':'https://m.example/a.jpg'}/*IMG-END*/;const b='img/b.png';" }, {}, { errors: ['relative_media'], warnings: [] }],
    ['data:, https:, #, template and IMG keys are fine', { body: '<img src="data:image/png;base64,AA"><use href="#i"></use>', script: "const CONFIG={funnel:'aivideo',appUrl:'x'};const IMG=/*IMG-START*/{'img/a.jpg':'https://m.example/a.jpg'}/*IMG-END*/;el.innerHTML=`<img src=\"${im('img/a.jpg')}\">`;" }, {}, { errors: [], warnings: [] }],
    ['email= in checkoutUrl', { script: "const CONFIG={funnel:'aivideo',appUrl:'x',checkoutUrl:'https://pay.example/c?plan=1w&email={email}'};" }, {}, { errors: ['email_in_url'], warnings: [] }],
    ['?email= appended to the app link', { script: "const CONFIG={funnel:'aivideo',appUrl:'x'};function go(){location.href=CONFIG.appUrl+'?email='+S.email}" }, {}, { errors: ['email_in_url'], warnings: [] }],
    ['{{email}} in a link', { body: '<a href="https://app.example/open?u={{email}}">Open</a>' }, {}, { errors: ['email_in_url'], warnings: [] }],
    ['email in a template URL', { script: "const CONFIG={funnel:'aivideo',appUrl:'x'};const u=`https://app.example/x?id=1&email=${S.email}`;" }, {}, { errors: ['email_in_url'], warnings: [] }],
    ['setting S.email is not a URL', { script: "const CONFIG={funnel:'aivideo',appUrl:'x'};S.email=e.target.value;const t='{email} is required';" }, {}, { errors: [], warnings: [] }],
    ['a script from a CDN', { head: '<meta name="viewport" content="x"><script src="https://cdn.example/lib.js"></script>' }, {}, { errors: ['external_script'], warnings: [] }],
    ['a relative script', { head: '<meta name="viewport" content="x"><script src="app.js"></script>' }, {}, { errors: ['external_script'], warnings: [] }],
    ['Paddle, Turnstile, Meta and the media library are allowed', { head: '<meta name="viewport" content="x"><script src="https://cdn.paddle.com/paddle/v2/paddle.js"></script><script src="https://challenges.cloudflare.com/turnstile/v0/api.js"></script><script async src="https://connect.facebook.net/en_US/fbevents.js"></script><script src="https://media.ikf.example/lib/x.js"></script>' }, { mediaOrigins: ['https://media.ikf.example/'] }, { errors: [], warnings: [] }],
    ['an app funnel with no get-app hook', { script: "const CONFIG={funnel:'aivideo'};" }, { app: 'app' }, { errors: [], warnings: ['no_get_app_hook'] }],
    ['data-ikf="get-app" is a hook', { body: '<button data-ikf="get-app">Get</button>', script: "const CONFIG={funnel:'aivideo'};" }, { app: 'app' }, { errors: [], warnings: [] }],
    ['IkFunnel.appLink is a hook', { script: "const CONFIG={funnel:'aivideo'};IkFunnel.appLink().then(go);" }, { app: 'app' }, { errors: [], warnings: [] }],
    ['a web funnel needs no get-app hook', { script: "const CONFIG={funnel:'aivideo'};" }, { app: 'web' }, { errors: [], warnings: [] }],
    ['an inline demo checkout', { body: '<div id="demock"></div>', script: "const CONFIG={funnel:'aivideo',appUrl:'x'};function buy(){demoCheckout('1w')}" }, {}, { errors: [], warnings: ['inline_demo_checkout'] }],
    ['no meta viewport', { head: '<title>x</title>' }, {}, { errors: [], warnings: ['missing_meta_viewport'] }],
  ])('%s', (_name, parts, opts, expected) => {
    expect(codes(lint(page(parts), { slug: 'aivideo', ...opts }))).toEqual(expected);
  });

  it('too_large: over 1 MiB (UTF-8 bytes) stops there', () => {
    const html = page({ body: `<p>${'é'.repeat(MAX_BYTES / 2)}</p><img src="img/x.jpg">` });
    expect(lint(html, { slug: 'aivideo' })).toEqual({
      errors: [{ code: 'too_large', message: expect.stringMatching(/^1\.00 MB > 1 MB/) }], warnings: [],
    });
    expect(lint(page(), { slug: 'aivideo', maxBytes: 100 }).errors.map((e) => e.code)).toEqual(['too_large']);
  });

  it('each finding names the URL and its line; one finding per URL', () => {
    const html = page({ body: '<img src="img/a.jpg">\n<img src="img/a.jpg">\n<img src="b.png">' });
    expect(lint(html, { slug: 'aivideo' }).errors).toEqual([
      { code: 'relative_media', message: 'img/a.jpg: ảnh/video phải là URL https trên thư viện media (S3)', line: 3 },
      { code: 'relative_media', message: 'b.png: ảnh/video phải là URL https trên thư viện media (S3)', line: 5 },
    ]);
  });

  it('without a slug only checks that CONFIG.funnel exists; configFunnel reads it', () => {
    expect(lint(page({ script: "const CONFIG = { funnel: \"tarot\", appUrl: 'x' };" })).errors).toEqual([]);
    expect(configFunnel(page())).toBe('aivideo');
    expect(configFunnel('<p>no config</p>')).toBeNull();
  });

  it('runs in a browser too: no Node built-ins, and the allowlist is https', () => {
    const src = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8');
    expect(src).not.toMatch(/\bBuffer\b|from 'node:|require\(/);
    expect(SCRIPT_ALLOWLIST.every((p) => p.startsWith('https://') && p.endsWith('/'))).toBe(true);
  });
});
```

`packages/funnel-lint/test/corpus.test.js` (mới):

```js
// Report only (spec admin-console-p1 §7): how today's funnels in ikame/funnel/funnel-development fare. Never fails
// on findings; skips when the folder is not there (CI).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { lint, configFunnel } from '../src/index.js';

const DIR = process.env.IKF_FUNNELS_DIR || join(homedir(), 'ikame/funnel/funnel-development');

function demos(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory() && !['img', 'node_modules'].includes(e.name) && !e.name.startsWith('.')) out.push(...demos(join(dir, e.name)));
    else if (e.isFile() && e.name === 'demo.html') out.push(join(dir, e.name));
  }
  return out;
}

describe.skipIf(!existsSync(DIR))(`funnel-development report (${DIR})`, () => {
  it('lints every demo.html and prints how many funnels hit each code', () => {
    const files = demos(DIR);
    const byCode = {};
    let clean = 0;
    for (const f of files) {
      const html = readFileSync(f, 'utf8');
      const r = lint(html, { slug: configFunnel(html) ?? basename(dirname(f)) });
      expect(Array.isArray(r.errors) && Array.isArray(r.warnings)).toBe(true);
      if (!r.errors.length) clean += 1;
      for (const code of new Set([...r.errors, ...r.warnings].map((x) => x.code))) byCode[code] = (byCode[code] ?? 0) + 1;
    }
    console.log(`funnel-lint report: ${files.length} demo.html, ${clean} without errors`);
    for (const [code, n] of Object.entries(byCode).sort()) console.log(`  ${code.padEnd(24)} ${n}`);
    expect(files.length).toBeGreaterThan(0);
  });
});
```

```bash
npm install
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/funnel-lint 2>&1 | grep -E "FAIL|Test Files|Tests  "
```

Expected: cả 2 file FAIL khi import (`src/index.js` chưa có), `Test Files  2 failed (2)`, `Tests  no tests`.

- [ ] **Step 3: Implement**

`packages/funnel-lint/src/index.js` (mới):

```js
// Static checks on a funnel's demo.html before it becomes a version (spec admin-console-p1 §4).
// String work only, no dependencies, no Node built-ins: core-api, the ikf CLI and the admin SPA all run it.
// lint(html, {slug, app, mediaOrigins, maxBytes}) → {errors: [{code, message, line?}], warnings: [...]}.

export const MAX_BYTES = 1024 * 1024; // same cap as core's publisher (MAX_BUNDLE_BYTES)
// <script src> origins a funnel may load (plus the media library origins passed in mediaOrigins).
export const SCRIPT_ALLOWLIST = [
  'https://cdn.paddle.com/',
  'https://challenges.cloudflare.com/',
  'https://connect.facebook.net/',
  'https://fonts.googleapis.com/',
  'https://fonts.gstatic.com/',
];

const CONFIG_FUNNEL = /CONFIG\s*=\s*\{[\s\S]*?\bfunnel\s*:\s*(['"])([^'"]+)\1/;
const SCRIPT_BLOCK = /(<script\b[^>]*>)([\s\S]*?)(<\/script\s*>)/gi;
const TAG = /<([a-zA-Z][a-zA-Z0-9-]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
const ATTR = /\s([a-zA-Z:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
const CSS_URL = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
const IMG_BLOCK = /\/\*IMG-START\*\/([\s\S]*?)\/\*IMG-END\*\//;
const IMG_ENTRY = /(['"])([^'"]+)\1\s*:\s*(['"])([^'"]*)\3/g;
const IMG_LITERAL = /['"`](img\/[\w./@-]+\.(?:jpe?g|png|webp|gif|svg|avif|mp4|webm))['"`]/gi;
const EMAIL_PARAM = /[?&]email=|\{\{?\s*email\s*\}\}?/gi;
const GET_APP_HOOK = /\bappUrl\w*\s*:|data-ikf\s*=\s*["']get-app["']|IkFunnel\.appLink/;
const DEMO_CHECKOUT = /#demock\b|id\s*=\s*["']demock["']|\bdemoCheckout\s*\(/;
const META_VIEWPORT = /<meta\b[^>]*\bname\s*=\s*["']?viewport/i;

export const configFunnel = (html) => CONFIG_FUNNEL.exec(html)?.[2] ?? null;
export const byteLength = (s) => new TextEncoder().encode(s).length;

const MEDIA_MSG = 'ảnh/video phải là URL https trên thư viện media (S3)';

// Not absolute (scheme:, //host), not a fragment, not a template placeholder.
const isRelative = (u) => {
  const v = u.trim();
  return v !== '' && !/^(?:[a-zA-Z][a-zA-Z0-9+.-]*:|\/\/|#|\$\{|\{\{)/.test(v);
};

function lineOf(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i += 1) if (text.charCodeAt(i) === 10) starts.push(i + 1);
  return (index) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= index) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
}

// The page with every inline <script> body blanked (same length, newlines kept): tag scans skip JavaScript.
const markupOf = (html) => html.replace(SCRIPT_BLOCK, (_m, open, body, close) => open + body.replace(/[^\n]/g, ' ') + close);

function attrsOf(s) {
  const out = {};
  for (const m of s.matchAll(ATTR)) out[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4];
  return out;
}

const underAny = (url, prefixes) => /^https:\/\//i.test(url) && prefixes.some((p) => url.startsWith(p));

export function lint(html, { slug = null, app = null, mediaOrigins = [], maxBytes = MAX_BYTES } = {}) {
  const errors = [];
  const warnings = [];
  const size = byteLength(html);
  if (size > maxBytes) {
    const mb = (n) => (n / (1024 * 1024)).toFixed(2);
    const cap = maxBytes >= 1024 * 1024 ? `${maxBytes / (1024 * 1024)} MB` : `${maxBytes} B`;
    return { errors: [{ code: 'too_large', message: `${mb(size)} MB > ${cap}` }], warnings };
  }
  const line = lineOf(html);

  const found = configFunnel(html);
  if (found === null) errors.push({ code: 'config_funnel_missing', message: 'thiếu CONFIG.funnel' });
  else if (slug !== null && found !== slug) {
    errors.push({ code: 'config_funnel_mismatch', message: `CONFIG.funnel là "${found}", slug là "${slug}"`, line: line(html.search(CONFIG_FUNNEL)) });
  }

  // Media: one finding per URL, at its first line.
  const media = new Map();
  const addMedia = (url, index) => {
    const u = url.trim();
    if (isRelative(u) && !media.has(u)) media.set(u, line(index));
  };
  const markup = markupOf(html);
  const allowedScripts = [...SCRIPT_ALLOWLIST, ...mediaOrigins.map((o) => (o.endsWith('/') ? o : `${o}/`))];
  for (const tag of markup.matchAll(TAG)) {
    const name = tag[1].toLowerCase();
    const attrs = attrsOf(tag[2]);
    if (name === 'script') {
      if (attrs.src !== undefined && !underAny(attrs.src.trim(), allowedScripts)) {
        errors.push({ code: 'external_script', message: `<script src="${attrs.src}">: chỉ được nạp script từ ${allowedScripts.join(', ')}`, line: line(tag.index) });
      }
      continue;
    }
    for (const a of ['src', 'poster']) if (attrs[a] !== undefined) addMedia(attrs[a], tag.index);
    if (attrs.srcset) for (const part of attrs.srcset.split(',')) addMedia(part.trim().split(/\s+/)[0] ?? '', tag.index);
    if (name === 'link' && attrs.href !== undefined) addMedia(attrs.href, tag.index);
  }
  for (const m of markup.matchAll(CSS_URL)) addMedia(m[2], m.index);
  const block = IMG_BLOCK.exec(html);
  const mapped = new Set();
  if (block) {
    for (const m of block[1].matchAll(IMG_ENTRY)) {
      mapped.add(m[2]);
      if (m[4]) addMedia(m[4], block.index + m.index);
    }
  }
  for (const m of html.matchAll(IMG_LITERAL)) {
    const inMap = block && m.index > block.index && m.index < block.index + block[0].length;
    if (!inMap && !mapped.has(m[1])) addMedia(m[1], m.index);
  }
  for (const [url, at] of media) errors.push({ code: 'relative_media', message: `${url}: ${MEDIA_MSG}`, line: at });

  // Email in a URL (E11): a ?email= / &email= parameter, or an {email} placeholder in a URL, inside a string.
  const emailLines = new Set();
  for (const m of html.matchAll(EMAIL_PARAM)) {
    const start = html.lastIndexOf('\n', m.index) + 1;
    const before = html.slice(start, m.index);
    const q = Math.max(before.lastIndexOf("'"), before.lastIndexOf('"'), before.lastIndexOf('`'));
    if (q < 0) continue;
    const inUrl = m[0].startsWith('?') || m[0].startsWith('&') || /:\/\/|[?&=]/.test(before.slice(q + 1));
    const at = line(m.index);
    if (inUrl && !emailLines.has(at)) {
      emailLines.add(at);
      errors.push({ code: 'email_in_url', message: 'email không được nằm trong URL (checkout, link app): SDK tự gắn link app', line: at });
    }
  }

  if (app === 'app' && !GET_APP_HOOK.test(html)) {
    warnings.push({ code: 'no_get_app_hook', message: 'funnel của app nhưng không có appUrl / data-ikf="get-app" / IkFunnel.appLink' });
  }
  const demo = DEMO_CHECKOUT.exec(html);
  if (demo) warnings.push({ code: 'inline_demo_checkout', message: 'còn #demock / demoCheckout(): SDK sẽ bỏ, nên xoá', line: line(demo.index) });
  if (!META_VIEWPORT.test(html)) warnings.push({ code: 'missing_meta_viewport', message: 'thiếu <meta name="viewport">' });

  return { errors, warnings };
}
```

`.github/workflows/packages.yml` (áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/.github/workflows/packages.yml b/.github/workflows/packages.yml
index f351b91..e7d7907 100644
--- a/.github/workflows/packages.yml
+++ b/.github/workflows/packages.yml
@@ -20,4 +20,4 @@ jobs:
           node-version: 22
           cache: npm
       - run: npm ci
-      - run: npm test -w @ikf/route-match -w @ikf/event-schema -w @ikf/paddle -w @ikf/sdk -w @ikf/cli
+      - run: npm test -w @ikf/route-match -w @ikf/event-schema -w @ikf/paddle -w @ikf/sdk -w @ikf/cli -w @ikf/funnel-lint
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS + đọc báo cáo**

```bash
npm test -w @ikf/funnel-lint 2>&1 | grep -E "Test Files|Tests  |funnel-lint report|^  [a-z_]+ +[0-9]+"
```

Expected (với `~/ikame/funnel/funnel-development` nhánh `funnel` ngày 2026-10-11): `Test Files  2 passed (2)`, `Tests  30 passed (30)` (CI không có thư mục: `29 passed | 1 skipped`), và báo cáo:

```
funnel-lint report: 69 demo.html, 8 without errors
  config_funnel_missing    11
  email_in_url             10
  inline_demo_checkout     26
  missing_meta_viewport    10
  relative_media           57
```

`relative_media` cao là đúng: `demo.html` trong repo ikame để ảnh `img/…` cạnh file; bản upload phải trỏ thư viện S3 (demo tự viết lại sang media server, Task 14). `email_in_url` = 10 funnel ChatChi còn `email={{email}}` FunnelFox trong link app. Bốn funnel demo (`ewa-books`, `calmio-calm-kids`, `moon-reading`, `witch-power`) sau `rewriteMedia` không có lỗi (đã kiểm), nên `npm run demo` vẫn publish được qua API có lint.

- [ ] **Step 5: Commit**

```bash
git add packages/funnel-lint package-lock.json .github/workflows/packages.yml
git commit -m "feat(funnel-lint): static demo.html lint (config, media, email in URL, scripts, size; get-app, demo checkout, viewport)"
```

---

### Task 7: Lint phía server khi upload (`422 lint_failed`) + kiểm khi publish + CLI lint trước khi upload

**Files:**
- Modify: `services/core-api/package.json` (+ `@ikf/funnel-lint`), `services/core-api/Dockerfile`, `.github/workflows/core-api.yml`, `services/core-api/src/http/versions.js`, `src/publisher/validate.js`, `src/publisher/routes.js`
- Modify: `packages/cli/package.json` (+ `@ikf/funnel-lint`), `packages/cli/src/{publish,main}.js`
- Test: `services/core-api/test/upload-lint.test.js` (mới); Modify: `services/core-api/test/{publish,validate}.test.js`, `test/helpers/pages.js`; `packages/cli/test/publish.test.js`

**Interfaces:**
- Consumes: `lint`, `SCRIPT_ALLOWLIST` (Task 6); `signIn` (Task 3); `seedApp`, `WEB_BODY` (`test/helpers/identity.js`).
- Produces: `POST /v1/funnels/:slug/versions`: lỗi lint → `422 {error: 'lint_failed', detail: {errors, warnings}}` (trước `validateBundle`); `versions.lint_report = {errors, warnings, client?}`. `setRoute` → `409 version_lint_failed {funnel, v, errors: [code]}`. `validateBundle` nhận script từ `SCRIPT_ALLOWLIST` + `mediaOrigins`. CLI: `LintFailedError(report)`, `formatFindings({errors, warnings})` → dòng in (`src/publish.js`); `formatApiError` in `lint_failed`. `funnelHtml()` (test helper) có `<meta name="viewport">`.

- [ ] **Step 1: Viết test fail (core)**

`services/core-api/test/upload-lint.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, tokenFor, bearer, sha, seedVersions } from './helpers/app.js';
import { signIn } from './helpers/admin.js';
import { funnelHtml } from './helpers/pages.js';
import { seedApp, WEB_BODY } from './helpers/identity.js';

describe('server lint on upload and publish checks (spec admin-console-p1 §3, §4)', () => {
  let db;
  let app;
  let store;
  let editor;
  let admin;

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    ({ app, store } = await makeApp(db.pool));
    editor = await signIn(db.pool, 'ed@ikameglobal.com', 'editor');
    admin = await tokenFor(db.pool, 'admin');
    await db.pool.query("INSERT INTO domains (host, status) VALUES ('a.example.com', 'active'), ('off.example.com', 'disabled')");
    await db.pool.query("INSERT INTO host_revs (host) VALUES ('a.example.com'), ('off.example.com')");
  });
  afterEach(() => app.close());

  const upload = (slug, html, extra = {}) =>
    app.inject({ method: 'POST', url: `/v1/funnels/${slug}/versions`, headers: editor.headers(), payload: { html, sha256: sha(html), ...extra } });
  const count = async (table) => (await db.pool.query(`SELECT count(*)::int AS n FROM ${table}`)).rows[0].n;

  it('lint errors → 422 lint_failed with the whole report; no version, no R2 object, no audit row', async () => {
    const html = funnelHtml('other', '<img src="img/a.jpg"><a href="https://app.example/x?email={{email}}">x</a>');
    const res = await upload('aivideo', html);
    expect(res.statusCode).toBe(422);
    expect(res.json()).toEqual({
      error: 'lint_failed',
      detail: {
        errors: [
          { code: 'config_funnel_mismatch', message: 'CONFIG.funnel là "other", slug là "aivideo"', line: 1 },
          { code: 'relative_media', message: 'img/a.jpg: ảnh/video phải là URL https trên thư viện media (S3)', line: 1 },
          { code: 'email_in_url', message: expect.any(String), line: 1 },
        ],
        warnings: [],
      },
    });
    expect(store.objects.size).toBe(0);
    expect(await count('versions')).toBe(0);
    expect(await count('audit_log')).toBe(0);
  });

  it('over 1 MiB → 422 lint_failed too_large', async () => {
    const res = await upload('aivideo', funnelHtml('aivideo', 'x'.repeat(1024 * 1024)));
    expect(res.statusCode).toBe(422);
    expect(res.json().detail.errors.map((e) => e.code)).toEqual(['too_large']);
  });

  it('warnings only: the version is created and carries the server report (the CLI report kept under client)', async () => {
    const html = funnelHtml('aivideo', '<div id="demock"></div>').replace(/<meta name="viewport"[^>]*>/, '');
    const res = await upload('aivideo', html, { lint_report: { lint: 'pass', smoke: 'pass', screens: 3 } });
    expect(res.statusCode).toBe(201);
    const { rows } = await db.pool.query('SELECT lint_report FROM versions');
    expect(rows[0].lint_report).toEqual({
      errors: [],
      warnings: [
        { code: 'inline_demo_checkout', message: expect.any(String), line: 1 },
        { code: 'missing_meta_viewport', message: 'thiếu <meta name="viewport">' },
      ],
      client: { lint: 'pass', smoke: 'pass', screens: 3 },
    });
    const audit = (await db.pool.query('SELECT details FROM audit_log')).rows[0].details;
    expect(audit.lint).toEqual({ errors: 0, warnings: 2 });
  });

  it('no_get_app_hook is a warning only for a funnel attached to an app of kind app', async () => {
    await seedVersions(db.pool, store, 'aivideo', 1);
    const warnings = async (marker) => (await upload('aivideo', funnelHtml('aivideo', marker))).json() && (
      await db.pool.query('SELECT lint_report FROM versions ORDER BY n DESC LIMIT 1')
    ).rows[0].lint_report.warnings.map((w) => w.code);
    expect(await warnings('none')).toEqual([]);
    await seedApp(db.pool);
    await db.pool.query("UPDATE funnels SET app_id = 'starlyn' WHERE slug = 'aivideo'");
    expect(await warnings('app')).toEqual(['no_get_app_hook']);
    expect(await warnings('<button data-ikf="get-app">Get</button>')).toEqual([]);
    await seedApp(db.pool, undefined, WEB_BODY);
    await db.pool.query("UPDATE funnels SET app_id = 'tarot-web' WHERE slug = 'aivideo'");
    expect(await warnings('web')).toEqual([]);
  });

  it('publish checks: the version exists, its lint has no errors, the host is known and active', async () => {
    await seedVersions(db.pool, store, 'aivideo', 2);
    const put = (host, v) => app.inject({ method: 'PUT', url: `/v1/routes/${host}`, headers: bearer(admin), payload: { prefix: '/', funnel: 'aivideo', v } });
    expect((await put('a.example.com', 9)).json()).toEqual({ error: 'version_not_found', detail: { funnel: 'aivideo', v: 9 } });
    expect((await put('off.example.com', 1)).json()).toEqual({ error: 'domain_disabled', detail: { host: 'off.example.com' } });
    expect((await put('none.example.com', 1)).json()).toEqual({ error: 'domain_not_found', detail: { host: 'none.example.com' } });
    // A version stored before the server linted uploads may carry errors.
    await db.pool.query(`UPDATE versions SET lint_report = '{"errors":[{"code":"relative_media"}],"warnings":[]}' WHERE n = 2`);
    const bad = await put('a.example.com', 2);
    expect(bad.statusCode).toBe(409);
    expect(bad.json()).toEqual({ error: 'version_lint_failed', detail: { funnel: 'aivideo', v: 2, errors: ['relative_media'] } });
    expect((await put('a.example.com', 1)).statusCode).toBe(200);
  });
});
```

`publish.test.js` (mã lỗi upload theo A12, `lint_report` mới), `validate.test.js` (allowlist), `helpers/pages.js` (meta viewport) (áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/test/helpers/pages.js b/services/core-api/test/helpers/pages.js
index ceef01e..8c46d13 100644
--- a/services/core-api/test/helpers/pages.js
+++ b/services/core-api/test/helpers/pages.js
@@ -1,2 +1,2 @@
 export const funnelHtml = (slug, marker = '') =>
-  `<!doctype html><html><head><title>${slug}</title></head><body><p>${marker}</p><script>const CONFIG={funnel:'${slug}'};</script></body></html>`;
+  `<!doctype html><html><head><title>${slug}</title><meta name="viewport" content="width=device-width"></head><body><p>${marker}</p><script>const CONFIG={funnel:'${slug}'};</script></body></html>`;
diff --git a/services/core-api/test/publish.test.js b/services/core-api/test/publish.test.js
index 7efaeb9..70aec86 100644
--- a/services/core-api/test/publish.test.js
+++ b/services/core-api/test/publish.test.js
@@ -43,7 +43,7 @@ describe('POST /v1/funnels/:slug/versions', () => {
         n: 1,
         r2_key: 'bundles/aivideo/v1/index.html',
         size: Buffer.byteLength(html),
-        lint_report: { lint: 'pass', smoke: 'pass' },
+        lint_report: { errors: [], warnings: [], client: { lint: 'pass', smoke: 'pass' } },
         created_by: 'publisher',
       },
     ]);
@@ -67,25 +67,29 @@ describe('POST /v1/funnels/:slug/versions', () => {
     expect((await publish('aivideo', a)).json().v).toBe(3);
   });
 
-  it('422 with every violation, and nothing stored', async () => {
+  it('422 lint_failed with every finding, and nothing stored', async () => {
     const html = funnelHtml('other', '<img src="img/a.jpg">');
     const res = await publish('aivideo', html);
     expect(res.statusCode).toBe(422);
+    expect(res.json().error).toBe('lint_failed');
+    expect(res.json().detail.errors.map((e) => e.code)).toEqual(['config_funnel_mismatch', 'relative_media']);
+    expect(store.objects.size).toBe(0);
+    expect(await count('funnels')).toBe(0);
+  });
+
+  it('422 for an absolute media URL outside the media library (publisher check after lint)', async () => {
+    const res = await publish('aivideo', funnelHtml('aivideo', '<img src="https://elsewhere.test/a.jpg">'));
+    expect(res.statusCode).toBe(422);
     expect(res.json()).toEqual({
       error: 'media_origin_not_allowed',
-      detail: [
-        { code: 'media_origin_not_allowed', detail: { urls: ['img/a.jpg'] } },
-        { code: 'slug_mismatch', detail: { expected: 'aivideo', found: 'other' } },
-      ],
+      detail: [{ code: 'media_origin_not_allowed', detail: { urls: ['https://elsewhere.test/a.jpg'] } }],
     });
-    expect(store.objects.size).toBe(0);
-    expect(await count('funnels')).toBe(0);
   });
 
-  it('413 for html over 1MB', async () => {
+  it('422 lint_failed too_large for html over 1MB', async () => {
     const res = await publish('aivideo', funnelHtml('aivideo', 'x'.repeat(1024 * 1024)));
-    expect(res.statusCode).toBe(413);
-    expect(res.json().error).toBe('bundle_too_large');
+    expect(res.statusCode).toBe(422);
+    expect(res.json().detail.errors.map((e) => e.code)).toEqual(['too_large']);
   });
 
   it('400 when sha256 does not match the html', async () => {
diff --git a/services/core-api/test/validate.test.js b/services/core-api/test/validate.test.js
index 38b479b..2d63818 100644
--- a/services/core-api/test/validate.test.js
+++ b/services/core-api/test/validate.test.js
@@ -82,7 +82,13 @@ describe('validateBundle', () => {
     expect(urlsOf(r, 'media_origin_not_allowed')).toEqual(['img/next.webp']);
   });
 
-  it('rejects any external <script src>', () => {
+  it('allows scripts from the funnel-lint allowlist (Paddle, Turnstile, Meta) and the media library', () => {
+    const head = ['https://cdn.paddle.com/paddle/v2/paddle.js', 'https://challenges.cloudflare.com/turnstile/v0/api.js', `${MEDIA}lib.js`]
+      .map((src) => `<script src="${src}"></script>`).join('');
+    expect(validateBundle(page({ head }), opts).ok).toBe(true);
+  });
+
+  it('rejects any other external <script src>', () => {
     const r = validateBundle(page({ head: '<script src="https://cdn.test/lib.js"></script>' }), opts);
     expect(r.status).toBe(422);
     expect(urlsOf(r, 'script_origin_not_allowed')).toEqual(['https://cdn.test/lib.js']);
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/upload-lint.test.js test/publish.test.js test/validate.test.js 2>&1 | grep -E "×|Tests  "
```

Expected: 5 test upload-lint, 3 test publish (`creates v1…`, `422 lint_failed with every finding…`, `422 lint_failed too_large…`) và `validateBundle > allows scripts from the funnel-lint allowlist…` FAIL; `Tests  9 failed | 29 passed (38)`.

- [ ] **Step 3: Implement (core)**

Dependency, Dockerfile, workflow (áp dụng đúng diff này), rồi `npm install`:

```bash
git apply <<'PATCH'
diff --git a/.github/workflows/core-api.yml b/.github/workflows/core-api.yml
index 90f8119..73e6c63 100644
--- a/.github/workflows/core-api.yml
+++ b/.github/workflows/core-api.yml
@@ -2,10 +2,10 @@ name: core-api
 
 on:
   pull_request:
-    paths: ["services/core-api/**", "packages/route-match/**", "packages/paddle/**", "packages/event-schema/**", "docs/integration/**", "package-lock.json", ".github/workflows/core-api.yml"]
+    paths: ["services/core-api/**", "packages/route-match/**", "packages/paddle/**", "packages/event-schema/**", "packages/funnel-lint/**", "docs/integration/**", "package-lock.json", ".github/workflows/core-api.yml"]
   push:
     branches: [main]
-    paths: ["services/core-api/**", "packages/route-match/**", "packages/paddle/**", "packages/event-schema/**", "docs/integration/**", "package-lock.json", ".github/workflows/core-api.yml"]
+    paths: ["services/core-api/**", "packages/route-match/**", "packages/paddle/**", "packages/event-schema/**", "packages/funnel-lint/**", "docs/integration/**", "package-lock.json", ".github/workflows/core-api.yml"]
 
 permissions:
   contents: read
@@ -21,7 +21,7 @@ jobs:
           cache: npm
           cache-dependency-path: package-lock.json
       - run: npm ci
-      - run: npm test -w @ikf/route-match -w @ikf/paddle -w @ikf/event-schema -w @ikf/core-api
+      - run: npm test -w @ikf/route-match -w @ikf/paddle -w @ikf/event-schema -w @ikf/funnel-lint -w @ikf/core-api
 
   deploy:
     if: github.event_name == 'push'
diff --git a/services/core-api/Dockerfile b/services/core-api/Dockerfile
index 6077bb0..6905898 100644
--- a/services/core-api/Dockerfile
+++ b/services/core-api/Dockerfile
@@ -6,11 +6,13 @@ COPY package.json package-lock.json ./
 COPY packages/route-match/package.json packages/route-match/
 COPY packages/paddle/package.json packages/paddle/
 COPY packages/event-schema/package.json packages/event-schema/
+COPY packages/funnel-lint/package.json packages/funnel-lint/
 COPY services/core-api/package.json services/core-api/
 RUN npm ci --omit=dev -w @ikf/core-api
 COPY packages/route-match/src packages/route-match/src
 COPY packages/paddle/src packages/paddle/src
 COPY packages/event-schema/src packages/event-schema/src
+COPY packages/funnel-lint/src packages/funnel-lint/src
 COPY services/core-api/src services/core-api/src
 COPY services/core-api/migrations services/core-api/migrations
 WORKDIR /app/services/core-api
diff --git a/services/core-api/package.json b/services/core-api/package.json
index 7f7acea..73b21b3 100644
--- a/services/core-api/package.json
+++ b/services/core-api/package.json
@@ -16,6 +16,7 @@
     "@aws-sdk/client-sns": "^3.1148.0",
     "@aws-sdk/client-sqs": "^3.1148.0",
     "@ikf/event-schema": "*",
+    "@ikf/funnel-lint": "*",
     "@ikf/paddle": "*",
     "@ikf/route-match": "*",
     "fastify": "^5.12.5",
PATCH
```

```bash
npm install
```

Lint khi upload, allowlist chung, kiểm lint khi publish (áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/http/versions.js b/services/core-api/src/http/versions.js
index 56e2a7c..c36f376 100644
--- a/services/core-api/src/http/versions.js
+++ b/services/core-api/src/http/versions.js
@@ -1,8 +1,15 @@
+import { lint } from '@ikf/funnel-lint';
 import { requireRole } from '../auth.js';
 import { HttpError } from '../errors.js';
 import { publishVersion, sha256Hex } from '../publisher/publish.js';
 import { validateBundle } from '../publisher/validate.js';
 
+// 'app' | 'web' for a funnel attached to an app (no_get_app_hook applies to 'app'), else null.
+async function funnelAppKind(pool, slug) {
+  const { rows } = await pool.query('SELECT a.kind FROM funnels f JOIN apps a ON a.id = f.app_id WHERE f.slug = $1', [slug]);
+  return rows[0]?.kind ?? null;
+}
+
 export default async function versionsHttp(app, { pool, store, mediaOrigins, previewBaseUrl }) {
   app.post(
     '/v1/funnels/:slug/versions',
@@ -28,10 +35,14 @@ export default async function versionsHttp(app, { pool, store, mediaOrigins, pre
     },
     async (req, reply) => {
       const { slug } = req.params;
-      const { html, sha256, lint_report: lintReport } = req.body;
+      const { html, sha256, lint_report: clientReport } = req.body;
       if (sha256Hex(html) !== sha256) throw new HttpError(400, 'sha256_mismatch');
+      // Server lint on every upload, CLI or web (spec admin-console-p1 §4); errors create no version.
+      const report = lint(html, { slug, app: await funnelAppKind(pool, slug), mediaOrigins });
+      if (report.errors.length) throw new HttpError(422, 'lint_failed', report);
       const check = validateBundle(html, { slug, mediaOrigins });
       if (!check.ok) throw new HttpError(check.status, check.errors[0].code, check.errors);
+      const lintReport = { ...report, ...(clientReport && { client: clientReport }) };
       const r = await publishVersion({ pool, store, previewBaseUrl }, { slug, html, lintReport, actor: req.actor });
       reply.code(r.created ? 201 : 200);
       return { funnel: r.funnel, v: r.v, sha256: r.sha256, created: r.created, preview_url: r.previewUrl };
diff --git a/services/core-api/src/publisher/routes.js b/services/core-api/src/publisher/routes.js
index f006cba..952d13f 100644
--- a/services/core-api/src/publisher/routes.js
+++ b/services/core-api/src/publisher/routes.js
@@ -56,9 +56,12 @@ export async function setRoute(pool, kv, { host, prefix, slug, v, actor, confirm
   const who = actorOf(actor);
   const out = await inHostTx(pool, host, {}, async (c) => {
     const ver = (
-      await c.query('SELECT v.id FROM versions v JOIN funnels f ON f.id = v.funnel_id WHERE f.slug = $1 AND v.n = $2', [slug, v])
+      await c.query('SELECT v.id, v.lint_report FROM versions v JOIN funnels f ON f.id = v.funnel_id WHERE f.slug = $1 AND v.n = $2', [slug, v])
     ).rows[0];
     if (!ver) throw new HttpError(404, 'version_not_found', { funnel: slug, v });
+    // Uploads with lint errors are refused since admin-console-p1; an older version may still carry some.
+    const lintErrors = Array.isArray(ver.lint_report?.errors) ? ver.lint_report.errors : [];
+    if (lintErrors.length) throw new HttpError(409, 'version_lint_failed', { funnel: slug, v, errors: lintErrors.map((e) => e.code) });
     const cur = await currentRoute(c, host, p);
     if (cur && cur.slug !== slug && !confirmFunnelChange) {
       throw new HttpError(409, 'funnel_change_requires_confirmation', { from: cur.slug, to: slug });
diff --git a/services/core-api/src/publisher/validate.js b/services/core-api/src/publisher/validate.js
index 8fc8bc9..bf54e69 100644
--- a/services/core-api/src/publisher/validate.js
+++ b/services/core-api/src/publisher/validate.js
@@ -1,9 +1,9 @@
+import { SCRIPT_ALLOWLIST } from '@ikf/funnel-lint';
 import { Parser } from 'htmlparser2';
 
 export const MAX_BUNDLE_BYTES = 1024 * 1024;
 
 const ASSET_ALLOWLIST = ['https://fonts.googleapis.com/', 'https://fonts.gstatic.com/'];
-const SCRIPT_ALLOWLIST = [];
 
 const IMG_BLOCK = /\/\*IMG-START\*\/([\s\S]*?)\/\*IMG-END\*\//;
 const IMG_ENTRY = /(['"])([^'"]+)\1\s*:\s*(['"])([^'"]*)\3/g;
@@ -87,7 +87,9 @@ export function validateBundle(html, { slug, mediaOrigins, maxBytes = MAX_BUNDLE
   const badMedia = [...media].filter((u) => !u.startsWith('data:') && !u.startsWith('#') && !underAny(u, mediaPrefixes));
   if (badMedia.length) errors.push({ code: 'media_origin_not_allowed', detail: { urls: badMedia } });
 
-  const badScripts = [...scripts].filter((u) => !underAny(u, SCRIPT_ALLOWLIST));
+  // Same script allowlist as @ikf/funnel-lint (Paddle, Turnstile, Meta, fonts), plus the media library.
+  const scriptPrefixes = [...SCRIPT_ALLOWLIST, ...mediaOrigins.map(asDirectory)];
+  const badScripts = [...scripts].filter((u) => !underAny(u, scriptPrefixes));
   if (badScripts.length) errors.push({ code: 'script_origin_not_allowed', detail: { urls: badScripts } });
 
   const found = CONFIG_FUNNEL.exec(html)?.[2] ?? null;
PATCH
```

- [ ] **Step 4: Chạy test core, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/upload-lint.test.js test/publish.test.js test/validate.test.js 2>&1 | grep -E "Tests  "
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  38 passed (38)`; toàn bộ `Test Files  41 passed (41)`, `Tests  399 passed (399)`.

- [ ] **Step 5: Viết test fail (CLI)**

`packages/cli/test/publish.test.js` (sửa, áp dụng đúng diff này; trang `'x'` cũ không có `CONFIG.funnel` nên giờ dừng ở lint):

```bash
git apply <<'PATCH'
diff --git a/packages/cli/test/publish.test.js b/packages/cli/test/publish.test.js
index 4726b98..38773db 100644
--- a/packages/cli/test/publish.test.js
+++ b/packages/cli/test/publish.test.js
@@ -5,6 +5,8 @@ import { tmpdir } from 'node:os';
 import { join } from 'node:path';
 import { run } from '../src/main.js';
 
+const PAGE = "<script>const CONFIG={funnel:'aivideo'}</script>";
+
 async function funnelFolder(html) {
   const root = await mkdtemp(join(tmpdir(), 'ikf-pub-'));
   const tools = join(root, 'funnel', 'tools');
@@ -50,7 +52,7 @@ describe('ikf publish', () => {
   });
 
   it('says when nothing changed', async () => {
-    const folder = await funnelFolder('x');
+    const folder = await funnelFolder(PAGE);
     const lines = [];
     await run(['publish', folder, '--slug', 'aivideo'], {
       out: (l) => lines.push(l),
@@ -64,7 +66,7 @@ describe('ikf publish', () => {
   });
 
   it('exits 1 with the tool output when smoke fails, without calling the API', async () => {
-    const folder = await funnelFolder('x');
+    const folder = await funnelFolder(PAGE);
     const errors = [];
     let called = false;
     const code = await run(['publish', folder, '--slug', 'aivideo'], {
@@ -103,6 +105,61 @@ describe('ikf publish', () => {
   });
 });
 
+describe('ikf publish: @ikf/funnel-lint before anything else (spec admin-console-p1 §4)', () => {
+  it('lint errors: exit 1 with each finding and its line, before the local tools and the API', async () => {
+    const folder = await funnelFolder("<img src='img/a.jpg'>\n<script>const CONFIG={funnel:'other'}</script>");
+    const errors = [];
+    const calls = [];
+    const code = await run(['publish', folder, '--slug', 'aivideo'], {
+      out: () => {},
+      err: (l) => errors.push(l),
+      env: {},
+      deps: { runner: async (cmd) => { calls.push(cmd); return { code: 0, output: '' }; }, api: { publish: async () => calls.push('api') } },
+    });
+    expect(code).toBe(1);
+    expect(calls).toEqual([]);
+    expect(errors).toEqual([
+      'Lint: 2 lỗi, 1 cảnh báo (không upload)\n'
+      + '  config_funnel_mismatch (dòng 2): CONFIG.funnel là "other", slug là "aivideo"\n'
+      + '  relative_media (dòng 1): img/a.jpg: ảnh/video phải là URL https trên thư viện media (S3)\n'
+      + '  cảnh báo missing_meta_viewport: thiếu <meta name="viewport">',
+    ]);
+  });
+
+  it('warnings: printed, then the upload goes ahead', async () => {
+    const folder = await funnelFolder(PAGE);
+    const lines = [];
+    const code = await run(['publish', folder, '--slug', 'aivideo'], {
+      out: (l) => lines.push(l),
+      env: {},
+      deps: { runner: async () => ({ code: 0, output: '' }), api: { publish: async () => ({ funnel: 'aivideo', v: 1, created: true, preview_url: 'p' }) } },
+    });
+    expect(code).toBe(0);
+    expect(lines.slice(0, 2)).toEqual(['Lint: 0 lỗi, 1 cảnh báo', '  cảnh báo missing_meta_viewport: thiếu <meta name="viewport">']);
+  });
+
+  it('a 422 lint_failed from the server prints the findings', async () => {
+    const folder = await funnelFolder(PAGE);
+    const errors = [];
+    const { ApiError } = await import('../src/api.js');
+    const code = await run(['publish', folder, '--slug', 'aivideo'], {
+      out: () => {},
+      err: (l) => errors.push(l),
+      env: {},
+      deps: {
+        runner: async () => ({ code: 0, output: '' }),
+        api: {
+          publish: async () => {
+            throw new ApiError(422, { error: 'lint_failed', detail: { errors: [{ code: 'external_script', message: '<script src="x.js">', line: 4 }], warnings: [] } });
+          },
+        },
+      },
+    });
+    expect(code).toBe(1);
+    expect(errors).toEqual(['Lỗi 422 lint_failed\n  external_script (dòng 4): <script src="x.js">']);
+  });
+});
+
 describe('ikf publish: unmapped plan warning', () => {
   const html = "<script>const CONFIG={funnel:'aivideo',plans:{'1w':{price:'$1'},m1:{price:'$2'}},checkoutUrl:{'1w':'',m1:'',addon:''}}</script>";
   const publish = async () => ({ funnel: 'aivideo', v: 4, created: true, preview_url: 'p' });
PATCH
```

```bash
npm test -w @ikf/cli -- test/publish.test.js 2>&1 | grep -E "×|Tests  "
```

Expected: 3 test `ikf publish: @ikf/funnel-lint before anything else` FAIL; `Tests  3 failed | 8 passed (11)`.

- [ ] **Step 6: Implement (CLI)**

```bash
git apply <<'PATCH'
diff --git a/packages/cli/package.json b/packages/cli/package.json
index 79c789c..fc5a90f 100644
--- a/packages/cli/package.json
+++ b/packages/cli/package.json
@@ -5,6 +5,6 @@
   "bin": { "ikf": "src/main.js" },
   "engines": { "node": ">=22" },
   "scripts": { "test": "vitest run" },
-  "dependencies": { "@ikf/route-match": "*" },
+  "dependencies": { "@ikf/funnel-lint": "*", "@ikf/route-match": "*" },
   "devDependencies": { "vitest": "~3.2.0" }
 }
diff --git a/packages/cli/src/main.js b/packages/cli/src/main.js
index c8f3974..5da17f1 100755
--- a/packages/cli/src/main.js
+++ b/packages/cli/src/main.js
@@ -5,7 +5,7 @@ import { parseArgs } from 'node:util';
 import { ApiError, createApi } from './api.js';
 import { CheckFailedError } from './checks.js';
 import { loadCredentials, saveCredentials } from './credentials.js';
-import { publishCommand } from './publish.js';
+import { formatFindings, LintFailedError, publishCommand } from './publish.js';
 import { createQueuesApi, QueuesApiError, replayDlq } from './replay.js';
 import { parseTarget, parseVersionRef, UsageError } from './target.js';
 
@@ -237,6 +237,9 @@ export function formatApiError(e) {
   if (e.code === 'funnel_change_requires_confirmation') {
     return `Route đang trỏ tới funnel "${e.detail.from}". Chạy lại với --yes để chuyển sang "${e.detail.to}".`;
   }
+  if (e.code === 'lint_failed' && Array.isArray(e.detail?.errors)) {
+    return [`Lỗi ${e.status} lint_failed`, ...formatFindings({ errors: e.detail.errors })].join('\n');
+  }
   if (e.code === 'key_rotation_pending') {
     return `Key trước vẫn còn hiệu lực tới ${e.detail?.prev_key_expires_at}. Xoay tiếp bây giờ sẽ khoá key đó NGAY: chỉ chạy lại với --force khi chắc backend đã dùng key mới nhất.`;
   }
@@ -361,6 +364,11 @@ export async function run(argv, { out = console.log, err = console.error, env =
       err(e.message);
       return 2;
     }
+    if (e instanceof LintFailedError) {
+      const { errors, warnings } = e.report;
+      err([`Lint: ${errors.length} lỗi, ${warnings.length} cảnh báo (không upload)`, ...formatFindings(e.report)].join('\n'));
+      return 1;
+    }
     if (e instanceof CheckFailedError) {
       err(`${e.stage} fail:\n${e.output}`);
       return 1;
diff --git a/packages/cli/src/publish.js b/packages/cli/src/publish.js
index 150c353..8228d87 100644
--- a/packages/cli/src/publish.js
+++ b/packages/cli/src/publish.js
@@ -1,12 +1,27 @@
 import { createHash } from 'node:crypto';
 import { readFile } from 'node:fs/promises';
 import { join } from 'node:path';
+import { lint } from '@ikf/funnel-lint';
 import { findToolsDir, runLocalChecks } from './checks.js';
 import { planKeysFromHtml } from './plans.js';
 import { UsageError } from './target.js';
 
 const SLUG = /^[a-z0-9][a-z0-9-]{1,62}$/;
 
+export class LintFailedError extends Error {
+  constructor(report) {
+    super('lint failed');
+    this.report = report;
+  }
+}
+
+const at = (f) => (f.line ? ` (dòng ${f.line})` : '');
+// One line per finding: errors, then warnings.
+export const formatFindings = ({ errors = [], warnings = [] }) => [
+  ...errors.map((f) => `  ${f.code}${at(f)}: ${f.message}`),
+  ...warnings.map((f) => `  cảnh báo ${f.code}${at(f)}: ${f.message}`),
+];
+
 export async function publishCommand({ api, folder, slug, out, runner, env = process.env }) {
   if (!folder || !slug) throw new UsageError('cách dùng: ikf publish <folder> --slug <slug>');
   if (!SLUG.test(slug)) throw new UsageError(`slug không hợp lệ: ${slug} (a-z, 0-9, dấu gạch ngang; 2-63 ký tự)`);
@@ -17,6 +32,13 @@ export async function publishCommand({ api, folder, slug, out, runner, env = pro
   } catch {
     throw new UsageError(`không tìm thấy ${demoPath}`);
   }
+  // The same lint core runs on upload (spec admin-console-p1 §4): report before the slow local checks.
+  const report = lint(html, { slug });
+  if (report.errors.length) throw new LintFailedError(report);
+  if (report.warnings.length) {
+    out(`Lint: 0 lỗi, ${report.warnings.length} cảnh báo`);
+    for (const l of formatFindings(report)) out(l);
+  }
   const tools = await findToolsDir(folder, env);
   out('Đang chạy lint + smoke...');
   const lintReport = await runLocalChecks({ folder, html, tools, runner });
PATCH
```

```bash
npm install
npm test -w @ikf/cli 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Test Files  12 passed (12)`, `Tests  121 passed (121)`.

- [ ] **Step 7: Commit**

```bash
git add services/core-api packages/cli package-lock.json .github/workflows/core-api.yml
git commit -m "feat: lint every upload on the server (422 lint_failed), refuse publishing a version with lint errors, ikf publish lints first"
```

---

### Task 8: API người dùng admin `GET/POST /v1/admin/users`, `PUT /v1/admin/users/:id`

**Files:**
- Modify: `services/core-api/src/admin/users.js` (thay toàn bộ: thêm `listUsers`, `createUser`, `updateUser`; giữ `ensureLocalAdmin`), `src/app.js`
- Create: `services/core-api/src/http/users.js`
- Test: `services/core-api/test/users.test.js` (mới)

**Interfaces:**
- Consumes: `ALLOWED_HD` (Task 4), `audit` (Task 2), `requireRole(pool, 'admin')`, `USER_ROLES` (Task 3), `withTx`.
- Produces: `listUsers(pool)` → `{users: [{id, email, name, role, disabled_at, created_by, created_at}]}`; `createUser(pool, {email, name, role}, actor)` (`400 invalid_email {email, domain}`, `409 user_exists {email}`; audit `admin.user.create {email, role}`); `updateUser(pool, id, {role?, name?, disabled?}, actor)` (`404 user_not_found {id}`, `409 cannot_lock_self`; khoá xoá phiên; audit `admin.user.disable` | `admin.user.update {email, role, enabled?}`). HTTP admin-only; body `PUT` cần ít nhất một field.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/users.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, tokenFor, bearer } from './helpers/app.js';
import { signIn } from './helpers/admin.js';

describe('admin users API (spec admin-console-p1 §3)', () => {
  let db;
  let app;
  let boss;

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    ({ app } = await makeApp(db.pool));
    boss = await signIn(db.pool, 'boss@ikameglobal.com', 'admin');
  });
  afterEach(() => app.close());

  const call = (method, url, payload, headers = boss.headers()) => app.inject({ method, url, headers, ...(payload && { payload }) });
  const auditRows = async () => (await db.pool.query('SELECT actor, action, target, details FROM audit_log ORDER BY id')).rows;

  it('an admin lists and adds people (email lowercased, company domain only); 409 if the email exists', async () => {
    const res = await call('POST', '/v1/admin/users', { email: ' An.Nguyen@IkameGlobal.com ', name: 'An', role: 'editor' });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual({
      id: 2, email: 'an.nguyen@ikameglobal.com', name: 'An', role: 'editor', disabled_at: null, created_by: 'boss@ikameglobal.com', created_at: expect.any(String),
    });
    expect((await call('POST', '/v1/admin/users', { email: 'an.nguyen@ikameglobal.com', role: 'viewer' })).json()).toEqual({
      error: 'user_exists', detail: { email: 'an.nguyen@ikameglobal.com' },
    });
    expect((await call('POST', '/v1/admin/users', { email: 'x@gmail.com', role: 'viewer' })).json()).toEqual({
      error: 'invalid_email', detail: { email: 'x@gmail.com', domain: 'ikameglobal.com' },
    });
    expect((await call('POST', '/v1/admin/users', { email: 'y@ikameglobal.com', role: 'owner' })).statusCode).toBe(400);
    const list = (await call('GET', '/v1/admin/users')).json();
    expect(list.users.map((u) => [u.email, u.role])).toEqual([['an.nguyen@ikameglobal.com', 'editor'], ['boss@ikameglobal.com', 'admin']]);
    expect(await auditRows()).toEqual([
      { actor: 'boss@ikameglobal.com', action: 'admin.user.create', target: 'user:an.nguyen@ikameglobal.com', details: { email: 'an.nguyen@ikameglobal.com', role: 'editor' } },
    ]);
  });

  it('change a role; disable (their sessions end at once) and enable again; each change audited', async () => {
    const an = await signIn(db.pool, 'an@ikameglobal.com', 'viewer');
    expect((await call('PUT', `/v1/admin/users/${an.id}`, { role: 'editor' })).json()).toMatchObject({ role: 'editor', disabled_at: null });
    const off = await call('PUT', `/v1/admin/users/${an.id}`, { disabled: true });
    expect(off.json().disabled_at).toEqual(expect.any(String));
    expect((await db.pool.query('SELECT count(*)::int AS n FROM admin_sessions WHERE user_id = $1', [an.id])).rows[0].n).toBe(0);
    expect((await app.inject({ method: 'GET', url: '/v1/funnels', headers: an.headers(false) })).statusCode).toBe(401);
    expect((await call('PUT', `/v1/admin/users/${an.id}`, { disabled: false })).json().disabled_at).toBeNull();
    expect((await auditRows()).map((r) => [r.action, r.details])).toEqual([
      ['admin.user.update', { email: 'an@ikameglobal.com', role: 'editor' }],
      ['admin.user.disable', { email: 'an@ikameglobal.com', role: 'editor' }],
      ['admin.user.update', { email: 'an@ikameglobal.com', role: 'editor', enabled: true }],
    ]);
  });

  it('nobody locks themselves out: no disabling or demoting yourself; another admin can', async () => {
    for (const body of [{ disabled: true }, { role: 'editor' }]) {
      expect((await call('PUT', `/v1/admin/users/${boss.id}`, body)).json()).toEqual({ error: 'cannot_lock_self' });
    }
    expect((await call('PUT', `/v1/admin/users/${boss.id}`, { name: 'The Boss' })).json().name).toBe('The Boss');
    const other = await signIn(db.pool, 'other@ikameglobal.com', 'admin');
    expect((await call('PUT', `/v1/admin/users/${boss.id}`, { role: 'editor' }, other.headers())).json().role).toBe('editor');
  });

  it('admins only (an admin token works, e.g. ikf admin add); 404 for an unknown id; 400 for an empty change', async () => {
    const ed = await signIn(db.pool, 'ed@ikameglobal.com', 'editor');
    expect((await call('GET', '/v1/admin/users', null, ed.headers())).statusCode).toBe(403);
    expect((await call('POST', '/v1/admin/users', { email: 'z@ikameglobal.com', role: 'viewer' }, ed.headers())).statusCode).toBe(403);
    const token = await tokenFor(db.pool, 'admin');
    expect((await call('POST', '/v1/admin/users', { email: 'z@ikameglobal.com', role: 'viewer' }, bearer(token))).json().created_by).toBe('admin');
    expect((await call('PUT', '/v1/admin/users/999', { role: 'viewer' })).json()).toEqual({ error: 'user_not_found', detail: { id: 999 } });
    expect((await call('PUT', `/v1/admin/users/${ed.id}`, {})).statusCode).toBe(400);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/users.test.js 2>&1 | grep -E "×|Tests  "
```

Expected: `Tests  4 failed (4)` (route chưa có).

- [ ] **Step 3: Implement**

`services/core-api/src/admin/users.js` (thay toàn bộ nội dung):

```js
// admin_users: the people who may sign in to the admin console (spec admin-console-p1 §2, §3).
import { audit } from '../audit.js';
import { HttpError } from '../errors.js';
import { withTx } from '../identity/link.js';
import { ALLOWED_HD } from './google.js';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const COLUMNS = 'id, email, name, role, disabled_at, created_by, created_at';

const view = (r) => ({
  id: Number(r.id),
  email: r.email,
  name: r.name,
  role: r.role,
  disabled_at: r.disabled_at ? r.disabled_at.toISOString() : null,
  created_by: r.created_by,
  created_at: r.created_at.toISOString(),
});

export async function listUsers(pool) {
  const { rows } = await pool.query(`SELECT ${COLUMNS} FROM admin_users ORDER BY email`);
  return { users: rows.map(view) };
}

// Only company accounts: Google sign-in refuses any other hd anyway.
export async function createUser(pool, { email, name = '', role }, actor) {
  const e = email.trim().toLowerCase();
  if (!EMAIL_RE.test(e) || !e.endsWith(`@${ALLOWED_HD}`)) throw new HttpError(400, 'invalid_email', { email: e, domain: ALLOWED_HD });
  return withTx(pool, async (c) => {
    const { rows } = await c.query(
      `INSERT INTO admin_users (email, name, role, created_by) VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING RETURNING ${COLUMNS}`,
      [e, name.trim(), role, actor.name],
    );
    if (!rows.length) throw new HttpError(409, 'user_exists', { email: e });
    await audit(c, actor, 'admin.user.create', `user:${e}`, { email: e, role });
    return view(rows[0]);
  });
}

// {role?, name?, disabled?}. Disabling ends the person's sessions at once. Nobody disables or demotes themselves.
export async function updateUser(pool, id, { role, name, disabled }, actor) {
  if (actor.kind === 'user' && actor.userId === id && (disabled === true || (role !== undefined && role !== 'admin'))) {
    throw new HttpError(409, 'cannot_lock_self');
  }
  return withTx(pool, async (c) => {
    const cur = (await c.query(`SELECT ${COLUMNS} FROM admin_users WHERE id = $1 FOR UPDATE`, [id])).rows[0];
    if (!cur) throw new HttpError(404, 'user_not_found', { id });
    const { rows } = await c.query(
      `UPDATE admin_users SET role = COALESCE($2, role), name = COALESCE($3, name),
              disabled_at = CASE WHEN $4::boolean IS NULL THEN disabled_at WHEN $4 THEN COALESCE(disabled_at, now()) ELSE NULL END
        WHERE id = $1 RETURNING ${COLUMNS}`,
      [id, role ?? null, name?.trim() ?? null, disabled ?? null],
    );
    const u = rows[0];
    if (disabled === true) await c.query('DELETE FROM admin_sessions WHERE user_id = $1', [id]);
    const action = disabled === true && !cur.disabled_at ? 'admin.user.disable' : 'admin.user.update';
    await audit(c, actor, action, `user:${u.email}`, { email: u.email, role: u.role, ...(disabled === false && cur.disabled_at && { enabled: true }) });
    return view(u);
  });
}

// The local demo's --admin-user (APP_ENV=local only): an enabled admin, created on first use.
export async function ensureLocalAdmin(db, email) {
  const { rows } = await db.query(
    `INSERT INTO admin_users (email, name, role, created_by) VALUES ($1, 'Local admin', 'admin', 'local')
     ON CONFLICT (email) DO UPDATE SET role = 'admin', disabled_at = NULL
     RETURNING id, email, name, role`,
    [email.trim().toLowerCase()],
  );
  return { ...rows[0], id: Number(rows[0].id) };
}
```

`services/core-api/src/http/users.js` (mới):

```js
import { requireRole, USER_ROLES } from '../auth.js';
import { createUser, listUsers, updateUser } from '../admin/users.js';

// Settings → Users (spec admin-console-p1 §3, §5): admins only; `ikf admin` calls it with an admin token.
export default async function usersHttp(app, { pool }) {
  const admin = requireRole(pool, 'admin');
  const role = { type: 'string', enum: USER_ROLES };
  const name = { type: 'string', maxLength: 200 };

  app.get('/v1/admin/users', { onRequest: admin }, async () => listUsers(pool));

  app.post(
    '/v1/admin/users',
    {
      onRequest: admin,
      schema: {
        body: {
          type: 'object', required: ['email', 'role'], additionalProperties: false,
          properties: { email: { type: 'string', minLength: 3, maxLength: 254 }, name, role },
        },
      },
    },
    async (req, reply) => {
      reply.code(201);
      return createUser(pool, req.body, req.actor);
    },
  );

  app.put(
    '/v1/admin/users/:id',
    {
      onRequest: admin,
      schema: {
        params: { type: 'object', required: ['id'], properties: { id: { type: 'integer', minimum: 1 } } },
        body: { type: 'object', minProperties: 1, additionalProperties: false, properties: { role, name, disabled: { type: 'boolean' } } },
      },
    },
    async (req) => updateUser(pool, req.params.id, req.body, req.actor),
  );
}
```

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/app.js b/services/core-api/src/app.js
index f889c66..16bf301 100644
--- a/services/core-api/src/app.js
+++ b/services/core-api/src/app.js
@@ -16,6 +16,7 @@ import sdkHttp from './http/sdk.js';
 import authHttp from './http/auth.js';
 import googleHttp from './http/google.js';
 import catalogHttp from './http/catalog.js';
+import usersHttp from './http/users.js';
 import { adminCors } from './admin/cors.js';
 
 export function buildApp({ checks = {}, timeoutMs = 1000, logger = false, deps } = {}) {
@@ -56,6 +57,7 @@ export function buildApp({ checks = {}, timeoutMs = 1000, logger = false, deps }
   if (deps?.pool) app.register(tokensHttp, deps);
   if (deps?.pool) app.register(domainsHttp, deps);
   if (deps?.pool) app.register(catalogHttp, deps);
+  if (deps?.pool) app.register(usersHttp, deps);
   if (deps?.store) app.register(versionsHttp, deps);
   if (deps?.kv) app.register(routesHttp, deps);
   if (deps?.kv) app.register(funnelsHttp, deps);
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/users.test.js 2>&1 | grep -E "Tests  "
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  4 passed (4)`; toàn bộ `Test Files  42 passed (42)`, `Tests  403 passed (403)`.

- [ ] **Step 5: Commit**

```bash
git add services/core-api
git commit -m "feat(core-api): admin users API (add, change role, disable; nobody locks themselves out)"
```

---

### Task 9: Dọn phiên hết hạn mỗi giờ + `ikf admin add|ls|disable`

**Files:**
- Create: `services/core-api/src/admin/sweep.js`
- Modify: `services/core-api/src/server.js`, `packages/cli/src/{api,main}.js`
- Test: `services/core-api/test/session-sweep.test.js`, `packages/cli/test/admin.test.js` (mới)

**Interfaces:**
- Consumes: `admin_sessions` (Task 1), `signIn` (Task 3); API users (Task 8).
- Produces: `SWEEP_MS = 3600000`, `sweepSessions(pool)` → số dòng xoá, `startSessionSweep({pool, log, everyMs})` → `stop()`. CLI API: `listAdminUsers()`, `createAdminUser(body)` (không retry), `updateAdminUser(id, body)` (retry). Lệnh: `ikf admin add <email> --role viewer|editor|admin [--name <tên>]`, `ikf admin ls`, `ikf admin disable <email>`; option mới `--role`.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/session-sweep.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';
import { signIn } from './helpers/admin.js';
import { startSessionSweep, sweepSessions } from '../src/admin/sweep.js';

describe('admin session sweep (hourly, in process)', () => {
  let db;
  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(() => resetDb(db.pool));

  const left = async () => (await db.pool.query('SELECT count(*)::int AS n FROM admin_sessions')).rows[0].n;

  it('deletes expired sessions only', async () => {
    await signIn(db.pool, 'a@ikameglobal.com', 'viewer');
    const b = await signIn(db.pool, 'b@ikameglobal.com', 'viewer');
    await db.pool.query("UPDATE admin_sessions SET expires_at = now() - interval '1 minute' WHERE user_id = $1", [b.id]);
    expect(await sweepSessions(db.pool)).toBe(1);
    expect(await left()).toBe(1);
  });

  it('runs on its interval until stopped; a failure logs its code only and the next tick runs', async () => {
    const logs = [];
    const log = { info: (o, m) => logs.push([m, o]), warn: (o, m) => logs.push([m, o]) };
    let calls = 0;
    const flaky = {
      query: async (...args) => {
        calls += 1;
        if (calls === 1) throw Object.assign(new Error('password for a@ikameglobal.com'), { code: 'ECONNRESET' });
        return db.pool.query(...args);
      },
    };
    const a = await signIn(db.pool, 'a@ikameglobal.com', 'viewer');
    await db.pool.query("UPDATE admin_sessions SET expires_at = now() - interval '1 minute' WHERE user_id = $1", [a.id]);
    const stop = startSessionSweep({ pool: flaky, log, everyMs: 20 });
    for (let i = 0; i < 100 && (await left()) > 0; i += 1) await new Promise((r) => setTimeout(r, 10));
    stop();
    const n = calls;
    await new Promise((r) => setTimeout(r, 60));
    expect(calls).toBe(n);
    expect(await left()).toBe(0);
    expect(logs[0]).toEqual(['admin_sessions_sweep_failed', { code: 'ECONNRESET' }]);
    expect(logs).toContainEqual(['admin_sessions_swept', { removed: 1 }]);
    expect(JSON.stringify(logs)).not.toContain('@');
  });
});
```

`packages/cli/test/admin.test.js` (mới):

```js
import { describe, it, expect } from 'vitest';
import { run } from '../src/main.js';
import { createApi } from '../src/api.js';
import { io } from './helpers/io.js';

const user = (o = {}) => ({ id: 3, email: 'an@ikameglobal.com', name: 'An', role: 'editor', disabled_at: null, created_by: 'bootstrap', created_at: '2026-10-11T08:00:00.000Z', ...o });

describe('ikf admin (admin console users, spec admin-console-p1 §6)', () => {
  it('add <email> --role <role> [--name]: creates the person', async () => {
    const calls = [];
    const t = io({ createAdminUser: async (b) => { calls.push(b); return user({ role: 'admin' }); } });
    expect(await run(['admin', 'add', 'an@ikameglobal.com', '--role', 'admin', '--name', 'An'], t.opts)).toBe(0);
    expect(calls).toEqual([{ email: 'an@ikameglobal.com', role: 'admin', name: 'An' }]);
    expect(t.lines).toEqual(['an@ikameglobal.com: admin (đã thêm). Đăng nhập trang admin bằng Google với email này.']);
  });

  it('ls: one line per person, disabled ones marked', async () => {
    const t = io({ listAdminUsers: async () => ({ users: [user(), user({ id: 4, email: 'old@ikameglobal.com', role: 'viewer', disabled_at: '2026-10-10T00:00:00.000Z' })] }) });
    expect(await run(['admin', 'ls'], t.opts)).toBe(0);
    expect(t.lines).toEqual([
      'an@ikameglobal.com               editor  hoạt động',
      'old@ikameglobal.com              viewer  khoá từ 2026-10-10T00:00:00.000Z',
    ]);
  });

  it('disable <email>: finds the person and disables them (their sessions end at once)', async () => {
    const calls = [];
    const t = io({
      listAdminUsers: async () => ({ users: [user()] }),
      updateAdminUser: async (id, b) => { calls.push([id, b]); return user({ disabled_at: '2026-10-11T09:00:00.000Z' }); },
    });
    expect(await run(['admin', 'disable', 'An@ikameglobal.com'], t.opts)).toBe(0);
    expect(calls).toEqual([[3, { disabled: true }]]);
    expect(t.lines).toEqual(['an@ikameglobal.com: đã khoá, mọi phiên đăng nhập kết thúc ngay.']);
    const missing = io({ listAdminUsers: async () => ({ users: [] }) });
    expect(await run(['admin', 'disable', 'x@ikameglobal.com'], missing.opts)).toBe(1);
    expect(missing.errors).toEqual(['Không có người dùng x@ikameglobal.com']);
  });

  it.each([
    [['admin', 'add', 'an@ikameglobal.com'], 'cần --role viewer|editor|admin'],
    [['admin', 'add', 'an@ikameglobal.com', '--role', 'owner'], 'cần --role viewer|editor|admin'],
    [['admin', 'add', 'not-an-email', '--role', 'viewer'], 'email không hợp lệ: "not-an-email"'],
    [['admin', 'rm', 'an@ikameglobal.com'], 'ikf admin add <email> --role viewer|editor|admin [--name <tên>]'],
  ])('exits 2 on bad usage %j', async (argv, msg) => {
    const t = io({ createAdminUser: async () => { throw new Error('must not be called'); } });
    expect(await run(argv, t.opts)).toBe(2);
    expect(t.errors[0]).toContain(msg);
  });
});

describe('api: admin users', () => {
  it('calls /v1/admin/users; create is not retried, update is', async () => {
    const seen = [];
    let fails = 1;
    const fetch = async (url, init) => {
      seen.push([init.method, url, init.body]);
      if (init.method === 'PUT' && fails-- > 0) return new Response('{}', { status: 503 });
      return new Response(JSON.stringify(init.method === 'GET' ? { users: [] } : user()), { status: 200 });
    };
    const api = createApi({ api: 'https://api.x/', token: 't' }, { fetch, sleep: async () => {} });
    await api.listAdminUsers();
    await api.createAdminUser({ email: 'an@ikameglobal.com', role: 'editor' });
    await api.updateAdminUser(3, { disabled: true });
    expect(seen).toEqual([
      ['GET', 'https://api.x/v1/admin/users', undefined],
      ['POST', 'https://api.x/v1/admin/users', '{"email":"an@ikameglobal.com","role":"editor"}'],
      ['PUT', 'https://api.x/v1/admin/users/3', '{"disabled":true}'],
      ['PUT', 'https://api.x/v1/admin/users/3', '{"disabled":true}'],
    ]);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/session-sweep.test.js 2>&1 | grep -E "FAIL|Tests  "
npm test -w @ikf/cli -- test/admin.test.js 2>&1 | grep -E "Tests  "
```

Expected: core FAIL khi import (`src/admin/sweep.js` chưa có, `Tests  no tests`); CLI `Tests  8 failed (8)`.

- [ ] **Step 3: Implement**

`services/core-api/src/admin/sweep.js` (mới):

```js
// Expired admin sessions are deleted every hour, in this process (spec admin-console-p1 §1).
export const SWEEP_MS = 3_600_000;

export async function sweepSessions(pool) {
  const { rowCount } = await pool.query('DELETE FROM admin_sessions WHERE expires_at <= now()');
  return rowCount;
}

// Returns stop(). Logs codes only, never a message (it could carry a connection string or an email).
export function startSessionSweep({ pool, log, everyMs = SWEEP_MS }) {
  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      const removed = await sweepSessions(pool);
      if (removed) log.info({ removed }, 'admin_sessions_swept');
    } catch (err) {
      log.warn({ code: err.code ?? 'error' }, 'admin_sessions_sweep_failed');
    } finally {
      running = false;
    }
  };
  const timer = setInterval(tick, everyMs);
  timer.unref?.();
  return () => clearInterval(timer);
}
```

`server.js` (khởi động + dừng sweep), CLI (áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/packages/cli/src/api.js b/packages/cli/src/api.js
index 2535a85..1a39676 100644
--- a/packages/cli/src/api.js
+++ b/packages/cli/src/api.js
@@ -74,6 +74,11 @@ export function createApi({ api, token }, { fetch: doFetch = fetch, retries = 3,
     resendWebhook: (id, eventId) => call('POST', `/v1/apps/${id}/webhooks/${eventId}/resend`, { retry: false }),
     // POST, so the email is never in a URL (E10).
     lookupCustomer: (email) => call('POST', '/v1/customers/lookup', { body: { email }, retry: true }),
+    listAdminUsers: () => call('GET', '/v1/admin/users', { retry: true }),
+    // Not retried: a lost reply would turn the retry into 409 user_exists.
+    createAdminUser: (body) => call('POST', '/v1/admin/users', { body, retry: false }),
+    // Idempotent: the same change twice gives the same result.
+    updateAdminUser: (id, body) => call('PUT', `/v1/admin/users/${id}`, { body, retry: true }),
     // Never retried: if the first call succeeded but the reply was lost, a retry would roll back twice.
     rollback: (host, prefix) => call('POST', `/v1/routes/${host}/rollback`, { body: { prefix }, retry: false }),
     removeRoute: (host, prefix) => call('DELETE', `/v1/routes/${host}?prefix=${q(prefix)}`, { retry: false }),
diff --git a/packages/cli/src/main.js b/packages/cli/src/main.js
index 5da17f1..3b0aee7 100755
--- a/packages/cli/src/main.js
+++ b/packages/cli/src/main.js
@@ -29,6 +29,9 @@ const USAGE = `Cách dùng:
   ikf app rotate-key <id> [--force]   (--force: cả khi key trước còn trong 24h, key đó bị khoá ngay)
   ikf app webhooks <id> [--dead] [--resend <event_id>]
   ikf customer show <email>
+  ikf admin add <email> --role viewer|editor|admin [--name <tên>]   (người dùng trang admin, đăng nhập Google)
+  ikf admin ls
+  ikf admin disable <email>   (khoá ngay, mọi phiên đăng nhập kết thúc)
   ikf events replay-dlq --env <staging|prod>   (cần CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN)`;
 
 const where = (r) => `${r.host}${r.prefix === '/' ? '/' : r.prefix}`;
@@ -202,6 +205,34 @@ async function customerCommand(api, sub, args, out) {
   return 0;
 }
 
+const ADMIN_ROLES = ['viewer', 'editor', 'admin'];
+
+async function adminCommand(api, sub, args, values, out, err) {
+  const email = args[0]?.trim().toLowerCase();
+  if (sub === 'ls') {
+    const { users } = await api.listAdminUsers();
+    if (!users.length) out('(chưa có ai)');
+    for (const u of users) out(`${u.email.padEnd(32)} ${u.role.padEnd(7)} ${u.disabled_at ? `khoá từ ${u.disabled_at}` : 'hoạt động'}`);
+    return 0;
+  }
+  if (!['add', 'disable'].includes(sub) || !email) throw new UsageError(USAGE);
+  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new UsageError(`email không hợp lệ: "${args[0]}"`);
+  if (sub === 'add') {
+    if (!ADMIN_ROLES.includes(values.role)) throw new UsageError('cần --role viewer|editor|admin');
+    const u = await api.createAdminUser({ email, role: values.role, ...(values.name && { name: values.name }) });
+    out(`${u.email}: ${u.role} (đã thêm). Đăng nhập trang admin bằng Google với email này.`);
+    return 0;
+  }
+  const u = (await api.listAdminUsers()).users.find((x) => x.email === email);
+  if (!u) {
+    err(`Không có người dùng ${email}`);
+    return 1;
+  }
+  await api.updateAdminUser(u.id, { disabled: true });
+  out(`${email}: đã khoá, mọi phiên đăng nhập kết thúc ngay.`);
+  return 0;
+}
+
 const DURATION_RE = /^([1-9]\d*)([mhd])$/;
 const UNIT_SECONDS = { m: 60, h: 3600, d: 86400 };
 
@@ -337,6 +368,7 @@ export async function run(argv, { out = console.log, err = console.error, env =
         dead: { type: 'boolean', default: false },
         resend: { type: 'string' },
         force: { type: 'boolean', default: false },
+        role: { type: 'string' },
       },
     });
     const [cmd, sub, ...rest] = positionals;
@@ -346,7 +378,7 @@ export async function run(argv, { out = console.log, err = console.error, env =
       out('Đã lưu thông tin đăng nhập.');
       return 0;
     }
-    if (!['route', 'publish', 'funnel', 'events', 'billing', 'app', 'customer'].includes(cmd)) throw new UsageError(USAGE);
+    if (!['route', 'publish', 'funnel', 'events', 'billing', 'app', 'customer', 'admin'].includes(cmd)) throw new UsageError(USAGE);
     if (cmd === 'events') return await eventsCommand(sub, values, out, env, deps);
     if (cmd === 'publish' && (!sub || !values.slug)) throw new UsageError('cách dùng: ikf publish <folder> --slug <slug>');
     const api = deps.api ?? createApi(await loadCredentials(env));
@@ -358,6 +390,7 @@ export async function run(argv, { out = console.log, err = console.error, env =
     if (cmd === 'billing') return await billingCommand(api, sub, rest, values, out);
     if (cmd === 'app') return await appCommand(api, sub, rest, values, out);
     if (cmd === 'customer') return await customerCommand(api, sub, rest, out);
+    if (cmd === 'admin') return await adminCommand(api, sub, rest, values, out, err);
     return await routeCommand(api, sub, rest, values, out);
   } catch (e) {
     if (e instanceof UsageError) {
diff --git a/services/core-api/src/server.js b/services/core-api/src/server.js
index f815461..1fe106d 100644
--- a/services/core-api/src/server.js
+++ b/services/core-api/src/server.js
@@ -18,6 +18,7 @@ import { BILLING_SECRETS, billingDeps } from './billing/setup.js';
 import { syncMessage } from './billing/sync.js';
 import { IDENTITY_SECRETS, identityDeps } from './identity/setup.js';
 import { ADMIN_SECRETS, adminDeps } from './admin/setup.js';
+import { startSessionSweep } from './admin/sweep.js';
 import { startEntitlementSync } from './identity/sync.js';
 import { startWebhookSender } from './identity/webhooks.js';
 
@@ -113,6 +114,7 @@ const app = buildApp({
 });
 
 const stopResync = startResync({ pool, kv, log: app.log });
+const stopSessionSweep = startSessionSweep({ pool, log });
 // billing-sync: long-polls the webhooks queue in this process (spec §1).
 const stopBillingSync = billing.deps
   ? startQueueWorker({
@@ -136,6 +138,7 @@ const shutdown = async () => {
   shuttingDown = true;
   setTimeout(() => process.exit(1), 10_000).unref();
   stopResync();
+  stopSessionSweep();
   await stopBillingSync(); // ends the long poll; the message in hand finishes or returns to the queue
   await Promise.all([stopEntitlementSync(), stopWebhookSender()]); // the tick in hand commits or rolls back
   await app.close();
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/session-sweep.test.js 2>&1 | grep -E "Tests  "
node --check services/core-api/src/server.js
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
npm test -w @ikf/cli 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  2 passed (2)`; core-api `Test Files  43 passed (43)`, `Tests  405 passed (405)`; cli `Test Files  13 passed (13)`, `Tests  129 passed (129)`.

- [ ] **Step 5: Commit**

```bash
git add services/core-api packages/cli
git commit -m "feat: hourly admin session sweep; ikf admin add|ls|disable"
```

---

### Task 10: SPA `apps/admin` — khung Vite + React, client API (cookie + CSRF), cổng đăng nhập, layout, nút theo role; core trả `x-request-id`

**Files:**
- Modify: `package.json` (workspaces `apps/*`), `.gitignore`
- Create: `apps/admin/{package.json, vite.config.js, index.html}`, `apps/admin/src/{config.js, api.js, roles.js, auth.jsx, Layout.jsx, App.jsx, main.jsx, styles.css}`, `apps/admin/src/pages/Login.jsx`, `apps/admin/src/components/{RoleButton,ErrorNote}.jsx`
- Test: `apps/admin/test/{setup.js, helpers.jsx, api.test.js, auth.test.jsx, role.test.jsx}`
- Modify (core): `services/core-api/src/app.js`, `src/admin/cors.js`; Test: `services/core-api/test/app.test.js`

**Interfaces:**
- Consumes: `GET /v1/auth/me` → `{email, name, role, csrf}`, `POST /v1/auth/logout`, `GET /v1/auth/google?return=` (Task 3–4); các route Task 5, 8.
- Produces:
  - `createClient({base, fetch, sleep})` (`src/api.js`) với: `setOnUnauthorized(fn)`, `loginUrl(returnTo)`, `me()`, `logout()`, `listFunnels()`, `createFunnel(slug)`, `getFunnel(slug)`, `uploadVersion(slug, html)`, `setFunnel(slug, body)`, `listApps()`, `listDomains()`, `publish(host, body)`, `rollback(host, prefix)`, `listAudit(params)`, `listUsers()`, `createUser(body)`, `updateUser(id, body)` (Task 13 thêm `syncHost(host)`); `ApiError {status, code, detail, requestId}`; `sha256Hex(text)`.
  - `AuthProvider({client})`, `useAuth()` → `{status: 'loading'|'in'|'out'|'error', me, error, client, logout}`, `RequireAuth`; `can(role, need)` (`src/roles.js`); `RoleButton({need, …})` (mờ + `title="Cần quyền <need>"`); `ErrorNote({error})`, `errorText(err)`; `App({client})` (Task 11, 13 thêm route).
  - Test helper `fakeClient(me, overrides)`, `renderApp(client, path)`, `ME.{admin,editor,viewer}`.
  - core: mọi response có `x-request-id` (UUID); CORS admin `access-control-expose-headers: x-request-id`.

- [ ] **Step 1: Workspace + config**

`package.json` gốc, `.gitignore` (áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/.gitignore b/.gitignore
index 4a7a1ad..10601d7 100644
--- a/.gitignore
+++ b/.gitignore
@@ -13,3 +13,4 @@ workers/edge-router/src/sdk-bundle.generated.js
 
 # local demo (demo/)
 demo/.build/
+apps/admin/dist/
diff --git a/package.json b/package.json
index 923b883..bcf8b6e 100644
--- a/package.json
+++ b/package.json
@@ -2,6 +2,7 @@
   "name": "ikf-platform",
   "private": true,
   "workspaces": [
+    "apps/*",
     "packages/*",
     "services/*",
     "workers/*"
PATCH
```

`apps/admin/package.json` (mới):

```json
{
  "name": "@ikf/admin",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest run"
  },
  "dependencies": {
    "qrcode": "^1.5.4",
    "react": "^19.3.0",
    "react-dom": "^19.3.0",
    "react-router": "^7.18.4"
  },
  "devDependencies": {
    "@testing-library/dom": "^10.4.2",
    "@testing-library/react": "^16.3.3",
    "happy-dom": "^20.14.5",
    "vite": "^7.3.7",
    "vitest": "~3.2.0"
  }
}
```

`apps/admin/vite.config.js` (mới):

```js
import { defineConfig } from 'vite';

// JSX through Vite's esbuild (no React plugin). VITE_API_BASE = core-api origin, e.g. https://api.<zone>.
export default defineConfig({
  esbuild: { jsx: 'automatic' },
  server: { port: 8792, strictPort: true },
  build: { outDir: 'dist', sourcemap: false },
  test: {
    environment: 'happy-dom',
    setupFiles: ['./test/setup.js'],
    include: ['test/**/*.test.{js,jsx}'],
  },
});
```

```bash
npm install
```

- [ ] **Step 2: Viết test fail**

`apps/admin/test/setup.js` (mới):

```js
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(cleanup);
```

`apps/admin/test/helpers.jsx` (mới):

```jsx
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import { App } from '../src/App.jsx';

export const ME = { admin: { email: 'boss@ikameglobal.com', name: 'Boss', role: 'admin', csrf: 'c' } };
ME.editor = { ...ME.admin, email: 'ed@ikameglobal.com', role: 'editor' };
ME.viewer = { ...ME.admin, email: 'vi@ikameglobal.com', role: 'viewer' };

// A client with the createClient() surface; every method is a vi.fn, overridable per test.
export function fakeClient(me = ME.admin, overrides = {}) {
  let onUnauthorized = () => {};
  const client = {
    setOnUnauthorized: (fn) => {
      onUnauthorized = fn;
    },
    signOutNow: () => onUnauthorized(),
    loginUrl: (r = '/') => `http://api.test/v1/auth/google?return=${encodeURIComponent(r)}`,
    me: vi.fn(async () => {
      if (!me) throw Object.assign(new Error('unauthorized'), { status: 401, code: 'unauthorized' });
      return me;
    }),
    logout: vi.fn(async () => ({})),
    listFunnels: vi.fn(async () => ({ funnels: [] })),
    createFunnel: vi.fn(),
    getFunnel: vi.fn(),
    uploadVersion: vi.fn(),
    setFunnel: vi.fn(),
    listApps: vi.fn(async () => ({ apps: [] })),
    listDomains: vi.fn(async () => ({ domains: [] })),
    publish: vi.fn(),
    rollback: vi.fn(),
    listAudit: vi.fn(async () => ({ items: [], next_before: null })),
    listUsers: vi.fn(async () => ({ users: [] })),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    ...overrides,
  };
  return client;
}

export function renderApp(client, path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App client={client} />
    </MemoryRouter>,
  );
}
```

`apps/admin/test/api.test.js` (mới):

```js
import { describe, it, expect, vi } from 'vitest';
import { ApiError, createClient, sha256Hex } from '../src/api.js';

// A scripted fetch: each call takes the next answer (an object = JSON 200, a number = that status, an Error = network).
function scripted(...answers) {
  const calls = [];
  const fetch = async (url, init) => {
    calls.push({ url, ...init, headers: { ...init.headers } });
    const a = answers.shift();
    if (a instanceof Error) throw a;
    if (typeof a === 'number') return new Response(JSON.stringify({ error: a === 403 ? 'csrf' : 'boom' }), { status: a, headers: { 'x-request-id': 'req-9' } });
    return new Response(JSON.stringify(a ?? {}), { status: 200 });
  };
  return { fetch, calls };
}

describe('admin API client', () => {
  it('sends the cookie on every call and X-Ikf-Csrf (from /v1/auth/me) on writes only', async () => {
    const s = scripted({ email: 'a', role: 'admin', csrf: 'tok' }, { funnels: [] }, { slug: 'x' });
    const c = createClient({ base: 'https://api.test', fetch: s.fetch });
    await c.me();
    await c.listFunnels();
    await c.createFunnel('x');
    expect(s.calls.map((x) => [x.method, x.url, x.credentials, x.headers['x-ikf-csrf']])).toEqual([
      ['GET', 'https://api.test/v1/auth/me', 'include', undefined],
      ['GET', 'https://api.test/v1/funnels', 'include', undefined],
      ['POST', 'https://api.test/v1/funnels', 'include', 'tok'],
    ]);
    expect(s.calls[2].body).toBe('{"slug":"x"}');
  });

  it('403 csrf: reloads /v1/auth/me and retries the write once', async () => {
    const s = scripted({ csrf: 'old' }, 403, { csrf: 'new' }, { ok: true });
    const c = createClient({ base: '', fetch: s.fetch });
    await c.me();
    expect(await c.setFunnel('x', { pixel_id: null })).toEqual({ ok: true });
    expect(s.calls.map((x) => [x.url, x.headers['x-ikf-csrf'] ?? null])).toEqual([
      ['/v1/auth/me', null], ['/v1/funnels/x', 'old'], ['/v1/auth/me', null], ['/v1/funnels/x', 'new'],
    ]);
  });

  it('401 calls the sign-out hook; 5xx carries the request id; a write is not retried after a network error', async () => {
    const out = vi.fn();
    const s = scripted(401, 502, new Error('offline'));
    const c = createClient({ base: '', fetch: s.fetch });
    c.setOnUnauthorized(out);
    await expect(c.listDomains()).rejects.toMatchObject({ status: 401 });
    expect(out).toHaveBeenCalledOnce();
    await expect(c.listAudit()).rejects.toMatchObject({ status: 502, code: 'boom', requestId: 'req-9' });
    const err = await c.publish('a.example.com', { prefix: '/', funnel: 'x', v: 1 }).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 0, code: 'network' });
    expect(s.calls).toHaveLength(3);
  });

  it('reads are retried twice on a network error', async () => {
    const s = scripted(new Error('offline'), new Error('offline'), { domains: [] });
    const c = createClient({ base: '', fetch: s.fetch, sleep: async () => {} });
    expect(await c.listDomains()).toEqual({ domains: [] });
    expect(s.calls).toHaveLength(3);
  });

  it('uploadVersion sends the html with its sha256; loginUrl keeps the path to return to; audit query string', async () => {
    const s = scripted({ v: 1 }, { items: [] });
    const c = createClient({ base: 'https://api.test', fetch: s.fetch });
    await c.uploadVersion('aivideo', '<p>é</p>');
    expect(JSON.parse(s.calls[0].body)).toEqual({ html: '<p>é</p>', sha256: await sha256Hex('<p>é</p>') });
    expect(await sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    await c.listAudit({ target: 'funnel:aivideo', action: '', before: 7 });
    expect(s.calls[1].url).toBe('https://api.test/v1/audit?target=funnel%3Aaivideo&before=7');
    expect(c.loginUrl('/funnels/aivideo')).toBe('https://api.test/v1/auth/google?return=%2Ffunnels%2Faivideo');
  });
});
```

`apps/admin/test/auth.test.jsx` (mới):

```jsx
import { describe, it, expect } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { fakeClient, renderApp, ME } from './helpers.jsx';

describe('sign-in gate and layout', () => {
  it('signed in: the layout shows the email and role, and / goes to Funnels', async () => {
    renderApp(fakeClient(ME.editor), '/');
    expect(await screen.findByTestId('who')).toHaveProperty('textContent', 'ed@ikameglobal.com · editor');
    await waitFor(() => expect(screen.getByRole('link', { name: 'Funnels' }).getAttribute('aria-current')).toBe('page'));
  });

  it('signed out: Login with the Google button keeping the path to return to', async () => {
    renderApp(fakeClient(null), '/funnels/aivideo?tab=live');
    const link = await screen.findByRole('link', { name: 'Đăng nhập bằng Google' });
    expect(link.getAttribute('href')).toBe('http://api.test/v1/auth/google?return=%2Ffunnels%2Faivideo%3Ftab%3Dlive');
  });

  it('?error=not_allowed explains that the email has no access', async () => {
    renderApp(fakeClient(null), '/login?error=not_allowed');
    expect((await screen.findByRole('alert')).textContent).toBe('Email chưa được cấp quyền, liên hệ admin.');
  });

  it('a 401 from any call later signs out to Login', async () => {
    const client = fakeClient(ME.admin);
    renderApp(client, '/audit');
    await screen.findByTestId('who');
    act(() => client.signOutNow());
    expect(await screen.findByRole('link', { name: 'Đăng nhập bằng Google' })).toBeTruthy();
  });

  it('Đăng xuất calls logout and shows Login', async () => {
    const client = fakeClient(ME.viewer);
    renderApp(client, '/domains');
    fireEvent.click(await screen.findByRole('button', { name: 'Đăng xuất' }));
    expect(await screen.findByRole('link', { name: 'Đăng nhập bằng Google' })).toBeTruthy();
    expect(client.logout).toHaveBeenCalledOnce();
  });

  it('the API is down: says so instead of a blank page', async () => {
    renderApp(fakeClient(ME.admin, { me: async () => { throw Object.assign(new Error('x'), { status: 0, code: 'network' }); } }), '/');
    expect((await screen.findByText(/Không gọi được API \(network\)/)).className).toBe('error');
  });
});
```

`apps/admin/test/role.test.jsx` (mới):

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AuthProvider } from '../src/auth.jsx';
import { RoleButton } from '../src/components/RoleButton.jsx';
import { can } from '../src/roles.js';
import { fakeClient, ME } from './helpers.jsx';

describe('roles in the UI', () => {
  it('can(): viewer ⊂ editor ⊂ admin', () => {
    expect([can('viewer', 'editor'), can('editor', 'editor'), can('admin', 'editor'), can('editor', 'admin'), can(undefined, 'viewer')]).toEqual([
      false, true, true, false, false,
    ]);
  });

  it.each([
    ['viewer', true, 'Cần quyền editor'],
    ['editor', false, 'Upload a version'],
    ['admin', false, 'Upload a version'],
  ])('%s: an editor button is disabled=%s with title "%s"', async (role, disabled, title) => {
    render(
      <MemoryRouter>
        <AuthProvider client={fakeClient(ME[role])}>
          <RoleButton need="editor" title="Upload a version">Upload</RoleButton>
        </AuthProvider>
      </MemoryRouter>,
    );
    const btn = await screen.findByRole('button', { name: 'Upload' });
    await screen.findByTitle(title);
    expect(btn.disabled).toBe(disabled);
  });
});
```

```bash
npm test -w @ikf/admin 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Test Files  3 failed (3)`, `Tests  no tests` (import `src/…` chưa có).

- [ ] **Step 3: Implement SPA**

`apps/admin/index.html` (mới):

```html
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <title>iFunnel Admin</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

`apps/admin/src/config.js` (mới):

```js
// core-api origin, fixed at build time (admin.yml: https://api.<zone>; npm run demo: http://localhost:<core port>).
export const API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:8080').replace(/\/+$/, '');
```

`apps/admin/src/api.js` (mới):

```js
// core-api client for the admin SPA (spec admin-console-p1 §1, §5): the session cookie rides along
// (credentials: include); every write carries X-Ikf-Csrf from /v1/auth/me.
import { API_BASE } from './config.js';

export class ApiError extends Error {
  constructor(status, body = {}, requestId = null) {
    super(body.error ?? `HTTP ${status}`);
    this.status = status;
    this.code = body.error ?? (status ? 'http_error' : 'network');
    this.detail = body.detail;
    this.requestId = requestId;
  }
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export async function sha256Hex(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function createClient({ base = API_BASE, fetch = (...a) => globalThis.fetch(...a), sleep = wait } = {}) {
  let csrf = null;
  let onUnauthorized = () => {};

  async function raw(method, path, body) {
    for (let attempt = 0; ; attempt += 1) {
      let res;
      try {
        res = await fetch(base + path, {
          method,
          credentials: 'include',
          headers: {
            ...(body !== undefined && { 'content-type': 'application/json' }),
            ...(method !== 'GET' && csrf && { 'x-ikf-csrf': csrf }),
          },
          body: body === undefined ? undefined : JSON.stringify(body),
        });
      } catch {
        // Network: reads are retried (twice), writes are not (the server may have done it).
        if (method === 'GET' && attempt < 2) {
          await sleep(500 * 2 ** attempt);
          continue;
        }
        throw new ApiError(0, { error: 'network' });
      }
      const data = res.status === 204 ? {} : await res.json().catch(() => ({}));
      if (res.ok) return data;
      throw new ApiError(res.status, data, res.headers.get('x-request-id'));
    }
  }

  async function me() {
    const r = await raw('GET', '/v1/auth/me');
    csrf = r.csrf;
    return r;
  }

  // 401 → back to Login; 403 csrf → reload /v1/auth/me, then try once more.
  async function call(method, path, body) {
    try {
      return await raw(method, path, body);
    } catch (err) {
      if (err.status === 401) onUnauthorized();
      if (err.status === 403 && err.code === 'csrf' && method !== 'GET') {
        await me();
        return raw(method, path, body);
      }
      throw err;
    }
  }

  const q = encodeURIComponent;
  return {
    setOnUnauthorized: (fn) => {
      onUnauthorized = fn;
    },
    loginUrl: (returnTo = '/') => `${base}/v1/auth/google?return=${q(returnTo)}`,
    me,
    logout: () => call('POST', '/v1/auth/logout'),
    listFunnels: () => call('GET', '/v1/funnels'),
    createFunnel: (slug) => call('POST', '/v1/funnels', { slug }),
    getFunnel: (slug) => call('GET', `/v1/funnels/${q(slug)}`),
    uploadVersion: async (slug, html) => call('POST', `/v1/funnels/${q(slug)}/versions`, { html, sha256: await sha256Hex(html) }),
    setFunnel: (slug, body) => call('PUT', `/v1/funnels/${q(slug)}`, body),
    listApps: () => call('GET', '/v1/apps'),
    listDomains: () => call('GET', '/v1/domains'),
    publish: (host, body) => call('PUT', `/v1/routes/${q(host)}`, body),
    rollback: (host, prefix) => call('POST', `/v1/routes/${q(host)}/rollback`, { prefix }),
    listAudit: (params = {}) => {
      const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)).toString();
      return call('GET', `/v1/audit${qs ? `?${qs}` : ''}`);
    },
    listUsers: () => call('GET', '/v1/admin/users'),
    createUser: (body) => call('POST', '/v1/admin/users', body),
    updateUser: (id, body) => call('PUT', `/v1/admin/users/${id}`, body),
  };
}
```

`apps/admin/src/roles.js` (mới):

```js
// viewer ⊂ editor ⊂ admin (spec admin-console-p1 §1).
const RANK = { viewer: 1, editor: 2, admin: 3 };
export const can = (role, need) => (RANK[role] ?? 0) >= RANK[need];
```

`apps/admin/src/auth.jsx` (mới):

```jsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router';

const AuthContext = createContext(null);

// Who is signed in: loading → in (me = {email, name, role}) | out. Any 401 from the API signs out.
export function AuthProvider({ client, children }) {
  const [state, setState] = useState({ status: 'loading', me: null, error: null });
  useEffect(() => {
    client.setOnUnauthorized(() => setState({ status: 'out', me: null, error: null }));
    client.me().then(
      (me) => setState({ status: 'in', me, error: null }),
      (error) => setState({ status: error.status === 401 ? 'out' : 'error', me: null, error }),
    );
  }, [client]);
  const logout = useCallback(async () => {
    await client.logout().catch(() => {});
    setState({ status: 'out', me: null, error: null });
  }, [client]);
  const value = useMemo(() => ({ ...state, client, logout }), [state, client, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

// Signed-out visitors go to /login, keeping the path to come back to.
export function RequireAuth({ children }) {
  const { status, error } = useAuth();
  const loc = useLocation();
  if (status === 'loading') return <p className="muted">Đang tải…</p>;
  if (status === 'error') return <p className="error">Không gọi được API ({error.code}). Thử tải lại trang.</p>;
  if (status === 'out') return <Navigate to={`/login?return=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  return children;
}
```

`apps/admin/src/components/RoleButton.jsx` (mới):

```jsx
import { useAuth } from '../auth.jsx';
import { can } from '../roles.js';

// A write button: greyed out with the reason when the signed-in role is not enough.
export function RoleButton({ need, children, title, disabled, ...props }) {
  const { me } = useAuth();
  const allowed = can(me?.role, need);
  return (
    <button type="button" {...props} disabled={disabled || !allowed} title={allowed ? title : `Cần quyền ${need}`}>
      {children}
    </button>
  );
}
```

`apps/admin/src/components/ErrorNote.jsx` (mới):

```jsx
// An API error as one line; 5xx carries the request id for the on-call engineer.
export function errorText(err) {
  if (!err) return '';
  if (err.status === 0) return 'Mất kết nối mạng. Thử lại.';
  if (err.status >= 500) return `Lỗi máy chủ (${err.code})${err.requestId ? `, request id ${err.requestId}` : ''}.`;
  return `Lỗi ${err.status} ${err.code}`;
}

export function ErrorNote({ error }) {
  if (!error) return null;
  return <p className="error" role="alert">{errorText(error)}</p>;
}
```

`apps/admin/src/Layout.jsx` (mới):

```jsx
import { NavLink, Outlet } from 'react-router';
import { useAuth } from './auth.jsx';

export function Layout() {
  const { me, logout } = useAuth();
  return (
    <div className="shell">
      <nav className="side">
        <strong className="brand">iFunnel</strong>
        <NavLink to="/funnels">Funnels</NavLink>
        <NavLink to="/domains">Domains</NavLink>
        <NavLink to="/audit">Audit</NavLink>
        <NavLink to="/settings/users">Settings</NavLink>
      </nav>
      <div className="main">
        <header className="top">
          <span data-testid="who">{me.email} · {me.role}</span>
          <button type="button" onClick={logout}>Đăng xuất</button>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
```

`apps/admin/src/pages/Login.jsx` (mới):

```jsx
import { Navigate, useSearchParams } from 'react-router';
import { useAuth } from '../auth.jsx';

const MESSAGES = {
  not_allowed: 'Email chưa được cấp quyền, liên hệ admin.',
  state: 'Phiên đăng nhập đã hết hạn, thử lại.',
  google: 'Google không hoàn tất đăng nhập, thử lại.',
  invalid_token: 'Đăng nhập không hợp lệ, thử lại.',
};

export function Login() {
  const { status, client } = useAuth();
  const [params] = useSearchParams();
  const returnTo = params.get('return') || '/';
  if (status === 'in') return <Navigate to={returnTo} replace />;
  const error = params.get('error');
  return (
    <main className="login">
      <h1>iFunnel Admin</h1>
      {error && <p className="error" role="alert">{MESSAGES[error] ?? 'Đăng nhập không thành công.'}</p>}
      <a className="button primary" href={client.loginUrl(returnTo)}>Đăng nhập bằng Google</a>
    </main>
  );
}
```

`apps/admin/src/App.jsx` (mới; Task 11 và 13 thêm route trang):

```jsx
import { Navigate, Route, Routes } from 'react-router';
import { AuthProvider, RequireAuth } from './auth.jsx';
import { Layout } from './Layout.jsx';
import { Login } from './pages/Login.jsx';

export function App({ client }) {
  return (
    <AuthProvider client={client}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<RequireAuth><Layout /></RequireAuth>}>
          <Route index element={<Navigate to="/funnels" replace />} />
          <Route path="*" element={<p className="muted">Chọn một mục bên trái.</p>} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
```

`apps/admin/src/main.jsx` (mới):

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { createClient } from './api.js';
import { App } from './App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App client={createClient()} />
    </BrowserRouter>
  </StrictMode>,
);
```

`apps/admin/src/styles.css` (mới):

```css
:root { font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; color: #1d2330; background: #f6f7f9; }
* { box-sizing: border-box; }
body { margin: 0; }
a { color: #2457d6; }
button, .button { font: inherit; padding: 6px 12px; border: 1px solid #c8ced8; border-radius: 6px; background: #fff; cursor: pointer; text-decoration: none; color: inherit; display: inline-block; }
button.primary, .button.primary { background: #2457d6; border-color: #2457d6; color: #fff; }
button:disabled { opacity: 0.45; cursor: not-allowed; }
input, select { font: inherit; padding: 6px 8px; border: 1px solid #c8ced8; border-radius: 6px; }
table { border-collapse: collapse; width: 100%; background: #fff; }
th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #e6e9ef; vertical-align: top; }
th { font-weight: 600; color: #5a6475; font-size: 13px; }
.shell { display: flex; min-height: 100vh; }
.side { width: 180px; background: #1d2330; display: flex; flex-direction: column; padding: 16px 0; }
.side a { color: #c9d1e0; padding: 8px 20px; text-decoration: none; }
.side a.active { background: #2b3446; color: #fff; }
.brand { color: #fff; padding: 0 20px 16px; }
.main { flex: 1; padding: 0 24px 32px; min-width: 0; }
.top { display: flex; justify-content: flex-end; gap: 12px; align-items: center; padding: 12px 0; }
.muted { color: #6b7385; }
.error { color: #b42318; }
.warn { color: #9a6700; }
.ok { color: #1a7f37; }
.login { max-width: 360px; margin: 15vh auto; text-align: center; }
.card { background: #fff; border: 1px solid #e6e9ef; border-radius: 8px; padding: 16px; margin: 16px 0; }
.row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.drop { border: 2px dashed #c8ced8; border-radius: 8px; padding: 24px; text-align: center; }
.drop.over { border-color: #2457d6; background: #eef3ff; }
dialog, .dialog { border: 1px solid #c8ced8; border-radius: 8px; padding: 16px; background: #fff; max-width: 480px; }
.badge { font-size: 12px; padding: 1px 6px; border-radius: 10px; background: #eef0f4; }
.badge.warn { background: #fff4d6; }
.badge.live { background: #dcf5e3; color: #1a7f37; }
```

- [ ] **Step 4: Chạy test + build, xác nhận PASS**

```bash
npm test -w @ikf/admin 2>&1 | grep -E "Test Files|Tests  "
VITE_API_BASE=https://api.ikf-staging.example npm run build -w @ikf/admin 2>&1 | grep -E "built in|error"
grep -l "https://api.ikf-staging.example" apps/admin/dist/assets/*.js && rm -rf apps/admin/dist
```

Expected: `Test Files  3 passed (3)`, `Tests  15 passed (15)` (api 5, auth 6, role 4); build `✓ built in …` (cảnh báo `"use client" … was ignored` của react-router là bình thường), API base có trong bundle.

- [ ] **Step 5: core `x-request-id` — test fail**

`services/core-api/test/app.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/test/app.test.js b/services/core-api/test/app.test.js
index 9e3ad1a..7796d09 100644
--- a/services/core-api/test/app.test.js
+++ b/services/core-api/test/app.test.js
@@ -35,4 +35,14 @@ describe('core-api health endpoints', () => {
     expect(res.json().checks.db).toBe('fail');
     expect(Date.now() - started).toBeLessThan(1000);
   });
+
+  // Spec admin-console-p1 §5: the admin SPA shows the request id of a 5xx; the logs carry the same id.
+  it('every response carries x-request-id, a fresh UUID per request; the admin origin may read it', async () => {
+    const app = buildApp({ deps: { admin: { origin: 'https://admin.ikf.example' } } });
+    const a = await app.inject({ method: 'GET', url: '/livez' });
+    const b = await app.inject({ method: 'GET', url: '/v1/nope', headers: { origin: 'https://admin.ikf.example' } });
+    expect(a.headers['x-request-id']).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
+    expect(b.headers['x-request-id']).not.toBe(a.headers['x-request-id']);
+    expect(b.headers['access-control-expose-headers']).toBe('x-request-id');
+  });
 });
PATCH
```

```bash
npm test -w @ikf/core-api -- test/app.test.js 2>&1 | grep -E "×|Tests  "
```

Expected: `Tests  1 failed | 4 passed (5)`.

- [ ] **Step 6: core `x-request-id` — implement**

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/admin/cors.js b/services/core-api/src/admin/cors.js
index 756f5a9..b6142af 100644
--- a/services/core-api/src/admin/cors.js
+++ b/services/core-api/src/admin/cors.js
@@ -6,6 +6,7 @@ export function adminCors(app, origin) {
     reply.header('access-control-allow-origin', origin);
     reply.header('access-control-allow-credentials', 'true');
     reply.header('vary', 'Origin');
+    reply.header('access-control-expose-headers', 'x-request-id');
     if (req.method !== 'OPTIONS') return undefined;
     reply.header('access-control-allow-methods', 'GET, POST, PUT, DELETE');
     reply.header('access-control-allow-headers', 'content-type, x-ikf-csrf');
diff --git a/services/core-api/src/app.js b/services/core-api/src/app.js
index 16bf301..53512fa 100644
--- a/services/core-api/src/app.js
+++ b/services/core-api/src/app.js
@@ -1,3 +1,4 @@
+import { randomUUID } from 'node:crypto';
 import Fastify from 'fastify';
 import { HttpError } from './errors.js';
 import tokensHttp from './http/tokens.js';
@@ -22,7 +23,11 @@ import { adminCors } from './admin/cors.js';
 export function buildApp({ checks = {}, timeoutMs = 1000, logger = false, deps } = {}) {
   // The local demo's sign-in without Google must never run in a deployed environment (spec admin-console-p1 §1).
   if (deps?.admin?.localUser && deps.admin.appEnv !== 'local') throw new Error('admin.localUser is for APP_ENV=local only');
-  const app = Fastify({ logger });
+  // A UUID per request, in the logs and in x-request-id (the admin SPA shows it on a 5xx).
+  const app = Fastify({ logger, genReqId: () => randomUUID() });
+  app.addHook('onRequest', async (req, reply) => {
+    reply.header('x-request-id', req.id);
+  });
   app.decorateRequest('actor', null);
   app.decorateRequest('session', null); // the admin console session behind the request's cookie, if any
   if (deps?.admin?.origin) adminCors(app, deps.admin.origin);
PATCH
```

```bash
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Test Files  43 passed (43)`, `Tests  406 passed (406)`.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json .gitignore apps/admin services/core-api
git commit -m "feat(admin): SPA scaffold (Vite + React), API client with cookie + CSRF, sign-in gate, layout, role-aware buttons; core x-request-id"
```

---

### Task 11: Màn Funnels (danh sách, tìm, New funnel) + Funnel detail (upload kiểm trước, lint, versions, preview + QR, settings pixel/app)

**Files:**
- Modify: `apps/admin/package.json` (+ `@ikf/funnel-lint`), `apps/admin/src/App.jsx`
- Create: `apps/admin/src/format.js`, `apps/admin/src/pages/{Funnels,FunnelDetail}.jsx`, `apps/admin/src/components/{UploadBox,LintBadge,Qr,FunnelSettings}.jsx`
- Test: `apps/admin/test/funnels.test.jsx` (mới)

**Interfaces:**
- Consumes: `useAuth`, `RoleButton`, `ErrorNote`, `can` (Task 10); client `listFunnels`, `createFunnel`, `getFunnel`, `uploadVersion`, `setFunnel`, `listApps`; `MAX_BYTES`, `byteLength`, `configFunnel` (Task 6).
- Produces: `fmtTime(iso)` (UTC `YYYY-MM-DD HH:mm`), `fmtSize(bytes)`, `fmtLive(live)` (`src/format.js`); `UploadBox({slug, onUploaded})`; `LintBadge({lint})`; `Qr({url})` (SVG); `FunnelSettings({funnel, onSaved})`; `FunnelDetail` (Task 12 thêm Live, Publish, Rollback); route `/funnels`, `/funnels/:slug`. `data-testid="version"`, `"preview"`.

- [ ] **Step 1: Viết test fail**

`apps/admin/test/funnels.test.jsx` (mới):

```jsx
import { describe, it, expect, vi } from 'vitest';
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { MAX_BYTES } from '@ikf/funnel-lint';
import { ApiError } from '../src/api.js';
import { fakeClient, renderApp, ME } from './helpers.jsx';

const FUNNELS = [
  { slug: 'aivideo', latest_v: 3, live: [{ host: 'a.example.com', prefix: '/', v: 2 }], pixel_id: '123456', app_id: 'starlyn', updated_at: '2026-10-11T08:00:00.000Z' },
  { slug: 'tarot', latest_v: null, live: [], pixel_id: null, app_id: null, updated_at: '2026-10-10T08:00:00.000Z' },
];
const version = (v, lint = { errors: [], warnings: [] }) => ({
  v, sha256: 'a'.repeat(64), size: 2048 * v, lint, created_by: 'ed@ikameglobal.com', created_at: `2026-10-0${v}T08:00:00.000Z`,
  preview_url: `https://preview.ikf.example/aivideo/v${v}`,
});
const DETAIL = {
  slug: 'aivideo', pixel_id: '123456', app_id: null, created_by: 'ed@ikameglobal.com', created_at: '2026-10-01T08:00:00.000Z',
  versions: [version(2, { errors: [], warnings: [{ code: 'missing_meta_viewport', message: 'thiếu <meta name="viewport">' }] }), version(1, { lint: 'pass', smoke: 'pass' })],
  live: [{ host: 'a.example.com', prefix: '/', v: 1 }],
};
const PAGE = "<meta name=viewport><script>const CONFIG={funnel:'aivideo'}</script>";

const drop = (input, text, name = 'demo.html') => fireEvent.change(input, { target: { files: [new File([text], name, { type: 'text/html' })] } });

describe('Funnels list', () => {
  it('a row per funnel: latest version, where it is live, pixel, app; search by slug', async () => {
    renderApp(fakeClient(ME.viewer, { listFunnels: vi.fn(async () => ({ funnels: FUNNELS })) }), '/funnels');
    const row = (await screen.findByRole('link', { name: 'aivideo' })).closest('tr');
    expect([...row.querySelectorAll('td')].map((td) => td.textContent)).toEqual([
      'aivideo', 'v3', 'a.example.com/ v2', '123456', 'starlyn', '2026-10-11 08:00',
    ]);
    expect(screen.getByRole('link', { name: 'tarot' }).closest('tr').querySelectorAll('td')[1].textContent).toBe('—');
    fireEvent.change(screen.getByPlaceholderText('Tìm slug'), { target: { value: 'tar' } });
    expect(screen.queryByRole('link', { name: 'aivideo' })).toBeNull();
    expect(screen.getByRole('link', { name: 'tarot' })).toBeTruthy();
  });

  it('New funnel (editor): creates it and opens its page; 409 says it exists; a viewer cannot', async () => {
    const client = fakeClient(ME.editor, {
      createFunnel: vi.fn(async (slug) => {
        if (slug === 'aivideo') throw new ApiError(409, { error: 'funnel_exists' });
        return { slug };
      }),
      getFunnel: vi.fn(async (slug) => ({ ...DETAIL, slug, versions: [], live: [] })),
    });
    renderApp(client, '/funnels');
    const input = await screen.findByPlaceholderText('slug-moi');
    fireEvent.change(input, { target: { value: 'aivideo' } });
    fireEvent.click(screen.getByRole('button', { name: 'New funnel' }));
    expect((await screen.findByRole('alert')).textContent).toBe('Lỗi 409 funnel_exists');
    fireEvent.change(input, { target: { value: 'new-one' } });
    fireEvent.click(screen.getByRole('button', { name: 'New funnel' }));
    expect(await screen.findByRole('heading', { name: 'new-one' })).toBeTruthy();
    expect(client.getFunnel).toHaveBeenCalledWith('new-one');
  });

  it('a viewer sees New funnel greyed out with the reason', async () => {
    renderApp(fakeClient(ME.viewer), '/funnels');
    const btn = await screen.findByRole('button', { name: 'New funnel' });
    expect(btn.disabled).toBe(true);
    expect(btn.title).toBe('Cần quyền editor');
  });
});

describe('Funnel detail', () => {
  it('versions newest first with author, size and lint; Preview opens the link and its QR code', async () => {
    renderApp(fakeClient(ME.viewer, { getFunnel: vi.fn(async () => DETAIL) }), '/funnels/aivideo');
    const rows = (await screen.findAllByTestId('version')).map((r) => [...r.querySelectorAll('td')].slice(0, 5).map((td) => td.textContent));
    expect(rows).toEqual([
      ['v2', '2026-10-02 08:00', 'ed@ikameglobal.com', '4.0 KB', '1 cảnh báo'],
      ['v1', '2026-10-01 08:00', 'ed@ikameglobal.com', '2.0 KB', '—'],
    ]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Preview' })[0]);
    const panel = await screen.findByTestId('preview');
    expect(within(panel).getByRole('link').getAttribute('href')).toBe('https://preview.ikf.example/aivideo/v2');
    expect(within(panel).getByRole('link').getAttribute('target')).toBe('_blank');
    await waitFor(() => expect(panel.querySelector('svg')).toBeTruthy());
    fireEvent.click(screen.getAllByRole('button', { name: '1 cảnh báo' })[0]);
    expect(screen.getByText('missing_meta_viewport: thiếu <meta name="viewport">')).toBeTruthy();
  });

  it('upload: checks size and CONFIG.funnel before sending; lint errors are listed; success reloads the versions', async () => {
    const client = fakeClient(ME.editor, {
      getFunnel: vi.fn(async () => DETAIL),
      uploadVersion: vi.fn(async (_slug, html) => {
        if (html.includes('img/')) {
          throw new ApiError(422, { error: 'lint_failed', detail: { errors: [{ code: 'relative_media', message: 'img/a.jpg: ảnh/video phải là URL https', line: 3 }], warnings: [] } });
        }
        return { funnel: 'aivideo', v: 3, created: true, preview_url: 'https://preview.ikf.example/aivideo/v3' };
      }),
    });
    renderApp(client, '/funnels/aivideo');
    const input = await screen.findByLabelText('Chọn demo.html');
    drop(input, 'x'.repeat(MAX_BYTES + 1));
    expect((await screen.findByRole('alert')).textContent).toMatch(/^File quá lớn: 1\.00 MB/);
    drop(input, "<script>const CONFIG={funnel:'other'}</script>");
    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('CONFIG.funnel là "other", trang này là "aivideo".'));
    expect(client.uploadVersion).not.toHaveBeenCalled();
    drop(input, `${PAGE}<img src="img/a.jpg">`);
    expect(await screen.findByText('relative_media (dòng 3): img/a.jpg: ảnh/video phải là URL https')).toBeTruthy();
    drop(input, PAGE);
    expect(await screen.findByText('Đã tạo v3.')).toBeTruthy();
    expect(client.uploadVersion).toHaveBeenLastCalledWith('aivideo', PAGE);
    expect(client.getFunnel).toHaveBeenCalledTimes(2);
  });

  it('upload of an unchanged file says so; a viewer cannot upload', async () => {
    const client = fakeClient(ME.editor, {
      getFunnel: vi.fn(async () => DETAIL),
      uploadVersion: vi.fn(async () => ({ funnel: 'aivideo', v: 2, created: false })),
    });
    renderApp(client, '/funnels/aivideo');
    drop(await screen.findByLabelText('Chọn demo.html'), PAGE);
    expect(await screen.findByText('Nội dung không đổi: vẫn là v2.')).toBeTruthy();
    cleanup();
    renderApp(fakeClient(ME.viewer, { getFunnel: vi.fn(async () => DETAIL) }), '/funnels/aivideo');
    expect((await screen.findByLabelText('Chọn demo.html')).disabled).toBe(true);
  });

  it('settings: save the Pixel ID; pick the app from /v1/apps or none; errors are shown', async () => {
    const client = fakeClient(ME.editor, {
      getFunnel: vi.fn(async () => DETAIL),
      listApps: vi.fn(async () => ({ apps: [{ id: 'starlyn', name: 'Starlyn', kind: 'app' }, { id: 'tarot-web', name: 'Tarot', kind: 'web' }] })),
      setFunnel: vi.fn(async (_s, body) => {
        if (body.pixel_id === '12') throw new ApiError(400, { error: 'invalid_pixel_id' });
        return { funnel: 'aivideo', ...body };
      }),
    });
    renderApp(client, '/funnels/aivideo');
    const pixel = await screen.findByLabelText('Pixel ID');
    expect(pixel.value).toBe('123456');
    fireEvent.change(pixel, { target: { value: '12' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu pixel' }));
    expect((await screen.findByRole('alert')).textContent).toBe('Lỗi 400 invalid_pixel_id');
    fireEvent.change(pixel, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu pixel' }));
    await waitFor(() => expect(client.setFunnel).toHaveBeenLastCalledWith('aivideo', { pixel_id: null }));
    const app = screen.getByLabelText('App');
    await waitFor(() => expect([...app.options].map((o) => o.textContent)).toEqual(['— không gắn —', 'Starlyn (app)', 'Tarot (web)']));
    fireEvent.change(app, { target: { value: 'starlyn' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu app' }));
    await waitFor(() => expect(client.setFunnel).toHaveBeenLastCalledWith('aivideo', { app_id: 'starlyn' }));
  });

  it('an unknown funnel says so', async () => {
    renderApp(fakeClient(ME.viewer, { getFunnel: vi.fn(async () => { throw new ApiError(404, { error: 'funnel_not_found' }); }) }), '/funnels/nope');
    expect((await screen.findByRole('alert')).textContent).toBe('Lỗi 404 funnel_not_found');
  });
});
```

`apps/admin/package.json` (áp dụng đúng diff này), rồi `npm install`:

```bash
git apply <<'PATCH'
diff --git a/apps/admin/package.json b/apps/admin/package.json
index f869852..2ce478a 100644
--- a/apps/admin/package.json
+++ b/apps/admin/package.json
@@ -9,6 +9,7 @@
     "test": "vitest run"
   },
   "dependencies": {
+    "@ikf/funnel-lint": "*",
     "qrcode": "^1.5.4",
     "react": "^19.3.0",
     "react-dom": "^19.3.0",
PATCH
```

```bash
npm install
npm test -w @ikf/admin -- test/funnels.test.jsx 2>&1 | grep -E "Tests  "
```

Expected: `Tests  8 failed (8)` (chưa có route `/funnels`).

- [ ] **Step 2: Implement**

`apps/admin/src/format.js` (mới):

```js
// Times in UTC, like the API and the audit log: 2026-10-11 08:00.
export const fmtTime = (iso) => (iso ? iso.slice(0, 16).replace('T', ' ') : '—');
export const fmtSize = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
export const fmtLive = (live) => live.map((l) => `${l.host}${l.prefix} v${l.v}`).join(', ') || '—';
```

`apps/admin/src/pages/Funnels.jsx` (mới):

```jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../auth.jsx';
import { ErrorNote } from '../components/ErrorNote.jsx';
import { RoleButton } from '../components/RoleButton.jsx';
import { fmtLive, fmtTime } from '../format.js';

export function Funnels() {
  const { client } = useAuth();
  const navigate = useNavigate();
  const [funnels, setFunnels] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [slug, setSlug] = useState('');

  useEffect(() => {
    client.listFunnels().then((r) => setFunnels(r.funnels), setError);
  }, [client]);

  const create = async () => {
    setError(null);
    const s = slug.trim();
    try {
      await client.createFunnel(s);
      navigate(`/funnels/${s}`);
    } catch (err) {
      setError(err);
    }
  };

  const shown = (funnels ?? []).filter((f) => f.slug.includes(query.trim().toLowerCase()));
  return (
    <section>
      <h1>Funnels</h1>
      <div className="row">
        <input placeholder="Tìm slug" value={query} onChange={(e) => setQuery(e.target.value)} />
        <span className="muted">·</span>
        <input placeholder="slug-moi" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <RoleButton need="editor" className="primary" onClick={create} disabled={!slug.trim()}>New funnel</RoleButton>
      </div>
      <ErrorNote error={error} />
      {funnels === null ? (
        <p className="muted">Đang tải…</p>
      ) : (
        <table>
          <thead>
            <tr><th>Slug</th><th>Bản mới nhất</th><th>Live tại</th><th>Pixel</th><th>App</th><th>Cập nhật</th></tr>
          </thead>
          <tbody>
            {shown.map((f) => (
              <tr key={f.slug}>
                <td><Link to={`/funnels/${f.slug}`}>{f.slug}</Link></td>
                <td>{f.latest_v ? `v${f.latest_v}` : '—'}</td>
                <td>{fmtLive(f.live)}</td>
                <td>{f.pixel_id ?? '—'}</td>
                <td>{f.app_id ?? '—'}</td>
                <td>{fmtTime(f.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
```

`apps/admin/src/components/Qr.jsx` (mới):

```jsx
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

// The URL as an SVG QR code (open the preview on a phone).
export function Qr({ url }) {
  const [svg, setSvg] = useState('');
  useEffect(() => {
    let live = true;
    QRCode.toString(url, { type: 'svg', margin: 1, width: 180 }).then((s) => live && setSvg(s));
    return () => {
      live = false;
    };
  }, [url]);
  return <div className="qr" aria-label={`QR ${url}`} dangerouslySetInnerHTML={{ __html: svg }} />;
}
```

`apps/admin/src/components/LintBadge.jsx` (mới):

```jsx
import { useState } from 'react';

// A version's lint report: "2 lỗi" / "1 cảnh báo" / "OK", the findings on click; "—" for reports from before
// the server linted (the CLI's {lint, smoke}).
export function LintBadge({ lint }) {
  const [open, setOpen] = useState(false);
  if (!Array.isArray(lint?.errors) || !Array.isArray(lint?.warnings)) return <span className="muted">—</span>;
  const { errors, warnings } = lint;
  if (!errors.length && !warnings.length) return <span className="badge">OK</span>;
  const label = [errors.length && `${errors.length} lỗi`, warnings.length && `${warnings.length} cảnh báo`].filter(Boolean).join(', ');
  return (
    <>
      <button type="button" className={`badge ${errors.length ? 'error' : 'warn'}`} onClick={() => setOpen(!open)}>{label}</button>
      {open && (
        <ul className="findings">
          {[...errors, ...warnings].map((f) => <li key={`${f.code}-${f.line ?? ''}-${f.message}`}>{f.code}: {f.message}</li>)}
        </ul>
      )}
    </>
  );
}
```

`apps/admin/src/components/UploadBox.jsx` (mới):

```jsx
import { useState } from 'react';
import { byteLength, configFunnel, MAX_BYTES } from '@ikf/funnel-lint';
import { useAuth } from '../auth.jsx';
import { can } from '../roles.js';
import { ErrorNote } from './ErrorNote.jsx';

const finding = (f) => `${f.code}${f.line ? ` (dòng ${f.line})` : ''}: ${f.message}`;

// Drop or pick demo.html; size and CONFIG.funnel are checked here, the full lint on the server (spec §5.3).
export function UploadBox({ slug, onUploaded }) {
  const { client, me } = useAuth();
  const [state, setState] = useState({});
  const [over, setOver] = useState(false);
  const allowed = can(me.role, 'editor');

  async function upload(file) {
    if (!file) return;
    const html = await file.text();
    const size = byteLength(html);
    if (size > MAX_BYTES) return setState({ check: `File quá lớn: ${(size / 1048576).toFixed(2)} MB (tối đa 1 MB).` });
    const found = configFunnel(html);
    if (found !== slug) {
      return setState({ check: found ? `CONFIG.funnel là "${found}", trang này là "${slug}".` : 'Không thấy CONFIG.funnel trong file.' });
    }
    setState({ busy: true });
    try {
      const r = await client.uploadVersion(slug, html);
      setState({ done: r.created ? `Đã tạo v${r.v}.` : `Nội dung không đổi: vẫn là v${r.v}.` });
      onUploaded();
    } catch (err) {
      setState(err.code === 'lint_failed' ? { lint: err.detail } : { error: err });
    }
    return undefined;
  }

  return (
    <div className="card">
      <h2>Upload</h2>
      <div
        className={`drop${over ? ' over' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(allowed);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          if (allowed) upload(e.dataTransfer.files[0]);
        }}
      >
        <label title={allowed ? undefined : 'Cần quyền editor'}>
          Kéo thả demo.html vào đây, hoặc{' '}
          <input type="file" accept=".html,text/html" aria-label="Chọn demo.html" disabled={!allowed || state.busy} onChange={(e) => upload(e.target.files[0])} />
        </label>
      </div>
      {state.busy && <p className="muted">Đang upload…</p>}
      {state.check && <p className="error" role="alert">{state.check}</p>}
      {state.done && <p className="ok">{state.done}</p>}
      {state.lint && (
        <div className="error" role="alert">
          <p>Lint: {state.lint.errors.length} lỗi, không tạo bản.</p>
          <ul>{[...state.lint.errors, ...state.lint.warnings].map((f) => <li key={finding(f)}>{finding(f)}</li>)}</ul>
        </div>
      )}
      <ErrorNote error={state.error} />
    </div>
  );
}
```

`apps/admin/src/components/FunnelSettings.jsx` (mới):

```jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../auth.jsx';
import { ErrorNote } from './ErrorNote.jsx';
import { RoleButton } from './RoleButton.jsx';

// Pixel ID and the app the funnel sells (spec §5.3 Settings).
export function FunnelSettings({ funnel, onSaved }) {
  const { client } = useAuth();
  const [pixel, setPixel] = useState(funnel.pixel_id ?? '');
  const [appId, setAppId] = useState(funnel.app_id ?? '');
  const [apps, setApps] = useState([]);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState('');

  useEffect(() => {
    client.listApps().then((r) => setApps(r.apps), setError);
  }, [client]);

  const save = async (body, what) => {
    setError(null);
    setSaved('');
    try {
      await client.setFunnel(funnel.slug, body);
      setSaved(`Đã lưu ${what}.`);
      onSaved();
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="card">
      <h2>Settings</h2>
      <div className="row">
        <label htmlFor="pixel">Pixel ID</label>
        <input id="pixel" value={pixel} onChange={(e) => setPixel(e.target.value)} placeholder="(không có)" />
        <RoleButton need="editor" onClick={() => save({ pixel_id: pixel.trim() || null }, 'pixel')}>Lưu pixel</RoleButton>
      </div>
      <div className="row">
        <label htmlFor="app">App</label>
        <select id="app" value={appId} onChange={(e) => setAppId(e.target.value)}>
          <option value="">— không gắn —</option>
          {apps.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.kind})</option>)}
        </select>
        <RoleButton need="editor" onClick={() => save({ app_id: appId || null }, 'app')}>Lưu app</RoleButton>
      </div>
      {saved && <p className="ok">{saved}</p>}
      <ErrorNote error={error} />
    </div>
  );
}
```

`apps/admin/src/pages/FunnelDetail.jsx` (mới; Task 12 thêm Live/Publish/Rollback):

```jsx
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useAuth } from '../auth.jsx';
import { ErrorNote } from '../components/ErrorNote.jsx';
import { FunnelSettings } from '../components/FunnelSettings.jsx';
import { LintBadge } from '../components/LintBadge.jsx';
import { Qr } from '../components/Qr.jsx';
import { UploadBox } from '../components/UploadBox.jsx';
import { fmtSize, fmtTime } from '../format.js';

export function FunnelDetail() {
  const { slug } = useParams();
  const { client } = useAuth();
  const [funnel, setFunnel] = useState(null);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const load = useCallback(() => client.getFunnel(slug).then(setFunnel, setError), [client, slug]);
  useEffect(() => {
    load();
  }, [load]);

  if (!funnel) return error ? <ErrorNote error={error} /> : <p className="muted">Đang tải…</p>;
  return (
    <section>
      <h1>{funnel.slug}</h1>
      <UploadBox slug={funnel.slug} onUploaded={load} />
      <div className="card">
        <h2>Versions</h2>
        {funnel.versions.length === 0 ? (
          <p className="muted">Chưa có bản nào: upload demo.html ở trên.</p>
        ) : (
          <table>
            <thead>
              <tr><th>Bản</th><th>Ngày</th><th>Ai</th><th>Size</th><th>Lint</th><th /></tr>
            </thead>
            <tbody>
              {funnel.versions.map((v) => (
                <tr key={v.v} data-testid="version">
                  <td>v{v.v}</td>
                  <td>{fmtTime(v.created_at)}</td>
                  <td>{v.created_by}</td>
                  <td>{fmtSize(v.size)}</td>
                  <td><LintBadge lint={v.lint} /></td>
                  <td className="row">
                    <button type="button" onClick={() => setPreview(v)}>Preview</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {preview && (
          <div className="card" data-testid="preview">
            <p>Preview v{preview.v} (chưa publish vẫn xem được): <a href={preview.preview_url} target="_blank" rel="noopener noreferrer">{preview.preview_url}</a></p>
            <Qr url={preview.preview_url} />
          </div>
        )}
      </div>
      <FunnelSettings key={`${funnel.pixel_id}|${funnel.app_id}`} funnel={funnel} onSaved={load} />
    </section>
  );
}
```

```bash
git apply <<'PATCH'
diff --git a/apps/admin/src/App.jsx b/apps/admin/src/App.jsx
index 18bc19c..a52d200 100644
--- a/apps/admin/src/App.jsx
+++ b/apps/admin/src/App.jsx
@@ -1,6 +1,8 @@
 import { Navigate, Route, Routes } from 'react-router';
 import { AuthProvider, RequireAuth } from './auth.jsx';
 import { Layout } from './Layout.jsx';
+import { FunnelDetail } from './pages/FunnelDetail.jsx';
+import { Funnels } from './pages/Funnels.jsx';
 import { Login } from './pages/Login.jsx';
 
 export function App({ client }) {
@@ -10,6 +12,8 @@ export function App({ client }) {
         <Route path="/login" element={<Login />} />
         <Route element={<RequireAuth><Layout /></RequireAuth>}>
           <Route index element={<Navigate to="/funnels" replace />} />
+          <Route path="/funnels" element={<Funnels />} />
+          <Route path="/funnels/:slug" element={<FunnelDetail />} />
           <Route path="*" element={<p className="muted">Chọn một mục bên trái.</p>} />
         </Route>
       </Routes>
PATCH
```

- [ ] **Step 3: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/admin 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Test Files  4 passed (4)`, `Tests  23 passed (23)`.

- [ ] **Step 4: Commit**

```bash
git add apps/admin package-lock.json
git commit -m "feat(admin): funnels list and funnel page (upload with pre-check, lint, versions, preview + QR, pixel/app)"
```

---

### Task 12: Publish dialog + Live / Rollback (core: `live[].previous`)

**Files:**
- Modify (core): `services/core-api/src/publisher/catalog.js`; Test: `services/core-api/test/catalog.test.js`
- Modify: `apps/admin/package.json` (+ `@ikf/route-match`), `apps/admin/src/pages/FunnelDetail.jsx`
- Create: `apps/admin/src/components/{PublishDialog,RollbackDialog}.jsx`
- Test: `apps/admin/test/publish.test.jsx` (mới)

**Interfaces:**
- Consumes: `funnelDetail` (Task 5); `rollbackRoute` (chọn `from_version` của `route_events` mới nhất); client `listDomains`, `publish`, `rollback`; `normalizePath`, `isValidPrefix` (`@ikf/route-match`).
- Produces: `GET /v1/funnels/:slug` → `live: [{host, prefix, v, previous: {slug, v} | null}]` (`GET /v1/funnels` giữ `{host, prefix, v}`). SPA: `PublishDialog({funnel, version, onClose, onDone})` (chỉ host `active`; text `Đang live: vX → vY` / `Đang live funnel <slug> vX → <funnel> vY` (cần tick "Đổi funnel ở prefix này") / `Publish lần đầu tại <host><prefix>`), `resultText(r)`; `RollbackDialog({funnel, route, onClose, onDone})` (`<host><prefix>: vX → vY`); `data-testid="live"`, `"change"`; nút Publish/Rollback `need="admin"`, Rollback mờ `title="Không có bản trước"` khi `previous = null`.

- [ ] **Step 1: core — test fail**

`services/core-api/test/catalog.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/test/catalog.test.js b/services/core-api/test/catalog.test.js
index e10165a..b0c0313 100644
--- a/services/core-api/test/catalog.test.js
+++ b/services/core-api/test/catalog.test.js
@@ -78,10 +78,24 @@ describe('admin console reads: funnels, domains, audit', () => {
       lint: { errors: [], warnings: [{ code: 'missing_meta_viewport' }] }, created_by: 'seed', created_at: expect.any(String),
       preview_url: `${PREVIEW}/aivideo/v2`,
     });
-    expect(body.live).toEqual([{ host: 'a.example.com', prefix: '/', v: 2 }]);
+    expect(body.live).toEqual([{ host: 'a.example.com', prefix: '/', v: 2, previous: null }]);
     expect((await get('/v1/funnels/nope')).json()).toEqual({ error: 'funnel_not_found', detail: { funnel: 'nope' } });
   });
 
+  it('GET /v1/funnels/:slug: each live route names the version a rollback would return to (admin console Rollback "v3 → v2")', async () => {
+    await seedVersions(db.pool, store, 'aivideo', 3);
+    await seedVersions(db.pool, store, 'tarot', 1);
+    await publish('a.example.com', '/', 'tarot', 1);
+    await publish('a.example.com', '/', 'aivideo', 2);
+    await publish('a.example.com', '/x', 'aivideo', 3);
+    expect((await get('/v1/funnels/aivideo')).json().live).toEqual([
+      { host: 'a.example.com', prefix: '/', v: 2, previous: { slug: 'tarot', v: 1 } },
+      { host: 'a.example.com', prefix: '/x', v: 3, previous: null },
+    ]);
+    await app.inject({ method: 'POST', url: '/v1/routes/a.example.com/rollback', headers: bearer(admin), payload: { prefix: '/' } });
+    expect((await get('/v1/funnels/tarot')).json().live).toEqual([{ host: 'a.example.com', prefix: '/', v: 1, previous: { slug: 'aivideo', v: 2 } }]);
+  });
+
   it('GET /v1/domains: status, revisions and the routes on each host', async () => {
     await seedVersions(db.pool, store, 'aivideo', 1);
     await publish('a.example.com', '/', 'aivideo', 1);
PATCH
```

```bash
npm test -w @ikf/core-api -- test/catalog.test.js 2>&1 | grep -E "×|Tests  "
```

Expected: `Tests  2 failed | 5 passed (7)`.

- [ ] **Step 2: core — implement**

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/publisher/catalog.js b/services/core-api/src/publisher/catalog.js
index c673066..5a984d6 100644
--- a/services/core-api/src/publisher/catalog.js
+++ b/services/core-api/src/publisher/catalog.js
@@ -5,13 +5,11 @@ import { withTx } from '../identity/link.js';
 
 const iso = (d) => (d ? d.toISOString() : null);
 
-async function liveByFunnel(db, funnelId = null) {
+async function liveByFunnel(db) {
   const { rows } = await db.query(
     `SELECT v.funnel_id, r.host, r.path_prefix AS prefix, v.n AS v
        FROM routes r JOIN versions v ON v.id = r.version_id
-      WHERE $1::bigint IS NULL OR v.funnel_id = $1
       ORDER BY r.host, r.path_prefix`,
-    [funnelId],
   );
   const out = new Map();
   for (const r of rows) {
@@ -66,10 +64,28 @@ export async function funnelDetail(pool, slug, previewBaseUrl) {
       created_at: iso(v.created_at),
       preview_url: previewBaseUrl ? `${previewBaseUrl}/${f.slug}/v${v.n}` : null,
     })),
-    live: (await liveByFunnel(pool, f.id)).get(String(f.id)) ?? [],
+    live: await liveWithPrevious(pool, f.id),
   };
 }
 
+// A funnel's live routes, each with the version POST /v1/routes/:host/rollback would return to (the last
+// route event's from_version, as rollbackRoute picks it), or null.
+async function liveWithPrevious(pool, funnelId) {
+  const { rows } = await pool.query(
+    `SELECT r.host, r.path_prefix AS prefix, v.n AS v, pf.slug AS prev_slug, pv.n AS prev_v
+       FROM routes r JOIN versions v ON v.id = r.version_id
+       LEFT JOIN LATERAL (
+         SELECT e.from_version FROM route_events e WHERE e.host = r.host AND e.path_prefix = r.path_prefix ORDER BY e.id DESC LIMIT 1
+       ) le ON true
+       LEFT JOIN versions pv ON pv.id = le.from_version
+       LEFT JOIN funnels pf ON pf.id = pv.funnel_id
+      WHERE v.funnel_id = $1
+      ORDER BY r.host, r.path_prefix`,
+    [funnelId],
+  );
+  return rows.map((r) => ({ host: r.host, prefix: r.prefix, v: r.v, previous: r.prev_v ? { slug: r.prev_slug, v: r.prev_v } : null }));
+}
+
 // An empty funnel (no version yet), so an editor can start from the web.
 export async function createFunnel(pool, { slug, actor }) {
   await withTx(pool, async (c) => {
PATCH
```

```bash
npm test -w @ikf/core-api -- test/catalog.test.js 2>&1 | grep -E "Tests  "
```

Expected: `Tests  7 passed (7)`.

- [ ] **Step 3: SPA — test fail**

`apps/admin/test/publish.test.jsx` (mới):

```jsx
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { ApiError } from '../src/api.js';
import { fakeClient, renderApp, ME } from './helpers.jsx';

const version = (v) => ({ v, sha256: 'a'.repeat(64), size: 1024, lint: { errors: [], warnings: [] }, created_by: 'ed@ikameglobal.com', created_at: '2026-10-02T08:00:00.000Z', preview_url: `https://preview.ikf.example/aivideo/v${v}` });
const DETAIL = {
  slug: 'aivideo', pixel_id: null, app_id: null, created_by: 'ed', created_at: '2026-10-01T08:00:00.000Z',
  versions: [version(3), version(2), version(1)],
  live: [
    { host: 'a.example.com', prefix: '/', v: 2, previous: { slug: 'aivideo', v: 1 } },
    { host: 'b.example.com', prefix: '/promo', v: 3, previous: null },
  ],
};
const DOMAINS = {
  domains: [
    { host: 'a.example.com', status: 'active', rev: 4, kv_synced_rev: 4, routes: [{ prefix: '/', slug: 'aivideo', v: 2 }, { prefix: '/t', slug: 'tarot', v: 1 }] },
    { host: 'b.example.com', status: 'active', rev: 1, kv_synced_rev: 1, routes: [] },
    { host: 'off.example.com', status: 'disabled', rev: 0, kv_synced_rev: 0, routes: [] },
  ],
};

function setup(me = ME.admin, overrides = {}) {
  const client = fakeClient(me, {
    getFunnel: vi.fn(async () => DETAIL),
    listDomains: vi.fn(async () => DOMAINS),
    publish: vi.fn(async (host, b) => ({ host, prefix: b.prefix, funnel: b.funnel, v: b.v, rev: 5, kv_sync: 'ok', propagation_seconds: 90 })),
    rollback: vi.fn(async (host, prefix) => ({ host, prefix, funnel: 'aivideo', v: 1, rev: 6, kv_sync: 'ok', propagation_seconds: 90 })),
    ...overrides,
  });
  renderApp(client, '/funnels/aivideo');
  return client;
}

async function openPublish(v) {
  const row = (await screen.findAllByTestId('version')).find((r) => r.firstChild.textContent === `v${v}`);
  fireEvent.click(within(row).getByRole('button', { name: 'Publish' }));
  return screen.findByRole('dialog');
}

describe('Publish dialog (admin)', () => {
  it('only active hosts; shows what is live at host + prefix; publishes and gives the live URL', async () => {
    const client = setup();
    const dialog = await openPublish(3);
    const host = within(dialog).getByLabelText('Host');
    await waitFor(() => expect([...host.options].map((o) => o.value)).toEqual(['a.example.com', 'b.example.com']));
    expect(within(dialog).getByTestId('change').textContent).toBe('Đang live: v2 → v3');
    fireEvent.change(within(dialog).getByLabelText('Prefix'), { target: { value: '/new' } });
    expect(within(dialog).getByTestId('change').textContent).toBe('Publish lần đầu tại a.example.com/new');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận publish' }));
    expect(await screen.findByText('Đã publish v3: https://a.example.com/new (hiệu lực toàn cầu trong ~90 giây)')).toBeTruthy();
    expect(client.publish).toHaveBeenCalledWith('a.example.com', { prefix: '/new', funnel: 'aivideo', v: 3, confirm_funnel_change: false });
    expect(client.getFunnel).toHaveBeenCalledTimes(2);
  });

  it('another funnel live at that prefix: says which, and needs the "đổi funnel" box', async () => {
    const client = setup();
    const dialog = await openPublish(3);
    await waitFor(() => expect(within(dialog).getByLabelText('Host').options).toHaveLength(2));
    fireEvent.change(within(dialog).getByLabelText('Prefix'), { target: { value: '/t' } });
    expect(within(dialog).getByTestId('change').textContent).toBe('Đang live funnel tarot v1 → aivideo v3');
    const confirm = within(dialog).getByRole('button', { name: 'Xác nhận publish' });
    expect(confirm.disabled).toBe(true);
    fireEvent.click(within(dialog).getByLabelText('Đổi funnel ở prefix này'));
    fireEvent.click(confirm);
    await waitFor(() => expect(client.publish).toHaveBeenCalledWith('a.example.com', { prefix: '/t', funnel: 'aivideo', v: 3, confirm_funnel_change: true }));
  });

  it('server refusals are shown (lint errors, disabled host); a KV delay is a warning', async () => {
    let calls = 0;
    setup(ME.admin, {
      publish: vi.fn(async () => {
        calls += 1;
        if (calls === 1) throw new ApiError(409, { error: 'version_lint_failed' });
        return { host: 'a.example.com', prefix: '/', funnel: 'aivideo', v: 3, rev: 5, kv_sync: 'pending', propagation_seconds: 90 };
      }),
    });
    const dialog = await openPublish(3);
    await waitFor(() => expect(within(dialog).getByLabelText('Host').options).toHaveLength(2));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận publish' }));
    expect((await within(dialog).findByRole('alert')).textContent).toBe('Lỗi 409 version_lint_failed');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận publish' }));
    expect(await screen.findByText(/Đã lưu nhưng chưa lên edge \(KV\)/)).toBeTruthy();
  });

  it('editors and viewers see Publish and Rollback greyed out', async () => {
    setup(ME.editor);
    await screen.findAllByTestId('version');
    for (const b of [...screen.getAllByRole('button', { name: 'Publish' }), ...screen.getAllByRole('button', { name: 'Rollback' })]) {
      expect(b.disabled).toBe(true);
      expect(b.title).toBe('Cần quyền admin');
    }
  });
});

describe('Live routes and Rollback', () => {
  it('lists where the funnel is live; Rollback shows "v2 → v1", asks to confirm, then rolls back', async () => {
    const client = setup();
    const rows = await screen.findAllByTestId('live');
    expect(rows.map((r) => r.firstChild.textContent)).toEqual(['a.example.com/', 'b.example.com/promo']);
    fireEvent.click(within(rows[0]).getByRole('button', { name: 'Rollback' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByTestId('change').textContent).toBe('a.example.com/: v2 → v1');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận rollback' }));
    expect(await screen.findByText('Đã rollback a.example.com/ về aivideo v1.')).toBeTruthy();
    expect(client.rollback).toHaveBeenCalledWith('a.example.com', '/');
  });

  it('no previous version: Rollback is disabled and says why', async () => {
    setup();
    const rows = await screen.findAllByTestId('live');
    const btn = within(rows[1]).getByRole('button', { name: 'Rollback' });
    expect(btn.disabled).toBe(true);
    expect(btn.title).toBe('Không có bản trước');
  });
});
```

```bash
npm test -w @ikf/admin -- test/publish.test.jsx 2>&1 | grep -E "Tests  "
```

Expected: `Tests  6 failed (6)`.

- [ ] **Step 4: SPA — implement**

`apps/admin/package.json` (áp dụng đúng diff này), rồi `npm install`:

```bash
git apply <<'PATCH'
diff --git a/apps/admin/package.json b/apps/admin/package.json
index 2ce478a..f2d3a29 100644
--- a/apps/admin/package.json
+++ b/apps/admin/package.json
@@ -10,6 +10,7 @@
   },
   "dependencies": {
     "@ikf/funnel-lint": "*",
+    "@ikf/route-match": "*",
     "qrcode": "^1.5.4",
     "react": "^19.3.0",
     "react-dom": "^19.3.0",
PATCH
```

```bash
npm install
```

`apps/admin/src/components/PublishDialog.jsx` (mới):

```jsx
import { useEffect, useState } from 'react';
import { isValidPrefix, normalizePath } from '@ikf/route-match';
import { useAuth } from '../auth.jsx';
import { ErrorNote } from './ErrorNote.jsx';

export const resultText = (r) =>
  r.kv_sync === 'pending'
    ? `Đã lưu nhưng chưa lên edge (KV): hệ thống tự thử lại mỗi phút. ${r.host}${r.prefix} → ${r.funnel} v${r.v}.`
    : `Đã publish v${r.v}: https://${r.host}${r.prefix} (hiệu lực toàn cầu trong ~${r.propagation_seconds} giây)`;

// Publish one version to an active host + prefix (spec §5.3): says what changes, then PUT /v1/routes/:host.
export function PublishDialog({ funnel, version, onClose, onDone }) {
  const { client } = useAuth();
  const [domains, setDomains] = useState(null);
  const [host, setHost] = useState('');
  const [prefix, setPrefix] = useState('/');
  const [switchFunnel, setSwitchFunnel] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    client.listDomains().then((r) => {
      const active = r.domains.filter((d) => d.status === 'active');
      setDomains(active);
      setHost((h) => h || active[0]?.host || '');
    }, setError);
  }, [client]);

  const p = normalizePath(prefix);
  const valid = isValidPrefix(p);
  const current = domains?.find((d) => d.host === host)?.routes.find((r) => r.prefix === p) ?? null;
  const other = current !== null && current.slug !== funnel.slug;
  let change = `Publish lần đầu tại ${host}${p}`;
  if (other) change = `Đang live funnel ${current.slug} v${current.v} → ${funnel.slug} v${version.v}`;
  else if (current) change = `Đang live: v${current.v} → v${version.v}`;

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await client.publish(host, { prefix: p, funnel: funnel.slug, v: version.v, confirm_funnel_change: other && switchFunnel });
      onDone(resultText(r));
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-label={`Publish v${version.v}`} className="dialog">
      <h3>Publish {funnel.slug} v{version.v}</h3>
      {domains && !domains.length && <p className="warn">Chưa có domain active.</p>}
      <div className="row">
        <label htmlFor="pub-host">Host</label>
        <select id="pub-host" value={host} onChange={(e) => setHost(e.target.value)}>
          {(domains ?? []).map((d) => <option key={d.host} value={d.host}>{d.host}</option>)}
        </select>
        <label htmlFor="pub-prefix">Prefix</label>
        <input id="pub-prefix" value={prefix} onChange={(e) => setPrefix(e.target.value)} />
      </div>
      {valid ? <p data-testid="change">{change}</p> : <p className="error">Prefix không hợp lệ: chữ thường, số, . _ ~ -, mỗi đoạn bắt đầu bằng chữ/số.</p>}
      {other && (
        <label>
          <input type="checkbox" checked={switchFunnel} onChange={(e) => setSwitchFunnel(e.target.checked)} /> Đổi funnel ở prefix này
        </label>
      )}
      <ErrorNote error={error} />
      <div className="row">
        <button type="button" className="primary" onClick={confirm} disabled={busy || !host || !valid || (other && !switchFunnel)}>Xác nhận publish</button>
        <button type="button" onClick={onClose}>Huỷ</button>
      </div>
    </div>
  );
}
```

`apps/admin/src/components/RollbackDialog.jsx` (mới):

```jsx
import { useState } from 'react';
import { useAuth } from '../auth.jsx';
import { ErrorNote } from './ErrorNote.jsx';

// One-click return to the version before (spec §5.3 Live): POST /v1/routes/:host/rollback.
export function RollbackDialog({ funnel, route, onClose, onDone }) {
  const { client } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const where = `${route.host}${route.prefix}`;
  const to = route.previous.slug === funnel.slug ? `v${route.previous.v}` : `${route.previous.slug} v${route.previous.v}`;

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await client.rollback(route.host, route.prefix);
      onDone(r.kv_sync === 'pending'
        ? `Đã lưu rollback nhưng chưa lên edge (KV): hệ thống tự thử lại mỗi phút.`
        : `Đã rollback ${where} về ${r.funnel} v${r.v}.`);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-label={`Rollback ${where}`} className="dialog">
      <h3>Rollback</h3>
      <p data-testid="change">{where}: v{route.v} → {to}</p>
      <ErrorNote error={error} />
      <div className="row">
        <button type="button" className="primary" onClick={confirm} disabled={busy}>Xác nhận rollback</button>
        <button type="button" onClick={onClose}>Huỷ</button>
      </div>
    </div>
  );
}
```

```bash
git apply <<'PATCH'
diff --git a/apps/admin/src/pages/FunnelDetail.jsx b/apps/admin/src/pages/FunnelDetail.jsx
index 27f6868..d5a9c9e 100644
--- a/apps/admin/src/pages/FunnelDetail.jsx
+++ b/apps/admin/src/pages/FunnelDetail.jsx
@@ -4,7 +4,10 @@ import { useAuth } from '../auth.jsx';
 import { ErrorNote } from '../components/ErrorNote.jsx';
 import { FunnelSettings } from '../components/FunnelSettings.jsx';
 import { LintBadge } from '../components/LintBadge.jsx';
+import { PublishDialog } from '../components/PublishDialog.jsx';
 import { Qr } from '../components/Qr.jsx';
+import { RoleButton } from '../components/RoleButton.jsx';
+import { RollbackDialog } from '../components/RollbackDialog.jsx';
 import { UploadBox } from '../components/UploadBox.jsx';
 import { fmtSize, fmtTime } from '../format.js';
 
@@ -14,6 +17,9 @@ export function FunnelDetail() {
   const [funnel, setFunnel] = useState(null);
   const [error, setError] = useState(null);
   const [preview, setPreview] = useState(null);
+  const [publishing, setPublishing] = useState(null); // a version
+  const [rollingBack, setRollingBack] = useState(null); // a live route
+  const [notice, setNotice] = useState('');
 
   const load = useCallback(() => client.getFunnel(slug).then(setFunnel, setError), [client, slug]);
   useEffect(() => {
@@ -21,9 +27,40 @@ export function FunnelDetail() {
   }, [load]);
 
   if (!funnel) return error ? <ErrorNote error={error} /> : <p className="muted">Đang tải…</p>;
+  const done = (text) => {
+    setPublishing(null);
+    setRollingBack(null);
+    setNotice(text);
+    load();
+  };
   return (
     <section>
       <h1>{funnel.slug}</h1>
+      {notice && <p className="ok">{notice}</p>}
+      <div className="card">
+        <h2>Live</h2>
+        {funnel.live.length === 0 ? (
+          <p className="muted">Chưa live ở đâu.</p>
+        ) : (
+          <table>
+            <tbody>
+              {funnel.live.map((l) => (
+                <tr key={`${l.host}${l.prefix}`} data-testid="live">
+                  <td>{l.host}{l.prefix}</td>
+                  <td><span className="badge live">v{l.v}</span></td>
+                  <td>
+                    <RoleButton need="admin" disabled={!l.previous} title={l.previous ? undefined : 'Không có bản trước'} onClick={() => setRollingBack(l)}>
+                      Rollback
+                    </RoleButton>
+                  </td>
+                </tr>
+              ))}
+            </tbody>
+          </table>
+        )}
+      </div>
+      {rollingBack && <RollbackDialog funnel={funnel} route={rollingBack} onClose={() => setRollingBack(null)} onDone={done} />}
+      {publishing && <PublishDialog funnel={funnel} version={publishing} onClose={() => setPublishing(null)} onDone={done} />}
       <UploadBox slug={funnel.slug} onUploaded={load} />
       <div className="card">
         <h2>Versions</h2>
@@ -44,6 +81,7 @@ export function FunnelDetail() {
                   <td><LintBadge lint={v.lint} /></td>
                   <td className="row">
                     <button type="button" onClick={() => setPreview(v)}>Preview</button>
+                    <RoleButton need="admin" onClick={() => setPublishing(v)}>Publish</RoleButton>
                   </td>
                 </tr>
               ))}
PATCH
```

- [ ] **Step 5: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/admin 2>&1 | grep -E "Test Files|Tests  "
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: admin `Test Files  5 passed (5)`, `Tests  29 passed (29)`; core-api `Test Files  43 passed (43)`, `Tests  407 passed (407)`.

- [ ] **Step 6: Commit**

```bash
git add apps/admin services/core-api package-lock.json
git commit -m "feat(admin): publish dialog (active hosts, what changes, funnel switch confirmation), live routes and one-click rollback"
```

---

### Task 13: Màn Domains, Audit, Settings → Users

**Files:**
- Create: `apps/admin/src/pages/{Domains,Audit,Users}.jsx`
- Modify: `apps/admin/src/App.jsx`, `apps/admin/src/api.js` (+ `syncHost`), `apps/admin/test/helpers.jsx`
- Test: `apps/admin/test/pages.test.jsx` (mới)

**Interfaces:**
- Consumes: client `listDomains`, `syncHost` (`POST /v1/routes/:host/sync`), `listAudit`, `listUsers`, `createUser`, `updateUser`; `useAuth`, `RoleButton`, `ErrorNote`, `can`, `fmtTime`.
- Produces: route `/domains`, `/audit` (đọc `?target=` ban đầu), `/settings/users`. `data-testid="domain"`, `"add-domain"`, `"audit"`, `"user"`. Users: chỉ admin (`Chỉ admin quản lý người dùng.` cho role khác, không gọi API); dòng của chính mình không đổi role/khoá được.

- [ ] **Step 1: Viết test fail**

`apps/admin/test/pages.test.jsx` (mới):

```jsx
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { ApiError } from '../src/api.js';
import { fakeClient, renderApp, ME } from './helpers.jsx';

const DOMAINS = {
  domains: [
    { host: 'a.example.com', status: 'active', rev: 5, kv_synced_rev: 4, routes: [{ prefix: '/', slug: 'aivideo', v: 2 }, { prefix: '/t', slug: 'tarot', v: 1 }] },
    { host: 'off.example.com', status: 'disabled', rev: 1, kv_synced_rev: 1, routes: [] },
  ],
};
const item = (id, o = {}) => ({ id, at: '2026-10-11T08:00:00.000Z', actor: 'ed@ikameglobal.com', actor_kind: 'user', action: 'version.upload', target: 'funnel:aivideo', details: { slug: 'aivideo', v: id }, ...o });
const USERS = {
  users: [
    { id: 1, email: 'boss@ikameglobal.com', name: 'Boss', role: 'admin', disabled_at: null, created_by: 'bootstrap', created_at: '2026-10-01T00:00:00.000Z' },
    { id: 2, email: 'ed@ikameglobal.com', name: 'Ed', role: 'editor', disabled_at: null, created_by: 'boss@ikameglobal.com', created_at: '2026-10-02T00:00:00.000Z' },
    { id: 3, email: 'old@ikameglobal.com', name: '', role: 'viewer', disabled_at: '2026-10-05T00:00:00.000Z', created_by: 'boss@ikameglobal.com', created_at: '2026-10-03T00:00:00.000Z' },
  ],
};

describe('Domains', () => {
  it('host, status, route count and routes; a KV lag shows a Sync button (admin)', async () => {
    const client = fakeClient(ME.admin, { listDomains: vi.fn(async () => DOMAINS), syncHost: vi.fn(async () => ({ host: 'a.example.com', rev: 5, kv_sync: 'ok' })) });
    renderApp(client, '/domains');
    const rows = await screen.findAllByTestId('domain');
    expect(rows.map((r) => [...r.querySelectorAll('td')].slice(0, 4).map((td) => td.textContent))).toEqual([
      ['a.example.com', 'active', '2', '/ → aivideo v2, /t → tarot v1'],
      ['off.example.com', 'disabled', '0', '—'],
    ]);
    expect(within(rows[0]).getByText('KV chậm hơn DB (rev 4 < 5)')).toBeTruthy();
    fireEvent.click(within(rows[0]).getByRole('button', { name: 'Sync' }));
    await waitFor(() => expect(client.syncHost).toHaveBeenCalledWith('a.example.com'));
    expect(within(rows[1]).queryByRole('button', { name: 'Sync' })).toBeNull();
  });

  it('adding a domain is a Terraform change: the page says how', async () => {
    renderApp(fakeClient(ME.editor, { listDomains: vi.fn(async () => DOMAINS) }), '/domains');
    fireEvent.click(await screen.findByRole('button', { name: 'Thêm domain' }));
    expect(screen.getByTestId('add-domain').textContent).toMatch(/funnel_domains.*terraform apply.*sync-domains\.sh/s);
  });
});

describe('Audit', () => {
  it('newest first: time, who, action, target, details; filter by funnel/host and action; load more', async () => {
    const listAudit = vi.fn(async (p) => (p.before ? { items: [item(1)], next_before: null } : { items: [item(3, { action: 'route.publish', target: 'route:a.example.com/', details: { host: 'a.example.com', from_v: 1, to_v: 2 } }), item(2)], next_before: 2 }));
    renderApp(fakeClient(ME.viewer, { listAudit }), '/audit?target=funnel:aivideo');
    const rows = await screen.findAllByTestId('audit');
    expect([...rows[0].querySelectorAll('td')].map((td) => td.textContent)).toEqual([
      '2026-10-11 08:00', 'ed@ikameglobal.com', 'route.publish', 'route:a.example.com/', 'host=a.example.com from_v=1 to_v=2',
    ]);
    expect(listAudit).toHaveBeenLastCalledWith({ target: 'funnel:aivideo', action: '' });
    fireEvent.click(screen.getByRole('button', { name: 'Tải thêm' }));
    await waitFor(() => expect(screen.getAllByTestId('audit')).toHaveLength(3));
    expect(listAudit).toHaveBeenLastCalledWith({ target: 'funnel:aivideo', action: '', before: 2 });
    expect(screen.queryByRole('button', { name: 'Tải thêm' })).toBeNull();
    fireEvent.change(screen.getByLabelText('Đối tượng'), { target: { value: 'domain:a.example.com' } });
    fireEvent.change(screen.getByLabelText('Hành động'), { target: { value: 'route' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lọc' }));
    await waitFor(() => expect(listAudit).toHaveBeenLastCalledWith({ target: 'domain:a.example.com', action: 'route' }));
  });
});

describe('Settings → Users', () => {
  it('admin: list, add, change a role, disable and enable; their own row cannot be demoted or disabled', async () => {
    const client = fakeClient(ME.admin, {
      listUsers: vi.fn(async () => USERS),
      createUser: vi.fn(async (b) => ({ id: 4, ...b, disabled_at: null })),
      updateUser: vi.fn(async (id, b) => ({ ...USERS.users[id - 1], ...b })),
    });
    renderApp(client, '/settings/users');
    const rows = await screen.findAllByTestId('user');
    expect(rows.map((r) => r.firstChild.textContent)).toEqual(['boss@ikameglobal.com', 'ed@ikameglobal.com', 'old@ikameglobal.com']);
    const self = within(rows[0]);
    expect(self.getByLabelText('Role của boss@ikameglobal.com').disabled).toBe(true);
    expect(self.getByRole('button', { name: 'Khoá' }).disabled).toBe(true);
    fireEvent.change(within(rows[1]).getByLabelText('Role của ed@ikameglobal.com'), { target: { value: 'admin' } });
    await waitFor(() => expect(client.updateUser).toHaveBeenCalledWith(2, { role: 'admin' }));
    fireEvent.click(within(rows[1]).getByRole('button', { name: 'Khoá' }));
    await waitFor(() => expect(client.updateUser).toHaveBeenCalledWith(2, { disabled: true }));
    fireEvent.click(within(rows[2]).getByRole('button', { name: 'Mở khoá' }));
    await waitFor(() => expect(client.updateUser).toHaveBeenCalledWith(3, { disabled: false }));
    fireEvent.change(screen.getByPlaceholderText('email@ikameglobal.com'), { target: { value: 'new@ikameglobal.com' } });
    fireEvent.change(screen.getByLabelText('Role mới'), { target: { value: 'viewer' } });
    fireEvent.click(screen.getByRole('button', { name: 'Thêm' }));
    await waitFor(() => expect(client.createUser).toHaveBeenCalledWith({ email: 'new@ikameglobal.com', name: '', role: 'viewer' }));
    expect(client.listUsers.mock.calls.length).toBeGreaterThanOrEqual(5);
  });

  it('add errors are shown (another domain, already there)', async () => {
    renderApp(fakeClient(ME.admin, { listUsers: vi.fn(async () => USERS), createUser: vi.fn(async () => { throw new ApiError(400, { error: 'invalid_email' }); }) }), '/settings/users');
    fireEvent.change(await screen.findByPlaceholderText('email@ikameglobal.com'), { target: { value: 'x@gmail.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Thêm' }));
    expect((await screen.findByRole('alert')).textContent).toBe('Lỗi 400 invalid_email');
  });

  it('editors and viewers do not manage users', async () => {
    const client = fakeClient(ME.editor);
    renderApp(client, '/settings/users');
    expect(await screen.findByText('Chỉ admin quản lý người dùng.')).toBeTruthy();
    expect(client.listUsers).not.toHaveBeenCalled();
  });
});
```

`apps/admin/test/helpers.jsx` (áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/test/helpers.jsx b/apps/admin/test/helpers.jsx
index 4de867c..5faac35 100644
--- a/apps/admin/test/helpers.jsx
+++ b/apps/admin/test/helpers.jsx
@@ -28,6 +28,7 @@ export function fakeClient(me = ME.admin, overrides = {}) {
     setFunnel: vi.fn(),
     listApps: vi.fn(async () => ({ apps: [] })),
     listDomains: vi.fn(async () => ({ domains: [] })),
+    syncHost: vi.fn(),
     publish: vi.fn(),
     rollback: vi.fn(),
     listAudit: vi.fn(async () => ({ items: [], next_before: null })),
PATCH
```

```bash
npm test -w @ikf/admin -- test/pages.test.jsx 2>&1 | grep -E "Tests  "
```

Expected: `Tests  6 failed (6)`.

- [ ] **Step 2: Implement**

`apps/admin/src/pages/Domains.jsx` (mới):

```jsx
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth.jsx';
import { ErrorNote } from '../components/ErrorNote.jsx';
import { RoleButton } from '../components/RoleButton.jsx';

// Funnel hosts (spec §5.4). Domains are Terraform's (publisher spec: never created through the API), so
// "Thêm domain" explains the steps instead of calling anything.
export function Domains() {
  const { client } = useAuth();
  const [domains, setDomains] = useState(null);
  const [error, setError] = useState(null);
  const [help, setHelp] = useState(false);
  const [notice, setNotice] = useState('');

  const load = useCallback(() => client.listDomains().then((r) => setDomains(r.domains), setError), [client]);
  useEffect(() => {
    load();
  }, [load]);

  const sync = async (host) => {
    setError(null);
    try {
      const r = await client.syncHost(host);
      setNotice(`${r.host}: KV đã đồng bộ (rev ${r.rev}).`);
      load();
    } catch (err) {
      setError(err);
    }
  };

  return (
    <section>
      <h1>Domains</h1>
      <button type="button" onClick={() => setHelp(!help)}>Thêm domain</button>
      {help && (
        <div className="card" data-testid="add-domain">
          <p>
            Domain do Terraform quản lý: thêm host vào <code>funnel_domains</code> trong <code>infra/envs/&lt;env&gt;/terraform.tfvars</code>,
            chạy <code>terraform apply</code> (workflow infra), rồi <code>scripts/sync-domains.sh &lt;env&gt;</code> để core nhận domain.
            Bản ghi DNS của host do Terraform tạo (Cloudflare, proxied). Chi tiết: docs/runbooks/admin-console.md.
          </p>
        </div>
      )}
      {notice && <p className="ok">{notice}</p>}
      <ErrorNote error={error} />
      {domains === null ? (
        <p className="muted">Đang tải…</p>
      ) : (
        <table>
          <thead>
            <tr><th>Host</th><th>Trạng thái</th><th>Số route</th><th>Routes</th><th /></tr>
          </thead>
          <tbody>
            {domains.map((d) => (
              <tr key={d.host} data-testid="domain">
                <td>{d.host}</td>
                <td>{d.status}</td>
                <td>{d.routes.length}</td>
                <td>{d.routes.map((r) => `${r.prefix} → ${r.slug} v${r.v}`).join(', ') || '—'}</td>
                <td>
                  {d.kv_synced_rev < d.rev && (
                    <span className="row">
                      <span className="warn">KV chậm hơn DB (rev {d.kv_synced_rev} &lt; {d.rev})</span>
                      <RoleButton need="admin" onClick={() => sync(d.host)}>Sync</RoleButton>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
```

`apps/admin/src/pages/Audit.jsx` (mới):

```jsx
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useAuth } from '../auth.jsx';
import { ErrorNote } from '../components/ErrorNote.jsx';
import { fmtTime } from '../format.js';

const ACTIONS = ['', 'version', 'route', 'domain', 'funnel', 'app', 'token', 'admin.user', 'auth'];
const details = (d) => Object.entries(d).map(([k, v]) => `${k}=${v !== null && typeof v === 'object' ? JSON.stringify(v) : v}`).join(' ');

// Who did what (spec §5.5): newest first, filter by funnel:<slug> / domain:<host> and action family.
export function Audit() {
  const { client } = useAuth();
  const [params] = useSearchParams();
  const [target, setTarget] = useState(params.get('target') ?? '');
  const [action, setAction] = useState('');
  const [items, setItems] = useState(null);
  const [next, setNext] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async (filter, before) => {
    setError(null);
    try {
      const r = await client.listAudit({ ...filter, ...(before && { before }) });
      setItems((prev) => (before ? [...prev, ...r.items] : r.items));
      setNext(r.next_before);
    } catch (err) {
      setError(err);
    }
  }, [client]);

  const [filter, setFilter] = useState({ target: params.get('target') ?? '', action: '' });
  useEffect(() => {
    load(filter);
  }, [load, filter]);

  return (
    <section>
      <h1>Audit</h1>
      <div className="row">
        <label htmlFor="audit-target">Đối tượng</label>
        <input id="audit-target" placeholder="funnel:slug hoặc domain:host" value={target} onChange={(e) => setTarget(e.target.value)} />
        <label htmlFor="audit-action">Hành động</label>
        <select id="audit-action" value={action} onChange={(e) => setAction(e.target.value)}>
          {ACTIONS.map((a) => <option key={a} value={a}>{a || 'tất cả'}</option>)}
        </select>
        <button type="button" onClick={() => setFilter({ target: target.trim(), action })}>Lọc</button>
      </div>
      <ErrorNote error={error} />
      {items === null ? (
        <p className="muted">Đang tải…</p>
      ) : (
        <table>
          <thead>
            <tr><th>Thời gian (UTC)</th><th>Ai</th><th>Hành động</th><th>Đối tượng</th><th>Chi tiết</th></tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} data-testid="audit">
                <td>{fmtTime(i.at)}</td>
                <td>{i.actor}</td>
                <td>{i.action}</td>
                <td>{i.target}</td>
                <td>{details(i.details)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {next && <button type="button" onClick={() => load(filter, next)}>Tải thêm</button>}
    </section>
  );
}
```

`apps/admin/src/pages/Users.jsx` (mới):

```jsx
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth.jsx';
import { ErrorNote } from '../components/ErrorNote.jsx';
import { can } from '../roles.js';

const ROLES = ['viewer', 'editor', 'admin'];

// Settings → Users (spec §5.6): admins add people, change roles, disable; nobody locks themselves out.
export function Users() {
  const { client, me } = useAuth();
  const isAdmin = can(me.role, 'admin');
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState({ email: '', name: '', role: 'editor' });

  const load = useCallback(() => client.listUsers().then((r) => setUsers(r.users), setError), [client]);
  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const act = async (fn) => {
    setError(null);
    try {
      await fn();
      await load();
    } catch (err) {
      setError(err);
    }
  };

  if (!isAdmin) return <section><h1>Users</h1><p className="muted">Chỉ admin quản lý người dùng.</p></section>;
  return (
    <section>
      <h1>Users</h1>
      <div className="row card">
        <input placeholder="email@ikameglobal.com" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
        <input placeholder="Tên" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <select aria-label="Role mới" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })}>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <button
          type="button"
          className="primary"
          disabled={!draft.email.trim()}
          onClick={() => act(async () => {
            await client.createUser({ email: draft.email.trim(), name: draft.name.trim(), role: draft.role });
            setDraft({ email: '', name: '', role: 'editor' });
          })}
        >
          Thêm
        </button>
      </div>
      <ErrorNote error={error} />
      {users === null ? (
        <p className="muted">Đang tải…</p>
      ) : (
        <table>
          <thead>
            <tr><th>Email</th><th>Tên</th><th>Role</th><th>Trạng thái</th><th /></tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const self = u.email === me.email;
              const why = self ? 'Không tự khoá hay hạ quyền chính mình' : undefined;
              return (
                <tr key={u.id} data-testid="user">
                  <td>{u.email}</td>
                  <td>{u.name || '—'}</td>
                  <td>
                    <select aria-label={`Role của ${u.email}`} value={u.role} disabled={self} title={why} onChange={(e) => act(() => client.updateUser(u.id, { role: e.target.value }))}>
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td>{u.disabled_at ? `khoá từ ${u.disabled_at.slice(0, 10)}` : 'hoạt động'}</td>
                  <td>
                    {u.disabled_at ? (
                      <button type="button" onClick={() => act(() => client.updateUser(u.id, { disabled: false }))}>Mở khoá</button>
                    ) : (
                      <button type="button" disabled={self} title={why} onClick={() => act(() => client.updateUser(u.id, { disabled: true }))}>Khoá</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
```

```bash
git apply <<'PATCH'
diff --git a/apps/admin/src/App.jsx b/apps/admin/src/App.jsx
index a52d200..85fb661 100644
--- a/apps/admin/src/App.jsx
+++ b/apps/admin/src/App.jsx
@@ -1,9 +1,12 @@
 import { Navigate, Route, Routes } from 'react-router';
 import { AuthProvider, RequireAuth } from './auth.jsx';
 import { Layout } from './Layout.jsx';
+import { Audit } from './pages/Audit.jsx';
+import { Domains } from './pages/Domains.jsx';
 import { FunnelDetail } from './pages/FunnelDetail.jsx';
 import { Funnels } from './pages/Funnels.jsx';
 import { Login } from './pages/Login.jsx';
+import { Users } from './pages/Users.jsx';
 
 export function App({ client }) {
   return (
@@ -14,6 +17,9 @@ export function App({ client }) {
           <Route index element={<Navigate to="/funnels" replace />} />
           <Route path="/funnels" element={<Funnels />} />
           <Route path="/funnels/:slug" element={<FunnelDetail />} />
+          <Route path="/domains" element={<Domains />} />
+          <Route path="/audit" element={<Audit />} />
+          <Route path="/settings/users" element={<Users />} />
           <Route path="*" element={<p className="muted">Chọn một mục bên trái.</p>} />
         </Route>
       </Routes>
diff --git a/apps/admin/src/api.js b/apps/admin/src/api.js
index 8df9eba..ef9507e 100644
--- a/apps/admin/src/api.js
+++ b/apps/admin/src/api.js
@@ -85,6 +85,7 @@ export function createClient({ base = API_BASE, fetch = (...a) => globalThis.fet
     setFunnel: (slug, body) => call('PUT', `/v1/funnels/${q(slug)}`, body),
     listApps: () => call('GET', '/v1/apps'),
     listDomains: () => call('GET', '/v1/domains'),
+    syncHost: (host) => call('POST', `/v1/routes/${q(host)}/sync`),
     publish: (host, body) => call('PUT', `/v1/routes/${q(host)}`, body),
     rollback: (host, prefix) => call('POST', `/v1/routes/${q(host)}/rollback`, { prefix }),
     listAudit: (params = {}) => {
PATCH
```

- [ ] **Step 3: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/admin 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Test Files  6 passed (6)`, `Tests  35 passed (35)`.

- [ ] **Step 4: Commit**

```bash
git add apps/admin
git commit -m "feat(admin): domains (KV sync, how to add a domain), audit (filters, paging), users (add, role, disable)"
```

---

### Task 14: Demo: SPA ở `http://localhost:8792` + `--admin-user`; e2e Playwright upload → preview → publish → live `__IKF` → rollback

**Files:**
- Create: `demo/lib/admin.mjs`
- Modify: `demo/lib/options.mjs` (`--admin-user`), `demo/lib/stack.mjs` (deps admin, build + phục vụ SPA, host `demo.localhost`), `demo/run.mjs`, `demo/README.md`, `package.json` (devDependency `vite`)
- Test: `demo/test/admin-server.test.mjs`, `demo/test/admin-e2e.test.mjs` (mới)

**Interfaces:**
- Consumes: `buildApp({deps: {admin: {appEnv: 'local', origin, localUser}}})` (Task 3); SPA `apps/admin` (Task 10–13, nhãn/tên nút dùng trong e2e); `createSession`, `SESSION_COOKIE` (Task 3); `findFunnels`, `rewriteMedia`, `startStack`, `PG` (demo có sẵn).
- Produces: `ADMIN_APP_DIR`, `ADMIN_BUILD_DIR` (`demo/.build/admin/`, đã gitignore), `buildAdmin({apiBase, outDir})`, `startAdminServer({dir, port, host})` → `{port, close()}` (`demo/lib/admin.mjs`); `DEFAULT_ADMIN_USER = 'demo@ikameglobal.com'`, option `--admin-user` (chữ thường, phải là email); `PORTS.admin = 8792`, `ADMIN_DEMO_HOST = 'demo.localhost'`; `startStack({adminUser, adminBuildDir})` → thêm `adminUrl`, `adminUser` (không có `adminUser` thì như cũ: không build, không cổng 8792).

- [ ] **Step 1: Viết test fail (build + server + option)**

`demo/test/admin-server.test.mjs` (mới):

```js
import { get as httpGet } from 'node:http';
import { mkdtemp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect, afterAll } from 'vitest';
import { buildAdmin, startAdminServer } from '../lib/admin.mjs';
import { parseOptions, DEFAULT_ADMIN_USER } from '../lib/options.mjs';

describe('admin console in the demo', () => {
  let server;
  afterAll(() => server?.close());

  it('buildAdmin bakes the core-api origin into the SPA bundle', async () => {
    const out = await mkdtemp(join(tmpdir(), 'ikf-admin-'));
    await buildAdmin({ apiBase: 'http://localhost:8138', outDir: out });
    const assets = await readdir(join(out, 'assets'));
    const js = await readFile(join(out, 'assets', assets.find((f) => f.endsWith('.js'))), 'utf8');
    expect(js).toContain('http://localhost:8138');
    expect(await readFile(join(out, 'index.html'), 'utf8')).toContain('<div id="root"></div>');
  });

  it('serves files, falls back to index.html for app paths, 404 for a missing file or a path out of the folder', async () => {
    const top = await mkdtemp(join(tmpdir(), 'ikf-admin-static-'));
    const dir = join(top, 'site');
    await mkdir(join(dir, 'assets'), { recursive: true });
    await writeFile(join(top, 'secret.json'), '{}');
    await writeFile(join(dir, 'index.html'), '<div id="root"></div>');
    await writeFile(join(dir, 'assets', 'app.js'), 'console.log(1)');
    server = await startAdminServer({ dir, port: 0 });
    const base = `http://127.0.0.1:${server.port}`;
    const get = (p) => fetch(base + p);
    expect(await (await get('/')).text()).toBe('<div id="root"></div>');
    const js = await get('/assets/app.js');
    expect(js.headers.get('content-type')).toBe('text/javascript; charset=utf-8');
    const deep = await get('/funnels/aivideo');
    expect(deep.headers.get('content-type')).toBe('text/html; charset=utf-8');
    expect(await deep.text()).toBe('<div id="root"></div>');
    expect((await get('/assets/missing.js')).status).toBe(404);
    // fetch() would normalise the dots away; send the raw path.
    const raw = (p) => new Promise((ok) => httpGet({ host: '127.0.0.1', port: server.port, path: p }, (r) => ok(r.statusCode)));
    expect(await raw('/assets/..%2f..%2fsecret.json')).toBe(404);
  });

  it('--admin-user: the local admin (no Google), demo@ikameglobal.com by default', () => {
    expect(parseOptions([])['admin-user']).toBe(DEFAULT_ADMIN_USER);
    expect(DEFAULT_ADMIN_USER).toBe('demo@ikameglobal.com');
    expect(parseOptions(['--admin-user', 'An@IkameGlobal.com'])['admin-user']).toBe('an@ikameglobal.com');
    expect(() => parseOptions(['--admin-user', 'nope'])).toThrow('--admin-user phải là một email, nhận được nope');
  });
});
```

```bash
npx vitest run --config demo/vitest.config.mjs demo/test/admin-server.test.mjs 2>&1 | grep -E "FAIL|Tests  "
```

Expected: FAIL khi import (`demo/lib/admin.mjs` chưa có), `Tests  no tests`.

- [ ] **Step 2: Implement build + server + option**

`package.json` gốc (`vite` cho demo; áp dụng đúng diff này), rồi `npm install`:

```bash
git apply <<'PATCH'
diff --git a/package.json b/package.json
index bcf8b6e..33d0daa 100644
--- a/package.json
+++ b/package.json
@@ -23,6 +23,7 @@
     "miniflare": "4.20260310.0",
     "pg": "^8.23.1",
     "qrcode-terminal": "^0.12.0",
+    "vite": "^7.3.7",
     "vitest": "~3.2.0"
   }
 }
PATCH
```

```bash
npm install
```

`demo/lib/admin.mjs` (mới):

```js
// The admin console SPA (apps/admin) in the demo: built with the local core-api origin baked in and served
// as static files with an index.html fallback (spec admin-console-p1 §1, Local).
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { pipeline } from 'node:stream';
import { build } from 'vite';

export const ADMIN_APP_DIR = new URL('../../apps/admin/', import.meta.url).pathname;
export const ADMIN_BUILD_DIR = new URL('../.build/admin/', import.meta.url).pathname;

export async function buildAdmin({ apiBase, outDir = ADMIN_BUILD_DIR }) {
  await build({
    root: ADMIN_APP_DIR,
    configFile: resolve(ADMIN_APP_DIR, 'vite.config.js'),
    mode: 'production',
    logLevel: 'error',
    build: { outDir, emptyOutDir: true },
    define: { 'import.meta.env.VITE_API_BASE': JSON.stringify(apiBase) },
  });
  return outDir;
}

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json',
};

export async function startAdminServer({ dir, port = 8792, host = '127.0.0.1' }) {
  const root = await realpath(dir);
  const send = (res, file, s) => {
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream', 'content-length': s.size, 'cache-control': 'no-cache' });
    pipeline(createReadStream(file), res, () => {});
  };
  const server = createServer(async (req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return res.writeHead(405).end();
    try {
      const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      // An app path (no extension) is the SPA: index.html.
      if (!extname(path)) {
        const index = resolve(root, 'index.html');
        return send(res, index, await stat(index));
      }
      const file = await realpath(resolve(root, `.${path}`));
      if (!file.startsWith(root + sep)) return res.writeHead(404).end();
      const s = await stat(file);
      if (!s.isFile()) return res.writeHead(404).end();
      return send(res, file, s);
    } catch {
      if (!res.headersSent) res.writeHead(404).end();
      return undefined;
    }
  });
  await new Promise((ok, fail) => {
    server.once('error', fail);
    server.listen(port, host, ok);
  });
  return {
    port: server.address().port,
    close: () => new Promise((ok) => { server.closeAllConnections(); server.close(() => ok()); }),
  };
}
```

```bash
git apply <<'PATCH'
diff --git a/demo/lib/options.mjs b/demo/lib/options.mjs
index 266b24c..db95a75 100644
--- a/demo/lib/options.mjs
+++ b/demo/lib/options.mjs
@@ -4,6 +4,8 @@ import qrcode from 'qrcode-terminal';
 import { DemoError } from './docker.mjs';
 
 export const PURCHASE_FUNNEL = 'witch-power';
+// Signs in to the admin console at http://localhost:8792 without Google (APP_ENV=local only).
+export const DEFAULT_ADMIN_USER = 'demo@ikameglobal.com';
 
 export const USAGE = `Usage: npm run demo -- [options]
   --funnels a,b,c     funnel slugs (CONFIG.funnel); default ewa-books,calmio-calm-kids,moon-reading
@@ -14,6 +16,7 @@ export const USAGE = `Usage: npm run demo -- [options]
   --no-lan            only localhost (no LAN IP route, images from 127.0.0.1)
   --reset             wipe Postgres + ClickHouse volumes first
   --verbose           Miniflare + core-api logs
+  --admin-user <e>    admin console (http://localhost:8792) signs in as this admin without Google; default ${DEFAULT_ADMIN_USER}
 Full purchase flow (fake Paddle, fake app, inbox; npm run demo:purchase = --purchase --tunnel):
   --purchase          buy on a real funnel over https, get-app → fake app (PRO), refund → FREE
   --tunnel            https through a Cloudflare quick tunnel (brew install cloudflared; no account)
@@ -38,8 +41,13 @@ export function parseOptions(argv) {
       tunnel: { type: 'boolean', default: false },
       host: { type: 'string' },
       funnel: { type: 'string', default: PURCHASE_FUNNEL },
+      'admin-user': { type: 'string', default: DEFAULT_ADMIN_USER },
     },
   });
+  values['admin-user'] = values['admin-user'].trim().toLowerCase();
+  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values['admin-user'])) {
+    throw new DemoError(`--admin-user phải là một email, nhận được ${values['admin-user']}`);
+  }
   values.country = values.country.toUpperCase();
   if (!/^[A-Z]{2}$/.test(values.country)) throw new DemoError(`--country must be a 2-letter code, got ${values.country}`);
   if (!values.purchase) {
PATCH
```

```bash
npx vitest run --config demo/vitest.config.mjs demo/test/admin-server.test.mjs demo/test/options.test.mjs 2>&1 | grep -E "Tests  "
```

Expected: `Tests  7 passed (7)` (admin-server 3, options 4).

- [ ] **Step 3: Viết e2e fail**

`demo/test/admin-e2e.test.mjs` (mới):

```js
// Admin console end to end (spec admin-console-p1 §7) on the real demo stack, in Chromium: sign in as the local
// admin → upload a real funnel → preview (link + QR) → publish → the live URL serves it with __IKF → rollback.
// Own ports and databases, like demo.test.mjs; skips without the funnels folder.
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, it, expect, afterAll } from 'vitest';
import pg from 'pg';
import { chromium } from 'playwright';
import { createSession, SESSION_COOKIE } from '../../services/core-api/src/admin/sessions.js';
import { DEFAULT_FUNNELS_DIR, findFunnels } from '../lib/funnels.mjs';
import { rewriteMedia } from '../lib/media.mjs';
import { ADMIN_DEMO_HOST, PG, startStack } from '../lib/stack.mjs';

const FUNNELS_DIR = process.env.IKF_FUNNELS_DIR || DEFAULT_FUNNELS_DIR;
const FUNNEL = 'ewa-books';
const skipReason = !existsSync(FUNNELS_DIR) ? `funnels folder not found: ${FUNNELS_DIR}` : !(await findFunnels(FUNNELS_DIR)).has(FUNNEL) ? `${FUNNEL} missing` : '';
if (skipReason) console.warn(`admin e2e skipped: ${skipReason}`);

const PORTS = { edge: 8837, core: 8138, media: 8839, admin: 8842 };
const ADMIN_USER = 'e2e@ikameglobal.com';

let stack;
let browser;
afterAll(async () => {
  await browser?.close();
  await stack?.stop();
});

const LIVE = `http://${ADMIN_DEMO_HOST}:${PORTS.edge}/${FUNNEL}`;

// The version the edge serves at demo.localhost/ewa-books, from window.__IKF in Chromium (which sends
// *.localhost to this machine). KV reads may lag a little: poll.
async function liveVersion(expected) {
  const page = await browser.newPage();
  let v = null;
  for (const end = Date.now() + 40_000; Date.now() < end; await new Promise((r) => setTimeout(r, 500))) {
    await page.goto(LIVE);
    v = await page.evaluate(() => window.__IKF?.v ?? null);
    if (v === expected) break;
  }
  await page.close();
  return v;
}

describe.skipIf(skipReason)('admin console e2e', () => {
  it('sign in → upload → preview → publish → live with __IKF → rollback, all audited', async () => {
    stack = await startStack({
      funnels: [FUNNEL], ports: PORTS, lan: false, pgDatabase: 'ikf_admin_test', chDatabase: 'ikf_admin_test', adminUser: ADMIN_USER,
    });
    const before = stack.published[0].v;
    browser = await chromium.launch();
    expect(await liveVersion(before)).toBe(before);
    const page = await browser.newPage();
    await page.goto(`${stack.adminUrl}/funnels/${FUNNEL}`);
    await page.getByRole('link', { name: 'Đăng nhập bằng Google' }).click();
    await page.getByRole('heading', { name: FUNNEL }).waitFor();
    expect(await page.getByTestId('who').textContent()).toBe(`${ADMIN_USER} · admin`);

    // Upload: the real funnel (images on the demo media server), changed so it is a new version.
    const dir = (await findFunnels(FUNNELS_DIR)).get(FUNNEL);
    const html = `${rewriteMedia(await readFile(join(dir, 'demo.html'), 'utf8'), FUNNEL, stack.mediaBase)}\n<!-- admin e2e ${Date.now()} -->\n`;
    await page.getByLabel('Chọn demo.html').setInputFiles({ name: 'demo.html', mimeType: 'text/html', buffer: Buffer.from(html) });
    const created = await page.getByText(/^Đã tạo v\d+\.$/).textContent();
    const v = Number(/v(\d+)/.exec(created)[1]);
    expect(v).toBeGreaterThan(before);
    const top = page.getByTestId('version').first();
    await expect.poll(() => top.locator('td').first().textContent()).toBe(`v${v}`);

    // Preview: link + QR; the preview host serves the new version before it is published.
    await top.getByRole('button', { name: 'Preview' }).click();
    const link = page.getByTestId('preview').getByRole('link');
    expect(await link.getAttribute('href')).toBe(`http://preview.localhost:${PORTS.edge}/${FUNNEL}/v${v}`);
    await page.getByTestId('preview').locator('svg').waitFor();
    const preview = await browser.newPage();
    const res = await preview.goto(`http://preview.localhost:${PORTS.edge}/${FUNNEL}/v${v}`);
    expect(res.status()).toBe(200);
    expect(await preview.evaluate(() => window.__IKF.preview)).toBe(true);
    await preview.close();

    // Publish to demo.localhost/ewa-books.
    await top.getByRole('button', { name: 'Publish' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Host').selectOption(ADMIN_DEMO_HOST);
    await dialog.getByLabel('Prefix').fill(`/${FUNNEL}`);
    expect(await dialog.getByTestId('change').textContent()).toBe(`Đang live: v${before} → v${v}`);
    await dialog.getByRole('button', { name: 'Xác nhận publish' }).click();
    await page.getByText(`Đã publish v${v}: https://${ADMIN_DEMO_HOST}/${FUNNEL} (hiệu lực toàn cầu trong ~90 giây)`).waitFor();
    expect(await liveVersion(v)).toBe(v);

    // Rollback, one click + confirm.
    const live = page.getByTestId('live').filter({ hasText: `${ADMIN_DEMO_HOST}/${FUNNEL}` });
    await live.getByRole('button', { name: 'Rollback' }).click();
    expect(await page.getByRole('dialog').getByTestId('change').textContent()).toBe(`${ADMIN_DEMO_HOST}/${FUNNEL}: v${v} → v${before}`);
    await page.getByRole('button', { name: 'Xác nhận rollback' }).click();
    await page.getByText(`Đã rollback ${ADMIN_DEMO_HOST}/${FUNNEL} về ${FUNNEL} v${before}.`).waitFor();
    expect(await liveVersion(before)).toBe(before);

    // Audit: the person did it.
    await page.getByRole('link', { name: 'Audit' }).click();
    const first = page.getByTestId('audit').first();
    await first.waitFor();
    expect(await first.locator('td').nth(1).textContent()).toBe(ADMIN_USER);
    expect(await first.locator('td').nth(2).textContent()).toBe('route.rollback');

    // A viewer's session reads but cannot write, even with its CSRF token.
    const db = new pg.Client({ ...PG, database: 'ikf_admin_test' });
    await db.connect();
    try {
      const { rows } = await db.query(
        `INSERT INTO admin_users (email, role, created_by) VALUES ('viewer-e2e@ikameglobal.com', 'viewer', 'e2e')
         ON CONFLICT (email) DO UPDATE SET role = 'viewer', disabled_at = NULL RETURNING id`,
      );
      const s = await createSession(db, { userId: Number(rows[0].id) });
      const headers = { cookie: `${SESSION_COOKIE}=${s.token}`, 'x-ikf-csrf': s.csrf, 'content-type': 'application/json' };
      const core = `http://localhost:${PORTS.core}`;
      expect((await fetch(`${core}/v1/funnels`, { headers })).status).toBe(200);
      const write = await fetch(`${core}/v1/routes/${ADMIN_DEMO_HOST}/rollback`, { method: 'POST', headers, body: JSON.stringify({ prefix: `/${FUNNEL}` }) });
      expect(write.status).toBe(403);
    } finally {
      await db.end();
    }
  });
});
```

```bash
npx vitest run --config demo/vitest.config.mjs demo/test/admin-e2e.test.mjs 2>&1 | grep -E "×|Error|Tests  "
```

Expected: `Tests  1 failed (1)` với `page.goto: net::ERR_NAME_NOT_RESOLVED at http://undefined:8837/ewa-books` (stack chưa có `ADMIN_DEMO_HOST`, SPA).

- [ ] **Step 4: Implement stack + run.mjs + README**

```bash
git apply <<'PATCH'
diff --git a/demo/README.md b/demo/README.md
index 63c5cdf..9d6e14c 100644
--- a/demo/README.md
+++ b/demo/README.md
@@ -42,6 +42,7 @@ Open a URL, click through a few screens, then `npm run demo:events` shows `page_
 | `--no-lan` | LAN on | only `localhost`; images from 127.0.0.1 |
 | `--reset` | | wipe Postgres + ClickHouse volumes before starting |
 | `--verbose` | | Miniflare + core-api logs |
+| `--admin-user <email>` | `demo@ikameglobal.com` | the admin console's local admin (signs in without Google) |
 
 Pass options after `--`: `npm run demo -- --country DE --funnels ewa-books`.
 
@@ -52,6 +53,7 @@ Pass options after `--`: `npm run demo -- --country DE --funnels ewa-books`.
 | 8787 (all interfaces) | Miniflare: `edge-router` (routes, `__IKF`, `/_ikf/sdk.<hash>.js`, `POST /_ikf/c`) → Queue → `event-consumer` → ClickHouse |
 | 8080 (127.0.0.1) | core-api (`buildApp`): publish, routes, pixel. Admin token `ikf_demo_admin`: `IKF_API=http://127.0.0.1:8080 IKF_TOKEN=ikf_demo_admin npx ikf route ls <LAN IP>` |
 | 8790 (all interfaces) | media: each funnel's `img/` at `/<slug>/img/…`; funnel HTML is rewritten to point there |
+| 8792 (127.0.0.1) | admin console (`apps/admin`, built on each start with `VITE_API_BASE=http://localhost:8080`) |
 | 54329 / 18123 (127.0.0.1) | Postgres 17 (`ikf`/`ikf`) / ClickHouse HTTP (`ikf`/`ikf`, database `ikf`) |
 
 `npm run demo:test` uses its own databases in the same containers (Postgres `ikf_demo_test`, ClickHouse `ikf_test`), so it never writes into the demo's data. ClickHouse gets every `clickhouse/*.sql` in order on each start.
@@ -64,6 +66,19 @@ With `--pixel`, the browser loads the real `fbevents.js` and sends to Meta when
 The API rejects `localhost` as a host (no dot), so the demo registers hosts and routes through core's
 publisher functions; `ikf route ls` works for the LAN IP.
 
+## Admin console
+
+Open `http://localhost:8792`, click **Đăng nhập bằng Google**: in the demo core signs you in as the
+`--admin-user` (role admin) without Google (`ADMIN_LOCAL_USER`, `APP_ENV=local` only; a deployed core refuses
+to start with it). Use `localhost` in the address bar, not `127.0.0.1`: the session cookie belongs to
+`localhost` (core-api's host), and the SPA and core-api must be the same site for the browser to send it.
+
+The demo also routes every funnel on `demo.localhost` (`http://demo.localhost:8787/<slug>`): publish there
+from the console (the API refuses `localhost`, which has no dot). Upload a `demo.html` whose images are absolute
+URLs (the media server: `http://<LAN IP or 127.0.0.1>:8790/<slug>/img/…`), or lint answers `relative_media`.
+`npm run demo:test` includes a Chromium run of upload → preview → publish → rollback (`test/admin-e2e.test.mjs`,
+ports 8837/8138/8839/8842, databases `ikf_admin_test`).
+
 ## Full purchase flow (`npm run demo:purchase`)
 
 Buy on a real funnel from your phone, open the "app", see **PRO**; refund from the control panel, see **FREE**.
diff --git a/demo/lib/stack.mjs b/demo/lib/stack.mjs
index 7a4390b..b1588ae 100644
--- a/demo/lib/stack.mjs
+++ b/demo/lib/stack.mjs
@@ -8,6 +8,7 @@ import { buildApp } from '../../services/core-api/src/app.js';
 import { ensureToken } from '../../services/core-api/src/auth.js';
 import { migrate } from '../../services/core-api/src/db/migrate.js';
 import { miniflareKv, miniflareStore } from './adapters.mjs';
+import { ADMIN_BUILD_DIR, buildAdmin, startAdminServer } from './admin.mjs';
 import { checkPortsFree, composeUp, DemoError, ensureDocker } from './docker.mjs';
 import { DEFAULT_FUNNELS, DEFAULT_FUNNELS_DIR, findFunnels, pickFunnels, publishFunnels } from './funnels.mjs';
 import { startMediaServer } from './media.mjs';
@@ -18,7 +19,10 @@ import { jsonLog, purchaseDeps, startPurchaseWorkers } from './purchase.mjs';
 import { coreRequest, seedPurchase } from './seed.mjs';
 
 export const DEMO_TOKEN = 'ikf_demo_admin';
-export const PORTS = { edge: 8787, core: 8080, media: 8790, proxy: 8788, demo: 8791 };
+export const PORTS = { edge: 8787, core: 8080, media: 8790, proxy: 8788, demo: 8791, admin: 8792 };
+// With the admin console: a funnel host it can publish to (core's API needs a dotted host; browsers send
+// *.localhost to this machine).
+export const ADMIN_DEMO_HOST = 'demo.localhost';
 export const PG = { host: '127.0.0.1', port: 54329, database: 'ikf', user: 'ikf', password: 'ikf' };
 export const CH = { url: 'http://127.0.0.1:18123', user: 'ikf', password: 'ikf', database: 'ikf' };
 const DDL_DIR = new URL('../../clickhouse/', import.meta.url);
@@ -92,6 +96,9 @@ export async function startStack({
   purchase = null,
   // Writable for core-api's and the workers' logs (JSON lines); default: workers' warnings/errors to stderr.
   logStream = null,
+  // Email of the admin console's local admin (signs in without Google): serves the SPA on ports.admin.
+  adminUser = null,
+  adminBuildDir = ADMIN_BUILD_DIR,
 } = {}) {
   ident(pgDatabase, 'Postgres database');
   ident(chDatabase, 'ClickHouse database');
@@ -99,6 +106,7 @@ export async function startStack({
   await checkPortsFree({
     [ports.edge]: 'edge-router (Miniflare)', [ports.core]: 'core-api', [ports.media]: 'media server',
     ...(purchase && { [ports.proxy]: 'demo proxy', [ports.demo]: 'demo server' }),
+    ...(adminUser && { [ports.admin]: 'admin console' }),
   });
   await ensureDocker();
   await composeUp();
@@ -147,21 +155,32 @@ export async function startStack({
     const store = miniflareStore(edge.bundles);
     const kv = miniflareKv(edge.routes);
 
+    // The SPA and core-api are both on localhost (one site): the session cookie rides on the SPA's fetches.
+    const adminOrigin = `http://localhost:${ports.admin}`;
+    const admin = adminUser ? { admin: { appEnv: 'local', origin: adminOrigin, localUser: adminUser } } : {};
     const app = buildApp({
       logger: logStream ? { level: 'info', stream: logStream } : verbose,
       checks: { db: () => pool.query('select 1') },
-      deps: { pool, store, kv, mediaOrigins: [mediaBase], previewBaseUrl: `http://preview.localhost:${ports.edge}`, ...shop?.deps },
+      deps: { pool, store, kv, mediaOrigins: [mediaBase], previewBaseUrl: `http://preview.localhost:${ports.edge}`, ...shop?.deps, ...admin },
     });
     await app.listen({ host: '127.0.0.1', port: ports.core });
     stops.push(() => app.close());
     const coreUrl = `http://127.0.0.1:${app.server.address().port}`;
     if (shop) stops.push(startPurchaseWorkers({ pool, deps: shop.deps, log }));
 
-    const hosts = ['localhost', ...(ip ? [ip] : [])];
+    const hosts = ['localhost', ...(ip ? [ip] : []), ...(adminUser ? [ADMIN_DEMO_HOST] : [])];
     const published = await publishFunnels({
       coreUrl, token: DEMO_TOKEN, pool, store, kv, funnels: chosen, hosts: [...hosts, ...(purchaseHost ? [purchaseHost] : [])], mediaBase, pixel,
     });
 
+    let adminUrl = null;
+    if (adminUser) {
+      await buildAdmin({ apiBase: `http://localhost:${ports.core}`, outDir: adminBuildDir });
+      const adminServer = await startAdminServer({ dir: adminBuildDir, port: ports.admin });
+      stops.push(() => adminServer.close());
+      adminUrl = adminOrigin;
+    }
+
     let purchaseInfo = null;
     if (shop) {
       const funnel = chosen[0].slug;
@@ -187,6 +206,8 @@ export async function startStack({
       coreUrl,
       mediaBase,
       adminToken: DEMO_TOKEN,
+      adminUrl,
+      adminUser,
       pgDatabase,
       chDatabase,
       clickhouse: chRun,
diff --git a/demo/run.mjs b/demo/run.mjs
index ffc0ae9..69eb1be 100644
--- a/demo/run.mjs
+++ b/demo/run.mjs
@@ -1,5 +1,5 @@
 #!/usr/bin/env node
-// npm run demo [-- --funnels a,b,c --country DE --pixel <id> --no-lan --reset --verbose]
+// npm run demo [-- --funnels a,b,c --country DE --pixel <id> --no-lan --reset --verbose --admin-user <email>]
 // npm run demo:purchase [-- --funnel <slug> --reset --verbose]   (= --purchase --tunnel)
 // npm run demo:down [-- --reset]
 import { composeDown, DemoError, ensureDocker } from './lib/docker.mjs';
@@ -39,6 +39,7 @@ async function main() {
       lan: !opts['no-lan'],
       pixel: opts.pixel ?? null,
       verbose: opts.verbose,
+      adminUser: opts['admin-user'],
     });
   } catch (err) {
     await tunnel?.stop();
@@ -51,6 +52,7 @@ async function main() {
   console.log('');
   if (opts.pixel) console.log(`  WARNING: Pixel ${opts.pixel} is live: browsers load Meta's real fbevents.js and send real events to Meta when online. Use a test Pixel.\n`);
   if (stack.lanIp && !stack.purchase) console.log(`  Phone (same wifi): open the http://${stack.lanIp}:8787/... links above`);
+  console.log(`  Admin:    ${stack.adminUrl}   (đăng nhập ${stack.adminUser}, không qua Google)`);
   console.log('  Events:   npm run demo:events');
   console.log(`  core-api: ${stack.coreUrl}  token ${stack.adminToken}`);
   if (stack.lanIp) console.log(`            IKF_API=${stack.coreUrl} IKF_TOKEN=${stack.adminToken} npx ikf route ls ${stack.lanIp}`);
PATCH
```

- [ ] **Step 5: Chạy e2e + toàn bộ demo test, xác nhận PASS**

```bash
npx vitest run --config demo/vitest.config.mjs demo/test/admin-e2e.test.mjs 2>&1 | grep -E "Tests  |Duration"
npm run demo:test 2>&1 | grep -E "Test Files|Tests  "
```

Expected: e2e `Tests  1 passed (1)` (~6 s sau khi image đã có); toàn bộ `Test Files  19 passed (19)`, `Tests  109 passed (109)`. Không chạy `npm run demo` cùng lúc (cổng cố định).

- [ ] **Step 6: Chạy tay (tuỳ chọn, ghi kết quả vào báo cáo task)**

```bash
npm run demo     # in thêm dòng "Admin:    http://localhost:8792   (đăng nhập demo@ikameglobal.com, không qua Google)"
```

Mở `http://localhost:8792` (không dùng `127.0.0.1`), Đăng nhập → Funnels → `ewa-books` → Publish lên `demo.localhost` → mở `http://demo.localhost:8787/ewa-books`. Ctrl-C dừng.

- [ ] **Step 7: Commit**

```bash
git add demo package.json package-lock.json
git commit -m "feat(demo): admin console on :8792 (--admin-user, no Google), demo.localhost host, Playwright e2e upload → preview → publish → rollback"
```

---

### Task 15: Hạ tầng (DNS + Worker `admin.<zone>`, secret, env), deploy-config, workflow `admin.yml`, runbook, `CLAUDE.md`

**Files:**
- Modify: `infra/modules/edge/{main,variables,outputs}.tf`, `infra/modules/edge/tests/edge.tftest.hcl`
- Modify: `infra/modules/core-service/variables.tf`, `infra/modules/core-service/tests/core_service.tftest.hcl`
- Modify: `infra/stack/{main,variables,outputs}.tf`, `infra/stack/tests/stack.tftest.hcl`, `infra/envs/{staging,prod}/main.tf`
- Create: `apps/admin/{wrangler.json, public/_headers}`, `apps/admin/scripts/{deploy-config.js, render-config.mjs}`; Test: `apps/admin/test/deploy-config.test.js`
- Create: `.github/workflows/admin.yml`, `docs/runbooks/admin-console.md`; Modify: `.github/workflows/infra.yml`, `CLAUDE.md`

**Interfaces:**
- Consumes: env/secret của Task 4 (`ADMIN_ORIGIN`, `API_ORIGIN`, `GOOGLE_OAUTH_CLIENT_ID`, `google-oauth-client-secret`); `ikf admin add` (Task 9); build SPA (`VITE_API_BASE`, Task 10).
- Produces: module edge biến `admin_worker_script_name` (bắt buộc), resource `cloudflare_dns_record.admin`, `cloudflare_workers_route.admin`, output `admin_fqdn`; module core-service validation `ADMIN_LOCAL_USER`; stack biến `google_oauth_client_id` (mặc định `""`), local `admin_script_name = "ikf-admin-<env>"`, outputs `admin_fqdn`, `admin_script_name`; `deployConfig(base, env)` (`apps/admin/scripts/deploy-config.js`) → `{name: 'ikf-admin-<env>', compatibility_date, assets: {directory: './dist', not_found_handling: 'single-page-application'}, workers_dev: false}`. GitHub vars mới: `TF_VAR_google_oauth_client_id`, `API_ORIGIN`, `ADMIN_HOST`, `ADMIN_ROUTED`.

- [ ] **Step 1: Terraform — test fail**

```bash
git apply <<'PATCH'
diff --git a/infra/modules/core-service/tests/core_service.tftest.hcl b/infra/modules/core-service/tests/core_service.tftest.hcl
index c800f21..ce179fc 100644
--- a/infra/modules/core-service/tests/core_service.tftest.hcl
+++ b/infra/modules/core-service/tests/core_service.tftest.hcl
@@ -113,3 +113,13 @@ run "rejects_open_ingress" {
 
   expect_failures = [var.cloudflare_cidrs]
 }
+
+run "rejects_the_local_admin_sign_in" {
+  command = plan
+
+  variables {
+    environment = { APP_ENV = "staging", ADMIN_LOCAL_USER = "dev@ikameglobal.com" }
+  }
+
+  expect_failures = [var.environment]
+}
diff --git a/infra/modules/edge/tests/edge.tftest.hcl b/infra/modules/edge/tests/edge.tftest.hcl
index a60a35c..c2ef028 100644
--- a/infra/modules/edge/tests/edge.tftest.hcl
+++ b/infra/modules/edge/tests/edge.tftest.hcl
@@ -7,6 +7,27 @@ variables {
   zone_name          = "ikf-staging.example"
   alb_dns_name       = "ikf-staging-api-123.us-east-1.elb.amazonaws.com"
   origin_auth_secret = "test-origin-secret"
+  # Admin console (spec admin-console-p1 §6).
+  admin_worker_script_name = "ikf-admin-staging"
+}
+
+run "admin_host_is_served_by_the_admin_worker" {
+  command = apply
+
+  assert {
+    condition     = cloudflare_dns_record.admin.name == "admin.ikf-staging.example" && cloudflare_dns_record.admin.proxied && cloudflare_dns_record.admin.type == "AAAA"
+    error_message = "admin.<zone> must be a proxied record (the Worker route answers it)."
+  }
+
+  assert {
+    condition     = cloudflare_workers_route.admin.pattern == "admin.ikf-staging.example/*" && cloudflare_workers_route.admin.script == "ikf-admin-staging"
+    error_message = "admin.<zone>/* must route to the ikf-admin-<env> Worker."
+  }
+
+  assert {
+    condition     = output.admin_fqdn == "admin.ikf-staging.example"
+    error_message = "Admin hostname must be admin.<zone>."
+  }
 }
 
 run "api_record_is_proxied_through_cloudflare" {
diff --git a/infra/stack/tests/stack.tftest.hcl b/infra/stack/tests/stack.tftest.hcl
index c1e2eba..a758e4e 100644
--- a/infra/stack/tests/stack.tftest.hcl
+++ b/infra/stack/tests/stack.tftest.hcl
@@ -271,3 +271,35 @@ run "identity_wiring" {
     error_message = "core-api sends claim and OTP emails through SES from no-reply@mail.<zone>."
   }
 }
+
+run "admin_console_wiring" {
+  command = apply
+
+  variables {
+    google_oauth_client_id = "123-abc.apps.googleusercontent.com"
+  }
+
+  assert {
+    condition     = contains(keys(module.security.secret_arns), "google-oauth-client-secret")
+    error_message = "core-api needs the google-oauth-client-secret secret (created empty, value set by hand)."
+  }
+
+  assert {
+    condition = (
+      local.core_environment["ADMIN_ORIGIN"] == "https://admin.ikf.example" &&
+      local.core_environment["API_ORIGIN"] == "https://api.ikf.example" &&
+      local.core_environment["GOOGLE_OAUTH_CLIENT_ID"] == "123-abc.apps.googleusercontent.com"
+    )
+    error_message = "core-api gets the admin origin (CORS), its own origin (Google redirect URI) and the OAuth client id."
+  }
+
+  assert {
+    condition     = !contains(keys(local.core_environment), "ADMIN_LOCAL_USER")
+    error_message = "ADMIN_LOCAL_USER (local demo sign-in) never reaches a deployed core-api."
+  }
+
+  assert {
+    condition     = output.admin_fqdn == "admin.ikf.example" && output.admin_script_name == "ikf-admin-prod"
+    error_message = "The admin console is ikf-admin-<env> at admin.<zone>."
+  }
+}
PATCH
```

```bash
for d in infra/modules/edge infra/modules/core-service infra/stack; do (cd $d && terraform init -backend=false -input=false >/dev/null && terraform test -no-color 2>&1 | grep -E "\.\.\. fail|Error:" | head -3); done
```

Expected: edge `run "admin_host_is_served_by_the_admin_worker"... fail` (`Reference to undeclared resource`), core-service `run "rejects_the_local_admin_sign_in"... fail` (`Missing expected failure`), stack `run "admin_console_wiring"... fail` (`Test assertion failed` / `Invalid index`).

- [ ] **Step 2: Terraform — implement**

```bash
git apply <<'PATCH'
diff --git a/infra/envs/prod/main.tf b/infra/envs/prod/main.tf
index 8acf5de..e55973a 100644
--- a/infra/envs/prod/main.tf
+++ b/infra/envs/prod/main.tf
@@ -39,6 +39,12 @@ variable "zone_name" { type = string }
 variable "alarm_email" { type = string }
 variable "media_origins" { type = list(string) }
 
+# Admin console Google OAuth client id (not secret); empty keeps admin sign-in off.
+variable "google_oauth_client_id" {
+  type    = string
+  default = ""
+}
+
 variable "funnel_domains" {
   type = map(object({
     zone_id = string
@@ -79,9 +85,13 @@ module "stack" {
   alarm_email           = var.alarm_email
   media_origins         = var.media_origins
   funnel_domains        = var.funnel_domains
+
+  google_oauth_client_id = var.google_oauth_client_id
 }
 
 output "api_fqdn" { value = module.stack.api_fqdn }
+output "admin_fqdn" { value = module.stack.admin_fqdn }
+output "admin_script_name" { value = module.stack.admin_script_name }
 output "alb_dns_name" { value = module.stack.alb_dns_name }
 output "ecr_repository_url" { value = module.stack.ecr_repository_url }
 output "ecs_cluster" { value = module.stack.ecs_cluster }
diff --git a/infra/envs/staging/main.tf b/infra/envs/staging/main.tf
index 8acf5de..e55973a 100644
--- a/infra/envs/staging/main.tf
+++ b/infra/envs/staging/main.tf
@@ -39,6 +39,12 @@ variable "zone_name" { type = string }
 variable "alarm_email" { type = string }
 variable "media_origins" { type = list(string) }
 
+# Admin console Google OAuth client id (not secret); empty keeps admin sign-in off.
+variable "google_oauth_client_id" {
+  type    = string
+  default = ""
+}
+
 variable "funnel_domains" {
   type = map(object({
     zone_id = string
@@ -79,9 +85,13 @@ module "stack" {
   alarm_email           = var.alarm_email
   media_origins         = var.media_origins
   funnel_domains        = var.funnel_domains
+
+  google_oauth_client_id = var.google_oauth_client_id
 }
 
 output "api_fqdn" { value = module.stack.api_fqdn }
+output "admin_fqdn" { value = module.stack.admin_fqdn }
+output "admin_script_name" { value = module.stack.admin_script_name }
 output "alb_dns_name" { value = module.stack.alb_dns_name }
 output "ecr_repository_url" { value = module.stack.ecr_repository_url }
 output "ecs_cluster" { value = module.stack.ecs_cluster }
diff --git a/infra/modules/core-service/variables.tf b/infra/modules/core-service/variables.tf
index bcecef4..444be04 100644
--- a/infra/modules/core-service/variables.tf
+++ b/infra/modules/core-service/variables.tf
@@ -68,6 +68,12 @@ variable "extra_security_group_ids" {
 variable "environment" {
   type    = map(string)
   default = {}
+
+  # The local demo's sign-in without Google (spec admin-console-p1 §1); core also refuses to start with it.
+  validation {
+    condition     = !contains(keys(var.environment), "ADMIN_LOCAL_USER")
+    error_message = "ADMIN_LOCAL_USER is for the local demo only; never in a deployed core-api."
+  }
 }
 
 variable "secrets" {
diff --git a/infra/modules/edge/main.tf b/infra/modules/edge/main.tf
index c544704..4808e33 100644
--- a/infra/modules/edge/main.tf
+++ b/infra/modules/edge/main.tf
@@ -1,6 +1,7 @@
 locals {
-  api_fqdn = "api.${var.zone_name}"
-  paths    = join(" ", [for p in var.rate_limited_paths : "\"${p}\""])
+  api_fqdn   = "api.${var.zone_name}"
+  admin_fqdn = "admin.${var.zone_name}"
+  paths      = join(" ", [for p in var.rate_limited_paths : "\"${p}\""])
 }
 
 resource "cloudflare_zone_setting" "ssl" {
@@ -30,6 +31,23 @@ resource "cloudflare_dns_record" "api" {
   ttl     = 1
 }
 
+# Admin console SPA (Worker static assets, deployed by .github/workflows/admin.yml). 100:: is a discard
+# address: the Worker route answers every request.
+resource "cloudflare_dns_record" "admin" {
+  zone_id = var.zone_id
+  name    = local.admin_fqdn
+  type    = "AAAA"
+  content = "100::"
+  proxied = true
+  ttl     = 1
+}
+
+resource "cloudflare_workers_route" "admin" {
+  zone_id = var.zone_id
+  pattern = "${local.admin_fqdn}/*"
+  script  = var.admin_worker_script_name
+}
+
 resource "cloudflare_ruleset" "origin_auth" {
   zone_id = var.zone_id
   name    = "ikf origin auth header"
diff --git a/infra/modules/edge/outputs.tf b/infra/modules/edge/outputs.tf
index cfa0036..a4997ae 100644
--- a/infra/modules/edge/outputs.tf
+++ b/infra/modules/edge/outputs.tf
@@ -2,6 +2,10 @@ output "api_fqdn" {
   value = local.api_fqdn
 }
 
+output "admin_fqdn" {
+  value = local.admin_fqdn
+}
+
 output "r2_bucket_name" {
   value = cloudflare_r2_bucket.bundles.name
 }
diff --git a/infra/modules/edge/variables.tf b/infra/modules/edge/variables.tf
index d56ce81..4bf1b13 100644
--- a/infra/modules/edge/variables.tf
+++ b/infra/modules/edge/variables.tf
@@ -18,6 +18,11 @@ variable "alb_dns_name" {
   type = string
 }
 
+variable "admin_worker_script_name" {
+  description = "The admin console Worker (static assets), e.g. ikf-admin-staging."
+  type        = string
+}
+
 variable "origin_auth_secret" {
   type      = string
   sensitive = true
diff --git a/infra/stack/main.tf b/infra/stack/main.tf
index 1ce9f8d..84acf2c 100644
--- a/infra/stack/main.tf
+++ b/infra/stack/main.tf
@@ -1,9 +1,11 @@
 locals {
   api_fqdn           = "api.${var.zone_name}"
   worker_script_name = "ikf-edge-router-${var.env}"
+  admin_script_name  = "ikf-admin-${var.env}"
   secret_names = [
     "paddle-api-key", "paddle-webhook-secret", "paddle-client-token", "meta-capi-token", "adjust-s2s-token", "clickhouse-url",
     "cf-kv-api-token", "r2-access-key-id", "r2-secret-access-key", "bootstrap-admin-token", "claim-token-key",
+    "google-oauth-client-secret",
   ]
   # Staging never charges real cards; prod never takes sandbox payments.
   paddle_env = var.env == "prod" ? "live" : "sandbox"
@@ -168,6 +170,10 @@ locals {
     PREVIEW_BASE_URL  = "https://${module.funnel_domains.preview_host}"
     PADDLE_ENV        = local.paddle_env
     ALARM_TOPIC_ARN   = module.observability.alarm_topic_arn
+    # Admin console (spec admin-console-p1 §6): CORS origin, Google redirect URI base, OAuth client id.
+    ADMIN_ORIGIN           = "https://${module.edge.admin_fqdn}"
+    API_ORIGIN             = "https://${local.api_fqdn}"
+    GOOGLE_OAUTH_CLIENT_ID = var.google_oauth_client_id
   }
 }
 
@@ -204,6 +210,8 @@ module "edge" {
   zone_name          = var.zone_name
   alb_dns_name       = module.core.alb_dns_name
   origin_auth_secret = random_password.origin_auth.result
+  # Admin console SPA (deployed by admin.yml).
+  admin_worker_script_name = local.admin_script_name
   # Checkout runs Turnstile on funnel hosts, not only on the platform zone.
   turnstile_extra_domains = keys(var.funnel_domains)
   # Cloudflare Free (staging) allows one rule and a 10s period only.
diff --git a/infra/stack/outputs.tf b/infra/stack/outputs.tf
index 5a2edec..c6a600a 100644
--- a/infra/stack/outputs.tf
+++ b/infra/stack/outputs.tf
@@ -2,6 +2,14 @@ output "api_fqdn" {
   value = module.edge.api_fqdn
 }
 
+output "admin_fqdn" {
+  value = module.edge.admin_fqdn
+}
+
+output "admin_script_name" {
+  value = local.admin_script_name
+}
+
 output "alb_dns_name" {
   value = module.core.alb_dns_name
 }
diff --git a/infra/stack/variables.tf b/infra/stack/variables.tf
index 5c0e5c6..acca68b 100644
--- a/infra/stack/variables.tf
+++ b/infra/stack/variables.tf
@@ -91,3 +91,9 @@ variable "funnel_domains" {
   }))
   default = {}
 }
+
+variable "google_oauth_client_id" {
+  description = "Google OAuth client id of the admin console (not secret). Empty: admin sign-in stays off."
+  type        = string
+  default     = ""
+}
PATCH
```

```bash
terraform fmt -check -recursive infra
for d in infra/modules/edge infra/modules/core-service infra/stack; do (cd $d && terraform test -no-color | tail -1); done
for e in staging prod; do (cd infra/envs/$e && terraform init -backend=false -input=false >/dev/null && terraform validate -no-color | tail -1); done
```

Expected: fmt không in gì; edge `Success! 11 passed, 0 failed.`, core-service `Success! 6 passed, 0 failed.`, stack `Success! 12 passed, 0 failed.`; hai env `Success! The configuration is valid.`

- [ ] **Step 3: Deploy config SPA — test fail**

`apps/admin/test/deploy-config.test.js` (mới):

```js
// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { deployConfig } from '../scripts/deploy-config.js';

const base = JSON.parse(readFileSync(new URL('../wrangler.json', import.meta.url), 'utf8'));
const env = { WORKER_ENV: 'staging', VITE_API_BASE: 'https://api.ikf-staging.example' };

describe('admin console deploy config (spec admin-console-p1 §6)', () => {
  it('ikf-admin-<env>: static assets with the SPA fallback, no workers.dev', () => {
    expect(deployConfig(base, env)).toEqual({
      name: 'ikf-admin-staging',
      compatibility_date: base.compatibility_date,
      assets: { directory: './dist', not_found_handling: 'single-page-application' },
      workers_dev: false,
    });
    expect(deployConfig(base, { ...env, WORKER_ENV: 'prod', VITE_API_BASE: 'https://api.ikf.example' }).name).toBe('ikf-admin-prod');
  });

  it('refuses ADMIN_LOCAL_USER (the local demo sign-in) in the deploy environment or wrangler.json', () => {
    expect(() => deployConfig(base, { ...env, ADMIN_LOCAL_USER: 'dev@ikameglobal.com' })).toThrow(
      'ADMIN_LOCAL_USER is for the local demo only; unset it in the deploy environment',
    );
    expect(() => deployConfig({ ...base, vars: { ADMIN_LOCAL_USER: 'x' } }, env)).toThrow(/ADMIN_LOCAL_USER/);
  });

  it.each([
    [{ WORKER_ENV: 'dev' }, 'WORKER_ENV must be staging or prod'],
    [{ VITE_API_BASE: undefined }, 'VITE_API_BASE must be an https origin: '],
    [{ VITE_API_BASE: 'http://api.ikf.example' }, 'VITE_API_BASE must be an https origin: http://api.ikf.example'],
    [{ VITE_API_BASE: 'https://api.ikf.example/v1' }, 'VITE_API_BASE must be an https origin: https://api.ikf.example/v1'],
  ])('refuses %j', (extra, msg) => {
    expect(() => deployConfig(base, { ...env, ...extra })).toThrow(msg);
  });
});
```

`apps/admin/wrangler.json` (mới):

```json
{
  "name": "ikf-admin",
  "compatibility_date": "2026-09-01",
  "assets": { "directory": "./dist", "not_found_handling": "single-page-application" }
}
```

```bash
npm test -w @ikf/admin -- test/deploy-config.test.js 2>&1 | grep -E "FAIL|Tests  "
```

Expected: FAIL khi import (`scripts/deploy-config.js` chưa có), `Tests  no tests`.

- [ ] **Step 4: Deploy config SPA — implement**

`apps/admin/scripts/deploy-config.js` (mới):

```js
// The admin console Worker's deploy config for one environment, from wrangler.json and the deploy job's env
// (render-config.mjs prints it). Throws an Error that says what is wrong. ADMIN_LOCAL_USER (the local demo's
// sign-in without Google) never goes near a deployment, like edge-router's PADDLE_JS_URL.
const ENVS = ['staging', 'prod'];

export function deployConfig(base, env) {
  if (!ENVS.includes(env.WORKER_ENV)) throw new Error('WORKER_ENV must be staging or prod');
  if (env.ADMIN_LOCAL_USER || base.vars?.ADMIN_LOCAL_USER) {
    throw new Error('ADMIN_LOCAL_USER is for the local demo only; unset it in the deploy environment');
  }
  // The build bakes VITE_API_BASE in: it must be core-api's https origin.
  const apiBase = env.VITE_API_BASE ?? '';
  let url = null;
  try {
    url = new URL(apiBase);
  } catch {
    // reported below
  }
  if (!url || url.protocol !== 'https:' || url.origin !== apiBase.replace(/\/$/, '')) {
    throw new Error(`VITE_API_BASE must be an https origin: ${apiBase}`);
  }
  return { ...base, name: `ikf-admin-${env.WORKER_ENV}`, workers_dev: false };
}
```

`apps/admin/scripts/render-config.mjs` (mới):

```js
#!/usr/bin/env node
// Prints the deploy config for one environment: node scripts/render-config.mjs > wrangler.deploy.json
import { readFileSync } from 'node:fs';
import { deployConfig } from './deploy-config.js';

const base = JSON.parse(readFileSync(new URL('../wrangler.json', import.meta.url), 'utf8'));
try {
  console.log(JSON.stringify(deployConfig(base, process.env), null, 2));
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
```

`apps/admin/public/_headers` (mới; Vite chép vào `dist/`, Workers static assets áp dụng):

```text
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: same-origin
  X-Robots-Tag: noindex
```

```bash
npm test -w @ikf/admin 2>&1 | grep -E "Test Files|Tests  "
cd apps/admin
VITE_API_BASE=https://api.ikf-staging.example npx vite build >/dev/null
WORKER_ENV=staging VITE_API_BASE=https://api.ikf-staging.example node scripts/render-config.mjs > wrangler.deploy.json
npx wrangler deploy --dry-run -c wrangler.deploy.json 2>&1 | tail -3
ADMIN_LOCAL_USER=x WORKER_ENV=staging VITE_API_BASE=https://api.ikf-staging.example node scripts/render-config.mjs; echo "exit $?"
rm -rf dist wrangler.deploy.json .wrangler
cd ../..
```

Expected: admin `Test Files  7 passed (7)`, `Tests  41 passed (41)`; dry-run `✨ Read 5 files from the assets directory …`, `No bindings found.`, `--dry-run: exiting now.`; lệnh cuối in `ADMIN_LOCAL_USER is for the local demo only; unset it in the deploy environment` và `exit 1`.

- [ ] **Step 5: Workflow**

`.github/workflows/admin.yml` (mới):

```yaml
name: admin

on:
  pull_request:
    paths: ["apps/admin/**", "packages/funnel-lint/**", "packages/route-match/**", "package-lock.json", ".github/workflows/admin.yml"]
  push:
    branches: [main]
    paths: ["apps/admin/**", "packages/funnel-lint/**", "packages/route-match/**", "package-lock.json", ".github/workflows/admin.yml"]

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test -w @ikf/funnel-lint -w @ikf/admin
      - name: Build
        run: npm run build -w @ikf/admin
        env:
          VITE_API_BASE: https://api.example.invalid

  deploy:
    if: github.event_name == 'push'
    needs: test
    runs-on: ubuntu-latest
    strategy:
      max-parallel: 1
      matrix:
        env: [staging, prod]
    environment: ${{ matrix.env }}
    # Same group as core-api and infra: never deploys while either of them is rolling out in this env.
    concurrency:
      group: ikf-deploy-${{ matrix.env }}
      cancel-in-progress: false
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - name: Render wrangler config
        working-directory: apps/admin
        env:
          WORKER_ENV: ${{ matrix.env }}
          VITE_API_BASE: ${{ vars.API_ORIGIN }}
        run: node scripts/render-config.mjs > wrangler.deploy.json
      - name: Require core-api with admin sign-in
        # The SPA is useless before core-api serves /v1/auth/* (secrets set, new image deployed): 401 = ready.
        env:
          API_ORIGIN: ${{ vars.API_ORIGIN }}
        run: |
          code=$(curl -sS -o /dev/null -w '%{http_code}' "$API_ORIGIN/v1/auth/me")
          if [ "$code" != 401 ]; then
            echo "::error::$API_ORIGIN/v1/auth/me answered $code, not 401: deploy core-api and set the admin secrets first (docs/runbooks/admin-console.md)"
            exit 1
          fi
      - name: Build
        run: npm run build -w @ikf/admin
        env:
          VITE_API_BASE: ${{ vars.API_ORIGIN }}
      - name: Deploy
        working-directory: apps/admin
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_WORKERS_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ vars.CLOUDFLARE_ACCOUNT_ID }}
        run: npx wrangler deploy -c wrangler.deploy.json
      - name: Smoke
        # The route admin.<zone>/* is created by Terraform after the first deploy; skip until ADMIN_ROUTED is set.
        if: vars.ADMIN_ROUTED == 'true'
        env:
          ADMIN_HOST: ${{ vars.ADMIN_HOST }}
        run: |
          body=$(curl -sS --fail "https://$ADMIN_HOST/funnels")
          echo "$body" | grep -q '<div id="root"></div>' || { echo "https://$ADMIN_HOST/funnels is not the admin SPA"; exit 1; }
          echo "admin console answers on $ADMIN_HOST"
```

`.github/workflows/infra.yml` (áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/.github/workflows/infra.yml b/.github/workflows/infra.yml
index 48911d8..643eeac 100644
--- a/.github/workflows/infra.yml
+++ b/.github/workflows/infra.yml
@@ -80,6 +80,8 @@ jobs:
       TF_VAR_alarm_email: ${{ vars.TF_VAR_alarm_email }}
       TF_VAR_media_origins: ${{ vars.TF_VAR_media_origins }}
       TF_VAR_funnel_domains: ${{ vars.TF_VAR_funnel_domains }}
+      # Admin console Google OAuth client id (not secret); unset = admin sign-in off.
+      TF_VAR_google_oauth_client_id: ${{ vars.TF_VAR_google_oauth_client_id }}
     defaults:
       run:
         working-directory: infra/envs/staging
@@ -132,6 +134,8 @@ jobs:
       TF_VAR_alarm_email: ${{ vars.TF_VAR_alarm_email }}
       TF_VAR_media_origins: ${{ vars.TF_VAR_media_origins }}
       TF_VAR_funnel_domains: ${{ vars.TF_VAR_funnel_domains }}
+      # Admin console Google OAuth client id (not secret); unset = admin sign-in off.
+      TF_VAR_google_oauth_client_id: ${{ vars.TF_VAR_google_oauth_client_id }}
     defaults:
       run:
         working-directory: infra/envs/${{ matrix.env }}
PATCH
```

```bash
docker run --rm -v "$PWD:/repo" -w /repo rhysd/actionlint:latest
```

Expected: không in gì, exit 0. (Trong một git worktree, `.git` là file trỏ ra ngoài thư mục mount: nếu actionlint báo `no project was found`, chép `.github` sang một thư mục tạm dưới `$HOME`, `git init`, chạy lại ở đó — colima chỉ mount `$HOME`.)

- [ ] **Step 6: Runbook + CLAUDE.md**

`docs/runbooks/admin-console.md` (mới):

````markdown
# Runbook: admin console (đợt 1: nền + publish)

Rollout per environment (staging first). The admin console is the SPA `apps/admin` on `https://admin.<zone>`
(Worker `ikf-admin-<env>`, static assets) calling `https://api.<zone>/v1/*` with a session cookie for
`api.<zone>`. Spec: `ifunnel/docs/specs/2026-10-11-admin-console-p1-design.md` (ikame repo). No secret value
goes into git, a shell history or a chat.

Sign-in is off until it is configured: core-api registers `/v1/auth/*` and answers CORS for `ADMIN_ORIGIN` only
when `ADMIN_ORIGIN`, `API_ORIGIN`, `GOOGLE_OAUTH_CLIENT_ID` and the secret `google-oauth-client-secret` are all
set (otherwise it logs `admin console disabled, missing: …`). Tokens (`ikf` CLI) keep working either way.

## 1. Google OAuth client (Google Cloud console, project of the ikameglobal.com Workspace)

1. APIs & Services → OAuth consent screen: **Internal** (only ikameglobal.com accounts), scopes `openid email profile`.
2. Credentials → Create credentials → OAuth client ID → **Web application**, one per environment:
   - Name `iFunnel admin <env>`
   - Authorized redirect URI: `https://api.<zone>/v1/auth/google/callback` (staging: the staging zone)
   - No JavaScript origins needed (the browser never calls Google's APIs itself).
3. Keep the client id; the client secret goes straight into Secrets Manager (step 3).

## 2. Terraform

Set the GitHub environment variable `TF_VAR_google_oauth_client_id` (not secret) for the env, then `terraform apply`
(workflow `infra`): empty secret `ikf/<env>/google-oauth-client-secret`; core env `ADMIN_ORIGIN=https://admin.<zone>`,
`API_ORIGIN=https://api.<zone>`, `GOOGLE_OAUTH_CLIENT_ID`; DNS `admin.<zone>` (proxied) and the Worker route
`admin.<zone>/*` → `ikf-admin-<env>`. The core-service module refuses `ADMIN_LOCAL_USER` in the task environment.

## 3. Secret value + core-api

```bash
aws secretsmanager put-secret-value --secret-id ikf/<env>/google-oauth-client-secret --secret-string '<client secret>'
```
Then force a new deployment of core-api (or push a core-api change). The log must not say `admin console disabled`,
and `curl -s -o /dev/null -w '%{http_code}\n' https://api.<zone>/v1/auth/me` must print `401`.

## 4. Deploy the SPA

GitHub environment variables for `admin.yml`: `API_ORIGIN=https://api.<zone>`, `ADMIN_HOST=admin.<zone>`,
`CLOUDFLARE_ACCOUNT_ID` (already set for edge-router); secret `CLOUDFLARE_WORKERS_TOKEN` (already set). Push to `main`
(or re-run the workflow): it checks that `/v1/auth/me` answers 401, builds with `VITE_API_BASE=$API_ORIGIN`, renders
`wrangler.deploy.json` (refuses `ADMIN_LOCAL_USER`) and deploys `ikf-admin-<env>`. The first time, the Worker exists
only after this deploy: if Terraform's route creation failed because the script did not exist yet, re-run
`terraform apply`, then set `ADMIN_ROUTED=true` so the smoke step runs.

## 5. First admin

The API needs an admin to add people; the first one comes from the CLI with an admin token (`bootstrap-admin-token`):
```bash
ikf login --api https://api.<zone> --token <admin token>
ikf admin add <your email>@ikameglobal.com --role admin --name "<Tên>"
ikf admin ls
```
More people: in the console, Settings → Users (admin), or `ikf admin add <email> --role editor|viewer`.

## 6. Check (staging, then prod)

1. Open `https://admin.<zone>`, **Đăng nhập bằng Google**, pick the company account → Funnels.
2. A non-company or unlisted account lands on Login with "Email chưa được cấp quyền".
3. Editor: New funnel or an existing one → upload `demo.html` (images on the S3 library) → lint result → Preview → QR
   opens on a phone.
4. Admin: Publish to a test host/prefix → the live URL serves it (`window.__IKF.v`) → Rollback → previous version.
5. Audit shows each step with the person's email.

## 7. "Không đăng nhập được"

| Symptom | Cause / fix |
|---|---|
| Login says "Email chưa được cấp quyền" | Not in `admin_users` or disabled (`ikf admin ls`); or not an ikameglobal.com account (`hd`). Log: `admin_login_denied {email_hash, reason}`; Audit: `auth.login_denied` |
| `?error=state` | The 10-minute sign-in attempt expired, or the browser blocked the `ikf_oauth` cookie (Path `/v1/auth/google`). Try again in the same tab |
| `?error=google` | Google refused the code exchange: wrong client secret, or the redirect URI is not exactly `https://api.<zone>/v1/auth/google/callback`. Log: `admin_login_failed {reason: exchange}` |
| `?error=invalid_token` | id_token rejected (clock skew, another client id in `GOOGLE_OAUTH_CLIENT_ID`). Log `admin_login_failed {reason}` |
| Signed in, but every call → Login again | The browser does not send `ikf_admin` to api.<zone>: third-party cookie blocking does not apply (same site), so check `ADMIN_ORIGIN` = the exact SPA origin and that the SPA was built with the right `VITE_API_BASE` |
| A write says `Lỗi 403 csrf` repeatedly | The SPA reloads `/v1/auth/me` and retries once; if it persists the session was replaced: sign out and in |
| `Lỗi máy chủ … request id <uuid>` | Search the core-api logs for that `reqId` |

## 8. Someone leaves

`ikf admin disable <email>` (or Settings → Users → Khoá): their sessions end at once (`admin_sessions` rows deleted).
Their past actions stay in Audit. Revoke any API token they held (`api_tokens.revoked_at`).

## 9. Domains

Domains stay Terraform's (publisher spec): add the host to `TF_VAR_funnel_domains`, `terraform apply`, then
`scripts/sync-domains.sh <env>`; the console lists it (Domains) and Publish offers it once `active`.
````

```bash
git apply <<'PATCH'
diff --git a/CLAUDE.md b/CLAUDE.md
index 97fc20d..d47e0fd 100644
--- a/CLAUDE.md
+++ b/CLAUDE.md
@@ -7,12 +7,14 @@ iKame Funnel Platform (iFunnel): replaces FunnelFox for web2app / web2web funnel
 | Path | What |
 |---|---|
 | `infra/` | Terraform: `bootstrap/`, `modules/*`, `stack/`, `envs/{staging,prod}` (AWS us-east-1 + Cloudflare) |
-| `services/core-api` | Fastify API on ECS: publisher, routes/domains, tokens, funnel pixel; migrations in `migrations/` |
+| `services/core-api` | Fastify API on ECS: publisher, routes/domains, tokens, funnel pixel, admin console auth (Google OIDC, sessions, CSRF) + audit log; migrations in `migrations/` |
+| `apps/admin` | Admin console SPA (Vite + React, JS) → Worker `ikf-admin-<env>` (static assets) at `admin.<zone>`; `scripts/deploy-config.js` |
 | `workers/edge-router` | Cloudflare Worker: host+prefix routing, `__IKF` + SDK injection, `/_ikf/sdk.<hash>.js`, collector `POST /_ikf/c` |
 | `workers/event-consumer` | Queue consumer → ClickHouse, split-on-400, rejected → DLQ, SNS alarms |
 | `packages/sdk` | `ikf.js` browser SDK (capture, queue, consent, Meta Pixel); `scripts/build.mjs` makes the Worker module |
 | `packages/event-schema` | Event validation + PII scrub, shared by SDK and collector |
 | `packages/route-match` | Path-prefix matching shared by core, Worker, CLI |
+| `packages/funnel-lint` | Static `demo.html` lint (no deps, runs in core, CLI and the SPA) |
 | `packages/cli` | `ikf` CLI |
 | `docs/runbooks/` | Rollout runbooks |
 
@@ -38,7 +40,8 @@ export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock
 | edge-router (builds the SDK in `pretest`) | `npm test -w @ikf/edge-router` |
 | event-consumer (real ClickHouse + Worker tests) | `npm test -w @ikf/event-consumer` |
 | sdk unit / e2e on real funnels | `npm test -w @ikf/sdk` / `npm run e2e -w @ikf/sdk` (skips without `IKF_FUNNELS_DIR`, default `/Users/daothinh/ikame/funnel/funnel-development`) |
-| cli, event-schema, route-match | `npm test -w @ikf/<name>` |
+| cli, event-schema, route-match, funnel-lint | `npm test -w @ikf/<name>` (funnel-lint also prints a report over `IKF_FUNNELS_DIR`) |
+| admin SPA (Vitest + Testing Library, happy-dom) | `npm test -w @ikf/admin`; build: `VITE_API_BASE=https://api.<zone> npm run build -w @ikf/admin` |
 
 Terraform (mock providers only locally — never `apply` from a dev machine):
 
@@ -60,6 +63,9 @@ Workflows: `docker run --rm -v "$PWD:/repo" -w /repo rhysd/actionlint:latest`.
 - The event consumer never acks a row it did not insert: rejected / unreadable messages are retried into the DLQ (`ikf events replay-dlq` recovers them).
 - core-api error handler: `HttpError` → `{error, detail}`; Fastify 4xx → `{error:'bad_request'}`; never leak internals on 500.
 - Secrets are created empty by Terraform; values are set by hand (`aws secretsmanager put-secret-value`, `wrangler secret put`). No secret values in code or state where avoidable.
+- Every change made through the API (token or person) writes `audit_log` in the change's own transaction where it has one (`src/audit.js`); actor = token name or a person's email. Logs carry a person's email only as `email_hash`.
+- Routes declare roles with `requireRole`: token roles `publisher`/`router`/`admin`, people `viewer` ⊂ `editor` ⊂ `admin` (editor satisfies `publisher`, admin everything). A cookie write needs `X-Ikf-Csrf`.
+- `ADMIN_LOCAL_USER` (sign-in without Google) is local-demo only: `loadConfig`, `buildApp`, the core-service Terraform module and `apps/admin/scripts/deploy-config.js` all refuse it.
 
 ## Process
 
@@ -67,4 +73,4 @@ Work follows spec → plan → TDD tasks (superpowers skills), one reviewed task
 
 ## Local demo
 
-`npm run demo` runs real funnels locally (Miniflare edge-router + event-consumer, core-api in-process, Postgres + ClickHouse in Docker, compose project `ikf-demo`). Scripts: `npm run demo`, `npm run demo:events`, `npm run demo:purchase` (full purchase flow on a phone: fake Paddle/Turnstile/SES, quick tunnel + QR), `npm run demo:down` (`-- --reset` wipes data), `npm run demo:test` (never two at once: fixed ports). Options, ports and troubleshooting: `demo/README.md`. Code in `demo/` only; it must not change `services/`, `workers/` or `packages/`, except the sanctioned `PADDLE_JS_URL` → `__IKF.paddle.js` hook (edge-router emits it only for `https://` values, the SDK loads only `https:`, and `workers/edge-router/scripts/deploy-config.js` refuses the variable so it never reaches a deployed Worker). Fakes are injected only through `buildApp({deps})` from `demo/lib/purchase.mjs`; nothing in `services/` or `workers/` reads a demo flag.
+`npm run demo` runs real funnels locally (Miniflare edge-router + event-consumer, core-api in-process, Postgres + ClickHouse in Docker, compose project `ikf-demo`), plus the admin console at `http://localhost:8792` (local admin from `--admin-user`, default `demo@ikameglobal.com`; publish to `demo.localhost`). Scripts: `npm run demo`, `npm run demo:events`, `npm run demo:purchase` (full purchase flow on a phone: fake Paddle/Turnstile/SES, quick tunnel + QR), `npm run demo:down` (`-- --reset` wipes data), `npm run demo:test` (never two at once: fixed ports). Options, ports and troubleshooting: `demo/README.md`. Code in `demo/` only; it must not change `services/`, `workers/` or `packages/`, except the sanctioned `PADDLE_JS_URL` → `__IKF.paddle.js` hook (edge-router emits it only for `https://` values, the SDK loads only `https:`, and `workers/edge-router/scripts/deploy-config.js` refuses the variable so it never reaches a deployed Worker). Fakes are injected only through `buildApp({deps})` from `demo/lib/purchase.mjs`; nothing in `services/` or `workers/` reads a demo flag.
PATCH
```

- [ ] **Step 7: Commit**

```bash
git add infra apps/admin .github docs CLAUDE.md
git commit -m "feat(infra): admin.<zone> Worker route + DNS, Google OAuth secret/env, ADMIN_LOCAL_USER refused; admin.yml; admin console runbook"
```

---

### Task 16: Chạy lại toàn nhánh

**Files:** — (chỉ kiểm tra)

- [ ] **Step 1: Toàn bộ workspace + demo + Terraform**

```bash
npm test -w @ikf/paddle -w @ikf/event-schema -w @ikf/funnel-lint -w @ikf/sdk -w @ikf/cli -w @ikf/edge-router -w @ikf/event-consumer -w @ikf/core-api -w @ikf/route-match -w @ikf/admin 2>&1 | grep -E "Test Files|Tests  |bytes gzip"
npm run demo:test 2>&1 | grep -E "Test Files|Tests  "
terraform fmt -check -recursive infra
for d in infra/modules/edge infra/modules/core-service infra/stack; do (cd $d && terraform test -no-color | tail -1); done
for e in staging prod; do (cd infra/envs/$e && terraform init -backend=false -input=false >/dev/null && terraform validate -no-color | tail -1); done
git status --short
```

Expected: paddle 31, event-schema 145, funnel-lint **30** (2 file), sdk 159, cli **129** (13 file), edge-router 106 (7 file, `ikf sdk d1a533c86611: 8154 bytes gzip`, không đổi), event-consumer 8 + 27, core-api **407** (43 file), route-match 35, admin **41** (7 file); demo **109** (19 file); fmt không in gì; edge `Success! 11 passed, 0 failed.`, core-service `Success! 6 passed, 0 failed.`, stack `Success! 12 passed, 0 failed.`; hai env `Success! The configuration is valid.`; `git status` sạch.

- [ ] **Step 2: Review toàn nhánh** (superpowers:requesting-code-review) trước PR vào `feat/demo-purchase` (PR #5) — hoặc theo thứ tự stack mà Tech Lead chọn.

---

## Theo sau (thủ công, ngoài phạm vi plan này)

1. **Google Cloud**: tạo OAuth client (Internal) cho staging và prod, redirect URI `https://api.<zone>/v1/auth/google/callback`; đặt `TF_VAR_google_oauth_client_id`, `terraform apply`, `aws secretsmanager put-secret-value … google-oauth-client-secret`, redeploy core-api; GitHub vars `API_ORIGIN`, `ADMIN_HOST`, rồi `ADMIN_ROUTED=true` sau lần deploy đầu (runbook §1–4). Plan chỉ kiểm được OIDC với JWKS/khoá test; luồng Google thật (consent màn hình, `hd`, cookie qua Cloudflare) chỉ kiểm được trên staging (runbook §6).
2. **Admin đầu tiên**: `ikf admin add <email> --role admin` bằng `bootstrap-admin-token` (runbook §5).
3. **Team nội dung**: 57/69 `demo.html` còn ảnh `img/…` tương đối, 10 funnel ChatChi còn `email={{email}}` trong link app, 11 không có `CONFIG.funnel` (báo cáo Task 6): sửa trước khi upload qua console (lint chặn). `witch-power` vẫn gửi `email` qua `URLSearchParams` trong `appHandoffUrl()` — lint tĩnh không thấy (A13), cần bỏ tay như đã ghi ở plan demo-purchase.
4. **Đợt 2** (spec §8): giá, app registry, khách, webhook, reconcile trên console; đợt 3 dashboard.

---

## Self-Review

**Spec coverage:**

| Spec | Task |
|---|---|
| Điều kiện xong: đăng nhập Google `ikameglobal.com`, email chưa cấp bị từ chối rõ | 4 (+A9), 10 (Login `not_allowed`) |
| Điều kiện xong: upload → lint → preview (QR) → admin publish → URL live có `__IKF` → rollback một bấm | 6, 7, 11, 12, 14 (e2e) |
| Điều kiện xong: mọi thao tác đổi dữ liệu (web lẫn CLI) có trong Audit | 2 (+A6), 3 (actor người), 5 (`funnel.create`), 8 (users), 4 (`auth.*`) |
| Điều kiện xong: e2e trên `npm run demo`; viewer không gọi được API ghi | 14 (e2e + viewer 403), 3 (bảng quyền) |
| Quyết định #1 phạm vi đợt 1 | 1–15 |
| Quyết định #2 Google OIDC + `hd`, role trong Postgres, admin đầu seed bằng CLI | 1, 4, 9 |
| Quyết định #3 upload `demo.html` | 7, 11 |
| Quyết định #4 SPA tĩnh Vite + React JS, Worker static assets `admin.<zone>` | 10–13, 15 (+A19, A20) |
| Quyết định #5 editor upload/preview/pixel/app/domain; chỉ admin publish/rollback/users; viewer đọc | 3 (+A4, A5), 8, 10–13 |
| Quyết định #6 cookie chỉ `api.<zone>`, `credentials: include`, CORS `admin.<zone>` | 3, 4, 10 |
| §1 đăng nhập (state, nonce, PKCE, JWKS cache 1 giờ, iss/aud/exp/nonce/email_verified/hd, phiên 12 giờ, redirect, not_allowed + log email_hash) | 4 (+A8, A9), 3 |
| §1 phiên (gia hạn, trần 7 ngày, logout, `/auth/me`, dọn mỗi giờ) | 3, 9 (+A21) |
| §1 CSRF | 3 (+A2), 10 |
| §1 xác thực chung + ánh xạ role | 3 (+A3, A4) |
| §1 CORS | 4 (+A11), 10 (expose request id) |
| §1 local `--admin-user`, từ chối khởi động ngoài local | 3, 14, 15 (+A11) |
| §2 migration 005 | 1 (+A1) |
| §2 hành động audit | 2, 3, 4, 5, 8 (+A6) |
| §3 API (funnels, domains, audit, users; versions lint; routes publish checks; apps viewer) | 5, 7, 8, 3 (+A5, A7, A15, A16, A17) |
| §3 preview URL + QR | 5 (`preview_url`), 11 (QR) |
| §4 `@ikf/funnel-lint` + CLI dùng trước upload + `versions.lint_report` | 6, 7 (+A12, A13, A14) |
| §5 màn hình 1–6, nút mờ theo role + lý do, lỗi 401/403 csrf/5xx/mạng | 10–13 (+A18) |
| §6 Terraform DNS/Worker/secret/env; CI `admin.yml`; deploy-config từ chối `ADMIN_LOCAL_USER`; runbook | 15 (+A10, A20) |
| §7 kiểm thử core / lint / SPA / e2e / Terraform | 1–9, 6, 10–13, 14, 15 |
| §8 ngoài phạm vi | không task (đúng) |

**Placeholder:** không có "TBD"/"tương tự Task N". Mọi khối code và patch được sinh từ cây đã chạy test (Node 26, colima): test fail đúng như "Expected" ở bước FAIL (chạy trên cây chưa implement), pass với số ghi ở mỗi task. Không chạy được ở đây: Google OAuth thật, deploy Worker thật (chỉ `wrangler deploy --dry-run`), Terraform apply (chỉ mock) — "Theo sau" 1.

**Nhất quán tên / kiểu:**
- `actorOf` / `audit(db, actor, action, target, details)` (Task 2) ← Task 3 (`auth.login` local), 4, 5 (`createFunnel`), 8 (`createUser`/`updateUser`); `req.actor.name` = cột `created_by`/`updated_by`/`actor`.
- `SESSION_COOKIE`, `createSession`, `touchSession`, `sessionCookie` (Task 3) ← Task 4 (`http/google.js`), 9 (sweep test), 14 (e2e viewer); `signIn` (test helper Task 3) ← Task 5, 7, 8, 9.
- `requireRole` grants: `viewer`/`editor`/`publisher`/`router`/`admin` (Task 3) = khai báo route Task 5 (`'viewer'`, `['editor','publisher']`), Task 8 (`'admin'`); `can()` SPA (Task 10) cùng thứ tự `viewer ⊂ editor ⊂ admin`.
- `deps.admin = {appEnv, origin, localUser?, apiOrigin?, google?}`: `adminDeps` (Task 4, prod) = demo `startStack` (Task 14, local); `adminCors(app, deps.admin.origin)` (Task 4, 10).
- `lint()`, `MAX_BYTES`, `configFunnel`, `byteLength`, `SCRIPT_ALLOWLIST` (Task 6) ← core `versions.js` + `validate.js` (Task 7), CLI `publish.js` (Task 7), SPA `UploadBox` (Task 11); `lint_failed.detail = {errors, warnings}` = CLI `formatFindings` = SPA `UploadBox` danh sách.
- `funnelDetail().live[].previous` (Task 12) ← `RollbackDialog`; `listDomains().routes[]` (Task 5) ← `PublishDialog` (dòng đang live) và màn Domains.
- Nhãn SPA dùng trong e2e (Task 14) = Task 10–12: `Đăng nhập bằng Google`, `Chọn demo.html`, `Đã tạo v<n>.`, `Preview`, `Publish`, `Host`, `Prefix`, `Xác nhận publish`, `Đã publish v<n>: https://<host><prefix> (…)`, `Rollback`, `Xác nhận rollback`, `Đã rollback …`, `data-testid` `who`/`version`/`preview`/`change`/`live`/`audit`.
- `PORTS.admin = 8792` (Task 14) = `server.port` Vite (Task 10) = CORS origin demo = README; `ADMIN_DEMO_HOST = 'demo.localhost'` (Task 14) = README; Worker `ikf-admin-<env>` = `deployConfig` (Task 15) = `local.admin_script_name` = route Terraform.

**Review Focus đã ghim:** 1 → Task 3, 8, 9; 2 → Task 3, 4, 10; 3 → Task 4; 4 → Task 3, 6, 7, 12, 14; 5 → Task 3, 4, 9, 15.

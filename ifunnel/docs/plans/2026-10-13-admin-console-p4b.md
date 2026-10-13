# iKame Funnel Platform — Admin Console đợt 4b (Quyền theo app) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Team của từng app vào console chỉ thấy và sửa được app của mình (role theo từng app: viewer/support/editor/admin), token `ikf_` có thể gắn một app, và mọi việc ảnh hưởng nhiều app (tạo app, Users, Billing, domain, token, audit toàn hệ thống, funnel chưa gán) chỉ global admin làm.

**Architecture:**
- **Postgres** migration `008_app_roles.sql`: `admin_users.global` (admin cũ → global), `admin_users.role` nullable = role mặc định, bảng `admin_user_apps (user_id, app_id, role)`, `api_tokens.app_id`.
- **core-api**: `src/admin/scope.js` `loadScope(db, actor)` tính phạm vi mỗi request; `requireGrant(pool, grant, {app})` với `app: 'global' | 'any' | resolver` — ngoài phạm vi GET → `404 not_found`, ghi → `403 forbidden`; resolver trong `src/admin/resolve.js` (app của funnel/host/grant/app). Mọi route có tài nguyên thuộc app chuyển sang `requireGrant`; danh sách lọc theo phạm vi. Users API có global, app × role, `409 last_global_admin`, `409 cannot_lock_self`; token có `app_id` (không role admin). Gộp mục hoãn từ 4a: khoá theo **một thứ tự** `domains (host tăng dần) → funnels` ở gán domain, đổi app của funnel, publish, lưu pixel.
- **CLI**: `admin add/ls/grant/revoke/global`, `token create --app`, thông điệp lỗi phạm vi.
- **SPA**: `me.global`, `me.apps`; switcher theo phạm vi, menu toàn cục chỉ global, `/` chuyển tới app đầu tiên, nút theo role trong app; Settings › Users với global, role mặc định, bảng app × role.
- **Demo**: `support@` chỉ có `support` ở starlyn; admin demo là global; e2e đợt 4b.

**Tech Stack:** Node.js 22 trên CI (local Node 26) · JavaScript ESM · npm workspaces · Fastify 5 · `pg` 8 · Vitest ~3.2 · happy-dom 20 · `@testcontainers/postgresql` + `@testcontainers/clickhouse` 11 · React 19 · react-router 7 · Vite 7 · `@testing-library/react` 16 · Playwright 1.63. Không dependency mới.

**Spec:** `ifunnel/docs/specs/2026-10-13-admin-console-p4b-design.md`. Bối cảnh: spec/plan đợt 4a (`…/specs/2026-10-12-admin-console-p4a-design.md`, `…/plans/2026-10-12-admin-console-p4a.md`), đợt 1–2 (role, grants, sessions, audit).

**Repo / nhánh / worktree:** repo `/Users/daothinh/ikf-platform`. Nhánh **`feat/admin-console-p4b`** cắt từ **`feat/admin-console-p4a`** — đã kiểm với tip **`2af9add`**. Worktree **`/Users/daothinh/ikf-platform-admin-p4b`** (controller đã tạo, `npm install` xong). PR vào base `feat/admin-console-p4a` (PR #10). **Không bao giờ** đụng working tree `/Users/daothinh/ikf-platform-*` khác; demo đang chạy từ `-admin-p3` trên 8080/8787/8790/8792 — không đụng.

**Môi trường chạy test (local):**
```bash
cd /Users/daothinh/ikf-platform-admin-p4b
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock
export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock
```
`npm run demo:test` chạy một mình. Bộ core-api đầy đủ ~8 phút; file chỉ fail vì timeout hook 120 s của Testcontainers → chạy lại riêng file đó.

Số test ở mỗi task là số **thật** khi chạy code của plan trên bản sao `2af9add` (Node 26, colima, 2026-10-13); mọi khối code/patch sinh từ commit của cây scratch đã chạy test đó (trùng từng byte). Mốc tại `2af9add`: paddle 34, event-schema 145, funnel-lint 35, sdk 159 (8154 B gzip), cli **207** (21 file), edge-router 106, event-consumer 8 + 27, core-api **616** (67 file), route-match 35, admin **211** (26 file); `demo:test` **132** (23 file).

## Điều chỉnh so với spec (phát hiện khi đọc code và chạy thử, 2026-10-13)

| # | Spec | Plan làm | Lý do |
|---|---|---|---|
| B1 | §2 `loadScope` → `{global, roleIn, apps()}` | `{global, roleIn, appIds(), grantsIn, globalGrants}` + `isGlobalGrant(scope, grant)`; `tokenGrants` export từ `src/auth.js`; global → `roleIn(bất kỳ id) = 'admin'` (handler vẫn 404 khi tài nguyên không có); token chỉ `roleIn = 'admin'` khi là admin token không app, còn lại dùng `grantsIn` | Kiểm quyền theo grant, không theo tên role |
| B2 | §1 `role` nullable | `authenticate()` dùng `USER_GRANTS[role] ?? []` ngay từ Task 1 (không thì `requireRole` cũ 500 với role NULL); `loadScope` không lọc user disabled (session đã từ chối) | An toàn ngay sau migration |
| B3 | §2 middleware | Resolver đọc `req.body` phải gắn ở `preHandler` (body chưa parse ở `onRequest`); `requireRole` giữ nguyên (không alias), người global nhận grants admin trong `authenticate()`; `isGlobalGrant` kiểm trước ở mọi mode (token không app giữ phạm vi cũ); `appOfGrant` trả `undefined` cho id không phải số | Fastify lifecycle; không đổi hành vi route chưa chuyển |
| B4 | §2 "GET ngoài phạm vi → 404 not_found (không lộ app tồn tại)" | **Ruling:** `requireGrant` nhận `notFound: '<code>'` (vd `funnel_not_found`, `app_not_found`) để body 404 khi ngoài phạm vi **trùng** body 404 của tài nguyên không tồn tại; mặc định `not_found` | Hai trường hợp không phân biệt được bằng body |
| B5 | §1 "không tự bỏ cờ global của chính mình (`409 self_lockout`)" | Dùng mã sẵn có từ đợt 1 **`409 cannot_lock_self`** (nay gồm cả `global:false` cho chính mình); `409 last_global_admin` chỉ kiểm khi thay đổi làm mất một global đang bật (khoá mọi dòng global theo id); thêm `400 duplicate_app`, `404 user_app_not_found {id, app_id}`; PUT/DELETE app role trả cả người; tạo người kèm app ghi một `admin.user.app_grant` mỗi app; `ensureLocalAdmin` (demo) đặt `global = true`; `POST /v1/tokens` kiểm role (400) trước app (404), audit `token.create` để app ở cột `app_id` | Giữ mã lỗi cũ; demo admin vẫn vào được Users |
| B6 | §2 "funnel chưa gán / `null` → chỉ global"; "`any` = có grant ở ít nhất một app" | **Ruling:** `scope.defaultGrants` — tài nguyên `null` (funnel chưa gán, domain dùng chung) và kiểm `any` cũng đạt bằng **role mặc định** (`admin_users.role`); người role `NULL` + dòng app và token theo app thì không (`?app=none` rỗng với họ) | Spec §1 "giữ quyền như cũ": 34 test cũ / 9 file sẽ vỡ nếu đọc chữ; funnel chưa gán là dữ liệu cũ |
| B7 | §2 "GET ngoài phạm vi → 404" | GET chỉ 404 khi người gọi **không** có `viewer` trong app; đã thấy app nhưng thiếu grant (viewer gọi `/plans`, giá, webhooks) → 403 như trước | Không lộ gì vì họ đã thấy app; giữ test `apps-read`, `roles-p2` |
| B8 | §2 middleware | `requireGrant` nhận danh sách grant (`PUT /v1/funnels/:slug` giữ `['router','editor']` cho token router); dùng lại `req.scope` từ hook trước (route đọc body: `any` ở onRequest, kiểm app ở preHandler); export `hasGrant(scope, grant, appId|null)`; cache key overview có danh sách app của người gọi; `GET /v1/apps/:id/webhooks` resolver theo chính `:id` (body 404 trùng `app_not_found`); id sai định dạng với người không global → 404/403 thay vì 400 | Không xác thực hai lần; không lộ tồn tại |
| B9 | §2 bảng route (Task 5) | Theo ruling B6, ba route "global" đọc là `hasGrant(…, null)` (global, token không app, hoặc người có role mặc định): tra khách không `app_id`, audit không `?app=`, sync host dùng chung; với người không global, app id không có trong DB nhận role mặc định thay vì `null` (để 404 `app_not_found` vẫn đến được handler); `requireRole` không còn route nào dùng (test của nó dùng route riêng) | Giữ quyền người cũ; 404 đúng cho app lạ |
| B10 | §5 thứ tự khoá | `setFunnelPixel` khoá `domains` (host tăng dần) trước rồi cập nhật funnel, đọc lại host sau khi khoá funnel để bump rev; `publishVersion` chỉ khoá domain khi gán app cho funnel chưa gán (upload thường không giữ khoá domain trong lúc ghi R2); test `lock-order.test.js` dùng barrier, không sleep: (a) gán domain vs đổi app, (b) publish vs đổi app — đúng một bên 409; (c) pixel vs publish — không 40P01 | Đã chạy: trước sửa (a)(b) cả hai cùng thành công, (c) 40P01 |
| B11 | §3 "menu toàn cục, Tất cả app, Dashboard `/` chỉ cho global" | **Ruling:** SPA dùng `canAll(me, need) = canIn(me, need, null)` (global **hoặc** có role mặc định) cho giao diện liên app — khớp `hasGrant(scope, need, null)` của server (B6/B9); người role `NULL` (chỉ có dòng app) đúng như spec: không menu toàn cục, `/` → app đầu tiên hoặc trang `no-apps`. Hành động thật sự toàn cục (Billing, Settings › Users sửa, Tạo app, reconcile, cấp lại user_id, gán domain) dùng `canGlobal` | Đọc chữ làm vỡ ≥58 test cũ / ~15 file và ẩn trang mà server vẫn trả dữ liệu; đổi lại chỉ cần sửa `canAll` → `canGlobal` |
| B12 | §3 trang lỗi | App ngoài phạm vi trong SPA hiện chung một trang "Không tìm thấy app" (cả khi tải danh sách bị 404 và khi `RequireGrant` trong app không có role), không nói cần grant gì; lỗi 404 từ một thao tác vẫn hiện inline | Không lộ app tồn tại; giữ test thao tác cũ |
| B13 | §3 Settings › Users "người không global xem chỉ đọc" | Mọi route `/v1/admin/users*` là global ở server → người không global thấy "Chỉ admin quản lý người dùng." (không gọi API); trang chi tiết `/settings/users/:id` tìm trong `listUsers()` (server không có GET một user); `createUser` chỉ gửi `global`/`apps` khi có | Không thêm route server ngoài spec |

## Global Constraints

- Code trong repo `ikf-platform`, nhánh `feat/admin-console-p4b` (từ `feat/admin-console-p4a@2af9add`), worktree `/Users/daothinh/ikf-platform-admin-p4b`, PR base `feat/admin-console-p4a`. JavaScript, không TypeScript. Không dependency mới; SPA một file CSS.
- **Log không email khách, không `user_id`, không `err.message`**, không SQL có tham số; audit không `user_id`, không secret, không email khách (email người vận hành là actor như cũ).
- Ngoài phạm vi: GET/HEAD → `404 {error: 'not_found'}`; ghi → `403 {error: 'forbidden'}`; route chỉ global → `403 forbidden`.
- `global = true` ⇒ role `admin` ở mọi app. Không global: role trong app = dòng `admin_user_apps` nếu có, không thì `admin_users.role` (có thể `NULL` = không vào). Bảng grants `USER_GRANTS` không đổi.
- Luôn còn ít nhất một global admin chưa disabled (`409 last_global_admin`); không tự bỏ global / tự khoá (`409 cannot_lock_self`, spec ghi `self_lockout` — ruling B5).
- Token: không app = như cũ (`admin` token = global); có app = chỉ app đó, không được role `admin` (`400 invalid_roles`).
- Funnel chưa gán, audit không `?app=`, tra khách không `app_id`, sync host dùng chung: global **hoặc role mặc định** (ruling B6/B9); gán domain, rotate user_id, Users, Billing, tạo app, token: chỉ global.
- Người không global tra khách phải có `app_id` (`400 app_required`).
- Thứ tự khoá: `domains` (host tăng dần) rồi `funnels` ở mọi đường ghi đụng cả hai.
- SPA: ngữ cảnh app chỉ từ URL; giao diện liên app cho global hoặc người có role mặc định (`canAll`, ruling B11); người role `NULL`: `/` → app đầu tiên; copy tiếng Việt.
- Demo: không sửa `services/` từ `demo/`; e2e cổng/DB riêng; không `terraform apply`. Bundle SDK không đổi (8154 B).
- Test cũ giữ nguyên ý nghĩa; chỉ sửa đúng chỗ từng task ghi.

## Review Focus

1. **Người dùng hiện có sau migration 008** (admin, editor, viewer, support): mong quyền y như trước — admin thành global, người khác vẫn thấy mọi app với role cũ. Test: Task 1 (008 backfill), Task 4–5 (role mặc định trên mọi app).
2. **Người chỉ có quyền ở app A gọi route của app B bằng id đoán được** (funnel slug, host, grant id, app id): mong `404` cho GET, `403` cho ghi, không lộ dữ liệu. Test: Task 4, 5 (bảng route).
3. **Tự khoá mình / mất global admin cuối cùng**: mong bị chặn rõ ràng. Test: Task 3.
4. **Token theo app cũ của CI/publish** (router/publisher không app): mong chạy y như trước. Test: Task 1 (scope token), Task 4 (router token không app vẫn publish).
5. **Hai admin cùng lúc gán domain và đổi app funnel / publish / lưu pixel**: không bao giờ funnel lạ sống trên domain của app, không deadlock. Test: Task 5 `lock-order.test.js`.

## File Structure (repo `ikf-platform`, phần mới/sửa)

```
ikf-platform/
├── CLAUDE.md                                            # SỬA: requireGrant + resolvers, 404/403, thứ tự khoá
├── docs/runbooks/admin-console.md                       # SỬA: "Quyền theo app", admin đầu tiên `--global`
├── services/core-api/
│   ├── migrations/008_app_roles.sql                     # MỚI: admin_users.global, role nullable, admin_user_apps, api_tokens.app_id
│   ├── src/admin/scope.js                               # MỚI: loadScope, isGlobalGrant
│   ├── src/admin/resolve.js                             # MỚI: appOfFunnel, appOfHost, appOfGrant, appOfApp
│   ├── src/auth.js                                      # SỬA: requireGrant, hasGrant, tokenGrants
│   ├── src/admin/{users,sessions}.js                    # SỬA: global, app × role, last_global_admin, cannot_lock_self
│   ├── src/http/{auth,users,tokens,apps,catalog,funnels,versions,prices,analytics,domains,routes,customers,billing}.js   # SỬA: requireGrant theo app, lọc danh sách
│   ├── src/{identity/apps,analytics/service}.js         # SỬA: lọc theo phạm vi, cache key
│   ├── src/publisher/{catalog,domains,funnels,publish,routes}.js   # SỬA: thứ tự khoá domains → funnels
│   └── test/{scope,require-grant,users-apps,tokens-app,scope-routes-a,scope-routes-b,lock-order}.test.js (mới);
│       test/{migrate,sessions,users}.test.js, test/helpers/{admin,db}.js (sửa)
├── packages/cli/src/{main,api}.js                       # SỬA: admin global/app, token --app, thông điệp lỗi phạm vi
│   └── test/{admin-apps,errors-scope,token}.test.js (mới); test/admin.test.js (sửa)
├── apps/admin/src/
│   ├── roles.js                                         # SỬA: canIn, canAll, canGlobal
│   ├── pages/UserDetail.jsx                             # MỚI: global, role mặc định, app × role
│   ├── {App,Layout,api,app-context}.jsx|js, styles.css  # SỬA: switcher theo phạm vi, menu toàn cục, chuyển hướng `/`
│   ├── components/{RequireGrant,RoleButton,ErrorNote,UploadBox,PricesTab,FunnelSettings}.jsx   # SỬA
│   ├── pages/{Users,Apps,AppOverview,AppPlans,AppSettings,AppWebhooks,Audit,Billing,Customers,CustomerDetail,Domains,FunnelDetail,Funnels}.jsx   # SỬA
│   └── ../test/{scope-ui,users-apps}.test.jsx (mới); test/{api,app-settings,app-webhooks,grants}.test.*, helpers.jsx (sửa)
└── demo/
    ├── lib/admin.mjs, README.md                         # SỬA: support chỉ starlyn (role NULL), admin demo global
    └── test/admin-p4b-e2e.test.mjs (mới); test/admin-p2-e2e.test.mjs (sửa)
```

---

### Task 1: Migration `008_app_roles.sql` + `src/admin/scope.js` (`loadScope`)

**Files:**
- Create: `services/core-api/migrations/008_app_roles.sql`, `services/core-api/src/admin/scope.js`
- Modify: `services/core-api/src/auth.js`
- Test: `services/core-api/test/scope.test.js` (mới; Postgres Testcontainers, áp 001–007 trước rồi 008 riêng như `apps-container.test.js`); sửa `services/core-api/test/migrate.test.js` (danh sách migration thêm `008_app_roles.sql`, danh sách bảng thêm `admin_user_apps`) và `services/core-api/test/helpers/db.js` (`resetDb` TRUNCATE thêm `admin_user_apps`)

**Interfaces:**
- Consumes: `USER_GRANTS` (`src/auth.js`), `authenticate`, `ensureToken`, `createSession`/`SESSION_COOKIE` (`src/admin/sessions.js`), `migrate(pool, dir)` (`src/db/migrate.js`); test helpers `startDb`, `resetDb`.
- Produces:
  - Migration 008 đúng spec §1: `admin_users.global BOOLEAN NOT NULL DEFAULT false` (backfill `global = true WHERE role = 'admin'`), `admin_users.role` bỏ `NOT NULL` (giữ `admin_users_role_check`; `NULL` qua được CHECK), bảng `admin_user_apps (user_id → admin_users ON DELETE CASCADE, app_id → apps, role CHECK admin_user_apps_role_check, created_by, created_at, PK (user_id, app_id))`, index `admin_user_apps_by_app (app_id)`, `api_tokens.app_id TEXT NULL REFERENCES apps (id)`; có `SET LOCAL lock_timeout = '5s'` như 007.
  - `src/auth.js`: `export const tokenGrants(roles)` (trước là hằng nội bộ); `authenticate()` đọc thêm `api_tokens.app_id` → actor token `{kind: 'token', name, roles, appId}` (`appId` = `null` khi không gắn app); người có `role NULL` → `grants: []` (không còn `undefined`, tránh 500 trong `requireRole` cũ).
  - `loadScope(db, actor)` (`src/admin/scope.js`, mới) → `{ global, roleIn(appId) → role|null, appIds() → string[] (đã sort), grantsIn(appId) → string[], globalGrants: string[] }`:
    - Người: một query `admin_users u LEFT JOIN apps a ON true LEFT JOIN admin_user_apps ua`. `global` → `roleIn(bất kỳ id) = 'admin'`, `appIds()` = mọi app; không global → `admin_user_apps.role` nếu có dòng, không thì `admin_users.role` (có thể `null`); `appIds()` = app có role hiệu lực khác null; `grantsIn` = `USER_GRANTS[role] ?? []`. User id không tồn tại → không global, `appIds() = []`. Không lọc `disabled_at` (session đã chặn).
    - Token không app: `global` khi roles có `admin`; `grantsIn(mọi app)` = `tokenGrants(roles)`; `appIds()` = mọi app; `roleIn` = `'admin'` nếu global, không thì `null`.
    - Token có app: không bao giờ global; `grantsIn(app đó)` = `tokenGrants(roles)`, app khác `[]`; `appIds() = [app]`; `roleIn` = `null`.
    - `globalGrants`: người global → `USER_GRANTS.admin`; token không app → `tokenGrants(roles)`; còn lại `[]`.
  - `isGlobalGrant(scope, grant)` = `scope.global || scope.globalGrants.includes(grant)`.
  - Chưa đổi route nào, chưa đổi `requireRole` (Task 2).

- [ ] **Step 1: Viết test fail**

`services/core-api/test/scope.test.js` (mới):

`services/core-api/test/scope.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { cp, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { startDb, resetDb } from './helpers/db.js';
import { migrate } from '../src/db/migrate.js';
import { authenticate, ensureToken, USER_GRANTS } from '../src/auth.js';
import { loadScope, isGlobalGrant } from '../src/admin/scope.js';
import { createSession, SESSION_COOKIE } from '../src/admin/sessions.js';

const MIGRATIONS = new URL('../migrations/', import.meta.url).pathname;
const M008 = '008_app_roles.sql';
const APP = (id) => `INSERT INTO apps (id, name, kind, return_url, api_key_hash) VALUES ('${id}', '${id}', 'web', 'https://${id}.example/done', 'h-${id}')`;

// Spec admin-console-p4b §1: migration 008 (admin_users.global, role nullable, admin_user_apps, api_tokens.app_id)
// and §2 "Phạm vi của người gọi": loadScope(db, actor).
describe('migration 008_app_roles + loadScope', () => {
  let db;
  let dir;
  const q = async (sql, p) => (await db.pool.query(sql, p)).rows;
  const user = async (email, role, { global = false, disabled = false } = {}) =>
    (await q(
      `INSERT INTO admin_users (email, name, role, global, created_by, disabled_at)
       VALUES ($1, 'N', $2, $3, 'test', CASE WHEN $4 THEN now() END) RETURNING id`,
      [email, role, global, disabled],
    ))[0].id;
  const grant = (userId, appId, role) =>
    q("INSERT INTO admin_user_apps (user_id, app_id, role, created_by) VALUES ($1, $2, $3, 'test')", [userId, appId, role]);
  const person = (userId) => ({ kind: 'user', name: 'x@ikameglobal.com', email: 'x@ikameglobal.com', userId });
  const token = (roles, appId = null) => ({ kind: 'token', name: roles.join('+'), roles, appId });

  beforeAll(async () => {
    db = await startDb({ migrate: false });
    // Apply 001–007 only, seed pre-008 people, then let the real directory apply 008 alone.
    dir = await mkdtemp(join(tmpdir(), 'ikf-mig-'));
    await cp(MIGRATIONS, dir, { recursive: true, filter: (src) => !src.endsWith(M008) });
    await migrate(db.pool, dir);
    await q(APP('starlyn'));
    await q(`INSERT INTO admin_users (email, name, role, created_by) VALUES
      ('boss@ikameglobal.com', 'Boss', 'admin', 'test'), ('ed@ikameglobal.com', 'Ed', 'editor', 'test')`);
    await q("INSERT INTO api_tokens (name, token_sha256, roles) VALUES ('old', 'sha-old', '{router}')");
    expect(await migrate(db.pool)).toEqual([M008]);
  });
  afterAll(async () => {
    await rm(dir, { recursive: true, force: true });
    await db.stop();
  });

  describe('migration 008', () => {
    it('adds admin_users.global, admin_user_apps (+ index by app) and api_tokens.app_id (FK apps)', async () => {
      const cols = await q(
        `SELECT table_name, column_name, data_type, is_nullable, column_default FROM information_schema.columns
          WHERE table_schema = 'public' AND ((table_name = 'admin_users' AND column_name IN ('global', 'role'))
             OR (table_name = 'api_tokens' AND column_name = 'app_id'))
          ORDER BY table_name, column_name`,
      );
      expect(cols).toEqual([
        { table_name: 'admin_users', column_name: 'global', data_type: 'boolean', is_nullable: 'NO', column_default: 'false' },
        { table_name: 'admin_users', column_name: 'role', data_type: 'text', is_nullable: 'YES', column_default: null },
        { table_name: 'api_tokens', column_name: 'app_id', data_type: 'text', is_nullable: 'YES', column_default: null },
      ]);
      const ua = await q(
        `SELECT column_name, is_nullable FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'admin_user_apps' ORDER BY ordinal_position`,
      );
      expect(ua).toEqual([
        { column_name: 'user_id', is_nullable: 'NO' },
        { column_name: 'app_id', is_nullable: 'NO' },
        { column_name: 'role', is_nullable: 'NO' },
        { column_name: 'created_by', is_nullable: 'NO' },
        { column_name: 'created_at', is_nullable: 'NO' },
      ]);
      const idx = await q("SELECT indexdef FROM pg_indexes WHERE indexname = 'admin_user_apps_by_app'");
      expect(idx[0].indexdef).toMatch(/\(app_id\)/);
      await expect(q("UPDATE api_tokens SET app_id = 'nope' WHERE name = 'old'")).rejects.toThrow(/foreign key/);
      expect(await q("SELECT app_id FROM api_tokens WHERE name = 'old'")).toEqual([{ app_id: null }]);
    });

    it('existing admins become global; other roles stay non-global with their role', async () => {
      expect(await q('SELECT email, role, global FROM admin_users ORDER BY id')).toEqual([
        { email: 'boss@ikameglobal.com', role: 'admin', global: true },
        { email: 'ed@ikameglobal.com', role: 'editor', global: false },
      ]);
    });

    it('role accepts NULL (no default role) and still rejects an unknown role', async () => {
      const id = await user('none@ikameglobal.com', null);
      expect(await q('SELECT role, global FROM admin_users WHERE id = $1', [id])).toEqual([{ role: null, global: false }]);
      await expect(user('owner@ikameglobal.com', 'owner')).rejects.toThrow(/admin_users_role_check/);
    });

    it('admin_user_apps: FK to apps, role CHECK, one row per (user, app), cascades on user delete', async () => {
      const id = await user('rows@ikameglobal.com', null);
      await expect(grant(id, 'nope', 'viewer')).rejects.toThrow(/foreign key/);
      await expect(grant(id, 'starlyn', 'owner')).rejects.toThrow(/admin_user_apps_role_check/);
      await grant(id, 'starlyn', 'support');
      await expect(grant(id, 'starlyn', 'viewer')).rejects.toThrow(/admin_user_apps_pkey/);
      await q('DELETE FROM admin_users WHERE id = $1', [id]);
      expect(await q('SELECT * FROM admin_user_apps WHERE user_id = $1', [id])).toEqual([]);
    });

    it('is applied once: a second migrate applies nothing', async () => {
      expect(await migrate(db.pool)).toEqual([]);
    });
  });

  describe('loadScope', () => {
    beforeEach(async () => {
      await resetDb(db.pool);
      for (const id of ['starlyn', 'chatchi', 'calmio']) await q(APP(id));
    });

    it('a global person: admin in every app, appIds = all apps (sorted)', async () => {
      // a stale default role and a narrower per-app row are ignored while global
      const id = await user('g@ikameglobal.com', 'viewer', { global: true });
      await grant(id, 'chatchi', 'viewer');
      const s = await loadScope(db.pool, person(id));
      expect(s.global).toBe(true);
      expect(s.appIds()).toEqual(['calmio', 'chatchi', 'starlyn']);
      expect(s.roleIn('chatchi')).toBe('admin');
      expect(s.grantsIn('starlyn')).toEqual(USER_GRANTS.admin);
      expect(isGlobalGrant(s, 'admin')).toBe(true);
    });

    it('a non-global person: the per-app row wins, else the default role', async () => {
      const id = await user('v@ikameglobal.com', 'viewer');
      await grant(id, 'chatchi', 'editor');
      const s = await loadScope(db.pool, person(id));
      expect(s.global).toBe(false);
      expect(s.roleIn('starlyn')).toBe('viewer');
      expect(s.roleIn('chatchi')).toBe('editor');
      expect(s.grantsIn('chatchi')).toEqual(USER_GRANTS.editor);
      expect(s.grantsIn('calmio')).toEqual(USER_GRANTS.viewer);
      expect(s.appIds()).toEqual(['calmio', 'chatchi', 'starlyn']);
      expect(isGlobalGrant(s, 'viewer')).toBe(false);
    });

    it('a person with no default role reaches only the apps it has rows for', async () => {
      const id = await user('s@ikameglobal.com', null);
      await grant(id, 'starlyn', 'support');
      const s = await loadScope(db.pool, person(id));
      expect(s.global).toBe(false);
      expect(s.appIds()).toEqual(['starlyn']);
      expect(s.roleIn('starlyn')).toBe('support');
      expect(s.grantsIn('starlyn')).toEqual(USER_GRANTS.support);
      expect(s.roleIn('chatchi')).toBeNull();
      expect(s.grantsIn('chatchi')).toEqual([]);
      expect(s.roleIn('nope')).toBeNull();
    });

    it('does not crash for a disabled or vanished person (sessions already refuse them)', async () => {
      const id = await user('d@ikameglobal.com', 'viewer', { disabled: true });
      await expect(loadScope(db.pool, person(id))).resolves.toMatchObject({ global: false });
      const gone = await loadScope(db.pool, person(999999));
      expect(gone.global).toBe(false);
      expect(gone.appIds()).toEqual([]);
      expect(gone.grantsIn('starlyn')).toEqual([]);
    });

    it('an admin token without app is global', async () => {
      const s = await loadScope(db.pool, token(['admin']));
      expect(s.global).toBe(true);
      expect(s.appIds()).toEqual(['calmio', 'chatchi', 'starlyn']);
      expect(s.grantsIn('calmio')).toEqual(USER_GRANTS.admin);
      expect(isGlobalGrant(s, 'admin')).toBe(true);
    });

    it('a router token without app keeps today\'s reach: not global, its grants in every app and globally', async () => {
      const s = await loadScope(db.pool, token(['router']));
      expect(s.global).toBe(false);
      expect(s.appIds()).toEqual(['calmio', 'chatchi', 'starlyn']);
      expect(s.grantsIn('starlyn')).toContain('router');
      expect(s.grantsIn('chatchi')).toContain('router');
      expect(isGlobalGrant(s, 'router')).toBe(true);
      expect(isGlobalGrant(s, 'admin')).toBe(false);
    });

    it('a publisher token with app starlyn: its grants only in starlyn, never global', async () => {
      const s = await loadScope(db.pool, token(['publisher'], 'starlyn'));
      expect(s.global).toBe(false);
      expect(s.appIds()).toEqual(['starlyn']);
      expect(s.grantsIn('starlyn')).toContain('publisher');
      expect(s.grantsIn('chatchi')).toEqual([]);
      expect(isGlobalGrant(s, 'publisher')).toBe(false);
    });
  });

  describe('authenticate', () => {
    beforeEach(async () => {
      await resetDb(db.pool);
      await q(APP('starlyn'));
    });
    const req = (t) => ({ method: 'GET', headers: { authorization: `Bearer ${t}` } });

    it('puts the token\'s app_id on the actor (null when absent)', async () => {
      await ensureToken(db.pool, { name: 'app-pub', roles: ['publisher'], token: 'ikf_apptoken' });
      await ensureToken(db.pool, { name: 'any-router', roles: ['router'], token: 'ikf_anytoken' });
      await q("UPDATE api_tokens SET app_id = 'starlyn' WHERE name = 'app-pub'");
      expect((await authenticate(db.pool, req('ikf_apptoken'))).actor).toEqual({ kind: 'token', name: 'app-pub', roles: ['publisher'], appId: 'starlyn' });
      expect((await authenticate(db.pool, req('ikf_anytoken'))).actor).toEqual({ kind: 'token', name: 'any-router', roles: ['router'], appId: null });
    });

    it('a person without default role authenticates with no global grants (not a crash)', async () => {
      const id = await user('s@ikameglobal.com', null);
      const { token: cookie } = await createSession(db.pool, { userId: id });
      const who = await authenticate(db.pool, { method: 'GET', headers: { cookie: `${SESSION_COOKIE}=${cookie}` } });
      expect(who.actor).toMatchObject({ kind: 'user', role: null, userId: Number(id) });
      expect(who.grants).toEqual([]);
    });
  });
});
```

`services/core-api/test/migrate.test.js`, `services/core-api/test/helpers/db.js` (sửa, áp dụng đúng diff này):

`services/core-api/test/migrate.test.js`, `services/core-api/test/helpers/db.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/test/helpers/db.js b/services/core-api/test/helpers/db.js
index e7b8fcc..f120674 100644
--- a/services/core-api/test/helpers/db.js
+++ b/services/core-api/test/helpers/db.js
@@ -20,6 +20,6 @@ export async function resetDb(pool) {
     `TRUNCATE route_events, routes, host_revs, versions, funnels, domains, api_tokens,
               funnel_prices, checkouts, transactions, subscriptions, customers, webhook_inbox, outbox,
               apps, entitlements, app_links, claim_tokens, otp_codes, magic_links, webhook_deliveries, sync_failures,
-              entitlement_recompute, admin_sessions, admin_users, audit_log, manual_grants RESTART IDENTITY CASCADE`,
+              entitlement_recompute, admin_sessions, admin_user_apps, admin_users, audit_log, manual_grants RESTART IDENTITY CASCADE`,
   );
 }
diff --git a/services/core-api/test/migrate.test.js b/services/core-api/test/migrate.test.js
index 353fdb7..ff98c1d 100644
--- a/services/core-api/test/migrate.test.js
+++ b/services/core-api/test/migrate.test.js
@@ -10,13 +10,13 @@ describe('migrate', () => {
   afterAll(() => db.stop());
 
   it('applies the publisher schema once and is idempotent', async () => {
-    expect(await migrate(db.pool)).toEqual(['001_publisher.sql', '002_funnel_pixel.sql', '003_billing.sql', '004_entitlements.sql', '005_admin.sql', '006_admin_p2.sql', '007_apps_container.sql']);
+    expect(await migrate(db.pool)).toEqual(['001_publisher.sql', '002_funnel_pixel.sql', '003_billing.sql', '004_entitlements.sql', '005_admin.sql', '006_admin_p2.sql', '007_apps_container.sql', '008_app_roles.sql']);
     expect(await migrate(db.pool)).toEqual([]);
     const { rows } = await db.pool.query(
       "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY 1",
     );
     expect(rows.map((r) => r.table_name)).toEqual([
-      'admin_sessions', 'admin_users', 'api_tokens', 'app_links', 'apps', 'audit_log', 'checkouts', 'claim_tokens', 'customers', 'domains', 'entitlement_recompute', 'entitlements',
+      'admin_sessions', 'admin_user_apps', 'admin_users', 'api_tokens', 'app_links', 'apps', 'audit_log', 'checkouts', 'claim_tokens', 'customers', 'domains', 'entitlement_recompute', 'entitlements',
       'funnel_prices', 'funnels', 'host_revs', 'magic_links', 'manual_grants', 'otp_codes', 'outbox', 'route_events', 'routes',
       'schema_migrations', 'subscriptions', 'sync_failures', 'transactions', 'versions', 'webhook_deliveries', 'webhook_inbox',
     ]);
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/scope.test.js
```

Expected: `Test Files  1 failed (1)`, `Tests  no tests`: file không nạp được vì `Failed to load url ../src/admin/scope.js ... Does the file exist?` (module `loadScope` chưa có; migration 008 cũng chưa có).

- [ ] **Step 3: Implement**

`services/core-api/migrations/008_app_roles.sql`, `services/core-api/src/admin/scope.js` (mới):

`services/core-api/migrations/008_app_roles.sql` (mới):

```sql
-- Admin console p4b (spec admin-console-p4b §1): roles per app. admin_users.role becomes the default role for
-- apps without a row of their own (NULL = none); global people are admin in every app and alone do what spans
-- apps. A token may be bound to one app.
-- migrate.js runs each file in one transaction: give up after 5 s waiting for a table lock instead of queueing
-- every request behind the ALTERs (a failed migration rolls back and the next deploy retries it)
SET LOCAL lock_timeout = '5s';
ALTER TABLE admin_users ADD COLUMN global BOOLEAN NOT NULL DEFAULT false;
-- Existing admins keep everything they could do; other roles become their default role on every app.
UPDATE admin_users SET global = true WHERE role = 'admin';
-- NULL = no default role. admin_users_role_check stays: a NULL role passes a CHECK.
ALTER TABLE admin_users ALTER COLUMN role DROP NOT NULL;
CREATE TABLE admin_user_apps (
  user_id    BIGINT NOT NULL REFERENCES admin_users (id) ON DELETE CASCADE,
  app_id     TEXT   NOT NULL REFERENCES apps (id),
  role       TEXT   NOT NULL CONSTRAINT admin_user_apps_role_check CHECK (role IN ('admin', 'editor', 'support', 'viewer')),
  created_by TEXT   NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, app_id)
);
CREATE INDEX admin_user_apps_by_app ON admin_user_apps (app_id);
-- NULL = not bound to an app (today's reach).
ALTER TABLE api_tokens ADD COLUMN app_id TEXT NULL REFERENCES apps (id);
```

`services/core-api/src/admin/scope.js` (mới):

```js
import { USER_GRANTS, tokenGrants } from '../auth.js';

// Spec admin-console-p4b §2 "Phạm vi của người gọi": what the caller may touch, app by app. Built on every
// request from the database so a role change applies at once (no cache).
// → { global, roleIn(appId) → role | null, appIds() → sorted app ids in reach, grantsIn(appId) → grants,
//     globalGrants: grants usable on global routes (isGlobalGrant) }.
export async function loadScope(db, actor) {
  return actor.kind === 'token' ? tokenScope(db, actor) : personScope(db, actor);
}

// True when the caller may use `grant` on a route that belongs to no app (spec §2 "Middleware", app: 'global').
export const isGlobalGrant = (scope, grant) => scope.global || scope.globalGrants.includes(grant);

const sortedIds = (rows) => rows.map((r) => r.id).sort();

// One query: the person (global, default role) × every app, with the per-app row when there is one. LEFT JOIN
// apps so a person still loads when there are no apps yet. A vanished user id yields no rows → no reach.
async function personScope(db, actor) {
  const { rows } = await db.query(
    `SELECT u.global, u.role AS default_role, a.id AS app_id, ua.role AS app_role
       FROM admin_users u
       LEFT JOIN apps a ON true
       LEFT JOIN admin_user_apps ua ON ua.user_id = u.id AND ua.app_id = a.id
      WHERE u.id = $1`,
    [actor.userId],
  );
  const global = rows.length > 0 && rows[0].global;
  // global ⇒ admin in every app, ignoring the default role and the per-app rows (spec §1).
  const roles = new Map(rows.filter((r) => r.app_id !== null).map((r) => [r.app_id, global ? 'admin' : (r.app_role ?? r.default_role)]));
  // global ⇒ admin in any app id, even one not loaded: the handler answers 404 for a missing resource.
  const roleIn = (appId) => (global ? 'admin' : (roles.get(appId) ?? null));
  const appIds = [...roles].filter(([, role]) => role !== null).map(([id]) => id).sort();
  return {
    global,
    roleIn,
    appIds: () => [...appIds],
    grantsIn: (appId) => USER_GRANTS[roleIn(appId)] ?? [],
    globalGrants: global ? USER_GRANTS.admin : [],
  };
}

// Tokens have no per-app role: roleIn is 'admin' for an admin token without app, else null; use grantsIn.
async function tokenScope(db, actor) {
  const grants = tokenGrants(actor.roles);
  if (actor.appId) {
    // Spec §2: a token bound to an app acts only in that app and is never global.
    return {
      global: false,
      roleIn: () => null,
      appIds: () => [actor.appId],
      grantsIn: (appId) => (appId === actor.appId ? grants : []),
      globalGrants: [],
    };
  }
  // A token without app keeps today's reach: its grants everywhere; global only with the admin role.
  const global = actor.roles.includes('admin');
  const appIds = sortedIds((await db.query('SELECT id FROM apps')).rows);
  return {
    global,
    roleIn: () => (global ? 'admin' : null),
    appIds: () => [...appIds],
    grantsIn: () => grants,
    globalGrants: grants,
  };
}
```

`services/core-api/src/auth.js` (sửa, áp dụng đúng diff này):

`services/core-api/src/auth.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/auth.js b/services/core-api/src/auth.js
index 24130d7..082ab9c 100644
--- a/services/core-api/src/auth.js
+++ b/services/core-api/src/auth.js
@@ -15,7 +15,7 @@ export const USER_GRANTS = {
 };
 // Every valid token may read; router reads prices and apps, publisher reads prices; an admin token passes every check.
 const TOKEN_READS = { router: ['prices:read', 'apps:read'], publisher: ['prices:read'] };
-const tokenGrants = (roles) =>
+export const tokenGrants = (roles) =>
   (roles.includes('admin') ? USER_GRANTS.admin : [...new Set(['viewer', ...roles, ...roles.flatMap((r) => TOKEN_READS[r] ?? [])])]);
 const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
 
@@ -42,15 +42,17 @@ export async function authenticate(pool, req) {
   if (session) {
     if (!SAFE_METHODS.has(req.method) && !sameSecret(req.headers['x-ikf-csrf'], session.csrf)) return { status: 403, error: 'csrf' };
     const actor = { kind: 'user', name: session.email, email: session.email, role: session.role, userId: session.userId };
-    return { actor, grants: USER_GRANTS[session.role], session: { ...session, token: cookie } };
+    // role NULL (migration 008: no default role) → no grant outside the person's apps (src/admin/scope.js).
+    return { actor, grants: USER_GRANTS[session.role] ?? [], session: { ...session, token: cookie } };
   }
   const m = /^Bearer (\S+)$/.exec(req.headers.authorization ?? '');
   const { rows } = m
-    ? await pool.query('SELECT name, roles FROM api_tokens WHERE token_sha256 = $1 AND revoked_at IS NULL', [sha256(m[1])])
+    ? await pool.query('SELECT name, roles, app_id FROM api_tokens WHERE token_sha256 = $1 AND revoked_at IS NULL', [sha256(m[1])])
     : { rows: [] };
   if (!rows.length) return { status: 401, error: 'unauthorized' };
-  const { name, roles } = rows[0];
-  return { actor: { kind: 'token', name, roles }, grants: tokenGrants(roles) };
+  const { name, roles, app_id: appId } = rows[0];
+  // Spec admin-console-p4b §2: a token bound to an app (api_tokens.app_id) acts only there (src/admin/scope.js).
+  return { actor: { kind: 'token', name, roles, appId }, grants: tokenGrants(roles) };
 }
 
 export function requireRole(pool, role) {
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/scope.test.js test/migrate.test.js test/auth.test.js test/admin-schema.test.js
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `scope.test.js` `Tests  14 passed (14)`; `migrate.test.js` 5, `auth.test.js` 8, `admin-schema.test.js` 3 vẫn pass; toàn bộ core-api `Test Files  68 passed (68)`, `Tests  630 passed (630)` (trước: 67 file, 616 test).

- [ ] **Step 5: Commit**

```bash
git add services/core-api/migrations/008_app_roles.sql services/core-api/src/admin/scope.js services/core-api/src/auth.js services/core-api/test/scope.test.js services/core-api/test/migrate.test.js services/core-api/test/helpers/db.js
git commit -m "feat(core-api): migration 008 (global, admin_user_apps, api_tokens.app_id); loadScope
```

---

---

### Task 2: `requireGrant` middleware (404/403, global, any), resolvers + `GET /v1/auth/me` mới

**Files:**
- Create: `services/core-api/src/admin/resolve.js`
- Modify: `services/core-api/src/auth.js`, `services/core-api/src/admin/sessions.js`, `services/core-api/src/http/auth.js`
- Test: `services/core-api/test/require-grant.test.js` (mới; Postgres Testcontainers, một app Fastify nhỏ + `makeApp`); sửa `services/core-api/test/sessions.test.js` (body chính xác của `GET /v1/auth/me` thêm `global`, `apps`)

**Interfaces:**
- Consumes: `loadScope(db, actor)`, `isGlobalGrant(scope, grant)` (`src/admin/scope.js`, Task 1); `authenticate()`, `USER_GRANTS`, `tokenGrants` (`src/auth.js`); `touchSession` (`src/admin/sessions.js`); test helpers `startDb`, `resetDb`, `makeApp`, `tokenFor`, `bearer`, `ADMIN_ORIGIN`, `createSession`/`SESSION_COOKIE`.
- Produces:
  - `requireGrant(pool, grant, { app = 'global' } = {})` (`src/auth.js`) — hook Fastify: xác thực như `requireRole` (401 / 403 `csrf` không đổi), gắn `req.actor`, `req.session`, `req.scope = await loadScope(pool, req.actor)`. Có `isGlobalGrant(scope, grant)` → luôn qua. Ngược lại:
    - `app: 'global'` → `403 {error:'forbidden'}` cho mọi method.
    - `app: 'any'` → qua nếu có app trong `scope.appIds()` mà `scope.grantsIn(id)` chứa `grant`; không thì `403 forbidden`.
    - `app: async (req, db) => appId | null | undefined` (resolver, `db` = `pool`): `undefined` → qua (handler tự 404 như cũ); `null` → chỉ global; id → qua nếu `scope.grantsIn(id)` chứa `grant`. Không đủ quyền: `GET`/`HEAD` → `404 {error:'not_found'}`, ghi → `403 {error:'forbidden'}`.
    - Resolver đọc `req.body` phải gắn ở `preHandler` (onRequest chưa có body).
  - `requireRole(pool, role)` giữ nguyên cho route chưa chuyển (Task 4–5 thay dần); `authenticate()` cho người `global = true` grants `USER_GRANTS.admin` bất kể cột `role`; role `NULL` → `[]` (403).
  - `touchSession()` trả thêm `global` (đọc `u.global`).
  - `src/admin/resolve.js` (mới), mỗi hàm một query → `app_id | null | undefined`: `appOfFunnel(db, slug)`, `appOfHost(db, host)` (`domains.app_id`), `appOfGrant(db, grantId)` (`manual_grants.app_id`; id không phải số → `undefined`, tránh lỗi cast 500), `appOfApp(db, id)` (→ `id` nếu app tồn tại, không thì `undefined`).
  - `GET /v1/auth/me` → `{email, name, role, global, csrf, apps: [{id, name, role}]}`: `apps` = app có role hiệu lực khác null, sort theo id, `role` = role hiệu lực (global → `admin`).

- [ ] **Step 1: Viết test fail**

`services/core-api/test/require-grant.test.js` (mới):

`services/core-api/test/require-grant.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, tokenFor, bearer } from './helpers/app.js';
import { ADMIN_ORIGIN } from './helpers/admin.js';
import { requireGrant } from '../src/auth.js';
import { appOfApp, appOfFunnel, appOfGrant, appOfHost } from '../src/admin/resolve.js';
import { createSession, SESSION_COOKIE } from '../src/admin/sessions.js';

const APP = (id, name) =>
  `INSERT INTO apps (id, name, kind, return_url, api_key_hash) VALUES ('${id}', '${name}', 'web', 'https://${id}.example/done', 'h-${id}')`;

// Spec admin-console-p4b §2 "Middleware" + decision #5: requireGrant(pool, grant, { app }) — 'global', 'any' or a
// resolver; out of scope → GET/HEAD 404 not_found, writes 403 forbidden. Plus the resolvers (src/admin/resolve.js),
// requireRole kept for routes not converted yet, and the new GET /v1/auth/me.
describe('requireGrant, resolvers, requireRole, auth/me (per-app roles)', () => {
  let db;
  const q = async (sql, p) => (await db.pool.query(sql, p)).rows;

  // A person (role may be null, global flag, per-app rows) with a live session: {id, headers(write?)}.
  const person = async (email, role, { global = false, apps = {} } = {}) => {
    const [{ id }] = await q(
      "INSERT INTO admin_users (email, name, role, global, created_by) VALUES ($1, $2, $3, $4, 'test') RETURNING id",
      [email, email.split('@')[0], role, global],
    );
    for (const [appId, r] of Object.entries(apps)) {
      await q("INSERT INTO admin_user_apps (user_id, app_id, role, created_by) VALUES ($1, $2, $3, 'test')", [id, appId, r]);
    }
    const { token, csrf } = await createSession(db.pool, { userId: Number(id) });
    const cookie = `${SESSION_COOKIE}=${token}`;
    return { id: Number(id), csrf, headers: (write = true) => ({ cookie, ...(write && { 'x-ikf-csrf': csrf }) }) };
  };
  const appToken = async (roles, appId) => {
    const t = await tokenFor(db.pool, ...roles);
    await q('UPDATE api_tokens SET app_id = $1 WHERE name = $2', [appId, roles.join('+')]);
    return t;
  };

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    await q(APP('starlyn', 'Starlyn'));
    await q(APP('chatchi', 'ChatChi'));
  });

  describe('requireGrant', () => {
    let app;
    // Resolver from the :app param: 'missing' = no such resource (undefined), 'shared' = unassigned (null).
    const fromParam = async (req) => {
      if (req.params.app === 'missing') return undefined;
      return req.params.app === 'shared' ? null : req.params.app;
    };
    const handler = async (req, reply) =>
      (req.params?.app === 'missing' ? reply.code(404).send({ error: 'app_not_found' }) : { ok: true, global: req.scope.global, apps: req.scope.appIds() });

    beforeEach(async () => {
      app = Fastify();
      const pool = db.pool;
      app.get('/g', { onRequest: requireGrant(pool, 'admin', { app: 'global' }) }, handler);
      app.post('/g', { onRequest: requireGrant(pool, 'admin', { app: 'global' }) }, handler);
      app.get('/default', { onRequest: requireGrant(pool, 'admin') }, handler);
      app.get('/any', { onRequest: requireGrant(pool, 'viewer', { app: 'any' }) }, handler);
      app.get('/any-router', { onRequest: requireGrant(pool, 'router', { app: 'any' }) }, handler);
      app.get('/apps/:app', { onRequest: requireGrant(pool, 'viewer', { app: fromParam }) }, handler);
      app.post('/apps/:app', { onRequest: requireGrant(pool, 'publisher', { app: fromParam }) }, handler);
      app.get('/funnels/:slug', { onRequest: requireGrant(pool, 'viewer', { app: (req, d) => appOfFunnel(d, req.params.slug) }) }, handler);
      // A resolver that reads the body runs as a preHandler (the body is not parsed yet in onRequest).
      app.post('/body', { preHandler: requireGrant(pool, 'publisher', { app: async (req) => req.body?.app_id }) }, handler);
      await app.ready();
    });
    afterEach(() => app.close());

    // GET in scope, GET out of scope, POST in scope, POST out of scope, global route, any route
    const matrix = async (headers) => {
      const got = [];
      for (const [method, url] of [['GET', '/apps/starlyn'], ['GET', '/apps/chatchi'], ['POST', '/apps/starlyn'], ['POST', '/apps/chatchi'], ['GET', '/g'], ['GET', '/any']]) {
        got.push((await app.inject({ method, url, headers: headers(method !== 'GET') })).statusCode);
      }
      return got;
    };

    it.each([
      ['global (default role viewer, ignored)', ['viewer', { global: true }], [200, 200, 200, 200, 200, 200]],
      ['admin of starlyn only', [null, { apps: { starlyn: 'admin' } }], [200, 404, 200, 403, 403, 200]],
      ['viewer of starlyn only', [null, { apps: { starlyn: 'viewer' } }], [200, 404, 403, 403, 403, 200]],
      ['no role, no app', [null, {}], [404, 404, 403, 403, 403, 403]],
      ['default editor, viewer row in chatchi', ['editor', { apps: { chatchi: 'viewer' } }], [200, 200, 200, 403, 403, 200]],
    ])('person %s → %j', async (_, [role, opts], codes) => {
      const p = await person('p@ikameglobal.com', role, opts);
      expect(await matrix(p.headers)).toEqual(codes);
    });

    it.each([
      ['admin token', ['admin'], null, [200, 200, 200, 200, 200, 200]],
      ['router token without app', ['router'], null, [200, 200, 403, 403, 403, 200]],
      ['publisher token without app', ['publisher'], null, [200, 200, 200, 200, 403, 200]],
      ['publisher token bound to starlyn', ['publisher'], 'starlyn', [200, 404, 200, 403, 403, 200]],
    ])('%s → %j', async (_, roles, appId, codes) => {
      const t = appId ? await appToken(roles, appId) : await tokenFor(db.pool, ...roles);
      expect(await matrix(() => bearer(t))).toEqual(codes);
    });

    it('out of scope bodies: GET/HEAD 404 not_found, write 403 forbidden, global-only 403 for every method', async () => {
      const p = await person('v@ikameglobal.com', null, { apps: { starlyn: 'viewer' } });
      const get = await app.inject({ method: 'GET', url: '/apps/chatchi', headers: p.headers(false) });
      expect([get.statusCode, get.json()]).toEqual([404, { error: 'not_found' }]);
      expect((await app.inject({ method: 'HEAD', url: '/apps/chatchi', headers: p.headers(false) })).statusCode).toBe(404);
      const post = await app.inject({ method: 'POST', url: '/apps/chatchi', headers: p.headers() });
      expect([post.statusCode, post.json()]).toEqual([403, { error: 'forbidden' }]);
      for (const method of ['GET', 'POST']) {
        const g = await app.inject({ method, url: '/g', headers: p.headers() });
        expect([g.statusCode, g.json()]).toEqual([403, { error: 'forbidden' }]);
      }
      const any = await app.inject({ method: 'GET', url: '/any-router', headers: p.headers(false) });
      expect([any.statusCode, any.json()]).toEqual([403, { error: 'forbidden' }]);
    });

    it('authentication is unchanged: 401 without a session or token, 403 csrf on a cookie write without the header', async () => {
      expect((await app.inject({ method: 'GET', url: '/apps/starlyn' })).json()).toEqual({ error: 'unauthorized' });
      expect((await app.inject({ method: 'GET', url: '/g', headers: bearer('ikf_nope') })).statusCode).toBe(401);
      const p = await person('g@ikameglobal.com', null, { global: true });
      const res = await app.inject({ method: 'POST', url: '/apps/starlyn', headers: p.headers(false) });
      expect([res.statusCode, res.json()]).toEqual([403, { error: 'csrf' }]);
    });

    it('the default is app: global', async () => {
      const g = await person('g@ikameglobal.com', null, { global: true });
      const a = await person('a@ikameglobal.com', null, { apps: { starlyn: 'admin' } });
      expect((await app.inject({ method: 'GET', url: '/default', headers: g.headers(false) })).statusCode).toBe(200);
      expect((await app.inject({ method: 'GET', url: '/default', headers: a.headers(false) })).statusCode).toBe(403);
    });

    it('a resolver returning undefined lets the handler decide (its own 404); null = global only', async () => {
      const none = await person('n@ikameglobal.com', null);
      const a = await person('a@ikameglobal.com', null, { apps: { starlyn: 'admin' } });
      const g = await person('g@ikameglobal.com', null, { global: true });
      const missing = await app.inject({ method: 'GET', url: '/apps/missing', headers: none.headers(false) });
      expect([missing.statusCode, missing.json()]).toEqual([404, { error: 'app_not_found' }]);
      expect((await app.inject({ method: 'POST', url: '/apps/missing', headers: none.headers() })).statusCode).toBe(404);
      expect((await app.inject({ method: 'GET', url: '/apps/shared', headers: a.headers(false) })).statusCode).toBe(404);
      expect((await app.inject({ method: 'POST', url: '/apps/shared', headers: a.headers() })).statusCode).toBe(403);
      expect((await app.inject({ method: 'GET', url: '/apps/shared', headers: g.headers(false) })).statusCode).toBe(200);
      expect((await app.inject({ method: 'POST', url: '/apps/shared', headers: g.headers() })).statusCode).toBe(200);
      // a token without app passes null resources with its global grants (today's reach)
      expect((await app.inject({ method: 'GET', url: '/apps/shared', headers: bearer(await tokenFor(db.pool, 'router')) })).statusCode).toBe(200);
      expect((await app.inject({ method: 'GET', url: '/apps/shared', headers: bearer(await appToken(['publisher'], 'starlyn')) })).statusCode).toBe(404);
    });

    it('a resolver gets (req, db): funnel app looked up in the database; body resolver as preHandler', async () => {
      await q("INSERT INTO funnels (slug, app_id, created_by) VALUES ('moon', 'starlyn', 't'), ('chat', 'chatchi', 't'), ('loose', NULL, 't')");
      const a = await person('a@ikameglobal.com', null, { apps: { starlyn: 'admin' } });
      const codes = [];
      for (const slug of ['moon', 'chat', 'loose', 'nope']) codes.push((await app.inject({ method: 'GET', url: `/funnels/${slug}`, headers: a.headers(false) })).statusCode);
      expect(codes).toEqual([200, 404, 404, 200]);
      const post = (appId) => app.inject({ method: 'POST', url: '/body', headers: a.headers(), payload: { app_id: appId } });
      expect((await post('starlyn')).statusCode).toBe(200);
      expect((await post('chatchi')).statusCode).toBe(403);
    });

    it('puts the scope on the request (req.scope, req.actor, req.session)', async () => {
      const p = await person('p@ikameglobal.com', null, { apps: { starlyn: 'viewer' } });
      expect((await app.inject({ method: 'GET', url: '/any', headers: p.headers(false) })).json()).toEqual({ ok: true, global: false, apps: ['starlyn'] });
      const g = await person('g@ikameglobal.com', null, { global: true });
      expect((await app.inject({ method: 'GET', url: '/any', headers: g.headers(false) })).json()).toEqual({ ok: true, global: true, apps: ['chatchi', 'starlyn'] });
    });
  });

  describe('resolvers (src/admin/resolve.js)', () => {
    it('appOfFunnel: app id, null when unassigned, undefined when no such funnel', async () => {
      await q("INSERT INTO funnels (slug, app_id, created_by) VALUES ('moon', 'starlyn', 't'), ('loose', NULL, 't')");
      expect(await appOfFunnel(db.pool, 'moon')).toBe('starlyn');
      expect(await appOfFunnel(db.pool, 'loose')).toBeNull();
      expect(await appOfFunnel(db.pool, 'nope')).toBeUndefined();
    });

    it('appOfHost: app id, null when shared, undefined when no such domain', async () => {
      await q("INSERT INTO domains (host, status, app_id) VALUES ('go.starlyn.app', 'active', 'starlyn'), ('try.example.com', 'active', NULL)");
      expect(await appOfHost(db.pool, 'go.starlyn.app')).toBe('starlyn');
      expect(await appOfHost(db.pool, 'try.example.com')).toBeNull();
      expect(await appOfHost(db.pool, 'nope.example.com')).toBeUndefined();
    });

    it('appOfGrant: the grant\'s app, undefined when absent or not an id', async () => {
      const [{ id: cus }] = await q("INSERT INTO customers (paddle_customer_id) VALUES ('ctm_1') RETURNING id");
      const [{ id }] = await q(
        "INSERT INTO manual_grants (customer_id, app_id, key, reason, granted_by) VALUES ($1, 'chatchi', 'pro', 'cs', 't') RETURNING id",
        [cus],
      );
      expect(await appOfGrant(db.pool, id)).toBe('chatchi');
      expect(await appOfGrant(db.pool, String(id))).toBe('chatchi');
      expect(await appOfGrant(db.pool, '999')).toBeUndefined();
      expect(await appOfGrant(db.pool, 'abc')).toBeUndefined();
    });

    it('appOfApp: the id when the app exists, else undefined', async () => {
      expect(await appOfApp(db.pool, 'starlyn')).toBe('starlyn');
      expect(await appOfApp(db.pool, 'nope')).toBeUndefined();
    });
  });

  describe('requireRole (routes not converted yet) and GET /v1/auth/me', () => {
    let app;
    beforeEach(async () => {
      ({ app } = await makeApp(db.pool, { admin: { origin: ADMIN_ORIGIN, appEnv: 'staging' } }));
    });
    afterEach(() => app.close());
    const get = (url, p) => app.inject({ method: 'GET', url, headers: p.headers(false) });

    it('a viewer person still reads GET /v1/funnels; a person with role NULL gets 403', async () => {
      expect((await get('/v1/funnels', await person('v@ikameglobal.com', 'viewer'))).statusCode).toBe(200);
      const none = await get('/v1/funnels', await person('n@ikameglobal.com', null, { apps: { starlyn: 'admin' } }));
      expect([none.statusCode, none.json()]).toEqual([403, { error: 'forbidden' }]);
    });

    it('a global person passes admin-only requireRole whatever its role column says', async () => {
      expect((await get('/v1/admin/users', await person('g@ikameglobal.com', 'viewer', { global: true }))).statusCode).toBe(200);
      expect((await get('/v1/admin/users', await person('v@ikameglobal.com', 'viewer'))).statusCode).toBe(403);
    });

    it('auth/me for a global person: global true, every app with role admin, sorted by id', async () => {
      const g = await person('g@ikameglobal.com', 'viewer', { global: true });
      const res = await get('/v1/auth/me', g);
      expect(res.json()).toEqual({
        email: 'g@ikameglobal.com', name: 'g', role: 'viewer', global: true, csrf: g.csrf,
        apps: [{ id: 'chatchi', name: 'ChatChi', role: 'admin' }, { id: 'starlyn', name: 'Starlyn', role: 'admin' }],
      });
      expect(res.headers['cache-control']).toBe('no-store');
    });

    it('auth/me for scoped people: only apps with an effective role, the per-app row over the default', async () => {
      const s = await person('s@ikameglobal.com', null, { apps: { starlyn: 'support' } });
      expect((await get('/v1/auth/me', s)).json()).toEqual({
        email: 's@ikameglobal.com', name: 's', role: null, global: false, csrf: s.csrf,
        apps: [{ id: 'starlyn', name: 'Starlyn', role: 'support' }],
      });
      const v = await person('v@ikameglobal.com', 'viewer', { apps: { chatchi: 'editor' } });
      expect((await get('/v1/auth/me', v)).json()).toMatchObject({
        role: 'viewer', global: false,
        apps: [{ id: 'chatchi', name: 'ChatChi', role: 'editor' }, { id: 'starlyn', name: 'Starlyn', role: 'viewer' }],
      });
      const n = await person('n@ikameglobal.com', null);
      expect((await get('/v1/auth/me', n)).json()).toMatchObject({ role: null, global: false, apps: [] });
    });
  });
});
```

`services/core-api/test/sessions.test.js` (sửa, áp dụng đúng diff này):

`services/core-api/test/sessions.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/test/sessions.test.js b/services/core-api/test/sessions.test.js
index 2ba8aef..749d631 100644
--- a/services/core-api/test/sessions.test.js
+++ b/services/core-api/test/sessions.test.js
@@ -29,7 +29,7 @@ describe('admin console sessions, CSRF and roles', () => {
     const an = await signIn(db.pool, 'an@ikameglobal.com', 'editor');
     const res = await me(an.headers(false));
     expect(res.statusCode).toBe(200);
-    expect(res.json()).toEqual({ email: 'an@ikameglobal.com', name: 'an', role: 'editor', csrf: an.csrf });
+    expect(res.json()).toEqual({ email: 'an@ikameglobal.com', name: 'an', role: 'editor', global: false, csrf: an.csrf, apps: [] });
     expect(res.headers['cache-control']).toBe('no-store');
   });
 
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/require-grant.test.js
```

Expected: `Test Files  1 failed (1)`, `Tests  no tests`: file không nạp được vì `Failed to load url ../src/admin/resolve.js ... Does the file exist?` (`resolve.js` chưa có; `requireGrant` chưa được export, `auth/me` chưa có `global`/`apps`).

- [ ] **Step 3: Implement**

`services/core-api/src/admin/resolve.js` (mới):

`services/core-api/src/admin/resolve.js` (mới):

```js
// Spec admin-console-p4b §2 "Middleware": resolvers for requireGrant(pool, grant, { app }). Each looks up the app a
// resource belongs to in one query → app id, null (unassigned funnel / shared domain: global only) or undefined
// (no such resource: the handler answers its own 404 as before).

const one = async (db, sql, value) => {
  const { rows } = await db.query(sql, [value]);
  return rows.length ? rows[0].app_id : undefined;
};

export const appOfFunnel = (db, slug) => one(db, 'SELECT app_id FROM funnels WHERE slug = $1', slug);

export const appOfHost = (db, host) => one(db, 'SELECT app_id FROM domains WHERE host = $1', host);

// manual_grants.id is a BIGSERIAL: anything but digits is no grant (Postgres would refuse the cast → 500).
export const appOfGrant = async (db, grantId) =>
  (/^\d{1,18}$/.test(String(grantId)) ? one(db, 'SELECT app_id FROM manual_grants WHERE id = $1', String(grantId)) : undefined);

export const appOfApp = (db, id) => one(db, 'SELECT id AS app_id FROM apps WHERE id = $1', id);
```

`services/core-api/src/auth.js`, `services/core-api/src/admin/sessions.js`, `services/core-api/src/http/auth.js` (sửa, áp dụng đúng diff này):

`services/core-api/src/auth.js`, `services/core-api/src/admin/sessions.js`, `services/core-api/src/http/auth.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/admin/sessions.js b/services/core-api/src/admin/sessions.js
index 69481d9..d7e4859 100644
--- a/services/core-api/src/admin/sessions.js
+++ b/services/core-api/src/admin/sessions.js
@@ -48,12 +48,12 @@ export async function touchSession(db, token) {
         SET expires_at = LEAST(now() + make_interval(hours => $2), s.created_at + make_interval(days => $3)), last_seen_at = now()
        FROM admin_users u
       WHERE s.id = $1 AND s.expires_at > now() AND u.id = s.user_id AND u.disabled_at IS NULL
-     RETURNING s.csrf, u.id AS user_id, u.email, u.name, u.role`,
+     RETURNING s.csrf, u.id AS user_id, u.email, u.name, u.role, u.global`,
     [sha256(token), SESSION_HOURS, SESSION_MAX_DAYS],
   );
   if (!rows.length) return null;
   const r = rows[0];
-  return { csrf: r.csrf, userId: Number(r.user_id), email: r.email, name: r.name, role: r.role };
+  return { csrf: r.csrf, userId: Number(r.user_id), email: r.email, name: r.name, role: r.role, global: r.global };
 }
 
 export async function endSession(db, token) {
diff --git a/services/core-api/src/auth.js b/services/core-api/src/auth.js
index 082ab9c..9ca7f20 100644
--- a/services/core-api/src/auth.js
+++ b/services/core-api/src/auth.js
@@ -1,5 +1,6 @@
 import { createHash, randomBytes } from 'node:crypto';
 import { SESSION_COOKIE, readCookie, sameSecret, touchSession } from './admin/sessions.js';
+import { isGlobalGrant, loadScope } from './admin/scope.js';
 
 // Token roles (api_tokens.roles) and people's roles (admin_users.role, spec admin-console-p1 §1, p2 §1).
 export const ROLES = ['publisher', 'router', 'admin'];
@@ -43,7 +44,10 @@ export async function authenticate(pool, req) {
     if (!SAFE_METHODS.has(req.method) && !sameSecret(req.headers['x-ikf-csrf'], session.csrf)) return { status: 403, error: 'csrf' };
     const actor = { kind: 'user', name: session.email, email: session.email, role: session.role, userId: session.userId };
     // role NULL (migration 008: no default role) → no grant outside the person's apps (src/admin/scope.js).
-    return { actor, grants: USER_GRANTS[session.role] ?? [], session: { ...session, token: cookie } };
+    // A global person is admin whatever the role column says (spec admin-console-p4b §1), so requireRole routes
+    // not converted to requireGrant yet keep working for them.
+    const grants = session.global ? USER_GRANTS.admin : (USER_GRANTS[session.role] ?? []);
+    return { actor, grants, session: { ...session, token: cookie } };
   }
   const m = /^Bearer (\S+)$/.exec(req.headers.authorization ?? '');
   const { rows } = m
@@ -55,6 +59,38 @@ export async function authenticate(pool, req) {
   return { actor: { kind: 'token', name, roles, appId }, grants: tokenGrants(roles) };
 }
 
+// Spec admin-console-p4b §2 "Middleware": a grant checked in the caller's scope (src/admin/scope.js), built per
+// request and left on req.scope for the handler.
+//   app: 'global' (default) → only a global caller (isGlobalGrant); anyone else 403, whatever the method — global
+//        routes are no secret.
+//   app: 'any' → the grant in at least one app (the handler filters its list to req.scope).
+//   app: async (req, db) => appId | null | undefined → the app of the resource: undefined = no such resource (the
+//        handler answers its 404 as before), null = unassigned/shared (global only), an id = the grant in that app.
+// Out of scope on a resolver route (decision #5): GET/HEAD → 404 not_found (an app's resources are not disclosed),
+// a write → 403 forbidden. A resolver that reads req.body must run as a preHandler (no body yet in onRequest).
+export function requireGrant(pool, grant, { app = 'global' } = {}) {
+  return async (req, reply) => {
+    const who = await authenticate(pool, req);
+    if (who.error) return reply.code(who.status).send({ error: who.error });
+    req.actor = who.actor;
+    req.session = who.session ?? null;
+    const scope = await loadScope(pool, who.actor);
+    req.scope = scope;
+    if (isGlobalGrant(scope, grant)) return undefined;
+    if (app === 'global') return reply.code(403).send({ error: 'forbidden' });
+    if (app === 'any') {
+      return scope.appIds().some((id) => scope.grantsIn(id).includes(grant)) ? undefined : reply.code(403).send({ error: 'forbidden' });
+    }
+    const appId = await app(req, pool);
+    if (appId === undefined || (appId !== null && scope.grantsIn(appId).includes(grant))) return undefined;
+    return req.method === 'GET' || req.method === 'HEAD'
+      ? reply.code(404).send({ error: 'not_found' })
+      : reply.code(403).send({ error: 'forbidden' });
+  };
+}
+
+// Routes not converted to requireGrant yet (spec admin-console-p4b §2): today's check — a person's default role
+// (global → admin) or the token's roles, in no particular app.
 export function requireRole(pool, role) {
   const wanted = Array.isArray(role) ? role : [role];
   return async (req, reply) => {
diff --git a/services/core-api/src/http/auth.js b/services/core-api/src/http/auth.js
index 1baa6a1..2f60016 100644
--- a/services/core-api/src/http/auth.js
+++ b/services/core-api/src/http/auth.js
@@ -2,6 +2,7 @@ import { audit } from '../audit.js';
 import { requireSession } from '../auth.js';
 import { clearedSessionCookie, createSession, endSession, sessionCookie } from '../admin/sessions.js';
 import { ensureLocalAdmin } from '../admin/users.js';
+import { loadScope } from '../admin/scope.js';
 
 // Where to send the browser after sign-in: a path inside the admin app, nothing else.
 // A local path only ("/…", never "//…" or "/\…"), printable ASCII: anything else (a non-ASCII character would make
@@ -18,7 +19,11 @@ export default async function authHttp(app, { pool, admin }) {
   app.get('/v1/auth/me', { onRequest: session }, async (req, reply) => {
     reply.header('cache-control', 'no-store');
     const s = req.session;
-    return { email: s.email, name: s.name, role: s.role, csrf: s.csrf };
+    // Spec admin-console-p4b §2 "Users và token": the apps in reach with the effective role (global → admin).
+    const scope = await loadScope(pool, req.actor);
+    const { rows } = await pool.query('SELECT id, name FROM apps WHERE id = ANY($1) ORDER BY id', [scope.appIds()]);
+    const apps = rows.map((a) => ({ id: a.id, name: a.name, role: scope.roleIn(a.id) }));
+    return { email: s.email, name: s.name, role: s.role, global: scope.global, csrf: s.csrf, apps };
   });
 
   app.post('/v1/auth/logout', { onRequest: session }, async (req, reply) => {
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/require-grant.test.js test/sessions.test.js test/scope.test.js test/roles-p2.test.js test/google.test.js test/auth.test.js
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `require-grant.test.js` `Tests  23 passed (23)`; `sessions.test.js` 14, `scope.test.js` 14, `roles-p2.test.js` 9, `google.test.js` 14, `auth.test.js` 8 vẫn pass (`Test Files  6 passed (6)`, `Tests  82 passed (82)`); toàn bộ core-api `Test Files  69 passed (69)`, `Tests  653 passed (653)` (trước: 68 file, 630 test).

- [ ] **Step 5: Commit**

```bash
git add services/core-api/src/auth.js services/core-api/src/admin/resolve.js services/core-api/src/admin/sessions.js services/core-api/src/http/auth.js services/core-api/test/require-grant.test.js services/core-api/test/sessions.test.js
git commit -m "feat(core-api): requireGrant (per-app scope, 404/403), resolvers, auth/me with global and apps
```

---

---

### Task 3: Users API theo app (global, app grants, last_global_admin, cannot_lock_self) + token có app

**Files:**
- Modify: `services/core-api/src/admin/users.js`, `services/core-api/src/http/users.js`, `services/core-api/src/http/tokens.js`, `services/core-api/src/auth.js`
- Test: `services/core-api/test/users-apps.test.js` (mới), `services/core-api/test/tokens-app.test.js` (mới); sửa `services/core-api/test/helpers/admin.js` (`signIn` tạo người global khi role `admin`, tham số thứ 4 `{global, apps}`), `services/core-api/test/users.test.js` (body người dùng chính xác thêm `global`, `apps`; details audit `admin.user.*` thêm `global`)

**Interfaces:**
- Consumes: `requireGrant(pool, grant, { app: 'global' })`, `createToken`, `ROLES`, `USER_ROLES` (`src/auth.js`, Task 2); `loadScope` (`src/admin/scope.js`, Task 1, chỉ trong test); `audit(db, actor, action, target, details, { app_id })`; `withTx` (`src/identity/link.js`); `HttpError`.
- Produces:
  - Mọi route Users và `POST /v1/tokens`: `requireGrant(pool, 'admin', { app: 'global' })` — người không global (kể cả admin của một app) và token có app → `403 {error:'forbidden'}`; token `admin` không app vẫn dùng được (`ikf admin`).
  - Người dùng (mọi câu trả lời của Users API): `{id, email, name, role (null được), global, disabled_at, created_by, created_at, apps: [{app_id, role}]}`, `apps` sort theo `app_id`.
  - `GET /v1/admin/users` → `{users: [...]}` sort theo email.
  - `POST /v1/admin/users {email, name?, role?: role|null (mặc định null), global?: bool, apps?: [{app_id, role}]}` → `201`; một transaction: `400 duplicate_app {app_id}` (app trùng trong `apps`), `404 app_not_found {app_id}` (app đầu tiên không tồn tại; không tạo gì), `409 user_exists`, `400 invalid_email` như cũ. Audit `admin.user.create {email, role, global}` + mỗi app một dòng `admin.user.app_grant {email, app_id, role}` (cột `app_id`).
  - `PUT /v1/admin/users/:id {role?: role|null, name?, disabled?, global?}`: tự khoá (`disabled:true`, `global:false`, hoặc đổi role khác `admin` cho chính mình) → `409 cannot_lock_self` (giữ mã của luật đợt 1); khoá mọi dòng global đang bật (`ORDER BY id FOR UPDATE`) rồi dòng người đó; nếu thay đổi làm người đang là global bật mất global/bị disable và không còn global bật nào → `409 last_global_admin` (rollback). Audit `admin.user.update|disable {email, role, global, enabled?}`.
  - `PUT /v1/admin/users/:id/apps/:app_id {role}` (upsert) → `200` người dùng; `404 user_not_found {id}`, `404 app_not_found {app_id}`; audit `admin.user.app_grant {email, app_id, role}` cột `app_id`.
  - `DELETE /v1/admin/users/:id/apps/:app_id` → `200` người dùng; không có dòng → `404 user_app_not_found {id, app_id}`; `404 user_not_found {id}`; audit `admin.user.app_revoke {email, app_id}` cột `app_id`.
  - `src/admin/users.js` export: `listUsers(pool)`, `createUser(pool, body, actor)`, `updateUser(pool, id, body, actor)`, `setUserApp(pool, id, appId, role, actor)`, `removeUserApp(pool, id, appId, actor)`, `ensureLocalAdmin(db, email)` (giờ đặt `global = true`, kể cả khi người đã có).
  - `POST /v1/tokens {name, roles, app_id?}` → `201 {name, roles, app_id (null khi không có), token}`; role ngoài `ROLES` → `400 invalid_roles {allowed: ROLES}`; có `app_id` mà role ngoài `publisher`/`router` → `400 invalid_roles {allowed: ['publisher','router']}`; app không tồn tại → `404 app_not_found {app_id}`; lưu `api_tokens.app_id`; audit `token.create {name, roles}` cột `app_id`, cùng transaction.
  - `createToken(pool, { name, roles, appId = null })` (`src/auth.js`) ghi `api_tokens.app_id`.
  - Test helper `signIn(pool, email, role, { global = role === 'admin', apps = [] } = {})`.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/users-apps.test.js` (mới):

`services/core-api/test/users-apps.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, tokenFor, bearer } from './helpers/app.js';
import { signIn } from './helpers/admin.js';
import { ensureLocalAdmin } from '../src/admin/users.js';
import { loadScope } from '../src/admin/scope.js';

const APP = (id) =>
  `INSERT INTO apps (id, name, kind, return_url, api_key_hash) VALUES ('${id}', '${id}', 'web', 'https://${id}.example/done', 'h-${id}')`;

// Spec admin-console-p4b §1 (last_global_admin, self lock-out), §2 "Users và token", §2 "Audit": people carry a
// global flag and per-app roles; the Users API is for global callers only.
describe('admin users API: global flag and per-app roles (spec admin-console-p4b)', () => {
  let db;
  let app;
  let boss;
  const q = async (sql, p) => (await db.pool.query(sql, p)).rows;

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    await q(APP('starlyn'));
    await q(APP('chatchi'));
    ({ app } = await makeApp(db.pool));
    boss = await signIn(db.pool, 'boss@ikameglobal.com', 'admin');
  });
  afterEach(() => app.close());

  const call = (method, url, payload, headers = boss.headers()) => app.inject({ method, url, headers, ...(payload && { payload }) });
  const auditRows = () => q('SELECT action, target, details, app_id FROM audit_log ORDER BY id');

  it('GET lists every person with global and their app roles (sorted by app)', async () => {
    const an = await signIn(db.pool, 'an@ikameglobal.com', null, { apps: [{ app_id: 'starlyn', role: 'editor' }, { app_id: 'chatchi', role: 'viewer' }] });
    const res = await call('GET', '/v1/admin/users');
    expect(res.statusCode).toBe(200);
    expect(res.json().users).toEqual([
      {
        id: an.id, email: 'an@ikameglobal.com', name: 'an', role: null, global: false, disabled_at: null, created_by: 'test', created_at: expect.any(String),
        apps: [{ app_id: 'chatchi', role: 'viewer' }, { app_id: 'starlyn', role: 'editor' }],
      },
      {
        id: boss.id, email: 'boss@ikameglobal.com', name: 'boss', role: 'admin', global: true, disabled_at: null, created_by: 'test', created_at: expect.any(String),
        apps: [],
      },
    ]);
  });

  it('POST creates a person with no default role, global or app roles in one transaction; unknown app → 404, nothing created', async () => {
    const res = await call('POST', '/v1/admin/users', {
      email: 'Su@ikameglobal.com', role: null, apps: [{ app_id: 'starlyn', role: 'support' }, { app_id: 'chatchi', role: 'viewer' }],
    });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toMatchObject({
      email: 'su@ikameglobal.com', role: null, global: false, apps: [{ app_id: 'chatchi', role: 'viewer' }, { app_id: 'starlyn', role: 'support' }],
    });
    // role may be left out (no default role) and global set
    expect((await call('POST', '/v1/admin/users', { email: 'g@ikameglobal.com', global: true })).json()).toMatchObject({ role: null, global: true, apps: [] });

    const bad = await call('POST', '/v1/admin/users', { email: 'x@ikameglobal.com', apps: [{ app_id: 'starlyn', role: 'viewer' }, { app_id: 'nope', role: 'viewer' }] });
    expect(bad.statusCode).toBe(404);
    expect(bad.json()).toEqual({ error: 'app_not_found', detail: { app_id: 'nope' } });
    expect(await q("SELECT id FROM admin_users WHERE email = 'x@ikameglobal.com'")).toEqual([]);
    const dup = await call('POST', '/v1/admin/users', { email: 'x@ikameglobal.com', apps: [{ app_id: 'starlyn', role: 'viewer' }, { app_id: 'starlyn', role: 'editor' }] });
    expect(dup.json()).toEqual({ error: 'duplicate_app', detail: { app_id: 'starlyn' } });
    expect((await call('POST', '/v1/admin/users', { email: 'y@ikameglobal.com', apps: [{ app_id: 'starlyn', role: 'owner' }] })).statusCode).toBe(400);
  });

  it('PUT /apps/:app_id upserts an app role, DELETE removes it (404 when absent, unknown user or app)', async () => {
    const an = await signIn(db.pool, 'an@ikameglobal.com', 'viewer');
    const put = await call('PUT', `/v1/admin/users/${an.id}/apps/starlyn`, { role: 'editor' });
    expect(put.statusCode).toBe(200);
    expect(put.json()).toMatchObject({ id: an.id, role: 'viewer', apps: [{ app_id: 'starlyn', role: 'editor' }] });
    expect((await call('PUT', `/v1/admin/users/${an.id}/apps/starlyn`, { role: 'support' })).json().apps).toEqual([{ app_id: 'starlyn', role: 'support' }]);
    expect(await q('SELECT app_id, role, created_by FROM admin_user_apps')).toEqual([{ app_id: 'starlyn', role: 'support', created_by: 'boss@ikameglobal.com' }]);
    // the new role applies at once (the scope is read from the database on every request)
    const scope = await loadScope(db.pool, { kind: 'user', userId: an.id });
    expect([scope.roleIn('starlyn'), scope.roleIn('chatchi')]).toEqual(['support', 'viewer']);

    expect((await call('PUT', `/v1/admin/users/${an.id}/apps/nope`, { role: 'viewer' })).json()).toEqual({ error: 'app_not_found', detail: { app_id: 'nope' } });
    expect((await call('PUT', '/v1/admin/users/999/apps/starlyn', { role: 'viewer' })).json()).toEqual({ error: 'user_not_found', detail: { id: 999 } });
    expect((await call('PUT', `/v1/admin/users/${an.id}/apps/starlyn`, { role: 'owner' })).statusCode).toBe(400);

    const del = await call('DELETE', `/v1/admin/users/${an.id}/apps/starlyn`);
    expect(del.statusCode).toBe(200);
    expect(del.json()).toMatchObject({ id: an.id, apps: [] });
    const again = await call('DELETE', `/v1/admin/users/${an.id}/apps/starlyn`);
    expect(again.statusCode).toBe(404);
    expect(again.json()).toEqual({ error: 'user_app_not_found', detail: { id: an.id, app_id: 'starlyn' } });
    expect((await call('DELETE', '/v1/admin/users/999/apps/starlyn')).json()).toEqual({ error: 'user_not_found', detail: { id: 999 } });
  });

  it('PUT /v1/admin/users/:id sets global and a NULL default role', async () => {
    const an = await signIn(db.pool, 'an@ikameglobal.com', 'viewer');
    expect((await call('PUT', `/v1/admin/users/${an.id}`, { role: null })).json()).toMatchObject({ role: null, global: false });
    expect((await call('PUT', `/v1/admin/users/${an.id}`, { global: true })).json()).toMatchObject({ role: null, global: true });
    expect((await call('PUT', `/v1/admin/users/${an.id}`, { name: 'An' })).json()).toMatchObject({ name: 'An', role: null, global: true });
    expect((await call('PUT', `/v1/admin/users/${an.id}`, { global: false, role: 'support' })).json()).toMatchObject({ role: 'support', global: false });
  });

  it('only a global caller: an admin of one app gets 403 on every users route; an app-bound admin token too', async () => {
    const appAdmin = await signIn(db.pool, 'aa@ikameglobal.com', null, { apps: [{ app_id: 'starlyn', role: 'admin' }] });
    const appToken = await tokenFor(db.pool, 'publisher', 'router');
    await q("UPDATE api_tokens SET app_id = 'starlyn' WHERE name = 'publisher+router'");
    const routes = [
      ['GET', '/v1/admin/users'],
      ['POST', '/v1/admin/users', { email: 'z@ikameglobal.com', role: 'viewer' }],
      ['PUT', `/v1/admin/users/${boss.id}`, { name: 'x' }],
      ['PUT', `/v1/admin/users/${boss.id}/apps/starlyn`, { role: 'viewer' }],
      ['DELETE', `/v1/admin/users/${boss.id}/apps/starlyn`],
    ];
    for (const headers of [appAdmin.headers(), bearer(appToken)]) {
      for (const [method, url, body] of routes) {
        const res = await call(method, url, body, headers);
        expect([method, url, res.statusCode]).toEqual([method, url, 403]);
        expect(res.json()).toEqual({ error: 'forbidden' });
      }
    }
    expect(await q("SELECT id FROM admin_users WHERE email = 'z@ikameglobal.com'")).toEqual([]);
  });

  it('last_global_admin: the only enabled global person cannot be un-globaled or disabled; with two globals it works', async () => {
    const admin = bearer(await tokenFor(db.pool, 'admin'));
    for (const body of [{ global: false }, { disabled: true }]) {
      const res = await call('PUT', `/v1/admin/users/${boss.id}`, body, admin);
      expect(res.statusCode).toBe(409);
      expect(res.json()).toEqual({ error: 'last_global_admin' });
    }
    expect(await q('SELECT global, disabled_at FROM admin_users WHERE id = $1', [boss.id])).toEqual([{ global: true, disabled_at: null }]);
    // a disabled global does not count
    const off = await signIn(db.pool, 'off@ikameglobal.com', 'admin');
    await q('UPDATE admin_users SET disabled_at = now() WHERE id = $1', [off.id]);
    expect((await call('PUT', `/v1/admin/users/${boss.id}`, { global: false }, admin)).json()).toEqual({ error: 'last_global_admin' });

    const second = await signIn(db.pool, 'second@ikameglobal.com', 'admin');
    expect((await call('PUT', `/v1/admin/users/${boss.id}`, { global: false }, second.headers())).json()).toMatchObject({ global: false });
    expect((await call('PUT', `/v1/admin/users/${second.id}`, { disabled: true }, admin)).json()).toEqual({ error: 'last_global_admin' });
    expect((await call('PUT', `/v1/admin/users/${boss.id}`, { global: true }, second.headers())).json()).toMatchObject({ global: true });
    expect((await call('PUT', `/v1/admin/users/${second.id}`, { disabled: true }, admin)).json().disabled_at).toEqual(expect.any(String));
  });

  it('self lock-out: a global person cannot drop their own global flag or disable themselves (cannot_lock_self)', async () => {
    await signIn(db.pool, 'second@ikameglobal.com', 'admin');
    for (const body of [{ global: false }, { disabled: true }]) {
      const res = await call('PUT', `/v1/admin/users/${boss.id}`, body);
      expect(res.statusCode).toBe(409);
      expect(res.json()).toEqual({ error: 'cannot_lock_self' });
    }
    expect(await q('SELECT global, disabled_at FROM admin_users WHERE id = $1', [boss.id])).toEqual([{ global: true, disabled_at: null }]);
  });

  it('audit: create and update carry global; app_grant / app_revoke carry the app in the app_id column', async () => {
    const created = (await call('POST', '/v1/admin/users', { email: 'su@ikameglobal.com', role: null, apps: [{ app_id: 'starlyn', role: 'support' }] })).json();
    await call('PUT', `/v1/admin/users/${created.id}`, { global: true });
    await call('PUT', `/v1/admin/users/${created.id}/apps/chatchi`, { role: 'editor' });
    await call('DELETE', `/v1/admin/users/${created.id}/apps/starlyn`);
    const target = 'user:su@ikameglobal.com';
    expect(await auditRows()).toEqual([
      { action: 'admin.user.create', target, details: { email: 'su@ikameglobal.com', role: null, global: false }, app_id: null },
      { action: 'admin.user.app_grant', target, details: { email: 'su@ikameglobal.com', app_id: 'starlyn', role: 'support' }, app_id: 'starlyn' },
      { action: 'admin.user.update', target, details: { email: 'su@ikameglobal.com', role: null, global: true }, app_id: null },
      { action: 'admin.user.app_grant', target, details: { email: 'su@ikameglobal.com', app_id: 'chatchi', role: 'editor' }, app_id: 'chatchi' },
      { action: 'admin.user.app_revoke', target, details: { email: 'su@ikameglobal.com', app_id: 'starlyn' }, app_id: 'starlyn' },
    ]);
    // failed changes leave no audit row
    await call('PUT', `/v1/admin/users/${created.id}/apps/nope`, { role: 'viewer' });
    await call('DELETE', `/v1/admin/users/${created.id}/apps/starlyn`);
    expect(await auditRows()).toHaveLength(5);
  });

  it('the local demo admin (ensureLocalAdmin) is global', async () => {
    const u = await ensureLocalAdmin(db.pool, 'Dev@ikameglobal.com');
    expect(await q('SELECT email, role, global FROM admin_users WHERE id = $1', [u.id])).toEqual([{ email: 'dev@ikameglobal.com', role: 'admin', global: true }]);
    await q("UPDATE admin_users SET global = false, disabled_at = now() WHERE email = 'dev@ikameglobal.com'");
    await ensureLocalAdmin(db.pool, 'dev@ikameglobal.com');
    expect(await q("SELECT global, disabled_at FROM admin_users WHERE email = 'dev@ikameglobal.com'")).toEqual([{ global: true, disabled_at: null }]);
  });
});
```

`services/core-api/test/tokens-app.test.js` (mới):

`services/core-api/test/tokens-app.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, tokenFor, bearer, sha } from './helpers/app.js';
import { signIn } from './helpers/admin.js';

const APP = (id) =>
  `INSERT INTO apps (id, name, kind, return_url, api_key_hash) VALUES ('${id}', '${id}', 'web', 'https://${id}.example/done', 'h-${id}')`;

// Spec admin-console-p4b §2 "Users và token" (decision #4): POST /v1/tokens {name, roles, app_id?}; a token bound
// to an app is never admin (publisher/router only); the app goes to api_tokens.app_id and audit_log.app_id.
describe('POST /v1/tokens with app_id (spec admin-console-p4b)', () => {
  let db;
  let app;
  let boss;
  const q = async (sql, p) => (await db.pool.query(sql, p)).rows;

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    await q(APP('starlyn'));
    ({ app } = await makeApp(db.pool));
    boss = await signIn(db.pool, 'boss@ikameglobal.com', 'admin');
  });
  afterEach(() => app.close());

  const call = (payload, headers = boss.headers()) => app.inject({ method: 'POST', url: '/v1/tokens', headers, payload });

  it('stores and returns the app; the token then acts only in that app; audit carries app_id', async () => {
    const res = await call({ name: 'ci-starlyn', roles: ['publisher', 'router'], app_id: 'starlyn' });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body).toEqual({ name: 'ci-starlyn', roles: ['publisher', 'router'], app_id: 'starlyn', token: expect.stringMatching(/^ikf_[A-Za-z0-9_-]{43}$/) });
    expect(await q('SELECT name, roles, app_id, token_sha256 FROM api_tokens')).toEqual([
      { name: 'ci-starlyn', roles: ['publisher', 'router'], app_id: 'starlyn', token_sha256: sha(body.token) },
    ]);
    // an app-bound token is not global: the users list (global only) is 403
    expect((await app.inject({ method: 'GET', url: '/v1/admin/users', headers: bearer(body.token) })).statusCode).toBe(403);
    expect(await q('SELECT actor, action, target, details, app_id FROM audit_log')).toEqual([
      { actor: 'boss@ikameglobal.com', action: 'token.create', target: 'token:ci-starlyn', details: { name: 'ci-starlyn', roles: ['publisher', 'router'] }, app_id: 'starlyn' },
    ]);
  });

  it('without app_id: as before, app_id null', async () => {
    const res = await call({ name: 'ci', roles: ['publisher'] });
    expect(res.json()).toMatchObject({ name: 'ci', roles: ['publisher'], app_id: null });
    expect(await q('SELECT app_id FROM api_tokens')).toEqual([{ app_id: null }]);
    expect(await q('SELECT app_id FROM audit_log')).toEqual([{ app_id: null }]);
  });

  it('admin with an app → 400 invalid_roles; unknown app → 404 app_not_found; nothing stored or audited', async () => {
    const admin = await call({ name: 'x', roles: ['router', 'admin'], app_id: 'starlyn' });
    expect(admin.statusCode).toBe(400);
    expect(admin.json()).toEqual({ error: 'invalid_roles', detail: { allowed: ['publisher', 'router'] } });
    const unknown = await call({ name: 'x', roles: ['publisher'], app_id: 'nope' });
    expect(unknown.statusCode).toBe(404);
    expect(unknown.json()).toEqual({ error: 'app_not_found', detail: { app_id: 'nope' } });
    expect(await q('SELECT name FROM api_tokens')).toEqual([]);
    expect(await q('SELECT action FROM audit_log')).toEqual([]);
  });

  it('global only: an admin of one app and an app-bound admin-ish token get 403', async () => {
    const appAdmin = await signIn(db.pool, 'aa@ikameglobal.com', null, { apps: [{ app_id: 'starlyn', role: 'admin' }] });
    expect((await call({ name: 'x', roles: ['publisher'], app_id: 'starlyn' }, appAdmin.headers())).json()).toEqual({ error: 'forbidden' });
    const bound = await tokenFor(db.pool, 'router');
    await q("UPDATE api_tokens SET app_id = 'starlyn' WHERE name = 'router'");
    expect((await call({ name: 'x', roles: ['publisher'], app_id: 'starlyn' }, bearer(bound))).statusCode).toBe(403);
    // an admin token without app still creates tokens (ikf token create)
    expect((await call({ name: 'y', roles: ['publisher'], app_id: 'starlyn' }, bearer(await tokenFor(db.pool, 'admin')))).statusCode).toBe(201);
  });
});
```

`services/core-api/test/helpers/admin.js`, `services/core-api/test/users.test.js` (sửa, áp dụng đúng diff này):

`services/core-api/test/helpers/admin.js`, `services/core-api/test/users.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/test/helpers/admin.js b/services/core-api/test/helpers/admin.js
index 3497d5a..1c1cd17 100644
--- a/services/core-api/test/helpers/admin.js
+++ b/services/core-api/test/helpers/admin.js
@@ -3,12 +3,17 @@ import { createSession, SESSION_COOKIE } from '../../src/admin/sessions.js';
 export const ADMIN_ORIGIN = 'https://admin.ikf-staging.example';
 
 // An enabled person with this role and a fresh session: {id, cookie, csrf, headers(write?)}.
-export async function signIn(pool, email, role) {
+// global defaults to role === 'admin' (migration 008's backfill, spec admin-console-p4b §1); apps = [{app_id, role}]
+// rows in admin_user_apps.
+export async function signIn(pool, email, role, { global = role === 'admin', apps = [] } = {}) {
   const { rows } = await pool.query(
-    "INSERT INTO admin_users (email, name, role, created_by) VALUES ($1, $2, $3, 'test') RETURNING id",
-    [email, email.split('@')[0], role],
+    "INSERT INTO admin_users (email, name, role, global, created_by) VALUES ($1, $2, $3, $4, 'test') RETURNING id",
+    [email, email.split('@')[0], role, global],
   );
   const id = Number(rows[0].id);
+  for (const a of apps) {
+    await pool.query("INSERT INTO admin_user_apps (user_id, app_id, role, created_by) VALUES ($1, $2, $3, 'test')", [id, a.app_id, a.role]);
+  }
   const { token, csrf } = await createSession(pool, { userId: id });
   const cookie = `${SESSION_COOKIE}=${token}`;
   return { id, token, cookie, csrf, headers: (write = true) => ({ cookie, ...(write && { 'x-ikf-csrf': csrf }) }) };
diff --git a/services/core-api/test/users.test.js b/services/core-api/test/users.test.js
index f588117..0815a9a 100644
--- a/services/core-api/test/users.test.js
+++ b/services/core-api/test/users.test.js
@@ -26,7 +26,7 @@ describe('admin users API (spec admin-console-p1 §3)', () => {
     const res = await call('POST', '/v1/admin/users', { email: ' An.Nguyen@IkameGlobal.com ', name: 'An', role: 'editor' });
     expect(res.statusCode).toBe(201);
     expect(res.json()).toEqual({
-      id: 2, email: 'an.nguyen@ikameglobal.com', name: 'An', role: 'editor', disabled_at: null, created_by: 'boss@ikameglobal.com', created_at: expect.any(String),
+      id: 2, email: 'an.nguyen@ikameglobal.com', name: 'An', role: 'editor', global: false, disabled_at: null, apps: [], created_by: 'boss@ikameglobal.com', created_at: expect.any(String),
     });
     expect((await call('POST', '/v1/admin/users', { email: 'an.nguyen@ikameglobal.com', role: 'viewer' })).json()).toEqual({
       error: 'user_exists', detail: { email: 'an.nguyen@ikameglobal.com' },
@@ -38,7 +38,7 @@ describe('admin users API (spec admin-console-p1 §3)', () => {
     const list = (await call('GET', '/v1/admin/users')).json();
     expect(list.users.map((u) => [u.email, u.role])).toEqual([['an.nguyen@ikameglobal.com', 'editor'], ['boss@ikameglobal.com', 'admin']]);
     expect(await auditRows()).toEqual([
-      { actor: 'boss@ikameglobal.com', action: 'admin.user.create', target: 'user:an.nguyen@ikameglobal.com', details: { email: 'an.nguyen@ikameglobal.com', role: 'editor' } },
+      { actor: 'boss@ikameglobal.com', action: 'admin.user.create', target: 'user:an.nguyen@ikameglobal.com', details: { email: 'an.nguyen@ikameglobal.com', role: 'editor', global: false } },
     ]);
   });
 
@@ -51,9 +51,9 @@ describe('admin users API (spec admin-console-p1 §3)', () => {
     expect((await app.inject({ method: 'GET', url: '/v1/funnels', headers: an.headers(false) })).statusCode).toBe(401);
     expect((await call('PUT', `/v1/admin/users/${an.id}`, { disabled: false })).json().disabled_at).toBeNull();
     expect((await auditRows()).map((r) => [r.action, r.details])).toEqual([
-      ['admin.user.update', { email: 'an@ikameglobal.com', role: 'editor' }],
-      ['admin.user.disable', { email: 'an@ikameglobal.com', role: 'editor' }],
-      ['admin.user.update', { email: 'an@ikameglobal.com', role: 'editor', enabled: true }],
+      ['admin.user.update', { email: 'an@ikameglobal.com', role: 'editor', global: false }],
+      ['admin.user.disable', { email: 'an@ikameglobal.com', role: 'editor', global: false }],
+      ['admin.user.update', { email: 'an@ikameglobal.com', role: 'editor', global: false, enabled: true }],
     ]);
   });
 
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/users-apps.test.js test/tokens-app.test.js test/users.test.js
```

Expected: `Test Files  3 failed (3)`, `Tests  14 failed | 3 passed (17)`: 9/9 test của `users-apps` fail (body chưa có `global`/`apps`, route `/apps/:app_id` chưa có, `role` bắt buộc, chưa có `last_global_admin`, admin của một app vẫn qua `requireRole`…), 3/4 test của `tokens-app` fail (`app_id` chưa được lưu/trả, chưa chặn `admin` + app, chưa 404), 2 test của `users.test.js` fail (body/audit chưa có `global`). Qua sẵn: 2 test cũ của `users.test.js` và test "global only" của `tokens-app` (`requireRole('admin')` đã chặn).

- [ ] **Step 3: Implement**

`services/core-api/src/admin/users.js`, `services/core-api/src/http/users.js`, `services/core-api/src/http/tokens.js`, `services/core-api/src/auth.js` (sửa, áp dụng đúng diff này):

`services/core-api/src/admin/users.js`, `services/core-api/src/http/users.js`, `services/core-api/src/http/tokens.js`, `services/core-api/src/auth.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/admin/users.js b/services/core-api/src/admin/users.js
index 5f31ddc..577aaf3 100644
--- a/services/core-api/src/admin/users.js
+++ b/services/core-api/src/admin/users.js
@@ -1,70 +1,146 @@
-// admin_users: the people who may sign in to the admin console (spec admin-console-p1 §2, §3).
+// admin_users: the people who may sign in to the admin console (spec admin-console-p1 §2, §3), with the global flag
+// and per-app roles of admin_user_apps (spec admin-console-p4b §1, §2 "Users và token").
 import { audit } from '../audit.js';
 import { HttpError } from '../errors.js';
 import { withTx } from '../identity/link.js';
 import { ALLOWED_HD } from './google.js';
 
 const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
-const COLUMNS = 'id, email, name, role, disabled_at, created_by, created_at';
+
+// One row per person with their app roles (sorted by app) as a JSON array: the list and every single-person answer.
+const SELECT_USERS = `
+  SELECT u.id, u.email, u.name, u.role, u.global, u.disabled_at, u.created_by, u.created_at,
+         COALESCE(json_agg(json_build_object('app_id', ua.app_id, 'role', ua.role) ORDER BY ua.app_id)
+                  FILTER (WHERE ua.app_id IS NOT NULL), '[]') AS apps
+    FROM admin_users u
+    LEFT JOIN admin_user_apps ua ON ua.user_id = u.id`;
 
 const view = (r) => ({
   id: Number(r.id),
   email: r.email,
   name: r.name,
   role: r.role,
+  global: r.global,
   disabled_at: r.disabled_at ? r.disabled_at.toISOString() : null,
   created_by: r.created_by,
   created_at: r.created_at.toISOString(),
+  apps: r.apps,
 });
 
+const userView = async (db, id) => view((await db.query(`${SELECT_USERS} WHERE u.id = $1 GROUP BY u.id`, [id])).rows[0]);
+
 export async function listUsers(pool) {
-  const { rows } = await pool.query(`SELECT ${COLUMNS} FROM admin_users ORDER BY email`);
+  const { rows } = await pool.query(`${SELECT_USERS} GROUP BY u.id ORDER BY u.email`);
   return { users: rows.map(view) };
 }
 
-// Only company accounts: Google sign-in refuses any other hd anyway.
-export async function createUser(pool, { email, name = '', role }, actor) {
+// 404 app_not_found for the first id (in the caller's order) that is no app.
+async function requireApps(db, appIds) {
+  const known = new Set((await db.query('SELECT id FROM apps WHERE id = ANY($1)', [appIds])).rows.map((r) => r.id));
+  const missing = appIds.find((id) => !known.has(id));
+  if (missing !== undefined) throw new HttpError(404, 'app_not_found', { app_id: missing });
+}
+
+async function grantApp(c, user, appId, role, actor) {
+  await c.query(
+    `INSERT INTO admin_user_apps (user_id, app_id, role, created_by) VALUES ($1, $2, $3, $4)
+     ON CONFLICT (user_id, app_id) DO UPDATE SET role = EXCLUDED.role`,
+    [user.id, appId, role, actor.name],
+  );
+  await audit(c, actor, 'admin.user.app_grant', `user:${user.email}`, { email: user.email, app_id: appId, role }, { app_id: appId });
+}
+
+// Only company accounts: Google sign-in refuses any other hd anyway. role null = no default role (only the apps
+// listed); the person, the app rows and their audit rows commit together.
+export async function createUser(pool, { email, name = '', role = null, global = false, apps = [] }, actor) {
   const e = email.trim().toLowerCase();
   if (!EMAIL_RE.test(e) || !e.endsWith(`@${ALLOWED_HD}`)) throw new HttpError(400, 'invalid_email', { email: e, domain: ALLOWED_HD });
+  const appIds = apps.map((a) => a.app_id);
+  const dup = appIds.find((id, i) => appIds.indexOf(id) !== i);
+  if (dup !== undefined) throw new HttpError(400, 'duplicate_app', { app_id: dup });
   return withTx(pool, async (c) => {
+    await requireApps(c, appIds);
     const { rows } = await c.query(
-      `INSERT INTO admin_users (email, name, role, created_by) VALUES ($1, $2, $3, $4)
-       ON CONFLICT (email) DO NOTHING RETURNING ${COLUMNS}`,
-      [e, name.trim(), role, actor.name],
+      `INSERT INTO admin_users (email, name, role, global, created_by) VALUES ($1, $2, $3, $4, $5)
+       ON CONFLICT (email) DO NOTHING RETURNING id, email`,
+      [e, name.trim(), role, global, actor.name],
     );
     if (!rows.length) throw new HttpError(409, 'user_exists', { email: e });
-    await audit(c, actor, 'admin.user.create', `user:${e}`, { email: e, role });
-    return view(rows[0]);
+    const user = { id: rows[0].id, email: e };
+    await audit(c, actor, 'admin.user.create', `user:${e}`, { email: e, role, global });
+    for (const a of apps) await grantApp(c, user, a.app_id, a.role, actor);
+    return userView(c, user.id);
   });
 }
 
-// {role?, name?, disabled?}. Disabling ends the person's sessions at once. Nobody disables or demotes themselves.
-export async function updateUser(pool, id, { role, name, disabled }, actor) {
-  if (actor.kind === 'user' && actor.userId === id && (disabled === true || (role !== undefined && role !== 'admin'))) {
+// Spec admin-console-p4b §1: at least one enabled global person must remain (409 last_global_admin). Every active
+// global row is locked first, in id order, so two concurrent changes cannot each remove "the other" global.
+const lockGlobals = (c) => c.query('SELECT id FROM admin_users WHERE global AND disabled_at IS NULL ORDER BY id FOR UPDATE');
+
+// {role? (null = no default role), name?, disabled?, global?}. Disabling ends the person's sessions at once. Nobody
+// locks themselves out: no disabling, demoting or un-globaling yourself (p1 rule, extended to global in p4b §1).
+export async function updateUser(pool, id, { role, name, disabled, global }, actor) {
+  if (actor.kind === 'user' && actor.userId === id && (disabled === true || global === false || (role !== undefined && role !== 'admin'))) {
     throw new HttpError(409, 'cannot_lock_self');
   }
   return withTx(pool, async (c) => {
-    const cur = (await c.query(`SELECT ${COLUMNS} FROM admin_users WHERE id = $1 FOR UPDATE`, [id])).rows[0];
+    await lockGlobals(c);
+    const cur = (await c.query('SELECT email, global, disabled_at FROM admin_users WHERE id = $1 FOR UPDATE', [id])).rows[0];
     if (!cur) throw new HttpError(404, 'user_not_found', { id });
     const { rows } = await c.query(
-      `UPDATE admin_users SET role = COALESCE($2, role), name = COALESCE($3, name),
+      `UPDATE admin_users SET role = CASE WHEN $5 THEN $2 ELSE role END, name = COALESCE($3, name),
+              global = COALESCE($6, global),
               disabled_at = CASE WHEN $4::boolean IS NULL THEN disabled_at WHEN $4 THEN COALESCE(disabled_at, now()) ELSE NULL END
-        WHERE id = $1 RETURNING ${COLUMNS}`,
-      [id, role ?? null, name?.trim() ?? null, disabled ?? null],
+        WHERE id = $1 RETURNING email, role, global, disabled_at`,
+      [id, role ?? null, name?.trim() ?? null, disabled ?? null, role !== undefined, global ?? null],
     );
     const u = rows[0];
+    const wasActiveGlobal = cur.global && !cur.disabled_at;
+    if (wasActiveGlobal && (!u.global || u.disabled_at)) {
+      const left = (await c.query('SELECT count(*)::int AS n FROM admin_users WHERE global AND disabled_at IS NULL')).rows[0].n;
+      if (left === 0) throw new HttpError(409, 'last_global_admin');
+    }
     if (disabled === true) await c.query('DELETE FROM admin_sessions WHERE user_id = $1', [id]);
     const action = disabled === true && !cur.disabled_at ? 'admin.user.disable' : 'admin.user.update';
-    await audit(c, actor, action, `user:${u.email}`, { email: u.email, role: u.role, ...(disabled === false && cur.disabled_at && { enabled: true }) });
-    return view(u);
+    await audit(c, actor, action, `user:${u.email}`, {
+      email: u.email, role: u.role, global: u.global, ...(disabled === false && cur.disabled_at && { enabled: true }),
+    });
+    return userView(c, id);
+  });
+}
+
+const lockUser = async (c, id) => {
+  const u = (await c.query('SELECT id, email FROM admin_users WHERE id = $1 FOR UPDATE', [id])).rows[0];
+  if (!u) throw new HttpError(404, 'user_not_found', { id });
+  return u;
+};
+
+// PUT /v1/admin/users/:id/apps/:app_id {role}: set (insert or change) the person's role in one app.
+export async function setUserApp(pool, id, appId, role, actor) {
+  return withTx(pool, async (c) => {
+    const u = await lockUser(c, id);
+    await requireApps(c, [appId]);
+    await grantApp(c, u, appId, role, actor);
+    return userView(c, id);
+  });
+}
+
+// DELETE /v1/admin/users/:id/apps/:app_id: the person falls back to their default role in that app.
+export async function removeUserApp(pool, id, appId, actor) {
+  return withTx(pool, async (c) => {
+    const u = await lockUser(c, id);
+    const { rowCount } = await c.query('DELETE FROM admin_user_apps WHERE user_id = $1 AND app_id = $2', [id, appId]);
+    if (!rowCount) throw new HttpError(404, 'user_app_not_found', { id, app_id: appId });
+    await audit(c, actor, 'admin.user.app_revoke', `user:${u.email}`, { email: u.email, app_id: appId }, { app_id: appId });
+    return userView(c, id);
   });
 }
 
-// The local demo's --admin-user (APP_ENV=local only): an enabled admin, created on first use.
+// The local demo's --admin-user (APP_ENV=local only): an enabled global admin, created on first use.
 export async function ensureLocalAdmin(db, email) {
   const { rows } = await db.query(
-    `INSERT INTO admin_users (email, name, role, created_by) VALUES ($1, 'Local admin', 'admin', 'local')
-     ON CONFLICT (email) DO UPDATE SET role = 'admin', disabled_at = NULL
+    `INSERT INTO admin_users (email, name, role, global, created_by) VALUES ($1, 'Local admin', 'admin', true, 'local')
+     ON CONFLICT (email) DO UPDATE SET role = 'admin', global = true, disabled_at = NULL
      RETURNING id, email, name, role`,
     [email.trim().toLowerCase()],
   );
diff --git a/services/core-api/src/auth.js b/services/core-api/src/auth.js
index 9ca7f20..203f2b3 100644
--- a/services/core-api/src/auth.js
+++ b/services/core-api/src/auth.js
@@ -22,9 +22,10 @@ const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
 
 const sha256 = (s) => createHash('sha256').update(s).digest('hex');
 
-export async function createToken(pool, { name, roles }) {
+// appId (spec admin-console-p4b §2): api_tokens.app_id, the one app the token acts in; null = no app (as before).
+export async function createToken(pool, { name, roles, appId = null }) {
   const token = `ikf_${randomBytes(32).toString('base64url')}`;
-  await pool.query('INSERT INTO api_tokens (name, token_sha256, roles) VALUES ($1, $2, $3)', [name, sha256(token), roles]);
+  await pool.query('INSERT INTO api_tokens (name, token_sha256, roles, app_id) VALUES ($1, $2, $3, $4)', [name, sha256(token), roles, appId]);
   return token;
 }
 
diff --git a/services/core-api/src/http/tokens.js b/services/core-api/src/http/tokens.js
index fb7eec2..2e6dff5 100644
--- a/services/core-api/src/http/tokens.js
+++ b/services/core-api/src/http/tokens.js
@@ -1,12 +1,18 @@
 import { audit } from '../audit.js';
-import { ROLES, createToken, requireRole } from '../auth.js';
+import { ROLES, createToken, requireGrant } from '../auth.js';
 import { HttpError } from '../errors.js';
+import { withTx } from '../identity/link.js';
+
+// Spec admin-console-p4b decision #4: a token bound to an app acts only in that app, so it never holds the
+// global-only `admin` role.
+const APP_TOKEN_ROLES = ['publisher', 'router'];
 
 export default async function tokensHttp(app, { pool }) {
   app.post(
     '/v1/tokens',
     {
-      onRequest: requireRole(pool, 'admin'),
+      // Spec admin-console-p4b §2 route table: tokens are global only.
+      onRequest: requireGrant(pool, 'admin', { app: 'global' }),
       schema: {
         body: {
           type: 'object',
@@ -14,17 +20,25 @@ export default async function tokensHttp(app, { pool }) {
           properties: {
             name: { type: 'string', minLength: 1, maxLength: 64 },
             roles: { type: 'array', minItems: 1, items: { type: 'string' } },
+            app_id: { type: 'string', minLength: 1, maxLength: 64 },
           },
         },
       },
     },
     async (req, reply) => {
-      const { name, roles } = req.body;
+      const { name, roles, app_id: appId = null } = req.body;
       if (!roles.every((r) => ROLES.includes(r))) throw new HttpError(400, 'invalid_roles', { allowed: ROLES });
-      const token = await createToken(pool, { name, roles });
-      await audit(pool, req.actor, 'token.create', `token:${name}`, { name, roles });
+      if (appId !== null && !roles.every((r) => APP_TOKEN_ROLES.includes(r))) throw new HttpError(400, 'invalid_roles', { allowed: APP_TOKEN_ROLES });
+      const token = await withTx(pool, async (c) => {
+        if (appId !== null && !(await c.query('SELECT 1 FROM apps WHERE id = $1', [appId])).rows.length) {
+          throw new HttpError(404, 'app_not_found', { app_id: appId });
+        }
+        const t = await createToken(c, { name, roles, appId });
+        await audit(c, req.actor, 'token.create', `token:${name}`, { name, roles }, { app_id: appId });
+        return t;
+      });
       reply.code(201);
-      return { name, roles, token };
+      return { name, roles, app_id: appId, token };
     },
   );
 }
diff --git a/services/core-api/src/http/users.js b/services/core-api/src/http/users.js
index 496f17d..8dd40b5 100644
--- a/services/core-api/src/http/users.js
+++ b/services/core-api/src/http/users.js
@@ -1,22 +1,37 @@
-import { requireRole, USER_ROLES } from '../auth.js';
-import { createUser, listUsers, updateUser } from '../admin/users.js';
+import { requireGrant, USER_ROLES } from '../auth.js';
+import { createUser, listUsers, removeUserApp, setUserApp, updateUser } from '../admin/users.js';
 
-// Settings → Users (spec admin-console-p1 §3, §5): admins only; `ikf admin` calls it with an admin token.
+// Settings → Users (spec admin-console-p1 §3, §5): global callers only (spec admin-console-p4b §2 route table);
+// `ikf admin` calls it with an admin token.
 export default async function usersHttp(app, { pool }) {
-  const admin = requireRole(pool, 'admin');
+  const global = requireGrant(pool, 'admin', { app: 'global' });
   const role = { type: 'string', enum: USER_ROLES };
+  // Spec admin-console-p4b §1: a NULL default role = no app outside the person's own app rows.
+  const defaultRole = { type: ['string', 'null'], enum: [...USER_ROLES, null] };
   const name = { type: 'string', maxLength: 200 };
+  const appId = { type: 'string', minLength: 1, maxLength: 64 };
+  const id = { type: 'integer', minimum: 1 };
+  const appParams = { type: 'object', required: ['id', 'app_id'], properties: { id, app_id: appId } };
 
-  app.get('/v1/admin/users', { onRequest: admin }, async () => listUsers(pool));
+  app.get('/v1/admin/users', { onRequest: global }, async () => listUsers(pool));
 
   app.post(
     '/v1/admin/users',
     {
-      onRequest: admin,
+      onRequest: global,
       schema: {
         body: {
-          type: 'object', required: ['email', 'role'], additionalProperties: false,
-          properties: { email: { type: 'string', minLength: 3, maxLength: 254 }, name, role },
+          type: 'object', required: ['email'], additionalProperties: false,
+          properties: {
+            email: { type: 'string', minLength: 3, maxLength: 254 },
+            name,
+            role: defaultRole,
+            global: { type: 'boolean' },
+            apps: {
+              type: 'array', maxItems: 100,
+              items: { type: 'object', required: ['app_id', 'role'], additionalProperties: false, properties: { app_id: appId, role } },
+            },
+          },
         },
       },
     },
@@ -29,12 +44,33 @@ export default async function usersHttp(app, { pool }) {
   app.put(
     '/v1/admin/users/:id',
     {
-      onRequest: admin,
+      onRequest: global,
       schema: {
-        params: { type: 'object', required: ['id'], properties: { id: { type: 'integer', minimum: 1 } } },
-        body: { type: 'object', minProperties: 1, additionalProperties: false, properties: { role, name, disabled: { type: 'boolean' } } },
+        params: { type: 'object', required: ['id'], properties: { id } },
+        body: {
+          type: 'object', minProperties: 1, additionalProperties: false,
+          properties: { role: defaultRole, name, disabled: { type: 'boolean' }, global: { type: 'boolean' } },
+        },
       },
     },
     async (req) => updateUser(pool, req.params.id, req.body, req.actor),
   );
+
+  app.put(
+    '/v1/admin/users/:id/apps/:app_id',
+    {
+      onRequest: global,
+      schema: {
+        params: appParams,
+        body: { type: 'object', required: ['role'], additionalProperties: false, properties: { role } },
+      },
+    },
+    async (req) => setUserApp(pool, req.params.id, req.params.app_id, req.body.role, req.actor),
+  );
+
+  app.delete(
+    '/v1/admin/users/:id/apps/:app_id',
+    { onRequest: global, schema: { params: appParams } },
+    async (req) => removeUserApp(pool, req.params.id, req.params.app_id, req.actor),
+  );
 }
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/users-apps.test.js test/tokens-app.test.js test/users.test.js
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  17 passed (17)`; toàn bộ core-api `Test Files  71 passed (71)`, `Tests  666 passed (666)`.

- [ ] **Step 5: Commit**

```bash
git add services/core-api/src/admin/users.js services/core-api/src/auth.js services/core-api/src/http/tokens.js services/core-api/src/http/users.js services/core-api/test/helpers/admin.js services/core-api/test/users.test.js services/core-api/test/tokens-app.test.js services/core-api/test/users-apps.test.js
git commit -m "feat(core-api): users with global flag and per-app roles; tokens scoped to an app
```

---

---

### Task 4: Áp phạm vi cho apps, funnels, versions, prices, analytics + lọc danh sách

**Files:**
- Create: `services/core-api/test/scope-routes-a.test.js`
- Modify: `services/core-api/src/auth.js` (`requireGrant` nhận danh sách grant, `notFound`, dùng lại `req.scope`; GET bị từ chối → 404 khi không thấy app, 403 khi thấy app nhưng thiếu grant; export `hasGrant`), `services/core-api/src/admin/scope.js` (thêm `defaultGrants`), `services/core-api/src/admin/resolve.js` (thêm `funnelNotFound`), `services/core-api/src/http/apps.js`, `services/core-api/src/http/catalog.js`, `services/core-api/src/http/funnels.js`, `services/core-api/src/http/versions.js`, `services/core-api/src/http/prices.js`, `services/core-api/src/http/analytics.js`, `services/core-api/src/analytics/service.js` (`overview({..., appIds})`)
- Test: `services/core-api/test/scope-routes-a.test.js` (mới), `services/core-api/test/require-grant.test.js` (sửa một test: đổi route minh hoạ `requireRole` từ `/v1/funnels` sang `/v1/domains`)

**Interfaces:**
- Consumes: `loadScope`, `isGlobalGrant` (`src/admin/scope.js`, Task 1); `requireGrant(pool, grant, { app })`, `appOfFunnel`, `appOfApp` (Task 2); `signIn(pool, email, role, {global, apps})` (Task 3); `api_tokens.app_id` (Task 3).
- Produces:
  - `requireGrant(pool, grant | grant[], { app = 'global', notFound = (req) => ({error:'not_found'}) })` — `grant` có thể là danh sách (đủ một trong số đó, như `requireRole`); nếu `req.scope` đã có (hook trước đó cùng request) thì không xác thực lại; `app: 'any'` cũng đạt khi role mặc định có grant (kể cả khi chưa có app nào); resolver trả `null` → đạt khi global hoặc role mặc định có grant; GET/HEAD bị từ chối → `404 notFound(req)` khi người gọi không có `viewer` trong app đó, ngược lại `403 forbidden`; ghi bị từ chối → `403 forbidden`.
  - `hasGrant(scope, grant | grant[], appId | null)` → bool (`null` = tài nguyên không thuộc app: `globalGrants` hoặc `defaultGrants`). `hasGrant(scope, 'viewer', null)` = người gọi thấy mọi app + funnel chưa gán (danh sách không lọc).
  - `scope.defaultGrants`: người global → grants admin; người không global → grants của `admin_users.role` (NULL → `[]`); token không app → grants của token; token có app → `[]`.
  - `funnelNotFound(req)` → `{error:'funnel_not_found', detail:{funnel: req.params.slug}}` (`src/admin/resolve.js`).
  - `analyticsService().overview({from, to, app?, appIds?})` — `appIds` giới hạn tập slug (không gồm funnel chưa gán) cho cả ClickHouse và tiền; khoá cache gồm `appIds`.
  - Bảng route: `GET /v1/apps` (`any` viewer, lọc), `POST /v1/apps` (global `router`), `GET /v1/apps/:id` + `/summary` (viewer trong `:id`), `/plans` (`prices:read`), `PUT /v1/apps/:id`, rotate-key, webhook resend (`router`), `GET …/webhooks` (`apps:read`, resolver là chính `:id`); `GET /v1/funnels` (`any` viewer, lọc; `?app=none` rỗng với người bị giới hạn app), `POST /v1/funnels` (onRequest `any` publisher + preHandler `publisher` trong body `app_id`), `GET /v1/funnels/:slug` (viewer trong app của funnel), `POST /v1/funnels/:slug/versions` (onRequest `any` + preHandler: app của funnel, slug mới → body `app_id`), `PUT /v1/funnels/:slug` (`['router','editor']` trong app hiện tại; `app_id` mới → handler kiểm thêm, `403 forbidden`), `GET/PUT /v1/funnels/:slug/prices` (`prices:read` / `router` trong app của funnel), `GET /v1/paddle/prices` (`any` `prices:read`), analytics `funnels/:slug[/breakdown]` (viewer trong app của funnel, 404 `{error:'funnel_not_found'}`), `overview` (`any` viewer; `?app=` ngoài phạm vi → `404 app_not_found {app_id}`; không `?app=` → `appIds` khi người gọi bị giới hạn app).

- [ ] **Step 1: Viết test fail**

`services/core-api/test/scope-routes-a.test.js` (mới):

`services/core-api/test/scope-routes-a.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, tokenFor, bearer, sha } from './helpers/app.js';
import { signIn } from './helpers/admin.js';
import { APP_BODY, fakeSecrets } from './helpers/identity.js';
import { fakePaddle, PRICE_W1 } from './helpers/paddle.js';
import { funnelHtml } from './helpers/pages.js';

// Web apps (lint has no app-only rule for them), complete enough for PUT /v1/apps/:id to accept an edit.
const APP = (id, name) =>
  `INSERT INTO apps (id, name, kind, return_url, webhook_url, api_key_hash)
   VALUES ('${id}', '${name}', 'web', 'https://${id}.example/done', 'https://${id}.example/hook', 'h-${id}')`;
const RANGE = 'from=2026-10-08T08:00:00Z&to=2026-10-08T12:00:00Z';
const NOW = Date.UTC(2026, 9, 8, 12);
const EVENT = '01JA0000000000000000000E01';

// ClickHouse stays out of this file: a stub reader that answers every query with no rows, except the overview's
// event query, which answers one row per funnel it is asked for (every funnel when no slug list is passed). The
// calls are kept so a test can see which slugs reached ClickHouse.
function stubClickhouse() {
  const calls = [];
  return {
    calls,
    async query(sql, params = {}) {
      calls.push({ sql, params });
      if (!/GROUP BY funnel ORDER BY sessions/.test(sql)) return [];
      return ['chat', 'loose', 'star'].filter((s) => !params.slugs || params.slugs.includes(s)).map((slug) => ({ slug, sessions: 1, leads: 0 }));
    },
  };
}

// Spec admin-console-p4b §2 "Bảng route" (apps, funnels, versions, prices, analytics, paddle prices) and decisions
// #5, #6: three kinds of people (global; admin of starlyn only; viewer of starlyn only) plus a publisher token bound
// to starlyn, against two apps (starlyn, chatchi) and an unassigned funnel. Out of scope: GET 404, write 403;
// global-only routes: 403; lists hold only what is in scope.
describe('per-app scope on apps, funnels, versions, prices, analytics (spec admin-console-p4b §2)', () => {
  let db;
  let app;
  let ch;
  let who;
  const q = async (sql, p) => (await db.pool.query(sql, p)).rows;

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    await q(APP('starlyn', 'Starlyn'));
    await q(APP('chatchi', 'ChatChi'));
    await q("INSERT INTO funnels (slug, app_id, created_by) VALUES ('star', 'starlyn', 't'), ('chat', 'chatchi', 't'), ('loose', NULL, 't')");
    const paddle = fakePaddle();
    paddle.price(PRICE_W1);
    ch = stubClickhouse();
    ({ app } = await makeApp(db.pool, { webhookSecrets: fakeSecrets(), paddle, clickhouse: ch, now: () => NOW }));
    const g = await signIn(db.pool, 'g@ikameglobal.com', 'admin');
    const a = await signIn(db.pool, 'a@ikameglobal.com', null, { apps: [{ app_id: 'starlyn', role: 'admin' }] });
    const v = await signIn(db.pool, 'v@ikameglobal.com', null, { apps: [{ app_id: 'starlyn', role: 'viewer' }] });
    const token = await tokenFor(db.pool, 'publisher');
    await q("UPDATE api_tokens SET app_id = 'starlyn' WHERE name = 'publisher'");
    who = { g: g.headers, a: a.headers, v: v.headers, pub: () => bearer(token) };
  });
  afterEach(() => app.close());

  const call = (k, method, url, payload) => app.inject({ method, url, headers: who[k](method !== 'GET'), ...(payload !== undefined && { payload }) });
  // Status per caller in the order g, a, v, pub. payload may be a function of the caller (unique slugs, markers).
  const codes = async (method, url, payload) => {
    const out = [];
    for (const k of ['g', 'a', 'v', 'pub']) out.push((await call(k, method, url, typeof payload === 'function' ? payload(k) : payload)).statusCode);
    return out;
  };
  // Same, callers in the order v, pub, a, g: a write the global person must see succeed after the others failed.
  const codesLastG = async (method, url, payload) => {
    const out = {};
    for (const k of ['v', 'pub', 'a', 'g']) out[k] = (await call(k, method, url, typeof payload === 'function' ? payload(k) : payload)).statusCode;
    return [out.g, out.a, out.v, out.pub];
  };
  const upload = (slug, extra = {}) => (k) => {
    const html = funnelHtml(slug, k);
    return { html, sha256: sha(html), ...extra };
  };

  describe('apps', () => {
    it('GET /v1/apps: any viewer; only the apps in scope (global: all)', async () => {
      const ids = async (k) => (await call(k, 'GET', '/v1/apps')).json().apps.map((x) => x.id);
      expect(await ids('g')).toEqual(['chatchi', 'starlyn']);
      for (const k of ['a', 'v', 'pub']) expect(await ids(k), k).toEqual(['starlyn']);
    });

    it('POST /v1/apps: global only', async () => {
      expect(await codesLastG('POST', '/v1/apps', { ...APP_BODY, id: 'fresh' })).toEqual([201, 403, 403, 403]);
    });

    it('GET /v1/apps/:id and /summary: viewer in :id; out of scope 404', async () => {
      for (const sub of ['', '/summary']) {
        expect(await codes('GET', `/v1/apps/starlyn${sub}`), sub).toEqual([200, 200, 200, 200]);
        expect(await codes('GET', `/v1/apps/chatchi${sub}`), sub).toEqual([200, 404, 404, 404]);
      }
    });

    it('GET /v1/apps/:id/plans: prices:read in :id; a viewer of the app → 403 (it sees the app), out of scope → 404', async () => {
      expect(await codes('GET', '/v1/apps/starlyn/plans')).toEqual([200, 200, 403, 200]);
      expect(await codes('GET', '/v1/apps/chatchi/plans')).toEqual([200, 404, 404, 404]);
    });

    it('PUT /v1/apps/:id and rotate-key: router in :id', async () => {
      expect(await codes('PUT', '/v1/apps/starlyn', { name: 'S' })).toEqual([200, 200, 403, 403]);
      expect(await codes('PUT', '/v1/apps/chatchi', { name: 'C' })).toEqual([200, 403, 403, 403]);
      expect(await codes('POST', '/v1/apps/starlyn/rotate-key', { force: true })).toEqual([200, 200, 403, 403]);
      expect(await codes('POST', '/v1/apps/chatchi/rotate-key', { force: true })).toEqual([200, 403, 403, 403]);
    });

    it('GET …/webhooks: apps:read in :id (403 when the app is visible, 404 out of scope); resend: router in :id (no such delivery → the handler\'s 404)', async () => {
      expect(await codes('GET', '/v1/apps/starlyn/webhooks')).toEqual([200, 200, 403, 403]);
      expect(await codes('GET', '/v1/apps/chatchi/webhooks')).toEqual([200, 404, 404, 404]);
      expect(await codes('POST', `/v1/apps/starlyn/webhooks/${EVENT}/resend`)).toEqual([404, 404, 403, 403]);
      expect(await codes('POST', `/v1/apps/chatchi/webhooks/${EVENT}/resend`)).toEqual([404, 403, 403, 403]);
    });

    it('ruling B4: out of scope answers the same body as a missing app (app_not_found)', async () => {
      for (const sub of ['', '/summary', '/plans', '/webhooks']) {
        const out = await call('a', 'GET', `/v1/apps/chatchi${sub}`);
        const missing = await call('g', 'GET', `/v1/apps/ghost${sub}`);
        if (sub === '/webhooks') {
          // an unknown app has no deliveries (200, as before) for a global caller; out of scope it is app_not_found
          expect(missing.statusCode, sub).toBe(200);
          expect([out.statusCode, out.json()], sub).toEqual([404, { error: 'app_not_found', detail: { app_id: 'chatchi' } }]);
          // and for the scoped person a missing app looks the same as one out of scope
          const own = await call('a', 'GET', '/v1/apps/ghost/webhooks');
          expect([own.statusCode, own.json()]).toEqual([404, { error: 'app_not_found', detail: { app_id: 'ghost' } }]);
          continue;
        }
        expect(missing.statusCode, sub).toBe(404);
        expect(out.statusCode, sub).toBe(404);
        expect(out.json(), sub).toEqual({ ...missing.json(), detail: { app_id: 'chatchi' } });
        expect(missing.json(), sub).toEqual({ error: 'app_not_found', detail: { app_id: 'ghost' } });
      }
    });
  });

  describe('funnels and versions', () => {
    it('GET /v1/funnels: any viewer; filtered to scope; ?app=none and an app out of scope → empty for non-global', async () => {
      const slugs = async (k, query = '') => (await call(k, 'GET', `/v1/funnels${query}`)).json().funnels.map((f) => f.slug).sort();
      expect(await slugs('g')).toEqual(['chat', 'loose', 'star']);
      expect(await slugs('g', '?app=none')).toEqual(['loose']);
      expect(await slugs('g', '?app=chatchi')).toEqual(['chat']);
      for (const k of ['a', 'v', 'pub']) {
        expect(await slugs(k), k).toEqual(['star']);
        expect(await slugs(k, '?app=starlyn'), k).toEqual(['star']);
        expect(await slugs(k, '?app=none'), k).toEqual([]);
        expect(await slugs(k, '?app=chatchi'), k).toEqual([]);
      }
    });

    it('POST /v1/funnels: publisher in the body app_id; no app_id → 400 app_required as before', async () => {
      expect(await codes('POST', '/v1/funnels', (k) => ({ slug: `s-${k}`, app_id: 'starlyn' }))).toEqual([201, 201, 403, 201]);
      expect(await codes('POST', '/v1/funnels', (k) => ({ slug: `c-${k}`, app_id: 'chatchi' }))).toEqual([201, 403, 403, 403]);
      const res = await call('a', 'POST', '/v1/funnels', { slug: 'no-app' });
      expect([res.statusCode, res.json().error]).toEqual([400, 'app_required']);
      expect((await q("SELECT slug FROM funnels WHERE slug LIKE '%-%' ORDER BY slug")).map((r) => r.slug)).toEqual(['c-g', 's-a', 's-g', 's-pub']);
    });

    it('GET /v1/funnels/:slug: viewer in the funnel\'s app; unassigned → global only; same body as a missing funnel', async () => {
      expect(await codes('GET', '/v1/funnels/star')).toEqual([200, 200, 200, 200]);
      expect(await codes('GET', '/v1/funnels/chat')).toEqual([200, 404, 404, 404]);
      expect(await codes('GET', '/v1/funnels/loose')).toEqual([200, 404, 404, 404]);
      const out = await call('a', 'GET', '/v1/funnels/chat');
      const missing = await call('g', 'GET', '/v1/funnels/ghost');
      expect(missing.json()).toEqual({ error: 'funnel_not_found', detail: { funnel: 'ghost' } });
      expect(out.json()).toEqual({ ...missing.json(), detail: { funnel: 'chat' } });
    });

    it('POST /v1/funnels/:slug/versions: publisher in the funnel\'s app; a new slug → the body app_id', async () => {
      expect(await codes('POST', '/v1/funnels/star/versions', upload('star'))).toEqual([201, 201, 403, 201]);
      expect(await codes('POST', '/v1/funnels/chat/versions', upload('chat'))).toEqual([201, 403, 403, 403]);
      expect(await codes('POST', '/v1/funnels/loose/versions', upload('loose'))).toEqual([201, 403, 403, 403]);
      expect(await codes('POST', '/v1/funnels/brand-new/versions', upload('brand-new', { app_id: 'chatchi' }))).toEqual([201, 403, 403, 403]);
      const fresh = await call('a', 'POST', '/v1/funnels/fresh-a/versions', upload('fresh-a', { app_id: 'starlyn' })('a'));
      expect(fresh.statusCode).toBe(201);
      const none = await call('a', 'POST', '/v1/funnels/fresh-b/versions', upload('fresh-b')('a'));
      expect([none.statusCode, none.json().error]).toEqual([400, 'app_required']);
    });

    it('PUT /v1/funnels/:slug: publisher in the current app; moving to another app also needs it there', async () => {
      expect(await codes('PUT', '/v1/funnels/star', { pixel_id: '123456' })).toEqual([200, 200, 403, 403]);
      expect(await codes('PUT', '/v1/funnels/chat', { pixel_id: '123456' })).toEqual([200, 403, 403, 403]);
      const move = await call('a', 'PUT', '/v1/funnels/star', { app_id: 'chatchi' });
      expect([move.statusCode, move.json()]).toEqual([403, { error: 'forbidden' }]);
      expect(await q("SELECT app_id FROM funnels WHERE slug = 'star'")).toEqual([{ app_id: 'starlyn' }]);
      // the same app is fine; the global person moves it
      expect((await call('a', 'PUT', '/v1/funnels/star', { app_id: 'starlyn' })).statusCode).toBe(200);
      expect((await call('g', 'PUT', '/v1/funnels/star', { app_id: 'chatchi' })).statusCode).toBe(200);
      expect(await q("SELECT app_id FROM funnels WHERE slug = 'star'")).toEqual([{ app_id: 'chatchi' }]);
    });
  });

  describe('prices', () => {
    it('GET/PUT /v1/funnels/:slug/prices: prices:read / router in the funnel\'s app (a viewer of it → 403, out of scope → 404)', async () => {
      expect(await codes('GET', '/v1/funnels/star/prices')).toEqual([200, 200, 403, 200]);
      expect(await codes('GET', '/v1/funnels/chat/prices')).toEqual([200, 404, 404, 404]);
      const plans = { plans: { '1w': { price_id: PRICE_W1 } } };
      expect(await codes('PUT', '/v1/funnels/star/prices', plans)).toEqual([200, 200, 403, 403]);
      expect(await codes('PUT', '/v1/funnels/chat/prices', plans)).toEqual([200, 403, 403, 403]);
    });

    it('GET /v1/paddle/prices: prices:read in any app', async () => {
      expect(await codes('GET', '/v1/paddle/prices')).toEqual([200, 200, 403, 200]);
    });
  });

  describe('a person with a default role (spec §1: existing people keep today\'s reach)', () => {
    it('default editor, no rows: every app and the unassigned funnels, as before 008; still no router anywhere', async () => {
      const ed = await signIn(db.pool, 'ed@ikameglobal.com', 'editor');
      const get = async (url) => (await app.inject({ method: 'GET', url, headers: ed.headers(false) })).statusCode;
      const list = (await app.inject({ method: 'GET', url: '/v1/funnels', headers: ed.headers(false) })).json().funnels.map((f) => f.slug).sort();
      expect(list).toEqual(['chat', 'loose', 'star']);
      expect([await get('/v1/funnels/loose'), await get('/v1/funnels/chat'), await get('/v1/apps/chatchi'), await get('/v1/funnels/loose/prices')]).toEqual([200, 200, 200, 200]);
      const put = await app.inject({ method: 'PUT', url: '/v1/apps/chatchi', headers: ed.headers(), payload: { name: 'C' } });
      expect(put.statusCode).toBe(403);
    });

    it('a per-app row overrides the default role in that app only', async () => {
      const p = await signIn(db.pool, 'p@ikameglobal.com', 'viewer', { apps: [{ app_id: 'chatchi', role: 'editor' }] });
      const pixel = (slug) => app.inject({ method: 'PUT', url: `/v1/funnels/${slug}`, headers: p.headers(), payload: { pixel_id: '123456' } });
      expect([(await pixel('chat')).statusCode, (await pixel('star')).statusCode, (await pixel('loose')).statusCode]).toEqual([200, 403, 403]);
    });
  });

  describe('analytics', () => {
    it('funnels/:slug and breakdown: viewer in the funnel\'s app; out of scope = a missing funnel', async () => {
      for (const sub of ['', '/breakdown']) {
        const qs = `?${RANGE}${sub ? '&dim=country' : ''}`;
        expect(await codes('GET', `/v1/analytics/funnels/star${sub}${qs}`), sub).toEqual([200, 200, 200, 200]);
        expect(await codes('GET', `/v1/analytics/funnels/chat${sub}${qs}`), sub).toEqual([200, 404, 404, 404]);
        expect(await codes('GET', `/v1/analytics/funnels/loose${sub}${qs}`), sub).toEqual([200, 404, 404, 404]);
        const out = await call('v', 'GET', `/v1/analytics/funnels/chat${sub}${qs}`);
        const missing = await call('g', 'GET', `/v1/analytics/funnels/ghost${sub}${qs}`);
        expect([missing.statusCode, missing.json()], sub).toEqual([404, { error: 'funnel_not_found' }]);
        expect(out.json(), sub).toEqual(missing.json());
      }
    });

    it('overview: any viewer; without ?app= only funnels in scope reach ClickHouse and the answer; global unchanged', async () => {
      const slugs = async (k) => (await call(k, 'GET', `/v1/analytics/overview?${RANGE}`)).json().funnels.map((f) => f.slug).sort();
      expect(await slugs('g')).toEqual(['chat', 'loose', 'star']);
      expect(ch.calls.at(-1).params.slugs).toBeUndefined();
      for (const k of ['a', 'v', 'pub']) {
        expect(await slugs(k), k).toEqual(['star']);
        expect(ch.calls.at(-1).params.slugs, k).toEqual(['star']);
      }
    });

    it('overview ?app=: viewer in that app, else the same 404 as an unknown app', async () => {
      expect(await codes('GET', `/v1/analytics/overview?${RANGE}&app=starlyn`)).toEqual([200, 200, 200, 200]);
      expect(await codes('GET', `/v1/analytics/overview?${RANGE}&app=chatchi`)).toEqual([200, 404, 404, 404]);
      const out = await call('v', 'GET', `/v1/analytics/overview?${RANGE}&app=chatchi`);
      expect(out.json()).toEqual({ error: 'app_not_found', detail: { app_id: 'chatchi' } });
      const missing = await call('g', 'GET', `/v1/analytics/overview?${RANGE}&app=ghost`);
      expect(missing.json()).toEqual({ error: 'app_not_found', detail: { app_id: 'ghost' } });
    });
  });
});
```

`services/core-api/test/require-grant.test.js` (sửa, áp dụng đúng diff này) — test "requireRole còn dùng cho route chưa chuyển" đang minh hoạ bằng `GET /v1/funnels`, route mà task này chuyển sang `requireGrant`; đổi sang `GET /v1/domains` (vẫn `requireRole` tới Task 5), ý nghĩa test giữ nguyên:

`services/core-api/test/require-grant.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/test/require-grant.test.js b/services/core-api/test/require-grant.test.js
index 65e82de..9162f4d 100644
--- a/services/core-api/test/require-grant.test.js
+++ b/services/core-api/test/require-grant.test.js
@@ -209,9 +209,10 @@ describe('requireGrant, resolvers, requireRole, auth/me (per-app roles)', () =>
     afterEach(() => app.close());
     const get = (url, p) => app.inject({ method: 'GET', url, headers: p.headers(false) });
 
-    it('a viewer person still reads GET /v1/funnels; a person with role NULL gets 403', async () => {
-      expect((await get('/v1/funnels', await person('v@ikameglobal.com', 'viewer'))).statusCode).toBe(200);
-      const none = await get('/v1/funnels', await person('n@ikameglobal.com', null, { apps: { starlyn: 'admin' } }));
+    // GET /v1/domains: still on requireRole here (GET /v1/funnels moved to requireGrant in Task 4).
+    it('a viewer person still reads GET /v1/domains; a person with role NULL gets 403', async () => {
+      expect((await get('/v1/domains', await person('v@ikameglobal.com', 'viewer'))).statusCode).toBe(200);
+      const none = await get('/v1/domains', await person('n@ikameglobal.com', null, { apps: { starlyn: 'admin' } }));
       expect([none.statusCode, none.json()]).toEqual([403, { error: 'forbidden' }]);
     });
 
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/scope-routes-a.test.js test/require-grant.test.js
```

Expected: `Test Files  1 failed | 1 passed (2)`, `Tests  17 failed | 25 passed (42)`: 17 test mới của `scope-routes-a.test.js` fail vì các route còn dùng `requireRole` (người `role NULL` + dòng `starlyn` bị `403` ở mọi route, danh sách không lọc, `GET` ngoài phạm vi trả `200`); 2 test mới pass sẵn (`POST /v1/apps: global only` và "default editor, no rows" — hành vi cũ đã đúng); `require-grant.test.js` pass (23).

- [ ] **Step 3: Implement**

`services/core-api/src/auth.js`, `services/core-api/src/admin/scope.js`, `services/core-api/src/admin/resolve.js` (sửa, áp dụng đúng diff này):

`services/core-api/src/auth.js`, `services/core-api/src/admin/scope.js`, `services/core-api/src/admin/resolve.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/admin/resolve.js b/services/core-api/src/admin/resolve.js
index 533f7c5..bfe041f 100644
--- a/services/core-api/src/admin/resolve.js
+++ b/services/core-api/src/admin/resolve.js
@@ -16,3 +16,7 @@ export const appOfGrant = async (db, grantId) =>
   (/^\d{1,18}$/.test(String(grantId)) ? one(db, 'SELECT app_id FROM manual_grants WHERE id = $1', String(grantId)) : undefined);
 
 export const appOfApp = (db, id) => one(db, 'SELECT id AS app_id FROM apps WHERE id = $1', id);
+
+// requireGrant notFound bodies (ruling B4): out of scope a GET answers exactly what the handler answers for a missing
+// funnel, so the two cannot be told apart.
+export const funnelNotFound = (req) => ({ error: 'funnel_not_found', detail: { funnel: req.params.slug } });
diff --git a/services/core-api/src/admin/scope.js b/services/core-api/src/admin/scope.js
index 4b5e0a3..599326a 100644
--- a/services/core-api/src/admin/scope.js
+++ b/services/core-api/src/admin/scope.js
@@ -3,7 +3,10 @@ import { USER_GRANTS, tokenGrants } from '../auth.js';
 // Spec admin-console-p4b §2 "Phạm vi của người gọi": what the caller may touch, app by app. Built on every
 // request from the database so a role change applies at once (no cache).
 // → { global, roleIn(appId) → role | null, appIds() → sorted app ids in reach, grantsIn(appId) → grants,
-//     globalGrants: grants usable on global routes (isGlobalGrant) }.
+//     globalGrants: grants usable on global routes (isGlobalGrant),
+//     defaultGrants: grants that reach every app, present or future, and the resources of no app (an unassigned
+//     funnel) — the default role's (spec §1: an existing viewer/support/editor keeps today's reach), none for a
+//     person with role NULL or an app-bound token }.
 export async function loadScope(db, actor) {
   return actor.kind === 'token' ? tokenScope(db, actor) : personScope(db, actor);
 }
@@ -36,6 +39,7 @@ async function personScope(db, actor) {
     appIds: () => [...appIds],
     grantsIn: (appId) => USER_GRANTS[roleIn(appId)] ?? [],
     globalGrants: global ? USER_GRANTS.admin : [],
+    defaultGrants: global ? USER_GRANTS.admin : (USER_GRANTS[rows[0]?.default_role] ?? []),
   };
 }
 
@@ -50,6 +54,7 @@ async function tokenScope(db, actor) {
       appIds: () => [actor.appId],
       grantsIn: (appId) => (appId === actor.appId ? grants : []),
       globalGrants: [],
+      defaultGrants: [],
     };
   }
   // A token without app keeps today's reach: its grants everywhere; global only with the admin role.
@@ -61,5 +66,6 @@ async function tokenScope(db, actor) {
     appIds: () => [...appIds],
     grantsIn: () => grants,
     globalGrants: grants,
+    defaultGrants: grants,
   };
 }
diff --git a/services/core-api/src/auth.js b/services/core-api/src/auth.js
index 203f2b3..afe68c3 100644
--- a/services/core-api/src/auth.js
+++ b/services/core-api/src/auth.js
@@ -61,35 +61,55 @@ export async function authenticate(pool, req) {
 }
 
 // Spec admin-console-p4b §2 "Middleware": a grant checked in the caller's scope (src/admin/scope.js), built per
-// request and left on req.scope for the handler.
+// request and left on req.scope for the handler. grant may be a list: any one of them is enough (as requireRole).
 //   app: 'global' (default) → only a global caller (isGlobalGrant); anyone else 403, whatever the method — global
 //        routes are no secret.
-//   app: 'any' → the grant in at least one app (the handler filters its list to req.scope).
+//   app: 'any' → the grant in at least one app, or by the default role (which covers every app, even before the
+//        first one exists); the handler filters its list to req.scope.
 //   app: async (req, db) => appId | null | undefined → the app of the resource: undefined = no such resource (the
-//        handler answers its 404 as before), null = unassigned/shared (global only), an id = the grant in that app.
-// Out of scope on a resolver route (decision #5): GET/HEAD → 404 not_found (an app's resources are not disclosed),
-// a write → 403 forbidden. A resolver that reads req.body must run as a preHandler (no body yet in onRequest).
-export function requireGrant(pool, grant, { app = 'global' } = {}) {
+//        handler answers its 404 as before), null = no app (global or the default role, see hasGrant), an id = the
+//        grant in that app.
+// Denied on a resolver route (decision #5): a write → 403 forbidden; a GET/HEAD → 404 when the caller cannot see
+// that app at all (out of scope: its resources are not disclosed), 403 when it can see it but lacks the grant (a
+// viewer reading prices: nothing to hide, as before). notFound(req) → the 404 body; routes pass what their handler
+// answers for a missing resource (ruling B4: out of scope and missing look the same), default {error: 'not_found'}.
+// A resolver that reads req.body must run as a preHandler (no body yet in onRequest). Such a route also checks
+// app: 'any' in onRequest, so an unauthenticated caller is 401 before its body is parsed; the preHandler then
+// reuses that request's actor and scope instead of authenticating again.
+export function requireGrant(pool, grant, { app = 'global', notFound = () => ({ error: 'not_found' }) } = {}) {
+  const wanted = Array.isArray(grant) ? grant : [grant];
   return async (req, reply) => {
-    const who = await authenticate(pool, req);
-    if (who.error) return reply.code(who.status).send({ error: who.error });
-    req.actor = who.actor;
-    req.session = who.session ?? null;
-    const scope = await loadScope(pool, who.actor);
-    req.scope = scope;
-    if (isGlobalGrant(scope, grant)) return undefined;
+    if (!req.scope) {
+      const who = await authenticate(pool, req);
+      if (who.error) return reply.code(who.status).send({ error: who.error });
+      req.actor = who.actor;
+      req.session = who.session ?? null;
+      req.scope = await loadScope(pool, who.actor);
+    }
+    const { scope } = req;
+    if (wanted.some((g) => isGlobalGrant(scope, g))) return undefined;
     if (app === 'global') return reply.code(403).send({ error: 'forbidden' });
     if (app === 'any') {
-      return scope.appIds().some((id) => scope.grantsIn(id).includes(grant)) ? undefined : reply.code(403).send({ error: 'forbidden' });
+      const some = hasGrant(scope, wanted, null) || scope.appIds().some((id) => hasGrant(scope, wanted, id));
+      return some ? undefined : reply.code(403).send({ error: 'forbidden' });
     }
     const appId = await app(req, pool);
-    if (appId === undefined || (appId !== null && scope.grantsIn(appId).includes(grant))) return undefined;
-    return req.method === 'GET' || req.method === 'HEAD'
-      ? reply.code(404).send({ error: 'not_found' })
-      : reply.code(403).send({ error: 'forbidden' });
+    if (appId === undefined || hasGrant(scope, wanted, appId)) return undefined;
+    if ((req.method === 'GET' || req.method === 'HEAD') && !hasGrant(scope, 'viewer', appId)) return reply.code(404).send(notFound(req));
+    return reply.code(403).send({ error: 'forbidden' });
   };
 }
 
+// True when the scope holds grant (or one of a list) in appId. appId null = a resource of no app (an unassigned
+// funnel): global grants, or the default role's (spec §1: an existing person keeps today's reach; a person with role
+// NULL reaches only the apps of its rows). Handlers use it for a second app (PUT /v1/funnels/:slug {app_id}) and to
+// filter lists: hasGrant(scope, 'viewer', null) = the caller sees every app and the unassigned funnels.
+export function hasGrant(scope, grant, appId) {
+  const wanted = Array.isArray(grant) ? grant : [grant];
+  const held = appId === null ? scope.defaultGrants : scope.grantsIn(appId);
+  return wanted.some((g) => isGlobalGrant(scope, g) || held.includes(g));
+}
+
 // Routes not converted to requireGrant yet (spec admin-console-p4b §2): today's check — a person's default role
 // (global → admin) or the token's roles, in no particular app.
 export function requireRole(pool, role) {
PATCH
```

`services/core-api/src/http/apps.js` (sửa, áp dụng đúng diff này):

`services/core-api/src/http/apps.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/http/apps.js b/services/core-api/src/http/apps.js
index 76aa04e..94699eb 100644
--- a/services/core-api/src/http/apps.js
+++ b/services/core-api/src/http/apps.js
@@ -1,5 +1,6 @@
 import { audit } from '../audit.js';
-import { requireRole } from '../auth.js';
+import { hasGrant, requireGrant } from '../auth.js';
+import { appOfApp } from '../admin/resolve.js';
 import { HttpError } from '../errors.js';
 import { appPlans, appSummary } from '../identity/app-summary.js';
 import { createApp, getApp, listApps, rotateKey, updateApp } from '../identity/apps.js';
@@ -12,14 +13,19 @@ const idParams = {
   properties: { id: { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{1,30}$' } },
 };
 
-// App registry (spec §6), role router (admin passes every role check).
+// Spec admin-console-p4b §2 "Bảng route": the routes of one app check the grant in that app (:id). Out of scope a
+// GET answers the handler's own 404 for a missing app (ruling B4), a write 403.
+const appNotFound = (req) => ({ error: 'app_not_found', detail: { app_id: req.params.id } });
+const inApp = (pool, grant) => requireGrant(pool, grant, { app: (req, db) => appOfApp(db, req.params.id), notFound: appNotFound });
+
+// App registry (spec §6), role router (admin passes every role check). Creating an app is global only.
 export default async function appsHttp(app, { pool, webhookSecrets }) {
-  const router = requireRole(pool, 'router');
+  const router = inApp(pool, 'router');
 
   app.post(
     '/v1/apps',
     {
-      onRequest: router,
+      onRequest: requireGrant(pool, 'router'),
       schema: {
         body: {
           type: 'object',
@@ -74,22 +80,26 @@ export default async function appsHttp(app, { pool, webhookSecrets }) {
     async (req) => updateApp(pool, req.params.id, req.body, req.actor),
   );
 
-  // Any signed-in person picks an app for a funnel from this list (spec admin-console-p1 §3).
-  app.get('/v1/apps', { onRequest: requireRole(pool, 'viewer') }, async () => listApps(pool));
+  // Any signed-in person picks an app for a funnel from this list (spec admin-console-p1 §3); spec admin-console-p4b
+  // decision #6: only the apps in the caller's scope (global: all).
+  app.get('/v1/apps', { onRequest: requireGrant(pool, 'viewer', { app: 'any' }) }, async (req) => {
+    const out = await listApps(pool);
+    return hasGrant(req.scope, 'viewer', null) ? out : { apps: out.apps.filter((a) => hasGrant(req.scope, 'viewer', a.id)) };
+  });
 
   // Spec admin-console-p4a §2 "Apps": one app with its counts (the console's check when it opens an app), its
   // overview (own funnels and domains, not the shared hosts) and its read-only price table.
-  app.get('/v1/apps/:id', { onRequest: requireRole(pool, 'viewer'), schema: { params: idParams } }, async (req) => {
+  app.get('/v1/apps/:id', { onRequest: inApp(pool, 'viewer'), schema: { params: idParams } }, async (req) => {
     const out = await getApp(pool, req.params.id);
     if (!out) throw new HttpError(404, 'app_not_found', { app_id: req.params.id });
     return out;
   });
 
-  app.get('/v1/apps/:id/summary', { onRequest: requireRole(pool, 'viewer'), schema: { params: idParams } }, async (req) =>
+  app.get('/v1/apps/:id/summary', { onRequest: inApp(pool, 'viewer'), schema: { params: idParams } }, async (req) =>
     appSummary(pool, req.params.id),
   );
 
-  app.get('/v1/apps/:id/plans', { onRequest: requireRole(pool, 'prices:read'), schema: { params: idParams } }, async (req) =>
+  app.get('/v1/apps/:id/plans', { onRequest: inApp(pool, 'prices:read'), schema: { params: idParams } }, async (req) =>
     appPlans(pool, req.params.id),
   );
 
@@ -111,7 +121,9 @@ export default async function appsHttp(app, { pool, webhookSecrets }) {
   app.get(
     '/v1/apps/:id/webhooks',
     {
-      onRequest: requireRole(pool, 'apps:read'),
+      // The :id itself, not appOfApp: an unknown app has no deliveries (200 [] for a global caller, as before), so
+      // for anyone else it must look like an app out of scope (404 app_not_found), not disclose that one exists.
+      onRequest: requireGrant(pool, 'apps:read', { app: async (req) => req.params.id, notFound: appNotFound }),
       schema: {
         params: idParams,
         querystring: {
PATCH
```

`services/core-api/src/http/catalog.js`, `services/core-api/src/http/funnels.js`, `services/core-api/src/http/versions.js` (sửa, áp dụng đúng diff này):

`services/core-api/src/http/catalog.js`, `services/core-api/src/http/funnels.js`, `services/core-api/src/http/versions.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/http/catalog.js b/services/core-api/src/http/catalog.js
index 7f93d5e..3da2e0a 100644
--- a/services/core-api/src/http/catalog.js
+++ b/services/core-api/src/http/catalog.js
@@ -1,5 +1,6 @@
 import { listAudit } from '../audit.js';
-import { requireRole } from '../auth.js';
+import { appOfFunnel, funnelNotFound } from '../admin/resolve.js';
+import { hasGrant, requireGrant, requireRole } from '../auth.js';
 import { HttpError } from '../errors.js';
 import { createFunnel, funnelDetail, listDomains, listFunnels } from '../publisher/catalog.js';
 
@@ -14,7 +15,7 @@ export default async function catalogHttp(app, { pool, previewBaseUrl = null })
   app.get(
     '/v1/funnels',
     {
-      onRequest: viewer,
+      onRequest: requireGrant(pool, 'viewer', { app: 'any' }),
       schema: {
         querystring: {
           type: 'object',
@@ -24,13 +25,23 @@ export default async function catalogHttp(app, { pool, previewBaseUrl = null })
         },
       },
     },
-    async (req) => ({ funnels: await listFunnels(pool, { app: req.query.app ?? null }) }),
+    async (req) => {
+      const funnels = await listFunnels(pool, { app: req.query.app ?? null });
+      // Spec admin-console-p4b decision #6: a caller limited to some apps (role NULL + rows, an app-bound token) sees
+      // only those apps' funnels; an unassigned funnel (app_id null, ?app=none) needs a global or default-role
+      // viewer (hasGrant(…, null)), so that list is empty for them.
+      if (hasGrant(req.scope, 'viewer', null)) return { funnels };
+      return { funnels: funnels.filter((f) => f.app_id !== null && hasGrant(req.scope, 'viewer', f.app_id)) };
+    },
   );
 
   app.post(
     '/v1/funnels',
     {
-      onRequest: requireRole(pool, ['editor', 'publisher']),
+      // Spec admin-console-p4b §2: publisher (editor+) in the body's app_id. The body is parsed only after onRequest,
+      // so the app check is a preHandler; no app_id → undefined → the handler's 400 app_required as before.
+      onRequest: requireGrant(pool, 'publisher', { app: 'any' }),
+      preHandler: requireGrant(pool, 'publisher', { app: async (req) => req.body?.app_id }),
       // app_id is checked in the handler, not by `required`: a schema miss answers bad_request, and the spec wants
       // app_required (spec admin-console-p4a §2, decision #1).
       schema: { body: { type: 'object', required: ['slug'], additionalProperties: false, properties: { slug: SLUG, app_id: APP_ID } } },
@@ -43,7 +54,8 @@ export default async function catalogHttp(app, { pool, previewBaseUrl = null })
     },
   );
 
-  app.get('/v1/funnels/:slug', { onRequest: viewer, schema: { params: slugParams } }, async (req) =>
+  const inFunnelApp = requireGrant(pool, 'viewer', { app: (req, db) => appOfFunnel(db, req.params.slug), notFound: funnelNotFound });
+  app.get('/v1/funnels/:slug', { onRequest: inFunnelApp, schema: { params: slugParams } }, async (req) =>
     funnelDetail(pool, req.params.slug, previewBaseUrl),
   );
 
diff --git a/services/core-api/src/http/funnels.js b/services/core-api/src/http/funnels.js
index 19c3c0b..44940c8 100644
--- a/services/core-api/src/http/funnels.js
+++ b/services/core-api/src/http/funnels.js
@@ -1,14 +1,18 @@
-import { requireRole } from '../auth.js';
+import { appOfFunnel } from '../admin/resolve.js';
+import { hasGrant, requireGrant } from '../auth.js';
 import { HttpError } from '../errors.js';
 import { setFunnelApp } from '../identity/apps.js';
 import { setFunnelPixel } from '../publisher/funnels.js';
 
+// People: editor and admin (spec admin-console-p1 §3); tokens: router, as before. Spec admin-console-p4b §2: in the
+// funnel's current app (an unassigned funnel: global or the default role, see hasGrant).
+const GRANT = ['router', 'editor'];
+
 export default async function funnelsHttp(app, { pool, kv }) {
   app.put(
     '/v1/funnels/:slug',
     {
-      // People: editor and admin (spec admin-console-p1 §3); tokens: router, as before.
-      onRequest: requireRole(pool, ['router', 'editor']),
+      onRequest: requireGrant(pool, GRANT, { app: (req, db) => appOfFunnel(db, req.params.slug) }),
       schema: {
         params: {
           type: 'object',
@@ -30,6 +34,8 @@ export default async function funnelsHttp(app, { pool, kv }) {
       const has = (k) => Object.hasOwn(req.body, k);
       if (!has('pixel_id') && !has('app_id')) throw new HttpError(400, 'bad_request', 'pixel_id or app_id required');
       if (has('app_id') && req.body.app_id === null) throw new HttpError(400, 'app_required', { funnel: req.params.slug });
+      // Spec admin-console-p4b §2: moving a funnel to another app needs the same grant in the new app too.
+      if (has('app_id') && !hasGrant(req.scope, GRANT, req.body.app_id)) throw new HttpError(403, 'forbidden');
       const out = { funnel: req.params.slug };
       if (has('app_id')) Object.assign(out, await setFunnelApp(pool, { slug: req.params.slug, appId: req.body.app_id, actor: req.actor }));
       if (has('pixel_id')) {
diff --git a/services/core-api/src/http/versions.js b/services/core-api/src/http/versions.js
index d2809ba..77627f7 100644
--- a/services/core-api/src/http/versions.js
+++ b/services/core-api/src/http/versions.js
@@ -1,5 +1,6 @@
 import { lint, planKeysFromHtml } from '@ikf/funnel-lint';
-import { requireRole } from '../auth.js';
+import { appOfFunnel } from '../admin/resolve.js';
+import { requireGrant } from '../auth.js';
 import { PLAN_KEY_RE } from '../billing/prices.js';
 import { HttpError } from '../errors.js';
 import { checkUploadApp, publishVersion, sha256Hex } from '../publisher/publish.js';
@@ -23,12 +24,22 @@ async function uploadAppKind(pool, slug, appId) {
   return app.kind;
 }
 
+// Spec admin-console-p4b §2: the funnel's app; a new slug → the body's app_id (undefined without one: the handler
+// answers 400 app_required as before).
+async function uploadApp(req, db) {
+  const appId = await appOfFunnel(db, req.params.slug);
+  return appId !== undefined ? appId : req.body?.app_id;
+}
+
 export default async function versionsHttp(app, { pool, store, mediaOrigins, previewBaseUrl }) {
   app.post(
     '/v1/funnels/:slug/versions',
     {
       bodyLimit: 3 * 1024 * 1024,
-      onRequest: requireRole(pool, 'publisher'),
+      // The resolver reads the body → preHandler; onRequest still turns away a caller with no publisher anywhere (and
+      // an unauthenticated one) before a 3 MB body is parsed.
+      onRequest: requireGrant(pool, 'publisher', { app: 'any' }),
+      preHandler: requireGrant(pool, 'publisher', { app: uploadApp }),
       schema: {
         params: {
           type: 'object',
PATCH
```

`services/core-api/src/http/prices.js` (sửa, áp dụng đúng diff này):

`services/core-api/src/http/prices.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/http/prices.js b/services/core-api/src/http/prices.js
index 6dac1d9..bb4236f 100644
--- a/services/core-api/src/http/prices.js
+++ b/services/core-api/src/http/prices.js
@@ -1,5 +1,6 @@
 import { PaddleError } from '@ikf/paddle';
-import { requireRole } from '../auth.js';
+import { appOfFunnel, funnelNotFound } from '../admin/resolve.js';
+import { requireGrant } from '../auth.js';
 import { priceCatalog } from '../billing/catalog.js';
 import { paddleHttpError } from '../billing/errors.js';
 import { listFunnelPrices, setFunnelPrices } from '../billing/prices.js';
@@ -28,11 +29,14 @@ const planValue = {
   ],
 };
 
+// Spec admin-console-p4b §2: a funnel's prices are checked in the funnel's app; the Paddle catalog is no app's.
+const inFunnelApp = (pool, grant) => requireGrant(pool, grant, { app: (req, db) => appOfFunnel(db, req.params.slug), notFound: funnelNotFound });
+
 export default async function pricesHttp(app, { pool, paddle, alarm, now = Date.now }) {
   const catalog = priceCatalog(paddle, { now });
 
   // Any Paddle failure is 503 here (the picker still lets people paste a pri_… id).
-  app.get('/v1/paddle/prices', { onRequest: requireRole(pool, 'prices:read') }, async (req) => {
+  app.get('/v1/paddle/prices', { onRequest: requireGrant(pool, 'prices:read', { app: 'any' }) }, async (req) => {
     try {
       return await catalog.list();
     } catch (err) {
@@ -46,7 +50,7 @@ export default async function pricesHttp(app, { pool, paddle, alarm, now = Date.
   app.put(
     '/v1/funnels/:slug/prices',
     {
-      onRequest: requireRole(pool, 'router'),
+      onRequest: inFunnelApp(pool, 'router'),
       schema: {
         params,
         body: {
@@ -67,7 +71,7 @@ export default async function pricesHttp(app, { pool, paddle, alarm, now = Date.
     async (req) => setFunnelPrices(pool, paddle, { slug: req.params.slug, plans: req.body.plans, actor: req.actor, log: req.log, alarm }),
   );
 
-  app.get('/v1/funnels/:slug/prices', { onRequest: requireRole(pool, 'prices:read'), schema: { params } }, async (req) =>
+  app.get('/v1/funnels/:slug/prices', { onRequest: inFunnelApp(pool, 'prices:read'), schema: { params } }, async (req) =>
     listFunnelPrices(pool, req.params.slug),
   );
 }
PATCH
```

`services/core-api/src/http/analytics.js`, `services/core-api/src/analytics/service.js` (sửa, áp dụng đúng diff này):

`services/core-api/src/http/analytics.js`, `services/core-api/src/analytics/service.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/analytics/service.js b/services/core-api/src/analytics/service.js
index 11268a6..b143eab 100644
--- a/services/core-api/src/analytics/service.js
+++ b/services/core-api/src/analytics/service.js
@@ -64,17 +64,23 @@ export function analyticsService({ pool, clickhouse, now = Date.now, ttlMs = CAC
     // GET /v1/analytics/overview: every funnel (in Postgres) with events or a checkout in the range, most sessions first.
     // Spec admin-console-p4a §2 "Analytics", decision #4: app → that app's slugs (Postgres) filter both sources, and
     // an app without funnels answers [] without asking ClickHouse; every row carries its app_id (null = unassigned).
+    // Spec admin-console-p4b §2: appIds (a caller limited to some apps, without ?app=) → only the funnels of those apps
+    // (never an unassigned one), filtering ClickHouse by slug and the money rows like an app does.
     async overview(query) {
       const r = resolveRange({ ...query, by: 'day' }, now());
       const app = query.app ?? null;
-      return cached(keyOf('overview', app ?? '', r), async () => {
-        const known = new Map((await revenue.funnelSlugs(pool, { app })).map((f) => [f.slug, f.app_id]));
-        if (app !== null && !known.size) return { range: range(r), funnels: [] };
+      const appIds = query.appIds ?? null;
+      const scoped = app !== null || appIds !== null;
+      return cached(keyOf('overview', `${app ?? ''}|${appIds?.join(',') ?? '*'}`, r), async () => {
+        const all = await revenue.funnelSlugs(pool, { app });
+        const known = new Map(all.filter((f) => appIds === null || appIds.includes(f.app_id)).map((f) => [f.slug, f.app_id]));
+        if (scoped && !known.size) return { range: range(r), funnels: [] };
         const [events, money] = await Promise.all([
-          queries.eventOverview(clickhouse, app === null ? r : { ...r, slugs: [...known.keys()] }),
+          queries.eventOverview(clickhouse, scoped ? { ...r, slugs: [...known.keys()] } : r),
           revenue.moneyOverview(pool, r, { app }),
         ]);
-        const rows = new Map(money.map((m) => [m.slug, { slug: m.slug, sessions: 0, leads: 0, ...m }]));
+        const inScope = money.filter((m) => appIds === null || known.has(m.slug));
+        const rows = new Map(inScope.map((m) => [m.slug, { slug: m.slug, sessions: 0, leads: 0, ...m }]));
         // A slug only ClickHouse has seen (a deleted funnel, a slug the client sent) has no page: dropped (final review M4).
         for (const e of events) if (known.has(e.slug)) rows.set(e.slug, { checkouts: 0, paid: 0, revenue: [], refunds: [], ...rows.get(e.slug), ...e });
         const funnels = [...rows.values()]
diff --git a/services/core-api/src/http/analytics.js b/services/core-api/src/http/analytics.js
index c6911f0..9a2489f 100644
--- a/services/core-api/src/http/analytics.js
+++ b/services/core-api/src/http/analytics.js
@@ -1,4 +1,5 @@
-import { requireRole } from '../auth.js';
+import { appOfFunnel } from '../admin/resolve.js';
+import { hasGrant, requireGrant } from '../auth.js';
 import { ClickhouseError } from '../analytics/clickhouse.js';
 import { DIMENSIONS } from '../analytics/queries.js';
 import { analyticsService } from '../analytics/service.js';
@@ -13,7 +14,9 @@ const query = (properties, required = []) => ({ type: 'object', additionalProper
 // person and every token may read them (grant viewer). Registered only when the ClickHouse reader is configured.
 export default async function analyticsHttp(app, { pool, clickhouse, now = Date.now }) {
   const service = analyticsService({ pool, clickhouse, now });
-  const viewer = requireRole(pool, 'viewer');
+  // Spec admin-console-p4b §2: a funnel's numbers → viewer in its app; out of scope answers the service's own 404 for a
+  // missing funnel (ruling B4: funnel_not_found without detail, as analytics/service.js answers).
+  const viewer = requireGrant(pool, 'viewer', { app: (req, db) => appOfFunnel(db, req.params.slug), notFound: () => ({ error: 'funnel_not_found' }) });
 
   // ClickHouse down, slow or refusing us → 503 (the console shows "chưa bật hoặc không phản hồi"); the log has the
   // kind and status only. Postgres errors stay 500.
@@ -32,16 +35,19 @@ export default async function analyticsHttp(app, { pool, clickhouse, now = Date.
   }
 
   // Spec admin-console-p4a §2 "Analytics": ?app= is one app's funnels; an unknown app is 404 app_not_found (checked
-  // here, before ClickHouse: a schema miss could only answer bad_request).
+  // here, before ClickHouse: a schema miss could only answer bad_request). Spec admin-console-p4b §2: viewer in any
+  // app; ?app= out of scope is the same 404; without ?app= a caller limited to some apps sees only their funnels.
   app.get(
     '/v1/analytics/overview',
-    { onRequest: viewer, schema: { querystring: query({ app: { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{1,30}$' } }) } },
+    { onRequest: requireGrant(pool, 'viewer', { app: 'any' }), schema: { querystring: query({ app: { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{1,30}$' } }) } },
     async (req, reply) => {
       const appId = req.query.app;
-      if (appId !== undefined && !(await pool.query('SELECT 1 FROM apps WHERE id = $1', [appId])).rows.length) {
+      if (appId !== undefined && (!hasGrant(req.scope, 'viewer', appId) || !(await pool.query('SELECT 1 FROM apps WHERE id = $1', [appId])).rows.length)) {
         throw new HttpError(404, 'app_not_found', { app_id: appId });
       }
-      return answer(req, reply, 'overview', () => service.overview(req.query));
+      const global = hasGrant(req.scope, 'viewer', null);
+      const appIds = appId !== undefined || global ? undefined : req.scope.appIds().filter((id) => hasGrant(req.scope, 'viewer', id));
+      return answer(req, reply, 'overview', () => service.overview({ ...req.query, ...(appIds && { appIds }) }));
     },
   );
 
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/scope-routes-a.test.js test/require-grant.test.js
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  42 passed (42)` (19 + 23); toàn bộ core-api `Test Files  72 passed (72)`, `Tests  685 passed (685)` (trước task: 71 file / 666 test).

- [ ] **Step 5: Commit**

```bash
git add services/core-api/src/admin/resolve.js services/core-api/src/admin/scope.js services/core-api/src/analytics/service.js services/core-api/src/auth.js services/core-api/src/http/analytics.js services/core-api/src/http/apps.js services/core-api/src/http/catalog.js services/core-api/src/http/funnels.js services/core-api/src/http/prices.js services/core-api/src/http/versions.js services/core-api/test/require-grant.test.js services/core-api/test/scope-routes-a.test.js
git commit -m "feat(core-api): per-app scope on apps, funnels, versions, prices and analytics; lists filtered to scope
```

---

---

### Task 5: Áp phạm vi cho domains, routes, customers, audit, billing, users/tokens global; khoá đúng thứ tự

**Files:**
- Create: `services/core-api/test/scope-routes-b.test.js`, `services/core-api/test/lock-order.test.js`
- Modify: `services/core-api/src/admin/resolve.js` (thêm `appOfRoute`, `appOfClaim`, `domainNotFound`), `services/core-api/src/admin/scope.js` (role mặc định áp cho cả app id chưa có trong DB), `services/core-api/src/http/billing.js`, `services/core-api/src/http/catalog.js` (`GET /v1/domains`, `GET /v1/audit`), `services/core-api/src/http/customers.js`, `services/core-api/src/http/domains.js`, `services/core-api/src/http/routes.js`, `services/core-api/src/identity/apps.js` (`lockFunnelDomains`, `setFunnelApp` khoá domain trước), `services/core-api/src/publisher/catalog.js` (`listDomains({visible})`), `services/core-api/src/publisher/domains.js` (`setDomain` khoá funnel đang live `FOR SHARE`), `services/core-api/src/publisher/funnels.js` (`setFunnelPixel` khoá domain trước funnel), `services/core-api/src/publisher/publish.js` (upload gán app: khoá domain trước), `services/core-api/src/publisher/routes.js` (`setRoute` khoá funnel `FOR SHARE OF f`; `listRoutes({visible})`)
- Test: `services/core-api/test/scope-routes-b.test.js` (mới, 13 test), `services/core-api/test/lock-order.test.js` (mới, 4 test), `services/core-api/test/require-grant.test.js` (sửa một test: không còn route nào dùng `requireRole`, test kiểm `requireRole` trên một route Fastify riêng)

**Interfaces:**
- Consumes: `requireGrant(pool, grant|grant[], { app, notFound })`, `hasGrant(scope, grant, appId|null)`, `scope.defaultGrants` (Task 2/4); `appOfFunnel`, `appOfHost`, `appOfGrant` (Task 2); `signIn(pool, email, role, {global, apps})` (Task 3); `api_tokens.app_id` (Task 3).
- Produces:
  - `appOfRoute(db, host, prefix)` → `app_id` của funnel đang live ở `host`+`prefix` (prefix được normalize), `null` funnel chưa gán, `undefined` không có route / prefix sai.
  - `appOfClaim(db, ref)` → app của funnel của checkout thuộc claim mới nhất (cùng truy vấn với `resendClaimEmail`), `undefined` nếu không có khách/claim.
  - `domainNotFound(req)` → `{error:'domain_not_found', detail:{host}}`.
  - `lockFunnelDomains(c, slug)` (`src/identity/apps.js`) — khoá các dòng `domains` mà funnel đang live, `ORDER BY host FOR UPDATE`.
  - `listDomains(pool, { app, visible })`, `listRoutes(pool, host, { visible })` — `visible(appId)` lọc host / route theo app (`null` = host dùng chung / funnel chưa gán); mặc định thấy hết.
  - `scope.roleIn(appId)` của người không global: app id chưa có trong DB → role mặc định (trước: `null`).
  - Bảng route: `GET /v1/domains` (`any` viewer; host của app trong phạm vi + dùng chung; host dùng chung chỉ còn route của funnel trong phạm vi); `PUT /v1/domains/:host` (global `admin`); `GET /v1/routes/:host` (`any` viewer + viewer trong app của host, ngoài phạm vi `404 domain_not_found {host}`; host dùng chung → lọc route); `PUT /v1/routes/:host` (onRequest `any` router + preHandler router trong app của funnel trong body); rollback/delete (onRequest `any` router + preHandler router trong app của funnel đang live ở prefix); `POST /v1/routes/:host/sync` (`any` router + router trong app của host; dùng chung → global/role mặc định); `POST /v1/customers/lookup` (`any` support + preHandler support trong body `app_id`; không `app_id` mà không có `hasGrant(…,'support',null)` → `400 app_required`); grants POST (`admin` trong body `app_id`), DELETE (`admin` trong app của grant); resend-email (`support` trong `appOfClaim`); rotate-user-id (global `admin`); `GET /v1/audit` (`?app=` → viewer trong app, ngoài phạm vi `404 app_not_found {app_id}`; không `?app=` → `hasGrant(…,'viewer',null)` else `403`); `/v1/billing/*` (global `admin`).
  - Thứ tự khoá (spec §5): `domains` (host tăng dần) → `funnels` ở `setDomain`, `setFunnelApp`/`assignFunnelApp`, upload gán app, `setRoute`, `setFunnelPixel`.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/scope-routes-b.test.js` (mới):

`services/core-api/test/scope-routes-b.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, seedVersions, tokenFor, bearer } from './helpers/app.js';
import { signIn } from './helpers/admin.js';
import { fakeStore } from './helpers/fakes.js';
import { fakeSecrets } from './helpers/identity.js';
import { fakePaddle } from './helpers/paddle.js';
import { fakeQueue } from './helpers/queue.js';

// Mobile apps (resend-email only follows claims of kind 'app').
const APP = (id, name) =>
  `INSERT INTO apps (id, name, kind, adjust_tracker_url, deeplink_scheme, api_key_hash)
   VALUES ('${id}', '${name}', 'app', 'https://app.adjust.com/${id}', '${id}', 'h-${id}')`;
const REF = 'cus_01K75Z0000000000000000000B';
const CK_STAR = '01JA0000000000000000000001';
const CK_CHAT = '01JA0000000000000000000003';
const STAR_HOST = 'go.starlyn.app';
const CHAT_HOST = 'go.chatchi.app';
const SHARED = 'try.example.com';

// Spec admin-console-p4b §2 "Bảng route" (domains, routes, customers, audit, billing, users/tokens) and decisions #5,
// #6: the same callers as scope-routes-a (global; admin of starlyn only; viewer of starlyn only; a publisher token
// bound to starlyn), two apps, an unassigned funnel, one host per app and a shared host carrying funnels of both apps
// and the unassigned one. Out of scope: GET 404, write 403; global-only routes: 403; lists hold only what is in scope.
describe('per-app scope on domains, routes, customers, audit, billing (spec admin-console-p4b §2)', () => {
  let db;
  let app;
  let who;
  let customerId;
  const q = async (sql, p) => (await db.pool.query(sql, p)).rows;
  const route = (host, prefix, slug) =>
    q(
      `INSERT INTO routes (host, path_prefix, version_id, updated_by)
       SELECT $1, $2, v.id, 't' FROM versions v JOIN funnels f ON f.id = v.funnel_id WHERE f.slug = $3 AND v.n = 1`,
      [host, prefix, slug],
    );

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    await q(APP('starlyn', 'Starlyn'));
    await q(APP('chatchi', 'ChatChi'));
    const store = fakeStore();
    for (const slug of ['star', 'chat', 'loose']) await seedVersions(db.pool, store, slug, 1);
    await q("UPDATE funnels SET app_id = 'starlyn' WHERE slug = 'star'");
    await q("UPDATE funnels SET app_id = 'chatchi' WHERE slug = 'chat'");
    await q(`INSERT INTO domains (host, status, app_id) VALUES ('${STAR_HOST}', 'active', 'starlyn'), ('${CHAT_HOST}', 'active', 'chatchi'), ('${SHARED}', 'active', NULL)`);
    await q(`INSERT INTO host_revs (host) VALUES ('${STAR_HOST}'), ('${CHAT_HOST}'), ('${SHARED}')`);
    await route(STAR_HOST, '/a', 'star');
    await route(CHAT_HOST, '/c', 'chat');
    await route(SHARED, '/s', 'star');
    await route(SHARED, '/t', 'chat');
    await route(SHARED, '/l', 'loose');
    ({ id: customerId } = (await q("INSERT INTO customers (paddle_customer_id, email, ref) VALUES ('ctm_1', 'buyer@example.com', $1) RETURNING id", [REF]))[0]);
    // One checkout per funnel; the claim of the chat checkout is the newest (resend-email follows the newest claim).
    for (const [ck, slug, txn] of [[CK_STAR, 'star', 'txn_s'], [CK_CHAT, 'chat', 'txn_c']]) {
      await q(
        `INSERT INTO checkouts (id, paddle_transaction_id, funnel_id, v, plan_key, sid)
         SELECT $1, $2, id, 1, '1w', '01JA0000000000000000000002' FROM funnels WHERE slug = $3`,
        [ck, txn, slug],
      );
    }
    ({ app } = await makeApp(db.pool, { webhookSecrets: fakeSecrets(), paddle: fakePaddle(), queue: fakeQueue() }));
    const g = await signIn(db.pool, 'g@ikameglobal.com', 'admin');
    const a = await signIn(db.pool, 'a@ikameglobal.com', null, { apps: [{ app_id: 'starlyn', role: 'admin' }] });
    const v = await signIn(db.pool, 'v@ikameglobal.com', null, { apps: [{ app_id: 'starlyn', role: 'viewer' }] });
    const token = await tokenFor(db.pool, 'publisher');
    await q("UPDATE api_tokens SET app_id = 'starlyn' WHERE name = 'publisher'");
    who = { g: g.headers, a: a.headers, v: v.headers, pub: () => bearer(token) };
  });
  afterEach(() => app.close());

  const addClaim = (hash, ck, appId, createdAt) =>
    q(
      `INSERT INTO claim_tokens (token_hash, customer_id, app_id, checkout_id, expires_at, created_at)
       VALUES ($1, $2, $3, $4, now() + interval '1 day', $5)`,
      [hash, customerId, appId, ck, createdAt],
    );
  const call = (k, method, url, payload) => app.inject({ method, url, headers: who[k](method !== 'GET'), ...(payload !== undefined && { payload }) });
  // Status per caller in the order g, a, v, pub.
  const codes = async (method, url, payload) => {
    const out = [];
    for (const k of ['g', 'a', 'v', 'pub']) out.push((await call(k, method, url, payload)).statusCode);
    return out;
  };
  // Same, callers in the order v, pub, a, g: a write the global person must see succeed after the others failed.
  const codesLastG = async (method, url, payload) => {
    const out = {};
    for (const k of ['v', 'pub', 'a', 'g']) out[k] = (await call(k, method, url, payload)).statusCode;
    return [out.g, out.a, out.v, out.pub];
  };

  describe('domains', () => {
    it('GET /v1/domains: any viewer; hosts of the apps in scope plus the shared ones; a shared host lists only routes of funnels in scope', async () => {
      const list = async (k, query = '') =>
        (await call(k, 'GET', `/v1/domains${query}`)).json().domains.map((d) => [d.host, d.routes.map((r) => r.prefix).sort()]);
      expect(await list('g')).toEqual([[CHAT_HOST, ['/c']], [STAR_HOST, ['/a']], [SHARED, ['/l', '/s', '/t']]]);
      for (const k of ['a', 'v', 'pub']) {
        expect(await list(k), k).toEqual([[STAR_HOST, ['/a']], [SHARED, ['/s']]]);
        // ?app= of an app out of scope: its hosts stay hidden; the shared ones remain (spec admin-console-p4a §2)
        expect(await list(k, '?app=chatchi'), k).toEqual([[SHARED, ['/s']]]);
      }
    });

    it('PUT /v1/domains/:host: global only', async () => {
      expect(await codesLastG('PUT', '/v1/domains/new.example.com', { status: 'active' })).toEqual([200, 403, 403, 403]);
      expect(await codesLastG('PUT', `/v1/domains/${STAR_HOST}`, { status: 'active' })).toEqual([200, 403, 403, 403]);
    });
  });

  describe('routes', () => {
    it('GET /v1/routes/:host: viewer in the host\'s app (out of scope = a missing domain); a shared host → any viewer, routes of funnels in scope only', async () => {
      expect(await codes('GET', `/v1/routes/${STAR_HOST}`)).toEqual([200, 200, 200, 200]);
      expect(await codes('GET', `/v1/routes/${CHAT_HOST}`)).toEqual([200, 404, 404, 404]);
      const out = await call('a', 'GET', `/v1/routes/${CHAT_HOST}`);
      const missing = await call('g', 'GET', '/v1/routes/ghost.example.com');
      expect([missing.statusCode, missing.json()]).toEqual([404, { error: 'domain_not_found', detail: { host: 'ghost.example.com' } }]);
      expect(out.json()).toEqual({ error: 'domain_not_found', detail: { host: CHAT_HOST } });
      expect(await codes('GET', `/v1/routes/${SHARED}`)).toEqual([200, 200, 200, 200]);
      const prefixes = async (k) => (await call(k, 'GET', `/v1/routes/${SHARED}`)).json().routes.map((r) => r.prefix).sort();
      expect(await prefixes('g')).toEqual(['/l', '/s', '/t']);
      for (const k of ['a', 'v', 'pub']) expect(await prefixes(k), k).toEqual(['/s']);
    });

    it('PUT /v1/routes/:host (publish): router in the app of the funnel in the body; the 4a host rule still applies', async () => {
      expect(await codes('PUT', `/v1/routes/${STAR_HOST}`, { prefix: '/n', funnel: 'star', v: 1 })).toEqual([200, 200, 403, 403]);
      expect(await codesLastG('PUT', `/v1/routes/${SHARED}`, { prefix: '/n', funnel: 'chat', v: 1 })).toEqual([200, 403, 403, 403]);
      expect(await codesLastG('PUT', `/v1/routes/${SHARED}`, { prefix: '/m', funnel: 'loose', v: 1 })).toEqual([200, 403, 403, 403]);
      const foreign = await call('a', 'PUT', `/v1/routes/${CHAT_HOST}`, { prefix: '/x', funnel: 'star', v: 1 });
      expect([foreign.statusCode, foreign.json().error]).toEqual([409, 'domain_app_mismatch']);
      // no such funnel: the handler's own 404, as before
      const none = await call('a', 'PUT', `/v1/routes/${STAR_HOST}`, { prefix: '/x', funnel: 'ghost', v: 1 });
      expect([none.statusCode, none.json().error]).toEqual([404, 'version_not_found']);
    });

    it('rollback: router in the app of the funnel live at the prefix (no previous version → the handler\'s 409); nothing live → its 404', async () => {
      expect(await codes('POST', `/v1/routes/${STAR_HOST}/rollback`, { prefix: '/a' })).toEqual([409, 409, 403, 403]);
      expect(await codes('POST', `/v1/routes/${CHAT_HOST}/rollback`, { prefix: '/c' })).toEqual([409, 403, 403, 403]);
      expect(await codes('POST', `/v1/routes/${SHARED}/rollback`, { prefix: '/s' })).toEqual([409, 409, 403, 403]);
      expect(await codes('POST', `/v1/routes/${SHARED}/rollback`, { prefix: '/t' })).toEqual([409, 403, 403, 403]);
      expect(await codes('POST', `/v1/routes/${SHARED}/rollback`, { prefix: '/l' })).toEqual([409, 403, 403, 403]);
      expect(await codes('POST', `/v1/routes/${STAR_HOST}/rollback`, { prefix: '/zz' })).toEqual([404, 404, 403, 403]);
    });

    it('DELETE /v1/routes/:host: router in the app of the funnel live at the prefix', async () => {
      expect(await codesLastG('DELETE', `/v1/routes/${CHAT_HOST}?prefix=/c`)).toEqual([200, 403, 403, 403]);
      expect(await codesLastG('DELETE', `/v1/routes/${SHARED}?prefix=/t`)).toEqual([200, 403, 403, 403]);
      expect((await call('pub', 'DELETE', `/v1/routes/${SHARED}?prefix=/s`)).statusCode).toBe(403);
      expect((await call('a', 'DELETE', `/v1/routes/${SHARED}?prefix=/s`)).statusCode).toBe(200);
      expect((await call('a', 'DELETE', `/v1/routes/${STAR_HOST}?prefix=/a`)).statusCode).toBe(200);
      expect((await q('SELECT host, path_prefix FROM routes ORDER BY host, path_prefix')).map((r) => r.host + r.path_prefix)).toEqual([`${SHARED}/l`]);
    });

    it('POST /v1/routes/:host/sync: router in the host\'s app; a shared host → global; no such host → the handler\'s 404 (router somewhere first)', async () => {
      expect(await codes('POST', `/v1/routes/${STAR_HOST}/sync`)).toEqual([200, 200, 403, 403]);
      expect(await codes('POST', `/v1/routes/${CHAT_HOST}/sync`)).toEqual([200, 403, 403, 403]);
      expect(await codes('POST', `/v1/routes/${SHARED}/sync`)).toEqual([200, 403, 403, 403]);
      expect(await codes('POST', '/v1/routes/ghost.example.com/sync')).toEqual([404, 404, 403, 403]);
    });
  });

  describe('customers', () => {
    it('POST /v1/customers/lookup: support in the body app_id; without app_id → global or a default role, else 400 app_required', async () => {
      const body = (appId) => ({ email: 'buyer@example.com', ...(appId && { app_id: appId }) });
      expect(await codes('POST', '/v1/customers/lookup', body('starlyn'))).toEqual([200, 200, 403, 403]);
      expect(await codes('POST', '/v1/customers/lookup', body('chatchi'))).toEqual([200, 403, 403, 403]);
      expect(await codes('POST', '/v1/customers/lookup', body())).toEqual([200, 400, 403, 403]);
      const res = await call('a', 'POST', '/v1/customers/lookup', body());
      expect(res.json()).toEqual({ error: 'app_required' });
      // spec §1: a support person from before 008 (default role, no rows) keeps the lookup across apps
      const cs = await signIn(db.pool, 'cs@ikameglobal.com', 'support');
      const all = await app.inject({ method: 'POST', url: '/v1/customers/lookup', headers: cs.headers(), payload: body() });
      expect(all.statusCode).toBe(200);
    });

    it('POST /v1/customers/:ref/grants: admin in the body app_id; DELETE …/grants/:id: admin in the grant\'s app', async () => {
      const grant = (appId) => ({ app_id: appId, key: 'pro', reason: 'cs' });
      expect(await codes('POST', `/v1/customers/${REF}/grants`, grant('starlyn'))).toEqual([201, 201, 403, 403]);
      expect(await codes('POST', `/v1/customers/${REF}/grants`, grant('chatchi'))).toEqual([201, 403, 403, 403]);
      const ids = Object.fromEntries((await q('SELECT app_id, min(id) AS id FROM manual_grants GROUP BY app_id')).map((r) => [r.app_id, r.id]));
      expect(await codesLastG('DELETE', `/v1/customers/${REF}/grants/${ids.chatchi}`)).toEqual([200, 403, 403, 403]);
      expect((await call('pub', 'DELETE', `/v1/customers/${REF}/grants/${ids.starlyn}`)).statusCode).toBe(403);
      expect((await call('a', 'DELETE', `/v1/customers/${REF}/grants/${ids.starlyn}`)).statusCode).toBe(200);
      const none = await call('a', 'DELETE', `/v1/customers/${REF}/grants/999`);
      expect([none.statusCode, none.json().error]).toEqual([404, 'grant_not_found']);
    });

    it('resend-email: support in the app of the newest claim\'s checkout funnel', async () => {
      await addClaim('h-star', CK_STAR, 'starlyn', '2026-10-09T10:00:00Z');
      expect(await codes('POST', `/v1/customers/${REF}/resend-email`)).toEqual([200, 200, 403, 403]);
      await addClaim('h-chat', CK_CHAT, 'chatchi', '2026-10-10T10:00:00Z');
      expect(await codesLastG('POST', `/v1/customers/${REF}/resend-email`)).toEqual([200, 403, 403, 403]);
      // no such customer: the handler's own 404, as before
      const none = await call('a', 'POST', '/v1/customers/cus_01K75Z0000000000000000000Z/resend-email');
      expect([none.statusCode, none.json().error]).toEqual([404, 'customer_not_found']);
    });

    it('rotate-user-id: global only (it touches every app of the customer)', async () => {
      expect(await codesLastG('POST', `/v1/customers/${REF}/rotate-user-id`)).toEqual([200, 403, 403, 403]);
    });
  });

  describe('audit, billing, users, tokens', () => {
    it('GET /v1/audit: ?app= → viewer in that app (out of scope 404); no ?app= → global (or a default role), else 403', async () => {
      await q("INSERT INTO audit_log (actor, actor_kind, action, target, details, app_id) VALUES ('t', 'token', 'funnel.app', 'funnel:star', '{}', 'starlyn'), ('t', 'token', 'funnel.app', 'funnel:chat', '{}', 'chatchi')");
      expect(await codes('GET', '/v1/audit?app=starlyn')).toEqual([200, 200, 200, 200]);
      expect(await codes('GET', '/v1/audit?app=chatchi')).toEqual([200, 404, 404, 404]);
      expect((await call('a', 'GET', '/v1/audit?app=starlyn')).json().items.map((i) => i.target)).toEqual(['funnel:star']);
      expect(await codes('GET', '/v1/audit')).toEqual([200, 403, 403, 403]);
      expect((await call('g', 'GET', '/v1/audit')).json().items.map((i) => i.app_id)).toEqual(expect.arrayContaining(['chatchi', 'starlyn']));
      const vw = await signIn(db.pool, 'vw@ikameglobal.com', 'viewer');
      expect((await app.inject({ method: 'GET', url: '/v1/audit', headers: vw.headers(false) })).statusCode).toBe(200);
    });

    it('/v1/billing/*, /v1/admin/users, POST /v1/tokens: global only', async () => {
      expect(await codes('GET', '/v1/billing/outbox')).toEqual([200, 403, 403, 403]);
      expect(await codes('POST', '/v1/billing/reconcile', { since_seconds: 3600 })).toEqual([200, 403, 403, 403]);
      expect(await codes('GET', '/v1/admin/users')).toEqual([200, 403, 403, 403]);
      expect(await codesLastG('POST', '/v1/tokens', { name: 'ci', roles: ['publisher'] })).toEqual([201, 403, 403, 403]);
    });
  });
});
```

`services/core-api/test/lock-order.test.js` (mới) — hai thay đổi chạy song song trên Postgres thật; barrier tất định: một trigger `AFTER` chỉ dùng trong test bắt transaction chờ advisory lock (shared) mà test giữ, test chờ tới khi `pg_stat_activity` báo đủ backend đang chờ lock rồi mới mở; không có sleep cố định, deadlock (`40P01`) bị assert là không xảy ra:

`services/core-api/test/lock-order.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';
import { seedVersions } from './helpers/app.js';
import { fakeKv, fakeStore } from './helpers/fakes.js';
import { setFunnelApp } from '../src/identity/apps.js';
import { setDomain } from '../src/publisher/domains.js';
import { setFunnelPixel } from '../src/publisher/funnels.js';
import { setRoute } from '../src/publisher/routes.js';

const APP = (id) => `INSERT INTO apps (id, name, kind, return_url, api_key_hash) VALUES ('${id}', '${id}', 'web', 'https://${id}.example/done', 'h-${id}')`;
const GATE = 4242;
const HX = 'go.x.example'; // a host of app xapp
const SHARED = 'try.example.com';

// Spec admin-console-p4b §5 "Gộp các mục hoãn từ 4a": setDomain, the funnel app change (setFunnelApp →
// assignFunnelApp) and setRoute lock in one order — domains rows (host asc), then the funnels row — so two of them
// racing can neither both pass their check (the 4a write skew) nor deadlock (40P01, as setFunnelPixel did with a
// funnel lock in setRoute before 2af9add).
//
// Barrier, no sleeps: a test-only AFTER trigger on the table a change writes last makes that transaction wait on a
// shared advisory lock the test holds, i.e. after its check and with its row locks held. The test starts both
// changes, waits until Postgres reports both backends waiting on a lock (or the second one already done), then
// releases the gate.
describe('lock order: domains (host asc) → funnels (spec admin-console-p4b §5)', () => {
  let db;
  let gate;
  const q = async (sql, p) => (await db.pool.query(sql, p)).rows;

  // Waits until n other backends wait on a lock, or one of `done` settled (a change that never had to wait).
  const waiters = async (n, ...done) => {
    let settled = false;
    for (const p of done) p.then(() => { settled = true; }, () => { settled = true; });
    const deadline = Date.now() + 5000;
    for (;;) {
      const [{ c }] = await q(
        "SELECT count(*)::int AS c FROM pg_stat_activity WHERE datname = current_database() AND wait_event_type = 'Lock' AND pid <> pg_backend_pid()",
      );
      if (c >= n || settled) return;
      if (Date.now() > deadline) throw new Error(`barrier: ${c} of ${n} waiting`);
      await new Promise((r) => setTimeout(r, 5));
    }
  };
  const gateOn = async (event, table) =>
    q(`CREATE TRIGGER lock_order_gate AFTER ${event} ON ${table} FOR EACH ROW EXECUTE FUNCTION lock_order_gate()`);
  const outcome = (p) => p.then((value) => ({ ok: true, value }), (err) => ({ ok: false, status: err.status, code: err.code }));

  beforeAll(async () => {
    db = await startDb();
    await q(`CREATE FUNCTION lock_order_gate() RETURNS trigger LANGUAGE plpgsql AS $$
               BEGIN PERFORM pg_advisory_xact_lock_shared(${GATE}); RETURN NULL; END $$`);
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    await q(APP('xapp'));
    await q(APP('yapp'));
    await seedVersions(db.pool, fakeStore(), 'fun', 1);
    await q("UPDATE funnels SET app_id = 'xapp' WHERE slug = 'fun'");
    await q(`INSERT INTO domains (host, status, app_id) VALUES ('${HX}', 'active', 'xapp'), ('${SHARED}', 'active', NULL)`);
    await q(`INSERT INTO host_revs (host) VALUES ('${HX}'), ('${SHARED}')`);
    gate = await db.pool.connect();
    await gate.query('SELECT pg_advisory_lock($1)', [GATE]);
  });
  afterEach(async () => {
    await gate.query('SELECT pg_advisory_unlock_all()');
    gate.release();
    for (const t of ['domains', 'funnels', 'routes']) await q(`DROP TRIGGER IF EXISTS lock_order_gate ON ${t}`);
  });
  const open = () => gate.query('SELECT pg_advisory_unlock($1)', [GATE]);
  const live = (host, prefix) =>
    q(
      `INSERT INTO routes (host, path_prefix, version_id, updated_by)
       SELECT $1, $2, v.id, 't' FROM versions v JOIN funnels f ON f.id = v.funnel_id WHERE f.slug = 'fun' AND v.n = 1`,
      [host, prefix],
    );
  // Every route on a host of an app carries a funnel of that app (spec admin-console-p4a decision #3).
  const foreignRoutes = () =>
    q(`SELECT r.host, f.slug FROM routes r JOIN versions v ON v.id = r.version_id JOIN funnels f ON f.id = v.funnel_id
         JOIN domains d ON d.host = r.host WHERE d.app_id IS NOT NULL AND f.app_id IS DISTINCT FROM d.app_id`);

  it('(a) setDomain(host → xapp) racing setFunnelApp(funnel live on the host → yapp): exactly one wins, the other 409s', async () => {
    await live(SHARED, '/f');
    await gateOn('UPDATE', 'domains');
    await gateOn('UPDATE', 'funnels');
    const dom = outcome(setDomain(db.pool, { host: SHARED, appId: 'xapp', actor: 't' }));
    const fun = outcome(setFunnelApp(db.pool, { slug: 'fun', appId: 'yapp', actor: 't' }));
    await waiters(2, dom, fun);
    await open();
    const out = [await dom, await fun];
    expect(out.filter((o) => o.ok)).toHaveLength(1);
    const lost = out.find((o) => !o.ok);
    expect(lost.status).toBe(409);
    expect(['domain_has_foreign_routes', 'funnel_live_on_app_domain']).toContain(lost.code);
    expect(out.some((o) => o.code === '40P01')).toBe(false);
    expect(await foreignRoutes()).toEqual([]);
  });

  it('(b) setRoute(funnel onto an xapp host) racing setFunnelApp(funnel → yapp): one 409s, never a yapp funnel live on an xapp host', async () => {
    await gateOn('INSERT', 'routes');
    await gateOn('UPDATE', 'funnels');
    const kv = fakeKv();
    const pub = outcome(setRoute(db.pool, kv, { host: HX, prefix: '/p', slug: 'fun', v: 1, actor: 't' }));
    const fun = outcome(setFunnelApp(db.pool, { slug: 'fun', appId: 'yapp', actor: 't' }));
    await waiters(2, pub, fun);
    await open();
    const out = [await pub, await fun];
    expect(out.filter((o) => o.ok)).toHaveLength(1);
    const lost = out.find((o) => !o.ok);
    expect(lost.status).toBe(409);
    expect(['domain_app_mismatch', 'funnel_live_on_app_domain']).toContain(lost.code);
    expect(out.some((o) => o.code === '40P01')).toBe(false);
    expect(await foreignRoutes()).toEqual([]);
  });

  // The pixel holds the funnel row while it bumps the hosts' revs; setRoute holds the host while it reads the
  // funnel. Both orders of arrival; both changes complete and the host's KV document carries the new pixel.
  for (const first of ['pixel', 'route']) {
    it(`(c) setFunnelPixel racing setRoute on the same funnel and host (${first} first): both complete, no deadlock`, async () => {
      await live(HX, '/a');
      await (first === 'pixel' ? gateOn('UPDATE', 'funnels') : gateOn('INSERT', 'routes'));
      const kv = fakeKv();
      const startPixel = () => outcome(setFunnelPixel(db.pool, kv, { slug: 'fun', pixelId: '123456', actor: 't' }));
      const startRoute = () => outcome(setRoute(db.pool, kv, { host: HX, prefix: '/b', slug: 'fun', v: 1, actor: 't' }));
      const one = first === 'pixel' ? startPixel() : startRoute();
      await waiters(1, one);
      const two = first === 'pixel' ? startRoute() : startPixel();
      await waiters(2, two);
      await open();
      const out = [await one, await two];
      expect(out.map((o) => o.code)).not.toContain('40P01');
      expect(out.map((o) => o.ok)).toEqual([true, true]);
      const doc = kv.doc(HX);
      expect(doc.routes.map((r) => [r.prefix, r.pixel])).toEqual([['/a', '123456'], ['/b', '123456']]);
    });
  }
});
```

`services/core-api/test/require-grant.test.js` (sửa, áp dụng đúng diff này) — test minh hoạ `requireRole` bằng `GET /v1/domains`, route mà task này chuyển sang `requireGrant`; không còn route nào dùng `requireRole`, nên test gắn `requireRole` vào một route Fastify riêng, ý nghĩa giữ nguyên (viewer qua, role NULL → 403):

`services/core-api/test/require-grant.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/test/require-grant.test.js b/services/core-api/test/require-grant.test.js
index 9162f4d..4343f37 100644
--- a/services/core-api/test/require-grant.test.js
+++ b/services/core-api/test/require-grant.test.js
@@ -3,7 +3,7 @@ import Fastify from 'fastify';
 import { startDb, resetDb } from './helpers/db.js';
 import { makeApp, tokenFor, bearer } from './helpers/app.js';
 import { ADMIN_ORIGIN } from './helpers/admin.js';
-import { requireGrant } from '../src/auth.js';
+import { requireGrant, requireRole } from '../src/auth.js';
 import { appOfApp, appOfFunnel, appOfGrant, appOfHost } from '../src/admin/resolve.js';
 import { createSession, SESSION_COOKIE } from '../src/admin/sessions.js';
 
@@ -209,11 +209,17 @@ describe('requireGrant, resolvers, requireRole, auth/me (per-app roles)', () =>
     afterEach(() => app.close());
     const get = (url, p) => app.inject({ method: 'GET', url, headers: p.headers(false) });
 
-    // GET /v1/domains: still on requireRole here (GET /v1/funnels moved to requireGrant in Task 4).
-    it('a viewer person still reads GET /v1/domains; a person with role NULL gets 403', async () => {
-      expect((await get('/v1/domains', await person('v@ikameglobal.com', 'viewer'))).statusCode).toBe(200);
-      const none = await get('/v1/domains', await person('n@ikameglobal.com', null, { apps: { starlyn: 'admin' } }));
+    // No route uses requireRole any more (GET /v1/domains moved to requireGrant in Task 5): the check itself, on a
+    // route of its own.
+    it('requireRole: a viewer person passes viewer; a person with role NULL gets 403', async () => {
+      const own = Fastify();
+      own.get('/role', { onRequest: requireRole(db.pool, 'viewer') }, async () => ({ ok: true }));
+      await own.ready();
+      const at = (p) => own.inject({ method: 'GET', url: '/role', headers: p.headers(false) });
+      expect((await at(await person('v@ikameglobal.com', 'viewer'))).statusCode).toBe(200);
+      const none = await at(await person('n@ikameglobal.com', null, { apps: { starlyn: 'admin' } }));
       expect([none.statusCode, none.json()]).toEqual([403, { error: 'forbidden' }]);
+      await own.close();
     });
 
     it('a global person passes admin-only requireRole whatever its role column says', async () => {
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/scope-routes-b.test.js test/lock-order.test.js test/require-grant.test.js
```

Expected: `Test Files  2 failed | 1 passed (3)`, `Tests  12 failed | 28 passed (40)`: 10 test của `scope-routes-b.test.js` fail vì các route còn `requireRole` (người `role NULL` + dòng `starlyn` bị `403` ở mọi route, `GET /v1/routes/go.chatchi.app` trả `200`, danh sách domain không lọc); 3 test pass sẵn (`PUT /v1/domains/:host`, rotate-user-id, billing/users/tokens — vốn đã chỉ cho global); `lock-order.test.js` (a) và (b) fail vì cả hai thay đổi cùng thành công (write skew 4a: `expected [...] to have a length of 1 but got 2`); (c) pass (setRoute chưa khoá funnel nên chưa có deadlock); `require-grant.test.js` pass (24).

- [ ] **Step 3: Implement**

`services/core-api/src/identity/apps.js`, `services/core-api/src/publisher/publish.js`, `services/core-api/src/publisher/domains.js`, `services/core-api/src/publisher/routes.js`, `services/core-api/src/publisher/funnels.js` (sửa, áp dụng đúng diff này) — thứ tự khoá `domains` (host tăng dần) → `funnels`, và `listRoutes({visible})`:

`services/core-api/src/identity/apps.js`, `services/core-api/src/publisher/publish.js`, `services/core-api/src/publisher/domains.js`, `services/core-api/src/publisher/routes.js`, `services/core-api/src/publisher/funnels.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/identity/apps.js b/services/core-api/src/identity/apps.js
index d9df02f..59b9032 100644
--- a/services/core-api/src/identity/apps.js
+++ b/services/core-api/src/identity/apps.js
@@ -186,6 +186,8 @@ export function requireApp(pool) {
 // from before the attach get their entitlements (and can restore by email) without a new billing event.
 export async function setFunnelApp(pool, { slug, appId, actor }) {
   return withTx(pool, async (c) => {
+    // Lock order: domains (host asc) → funnels (spec admin-console-p4b §5): the hosts the funnel is live on first.
+    await lockFunnelDomains(c, slug);
     const { rows } = await c.query('SELECT id, app_id FROM funnels WHERE slug = $1 FOR NO KEY UPDATE', [slug]);
     if (!rows.length) throw new HttpError(404, 'funnel_not_found', { funnel: slug });
     if (rows[0].app_id === appId) return { funnel: slug, app_id: appId };
@@ -194,8 +196,23 @@ export async function setFunnelApp(pool, { slug, appId, actor }) {
   });
 }
 
-// The app change itself, inside the caller's transaction with the funnel row locked: PUT /v1/funnels/:slug, and
-// an upload with app_id onto a funnel that has no app yet (spec admin-console-p4a §2, coordinator ruling).
+// Spec admin-console-p4b §5 (the 4a write skew): setDomain, the funnel app change and setRoute take their locks in
+// one order — the domains rows (host asc), then the funnels row — so a host's app and a funnel's app cannot both
+// pass their checks at once, and no two of them deadlock. Before locking a funnel whose app may change, lock the
+// rows of the hosts it is live on. A route published after this read waits for the funnel row (setRoute takes it
+// FOR SHARE) and then sees the new app, so the check in assignFunnelApp covers it.
+export async function lockFunnelDomains(c, slug) {
+  await c.query(
+    `SELECT host FROM domains
+      WHERE host IN (SELECT r.host FROM routes r JOIN versions v ON v.id = r.version_id JOIN funnels f ON f.id = v.funnel_id WHERE f.slug = $1)
+      ORDER BY host FOR UPDATE`,
+    [slug],
+  );
+}
+
+// The app change itself, inside the caller's transaction with the domains of its live hosts and then the funnel row
+// locked (lockFunnelDomains): PUT /v1/funnels/:slug, and an upload with app_id onto a funnel that has no app yet
+// (spec admin-console-p4a §2, coordinator ruling). The check below runs after both locks.
 export async function assignFunnelApp(c, { funnelId, slug, appId, actor }) {
   // Final review #1 (spec §2 "Domain và publish"): a funnel live on a host of another app than the new one would
   // leave that host serving a foreign funnel; the routes must go first. Shared hosts (app_id NULL) do not count, so
diff --git a/services/core-api/src/publisher/domains.js b/services/core-api/src/publisher/domains.js
index 6678ee9..13bef4e 100644
--- a/services/core-api/src/publisher/domains.js
+++ b/services/core-api/src/publisher/domains.js
@@ -17,6 +17,15 @@ export async function setDomain(pool, { host, status, appId, actor }) {
     // foreign route can be published between the check below and the update.
     const cur = (await c.query('SELECT status, app_id FROM domains WHERE host = $1 FOR UPDATE', [host])).rows[0];
     if (appId) {
+      // Lock order: domains (host asc) → funnels (spec admin-console-p4b §5): the funnels live on the host, FOR SHARE,
+      // so none of them changes app between the check below and the commit (a change under way commits first and
+      // the check sees it).
+      await c.query(
+        `SELECT id FROM funnels
+          WHERE id IN (SELECT v.funnel_id FROM routes r JOIN versions v ON v.id = r.version_id WHERE r.host = $1)
+          ORDER BY id FOR SHARE`,
+        [host],
+      );
       // An unassigned funnel counts as foreign: it may only be live on a shared host (spec §2).
       const { rows } = await c.query(
         `SELECT r.path_prefix AS prefix, f.slug, f.app_id
diff --git a/services/core-api/src/publisher/funnels.js b/services/core-api/src/publisher/funnels.js
index 9bff9a3..c67d6fa 100644
--- a/services/core-api/src/publisher/funnels.js
+++ b/services/core-api/src/publisher/funnels.js
@@ -12,22 +12,26 @@ export async function setFunnelPixel(pool, kv, { slug, pixelId, actor, log }) {
   let hosts;
   try {
     await c.query('BEGIN');
+    const liveHosts = async () =>
+      (
+        await c.query(
+          `SELECT DISTINCT r.host FROM routes r JOIN versions v ON v.id = r.version_id JOIN funnels f ON f.id = v.funnel_id
+            WHERE f.slug = $1 ORDER BY r.host`,
+          [slug],
+        )
+      ).rows.map((r) => r.host);
+    // Lock order: domains (host asc) → funnels (spec admin-console-p4b §5): the hosts' rows before the funnel row, as
+    // route changes do (setRoute holds the host and then takes the funnel FOR SHARE).
+    const locked = await liveHosts();
+    if (locked.length) await c.query('SELECT host FROM domains WHERE host = ANY($1) ORDER BY host FOR UPDATE', [locked]);
     const f = await c.query('UPDATE funnels SET pixel_id = $2 WHERE slug = $1 RETURNING id, app_id', [slug, pixelId]);
     if (!f.rows.length) throw new HttpError(404, 'funnel_not_found', { funnel: slug });
     // Spec admin-console-p4a §2 "Audit": the row belongs to the funnel's app.
     await audit(c, actor, 'funnel.pixel', `funnel:${slug}`, { slug, pixel_id: pixelId }, { app_id: f.rows[0].app_id });
-    hosts = (
-      await c.query(
-        `SELECT DISTINCT r.host FROM routes r JOIN versions v ON v.id = r.version_id
-          WHERE v.funnel_id = $1 ORDER BY r.host`,
-        [f.rows[0].id],
-      )
-    ).rows.map((r) => r.host);
-    if (hosts.length) {
-      // Same lock order as route changes (domains row first), host by host in a fixed order.
-      await c.query('SELECT host FROM domains WHERE host = ANY($1) ORDER BY host FOR UPDATE', [hosts]);
-      await c.query('UPDATE host_revs SET rev = rev + 1 WHERE host = ANY($1)', [hosts]);
-    }
+    // A route that went live between the read above and the funnel lock is read now (no other one can commit while
+    // the funnel row is held); its host gets the rev bump too, without its domains row (that would invert the order).
+    hosts = [...new Set([...locked, ...(await liveHosts())])].sort();
+    if (hosts.length) await c.query('UPDATE host_revs SET rev = rev + 1 WHERE host = ANY($1)', [hosts]);
     await c.query('COMMIT');
   } catch (err) {
     await c.query('ROLLBACK').catch(() => {});
diff --git a/services/core-api/src/publisher/publish.js b/services/core-api/src/publisher/publish.js
index 3f88f89..e1f67d8 100644
--- a/services/core-api/src/publisher/publish.js
+++ b/services/core-api/src/publisher/publish.js
@@ -1,7 +1,7 @@
 import { createHash } from 'node:crypto';
 import { actorOf, audit } from '../audit.js';
 import { HttpError } from '../errors.js';
-import { assignFunnelApp } from '../identity/apps.js';
+import { assignFunnelApp, lockFunnelDomains } from '../identity/apps.js';
 import { StoreUnavailableError } from './bundle-store.js';
 import { insertFunnel } from './catalog.js';
 
@@ -37,6 +37,14 @@ export async function publishVersion(
   const client = await pool.connect();
   try {
     await client.query('BEGIN');
+    // Lock order: domains (host asc) → funnels (spec admin-console-p4b §5). Only a funnel with no app yet is assigned
+    // below (an app is never taken back, spec admin-console-p4a decision #5); it can be live on shared hosts only,
+    // but their rows are locked first all the same, so the rule has no exception. A slug that does not exist yet is
+    // live nowhere.
+    if (appId) {
+      const peek = (await client.query('SELECT app_id FROM funnels WHERE slug = $1', [slug])).rows[0];
+      if (peek && peek.app_id === null) await lockFunnelDomains(client, slug);
+    }
     // The row lock serializes publishes of one funnel: n is allocated once and no two R2 writes race.
     const lockFunnel = async () => (await client.query('SELECT id, app_id FROM funnels WHERE slug = $1 FOR UPDATE', [slug])).rows[0];
     let funnel = await lockFunnel();
diff --git a/services/core-api/src/publisher/routes.js b/services/core-api/src/publisher/routes.js
index 1f8d5cc..1d73795 100644
--- a/services/core-api/src/publisher/routes.js
+++ b/services/core-api/src/publisher/routes.js
@@ -56,8 +56,15 @@ export async function setRoute(pool, kv, { host, prefix, slug, v, actor, confirm
   const p = checkPrefix(prefix);
   const who = actorOf(actor);
   const out = await inHostTx(pool, host, {}, async (c, domain) => {
+    // Lock order: domains (host asc) → funnels (spec admin-console-p4b §5): the host row is locked (inHostTx), now the
+    // funnel row FOR SHARE, so its app cannot change until this commits; a change already under way commits first
+    // and this read then sees the new app (domain_app_mismatch below). setFunnelPixel and the app change lock the
+    // hosts before the funnel too, so this cannot deadlock with them (the cause of the revert in 2af9add).
     const ver = (
-      await c.query('SELECT v.id, v.lint_report, f.app_id FROM versions v JOIN funnels f ON f.id = v.funnel_id WHERE f.slug = $1 AND v.n = $2', [slug, v])
+      await c.query(
+        'SELECT v.id, v.lint_report, f.app_id FROM versions v JOIN funnels f ON f.id = v.funnel_id WHERE f.slug = $1 AND v.n = $2 FOR SHARE OF f',
+        [slug, v],
+      )
     ).rows[0];
     if (!ver) throw new HttpError(404, 'version_not_found', { funnel: slug, v });
     // Uploads with lint errors are refused since admin-console-p1; an older version may still carry some.
@@ -140,7 +147,9 @@ export async function removeRoute(pool, kv, { host, prefix, actor, log }) {
   return { ...out, ...(await trySync(pool, kv, host, log)) };
 }
 
-export async function listRoutes(pool, host) {
+// visible(appId) → whether the caller may see a route of a funnel of that app (null = unassigned); spec
+// admin-console-p4b §2: on a shared host a caller limited to some apps sees only their funnels' routes.
+export async function listRoutes(pool, host, { visible = () => true } = {}) {
   const d = (
     await pool.query(
       'SELECT d.status, h.rev, h.kv_synced_rev FROM domains d JOIN host_revs h USING (host) WHERE d.host = $1',
@@ -149,12 +158,13 @@ export async function listRoutes(pool, host) {
   ).rows[0];
   if (!d) throw new HttpError(404, 'domain_not_found', { host });
   const { rows } = await pool.query(
-    `SELECT r.path_prefix AS prefix, f.slug AS funnel, v.n AS v, r.updated_by, r.updated_at
+    `SELECT r.path_prefix AS prefix, f.slug AS funnel, v.n AS v, r.updated_by, r.updated_at, f.app_id
        FROM routes r JOIN versions v ON v.id = r.version_id JOIN funnels f ON f.id = v.funnel_id
       WHERE r.host = $1`,
     [host],
   );
-  return { host, status: d.status, rev: Number(d.rev), kv_synced_rev: Number(d.kv_synced_rev), routes: sortRoutes(rows) };
+  const routes = rows.filter((r) => visible(r.app_id)).map(({ app_id, ...r }) => r);
+  return { host, status: d.status, rev: Number(d.rev), kv_synced_rev: Number(d.kv_synced_rev), routes: sortRoutes(routes) };
 }
 
 // Rebuilds the whole host document under a per-host lock, so the last KV write always carries
PATCH
```

`services/core-api/src/admin/resolve.js`, `services/core-api/src/admin/scope.js`, `services/core-api/src/publisher/catalog.js` (sửa, áp dụng đúng diff này):

`services/core-api/src/admin/resolve.js`, `services/core-api/src/admin/scope.js`, `services/core-api/src/publisher/catalog.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/admin/resolve.js b/services/core-api/src/admin/resolve.js
index bfe041f..3a5fec2 100644
--- a/services/core-api/src/admin/resolve.js
+++ b/services/core-api/src/admin/resolve.js
@@ -1,3 +1,5 @@
+import { isValidPrefix, normalizePath } from '@ikf/route-match';
+
 // Spec admin-console-p4b §2 "Middleware": resolvers for requireGrant(pool, grant, { app }). Each looks up the app a
 // resource belongs to in one query → app id, null (unassigned funnel / shared domain: global only) or undefined
 // (no such resource: the handler answers its own 404 as before).
@@ -20,3 +22,32 @@ export const appOfApp = (db, id) => one(db, 'SELECT id AS app_id FROM apps WHERE
 // requireGrant notFound bodies (ruling B4): out of scope a GET answers exactly what the handler answers for a missing
 // funnel, so the two cannot be told apart.
 export const funnelNotFound = (req) => ({ error: 'funnel_not_found', detail: { funnel: req.params.slug } });
+
+// The funnel live at host + prefix (rollback / delete act on it, spec admin-console-p4b §2). prefix as the handler
+// stores it (normalized); none live → undefined (the handler's route_not_found / invalid_prefix).
+export const appOfRoute = async (db, host, prefix) => {
+  const p = typeof prefix === 'string' ? normalizePath(prefix) : null;
+  if (!p || !isValidPrefix(p)) return undefined;
+  const { rows } = await db.query(
+    `SELECT f.app_id FROM routes r JOIN versions v ON v.id = r.version_id JOIN funnels f ON f.id = v.funnel_id
+      WHERE r.host = $1 AND r.path_prefix = $2`,
+    [host, p],
+  );
+  return rows.length ? rows[0].app_id : undefined;
+};
+
+// The app of the funnel behind the claim resend-email would reset: the same claim (newest checkout claim of an app of
+// kind 'app', src/identity/customer-actions.js), then its checkout's funnel. No customer or claim → undefined.
+export const appOfClaim = (db, ref) =>
+  one(
+    db,
+    `SELECT f.app_id FROM customers cu
+       JOIN claim_tokens ct ON ct.customer_id = cu.id JOIN apps a ON a.id = ct.app_id
+       JOIN checkouts ck ON ck.id = ct.checkout_id JOIN funnels f ON f.id = ck.funnel_id
+      WHERE cu.ref = $1 AND a.kind = 'app'
+      ORDER BY ct.created_at DESC, ct.checkout_id DESC LIMIT 1`,
+    ref,
+  );
+
+// Out of scope a host looks like a missing one (src/publisher/routes.js listRoutes).
+export const domainNotFound = (req) => ({ error: 'domain_not_found', detail: { host: req.params.host } });
diff --git a/services/core-api/src/admin/scope.js b/services/core-api/src/admin/scope.js
index 599326a..4ae7852 100644
--- a/services/core-api/src/admin/scope.js
+++ b/services/core-api/src/admin/scope.js
@@ -30,8 +30,11 @@ async function personScope(db, actor) {
   const global = rows.length > 0 && rows[0].global;
   // global ⇒ admin in every app, ignoring the default role and the per-app rows (spec §1).
   const roles = new Map(rows.filter((r) => r.app_id !== null).map((r) => [r.app_id, global ? 'admin' : (r.app_role ?? r.default_role)]));
-  // global ⇒ admin in any app id, even one not loaded: the handler answers 404 for a missing resource.
-  const roleIn = (appId) => (global ? 'admin' : (roles.get(appId) ?? null));
+  // global ⇒ admin in any app id, even one not loaded: the handler answers 404 for a missing resource. Likewise the
+  // default role for an id not loaded (it covers every app, present or future): a support person from before 008
+  // asking about an unknown app gets the handler's app_not_found, as before (POST /v1/customers/lookup).
+  const defaultRole = rows[0]?.default_role ?? null;
+  const roleIn = (appId) => (global ? 'admin' : (roles.has(appId) ? roles.get(appId) : defaultRole));
   const appIds = [...roles].filter(([, role]) => role !== null).map(([id]) => id).sort();
   return {
     global,
@@ -39,7 +42,7 @@ async function personScope(db, actor) {
     appIds: () => [...appIds],
     grantsIn: (appId) => USER_GRANTS[roleIn(appId)] ?? [],
     globalGrants: global ? USER_GRANTS.admin : [],
-    defaultGrants: global ? USER_GRANTS.admin : (USER_GRANTS[rows[0]?.default_role] ?? []),
+    defaultGrants: global ? USER_GRANTS.admin : (USER_GRANTS[defaultRole] ?? []),
   };
 }
 
diff --git a/services/core-api/src/publisher/catalog.js b/services/core-api/src/publisher/catalog.js
index 4acf06d..0de7b07 100644
--- a/services/core-api/src/publisher/catalog.js
+++ b/services/core-api/src/publisher/catalog.js
@@ -117,7 +117,10 @@ export async function createFunnel(pool, { slug, appId, actor }) {
 
 // app (spec admin-console-p4a §2): the hosts a funnel of that app can go live on = the app's own and the shared
 // ones (app_id NULL); 'none' = shared only.
-export async function listDomains(pool, { app = null } = {}) {
+// visible(appId) → whether the caller may see a host of that app / a route of a funnel of that app (null = shared
+// host / unassigned funnel); spec admin-console-p4b §2: the hosts of the apps in scope plus the shared ones, and on
+// a shared host only the routes of funnels in scope.
+export async function listDomains(pool, { app = null, visible = () => true } = {}) {
   const domains = (
     await pool.query(
       `SELECT d.host, d.status, d.app_id, h.rev, h.kv_synced_rev FROM domains d JOIN host_revs h USING (host)
@@ -128,12 +131,12 @@ export async function listDomains(pool, { app = null } = {}) {
   ).rows;
   const routes = (
     await pool.query(
-      `SELECT r.host, r.path_prefix AS prefix, f.slug, v.n AS v
+      `SELECT r.host, r.path_prefix AS prefix, f.slug, v.n AS v, f.app_id
          FROM routes r JOIN versions v ON v.id = r.version_id JOIN funnels f ON f.id = v.funnel_id
         ORDER BY r.host, r.path_prefix`,
     )
-  ).rows;
-  return domains.map((d) => ({
+  ).rows.filter((r) => visible(r.app_id));
+  return domains.filter((d) => d.app_id === null || visible(d.app_id)).map((d) => ({
     host: d.host,
     status: d.status,
     app_id: d.app_id,
PATCH
```

`services/core-api/src/http/routes.js`, `services/core-api/src/http/domains.js`, `services/core-api/src/http/catalog.js` (sửa, áp dụng đúng diff này):

`services/core-api/src/http/routes.js`, `services/core-api/src/http/domains.js`, `services/core-api/src/http/catalog.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/http/catalog.js b/services/core-api/src/http/catalog.js
index 3da2e0a..424ac2e 100644
--- a/services/core-api/src/http/catalog.js
+++ b/services/core-api/src/http/catalog.js
@@ -1,6 +1,6 @@
 import { listAudit } from '../audit.js';
 import { appOfFunnel, funnelNotFound } from '../admin/resolve.js';
-import { hasGrant, requireGrant, requireRole } from '../auth.js';
+import { hasGrant, requireGrant } from '../auth.js';
 import { HttpError } from '../errors.js';
 import { createFunnel, funnelDetail, listDomains, listFunnels } from '../publisher/catalog.js';
 
@@ -10,8 +10,6 @@ const APP_ID = { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{1,30}$' };
 
 // Admin console reads (any signed-in person or token) and funnel creation (spec admin-console-p1 §3).
 export default async function catalogHttp(app, { pool, previewBaseUrl = null }) {
-  const viewer = requireRole(pool, 'viewer');
-
   app.get(
     '/v1/funnels',
     {
@@ -62,7 +60,8 @@ export default async function catalogHttp(app, { pool, previewBaseUrl = null })
   app.get(
     '/v1/domains',
     {
-      onRequest: viewer,
+      // Spec admin-console-p4b §2: any viewer; the handler keeps the hosts of the apps in scope and the shared ones.
+      onRequest: requireGrant(pool, 'viewer', { app: 'any' }),
       schema: {
         querystring: {
           type: 'object',
@@ -72,13 +71,24 @@ export default async function catalogHttp(app, { pool, previewBaseUrl = null })
         },
       },
     },
-    async (req) => ({ domains: await listDomains(pool, { app: req.query.app ?? null }) }),
+    async (req) => ({
+      domains: await listDomains(pool, { app: req.query.app ?? null, visible: (appId) => hasGrant(req.scope, 'viewer', appId) }),
+    }),
   );
 
+  // Spec admin-console-p4b §2: ?app= → viewer in that app (out of scope, like an unknown app for a scoped caller:
+  // 404 app_not_found); no ?app= → the whole history, global only (or a default role, which reaches every app:
+  // hasGrant(…, null), spec §1), else 403.
+  const inAuditApp = requireGrant(pool, 'viewer', {
+    app: async (req) => req.query.app,
+    notFound: (req) => ({ error: 'app_not_found', detail: { app_id: req.query.app } }),
+  });
+  const allApps = async (req, reply) =>
+    (hasGrant(req.scope, 'viewer', null) ? undefined : reply.code(403).send({ error: 'forbidden' }));
   app.get(
     '/v1/audit',
     {
-      onRequest: viewer,
+      onRequest: [requireGrant(pool, 'viewer', { app: 'any' }), (req, reply) => (req.query.app ? inAuditApp(req, reply) : allApps(req, reply))],
       schema: {
         querystring: {
           type: 'object',
diff --git a/services/core-api/src/http/domains.js b/services/core-api/src/http/domains.js
index 7fc1cc6..6fc04c6 100644
--- a/services/core-api/src/http/domains.js
+++ b/services/core-api/src/http/domains.js
@@ -1,15 +1,16 @@
-import { requireRole } from '../auth.js';
+import { requireGrant } from '../auth.js';
 import { HttpError } from '../errors.js';
 import { setDomain } from '../publisher/domains.js';
 import { hostParams } from './schemas.js';
 
 // Called by scripts/sync-domains.sh after terraform apply ({status}; Terraform owns the list of domains), and by
 // an admin assigning a host to an app ({app_id}; null = shared) — spec admin-console-p4a §2 "Domain và publish".
+// Global only (spec admin-console-p4b §2): a host's app decides which apps' funnels it serves.
 export default async function domainsHttp(app, { pool }) {
   app.put(
     '/v1/domains/:host',
     {
-      onRequest: requireRole(pool, 'admin'),
+      onRequest: requireGrant(pool, 'admin', { app: 'global' }),
       schema: {
         params: hostParams,
         body: {
diff --git a/services/core-api/src/http/routes.js b/services/core-api/src/http/routes.js
index e10a0ca..25da4eb 100644
--- a/services/core-api/src/http/routes.js
+++ b/services/core-api/src/http/routes.js
@@ -1,21 +1,44 @@
-import { requireRole } from '../auth.js';
+import { appOfFunnel, appOfHost, appOfRoute, domainNotFound } from '../admin/resolve.js';
+import { hasGrant, requireGrant } from '../auth.js';
 import { HttpError } from '../errors.js';
 import { KvUnavailableError } from '../publisher/route-kv.js';
 import { listRoutes, removeRoute, rollbackRoute, setRoute, syncHost } from '../publisher/routes.js';
 import { hostParams, prefixSchema } from './schemas.js';
 
+// Spec admin-console-p4b §2 "Bảng route": a route change needs router in the app of the funnel it puts live or takes
+// off (the host's own app rule from 4a still applies in setRoute); reading and syncing go by the host's app.
 export default async function routesHttp(app, { pool, kv }) {
-  const router = requireRole(pool, 'router');
+  // Body / query resolvers run as preHandlers (validated input); this onRequest answers 401/403 before that for a
+  // caller with router nowhere.
+  const routerSomewhere = requireGrant(pool, 'router', { app: 'any' });
+  // rollback / delete: the funnel live at the prefix now (none → the handler's 404).
+  const inLiveFunnelApp = (prefixOf) => requireGrant(pool, 'router', { app: (req, db) => appOfRoute(db, req.params.host, prefixOf(req)) });
   const prefixBody = { type: 'object', required: ['prefix'], properties: { prefix: prefixSchema } };
 
-  app.get('/v1/routes/:host', { onRequest: requireRole(pool, 'viewer'), schema: { params: hostParams } }, async (req) =>
-    listRoutes(pool, req.params.host),
+  app.get(
+    '/v1/routes/:host',
+    {
+      // Viewer in the host's app (out of scope = a missing domain, ruling B4). A shared host (null) is open to a viewer
+      // of any app: the resolver answers undefined (pass) for it and the handler lists only the routes of funnels in
+      // scope.
+      onRequest: [
+        requireGrant(pool, 'viewer', { app: 'any' }),
+        requireGrant(pool, 'viewer', {
+          app: async (req, db) => (await appOfHost(db, req.params.host)) ?? undefined,
+          notFound: domainNotFound,
+        }),
+      ],
+      schema: { params: hostParams },
+    },
+    async (req) => listRoutes(pool, req.params.host, { visible: (appId) => hasGrant(req.scope, 'viewer', appId) }),
   );
 
   app.put(
     '/v1/routes/:host',
     {
-      onRequest: router,
+      onRequest: routerSomewhere,
+      // The funnel in the body (no such funnel → the handler's version_not_found).
+      preHandler: requireGrant(pool, 'router', { app: (req, db) => appOfFunnel(db, req.body.funnel) }),
       schema: {
         params: hostParams,
         body: {
@@ -42,15 +65,21 @@ export default async function routesHttp(app, { pool, kv }) {
       }),
   );
 
-  app.post('/v1/routes/:host/rollback', { onRequest: router, schema: { params: hostParams, body: prefixBody } }, async (req) =>
-    rollbackRoute(pool, kv, { host: req.params.host, prefix: req.body.prefix, actor: req.actor, log: req.log }),
+  app.post(
+    '/v1/routes/:host/rollback',
+    { onRequest: routerSomewhere, preHandler: inLiveFunnelApp((req) => req.body.prefix), schema: { params: hostParams, body: prefixBody } },
+    async (req) => rollbackRoute(pool, kv, { host: req.params.host, prefix: req.body.prefix, actor: req.actor, log: req.log }),
   );
 
-  app.delete('/v1/routes/:host', { onRequest: router, schema: { params: hostParams, querystring: prefixBody } }, async (req) =>
-    removeRoute(pool, kv, { host: req.params.host, prefix: req.query.prefix, actor: req.actor, log: req.log }),
+  app.delete(
+    '/v1/routes/:host',
+    { onRequest: routerSomewhere, preHandler: inLiveFunnelApp((req) => req.query.prefix), schema: { params: hostParams, querystring: prefixBody } },
+    async (req) => removeRoute(pool, kv, { host: req.params.host, prefix: req.query.prefix, actor: req.actor, log: req.log }),
   );
 
-  app.post('/v1/routes/:host/sync', { onRequest: router, schema: { params: hostParams } }, async (req) => {
+  // The host's app; a shared host → global (or the default role, hasGrant(…, null)); no such host → the handler's 404.
+  const inHostApp = requireGrant(pool, 'router', { app: (req, db) => appOfHost(db, req.params.host) });
+  app.post('/v1/routes/:host/sync', { onRequest: [routerSomewhere, inHostApp], schema: { params: hostParams } }, async (req) => {
     try {
       return { host: req.params.host, rev: await syncHost(pool, kv, req.params.host), kv_sync: 'ok' };
     } catch (err) {
PATCH
```

`services/core-api/src/http/customers.js`, `services/core-api/src/http/billing.js` (sửa, áp dụng đúng diff này):

`services/core-api/src/http/customers.js`, `services/core-api/src/http/billing.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/http/billing.js b/services/core-api/src/http/billing.js
index c496ef5..f0959af 100644
--- a/services/core-api/src/http/billing.js
+++ b/services/core-api/src/http/billing.js
@@ -1,5 +1,5 @@
 import { audit } from '../audit.js';
-import { requireRole } from '../auth.js';
+import { requireGrant } from '../auth.js';
 import { paddleHttpError } from '../billing/errors.js';
 import { listOutbox, reconcile } from '../billing/reconcile.js';
 import { HttpError } from '../errors.js';
@@ -7,7 +7,8 @@ import { HttpError } from '../errors.js';
 export const MAX_RECONCILE_SECONDS = 30 * 86400;
 
 export default async function billingHttp(app, { pool, paddle, queue, alarm, now = Date.now }) {
-  const admin = requireRole(pool, 'admin');
+  // Global only (spec admin-console-p4b §2): billing spans every app.
+  const admin = requireGrant(pool, 'admin', { app: 'global' });
 
   app.post(
     '/v1/billing/reconcile',
diff --git a/services/core-api/src/http/customers.js b/services/core-api/src/http/customers.js
index 742ae15..eaaca8c 100644
--- a/services/core-api/src/http/customers.js
+++ b/services/core-api/src/http/customers.js
@@ -1,4 +1,6 @@
-import { requireRole } from '../auth.js';
+import { appOfClaim, appOfGrant } from '../admin/resolve.js';
+import { hasGrant, requireGrant } from '../auth.js';
+import { HttpError } from '../errors.js';
 import { CUSTOMER_REF_PATTERN, customerReport } from '../identity/customers.js';
 import { resendClaimEmail, rotateUserId } from '../identity/customer-actions.js';
 import { grantEntitlement, revokeGrant } from '../identity/grants.js';
@@ -10,15 +12,24 @@ const refParams = {
 };
 
 // Customers in the admin console (spec admin-console-p2 §2). Bodies carry PII-adjacent data: never cached.
+// Spec admin-console-p4b §2: each action needs its grant in the app it concerns; body resolvers run as preHandlers
+// after an onRequest check that the caller holds the grant somewhere (401/403 before the body is read).
 export default async function customersHttp(app, { pool }) {
-  const admin = requireRole(pool, 'admin');
+  const inBodyApp = (grant) => [
+    requireGrant(pool, grant, { app: 'any' }),
+    requireGrant(pool, grant, { app: async (req) => req.body?.app_id }),
+  ];
 
   // CS lookup: support and admin. POST so the email stays out of URLs and access logs (E10). Exactly one key,
   // plus an optional app_id (spec admin-console-p4a §2 "Khách hàng"; an unknown app → 404 app_not_found).
+  // Spec admin-console-p4b §2: support in app_id; without app_id the report spans every app, so only a caller who
+  // reaches every app (global or a default role, hasGrant(…, null)) may leave it out, anyone else → 400 app_required.
+  const [supportSomewhere, supportInBodyApp] = inBodyApp('support');
   app.post(
     '/v1/customers/lookup',
     {
-      onRequest: requireRole(pool, 'support'),
+      onRequest: supportSomewhere,
+      preHandler: supportInBodyApp,
       schema: {
         body: {
           type: 'object',
@@ -33,25 +44,32 @@ export default async function customersHttp(app, { pool }) {
       },
     },
     async (req, reply) => {
+      if (!req.body.app_id && !hasGrant(req.scope, 'support', null)) throw new HttpError(400, 'app_required');
       reply.header('cache-control', 'no-store');
       return customerReport(pool, req.body);
     },
   );
 
-  app.post('/v1/customers/:ref/resend-email', { onRequest: requireRole(pool, 'support'), schema: { params: refParams } }, async (req, reply) => {
+  // Support in the app of the funnel of the checkout whose claim email is sent again (no customer / claim → the
+  // handler's 404).
+  const inClaimApp = requireGrant(pool, 'support', { app: (req, db) => appOfClaim(db, req.params.ref) });
+  app.post('/v1/customers/:ref/resend-email', { onRequest: inClaimApp, schema: { params: refParams } }, async (req, reply) => {
     reply.header('cache-control', 'no-store');
     return resendClaimEmail(pool, { ref: req.params.ref, actor: req.actor });
   });
 
-  app.post('/v1/customers/:ref/rotate-user-id', { onRequest: admin, schema: { params: refParams } }, async (req, reply) => {
+  // Global only: the user_id is the customer's in every app.
+  app.post('/v1/customers/:ref/rotate-user-id', { onRequest: requireGrant(pool, 'admin', { app: 'global' }), schema: { params: refParams } }, async (req, reply) => {
     reply.header('cache-control', 'no-store');
     return rotateUserId(pool, { ref: req.params.ref, actor: req.actor, log: req.log });
   });
 
+  const [adminSomewhere, adminInBodyApp] = inBodyApp('admin');
   app.post(
     '/v1/customers/:ref/grants',
     {
-      onRequest: admin,
+      onRequest: adminSomewhere,
+      preHandler: adminInBodyApp,
       schema: {
         params: refParams,
         body: {
@@ -77,7 +95,8 @@ export default async function customersHttp(app, { pool }) {
   app.delete(
     '/v1/customers/:ref/grants/:id',
     {
-      onRequest: admin,
+      // The grant's app (manual_grants.app_id); no such grant → the handler's 404.
+      onRequest: requireGrant(pool, 'admin', { app: (req, db) => appOfGrant(db, req.params.id) }),
       schema: {
         params: { ...refParams, required: ['ref', 'id'], properties: { ...refParams.properties, id: { type: 'integer', minimum: 1, maximum: Number.MAX_SAFE_INTEGER } } },
       },
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/scope-routes-b.test.js test/lock-order.test.js test/require-grant.test.js
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  41 passed (41)` (13 + 4 + 24; `lock-order.test.js` chạy ~1,5 s); toàn bộ core-api `Test Files  74 passed (74)`, `Tests  702 passed (702)` (trước task: 72 file / 685 test).

- [ ] **Step 5: Commit**

```bash
git add services/core-api/src/admin/resolve.js services/core-api/src/admin/scope.js services/core-api/src/http/billing.js services/core-api/src/http/catalog.js services/core-api/src/http/customers.js services/core-api/src/http/domains.js services/core-api/src/http/routes.js services/core-api/src/identity/apps.js services/core-api/src/publisher/catalog.js services/core-api/src/publisher/domains.js services/core-api/src/publisher/funnels.js services/core-api/src/publisher/publish.js services/core-api/src/publisher/routes.js services/core-api/test/require-grant.test.js services/core-api/test/scope-routes-b.test.js services/core-api/test/lock-order.test.js
git commit -m "feat(core-api): per-app scope on domains, routes, customers, audit, billing; one lock order for domain, funnel app and publish
```

---

---

### Task 6: CLI — admin theo app, token theo app, thông điệp not_found

**Files:**
- Create: `packages/cli/test/admin-apps.test.js`, `packages/cli/test/token.test.js`, `packages/cli/test/errors-scope.test.js`
- Modify: `packages/cli/src/main.js`, `packages/cli/src/api.js`
- Test: `packages/cli/test/admin.test.js` (chỉ bảng `admin ls` và dòng USAGE của `admin add`)

**Interfaces:**
- Consumes: `GET /v1/admin/users` → `{users: [{id, email, name, role, global, disabled_at, apps: [{app_id, role}]}]}`; `POST /v1/admin/users {email, name?, role: role|null, global?, apps?: [{app_id, role}]}`; `PUT /v1/admin/users/:id {global}`; `PUT /v1/admin/users/:id/apps/:app_id {role}`; `DELETE /v1/admin/users/:id/apps/:app_id`; `POST /v1/tokens {name, roles, app_id?}` → `{name, roles, app_id, token}`; mã lỗi `not_found`, `forbidden`, `last_global_admin`, `cannot_lock_self`, `invalid_roles` (Task 3–5).
- Produces: lệnh `ikf admin add … --role <role|none> [--global] [--app <id>:<role> …]`, `ikf admin ls` (email · role · global · app · trạng thái), `ikf admin grant <email> <app> <role>`, `ikf admin revoke <email> <app>`, `ikf admin global <email> on|off`, `ikf token create <name> --roles publisher[,router] [--app <id>]`; client `api.setAdminUserApp(id, appId, {role})` (retry), `api.removeAdminUserApp(id, appId)` (không retry), `api.createToken(body)` (không retry); `formatApiError` có câu tiếng Việt cho 5 mã trên. Option `--app` thành `multiple: true`; `values.apps` = mọi giá trị, `values.app` = giá trị cuối (các lệnh khác giữ hành vi cũ).

- [ ] **Step 1: Viết test fail**

`packages/cli/test/admin-apps.test.js`, `packages/cli/test/token.test.js`, `packages/cli/test/errors-scope.test.js` (mới):

`packages/cli/test/admin-apps.test.js` (mới):

```js
import { describe, it, expect } from 'vitest';
import { run } from '../src/main.js';
import { createApi } from '../src/api.js';
import { io } from './helpers/io.js';

const user = (o = {}) => ({
  id: 3, email: 'an@ikameglobal.com', name: 'An', role: 'editor', global: false, disabled_at: null, apps: [],
  created_by: 'bootstrap', created_at: '2026-10-11T08:00:00.000Z', ...o,
});

// Spec admin-console-p4b §4: global flag and per-app roles from the CLI.
describe('ikf admin: global flag and per-app roles (spec admin-console-p4b §4)', () => {
  it('add --role none --app <id>:<role> (repeatable): no default role, only the listed apps', async () => {
    const calls = [];
    const t = io({
      createAdminUser: async (b) => {
        calls.push(b);
        return user({ email: 'cs@ikameglobal.com', role: null, apps: [{ app_id: 'chatchi', role: 'viewer' }, { app_id: 'starlyn', role: 'support' }] });
      },
    });
    const argv = ['admin', 'add', 'cs@ikameglobal.com', '--role', 'none', '--app', 'starlyn:support', '--app', 'chatchi:viewer'];
    expect(await run(argv, t.opts)).toBe(0);
    expect(calls).toEqual([{ email: 'cs@ikameglobal.com', role: null, apps: [{ app_id: 'starlyn', role: 'support' }, { app_id: 'chatchi', role: 'viewer' }] }]);
    expect(t.lines).toEqual([
      'cs@ikameglobal.com: không có role mặc định, app chatchi:viewer, starlyn:support (đã thêm). Đăng nhập trang admin bằng Google với email này.',
    ]);
  });

  it('add --role admin --global: a global admin', async () => {
    const calls = [];
    const t = io({ createAdminUser: async (b) => { calls.push(b); return user({ role: 'admin', global: true }); } });
    expect(await run(['admin', 'add', 'an@ikameglobal.com', '--role', 'admin', '--global'], t.opts)).toBe(0);
    expect(calls).toEqual([{ email: 'an@ikameglobal.com', role: 'admin', global: true }]);
    expect(t.lines).toEqual(['an@ikameglobal.com: admin, global (đã thêm). Đăng nhập trang admin bằng Google với email này.']);
  });

  it('ls: email · role · global · apps · disabled', async () => {
    const t = io({
      listAdminUsers: async () => ({
        users: [
          user({ email: 'demo@ikameglobal.com', role: 'admin', global: true }),
          user({ id: 4, email: 'cs@ikameglobal.com', role: null, apps: [{ app_id: 'starlyn', role: 'editor' }, { app_id: 'chatchi', role: 'viewer' }] }),
          user({ id: 5, email: 'old@ikameglobal.com', role: 'viewer', disabled_at: '2026-10-10T00:00:00.000Z' }),
        ],
      }),
    });
    expect(await run(['admin', 'ls'], t.opts)).toBe(0);
    expect(t.lines).toEqual([
      'demo@ikameglobal.com             admin   global -                              hoạt động',
      'cs@ikameglobal.com               -       -      starlyn:editor, chatchi:viewer hoạt động',
      'old@ikameglobal.com              viewer  -      -                              khoá từ 2026-10-10T00:00:00.000Z',
    ]);
  });

  it('grant <email> <app> <role>: finds the person, then PUT …/apps/:app_id', async () => {
    const calls = [];
    const t = io({
      listAdminUsers: async () => ({ users: [user({ id: 7, email: 'cs@ikameglobal.com' })] }),
      setAdminUserApp: async (id, app, b) => { calls.push([id, app, b]); return user({ id: 7, email: 'cs@ikameglobal.com', apps: [{ app_id: 'starlyn', role: 'support' }] }); },
    });
    expect(await run(['admin', 'grant', 'CS@ikameglobal.com', 'starlyn', 'support'], t.opts)).toBe(0);
    expect(calls).toEqual([[7, 'starlyn', { role: 'support' }]]);
    expect(t.lines).toEqual(['cs@ikameglobal.com: support ở app starlyn.']);
  });

  it('revoke <email> <app>: DELETE …/apps/:app_id, the person falls back to the default role', async () => {
    const calls = [];
    const t = io({
      listAdminUsers: async () => ({ users: [user({ id: 7, email: 'cs@ikameglobal.com', apps: [{ app_id: 'starlyn', role: 'support' }] })] }),
      removeAdminUserApp: async (id, app) => { calls.push([id, app]); return user({ id: 7, email: 'cs@ikameglobal.com', role: null }); },
    });
    expect(await run(['admin', 'revoke', 'cs@ikameglobal.com', 'starlyn'], t.opts)).toBe(0);
    expect(calls).toEqual([[7, 'starlyn']]);
    expect(t.lines).toEqual(['cs@ikameglobal.com: đã bỏ role riêng ở app starlyn (role mặc định: không có).']);
  });

  it.each([
    ['on', true, 'an@ikameglobal.com: global admin (mọi app, Users, Billing, token).'],
    ['off', false, 'an@ikameglobal.com: không còn global.'],
  ])('global <email> %s', async (flag, value, line) => {
    const calls = [];
    const t = io({
      listAdminUsers: async () => ({ users: [user()] }),
      updateAdminUser: async (id, b) => { calls.push([id, b]); return user({ global: value }); },
    });
    expect(await run(['admin', 'global', 'an@ikameglobal.com', flag], t.opts)).toBe(0);
    expect(calls).toEqual([[3, { global: value }]]);
    expect(t.lines).toEqual([line]);
  });

  it.each([
    [['admin', 'grant', 'x@ikameglobal.com', 'starlyn', 'viewer']],
    [['admin', 'revoke', 'x@ikameglobal.com', 'starlyn']],
    [['admin', 'global', 'x@ikameglobal.com', 'on']],
  ])('%j: unknown person → exit 1', async (argv) => {
    const t = io({ listAdminUsers: async () => ({ users: [] }) });
    expect(await run(argv, t.opts)).toBe(1);
    expect(t.errors).toEqual(['Không có người dùng x@ikameglobal.com']);
  });

  it.each([
    [['admin', 'add', 'an@ikameglobal.com', '--role', 'none', '--app', 'starlyn'], 'không hiểu --app "starlyn"; dạng đúng: <id>:viewer|support|editor|admin'],
    [['admin', 'add', 'an@ikameglobal.com', '--role', 'none', '--app', 'starlyn:owner'], 'không hiểu --app "starlyn:owner"; dạng đúng: <id>:viewer|support|editor|admin'],
    [['admin', 'add', 'an@ikameglobal.com', '--role', 'none', '--app', 'starlyn:viewer', '--app', 'starlyn:editor'], 'app "starlyn" xuất hiện 2 lần'],
    [['admin', 'add', 'an@ikameglobal.com', '--role', 'boss'], 'cần --role viewer|support|editor|admin|none'],
    [['admin', 'grant', 'an@ikameglobal.com', 'starlyn'], 'cách dùng: ikf admin grant <email> <app> viewer|support|editor|admin'],
    [['admin', 'grant', 'an@ikameglobal.com', 'starlyn', 'owner'], 'cách dùng: ikf admin grant <email> <app> viewer|support|editor|admin'],
    [['admin', 'grant', 'an@ikameglobal.com', 'S', 'viewer'], 'app id không hợp lệ: "S"'],
    [['admin', 'revoke', 'an@ikameglobal.com'], 'cách dùng: ikf admin revoke <email> <app>'],
    [['admin', 'global', 'an@ikameglobal.com', 'yes'], 'cách dùng: ikf admin global <email> on|off'],
    [['admin', 'grant', 'not-an-email', 'starlyn', 'viewer'], 'email không hợp lệ: "not-an-email"'],
  ])('exits 2 on bad usage %j', async (argv, msg) => {
    const never = async () => { throw new Error('must not be called'); };
    const t = io({ createAdminUser: never, listAdminUsers: never, setAdminUserApp: never, removeAdminUserApp: never, updateAdminUser: never });
    expect(await run(argv, t.opts)).toBe(2);
    expect(t.errors).toEqual([msg]);
  });
});

describe('api: admin user apps', () => {
  it('PUT /v1/admin/users/:id/apps/:app_id is retried; DELETE is not', async () => {
    const seen = [];
    let fails = 1;
    const fetch = async (url, init) => {
      seen.push([init.method, url, init.body]);
      if (fails-- > 0) return new Response('{}', { status: 503 });
      return new Response(JSON.stringify(user()), { status: 200 });
    };
    const api = createApi({ api: 'https://api.x/', token: 't' }, { fetch, sleep: async () => {} });
    await api.setAdminUserApp(3, 'starlyn', { role: 'editor' });
    fails = 1;
    await expect(api.removeAdminUserApp(3, 'starlyn')).rejects.toMatchObject({ status: 503 });
    expect(seen).toEqual([
      ['PUT', 'https://api.x/v1/admin/users/3/apps/starlyn', '{"role":"editor"}'],
      ['PUT', 'https://api.x/v1/admin/users/3/apps/starlyn', '{"role":"editor"}'],
      ['DELETE', 'https://api.x/v1/admin/users/3/apps/starlyn', undefined],
    ]);
  });
});
```

`packages/cli/test/token.test.js` (mới):

```js
import { describe, it, expect } from 'vitest';
import { run } from '../src/main.js';
import { createApi } from '../src/api.js';
import { io } from './helpers/io.js';

// Spec admin-console-p4b §4: ikf token create, the token is shown once.
describe('ikf token create (spec admin-console-p4b §4)', () => {
  it('<name> --roles publisher,router --app <id>: a token bound to one app', async () => {
    const calls = [];
    const t = io({
      createToken: async (b) => { calls.push(b); return { name: 'ci-starlyn', roles: ['publisher', 'router'], app_id: 'starlyn', token: 'ikf_abc123' }; },
    });
    expect(await run(['token', 'create', 'ci-starlyn', '--roles', 'publisher,router', '--app', 'starlyn'], t.opts)).toBe(0);
    expect(calls).toEqual([{ name: 'ci-starlyn', roles: ['publisher', 'router'], app_id: 'starlyn' }]);
    expect(t.lines).toEqual([
      'Token ci-starlyn (publisher, router; app starlyn) đã tạo.',
      'Token chỉ hiện MỘT lần: lưu vào password manager ngay, không gửi qua chat.',
      '  ikf_abc123',
    ]);
  });

  it('without --app: no app_id in the body, the token is global', async () => {
    const calls = [];
    const t = io({ createToken: async (b) => { calls.push(b); return { name: 'ops', roles: ['publisher'], app_id: null, token: 'ikf_xyz' }; } });
    expect(await run(['token', 'create', 'ops', '--roles', 'publisher'], t.opts)).toBe(0);
    expect(calls).toEqual([{ name: 'ops', roles: ['publisher'] }]);
    expect(t.lines[0]).toBe('Token ops (publisher; mọi app) đã tạo.');
    expect(t.lines[2]).toBe('  ikf_xyz');
  });

  it.each([
    [['token', 'create', 'ops'], 'cần --roles publisher[,router]'],
    [['token', 'create', 'ops', '--roles', 'publisher,owner'], 'role token không hợp lệ: "owner" (publisher, router, admin)'],
    [['token', 'create', 'ops', '--roles', 'publisher', '--app', 'S'], 'app id không hợp lệ: "S"'],
    [['token', 'create', 'x'.repeat(65), '--roles', 'publisher'], 'tên token 1-64 ký tự'],
    [['token', 'create'], 'cách dùng: ikf token create <name> --roles publisher[,router] [--app <id>]'],
    [['token', 'ls'], 'cách dùng: ikf token create <name> --roles publisher[,router] [--app <id>]'],
  ])('exits 2 on bad usage %j', async (argv, msg) => {
    const t = io({ createToken: async () => { throw new Error('must not be called'); } });
    expect(await run(argv, t.opts)).toBe(2);
    expect(t.errors).toEqual([msg]);
  });
});

describe('api: createToken', () => {
  it('POST /v1/tokens is not retried (a lost reply would leave a token nobody saw)', async () => {
    const seen = [];
    const fetch = async (url, init) => {
      seen.push([init.method, url, init.body]);
      return new Response('{}', { status: 503 });
    };
    const api = createApi({ api: 'https://api.x/', token: 't' }, { fetch, sleep: async () => {} });
    await expect(api.createToken({ name: 'ops', roles: ['publisher'] })).rejects.toMatchObject({ status: 503 });
    expect(seen).toEqual([['POST', 'https://api.x/v1/tokens', '{"name":"ops","roles":["publisher"]}']]);
  });
});
```

`packages/cli/test/errors-scope.test.js` (mới):

```js
import { describe, it, expect } from 'vitest';
import { run } from '../src/main.js';
import { ApiError } from '../src/api.js';
import { io } from './helpers/io.js';

const fail = (status, body) => async () => {
  throw new ApiError(status, body);
};

// Spec admin-console-p4b §4 and decision #5: out of scope reads are 404 not_found, writes 403 forbidden.
describe('CLI messages for scope errors (spec admin-console-p4b §4)', () => {
  it('not_found (outside the caller\'s apps, or missing): one sentence', async () => {
    const t = io({ listPrices: fail(404, { error: 'not_found' }) });
    expect(await run(['funnel', 'prices', 'ls', 'moon-reading'], t.opts)).toBe(1);
    expect(t.errors).toEqual(['Không tìm thấy (hoặc bạn không có quyền).']);
  });

  it('forbidden', async () => {
    const t = io({ setFunnel: fail(403, { error: 'forbidden' }) });
    expect(await run(['funnel', 'set', 'moon-reading', '--pixel', '1234567'], t.opts)).toBe(1);
    expect(t.errors).toEqual(['Bạn không có quyền với thao tác này.']);
  });

  it.each([
    ['last_global_admin', 'Phải còn ít nhất một global admin.'],
    ['cannot_lock_self', 'Không thể tự bỏ global hoặc tự khoá mình.'],
  ])('admin global off → 409 %s', async (code, msg) => {
    const t = io({
      listAdminUsers: async () => ({ users: [{ id: 1, email: 'demo@ikameglobal.com', role: 'admin', global: true, disabled_at: null, apps: [] }] }),
      updateAdminUser: fail(409, { error: code }),
    });
    expect(await run(['admin', 'global', 'demo@ikameglobal.com', 'off'], t.opts)).toBe(1);
    expect(t.errors).toEqual([msg]);
  });

  it('token create --app with a role an app token cannot hold: invalid_roles as a sentence', async () => {
    const t = io({ createToken: fail(400, { error: 'invalid_roles', detail: { allowed: ['publisher', 'router'] } }) });
    expect(await run(['token', 'create', 'ci', '--roles', 'admin', '--app', 'starlyn'], t.opts)).toBe(1);
    expect(t.errors).toEqual(['Token theo app chỉ nhận role publisher, router.']);
  });

  it('invalid_roles without --app keeps the generic form', async () => {
    const t = io({ createToken: fail(400, { error: 'invalid_roles', detail: { allowed: ['publisher', 'router', 'admin'] } }) });
    expect(await run(['token', 'create', 'ci', '--roles', 'admin'], t.opts)).toBe(1);
    expect(t.errors).toEqual(['Lỗi 400 invalid_roles\n  {"allowed":["publisher","router","admin"]}']);
  });
});
```

`packages/cli/test/admin.test.js` (sửa, áp dụng đúng diff này — bảng `admin ls` có thêm cột global và app; dòng USAGE của `admin add` đổi):

`packages/cli/test/admin.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/packages/cli/test/admin.test.js b/packages/cli/test/admin.test.js
index bd0bbd5..dbcad88 100644
--- a/packages/cli/test/admin.test.js
+++ b/packages/cli/test/admin.test.js
@@ -23,12 +23,13 @@ describe('ikf admin (admin console users, spec admin-console-p1 §6)', () => {
     expect(t.lines).toEqual(['cs@ikameglobal.com: support (đã thêm). Đăng nhập trang admin bằng Google với email này.']);
   });
 
+  // Spec admin-console-p4b §4: the global and app columns sit between the role and the status.
   it('ls: one line per person, disabled ones marked', async () => {
     const t = io({ listAdminUsers: async () => ({ users: [user(), user({ id: 4, email: 'old@ikameglobal.com', role: 'viewer', disabled_at: '2026-10-10T00:00:00.000Z' })] }) });
     expect(await run(['admin', 'ls'], t.opts)).toBe(0);
     expect(t.lines).toEqual([
-      'an@ikameglobal.com               editor  hoạt động',
-      'old@ikameglobal.com              viewer  khoá từ 2026-10-10T00:00:00.000Z',
+      'an@ikameglobal.com               editor  -      -                              hoạt động',
+      'old@ikameglobal.com              viewer  -      -                              khoá từ 2026-10-10T00:00:00.000Z',
     ]);
   });
 
@@ -50,7 +51,7 @@ describe('ikf admin (admin console users, spec admin-console-p1 §6)', () => {
     [['admin', 'add', 'an@ikameglobal.com'], 'cần --role viewer|support|editor|admin'],
     [['admin', 'add', 'an@ikameglobal.com', '--role', 'owner'], 'cần --role viewer|support|editor|admin'],
     [['admin', 'add', 'not-an-email', '--role', 'viewer'], 'email không hợp lệ: "not-an-email"'],
-    [['admin', 'rm', 'an@ikameglobal.com'], 'ikf admin add <email> --role viewer|support|editor|admin [--name <tên>]'],
+    [['admin', 'rm', 'an@ikameglobal.com'], 'ikf admin add <email> --role viewer|support|editor|admin|none [--global] [--app <id>:<role> …] [--name <tên>]'],
   ])('exits 2 on bad usage %j', async (argv, msg) => {
     const t = io({ createAdminUser: async () => { throw new Error('must not be called'); } });
     expect(await run(argv, t.opts)).toBe(2);
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
cd packages/cli && npx vitest run test/admin.test.js test/admin-apps.test.js test/token.test.js test/errors-scope.test.js 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Test Files  4 failed (4)`, `Tests  38 failed | 7 passed (45)`: lệnh `token` chưa có (exit 2 với USAGE), `admin grant|revoke|global` chưa có, `--app` lặp lại / `--role none` / `--global` chưa hiểu, `api.setAdminUserApp|removeAdminUserApp|createToken` chưa tồn tại, `not_found`/`forbidden`/`last_global_admin`/`cannot_lock_self` còn in dạng `Lỗi <status> <code>`; trong `admin.test.js` 2 test fail (bảng `ls` cũ, dòng USAGE cũ).

- [ ] **Step 3: Implement**

`packages/cli/src/api.js`, `packages/cli/src/main.js` (sửa, áp dụng đúng diff này):

`packages/cli/src/api.js`, `packages/cli/src/main.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/packages/cli/src/api.js b/packages/cli/src/api.js
index 275d304..488d0e3 100644
--- a/packages/cli/src/api.js
+++ b/packages/cli/src/api.js
@@ -108,6 +108,12 @@ export function createApi({ api, token }, { fetch: doFetch = fetch, retries = 3,
     createAdminUser: (body) => call('POST', '/v1/admin/users', { body, retry: false }),
     // Idempotent: the same change twice gives the same result.
     updateAdminUser: (id, body) => call('PUT', `/v1/admin/users/${id}`, { body, retry: true }),
+    // Spec admin-console-p4b §2 "Users và token". An upsert, so a retry gives the same result.
+    setAdminUserApp: (id, appId, body) => call('PUT', `/v1/admin/users/${id}/apps/${q(appId)}`, { body, retry: true }),
+    // Not retried: a lost reply would turn the retry into 404 user_app_not_found.
+    removeAdminUserApp: (id, appId) => call('DELETE', `/v1/admin/users/${id}/apps/${q(appId)}`, { retry: false }),
+    // Not retried: a lost reply would leave a token nobody saw, and a retry would create a second one.
+    createToken: (body) => call('POST', '/v1/tokens', { body, retry: false }),
     // Never retried: if the first call succeeded but the reply was lost, a retry would roll back twice.
     rollback: (host, prefix) => call('POST', `/v1/routes/${host}/rollback`, { body: { prefix }, retry: false }),
     removeRoute: (host, prefix) => call('DELETE', `/v1/routes/${host}?prefix=${q(prefix)}`, { retry: false }),
diff --git a/packages/cli/src/main.js b/packages/cli/src/main.js
index 95c0823..9e077b1 100755
--- a/packages/cli/src/main.js
+++ b/packages/cli/src/main.js
@@ -39,9 +39,14 @@ const USAGE = `Cách dùng:
   ikf customer revoke <cus_…> <grant_id>
   ikf customer resend-email <cus_…>   (gửi lại email link app của checkout mới nhất)
   ikf customer rotate-user-id <cus_…> --yes   (user_id bị lộ: mọi app đã cài về FREE tới khi khách mở link mới)
-  ikf admin add <email> --role viewer|support|editor|admin [--name <tên>]   (người dùng trang admin, đăng nhập Google; support: tra khách, gửi lại email)
+  ikf admin add <email> --role viewer|support|editor|admin|none [--global] [--app <id>:<role> …] [--name <tên>]
+      (người dùng trang admin, đăng nhập Google; --role: role mặc định ở mọi app, none: chỉ các app ở --app; support: tra khách, gửi lại email)
   ikf admin ls
+  ikf admin grant <email> <app> viewer|support|editor|admin   (role riêng trong một app)
+  ikf admin revoke <email> <app>   (bỏ role riêng, về role mặc định)
+  ikf admin global <email> on|off   (global admin: mọi app, Users, Billing, token)
   ikf admin disable <email>   (khoá ngay, mọi phiên đăng nhập kết thúc)
+  ikf token create <name> --roles publisher[,router] [--app <id>]   (token chỉ hiện một lần; --app: chỉ dùng trong app đó)
   ikf events replay-dlq --env <staging|prod>   (cần CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN)
   ikf stats <slug> [--days 7] [--by hour|day]   (số liệu funnel: mốc, bậc thang screen, doanh thu; giờ UTC; --by hour tối đa 14 ngày)
   ikf stats --app <id> [--days 7]   (mỗi funnel của app một dòng + dòng Tổng)`;
@@ -359,29 +364,107 @@ async function customerCommand(api, sub, args, values, out) {
 
 const ADMIN_ROLES = ['viewer', 'support', 'editor', 'admin'];
 
+const APP_ROLE_RE = new RegExp(`^([a-z0-9][a-z0-9-]{1,30}):(${ADMIN_ROLES.join('|')})$`);
+const appRoles = (u) => (u.apps ?? []).map((a) => `${a.app_id}:${a.role}`).join(', ');
+
+// Spec admin-console-p4b §1: role is the default role in every app (null = none), global = admin everywhere.
+function accessSummary(u) {
+  const parts = [u.role ?? 'không có role mặc định'];
+  if (u.global) parts.push('global');
+  if (u.apps?.length) parts.push(`app ${appRoles(u)}`);
+  return parts.join(', ');
+}
+
+// --app <id>:<role>, repeatable (spec admin-console-p4b §4) → the apps[] of POST /v1/admin/users.
+function parseAppRoles(list) {
+  const apps = [];
+  for (const item of list) {
+    const m = APP_ROLE_RE.exec(item);
+    if (!m) throw new UsageError(`không hiểu --app "${item}"; dạng đúng: <id>:${ADMIN_ROLES.join('|')}`);
+    if (apps.some((a) => a.app_id === m[1])) throw new UsageError(`app "${m[1]}" xuất hiện 2 lần`);
+    apps.push({ app_id: m[1], role: m[2] });
+  }
+  return apps;
+}
+
+async function adminAdd(api, email, values, out) {
+  if (![...ADMIN_ROLES, 'none'].includes(values.role)) throw new UsageError(`cần --role ${ADMIN_ROLES.join('|')}|none`);
+  const apps = parseAppRoles(values.apps);
+  const u = await api.createAdminUser({
+    email,
+    role: values.role === 'none' ? null : values.role,
+    ...(values.global && { global: true }),
+    ...(apps.length && { apps }),
+    ...(values.name && { name: values.name }),
+  });
+  out(`${u.email}: ${accessSummary(u)} (đã thêm). Đăng nhập trang admin bằng Google với email này.`);
+  return 0;
+}
+
+// grant/revoke/global/disable act on a person by email: the routes take the id, so look it up first.
+async function adminByEmail(api, sub, email, args, out, err) {
+  const [, app, role] = args;
+  if (sub === 'grant' && (!app || !ADMIN_ROLES.includes(role))) throw new UsageError(`cách dùng: ikf admin grant <email> <app> ${ADMIN_ROLES.join('|')}`);
+  if (sub === 'revoke' && !app) throw new UsageError('cách dùng: ikf admin revoke <email> <app>');
+  if ((sub === 'grant' || sub === 'revoke') && !APP_ID_RE.test(app)) throw new UsageError(`app id không hợp lệ: "${app}"`);
+  if (sub === 'global' && !['on', 'off'].includes(app)) throw new UsageError('cách dùng: ikf admin global <email> on|off');
+  const u = (await api.listAdminUsers()).users.find((x) => x.email === email);
+  if (!u) {
+    err(`Không có người dùng ${email}`);
+    return 1;
+  }
+  if (sub === 'grant') {
+    await api.setAdminUserApp(u.id, app, { role });
+    out(`${email}: ${role} ở app ${app}.`);
+  } else if (sub === 'revoke') {
+    const r = await api.removeAdminUserApp(u.id, app);
+    out(`${email}: đã bỏ role riêng ở app ${app} (role mặc định: ${r.role ?? 'không có'}).`);
+  } else if (sub === 'global') {
+    await api.updateAdminUser(u.id, { global: app === 'on' });
+    out(app === 'on' ? `${email}: global admin (mọi app, Users, Billing, token).` : `${email}: không còn global.`);
+  } else {
+    await api.updateAdminUser(u.id, { disabled: true });
+    out(`${email}: đã khoá, mọi phiên đăng nhập kết thúc ngay.`);
+  }
+  return 0;
+}
+
 async function adminCommand(api, sub, args, values, out, err) {
   const email = args[0]?.trim().toLowerCase();
   if (sub === 'ls') {
     const { users } = await api.listAdminUsers();
     if (!users.length) out('(chưa có ai)');
-    for (const u of users) out(`${u.email.padEnd(32)} ${u.role.padEnd(7)} ${u.disabled_at ? `khoá từ ${u.disabled_at}` : 'hoạt động'}`);
+    // Spec admin-console-p4b §4: email · default role · global · app roles · status.
+    for (const u of users) {
+      const cols = [u.email.padEnd(32), (u.role ?? '-').padEnd(7), (u.global ? 'global' : '-').padEnd(6), (appRoles(u) || '-').padEnd(30)];
+      out(`${cols.join(' ')} ${u.disabled_at ? `khoá từ ${u.disabled_at}` : 'hoạt động'}`);
+    }
     return 0;
   }
-  if (!['add', 'disable'].includes(sub) || !email) throw new UsageError(USAGE);
+  if (!['add', 'disable', 'grant', 'revoke', 'global'].includes(sub) || !email) throw new UsageError(USAGE);
   if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new UsageError(`email không hợp lệ: "${args[0]}"`);
-  if (sub === 'add') {
-    if (!ADMIN_ROLES.includes(values.role)) throw new UsageError(`cần --role ${ADMIN_ROLES.join('|')}`);
-    const u = await api.createAdminUser({ email, role: values.role, ...(values.name && { name: values.name }) });
-    out(`${u.email}: ${u.role} (đã thêm). Đăng nhập trang admin bằng Google với email này.`);
-    return 0;
-  }
-  const u = (await api.listAdminUsers()).users.find((x) => x.email === email);
-  if (!u) {
-    err(`Không có người dùng ${email}`);
-    return 1;
-  }
-  await api.updateAdminUser(u.id, { disabled: true });
-  out(`${email}: đã khoá, mọi phiên đăng nhập kết thúc ngay.`);
+  if (sub === 'add') return adminAdd(api, email, values, out);
+  return adminByEmail(api, sub, email, args, out, err);
+}
+
+const TOKEN_ROLES = ['publisher', 'router', 'admin'];
+const TOKEN_USAGE = 'cách dùng: ikf token create <name> --roles publisher[,router] [--app <id>]';
+
+// ikf token create (spec admin-console-p4b §4): POST /v1/tokens; the token is in the reply once, never again.
+// Whether an app token may hold a role is the server's call (400 invalid_roles), so the rule lives in one place.
+async function tokenCommand(api, sub, args, values, out) {
+  const name = args[0];
+  if (sub !== 'create' || name === undefined) throw new UsageError(TOKEN_USAGE);
+  if (!name.length || name.length > 64) throw new UsageError('tên token 1-64 ký tự');
+  if (!values.roles) throw new UsageError('cần --roles publisher[,router]');
+  const roles = values.roles.split(',').map((r) => r.trim()).filter(Boolean);
+  const bad = roles.find((r) => !TOKEN_ROLES.includes(r));
+  if (bad !== undefined || !roles.length) throw new UsageError(`role token không hợp lệ: "${bad ?? ''}" (${TOKEN_ROLES.join(', ')})`);
+  const app = appOption(values);
+  const r = await api.createToken({ name, roles, ...(app !== undefined && { app_id: app }) });
+  out(`Token ${r.name} (${r.roles.join(', ')}; ${r.app_id ? `app ${r.app_id}` : 'mọi app'}) đã tạo.`);
+  out('Token chỉ hiện MỘT lần: lưu vào password manager ngay, không gửi qua chat.');
+  out(`  ${r.token}`);
   return 0;
 }
 
@@ -505,6 +588,14 @@ async function statsCommand(api, slug, values, out, now) {
 // cmd: the command that failed, for codes whose advice depends on it (app_required).
 // typedApp: the app id on the command line, named when app_not_found carries no detail (final review #8).
 export function formatApiError(e, cmd, typedApp) {
+  // Spec admin-console-p4b decision #5: a read outside the caller's apps is 404 (it never says the thing exists),
+  // a write is 403.
+  if (e.code === 'not_found') return 'Không tìm thấy (hoặc bạn không có quyền).';
+  if (e.code === 'forbidden') return 'Bạn không có quyền với thao tác này.';
+  if (e.code === 'last_global_admin') return 'Phải còn ít nhất một global admin.';
+  if (e.code === 'cannot_lock_self') return 'Không thể tự bỏ global hoặc tự khoá mình.';
+  // Spec admin-console-p4b decision #4: a token bound to an app holds only publisher/router.
+  if (e.code === 'invalid_roles' && cmd === 'token' && typedApp) return 'Token theo app chỉ nhận role publisher, router.';
   // Spec admin-console-p4a §2: an upload of a new slug needs an app; a funnel is never moved back to no app.
   if (e.code === 'app_required') {
     return cmd === 'publish' ? 'Funnel mới cần --app <id>' : 'Funnel phải thuộc một app, không gỡ được (đổi app: ikf funnel set <slug> --app <id>)';
@@ -631,7 +722,9 @@ export async function run(argv, { out = console.log, err = console.error, env =
         since: { type: 'string' },
         topic: { type: 'string' },
         limit: { type: 'string' },
-        app: { type: 'string' },
+        // Repeatable for `admin add --app <id>:<role> …` (spec admin-console-p4b §4); every other command reads
+        // the last one, as before.
+        app: { type: 'string', multiple: true },
         'no-app': { type: 'boolean', default: false },
         name: { type: 'string' },
         kind: { type: 'string' },
@@ -654,8 +747,12 @@ export async function run(argv, { out = console.log, err = console.error, env =
         unassigned: { type: 'boolean', default: false },
         shared: { type: 'boolean', default: false },
         status: { type: 'string' },
+        global: { type: 'boolean', default: false },
+        roles: { type: 'string' },
       },
     });
+    values.apps = values.app ?? [];
+    values.app = values.app?.at(-1);
     const [first, sub, ...rest] = positionals;
     cmd = first;
     typedApp = values.app ?? (first === 'app' ? rest[0] : undefined);
@@ -665,7 +762,7 @@ export async function run(argv, { out = console.log, err = console.error, env =
       out('Đã lưu thông tin đăng nhập.');
       return 0;
     }
-    if (!['route', 'publish', 'funnel', 'domain', 'events', 'billing', 'app', 'customer', 'admin', 'stats'].includes(cmd)) throw new UsageError(USAGE);
+    if (!['route', 'publish', 'funnel', 'domain', 'events', 'billing', 'app', 'customer', 'admin', 'stats', 'token'].includes(cmd)) throw new UsageError(USAGE);
     if (cmd === 'events') return await eventsCommand(sub, values, out, env, deps);
     if (cmd === 'publish' && (!sub || !values.slug)) throw new UsageError('cách dùng: ikf publish <folder> --slug <slug> [--app <id>]');
     const api = deps.api ?? createApi(await loadCredentials(env));
@@ -680,6 +777,7 @@ export async function run(argv, { out = console.log, err = console.error, env =
     if (cmd === 'customer') return await customerCommand(api, sub, rest, values, out);
     if (cmd === 'admin') return await adminCommand(api, sub, rest, values, out, err);
     if (cmd === 'stats') return await statsCommand(api, sub, values, out, deps.now ?? Date.now);
+    if (cmd === 'token') return await tokenCommand(api, sub, rest, values, out);
     return await routeCommand(api, sub, rest, values, out);
   } catch (e) {
     if (e instanceof UsageError) {
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
cd packages/cli && npx vitest run test/admin.test.js test/admin-apps.test.js test/token.test.js test/errors-scope.test.js 2>&1 | grep -E "Test Files|Tests  "
cd ../.. && npm test -w @ikf/cli 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  45 passed (45)`; toàn bộ cli `Test Files  24 passed (24)`, `Tests  243 passed (243)` (trước: 21 file, 207 test).

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/api.js packages/cli/src/main.js packages/cli/test/admin.test.js packages/cli/test/admin-apps.test.js packages/cli/test/errors-scope.test.js packages/cli/test/token.test.js
git commit -m "feat(cli): admin global/app roles, token create --app, scope error messages
```

---

---

### Task 7: SPA — quyền theo app (me.global, me.apps), switcher theo phạm vi, menu toàn cục, chuyển hướng `/`, nút theo role trong app

**Files:**
- Create: `apps/admin/test/scope-ui.test.jsx`
- Modify: `apps/admin/src/roles.js`, `apps/admin/src/App.jsx`, `apps/admin/src/Layout.jsx`, `apps/admin/src/app-context.jsx`, `apps/admin/src/components/RequireGrant.jsx`, `apps/admin/src/components/RoleButton.jsx`, `apps/admin/src/components/UploadBox.jsx`, `apps/admin/src/components/PricesTab.jsx`, `apps/admin/src/components/FunnelSettings.jsx`, `apps/admin/src/pages/FunnelDetail.jsx`, `apps/admin/src/pages/AppOverview.jsx`, `apps/admin/src/pages/AppPlans.jsx`, `apps/admin/src/pages/AppSettings.jsx`, `apps/admin/src/pages/AppWebhooks.jsx`, `apps/admin/src/pages/Apps.jsx`, `apps/admin/src/pages/Audit.jsx`, `apps/admin/src/pages/Billing.jsx`, `apps/admin/src/pages/CustomerDetail.jsx`, `apps/admin/src/pages/Customers.jsx`, `apps/admin/src/pages/Domains.jsx`, `apps/admin/src/pages/Funnels.jsx`, `apps/admin/src/pages/Users.jsx`
- Test: `apps/admin/test/scope-ui.test.jsx` (mới); sửa `apps/admin/test/helpers.jsx` (fixture `ME` theo hình dạng mới), `apps/admin/test/app-settings.test.jsx` và `apps/admin/test/app-webhooks.test.jsx` (mỗi file một dòng: chữ "Không có app nope." → "Không tìm thấy app nope.")

**Interfaces:**
- Consumes: `GET /v1/auth/me` → `{email, name, role, global, csrf, apps: [{id, name, role}]}` (Task 4: `apps` = app trong phạm vi, `role` = role hiệu lực, global → `admin`); `GET /v1/apps` chỉ trả app trong phạm vi (Task 4); GET ngoài phạm vi → `404` cùng body với tài nguyên không có (`app_not_found {app_id}`, `funnel_not_found`), ghi → `403 forbidden`; ruling B6/B9: người có role mặc định (`role` khác null) vẫn tới funnel chưa gán và các danh sách toàn cục (tra khách không `app_id`, audit không `?app=`).
- Produces:
  - `roles.js`: giữ `GRANTS`, `ROLES`, `ROLE_INFO`, `can(role, need)`; thêm `effectiveRole(me, appId)` (global → `'admin'`; `appId === null` = tài nguyên không thuộc app → `me.role`; còn lại `me.apps.find(a => a.id === appId)?.role ?? null`), `canIn(me, need, appId)`, `canGlobal(me, need)` (= `me.global && can('admin', need)`), `canAll(me, need)` (= `canIn(me, need, null)`: global hoặc role mặc định — bằng `hasGrant(scope, need, null)` của server).
  - `app-context.jsx`: `isAppNotFound(err)` (404 `app_not_found` | `not_found`), `<AppNotFound id>` ("Không tìm thấy app <id>."); `useApp().notFound` dùng `isAppNotFound`. `AppsProvider`/`useAppContext()` giữ nguyên API (vẫn gọi `listApps()` cho mọi người: server đã lọc theo phạm vi và trang Apps/Giá/Khách hàng cần dòng đầy đủ).
  - `components/RequireGrant.jsx`: `RequireGrant({need, appId?, global?})` — trong app (mặc định `useAppContext().appId`) app ngoài phạm vi → `<AppNotFound>`, quyền = `canIn`; ngoài app = `canAll`; `global` → `canGlobal`. Mới: `AllApps` — `canAll(me, 'viewer')` mới vào, còn lại `<Navigate to="/" replace />`.
  - `components/RoleButton.jsx`: `RoleButton({need, appId?, global?})` — `appId` truyền vào (kể cả `null` = funnel chưa gán) → `canIn`; không truyền → app của URL (`canIn`) hoặc ngoài app `canAll`; `global` → `canGlobal` (Tạo app, Chạy reconcile, Cấp lại user_id).
  - `App.jsx`: `/` = `Home` (`canAll` viewer → Dashboard; không thì `/apps/<me.apps[0].id>`; không app nào → `data-testid="no-apps"` "Bạn chưa được cấp app nào. Liên hệ admin."); `/funnels`, `/apps`, `/customers`, `/customers/:ref`, `/domains`, `/billing`, `/audit`, `/settings/users` bọc `AllApps`; `/billing` `RequireGrant need="admin" global`.
  - `Layout.jsx`: `NAV` thêm `global: true` cho Billing, Settings; menu ngoài app lọc `n.global ? canGlobal : canAll`, trong app `canIn(me, n.need, appId)`; switcher: global → danh sách server, còn lại `me.apps`; "Tất cả app" và "← Tất cả app" chỉ khi `canAll(me, 'viewer')`, người còn lại ngoài app thấy option disabled "Chọn app"; `who` = `email · role` (role null → chỉ email).
  - Trang: FunnelDetail truyền `funnel.app_id ?? null` cho Rollback/Publish, `UploadBox({appId})`, `PricesTab({appId})`, tab Giá theo `canIn(…, 'prices:read', appId)`; FunnelSettings truyền app của funnel; AppSettings `canIn(me, 'admin', app.id)`; Domains: gán host = `canGlobal`; Users `canGlobal`; AppOverview/AppSettings/AppWebhooks/AppPlans và Audit/Funnels/Domains/Customers trong app: 404 của API (lần tải danh sách, không phải lỗi của thao tác) → `<AppNotFound>`.

- [ ] **Step 1: Viết test fail**

`apps/admin/test/scope-ui.test.jsx` (mới):

`apps/admin/test/scope-ui.test.jsx` (mới):

```jsx
import { describe, it, expect, vi } from 'vitest';
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { ApiError } from '../src/api.js';
import { canAll, canGlobal, canIn, effectiveRole } from '../src/roles.js';
import { ME, renderApp } from './helpers.jsx';
import { appsClient, STARLYN, TAROT } from './apps-fixtures.js';

// Spec admin-console-p4b §3: the console by app. A person who is not global sees only the apps of me.apps, with
// the role of each. The pages across apps (menu, "Tất cả app", Dashboard) follow the server's reach (ruling B6/B9):
// global, or a default role; a person with role NULL works only inside their apps.
const person = (apps, role = null) => ({ email: 'sl@ikameglobal.com', name: 'Sl', role, global: false, csrf: 'c', apps });
const starlynAs = (role) => person([{ id: 'starlyn', name: 'Starlyn', role }]);
const MIXED = person([{ id: 'starlyn', name: 'Starlyn', role: 'viewer' }, { id: 'tarot-web', name: 'Tarot Web', role: 'admin' }]);

const appNotFound = (id) => new ApiError(404, { error: 'app_not_found', detail: { app_id: id } });
const summaryOf = vi.fn(async (id) => {
  const app = [STARLYN, TAROT].find((a) => a.id === id);
  if (!app) throw appNotFound(id);
  return { app, funnels: [], domains: [] };
});
// listApps answers both apps on purpose: the switcher of a scoped person follows me.apps.
const client = (me, overrides = {}) => appsClient(me, { getAppSummary: summaryOf, ...overrides });
const links = () => within(document.querySelector('nav.side')).queryAllByRole('link').map((a) => a.textContent);
const options = () => [...screen.getByTestId('app-switcher').options].map((o) => [o.value, o.textContent]);

describe('roles per app (roles.js)', () => {
  it('effectiveRole: global → admin in any app; scoped → the role of that app or null; no app → the default role', () => {
    expect([effectiveRole(ME.admin, 'starlyn'), effectiveRole(ME.admin, 'calmio'), effectiveRole(ME.admin, null)]).toEqual(['admin', 'admin', 'admin']);
    expect([effectiveRole(MIXED, 'starlyn'), effectiveRole(MIXED, 'tarot-web'), effectiveRole(MIXED, 'calmio'), effectiveRole(MIXED, null)]).toEqual(['viewer', 'admin', null, null]);
    expect(effectiveRole(ME.editor, null)).toBe('editor');
  });

  it('canIn asks the role in the app; canGlobal is the global admin only; canAll is global or the default role', () => {
    expect([canIn(MIXED, 'editor', 'starlyn'), canIn(MIXED, 'editor', 'tarot-web'), canIn(MIXED, 'viewer', 'calmio')]).toEqual([false, true, false]);
    expect([canGlobal(ME.admin, 'admin'), canGlobal(MIXED, 'viewer'), canGlobal(ME.editor, 'viewer'), canGlobal(null, 'viewer')]).toEqual([true, false, false, false]);
    expect([canAll(ME.admin, 'admin'), canAll(ME.editor, 'editor'), canAll(ME.editor, 'support'), canAll(MIXED, 'viewer')]).toEqual([true, true, false, false]);
  });
});

describe('switcher, menu and home by scope', () => {
  it('global: "Tất cả app" and every app; / is the Dashboard with the global menu', async () => {
    renderApp(client(ME.admin), '/');
    expect(await screen.findByRole('heading', { level: 1, name: 'Dashboard' })).toBeTruthy();
    await waitFor(() => expect(options()).toEqual([['', 'Tất cả app'], ['starlyn', 'Starlyn'], ['tarot-web', 'Tarot Web']]));
    expect(links()).toEqual(['Dashboard', 'Funnels', 'Apps', 'Khách hàng', 'Domains', 'Billing', 'Audit', 'Settings']);
  });

  it('scoped: / opens the first app; the switcher has only its apps (no "Tất cả app"); the menu is the app menu without the way back', async () => {
    renderApp(client(starlynAs('editor')), '/');
    expect(await screen.findByRole('heading', { level: 1, name: 'Starlyn' })).toBeTruthy();
    expect(options()).toEqual([['starlyn', 'Starlyn']]);
    expect(screen.getByTestId('app-switcher').value).toBe('starlyn');
    expect(links()).toEqual(['Tổng quan', 'Funnels', 'Giá', 'Domains', 'Webhooks', 'Audit', 'Cài đặt']);
    expect(screen.getByTestId('who').textContent).toBe('sl@ikameglobal.com');
  });

  it('an existing person (default role, every app; ruling B6): / stays the Dashboard with "Tất cả app" and the menu of the role', async () => {
    renderApp(client(ME.viewer), '/');
    expect(await screen.findByRole('heading', { level: 1, name: 'Dashboard' })).toBeTruthy();
    expect(options()).toEqual([['', 'Tất cả app'], ['starlyn', 'Starlyn'], ['tarot-web', 'Tarot Web']]);
    expect(links()).toEqual(['Dashboard', 'Funnels', 'Domains', 'Audit']);
  });

  it('a default role of admin without the global flag: no Billing or Settings, Tạo app greyed out (global only)', async () => {
    renderApp(client(person([{ id: 'starlyn', name: 'Starlyn', role: 'admin' }], 'admin')), '/apps');
    await screen.findAllByTestId('app-card');
    expect(links()).toEqual(['Dashboard', 'Funnels', 'Apps', 'Khách hàng', 'Domains', 'Audit']);
    expect(screen.getByRole('button', { name: 'Tạo app' }).disabled).toBe(true);
  });

  it('the menu and the buttons follow the role in the app shown', async () => {
    renderApp(client(MIXED), '/apps/starlyn');
    expect(await screen.findByRole('heading', { level: 1, name: 'Starlyn' })).toBeTruthy();
    expect(links()).toEqual(['Tổng quan', 'Funnels', 'Domains', 'Audit']);
    expect(screen.getByRole('button', { name: 'Tạo funnel' }).disabled).toBe(true);
    fireEvent.change(screen.getByTestId('app-switcher'), { target: { value: 'tarot-web' } });
    expect(await screen.findByRole('heading', { level: 1, name: 'Tarot Web' })).toBeTruthy();
    expect(links()).toEqual(['Tổng quan', 'Funnels', 'Giá', 'Khách hàng', 'Domains', 'Webhooks', 'Audit', 'Cài đặt']);
    expect(screen.getByRole('button', { name: 'Tạo funnel' }).disabled).toBe(false);
  });

  it('no app at all: a page that says so, and no menu', async () => {
    renderApp(client(person([])), '/');
    expect((await screen.findByTestId('no-apps')).textContent).toBe('Bạn chưa được cấp app nào. Liên hệ admin.');
    expect(links()).toEqual([]);
  });

  it('the pages across apps send a person with role NULL home (→ the first app), without calling their API', async () => {
    for (const path of ['/funnels', '/apps', '/customers', '/customers/cus_x', '/domains', '/billing', '/audit', '/settings/users']) {
      const c = client(starlynAs('admin'));
      renderApp(c, path);
      expect(await screen.findByRole('heading', { level: 1, name: 'Starlyn' }), path).toBeTruthy();
      expect([c.listFunnels, c.lookupCustomers, c.listDomains, c.listOutbox, c.listAudit, c.listUsers].every((f) => f.mock.calls.length === 0), path).toBe(true);
      cleanup();
    }
  });

  it('the global admin keeps the global pages', async () => {
    renderApp(client(ME.admin), '/domains');
    expect(await screen.findByRole('heading', { level: 1, name: 'Domains' })).toBeTruthy();
  });
});

describe('funnel detail: buttons by the role in the funnel\'s app', () => {
  const DETAIL = {
    slug: 'moon', pixel_id: null, app_id: 'starlyn', created_by: 'ed', created_at: '2026-10-01T08:00:00.000Z', live: [],
    versions: [{ v: 1, created_at: '2026-10-01T08:00:00.000Z', created_by: 'ed', size: 10, lint: 'pass', smoke: 'pass', preview_url: 'https://p.example/moon/1' }],
  };
  const open = async (me, detail = DETAIL) => {
    renderApp(client(me, { getFunnel: vi.fn(async () => detail) }), '/funnels/moon?tab=main');
    await screen.findByRole('heading', { name: 'Settings' });
  };
  const state = () => ({
    upload: screen.getByLabelText('Chọn demo.html').disabled,
    publish: screen.getByRole('button', { name: 'Publish' }).disabled,
    pixel: screen.getByRole('button', { name: 'Lưu pixel' }).disabled,
    prices: screen.queryByRole('tab', { name: 'Giá' }) !== null,
  });

  it('viewer of starlyn: Upload, Publish, Lưu pixel disabled, no Giá tab', async () => {
    await open(starlynAs('viewer'));
    expect(state()).toEqual({ upload: true, publish: true, pixel: true, prices: false });
    expect(screen.getByRole('button', { name: 'Publish' }).title).toBe('Cần quyền admin');
  });

  it('admin of starlyn (not global): everything enabled', async () => {
    await open(starlynAs('admin'));
    expect(state()).toEqual({ upload: false, publish: false, pixel: false, prices: true });
  });

  it('admin of tarot-web only, a starlyn funnel: disabled (another app\'s role does not count)', async () => {
    await open(person([{ id: 'tarot-web', name: 'Tarot Web', role: 'admin' }]));
    expect(state()).toEqual({ upload: true, publish: true, pixel: true, prices: false });
  });

  it('an unassigned funnel: the default role decides (ruling B6), none for a person with role NULL', async () => {
    await open(starlynAs('admin'), { ...DETAIL, app_id: null });
    expect(state()).toEqual({ upload: true, publish: true, pixel: true, prices: false });
    cleanup();
    await open(ME.editor, { ...DETAIL, app_id: null });
    expect(state()).toEqual({ upload: false, publish: true, pixel: false, prices: true });
  });
});

describe('an app out of scope (or missing) is "Không tìm thấy app"', () => {
  it('Tổng quan: the API\'s 404 app_not_found', async () => {
    renderApp(client(starlynAs('admin'), { getOverview: vi.fn(async () => { throw appNotFound('calmio'); }) }), '/apps/calmio');
    expect(await screen.findByText('Không tìm thấy app calmio.')).toBeTruthy();
    expect(links()).toEqual([]);
  });

  it('a page that needs a grant in an app out of scope says not found, not which grant', async () => {
    for (const path of ['/apps/calmio/settings', '/apps/calmio/plans', '/apps/calmio/customers', '/apps/calmio/webhooks']) {
      renderApp(client(starlynAs('admin')), path);
      expect(await screen.findByText('Không tìm thấy app calmio.'), path).toBeTruthy();
      cleanup();
    }
  });

  it('every in-app page shows the 404 of its API as not found', async () => {
    const fail = vi.fn(async () => { throw appNotFound('nope'); });
    const c = client(ME.admin, { getAppPlans: fail, listAudit: fail, listFunnels: fail, listDomains: fail, lookupCustomers: fail });
    for (const path of ['/apps/nope/settings', '/apps/nope/webhooks', '/apps/nope/plans', '/apps/nope/audit', '/apps/nope/funnels', '/apps/nope/domains']) {
      renderApp(c, path);
      expect(await screen.findByText('Không tìm thấy app nope.'), path).toBeTruthy();
      cleanup();
    }
    renderApp(c, '/apps/nope/customers');
    fireEvent.change(await screen.findByLabelText('Tìm khách'), { target: { value: 'buyer@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tìm' }));
    expect(await screen.findByText('Không tìm thấy app nope.')).toBeTruthy();
  });
});
```

`apps/admin/test/helpers.jsx` (sửa, áp dụng đúng diff này — `ME` có `global` và `apps`: admin → global; viewer/support/editor → không global, role đó ở cả hai app của `apps-fixtures.js`, đúng như migration 008 làm với người cũ nên test cũ giữ nghĩa):

`apps/admin/test/helpers.jsx` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/test/helpers.jsx b/apps/admin/test/helpers.jsx
index 4dbf39c..3091c1b 100644
--- a/apps/admin/test/helpers.jsx
+++ b/apps/admin/test/helpers.jsx
@@ -4,10 +4,14 @@ import { vi } from 'vitest';
 import { ApiError } from '../src/api.js';
 import { App } from '../src/App.jsx';
 
-export const ME = { admin: { email: 'boss@ikameglobal.com', name: 'Boss', role: 'admin', csrf: 'c' } };
-ME.editor = { ...ME.admin, email: 'ed@ikameglobal.com', role: 'editor' };
-ME.viewer = { ...ME.admin, email: 'vi@ikameglobal.com', role: 'viewer' };
-ME.support = { ...ME.admin, email: 'cs@ikameglobal.com', role: 'support' };
+// GET /v1/auth/me (spec admin-console-p4b §2 "Users và token"): apps = the apps in reach with the effective role.
+// admin is global (as every admin after migration 008); the other roles are what 008 makes of an existing person:
+// not global, that role by default, hence in every app (the two apps of apps-fixtures.js) with it.
+const inApps = (role) => [{ id: 'starlyn', name: 'Starlyn', role }, { id: 'tarot-web', name: 'Tarot Web', role }];
+export const ME = { admin: { email: 'boss@ikameglobal.com', name: 'Boss', role: 'admin', global: true, csrf: 'c', apps: inApps('admin') } };
+ME.editor = { ...ME.admin, email: 'ed@ikameglobal.com', role: 'editor', global: false, apps: inApps('editor') };
+ME.viewer = { ...ME.admin, email: 'vi@ikameglobal.com', role: 'viewer', global: false, apps: inApps('viewer') };
+ME.support = { ...ME.admin, email: 'cs@ikameglobal.com', role: 'support', global: false, apps: inApps('support') };
 
 // A client with the createClient() surface; every method is a vi.fn, overridable per test.
 export function fakeClient(me = ME.admin, overrides = {}) {
PATCH
```

`apps/admin/test/app-settings.test.jsx`, `apps/admin/test/app-webhooks.test.jsx` (sửa, áp dụng đúng diff này — câu app không có thống nhất "Không tìm thấy app <id>." như Tổng quan, spec §3):

`apps/admin/test/app-settings.test.jsx`, `apps/admin/test/app-webhooks.test.jsx` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/test/app-settings.test.jsx b/apps/admin/test/app-settings.test.jsx
index 7652ff8..6ad640e 100644
--- a/apps/admin/test/app-settings.test.jsx
+++ b/apps/admin/test/app-settings.test.jsx
@@ -66,6 +66,6 @@ describe('App settings', () => {
 
   it('an unknown app id says so', async () => {
     renderApp(client(ME.admin), '/apps/nope/settings');
-    expect(await screen.findByText('Không có app nope.')).toBeTruthy();
+    expect(await screen.findByText('Không tìm thấy app nope.')).toBeTruthy();
   });
 });
diff --git a/apps/admin/test/app-webhooks.test.jsx b/apps/admin/test/app-webhooks.test.jsx
index 8eedf39..49a2e55 100644
--- a/apps/admin/test/app-webhooks.test.jsx
+++ b/apps/admin/test/app-webhooks.test.jsx
@@ -53,6 +53,6 @@ describe('App webhooks', () => {
 
   it('an unknown app id says so', async () => {
     renderApp(client(ME.admin), '/apps/nope/webhooks');
-    expect(await screen.findByText('Không có app nope.')).toBeTruthy();
+    expect(await screen.findByText('Không tìm thấy app nope.')).toBeTruthy();
   });
 });
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
cd apps/admin && npx vitest run test/scope-ui.test.jsx test/app-settings.test.jsx test/app-webhooks.test.jsx 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Test Files  3 failed (3)`, `Tests  13 failed | 13 passed (26)`: `effectiveRole`/`canIn`/`canGlobal`/`canAll` chưa có trong `roles.js`; `/` của người role NULL vẫn là Dashboard (không chuyển tới app đầu, không có trang `no-apps`), switcher vẫn có "Tất cả app" và lấy danh sách server; menu trong app và nút vẫn theo `me.role` (viewer ở Starlyn + admin ở Tarot Web không đổi theo app; admin của Starlyn không global vẫn bị khoá vì `me.role` null); trang toàn cục không chuyển hướng; "Tạo app" bật cho role mặc định admin không global; app ngoài phạm vi hiện "Cần quyền …" / "Không có app" / lỗi chung thay vì "Không tìm thấy app <id>."; 2 test app-settings/app-webhooks fail vì chữ cũ "Không có app nope.".

- [ ] **Step 3: Implement**

`apps/admin/src/roles.js`, `apps/admin/src/app-context.jsx`, `apps/admin/src/components/RequireGrant.jsx`, `apps/admin/src/components/RoleButton.jsx` (sửa, áp dụng đúng diff này):

`apps/admin/src/roles.js`, `apps/admin/src/app-context.jsx`, `apps/admin/src/components/RequireGrant.jsx`, `apps/admin/src/components/RoleButton.jsx` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/src/app-context.jsx b/apps/admin/src/app-context.jsx
index fd34ed2..1a38ac9 100644
--- a/apps/admin/src/app-context.jsx
+++ b/apps/admin/src/app-context.jsx
@@ -7,6 +7,8 @@ const AppsContext = createContext({ apps: [], loading: false, error: null, reloa
 
 // Spec admin-console-p4a §3: the app list, loaded once for the whole console (the sidebar's switcher and the
 // Apps page share it) by Layout. GET /v1/apps is open to every signed-in role, so a viewer's switcher works.
+// Spec admin-console-p4b §2: the server answers only the apps in the caller's scope, with their full rows (kind,
+// counts) that the Apps cards and the in-app pages read; the switcher of a person who is not global lists me.apps.
 export function AppsProvider({ children }) {
   const { client } = useAuth();
   const [state, setState] = useState({ apps: [], loading: true, error: null });
@@ -53,5 +55,13 @@ export function useApp(id) {
     setState({ app: null, error: null });
     reload();
   }, [reload]);
-  return { ...state, notFound: state.error?.code === 'app_not_found', reload };
+  return { ...state, notFound: isAppNotFound(state.error), reload };
+}
+
+// Spec admin-console-p4b §3: an app out of scope answers 404 with the body of a missing one (app_not_found, or
+// not_found from a route without its own body); every page under /apps/:id says the same thing for both.
+export const isAppNotFound = (err) => err?.status === 404 && (err.code === 'app_not_found' || err.code === 'not_found');
+
+export function AppNotFound({ id }) {
+  return <p className="muted">Không tìm thấy app {id}.</p>;
 }
diff --git a/apps/admin/src/components/RequireGrant.jsx b/apps/admin/src/components/RequireGrant.jsx
index 7bcc43e..2a09881 100644
--- a/apps/admin/src/components/RequireGrant.jsx
+++ b/apps/admin/src/components/RequireGrant.jsx
@@ -1,9 +1,26 @@
+import { Navigate } from 'react-router';
+import { AppNotFound, useAppContext } from '../app-context.jsx';
 import { useAuth } from '../auth.jsx';
-import { can } from '../roles.js';
+import { canAll, canGlobal, canIn, effectiveRole } from '../roles.js';
 
 // A page only some roles may open (spec admin-console-p2 §3): the others see which grant it needs.
-export function RequireGrant({ need, children }) {
+// Spec admin-console-p4b §3: in an app (appId, default the URL's) the role in that app counts, and an app out of
+// scope is "not found" (the server does not disclose it either). Outside any app: the grant across apps (canAll),
+// or, with `global`, the global admin's (Billing).
+export function RequireGrant({ need, appId, global = false, children }) {
   const { me } = useAuth();
-  if (!can(me?.role, need)) return <p className="muted">Cần quyền {need}.</p>;
+  const { appId: current } = useAppContext();
+  const id = appId === undefined ? current : appId;
+  if (id && !effectiveRole(me, id)) return <AppNotFound id={id} />;
+  const allowed = global ? canGlobal(me, need) : id ? canIn(me, need, id) : canAll(me, need);
+  if (!allowed) return <p className="muted">Cần quyền {need}.</p>;
   return children;
 }
+
+// Spec admin-console-p4b §3: the pages across apps (/funnels, /apps, /customers, /domains, /billing, /audit,
+// /settings/users) are for whoever reaches every app (global, or a default role, see canAll); a person who works
+// only in their apps goes home, which opens their first app.
+export function AllApps({ children }) {
+  const { me } = useAuth();
+  return canAll(me, 'viewer') ? children : <Navigate to="/" replace />;
+}
diff --git a/apps/admin/src/components/RoleButton.jsx b/apps/admin/src/components/RoleButton.jsx
index 83f93e9..1dda1f6 100644
--- a/apps/admin/src/components/RoleButton.jsx
+++ b/apps/admin/src/components/RoleButton.jsx
@@ -1,10 +1,17 @@
+import { useAppContext } from '../app-context.jsx';
 import { useAuth } from '../auth.jsx';
-import { can } from '../roles.js';
+import { canAll, canGlobal, canIn } from '../roles.js';
 
 // A write button: greyed out with the reason when the signed-in role is not enough.
-export function RoleButton({ need, children, title, disabled, ...props }) {
+// Spec admin-console-p4b §3: the role in the app of the thing it acts on. appId: given by the page when it knows
+// the app (a funnel's app_id; null = a funnel of no app, see effectiveRole); otherwise the URL's app; outside any
+// app the grant across apps (canAll). `global`: an action only the global admin may take (create app, reconcile,
+// rotate a customer's user_id), wherever the button is.
+export function RoleButton({ need, appId, global = false, children, title, disabled, ...props }) {
   const { me } = useAuth();
-  const allowed = can(me?.role, need);
+  const { appId: current } = useAppContext();
+  const id = appId === undefined ? current : appId;
+  const allowed = global ? canGlobal(me, need) : id ? canIn(me, need, id) : canAll(me, need);
   return (
     <button type="button" {...props} disabled={disabled || !allowed} title={allowed ? title : `Cần quyền ${need}`}>
       {children}
diff --git a/apps/admin/src/roles.js b/apps/admin/src/roles.js
index 69acc84..e920ffd 100644
--- a/apps/admin/src/roles.js
+++ b/apps/admin/src/roles.js
@@ -14,3 +14,21 @@ export const ROLE_INFO = {
   admin: 'tất cả: publish, giá, app, quyền thủ công, users.',
 };
 export const can = (role, need) => (Object.hasOwn(GRANTS, role ?? '') ? GRANTS[role].includes(need) : false);
+
+// Spec admin-console-p4b §3: the role counts per app. me = GET /v1/auth/me {role, global, apps: [{id, name, role}]}.
+// effectiveRole: global → admin everywhere; otherwise the role of me.apps for that app (null when it is out of
+// scope). appId null = a resource of no app (an unassigned funnel): the default role me.role, as the server's
+// hasGrant(scope, grant, null) (ruling B6: an existing person keeps reaching those; role NULL reaches none).
+export function effectiveRole(me, appId) {
+  if (!me) return null;
+  if (me.global) return 'admin';
+  if (appId === null) return me.role ?? null;
+  return me.apps?.find((a) => a.id === appId)?.role ?? null;
+}
+export const canIn = (me, need, appId) => can(effectiveRole(me, appId), need);
+// What only the global admin does (spec decision #2: create app, Users, Billing, domain assignment, rotate user_id).
+export const canGlobal = (me, need) => Boolean(me?.global) && can('admin', need);
+// The console across apps (Dashboard, the global lists, "Tất cả app"): the server's hasGrant(scope, need, null),
+// i.e. global, or a default role that reaches every app (ruling B6/B9: a person from before 008 keeps today's
+// pages). A person with role NULL works only inside the apps of me.apps.
+export const canAll = (me, need) => canIn(me, need, null);
PATCH
```

`apps/admin/src/App.jsx`, `apps/admin/src/Layout.jsx` (sửa, áp dụng đúng diff này):

`apps/admin/src/App.jsx`, `apps/admin/src/Layout.jsx` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/src/App.jsx b/apps/admin/src/App.jsx
index 00aa5a7..b38d9ca 100644
--- a/apps/admin/src/App.jsx
+++ b/apps/admin/src/App.jsx
@@ -1,7 +1,7 @@
-import { Route, Routes } from 'react-router';
-import { AuthProvider, RequireAuth } from './auth.jsx';
+import { Navigate, Route, Routes } from 'react-router';
+import { AuthProvider, RequireAuth, useAuth } from './auth.jsx';
 import { Layout } from './Layout.jsx';
-import { RequireGrant } from './components/RequireGrant.jsx';
+import { AllApps, RequireGrant } from './components/RequireGrant.jsx';
 import { AppOverview } from './pages/AppOverview.jsx';
 import { AppPlans } from './pages/AppPlans.jsx';
 import { Apps } from './pages/Apps.jsx';
@@ -17,6 +17,16 @@ import { FunnelDetail } from './pages/FunnelDetail.jsx';
 import { Funnels } from './pages/Funnels.jsx';
 import { Login } from './pages/Login.jsx';
 import { Users } from './pages/Users.jsx';
+import { canAll } from './roles.js';
+
+// Spec admin-console-p4b §3: / is the Dashboard for whoever reaches every app (canAll); anyone else opens their
+// first app, or learns they have none yet.
+function Home() {
+  const { me } = useAuth();
+  if (canAll(me, 'viewer')) return <Dashboard />;
+  if (me.apps?.length) return <Navigate to={`/apps/${encodeURIComponent(me.apps[0].id)}`} replace />;
+  return <p className="muted" data-testid="no-apps">Bạn chưa được cấp app nào. Liên hệ admin.</p>;
+}
 
 export function App({ client }) {
   return (
@@ -24,10 +34,10 @@ export function App({ client }) {
       <Routes>
         <Route path="/login" element={<Login />} />
         <Route element={<RequireAuth><Layout /></RequireAuth>}>
-          <Route index element={<Dashboard />} />
-          <Route path="/funnels" element={<Funnels />} />
+          <Route index element={<Home />} />
+          <Route path="/funnels" element={<AllApps><Funnels /></AllApps>} />
           <Route path="/funnels/:slug" element={<FunnelDetail />} />
-          <Route path="/apps" element={<RequireGrant need="apps:read"><Apps /></RequireGrant>} />
+          <Route path="/apps" element={<AllApps><RequireGrant need="apps:read"><Apps /></RequireGrant></AllApps>} />
           {/* In an app (spec admin-console-p4a §3): Tổng quan is open to every role (GET /v1/apps/:id/summary is viewer). */}
           <Route path="/apps/:id" element={<AppOverview />} />
           <Route path="/apps/:id/funnels" element={<Funnels />} />
@@ -38,12 +48,12 @@ export function App({ client }) {
           <Route path="/apps/:id/customers" element={<RequireGrant need="support"><Customers /></RequireGrant>} />
           <Route path="/apps/:id/customers/:ref" element={<RequireGrant need="support"><CustomerDetail /></RequireGrant>} />
           <Route path="/apps/:id/audit" element={<Audit />} />
-          <Route path="/customers" element={<RequireGrant need="support"><Customers /></RequireGrant>} />
-          <Route path="/customers/:ref" element={<RequireGrant need="support"><CustomerDetail /></RequireGrant>} />
-          <Route path="/domains" element={<Domains />} />
-          <Route path="/billing" element={<RequireGrant need="admin"><Billing /></RequireGrant>} />
-          <Route path="/audit" element={<Audit />} />
-          <Route path="/settings/users" element={<Users />} />
+          <Route path="/customers" element={<AllApps><RequireGrant need="support"><Customers /></RequireGrant></AllApps>} />
+          <Route path="/customers/:ref" element={<AllApps><RequireGrant need="support"><CustomerDetail /></RequireGrant></AllApps>} />
+          <Route path="/domains" element={<AllApps><Domains /></AllApps>} />
+          <Route path="/billing" element={<AllApps><RequireGrant need="admin" global><Billing /></RequireGrant></AllApps>} />
+          <Route path="/audit" element={<AllApps><Audit /></AllApps>} />
+          <Route path="/settings/users" element={<AllApps><Users /></AllApps>} />
           <Route path="*" element={<p className="muted">Chọn một mục bên trái.</p>} />
         </Route>
       </Routes>
diff --git a/apps/admin/src/Layout.jsx b/apps/admin/src/Layout.jsx
index 8bc339b..7eaf85e 100644
--- a/apps/admin/src/Layout.jsx
+++ b/apps/admin/src/Layout.jsx
@@ -2,18 +2,20 @@ import { Link, NavLink, Outlet, useNavigate } from 'react-router';
 import { AppsProvider, useAppContext } from './app-context.jsx';
 import { useAuth } from './auth.jsx';
 import { ICONS, Mark } from './icons.jsx';
-import { can } from './roles.js';
+import { canAll, canGlobal, canIn } from './roles.js';
 
-// The side menu, in order; an item shows only for roles that have its grant (spec admin-console-p2 §3).
+// The side menu, in order; an item shows only for roles that have its grant (spec admin-console-p2 §3). Spec
+// admin-console-p4b §3: the menu across apps, by the grant across apps (canAll); `global` items are the global
+// admin's. A person who works only in their apps (role NULL) has no menu outside an app, only the switcher.
 export const NAV = [
   { to: '/', label: 'Dashboard', need: 'viewer', end: true, icon: 'dashboard' },
   { to: '/funnels', label: 'Funnels', need: 'viewer', icon: 'funnels' },
   { to: '/apps', label: 'Apps', need: 'apps:read', icon: 'apps' },
   { to: '/customers', label: 'Khách hàng', need: 'support', icon: 'customers' },
   { to: '/domains', label: 'Domains', need: 'viewer', icon: 'domains' },
-  { to: '/billing', label: 'Billing', need: 'admin', icon: 'billing' },
+  { to: '/billing', label: 'Billing', need: 'admin', icon: 'billing', global: true },
   { to: '/audit', label: 'Audit', need: 'viewer', icon: 'audit' },
-  { to: '/settings/users', label: 'Settings', need: 'admin', icon: 'settings' },
+  { to: '/settings/users', label: 'Settings', need: 'admin', icon: 'settings', global: true },
 ];
 
 // The menu inside an app (/apps/:id/…, spec admin-console-p4a §3); `to` takes the app id.
@@ -30,9 +32,14 @@ export const APP_NAV = [
 ];
 
 // "Tất cả app" + one option per app; picking one navigates (the URL is the context, nothing else is stored).
+// Spec admin-console-p4b §3: the apps of me.apps (the global admin: the server's list, every app); "Tất cả app"
+// only for whoever reaches every app (canAll), the others get a disabled "Chọn app" prompt outside an app.
 function AppSwitcher() {
-  const { appId, apps } = useAppContext();
+  const { me } = useAuth();
+  const { appId, apps: all } = useAppContext();
   const navigate = useNavigate();
+  const apps = me.global ? all : me.apps ?? [];
+  const home = canAll(me, 'viewer');
   const known = apps.some((a) => a.id === appId);
   return (
     <select
@@ -42,7 +49,7 @@ function AppSwitcher() {
       value={appId ?? ''}
       onChange={(e) => navigate(e.target.value ? `/apps/${encodeURIComponent(e.target.value)}` : '/')}
     >
-      <option value="">Tất cả app</option>
+      {home ? <option value="">Tất cả app</option> : !appId && <option value="" disabled>Chọn app</option>}
       {apps.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
       {appId && !known && <option value={appId}>{appId}</option>}
     </select>
@@ -52,14 +59,17 @@ function AppSwitcher() {
 function Menu() {
   const { me } = useAuth();
   const { appId } = useAppContext();
-  const items = appId ? APP_NAV.map((n) => ({ ...n, to: n.to(appId) })) : NAV;
+  // Spec admin-console-p4b §3: in an app the items of the role in that app; outside, the menu across apps.
+  const items = appId
+    ? APP_NAV.filter((n) => canIn(me, n.need, appId)).map((n) => ({ ...n, to: n.to(appId) }))
+    : NAV.filter((n) => (n.global ? canGlobal(me, n.need) : canAll(me, n.need)));
   return (
     <>
-      {items.filter((n) => can(me.role, n.need)).map((n) => {
+      {items.map((n) => {
         const I = ICONS[n.icon];
         return <NavLink key={n.to} to={n.to} end={n.end}><I />{n.label}</NavLink>;
       })}
-      {appId && <Link to="/" className="back">← Tất cả app</Link>}
+      {appId && canAll(me, 'viewer') && <Link to="/" className="back">← Tất cả app</Link>}
     </>
   );
 }
@@ -79,7 +89,7 @@ export function Layout() {
           <header className="top">
             <span className="user">
               <span className="avatar" aria-hidden="true">{me.email[0]}</span>
-              <span data-testid="who">{me.email} · {me.role}</span>
+              <span data-testid="who">{me.role ? `${me.email} · ${me.role}` : me.email}</span>
             </span>
             <button type="button" onClick={logout}><LogoutIcon />Đăng xuất</button>
           </header>
PATCH
```

`apps/admin/src/pages/FunnelDetail.jsx`, `apps/admin/src/components/UploadBox.jsx`, `apps/admin/src/components/PricesTab.jsx`, `apps/admin/src/components/FunnelSettings.jsx` (sửa, áp dụng đúng diff này):

`apps/admin/src/pages/FunnelDetail.jsx`, `apps/admin/src/components/UploadBox.jsx`, `apps/admin/src/components/PricesTab.jsx`, `apps/admin/src/components/FunnelSettings.jsx` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/src/components/FunnelSettings.jsx b/apps/admin/src/components/FunnelSettings.jsx
index 80d5e77..03f2836 100644
--- a/apps/admin/src/components/FunnelSettings.jsx
+++ b/apps/admin/src/components/FunnelSettings.jsx
@@ -43,7 +43,7 @@ export function FunnelSettings({ funnel, onSaved }) {
       <div className="row">
         <label htmlFor="pixel">Pixel ID</label>
         <input id="pixel" value={pixel} onChange={(e) => setPixel(e.target.value)} placeholder="(không có)" />
-        <RoleButton need="editor" onClick={() => save({ pixel_id: pixel.trim() || null }, 'pixel')}>Lưu pixel</RoleButton>
+        <RoleButton need="editor" appId={funnel.app_id ?? null} onClick={() => save({ pixel_id: pixel.trim() || null }, 'pixel')}>Lưu pixel</RoleButton>
       </div>
       <div className="row">
         <label htmlFor="app">App</label>
@@ -51,7 +51,7 @@ export function FunnelSettings({ funnel, onSaved }) {
           {current ? <option value={current.id}>{current.name} ({current.kind})</option> : <option value="" disabled>Chọn app</option>}
           {apps.filter((a) => a.id !== funnel.app_id).map((a) => <option key={a.id} value={a.id}>{a.name} ({a.kind})</option>)}
         </select>
-        <RoleButton need="editor" disabled={!appId} onClick={() => save({ app_id: appId }, 'app')}>Lưu app</RoleButton>
+        <RoleButton need="editor" appId={funnel.app_id ?? null} disabled={!appId} onClick={() => save({ app_id: appId }, 'app')}>Lưu app</RoleButton>
       </div>
       {saved && <p className="ok">{saved}</p>}
       {error?.code === 'funnel_live_on_app_domain' && Array.isArray(error.detail?.routes) ? (
diff --git a/apps/admin/src/components/PricesTab.jsx b/apps/admin/src/components/PricesTab.jsx
index e0d7ed1..af7e950 100644
--- a/apps/admin/src/components/PricesTab.jsx
+++ b/apps/admin/src/components/PricesTab.jsx
@@ -1,6 +1,6 @@
 import { useCallback, useEffect, useMemo, useState } from 'react';
 import { useAuth } from '../auth.jsx';
-import { can } from '../roles.js';
+import { canIn } from '../roles.js';
 import { priceLabel } from '../format.js';
 import { ErrorNote } from './ErrorNote.jsx';
 import { RoleButton } from './RoleButton.jsx';
@@ -46,10 +46,11 @@ function changes(rows, plans) {
 }
 
 // Funnel detail → Giá (spec admin-console-p2 §3): the HTML's plans against the saved Paddle prices; prices:read
-// reads, admin saves in one PUT; a 422 shows on the row it is about.
-export function PricesTab({ slug }) {
+// reads, admin saves in one PUT; a 422 shows on the row it is about. appId: the funnel's app, where the role counts
+// (spec admin-console-p4b §3).
+export function PricesTab({ slug, appId }) {
   const { client, me } = useAuth();
-  const isAdmin = can(me.role, 'admin');
+  const isAdmin = canIn(me, 'admin', appId);
   const [data, setData] = useState(null);
   const [rows, setRows] = useState([]);
   const [catalog, setCatalog] = useState([]);
@@ -151,7 +152,7 @@ export function PricesTab({ slug }) {
         </tbody>
       </table>
       <div className="row">
-        <RoleButton need="admin" className="primary" onClick={save}>Lưu giá</RoleButton>
+        <RoleButton need="admin" appId={appId} className="primary" onClick={save}>Lưu giá</RoleButton>
         {notice && <span className="ok">{notice}</span>}
       </div>
       <ErrorNote error={error} />
diff --git a/apps/admin/src/components/UploadBox.jsx b/apps/admin/src/components/UploadBox.jsx
index f7e09eb..0c51bd9 100644
--- a/apps/admin/src/components/UploadBox.jsx
+++ b/apps/admin/src/components/UploadBox.jsx
@@ -1,17 +1,18 @@
 import { useState } from 'react';
 import { byteLength, configFunnel, MAX_BYTES } from '@ikf/funnel-lint';
 import { useAuth } from '../auth.jsx';
-import { can } from '../roles.js';
+import { canIn } from '../roles.js';
 import { ErrorNote } from './ErrorNote.jsx';
 
 const finding = (f) => `${f.code}${f.line ? ` (dòng ${f.line})` : ''}: ${f.message}`;
 
 // Drop or pick demo.html; size and CONFIG.funnel are checked here, the full lint on the server (spec §5.3).
-export function UploadBox({ slug, onUploaded }) {
+// appId: the funnel's app; editor in that app may upload (spec admin-console-p4b §3).
+export function UploadBox({ slug, appId, onUploaded }) {
   const { client, me } = useAuth();
   const [state, setState] = useState({});
   const [over, setOver] = useState(false);
-  const allowed = can(me.role, 'editor');
+  const allowed = canIn(me, 'editor', appId);
 
   async function upload(file) {
     if (!file) return;
diff --git a/apps/admin/src/pages/FunnelDetail.jsx b/apps/admin/src/pages/FunnelDetail.jsx
index dc0c4a5..4114c4e 100644
--- a/apps/admin/src/pages/FunnelDetail.jsx
+++ b/apps/admin/src/pages/FunnelDetail.jsx
@@ -13,7 +13,7 @@ import { RollbackDialog } from '../components/RollbackDialog.jsx';
 import { StatsTab } from '../components/StatsTab.jsx';
 import { UploadBox } from '../components/UploadBox.jsx';
 import { fmtSize, fmtTime } from '../format.js';
-import { can } from '../roles.js';
+import { canIn } from '../roles.js';
 
 // Spec admin-console-p4a §3 "Funnel detail": App › slug above the heading (the app links to its Tổng quan), and a
 // yellow card while the funnel has no app (it can only go on shared hosts until an app is picked in Settings).
@@ -37,11 +37,7 @@ function AppTrail({ funnel }) {
 export function FunnelDetail() {
   const { slug } = useParams();
   const { client, me } = useAuth();
-  // Số liệu is the default tab (spec admin-console-p3 §3); ?tab=main | prices opens the others. Anything else, or
-  // prices without prices:read, is Số liệu.
   const [params, setParams] = useSearchParams();
-  const asked = params.get('tab');
-  const tab = asked === 'main' || (asked === 'prices' && can(me.role, 'prices:read')) ? asked : 'stats';
   const setTab = (t) => setParams(t === 'stats' ? {} : { tab: t }, { replace: true });
   const [funnel, setFunnel] = useState(null);
   const [error, setError] = useState(null);
@@ -56,6 +52,14 @@ export function FunnelDetail() {
   }, [load]);
 
   if (!funnel) return error ? <ErrorNote error={error} /> : <p className="muted">Đang tải…</p>;
+  // Spec admin-console-p4b §3: the buttons and the Giá tab follow the role in the funnel's app (null = no app,
+  // see effectiveRole); the page is outside /apps/:id, so it passes that app to RoleButton, UploadBox, PricesTab.
+  const appId = funnel.app_id ?? null;
+  const canPrices = canIn(me, 'prices:read', appId);
+  // Số liệu is the default tab (spec admin-console-p3 §3); ?tab=main | prices opens the others. Anything else, or
+  // prices without prices:read, is Số liệu.
+  const asked = params.get('tab');
+  const tab = asked === 'main' || (asked === 'prices' && canPrices) ? asked : 'stats';
   const done = (text) => {
     setPublishing(null);
     setRollingBack(null);
@@ -66,7 +70,7 @@ export function FunnelDetail() {
     <div role="tablist" className="row">
       <button type="button" role="tab" aria-selected={tab === 'stats'} onClick={() => setTab('stats')}>Số liệu</button>
       <button type="button" role="tab" aria-selected={tab === 'main'} onClick={() => setTab('main')}>Tổng quan</button>
-      {can(me.role, 'prices:read') && <button type="button" role="tab" aria-selected={tab === 'prices'} onClick={() => setTab('prices')}>Giá</button>}
+      {canPrices && <button type="button" role="tab" aria-selected={tab === 'prices'} onClick={() => setTab('prices')}>Giá</button>}
     </div>
   );
   if (tab !== 'main') {
@@ -75,7 +79,7 @@ export function FunnelDetail() {
         <AppTrail funnel={funnel} />
       <h1>{funnel.slug}</h1>
         {tabs}
-        {tab === 'stats' ? <StatsTab slug={funnel.slug} /> : <PricesTab slug={funnel.slug} />}
+        {tab === 'stats' ? <StatsTab slug={funnel.slug} /> : <PricesTab slug={funnel.slug} appId={appId} />}
       </section>
     );
   }
@@ -97,7 +101,7 @@ export function FunnelDetail() {
                   <td>{l.host}{l.prefix}</td>
                   <td><span className="badge live">v{l.v}</span></td>
                   <td>
-                    <RoleButton need="admin" disabled={!l.previous} title={l.previous ? undefined : 'Không có bản trước'} onClick={() => setRollingBack(l)}>
+                    <RoleButton need="admin" appId={appId} disabled={!l.previous} title={l.previous ? undefined : 'Không có bản trước'} onClick={() => setRollingBack(l)}>
                       Rollback
                     </RoleButton>
                   </td>
@@ -109,7 +113,7 @@ export function FunnelDetail() {
       </div>
       {rollingBack && <RollbackDialog funnel={funnel} route={rollingBack} onClose={() => setRollingBack(null)} onDone={done} />}
       {publishing && <PublishDialog funnel={funnel} version={publishing} onClose={() => setPublishing(null)} onDone={done} />}
-      <UploadBox slug={funnel.slug} onUploaded={load} />
+      <UploadBox slug={funnel.slug} appId={appId} onUploaded={load} />
       <div className="card">
         <h2>Versions</h2>
         {funnel.versions.length === 0 ? (
@@ -129,7 +133,7 @@ export function FunnelDetail() {
                   <td><LintBadge lint={v.lint} /></td>
                   <td className="row">
                     <button type="button" onClick={() => setPreview(v)}>Preview</button>
-                    <RoleButton need="admin" onClick={() => setPublishing(v)}>Publish</RoleButton>
+                    <RoleButton need="admin" appId={appId} onClick={() => setPublishing(v)}>Publish</RoleButton>
                   </td>
                 </tr>
               ))}
PATCH
```

`apps/admin/src/pages/AppOverview.jsx`, `apps/admin/src/pages/AppPlans.jsx`, `apps/admin/src/pages/AppSettings.jsx`, `apps/admin/src/pages/AppWebhooks.jsx`, `apps/admin/src/pages/Audit.jsx`, `apps/admin/src/pages/Customers.jsx`, `apps/admin/src/pages/Domains.jsx`, `apps/admin/src/pages/Funnels.jsx` (sửa, áp dụng đúng diff này):

`apps/admin/src/pages/AppOverview.jsx`, `apps/admin/src/pages/AppPlans.jsx`, `apps/admin/src/pages/AppSettings.jsx`, `apps/admin/src/pages/AppWebhooks.jsx`, `apps/admin/src/pages/Audit.jsx`, `apps/admin/src/pages/Customers.jsx`, `apps/admin/src/pages/Domains.jsx`, `apps/admin/src/pages/Funnels.jsx` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/src/pages/AppOverview.jsx b/apps/admin/src/pages/AppOverview.jsx
index 6847f0a..4389107 100644
--- a/apps/admin/src/pages/AppOverview.jsx
+++ b/apps/admin/src/pages/AppOverview.jsx
@@ -1,5 +1,6 @@
 import { useEffect, useRef, useState } from 'react';
 import { useNavigate, useParams } from 'react-router';
+import { AppNotFound, isAppNotFound } from '../app-context.jsx';
 import { useAuth } from '../auth.jsx';
 import { AnalyticsError, Loading } from '../components/AnalyticsState.jsx';
 import { ErrorNote } from '../components/ErrorNote.jsx';
@@ -7,7 +8,6 @@ import { Kpis, OverviewTable, useOverviewSort } from '../components/OverviewTabl
 import { RangePicker, rangeFor } from '../components/RangePicker.jsx';
 import { RoleButton } from '../components/RoleButton.jsx';
 
-const isNotFound = (err) => err?.status === 404 && err.code === 'app_not_found';
 const fmtRoutes = (routes) => routes.map((r) => `${r.prefix} → ${r.slug} v${r.v}`).join(', ') || '—';
 
 // The app's own domains (shared hosts are not listed: every app may publish there).
@@ -75,7 +75,7 @@ export function AppOverview() {
 
   const { rows, sort, onSort } = useOverviewSort(data?.funnels);
 
-  if (isNotFound(summaryError) || isNotFound(error)) return <p className="muted">Không tìm thấy app {id}.</p>;
+  if (isAppNotFound(summaryError) || isAppNotFound(error)) return <AppNotFound id={id} />;
   if (!summary) return summaryError ? <ErrorNote error={summaryError} /> : <p className="muted">Đang tải…</p>;
   const { app, domains } = summary;
   return (
diff --git a/apps/admin/src/pages/AppPlans.jsx b/apps/admin/src/pages/AppPlans.jsx
index 763373b..5d77244 100644
--- a/apps/admin/src/pages/AppPlans.jsx
+++ b/apps/admin/src/pages/AppPlans.jsx
@@ -1,6 +1,6 @@
 import { useEffect, useState } from 'react';
 import { Link, useParams } from 'react-router';
-import { useAppContext } from '../app-context.jsx';
+import { AppNotFound, isAppNotFound, useAppContext } from '../app-context.jsx';
 import { useAuth } from '../auth.jsx';
 import { ErrorNote } from '../components/ErrorNote.jsx';
 import { useLatest } from '../useLatest.js';
@@ -23,6 +23,7 @@ export function AppPlans() {
     client.getAppPlans(id).then((r) => isLatest() && setPlans(r.plans), (err) => isLatest() && setError(err));
   }, [client, id, begin]);
 
+  if (isAppNotFound(error)) return <AppNotFound id={id} />; // spec admin-console-p4b §3: out of scope or missing
   let body;
   if (plans === null) body = error ? <ErrorNote error={error} /> : <p className="muted">Đang tải…</p>;
   else if (!plans.length) body = <p className="muted">Chưa có plan nào trong app.</p>;
diff --git a/apps/admin/src/pages/AppSettings.jsx b/apps/admin/src/pages/AppSettings.jsx
index c56ccfb..1bb894c 100644
--- a/apps/admin/src/pages/AppSettings.jsx
+++ b/apps/admin/src/pages/AppSettings.jsx
@@ -1,13 +1,13 @@
 import { useState } from 'react';
 import { useParams } from 'react-router';
-import { useApp, useAppContext } from '../app-context.jsx';
+import { AppNotFound, useApp, useAppContext } from '../app-context.jsx';
 import { useAuth } from '../auth.jsx';
 import { ErrorNote } from '../components/ErrorNote.jsx';
 import { FieldErrors } from '../components/FieldErrors.jsx';
 import { RoleButton } from '../components/RoleButton.jsx';
 import { SecretsBox } from '../components/SecretsBox.jsx';
 import { fmtTime } from '../format.js';
-import { can } from '../roles.js';
+import { canIn } from '../roles.js';
 import { splitIds } from './Apps.jsx';
 
 // Editable fields per kind (PUT /v1/apps/:id never changes id, kind or handoff).
@@ -19,7 +19,7 @@ const asText = (app, f) => (f === 'bundle_ids' ? (app.bundle_ids ?? []).join(',
 
 function EditApp({ app, onSaved }) {
   const { client, me } = useAuth();
-  const isAdmin = can(me.role, 'admin');
+  const isAdmin = canIn(me, 'admin', app.id); // the role in this app (spec admin-console-p4b §3)
   const fields = FIELDS[app.kind];
   const [draft, setDraft] = useState(Object.fromEntries(fields.map(([f]) => [f, asText(app, f)])));
   const [error, setError] = useState(null);
@@ -109,7 +109,7 @@ export function AppSettings() {
   const [rotating, setRotating] = useState(false);
   const [newKey, setNewKey] = useState(null);
 
-  if (notFound) return <p className="muted">Không có app {id}.</p>;
+  if (notFound) return <AppNotFound id={id} />; // spec admin-console-p4b §3: out of scope looks the same
   if (!app) return error ? <ErrorNote error={error} /> : <p className="muted">Đang tải…</p>;
   return (
     <section>
diff --git a/apps/admin/src/pages/AppWebhooks.jsx b/apps/admin/src/pages/AppWebhooks.jsx
index 14ea323..0d2a8e4 100644
--- a/apps/admin/src/pages/AppWebhooks.jsx
+++ b/apps/admin/src/pages/AppWebhooks.jsx
@@ -1,6 +1,6 @@
 import { useCallback, useEffect, useState } from 'react';
 import { useParams } from 'react-router';
-import { useApp } from '../app-context.jsx';
+import { AppNotFound, useApp } from '../app-context.jsx';
 import { useAuth } from '../auth.jsx';
 import { ErrorNote } from '../components/ErrorNote.jsx';
 import { RoleButton } from '../components/RoleButton.jsx';
@@ -94,7 +94,7 @@ export function AppWebhooks() {
   const { id } = useParams();
   const { app, error, notFound } = useApp(id);
 
-  if (notFound) return <p className="muted">Không có app {id}.</p>;
+  if (notFound) return <AppNotFound id={id} />; // spec admin-console-p4b §3: out of scope looks the same
   if (!app) return error ? <ErrorNote error={error} /> : <p className="muted">Đang tải…</p>;
   return (
     <section>
diff --git a/apps/admin/src/pages/Audit.jsx b/apps/admin/src/pages/Audit.jsx
index 9af05d3..c836d0d 100644
--- a/apps/admin/src/pages/Audit.jsx
+++ b/apps/admin/src/pages/Audit.jsx
@@ -1,6 +1,6 @@
 import { useCallback, useEffect, useRef, useState } from 'react';
 import { useSearchParams } from 'react-router';
-import { useAppContext } from '../app-context.jsx';
+import { AppNotFound, isAppNotFound, useAppContext } from '../app-context.jsx';
 import { useAuth } from '../auth.jsx';
 import { ErrorNote } from '../components/ErrorNote.jsx';
 import { fmtTime } from '../format.js';
@@ -72,6 +72,8 @@ export function Audit() {
     if (isLatest()) setLoadingMore(false);
   };
 
+  // Spec admin-console-p4b §3: the first page's 404 (app out of scope or missing); a later page's error stays a line.
+  if (appId && items === null && isAppNotFound(error)) return <AppNotFound id={appId} />;
   return (
     <section>
       <h1>{appId ? `Audit của ${current?.name ?? appId}` : 'Audit'}</h1>
diff --git a/apps/admin/src/pages/Customers.jsx b/apps/admin/src/pages/Customers.jsx
index b9a4a68..81529ad 100644
--- a/apps/admin/src/pages/Customers.jsx
+++ b/apps/admin/src/pages/Customers.jsx
@@ -1,6 +1,6 @@
 import { useEffect, useState } from 'react';
 import { Link, useNavigate } from 'react-router';
-import { useAppContext } from '../app-context.jsx';
+import { AppNotFound, isAppNotFound, useAppContext } from '../app-context.jsx';
 import { useAuth } from '../auth.jsx';
 import { ErrorNote } from '../components/ErrorNote.jsx';
 import { fmtTime } from '../format.js';
@@ -71,6 +71,8 @@ export function Customers() {
     }
   };
 
+  // Spec admin-console-p4b §3: the lookup's 404 for an app out of scope or missing.
+  if (appId && isAppNotFound(error)) return <AppNotFound id={appId} />;
   return (
     <section>
       <h1>{appId ? `Khách hàng của ${app?.name ?? appId}` : 'Khách hàng'}</h1>
diff --git a/apps/admin/src/pages/Domains.jsx b/apps/admin/src/pages/Domains.jsx
index 7b91064..f060dd6 100644
--- a/apps/admin/src/pages/Domains.jsx
+++ b/apps/admin/src/pages/Domains.jsx
@@ -1,10 +1,10 @@
 import { useCallback, useEffect, useRef, useState } from 'react';
 import { Link } from 'react-router';
-import { useAppContext } from '../app-context.jsx';
+import { AppNotFound, isAppNotFound, useAppContext } from '../app-context.jsx';
 import { useAuth } from '../auth.jsx';
 import { ErrorNote } from '../components/ErrorNote.jsx';
 import { RoleButton } from '../components/RoleButton.jsx';
-import { can } from '../roles.js';
+import { canGlobal } from '../roles.js';
 import { useLatest } from '../useLatest.js';
 
 // Spec admin-console-p4a §2 "Domain và publish": a host with live routes of another app's (or an unassigned)
@@ -36,7 +36,9 @@ export function Domains() {
   const [help, setHelp] = useState(false);
   const [notice, setNotice] = useState('');
   const [assigning, setAssigning] = useState(false);
-  const admin = can(me.role, 'admin');
+  // Assigning a host to an app is the global admin's (PUT /v1/domains/:host, spec admin-console-p4b §2); Sync is a
+  // RoleButton (the role in the app shown).
+  const admin = canGlobal(me, 'admin');
   const nameOf = (id) => apps.find((a) => a.id === id)?.name ?? id;
   const begin = useLatest();
   // The app (page context) an assign started in: its answer is dropped only if another app is shown by then; a
@@ -160,6 +162,8 @@ export function Domains() {
     );
   }
 
+  // Spec admin-console-p4b §3: the list's 404 (app out of scope or missing); an assign's error stays a line.
+  if (appId && domains === null && isAppNotFound(error)) return <AppNotFound id={appId} />;
   return (
     <section>
       <h1>Domains</h1>
diff --git a/apps/admin/src/pages/Funnels.jsx b/apps/admin/src/pages/Funnels.jsx
index d511bae..0f40c04 100644
--- a/apps/admin/src/pages/Funnels.jsx
+++ b/apps/admin/src/pages/Funnels.jsx
@@ -1,6 +1,6 @@
 import { useEffect, useRef, useState } from 'react';
 import { Link, useNavigate, useSearchParams } from 'react-router';
-import { useAppContext } from '../app-context.jsx';
+import { AppNotFound, isAppNotFound, useAppContext } from '../app-context.jsx';
 import { useAuth } from '../auth.jsx';
 import { ErrorNote } from '../components/ErrorNote.jsx';
 import { RoleButton } from '../components/RoleButton.jsx';
@@ -65,6 +65,8 @@ export function Funnels() {
     }
   };
 
+  // Spec admin-console-p4b §3: the list's 404 (app out of scope or missing); a create's error stays a line.
+  if (appId && funnels === null && isAppNotFound(error)) return <AppNotFound id={appId} />;
   const shown = (funnels ?? []).filter((f) => f.slug.includes(query.trim().toLowerCase()));
   return (
     <section>
PATCH
```

`apps/admin/src/pages/Apps.jsx`, `apps/admin/src/pages/Billing.jsx`, `apps/admin/src/pages/CustomerDetail.jsx`, `apps/admin/src/pages/Users.jsx` (sửa, áp dụng đúng diff này — nút chỉ global: Tạo app, Chạy reconcile, Cấp lại user_id; Users theo `canGlobal`):

`apps/admin/src/pages/Apps.jsx`, `apps/admin/src/pages/Billing.jsx`, `apps/admin/src/pages/CustomerDetail.jsx`, `apps/admin/src/pages/Users.jsx` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/src/pages/Apps.jsx b/apps/admin/src/pages/Apps.jsx
index 18340c9..c95285b 100644
--- a/apps/admin/src/pages/Apps.jsx
+++ b/apps/admin/src/pages/Apps.jsx
@@ -120,7 +120,7 @@ export function Apps() {
         )}
         {field('webhook_url', 'Webhook URL', { placeholder: 'https://…' })}
         {field('bundle_ids', 'Bundle ids', { placeholder: 'com.a, com.b' })}
-        <RoleButton need="admin" className="primary" disabled={busy || !draft.id.trim()} onClick={create}>Tạo app</RoleButton>
+        <RoleButton need="admin" global className="primary" disabled={busy || !draft.id.trim()} onClick={create}>Tạo app</RoleButton>
         <ErrorNote error={error} />
         <FieldErrors error={error} />
       </div>
diff --git a/apps/admin/src/pages/Billing.jsx b/apps/admin/src/pages/Billing.jsx
index 29f2f0e..ee75b5d 100644
--- a/apps/admin/src/pages/Billing.jsx
+++ b/apps/admin/src/pages/Billing.jsx
@@ -34,7 +34,7 @@ function Reconcile() {
         <select id="rc-since" value={since} onChange={(e) => setSince(Number(e.target.value))}>
           {WINDOWS.map(([s, label]) => <option key={s} value={s}>{label}</option>)}
         </select>
-        <RoleButton need="admin" className="primary" disabled={busy} onClick={run}>Chạy reconcile</RoleButton>
+        <RoleButton need="admin" global className="primary" disabled={busy} onClick={run}>Chạy reconcile</RoleButton>
         {busy && <span className="muted">Đang chạy…</span>}
       </div>
       {result && (
diff --git a/apps/admin/src/pages/CustomerDetail.jsx b/apps/admin/src/pages/CustomerDetail.jsx
index 963bf14..9c22c60 100644
--- a/apps/admin/src/pages/CustomerDetail.jsx
+++ b/apps/admin/src/pages/CustomerDetail.jsx
@@ -293,7 +293,7 @@ export function CustomerDetail() {
         <h2>Hành động admin</h2>
         <div className="row">
           <RoleButton need="admin" onClick={() => setDialog('grant')}>Cấp quyền</RoleButton>
-          <RoleButton need="admin" onClick={() => setDialog('rotate')}>Cấp lại user_id</RoleButton>
+          <RoleButton need="admin" global onClick={() => setDialog('rotate')}>Cấp lại user_id</RoleButton>
         </div>
       </section>
 
diff --git a/apps/admin/src/pages/Users.jsx b/apps/admin/src/pages/Users.jsx
index d7a9676..390eb1b 100644
--- a/apps/admin/src/pages/Users.jsx
+++ b/apps/admin/src/pages/Users.jsx
@@ -1,12 +1,12 @@
 import { useCallback, useEffect, useState } from 'react';
 import { useAuth } from '../auth.jsx';
 import { ErrorNote } from '../components/ErrorNote.jsx';
-import { can, ROLE_INFO, ROLES } from '../roles.js';
+import { canGlobal, ROLE_INFO, ROLES } from '../roles.js';
 
 // Settings → Users (spec §5.6): admins add people, change roles, disable; nobody locks themselves out.
 export function Users() {
   const { client, me } = useAuth();
-  const isAdmin = can(me.role, 'admin');
+  const isAdmin = canGlobal(me, 'admin'); // Users is global-only (spec admin-console-p4b §2)
   const [users, setUsers] = useState(null);
   const [error, setError] = useState(null);
   const [draft, setDraft] = useState({ email: '', name: '', role: 'editor' });
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
cd apps/admin && npx vitest run test/scope-ui.test.jsx test/app-settings.test.jsx test/app-webhooks.test.jsx 2>&1 | grep -E "Test Files|Tests  "
cd ../.. && npm test -w @ikf/admin 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  26 passed (26)`; toàn bộ admin `Test Files  27 passed (27)`, `Tests  228 passed (228)` (trước: 26 file, 211 test).

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/App.jsx apps/admin/src/Layout.jsx apps/admin/src/app-context.jsx apps/admin/src/roles.js apps/admin/src/components/FunnelSettings.jsx apps/admin/src/components/PricesTab.jsx apps/admin/src/components/RequireGrant.jsx apps/admin/src/components/RoleButton.jsx apps/admin/src/components/UploadBox.jsx apps/admin/src/pages/AppOverview.jsx apps/admin/src/pages/AppPlans.jsx apps/admin/src/pages/AppSettings.jsx apps/admin/src/pages/AppWebhooks.jsx apps/admin/src/pages/Apps.jsx apps/admin/src/pages/Audit.jsx apps/admin/src/pages/Billing.jsx apps/admin/src/pages/CustomerDetail.jsx apps/admin/src/pages/Customers.jsx apps/admin/src/pages/Domains.jsx apps/admin/src/pages/FunnelDetail.jsx apps/admin/src/pages/Funnels.jsx apps/admin/src/pages/Users.jsx apps/admin/test/app-settings.test.jsx apps/admin/test/app-webhooks.test.jsx apps/admin/test/helpers.jsx apps/admin/test/scope-ui.test.jsx
git commit -m "feat(admin): per-app permissions in the console (switcher, menus, buttons, redirects)
```

---

---

### Task 8: SPA — Settings › Users: global, role mặc định, bảng app × role

**Files:**
- Create: `apps/admin/src/pages/UserDetail.jsx`
- Modify: `apps/admin/src/api.js`, `apps/admin/src/components/ErrorNote.jsx`, `apps/admin/src/pages/Users.jsx`, `apps/admin/src/App.jsx`, `apps/admin/src/styles.css`
- Test: `apps/admin/test/users-apps.test.jsx` (mới); sửa `apps/admin/test/helpers.jsx` (`fakeClient` thêm `setUserApp`, `removeUserApp`), `apps/admin/test/api.test.js` (thêm một `it.each` cho 6 request Users, không đổi test cũ), `apps/admin/test/grants.test.jsx` (một dòng: select role của từng dòng giờ có thêm option `''` "Không" đứng đầu, vì cột Role mặc định có thể là null)

**Interfaces:**
- Consumes (Task 3, `services/core-api/src/http/users.js`, đều global-only): `GET /v1/admin/users` → `{users: [{id, email, name, role (null = không role mặc định), global, disabled_at, created_by, created_at, apps: [{app_id, role}]}]}`; `POST /v1/admin/users` body `{email, name?, role? (null), global?, apps?: [{app_id, role}]}` → 201 một người; `PUT /v1/admin/users/:id` body `{role? (null), name?, disabled?, global?}`; `PUT /v1/admin/users/:id/apps/:app_id` body `{role}` (upsert); `DELETE /v1/admin/users/:id/apps/:app_id` (404 `user_app_not_found` nếu không có dòng). Lỗi: 409 `last_global_admin`, 409 `cannot_lock_self`, 404 `user_not_found`, 404 `app_not_found`, 409 `user_exists`, 400 `invalid_email`/`duplicate_app`. Không có `GET` một người. Câu tiếng Việt của CLI (Task 6, `packages/cli/src/main.js formatApiError`). Task 7: `canGlobal`, `AllApps`, `useAppContext().apps`.
- Produces:
  - `api.js`: `setUserApp(id, appId, role)` → `PUT /v1/admin/users/${id}/apps/${encodeURIComponent(appId)}` `{role}`; `removeUserApp(id, appId)` → `DELETE` cùng đường; `listUsers`/`createUser`/`updateUser` giữ nguyên chữ ký (body mới đi thẳng).
  - `ErrorNote.jsx` `errorText`: `last_global_admin` → "Phải còn ít nhất một global admin.", `cannot_lock_self` → "Không thể tự bỏ global hoặc tự khoá mình." (cùng câu với CLI); mã khác giữ "Lỗi <status> <code>".
  - `pages/Users.jsx`: export `RoleOptions` (option `''` "Không" + 4 role) và `appName(apps, id)`; bảng `Email · Tên · Role mặc định · Global · App · Trạng thái · (nút)`; email là link `/settings/users/:id`; Role mặc định là select (`''` → gửi `role: null`); cột Global `data-testid="user-global"` (badge "Global" hoặc "—"); cột App chip `data-testid="user-app"` "Starlyn: editor" (tên từ `useAppContext().apps`); form tạo thêm checkbox "Global", role "Không", một select `Role mới ở <tên app>` cho mỗi app; `createUser` chỉ gửi `global: true` khi tick và `apps` khi có ít nhất một app (giống `ikf admin add`), nên body cũ `{email, name, role}` không đổi.
  - `pages/UserDetail.jsx` (`/settings/users/:id`, trong `AllApps`, nội dung chỉ khi `canGlobal(me, 'admin')`): đọc `listUsers()` rồi tìm id ("Không tìm thấy người dùng <id>." nếu không có); checkbox `aria-label="Global admin"` (bật → `updateUser(id, {global: true})`; tắt → dialog `Bỏ global <email>` với "Xác nhận bỏ global"/"Huỷ"); select "Role mặc định"; bảng `data-testid="user-app-row"` mỗi app một select `Role ở <tên>` (chọn role → `setUserApp`, "Không" → `removeUserApp`); nút Khoá/Mở khoá; dòng của chính mình khoá Global, Role mặc định, Khoá; mọi thay đổi tải lại danh sách.
  - `App.jsx`: route `/settings/users/:id` → `<AllApps><UserDetail /></AllApps>`.

- [ ] **Step 1: Viết test fail**

`apps/admin/test/users-apps.test.jsx` (mới):

`apps/admin/test/users-apps.test.jsx` (mới):

```jsx
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { ApiError } from '../src/api.js';
import { ME, renderApp } from './helpers.jsx';
import { appsClient } from './apps-fixtures.js';

// GET /v1/admin/users as core-api answers it (spec admin-console-p4b §2 "Users và token"): role null = no default
// role, global, apps = the person's own app rows sorted by app.
const u = (id, email, o = {}) => ({
  id, email, name: '', role: 'viewer', global: false, disabled_at: null, created_by: 'boss@ikameglobal.com', created_at: '2026-10-01T00:00:00.000Z', apps: [], ...o,
});
const USERS = {
  users: [
    u(1, 'boss@ikameglobal.com', { name: 'Boss', role: 'admin', global: true }),
    u(2, 'ed@ikameglobal.com', { name: 'Ed', role: 'editor', apps: [{ app_id: 'starlyn', role: 'admin' }] }),
    u(3, 'cs@ikameglobal.com', { role: null, apps: [{ app_id: 'starlyn', role: 'support' }, { app_id: 'tarot-web', role: 'viewer' }] }),
    u(4, 'old@ikameglobal.com', { disabled_at: '2026-10-05T00:00:00.000Z' }),
    u(5, 'g2@ikameglobal.com', { role: 'admin', global: true }),
  ],
};
const usersClient = (me = ME.admin, overrides = {}) =>
  appsClient(me, {
    listUsers: vi.fn(async () => USERS),
    createUser: vi.fn(async (b) => ({ id: 6, ...b })),
    updateUser: vi.fn(async (id) => USERS.users[id - 1]),
    setUserApp: vi.fn(async (id) => USERS.users[id - 1]),
    removeUserApp: vi.fn(async (id) => USERS.users[id - 1]),
    ...overrides,
  });

describe('Settings › Users: global, default role, app roles (spec admin-console-p4b §3)', () => {
  it('the list shows the default role ("Không" for none), a Global badge and the app roles as chips', async () => {
    renderApp(usersClient(), '/settings/users');
    const rows = await screen.findAllByTestId('user');
    expect([...rows[0].closest('table').querySelectorAll('th')].map((th) => th.textContent)).toEqual(['Email', 'Tên', 'Role mặc định', 'Global', 'App', 'Trạng thái', '']);
    expect(rows.map((r) => r.firstChild.textContent)).toEqual(USERS.users.map((x) => x.email));
    const cs = within(rows[2]).getByLabelText('Role của cs@ikameglobal.com');
    expect(cs.value).toBe('');
    expect(cs.selectedOptions[0].textContent).toBe('Không');
    expect(rows.map((r) => within(r).getByTestId('user-global').textContent)).toEqual(['Global', '—', '—', '—', 'Global']);
    expect(rows.map((r) => within(r).queryAllByTestId('user-app').map((c) => c.textContent))).toEqual([
      [], ['Starlyn: admin'], ['Starlyn: support', 'Tarot Web: viewer'], [], [],
    ]);
    expect(within(rows[3]).getByText('khoá từ 2026-10-05')).toBeTruthy();
    expect(within(rows[2]).getByRole('link', { name: 'cs@ikameglobal.com' }).getAttribute('href')).toBe('/settings/users/3');
  });

  it('the default role of a row can be set to "Không" (null)', async () => {
    const client = usersClient();
    renderApp(client, '/settings/users');
    const rows = await screen.findAllByTestId('user');
    fireEvent.change(within(rows[1]).getByLabelText('Role của ed@ikameglobal.com'), { target: { value: '' } });
    await waitFor(() => expect(client.updateUser).toHaveBeenCalledWith(2, { role: null }));
  });

  it('create: Global, role "Không" and a role per app go in one createUser; the form resets', async () => {
    const client = usersClient();
    renderApp(client, '/settings/users');
    await screen.findAllByTestId('user');
    fireEvent.change(screen.getByPlaceholderText('email@ikameglobal.com'), { target: { value: 'new@ikameglobal.com' } });
    fireEvent.change(screen.getByLabelText('Role mới'), { target: { value: '' } });
    expect(screen.getByTestId('role-info').textContent).toBe('Không: chỉ các app được cấp bên dưới.');
    fireEvent.click(screen.getByLabelText('Global'));
    const starlyn = await screen.findByLabelText('Role mới ở Starlyn');
    expect([...starlyn.options].map((o) => o.textContent)).toEqual(['Không', 'viewer', 'support', 'editor', 'admin']);
    fireEvent.change(starlyn, { target: { value: 'editor' } });
    fireEvent.click(screen.getByRole('button', { name: 'Thêm' }));
    await waitFor(() => expect(client.createUser).toHaveBeenCalledWith({
      email: 'new@ikameglobal.com', name: '', role: null, global: true, apps: [{ app_id: 'starlyn', role: 'editor' }],
    }));
    await waitFor(() => expect(screen.getByLabelText('Global').checked).toBe(false));
    expect(screen.getByLabelText('Role mới ở Starlyn').value).toBe('');
    expect(screen.getByLabelText('Role mới').value).toBe('editor');
  });

  it('detail: Global on, default role, app × role (set, change, remove) and disable call the right methods', async () => {
    const client = usersClient();
    renderApp(client, '/settings/users/2');
    expect(await screen.findByRole('heading', { level: 1, name: 'ed@ikameglobal.com' })).toBeTruthy();
    const global = screen.getByLabelText('Global admin');
    expect(global.checked).toBe(false);
    fireEvent.click(global);
    await waitFor(() => expect(client.updateUser).toHaveBeenCalledWith(2, { global: true }));
    expect(screen.queryByRole('dialog')).toBeNull();

    const role = screen.getByLabelText('Role mặc định');
    expect(role.value).toBe('editor');
    fireEvent.change(role, { target: { value: '' } });
    await waitFor(() => expect(client.updateUser).toHaveBeenCalledWith(2, { role: null }));

    const rows = screen.getAllByTestId('user-app-row');
    expect(rows.map((r) => r.firstChild.textContent)).toEqual(['Starlyn', 'Tarot Web']);
    expect(within(rows[0]).getByLabelText('Role ở Starlyn').value).toBe('admin');
    expect(within(rows[1]).getByLabelText('Role ở Tarot Web').value).toBe('');
    fireEvent.change(within(rows[1]).getByLabelText('Role ở Tarot Web'), { target: { value: 'viewer' } });
    await waitFor(() => expect(client.setUserApp).toHaveBeenCalledWith(2, 'tarot-web', 'viewer'));
    fireEvent.change(within(rows[0]).getByLabelText('Role ở Starlyn'), { target: { value: 'editor' } });
    await waitFor(() => expect(client.setUserApp).toHaveBeenCalledWith(2, 'starlyn', 'editor'));
    fireEvent.change(within(rows[0]).getByLabelText('Role ở Starlyn'), { target: { value: '' } });
    await waitFor(() => expect(client.removeUserApp).toHaveBeenCalledWith(2, 'starlyn'));

    fireEvent.click(screen.getByRole('button', { name: 'Khoá' }));
    await waitFor(() => expect(client.updateUser).toHaveBeenCalledWith(2, { disabled: true }));
    await waitFor(() => expect(client.listUsers.mock.calls.length).toBeGreaterThanOrEqual(7));
  });

  it('detail: turning Global off asks first; last_global_admin is shown in Vietnamese', async () => {
    const client = usersClient(ME.admin, { updateUser: vi.fn(async () => { throw new ApiError(409, { error: 'last_global_admin' }); }) });
    renderApp(client, '/settings/users/5');
    const global = await screen.findByLabelText('Global admin');
    expect(global.checked).toBe(true);
    fireEvent.click(global);
    const dialog = screen.getByRole('dialog', { name: 'Bỏ global g2@ikameglobal.com' });
    expect(client.updateUser).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Huỷ' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(client.updateUser).not.toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText('Global admin'));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Xác nhận bỏ global' }));
    await waitFor(() => expect(client.updateUser).toHaveBeenCalledWith(5, { global: false }));
    expect((await screen.findByRole('alert')).textContent).toBe('Phải còn ít nhất một global admin.');
  });

  it('own page: Global, default role and Khoá are locked', async () => {
    renderApp(usersClient(), '/settings/users/1');
    expect((await screen.findByLabelText('Global admin')).disabled).toBe(true);
    expect(screen.getByLabelText('Role mặc định').disabled).toBe(true);
    expect(screen.getByRole('button', { name: 'Khoá' }).disabled).toBe(true);
  });

  it('cannot_lock_self from the server is shown in Vietnamese', async () => {
    const client = usersClient(ME.admin, { updateUser: vi.fn(async () => { throw new ApiError(409, { error: 'cannot_lock_self' }); }) });
    renderApp(client, '/settings/users/2');
    fireEvent.change(await screen.findByLabelText('Role mặc định'), { target: { value: 'viewer' } });
    expect((await screen.findByRole('alert')).textContent).toBe('Không thể tự bỏ global hoặc tự khoá mình.');
  });

  it('detail of an unknown id says so; a person who is not global gets no detail and no list call', async () => {
    renderApp(usersClient(), '/settings/users/99');
    expect(await screen.findByText('Không tìm thấy người dùng 99.')).toBeTruthy();

    const client = usersClient(ME.editor);
    renderApp(client, '/settings/users/2');
    expect(await screen.findByText('Chỉ admin quản lý người dùng.')).toBeTruthy();
    expect(client.listUsers).not.toHaveBeenCalled();
  });
});
```

`apps/admin/test/helpers.jsx`, `apps/admin/test/api.test.js`, `apps/admin/test/grants.test.jsx` (sửa, áp dụng đúng diff này — `fakeClient` có hai method mới; `api.test.js` thêm 6 dòng request Users khớp server; `grants.test.jsx` chỉ đổi danh sách option của select từng dòng thành `['', 'viewer', 'support', 'editor', 'admin']`):

`apps/admin/test/helpers.jsx`, `apps/admin/test/api.test.js`, `apps/admin/test/grants.test.jsx` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/test/api.test.js b/apps/admin/test/api.test.js
index 6d8624d..3edfa2b 100644
--- a/apps/admin/test/api.test.js
+++ b/apps/admin/test/api.test.js
@@ -92,4 +92,20 @@ describe('admin API client', () => {
     expect([s.calls[0].method, s.calls[0].url]).toEqual([method, `https://api.test${path}`]);
     expect(s.calls[0].body === undefined ? undefined : JSON.parse(s.calls[0].body)).toEqual(body);
   });
+
+  // Spec admin-console-p4b §2 "Users và token" (Settings › Users): the requests match services/core-api/src/http/users.js.
+  it.each([
+    ['listUsers', (c) => c.listUsers(), 'GET', '/v1/admin/users', undefined],
+    ['createUser({global, apps})', (c) => c.createUser({ email: 'n@ikameglobal.com', name: '', role: null, global: true, apps: [{ app_id: 'starlyn', role: 'editor' }] }),
+      'POST', '/v1/admin/users', { email: 'n@ikameglobal.com', name: '', role: null, global: true, apps: [{ app_id: 'starlyn', role: 'editor' }] }],
+    ['updateUser({global})', (c) => c.updateUser(2, { global: false }), 'PUT', '/v1/admin/users/2', { global: false }],
+    ['updateUser({role: null})', (c) => c.updateUser(2, { role: null }), 'PUT', '/v1/admin/users/2', { role: null }],
+    ['setUserApp', (c) => c.setUserApp(2, 'tarot web', 'viewer'), 'PUT', '/v1/admin/users/2/apps/tarot%20web', { role: 'viewer' }],
+    ['removeUserApp', (c) => c.removeUserApp(2, 'starlyn'), 'DELETE', '/v1/admin/users/2/apps/starlyn', undefined],
+  ])('users: %s', async (_, run, method, path, body) => {
+    const s = scripted({});
+    await run(createClient({ base: 'https://api.test', fetch: s.fetch }));
+    expect([s.calls[0].method, s.calls[0].url]).toEqual([method, `https://api.test${path}`]);
+    expect(s.calls[0].body === undefined ? undefined : JSON.parse(s.calls[0].body)).toEqual(body);
+  });
 });
diff --git a/apps/admin/test/grants.test.jsx b/apps/admin/test/grants.test.jsx
index 90747b5..dd0af77 100644
--- a/apps/admin/test/grants.test.jsx
+++ b/apps/admin/test/grants.test.jsx
@@ -102,7 +102,7 @@ describe('Users: role support with what each role may do', () => {
     const row = await screen.findByTestId('user');
     const own = within(row).getByLabelText('Role của cs@ikameglobal.com');
     expect(own.value).toBe('support');
-    expect([...own.options].map((o) => o.value)).toEqual(['viewer', 'support', 'editor', 'admin']);
+    expect([...own.options].map((o) => o.value)).toEqual(['', 'viewer', 'support', 'editor', 'admin']);
     const pick = screen.getByLabelText('Role mới');
     expect(screen.getByTestId('role-info').textContent).toBe('editor: upload funnel, pixel/app, xem giá và app.');
     fireEvent.change(pick, { target: { value: 'support' } });
diff --git a/apps/admin/test/helpers.jsx b/apps/admin/test/helpers.jsx
index 3091c1b..69c7443 100644
--- a/apps/admin/test/helpers.jsx
+++ b/apps/admin/test/helpers.jsx
@@ -46,6 +46,8 @@ export function fakeClient(me = ME.admin, overrides = {}) {
     listUsers: vi.fn(async () => ({ users: [] })),
     createUser: vi.fn(),
     updateUser: vi.fn(),
+    setUserApp: vi.fn(),
+    removeUserApp: vi.fn(),
     getPrices: vi.fn(async (slug) => ({ funnel: slug, plans: {}, plan_keys: null, unmapped: [] })),
     setPrices: vi.fn(),
     listPaddlePrices: vi.fn(async () => ({ prices: [] })),
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
cd apps/admin && npx vitest run test/users-apps.test.jsx test/api.test.js test/grants.test.jsx 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Test Files  3 failed (3)`, `Tests  11 failed | 38 passed (49)`: `api.test.js` `users: setUserApp`, `users: removeUserApp` (client chưa có method); `grants.test.jsx` select từng dòng chưa có option "Không"; cả 8 test `users-apps.test.jsx` fail vì bảng chưa có cột Role mặc định/Global/App, email chưa là link, form tạo chưa có Global/role "Không"/role theo app, và chưa có route `/settings/users/:id` (rơi vào "Chọn một mục bên trái."), lỗi `last_global_admin`/`cannot_lock_self` còn hiện "Lỗi 409 …".

- [ ] **Step 3: Implement**

`apps/admin/src/pages/UserDetail.jsx` (mới):

`apps/admin/src/pages/UserDetail.jsx` (mới):

```jsx
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useAppContext } from '../app-context.jsx';
import { useAuth } from '../auth.jsx';
import { ErrorNote } from '../components/ErrorNote.jsx';
import { canGlobal } from '../roles.js';
import { appName, RoleOptions } from './Users.jsx';

// Settings › Users › one person (spec admin-console-p4b §3): the global flag, the default role (or none) and the
// app × role table. There is no GET of one person: the page reads GET /v1/admin/users and finds the id; every
// change reloads that list. The server keeps the rules (409 last_global_admin, cannot_lock_self); the console only
// locks the controls of the person's own row and asks before taking global away.
export function UserDetail() {
  const { id } = useParams();
  const { client, me } = useAuth();
  const { apps } = useAppContext();
  const isAdmin = canGlobal(me, 'admin'); // Users is global-only (spec admin-console-p4b §2)
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);
  const [confirmOff, setConfirmOff] = useState(false);

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
  if (users === null) return <section><h1>Users</h1>{error ? <ErrorNote error={error} /> : <p className="muted">Đang tải…</p>}</section>;
  const user = users.find((u) => String(u.id) === id);
  if (!user) return <section><h1>Users</h1><p className="muted">Không tìm thấy người dùng {id}.</p></section>;

  const self = user.email === me.email;
  const why = self ? 'Không tự khoá hay hạ quyền chính mình' : undefined;
  const own = new Map((user.apps ?? []).map((a) => [a.app_id, a.role]));
  // Every app of the console, plus any app row whose app is not in the list (never hidden).
  const rows = [...apps.map((a) => a.id), ...[...own.keys()].filter((appId) => !apps.some((a) => a.id === appId))];
  const setApp = (appId, role) => act(() => (role ? client.setUserApp(user.id, appId, role) : client.removeUserApp(user.id, appId)));

  return (
    <section>
      <div className="breadcrumb"><Link to="/settings/users">Users</Link> › {user.email}</div>
      <h1>{user.email}</h1>
      <p className="muted">{user.name || '—'} · {user.disabled_at ? `khoá từ ${user.disabled_at.slice(0, 10)}` : 'hoạt động'}</p>
      <ErrorNote error={error} />
      <div className="card">
        <div className="row">
          <label>
            <input
              type="checkbox"
              aria-label="Global admin"
              checked={user.global}
              disabled={self}
              title={why}
              onChange={(e) => (e.target.checked ? act(() => client.updateUser(user.id, { global: true })) : setConfirmOff(true))}
            />{' '}
            Global admin: mọi app, Users, Billing, token
          </label>
        </div>
        <div className="row">
          <label htmlFor="default-role">Role mặc định</label>
          <select id="default-role" value={user.role ?? ''} disabled={self} title={why} onChange={(e) => act(() => client.updateUser(user.id, { role: e.target.value || null }))}>
            <RoleOptions />
          </select>
          <span className="muted">ở mọi app không có dòng riêng bên dưới (Không = chỉ các app được cấp).</span>
        </div>
      </div>
      {confirmOff && (
        <div role="dialog" aria-modal="true" aria-label={`Bỏ global ${user.email}`} className="dialog">
          <h3>Bỏ global của {user.email}?</h3>
          <p>Người này mất Users, Billing, token và chỉ còn role mặc định cùng role theo app bên dưới.</p>
          <div className="row">
            <button type="button" className="primary" onClick={() => { setConfirmOff(false); act(() => client.updateUser(user.id, { global: false })); }}>
              Xác nhận bỏ global
            </button>
            <button type="button" onClick={() => setConfirmOff(false)}>Huỷ</button>
          </div>
        </div>
      )}
      <h2>Role theo app</h2>
      {user.global && <p className="muted">Global: admin ở mọi app; role theo app chỉ có tác dụng khi bỏ global.</p>}
      <table>
        <thead>
          <tr><th>App</th><th>Role (Không = theo role mặc định)</th></tr>
        </thead>
        <tbody>
          {rows.map((appId) => {
            const name = appName(apps, appId);
            return (
              <tr key={appId} data-testid="user-app-row">
                <td>{name}</td>
                <td>
                  <select aria-label={`Role ở ${name}`} value={own.get(appId) ?? ''} onChange={(e) => setApp(appId, e.target.value)}>
                    <RoleOptions />
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="row">
        {user.disabled_at ? (
          <button type="button" onClick={() => act(() => client.updateUser(user.id, { disabled: false }))}>Mở khoá</button>
        ) : (
          <button type="button" disabled={self} title={why} onClick={() => act(() => client.updateUser(user.id, { disabled: true }))}>Khoá</button>
        )}
      </div>
    </section>
  );
}
```

`apps/admin/src/api.js`, `apps/admin/src/components/ErrorNote.jsx` (sửa, áp dụng đúng diff này):

`apps/admin/src/api.js`, `apps/admin/src/components/ErrorNote.jsx` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/src/api.js b/apps/admin/src/api.js
index 13cec6b..4d1157b 100644
--- a/apps/admin/src/api.js
+++ b/apps/admin/src/api.js
@@ -132,8 +132,14 @@ export function createClient({ base = API_BASE, fetch = (...a) => globalThis.fet
     getOverview: (params) => call('GET', `/v1/analytics/overview${query(params)}`),
     getFunnelStats: (slug, params) => call('GET', `/v1/analytics/funnels/${q(slug)}${query(params)}`),
     getFunnelBreakdown: (slug, params) => call('GET', `/v1/analytics/funnels/${q(slug)}/breakdown${query(params)}`),
+    // Settings › Users (spec admin-console-p4b §2 "Users và token", global only). Rows: {id, email, name, role (null =
+    // no default role), global, disabled_at, apps: [{app_id, role}]}. createUser body {email, name?, role?, global?,
+    // apps?: [{app_id, role}]}; updateUser body {role?, name?, disabled?, global?}.
     listUsers: () => call('GET', '/v1/admin/users'),
     createUser: (body) => call('POST', '/v1/admin/users', body),
     updateUser: (id, body) => call('PUT', `/v1/admin/users/${id}`, body),
+    // The person's role in one app (an upsert), or back to their default role there.
+    setUserApp: (id, appId, role) => call('PUT', `/v1/admin/users/${id}/apps/${q(appId)}`, { role }),
+    removeUserApp: (id, appId) => call('DELETE', `/v1/admin/users/${id}/apps/${q(appId)}`),
   };
 }
diff --git a/apps/admin/src/components/ErrorNote.jsx b/apps/admin/src/components/ErrorNote.jsx
index dc153ec..fa884db 100644
--- a/apps/admin/src/components/ErrorNote.jsx
+++ b/apps/admin/src/components/ErrorNote.jsx
@@ -1,6 +1,13 @@
 // An API error as one line; 5xx carries the request id for the on-call engineer.
+// Spec admin-console-p4b §1, §3: the Users rules read as sentences (same wording as `ikf admin`, packages/cli).
+const MESSAGES = {
+  last_global_admin: 'Phải còn ít nhất một global admin.',
+  cannot_lock_self: 'Không thể tự bỏ global hoặc tự khoá mình.',
+};
+
 export function errorText(err) {
   if (!err) return '';
+  if (Object.hasOwn(MESSAGES, err.code ?? '')) return MESSAGES[err.code];
   if (err.status === 0) return 'Mất kết nối mạng. Thử lại.';
   if (err.status >= 500) return `Lỗi máy chủ (${err.code})${err.requestId ? `, request id ${err.requestId}` : ''}.`;
   return `Lỗi ${err.status} ${err.code}`;
PATCH
```

`apps/admin/src/pages/Users.jsx`, `apps/admin/src/App.jsx`, `apps/admin/src/styles.css` (sửa, áp dụng đúng diff này):

`apps/admin/src/pages/Users.jsx`, `apps/admin/src/App.jsx`, `apps/admin/src/styles.css` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/src/App.jsx b/apps/admin/src/App.jsx
index b38d9ca..e6b5ac7 100644
--- a/apps/admin/src/App.jsx
+++ b/apps/admin/src/App.jsx
@@ -16,6 +16,7 @@ import { Domains } from './pages/Domains.jsx';
 import { FunnelDetail } from './pages/FunnelDetail.jsx';
 import { Funnels } from './pages/Funnels.jsx';
 import { Login } from './pages/Login.jsx';
+import { UserDetail } from './pages/UserDetail.jsx';
 import { Users } from './pages/Users.jsx';
 import { canAll } from './roles.js';
 
@@ -54,6 +55,8 @@ export function App({ client }) {
           <Route path="/billing" element={<AllApps><RequireGrant need="admin" global><Billing /></RequireGrant></AllApps>} />
           <Route path="/audit" element={<AllApps><Audit /></AllApps>} />
           <Route path="/settings/users" element={<AllApps><Users /></AllApps>} />
+          {/* Spec admin-console-p4b §3: one person's global flag, default role and app × role table. */}
+          <Route path="/settings/users/:id" element={<AllApps><UserDetail /></AllApps>} />
           <Route path="*" element={<p className="muted">Chọn một mục bên trái.</p>} />
         </Route>
       </Routes>
diff --git a/apps/admin/src/pages/Users.jsx b/apps/admin/src/pages/Users.jsx
index 390eb1b..b093b70 100644
--- a/apps/admin/src/pages/Users.jsx
+++ b/apps/admin/src/pages/Users.jsx
@@ -1,15 +1,36 @@
 import { useCallback, useEffect, useState } from 'react';
+import { Link } from 'react-router';
+import { useAppContext } from '../app-context.jsx';
 import { useAuth } from '../auth.jsx';
 import { ErrorNote } from '../components/ErrorNote.jsx';
 import { canGlobal, ROLE_INFO, ROLES } from '../roles.js';
 
-// Settings → Users (spec §5.6): admins add people, change roles, disable; nobody locks themselves out.
+// Spec admin-console-p4b §1, §3: the default role may be none (null): the person then works only in the apps of
+// their own app rows. In a <select> "Không" is the value '' (sent as null).
+export function RoleOptions() {
+  return (
+    <>
+      <option value="">Không</option>
+      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
+    </>
+  );
+}
+
+// The app's name from the console's app list (AppsProvider; Users is global, so it holds every app).
+export const appName = (apps, id) => apps.find((a) => a.id === id)?.name ?? id;
+
+const EMPTY = { email: '', name: '', role: 'editor', global: false, apps: {} };
+
+// Settings → Users (spec §5.6, admin-console-p4b §3): admins add people (default role or none, global, a role per
+// app), change default roles, disable; nobody locks themselves out. The app roles and the global flag of one
+// person are edited on /settings/users/:id (UserDetail).
 export function Users() {
   const { client, me } = useAuth();
+  const { apps } = useAppContext();
   const isAdmin = canGlobal(me, 'admin'); // Users is global-only (spec admin-console-p4b §2)
   const [users, setUsers] = useState(null);
   const [error, setError] = useState(null);
-  const [draft, setDraft] = useState({ email: '', name: '', role: 'editor' });
+  const [draft, setDraft] = useState(EMPTY);
 
   const load = useCallback(() => client.listUsers().then((r) => setUsers(r.users), setError), [client]);
   useEffect(() => {
@@ -26,28 +47,55 @@ export function Users() {
     }
   };
 
+  // global and apps are sent only when set, as `ikf admin add` does (POST /v1/admin/users defaults: false, []).
+  const create = async () => {
+    const grants = Object.entries(draft.apps).filter(([, role]) => role).map(([appId, role]) => ({ app_id: appId, role }));
+    await client.createUser({
+      email: draft.email.trim(),
+      name: draft.name.trim(),
+      role: draft.role || null,
+      ...(draft.global && { global: true }),
+      ...(grants.length > 0 && { apps: grants }),
+    });
+    setDraft(EMPTY);
+  };
+
   if (!isAdmin) return <section><h1>Users</h1><p className="muted">Chỉ admin quản lý người dùng.</p></section>;
   return (
     <section>
       <h1>Users</h1>
-      <div className="row card">
-        <input placeholder="email@ikameglobal.com" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
-        <input placeholder="Tên" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
-        <select aria-label="Role mới" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })}>
-          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
-        </select>
-        <button
-          type="button"
-          className="primary"
-          disabled={!draft.email.trim()}
-          onClick={() => act(async () => {
-            await client.createUser({ email: draft.email.trim(), name: draft.name.trim(), role: draft.role });
-            setDraft({ email: '', name: '', role: 'editor' });
-          })}
-        >
-          Thêm
-        </button>
-        <span className="muted" data-testid="role-info">{draft.role}: {ROLE_INFO[draft.role]}</span>
+      <div className="card">
+        <div className="row">
+          <input placeholder="email@ikameglobal.com" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
+          <input placeholder="Tên" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
+          <select aria-label="Role mới" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })}>
+            <RoleOptions />
+          </select>
+          <label><input type="checkbox" checked={draft.global} onChange={(e) => setDraft({ ...draft, global: e.target.checked })} /> Global</label>
+          <button type="button" className="primary" disabled={!draft.email.trim()} onClick={() => act(create)}>
+            Thêm
+          </button>
+          <span className="muted" data-testid="role-info">
+            {draft.role ? `${draft.role}: ${ROLE_INFO[draft.role]}` : 'Không: chỉ các app được cấp bên dưới.'}
+          </span>
+        </div>
+        {apps.length > 0 && (
+          <div className="row">
+            <span className="muted">Role theo app:</span>
+            {apps.map((a) => (
+              <span key={a.id} className="row">
+                {a.name}
+                <select
+                  aria-label={`Role mới ở ${a.name}`}
+                  value={draft.apps[a.id] ?? ''}
+                  onChange={(e) => setDraft({ ...draft, apps: { ...draft.apps, [a.id]: e.target.value } })}
+                >
+                  <RoleOptions />
+                </select>
+              </span>
+            ))}
+          </div>
+        )}
       </div>
       <ErrorNote error={error} />
       {users === null ? (
@@ -55,7 +103,7 @@ export function Users() {
       ) : (
         <table>
           <thead>
-            <tr><th>Email</th><th>Tên</th><th>Role</th><th>Trạng thái</th><th /></tr>
+            <tr><th>Email</th><th>Tên</th><th>Role mặc định</th><th>Global</th><th>App</th><th>Trạng thái</th><th /></tr>
           </thead>
           <tbody>
             {users.map((u) => {
@@ -63,13 +111,19 @@ export function Users() {
               const why = self ? 'Không tự khoá hay hạ quyền chính mình' : undefined;
               return (
                 <tr key={u.id} data-testid="user">
-                  <td>{u.email}</td>
+                  <td><Link to={`/settings/users/${u.id}`}>{u.email}</Link></td>
                   <td>{u.name || '—'}</td>
                   <td>
-                    <select aria-label={`Role của ${u.email}`} value={u.role} disabled={self} title={why} onChange={(e) => act(() => client.updateUser(u.id, { role: e.target.value }))}>
-                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
+                    <select aria-label={`Role của ${u.email}`} value={u.role ?? ''} disabled={self} title={why} onChange={(e) => act(() => client.updateUser(u.id, { role: e.target.value || null }))}>
+                      <RoleOptions />
                     </select>
                   </td>
+                  <td data-testid="user-global">{u.global ? <span className="badge kind">Global</span> : '—'}</td>
+                  <td>
+                    <span className="chips">
+                      {(u.apps ?? []).map((a) => <span key={a.app_id} className="badge" data-testid="user-app">{appName(apps, a.app_id)}: {a.role}</span>)}
+                    </span>
+                  </td>
                   <td>{u.disabled_at ? `khoá từ ${u.disabled_at.slice(0, 10)}` : 'hoạt động'}</td>
                   <td>
                     {u.disabled_at ? (
diff --git a/apps/admin/src/styles.css b/apps/admin/src/styles.css
index 8566ecc..7116697 100644
--- a/apps/admin/src/styles.css
+++ b/apps/admin/src/styles.css
@@ -153,6 +153,8 @@ dialog::backdrop { background: rgba(15, 23, 42, 0.4); }
 .badge.live { background: var(--ok-soft); color: var(--ok); }
 .badge.error { background: var(--danger-soft); color: var(--danger); }
 button.badge { cursor: pointer; }
+/* Settings › Users (spec admin-console-p4b §3): a person's app roles as chips. */
+.chips { display: inline-flex; gap: 4px; flex-wrap: wrap; }
 .findings { margin: var(--space-2) 0 0; padding-left: 18px; font-size: 12.5px; color: var(--fg-2); }
 .form label { display: flex; flex-direction: column; gap: 4px; margin: var(--space-2) 0; max-width: 480px; font-size: 13px; color: var(--fg-2); font-weight: 500; }
 .secrets { border-color: #fcd34d; background: var(--warn-soft); }
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
cd apps/admin && npx vitest run test/users-apps.test.jsx test/api.test.js test/grants.test.jsx 2>&1 | grep -E "Test Files|Tests  "
cd ../.. && npm test -w @ikf/admin 2>&1 | grep -E "Test Files|Tests  "
npm run build -w @ikf/admin 2>&1 | tail -3
```

Expected: `Tests  49 passed (49)`; toàn bộ admin `Test Files  28 passed (28)`, `Tests  242 passed (242)` (trước: 27 file, 228 test); build vite `✓ built`.

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/App.jsx apps/admin/src/api.js apps/admin/src/components/ErrorNote.jsx apps/admin/src/pages/Users.jsx apps/admin/src/pages/UserDetail.jsx apps/admin/src/styles.css apps/admin/test/api.test.js apps/admin/test/grants.test.jsx apps/admin/test/helpers.jsx apps/admin/test/users-apps.test.jsx
git commit -m "feat(admin): Settings › Users with global flag, default role and per-app roles
```

---

---

### Task 9: Demo + e2e đợt 4b + runbook/CLAUDE.md

**Files:**
- Create: `demo/test/admin-p4b-e2e.test.mjs`
- Modify: `demo/lib/admin.mjs`, `demo/README.md`, `docs/runbooks/admin-console.md`, `CLAUDE.md`
- Test: `demo/test/admin-p4b-e2e.test.mjs` (mới); sửa `demo/test/admin-p2-e2e.test.mjs` (bước 3: support giờ chỉ ở Starlyn, nên test cấp cho support app của funnel mua hàng — `demo` — qua `PUT /v1/admin/users/:id/apps/demo {role:'support'}` bằng token demo, rồi tra khách ở `/apps/demo/customers` thay vì `/customers`; phần còn lại của bước 3 giữ nguyên: support thấy khách, nút Cấp quyền khoá, ghi grant bằng cookie support → 403)

**Interfaces:**
- Consumes: migration 008 (`admin_users.role` nullable, `admin_users.global`, bảng `admin_user_apps (user_id, app_id, role, created_by)`); `ensureLocalAdmin` (Task 3, `services/core-api/src/admin/users.js`) đã đặt `global = true` cho `--admin-user` khi đăng nhập local; `PUT /v1/admin/users/:id/apps/:app_id` (Task 3, global); `createSession`/`SESSION_COOKIE` (`services/core-api/src/admin/sessions.js`); SPA Task 7/8: switcher `data-testid="app-switcher"`, `/` của người role NULL → `/apps/<app đầu>`, `AllApps` chuyển trang toàn cục về `/`, "Không tìm thấy app <id>.", `UploadBox` input `Chọn demo.html` disabled khi thiếu `editor` trong app, form Users (`placeholder email@ikameglobal.com`, select `Role mới` value `''` = Không, `Role mới ở <App>`, nút "Thêm", dòng `data-testid="user"` với chip `user-app` "Calmio (demo): viewer" và `user-global` "—"), trang Khách hàng trong app (`Tìm khách`, nút "Tìm", "Không có khách nào của app này khớp."). `ensureApps` (đợt 4a) tạo `starlyn`, `calmio`, `ewa` trước khi seed support.
- Produces:
  - `demo/lib/admin.mjs`: `export const DEMO_SUPPORT_APP = 'starlyn'`; `seedSupportUser(pool, email)` — `support@ikameglobal.com` với `role NULL`, `global false` (dòng có sẵn bị đưa về đúng dạng này) + `admin_user_apps (starlyn, support)` (upsert); idempotent; trả email.
  - e2e `demo/test/admin-p4b-e2e.test.mjs`: cổng `{edge: 8917, core: 8218, media: 8919, proxy: 8918, demo: 8921, admin: 8922}`, DB Postgres + ClickHouse `ikf_admin_p4b_test` (Postgres bị drop đầu mỗi lần chạy), build `demo/.build/admin-p4b/`, admin `e2e-p4b@ikameglobal.com`.
  - Docs: runbook `admin-console.md` §14 "Quyền theo app" (cấp/thu quyền qua CLI và Settings, token theo app, luật global cuối cùng) và sửa §5/§8 (admin đầu tiên `--global`, khôi phục bằng `global: true`); `CLAUDE.md` (`requireGrant` + resolvers `src/admin/resolve.js` + `src/admin/scope.js`, luật 404/403, thứ tự khoá `domains` theo host tăng dần → `funnels`; demo support chỉ Starlyn); `demo/README.md` (đoạn Đợt 4b).

- [ ] **Step 1: Viết test fail**

`demo/test/admin-p4b-e2e.test.mjs` (mới):

`demo/test/admin-p4b-e2e.test.mjs` (mới):

```js
// Admin console đợt 4b end to end (spec admin-console-p4b §5) on the real demo stack, in Chromium: the global demo
// admin sees the three apps, "Tất cả app" and Settings → adds a person with no default role who is viewer in Calmio
// (Settings › Users) → that person (a session made here, as admin-p2-e2e does for support) lands in Calmio, sees
// only Calmio, no menu across apps, Starlyn is "not found" and Upload is locked → the seeded support person looks a
// customer up in Starlyn and has no global Khách hàng. Own ports and databases; the Postgres one is dropped first,
// so the new person is created on every run.
import { existsSync } from 'node:fs';
import { Writable } from 'node:stream';
import { describe, it, expect, afterAll } from 'vitest';
import pg from 'pg';
import { chromium } from 'playwright';
import { createSession, SESSION_COOKIE } from '../../services/core-api/src/admin/sessions.js';
import { DEMO_SUPPORT_APP, DEMO_SUPPORT_USER } from '../lib/admin.mjs';
import { composeUp, ensureDocker } from '../lib/docker.mjs';
import { DEFAULT_FUNNELS, DEFAULT_FUNNELS_DIR, findFunnels } from '../lib/funnels.mjs';
import { PG, startStack } from '../lib/stack.mjs';

const FUNNELS_DIR = process.env.IKF_FUNNELS_DIR || DEFAULT_FUNNELS_DIR;
const FUNNELS = DEFAULT_FUNNELS; // ewa-books, calmio-calm-kids, moon-reading: one per sample app
const found = existsSync(FUNNELS_DIR) ? await findFunnels(FUNNELS_DIR) : null;
const skipReason = !found ? `funnels folder not found: ${FUNNELS_DIR}` : FUNNELS.filter((f) => !found.has(f)).map((f) => `${f} missing`).join(', ');
if (skipReason) console.warn(`admin p4b e2e skipped: ${skipReason}`);

const PORTS = { edge: 8917, core: 8218, media: 8919, proxy: 8918, demo: 8921, admin: 8922 };
const DB = 'ikf_admin_p4b_test';
const ADMIN_USER = 'e2e-p4b@ikameglobal.com';
const VIEWER = 'calmio-viewer@ikameglobal.com';
const CALMIO_FUNNEL = 'calmio-calm-kids';
const UNKNOWN_BUYER = 'nobody-p4b@demo.test';

let logs = '';
const logStream = new Writable({ write(chunk, _enc, done) { logs += chunk; done(); } });
let stack;
let pool;
let browser;
afterAll(async () => {
  await browser?.close();
  await pool?.end();
  await stack?.stop();
});

// A fresh database on every run: calmio-viewer does not exist yet.
async function dropDb() {
  await ensureDocker();
  await composeUp();
  const admin = new pg.Client(PG);
  await admin.connect();
  try {
    await admin.query(`DROP DATABASE IF EXISTS ${DB} WITH (FORCE)`);
  } finally {
    await admin.end();
  }
}

// A browser context signed in as `email` (local sign-in is only for --admin-user): a session made in the database.
async function signedInAs(email) {
  const { rows } = await pool.query('SELECT id FROM admin_users WHERE email = $1', [email]);
  const session = await createSession(pool, { userId: Number(rows[0].id) });
  const context = await browser.newContext();
  // domain + path (not url): Chromium refuses a __Host- cookie given by URL over http, even on localhost.
  await context.addCookies([{ name: SESSION_COOKIE, value: session.token, domain: 'localhost', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  return { context, page: await context.newPage(), session };
}

describe.skipIf(skipReason)('admin console đợt 4b e2e', () => {
  it('global admin adds a Calmio-only viewer; that viewer sees only Calmio, read-only; support works only in Starlyn', async () => {
    await dropDb();
    stack = await startStack({
      funnels: FUNNELS, ports: PORTS, lan: false, pgDatabase: DB, chDatabase: DB, logStream,
      adminUser: ADMIN_USER, adminBuildDir: new URL('../.build/admin-p4b/', import.meta.url).pathname,
    });
    pool = new pg.Pool({ ...PG, database: DB, max: 2 });

    // The demo's support person has no default role, only support in Starlyn.
    const person = async (email) => (await pool.query('SELECT role, global FROM admin_users WHERE email = $1', [email])).rows[0];
    expect(await person(DEMO_SUPPORT_USER)).toEqual({ role: null, global: false });
    const supportApps = await pool.query(
      'SELECT a.app_id, a.role FROM admin_user_apps a JOIN admin_users u ON u.id = a.user_id WHERE u.email = $1', [DEMO_SUPPORT_USER],
    );
    expect(supportApps.rows).toEqual([{ app_id: DEMO_SUPPORT_APP, role: 'support' }]);

    // 1. The global admin: "Tất cả app" + the three apps, and Settings in the menu.
    browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`${stack.adminUrl}/`);
    await page.getByRole('link', { name: 'Đăng nhập bằng Google' }).click();
    await page.getByRole('heading', { name: 'Dashboard' }).waitFor();
    // The local sign-in made the --admin-user a global admin.
    expect(await person(ADMIN_USER)).toEqual({ role: 'admin', global: true });
    const switcher = page.getByTestId('app-switcher');
    await expect.poll(() => switcher.locator('option').count()).toBe(4);
    expect((await switcher.locator('option').allTextContents()).sort()).toEqual(['Calmio (demo)', 'Ewa (demo)', 'Starlyn (demo)', 'Tất cả app']);

    // 2. Settings › Users: a person with role "Không" and viewer in Calmio.
    await page.getByRole('link', { name: 'Settings', exact: true }).click();
    await page.waitForURL(`${stack.adminUrl}/settings/users`);
    await page.getByRole('heading', { name: 'Users' }).waitFor();
    await page.getByPlaceholder('email@ikameglobal.com').fill(VIEWER);
    await page.getByLabel('Role mới', { exact: true }).selectOption('');
    await page.getByLabel('Role mới ở Calmio (demo)').selectOption('viewer');
    await page.getByRole('button', { name: 'Thêm', exact: true }).click();
    const row = page.getByTestId('user').filter({ hasText: VIEWER });
    await row.getByTestId('user-app').filter({ hasText: 'Calmio (demo): viewer' }).waitFor();
    expect(await row.getByTestId('user-global').textContent()).toBe('—');
    const viewerRow = (await pool.query('SELECT id, role, global FROM admin_users WHERE email = $1', [VIEWER])).rows[0];
    expect(viewerRow).toMatchObject({ role: null, global: false });
    expect((await pool.query('SELECT app_id, role FROM admin_user_apps WHERE user_id = $1', [viewerRow.id])).rows).toEqual([{ app_id: 'calmio', role: 'viewer' }]);

    // 3. The new person: / opens Calmio; the switcher has Calmio only; no menu across apps.
    const viewer = await signedInAs(VIEWER);
    const vp = viewer.page;
    await vp.goto(`${stack.adminUrl}/`);
    await vp.waitForURL(`${stack.adminUrl}/apps/calmio`);
    await vp.getByRole('heading', { name: 'Calmio (demo)' }).waitFor();
    const vSwitcher = vp.getByTestId('app-switcher');
    expect(await vSwitcher.locator('option').allTextContents()).toEqual(['Calmio (demo)']);
    for (const item of ['Dashboard', 'Settings', 'Billing', 'Apps', '← Tất cả app']) {
      expect(await vp.getByRole('link', { name: item, exact: true }).count(), item).toBe(0);
    }
    expect(await vp.locator('nav a[href="/customers"]').count()).toBe(0);
    // A page across apps sends them home, i.e. to Calmio.
    await vp.goto(`${stack.adminUrl}/settings/users`);
    await vp.waitForURL(`${stack.adminUrl}/apps/calmio`);

    // Starlyn is out of scope: "not found", in the console and from the API (same body as a missing app).
    await vp.goto(`${stack.adminUrl}/apps/starlyn`);
    await vp.getByText('Không tìm thấy app starlyn.').waitFor();
    const summary = await fetch(`http://localhost:${PORTS.core}/v1/apps/starlyn/summary`, { headers: { cookie: `${SESSION_COOKIE}=${viewer.session.token}` } });
    expect(summary.status).toBe(404);

    // A Calmio funnel (Tổng quan tab): a viewer cannot upload.
    await vp.goto(`${stack.adminUrl}/funnels/${CALMIO_FUNNEL}?tab=main`);
    await vp.getByRole('heading', { name: 'Upload' }).waitFor();
    expect(await vp.getByLabel('Chọn demo.html').isDisabled()).toBe(true);
    await viewer.context.close();

    // 4. Support (role NULL, support in Starlyn): / opens Starlyn; no global Khách hàng; the lookup in Starlyn works.
    const support = await signedInAs(DEMO_SUPPORT_USER);
    const sp = support.page;
    await sp.goto(`${stack.adminUrl}/`);
    await sp.waitForURL(`${stack.adminUrl}/apps/${DEMO_SUPPORT_APP}`);
    expect(await sp.locator('nav a[href="/customers"]').count()).toBe(0);
    await sp.getByRole('link', { name: 'Khách hàng', exact: true }).click();
    await sp.waitForURL(`${stack.adminUrl}/apps/${DEMO_SUPPORT_APP}/customers`);
    await sp.getByLabel('Tìm khách').fill(UNKNOWN_BUYER);
    const lookup = sp.waitForResponse((r) => r.url().endsWith('/v1/customers/lookup') && r.request().method() === 'POST');
    await sp.getByRole('button', { name: 'Tìm' }).click();
    expect((await lookup).status()).toBe(200);
    await sp.getByText('Không có khách nào của app này khớp.').waitFor();
    // The global /customers is not theirs: home, i.e. Starlyn.
    await sp.goto(`${stack.adminUrl}/customers`);
    await sp.waitForURL(`${stack.adminUrl}/apps/${DEMO_SUPPORT_APP}`);
    await support.context.close();

    for (const secret of [ADMIN_USER, VIEWER, DEMO_SUPPORT_USER, UNKNOWN_BUYER]) expect(logs).not.toContain(secret);
  });
});
```

`demo/test/admin-p2-e2e.test.mjs` (sửa, áp dụng đúng diff này — support được cấp app `demo` rồi tra khách trong app đó; ý nghĩa test giữ nguyên):

`demo/test/admin-p2-e2e.test.mjs` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/demo/test/admin-p2-e2e.test.mjs b/demo/test/admin-p2-e2e.test.mjs
index 15b6f83..fde5413 100644
--- a/demo/test/admin-p2-e2e.test.mjs
+++ b/demo/test/admin-p2-e2e.test.mjs
@@ -116,12 +116,14 @@ describe.skipIf(skipReason)('admin console phase 2 e2e', () => {
     expect(bought.expires).not.toBeNull();
     await until(() => stack.purchase.mailbox.list().some((m) => m.to === EMAIL), 10_000);
 
-    // 3. Support (a session for the seeded support person) looks the buyer up by email.
+    // 3. Support (a session for the seeded support person) looks the buyer up by email. Spec admin-console-p4b §5:
+    // the demo's support works only in Starlyn; an admin gives them the purchase funnel's app first (Settings › Users).
     const db = new pg.Client({ ...PG, database: DB });
     await db.connect();
     let support;
     try {
       const { rows } = await db.query('SELECT id FROM admin_users WHERE email = $1', [DEMO_SUPPORT_USER]);
+      expect((await core('PUT', `/v1/admin/users/${rows[0].id}/apps/${APP}`, { role: 'support' })).status).toBe(200);
       support = await createSession(db, { userId: Number(rows[0].id) });
     } finally {
       await db.end();
@@ -130,7 +132,7 @@ describe.skipIf(skipReason)('admin console phase 2 e2e', () => {
     // domain + path (not url): Chromium refuses a __Host- cookie given by URL over http, even on localhost.
     await cs.addCookies([{ name: SESSION_COOKIE, value: support.token, domain: 'localhost', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
     const csPage = await cs.newPage();
-    await csPage.goto(`${stack.adminUrl}/customers`);
+    await csPage.goto(`${stack.adminUrl}/apps/${APP}/customers`);
     await csPage.getByLabel('Tìm khách').fill(EMAIL);
     await csPage.getByRole('button', { name: 'Tìm' }).click();
     const ref = await csPage.getByRole('heading', { name: /^cus_/ }).textContent();
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock
export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock
npx vitest run --config demo/vitest.config.mjs test/admin-p4b-e2e.test.mjs 2>&1 | grep -E "Test Files|Tests  |→"
```

Expected: `Test Files  1 failed (1)`, `Tests  1 failed (1)`: `→ expected { role: 'support', global: false } to deeply equal { role: null, global: false }` — demo vẫn seed support với role mặc định `support`, chưa có dòng `admin_user_apps`. (`admin-p2-e2e` đã sửa vẫn pass với seed cũ: role mặc định `support` cũng đủ ở `/apps/demo/customers`.)

- [ ] **Step 3: Implement**

`demo/lib/admin.mjs` (sửa, áp dụng đúng diff này):

`demo/lib/admin.mjs` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/demo/lib/admin.mjs b/demo/lib/admin.mjs
index aace92a..9e41453 100644
--- a/demo/lib/admin.mjs
+++ b/demo/lib/admin.mjs
@@ -9,7 +9,7 @@ import { build } from 'vite';
 
 export const ADMIN_APP_DIR = new URL('../../apps/admin/', import.meta.url).pathname;
 // A CS person in the demo (spec admin-console-p2 §4): listed in Users; the e2e signs in as them with a session it
-// creates (local sign-in is only for --admin-user, always an admin).
+// creates (local sign-in is only for --admin-user, always a global admin — spec admin-console-p4b §5).
 export const DEMO_SUPPORT_USER = 'support@ikameglobal.com';
 export const ADMIN_BUILD_DIR = new URL('../.build/admin/', import.meta.url).pathname;
 
@@ -65,11 +65,21 @@ export async function startAdminServer({ dir, port = 8792, host = '127.0.0.1' })
   };
 }
 
-// Idempotent; never changes the role of an existing row (someone may have edited it in Users).
+// Spec admin-console-p4b §5: support works only in Starlyn — no default role (role NULL), support in starlyn.
+// Idempotent: an existing row (a database from before 4b, or edited in Users) is brought back to that shape.
+export const DEMO_SUPPORT_APP = 'starlyn';
+
 export async function seedSupportUser(pool, email = DEMO_SUPPORT_USER) {
-  await pool.query(
-    "INSERT INTO admin_users (email, name, role, created_by) VALUES ($1, 'Demo support', 'support', 'demo') ON CONFLICT (email) DO NOTHING",
+  const { rows } = await pool.query(
+    `INSERT INTO admin_users (email, name, role, created_by) VALUES ($1, 'Demo support', NULL, 'demo')
+     ON CONFLICT (email) DO UPDATE SET role = NULL, global = false
+     RETURNING id`,
     [email],
   );
+  await pool.query(
+    `INSERT INTO admin_user_apps (user_id, app_id, role, created_by) VALUES ($1, $2, 'support', 'demo')
+     ON CONFLICT (user_id, app_id) DO UPDATE SET role = 'support'`,
+    [rows[0].id, DEMO_SUPPORT_APP],
+  );
   return email;
 }
PATCH
```

`CLAUDE.md`, `demo/README.md`, `docs/runbooks/admin-console.md` (sửa, áp dụng đúng diff này):

`CLAUDE.md`, `demo/README.md`, `docs/runbooks/admin-console.md` (sửa, áp dụng đúng diff này):

````bash
git apply <<'PATCH'
diff --git a/CLAUDE.md b/CLAUDE.md
index 7cbcecc..8ab9b10 100644
--- a/CLAUDE.md
+++ b/CLAUDE.md
@@ -65,7 +65,9 @@ Workflows: `docker run --rm -v "$PWD:/repo" -w /repo rhysd/actionlint:latest`.
 - core-api error handler: `HttpError` → `{error, detail}`; Fastify 4xx → `{error:'bad_request'}`; never leak internals on 500.
 - Secrets are created empty by Terraform; values are set by hand (`aws secretsmanager put-secret-value`, `wrangler secret put`). No secret values in code or state where avoidable.
 - Every change made through the API (token or person) writes `audit_log` in the change's own transaction where it has one (`src/audit.js`); actor = token name or a person's email. Logs carry a person's email only as `email_hash`.
-- Routes declare a grant with `requireRole`: token roles `publisher`/`router`/`admin`, people `viewer`/`support`/`editor`/`admin` through the grants table `USER_GRANTS` in `src/auth.js` (same table as `apps/admin/src/roles.js` `GRANTS`, a test keeps them equal): editor satisfies `publisher`, `prices:read`, `apps:read`; support satisfies `support`; admin everything. A cookie write needs `X-Ikf-Csrf`.
+- Roles: token roles `publisher`/`router`/`admin`, people `viewer`/`support`/`editor`/`admin` through the grants table `USER_GRANTS` in `src/auth.js` (same table as `apps/admin/src/roles.js` `GRANTS`, a test keeps them equal): editor satisfies `publisher`, `prices:read`, `apps:read`; support satisfies `support`; admin everything. A cookie write needs `X-Ikf-Csrf`.
+- Per-app permissions (spec admin-console-p4b, migration 008): a person is `global` (admin in every app; alone creates apps, manages Users, Billing, tokens, domain assignment) or has a default role `admin_users.role` (NULL = none) plus rows `admin_user_apps (app_id, role)`; a token may be bound to one app (`api_tokens.app_id`, never role `admin`). Routes declare `requireGrant(pool, grant, {app, notFound})` from `src/auth.js` (`requireRole` is kept only for its own test): `app: 'global'` (default) = global only, `'any'` = the grant in some app (the handler filters its list to `req.scope`), or a resolver from `src/admin/resolve.js` (`appOfFunnel`, `appOfHost`, `appOfApp`, `appOfRoute`, `appOfGrant`, `appOfClaim`) that returns the resource's app (`undefined` = missing, the handler 404s; `null` = no app: global or default role only). The scope is `loadScope` in `src/admin/scope.js` (`hasGrant(scope, grant, appId)`, `isGlobalGrant`). Out of scope: a write → `403 forbidden`; a GET → `404` with **the same body as a missing resource** (`notFound`, e.g. `funnel_not_found`, `app_not_found`) when the caller cannot see the app at all, `403` when it sees the app but lacks the grant. A resolver reading `req.body` runs as a `preHandler` (with `app: 'any'` in `onRequest`). Always one global admin left (`409 last_global_admin`); nobody drops their own global flag or locks themselves (`409 cannot_lock_self`). Runbook `docs/runbooks/admin-console.md` §14.
+- Lock order between domain assignment, funnel app change, publish and pixel: **`domains` rows first (`FOR UPDATE`, host ascending), then `funnels`**; never take a domain lock after a funnel lock in the same transaction (`test/lock-order.test.js` runs the pairs on two connections).
 - The console never receives a buyer's `user_id` or email (customer lookup report v2); customers are named by `customer_ref` (`cus_…`) in URLs, audit and logs.
 - Dashboard analytics (`/v1/analytics/*`, grant `viewer`): sessions come from ClickHouse `funnel_hourly` (`clickhouse/002_funnel_hourly.sql`, a materialized view of `events` with `uniqExactState(sid)`: read with `uniqExactMerge(h.sessions)`, never a bare `sessions` after an `AS sessions` alias); money only from Postgres. Analytics answers carry aggregates only (no `sid`, no PII), are cached 30 s per core task, and a ClickHouse failure is `503 analytics_unavailable` (log: `kind` + status only). New `clickhouse/*.sql` files must stay idempotent; a materialized view needs `DEFINER = CURRENT_USER SQL SECURITY DEFINER` or the consumer's `ikf_writer` inserts fail. Runbook `docs/runbooks/analytics.md`.
 - The app is the management unit (spec admin-console-p4a, migration 007): a new funnel needs an app (`POST /v1/funnels` and the first upload of a new slug → `400 app_required`; changing it only through `PUT /v1/funnels/:slug {app_id}`, never back to null, never while live on a host of another app: `409 funnel_live_on_app_domain {routes}`); a domain belongs to one app or is shared (`domains.app_id` NULL); publish refuses another app's domain (`409 domain_app_mismatch`; rollback/delete/sync unchecked). List routes take `?app=<id>` (`none` = unassigned funnels / shared domains only); `audit(…, {app_id})` fills `audit_log.app_id`. In the SPA the app context is the URL: `/apps/:id/*` (Tổng quan, Funnels, Giá, Khách hàng, Domains, Webhooks, Audit, Cài đặt), everything else is global; no hidden state. Runbook `docs/runbooks/admin-console.md` §13.
@@ -77,4 +79,4 @@ Work follows spec → plan → TDD tasks (superpowers skills), one reviewed task
 
 ## Local demo
 
-`npm run demo` runs real funnels locally (Miniflare edge-router + event-consumer, core-api in-process, Postgres + ClickHouse in Docker, compose project `ikf-demo`), plus the admin console at `http://localhost:8792` (local admin from `--admin-user`, default `demo@ikameglobal.com`; publish to `demo.localhost`; a `support@ikameglobal.com` support user is seeded; prices and customers need the purchase flow: `npm run demo -- --purchase --host https://… --admin-user <email>`; the Dashboard reads the demo's ClickHouse, `npm run demo:events -- --seed` adds 3 days of sample data; three sample apps `starlyn` ← `moon-reading`, `calmio` ← `calmio-calm-kids`, `ewa` ← `ewa-books`, any other funnel in app `demo`, made through the API at every start; uploads carry `app_id`, demo hosts stay shared; `demo:purchase` uses the first funnel's app). Scripts: `npm run demo`, `npm run demo:events`, `npm run demo:purchase` (full purchase flow on a phone: fake Paddle/Turnstile/SES, quick tunnel + QR), `npm run demo:down` (`-- --reset` wipes data), `npm run demo:test` (never two at once: fixed ports). Options, ports and troubleshooting: `demo/README.md`. Code in `demo/` only; it must not change `services/`, `workers/` or `packages/`, except the sanctioned `PADDLE_JS_URL` → `__IKF.paddle.js` hook (edge-router emits it only for `https://` values, the SDK loads only `https:`, and `workers/edge-router/scripts/deploy-config.js` refuses the variable so it never reaches a deployed Worker). Fakes are injected only through `buildApp({deps})` from `demo/lib/purchase.mjs`; nothing in `services/` or `workers/` reads a demo flag.
+`npm run demo` runs real funnels locally (Miniflare edge-router + event-consumer, core-api in-process, Postgres + ClickHouse in Docker, compose project `ikf-demo`), plus the admin console at `http://localhost:8792` (local admin from `--admin-user`, default `demo@ikameglobal.com`; publish to `demo.localhost`; the local admin is global; a `support@ikameglobal.com` user is seeded with no default role and `support` in `starlyn` only; prices and customers need the purchase flow: `npm run demo -- --purchase --host https://… --admin-user <email>`; the Dashboard reads the demo's ClickHouse, `npm run demo:events -- --seed` adds 3 days of sample data; three sample apps `starlyn` ← `moon-reading`, `calmio` ← `calmio-calm-kids`, `ewa` ← `ewa-books`, any other funnel in app `demo`, made through the API at every start; uploads carry `app_id`, demo hosts stay shared; `demo:purchase` uses the first funnel's app). Scripts: `npm run demo`, `npm run demo:events`, `npm run demo:purchase` (full purchase flow on a phone: fake Paddle/Turnstile/SES, quick tunnel + QR), `npm run demo:down` (`-- --reset` wipes data), `npm run demo:test` (never two at once: fixed ports). Options, ports and troubleshooting: `demo/README.md`. Code in `demo/` only; it must not change `services/`, `workers/` or `packages/`, except the sanctioned `PADDLE_JS_URL` → `__IKF.paddle.js` hook (edge-router emits it only for `https://` values, the SDK loads only `https:`, and `workers/edge-router/scripts/deploy-config.js` refuses the variable so it never reaches a deployed Worker). Fakes are injected only through `buildApp({deps})` from `demo/lib/purchase.mjs`; nothing in `services/` or `workers/` reads a demo flag.
diff --git a/demo/README.md b/demo/README.md
index 69cef44..ede19b0 100644
--- a/demo/README.md
+++ b/demo/README.md
@@ -86,7 +86,7 @@ stays on `http://localhost:8792` → `http://localhost:8080`, and the tunnel's p
 Phase 2 screens (spec admin-console-p2): **Giá**, **Khách hàng** and **Billing** need the fake Paddle, so run the
 purchase flow with the console (`npm run demo -- --purchase --tunnel --admin-user demo@ikameglobal.com`). The fake
 catalog has three prices (`Weekly`, `Tarot reading 2027`, one archived `Weekly (old)`). A support person,
-`support@ikameglobal.com`, is seeded (Settings → Users); local sign-in is always the `--admin-user` (an admin).
+`support@ikameglobal.com`, is seeded (Settings → Users); local sign-in is always the `--admin-user` (a global admin).
 `npm run demo:test` includes `test/admin-p2-e2e.test.mjs`: prices from the catalog → purchase → support looks the
 buyer up → grant, revoke → resend the app-link email → rotate the user_id (ports 8857/8158/8859/8858/8861/8862,
 databases `ikf_admin_p2_test`).
@@ -110,6 +110,17 @@ switcher → app overview → funnel created in the app → upload → publish o
 not offered and refused (`domain_app_mismatch`) → a row per app (ports 8897/8198/8899/8898/8901/8902, database
 `ikf_admin_p4a_test`, dropped at the start of each run).
 
+Đợt 4b (spec admin-console-p4b): roles per app. The `--admin-user` is a **global** admin (every app, Settings ›
+Users, Billing); the demo token `ikf_demo_admin` stays global. `support@ikameglobal.com` is **Starlyn-only**: no
+default role, `support` in `starlyn` (every start puts it back in that shape), so it sees only Starlyn, has no
+Dashboard or global Khách hàng, and looks customers up under `/apps/starlyn/customers`; the purchase flow's buyers
+are in app `demo` (for `witch-power`): give support that app in Settings › Users (or `ikf admin grant
+support@ikameglobal.com demo support`) to look them up. `npm run demo:test` includes `test/admin-p4b-e2e.test.mjs`:
+the global admin adds `calmio-viewer@ikameglobal.com` (role Không, viewer in Calmio) in Settings › Users → that
+person sees only Calmio, no menu across apps, Starlyn "not found", Upload locked → support's lookup in Starlyn works
+and `/customers` is not in their menu (ports 8917/8218/8919/8918/8921/8922, database `ikf_admin_p4b_test`, dropped
+at the start of each run).
+
 ## Full purchase flow (`npm run demo:purchase`)
 
 Buy on a real funnel from your phone, open the "app", see **PRO**; refund from the control panel, see **FREE**.
diff --git a/docs/runbooks/admin-console.md b/docs/runbooks/admin-console.md
index ee42c8f..5c1b6ba 100644
--- a/docs/runbooks/admin-console.md
+++ b/docs/runbooks/admin-console.md
@@ -1,4 +1,4 @@
-# Runbook: admin console (đợt 1: nền + publish; đợt 2: billing + identity)
+# Runbook: admin console (đợt 1: nền + publish; đợt 2: billing + identity; đợt 4b: quyền theo app)
 
 Rollout per environment (staging first). The admin console is the SPA `apps/admin` on `https://admin.<zone>`
 (Worker `ikf-admin-<env>`, static assets) calling `https://api.<zone>/v1/*` with a session cookie for
@@ -47,10 +47,11 @@ only after this deploy: if Terraform's route creation failed because the script
 The API needs an admin to add people; the first one comes from the CLI with an admin token (`bootstrap-admin-token`):
 ```bash
 ikf login --api https://api.<zone> --token <admin token>
-ikf admin add <your email>@ikameglobal.com --role admin --name "<Tên>"
+ikf admin add <your email>@ikameglobal.com --role admin --global --name "<Tên>"
 ikf admin ls
 ```
-More people: in the console, Settings → Users (admin), or `ikf admin add <email> --role editor|support|viewer` (§11).
+More people: in the console, Settings → Users (global admin), or `ikf admin add <email> --role editor|support|viewer` (§11);
+someone who works in one app only: `--role none --app <id>:<role>` (§14).
 
 ## 6. Check (staging, then prod)
 
@@ -77,9 +78,10 @@ More people: in the console, Settings → Users (admin), or `ikf admin add <emai
 
 `ikf admin disable <email>` (or Settings → Users → Khoá): their sessions end at once (`admin_sessions` rows deleted).
 Their past actions stay in Audit. Revoke any API token they held (`api_tokens.revoked_at`).
-If every admin ends up disabled or demoted (the API only refuses self-lockout), recover with the bootstrap admin
-token (§5): `ikf admin add <email> --role admin` for a new person, or for an existing one
-`curl -X PUT -H "Authorization: Bearer <admin token>" -H 'content-type: application/json' -d '{"role":"admin","disabled":false}' https://api.<zone>/v1/admin/users/<id>` (`<id>` from `GET /v1/admin/users` with the same token).
+The API keeps one enabled global admin (`409 last_global_admin`, §14) and refuses self-lockout. If none is left anyway
+(rows edited by hand), recover with the bootstrap admin token (§5): `ikf admin add <email> --role admin --global` for a
+new person, or for an existing one `ikf admin global <email> on`, or
+`curl -X PUT -H "Authorization: Bearer <admin token>" -H 'content-type: application/json' -d '{"global":true,"disabled":false}' https://api.<zone>/v1/admin/users/<id>` (`<id>` from `GET /v1/admin/users` with the same token).
 
 ## 9. Domains
 
@@ -158,3 +160,41 @@ admin token (or the console: Funnels → lọc "Chưa gán", Domains → **Gán
    it with `ikf funnel set`).
 
 Rollback, route delete and `scripts/sync-domains.sh` are not checked against apps (emergency paths).
+
+## 14. Quyền theo app
+
+Migration `008_app_roles.sql` (spec `ifunnel/docs/specs/2026-10-13-admin-console-p4b-design.md`): each person is
+either **global** (admin in every app; alone creates apps, manages Users, Billing/reconcile, tokens, domain assignment,
+the audit across apps and unassigned funnels) or works per app: a **default role** for every app (`admin_users.role`,
+may be "Không" = none) plus a role of their own in some apps (`admin_user_apps`, wins over the default). On 008 every
+existing `admin` became global; other roles kept their role as the default role, so nobody lost access.
+
+Grant and revoke (a global admin's session or an admin token):
+
+| What | CLI | Console |
+|---|---|---|
+| New person, one app only | `ikf admin add <email> --role none --app calmio:editor [--app starlyn:viewer …]` | Settings › Users: Role mới **Không**, a role in "Role mới ở <App>", **Thêm** |
+| Role in one app (add or change) | `ikf admin grant <email> <app> viewer\|support\|editor\|admin` | Settings › Users › the email → "Role ở <App>" |
+| Remove that app's role | `ikf admin revoke <email> <app>` (back to the default role) | same select → **Không** |
+| Default role | set at `ikf admin add --role …` (`none` = only their apps); no CLI to change it later | Settings › Users, column Role mặc định (Không = only their apps) |
+| Global on / off | `ikf admin global <email> on\|off` | the person's page: **Global admin**; off asks to confirm |
+| Disable | `ikf admin disable <email>` (§8) | **Khoá** |
+
+Every change is in Audit (`admin.user.app_grant`, `admin.user.app_revoke`, `admin.user.update` with `global`), with
+the person's email as target, never a customer's.
+
+What a non-global person sees: the switcher lists only their apps; with no default role there is no Dashboard, no
+"Tất cả app" and no menu across apps (`/` opens their first app; none → "Bạn chưa được cấp app nào"). Another app's
+pages say "Không tìm thấy app <id>." and its API answers 404 with the same body as a missing app (its existence is not
+disclosed); a write out of scope is 403. Buttons follow the role in the funnel's app (a viewer's Upload and Publish
+are locked).
+
+Tokens per app: `ikf token create <name> --roles publisher[,router] --app <id>` (global admin; the token is printed
+once). It acts only on that app's funnels, versions and routes; it never carries `admin` (`400 invalid_roles`) and
+cannot touch unassigned funnels, shared domains, Users or Billing. A token without `--app` keeps the old reach (an
+`admin` token is global). Use one token per app for CI that publishes a single app's funnels.
+
+Last-global rule: at least one enabled global admin always remains. Turning off or disabling the last one
+→ `409 last_global_admin` ("Phải còn ít nhất một global admin"); nobody drops their own global flag, demotes or
+disables themselves (`409 cannot_lock_self`): ask another global admin. Before someone global leaves, make a
+successor global first (`ikf admin global <email> on`), then disable them (§8).
PATCH
````

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npx vitest run --config demo/vitest.config.mjs test/admin-p4b-e2e.test.mjs test/admin-p2-e2e.test.mjs 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Test Files  2 passed (2)`, `Tests  2 passed (2)`.

- [ ] **Step 5: Chạy toàn bộ demo (một mình, cổng cố định)**

Không chạy cùng lúc với một `npm run demo:test` khác; demo đang chạy ở 8080/8787/8790/8792 và container `ikf-demo-*` để nguyên.

```bash
npm run demo:test 2>&1 | grep -E "Test Files|Tests  |×"
lsof -nP -iTCP -sTCP:LISTEN | grep -E ':(8917|8218|8919|8918|8921|8922)\b' || printf 'no e2e port left\n'
```

Expected: `Test Files  24 passed (24)`, `Tests  133 passed (133)` (trước: 23 file, 132 test); không còn cổng e2e nào đang nghe. Nếu `purchase.test.mjs` "through the demo pages" fail với `read ECONNRESET`, chạy lại riêng file đó (`npx vitest run --config demo/vitest.config.mjs test/purchase.test.mjs` → `Tests  4 passed (4)`): lỗi chập chờn có từ trước, không liên quan task này.

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md demo/README.md demo/lib/admin.mjs demo/test/admin-p2-e2e.test.mjs demo/test/admin-p4b-e2e.test.mjs docs/runbooks/admin-console.md
git commit -m "feat(demo): scoped support user, global demo admin, e2e đợt 4b; docs
```

---

---

### Task 10: Chạy lại toàn nhánh

**Files:** — (chỉ kiểm tra)

- [ ] **Step 1: Toàn bộ workspace + demo**

```bash
npm test -w @ikf/paddle -w @ikf/event-schema -w @ikf/funnel-lint -w @ikf/sdk -w @ikf/cli -w @ikf/edge-router -w @ikf/event-consumer -w @ikf/core-api -w @ikf/route-match -w @ikf/admin 2>&1 | grep -E "Test Files|Tests  |bytes gzip"
npm run demo:test 2>&1 | grep -E "Test Files|Tests  "
git status --short
```

Expected: paddle 34, event-schema 145, funnel-lint 35, sdk 159 (bundle **8154** byte gzip, không đổi), cli **243** (24 file), edge-router 106, event-consumer 8 + 27, core-api **702** (74 file), route-match 35, admin **242** (28 file); demo **133** (24 file; `purchase.test.mjs` có thể chập chờn `read ECONNRESET` — chạy lại riêng file). Không còn tiến trình nào của mình nghe trên cổng e2e; demo của worktree khác vẫn chạy, không đụng; `git status` sạch.

- [ ] **Step 2: Review toàn nhánh** (superpowers:requesting-code-review) trước PR vào `feat/admin-console-p4a` (PR #10). PR body kết thúc bằng dòng attribution Claude Code.

---

## Theo sau (thủ công, ngoài phạm vi plan này)

1. Sau deploy 008: kiểm `ikf admin ls` — mọi admin cũ có cột global; cấp quyền theo app cho người mới bằng `ikf admin add … --role none --app <id>:<role>` hoặc Settings › Users.
2. Token CI hiện có (không app) chạy như cũ; token mới cho từng team: `ikf token create <name> --roles publisher --app <id>`.
3. Ngoài phạm vi spec (mời qua email, SSO khác, quyền theo funnel, tách tenant, xoá app) — không có task.

---

## Self-Review

**Spec coverage:**

| Spec | Task |
|---|---|
| Điều kiện xong: người chỉ có quyền ở một app chỉ thấy app đó; admin cũ thành global; e2e đợt 4b | 1, 4, 5, 7, 9 (`admin-p4b-e2e`) |
| Quyết định: global ⇒ admin mọi app; role mặc định + dòng app; token theo app | 1 (008, `loadScope`), 3 |
| §1 migration 008 (global, role nullable, `admin_user_apps`, `api_tokens.app_id`, backfill) | 1 |
| §2 phạm vi người gọi, middleware `requireGrant`, resolvers, `/v1/auth/me` | 1, 2 (+B4, B7, B8) |
| §2 bảng route | 4 (apps, funnels, versions, prices, analytics), 5 (domains, routes, customers, audit, billing, users/tokens) (+B6, B9) |
| §2 Users và token (`last_global_admin`, tự khoá, token không admin) | 3 (+B5) |
| §2 audit | 3, 5 (`app_id` như 4a, không đổi) |
| §5 thứ tự khoá (mục hoãn từ 4a) | 5 `lock-order.test.js` (+B10) |
| §3 SPA quyền theo app | 7 (+B11, B12) |
| §3 Settings › Users | 8 (+B13) |
| §4 CLI | 6 |
| §5 demo, e2e, runbook, CLAUDE.md | 9 |
| §5 ngoài phạm vi | không task (đúng); "Theo sau" 3 |

**Placeholder:** không có "TBD"/"tương tự Task N". Mọi khối code và patch được sinh từ commit của cây scratch đã chạy test (Node 26, colima, 2026-10-13). Khi thực thi, controller so khớp tree sau mỗi task với commit scratch tương ứng (`git diff --stat <scratch-commit> HEAD` chỉ được khác `package-lock.json`/artefact).

**Nhất quán tên / kiểu:**
- `loadScope(db, actor)` → `{global, roleIn, appIds(), grantsIn, globalGrants, defaultGrants}` (Task 1) ← `requireGrant`/`hasGrant` (Task 2) ← mọi route Task 3–5.
- `requireGrant(pool, grant|grants, {app: 'global'|'any'|resolver, notFound})` (Task 2) — resolver `appOfFunnel/appOfHost/appOfGrant/appOfApp` (Task 2) dùng ở Task 4–5.
- `GET /v1/auth/me` `{email, name, role, global, csrf, apps:[{id,name,role}]}` (Task 2) = `me` ở SPA (Task 7, 8).
- Lỗi `last_global_admin`, `cannot_lock_self`, `invalid_roles`, `app_required`, `not_found`, `forbidden` — cùng tên ở server (Task 2–5), CLI (Task 6), SPA (Task 7–8), runbook (Task 9).
- Selector e2e (Task 9) = Task 7–8 (`Role mới`, `Role ở <App>`, "Global admin", "Không tìm thấy app <id>.").

**Review Focus đã ghim:** 1 → Task 1 (backfill 008), Task 4–5 (role mặc định); 2 → Task 4, 5 (bảng route 404/403); 3 → Task 3, Task 8; 4 → Task 1, Task 4 (token không app); 5 → Task 5 `lock-order.test.js`.

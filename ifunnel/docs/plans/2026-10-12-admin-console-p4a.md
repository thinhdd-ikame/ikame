# iKame Funnel Platform — Admin Console đợt 4a (App là đơn vị quản lý) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Người vận hành mở console, chọn một **app** (Starlyn, ChatChi, CoinIdentify…) và thấy trọn bộ của app đó — funnels, số liệu, giá, khách hàng, domain, webhook — mà không phải lọc bằng mắt trong các bảng chung; funnel mới bắt buộc thuộc một app; funnel của app này không publish được lên domain của app khác; funnel cũ chưa gán nằm trong nhóm "Chưa gán" để gán dần.

**Architecture:**
- **Postgres** migration `007_apps_container.sql`: `domains.app_id` (nullable FK, `NULL` = dùng chung), `audit_log.app_id` (nullable, không FK, backfill best-effort), bỏ cột `funnels.app` (TEXT từ 001, không dùng). `funnels.app_id` giữ nullable đợt này.
- **core-api**: `POST /v1/funnels` và upload lần đầu bắt buộc `app_id` (`400 app_required`, `409 funnel_app_mismatch`), `PUT /v1/funnels/:slug` không nhận `null`; `PUT /v1/domains/:host {status?, app_id?}` (`409 domain_has_foreign_routes`), publish kiểm `409 domain_app_mismatch`; `GET /v1/{funnels,domains,audit}?app=` (`none` = chưa gán); `GET /v1/apps` có 3 count, mới `GET /v1/apps/:id`, `/summary`, `/plans`; `POST /v1/customers/lookup` nhận `app_id`; `GET /v1/analytics/overview?app=` lọc slug ở cả ClickHouse lẫn Postgres, mỗi dòng có `app_id`; `audit(db, actor, action, target, details, {app_id})` điền cột `app_id` cho mọi action thuộc app.
- **CLI**: `funnel create/ls`, `publish --app`, `domain ls/set`, `app show`, `app ls` có count, `stats --app`.
- **SPA `apps/admin`**: ngữ cảnh app = URL `/apps/:id/*` (`useAppContext`), ô chọn app trên sidebar, menu theo ngữ cảnh; Dashboard toàn cục theo app (+ "Chưa gán"), Tổng quan app, Funnels/Giá/Khách hàng/Domains/Webhooks/Audit/Cài đặt trong app; tạo funnel bắt buộc app; PublishDialog chỉ domain hợp lệ; breadcrumb funnel. Không thêm dependency.
- **Demo**: 3 app mẫu (`starlyn`, `calmio`, `ewa`), upload kèm app, host demo dùng chung, e2e đợt 4a; runbook gán app sau 007.

**Tech Stack:** Node.js 22 trên CI (local Node 26) · JavaScript ESM · npm workspaces · Fastify 5 · `pg` 8 · ClickHouse 25.8 (HTTP) · Vitest ~3.2 · happy-dom 20 · `@testcontainers/postgresql` + `@testcontainers/clickhouse` 11 · React 19 · react-router 7 · Vite 7 · `@testing-library/react` 16 · Playwright 1.63. Không dependency mới.

**Spec:** `ifunnel/docs/specs/2026-10-12-admin-console-p4a-design.md`. Bối cảnh: `ifunnel/docs/specs/2026-10-11-admin-console-p1-design.md` (API funnels/domains/routes/audit), `…-p2-design.md` (apps, customers, grants), `…-p3-design.md` + plan `ifunnel/docs/plans/2026-10-12-admin-console-p3.md` (analytics, Dashboard, quy ước SPA, e2e cổng riêng).

**Repo / nhánh / worktree:** repo `/Users/daothinh/ikf-platform`. Nhánh mới **`feat/admin-console-p4a`** cắt từ **`feat/admin-console-ui`** — đã kiểm với tip **`e1e4f11`** (`fix(demo): admin e2e builds the console into its own dir, not the live demo's`). Code nằm trong worktree **`/Users/daothinh/ikf-platform-admin-p4a`** (controller đã tạo sẵn, `npm install` xong; Task 1 Step 1 chỉ kiểm). PR sau này vào base `feat/admin-console-ui` (PR #9). **Không bao giờ** đụng working tree `/Users/daothinh/ikf-platform-*` khác (`-admin`, `-admin-p2`, `-admin-p3` đang chạy demo, `-demo`, `-demo-purchase`, `-entitlement`, `-billing`); `~/ikame/funnel/funnel-development` chỉ đọc. Mọi lệnh trong plan chạy từ gốc worktree mới. Quy ước repo: `CLAUDE.md` ở gốc repo.

**Môi trường chạy test (local):**
```bash
cd /Users/daothinh/ikf-platform-admin-p4a
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock          # Docker qua colima (colima start)
export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock     # Testcontainers (Postgres, ClickHouse)
export TF_PLUGIN_CACHE_DIR=$HOME/.terraform.d/plugin-cache            # Terraform (chỉ mock provider; không bao giờ apply)
```
Demo (Task 12, 13) cần thêm: `docker compose` (README demo), Chromium của Playwright, funnel `ewa-books`, `moon-reading`, `calmio-calm-kids` trong `~/ikame/funnel/funnel-development` (e2e tự skip nếu thiếu). **`npm run demo:test` không bao giờ chạy song song với một demo test khác** (cổng cố định); một demo đang chạy từ worktree `-admin-p3` trên cổng 8080/8787/8790/8792 — không đụng, không kill. Test core-api dùng ClickHouse chỉ ở `test/analytics-app-http.test.js` (mới) và các file analytics cũ.

Số test ghi ở mỗi task là số **thật** khi chạy toàn bộ code của plan này trên bản sao `feat/admin-console-ui@e1e4f11` (Node 26, colima, 2026-10-12); mỗi khối code / patch trong plan được sinh trực tiếp từ commit của cây đã chạy test đó (trùng từng byte), bước "FAIL" được chạy thật trên cây chưa có phần implement của task. Mốc ban đầu tại `e1e4f11`: paddle **34** (2 file), event-schema **145**, funnel-lint **35** (3), sdk **159** (11, bundle **8154** byte gzip), cli **159** (15), edge-router **106** (7), event-consumer **8 + 27**, core-api **554** (59), route-match **35**, admin **133** (15); `npm run demo:test` **124** (22).

Nếu lúc thực thi `feat/admin-console-ui` đã đi xa hơn `e1e4f11`: chạy lại mốc (Task 1 Step 2); số khác thì ghi lại và chỉnh các con số "Expected" theo chênh lệch; patch không áp được thì đọc phần code tương ứng và áp tay đúng nội dung, không sửa gì ngoài phạm vi task.

## Điều chỉnh so với spec (phát hiện khi đọc code tại `e1e4f11` và chạy thử, 2026-10-12)

| # | Spec | Plan làm | Lý do |
|---|---|---|---|
| A1 | §1 "backfill … idempotent" | DDL của 007 đúng như spec (không `IF NOT EXISTS`, vì `migrate` chạy mỗi file đúng một lần theo `schema_migrations`); 3 câu `UPDATE` backfill đều có `WHERE app_id IS NULL`; một câu gộp `target = 'funnel:'||slug OR details->>'slug' = slug` chỉ với funnel có `app_id IS NOT NULL`. Test Task 1 tách các `UPDATE` ra khỏi file (bỏ comment, tách theo `;`) và chạy lại để chứng minh không đổi gì — nên comment trong 007 không được chứa `;` | Idempotent ở mức câu lệnh (chạy tay lại được), không ở mức file; slug không còn / funnel chưa gán → `app_id` giữ NULL |
| A2 | §2 Audit: mọi item trả thêm `app_id`; §1 index `audit_log_by_app` | Hai test cũ ngoài danh sách sửa: `test/catalog.test.js` (`toEqual` item audit thêm `app_id: null`), `test/admin-schema.test.js` (danh sách index của `audit_log` thêm `audit_log_by_app`, kiểm theo vị trí dời `rows[1]` → `rows[2]`) | Hệ quả trực tiếp của spec; nghĩa test không đổi |
| A3 | §2 Audit: `entitlement.grant|revoke` điền `app_id` (Task 4) | Dòng `entitlement.grant` cũ (trước 007) có `details.app_id` nhưng backfill theo spec không dùng — giữ NULL | Spec chỉ liệt kê 3 nguồn backfill; thêm sau nếu cần |
| A4 | §2 "`POST /v1/funnels` body `{slug, app_id}` (`app_id` bắt buộc) … thiếu → `400 app_required`"; "`PUT … {app_id: null}` → `400 app_required`" | Kiểm trong handler, không bằng schema: `app_id` optional trong schema, handler trả `400 app_required` khi thiếu (create) hoặc `null` (PUT, kèm `detail: {funnel}`) | Error handler của repo đổi mọi lỗi schema thành `bad_request`; Ajv coerce `null` → `""` |
| A5 | §2 "Funnel đã có: bỏ qua `app_id` nếu trùng, khác → `409 funnel_app_mismatch`" | **Ruling:** funnel đã có mà `app_id IS NULL` + upload kèm `app_id` → gán app ngay trong transaction upload (`assignFunnelApp`: UPDATE + queue recompute + audit `funnel.app` có cột `app_id`), lint thấy kind của app mới; chỉ funnel đã có app **khác** mới 409 `{app_id: <hiện tại>}` | Funnel cũ được gán bằng chính lần `ikf publish --app` đầu tiên, không cần PUT riêng |
| A6 | §2 luật upload | Luật nằm trong một hàm `checkUploadApp` (export), handler gọi trước lint, `publishVersion` gọi lại dưới row lock; `publishVersion` không còn `INSERT … ON CONFLICT DO NOTHING` | Một nơi giữ luật, chống race giữa kiểm và ghi |
| A7 | Spec §4 test "lint still sees the app kind" | `no_get_app_hook` là **warning**, không 422: test kiểm warning được lưu trong lint report của version đầu | Luật lint hiện có |
| A8 | §2 `GET /v1/funnels?app=<id>` | App không tồn tại → danh sách rỗng (không 404) | Route liệt kê; 404 chỉ cho `GET /v1/apps/:id`, summary, plans, overview, lookup |
| A9 | Test cũ ngoài danh sách (Task 2) | `test/funnel-app.test.js` "sets and clears the app": PUT null → 400 (spec #5); `test/catalog.test.js` funnel tạo ra có `app_id: 'starlyn'`; fixture `seedVersions` (`test/helpers/app.js`) tạo funnel trước khi publish; `audit`, `plan-keys`, `upload-lint`, `sessions`, `publish` tạo funnel/app trước | Hệ quả của spec #1; nghĩa test không đổi |
| A10 | §2 `PUT /v1/domains/:host {status?, app_id?}` (≥ 1 field) | Luôn trả `200 {host, status, app_id}` kể cả khi tạo host mới (như trước); body không có `status` lẫn `app_id` (kể cả `{foo: 1}`) → handler trả `400 bad_request`; app không tồn tại → `404 app_not_found` kiểm **trước** khi ghi (không có dòng domain/audit nào) | Fastify bỏ khoá lạ trước khi kiểm schema nên schema không bắt được body rỗng |
| A11 | §2 publish/rollback/delete | `inHostTx` đưa dòng `domains` đã khoá (`{status, app_id}`) cho bước publish/rollback/delete; `setDomain` khoá cùng dòng → kiểm route ngoại lai không đua với publish | Cùng một khoá hàng |
| A12 | Test cũ ngoài danh sách (Task 3) | `test/audit.test.js` và `test/catalog.test.js`: details `domain.sync` và dòng `GET /v1/domains` thêm `app_id: null` | Hệ quả spec §2; nghĩa test không đổi |
| A13 | §2 `?app=none` = chưa gán | **Ruling (Task 4):** `POST /v1/apps` từ chối id `none` → `400 invalid_app_id` | Tránh trùng nghĩa với bộ lọc |
| A14 | §2 `GET /v1/apps/:id/plans` `{slug, plan, price_id, discount_id, entitlement_key, unmapped}` | Thêm `in_html` (plan có trong `plan_keys` bản mới nhất) để SPA hiện "Không dùng"; plan chưa có giá → `price_id`/`discount_id`/`entitlement_key` = `null` | SPA cần phân biệt hai badge |
| A15 | §2 summary "funnel và domain của app (không gồm domain dùng chung)" | `appSummary` lọc bỏ `app_id IS NULL` từ kết quả `listDomains({app})`; `live_routes_count` đếm route của funnel thuộc app trên **mọi** host, kể cả host dùng chung | Không thêm option mới cho `listDomains` |
| A16 | §2 lookup: "`claim` chỉ khi checkout thuộc app, khác → `null`" | Có `app_id`: trả claim **mới nhất thuộc app đó** (không phải claim mới nhất toàn cục rồi ẩn); subscription không gắn funnel bị bỏ khi lọc theo app | Khách có claim ở nhiều app vẫn thấy đúng claim của app đang xem |
| A17 | §2 grants trong app | `listEntitlements(db, customerId, appId?)` có tham số app nhưng route grant/revoke vẫn trả quyền của **mọi** app; SPA trong app (Task 11) lọc client-side theo `app_id` hoặc lookup lại với `app_id` | Giữ response route grant như đợt 2 |
| A18 | §2 Analytics "`funnel IN ({slugs:Array(String)})`" | `funnel IN {slugs:Array(String)}` (không ngoặc) — đã chạy thật trên ClickHouse 25.8 | Cú pháp tham số mảng của ClickHouse |
| A19 | §2 `GET /v1/analytics/overview?app=` "app không tồn tại → 404" | `404 {error: 'app_not_found', detail: {app_id}}` (cùng dạng detail với customers/domains); `?app=none` cũng 404 (id dành riêng, không bao giờ tồn tại); `funnelSlugs(pool, {app})` trả `[{slug, app_id}]` nên `test/analytics-revenue.test.js` và fake trong `test/analytics-service.test.js` đổi theo (nghĩa không đổi) | Overview nhóm "Chưa gán" phía client, không có route riêng |
| A20 | §2 CLI | `ikf funnel set --no-app` giữ cờ (test cũ kiểm nó gửi `{app_id: null}`), server trả 400 → CLI in "Funnel phải thuộc một app, không gỡ được (đổi app: ikf funnel set <slug> --app <id>)"; bỏ cờ ở đợt 4b. `stats --app` không nhận `--by` (overview luôn theo ngày; exit 2). Thông điệp "Funnel mới cần --app <id>" chỉ cho `publish` (`formatApiError(err, command)`), vì `PUT /v1/funnels/:slug` cũng trả `app_required`. `domain set` kiểm host như `route set` (phải có dấu chấm) | Giữ nghĩa test cũ; tránh lời khuyên sai ngữ cảnh |
| A21 | §3 SPA client/ngữ cảnh | `useAppContext()` trả thêm `loading`, `error` (trang Apps dùng chung danh sách); `APP_NAV` item có `to(id)`; Tổng quan app chỉ gọi `getAppSummary` (đã chứa app) + `getOverview({app})`; `app_not_found` từ một trong hai → "Không tìm thấy app <id>." (không hiện thẻ analytics tắt). `test/funnels.test.jsx` sửa tối thiểu: fake `createFunnel({slug})` theo chữ ký mới; test Settings tìm select `App` trong card (switcher cũng có `aria-label="App"`) | Hệ quả của chữ ký client và switcher; nghĩa test không đổi |
| A22 | §3 "dialog Tạo funnel app điền sẵn và khoá" | Giữ hàng tạo inline sẵn có (`data-testid="create-funnel"`, nút `New funnel`); `?new=1` focus ô slug; trong app, app hiện dạng chữ (khoá); toàn cục có select App bắt buộc (nút khoá đến khi chọn) | Không có dialog từ trước; nghĩa như spec |
| A23 | §3 Dashboard toàn cục | Bảng theo app thay bảng funnel ở `/`; test cũ "new range"/"request token"/"sort" trong `dashboard.test.jsx` đọc tên app thay vì slug (cùng ý nghĩa); `OverviewTable.jsx` export thêm `COUNT_SORTS`, `COUNT_HEADERS`, `Money`, `sumMoney`, `useSorted`, `SortTh` để Dashboard và Tổng quan app dùng chung | Bảng funnel đã chuyển vào `/apps/:id` |
| A24 | §3 Domains: "Row `data-testid="domain-row"`" | Giữ `data-testid="domain"` sẵn có (test cũ trong `pages.test.jsx` dựa vào); cột App ở `/domains` đặt sau cột Routes để 4 ô đầu không đổi; test mới ở `test/domains.test.jsx` (file mới, không có sẵn như brief ghi); select Gán app lưu ngay khi đổi (không confirm); role khác admin **ẩn** control (không greyed như `RoleButton`); thông điệp 409 hiện tên app (fallback id); `/apps/:id/domains` với app không tồn tại chỉ hiện lỗi `listDomains` qua `ErrorNote` | Giữ test cũ; viewer "không thấy control" đúng chữ spec |
| A25 | §3 FunnelSettings | Option đầu là app hiện tại (hoặc placeholder disabled "Chọn app" khi chưa gán), rồi các app khác; "Lưu app" khoá đến khi chọn; `publish.test.jsx` fixture funnel có `app_id: 'starlyn'` và kiểm `listDomains({app: 'starlyn'})`; `funnels.test.jsx` option đầu "— không gắn —" → "Chọn app" | Spec #5 không cho gỡ |
| A26 | §3 Khách hàng / Audit trong app | Chi tiết khách trong app gửi `app_id` ở mọi lần tải (kể cả sau grant/revoke/rotate) và không dùng response của route grant để hiển thị (route trả quyền mọi app); tiêu đề trong app lấy tên từ `useAppContext()` (app lạ → hiện id); link "Xem audit" → `/apps/:id/audit?target=customer:<ref>`; link khách giữ `/apps/:id/customers/<ref>`; test Audit cũ ở `pages.test.jsx` không đổi (`listAudit` chỉ thêm `app` khi có) | Giữ ngữ cảnh app trong URL |
| A27 | §4 Demo: "3 app mẫu … host demo dùng chung; `demo:purchase` dùng app của `chosen[0]`" | `DEMO_APPS` map 3 funnel mặc định; funnel khác (vd `witch-power` của `demo:purchase`) → app `demo` (scheme `demo://`), tạo khi cần; `/v1/apps` bật ở **mọi** mode demo (demo luôn tiêm một store webhook-secret in-memory qua `buildApp({deps})`; ngoài purchase mode URL app là `https://demo.test` vì core bắt https); `seedPurchase` chỉ map giá và trả app; bỏ `DEMO_APP`; `uploadVersion` của demo gặp `409 funnel_app_mismatch` (DB cũ đã gán funnel sang app khác) thì `PUT` về app đúng rồi upload lại | Switcher phải có app ở `npm run demo` thường; DB demo cũ vẫn chạy |
| A28 | §4 e2e "publish lên `localhost` (dùng chung)" | e2e publish lên `demo.localhost` (cũng dùng chung) vì `hostParams` của core cần dấu chấm — `PUT /v1/routes/localhost` trả 400 (hạn chế có sẵn của demo: `localhost` được chèn bằng SQL); e2e tự drop DB `ikf_admin_p4a_test` đầu mỗi lần chạy; cổng **8897/8198/8899/8898/8901/8902** | Giới hạn sẵn có; e2e chạy lại được |
| A29 | Test demo cũ đổi (Task 12) | `purchase.test` scheme `demo`; `admin-p2-e2e` app cấp quyền `demo`; `admin-p3-e2e` kiểm dòng funnel ở Tổng quan app (chọn trong switcher) vì `/` không còn `overview-row`; `server.test` thêm 1 assert app giả hỏi với app `demo` | Hệ quả của A23/A27; nghĩa test không đổi |
| A30 | DB demo cũ | DB `ikf_demo_test` (chỉ test) cũ hơn cột `apps.handoff` → `POST /v1/apps` 500; đã drop một lần, test tự tạo lại. DB dev quá cũ: `npm run demo:down -- --reset` | Không đụng DB `ikf` của demo đang chạy |

## Global Constraints

- Code trong repo `ikf-platform`, nhánh `feat/admin-console-p4a` (từ `feat/admin-console-ui@e1e4f11`), worktree `/Users/daothinh/ikf-platform-admin-p4a`, PR base `feat/admin-console-ui`. JavaScript (không TypeScript). HTML funnel **không sửa**.
- **Không dependency mới** ở bất kỳ workspace nào; SPA chỉ `react`, `react-dom`, `react-router`, `qrcode`, `@ikf/funnel-lint`, `@ikf/route-match`; một file CSS `apps/admin/src/styles.css`; icon là path Lucide inline trong `src/icons.jsx`.
- **Log không email, không `user_id`, không `err.message`**, không SQL có tham số. **Audit không `user_id`, không secret, không email khách.** Lookup khách và analytics không bao giờ trả `user_id`, email hay `sid`.
- App với funnel **bắt buộc** cho funnel mới (`POST /v1/funnels`, upload slug mới): thiếu → `400 app_required`; không gỡ về `NULL` (`PUT` null → `400 app_required`); upload kèm `app_id` khác app hiện tại → `409 funnel_app_mismatch`. Funnel cũ `app_id NULL` vẫn upload/publish được lên domain dùng chung.
- Domain thuộc đúng một app hoặc dùng chung (`NULL`). Publish: `domains.app_id IS NULL` hoặc `= funnels.app_id`, khác (kể cả funnel chưa gán) → `409 domain_app_mismatch {host_app, funnel_app}`; rollback/delete/sync không kiểm. Gán app cho domain đang có route live của funnel thuộc app khác **hoặc chưa gán** → `409 domain_has_foreign_routes {routes}`.
- Tham số `app` trên route liệt kê: pattern `^(none|[a-z0-9][a-z0-9-]{1,30})$` (`none` = chưa gán) cho `funnels`/`domains`; `^[a-z0-9][a-z0-9-]{1,30}$` cho `audit`, `analytics/overview`, `customers/lookup.app_id`; app không tồn tại → `404 app_not_found` ở `analytics/overview`, `customers/lookup`, `GET /v1/apps/:id`, `/summary`, `/plans`; route liệt kê `funnels`/`domains`/`audit` trả danh sách rỗng (hoặc chỉ domain dùng chung) — A8, ruling Task 1/3.
- Số liệu theo app: **không đổi schema ClickHouse**; lọc `funnel IN (slug của app)`; mỗi dòng overview có `app_id`; cache key có `app`.
- Quyền: route mới `GET /v1/apps/:id`, `/summary` = `viewer`; `/plans` = `prices:read`; `PUT /v1/domains/:host` = admin; lookup = `support`; không đổi bảng grants.
- SPA: ngữ cảnh app **chỉ** từ URL `/apps/:id/*`; không localStorage/state ẩn; deep link cũ (`/funnels/:slug`, `/apps/:id`, `/customers/:ref`) giữ nguyên; copy tiếng Việt.
- Demo: không sửa `services/` từ `demo/`; `npm run demo:test` chạy một mình, tuần tự; e2e đợt này dùng cổng và DB riêng (ghi ở Task 12), build SPA `demo/.build/admin-p4a/`. Không bao giờ `terraform apply`.
- Bundle SDK không đổi (**8154** byte gzip).
- **Test cũ giữ nguyên ý nghĩa**; chỉ được sửa đúng các chỗ ghi ở từng task (fixture thêm app / `app_id`, đường dẫn trang Apps tách, danh sách menu, hình dạng dòng có thêm `app_id`/count).

## Review Focus

1. **`ikf publish` một slug đã có, không `--app`** (luồng content team hiện nay): mong upload vẫn nhận như cũ, không `app_required`. Test: Task 2 `an existing funnel keeps accepting uploads without app_id`; Task 7 `publish-app.test.js` (không `--app` → không gửi `app_id`).
2. **Funnel cũ chưa gán app publish lên domain dùng chung** vẫn được, lên domain của app bị chặn với `funnel_app: null`: Task 3 ma trận publish (`shared + unassigned → 200`, `app host + unassigned → 409`); Task 10 PublishDialog chỉ domain dùng chung + ghi chú.
3. **Gán domain vào app khi domain đang có route live của funnel chưa gán**: mong bị chặn (route chưa gán cũng là "ngoại lai") và danh sách route trả về để biết gỡ gì: Task 3 `domain_has_foreign_routes` liệt kê cả route của funnel `app_id NULL`; Task 10 hiện danh sách.
4. **App có funnel có tiền nhưng không có sự kiện (hoặc ngược lại) trong khoảng**: mong dòng vẫn xuất hiện trong overview theo app và tổng theo app = tổng các dòng: Task 6 `a funnel with money but no events still appears…`; Task 9 `groupByApp` (USD trước, "Chưa gán" cuối).
5. **Khách có quyền ở app A nhưng chỉ có checkout ở app B**: lookup theo B hiện checkout, không hiện quyền của A; theo app C không có gì → khách bị bỏ khỏi kết quả; không `app_id` → đủ: Task 5 `customer-report-app.test.js`.
6. **Backfill audit idempotent và an toàn với slug đã xoá**: `funnel:<slug>` không còn trong `funnels` → `app_id` giữ NULL, không lỗi; chạy 007 hai lần không đổi gì: Task 1.

## File Structure (repo `ikf-platform`, phần mới/sửa)

```
ikf-platform/
├── CLAUDE.md                                            # SỬA: app là đơn vị quản lý (?app=, /apps/:id/*, demo 3 app)
├── docs/runbooks/admin-console.md                       # SỬA: mục "Sau khi lên 007: gán funnel và domain vào app"
├── services/core-api/
│   ├── migrations/007_apps_container.sql                # MỚI: domains.app_id, audit_log.app_id (+ backfill), DROP funnels.app
│   ├── src/audit.js                                     # SỬA: audit(..., {app_id}); listAudit({app})
│   ├── src/http/{catalog,funnels,versions,domains,apps,customers,analytics}.js   # SỬA: app_required, ?app=, GET /v1/apps/:id|summary|plans, lookup app_id, overview app
│   ├── src/publisher/{catalog,publish,funnels,routes}.js   # SỬA: createFunnel với app, checkUploadApp, domain_app_mismatch, audit app_id
│   ├── src/publisher/domains.js                         # MỚI: setDomain (app_id, domain_has_foreign_routes)
│   ├── src/identity/{apps,webhooks,grants,customers}.js # SỬA: assignFunnelApp, count, getApp, id `none` bị cấm, audit app_id, lookup theo app
│   ├── src/identity/app-summary.js                      # MỚI: appSummary, appPlans
│   ├── src/analytics/{clickhouse,queries,revenue,service}.js   # SỬA: tham số mảng, lọc slug theo app, app_id mỗi dòng, cache key
│   └── test/{apps-container,funnels-app,domains-app,routes-app,apps-read,customer-report-app,analytics-app,analytics-app-http}.test.js (mới);
│       test/{migrate,catalog,admin-schema,audit,funnel-app,plan-keys,publish,sessions,upload-lint,analytics-service,analytics-http,analytics-revenue}.test.js, test/helpers/app.js (sửa)
├── packages/cli/src/{main,api,publish}.js               # SỬA: funnel create/ls, publish --app, domain ls/set, app show/ls, stats --app
│   └── test/{funnel-app,domain,app-show,stats-app,publish-app}.test.js (mới); test/app.test.js (sửa)
├── apps/admin/src/
│   ├── app-context.jsx                                  # MỚI: AppsProvider, useAppContext
│   ├── components/OverviewTable.jsx                     # MỚI: Kpis, OverviewTable, totals, sumMoney…
│   ├── pages/{AppOverview,AppSettings,AppWebhooks,AppPlans}.jsx   # MỚI (AppDetail.jsx bị xoá, tách làm hai)
│   ├── {api,App,Layout,icons}.jsx|js, styles.css        # SỬA: client mới, route /apps/:id/*, switcher, menu theo ngữ cảnh
│   ├── pages/{Apps,Dashboard,Funnels,Domains,FunnelDetail,Customers,CustomerDetail,Audit}.jsx   # SỬA
│   ├── components/{PublishDialog,FunnelSettings}.jsx    # SỬA: domain theo app, không gỡ app
│   └── ../test/{layout-app,app-overview,app-settings,app-webhooks,funnels-app,domains,funnel-detail-app,app-plans,customers-app,audit}.test.jsx, apps-fixtures.js (mới);
│       test/{apps,grants,helpers,api,funnels,dashboard,publish}.test.* (sửa)
└── demo/
    ├── lib/{seed,funnels,stack}.mjs, README.md          # SỬA: 3 app mẫu, upload kèm app_id, purchase theo app funnel đầu
    └── test/admin-p4a-e2e.test.mjs (mới); test/* (sửa theo Task 12)
```

---

### Task 1: Migration `007_apps_container.sql` + `audit()` nhận `app_id` + `GET /v1/audit?app=`

**Files:**
- Create: `services/core-api/migrations/007_apps_container.sql`
- Modify: `services/core-api/src/audit.js`, `services/core-api/src/http/catalog.js`, `services/core-api/src/http/apps.js`, `services/core-api/src/identity/apps.js`, `services/core-api/src/identity/webhooks.js`
- Test: `services/core-api/test/apps-container.test.js` (mới; Postgres Testcontainers), sửa `services/core-api/test/migrate.test.js` (danh sách migration), `services/core-api/test/catalog.test.js` (item audit có thêm `app_id: null`), `services/core-api/test/admin-schema.test.js` (danh sách index của `audit_log` có thêm `audit_log_by_app`)

**Interfaces:**
- Consumes: `migrate(pool, dir)` (`src/db/migrate.js`, tham số `dir` dùng để áp 001–006 trước khi seed audit cũ), `withTx`, `requireRole(pool, 'viewer')`; test helpers `startDb`, `resetDb`, `makeApp`, `tokenFor`, `bearer`, `seedVersions`, `APP_BODY`, `WEB_BODY`, `fakeSecrets`.
- Produces:
  - Cột `domains.app_id TEXT NULL REFERENCES apps(id)` + index `domains_by_app (app_id) WHERE app_id IS NOT NULL`; cột `audit_log.app_id TEXT NULL` (không FK) + index `audit_log_by_app (app_id, at DESC) WHERE app_id IS NOT NULL`; `funnels.app` bị xoá. Backfill audit cũ (chỉ dòng `app_id IS NULL`, chạy lại không đổi gì): `funnel:<slug>`/`details->>'slug'` → `funnels.app_id`; `app:<id>` → `<id>`; `domain:<host>` → `domains.app_id`.
  - `audit(db, actor, action, target, details = {}, { app_id = null } = {})` ghi cột `app_id`.
  - `listAudit(pool, { target, action, limit, before, app })`: `app` lọc `app_id = $app`; mỗi item có `app_id`.
  - `GET /v1/audit?app=<id>` (pattern `^[a-z0-9][a-z0-9-]{1,30}$`, sai → `400 bad_request`), kết hợp được với `target`/`action`.
  - Cột `app_id` được điền ngay cho `app.create`, `app.update`, `app.rotate_key` (chính app), `webhook.resend` (app của delivery), `funnel.app` (app **mới**). Các action khác (`funnel.create`, `version.upload`, `route.*`, `domain.sync`, `entitlement.*`) do các task sau điền.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/apps-container.test.js` (mới):

`services/core-api/test/apps-container.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { cp, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, tokenFor, bearer, seedVersions } from './helpers/app.js';
import { APP_BODY, WEB_BODY, fakeSecrets } from './helpers/identity.js';
import { migrate } from '../src/db/migrate.js';
import { audit, listAudit } from '../src/audit.js';

const MIGRATIONS = new URL('../migrations/', import.meta.url).pathname;
const M007 = '007_apps_container.sql';

// The UPDATE statements of 007 (the audit backfill), to run them a second time.
async function backfillStatements() {
  const sql = (await readFile(join(MIGRATIONS, M007), 'utf8')).replace(/--.*$/gm, '');
  return sql.split(';').map((s) => s.trim()).filter((s) => /^UPDATE\b/i.test(s));
}

// Spec admin-console-p4a §1: migration 007 (domains.app_id, audit_log.app_id, funnels.app dropped) + audit backfill.
describe('migration 007_apps_container', () => {
  let db;
  let dir;
  const q = async (sql, p) => (await db.pool.query(sql, p)).rows;

  beforeAll(async () => {
    db = await startDb({ migrate: false });
    // Apply 001–006 only, seed pre-007 audit rows, then let the real directory apply 007 alone.
    dir = await mkdtemp(join(tmpdir(), 'ikf-mig-'));
    await cp(MIGRATIONS, dir, { recursive: true, filter: (src) => !src.endsWith(M007) });
    await migrate(db.pool, dir);
    await q(`INSERT INTO apps (id, name, kind, adjust_tracker_url, deeplink_scheme, webhook_url, api_key_hash)
             VALUES ('starlyn', 'Starlyn', 'app', 'https://app.adjust.com/abc', 'starlyn', 'https://be.example/hook', 'h1')`);
    await q("INSERT INTO funnels (slug, created_by, app_id) VALUES ('moon', 't', 'starlyn'), ('loose', 't', NULL)");
    await q(`INSERT INTO audit_log (actor, actor_kind, action, target, details) VALUES
      ('ci', 'token', 'version.upload', 'funnel:moon', '{"slug":"moon","v":1}'),
      ('ci', 'token', 'route.publish', 'route:a.example.com/', '{"host":"a.example.com","prefix":"/","slug":"moon","to_v":1}'),
      ('ci', 'token', 'app.create', 'app:starlyn', '{"id":"starlyn","kind":"app"}'),
      ('boss@ikameglobal.com', 'user', 'auth.login', 'user:boss@ikameglobal.com', '{"method":"local"}'),
      ('ci', 'token', 'funnel.create', 'funnel:gone', '{"slug":"gone"}'),
      ('ci', 'token', 'version.upload', 'funnel:loose', '{"slug":"loose","v":1}'),
      ('ci', 'token', 'domain.sync', 'domain:a.example.com', '{"host":"a.example.com","status":"active"}')`);
    expect(await migrate(db.pool)).toEqual([M007]);
  });
  afterAll(async () => {
    await rm(dir, { recursive: true, force: true });
    await db.stop();
  });

  const appIds = async () => (await q('SELECT action, target, app_id FROM audit_log ORDER BY id')).map((r) => [r.action, r.target, r.app_id]);

  it('adds domains.app_id (FK apps) and audit_log.app_id (no FK) with partial indexes; drops funnels.app', async () => {
    const cols = await q(
      `SELECT table_name, column_name, data_type, is_nullable FROM information_schema.columns
        WHERE table_schema = 'public' AND ((table_name IN ('domains', 'audit_log') AND column_name = 'app_id') OR (table_name = 'funnels' AND column_name = 'app'))
        ORDER BY table_name`,
    );
    expect(cols).toEqual([
      { table_name: 'audit_log', column_name: 'app_id', data_type: 'text', is_nullable: 'YES' },
      { table_name: 'domains', column_name: 'app_id', data_type: 'text', is_nullable: 'YES' },
    ]);
    const idx = await q("SELECT indexname, indexdef FROM pg_indexes WHERE indexname IN ('domains_by_app', 'audit_log_by_app') ORDER BY indexname");
    expect(idx.map((i) => i.indexname)).toEqual(['audit_log_by_app', 'domains_by_app']);
    expect(idx[0].indexdef).toMatch(/\(app_id, at DESC\) WHERE \(app_id IS NOT NULL\)/);
    expect(idx[1].indexdef).toMatch(/\(app_id\) WHERE \(app_id IS NOT NULL\)/);
    const fks = await q(
      `SELECT conrelid::regclass::text AS tbl FROM pg_constraint
        WHERE contype = 'f' AND confrelid = 'apps'::regclass AND conrelid IN ('domains'::regclass, 'audit_log'::regclass)`,
    );
    expect(fks).toEqual([{ tbl: 'domains' }]);
    await expect(q("INSERT INTO domains (host, status, app_id) VALUES ('x.example.com', 'active', 'nope')")).rejects.toThrow(/foreign key/);
    // No FK on audit_log: a row keeps its app id even if that app is gone later.
    await q("INSERT INTO audit_log (actor, actor_kind, action, target, app_id) VALUES ('t', 'token', 'x.test', 'x', 'nope')");
    await q("DELETE FROM audit_log WHERE action = 'x.test'");
  });

  it('is applied once: a second migrate applies nothing', async () => {
    expect(await migrate(db.pool)).toEqual([]);
  });

  it('backfills app_id from funnel:<slug>, details.slug and app:<id>; others (and slugs that no longer exist) stay NULL', async () => {
    expect(await appIds()).toEqual([
      ['version.upload', 'funnel:moon', 'starlyn'],
      ['route.publish', 'route:a.example.com/', 'starlyn'],
      ['app.create', 'app:starlyn', 'starlyn'],
      ['auth.login', 'user:boss@ikameglobal.com', null],
      ['funnel.create', 'funnel:gone', null],
      ['version.upload', 'funnel:loose', null],
      ['domain.sync', 'domain:a.example.com', null],
    ]);
  });

  it('the backfill statements are idempotent and fill domain:<host> from domains.app_id once a domain has an app', async () => {
    const stmts = await backfillStatements();
    expect(stmts).toHaveLength(3);
    const before = await appIds();
    for (const s of stmts) await q(s);
    expect(await appIds()).toEqual(before);
    await q("INSERT INTO domains (host, status, app_id) VALUES ('a.example.com', 'active', 'starlyn')");
    for (const s of stmts) await q(s);
    expect((await appIds()).at(-1)).toEqual(['domain.sync', 'domain:a.example.com', 'starlyn']);
    // A row that already has an app is never overwritten.
    await q("UPDATE funnels SET app_id = NULL WHERE slug = 'moon'");
    for (const s of stmts) await q(s);
    expect((await appIds())[0]).toEqual(['version.upload', 'funnel:moon', 'starlyn']);
  });
});

// Spec admin-console-p4a §2 "Audit": audit(..., {app_id}), listAudit({app}), GET /v1/audit?app=.
describe('audit app_id', () => {
  let db;
  let app;
  let store;
  let admin;
  const q = async (sql, p) => (await db.pool.query(sql, p)).rows;
  const get = (url) => app.inject({ method: 'GET', url, headers: bearer(admin) });
  const call = (method, url, payload) => app.inject({ method, url, headers: bearer(admin), ...(payload && { payload }) });
  const appOf = async (action) => (await q('SELECT app_id FROM audit_log WHERE action = $1 ORDER BY id', [action])).map((r) => r.app_id);

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    ({ app, store } = await makeApp(db.pool, { webhookSecrets: fakeSecrets() }));
    admin = await tokenFor(db.pool, 'admin');
  });
  afterEach(() => app.close());

  it('audit() stores app_id when given, NULL otherwise', async () => {
    await audit(db.pool, 'ci', 'app.update', 'app:starlyn', { id: 'starlyn' }, { app_id: 'starlyn' });
    await audit(db.pool, 'ci', 'token.create', 'token:x', { name: 'x' });
    expect(await q('SELECT action, app_id FROM audit_log ORDER BY id')).toEqual([
      { action: 'app.update', app_id: 'starlyn' },
      { action: 'token.create', app_id: null },
    ]);
  });

  it('listAudit({app}): only that app, newest first, each item has app_id; combines with target and action', async () => {
    await audit(db.pool, 'ci', 'version.upload', 'funnel:moon', { slug: 'moon' }, { app_id: 'starlyn' });
    await audit(db.pool, 'ci', 'version.upload', 'funnel:calm', { slug: 'calm' }, { app_id: 'calmio' });
    await audit(db.pool, 'ci', 'auth.login', 'user:a', {});
    await audit(db.pool, 'ci', 'route.publish', 'route:a.example.com/', { slug: 'moon' }, { app_id: 'starlyn' });
    const out = await listAudit(db.pool, { app: 'starlyn' });
    expect(out.items.map((i) => [i.action, i.target, i.app_id])).toEqual([
      ['route.publish', 'route:a.example.com/', 'starlyn'],
      ['version.upload', 'funnel:moon', 'starlyn'],
    ]);
    expect((await listAudit(db.pool, {})).items.map((i) => i.app_id)).toEqual(['starlyn', null, 'calmio', 'starlyn']);
    expect((await listAudit(db.pool, { app: 'starlyn', action: 'route' })).items.map((i) => i.action)).toEqual(['route.publish']);
    expect((await listAudit(db.pool, { app: 'calmio', target: 'funnel:moon' })).items).toEqual([]);
  });

  it('GET /v1/audit?app=: 200 filtered (with target too); a malformed app is 400', async () => {
    await audit(db.pool, 'ci', 'version.upload', 'funnel:moon', { slug: 'moon' }, { app_id: 'starlyn' });
    await audit(db.pool, 'ci', 'version.upload', 'funnel:calm', { slug: 'calm' }, { app_id: 'calmio' });
    await audit(db.pool, 'ci', 'app.update', 'app:starlyn', { id: 'starlyn' }, { app_id: 'starlyn' });
    const res = await get('/v1/audit?app=starlyn');
    expect(res.statusCode).toBe(200);
    expect(res.json().items.map((i) => [i.target, i.app_id])).toEqual([['app:starlyn', 'starlyn'], ['funnel:moon', 'starlyn']]);
    expect((await get('/v1/audit?app=starlyn&target=funnel:moon')).json().items.map((i) => i.target)).toEqual(['funnel:moon']);
    expect((await get('/v1/audit?app=calmio&target=funnel:moon')).json().items).toEqual([]);
    expect((await get('/v1/audit?app=BAD!')).statusCode).toBe(400);
    expect((await get('/v1/audit?app=x')).statusCode).toBe(400);
  });

  it('app.create, app.update, app.rotate_key, funnel.app (the new app) and webhook.resend write app_id', async () => {
    expect((await call('POST', '/v1/apps', APP_BODY)).statusCode).toBe(201);
    expect((await call('POST', '/v1/apps', WEB_BODY)).statusCode).toBe(201);
    expect((await call('PUT', '/v1/apps/starlyn', { name: 'Starlyn 2' })).statusCode).toBe(200);
    expect((await call('POST', '/v1/apps/starlyn/rotate-key')).statusCode).toBe(200);
    await seedVersions(db.pool, store, 'moon', 1);
    expect((await call('PUT', '/v1/funnels/moon', { app_id: 'starlyn' })).statusCode).toBe(200);
    expect((await call('PUT', '/v1/funnels/moon', { app_id: 'tarot-web' })).statusCode).toBe(200);
    const ev = '01JA0000000000000000000002';
    await q(`INSERT INTO customers (paddle_customer_id, ref) VALUES ('ctm_1', 'cus_01K75Z0000000000000000000B')`);
    await q(
      `INSERT INTO webhook_deliveries (event_id, app_id, app_user_id, type, payload, status)
       VALUES ($1, 'starlyn', 'u1', 'entitlement.updated', '{"customer_ref":"cus_01K75Z0000000000000000000B"}', 'dead')`,
      [ev],
    );
    expect((await call('POST', `/v1/apps/starlyn/webhooks/${ev}/resend`)).statusCode).toBe(200);
    expect(await appOf('app.create')).toEqual(['starlyn', 'tarot-web']);
    expect(await appOf('app.update')).toEqual(['starlyn']);
    expect(await appOf('app.rotate_key')).toEqual(['starlyn']);
    expect(await appOf('funnel.app')).toEqual(['starlyn', 'tarot-web']);
    expect(await appOf('webhook.resend')).toEqual(['starlyn']);
    // Actions filled by later tasks stay NULL here.
    expect(await appOf('version.upload')).toEqual([null]);
  });
});
```

`services/core-api/test/migrate.test.js`, `services/core-api/test/catalog.test.js`, `services/core-api/test/admin-schema.test.js` (sửa, áp dụng đúng diff này):

`services/core-api/test/migrate.test.js`, `services/core-api/test/catalog.test.js`, `services/core-api/test/admin-schema.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/test/admin-schema.test.js b/services/core-api/test/admin-schema.test.js
index acdab1a..cdc5624 100644
--- a/services/core-api/test/admin-schema.test.js
+++ b/services/core-api/test/admin-schema.test.js
@@ -48,7 +48,7 @@ describe('005_admin schema', () => {
       db.pool.query("INSERT INTO audit_log (actor, actor_kind, action, target) VALUES ('x', 'robot', 'a', 't')"),
     ).rejects.toThrow(/audit_log_actor_kind_check/);
     const idx = await db.pool.query("SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'audit_log' ORDER BY indexname");
-    expect(idx.rows.map((r) => r.indexname)).toEqual(['audit_log_by_at', 'audit_log_by_target', 'audit_log_pkey']);
-    expect(idx.rows[1].indexdef).toMatch(/\(target, at DESC\)/);
+    expect(idx.rows.map((r) => r.indexname)).toEqual(['audit_log_by_app', 'audit_log_by_at', 'audit_log_by_target', 'audit_log_pkey']);
+    expect(idx.rows[2].indexdef).toMatch(/\(target, at DESC\)/);
   });
 });
diff --git a/services/core-api/test/catalog.test.js b/services/core-api/test/catalog.test.js
index b0c0313..6bf9e77 100644
--- a/services/core-api/test/catalog.test.js
+++ b/services/core-api/test/catalog.test.js
@@ -127,7 +127,7 @@ describe('admin console reads: funnels, domains, audit', () => {
     expect(page1.items).toHaveLength(4);
     expect(page1.items[0]).toEqual({
       id: 6, at: expect.any(String), actor: 'admin', actor_kind: 'token', action: 'domain.sync', target: 'domain:c.example.com',
-      details: { host: 'c.example.com', status: 'active' },
+      details: { host: 'c.example.com', status: 'active' }, app_id: null,
     });
     const page2 = (await get(`/v1/audit?limit=4&before=${page1.next_before}`)).json();
     expect(page2.items.map((i) => i.id)).toEqual([2, 1]);
diff --git a/services/core-api/test/migrate.test.js b/services/core-api/test/migrate.test.js
index 3a625b1..353fdb7 100644
--- a/services/core-api/test/migrate.test.js
+++ b/services/core-api/test/migrate.test.js
@@ -10,7 +10,7 @@ describe('migrate', () => {
   afterAll(() => db.stop());
 
   it('applies the publisher schema once and is idempotent', async () => {
-    expect(await migrate(db.pool)).toEqual(['001_publisher.sql', '002_funnel_pixel.sql', '003_billing.sql', '004_entitlements.sql', '005_admin.sql', '006_admin_p2.sql']);
+    expect(await migrate(db.pool)).toEqual(['001_publisher.sql', '002_funnel_pixel.sql', '003_billing.sql', '004_entitlements.sql', '005_admin.sql', '006_admin_p2.sql', '007_apps_container.sql']);
     expect(await migrate(db.pool)).toEqual([]);
     const { rows } = await db.pool.query(
       "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY 1",
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/apps-container.test.js
```

Expected: `Tests  4 failed | 4 skipped (8)`. Khối `migration 007_apps_container` bị skip cả 4 test vì `beforeAll` fail (`expected [] to deeply equal [ '007_apps_container.sql' ]`: chưa có file 007). Khối `audit app_id` fail 4 test: `audit() stores app_id when given, NULL otherwise` (cột `app_id` chưa có), `listAudit({app}) …` (`app` bị bỏ qua, trả cả 4 dòng), `GET /v1/audit?app= …` (item không có `app_id`: `[ 'app:starlyn', undefined ]`), `app.create, app.update, app.rotate_key, funnel.app (the new app) and webhook.resend write app_id`.

- [ ] **Step 3: Implement**

`services/core-api/migrations/007_apps_container.sql` (mới):

`services/core-api/migrations/007_apps_container.sql` (mới):

```sql
-- Admin console p4a (spec admin-console-p4a §1): the app is the management unit. A domain belongs to one app
-- or is shared (NULL: demo, preview, test hosts); audit rows carry the app they concern.
ALTER TABLE domains   ADD COLUMN app_id TEXT NULL REFERENCES apps (id);
CREATE INDEX domains_by_app ON domains (app_id) WHERE app_id IS NOT NULL;
-- No FK: an audit row keeps its app id even if the app is removed later.
ALTER TABLE audit_log ADD COLUMN app_id TEXT NULL;
CREATE INDEX audit_log_by_app ON audit_log (app_id, at DESC) WHERE app_id IS NOT NULL;
-- Legacy TEXT column from 001, never read or written (funnels.app_id from 004 replaced it).
ALTER TABLE funnels   DROP COLUMN app;

-- Best-effort backfill of older audit rows. Each statement only fills rows still NULL, so running it again
-- changes nothing. funnel:<slug> targets and rows naming a slug (route.*, funnel.*) take the funnel's app
-- (a slug that no longer exists, or a funnel with no app, stays NULL)
UPDATE audit_log a SET app_id = f.app_id
  FROM funnels f
 WHERE a.app_id IS NULL AND f.app_id IS NOT NULL
   AND (a.target = 'funnel:' || f.slug OR a.details->>'slug' = f.slug);
-- app:<id> targets name the app itself
UPDATE audit_log SET app_id = substr(target, length('app:') + 1)
 WHERE app_id IS NULL AND target LIKE 'app:%';
-- domain:<host> targets take the domain's app (all NULL right after this migration, filled once domains are assigned)
UPDATE audit_log a SET app_id = d.app_id
  FROM domains d
 WHERE a.app_id IS NULL AND d.app_id IS NOT NULL
   AND a.target = 'domain:' || d.host;
```

`services/core-api/src/audit.js`, `services/core-api/src/http/catalog.js`, `services/core-api/src/http/apps.js`, `services/core-api/src/identity/apps.js`, `services/core-api/src/identity/webhooks.js` (sửa, áp dụng đúng diff này):

`services/core-api/src/audit.js`, `services/core-api/src/http/catalog.js`, `services/core-api/src/http/apps.js`, `services/core-api/src/identity/apps.js`, `services/core-api/src/identity/webhooks.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/audit.js b/services/core-api/src/audit.js
index 9a814ed..123ba04 100644
--- a/services/core-api/src/audit.js
+++ b/services/core-api/src/audit.js
@@ -4,27 +4,31 @@
 // A publisher function's actor: req.actor ({kind, name, ...}) from HTTP, or a plain name (demo, tests) = a token.
 export const actorOf = (a) => (typeof a === 'string' ? { kind: 'token', name: a } : a);
 
-export async function audit(db, actor, action, target, details = {}) {
+// app_id (spec admin-console-p4a §2 "Audit"): the app the change concerns, so an app's history can be listed
+// (and, in p4b, scoped by per-app roles); null for auth.*, token.*, billing.*, admin.user.*, customer.*.
+export async function audit(db, actor, action, target, details = {}, { app_id = null } = {}) {
   const who = actorOf(actor);
   await db.query(
-    'INSERT INTO audit_log (actor, actor_kind, action, target, details) VALUES ($1, $2, $3, $4, $5)',
-    [who.name, who.kind, action, target, details],
+    'INSERT INTO audit_log (actor, actor_kind, action, target, details, app_id) VALUES ($1, $2, $3, $4, $5, $6)',
+    [who.name, who.kind, action, target, details, app_id],
   );
 }
 
 // Newest first. target: exact, and funnel:<slug> / domain:<host> also match the route rows of that funnel / host.
 // action: exact, or a family ("route" = route.*). before: an id from the previous page's next_before.
-export async function listAudit(pool, { target = null, action = null, limit = 50, before = null } = {}) {
+// app: only rows of that app (audit_log.app_id), combinable with target and action.
+export async function listAudit(pool, { target = null, action = null, limit = 50, before = null, app = null } = {}) {
   const slug = target?.startsWith('funnel:') ? target.slice('funnel:'.length) : null;
   const host = target?.startsWith('domain:') ? target.slice('domain:'.length) : null;
   const { rows } = await pool.query(
-    `SELECT id, at, actor, actor_kind, action, target, details FROM audit_log
+    `SELECT id, at, actor, actor_kind, action, target, details, app_id FROM audit_log
       WHERE ($1::text IS NULL OR target = $1 OR details->>'slug' = $2 OR details->>'host' = $3)
         AND ($4::text IS NULL OR action = $4 OR action LIKE $4 || '.%')
         AND ($5::bigint IS NULL OR id < $5)
+        AND ($7::text IS NULL OR app_id = $7)
       ORDER BY id DESC
       LIMIT $6`,
-    [target, slug, host, action, before, limit],
+    [target, slug, host, action, before, limit, app],
   );
   const items = rows.map((r) => ({ ...r, id: Number(r.id), at: r.at.toISOString() }));
   return { items, next_before: items.length === limit ? items.at(-1).id : null };
diff --git a/services/core-api/src/http/apps.js b/services/core-api/src/http/apps.js
index 7eeb8f1..79af232 100644
--- a/services/core-api/src/http/apps.js
+++ b/services/core-api/src/http/apps.js
@@ -41,7 +41,7 @@ export default async function appsHttp(app, { pool, webhookSecrets }) {
     },
     async (req, reply) => {
       const out = await createApp(pool, webhookSecrets, req.body);
-      await audit(pool, req.actor, 'app.create', `app:${out.app.id}`, { id: out.app.id, kind: out.app.kind });
+      await audit(pool, req.actor, 'app.create', `app:${out.app.id}`, { id: out.app.id, kind: out.app.kind }, { app_id: out.app.id });
       reply.code(201).header('cache-control', 'no-store');
       return out;
     },
@@ -86,7 +86,7 @@ export default async function appsHttp(app, { pool, webhookSecrets }) {
     async (req, reply) => {
       reply.header('cache-control', 'no-store');
       const out = await rotateKey(pool, req.params.id, { force: req.body?.force === true });
-      await audit(pool, req.actor, 'app.rotate_key', `app:${req.params.id}`, { id: req.params.id });
+      await audit(pool, req.actor, 'app.rotate_key', `app:${req.params.id}`, { id: req.params.id }, { app_id: req.params.id });
       return out;
     },
   );
diff --git a/services/core-api/src/http/catalog.js b/services/core-api/src/http/catalog.js
index c13764a..6c78032 100644
--- a/services/core-api/src/http/catalog.js
+++ b/services/core-api/src/http/catalog.js
@@ -43,6 +43,8 @@ export default async function catalogHttp(app, { pool, previewBaseUrl = null })
             action: { type: 'string', pattern: '^[a-z_.]{1,64}$' },
             limit: { type: 'integer', minimum: 1, maximum: 200, default: 50 },
             before: { type: 'integer', minimum: 1 },
+            // Spec admin-console-p4a §2: an app's history (audit_log.app_id).
+            app: { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{1,30}$' },
           },
         },
       },
diff --git a/services/core-api/src/identity/apps.js b/services/core-api/src/identity/apps.js
index e737b13..b4d3485 100644
--- a/services/core-api/src/identity/apps.js
+++ b/services/core-api/src/identity/apps.js
@@ -142,7 +142,7 @@ export async function updateApp(pool, id, fields, actor) {
     checkApp({ ...cur, ...fields });
     const sets = names.map((f, i) => `${f} = $${i + 2}`).join(', ');
     const updated = await c.query(`UPDATE apps SET ${sets} WHERE id = $1 RETURNING ${COLUMNS}`, [id, ...names.map((f) => fields[f])]);
-    await audit(c, actor, 'app.update', `app:${id}`, { id, fields: names });
+    await audit(c, actor, 'app.update', `app:${id}`, { id, fields: names }, { app_id: id });
     return { app: appView(updated.rows[0]) };
   });
 }
@@ -172,7 +172,8 @@ export async function setFunnelApp(pool, { slug, appId, actor }) {
       throw err;
     }
     await queueFunnelRecompute(c, rows[0].id);
-    await audit(c, actor, 'funnel.app', `funnel:${slug}`, { slug, app_id: appId });
+    // Spec admin-console-p4a §2: the row belongs to the app the funnel moved to.
+    await audit(c, actor, 'funnel.app', `funnel:${slug}`, { slug, app_id: appId }, { app_id: appId });
     return { funnel: slug, app_id: appId };
   });
 }
diff --git a/services/core-api/src/identity/webhooks.js b/services/core-api/src/identity/webhooks.js
index bb4c2fe..e0fe67c 100644
--- a/services/core-api/src/identity/webhooks.js
+++ b/services/core-api/src/identity/webhooks.js
@@ -203,7 +203,7 @@ export async function resendDelivery(pool, { appId, eventId, actor = null }) {
       customerRef: ref,
       entitlements: linked ? await entitlementsOf(c, subject, appId) : [],
     });
-    if (actor) await audit(c, actor, 'webhook.resend', `app:${appId}`, { app_id: appId, event_id: eventId });
+    if (actor) await audit(c, actor, 'webhook.resend', `app:${appId}`, { app_id: appId, event_id: eventId }, { app_id: appId });
     const { rows: [row] } = await c.query(`SELECT ${ITEM_COLUMNS} FROM webhook_deliveries WHERE event_id = $1`, [newId]);
     return { ...item(row), resent_from: eventId };
   });
PATCH
```

Ghi chú: comment trong file 007 không được chứa dấu `;` (test tách các câu `UPDATE` bằng `;` sau khi bỏ comment để chạy lại backfill). `funnels.app` (TEXT từ 001) không có code nào đọc/ghi (`git grep` trên `services`, `demo`, `packages`, `apps`, `workers`), nên DROP an toàn.

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/apps-container.test.js
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  8 passed (8)`; toàn bộ core-api `Test Files  60 passed (60)`, `Tests  562 passed (562)` (trước task: 59 file, 554 test).

- [ ] **Step 5: Commit**

```bash
git add services/core-api/migrations/007_apps_container.sql services/core-api/src/audit.js services/core-api/src/http/apps.js services/core-api/src/http/catalog.js services/core-api/src/identity/apps.js services/core-api/src/identity/webhooks.js services/core-api/test/apps-container.test.js services/core-api/test/migrate.test.js services/core-api/test/catalog.test.js services/core-api/test/admin-schema.test.js
git commit -m "feat(core-api): migration 007 (domains.app_id, audit_log.app_id, drop funnels.app); audit app_id + GET /v1/audit?app="
```

---

---

### Task 2: Funnel bắt buộc có app — `POST /v1/funnels {slug, app_id}`, upload lần đầu kèm `app_id`, `PUT` không cho null, `GET /v1/funnels?app=`

**Files:**
- Modify: `services/core-api/src/publisher/catalog.js`, `services/core-api/src/publisher/publish.js`, `services/core-api/src/publisher/funnels.js`, `services/core-api/src/identity/apps.js`, `services/core-api/src/http/catalog.js`, `services/core-api/src/http/versions.js`, `services/core-api/src/http/funnels.js`
- Test: `services/core-api/test/funnels-app.test.js` (mới; Postgres Testcontainers); sửa helper `services/core-api/test/helpers/app.js` (`seedVersions` tạo dòng funnel không app trước); sửa fixture/body của `services/core-api/test/audit.test.js`, `plan-keys.test.js`, `upload-lint.test.js`, `sessions.test.js` (dòng `funnels` có sẵn), `publish.test.js` (app `tarot-web` kind `web` + `app_id` trong body upload), `catalog.test.js` (app `starlyn` + `app_id` trong body `POST /v1/funnels`, funnel trả về có `app_id: 'starlyn'`), `funnel-app.test.js` (`PUT {app_id: null}` giờ là `400 app_required`, app giữ nguyên)

**Interfaces:**
- Consumes: `audit(db, actor, action, target, details, { app_id })` và `actorOf` (Task 1, `src/audit.js`), `withTx` (`src/identity/link.js`), `setFunnelApp` (`src/identity/apps.js`, đã audit `funnel.app` với app mới từ Task 1), `queueFunnelRecompute` (`src/identity/entitlements.js`), `lint` (`@ikf/funnel-lint`), `HttpError`; test helpers `startDb`, `resetDb`, `makeApp`, `tokenFor`, `bearer`, `sha`, `seedVersions`, `funnelHtml`, `seedApp`, `WEB_BODY`.
- Produces:
  - `insertFunnel(c, { slug, appId, actor })` (`src/publisher/catalog.js`): `INSERT … ON CONFLICT (slug) DO NOTHING` với `app_id`, FK `23503` → `404 app_not_found {app_id}`, audit `funnel.create {slug, app_id}` với cột `app_id`; trả id mới hoặc `null` khi slug đã có.
  - `createFunnel(pool, { slug, appId, actor })`: `insertFunnel` trong `withTx`, `null` → `409 funnel_exists`.
  - `listFunnels(pool, { app } = {})`: `app` = id → chỉ funnel của app; `'none'` → `app_id IS NULL`; không có → tất cả.
  - `assignFunnelApp(c, { funnelId, slug, appId, actor })` (`src/identity/apps.js`, tách từ `setFunnelApp`, dùng chung): `UPDATE funnels SET app_id` (FK `23503` → `404 app_not_found`), `queueFunnelRecompute`, audit `funnel.app {slug, app_id}` với cột `app_id`; trong transaction của caller, dòng funnel đã khoá.
  - `checkUploadApp(slug, row, appId)` (`src/publisher/publish.js`): slug mới không `appId` → `400 app_required {funnel}`; funnel có app **khác null** khác `appId` → `409 funnel_app_mismatch {app_id: <hiện tại>}`; còn lại cho qua (funnel chưa gán + `appId` = được gán).
  - `publishVersion(deps, { slug, html, lintReport, planKeys, appId = null, actor })`: không còn tự tạo funnel không app; slug mới + `appId` → `insertFunnel` trong cùng transaction với version (upload đồng thời lần đầu: bên thua `insertFunnel` khoá dòng của bên thắng rồi kiểm app như funnel có sẵn); funnel có sẵn `app_id IS NULL` + `appId` → `assignFunnelApp` dưới row lock rồi upload tiếp (phán quyết coordinator: `ikf publish --app` đầu tiên gán funnel cũ); audit `version.upload` với cột `app_id` = app của funnel.
  - `POST /v1/funnels` body `{slug, app_id}`: thiếu `app_id` → `400 {error: 'app_required'}` (kiểm trong handler; schema chỉ kiểm pattern `^[a-z0-9][a-z0-9-]{1,30}$`), app lạ → `404 app_not_found`, `409 funnel_exists` như cũ.
  - `POST /v1/funnels/:slug/versions` body thêm `app_id?` (cùng pattern): sau kiểm `sha256`, trước lint: luật `checkUploadApp`, slug mới + app lạ → `404 app_not_found`; lint nhận `kind` của app (slug mới hoặc funnel chưa gán: app trong body; funnel đã có app: app của funnel) nên `no_get_app_hook` có ngay ở lần upload gán app.
  - `PUT /v1/funnels/:slug {app_id: null}` → `400 app_required {funnel}`; đổi sang app khác như cũ.
  - `GET /v1/funnels?app=<id>|none` (pattern `^(none|[a-z0-9][a-z0-9-]{1,30})$`, sai → `400 bad_request`).
  - Audit `funnel.pixel` ghi cột `app_id` = app của funnel.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/funnels-app.test.js` (mới):

`services/core-api/test/funnels-app.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, tokenFor, bearer, sha, seedVersions } from './helpers/app.js';
import { funnelHtml } from './helpers/pages.js';
import { seedApp, WEB_BODY } from './helpers/identity.js';

// Spec admin-console-p4a §2 "Tạo funnel và upload": a new funnel belongs to an app (create or first upload),
// an existing funnel keeps its app (upload with another app → 409, PUT null → 400), GET /v1/funnels?app=.
describe('funnels require an app', () => {
  let db;
  let app;
  let store;
  let admin;
  let publisher;

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    ({ app, store } = await makeApp(db.pool));
    admin = await tokenFor(db.pool, 'admin');
    publisher = await tokenFor(db.pool, 'publisher');
    await seedApp(db.pool); // starlyn, kind app
    await seedApp(db.pool, undefined, WEB_BODY); // tarot-web, kind web
  });
  afterEach(() => app.close());

  const call = (method, url, payload, token = admin) => app.inject({ method, url, headers: bearer(token), ...(payload && { payload }) });
  const upload = (slug, marker, extra = {}) => {
    const html = funnelHtml(slug, marker);
    return call('POST', `/v1/funnels/${slug}/versions`, { html, sha256: sha(html), ...extra }, publisher);
  };
  const funnelRow = async (slug) => (await db.pool.query('SELECT app_id FROM funnels WHERE slug = $1', [slug])).rows[0];
  const auditRows = async () =>
    (await db.pool.query('SELECT action, target, details, app_id FROM audit_log ORDER BY id')).rows;

  it('POST /v1/funnels: 400 app_required without app_id, 404 app_not_found for an unknown app, 201 with the app (audited)', async () => {
    expect((await call('POST', '/v1/funnels', { slug: 'moon' })).json()).toEqual({ error: 'app_required' });
    const unknown = await call('POST', '/v1/funnels', { slug: 'moon', app_id: 'nope' });
    expect(unknown.statusCode).toBe(404);
    expect(unknown.json()).toEqual({ error: 'app_not_found', detail: { app_id: 'nope' } });
    expect(await funnelRow('moon')).toBeUndefined();
    expect((await call('POST', '/v1/funnels', { slug: 'moon', app_id: 'Bad App' })).statusCode).toBe(400);

    const res = await call('POST', '/v1/funnels', { slug: 'moon', app_id: 'starlyn' });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toMatchObject({ slug: 'moon', app_id: 'starlyn', versions: [] });
    expect((await call('GET', '/v1/funnels/moon')).json().app_id).toBe('starlyn');
    expect((await call('POST', '/v1/funnels', { slug: 'moon', app_id: 'starlyn' })).json()).toEqual({
      error: 'funnel_exists', detail: { funnel: 'moon' },
    });
    expect((await auditRows()).filter((r) => r.action === 'funnel.create')).toEqual([
      { action: 'funnel.create', target: 'funnel:moon', details: { slug: 'moon', app_id: 'starlyn' }, app_id: 'starlyn' },
    ]);
  });

  it('first upload of a new slug: 400 app_required without app_id (nothing created); with app_id the funnel is created in that app', async () => {
    const res = await upload('moon', 'one');
    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({ error: 'app_required', detail: { funnel: 'moon' } });
    expect(await funnelRow('moon')).toBeUndefined();
    expect(store.objects.size).toBe(0);
    expect((await upload('moon', 'one', { app_id: 'nope' })).json()).toEqual({ error: 'app_not_found', detail: { app_id: 'nope' } });
    expect(await funnelRow('moon')).toBeUndefined();

    const ok = await upload('moon', 'one', { app_id: 'starlyn' });
    expect(ok.statusCode).toBe(201);
    expect(ok.json()).toMatchObject({ funnel: 'moon', v: 1, created: true });
    expect(await funnelRow('moon')).toEqual({ app_id: 'starlyn' });
    const html = funnelHtml('moon', 'one');
    expect(await auditRows()).toEqual([
      { action: 'funnel.create', target: 'funnel:moon', details: { slug: 'moon', app_id: 'starlyn' }, app_id: 'starlyn' },
      {
        action: 'version.upload', target: 'funnel:moon', app_id: 'starlyn',
        details: { slug: 'moon', v: 1, sha256: sha(html), lint: { errors: 0, warnings: 1 } },
      },
    ]);
  });

  it('an existing funnel: another app_id → 409 funnel_app_mismatch; the same or no app_id uploads as before', async () => {
    await upload('moon', 'one', { app_id: 'starlyn' });
    const other = await upload('moon', 'two', { app_id: 'tarot-web' });
    expect(other.statusCode).toBe(409);
    expect(other.json()).toEqual({ error: 'funnel_app_mismatch', detail: { app_id: 'starlyn' } });
    expect((await upload('moon', 'two', { app_id: 'starlyn' })).json()).toMatchObject({ v: 2, created: true });
    const plain = await upload('moon', 'three');
    expect(plain.statusCode).toBe(201);
    expect(plain.json()).toMatchObject({ v: 3, created: true });
    expect((await upload('moon', 'three')).statusCode).toBe(200);
    expect(await funnelRow('moon')).toEqual({ app_id: 'starlyn' });
  });

  it('a funnel without an app (from before 007) keeps taking uploads without app_id', async () => {
    await seedVersions(db.pool, store, 'legacy', 1);
    const res = await upload('legacy', 'two');
    expect(res.statusCode).toBe(201);
    expect(res.json()).toMatchObject({ v: 2 });
    expect((await auditRows()).at(-1)).toMatchObject({ action: 'version.upload', app_id: null });
    expect(await funnelRow('legacy')).toEqual({ app_id: null });
  });

  it('uploading with app_id onto an unassigned funnel assigns it: funnel.app audit row with app_id, recompute queued, then a different app → 409', async () => {
    await seedVersions(db.pool, store, 'legacy', 1);
    // A buyer from before the assignment: the app change queues them for an entitlement recompute (as PUT does).
    const customerId = (await db.pool.query("INSERT INTO customers (paddle_customer_id, email) VALUES ('ctm_1', 'a@b.co') RETURNING id")).rows[0].id;
    await db.pool.query(
      `INSERT INTO subscriptions (paddle_subscription_id, customer_id, funnel_id, plan_key, status, paddle_updated_at)
       SELECT 'sub_1', $1, id, '1w', 'active', now() FROM funnels WHERE slug = 'legacy'`,
      [customerId],
    );
    const res = await upload('legacy', 'two', { app_id: 'starlyn' });
    expect(res.statusCode).toBe(201);
    expect(res.json()).toMatchObject({ v: 2, created: true });
    expect(await funnelRow('legacy')).toEqual({ app_id: 'starlyn' });
    expect((await auditRows()).slice(-2)).toEqual([
      { action: 'funnel.app', target: 'funnel:legacy', details: { slug: 'legacy', app_id: 'starlyn' }, app_id: 'starlyn' },
      expect.objectContaining({ action: 'version.upload', app_id: 'starlyn' }),
    ]);
    expect((await db.pool.query('SELECT customer_id FROM entitlement_recompute')).rows).toEqual([{ customer_id: customerId }]);
    // Lint already saw the new app's kind on that upload.
    const { rows } = await db.pool.query("SELECT lint_report FROM versions WHERE n = 2");
    expect(rows[0].lint_report.warnings.map((w) => w.code)).toEqual(['no_get_app_hook']);
    expect((await upload('legacy', 'three', { app_id: 'tarot-web' })).json()).toEqual({
      error: 'funnel_app_mismatch', detail: { app_id: 'starlyn' },
    });
  });

  it('lint sees the app kind on the first upload: no_get_app_hook for an app of kind app, not for kind web', async () => {
    await upload('moon', 'one', { app_id: 'starlyn' });
    await upload('sun', 'one', { app_id: 'tarot-web' });
    const warnings = async (slug) =>
      (
        await db.pool.query('SELECT v.lint_report FROM versions v JOIN funnels f ON f.id = v.funnel_id WHERE f.slug = $1', [slug])
      ).rows[0].lint_report.warnings.map((w) => w.code);
    expect(await warnings('moon')).toEqual(['no_get_app_hook']);
    expect(await warnings('sun')).toEqual([]);
  });

  it('PUT /v1/funnels/:slug: app_id null → 400 app_required (app kept); another app → 200 (audited with the new app)', async () => {
    await upload('moon', 'one', { app_id: 'starlyn' });
    const res = await call('PUT', '/v1/funnels/moon', { app_id: null });
    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({ error: 'app_required', detail: { funnel: 'moon' } });
    expect(await funnelRow('moon')).toEqual({ app_id: 'starlyn' });
    const move = await call('PUT', '/v1/funnels/moon', { app_id: 'tarot-web' });
    expect(move.statusCode).toBe(200);
    expect(move.json()).toEqual({ funnel: 'moon', app_id: 'tarot-web' });
    expect((await auditRows()).at(-1)).toMatchObject({ action: 'funnel.app', app_id: 'tarot-web' });
  });

  it('funnel.pixel is audited with the funnel app', async () => {
    await upload('moon', 'one', { app_id: 'starlyn' });
    expect((await call('PUT', '/v1/funnels/moon', { pixel_id: '123456789' })).statusCode).toBe(200);
    expect((await auditRows()).at(-1)).toMatchObject({ action: 'funnel.pixel', app_id: 'starlyn' });
  });

  it('GET /v1/funnels?app=<id> lists that app only; app=none the unassigned ones; a malformed app → 400', async () => {
    await upload('moon', 'one', { app_id: 'starlyn' });
    await upload('sun', 'one', { app_id: 'tarot-web' });
    await seedVersions(db.pool, store, 'legacy', 1);
    const slugs = async (q) => (await call('GET', `/v1/funnels${q}`)).json().funnels.map((f) => f.slug).sort();
    expect(await slugs('')).toEqual(['legacy', 'moon', 'sun']);
    expect(await slugs('?app=starlyn')).toEqual(['moon']);
    expect(await slugs('?app=tarot-web')).toEqual(['sun']);
    expect(await slugs('?app=none')).toEqual(['legacy']);
    expect(await slugs('?app=other')).toEqual([]);
    const bad = await call('GET', '/v1/funnels?app=BAD!');
    expect(bad.statusCode).toBe(400);
    expect(bad.json().error).toBe('bad_request');
  });
});
```

`services/core-api/test/helpers/app.js`, `services/core-api/test/audit.test.js`, `services/core-api/test/catalog.test.js`, `services/core-api/test/funnel-app.test.js`, `services/core-api/test/plan-keys.test.js`, `services/core-api/test/publish.test.js`, `services/core-api/test/sessions.test.js`, `services/core-api/test/upload-lint.test.js` (sửa, áp dụng đúng diff này):

`services/core-api/test/helpers/app.js`, `services/core-api/test/audit.test.js`, `services/core-api/test/catalog.test.js`, `services/core-api/test/funnel-app.test.js`, `services/core-api/test/plan-keys.test.js`, `services/core-api/test/publish.test.js`, `services/core-api/test/sessions.test.js`, `services/core-api/test/upload-lint.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/test/audit.test.js b/services/core-api/test/audit.test.js
index 24a03ee..50bdaca 100644
--- a/services/core-api/test/audit.test.js
+++ b/services/core-api/test/audit.test.js
@@ -25,6 +25,8 @@ describe('audit log of changes', () => {
     publisher = await tokenFor(db.pool, 'publisher');
     await db.pool.query("INSERT INTO domains (host, status) VALUES ('a.example.com', 'active')");
     await db.pool.query("INSERT INTO host_revs (host) VALUES ('a.example.com')");
+    // Spec admin-console-p4a §2: an upload no longer creates the funnel; they exist (no app, as before 007).
+    await db.pool.query("INSERT INTO funnels (slug, created_by) VALUES ('aivideo', 'test'), ('other-funnel', 'test')");
   });
   afterEach(() => app.close());
 
diff --git a/services/core-api/test/catalog.test.js b/services/core-api/test/catalog.test.js
index 6bf9e77..5f975cf 100644
--- a/services/core-api/test/catalog.test.js
+++ b/services/core-api/test/catalog.test.js
@@ -49,11 +49,16 @@ describe('admin console reads: funnels, domains, audit', () => {
 
   it('POST /v1/funnels: an editor creates an empty funnel (audited); 409 if it exists; 400 bad slug; viewer 403', async () => {
     const ed = await signIn(db.pool, 'ed@ikameglobal.com', 'editor');
-    const create = (slug, headers = ed.headers()) => app.inject({ method: 'POST', url: '/v1/funnels', headers, payload: { slug } });
+    // Spec admin-console-p4a §2: a new funnel names its app.
+    await db.pool.query(
+      `INSERT INTO apps (id, name, kind, adjust_tracker_url, deeplink_scheme, webhook_url, api_key_hash)
+       VALUES ('starlyn', 'Starlyn', 'app', 'https://app.adjust.com/abc', 'starlyn', 'https://be.example/hook', 'h1')`,
+    );
+    const create = (slug, headers = ed.headers()) => app.inject({ method: 'POST', url: '/v1/funnels', headers, payload: { slug, app_id: 'starlyn' } });
     const res = await create('new-funnel');
     expect(res.statusCode).toBe(201);
     expect(res.json()).toEqual({
-      slug: 'new-funnel', pixel_id: null, app_id: null, created_by: 'ed@ikameglobal.com', created_at: expect.any(String), versions: [], live: [],
+      slug: 'new-funnel', pixel_id: null, app_id: 'starlyn', created_by: 'ed@ikameglobal.com', created_at: expect.any(String), versions: [], live: [],
     });
     expect((await create('new-funnel')).json()).toEqual({ error: 'funnel_exists', detail: { funnel: 'new-funnel' } });
     expect((await create('Bad Slug')).statusCode).toBe(400);
diff --git a/services/core-api/test/funnel-app.test.js b/services/core-api/test/funnel-app.test.js
index 608321d..2940eee 100644
--- a/services/core-api/test/funnel-app.test.js
+++ b/services/core-api/test/funnel-app.test.js
@@ -28,13 +28,13 @@ describe('funnel → app (PUT /v1/funnels/:slug app_id) and plan → entitlement
   const put = (body, slug = 'witch-power') => app.inject({ method: 'PUT', url: `/v1/funnels/${slug}`, headers: bearer(router), payload: body });
   const appOf = async () => (await db.pool.query("SELECT app_id FROM funnels WHERE slug = 'witch-power'")).rows[0].app_id;
 
-  it('sets and clears the app of a funnel', async () => {
+  it('sets the app of a funnel; clearing it is refused (spec admin-console-p4a decision #5)', async () => {
     const res = await put({ app_id: 'starlyn' });
     expect(res.statusCode).toBe(200);
     expect(res.json()).toEqual({ funnel: 'witch-power', app_id: 'starlyn' });
     expect(await appOf()).toBe('starlyn');
-    expect((await put({ app_id: null })).json()).toEqual({ funnel: 'witch-power', app_id: null });
-    expect(await appOf()).toBeNull();
+    expect((await put({ app_id: null })).json()).toEqual({ error: 'app_required', detail: { funnel: 'witch-power' } });
+    expect(await appOf()).toBe('starlyn');
   });
 
   it('app and pixel in one call', async () => {
diff --git a/services/core-api/test/helpers/app.js b/services/core-api/test/helpers/app.js
index d04b6ac..e744e43 100644
--- a/services/core-api/test/helpers/app.js
+++ b/services/core-api/test/helpers/app.js
@@ -20,7 +20,10 @@ export const tokenFor = (pool, ...roles) => createToken(pool, { name: roles.join
 export const bearer = (token) => ({ authorization: `Bearer ${token}` });
 export const sha = (s) => createHash('sha256').update(s).digest('hex');
 
+// The funnel row first (no app, like a funnel from before 007): publishVersion no longer creates funnels
+// (spec admin-console-p4a §2); an existing row is kept as it is.
 export async function seedVersions(pool, store, slug, count) {
+  await pool.query("INSERT INTO funnels (slug, created_by) VALUES ($1, 'seed') ON CONFLICT (slug) DO NOTHING", [slug]);
   for (let i = 1; i <= count; i += 1) {
     await publishVersion({ pool, store, previewBaseUrl: PREVIEW }, { slug, html: funnelHtml(slug, `v${i}`), actor: 'seed' });
   }
diff --git a/services/core-api/test/plan-keys.test.js b/services/core-api/test/plan-keys.test.js
index a8e165c..0e75825 100644
--- a/services/core-api/test/plan-keys.test.js
+++ b/services/core-api/test/plan-keys.test.js
@@ -29,6 +29,8 @@ describe('plan keys of a funnel', () => {
     paddle.price(PRICE_W1);
     ({ app, store } = await makeApp(db.pool, { paddle }));
     token = await tokenFor(db.pool, 'admin');
+    // Spec admin-console-p4a §2: an upload no longer creates the funnel; it exists (no app, as before 007).
+    await db.pool.query("INSERT INTO funnels (slug, created_by) VALUES ('aivideo', 'test')");
   });
   afterEach(() => app.close());
 
diff --git a/services/core-api/test/publish.test.js b/services/core-api/test/publish.test.js
index 70aec86..85677dd 100644
--- a/services/core-api/test/publish.test.js
+++ b/services/core-api/test/publish.test.js
@@ -17,6 +17,11 @@ describe('POST /v1/funnels/:slug/versions', () => {
     await resetDb(db.pool);
     ({ app, store } = await makeApp(db.pool));
     publisher = await tokenFor(db.pool, 'publisher');
+    // Spec admin-console-p4a §2: the first upload of a slug names its app (kind web: no get-app lint warning).
+    await db.pool.query(
+      `INSERT INTO apps (id, name, kind, return_url, api_key_hash)
+       VALUES ('tarot-web', 'Tarot Web', 'web', 'https://tarot.example/welcome', 'h1')`,
+    );
   });
   afterEach(() => app.close());
 
@@ -25,7 +30,7 @@ describe('POST /v1/funnels/:slug/versions', () => {
       method: 'POST',
       url: `/v1/funnels/${slug}/versions`,
       headers: bearer(token),
-      payload: { html, sha256: hash, lint_report: { lint: 'pass', smoke: 'pass' } },
+      payload: { html, sha256: hash, lint_report: { lint: 'pass', smoke: 'pass' }, app_id: 'tarot-web' },
     });
   const count = async (table) => (await db.pool.query(`SELECT count(*)::int AS n FROM ${table}`)).rows[0].n;
 
diff --git a/services/core-api/test/sessions.test.js b/services/core-api/test/sessions.test.js
index 28e1a04..2ba8aef 100644
--- a/services/core-api/test/sessions.test.js
+++ b/services/core-api/test/sessions.test.js
@@ -107,6 +107,8 @@ describe('admin console sessions, CSRF and roles', () => {
 
   it('a person is the actor: created_by, route updated_by and the audit row carry the email, kind user', async () => {
     const boss = await signIn(db.pool, 'boss@ikameglobal.com', 'admin');
+    // Spec admin-console-p4a §2: an upload no longer creates the funnel; it exists (no app, as before 007).
+    await db.pool.query("INSERT INTO funnels (slug, created_by) VALUES ('aivideo', 'test')");
     const html = funnelHtml('aivideo', 'one');
     await app.inject({ method: 'POST', url: '/v1/funnels/aivideo/versions', headers: boss.headers(), payload: { html, sha256: sha(html) } });
     await app.inject({ method: 'PUT', url: '/v1/routes/a.example.com', headers: boss.headers(), payload: { prefix: '/', funnel: 'aivideo', v: 1 } });
diff --git a/services/core-api/test/upload-lint.test.js b/services/core-api/test/upload-lint.test.js
index e218d55..579be06 100644
--- a/services/core-api/test/upload-lint.test.js
+++ b/services/core-api/test/upload-lint.test.js
@@ -23,6 +23,8 @@ describe('server lint on upload and publish checks (spec admin-console-p1 §3, 
     admin = await tokenFor(db.pool, 'admin');
     await db.pool.query("INSERT INTO domains (host, status) VALUES ('a.example.com', 'active'), ('off.example.com', 'disabled')");
     await db.pool.query("INSERT INTO host_revs (host) VALUES ('a.example.com'), ('off.example.com')");
+    // Spec admin-console-p4a §2: an upload no longer creates the funnel; it exists (no app, as before 007).
+    await db.pool.query("INSERT INTO funnels (slug, created_by) VALUES ('aivideo', 'test')");
   });
   afterEach(() => app.close());
 
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/funnels-app.test.js
```

Expected: `Tests  8 failed | 1 passed (9)`: 8 test mới fail — `POST /v1/funnels` không có `app_id` vẫn tạo funnel (201 thay vì `400 app_required`), upload slug mới không `app_id` vẫn tạo funnel, không có `funnel_app_mismatch`, upload kèm `app_id` lên funnel chưa gán không gán app (không có `funnel.app`, không queue recompute), lint không thấy kind của app ở lần upload đầu, `PUT {app_id: null}` vẫn gỡ app, audit `version.upload`/`funnel.pixel` có `app_id` null, `GET /v1/funnels?app=` không lọc (và `?app=BAD!` trả 200). Test "a funnel without an app (from before 007) keeps taking uploads without app_id" đã pass (hành vi cũ giữ nguyên).

- [ ] **Step 3: Implement**

`services/core-api/src/identity/apps.js`, `services/core-api/src/publisher/catalog.js`, `services/core-api/src/publisher/publish.js`, `services/core-api/src/publisher/funnels.js` (sửa, áp dụng đúng diff này):

`services/core-api/src/identity/apps.js`, `services/core-api/src/publisher/catalog.js`, `services/core-api/src/publisher/publish.js`, `services/core-api/src/publisher/funnels.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/identity/apps.js b/services/core-api/src/identity/apps.js
index b4d3485..9ac2c7a 100644
--- a/services/core-api/src/identity/apps.js
+++ b/services/core-api/src/identity/apps.js
@@ -165,15 +165,21 @@ export async function setFunnelApp(pool, { slug, appId, actor }) {
     const { rows } = await c.query('SELECT id, app_id FROM funnels WHERE slug = $1 FOR NO KEY UPDATE', [slug]);
     if (!rows.length) throw new HttpError(404, 'funnel_not_found', { funnel: slug });
     if (rows[0].app_id === appId) return { funnel: slug, app_id: appId };
-    try {
-      await c.query('UPDATE funnels SET app_id = $2 WHERE id = $1', [rows[0].id, appId]);
-    } catch (err) {
-      if (err.code === '23503') throw new HttpError(404, 'app_not_found', { app_id: appId });
-      throw err;
-    }
-    await queueFunnelRecompute(c, rows[0].id);
-    // Spec admin-console-p4a §2: the row belongs to the app the funnel moved to.
-    await audit(c, actor, 'funnel.app', `funnel:${slug}`, { slug, app_id: appId }, { app_id: appId });
+    await assignFunnelApp(c, { funnelId: rows[0].id, slug, appId, actor });
     return { funnel: slug, app_id: appId };
   });
 }
+
+// The app change itself, inside the caller's transaction with the funnel row locked: PUT /v1/funnels/:slug, and
+// an upload with app_id onto a funnel that has no app yet (spec admin-console-p4a §2, coordinator ruling).
+export async function assignFunnelApp(c, { funnelId, slug, appId, actor }) {
+  try {
+    await c.query('UPDATE funnels SET app_id = $2 WHERE id = $1', [funnelId, appId]);
+  } catch (err) {
+    if (err.code === '23503') throw new HttpError(404, 'app_not_found', { app_id: appId });
+    throw err;
+  }
+  await queueFunnelRecompute(c, funnelId);
+  // Spec admin-console-p4a §2: the row belongs to the app the funnel moved to.
+  await audit(c, actor, 'funnel.app', `funnel:${slug}`, { slug, app_id: appId }, { app_id: appId });
+}
diff --git a/services/core-api/src/publisher/catalog.js b/services/core-api/src/publisher/catalog.js
index 5a984d6..93d6c2e 100644
--- a/services/core-api/src/publisher/catalog.js
+++ b/services/core-api/src/publisher/catalog.js
@@ -1,5 +1,5 @@
 // Read side of the admin console (spec admin-console-p1 §3): funnels, their versions and where they are live, domains.
-import { audit } from '../audit.js';
+import { actorOf, audit } from '../audit.js';
 import { HttpError } from '../errors.js';
 import { withTx } from '../identity/link.js';
 
@@ -21,7 +21,8 @@ async function liveByFunnel(db) {
 }
 
 // Newest change first: a new version, a route change or the funnel's creation.
-export async function listFunnels(pool) {
+// app (spec admin-console-p4a §2): only that app's funnels; 'none' = the ones with no app yet.
+export async function listFunnels(pool, { app = null } = {}) {
   const { rows } = await pool.query(
     `SELECT f.id, f.slug, f.pixel_id, f.app_id, lv.n AS latest_v,
             GREATEST(f.created_at, lv.created_at, lr.updated_at) AS updated_at
@@ -30,7 +31,9 @@ export async function listFunnels(pool) {
        LEFT JOIN LATERAL (
          SELECT max(r.updated_at) AS updated_at FROM routes r JOIN versions v ON v.id = r.version_id WHERE v.funnel_id = f.id
        ) lr ON true
+      WHERE $1::text IS NULL OR ($1 = 'none' AND f.app_id IS NULL) OR f.app_id = $1
       ORDER BY updated_at DESC, f.slug`,
+    [app],
   );
   const live = await liveByFunnel(pool);
   return rows.map((r) => ({
@@ -86,15 +89,29 @@ async function liveWithPrevious(pool, funnelId) {
   return rows.map((r) => ({ host: r.host, prefix: r.prefix, v: r.v, previous: r.prev_v ? { slug: r.prev_slug, v: r.prev_v } : null }));
 }
 
+// A new funnel in an app (spec admin-console-p4a §2), audited in the caller's transaction. Returns the new id,
+// or null when the slug exists (the caller decides: 409 for POST /v1/funnels, the existing row for an upload).
+export async function insertFunnel(c, { slug, appId, actor }) {
+  const who = actorOf(actor);
+  let rows;
+  try {
+    ({ rows } = await c.query(
+      'INSERT INTO funnels (slug, app_id, created_by) VALUES ($1, $2, $3) ON CONFLICT (slug) DO NOTHING RETURNING id',
+      [slug, appId, who.name],
+    ));
+  } catch (err) {
+    if (err.code === '23503') throw new HttpError(404, 'app_not_found', { app_id: appId });
+    throw err;
+  }
+  if (!rows.length) return null;
+  await audit(c, who, 'funnel.create', `funnel:${slug}`, { slug, app_id: appId }, { app_id: appId });
+  return rows[0].id;
+}
+
 // An empty funnel (no version yet), so an editor can start from the web.
-export async function createFunnel(pool, { slug, actor }) {
+export async function createFunnel(pool, { slug, appId, actor }) {
   await withTx(pool, async (c) => {
-    const { rows } = await c.query(
-      'INSERT INTO funnels (slug, created_by) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING RETURNING id',
-      [slug, actor.name],
-    );
-    if (!rows.length) throw new HttpError(409, 'funnel_exists', { funnel: slug });
-    await audit(c, actor, 'funnel.create', `funnel:${slug}`, { slug });
+    if ((await insertFunnel(c, { slug, appId, actor })) === null) throw new HttpError(409, 'funnel_exists', { funnel: slug });
   });
 }
 
diff --git a/services/core-api/src/publisher/funnels.js b/services/core-api/src/publisher/funnels.js
index 37b25f9..9bff9a3 100644
--- a/services/core-api/src/publisher/funnels.js
+++ b/services/core-api/src/publisher/funnels.js
@@ -12,9 +12,10 @@ export async function setFunnelPixel(pool, kv, { slug, pixelId, actor, log }) {
   let hosts;
   try {
     await c.query('BEGIN');
-    const f = await c.query('UPDATE funnels SET pixel_id = $2 WHERE slug = $1 RETURNING id', [slug, pixelId]);
+    const f = await c.query('UPDATE funnels SET pixel_id = $2 WHERE slug = $1 RETURNING id, app_id', [slug, pixelId]);
     if (!f.rows.length) throw new HttpError(404, 'funnel_not_found', { funnel: slug });
-    await audit(c, actor, 'funnel.pixel', `funnel:${slug}`, { slug, pixel_id: pixelId });
+    // Spec admin-console-p4a §2 "Audit": the row belongs to the funnel's app.
+    await audit(c, actor, 'funnel.pixel', `funnel:${slug}`, { slug, pixel_id: pixelId }, { app_id: f.rows[0].app_id });
     hosts = (
       await c.query(
         `SELECT DISTINCT r.host FROM routes r JOIN versions v ON v.id = r.version_id
diff --git a/services/core-api/src/publisher/publish.js b/services/core-api/src/publisher/publish.js
index 9f52982..3f88f89 100644
--- a/services/core-api/src/publisher/publish.js
+++ b/services/core-api/src/publisher/publish.js
@@ -1,7 +1,9 @@
 import { createHash } from 'node:crypto';
 import { actorOf, audit } from '../audit.js';
 import { HttpError } from '../errors.js';
+import { assignFunnelApp } from '../identity/apps.js';
 import { StoreUnavailableError } from './bundle-store.js';
+import { insertFunnel } from './catalog.js';
 
 export const sha256Hex = (s) => createHash('sha256').update(s).digest('hex');
 export const bundleKey = (slug, n) => `bundles/${slug}/v${n}/index.html`;
@@ -11,17 +13,45 @@ export const lintCounts = (r) => ({
   warnings: Array.isArray(r?.warnings) ? r.warnings.length : 0,
 });
 
+// Spec admin-console-p4a §2: which funnel an upload may land in. row = the funnel's {app_id}, undefined when
+// the slug is new. A new slug needs an app; a funnel with no app yet takes appId (coordinator ruling: the first
+// `ikf publish --app` assigns a legacy funnel); a funnel with an app keeps it (moving it is PUT /v1/funnels/:slug).
+// An upload without app_id goes to an existing funnel as before (ikf publish of existing slugs).
+export function checkUploadApp(slug, row, appId) {
+  if (!row) {
+    if (!appId) throw new HttpError(400, 'app_required', { funnel: slug });
+    return;
+  }
+  if (appId && row.app_id !== null && row.app_id !== appId) throw new HttpError(409, 'funnel_app_mismatch', { app_id: row.app_id });
+}
+
 // planKeys: the HTML's plan keys (versions.plan_keys, spec admin-console-p2 §1), null when not read.
-export async function publishVersion({ pool, store, previewBaseUrl }, { slug, html, lintReport = {}, planKeys = null, actor }) {
+// appId: the app a new slug is created in (same transaction as its first version); checked against an existing one.
+export async function publishVersion(
+  { pool, store, previewBaseUrl },
+  { slug, html, lintReport = {}, planKeys = null, appId = null, actor },
+) {
   const who = actorOf(actor);
   const sha256 = sha256Hex(html);
   const result = (v, created) => ({ funnel: slug, v, sha256, created, previewUrl: `${previewBaseUrl}/${slug}/v${v}` });
   const client = await pool.connect();
   try {
     await client.query('BEGIN');
-    await client.query('INSERT INTO funnels (slug, created_by) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING', [slug, who.name]);
     // The row lock serializes publishes of one funnel: n is allocated once and no two R2 writes race.
-    const funnelId = (await client.query('SELECT id FROM funnels WHERE slug = $1 FOR UPDATE', [slug])).rows[0].id;
+    const lockFunnel = async () => (await client.query('SELECT id, app_id FROM funnels WHERE slug = $1 FOR UPDATE', [slug])).rows[0];
+    let funnel = await lockFunnel();
+    if (!funnel) {
+      checkUploadApp(slug, funnel, appId);
+      // A concurrent first upload may win the insert (null): lock its row and check its app like any other.
+      const id = await insertFunnel(client, { slug, appId, actor: who });
+      funnel = id === null ? await lockFunnel() : { id, app_id: appId };
+    }
+    checkUploadApp(slug, funnel, appId);
+    if (appId && funnel.app_id === null) {
+      await assignFunnelApp(client, { funnelId: funnel.id, slug, appId, actor: who });
+      funnel = { ...funnel, app_id: appId };
+    }
+    const funnelId = funnel.id;
     const latest = (
       await client.query('SELECT id, n, sha256 FROM versions WHERE funnel_id = $1 ORDER BY n DESC LIMIT 1', [funnelId])
     ).rows[0];
@@ -45,7 +75,7 @@ export async function publishVersion({ pool, store, previewBaseUrl }, { slug, ht
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
       [funnelId, n, sha256, key, Buffer.byteLength(html, 'utf8'), lintReport, who.name, planKeys],
     );
-    await audit(client, who, 'version.upload', `funnel:${slug}`, { slug, v: n, sha256, lint: lintCounts(lintReport) });
+    await audit(client, who, 'version.upload', `funnel:${slug}`, { slug, v: n, sha256, lint: lintCounts(lintReport) }, { app_id: funnel.app_id });
     await client.query('COMMIT');
     return result(n, true);
   } catch (err) {
PATCH
```

`services/core-api/src/http/catalog.js`, `services/core-api/src/http/versions.js`, `services/core-api/src/http/funnels.js` (sửa, áp dụng đúng diff này):

`services/core-api/src/http/catalog.js`, `services/core-api/src/http/versions.js`, `services/core-api/src/http/funnels.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/http/catalog.js b/services/core-api/src/http/catalog.js
index 6c78032..0601162 100644
--- a/services/core-api/src/http/catalog.js
+++ b/services/core-api/src/http/catalog.js
@@ -1,24 +1,43 @@
 import { listAudit } from '../audit.js';
 import { requireRole } from '../auth.js';
+import { HttpError } from '../errors.js';
 import { createFunnel, funnelDetail, listDomains, listFunnels } from '../publisher/catalog.js';
 
 const SLUG = { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{1,62}$' };
 const slugParams = { type: 'object', required: ['slug'], properties: { slug: SLUG } };
+const APP_ID = { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{1,30}$' };
 
 // Admin console reads (any signed-in person or token) and funnel creation (spec admin-console-p1 §3).
 export default async function catalogHttp(app, { pool, previewBaseUrl = null }) {
   const viewer = requireRole(pool, 'viewer');
 
-  app.get('/v1/funnels', { onRequest: viewer }, async () => ({ funnels: await listFunnels(pool) }));
+  app.get(
+    '/v1/funnels',
+    {
+      onRequest: viewer,
+      schema: {
+        querystring: {
+          type: 'object',
+          additionalProperties: false,
+          // Spec admin-console-p4a §2: one app's funnels; 'none' = not assigned yet.
+          properties: { app: { type: 'string', pattern: '^(none|[a-z0-9][a-z0-9-]{1,30})$' } },
+        },
+      },
+    },
+    async (req) => ({ funnels: await listFunnels(pool, { app: req.query.app ?? null }) }),
+  );
 
   app.post(
     '/v1/funnels',
     {
       onRequest: requireRole(pool, ['editor', 'publisher']),
-      schema: { body: { type: 'object', required: ['slug'], additionalProperties: false, properties: { slug: SLUG } } },
+      // app_id is checked in the handler, not by `required`: a schema miss answers bad_request, and the spec wants
+      // app_required (spec admin-console-p4a §2, decision #1).
+      schema: { body: { type: 'object', required: ['slug'], additionalProperties: false, properties: { slug: SLUG, app_id: APP_ID } } },
     },
     async (req, reply) => {
-      await createFunnel(pool, { slug: req.body.slug, actor: req.actor });
+      if (!req.body.app_id) throw new HttpError(400, 'app_required');
+      await createFunnel(pool, { slug: req.body.slug, appId: req.body.app_id, actor: req.actor });
       reply.code(201);
       return funnelDetail(pool, req.body.slug, previewBaseUrl);
     },
diff --git a/services/core-api/src/http/funnels.js b/services/core-api/src/http/funnels.js
index df3c3fc..19c3c0b 100644
--- a/services/core-api/src/http/funnels.js
+++ b/services/core-api/src/http/funnels.js
@@ -19,7 +19,8 @@ export default async function funnelsHttp(app, { pool, kv }) {
           type: 'object',
           properties: {
             pixel_id: { type: ['string', 'null'] },
-            // const null, not type null: Ajv type coercion would turn "" into null and unlink the app.
+            // const null, not type null: Ajv type coercion would turn "" into null. null itself is refused by the
+            // handler with app_required (spec admin-console-p4a decision #5: a funnel is never moved back to no app).
             app_id: { anyOf: [{ const: null }, { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{1,30}$' }] },
           },
         },
@@ -28,6 +29,7 @@ export default async function funnelsHttp(app, { pool, kv }) {
     async (req) => {
       const has = (k) => Object.hasOwn(req.body, k);
       if (!has('pixel_id') && !has('app_id')) throw new HttpError(400, 'bad_request', 'pixel_id or app_id required');
+      if (has('app_id') && req.body.app_id === null) throw new HttpError(400, 'app_required', { funnel: req.params.slug });
       const out = { funnel: req.params.slug };
       if (has('app_id')) Object.assign(out, await setFunnelApp(pool, { slug: req.params.slug, appId: req.body.app_id, actor: req.actor }));
       if (has('pixel_id')) {
diff --git a/services/core-api/src/http/versions.js b/services/core-api/src/http/versions.js
index f96c1a7..d2809ba 100644
--- a/services/core-api/src/http/versions.js
+++ b/services/core-api/src/http/versions.js
@@ -2,16 +2,25 @@ import { lint, planKeysFromHtml } from '@ikf/funnel-lint';
 import { requireRole } from '../auth.js';
 import { PLAN_KEY_RE } from '../billing/prices.js';
 import { HttpError } from '../errors.js';
-import { publishVersion, sha256Hex } from '../publisher/publish.js';
+import { checkUploadApp, publishVersion, sha256Hex } from '../publisher/publish.js';
 import { validateBundle } from '../publisher/validate.js';
 
 // The same bound as PUT /v1/funnels/:slug/prices (maxProperties): more keys than a price map can hold are noise.
 const MAX_PLAN_KEYS = 50;
 
-// 'app' | 'web' for a funnel attached to an app (no_get_app_hook applies to 'app'), else null.
-async function funnelAppKind(pool, slug) {
-  const { rows } = await pool.query('SELECT a.kind FROM funnels f JOIN apps a ON a.id = f.app_id WHERE f.slug = $1', [slug]);
-  return rows[0]?.kind ?? null;
+// The kind ('app' | 'web') of the app the upload lands in, for lint (no_get_app_hook applies to 'app'); null for a
+// funnel with no app. Spec admin-console-p4a §2: a new slug, or a funnel with no app yet, takes appId's app (so lint
+// sees its kind on that upload); a funnel with an app keeps its own; the app rules fail here, before lint, and again
+// under the row lock.
+async function uploadAppKind(pool, slug, appId) {
+  const funnel = (
+    await pool.query('SELECT f.app_id, a.kind FROM funnels f LEFT JOIN apps a ON a.id = f.app_id WHERE f.slug = $1', [slug])
+  ).rows[0];
+  checkUploadApp(slug, funnel, appId);
+  if (funnel?.app_id || !appId) return funnel?.kind ?? null;
+  const app = (await pool.query('SELECT kind FROM apps WHERE id = $1', [appId])).rows[0];
+  if (!app) throw new HttpError(404, 'app_not_found', { app_id: appId });
+  return app.kind;
 }
 
 export default async function versionsHttp(app, { pool, store, mediaOrigins, previewBaseUrl }) {
@@ -33,16 +42,19 @@ export default async function versionsHttp(app, { pool, store, mediaOrigins, pre
             html: { type: 'string', minLength: 1 },
             sha256: { type: 'string', pattern: '^[0-9a-f]{64}$' },
             lint_report: { type: 'object' },
+            // Spec admin-console-p4a §2: required (handler, 400 app_required) only when the slug is new.
+            app_id: { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{1,30}$' },
           },
         },
       },
     },
     async (req, reply) => {
       const { slug } = req.params;
-      const { html, sha256, lint_report: clientReport } = req.body;
+      const { html, sha256, lint_report: clientReport, app_id: appId = null } = req.body;
       if (sha256Hex(html) !== sha256) throw new HttpError(400, 'sha256_mismatch');
+      const kind = await uploadAppKind(pool, slug, appId);
       // Server lint on every upload, CLI or web (spec admin-console-p1 §4); errors create no version.
-      const report = lint(html, { slug, app: await funnelAppKind(pool, slug), mediaOrigins });
+      const report = lint(html, { slug, app: kind, mediaOrigins });
       if (report.errors.length) throw new HttpError(422, 'lint_failed', report);
       // Which plans the page sells (spec admin-console-p2 §1): the console's Prices tab shows the unmapped ones.
       // Only keys a price map could ever hold (PLAN_KEY_RE of billing/prices.js), at most MAX_PLAN_KEYS.
@@ -50,7 +62,7 @@ export default async function versionsHttp(app, { pool, store, mediaOrigins, pre
       const check = validateBundle(html, { slug, mediaOrigins });
       if (!check.ok) throw new HttpError(check.status, check.errors[0].code, check.errors);
       const lintReport = { ...report, ...(clientReport && { client: clientReport }) };
-      const r = await publishVersion({ pool, store, previewBaseUrl }, { slug, html, lintReport, planKeys, actor: req.actor });
+      const r = await publishVersion({ pool, store, previewBaseUrl }, { slug, html, lintReport, planKeys, appId, actor: req.actor });
       reply.code(r.created ? 201 : 200);
       return { funnel: r.funnel, v: r.v, sha256: r.sha256, created: r.created, preview_url: r.previewUrl };
     },
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/funnels-app.test.js test/audit.test.js test/plan-keys.test.js test/upload-lint.test.js test/sessions.test.js test/publish.test.js test/catalog.test.js test/funnel-app.test.js
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: file mới `Tests  9 passed (9)`; toàn bộ core-api `Test Files  61 passed (61)`, `Tests  571 passed (571)`. (Test của `packages/cli` và `demo/` có thể fail từ đây vì upload slug mới cần `app_id` — Task 7 và Task 12 sửa.)

- [ ] **Step 5: Commit**

```bash
git add services/core-api/src/http/catalog.js services/core-api/src/http/funnels.js services/core-api/src/http/versions.js services/core-api/src/identity/apps.js services/core-api/src/publisher/catalog.js services/core-api/src/publisher/funnels.js services/core-api/src/publisher/publish.js services/core-api/test/funnels-app.test.js services/core-api/test/helpers/app.js services/core-api/test/audit.test.js services/core-api/test/catalog.test.js services/core-api/test/funnel-app.test.js services/core-api/test/plan-keys.test.js services/core-api/test/publish.test.js services/core-api/test/sessions.test.js services/core-api/test/upload-lint.test.js
git commit -m "feat(core-api): funnels require an app (create, first upload, no unassign); GET /v1/funnels?app=
```

---

---

### Task 3: Domain thuộc app — `PUT /v1/domains/:host {status?, app_id?}`, `GET /v1/domains?app=`, publish chặn `domain_app_mismatch`

**Files:**
- Create: `services/core-api/src/publisher/domains.js`
- Modify: `services/core-api/src/http/domains.js`, `services/core-api/src/http/catalog.js`, `services/core-api/src/publisher/catalog.js`, `services/core-api/src/publisher/routes.js`
- Test: `services/core-api/test/domains-app.test.js` (mới), `services/core-api/test/routes-app.test.js` (mới; cả hai Postgres Testcontainers + fake KV của `test/helpers/app.js`); sửa assertion hình dạng ở `services/core-api/test/catalog.test.js` (dòng `GET /v1/domains` thêm `app_id: null`, `details` của `domain.sync` thêm `app_id: null`) và `services/core-api/test/audit.test.js` (`details` của `domain.sync` thêm `app_id: null`)

**Interfaces:**
- Consumes: `audit(db, actor, action, target, details, { app_id })` và `actorOf` (Task 1, `src/audit.js`), `withTx` (`src/identity/link.js`), `HttpError`, `requireRole(pool, 'admin' | 'viewer' | 'router')`, `hostParams` (`src/http/schemas.js`), cột `domains.app_id` (Task 1, migration 007), `funnels.app_id`; test helpers `startDb`, `resetDb`, `makeApp`, `tokenFor`, `bearer`, `seedVersions` (Task 2: tạo dòng funnel không app), `seedApp`, `APP_BODY`.
- Produces:
  - `setDomain(pool, { host, status, appId, actor })` (`src/publisher/domains.js`, mới; SQL trước đây nằm inline trong `src/http/domains.js`): `status`/`appId` `undefined` = giữ nguyên, `appId: null` = dùng chung. Trong `withTx`: `appId` khác null mà app không có → `404 app_not_found {app_id}`; `INSERT … ON CONFLICT DO NOTHING` (host mới: `status 'active'`, dùng chung), khoá dòng `domains FOR UPDATE` (cùng khoá với `inHostTx` của routes); `appId` khác null và có route live của funnel có `app_id IS DISTINCT FROM appId` (funnel chưa gán cũng tính) → `409 domain_has_foreign_routes {routes: [{prefix, slug, app_id}]}` (theo `prefix`); cập nhật, giữ `INSERT host_revs … DO NOTHING`, audit `domain.sync {host, status, app_id}` với cột `app_id` = app của domain sau thay đổi; trả `{host, status, app_id}`.
  - `PUT /v1/domains/:host` (admin) body `{status?: 'active'|'disabled', app_id?: string|null}` (`additionalProperties: false`, `app_id` = `anyOf [const null, pattern ^[a-z0-9][a-z0-9-]{1,30}$]`); thiếu cả hai → `400 bad_request` (kiểm trong handler như `PUT /v1/funnels/:slug`); luôn `200 {host, status, app_id}`.
  - `listDomains(pool, { app } = {})` (`src/publisher/catalog.js`): mỗi dòng thêm `app_id`; `app` = id → `app_id = id OR app_id IS NULL`; `'none'` → chỉ `app_id IS NULL`; không có → tất cả.
  - `GET /v1/domains?app=<id>|none` (pattern `^(none|[a-z0-9][a-z0-9-]{1,30})$`, sai → `400 bad_request`).
  - `setRoute`: sau các kiểm cũ (domain có/active, prefix, version, lint, xác nhận đổi funnel) → `domains.app_id` khác null và khác `funnels.app_id` (null tính là khác) → `409 domain_app_mismatch {host_app, funnel_app}`. `inHostTx` truyền dòng domain đã khoá (`{status, app_id}`) làm đối số thứ hai của `fn`. Rollback / delete / sync không kiểm.
  - Audit `route.publish` / `route.rollback` / `route.delete` ghi cột `app_id` = app của funnel được publish / được quay về / của route bị xoá. `GET /v1/routes/:host` không đổi.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/domains-app.test.js`, `services/core-api/test/routes-app.test.js` (mới):

`services/core-api/test/domains-app.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, tokenFor, bearer, seedVersions } from './helpers/app.js';
import { APP_BODY, seedApp } from './helpers/identity.js';

const CHATCHI = { ...APP_BODY, id: 'chatchi', name: 'ChatChi', deeplink_scheme: 'chatchi', webhook_url: 'https://be.chatchi.example/ikf/webhook' };

// Spec admin-console-p4a §2 "Domain và publish", decision #3: a domain belongs to one app or is shared (NULL);
// PUT /v1/domains/:host {status?, app_id?}, 409 domain_has_foreign_routes, GET /v1/domains?app=.
describe('domains belong to an app', () => {
  let db;
  let app;
  let store;
  let admin;

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    ({ app, store } = await makeApp(db.pool));
    admin = await tokenFor(db.pool, 'admin');
    await seedApp(db.pool); // starlyn
    await seedApp(db.pool, undefined, CHATCHI);
  });
  afterEach(() => app.close());

  const call = (method, url, payload) => app.inject({ method, url, headers: bearer(admin), ...(payload !== undefined && { payload }) });
  const putDomain = (host, body) => call('PUT', `/v1/domains/${host}`, body);
  const publish = (host, prefix, funnel) => call('PUT', `/v1/routes/${host}`, { prefix, funnel, v: 1 });
  const funnelIn = async (slug, appId) => {
    await seedVersions(db.pool, store, slug, 1);
    await db.pool.query('UPDATE funnels SET app_id = $2 WHERE slug = $1', [slug, appId]);
  };
  const domainRow = async (host) => (await db.pool.query('SELECT status, app_id FROM domains WHERE host = $1', [host])).rows[0];
  const syncRows = async () =>
    (await db.pool.query("SELECT details, app_id FROM audit_log WHERE action = 'domain.sync' ORDER BY id")).rows;

  it('PUT {app_id} creates an active host of that app; {status} keeps the app; {app_id: null} makes it shared; audited', async () => {
    const created = await putDomain('a.example.com', { app_id: 'starlyn' });
    expect(created.statusCode).toBe(200);
    expect(created.json()).toEqual({ host: 'a.example.com', status: 'active', app_id: 'starlyn' });
    expect((await db.pool.query("SELECT rev::int FROM host_revs WHERE host = 'a.example.com'")).rows).toEqual([{ rev: 0 }]);

    expect((await putDomain('a.example.com', { status: 'disabled' })).json()).toEqual({
      host: 'a.example.com', status: 'disabled', app_id: 'starlyn',
    });
    expect((await putDomain('a.example.com', { app_id: null })).json()).toEqual({ host: 'a.example.com', status: 'disabled', app_id: null });
    expect(await domainRow('a.example.com')).toEqual({ status: 'disabled', app_id: null });
    expect((await putDomain('a.example.com', { status: 'active', app_id: 'chatchi' })).json()).toEqual({
      host: 'a.example.com', status: 'active', app_id: 'chatchi',
    });

    expect(await syncRows()).toEqual([
      { details: { host: 'a.example.com', status: 'active', app_id: 'starlyn' }, app_id: 'starlyn' },
      { details: { host: 'a.example.com', status: 'disabled', app_id: 'starlyn' }, app_id: 'starlyn' },
      { details: { host: 'a.example.com', status: 'disabled', app_id: null }, app_id: null },
      { details: { host: 'a.example.com', status: 'active', app_id: 'chatchi' }, app_id: 'chatchi' },
    ]);
  });

  it('400 without status or app_id (or with a bad value); 404 app_not_found for an unknown app, nothing written', async () => {
    for (const body of [{}, { foo: 1 }, { app_id: '' }, { app_id: 'Bad App' }, { status: 'gone' }]) {
      const res = await putDomain('a.example.com', body);
      expect(res.statusCode, JSON.stringify(body)).toBe(400);
      expect(res.json().error).toBe('bad_request');
    }
    const unknown = await putDomain('a.example.com', { app_id: 'nope' });
    expect(unknown.statusCode).toBe(404);
    expect(unknown.json()).toEqual({ error: 'app_not_found', detail: { app_id: 'nope' } });
    expect(await domainRow('a.example.com')).toBeUndefined();
    expect(await syncRows()).toEqual([]);
  });

  it('409 domain_has_foreign_routes while a live route serves another app\'s funnel or an unassigned one', async () => {
    await putDomain('a.example.com', { status: 'active' });
    await funnelIn('moon', 'chatchi');
    await funnelIn('loose', null);
    await funnelIn('star', 'starlyn');
    for (const [prefix, slug] of [['/', 'moon'], ['/l', 'loose'], ['/s', 'star']]) {
      expect((await publish('a.example.com', prefix, slug)).statusCode).toBe(200);
    }

    const res = await putDomain('a.example.com', { app_id: 'starlyn' });
    expect(res.statusCode).toBe(409);
    expect(res.json()).toEqual({
      error: 'domain_has_foreign_routes',
      detail: { routes: [{ prefix: '/', slug: 'moon', app_id: 'chatchi' }, { prefix: '/l', slug: 'loose', app_id: null }] },
    });
    expect(await domainRow('a.example.com')).toEqual({ status: 'active', app_id: null });

    for (const prefix of ['/', '/l']) {
      expect((await call('DELETE', `/v1/routes/a.example.com?prefix=${encodeURIComponent(prefix)}`)).statusCode).toBe(200);
    }
    expect((await putDomain('a.example.com', { app_id: 'starlyn' })).json()).toEqual({
      host: 'a.example.com', status: 'active', app_id: 'starlyn',
    });
    // Making a host shared is never blocked.
    expect((await putDomain('a.example.com', { app_id: null })).statusCode).toBe(200);
  });

  it('GET /v1/domains: each row has app_id; ?app=<id> = that app\'s hosts and the shared ones; ?app=none = shared only', async () => {
    await putDomain('a.example.com', { app_id: 'starlyn' });
    await putDomain('b.example.com', { app_id: 'chatchi' });
    await putDomain('c.example.com', { status: 'active' });
    const hosts = async (qs) => (await call('GET', `/v1/domains${qs}`)).json().domains.map((d) => [d.host, d.app_id]);

    expect((await call('GET', '/v1/domains')).json().domains[0]).toEqual({
      host: 'a.example.com', status: 'active', app_id: 'starlyn', rev: 0, kv_synced_rev: 0, routes: [],
    });
    expect(await hosts('')).toEqual([['a.example.com', 'starlyn'], ['b.example.com', 'chatchi'], ['c.example.com', null]]);
    expect(await hosts('?app=starlyn')).toEqual([['a.example.com', 'starlyn'], ['c.example.com', null]]);
    expect(await hosts('?app=none')).toEqual([['c.example.com', null]]);
    expect((await call('GET', '/v1/domains?app=Bad%20App')).statusCode).toBe(400);
  });
});
```

`services/core-api/test/routes-app.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, tokenFor, bearer, seedVersions } from './helpers/app.js';
import { APP_BODY, seedApp } from './helpers/identity.js';

const CHATCHI = { ...APP_BODY, id: 'chatchi', name: 'ChatChi', deeplink_scheme: 'chatchi', webhook_url: 'https://be.chatchi.example/ikf/webhook' };
const SHARED = 'shared.example.com';
const STAR = 'star.example.com';

// Spec admin-console-p4a §2 "Domain và publish": publish only onto the funnel's app's domain or a shared one
// (409 domain_app_mismatch); rollback / delete are not checked; route.* audit rows carry the funnel's app.
describe('publish respects the domain\'s app', () => {
  let db;
  let app;
  let store;
  let admin;
  let router;

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    ({ app, store } = await makeApp(db.pool));
    admin = await tokenFor(db.pool, 'admin');
    router = await tokenFor(db.pool, 'router');
    await seedApp(db.pool); // starlyn
    await seedApp(db.pool, undefined, CHATCHI);
    for (const [slug, appId] of [['star', 'starlyn'], ['moon', 'chatchi'], ['loose', null]]) {
      await seedVersions(db.pool, store, slug, 1);
      await db.pool.query('UPDATE funnels SET app_id = $2 WHERE slug = $1', [slug, appId]);
    }
    await putDomain(SHARED, { status: 'active' });
    await putDomain(STAR, { app_id: 'starlyn' });
  });
  afterEach(() => app.close());

  function putDomain(host, body) {
    return app.inject({ method: 'PUT', url: `/v1/domains/${host}`, headers: bearer(admin), payload: body });
  }
  const publish = (host, prefix, funnel, v = 1, extra = {}) =>
    app.inject({ method: 'PUT', url: `/v1/routes/${host}`, headers: bearer(router), payload: { prefix, funnel, v, ...extra } });
  const routeAudit = async () =>
    (await db.pool.query("SELECT action, target, app_id FROM audit_log WHERE action LIKE 'route.%' ORDER BY id")).rows;

  it('a shared host takes any funnel; an app\'s host takes only that app\'s funnels', async () => {
    for (const [prefix, slug] of [['/s', 'star'], ['/m', 'moon'], ['/l', 'loose']]) {
      expect((await publish(SHARED, prefix, slug)).statusCode, slug).toBe(200);
    }
    expect((await publish(STAR, '/', 'star')).statusCode).toBe(200);

    const other = await publish(STAR, '/m', 'moon');
    expect(other.statusCode).toBe(409);
    expect(other.json()).toEqual({ error: 'domain_app_mismatch', detail: { host_app: 'starlyn', funnel_app: 'chatchi' } });
    const loose = await publish(STAR, '/l', 'loose');
    expect(loose.statusCode).toBe(409);
    expect(loose.json()).toEqual({ error: 'domain_app_mismatch', detail: { host_app: 'starlyn', funnel_app: null } });

    // The check runs after the existing ones: an unknown version is still 404.
    expect((await publish(STAR, '/m', 'moon', 9)).json().error).toBe('version_not_found');
    expect((await db.pool.query('SELECT count(*)::int AS n FROM routes WHERE host = $1', [STAR])).rows[0].n).toBe(1);

    expect(await routeAudit()).toEqual([
      { action: 'route.publish', target: `route:${SHARED}/s`, app_id: 'starlyn' },
      { action: 'route.publish', target: `route:${SHARED}/m`, app_id: 'chatchi' },
      { action: 'route.publish', target: `route:${SHARED}/l`, app_id: null },
      { action: 'route.publish', target: `route:${STAR}/`, app_id: 'starlyn' },
    ]);
  });

  it('rollback and delete are not checked; their audit rows carry the restored / removed funnel\'s app', async () => {
    const HOST = 'x.example.com';
    await putDomain(HOST, { status: 'active' });
    expect((await publish(HOST, '/', 'moon')).statusCode).toBe(200);
    expect((await publish(HOST, '/', 'star', 1, { confirm_funnel_change: true })).statusCode).toBe(200);
    expect((await putDomain(HOST, { app_id: 'starlyn' })).statusCode).toBe(200);

    const back = await app.inject({ method: 'POST', url: `/v1/routes/${HOST}/rollback`, headers: bearer(router), payload: { prefix: '/' } });
    expect(back.statusCode).toBe(200);
    expect(back.json()).toMatchObject({ host: HOST, prefix: '/', funnel: 'moon', v: 1 });
    const gone = await app.inject({ method: 'DELETE', url: `/v1/routes/${HOST}?prefix=%2F`, headers: bearer(router) });
    expect(gone.statusCode).toBe(200);

    expect(await routeAudit()).toEqual([
      { action: 'route.publish', target: `route:${HOST}/`, app_id: 'chatchi' },
      { action: 'route.publish', target: `route:${HOST}/`, app_id: 'starlyn' },
      { action: 'route.rollback', target: `route:${HOST}/`, app_id: 'chatchi' },
      { action: 'route.delete', target: `route:${HOST}/`, app_id: 'chatchi' },
    ]);
  });

  it('GET /v1/routes/:host is unchanged', async () => {
    await publish(STAR, '/', 'star');
    const res = await app.inject({ method: 'GET', url: `/v1/routes/${STAR}`, headers: bearer(router) });
    expect(res.json()).toEqual({
      host: STAR, status: 'active', rev: 1, kv_synced_rev: 1,
      routes: [{ prefix: '/', funnel: 'star', v: 1, updated_by: 'router', updated_at: expect.any(String) }],
    });
  });
});
```

`services/core-api/test/catalog.test.js`, `services/core-api/test/audit.test.js` (sửa, áp dụng đúng diff này):

`services/core-api/test/catalog.test.js`, `services/core-api/test/audit.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/test/audit.test.js b/services/core-api/test/audit.test.js
index 50bdaca..7efe697 100644
--- a/services/core-api/test/audit.test.js
+++ b/services/core-api/test/audit.test.js
@@ -95,7 +95,7 @@ describe('audit log of changes', () => {
     await call('PUT', '/v1/funnels/aivideo', { app_id: 'starlyn' });
     await call('POST', '/v1/tokens', { name: 'ci', roles: ['publisher'] });
     expect((await rows()).map((r) => [r.action, r.target, r.details])).toEqual([
-      ['domain.sync', 'domain:b.example.com', { host: 'b.example.com', status: 'disabled' }],
+      ['domain.sync', 'domain:b.example.com', { host: 'b.example.com', status: 'disabled', app_id: null }],
       ['version.upload', 'funnel:aivideo', expect.objectContaining({ v: 1 })],
       ['funnel.pixel', 'funnel:aivideo', { slug: 'aivideo', pixel_id: '123456789' }],
       ['app.create', 'app:starlyn', { id: 'starlyn', kind: 'app' }],
diff --git a/services/core-api/test/catalog.test.js b/services/core-api/test/catalog.test.js
index 5f975cf..7a200ca 100644
--- a/services/core-api/test/catalog.test.js
+++ b/services/core-api/test/catalog.test.js
@@ -106,8 +106,8 @@ describe('admin console reads: funnels, domains, audit', () => {
     await publish('a.example.com', '/', 'aivideo', 1);
     expect((await get('/v1/domains')).json()).toEqual({
       domains: [
-        { host: 'a.example.com', status: 'active', rev: 1, kv_synced_rev: 1, routes: [{ prefix: '/', slug: 'aivideo', v: 1 }] },
-        { host: 'b.example.com', status: 'disabled', rev: 0, kv_synced_rev: 0, routes: [] },
+        { host: 'a.example.com', status: 'active', app_id: null, rev: 1, kv_synced_rev: 1, routes: [{ prefix: '/', slug: 'aivideo', v: 1 }] },
+        { host: 'b.example.com', status: 'disabled', app_id: null, rev: 0, kv_synced_rev: 0, routes: [] },
       ],
     });
   });
@@ -132,7 +132,7 @@ describe('admin console reads: funnels, domains, audit', () => {
     expect(page1.items).toHaveLength(4);
     expect(page1.items[0]).toEqual({
       id: 6, at: expect.any(String), actor: 'admin', actor_kind: 'token', action: 'domain.sync', target: 'domain:c.example.com',
-      details: { host: 'c.example.com', status: 'active' }, app_id: null,
+      details: { host: 'c.example.com', status: 'active', app_id: null }, app_id: null,
     });
     const page2 = (await get(`/v1/audit?limit=4&before=${page1.next_before}`)).json();
     expect(page2.items.map((i) => i.id)).toEqual([2, 1]);
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/domains-app.test.js test/routes-app.test.js test/catalog.test.js test/audit.test.js
```

Expected: `Test Files  4 failed (4)`, `Tests  10 failed | 10 passed (20)`: 4 test của `domains-app` fail vì `PUT /v1/domains` chưa nhận `app_id` (schema cũ bắt buộc `status` → 400) và `GET /v1/domains` chưa có `app_id`; 3 test của `routes-app` fail vì không gán được domain cho app ở `beforeEach` (`PUT {app_id}` → 400, `star.example.com` không tồn tại); `catalog.test.js` (`GET /v1/domains`, `GET /v1/audit`) và `audit.test.js` (`domain.sync …`) fail vì dòng domain / `details` của `domain.sync` chưa có `app_id`.

- [ ] **Step 3: Implement**

`services/core-api/src/publisher/domains.js` (mới):

`services/core-api/src/publisher/domains.js` (mới):

```js
// Domains (spec admin-console-p4a §2 "Domain và publish", decision #3): Terraform owns the list of hosts
// (scripts/sync-domains.sh sends {status}); an admin assigns a host to one app or makes it shared (app_id NULL).
import { actorOf, audit } from '../audit.js';
import { HttpError } from '../errors.js';
import { withTx } from '../identity/link.js';

// status / appId: undefined = leave as it is; appId null = shared. A new host starts 'active' and shared.
export async function setDomain(pool, { host, status, appId, actor }) {
  const who = actorOf(actor);
  return withTx(pool, async (c) => {
    if (appId) {
      const known = await c.query('SELECT 1 FROM apps WHERE id = $1', [appId]);
      if (!known.rows.length) throw new HttpError(404, 'app_not_found', { app_id: appId });
    }
    await c.query("INSERT INTO domains (host, status) VALUES ($1, 'active') ON CONFLICT (host) DO NOTHING", [host]);
    // The row lock serializes this with route changes on the host (routes.js inHostTx locks the same row), so no
    // foreign route can be published between the check below and the update.
    const cur = (await c.query('SELECT status, app_id FROM domains WHERE host = $1 FOR UPDATE', [host])).rows[0];
    if (appId) {
      // An unassigned funnel counts as foreign: it may only be live on a shared host (spec §2).
      const { rows } = await c.query(
        `SELECT r.path_prefix AS prefix, f.slug, f.app_id
           FROM routes r JOIN versions v ON v.id = r.version_id JOIN funnels f ON f.id = v.funnel_id
          WHERE r.host = $1 AND f.app_id IS DISTINCT FROM $2
          ORDER BY r.path_prefix`,
        [host, appId],
      );
      if (rows.length) throw new HttpError(409, 'domain_has_foreign_routes', { routes: rows });
    }
    const next = { host, status: status ?? cur.status, app_id: appId === undefined ? cur.app_id : appId };
    await c.query('UPDATE domains SET status = $2, app_id = $3 WHERE host = $1', [host, next.status, next.app_id]);
    await c.query('INSERT INTO host_revs (host) VALUES ($1) ON CONFLICT (host) DO NOTHING', [host]);
    await audit(c, who, 'domain.sync', `domain:${host}`, next, { app_id: next.app_id });
    return next;
  });
}
```

`services/core-api/src/http/domains.js`, `services/core-api/src/http/catalog.js`, `services/core-api/src/publisher/catalog.js`, `services/core-api/src/publisher/routes.js` (sửa, áp dụng đúng diff này):

`services/core-api/src/http/domains.js`, `services/core-api/src/http/catalog.js`, `services/core-api/src/publisher/catalog.js`, `services/core-api/src/publisher/routes.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/http/catalog.js b/services/core-api/src/http/catalog.js
index 0601162..cc17e54 100644
--- a/services/core-api/src/http/catalog.js
+++ b/services/core-api/src/http/catalog.js
@@ -47,7 +47,21 @@ export default async function catalogHttp(app, { pool, previewBaseUrl = null })
     funnelDetail(pool, req.params.slug, previewBaseUrl),
   );
 
-  app.get('/v1/domains', { onRequest: viewer }, async () => ({ domains: await listDomains(pool) }));
+  app.get(
+    '/v1/domains',
+    {
+      onRequest: viewer,
+      schema: {
+        querystring: {
+          type: 'object',
+          additionalProperties: false,
+          // Spec admin-console-p4a §2: an app's hosts plus the shared ones; 'none' = shared only.
+          properties: { app: { type: 'string', pattern: '^(none|[a-z0-9][a-z0-9-]{1,30})$' } },
+        },
+      },
+    },
+    async (req) => ({ domains: await listDomains(pool, { app: req.query.app ?? null }) }),
+  );
 
   app.get(
     '/v1/audit',
diff --git a/services/core-api/src/http/domains.js b/services/core-api/src/http/domains.js
index 097e26f..7fc1cc6 100644
--- a/services/core-api/src/http/domains.js
+++ b/services/core-api/src/http/domains.js
@@ -1,9 +1,10 @@
-import { audit } from '../audit.js';
 import { requireRole } from '../auth.js';
-import { withTx } from '../identity/link.js';
+import { HttpError } from '../errors.js';
+import { setDomain } from '../publisher/domains.js';
 import { hostParams } from './schemas.js';
 
-// Called by scripts/sync-domains.sh after terraform apply; Terraform owns the list of domains.
+// Called by scripts/sync-domains.sh after terraform apply ({status}; Terraform owns the list of domains), and by
+// an admin assigning a host to an app ({app_id}; null = shared) — spec admin-console-p4a §2 "Domain và publish".
 export default async function domainsHttp(app, { pool }) {
   app.put(
     '/v1/domains/:host',
@@ -11,21 +12,26 @@ export default async function domainsHttp(app, { pool }) {
       onRequest: requireRole(pool, 'admin'),
       schema: {
         params: hostParams,
-        body: { type: 'object', required: ['status'], properties: { status: { enum: ['active', 'disabled'] } } },
+        body: {
+          type: 'object',
+          additionalProperties: false,
+          properties: {
+            status: { enum: ['active', 'disabled'] },
+            // const null, not type null: Ajv type coercion would turn "" into null and unassign the host.
+            app_id: { anyOf: [{ const: null }, { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{1,30}$' }] },
+          },
+        },
       },
     },
     async (req) => {
-      const { host } = req.params;
-      const { status } = req.body;
-      await withTx(pool, async (c) => {
-        await c.query(
-          'INSERT INTO domains (host, status) VALUES ($1, $2) ON CONFLICT (host) DO UPDATE SET status = EXCLUDED.status',
-          [host, status],
-        );
-        await c.query('INSERT INTO host_revs (host) VALUES ($1) ON CONFLICT (host) DO NOTHING', [host]);
-        await audit(c, req.actor, 'domain.sync', `domain:${host}`, { host, status });
+      const has = (k) => Object.hasOwn(req.body, k);
+      if (!has('status') && !has('app_id')) throw new HttpError(400, 'bad_request', 'status or app_id required');
+      return setDomain(pool, {
+        host: req.params.host,
+        status: req.body.status,
+        appId: has('app_id') ? req.body.app_id : undefined,
+        actor: req.actor,
       });
-      return { host, status };
     },
   );
 }
diff --git a/services/core-api/src/publisher/catalog.js b/services/core-api/src/publisher/catalog.js
index 93d6c2e..4acf06d 100644
--- a/services/core-api/src/publisher/catalog.js
+++ b/services/core-api/src/publisher/catalog.js
@@ -115,9 +115,16 @@ export async function createFunnel(pool, { slug, appId, actor }) {
   });
 }
 
-export async function listDomains(pool) {
+// app (spec admin-console-p4a §2): the hosts a funnel of that app can go live on = the app's own and the shared
+// ones (app_id NULL); 'none' = shared only.
+export async function listDomains(pool, { app = null } = {}) {
   const domains = (
-    await pool.query('SELECT d.host, d.status, h.rev, h.kv_synced_rev FROM domains d JOIN host_revs h USING (host) ORDER BY d.host')
+    await pool.query(
+      `SELECT d.host, d.status, d.app_id, h.rev, h.kv_synced_rev FROM domains d JOIN host_revs h USING (host)
+        WHERE $1::text IS NULL OR d.app_id IS NULL OR d.app_id = $1
+        ORDER BY d.host`,
+      [app],
+    )
   ).rows;
   const routes = (
     await pool.query(
@@ -129,6 +136,7 @@ export async function listDomains(pool) {
   return domains.map((d) => ({
     host: d.host,
     status: d.status,
+    app_id: d.app_id,
     rev: Number(d.rev),
     kv_synced_rev: Number(d.kv_synced_rev),
     routes: routes.filter((r) => r.host === d.host).map(({ prefix, slug, v }) => ({ prefix, slug, v })),
diff --git a/services/core-api/src/publisher/routes.js b/services/core-api/src/publisher/routes.js
index 952d13f..1f8d5cc 100644
--- a/services/core-api/src/publisher/routes.js
+++ b/services/core-api/src/publisher/routes.js
@@ -13,7 +13,7 @@ function checkPrefix(prefix) {
 
 async function currentRoute(c, host, prefix) {
   const { rows } = await c.query(
-    `SELECT r.version_id, f.slug, v.n
+    `SELECT r.version_id, f.slug, f.app_id, v.n
        FROM routes r JOIN versions v ON v.id = r.version_id JOIN funnels f ON f.id = v.funnel_id
       WHERE r.host = $1 AND r.path_prefix = $2`,
     [host, prefix],
@@ -22,14 +22,15 @@ async function currentRoute(c, host, prefix) {
 }
 
 // One transaction per change, serialized per host by the domains row lock; bumps host_revs.rev.
+// fn gets the locked domain row ({status, app_id}) as its second argument.
 async function inHostTx(pool, host, { allowDisabled = false } = {}, fn) {
   const c = await pool.connect();
   try {
     await c.query('BEGIN');
-    const { rows } = await c.query('SELECT status FROM domains WHERE host = $1 FOR UPDATE', [host]);
+    const { rows } = await c.query('SELECT status, app_id FROM domains WHERE host = $1 FOR UPDATE', [host]);
     if (!rows.length) throw new HttpError(404, 'domain_not_found', { host });
     if (rows[0].status === 'disabled' && !allowDisabled) throw new HttpError(409, 'domain_disabled', { host });
-    const out = await fn(c);
+    const out = await fn(c, rows[0]);
     const rev = (await c.query('UPDATE host_revs SET rev = rev + 1 WHERE host = $1 RETURNING rev', [host])).rows[0].rev;
     await c.query('COMMIT');
     return { ...out, rev: Number(rev) };
@@ -54,9 +55,9 @@ async function trySync(pool, kv, host, log) {
 export async function setRoute(pool, kv, { host, prefix, slug, v, actor, confirmFunnelChange = false, log }) {
   const p = checkPrefix(prefix);
   const who = actorOf(actor);
-  const out = await inHostTx(pool, host, {}, async (c) => {
+  const out = await inHostTx(pool, host, {}, async (c, domain) => {
     const ver = (
-      await c.query('SELECT v.id, v.lint_report FROM versions v JOIN funnels f ON f.id = v.funnel_id WHERE f.slug = $1 AND v.n = $2', [slug, v])
+      await c.query('SELECT v.id, v.lint_report, f.app_id FROM versions v JOIN funnels f ON f.id = v.funnel_id WHERE f.slug = $1 AND v.n = $2', [slug, v])
     ).rows[0];
     if (!ver) throw new HttpError(404, 'version_not_found', { funnel: slug, v });
     // Uploads with lint errors are refused since admin-console-p1; an older version may still carry some.
@@ -66,6 +67,11 @@ export async function setRoute(pool, kv, { host, prefix, slug, v, actor, confirm
     if (cur && cur.slug !== slug && !confirmFunnelChange) {
       throw new HttpError(409, 'funnel_change_requires_confirmation', { from: cur.slug, to: slug });
     }
+    // Spec admin-console-p4a §2, decision #3: after the checks above, a host of an app takes only that app's
+    // funnels (an unassigned funnel only goes on a shared host). Rollback / delete / sync stay unchecked.
+    if (domain.app_id !== null && domain.app_id !== ver.app_id) {
+      throw new HttpError(409, 'domain_app_mismatch', { host_app: domain.app_id, funnel_app: ver.app_id });
+    }
     if (cur?.version_id !== ver.id) {
       await c.query(
         `INSERT INTO routes (host, path_prefix, version_id, updated_by) VALUES ($1, $2, $3, $4)
@@ -79,7 +85,7 @@ export async function setRoute(pool, kv, { host, prefix, slug, v, actor, confirm
       );
       await audit(c, who, 'route.publish', `route:${host}${p}`, {
         host, prefix: p, slug, from_v: cur?.n ?? null, ...(cur && cur.slug !== slug && { from_slug: cur.slug }), to_v: v,
-      });
+      }, { app_id: ver.app_id });
     }
     return { host, prefix: p, funnel: slug, v };
   });
@@ -107,11 +113,11 @@ export async function rollbackRoute(pool, kv, { host, prefix, actor, log }) {
       [host, p, cur.version_id, last.from_version, who.name],
     );
     const to = (
-      await c.query('SELECT f.slug, v.n FROM versions v JOIN funnels f ON f.id = v.funnel_id WHERE v.id = $1', [last.from_version])
+      await c.query('SELECT f.slug, f.app_id, v.n FROM versions v JOIN funnels f ON f.id = v.funnel_id WHERE v.id = $1', [last.from_version])
     ).rows[0];
     await audit(c, who, 'route.rollback', `route:${host}${p}`, {
       host, prefix: p, slug: to.slug, from_v: cur.n, ...(cur.slug !== to.slug && { from_slug: cur.slug }), to_v: to.n,
-    });
+    }, { app_id: to.app_id });
     return { host, prefix: p, funnel: to.slug, v: to.n };
   });
   return { ...out, ...(await trySync(pool, kv, host, log)) };
@@ -128,7 +134,7 @@ export async function removeRoute(pool, kv, { host, prefix, actor, log }) {
       'INSERT INTO route_events (host, path_prefix, from_version, to_version, actor) VALUES ($1, $2, $3, NULL, $4)',
       [host, p, cur.version_id, who.name],
     );
-    await audit(c, who, 'route.delete', `route:${host}${p}`, { host, prefix: p, slug: cur.slug, v: cur.n });
+    await audit(c, who, 'route.delete', `route:${host}${p}`, { host, prefix: p, slug: cur.slug, v: cur.n }, { app_id: cur.app_id });
     return { host, prefix: p, funnel: cur.slug, v: cur.n };
   });
   return { ...out, ...(await trySync(pool, kv, host, log)) };
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/domains-app.test.js test/routes-app.test.js test/catalog.test.js test/audit.test.js
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  20 passed (20)`; toàn bộ core-api `Test Files  63 passed (63)`, `Tests  578 passed (578)` (trước task: 61 file, 571 test).

- [ ] **Step 5: Commit**

```bash
git add services/core-api/src/publisher/domains.js services/core-api/src/http/domains.js services/core-api/src/http/catalog.js services/core-api/src/publisher/catalog.js services/core-api/src/publisher/routes.js services/core-api/test/domains-app.test.js services/core-api/test/routes-app.test.js services/core-api/test/audit.test.js services/core-api/test/catalog.test.js
git commit -m "feat(core-api): domains belong to an app; publish refuses another app's domain; GET /v1/domains?app=
```

---

---

### Task 4: Apps đọc — `GET /v1/apps` có 3 count, `GET /v1/apps/:id`, `/summary`, `/plans`; audit `entitlement.*` có `app_id`

**Files:**
- Create: `services/core-api/src/identity/app-summary.js`
- Modify: `services/core-api/src/identity/apps.js`, `services/core-api/src/http/apps.js`, `services/core-api/src/identity/grants.js`
- Test: `services/core-api/test/apps-read.test.js` (mới; Postgres)

**Interfaces:**
- Consumes: `listFunnels(pool, {app})` (Task 2), `listDomains(pool, {app})` (Task 3; trả cả domain dùng chung, cột `app_id` trên mỗi dòng), `listFunnelPrices(db, slug)` (`src/billing/prices.js`, quy tắc gộp của tab Giá), `audit(..., {app_id})` (Task 1), `requireRole(pool, 'viewer' | 'prices:read')`, `HttpError`; test helpers `makeApp`, `tokenFor`, `bearer`, `seedVersions`, `signIn`, `ADMIN_ORIGIN`, `seedApp`, `fakeSecrets`, `APP_BODY`, `WEB_BODY`, `PRICE_W1`, `PRICE_OTHER`.
- Produces:
  - `listApps(db)` → `{apps: [appView + {funnels_count, domains_count, live_routes_count}]}` (một query, 3 subquery đếm; `live_routes_count` = số dòng `routes` có version thuộc funnel của app, trên bất kỳ domain nào), thứ tự theo `id` như cũ.
  - `getApp(db, id)` → view + 3 count, hoặc `null`. `RESERVED_APP_IDS = ['none']` (export từ `src/identity/apps.js`).
  - `createApp` từ chối id `none` → `400 invalid_app_id {id}` trước khi ghi gì (secret, row, audit), vì `?app=none` trên các route liệt kê nghĩa là "chưa gán".
  - `appSummary(pool, id)` → `{app, funnels: [{slug, latest_v, live: [{host, prefix, v}], pixel_id, updated_at}], domains: [{host, status, routes: [{prefix, slug, v}]}]}`; domain dùng chung bị lọc bỏ trong module (`d.app_id === id`), không thêm option cho `listDomains`. `404 app_not_found {id}`.
  - `appPlans(pool, id)` → `{plans: [{slug, plan, price_id, discount_id, entitlement_key, unmapped, in_html}]}`, sắp theo slug rồi plan; mỗi funnel của app = hợp các key của `listFunnelPrices(...).plans` và `plan_keys`; `unmapped` lấy từ `listFunnelPrices(...).unmapped`; `in_html` = plan key có trong HTML bản mới nhất (giá mà HTML không còn dùng → `in_html: false`, SPA hiện "Không dùng"; funnel chưa có bản nào đọc được `plan_keys` → mọi dòng `in_html: false`). Dòng chưa có giá: `price_id`/`discount_id`/`entitlement_key` = `null`. `404 app_not_found {id}`.
  - Routes: `GET /v1/apps/:id` (`viewer`, `404 app_not_found {id}`), `GET /v1/apps/:id/summary` (`viewer`), `GET /v1/apps/:id/plans` (`prices:read`: viewer 403, support 403, editor 200, admin 200).
  - Audit `entitlement.grant` ghi cột `app_id` = app của grant; `entitlement.revoke` ghi `app_id` = app của grant bị thu hồi (đọc từ dòng `manual_grants` sau UPDATE).

- [ ] **Step 1: Viết test fail**

`services/core-api/test/apps-read.test.js` (mới):

`services/core-api/test/apps-read.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, tokenFor, bearer, seedVersions } from './helpers/app.js';
import { ADMIN_ORIGIN, signIn } from './helpers/admin.js';
import { APP_BODY, WEB_BODY, fakeSecrets, seedApp } from './helpers/identity.js';
import { PRICE_OTHER, PRICE_W1 } from './helpers/paddle.js';

const CHATCHI = { ...APP_BODY, id: 'chatchi', name: 'ChatChi', deeplink_scheme: 'chatchi', webhook_url: 'https://be.chatchi.example/ikf/webhook' };
const SHARED = 'shared.example.com';
const STAR = 'star.example.com';
const MOON = 'moon.example.com';
const REF = 'cus_01K75Z0000000000000000000B';

// Spec admin-console-p4a §2 "Apps": GET /v1/apps carries 3 counts; GET /v1/apps/:id, /summary, /plans;
// entitlement.grant|revoke audit rows carry the grant's app; POST /v1/apps refuses the reserved id 'none'.
describe('apps read side (p4a)', () => {
  let db;
  let app;
  let store;
  let secrets;
  let admin;
  let viewer;

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    secrets = fakeSecrets();
    ({ app, store } = await makeApp(db.pool, { webhookSecrets: secrets, admin: { origin: ADMIN_ORIGIN, appEnv: 'staging' } }));
    admin = await tokenFor(db.pool, 'admin');
    viewer = await signIn(db.pool, 'viewer@ikameglobal.com', 'viewer');
    await seedApp(db.pool, secrets); // starlyn
    await seedApp(db.pool, secrets, CHATCHI);
    await seedApp(db.pool, secrets, WEB_BODY); // tarot-web: nothing in it
    for (const [slug, appId] of [['star', 'starlyn'], ['sun', 'starlyn'], ['moon', 'chatchi'], ['loose', null]]) {
      await seedVersions(db.pool, store, slug, 1);
      await db.pool.query('UPDATE funnels SET app_id = $2 WHERE slug = $1', [slug, appId]);
    }
    for (const [host, body] of [[SHARED, { status: 'active' }], [STAR, { app_id: 'starlyn' }], [MOON, { app_id: 'chatchi' }]]) {
      expect((await call('PUT', `/v1/domains/${host}`, body)).statusCode).toBe(200);
    }
    for (const [host, prefix, funnel] of [[STAR, '/', 'star'], [MOON, '/', 'moon'], [SHARED, '/l', 'loose']]) {
      expect((await call('PUT', `/v1/routes/${host}`, { prefix, funnel, v: 1 })).statusCode).toBe(200);
    }
  });
  afterEach(() => app.close());

  function call(method, url, payload, headers = bearer(admin)) {
    return app.inject({ method, url, headers, ...(payload !== undefined && { payload }) });
  }
  const asViewer = (url) => call('GET', url, undefined, viewer.headers(false));
  const counts = (a) => ({ funnels_count: a.funnels_count, domains_count: a.domains_count, live_routes_count: a.live_routes_count });

  it('GET /v1/apps: every app carries funnels_count, domains_count, live_routes_count; order by id unchanged', async () => {
    const res = await asViewer('/v1/apps');
    expect(res.statusCode).toBe(200);
    expect(res.json().apps.map((a) => [a.id, counts(a)])).toEqual([
      ['chatchi', { funnels_count: 1, domains_count: 1, live_routes_count: 1 }],
      ['starlyn', { funnels_count: 2, domains_count: 1, live_routes_count: 1 }],
      ['tarot-web', { funnels_count: 0, domains_count: 0, live_routes_count: 0 }],
    ]);
  });

  it('GET /v1/apps/:id: the app view + counts for a viewer; 404 app_not_found', async () => {
    const res = await asViewer('/v1/apps/starlyn');
    expect(res.statusCode).toBe(200);
    const list = (await asViewer('/v1/apps')).json().apps;
    expect(res.json()).toEqual(list.find((a) => a.id === 'starlyn'));
    expect(res.json()).toMatchObject({ id: 'starlyn', name: 'Starlyn', kind: 'app', funnels_count: 2, domains_count: 1, live_routes_count: 1 });
    expect(counts((await asViewer('/v1/apps/tarot-web')).json())).toEqual({ funnels_count: 0, domains_count: 0, live_routes_count: 0 });

    const unknown = await asViewer('/v1/apps/nope');
    expect(unknown.statusCode).toBe(404);
    expect(unknown.json()).toEqual({ error: 'app_not_found', detail: { id: 'nope' } });
    expect((await app.inject({ method: 'GET', url: '/v1/apps/starlyn' })).statusCode).toBe(401);
  });

  it('GET /v1/apps/:id/summary: only the app\'s funnels (with live) and its own domains, not shared ones; 404 unknown', async () => {
    const res = await asViewer('/v1/apps/starlyn/summary');
    expect(res.statusCode).toBe(200);
    const out = res.json();
    expect(out.app).toEqual((await asViewer('/v1/apps/starlyn')).json());
    expect([...out.funnels].sort((a, b) => (a.slug < b.slug ? -1 : 1))).toEqual([
      { slug: 'star', latest_v: 1, live: [{ host: STAR, prefix: '/', v: 1 }], pixel_id: null, updated_at: expect.any(String) },
      { slug: 'sun', latest_v: 1, live: [], pixel_id: null, updated_at: expect.any(String) },
    ]);
    expect(out.domains).toEqual([{ host: STAR, status: 'active', routes: [{ prefix: '/', slug: 'star', v: 1 }] }]);

    const empty = (await asViewer('/v1/apps/tarot-web/summary')).json();
    expect(empty).toMatchObject({ funnels: [], domains: [] });

    const unknown = await asViewer('/v1/apps/nope/summary');
    expect(unknown.statusCode).toBe(404);
    expect(unknown.json()).toEqual({ error: 'app_not_found', detail: { id: 'nope' } });
  });

  it('GET /v1/apps/:id/plans: funnel_prices ∪ plan_keys of the latest version, sorted by slug then plan; 404 unknown', async () => {
    const id = async (slug) => (await db.pool.query('SELECT id FROM funnels WHERE slug = $1', [slug])).rows[0].id;
    await db.pool.query("UPDATE versions SET plan_keys = ARRAY['1w', '1m'] WHERE funnel_id = $1", [await id('star')]);
    await db.pool.query(
      `INSERT INTO funnel_prices (funnel_id, plan_key, paddle_price_id, kind, entitlement_key, updated_by)
       VALUES ($1, '1w', $2, 'recurring', 'premium', 't'), ($1, 'old', $3, 'one_time', 'tarot_2027', 't')`,
      [await id('star'), PRICE_W1, PRICE_OTHER],
    );
    // Another app's funnel never shows up.
    await db.pool.query(
      "INSERT INTO funnel_prices (funnel_id, plan_key, paddle_price_id, kind, entitlement_key, updated_by) VALUES ($1, '1w', $2, 'recurring', 'premium', 't')",
      [await id('moon'), PRICE_W1],
    );

    const res = await call('GET', '/v1/apps/starlyn/plans');
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      plans: [
        { slug: 'star', plan: '1m', price_id: null, discount_id: null, entitlement_key: null, unmapped: true, in_html: true },
        { slug: 'star', plan: '1w', price_id: PRICE_W1, discount_id: null, entitlement_key: 'premium', unmapped: false, in_html: true },
        { slug: 'star', plan: 'old', price_id: PRICE_OTHER, discount_id: null, entitlement_key: 'tarot_2027', unmapped: false, in_html: false },
      ],
    });
    expect((await call('GET', '/v1/apps/tarot-web/plans')).json()).toEqual({ plans: [] });

    const unknown = await call('GET', '/v1/apps/nope/plans');
    expect(unknown.statusCode).toBe(404);
    expect(unknown.json()).toEqual({ error: 'app_not_found', detail: { id: 'nope' } });
  });

  it.each([
    ['viewer', 403],
    ['support', 403],
    ['editor', 200],
    ['admin', 200],
  ])('GET /v1/apps/:id/plans needs prices:read: %s → %i', async (role, code) => {
    const who = role === 'viewer' ? viewer : await signIn(db.pool, `${role}@ikameglobal.com`, role);
    expect((await call('GET', '/v1/apps/starlyn/plans', undefined, who.headers(false))).statusCode).toBe(code);
  });

  it('POST /v1/apps refuses the id none (it means "unassigned" in ?app=): 400 invalid_app_id, nothing written', async () => {
    const res = await call('POST', '/v1/apps', { ...APP_BODY, id: 'none', name: 'None' });
    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({ error: 'invalid_app_id', detail: { id: 'none' } });
    expect(secrets.values.has('none')).toBe(false);
    expect((await db.pool.query("SELECT 1 FROM apps WHERE id = 'none'")).rows).toEqual([]);
    expect((await db.pool.query("SELECT 1 FROM audit_log WHERE action = 'app.create' AND target = 'app:none'")).rows).toEqual([]);
  });

  it('entitlement.grant / entitlement.revoke audit rows carry the grant\'s app in the app_id column', async () => {
    await db.pool.query("INSERT INTO customers (paddle_customer_id, email, ref) VALUES ('ctm_1', 'buyer@example.com', $1)", [REF]);
    const granted = await call('POST', `/v1/customers/${REF}/grants`, { app_id: 'chatchi', key: 'premium', expires_at: null, reason: 'CS ticket 7' });
    expect(granted.statusCode).toBe(201);
    expect((await call('DELETE', `/v1/customers/${REF}/grants/${granted.json().grant.id}`)).statusCode).toBe(200);
    const rows = (await db.pool.query("SELECT action, app_id FROM audit_log WHERE action LIKE 'entitlement.%' ORDER BY id")).rows;
    expect(rows).toEqual([
      { action: 'entitlement.grant', app_id: 'chatchi' },
      { action: 'entitlement.revoke', app_id: 'chatchi' },
    ]);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/apps-read.test.js
```

Expected: `Test Files  1 failed (1)`, `Tests  10 failed (10)`: test list fail vì app chưa có 3 count; các test `GET /v1/apps/:id`, `/summary`, `/plans` và ma trận quyền `/plans` fail vì route chưa có (`expected 404 to be 200` / `expected 404 to be 403`); test id `none` fail vì `POST /v1/apps` vẫn tạo (`expected 201 to be 400`); test audit fail vì `app_id` của `entitlement.grant|revoke` còn `null`.

- [ ] **Step 3: Implement**

`services/core-api/src/identity/app-summary.js` (mới):

`services/core-api/src/identity/app-summary.js` (mới):

```js
// What one app holds (spec admin-console-p4a §2 "Apps"): the app's overview page and its read-only price table.
// Both reuse the console's existing readers (funnels, domains, a funnel's Prices tab) so the rules stay in one place.
import { listFunnelPrices } from '../billing/prices.js';
import { HttpError } from '../errors.js';
import { listDomains, listFunnels } from '../publisher/catalog.js';
import { getApp } from './apps.js';

async function appOr404(pool, id) {
  const app = await getApp(pool, id);
  if (!app) throw new HttpError(404, 'app_not_found', { id });
  return app;
}

// {app, funnels, domains}: the app's own funnels and domains. listDomains({app}) also returns the shared hosts
// (every app can publish there); the overview shows only the app's own, so they are filtered out here.
export async function appSummary(pool, id) {
  const app = await appOr404(pool, id);
  const funnels = await listFunnels(pool, { app: id });
  const domains = (await listDomains(pool, { app: id })).filter((d) => d.app_id === id);
  return {
    app,
    funnels: funnels.map(({ slug, latest_v, live, pixel_id, updated_at }) => ({ slug, latest_v, live, pixel_id, updated_at })),
    domains: domains.map(({ host, status, routes }) => ({ host, status, routes })),
  };
}

// {plans: [{slug, plan, price_id, discount_id, entitlement_key, unmapped, in_html}]}, sorted by slug then plan:
// per funnel, the union of its prices and the plan keys of its latest version, merged as the Prices tab does
// (listFunnelPrices). unmapped = a plan key in the HTML with no price; in_html = the plan key is in the latest
// version's HTML (false for a price the HTML no longer uses, which the console shows as "Không dùng"; false for
// every row while no version has plan keys yet).
export async function appPlans(pool, id) {
  await appOr404(pool, id);
  const slugs = (await listFunnels(pool, { app: id })).map((f) => f.slug).sort();
  const plans = [];
  for (const slug of slugs) {
    const p = await listFunnelPrices(pool, slug);
    const inHtml = new Set(p.plan_keys ?? []);
    const keys = [...new Set([...Object.keys(p.plans), ...inHtml])].sort();
    for (const plan of keys) {
      const price = p.plans[plan];
      plans.push({
        slug,
        plan,
        price_id: price?.price_id ?? null,
        discount_id: price?.discount_id ?? null,
        entitlement_key: price?.entitlement_key ?? null,
        unmapped: p.unmapped.includes(plan),
        in_html: inHtml.has(plan),
      });
    }
  }
  return { plans };
}
```

`services/core-api/src/identity/apps.js`, `services/core-api/src/http/apps.js`, `services/core-api/src/identity/grants.js` (sửa, áp dụng đúng diff này):

`services/core-api/src/identity/apps.js`, `services/core-api/src/http/apps.js`, `services/core-api/src/identity/grants.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/http/apps.js b/services/core-api/src/http/apps.js
index 79af232..279af7b 100644
--- a/services/core-api/src/http/apps.js
+++ b/services/core-api/src/http/apps.js
@@ -1,7 +1,8 @@
 import { audit } from '../audit.js';
 import { requireRole } from '../auth.js';
 import { HttpError } from '../errors.js';
-import { createApp, listApps, rotateKey, updateApp } from '../identity/apps.js';
+import { appPlans, appSummary } from '../identity/app-summary.js';
+import { createApp, getApp, listApps, rotateKey, updateApp } from '../identity/apps.js';
 import { listDeliveries, resendDelivery } from '../identity/webhooks.js';
 
 const url = { type: 'string', minLength: 1, maxLength: 500 };
@@ -76,6 +77,22 @@ export default async function appsHttp(app, { pool, webhookSecrets }) {
   // Any signed-in person picks an app for a funnel from this list (spec admin-console-p1 §3).
   app.get('/v1/apps', { onRequest: requireRole(pool, 'viewer') }, async () => listApps(pool));
 
+  // Spec admin-console-p4a §2 "Apps": one app with its counts (the console's check when it opens an app), its
+  // overview (own funnels and domains, not the shared hosts) and its read-only price table.
+  app.get('/v1/apps/:id', { onRequest: requireRole(pool, 'viewer'), schema: { params: idParams } }, async (req) => {
+    const out = await getApp(pool, req.params.id);
+    if (!out) throw new HttpError(404, 'app_not_found', { id: req.params.id });
+    return out;
+  });
+
+  app.get('/v1/apps/:id/summary', { onRequest: requireRole(pool, 'viewer'), schema: { params: idParams } }, async (req) =>
+    appSummary(pool, req.params.id),
+  );
+
+  app.get('/v1/apps/:id/plans', { onRequest: requireRole(pool, 'prices:read'), schema: { params: idParams } }, async (req) =>
+    appPlans(pool, req.params.id),
+  );
+
   // {force: true} rotates even while the previous key is still in its 24h window (it then stops at once).
   app.post(
     '/v1/apps/:id/rotate-key',
diff --git a/services/core-api/src/identity/apps.js b/services/core-api/src/identity/apps.js
index 9ac2c7a..fdc358b 100644
--- a/services/core-api/src/identity/apps.js
+++ b/services/core-api/src/identity/apps.js
@@ -10,6 +10,7 @@ export const PREV_KEY_HOURS = 24;
 export const HANDOFFS = ['user_id', 'claim'];
 export const DEEPLINK_PATH_RE = /^[a-z0-9_-]{1,32}$/;
 export const BUNDLE_ID_RE = /^[A-Za-z0-9._-]{1,100}$/;
+export const RESERVED_APP_IDS = ['none'];
 
 const COLUMNS = 'id, name, kind, adjust_tracker_url, deeplink_scheme, return_url, webhook_url, handoff, deeplink_path, bundle_ids, prev_key_expires_at, created_at';
 
@@ -59,6 +60,8 @@ function checkApp(b) {
 // request waits, then sees the first row and gets 409 app_exists without touching the stored secret
 // (otherwise it would overwrite the secret the first caller was shown).
 export async function createApp(pool, webhookSecrets, b) {
+  // ?app=none on the list routes means "no app yet" (spec admin-console-p4a §2), so no app may be called that.
+  if (RESERVED_APP_IDS.includes(b.id)) throw new HttpError(400, 'invalid_app_id', { id: b.id });
   checkApp(b);
   return withTx(pool, async (c) => {
     await c.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`app:${b.id}`]);
@@ -89,9 +92,29 @@ export async function createApp(pool, webhookSecrets, b) {
   });
 }
 
+// Spec admin-console-p4a §2 "Apps": what an app holds, counted in the same query as the app rows. A live route
+// counts for the app of the funnel it serves, whatever domain it is on (a shared host included).
+const COUNTS = `(SELECT count(*)::int FROM funnels f WHERE f.app_id = a.id) AS funnels_count,
+       (SELECT count(*)::int FROM domains d WHERE d.app_id = a.id) AS domains_count,
+       (SELECT count(*)::int FROM routes r JOIN versions v ON v.id = r.version_id JOIN funnels f ON f.id = v.funnel_id
+         WHERE f.app_id = a.id) AS live_routes_count`;
+
+const appWithCounts = (r) => ({
+  ...appView(r),
+  funnels_count: r.funnels_count,
+  domains_count: r.domains_count,
+  live_routes_count: r.live_routes_count,
+});
+
 export async function listApps(db) {
-  const { rows } = await db.query(`SELECT ${COLUMNS} FROM apps ORDER BY id`);
-  return { apps: rows.map(appView) };
+  const { rows } = await db.query(`SELECT ${COLUMNS}, ${COUNTS} FROM apps a ORDER BY id`);
+  return { apps: rows.map(appWithCounts) };
+}
+
+// GET /v1/apps/:id: the app view + its counts, or null.
+export async function getApp(db, id) {
+  const { rows } = await db.query(`SELECT ${COLUMNS}, ${COUNTS} FROM apps a WHERE a.id = $1`, [id]);
+  return rows.length ? appWithCounts(rows[0]) : null;
 }
 
 // New key now; the old one keeps working for 24 hours (spec §6). While a previous key is still inside its
diff --git a/services/core-api/src/identity/grants.js b/services/core-api/src/identity/grants.js
index 84ae649..e0aeaa9 100644
--- a/services/core-api/src/identity/grants.js
+++ b/services/core-api/src/identity/grants.js
@@ -31,7 +31,8 @@ export async function grantEntitlement(pool, { ref, appId, key, expiresAt = null
       [customer.id, appId, key, end, why, who.name],
     );
     const grant = grantView(rows[0]);
-    await audit(c, who, 'entitlement.grant', `customer:${ref}`, { customer_ref: ref, app_id: appId, key, expires_at: grant.expires_at, grant_id: grant.id });
+    // Spec admin-console-p4a §2 "Audit": the row belongs to the grant's app.
+    await audit(c, who, 'entitlement.grant', `customer:${ref}`, { customer_ref: ref, app_id: appId, key, expires_at: grant.expires_at, grant_id: grant.id }, { app_id: appId });
     await recompute(c, customer.id, now());
     return { grant, entitlements: await listEntitlements(c, customer.id) };
   });
@@ -51,7 +52,7 @@ export async function revokeGrant(pool, { ref, grantId, actor, now = () => new D
       `UPDATE manual_grants SET revoked_at = now(), revoked_by = $2 WHERE id = $1 RETURNING ${COLUMNS}`,
       [grantId, who.name],
     );
-    await audit(c, who, 'entitlement.revoke', `customer:${ref}`, { customer_ref: ref, grant_id: grantId });
+    await audit(c, who, 'entitlement.revoke', `customer:${ref}`, { customer_ref: ref, grant_id: grantId }, { app_id: rows[0].app_id });
     await recompute(c, customer.id, now());
     return { grant: grantView(rows[0]), entitlements: await listEntitlements(c, customer.id) };
   });
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/apps-read.test.js
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  10 passed (10)`; toàn bộ core-api `Test Files  64 passed (64)`, `Tests  588 passed (588)` (trước task: 63 file, 578 test).

- [ ] **Step 5: Commit**

```bash
git add services/core-api/src/http/apps.js services/core-api/src/identity/apps.js services/core-api/src/identity/grants.js services/core-api/src/identity/app-summary.js services/core-api/test/apps-read.test.js
git commit -m "feat(core-api): GET /v1/apps/:id, /summary, /plans; app counts in the list; entitlement audit app_id
```

---

---

### Task 5: Khách hàng theo app — `POST /v1/customers/lookup` nhận `app_id`

**Files:**
- Modify: `services/core-api/src/identity/customers.js`, `services/core-api/src/http/customers.js`
- Test: `services/core-api/test/customer-report-app.test.js` (mới; Postgres)

**Interfaces:**
- Consumes: bảng `apps`, `funnels.app_id` (Task 2 bắt buộc app cho funnel mới), `customerRef`, `PAID`, `HttpError`, `requireRole(pool, 'support')`; test helpers `makeApp`, `signIn`, `ADMIN_ORIGIN`, `startDb`, `resetDb`, `seedShop`, `seedApp`, `fakeSecrets`, `APP_BODY`, `SDK_APP_BODY`, `WEB_BODY`, `CK`.
- Produces:
  - `customerReport(db, query)`: `query` có thể kèm `app_id` bên cạnh đúng một trong `email` / `customer_ref` / `checkout_id`. Có `app_id`: `checkouts` và `subscriptions` chỉ của funnel có `funnels.app_id = app_id`; `entitlements`, `manual_grants`, `links`, `deliveries` chỉ dòng có `app_id` đó; `claim` = claim mới nhất có checkout thuộc funnel của app, không có → `null`; khách mà cả 6 khối rỗng và `claim` null bị bỏ khỏi `customers`. App không tồn tại → `404 app_not_found {app_id}` (kiểm `apps` trước khi tìm khách). Không `app_id` → y như cũ. Không bao giờ có `user_id` hay email trong body.
  - `listEntitlements(db, customerId, appId = null)`: tham số thứ 3 tuỳ chọn lọc theo app; gọi cũ (2 tham số, `grants.js`) không đổi.
  - Schema `POST /v1/customers/lookup`: thêm `app_id: {type: 'string', pattern: '^[a-z0-9][a-z0-9-]{1,30}$'}` (cùng pattern với id app); quy tắc `oneOf` "đúng một identifier" giữ nguyên, nên `{app_id}` một mình → 400.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/customer-report-app.test.js` (mới):

`services/core-api/test/customer-report-app.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp } from './helpers/app.js';
import { ADMIN_ORIGIN, signIn } from './helpers/admin.js';
import { APP_BODY, CK, SDK_APP_BODY, WEB_BODY, fakeSecrets, seedApp, seedShop } from './helpers/identity.js';

const REF = 'cus_01K75Z0000000000000000000B';
const EV = '01JA00000000000000000000EV';
const CHATCHI = { ...APP_BODY, id: 'chatchi', name: 'ChatChi', deeplink_scheme: 'chatchi', webhook_url: 'https://be.chatchi.example/ikf/webhook' };

// Spec admin-console-p4a §2 "Khách hàng": POST /v1/customers/lookup takes an optional app_id. With it, every
// block of the report holds only that app's data (checkouts/subscriptions by the funnel's app, the rest by
// app_id, claim only when its checkout's funnel is in the app) and a customer with nothing there is dropped.
describe('customer lookup scoped to an app (p4a)', () => {
  let db;
  let app;
  let cs;
  let uid;
  const q = async (sql, p) => (await db.pool.query(sql, p)).rows;
  const lookup = (body, headers = cs.headers()) => app.inject({ method: 'POST', url: '/v1/customers/lookup', headers, payload: body });
  const clean = (res) => {
    expect(res.body).not.toContain(uid);
    expect(res.body).not.toMatch(/"user_id"|buyer@example\.com/i);
  };

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    const secrets = fakeSecrets();
    // starlyn owns witch-power (CK); chatchi holds the grant, link and delivery; tarot-web holds nothing.
    const { funnelId } = await seedShop(db.pool, { secrets, app: SDK_APP_BODY });
    await seedApp(db.pool, secrets, CHATCHI);
    await seedApp(db.pool, secrets, WEB_BODY);
    let customerId;
    ({ id: customerId, user_id: uid } = (await q(
      "INSERT INTO customers (paddle_customer_id, email, ref) VALUES ('ctm_1', 'Buyer@Example.com', $1) RETURNING id, user_id",
      [REF],
    ))[0]);
    await q("UPDATE checkouts SET status = 'completed', completed_at = '2026-10-09T10:00:05Z' WHERE id = $1", [CK]);
    await q(
      `INSERT INTO transactions (paddle_transaction_id, customer_id, paddle_subscription_id, checkout_id, status, origin, amount_minor, currency, billed_at, paddle_updated_at)
       VALUES ('txn_a', $1, 'sub_1', $2, 'completed', 'web', 1367, 'USD', '2026-10-09T10:00:00Z', now())`,
      [customerId, CK],
    );
    await q(
      `INSERT INTO subscriptions (paddle_subscription_id, customer_id, funnel_id, plan_key, status, current_period_end, paddle_updated_at)
       VALUES ('sub_1', $1, $2, '1w', 'active', '2026-10-23T10:00:00Z', now())`,
      [customerId, funnelId],
    );
    await q("INSERT INTO entitlements (customer_id, app_id, key, active, expires_at, source, source_id) VALUES ($1, 'starlyn', 'premium', true, '2026-10-26T10:00:00Z', 'subscription', 'sub_1')", [customerId]);
    await q(
      "INSERT INTO claim_tokens (token_hash, customer_id, app_id, checkout_id, expires_at, email_attempts, emailed_at) VALUES ('h1', $1, 'starlyn', $2, '2026-10-16T10:00:00Z', 1, '2026-10-09T10:00:07Z')",
      [customerId, CK],
    );
    await q("INSERT INTO manual_grants (customer_id, app_id, key, reason, granted_by) VALUES ($1, 'chatchi', 'vip', 'CS 7', 'boss@ikameglobal.com')", [customerId]);
    await q("INSERT INTO app_links (customer_id, app_id, app_user_id) VALUES ($1, 'chatchi', 'c1')", [customerId]);
    await q(
      `INSERT INTO webhook_deliveries (event_id, app_id, app_user_id, type, payload)
       VALUES ($1, 'chatchi', 'c1', 'entitlement.updated', jsonb_build_object('customer_ref', $2::text))`,
      [EV, REF],
    );
    ({ app } = await makeApp(db.pool, { admin: { origin: ADMIN_ORIGIN, appEnv: 'staging' } }));
    cs = await signIn(db.pool, 'cs@ikameglobal.com', 'support');
  });
  afterEach(() => app.close());

  it("app_id of the funnel's app: only its checkouts, subscriptions, entitlements and claim; the other app's grant, link, delivery are gone", async () => {
    const res = await lookup({ email: 'buyer@example.com', app_id: 'starlyn' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['cache-control']).toBe('no-store');
    const [c, ...rest] = res.json().customers;
    expect(rest).toEqual([]);
    expect(c.customer_ref).toBe(REF);
    expect(c.checkouts.map((k) => [k.id, k.funnel])).toEqual([[CK, 'witch-power']]);
    expect(c.subscriptions.map((s) => s.id)).toEqual(['sub_1']);
    expect(c.entitlements).toEqual([{ app_id: 'starlyn', key: 'premium', active: true, expires_at: '2026-10-26T10:00:00.000Z', source: 'subscription', source_id: 'sub_1' }]);
    expect(c).toMatchObject({ manual_grants: [], links: [], deliveries: [] });
    expect(c.claim).toEqual({ checkout_id: CK, emailed_at: '2026-10-09T10:00:07.000Z', email_attempts: 1, expires_at: '2026-10-16T10:00:00.000Z' });
    clean(res);
  });

  it('app_id of the other app: only its grant, link and delivery; no checkout, subscription, entitlement; claim null', async () => {
    const res = await lookup({ customer_ref: REF, app_id: 'chatchi' });
    expect(res.statusCode).toBe(200);
    const [c] = res.json().customers;
    expect(c).toMatchObject({ customer_ref: REF, checkouts: [], subscriptions: [], entitlements: [], claim: null });
    expect(c.manual_grants.map((g) => [g.app_id, g.key])).toEqual([['chatchi', 'vip']]);
    expect(c.links.map((l) => [l.app_id, l.app_user_id])).toEqual([['chatchi', 'c1']]);
    expect(c.deliveries.map((d) => [d.event_id, d.app_id])).toEqual([[EV, 'chatchi']]);
    clean(res);
  });

  it('an app the customer has nothing in drops the customer; by checkout_id too', async () => {
    const res = await lookup({ email: 'buyer@example.com', app_id: 'tarot-web' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ customers: [] });
    expect((await lookup({ checkout_id: CK, app_id: 'tarot-web' })).json()).toEqual({ customers: [] });
    expect((await lookup({ checkout_id: CK, app_id: 'starlyn' })).json().customers.map((c) => c.customer_ref)).toEqual([REF]);
  });

  it('without app_id: every app, claim present (as before)', async () => {
    const res = await lookup({ email: 'buyer@example.com' });
    const [c] = res.json().customers;
    expect(c.checkouts.map((k) => k.id)).toEqual([CK]);
    expect(c.subscriptions.map((s) => s.id)).toEqual(['sub_1']);
    expect(c.entitlements.map((e) => e.app_id)).toEqual(['starlyn']);
    expect(c.manual_grants.map((g) => g.app_id)).toEqual(['chatchi']);
    expect(c.links.map((l) => l.app_id)).toEqual(['chatchi']);
    expect(c.deliveries.map((d) => d.app_id)).toEqual(['chatchi']);
    expect(c.claim).toMatchObject({ checkout_id: CK });
    clean(res);
  });

  it('a claim whose checkout funnel moved to another app is null for the old app', async () => {
    await q("UPDATE funnels SET app_id = 'chatchi' WHERE slug = 'witch-power'");
    const [star] = (await lookup({ customer_ref: REF, app_id: 'starlyn' })).json().customers;
    expect(star).toMatchObject({ checkouts: [], subscriptions: [], claim: null });
    expect(star.entitlements.map((e) => e.app_id)).toEqual(['starlyn']);
    const [chat] = (await lookup({ customer_ref: REF, app_id: 'chatchi' })).json().customers;
    expect(chat.checkouts.map((k) => k.id)).toEqual([CK]);
    expect(chat.claim).toMatchObject({ checkout_id: CK });
  });

  it('404 app_not_found for an unknown app', async () => {
    const res = await lookup({ email: 'buyer@example.com', app_id: 'nope-app' });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({ error: 'app_not_found', detail: { app_id: 'nope-app' } });
    clean(res);
  });

  it.each([
    [{ email: 'buyer@example.com', app_id: 'Bad_ID' }],
    [{ email: 'buyer@example.com', app_id: 'a' }],
    [{ email: 'buyer@example.com', app_id: 7 }],
    [{ app_id: 'starlyn' }],
    [{ email: 'buyer@example.com', customer_ref: REF, app_id: 'starlyn' }],
  ])('400 for a malformed app_id or without exactly one identifier: %j', async (body) => {
    expect((await lookup(body)).statusCode).toBe(400);
  });

  it.each([['support', 200], ['admin', 200], ['editor', 403], ['viewer', 403]])('with app_id: %s → %i', async (role, code) => {
    const p = role === 'support' ? cs : await signIn(db.pool, `${role}@ikameglobal.com`, role);
    expect((await lookup({ customer_ref: REF, app_id: 'starlyn' }, p.headers())).statusCode).toBe(code);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/customer-report-app.test.js
```

Expected: `Test Files  1 failed (1)`, `Tests  8 failed | 7 passed (15)`: 4 test lọc theo app fail vì `app_id` bị bỏ qua (báo cáo vẫn đủ mọi app, khách không bị bỏ); test 404 fail (`200` thay vì `404`); 3 case 400 có `email` + `app_id` sai dạng (`Bad_ID`, `a`, `7`) fail vì schema chưa biết `app_id` (`expected 200 to be 400`). Pass sẵn: test không `app_id`, 2 case 400 do `oneOf`, và ma trận quyền 4 role.

- [ ] **Step 3: Implement**

`services/core-api/src/identity/customers.js`, `services/core-api/src/http/customers.js` (sửa, áp dụng đúng diff này):

`services/core-api/src/identity/customers.js`, `services/core-api/src/http/customers.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/http/customers.js b/services/core-api/src/http/customers.js
index 5d75b60..742ae15 100644
--- a/services/core-api/src/http/customers.js
+++ b/services/core-api/src/http/customers.js
@@ -13,7 +13,8 @@ const refParams = {
 export default async function customersHttp(app, { pool }) {
   const admin = requireRole(pool, 'admin');
 
-  // CS lookup: support and admin. POST so the email stays out of URLs and access logs (E10). Exactly one key.
+  // CS lookup: support and admin. POST so the email stays out of URLs and access logs (E10). Exactly one key,
+  // plus an optional app_id (spec admin-console-p4a §2 "Khách hàng"; an unknown app → 404 app_not_found).
   app.post(
     '/v1/customers/lookup',
     {
@@ -25,6 +26,7 @@ export default async function customersHttp(app, { pool }) {
             email: { type: 'string', minLength: 3, maxLength: 254 },
             customer_ref: { type: 'string', pattern: CUSTOMER_REF_PATTERN },
             checkout_id: { type: 'string', pattern: '^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$' },
+            app_id: { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{1,30}$' },
           },
           oneOf: [{ required: ['email'] }, { required: ['customer_ref'] }, { required: ['checkout_id'] }],
         },
diff --git a/services/core-api/src/identity/customers.js b/services/core-api/src/identity/customers.js
index 5d6c7e8..93cc52e 100644
--- a/services/core-api/src/identity/customers.js
+++ b/services/core-api/src/identity/customers.js
@@ -30,11 +30,12 @@ export const grantView = (r) => ({
   revoked_by: r.revoked_by,
 });
 
-// What the console shows of a customer's entitlements (all apps), by app then key.
-export async function listEntitlements(db, customerId) {
+// What the console shows of a customer's entitlements (all apps, or one app when appId is set), by app then key.
+export async function listEntitlements(db, customerId, appId = null) {
   const { rows } = await db.query(
-    'SELECT app_id, key, active, expires_at, source, source_id FROM entitlements WHERE customer_id = $1 ORDER BY app_id, key',
-    [customerId],
+    `SELECT app_id, key, active, expires_at, source, source_id FROM entitlements
+      WHERE customer_id = $1 AND ($2::text IS NULL OR app_id = $2) ORDER BY app_id, key`,
+    [customerId, appId],
   );
   return rows.map((e) => ({ ...e, expires_at: iso(e.expires_at) }));
 }
@@ -61,7 +62,15 @@ async function findCustomers(db, { email, customer_ref: ref, checkout_id: checko
 // CS lookup, report v2 (spec admin-console-p2 §2; E10: POST body, so the email never sits in a URL or an access
 // log). Never the user_id (a bearer secret) and never the email (the caller typed it). A customer without a
 // customer_ref gets one here: every console action names the customer by it.
+// Spec admin-console-p4a §2 "Khách hàng": query.app_id scopes every block to one app — checkouts/subscriptions by
+// their funnel's app, entitlements/grants/links/deliveries by app_id, the claim only when its checkout's funnel is
+// in the app — and drops a customer with nothing there. Without app_id nothing is filtered.
 export async function customerReport(db, query) {
+  const appId = query.app_id ?? null;
+  if (appId !== null) {
+    const known = await db.query('SELECT 1 FROM apps WHERE id = $1', [appId]);
+    if (!known.rows.length) throw new HttpError(404, 'app_not_found', { app_id: appId });
+  }
   const out = [];
   for (const id of await findCustomers(db, query)) {
     const ref = await customerRef(db, id);
@@ -73,32 +82,43 @@ export async function customerReport(db, query) {
       `SELECT * FROM (
          SELECT DISTINCT ON (ck.id) ck.id, f.slug AS funnel, ck.v, ck.plan_key, ck.status, ck.created_at, ck.completed_at, t.amount_minor, t.currency
            FROM transactions t JOIN checkouts ck ON ck.id = t.checkout_id JOIN funnels f ON f.id = ck.funnel_id
-          WHERE t.customer_id = $1 AND t.status = ANY($2)
+          WHERE t.customer_id = $1 AND t.status = ANY($2) AND ($3::text IS NULL OR f.app_id = $3)
           ORDER BY ck.id, t.billed_at ASC NULLS LAST) x
         ORDER BY id DESC LIMIT 50`,
-      [id, [...PAID]],
+      [id, [...PAID], appId],
     );
     const subs = await db.query(
       `SELECT s.paddle_subscription_id AS id, f.slug AS funnel, s.plan_key, s.status, s.current_period_end, s.canceled_at
-         FROM subscriptions s LEFT JOIN funnels f ON f.id = s.funnel_id WHERE s.customer_id = $1 ORDER BY s.paddle_updated_at DESC`,
-      [id],
+         FROM subscriptions s LEFT JOIN funnels f ON f.id = s.funnel_id
+        WHERE s.customer_id = $1 AND ($2::text IS NULL OR f.app_id = $2) ORDER BY s.paddle_updated_at DESC`,
+      [id, appId],
     );
+    const entitlements = await listEntitlements(db, id, appId);
     const grants = await db.query(
-      'SELECT id, app_id, key, expires_at, reason, granted_by, created_at, revoked_at, revoked_by FROM manual_grants WHERE customer_id = $1 ORDER BY id DESC',
-      [id],
+      `SELECT id, app_id, key, expires_at, reason, granted_by, created_at, revoked_at, revoked_by FROM manual_grants
+        WHERE customer_id = $1 AND ($2::text IS NULL OR app_id = $2) ORDER BY id DESC`,
+      [id, appId],
+    );
+    const links = await db.query(
+      'SELECT app_id, app_user_id, linked_at, revoked_at FROM app_links WHERE customer_id = $1 AND ($2::text IS NULL OR app_id = $2) ORDER BY id',
+      [id, appId],
     );
-    const links = await db.query('SELECT app_id, app_user_id, linked_at, revoked_at FROM app_links WHERE customer_id = $1 ORDER BY id', [id]);
     const deliveries = await db.query(
       `SELECT event_id, app_id, app_user_id, type, status, attempts, last_error, created_at FROM webhook_deliveries
-        WHERE payload->>'customer_ref' = $1 ORDER BY id DESC LIMIT 20`,
-      [ref],
+        WHERE payload->>'customer_ref' = $1 AND ($2::text IS NULL OR app_id = $2) ORDER BY id DESC LIMIT 20`,
+      [ref, appId],
     );
     const claim = await db.query(
-      `SELECT checkout_id, emailed_at, email_attempts, expires_at FROM claim_tokens
-        WHERE customer_id = $1 AND checkout_id IS NOT NULL ORDER BY created_at DESC LIMIT 1`,
-      [id],
+      `SELECT ct.checkout_id, ct.emailed_at, ct.email_attempts, ct.expires_at FROM claim_tokens ct
+        WHERE ct.customer_id = $1 AND ct.checkout_id IS NOT NULL
+          AND ($2::text IS NULL OR EXISTS (
+            SELECT 1 FROM checkouts ck JOIN funnels f ON f.id = ck.funnel_id WHERE ck.id = ct.checkout_id AND f.app_id = $2))
+        ORDER BY ct.created_at DESC LIMIT 1`,
+      [id, appId],
     );
     const cl = claim.rows[0];
+    const empty = [checkouts, subs, grants, links, deliveries].every((r) => !r.rows.length) && !entitlements.length && !cl;
+    if (appId !== null && empty) continue;
     out.push({
       customer_ref: ref,
       paddle_customer_id: c.paddle_customer_id,
@@ -109,7 +129,7 @@ export async function customerReport(db, query) {
         ...k, created_at: iso(k.created_at), completed_at: iso(k.completed_at), amount_minor: k.amount_minor === null ? null : Number(k.amount_minor),
       })),
       subscriptions: subs.rows.map((r) => ({ ...r, current_period_end: iso(r.current_period_end), canceled_at: iso(r.canceled_at) })),
-      entitlements: await listEntitlements(db, id),
+      entitlements,
       manual_grants: grants.rows.map(grantView),
       links: links.rows.map((l) => ({ ...l, linked_at: iso(l.linked_at), revoked_at: iso(l.revoked_at) })),
       deliveries: deliveries.rows.map((d) => ({ ...d, created_at: iso(d.created_at) })),
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/customer-report-app.test.js test/customer-report.test.js
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Test Files  2 passed (2)`, `Tests  29 passed (29)` (15 mới + 14 cũ của `customer-report.test.js` không đổi); toàn bộ core-api `Test Files  65 passed (65)`, `Tests  603 passed (603)`.

- [ ] **Step 5: Commit**

```bash
git add services/core-api/src/identity/customers.js services/core-api/src/http/customers.js services/core-api/test/customer-report-app.test.js
git commit -m "feat(core-api): customer lookup scoped to an app (app_id)
```

---

---

### Task 6: Analytics overview theo app — `GET /v1/analytics/overview?app=` và `app_id` mỗi dòng

**Files:**
- Modify: `services/core-api/src/analytics/clickhouse.js`, `services/core-api/src/analytics/queries.js`, `services/core-api/src/analytics/revenue.js`, `services/core-api/src/analytics/service.js`, `services/core-api/src/http/analytics.js`
- Test: `services/core-api/test/analytics-app.test.js` (mới; fake queries/revenue + fake fetch), `services/core-api/test/analytics-app-http.test.js` (mới; Postgres + ClickHouse thật), `services/core-api/test/analytics-service.test.js`, `services/core-api/test/analytics-http.test.js`, `services/core-api/test/analytics-revenue.test.js` (sửa: dòng overview có `app_id`, `funnelSlugs` trả object)

**Interfaces:**
- Consumes: `funnels.app_id` (Task 2), bảng `apps`, `analyticsService` / `eventOverview` / `moneyOverview` / `funnelSlugs` (đợt 3), `createClickhouse`, `HttpError`, `requireRole(pool, 'viewer')`; test helpers `startDb`, `resetDb`, `startClickhouse`, `makeApp`, `signIn`, `ADMIN_ORIGIN`, `seedApp`, `fakeSecrets`, `APP_BODY`, `WEB_BODY`.
- Produces:
  - `chParam(v)` (export từ `clickhouse.js`): giá trị `param_<name>` — scalar → `String(v)`, mảng → literal `['a','b']` (escape `\` và `'`); `createClickhouse().query` dùng nó cho mọi tham số (tham số cũ không đổi).
  - `eventOverview(ch, {from, to, slugs?})`: có `slugs` → thêm `AND funnel IN {slugs:Array(String)}`.
  - `funnelSlugs(pool, {app} = {})` → `[{slug, app_id}]` (mọi funnel, hoặc chỉ của `app`). Không hỗ trợ `app='none'`.
  - `moneyOverview(pool, {from, to}, {app} = {})`: có `app` → mỗi query thêm `AND f.app_id = $n`.
  - `service.overview({from, to, app?})`: có `app` → lấy slug của app từ Postgres trước; app không có funnel → `{range, funnels: []}` không gọi ClickHouse lẫn query tiền; còn lại lọc cả hai nguồn. Mỗi dòng `{slug, app_id, sessions, leads, checkouts, paid, revenue, refunds}` (`app_id` null = chưa gán). Cache key gồm `app`.
  - `GET /v1/analytics/overview?from&to&app`: `app` tuỳ chọn, pattern `^[a-z0-9][a-z0-9-]{1,30}$` (sai → `400 bad_request`); app không có trong `apps` → `404 app_not_found {app_id}` (một `SELECT 1 FROM apps`, trước ClickHouse). `funnels/:slug` và `breakdown` không đổi.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/analytics-app.test.js` (mới):

`services/core-api/test/analytics-app.test.js` (mới):

```js
import { describe, it, expect } from 'vitest';
import { chParam, createClickhouse } from '../src/analytics/clickhouse.js';
import { analyticsService } from '../src/analytics/service.js';

const NOW = Date.UTC(2026, 9, 8, 10, 37);
const Q = { from: '2026-10-01T10:37:00Z' };
const RANGE = { from: '2026-10-01T10:00:00.000Z', to: '2026-10-08T11:00:00.000Z' };

// Postgres knows 5 funnels in 2 apps + 1 unassigned; ClickHouse also saw a deleted funnel ('ghost').
// 'sun' has money but no events, 'star' has events but no money (Review Focus: both still appear).
const FUNNELS = [
  { slug: 'star', app_id: 'starlyn' }, { slug: 'sun', app_id: 'starlyn' }, { slug: 'quiet', app_id: 'starlyn' },
  { slug: 'moon', app_id: 'chatchi' }, { slug: 'loose', app_id: null },
];
const EVENTS = [
  { slug: 'star', sessions: 8, leads: 3 }, { slug: 'moon', sessions: 5, leads: 1 },
  { slug: 'loose', sessions: 2, leads: 0 }, { slug: 'ghost', sessions: 99, leads: 9 },
];
const usd = (n) => [{ currency: 'USD', amount_minor: n }];
const MONEY = [
  { slug: 'moon', checkouts: 2, paid: 1, revenue: usd(999), refunds: [] },
  { slug: 'sun', checkouts: 3, paid: 2, revenue: usd(2734), refunds: usd(1367) },
];

// Honest fakes: they filter like the real queries do (slugs for ClickHouse, app for Postgres) and record every call.
function service() {
  const calls = [];
  const queries = {
    eventOverview: async (ch, q) => {
      calls.push(['eventOverview', q]);
      return q.slugs ? EVENTS.filter((e) => q.slugs.includes(e.slug)) : EVENTS;
    },
  };
  const appOf = new Map(FUNNELS.map((f) => [f.slug, f.app_id]));
  const revenue = {
    funnelSlugs: async (pool, opts) => {
      calls.push(['funnelSlugs', opts]);
      return opts?.app ? FUNNELS.filter((f) => f.app_id === opts.app) : FUNNELS;
    },
    moneyOverview: async (pool, r, opts) => {
      calls.push(['moneyOverview', opts]);
      return opts?.app ? MONEY.filter((m) => appOf.get(m.slug) === opts.app) : MONEY;
    },
  };
  return { s: analyticsService({ pool: 'pool', clickhouse: 'ch', now: () => NOW, queries, revenue }), calls };
}

const total = (rows) => rows.reduce((t, f) => ({
  sessions: t.sessions + f.sessions, leads: t.leads + f.leads, checkouts: t.checkouts + f.checkouts, paid: t.paid + f.paid,
  usd: t.usd + f.revenue.reduce((n, m) => n + m.amount_minor, 0),
}), { sessions: 0, leads: 0, checkouts: 0, paid: 0, usd: 0 });

// Spec admin-console-p4a §2 "Analytics", decision #4: an app's slugs come from Postgres and filter both sources.
describe('analytics overview by app (fakes)', () => {
  it('with app: the app\'s slugs go to ClickHouse, app to Postgres; rows carry app_id; events-only and money-only funnels both appear', async () => {
    const { s, calls } = service();
    expect(await s.overview({ ...Q, app: 'starlyn' })).toEqual({
      range: RANGE,
      funnels: [
        { slug: 'star', app_id: 'starlyn', sessions: 8, leads: 3, checkouts: 0, paid: 0, revenue: [], refunds: [] },
        { slug: 'sun', app_id: 'starlyn', sessions: 0, leads: 0, checkouts: 3, paid: 2, revenue: usd(2734), refunds: usd(1367) },
      ],
    });
    expect(calls).toEqual([
      ['funnelSlugs', { app: 'starlyn' }],
      ['eventOverview', { from: new Date(RANGE.from), to: new Date(RANGE.to), by: 'day', slugs: ['star', 'sun', 'quiet'] }],
      ['moneyOverview', { app: 'starlyn' }],
    ]);
  });

  it('without app: every funnel, app_id per row (null = unassigned), unknown slugs still dropped', async () => {
    const { s, calls } = service();
    const { funnels } = await s.overview(Q);
    expect(funnels.map((f) => [f.slug, f.app_id])).toEqual([['star', 'starlyn'], ['moon', 'chatchi'], ['loose', null], ['sun', 'starlyn']]);
    expect(calls.find((c) => c[0] === 'eventOverview')[1].slugs).toBeUndefined();
    expect(calls.find((c) => c[0] === 'moneyOverview')[1]).toEqual({ app: null });
  });

  it('an app\'s totals equal the sum of its funnel rows in the global overview', async () => {
    const { s } = service();
    const all = (await s.overview(Q)).funnels;
    for (const app of ['starlyn', 'chatchi']) {
      const mine = (await s.overview({ ...Q, app })).funnels;
      expect(total(mine), app).toEqual(total(all.filter((f) => f.app_id === app)));
    }
    expect(total(all.filter((f) => f.app_id === null))).toEqual({ sessions: 2, leads: 0, checkouts: 0, paid: 0, usd: 0 });
  });

  it('an app with no funnels: funnels [] without calling ClickHouse or the money query', async () => {
    const { s, calls } = service();
    expect(await s.overview({ ...Q, app: 'tarot-web' })).toEqual({ range: RANGE, funnels: [] });
    expect(calls.map((c) => c[0])).toEqual(['funnelSlugs']);
  });

  it('the cache key includes app', async () => {
    const { s, calls } = service();
    await s.overview(Q);
    await s.overview({ ...Q, app: 'starlyn' });
    await s.overview({ ...Q, app: 'chatchi' });
    const n = calls.length;
    expect(n).toBe(9);
    expect((await s.overview({ ...Q, app: 'starlyn' })).funnels.map((f) => f.slug)).toEqual(['star', 'sun']);
    expect((await s.overview(Q)).funnels).toHaveLength(4);
    expect(calls.length).toBe(n);
  });
});

// The ClickHouse HTTP interface reads an Array(String) parameter as an array literal: ['a','b'].
describe('chParam (ClickHouse parameter encoding)', () => {
  it('scalars as text; arrays as a quoted literal with \\ and \' escaped', () => {
    expect(chParam('aivideo')).toBe('aivideo');
    expect(chParam(2)).toBe('2');
    expect(chParam(['star', 'sun'])).toBe("['star','sun']");
    expect(chParam([])).toBe('[]');
    expect(chParam(["it's", 'a\\b'])).toBe("['it\\'s','a\\\\b']");
  });

  it('the client sends arrays as param_<name>=[…]', async () => {
    const urls = [];
    const fetch = async (url) => { urls.push(url); return new Response('', { status: 200 }); };
    const c = createClickhouse({ url: 'https://ch.example', user: 'r', password: 'p', database: 'ikf', fetch });
    await c.query('SELECT 1 WHERE funnel IN {slugs:Array(String)}', { slugs: ['star', 'sun'], v: 2 });
    const qs = new URL(urls[0]).searchParams;
    expect([qs.get('param_slugs'), qs.get('param_v')]).toEqual(["['star','sun']", '2']);
  });
});
```

`services/core-api/test/analytics-app-http.test.js` (mới):

`services/core-api/test/analytics-app-http.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { createClickhouse } from '../src/analytics/clickhouse.js';
import { startDb, resetDb } from './helpers/db.js';
import { startClickhouse } from './helpers/clickhouse.js';
import { makeApp } from './helpers/app.js';
import { ADMIN_ORIGIN, signIn } from './helpers/admin.js';
import { APP_BODY, WEB_BODY, fakeSecrets, seedApp } from './helpers/identity.js';

const NOW = Date.UTC(2026, 9, 8, 12);
const H = (h, m = 0) => Date.UTC(2026, 9, 8, h, m);
const RANGE = 'from=2026-10-08T08:00:00Z&to=2026-10-08T12:00:00Z';
const CHATCHI = { ...APP_BODY, id: 'chatchi', name: 'ChatChi', deeplink_scheme: 'chatchi', webhook_url: 'https://be.chatchi.example/ikf/webhook' };
const sid = (n) => `01JA0000000000000000000S${String(n).padStart(2, '0')}`;
const zero = { sessions: 0, leads: 0, checkouts: 0, paid: 0, revenue: [], refunds: [] };
const USD = (n) => [{ currency: 'USD', amount_minor: n }];
// chatchi's funnel: paid once, refunded once — must appear unfiltered and under ?app=chatchi only.
const MOON = { ...zero, slug: 'moon', app_id: 'chatchi', sessions: 1, checkouts: 1, paid: 1, revenue: USD(999), refunds: USD(999) };

// Spec admin-console-p4a §2 "Analytics", decision #4: ?app= filters both ClickHouse (funnel IN the app's slugs) and
// Postgres (f.app_id); every row carries app_id; unknown app → 404 before ClickHouse.
describe('analytics overview by app (real ClickHouse + Postgres)', () => {
  let db;
  let ch;
  let clickhouse;
  let app;
  let viewer;

  beforeAll(async () => {
    [db, ch] = await Promise.all([startDb(), startClickhouse()]);
    await ch.apply();
    clickhouse = createClickhouse({ url: ch.url, user: ch.user, password: ch.password, database: 'ikf' });
    // star (starlyn): 2 sessions, 1 lead. moon (chatchi): 1. loose (no app): 1. ghost: not a funnel in Postgres.
    // sun (starlyn) has no events, only a checkout.
    await ch.insertEvents([
      { sid: sid(1), funnel: 'star', name: 'page_load', at: H(9) },
      { sid: sid(1), funnel: 'star', name: 'lead', at: H(9, 2) },
      { sid: sid(2), funnel: 'star', name: 'page_load', at: H(10) },
      { sid: sid(3), funnel: 'moon', name: 'page_load', at: H(10) },
      { sid: sid(4), funnel: 'loose', name: 'page_load', at: H(11) },
      { sid: sid(5), funnel: 'ghost', name: 'page_load', at: H(11) },
    ]);
  });
  afterAll(async () => {
    await Promise.all([db?.stop(), ch?.stop()]);
  });
  beforeEach(async () => {
    await resetDb(db.pool);
    const secrets = fakeSecrets();
    await seedApp(db.pool, secrets); // starlyn
    await seedApp(db.pool, secrets, CHATCHI);
    await seedApp(db.pool, secrets, WEB_BODY); // tarot-web: no funnels
    const ids = {};
    for (const [slug, appId] of [['star', 'starlyn'], ['sun', 'starlyn'], ['moon', 'chatchi'], ['loose', null]]) {
      ids[slug] = (await db.pool.query("INSERT INTO funnels (slug, app_id, created_by) VALUES ($1, $2, 't') RETURNING id", [slug, appId])).rows[0].id;
    }
    // Money inside the range: sun (starlyn) paid 13.67 USD; moon (chatchi) paid 9.99 USD and was refunded 9.99 USD
    // (refunds live in the outbox only). ?app=starlyn must not carry any of moon's amounts.
    for (const [n, slug, amount] of [[1, 'sun', 1367], [2, 'moon', 999]]) {
      await db.pool.query(
        `INSERT INTO checkouts (id, paddle_transaction_id, funnel_id, v, plan_key, sid, attribution, status, created_at, completed_at)
         VALUES ($1, $2, $3, 1, '1w', $4, '{}', 'completed', $5, $6)`,
        [`01JA000000000000000000CK0${n}`, `txn_${n}`, ids[slug], sid(10 + n), new Date(H(9)), new Date(H(9, 5))],
      );
      await db.pool.query(
        `INSERT INTO transactions (paddle_transaction_id, checkout_id, status, origin, amount_minor, currency, billed_at, paddle_updated_at)
         VALUES ($1, $2, 'completed', 'web', $3, 'USD', $4, $4)`,
        [`txn_${n}`, `01JA000000000000000000CK0${n}`, amount, new Date(H(9, 5))],
      );
    }
    await db.pool.query(
      'INSERT INTO outbox (topic, aggregate_id, dedupe_key, payload, created_at) VALUES ($1, $2, $3, $4, $5)',
      ['payment.refunded', 'txn_2', 'r2', { paddle_transaction_id: 'txn_2', adjustment_id: 'adj_2', amount_minor: 999, currency: 'USD' }, new Date(H(11))],
    );
    ({ app } = await makeApp(db.pool, { clickhouse, now: () => NOW, admin: { origin: ADMIN_ORIGIN, appEnv: 'staging' } }));
    viewer = await signIn(db.pool, 'vi@ikameglobal.com', 'viewer');
  });
  afterEach(() => app.close());

  const get = (url) => app.inject({ method: 'GET', url, headers: viewer.headers(false) });

  it('?app=starlyn → only starlyn\'s funnels, app_id starlyn (events-only and money-only both present), none of chatchi\'s money', async () => {
    const res = await get(`/v1/analytics/overview?${RANGE}&app=starlyn`);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      range: { from: '2026-10-08T08:00:00.000Z', to: '2026-10-08T12:00:00.000Z' },
      funnels: [
        { ...zero, slug: 'star', app_id: 'starlyn', sessions: 2, leads: 1 },
        { ...zero, slug: 'sun', app_id: 'starlyn', checkouts: 1, paid: 1, revenue: USD(1367) },
      ],
    });
    expect((await get(`/v1/analytics/overview?${RANGE}&app=chatchi`)).json().funnels).toEqual([MOON]);
  });

  it('no app → every funnel with app_id per row (null = unassigned); ghost slugs dropped', async () => {
    const res = await get(`/v1/analytics/overview?${RANGE}`);
    expect(res.json().funnels).toEqual([
      { ...zero, slug: 'star', app_id: 'starlyn', sessions: 2, leads: 1 },
      { ...zero, slug: 'loose', app_id: null, sessions: 1 },
      MOON,
      { ...zero, slug: 'sun', app_id: 'starlyn', checkouts: 1, paid: 1, revenue: USD(1367) },
    ]);
  });

  it('an app without funnels → funnels []; unknown app → 404 app_not_found; malformed → 400', async () => {
    expect((await get(`/v1/analytics/overview?${RANGE}&app=tarot-web`)).json()).toEqual({
      range: { from: '2026-10-08T08:00:00.000Z', to: '2026-10-08T12:00:00.000Z' }, funnels: [],
    });
    const missing = await get(`/v1/analytics/overview?${RANGE}&app=zzz`);
    expect([missing.statusCode, missing.json()]).toEqual([404, { error: 'app_not_found', detail: { app_id: 'zzz' } }]);
    for (const bad of ['BAD!', 'a', 'Starlyn']) {
      const res = await get(`/v1/analytics/overview?${RANGE}&app=${encodeURIComponent(bad)}`);
      expect([res.statusCode, res.json().error], bad).toEqual([400, 'bad_request']);
    }
  });
});
```

`services/core-api/test/analytics-service.test.js`, `services/core-api/test/analytics-http.test.js`, `services/core-api/test/analytics-revenue.test.js` (sửa, áp dụng đúng diff này — fake `funnelSlugs` trả `{slug, app_id}`, dòng overview trong `toEqual` thêm `app_id: null`, test `funnelSlugs` so trên `slug`):

`services/core-api/test/analytics-service.test.js`, `services/core-api/test/analytics-http.test.js`, `services/core-api/test/analytics-revenue.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/test/analytics-http.test.js b/services/core-api/test/analytics-http.test.js
index 5d62a0c..c251ecf 100644
--- a/services/core-api/test/analytics-http.test.js
+++ b/services/core-api/test/analytics-http.test.js
@@ -62,7 +62,7 @@ describe('analytics routes', () => {
     }
     expect(overview.json()).toEqual({
       range: { from: '2026-10-08T08:00:00.000Z', to: '2026-10-08T12:00:00.000Z' },
-      funnels: [{ slug: 'aivideo', sessions: 2, leads: 1, checkouts: 0, paid: 0, revenue: [], refunds: [] }],
+      funnels: [{ slug: 'aivideo', app_id: null, sessions: 2, leads: 1, checkouts: 0, paid: 0, revenue: [], refunds: [] }],
     });
     expect(funnel.json()).toMatchObject({
       by: 'hour', versions: [1, 2], steps: [{ screen: 0, sessions: 1 }], events: [],
diff --git a/services/core-api/test/analytics-revenue.test.js b/services/core-api/test/analytics-revenue.test.js
index 65dc43d..a1c3d90 100644
--- a/services/core-api/test/analytics-revenue.test.js
+++ b/services/core-api/test/analytics-revenue.test.js
@@ -64,7 +64,7 @@ describe('analytics revenue (Postgres)', () => {
   });
 
   it('funnelSlugs: every funnel slug', async () => {
-    expect((await funnelSlugs(db.pool)).sort()).toEqual(['aivideo', 'tarot']);
+    expect((await funnelSlugs(db.pool)).map((f) => f.slug).sort()).toEqual(['aivideo', 'tarot']);
   });
 
   it('by hour: paid by completion hour (once per checkout), revenue by billing hour per currency incl. the renewal', async () => {
diff --git a/services/core-api/test/analytics-service.test.js b/services/core-api/test/analytics-service.test.js
index 8764767..f6de769 100644
--- a/services/core-api/test/analytics-service.test.js
+++ b/services/core-api/test/analytics-service.test.js
@@ -29,7 +29,7 @@ function fakes(over = {}) {
   };
   const revenue = {
     funnelIdOf: rec('funnelIdOf', (slug) => (slug === 'nope' ? null : 7)),
-    funnelSlugs: rec('funnelSlugs', ['aivideo', 'quiz-only', 'paid-only', 'draft']),
+    funnelSlugs: rec('funnelSlugs', ['aivideo', 'quiz-only', 'paid-only', 'draft'].map((slug) => ({ slug, app_id: null }))),
     moneySeries: rec('moneySeries', {
       paid: [{ t: H(8), paid: 1 }],
       revenue: [{ t: H(8), currency: 'JPY', amount_minor: 2000 }, { t: H(8), currency: 'USD', amount_minor: 1367 }],
@@ -146,9 +146,9 @@ describe('analyticsService', () => {
     expect(await s.overview({ from: '2026-10-01T10:37:00Z' })).toEqual({
       range: { from: '2026-10-01T10:00:00.000Z', to: '2026-10-08T11:00:00.000Z' },
       funnels: [
-        { slug: 'quiz-only', sessions: 9, leads: 0, checkouts: 0, paid: 0, revenue: [], refunds: [] },
-        { slug: 'aivideo', sessions: 6, leads: 2, checkouts: 3, paid: 1, revenue: [{ currency: 'USD', amount_minor: 1367 }], refunds: [] },
-        { slug: 'paid-only', sessions: 0, leads: 0, checkouts: 1, paid: 1, revenue: [{ currency: 'JPY', amount_minor: 2000 }], refunds: [{ currency: 'JPY', amount_minor: 2000 }] },
+        { slug: 'quiz-only', app_id: null, sessions: 9, leads: 0, checkouts: 0, paid: 0, revenue: [], refunds: [] },
+        { slug: 'aivideo', app_id: null, sessions: 6, leads: 2, checkouts: 3, paid: 1, revenue: [{ currency: 'USD', amount_minor: 1367 }], refunds: [] },
+        { slug: 'paid-only', app_id: null, sessions: 0, leads: 0, checkouts: 1, paid: 1, revenue: [{ currency: 'JPY', amount_minor: 2000 }], refunds: [{ currency: 'JPY', amount_minor: 2000 }] },
       ],
     });
   });
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/analytics-app.test.js test/analytics-app-http.test.js
```

Expected: `Test Files  2 failed (2)`, `Tests  10 failed (10)`: 5 test service fail vì `overview` bỏ qua `app` (dòng không có `app_id`, không lọc, `funnelSlugs`/`moneyOverview` không nhận `app`; app rỗng vẫn gọi ClickHouse, `expected 3 to be 9` ở test cache key); 2 test `chParam` fail (`chParam is not a function`, URL gửi `param_slugs=star,sun`); 3 test HTTP fail vì schema chưa nhận `app` (400 thay vì 200/404) và dòng chưa có `app_id` (test HTTP có tiền thật ở cả hai app: `sun` của starlyn paid 13.67 USD, `moon` của chatchi paid 9.99 USD + refund 9.99 USD trong outbox; `?app=starlyn` không được chứa tiền của `moon`). (Ba file test cũ đã sửa ở Step 1 cũng fail ở bước này cho tới khi implement.)

- [ ] **Step 3: Implement**

`services/core-api/src/analytics/clickhouse.js`, `services/core-api/src/analytics/queries.js` (sửa, áp dụng đúng diff này):

`services/core-api/src/analytics/clickhouse.js`, `services/core-api/src/analytics/queries.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/analytics/clickhouse.js b/services/core-api/src/analytics/clickhouse.js
index 36ada2e..3422735 100644
--- a/services/core-api/src/analytics/clickhouse.js
+++ b/services/core-api/src/analytics/clickhouse.js
@@ -13,6 +13,11 @@ export class ClickhouseError extends Error {
   }
 }
 
+// A parameter's value as the HTTP interface reads it: scalars as text, an array (e.g. {slugs:Array(String)}) as a
+// literal ['a','b'] with \ and ' escaped (spec admin-console-p4a §2 "Analytics": funnel IN the app's slugs).
+const quote = (x) => (typeof x === 'string' ? `'${x.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'` : String(x));
+export const chParam = (v) => (Array.isArray(v) ? `[${v.map(quote).join(',')}]` : String(v));
+
 export function createClickhouse({ url, user, password, database, fetch = globalThis.fetch, timeoutMs = CLICKHOUSE_TIMEOUT_MS }) {
   const base = url.replace(/\/+$/, '');
   const authorization = `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`;
@@ -26,7 +31,7 @@ export function createClickhouse({ url, user, password, database, fetch = global
 
   async function once(sql, params) {
     const qs = new URLSearchParams({ database, default_format: 'JSONEachRow', ...settings });
-    for (const [k, v] of Object.entries(params)) qs.set(`param_${k}`, String(v));
+    for (const [k, v] of Object.entries(params)) qs.set(`param_${k}`, chParam(v));
     let rows;
     try {
       const res = await fetch(`${base}/?${qs}`, { method: 'POST', headers: { authorization }, body: sql, signal: AbortSignal.timeout(timeoutMs) });
diff --git a/services/core-api/src/analytics/queries.js b/services/core-api/src/analytics/queries.js
index 482004e..5f2a4ad 100644
--- a/services/core-api/src/analytics/queries.js
+++ b/services/core-api/src/analytics/queries.js
@@ -68,11 +68,13 @@ export async function eventBreakdown(ch, q) {
   );
 }
 
-// Every funnel with events in the range: sessions and leads.
-export async function eventOverview(ch, { from, to }) {
+// Every funnel with events in the range: sessions and leads. slugs (spec admin-console-p4a §2 "Analytics",
+// decision #4): only these funnels — an app's slugs from Postgres, ClickHouse has no app column.
+export async function eventOverview(ch, { from, to, slugs }) {
   return ch.query(
     `SELECT funnel AS slug, uniqExactMerge(h.sessions) AS sessions, uniqExactMergeIf(h.sessions, name = 'lead') AS leads
-       FROM funnel_hourly AS h WHERE ${where({ from, to })} GROUP BY funnel ORDER BY sessions DESC, slug`,
-    params({ from, to }),
+       FROM funnel_hourly AS h WHERE ${where({ from, to })}${slugs ? ' AND funnel IN {slugs:Array(String)}' : ''}
+      GROUP BY funnel ORDER BY sessions DESC, slug`,
+    { ...params({ from, to }), ...(slugs && { slugs }) },
   );
 }
PATCH
```

`services/core-api/src/analytics/revenue.js`, `services/core-api/src/analytics/service.js` (sửa, áp dụng đúng diff này):

`services/core-api/src/analytics/revenue.js`, `services/core-api/src/analytics/service.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/analytics/revenue.js b/services/core-api/src/analytics/revenue.js
index b880793..bd3fb43 100644
--- a/services/core-api/src/analytics/revenue.js
+++ b/services/core-api/src/analytics/revenue.js
@@ -36,10 +36,11 @@ export async function funnelIdOf(pool, slug) {
   return rows.length ? Number(rows[0].id) : null;
 }
 
-// Every funnel slug Postgres knows: the overview keeps only these (ClickHouse may hold slugs of deleted funnels).
-export async function funnelSlugs(pool) {
-  const { rows } = await pool.query('SELECT slug FROM funnels');
-  return rows.map((r) => r.slug);
+// Every funnel Postgres knows, with its app: the overview keeps only these (ClickHouse may hold slugs of deleted
+// funnels). app (spec admin-console-p4a §2 "Analytics"): only that app's funnels.
+export async function funnelSlugs(pool, { app = null } = {}) {
+  const { rows } = await pool.query('SELECT slug, app_id FROM funnels WHERE $1::text IS NULL OR app_id = $1', [app]);
+  return rows.map((r) => ({ slug: r.slug, app_id: r.app_id }));
 }
 
 // q = {funnelId, from, to, by: 'hour'|'day', v} → {paid: [{t, paid}], revenue: [{t, currency, amount_minor}]}, t = epoch ms (UTC).
@@ -85,28 +86,34 @@ export async function moneyBreakdown(pool, q) {
 }
 
 // Every funnel with a checkout opened, paid, billed or refunded in [from, to): {slug, checkouts, paid, revenue, refunds}.
-export async function moneyOverview(pool, { from, to }) {
+// app (spec admin-console-p4a §2 "Analytics"): only that app's funnels (f.app_id = $n on each query).
+export async function moneyOverview(pool, { from, to }, { app = null } = {}) {
   const args = [from, to, [...PAID]];
+  // The query's args, with the app pushed last when there is one: [args, " AND f.app_id = $n" or ''].
+  const scoped = (base) => (app === null ? [base, ''] : [[...base, app], ` AND f.app_id = $${base.length + 1}`]);
+  const [openedArgs, openedApp] = scoped(args.slice(0, 2));
+  const [paidArgs, paidApp] = scoped(args);
+  const [refundArgs, refundApp] = scoped([from, to, REFUND_TOPICS]);
   const [opened, paid, revenue, refunds] = await Promise.all([
     pool.query(
       `SELECT f.slug, count(*)::int AS n FROM checkouts c JOIN funnels f ON f.id = c.funnel_id
-        WHERE c.created_at >= $1 AND c.created_at < $2 GROUP BY 1`,
-      args.slice(0, 2),
+        WHERE c.created_at >= $1 AND c.created_at < $2${openedApp} GROUP BY 1`,
+      openedArgs,
     ),
-    pool.query(`SELECT f.slug, count(*)::int AS n FROM checkouts c JOIN funnels f ON f.id = c.funnel_id WHERE ${PAID_WHERE} GROUP BY 1`, args),
+    pool.query(`SELECT f.slug, count(*)::int AS n FROM checkouts c JOIN funnels f ON f.id = c.funnel_id WHERE ${PAID_WHERE}${paidApp} GROUP BY 1`, paidArgs),
     pool.query(
       `SELECT f.slug, t.currency, sum(t.amount_minor) AS amount_minor
          FROM transactions t JOIN checkouts c ON c.id = t.checkout_id JOIN funnels f ON f.id = c.funnel_id
-        WHERE ${REVENUE_WHERE} GROUP BY 1, 2 ORDER BY 1, 2`,
-      args,
+        WHERE ${REVENUE_WHERE}${paidApp} GROUP BY 1, 2 ORDER BY 1, 2`,
+      paidArgs,
     ),
     pool.query(
       `SELECT f.slug, o.payload->>'currency' AS currency, sum((o.payload->>'amount_minor')::bigint) AS amount_minor
          FROM outbox o
          JOIN transactions t ON t.paddle_transaction_id = o.payload->>'paddle_transaction_id'
          JOIN checkouts c ON c.id = t.checkout_id JOIN funnels f ON f.id = c.funnel_id
-        WHERE o.topic = ANY($3) AND o.created_at >= $1 AND o.created_at < $2 GROUP BY 1, 2 ORDER BY 1, 2`,
-      [from, to, REFUND_TOPICS],
+        WHERE o.topic = ANY($3) AND o.created_at >= $1 AND o.created_at < $2${refundApp} GROUP BY 1, 2 ORDER BY 1, 2`,
+      refundArgs,
     ),
   ]);
   const rows = new Map();
diff --git a/services/core-api/src/analytics/service.js b/services/core-api/src/analytics/service.js
index fcf57a0..11268a6 100644
--- a/services/core-api/src/analytics/service.js
+++ b/services/core-api/src/analytics/service.js
@@ -62,16 +62,23 @@ export function analyticsService({ pool, clickhouse, now = Date.now, ttlMs = CAC
 
   return {
     // GET /v1/analytics/overview: every funnel (in Postgres) with events or a checkout in the range, most sessions first.
+    // Spec admin-console-p4a §2 "Analytics", decision #4: app → that app's slugs (Postgres) filter both sources, and
+    // an app without funnels answers [] without asking ClickHouse; every row carries its app_id (null = unassigned).
     async overview(query) {
       const r = resolveRange({ ...query, by: 'day' }, now());
-      return cached(keyOf('overview', '', r), async () => {
-        const [events, money, slugs] = await Promise.all([queries.eventOverview(clickhouse, r), revenue.moneyOverview(pool, r), revenue.funnelSlugs(pool)]);
-        const known = new Set(slugs);
+      const app = query.app ?? null;
+      return cached(keyOf('overview', app ?? '', r), async () => {
+        const known = new Map((await revenue.funnelSlugs(pool, { app })).map((f) => [f.slug, f.app_id]));
+        if (app !== null && !known.size) return { range: range(r), funnels: [] };
+        const [events, money] = await Promise.all([
+          queries.eventOverview(clickhouse, app === null ? r : { ...r, slugs: [...known.keys()] }),
+          revenue.moneyOverview(pool, r, { app }),
+        ]);
         const rows = new Map(money.map((m) => [m.slug, { slug: m.slug, sessions: 0, leads: 0, ...m }]));
         // A slug only ClickHouse has seen (a deleted funnel, a slug the client sent) has no page: dropped (final review M4).
         for (const e of events) if (known.has(e.slug)) rows.set(e.slug, { checkouts: 0, paid: 0, revenue: [], refunds: [], ...rows.get(e.slug), ...e });
         const funnels = [...rows.values()]
-          .map(({ slug, sessions, leads, checkouts, paid, revenue: rev, refunds }) => ({ slug, sessions, leads, checkouts, paid, revenue: rev, refunds }))
+          .map(({ slug, sessions, leads, checkouts, paid, revenue: rev, refunds }) => ({ slug, app_id: known.get(slug) ?? null, sessions, leads, checkouts, paid, revenue: rev, refunds }))
           .sort((a, b) => b.sessions - a.sessions || byText('slug')(a, b));
         return { range: range(r), funnels };
       });
PATCH
```

`services/core-api/src/http/analytics.js` (sửa, áp dụng đúng diff này):

`services/core-api/src/http/analytics.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/http/analytics.js b/services/core-api/src/http/analytics.js
index c4cbc57..c6911f0 100644
--- a/services/core-api/src/http/analytics.js
+++ b/services/core-api/src/http/analytics.js
@@ -31,8 +31,19 @@ export default async function analyticsHttp(app, { pool, clickhouse, now = Date.
     }
   }
 
-  app.get('/v1/analytics/overview', { onRequest: viewer, schema: { querystring: query({}) } }, (req, reply) =>
-    answer(req, reply, 'overview', () => service.overview(req.query)));
+  // Spec admin-console-p4a §2 "Analytics": ?app= is one app's funnels; an unknown app is 404 app_not_found (checked
+  // here, before ClickHouse: a schema miss could only answer bad_request).
+  app.get(
+    '/v1/analytics/overview',
+    { onRequest: viewer, schema: { querystring: query({ app: { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{1,30}$' } }) } },
+    async (req, reply) => {
+      const appId = req.query.app;
+      if (appId !== undefined && !(await pool.query('SELECT 1 FROM apps WHERE id = $1', [appId])).rows.length) {
+        throw new HttpError(404, 'app_not_found', { app_id: appId });
+      }
+      return answer(req, reply, 'overview', () => service.overview(req.query));
+    },
+  );
 
   app.get(
     '/v1/analytics/funnels/:slug',
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/analytics-app.test.js test/analytics-app-http.test.js
npm test -w @ikf/core-api -- test/analytics
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  10 passed (10)`; `test/analytics` `Test Files  8 passed (8)`, `Tests  66 passed (66)`; toàn bộ core-api `Test Files  67 passed (67)`, `Tests  613 passed (613)`.

- [ ] **Step 5: Commit**

```bash
git add services/core-api/src/analytics/clickhouse.js services/core-api/src/analytics/queries.js services/core-api/src/analytics/revenue.js services/core-api/src/analytics/service.js services/core-api/src/http/analytics.js services/core-api/test/analytics-app.test.js services/core-api/test/analytics-app-http.test.js services/core-api/test/analytics-http.test.js services/core-api/test/analytics-revenue.test.js services/core-api/test/analytics-service.test.js
git commit -m "feat(core-api): analytics overview filtered by app, app_id per row
```

---

---

### Task 7: CLI — `funnel create/ls`, `publish --app`, `domain ls/set`, `app show`, `app ls` counts, `stats --app`

**Files:**
- Modify: `packages/cli/src/main.js`, `packages/cli/src/api.js`, `packages/cli/src/publish.js`
- Test: `packages/cli/test/funnel-app.test.js`, `packages/cli/test/domain.test.js`, `packages/cli/test/app-show.test.js`, `packages/cli/test/stats-app.test.js`, `packages/cli/test/publish-app.test.js` (mới); `packages/cli/test/app.test.js` (sửa: bảng `app ls` thêm 3 count)

**Interfaces:**
- Consumes: `POST /v1/funnels {slug, app_id}` (400 `app_required`, 404 `app_not_found {app_id}`, 409 `funnel_exists`) và `GET /v1/funnels?app=<id|none>` (Task 2); upload `POST /v1/funnels/:slug/versions {html, sha256, lint_report, app_id?}` (400 `app_required {funnel}`, 409 `funnel_app_mismatch {app_id}`) (Task 2); `PUT /v1/funnels/:slug {app_id: null}` → 400 `app_required` (Task 2); `GET /v1/domains?app=` (dòng có `app_id`, `routes`) và `PUT /v1/domains/:host {status?, app_id?}` → `{host, status, app_id}`, 409 `domain_has_foreign_routes {routes: [{prefix, slug, app_id}]}` (Task 3); `GET /v1/apps` / `GET /v1/apps/:id` với `funnels_count, domains_count, live_routes_count`, 404 `app_not_found {id}` (Task 4); `GET /v1/analytics/overview?from&to&app=` → `{range, funnels: [{slug, app_id, sessions, leads, checkouts, paid, revenue, refunds}]}`, 404 `app_not_found {app_id}` (Task 6).
- Produces: lệnh `ikf funnel create <slug> --app <id>`, `ikf funnel ls [--app <id> | --unassigned]`, `ikf publish <folder> --slug <slug> [--app <id>]`, `ikf domain ls [--app <id>]`, `ikf domain set <host> [--status active|disabled] [--app <id> | --shared]`, `ikf app show <id>`, `ikf app ls` (thêm `N funnel N domain N live`), `ikf stats --app <id> [--days 7]`; `api.js`: `createFunnel(body)` (không retry), `listFunnels({app})`, `listDomains({app})`, `setDomain(host, body)`, `getApp(id)`, `getOverview({from, to, app})` (retry như các GET/PUT idempotent); `publishCommand({..., app})` gửi `app_id` khi có; `formatApiError(e, cmd)` thêm thông báo cho `app_required` (theo `cmd`), `app_not_found`, `funnel_app_mismatch`, `domain_has_foreign_routes`.

- [ ] **Step 1: Viết test fail**

`packages/cli/test/funnel-app.test.js` (mới):

`packages/cli/test/funnel-app.test.js` (mới):

```js
import { describe, it, expect } from 'vitest';
import { run } from '../src/main.js';
import { ApiError, createApi } from '../src/api.js';
import { io } from './helpers/io.js';

const funnel = (extra = {}) => ({ slug: 'moon-reading', latest_v: 3, live: [], pixel_id: null, app_id: 'starlyn', updated_at: '2026-10-12T10:00:00.000Z', ...extra });

// Spec admin-console-p4a §2 "CLI": a new funnel always belongs to an app.
describe('ikf funnel create', () => {
  it('POSTs {slug, app_id} and prints the funnel and its app', async () => {
    const calls = [];
    const t = io({ createFunnel: async (body) => { calls.push(body); return { slug: body.slug, app_id: body.app_id, pixel_id: null, versions: [], live: [] }; } });
    expect(await run(['funnel', 'create', 'moon-reading', '--app', 'starlyn'], t.opts)).toBe(0);
    expect(calls).toEqual([{ slug: 'moon-reading', app_id: 'starlyn' }]);
    expect(t.lines).toEqual(['Đã tạo funnel moon-reading (app starlyn)']);
  });

  it.each([
    [['funnel', 'create', 'moon-reading'], 'funnel create cần --app <id>'],
    [['funnel', 'create'], 'cách dùng: ikf funnel create <slug> --app <id>'],
    [['funnel', 'create', 'Bad_Slug', '--app', 'starlyn'], 'slug không hợp lệ: "Bad_Slug"'],
    [['funnel', 'create', 'moon-reading', '--app', 'S'], 'app id không hợp lệ: "S"'],
  ])('exit 2 for %j without calling the API', async (argv, msg) => {
    const t = io({ createFunnel: async () => { throw new Error('must not be called'); } });
    expect(await run(argv, t.opts)).toBe(2);
    expect(t.errors).toEqual([msg]);
  });

  it('an unknown app: exit 1 with how to list the apps', async () => {
    const t = io({ createFunnel: async () => { throw new ApiError(404, { error: 'app_not_found', detail: { app_id: 'ghost' } }); } });
    expect(await run(['funnel', 'create', 'moon-reading', '--app', 'ghost'], t.opts)).toBe(1);
    expect(t.errors).toEqual(['Không có app "ghost" (xem: ikf app ls)']);
  });
});

describe('ikf funnel ls', () => {
  it('lists slug, app, latest version and live route count; --app filters, --unassigned = app none', async () => {
    const calls = [];
    const rows = [
      funnel({ live: [{ host: 'try.starlyn.app', prefix: '/', v: 3 }, { host: 'try.starlyn.app', prefix: '/b', v: 2 }] }),
      funnel({ slug: 'old-quiz', app_id: null, latest_v: null }),
    ];
    const t = io({ listFunnels: async (q) => { calls.push(q); return { funnels: rows }; } });
    expect(await run(['funnel', 'ls'], t.opts)).toBe(0);
    expect(await run(['funnel', 'ls', '--app', 'starlyn'], t.opts)).toBe(0);
    expect(await run(['funnel', 'ls', '--unassigned'], t.opts)).toBe(0);
    expect(calls).toEqual([{ app: undefined }, { app: 'starlyn' }, { app: 'none' }]);
    expect(t.lines.slice(0, 2)).toEqual([
      'moon-reading                 starlyn              v3    2 route live',
      'old-quiz                     (chưa gán)           -     0 route live',
    ]);
  });

  it('says when there is no funnel', async () => {
    const t = io({ listFunnels: async () => ({ funnels: [] }) });
    await run(['funnel', 'ls', '--unassigned'], t.opts);
    expect(t.lines).toEqual(['(chưa có funnel nào)']);
  });

  it.each([
    [['funnel', 'ls', '--app', 'starlyn', '--unassigned'], 'cần nhiều nhất một trong --app <id> hoặc --unassigned'],
    [['funnel', 'ls', '--app', 'S'], 'app id không hợp lệ: "S"'],
  ])('exit 2 for %j', async (argv, msg) => {
    const t = io({ listFunnels: async () => { throw new Error('must not be called'); } });
    expect(await run(argv, t.opts)).toBe(2);
    expect(t.errors).toEqual([msg]);
  });
});

describe('ikf funnel set --no-app after 4a', () => {
  it('the server refuses to unassign (400 app_required): exit 1 with what to do instead', async () => {
    const t = io({ setFunnel: async () => { throw new ApiError(400, { error: 'app_required', detail: { funnel: 'moon-reading' } }); } });
    expect(await run(['funnel', 'set', 'moon-reading', '--no-app'], t.opts)).toBe(1);
    expect(t.errors).toEqual(['Funnel phải thuộc một app, không gỡ được (đổi app: ikf funnel set <slug> --app <id>)']);
  });
});

describe('api: funnels', () => {
  const fakeFetch = (statuses) => {
    const calls = [];
    const fetch = async (url, init) => {
      calls.push({ url, method: init.method, body: init.body ? JSON.parse(init.body) : undefined });
      return new Response('{"funnels":[]}', { status: statuses.shift() ?? 200 });
    };
    return { calls, fetch };
  };

  it('createFunnel POSTs the body and is never retried (a lost reply would turn into 409 funnel_exists)', async () => {
    const f = fakeFetch([503]);
    const api = createApi({ api: 'https://api.x', token: 't' }, { fetch: f.fetch, sleep: async () => {} });
    await expect(api.createFunnel({ slug: 'moon-reading', app_id: 'starlyn' })).rejects.toMatchObject({ status: 503 });
    expect(f.calls).toEqual([{ url: 'https://api.x/v1/funnels', method: 'POST', body: { slug: 'moon-reading', app_id: 'starlyn' } }]);
  });

  it('listFunnels GETs with ?app= when given, retried like every read', async () => {
    const f = fakeFetch([503, 200, 200]);
    const api = createApi({ api: 'https://api.x', token: 't' }, { fetch: f.fetch, sleep: async () => {} });
    expect(await api.listFunnels({ app: 'none' })).toEqual({ funnels: [] });
    await api.listFunnels();
    expect(f.calls.map((c) => [c.method, c.url])).toEqual([
      ['GET', 'https://api.x/v1/funnels?app=none'],
      ['GET', 'https://api.x/v1/funnels?app=none'],
      ['GET', 'https://api.x/v1/funnels'],
    ]);
  });
});
```

`packages/cli/test/domain.test.js` (mới):

`packages/cli/test/domain.test.js` (mới):

```js
import { describe, it, expect } from 'vitest';
import { run } from '../src/main.js';
import { ApiError, createApi } from '../src/api.js';
import { io } from './helpers/io.js';

const DOMAINS = [
  { host: 'demo.ikf.dev', status: 'disabled', app_id: null, rev: 1, kv_synced_rev: 1, routes: [] },
  {
    host: 'try.starlyn.app', status: 'active', app_id: 'starlyn', rev: 3, kv_synced_rev: 3,
    routes: [{ prefix: '/', slug: 'moon-reading', v: 3 }, { prefix: '/b', slug: 'moon-reading', v: 2 }],
  },
];

// Spec admin-console-p4a §2 "CLI": a domain belongs to one app or is shared (app_id null).
describe('ikf domain ls', () => {
  it('lists host, app (or shared), status and route count; --app asks for that app’s hosts and the shared ones', async () => {
    const calls = [];
    const t = io({ listDomains: async (q) => { calls.push(q); return { domains: DOMAINS }; } });
    expect(await run(['domain', 'ls'], t.opts)).toBe(0);
    expect(await run(['domain', 'ls', '--app', 'starlyn'], t.opts)).toBe(0);
    expect(calls).toEqual([{ app: undefined }, { app: 'starlyn' }]);
    expect(t.lines.slice(0, 2)).toEqual([
      'demo.ikf.dev                     (dùng chung)         disabled 0 route',
      'try.starlyn.app                  starlyn              active   2 route',
    ]);
  });

  it('says when there is no domain; a malformed --app is exit 2', async () => {
    const t = io({ listDomains: async () => ({ domains: [] }) });
    await run(['domain', 'ls'], t.opts);
    expect(t.lines).toEqual(['(chưa có domain nào)']);
    expect(await run(['domain', 'ls', '--app', 'S'], t.opts)).toBe(2);
    expect(t.errors).toEqual(['app id không hợp lệ: "S"']);
  });
});

describe('ikf domain set', () => {
  it('--app, --shared and --status send only what was given and print the result', async () => {
    const calls = [];
    const t = io({
      setDomain: async (host, body) => {
        calls.push([host, body]);
        return { host, status: body.status ?? 'active', app_id: body.app_id === undefined ? 'starlyn' : body.app_id };
      },
    });
    expect(await run(['domain', 'set', 'try.starlyn.app', '--app', 'starlyn'], t.opts)).toBe(0);
    expect(await run(['domain', 'set', 'try.starlyn.app', '--shared'], t.opts)).toBe(0);
    expect(await run(['domain', 'set', 'try.starlyn.app', '--status', 'disabled'], t.opts)).toBe(0);
    expect(await run(['domain', 'set', 'TRY.starlyn.app', '--status', 'active', '--app', 'chatchi'], t.opts)).toBe(0);
    expect(calls).toEqual([
      ['try.starlyn.app', { app_id: 'starlyn' }],
      ['try.starlyn.app', { app_id: null }],
      ['try.starlyn.app', { status: 'disabled' }],
      ['try.starlyn.app', { status: 'active', app_id: 'chatchi' }],
    ]);
    expect(t.lines).toEqual([
      'try.starlyn.app: active, app starlyn',
      'try.starlyn.app: active, dùng chung',
      'try.starlyn.app: disabled, app starlyn',
      'try.starlyn.app: active, app chatchi',
    ]);
  });

  it.each([
    [['domain', 'set', 'try.starlyn.app'], 'cần --status active|disabled và/hoặc --app <id> | --shared'],
    [['domain', 'set', 'try.starlyn.app', '--app', 'starlyn', '--shared'], 'cần đúng một trong --app <id> hoặc --shared'],
    [['domain', 'set', 'try.starlyn.app', '--status', 'paused'], '--status phải là active hoặc disabled'],
    [['domain', 'set', 'try.starlyn.app', '--app', 'S'], 'app id không hợp lệ: "S"'],
    [['domain', 'set', 'try.starlyn.app/quiz', '--shared'], 'domain set chỉ nhận host, không có path: "try.starlyn.app/quiz"'],
    [['domain', 'set', 'nohost', '--shared'], 'không đọc được host trong "nohost" (ví dụ: try.x.com/tiktok-ugc)'],
    [['domain', 'set', '--shared'], 'cách dùng: ikf domain set <host> [--status active|disabled] [--app <id> | --shared]'],
  ])('exit 2 for %j without calling the API', async (argv, msg) => {
    const t = io({ setDomain: async () => { throw new Error('must not be called'); } });
    expect(await run(argv, t.opts)).toBe(2);
    expect(t.errors).toEqual([msg]);
  });

  it('an unknown domain subcommand prints the usage', async () => {
    const t = io();
    expect(await run(['domain', 'rm', 'try.starlyn.app'], t.opts)).toBe(2);
    expect(t.errors[0]).toContain('ikf domain set <host> [--status active|disabled] [--app <id> | --shared]');
  });

  it('409 domain_has_foreign_routes: exit 1 with every blocking route', async () => {
    const t = io({
      setDomain: async () => {
        throw new ApiError(409, {
          error: 'domain_has_foreign_routes',
          detail: { routes: [{ prefix: '/', slug: 'chat-taste', app_id: 'chatchi' }, { prefix: '/old', slug: 'old-quiz', app_id: null }] },
        });
      },
    });
    expect(await run(['domain', 'set', 'try.starlyn.app', '--app', 'starlyn'], t.opts)).toBe(1);
    expect(t.errors).toEqual([
      'Không gán được: host đang có route live của funnel thuộc app khác (hoặc chưa gán app):\n'
      + '  / → chat-taste (app chatchi)\n'
      + '  /old → old-quiz (chưa gán app)\n'
      + 'Chuyển hoặc gỡ các route này trước (ikf route set / ikf route rm), rồi chạy lại.',
    ]);
  });
});

describe('api: domains', () => {
  it('listDomains GETs with ?app=; setDomain PUTs the body; both retried on 503', async () => {
    const calls = [];
    const statuses = [503, 200, 200, 503, 200];
    const fetch = async (url, init) => {
      calls.push([init.method, url, init.body ? JSON.parse(init.body) : undefined]);
      return new Response('{}', { status: statuses.shift() });
    };
    const api = createApi({ api: 'https://api.x', token: 't' }, { fetch, sleep: async () => {} });
    await api.listDomains({ app: 'starlyn' });
    await api.listDomains();
    await api.setDomain('try.starlyn.app', { app_id: null });
    expect(calls).toEqual([
      ['GET', 'https://api.x/v1/domains?app=starlyn', undefined],
      ['GET', 'https://api.x/v1/domains?app=starlyn', undefined],
      ['GET', 'https://api.x/v1/domains', undefined],
      ['PUT', 'https://api.x/v1/domains/try.starlyn.app', { app_id: null }],
      ['PUT', 'https://api.x/v1/domains/try.starlyn.app', { app_id: null }],
    ]);
  });
});
```

`packages/cli/test/app-show.test.js` (mới):

`packages/cli/test/app-show.test.js` (mới):

```js
import { describe, it, expect } from 'vitest';
import { run } from '../src/main.js';
import { ApiError, createApi } from '../src/api.js';
import { io } from './helpers/io.js';

const starlyn = {
  id: 'starlyn', name: 'Starlyn', kind: 'app', adjust_tracker_url: 'https://app.adjust.com/abc', deeplink_scheme: 'starlyn',
  return_url: null, webhook_url: 'https://be.example/hook', handoff: 'user_id', deeplink_path: 'open', bundle_ids: ['com.ikame.starlyn', '6471234567'],
  prev_key_expires_at: null, created_at: '2026-10-01T10:00:00.000Z', funnels_count: 3, domains_count: 1, live_routes_count: 4,
};

// Spec admin-console-p4a §2 "CLI": ikf app show <id> = GET /v1/apps/:id, the app and its 3 counts.
describe('ikf app show', () => {
  it('prints the app, its non-empty fields and the 3 counts', async () => {
    const calls = [];
    const t = io({ getApp: async (id) => { calls.push(id); return starlyn; } });
    expect(await run(['app', 'show', 'starlyn'], t.opts)).toBe(0);
    expect(calls).toEqual(['starlyn']);
    expect(t.lines).toEqual([
      'starlyn  Starlyn (app)',
      '  handoff         user_id',
      '  webhook         https://be.example/hook',
      '  adjust          https://app.adjust.com/abc',
      '  scheme          starlyn',
      '  deeplink path   open',
      '  bundle ids      com.ikame.starlyn, 6471234567',
      '  Funnels 3 · Domains 1 · Route live 4',
    ]);
  });

  it('a web app shows its return url and a key still in its 24h window', async () => {
    const web = {
      ...starlyn, id: 'tarot-web', name: 'Tarot', kind: 'web', adjust_tracker_url: null, deeplink_scheme: null, handoff: null, deeplink_path: null,
      bundle_ids: [], return_url: 'https://tarot.example/welcome', prev_key_expires_at: '2026-10-13T10:00:00.000Z', funnels_count: 0, domains_count: 0, live_routes_count: 0,
    };
    const t = io({ getApp: async () => web });
    await run(['app', 'show', 'tarot-web'], t.opts);
    expect(t.lines).toEqual([
      'tarot-web  Tarot (web)',
      '  webhook         https://be.example/hook',
      '  return url      https://tarot.example/welcome',
      '  key cũ tới      2026-10-13T10:00:00.000Z',
      '  Funnels 0 · Domains 0 · Route live 0',
    ]);
  });

  it('404 app_not_found: exit 1', async () => {
    const t = io({ getApp: async () => { throw new ApiError(404, { error: 'app_not_found', detail: { id: 'ghost' } }); } });
    expect(await run(['app', 'show', 'ghost'], t.opts)).toBe(1);
    expect(t.errors).toEqual(['Không có app "ghost" (xem: ikf app ls)']);
  });

  it('exit 2 for a missing or malformed id', async () => {
    const t = io({ getApp: async () => { throw new Error('must not be called'); } });
    expect(await run(['app', 'show'], t.opts)).toBe(2);
    expect(await run(['app', 'show', 'S'], t.opts)).toBe(2);
    expect(t.errors[0]).toContain('ikf app show <id>');
    expect(t.errors[1]).toBe('app id không hợp lệ: "S"');
  });

  it('api.getApp GETs /v1/apps/:id, retried like every read', async () => {
    const calls = [];
    const statuses = [503, 200];
    const fetch = async (url, init) => { calls.push([init.method, url]); return new Response(JSON.stringify(starlyn), { status: statuses.shift() }); };
    const api = createApi({ api: 'https://api.x', token: 't' }, { fetch, sleep: async () => {} });
    expect(await api.getApp('starlyn')).toEqual(starlyn);
    expect(calls).toEqual([['GET', 'https://api.x/v1/apps/starlyn'], ['GET', 'https://api.x/v1/apps/starlyn']]);
  });
});
```

`packages/cli/test/stats-app.test.js` (mới):

`packages/cli/test/stats-app.test.js` (mới):

```js
import { describe, it, expect } from 'vitest';
import { run } from '../src/main.js';
import { ApiError, createApi } from '../src/api.js';
import { io } from './helpers/io.js';

const NOW = Date.UTC(2026, 9, 8, 10, 37);
const OVERVIEW = {
  range: { from: '2026-10-01T10:00:00.000Z', to: '2026-10-08T11:00:00.000Z' },
  funnels: [
    {
      slug: 'moon-reading', app_id: 'starlyn', sessions: 200, leads: 60, checkouts: 30, paid: 10,
      revenue: [{ currency: 'USD', amount_minor: 2734 }, { currency: 'JPY', amount_minor: 2000 }], refunds: [],
    },
    { slug: 'starlyn-quiz', app_id: 'starlyn', sessions: 50, leads: 5, checkouts: 2, paid: 1, revenue: [{ currency: 'USD', amount_minor: 999 }], refunds: [] },
    { slug: 'starlyn-tarot', app_id: 'starlyn', sessions: 7, leads: 0, checkouts: 0, paid: 0, revenue: [], refunds: [] },
  ],
};

function harness(overview = OVERVIEW) {
  const calls = [];
  const t = io({
    getOverview: async (q) => { calls.push(q); return overview; },
    funnelStats: async () => { throw new Error('must not be called'); },
  });
  t.opts.deps.now = () => NOW;
  return { t, calls };
}

// Spec admin-console-p4a §2 "Analytics": ikf stats --app <id> [--days 7] = the app's overview + a total line.
describe('ikf stats --app', () => {
  it('7 days by default: one line per funnel and a Tổng line (revenue per currency, JPY without decimals)', async () => {
    const { t, calls } = harness();
    expect(await run(['stats', '--app', 'starlyn'], t.opts)).toBe(0);
    expect(calls).toEqual([{ from: '2026-10-01T10:37:00.000Z', to: '2026-10-08T10:37:00.000Z', app: 'starlyn' }]);
    expect(t.lines).toEqual([
      'App starlyn: 2026-10-01T10:00:00.000Z → 2026-10-08T11:00:00.000Z (UTC)',
      '  funnel                   sessions    leads  checkouts     paid  doanh thu (gross)',
      '  moon-reading                  200       60         30       10  2000 JPY, 27.34 USD',
      '  starlyn-quiz                   50        5          2        1  9.99 USD',
      '  starlyn-tarot                   7        0          0        0  —',
      '  Tổng                          257       65         32       11  2000 JPY, 37.33 USD',
    ]);
  });

  it('--days 30 asks for 30 days; an app without numbers still prints the Tổng line', async () => {
    const { t, calls } = harness({ range: OVERVIEW.range, funnels: [] });
    expect(await run(['stats', '--app', 'starlyn', '--days', '30'], t.opts)).toBe(0);
    expect((Date.parse(calls[0].to) - Date.parse(calls[0].from)) / 86_400_000).toBe(30);
    expect(t.lines.slice(2)).toEqual([
      '  (chưa có số liệu)',
      '  Tổng                            0        0          0        0  —',
    ]);
  });

  it.each([
    [['stats', 'moon-reading', '--app', 'starlyn'], 'cần <slug> hoặc --app <id>, không cả hai'],
    [['stats', '--app', 'S'], 'app id không hợp lệ: "S"'],
    [['stats', '--app', 'starlyn', '--days', '91'], '--days phải là số nguyên từ 1 đến 90'],
    [['stats', '--app', 'starlyn', '--by', 'hour'], '--by chỉ dùng với <slug> (tổng quan app tính theo ngày)'],
  ])('exit 2 for %j', async (argv, msg) => {
    const { t, calls } = harness();
    expect(await run(argv, t.opts)).toBe(2);
    expect(t.errors).toEqual([msg]);
    expect(calls).toEqual([]);
  });

  it('404 app_not_found: exit 1', async () => {
    const t = io({ getOverview: async () => { throw new ApiError(404, { error: 'app_not_found', detail: { app_id: 'ghost' } }); } });
    expect(await run(['stats', '--app', 'ghost'], t.opts)).toBe(1);
    expect(t.errors).toEqual(['Không có app "ghost" (xem: ikf app ls)']);
  });

  it('api.getOverview: GET with from, to and app in the query string, retried like every read', async () => {
    const calls = [];
    const responses = [new Response('{}', { status: 503 }), new Response(JSON.stringify(OVERVIEW), { status: 200 }), new Response('{}', { status: 200 })];
    const api = createApi({ api: 'https://api.x', token: 't' }, { fetch: async (url, init) => { calls.push([init.method, url]); return responses.shift(); }, sleep: async () => {} });
    expect(await api.getOverview({ from: '2026-10-01T10:37:00.000Z', to: '2026-10-08T10:37:00.000Z', app: 'starlyn' })).toEqual(OVERVIEW);
    await api.getOverview();
    expect(calls).toEqual([
      ['GET', 'https://api.x/v1/analytics/overview?from=2026-10-01T10%3A37%3A00.000Z&to=2026-10-08T10%3A37%3A00.000Z&app=starlyn'],
      ['GET', 'https://api.x/v1/analytics/overview?from=2026-10-01T10%3A37%3A00.000Z&to=2026-10-08T10%3A37%3A00.000Z&app=starlyn'],
      ['GET', 'https://api.x/v1/analytics/overview'],
    ]);
  });
});
```

`packages/cli/test/publish-app.test.js` (mới):

`packages/cli/test/publish-app.test.js` (mới):

```js
import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { run } from '../src/main.js';
import { ApiError, createApi } from '../src/api.js';

const PAGE = "<script>const CONFIG={funnel:'moon-reading'}</script>";

async function funnelFolder(html) {
  const root = await mkdtemp(join(tmpdir(), 'ikf-pub-app-'));
  const tools = join(root, 'funnel', 'tools');
  const folder = join(root, 'funnel', 'funnel-development', 'starlyn', 'moon-reading');
  await mkdir(tools, { recursive: true });
  await mkdir(folder, { recursive: true });
  await writeFile(join(tools, 'smoke_demo.mjs'), '');
  await writeFile(join(folder, 'demo.html'), html);
  await writeFile(join(folder, 'funnel-content.md'), '---\nscreens: 3\n---\n');
  return folder;
}

function harness(publish) {
  const lines = [];
  const errors = [];
  const opts = {
    out: (l) => lines.push(l),
    err: (l) => errors.push(l),
    env: {},
    deps: { runner: async () => ({ code: 0, output: '' }), api: { publish, listPrices: async () => ({ plans: {} }) } },
  };
  return { lines, errors, opts };
}

// Spec admin-console-p4a §2 "CLI": publish --app <id> creates a new slug in that app; the server answers
// app_required for a new slug without it and funnel_app_mismatch for an existing funnel of another app.
describe('ikf publish --app', () => {
  it('sends app_id in the upload body', async () => {
    const folder = await funnelFolder(PAGE);
    const sent = [];
    const t = harness(async (slug, payload) => { sent.push([slug, payload]); return { funnel: slug, v: 1, created: true, preview_url: 'p' }; });
    expect(await run(['publish', folder, '--slug', 'moon-reading', '--app', 'starlyn'], t.opts)).toBe(0);
    const sha = createHash('sha256').update(PAGE).digest('hex');
    expect(sent).toEqual([['moon-reading', { html: PAGE, sha256: sha, lint_report: { lint: 'pass', smoke: 'pass', screens: 3 }, app_id: 'starlyn' }]]);
  });

  it('a malformed --app is exit 2 before any upload', async () => {
    const folder = await funnelFolder(PAGE);
    let called = false;
    const t = harness(async () => { called = true; });
    expect(await run(['publish', folder, '--slug', 'moon-reading', '--app', 'S'], t.opts)).toBe(2);
    expect(t.errors).toEqual(['app id không hợp lệ: "S"']);
    expect(called).toBe(false);
  });

  it('400 app_required (a new slug without --app): exit 1, "Funnel mới cần --app <id>"', async () => {
    const folder = await funnelFolder(PAGE);
    const t = harness(async () => { throw new ApiError(400, { error: 'app_required', detail: { funnel: 'moon-reading' } }); });
    expect(await run(['publish', folder, '--slug', 'moon-reading'], t.opts)).toBe(1);
    expect(t.errors).toEqual(['Funnel mới cần --app <id>']);
  });

  it('409 funnel_app_mismatch: exit 1 with the funnel’s current app', async () => {
    const folder = await funnelFolder(PAGE);
    const t = harness(async () => { throw new ApiError(409, { error: 'funnel_app_mismatch', detail: { app_id: 'chatchi' } }); });
    expect(await run(['publish', folder, '--slug', 'moon-reading', '--app', 'starlyn'], t.opts)).toBe(1);
    expect(t.errors).toEqual(['Funnel đang thuộc app chatchi: bỏ --app hoặc dùng --app chatchi (đổi app: ikf funnel set <slug> --app <id>)']);
  });

  it('api.publish passes app_id through in the JSON body', async () => {
    const bodies = [];
    const fetch = async (_url, init) => { bodies.push(JSON.parse(init.body)); return new Response('{}', { status: 201 }); };
    const api = createApi({ api: 'https://api.x', token: 't' }, { fetch, sleep: async () => {} });
    await api.publish('moon-reading', { html: PAGE, sha256: 'a'.repeat(64), app_id: 'starlyn' }, 'a'.repeat(64));
    expect(bodies).toEqual([{ html: PAGE, sha256: 'a'.repeat(64), app_id: 'starlyn' }]);
  });
});
```

`packages/cli/test/app.test.js` (sửa, áp dụng đúng diff này — fixture `app ls` có 3 count, dòng mong đợi in thêm cột count):

`packages/cli/test/app.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/packages/cli/test/app.test.js b/packages/cli/test/app.test.js
index 208bc74..3a468d9 100644
--- a/packages/cli/test/app.test.js
+++ b/packages/cli/test/app.test.js
@@ -59,14 +59,19 @@ describe('ikf app', () => {
 
   it('ls and rotate-key', async () => {
     const t = io({
-      listApps: async () => ({ apps: [appView, { ...appView, id: 'tarot-web', kind: 'web', handoff: null, name: 'Tarot', webhook_url: 'https://tarot.example/h' }] }),
+      listApps: async () => ({
+        apps: [
+          { ...appView, funnels_count: 3, domains_count: 1, live_routes_count: 4 },
+          { ...appView, id: 'tarot-web', kind: 'web', handoff: null, name: 'Tarot', webhook_url: 'https://tarot.example/h', funnels_count: 0, domains_count: 0, live_routes_count: 0 },
+        ],
+      }),
       rotateKey: async () => ({ app: { ...appView, prev_key_expires_at: '2026-10-10T10:00:00.000Z' }, api_key: KEY }),
     });
     await run(['app', 'ls'], t.opts);
     await run(['app', 'rotate-key', 'starlyn'], t.opts);
     expect(t.lines).toEqual([
-      `starlyn              app  claim   Starlyn                  https://be.example/hook`,
-      `tarot-web            web  -       Tarot                    https://tarot.example/h`,
+      `starlyn              app  claim   Starlyn                    3 funnel   1 domain   4 live  https://be.example/hook`,
+      `tarot-web            web  -       Tarot                      0 funnel   0 domain   0 live  https://tarot.example/h`,
       `starlyn: API key mới (chỉ hiện MỘT lần): ${KEY}`,
       'Key cũ còn dùng được tới 2026-10-10T10:00:00.000Z.',
     ]);
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/cli 2>&1 | grep -E "Test Files |Tests  |×"
```

Expected: `Test Files  6 failed | 14 passed (20)`, `Tests  44 failed | 159 passed (203)`: 43 test mới fail (chưa có `funnel create/ls`, `domain`, `app show`, `stats --app`, `getOverview`/`getApp`/`createFunnel`/`listFunnels`/`listDomains`/`setDomain` trong `api.js`, upload chưa gửi `app_id`, chưa có thông báo `app_required`/`funnel_app_mismatch`) + `ikf app > ls and rotate-key` (bảng chưa có count). Test `api.publish passes app_id through in the JSON body` đã pass (body đi thẳng qua `call`).

- [ ] **Step 3: Implement**

`packages/cli/src/api.js`, `packages/cli/src/publish.js`, `packages/cli/src/main.js` (sửa, áp dụng đúng diff này):

`packages/cli/src/api.js`, `packages/cli/src/publish.js`, `packages/cli/src/main.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/packages/cli/src/api.js b/packages/cli/src/api.js
index c4ee61b..275d304 100644
--- a/packages/cli/src/api.js
+++ b/packages/cli/src/api.js
@@ -44,6 +44,8 @@ export function createApi({ api, token }, { fetch: doFetch = fetch, retries = 3,
   }
 
   const q = encodeURIComponent;
+  // ?app= on the list routes (spec admin-console-p4a §2): an app id, or 'none' for funnels with no app yet.
+  const appQs = (app) => (app ? `?app=${q(app)}` : '');
   return {
     // Safe to retry: publish dedupes on sha256, set to the same version is a no-op.
     publish: (slug, payload, idemKey) =>
@@ -51,6 +53,13 @@ export function createApi({ api, token }, { fetch: doFetch = fetch, retries = 3,
     setRoute: (host, body) => call('PUT', `/v1/routes/${host}`, { body, retry: true }),
     listRoutes: (host) => call('GET', `/v1/routes/${host}`, { retry: true }),
     syncHost: (host) => call('POST', `/v1/routes/${host}/sync`, { retry: true }),
+    // Not retried: a lost reply would turn the retry into 409 funnel_exists. body = {slug, app_id}.
+    createFunnel: (body) => call('POST', '/v1/funnels', { body, retry: false }),
+    listFunnels: ({ app } = {}) => call('GET', `/v1/funnels${appQs(app)}`, { retry: true }),
+    // An app's hosts and the shared ones (spec admin-console-p4a §2); no app = every host.
+    listDomains: ({ app } = {}) => call('GET', `/v1/domains${appQs(app)}`, { retry: true }),
+    // Idempotent: the same {status?, app_id?} twice gives the same result.
+    setDomain: (host, body) => call('PUT', `/v1/domains/${host}`, { body, retry: true }),
     // Idempotent: setting the same pixel twice gives the same result.
     setFunnel: (slug, body) => call('PUT', `/v1/funnels/${slug}`, { body, retry: true }),
     // Idempotent: the same map twice gives the same result.
@@ -65,6 +74,7 @@ export function createApi({ api, token }, { fetch: doFetch = fetch, retries = 3,
     // Not retried: a lost reply would leave an app whose key and secret nobody saw (create again → 409).
     createApp: (body) => call('POST', '/v1/apps', { body, retry: false }),
     listApps: () => call('GET', '/v1/apps', { retry: true }),
+    getApp: (id) => call('GET', `/v1/apps/${id}`, { retry: true }),
     // Idempotent: the same change twice gives the same result.
     updateApp: (id, body) => call('PUT', `/v1/apps/${id}`, { body, retry: true }),
     // Not retried: a second rotation would revoke the key the first one returned. force: rotate even while
@@ -88,6 +98,11 @@ export function createApi({ api, token }, { fetch: doFetch = fetch, retries = 3,
       const qs = new URLSearchParams({ ...(from && { from }), ...(to && { to }), ...(by && { by }), ...(v && { v: String(v) }) }).toString();
       return call('GET', `/v1/analytics/funnels/${slug}${qs ? `?${qs}` : ''}`, { retry: true });
     },
+    // Per-funnel numbers of every funnel, or one app's (spec admin-console-p4a §2 "Analytics"); a read, retried.
+    getOverview: ({ from, to, app } = {}) => {
+      const qs = new URLSearchParams({ ...(from && { from }), ...(to && { to }), ...(app && { app }) }).toString();
+      return call('GET', `/v1/analytics/overview${qs ? `?${qs}` : ''}`, { retry: true });
+    },
     listAdminUsers: () => call('GET', '/v1/admin/users', { retry: true }),
     // Not retried: a lost reply would turn the retry into 409 user_exists.
     createAdminUser: (body) => call('POST', '/v1/admin/users', { body, retry: false }),
diff --git a/packages/cli/src/main.js b/packages/cli/src/main.js
index 7ccfcc6..dd435b0 100755
--- a/packages/cli/src/main.js
+++ b/packages/cli/src/main.js
@@ -11,12 +11,14 @@ import { parseTarget, parseVersionRef, UsageError } from './target.js';
 
 const USAGE = `Cách dùng:
   ikf login --api <url> --token <token>
-  ikf publish <folder> --slug <slug>
+  ikf publish <folder> --slug <slug> [--app <id>]   (slug mới cần --app)
   ikf route set <host>[/prefix] <funnel>@v<n> [--yes]
   ikf route rollback <host>[/prefix]
   ikf route rm <host>[/prefix]
   ikf route ls <host>
   ikf route sync <host>
+  ikf funnel create <slug> --app <id>
+  ikf funnel ls [--app <id> | --unassigned]
   ikf funnel set <slug> [--pixel <id> | --no-pixel] [--app <id> | --no-app]
   ikf funnel prices set <slug> <plan>=pri_…[:dsc_…][@<entitlement_key>] … (<plan>=- để gỡ; key mặc định premium cho plan mới, giữ nguyên key cũ nếu bỏ qua)
   ikf funnel prices ls <slug>
@@ -27,8 +29,11 @@ const USAGE = `Cách dùng:
   ikf app create <id> --name <tên> --kind web --return-url <url> --webhook <url>
   ikf app update <id> [--name <tên>] [--webhook <url>] [--adjust <url>] [--scheme <scheme>] [--return-url <url>] [--deeplink-path <p>] [--bundle-ids a,b]
   ikf app ls
+  ikf app show <id>
   ikf app rotate-key <id> [--force]   (--force: cả khi key trước còn trong 24h, key đó bị khoá ngay)
   ikf app webhooks <id> [--dead] [--resend <event_id>]
+  ikf domain ls [--app <id>]   (--app: domain của app và domain dùng chung)
+  ikf domain set <host> [--status active|disabled] [--app <id> | --shared]
   ikf customer show <email|cus_…>
   ikf customer grant <cus_…> --app <id> --key <key> [--expires <ISO>] --reason <lý do>   (cấp quyền thủ công, admin)
   ikf customer revoke <cus_…> <grant_id>
@@ -38,7 +43,8 @@ const USAGE = `Cách dùng:
   ikf admin ls
   ikf admin disable <email>   (khoá ngay, mọi phiên đăng nhập kết thúc)
   ikf events replay-dlq --env <staging|prod>   (cần CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN)
-  ikf stats <slug> [--days 7] [--by hour|day]   (số liệu funnel: mốc, bậc thang screen, doanh thu; giờ UTC; --by hour tối đa 14 ngày)`;
+  ikf stats <slug> [--days 7] [--by hour|day]   (số liệu funnel: mốc, bậc thang screen, doanh thu; giờ UTC; --by hour tối đa 14 ngày)
+  ikf stats --app <id> [--days 7]   (mỗi funnel của app một dòng + dòng Tổng)`;
 
 const where = (r) => `${r.host}${r.prefix === '/' ? '/' : r.prefix}`;
 
@@ -101,8 +107,36 @@ async function pricesCommand(api, args, out) {
   return 0;
 }
 
+function appOption(values) {
+  if (values.app !== undefined && !APP_ID_RE.test(values.app)) throw new UsageError(`app id không hợp lệ: "${values.app}"`);
+  return values.app;
+}
+
+// Spec admin-console-p4a §2 "CLI": a new funnel always belongs to an app (POST /v1/funnels {slug, app_id}).
+async function funnelCreate(api, slug, values, out) {
+  if (!slug) throw new UsageError('cách dùng: ikf funnel create <slug> --app <id>');
+  if (!SLUG_RE.test(slug)) throw new UsageError(`slug không hợp lệ: "${slug}"`);
+  if (values.app === undefined) throw new UsageError('funnel create cần --app <id>');
+  const r = await api.createFunnel({ slug, app_id: appOption(values) });
+  out(`Đã tạo funnel ${r.slug} (app ${r.app_id})`);
+  return 0;
+}
+
+// --unassigned = ?app=none: the funnels from before 4a that still need an app.
+async function funnelList(api, values, out) {
+  if (values.app !== undefined && values.unassigned) throw new UsageError('cần nhiều nhất một trong --app <id> hoặc --unassigned');
+  const { funnels } = await api.listFunnels({ app: values.unassigned ? 'none' : appOption(values) });
+  if (!funnels.length) out('(chưa có funnel nào)');
+  for (const f of funnels) {
+    out(`${f.slug.padEnd(28)} ${(f.app_id ?? '(chưa gán)').padEnd(20)} ${(f.latest_v ? `v${f.latest_v}` : '-').padEnd(5)} ${f.live.length} route live`);
+  }
+  return 0;
+}
+
 async function funnelCommand(api, sub, args, values, out) {
   if (sub === 'prices') return pricesCommand(api, args, out);
+  if (sub === 'create') return funnelCreate(api, args[0], values, out);
+  if (sub === 'ls') return funnelList(api, values, out);
   const slug = args[0];
   if (sub !== 'set' || !slug) throw new UsageError(USAGE);
   if (!SLUG_RE.test(slug)) throw new UsageError(`slug không hợp lệ: "${slug}"`);
@@ -135,11 +169,16 @@ async function appCommand(api, sub, args, values, out) {
   if (sub === 'ls') {
     const { apps } = await api.listApps();
     if (!apps.length) out('(chưa có app nào)');
-    for (const a of apps) out(`${a.id.padEnd(20)} ${a.kind.padEnd(4)} ${(a.handoff ?? '-').padEnd(7)} ${a.name.padEnd(24)} ${a.webhook_url ?? '-'}`);
+    // Spec admin-console-p4a §2 "Apps": funnels, domains and live routes of each app.
+    for (const a of apps) {
+      const counts = `${String(a.funnels_count).padStart(3)} funnel ${String(a.domains_count).padStart(3)} domain ${String(a.live_routes_count).padStart(3)} live`;
+      out(`${a.id.padEnd(20)} ${a.kind.padEnd(4)} ${(a.handoff ?? '-').padEnd(7)} ${a.name.padEnd(24)} ${counts}  ${a.webhook_url ?? '-'}`);
+    }
     return 0;
   }
-  if (!['create', 'update', 'rotate-key', 'webhooks'].includes(sub) || !id) throw new UsageError(USAGE);
+  if (!['create', 'update', 'rotate-key', 'webhooks', 'show'].includes(sub) || !id) throw new UsageError(USAGE);
   if (!APP_ID_RE.test(id)) throw new UsageError(`app id không hợp lệ: "${id}"`);
+  if (sub === 'show') return appShow(api, id, out);
   if (sub === 'update') return appUpdate(api, id, values, out);
   if (sub === 'create') {
     if (!values.name || !values.webhook || !['app', 'web'].includes(values.kind)) {
@@ -231,6 +270,19 @@ async function revokeCommand(api, args, out) {
   return 0;
 }
 
+// ikf app show (spec admin-console-p4a §2 "CLI"): GET /v1/apps/:id, the fields that are set and the 3 counts.
+async function appShow(api, id, out) {
+  const a = await api.getApp(id);
+  out(`${a.id}  ${a.name} (${a.kind})`);
+  const fields = [
+    ['handoff', a.handoff], ['webhook', a.webhook_url], ['adjust', a.adjust_tracker_url], ['scheme', a.deeplink_scheme],
+    ['deeplink path', a.deeplink_path], ['return url', a.return_url], ['bundle ids', a.bundle_ids?.join(', ')], ['key cũ tới', a.prev_key_expires_at],
+  ];
+  for (const [label, value] of fields) if (value) out(`  ${label.padEnd(15)} ${value}`);
+  out(`  Funnels ${a.funnels_count} · Domains ${a.domains_count} · Route live ${a.live_routes_count}`);
+  return 0;
+}
+
 // ikf app update: flag → field of PUT /v1/apps/:id (spec admin-console-p2 §2), in this order.
 const APP_UPDATE_FLAGS = [
   ['name', 'name'], ['webhook', 'webhook_url'], ['adjust', 'adjust_tracker_url'], ['scheme', 'deeplink_scheme'],
@@ -333,6 +385,32 @@ async function adminCommand(api, sub, args, values, out, err) {
   return 0;
 }
 
+// Spec admin-console-p4a §2 "CLI", decision #3: a host belongs to one app or is shared (app_id null).
+async function domainCommand(api, sub, args, values, out) {
+  if (sub === 'ls') {
+    const { domains } = await api.listDomains({ app: appOption(values) });
+    if (!domains.length) out('(chưa có domain nào)');
+    for (const d of domains) out(`${d.host.padEnd(32)} ${(d.app_id ?? '(dùng chung)').padEnd(20)} ${d.status.padEnd(8)} ${d.routes.length} route`);
+    return 0;
+  }
+  if (sub !== 'set') throw new UsageError(USAGE);
+  if (!args[0]) throw new UsageError('cách dùng: ikf domain set <host> [--status active|disabled] [--app <id> | --shared]');
+  const { host, prefix } = parseTarget(args[0]);
+  if (prefix !== '/') throw new UsageError(`domain set chỉ nhận host, không có path: "${args[0]}"`);
+  if (values.status === undefined && values.app === undefined && !values.shared) {
+    throw new UsageError('cần --status active|disabled và/hoặc --app <id> | --shared');
+  }
+  if (values.app !== undefined && values.shared) throw new UsageError('cần đúng một trong --app <id> hoặc --shared');
+  if (values.status !== undefined && !['active', 'disabled'].includes(values.status)) throw new UsageError('--status phải là active hoặc disabled');
+  const body = {
+    ...(values.status !== undefined && { status: values.status }),
+    ...((values.app !== undefined || values.shared) && { app_id: values.shared ? null : appOption(values) }),
+  };
+  const r = await api.setDomain(host, body);
+  out(`${r.host}: ${r.status}, ${r.app_id ? `app ${r.app_id}` : 'dùng chung'}`);
+  return 0;
+}
+
 const DURATION_RE = /^([1-9]\d*)([mhd])$/;
 const UNIT_SECONDS = { m: 60, h: 3600, d: 86400 };
 
@@ -371,7 +449,36 @@ const money = (minor, currency) => (ZERO_DECIMAL.has(currency) ? `${minor} ${cur
 const pct = (n, base) => (base ? `${((n / base) * 100).toFixed(1)}%` : '—');
 const statLine = (label, n, base) => `  ${label.padEnd(18)} ${String(n).padStart(8)}  ${pct(n, base).padStart(6)}`;
 
+const sumRevenue = (lists) => {
+  const totals = new Map();
+  for (const list of lists) for (const x of list) totals.set(x.currency, (totals.get(x.currency) ?? 0) + x.amount_minor);
+  return [...totals].sort(([a], [b]) => (a < b ? -1 : 1)).map(([c, n]) => money(n, c)).join(', ') || '—';
+};
+const overviewLine = (label, r, revenue) =>
+  `  ${label.padEnd(24)} ${String(r.sessions).padStart(8)} ${String(r.leads).padStart(8)} ${String(r.checkouts).padStart(10)} ${String(r.paid).padStart(8)}  ${revenue}`;
+
+// ikf stats --app <id> [--days] (spec admin-console-p4a §2 "Analytics"): the app's overview, one line per funnel and
+// a total. The overview is per day only (the route takes no `by`), so --by belongs to the per-funnel form.
+async function appStats(api, values, out, now) {
+  const app = appOption(values);
+  const days = values.days === undefined ? 7 : Number(values.days);
+  if (!Number.isInteger(days) || days < 1 || days > 90) throw new UsageError('--days phải là số nguyên từ 1 đến 90');
+  if (values.by !== undefined) throw new UsageError('--by chỉ dùng với <slug> (tổng quan app tính theo ngày)');
+  const end = now();
+  const r = await api.getOverview({ from: new Date(end - days * DAY_MS).toISOString(), to: new Date(end).toISOString(), app });
+  out(`App ${app}: ${r.range.from} → ${r.range.to} (UTC)`);
+  out(`  ${'funnel'.padEnd(24)} ${'sessions'.padStart(8)} ${'leads'.padStart(8)} ${'checkouts'.padStart(10)} ${'paid'.padStart(8)}  doanh thu (gross)`);
+  if (!r.funnels.length) out('  (chưa có số liệu)');
+  for (const f of r.funnels) out(overviewLine(f.slug, f, sumRevenue([f.revenue])));
+  const total = { sessions: 0, leads: 0, checkouts: 0, paid: 0 };
+  for (const f of r.funnels) for (const k of Object.keys(total)) total[k] += f[k];
+  out(overviewLine('Tổng', total, sumRevenue(r.funnels.map((f) => f.revenue))));
+  return 0;
+}
+
 async function statsCommand(api, slug, values, out, now) {
+  if (slug && values.app !== undefined) throw new UsageError('cần <slug> hoặc --app <id>, không cả hai');
+  if (values.app !== undefined) return appStats(api, values, out, now);
   if (!slug) throw new UsageError('cách dùng: ikf stats <slug> [--days 7] [--by hour|day]');
   if (!SLUG_RE.test(slug)) throw new UsageError(`slug không hợp lệ: "${slug}"`);
   const days = values.days === undefined ? 7 : Number(values.days);
@@ -390,15 +497,29 @@ async function statsCommand(api, slug, values, out, now) {
   out('Screen (session đã xem):');
   if (!r.steps.length) out('  (không có screen_view)');
   for (const s of r.steps) out(statLine(`screen ${s.screen}`, s.sessions, r.steps[0].sessions));
-  const revenue = new Map();
-  for (const b of r.series) for (const x of b.revenue) revenue.set(x.currency, (revenue.get(x.currency) ?? 0) + x.amount_minor);
-  const totals = [...revenue].sort(([a], [b]) => (a < b ? -1 : 1)).map(([c, n]) => money(n, c));
-  out(`Doanh thu (gross): ${totals.join(', ') || '—'}`);
+  out(`Doanh thu (gross): ${sumRevenue(r.series.map((b) => b.revenue))}`);
   if (r.events.length) out(`Sự kiện khác: ${r.events.map((e) => `${e.name} ${e.sessions}`).join(', ')}`);
   return 0;
 }
 
-export function formatApiError(e) {
+// cmd: the command that failed, for codes whose advice depends on it (app_required).
+export function formatApiError(e, cmd) {
+  // Spec admin-console-p4a §2: an upload of a new slug needs an app; a funnel is never moved back to no app.
+  if (e.code === 'app_required') {
+    return cmd === 'publish' ? 'Funnel mới cần --app <id>' : 'Funnel phải thuộc một app, không gỡ được (đổi app: ikf funnel set <slug> --app <id>)';
+  }
+  if (e.code === 'app_not_found') return `Không có app "${e.detail?.app_id ?? e.detail?.id}" (xem: ikf app ls)`;
+  if (e.code === 'funnel_app_mismatch') {
+    const app = e.detail?.app_id;
+    return `Funnel đang thuộc app ${app}: bỏ --app hoặc dùng --app ${app} (đổi app: ikf funnel set <slug> --app <id>)`;
+  }
+  if (e.code === 'domain_has_foreign_routes' && Array.isArray(e.detail?.routes)) {
+    return [
+      'Không gán được: host đang có route live của funnel thuộc app khác (hoặc chưa gán app):',
+      ...e.detail.routes.map((r) => `  ${r.prefix} → ${r.slug} (${r.app_id ? `app ${r.app_id}` : 'chưa gán app'})`),
+      'Chuyển hoặc gỡ các route này trước (ikf route set / ikf route rm), rồi chạy lại.',
+    ].join('\n');
+  }
   if (e.code === 'analytics_unavailable') {
     return `Analytics chưa bật hoặc ClickHouse không phản hồi (${e.status} analytics_unavailable): xem docs/runbooks/analytics.md`;
   }
@@ -476,6 +597,7 @@ async function routeCommand(api, sub, args, values, out) {
 }
 
 export async function run(argv, { out = console.log, err = console.error, env = process.env, deps = {} } = {}) {
+  let cmd;
   try {
     const { positionals, values } = parseArgs({
       args: argv,
@@ -511,24 +633,29 @@ export async function run(argv, { out = console.log, err = console.error, env =
         reason: { type: 'string' },
         days: { type: 'string' },
         by: { type: 'string' },
+        unassigned: { type: 'boolean', default: false },
+        shared: { type: 'boolean', default: false },
+        status: { type: 'string' },
       },
     });
-    const [cmd, sub, ...rest] = positionals;
+    const [first, sub, ...rest] = positionals;
+    cmd = first;
     if (cmd === 'login') {
       if (!values.api || !values.token) throw new UsageError(USAGE);
       await (deps.saveCredentials ?? saveCredentials)({ api: values.api, token: values.token });
       out('Đã lưu thông tin đăng nhập.');
       return 0;
     }
-    if (!['route', 'publish', 'funnel', 'events', 'billing', 'app', 'customer', 'admin', 'stats'].includes(cmd)) throw new UsageError(USAGE);
+    if (!['route', 'publish', 'funnel', 'domain', 'events', 'billing', 'app', 'customer', 'admin', 'stats'].includes(cmd)) throw new UsageError(USAGE);
     if (cmd === 'events') return await eventsCommand(sub, values, out, env, deps);
-    if (cmd === 'publish' && (!sub || !values.slug)) throw new UsageError('cách dùng: ikf publish <folder> --slug <slug>');
+    if (cmd === 'publish' && (!sub || !values.slug)) throw new UsageError('cách dùng: ikf publish <folder> --slug <slug> [--app <id>]');
     const api = deps.api ?? createApi(await loadCredentials(env));
     if (cmd === 'publish') {
-      await publishCommand({ api, folder: sub, slug: values.slug, out, runner: deps.runner, env });
+      await publishCommand({ api, folder: sub, slug: values.slug, app: values.app, out, runner: deps.runner, env });
       return 0;
     }
     if (cmd === 'funnel') return await funnelCommand(api, sub, rest, values, out);
+    if (cmd === 'domain') return await domainCommand(api, sub, rest, values, out);
     if (cmd === 'billing') return await billingCommand(api, sub, rest, values, out);
     if (cmd === 'app') return await appCommand(api, sub, rest, values, out);
     if (cmd === 'customer') return await customerCommand(api, sub, rest, values, out);
@@ -554,7 +681,7 @@ export async function run(argv, { out = console.log, err = console.error, env =
       return 1;
     }
     if (e instanceof ApiError) {
-      err(formatApiError(e));
+      err(formatApiError(e, cmd));
       return 1;
     }
     if (e.code === 'ERR_PARSE_ARGS_UNKNOWN_OPTION') {
diff --git a/packages/cli/src/publish.js b/packages/cli/src/publish.js
index 86c2fea..d5febbe 100644
--- a/packages/cli/src/publish.js
+++ b/packages/cli/src/publish.js
@@ -6,6 +6,7 @@ import { findToolsDir, runLocalChecks } from './checks.js';
 import { UsageError } from './target.js';
 
 const SLUG = /^[a-z0-9][a-z0-9-]{1,62}$/;
+const APP_ID = /^[a-z0-9][a-z0-9-]{1,30}$/;
 
 export class LintFailedError extends Error {
   constructor(report) {
@@ -21,9 +22,12 @@ export const formatFindings = ({ errors = [], warnings = [] }) => [
   ...warnings.map((f) => `  cảnh báo ${f.code}${at(f)}: ${f.message}`),
 ];
 
-export async function publishCommand({ api, folder, slug, out, runner, env = process.env }) {
-  if (!folder || !slug) throw new UsageError('cách dùng: ikf publish <folder> --slug <slug>');
+// app: the app a new slug is created in (spec admin-console-p4a §2); the server needs it on a slug's first upload
+// (400 app_required) and refuses one that differs from an existing funnel's app (409 funnel_app_mismatch).
+export async function publishCommand({ api, folder, slug, app, out, runner, env = process.env }) {
+  if (!folder || !slug) throw new UsageError('cách dùng: ikf publish <folder> --slug <slug> [--app <id>]');
   if (!SLUG.test(slug)) throw new UsageError(`slug không hợp lệ: ${slug} (a-z, 0-9, dấu gạch ngang; 2-63 ký tự)`);
+  if (app !== undefined && !APP_ID.test(app)) throw new UsageError(`app id không hợp lệ: "${app}"`);
   const demoPath = join(folder, 'demo.html');
   let html;
   try {
@@ -42,7 +46,7 @@ export async function publishCommand({ api, folder, slug, out, runner, env = pro
   out('Đang chạy lint + smoke...');
   const lintReport = await runLocalChecks({ folder, html, tools, runner });
   const sha256 = createHash('sha256').update(html).digest('hex');
-  const res = await api.publish(slug, { html, sha256, lint_report: lintReport }, sha256);
+  const res = await api.publish(slug, { html, sha256, lint_report: lintReport, ...(app !== undefined && { app_id: app }) }, sha256);
   out(`${res.funnel}@v${res.v}${res.created ? '' : ' (nội dung không đổi, dùng lại version cũ)'}`);
   out(`Preview: ${res.preview_url}`);
   out(`Gắn vào traffic: ikf route set <host>/<path> ${res.funnel}@v${res.v}`);
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npx -w @ikf/cli vitest run test/funnel-app.test.js test/domain.test.js test/app-show.test.js test/stats-app.test.js test/publish-app.test.js test/app.test.js
npm test -w @ikf/cli 2>&1 | grep -E "Test Files |Tests  "
```

Expected: từng file `funnel-app` 13, `domain` 13, `app-show` 5, `stats-app` 8, `publish-app` 5, `app` 19 passed; toàn bộ cli `Test Files  20 passed (20)`, `Tests  203 passed (203)`.

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/api.js packages/cli/src/main.js packages/cli/src/publish.js packages/cli/test/app.test.js packages/cli/test/app-show.test.js packages/cli/test/domain.test.js packages/cli/test/funnel-app.test.js packages/cli/test/publish-app.test.js packages/cli/test/stats-app.test.js
git commit -m "feat(cli): funnel create/ls, publish --app, domain ls/set, app show, stats --app
```

---

---

### Task 8: SPA nền tảng — client mới, ngữ cảnh app trong URL, sidebar có ô chọn app, trang Apps (thẻ) và Tổng quan app, tách Webhooks / Cài đặt

**Files:**
- Create: `apps/admin/src/app-context.jsx`, `apps/admin/src/components/OverviewTable.jsx`, `apps/admin/src/pages/AppOverview.jsx`, `apps/admin/src/pages/AppSettings.jsx`, `apps/admin/src/pages/AppWebhooks.jsx`
- Modify: `apps/admin/src/api.js`, `apps/admin/src/App.jsx`, `apps/admin/src/Layout.jsx`, `apps/admin/src/icons.jsx`, `apps/admin/src/pages/Apps.jsx`, `apps/admin/src/pages/Dashboard.jsx`, `apps/admin/src/pages/Funnels.jsx`, `apps/admin/src/styles.css`
- Delete: `apps/admin/src/pages/AppDetail.jsx`
- Test: `apps/admin/test/layout-app.test.jsx`, `apps/admin/test/app-overview.test.jsx`, `apps/admin/test/app-settings.test.jsx`, `apps/admin/test/app-webhooks.test.jsx`, `apps/admin/test/apps-fixtures.js` (mới); `apps/admin/test/apps.test.jsx`, `apps/admin/test/grants.test.jsx`, `apps/admin/test/helpers.jsx`, `apps/admin/test/api.test.js`, `apps/admin/test/funnels.test.jsx` (sửa)

**Interfaces:**
- Consumes: `GET /v1/apps` (mỗi dòng có `funnels_count`, `domains_count`, `live_routes_count`; Task 3), `GET /v1/apps/:id` (app + 3 count, `404 app_not_found`), `GET /v1/apps/:id/summary` → `{app, funnels, domains: [{host, status, routes: [{prefix, slug, v}]}]}`, `GET /v1/apps/:id/plans` → `{plans: [{slug, plan, price_id, discount_id, entitlement_key, unmapped, in_html}]}`, `GET /v1/funnels?app=`, `GET /v1/domains?app=` (dòng có `app_id`), `PUT /v1/domains/:host {status?, app_id?}` → `200 {host, status, app_id}`, `GET /v1/audit?app=`, `GET /v1/analytics/overview?from&to&app=` (dòng có `app_id`; app lạ → `404 app_not_found`), `POST /v1/customers/lookup {…, app_id?}`, `POST /v1/funnels {slug, app_id}`, upload `{html, sha256, app_id?}` (Tasks 1–6). Ở SPA: `useAuth`, `RequireGrant`, `RoleButton`, `RangePicker`/`rangeFor`, `AnalyticsError`/`Loading`, `ErrorNote`, `SecretsBox`, `can`, `ICONS`/`Mark`; test: `fakeClient`, `renderApp`, `ME`.
- Produces:
  - Client (`src/api.js`): `getApp(id)`, `getAppSummary(id)`, `getAppPlans(id)`, `setDomain(host, body)`, `listFunnels({app} = {})`, `listDomains({app} = {})`, `listAudit({target?, action?, before?, app?})`, `getOverview({from, to, app?})`, `lookupCustomers({…, app_id?})`, `createFunnel({slug, app_id})` (trước là `createFunnel(slug)`), `uploadVersion(slug, html, {app_id} = {})` (chỉ gửi `app_id` khi có). `fakeClient` có thêm `getApp`/`getAppSummary` (mặc định 404 `app_not_found`), `getAppPlans` (`{plans: []}`), `setDomain`.
  - `src/app-context.jsx`: `AppsProvider` (Layout bọc cả console; gọi `client.listApps()` một lần), `useAppContext()` → `{appId, apps, app, loading, error, reload}` (`appId` từ `useMatch('/apps/:id/*')`, `null` khi toàn cục; `reload()` trả promise), `useApp(id)` → `{app, error, notFound, reload}` qua `getApp(id)`.
  - `src/Layout.jsx`: export `NAV` (toàn cục, không đổi) và `APP_NAV` (`to` là hàm `(id) => path`): Tổng quan `/apps/:id` (viewer, end) · Funnels `/apps/:id/funnels` · Giá `/apps/:id/plans` (prices:read) · Khách hàng `/apps/:id/customers` (support) · Domains `/apps/:id/domains` · Webhooks `/apps/:id/webhooks` (apps:read) · Audit `/apps/:id/audit` · Cài đặt `/apps/:id/settings` (apps:read), sau đó link `← Tất cả app` về `/`. Ô chọn `<select data-testid="app-switcher" aria-label="App" class="switcher">`: `Tất cả app` (`''`) + mỗi app theo tên; đổi → `/apps/<id>` hoặc `/`.
  - `src/components/OverviewTable.jsx`: `totals(funnels)`, `<Kpis funnels />`, `useOverviewSort(funnels)` → `{rows, sort, onSort}`, `<OverviewTable rows sort onSort />` (`data-testid="overview-row"`); Dashboard dùng lại, hành vi không đổi.
  - Trang: `/apps` (apps:read) thẻ `data-testid="app-card"` (`h2` tên, `.badge.kind`, `.counts` "`N funnel · N domain · N route live`"), form Tạo app giữ nguyên; `/apps/:id` (mọi role) `AppOverview` (`h1` tên, `data-testid="app-kind"`, nút `Tạo funnel` (editor) → `/apps/:id/funnels?new=1`, `RangePicker`, KPI + bảng từ `getOverview({from, to, app})`, thẻ `data-testid="app-domains"` với dòng `data-testid="app-domain"`; app lạ → "Không tìm thấy app <id>."); `/apps/:id/settings` (apps:read) `AppSettings` (sửa app, xoay key; lưu xong reload cả app lẫn danh sách app); `/apps/:id/webhooks` (apps:read) `AppWebhooks`; cả hai trả "Không có app <id>." khi 404.
  - CSS: `.side .switcher`, `.side a.back`, `.app-cards`, `.app-card`, `.badge.kind`, `.page-head`.

- [ ] **Step 1: Viết test fail**

`apps/admin/test/apps-fixtures.js` (mới):

`apps/admin/test/apps-fixtures.js` (mới):

```js
import { vi } from 'vitest';
import { ApiError } from '../src/api.js';
import { fakeClient } from './helpers.jsx';

// The apps the Apps, App settings, App webhooks and app-context tests share (spec admin-console-p2 §3, p4a §3).
export const KEY = `ikfa_${'k'.repeat(43)}`;
export const SECRET = `whsec_${'s'.repeat(43)}`;
export const STARLYN = {
  id: 'starlyn', name: 'Starlyn', kind: 'app', adjust_tracker_url: 'https://app.adjust.com/abc', deeplink_scheme: 'starlyn', return_url: null,
  webhook_url: 'https://be.example/hook', handoff: 'user_id', deeplink_path: 'open', bundle_ids: ['com.ikame.starlyn'],
  prev_key_expires_at: '2026-10-12T08:00:00.000Z', created_at: '2026-10-01T08:00:00.000Z',
  funnels_count: 2, domains_count: 1, live_routes_count: 3,
};
export const TAROT = {
  ...STARLYN, id: 'tarot-web', name: 'Tarot Web', kind: 'web', adjust_tracker_url: null, deeplink_scheme: null, return_url: 'https://tarot.example/hi',
  handoff: null, deeplink_path: null, bundle_ids: [], prev_key_expires_at: null, funnels_count: 0, domains_count: 0, live_routes_count: 0,
};

// GET /v1/apps/:id as the server answers it: the app (with its counts) or 404 app_not_found.
export const findApp = (apps) => vi.fn(async (id) => {
  const app = apps.find((a) => a.id === id);
  if (!app) throw new ApiError(404, { error: 'app_not_found', detail: { id } });
  return app;
});

export const appsClient = (me, overrides = {}) =>
  fakeClient(me, { listApps: vi.fn(async () => ({ apps: [STARLYN, TAROT] })), getApp: findApp([STARLYN, TAROT]), ...overrides });
```

`apps/admin/test/layout-app.test.jsx` (mới):

`apps/admin/test/layout-app.test.jsx` (mới):

```jsx
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { renderApp, ME } from './helpers.jsx';
import { appsClient, STARLYN } from './apps-fixtures.js';

const client = (me) => appsClient(me, { getAppSummary: vi.fn(async () => ({ app: STARLYN, funnels: [], domains: [] })) });
const nav = () => within(screen.getByRole('navigation'));
const links = () => nav().getAllByRole('link').map((a) => a.textContent);
const switcher = () => screen.getByTestId('app-switcher');

// Spec admin-console-p4a §3: the app context is the URL (/apps/:id/…); the sidebar's switcher moves between
// apps and the menu follows the context.
describe('app switcher and menu by context', () => {
  it('the switcher lists "Tất cả app" then every app by name; picking one opens it, "Tất cả app" goes home', async () => {
    renderApp(client(ME.viewer), '/');
    await waitFor(() => expect([...switcher().options].map((o) => [o.value, o.textContent])).toEqual([['', 'Tất cả app'], ['starlyn', 'Starlyn'], ['tarot-web', 'Tarot Web']]));
    expect(switcher().getAttribute('aria-label')).toBe('App');
    expect(switcher().value).toBe('');
    expect(links()).toEqual(['Dashboard', 'Funnels', 'Domains', 'Audit']);
    fireEvent.change(switcher(), { target: { value: 'starlyn' } });
    expect(await screen.findByRole('heading', { level: 1, name: 'Starlyn' })).toBeTruthy();
    expect(switcher().value).toBe('starlyn');
    expect(links()).toEqual(['Tổng quan', 'Funnels', 'Domains', 'Audit', '← Tất cả app']);
    fireEvent.change(switcher(), { target: { value: '' } });
    expect(await screen.findByRole('heading', { level: 1, name: 'Dashboard' })).toBeTruthy();
    expect(links()).toEqual(['Dashboard', 'Funnels', 'Domains', 'Audit']);
  });

  it('in an app: the app menu with its links (admin sees all), the current page active, "← Tất cả app" back home', async () => {
    renderApp(client(ME.admin), '/apps/starlyn/settings');
    await screen.findByTestId('edit-app');
    expect(nav().getAllByRole('link').map((a) => [a.textContent, a.getAttribute('href')])).toEqual([
      ['Tổng quan', '/apps/starlyn'],
      ['Funnels', '/apps/starlyn/funnels'],
      ['Giá', '/apps/starlyn/plans'],
      ['Khách hàng', '/apps/starlyn/customers'],
      ['Domains', '/apps/starlyn/domains'],
      ['Webhooks', '/apps/starlyn/webhooks'],
      ['Audit', '/apps/starlyn/audit'],
      ['Cài đặt', '/apps/starlyn/settings'],
      ['← Tất cả app', '/'],
    ]);
    expect(nav().getAllByRole('link').filter((a) => a.getAttribute('aria-current') === 'page').map((a) => a.textContent)).toEqual(['Cài đặt']);
    await waitFor(() => expect(switcher().value).toBe('starlyn'));
    fireEvent.click(nav().getByRole('link', { name: 'Tổng quan' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Starlyn' })).toBeTruthy();
    expect(nav().getByRole('link', { name: 'Tổng quan' }).getAttribute('aria-current')).toBe('page');
    fireEvent.click(nav().getByRole('link', { name: '← Tất cả app' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Dashboard' })).toBeTruthy();
    expect(switcher().value).toBe('');
  });

  it('a viewer in an app: Tổng quan, Funnels, Domains, Audit and the way back', async () => {
    renderApp(client(ME.viewer), '/apps/starlyn');
    await screen.findByRole('heading', { level: 1, name: 'Starlyn' });
    expect(links()).toEqual(['Tổng quan', 'Funnels', 'Domains', 'Audit', '← Tất cả app']);
  });

  it('the global menu is unchanged at / and on /apps (the list is not "in an app")', async () => {
    renderApp(client(ME.admin), '/apps');
    await screen.findAllByTestId('app-card');
    expect(links()).toEqual(['Dashboard', 'Funnels', 'Apps', 'Khách hàng', 'Domains', 'Billing', 'Audit', 'Settings']);
    expect(nav().getByRole('link', { name: 'Apps' }).getAttribute('aria-current')).toBe('page');
    expect(switcher().value).toBe('');
  });

  it('the apps are loaded once for the whole console, not per page', async () => {
    const c = client(ME.admin);
    renderApp(c, '/apps/starlyn');
    await screen.findByRole('heading', { level: 1, name: 'Starlyn' });
    fireEvent.click(nav().getByRole('link', { name: 'Cài đặt' }));
    await screen.findByTestId('edit-app');
    fireEvent.change(switcher(), { target: { value: 'tarot-web' } });
    await waitFor(() => expect(c.getAppSummary).toHaveBeenLastCalledWith('tarot-web'));
    expect(c.listApps).toHaveBeenCalledTimes(1);
  });
});
```

`apps/admin/test/app-overview.test.jsx` (mới):

`apps/admin/test/app-overview.test.jsx` (mới):

```jsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { ApiError } from '../src/api.js';
import { renderApp, ME } from './helpers.jsx';
import { appsClient, STARLYN } from './apps-fixtures.js';

const NOW = Date.UTC(2026, 9, 8, 10, 37);
const RANGE = { from: '2026-10-01T10:00:00.000Z', to: '2026-10-08T11:00:00.000Z' };
const OVERVIEW = {
  range: RANGE,
  funnels: [
    { slug: 'moon-reading', app_id: 'starlyn', sessions: 1200, leads: 300, checkouts: 40, paid: 12, revenue: [{ currency: 'USD', amount_minor: 16404 }], refunds: [{ currency: 'USD', amount_minor: 1367 }] },
    { slug: 'love-quiz', app_id: 'starlyn', sessions: 90, leads: 20, checkouts: 5, paid: 3, revenue: [{ currency: 'USD', amount_minor: 2997 }], refunds: [] },
  ],
};
const SUMMARY = {
  app: STARLYN,
  funnels: [],
  domains: [
    { host: 'go.starlyn.app', status: 'active', routes: [{ prefix: '/', slug: 'moon-reading', v: 3 }, { prefix: '/love', slug: 'love-quiz', v: 1 }] },
    { host: 'old.starlyn.app', status: 'disabled', routes: [] },
  ],
};
const cells = (row) => within(row).getAllByRole('cell').map((c) => c.textContent);
const client = (me, overrides = {}) => appsClient(me, { getAppSummary: vi.fn(async () => SUMMARY), getOverview: vi.fn(async () => OVERVIEW), ...overrides });

// Spec admin-console-p4a §3 "Tổng quan app": the Dashboard of p3 filtered by app, plus the app's own domains.
describe('App overview', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
  });
  afterEach(() => vi.useRealTimers());

  it('name and kind, KPIs and one row per funnel of the app, from the overview filtered by app', async () => {
    const c = client(ME.viewer);
    renderApp(c, '/apps/starlyn');
    expect(await screen.findByRole('heading', { level: 1, name: 'Starlyn' })).toBeTruthy();
    expect(screen.getByTestId('app-kind').textContent).toBe('app');
    expect(c.getAppSummary).toHaveBeenCalledWith('starlyn');
    expect(c.getOverview).toHaveBeenCalledWith({ from: '2026-10-01T10:37:00.000Z', to: '2026-10-08T10:37:00.000Z', app: 'starlyn' });
    const rows = await screen.findAllByTestId('overview-row');
    expect(rows.map(cells)).toEqual([
      ['moon-reading', '1,200', '300', '40', '12', '1.0%', '164.04 USD', '13.67 USD'],
      ['love-quiz', '90', '20', '5', '3', '3.3%', '29.97 USD', '—'],
    ]);
    expect(within(rows[0]).getByRole('link', { name: 'moon-reading' }).getAttribute('href')).toBe('/funnels/moon-reading');
    const kpis = within(screen.getByTestId('kpis'));
    expect(kpis.getByText('1,290')).toBeTruthy();
    expect(kpis.getByText('2 funnel')).toBeTruthy();
    expect(kpis.getByText('194.01 USD')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '30 d' }));
    await waitFor(() => expect(c.getOverview).toHaveBeenLastCalledWith({ from: '2026-09-08T10:37:00.000Z', to: '2026-10-08T10:37:00.000Z', app: 'starlyn' }));
  });

  it('a Domains card lists the app\'s own hosts with status and live routes', async () => {
    renderApp(client(ME.viewer), '/apps/starlyn');
    const card = await screen.findByTestId('app-domains');
    expect(within(card).getByRole('heading', { name: 'Domains' })).toBeTruthy();
    expect(within(card).getAllByTestId('app-domain').map(cells)).toEqual([
      ['go.starlyn.app', 'active', '/ → moon-reading v3, /love → love-quiz v1'],
      ['old.starlyn.app', 'disabled', '—'],
    ]);
  });

  it('an app without its own domain says the funnels go on the shared hosts', async () => {
    renderApp(client(ME.viewer, { getAppSummary: vi.fn(async () => ({ ...SUMMARY, domains: [] })) }), '/apps/starlyn');
    const card = await screen.findByTestId('app-domains');
    expect(card.textContent).toContain('App chưa có domain riêng; funnel publish lên domain dùng chung.');
  });

  it('Tạo funnel (editor) opens the app\'s Funnels page (?new=1 opens its create dialog)', async () => {
    renderApp(client(ME.editor), '/apps/starlyn');
    fireEvent.click(await screen.findByRole('button', { name: 'Tạo funnel' }));
    await waitFor(() => expect(within(screen.getByRole('navigation')).getByRole('link', { name: 'Funnels' }).getAttribute('aria-current')).toBe('page'));
  });

  it('a viewer cannot create a funnel: Tạo funnel greyed out with the reason', async () => {
    renderApp(client(ME.viewer), '/apps/starlyn');
    const btn = await screen.findByRole('button', { name: 'Tạo funnel' });
    expect(btn.disabled).toBe(true);
    expect(btn.title).toBe('Cần quyền editor');
  });

  it('analytics off (503): the same card as the Dashboard; the name and Domains stay', async () => {
    renderApp(client(ME.viewer, { getOverview: vi.fn(async () => { throw new ApiError(503, { error: 'analytics_unavailable' }); }) }), '/apps/starlyn');
    expect(await screen.findByTestId('analytics-off')).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1, name: 'Starlyn' })).toBeTruthy();
    expect(await screen.findByTestId('app-domains')).toBeTruthy();
    expect(screen.queryByTestId('overview-row')).toBeNull();
  });

  it('an unknown app: "Không tìm thấy app", not the analytics card', async () => {
    const notFound = async () => { throw new ApiError(404, { error: 'app_not_found', detail: { id: 'nope' } }); };
    renderApp(client(ME.viewer, { getAppSummary: vi.fn(notFound), getOverview: vi.fn(notFound) }), '/apps/nope');
    expect(await screen.findByText('Không tìm thấy app nope.')).toBeTruthy();
    expect(screen.queryByTestId('analytics-off')).toBeNull();
    expect(screen.queryByTestId('app-domains')).toBeNull();
  });
});
```

`apps/admin/test/app-settings.test.jsx` (mới):

`apps/admin/test/app-settings.test.jsx` (mới):

```jsx
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { ApiError } from '../src/api.js';
import { renderApp, ME } from './helpers.jsx';
import { appsClient as client, findApp, KEY, STARLYN, TAROT } from './apps-fixtures.js';

const FORCE = 'force: khoá ngay key trước (nếu còn trong 24 giờ)';

// Spec admin-console-p2 §3 (edit, rotate the key), moved to /apps/:id/settings by p4a §3 "Webhooks / Cài đặt".
describe('App settings', () => {
  it('admin edits: only the changed fields are sent; a web app has no Adjust fields', async () => {
    let current = STARLYN;
    const c = client(ME.admin, {
      getApp: vi.fn(async (id) => findApp([current, TAROT])(id)),
      updateApp: vi.fn(async (id, b) => { current = { ...STARLYN, ...b }; return { app: current }; }),
    });
    renderApp(c, '/apps/starlyn/settings');
    const form = await screen.findByTestId('edit-app');
    fireEvent.change(within(form).getByLabelText('Tên'), { target: { value: 'Starlyn 2' } });
    fireEvent.change(within(form).getByLabelText('Webhook URL'), { target: { value: 'https://be2.example/hook' } });
    fireEvent.click(within(form).getByRole('button', { name: 'Lưu' }));
    await waitFor(() => expect(c.updateApp).toHaveBeenCalledWith('starlyn', { name: 'Starlyn 2', webhook_url: 'https://be2.example/hook' }));
    expect(await screen.findByText('Đã lưu.')).toBeTruthy();
    await waitFor(() => expect(c.getApp).toHaveBeenCalledTimes(2));
    expect(await screen.findByRole('heading', { name: 'Starlyn 2 (starlyn)' })).toBeTruthy();
    expect(screen.getByText('Đã lưu.')).toBeTruthy();
    expect(within(form).getByLabelText('Kind').disabled).toBe(true);
  });

  it('a web app: return URL editable, Adjust/scheme/path not shown', async () => {
    renderApp(client(ME.admin), '/apps/tarot-web/settings');
    const form = await screen.findByTestId('edit-app');
    expect(within(form).getByLabelText('Return URL').value).toBe('https://tarot.example/hi');
    expect(within(form).queryByLabelText('Adjust tracker URL')).toBeNull();
    expect(within(form).queryByLabelText('Deep link path')).toBeNull();
  });

  it('Xoay key: the old key lives 24 h; while it does, 409 says so and force rotates; the new key is shown once', async () => {
    const c = client(ME.admin, {
      rotateKey: vi.fn(async (id, { force }) => {
        if (!force) throw new ApiError(409, { error: 'key_rotation_pending', detail: { prev_key_expires_at: '2026-10-12T08:00:00.000Z' } });
        return { app: STARLYN, api_key: KEY };
      }),
    });
    renderApp(c, '/apps/starlyn/settings');
    fireEvent.click(await screen.findByRole('button', { name: 'Xoay key' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog.textContent).toContain('Key cũ vẫn dùng được 24 giờ');
    expect(within(dialog).queryByLabelText(FORCE)).toBeNull();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận xoay key' }));
    expect(await within(dialog).findByText('Key trước còn hiệu lực tới 2026-10-12 08:00. Tick "force" để khoá nó ngay và xoay tiếp.')).toBeTruthy();
    expect(c.rotateKey).toHaveBeenLastCalledWith('starlyn', { force: false });
    fireEvent.click(within(dialog).getByLabelText(FORCE));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận xoay key' }));
    await waitFor(() => expect(c.rotateKey).toHaveBeenLastCalledWith('starlyn', { force: true }));
    const box = await screen.findByTestId('secrets');
    expect(box.textContent).toContain(KEY);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('an editor sees the settings but Xoay key and Lưu are greyed out', async () => {
    renderApp(client(ME.editor), '/apps/starlyn/settings');
    expect((await screen.findByRole('button', { name: 'Xoay key' })).disabled).toBe(true);
    expect(within(screen.getByTestId('edit-app')).getByRole('button', { name: 'Lưu' }).disabled).toBe(true);
  });

  it('an unknown app id says so', async () => {
    renderApp(client(ME.admin), '/apps/nope/settings');
    expect(await screen.findByText('Không có app nope.')).toBeTruthy();
  });
});
```

`apps/admin/test/app-webhooks.test.jsx` (mới):

`apps/admin/test/app-webhooks.test.jsx` (mới):

```jsx
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { renderApp, ME } from './helpers.jsx';
import { appsClient as client } from './apps-fixtures.js';

const ev = (n) => `01JA00000000000000000000${String(n).padStart(2, '0')}`;
const delivery = (n, status) => ({ event_id: ev(n), type: 'entitlement.updated', app_user_id: `u${n}`, status, attempts: status === 'dead' ? 8 : 1, next_attempt_at: '2026-10-11T08:00:00.000Z', last_error: status === 'dead' ? 'http_500' : null, created_at: '2026-10-11T08:00:00.000Z', delivered_at: null });
const COUNTS = { pending: 1, delivered: 3, dead: 2 };

// Spec admin-console-p2 §3 (webhook deliveries), moved to /apps/:id/webhooks by p4a §3 "Webhooks / Cài đặt".
describe('App webhooks', () => {
  it('Webhooks: counts, status filter, load more, resend (admin)', async () => {
    const c = client(ME.admin, {
      listWebhooks: vi.fn(async (id, { status, before }) => {
        if (before) return { items: [delivery(1, 'delivered')], next_before: null, counts: COUNTS };
        if (status === 'dead') return { items: [delivery(4, 'dead')], next_before: null, counts: COUNTS };
        return { items: [delivery(4, 'dead'), delivery(3, 'pending')], next_before: 3, counts: COUNTS };
      }),
      resendWebhook: vi.fn(async () => ({ ...delivery(9, 'pending'), resent_from: ev(4) })),
    });
    renderApp(c, '/apps/starlyn/webhooks');
    expect((await screen.findByTestId('counts')).textContent).toBe('pending 1 · delivered 3 · dead 2');
    expect((await screen.findAllByTestId('delivery')).map((r) => r.firstChild.textContent)).toEqual([ev(4), ev(3)]);
    fireEvent.click(screen.getByRole('button', { name: 'Tải thêm' }));
    await waitFor(() => expect(screen.getAllByTestId('delivery')).toHaveLength(3));
    expect(c.listWebhooks).toHaveBeenLastCalledWith('starlyn', { status: undefined, before: 3 });
    fireEvent.change(screen.getByLabelText('Trạng thái'), { target: { value: 'dead' } });
    await waitFor(() => expect(screen.getAllByTestId('delivery')).toHaveLength(1));
    expect(c.listWebhooks).toHaveBeenLastCalledWith('starlyn', { status: 'dead', before: undefined });
    fireEvent.click(within(screen.getByTestId('delivery')).getByRole('button', { name: 'Gửi lại' }));
    await waitFor(() => expect(c.resendWebhook).toHaveBeenCalledWith('starlyn', ev(4)));
    expect(await screen.findByText(`Đã xếp hàng gửi lại (event ${ev(9)}).`)).toBeTruthy();
  });

  it('two quick clicks on a delivery\'s Gửi lại resend once (final review I2)', async () => {
    const c = client(ME.admin, {
      listWebhooks: vi.fn(async () => ({ items: [delivery(4, 'dead')], next_before: null, counts: COUNTS })),
      resendWebhook: vi.fn(() => new Promise(() => {})),
    });
    renderApp(c, '/apps/starlyn/webhooks');
    const btn = await within(await screen.findByTestId('delivery')).findByRole('button', { name: 'Gửi lại' });
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(c.resendWebhook).toHaveBeenCalledTimes(1);
    expect(btn.disabled).toBe(true);
  });

  it('an editor sees webhooks but Gửi lại is greyed out', async () => {
    const c = client(ME.editor, { listWebhooks: vi.fn(async () => ({ items: [delivery(4, 'dead')], next_before: null, counts: COUNTS })) });
    renderApp(c, '/apps/starlyn/webhooks');
    expect((await within(await screen.findByTestId('delivery')).findByRole('button', { name: 'Gửi lại' })).disabled).toBe(true);
  });

  it('an unknown app id says so', async () => {
    renderApp(client(ME.admin), '/apps/nope/webhooks');
    expect(await screen.findByText('Không có app nope.')).toBeTruthy();
  });
});
```

`apps/admin/test/apps.test.jsx`, `apps/admin/test/grants.test.jsx`, `apps/admin/test/helpers.jsx`, `apps/admin/test/api.test.js` (sửa, áp dụng đúng diff này). `apps.test.jsx`: bảng thành thẻ; các test App detail chuyển sang `app-settings.test.jsx` / `app-webhooks.test.jsx` (chỉ đổi path và fake `getApp`). `grants.test.jsx`: kiểm `NAV` và thêm bảng menu trong app theo role + `APP_NAV`. `api.test.js`: `createFunnel({slug, app_id})` và một test request-shape cho mỗi method mới/đổi:

`apps/admin/test/apps.test.jsx`, `apps/admin/test/grants.test.jsx`, `apps/admin/test/helpers.jsx`, `apps/admin/test/api.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/test/api.test.js b/apps/admin/test/api.test.js
index c56b1c9..6d8624d 100644
--- a/apps/admin/test/api.test.js
+++ b/apps/admin/test/api.test.js
@@ -20,13 +20,13 @@ describe('admin API client', () => {
     const c = createClient({ base: 'https://api.test', fetch: s.fetch });
     await c.me();
     await c.listFunnels();
-    await c.createFunnel('x');
+    await c.createFunnel({ slug: 'x', app_id: 'starlyn' });
     expect(s.calls.map((x) => [x.method, x.url, x.credentials, x.headers['x-ikf-csrf']])).toEqual([
       ['GET', 'https://api.test/v1/auth/me', 'include', undefined],
       ['GET', 'https://api.test/v1/funnels', 'include', undefined],
       ['POST', 'https://api.test/v1/funnels', 'include', 'tok'],
     ]);
-    expect(s.calls[2].body).toBe('{"slug":"x"}');
+    expect(s.calls[2].body).toBe('{"slug":"x","app_id":"starlyn"}');
   });
 
   it('403 csrf: reloads /v1/auth/me and retries the write once', async () => {
@@ -70,4 +70,26 @@ describe('admin API client', () => {
     expect(s.calls[1].url).toBe('https://api.test/v1/audit?target=funnel%3Aaivideo&before=7');
     expect(c.loginUrl('/funnels/aivideo')).toBe('https://api.test/v1/auth/google?return=%2Ffunnels%2Faivideo');
   });
+
+  // Spec admin-console-p4a §3 (client list): the app-scoped calls. Each row: the call, then the request it makes.
+  const SHA = 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';
+  it.each([
+    ['getApp', (c) => c.getApp('starlyn'), 'GET', '/v1/apps/starlyn', undefined],
+    ['getAppSummary', (c) => c.getAppSummary('starlyn'), 'GET', '/v1/apps/starlyn/summary', undefined],
+    ['getAppPlans', (c) => c.getAppPlans('starlyn'), 'GET', '/v1/apps/starlyn/plans', undefined],
+    ['setDomain', (c) => c.setDomain('a.example.com', { app_id: null }), 'PUT', '/v1/domains/a.example.com', { app_id: null }],
+    ['listFunnels({app})', (c) => c.listFunnels({ app: 'none' }), 'GET', '/v1/funnels?app=none', undefined],
+    ['listFunnels()', (c) => c.listFunnels(), 'GET', '/v1/funnels', undefined],
+    ['listDomains({app})', (c) => c.listDomains({ app: 'starlyn' }), 'GET', '/v1/domains?app=starlyn', undefined],
+    ['listAudit({app})', (c) => c.listAudit({ app: 'starlyn', action: 'route', target: '' }), 'GET', '/v1/audit?app=starlyn&action=route', undefined],
+    ['getOverview({app})', (c) => c.getOverview({ from: 'a', to: 'b', app: 'starlyn' }), 'GET', '/v1/analytics/overview?from=a&to=b&app=starlyn', undefined],
+    ['lookupCustomers({app_id})', (c) => c.lookupCustomers({ email: 'a@b.co', app_id: 'starlyn' }), 'POST', '/v1/customers/lookup', { email: 'a@b.co', app_id: 'starlyn' }],
+    ['createFunnel({slug, app_id})', (c) => c.createFunnel({ slug: 'new-one', app_id: 'starlyn' }), 'POST', '/v1/funnels', { slug: 'new-one', app_id: 'starlyn' }],
+    ['uploadVersion(…, {app_id})', (c) => c.uploadVersion('new-one', 'abc', { app_id: 'starlyn' }), 'POST', '/v1/funnels/new-one/versions', { html: 'abc', sha256: SHA, app_id: 'starlyn' }],
+  ])('%s', async (_, run, method, path, body) => {
+    const s = scripted({});
+    await run(createClient({ base: 'https://api.test', fetch: s.fetch }));
+    expect([s.calls[0].method, s.calls[0].url]).toEqual([method, `https://api.test${path}`]);
+    expect(s.calls[0].body === undefined ? undefined : JSON.parse(s.calls[0].body)).toEqual(body);
+  });
 });
diff --git a/apps/admin/test/apps.test.jsx b/apps/admin/test/apps.test.jsx
index 7e0082d..0715394 100644
--- a/apps/admin/test/apps.test.jsx
+++ b/apps/admin/test/apps.test.jsx
@@ -1,33 +1,25 @@
 import { describe, it, expect, vi } from 'vitest';
 import { fireEvent, screen, waitFor, within } from '@testing-library/react';
 import { ApiError } from '../src/api.js';
-import { fakeClient, renderApp, ME } from './helpers.jsx';
+import { renderApp, ME } from './helpers.jsx';
+import { appsClient as client, KEY, SECRET, STARLYN } from './apps-fixtures.js';
 
-const KEY = `ikfa_${'k'.repeat(43)}`;
-const SECRET = `whsec_${'s'.repeat(43)}`;
-const STARLYN = {
-  id: 'starlyn', name: 'Starlyn', kind: 'app', adjust_tracker_url: 'https://app.adjust.com/abc', deeplink_scheme: 'starlyn', return_url: null,
-  webhook_url: 'https://be.example/hook', handoff: 'user_id', deeplink_path: 'open', bundle_ids: ['com.ikame.starlyn'],
-  prev_key_expires_at: '2026-10-12T08:00:00.000Z', created_at: '2026-10-01T08:00:00.000Z',
-};
-const TAROT = { ...STARLYN, id: 'tarot-web', name: 'Tarot Web', kind: 'web', adjust_tracker_url: null, deeplink_scheme: null, return_url: 'https://tarot.example/hi', handoff: null, deeplink_path: null, bundle_ids: [], prev_key_expires_at: null };
-const FORCE = 'force: khoá ngay key trước (nếu còn trong 24 giờ)';
-const ev = (n) => `01JA00000000000000000000${String(n).padStart(2, '0')}`;
-const delivery = (n, status) => ({ event_id: ev(n), type: 'entitlement.updated', app_user_id: `u${n}`, status, attempts: status === 'dead' ? 8 : 1, next_attempt_at: '2026-10-11T08:00:00.000Z', last_error: status === 'dead' ? 'http_500' : null, created_at: '2026-10-11T08:00:00.000Z', delivered_at: null });
-const COUNTS = { pending: 1, delivered: 3, dead: 2 };
-
-const client = (me, overrides = {}) => fakeClient(me, { listApps: vi.fn(async () => ({ apps: [STARLYN, TAROT] })), ...overrides });
-
-// Spec admin-console-p2 §3: Apps (apps:read reads, admin writes).
+// Spec admin-console-p2 §3: Apps (apps:read reads, admin writes); p4a §3: one card per app.
 describe('Apps list and create', () => {
-  it('editor: a row per app (id, kind, handoff, webhook, previous key until); Tạo app greyed out', async () => {
-    renderApp(client(ME.editor), '/apps');
-    const row = (await screen.findByRole('link', { name: 'starlyn' })).closest('tr');
-    expect([...row.querySelectorAll('td')].map((td) => td.textContent)).toEqual(['starlyn', 'app', 'user_id', 'https://be.example/hook', '2026-10-12 08:00']);
-    expect(screen.getByRole('link', { name: 'tarot-web' }).closest('tr').querySelectorAll('td')[4].textContent).toBe('—');
+  it('editor: a card per app (name, kind, 3 counts) that opens the app; Tạo app greyed out', async () => {
+    const c = client(ME.editor, { getAppSummary: vi.fn(async () => ({ app: STARLYN, funnels: [], domains: [] })) });
+    renderApp(c, '/apps');
+    const cards = await screen.findAllByTestId('app-card');
+    expect(cards.map((card) => [within(card).getByRole('heading').textContent, card.querySelector('.badge').textContent, card.querySelector('.counts').textContent])).toEqual([
+      ['Starlyn', 'app', '2 funnel · 1 domain · 3 route live'],
+      ['Tarot Web', 'web', '0 funnel · 0 domain · 0 route live'],
+    ]);
     const create = screen.getByRole('button', { name: 'Tạo app' });
     expect(create.disabled).toBe(true);
     expect(create.title).toBe('Cần quyền admin');
+    fireEvent.click(cards[0]);
+    expect(await screen.findByRole('heading', { level: 1, name: 'Starlyn' })).toBeTruthy();
+    expect(c.getAppSummary).toHaveBeenCalledWith('starlyn');
   });
 
   it('support and viewer: no Apps in the menu; the page says which grant it needs', async () => {
@@ -96,107 +88,3 @@ describe('Apps create: pending guard (final review I1)', () => {
     await waitFor(() => expect(btn.disabled).toBe(false));
   });
 });
-
-describe('App detail', () => {
-  it('admin edits: only the changed fields are sent; a web app has no Adjust fields', async () => {
-    let current = STARLYN;
-    const c = client(ME.admin, {
-      listApps: vi.fn(async () => ({ apps: [current, TAROT] })),
-      updateApp: vi.fn(async (id, b) => { current = { ...STARLYN, ...b }; return { app: current }; }),
-    });
-    renderApp(c, '/apps/starlyn');
-    const form = await screen.findByTestId('edit-app');
-    fireEvent.change(within(form).getByLabelText('Tên'), { target: { value: 'Starlyn 2' } });
-    fireEvent.change(within(form).getByLabelText('Webhook URL'), { target: { value: 'https://be2.example/hook' } });
-    fireEvent.click(within(form).getByRole('button', { name: 'Lưu' }));
-    await waitFor(() => expect(c.updateApp).toHaveBeenCalledWith('starlyn', { name: 'Starlyn 2', webhook_url: 'https://be2.example/hook' }));
-    expect(await screen.findByText('Đã lưu.')).toBeTruthy();
-    await waitFor(() => expect(c.listApps).toHaveBeenCalledTimes(2));
-    expect(await screen.findByRole('heading', { name: 'Starlyn 2 (starlyn)' })).toBeTruthy();
-    expect(screen.getByText('Đã lưu.')).toBeTruthy();
-    expect(within(form).getByLabelText('Kind').disabled).toBe(true);
-  });
-
-  it('a web app: return URL editable, Adjust/scheme/path not shown', async () => {
-    renderApp(client(ME.admin), '/apps/tarot-web');
-    const form = await screen.findByTestId('edit-app');
-    expect(within(form).getByLabelText('Return URL').value).toBe('https://tarot.example/hi');
-    expect(within(form).queryByLabelText('Adjust tracker URL')).toBeNull();
-    expect(within(form).queryByLabelText('Deep link path')).toBeNull();
-  });
-
-  it('Xoay key: the old key lives 24 h; while it does, 409 says so and force rotates; the new key is shown once', async () => {
-    const c = client(ME.admin, {
-      rotateKey: vi.fn(async (id, { force }) => {
-        if (!force) throw new ApiError(409, { error: 'key_rotation_pending', detail: { prev_key_expires_at: '2026-10-12T08:00:00.000Z' } });
-        return { app: STARLYN, api_key: KEY };
-      }),
-    });
-    renderApp(c, '/apps/starlyn');
-    fireEvent.click(await screen.findByRole('button', { name: 'Xoay key' }));
-    const dialog = screen.getByRole('dialog');
-    expect(dialog.textContent).toContain('Key cũ vẫn dùng được 24 giờ');
-    expect(within(dialog).queryByLabelText(FORCE)).toBeNull();
-    fireEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận xoay key' }));
-    expect(await within(dialog).findByText('Key trước còn hiệu lực tới 2026-10-12 08:00. Tick "force" để khoá nó ngay và xoay tiếp.')).toBeTruthy();
-    expect(c.rotateKey).toHaveBeenLastCalledWith('starlyn', { force: false });
-    fireEvent.click(within(dialog).getByLabelText(FORCE));
-    fireEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận xoay key' }));
-    await waitFor(() => expect(c.rotateKey).toHaveBeenLastCalledWith('starlyn', { force: true }));
-    const box = await screen.findByTestId('secrets');
-    expect(box.textContent).toContain(KEY);
-    expect(screen.queryByRole('dialog')).toBeNull();
-  });
-
-  it('Webhooks: counts, status filter, load more, resend (admin)', async () => {
-    const c = client(ME.admin, {
-      listWebhooks: vi.fn(async (id, { status, before }) => {
-        if (before) return { items: [delivery(1, 'delivered')], next_before: null, counts: COUNTS };
-        if (status === 'dead') return { items: [delivery(4, 'dead')], next_before: null, counts: COUNTS };
-        return { items: [delivery(4, 'dead'), delivery(3, 'pending')], next_before: 3, counts: COUNTS };
-      }),
-      resendWebhook: vi.fn(async () => ({ ...delivery(9, 'pending'), resent_from: ev(4) })),
-    });
-    renderApp(c, '/apps/starlyn');
-    fireEvent.click(await screen.findByRole('tab', { name: 'Webhooks' }));
-    expect((await screen.findByTestId('counts')).textContent).toBe('pending 1 · delivered 3 · dead 2');
-    expect((await screen.findAllByTestId('delivery')).map((r) => r.firstChild.textContent)).toEqual([ev(4), ev(3)]);
-    fireEvent.click(screen.getByRole('button', { name: 'Tải thêm' }));
-    await waitFor(() => expect(screen.getAllByTestId('delivery')).toHaveLength(3));
-    expect(c.listWebhooks).toHaveBeenLastCalledWith('starlyn', { status: undefined, before: 3 });
-    fireEvent.change(screen.getByLabelText('Trạng thái'), { target: { value: 'dead' } });
-    await waitFor(() => expect(screen.getAllByTestId('delivery')).toHaveLength(1));
-    expect(c.listWebhooks).toHaveBeenLastCalledWith('starlyn', { status: 'dead', before: undefined });
-    fireEvent.click(within(screen.getByTestId('delivery')).getByRole('button', { name: 'Gửi lại' }));
-    await waitFor(() => expect(c.resendWebhook).toHaveBeenCalledWith('starlyn', ev(4)));
-    expect(await screen.findByText(`Đã xếp hàng gửi lại (event ${ev(9)}).`)).toBeTruthy();
-  });
-
-  it('two quick clicks on a delivery\'s Gửi lại resend once (final review I2)', async () => {
-    const c = client(ME.admin, {
-      listWebhooks: vi.fn(async () => ({ items: [delivery(4, 'dead')], next_before: null, counts: COUNTS })),
-      resendWebhook: vi.fn(() => new Promise(() => {})),
-    });
-    renderApp(c, '/apps/starlyn');
-    fireEvent.click(await screen.findByRole('tab', { name: 'Webhooks' }));
-    const btn = await within(await screen.findByTestId('delivery')).findByRole('button', { name: 'Gửi lại' });
-    fireEvent.click(btn);
-    fireEvent.click(btn);
-    expect(c.resendWebhook).toHaveBeenCalledTimes(1);
-    expect(btn.disabled).toBe(true);
-  });
-
-  it('an editor sees webhooks but Gửi lại, Xoay key and Lưu are greyed out', async () => {
-    const c = client(ME.editor, { listWebhooks: vi.fn(async () => ({ items: [delivery(4, 'dead')], next_before: null, counts: COUNTS })) });
-    renderApp(c, '/apps/starlyn');
-    expect((await screen.findByRole('button', { name: 'Xoay key' })).disabled).toBe(true);
-    expect(within(screen.getByTestId('edit-app')).getByRole('button', { name: 'Lưu' }).disabled).toBe(true);
-    fireEvent.click(screen.getByRole('tab', { name: 'Webhooks' }));
-    expect((await within(await screen.findByTestId('delivery')).findByRole('button', { name: 'Gửi lại' })).disabled).toBe(true);
-  });
-
-  it('an unknown app id says so', async () => {
-    renderApp(client(ME.admin), '/apps/nope');
-    expect(await screen.findByText('Không có app nope.')).toBeTruthy();
-  });
-});
diff --git a/apps/admin/test/grants.test.jsx b/apps/admin/test/grants.test.jsx
index 656f44b..90747b5 100644
--- a/apps/admin/test/grants.test.jsx
+++ b/apps/admin/test/grants.test.jsx
@@ -3,6 +3,7 @@ import { fireEvent, render, screen, waitFor, within } from '@testing-library/rea
 import { MemoryRouter } from 'react-router';
 import { USER_GRANTS } from '../../../services/core-api/src/auth.js';
 import { AuthProvider } from '../src/auth.jsx';
+import { APP_NAV, NAV } from '../src/Layout.jsx';
 import { RequireGrant } from '../src/components/RequireGrant.jsx';
 import { can, GRANTS, ROLES } from '../src/roles.js';
 import { fakeClient, renderApp, ME } from './helpers.jsx';
@@ -58,6 +59,37 @@ describe('nav by grants', () => {
   ])('%s sees %j', async (role, items) => {
     expect(await navOf(ME[role])).toEqual(items);
   });
+
+  it('the global menu is NAV, in order', () => {
+    expect(NAV.map((n) => [n.label, n.to, n.need])).toEqual([
+      ['Dashboard', '/', 'viewer'], ['Funnels', '/funnels', 'viewer'], ['Apps', '/apps', 'apps:read'], ['Khách hàng', '/customers', 'support'],
+      ['Domains', '/domains', 'viewer'], ['Billing', '/billing', 'admin'], ['Audit', '/audit', 'viewer'], ['Settings', '/settings/users', 'admin'],
+    ]);
+  });
+
+  // Spec admin-console-p4a §3: inside an app (/apps/:id/…) the menu is APP_NAV, then "← Tất cả app".
+  const appNavOf = async (me) => {
+    renderApp(fakeClient(me), '/apps/starlyn/audit');
+    await screen.findByTestId('who');
+    return within(screen.getByRole('navigation')).getAllByRole('link').map((a) => a.textContent);
+  };
+
+  it.each([
+    ['viewer', ['Tổng quan', 'Funnels', 'Domains', 'Audit']],
+    ['support', ['Tổng quan', 'Funnels', 'Khách hàng', 'Domains', 'Audit']],
+    ['editor', ['Tổng quan', 'Funnels', 'Giá', 'Domains', 'Webhooks', 'Audit', 'Cài đặt']],
+    ['admin', ['Tổng quan', 'Funnels', 'Giá', 'Khách hàng', 'Domains', 'Webhooks', 'Audit', 'Cài đặt']],
+  ])('in an app, %s sees %j', async (role, items) => {
+    expect(await appNavOf(ME[role])).toEqual([...items, '← Tất cả app']);
+  });
+
+  it('APP_NAV: path under the app and grant per item', () => {
+    expect(APP_NAV.map((n) => [n.label, n.to('starlyn'), n.need])).toEqual([
+      ['Tổng quan', '/apps/starlyn', 'viewer'], ['Funnels', '/apps/starlyn/funnels', 'viewer'], ['Giá', '/apps/starlyn/plans', 'prices:read'],
+      ['Khách hàng', '/apps/starlyn/customers', 'support'], ['Domains', '/apps/starlyn/domains', 'viewer'], ['Webhooks', '/apps/starlyn/webhooks', 'apps:read'],
+      ['Audit', '/apps/starlyn/audit', 'viewer'], ['Cài đặt', '/apps/starlyn/settings', 'apps:read'],
+    ]);
+  });
 });
 
 describe('Users: role support with what each role may do', () => {
diff --git a/apps/admin/test/helpers.jsx b/apps/admin/test/helpers.jsx
index 05e59e9..9d02193 100644
--- a/apps/admin/test/helpers.jsx
+++ b/apps/admin/test/helpers.jsx
@@ -1,6 +1,7 @@
 import { render } from '@testing-library/react';
 import { MemoryRouter } from 'react-router';
 import { vi } from 'vitest';
+import { ApiError } from '../src/api.js';
 import { App } from '../src/App.jsx';
 
 export const ME = { admin: { email: 'boss@ikameglobal.com', name: 'Boss', role: 'admin', csrf: 'c' } };
@@ -28,6 +29,11 @@ export function fakeClient(me = ME.admin, overrides = {}) {
     uploadVersion: vi.fn(),
     setFunnel: vi.fn(),
     listApps: vi.fn(async () => ({ apps: [] })),
+    // No app exists unless a test says so (listApps is empty by default): one app and its overview are 404.
+    getApp: vi.fn(async (id) => { throw new ApiError(404, { error: 'app_not_found', detail: { id } }); }),
+    getAppSummary: vi.fn(async (id) => { throw new ApiError(404, { error: 'app_not_found', detail: { id } }); }),
+    getAppPlans: vi.fn(async () => ({ plans: [] })),
+    setDomain: vi.fn(),
     listDomains: vi.fn(async () => ({ domains: [] })),
     syncHost: vi.fn(),
     publish: vi.fn(),
PATCH
```

`apps/admin/test/funnels.test.jsx` (sửa, áp dụng đúng diff này). Hai chỗ bắt buộc: fake `createFunnel` nhận `{slug}` (chữ ký client đổi); ô chọn app trong sidebar cũng có nhãn `App`, nên test Settings của funnel tìm nhãn `App` trong thẻ Settings:

`apps/admin/test/funnels.test.jsx` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/test/funnels.test.jsx b/apps/admin/test/funnels.test.jsx
index 21b6871..5709b97 100644
--- a/apps/admin/test/funnels.test.jsx
+++ b/apps/admin/test/funnels.test.jsx
@@ -36,7 +36,7 @@ describe('Funnels list', () => {
 
   it('New funnel (editor): creates it and opens its page; 409 says it exists; a viewer cannot', async () => {
     const client = fakeClient(ME.editor, {
-      createFunnel: vi.fn(async (slug) => {
+      createFunnel: vi.fn(async ({ slug }) => {
         if (slug === 'aivideo') throw new ApiError(409, { error: 'funnel_exists' });
         return { slug };
       }),
@@ -175,7 +175,8 @@ describe('Funnel detail', () => {
     fireEvent.change(pixel, { target: { value: '' } });
     fireEvent.click(screen.getByRole('button', { name: 'Lưu pixel' }));
     await waitFor(() => expect(client.setFunnel).toHaveBeenLastCalledWith('aivideo', { pixel_id: null }));
-    const app = screen.getByLabelText('App');
+    // The sidebar's app switcher is labelled App too (spec admin-console-p4a §3): look inside the Settings card.
+    const app = within(screen.getByRole('heading', { name: 'Settings' }).parentElement).getByLabelText('App');
     await waitFor(() => expect([...app.options].map((o) => o.textContent)).toEqual(['— không gắn —', 'Starlyn (app)', 'Tarot (web)']));
     fireEvent.change(app, { target: { value: 'starlyn' } });
     fireEvent.click(screen.getByRole('button', { name: 'Lưu app' }));
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/admin 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Test Files  8 failed | 11 passed (19)`, `Tests  37 failed | 128 passed (165)`. Fail: `api.test.js` 9 (client chưa có `getApp`/`getAppSummary`/`getAppPlans`/`setDomain`, `listFunnels`/`listDomains` bỏ qua `app`, `createFunnel`/`uploadVersion` chưa nhận `app_id`); `grants.test.jsx` 5 (chưa có menu trong app / `APP_NAV`); `apps.test.jsx` 1 (chưa có `app-card`); `funnels.test.jsx` 1 (`Funnels` còn gọi `createFunnel(slug)`); `app-settings.test.jsx` 5, `app-webhooks.test.jsx` 4, `layout-app.test.jsx` 5, `app-overview.test.jsx` 7 (chưa có route `/apps/:id/settings|webhooks`, ô chọn app, trang Tổng quan). `dashboard.test.jsx` vẫn pass.

- [ ] **Step 3: Implement**

Xoá trang cũ (nội dung chuyển sang `AppSettings.jsx` và `AppWebhooks.jsx`):

```bash
git rm apps/admin/src/pages/AppDetail.jsx
```

`apps/admin/src/app-context.jsx` (mới):

`apps/admin/src/app-context.jsx` (mới):

```jsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useMatch } from 'react-router';
import { useAuth } from './auth.jsx';

const AppsContext = createContext({ apps: [], loading: false, error: null, reload: async () => {} });

// Spec admin-console-p4a §3: the app list, loaded once for the whole console (the sidebar's switcher and the
// Apps page share it) by Layout. GET /v1/apps is open to every signed-in role, so a viewer's switcher works.
export function AppsProvider({ children }) {
  const { client } = useAuth();
  const [state, setState] = useState({ apps: [], loading: true, error: null });
  const reload = useCallback(
    () => client.listApps().then(
      (r) => setState({ apps: r.apps, loading: false, error: null }),
      (error) => setState((s) => ({ ...s, loading: false, error })),
    ),
    [client],
  );
  useEffect(() => {
    reload();
  }, [reload]);
  const value = useMemo(() => ({ ...state, reload }), [state, reload]);
  return <AppsContext.Provider value={value}>{children}</AppsContext.Provider>;
}

// The app context is the URL, not hidden state (spec admin-console-p4a §3, decision #6): under /apps/:id/… the
// console is "in" app :id, anywhere else it is global. app = that app from the list (null while loading or unknown).
export function useAppContext() {
  const match = useMatch('/apps/:id/*');
  const { apps, loading, error, reload } = useContext(AppsContext);
  const appId = match?.params.id ?? null;
  const app = (appId && apps.find((a) => a.id === appId)) || null;
  return { appId, apps, app, loading, error, reload };
}

// One app by id (GET /v1/apps/:id, spec admin-console-p4a §2 "Apps"): the in-app pages load their app from the
// server instead of filtering the list. notFound = the server answered 404 app_not_found.
export function useApp(id) {
  const { client } = useAuth();
  const [state, setState] = useState({ app: null, error: null });
  const reload = useCallback(
    () => client.getApp(id).then((app) => setState({ app, error: null }), (error) => setState({ app: null, error })),
    [client, id],
  );
  useEffect(() => {
    setState({ app: null, error: null });
    reload();
  }, [reload]);
  return { ...state, notFound: state.error?.code === 'app_not_found', reload };
}
```

`apps/admin/src/components/OverviewTable.jsx` (mới; `totals`, `Kpis` và bảng tách nguyên văn từ `Dashboard.jsx`):

`apps/admin/src/components/OverviewTable.jsx` (mới):

```jsx
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { fmtMoney, fmtNum, fmtPct } from '../format.js';

// The KPI row and the per-funnel table of the Dashboard (spec admin-console-p3 §3), shared with the app's
// Tổng quan (spec admin-console-p4a §3), which shows the same thing for one app's funnels.

const rate = (f) => (f.sessions ? f.paid / f.sessions : 0);
// Sortable columns (money columns are per currency: not sortable).
const SORTS = {
  slug: (a, b) => (a.slug < b.slug ? -1 : 1),
  sessions: (a, b) => a.sessions - b.sessions,
  leads: (a, b) => a.leads - b.leads,
  checkouts: (a, b) => a.checkouts - b.checkouts,
  paid: (a, b) => a.paid - b.paid,
  rate: (a, b) => rate(a) - rate(b),
};
const HEADERS = [['slug', 'Funnel'], ['sessions', 'Sessions'], ['leads', 'Leads'], ['checkouts', 'Checkouts'], ['paid', 'Paid'], ['rate', 'Paid/session']];
const Money = ({ items }) => (items.length ? items.map((m) => <div key={m.currency}>{fmtMoney(m.amount_minor, m.currency)}</div>) : '—');

// Totals over every funnel in the range, for the KPI row; money per currency, USD first (the headline), then A–Z.
export function totals(funnels) {
  const sum = (key) => funnels.reduce((n, f) => n + f[key], 0);
  const money = {};
  for (const f of funnels) for (const m of f.revenue) money[m.currency] = (money[m.currency] ?? 0) + m.amount_minor;
  const order = (a, b) => (a === 'USD' ? -1 : b === 'USD' ? 1 : a < b ? -1 : 1);
  return {
    sessions: sum('sessions'),
    leads: sum('leads'),
    checkouts: sum('checkouts'),
    paid: sum('paid'),
    revenue: Object.keys(money).sort(order).map((currency) => ({ currency, amount_minor: money[currency] })),
  };
}

export function Kpis({ funnels }) {
  const t = totals(funnels);
  return (
    <div className="kpis" data-testid="kpis">
      <div className="kpi"><span>Sessions</span><strong>{fmtNum(t.sessions)}</strong><span className="sub">{funnels.length} funnel</span></div>
      <div className="kpi"><span>Leads</span><strong>{fmtNum(t.leads)}</strong><span className="sub">{fmtPct(t.leads, t.sessions)} session</span></div>
      <div className="kpi"><span>Checkouts</span><strong>{fmtNum(t.checkouts)}</strong><span className="sub">{fmtPct(t.checkouts, t.sessions)} session</span></div>
      <div className="kpi"><span>Paid</span><strong>{fmtNum(t.paid)}</strong><span className="sub">{fmtPct(t.paid, t.sessions)} session</span></div>
      <div className="kpi"><span>Doanh thu</span><strong>{t.revenue.length ? fmtMoney(t.revenue[0].amount_minor, t.revenue[0].currency) : '—'}</strong>
        <span className="sub">{t.revenue.slice(1).map((m) => fmtMoney(m.amount_minor, m.currency)).join(' · ') || 'gross, chưa quy đổi'}</span></div>
    </div>
  );
}

// The overview's funnels sorted by the chosen column (sessions, most first, to start); clicking the sorted
// column again flips it, a new column starts descending (A–Z for the slug).
export function useOverviewSort(funnels) {
  const [sort, setSort] = useState({ key: 'sessions', desc: true });
  const rows = useMemo(() => {
    const out = [...(funnels ?? [])].sort(SORTS[sort.key]);
    return sort.desc ? out.reverse() : out;
  }, [funnels, sort]);
  const onSort = (key) => setSort((s) => (s.key === key ? { key, desc: !s.desc } : { key, desc: key !== 'slug' }));
  return { rows, sort, onSort };
}

export function OverviewTable({ rows, sort, onSort }) {
  return (
    <table>
      <thead>
        <tr>
          {HEADERS.map(([key, label]) => (
            <th key={key} className={key === 'slug' ? undefined : 'num'} aria-sort={sort.key === key ? (sort.desc ? 'descending' : 'ascending') : undefined}>
              <button type="button" className="link" onClick={() => onSort(key)}>{label}</button>
            </th>
          ))}
          <th className="num">Doanh thu</th>
          <th className="num">Refund</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((f) => (
          <tr key={f.slug} data-testid="overview-row">
            <td><Link to={`/funnels/${f.slug}`}>{f.slug}</Link></td>
            <td className="num">{fmtNum(f.sessions)}</td>
            <td className="num">{fmtNum(f.leads)}</td>
            <td className="num">{fmtNum(f.checkouts)}</td>
            <td className="num">{fmtNum(f.paid)}</td>
            <td className="num">{fmtPct(f.paid, f.sessions)}</td>
            <td className="num"><Money items={f.revenue} /></td>
            <td className="num"><Money items={f.refunds} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

`apps/admin/src/pages/AppOverview.jsx` (mới):

`apps/admin/src/pages/AppOverview.jsx` (mới):

```jsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '../auth.jsx';
import { AnalyticsError, Loading } from '../components/AnalyticsState.jsx';
import { ErrorNote } from '../components/ErrorNote.jsx';
import { Kpis, OverviewTable, useOverviewSort } from '../components/OverviewTable.jsx';
import { RangePicker, rangeFor } from '../components/RangePicker.jsx';
import { RoleButton } from '../components/RoleButton.jsx';

const isNotFound = (err) => err?.status === 404 && err.code === 'app_not_found';
const fmtRoutes = (routes) => routes.map((r) => `${r.prefix} → ${r.slug} v${r.v}`).join(', ') || '—';

// The app's own domains (shared hosts are not listed: every app may publish there).
function AppDomains({ domains }) {
  return (
    <div className="card" data-testid="app-domains">
      <h2>Domains</h2>
      {domains.length ? (
        <table>
          <thead>
            <tr><th>Host</th><th>Trạng thái</th><th>Route live</th></tr>
          </thead>
          <tbody>
            {domains.map((d) => (
              <tr key={d.host} data-testid="app-domain">
                <td>{d.host}</td>
                <td>{d.status}</td>
                <td>{fmtRoutes(d.routes)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="muted">App chưa có domain riêng; funnel publish lên domain dùng chung.</p>
      )}
    </div>
  );
}

// Tổng quan app (spec admin-console-p4a §3): name and kind, the p3 Dashboard filtered by the app (KPI row and a
// row per funnel), the app's domains and "Tạo funnel". GET /v1/apps/:id/summary gives the app and its domains;
// the numbers come from GET /v1/analytics/overview?app=, which is 404 app_not_found for an unknown app too.
export function AppOverview() {
  const { id } = useParams();
  const { client } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState(null);
  const [days, setDays] = useState(7);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const seq = useRef(0);

  useEffect(() => {
    setSummary(null);
    setSummaryError(null);
    let live = true;
    client.getAppSummary(id).then((r) => live && setSummary(r), (err) => live && setSummaryError(err));
    return () => {
      live = false;
    };
  }, [client, id]);

  useEffect(() => {
    const n = ++seq.current; // only the newest request may change the page
    const { from, to } = rangeFor(days);
    setLoading(true);
    setError(null);
    client.getOverview({ from, to, app: id }).then(
      (r) => n === seq.current && (setData(r), setLoading(false)),
      (err) => n === seq.current && (setError(err), setData(null), setLoading(false)),
    );
  }, [client, id, days]);

  const { rows, sort, onSort } = useOverviewSort(data?.funnels);

  if (isNotFound(summaryError) || isNotFound(error)) return <p className="muted">Không tìm thấy app {id}.</p>;
  if (!summary) return summaryError ? <ErrorNote error={summaryError} /> : <p className="muted">Đang tải…</p>;
  const { app, domains } = summary;
  return (
    <section>
      <div className="page-head">
        <h1>{app.name}</h1>
        <span className="badge kind" data-testid="app-kind">{app.kind}</span>
        <RoleButton need="editor" className="primary" onClick={() => navigate(`/apps/${encodeURIComponent(app.id)}/funnels?new=1`)}>Tạo funnel</RoleButton>
      </div>
      <RangePicker days={days} onChange={setDays} disabled={loading} />
      <AnalyticsError error={error} />
      {loading && <Loading />}
      {!loading && data && !rows.length && <p className="muted">Chưa có sự kiện trong khoảng này.</p>}
      {!loading && rows.length > 0 && (
        <>
          <Kpis funnels={rows} />
          <OverviewTable rows={rows} sort={sort} onSort={onSort} />
        </>
      )}
      <AppDomains domains={domains} />
    </section>
  );
}
```

`apps/admin/src/pages/AppSettings.jsx` (mới; `EditApp` và `RotateKeyDialog` từ `AppDetail.jsx`, nạp app bằng `getApp`):

`apps/admin/src/pages/AppSettings.jsx` (mới):

```jsx
import { useState } from 'react';
import { useParams } from 'react-router';
import { useApp, useAppContext } from '../app-context.jsx';
import { useAuth } from '../auth.jsx';
import { ErrorNote } from '../components/ErrorNote.jsx';
import { FieldErrors } from '../components/FieldErrors.jsx';
import { RoleButton } from '../components/RoleButton.jsx';
import { SecretsBox } from '../components/SecretsBox.jsx';
import { fmtTime } from '../format.js';
import { can } from '../roles.js';
import { splitIds } from './Apps.jsx';

// Editable fields per kind (PUT /v1/apps/:id never changes id, kind or handoff).
const FIELDS = {
  app: [['name', 'Tên'], ['webhook_url', 'Webhook URL'], ['adjust_tracker_url', 'Adjust tracker URL'], ['deeplink_scheme', 'Deep link scheme'], ['deeplink_path', 'Deep link path'], ['bundle_ids', 'Bundle ids']],
  web: [['name', 'Tên'], ['webhook_url', 'Webhook URL'], ['return_url', 'Return URL'], ['bundle_ids', 'Bundle ids']],
};
const asText = (app, f) => (f === 'bundle_ids' ? (app.bundle_ids ?? []).join(', ') : app[f] ?? '');

function EditApp({ app, onSaved }) {
  const { client, me } = useAuth();
  const isAdmin = can(me.role, 'admin');
  const fields = FIELDS[app.kind];
  const [draft, setDraft] = useState(Object.fromEntries(fields.map(([f]) => [f, asText(app, f)])));
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');

  const save = async () => {
    setError(null);
    setNotice('');
    const body = {};
    for (const [f] of fields) {
      if (draft[f].trim() === asText(app, f)) continue;
      body[f] = f === 'bundle_ids' ? splitIds(draft[f]) : draft[f].trim();
    }
    if (!Object.keys(body).length) {
      setNotice('Không có gì thay đổi.');
      return;
    }
    try {
      await client.updateApp(app.id, body);
      setNotice('Đã lưu.');
      onSaved();
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="card form" data-testid="edit-app">
      <label>Kind<select aria-label="Kind" value={app.kind} disabled><option value={app.kind}>{app.kind}</option></select></label>
      {app.kind === 'app' && <label>Handoff<input aria-label="Handoff" value={app.handoff} disabled /></label>}
      {fields.map(([f, label]) => (
        <label key={f}>
          {label}
          <input aria-label={label} value={draft[f]} disabled={!isAdmin} onChange={(e) => setDraft({ ...draft, [f]: e.target.value })} />
        </label>
      ))}
      <RoleButton need="admin" className="primary" onClick={save}>Lưu</RoleButton>
      {notice && <p className="ok">{notice}</p>}
      <ErrorNote error={error} />
      <FieldErrors error={error} />
    </div>
  );
}

function RotateKeyDialog({ app, onClose, onDone }) {
  const { client } = useAuth();
  const [force, setForce] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      onDone(await client.rotateKey(app.id, { force }));
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div role="dialog" aria-modal="true" aria-label={`Xoay key ${app.id}`} className="dialog">
      <h3>Xoay API key của {app.id}</h3>
      <p>Key cũ vẫn dùng được 24 giờ (backend app chuyển sang key mới trong thời gian đó). Key mới chỉ hiện một lần.</p>
      {error?.code === 'key_rotation_pending' ? (
        <>
          <p className="error" role="alert">Key trước còn hiệu lực tới {fmtTime(error.detail?.prev_key_expires_at)}. Tick "force" để khoá nó ngay và xoay tiếp.</p>
          <label><input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} /> force: khoá ngay key trước (nếu còn trong 24 giờ)</label>
        </>
      ) : (
        <ErrorNote error={error} />
      )}
      <div className="row">
        <button type="button" className="primary" disabled={busy} onClick={confirm}>Xác nhận xoay key</button>
        <button type="button" onClick={onClose}>Huỷ</button>
      </div>
    </div>
  );
}

// App settings (spec admin-console-p2 §3, at /apps/:id/settings since p4a §3 "Webhooks / Cài đặt"): edit the
// app, rotate its key. A save also reloads the console's app list (the switcher shows the name).
export function AppSettings() {
  const { id } = useParams();
  const { app, error, notFound, reload } = useApp(id);
  const { reload: reloadApps } = useAppContext();
  const [rotating, setRotating] = useState(false);
  const [newKey, setNewKey] = useState(null);

  if (notFound) return <p className="muted">Không có app {id}.</p>;
  if (!app) return error ? <ErrorNote error={error} /> : <p className="muted">Đang tải…</p>;
  return (
    <section>
      <h1>{app.name} ({app.id})</h1>
      {newKey && <SecretsBox title={`API key mới của ${app.id}`} values={[['API key', newKey]]} onClose={() => setNewKey(null)} />}
      <p className="row">
        <RoleButton need="admin" onClick={() => setRotating(true)}>Xoay key</RoleButton>
        {app.prev_key_expires_at && <span className="muted">Key cũ dùng tới {fmtTime(app.prev_key_expires_at)}</span>}
      </p>
      {rotating && (
        <RotateKeyDialog
          app={app}
          onClose={() => setRotating(false)}
          onDone={(r) => {
            setRotating(false);
            setNewKey(r.api_key);
            reload();
          }}
        />
      )}
      <EditApp
        key={app.id}
        app={app}
        onSaved={() => {
          reload();
          reloadApps();
        }}
      />
    </section>
  );
}
```

`apps/admin/src/pages/AppWebhooks.jsx` (mới; `Webhooks` từ `AppDetail.jsx`):

`apps/admin/src/pages/AppWebhooks.jsx` (mới):

```jsx
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useApp } from '../app-context.jsx';
import { useAuth } from '../auth.jsx';
import { ErrorNote } from '../components/ErrorNote.jsx';
import { RoleButton } from '../components/RoleButton.jsx';
import { fmtTime } from '../format.js';

function Webhooks({ appId }) {
  const { client } = useAuth();
  const [status, setStatus] = useState('');
  const [items, setItems] = useState(null);
  const [next, setNext] = useState(null);
  const [counts, setCounts] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');
  const [resending, setResending] = useState(null);

  const load = useCallback(async (before) => {
    setError(null);
    try {
      const r = await client.listWebhooks(appId, { status: status || undefined, before });
      setItems((prev) => (before ? [...prev, ...r.items] : r.items));
      setNext(r.next_before);
      setCounts(r.counts);
    } catch (err) {
      setError(err);
    }
  }, [client, appId, status]);
  useEffect(() => {
    load(undefined);
  }, [load]);

  // Each resend mints a delivery and an audit row: while one resend (event id in `resending`) is pending,
  // the Gửi lại buttons stay disabled (one at a time keeps the pending marker exact).
  const resend = async (eventId) => {
    if (resending) return;
    setResending(eventId);
    setError(null);
    try {
      const r = await client.resendWebhook(appId, eventId);
      setNotice(`Đã xếp hàng gửi lại (event ${r.event_id}).`);
      await load(undefined);
    } catch (err) {
      setError(err);
    } finally {
      setResending(null);
    }
  };

  return (
    <div className="card">
      {counts && <p data-testid="counts">pending {counts.pending} · delivered {counts.delivered} · dead {counts.dead}</p>}
      <label htmlFor="wh-status">Trạng thái</label>
      <select id="wh-status" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">tất cả</option>
        <option value="pending">pending</option>
        <option value="delivered">delivered</option>
        <option value="dead">dead</option>
      </select>
      {notice && <p className="ok">{notice}</p>}
      <ErrorNote error={error} />
      {items === null ? (
        <p className="muted">Đang tải…</p>
      ) : (
        <table>
          <thead>
            <tr><th>Event</th><th>Lúc (UTC)</th><th>Loại</th><th>app_user_id</th><th>Trạng thái</th><th>Lần</th><th>Lỗi cuối</th><th /></tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.event_id} data-testid="delivery">
                <td>{d.event_id}</td>
                <td>{fmtTime(d.created_at)}</td>
                <td>{d.type}</td>
                <td>{d.app_user_id}</td>
                <td>{d.status}</td>
                <td>{d.attempts}</td>
                <td>{d.last_error ?? ''}</td>
                <td><RoleButton need="admin" disabled={resending !== null} onClick={() => resend(d.event_id)}>Gửi lại</RoleButton></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {next && <button type="button" onClick={() => load(next)}>Tải thêm</button>}
    </div>
  );
}

// App webhooks (spec admin-console-p2 §3, at /apps/:id/webhooks since p4a §3 "Webhooks / Cài đặt"): the
// deliveries to the app's backend, filter, load more, resend.
export function AppWebhooks() {
  const { id } = useParams();
  const { app, error, notFound } = useApp(id);

  if (notFound) return <p className="muted">Không có app {id}.</p>;
  if (!app) return error ? <ErrorNote error={error} /> : <p className="muted">Đang tải…</p>;
  return (
    <section>
      <h1>Webhooks · {app.name}</h1>
      <Webhooks appId={app.id} />
    </section>
  );
}
```

`apps/admin/src/api.js`, `apps/admin/src/App.jsx`, `apps/admin/src/Layout.jsx`, `apps/admin/src/icons.jsx` (sửa, áp dụng đúng diff này):

`apps/admin/src/api.js`, `apps/admin/src/App.jsx`, `apps/admin/src/Layout.jsx`, `apps/admin/src/icons.jsx` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/src/App.jsx b/apps/admin/src/App.jsx
index e147bfc..8f4fec4 100644
--- a/apps/admin/src/App.jsx
+++ b/apps/admin/src/App.jsx
@@ -2,8 +2,10 @@ import { Route, Routes } from 'react-router';
 import { AuthProvider, RequireAuth } from './auth.jsx';
 import { Layout } from './Layout.jsx';
 import { RequireGrant } from './components/RequireGrant.jsx';
-import { AppDetail } from './pages/AppDetail.jsx';
+import { AppOverview } from './pages/AppOverview.jsx';
 import { Apps } from './pages/Apps.jsx';
+import { AppSettings } from './pages/AppSettings.jsx';
+import { AppWebhooks } from './pages/AppWebhooks.jsx';
 import { Audit } from './pages/Audit.jsx';
 import { Billing } from './pages/Billing.jsx';
 import { CustomerDetail } from './pages/CustomerDetail.jsx';
@@ -25,7 +27,11 @@ export function App({ client }) {
           <Route path="/funnels" element={<Funnels />} />
           <Route path="/funnels/:slug" element={<FunnelDetail />} />
           <Route path="/apps" element={<RequireGrant need="apps:read"><Apps /></RequireGrant>} />
-          <Route path="/apps/:id" element={<RequireGrant need="apps:read"><AppDetail /></RequireGrant>} />
+          {/* In an app (spec admin-console-p4a §3): Tổng quan is open to every role (GET /v1/apps/:id/summary is viewer). */}
+          <Route path="/apps/:id" element={<AppOverview />} />
+          <Route path="/apps/:id/settings" element={<RequireGrant need="apps:read"><AppSettings /></RequireGrant>} />
+          <Route path="/apps/:id/webhooks" element={<RequireGrant need="apps:read"><AppWebhooks /></RequireGrant>} />
+          {/* /apps/:id/funnels, /plans, /customers, /domains and /audit come with the in-app pages (p4a §3). */}
           <Route path="/customers" element={<RequireGrant need="support"><Customers /></RequireGrant>} />
           <Route path="/customers/:ref" element={<RequireGrant need="support"><CustomerDetail /></RequireGrant>} />
           <Route path="/domains" element={<Domains />} />
diff --git a/apps/admin/src/Layout.jsx b/apps/admin/src/Layout.jsx
index c7a1621..8bc339b 100644
--- a/apps/admin/src/Layout.jsx
+++ b/apps/admin/src/Layout.jsx
@@ -1,4 +1,5 @@
-import { NavLink, Outlet } from 'react-router';
+import { Link, NavLink, Outlet, useNavigate } from 'react-router';
+import { AppsProvider, useAppContext } from './app-context.jsx';
 import { useAuth } from './auth.jsx';
 import { ICONS, Mark } from './icons.jsx';
 import { can } from './roles.js';
@@ -15,28 +16,76 @@ export const NAV = [
   { to: '/settings/users', label: 'Settings', need: 'admin', icon: 'settings' },
 ];
 
+// The menu inside an app (/apps/:id/…, spec admin-console-p4a §3); `to` takes the app id.
+const under = (path) => (id) => `/apps/${encodeURIComponent(id)}${path}`;
+export const APP_NAV = [
+  { to: under(''), label: 'Tổng quan', need: 'viewer', end: true, icon: 'overview' },
+  { to: under('/funnels'), label: 'Funnels', need: 'viewer', icon: 'funnels' },
+  { to: under('/plans'), label: 'Giá', need: 'prices:read', icon: 'plans' },
+  { to: under('/customers'), label: 'Khách hàng', need: 'support', icon: 'customers' },
+  { to: under('/domains'), label: 'Domains', need: 'viewer', icon: 'domains' },
+  { to: under('/webhooks'), label: 'Webhooks', need: 'apps:read', icon: 'webhooks' },
+  { to: under('/audit'), label: 'Audit', need: 'viewer', icon: 'audit' },
+  { to: under('/settings'), label: 'Cài đặt', need: 'apps:read', icon: 'settings' },
+];
+
+// "Tất cả app" + one option per app; picking one navigates (the URL is the context, nothing else is stored).
+function AppSwitcher() {
+  const { appId, apps } = useAppContext();
+  const navigate = useNavigate();
+  const known = apps.some((a) => a.id === appId);
+  return (
+    <select
+      className="switcher"
+      data-testid="app-switcher"
+      aria-label="App"
+      value={appId ?? ''}
+      onChange={(e) => navigate(e.target.value ? `/apps/${encodeURIComponent(e.target.value)}` : '/')}
+    >
+      <option value="">Tất cả app</option>
+      {apps.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
+      {appId && !known && <option value={appId}>{appId}</option>}
+    </select>
+  );
+}
+
+function Menu() {
+  const { me } = useAuth();
+  const { appId } = useAppContext();
+  const items = appId ? APP_NAV.map((n) => ({ ...n, to: n.to(appId) })) : NAV;
+  return (
+    <>
+      {items.filter((n) => can(me.role, n.need)).map((n) => {
+        const I = ICONS[n.icon];
+        return <NavLink key={n.to} to={n.to} end={n.end}><I />{n.label}</NavLink>;
+      })}
+      {appId && <Link to="/" className="back">← Tất cả app</Link>}
+    </>
+  );
+}
+
 export function Layout() {
   const { me, logout } = useAuth();
   const LogoutIcon = ICONS.logout;
   return (
-    <div className="shell">
-      <nav className="side">
-        <strong className="brand"><Mark />iFunnel</strong>
-        {NAV.filter((n) => can(me.role, n.need)).map((n) => {
-          const I = ICONS[n.icon];
-          return <NavLink key={n.to} to={n.to} end={n.end}><I />{n.label}</NavLink>;
-        })}
-      </nav>
-      <div className="main">
-        <header className="top">
-          <span className="user">
-            <span className="avatar" aria-hidden="true">{me.email[0]}</span>
-            <span data-testid="who">{me.email} · {me.role}</span>
-          </span>
-          <button type="button" onClick={logout}><LogoutIcon />Đăng xuất</button>
-        </header>
-        <Outlet />
+    <AppsProvider>
+      <div className="shell">
+        <nav className="side">
+          <strong className="brand"><Mark />iFunnel</strong>
+          <AppSwitcher />
+          <Menu />
+        </nav>
+        <div className="main">
+          <header className="top">
+            <span className="user">
+              <span className="avatar" aria-hidden="true">{me.email[0]}</span>
+              <span data-testid="who">{me.email} · {me.role}</span>
+            </span>
+            <button type="button" onClick={logout}><LogoutIcon />Đăng xuất</button>
+          </header>
+          <Outlet />
+        </div>
       </div>
-    </div>
+    </AppsProvider>
   );
 }
diff --git a/apps/admin/src/api.js b/apps/admin/src/api.js
index 519048e..13cec6b 100644
--- a/apps/admin/src/api.js
+++ b/apps/admin/src/api.js
@@ -82,12 +82,19 @@ export function createClient({ base = API_BASE, fetch = (...a) => globalThis.fet
     loginUrl: (returnTo = '/') => `${base}/v1/auth/google?return=${q(returnTo)}`,
     me,
     logout: () => call('POST', '/v1/auth/logout'),
-    listFunnels: () => call('GET', '/v1/funnels'),
-    createFunnel: (slug) => call('POST', '/v1/funnels', { slug }),
+    // Spec admin-console-p4a §2-3: app = 'none' lists the funnels not yet in an app; a new funnel needs its app
+    // (400 app_required without it); the first upload of a new slug creates it in app_id.
+    listFunnels: ({ app } = {}) => call('GET', `/v1/funnels${query({ app })}`),
+    createFunnel: ({ slug, app_id }) => call('POST', '/v1/funnels', { slug, app_id }),
     getFunnel: (slug) => call('GET', `/v1/funnels/${q(slug)}`),
-    uploadVersion: async (slug, html) => call('POST', `/v1/funnels/${q(slug)}/versions`, { html, sha256: await sha256Hex(html) }),
+    uploadVersion: async (slug, html, { app_id } = {}) =>
+      call('POST', `/v1/funnels/${q(slug)}/versions`, { html, sha256: await sha256Hex(html), ...(app_id && { app_id }) }),
     setFunnel: (slug, body) => call('PUT', `/v1/funnels/${q(slug)}`, body),
     listApps: () => call('GET', '/v1/apps'),
+    // One app with its counts, its overview (own funnels and domains) and its read-only price table (p4a §2 "Apps").
+    getApp: (id) => call('GET', `/v1/apps/${q(id)}`),
+    getAppSummary: (id) => call('GET', `/v1/apps/${q(id)}/summary`),
+    getAppPlans: (id) => call('GET', `/v1/apps/${q(id)}/plans`),
     createApp: (body) => call('POST', '/v1/apps', body),
     updateApp: (id, body) => call('PUT', `/v1/apps/${q(id)}`, body),
     rotateKey: (id, { force = false } = {}) => call('POST', `/v1/apps/${q(id)}/rotate-key`, force ? { force: true } : undefined),
@@ -96,18 +103,20 @@ export function createClient({ base = API_BASE, fetch = (...a) => globalThis.fet
       return call('GET', `/v1/apps/${q(id)}/webhooks${qs ? `?${qs}` : ''}`);
     },
     resendWebhook: (id, eventId) => call('POST', `/v1/apps/${q(id)}/webhooks/${q(eventId)}/resend`),
-    listDomains: () => call('GET', '/v1/domains'),
+    // app: that app's domains and the shared ones (both publishable); 'none' → the shared ones only.
+    listDomains: ({ app } = {}) => call('GET', `/v1/domains${query({ app })}`),
+    // body {status?, app_id?}: app_id null makes the host shared again (p4a §2 "Domain và publish").
+    setDomain: (host, body) => call('PUT', `/v1/domains/${q(host)}`, body),
     syncHost: (host) => call('POST', `/v1/routes/${q(host)}/sync`),
     publish: (host, body) => call('PUT', `/v1/routes/${q(host)}`, body),
     rollback: (host, prefix) => call('POST', `/v1/routes/${q(host)}/rollback`, { prefix }),
-    listAudit: (params = {}) => {
-      const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)).toString();
-      return call('GET', `/v1/audit${qs ? `?${qs}` : ''}`);
-    },
+    // params {target?, action?, before?, app?}; empty filters are left out.
+    listAudit: (params = {}) => call('GET', `/v1/audit${query(params)}`),
     getPrices: (slug) => call('GET', `/v1/funnels/${q(slug)}/prices`),
     setPrices: (slug, plans) => call('PUT', `/v1/funnels/${q(slug)}/prices`, { plans }),
     listPaddlePrices: () => call('GET', '/v1/paddle/prices'),
-    // POST: an email stays out of URLs and access logs. query = {email} | {customer_ref} | {checkout_id}.
+    // POST: an email stays out of URLs and access logs. query = {email} | {customer_ref} | {checkout_id},
+    // plus app_id to see only what the customer has in that app (p4a §2 "Khách hàng").
     lookupCustomers: (query) => call('POST', '/v1/customers/lookup', query),
     resendEmail: (ref) => call('POST', `/v1/customers/${q(ref)}/resend-email`),
     rotateUserId: (ref) => call('POST', `/v1/customers/${q(ref)}/rotate-user-id`),
@@ -118,7 +127,8 @@ export function createClient({ base = API_BASE, fetch = (...a) => globalThis.fet
       const qs = new URLSearchParams({ ...(topic && { topic }), ...(before && { before_id: String(before) }) }).toString();
       return call('GET', `/v1/billing/outbox${qs ? `?${qs}` : ''}`);
     },
-    // Dashboard (spec admin-console-p3 §3); empty filters are left out of the query string.
+    // Dashboard (spec admin-console-p3 §3); empty filters are left out of the query string. getOverview takes
+    // {from, to, app?}: app keeps the funnels of that app (p4a §2 "Analytics").
     getOverview: (params) => call('GET', `/v1/analytics/overview${query(params)}`),
     getFunnelStats: (slug, params) => call('GET', `/v1/analytics/funnels/${q(slug)}${query(params)}`),
     getFunnelBreakdown: (slug, params) => call('GET', `/v1/analytics/funnels/${q(slug)}/breakdown${query(params)}`),
diff --git a/apps/admin/src/icons.jsx b/apps/admin/src/icons.jsx
index 746a1a7..ac24dec 100644
--- a/apps/admin/src/icons.jsx
+++ b/apps/admin/src/icons.jsx
@@ -26,6 +26,14 @@ export const ICONS = {
       <circle cx="12" cy="12" r="3" />
     </Icon>
   ),
+  // In-app menu (spec admin-console-p4a §3): Tổng quan (gauge), Giá (tag), Webhooks (webhook).
+  overview: () => <Icon><path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" /></Icon>,
+  plans: () => (
+    <Icon><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" /><circle cx="7.5" cy="7.5" r=".5" fill="currentColor" /></Icon>
+  ),
+  webhooks: () => (
+    <Icon><path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2" /><path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06" /><path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8" /></Icon>
+  ),
   logout: () => <Icon><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></Icon>,
 };
 
PATCH
```

`apps/admin/src/pages/Apps.jsx`, `apps/admin/src/pages/Dashboard.jsx`, `apps/admin/src/pages/Funnels.jsx`, `apps/admin/src/styles.css` (sửa, áp dụng đúng diff này):

`apps/admin/src/pages/Apps.jsx`, `apps/admin/src/pages/Dashboard.jsx`, `apps/admin/src/pages/Funnels.jsx`, `apps/admin/src/styles.css` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/src/pages/Apps.jsx b/apps/admin/src/pages/Apps.jsx
index 34eddfa..18340c9 100644
--- a/apps/admin/src/pages/Apps.jsx
+++ b/apps/admin/src/pages/Apps.jsx
@@ -1,11 +1,11 @@
-import { useCallback, useEffect, useState } from 'react';
+import { useState } from 'react';
 import { Link } from 'react-router';
+import { useAppContext } from '../app-context.jsx';
 import { useAuth } from '../auth.jsx';
 import { ErrorNote } from '../components/ErrorNote.jsx';
 import { FieldErrors } from '../components/FieldErrors.jsx';
 import { RoleButton } from '../components/RoleButton.jsx';
 import { SecretsBox } from '../components/SecretsBox.jsx';
-import { fmtTime } from '../format.js';
 
 const EMPTY = { id: '', name: '', kind: 'app', adjust_tracker_url: '', deeplink_scheme: '', handoff: 'user_id', deeplink_path: 'open', return_url: '', webhook_url: '', bundle_ids: '' };
 
@@ -26,20 +26,30 @@ function createBody(d) {
   };
 }
 
-// Apps (spec admin-console-p2 §3): the registry; admins create one (key + secret shown once).
+// One card per app (spec admin-console-p4a §3 "Apps"): name, kind and what it holds; the card opens the app.
+function AppCard({ app }) {
+  return (
+    <Link to={`/apps/${encodeURIComponent(app.id)}`} className="app-card" data-testid="app-card">
+      <div className="row">
+        <h2>{app.name}</h2>
+        <span className="badge kind">{app.kind}</span>
+      </div>
+      <code className="muted">{app.id}</code>
+      <span className="counts">{app.funnels_count} funnel · {app.domains_count} domain · {app.live_routes_count} route live</span>
+    </Link>
+  );
+}
+
+// Apps (spec admin-console-p2 §3, cards since p4a §3): the registry; admins create one (key + secret shown once).
+// The list is the console's (AppsProvider): a new app shows up in the switcher too.
 export function Apps() {
   const { client } = useAuth();
-  const [apps, setApps] = useState(null);
+  const { apps, loading, error: loadError, reload } = useAppContext();
   const [error, setError] = useState(null);
   const [draft, setDraft] = useState(EMPTY);
   const [created, setCreated] = useState(null);
   const [busy, setBusy] = useState(false);
 
-  const load = useCallback(() => client.listApps().then((r) => setApps(r.apps), setError), [client]);
-  useEffect(() => {
-    load();
-  }, [load]);
-
   const field = (name, label, props = {}) => (
     <label>
       {label}
@@ -55,7 +65,7 @@ export function Apps() {
     try {
       setCreated(await client.createApp(createBody(draft)));
       setDraft(EMPTY);
-      await load();
+      await reload();
     } catch (err) {
       setError(err);
     } finally {
@@ -73,25 +83,13 @@ export function Apps() {
           onClose={() => setCreated(null)}
         />
       )}
-      {apps === null ? (
+      <ErrorNote error={loadError} />
+      {loading ? (
         <p className="muted">Đang tải…</p>
       ) : (
-        <table>
-          <thead>
-            <tr><th>id</th><th>Kind</th><th>Handoff</th><th>Webhook URL</th><th>Key cũ dùng tới</th></tr>
-          </thead>
-          <tbody>
-            {apps.map((a) => (
-              <tr key={a.id}>
-                <td><Link to={`/apps/${a.id}`}>{a.id}</Link></td>
-                <td>{a.kind}</td>
-                <td>{a.handoff ?? '—'}</td>
-                <td>{a.webhook_url ?? '—'}</td>
-                <td>{fmtTime(a.prev_key_expires_at)}</td>
-              </tr>
-            ))}
-          </tbody>
-        </table>
+        <div className="app-cards">
+          {apps.map((a) => <AppCard key={a.id} app={a} />)}
+        </div>
       )}
       <div className="card form" data-testid="create-app">
         <h2>Tạo app</h2>
diff --git a/apps/admin/src/pages/Dashboard.jsx b/apps/admin/src/pages/Dashboard.jsx
index 304688f..35b831a 100644
--- a/apps/admin/src/pages/Dashboard.jsx
+++ b/apps/admin/src/pages/Dashboard.jsx
@@ -1,51 +1,8 @@
-import { useEffect, useMemo, useRef, useState } from 'react';
-import { Link } from 'react-router';
+import { useEffect, useRef, useState } from 'react';
 import { useAuth } from '../auth.jsx';
 import { AnalyticsError, Loading } from '../components/AnalyticsState.jsx';
+import { Kpis, OverviewTable, useOverviewSort } from '../components/OverviewTable.jsx';
 import { RangePicker, rangeFor } from '../components/RangePicker.jsx';
-import { fmtMoney, fmtNum, fmtPct } from '../format.js';
-
-const rate = (f) => (f.sessions ? f.paid / f.sessions : 0);
-// Sortable columns (money columns are per currency: not sortable).
-const SORTS = {
-  slug: (a, b) => (a.slug < b.slug ? -1 : 1),
-  sessions: (a, b) => a.sessions - b.sessions,
-  leads: (a, b) => a.leads - b.leads,
-  checkouts: (a, b) => a.checkouts - b.checkouts,
-  paid: (a, b) => a.paid - b.paid,
-  rate: (a, b) => rate(a) - rate(b),
-};
-const HEADERS = [['slug', 'Funnel'], ['sessions', 'Sessions'], ['leads', 'Leads'], ['checkouts', 'Checkouts'], ['paid', 'Paid'], ['rate', 'Paid/session']];
-const Money = ({ items }) => (items.length ? items.map((m) => <div key={m.currency}>{fmtMoney(m.amount_minor, m.currency)}</div>) : '—');
-
-// Totals over every funnel in the range, for the KPI row; money per currency, USD first (the headline), then A–Z.
-export function totals(funnels) {
-  const sum = (key) => funnels.reduce((n, f) => n + f[key], 0);
-  const money = {};
-  for (const f of funnels) for (const m of f.revenue) money[m.currency] = (money[m.currency] ?? 0) + m.amount_minor;
-  const order = (a, b) => (a === 'USD' ? -1 : b === 'USD' ? 1 : a < b ? -1 : 1);
-  return {
-    sessions: sum('sessions'),
-    leads: sum('leads'),
-    checkouts: sum('checkouts'),
-    paid: sum('paid'),
-    revenue: Object.keys(money).sort(order).map((currency) => ({ currency, amount_minor: money[currency] })),
-  };
-}
-
-function Kpis({ funnels }) {
-  const t = totals(funnels);
-  return (
-    <div className="kpis" data-testid="kpis">
-      <div className="kpi"><span>Sessions</span><strong>{fmtNum(t.sessions)}</strong><span className="sub">{funnels.length} funnel</span></div>
-      <div className="kpi"><span>Leads</span><strong>{fmtNum(t.leads)}</strong><span className="sub">{fmtPct(t.leads, t.sessions)} session</span></div>
-      <div className="kpi"><span>Checkouts</span><strong>{fmtNum(t.checkouts)}</strong><span className="sub">{fmtPct(t.checkouts, t.sessions)} session</span></div>
-      <div className="kpi"><span>Paid</span><strong>{fmtNum(t.paid)}</strong><span className="sub">{fmtPct(t.paid, t.sessions)} session</span></div>
-      <div className="kpi"><span>Doanh thu</span><strong>{t.revenue.length ? fmtMoney(t.revenue[0].amount_minor, t.revenue[0].currency) : '—'}</strong>
-        <span className="sub">{t.revenue.slice(1).map((m) => fmtMoney(m.amount_minor, m.currency)).join(' · ') || 'gross, chưa quy đổi'}</span></div>
-    </div>
-  );
-}
 
 // Dashboard (spec admin-console-p3 §3): one row per funnel with events or a checkout in the range.
 export function Dashboard() {
@@ -54,7 +11,6 @@ export function Dashboard() {
   const [data, setData] = useState(null);
   const [error, setError] = useState(null);
   const [loading, setLoading] = useState(true);
-  const [sort, setSort] = useState({ key: 'sessions', desc: true });
   const seq = useRef(0);
 
   useEffect(() => {
@@ -68,11 +24,7 @@ export function Dashboard() {
     );
   }, [client, days]);
 
-  const rows = useMemo(() => {
-    const out = [...(data?.funnels ?? [])].sort(SORTS[sort.key]);
-    return sort.desc ? out.reverse() : out;
-  }, [data, sort]);
-  const sortBy = (key) => setSort((s) => (s.key === key ? { key, desc: !s.desc } : { key, desc: key !== 'slug' }));
+  const { rows, sort, onSort } = useOverviewSort(data?.funnels);
 
   return (
     <section>
@@ -84,33 +36,7 @@ export function Dashboard() {
       {!loading && rows.length > 0 && (
         <>
           <Kpis funnels={rows} />
-          <table>
-            <thead>
-              <tr>
-                {HEADERS.map(([key, label]) => (
-                  <th key={key} className={key === 'slug' ? undefined : 'num'} aria-sort={sort.key === key ? (sort.desc ? 'descending' : 'ascending') : undefined}>
-                    <button type="button" className="link" onClick={() => sortBy(key)}>{label}</button>
-                  </th>
-                ))}
-                <th className="num">Doanh thu</th>
-                <th className="num">Refund</th>
-              </tr>
-            </thead>
-            <tbody>
-              {rows.map((f) => (
-                <tr key={f.slug} data-testid="overview-row">
-                  <td><Link to={`/funnels/${f.slug}`}>{f.slug}</Link></td>
-                  <td className="num">{fmtNum(f.sessions)}</td>
-                  <td className="num">{fmtNum(f.leads)}</td>
-                  <td className="num">{fmtNum(f.checkouts)}</td>
-                  <td className="num">{fmtNum(f.paid)}</td>
-                  <td className="num">{fmtPct(f.paid, f.sessions)}</td>
-                  <td className="num"><Money items={f.revenue} /></td>
-                  <td className="num"><Money items={f.refunds} /></td>
-                </tr>
-              ))}
-            </tbody>
-          </table>
+          <OverviewTable rows={rows} sort={sort} onSort={onSort} />
         </>
       )}
     </section>
diff --git a/apps/admin/src/pages/Funnels.jsx b/apps/admin/src/pages/Funnels.jsx
index 3130769..18e52cb 100644
--- a/apps/admin/src/pages/Funnels.jsx
+++ b/apps/admin/src/pages/Funnels.jsx
@@ -21,7 +21,8 @@ export function Funnels() {
     setError(null);
     const s = slug.trim();
     try {
-      await client.createFunnel(s);
+      // Spec admin-console-p4a §3 "Funnels": the server now wants app_id too; the app picker comes with that page.
+      await client.createFunnel({ slug: s });
       navigate(`/funnels/${s}?tab=main`); // Tổng quan: the upload screen (final review M1)
     } catch (err) {
       setError(err);
diff --git a/apps/admin/src/styles.css b/apps/admin/src/styles.css
index e23c0c9..19b70c5 100644
--- a/apps/admin/src/styles.css
+++ b/apps/admin/src/styles.css
@@ -114,6 +114,12 @@ table table { margin: 0; box-shadow: none; }
 .side a.active { background: var(--side-active); color: #fff; }
 .side a.active::before { content: ''; position: absolute; left: -12px; top: 8px; bottom: 8px; width: 3px; border-radius: 0 3px 3px 0; background: #60a5fa; }
 .side a.active svg { opacity: 1; }
+/* App switcher (spec admin-console-p4a §3): a dark select under the brand; the in-app menu ends with the way back. */
+.side .switcher { width: 100%; margin: 0 0 var(--space-3); background: rgba(255, 255, 255, 0.06); color: #fff; border-color: rgba(255, 255, 255, 0.14); font-weight: 500; cursor: pointer; }
+.side .switcher:hover { border-color: rgba(255, 255, 255, 0.28); }
+.side .switcher option { background: var(--side-bg); color: #fff; }
+.side a.back { margin-top: var(--space-3); padding-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.08); border-radius: 0; font-size: 13px; color: #94a3b8; }
+.side a.back:hover { background: none; color: #fff; }
 .main { flex: 1; min-width: 0; padding: 0 var(--space-6) var(--space-6); }
 .top { display: flex; justify-content: flex-end; gap: var(--space-3); align-items: center; padding: var(--space-3) 0; border-bottom: 1px solid var(--border); margin: 0 calc(-1 * var(--space-6)) var(--space-2); padding-inline: var(--space-6); background: var(--surface); position: sticky; top: 0; z-index: 5; }
 .user { display: inline-flex; align-items: center; gap: 8px; color: var(--fg-2); font-size: 13px; }
@@ -151,6 +157,16 @@ button.badge { cursor: pointer; }
 .qr { margin-top: var(--space-2); }
 .qr svg { width: 180px; height: 180px; }
 
+/* Apps (spec admin-console-p4a §3): a grid of app cards, a kind badge, a page head with the app name. */
+.app-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: var(--space-3); margin: var(--space-3) 0 var(--space-4); }
+.app-card { display: flex; flex-direction: column; gap: 6px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: var(--space-4); box-shadow: var(--shadow-sm); color: var(--fg); transition: border-color var(--ease), box-shadow var(--ease); }
+.app-card:hover { border-color: var(--primary); box-shadow: var(--shadow-md); text-decoration: none; }
+.app-card h2 { margin: 0; }
+.app-card .counts { font-size: 12.5px; color: var(--fg-2); font-variant-numeric: tabular-nums; }
+.badge.kind { background: var(--primary-soft); color: var(--primary); text-transform: uppercase; letter-spacing: 0.04em; font-size: 11px; font-weight: 600; }
+.page-head { display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap; }
+.page-head > button { margin-left: auto; }
+
 /* Tabs */
 [role='tablist'] { display: flex; gap: 2px; margin: var(--space-2) 0 var(--space-4); border-bottom: 1px solid var(--border); }
 [role='tab'] { border: 0; border-bottom: 2px solid transparent; border-radius: 0; background: none; color: var(--muted); padding: 8px 12px; margin-bottom: -1px; font-weight: 500; }
@@ -218,6 +234,8 @@ svg.bars .track { stroke: var(--surface-2); }
   .brand { padding: 0 8px 0 0; }
   .side a { padding: 8px 10px; white-space: nowrap; }
   .side a.active::before { display: none; }
+  .side .switcher { width: auto; margin: 0 var(--space-2) 0 0; }
+  .side a.back { margin: 0; padding-top: 8px; border-top: 0; }
   .main { padding: 0 var(--space-4) var(--space-5); overflow-x: auto; }
   .top { margin-inline: calc(-1 * var(--space-4)); padding-inline: var(--space-4); }
   h1 { font-size: 20px; }
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/admin -- test/layout-app.test.jsx test/app-overview.test.jsx test/app-settings.test.jsx test/app-webhooks.test.jsx test/apps.test.jsx test/grants.test.jsx test/api.test.js test/funnels.test.jsx test/dashboard.test.jsx
npm test -w @ikf/admin 2>&1 | grep -E "Test Files|Tests  "
VITE_API_BASE=https://api.example.com npm run build -w @ikf/admin
```

Expected: 9 file `Tests  79 passed (79)`; toàn bộ admin `Test Files  19 passed (19)`, `Tests  165 passed (165)` (trước task: 15 file, 133 test); `dashboard.test.jsx` 8 passed không sửa; build Vite thành công.

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/App.jsx apps/admin/src/Layout.jsx apps/admin/src/api.js apps/admin/src/app-context.jsx apps/admin/src/components/OverviewTable.jsx apps/admin/src/icons.jsx apps/admin/src/pages/AppOverview.jsx apps/admin/src/pages/AppSettings.jsx apps/admin/src/pages/AppWebhooks.jsx apps/admin/src/pages/Apps.jsx apps/admin/src/pages/Dashboard.jsx apps/admin/src/pages/Funnels.jsx apps/admin/src/styles.css apps/admin/test/api.test.js apps/admin/test/app-overview.test.jsx apps/admin/test/app-settings.test.jsx apps/admin/test/app-webhooks.test.jsx apps/admin/test/apps-fixtures.js apps/admin/test/apps.test.jsx apps/admin/test/funnels.test.jsx apps/admin/test/grants.test.jsx apps/admin/test/helpers.jsx apps/admin/test/layout-app.test.jsx
git commit -m "feat(admin): app context in the URL, app switcher, Apps cards, app overview; AppDetail split into settings/webhooks
```

---

---

### Task 9: SPA — Dashboard toàn cục theo app (+ "Chưa gán"), Funnels toàn cục có cột App + lọc + tạo funnel bắt buộc app, Funnels trong app

**Files:**
- Modify: `apps/admin/src/App.jsx`, `apps/admin/src/components/OverviewTable.jsx`, `apps/admin/src/pages/Dashboard.jsx`, `apps/admin/src/pages/Funnels.jsx`
- Test: `apps/admin/test/funnels-app.test.jsx` (mới); `apps/admin/test/dashboard.test.jsx`, `apps/admin/test/funnels.test.jsx` (sửa)

**Interfaces:**
- Consumes: `GET /v1/analytics/overview?from&to` (mỗi dòng có `app_id`, `null` = chưa gán; không có `app=none`), `GET /v1/funnels?app=<id>|none`, `POST /v1/funnels {slug, app_id}` (Tasks 1–6). Ở SPA (Task 8): `useAppContext()` → `{appId, apps, …}`, client `getOverview({from, to})`, `listFunnels({app})`, `createFunnel({slug, app_id})`; `Kpis`, `totals`, `useOverviewSort`, `OverviewTable` từ `components/OverviewTable.jsx`; `RangePicker`/`rangeFor`, `AnalyticsError`/`Loading`, `RoleButton`, `ErrorNote`; test: `fakeClient`, `renderApp`, `ME`, `appsClient` (`apps-fixtures.js`: Starlyn + Tarot Web).
- Produces:
  - `src/components/OverviewTable.jsx` export thêm: `COUNT_SORTS` (sessions, leads, checkouts, paid, rate), `COUNT_HEADERS`, `Money`, `sumMoney(rows, key)` (cộng tiền theo currency, USD trước rồi A–Z; `totals()` dùng lại), `useSorted(items, sorts, textKey)` → `{rows, sort, onSort}` (`useOverviewSort(funnels)` = `useSorted(funnels, SORTS, 'slug')`, hành vi không đổi), `<SortTh id label sort onSort text? />`.
  - `src/pages/Dashboard.jsx`: `groupByApp(funnels)` → `[{app_id, funnels, sessions, leads, checkouts, paid, revenue, refunds}]` (app theo thứ tự xuất hiện, nhóm `app_id: null` cuối). Trang `/`: `RangePicker` + `Kpis` (tổng mọi dòng) + bảng theo app, mỗi dòng `data-testid="app-row"`: App (tên từ `useAppContext().apps`, không biết thì id; link `/apps/:id`) · Funnels · Sessions · Leads · Checkouts · Paid · Paid/session · Doanh thu · Refund; sort được theo App/Funnels/các cột đếm; dòng "Chưa gán" (link `/funnels?app=none`) luôn cuối. Bảng per-funnel (`overview-row`) không còn ở `/`.
  - `src/pages/Funnels.jsx` (một component cho cả hai route): toàn cục `/funnels` có cột App (tên, link `/apps/:id`; `—` khi null) và `<select aria-label="Lọc app">` (`''` Tất cả · `none` Chưa gán · từng app) gắn `?app=`, gọi `listFunnels({app})` (`{}` khi Tất cả); form tạo `data-testid="create-funnel"` có `<select aria-label="App" required>` (option `''` "Chọn app" bị `disabled`), nút `New funnel` khoá tới khi có slug và app; `createFunnel({slug, app_id})`. Trong app `/apps/:id/funnels`: `listFunnels({app: id})`, không cột App, không ô lọc, app hiện dạng chữ `data-testid="locked-app"` "App: <tên>"; `?new=1` focus ô `slug-moi`.
  - `src/App.jsx`: route `/apps/:id/funnels` (viewer).

- [ ] **Step 1: Viết test fail**

`apps/admin/test/funnels-app.test.jsx` (mới):

`apps/admin/test/funnels-app.test.jsx` (mới):

```jsx
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { renderApp, ME } from './helpers.jsx';
import { appsClient } from './apps-fixtures.js';

const FUNNELS = [
  { slug: 'moon-reading', latest_v: 3, live: [], pixel_id: null, app_id: 'starlyn', updated_at: '2026-10-11T08:00:00.000Z' },
  { slug: 'old-quiz', latest_v: 1, live: [], pixel_id: null, app_id: null, updated_at: '2026-10-10T08:00:00.000Z' },
];
// GET /v1/funnels?app= as the server answers it: one app's funnels, `none` = the unassigned ones.
const listFunnels = () => vi.fn(async ({ app } = {}) => ({
  funnels: FUNNELS.filter((f) => !app || (app === 'none' ? f.app_id === null : f.app_id === app)),
}));
const client = (me, overrides = {}) => appsClient(me, { listFunnels: listFunnels(), getFunnel: vi.fn(async (slug) => ({ slug, pixel_id: null, app_id: 'starlyn', versions: [], live: [] })), ...overrides });
const form = () => screen.getByTestId('create-funnel');
const appCell = (slug) => screen.getByRole('link', { name: slug }).closest('tr').querySelectorAll('td')[4];

// Spec admin-console-p4a §3 "Funnels trong app" and the global /funnels: App column, filter by app, an app is required.
describe('Funnels by app', () => {
  it('global: the App column shows the app name (link to the app) or —; the filter is ?app= (none = Chưa gán)', async () => {
    const c = client(ME.viewer);
    renderApp(c, '/funnels');
    await screen.findByRole('link', { name: 'old-quiz' });
    expect(c.listFunnels).toHaveBeenCalledWith({});
    await waitFor(() => expect(appCell('moon-reading').textContent).toBe('Starlyn'));
    expect(within(appCell('moon-reading')).getByRole('link').getAttribute('href')).toBe('/apps/starlyn');
    expect(appCell('old-quiz').textContent).toBe('—');
    const filter = screen.getByLabelText('Lọc app');
    expect([...filter.options].map((o) => [o.value, o.textContent])).toEqual([['', 'Tất cả'], ['none', 'Chưa gán'], ['starlyn', 'Starlyn'], ['tarot-web', 'Tarot Web']]);
    fireEvent.change(filter, { target: { value: 'starlyn' } });
    await waitFor(() => expect(c.listFunnels).toHaveBeenLastCalledWith({ app: 'starlyn' }));
    await waitFor(() => expect(screen.queryByRole('link', { name: 'old-quiz' })).toBeNull());
    expect(screen.getByRole('link', { name: 'moon-reading' })).toBeTruthy();
    fireEvent.change(filter, { target: { value: 'none' } });
    await waitFor(() => expect(c.listFunnels).toHaveBeenLastCalledWith({ app: 'none' }));
    await waitFor(() => expect(screen.queryByRole('link', { name: 'moon-reading' })).toBeNull());
    expect(screen.getByRole('link', { name: 'old-quiz' })).toBeTruthy();
  });

  it('global: ?app=none from the Dashboard\'s "Chưa gán" row opens the list filtered', async () => {
    const c = client(ME.viewer);
    renderApp(c, '/funnels?app=none');
    await screen.findByRole('link', { name: 'old-quiz' });
    expect(c.listFunnels).toHaveBeenCalledWith({ app: 'none' });
    expect(c.listFunnels).not.toHaveBeenCalledWith({});
    expect(screen.getByLabelText('Lọc app').value).toBe('none');
    expect(screen.queryByRole('link', { name: 'moon-reading' })).toBeNull();
  });

  it('global create requires an app: no empty choice, the button greyed out until one is picked; createFunnel gets {slug, app_id}', async () => {
    const c = client(ME.editor, { createFunnel: vi.fn(async ({ slug }) => ({ slug })) });
    renderApp(c, '/funnels');
    const app = within(await screen.findByTestId('create-funnel')).getByLabelText('App');
    await waitFor(() => expect([...app.options].map((o) => [o.value, o.textContent, o.disabled])).toEqual([
      ['', 'Chọn app', true], ['starlyn', 'Starlyn', false], ['tarot-web', 'Tarot Web', false],
    ]));
    expect(app.required).toBe(true);
    const button = within(form()).getByRole('button', { name: 'New funnel' });
    fireEvent.change(within(form()).getByPlaceholderText('slug-moi'), { target: { value: 'sun-sign' } });
    expect(button.disabled).toBe(true);
    fireEvent.change(app, { target: { value: 'tarot-web' } });
    expect(button.disabled).toBe(false);
    fireEvent.click(button);
    expect(await screen.findByRole('heading', { name: 'sun-sign' })).toBeTruthy();
    expect(c.createFunnel).toHaveBeenCalledWith({ slug: 'sun-sign', app_id: 'tarot-web' });
  });

  it('in an app: only its funnels, no App column or filter; the app is locked in the create form', async () => {
    const c = client(ME.editor, { createFunnel: vi.fn(async ({ slug }) => ({ slug })) });
    renderApp(c, '/apps/starlyn/funnels');
    await screen.findByRole('link', { name: 'moon-reading' });
    expect(c.listFunnels).toHaveBeenCalledWith({ app: 'starlyn' });
    expect(c.listFunnels).not.toHaveBeenCalledWith({});
    expect(screen.queryByRole('link', { name: 'old-quiz' })).toBeNull();
    expect(screen.getAllByRole('columnheader').map((th) => th.textContent)).toEqual(['Slug', 'Bản mới nhất', 'Live tại', 'Pixel', 'Cập nhật']);
    expect(screen.queryByLabelText('Lọc app')).toBeNull();
    expect(within(form()).queryByLabelText('App')).toBeNull();
    await waitFor(() => expect(within(form()).getByTestId('locked-app').textContent).toBe('App: Starlyn'));
    fireEvent.change(within(form()).getByPlaceholderText('slug-moi'), { target: { value: 'sun-sign' } });
    fireEvent.click(within(form()).getByRole('button', { name: 'New funnel' }));
    expect(await screen.findByRole('heading', { name: 'sun-sign' })).toBeTruthy();
    expect(c.createFunnel).toHaveBeenCalledWith({ slug: 'sun-sign', app_id: 'starlyn' });
  });

  it('?new=1 (Tạo funnel on the app overview) opens the page with the create form focused', async () => {
    renderApp(client(ME.editor), '/apps/starlyn/funnels?new=1');
    const slug = await within(await screen.findByTestId('create-funnel')).findByPlaceholderText('slug-moi');
    await waitFor(() => expect(document.activeElement).toBe(slug));
  });
});
```

`apps/admin/test/dashboard.test.jsx` và `apps/admin/test/funnels.test.jsx` (sửa, áp dụng đúng diff này). Dashboard: fixture `OVERVIEW` thêm `app_id` (`aivideo`, `tarot` → `starlyn`, `quiz-only` → `null`); test đầu thành "một dòng mỗi app" với `['Starlyn', '2', '1,290', '320', '45', '15', '1.2%', '194.01 USD2000 JPY', '13.67 USD']` và `['Chưa gán', '1', '400', '0', '0', '0', '0.0%', '—', '—']`; test sort chuyển sang dòng app (`tarot` đưa sang `tarot-web` để có hai app đổi chỗ, "Chưa gán" luôn cuối); test khoảng mới và request token đọc tên app (`starlyn`, vì không có `listApps`) thay cho slug; thêm unit test `groupByApp`. Funnels: test tạo funnel chọn app `starlyn` trong form trước khi bấm và kiểm `createFunnel({slug: 'new-one', app_id: 'starlyn'})`.

`apps/admin/test/dashboard.test.jsx`, `apps/admin/test/funnels.test.jsx` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/test/dashboard.test.jsx b/apps/admin/test/dashboard.test.jsx
index 5889f13..ad83b74 100644
--- a/apps/admin/test/dashboard.test.jsx
+++ b/apps/admin/test/dashboard.test.jsx
@@ -4,6 +4,7 @@ import { fireEvent, render, screen, waitFor, within } from '@testing-library/rea
 import { MemoryRouter } from 'react-router';
 import { ApiError } from '../src/api.js';
 import { App } from '../src/App.jsx';
+import { groupByApp } from '../src/pages/Dashboard.jsx';
 import { fakeClient, renderApp, ME } from './helpers.jsx';
 
 const NOW = Date.UTC(2026, 9, 8, 10, 37);
@@ -11,15 +12,18 @@ const RANGE = { from: '2026-10-01T10:00:00.000Z', to: '2026-10-08T11:00:00.000Z'
 const OVERVIEW = {
   range: RANGE,
   funnels: [
-    { slug: 'aivideo', sessions: 1200, leads: 300, checkouts: 40, paid: 12, revenue: [{ currency: 'JPY', amount_minor: 2000 }, { currency: 'USD', amount_minor: 16404 }], refunds: [{ currency: 'USD', amount_minor: 1367 }] },
-    { slug: 'tarot', sessions: 90, leads: 20, checkouts: 5, paid: 3, revenue: [{ currency: 'USD', amount_minor: 2997 }], refunds: [] },
-    { slug: 'quiz-only', sessions: 400, leads: 0, checkouts: 0, paid: 0, revenue: [], refunds: [] },
+    { slug: 'aivideo', app_id: 'starlyn', sessions: 1200, leads: 300, checkouts: 40, paid: 12, revenue: [{ currency: 'JPY', amount_minor: 2000 }, { currency: 'USD', amount_minor: 16404 }], refunds: [{ currency: 'USD', amount_minor: 1367 }] },
+    { slug: 'tarot', app_id: 'starlyn', sessions: 90, leads: 20, checkouts: 5, paid: 3, revenue: [{ currency: 'USD', amount_minor: 2997 }], refunds: [] },
+    { slug: 'quiz-only', app_id: null, sessions: 400, leads: 0, checkouts: 0, paid: 0, revenue: [], refunds: [] },
   ],
 };
 const cells = (row) => within(row).getAllByRole('cell').map((c) => c.textContent);
-const slugs = () => screen.getAllByTestId('overview-row').map((r) => cells(r)[0]);
+const names = () => screen.getAllByTestId('app-row').map((r) => cells(r)[0]);
+// The apps GET /v1/apps returns; an app the list does not know is shown by its id.
+const APPS = { apps: [{ id: 'starlyn', name: 'Starlyn', kind: 'app' }, { id: 'tarot-web', name: 'Tarot Web', kind: 'web' }] };
+const listApps = () => vi.fn(async () => APPS);
 
-// Spec admin-console-p3 §3 "Dashboard".
+// Spec admin-console-p3 §3 "Dashboard"; p4a §3: one row per app (and "Chưa gán"), the funnels moved to /apps/:id.
 describe('Dashboard', () => {
   beforeEach(() => {
     vi.useFakeTimers({ toFake: ['Date'] });
@@ -27,24 +31,26 @@ describe('Dashboard', () => {
   });
   afterEach(() => vi.useRealTimers());
 
-  it('is the home page and the first menu item; one row per funnel with rates, money per currency (JPY without decimals), refunds', async () => {
-    const client = fakeClient(ME.viewer, { getOverview: vi.fn(async () => OVERVIEW) });
+  it('is the home page and the first menu item; one row per app with rates, money per currency (USD first, JPY without decimals), refunds; "Chưa gán" last', async () => {
+    const client = fakeClient(ME.viewer, { getOverview: vi.fn(async () => OVERVIEW), listApps: listApps() });
     renderApp(client, '/');
-    const rows = await screen.findAllByTestId('overview-row');
+    await waitFor(() => expect(names()).toEqual(['Starlyn', 'Chưa gán']));
+    const rows = screen.getAllByTestId('app-row');
     expect(within(screen.getByRole('navigation')).getAllByRole('link')[0].textContent).toBe('Dashboard');
     expect(client.getOverview).toHaveBeenCalledWith({ from: '2026-10-01T10:37:00.000Z', to: '2026-10-08T10:37:00.000Z' });
     expect(rows.map(cells)).toEqual([
-      ['aivideo', '1,200', '300', '40', '12', '1.0%', '2000 JPY164.04 USD', '13.67 USD'],
-      ['quiz-only', '400', '0', '0', '0', '0.0%', '—', '—'],
-      ['tarot', '90', '20', '5', '3', '3.3%', '29.97 USD', '—'],
+      ['Starlyn', '2', '1,290', '320', '45', '15', '1.2%', '194.01 USD2000 JPY', '13.67 USD'],
+      ['Chưa gán', '1', '400', '0', '0', '0', '0.0%', '—', '—'],
     ]);
-    expect(within(rows[0]).getByRole('link', { name: 'aivideo' }).getAttribute('href')).toBe('/funnels/aivideo');
+    expect(within(rows[0]).getByRole('link', { name: 'Starlyn' }).getAttribute('href')).toBe('/apps/starlyn');
+    expect(within(rows[1]).getByRole('link', { name: 'Chưa gán' }).getAttribute('href')).toBe('/funnels?app=none');
+    expect(screen.queryByTestId('overview-row')).toBeNull();
     expect(screen.getByText('giờ UTC')).toBeTruthy();
   });
 
   it('a KPI row totals every funnel in the range: counts, rates per session, gross money per currency (USD first)', async () => {
     renderApp(fakeClient(ME.viewer, { getOverview: vi.fn(async () => OVERVIEW) }), '/');
-    await screen.findAllByTestId('overview-row');
+    await screen.findAllByTestId('app-row');
     const tiles = [...screen.getByTestId('kpis').querySelectorAll('.kpi')].map((t) => [...t.children].map((c) => c.textContent));
     expect(tiles).toEqual([
       ['Sessions', '1,690', '3 funnel'],
@@ -55,18 +61,24 @@ describe('Dashboard', () => {
     ]);
   });
 
-  it('sorts by any column, client-side: click again to flip', async () => {
-    const client = fakeClient(ME.viewer, { getOverview: vi.fn(async () => OVERVIEW) });
+  it('sorts the apps by any column, client-side: click again to flip; "Chưa gán" stays last', async () => {
+    // tarot in its own app here, so two app rows can trade places.
+    const overview = { range: RANGE, funnels: OVERVIEW.funnels.map((f) => (f.slug === 'tarot' ? { ...f, app_id: 'tarot-web' } : f)) };
+    const client = fakeClient(ME.viewer, { getOverview: vi.fn(async () => overview), listApps: listApps() });
     renderApp(client, '/');
-    await screen.findAllByTestId('overview-row');
+    await waitFor(() => expect(names()).toEqual(['Starlyn', 'Tarot Web', 'Chưa gán']));
     fireEvent.click(screen.getByRole('button', { name: 'Paid' }));
-    expect(slugs()).toEqual(['aivideo', 'tarot', 'quiz-only']);
+    expect(names()).toEqual(['Starlyn', 'Tarot Web', 'Chưa gán']);
     fireEvent.click(screen.getByRole('button', { name: 'Paid' }));
-    expect(slugs()).toEqual(['quiz-only', 'tarot', 'aivideo']);
+    expect(names()).toEqual(['Tarot Web', 'Starlyn', 'Chưa gán']);
     fireEvent.click(screen.getByRole('button', { name: 'Paid/session' }));
-    expect(slugs()).toEqual(['tarot', 'aivideo', 'quiz-only']);
-    fireEvent.click(screen.getByRole('button', { name: 'Funnel' }));
-    expect(slugs()).toEqual(['aivideo', 'quiz-only', 'tarot']);
+    expect(names()).toEqual(['Tarot Web', 'Starlyn', 'Chưa gán']);
+    fireEvent.click(screen.getByRole('button', { name: 'Paid/session' }));
+    expect(names()).toEqual(['Starlyn', 'Tarot Web', 'Chưa gán']);
+    fireEvent.click(screen.getByRole('button', { name: 'App' }));
+    expect(names()).toEqual(['Starlyn', 'Tarot Web', 'Chưa gán']);
+    fireEvent.click(screen.getByRole('button', { name: 'App' }));
+    expect(names()).toEqual(['Tarot Web', 'Starlyn', 'Chưa gán']);
     expect(client.getOverview).toHaveBeenCalledTimes(1);
   });
 
@@ -78,14 +90,14 @@ describe('Dashboard', () => {
     expect(screen.getByTestId('loading')).toBeTruthy();
     expect(screen.getByRole('button', { name: '30 d' }).disabled).toBe(true);
     pending[0](OVERVIEW);
-    await screen.findAllByTestId('overview-row');
+    await screen.findAllByTestId('app-row');
     fireEvent.click(screen.getByRole('button', { name: '30 d' }));
     expect(client.getOverview).toHaveBeenLastCalledWith({ from: '2026-09-08T10:37:00.000Z', to: '2026-10-08T10:37:00.000Z' });
     expect(screen.getByRole('button', { name: '7 d' }).disabled).toBe(true);
     fireEvent.click(screen.getByRole('button', { name: '30 d' })); // locked: no third request
     expect(client.getOverview).toHaveBeenCalledTimes(2);
     pending[1]({ range: RANGE, funnels: [OVERVIEW.funnels[1]] });
-    await waitFor(() => expect(slugs()).toEqual(['tarot']));
+    await waitFor(() => expect(names()).toEqual(['starlyn']));
     expect(screen.getByRole('button', { name: '30 d' }).getAttribute('aria-pressed')).toBe('true');
   });
 
@@ -101,10 +113,10 @@ describe('Dashboard', () => {
     );
     await waitFor(() => expect(pending).toHaveLength(2));
     pending[1]({ range: RANGE, funnels: [OVERVIEW.funnels[1]] });
-    await waitFor(() => expect(slugs()).toEqual(['tarot']));
+    await waitFor(() => expect(names()).toEqual(['starlyn']));
     pending[0](OVERVIEW);
     await new Promise((r) => setTimeout(r, 20));
-    expect(slugs()).toEqual(['tarot']);
+    expect(names()).toEqual(['starlyn']);
   });
 
   it.each([
@@ -124,3 +136,25 @@ describe('Dashboard', () => {
     expect(await screen.findByText('Chưa có sự kiện trong khoảng này.')).toBeTruthy();
   });
 });
+
+// Spec admin-console-p4a §3 "Dashboard toàn cục": the overview's rows grouped by app on the client.
+describe('groupByApp', () => {
+  it('sums each app\'s funnels (money per currency, USD first, then A–Z); the unassigned group comes last', () => {
+    const row = (slug, app_id, n, revenue = [], refunds = []) => ({ slug, app_id, sessions: n, leads: n, checkouts: n, paid: n, revenue, refunds });
+    expect(groupByApp([
+      row('old', null, 5, [{ currency: 'EUR', amount_minor: 100 }]),
+      row('a', 'starlyn', 10, [{ currency: 'JPY', amount_minor: 2000 }, { currency: 'EUR', amount_minor: 50 }], [{ currency: 'JPY', amount_minor: 500 }]),
+      row('b', 'chatchi', 1),
+      row('c', 'starlyn', 20, [{ currency: 'USD', amount_minor: 999 }, { currency: 'EUR', amount_minor: 1 }], [{ currency: 'USD', amount_minor: 100 }]),
+    ])).toEqual([
+      {
+        app_id: 'starlyn', funnels: 2, sessions: 30, leads: 30, checkouts: 30, paid: 30,
+        revenue: [{ currency: 'USD', amount_minor: 999 }, { currency: 'EUR', amount_minor: 51 }, { currency: 'JPY', amount_minor: 2000 }],
+        refunds: [{ currency: 'USD', amount_minor: 100 }, { currency: 'JPY', amount_minor: 500 }],
+      },
+      { app_id: 'chatchi', funnels: 1, sessions: 1, leads: 1, checkouts: 1, paid: 1, revenue: [], refunds: [] },
+      { app_id: null, funnels: 1, sessions: 5, leads: 5, checkouts: 5, paid: 5, revenue: [{ currency: 'EUR', amount_minor: 100 }], refunds: [] },
+    ]);
+    expect(groupByApp([])).toEqual([]);
+  });
+});
diff --git a/apps/admin/test/funnels.test.jsx b/apps/admin/test/funnels.test.jsx
index 5709b97..896dc70 100644
--- a/apps/admin/test/funnels.test.jsx
+++ b/apps/admin/test/funnels.test.jsx
@@ -41,9 +41,14 @@ describe('Funnels list', () => {
         return { slug };
       }),
       getFunnel: vi.fn(async (slug) => ({ ...DETAIL, slug, versions: [], live: [] })),
+      listApps: vi.fn(async () => ({ apps: [{ id: 'starlyn', name: 'Starlyn', kind: 'app' }] })),
     });
     renderApp(client, '/funnels');
     const input = await screen.findByPlaceholderText('slug-moi');
+    // Spec admin-console-p4a §3: a new funnel needs an app (the form's App picker; the sidebar switcher is App too).
+    const app = within(screen.getByTestId('create-funnel')).getByLabelText('App');
+    await waitFor(() => expect(app.options).toHaveLength(2));
+    fireEvent.change(app, { target: { value: 'starlyn' } });
     fireEvent.change(input, { target: { value: 'aivideo' } });
     fireEvent.click(screen.getByRole('button', { name: 'New funnel' }));
     expect((await screen.findByRole('alert')).textContent).toBe('Lỗi 409 funnel_exists');
@@ -51,6 +56,7 @@ describe('Funnels list', () => {
     fireEvent.click(screen.getByRole('button', { name: 'New funnel' }));
     expect(await screen.findByRole('heading', { name: 'new-one' })).toBeTruthy();
     expect(client.getFunnel).toHaveBeenCalledWith('new-one');
+    expect(client.createFunnel).toHaveBeenLastCalledWith({ slug: 'new-one', app_id: 'starlyn' });
     // Final review M1: it opens on Tổng quan (the upload screen), not Số liệu.
     expect(screen.getByRole('tab', { name: 'Tổng quan' }).getAttribute('aria-selected')).toBe('true');
     expect(screen.getByRole('heading', { name: 'Versions' })).toBeTruthy();
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/admin -- test/dashboard.test.jsx test/funnels.test.jsx test/funnels-app.test.jsx 2>&1 | grep -E "×|Test Files|Tests  "
```

Expected: `Test Files  3 failed (3)`, `Tests  12 failed | 12 passed (24)`: 5 test Dashboard fail vì không có `[data-testid="app-row"]` (trang vẫn là bảng per-funnel), `groupByApp` fail vì `(0 , groupByApp) is not a function`; 5 test `funnels-app` fail vì không có `[data-testid="create-funnel"]`, `listFunnels` được gọi không kèm `{app}` (`expected "spy" to be called with arguments: [ {} ]` / `[ { app: 'none' } ]`) và `/apps/starlyn/funnels` chưa có route (không thấy link `moon-reading`); test "New funnel (editor)" trong `funnels.test.jsx` fail vì chưa có form `create-funnel`. Các test 503/404/lỗi khác/rỗng của Dashboard và phần Funnel detail vẫn pass.

- [ ] **Step 3: Implement**

`apps/admin/src/components/OverviewTable.jsx`, `apps/admin/src/pages/Dashboard.jsx`, `apps/admin/src/pages/Funnels.jsx`, `apps/admin/src/App.jsx` (sửa, áp dụng đúng diff này):

`apps/admin/src/components/OverviewTable.jsx`, `apps/admin/src/pages/Dashboard.jsx`, `apps/admin/src/pages/Funnels.jsx`, `apps/admin/src/App.jsx` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/src/App.jsx b/apps/admin/src/App.jsx
index 8f4fec4..2dfab6b 100644
--- a/apps/admin/src/App.jsx
+++ b/apps/admin/src/App.jsx
@@ -29,9 +29,10 @@ export function App({ client }) {
           <Route path="/apps" element={<RequireGrant need="apps:read"><Apps /></RequireGrant>} />
           {/* In an app (spec admin-console-p4a §3): Tổng quan is open to every role (GET /v1/apps/:id/summary is viewer). */}
           <Route path="/apps/:id" element={<AppOverview />} />
+          <Route path="/apps/:id/funnels" element={<Funnels />} />
           <Route path="/apps/:id/settings" element={<RequireGrant need="apps:read"><AppSettings /></RequireGrant>} />
           <Route path="/apps/:id/webhooks" element={<RequireGrant need="apps:read"><AppWebhooks /></RequireGrant>} />
-          {/* /apps/:id/funnels, /plans, /customers, /domains and /audit come with the in-app pages (p4a §3). */}
+          {/* /apps/:id/plans, /customers, /domains and /audit come with the in-app pages (p4a §3). */}
           <Route path="/customers" element={<RequireGrant need="support"><Customers /></RequireGrant>} />
           <Route path="/customers/:ref" element={<RequireGrant need="support"><CustomerDetail /></RequireGrant>} />
           <Route path="/domains" element={<Domains />} />
diff --git a/apps/admin/src/components/OverviewTable.jsx b/apps/admin/src/components/OverviewTable.jsx
index 540bbac..09c0812 100644
--- a/apps/admin/src/components/OverviewTable.jsx
+++ b/apps/admin/src/components/OverviewTable.jsx
@@ -3,33 +3,40 @@ import { Link } from 'react-router';
 import { fmtMoney, fmtNum, fmtPct } from '../format.js';
 
 // The KPI row and the per-funnel table of the Dashboard (spec admin-console-p3 §3), shared with the app's
-// Tổng quan (spec admin-console-p4a §3), which shows the same thing for one app's funnels.
+// Tổng quan (spec admin-console-p4a §3), which shows the same thing for one app's funnels. The Dashboard's
+// per-app table (p4a §3) reuses the money sums, the count sorts and the sortable header.
 
 const rate = (f) => (f.sessions ? f.paid / f.sessions : 0);
-// Sortable columns (money columns are per currency: not sortable).
-const SORTS = {
-  slug: (a, b) => (a.slug < b.slug ? -1 : 1),
+// Sortable count columns (money columns are per currency: not sortable).
+export const COUNT_SORTS = {
   sessions: (a, b) => a.sessions - b.sessions,
   leads: (a, b) => a.leads - b.leads,
   checkouts: (a, b) => a.checkouts - b.checkouts,
   paid: (a, b) => a.paid - b.paid,
   rate: (a, b) => rate(a) - rate(b),
 };
-const HEADERS = [['slug', 'Funnel'], ['sessions', 'Sessions'], ['leads', 'Leads'], ['checkouts', 'Checkouts'], ['paid', 'Paid'], ['rate', 'Paid/session']];
-const Money = ({ items }) => (items.length ? items.map((m) => <div key={m.currency}>{fmtMoney(m.amount_minor, m.currency)}</div>) : '—');
+const SORTS = { slug: (a, b) => (a.slug < b.slug ? -1 : 1), ...COUNT_SORTS };
+export const COUNT_HEADERS = [['sessions', 'Sessions'], ['leads', 'Leads'], ['checkouts', 'Checkouts'], ['paid', 'Paid'], ['rate', 'Paid/session']];
+const HEADERS = [['slug', 'Funnel'], ...COUNT_HEADERS];
+export const Money = ({ items }) => (items.length ? items.map((m) => <div key={m.currency}>{fmtMoney(m.amount_minor, m.currency)}</div>) : '—');
 
-// Totals over every funnel in the range, for the KPI row; money per currency, USD first (the headline), then A–Z.
-export function totals(funnels) {
-  const sum = (key) => funnels.reduce((n, f) => n + f[key], 0);
+// Money of several rows summed per currency: USD first (the headline), then A–Z.
+export function sumMoney(rows, key) {
   const money = {};
-  for (const f of funnels) for (const m of f.revenue) money[m.currency] = (money[m.currency] ?? 0) + m.amount_minor;
+  for (const r of rows) for (const m of r[key]) money[m.currency] = (money[m.currency] ?? 0) + m.amount_minor;
   const order = (a, b) => (a === 'USD' ? -1 : b === 'USD' ? 1 : a < b ? -1 : 1);
+  return Object.keys(money).sort(order).map((currency) => ({ currency, amount_minor: money[currency] }));
+}
+
+// Totals over every funnel in the range, for the KPI row; money per currency, USD first, then A–Z.
+export function totals(funnels) {
+  const sum = (key) => funnels.reduce((n, f) => n + f[key], 0);
   return {
     sessions: sum('sessions'),
     leads: sum('leads'),
     checkouts: sum('checkouts'),
     paid: sum('paid'),
-    revenue: Object.keys(money).sort(order).map((currency) => ({ currency, amount_minor: money[currency] })),
+    revenue: sumMoney(funnels, 'revenue'),
   };
 }
 
@@ -47,28 +54,36 @@ export function Kpis({ funnels }) {
   );
 }
 
-// The overview's funnels sorted by the chosen column (sessions, most first, to start); clicking the sorted
-// column again flips it, a new column starts descending (A–Z for the slug).
-export function useOverviewSort(funnels) {
+// Rows sorted by the chosen column (sessions, most first, to start); clicking the sorted column again flips
+// it, a new column starts descending (A–Z for the text column `textKey`).
+export function useSorted(items, sorts, textKey) {
   const [sort, setSort] = useState({ key: 'sessions', desc: true });
   const rows = useMemo(() => {
-    const out = [...(funnels ?? [])].sort(SORTS[sort.key]);
+    const out = [...(items ?? [])].sort(sorts[sort.key]);
     return sort.desc ? out.reverse() : out;
-  }, [funnels, sort]);
-  const onSort = (key) => setSort((s) => (s.key === key ? { key, desc: !s.desc } : { key, desc: key !== 'slug' }));
+  }, [items, sorts, sort]);
+  const onSort = (key) => setSort((s) => (s.key === key ? { key, desc: !s.desc } : { key, desc: key !== textKey }));
   return { rows, sort, onSort };
 }
 
+// The overview's funnels sorted by the chosen column.
+export const useOverviewSort = (funnels) => useSorted(funnels, SORTS, 'slug');
+
+// A header cell whose label sorts the table (aria-sort shows the current order).
+export function SortTh({ id, label, sort, onSort, text = false }) {
+  return (
+    <th className={text ? undefined : 'num'} aria-sort={sort.key === id ? (sort.desc ? 'descending' : 'ascending') : undefined}>
+      <button type="button" className="link" onClick={() => onSort(id)}>{label}</button>
+    </th>
+  );
+}
+
 export function OverviewTable({ rows, sort, onSort }) {
   return (
     <table>
       <thead>
         <tr>
-          {HEADERS.map(([key, label]) => (
-            <th key={key} className={key === 'slug' ? undefined : 'num'} aria-sort={sort.key === key ? (sort.desc ? 'descending' : 'ascending') : undefined}>
-              <button type="button" className="link" onClick={() => onSort(key)}>{label}</button>
-            </th>
-          ))}
+          {HEADERS.map(([key, label]) => <SortTh key={key} id={key} label={label} sort={sort} onSort={onSort} text={key === 'slug'} />)}
           <th className="num">Doanh thu</th>
           <th className="num">Refund</th>
         </tr>
diff --git a/apps/admin/src/pages/Dashboard.jsx b/apps/admin/src/pages/Dashboard.jsx
index 35b831a..6e52206 100644
--- a/apps/admin/src/pages/Dashboard.jsx
+++ b/apps/admin/src/pages/Dashboard.jsx
@@ -1,12 +1,70 @@
-import { useEffect, useRef, useState } from 'react';
+import { useEffect, useMemo, useRef, useState } from 'react';
+import { Link } from 'react-router';
+import { useAppContext } from '../app-context.jsx';
 import { useAuth } from '../auth.jsx';
 import { AnalyticsError, Loading } from '../components/AnalyticsState.jsx';
-import { Kpis, OverviewTable, useOverviewSort } from '../components/OverviewTable.jsx';
+import { COUNT_HEADERS, COUNT_SORTS, Kpis, Money, SortTh, sumMoney, totals, useSorted } from '../components/OverviewTable.jsx';
 import { RangePicker, rangeFor } from '../components/RangePicker.jsx';
+import { fmtNum, fmtPct } from '../format.js';
 
-// Dashboard (spec admin-console-p3 §3): one row per funnel with events or a checkout in the range.
+// The overview's funnels grouped by app on the client (spec admin-console-p4a §3 "Dashboard toàn cục"): one
+// row per app in the order the apps first appear, then the unassigned funnels (app_id null) last. Money is
+// summed per currency, USD first, like the KPI row.
+export function groupByApp(funnels) {
+  const groups = new Map();
+  for (const f of funnels) {
+    if (!groups.has(f.app_id)) groups.set(f.app_id, []);
+    groups.get(f.app_id).push(f);
+  }
+  const keys = [...groups.keys()].filter((k) => k !== null);
+  if (groups.has(null)) keys.push(null);
+  return keys.map((app_id) => {
+    const rows = groups.get(app_id);
+    return { app_id, funnels: rows.length, ...totals(rows), refunds: sumMoney(rows, 'refunds') };
+  });
+}
+
+const SORTS = { name: (a, b) => (a.name < b.name ? -1 : 1), funnels: (a, b) => a.funnels - b.funnels, ...COUNT_SORTS };
+const HEADERS = [['funnels', 'Funnels'], ...COUNT_HEADERS];
+
+function AppTable({ groups }) {
+  const { rows, sort, onSort } = useSorted(groups.apps, SORTS, 'name');
+  // "Chưa gán" is not an app: it stays the last row whatever the order.
+  const all = groups.unassigned ? [...rows, groups.unassigned] : rows;
+  return (
+    <table>
+      <thead>
+        <tr>
+          <SortTh id="name" label="App" sort={sort} onSort={onSort} text />
+          {HEADERS.map(([key, label]) => <SortTh key={key} id={key} label={label} sort={sort} onSort={onSort} />)}
+          <th className="num">Doanh thu</th>
+          <th className="num">Refund</th>
+        </tr>
+      </thead>
+      <tbody>
+        {all.map((g) => (
+          <tr key={g.app_id ?? ''} data-testid="app-row">
+            <td><Link to={g.app_id === null ? '/funnels?app=none' : `/apps/${encodeURIComponent(g.app_id)}`}>{g.name}</Link></td>
+            <td className="num">{fmtNum(g.funnels)}</td>
+            <td className="num">{fmtNum(g.sessions)}</td>
+            <td className="num">{fmtNum(g.leads)}</td>
+            <td className="num">{fmtNum(g.checkouts)}</td>
+            <td className="num">{fmtNum(g.paid)}</td>
+            <td className="num">{fmtPct(g.paid, g.sessions)}</td>
+            <td className="num"><Money items={g.revenue} /></td>
+            <td className="num"><Money items={g.refunds} /></td>
+          </tr>
+        ))}
+      </tbody>
+    </table>
+  );
+}
+
+// Dashboard (spec admin-console-p3 §3; p4a §3): the KPI row over every funnel with events or a checkout in the
+// range, and one row per app. The per-funnel table moved to the app's Tổng quan (/apps/:id).
 export function Dashboard() {
   const { client } = useAuth();
+  const { apps } = useAppContext();
   const [days, setDays] = useState(7);
   const [data, setData] = useState(null);
   const [error, setError] = useState(null);
@@ -24,7 +82,15 @@ export function Dashboard() {
     );
   }, [client, days]);
 
-  const { rows, sort, onSort } = useOverviewSort(data?.funnels);
+  // App names from the console's app list; an app the list does not know (yet) is shown by its id.
+  const groups = useMemo(() => {
+    const named = groupByApp(data?.funnels ?? []).map((g) => ({
+      ...g,
+      name: g.app_id === null ? 'Chưa gán' : (apps.find((a) => a.id === g.app_id)?.name ?? g.app_id),
+    }));
+    return { apps: named.filter((g) => g.app_id !== null), unassigned: named.find((g) => g.app_id === null) ?? null };
+  }, [data, apps]);
+  const funnels = data?.funnels ?? [];
 
   return (
     <section>
@@ -32,11 +98,11 @@ export function Dashboard() {
       <RangePicker days={days} onChange={setDays} disabled={loading} />
       <AnalyticsError error={error} />
       {loading && <Loading />}
-      {!loading && data && !rows.length && <p className="muted">Chưa có sự kiện trong khoảng này.</p>}
-      {!loading && rows.length > 0 && (
+      {!loading && data && !funnels.length && <p className="muted">Chưa có sự kiện trong khoảng này.</p>}
+      {!loading && funnels.length > 0 && (
         <>
-          <Kpis funnels={rows} />
-          <OverviewTable rows={rows} sort={sort} onSort={onSort} />
+          <Kpis funnels={funnels} />
+          <AppTable groups={groups} />
         </>
       )}
     </section>
diff --git a/apps/admin/src/pages/Funnels.jsx b/apps/admin/src/pages/Funnels.jsx
index 18e52cb..1862ab1 100644
--- a/apps/admin/src/pages/Funnels.jsx
+++ b/apps/admin/src/pages/Funnels.jsx
@@ -1,28 +1,50 @@
-import { useEffect, useState } from 'react';
-import { Link, useNavigate } from 'react-router';
+import { useEffect, useRef, useState } from 'react';
+import { Link, useNavigate, useSearchParams } from 'react-router';
+import { useAppContext } from '../app-context.jsx';
 import { useAuth } from '../auth.jsx';
 import { ErrorNote } from '../components/ErrorNote.jsx';
 import { RoleButton } from '../components/RoleButton.jsx';
 import { fmtLive, fmtTime } from '../format.js';
 
+// Funnels (spec admin-console-p4a §3): one component for both places. Global (/funnels): an App column and a
+// filter bound to ?app= (`none` = Chưa gán), and the create form needs an app picked. In an app
+// (/apps/:id/funnels): only that app's funnels, the app fixed in the create form; ?new=1 (Tạo funnel on the
+// app's Tổng quan) focuses the form.
 export function Funnels() {
   const { client } = useAuth();
+  const { appId, apps } = useAppContext();
   const navigate = useNavigate();
+  const [params, setParams] = useSearchParams();
   const [funnels, setFunnels] = useState(null);
   const [error, setError] = useState(null);
   const [query, setQuery] = useState('');
   const [slug, setSlug] = useState('');
+  const [pick, setPick] = useState('');
+  const slugInput = useRef(null);
+  const filter = appId ?? params.get('app') ?? '';
+  const newApp = appId ?? pick;
+  const wantsNew = params.get('new') === '1';
+  const nameOf = (id) => apps.find((a) => a.id === id)?.name ?? id;
 
   useEffect(() => {
-    client.listFunnels().then((r) => setFunnels(r.funnels), setError);
-  }, [client]);
+    let live = true; // a newer filter's answer wins over an older one still in flight
+    setFunnels(null);
+    setError(null);
+    client.listFunnels(filter ? { app: filter } : {}).then((r) => live && setFunnels(r.funnels), (err) => live && setError(err));
+    return () => {
+      live = false;
+    };
+  }, [client, filter]);
+
+  useEffect(() => {
+    if (wantsNew) slugInput.current?.focus();
+  }, [wantsNew]);
 
   const create = async () => {
     setError(null);
     const s = slug.trim();
     try {
-      // Spec admin-console-p4a §3 "Funnels": the server now wants app_id too; the app picker comes with that page.
-      await client.createFunnel({ slug: s });
+      await client.createFunnel({ slug: s, app_id: newApp });
       navigate(`/funnels/${s}?tab=main`); // Tổng quan: the upload screen (final review M1)
     } catch (err) {
       setError(err);
@@ -35,9 +57,27 @@ export function Funnels() {
       <h1>Funnels</h1>
       <div className="row">
         <input placeholder="Tìm slug" value={query} onChange={(e) => setQuery(e.target.value)} />
-        <span className="muted">·</span>
-        <input placeholder="slug-moi" value={slug} onChange={(e) => setSlug(e.target.value)} />
-        <RoleButton need="editor" className="primary" onClick={create} disabled={!slug.trim()}>New funnel</RoleButton>
+        {!appId && (
+          <select aria-label="Lọc app" value={filter} onChange={(e) => setParams(e.target.value ? { app: e.target.value } : {})}>
+            <option value="">Tất cả</option>
+            <option value="none">Chưa gán</option>
+            {apps.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
+            {filter && filter !== 'none' && !apps.some((a) => a.id === filter) && <option value={filter}>{filter}</option>}
+          </select>
+        )}
+      </div>
+      <div className="row" data-testid="create-funnel">
+        <input ref={slugInput} placeholder="slug-moi" value={slug} onChange={(e) => setSlug(e.target.value)} />
+        {appId ? (
+          <span className="badge kind" data-testid="locked-app">App: {nameOf(appId)}</span>
+        ) : (
+          // Spec admin-console-p4a §2: POST /v1/funnels needs app_id; the empty choice is only a prompt.
+          <select aria-label="App" required value={pick} onChange={(e) => setPick(e.target.value)}>
+            <option value="" disabled>Chọn app</option>
+            {apps.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
+          </select>
+        )}
+        <RoleButton need="editor" className="primary" onClick={create} disabled={!slug.trim() || !newApp}>New funnel</RoleButton>
       </div>
       <ErrorNote error={error} />
       {funnels === null ? (
@@ -45,7 +85,7 @@ export function Funnels() {
       ) : (
         <table>
           <thead>
-            <tr><th>Slug</th><th>Bản mới nhất</th><th>Live tại</th><th>Pixel</th><th>App</th><th>Cập nhật</th></tr>
+            <tr><th>Slug</th><th>Bản mới nhất</th><th>Live tại</th><th>Pixel</th>{!appId && <th>App</th>}<th>Cập nhật</th></tr>
           </thead>
           <tbody>
             {shown.map((f) => (
@@ -54,7 +94,7 @@ export function Funnels() {
                 <td>{f.latest_v ? `v${f.latest_v}` : '—'}</td>
                 <td>{fmtLive(f.live)}</td>
                 <td>{f.pixel_id ?? '—'}</td>
-                <td>{f.app_id ?? '—'}</td>
+                {!appId && <td>{f.app_id ? <Link to={`/apps/${encodeURIComponent(f.app_id)}`}>{nameOf(f.app_id)}</Link> : '—'}</td>}
                 <td>{fmtTime(f.updated_at)}</td>
               </tr>
             ))}
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/admin -- test/dashboard.test.jsx test/funnels.test.jsx test/funnels-app.test.jsx 2>&1 | grep -E "Test Files|Tests  "
npm test -w @ikf/admin 2>&1 | grep -E "Test Files|Tests  "
npm run build -w @ikf/admin 2>&1 | tail -1
```

Expected: `Test Files  3 passed (3)`, `Tests  24 passed (24)`; toàn bộ admin `Test Files  20 passed (20)`, `Tests  171 passed (171)`; build `✓ built in …`.

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/App.jsx apps/admin/src/components/OverviewTable.jsx apps/admin/src/pages/Dashboard.jsx apps/admin/src/pages/Funnels.jsx apps/admin/test/dashboard.test.jsx apps/admin/test/funnels.test.jsx apps/admin/test/funnels-app.test.jsx
git commit -m "feat(admin): dashboard per app with an unassigned row; funnels filtered by app, creation requires an app; funnels in app
```

---

---

### Task 10: SPA — Domains (cột App, trong app gán/bỏ gán), PublishDialog lọc domain theo app, Funnel detail breadcrumb + "Chưa gán app"

**Files:**
- Create: `apps/admin/test/domains.test.jsx`, `apps/admin/test/funnel-detail-app.test.jsx`
- Modify: `apps/admin/src/pages/Domains.jsx`, `apps/admin/src/components/PublishDialog.jsx`, `apps/admin/src/components/FunnelSettings.jsx`, `apps/admin/src/pages/FunnelDetail.jsx`, `apps/admin/src/App.jsx`, `apps/admin/src/styles.css`
- Test: `apps/admin/test/domains.test.jsx` (mới), `apps/admin/test/funnel-detail-app.test.jsx` (mới), `apps/admin/test/publish.test.jsx` (sửa), `apps/admin/test/funnels.test.jsx` (sửa)

**Interfaces:**
- Consumes: `useAppContext()` → `{appId, apps}` (Task 8); client `listDomains({app})`, `setDomain(host, {app_id})`, `publish(host, body)`; `ApiError.detail` (`domain_has_foreign_routes` → `{routes: [{prefix, slug, app_id}]}`, `domain_app_mismatch` → `{host_app, funnel_app}`); `appsClient`/`STARLYN`/`TAROT` từ `test/apps-fixtures.js`.
- Produces: route `/apps/:id/domains` (viewer) → `Domains` với hai nhóm `data-testid="app-own"` ("Của app") và `data-testid="app-shared"` ("Dùng chung"); dòng domain vẫn `data-testid="domain"`; `/domains` có cột App (sau cột Routes) và `<select aria-label="Gán app cho <host>">` cho admin; lỗi 409 route chặn: `data-testid="foreign-route"` (`prefix → slug (app|chưa gán)`); PublishDialog gọi `listDomains({app: funnel.app_id ?? 'none'})`, ghi chú `data-testid="shared-only"`; FunnelDetail có `<nav aria-label="Breadcrumb" className="breadcrumb">` và thẻ `data-testid="unassigned"` (class `card warn`); FunnelSettings: select app không còn lựa chọn trống, "Lưu app" disabled khi chưa chọn, không bao giờ gửi `app_id: null`; CSS `.breadcrumb`.

- [ ] **Step 1: Viết test fail**

`apps/admin/test/domains.test.jsx` (mới):

`apps/admin/test/domains.test.jsx` (mới):

```jsx
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { ApiError } from '../src/api.js';
import { appsClient } from './apps-fixtures.js';
import { ME, renderApp } from './helpers.jsx';

// Spec admin-console-p4a §3 "Domains trong app" and the /domains App column.
const row = (host, app_id, routes = []) => ({ host, status: 'active', rev: 1, kv_synced_rev: 1, app_id, routes });
const ALL = { domains: [row('x.com', null), row('s.starlyn.app', 'starlyn', [{ prefix: '/', slug: 'moon', v: 2 }]), row('t.tarot.web', 'tarot-web')] };
const FOREIGN = new ApiError(409, { error: 'domain_has_foreign_routes', detail: { routes: [{ prefix: '/promo', slug: 'tarot', app_id: 'tarot-web' }, { prefix: '/old', slug: 'legacy', app_id: null }] } });
const cell = (r, i) => r.querySelectorAll('td')[i].textContent;

describe('Domains (global)', () => {
  it('an App column: the app as a link, or (dùng chung)', async () => {
    renderApp(appsClient(ME.viewer, { listDomains: vi.fn(async () => ALL) }), '/domains');
    const rows = await screen.findAllByTestId('domain');
    expect(rows.map((r) => cell(r, 4))).toEqual(['(dùng chung)', 'Starlyn', 'Tarot Web']);
    expect(within(rows[1]).getByRole('link', { name: 'Starlyn' }).getAttribute('href')).toBe('/apps/starlyn');
  });

  it('admin assigns an app with the per-row select, then reloads; Dùng chung sends app_id null', async () => {
    const client = appsClient(ME.admin, {
      listDomains: vi.fn(async () => ALL),
      setDomain: vi.fn(async (host, b) => ({ host, status: 'active', app_id: b.app_id })),
    });
    renderApp(client, '/domains');
    const select = await screen.findByLabelText('Gán app cho x.com');
    await waitFor(() => expect([...select.options].map((o) => o.textContent)).toEqual(['Dùng chung', 'Starlyn', 'Tarot Web']));
    expect(select.value).toBe('');
    fireEvent.change(select, { target: { value: 'starlyn' } });
    await waitFor(() => expect(client.setDomain).toHaveBeenCalledWith('x.com', { app_id: 'starlyn' }));
    expect(await screen.findByText('Đã gán x.com vào Starlyn.')).toBeTruthy();
    expect(client.listDomains).toHaveBeenCalledTimes(2);
    fireEvent.change(screen.getByLabelText('Gán app cho s.starlyn.app'), { target: { value: '' } });
    await waitFor(() => expect(client.setDomain).toHaveBeenLastCalledWith('s.starlyn.app', { app_id: null }));
    expect(await screen.findByText('s.starlyn.app: đã chuyển về dùng chung.')).toBeTruthy();
  });

  it('409 domain_has_foreign_routes lists the routes that block it', async () => {
    renderApp(appsClient(ME.admin, { listDomains: vi.fn(async () => ALL), setDomain: vi.fn(async () => { throw FOREIGN; }) }), '/domains');
    fireEvent.change(await screen.findByLabelText('Gán app cho x.com'), { target: { value: 'starlyn' } });
    expect((await screen.findByRole('alert')).textContent).toBe('Lỗi 409 domain_has_foreign_routes');
    expect(screen.getAllByTestId('foreign-route').map((li) => li.textContent)).toEqual(['/promo → tarot (Tarot Web)', '/old → legacy (chưa gán)']);
  });

  it('other roles see no assign control', async () => {
    renderApp(appsClient(ME.editor, { listDomains: vi.fn(async () => ALL) }), '/domains');
    await screen.findAllByTestId('domain');
    expect(screen.queryByLabelText('Gán app cho x.com')).toBeNull();
  });
});

describe('Domains in an app', () => {
  const inApp = { domains: [row('x.com', null), row('s.starlyn.app', 'starlyn')] };

  it('two groups from listDomains({app}); Gán vào app on shared rows, Bỏ gán on the app rows', async () => {
    const client = appsClient(ME.admin, {
      listDomains: vi.fn(async () => inApp),
      setDomain: vi.fn(async (host, b) => ({ host, status: 'active', app_id: b.app_id })),
    });
    renderApp(client, '/apps/starlyn/domains');
    const own = await screen.findByTestId('app-own');
    const shared = screen.getByTestId('app-shared');
    expect(client.listDomains).toHaveBeenCalledWith({ app: 'starlyn' });
    expect(within(own).getByRole('heading').textContent).toBe('Của app');
    expect(within(shared).getByRole('heading').textContent).toBe('Dùng chung');
    expect(within(own).getAllByTestId('domain').map((r) => cell(r, 0))).toEqual(['s.starlyn.app']);
    expect(within(shared).getAllByTestId('domain').map((r) => cell(r, 0))).toEqual(['x.com']);
    expect(within(own).queryByRole('button', { name: 'Gán vào app' })).toBeNull();
    expect(within(shared).queryByRole('button', { name: 'Bỏ gán' })).toBeNull();
    fireEvent.click(within(shared).getByRole('button', { name: 'Gán vào app' }));
    await waitFor(() => expect(client.setDomain).toHaveBeenCalledWith('x.com', { app_id: 'starlyn' }));
    fireEvent.click(within(own).getByRole('button', { name: 'Bỏ gán' }));
    await waitFor(() => expect(client.setDomain).toHaveBeenLastCalledWith('s.starlyn.app', { app_id: null }));
  });

  it('an empty group says so; a 409 lists the blocking routes', async () => {
    renderApp(appsClient(ME.admin, { listDomains: vi.fn(async () => ({ domains: [row('x.com', null)] })), setDomain: vi.fn(async () => { throw FOREIGN; }) }), '/apps/starlyn/domains');
    expect((await screen.findByTestId('app-own')).textContent).toContain('App chưa có domain riêng.');
    fireEvent.click(within(screen.getByTestId('app-shared')).getByRole('button', { name: 'Gán vào app' }));
    expect((await screen.findByRole('alert')).textContent).toBe('Lỗi 409 domain_has_foreign_routes');
    expect(screen.getAllByTestId('foreign-route').map((li) => li.textContent)).toEqual(['/promo → tarot (Tarot Web)', '/old → legacy (chưa gán)']);
  });

  it('a viewer sees both groups and no buttons', async () => {
    renderApp(appsClient(ME.viewer, { listDomains: vi.fn(async () => inApp) }), '/apps/starlyn/domains');
    await screen.findByTestId('app-own');
    expect(screen.getAllByTestId('domain')).toHaveLength(2);
    expect(screen.queryByRole('button', { name: 'Gán vào app' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Bỏ gán' })).toBeNull();
  });
});
```

`apps/admin/test/funnel-detail-app.test.jsx` (mới):

`apps/admin/test/funnel-detail-app.test.jsx` (mới):

```jsx
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { appsClient } from './apps-fixtures.js';
import { ME, renderApp } from './helpers.jsx';

// Spec admin-console-p4a §3 "Funnel detail": breadcrumb App › slug, the "Chưa gán app" card, and an app select
// without an empty choice.
const DETAIL = { slug: 'moon', pixel_id: null, app_id: 'starlyn', created_by: 'ed', created_at: '2026-10-01T08:00:00.000Z', versions: [], live: [] };
const settingsApp = () => within(screen.getByRole('heading', { name: 'Settings' }).parentElement).getByLabelText('App');

describe('Funnel detail and its app', () => {
  it('breadcrumb: the app links to its Tổng quan, then the slug; on every tab; no unassigned card', async () => {
    renderApp(appsClient(ME.viewer, { getFunnel: vi.fn(async () => DETAIL) }), '/funnels/moon');
    const nav = await screen.findByRole('navigation', { name: 'Breadcrumb' });
    await waitFor(() => expect(within(nav).getByRole('link', { name: 'Starlyn' }).getAttribute('href')).toBe('/apps/starlyn'));
    expect(nav.textContent).toBe('Starlyn›moon');
    expect(screen.queryByTestId('unassigned')).toBeNull();
    fireEvent.click(screen.getByRole('tab', { name: 'Tổng quan' }));
    expect(within(screen.getByRole('navigation', { name: 'Breadcrumb' })).getByRole('link', { name: 'Starlyn' })).toBeTruthy();
  });

  it('an unassigned funnel: "Chưa gán" (no link) and the yellow card', async () => {
    renderApp(appsClient(ME.viewer, { getFunnel: vi.fn(async () => ({ ...DETAIL, app_id: null })) }), '/funnels/moon');
    const nav = await screen.findByRole('navigation', { name: 'Breadcrumb' });
    expect(nav.textContent).toBe('Chưa gán›moon');
    expect(within(nav).queryByRole('link')).toBeNull();
    expect(screen.getByTestId('unassigned').textContent).toBe('Chưa gán app. Chọn app ở Tổng quan để publish lên domain của app.');
  });

  it('settings: the current app comes first and there is no empty option; changing it sends the new app', async () => {
    const client = appsClient(ME.editor, { getFunnel: vi.fn(async () => DETAIL), setFunnel: vi.fn(async (_s, b) => ({ funnel: 'moon', ...b })) });
    renderApp(client, '/funnels/moon?tab=main');
    await screen.findByRole('heading', { name: 'Settings' });
    await waitFor(() => expect([...settingsApp().options].map((o) => o.value)).toEqual(['starlyn', 'tarot-web']));
    expect(settingsApp().value).toBe('starlyn');
    fireEvent.change(settingsApp(), { target: { value: 'tarot-web' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu app' }));
    await waitFor(() => expect(client.setFunnel).toHaveBeenCalledWith('moon', { app_id: 'tarot-web' }));
  });

  it('settings of an unassigned funnel: a disabled "Chọn app" prompt; Lưu app waits for a choice; never null', async () => {
    const client = appsClient(ME.editor, { getFunnel: vi.fn(async () => ({ ...DETAIL, app_id: null })) });
    renderApp(client, '/funnels/moon?tab=main');
    await screen.findByRole('heading', { name: 'Settings' });
    await waitFor(() => expect([...settingsApp().options].map((o) => o.textContent)).toEqual(['Chọn app', 'Starlyn (app)', 'Tarot Web (web)']));
    expect(settingsApp().options[0].disabled).toBe(true);
    const save = screen.getByRole('button', { name: 'Lưu app' });
    expect(save.disabled).toBe(true);
    fireEvent.click(save);
    expect(client.setFunnel).not.toHaveBeenCalled();
  });
});
```

`apps/admin/test/publish.test.jsx`, `apps/admin/test/funnels.test.jsx` (sửa, áp dụng đúng diff này): fixture `DETAIL` của publish có `app_id: 'starlyn'` và kiểm `listDomains({app: 'starlyn'})`; thêm 2 test (funnel chưa gán → `{app: 'none'}` + ghi chú; 409 `domain_app_mismatch`); test Settings của funnels đổi lựa chọn đầu từ `— không gắn —` sang `Chọn app` và kiểm "Lưu app" disabled trước khi chọn.

`apps/admin/test/publish.test.jsx`, `apps/admin/test/funnels.test.jsx` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/test/funnels.test.jsx b/apps/admin/test/funnels.test.jsx
index 896dc70..d7c2ad3 100644
--- a/apps/admin/test/funnels.test.jsx
+++ b/apps/admin/test/funnels.test.jsx
@@ -163,7 +163,7 @@ describe('Funnel detail', () => {
     expect((await screen.findByLabelText('Chọn demo.html')).disabled).toBe(true);
   });
 
-  it('settings: save the Pixel ID; pick the app from /v1/apps or none; errors are shown', async () => {
+  it('settings: save the Pixel ID; pick the app from /v1/apps (no empty choice); errors are shown', async () => {
     const client = fakeClient(ME.editor, {
       getFunnel: vi.fn(async () => DETAIL),
       listApps: vi.fn(async () => ({ apps: [{ id: 'starlyn', name: 'Starlyn', kind: 'app' }, { id: 'tarot-web', name: 'Tarot', kind: 'web' }] })),
@@ -183,7 +183,9 @@ describe('Funnel detail', () => {
     await waitFor(() => expect(client.setFunnel).toHaveBeenLastCalledWith('aivideo', { pixel_id: null }));
     // The sidebar's app switcher is labelled App too (spec admin-console-p4a §3): look inside the Settings card.
     const app = within(screen.getByRole('heading', { name: 'Settings' }).parentElement).getByLabelText('App');
-    await waitFor(() => expect([...app.options].map((o) => o.textContent)).toEqual(['— không gắn —', 'Starlyn (app)', 'Tarot (web)']));
+    // Spec admin-console-p4a §3 "Funnel detail": an unassigned funnel gets a disabled prompt, never an empty choice.
+    await waitFor(() => expect([...app.options].map((o) => o.textContent)).toEqual(['Chọn app', 'Starlyn (app)', 'Tarot (web)']));
+    expect(screen.getByRole('button', { name: 'Lưu app' }).disabled).toBe(true);
     fireEvent.change(app, { target: { value: 'starlyn' } });
     fireEvent.click(screen.getByRole('button', { name: 'Lưu app' }));
     await waitFor(() => expect(client.setFunnel).toHaveBeenLastCalledWith('aivideo', { app_id: 'starlyn' }));
diff --git a/apps/admin/test/publish.test.jsx b/apps/admin/test/publish.test.jsx
index b28d728..ae4744c 100644
--- a/apps/admin/test/publish.test.jsx
+++ b/apps/admin/test/publish.test.jsx
@@ -1,11 +1,11 @@
 import { describe, it, expect, vi } from 'vitest';
-import { fireEvent, screen, waitFor, within } from '@testing-library/react';
+import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
 import { ApiError } from '../src/api.js';
 import { fakeClient, renderApp, ME } from './helpers.jsx';
 
 const version = (v) => ({ v, sha256: 'a'.repeat(64), size: 1024, lint: { errors: [], warnings: [] }, created_by: 'ed@ikameglobal.com', created_at: '2026-10-02T08:00:00.000Z', preview_url: `https://preview.ikf.example/aivideo/v${v}` });
 const DETAIL = {
-  slug: 'aivideo', pixel_id: null, app_id: null, created_by: 'ed', created_at: '2026-10-01T08:00:00.000Z',
+  slug: 'aivideo', pixel_id: null, app_id: 'starlyn', created_by: 'ed', created_at: '2026-10-01T08:00:00.000Z',
   versions: [version(3), version(2), version(1)],
   live: [
     { host: 'a.example.com', prefix: '/', v: 2, previous: { slug: 'aivideo', v: 1 } },
@@ -44,6 +44,9 @@ describe('Publish dialog (admin)', () => {
     const dialog = await openPublish(3);
     const host = within(dialog).getByLabelText('Host');
     await waitFor(() => expect([...host.options].map((o) => o.value)).toEqual(['a.example.com', 'b.example.com']));
+    // Spec admin-console-p4a §3: only the funnel's app's domains and the shared ones.
+    expect(client.listDomains).toHaveBeenCalledWith({ app: 'starlyn' });
+    expect(within(dialog).queryByTestId('shared-only')).toBeNull();
     expect(within(dialog).getByTestId('change').textContent).toBe('Đang live: v2 → v3');
     fireEvent.change(within(dialog).getByLabelText('Prefix'), { target: { value: '/new' } });
     expect(within(dialog).getByTestId('change').textContent).toBe('Publish lần đầu tại a.example.com/new');
@@ -83,6 +86,30 @@ describe('Publish dialog (admin)', () => {
     expect(await screen.findByText(/Đã lưu nhưng chưa lên edge \(KV\)/)).toBeTruthy();
   });
 
+  it('a funnel without an app: only the shared domains (app=none), with a note', async () => {
+    const client = setup(ME.admin, { getFunnel: vi.fn(async () => ({ ...DETAIL, app_id: null })) });
+    const dialog = await openPublish(3);
+    await waitFor(() => expect(within(dialog).getByLabelText('Host').options).toHaveLength(2));
+    expect(client.listDomains).toHaveBeenCalledWith({ app: 'none' });
+    expect(within(dialog).getByTestId('shared-only').textContent).toBe('Funnel chưa gán app: chỉ publish được lên domain dùng chung.');
+  });
+
+  it('409 domain_app_mismatch says whose domain it is and whose funnel (or that the funnel has no app)', async () => {
+    for (const [funnelApp, text] of [['starlyn', 'Domain thuộc app tarot-web, funnel thuộc app starlyn.'], [null, 'Domain thuộc app tarot-web, funnel thuộc app chưa gán.']]) {
+      cleanup();
+      setup(ME.admin, {
+        getFunnel: vi.fn(async () => ({ ...DETAIL, app_id: funnelApp })),
+        publish: vi.fn(async () => {
+          throw new ApiError(409, { error: 'domain_app_mismatch', detail: { host_app: 'tarot-web', funnel_app: funnelApp } });
+        }),
+      });
+      const dialog = await openPublish(3);
+      await waitFor(() => expect(within(dialog).getByLabelText('Host').options).toHaveLength(2));
+      fireEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận publish' }));
+      expect((await within(dialog).findByRole('alert')).textContent).toBe(text);
+    }
+  });
+
   it('editors and viewers see Publish and Rollback greyed out', async () => {
     setup(ME.editor);
     await screen.findAllByTestId('version');
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/admin 2>&1 | grep -E "Test Files|Tests  |×"
```

Expected: `Test Files  4 failed | 18 passed (22)`, `Tests  14 failed | 170 passed (184)`: 6 test `domains.test.jsx` fail (chưa có cột App, select "Gán app cho …", nhóm "Của app"/"Dùng chung", route `/apps/:id/domains`); 4 test `funnel-detail-app.test.jsx` fail (chưa có breadcrumb, thẻ `unassigned`, select còn `— không gắn —`); 3 test `publish.test.jsx` fail (`listDomains` gọi không tham số, chưa có ghi chú `shared-only`, 409 hiện `Lỗi 409 domain_app_mismatch`); 1 test `funnels.test.jsx` (Settings) fail vì còn lựa chọn `— không gắn —`.

- [ ] **Step 3: Implement**

`apps/admin/src/pages/Domains.jsx` (sửa, áp dụng đúng diff này): một component cho `/domains` (cột App: link tên app hoặc `(dùng chung)`; admin có select gán app, đổi là gọi `setDomain(host, {app_id})`, `''` → `null`) và `/apps/:id/domains` (`listDomains({app})`, hai nhóm; admin có **Gán vào app** trên dòng dùng chung, **Bỏ gán** trên dòng của app); `ForeignRoutes` liệt kê route chặn khi 409 `domain_has_foreign_routes`. Role khác admin không thấy control gán.

`apps/admin/src/pages/Domains.jsx` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/src/pages/Domains.jsx b/apps/admin/src/pages/Domains.jsx
index f806eff..6caa9c7 100644
--- a/apps/admin/src/pages/Domains.jsx
+++ b/apps/admin/src/pages/Domains.jsx
@@ -1,19 +1,47 @@
 import { useCallback, useEffect, useState } from 'react';
+import { Link } from 'react-router';
+import { useAppContext } from '../app-context.jsx';
 import { useAuth } from '../auth.jsx';
 import { ErrorNote } from '../components/ErrorNote.jsx';
 import { RoleButton } from '../components/RoleButton.jsx';
+import { can } from '../roles.js';
+
+// Spec admin-console-p4a §2 "Domain và publish": a host with live routes of another app's (or an unassigned)
+// funnel cannot be given to an app; the 409 names those routes so the operator knows what to move first.
+function ForeignRoutes({ error, nameOf }) {
+  if (error?.code !== 'domain_has_foreign_routes' || !error.detail?.routes) return null;
+  return (
+    <div className="card warn">
+      <p>Host còn route live của funnel thuộc app khác:</p>
+      <ul>
+        {error.detail.routes.map((r) => (
+          <li key={r.prefix} data-testid="foreign-route">{`${r.prefix} → ${r.slug} (${r.app_id ? nameOf(r.app_id) : 'chưa gán'})`}</li>
+        ))}
+      </ul>
+    </div>
+  );
+}
 
 // Funnel hosts (spec §5.4). Domains are Terraform's (publisher spec: never created through the API), so
-// "Thêm domain" explains the steps instead of calling anything.
+// "Thêm domain" explains the steps instead of calling anything. Spec admin-console-p4a §3: one component for
+// /domains (every host, an App column, admin assigns with a select) and /apps/:id/domains (two groups, "Của app"
+// and "Dùng chung", from GET /v1/domains?app=, with Gán vào app / Bỏ gán for admins).
 export function Domains() {
-  const { client } = useAuth();
+  const { client, me } = useAuth();
+  const { appId, apps } = useAppContext();
   const [domains, setDomains] = useState(null);
   const [error, setError] = useState(null);
   const [help, setHelp] = useState(false);
   const [notice, setNotice] = useState('');
+  const admin = can(me.role, 'admin');
+  const nameOf = (id) => apps.find((a) => a.id === id)?.name ?? id;
 
-  const load = useCallback(() => client.listDomains().then((r) => setDomains(r.domains), setError), [client]);
+  const load = useCallback(
+    () => (appId ? client.listDomains({ app: appId }) : client.listDomains()).then((r) => setDomains(r.domains), setError),
+    [client, appId],
+  );
   useEffect(() => {
+    setDomains(null);
     load();
   }, [load]);
 
@@ -28,6 +56,85 @@ export function Domains() {
     }
   };
 
+  // app = an app id, or null to make the host shared again (PUT /v1/domains/:host {app_id}).
+  const assign = async (host, app) => {
+    setError(null);
+    setNotice('');
+    try {
+      await client.setDomain(host, { app_id: app });
+      setNotice(app ? `Đã gán ${host} vào ${nameOf(app)}.` : `${host}: đã chuyển về dùng chung.`);
+      load();
+    } catch (err) {
+      setError(err);
+    }
+  };
+
+  const table = (rows, { appColumn, action }) => (
+    <table>
+      <thead>
+        <tr><th>Host</th><th>Trạng thái</th><th>Số route</th><th>Routes</th>{appColumn && <th>App</th>}<th /></tr>
+      </thead>
+      <tbody>
+        {rows.map((d) => (
+          <tr key={d.host} data-testid="domain">
+            <td>{d.host}</td>
+            <td>{d.status}</td>
+            <td>{d.routes.length}</td>
+            <td>{d.routes.map((r) => `${r.prefix} → ${r.slug} v${r.v}`).join(', ') || '—'}</td>
+            {appColumn && <td>{d.app_id ? <Link to={`/apps/${encodeURIComponent(d.app_id)}`}>{nameOf(d.app_id)}</Link> : '(dùng chung)'}</td>}
+            <td>
+              <span className="row">
+                {d.kv_synced_rev < d.rev && (
+                  <>
+                    <span className="warn">KV chậm hơn DB (rev {d.kv_synced_rev} &lt; {d.rev})</span>
+                    <RoleButton need="admin" onClick={() => sync(d.host)}>Sync</RoleButton>
+                  </>
+                )}
+                {admin && action(d)}
+              </span>
+            </td>
+          </tr>
+        ))}
+      </tbody>
+    </table>
+  );
+
+  const globalSelect = (d) => (
+    <select aria-label={`Gán app cho ${d.host}`} value={d.app_id ?? ''} onChange={(e) => assign(d.host, e.target.value || null)}>
+      <option value="">Dùng chung</option>
+      {apps.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
+      {d.app_id && !apps.some((a) => a.id === d.app_id) && <option value={d.app_id}>{d.app_id}</option>}
+    </select>
+  );
+
+  let body;
+  if (domains === null) body = <p className="muted">Đang tải…</p>;
+  else if (!appId) body = table(domains, { appColumn: true, action: globalSelect });
+  else {
+    const own = domains.filter((d) => d.app_id === appId);
+    const shared = domains.filter((d) => d.app_id === null);
+    body = (
+      <>
+        <div className="card" data-testid="app-own">
+          <h2>Của app</h2>
+          {own.length ? (
+            table(own, { action: (d) => <button type="button" onClick={() => assign(d.host, null)}>Bỏ gán</button> })
+          ) : (
+            <p className="muted">App chưa có domain riêng.</p>
+          )}
+        </div>
+        <div className="card" data-testid="app-shared">
+          <h2>Dùng chung</h2>
+          {shared.length ? (
+            table(shared, { action: (d) => <button type="button" onClick={() => assign(d.host, appId)}>Gán vào app</button> })
+          ) : (
+            <p className="muted">Không có domain dùng chung.</p>
+          )}
+        </div>
+      </>
+    );
+  }
+
   return (
     <section>
       <h1>Domains</h1>
@@ -43,33 +150,8 @@ export function Domains() {
       )}
       {notice && <p className="ok">{notice}</p>}
       <ErrorNote error={error} />
-      {domains === null ? (
-        <p className="muted">Đang tải…</p>
-      ) : (
-        <table>
-          <thead>
-            <tr><th>Host</th><th>Trạng thái</th><th>Số route</th><th>Routes</th><th /></tr>
-          </thead>
-          <tbody>
-            {domains.map((d) => (
-              <tr key={d.host} data-testid="domain">
-                <td>{d.host}</td>
-                <td>{d.status}</td>
-                <td>{d.routes.length}</td>
-                <td>{d.routes.map((r) => `${r.prefix} → ${r.slug} v${r.v}`).join(', ') || '—'}</td>
-                <td>
-                  {d.kv_synced_rev < d.rev && (
-                    <span className="row">
-                      <span className="warn">KV chậm hơn DB (rev {d.kv_synced_rev} &lt; {d.rev})</span>
-                      <RoleButton need="admin" onClick={() => sync(d.host)}>Sync</RoleButton>
-                    </span>
-                  )}
-                </td>
-              </tr>
-            ))}
-          </tbody>
-        </table>
-      )}
+      <ForeignRoutes error={error} nameOf={nameOf} />
+      {body}
     </section>
   );
 }
PATCH
```

`apps/admin/src/components/PublishDialog.jsx`, `apps/admin/src/components/FunnelSettings.jsx`, `apps/admin/src/pages/FunnelDetail.jsx`, `apps/admin/src/App.jsx`, `apps/admin/src/styles.css` (sửa, áp dụng đúng diff này):

`apps/admin/src/components/PublishDialog.jsx`, `apps/admin/src/components/FunnelSettings.jsx`, `apps/admin/src/pages/FunnelDetail.jsx`, `apps/admin/src/App.jsx`, `apps/admin/src/styles.css` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/src/App.jsx b/apps/admin/src/App.jsx
index 2dfab6b..dc2ffde 100644
--- a/apps/admin/src/App.jsx
+++ b/apps/admin/src/App.jsx
@@ -32,7 +32,8 @@ export function App({ client }) {
           <Route path="/apps/:id/funnels" element={<Funnels />} />
           <Route path="/apps/:id/settings" element={<RequireGrant need="apps:read"><AppSettings /></RequireGrant>} />
           <Route path="/apps/:id/webhooks" element={<RequireGrant need="apps:read"><AppWebhooks /></RequireGrant>} />
-          {/* /apps/:id/plans, /customers, /domains and /audit come with the in-app pages (p4a §3). */}
+          <Route path="/apps/:id/domains" element={<Domains />} />
+          {/* /apps/:id/plans, /customers and /audit come with the in-app pages (p4a §3). */}
           <Route path="/customers" element={<RequireGrant need="support"><Customers /></RequireGrant>} />
           <Route path="/customers/:ref" element={<RequireGrant need="support"><CustomerDetail /></RequireGrant>} />
           <Route path="/domains" element={<Domains />} />
diff --git a/apps/admin/src/components/FunnelSettings.jsx b/apps/admin/src/components/FunnelSettings.jsx
index fc3b220..142580f 100644
--- a/apps/admin/src/components/FunnelSettings.jsx
+++ b/apps/admin/src/components/FunnelSettings.jsx
@@ -3,7 +3,9 @@ import { useAuth } from '../auth.jsx';
 import { ErrorNote } from './ErrorNote.jsx';
 import { RoleButton } from './RoleButton.jsx';
 
-// Pixel ID and the app the funnel sells (spec §5.3 Settings).
+// Pixel ID and the app the funnel sells (spec §5.3 Settings). Spec admin-console-p4a §3 "Funnel detail": the app
+// select has no empty choice (PUT /v1/funnels/:slug refuses app_id null): the current app comes first, or an
+// unassigned funnel gets a disabled "Chọn app" prompt and Lưu app waits for a pick.
 export function FunnelSettings({ funnel, onSaved }) {
   const { client } = useAuth();
   const [pixel, setPixel] = useState(funnel.pixel_id ?? '');
@@ -16,6 +18,9 @@ export function FunnelSettings({ funnel, onSaved }) {
     client.listApps().then((r) => setApps(r.apps), setError);
   }, [client]);
 
+  // The current app before /v1/apps answers (or if it is missing there): its id stands in for name and kind.
+  const current = funnel.app_id ? apps.find((a) => a.id === funnel.app_id) ?? { id: funnel.app_id, name: funnel.app_id, kind: '?' } : null;
+
   const save = async (body, what) => {
     setError(null);
     setSaved('');
@@ -39,10 +44,10 @@ export function FunnelSettings({ funnel, onSaved }) {
       <div className="row">
         <label htmlFor="app">App</label>
         <select id="app" value={appId} onChange={(e) => setAppId(e.target.value)}>
-          <option value="">— không gắn —</option>
-          {apps.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.kind})</option>)}
+          {current ? <option value={current.id}>{current.name} ({current.kind})</option> : <option value="" disabled>Chọn app</option>}
+          {apps.filter((a) => a.id !== funnel.app_id).map((a) => <option key={a.id} value={a.id}>{a.name} ({a.kind})</option>)}
         </select>
-        <RoleButton need="editor" onClick={() => save({ app_id: appId || null }, 'app')}>Lưu app</RoleButton>
+        <RoleButton need="editor" disabled={!appId} onClick={() => save({ app_id: appId }, 'app')}>Lưu app</RoleButton>
       </div>
       {saved && <p className="ok">{saved}</p>}
       <ErrorNote error={error} />
diff --git a/apps/admin/src/components/PublishDialog.jsx b/apps/admin/src/components/PublishDialog.jsx
index 778ab68..fd6c55b 100644
--- a/apps/admin/src/components/PublishDialog.jsx
+++ b/apps/admin/src/components/PublishDialog.jsx
@@ -1,5 +1,6 @@
 import { useEffect, useState } from 'react';
 import { isValidPrefix, normalizePath } from '@ikf/route-match';
+import { useAppContext } from '../app-context.jsx';
 import { useAuth } from '../auth.jsx';
 import { ErrorNote } from './ErrorNote.jsx';
 
@@ -8,9 +9,16 @@ export const resultText = (r) =>
     ? `Đã lưu nhưng chưa lên edge (KV): hệ thống tự thử lại mỗi phút. ${r.host}${r.prefix} → ${r.funnel} v${r.v}.`
     : `Đã publish v${r.v}: https://${r.host}${r.prefix} (hiệu lực toàn cầu trong ~${r.propagation_seconds} giây)`;
 
+// 409 domain_app_mismatch (spec admin-console-p4a §2): the host belongs to another app than the funnel's.
+const mismatchText = ({ host_app, funnel_app }, nameOf) =>
+  `Domain thuộc app ${nameOf(host_app)}, funnel thuộc app ${funnel_app ? nameOf(funnel_app) : 'chưa gán'}.`;
+
 // Publish one version to an active host + prefix (spec §5.3): says what changes, then PUT /v1/routes/:host.
+// Spec admin-console-p4a §3: the hosts are the funnel's app's and the shared ones (GET /v1/domains?app=); a funnel
+// without an app sees only the shared ones (?app=none), which is all the server lets it publish to.
 export function PublishDialog({ funnel, version, onClose, onDone }) {
   const { client } = useAuth();
+  const { apps } = useAppContext();
   const [domains, setDomains] = useState(null);
   const [host, setHost] = useState('');
   const [prefix, setPrefix] = useState('/');
@@ -19,13 +27,14 @@ export function PublishDialog({ funnel, version, onClose, onDone }) {
   const [error, setError] = useState(null);
 
   useEffect(() => {
-    client.listDomains().then((r) => {
+    client.listDomains({ app: funnel.app_id ?? 'none' }).then((r) => {
       const active = r.domains.filter((d) => d.status === 'active');
       setDomains(active);
       setHost((h) => h || active[0]?.host || '');
     }, setError);
-  }, [client]);
+  }, [client, funnel.app_id]);
 
+  const nameOf = (id) => apps.find((a) => a.id === id)?.name ?? id;
   const p = normalizePath(prefix);
   const valid = isValidPrefix(p);
   const current = domains?.find((d) => d.host === host)?.routes.find((r) => r.prefix === p) ?? null;
@@ -50,6 +59,7 @@ export function PublishDialog({ funnel, version, onClose, onDone }) {
   return (
     <div role="dialog" aria-modal="true" aria-label={`Publish v${version.v}`} className="dialog">
       <h3>Publish {funnel.slug} v{version.v}</h3>
+      {!funnel.app_id && <p className="warn" data-testid="shared-only">Funnel chưa gán app: chỉ publish được lên domain dùng chung.</p>}
       {domains && !domains.length && <p className="warn">Chưa có domain active.</p>}
       <div className="row">
         <label htmlFor="pub-host">Host</label>
@@ -65,7 +75,11 @@ export function PublishDialog({ funnel, version, onClose, onDone }) {
           <input type="checkbox" checked={switchFunnel} onChange={(e) => setSwitchFunnel(e.target.checked)} /> Đổi funnel ở prefix này
         </label>
       )}
-      <ErrorNote error={error} />
+      {error?.code === 'domain_app_mismatch' ? (
+        <p className="error" role="alert">{mismatchText(error.detail ?? {}, nameOf)}</p>
+      ) : (
+        <ErrorNote error={error} />
+      )}
       <div className="row">
         <button type="button" className="primary" onClick={confirm} disabled={busy || !host || !valid || (other && !switchFunnel)}>Xác nhận publish</button>
         <button type="button" onClick={onClose}>Huỷ</button>
diff --git a/apps/admin/src/pages/FunnelDetail.jsx b/apps/admin/src/pages/FunnelDetail.jsx
index a39abb2..dc0c4a5 100644
--- a/apps/admin/src/pages/FunnelDetail.jsx
+++ b/apps/admin/src/pages/FunnelDetail.jsx
@@ -1,5 +1,6 @@
 import { useCallback, useEffect, useState } from 'react';
-import { useParams, useSearchParams } from 'react-router';
+import { Link, useParams, useSearchParams } from 'react-router';
+import { useAppContext } from '../app-context.jsx';
 import { useAuth } from '../auth.jsx';
 import { ErrorNote } from '../components/ErrorNote.jsx';
 import { FunnelSettings } from '../components/FunnelSettings.jsx';
@@ -14,6 +15,25 @@ import { UploadBox } from '../components/UploadBox.jsx';
 import { fmtSize, fmtTime } from '../format.js';
 import { can } from '../roles.js';
 
+// Spec admin-console-p4a §3 "Funnel detail": App › slug above the heading (the app links to its Tổng quan), and a
+// yellow card while the funnel has no app (it can only go on shared hosts until an app is picked in Settings).
+function AppTrail({ funnel }) {
+  const { apps } = useAppContext();
+  const name = apps.find((a) => a.id === funnel.app_id)?.name ?? funnel.app_id;
+  return (
+    <>
+      <nav aria-label="Breadcrumb" className="breadcrumb">
+        {funnel.app_id ? <Link to={`/apps/${encodeURIComponent(funnel.app_id)}`}>{name}</Link> : <span>Chưa gán</span>}
+        <span aria-hidden="true">›</span>
+        <span>{funnel.slug}</span>
+      </nav>
+      {!funnel.app_id && (
+        <div className="card warn" data-testid="unassigned">Chưa gán app. Chọn app ở Tổng quan để publish lên domain của app.</div>
+      )}
+    </>
+  );
+}
+
 export function FunnelDetail() {
   const { slug } = useParams();
   const { client, me } = useAuth();
@@ -52,7 +72,8 @@ export function FunnelDetail() {
   if (tab !== 'main') {
     return (
       <section>
-        <h1>{funnel.slug}</h1>
+        <AppTrail funnel={funnel} />
+      <h1>{funnel.slug}</h1>
         {tabs}
         {tab === 'stats' ? <StatsTab slug={funnel.slug} /> : <PricesTab slug={funnel.slug} />}
       </section>
@@ -60,6 +81,7 @@ export function FunnelDetail() {
   }
   return (
     <section>
+      <AppTrail funnel={funnel} />
       <h1>{funnel.slug}</h1>
       {tabs}
       {notice && <p className="ok">{notice}</p>}
diff --git a/apps/admin/src/styles.css b/apps/admin/src/styles.css
index 19b70c5..8566ecc 100644
--- a/apps/admin/src/styles.css
+++ b/apps/admin/src/styles.css
@@ -139,6 +139,9 @@ p.ok { background: var(--ok-soft); border-color: #a7f3d0; }
 .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: var(--space-4); margin: var(--space-4) 0; box-shadow: var(--shadow-sm); }
 .card.warn { border-color: #fde68a; background: var(--warn-soft); color: var(--warn); }
 .card .card { box-shadow: none; }
+/* Funnel detail: App › slug above the heading (p4a §3). */
+.breadcrumb { display: flex; gap: var(--space-2); align-items: center; margin-top: var(--space-4); font-size: 13px; color: var(--muted); }
+.breadcrumb + h1 { margin-top: var(--space-1); }
 .row { display: flex; gap: var(--space-2); align-items: center; flex-wrap: wrap; }
 section > .row { margin: var(--space-2) 0 var(--space-3); }
 .drop { border: 2px dashed var(--border-strong); border-radius: var(--radius); padding: var(--space-5); text-align: center; background: var(--bg); transition: border-color var(--ease), background var(--ease); }
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/admin -- test/domains.test.jsx test/funnel-detail-app.test.jsx test/publish.test.jsx test/funnels.test.jsx test/pages.test.jsx
npm test -w @ikf/admin 2>&1 | grep -E "Test Files|Tests  "
```

Expected: mọi test của các file trên pass (`test/pages.test.jsx` — test Domains cũ, `data-testid="domain"`, 4 cột đầu — giữ nguyên, không sửa); toàn bộ admin `Test Files  22 passed (22)`, `Tests  184 passed (184)`.

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/pages/Domains.jsx apps/admin/src/components/PublishDialog.jsx apps/admin/src/components/FunnelSettings.jsx apps/admin/src/pages/FunnelDetail.jsx apps/admin/src/App.jsx apps/admin/src/styles.css apps/admin/test/domains.test.jsx apps/admin/test/funnel-detail-app.test.jsx apps/admin/test/publish.test.jsx apps/admin/test/funnels.test.jsx
git commit -m "feat(admin): domains per app (assign/unassign), publish dialog limited to the funnel's app domains, funnel breadcrumb
```

---

---

### Task 11: SPA — Giá trong app, Khách hàng trong app, Audit trong app + lọc app

**Files:**
- Create: `apps/admin/src/pages/AppPlans.jsx`
- Modify: `apps/admin/src/App.jsx`, `apps/admin/src/pages/Customers.jsx`, `apps/admin/src/pages/CustomerDetail.jsx`, `apps/admin/src/pages/Audit.jsx`
- Test: `apps/admin/test/app-plans.test.jsx` (mới), `apps/admin/test/customers-app.test.jsx` (mới), `apps/admin/test/audit.test.jsx` (mới)

**Interfaces:**
- Consumes: `useAppContext()` → `{appId, apps, app}` (Task 8); client `getAppPlans(id)` → `{plans: [{slug, plan, price_id, discount_id, entitlement_key, unmapped, in_html}]}`, `lookupCustomers({…, app_id})`, `listAudit({…, app})` (Task 8); `RequireGrant`; `appsClient`/`STARLYN`/`TAROT` trong `test/apps-fixtures.js`.
- Produces: trang `AppPlans` (`/apps/:id/plans`, `prices:read`); route `/apps/:id/customers`, `/apps/:id/customers/:ref` (`support`), `/apps/:id/audit` (viewer); `customerPath(appId, ref)` export từ `pages/Customers.jsx`; `GrantDialog` nhận `lockedApp`; `<select aria-label="Lọc app">` trên `/audit` gắn với `?app=`; chip `data-testid="audit-app"` trên mỗi dòng audit có `app_id`; `data-testid="plan-row"`.

Ghi chú: trong app, `CustomerDetail` gửi `app_id` ở **mọi** lần tải (cả lần tải lại sau cấp/thu hồi/cấp lại user_id) — route grant/revoke trả entitlements của mọi app nên trang tải lại thay vì dùng body trả về. `listAudit` chỉ thêm `app` khi có giá trị, nên test Audit cũ trong `test/pages.test.jsx` (gọi `{target, action}`) giữ nguyên.

- [ ] **Step 1: Viết test fail**

`apps/admin/test/app-plans.test.jsx` (mới):

`apps/admin/test/app-plans.test.jsx` (mới):

```jsx
import { describe, it, expect, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderApp, ME } from './helpers.jsx';
import { appsClient } from './apps-fixtures.js';

const PLANS = {
  plans: [
    { slug: 'moon-reading', plan: '1w', price_id: 'pri_01', discount_id: 'dsc_01', entitlement_key: 'premium', unmapped: false, in_html: true },
    { slug: 'moon-reading', plan: '1m', price_id: null, discount_id: null, entitlement_key: null, unmapped: true, in_html: true },
    { slug: 'witch-power', plan: 'old', price_id: 'pri_02', discount_id: null, entitlement_key: 'tarot', unmapped: false, in_html: false },
  ],
};
const cells = (r) => [...r.querySelectorAll('td')].map((td) => td.textContent);

// Spec admin-console-p4a §3 "Giá trong app": read-only, one row per funnel plan of the app, badges as the Giá tab.
describe('App plans (/apps/:id/plans)', () => {
  it('rows: funnel (link to its Giá tab), plan, price, discount, key; Chưa có giá / Không dùng badges', async () => {
    const client = appsClient(ME.editor, { getAppPlans: vi.fn(async () => PLANS) });
    renderApp(client, '/apps/starlyn/plans');
    const rows = await screen.findAllByTestId('plan-row');
    expect(client.getAppPlans).toHaveBeenCalledWith('starlyn');
    expect(rows.map(cells)).toEqual([
      ['moon-reading', '1w', 'pri_01', 'dsc_01', 'premium', ''],
      ['moon-reading', '1m', '—', '—', '—', 'Chưa có giá'],
      ['witch-power', 'old', 'pri_02', '—', 'tarot', 'Không dùng'],
    ]);
    expect(within(rows[0]).getByRole('link', { name: 'moon-reading' }).getAttribute('href')).toBe('/funnels/moon-reading?tab=prices');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Giá · Starlyn');
    expect(screen.queryByRole('textbox')).toBeNull(); // read-only: prices are edited in the funnel's Giá tab
  });

  it('no plan in the app: says so', async () => {
    renderApp(appsClient(ME.admin), '/apps/starlyn/plans');
    expect(await screen.findByText('Chưa có plan nào trong app.')).toBeTruthy();
  });

  it('a viewer cannot open it (prices:read)', async () => {
    const client = appsClient(ME.viewer);
    renderApp(client, '/apps/starlyn/plans');
    expect(await screen.findByText('Cần quyền prices:read.')).toBeTruthy();
    expect(client.getAppPlans).not.toHaveBeenCalled();
  });
});
```

`apps/admin/test/customers-app.test.jsx` (mới):

`apps/admin/test/customers-app.test.jsx` (mới):

```jsx
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { renderApp, ME } from './helpers.jsx';
import { appsClient } from './apps-fixtures.js';

const REF = 'cus_01K75Z0000000000000000000B';
const REF2 = 'cus_01K75Z0000000000000000000C';
const grant = (o = {}) => ({ id: 7, app_id: 'starlyn', key: 'tarot_2027', expires_at: null, reason: 'CS ticket 42', granted_by: 'boss@ikameglobal.com', created_at: '2026-10-10T08:00:00.000Z', revoked_at: null, revoked_by: null, ...o });
const REPORT = {
  customer_ref: REF, paddle_customer_id: 'ctm_1', created_at: '2026-10-09T10:00:00.000Z', user_id_rotated_at: null, has_email: true,
  checkouts: [], subscriptions: [],
  entitlements: [{ app_id: 'starlyn', key: 'tarot_2027', active: true, expires_at: null, source: 'manual', source_id: '7' }],
  manual_grants: [grant()], links: [], deliveries: [], claim: null,
};
const search = async (text) => {
  fireEvent.change(await screen.findByLabelText('Tìm khách'), { target: { value: text } });
  fireEvent.click(screen.getByRole('button', { name: 'Tìm' }));
};

// Spec admin-console-p4a §3 "Khách hàng trong app": the p2 Khách hàng page, every lookup scoped by app_id.
describe('Customers in an app (/apps/:id/customers)', () => {
  it('heading names the app; the lookup carries app_id; one result opens its page inside the app', async () => {
    const client = appsClient(ME.support, { lookupCustomers: vi.fn(async () => ({ customers: [REPORT] })) });
    renderApp(client, '/apps/starlyn/customers');
    expect(await screen.findByRole('heading', { name: 'Khách hàng của Starlyn' })).toBeTruthy();
    await search('buyer@example.com');
    expect(await screen.findByRole('heading', { name: REF })).toBeTruthy();
    expect(client.lookupCustomers).toHaveBeenNthCalledWith(1, { email: 'buyer@example.com', app_id: 'starlyn' });
    // The detail page (/apps/starlyn/customers/:ref) loads with the same app_id.
    expect(client.lookupCustomers).toHaveBeenLastCalledWith({ customer_ref: REF, app_id: 'starlyn' });
    expect(screen.getByRole('link', { name: 'Xem audit' }).getAttribute('href')).toBe(`/apps/starlyn/audit?target=customer:${REF}`);
  });

  it('several results link inside the app', async () => {
    renderApp(appsClient(ME.support, { lookupCustomers: vi.fn(async () => ({ customers: [REPORT, { ...REPORT, customer_ref: REF2 }] })) }), '/apps/starlyn/customers');
    await search('buyer@example.com');
    const rows = await screen.findAllByTestId('customer');
    expect(within(rows[1]).getByRole('link', { name: REF2 }).getAttribute('href')).toBe(`/apps/starlyn/customers/${REF2}`);
  });

  it('nobody of this app matches: says so', async () => {
    renderApp(appsClient(ME.support), '/apps/starlyn/customers');
    await search('nobody@example.com');
    expect(await screen.findByText('Không có khách nào của app này khớp.')).toBeTruthy();
  });

  it('a viewer cannot open it (support)', async () => {
    const client = appsClient(ME.viewer);
    renderApp(client, '/apps/starlyn/customers');
    expect(await screen.findByText('Cần quyền support.')).toBeTruthy();
  });

  it('detail: Cấp quyền is pre-filled and locked to the app; after granting the page reloads scoped to the app', async () => {
    const client = appsClient(ME.admin, {
      lookupCustomers: vi.fn(async () => ({ customers: [REPORT] })),
      grantEntitlement: vi.fn(async (ref, b) => ({ grant: grant({ id: 8, app_id: b.app_id, key: b.key }), entitlements: [] })),
    });
    renderApp(client, `/apps/starlyn/customers/${REF}`);
    fireEvent.click(await within(await screen.findByRole('region', { name: 'Hành động admin' })).findByRole('button', { name: 'Cấp quyền' }));
    const dialog = screen.getByRole('dialog');
    const app = within(dialog).getByLabelText('App');
    expect(app.disabled).toBe(true);
    expect(app.value).toBe('starlyn');
    expect([...app.options].map((o) => o.textContent)).toEqual(['Starlyn (starlyn)']);
    fireEvent.change(within(dialog).getByLabelText('Lý do'), { target: { value: 'CS ticket 43' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận cấp quyền' }));
    await waitFor(() => expect(client.grantEntitlement).toHaveBeenCalledWith(REF, { app_id: 'starlyn', key: 'premium', expires_at: null, reason: 'CS ticket 43' }));
    expect(await screen.findByText('Đã cấp starlyn/premium (grant 8).')).toBeTruthy();
    expect(client.lookupCustomers).toHaveBeenCalledTimes(2);
    expect(client.lookupCustomers).toHaveBeenLastCalledWith({ customer_ref: REF, app_id: 'starlyn' });
  });

  it('global /customers is unchanged: no app_id, plain heading', async () => {
    const client = appsClient(ME.support);
    renderApp(client, '/customers');
    expect(await screen.findByRole('heading', { name: 'Khách hàng' })).toBeTruthy();
    await search('nobody@example.com');
    expect(await screen.findByText('Không tìm thấy khách.')).toBeTruthy();
    expect(client.lookupCustomers).toHaveBeenCalledWith({ email: 'nobody@example.com' });
  });
});
```

`apps/admin/test/audit.test.jsx` (mới):

`apps/admin/test/audit.test.jsx` (mới):

```jsx
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderApp, ME } from './helpers.jsx';
import { appsClient } from './apps-fixtures.js';

const item = (id, o = {}) => ({ id, at: '2026-10-11T08:00:00.000Z', actor: 'ed@ikameglobal.com', actor_kind: 'user', action: 'version.upload', target: 'funnel:aivideo', details: { slug: 'aivideo', v: id }, app_id: null, ...o });

// Spec admin-console-p4a §3 "Audit": /audit filters by app (?app=), /apps/:id/audit is that filter fixed.
describe('Audit by app', () => {
  it('/audit: the Lọc app select lists every app; picking one reloads with {app}; back to Tất cả drops it', async () => {
    const listAudit = vi.fn(async () => ({ items: [item(1)], next_before: null }));
    renderApp(appsClient(ME.viewer, { listAudit }), '/audit');
    const select = await screen.findByLabelText('Lọc app');
    await waitFor(() => expect([...select.options].map((o) => o.textContent)).toEqual(['Tất cả', 'Starlyn', 'Tarot Web']));
    expect(listAudit).toHaveBeenLastCalledWith({ target: '', action: '' });
    fireEvent.change(select, { target: { value: 'starlyn' } });
    await waitFor(() => expect(listAudit).toHaveBeenLastCalledWith({ target: '', action: '', app: 'starlyn' }));
    fireEvent.change(select, { target: { value: '' } });
    await waitFor(() => expect(listAudit).toHaveBeenLastCalledWith({ target: '', action: '' }));
  });

  it('/audit?app=starlyn: the select starts on the app; load more keeps it', async () => {
    const listAudit = vi.fn(async (p) => (p.before ? { items: [item(1)], next_before: null } : { items: [item(2)], next_before: 2 }));
    renderApp(appsClient(ME.viewer, { listAudit }), '/audit?app=starlyn');
    await screen.findAllByTestId('audit');
    expect(listAudit).toHaveBeenLastCalledWith({ target: '', action: '', app: 'starlyn' });
    await waitFor(() => expect(screen.getByLabelText('Lọc app').value).toBe('starlyn'));
    fireEvent.click(screen.getByRole('button', { name: 'Tải thêm' }));
    await waitFor(() => expect(listAudit).toHaveBeenLastCalledWith({ target: '', action: '', app: 'starlyn', before: 2 }));
  });

  it('an item with an app_id shows it as a chip; one without has none', async () => {
    const listAudit = vi.fn(async () => ({ items: [item(2, { app_id: 'starlyn' }), item(1, { action: 'auth.login', target: 'admin:boss', details: {} })], next_before: null }));
    renderApp(appsClient(ME.viewer, { listAudit }), '/audit');
    const rows = await screen.findAllByTestId('audit');
    expect(rows[0].querySelector('[data-testid="audit-app"]').textContent).toBe('starlyn');
    expect(rows[1].querySelector('[data-testid="audit-app"]')).toBeNull();
  });

  it('/apps/:id/audit: heading names the app, no select, every load carries the app; filters still work', async () => {
    const listAudit = vi.fn(async () => ({ items: [item(1, { app_id: 'starlyn' })], next_before: null }));
    renderApp(appsClient(ME.viewer, { listAudit }), '/apps/starlyn/audit');
    expect(await screen.findByRole('heading', { name: 'Audit của Starlyn' })).toBeTruthy();
    expect(screen.queryByLabelText('Lọc app')).toBeNull();
    await waitFor(() => expect(listAudit).toHaveBeenLastCalledWith({ target: '', action: '', app: 'starlyn' }));
    fireEvent.change(screen.getByLabelText('Hành động'), { target: { value: 'route' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lọc' }));
    await waitFor(() => expect(listAudit).toHaveBeenLastCalledWith({ target: '', action: 'route', app: 'starlyn' }));
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/admin -- test/app-plans.test.jsx test/audit.test.jsx test/customers-app.test.jsx 2>&1 | grep -E "×|Test Files|Tests  "
```

Expected: `Test Files  3 failed (3)`, `Tests  12 failed | 1 passed (13)`: các route `/apps/:id/plans|customers|audit` chưa có (rơi vào route `*` "Chọn một mục bên trái."), `/audit` chưa có select "Lọc app" và chip app; chỉ test "global /customers is unchanged" pass.

- [ ] **Step 3: Implement**

`apps/admin/src/pages/AppPlans.jsx` (mới):

`apps/admin/src/pages/AppPlans.jsx` (mới):

```jsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useAppContext } from '../app-context.jsx';
import { useAuth } from '../auth.jsx';
import { ErrorNote } from '../components/ErrorNote.jsx';

// Giá trong app (spec admin-console-p4a §3): every plan of the app's funnels (GET /v1/apps/:id/plans), read-only.
// Prices are still edited in the funnel's Giá tab, so each funnel links there; the badges read as in that tab.
export function AppPlans() {
  const { id } = useParams();
  const { client } = useAuth();
  const { app } = useAppContext();
  const [plans, setPlans] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setPlans(null);
    setError(null);
    client.getAppPlans(id).then((r) => setPlans(r.plans), setError);
  }, [client, id]);

  let body;
  if (plans === null) body = error ? <ErrorNote error={error} /> : <p className="muted">Đang tải…</p>;
  else if (!plans.length) body = <p className="muted">Chưa có plan nào trong app.</p>;
  else {
    body = (
      <table>
        <thead>
          <tr><th>Funnel</th><th>Plan</th><th>Paddle price</th><th>Discount</th><th>Entitlement key</th><th /></tr>
        </thead>
        <tbody>
          {plans.map((p) => (
            <tr key={`${p.slug}/${p.plan}`} data-testid="plan-row">
              <td><Link to={`/funnels/${encodeURIComponent(p.slug)}?tab=prices`}>{p.slug}</Link></td>
              <td>{p.plan}</td>
              <td>{p.price_id ?? '—'}</td>
              <td>{p.discount_id ?? '—'}</td>
              <td>{p.entitlement_key ?? '—'}</td>
              <td>
                {p.unmapped && <span className="badge warn">Chưa có giá</span>}
                {!p.in_html && <span className="badge warn">Không dùng</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <section>
      <h1>Giá · {app?.name ?? id}</h1>
      {body}
    </section>
  );
}
```

`apps/admin/src/App.jsx`, `apps/admin/src/pages/Customers.jsx`, `apps/admin/src/pages/CustomerDetail.jsx`, `apps/admin/src/pages/Audit.jsx` (sửa, áp dụng đúng diff này):

`apps/admin/src/App.jsx`, `apps/admin/src/pages/Customers.jsx`, `apps/admin/src/pages/CustomerDetail.jsx`, `apps/admin/src/pages/Audit.jsx` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/src/App.jsx b/apps/admin/src/App.jsx
index dc2ffde..00aa5a7 100644
--- a/apps/admin/src/App.jsx
+++ b/apps/admin/src/App.jsx
@@ -3,6 +3,7 @@ import { AuthProvider, RequireAuth } from './auth.jsx';
 import { Layout } from './Layout.jsx';
 import { RequireGrant } from './components/RequireGrant.jsx';
 import { AppOverview } from './pages/AppOverview.jsx';
+import { AppPlans } from './pages/AppPlans.jsx';
 import { Apps } from './pages/Apps.jsx';
 import { AppSettings } from './pages/AppSettings.jsx';
 import { AppWebhooks } from './pages/AppWebhooks.jsx';
@@ -33,7 +34,10 @@ export function App({ client }) {
           <Route path="/apps/:id/settings" element={<RequireGrant need="apps:read"><AppSettings /></RequireGrant>} />
           <Route path="/apps/:id/webhooks" element={<RequireGrant need="apps:read"><AppWebhooks /></RequireGrant>} />
           <Route path="/apps/:id/domains" element={<Domains />} />
-          {/* /apps/:id/plans, /customers and /audit come with the in-app pages (p4a §3). */}
+          <Route path="/apps/:id/plans" element={<RequireGrant need="prices:read"><AppPlans /></RequireGrant>} />
+          <Route path="/apps/:id/customers" element={<RequireGrant need="support"><Customers /></RequireGrant>} />
+          <Route path="/apps/:id/customers/:ref" element={<RequireGrant need="support"><CustomerDetail /></RequireGrant>} />
+          <Route path="/apps/:id/audit" element={<Audit />} />
           <Route path="/customers" element={<RequireGrant need="support"><Customers /></RequireGrant>} />
           <Route path="/customers/:ref" element={<RequireGrant need="support"><CustomerDetail /></RequireGrant>} />
           <Route path="/domains" element={<Domains />} />
diff --git a/apps/admin/src/pages/Audit.jsx b/apps/admin/src/pages/Audit.jsx
index 32b07a8..0c8636e 100644
--- a/apps/admin/src/pages/Audit.jsx
+++ b/apps/admin/src/pages/Audit.jsx
@@ -1,5 +1,6 @@
 import { useCallback, useEffect, useState } from 'react';
 import { useSearchParams } from 'react-router';
+import { useAppContext } from '../app-context.jsx';
 import { useAuth } from '../auth.jsx';
 import { ErrorNote } from '../components/ErrorNote.jsx';
 import { fmtTime } from '../format.js';
@@ -7,10 +8,21 @@ import { fmtTime } from '../format.js';
 const ACTIONS = ['', 'version', 'route', 'domain', 'funnel', 'app', 'webhook', 'customer', 'entitlement', 'billing', 'token', 'admin.user', 'auth'];
 const details = (d) => Object.entries(d).map(([k, v]) => `${k}=${v !== null && typeof v === 'object' ? JSON.stringify(v) : v}`).join(' ');
 
-// Who did what (spec §5.5): newest first, filter by funnel:<slug> / domain:<host> and action family.
+// Who did what (spec §5.5): newest first, filter by funnel:<slug> / domain:<host> and action family. Spec
+// admin-console-p4a §3 "Audit": /audit also filters by app (?app=, GET /v1/audit?app=); /apps/:id/audit is the
+// same page with the app fixed by the URL (no select). Items carry app_id, shown as a chip.
 export function Audit() {
   const { client } = useAuth();
-  const [params] = useSearchParams();
+  const { appId, apps, app: current } = useAppContext();
+  const [params, setParams] = useSearchParams();
+  // The app filter lives in the URL; an empty one is left out of the request (GET /v1/audit as before).
+  const app = appId ?? params.get('app') ?? '';
+  const pickApp = (id) => setParams((p) => {
+    const next = new URLSearchParams(p);
+    if (id) next.set('app', id);
+    else next.delete('app');
+    return next;
+  }, { replace: true });
   const [target, setTarget] = useState(params.get('target') ?? '');
   const [action, setAction] = useState('');
   const [items, setItems] = useState(null);
@@ -20,13 +32,13 @@ export function Audit() {
   const load = useCallback(async (filter, before) => {
     setError(null);
     try {
-      const r = await client.listAudit({ ...filter, ...(before && { before }) });
+      const r = await client.listAudit({ ...filter, ...(app && { app }), ...(before && { before }) });
       setItems((prev) => (before ? [...prev, ...r.items] : r.items));
       setNext(r.next_before);
     } catch (err) {
       setError(err);
     }
-  }, [client]);
+  }, [client, app]);
 
   const [filter, setFilter] = useState({ target: params.get('target') ?? '', action: '' });
   useEffect(() => {
@@ -35,8 +47,15 @@ export function Audit() {
 
   return (
     <section>
-      <h1>Audit</h1>
+      <h1>{appId ? `Audit của ${current?.name ?? appId}` : 'Audit'}</h1>
       <div className="row">
+        {!appId && (
+          <select aria-label="Lọc app" value={app} onChange={(e) => pickApp(e.target.value)}>
+            <option value="">Tất cả</option>
+            {apps.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
+            {app && !apps.some((a) => a.id === app) && <option value={app}>{app}</option>}
+          </select>
+        )}
         <label htmlFor="audit-target">Đối tượng</label>
         <input id="audit-target" placeholder="funnel:slug, domain:host, customer:cus_…" value={target} onChange={(e) => setTarget(e.target.value)} />
         <label htmlFor="audit-action">Hành động</label>
@@ -59,7 +78,7 @@ export function Audit() {
                 <td>{fmtTime(i.at)}</td>
                 <td>{i.actor}</td>
                 <td>{i.action}</td>
-                <td>{i.target}</td>
+                <td>{i.target}{i.app_id && <> <span className="badge" data-testid="audit-app">{i.app_id}</span></>}</td>
                 <td>{details(i.details)}</td>
               </tr>
             ))}
diff --git a/apps/admin/src/pages/CustomerDetail.jsx b/apps/admin/src/pages/CustomerDetail.jsx
index 0962df5..aefea00 100644
--- a/apps/admin/src/pages/CustomerDetail.jsx
+++ b/apps/admin/src/pages/CustomerDetail.jsx
@@ -1,5 +1,6 @@
 import { useCallback, useEffect, useState } from 'react';
 import { Link, useParams } from 'react-router';
+import { useAppContext } from '../app-context.jsx';
 import { useAuth } from '../auth.jsx';
 import { ErrorNote } from '../components/ErrorNote.jsx';
 import { FieldErrors } from '../components/FieldErrors.jsx';
@@ -10,18 +11,22 @@ function Dialog({ label, children }) {
   return <div role="dialog" aria-modal="true" aria-label={label} className="dialog">{children}</div>;
 }
 
-function GrantDialog({ customerRef, onClose, onDone }) {
+// lockedApp = {id, name} inside an app (spec admin-console-p4a §3): the grant can only be for that app, so the
+// App select shows just it, disabled, and /v1/apps is not asked.
+function GrantDialog({ customerRef, lockedApp, onClose, onDone }) {
   const { client } = useAuth();
   const [apps, setApps] = useState([]);
-  const [draft, setDraft] = useState({ app_id: '', key: 'premium', until: '', reason: '' });
+  const locked = lockedApp?.id ?? null;
+  const [draft, setDraft] = useState({ app_id: locked ?? '', key: 'premium', until: '', reason: '' });
   const [error, setError] = useState(null);
   const [busy, setBusy] = useState(false);
   useEffect(() => {
+    if (locked) return;
     client.listApps().then((r) => {
       setApps(r.apps);
       setDraft((d) => ({ ...d, app_id: d.app_id || r.apps[0]?.id || '' }));
     }, setError);
-  }, [client]);
+  }, [client, locked]);
   const confirm = async () => {
     if (busy) return;
     setBusy(true);
@@ -44,7 +49,7 @@ function GrantDialog({ customerRef, onClose, onDone }) {
     <Dialog label="Cấp quyền">
       <h3>Cấp quyền thủ công</h3>
       <div className="form">
-        <label>App<select aria-label="App" value={draft.app_id} onChange={set('app_id')}>{apps.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.id})</option>)}</select></label>
+        <label>App<select aria-label="App" value={draft.app_id} disabled={!!locked} onChange={set('app_id')}>{(lockedApp ? [lockedApp] : apps).map((a) => <option key={a.id} value={a.id}>{a.name} ({a.id})</option>)}</select></label>
         <label>Key<input aria-label="Key" value={draft.key} onChange={set('key')} /></label>
         <label>Hết hạn (UTC, bỏ trống = không hết hạn)<input aria-label="Hết hạn (UTC, bỏ trống = không hết hạn)" type="date" value={draft.until} onChange={set('until')} /></label>
         <label>Lý do<input aria-label="Lý do" maxLength={200} value={draft.reason} onChange={set('reason')} placeholder="ticket CS, lý do" /></label>
@@ -89,10 +94,13 @@ function ConfirmDialog({ label, text, warn, button, run, onClose, onDone }) {
 const sourceLabel = (e) => (e.source === 'manual' ? `thủ công #${e.source_id}` : `${e.source} ${e.source_id}`);
 
 // One customer (spec admin-console-p2 §3). Never the user_id: the API does not send it and this page renders
-// only the fields it names.
+// only the fields it names. Spec admin-console-p4a §3: under /apps/:id/customers/:ref every load (also the reload
+// after a grant, revoke or rotate) sends app_id, so the page shows only that app's data; the grant/revoke routes
+// answer with the entitlements of every app, which is why the page reloads instead of using that answer.
 export function CustomerDetail() {
   const { ref } = useParams();
   const { client } = useAuth();
+  const { appId, app } = useAppContext();
   const [c, setC] = useState(undefined);
   const [error, setError] = useState(null);
   const [notice, setNotice] = useState('');
@@ -101,12 +109,12 @@ export function CustomerDetail() {
 
   const load = useCallback(async () => {
     try {
-      const { customers } = await client.lookupCustomers({ customer_ref: ref });
+      const { customers } = await client.lookupCustomers(appId ? { customer_ref: ref, app_id: appId } : { customer_ref: ref });
       setC(customers[0] ?? null);
     } catch (err) {
       setError(err);
     }
-  }, [client, ref]);
+  }, [client, ref, appId]);
   useEffect(() => {
     load();
   }, [load]);
@@ -138,7 +146,7 @@ export function CustomerDetail() {
       <h1>{c.customer_ref}</h1>
       {notice && <p className="ok">{notice}</p>}
       <ErrorNote error={error} />
-      <p><Link to={`/audit?target=customer:${c.customer_ref}`}>Xem audit</Link></p>
+      <p><Link to={`${appId ? `/apps/${encodeURIComponent(appId)}` : ''}/audit?target=customer:${c.customer_ref}`}>Xem audit</Link></p>
 
       <section className="card" aria-label="Tóm tắt">
         <h2>Tóm tắt</h2>
@@ -280,7 +288,7 @@ export function CustomerDetail() {
       </section>
 
       {dialog === 'grant' && (
-        <GrantDialog customerRef={c.customer_ref} onClose={() => setDialog(null)} onDone={(r) => done(`Đã cấp ${r.grant.app_id}/${r.grant.key} (grant ${r.grant.id}).`)} />
+        <GrantDialog customerRef={c.customer_ref} lockedApp={appId ? { id: appId, name: app?.name ?? appId } : null} onClose={() => setDialog(null)} onDone={(r) => done(`Đã cấp ${r.grant.app_id}/${r.grant.key} (grant ${r.grant.id}).`)} />
       )}
       {dialog === 'rotate' && (
         <ConfirmDialog
diff --git a/apps/admin/src/pages/Customers.jsx b/apps/admin/src/pages/Customers.jsx
index 35777a5..32c76c8 100644
--- a/apps/admin/src/pages/Customers.jsx
+++ b/apps/admin/src/pages/Customers.jsx
@@ -1,5 +1,6 @@
 import { useRef, useState } from 'react';
 import { Link, useNavigate } from 'react-router';
+import { useAppContext } from '../app-context.jsx';
 import { useAuth } from '../auth.jsx';
 import { ErrorNote } from '../components/ErrorNote.jsx';
 import { fmtTime } from '../format.js';
@@ -17,10 +18,16 @@ export function lookupQuery(text) {
   return null;
 }
 
+// Where a customer's page is: inside the app when the console is in one (spec admin-console-p4a §3).
+export const customerPath = (appId, ref) => `${appId ? `/apps/${encodeURIComponent(appId)}` : ''}/customers/${ref}`;
+
 // Khách hàng (spec admin-console-p2 §3): one box, three kinds of input. One customer opens its page (the URL
-// carries the customer_ref, never the email); several are listed.
+// carries the customer_ref, never the email); several are listed. Spec admin-console-p4a §3 "Khách hàng trong
+// app": under /apps/:id/customers the same page sends app_id, so the server keeps only what the customer has in
+// that app (and drops customers with nothing there).
 export function Customers() {
   const { client } = useAuth();
+  const { appId, app } = useAppContext();
   const navigate = useNavigate();
   const [text, setText] = useState('');
   const [found, setFound] = useState(null);
@@ -43,9 +50,9 @@ export function Customers() {
     }
     setBusy(true);
     try {
-      const { customers } = await client.lookupCustomers(query);
+      const { customers } = await client.lookupCustomers(appId ? { ...query, app_id: appId } : query);
       if (mine !== latest.current) return;
-      if (customers.length === 1) navigate(`/customers/${customers[0].customer_ref}`);
+      if (customers.length === 1) navigate(customerPath(appId, customers[0].customer_ref));
       else setFound(customers);
     } catch (err) {
       if (mine === latest.current) setError(err);
@@ -56,14 +63,14 @@ export function Customers() {
 
   return (
     <section>
-      <h1>Khách hàng</h1>
+      <h1>{appId ? `Khách hàng của ${app?.name ?? appId}` : 'Khách hàng'}</h1>
       <form className="row" onSubmit={(e) => { e.preventDefault(); search(); }}>
         <input aria-label="Tìm khách" placeholder="email, cus_… hoặc checkout id" value={text} onChange={(e) => setText(e.target.value)} />
         <button type="submit" className="primary" disabled={busy}>Tìm</button>
       </form>
       {hint && <p className="warn">{hint}</p>}
       <ErrorNote error={error} />
-      {found && !found.length && <p className="muted">Không tìm thấy khách.</p>}
+      {found && !found.length && <p className="muted">{appId ? 'Không có khách nào của app này khớp.' : 'Không tìm thấy khách.'}</p>}
       {found?.length > 1 && (
         <table>
           <thead>
@@ -72,7 +79,7 @@ export function Customers() {
           <tbody>
             {found.map((c) => (
               <tr key={c.customer_ref} data-testid="customer">
-                <td><Link to={`/customers/${c.customer_ref}`}>{c.customer_ref}</Link></td>
+                <td><Link to={customerPath(appId, c.customer_ref)}>{c.customer_ref}</Link></td>
                 <td>{fmtTime(c.created_at)}</td>
                 <td>{c.entitlements.filter((e) => e.active).length}</td>
               </tr>
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/admin -- test/app-plans.test.jsx test/audit.test.jsx test/customers-app.test.jsx 2>&1 | grep -E "Test Files|Tests  "
npm test -w @ikf/admin 2>&1 | grep -E "Test Files|Tests  "
npm run build -w @ikf/admin 2>&1 | tail -1
```

Expected: `Tests  13 passed (13)`; toàn bộ admin `Test Files  25 passed (25)`, `Tests  197 passed (197)`; build `✓ built in …`.

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/App.jsx apps/admin/src/pages/AppPlans.jsx apps/admin/src/pages/Audit.jsx apps/admin/src/pages/CustomerDetail.jsx apps/admin/src/pages/Customers.jsx apps/admin/test/app-plans.test.jsx apps/admin/test/audit.test.jsx apps/admin/test/customers-app.test.jsx
git commit -m "feat(admin): plans, customers and audit inside an app; audit filter by app
```

---

---

### Task 12: Demo — 3 app mẫu, upload kèm app, purchase theo app của funnel đầu, e2e đợt 4a; README/runbook/CLAUDE.md

**Files:**
- Create: `demo/test/admin-p4a-e2e.test.mjs`
- Modify: `demo/lib/seed.mjs`, `demo/lib/funnels.mjs`, `demo/lib/stack.mjs`, `demo/lib/purchase.mjs`, `demo/server/index.mjs`, `demo/server/app-page.mjs`, `demo/run.mjs`, `demo/README.md`, `docs/runbooks/admin-console.md`, `CLAUDE.md`
- Test: `demo/test/admin-p4a-e2e.test.mjs` (mới), `demo/test/seed.test.mjs`, `demo/test/funnels.test.mjs`, `demo/test/server.test.mjs`, `demo/test/purchase.test.mjs`, `demo/test/admin-p2-e2e.test.mjs`, `demo/test/admin-p3-e2e.test.mjs` (sửa)

**Interfaces:**
- Consumes: `POST /v1/apps` (chỉ đăng ký khi `buildApp` có `deps.webhookSecrets`; URL phải `https`), `POST /v1/funnels/:slug/versions {html, sha256, app_id}` (Task 2: slug mới thiếu `app_id` → `400 app_required`; funnel chưa gán + `app_id` → gán; khác app → `409 funnel_app_mismatch`), `PUT /v1/funnels/:slug {app_id}`, `PUT /v1/domains/:host {app_id}` và `409 domain_app_mismatch {host_app, funnel_app}` (Task 3), `GET /v1/apps/:id/summary` (Task 4); SPA: `<select data-testid="app-switcher" aria-label="App">`, `/apps/:id` (`kpis`, `overview-row`, `app-domains`), `/apps/:id/funnels` (`create-funnel`, `locked-app`, nút `New funnel`), PublishDialog (`Host` chỉ gồm domain của app + dùng chung), Dashboard `app-row` (Task 8–10); `seedSample`, `rewriteMedia`, `startStack`.
- Produces: `demo/lib/seed.mjs` export `DEMO_APPS = { 'moon-reading': 'starlyn', 'calmio-calm-kids': 'calmio', 'ewa-books': 'ewa' }`, `appFor(slug)` (ngoài 3 funnel → `'demo'`), `ensureApps({request, pool, base, slugs})` → mảng id (3 app mẫu + `demo` khi cần; 409 → `UPDATE apps` URL như cũ), `seedPurchase({request, funnel})` → id app của funnel (chỉ còn map giá; bỏ `DEMO_APP`, không code nào khác import); `demo/lib/funnels.mjs` export `uploadVersion(request, {slug, html, sha256})` (gửi `app_id: appFor(slug)`; `409 funnel_app_mismatch` → `PUT /v1/funnels/:slug {app_id}` rồi upload lại); `demo/lib/purchase.mjs` export `memorySecrets()`; `startStack` truyền `webhookSecrets: memorySecrets()` ở mọi chế độ, gọi `ensureApps` trước `publishFunnels` (base = `purchase.base` hoặc `https://demo.test`), `purchase.app`; `startDemoServer({…, app = appFor(funnel)})`, `appPage(app)`.

Ghi chú:
- `POST /v1/apps` chỉ có khi `buildApp` nhận `deps.webhookSecrets` (trước đây chỉ chế độ purchase) — không có thì `npm run demo` thường trả 404 cho `/v1/apps` và ô chọn app rỗng. Demo giờ luôn truyền một kho secret trong bộ nhớ (`memorySecrets()`, tách từ `purchaseDeps`), chỉ qua `buildApp({deps})`.
- Core đòi `https` cho `adjust_tracker_url`/`webhook_url`; ngoài chế độ purchase không có gì phục vụ trang app giả, nên base là `https://demo.test` (chỉ để hợp lệ).
- `PUT /v1/routes/localhost` trả `400 bad_request` (`hostParams` cần dấu chấm), nên e2e publish lên `demo.localhost` (`ADMIN_DEMO_HOST`, dùng chung) thay vì `localhost`; dropdown vẫn liệt kê `localhost` (domain dùng chung do demo chèn bằng SQL).
- DB của demo cũ có funnel đã ở app khác (`demo:purchase` cũ chuyển funnel đầu sang `starlyn`) → upload trả `409 funnel_app_mismatch`; `uploadVersion` chuyển funnel về app mẫu qua `PUT` rồi upload lại.
- Purchase demo: `witch-power` không thuộc 3 funnel mẫu → app `demo`, scheme `demo://open`; trang app giả hỏi check-purchased với `bundle_id` = app đó (trước cố định `starlyn`).
- e2e xoá DB Postgres `ikf_admin_p4a_test` ở đầu mỗi lần chạy (`DROP DATABASE … WITH (FORCE)`, sau `ensureDocker` + `composeUp`) để upload đầu luôn đi đường slug mới (`app_id`) và `p4a-test` tạo lại được.
- DB `ikf_demo_test` tạo trước khi `004_entitlements.sql` có cột `handoff` (migration sửa tại chỗ trước release) làm `POST /v1/apps` trả 500 trong `demo.test.mjs`; xoá DB đó một lần (`docker exec ikf-demo-postgres-1 psql -U ikf -d ikf -c "DROP DATABASE ikf_demo_test"`), test tự tạo lại.

- [ ] **Step 1: Viết test fail**

`demo/test/admin-p4a-e2e.test.mjs` (mới):

`demo/test/admin-p4a-e2e.test.mjs` (mới):

```js
// Admin console đợt 4a end to end (spec admin-console-p4a "Điều kiện xong", §4) on the real demo stack, in Chromium:
// the switcher lists the three sample apps → an app's Tổng quan has its funnel with sessions and its Domains card →
// a funnel created inside the app (app fixed) → upload → publish on a shared host → a host of another app is not
// offered and the API refuses it (domain_app_mismatch) → the global Dashboard has one row per app. Own ports and
// databases; the Postgres one is dropped first, so the first uploads always take the new-slug path (app_id).
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Writable } from 'node:stream';
import { describe, it, expect, afterAll } from 'vitest';
import pg from 'pg';
import { chromium } from 'playwright';
import { composeUp, ensureDocker } from '../lib/docker.mjs';
import { DEFAULT_FUNNELS, DEFAULT_FUNNELS_DIR, findFunnels } from '../lib/funnels.mjs';
import { rewriteMedia } from '../lib/media.mjs';
import { seedSample } from '../lib/sample.mjs';
import { appFor, DEMO_APPS } from '../lib/seed.mjs';
import { ADMIN_DEMO_HOST, DEMO_TOKEN, PG, startStack } from '../lib/stack.mjs';

const FUNNELS_DIR = process.env.IKF_FUNNELS_DIR || DEFAULT_FUNNELS_DIR;
const FUNNELS = DEFAULT_FUNNELS; // ewa-books, calmio-calm-kids, moon-reading: one per sample app
const found = existsSync(FUNNELS_DIR) ? await findFunnels(FUNNELS_DIR) : null;
const skipReason = !found ? `funnels folder not found: ${FUNNELS_DIR}` : FUNNELS.filter((f) => !found.has(f)).map((f) => `${f} missing`).join(', ');
if (skipReason) console.warn(`admin p4a e2e skipped: ${skipReason}`);

const PORTS = { edge: 8897, core: 8198, media: 8899, proxy: 8898, demo: 8901, admin: 8902 };
const DB = 'ikf_admin_p4a_test';
const ADMIN_USER = 'e2e-p4a@ikameglobal.com';
const SOURCE = 'moon-reading'; // its demo.html is the new funnel's content
const APP = appFor(SOURCE); // starlyn
const SLUG = 'p4a-test';
const OTHER_HOST = 'other.localhost';
const num = (s) => Number(s.replace(/,/g, ''));
const core = (method, path, body) =>
  fetch(`http://127.0.0.1:${PORTS.core}${path}`, {
    method, headers: { authorization: `Bearer ${DEMO_TOKEN}`, 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body),
  }).then(async (r) => ({ status: r.status, json: await r.json() }));

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

// A fresh database on every run: p4a-test is created anew and every funnel's first upload carries its app.
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

describe.skipIf(skipReason)('admin console đợt 4a e2e', () => {
  it('switcher → app overview with sessions → funnel in the app → upload → publish on a shared host; another app\'s host refused; a row per app', async () => {
    await dropDb();
    stack = await startStack({
      funnels: FUNNELS, ports: PORTS, lan: false, pgDatabase: DB, chDatabase: DB, logStream,
      adminUser: ADMIN_USER, adminBuildDir: new URL('../.build/admin-p4a/', import.meta.url).pathname,
    });
    pool = new pg.Pool({ ...PG, database: DB, max: 2 });
    expect((await seedSample({ clickhouse: stack.clickhouse, pool, funnels: FUNNELS })).sessions).toBeGreaterThan(0);

    // The demo put each funnel in its sample app on the first upload (no app_required); the hosts stay shared.
    expect((await core('GET', '/v1/apps')).json.apps.map((a) => a.id).sort()).toEqual(['calmio', 'ewa', 'starlyn']);
    for (const f of FUNNELS) expect((await core('GET', `/v1/funnels/${f}`)).json.app_id, f).toBe(DEMO_APPS[f]);
    expect((await core('GET', '/v1/domains?app=none')).json.domains.map((d) => d.host).sort()).toEqual([ADMIN_DEMO_HOST, 'localhost']);

    // Sign in; the switcher lists "Tất cả app" and the three apps.
    browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`${stack.adminUrl}/`);
    await page.getByRole('link', { name: 'Đăng nhập bằng Google' }).click();
    await page.getByRole('heading', { name: 'Dashboard' }).waitFor();
    const switcher = page.getByTestId('app-switcher');
    await expect.poll(() => switcher.locator('option').count()).toBe(4);
    expect((await switcher.locator('option').allTextContents()).sort()).toEqual(['Calmio (demo)', 'Ewa (demo)', 'Starlyn (demo)', 'Tất cả app']);

    // Starlyn's Tổng quan: KPI row, moon-reading with sessions, the Domains card.
    await switcher.selectOption(APP);
    await page.waitForURL(`${stack.adminUrl}/apps/${APP}`);
    await page.getByRole('heading', { name: 'Starlyn (demo)' }).waitFor();
    await page.getByTestId('kpis').waitFor();
    const row = page.getByTestId('overview-row').filter({ hasText: SOURCE });
    await expect.poll(() => row.count()).toBe(1);
    const cells = await row.locator('td').allTextContents();
    expect(cells[0]).toBe(SOURCE);
    expect(num(cells[1])).toBeGreaterThan(0);
    await page.getByTestId('app-domains').getByRole('heading', { name: 'Domains' }).waitFor();

    // Funnels in the app: create p4a-test, the app fixed (shown as text, no picker).
    await page.getByRole('link', { name: 'Funnels', exact: true }).click();
    await page.waitForURL(`${stack.adminUrl}/apps/${APP}/funnels`);
    const create = page.getByTestId('create-funnel');
    expect(await create.getByTestId('locked-app').textContent()).toBe('App: Starlyn (demo)');
    expect(await create.getByRole('combobox').count()).toBe(0);
    await create.getByPlaceholder('slug-moi').fill(SLUG);
    await create.getByRole('button', { name: 'New funnel' }).click();
    await page.getByRole('heading', { name: SLUG }).waitFor();
    expect((await core('GET', `/v1/funnels/${SLUG}`)).json.app_id).toBe(APP);

    // Upload moon-reading's demo.html as p4a-test (images on the demo media server, CONFIG.funnel = the new slug).
    const source = await readFile(join(found.get(SOURCE), 'demo.html'), 'utf8');
    const html = rewriteMedia(source, SOURCE, stack.mediaBase).replace(/(CONFIG\s*=\s*\{[\s\S]*?\bfunnel\s*:\s*)(['"])moon-reading\2/, `$1$2${SLUG}$2`);
    expect(html).not.toBe(source);
    await page.getByLabel('Chọn demo.html').setInputFiles({ name: 'demo.html', mimeType: 'text/html', buffer: Buffer.from(html) });
    await page.getByText('Đã tạo v1.').waitFor();

    // Another app's host (made through the API, like `ikf domain set other.localhost --app calmio`).
    expect((await core('PUT', `/v1/domains/${OTHER_HOST}`, { app_id: 'calmio' })).json).toMatchObject({ host: OTHER_HOST, status: 'active', app_id: 'calmio' });

    // Publish: the dialog offers the app's hosts and the shared ones only. demo.localhost (shared) works; plain
    // localhost is listed but core's host pattern needs a dot, so the console publishes on the dotted demo host.
    await page.getByTestId('version').first().getByRole('button', { name: 'Publish' }).click();
    const dialog = page.getByRole('dialog');
    const hostSelect = dialog.getByLabel('Host');
    await expect.poll(() => hostSelect.locator('option').count()).toBe(2);
    expect((await hostSelect.locator('option').allTextContents()).sort()).toEqual([ADMIN_DEMO_HOST, 'localhost']);
    await hostSelect.selectOption(ADMIN_DEMO_HOST);
    await dialog.getByLabel('Prefix').fill(`/${SLUG}`);
    await dialog.getByRole('button', { name: 'Xác nhận publish' }).click();
    await page.getByText(new RegExp(`^Đã publish v1: https://${ADMIN_DEMO_HOST}/${SLUG} `)).waitFor();
    expect((await core('GET', `/v1/routes/${ADMIN_DEMO_HOST}`)).json.routes).toEqual(expect.arrayContaining([expect.objectContaining({ prefix: `/${SLUG}`, funnel: SLUG, v: 1 })]));
    const summary = (await core('GET', `/v1/apps/${APP}/summary`)).json;
    expect(summary.funnels.find((f) => f.slug === SLUG)).toMatchObject({ latest_v: 1, live: [{ host: ADMIN_DEMO_HOST, prefix: `/${SLUG}`, v: 1 }] });

    // The API refuses the other app's host too.
    const refused = await core('PUT', `/v1/routes/${OTHER_HOST}`, { prefix: '/x', funnel: SLUG, v: 1 });
    expect(refused).toEqual({ status: 409, json: { error: 'domain_app_mismatch', detail: { host_app: 'calmio', funnel_app: APP } } });

    // The global Dashboard: one row per app.
    await switcher.selectOption('');
    await page.waitForURL(`${stack.adminUrl}/`);
    await expect.poll(() => page.getByTestId('app-row').count()).toBe(3);
    expect((await page.getByTestId('app-row').locator('td:first-child').allTextContents()).sort()).toEqual(['Calmio (demo)', 'Ewa (demo)', 'Starlyn (demo)']);

    expect(logs).not.toContain(ADMIN_USER);
  });
});
```

`demo/test/seed.test.mjs`, `demo/test/funnels.test.mjs`, `demo/test/server.test.mjs` (sửa, áp dụng đúng diff này):

`demo/test/seed.test.mjs`, `demo/test/funnels.test.mjs`, `demo/test/server.test.mjs` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/demo/test/funnels.test.mjs b/demo/test/funnels.test.mjs
index 8a7ff2d..bfc7ba2 100644
--- a/demo/test/funnels.test.mjs
+++ b/demo/test/funnels.test.mjs
@@ -3,7 +3,7 @@ import { tmpdir } from 'node:os';
 import { join } from 'node:path';
 import { describe, it, expect } from 'vitest';
 import { DemoError } from '../lib/docker.mjs';
-import { findFunnels, pickFunnels } from '../lib/funnels.mjs';
+import { findFunnels, pickFunnels, uploadVersion } from '../lib/funnels.mjs';
 
 function tree() {
   const root = mkdtempSync(join(tmpdir(), 'ikf-funnels-'));
@@ -43,3 +43,44 @@ describe('pickFunnels', () => {
     expect(() => pickFunnels(index, ['ewa-books', 'nope'])).toThrow(/CONFIG.funnel = nope\. Some that exist: ewa-books, testlibrary-adhd/);
   });
 });
+
+// Spec admin-console-p4a §4: a new slug needs app_id on its first upload; a funnel an earlier demo run left in
+// another app (demo:purchase used to move its funnel to starlyn) goes back to its demo app through PUT first.
+describe('uploadVersion', () => {
+  function fakeCore(replies) {
+    const calls = [];
+    const request = async (method, path, body) => {
+      calls.push([method, path, body]);
+      return replies.shift();
+    };
+    return { calls, request };
+  }
+  const body = { html: '<p>x</p>', sha256: 'abc' };
+
+  it('sends the funnel\'s demo app with the upload', async () => {
+    const f = fakeCore([{ status: 201, json: { v: 1, created: true } }]);
+    expect(await uploadVersion(f.request, { slug: 'moon-reading', ...body })).toEqual({ v: 1, created: true });
+    expect(f.calls).toEqual([['POST', '/v1/funnels/moon-reading/versions', { ...body, app_id: 'starlyn' }]]);
+  });
+
+  it('funnel_app_mismatch: moves the funnel back to its demo app, then uploads again', async () => {
+    const f = fakeCore([
+      { status: 409, json: { error: 'funnel_app_mismatch' } },
+      { status: 200, json: {} },
+      { status: 200, json: { v: 3, created: false } },
+    ]);
+    expect(await uploadVersion(f.request, { slug: 'ewa-books', ...body })).toEqual({ v: 3, created: false });
+    expect(f.calls).toEqual([
+      ['POST', '/v1/funnels/ewa-books/versions', { ...body, app_id: 'ewa' }],
+      ['PUT', '/v1/funnels/ewa-books', { app_id: 'ewa' }],
+      ['POST', '/v1/funnels/ewa-books/versions', { ...body, app_id: 'ewa' }],
+    ]);
+  });
+
+  it('any other error stops the demo with the response', async () => {
+    const f = fakeCore([{ status: 400, json: { error: 'app_required' } }]);
+    const err = await uploadVersion(f.request, { slug: 'witch-power', ...body }).catch((e) => e);
+    expect(err).toBeInstanceOf(DemoError);
+    expect(err.message).toBe('POST /v1/funnels/witch-power/versions -> 400 {"error":"app_required"}');
+  });
+});
diff --git a/demo/test/seed.test.mjs b/demo/test/seed.test.mjs
index 2d68205..5b117bf 100644
--- a/demo/test/seed.test.mjs
+++ b/demo/test/seed.test.mjs
@@ -1,7 +1,7 @@
 import { describe, it, expect } from 'vitest';
 import { DemoError } from '../lib/docker.mjs';
 import { DEMO_PRICES } from '../lib/paddle-fake.mjs';
-import { seedPurchase } from '../lib/seed.mjs';
+import { appFor, DEMO_APPS, ensureApps, seedPurchase } from '../lib/seed.mjs';
 
 // Records the core API calls and the SQL; reply(method path) decides the status.
 function fakes(status = {}) {
@@ -16,41 +16,76 @@ function fakes(status = {}) {
   return { calls, sql, request, pool };
 }
 
-const APP = {
-  id: 'starlyn', name: 'Starlyn (demo)', kind: 'app', handoff: 'user_id', deeplink_scheme: 'starlyn',
-  adjust_tracker_url: 'https://demo.test/_demo/app', webhook_url: 'https://demo.test/_demo/null',
-};
+const app = (id, name, base = 'https://demo.test') => ({
+  id, name, kind: 'app', handoff: 'user_id', deeplink_scheme: id,
+  adjust_tracker_url: `${base}/_demo/app`, webhook_url: `${base}/_demo/null`,
+});
+const UPDATE = "UPDATE apps SET adjust_tracker_url = $2, webhook_url = $3, deeplink_scheme = $4, handoff = 'user_id', deeplink_path = 'open' WHERE id = $1";
 
-describe('seedPurchase', () => {
-  it('creates the app (handoff user_id), attaches the funnel and maps 1w → premium, addon → tarot_2027 through the API', async () => {
+describe('appFor', () => {
+  it('maps the three default funnels to their sample apps and any other funnel to "demo"', () => {
+    expect(DEMO_APPS).toEqual({ 'moon-reading': 'starlyn', 'calmio-calm-kids': 'calmio', 'ewa-books': 'ewa' });
+    expect(['moon-reading', 'calmio-calm-kids', 'ewa-books', 'witch-power'].map(appFor)).toEqual(['starlyn', 'calmio', 'ewa', 'demo']);
+  });
+});
+
+describe('ensureApps', () => {
+  it('creates the three sample apps (handoff user_id, fake tracker + scheme) through the API', async () => {
     const f = fakes({ 'POST /v1/apps': 201 });
-    await seedPurchase({ request: f.request, pool: f.pool, base: 'https://demo.test', funnel: 'witch-power' });
+    expect(await ensureApps({ request: f.request, pool: f.pool, base: 'https://demo.test', slugs: ['ewa-books', 'moon-reading'] }))
+      .toEqual(['starlyn', 'calmio', 'ewa']);
     expect(f.calls).toEqual([
-      ['POST', '/v1/apps', APP],
-      ['PUT', '/v1/funnels/witch-power', { app_id: 'starlyn' }],
-      ['PUT', '/v1/funnels/witch-power/prices', {
-        plans: {
-          '1w': { price_id: DEMO_PRICES['1w'].id, entitlement_key: 'premium' },
-          addon: { price_id: DEMO_PRICES.addon.id, entitlement_key: 'tarot_2027' },
-        },
-      }],
+      ['POST', '/v1/apps', app('starlyn', 'Starlyn (demo)')],
+      ['POST', '/v1/apps', app('calmio', 'Calmio (demo)')],
+      ['POST', '/v1/apps', app('ewa', 'Ewa (demo)')],
     ]);
     expect(f.sql).toEqual([]);
   });
 
+  it('adds the "demo" app only when a funnel outside the three needs it', async () => {
+    const f = fakes({ 'POST /v1/apps': 201 });
+    expect(await ensureApps({ request: f.request, pool: f.pool, base: 'https://demo.test', slugs: ['witch-power'] }))
+      .toEqual(['starlyn', 'calmio', 'ewa', 'demo']);
+    expect(f.calls.at(-1)).toEqual(['POST', '/v1/apps', app('demo', 'Demo (demo)')]);
+  });
+
   it('idempotent: an existing app gets this run\'s URLs (the tunnel URL changes every run)', async () => {
     const f = fakes({ 'POST /v1/apps': 409 });
-    await seedPurchase({ request: f.request, pool: f.pool, base: 'https://new-words.trycloudflare.com', funnel: 'witch-power' });
-    expect(f.sql).toEqual([[
-      "UPDATE apps SET adjust_tracker_url = $2, webhook_url = $3, deeplink_scheme = $4, handoff = 'user_id', deeplink_path = 'open' WHERE id = $1",
-      ['starlyn', 'https://new-words.trycloudflare.com/_demo/app', 'https://new-words.trycloudflare.com/_demo/null', 'starlyn'],
-    ]]);
-    expect(f.calls.map((c) => c[1])).toEqual(['/v1/apps', '/v1/funnels/witch-power', '/v1/funnels/witch-power/prices']);
+    await ensureApps({ request: f.request, pool: f.pool, base: 'https://new-words.trycloudflare.com', slugs: [] });
+    const urls = ['https://new-words.trycloudflare.com/_demo/app', 'https://new-words.trycloudflare.com/_demo/null'];
+    expect(f.sql).toEqual([
+      [UPDATE, ['starlyn', ...urls, 'starlyn']],
+      [UPDATE, ['calmio', ...urls, 'calmio']],
+      [UPDATE, ['ewa', ...urls, 'ewa']],
+    ]);
+  });
+
+  it('any other API error stops the demo with the response', async () => {
+    const f = fakes({ 'POST /v1/apps': 422 });
+    const err = await ensureApps({ request: f.request, pool: f.pool, base: 'https://demo.test', slugs: [] }).catch((e) => e);
+    expect(err).toBeInstanceOf(DemoError);
+    expect(err.message).toBe('POST /v1/apps -> 422 {"error":"boom"}');
+  });
+});
+
+describe('seedPurchase', () => {
+  it('maps 1w → premium, addon → tarot_2027 on the funnel through the API and names the funnel\'s app', async () => {
+    const f = fakes();
+    expect(await seedPurchase({ request: f.request, funnel: 'moon-reading' })).toBe('starlyn');
+    expect(f.calls).toEqual([
+      ['PUT', '/v1/funnels/moon-reading/prices', {
+        plans: {
+          '1w': { price_id: DEMO_PRICES['1w'].id, entitlement_key: 'premium' },
+          addon: { price_id: DEMO_PRICES.addon.id, entitlement_key: 'tarot_2027' },
+        },
+      }],
+    ]);
+    expect(await seedPurchase({ request: f.request, funnel: 'witch-power' })).toBe('demo');
   });
 
   it('any other API error stops the demo with the response', async () => {
     const f = fakes({ 'PUT /v1/funnels/witch-power/prices': 422 });
-    const err = await seedPurchase({ request: f.request, pool: f.pool, base: 'https://demo.test', funnel: 'witch-power' }).catch((e) => e);
+    const err = await seedPurchase({ request: f.request, funnel: 'witch-power' }).catch((e) => e);
     expect(err).toBeInstanceOf(DemoError);
     expect(err.message).toBe('PUT /v1/funnels/witch-power/prices -> 422 {"error":"boom"}');
   });
diff --git a/demo/test/server.test.mjs b/demo/test/server.test.mjs
index 0c451c0..1703ae0 100644
--- a/demo/test/server.test.mjs
+++ b/demo/test/server.test.mjs
@@ -54,6 +54,8 @@ describe('demo server (/_demo/*)', () => {
     const app = await (await get('/_demo/app?deep_link=x')).text();
     expect(app).toContain('function pickUserId');
     expect(app).toContain("fetch('/_demo/sdk-contract.json'");
+    // Spec admin-console-p4a §4: the fake app asks for the purchase funnel's app (witch-power → demo), not starlyn.
+    expect(app).toContain('body[C.request_app_field] = "demo";');
     expect(await (await get('/_demo/')).text()).toContain('/witch-power');
     expect(await (await get('/_demo/sdk-contract.json')).json()).toEqual(contractJson());
   });
PATCH
```

`demo/test/purchase.test.mjs`, `demo/test/admin-p2-e2e.test.mjs` (app của `witch-power` giờ là `demo`), `demo/test/admin-p3-e2e.test.mjs` (bảng từng funnel chuyển từ Dashboard sang Tổng quan app, chọn qua switcher) (sửa, áp dụng đúng diff này):

`demo/test/purchase.test.mjs`, `demo/test/admin-p2-e2e.test.mjs`, `demo/test/admin-p3-e2e.test.mjs` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/demo/test/admin-p2-e2e.test.mjs b/demo/test/admin-p2-e2e.test.mjs
index 205890e..15b6f83 100644
--- a/demo/test/admin-p2-e2e.test.mjs
+++ b/demo/test/admin-p2-e2e.test.mjs
@@ -13,10 +13,13 @@ import { createSession, SESSION_COOKIE } from '../../services/core-api/src/admin
 import { PATH, REQUEST_USER_ID_FIELD, RESPONSE_EXPIRES_FIELD, RESPONSE_IS_PRO_FIELD } from '../../services/core-api/src/identity/sdk-contract.js';
 import { DEMO_SUPPORT_USER } from '../lib/admin.mjs';
 import { DEFAULT_FUNNELS_DIR, findFunnels } from '../lib/funnels.mjs';
+import { appFor } from '../lib/seed.mjs';
 import { DEMO_TOKEN, PG, startStack } from '../lib/stack.mjs';
 
 const FUNNELS_DIR = process.env.IKF_FUNNELS_DIR || DEFAULT_FUNNELS_DIR;
 const FUNNEL = 'witch-power';
+// The purchase funnel's app (spec admin-console-p4a §4): witch-power is not one of the three sample funnels → "demo".
+const APP = appFor(FUNNEL);
 const skipReason = !existsSync(FUNNELS_DIR) ? `funnels folder not found: ${FUNNELS_DIR}` : !(await findFunnels(FUNNELS_DIR)).has(FUNNEL) ? `${FUNNEL} missing` : '';
 if (skipReason) console.warn(`admin p2 e2e skipped: ${skipReason}`);
 
@@ -134,12 +137,12 @@ describe.skipIf(skipReason)('admin console phase 2 e2e', () => {
     const purchases = csPage.getByRole('region', { name: 'Mua hàng' });
     await purchases.getByText(created.checkout_id).waitFor();
     expect(await purchases.getByText(`${FUNNEL}@v${v} 1w`).count()).toBe(1);
-    await csPage.getByRole('region', { name: 'Quyền' }).getByText('starlyn/premium').waitFor();
+    await csPage.getByRole('region', { name: 'Quyền' }).getByText(`${APP}/premium`).waitFor();
     expect(await csPage.getByRole('region', { name: 'Hành động admin' }).getByRole('button', { name: 'Cấp quyền' }).isDisabled()).toBe(true);
     const csWrite = await fetch(`http://localhost:${PORTS.core}/v1/customers/${ref}/grants`, {
       method: 'POST',
       headers: { cookie: `${SESSION_COOKIE}=${support.token}`, 'x-ikf-csrf': support.csrf, 'content-type': 'application/json' },
-      body: JSON.stringify({ app_id: 'starlyn', key: 'premium', reason: 'support may not' }),
+      body: JSON.stringify({ app_id: APP, key: 'premium', reason: 'support may not' }),
     });
     expect(csWrite.status).toBe(403);
 
@@ -147,10 +150,10 @@ describe.skipIf(skipReason)('admin console phase 2 e2e', () => {
     await admin.goto(`${stack.adminUrl}/customers/${ref}`);
     await admin.getByRole('region', { name: 'Hành động admin' }).getByRole('button', { name: 'Cấp quyền' }).click();
     const grant = admin.getByRole('dialog');
-    await grant.getByLabel('App').selectOption('starlyn');
+    await grant.getByLabel('App').selectOption(APP);
     await grant.getByLabel('Lý do').fill('e2e: goodwill');
     await grant.getByRole('button', { name: 'Xác nhận cấp quyền' }).click();
-    const granted = await admin.getByText(/^Đã cấp starlyn\/premium \(grant \d+\)\.$/).textContent();
+    const granted = await admin.getByText(new RegExp(`^Đã cấp ${APP}/premium \\(grant \\d+\\)\\.$`)).textContent();
     const grantId = /grant (\d+)/.exec(granted)[1];
     expect(await app(oldUid)).toEqual({ pro: true, expires: null });
     await admin.getByRole('button', { name: `Thu hồi #${grantId}` }).click();
diff --git a/demo/test/admin-p3-e2e.test.mjs b/demo/test/admin-p3-e2e.test.mjs
index ac09c94..7790548 100644
--- a/demo/test/admin-p3-e2e.test.mjs
+++ b/demo/test/admin-p3-e2e.test.mjs
@@ -9,6 +9,7 @@ import pg from 'pg';
 import { chromium } from 'playwright';
 import { DEFAULT_FUNNELS_DIR, findFunnels } from '../lib/funnels.mjs';
 import { seedSample } from '../lib/sample.mjs';
+import { appFor } from '../lib/seed.mjs';
 import { DEMO_TOKEN, PG, startStack } from '../lib/stack.mjs';
 
 const FUNNELS_DIR = process.env.IKF_FUNNELS_DIR || DEFAULT_FUNNELS_DIR;
@@ -57,22 +58,24 @@ describe.skipIf(skipReason)('admin console phase 3 e2e', () => {
     expect(stats.versions).toEqual(expect.arrayContaining([1, 2]));
     expect(stats.milestones.paid).toBeGreaterThan(0);
 
-    // The console: Dashboard first.
+    // The console: Dashboard first. Since admin-console-p4a §3 the per-funnel table is on each app's Tổng quan
+    // (/apps/:id, picked in the switcher); ewa-books and moon-reading are in two apps (seed.mjs appFor).
     browser = await chromium.launch();
     const page = await browser.newPage();
     await page.goto(`${stack.adminUrl}/`);
     await page.getByRole('link', { name: 'Đăng nhập bằng Google' }).click();
     await page.getByRole('heading', { name: 'Dashboard' }).waitFor();
     const rows = page.getByTestId('overview-row');
-    await expect.poll(() => rows.count()).toBeGreaterThanOrEqual(2);
-    for (const f of FUNNELS) {
+    for (const f of [...FUNNELS].reverse()) {
+      await page.getByTestId('app-switcher').selectOption(appFor(f));
+      await expect.poll(() => rows.filter({ hasText: f }).count()).toBe(1);
       const cells = await rows.filter({ hasText: f }).locator('td').allTextContents();
       expect(cells[0]).toBe(f);
       expect(cells.slice(1, 5).map(num).every((n) => n > 0), `${f}: ${cells}`).toBe(true);
       expect(cells[6]).not.toBe('—');
     }
 
-    // A funnel's Số liệu tab (the default one).
+    // A funnel's Số liệu tab (the default one); FUNNELS[0]'s app is the one picked last.
     await rows.filter({ hasText: FUNNELS[0] }).getByRole('link', { name: FUNNELS[0] }).click();
     await page.getByRole('heading', { name: FUNNELS[0] }).waitFor();
     expect(await page.getByRole('tab', { name: 'Số liệu' }).getAttribute('aria-selected')).toBe('true');
diff --git a/demo/test/purchase.test.mjs b/demo/test/purchase.test.mjs
index fadd116..9ad4573 100644
--- a/demo/test/purchase.test.mjs
+++ b/demo/test/purchase.test.mjs
@@ -88,7 +88,8 @@ describe.skipIf(skipReason)('npm run demo:purchase (no tunnel, host https://demo
       const r = await http('GET', `/v1/checkout/${checkoutId}/claim`);
       return r.status === 200 && r.json.app_link;
     }, 20_000);
-    expect(appLink).toMatch(new RegExp(`^${BASE}/_demo/app\\?deep_link=starlyn%3A%2F%2Fopen%3Fuser_id%3D[0-9a-f-]{36}$`));
+    // witch-power's app is "demo" (seed.mjs appFor; spec admin-console-p4a §4), its deep link scheme too.
+    expect(appLink).toMatch(new RegExp(`^${BASE}/_demo/app\\?deep_link=demo%3A%2F%2Fopen%3Fuser_id%3D[0-9a-f-]{36}$`));
     const userId = new URL(new URL(appLink).searchParams.get('deep_link')).searchParams.get('user_id');
 
     // The link appears only once the entitlement exists, so the app's first check already says pro.
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npx vitest run --config demo/vitest.config.mjs test/seed.test.mjs test/funnels.test.mjs test/server.test.mjs 2>&1 | grep -E "×|Test Files|Tests  "
npx vitest run --config demo/vitest.config.mjs test/admin-p4a-e2e.test.mjs 2>&1 | grep -E "Error|Test Files|Tests  "
```

Expected: `Test Files  3 failed (3)`, `Tests  10 failed | 20 passed (30)`: `appFor`/`ensureApps`/`uploadVersion` chưa có, `seedPurchase` còn tạo app `starlyn` và `PUT` funnel, trang app giả còn gửi `'starlyn'`. e2e: `TypeError: (0 , appFor) is not a function`, `Tests  no tests`. Trước task, `npm run demo:test` cũng đỏ: `Test Files  2 failed | 20 passed (22)`, `Tests  2 failed | 122 passed (124)` — `admin-p3-e2e` (Dashboard không còn `overview-row`: `expected 0 to be greater than or equal to 2`) và `admin-p2-e2e` (chờ `Đã lưu giá.` quá 30 s; chạy riêng thì pass — chập chờn, không do task này).

- [ ] **Step 3: Implement**

`demo/lib/seed.mjs`, `demo/lib/funnels.mjs`, `demo/lib/purchase.mjs`, `demo/lib/stack.mjs`, `demo/server/index.mjs`, `demo/server/app-page.mjs`, `demo/run.mjs` (sửa, áp dụng đúng diff này):

`demo/lib/seed.mjs`, `demo/lib/funnels.mjs`, `demo/lib/purchase.mjs`, `demo/lib/stack.mjs`, `demo/server/index.mjs`, `demo/server/app-page.mjs`, `demo/run.mjs` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/demo/lib/funnels.mjs b/demo/lib/funnels.mjs
index b46664e..e9d8236 100644
--- a/demo/lib/funnels.mjs
+++ b/demo/lib/funnels.mjs
@@ -8,6 +8,7 @@ import { bundleKey, sha256Hex } from '../../services/core-api/src/publisher/publ
 import { listRoutes, removeRoute, setRoute } from '../../services/core-api/src/publisher/routes.js';
 import { DemoError } from './docker.mjs';
 import { rewriteMedia } from './media.mjs';
+import { appFor, coreRequest } from './seed.mjs';
 
 export const DEFAULT_FUNNELS_DIR = join(homedir(), 'ikame/funnel/funnel-development');
 // Three real funnels with CONFIG.funnel and an img/ folder: a dataLayer + ikfunnel:* funnel, one
@@ -45,7 +46,7 @@ export function pickFunnels(index, slugs) {
 }
 
 // Same SQL as PUT /v1/domains/:host. Done directly because core's host schema needs a dot,
-// so the API rejects "localhost".
+// so the API rejects "localhost". The hosts stay shared (app_id NULL): every demo app publishes there.
 export async function registerHosts(pool, hosts) {
   for (const host of hosts) {
     await pool.query("INSERT INTO domains (host, status) VALUES ($1, 'active') ON CONFLICT (host) DO UPDATE SET status = 'active'", [host]);
@@ -64,12 +65,31 @@ async function api(base, token, method, path, body) {
   return json;
 }
 
+// One upload with the funnel's demo app (spec admin-console-p4a §2: a new slug's first upload needs app_id; on an
+// existing funnel with no app it assigns one). A funnel an earlier run left in another app (demo:purchase used to
+// move its funnel to starlyn) answers 409 funnel_app_mismatch: move it back with PUT (the only way to change an
+// app), then upload again. request: coreRequest(coreUrl, token).
+export async function uploadVersion(request, { slug, html, sha256 }) {
+  const body = { html, sha256, app_id: appFor(slug) };
+  const path = `/v1/funnels/${slug}/versions`;
+  let r = await request('POST', path, body);
+  if (r.status === 409 && r.json.error === 'funnel_app_mismatch') {
+    const moved = await request('PUT', `/v1/funnels/${slug}`, { app_id: body.app_id });
+    if (moved.status >= 400) throw new DemoError(`PUT /v1/funnels/${slug} -> ${moved.status} ${JSON.stringify(moved.json)}`);
+    r = await request('POST', path, body);
+  }
+  if (r.status >= 400) throw new DemoError(`POST ${path} -> ${r.status} ${JSON.stringify(r.json)}`);
+  return r.json;
+}
+
+// The funnels' apps must exist first (seed.mjs ensureApps).
 export async function publishFunnels({ coreUrl, token, pool, store, kv, funnels, hosts, mediaBase, pixel = null }) {
   const out = [];
+  const request = coreRequest(coreUrl, token);
   for (const { slug, dir } of funnels) {
     const html = rewriteMedia(await readFile(join(dir, 'demo.html'), 'utf8'), slug, mediaBase);
     const sha256 = sha256Hex(html);
-    const r = await api(coreUrl, token, 'POST', `/v1/funnels/${slug}/versions`, { html, sha256 });
+    const r = await uploadVersion(request, { slug, html, sha256 });
     // Postgres keeps its volume, Miniflare's R2 starts empty: an unchanged funnel (created: false)
     // has its version row but no object in this run's bucket. The key is immutable, so re-put it.
     await store.put(bundleKey(slug, r.v), html, { sha256 });
diff --git a/demo/lib/purchase.mjs b/demo/lib/purchase.mjs
index 3c4913c..e11c6ca 100644
--- a/demo/lib/purchase.mjs
+++ b/demo/lib/purchase.mjs
@@ -22,11 +22,17 @@ export function jsonLog(write, { verbose = true } = {}) {
   return { info: verbose ? line('info') : () => {}, warn: line('warn'), error: line('error') };
 }
 
+// The per-app webhook secrets (Secrets Manager in production), in memory. core-api serves /v1/apps only with
+// this store, so the demo passes one in every mode (spec admin-console-p4a §4: the console's app switcher).
+export function memorySecrets() {
+  const secrets = new Map();
+  return { get: async (id) => secrets.get(id) ?? null, put: async (id, s) => { secrets.set(id, s); } };
+}
+
 // host: the purchase host the browser is on (Turnstile's hostname check); coreUrl: where Paddle webhooks go.
 export function purchaseDeps({ host, coreUrl, log }) {
   const mailbox = createMailbox();
   const paddle = createFakePaddle({ webhookUrl: `${coreUrl}/v1/paddle/webhook`, webhookSecret: DEMO_WEBHOOK_SECRET });
-  const secrets = new Map();
   return {
     paddle,
     mailbox,
@@ -34,7 +40,7 @@ export function purchaseDeps({ host, coreUrl, log }) {
       paddle,
       queue: memoryQueue(),
       webhookSecret: DEMO_WEBHOOK_SECRET,
-      webhookSecrets: { get: async (id) => secrets.get(id) ?? null, put: async (id, s) => { secrets.set(id, s); } },
+      webhookSecrets: memorySecrets(),
       claimKey: DEMO_CLAIM_KEY,
       mailer: mailbox,
       // The test sitekey's dummy token would fail Cloudflare's real siteverify: accept it for this host.
diff --git a/demo/lib/seed.mjs b/demo/lib/seed.mjs
index 86bc7d6..d8ff1de 100644
--- a/demo/lib/seed.mjs
+++ b/demo/lib/seed.mjs
@@ -1,9 +1,14 @@
-// The purchase demo's app and plans, through core's own API (the same calls as `ikf app create`,
-// `ikf funnel set --app`, `ikf funnel prices set`). Idempotent; the app's URLs follow this run's base URL.
+// The demo's apps and the purchase demo's plans, through core's own API (the same calls as `ikf app create`,
+// `ikf funnel prices set`). Idempotent; the apps' URLs follow this run's base URL.
 import { DemoError } from './docker.mjs';
 import { DEMO_PRICES } from './paddle-fake.mjs';
 
-export const DEMO_APP = 'starlyn';
+// Spec admin-console-p4a §4: three sample apps, one per default funnel (a new funnel needs an app). Any other
+// funnel (witch-power for the purchase demo, --funnels picks) goes to the "demo" app, created only when needed.
+export const DEMO_APPS = { 'moon-reading': 'starlyn', 'calmio-calm-kids': 'calmio', 'ewa-books': 'ewa' };
+const OTHER_APP = 'demo';
+export const appFor = (slug) => DEMO_APPS[slug] ?? OTHER_APP;
+const nameOf = (id) => `${id[0].toUpperCase()}${id.slice(1)} (demo)`;
 
 // request(method, path, body) → {status, json} against core-api with the demo admin token.
 export const coreRequest = (coreUrl, token) => async (method, path, body) => {
@@ -15,29 +20,41 @@ export const coreRequest = (coreUrl, token) => async (method, path, body) => {
   return { status: res.status, json: await res.json().catch(() => ({})) };
 };
 
-export async function seedPurchase({ request, pool, base, funnel }) {
-  const call = async (method, path, body, ok = []) => {
-    const r = await request(method, path, body);
-    if (r.status >= 400 && !ok.includes(r.status)) throw new DemoError(`${method} ${path} -> ${r.status} ${JSON.stringify(r.json)}`);
-    return r;
-  };
+const caller = (request) => async (method, path, body, ok = []) => {
+  const r = await request(method, path, body);
+  if (r.status >= 400 && !ok.includes(r.status)) throw new DemoError(`${method} ${path} -> ${r.status} ${JSON.stringify(r.json)}`);
+  return r;
+};
+
+// The three sample apps, plus "demo" when one of slugs needs it → their ids. base: the https origin of the purchase
+// demo (its fake app page is the "Adjust tracker"; nothing listens behind the webhook URL, handoff user_id sends none).
+export async function ensureApps({ request, pool, base, slugs }) {
+  const call = caller(request);
+  const ids = [...new Set([...Object.values(DEMO_APPS), ...slugs.map(appFor)])];
   const urls = { adjust_tracker_url: `${base}/_demo/app`, webhook_url: `${base}/_demo/null` };
-  // The "Adjust tracker" is the fake app page; nothing listens behind the webhook URL (handoff user_id sends none).
-  const created = await call('POST', '/v1/apps', {
-    id: DEMO_APP, name: 'Starlyn (demo)', kind: 'app', handoff: 'user_id', deeplink_scheme: 'starlyn', ...urls,
-  }, [409]);
-  if (created.status === 409) {
-    // No API edits an app; the tunnel URL is new on every run.
-    await pool.query(
-      "UPDATE apps SET adjust_tracker_url = $2, webhook_url = $3, deeplink_scheme = $4, handoff = 'user_id', deeplink_path = 'open' WHERE id = $1",
-      [DEMO_APP, urls.adjust_tracker_url, urls.webhook_url, 'starlyn'],
-    );
+  for (const id of ids) {
+    const created = await call('POST', '/v1/apps', {
+      id, name: nameOf(id), kind: 'app', handoff: 'user_id', deeplink_scheme: id, ...urls,
+    }, [409]);
+    if (created.status === 409) {
+      // The tunnel URL is new on every run.
+      await pool.query(
+        "UPDATE apps SET adjust_tracker_url = $2, webhook_url = $3, deeplink_scheme = $4, handoff = 'user_id', deeplink_path = 'open' WHERE id = $1",
+        [id, urls.adjust_tracker_url, urls.webhook_url, id],
+      );
+    }
   }
-  await call('PUT', `/v1/funnels/${funnel}`, { app_id: DEMO_APP });
-  await call('PUT', `/v1/funnels/${funnel}/prices`, {
+  return ids;
+}
+
+// The purchase funnel's plans (1w → premium, addon → tarot_2027) → the funnel's app (spec admin-console-p4a §4: the
+// app of the first chosen funnel, which publishFunnels already put the funnel in).
+export async function seedPurchase({ request, funnel }) {
+  await caller(request)('PUT', `/v1/funnels/${funnel}/prices`, {
     plans: {
       '1w': { price_id: DEMO_PRICES['1w'].id, entitlement_key: 'premium' },
       addon: { price_id: DEMO_PRICES.addon.id, entitlement_key: 'tarot_2027' },
     },
   });
+  return appFor(funnel);
 }
diff --git a/demo/lib/stack.mjs b/demo/lib/stack.mjs
index 768b8d2..2751b1f 100644
--- a/demo/lib/stack.mjs
+++ b/demo/lib/stack.mjs
@@ -16,8 +16,8 @@ import { startMediaServer } from './media.mjs';
 import { startDemoServer } from '../server/index.mjs';
 import { startMiniflare } from './miniflare.mjs';
 import { startProxy } from './proxy.mjs';
-import { jsonLog, purchaseDeps, startPurchaseWorkers } from './purchase.mjs';
-import { coreRequest, seedPurchase } from './seed.mjs';
+import { jsonLog, memorySecrets, purchaseDeps, startPurchaseWorkers } from './purchase.mjs';
+import { coreRequest, ensureApps, seedPurchase } from './seed.mjs';
 
 export const DEMO_TOKEN = 'ikf_demo_admin';
 export const PORTS = { edge: 8787, core: 8080, media: 8790, proxy: 8788, demo: 8791, admin: 8792 };
@@ -171,13 +171,21 @@ export async function startStack({
     const app = buildApp({
       logger: logStream ? { level: 'info', stream: logStream } : verbose,
       checks: { db: () => pool.query('select 1') },
-      deps: { pool, store, kv, mediaOrigins: [mediaBase], previewBaseUrl: `http://preview.localhost:${ports.edge}`, ...shop?.deps, ...admin, ...analytics },
+      deps: {
+        pool, store, kv, mediaOrigins: [mediaBase], previewBaseUrl: `http://preview.localhost:${ports.edge}`,
+        webhookSecrets: memorySecrets(), ...shop?.deps, ...admin, ...analytics,
+      },
     });
     await app.listen({ host: '127.0.0.1', port: ports.core });
     stops.push(() => app.close());
     const coreUrl = `http://127.0.0.1:${app.server.address().port}`;
     if (shop) stops.push(startPurchaseWorkers({ pool, deps: shop.deps, log }));
 
+    // Spec admin-console-p4a §4: a funnel's first upload needs its app, so the apps come first, in every mode.
+    // Without the purchase flow nothing serves the fake app page; the URLs only have to pass core's https check.
+    await ensureApps({
+      request: coreRequest(coreUrl, DEMO_TOKEN), pool, base: purchase?.base ?? 'https://demo.test', slugs: chosen.map((f) => f.slug),
+    });
     const hosts = ['localhost', ...(ip ? [ip] : []), ...(adminUser ? [ADMIN_DEMO_HOST] : [])];
     const published = await publishFunnels({
       coreUrl, token: DEMO_TOKEN, pool, store, kv, funnels: chosen, hosts: [...hosts, ...(purchaseHost ? [purchaseHost] : [])], mediaBase, pixel,
@@ -196,13 +204,13 @@ export async function startStack({
     let purchaseInfo = null;
     if (shop) {
       const funnel = chosen[0].slug;
-      await seedPurchase({ request: coreRequest(coreUrl, DEMO_TOKEN), pool, base: purchase.base, funnel });
-      const demo = await startDemoServer({ port: ports.demo, paddle: shop.paddle, mailbox: shop.mailbox, funnel });
+      const appId = await seedPurchase({ request: coreRequest(coreUrl, DEMO_TOKEN), funnel });
+      const demo = await startDemoServer({ port: ports.demo, paddle: shop.paddle, mailbox: shop.mailbox, funnel, app: appId });
       stops.push(() => demo.close());
       const proxy = await startProxy({ port: ports.proxy, ports: { core: ports.core, demo: ports.demo, media: ports.media, edge: ports.edge } });
       stops.push(() => proxy.close());
       purchaseInfo = {
-        base: purchase.base, host: purchaseHost, funnel, url: `${purchase.base}/${funnel}`, panel: `${purchase.base}/_demo/`,
+        base: purchase.base, host: purchaseHost, funnel, app: appId, url: `${purchase.base}/${funnel}`, panel: `${purchase.base}/_demo/`,
         paddle: shop.paddle, mailbox: shop.mailbox,
       };
     }
diff --git a/demo/run.mjs b/demo/run.mjs
index c11b0f0..c26d4ed 100644
--- a/demo/run.mjs
+++ b/demo/run.mjs
@@ -63,7 +63,7 @@ async function main() {
     console.log(await qrText(p.url));
     console.log(`  Funnel:   ${p.url}   <- scan the QR with the phone`);
     console.log(`  Panel:    ${p.panel}   (refund / expire / renew)`);
-    console.log(`  App:      ${p.base}/_demo/app   Inbox: ${p.base}/_demo/mail`);
+    console.log(`  App:      ${p.base}/_demo/app (app ${p.app})   Inbox: ${p.base}/_demo/mail`);
     if (tunnel) console.log('  A new tunnel can take up to a minute to answer; the URL changes on every run.');
     console.log('');
   }
diff --git a/demo/server/app-page.mjs b/demo/server/app-page.mjs
index c3a46f6..b4c9642 100644
--- a/demo/server/app-page.mjs
+++ b/demo/server/app-page.mjs
@@ -26,10 +26,11 @@ const CSS = 'body{margin:0;font:16px/1.45 system-ui,sans-serif;background:#0f102
   + '.m{color:#b9b8cc;font-size:14px;min-height:1.4em}button,a.btn{display:block;width:100%;box-sizing:border-box;font:inherit;border:0;border-radius:10px;padding:12px;margin-top:10px;background:#fff;color:#111;text-decoration:none;cursor:pointer}'
   + 'a.l{color:#c9c6ff;display:inline-block;margin:14px 8px 0;font-size:14px}code{font-size:11px;color:#8d8ca3;word-break:break-all}';
 
-export function appPage() {
+// app: the app id the page asks check-purchased about (the purchase funnel's app, spec admin-console-p4a §4).
+export function appPage(app) {
   return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
-<title>Starlyn (app giả)</title><style>${CSS}</style></head><body><div class="c">
-<h1>Starlyn: app giả (mô phỏng IKameSDK)</h1>
+<title>${app} (app giả)</title><style>${CSS}</style></head><body><div class="c">
+<h1>${app}: app giả (mô phỏng IKameSDK)</h1>
 <div id="badge" class="b free">...</div><div id="msg" class="m"></div><div><code id="uid"></code></div>
 <button id="check">Kiểm tra lại</button><button id="reinstall">Cài lại app (xóa dữ liệu)</button>
 <a class="l" href="/_demo/mail">Hộp thư</a><a class="l" href="/_demo/">Bảng điều khiển</a>
@@ -58,7 +59,7 @@ ${pickUserId.toString()}
     document.getElementById('msg').textContent = 'Đang kiểm tra...';
     var body = {};
     body[C.request_user_id_field] = id;
-    body[C.request_app_field] = 'starlyn';
+    body[C.request_app_field] = ${JSON.stringify(app)};
     fetch(C.path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
       .then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); })
       .then(function (b) {
diff --git a/demo/server/index.mjs b/demo/server/index.mjs
index cb79a9c..aa8e9fa 100644
--- a/demo/server/index.mjs
+++ b/demo/server/index.mjs
@@ -2,6 +2,7 @@
 // inbox, the control panel and its actions. Node http, HTML + JSON, nothing cached, nothing logged.
 import { createServer } from 'node:http';
 import { contractJson } from '../../services/core-api/src/identity/sdk-contract.js';
+import { appFor } from '../lib/seed.mjs';
 import { appPage } from './app-page.mjs';
 import { mailPage, panelPage } from './pages.mjs';
 import { PADDLE_JS } from './paddle-js.mjs';
@@ -42,13 +43,14 @@ function readJson(req) {
   });
 }
 
-// paddle: createFakePaddle(); mailbox: createMailbox(); funnel: the slug the panel links to.
-export async function startDemoServer({ port = 8791, host = '127.0.0.1', paddle, mailbox, funnel }) {
+// paddle: createFakePaddle(); mailbox: createMailbox(); funnel: the slug the panel links to; app: the fake app page's
+// app id (default: the funnel's demo app).
+export async function startDemoServer({ port = 8791, host = '127.0.0.1', paddle, mailbox, funnel, app = appFor(funnel) }) {
   const routes = {
     'GET /_demo/': () => [200, panelPage(funnel), 'text/html; charset=utf-8'],
     'GET /_demo/state': () => [200, { funnel: `/${funnel}`, app: '/_demo/app', mail: '/_demo/mail', ...paddle.state() }],
     'GET /_demo/paddle.js': () => [200, PADDLE_JS, 'text/javascript; charset=utf-8'],
-    'GET /_demo/app': () => [200, appPage(), 'text/html; charset=utf-8'],
+    'GET /_demo/app': () => [200, appPage(app), 'text/html; charset=utf-8'],
     'GET /_demo/sdk-contract.json': () => [200, contractJson()],
     'GET /_demo/mail': () => [200, mailPage(mailbox.list()), 'text/html; charset=utf-8'],
     'POST /_demo/null': () => [204, ''],
PATCH
```

`demo/README.md`, `docs/runbooks/admin-console.md`, `CLAUDE.md` (sửa, áp dụng đúng diff này):

`demo/README.md`, `docs/runbooks/admin-console.md`, `CLAUDE.md` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/CLAUDE.md b/CLAUDE.md
index 7f0d418..a017f8a 100644
--- a/CLAUDE.md
+++ b/CLAUDE.md
@@ -68,6 +68,7 @@ Workflows: `docker run --rm -v "$PWD:/repo" -w /repo rhysd/actionlint:latest`.
 - Routes declare a grant with `requireRole`: token roles `publisher`/`router`/`admin`, people `viewer`/`support`/`editor`/`admin` through the grants table `USER_GRANTS` in `src/auth.js` (same table as `apps/admin/src/roles.js` `GRANTS`, a test keeps them equal): editor satisfies `publisher`, `prices:read`, `apps:read`; support satisfies `support`; admin everything. A cookie write needs `X-Ikf-Csrf`.
 - The console never receives a buyer's `user_id` or email (customer lookup report v2); customers are named by `customer_ref` (`cus_…`) in URLs, audit and logs.
 - Dashboard analytics (`/v1/analytics/*`, grant `viewer`): sessions come from ClickHouse `funnel_hourly` (`clickhouse/002_funnel_hourly.sql`, a materialized view of `events` with `uniqExactState(sid)`: read with `uniqExactMerge(h.sessions)`, never a bare `sessions` after an `AS sessions` alias); money only from Postgres. Analytics answers carry aggregates only (no `sid`, no PII), are cached 30 s per core task, and a ClickHouse failure is `503 analytics_unavailable` (log: `kind` + status only). New `clickhouse/*.sql` files must stay idempotent; a materialized view needs `DEFINER = CURRENT_USER SQL SECURITY DEFINER` or the consumer's `ikf_writer` inserts fail. Runbook `docs/runbooks/analytics.md`.
+- The app is the management unit (spec admin-console-p4a, migration 007): a new funnel needs an app (`POST /v1/funnels` and the first upload of a new slug → `400 app_required`; changing it only through `PUT /v1/funnels/:slug {app_id}`, never back to null); a domain belongs to one app or is shared (`domains.app_id` NULL); publish refuses another app's domain (`409 domain_app_mismatch`; rollback/delete/sync unchecked). List routes take `?app=<id>` (`none` = unassigned funnels / shared domains only); `audit(…, {app_id})` fills `audit_log.app_id`. In the SPA the app context is the URL: `/apps/:id/*` (Tổng quan, Funnels, Giá, Khách hàng, Domains, Webhooks, Audit, Cài đặt), everything else is global; no hidden state. Runbook `docs/runbooks/admin-console.md` §13.
 - `ADMIN_LOCAL_USER` (sign-in without Google) is local-demo only: `loadConfig`, `buildApp`, the core-service Terraform module and `apps/admin/scripts/deploy-config.js` all refuse it.
 
 ## Process
@@ -76,4 +77,4 @@ Work follows spec → plan → TDD tasks (superpowers skills), one reviewed task
 
 ## Local demo
 
-`npm run demo` runs real funnels locally (Miniflare edge-router + event-consumer, core-api in-process, Postgres + ClickHouse in Docker, compose project `ikf-demo`), plus the admin console at `http://localhost:8792` (local admin from `--admin-user`, default `demo@ikameglobal.com`; publish to `demo.localhost`; a `support@ikameglobal.com` support user is seeded; prices and customers need the purchase flow: `npm run demo -- --purchase --host https://… --admin-user <email>`; the Dashboard reads the demo's ClickHouse, `npm run demo:events -- --seed` adds 3 days of sample data). Scripts: `npm run demo`, `npm run demo:events`, `npm run demo:purchase` (full purchase flow on a phone: fake Paddle/Turnstile/SES, quick tunnel + QR), `npm run demo:down` (`-- --reset` wipes data), `npm run demo:test` (never two at once: fixed ports). Options, ports and troubleshooting: `demo/README.md`. Code in `demo/` only; it must not change `services/`, `workers/` or `packages/`, except the sanctioned `PADDLE_JS_URL` → `__IKF.paddle.js` hook (edge-router emits it only for `https://` values, the SDK loads only `https:`, and `workers/edge-router/scripts/deploy-config.js` refuses the variable so it never reaches a deployed Worker). Fakes are injected only through `buildApp({deps})` from `demo/lib/purchase.mjs`; nothing in `services/` or `workers/` reads a demo flag.
+`npm run demo` runs real funnels locally (Miniflare edge-router + event-consumer, core-api in-process, Postgres + ClickHouse in Docker, compose project `ikf-demo`), plus the admin console at `http://localhost:8792` (local admin from `--admin-user`, default `demo@ikameglobal.com`; publish to `demo.localhost`; a `support@ikameglobal.com` support user is seeded; prices and customers need the purchase flow: `npm run demo -- --purchase --host https://… --admin-user <email>`; the Dashboard reads the demo's ClickHouse, `npm run demo:events -- --seed` adds 3 days of sample data; three sample apps `starlyn` ← `moon-reading`, `calmio` ← `calmio-calm-kids`, `ewa` ← `ewa-books`, any other funnel in app `demo`, made through the API at every start; uploads carry `app_id`, demo hosts stay shared; `demo:purchase` uses the first funnel's app). Scripts: `npm run demo`, `npm run demo:events`, `npm run demo:purchase` (full purchase flow on a phone: fake Paddle/Turnstile/SES, quick tunnel + QR), `npm run demo:down` (`-- --reset` wipes data), `npm run demo:test` (never two at once: fixed ports). Options, ports and troubleshooting: `demo/README.md`. Code in `demo/` only; it must not change `services/`, `workers/` or `packages/`, except the sanctioned `PADDLE_JS_URL` → `__IKF.paddle.js` hook (edge-router emits it only for `https://` values, the SDK loads only `https:`, and `workers/edge-router/scripts/deploy-config.js` refuses the variable so it never reaches a deployed Worker). Fakes are injected only through `buildApp({deps})` from `demo/lib/purchase.mjs`; nothing in `services/` or `workers/` reads a demo flag.
diff --git a/demo/README.md b/demo/README.md
index f779189..69cef44 100644
--- a/demo/README.md
+++ b/demo/README.md
@@ -99,6 +99,17 @@ leads, checkouts, USD and JPY payments, one refund); seeding again in the same h
 `test/admin-p3-e2e.test.mjs`: sample data → Dashboard → Số liệu (ports 8877/8178/8879/8878/8881/8882, databases
 `ikf_admin_p3_test`).
 
+Đợt 4a (spec admin-console-p4a): the app is the unit. Every start creates three sample apps through the API (kind
+`app`, handoff `user_id`, fake tracker and scheme): `starlyn` ← `moon-reading`, `calmio` ← `calmio-calm-kids`,
+`ewa` ← `ewa-books`; any other funnel (e.g. `witch-power`) goes to a fourth app `demo`, made only when needed.
+Each funnel's upload carries its app (`app_id`); one an earlier run left in another app is moved back first.
+The demo hosts (`localhost`, the LAN IP, `demo.localhost`, the purchase host) stay shared (no app). The sidebar's
+switcher picks an app: its Tổng quan (KPI, its funnels, its domains), Funnels, Giá, Khách hàng, Domains, Webhooks,
+Audit, Cài đặt; the Dashboard has one row per app. `npm run demo:test` includes `test/admin-p4a-e2e.test.mjs`:
+switcher → app overview → funnel created in the app → upload → publish on `demo.localhost` → another app's host is
+not offered and refused (`domain_app_mismatch`) → a row per app (ports 8897/8198/8899/8898/8901/8902, database
+`ikf_admin_p4a_test`, dropped at the start of each run).
+
 ## Full purchase flow (`npm run demo:purchase`)
 
 Buy on a real funnel from your phone, open the "app", see **PRO**; refund from the control panel, see **FREE**.
@@ -113,8 +124,9 @@ npm run demo:purchase          # prints an https://<words>.trycloudflare.com URL
 1. Scan the QR with the phone: `witch-power` opens over https (a new tunnel can take up to a minute to answer).
 2. Go through the funnel and buy: Turnstile runs with Cloudflare's test sitekey (always passes; the phone needs
    internet), then the **fake Paddle overlay** asks for an email if the funnel had none: **Pay** or **Cancel**.
-3. After Pay the funnel's "Open the app" button points to `/_demo/app?deep_link=starlyn://open?user_id=<uuid>`
-   (Adjust stand-in). The **fake app** takes the `user_id` the way IKameSDK does, calls
+3. After Pay the funnel's "Open the app" button points to `/_demo/app?deep_link=demo://open?user_id=<uuid>`
+   (Adjust stand-in; the scheme and the app are the funnel's demo app: `demo` for `witch-power`, `starlyn` for
+   `--funnel moon-reading`). The **fake app** takes the `user_id` the way IKameSDK does, calls
    `POST /v1/payment/check-purchased-web-funnel` and shows **PRO** with the expiry. "Cài lại app" forgets the
    `user_id` (FREE); the link in the inbox (`/_demo/mail`) restores it.
 4. Control panel `/_demo/`: **Refund** (full; "Refund 1 phần" = partial, stays PRO), **Expire** (renewal failed and
diff --git a/docs/runbooks/admin-console.md b/docs/runbooks/admin-console.md
index 978e8f6..ab99564 100644
--- a/docs/runbooks/admin-console.md
+++ b/docs/runbooks/admin-console.md
@@ -137,3 +137,23 @@ need an admin token (`ikf customer …`).
 - **Billing** (admin): reconcile 24 h / 7 d / 30 d (audited `billing.reconcile`) and the outbox, as `ikf billing`.
 
 Rate limits: `/v1/customers/*` and `/v1/paddle/prices` are in the edge's identity rule (50 requests per 10 s per IP).
+
+## 13. Sau khi lên 007: gán funnel và domain vào app
+
+Migration `007_apps_container.sql` (spec `ifunnel/docs/specs/2026-10-12-admin-console-p4a-design.md`) makes the app
+the unit: a new funnel needs an app, a domain belongs to one app or is shared, and publish refuses another app's
+domain (`409 domain_app_mismatch`). Funnels and domains from before 007 have no app; assign them once, with an
+admin token (or the console: Funnels → lọc "Chưa gán", Domains → **Gán vào app**):
+
+1. `ikf funnel ls --unassigned`: the funnels without an app (the Dashboard's "Chưa gán" row; the console shows a
+   yellow "Chưa gán app" card on each). Until assigned they publish only on shared domains.
+2. `ikf funnel set <slug> --app <id>` for each (audited `funnel.app`; entitlements are recomputed for the new app).
+   An app is never removed again (`--no-app` → `400 app_required`).
+3. `ikf domain set <host> --app <id>` for each host that belongs to one app (`--shared` makes it shared again).
+   `409 domain_has_foreign_routes` lists the live routes of other (or unassigned) funnels on that host: assign
+   those funnels first, or move them off the host, then retry. Demo, preview and test hosts stay shared.
+4. `ikf publish <folder> --slug <new-slug>` of a **new** slug needs `--app <id>` (`400 app_required`, the CLI says
+   "Funnel mới cần --app <id>"); an existing slug keeps its app (another `--app` → `409 funnel_app_mismatch`, change
+   it with `ikf funnel set`).
+
+Rollback, route delete and `scripts/sync-domains.sh` are not checked against apps (emergency paths).
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npx vitest run --config demo/vitest.config.mjs test/seed.test.mjs test/funnels.test.mjs test/server.test.mjs 2>&1 | grep -E "Test Files|Tests  "
npx vitest run --config demo/vitest.config.mjs test/admin-p4a-e2e.test.mjs 2>&1 | grep -E "Test Files|Tests  "
npm run demo:test 2>&1 | grep -E "×|Test Files|Tests  "
```

Expected: `Tests  30 passed (30)`; e2e `Tests  1 passed (1)`; toàn bộ demo (chạy một mình, cổng cố định) `Test Files  23 passed (23)`, `Tests  132 passed (132)`.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md demo/README.md demo/lib/funnels.mjs demo/lib/purchase.mjs demo/lib/seed.mjs demo/lib/stack.mjs demo/run.mjs demo/server/app-page.mjs demo/server/index.mjs demo/test/admin-p2-e2e.test.mjs demo/test/admin-p3-e2e.test.mjs demo/test/admin-p4a-e2e.test.mjs demo/test/funnels.test.mjs demo/test/purchase.test.mjs demo/test/seed.test.mjs demo/test/server.test.mjs docs/runbooks/admin-console.md
git commit -m "feat(demo): three demo apps, uploads carry app_id, purchase uses the first funnel's app; e2e đợt 4a; docs
```

---

---

### Task 13: Chạy lại toàn nhánh

**Files:** — (chỉ kiểm tra)

- [ ] **Step 1: Toàn bộ workspace + demo**

```bash
npm test -w @ikf/paddle -w @ikf/event-schema -w @ikf/funnel-lint -w @ikf/sdk -w @ikf/cli -w @ikf/edge-router -w @ikf/event-consumer -w @ikf/core-api -w @ikf/route-match -w @ikf/admin 2>&1 | grep -E "Test Files|Tests  |bytes gzip"
npm run demo:test 2>&1 | grep -E "Test Files|Tests  "
git status --short
```

Expected: paddle 34, event-schema 145, funnel-lint 35, sdk 159, cli **203** (20 file), edge-router 106 (7 file, `ikf sdk d1a533c86611: 8154 bytes gzip`, không đổi), event-consumer 8 + 27, core-api **613** (67 file), route-match 35, admin **197** (25 file); demo **132** (23 file); `git status` sạch. Không còn tiến trình nào của mình nghe trên cổng e2e (`lsof -nP -iTCP -sTCP:LISTEN`); demo của worktree `-admin-p3` (8080/8787/8790/8792) vẫn chạy, không đụng.

- [ ] **Step 2: Review toàn nhánh** (superpowers:requesting-code-review) trước PR vào `feat/admin-console-ui` (PR #9). PR body kết thúc bằng dòng attribution Claude Code.

---

## Theo sau (thủ công, ngoài phạm vi plan này)

1. **Sau khi deploy 007** (staging rồi prod): chạy `ikf funnel ls --unassigned`, gán từng funnel bằng `ikf funnel set <slug> --app <id>`, gán domain bằng `ikf domain set <host> --app <id>` (runbook `docs/runbooks/admin-console.md`). Khi nhóm "Chưa gán" rỗng: đợt sau đặt `funnels.app_id NOT NULL`.
2. **Báo content team**: `ikf publish` slug mới cần `--app <id>`; slug cũ không đổi.
3. **Đợt 4b** (quyền theo app): spec riêng; 4a đã để sẵn `audit_log.app_id`, `?app=` trên mọi route liệt kê, `GET /v1/apps/:id` làm điểm kiểm quyền.
4. **Ngoài phạm vi spec** (xoá/archive app, chuyển quyền khách khi đổi app, tạo domain qua API, cột `app` trong ClickHouse, cài đặt Paddle theo app) — không có task.

---

## Self-Review

**Spec coverage:**

| Spec | Task |
|---|---|
| Điều kiện xong: switcher 3 app mẫu, trong app đủ Tổng quan/Funnels/Giá/Khách hàng/Domains/Webhooks/Cài đặt, Dashboard toàn cục mỗi app một dòng; e2e tạo app → funnel → upload → publish lên domain chung → bị chặn ở domain app khác | 8, 9, 10, 11, 12 (e2e `admin-p4a-e2e`, +A27, A28) |
| Điều kiện xong: `POST /v1/funnels` thiếu app → 400; upload slug mới thiếu app → 400; test cũ pass; bundle SDK không đổi | 2 (+A4, A5), 13 |
| Quyết định #1 app bắt buộc, nhóm "Chưa gán", cột nullable | 2, 9 (dòng "Chưa gán"), 10 (thẻ "Chưa gán app") |
| Quyết định #2 chuẩn bị 4b: `audit_log.app_id`, `?app=` mọi route liệt kê | 1, 2, 3, 6 |
| Quyết định #3 domain thuộc đúng một app / dùng chung; publish chỉ lên domain hợp lệ | 3 (+A10, A11), 10 |
| Quyết định #4 số liệu theo app không đổi schema ClickHouse | 6 (+A18, A19) |
| Quyết định #5 đổi app được, không gỡ null | 2 (+A5), 7 (+A20), 10 (+A25) |
| Quyết định #6 SPA không dependency, ngữ cảnh trong URL | 8 (+A21), Global Constraints |
| §1 migration 007 (domains.app_id, audit_log.app_id + backfill, drop funnels.app) | 1 (+A1, A2) |
| §2 tạo funnel/upload/PUT/`GET ?app=` | 2 (+A4–A9) |
| §2 domain và publish | 3 (+A10–A12) |
| §2 Apps: 3 count, `/apps/:id`, `/summary`, `/plans` | 4 (+A13–A15) |
| §2 khách hàng `app_id` | 5 (+A16, A17) |
| §2 audit signature, action nào điền `app_id`, `?app=` | 1 (app.*, funnel.app, webhook.resend), 2 (funnel.create, version.upload, funnel.pixel), 3 (route.*, domain.sync), 4 (entitlement.*) |
| §2 analytics overview `app`, `app_id` mỗi dòng, cache, 404 | 6 |
| §2 CLI | 7 (+A20) |
| §3 SPA: switcher, menu theo ngữ cảnh, Apps, Tổng quan app, Webhooks/Cài đặt tách, deep link cũ | 8 |
| §3 Dashboard toàn cục theo app + "Chưa gán"; Funnels toàn cục/trong app; tạo funnel bắt buộc app | 9 (+A22, A23) |
| §3 Domains, PublishDialog, Funnel detail breadcrumb + FunnelSettings | 10 (+A24, A25) |
| §3 Giá / Khách hàng / Audit trong app, lọc app ở `/audit` | 11 (+A26) |
| §3 client methods | 8 (`api.js`, `fakeClient`, `api.test.js`) |
| §4 demo 3 app, upload kèm app, purchase theo app funnel đầu, e2e cổng/DB riêng | 12 (+A27–A30) |
| §4 hạ tầng: runbook, không đổi Terraform | 12 (runbook, CLAUDE.md) |
| §4 kiểm thử (danh sách) | 1–12 theo từng mục; bảng quyền route mới ở 4 (plans), 5 (lookup), 6 (overview) |
| §4 ngoài phạm vi; §5 chuẩn bị 4b | không task (đúng); "Theo sau" 3 |

**Placeholder:** không có "TBD"/"tương tự Task N". Mọi khối code và patch được sinh từ commit của cây scratch đã chạy test (Node 26, colima, 2026-10-12: core-api 613, cli 203, admin 197, demo 132). Khi thực thi, controller so khớp tree sau mỗi task với commit scratch tương ứng (`git diff --stat <scratch-commit> HEAD` chỉ được khác `package-lock.json`/artefact). Không chạy được ở đây: Cloudflare thật, ClickHouse Cloud thật.

**Nhất quán tên / kiểu:**
- `audit(db, actor, action, target, details, {app_id})` (Task 1) ← mọi handler Task 2–4; `listAudit({app})` (Task 1) ← `GET /v1/audit?app=` ← client `listAudit({app})` (Task 8) ← trang Audit (Task 11).
- `listFunnels(pool, {app})` (Task 2) ← `appSummary` (Task 4) ← client `listFunnels({app})` (Task 8) ← Funnels (Task 9); giá trị `none` thống nhất ở schema (`^(none|…)$`), CLI `--unassigned`, SPA `?app=none`.
- `listDomains(pool, {app})` (Task 3: app + dùng chung) ← `appSummary` lọc bỏ `NULL` (Task 4) ← PublishDialog (Task 10) ← Domains trong app chia hai nhóm (Task 10); `setDomain` (Task 3) ← client `setDomain(host, body)` (Task 8) ← Domains (Task 10) ← CLI `domain set` (Task 7).
- `assignFunnelApp` (Task 2) dùng chung bởi `setFunnelApp` và `publishVersion`; `checkUploadApp` ở handler và dưới row lock.
- Lỗi: `app_required`, `funnel_app_mismatch {app_id}`, `domain_app_mismatch {host_app, funnel_app}`, `domain_has_foreign_routes {routes}`, `app_not_found {app_id}`, `invalid_app_id {id}` — cùng tên ở server (Task 2–6), CLI (Task 7) và SPA (Task 9–10).
- Response: `GET /v1/apps` + count (Task 4) = thẻ Apps (Task 8) = CLI `app ls` (Task 7); `/summary` (Task 4) = Tổng quan app (Task 8); `/plans` với `in_html` (Task 4, A14) = AppPlans (Task 11); overview `app_id` mỗi dòng (Task 6) = `groupByApp` (Task 9) = `stats --app` (Task 7); lookup `app_id` (Task 5) = Customers trong app (Task 11).
- Nhãn e2e (Task 12) = Task 8–10: `app-switcher`, `kpis`, `overview-row`, `create-funnel`, `app-row`, nút `New funnel`.
- Cổng/DB e2e (Task 12) = README demo = Global Constraints (A28).

**Review Focus đã ghim:** 1 → Task 2 (`an existing funnel keeps accepting uploads without app_id`), Task 7 (`publish-app`); 2 → Task 3 (ma trận publish), Task 10 (PublishDialog); 3 → Task 3 (`domain_has_foreign_routes` gồm funnel chưa gán), Task 10; 4 → Task 6 (`analytics-app`, tiền không sự kiện), Task 9 (`groupByApp`); 5 → Task 5 (`customer-report-app`); 6 → Task 1 (backfill idempotent, slug lạ giữ NULL).

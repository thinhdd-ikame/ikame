# iKame Funnel Platform — Admin Console đợt 2 (Billing + Identity) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ops đặt giá Paddle cho từng plan của funnel trên console (dropdown từ catalog Paddle); dev tạo/sửa app, xoay key, xem và gửi lại webhook; CS (role mới `support`) tra khách theo email / `cus_…` / checkout id và gửi lại email link app; admin cấp/thu hồi quyền thủ công, cấp lại `user_id` bị lộ, chạy reconcile — mọi thao tác có audit, không email khách và không `user_id` trong log, audit hay response console.

**Architecture:**
- **core-api**: migration `006_admin_p2.sql` (role `support`, bảng `manual_grants`, `versions.plan_keys`, `customers.user_id_rotated_at`, nguồn entitlement `manual`). `requireRole` tra **bảng grants** `USER_GRANTS` (viewer / support / editor / admin; grant mới `prices:read`, `apps:read`, `support`). `computeEntitlements` nhận input thứ ba `manual`, `loadSources` nạp grant chưa thu hồi → `recompute` giữ/tắt đúng và webhook `entitlement.updated` bắn như mua thật. Route mới trong `src/http/customers.js`: lookup v2 (một trong `email` / `customer_ref` / `checkout_id`, báo cáo không có `user_id`/email), `resend-email`, `rotate-user-id`, `grants` (POST/DELETE); `GET /v1/paddle/prices` (catalog Paddle qua `@ikf/paddle` `listPrices`, cache in-process 60 s); `PUT /v1/apps/:id`; webhooks list có `before` + `counts`; audit `app.update`, `webhook.resend`, `billing.reconcile`, `customer.*`, `entitlement.*`. Upload trích `plan_keys` (`planKeysFromHtml` chuyển sang `@ikf/funnel-lint`); `GET /v1/funnels/:slug/prices` thêm `plan_keys`, `unmapped`.
- **CLI**: `ikf admin add --role support`; `ikf customer show <email|cus_…>` (không còn in `user_id`), `customer grant|revoke|resend-email|rotate-user-id`; `ikf app update`.
- **`apps/admin`**: `can()` tra bảng `GRANTS` (bằng `USER_GRANTS` của core, test giữ bằng nhau), menu ẩn theo grants, `RequireGrant` ("Cần quyền …"); Funnel detail → tab **Giá**; **Apps** (list, tạo — key + secret hiện một lần, sửa, xoay key, webhooks); **Khách hàng** (tìm, chi tiết, gửi lại email, cấp/thu hồi quyền, cấp lại `user_id`); **Billing** (reconcile, outbox); Users thêm `support` kèm mô tả.
- **Demo**: Paddle giả có `listPrices` (3 giá: `1w`, `addon`, một giá `archived`); seed `support@ikameglobal.com`; e2e Playwright mới `demo/test/admin-p2-e2e.test.mjs` theo đúng luồng "Điều kiện xong".
- **Infra/docs**: rate limit Cloudflare thêm `/v1/customers/*` (tiền tố) và `/v1/paddle/prices` vào luật identity (Terraform test); runbook `admin-console.md` thêm "Role support" + "Hỗ trợ khách"; `CLAUDE.md`.

**Tech Stack:** Node.js 22 trên CI (local Node 26) · JavaScript ESM · npm workspaces · Fastify 5 · `pg` 8 · Vitest ~3.2 · happy-dom 20 · `@testcontainers/postgresql` 11 · React 19 · react-router 7 · Vite 7 · `@testing-library/react` 16 · Playwright 1.63 · Terraform + Cloudflare provider (mock). Không dependency mới.

**Spec:** `ifunnel/docs/specs/2026-10-11-admin-console-p2-design.md`. Bối cảnh: `ifunnel/docs/specs/2026-10-11-admin-console-p1-design.md` và plan `ifunnel/docs/plans/2026-10-11-admin-console-p1.md` (đợt 1: phiên, CSRF, `requireRole`, audit, SPA), `ifunnel/docs/specs/2026-10-09-entitlement-identity-design.md` (entitlements, claim email, webhook), `ifunnel/docs/specs/2026-10-08-billing-paddle-design.md`.

**Repo / nhánh / worktree:** repo `/Users/daothinh/ikf-platform`. Nhánh mới **`feat/admin-console-p2`** cắt từ **`feat/admin-console-p1`** — đã kiểm với tip **`e1b92cf`** (`chore: declare playwright for the demo e2e; admin.yml curl timeouts and job timeout; runbook lockout recovery`). Code nằm trong worktree mới **`/Users/daothinh/ikf-platform-admin-p2`** (Task 1 tạo; controller có thể đã tạo sẵn — khi đó Task 1 Step 1 chỉ kiểm). PR sau này vào base `feat/admin-console-p1`. **Không bao giờ** đụng working tree `/Users/daothinh/ikf-platform-*` khác (session khác dùng: `-admin`, `-demo`, `-demo-purchase`, `-entitlement`, `-billing`); `~/ikame/funnel/funnel-development` chỉ đọc. Mọi lệnh trong plan chạy từ gốc worktree mới. Quy ước repo: `CLAUDE.md` ở gốc repo.

**Môi trường chạy test (local):**
```bash
cd /Users/daothinh/ikf-platform-admin-p2
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock          # Docker qua colima (colima start)
export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock     # Testcontainers (Postgres)
export TF_PLUGIN_CACHE_DIR=$HOME/.terraform.d/plugin-cache            # Terraform (chỉ mock provider; không bao giờ apply)
```
Demo (Task 7, 14, 15) cần thêm: `docker compose` (README demo), Chromium của Playwright (`~/Library/Caches/ms-playwright`; thiếu thì `npx playwright install chromium`), funnel `witch-power` ở `~/ikame/funnel/funnel-development/nebula/witch-power/demo.html` (e2e tự skip nếu thiếu). **`npm run demo:test` không bao giờ chạy song song với một demo test khác** (cổng cố định); nếu cổng bận vì session khác đang chạy demo, đợi rồi chạy lại, không kill gì.

Số test ghi ở mỗi task là số **thật** khi chạy toàn bộ code của plan này trên bản sao `feat/admin-console-p1@e1b92cf` (Node 26, colima, 2026-10-11); mỗi khối code / patch trong plan được sinh trực tiếp từ cây đã chạy test đó (trùng từng byte), bước "FAIL" được chạy thật trên cây chưa có phần implement của task; sau cùng toàn bộ plan được áp lại theo thứ tự lên một bản `e1b92cf` sạch thứ hai và so khớp với cây đã chạy (chỉ khác `package-lock.json`/artefact của `npm install`). Mốc ban đầu tại `e1b92cf`: core-api **408** (43 file), admin SPA **44** (7 file), funnel-lint **31** (2 file), cli **129** (13 file), `npm run demo:test` **113** (19 file), sdk **159** (11 file, bundle **8154** byte gzip), edge-router **106** (7 file), event-schema **145**, paddle **31**, route-match **35**, event-consumer **8 + 27**; Terraform edge **11**, core-service **6**, stack **12**.

Nếu lúc thực thi `feat/admin-console-p1` đã đi xa hơn `e1b92cf`: chạy lại mốc (Task 1 Step 2); số khác thì ghi lại và chỉnh các con số "Expected" theo chênh lệch; patch không áp được thì đọc phần code tương ứng và áp tay đúng nội dung, không sửa gì ngoài phạm vi task. `package-lock.json` không in trong plan (không có dependency mới; `npm install` chỉ có thể làm mới lockfile).

## Điều chỉnh so với spec (phát hiện khi đọc code tại `e1b92cf` và chạy thử, 2026-10-11)

| # | Spec | Plan làm | Lý do |
|---|---|---|---|
| A1 | Bảng §2: `PUT /v1/funnels/:slug/prices` "admin", `PUT /v1/apps/:id` "admin", resend "admin" | Khai báo `requireRole(pool, 'router')` (như route ghi app/giá hiện có) | Với người, chỉ admin có grant `router` (= admin); token `router` giữ đúng nghĩa cũ (CLI/CI đang dùng) |
| A2 | "token `router`/`admin` thoả `prices:read`, `apps:read`; token `publisher` thoả `prices:read`" | `tokenGrants`: `['viewer', ...roles, router → prices:read + apps:read, publisher → prices:read]`; token `admin` = mọi grant. Không token nào (trừ admin) có `support` | Lookup bằng token `router` vẫn 403 như test cũ `webhooks.test.js`; CS dùng phiên người |
| A3 | SPA `GRANTS` "cùng bảng" | `apps/admin/src/roles.js` giữ bản sao `GRANTS`; `test/grants.test.jsx` import `USER_GRANTS` của core và so `toEqual` | SPA không phụ thuộc core-api lúc build; test chặn hai bảng lệch nhau |
| A4 | Lookup body "đúng một" trong `{email}`, `{customer_ref}`, `{checkout_id}` | Schema `oneOf: [{required:[email]}, {required:[customer_ref]}, {required:[checkout_id]}]`; route chuyển từ `src/http/apps.js` (chỉ đăng ký khi có `webhookSecrets`) sang `src/http/customers.js` (đăng ký khi có `pool`) | Ajv của Fastify chạy `removeAdditional`: `additionalProperties:false` **bỏ** key lạ chứ không trả 400, nên "đúng một" phải bằng `oneOf` |
| A5 | Report: `customer_ref, created_at, user_id_rotated_at, checkouts…, claim` | Thêm `paddle_customer_id` (có từ v1; CS tra trên Paddle) và `has_email` (SPA làm mờ "Gửi lại" thay vì nhận 409). `entitlements[]` đúng 6 field spec (bỏ `updated_at`). `checkouts[]` = checkout có giao dịch của khách (một dòng/checkout, số tiền của giao dịch đầu), mới nhất trước, tối đa 50 | Không lộ PII mới; giao dịch gia hạn mang cùng `checkout_id` (custom_data của subscription) |
| A6 | (không nói) khách chưa có `customer_ref` | Lookup gán `customer_ref` nếu còn NULL (`customerRef()`, như link/recompute vẫn làm) | Mọi hành động console và URL `/customers/:ref` gọi khách bằng ref; khách mua funnel chưa gắn app chưa từng có ref |
| A7 | `{checkout_id}` tra khách | Khách của checkout **đã thanh toán**: `transactions.checkout_id` hoặc `claim_tokens.checkout_id`; checkout `created`/`abandoned` không có giao dịch → `{customers: []}` | Bảng `checkouts` không có `customer_id` |
| A8 | `PUT /v1/apps/:id`: body ⊆ 7 field, ≥ 1, `additionalProperties:false`, "không đổi kind/handoff", "validate như checkApp" | Gộp với dòng hiện có rồi `checkApp`; field của kind khác (`return_url` cho app, `adjust_tracker_url`/`deeplink_scheme`/`deeplink_path` cho web) → `400 invalid_app [{field, reason:'kind'}]`; body chỉ còn `kind`/`handoff` (Fastify đã bỏ) → `400 no_fields`; `404 app_not_found {id}` (như `rotate-key`); audit `app.update {id, fields}` (tên field đã sắp) trong transaction | Lý do Fastify như A4; không để cột vô nghĩa với kind |
| A9 | Webhooks "`before` (id cursor) → `{items, next_before, counts}`" | `before` = id số của dòng `webhook_deliveries` (item vẫn chỉ có `event_id`); `next_before` = id dòng cuối khi trang đầy, không thì `null`; `counts` = mọi delivery của app theo status, không phụ thuộc bộ lọc | Cursor ổn định theo thứ tự `id DESC` đang dùng |
| A10 | `@ikf/paddle` "thêm `listPrices({status, include})` (dùng `pages()`)" | `pages()` là closure trong `createPaddleClient` → `listPrices` thêm ngay trong object trả về, gọi `pages()` trực tiếp (không export gì mới); mặc định `status=['active'], include=['product']`, `per_page=200`. Core xin `['active','archived']` | Giá đã map rồi bị archive vẫn có nhãn (badge "Giá đã lưu trữ") |
| A11 | "cache in-process 60 s; lỗi Paddle → 503" | `priceCatalog(paddle, {now})` tạo một lần mỗi `buildApp` (trong `pricesHttp`), `now` lấy từ `deps`; lỗi không cache; **mọi** `PaddleError` → `503 paddle_unavailable` (khoá sai vẫn alarm `paddle_auth_failed` qua `paddleHttpError`) | `paddleHttpError` cũ trả nguyên lỗi `client`/`not_found` (→ 500) |
| A12 | `planKeysFromHtml` chuyển sang `@ikf/funnel-lint` | File mới `packages/funnel-lint/src/plans.js` (rename từ CLI), `index.js` re-export; test `plans.test.js` rename theo (cli −4, funnel-lint +4); CLI `publish.js` import từ `@ikf/funnel-lint` | Giữ package không dependency, không Node built-in |
| A13 | "Server trích khi upload"; GET trả `plan_keys` "của bản mới nhất có `plan_keys`", "Upload lại để đọc plan" | Trang không có plan lưu `[]` (biết là không có), bản cũ NULL; GET khi không bản nào có → `plan_keys: null, unmapped: []`. **Upload lại đúng file cũ** (trùng sha256 → không tạo bản) vẫn điền `plan_keys` cho bản đó nếu đang NULL | Không thì nút "upload lại để đọc plan" vô dụng với file không đổi |
| A14 | "Vòng tắt nguồn không còn giữ nguyên vì manual nằm trong desired" | Đúng như vậy: `loadSources` trả thêm `manual` (grant `revoked_at IS NULL`, cả grant đã hết hạn → inactive); `source_id = String(id)`; grant đã thu hồi không còn trong `desired` → vòng cũ tắt nó và đánh dấu app đổi → webhook | Không sửa `recompute` |
| A15 | `resend-email`: `404 no_claim` / `409 no_email` | Kiểm `409 no_email` trước `404 no_claim`; chọn claim `created_at DESC` của app kind `app`; `expires_at = GREATEST(expires_at, now()+7d)`. `rotate-user-id` sau commit gọi resend và bỏ qua **cả** `404 no_claim` lẫn `409 no_email` (`email_queued:false`); resend đó ghi audit `customer.resend_email` riêng | Đã xoay xong thì không được trả lỗi vì thiếu email (Review Focus 2) |
| A16 | `POST /v1/customers/:ref/grants` "`400 invalid_grant {field}` (app không tồn tại, key sai, hạn trong quá khứ)" | Thêm: hạn không phải ngày, lý do rỗng/ > 200 ký tự (sau trim) → `invalid_grant` `expires_at`/`reason`; schema cho chuỗi dài hơn để lỗi là `invalid_grant` chứ không `bad_request`; `404 customer_not_found`; insert + audit + `lockCustomer` + `recompute` cùng transaction; trả `{grant, entitlements}` (entitlements mọi app) | Spec: reason 1..200 |
| A17 | Audit "ghi trong transaction của thay đổi" | `webhook.resend` ghi trong transaction của `resendDelivery` khi có `actor` (HTTP); gọi trực tiếp không actor (test cũ) không đổi. `billing.reconcile` ghi sau khi chạy xong, lỗi thì không ghi | `reconcile` không có transaction (spec: "reconcile ghi sau khi xong") |
| A18 | Rate limit "thêm `/v1/customers/*`, `/v1/paddle/*` vào nhóm identity" | Luật identity là tập `in` đường dẫn chính xác: thêm `"/v1/paddle/prices"` vào `rate_limited_paths` và biến mới `rate_limited_prefixes = ["/v1/customers/"]` → `or starts_with(http.request.uri.path, "/v1/customers/")`; validation cấm tiền tố phủ `/v1/paddle/webhook`. Test cũ `paddle_webhook_is_never_rate_limited` kiểm `/v1/paddle/webhook` và tiền tố `"/v1/paddle/"` thay cho mọi chuỗi `/v1/paddle` | `/v1/paddle/*` sẽ chặn cả webhook Paddle (Paddle retry, mất sự kiện billing) |
| A19 | e2e "cổng riêng như e2e đợt 1, DB `ikf_admin_test`" | Cổng **8857/8158/8859** (edge/core/media), proxy **8858**, demo **8861**, admin **8862**; DB Postgres + ClickHouse **`ikf_admin_p2_test`**; thư mục build SPA riêng `demo/.build/admin-p2/`; email người mua mới mỗi lần chạy | `ikf_admin_test` là của e2e đợt 1; DB e2e giữ dữ liệu giữa các lần chạy |
| A20 | e2e "app giả hiện key mới … app giả FREE cho đến khi mở link mới" | Phía người mua/app đi bằng HTTP qua proxy demo (như `purchase.test.mjs`): app giả = `check-purchased` (đúng endpoint trang app giả gọi). "Hiện key mới" = sau grant `premium` không hạn, `check-purchased` trả `expires_at: null` (app giả hiện "Vĩnh viễn"); thu hồi → về hạn của subscription. Chromium chỉ cho console | Proxy chỉ nhận Host `demo.test` (https qua tunnel); Chromium không tới được |
| A21 | Demo seed `support@ikameglobal.com` | `seedSupportUser(pool)` khi có `--admin-user` (không đổi role nếu đã có); đăng nhập local vẫn chỉ `--admin-user` (admin). e2e tạo phiên support trực tiếp và đặt cookie bằng Playwright `domain`+`path` | Chromium từ chối cookie `__Host-` đặt theo `url` http (đã thử) |
| A22 | SPA: `App.jsx` routes, nav ẩn theo grants | Mỗi màn thêm route + mục menu trong task của nó (Task 2 tạo bảng `NAV` + `RequireGrant`); route bị chặn hiện "Cần quyền <grant>." | Mỗi task tự test được màn của nó qua `renderApp` |
| A23 | Tab Giá: "Lưu = một PUT; lỗi 422 hiện theo dòng" | PUT chỉ gửi dòng **thay đổi** (chọn/dán giá mới, đổi discount/key) và dòng **Gỡ** (`null`); dòng không đụng không gửi; không có gì đổi → "Không có gì thay đổi." Bảng = `plan_keys` (thứ tự server) rồi plan chỉ có giá (A–Z) | Gửi lại giá đã archive sẽ bị Paddle từ chối và chặn cả lần lưu (Review Focus 4) |
| A24 | Apps chi tiết; Funnel "tab Giá" | Không có `GET /v1/apps/:id`: trang chi tiết đọc `GET /v1/apps`. Tab = `role="tablist"` ("Tổng quan / Giá" chỉ khi có `prices:read`; "Thông tin / Webhooks") | Không thêm route đọc mới |
| A25 | Màn Khách hàng | URL chi tiết `/customers/:ref` (không bao giờ có email); ngày hết hạn trong dialog cấp quyền = cuối ngày UTC (`T23:59:59Z`); "Thu hồi" ở bảng "Cấp thủ công" trong khối Quyền (grant thua subscription vẫn thu hồi được) | Spec E10: email không vào URL |
| A26 | CLI `ikf customer show <email|cus_…>` | In thêm các khối report v2 chỉ khi có dữ liệu; không còn dòng `user_id`. `api.lookupCustomer(q)` nhận chuỗi email (như cũ) hoặc object | Test cũ `app.test.js` chỉ mất đúng dòng `user_id` |

## Global Constraints

- Code trong repo `ikf-platform`, nhánh `feat/admin-console-p2` (từ `feat/admin-console-p1@e1b92cf`), worktree `/Users/daothinh/ikf-platform-admin-p2`, PR base `feat/admin-console-p1`. JavaScript (không TypeScript). HTML funnel **không sửa**.
- **Log không email khách, không `user_id`, không `err.message`** (chỉ code). Log của route khách chỉ `customer_ref` + code (spec §2: "Log chỉ `customer_ref` + code").
- **Audit không bao giờ chứa `user_id`, secret, email khách**; target `customer:<customer_ref>`, `app:<id>`, `billing`. Hành động mới đúng spec: `app.update {id, fields}`, `webhook.resend {app_id, event_id}`, `customer.resend_email {customer_ref, checkout_id}`, `customer.rotate_user_id {customer_ref}`, `entitlement.grant {customer_ref, app_id, key, expires_at, grant_id}`, `entitlement.revoke {customer_ref, grant_id}`, `billing.reconcile {since_seconds, enqueued}`. "Ghi trong transaction của thay đổi; reconcile ghi sau khi xong."
- **Body lookup không có `user_id`, không có email** ("email là input"); response có PII → `cache-control: no-store`.
- Grants (core `USER_GRANTS` = SPA `GRANTS`): viewer `viewer`; support `viewer, support`; editor `viewer, editor, publisher, prices:read, apps:read`; admin tất cả (`viewer, support, editor, publisher, prices:read, apps:read, router, admin`). Token `ikf_` giữ nghĩa; token `router`/`admin` thoả `prices:read`, `apps:read`; token `publisher` thoả `prices:read`. Self-lockout đợt 1 giữ.
- Cookie phiên / CSRF **không đổi** so với đợt 1 (`__Host-ikf_admin`, `X-Ikf-Csrf` mọi request ghi bằng cookie).
- SPA: dependency runtime **không đổi**: `react`, `react-dom`, `react-router`, `qrcode`, `@ikf/funnel-lint`, `@ikf/route-match`; một file CSS (`src/styles.css`); không UI kit.
- `@ikf/funnel-lint` **không dependency, không Node built-in** (chạy trong SPA).
- Demo: cổng cố định, `npm run demo:test` chạy một mình, tuần tự. e2e đợt này: cổng `8857/8158/8859/8858/8861/8862`, DB `ikf_admin_p2_test`. Không bao giờ `terraform apply`.
- Bundle SDK không đổi (**8154** byte gzip).
- **Test cũ giữ nguyên ý nghĩa**; chỉ được sửa đúng các chỗ sau:
  - Task 1: `services/core-api/test/migrate.test.js` (thêm `006_admin_p2.sql` và bảng `manual_grants`), `test/helpers/db.js` (TRUNCATE `manual_grants`).
  - Task 2: `packages/cli/test/admin.test.js` (chuỗi `viewer|support|editor|admin` + một test mới), `apps/admin/test/helpers.jsx` (`ME.support`).
  - Task 3: `services/core-api/test/compute.test.js` (chỉ thêm `describe` mới cuối file).
  - Task 5: `services/core-api/test/web-funnel-auth.test.js` (test "CS lookup … shows the user_id" đảo lại thành "never shows" — spec §2 bỏ `user_id`), `packages/cli/test/app.test.js` (bỏ đúng dòng in `user_id`).
  - Task 7: `services/core-api/test/helpers/paddle.js` (`price()` thêm field tuỳ chọn, `listPrices`), `packages/paddle/test/client.test.js` và `demo/test/paddle-fake.test.mjs` (chỉ thêm test).
  - Task 8: `packages/cli/test/plans.test.js` rename sang `packages/funnel-lint/test/plans.test.js` (chỉ đổi đường import).
  - Task 9: `services/core-api/test/reconcile.test.js` (chỉ thêm `describe` mới cuối file).
  - Task 10–13: `apps/admin/test/helpers.jsx` (thêm method giả), `apps/admin/test/grants.test.jsx` (danh sách menu theo màn mới; file của đợt này).
  - Task 14: `infra/modules/edge/tests/edge.tftest.hcl` (assert webhook Paddle hẹp lại theo A18 + run mới).

## Review Focus

1. **Cấp quyền cho app mà khách chưa từng liên kết** (khách mua funnel app A, CS cấp ở app B dùng IKameSDK): người dùng mong quyền bật, `check-purchased` theo bundle của app B nói pro, không webhook nào bị xếp vì không có link. Test: Task 4 `a grant for an app the customer has no link to: entitlement on, no webhook, IKameSDK check-purchased says pro there`.
2. **Cấp lại `user_id` khi khách không có email (Paddle không trả) hoặc chưa từng có email link app**: mong việc xoay vẫn xong, trả `email_queued:false`, không lỗi 409/404 sau khi đã commit. Test: Task 6 `rotate with no email or no claim: rotated anyway, email_queued false, no resend audit`; CLI Task 6 `rotate-user-id … needs --yes` (thông điệp KHÔNG gửi được email).
3. **Tra theo checkout id của checkout bỏ dở / chưa trả tiền**: mong "không tìm thấy" (không 500, không lộ khách khác). Test: Task 5 `by customer_ref and by checkout_id: the same customer; a checkout nobody paid (abandoned, unknown) finds no one`; SPA Task 12 `anything else: says what to type; nobody found: says so`.
4. **Giá Paddle bị archive sau khi đã map**: mong tab Giá vẫn hiện nhãn đúng + badge "Giá đã lưu trữ", và lưu các dòng khác không bị chặn vì gửi lại giá archive. Test: Task 7 catalog `active and archived prices…`; Task 10 `one row per plan … Giá đã lưu trữ …` và `an archived mapped price is not resent when other rows change; nothing changed → no PUT`.
5. **Support bấm một thao tác chỉ admin qua SPA** (Cấp quyền, Cấp lại `user_id`, Thu hồi, Billing, Giá): mong nút mờ có lý do, route chặn hiện "Cần quyền …", và API vẫn 403 nếu gọi thẳng. Test: Task 12 `support sees the admin actions greyed out (Cấp quyền, Cấp lại user_id, Thu hồi)`; Task 13 `%s: no Billing in the menu, the page needs admin, nothing is called`; Task 10 `editors and admins see the tab; viewers and support do not`; Task 6/4 bảng role; Task 14 e2e (support `POST …/grants` → 403).

## File Structure (repo `ikf-platform`, phần mới/sửa)

```
ikf-platform/
├── CLAUDE.md                                        # SỬA: bảng grants, không user_id/email trong console, demo
├── docs/runbooks/admin-console.md                   # SỬA: §11 Role support, §12 Hỗ trợ khách
├── services/core-api/
│   ├── migrations/006_admin_p2.sql                  # MỚI: role support, manual_grants, versions.plan_keys, customers.user_id_rotated_at, source manual
│   ├── src/auth.js                                  # SỬA: USER_ROLES + support, USER_GRANTS (export), token grants
│   ├── src/app.js                                   # SỬA: đăng ký http/customers.js
│   ├── src/http/customers.js                        # MỚI: lookup v2, resend-email, rotate-user-id, grants
│   ├── src/http/{apps,prices,billing,versions}.js   # SỬA: PUT /v1/apps/:id, webhooks cursor, GET /v1/paddle/prices, audit, plan_keys
│   ├── src/identity/{grants,customer-actions}.js    # MỚI: cấp/thu hồi quyền; gửi lại email, xoay user_id
│   ├── src/identity/{customers,compute,entitlements,apps,webhooks}.js   # SỬA: report v2, nguồn manual, updateApp, listDeliveries
│   ├── src/billing/catalog.js                       # MỚI: priceCatalog (cache 60 s), priceView
│   ├── src/billing/prices.js, src/publisher/publish.js   # SỬA: plan_keys, unmapped
│   └── test/{admin-p2-schema,roles-p2,manual-grants,grants,customer-report,customer-actions,paddle-catalog,plan-keys,apps-p2}.test.js (mới);
│       sửa test/{migrate,compute,web-funnel-auth,reconcile}.test.js, test/helpers/{db,paddle}.js
├── packages/paddle/src/index.js + test/client.test.js     # SỬA: listPrices
├── packages/funnel-lint/src/{index.js, plans.js (rename từ cli)} + test/plans.test.js (rename từ cli)
├── packages/cli/src/{main,api,publish}.js           # SỬA: admin --role support, customer show|grant|revoke|resend-email|rotate-user-id, app update
│   └── test/{customer,app-update}.test.js (mới); test/{admin,app}.test.js (sửa)
├── apps/admin/src/
│   ├── roles.js, Layout.jsx, App.jsx, api.js, format.js, styles.css   # SỬA: GRANTS, NAV, routes, client, priceLabel
│   ├── components/{RequireGrant,PricesTab,SecretsBox,FieldErrors}.jsx  # MỚI
│   ├── pages/{Apps,AppDetail,Customers,CustomerDetail,Billing}.jsx     # MỚI
│   ├── pages/{Users,FunnelDetail,Audit}.jsx                            # SỬA
│   └── ../test/{grants,prices-tab,apps,customers,billing}.test.jsx (mới); test/helpers.jsx (sửa)
├── demo/lib/{paddle-fake,admin,stack}.mjs, demo/README.md   # SỬA: listPrices + catalog, seedSupportUser
│   └── test/admin-p2-e2e.test.mjs (mới); test/paddle-fake.test.mjs (sửa)
└── infra/modules/edge/{main.tf, variables.tf, tests/edge.tftest.hcl}   # SỬA: rate_limited_prefixes, /v1/paddle/prices
```

---

### Task 1: Nhánh + worktree; mốc ban đầu; migration `006_admin_p2.sql`

**Files:**
- Create: `services/core-api/migrations/006_admin_p2.sql`
- Test: `services/core-api/test/admin-p2-schema.test.js` (mới); Modify: `services/core-api/test/migrate.test.js`, `services/core-api/test/helpers/db.js`

**Interfaces:**
- Consumes: `migrate(pool)` (`src/db/migrate.js`), `startDb`/`resetDb` (`test/helpers/db.js`); bảng đợt 1 (`admin_users` với constraint `admin_users_role_check`), `entitlements_source_check` (004).
- Produces: `admin_users_role_check` = `role IN ('admin','editor','support','viewer')`; bảng `manual_grants (id BIGSERIAL, customer_id → customers, app_id → apps, key CHECK ^[a-z0-9_]{1,40}$ (manual_grants_key_check), expires_at NULL, reason 1..200 (manual_grants_reason_check), granted_by, created_at, revoked_at NULL, revoked_by NULL, manual_grants_revoked_check: cả hai NULL hoặc cả hai có)` + index `manual_grants_live (customer_id) WHERE revoked_at IS NULL`; `entitlements_source_check` thêm `'manual'`; `versions.plan_keys TEXT[] NULL`; `customers.user_id_rotated_at TIMESTAMPTZ NULL`. `resetDb` TRUNCATE thêm `manual_grants`.

- [ ] **Step 1: Tạo nhánh + worktree (ghi lại SHA)**

```bash
git -C /Users/daothinh/ikf-platform rev-parse --short feat/admin-console-p1
# đã kiểm với e1b92cf; khác thì xem ghi chú ở đầu plan
git -C /Users/daothinh/ikf-platform worktree add -b feat/admin-console-p2 /Users/daothinh/ikf-platform-admin-p2 feat/admin-console-p1
cd /Users/daothinh/ikf-platform-admin-p2
npm install
```

Nếu controller đã tạo sẵn worktree: chỉ kiểm `git -C /Users/daothinh/ikf-platform-admin-p2 rev-parse --abbrev-ref HEAD` in `feat/admin-console-p2` và `git log -1 --format=%h` là tip của `feat/admin-console-p1`, rồi `npm install` (từ gốc worktree, không `-w .`). Không `checkout` trong các worktree khác.

- [ ] **Step 2: Chạy mốc ban đầu**

```bash
npm test -w @ikf/paddle -w @ikf/event-schema -w @ikf/funnel-lint -w @ikf/sdk -w @ikf/cli -w @ikf/edge-router -w @ikf/event-consumer -w @ikf/core-api -w @ikf/route-match -w @ikf/admin 2>&1 | grep -E "Test Files|Tests  |bytes gzip"
npm run demo:test 2>&1 | grep -E "Test Files|Tests  "
for d in infra/modules/edge infra/modules/core-service infra/stack; do (cd $d && terraform init -backend=false -input=false >/dev/null && terraform test -no-color | tail -1); done
```

Expected (tại `e1b92cf`): paddle `2`/`31`, event-schema `1`/`145`, funnel-lint `2`/`31`, sdk `11`/`159`, cli `13`/`129`, edge-router `7`/`106` (`ikf sdk d1a533c86611: 8154 bytes gzip`), event-consumer `2`/`8` + `1`/`27`, core-api `43`/`408`, route-match `1`/`35`, admin `7`/`44`; demo `19`/`113`; Terraform `Success! 11 passed`, `6 passed`, `12 passed`.

- [ ] **Step 3: Viết test fail**

`services/core-api/test/admin-p2-schema.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';

describe('006_admin_p2 schema', () => {
  let db;
  let customerId;
  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    customerId = (await db.pool.query("INSERT INTO customers (paddle_customer_id, email) VALUES ('ctm_1', 'a@b.co') RETURNING id")).rows[0].id;
    await db.pool.query(
      `INSERT INTO apps (id, name, kind, adjust_tracker_url, deeplink_scheme, webhook_url, api_key_hash)
       VALUES ('starlyn', 'Starlyn', 'app', 'https://app.adjust.com/abc', 'starlyn', 'https://be.example/hook', 'h1')`,
    );
  });

  const grant = (o = {}) =>
    db.pool.query(
      `INSERT INTO manual_grants (customer_id, app_id, key, expires_at, reason, granted_by)
       VALUES ($1, $2, $3, $4, $5, 'boss@ikameglobal.com') RETURNING id, created_at, revoked_at, revoked_by`,
      [o.customer ?? customerId, o.app ?? 'starlyn', o.key ?? 'premium', o.expires ?? null, o.reason ?? 'CS ticket 42'],
    );

  it('admin_users.role adds support (viewer | support | editor | admin)', async () => {
    const add = (email, role) => db.pool.query("INSERT INTO admin_users (email, role, created_by) VALUES ($1, $2, 't')", [email, role]);
    for (const role of ['viewer', 'support', 'editor', 'admin']) await add(`${role}@ikameglobal.com`, role);
    await expect(add('x@ikameglobal.com', 'owner')).rejects.toThrow(/admin_users_role_check/);
  });

  it('manual_grants: customer and app must exist, key like an entitlement key, reason 1..200, revoked_at and revoked_by together', async () => {
    const { rows } = await grant();
    expect(rows[0]).toMatchObject({ revoked_at: null, revoked_by: null });
    expect(rows[0].created_at).toBeInstanceOf(Date);
    await expect(grant({ customer: 999 })).rejects.toThrow(/manual_grants_customer_id_fkey/);
    await expect(grant({ app: 'nope' })).rejects.toThrow(/manual_grants_app_id_fkey/);
    await expect(grant({ key: 'Premium!' })).rejects.toThrow(/manual_grants_key_check/);
    await expect(grant({ reason: '' })).rejects.toThrow(/manual_grants_reason_check/);
    await expect(grant({ reason: 'x'.repeat(201) })).rejects.toThrow(/manual_grants_reason_check/);
    await expect(db.pool.query('UPDATE manual_grants SET revoked_at = now() WHERE id = $1', [rows[0].id])).rejects.toThrow(/manual_grants_revoked_check/);
    await db.pool.query("UPDATE manual_grants SET revoked_at = now(), revoked_by = 'boss@ikameglobal.com' WHERE id = $1", [rows[0].id]);
    const idx = await db.pool.query("SELECT indexdef FROM pg_indexes WHERE tablename = 'manual_grants' AND indexname = 'manual_grants_live'");
    expect(idx.rows[0].indexdef).toMatch(/\(customer_id\) WHERE \(revoked_at IS NULL\)/);
  });

  it('entitlements.source adds manual; versions.plan_keys and customers.user_id_rotated_at are NULL by default', async () => {
    const ent = (source) =>
      db.pool.query("INSERT INTO entitlements (customer_id, app_id, key, active, source, source_id) VALUES ($1, 'starlyn', $2, true, $2, '1')", [customerId, source]);
    await ent('manual');
    await expect(ent('gift')).rejects.toThrow(/entitlements_source_check/);
    const f = (await db.pool.query("INSERT INTO funnels (slug, created_by) VALUES ('witch-power', 't') RETURNING id")).rows[0].id;
    const v = await db.pool.query(
      "INSERT INTO versions (funnel_id, n, sha256, r2_key, size, created_by) VALUES ($1, 1, 's', 'k', 1, 't') RETURNING plan_keys",
      [f],
    );
    expect(v.rows[0].plan_keys).toBeNull();
    await db.pool.query("UPDATE versions SET plan_keys = '{1w,addon}'");
    expect((await db.pool.query('SELECT plan_keys FROM versions')).rows[0].plan_keys).toEqual(['1w', 'addon']);
    expect((await db.pool.query('SELECT user_id_rotated_at FROM customers')).rows[0].user_id_rotated_at).toBeNull();
  });
});
```

`services/core-api/test/migrate.test.js` và `services/core-api/test/helpers/db.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/test/helpers/db.js b/services/core-api/test/helpers/db.js
index 89fbf7b..e7b8fcc 100644
--- a/services/core-api/test/helpers/db.js
+++ b/services/core-api/test/helpers/db.js
@@ -20,6 +20,6 @@ export async function resetDb(pool) {
     `TRUNCATE route_events, routes, host_revs, versions, funnels, domains, api_tokens,
               funnel_prices, checkouts, transactions, subscriptions, customers, webhook_inbox, outbox,
               apps, entitlements, app_links, claim_tokens, otp_codes, magic_links, webhook_deliveries, sync_failures,
-              entitlement_recompute, admin_sessions, admin_users, audit_log RESTART IDENTITY CASCADE`,
+              entitlement_recompute, admin_sessions, admin_users, audit_log, manual_grants RESTART IDENTITY CASCADE`,
   );
 }
diff --git a/services/core-api/test/migrate.test.js b/services/core-api/test/migrate.test.js
index 3ce000b..3a625b1 100644
--- a/services/core-api/test/migrate.test.js
+++ b/services/core-api/test/migrate.test.js
@@ -10,14 +10,14 @@ describe('migrate', () => {
   afterAll(() => db.stop());
 
   it('applies the publisher schema once and is idempotent', async () => {
-    expect(await migrate(db.pool)).toEqual(['001_publisher.sql', '002_funnel_pixel.sql', '003_billing.sql', '004_entitlements.sql', '005_admin.sql']);
+    expect(await migrate(db.pool)).toEqual(['001_publisher.sql', '002_funnel_pixel.sql', '003_billing.sql', '004_entitlements.sql', '005_admin.sql', '006_admin_p2.sql']);
     expect(await migrate(db.pool)).toEqual([]);
     const { rows } = await db.pool.query(
       "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY 1",
     );
     expect(rows.map((r) => r.table_name)).toEqual([
       'admin_sessions', 'admin_users', 'api_tokens', 'app_links', 'apps', 'audit_log', 'checkouts', 'claim_tokens', 'customers', 'domains', 'entitlement_recompute', 'entitlements',
-      'funnel_prices', 'funnels', 'host_revs', 'magic_links', 'otp_codes', 'outbox', 'route_events', 'routes',
+      'funnel_prices', 'funnels', 'host_revs', 'magic_links', 'manual_grants', 'otp_codes', 'outbox', 'route_events', 'routes',
       'schema_migrations', 'subscriptions', 'sync_failures', 'transactions', 'versions', 'webhook_deliveries', 'webhook_inbox',
     ]);
   });
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/admin-p2-schema.test.js test/migrate.test.js 2>&1 | grep -E "×|Tests  "
```

Expected: 3 test `006_admin_p2 schema` FAIL (`TRUNCATE` bảng `manual_grants` chưa có) và `migrate > applies the publisher schema once and is idempotent` FAIL; `Tests  4 failed | 4 passed (8)`.

- [ ] **Step 5: Implement**

`services/core-api/migrations/006_admin_p2.sql` (mới):

```sql
-- Admin console phase 2 (spec admin-console-p2 §1): role support, manual grants, plan keys per version,
-- user_id rotation, and 'manual' as an entitlement source.
ALTER TABLE admin_users DROP CONSTRAINT admin_users_role_check;
ALTER TABLE admin_users ADD CONSTRAINT admin_users_role_check CHECK (role IN ('admin', 'editor', 'support', 'viewer'));

-- An entitlement an admin gives by hand (CS goodwill, a payment Paddle never reported). Never deleted:
-- revoking sets revoked_at/revoked_by and recomputes. granted_by/revoked_by = the admin's email or token name.
CREATE TABLE manual_grants (
  id         BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customers (id),
  app_id     TEXT NOT NULL REFERENCES apps (id),
  key        TEXT NOT NULL CONSTRAINT manual_grants_key_check CHECK (key ~ '^[a-z0-9_]{1,40}$'),
  expires_at TIMESTAMPTZ NULL,
  reason     TEXT NOT NULL CONSTRAINT manual_grants_reason_check CHECK (length(reason) BETWEEN 1 AND 200),
  granted_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ NULL,
  revoked_by TEXT NULL,
  CONSTRAINT manual_grants_revoked_check CHECK ((revoked_at IS NULL) = (revoked_by IS NULL))
);
CREATE INDEX manual_grants_live ON manual_grants (customer_id) WHERE revoked_at IS NULL;

ALTER TABLE entitlements DROP CONSTRAINT entitlements_source_check;
ALTER TABLE entitlements ADD CONSTRAINT entitlements_source_check CHECK (source IN ('subscription', 'one_time', 'manual'));

-- Plan keys of the uploaded HTML (CONFIG.plans / CONFIG.checkoutUrl); NULL for versions uploaded before 006.
ALTER TABLE versions ADD COLUMN plan_keys TEXT[] NULL;

-- When an admin last gave the buyer a new user_id (the old one leaked); NULL = never.
ALTER TABLE customers ADD COLUMN user_id_rotated_at TIMESTAMPTZ NULL;
```

- [ ] **Step 6: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/admin-p2-schema.test.js test/migrate.test.js 2>&1 | grep -E "Tests  "
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  8 passed (8)`; toàn bộ core-api `Test Files  44 passed (44)`, `Tests  411 passed (411)`.

- [ ] **Step 7: Commit**

```bash
git add services/core-api
git commit -m "feat(core-api): migration 006 role support, manual_grants, versions.plan_keys, customers.user_id_rotated_at, entitlement source manual"
```

---

### Task 2: Role `support` + bảng grants (core, CLI, SPA), menu theo grants, `RequireGrant`, Users

**Files:**
- Modify: `services/core-api/src/auth.js`, `src/http/prices.js` (`GET …/prices` → `prices:read`), `src/http/apps.js` (`GET …/webhooks` → `apps:read`, lookup → `support`); `packages/cli/src/main.js`; `apps/admin/src/{roles.js, Layout.jsx, pages/Users.jsx}`
- Create: `apps/admin/src/components/RequireGrant.jsx`
- Test: `services/core-api/test/roles-p2.test.js`, `apps/admin/test/grants.test.jsx` (mới); Modify: `packages/cli/test/admin.test.js`, `apps/admin/test/helpers.jsx`

**Interfaces:**
- Consumes: `requireRole(pool, grant | grant[])`, `authenticate` (đợt 1); `signIn(pool, email, role)` (`test/helpers/admin.js`); `fakePaddle`, `seedApp`, `fakeSecrets`.
- Produces:
  - core `src/auth.js`: `USER_ROLES = ['viewer','support','editor','admin']`, `export const USER_GRANTS = {viewer, support, editor, admin}` (bảng spec §1); token grants theo A2. Route: `GET /v1/funnels/:slug/prices` `'prices:read'`; `GET /v1/apps/:id/webhooks` `'apps:read'`; `POST /v1/customers/lookup` `'support'`. `POST /v1/admin/users` nhận `role: 'support'` (enum từ `USER_ROLES`).
  - CLI: `ADMIN_ROLES = ['viewer','support','editor','admin']`, lỗi `cần --role viewer|support|editor|admin`.
  - SPA `src/roles.js`: `GRANTS` (= `USER_GRANTS`), `ROLES`, `ROLE_INFO`, `can(role, need)` (tra bảng; role lạ → false). `src/Layout.jsx`: `export const NAV = [{to, label, need}]` lọc theo `can`. `src/components/RequireGrant.jsx`: `RequireGrant({need, children})` → children hoặc `<p className="muted">Cần quyền {need}.</p>`. Users: dropdown 4 role + `data-testid="role-info"` mô tả role chọn.
  - Test helper SPA: `ME.support` (`cs@ikameglobal.com`).

- [ ] **Step 1: Viết test fail**

`services/core-api/test/roles-p2.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, tokenFor, bearer, sha, seedVersions } from './helpers/app.js';
import { ADMIN_ORIGIN, signIn } from './helpers/admin.js';
import { fakeSecrets, seedApp } from './helpers/identity.js';
import { fakePaddle, PRICE_W1 } from './helpers/paddle.js';
import { funnelHtml } from './helpers/pages.js';
import { USER_GRANTS, USER_ROLES } from '../src/auth.js';

// Spec admin-console-p2 §1: role support; grants are a table, not a ladder.
describe('roles: viewer, support, editor, admin', () => {
  let db;
  let app;
  let store;

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    const paddle = fakePaddle();
    paddle.price(PRICE_W1);
    const webhookSecrets = fakeSecrets();
    ({ app, store } = await makeApp(db.pool, { paddle, webhookSecrets, admin: { origin: ADMIN_ORIGIN, appEnv: 'staging' } }));
    await seedVersions(db.pool, store, 'aivideo', 1);
    await seedApp(db.pool, webhookSecrets);
  });
  afterEach(() => app.close());

  it('the grants table (core and SPA share it)', () => {
    expect(USER_ROLES).toEqual(['viewer', 'support', 'editor', 'admin']);
    expect(USER_GRANTS).toEqual({
      viewer: ['viewer'],
      support: ['viewer', 'support'],
      editor: ['viewer', 'editor', 'publisher', 'prices:read', 'apps:read'],
      admin: ['viewer', 'support', 'editor', 'publisher', 'prices:read', 'apps:read', 'router', 'admin'],
    });
  });

  const calls = (headers) => {
    const html = funnelHtml('aivideo', 'two');
    return [
      () => app.inject({ method: 'GET', url: '/v1/funnels/aivideo/prices', headers: headers(false) }),
      () => app.inject({ method: 'GET', url: '/v1/apps/starlyn/webhooks', headers: headers(false) }),
      () => app.inject({ method: 'POST', url: '/v1/customers/lookup', headers: headers(), payload: { email: 'a@b.co' } }),
      () => app.inject({ method: 'PUT', url: '/v1/funnels/aivideo/prices', headers: headers(), payload: { plans: { '1w': { price_id: PRICE_W1 } } } }),
      () => app.inject({ method: 'POST', url: '/v1/funnels/aivideo/versions', headers: headers(), payload: { html, sha256: sha(html) } }),
      () => app.inject({ method: 'GET', url: '/v1/admin/users', headers: headers(false) }),
    ];
  };

  // read prices, read webhooks, look up a customer, set prices, upload, list users
  it.each([
    ['viewer', [403, 403, 403, 403, 403, 403]],
    ['support', [403, 403, 200, 403, 403, 403]],
    ['editor', [200, 200, 403, 403, 201, 403]],
    ['admin', [200, 200, 200, 200, 201, 200]],
  ])('%s: prices read, webhooks read, customer lookup, prices write, upload, users → %j', async (role, codes) => {
    const p = await signIn(db.pool, `${role}@ikameglobal.com`, role);
    const got = [];
    for (const call of calls(p.headers)) got.push((await call()).statusCode);
    expect(got).toEqual(codes);
  });

  it.each([
    ['publisher', [200, 403, 403, 403, 201, 403]],
    ['router', [200, 200, 403, 200, 403, 403]],
    ['admin', [200, 200, 200, 200, 201, 200]],
  ])('token %s keeps its meaning (router, admin: prices:read + apps:read; publisher: prices:read) → %j', async (role, codes) => {
    const token = await tokenFor(db.pool, role);
    const got = [];
    for (const call of calls(() => bearer(token))) got.push((await call()).statusCode);
    expect(got).toEqual(codes);
  });

  it('POST /v1/admin/users takes role support; anything else outside the four is 400', async () => {
    const boss = await signIn(db.pool, 'boss@ikameglobal.com', 'admin');
    const add = (role) => app.inject({ method: 'POST', url: '/v1/admin/users', headers: boss.headers(), payload: { email: `cs-${role}@ikameglobal.com`, role } });
    const res = await add('support');
    expect(res.statusCode).toBe(201);
    expect(res.json()).toMatchObject({ email: 'cs-support@ikameglobal.com', role: 'support' });
    expect((await add('owner')).statusCode).toBe(400);
    const cs = await signIn(db.pool, 'cs@ikameglobal.com', 'support');
    expect((await app.inject({ method: 'GET', url: '/v1/auth/me', headers: cs.headers(false) })).json()).toMatchObject({ role: 'support' });
  });
});
```

`apps/admin/test/grants.test.jsx` (mới):

```jsx
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { USER_GRANTS } from '../../../services/core-api/src/auth.js';
import { AuthProvider } from '../src/auth.jsx';
import { RequireGrant } from '../src/components/RequireGrant.jsx';
import { can, GRANTS, ROLES } from '../src/roles.js';
import { fakeClient, renderApp, ME } from './helpers.jsx';

// Spec admin-console-p2 §1: one grants table for core and SPA; can() looks it up (no ladder).
describe('grants', () => {
  it('the SPA table is the core table; roles in order viewer, support, editor, admin', () => {
    expect(GRANTS).toEqual(USER_GRANTS);
    expect(ROLES).toEqual(['viewer', 'support', 'editor', 'admin']);
  });

  it.each([
    ['viewer', ['viewer']],
    ['support', ['viewer', 'support']],
    ['editor', ['viewer', 'editor', 'publisher', 'prices:read', 'apps:read']],
    ['admin', ['viewer', 'support', 'editor', 'publisher', 'prices:read', 'apps:read', 'router', 'admin']],
  ])('can(%s, …) is true exactly for %j', (role, yes) => {
    const all = ['viewer', 'support', 'editor', 'publisher', 'prices:read', 'apps:read', 'router', 'admin'];
    expect(all.filter((need) => can(role, need))).toEqual(yes);
  });

  it('a support person is not an editor, an editor is not support; unknown role has nothing', () => {
    expect([can('support', 'editor'), can('editor', 'support'), can('owner', 'viewer'), can(undefined, 'viewer')]).toEqual([false, false, false, false]);
  });

  it('RequireGrant: the page for those who have the grant, "Cần quyền …" for the others', async () => {
    const page = (me) => render(
      <MemoryRouter>
        <AuthProvider client={fakeClient(me)}>
          <RequireGrant need="support"><p>Trang khách</p></RequireGrant>
        </AuthProvider>
      </MemoryRouter>,
    );
    page(ME.support);
    expect(await screen.findByText('Trang khách')).toBeTruthy();
    page(ME.editor);
    expect(await screen.findByText('Cần quyền support.')).toBeTruthy();
  });
});

describe('nav by grants', () => {
  const navOf = async (me) => {
    renderApp(fakeClient(me), '/funnels');
    await screen.findByTestId('who');
    return within(screen.getByRole('navigation')).getAllByRole('link').map((a) => a.textContent);
  };

  it.each([
    ['viewer', ['Funnels', 'Domains', 'Audit']],
    ['support', ['Funnels', 'Domains', 'Audit']],
    ['editor', ['Funnels', 'Domains', 'Audit']],
    ['admin', ['Funnels', 'Domains', 'Audit', 'Settings']],
  ])('%s sees %j', async (role, items) => {
    expect(await navOf(ME[role])).toEqual(items);
  });
});

describe('Users: role support with what each role may do', () => {
  it('the new-person and per-row dropdowns list the four roles; the chosen role is described', async () => {
    const client = fakeClient(ME.admin, {
      listUsers: vi.fn(async () => ({ users: [{ id: 2, email: 'cs@ikameglobal.com', name: '', role: 'support', disabled_at: null }] })),
      createUser: vi.fn(async (b) => ({ id: 3, ...b, disabled_at: null })),
    });
    renderApp(client, '/settings/users');
    const row = await screen.findByTestId('user');
    const own = within(row).getByLabelText('Role của cs@ikameglobal.com');
    expect(own.value).toBe('support');
    expect([...own.options].map((o) => o.value)).toEqual(['viewer', 'support', 'editor', 'admin']);
    const pick = screen.getByLabelText('Role mới');
    expect(screen.getByTestId('role-info').textContent).toBe('editor: upload funnel, pixel/app, xem giá và app.');
    fireEvent.change(pick, { target: { value: 'support' } });
    expect(screen.getByTestId('role-info').textContent).toBe('support: tra khách hàng, gửi lại email link app.');
    fireEvent.change(screen.getByPlaceholderText('email@ikameglobal.com'), { target: { value: 'cs2@ikameglobal.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Thêm' }));
    await waitFor(() => expect(client.createUser).toHaveBeenCalledWith({ email: 'cs2@ikameglobal.com', name: '', role: 'support' }));
  });
});
```

`packages/cli/test/admin.test.js` và `apps/admin/test/helpers.jsx` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/test/helpers.jsx b/apps/admin/test/helpers.jsx
index 5faac35..694e38d 100644
--- a/apps/admin/test/helpers.jsx
+++ b/apps/admin/test/helpers.jsx
@@ -6,6 +6,7 @@ import { App } from '../src/App.jsx';
 export const ME = { admin: { email: 'boss@ikameglobal.com', name: 'Boss', role: 'admin', csrf: 'c' } };
 ME.editor = { ...ME.admin, email: 'ed@ikameglobal.com', role: 'editor' };
 ME.viewer = { ...ME.admin, email: 'vi@ikameglobal.com', role: 'viewer' };
+ME.support = { ...ME.admin, email: 'cs@ikameglobal.com', role: 'support' };
 
 // A client with the createClient() surface; every method is a vi.fn, overridable per test.
 export function fakeClient(me = ME.admin, overrides = {}) {
diff --git a/packages/cli/test/admin.test.js b/packages/cli/test/admin.test.js
index 912818d..bd0bbd5 100644
--- a/packages/cli/test/admin.test.js
+++ b/packages/cli/test/admin.test.js
@@ -14,6 +14,15 @@ describe('ikf admin (admin console users, spec admin-console-p1 §6)', () => {
     expect(t.lines).toEqual(['an@ikameglobal.com: admin (đã thêm). Đăng nhập trang admin bằng Google với email này.']);
   });
 
+  // Spec admin-console-p2 §1: CS looks customers up, resends the app-link email; nothing else.
+  it('add --role support', async () => {
+    const calls = [];
+    const t = io({ createAdminUser: async (b) => { calls.push(b); return user({ email: 'cs@ikameglobal.com', role: 'support' }); } });
+    expect(await run(['admin', 'add', 'cs@ikameglobal.com', '--role', 'support'], t.opts)).toBe(0);
+    expect(calls).toEqual([{ email: 'cs@ikameglobal.com', role: 'support' }]);
+    expect(t.lines).toEqual(['cs@ikameglobal.com: support (đã thêm). Đăng nhập trang admin bằng Google với email này.']);
+  });
+
   it('ls: one line per person, disabled ones marked', async () => {
     const t = io({ listAdminUsers: async () => ({ users: [user(), user({ id: 4, email: 'old@ikameglobal.com', role: 'viewer', disabled_at: '2026-10-10T00:00:00.000Z' })] }) });
     expect(await run(['admin', 'ls'], t.opts)).toBe(0);
@@ -38,10 +47,10 @@ describe('ikf admin (admin console users, spec admin-console-p1 §6)', () => {
   });
 
   it.each([
-    [['admin', 'add', 'an@ikameglobal.com'], 'cần --role viewer|editor|admin'],
-    [['admin', 'add', 'an@ikameglobal.com', '--role', 'owner'], 'cần --role viewer|editor|admin'],
+    [['admin', 'add', 'an@ikameglobal.com'], 'cần --role viewer|support|editor|admin'],
+    [['admin', 'add', 'an@ikameglobal.com', '--role', 'owner'], 'cần --role viewer|support|editor|admin'],
     [['admin', 'add', 'not-an-email', '--role', 'viewer'], 'email không hợp lệ: "not-an-email"'],
-    [['admin', 'rm', 'an@ikameglobal.com'], 'ikf admin add <email> --role viewer|editor|admin [--name <tên>]'],
+    [['admin', 'rm', 'an@ikameglobal.com'], 'ikf admin add <email> --role viewer|support|editor|admin [--name <tên>]'],
   ])('exits 2 on bad usage %j', async (argv, msg) => {
     const t = io({ createAdminUser: async () => { throw new Error('must not be called'); } });
     expect(await run(argv, t.opts)).toBe(2);
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/roles-p2.test.js 2>&1 | grep -E "×|Tests  "
npm test -w @ikf/cli -- test/admin.test.js 2>&1 | grep -E "Tests  "
npm test -w @ikf/admin -- test/grants.test.jsx 2>&1 | grep -E "Error|Tests  "
```

Expected: core — `the grants table` FAIL (`USER_GRANTS` chưa export, `USER_ROLES` = `[viewer, editor, admin]`), `support: …` FAIL (`[500,500,500,500,500,500]`: role chưa có trong bảng), `editor: …` FAIL (webhooks 403), `POST /v1/admin/users takes role support` FAIL (400); `Tests  4 failed | 5 passed (9)`. CLI `Tests  4 failed | 5 passed (9)`. SPA `Failed to resolve import "../src/components/RequireGrant.jsx"`, `Tests  no tests`.

- [ ] **Step 3: Implement**

`services/core-api/src/{auth.js, http/prices.js, http/apps.js}` và `packages/cli/src/main.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/packages/cli/src/main.js b/packages/cli/src/main.js
index 3b0aee7..47c7043 100755
--- a/packages/cli/src/main.js
+++ b/packages/cli/src/main.js
@@ -29,7 +29,7 @@ const USAGE = `Cách dùng:
   ikf app rotate-key <id> [--force]   (--force: cả khi key trước còn trong 24h, key đó bị khoá ngay)
   ikf app webhooks <id> [--dead] [--resend <event_id>]
   ikf customer show <email>
-  ikf admin add <email> --role viewer|editor|admin [--name <tên>]   (người dùng trang admin, đăng nhập Google)
+  ikf admin add <email> --role viewer|support|editor|admin [--name <tên>]   (người dùng trang admin, đăng nhập Google; support: tra khách, gửi lại email)
   ikf admin ls
   ikf admin disable <email>   (khoá ngay, mọi phiên đăng nhập kết thúc)
   ikf events replay-dlq --env <staging|prod>   (cần CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN)`;
@@ -205,7 +205,7 @@ async function customerCommand(api, sub, args, out) {
   return 0;
 }
 
-const ADMIN_ROLES = ['viewer', 'editor', 'admin'];
+const ADMIN_ROLES = ['viewer', 'support', 'editor', 'admin'];
 
 async function adminCommand(api, sub, args, values, out, err) {
   const email = args[0]?.trim().toLowerCase();
@@ -218,7 +218,7 @@ async function adminCommand(api, sub, args, values, out, err) {
   if (!['add', 'disable'].includes(sub) || !email) throw new UsageError(USAGE);
   if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new UsageError(`email không hợp lệ: "${args[0]}"`);
   if (sub === 'add') {
-    if (!ADMIN_ROLES.includes(values.role)) throw new UsageError('cần --role viewer|editor|admin');
+    if (!ADMIN_ROLES.includes(values.role)) throw new UsageError(`cần --role ${ADMIN_ROLES.join('|')}`);
     const u = await api.createAdminUser({ email, role: values.role, ...(values.name && { name: values.name }) });
     out(`${u.email}: ${u.role} (đã thêm). Đăng nhập trang admin bằng Google với email này.`);
     return 0;
diff --git a/services/core-api/src/auth.js b/services/core-api/src/auth.js
index 3af6038..24130d7 100644
--- a/services/core-api/src/auth.js
+++ b/services/core-api/src/auth.js
@@ -1,19 +1,22 @@
 import { createHash, randomBytes } from 'node:crypto';
 import { SESSION_COOKIE, readCookie, sameSecret, touchSession } from './admin/sessions.js';
 
-// Token roles (api_tokens.roles) and people's roles (admin_users.role, spec admin-console-p1 §1).
+// Token roles (api_tokens.roles) and people's roles (admin_users.role, spec admin-console-p1 §1, p2 §1).
 export const ROLES = ['publisher', 'router', 'admin'];
-export const USER_ROLES = ['viewer', 'editor', 'admin'];
+export const USER_ROLES = ['viewer', 'support', 'editor', 'admin'];
 
-// What a role satisfies when a route asks for it: viewer ⊂ editor ⊂ admin; a route that asks for a token
-// role maps as publisher ← editor+, router ← admin, admin ← admin.
-const USER_GRANTS = {
+// What a role satisfies when a route asks for it (spec admin-console-p2 §1; apps/admin/src/roles.js has the
+// same table). A route asks for a grant: a person's role or a token role (publisher ← editor+, router ← admin).
+export const USER_GRANTS = {
   viewer: ['viewer'],
-  editor: ['viewer', 'editor', 'publisher'],
-  admin: ['viewer', 'editor', 'publisher', 'router', 'admin'],
+  support: ['viewer', 'support'],
+  editor: ['viewer', 'editor', 'publisher', 'prices:read', 'apps:read'],
+  admin: ['viewer', 'support', 'editor', 'publisher', 'prices:read', 'apps:read', 'router', 'admin'],
 };
-// Every valid token may read; an admin token passes every check.
-const tokenGrants = (roles) => (roles.includes('admin') ? USER_GRANTS.admin : ['viewer', ...roles]);
+// Every valid token may read; router reads prices and apps, publisher reads prices; an admin token passes every check.
+const TOKEN_READS = { router: ['prices:read', 'apps:read'], publisher: ['prices:read'] };
+const tokenGrants = (roles) =>
+  (roles.includes('admin') ? USER_GRANTS.admin : [...new Set(['viewer', ...roles, ...roles.flatMap((r) => TOKEN_READS[r] ?? [])])]);
 const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
 
 const sha256 = (s) => createHash('sha256').update(s).digest('hex');
diff --git a/services/core-api/src/http/apps.js b/services/core-api/src/http/apps.js
index e6c008c..9df94fe 100644
--- a/services/core-api/src/http/apps.js
+++ b/services/core-api/src/http/apps.js
@@ -69,7 +69,7 @@ export default async function appsHttp(app, { pool, webhookSecrets }) {
   app.get(
     '/v1/apps/:id/webhooks',
     {
-      onRequest: router,
+      onRequest: requireRole(pool, 'apps:read'),
       schema: {
         params: idParams,
         querystring: {
@@ -103,11 +103,11 @@ export default async function appsHttp(app, { pool, webhookSecrets }) {
     },
   );
 
-  // CS lookup, admin only (spec §6; E10: POST so the email stays out of URLs and access logs).
+  // CS lookup: support and admin (spec admin-console-p2 §2; E10: POST so the email stays out of URLs and access logs).
   app.post(
     '/v1/customers/lookup',
     {
-      onRequest: requireRole(pool, 'admin'),
+      onRequest: requireRole(pool, 'support'),
       schema: { body: { type: 'object', required: ['email'], properties: { email: { type: 'string', minLength: 3, maxLength: 254 } } } },
     },
     async (req, reply) => {
diff --git a/services/core-api/src/http/prices.js b/services/core-api/src/http/prices.js
index 478ff11..3b4ec4e 100644
--- a/services/core-api/src/http/prices.js
+++ b/services/core-api/src/http/prices.js
@@ -49,7 +49,7 @@ export default async function pricesHttp(app, { pool, paddle, alarm }) {
     async (req) => setFunnelPrices(pool, paddle, { slug: req.params.slug, plans: req.body.plans, actor: req.actor, log: req.log, alarm }),
   );
 
-  app.get('/v1/funnels/:slug/prices', { onRequest: requireRole(pool, ['router', 'publisher']), schema: { params } }, async (req) =>
+  app.get('/v1/funnels/:slug/prices', { onRequest: requireRole(pool, 'prices:read'), schema: { params } }, async (req) =>
     listFunnelPrices(pool, req.params.slug),
   );
 }
PATCH
```

`apps/admin/src/components/RequireGrant.jsx` (mới):

```jsx
import { useAuth } from '../auth.jsx';
import { can } from '../roles.js';

// A page only some roles may open (spec admin-console-p2 §3): the others see which grant it needs.
export function RequireGrant({ need, children }) {
  const { me } = useAuth();
  if (!can(me?.role, need)) return <p className="muted">Cần quyền {need}.</p>;
  return children;
}
```

`apps/admin/src/{roles.js, Layout.jsx, pages/Users.jsx}` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/src/Layout.jsx b/apps/admin/src/Layout.jsx
index 6c2d736..d1473f9 100644
--- a/apps/admin/src/Layout.jsx
+++ b/apps/admin/src/Layout.jsx
@@ -1,5 +1,14 @@
 import { NavLink, Outlet } from 'react-router';
 import { useAuth } from './auth.jsx';
+import { can } from './roles.js';
+
+// The side menu, in order; an item shows only for roles that have its grant (spec admin-console-p2 §3).
+export const NAV = [
+  { to: '/funnels', label: 'Funnels', need: 'viewer' },
+  { to: '/domains', label: 'Domains', need: 'viewer' },
+  { to: '/audit', label: 'Audit', need: 'viewer' },
+  { to: '/settings/users', label: 'Settings', need: 'admin' },
+];
 
 export function Layout() {
   const { me, logout } = useAuth();
@@ -7,10 +16,7 @@ export function Layout() {
     <div className="shell">
       <nav className="side">
         <strong className="brand">iFunnel</strong>
-        <NavLink to="/funnels">Funnels</NavLink>
-        <NavLink to="/domains">Domains</NavLink>
-        <NavLink to="/audit">Audit</NavLink>
-        <NavLink to="/settings/users">Settings</NavLink>
+        {NAV.filter((n) => can(me.role, n.need)).map((n) => <NavLink key={n.to} to={n.to}>{n.label}</NavLink>)}
       </nav>
       <div className="main">
         <header className="top">
diff --git a/apps/admin/src/pages/Users.jsx b/apps/admin/src/pages/Users.jsx
index d67d95a..d7a9676 100644
--- a/apps/admin/src/pages/Users.jsx
+++ b/apps/admin/src/pages/Users.jsx
@@ -1,9 +1,7 @@
 import { useCallback, useEffect, useState } from 'react';
 import { useAuth } from '../auth.jsx';
 import { ErrorNote } from '../components/ErrorNote.jsx';
-import { can } from '../roles.js';
-
-const ROLES = ['viewer', 'editor', 'admin'];
+import { can, ROLE_INFO, ROLES } from '../roles.js';
 
 // Settings → Users (spec §5.6): admins add people, change roles, disable; nobody locks themselves out.
 export function Users() {
@@ -49,6 +47,7 @@ export function Users() {
         >
           Thêm
         </button>
+        <span className="muted" data-testid="role-info">{draft.role}: {ROLE_INFO[draft.role]}</span>
       </div>
       <ErrorNote error={error} />
       {users === null ? (
diff --git a/apps/admin/src/roles.js b/apps/admin/src/roles.js
index 52bcc6f..69acc84 100644
--- a/apps/admin/src/roles.js
+++ b/apps/admin/src/roles.js
@@ -1,3 +1,16 @@
-// viewer ⊂ editor ⊂ admin (spec admin-console-p1 §1).
-const RANK = { viewer: 1, editor: 2, admin: 3 };
-export const can = (role, need) => (RANK[role] ?? 0) >= RANK[need];
+// What each role may do (spec admin-console-p2 §1): the same table as core-api's USER_GRANTS
+// (services/core-api/src/auth.js; test/grants.test.jsx keeps them equal). A page or button asks for a grant.
+export const GRANTS = {
+  viewer: ['viewer'],
+  support: ['viewer', 'support'],
+  editor: ['viewer', 'editor', 'publisher', 'prices:read', 'apps:read'],
+  admin: ['viewer', 'support', 'editor', 'publisher', 'prices:read', 'apps:read', 'router', 'admin'],
+};
+export const ROLES = ['viewer', 'support', 'editor', 'admin'];
+export const ROLE_INFO = {
+  viewer: 'chỉ xem funnel, domain, audit.',
+  support: 'tra khách hàng, gửi lại email link app.',
+  editor: 'upload funnel, pixel/app, xem giá và app.',
+  admin: 'tất cả: publish, giá, app, quyền thủ công, users.',
+};
+export const can = (role, need) => (Object.hasOwn(GRANTS, role ?? '') ? GRANTS[role].includes(need) : false);
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/roles-p2.test.js 2>&1 | grep -E "Tests  "
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
npm test -w @ikf/cli 2>&1 | grep -E "Test Files|Tests  "
npm test -w @ikf/admin 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  9 passed (9)`; core-api `45 passed (45)` / `420 passed (420)` (test cũ không đổi: token `router` vẫn 403 ở lookup, editor vẫn upload); cli `13` / `130`; admin `8` / `56` (test cũ `can(): viewer ⊂ editor ⊂ admin` vẫn đúng với bảng).

- [ ] **Step 5: Commit**

```bash
git add services/core-api packages/cli apps/admin
git commit -m "feat: role support; grants table in core and SPA (prices:read, apps:read); nav by grants; ikf admin add --role support"
```

---

### Task 3: Nguồn entitlement thứ ba `manual` (`computeEntitlements`, `loadSources`)

**Files:**
- Modify: `services/core-api/src/identity/compute.js`, `services/core-api/src/identity/entitlements.js`
- Test: `services/core-api/test/manual-grants.test.js` (mới); Modify: `services/core-api/test/compute.test.js` (thêm `describe` cuối file)

**Interfaces:**
- Consumes: `manual_grants` (Task 1); `recompute(c, customerId, now)`, `sweepExpired({pool, now})`, `withTx`, `seedShop` (có sẵn).
- Produces: `computeEntitlements({subscriptions, oneTimes, manual = [], now})`, `manual: [{id, app_id, key, expires_at}]` → `{active: expires_at === null || now < expires_at, expires_at, source: 'manual', source_id: String(id)}`, chọn nguồn bằng `better()` như cũ. `loadSources(c, customerId)` → `{subscriptions, oneTimes, manual}` (grant `revoked_at IS NULL`, cả grant đã hết hạn). `recompute` không đổi (A14).

- [ ] **Step 1: Viết test fail**

`services/core-api/test/manual-grants.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { recompute } from '../src/identity/entitlements.js';
import { withTx } from '../src/identity/link.js';
import { sweepExpired } from '../src/identity/sync.js';
import { startDb, resetDb } from './helpers/db.js';
import { seedShop } from './helpers/identity.js';

// Spec admin-console-p2 §1, §4: loadSources reads live manual grants; recompute keeps them in `desired`,
// so revoking one switches it off and the expiry sweep ends an expired one; links get entitlement.updated.
describe('manual grants in recompute', () => {
  let db;
  let customerId;
  const q = async (sql, p) => (await db.pool.query(sql, p)).rows;
  const ents = () => q('SELECT app_id, key, active, expires_at, source, source_id FROM entitlements ORDER BY app_id, key');
  const deliveries = () => q("SELECT app_user_id, type, payload->'entitlements' AS ents FROM webhook_deliveries ORDER BY id");
  const run = () => withTx(db.pool, (c) => recompute(c, customerId));
  const addGrant = async (o = {}) => (await q(
    `INSERT INTO manual_grants (customer_id, app_id, key, expires_at, reason, granted_by)
     VALUES ($1, 'starlyn', $2, $3, 'CS ticket 42', 'boss@ikameglobal.com') RETURNING id`,
    [customerId, o.key ?? 'premium', o.expires ?? null],
  ))[0].id;

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    await seedShop(db.pool);
    customerId = (await q("INSERT INTO customers (paddle_customer_id, email) VALUES ('ctm_1', 'buyer@example.com') RETURNING id"))[0].id;
    await q("INSERT INTO app_links (customer_id, app_id, app_user_id) VALUES ($1, 'starlyn', 'u1')", [customerId]);
  });

  it('a grant gives the entitlement (source manual) and queues entitlement.updated for each active link', async () => {
    const id = await addGrant();
    expect(await run()).toEqual({ apps: ['starlyn'], deliveries: 1 });
    expect(await ents()).toEqual([{ app_id: 'starlyn', key: 'premium', active: true, expires_at: null, source: 'manual', source_id: String(id) }]);
    expect(await deliveries()).toEqual([{ app_user_id: 'u1', type: 'entitlement.updated', ents: [{ key: 'premium', active: true, expires_at: null }] }]);
    expect(await run()).toEqual({ apps: [], deliveries: 0 });
  });

  it('revoked (revoked_at set): the next recompute switches it off and tells the app', async () => {
    const id = await addGrant();
    await run();
    await q("UPDATE manual_grants SET revoked_at = now(), revoked_by = 'boss@ikameglobal.com' WHERE id = $1", [id]);
    expect(await run()).toEqual({ apps: ['starlyn'], deliveries: 1 });
    expect(await ents()).toEqual([expect.objectContaining({ key: 'premium', active: false, source: 'manual' })]);
    expect((await deliveries()).at(-1).ents).toEqual([{ key: 'premium', active: false, expires_at: null }]);
  });

  it('an expiring grant stays on until its end; the 5-minute sweep then switches it off (not earlier)', async () => {
    const end = new Date(Date.now() + 3600_000);
    await addGrant({ key: 'tarot_2027', expires: end });
    await run();
    expect(await ents()).toEqual([expect.objectContaining({ key: 'tarot_2027', active: true, expires_at: end })]);
    expect(await sweepExpired({ pool: db.pool })).toEqual({ customers: 0, deliveries: 0 });
    const later = () => new Date(end.getTime() + 1000);
    expect(await sweepExpired({ pool: db.pool, now: later })).toEqual({ customers: 1, deliveries: 1 });
    expect(await ents()).toEqual([expect.objectContaining({ key: 'tarot_2027', active: false, expires_at: end, source: 'manual' })]);
  });
});
```

`services/core-api/test/compute.test.js` (sửa, áp dụng đúng diff này — chỉ thêm cuối file):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/test/compute.test.js b/services/core-api/test/compute.test.js
index d62fc6c..a4b7b05 100644
--- a/services/core-api/test/compute.test.js
+++ b/services/core-api/test/compute.test.js
@@ -79,3 +79,29 @@ describe('computeEntitlements', () => {
     expect(input).toEqual(copy);
   });
 });
+
+// Spec admin-console-p2 §1: a manual grant is a third source; better() picks between sources as before.
+describe('computeEntitlements: manual grants', () => {
+  const grant = (o = {}) => ({ id: 7, app_id: 'starlyn', key: 'premium', expires_at: null, ...o });
+  const manual = (manualGrants, subscriptions = [], oneTimes = []) => computeEntitlements({ subscriptions, oneTimes, manual: manualGrants, now: NOW });
+
+  it.each([
+    ['no end: active forever', grant(), { active: true, expires_at: null }],
+    ['ends later: active until then', grant({ expires_at: at(2 * D) }), { active: true, expires_at: at(2 * D) }],
+    ['ended: off, keeping its end (the expiry sweep switches it off)', grant({ expires_at: at(-H) }), { active: false, expires_at: at(-H) }],
+    ['end given as an ISO string', grant({ expires_at: '2026-10-11T10:00:00.000Z' }), { active: true, expires_at: at(2 * D) }],
+  ])('%s', (_, g, expected) => {
+    expect(manual([g])).toEqual([{ app_id: 'starlyn', key: 'premium', source: 'manual', source_id: '7', ...expected }]);
+  });
+
+  it('against a subscription: the never-ending grant wins; an ended grant loses to a running subscription', () => {
+    expect(manual([grant()], [sub()])).toEqual([ent({ active: true, expires_at: null, source: 'manual', source_id: '7' })]);
+    expect(manual([grant({ expires_at: at(-H) })], [sub()])).toEqual([ent({ active: true, expires_at: at(10 * D) })]);
+    expect(manual([grant({ expires_at: at(20 * D) })], [sub()])).toEqual([ent({ active: true, expires_at: at(20 * D), source: 'manual', source_id: '7' })]);
+  });
+
+  it('a grant of another key adds a row next to what was bought', () => {
+    const out = manual([grant({ key: 'tarot_2027', id: 9 })], [sub()]);
+    expect(out.map((e) => [e.key, e.source, e.source_id])).toEqual([['premium', 'subscription', 'sub_1'], ['tarot_2027', 'manual', '9']]);
+  });
+});
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/compute.test.js test/manual-grants.test.js 2>&1 | grep -E "×|Tests  "
```

Expected: 6 test `computeEntitlements: manual grants` và 3 test `manual grants in recompute` FAIL (nguồn manual bị bỏ qua: `[]`); `Tests  9 failed | 23 passed (32)`.

- [ ] **Step 3: Implement**

`services/core-api/src/identity/{compute,entitlements}.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/identity/compute.js b/services/core-api/src/identity/compute.js
index 476a491..a637e31 100644
--- a/services/core-api/src/identity/compute.js
+++ b/services/core-api/src/identity/compute.js
@@ -29,9 +29,10 @@ function better(a, b) {
 }
 
 // Pure: what a customer is entitled to right now. Inputs are already resolved to (app_id, key);
-// `reversed` = refund or chargeback on the one-time payment / the subscription's latest payment.
+// `reversed` = refund or chargeback on the one-time payment / the subscription's latest payment;
+// `manual` = live (not revoked) manual grants [{id, app_id, key, expires_at}] (spec admin-console-p2 §1).
 // → [{app_id, key, active, expires_at: Date|null, source, source_id}] sorted by app_id, key.
-export function computeEntitlements({ subscriptions = [], oneTimes = [], now = new Date() }) {
+export function computeEntitlements({ subscriptions = [], oneTimes = [], manual = [], now = new Date() }) {
   const best = new Map();
   const add = (appId, key, candidate) => {
     if (!appId || !key) return;
@@ -43,6 +44,10 @@ export function computeEntitlements({ subscriptions = [], oneTimes = [], now = n
   for (const t of oneTimes) {
     add(t.app_id, t.key, { active: !t.reversed, expires_at: null, source: 'one_time', source_id: t.id });
   }
+  for (const m of manual) {
+    const end = toDate(m.expires_at);
+    add(m.app_id, m.key, { active: end === null || now < end, expires_at: end, source: 'manual', source_id: String(m.id) });
+  }
   return [...best.values()]
     .sort((a, b) => (a.appId === b.appId ? (a.key < b.key ? -1 : 1) : a.appId < b.appId ? -1 : 1))
     .map(({ appId, key, e }) => ({ app_id: appId, key, active: e.active, expires_at: e.expires_at, source: e.source, source_id: e.source_id }));
diff --git a/services/core-api/src/identity/entitlements.js b/services/core-api/src/identity/entitlements.js
index 7f7d38c..47307c3 100644
--- a/services/core-api/src/identity/entitlements.js
+++ b/services/core-api/src/identity/entitlements.js
@@ -10,7 +10,8 @@ const REVERSES = `o.topic = ANY($2) AND (o.topic = 'payment.chargeback' OR o.pay
 // - subscription → its funnel's app, key of its plan (default 'premium' if the plan mapping is gone);
 //   reversed = full refund / chargeback on its latest completed payment (E7, F5);
 // - one-time = completed transaction without subscription, from a checkout whose plan is a one_time price
-//   (E8: refunds/chargebacks live only in the outbox, billing has no adjustments table).
+//   (E8: refunds/chargebacks live only in the outbox, billing has no adjustments table);
+// - manual = grants not revoked, expired ones too (inactive, so the expiry sweep ends them at their end).
 export async function loadSources(c, customerId) {
   const subs = await c.query(
     `SELECT s.paddle_subscription_id AS id, f.app_id, COALESCE(fp.entitlement_key, 'premium') AS key, s.status,
@@ -38,7 +39,11 @@ export async function loadSources(c, customerId) {
       WHERE t.customer_id = $1 AND t.status = 'completed' AND t.paddle_subscription_id IS NULL AND f.app_id IS NOT NULL`,
     [customerId, REVERSAL_TOPICS],
   );
-  return { subscriptions: subs.rows, oneTimes: ones.rows };
+  const manual = await c.query(
+    'SELECT id, app_id, key, expires_at FROM manual_grants WHERE customer_id = $1 AND revoked_at IS NULL ORDER BY id',
+    [customerId],
+  );
+  return { subscriptions: subs.rows, oneTimes: ones.rows, manual: manual.rows };
 }
 
 const iso = (d) => (d ? new Date(d).toISOString() : null);
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/compute.test.js test/manual-grants.test.js 2>&1 | grep -E "Tests  "
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  32 passed (32)`; core-api `46 passed (46)` / `429 passed (429)`.

- [ ] **Step 5: Commit**

```bash
git add services/core-api
git commit -m "feat(core-api): manual grants as a third entitlement source (computeEntitlements, loadSources)"
```

---

### Task 4: API cấp/thu hồi quyền `POST /v1/customers/:ref/grants`, `DELETE …/grants/:id` + CLI `customer grant|revoke`

**Files:**
- Create: `services/core-api/src/identity/grants.js`, `services/core-api/src/http/customers.js`
- Modify: `services/core-api/src/identity/customers.js` (helper `customerByRef`, `listEntitlements`), `services/core-api/src/app.js`; `packages/cli/src/{main,api}.js`
- Test: `services/core-api/test/grants.test.js`, `packages/cli/test/customer.test.js` (mới)

**Interfaces:**
- Consumes: `recompute`, `lockCustomer` (`identity/entitlements.js`), `withTx` (`identity/link.js`), `audit`, `actorOf` (`src/audit.js`), `ENTITLEMENT_KEY_RE` (`billing/prices.js`), `requireRole`; Task 3 (nguồn manual).
- Produces:
  - `src/identity/customers.js`: `CUSTOMER_REF_PATTERN = '^cus_[0-9A-HJKMNP-TV-Z]{26}$'`, `customerByRef(db, ref)` → `{id, ref, has_email}` | `404 customer_not_found`, `listEntitlements(db, customerId)` → `[{app_id, key, active, expires_at (ISO|null), source, source_id}]`.
  - `src/identity/grants.js`: `REASON_MAX = 200`, `grantView(row)` (Task 5 chuyển sang `customers.js`), `grantEntitlement(pool, {ref, appId, key, expiresAt, reason, actor, now})` → `{grant, entitlements}`, `revokeGrant(pool, {ref, grantId, actor, now})` → `{grant, entitlements}`; lỗi `400 invalid_grant {field}`, `404 grant_not_found`, `409 already_revoked`.
  - `src/http/customers.js` (đăng ký khi có `deps.pool`): `POST /v1/customers/:ref/grants` (admin, `201`, no-store), `DELETE /v1/customers/:ref/grants/:id` (admin, no-store). Task 5, 6 thêm route vào file này.
  - CLI: `ikf customer grant <cus_…> --app <id> --key <key> [--expires <ISO>] --reason <text>`, `ikf customer revoke <cus_…> <grant_id>`; `api.grantEntitlement(ref, body)`, `api.revokeGrant(ref, id)` (không retry); `customerCommand(api, sub, args, values, out)`.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/grants.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { checkPurchased } from '../src/identity/purchased.js';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, tokenFor, bearer } from './helpers/app.js';
import { ADMIN_ORIGIN, signIn } from './helpers/admin.js';
import { SDK_APP_BODY, fakeSecrets, seedApp, seedShop } from './helpers/identity.js';

const REF = 'cus_01K75Z0000000000000000000B';
const OTHER = 'cus_01K75Z0000000000000000000C';

// Spec admin-console-p2 §2: POST /v1/customers/:ref/grants, DELETE /v1/customers/:ref/grants/:id (admin).
describe('manual grants API', () => {
  let db;
  let app;
  let boss;
  let customerId;
  const q = async (sql, p) => (await db.pool.query(sql, p)).rows;
  const grant = (body, headers = boss.headers(), ref = REF) => app.inject({ method: 'POST', url: `/v1/customers/${ref}/grants`, headers, payload: body });
  const revoke = (id, headers = boss.headers(), ref = REF) => app.inject({ method: 'DELETE', url: `/v1/customers/${ref}/grants/${id}`, headers });
  const BODY = { app_id: 'starlyn', key: 'premium', expires_at: null, reason: 'CS ticket 42: Paddle charged, no webhook' };

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    const secrets = fakeSecrets();
    await seedShop(db.pool, { secrets });
    await seedApp(db.pool, secrets, { ...SDK_APP_BODY, id: 'zodiac', name: 'Zodiac', deeplink_scheme: 'zodiac', bundle_ids: ['com.ikame.zodiac'] });
    customerId = (await q("INSERT INTO customers (paddle_customer_id, email, ref) VALUES ('ctm_1', 'buyer@example.com', $1) RETURNING id", [REF]))[0].id;
    await q("INSERT INTO customers (paddle_customer_id, email, ref) VALUES ('ctm_2', 'other@example.com', $1)", [OTHER]);
    await q("INSERT INTO app_links (customer_id, app_id, app_user_id) VALUES ($1, 'starlyn', 'u1')", [customerId]);
    ({ app } = await makeApp(db.pool, { admin: { origin: ADMIN_ORIGIN, appEnv: 'staging' } }));
    boss = await signIn(db.pool, 'boss@ikameglobal.com', 'admin');
  });
  afterEach(() => app.close());

  it('grant: inserts, recomputes (entitlement source manual + webhook to the linked app), audits in the same transaction', async () => {
    const res = await grant(BODY);
    expect(res.statusCode).toBe(201);
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.json()).toEqual({
      grant: {
        id: 1, app_id: 'starlyn', key: 'premium', expires_at: null, reason: BODY.reason, granted_by: 'boss@ikameglobal.com',
        created_at: expect.any(String), revoked_at: null, revoked_by: null,
      },
      entitlements: [{ app_id: 'starlyn', key: 'premium', active: true, expires_at: null, source: 'manual', source_id: '1' }],
    });
    expect(await q("SELECT app_user_id, type FROM webhook_deliveries")).toEqual([{ app_user_id: 'u1', type: 'entitlement.updated' }]);
    const audit = await q("SELECT actor, actor_kind, action, target, details FROM audit_log WHERE action LIKE 'entitlement.%'");
    expect(audit).toEqual([{
      actor: 'boss@ikameglobal.com', actor_kind: 'user', action: 'entitlement.grant', target: `customer:${REF}`,
      details: { customer_ref: REF, app_id: 'starlyn', key: 'premium', expires_at: null, grant_id: 1 },
    }]);
    expect(JSON.stringify(audit)).not.toContain('buyer@example.com');
  });

  it('an expiring grant keeps its end; an admin token may grant too (actor = token name)', async () => {
    const end = new Date(Date.now() + 7 * 86400_000).toISOString();
    const res = await grant({ ...BODY, key: 'tarot_2027', expires_at: end }, bearer(await tokenFor(db.pool, 'admin')));
    expect(res.statusCode).toBe(201);
    expect(res.json().grant).toMatchObject({ key: 'tarot_2027', expires_at: end, granted_by: 'admin' });
    expect(res.json().entitlements).toEqual([{ app_id: 'starlyn', key: 'tarot_2027', active: true, expires_at: end, source: 'manual', source_id: '1' }]);
  });

  it.each([
    ['an unknown app', { app_id: 'nope' }, 'app_id'],
    ['a key that is not an entitlement key', { key: 'Premium!' }, 'key'],
    ['an end in the past', { expires_at: '2020-01-01T00:00:00Z' }, 'expires_at'],
    ['an end that is not a date', { expires_at: 'next week' }, 'expires_at'],
    ['a blank reason', { reason: '   ' }, 'reason'],
    ['a reason over 200 characters', { reason: 'x'.repeat(201) }, 'reason'],
  ])('400 invalid_grant for %s; nothing saved', async (_, change, field) => {
    const res = await grant({ ...BODY, ...change });
    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({ error: 'invalid_grant', detail: { field } });
    expect(await q('SELECT count(*)::int AS n FROM manual_grants')).toEqual([{ n: 0 }]);
    expect(await q("SELECT count(*)::int AS n FROM audit_log WHERE action LIKE 'entitlement.%'")).toEqual([{ n: 0 }]);
  });

  it('unknown customer → 404 customer_not_found; a malformed ref or a missing reason → 400', async () => {
    expect((await grant(BODY, boss.headers(), 'cus_01K75Z00000000000000000ZZZ')).json()).toEqual({ error: 'customer_not_found' });
    expect((await grant(BODY, boss.headers(), 'buyer@example.com')).statusCode).toBe(400);
    expect((await grant({ app_id: 'starlyn', key: 'premium' })).statusCode).toBe(400);
  });

  it('revoke: revoked_at/by set, entitlement off at once, the app told, audited; again → 409; unknown or another customer\'s → 404', async () => {
    await grant(BODY);
    const res = await revoke(1);
    expect(res.statusCode).toBe(200);
    expect(res.json().grant).toMatchObject({ id: 1, revoked_at: expect.any(String), revoked_by: 'boss@ikameglobal.com' });
    expect(res.json().entitlements).toEqual([{ app_id: 'starlyn', key: 'premium', active: false, expires_at: null, source: 'manual', source_id: '1' }]);
    expect((await q("SELECT payload->'entitlements' AS e FROM webhook_deliveries ORDER BY id")).at(-1).e).toEqual([{ key: 'premium', active: false, expires_at: null }]);
    expect((await q("SELECT action, details FROM audit_log ORDER BY id")).at(-1)).toEqual({ action: 'entitlement.revoke', details: { customer_ref: REF, grant_id: 1 } });
    const again = await revoke(1);
    expect(again.statusCode).toBe(409);
    expect(again.json()).toEqual({ error: 'already_revoked' });
    expect((await revoke(99)).json()).toEqual({ error: 'grant_not_found' });
    expect((await revoke(1, boss.headers(), OTHER)).json()).toEqual({ error: 'grant_not_found' });
  });

  // Review Focus 1: CS grants access in an app the buyer never linked (bought another app's funnel).
  it('a grant for an app the customer has no link to: entitlement on, no webhook, IKameSDK check-purchased says pro there', async () => {
    const res = await grant({ ...BODY, app_id: 'zodiac' });
    expect(res.statusCode).toBe(201);
    expect(await q('SELECT count(*)::int AS n FROM webhook_deliveries')).toEqual([{ n: 0 }]);
    const [{ user_id: uid }] = await q('SELECT user_id FROM customers WHERE id = $1', [customerId]);
    expect(await checkPurchased(db.pool, { userId: uid, app: 'com.ikame.zodiac' })).toEqual({ isPro: true, expiresAt: null });
    expect(await checkPurchased(db.pool, { userId: uid, app: 'starlyn' })).toEqual({ isPro: false, expiresAt: null });
  });

  it.each(['viewer', 'support', 'editor'])('%s: 403 on grant and revoke', async (role) => {
    await grant(BODY);
    const p = await signIn(db.pool, `${role}@ikameglobal.com`, role);
    expect((await grant(BODY, p.headers())).statusCode).toBe(403);
    expect((await revoke(1, p.headers())).statusCode).toBe(403);
  });
});
```

`packages/cli/test/customer.test.js` (mới):

```js
import { describe, it, expect } from 'vitest';
import { run } from '../src/main.js';
import { createApi } from '../src/api.js';
import { io } from './helpers/io.js';

const REF = 'cus_01K75Z0000000000000000000B';
const grantView = (o = {}) => ({
  id: 7, app_id: 'starlyn', key: 'premium', expires_at: null, reason: 'CS 42', granted_by: 'ci', created_at: '2026-10-11T08:00:00.000Z',
  revoked_at: null, revoked_by: null, ...o,
});
const ent = (o = {}) => ({ app_id: 'starlyn', key: 'premium', active: true, expires_at: null, source: 'manual', source_id: '7', ...o });

// Spec admin-console-p2 §2 CLI: ikf customer grant | revoke.
describe('ikf customer grant / revoke', () => {
  it('grant <ref> --app --key [--expires] --reason: sends the grant, prints it and the entitlements now', async () => {
    const calls = [];
    const t = io({ grantEntitlement: async (ref, b) => { calls.push([ref, b]); return { grant: grantView({ expires_at: '2026-12-31T00:00:00.000Z' }), entitlements: [ent({ expires_at: '2026-12-31T00:00:00.000Z' })] }; } });
    const argv = ['customer', 'grant', REF, '--app', 'starlyn', '--key', 'premium', '--expires', '2026-12-31T00:00:00Z', '--reason', 'CS 42'];
    expect(await run(argv, t.opts)).toBe(0);
    expect(calls).toEqual([[REF, { app_id: 'starlyn', key: 'premium', expires_at: '2026-12-31T00:00:00.000Z', reason: 'CS 42' }]]);
    expect(t.lines).toEqual([
      `${REF}: đã cấp starlyn/premium (grant 7), hết hạn 2026-12-31T00:00:00.000Z.`,
      '  starlyn/premium  active  hết hạn 2026-12-31T00:00:00.000Z  (manual 7)',
    ]);
  });

  it('grant without --expires never ends (expires_at null)', async () => {
    const calls = [];
    const t = io({ grantEntitlement: async (ref, b) => { calls.push(b); return { grant: grantView(), entitlements: [ent()] }; } });
    expect(await run(['customer', 'grant', REF, '--app', 'starlyn', '--key', 'premium', '--reason', 'CS 42'], t.opts)).toBe(0);
    expect(calls).toEqual([{ app_id: 'starlyn', key: 'premium', expires_at: null, reason: 'CS 42' }]);
    expect(t.lines[0]).toBe(`${REF}: đã cấp starlyn/premium (grant 7), không hết hạn.`);
  });

  it('revoke <ref> <grant_id>', async () => {
    const calls = [];
    const t = io({ revokeGrant: async (ref, id) => { calls.push([ref, id]); return { grant: grantView({ revoked_at: '2026-10-11T09:00:00.000Z', revoked_by: 'ci' }), entitlements: [ent({ active: false })] }; } });
    expect(await run(['customer', 'revoke', REF, '7'], t.opts)).toBe(0);
    expect(calls).toEqual([[REF, 7]]);
    expect(t.lines).toEqual([`${REF}: đã thu hồi grant 7 (starlyn/premium).`, '  starlyn/premium  off  hết hạn không  (manual 7)']);
  });

  it.each([
    [['customer', 'grant', 'buyer@example.com', '--app', 'starlyn', '--key', 'premium', '--reason', 'x'], 'customer_ref không hợp lệ: "buyer@example.com" (dạng cus_…)'],
    [['customer', 'grant', REF, '--key', 'premium', '--reason', 'x'], 'cần --app <id>, --key <key> và --reason <lý do>'],
    [['customer', 'grant', REF, '--app', 'starlyn', '--key', 'Premium!', '--reason', 'x'], 'key không hợp lệ: "Premium!" (a-z, 0-9, _; tối đa 40)'],
    [['customer', 'grant', REF, '--app', 'starlyn', '--key', 'premium', '--expires', 'next week', '--reason', 'x'], '--expires phải là thời điểm ISO 8601, ví dụ 2026-12-31T00:00:00Z'],
    [['customer', 'grant', REF, '--app', 'starlyn', '--key', 'premium', '--reason', 'x'.repeat(201)], '--reason tối đa 200 ký tự'],
    [['customer', 'revoke', REF, 'abc'], 'grant id phải là số nguyên dương: "abc"'],
  ])('exits 2 on bad usage %j', async (argv, msg) => {
    const t = io({ grantEntitlement: async () => { throw new Error('must not be called'); } });
    expect(await run(argv, t.opts)).toBe(2);
    expect(t.errors).toEqual([msg]);
  });
});

describe('api: customer calls', () => {
  it('grant and revoke are never retried (a lost reply would grant twice or answer 409)', async () => {
    const seen = [];
    const fetch = async (url, init) => {
      seen.push([init.method, url, init.body]);
      return new Response('{}', { status: 503 });
    };
    const api = createApi({ api: 'https://api.x', token: 't' }, { fetch, sleep: async () => {} });
    await expect(api.grantEntitlement(REF, { app_id: 'a', key: 'k', expires_at: null, reason: 'r' })).rejects.toMatchObject({ status: 503 });
    await expect(api.revokeGrant(REF, 7)).rejects.toMatchObject({ status: 503 });
    expect(seen).toEqual([
      ['POST', `https://api.x/v1/customers/${REF}/grants`, '{"app_id":"a","key":"k","expires_at":null,"reason":"r"}'],
      ['DELETE', `https://api.x/v1/customers/${REF}/grants/7`, undefined],
    ]);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/grants.test.js 2>&1 | grep -E "Tests  "
npm test -w @ikf/cli -- test/customer.test.js 2>&1 | grep -E "Tests  "
```

Expected: core `Tests  14 failed (14)` (route chưa có: 404); CLI `Tests  10 failed (10)`.

- [ ] **Step 3: Implement**

`services/core-api/src/identity/grants.js` (mới):

```js
// Manual grants (spec admin-console-p2 §1, §2): an admin gives or takes back an entitlement by hand. Every change
// runs in one transaction: the row, the audit row, then recompute under the customer lock (webhooks as usual).
import { actorOf, audit } from '../audit.js';
import { ENTITLEMENT_KEY_RE } from '../billing/prices.js';
import { HttpError } from '../errors.js';
import { customerByRef, listEntitlements } from './customers.js';
import { lockCustomer, recompute } from './entitlements.js';
import { withTx } from './link.js';

export const REASON_MAX = 200;
const iso = (d) => (d ? d.toISOString() : null);
const invalid = (field) => new HttpError(400, 'invalid_grant', { field });

export const grantView = (r) => ({
  id: Number(r.id),
  app_id: r.app_id,
  key: r.key,
  expires_at: iso(r.expires_at),
  reason: r.reason,
  granted_by: r.granted_by,
  created_at: iso(r.created_at),
  revoked_at: iso(r.revoked_at),
  revoked_by: r.revoked_by,
});
const COLUMNS = 'id, app_id, key, expires_at, reason, granted_by, created_at, revoked_at, revoked_by';

// {app_id, key, expires_at: ISO | null, reason} → {grant, entitlements}. 400 invalid_grant {field}: unknown app,
// a key that is not an entitlement key, an end that is not a date or not in the future, a reason not 1..200.
export async function grantEntitlement(pool, { ref, appId, key, expiresAt = null, reason, actor, now = () => new Date() }) {
  if (!ENTITLEMENT_KEY_RE.test(key ?? '')) throw invalid('key');
  const end = expiresAt === null ? null : new Date(expiresAt);
  if (end !== null && (Number.isNaN(end.getTime()) || end <= now())) throw invalid('expires_at');
  const why = String(reason ?? '').trim();
  if (!why || why.length > REASON_MAX) throw invalid('reason');
  const who = actorOf(actor);
  return withTx(pool, async (c) => {
    const customer = await customerByRef(c, ref);
    if (!(await c.query('SELECT 1 FROM apps WHERE id = $1', [appId])).rows.length) throw invalid('app_id');
    await lockCustomer(c, customer.id);
    const { rows } = await c.query(
      `INSERT INTO manual_grants (customer_id, app_id, key, expires_at, reason, granted_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${COLUMNS}`,
      [customer.id, appId, key, end, why, who.name],
    );
    const grant = grantView(rows[0]);
    await audit(c, who, 'entitlement.grant', `customer:${ref}`, { customer_ref: ref, app_id: appId, key, expires_at: grant.expires_at, grant_id: grant.id });
    await recompute(c, customer.id, now());
    return { grant, entitlements: await listEntitlements(c, customer.id) };
  });
}

// Revoking keeps the row (revoked_at, revoked_by) and recomputes at once. 404 grant_not_found (not this
// customer's), 409 already_revoked.
export async function revokeGrant(pool, { ref, grantId, actor, now = () => new Date() }) {
  const who = actorOf(actor);
  return withTx(pool, async (c) => {
    const customer = await customerByRef(c, ref);
    await lockCustomer(c, customer.id);
    const cur = await c.query('SELECT revoked_at FROM manual_grants WHERE id = $1 AND customer_id = $2 FOR UPDATE', [grantId, customer.id]);
    if (!cur.rows.length) throw new HttpError(404, 'grant_not_found');
    if (cur.rows[0].revoked_at) throw new HttpError(409, 'already_revoked');
    const { rows } = await c.query(
      `UPDATE manual_grants SET revoked_at = now(), revoked_by = $2 WHERE id = $1 RETURNING ${COLUMNS}`,
      [grantId, who.name],
    );
    await audit(c, who, 'entitlement.revoke', `customer:${ref}`, { customer_ref: ref, grant_id: grantId });
    await recompute(c, customer.id, now());
    return { grant: grantView(rows[0]), entitlements: await listEntitlements(c, customer.id) };
  });
}
```

`services/core-api/src/http/customers.js` (mới):

```js
import { requireRole } from '../auth.js';
import { CUSTOMER_REF_PATTERN } from '../identity/customers.js';
import { grantEntitlement, revokeGrant } from '../identity/grants.js';

const refParams = {
  type: 'object',
  required: ['ref'],
  properties: { ref: { type: 'string', pattern: CUSTOMER_REF_PATTERN } },
};

// Customers in the admin console (spec admin-console-p2 §2). Bodies carry PII-adjacent data: never cached.
export default async function customersHttp(app, { pool }) {
  const admin = requireRole(pool, 'admin');

  app.post(
    '/v1/customers/:ref/grants',
    {
      onRequest: admin,
      schema: {
        params: refParams,
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['app_id', 'key', 'reason'],
          properties: {
            app_id: { type: 'string', maxLength: 31 },
            key: { type: 'string', maxLength: 100 },
            expires_at: { type: ['string', 'null'], maxLength: 40 },
            reason: { type: 'string', maxLength: 1000 },
          },
        },
      },
    },
    async (req, reply) => {
      reply.code(201).header('cache-control', 'no-store');
      const b = req.body;
      return grantEntitlement(pool, { ref: req.params.ref, appId: b.app_id, key: b.key, expiresAt: b.expires_at ?? null, reason: b.reason, actor: req.actor });
    },
  );

  app.delete(
    '/v1/customers/:ref/grants/:id',
    {
      onRequest: admin,
      schema: {
        params: { ...refParams, required: ['ref', 'id'], properties: { ...refParams.properties, id: { type: 'integer', minimum: 1 } } },
      },
    },
    async (req, reply) => {
      reply.header('cache-control', 'no-store');
      return revokeGrant(pool, { ref: req.params.ref, grantId: req.params.id, actor: req.actor });
    },
  );
}
```

`services/core-api/src/{identity/customers.js, app.js}` và `packages/cli/src/{main,api}.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/packages/cli/src/api.js b/packages/cli/src/api.js
index 1a39676..0428839 100644
--- a/packages/cli/src/api.js
+++ b/packages/cli/src/api.js
@@ -74,6 +74,9 @@ export function createApi({ api, token }, { fetch: doFetch = fetch, retries = 3,
     resendWebhook: (id, eventId) => call('POST', `/v1/apps/${id}/webhooks/${eventId}/resend`, { retry: false }),
     // POST, so the email is never in a URL (E10).
     lookupCustomer: (email) => call('POST', '/v1/customers/lookup', { body: { email }, retry: true }),
+    // Not retried: a lost reply would turn the retry into a second grant (or 409 already_revoked).
+    grantEntitlement: (ref, body) => call('POST', `/v1/customers/${ref}/grants`, { body, retry: false }),
+    revokeGrant: (ref, id) => call('DELETE', `/v1/customers/${ref}/grants/${id}`, { retry: false }),
     listAdminUsers: () => call('GET', '/v1/admin/users', { retry: true }),
     // Not retried: a lost reply would turn the retry into 409 user_exists.
     createAdminUser: (body) => call('POST', '/v1/admin/users', { body, retry: false }),
diff --git a/packages/cli/src/main.js b/packages/cli/src/main.js
index 47c7043..2a9356b 100755
--- a/packages/cli/src/main.js
+++ b/packages/cli/src/main.js
@@ -29,6 +29,8 @@ const USAGE = `Cách dùng:
   ikf app rotate-key <id> [--force]   (--force: cả khi key trước còn trong 24h, key đó bị khoá ngay)
   ikf app webhooks <id> [--dead] [--resend <event_id>]
   ikf customer show <email>
+  ikf customer grant <cus_…> --app <id> --key <key> [--expires <ISO>] --reason <lý do>   (cấp quyền thủ công, admin)
+  ikf customer revoke <cus_…> <grant_id>
   ikf admin add <email> --role viewer|support|editor|admin [--name <tên>]   (người dùng trang admin, đăng nhập Google; support: tra khách, gửi lại email)
   ikf admin ls
   ikf admin disable <email>   (khoá ngay, mọi phiên đăng nhập kết thúc)
@@ -182,7 +184,51 @@ async function appCommand(api, sub, args, values, out) {
   return 0;
 }
 
-async function customerCommand(api, sub, args, out) {
+const CUSTOMER_REF_RE = /^cus_[0-9A-HJKMNP-TV-Z]{26}$/;
+const ENTITLEMENT_KEY_RE = /^[a-z0-9_]{1,40}$/;
+
+const entLine = (e) => `  ${e.app_id}/${e.key}  ${e.active ? 'active' : 'off'}  hết hạn ${e.expires_at ?? 'không'}  (${e.source} ${e.source_id})`;
+
+function customerRef(ref) {
+  if (!CUSTOMER_REF_RE.test(ref ?? '')) throw new UsageError(`customer_ref không hợp lệ: "${ref ?? ''}" (dạng cus_…)`);
+  return ref;
+}
+
+async function grantCommand(api, args, values, out) {
+  const ref = customerRef(args[0]);
+  if (!values.app || !values.key || values.reason === undefined) throw new UsageError('cần --app <id>, --key <key> và --reason <lý do>');
+  if (!APP_ID_RE.test(values.app)) throw new UsageError(`app id không hợp lệ: "${values.app}"`);
+  if (!ENTITLEMENT_KEY_RE.test(values.key)) throw new UsageError(`key không hợp lệ: "${values.key}" (a-z, 0-9, _; tối đa 40)`);
+  let expires = null;
+  if (values.expires !== undefined) {
+    const d = new Date(values.expires);
+    if (!/^\d{4}-\d{2}-\d{2}T/.test(values.expires) || Number.isNaN(d.getTime())) {
+      throw new UsageError('--expires phải là thời điểm ISO 8601, ví dụ 2026-12-31T00:00:00Z');
+    }
+    expires = d.toISOString();
+  }
+  const reason = values.reason.trim();
+  if (!reason) throw new UsageError('cần --app <id>, --key <key> và --reason <lý do>');
+  if (reason.length > 200) throw new UsageError('--reason tối đa 200 ký tự');
+  const r = await api.grantEntitlement(ref, { app_id: values.app, key: values.key, expires_at: expires, reason });
+  const g = r.grant;
+  out(`${ref}: đã cấp ${g.app_id}/${g.key} (grant ${g.id}), ${g.expires_at ? `hết hạn ${g.expires_at}` : 'không hết hạn'}.`);
+  for (const e of r.entitlements) out(entLine(e));
+  return 0;
+}
+
+async function revokeCommand(api, args, out) {
+  const ref = customerRef(args[0]);
+  if (!/^[1-9]\d{0,15}$/.test(args[1] ?? '')) throw new UsageError(`grant id phải là số nguyên dương: "${args[1] ?? ''}"`);
+  const r = await api.revokeGrant(ref, Number(args[1]));
+  out(`${ref}: đã thu hồi grant ${r.grant.id} (${r.grant.app_id}/${r.grant.key}).`);
+  for (const e of r.entitlements) out(entLine(e));
+  return 0;
+}
+
+async function customerCommand(api, sub, args, values, out) {
+  if (sub === 'grant') return grantCommand(api, args, values, out);
+  if (sub === 'revoke') return revokeCommand(api, args, out);
   const email = args[0];
   if (sub !== 'show' || !email || !email.includes('@')) throw new UsageError(USAGE);
   const { customers } = await api.lookupCustomer(email);
@@ -369,6 +415,9 @@ export async function run(argv, { out = console.log, err = console.error, env =
         resend: { type: 'string' },
         force: { type: 'boolean', default: false },
         role: { type: 'string' },
+        key: { type: 'string' },
+        expires: { type: 'string' },
+        reason: { type: 'string' },
       },
     });
     const [cmd, sub, ...rest] = positionals;
@@ -389,7 +438,7 @@ export async function run(argv, { out = console.log, err = console.error, env =
     if (cmd === 'funnel') return await funnelCommand(api, sub, rest, values, out);
     if (cmd === 'billing') return await billingCommand(api, sub, rest, values, out);
     if (cmd === 'app') return await appCommand(api, sub, rest, values, out);
-    if (cmd === 'customer') return await customerCommand(api, sub, rest, out);
+    if (cmd === 'customer') return await customerCommand(api, sub, rest, values, out);
     if (cmd === 'admin') return await adminCommand(api, sub, rest, values, out, err);
     return await routeCommand(api, sub, rest, values, out);
   } catch (e) {
diff --git a/services/core-api/src/app.js b/services/core-api/src/app.js
index 53512fa..553f3e9 100644
--- a/services/core-api/src/app.js
+++ b/services/core-api/src/app.js
@@ -18,6 +18,7 @@ import authHttp from './http/auth.js';
 import googleHttp from './http/google.js';
 import catalogHttp from './http/catalog.js';
 import usersHttp from './http/users.js';
+import customersHttp from './http/customers.js';
 import { adminCors } from './admin/cors.js';
 
 export function buildApp({ checks = {}, timeoutMs = 1000, logger = false, deps } = {}) {
@@ -63,6 +64,7 @@ export function buildApp({ checks = {}, timeoutMs = 1000, logger = false, deps }
   if (deps?.pool) app.register(domainsHttp, deps);
   if (deps?.pool) app.register(catalogHttp, deps);
   if (deps?.pool) app.register(usersHttp, deps);
+  if (deps?.pool) app.register(customersHttp, deps);
   if (deps?.store) app.register(versionsHttp, deps);
   if (deps?.kv) app.register(routesHttp, deps);
   if (deps?.kv) app.register(funnelsHttp, deps);
diff --git a/services/core-api/src/identity/customers.js b/services/core-api/src/identity/customers.js
index e2f026e..f2ab5c5 100644
--- a/services/core-api/src/identity/customers.js
+++ b/services/core-api/src/identity/customers.js
@@ -1,5 +1,29 @@
+import { HttpError } from '../errors.js';
+
 const iso = (d) => (d ? d.toISOString() : null);
 
+// customer_ref in URLs (spec admin-console-p2 §2): cus_<ULID>.
+export const CUSTOMER_REF_PATTERN = '^cus_[0-9A-HJKMNP-TV-Z]{26}$';
+
+// The customer behind a customer_ref → {id, ref, has_email}, or 404 customer_not_found. Never the email itself.
+export async function customerByRef(db, ref) {
+  const { rows } = await db.query(
+    "SELECT id, ref, (email IS NOT NULL AND btrim(email) <> '') AS has_email FROM customers WHERE ref = $1",
+    [ref],
+  );
+  if (!rows.length) throw new HttpError(404, 'customer_not_found');
+  return { id: Number(rows[0].id), ref: rows[0].ref, has_email: rows[0].has_email };
+}
+
+// What the console shows of a customer's entitlements (all apps), by app then key.
+export async function listEntitlements(db, customerId) {
+  const { rows } = await db.query(
+    'SELECT app_id, key, active, expires_at, source, source_id FROM entitlements WHERE customer_id = $1 ORDER BY app_id, key',
+    [customerId],
+  );
+  return rows.map((e) => ({ ...e, expires_at: iso(e.expires_at) }));
+}
+
 // CS lookup (E10: POST body, so the email never sits in a URL or an access log).
 export async function customerReport(db, email) {
   const { rows: customers } = await db.query(
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/grants.test.js 2>&1 | grep -E "Tests  "
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
npm test -w @ikf/cli 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  14 passed (14)`; core-api `47 passed (47)` / `443 passed (443)`; cli `14` / `140`.

- [ ] **Step 5: Commit**

```bash
git add services/core-api packages/cli
git commit -m "feat: manual grants API (POST/DELETE /v1/customers/:ref/grants, audit, recompute) and ikf customer grant|revoke"
```

---

### Task 5: Lookup v2 (`email` | `customer_ref` | `checkout_id`, role `support`, không `user_id`/email) + `ikf customer show <email|cus_…>`

**Files:**
- Modify: `services/core-api/src/identity/customers.js` (report v2, `grantView` chuyển vào đây), `src/identity/grants.js` (import `grantView`), `src/http/customers.js` (route lookup), `src/http/apps.js` (bỏ route lookup cũ); `packages/cli/src/{main,api}.js`
- Test: `services/core-api/test/customer-report.test.js` (mới); Modify: `services/core-api/test/web-funnel-auth.test.js`, `packages/cli/test/app.test.js`, `packages/cli/test/customer.test.js`

**Interfaces:**
- Consumes: `customerRef(c, id)` (`identity/entitlements.js`, gán `cus_<ULID>` một lần), `listEntitlements` (Task 4), `requireRole(pool, 'support')`.
- Produces: `customerReport(db, query)` với `query` đúng một trong `{email}`, `{customer_ref}`, `{checkout_id}` → `{customers: [{customer_ref, paddle_customer_id, created_at, user_id_rotated_at, has_email, checkouts[{id, funnel, v, plan_key, status, created_at, completed_at, amount_minor, currency}], subscriptions[{id, funnel, plan_key, status, current_period_end, canceled_at}], entitlements[…], manual_grants[grantView], links[{app_id, app_user_id, linked_at, revoked_at}], deliveries[≤20], claim {checkout_id, emailed_at, email_attempts, expires_at} | null}]}`; `grantView(row)` (`identity/customers.js`). Route `POST /v1/customers/lookup` trong `http/customers.js` (A4). CLI: `api.lookupCustomer(email | query)`; `ikf customer show` nhận `cus_…`.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/customer-report.test.js` (mới):

```js
import { Writable } from 'node:stream';
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { buildApp } from '../src/app.js';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, tokenFor, bearer } from './helpers/app.js';
import { ADMIN_ORIGIN, signIn } from './helpers/admin.js';
import { CK, CK2, SDK_APP_BODY, fakeSecrets, seedShop } from './helpers/identity.js';

const REF = 'cus_01K75Z0000000000000000000B';
const ABANDONED = '01JA0000000000000000000009';
const EV = '01JA00000000000000000000EV';

// Spec admin-console-p2 §2: POST /v1/customers/lookup with exactly one of email | customer_ref | checkout_id
// (support and admin); report v2 never carries the user_id or the email.
describe('customer lookup (report v2)', () => {
  let db;
  let app;
  let cs;
  let customerId;
  let uid;
  const q = async (sql, p) => (await db.pool.query(sql, p)).rows;
  const lookup = (body, headers = cs.headers()) => app.inject({ method: 'POST', url: '/v1/customers/lookup', headers, payload: body });

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    const { funnelId } = await seedShop(db.pool, { secrets: fakeSecrets(), app: SDK_APP_BODY });
    ({ id: customerId, user_id: uid } = (await q(
      "INSERT INTO customers (paddle_customer_id, email, ref) VALUES ('ctm_1', 'Buyer@Example.com', $1) RETURNING id, user_id",
      [REF],
    ))[0]);
    await q("UPDATE checkouts SET status = 'completed', completed_at = '2026-10-09T10:00:05Z' WHERE id = $1", [CK]);
    await q(
      `INSERT INTO transactions (paddle_transaction_id, customer_id, paddle_subscription_id, checkout_id, status, origin, amount_minor, currency, billed_at, paddle_updated_at)
       VALUES ('txn_a', $1, 'sub_1', $2, 'completed', 'web', 1367, 'USD', '2026-10-09T10:00:00Z', now()),
              ('txn_r', $1, 'sub_1', $2, 'completed', 'subscription_recurring', 1367, 'USD', '2026-10-16T10:00:00Z', now())`,
      [customerId, CK],
    );
    await q(
      `INSERT INTO subscriptions (paddle_subscription_id, customer_id, funnel_id, plan_key, status, current_period_end, paddle_updated_at)
       VALUES ('sub_1', $1, $2, '1w', 'active', '2026-10-23T10:00:00Z', now())`,
      [customerId, funnelId],
    );
    await q("INSERT INTO entitlements (customer_id, app_id, key, active, expires_at, source, source_id) VALUES ($1, 'starlyn', 'premium', true, '2026-10-26T10:00:00Z', 'subscription', 'sub_1')", [customerId]);
    await q("INSERT INTO manual_grants (customer_id, app_id, key, reason, granted_by) VALUES ($1, 'starlyn', 'tarot_2027', 'CS 42', 'boss@ikameglobal.com')", [customerId]);
    await q("INSERT INTO app_links (customer_id, app_id, app_user_id) VALUES ($1, 'starlyn', 'u1')", [customerId]);
    await q(
      "INSERT INTO claim_tokens (token_hash, customer_id, app_id, checkout_id, expires_at, email_attempts, emailed_at) VALUES ('h1', $1, 'starlyn', $2, '2026-10-16T10:00:00Z', 1, '2026-10-09T10:00:07Z')",
      [customerId, CK],
    );
    await q(
      `INSERT INTO webhook_deliveries (event_id, app_id, app_user_id, type, payload)
       VALUES ($1, 'starlyn', 'u1', 'entitlement.updated', jsonb_build_object('customer_ref', $2::text))`,
      [EV, REF],
    );
    await q("INSERT INTO checkouts (id, paddle_transaction_id, funnel_id, v, plan_key, sid, status) VALUES ($1, 'txn_x', $2, 1, '1w', 's', 'abandoned')", [ABANDONED, funnelId]);
    ({ app } = await makeApp(db.pool, { admin: { origin: ADMIN_ORIGIN, appEnv: 'staging' } }));
    cs = await signIn(db.pool, 'cs@ikameglobal.com', 'support');
  });
  afterEach(() => app.close());

  it('by email (any case, spaces): checkouts, subscriptions, entitlements, manual grants, links, deliveries, claim email; never cached', async () => {
    const res = await lookup({ email: '  buyer@EXAMPLE.com ' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.json()).toEqual({
      customers: [{
        customer_ref: REF,
        paddle_customer_id: 'ctm_1',
        created_at: expect.any(String),
        user_id_rotated_at: null,
        has_email: true,
        checkouts: [{
          id: CK, funnel: 'witch-power', v: 1, plan_key: '1w', status: 'completed', created_at: expect.any(String),
          completed_at: '2026-10-09T10:00:05.000Z', amount_minor: 1367, currency: 'USD',
        }],
        subscriptions: [{ id: 'sub_1', funnel: 'witch-power', plan_key: '1w', status: 'active', current_period_end: '2026-10-23T10:00:00.000Z', canceled_at: null }],
        entitlements: [{ app_id: 'starlyn', key: 'premium', active: true, expires_at: '2026-10-26T10:00:00.000Z', source: 'subscription', source_id: 'sub_1' }],
        manual_grants: [{
          id: 1, app_id: 'starlyn', key: 'tarot_2027', expires_at: null, reason: 'CS 42', granted_by: 'boss@ikameglobal.com',
          created_at: expect.any(String), revoked_at: null, revoked_by: null,
        }],
        links: [{ app_id: 'starlyn', app_user_id: 'u1', linked_at: expect.any(String), revoked_at: null }],
        deliveries: [expect.objectContaining({ event_id: EV, app_id: 'starlyn', app_user_id: 'u1', type: 'entitlement.updated', status: 'pending' })],
        claim: { checkout_id: CK, emailed_at: '2026-10-09T10:00:07.000Z', email_attempts: 1, expires_at: '2026-10-16T10:00:00.000Z' },
      }],
    });
    expect(res.body).not.toContain(uid);
    expect(res.body).not.toMatch(/"user_id"|buyer@example\.com/i);
  });

  it('by customer_ref and by checkout_id: the same customer; a checkout nobody paid (abandoned, unknown) finds no one', async () => {
    const byEmail = (await lookup({ email: 'buyer@example.com' })).json();
    expect((await lookup({ customer_ref: REF })).json()).toEqual(byEmail);
    expect((await lookup({ checkout_id: CK })).json()).toEqual(byEmail);
    expect((await lookup({ checkout_id: ABANDONED })).json()).toEqual({ customers: [] });
    expect((await lookup({ checkout_id: CK2 })).json()).toEqual({ customers: [] });
    expect((await lookup({ customer_ref: 'cus_01K75Z00000000000000000ZZZ' })).json()).toEqual({ customers: [] });
  });

  it('a customer without a customer_ref gets one on lookup (the console acts by ref)', async () => {
    await q("INSERT INTO customers (paddle_customer_id, email) VALUES ('ctm_2', 'new@example.com')");
    const [c] = (await lookup({ email: 'new@example.com' })).json().customers;
    expect(c.customer_ref).toMatch(/^cus_[0-7][0-9A-HJKMNP-TV-Z]{25}$/);
    expect((await lookup({ customer_ref: c.customer_ref })).json().customers[0].customer_ref).toBe(c.customer_ref);
    expect(c).toMatchObject({ checkouts: [], subscriptions: [], entitlements: [], manual_grants: [], claim: null });
  });

  it.each([
    [{}],
    [{ email: 'buyer@example.com', customer_ref: REF }],
    [{ customer_ref: 'buyer@example.com' }],
    [{ checkout_id: 'txn_a' }],
  ])('400 unless exactly one well-formed key: %j', async (body) => {
    expect((await lookup(body)).statusCode).toBe(400);
  });

  it.each([['support', 200], ['admin', 200], ['editor', 403], ['viewer', 403]])('%s → %i', async (role, code) => {
    const p = role === 'support' ? cs : await signIn(db.pool, `${role}@ikameglobal.com`, role);
    expect((await lookup({ customer_ref: REF }, p.headers())).statusCode).toBe(code);
  });

  it('logs hold neither the email nor the user_id', async () => {
    let logs = '';
    const stream = new Writable({ write(chunk, _enc, done) { logs += chunk; done(); } });
    const logged = buildApp({ logger: { level: 'info', stream }, deps: { pool: db.pool } });
    const admin = await tokenFor(db.pool, 'admin');
    expect((await logged.inject({ method: 'POST', url: '/v1/customers/lookup', headers: bearer(admin), payload: { email: 'buyer@example.com' } })).statusCode).toBe(200);
    await logged.close();
    expect(logs).toContain('/v1/customers/lookup');
    expect(logs).not.toMatch(/buyer@example\.com/i);
    expect(logs).not.toContain(uid);
  });
});
```

`services/core-api/test/web-funnel-auth.test.js`, `packages/cli/test/{app,customer}.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/packages/cli/test/app.test.js b/packages/cli/test/app.test.js
index 470b1c5..208bc74 100644
--- a/packages/cli/test/app.test.js
+++ b/packages/cli/test/app.test.js
@@ -152,7 +152,6 @@ describe('ikf customer show', () => {
     expect(calls).toEqual(['buyer@example.com']);
     expect(t.lines).toEqual([
       'cus_01K75Z0000000000000000000B  ctm_1  từ 2026-10-09T10:00:00.000Z',
-      `  user_id: ${UID}  (bí mật: ai có nó là có quyền của khách trong app dùng IKameSDK)`,
       '  Quyền:',
       '    starlyn/premium  active  hết hạn 2026-10-19T10:00:00.000Z  (subscription sub_1)',
       '  Liên kết:',
diff --git a/packages/cli/test/customer.test.js b/packages/cli/test/customer.test.js
index 30e1655..8cd4de1 100644
--- a/packages/cli/test/customer.test.js
+++ b/packages/cli/test/customer.test.js
@@ -54,7 +54,66 @@ describe('ikf customer grant / revoke', () => {
   });
 });
 
+describe('ikf customer show <email|cus_…> (report v2)', () => {
+  const report = {
+    customer_ref: REF, paddle_customer_id: 'ctm_1', created_at: '2026-10-09T10:00:00.000Z', user_id_rotated_at: '2026-10-11T08:00:00.000Z', has_email: true,
+    checkouts: [{ id: '01JA0000000000000000000001', funnel: 'witch-power', v: 1, plan_key: '1w', status: 'completed', created_at: '2026-10-09T09:59:00.000Z', completed_at: '2026-10-09T10:00:00.000Z', amount_minor: 1367, currency: 'USD' }],
+    subscriptions: [{ id: 'sub_1', funnel: 'witch-power', plan_key: '1w', status: 'active', current_period_end: '2026-10-16T10:00:00.000Z', canceled_at: null }],
+    entitlements: [ent({ source: 'subscription', source_id: 'sub_1' })],
+    manual_grants: [grantView({ revoked_at: '2026-10-11T09:00:00.000Z', revoked_by: 'boss@ikameglobal.com' })],
+    links: [],
+    deliveries: [],
+    claim: { checkout_id: '01JA0000000000000000000001', emailed_at: '2026-10-09T10:00:07.000Z', email_attempts: 1, expires_at: '2026-10-16T10:00:00.000Z' },
+  };
+
+  it('a cus_… is looked up by customer_ref; purchases, manual grants, the claim email and the rotation are printed; never a user_id', async () => {
+    const calls = [];
+    const t = io({ lookupCustomer: async (query) => { calls.push(query); return { customers: [report] }; } });
+    expect(await run(['customer', 'show', REF], t.opts)).toBe(0);
+    expect(calls).toEqual([{ customer_ref: REF }]);
+    expect(t.lines).toEqual([
+      `${REF}  ctm_1  từ 2026-10-09T10:00:00.000Z`,
+      '  user_id đã cấp lại lúc 2026-10-11T08:00:00.000Z',
+      '  Quyền:',
+      '    starlyn/premium  active  hết hạn không  (subscription sub_1)',
+      '  Liên kết:',
+      '    (không có)',
+      '  Webhook gần đây:',
+      '    (không có)',
+      '  Mua hàng:',
+      '    01JA0000000000000000000001  witch-power@v1 1w  completed  1367 USD  2026-10-09T09:59:00.000Z',
+      '  Subscription:',
+      '    sub_1  witch-power 1w  active  tới 2026-10-16T10:00:00.000Z',
+      '  Cấp thủ công:',
+      '    #7 starlyn/premium  hết hạn không  "CS 42" bởi ci  thu hồi 2026-10-11T09:00:00.000Z',
+      '  Email link app: checkout 01JA0000000000000000000001, gửi lúc 2026-10-09T10:00:07.000Z, 1 lần',
+    ]);
+    expect(t.lines.join('\n')).not.toContain('user_id:');
+  });
+
+  it('an email is looked up by email; anything else is a usage error', async () => {
+    const calls = [];
+    const t = io({ lookupCustomer: async (query) => { calls.push(query); return { customers: [] }; } });
+    expect(await run(['customer', 'show', 'buyer@example.com'], t.opts)).toBe(0);
+    expect(calls).toEqual(['buyer@example.com']);
+    expect(t.lines).toEqual(['Không có khách nào với email này.']);
+    expect(await run(['customer', 'show', 'cus_bad'], t.opts)).toBe(2);
+  });
+});
+
 describe('api: customer calls', () => {
+  it('lookupCustomer: an email string → {email}; an object goes as is (customer_ref, checkout_id)', async () => {
+    const seen = [];
+    const fetch = async (url, init) => {
+      seen.push(init.body);
+      return new Response('{"customers":[]}', { status: 200 });
+    };
+    const api = createApi({ api: 'https://api.x', token: 't' }, { fetch });
+    await api.lookupCustomer('buyer@example.com');
+    await api.lookupCustomer({ customer_ref: REF });
+    expect(seen).toEqual(['{"email":"buyer@example.com"}', `{"customer_ref":"${REF}"}`]);
+  });
+
   it('grant and revoke are never retried (a lost reply would grant twice or answer 409)', async () => {
     const seen = [];
     const fetch = async (url, init) => {
diff --git a/services/core-api/test/web-funnel-auth.test.js b/services/core-api/test/web-funnel-auth.test.js
index bfcb111..f4294cb 100644
--- a/services/core-api/test/web-funnel-auth.test.js
+++ b/services/core-api/test/web-funnel-auth.test.js
@@ -67,11 +67,14 @@ describe(`POST ${URL_PATH} (IKameSDK mode AUTH: the app backend asks by user_id)
     expect((await lookup(uid, `ikfa_${'A'.repeat(43)}`)).json()).toEqual({ error: 'unauthorized' });
   });
 
-  it('CS lookup (ikf customer show) shows the user_id', async () => {
+  // Spec admin-console-p2 §2: the console and `ikf customer show` never see the user_id (CS rotates it instead).
+  it('CS lookup (ikf customer show) never shows the user_id', async () => {
     const res = await app.inject({
       method: 'POST', url: '/v1/customers/lookup', headers: bearer(await tokenFor(db.pool, 'admin')), payload: { email: 'buyer@example.com' },
     });
-    expect(res.json().customers).toEqual([expect.objectContaining({ paddle_customer_id: 'ctm_1', user_id: uid })]);
+    expect(res.json().customers).toEqual([expect.objectContaining({ paddle_customer_id: 'ctm_1' })]);
+    expect(res.json().customers[0]).not.toHaveProperty('user_id');
+    expect(res.body).not.toContain(uid);
   });
 
   it('logs never hold the user_id: found, unknown, malformed, wrong key, and a DB failure whose message carries it (500, code only)', async () => {
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/customer-report.test.js test/web-funnel-auth.test.js 2>&1 | grep -E "×|Tests  "
npm test -w @ikf/cli 2>&1 | grep -E "×|Tests  "
```

Expected: core — 12 test `customer lookup (report v2)` FAIL (lookup chỉ có khi có `webhookSecrets`, chỉ admin, chỉ email) và `CS lookup (ikf customer show) never shows the user_id` FAIL; `Tests  13 failed | 3 passed (16)`. CLI — `a cus_… is looked up by customer_ref…`, `lookupCustomer: an email string → {email}…`, và test cũ `prints entitlements, links…` (vẫn in dòng `user_id`) FAIL; `Tests  3 failed | 140 passed (143)`.

- [ ] **Step 3: Implement**

`services/core-api/src/{identity/customers.js, identity/grants.js, http/customers.js, http/apps.js}` và `packages/cli/src/{main,api}.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/packages/cli/src/api.js b/packages/cli/src/api.js
index 0428839..e1b8d36 100644
--- a/packages/cli/src/api.js
+++ b/packages/cli/src/api.js
@@ -72,8 +72,8 @@ export function createApi({ api, token }, { fetch: doFetch = fetch, retries = 3,
     listWebhooks: (id, { status } = {}) => call('GET', `/v1/apps/${id}/webhooks${status ? `?status=${status}` : ''}`, { retry: true }),
     // Not retried: every resend queues a NEW delivery, so a retry after a lost reply would send the app two.
     resendWebhook: (id, eventId) => call('POST', `/v1/apps/${id}/webhooks/${eventId}/resend`, { retry: false }),
-    // POST, so the email is never in a URL (E10).
-    lookupCustomer: (email) => call('POST', '/v1/customers/lookup', { body: { email }, retry: true }),
+    // POST, so the email is never in a URL (E10). An email string, or {customer_ref} / {checkout_id}.
+    lookupCustomer: (query) => call('POST', '/v1/customers/lookup', { body: typeof query === 'string' ? { email: query } : query, retry: true }),
     // Not retried: a lost reply would turn the retry into a second grant (or 409 already_revoked).
     grantEntitlement: (ref, body) => call('POST', `/v1/customers/${ref}/grants`, { body, retry: false }),
     revokeGrant: (ref, id) => call('DELETE', `/v1/customers/${ref}/grants/${id}`, { retry: false }),
diff --git a/packages/cli/src/main.js b/packages/cli/src/main.js
index 2a9356b..cd4efdb 100755
--- a/packages/cli/src/main.js
+++ b/packages/cli/src/main.js
@@ -28,7 +28,7 @@ const USAGE = `Cách dùng:
   ikf app ls
   ikf app rotate-key <id> [--force]   (--force: cả khi key trước còn trong 24h, key đó bị khoá ngay)
   ikf app webhooks <id> [--dead] [--resend <event_id>]
-  ikf customer show <email>
+  ikf customer show <email|cus_…>
   ikf customer grant <cus_…> --app <id> --key <key> [--expires <ISO>] --reason <lý do>   (cấp quyền thủ công, admin)
   ikf customer revoke <cus_…> <grant_id>
   ikf admin add <email> --role viewer|support|editor|admin [--name <tên>]   (người dùng trang admin, đăng nhập Google; support: tra khách, gửi lại email)
@@ -229,24 +229,38 @@ async function revokeCommand(api, args, out) {
 async function customerCommand(api, sub, args, values, out) {
   if (sub === 'grant') return grantCommand(api, args, values, out);
   if (sub === 'revoke') return revokeCommand(api, args, out);
-  const email = args[0];
-  if (sub !== 'show' || !email || !email.includes('@')) throw new UsageError(USAGE);
-  const { customers } = await api.lookupCustomer(email);
-  if (!customers.length) out('Không có khách nào với email này.');
+  const who = args[0];
+  if (sub !== 'show' || !who || !(who.includes('@') || CUSTOMER_REF_RE.test(who))) throw new UsageError(USAGE);
+  const { customers } = await api.lookupCustomer(who.includes('@') ? who : { customer_ref: who });
+  if (!customers.length) out(who.includes('@') ? 'Không có khách nào với email này.' : 'Không có khách nào với customer_ref này.');
   for (const c of customers) {
     out(`${c.customer_ref ?? '(chưa có customer_ref)'}  ${c.paddle_customer_id}  từ ${c.created_at}`);
-    out(`  user_id: ${c.user_id}  (bí mật: ai có nó là có quyền của khách trong app dùng IKameSDK)`);
+    if (c.user_id_rotated_at) out(`  user_id đã cấp lại lúc ${c.user_id_rotated_at}`);
     out('  Quyền:');
     if (!c.entitlements.length) out('    (không có)');
-    for (const e of c.entitlements) {
-      out(`    ${e.app_id}/${e.key}  ${e.active ? 'active' : 'off'}  hết hạn ${e.expires_at ?? 'không'}  (${e.source} ${e.source_id})`);
-    }
+    for (const e of c.entitlements) out(`  ${entLine(e)}`);
     out('  Liên kết:');
     if (!c.links.length) out('    (không có)');
     for (const l of c.links) out(`    ${l.app_id}/${l.app_user_id}  từ ${l.linked_at}${l.revoked_at ? `  thu hồi ${l.revoked_at}` : ''}`);
     out('  Webhook gần đây:');
     if (!c.deliveries.length) out('    (không có)');
     for (const d of c.deliveries) out(`    ${d.event_id}  ${d.type}  ${d.app_id}/${d.app_user_id}  ${d.status} (${d.attempts})`);
+    // Report v2 (spec admin-console-p2 §2): only the parts that have something.
+    if (c.checkouts?.length) {
+      out('  Mua hàng:');
+      for (const k of c.checkouts) out(`    ${k.id}  ${k.funnel}@v${k.v} ${k.plan_key}  ${k.status}  ${k.amount_minor ?? '-'} ${k.currency ?? ''}  ${k.created_at}`);
+    }
+    if (c.subscriptions?.length) {
+      out('  Subscription:');
+      for (const x of c.subscriptions) out(`    ${x.id}  ${x.funnel ?? '-'} ${x.plan_key ?? '-'}  ${x.status}  tới ${x.current_period_end ?? '-'}${x.canceled_at ? `  huỷ ${x.canceled_at}` : ''}`);
+    }
+    if (c.manual_grants?.length) {
+      out('  Cấp thủ công:');
+      for (const g of c.manual_grants) {
+        out(`    #${g.id} ${g.app_id}/${g.key}  hết hạn ${g.expires_at ?? 'không'}  "${g.reason}" bởi ${g.granted_by}${g.revoked_at ? `  thu hồi ${g.revoked_at}` : ''}`);
+      }
+    }
+    if (c.claim) out(`  Email link app: checkout ${c.claim.checkout_id}, ${c.claim.emailed_at ? `gửi lúc ${c.claim.emailed_at}` : 'chưa gửi'}, ${c.claim.email_attempts} lần`);
   }
   return 0;
 }
diff --git a/services/core-api/src/http/apps.js b/services/core-api/src/http/apps.js
index 9df94fe..a264c2c 100644
--- a/services/core-api/src/http/apps.js
+++ b/services/core-api/src/http/apps.js
@@ -2,7 +2,6 @@ import { audit } from '../audit.js';
 import { requireRole } from '../auth.js';
 import { HttpError } from '../errors.js';
 import { createApp, listApps, rotateKey } from '../identity/apps.js';
-import { customerReport } from '../identity/customers.js';
 import { listDeliveries, resendDelivery } from '../identity/webhooks.js';
 
 const url = { type: 'string', minLength: 1, maxLength: 500 };
@@ -102,17 +101,4 @@ export default async function appsHttp(app, { pool, webhookSecrets }) {
       return out;
     },
   );
-
-  // CS lookup: support and admin (spec admin-console-p2 §2; E10: POST so the email stays out of URLs and access logs).
-  app.post(
-    '/v1/customers/lookup',
-    {
-      onRequest: requireRole(pool, 'support'),
-      schema: { body: { type: 'object', required: ['email'], properties: { email: { type: 'string', minLength: 3, maxLength: 254 } } } },
-    },
-    async (req, reply) => {
-      reply.header('cache-control', 'no-store');
-      return customerReport(pool, req.body.email);
-    },
-  );
 }
diff --git a/services/core-api/src/http/customers.js b/services/core-api/src/http/customers.js
index 67f9025..2eed185 100644
--- a/services/core-api/src/http/customers.js
+++ b/services/core-api/src/http/customers.js
@@ -1,5 +1,5 @@
 import { requireRole } from '../auth.js';
-import { CUSTOMER_REF_PATTERN } from '../identity/customers.js';
+import { CUSTOMER_REF_PATTERN, customerReport } from '../identity/customers.js';
 import { grantEntitlement, revokeGrant } from '../identity/grants.js';
 
 const refParams = {
@@ -12,6 +12,29 @@ const refParams = {
 export default async function customersHttp(app, { pool }) {
   const admin = requireRole(pool, 'admin');
 
+  // CS lookup: support and admin. POST so the email stays out of URLs and access logs (E10). Exactly one key.
+  app.post(
+    '/v1/customers/lookup',
+    {
+      onRequest: requireRole(pool, 'support'),
+      schema: {
+        body: {
+          type: 'object',
+          properties: {
+            email: { type: 'string', minLength: 3, maxLength: 254 },
+            customer_ref: { type: 'string', pattern: CUSTOMER_REF_PATTERN },
+            checkout_id: { type: 'string', pattern: '^[0-7][0-9A-HJKMNP-TV-Z]{25}$' },
+          },
+          oneOf: [{ required: ['email'] }, { required: ['customer_ref'] }, { required: ['checkout_id'] }],
+        },
+      },
+    },
+    async (req, reply) => {
+      reply.header('cache-control', 'no-store');
+      return customerReport(pool, req.body);
+    },
+  );
+
   app.post(
     '/v1/customers/:ref/grants',
     {
diff --git a/services/core-api/src/identity/customers.js b/services/core-api/src/identity/customers.js
index f2ab5c5..c96e501 100644
--- a/services/core-api/src/identity/customers.js
+++ b/services/core-api/src/identity/customers.js
@@ -1,4 +1,5 @@
 import { HttpError } from '../errors.js';
+import { customerRef } from './entitlements.js';
 
 const iso = (d) => (d ? d.toISOString() : null);
 
@@ -15,6 +16,19 @@ export async function customerByRef(db, ref) {
   return { id: Number(rows[0].id), ref: rows[0].ref, has_email: rows[0].has_email };
 }
 
+// A manual_grants row as the API shows it.
+export const grantView = (r) => ({
+  id: Number(r.id),
+  app_id: r.app_id,
+  key: r.key,
+  expires_at: iso(r.expires_at),
+  reason: r.reason,
+  granted_by: r.granted_by,
+  created_at: iso(r.created_at),
+  revoked_at: iso(r.revoked_at),
+  revoked_by: r.revoked_by,
+});
+
 // What the console shows of a customer's entitlements (all apps), by app then key.
 export async function listEntitlements(db, customerId) {
   const { rows } = await db.query(
@@ -24,37 +38,81 @@ export async function listEntitlements(db, customerId) {
   return rows.map((e) => ({ ...e, expires_at: iso(e.expires_at) }));
 }
 
-// CS lookup (E10: POST body, so the email never sits in a URL or an access log).
-export async function customerReport(db, email) {
-  const { rows: customers } = await db.query(
-    'SELECT id, ref, user_id, paddle_customer_id, created_at FROM customers WHERE lower(btrim(email)) = $1 ORDER BY id',
-    [String(email).trim().toLowerCase()],
-  );
+// Which customers a lookup means: exactly one of {email} (lowercased, trimmed), {customer_ref}, {checkout_id}
+// (the customer of a paid checkout: its transactions, or its claim email). An unpaid checkout finds no one.
+async function findCustomers(db, { email, customer_ref: ref, checkout_id: checkoutId }) {
+  let rows;
+  if (email !== undefined) {
+    ({ rows } = await db.query('SELECT id FROM customers WHERE lower(btrim(email)) = $1 ORDER BY id', [String(email).trim().toLowerCase()]));
+  } else if (ref !== undefined) {
+    ({ rows } = await db.query('SELECT id FROM customers WHERE ref = $1', [ref]));
+  } else {
+    ({ rows } = await db.query(
+      `SELECT id FROM customers WHERE id IN (
+         SELECT customer_id FROM transactions WHERE checkout_id = $1 AND customer_id IS NOT NULL
+         UNION SELECT customer_id FROM claim_tokens WHERE checkout_id = $1) ORDER BY id`,
+      [checkoutId],
+    ));
+  }
+  return rows.map((r) => Number(r.id));
+}
+
+// CS lookup, report v2 (spec admin-console-p2 §2; E10: POST body, so the email never sits in a URL or an access
+// log). Never the user_id (a bearer secret) and never the email (the caller typed it). A customer without a
+// customer_ref gets one here: every console action names the customer by it.
+export async function customerReport(db, query) {
   const out = [];
-  for (const c of customers) {
-    const ents = await db.query(
-      'SELECT app_id, key, active, expires_at, source, source_id, updated_at FROM entitlements WHERE customer_id = $1 ORDER BY app_id, key',
-      [c.id],
+  for (const id of await findCustomers(db, query)) {
+    const ref = await customerRef(db, id);
+    const { rows: [c] } = await db.query(
+      "SELECT paddle_customer_id, created_at, user_id_rotated_at, (email IS NOT NULL AND btrim(email) <> '') AS has_email FROM customers WHERE id = $1",
+      [id],
+    );
+    const checkouts = await db.query(
+      `SELECT * FROM (
+         SELECT DISTINCT ON (ck.id) ck.id, f.slug AS funnel, ck.v, ck.plan_key, ck.status, ck.created_at, ck.completed_at, t.amount_minor, t.currency
+           FROM transactions t JOIN checkouts ck ON ck.id = t.checkout_id JOIN funnels f ON f.id = ck.funnel_id
+          WHERE t.customer_id = $1
+          ORDER BY ck.id, t.billed_at ASC NULLS LAST) x
+        ORDER BY id DESC LIMIT 50`,
+      [id],
+    );
+    const subs = await db.query(
+      `SELECT s.paddle_subscription_id AS id, f.slug AS funnel, s.plan_key, s.status, s.current_period_end, s.canceled_at
+         FROM subscriptions s LEFT JOIN funnels f ON f.id = s.funnel_id WHERE s.customer_id = $1 ORDER BY s.paddle_updated_at DESC`,
+      [id],
+    );
+    const grants = await db.query(
+      'SELECT id, app_id, key, expires_at, reason, granted_by, created_at, revoked_at, revoked_by FROM manual_grants WHERE customer_id = $1 ORDER BY id DESC',
+      [id],
+    );
+    const links = await db.query('SELECT app_id, app_user_id, linked_at, revoked_at FROM app_links WHERE customer_id = $1 ORDER BY id', [id]);
+    const deliveries = await db.query(
+      `SELECT event_id, app_id, app_user_id, type, status, attempts, last_error, created_at FROM webhook_deliveries
+        WHERE payload->>'customer_ref' = $1 ORDER BY id DESC LIMIT 20`,
+      [ref],
     );
-    const links = await db.query(
-      'SELECT app_id, app_user_id, linked_at, revoked_at FROM app_links WHERE customer_id = $1 ORDER BY id',
-      [c.id],
+    const claim = await db.query(
+      `SELECT checkout_id, emailed_at, email_attempts, expires_at FROM claim_tokens
+        WHERE customer_id = $1 AND checkout_id IS NOT NULL ORDER BY created_at DESC LIMIT 1`,
+      [id],
     );
-    const deliveries = c.ref
-      ? await db.query(
-        `SELECT event_id, app_id, app_user_id, type, status, attempts, last_error, created_at FROM webhook_deliveries
-          WHERE payload->>'customer_ref' = $1 ORDER BY id DESC LIMIT 20`,
-        [c.ref],
-      )
-      : { rows: [] };
+    const cl = claim.rows[0];
     out.push({
-      customer_ref: c.ref,
-      user_id: c.user_id,
+      customer_ref: ref,
       paddle_customer_id: c.paddle_customer_id,
       created_at: iso(c.created_at),
-      entitlements: ents.rows.map((e) => ({ ...e, expires_at: iso(e.expires_at), updated_at: iso(e.updated_at) })),
+      user_id_rotated_at: iso(c.user_id_rotated_at),
+      has_email: c.has_email,
+      checkouts: checkouts.rows.map((k) => ({
+        ...k, created_at: iso(k.created_at), completed_at: iso(k.completed_at), amount_minor: k.amount_minor === null ? null : Number(k.amount_minor),
+      })),
+      subscriptions: subs.rows.map((r) => ({ ...r, current_period_end: iso(r.current_period_end), canceled_at: iso(r.canceled_at) })),
+      entitlements: await listEntitlements(db, id),
+      manual_grants: grants.rows.map(grantView),
       links: links.rows.map((l) => ({ ...l, linked_at: iso(l.linked_at), revoked_at: iso(l.revoked_at) })),
       deliveries: deliveries.rows.map((d) => ({ ...d, created_at: iso(d.created_at) })),
+      claim: cl ? { checkout_id: cl.checkout_id, emailed_at: iso(cl.emailed_at), email_attempts: cl.email_attempts, expires_at: iso(cl.expires_at) } : null,
     });
   }
   return { customers: out };
diff --git a/services/core-api/src/identity/grants.js b/services/core-api/src/identity/grants.js
index c573bb9..84ae649 100644
--- a/services/core-api/src/identity/grants.js
+++ b/services/core-api/src/identity/grants.js
@@ -3,25 +3,13 @@
 import { actorOf, audit } from '../audit.js';
 import { ENTITLEMENT_KEY_RE } from '../billing/prices.js';
 import { HttpError } from '../errors.js';
-import { customerByRef, listEntitlements } from './customers.js';
+import { customerByRef, grantView, listEntitlements } from './customers.js';
 import { lockCustomer, recompute } from './entitlements.js';
 import { withTx } from './link.js';
 
 export const REASON_MAX = 200;
-const iso = (d) => (d ? d.toISOString() : null);
 const invalid = (field) => new HttpError(400, 'invalid_grant', { field });
 
-export const grantView = (r) => ({
-  id: Number(r.id),
-  app_id: r.app_id,
-  key: r.key,
-  expires_at: iso(r.expires_at),
-  reason: r.reason,
-  granted_by: r.granted_by,
-  created_at: iso(r.created_at),
-  revoked_at: iso(r.revoked_at),
-  revoked_by: r.revoked_by,
-});
 const COLUMNS = 'id, app_id, key, expires_at, reason, granted_by, created_at, revoked_at, revoked_by';
 
 // {app_id, key, expires_at: ISO | null, reason} → {grant, entitlements}. 400 invalid_grant {field}: unknown app,
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/customer-report.test.js test/web-funnel-auth.test.js test/webhooks.test.js test/grants.test.js 2>&1 | grep -E "Tests  "
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
npm test -w @ikf/cli 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  44 passed (44)` (test cũ `customer lookup (admin only)` trong `webhooks.test.js` vẫn pass: token `router` 403, `paddle_customer_id` còn); core-api `48 passed (48)` / `455 passed (455)`; cli `14` / `143`.

- [ ] **Step 5: Commit**

```bash
git add services/core-api packages/cli
git commit -m "feat: customer lookup v2 by email | customer_ref | checkout_id (support), never user_id or email; ikf customer show <email|cus_…>"
```

---

### Task 6: `POST /v1/customers/:ref/resend-email` (support) và `POST /v1/customers/:ref/rotate-user-id` (admin) + CLI

**Files:**
- Create: `services/core-api/src/identity/customer-actions.js`
- Modify: `services/core-api/src/http/customers.js`; `packages/cli/src/{main,api}.js`
- Test: `services/core-api/test/customer-actions.test.js` (mới); Modify: `packages/cli/test/customer.test.js`

**Interfaces:**
- Consumes: `customerByRef` (Task 4), `lockCustomer`, `withTx`, `audit`, `CLAIM_TTL_DAYS` (`identity/claims.js`); vòng `sendClaimEmails` (`identity/sync.js`, có sẵn) gửi email; `userAppLinkFor`, `claimForCheckout`, `checkPurchased` (test).
- Produces: `resendClaimEmail(pool, {ref, actor})` → `{queued: true, checkout_id}` | `409 no_email` | `404 no_claim` | `404 customer_not_found`; `rotateUserId(pool, {ref, actor})` → `{rotated_at, email_queued}` (A15). Route `POST /v1/customers/:ref/resend-email` (`support`, no-store), `POST /v1/customers/:ref/rotate-user-id` (admin, no-store). CLI: `ikf customer resend-email <cus_…>`, `ikf customer rotate-user-id <cus_…> --yes`; `api.resendEmail(ref)` (retry), `api.rotateUserId(ref)` (không retry).

- [ ] **Step 1: Viết test fail**

`services/core-api/test/customer-actions.test.js` (mới):

```js
import { Writable } from 'node:stream';
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { buildApp } from '../src/app.js';
import { userAppLinkFor } from '../src/identity/claims.js';
import { claimForCheckout } from '../src/identity/link.js';
import { checkPurchased } from '../src/identity/purchased.js';
import { sendClaimEmails } from '../src/identity/sync.js';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, tokenFor, bearer } from './helpers/app.js';
import { ADMIN_ORIGIN, signIn } from './helpers/admin.js';
import { CK, CK2, CLAIM_KEY, SDK_APP_BODY, fakeMailer, fakeSecrets, seedShop } from './helpers/identity.js';

const REF = 'cus_01K75Z0000000000000000000B';

// Spec admin-console-p2 §2: POST /v1/customers/:ref/resend-email (support), POST /v1/customers/:ref/rotate-user-id (admin).
describe('customer actions: resend the app-link email, rotate the user_id', () => {
  let db;
  let app;
  let boss;
  let cs;
  let customerId;
  let oldUid;
  let mailer;
  const q = async (sql, p) => (await db.pool.query(sql, p)).rows;
  const post = (path, headers) => app.inject({ method: 'POST', url: `/v1/customers/${REF}/${path}`, headers });
  const emails = () => sendClaimEmails({ pool: db.pool, mailer, claimKey: CLAIM_KEY });
  const claim = async (checkout) => (await q('SELECT emailed_at, email_attempts, next_email_at, expires_at FROM claim_tokens WHERE checkout_id = $1', [checkout]))[0];
  const appRow = async () => (await q("SELECT id, kind, adjust_tracker_url, deeplink_scheme, deeplink_path FROM apps WHERE id = 'starlyn'"))[0];
  const audits = () => q("SELECT action, target, details FROM audit_log WHERE action LIKE 'customer.%' ORDER BY id");
  const addClaim = (hash, checkout, createdAt) =>
    q(
      `INSERT INTO claim_tokens (token_hash, customer_id, app_id, checkout_id, expires_at, email_attempts, emailed_at, created_at)
       VALUES ($1, $2, 'starlyn', $3, now() + interval '1 day', 1, now() - interval '1 hour', $4)`,
      [hash, customerId, checkout, createdAt],
    );

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    await seedShop(db.pool, { secrets: fakeSecrets(), app: SDK_APP_BODY });
    ({ id: customerId, user_id: oldUid } = (await q(
      "INSERT INTO customers (paddle_customer_id, email, ref) VALUES ('ctm_1', 'buyer@example.com', $1) RETURNING id, user_id",
      [REF],
    ))[0]);
    await q("UPDATE checkouts SET status = 'completed', completed_at = now() WHERE id = $1", [CK]);
    await q(
      `INSERT INTO transactions (paddle_transaction_id, customer_id, paddle_subscription_id, checkout_id, status, origin, amount_minor, currency, billed_at, paddle_updated_at)
       VALUES ('txn_a', $1, 'sub_1', $2, 'completed', 'web', 1367, 'USD', now(), now())`,
      [customerId, CK],
    );
    await q("INSERT INTO entitlements (customer_id, app_id, key, active, expires_at, source, source_id) VALUES ($1, 'starlyn', 'premium', true, now() + interval '10 days', 'subscription', 'sub_1')", [customerId]);
    await addClaim('h1', CK, '2026-10-09T10:00:00Z');
    mailer = fakeMailer();
    ({ app } = await makeApp(db.pool, { admin: { origin: ADMIN_ORIGIN, appEnv: 'staging' } }));
    boss = await signIn(db.pool, 'boss@ikameglobal.com', 'admin');
    cs = await signIn(db.pool, 'cs@ikameglobal.com', 'support');
  });
  afterEach(() => app.close());

  it('resend-email (support): resets the claim email of the newest checkout; the email loop sends it again; audited', async () => {
    expect(await emails()).toEqual({ sent: 0 });
    const res = await post('resend-email', cs.headers());
    expect(res.statusCode).toBe(200);
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.json()).toEqual({ queued: true, checkout_id: CK });
    const c = await claim(CK);
    expect(c).toMatchObject({ emailed_at: null, email_attempts: 0 });
    expect(c.next_email_at.getTime()).toBeLessThanOrEqual(Date.now() + 1000);
    expect(c.expires_at.getTime()).toBeGreaterThan(Date.now() + 7 * 86400_000 - 60_000);
    expect(await audits()).toEqual([{ action: 'customer.resend_email', target: `customer:${REF}`, details: { customer_ref: REF, checkout_id: CK } }]);
    expect(await emails()).toEqual({ sent: 1 });
    expect(mailer.sent).toHaveLength(1);
    expect(mailer.sent[0].to).toBe('buyer@example.com');
    expect(mailer.sent[0].text).toContain(userAppLinkFor(await appRow(), oldUid));
  });

  it('the newest checkout wins when there are several', async () => {
    await addClaim('h2', CK2, '2026-10-10T10:00:00Z');
    expect((await post('resend-email', cs.headers())).json()).toEqual({ queued: true, checkout_id: CK2 });
    expect(await claim(CK)).toMatchObject({ email_attempts: 1 });
  });

  it('404 no_claim (nothing to resend), 409 no_email (no address), 404 customer_not_found', async () => {
    await q('DELETE FROM claim_tokens');
    expect((await post('resend-email', cs.headers())).json()).toEqual({ error: 'no_claim' });
    await q('UPDATE customers SET email = NULL');
    const res = await post('resend-email', cs.headers());
    expect(res.statusCode).toBe(409);
    expect(res.json()).toEqual({ error: 'no_email' });
    const none = await app.inject({ method: 'POST', url: '/v1/customers/cus_01K75Z00000000000000000ZZZ/resend-email', headers: cs.headers() });
    expect(none.json()).toEqual({ error: 'customer_not_found' });
    expect(await audits()).toEqual([]);
  });

  it('rotate-user-id (admin): new user_id; the old one is no longer pro, the new one is; the email with the new link is queued; claim page gives the new link', async () => {
    const res = await post('rotate-user-id', boss.headers());
    expect(res.statusCode).toBe(200);
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.json()).toEqual({ rotated_at: expect.any(String), email_queued: true });
    expect(res.body).not.toContain(oldUid);
    const [{ user_id: newUid, user_id_rotated_at: at }] = await q('SELECT user_id, user_id_rotated_at FROM customers WHERE id = $1', [customerId]);
    expect(newUid).not.toBe(oldUid);
    expect(at.toISOString()).toBe(res.json().rotated_at);
    expect(await checkPurchased(db.pool, { userId: oldUid })).toEqual({ isPro: false, expiresAt: null });
    expect((await checkPurchased(db.pool, { userId: newUid })).isPro).toBe(true);
    expect(await audits()).toEqual([
      { action: 'customer.rotate_user_id', target: `customer:${REF}`, details: { customer_ref: REF } },
      { action: 'customer.resend_email', target: `customer:${REF}`, details: { customer_ref: REF, checkout_id: CK } },
    ]);
    expect(await emails()).toEqual({ sent: 1 });
    expect(mailer.sent[0].text).toContain(userAppLinkFor(await appRow(), newUid));
    expect(mailer.sent[0].text).not.toContain(oldUid);
    expect(await claimForCheckout(db.pool, { claimKey: CLAIM_KEY, checkoutId: CK })).toEqual({ app_link: userAppLinkFor(await appRow(), newUid) });
  });

  // Review Focus 2: a customer Paddle never gave an email (or with no claim email) can still be rotated.
  it('rotate with no email or no claim: rotated anyway, email_queued false, no resend audit', async () => {
    await q('UPDATE customers SET email = NULL');
    expect((await post('rotate-user-id', boss.headers())).json()).toEqual({ rotated_at: expect.any(String), email_queued: false });
    await q("UPDATE customers SET email = 'buyer@example.com'");
    await q('DELETE FROM claim_tokens');
    expect((await post('rotate-user-id', boss.headers())).json()).toEqual({ rotated_at: expect.any(String), email_queued: false });
    expect((await audits()).map((a) => a.action)).toEqual(['customer.rotate_user_id', 'customer.rotate_user_id']);
    expect(await checkPurchased(db.pool, { userId: oldUid })).toEqual({ isPro: false, expiresAt: null });
  });

  it.each([
    ['viewer', 403, 403],
    ['editor', 403, 403],
    ['support', 200, 403],
  ])('%s: resend-email %i, rotate-user-id %i', async (role, resend, rotate) => {
    const p = role === 'support' ? cs : await signIn(db.pool, `${role}@ikameglobal.com`, role);
    expect((await post('resend-email', p.headers())).statusCode).toBe(resend);
    expect((await post('rotate-user-id', p.headers())).statusCode).toBe(rotate);
  });

  it('logs and the audit never hold the email or either user_id', async () => {
    let logs = '';
    const stream = new Writable({ write(chunk, _enc, done) { logs += chunk; done(); } });
    const logged = buildApp({ logger: { level: 'info', stream }, deps: { pool: db.pool } });
    const admin = bearer(await tokenFor(db.pool, 'admin'));
    expect((await logged.inject({ method: 'POST', url: `/v1/customers/${REF}/rotate-user-id`, headers: admin })).statusCode).toBe(200);
    await logged.close();
    const [{ user_id: newUid }] = await q('SELECT user_id FROM customers WHERE id = $1', [customerId]);
    const audit = JSON.stringify(await q('SELECT details FROM audit_log'));
    for (const secret of [oldUid, newUid, 'buyer@example.com']) {
      expect(logs).not.toContain(secret);
      expect(audit).not.toContain(secret);
    }
  });
});
```

`packages/cli/test/customer.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/packages/cli/test/customer.test.js b/packages/cli/test/customer.test.js
index 8cd4de1..4065fa2 100644
--- a/packages/cli/test/customer.test.js
+++ b/packages/cli/test/customer.test.js
@@ -101,6 +101,30 @@ describe('ikf customer show <email|cus_…> (report v2)', () => {
   });
 });
 
+describe('ikf customer resend-email / rotate-user-id', () => {
+  it('resend-email <ref>: queued for the newest checkout', async () => {
+    const calls = [];
+    const t = io({ resendEmail: async (ref) => { calls.push(ref); return { queued: true, checkout_id: '01JA0000000000000000000001' }; } });
+    expect(await run(['customer', 'resend-email', REF], t.opts)).toBe(0);
+    expect(calls).toEqual([REF]);
+    expect(t.lines).toEqual([`${REF}: email link app (checkout 01JA0000000000000000000001) sẽ được gửi lại trong vài giây.`]);
+  });
+
+  it('rotate-user-id <ref> needs --yes (every installed app goes FREE until the new link is opened)', async () => {
+    const calls = [];
+    const t = io({ rotateUserId: async (ref) => { calls.push(ref); return { rotated_at: '2026-10-11T08:00:00.000Z', email_queued: true }; } });
+    expect(await run(['customer', 'rotate-user-id', REF], t.opts)).toBe(2);
+    expect(t.errors).toEqual(['Cấp lại user_id: mọi app đã cài của khách về FREE cho tới khi khách mở link mới trong email. Chạy lại với --yes để xác nhận.']);
+    expect(calls).toEqual([]);
+    expect(await run(['customer', 'rotate-user-id', REF, '--yes'], t.opts)).toBe(0);
+    expect(calls).toEqual([REF]);
+    expect(t.lines).toEqual([`${REF}: đã cấp lại user_id lúc 2026-10-11T08:00:00.000Z; email với link mới sẽ được gửi.`]);
+    const noMail = io({ rotateUserId: async () => ({ rotated_at: '2026-10-11T08:00:00.000Z', email_queued: false }) });
+    await run(['customer', 'rotate-user-id', REF, '--yes'], noMail.opts);
+    expect(noMail.lines).toEqual([`${REF}: đã cấp lại user_id lúc 2026-10-11T08:00:00.000Z; KHÔNG gửi được email (khách không có email hoặc chưa có email link app).`]);
+  });
+});
+
 describe('api: customer calls', () => {
   it('lookupCustomer: an email string → {email}; an object goes as is (customer_ref, checkout_id)', async () => {
     const seen = [];
@@ -114,7 +138,15 @@ describe('api: customer calls', () => {
     expect(seen).toEqual(['{"email":"buyer@example.com"}', `{"customer_ref":"${REF}"}`]);
   });
 
-  it('grant and revoke are never retried (a lost reply would grant twice or answer 409)', async () => {
+  it('resend-email is retried (it only queues the same email again)', async () => {
+    let n = 0;
+    const fetch = async () => (n++ === 0 ? new Response('{}', { status: 503 }) : new Response('{"queued":true}', { status: 200 }));
+    const api = createApi({ api: 'https://api.x', token: 't' }, { fetch, sleep: async () => {} });
+    expect(await api.resendEmail(REF)).toEqual({ queued: true });
+    expect(n).toBe(2);
+  });
+
+  it('grant, revoke and rotate-user-id are never retried (a lost reply would grant twice, answer 409, or rotate twice)', async () => {
     const seen = [];
     const fetch = async (url, init) => {
       seen.push([init.method, url, init.body]);
@@ -123,9 +155,11 @@ describe('api: customer calls', () => {
     const api = createApi({ api: 'https://api.x', token: 't' }, { fetch, sleep: async () => {} });
     await expect(api.grantEntitlement(REF, { app_id: 'a', key: 'k', expires_at: null, reason: 'r' })).rejects.toMatchObject({ status: 503 });
     await expect(api.revokeGrant(REF, 7)).rejects.toMatchObject({ status: 503 });
+    await expect(api.rotateUserId(REF)).rejects.toMatchObject({ status: 503 });
     expect(seen).toEqual([
       ['POST', `https://api.x/v1/customers/${REF}/grants`, '{"app_id":"a","key":"k","expires_at":null,"reason":"r"}'],
       ['DELETE', `https://api.x/v1/customers/${REF}/grants/7`, undefined],
+      ['POST', `https://api.x/v1/customers/${REF}/rotate-user-id`, undefined],
     ]);
   });
 });
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/customer-actions.test.js 2>&1 | grep -E "Tests  "
npm test -w @ikf/cli -- test/customer.test.js 2>&1 | grep -E "×|Tests  "
```

Expected: core `Tests  9 failed (9)` (route chưa có); CLI 4 test (`resend-email`, `rotate-user-id … --yes`, `resend-email is retried`, `grant, revoke and rotate-user-id are never retried`) FAIL; `Tests  4 failed | 12 passed (16)`.

- [ ] **Step 3: Implement**

`services/core-api/src/identity/customer-actions.js` (mới):

```js
// What CS and admins do to a customer from the console (spec admin-console-p2 §2): send the app-link email again,
// give the buyer a new user_id. The email itself always goes through the claim-email loop (identity/sync.js
// sendClaimEmails: retries, backoff, alarm), never from the request.
import { actorOf, audit } from '../audit.js';
import { HttpError } from '../errors.js';
import { CLAIM_TTL_DAYS } from './claims.js';
import { customerByRef } from './customers.js';
import { lockCustomer } from './entitlements.js';
import { withTx } from './link.js';

// The claim email of the customer's newest checkout (app kind 'app') is queued again: unsent, 0 attempts, due
// now, valid for at least 7 more days. 409 no_email: no address to send to; 404 no_claim: nothing was ever sent.
export async function resendClaimEmail(pool, { ref, actor }) {
  return withTx(pool, async (c) => {
    const customer = await customerByRef(c, ref);
    if (!customer.has_email) throw new HttpError(409, 'no_email');
    const { rows } = await c.query(
      `SELECT ct.token_hash, ct.checkout_id FROM claim_tokens ct JOIN apps a ON a.id = ct.app_id
        WHERE ct.customer_id = $1 AND a.kind = 'app' AND ct.checkout_id IS NOT NULL
        ORDER BY ct.created_at DESC, ct.checkout_id DESC LIMIT 1 FOR UPDATE OF ct`,
      [customer.id],
    );
    if (!rows.length) throw new HttpError(404, 'no_claim');
    await c.query(
      `UPDATE claim_tokens SET emailed_at = NULL, email_attempts = 0, next_email_at = now(),
              expires_at = GREATEST(expires_at, now() + make_interval(days => $2))
        WHERE token_hash = $1`,
      [rows[0].token_hash, CLAIM_TTL_DAYS],
    );
    await audit(c, actorOf(actor), 'customer.resend_email', `customer:${ref}`, { customer_ref: ref, checkout_id: rows[0].checkout_id });
    return { queued: true, checkout_id: rows[0].checkout_id };
  });
}

// A leaked user_id: a new random one, now. Every installed app is FREE until the buyer opens the new link (the
// resent email; the checkout's claim page also answers with it). The old UUID is not kept anywhere. After the
// commit the claim email is queued again; no address or no claim email is not an error here (email_queued false).
export async function rotateUserId(pool, { ref, actor }) {
  const rotatedAt = await withTx(pool, async (c) => {
    const customer = await customerByRef(c, ref);
    await lockCustomer(c, customer.id);
    const { rows } = await c.query(
      'UPDATE customers SET user_id = gen_random_uuid(), user_id_rotated_at = now() WHERE id = $1 RETURNING user_id_rotated_at',
      [customer.id],
    );
    await audit(c, actorOf(actor), 'customer.rotate_user_id', `customer:${ref}`, { customer_ref: ref });
    return rows[0].user_id_rotated_at.toISOString();
  });
  let emailQueued = false;
  try {
    emailQueued = (await resendClaimEmail(pool, { ref, actor })).queued;
  } catch (err) {
    if (!(err instanceof HttpError && ['no_claim', 'no_email'].includes(err.code))) throw err;
  }
  return { rotated_at: rotatedAt, email_queued: emailQueued };
}
```

`services/core-api/src/http/customers.js` và `packages/cli/src/{main,api}.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/packages/cli/src/api.js b/packages/cli/src/api.js
index e1b8d36..f259a9e 100644
--- a/packages/cli/src/api.js
+++ b/packages/cli/src/api.js
@@ -77,6 +77,10 @@ export function createApi({ api, token }, { fetch: doFetch = fetch, retries = 3,
     // Not retried: a lost reply would turn the retry into a second grant (or 409 already_revoked).
     grantEntitlement: (ref, body) => call('POST', `/v1/customers/${ref}/grants`, { body, retry: false }),
     revokeGrant: (ref, id) => call('DELETE', `/v1/customers/${ref}/grants/${id}`, { retry: false }),
+    // Safe to retry: it only queues the same email again.
+    resendEmail: (ref) => call('POST', `/v1/customers/${ref}/resend-email`, { retry: true }),
+    // Not retried: a lost reply would rotate twice (the first new user_id is lost with it).
+    rotateUserId: (ref) => call('POST', `/v1/customers/${ref}/rotate-user-id`, { retry: false }),
     listAdminUsers: () => call('GET', '/v1/admin/users', { retry: true }),
     // Not retried: a lost reply would turn the retry into 409 user_exists.
     createAdminUser: (body) => call('POST', '/v1/admin/users', { body, retry: false }),
diff --git a/packages/cli/src/main.js b/packages/cli/src/main.js
index cd4efdb..8a4a538 100755
--- a/packages/cli/src/main.js
+++ b/packages/cli/src/main.js
@@ -31,6 +31,8 @@ const USAGE = `Cách dùng:
   ikf customer show <email|cus_…>
   ikf customer grant <cus_…> --app <id> --key <key> [--expires <ISO>] --reason <lý do>   (cấp quyền thủ công, admin)
   ikf customer revoke <cus_…> <grant_id>
+  ikf customer resend-email <cus_…>   (gửi lại email link app của checkout mới nhất)
+  ikf customer rotate-user-id <cus_…> --yes   (user_id bị lộ: mọi app đã cài về FREE tới khi khách mở link mới)
   ikf admin add <email> --role viewer|support|editor|admin [--name <tên>]   (người dùng trang admin, đăng nhập Google; support: tra khách, gửi lại email)
   ikf admin ls
   ikf admin disable <email>   (khoá ngay, mọi phiên đăng nhập kết thúc)
@@ -229,6 +231,19 @@ async function revokeCommand(api, args, out) {
 async function customerCommand(api, sub, args, values, out) {
   if (sub === 'grant') return grantCommand(api, args, values, out);
   if (sub === 'revoke') return revokeCommand(api, args, out);
+  if (sub === 'resend-email') {
+    const ref = customerRef(args[0]);
+    const r = await api.resendEmail(ref);
+    out(`${ref}: email link app (checkout ${r.checkout_id}) sẽ được gửi lại trong vài giây.`);
+    return 0;
+  }
+  if (sub === 'rotate-user-id') {
+    const ref = customerRef(args[0]);
+    if (!values.yes) throw new UsageError('Cấp lại user_id: mọi app đã cài của khách về FREE cho tới khi khách mở link mới trong email. Chạy lại với --yes để xác nhận.');
+    const r = await api.rotateUserId(ref);
+    out(`${ref}: đã cấp lại user_id lúc ${r.rotated_at}; ${r.email_queued ? 'email với link mới sẽ được gửi.' : 'KHÔNG gửi được email (khách không có email hoặc chưa có email link app).'}`);
+    return 0;
+  }
   const who = args[0];
   if (sub !== 'show' || !who || !(who.includes('@') || CUSTOMER_REF_RE.test(who))) throw new UsageError(USAGE);
   const { customers } = await api.lookupCustomer(who.includes('@') ? who : { customer_ref: who });
diff --git a/services/core-api/src/http/customers.js b/services/core-api/src/http/customers.js
index 2eed185..998d6ee 100644
--- a/services/core-api/src/http/customers.js
+++ b/services/core-api/src/http/customers.js
@@ -1,5 +1,6 @@
 import { requireRole } from '../auth.js';
 import { CUSTOMER_REF_PATTERN, customerReport } from '../identity/customers.js';
+import { resendClaimEmail, rotateUserId } from '../identity/customer-actions.js';
 import { grantEntitlement, revokeGrant } from '../identity/grants.js';
 
 const refParams = {
@@ -35,6 +36,16 @@ export default async function customersHttp(app, { pool }) {
     },
   );
 
+  app.post('/v1/customers/:ref/resend-email', { onRequest: requireRole(pool, 'support'), schema: { params: refParams } }, async (req, reply) => {
+    reply.header('cache-control', 'no-store');
+    return resendClaimEmail(pool, { ref: req.params.ref, actor: req.actor });
+  });
+
+  app.post('/v1/customers/:ref/rotate-user-id', { onRequest: admin, schema: { params: refParams } }, async (req, reply) => {
+    reply.header('cache-control', 'no-store');
+    return rotateUserId(pool, { ref: req.params.ref, actor: req.actor });
+  });
+
   app.post(
     '/v1/customers/:ref/grants',
     {
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/customer-actions.test.js 2>&1 | grep -E "Tests  "
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
npm test -w @ikf/cli 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  9 passed (9)`; core-api `49 passed (49)` / `464 passed (464)`; cli `14` / `146`.

- [ ] **Step 5: Commit**

```bash
git add services/core-api packages/cli
git commit -m "feat: resend the app-link email (support) and rotate a customer's user_id (admin), audited; ikf customer resend-email|rotate-user-id"
```

---

### Task 7: Catalog giá Paddle: `@ikf/paddle` `listPrices`, `GET /v1/paddle/prices` (cache 60 s, 503), Paddle giả của demo

**Files:**
- Create: `services/core-api/src/billing/catalog.js`
- Modify: `packages/paddle/src/index.js`, `services/core-api/src/http/prices.js`, `demo/lib/paddle-fake.mjs`
- Test: `services/core-api/test/paddle-catalog.test.js` (mới); Modify: `packages/paddle/test/client.test.js`, `services/core-api/test/helpers/paddle.js`, `demo/test/paddle-fake.test.mjs`

**Interfaces:**
- Consumes: `pages(first, keep)` (closure trong `createPaddleClient`), `paddleHttpError` (`billing/errors.js`), `PaddleError`; `deps.now`, `deps.alarm`.
- Produces: `paddle.listPrices({status = ['active'], include = ['product']})` → mảng price Paddle (mọi trang). `src/billing/catalog.js`: `CATALOG_TTL_MS = 60_000`, `CATALOG_STATUSES = ['active','archived']`, `priceView(p)` → `{id, name, product_name, amount_minor, currency, interval: {unit, frequency} | null, status}`, `priceCatalog(paddle, {ttlMs, now})` → `{list()}`. Route `GET /v1/paddle/prices` (`prices:read`) → `{prices: [priceView]}` | `503 paddle_unavailable`. Test helper `fakePaddle().price(id, {status, recurring, name, amount, product})`, `fakePaddle().listPrices(...)`. Demo: `DEMO_PRICES.old` (`pri_demoarchived00000000000000`, archived), fake `listPrices`, `getPrice` trả `name`/`product`/`status`.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/paddle-catalog.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, tokenFor, bearer } from './helpers/app.js';
import { ADMIN_ORIGIN, signIn } from './helpers/admin.js';
import { fakePaddle, PRICE_W1, PRICE_ADDON, PRICE_OTHER } from './helpers/paddle.js';
import { CATALOG_TTL_MS } from '../src/billing/catalog.js';

// Spec admin-console-p2 §2: GET /v1/paddle/prices (prices:read), Paddle's catalog through core, cached 60 s.
describe('GET /v1/paddle/prices', () => {
  let db;
  let app;
  let paddle;
  let alarms;
  let t;
  let ed;
  const get = (headers = ed.headers(false)) => app.inject({ method: 'GET', url: '/v1/paddle/prices', headers });
  const listCalls = () => paddle.calls.filter((c) => c[0] === 'listPrices');

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    paddle = fakePaddle();
    paddle.price(PRICE_W1, { name: 'Weekly', amount: '1367', product: 'Starlyn premium' });
    paddle.price(PRICE_ADDON, { recurring: false, name: 'Tarot 2027', amount: '1999', product: 'Starlyn add-ons' });
    paddle.price(PRICE_OTHER, { status: 'archived', name: 'Old weekly', amount: '999' });
    alarms = [];
    t = 1_000_000;
    ({ app } = await makeApp(db.pool, { paddle, alarm: async (kind) => alarms.push(kind), now: () => t, admin: { origin: ADMIN_ORIGIN, appEnv: 'staging' } }));
    ed = await signIn(db.pool, 'ed@ikameglobal.com', 'editor');
  });
  afterEach(() => app.close());

  it('active and archived prices with product name, amount, currency, interval and status', async () => {
    const res = await get();
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      prices: [
        { id: PRICE_W1, name: 'Weekly', product_name: 'Starlyn premium', amount_minor: 1367, currency: 'USD', interval: { unit: 'week', frequency: 1 }, status: 'active' },
        { id: PRICE_ADDON, name: 'Tarot 2027', product_name: 'Starlyn add-ons', amount_minor: 1999, currency: 'USD', interval: null, status: 'active' },
        { id: PRICE_OTHER, name: 'Old weekly', product_name: null, amount_minor: 999, currency: 'USD', interval: { unit: 'week', frequency: 1 }, status: 'archived' },
      ],
    });
    expect(listCalls()).toEqual([['listPrices', { status: ['active', 'archived'], include: ['product'] }]]);
  });

  it('cached in-process for 60 s: one Paddle call per minute however many readers', async () => {
    expect(CATALOG_TTL_MS).toBe(60_000);
    await get();
    t += 59_000;
    await get();
    expect(listCalls()).toHaveLength(1);
    t += 2_000;
    paddle.price(PRICE_W1, { name: 'Weekly v2', amount: '1499' });
    expect((await get()).json().prices[0]).toMatchObject({ name: 'Weekly v2', amount_minor: 1499 });
    expect(listCalls()).toHaveLength(2);
  });

  it('Paddle down, our key rejected, or any other Paddle error → 503 paddle_unavailable (not cached); a bad key also alarms', async () => {
    paddle.fail('unavailable');
    expect((await get()).json()).toEqual({ error: 'paddle_unavailable' });
    paddle.fail('auth');
    expect((await get()).statusCode).toBe(503);
    expect(alarms).toEqual(['paddle_auth_failed']);
    paddle.fail('client');
    expect((await get()).statusCode).toBe(503);
    paddle.ok();
    expect((await get()).statusCode).toBe(200);
  });

  it('roles: editor and admin read; viewer and support do not; tokens publisher and router read', async () => {
    for (const [role, code] of [['viewer', 403], ['support', 403], ['admin', 200]]) {
      const p = await signIn(db.pool, `${role}@ikameglobal.com`, role);
      expect((await get(p.headers(false))).statusCode, role).toBe(code);
    }
    for (const role of ['publisher', 'router']) expect((await get(bearer(await tokenFor(db.pool, role)))).statusCode, role).toBe(200);
  });
});
```

`packages/paddle/test/client.test.js`, `services/core-api/test/helpers/paddle.js`, `demo/test/paddle-fake.test.mjs` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/demo/test/paddle-fake.test.mjs b/demo/test/paddle-fake.test.mjs
index 376ab5d..6e7b088 100644
--- a/demo/test/paddle-fake.test.mjs
+++ b/demo/test/paddle-fake.test.mjs
@@ -129,6 +129,19 @@ describe('fake Paddle (demo)', () => {
     await expect(paddle.pay((await checkout()).id, 'buyer@demo.test')).rejects.toThrow('webhook subscription.created: HTTP 401');
   });
 
+  // Spec admin-console-p2 §4: the console's price picker lists the fake catalog (1w, addon, one archived price).
+  it('listPrices: the catalog by status, with product names; an archived price is archived for getPrice too', async () => {
+    const all = await paddle.listPrices({ status: ['active', 'archived'], include: ['product'] });
+    expect(all.map((p) => [p.id, p.status, p.name, p.product?.name, p.unit_price.amount, p.billing_cycle?.interval ?? null])).toEqual([
+      [DEMO_PRICES['1w'].id, 'active', 'Weekly', 'Starlyn premium', '1367', 'week'],
+      [DEMO_PRICES.addon.id, 'active', 'Tarot reading 2027', 'Starlyn add-on', '1999', null],
+      [DEMO_PRICES.old.id, 'archived', 'Weekly (old)', 'Starlyn premium', '999', 'week'],
+    ]);
+    expect((await paddle.listPrices()).map((p) => p.id)).toEqual([DEMO_PRICES['1w'].id, DEMO_PRICES.addon.id]);
+    expect((await paddle.listPrices({ include: [] }))[0].product).toBeUndefined();
+    expect(await paddle.getPrice(DEMO_PRICES.old.id)).toMatchObject({ status: 'archived' });
+  });
+
   it('state() lists transactions and subscriptions for the control panel, without emails', async () => {
     const txn = await checkout();
     await paddle.pay(txn.id, 'buyer@demo.test');
diff --git a/packages/paddle/test/client.test.js b/packages/paddle/test/client.test.js
index a196b8e..b2fbb4b 100644
--- a/packages/paddle/test/client.test.js
+++ b/packages/paddle/test/client.test.js
@@ -164,3 +164,31 @@ describe('createPaddleClient', () => {
     await expect(client(f).listTransactions({ updatedAfter: '2026-10-08T10:00:00Z' })).rejects.toThrow(/pagination/);
   });
 });
+
+// Spec admin-console-p2 §2: the price catalog for the console's dropdown.
+describe('listPrices', () => {
+  it('asks for the statuses and includes, 200 per page, and follows every page', async () => {
+    const next = 'https://sandbox-api.paddle.com/prices?after=pri_2&per_page=200';
+    const f = fakeFetch(
+      json(200, { data: [{ id: 'pri_1' }, { id: 'pri_2' }], meta: { pagination: { per_page: 200, next, has_more: true } } }),
+      json(200, { data: [{ id: 'pri_3', product: { name: 'Starlyn' } }], meta: { pagination: { per_page: 200, next: 'https://x', has_more: false } } }),
+    );
+    const out = await client(f).listPrices({ status: ['active', 'archived'], include: ['product'] });
+    expect(out.map((p) => p.id)).toEqual(['pri_1', 'pri_2', 'pri_3']);
+    expect(f.calls.map((c) => c.url)).toEqual([
+      'https://sandbox-api.paddle.com/prices?per_page=200&status=active%2Carchived&include=product',
+      next,
+    ]);
+  });
+
+  it('defaults: active prices with their product', async () => {
+    const f = fakeFetch(json(200, { data: [], meta: { pagination: { has_more: false } } }));
+    expect(await client(f).listPrices()).toEqual([]);
+    expect(f.calls[0].url).toBe('https://sandbox-api.paddle.com/prices?per_page=200&status=active&include=product');
+  });
+
+  it('an outage is unavailable after the retries', async () => {
+    const f = fakeFetch(json(503, {}), json(503, {}), json(503, {}));
+    await expect(client(f).listPrices()).rejects.toMatchObject({ kind: 'unavailable' });
+  });
+});
diff --git a/services/core-api/test/helpers/paddle.js b/services/core-api/test/helpers/paddle.js
index 00e1348..1585448 100644
--- a/services/core-api/test/helpers/paddle.js
+++ b/services/core-api/test/helpers/paddle.js
@@ -66,8 +66,11 @@ export function fakePaddle() {
     ok() {
       failing = null;
     },
-    price(id, { status = 'active', recurring = true } = {}) {
-      state.prices.set(id, { id, status, billing_cycle: recurring ? { interval: 'week', frequency: 1 } : null });
+    price(id, { status = 'active', recurring = true, name = null, amount = '999', product = null } = {}) {
+      state.prices.set(id, {
+        id, status, billing_cycle: recurring ? { interval: 'week', frequency: 1 } : null,
+        name, unit_price: { amount, currency_code: 'USD' }, ...(product && { product: { name: product } }),
+      });
     },
     discount(id, status = 'active') {
       state.discounts.set(id, { id, status });
@@ -130,6 +133,12 @@ export function fakePaddle() {
       state.customers.set(c.id, c);
       return structuredClone(c);
     },
+    async listPrices({ status = ['active'], include = ['product'] } = {}) {
+      guard('listPrices', { status, include });
+      return [...state.prices.values()]
+        .filter((p) => status.includes(p.status))
+        .map(({ product, ...p }) => structuredClone(include.includes('product') && product ? { ...p, product } : p));
+    },
     async listTransactions({ updatedAfter }) {
       guard('listTransactions', { updatedAfter });
       return [...state.transactions.values()]
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/paddle 2>&1 | grep -E "×|Tests  "
npm test -w @ikf/core-api -- test/paddle-catalog.test.js test/prices.test.js 2>&1 | grep -E "Error|Test Files|Tests  "
npx vitest run --config demo/vitest.config.mjs demo/test/paddle-fake.test.mjs 2>&1 | grep -E "×|Tests  "
```

Expected: paddle 3 test `listPrices` FAIL (`listPrices` không phải hàm); `Tests  3 failed | 31 passed (34)`. core `Error: Cannot find module '../src/billing/catalog.js'`, `Test Files  1 failed | 1 passed (2)`, `Tests  9 passed (9)` (test cũ `prices.test.js` không đổi). demo `Tests  1 failed | 6 passed (7)`.

- [ ] **Step 3: Implement**

`services/core-api/src/billing/catalog.js` (mới):

```js
// The Paddle price catalog for the admin console's price picker (spec admin-console-p2 §2), cached in this
// process for 60 s: one Paddle list (all pages) per minute however many people open the Prices tab.
export const CATALOG_TTL_MS = 60_000;
export const CATALOG_STATUSES = ['active', 'archived'];

// One Paddle price (with include=product) as the console shows it.
export const priceView = (p) => ({
  id: p.id,
  name: p.name ?? p.description ?? p.id,
  product_name: p.product?.name ?? null,
  amount_minor: p.unit_price ? Number(p.unit_price.amount) : null,
  currency: p.unit_price?.currency_code ?? null,
  interval: p.billing_cycle ? { unit: p.billing_cycle.interval, frequency: p.billing_cycle.frequency } : null,
  status: p.status,
});

// A failed list is not cached: the next reader asks Paddle again.
export function priceCatalog(paddle, { ttlMs = CATALOG_TTL_MS, now = Date.now } = {}) {
  let hit = null;
  return {
    async list() {
      if (hit && now() - hit.at < ttlMs) return hit.value;
      const prices = await paddle.listPrices({ status: CATALOG_STATUSES, include: ['product'] });
      hit = { value: { prices: prices.map(priceView) }, at: now() };
      return hit.value;
    },
  };
}
```

`packages/paddle/src/index.js`, `services/core-api/src/http/prices.js`, `demo/lib/paddle-fake.mjs` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/demo/lib/paddle-fake.mjs b/demo/lib/paddle-fake.mjs
index 477804b..a955571 100644
--- a/demo/lib/paddle-fake.mjs
+++ b/demo/lib/paddle-fake.mjs
@@ -12,10 +12,12 @@ const EXPIRED_DAYS_AGO = 4;
 const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 const ALNUM = 'abcdefghijklmnopqrstuvwxyz0123456789';
 
-// witch-power's plans: 1w = $13.67 weekly, addon = $19.99 once (prices in minor units).
+// witch-power's plans: 1w = $13.67 weekly, addon = $19.99 once (prices in minor units); `old` is an archived
+// price, so the admin console's picker shows one (spec admin-console-p2 §4).
 export const DEMO_PRICES = {
-  '1w': { id: 'pri_demoweekly0000000000000000', amount: 1367, recurring: true },
-  addon: { id: 'pri_demoaddon00000000000000000', amount: 1999, recurring: false },
+  '1w': { id: 'pri_demoweekly0000000000000000', amount: 1367, recurring: true, name: 'Weekly', product: 'Starlyn premium' },
+  addon: { id: 'pri_demoaddon00000000000000000', amount: 1999, recurring: false, name: 'Tarot reading 2027', product: 'Starlyn add-on' },
+  old: { id: 'pri_demoarchived00000000000000', amount: 999, recurring: true, name: 'Weekly (old)', product: 'Starlyn premium', status: 'archived' },
 };
 
 // <prefix>_ + 26 lowercase alphanumerics, the shape of Paddle ids.
@@ -70,6 +72,16 @@ export function createFakePaddle({ webhookUrl, webhookSecret, prices = DEMO_PRIC
     return c;
   }
 
+  // A Paddle price object (product as with include=product).
+  const priceObject = (p) => ({
+    id: p.id,
+    status: p.status ?? 'active',
+    name: p.name ?? null,
+    billing_cycle: p.recurring ? { interval: 'week', frequency: 1 } : null,
+    unit_price: { amount: String(p.amount), currency_code: 'USD' },
+    product: { name: p.product ?? null },
+  });
+
   const period = (startMs) => ({ starts_at: iso(startMs), ends_at: iso(startMs + PERIOD_DAYS * DAY) });
 
   function newTransaction({ priceId, customerId = null, customData = null, status, subscriptionId = null, origin = 'web' }) {
@@ -129,7 +141,13 @@ export function createFakePaddle({ webhookUrl, webhookSecret, prices = DEMO_PRIC
     async getPrice(id) {
       const p = priceById.get(id);
       if (!p) throw notFound('price', id);
-      return { id, status: 'active', billing_cycle: p.recurring ? { interval: 'week', frequency: 1 } : null, unit_price: { amount: String(p.amount), currency_code: 'USD' } };
+      return priceObject(p);
+    },
+    async listPrices({ status = ['active'], include = ['product'] } = {}) {
+      return [...priceById.values()].filter((p) => status.includes(p.status ?? 'active')).map((p) => {
+        const { product, ...price } = priceObject(p);
+        return include.includes('product') ? { ...price, product } : price;
+      });
     },
     async getDiscount(id) {
       throw notFound('discount', id);
diff --git a/packages/paddle/src/index.js b/packages/paddle/src/index.js
index c880b9a..590ea90 100644
--- a/packages/paddle/src/index.js
+++ b/packages/paddle/src/index.js
@@ -86,6 +86,13 @@ export function createPaddleClient({
       const q = new URLSearchParams({ 'updated_at[GT]': updatedAfter, order_by: 'updated_at[ASC]', per_page: '200' });
       return pages(`/transactions?${q}`);
     },
+    // Every price with the given statuses (and includes, e.g. its product), all pages: the admin console's catalog.
+    listPrices({ status = ['active'], include = ['product'] } = {}) {
+      const q = new URLSearchParams({ per_page: '200' });
+      if (status.length) q.set('status', status.join(','));
+      if (include.length) q.set('include', include.join(','));
+      return pages(`/prices?${q}`);
+    },
     // Refund and chargeback adjustments created after `createdAfter` (RFC 3339). /adjustments has no date
     // filter and orders by id only; ids sort by creation, so page newest first and stop at the window edge.
     listAdjustments({ createdAfter }) {
diff --git a/services/core-api/src/http/prices.js b/services/core-api/src/http/prices.js
index 3b4ec4e..6dac1d9 100644
--- a/services/core-api/src/http/prices.js
+++ b/services/core-api/src/http/prices.js
@@ -1,5 +1,9 @@
+import { PaddleError } from '@ikf/paddle';
 import { requireRole } from '../auth.js';
+import { priceCatalog } from '../billing/catalog.js';
+import { paddleHttpError } from '../billing/errors.js';
 import { listFunnelPrices, setFunnelPrices } from '../billing/prices.js';
+import { HttpError } from '../errors.js';
 
 const params = {
   type: 'object',
@@ -24,7 +28,21 @@ const planValue = {
   ],
 };
 
-export default async function pricesHttp(app, { pool, paddle, alarm }) {
+export default async function pricesHttp(app, { pool, paddle, alarm, now = Date.now }) {
+  const catalog = priceCatalog(paddle, { now });
+
+  // Any Paddle failure is 503 here (the picker still lets people paste a pri_… id).
+  app.get('/v1/paddle/prices', { onRequest: requireRole(pool, 'prices:read') }, async (req) => {
+    try {
+      return await catalog.list();
+    } catch (err) {
+      const mapped = await paddleHttpError(err, { log: req.log, alarm });
+      if (mapped instanceof HttpError) throw mapped;
+      if (err instanceof PaddleError) throw new HttpError(503, 'paddle_unavailable');
+      throw err;
+    }
+  });
+
   app.put(
     '/v1/funnels/:slug/prices',
     {
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/paddle 2>&1 | grep -E "Tests  "
npm test -w @ikf/core-api -- test/paddle-catalog.test.js test/prices.test.js 2>&1 | grep -E "Tests  "
npx vitest run --config demo/vitest.config.mjs demo/test/paddle-fake.test.mjs demo/test/purchase-deps.test.mjs demo/test/seed.test.mjs 2>&1 | grep -E "Tests  "
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: paddle `Tests  34 passed (34)`; core `Tests  13 passed (13)`; demo `Tests  14 passed (14)` (không cần Docker); core-api `50 passed (50)` / `468 passed (468)`.

- [ ] **Step 5: Commit**

```bash
git add packages/paddle services/core-api demo
git commit -m "feat: Paddle price catalog (listPrices, GET /v1/paddle/prices cached 60 s, 503 on Paddle errors); demo fake catalog with an archived price"
```

---

### Task 8: `planKeysFromHtml` sang `@ikf/funnel-lint`; `versions.plan_keys` lúc upload; `GET /v1/funnels/:slug/prices` thêm `plan_keys`, `unmapped`

**Files:**
- Rename: `packages/cli/src/plans.js` → `packages/funnel-lint/src/plans.js`, `packages/cli/test/plans.test.js` → `packages/funnel-lint/test/plans.test.js`
- Modify: `packages/funnel-lint/src/index.js`, `packages/cli/src/publish.js`, `services/core-api/src/{http/versions.js, publisher/publish.js, billing/prices.js}`
- Test: `services/core-api/test/plan-keys.test.js` (mới)

**Interfaces:**
- Consumes: `planKeysFromHtml(html)` (CLI hiện có, không đổi logic), `versions.plan_keys` (Task 1), `publishVersion`, `listFunnelPrices`.
- Produces: `import { planKeysFromHtml } from '@ikf/funnel-lint'` (CLI, core, SPA dùng được). `publishVersion(…, {slug, html, lintReport, planKeys = null, actor})` lưu `plan_keys`; trùng sha256 thì điền `plan_keys` nếu NULL (A13). `listFunnelPrices(db, slug)` → `{funnel, plans, plan_keys: string[] | null, unmapped: string[]}`.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/plan-keys.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, tokenFor, bearer, sha, seedVersions } from './helpers/app.js';
import { fakePaddle, PRICE_W1 } from './helpers/paddle.js';
import { funnelHtml } from './helpers/pages.js';

// A funnel page whose CONFIG has these plans (CONFIG.plans) and checkout URLs (CONFIG.checkoutUrl).
const page = (marker, config = "plans:{'1w':{price:'$13.67'},m12:{price:'$99'}},checkoutUrl:{'1w':'',addon:''}") =>
  funnelHtml('aivideo', marker).replace("const CONFIG={funnel:'aivideo'}", `const CONFIG={funnel:'aivideo',${config}}`);

// Spec admin-console-p2 §1: plan keys read from the HTML at upload (versions.plan_keys); GET prices adds
// plan_keys of the newest version that has them, and unmapped = those plans with no price yet.
describe('plan keys of a funnel', () => {
  let db;
  let app;
  let store;
  let token;
  const q = async (sql, p) => (await db.pool.query(sql, p)).rows;
  const upload = (html) => app.inject({ method: 'POST', url: '/v1/funnels/aivideo/versions', headers: bearer(token), payload: { html, sha256: sha(html) } });
  const prices = async () => (await app.inject({ method: 'GET', url: '/v1/funnels/aivideo/prices', headers: bearer(token) })).json();

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    const paddle = fakePaddle();
    paddle.price(PRICE_W1);
    ({ app, store } = await makeApp(db.pool, { paddle }));
    token = await tokenFor(db.pool, 'admin');
  });
  afterEach(() => app.close());

  it('upload stores the plan keys; GET prices lists them and the ones without a price', async () => {
    expect((await upload(page('one'))).statusCode).toBe(201);
    expect(await q('SELECT n, plan_keys FROM versions')).toEqual([{ n: 1, plan_keys: ['1w', 'addon', 'm12'] }]);
    expect(await prices()).toEqual({ funnel: 'aivideo', plans: {}, plan_keys: ['1w', 'addon', 'm12'], unmapped: ['1w', 'addon', 'm12'] });
    await app.inject({ method: 'PUT', url: '/v1/funnels/aivideo/prices', headers: bearer(token), payload: { plans: { '1w': { price_id: PRICE_W1 } } } });
    expect(await prices()).toMatchObject({ plan_keys: ['1w', 'addon', 'm12'], unmapped: ['addon', 'm12'] });
  });

  it('a page without plans stores [] (known: no plans); versions from before have NULL; the newest version WITH keys counts', async () => {
    await seedVersions(db.pool, store, 'aivideo', 1);
    expect(await prices()).toEqual({ funnel: 'aivideo', plans: {}, plan_keys: null, unmapped: [] });
    await upload(page('two'));
    await seedVersions(db.pool, store, 'aivideo', 1); // v3 through the publisher directly: plan_keys NULL
    expect((await q('SELECT n, plan_keys FROM versions ORDER BY n')).map((r) => r.plan_keys)).toEqual([null, ['1w', 'addon', 'm12'], null]);
    expect((await prices()).plan_keys).toEqual(['1w', 'addon', 'm12']);
    await upload(page('four', "plans:{}"));
    expect(await prices()).toMatchObject({ plan_keys: [], unmapped: [] });
  });

  it('re-uploading the same file of a version stored before plan keys existed fills them in', async () => {
    const html = page('same');
    await upload(html);
    await q('UPDATE versions SET plan_keys = NULL');
    const again = await upload(html);
    expect(again.json()).toMatchObject({ v: 1, created: false });
    expect(await q('SELECT plan_keys FROM versions')).toEqual([{ plan_keys: ['1w', 'addon', 'm12'] }]);
  });
});
```

Chuyển test của `planKeysFromHtml` sang `@ikf/funnel-lint` (rename + đổi đường import; áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/packages/cli/test/plans.test.js b/packages/funnel-lint/test/plans.test.js
similarity index 95%
rename from packages/cli/test/plans.test.js
rename to packages/funnel-lint/test/plans.test.js
index 0b3929e..1f3871a 100644
--- a/packages/cli/test/plans.test.js
+++ b/packages/funnel-lint/test/plans.test.js
@@ -1,5 +1,5 @@
 import { describe, it, expect } from 'vitest';
-import { planKeysFromHtml } from '../src/plans.js';
+import { planKeysFromHtml } from '../src/index.js';
 
 describe('planKeysFromHtml', () => {
   it('reads the top-level keys of CONFIG.plans and CONFIG.checkoutUrl (addon lives only in checkoutUrl)', () => {
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/funnel-lint 2>&1 | grep -E "TypeError|Test Files|Tests  "
npm test -w @ikf/core-api -- test/plan-keys.test.js 2>&1 | grep -E "Tests  "
```

Expected: funnel-lint 4 test `planKeysFromHtml` FAIL (`TypeError: (0 , planKeysFromHtml) is not a function`); `Test Files  1 failed | 2 passed (3)`, `Tests  4 failed | 31 passed (35)`. core `Tests  3 failed (3)` (`plan_keys` NULL, GET không có `plan_keys`).

- [ ] **Step 3: Implement**

Chuyển `plans.js` (rename) và nối vào core (áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/packages/cli/src/publish.js b/packages/cli/src/publish.js
index 8228d87..86c2fea 100644
--- a/packages/cli/src/publish.js
+++ b/packages/cli/src/publish.js
@@ -1,9 +1,8 @@
 import { createHash } from 'node:crypto';
 import { readFile } from 'node:fs/promises';
 import { join } from 'node:path';
-import { lint } from '@ikf/funnel-lint';
+import { lint, planKeysFromHtml } from '@ikf/funnel-lint';
 import { findToolsDir, runLocalChecks } from './checks.js';
-import { planKeysFromHtml } from './plans.js';
 import { UsageError } from './target.js';
 
 const SLUG = /^[a-z0-9][a-z0-9-]{1,62}$/;
diff --git a/packages/funnel-lint/src/index.js b/packages/funnel-lint/src/index.js
index 5926918..f4c37e1 100644
--- a/packages/funnel-lint/src/index.js
+++ b/packages/funnel-lint/src/index.js
@@ -2,6 +2,8 @@
 // String work only, no dependencies, no Node built-ins: core-api, the ikf CLI and the admin SPA all run it.
 // lint(html, {slug, app, mediaOrigins, maxBytes}) → {errors: [{code, message, line?}], warnings: [...]}.
 
+export { planKeysFromHtml } from './plans.js';
+
 export const MAX_BYTES = 1024 * 1024; // same cap as core's publisher (MAX_BUNDLE_BYTES)
 // <script src> origins a funnel may load (plus the media library origins passed in mediaOrigins).
 export const SCRIPT_ALLOWLIST = [
diff --git a/packages/cli/src/plans.js b/packages/funnel-lint/src/plans.js
similarity index 93%
rename from packages/cli/src/plans.js
rename to packages/funnel-lint/src/plans.js
index c93777f..303b377 100644
--- a/packages/cli/src/plans.js
+++ b/packages/funnel-lint/src/plans.js
@@ -1,5 +1,6 @@
 // Top-level keys of the first `plans:{…}` and `checkoutUrl:{…}` object literals in a funnel's CONFIG.
 // A tiny scanner (strings, template literals and nesting aware), not a JS parser: CONFIG is data.
+// Shared by core-api (versions.plan_keys at upload), the ikf CLI (unmapped-plan warning) and the admin SPA.
 export function planKeysFromHtml(html) {
   const keys = new Set();
   for (const name of ['plans', 'checkoutUrl']) {
diff --git a/services/core-api/src/billing/prices.js b/services/core-api/src/billing/prices.js
index 8069a11..e41cf5f 100644
--- a/services/core-api/src/billing/prices.js
+++ b/services/core-api/src/billing/prices.js
@@ -55,6 +55,11 @@ export async function listFunnelPrices(db, slug) {
        FROM funnel_prices WHERE funnel_id = $1 ORDER BY plan_key`,
     [id],
   );
+  // Plan keys of the newest version that has them (NULL = uploaded before they were read).
+  const { rows: [latest] } = await db.query(
+    'SELECT plan_keys FROM versions WHERE funnel_id = $1 AND plan_keys IS NOT NULL ORDER BY n DESC LIMIT 1',
+    [id],
+  );
   const plans = {};
   for (const r of rows) {
     plans[r.plan_key] = {
@@ -66,7 +71,8 @@ export async function listFunnelPrices(db, slug) {
       updated_at: r.updated_at.toISOString(),
     };
   }
-  return { funnel: slug, plans };
+  const planKeys = latest ? latest.plan_keys : null;
+  return { funnel: slug, plans, plan_keys: planKeys, unmapped: (planKeys ?? []).filter((k) => !Object.hasOwn(plans, k)) };
 }
 
 // A change of a plan's kind or entitlement_key queues the funnel's buyers for a recompute (F2).
diff --git a/services/core-api/src/http/versions.js b/services/core-api/src/http/versions.js
index c36f376..d3cd52f 100644
--- a/services/core-api/src/http/versions.js
+++ b/services/core-api/src/http/versions.js
@@ -1,4 +1,4 @@
-import { lint } from '@ikf/funnel-lint';
+import { lint, planKeysFromHtml } from '@ikf/funnel-lint';
 import { requireRole } from '../auth.js';
 import { HttpError } from '../errors.js';
 import { publishVersion, sha256Hex } from '../publisher/publish.js';
@@ -40,10 +40,12 @@ export default async function versionsHttp(app, { pool, store, mediaOrigins, pre
       // Server lint on every upload, CLI or web (spec admin-console-p1 §4); errors create no version.
       const report = lint(html, { slug, app: await funnelAppKind(pool, slug), mediaOrigins });
       if (report.errors.length) throw new HttpError(422, 'lint_failed', report);
+      // Which plans the page sells (spec admin-console-p2 §1): the console's Prices tab shows the unmapped ones.
+      const planKeys = planKeysFromHtml(html);
       const check = validateBundle(html, { slug, mediaOrigins });
       if (!check.ok) throw new HttpError(check.status, check.errors[0].code, check.errors);
       const lintReport = { ...report, ...(clientReport && { client: clientReport }) };
-      const r = await publishVersion({ pool, store, previewBaseUrl }, { slug, html, lintReport, actor: req.actor });
+      const r = await publishVersion({ pool, store, previewBaseUrl }, { slug, html, lintReport, planKeys, actor: req.actor });
       reply.code(r.created ? 201 : 200);
       return { funnel: r.funnel, v: r.v, sha256: r.sha256, created: r.created, preview_url: r.previewUrl };
     },
diff --git a/services/core-api/src/publisher/publish.js b/services/core-api/src/publisher/publish.js
index 83394f3..9f52982 100644
--- a/services/core-api/src/publisher/publish.js
+++ b/services/core-api/src/publisher/publish.js
@@ -11,7 +11,8 @@ export const lintCounts = (r) => ({
   warnings: Array.isArray(r?.warnings) ? r.warnings.length : 0,
 });
 
-export async function publishVersion({ pool, store, previewBaseUrl }, { slug, html, lintReport = {}, actor }) {
+// planKeys: the HTML's plan keys (versions.plan_keys, spec admin-console-p2 §1), null when not read.
+export async function publishVersion({ pool, store, previewBaseUrl }, { slug, html, lintReport = {}, planKeys = null, actor }) {
   const who = actorOf(actor);
   const sha256 = sha256Hex(html);
   const result = (v, created) => ({ funnel: slug, v, sha256, created, previewUrl: `${previewBaseUrl}/${slug}/v${v}` });
@@ -22,9 +23,11 @@ export async function publishVersion({ pool, store, previewBaseUrl }, { slug, ht
     // The row lock serializes publishes of one funnel: n is allocated once and no two R2 writes race.
     const funnelId = (await client.query('SELECT id FROM funnels WHERE slug = $1 FOR UPDATE', [slug])).rows[0].id;
     const latest = (
-      await client.query('SELECT n, sha256 FROM versions WHERE funnel_id = $1 ORDER BY n DESC LIMIT 1', [funnelId])
+      await client.query('SELECT id, n, sha256 FROM versions WHERE funnel_id = $1 ORDER BY n DESC LIMIT 1', [funnelId])
     ).rows[0];
     if (latest?.sha256 === sha256) {
+      // The same file again (e.g. "upload again to read the plans" on a version from before plan_keys).
+      if (planKeys) await client.query('UPDATE versions SET plan_keys = $2 WHERE id = $1 AND plan_keys IS NULL', [latest.id, planKeys]);
       await client.query('COMMIT');
       return result(latest.n, false);
     }
@@ -38,9 +41,9 @@ export async function publishVersion({ pool, store, previewBaseUrl }, { slug, ht
       throw err;
     }
     await client.query(
-      `INSERT INTO versions (funnel_id, n, sha256, r2_key, size, lint_report, created_by)
-       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
-      [funnelId, n, sha256, key, Buffer.byteLength(html, 'utf8'), lintReport, who.name],
+      `INSERT INTO versions (funnel_id, n, sha256, r2_key, size, lint_report, created_by, plan_keys)
+       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
+      [funnelId, n, sha256, key, Buffer.byteLength(html, 'utf8'), lintReport, who.name, planKeys],
     );
     await audit(client, who, 'version.upload', `funnel:${slug}`, { slug, v: n, sha256, lint: lintCounts(lintReport) });
     await client.query('COMMIT');
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/funnel-lint -w @ikf/cli 2>&1 | grep -E "Test Files|Tests  "
npm test -w @ikf/core-api -- test/plan-keys.test.js test/prices.test.js test/upload-lint.test.js test/publish.test.js 2>&1 | grep -E "Tests  "
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: funnel-lint `3` / `35`, cli `13` / `142` (4 test `plans` đã chuyển đi); core `Tests  28 passed (28)`; core-api `51 passed (51)` / `471 passed (471)`.

- [ ] **Step 5: Commit**

```bash
git add -A packages/cli packages/funnel-lint services/core-api
git commit -m "feat: planKeysFromHtml moves to @ikf/funnel-lint; versions.plan_keys at upload; GET prices adds plan_keys and unmapped"
```

---

### Task 9: `PUT /v1/apps/:id`, webhooks `before` + `counts`, audit `webhook.resend` và `billing.reconcile`, `ikf app update`

**Files:**
- Modify: `services/core-api/src/{identity/apps.js, identity/webhooks.js, http/apps.js, http/billing.js}`; `packages/cli/src/{main,api}.js`
- Test: `services/core-api/test/apps-p2.test.js`, `packages/cli/test/app-update.test.js` (mới); Modify: `services/core-api/test/reconcile.test.js` (thêm `describe` cuối file)

**Interfaces:**
- Consumes: `checkApp`, `appView`, `COLUMNS` (`identity/apps.js`), `withTx`, `audit`, `resendDelivery`, `listDeliveries`, `reconcile`.
- Produces: `EDITABLE` (7 field), `updateApp(pool, id, fields, actor)` → `{app}` | `400 no_fields` | `400 invalid_app [{field, reason}]` | `404 app_not_found {id}` (A8). `listDeliveries(db, {appId, status, limit, before})` → `{items, next_before, counts: {pending, delivered, dead}}` (A9). `resendDelivery(pool, {appId, eventId, actor = null})`. Route `PUT /v1/apps/:id` (`router`), `GET /v1/apps/:id/webhooks?status&limit&before`. CLI `ikf app update <id> [--name] [--webhook] [--adjust] [--scheme] [--return-url] [--deeplink-path] [--bundle-ids]`, `api.updateApp(id, body)` (retry).

- [ ] **Step 1: Viết test fail**

`services/core-api/test/apps-p2.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, tokenFor, bearer } from './helpers/app.js';
import { ADMIN_ORIGIN, signIn } from './helpers/admin.js';
import { WEB_BODY, fakeSecrets, seedApp } from './helpers/identity.js';

const ev = (n) => `01JA00000000000000000000${String(n).padStart(2, '0')}`;

// Spec admin-console-p2 §2: PUT /v1/apps/:id (admin), webhooks list with a cursor and counts (apps:read),
// resend audited.
describe('apps in the console: edit, webhooks page, resend audit', () => {
  let db;
  let app;
  let boss;
  const q = async (sql, p) => (await db.pool.query(sql, p)).rows;
  const put = (id, body, headers = boss.headers()) => app.inject({ method: 'PUT', url: `/v1/apps/${id}`, headers, payload: body });
  const audits = () => q("SELECT actor, action, target, details FROM audit_log WHERE action IN ('app.update', 'webhook.resend') ORDER BY id");

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    const secrets = fakeSecrets();
    await seedApp(db.pool, secrets);
    await seedApp(db.pool, secrets, WEB_BODY);
    ({ app } = await makeApp(db.pool, { webhookSecrets: secrets, admin: { origin: ADMIN_ORIGIN, appEnv: 'staging' } }));
    boss = await signIn(db.pool, 'boss@ikameglobal.com', 'admin');
  });
  afterEach(() => app.close());

  it('PUT changes only the given fields, returns the app, audits app.update {id, fields} in the same transaction', async () => {
    const res = await put('starlyn', { name: 'Starlyn 2', webhook_url: 'https://be2.starlyn.example/hook', bundle_ids: ['com.ikame.starlyn'] });
    expect(res.statusCode).toBe(200);
    expect(res.json().app).toMatchObject({
      id: 'starlyn', name: 'Starlyn 2', kind: 'app', handoff: 'claim', webhook_url: 'https://be2.starlyn.example/hook',
      adjust_tracker_url: 'https://app.adjust.com/abc123', deeplink_scheme: 'starlyn', bundle_ids: ['com.ikame.starlyn'],
    });
    expect(await audits()).toEqual([{
      actor: 'boss@ikameglobal.com', action: 'app.update', target: 'app:starlyn', details: { id: 'starlyn', fields: ['bundle_ids', 'name', 'webhook_url'] },
    }]);
    expect((await put('tarot-web', { return_url: 'https://tarot.example/hi' })).json().app.return_url).toBe('https://tarot.example/hi');
  });

  it.each([
    ['starlyn', { webhook_url: 'http://insecure.example/hook' }, [{ field: 'webhook_url', reason: 'https_required' }]],
    ['starlyn', { deeplink_scheme: 'Star lyn' }, [{ field: 'deeplink_scheme', reason: 'format' }]],
    ['starlyn', { deeplink_path: 'a/b' }, [{ field: 'deeplink_path', reason: 'format' }]],
    ['starlyn', { return_url: 'https://x.example/' }, [{ field: 'return_url', reason: 'kind' }]],
    ['tarot-web', { adjust_tracker_url: 'https://app.adjust.com/x' }, [{ field: 'adjust_tracker_url', reason: 'kind' }]],
    ['tarot-web', { return_url: 'ftp://x' }, [{ field: 'return_url', reason: 'https_required' }]],
    ['starlyn', { bundle_ids: ['bad id'] }, [{ field: 'bundle_ids', reason: 'format' }]],
  ])('%s %j → 400 invalid_app %j, nothing changed or audited', async (id, body, detail) => {
    const before = await q('SELECT * FROM apps WHERE id = $1', [id]);
    const res = await put(id, body);
    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({ error: 'invalid_app', detail });
    expect(await q('SELECT * FROM apps WHERE id = $1', [id])).toEqual(before);
    expect(await audits()).toEqual([]);
  });

  it('404 app_not_found; an empty body or only kind/handoff (not editable) → 400', async () => {
    expect((await put('nope', { name: 'X' })).json()).toEqual({ error: 'app_not_found', detail: { id: 'nope' } });
    expect((await put('starlyn', {})).statusCode).toBe(400);
    expect((await put('starlyn', { kind: 'web' })).statusCode).toBe(400);
    expect((await put('starlyn', { handoff: 'user_id' })).statusCode).toBe(400);
    expect((await q("SELECT kind, handoff FROM apps WHERE id = 'starlyn'"))[0]).toEqual({ kind: 'app', handoff: 'claim' });
  });

  it('roles: admin and a router token edit; editor and support cannot', async () => {
    for (const role of ['editor', 'support']) {
      const p = await signIn(db.pool, `${role}@ikameglobal.com`, role);
      expect((await put('starlyn', { name: 'X' }, p.headers())).statusCode, role).toBe(403);
    }
    expect((await put('starlyn', { name: 'By CI' }, bearer(await tokenFor(db.pool, 'router')))).statusCode).toBe(200);
  });

  describe('webhooks list: before cursor, counts', () => {
    beforeEach(async () => {
      for (const [n, status] of [[1, 'delivered'], [2, 'dead'], [3, 'pending'], [4, 'dead']]) {
        await q(
          "INSERT INTO webhook_deliveries (event_id, app_id, app_user_id, type, payload, status) VALUES ($1, 'starlyn', 'u1', 'entitlement.updated', '{}', $2)",
          [ev(n), status],
        );
      }
      await q("INSERT INTO webhook_deliveries (event_id, app_id, app_user_id, type, payload) VALUES ($1, 'tarot-web', 'u9', 'link.created', '{}')", [ev(9)]);
    });
    const list = async (qs, headers = boss.headers(false)) => (await app.inject({ method: 'GET', url: `/v1/apps/starlyn/webhooks${qs}`, headers })).json();

    it('pages newest first with next_before; counts are per status for the whole app (whatever the filter)', async () => {
      const first = await list('?limit=2');
      expect(first.items.map((i) => i.event_id)).toEqual([ev(4), ev(3)]);
      expect(first.counts).toEqual({ pending: 1, delivered: 1, dead: 2 });
      const second = await list(`?limit=2&before=${first.next_before}`);
      expect(second.items.map((i) => i.event_id)).toEqual([ev(2), ev(1)]);
      const last = await list(`?limit=2&before=${second.next_before}`);
      expect(last).toEqual({ items: [], next_before: null, counts: { pending: 1, delivered: 1, dead: 2 } });
      const dead = await list('?status=dead&limit=1');
      expect(dead.items.map((i) => i.event_id)).toEqual([ev(4)]);
      expect((await list(`?status=dead&limit=1&before=${dead.next_before}`)).items.map((i) => i.event_id)).toEqual([ev(2)]);
      expect(dead.counts).toEqual({ pending: 1, delivered: 1, dead: 2 });
    });

    it('an editor reads it (apps:read)', async () => {
      const ed = await signIn(db.pool, 'ed@ikameglobal.com', 'editor');
      expect((await list('', ed.headers(false))).items).toHaveLength(4);
    });

    it('resend is audited (webhook.resend {app_id, event_id}); a 404 resend audits nothing', async () => {
      await q(`INSERT INTO customers (paddle_customer_id, ref) VALUES ('ctm_1', 'cus_01K75Z0000000000000000000B')`);
      await q(`UPDATE webhook_deliveries SET payload = '{"customer_ref":"cus_01K75Z0000000000000000000B"}'`);
      const resend = (e) => app.inject({ method: 'POST', url: `/v1/apps/starlyn/webhooks/${e}/resend`, headers: boss.headers() });
      expect((await resend(ev(2))).statusCode).toBe(200);
      expect((await resend(ev(77))).statusCode).toBe(404);
      expect(await audits()).toEqual([{
        actor: 'boss@ikameglobal.com', action: 'webhook.resend', target: 'app:starlyn', details: { app_id: 'starlyn', event_id: ev(2) },
      }]);
    });
  });
});
```

`packages/cli/test/app-update.test.js` (mới):

```js
import { describe, it, expect } from 'vitest';
import { run } from '../src/main.js';
import { createApi } from '../src/api.js';
import { io } from './helpers/io.js';

const appView = { id: 'starlyn', name: 'Starlyn 2', kind: 'app', handoff: 'claim', webhook_url: 'https://be2.example/hook', prev_key_expires_at: null };

// Spec admin-console-p2 §2 CLI: ikf app update <id> [--name …] [--webhook …] …
describe('ikf app update', () => {
  it('sends only the given fields and says which changed', async () => {
    const calls = [];
    const t = io({ updateApp: async (id, b) => { calls.push([id, b]); return { app: appView }; } });
    const argv = ['app', 'update', 'starlyn', '--name', 'Starlyn 2', '--webhook', 'https://be2.example/hook', '--bundle-ids', 'com.a, com.b', '--deeplink-path', 'open'];
    expect(await run(argv, t.opts)).toBe(0);
    expect(calls).toEqual([['starlyn', { name: 'Starlyn 2', webhook_url: 'https://be2.example/hook', deeplink_path: 'open', bundle_ids: ['com.a', 'com.b'] }]]);
    expect(t.lines).toEqual(['starlyn: đã cập nhật name, webhook_url, deeplink_path, bundle_ids.']);
  });

  it('web app fields: --return-url; app fields: --adjust, --scheme', async () => {
    const calls = [];
    const t = io({ updateApp: async (id, b) => { calls.push(b); return { app: appView }; } });
    await run(['app', 'update', 'tarot-web', '--return-url', 'https://tarot.example/hi'], t.opts);
    await run(['app', 'update', 'starlyn', '--adjust', 'https://app.adjust.com/new', '--scheme', 'starlyn2'], t.opts);
    expect(calls).toEqual([{ return_url: 'https://tarot.example/hi' }, { adjust_tracker_url: 'https://app.adjust.com/new', deeplink_scheme: 'starlyn2' }]);
  });

  it.each([
    [['app', 'update', 'starlyn'], 'cần ít nhất một: --name, --webhook, --adjust, --scheme, --return-url, --deeplink-path, --bundle-ids'],
    [['app', 'update', 'starlyn', '--kind', 'web'], 'không đổi được --kind hay --handoff của app'],
    [['app', 'update', 'starlyn', '--deeplink-path', 'a/b'], '--deeplink-path không hợp lệ: "a/b" (a-z, 0-9, _ hoặc -, tối đa 32 ký tự)'],
  ])('exits 2 on bad usage %j', async (argv, msg) => {
    const t = io({ updateApp: async () => { throw new Error('must not be called'); } });
    expect(await run(argv, t.opts)).toBe(2);
    expect(t.errors).toEqual([msg]);
  });

  it('api: PUT /v1/apps/:id, retried (the same change twice gives the same result)', async () => {
    const seen = [];
    let n = 0;
    const fetch = async (url, init) => {
      seen.push([init.method, url, init.body]);
      return n++ === 0 ? new Response('{}', { status: 503 }) : new Response(JSON.stringify({ app: appView }), { status: 200 });
    };
    const api = createApi({ api: 'https://api.x', token: 't' }, { fetch, sleep: async () => {} });
    expect(await api.updateApp('starlyn', { name: 'S' })).toEqual({ app: appView });
    expect(seen).toEqual([['PUT', 'https://api.x/v1/apps/starlyn', '{"name":"S"}'], ['PUT', 'https://api.x/v1/apps/starlyn', '{"name":"S"}']]);
  });
});
```

`services/core-api/test/reconcile.test.js` (sửa, áp dụng đúng diff này — chỉ thêm cuối file):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/test/reconcile.test.js b/services/core-api/test/reconcile.test.js
index 64d0fbe..1b8ea92 100644
--- a/services/core-api/test/reconcile.test.js
+++ b/services/core-api/test/reconcile.test.js
@@ -105,3 +105,25 @@ describe('billing reconcile + outbox listing', () => {
     expect((await get('', await tokenFor(db.pool, 'publisher'))).statusCode).toBe(403);
   });
 });
+
+describe('reconcile audit (spec admin-console-p2 §1)', () => {
+  let db;
+  beforeAll(async () => {
+    db = await startDb();
+  });
+  afterAll(() => db.stop());
+
+  it('billing.reconcile {since_seconds, enqueued} is written after it finishes; a failed run writes nothing', async () => {
+    await resetDb(db.pool);
+    const paddle = fakePaddle();
+    paddle.transaction(paddleTxn({ id: 'txn_c', status: 'paid', updated_at: '2026-10-09T11:45:00Z' }));
+    const { app } = await makeApp(db.pool, { paddle, queue: fakeQueue(), now: () => NOW });
+    const headers = bearer(await tokenFor(db.pool, 'admin'));
+    expect((await app.inject({ method: 'POST', url: '/v1/billing/reconcile', headers, payload: { since_seconds: 3600 } })).json()).toMatchObject({ enqueued: 1 });
+    paddle.fail('unavailable');
+    expect((await app.inject({ method: 'POST', url: '/v1/billing/reconcile', headers, payload: { since_seconds: 7200 } })).statusCode).toBe(503);
+    await app.close();
+    const { rows } = await db.pool.query("SELECT actor, action, target, details FROM audit_log WHERE action = 'billing.reconcile'");
+    expect(rows).toEqual([{ actor: 'admin', action: 'billing.reconcile', target: 'billing', details: { since_seconds: 3600, enqueued: 1 } }]);
+  });
+});
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/apps-p2.test.js test/reconcile.test.js 2>&1 | grep -E "Tests  "
npm test -w @ikf/cli -- test/app-update.test.js 2>&1 | grep -E "Tests  "
```

Expected: core — `PUT` (404 route), 7 dòng `→ 400 invalid_app`, `404 app_not_found …`, `roles …`, `pages newest first …`, `resend is audited …`, `billing.reconcile …` FAIL; `Tests  13 failed | 6 passed (19)` (`an editor reads it (apps:read)` đã pass từ Task 2). CLI `Tests  6 failed (6)`.

- [ ] **Step 3: Implement**

`services/core-api/src/{identity/apps.js, identity/webhooks.js, http/apps.js, http/billing.js}` và `packages/cli/src/{main,api}.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/packages/cli/src/api.js b/packages/cli/src/api.js
index f259a9e..d91e755 100644
--- a/packages/cli/src/api.js
+++ b/packages/cli/src/api.js
@@ -65,6 +65,8 @@ export function createApi({ api, token }, { fetch: doFetch = fetch, retries = 3,
     // Not retried: a lost reply would leave an app whose key and secret nobody saw (create again → 409).
     createApp: (body) => call('POST', '/v1/apps', { body, retry: false }),
     listApps: () => call('GET', '/v1/apps', { retry: true }),
+    // Idempotent: the same change twice gives the same result.
+    updateApp: (id, body) => call('PUT', `/v1/apps/${id}`, { body, retry: true }),
     // Not retried: a second rotation would revoke the key the first one returned. force: rotate even while
     // the previous key is still in its 24h window (the server answers 409 key_rotation_pending otherwise).
     rotateKey: (id, { force = false } = {}) =>
diff --git a/packages/cli/src/main.js b/packages/cli/src/main.js
index 8a4a538..4136ce6 100755
--- a/packages/cli/src/main.js
+++ b/packages/cli/src/main.js
@@ -25,6 +25,7 @@ const USAGE = `Cách dùng:
   ikf app create <id> --name <tên> --kind app --adjust <url> --scheme <scheme> --webhook <url> --handoff user_id|claim [--deeplink-path open] [--bundle-ids a,b]
       (handoff user_id: app dùng IKameSDK, deep link mang user_id; claim: app có backend riêng, claim token + webhook)
   ikf app create <id> --name <tên> --kind web --return-url <url> --webhook <url>
+  ikf app update <id> [--name <tên>] [--webhook <url>] [--adjust <url>] [--scheme <scheme>] [--return-url <url>] [--deeplink-path <p>] [--bundle-ids a,b]
   ikf app ls
   ikf app rotate-key <id> [--force]   (--force: cả khi key trước còn trong 24h, key đó bị khoá ngay)
   ikf app webhooks <id> [--dead] [--resend <event_id>]
@@ -136,8 +137,9 @@ async function appCommand(api, sub, args, values, out) {
     for (const a of apps) out(`${a.id.padEnd(20)} ${a.kind.padEnd(4)} ${(a.handoff ?? '-').padEnd(7)} ${a.name.padEnd(24)} ${a.webhook_url ?? '-'}`);
     return 0;
   }
-  if (!['create', 'rotate-key', 'webhooks'].includes(sub) || !id) throw new UsageError(USAGE);
+  if (!['create', 'update', 'rotate-key', 'webhooks'].includes(sub) || !id) throw new UsageError(USAGE);
   if (!APP_ID_RE.test(id)) throw new UsageError(`app id không hợp lệ: "${id}"`);
+  if (sub === 'update') return appUpdate(api, id, values, out);
   if (sub === 'create') {
     if (!values.name || !values.webhook || !['app', 'web'].includes(values.kind)) {
       throw new UsageError('cần --name, --kind app|web và --webhook <url>');
@@ -228,6 +230,28 @@ async function revokeCommand(api, args, out) {
   return 0;
 }
 
+// ikf app update: flag → field of PUT /v1/apps/:id (spec admin-console-p2 §2), in this order.
+const APP_UPDATE_FLAGS = [
+  ['name', 'name'], ['webhook', 'webhook_url'], ['adjust', 'adjust_tracker_url'], ['scheme', 'deeplink_scheme'],
+  ['return-url', 'return_url'], ['deeplink-path', 'deeplink_path'], ['bundle-ids', 'bundle_ids'],
+];
+
+async function appUpdate(api, id, values, out) {
+  if (values.kind !== undefined || values.handoff !== undefined) throw new UsageError('không đổi được --kind hay --handoff của app');
+  const body = {};
+  for (const [flag, field] of APP_UPDATE_FLAGS) {
+    if (values[flag] === undefined) continue;
+    body[field] = field === 'bundle_ids' ? values[flag].split(',').map((b) => b.trim()).filter(Boolean) : values[flag];
+  }
+  if (!Object.keys(body).length) throw new UsageError(`cần ít nhất một: ${APP_UPDATE_FLAGS.map(([f]) => `--${f}`).join(', ')}`);
+  if (body.deeplink_path !== undefined && !DEEPLINK_PATH_RE.test(body.deeplink_path)) {
+    throw new UsageError(`--deeplink-path không hợp lệ: "${body.deeplink_path}" (a-z, 0-9, _ hoặc -, tối đa 32 ký tự)`);
+  }
+  const r = await api.updateApp(id, body);
+  out(`${r.app.id}: đã cập nhật ${Object.keys(body).join(', ')}.`);
+  return 0;
+}
+
 async function customerCommand(api, sub, args, values, out) {
   if (sub === 'grant') return grantCommand(api, args, values, out);
   if (sub === 'revoke') return revokeCommand(api, args, out);
diff --git a/services/core-api/src/http/apps.js b/services/core-api/src/http/apps.js
index a264c2c..7eeb8f1 100644
--- a/services/core-api/src/http/apps.js
+++ b/services/core-api/src/http/apps.js
@@ -1,7 +1,7 @@
 import { audit } from '../audit.js';
 import { requireRole } from '../auth.js';
 import { HttpError } from '../errors.js';
-import { createApp, listApps, rotateKey } from '../identity/apps.js';
+import { createApp, listApps, rotateKey, updateApp } from '../identity/apps.js';
 import { listDeliveries, resendDelivery } from '../identity/webhooks.js';
 
 const url = { type: 'string', minLength: 1, maxLength: 500 };
@@ -47,6 +47,32 @@ export default async function appsHttp(app, { pool, webhookSecrets }) {
     },
   );
 
+  // Edit an app (spec admin-console-p2 §2): never its id, kind or handoff.
+  app.put(
+    '/v1/apps/:id',
+    {
+      onRequest: router,
+      schema: {
+        params: idParams,
+        body: {
+          type: 'object',
+          additionalProperties: false,
+          minProperties: 1,
+          properties: {
+            name: { type: 'string', minLength: 1, maxLength: 80 },
+            webhook_url: url,
+            adjust_tracker_url: url,
+            deeplink_scheme: { type: 'string', maxLength: 31 },
+            return_url: url,
+            deeplink_path: { type: 'string', maxLength: 64 },
+            bundle_ids: { type: 'array', maxItems: 20, items: { type: 'string', maxLength: 200 } },
+          },
+        },
+      },
+    },
+    async (req) => updateApp(pool, req.params.id, req.body, req.actor),
+  );
+
   // Any signed-in person picks an app for a funnel from this list (spec admin-console-p1 §3).
   app.get('/v1/apps', { onRequest: requireRole(pool, 'viewer') }, async () => listApps(pool));
 
@@ -76,11 +102,12 @@ export default async function appsHttp(app, { pool, webhookSecrets }) {
           properties: {
             status: { type: 'string', enum: ['pending', 'delivered', 'dead'] },
             limit: { type: 'integer', minimum: 1, maximum: 200, default: 50 },
+            before: { type: 'integer', minimum: 1 },
           },
         },
       },
     },
-    async (req) => listDeliveries(pool, { appId: req.params.id, status: req.query.status ?? null, limit: req.query.limit }),
+    async (req) => listDeliveries(pool, { appId: req.params.id, status: req.query.status ?? null, limit: req.query.limit, before: req.query.before ?? null }),
   );
 
   app.post(
@@ -96,7 +123,7 @@ export default async function appsHttp(app, { pool, webhookSecrets }) {
       },
     },
     async (req) => {
-      const out = await resendDelivery(pool, { appId: req.params.id, eventId: req.params.event_id });
+      const out = await resendDelivery(pool, { appId: req.params.id, eventId: req.params.event_id, actor: req.actor });
       if (!out) throw new HttpError(404, 'delivery_not_found');
       return out;
     },
diff --git a/services/core-api/src/http/billing.js b/services/core-api/src/http/billing.js
index 7d772aa..c496ef5 100644
--- a/services/core-api/src/http/billing.js
+++ b/services/core-api/src/http/billing.js
@@ -1,3 +1,4 @@
+import { audit } from '../audit.js';
 import { requireRole } from '../auth.js';
 import { paddleHttpError } from '../billing/errors.js';
 import { listOutbox, reconcile } from '../billing/reconcile.js';
@@ -36,6 +37,8 @@ export default async function billingHttp(app, { pool, paddle, queue, alarm, now
       try {
         const r = await reconcile({ pool, paddle, queue: guardedQueue, since });
         req.log.info(r, 'billing_reconcile');
+        // After it finished (spec admin-console-p2 §1): what was asked and how much it queued.
+        await audit(pool, req.actor, 'billing.reconcile', 'billing', { since_seconds: req.body.since_seconds, enqueued: r.enqueued });
         return r;
       } catch (err) {
         throw await paddleHttpError(err, { log: req.log, alarm });
diff --git a/services/core-api/src/identity/apps.js b/services/core-api/src/identity/apps.js
index a1353e7..3c16987 100644
--- a/services/core-api/src/identity/apps.js
+++ b/services/core-api/src/identity/apps.js
@@ -118,6 +118,29 @@ export async function appForKey(db, key) {
   return rows[0] ?? null;
 }
 
+// What PUT /v1/apps/:id may change (spec admin-console-p2 §2); never id, kind or handoff. Fields of the other
+// kind (return_url on an app, Adjust/deep-link fields on a web app) are refused with reason 'kind'.
+export const EDITABLE = ['name', 'webhook_url', 'adjust_tracker_url', 'deeplink_scheme', 'return_url', 'deeplink_path', 'bundle_ids'];
+const APP_ONLY = ['adjust_tracker_url', 'deeplink_scheme', 'deeplink_path'];
+
+export async function updateApp(pool, id, fields, actor) {
+  const names = Object.keys(fields).filter((f) => EDITABLE.includes(f)).sort();
+  // Fastify drops unknown properties (kind, handoff, id) before this point: nothing left = nothing to change.
+  if (!names.length) throw new HttpError(400, 'no_fields', { editable: EDITABLE });
+  return withTx(pool, async (c) => {
+    const { rows } = await c.query(`SELECT ${COLUMNS} FROM apps WHERE id = $1 FOR UPDATE`, [id]);
+    if (!rows.length) throw new HttpError(404, 'app_not_found', { id });
+    const cur = rows[0];
+    const wrongKind = names.filter((f) => (cur.kind === 'app' ? f === 'return_url' : APP_ONLY.includes(f)));
+    if (wrongKind.length) throw new HttpError(400, 'invalid_app', wrongKind.map((field) => ({ field, reason: 'kind' })));
+    checkApp({ ...cur, ...fields });
+    const sets = names.map((f, i) => `${f} = $${i + 2}`).join(', ');
+    const updated = await c.query(`UPDATE apps SET ${sets} WHERE id = $1 RETURNING ${COLUMNS}`, [id, ...names.map((f) => fields[f])]);
+    await audit(c, actor, 'app.update', `app:${id}`, { id, fields: names });
+    return { app: appView(updated.rows[0]) };
+  });
+}
+
 // onRequest hook for the app-backend API: Bearer <app api key> → req.caller = app row, else 401.
 export function requireApp(pool) {
   return async (req, reply) => {
diff --git a/services/core-api/src/identity/webhooks.js b/services/core-api/src/identity/webhooks.js
index da432e8..bb4c2fe 100644
--- a/services/core-api/src/identity/webhooks.js
+++ b/services/core-api/src/identity/webhooks.js
@@ -1,4 +1,5 @@
 import { createHmac } from 'node:crypto';
+import { audit } from '../audit.js';
 import { addDelivery, customerRef, entitlementsOf, lockCustomer } from './entitlements.js';
 import { withTx } from './link.js';
 import { safeEqual } from './tokens.js';
@@ -150,12 +151,18 @@ const item = (r) => ({
 });
 const ITEM_COLUMNS = 'event_id, type, app_user_id, status, attempts, next_attempt_at, last_error, created_at, delivered_at';
 
-export async function listDeliveries(db, { appId, status = null, limit = 50 }) {
+// Newest first; before = next_before of the previous page. counts: every delivery of the app by status.
+export async function listDeliveries(db, { appId, status = null, limit = 50, before = null }) {
   const { rows } = await db.query(
-    `SELECT ${ITEM_COLUMNS} FROM webhook_deliveries WHERE app_id = $1 AND ($2::text IS NULL OR status = $2) ORDER BY id DESC LIMIT $3`,
-    [appId, status, limit],
+    `SELECT id, ${ITEM_COLUMNS} FROM webhook_deliveries
+      WHERE app_id = $1 AND ($2::text IS NULL OR status = $2) AND ($4::bigint IS NULL OR id < $4)
+      ORDER BY id DESC LIMIT $3`,
+    [appId, status, limit, before],
   );
-  return { items: rows.map(item) };
+  const counts = { pending: 0, delivered: 0, dead: 0 };
+  const byStatus = await db.query('SELECT status, count(*)::int AS n FROM webhook_deliveries WHERE app_id = $1 GROUP BY status', [appId]);
+  for (const r of byStatus.rows) counts[r.status] = r.n;
+  return { items: rows.map(item), next_before: rows.length === limit ? Number(rows.at(-1).id) : null, counts };
 }
 
 // `ikf app webhooks <app> --resend <event_id>`: never revives the old row (its payload may be stale and
@@ -163,7 +170,8 @@ export async function listDeliveries(db, { appId, status = null, limit = 50 }) {
 // carrying the user's CURRENT state: active link → entitlement.updated with the full app state, else
 // link.revoked []. The customer is the active link's (current truth), falling back to the stored
 // payload's customer_ref (customers.ref, stable) when the link is gone. The old row stays as is.
-export async function resendDelivery(pool, { appId, eventId }) {
+// actor (HTTP): webhook.resend is audited in the same transaction (spec admin-console-p2 §1).
+export async function resendDelivery(pool, { appId, eventId, actor = null }) {
   return withTx(pool, async (c) => {
     const { rows: [old] } = await c.query(
       'SELECT event_id, app_user_id, payload FROM webhook_deliveries WHERE app_id = $1 AND event_id = $2',
@@ -195,6 +203,7 @@ export async function resendDelivery(pool, { appId, eventId }) {
       customerRef: ref,
       entitlements: linked ? await entitlementsOf(c, subject, appId) : [],
     });
+    if (actor) await audit(c, actor, 'webhook.resend', `app:${appId}`, { app_id: appId, event_id: eventId });
     const { rows: [row] } = await c.query(`SELECT ${ITEM_COLUMNS} FROM webhook_deliveries WHERE event_id = $1`, [newId]);
     return { ...item(row), resent_from: eventId };
   });
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/apps-p2.test.js test/reconcile.test.js test/webhooks.test.js test/apps.test.js 2>&1 | grep -E "Tests  "
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
npm test -w @ikf/cli 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  42 passed (42)` (test cũ `webhooks.test.js` gọi `resendDelivery` không actor: không đổi); core-api `52 passed (52)` / `485 passed (485)`; cli `14` / `148`.

- [ ] **Step 5: Commit**

```bash
git add services/core-api packages/cli
git commit -m "feat: PUT /v1/apps/:id (audited), webhooks list cursor + counts, webhook.resend and billing.reconcile audited; ikf app update"
```

---

### Task 10: SPA Funnel detail → tab **Giá**

**Files:**
- Create: `apps/admin/src/components/PricesTab.jsx`
- Modify: `apps/admin/src/{api.js, format.js, pages/FunnelDetail.jsx, styles.css}`
- Test: `apps/admin/test/prices-tab.test.jsx` (mới); Modify: `apps/admin/test/helpers.jsx`

**Interfaces:**
- Consumes: `GET/PUT /v1/funnels/:slug/prices` (Task 8: `plans`, `plan_keys`, `unmapped`; 422 `detail: [{code, plan, reason, …}]`), `GET /v1/paddle/prices` (Task 7); `useAuth`, `can`, `RoleButton`, `ErrorNote`.
- Produces: client `getPrices(slug)`, `setPrices(slug, plans)`, `listPaddlePrices()`; `format.js` `fmtMoney(minor, currency)`, `fmtInterval(interval)`, `priceLabel(price)` ("Starlyn premium · Weekly — 13.67 USD/tuần", " (một lần)", " (archived)"). `PricesTab({slug})`: hàng `data-testid="price-row"`, nhãn `Chọn giá cho <plan>`, `pri_… của <plan>`, `Discount của <plan>`, `Entitlement key của <plan>`, nút `Gỡ`/`Bỏ gỡ`, `Lưu giá` (admin), `data-testid="row-error"`, badge `Chưa có giá` / `Không dùng` / `Giá đã lưu trữ`, ô lọc `Lọc giá (tên, sản phẩm, pri_…)`. FunnelDetail: `role="tablist"` `Tổng quan` / `Giá` khi có `prices:read`. Fake client thêm `getPrices`, `setPrices`, `listPaddlePrices`.

- [ ] **Step 1: Viết test fail**

`apps/admin/test/prices-tab.test.jsx` (mới):

```jsx
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { ApiError } from '../src/api.js';
import { fakeClient, renderApp, ME } from './helpers.jsx';

const pri = (c) => `pri_01${c.repeat(24)}`;
const DETAIL = { slug: 'witch-power', pixel_id: null, app_id: 'starlyn', versions: [], live: [] };
const CATALOG = {
  prices: [
    { id: pri('a'), name: 'Weekly', product_name: 'Starlyn premium', amount_minor: 1367, currency: 'USD', interval: { unit: 'week', frequency: 1 }, status: 'active' },
    { id: pri('b'), name: 'Tarot reading 2027', product_name: 'Starlyn add-on', amount_minor: 1999, currency: 'USD', interval: null, status: 'active' },
    { id: pri('c'), name: 'Yearly', product_name: 'Starlyn premium', amount_minor: 9999, currency: 'USD', interval: { unit: 'year', frequency: 1 }, status: 'active' },
    { id: pri('o'), name: 'Weekly (old)', product_name: 'Starlyn premium', amount_minor: 999, currency: 'USD', interval: { unit: 'week', frequency: 1 }, status: 'archived' },
  ],
};
const mapped = (price, key = 'premium', kind = 'recurring') => ({ price_id: price, discount_id: null, kind, entitlement_key: key, updated_by: 'ci', updated_at: '2026-10-10T08:00:00.000Z' });
// HTML sells 1w, addon, m12; prices exist for 1w (an archived price) and for "old" (no longer in the HTML).
const PRICES = { funnel: 'witch-power', plans: { '1w': mapped(pri('o')), old: mapped(pri('a')) }, plan_keys: ['1w', 'addon', 'm12'], unmapped: ['addon', 'm12'] };

function setup(me = ME.admin, overrides = {}) {
  const client = fakeClient(me, {
    getFunnel: vi.fn(async () => DETAIL),
    getPrices: vi.fn(async () => PRICES),
    listPaddlePrices: vi.fn(async () => CATALOG),
    setPrices: vi.fn(async () => PRICES),
    ...overrides,
  });
  renderApp(client, '/funnels/witch-power');
  return client;
}
const openTab = async () => {
  fireEvent.click(await screen.findByRole('tab', { name: 'Giá' }));
  return screen.findAllByTestId('price-row');
};
const row = (rows, plan) => rows.find((r) => r.firstChild.textContent.startsWith(plan));

// Spec admin-console-p2 §3: Funnel detail → tab Giá.
describe('Funnel detail → Giá', () => {
  it('editors and admins see the tab; viewers and support do not', async () => {
    for (const me of [ME.viewer, ME.support]) {
      const { unmount } = renderApp(fakeClient(me, { getFunnel: vi.fn(async () => DETAIL) }), '/funnels/witch-power');
      await screen.findByRole('heading', { name: 'witch-power' });
      expect(screen.queryByRole('tab', { name: 'Giá' })).toBeNull();
      unmount();
    }
    setup(ME.editor);
    expect(await screen.findByRole('tab', { name: 'Giá' })).toBeTruthy();
  });

  it('one row per plan in the HTML or with a price; badges Chưa có giá / Không dùng / Giá đã lưu trữ; catalog labels', async () => {
    setup();
    const rows = await openTab();
    expect(rows.map((r) => r.firstChild.textContent)).toEqual(['1wGiá đã lưu trữ', 'addonChưa có giá', 'm12Chưa có giá', 'oldKhông dùng']);
    const pick = within(row(rows, 'addon')).getByLabelText('Chọn giá cho addon');
    expect([...pick.options].map((o) => o.textContent)).toEqual([
      '— chọn từ Paddle —',
      'Starlyn premium · Weekly — 13.67 USD/tuần',
      'Starlyn add-on · Tarot reading 2027 — 19.99 USD (một lần)',
      'Starlyn premium · Yearly — 99.99 USD/năm',
    ]);
    const archived = within(row(rows, '1w')).getByLabelText('Chọn giá cho 1w');
    expect(archived.value).toBe(pri('o'));
    expect(archived.selectedOptions[0].textContent).toBe('Starlyn premium · Weekly (old) — 9.99 USD/tuần (archived)');
    expect(within(row(rows, 'addon')).getByLabelText('Entitlement key của addon').value).toBe('premium');
  });

  it('the filter narrows the dropdowns; Lưu sends ONE PUT with only what changed (a pick, a pasted pri_…, a removal)', async () => {
    const client = setup();
    const rows = await openTab();
    fireEvent.change(screen.getByPlaceholderText('Lọc giá (tên, sản phẩm, pri_…)'), { target: { value: 'tarot' } });
    const pick = within(row(rows, 'addon')).getByLabelText('Chọn giá cho addon');
    expect([...pick.options].map((o) => o.value)).toEqual(['', pri('b')]);
    fireEvent.change(pick, { target: { value: pri('b') } });
    fireEvent.change(within(row(rows, 'addon')).getByLabelText('Entitlement key của addon'), { target: { value: 'tarot_2027' } });
    fireEvent.change(within(row(rows, 'm12')).getByLabelText('pri_… của m12'), { target: { value: ` ${pri('z')} ` } });
    fireEvent.click(within(row(rows, 'old')).getByRole('button', { name: 'Gỡ' }));
    fireEvent.click(screen.getByRole('button', { name: 'Lưu giá' }));
    await waitFor(() => expect(client.setPrices).toHaveBeenCalledTimes(1));
    expect(client.setPrices).toHaveBeenCalledWith('witch-power', {
      addon: { price_id: pri('b'), discount_id: null, entitlement_key: 'tarot_2027' },
      m12: { price_id: pri('z'), discount_id: null, entitlement_key: 'premium' },
      old: null,
    });
    expect(await screen.findByText('Đã lưu giá.')).toBeTruthy();
    expect(client.getPrices).toHaveBeenCalledTimes(2);
  });

  // Review Focus 4: a price archived after it was mapped. Saving other rows must not resend it (Paddle would refuse it).
  it('an archived mapped price is not resent when other rows change; nothing changed → no PUT', async () => {
    const client = setup();
    const rows = await openTab();
    fireEvent.click(screen.getByRole('button', { name: 'Lưu giá' }));
    expect(await screen.findByText('Không có gì thay đổi.')).toBeTruthy();
    expect(client.setPrices).not.toHaveBeenCalled();
    fireEvent.change(within(row(rows, 'addon')).getByLabelText('Chọn giá cho addon'), { target: { value: pri('b') } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu giá' }));
    await waitFor(() => expect(client.setPrices).toHaveBeenCalledWith('witch-power', { addon: { price_id: pri('b'), discount_id: null, entitlement_key: 'premium' } }));
  });

  it('422: each problem is shown on its row; nothing else changes', async () => {
    setup(ME.admin, {
      setPrices: vi.fn(async () => {
        throw new ApiError(422, { error: 'invalid_price', detail: [{ code: 'invalid_price', plan: 'm12', price_id: pri('z'), reason: 'not_found' }, { code: 'invalid_discount', plan: 'm12', discount_id: 'dsc_x', reason: 'malformed' }] });
      }),
    });
    const rows = await openTab();
    fireEvent.change(within(row(rows, 'm12')).getByLabelText('pri_… của m12'), { target: { value: pri('z') } });
    fireEvent.change(within(row(rows, 'm12')).getByLabelText('Discount của m12'), { target: { value: 'dsc_x' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu giá' }));
    expect((await within(row(rows, 'm12')).findByTestId('row-error')).textContent).toBe('invalid_price: not_found; invalid_discount: malformed');
    expect(within(row(rows, 'addon')).queryByTestId('row-error')).toBeNull();
  });

  it('no plan keys yet (version from before): rows from the saved prices only, and "Upload lại để đọc plan"', async () => {
    setup(ME.admin, { getPrices: vi.fn(async () => ({ ...PRICES, plan_keys: null, unmapped: [] })) });
    const rows = await openTab();
    expect(rows.map((r) => r.firstChild.textContent)).toEqual(['1wGiá đã lưu trữ', 'old']);
    expect(screen.getByText('Bản mới nhất chưa có danh sách plan: upload lại demo.html để đọc plan.')).toBeTruthy();
  });

  it('Paddle down: says so, pasting a pri_… still works', async () => {
    const client = setup(ME.admin, { listPaddlePrices: vi.fn(async () => { throw new ApiError(503, { error: 'paddle_unavailable' }); }) });
    const rows = await openTab();
    expect(await screen.findByText('Không tải được danh sách giá Paddle (paddle_unavailable): dán pri_… trực tiếp.')).toBeTruthy();
    fireEvent.change(within(row(rows, 'addon')).getByLabelText('pri_… của addon'), { target: { value: pri('b') } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu giá' }));
    await waitFor(() => expect(client.setPrices).toHaveBeenCalledWith('witch-power', { addon: { price_id: pri('b'), discount_id: null, entitlement_key: 'premium' } }));
  });

  it('an editor reads but cannot save (Cần quyền admin), inputs locked', async () => {
    setup(ME.editor);
    const rows = await openTab();
    const save = screen.getByRole('button', { name: 'Lưu giá' });
    expect(save.disabled).toBe(true);
    expect(save.title).toBe('Cần quyền admin');
    expect(within(row(rows, 'addon')).getByLabelText('Chọn giá cho addon').disabled).toBe(true);
  });
});
```

`apps/admin/test/helpers.jsx` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/test/helpers.jsx b/apps/admin/test/helpers.jsx
index 694e38d..eabcce2 100644
--- a/apps/admin/test/helpers.jsx
+++ b/apps/admin/test/helpers.jsx
@@ -36,6 +36,9 @@ export function fakeClient(me = ME.admin, overrides = {}) {
     listUsers: vi.fn(async () => ({ users: [] })),
     createUser: vi.fn(),
     updateUser: vi.fn(),
+    getPrices: vi.fn(async (slug) => ({ funnel: slug, plans: {}, plan_keys: null, unmapped: [] })),
+    setPrices: vi.fn(),
+    listPaddlePrices: vi.fn(async () => ({ prices: [] })),
     ...overrides,
   };
   return client;
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/admin -- test/prices-tab.test.jsx 2>&1 | grep -E "Tests  "
```

Expected: `Tests  8 failed (8)` (không có tab `Giá`: `findByRole` hết giờ).

- [ ] **Step 3: Implement**

`apps/admin/src/components/PricesTab.jsx` (mới):

```jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth.jsx';
import { can } from '../roles.js';
import { priceLabel } from '../format.js';
import { ErrorNote } from './ErrorNote.jsx';
import { RoleButton } from './RoleButton.jsx';

const DEFAULT_KEY = 'premium';

// Rows: the HTML's plans (plan_keys), then plans that only have a saved price. Each row edits a copy of its price.
function rowsOf({ plans, plan_keys: keys }) {
  const names = [...(keys ?? []), ...Object.keys(plans).filter((k) => !(keys ?? []).includes(k)).sort()];
  return names.map((plan) => {
    const saved = plans[plan];
    return {
      plan,
      price: saved?.price_id ?? '',
      discount: saved?.discount_id ?? '',
      key: saved?.entitlement_key ?? DEFAULT_KEY,
      removed: false,
    };
  });
}

// What changed, as PUT /v1/funnels/:slug/prices wants it: a picked/pasted price (new or different), null to
// remove. Untouched rows are not sent (an archived price stays as it is: Paddle would refuse it again).
function changes(rows, plans) {
  const out = {};
  for (const r of rows) {
    const saved = plans[r.plan];
    if (r.removed) {
      if (saved) out[r.plan] = null;
      continue;
    }
    const price = r.price.trim();
    if (!price) continue;
    const discount = r.discount.trim() || null;
    const key = r.key.trim() || DEFAULT_KEY;
    if (saved && saved.price_id === price && (saved.discount_id ?? null) === discount && saved.entitlement_key === key) continue;
    out[r.plan] = { price_id: price, discount_id: discount, entitlement_key: key };
  }
  return out;
}

// Funnel detail → Giá (spec admin-console-p2 §3): the HTML's plans against the saved Paddle prices; prices:read
// reads, admin saves in one PUT; a 422 shows on the row it is about.
export function PricesTab({ slug }) {
  const { client, me } = useAuth();
  const isAdmin = can(me.role, 'admin');
  const [data, setData] = useState(null);
  const [rows, setRows] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [catalogError, setCatalogError] = useState(null);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState(null);
  const [rowErrors, setRowErrors] = useState({});
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    try {
      const r = await client.getPrices(slug);
      setData(r);
      setRows(rowsOf(r));
    } catch (err) {
      setError(err);
    }
  }, [client, slug]);
  useEffect(() => {
    load();
    client.listPaddlePrices().then((r) => setCatalog(r.prices), setCatalogError);
  }, [client, load]);

  const byId = useMemo(() => new Map(catalog.map((p) => [p.id, p])), [catalog]);
  const shown = useMemo(() => {
    const f = filter.trim().toLowerCase();
    return catalog.filter((p) => p.status === 'active' && (!f || `${p.id} ${p.name} ${p.product_name ?? ''}`.toLowerCase().includes(f)));
  }, [catalog, filter]);

  if (!data) return error ? <ErrorNote error={error} /> : <p className="muted">Đang tải…</p>;
  const set = (plan, patch) => setRows((rs) => rs.map((r) => (r.plan === plan ? { ...r, ...patch } : r)));
  const keys = data.plan_keys;

  const save = async () => {
    setError(null);
    setRowErrors({});
    setNotice('');
    const plans = changes(rows, data.plans);
    if (!Object.keys(plans).length) {
      setNotice('Không có gì thay đổi.');
      return;
    }
    try {
      await client.setPrices(slug, plans);
      setNotice('Đã lưu giá.');
      await load();
    } catch (err) {
      if (err.status === 422 && Array.isArray(err.detail)) {
        const byPlan = {};
        for (const p of err.detail) byPlan[p.plan] = [...(byPlan[p.plan] ?? []), `${p.code}: ${p.reason}`];
        setRowErrors(byPlan);
      } else setError(err);
    }
  };

  return (
    <div className="card">
      <h2>Giá</h2>
      {keys === null && <p className="warn">Bản mới nhất chưa có danh sách plan: upload lại demo.html để đọc plan.</p>}
      {catalogError && <p className="warn">Không tải được danh sách giá Paddle ({catalogError.code}): dán pri_… trực tiếp.</p>}
      <input placeholder="Lọc giá (tên, sản phẩm, pri_…)" value={filter} onChange={(e) => setFilter(e.target.value)} />
      <table>
        <thead>
          <tr><th>Plan</th><th>Paddle price</th><th>Discount</th><th>Entitlement key</th><th /><th /></tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const saved = data.plans[r.plan];
            const current = byId.get(r.price);
            const options = current && !shown.includes(current) ? [...shown, current] : shown;
            return (
              <tr key={r.plan} data-testid="price-row" className={r.removed ? 'muted' : undefined}>
                <td>
                  {r.plan}
                  {keys && !keys.includes(r.plan) && <span className="badge warn">Không dùng</span>}
                  {keys && keys.includes(r.plan) && !saved && <span className="badge warn">Chưa có giá</span>}
                  {saved && byId.get(saved.price_id) && byId.get(saved.price_id).status !== 'active' && <span className="badge error">Giá đã lưu trữ</span>}
                </td>
                <td>
                  <select aria-label={`Chọn giá cho ${r.plan}`} value={current ? r.price : ''} disabled={!isAdmin} onChange={(e) => set(r.plan, { price: e.target.value })}>
                    <option value="">— chọn từ Paddle —</option>
                    {options.map((p) => <option key={p.id} value={p.id}>{priceLabel(p)}</option>)}
                  </select>
                  <input aria-label={`pri_… của ${r.plan}`} placeholder="pri_…" value={r.price} disabled={!isAdmin} onChange={(e) => set(r.plan, { price: e.target.value })} />
                </td>
                <td><input aria-label={`Discount của ${r.plan}`} placeholder="dsc_… (không bắt buộc)" value={r.discount} disabled={!isAdmin} onChange={(e) => set(r.plan, { discount: e.target.value })} /></td>
                <td><input aria-label={`Entitlement key của ${r.plan}`} value={r.key} disabled={!isAdmin} onChange={(e) => set(r.plan, { key: e.target.value })} /></td>
                <td>{saved && <button type="button" disabled={!isAdmin} onClick={() => set(r.plan, { removed: !r.removed })}>{r.removed ? 'Bỏ gỡ' : 'Gỡ'}</button>}</td>
                <td>{rowErrors[r.plan] && <span className="error" data-testid="row-error">{rowErrors[r.plan].join('; ')}</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="row">
        <RoleButton need="admin" className="primary" onClick={save}>Lưu giá</RoleButton>
        {notice && <span className="ok">{notice}</span>}
      </div>
      <ErrorNote error={error} />
    </div>
  );
}
```

`apps/admin/src/{api.js, format.js, pages/FunnelDetail.jsx, styles.css}` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/src/api.js b/apps/admin/src/api.js
index ef9507e..19ddd03 100644
--- a/apps/admin/src/api.js
+++ b/apps/admin/src/api.js
@@ -92,6 +92,9 @@ export function createClient({ base = API_BASE, fetch = (...a) => globalThis.fet
       const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)).toString();
       return call('GET', `/v1/audit${qs ? `?${qs}` : ''}`);
     },
+    getPrices: (slug) => call('GET', `/v1/funnels/${q(slug)}/prices`),
+    setPrices: (slug, plans) => call('PUT', `/v1/funnels/${q(slug)}/prices`, { plans }),
+    listPaddlePrices: () => call('GET', '/v1/paddle/prices'),
     listUsers: () => call('GET', '/v1/admin/users'),
     createUser: (body) => call('POST', '/v1/admin/users', body),
     updateUser: (id, body) => call('PUT', `/v1/admin/users/${id}`, body),
diff --git a/apps/admin/src/format.js b/apps/admin/src/format.js
index 4fe92fa..6b215f5 100644
--- a/apps/admin/src/format.js
+++ b/apps/admin/src/format.js
@@ -2,3 +2,11 @@
 export const fmtTime = (iso) => (iso ? iso.slice(0, 16).replace('T', ' ') : '—');
 export const fmtSize = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
 export const fmtLive = (live) => live.map((l) => `${l.host}${l.prefix} v${l.v}`).join(', ') || '—';
+
+// Money in minor units: 1367 USD → "13.67 USD".
+export const fmtMoney = (minor, currency) => (minor === null || minor === undefined ? '—' : `${(minor / 100).toFixed(2)} ${currency ?? ''}`.trim());
+const UNITS = { day: 'ngày', week: 'tuần', month: 'tháng', year: 'năm' };
+export const fmtInterval = (i) => (i ? `/${i.frequency === 1 ? '' : `${i.frequency} `}${UNITS[i.unit] ?? i.unit}` : ' (một lần)');
+// A Paddle price in a picker: "Starlyn premium · Weekly — 13.67 USD/tuần" (+ " (archived)").
+export const priceLabel = (p) =>
+  `${p.product_name ? `${p.product_name} · ` : ''}${p.name} — ${fmtMoney(p.amount_minor, p.currency)}${fmtInterval(p.interval)}${p.status === 'active' ? '' : ` (${p.status})`}`;
diff --git a/apps/admin/src/pages/FunnelDetail.jsx b/apps/admin/src/pages/FunnelDetail.jsx
index d5a9c9e..2eda765 100644
--- a/apps/admin/src/pages/FunnelDetail.jsx
+++ b/apps/admin/src/pages/FunnelDetail.jsx
@@ -4,16 +4,19 @@ import { useAuth } from '../auth.jsx';
 import { ErrorNote } from '../components/ErrorNote.jsx';
 import { FunnelSettings } from '../components/FunnelSettings.jsx';
 import { LintBadge } from '../components/LintBadge.jsx';
+import { PricesTab } from '../components/PricesTab.jsx';
 import { PublishDialog } from '../components/PublishDialog.jsx';
 import { Qr } from '../components/Qr.jsx';
 import { RoleButton } from '../components/RoleButton.jsx';
 import { RollbackDialog } from '../components/RollbackDialog.jsx';
 import { UploadBox } from '../components/UploadBox.jsx';
 import { fmtSize, fmtTime } from '../format.js';
+import { can } from '../roles.js';
 
 export function FunnelDetail() {
   const { slug } = useParams();
-  const { client } = useAuth();
+  const { client, me } = useAuth();
+  const [tab, setTab] = useState('main');
   const [funnel, setFunnel] = useState(null);
   const [error, setError] = useState(null);
   const [preview, setPreview] = useState(null);
@@ -33,9 +36,25 @@ export function FunnelDetail() {
     setNotice(text);
     load();
   };
+  const tabs = can(me.role, 'prices:read') && (
+    <div role="tablist" className="row">
+      <button type="button" role="tab" aria-selected={tab === 'main'} onClick={() => setTab('main')}>Tổng quan</button>
+      <button type="button" role="tab" aria-selected={tab === 'prices'} onClick={() => setTab('prices')}>Giá</button>
+    </div>
+  );
+  if (tab === 'prices') {
+    return (
+      <section>
+        <h1>{funnel.slug}</h1>
+        {tabs}
+        <PricesTab slug={funnel.slug} />
+      </section>
+    );
+  }
   return (
     <section>
       <h1>{funnel.slug}</h1>
+      {tabs}
       {notice && <p className="ok">{notice}</p>}
       <div className="card">
         <h2>Live</h2>
diff --git a/apps/admin/src/styles.css b/apps/admin/src/styles.css
index 208f93e..242e1e7 100644
--- a/apps/admin/src/styles.css
+++ b/apps/admin/src/styles.css
@@ -29,3 +29,6 @@ dialog, .dialog { border: 1px solid #c8ced8; border-radius: 8px; padding: 16px;
 .badge { font-size: 12px; padding: 1px 6px; border-radius: 10px; background: #eef0f4; }
 .badge.warn { background: #fff4d6; }
 .badge.live { background: #dcf5e3; color: #1a7f37; }
+.badge.error { background: #fde7e9; color: #b42318; }
+[role='tablist'] { margin: 8px 0 16px; }
+[role='tab'][aria-selected='true'] { background: #1d2330; border-color: #1d2330; color: #fff; }
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/admin 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Test Files  9 passed (9)`, `Tests  64 passed (64)` (test cũ của Funnel detail không đổi: tab mặc định là Tổng quan).

- [ ] **Step 5: Commit**

```bash
git add apps/admin
git commit -m "feat(admin): Funnel detail → Giá tab (Paddle catalog picker, badges, one PUT, 422 per row)"
```

---

### Task 11: SPA **Apps**: danh sách, tạo (key + secret hiện một lần), chi tiết (sửa, xoay key, tab Webhooks)

**Files:**
- Create: `apps/admin/src/pages/{Apps,AppDetail}.jsx`, `apps/admin/src/components/{SecretsBox,FieldErrors}.jsx`
- Modify: `apps/admin/src/{api.js, App.jsx, Layout.jsx, styles.css}`
- Test: `apps/admin/test/apps.test.jsx` (mới); Modify: `apps/admin/test/{helpers.jsx, grants.test.jsx}`

**Interfaces:**
- Consumes: `GET/POST /v1/apps`, `PUT /v1/apps/:id` (Task 9), `POST /v1/apps/:id/rotate-key` (`{force}`; `409 key_rotation_pending {prev_key_expires_at}`), `GET /v1/apps/:id/webhooks` (`{items, next_before, counts}`), `POST …/resend`; `RequireGrant`, `NAV` (Task 2).
- Produces: client `createApp(body)`, `updateApp(id, body)`, `rotateKey(id, {force})`, `listWebhooks(id, {status, before})`, `resendWebhook(id, eventId)`. `SecretsBox({title, values: [[label, value]], onClose})` (`data-testid="secrets"`, "Chép ngay, không hiện lại.", nút `Đã chép, đóng`); `FieldErrors({error})` (dòng `field: reason`). `Apps` (route `/apps`, `apps:read`; form `data-testid="create-app"`), `AppDetail` (route `/apps/:id`; form `data-testid="edit-app"`, dialog `Xoay key`, tab `Webhooks` với `data-testid="counts"`, `"delivery"`, `Trạng thái`, `Gửi lại`, `Tải thêm`); `splitIds(s)` (export từ `Apps.jsx`). Menu thêm `Apps` (`apps:read`).

- [ ] **Step 1: Viết test fail**

`apps/admin/test/apps.test.jsx` (mới):

```jsx
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { ApiError } from '../src/api.js';
import { fakeClient, renderApp, ME } from './helpers.jsx';

const KEY = `ikfa_${'k'.repeat(43)}`;
const SECRET = `whsec_${'s'.repeat(43)}`;
const STARLYN = {
  id: 'starlyn', name: 'Starlyn', kind: 'app', adjust_tracker_url: 'https://app.adjust.com/abc', deeplink_scheme: 'starlyn', return_url: null,
  webhook_url: 'https://be.example/hook', handoff: 'user_id', deeplink_path: 'open', bundle_ids: ['com.ikame.starlyn'],
  prev_key_expires_at: '2026-10-12T08:00:00.000Z', created_at: '2026-10-01T08:00:00.000Z',
};
const TAROT = { ...STARLYN, id: 'tarot-web', name: 'Tarot Web', kind: 'web', adjust_tracker_url: null, deeplink_scheme: null, return_url: 'https://tarot.example/hi', handoff: null, deeplink_path: null, bundle_ids: [], prev_key_expires_at: null };
const ev = (n) => `01JA00000000000000000000${String(n).padStart(2, '0')}`;
const delivery = (n, status) => ({ event_id: ev(n), type: 'entitlement.updated', app_user_id: `u${n}`, status, attempts: status === 'dead' ? 8 : 1, next_attempt_at: '2026-10-11T08:00:00.000Z', last_error: status === 'dead' ? 'http_500' : null, created_at: '2026-10-11T08:00:00.000Z', delivered_at: null });
const COUNTS = { pending: 1, delivered: 3, dead: 2 };

const client = (me, overrides = {}) => fakeClient(me, { listApps: vi.fn(async () => ({ apps: [STARLYN, TAROT] })), ...overrides });

// Spec admin-console-p2 §3: Apps (apps:read reads, admin writes).
describe('Apps list and create', () => {
  it('editor: a row per app (id, kind, handoff, webhook, previous key until); Tạo app greyed out', async () => {
    renderApp(client(ME.editor), '/apps');
    const row = (await screen.findByRole('link', { name: 'starlyn' })).closest('tr');
    expect([...row.querySelectorAll('td')].map((td) => td.textContent)).toEqual(['starlyn', 'app', 'user_id', 'https://be.example/hook', '2026-10-12 08:00']);
    expect(screen.getByRole('link', { name: 'tarot-web' }).closest('tr').querySelectorAll('td')[4].textContent).toBe('—');
    const create = screen.getByRole('button', { name: 'Tạo app' });
    expect(create.disabled).toBe(true);
    expect(create.title).toBe('Cần quyền admin');
  });

  it('support and viewer: no Apps in the menu; the page says which grant it needs', async () => {
    renderApp(client(ME.support), '/apps');
    expect(await screen.findByText('Cần quyền apps:read.')).toBeTruthy();
    expect(within(screen.getByRole('navigation')).queryByRole('link', { name: 'Apps' })).toBeNull();
  });

  it('admin creates an app (kind app): the key and secret are shown ONCE, then gone', async () => {
    const c = client(ME.admin, { createApp: vi.fn(async (b) => ({ app: { ...STARLYN, ...b }, api_key: KEY, webhook_secret: SECRET })) });
    renderApp(c, '/apps');
    const form = await screen.findByTestId('create-app');
    const fill = (label, value) => fireEvent.change(within(form).getByLabelText(label), { target: { value } });
    fill('id', 'zodiac');
    fill('Tên', 'Zodiac');
    fill('Adjust tracker URL', 'https://app.adjust.com/zz');
    fill('Deep link scheme', 'zodiac');
    fill('Handoff', 'claim');
    fill('Webhook URL', 'https://be.zodiac.example/hook');
    fill('Bundle ids', 'com.a, com.b');
    fireEvent.click(screen.getByRole('button', { name: 'Tạo app' }));
    await waitFor(() => expect(c.createApp).toHaveBeenCalledWith({
      id: 'zodiac', name: 'Zodiac', kind: 'app', webhook_url: 'https://be.zodiac.example/hook', adjust_tracker_url: 'https://app.adjust.com/zz',
      deeplink_scheme: 'zodiac', handoff: 'claim', deeplink_path: 'open', bundle_ids: ['com.a', 'com.b'],
    }));
    const box = await screen.findByTestId('secrets');
    expect(box.textContent).toContain(KEY);
    expect(box.textContent).toContain(SECRET);
    expect(box.textContent).toContain('Chép ngay, không hiện lại.');
    fireEvent.click(within(box).getByRole('button', { name: 'Đã chép, đóng' }));
    expect(screen.queryByTestId('secrets')).toBeNull();
    expect(screen.queryByText(KEY)).toBeNull();
    expect(c.listApps).toHaveBeenCalledTimes(2);
  });

  it('kind web asks for the return URL instead; invalid_app lists the fields', async () => {
    const c = client(ME.admin, {
      createApp: vi.fn(async () => { throw new ApiError(400, { error: 'invalid_app', detail: [{ field: 'return_url', reason: 'https_required' }] }); }),
    });
    renderApp(c, '/apps');
    const form = await screen.findByTestId('create-app');
    fireEvent.change(within(form).getByLabelText('Kind'), { target: { value: 'web' } });
    expect(within(form).queryByLabelText('Adjust tracker URL')).toBeNull();
    fireEvent.change(within(form).getByLabelText('id'), { target: { value: 'tw' } });
    fireEvent.change(within(form).getByLabelText('Return URL'), { target: { value: 'http://x' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tạo app' }));
    expect(await screen.findByText('return_url: https_required')).toBeTruthy();
    expect(c.createApp.mock.calls[0][0]).toMatchObject({ id: 'tw', kind: 'web', return_url: 'http://x' });
    expect(c.createApp.mock.calls[0][0]).not.toHaveProperty('handoff');
  });
});

describe('App detail', () => {
  it('admin edits: only the changed fields are sent; a web app has no Adjust fields', async () => {
    const c = client(ME.admin, { updateApp: vi.fn(async (id, b) => ({ app: { ...STARLYN, ...b } })) });
    renderApp(c, '/apps/starlyn');
    const form = await screen.findByTestId('edit-app');
    fireEvent.change(within(form).getByLabelText('Tên'), { target: { value: 'Starlyn 2' } });
    fireEvent.change(within(form).getByLabelText('Webhook URL'), { target: { value: 'https://be2.example/hook' } });
    fireEvent.click(within(form).getByRole('button', { name: 'Lưu' }));
    await waitFor(() => expect(c.updateApp).toHaveBeenCalledWith('starlyn', { name: 'Starlyn 2', webhook_url: 'https://be2.example/hook' }));
    expect(await screen.findByText('Đã lưu.')).toBeTruthy();
    expect(within(form).getByLabelText('Kind').disabled).toBe(true);
  });

  it('a web app: return URL editable, Adjust/scheme/path not shown', async () => {
    renderApp(client(ME.admin), '/apps/tarot-web');
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
    renderApp(c, '/apps/starlyn');
    fireEvent.click(await screen.findByRole('button', { name: 'Xoay key' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog.textContent).toContain('Key cũ vẫn dùng được 24 giờ');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận xoay key' }));
    expect(await within(dialog).findByText('Key trước còn hiệu lực tới 2026-10-12 08:00. Tick "force" để khoá nó ngay và xoay tiếp.')).toBeTruthy();
    fireEvent.click(within(dialog).getByLabelText('force: khoá ngay key trước (nếu còn trong 24 giờ)'));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận xoay key' }));
    await waitFor(() => expect(c.rotateKey).toHaveBeenLastCalledWith('starlyn', { force: true }));
    const box = await screen.findByTestId('secrets');
    expect(box.textContent).toContain(KEY);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('Webhooks: counts, status filter, load more, resend (admin)', async () => {
    const c = client(ME.admin, {
      listWebhooks: vi.fn(async (id, { status, before }) => {
        if (before) return { items: [delivery(1, 'delivered')], next_before: null, counts: COUNTS };
        if (status === 'dead') return { items: [delivery(4, 'dead')], next_before: null, counts: COUNTS };
        return { items: [delivery(4, 'dead'), delivery(3, 'pending')], next_before: 3, counts: COUNTS };
      }),
      resendWebhook: vi.fn(async () => ({ ...delivery(9, 'pending'), resent_from: ev(4) })),
    });
    renderApp(c, '/apps/starlyn');
    fireEvent.click(await screen.findByRole('tab', { name: 'Webhooks' }));
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

  it('an editor sees webhooks but Gửi lại, Xoay key and Lưu are greyed out', async () => {
    const c = client(ME.editor, { listWebhooks: vi.fn(async () => ({ items: [delivery(4, 'dead')], next_before: null, counts: COUNTS })) });
    renderApp(c, '/apps/starlyn');
    expect((await screen.findByRole('button', { name: 'Xoay key' })).disabled).toBe(true);
    expect(within(screen.getByTestId('edit-app')).getByRole('button', { name: 'Lưu' }).disabled).toBe(true);
    fireEvent.click(screen.getByRole('tab', { name: 'Webhooks' }));
    expect((await within(await screen.findByTestId('delivery')).findByRole('button', { name: 'Gửi lại' })).disabled).toBe(true);
  });

  it('an unknown app id says so', async () => {
    renderApp(client(ME.admin), '/apps/nope');
    expect(await screen.findByText('Không có app nope.')).toBeTruthy();
  });
});
```

`apps/admin/test/{helpers.jsx, grants.test.jsx}` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/test/grants.test.jsx b/apps/admin/test/grants.test.jsx
index 2367f86..6240016 100644
--- a/apps/admin/test/grants.test.jsx
+++ b/apps/admin/test/grants.test.jsx
@@ -53,8 +53,8 @@ describe('nav by grants', () => {
   it.each([
     ['viewer', ['Funnels', 'Domains', 'Audit']],
     ['support', ['Funnels', 'Domains', 'Audit']],
-    ['editor', ['Funnels', 'Domains', 'Audit']],
-    ['admin', ['Funnels', 'Domains', 'Audit', 'Settings']],
+    ['editor', ['Funnels', 'Apps', 'Domains', 'Audit']],
+    ['admin', ['Funnels', 'Apps', 'Domains', 'Audit', 'Settings']],
   ])('%s sees %j', async (role, items) => {
     expect(await navOf(ME[role])).toEqual(items);
   });
diff --git a/apps/admin/test/helpers.jsx b/apps/admin/test/helpers.jsx
index eabcce2..f255b37 100644
--- a/apps/admin/test/helpers.jsx
+++ b/apps/admin/test/helpers.jsx
@@ -39,6 +39,11 @@ export function fakeClient(me = ME.admin, overrides = {}) {
     getPrices: vi.fn(async (slug) => ({ funnel: slug, plans: {}, plan_keys: null, unmapped: [] })),
     setPrices: vi.fn(),
     listPaddlePrices: vi.fn(async () => ({ prices: [] })),
+    createApp: vi.fn(),
+    updateApp: vi.fn(),
+    rotateKey: vi.fn(),
+    listWebhooks: vi.fn(async () => ({ items: [], next_before: null, counts: { pending: 0, delivered: 0, dead: 0 } })),
+    resendWebhook: vi.fn(),
     ...overrides,
   };
   return client;
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/admin -- test/apps.test.jsx test/grants.test.jsx 2>&1 | grep -E "Test Files|Tests  "
```

Expected: 10 test `apps.test.jsx` (chưa có route `/apps`) và 2 dòng menu (`editor`, `admin` chưa có `Apps`) FAIL; `Test Files  2 failed (2)`, `Tests  12 failed | 10 passed (22)`.

- [ ] **Step 3: Implement**

`apps/admin/src/components/SecretsBox.jsx` (mới):

```jsx
// Values the API returns once (an app's API key, its webhook secret): shown until "Đã chép, đóng", never again.
export function SecretsBox({ title, values, onClose }) {
  return (
    <div className="card secrets" data-testid="secrets">
      <h3>{title}</h3>
      <p className="warn">Chép ngay, không hiện lại. Lưu vào password manager rồi gửi riêng cho team backend app.</p>
      <dl>
        {values.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd><code>{value}</code></dd>
          </div>
        ))}
      </dl>
      <button type="button" onClick={onClose}>Đã chép, đóng</button>
    </div>
  );
}
```

`apps/admin/src/components/FieldErrors.jsx` (mới):

```jsx
// The {field, reason} list of a 400 invalid_app / invalid_grant, one line each.
export function FieldErrors({ error }) {
  const list = Array.isArray(error?.detail) ? error.detail : error?.detail?.field ? [error.detail] : [];
  if (!list.length) return null;
  return <ul className="error">{list.map((d) => <li key={`${d.field}-${d.reason}`}>{d.field}{d.reason ? `: ${d.reason}` : ''}</li>)}</ul>;
}
```

`apps/admin/src/pages/Apps.jsx` (mới):

```jsx
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../auth.jsx';
import { ErrorNote } from '../components/ErrorNote.jsx';
import { FieldErrors } from '../components/FieldErrors.jsx';
import { RoleButton } from '../components/RoleButton.jsx';
import { SecretsBox } from '../components/SecretsBox.jsx';
import { fmtTime } from '../format.js';

const EMPTY = { id: '', name: '', kind: 'app', adjust_tracker_url: '', deeplink_scheme: '', handoff: 'user_id', deeplink_path: 'open', return_url: '', webhook_url: '', bundle_ids: '' };

export const splitIds = (s) => s.split(',').map((b) => b.trim()).filter(Boolean);

// The POST /v1/apps body for the form: the fields of its kind only.
function createBody(d) {
  const bundles = splitIds(d.bundle_ids);
  return {
    id: d.id.trim(),
    name: d.name.trim() || d.id.trim(),
    kind: d.kind,
    webhook_url: d.webhook_url.trim(),
    ...(d.kind === 'app'
      ? { adjust_tracker_url: d.adjust_tracker_url.trim(), deeplink_scheme: d.deeplink_scheme.trim(), handoff: d.handoff, deeplink_path: d.deeplink_path.trim() || 'open' }
      : { return_url: d.return_url.trim() }),
    ...(bundles.length && { bundle_ids: bundles }),
  };
}

// Apps (spec admin-console-p2 §3): the registry; admins create one (key + secret shown once).
export function Apps() {
  const { client } = useAuth();
  const [apps, setApps] = useState(null);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState(EMPTY);
  const [created, setCreated] = useState(null);

  const load = useCallback(() => client.listApps().then((r) => setApps(r.apps), setError), [client]);
  useEffect(() => {
    load();
  }, [load]);

  const field = (name, label, props = {}) => (
    <label>
      {label}
      <input aria-label={label} value={draft[name]} onChange={(e) => setDraft({ ...draft, [name]: e.target.value })} {...props} />
    </label>
  );
  const create = async () => {
    setError(null);
    try {
      setCreated(await client.createApp(createBody(draft)));
      setDraft(EMPTY);
      await load();
    } catch (err) {
      setError(err);
    }
  };

  return (
    <section>
      <h1>Apps</h1>
      {created && (
        <SecretsBox
          title={`${created.app.id} đã tạo`}
          values={[['API key', created.api_key], ['Webhook secret', created.webhook_secret]]}
          onClose={() => setCreated(null)}
        />
      )}
      {apps === null ? (
        <p className="muted">Đang tải…</p>
      ) : (
        <table>
          <thead>
            <tr><th>id</th><th>Kind</th><th>Handoff</th><th>Webhook URL</th><th>Key cũ dùng tới</th></tr>
          </thead>
          <tbody>
            {apps.map((a) => (
              <tr key={a.id}>
                <td><Link to={`/apps/${a.id}`}>{a.id}</Link></td>
                <td>{a.kind}</td>
                <td>{a.handoff ?? '—'}</td>
                <td>{a.webhook_url ?? '—'}</td>
                <td>{fmtTime(a.prev_key_expires_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="card form" data-testid="create-app">
        <h2>Tạo app</h2>
        {field('id', 'id', { placeholder: 'starlyn' })}
        {field('name', 'Tên')}
        <label>
          Kind
          <select aria-label="Kind" value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value })}>
            <option value="app">app (mobile)</option>
            <option value="web">web</option>
          </select>
        </label>
        {draft.kind === 'app' ? (
          <>
            {field('adjust_tracker_url', 'Adjust tracker URL', { placeholder: 'https://app.adjust.com/…' })}
            {field('deeplink_scheme', 'Deep link scheme')}
            <label>
              Handoff
              <select aria-label="Handoff" value={draft.handoff} onChange={(e) => setDraft({ ...draft, handoff: e.target.value })}>
                <option value="user_id">user_id (IKameSDK)</option>
                <option value="claim">claim (backend riêng)</option>
              </select>
            </label>
            {field('deeplink_path', 'Deep link path')}
          </>
        ) : (
          field('return_url', 'Return URL', { placeholder: 'https://…' })
        )}
        {field('webhook_url', 'Webhook URL', { placeholder: 'https://…' })}
        {field('bundle_ids', 'Bundle ids', { placeholder: 'com.a, com.b' })}
        <RoleButton need="admin" className="primary" disabled={!draft.id.trim()} onClick={create}>Tạo app</RoleButton>
        <ErrorNote error={error} />
        <FieldErrors error={error} />
      </div>
    </section>
  );
}
```

`apps/admin/src/pages/AppDetail.jsx` (mới):

```jsx
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
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
      <label><input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} /> force: khoá ngay key trước (nếu còn trong 24 giờ)</label>
      {error?.code === 'key_rotation_pending' ? (
        <p className="error" role="alert">Key trước còn hiệu lực tới {fmtTime(error.detail?.prev_key_expires_at)}. Tick "force" để khoá nó ngay và xoay tiếp.</p>
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

function Webhooks({ appId }) {
  const { client } = useAuth();
  const [status, setStatus] = useState('');
  const [items, setItems] = useState(null);
  const [next, setNext] = useState(null);
  const [counts, setCounts] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');

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

  const resend = async (eventId) => {
    setError(null);
    try {
      const r = await client.resendWebhook(appId, eventId);
      setNotice(`Đã xếp hàng gửi lại (event ${r.event_id}).`);
      await load(undefined);
    } catch (err) {
      setError(err);
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
                <td><RoleButton need="admin" onClick={() => resend(d.event_id)}>Gửi lại</RoleButton></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {next && <button type="button" onClick={() => load(next)}>Tải thêm</button>}
    </div>
  );
}

// App detail (spec admin-console-p2 §3): edit, rotate the key, webhook deliveries.
export function AppDetail() {
  const { id } = useParams();
  const { client } = useAuth();
  const [apps, setApps] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('info');
  const [rotating, setRotating] = useState(false);
  const [newKey, setNewKey] = useState(null);

  const load = useCallback(() => client.listApps().then((r) => setApps(r.apps), setError), [client]);
  useEffect(() => {
    load();
  }, [load]);

  if (!apps) return error ? <ErrorNote error={error} /> : <p className="muted">Đang tải…</p>;
  const app = apps.find((a) => a.id === id);
  if (!app) return <p className="muted">Không có app {id}.</p>;
  return (
    <section>
      <h1>{app.name} ({app.id})</h1>
      <div role="tablist" className="row">
        <button type="button" role="tab" aria-selected={tab === 'info'} onClick={() => setTab('info')}>Thông tin</button>
        <button type="button" role="tab" aria-selected={tab === 'webhooks'} onClick={() => setTab('webhooks')}>Webhooks</button>
      </div>
      {newKey && <SecretsBox title={`API key mới của ${app.id}`} values={[['API key', newKey]]} onClose={() => setNewKey(null)} />}
      {tab === 'webhooks' ? (
        <Webhooks appId={app.id} />
      ) : (
        <>
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
                load();
              }}
            />
          )}
          <EditApp key={JSON.stringify(app)} app={app} onSaved={load} />
        </>
      )}
    </section>
  );
}
```

`apps/admin/src/{api.js, App.jsx, Layout.jsx, styles.css}` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/src/App.jsx b/apps/admin/src/App.jsx
index 85fb661..5e9d188 100644
--- a/apps/admin/src/App.jsx
+++ b/apps/admin/src/App.jsx
@@ -1,6 +1,9 @@
 import { Navigate, Route, Routes } from 'react-router';
 import { AuthProvider, RequireAuth } from './auth.jsx';
 import { Layout } from './Layout.jsx';
+import { RequireGrant } from './components/RequireGrant.jsx';
+import { AppDetail } from './pages/AppDetail.jsx';
+import { Apps } from './pages/Apps.jsx';
 import { Audit } from './pages/Audit.jsx';
 import { Domains } from './pages/Domains.jsx';
 import { FunnelDetail } from './pages/FunnelDetail.jsx';
@@ -17,6 +20,8 @@ export function App({ client }) {
           <Route index element={<Navigate to="/funnels" replace />} />
           <Route path="/funnels" element={<Funnels />} />
           <Route path="/funnels/:slug" element={<FunnelDetail />} />
+          <Route path="/apps" element={<RequireGrant need="apps:read"><Apps /></RequireGrant>} />
+          <Route path="/apps/:id" element={<RequireGrant need="apps:read"><AppDetail /></RequireGrant>} />
           <Route path="/domains" element={<Domains />} />
           <Route path="/audit" element={<Audit />} />
           <Route path="/settings/users" element={<Users />} />
diff --git a/apps/admin/src/Layout.jsx b/apps/admin/src/Layout.jsx
index d1473f9..b0a34dc 100644
--- a/apps/admin/src/Layout.jsx
+++ b/apps/admin/src/Layout.jsx
@@ -5,6 +5,7 @@ import { can } from './roles.js';
 // The side menu, in order; an item shows only for roles that have its grant (spec admin-console-p2 §3).
 export const NAV = [
   { to: '/funnels', label: 'Funnels', need: 'viewer' },
+  { to: '/apps', label: 'Apps', need: 'apps:read' },
   { to: '/domains', label: 'Domains', need: 'viewer' },
   { to: '/audit', label: 'Audit', need: 'viewer' },
   { to: '/settings/users', label: 'Settings', need: 'admin' },
diff --git a/apps/admin/src/api.js b/apps/admin/src/api.js
index 19ddd03..92b89e8 100644
--- a/apps/admin/src/api.js
+++ b/apps/admin/src/api.js
@@ -84,6 +84,14 @@ export function createClient({ base = API_BASE, fetch = (...a) => globalThis.fet
     uploadVersion: async (slug, html) => call('POST', `/v1/funnels/${q(slug)}/versions`, { html, sha256: await sha256Hex(html) }),
     setFunnel: (slug, body) => call('PUT', `/v1/funnels/${q(slug)}`, body),
     listApps: () => call('GET', '/v1/apps'),
+    createApp: (body) => call('POST', '/v1/apps', body),
+    updateApp: (id, body) => call('PUT', `/v1/apps/${q(id)}`, body),
+    rotateKey: (id, { force = false } = {}) => call('POST', `/v1/apps/${q(id)}/rotate-key`, force ? { force: true } : undefined),
+    listWebhooks: (id, { status, before } = {}) => {
+      const qs = new URLSearchParams({ ...(status && { status }), ...(before && { before: String(before) }) }).toString();
+      return call('GET', `/v1/apps/${q(id)}/webhooks${qs ? `?${qs}` : ''}`);
+    },
+    resendWebhook: (id, eventId) => call('POST', `/v1/apps/${q(id)}/webhooks/${q(eventId)}/resend`),
     listDomains: () => call('GET', '/v1/domains'),
     syncHost: (host) => call('POST', `/v1/routes/${q(host)}/sync`),
     publish: (host, body) => call('PUT', `/v1/routes/${q(host)}`, body),
diff --git a/apps/admin/src/styles.css b/apps/admin/src/styles.css
index 242e1e7..7d1cd29 100644
--- a/apps/admin/src/styles.css
+++ b/apps/admin/src/styles.css
@@ -32,3 +32,6 @@ dialog, .dialog { border: 1px solid #c8ced8; border-radius: 8px; padding: 16px;
 .badge.error { background: #fde7e9; color: #b42318; }
 [role='tablist'] { margin: 8px 0 16px; }
 [role='tab'][aria-selected='true'] { background: #1d2330; border-color: #1d2330; color: #fff; }
+.form label { display: flex; flex-direction: column; gap: 4px; margin: 8px 0; max-width: 480px; font-size: 13px; color: #5a6475; }
+.secrets { border-color: #9a6700; }
+.secrets code { word-break: break-all; }
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/admin 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Test Files  10 passed (10)`, `Tests  74 passed (74)`.

- [ ] **Step 5: Commit**

```bash
git add apps/admin
git commit -m "feat(admin): Apps list, create (key + secret once), detail edit, rotate key dialog, webhooks tab (counts, filter, resend, load more)"
```

---

### Task 12: SPA **Khách hàng**: tìm (email / `cus_…` / checkout id), chi tiết, gửi lại email, cấp/thu hồi quyền, cấp lại `user_id`

**Files:**
- Create: `apps/admin/src/pages/{Customers,CustomerDetail}.jsx`
- Modify: `apps/admin/src/{api.js, App.jsx, Layout.jsx, pages/Audit.jsx}`
- Test: `apps/admin/test/customers.test.jsx` (mới); Modify: `apps/admin/test/{helpers.jsx, grants.test.jsx}`

**Interfaces:**
- Consumes: `POST /v1/customers/lookup` (report v2, Task 5), `resend-email`, `rotate-user-id` (Task 6), `grants` POST/DELETE (Task 4: `400 invalid_grant {field}`), `GET /v1/apps`; `FieldErrors` (Task 11), `RequireGrant`, `fmtMoney` (Task 10).
- Produces: client `lookupCustomers(query)`, `resendEmail(ref)`, `rotateUserId(ref)`, `grantEntitlement(ref, body)`, `revokeGrant(ref, id)`. `Customers.jsx`: `CUSTOMER_REF_RE`, `lookupQuery(text)` → `{email}` | `{customer_ref}` | `{checkout_id}` (in hoa) | `null`; route `/customers` (`support`), ô `Tìm khách`, nút `Tìm`, kết quả nhiều `data-testid="customer"`. `CustomerDetail.jsx`: route `/customers/:ref` (`support`), các `section` có `aria-label`: `Tóm tắt`, `Quyền` (`data-testid="entitlement"`, bảng "Cấp thủ công" với `Thu hồi #<id>`), `Mua hàng`, `Link app`, `Webhook`, `Email link app` (nút `Gửi lại`), `Hành động admin` (`Cấp quyền`, `Cấp lại user_id`); link `Xem audit` → `/audit?target=customer:<ref>`. Menu thêm `Khách hàng` (`support`). Audit thêm họ `webhook`, `customer`, `entitlement`, `billing`.

- [ ] **Step 1: Viết test fail**

`apps/admin/test/customers.test.jsx` (mới):

```jsx
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { ApiError } from '../src/api.js';
import { fakeClient, renderApp, ME } from './helpers.jsx';

const REF = 'cus_01K75Z0000000000000000000B';
const REF2 = 'cus_01K75Z0000000000000000000C';
const CK = '01JA0000000000000000000001';
const UID = '3f1c2a9e-4b7d-4c1e-9a2b-0c4d5e6f7a8b';
const grant = (o = {}) => ({ id: 7, app_id: 'starlyn', key: 'tarot_2027', expires_at: null, reason: 'CS ticket 42', granted_by: 'boss@ikameglobal.com', created_at: '2026-10-10T08:00:00.000Z', revoked_at: null, revoked_by: null, ...o });
const REPORT = {
  customer_ref: REF, paddle_customer_id: 'ctm_1', created_at: '2026-10-09T10:00:00.000Z', user_id_rotated_at: null, has_email: true,
  user_id: UID, // a report must never carry it; if one ever did, the page still must not show it
  checkouts: [{ id: CK, funnel: 'witch-power', v: 1, plan_key: '1w', status: 'completed', created_at: '2026-10-09T09:59:00.000Z', completed_at: '2026-10-09T10:00:00.000Z', amount_minor: 1367, currency: 'USD' }],
  subscriptions: [{ id: 'sub_1', funnel: 'witch-power', plan_key: '1w', status: 'active', current_period_end: '2026-10-16T10:00:00.000Z', canceled_at: null }],
  entitlements: [
    { app_id: 'starlyn', key: 'premium', active: true, expires_at: '2026-10-19T10:00:00.000Z', source: 'subscription', source_id: 'sub_1' },
    { app_id: 'starlyn', key: 'tarot_2027', active: true, expires_at: null, source: 'manual', source_id: '7' },
  ],
  manual_grants: [grant(), grant({ id: 5, key: 'premium', revoked_at: '2026-10-10T09:00:00.000Z', revoked_by: 'boss@ikameglobal.com', reason: 'test' })],
  links: [{ app_id: 'starlyn', app_user_id: 'u_42', linked_at: '2026-10-09T10:01:00.000Z', revoked_at: null }],
  deliveries: [{ event_id: '01JA00000000000000000000EV', app_id: 'starlyn', app_user_id: 'u_42', type: 'entitlement.updated', status: 'delivered', attempts: 1, last_error: null, created_at: '2026-10-09T10:01:00.000Z' }],
  claim: { checkout_id: CK, emailed_at: '2026-10-09T10:00:07.000Z', email_attempts: 1, expires_at: '2026-10-16T10:00:00.000Z' },
};

function setup(me = ME.support, overrides = {}, path = '/customers') {
  const client = fakeClient(me, {
    lookupCustomers: vi.fn(async () => ({ customers: [REPORT] })),
    listApps: vi.fn(async () => ({ apps: [{ id: 'starlyn', name: 'Starlyn', kind: 'app' }, { id: 'zodiac', name: 'Zodiac', kind: 'app' }] })),
    ...overrides,
  });
  renderApp(client, path);
  return client;
}
const search = async (text) => {
  fireEvent.change(await screen.findByLabelText('Tìm khách'), { target: { value: text } });
  fireEvent.click(screen.getByRole('button', { name: 'Tìm' }));
};
const section = (name) => screen.getByRole('region', { name });

// Spec admin-console-p2 §3: Khách hàng (support), never the user_id.
describe('Customers: search', () => {
  it.each([
    ['  Buyer@Example.com ', { email: 'Buyer@Example.com' }],
    [REF, { customer_ref: REF }],
    [CK.toLowerCase(), { checkout_id: CK }],
  ])('"%s" is looked up as %j; one result opens its page (by customer_ref, the email stays out of the URL)', async (text, query) => {
    const client = setup();
    await search(text);
    expect(await screen.findByRole('heading', { name: REF })).toBeTruthy();
    expect(client.lookupCustomers).toHaveBeenCalledWith(query);
  });

  it('anything else: says what to type; nobody found: says so', async () => {
    const client = setup(ME.support, { lookupCustomers: vi.fn(async () => ({ customers: [] })) });
    await search('hello');
    expect(await screen.findByText('Nhập email, cus_… hoặc checkout id (26 ký tự).')).toBeTruthy();
    expect(client.lookupCustomers).not.toHaveBeenCalled();
    await search('nobody@example.com');
    expect(await screen.findByText('Không tìm thấy khách.')).toBeTruthy();
  });

  it('several customers (one email, two Paddle customers): a list to pick from', async () => {
    setup(ME.support, { lookupCustomers: vi.fn(async (q) => ({ customers: q.email ? [REPORT, { ...REPORT, customer_ref: REF2, entitlements: [] }] : [REPORT] })) });
    await search('buyer@example.com');
    const rows = await screen.findAllByTestId('customer');
    expect(rows.map((r) => r.firstChild.textContent)).toEqual([REF, REF2]);
    fireEvent.click(within(rows[0]).getByRole('link', { name: REF }));
    expect(await screen.findByRole('heading', { name: REF })).toBeTruthy();
  });

  it('editor and viewer: no Khách hàng in the menu; the page needs support', async () => {
    renderApp(fakeClient(ME.editor), '/customers');
    expect(await screen.findByText('Cần quyền support.')).toBeTruthy();
    expect(within(screen.getByRole('navigation')).queryByRole('link', { name: 'Khách hàng' })).toBeNull();
  });
});

describe('Customer detail', () => {
  it('sections: summary, entitlements (manual labelled with its reason), purchases, links, webhooks, app-link email; audit link; no user_id anywhere', async () => {
    setup(ME.support, {}, `/customers/${REF}`);
    await screen.findByRole('heading', { name: REF });
    expect(section('Tóm tắt').textContent).toContain('user_id cấp lại lúc: —');
    const ents = within(section('Quyền')).getAllByTestId('entitlement').map((r) => [...r.querySelectorAll('td')].slice(0, 5).map((td) => td.textContent));
    expect(ents).toEqual([
      ['starlyn/premium', 'active', '2026-10-19 10:00', 'subscription sub_1', ''],
      ['starlyn/tarot_2027', 'active', '—', 'thủ công #7', 'CS ticket 42'],
    ]);
    expect(within(section('Mua hàng')).getByText('witch-power@v1 1w')).toBeTruthy();
    expect(within(section('Mua hàng')).getByText('13.67 USD')).toBeTruthy();
    expect(within(section('Mua hàng')).getByText('sub_1')).toBeTruthy();
    expect(within(section('Link app')).getByText('starlyn/u_42')).toBeTruthy();
    expect(within(section('Webhook')).getByText('01JA00000000000000000000EV')).toBeTruthy();
    expect(section('Email link app').textContent).toContain(`checkout ${CK}: gửi lúc 2026-10-09 10:00, 1 lần, link hết hạn 2026-10-16 10:00`);
    expect(screen.getByRole('link', { name: 'Xem audit' }).getAttribute('href')).toBe(`/audit?target=customer:${REF}`);
    expect(document.body.textContent).not.toContain(UID);
  });

  it('support resends the app-link email; without an address the button says why', async () => {
    const client = setup(ME.support, { resendEmail: vi.fn(async () => ({ queued: true, checkout_id: CK })) }, `/customers/${REF}`);
    fireEvent.click(await within(await screen.findByRole('region', { name: 'Email link app' })).findByRole('button', { name: 'Gửi lại' }));
    await waitFor(() => expect(client.resendEmail).toHaveBeenCalledWith(REF));
    expect(await screen.findByText(`Đã xếp hàng gửi lại email link app (checkout ${CK}).`)).toBeTruthy();
    expect(client.lookupCustomers).toHaveBeenCalledTimes(2);
  });

  it('no email on file: Gửi lại is greyed out with the reason', async () => {
    setup(ME.support, { lookupCustomers: vi.fn(async () => ({ customers: [{ ...REPORT, has_email: false }] })) }, `/customers/${REF}`);
    const btn = await within(await screen.findByRole('region', { name: 'Email link app' })).findByRole('button', { name: 'Gửi lại' });
    expect(btn.disabled).toBe(true);
    expect(btn.title).toBe('Khách không có email');
  });

  // Review Focus 5: support reaches the admin actions only as greyed-out buttons.
  it('support sees the admin actions greyed out (Cấp quyền, Cấp lại user_id, Thu hồi)', async () => {
    setup(ME.support, {}, `/customers/${REF}`);
    await screen.findByRole('heading', { name: REF });
    for (const name of ['Cấp quyền', 'Cấp lại user_id']) {
      const b = within(section('Hành động admin')).getByRole('button', { name });
      expect(b.disabled).toBe(true);
      expect(b.title).toBe('Cần quyền admin');
    }
    expect(within(section('Quyền')).getByRole('button', { name: 'Thu hồi #7' }).disabled).toBe(true);
  });

  it('admin grants: app from /v1/apps, key, end date (end of that day UTC) or none, reason; invalid_grant shows the field', async () => {
    const client = setup(ME.admin, {
      grantEntitlement: vi.fn(async (ref, b) => {
        if (b.reason === 'x') throw new ApiError(400, { error: 'invalid_grant', detail: { field: 'expires_at' } });
        return { grant: grant({ id: 8, app_id: b.app_id, key: b.key }), entitlements: [] };
      }),
    }, `/customers/${REF}`);
    fireEvent.click(await within(await screen.findByRole('region', { name: 'Hành động admin' })).findByRole('button', { name: 'Cấp quyền' }));
    const dialog = screen.getByRole('dialog');
    await waitFor(() => expect(within(dialog).getByLabelText('App').options.length).toBe(2));
    fireEvent.change(within(dialog).getByLabelText('App'), { target: { value: 'zodiac' } });
    expect(within(dialog).getByLabelText('Key').value).toBe('premium');
    fireEvent.change(within(dialog).getByLabelText('Hết hạn (UTC, bỏ trống = không hết hạn)'), { target: { value: '2026-12-31' } });
    fireEvent.change(within(dialog).getByLabelText('Lý do'), { target: { value: 'x' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận cấp quyền' }));
    expect(await within(dialog).findByText('expires_at')).toBeTruthy();
    fireEvent.change(within(dialog).getByLabelText('Lý do'), { target: { value: 'CS ticket 43' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận cấp quyền' }));
    await waitFor(() => expect(client.grantEntitlement).toHaveBeenLastCalledWith(REF, { app_id: 'zodiac', key: 'premium', expires_at: '2026-12-31T23:59:59.000Z', reason: 'CS ticket 43' }));
    expect(await screen.findByText('Đã cấp zodiac/premium (grant 8).')).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('admin revokes a manual grant (confirm), and rotates the user_id after a warning', async () => {
    const client = setup(ME.admin, {
      revokeGrant: vi.fn(async () => ({ grant: grant({ revoked_at: '2026-10-11T09:00:00.000Z' }), entitlements: [] })),
      rotateUserId: vi.fn(async () => ({ rotated_at: '2026-10-11T09:30:00.000Z', email_queued: false })),
    }, `/customers/${REF}`);
    fireEvent.click(await within(await screen.findByRole('region', { name: 'Quyền' })).findByRole('button', { name: 'Thu hồi #7' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Xác nhận thu hồi' }));
    await waitFor(() => expect(client.revokeGrant).toHaveBeenCalledWith(REF, 7));
    expect(await screen.findByText('Đã thu hồi grant #7.')).toBeTruthy();
    fireEvent.click(within(section('Hành động admin')).getByRole('button', { name: 'Cấp lại user_id' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog.textContent).toContain('Mọi app đã cài của khách về FREE cho tới khi khách mở link mới');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận cấp lại user_id' }));
    await waitFor(() => expect(client.rotateUserId).toHaveBeenCalledWith(REF));
    expect(await screen.findByText('Đã cấp lại user_id lúc 2026-10-11 09:30; KHÔNG gửi được email (khách không có email hoặc chưa có email link app).')).toBeTruthy();
  });

  it('an unknown customer_ref says so', async () => {
    setup(ME.support, { lookupCustomers: vi.fn(async () => ({ customers: [] })) }, `/customers/${REF2}`);
    expect(await screen.findByText(`Không có khách ${REF2}.`)).toBeTruthy();
  });
});
```

`apps/admin/test/{helpers.jsx, grants.test.jsx}` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/test/grants.test.jsx b/apps/admin/test/grants.test.jsx
index 6240016..ea3d044 100644
--- a/apps/admin/test/grants.test.jsx
+++ b/apps/admin/test/grants.test.jsx
@@ -52,9 +52,9 @@ describe('nav by grants', () => {
 
   it.each([
     ['viewer', ['Funnels', 'Domains', 'Audit']],
-    ['support', ['Funnels', 'Domains', 'Audit']],
+    ['support', ['Funnels', 'Khách hàng', 'Domains', 'Audit']],
     ['editor', ['Funnels', 'Apps', 'Domains', 'Audit']],
-    ['admin', ['Funnels', 'Apps', 'Domains', 'Audit', 'Settings']],
+    ['admin', ['Funnels', 'Apps', 'Khách hàng', 'Domains', 'Audit', 'Settings']],
   ])('%s sees %j', async (role, items) => {
     expect(await navOf(ME[role])).toEqual(items);
   });
diff --git a/apps/admin/test/helpers.jsx b/apps/admin/test/helpers.jsx
index f255b37..d90521b 100644
--- a/apps/admin/test/helpers.jsx
+++ b/apps/admin/test/helpers.jsx
@@ -44,6 +44,11 @@ export function fakeClient(me = ME.admin, overrides = {}) {
     rotateKey: vi.fn(),
     listWebhooks: vi.fn(async () => ({ items: [], next_before: null, counts: { pending: 0, delivered: 0, dead: 0 } })),
     resendWebhook: vi.fn(),
+    lookupCustomers: vi.fn(async () => ({ customers: [] })),
+    resendEmail: vi.fn(),
+    rotateUserId: vi.fn(),
+    grantEntitlement: vi.fn(),
+    revokeGrant: vi.fn(),
     ...overrides,
   };
   return client;
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/admin -- test/customers.test.jsx test/grants.test.jsx 2>&1 | grep -E "Test Files|Tests  "
```

Expected: 13 test `customers.test.jsx` và 2 dòng menu (`support`, `admin` chưa có `Khách hàng`) FAIL; `Test Files  2 failed (2)`, `Tests  15 failed | 10 passed (25)`.

- [ ] **Step 3: Implement**

`apps/admin/src/pages/Customers.jsx` (mới):

```jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../auth.jsx';
import { ErrorNote } from '../components/ErrorNote.jsx';
import { fmtTime } from '../format.js';

export const CUSTOMER_REF_RE = /^cus_[0-9A-HJKMNP-TV-Z]{26}$/;
const CHECKOUT_RE = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;

// What the CS person typed → the lookup body: an email, a customer_ref (cus_…) or a checkout id; null otherwise.
export function lookupQuery(text) {
  const t = text.trim();
  if (t.includes('@')) return { email: t };
  if (CUSTOMER_REF_RE.test(t)) return { customer_ref: t };
  if (CHECKOUT_RE.test(t.toUpperCase())) return { checkout_id: t.toUpperCase() };
  return null;
}

// Khách hàng (spec admin-console-p2 §3): one box, three kinds of input. One customer opens its page (the URL
// carries the customer_ref, never the email); several are listed.
export function Customers() {
  const { client } = useAuth();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [found, setFound] = useState(null);
  const [hint, setHint] = useState('');
  const [error, setError] = useState(null);

  const search = async () => {
    setError(null);
    setHint('');
    setFound(null);
    const query = lookupQuery(text);
    if (!query) {
      setHint('Nhập email, cus_… hoặc checkout id (26 ký tự).');
      return;
    }
    try {
      const { customers } = await client.lookupCustomers(query);
      if (customers.length === 1) navigate(`/customers/${customers[0].customer_ref}`);
      else setFound(customers);
    } catch (err) {
      setError(err);
    }
  };

  return (
    <section>
      <h1>Khách hàng</h1>
      <form className="row" onSubmit={(e) => { e.preventDefault(); search(); }}>
        <input aria-label="Tìm khách" placeholder="email, cus_… hoặc checkout id" value={text} onChange={(e) => setText(e.target.value)} />
        <button type="submit" className="primary">Tìm</button>
      </form>
      {hint && <p className="warn">{hint}</p>}
      <ErrorNote error={error} />
      {found && !found.length && <p className="muted">Không tìm thấy khách.</p>}
      {found?.length > 1 && (
        <table>
          <thead>
            <tr><th>customer_ref</th><th>Tạo lúc</th><th>Quyền đang bật</th></tr>
          </thead>
          <tbody>
            {found.map((c) => (
              <tr key={c.customer_ref} data-testid="customer">
                <td><Link to={`/customers/${c.customer_ref}`}>{c.customer_ref}</Link></td>
                <td>{fmtTime(c.created_at)}</td>
                <td>{c.entitlements.filter((e) => e.active).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
```

`apps/admin/src/pages/CustomerDetail.jsx` (mới):

```jsx
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useAuth } from '../auth.jsx';
import { ErrorNote } from '../components/ErrorNote.jsx';
import { FieldErrors } from '../components/FieldErrors.jsx';
import { RoleButton } from '../components/RoleButton.jsx';
import { fmtMoney, fmtTime } from '../format.js';

function Dialog({ label, children }) {
  return <div role="dialog" aria-modal="true" aria-label={label} className="dialog">{children}</div>;
}

function GrantDialog({ customerRef, onClose, onDone }) {
  const { client } = useAuth();
  const [apps, setApps] = useState([]);
  const [draft, setDraft] = useState({ app_id: '', key: 'premium', until: '', reason: '' });
  const [error, setError] = useState(null);
  useEffect(() => {
    client.listApps().then((r) => {
      setApps(r.apps);
      setDraft((d) => ({ ...d, app_id: d.app_id || r.apps[0]?.id || '' }));
    }, setError);
  }, [client]);
  const confirm = async () => {
    setError(null);
    try {
      onDone(await client.grantEntitlement(customerRef, {
        app_id: draft.app_id,
        key: draft.key.trim(),
        // A date means "until the end of that day, UTC".
        expires_at: draft.until ? new Date(`${draft.until}T23:59:59Z`).toISOString() : null,
        reason: draft.reason.trim(),
      }));
    } catch (err) {
      setError(err);
    }
  };
  const set = (k) => (e) => setDraft({ ...draft, [k]: e.target.value });
  return (
    <Dialog label="Cấp quyền">
      <h3>Cấp quyền thủ công</h3>
      <div className="form">
        <label>App<select aria-label="App" value={draft.app_id} onChange={set('app_id')}>{apps.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.id})</option>)}</select></label>
        <label>Key<input aria-label="Key" value={draft.key} onChange={set('key')} /></label>
        <label>Hết hạn (UTC, bỏ trống = không hết hạn)<input aria-label="Hết hạn (UTC, bỏ trống = không hết hạn)" type="date" value={draft.until} onChange={set('until')} /></label>
        <label>Lý do<input aria-label="Lý do" maxLength={200} value={draft.reason} onChange={set('reason')} placeholder="ticket CS, lý do" /></label>
      </div>
      <ErrorNote error={error} />
      <FieldErrors error={error} />
      <div className="row">
        <button type="button" className="primary" disabled={!draft.app_id || !draft.reason.trim()} onClick={confirm}>Xác nhận cấp quyền</button>
        <button type="button" onClick={onClose}>Huỷ</button>
      </div>
    </Dialog>
  );
}

function ConfirmDialog({ label, text, button, run, onClose, onDone }) {
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      onDone(await run());
    } catch (err) {
      setError(err);
      setBusy(false);
    }
  };
  return (
    <Dialog label={label}>
      <h3>{label}</h3>
      <p>{text}</p>
      <ErrorNote error={error} />
      <div className="row">
        <button type="button" className="primary" disabled={busy} onClick={confirm}>{button}</button>
        <button type="button" onClick={onClose}>Huỷ</button>
      </div>
    </Dialog>
  );
}

const sourceLabel = (e) => (e.source === 'manual' ? `thủ công #${e.source_id}` : `${e.source} ${e.source_id}`);

// One customer (spec admin-console-p2 §3). Never the user_id: the API does not send it and this page renders
// only the fields it names.
export function CustomerDetail() {
  const { ref } = useParams();
  const { client } = useAuth();
  const [c, setC] = useState(undefined);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');
  const [dialog, setDialog] = useState(null); // 'grant' | 'rotate' | {revoke: grant}

  const load = useCallback(async () => {
    try {
      const { customers } = await client.lookupCustomers({ customer_ref: ref });
      setC(customers[0] ?? null);
    } catch (err) {
      setError(err);
    }
  }, [client, ref]);
  useEffect(() => {
    load();
  }, [load]);

  if (c === undefined) return error ? <ErrorNote error={error} /> : <p className="muted">Đang tải…</p>;
  if (c === null) return <p className="muted">Không có khách {ref}.</p>;
  const done = (text) => {
    setDialog(null);
    setNotice(text);
    load();
  };
  const resend = async () => {
    setError(null);
    try {
      const r = await client.resendEmail(ref);
      done(`Đã xếp hàng gửi lại email link app (checkout ${r.checkout_id}).`);
    } catch (err) {
      setError(err);
    }
  };
  const reasonOf = (e) => (e.source === 'manual' ? c.manual_grants.find((g) => String(g.id) === e.source_id)?.reason ?? '' : '');

  return (
    <section>
      <h1>{c.customer_ref}</h1>
      {notice && <p className="ok">{notice}</p>}
      <ErrorNote error={error} />
      <p><Link to={`/audit?target=customer:${c.customer_ref}`}>Xem audit</Link></p>

      <section className="card" aria-label="Tóm tắt">
        <h2>Tóm tắt</h2>
        <p>Tạo lúc: {fmtTime(c.created_at)} · Paddle: {c.paddle_customer_id} · user_id cấp lại lúc: {fmtTime(c.user_id_rotated_at)}</p>
      </section>

      <section className="card" aria-label="Quyền">
        <h2>Quyền</h2>
        {c.entitlements.length === 0 ? <p className="muted">Không có quyền nào.</p> : (
          <table>
            <thead><tr><th>App/key</th><th>Trạng thái</th><th>Hết hạn</th><th>Nguồn</th><th>Lý do</th></tr></thead>
            <tbody>
              {c.entitlements.map((e) => (
                <tr key={`${e.app_id}/${e.key}`} data-testid="entitlement">
                  <td>{e.app_id}/{e.key}</td>
                  <td>{e.active ? 'active' : 'off'}</td>
                  <td>{fmtTime(e.expires_at)}</td>
                  <td>{e.source === 'manual' ? <span className="badge warn">{sourceLabel(e)}</span> : sourceLabel(e)}</td>
                  <td>{reasonOf(e)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {c.manual_grants.length > 0 && (
          <>
            <h3>Cấp thủ công</h3>
            <table>
              <thead><tr><th>#</th><th>App/key</th><th>Hết hạn</th><th>Lý do</th><th>Bởi</th><th>Thu hồi</th></tr></thead>
              <tbody>
                {c.manual_grants.map((g) => (
                  <tr key={g.id} data-testid="grant">
                    <td>#{g.id}</td>
                    <td>{g.app_id}/{g.key}</td>
                    <td>{fmtTime(g.expires_at)}</td>
                    <td>{g.reason}</td>
                    <td>{g.granted_by}</td>
                    <td>
                      {g.revoked_at
                        ? `${fmtTime(g.revoked_at)} (${g.revoked_by})`
                        : <RoleButton need="admin" onClick={() => setDialog({ revoke: g })}>{`Thu hồi #${g.id}`}</RoleButton>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>

      <section className="card" aria-label="Mua hàng">
        <h2>Mua hàng</h2>
        {c.checkouts.length === 0 ? <p className="muted">Không có checkout đã thanh toán.</p> : (
          <table>
            <thead><tr><th>Checkout</th><th>Funnel</th><th>Trạng thái</th><th>Số tiền</th><th>Lúc</th></tr></thead>
            <tbody>
              {c.checkouts.map((k) => (
                <tr key={k.id}>
                  <td>{k.id}</td>
                  <td>{`${k.funnel}@v${k.v} ${k.plan_key}`}</td>
                  <td>{k.status}</td>
                  <td>{fmtMoney(k.amount_minor, k.currency)}</td>
                  <td>{fmtTime(k.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {c.subscriptions.length > 0 && (
          <table>
            <thead><tr><th>Subscription</th><th>Funnel</th><th>Trạng thái</th><th>Kỳ hiện tại tới</th><th>Huỷ lúc</th></tr></thead>
            <tbody>
              {c.subscriptions.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{`${s.funnel ?? '—'} ${s.plan_key ?? ''}`.trim()}</td>
                  <td>{s.status}</td>
                  <td>{fmtTime(s.current_period_end)}</td>
                  <td>{fmtTime(s.canceled_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="card" aria-label="Link app">
        <h2>Link app</h2>
        {c.links.length === 0 ? <p className="muted">Chưa liên kết app nào (app dùng IKameSDK không cần link).</p> : (
          <table>
            <tbody>
              {c.links.map((l) => (
                <tr key={`${l.app_id}/${l.app_user_id}/${l.linked_at}`}>
                  <td>{`${l.app_id}/${l.app_user_id}`}</td>
                  <td>từ {fmtTime(l.linked_at)}</td>
                  <td>{l.revoked_at ? `thu hồi ${fmtTime(l.revoked_at)}` : 'đang dùng'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="card" aria-label="Webhook">
        <h2>Webhook (20 mới nhất)</h2>
        {c.deliveries.length === 0 ? <p className="muted">Không có webhook.</p> : (
          <table>
            <tbody>
              {c.deliveries.map((d) => (
                <tr key={d.event_id}>
                  <td>{d.event_id}</td>
                  <td>{d.type}</td>
                  <td>{`${d.app_id}/${d.app_user_id}`}</td>
                  <td>{d.status} ({d.attempts})</td>
                  <td>{fmtTime(d.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="card" aria-label="Email link app">
        <h2>Email link app</h2>
        <p>
          {c.claim
            ? `checkout ${c.claim.checkout_id}: ${c.claim.emailed_at ? `gửi lúc ${fmtTime(c.claim.emailed_at)}` : 'chưa gửi'}, ${c.claim.email_attempts} lần, link hết hạn ${fmtTime(c.claim.expires_at)}`
            : 'Chưa có email link app.'}
        </p>
        <RoleButton need="support" disabled={!c.has_email || !c.claim} title={!c.has_email ? 'Khách không có email' : undefined} onClick={resend}>Gửi lại</RoleButton>
      </section>

      <section className="card" aria-label="Hành động admin">
        <h2>Hành động admin</h2>
        <div className="row">
          <RoleButton need="admin" onClick={() => setDialog('grant')}>Cấp quyền</RoleButton>
          <RoleButton need="admin" onClick={() => setDialog('rotate')}>Cấp lại user_id</RoleButton>
        </div>
      </section>

      {dialog === 'grant' && (
        <GrantDialog customerRef={c.customer_ref} onClose={() => setDialog(null)} onDone={(r) => done(`Đã cấp ${r.grant.app_id}/${r.grant.key} (grant ${r.grant.id}).`)} />
      )}
      {dialog === 'rotate' && (
        <ConfirmDialog
          label="Cấp lại user_id"
          text="Mọi app đã cài của khách về FREE cho tới khi khách mở link mới trong email gửi lại. Link cũ hết tác dụng ngay; trang claim (60 phút sau mua) cũng trả link mới."
          button="Xác nhận cấp lại user_id"
          run={() => client.rotateUserId(c.customer_ref)}
          onClose={() => setDialog(null)}
          onDone={(r) => done(`Đã cấp lại user_id lúc ${fmtTime(r.rotated_at)}; ${r.email_queued ? 'email với link mới đã xếp hàng gửi.' : 'KHÔNG gửi được email (khách không có email hoặc chưa có email link app).'}`)}
        />
      )}
      {dialog?.revoke && (
        <ConfirmDialog
          label={`Thu hồi grant #${dialog.revoke.id}`}
          text={`${dialog.revoke.app_id}/${dialog.revoke.key}: quyền tắt ngay, app được báo qua webhook.`}
          button="Xác nhận thu hồi"
          run={() => client.revokeGrant(c.customer_ref, dialog.revoke.id)}
          onClose={() => setDialog(null)}
          onDone={() => done(`Đã thu hồi grant #${dialog.revoke.id}.`)}
        />
      )}
    </section>
  );
}
```

`apps/admin/src/{api.js, App.jsx, Layout.jsx, pages/Audit.jsx}` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/src/App.jsx b/apps/admin/src/App.jsx
index 5e9d188..6de598f 100644
--- a/apps/admin/src/App.jsx
+++ b/apps/admin/src/App.jsx
@@ -5,6 +5,8 @@ import { RequireGrant } from './components/RequireGrant.jsx';
 import { AppDetail } from './pages/AppDetail.jsx';
 import { Apps } from './pages/Apps.jsx';
 import { Audit } from './pages/Audit.jsx';
+import { CustomerDetail } from './pages/CustomerDetail.jsx';
+import { Customers } from './pages/Customers.jsx';
 import { Domains } from './pages/Domains.jsx';
 import { FunnelDetail } from './pages/FunnelDetail.jsx';
 import { Funnels } from './pages/Funnels.jsx';
@@ -22,6 +24,8 @@ export function App({ client }) {
           <Route path="/funnels/:slug" element={<FunnelDetail />} />
           <Route path="/apps" element={<RequireGrant need="apps:read"><Apps /></RequireGrant>} />
           <Route path="/apps/:id" element={<RequireGrant need="apps:read"><AppDetail /></RequireGrant>} />
+          <Route path="/customers" element={<RequireGrant need="support"><Customers /></RequireGrant>} />
+          <Route path="/customers/:ref" element={<RequireGrant need="support"><CustomerDetail /></RequireGrant>} />
           <Route path="/domains" element={<Domains />} />
           <Route path="/audit" element={<Audit />} />
           <Route path="/settings/users" element={<Users />} />
diff --git a/apps/admin/src/Layout.jsx b/apps/admin/src/Layout.jsx
index b0a34dc..6382b49 100644
--- a/apps/admin/src/Layout.jsx
+++ b/apps/admin/src/Layout.jsx
@@ -6,6 +6,7 @@ import { can } from './roles.js';
 export const NAV = [
   { to: '/funnels', label: 'Funnels', need: 'viewer' },
   { to: '/apps', label: 'Apps', need: 'apps:read' },
+  { to: '/customers', label: 'Khách hàng', need: 'support' },
   { to: '/domains', label: 'Domains', need: 'viewer' },
   { to: '/audit', label: 'Audit', need: 'viewer' },
   { to: '/settings/users', label: 'Settings', need: 'admin' },
diff --git a/apps/admin/src/api.js b/apps/admin/src/api.js
index 92b89e8..d49999b 100644
--- a/apps/admin/src/api.js
+++ b/apps/admin/src/api.js
@@ -103,6 +103,12 @@ export function createClient({ base = API_BASE, fetch = (...a) => globalThis.fet
     getPrices: (slug) => call('GET', `/v1/funnels/${q(slug)}/prices`),
     setPrices: (slug, plans) => call('PUT', `/v1/funnels/${q(slug)}/prices`, { plans }),
     listPaddlePrices: () => call('GET', '/v1/paddle/prices'),
+    // POST: an email stays out of URLs and access logs. query = {email} | {customer_ref} | {checkout_id}.
+    lookupCustomers: (query) => call('POST', '/v1/customers/lookup', query),
+    resendEmail: (ref) => call('POST', `/v1/customers/${q(ref)}/resend-email`),
+    rotateUserId: (ref) => call('POST', `/v1/customers/${q(ref)}/rotate-user-id`),
+    grantEntitlement: (ref, body) => call('POST', `/v1/customers/${q(ref)}/grants`, body),
+    revokeGrant: (ref, id) => call('DELETE', `/v1/customers/${q(ref)}/grants/${id}`),
     listUsers: () => call('GET', '/v1/admin/users'),
     createUser: (body) => call('POST', '/v1/admin/users', body),
     updateUser: (id, body) => call('PUT', `/v1/admin/users/${id}`, body),
diff --git a/apps/admin/src/pages/Audit.jsx b/apps/admin/src/pages/Audit.jsx
index 88cf269..32b07a8 100644
--- a/apps/admin/src/pages/Audit.jsx
+++ b/apps/admin/src/pages/Audit.jsx
@@ -4,7 +4,7 @@ import { useAuth } from '../auth.jsx';
 import { ErrorNote } from '../components/ErrorNote.jsx';
 import { fmtTime } from '../format.js';
 
-const ACTIONS = ['', 'version', 'route', 'domain', 'funnel', 'app', 'token', 'admin.user', 'auth'];
+const ACTIONS = ['', 'version', 'route', 'domain', 'funnel', 'app', 'webhook', 'customer', 'entitlement', 'billing', 'token', 'admin.user', 'auth'];
 const details = (d) => Object.entries(d).map(([k, v]) => `${k}=${v !== null && typeof v === 'object' ? JSON.stringify(v) : v}`).join(' ');
 
 // Who did what (spec §5.5): newest first, filter by funnel:<slug> / domain:<host> and action family.
@@ -38,7 +38,7 @@ export function Audit() {
       <h1>Audit</h1>
       <div className="row">
         <label htmlFor="audit-target">Đối tượng</label>
-        <input id="audit-target" placeholder="funnel:slug hoặc domain:host" value={target} onChange={(e) => setTarget(e.target.value)} />
+        <input id="audit-target" placeholder="funnel:slug, domain:host, customer:cus_…" value={target} onChange={(e) => setTarget(e.target.value)} />
         <label htmlFor="audit-action">Hành động</label>
         <select id="audit-action" value={action} onChange={(e) => setAction(e.target.value)}>
           {ACTIONS.map((a) => <option key={a} value={a}>{a || 'tất cả'}</option>)}
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/admin 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Test Files  11 passed (11)`, `Tests  87 passed (87)` (test cũ Audit không đổi).

- [ ] **Step 5: Commit**

```bash
git add apps/admin
git commit -m "feat(admin): Khách hàng: search by email | cus_… | checkout id, customer page (entitlements, purchases, links, webhooks, app-link email), resend, grant, revoke, rotate user_id"
```

---

### Task 13: SPA **Billing** (reconcile 24 h / 7 d / 30 d, outbox) + menu đủ thứ tự spec

**Files:**
- Create: `apps/admin/src/pages/Billing.jsx`
- Modify: `apps/admin/src/{api.js, App.jsx, Layout.jsx}`
- Test: `apps/admin/test/billing.test.jsx` (mới); Modify: `apps/admin/test/{helpers.jsx, grants.test.jsx}`

**Interfaces:**
- Consumes: `POST /v1/billing/reconcile {since_seconds}` (→ `{since, checked, missing, stale, adjustments_checked, adjustments_missing, enqueued}`), `GET /v1/billing/outbox?topic&before_id` (→ `{items}`, trang 50).
- Produces: client `reconcile(sinceSeconds)`, `listOutbox({topic, before_id})`. `Billing` (route `/billing`, `admin`): `section` `Reconcile` (chọn `Khoảng` 86400/604800/2592000, nút `Chạy reconcile`, `data-testid="reconcile-result"`), `section` `Outbox` (ô `Topic`, nút `Lọc`, `data-testid="outbox"`, `Tải thêm` khi trang đầy 50). Menu cuối cùng: Funnels · Apps · Khách hàng · Domains · Billing · Audit · Settings.

- [ ] **Step 1: Viết test fail**

`apps/admin/test/billing.test.jsx` (mới):

```jsx
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { ApiError } from '../src/api.js';
import { fakeClient, renderApp, ME } from './helpers.jsx';

const item = (id, o = {}) => ({ id, topic: 'payment.succeeded', aggregate_id: `txn_${id}`, payload: {}, created_at: '2026-10-11T08:00:00.000Z', published_at: '2026-10-11T08:00:02.000Z', ...o });
const page = (from, n) => Array.from({ length: n }, (_, i) => item(from - i));

// Spec admin-console-p2 §3: Billing (admin): reconcile 24 h / 7 d / 30 d, outbox by topic with a cursor.
describe('Billing', () => {
  it('reconcile: pick the window, run, see the counts', async () => {
    const client = fakeClient(ME.admin, {
      reconcile: vi.fn(async () => ({ since: '2026-10-04T08:00:00.000Z', checked: 12, missing: 1, stale: 2, adjustments_checked: 3, adjustments_missing: 1, enqueued: 4 })),
    });
    renderApp(client, '/billing');
    const card = await screen.findByRole('region', { name: 'Reconcile' });
    expect([...within(card).getByLabelText('Khoảng').options].map((o) => [o.value, o.textContent])).toEqual([
      ['86400', '24 giờ'], ['604800', '7 ngày'], ['2592000', '30 ngày'],
    ]);
    fireEvent.change(within(card).getByLabelText('Khoảng'), { target: { value: '604800' } });
    fireEvent.click(within(card).getByRole('button', { name: 'Chạy reconcile' }));
    await waitFor(() => expect(client.reconcile).toHaveBeenCalledWith(604800));
    expect((await within(card).findByTestId('reconcile-result')).textContent).toBe(
      'Từ 2026-10-04 08:00: 12 giao dịch, thiếu 1, cũ 2; hoàn tiền/chargeback 3, thiếu 1. Đã xếp hàng đồng bộ 4.',
    );
  });

  it('reconcile errors are shown (Paddle down)', async () => {
    renderApp(fakeClient(ME.admin, { reconcile: vi.fn(async () => { throw new ApiError(503, { error: 'paddle_unavailable' }); }) }), '/billing');
    fireEvent.click(await screen.findByRole('button', { name: 'Chạy reconcile' }));
    expect((await screen.findByRole('alert')).textContent).toBe('Lỗi máy chủ (paddle_unavailable).');
  });

  it('outbox: newest first; filter by topic; Tải thêm with before_id while pages are full', async () => {
    const listOutbox = vi.fn(async ({ topic, before_id: before }) => {
      if (topic) return { items: [item(9, { topic, published_at: null })] };
      return { items: before ? page(before - 1, 3) : page(60, 50) };
    });
    renderApp(fakeClient(ME.admin, { listOutbox }), '/billing');
    const card = await screen.findByRole('region', { name: 'Outbox' });
    await waitFor(() => expect(within(card).getAllByTestId('outbox')).toHaveLength(50));
    expect([...within(card).getAllByTestId('outbox')[0].querySelectorAll('td')].map((td) => td.textContent)).toEqual([
      '60', '2026-10-11 08:00', 'payment.succeeded', 'txn_60', 'đã gửi 2026-10-11 08:00',
    ]);
    fireEvent.click(within(card).getByRole('button', { name: 'Tải thêm' }));
    await waitFor(() => expect(within(card).getAllByTestId('outbox')).toHaveLength(53));
    expect(listOutbox).toHaveBeenLastCalledWith({ topic: undefined, before_id: 11 });
    expect(within(card).queryByRole('button', { name: 'Tải thêm' })).toBeNull();
    fireEvent.change(within(card).getByLabelText('Topic'), { target: { value: 'payment.refunded' } });
    fireEvent.click(within(card).getByRole('button', { name: 'Lọc' }));
    await waitFor(() => expect(within(card).getAllByTestId('outbox')).toHaveLength(1));
    expect(within(card).getByTestId('outbox').lastChild.textContent).toBe('chờ gửi');
    expect(listOutbox).toHaveBeenLastCalledWith({ topic: 'payment.refunded', before_id: undefined });
  });

  it.each(['support', 'editor', 'viewer'])('%s: no Billing in the menu, the page needs admin, nothing is called', async (role) => {
    const client = fakeClient(ME[role]);
    renderApp(client, '/billing');
    expect(await screen.findByText('Cần quyền admin.')).toBeTruthy();
    expect(within(screen.getByRole('navigation')).queryByRole('link', { name: 'Billing' })).toBeNull();
    expect(client.listOutbox).not.toHaveBeenCalled();
  });
});
```

`apps/admin/test/{helpers.jsx, grants.test.jsx}` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/test/grants.test.jsx b/apps/admin/test/grants.test.jsx
index ea3d044..fdc20f4 100644
--- a/apps/admin/test/grants.test.jsx
+++ b/apps/admin/test/grants.test.jsx
@@ -54,7 +54,7 @@ describe('nav by grants', () => {
     ['viewer', ['Funnels', 'Domains', 'Audit']],
     ['support', ['Funnels', 'Khách hàng', 'Domains', 'Audit']],
     ['editor', ['Funnels', 'Apps', 'Domains', 'Audit']],
-    ['admin', ['Funnels', 'Apps', 'Khách hàng', 'Domains', 'Audit', 'Settings']],
+    ['admin', ['Funnels', 'Apps', 'Khách hàng', 'Domains', 'Billing', 'Audit', 'Settings']],
   ])('%s sees %j', async (role, items) => {
     expect(await navOf(ME[role])).toEqual(items);
   });
diff --git a/apps/admin/test/helpers.jsx b/apps/admin/test/helpers.jsx
index d90521b..d34243c 100644
--- a/apps/admin/test/helpers.jsx
+++ b/apps/admin/test/helpers.jsx
@@ -49,6 +49,8 @@ export function fakeClient(me = ME.admin, overrides = {}) {
     rotateUserId: vi.fn(),
     grantEntitlement: vi.fn(),
     revokeGrant: vi.fn(),
+    reconcile: vi.fn(),
+    listOutbox: vi.fn(async () => ({ items: [] })),
     ...overrides,
   };
   return client;
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/admin -- test/billing.test.jsx test/grants.test.jsx 2>&1 | grep -E "Test Files|Tests  "
```

Expected: 6 test `Billing` và dòng menu `admin` FAIL; `Test Files  2 failed (2)`, `Tests  7 failed | 11 passed (18)`.

- [ ] **Step 3: Implement**

`apps/admin/src/pages/Billing.jsx` (mới):

```jsx
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth.jsx';
import { ErrorNote } from '../components/ErrorNote.jsx';
import { RoleButton } from '../components/RoleButton.jsx';
import { fmtTime } from '../format.js';

const WINDOWS = [[86400, '24 giờ'], [7 * 86400, '7 ngày'], [30 * 86400, '30 ngày']];
const OUTBOX_PAGE = 50; // the API's default page size: a full page may have more behind it

function Reconcile() {
  const { client } = useAuth();
  const [since, setSince] = useState(WINDOWS[0][0]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const run = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      setResult(await client.reconcile(since));
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="card" aria-label="Reconcile">
      <h2>Reconcile</h2>
      <p className="muted">So giao dịch Paddle trong khoảng đã chọn với DB; thiếu hay cũ thì xếp hàng đồng bộ lại.</p>
      <div className="row">
        <label htmlFor="rc-since">Khoảng</label>
        <select id="rc-since" value={since} onChange={(e) => setSince(Number(e.target.value))}>
          {WINDOWS.map(([s, label]) => <option key={s} value={s}>{label}</option>)}
        </select>
        <RoleButton need="admin" className="primary" disabled={busy} onClick={run}>Chạy reconcile</RoleButton>
        {busy && <span className="muted">Đang chạy…</span>}
      </div>
      {result && (
        <p data-testid="reconcile-result">
          {`Từ ${fmtTime(result.since)}: ${result.checked} giao dịch, thiếu ${result.missing}, cũ ${result.stale}; hoàn tiền/chargeback ${result.adjustments_checked}, thiếu ${result.adjustments_missing}. Đã xếp hàng đồng bộ ${result.enqueued}.`}
        </p>
      )}
      <ErrorNote error={error} />
    </section>
  );
}

function Outbox() {
  const { client } = useAuth();
  const [topic, setTopic] = useState('');
  const [filter, setFilter] = useState('');
  const [items, setItems] = useState(null);
  const [more, setMore] = useState(false);
  const [error, setError] = useState(null);
  const load = useCallback(async (before) => {
    setError(null);
    try {
      const r = await client.listOutbox({ topic: filter || undefined, before_id: before });
      setItems((prev) => (before ? [...prev, ...r.items] : r.items));
      setMore(r.items.length === OUTBOX_PAGE);
    } catch (err) {
      setError(err);
    }
  }, [client, filter]);
  useEffect(() => {
    load(undefined);
  }, [load]);
  return (
    <section className="card" aria-label="Outbox">
      <h2>Outbox</h2>
      <div className="row">
        <label htmlFor="ob-topic">Topic</label>
        <input id="ob-topic" placeholder="payment.succeeded" value={topic} onChange={(e) => setTopic(e.target.value)} />
        <button type="button" onClick={() => setFilter(topic.trim())}>Lọc</button>
      </div>
      <ErrorNote error={error} />
      {items === null ? <p className="muted">Đang tải…</p> : (
        <table>
          <thead><tr><th>id</th><th>Lúc (UTC)</th><th>Topic</th><th>Aggregate</th><th>Gửi</th></tr></thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} data-testid="outbox">
                <td>{i.id}</td>
                <td>{fmtTime(i.created_at)}</td>
                <td>{i.topic}</td>
                <td>{i.aggregate_id}</td>
                <td>{i.published_at ? `đã gửi ${fmtTime(i.published_at)}` : 'chờ gửi'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {more && <button type="button" onClick={() => load(items.at(-1).id)}>Tải thêm</button>}
    </section>
  );
}

// Billing (spec admin-console-p2 §3): admins only.
export function Billing() {
  return (
    <section>
      <h1>Billing</h1>
      <Reconcile />
      <Outbox />
    </section>
  );
}
```

`apps/admin/src/{api.js, App.jsx, Layout.jsx}` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/src/App.jsx b/apps/admin/src/App.jsx
index 6de598f..cf378a7 100644
--- a/apps/admin/src/App.jsx
+++ b/apps/admin/src/App.jsx
@@ -5,6 +5,7 @@ import { RequireGrant } from './components/RequireGrant.jsx';
 import { AppDetail } from './pages/AppDetail.jsx';
 import { Apps } from './pages/Apps.jsx';
 import { Audit } from './pages/Audit.jsx';
+import { Billing } from './pages/Billing.jsx';
 import { CustomerDetail } from './pages/CustomerDetail.jsx';
 import { Customers } from './pages/Customers.jsx';
 import { Domains } from './pages/Domains.jsx';
@@ -27,6 +28,7 @@ export function App({ client }) {
           <Route path="/customers" element={<RequireGrant need="support"><Customers /></RequireGrant>} />
           <Route path="/customers/:ref" element={<RequireGrant need="support"><CustomerDetail /></RequireGrant>} />
           <Route path="/domains" element={<Domains />} />
+          <Route path="/billing" element={<RequireGrant need="admin"><Billing /></RequireGrant>} />
           <Route path="/audit" element={<Audit />} />
           <Route path="/settings/users" element={<Users />} />
           <Route path="*" element={<p className="muted">Chọn một mục bên trái.</p>} />
diff --git a/apps/admin/src/Layout.jsx b/apps/admin/src/Layout.jsx
index 6382b49..54a8207 100644
--- a/apps/admin/src/Layout.jsx
+++ b/apps/admin/src/Layout.jsx
@@ -8,6 +8,7 @@ export const NAV = [
   { to: '/apps', label: 'Apps', need: 'apps:read' },
   { to: '/customers', label: 'Khách hàng', need: 'support' },
   { to: '/domains', label: 'Domains', need: 'viewer' },
+  { to: '/billing', label: 'Billing', need: 'admin' },
   { to: '/audit', label: 'Audit', need: 'viewer' },
   { to: '/settings/users', label: 'Settings', need: 'admin' },
 ];
diff --git a/apps/admin/src/api.js b/apps/admin/src/api.js
index d49999b..ccecf37 100644
--- a/apps/admin/src/api.js
+++ b/apps/admin/src/api.js
@@ -109,6 +109,11 @@ export function createClient({ base = API_BASE, fetch = (...a) => globalThis.fet
     rotateUserId: (ref) => call('POST', `/v1/customers/${q(ref)}/rotate-user-id`),
     grantEntitlement: (ref, body) => call('POST', `/v1/customers/${q(ref)}/grants`, body),
     revokeGrant: (ref, id) => call('DELETE', `/v1/customers/${q(ref)}/grants/${id}`),
+    reconcile: (sinceSeconds) => call('POST', '/v1/billing/reconcile', { since_seconds: sinceSeconds }),
+    listOutbox: ({ topic, before_id: before } = {}) => {
+      const qs = new URLSearchParams({ ...(topic && { topic }), ...(before && { before_id: String(before) }) }).toString();
+      return call('GET', `/v1/billing/outbox${qs ? `?${qs}` : ''}`);
+    },
     listUsers: () => call('GET', '/v1/admin/users'),
     createUser: (body) => call('POST', '/v1/admin/users', body),
     updateUser: (id, body) => call('PUT', `/v1/admin/users/${id}`, body),
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS + build**

```bash
npm test -w @ikf/admin 2>&1 | grep -E "Test Files|Tests  "
VITE_API_BASE=https://api.ikf-staging.example npm run build -w @ikf/admin 2>&1 | tail -2
```

Expected: `Test Files  12 passed (12)`, `Tests  93 passed (93)`; build `✓ built` (`dist/` gitignored, không commit). `apps/admin/package.json` không đổi (dependency runtime giữ nguyên).

- [ ] **Step 5: Commit**

```bash
git add apps/admin
git commit -m "feat(admin): Billing (reconcile 24 h / 7 d / 30 d, outbox by topic with a cursor); menu Funnels · Apps · Khách hàng · Domains · Billing · Audit · Settings by grants"
```

---

### Task 14: Demo (seed support, e2e đợt 2), rate limit Cloudflare, runbook, `CLAUDE.md`

**Files:**
- Modify: `demo/lib/{admin,stack}.mjs`, `demo/README.md`, `infra/modules/edge/{main.tf, variables.tf}`, `docs/runbooks/admin-console.md`, `CLAUDE.md`
- Test: `demo/test/admin-p2-e2e.test.mjs` (mới); Modify: `infra/modules/edge/tests/edge.tftest.hcl`

**Interfaces:**
- Consumes: `startStack({…, purchase, adminUser, adminBuildDir, logStream})`, `stack.purchase.{paddle, mailbox}`, `DEMO_TOKEN`, `PG` (`demo/lib/stack.mjs`); `createSession`, `SESSION_COOKIE` (core); `sdk-contract.js`; mọi màn Task 10–13; `listPrices` giả (Task 7).
- Produces: `demo/lib/admin.mjs` `DEMO_SUPPORT_USER = 'support@ikameglobal.com'`, `seedSupportUser(pool, email)`; `startStack` trả thêm `supportUser` (khi có `adminUser`). Terraform edge: biến `rate_limited_prefixes` (mặc định `["/v1/customers/"]`, validation), `rate_limited_paths` thêm `"/v1/paddle/prices"`, luật identity `(… in {…} or starts_with(http.request.uri.path, "/v1/customers/"))`.

- [ ] **Step 1: Viết test fail**

`demo/test/admin-p2-e2e.test.mjs` (mới):

```js
// Admin console phase 2 end to end (spec admin-console-p2 "Điều kiện xong") on the real demo stack with the
// purchase flow (no tunnel, host https://demo.test like purchase.test.mjs), the console in Chromium:
// admin maps prices from the fake Paddle catalog → a buyer pays (fake Paddle) → support finds the customer by
// email → admin grants by hand (the app sees it), revokes → resends the app-link email (inbox) → rotates the
// user_id (old link FREE, new link from the inbox PRO). Own ports and databases; skips without witch-power.
import { existsSync } from 'node:fs';
import { request } from 'node:http';
import { Writable } from 'node:stream';
import { describe, it, expect, afterAll } from 'vitest';
import pg from 'pg';
import { chromium } from 'playwright';
import { createSession, SESSION_COOKIE } from '../../services/core-api/src/admin/sessions.js';
import { PATH, REQUEST_USER_ID_FIELD, RESPONSE_EXPIRES_FIELD, RESPONSE_IS_PRO_FIELD } from '../../services/core-api/src/identity/sdk-contract.js';
import { DEMO_SUPPORT_USER } from '../lib/admin.mjs';
import { DEFAULT_FUNNELS_DIR, findFunnels } from '../lib/funnels.mjs';
import { DEMO_TOKEN, PG, startStack } from '../lib/stack.mjs';

const FUNNELS_DIR = process.env.IKF_FUNNELS_DIR || DEFAULT_FUNNELS_DIR;
const FUNNEL = 'witch-power';
const skipReason = !existsSync(FUNNELS_DIR) ? `funnels folder not found: ${FUNNELS_DIR}` : !(await findFunnels(FUNNELS_DIR)).has(FUNNEL) ? `${FUNNEL} missing` : '';
if (skipReason) console.warn(`admin p2 e2e skipped: ${skipReason}`);

const PORTS = { edge: 8857, core: 8158, media: 8859, proxy: 8858, demo: 8861, admin: 8862 };
const DB = 'ikf_admin_p2_test';
const BASE = 'https://demo.test';
const ADMIN_USER = 'e2e-p2@ikameglobal.com';
// New on every run: the e2e databases keep their data between runs (like admin-e2e.test.mjs).
const EMAIL = `p2-buyer-${Date.now()}@demo.test`;
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const ulid = () => `01${Array.from({ length: 24 }, () => CROCKFORD[Math.floor(Math.random() * 32)]).join('')}`;

// What the tunnel would deliver to the demo proxy (Host demo.test; /v1 calls from the page carry the Origin).
const http = (method, path, body) =>
  new Promise((resolve, reject) => {
    const headers = { host: 'demo.test', ...(path.startsWith('/v1/checkout') && { origin: BASE }), ...(body !== undefined && { 'content-type': 'application/json' }) };
    const req = request({ host: '127.0.0.1', port: PORTS.proxy, method, path, headers }, (res) => {
      let text = '';
      res.on('data', (c) => { text += c; });
      res.on('end', () => resolve({ status: res.statusCode, json: text ? JSON.parse(text) : null }));
    });
    req.on('error', reject);
    req.end(body === undefined ? undefined : JSON.stringify(body));
  });
// core-api directly, with the demo's admin token (what `ikf` would do).
const core = (method, path, body) =>
  fetch(`http://127.0.0.1:${PORTS.core}${path}`, {
    method, headers: { authorization: `Bearer ${DEMO_TOKEN}`, 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body),
  }).then(async (r) => ({ status: r.status, json: await r.json() }));
const until = async (fn, ms) => {
  for (const end = Date.now() + ms; Date.now() < end; await new Promise((r) => setTimeout(r, 250))) {
    const v = await fn();
    if (v) return v;
  }
  return fn();
};
// What the fake app (IKameSDK) sees for a user_id.
const app = async (userId) => {
  const r = (await http('POST', PATH, { [REQUEST_USER_ID_FIELD]: userId })).json;
  return { pro: r[RESPONSE_IS_PRO_FIELD], expires: r[RESPONSE_EXPIRES_FIELD] };
};
const userIdOf = (link) => new URL(new URL(link).searchParams.get('deep_link')).searchParams.get('user_id');

let logs = '';
const logStream = new Writable({ write(chunk, _enc, done) { logs += chunk; done(); } });
let stack;
let browser;
afterAll(async () => {
  await browser?.close();
  await stack?.stop();
});

describe.skipIf(skipReason)('admin console phase 2 e2e', () => {
  it('prices from the catalog → purchase → support looks up → grant, revoke → resend email → rotate user_id', async () => {
    stack = await startStack({
      funnels: [FUNNEL], ports: PORTS, lan: false, pgDatabase: DB, chDatabase: DB, purchase: { base: BASE }, logStream,
      adminUser: ADMIN_USER, adminBuildDir: new URL('../.build/admin-p2/', import.meta.url).pathname,
    });
    expect(stack.supportUser).toBe(DEMO_SUPPORT_USER);
    browser = await chromium.launch();
    const admin = await browser.newPage();
    await admin.goto(`${stack.adminUrl}/funnels/${FUNNEL}`);
    await admin.getByRole('link', { name: 'Đăng nhập bằng Google' }).click();
    await admin.getByRole('heading', { name: FUNNEL }).waitFor();

    // 1. Prices: the demo seeded them; unmap both, then map them again from the fake Paddle catalog in the console.
    expect((await core('PUT', `/v1/funnels/${FUNNEL}/prices`, { plans: { '1w': null, addon: null } })).status).toBe(200);
    await admin.getByRole('tab', { name: 'Giá' }).click();
    const row = (plan) => admin.getByTestId('price-row').filter({ hasText: plan });
    await expect.poll(() => row('1w').locator('td').first().textContent()).toBe('1wChưa có giá');
    await row('1w').getByLabel('Chọn giá cho 1w').selectOption({ label: 'Starlyn premium · Weekly — 13.67 USD/tuần' });
    await row('addon').getByLabel('Chọn giá cho addon').selectOption({ label: 'Starlyn add-on · Tarot reading 2027 — 19.99 USD (một lần)' });
    await row('addon').getByLabel('Entitlement key của addon').fill('tarot_2027');
    await admin.getByRole('button', { name: 'Lưu giá' }).click();
    await admin.getByText('Đã lưu giá.').waitFor();
    expect((await core('GET', `/v1/funnels/${FUNNEL}/prices`)).json).toMatchObject({
      plans: { '1w': { price_id: 'pri_demoweekly0000000000000000', entitlement_key: 'premium' }, addon: { price_id: 'pri_demoaddon00000000000000000', entitlement_key: 'tarot_2027' } },
      unmapped: [],
    });

    // 2. A buyer pays the weekly plan (fake Paddle); the claim page gives the app link with the user_id.
    const v = (await core('GET', `/v1/funnels/${FUNNEL}`)).json.versions[0].v;
    const created = (await http('POST', '/v1/checkout', {
      funnel: FUNNEL, v, plan: '1w', sid: ulid(), email: EMAIL, attribution: {}, turnstile_token: 'XXXX.DUMMY.TOKEN.XXXX',
    })).json;
    await stack.purchase.paddle.pay(created.transaction_id, EMAIL);
    const appLink = await until(async () => {
      const r = await http('GET', `/v1/checkout/${created.checkout_id}/claim`);
      return r.status === 200 && r.json.app_link;
    }, 20_000);
    const oldUid = userIdOf(appLink);
    const bought = await app(oldUid);
    expect(bought.pro).toBe(true);
    expect(bought.expires).not.toBeNull();
    await until(() => stack.purchase.mailbox.list().some((m) => m.to === EMAIL), 10_000);

    // 3. Support (a session for the seeded support person) looks the buyer up by email.
    const db = new pg.Client({ ...PG, database: DB });
    await db.connect();
    let support;
    try {
      const { rows } = await db.query('SELECT id FROM admin_users WHERE email = $1', [DEMO_SUPPORT_USER]);
      support = await createSession(db, { userId: Number(rows[0].id) });
    } finally {
      await db.end();
    }
    const cs = await browser.newContext();
    // domain + path (not url): Chromium refuses a __Host- cookie given by URL over http, even on localhost.
    await cs.addCookies([{ name: SESSION_COOKIE, value: support.token, domain: 'localhost', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
    const csPage = await cs.newPage();
    await csPage.goto(`${stack.adminUrl}/customers`);
    await csPage.getByLabel('Tìm khách').fill(EMAIL);
    await csPage.getByRole('button', { name: 'Tìm' }).click();
    const ref = await csPage.getByRole('heading', { name: /^cus_/ }).textContent();
    const purchases = csPage.getByRole('region', { name: 'Mua hàng' });
    await purchases.getByText(created.checkout_id).waitFor();
    expect(await purchases.getByText(`${FUNNEL}@v${v} 1w`).count()).toBe(1);
    await csPage.getByRole('region', { name: 'Quyền' }).getByText('starlyn/premium').waitFor();
    expect(await csPage.getByRole('region', { name: 'Hành động admin' }).getByRole('button', { name: 'Cấp quyền' }).isDisabled()).toBe(true);
    const csWrite = await fetch(`http://localhost:${PORTS.core}/v1/customers/${ref}/grants`, {
      method: 'POST',
      headers: { cookie: `${SESSION_COOKIE}=${support.token}`, 'x-ikf-csrf': support.csrf, 'content-type': 'application/json' },
      body: JSON.stringify({ app_id: 'starlyn', key: 'premium', reason: 'support may not' }),
    });
    expect(csWrite.status).toBe(403);

    // 4. Admin grants premium with no end: the app now sees it forever; revoking brings back the subscription's end.
    await admin.goto(`${stack.adminUrl}/customers/${ref}`);
    await admin.getByRole('region', { name: 'Hành động admin' }).getByRole('button', { name: 'Cấp quyền' }).click();
    const grant = admin.getByRole('dialog');
    await grant.getByLabel('App').selectOption('starlyn');
    await grant.getByLabel('Lý do').fill('e2e: goodwill');
    await grant.getByRole('button', { name: 'Xác nhận cấp quyền' }).click();
    const granted = await admin.getByText(/^Đã cấp starlyn\/premium \(grant \d+\)\.$/).textContent();
    const grantId = /grant (\d+)/.exec(granted)[1];
    expect(await app(oldUid)).toEqual({ pro: true, expires: null });
    await admin.getByRole('button', { name: `Thu hồi #${grantId}` }).click();
    await admin.getByRole('dialog').getByRole('button', { name: 'Xác nhận thu hồi' }).click();
    await admin.getByText(`Đã thu hồi grant #${grantId}.`).waitFor();
    expect(await app(oldUid)).toEqual(bought);

    // 5. Resend the app-link email: a new one with the same link reaches the inbox.
    const mails = () => stack.purchase.mailbox.list().filter((m) => m.to === EMAIL);
    const before = mails().length;
    await admin.getByRole('region', { name: 'Email link app' }).getByRole('button', { name: 'Gửi lại' }).click();
    await admin.getByText(`Đã xếp hàng gửi lại email link app (checkout ${created.checkout_id}).`).waitFor();
    expect(await until(() => mails().length > before, 10_000)).toBe(true);
    expect(mails()[0].link).toBe(appLink);

    // 6. Rotate the user_id: the installed app (old user_id) is FREE until the new link from the inbox is opened.
    const sent = mails().length;
    await admin.getByRole('region', { name: 'Hành động admin' }).getByRole('button', { name: 'Cấp lại user_id' }).click();
    await admin.getByRole('dialog').getByRole('button', { name: 'Xác nhận cấp lại user_id' }).click();
    await admin.getByText(/^Đã cấp lại user_id lúc .*; email với link mới đã xếp hàng gửi\.$/).waitFor();
    expect(await app(oldUid)).toEqual({ pro: false, expires: null });
    expect(await until(() => mails().length > sent, 10_000)).toBe(true);
    const newUid = userIdOf(mails()[0].link);
    expect(newUid).not.toBe(oldUid);
    expect((await app(newUid)).pro).toBe(true);
    await admin.getByText(/^Tạo lúc: .* user_id cấp lại lúc: \d{4}-/).waitFor();

    // 7. All of it is in the audit, by the admin; no buyer email or user_id in logs or audit.
    await admin.getByRole('link', { name: 'Xem audit' }).click();
    await admin.getByTestId('audit').first().waitFor();
    const actions = await admin.getByTestId('audit').evaluateAll((rows) => rows.map((r) => r.children[2].textContent));
    expect(actions).toEqual(['customer.resend_email', 'customer.rotate_user_id', 'customer.resend_email', 'entitlement.revoke', 'entitlement.grant']);
    const auditText = await admin.locator('table').textContent();
    for (const secret of [EMAIL, oldUid, newUid]) {
      expect(logs).not.toContain(secret);
      expect(auditText).not.toContain(secret);
    }
    await cs.close();
  });
});
```

`infra/modules/edge/tests/edge.tftest.hcl` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/infra/modules/edge/tests/edge.tftest.hcl b/infra/modules/edge/tests/edge.tftest.hcl
index c2ef028..4299e33 100644
--- a/infra/modules/edge/tests/edge.tftest.hcl
+++ b/infra/modules/edge/tests/edge.tftest.hcl
@@ -117,12 +117,33 @@ run "checkout_only_ruleset_fits_the_free_plan" {
 run "paddle_webhook_is_never_rate_limited" {
   command = apply
 
+  # /v1/paddle/prices (admin console catalog) is limited; the webhook path never, not even by a prefix.
   assert {
-    condition     = alltrue([for r in cloudflare_ruleset.ratelimit.rules : !strcontains(r.expression, "/v1/paddle")])
+    condition     = alltrue([for r in cloudflare_ruleset.ratelimit.rules : !strcontains(r.expression, "/v1/paddle/webhook") && !strcontains(r.expression, "\"/v1/paddle/\")")])
     error_message = "Paddle retries webhooks; a rate limit would drop billing events."
   }
 }
 
+run "admin_console_customer_and_catalog_paths_are_rate_limited" {
+  command = apply
+
+  # Spec admin-console-p2 §2: /v1/customers/* (lookup, resend, rotate, grants) and the Paddle price catalog
+  # join the identity rule (50 per 10 s per IP).
+  assert {
+    condition = (
+      strcontains(cloudflare_ruleset.ratelimit.rules[0].expression, "starts_with(http.request.uri.path, \"/v1/customers/\")") &&
+      strcontains(cloudflare_ruleset.ratelimit.rules[0].expression, "\"/v1/paddle/prices\"") &&
+      strcontains(cloudflare_ruleset.ratelimit.rules[0].expression, "\"/v1/otp/send\"")
+    )
+    error_message = "The identity rule must cover /v1/customers/* and /v1/paddle/prices next to the OTP/claim paths."
+  }
+
+  assert {
+    condition     = cloudflare_ruleset.ratelimit.rules[0].expression == "(http.host eq \"api.ikf-staging.example\" and (http.request.uri.path in {\"/v1/otp/send\" \"/v1/otp/verify\" \"/v1/claims/redeem\" \"/v1/magic/redeem\" \"/v1/payment/check-purchased-web-funnel\" \"/v1/paddle/prices\"} or starts_with(http.request.uri.path, \"/v1/customers/\")))"
+    error_message = "Identity rule: exact paths, or a path under one of the prefixes, on the API host."
+  }
+}
+
 run "turnstile_covers_funnel_hosts" {
   command = apply
 
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npx vitest run --config demo/vitest.config.mjs demo/test/admin-p2-e2e.test.mjs 2>&1 | grep -E "×|Error|Tests  "
(cd infra/modules/edge && terraform init -backend=false -input=false >/dev/null && terraform test -no-color | tail -1)
```

Expected: e2e chạy tới bước 3 rồi FAIL `TypeError: Cannot read properties of undefined (reading 'id')` (chưa seed người support; `DEMO_SUPPORT_USER` chưa export), `Tests  1 failed (1)` (Docker + Chromium cần sẵn; chạy một mình, cổng 8857/8158/8859/8858/8861/8862). Terraform `Failure! 11 passed, 1 failed.` (`admin_console_customer_and_catalog_paths_are_rate_limited`).

- [ ] **Step 3: Implement**

`demo/lib/{admin,stack}.mjs`, `infra/modules/edge/{main.tf, variables.tf}` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/demo/lib/admin.mjs b/demo/lib/admin.mjs
index f3b6bd1..aace92a 100644
--- a/demo/lib/admin.mjs
+++ b/demo/lib/admin.mjs
@@ -8,6 +8,9 @@ import { pipeline } from 'node:stream';
 import { build } from 'vite';
 
 export const ADMIN_APP_DIR = new URL('../../apps/admin/', import.meta.url).pathname;
+// A CS person in the demo (spec admin-console-p2 §4): listed in Users; the e2e signs in as them with a session it
+// creates (local sign-in is only for --admin-user, always an admin).
+export const DEMO_SUPPORT_USER = 'support@ikameglobal.com';
 export const ADMIN_BUILD_DIR = new URL('../.build/admin/', import.meta.url).pathname;
 
 export async function buildAdmin({ apiBase, outDir = ADMIN_BUILD_DIR }) {
@@ -61,3 +64,12 @@ export async function startAdminServer({ dir, port = 8792, host = '127.0.0.1' })
     close: () => new Promise((ok) => { server.closeAllConnections(); server.close(() => ok()); }),
   };
 }
+
+// Idempotent; never changes the role of an existing row (someone may have edited it in Users).
+export async function seedSupportUser(pool, email = DEMO_SUPPORT_USER) {
+  await pool.query(
+    "INSERT INTO admin_users (email, name, role, created_by) VALUES ($1, 'Demo support', 'support', 'demo') ON CONFLICT (email) DO NOTHING",
+    [email],
+  );
+  return email;
+}
diff --git a/demo/lib/stack.mjs b/demo/lib/stack.mjs
index b1588ae..7467f0b 100644
--- a/demo/lib/stack.mjs
+++ b/demo/lib/stack.mjs
@@ -8,7 +8,7 @@ import { buildApp } from '../../services/core-api/src/app.js';
 import { ensureToken } from '../../services/core-api/src/auth.js';
 import { migrate } from '../../services/core-api/src/db/migrate.js';
 import { miniflareKv, miniflareStore } from './adapters.mjs';
-import { ADMIN_BUILD_DIR, buildAdmin, startAdminServer } from './admin.mjs';
+import { ADMIN_BUILD_DIR, buildAdmin, seedSupportUser, startAdminServer } from './admin.mjs';
 import { checkPortsFree, composeUp, DemoError, ensureDocker } from './docker.mjs';
 import { DEFAULT_FUNNELS, DEFAULT_FUNNELS_DIR, findFunnels, pickFunnels, publishFunnels } from './funnels.mjs';
 import { startMediaServer } from './media.mjs';
@@ -174,7 +174,9 @@ export async function startStack({
     });
 
     let adminUrl = null;
+    let supportUser = null;
     if (adminUser) {
+      supportUser = await seedSupportUser(pool);
       await buildAdmin({ apiBase: `http://localhost:${ports.core}`, outDir: adminBuildDir });
       const adminServer = await startAdminServer({ dir: adminBuildDir, port: ports.admin });
       stops.push(() => adminServer.close());
@@ -208,6 +210,7 @@ export async function startStack({
       adminToken: DEMO_TOKEN,
       adminUrl,
       adminUser,
+      supportUser,
       pgDatabase,
       chDatabase,
       clickhouse: chRun,
diff --git a/infra/modules/edge/main.tf b/infra/modules/edge/main.tf
index 4808e33..d39b693 100644
--- a/infra/modules/edge/main.tf
+++ b/infra/modules/edge/main.tf
@@ -2,6 +2,7 @@ locals {
   api_fqdn   = "api.${var.zone_name}"
   admin_fqdn = "admin.${var.zone_name}"
   paths      = join(" ", [for p in var.rate_limited_paths : "\"${p}\""])
+  prefixes   = join("", [for p in var.rate_limited_prefixes : " or starts_with(http.request.uri.path, \"${p}\")"])
 }
 
 resource "cloudflare_zone_setting" "ssl" {
@@ -71,8 +72,8 @@ resource "cloudflare_ruleset" "origin_auth" {
 locals {
   ratelimit_api_rules = [
     {
-      description = "Throttle the identity API (OTP, claim, magic link, IKameSDK check-purchased) per IP"
-      expression  = "(http.host eq \"${local.api_fqdn}\" and http.request.uri.path in {${local.paths}})"
+      description = "Throttle the identity API (OTP, claim, magic link, IKameSDK check-purchased, admin console customers and price catalog) per IP"
+      expression  = "(http.host eq \"${local.api_fqdn}\" and (http.request.uri.path in {${local.paths}}${local.prefixes}))"
       action      = "block"
       ratelimit = {
         characteristics     = ["ip.src", "cf.colo.id"]
diff --git a/infra/modules/edge/variables.tf b/infra/modules/edge/variables.tf
index 4bf1b13..c1026c2 100644
--- a/infra/modules/edge/variables.tf
+++ b/infra/modules/edge/variables.tf
@@ -29,9 +29,20 @@ variable "origin_auth_secret" {
 }
 
 variable "rate_limited_paths" {
-  description = "Identity endpoints (exact paths; the rule is an `in` set): the app-backend API and IKameSDK's check-purchased (called on every app open; many users share a NAT IP)."
+  description = "Identity endpoints (exact paths; the rule is an `in` set): the app-backend API, IKameSDK's check-purchased (called on every app open; many users share a NAT IP) and the admin console's Paddle price catalog."
   type        = list(string)
-  default     = ["/v1/otp/send", "/v1/otp/verify", "/v1/claims/redeem", "/v1/magic/redeem", "/v1/payment/check-purchased-web-funnel"]
+  default     = ["/v1/otp/send", "/v1/otp/verify", "/v1/claims/redeem", "/v1/magic/redeem", "/v1/payment/check-purchased-web-funnel", "/v1/paddle/prices"]
+}
+
+variable "rate_limited_prefixes" {
+  description = "Identity endpoints by path prefix (starts_with), for paths with an id in them: the admin console's customer routes. Never a prefix of /v1/paddle/webhook."
+  type        = list(string)
+  default     = ["/v1/customers/"]
+
+  validation {
+    condition     = alltrue([for p in var.rate_limited_prefixes : startswith(p, "/v1/") && endswith(p, "/") && !startswith("/v1/paddle/webhook", p)])
+    error_message = "Prefixes start with /v1/, end with / and never cover /v1/paddle/webhook (Paddle retries; a limit drops billing events)."
+  }
 }
 
 variable "rate_limit_requests_per_10s" {
PATCH
```

Runbook, README demo, `CLAUDE.md` (sửa, áp dụng đúng diff này):

````bash
git apply <<'PATCH'
diff --git a/CLAUDE.md b/CLAUDE.md
index d47e0fd..6043a15 100644
--- a/CLAUDE.md
+++ b/CLAUDE.md
@@ -14,7 +14,7 @@ iKame Funnel Platform (iFunnel): replaces FunnelFox for web2app / web2web funnel
 | `packages/sdk` | `ikf.js` browser SDK (capture, queue, consent, Meta Pixel); `scripts/build.mjs` makes the Worker module |
 | `packages/event-schema` | Event validation + PII scrub, shared by SDK and collector |
 | `packages/route-match` | Path-prefix matching shared by core, Worker, CLI |
-| `packages/funnel-lint` | Static `demo.html` lint (no deps, runs in core, CLI and the SPA) |
+| `packages/funnel-lint` | Static `demo.html` lint and `planKeysFromHtml` (no deps, runs in core, CLI and the SPA) |
 | `packages/cli` | `ikf` CLI |
 | `docs/runbooks/` | Rollout runbooks |
 
@@ -64,7 +64,8 @@ Workflows: `docker run --rm -v "$PWD:/repo" -w /repo rhysd/actionlint:latest`.
 - core-api error handler: `HttpError` → `{error, detail}`; Fastify 4xx → `{error:'bad_request'}`; never leak internals on 500.
 - Secrets are created empty by Terraform; values are set by hand (`aws secretsmanager put-secret-value`, `wrangler secret put`). No secret values in code or state where avoidable.
 - Every change made through the API (token or person) writes `audit_log` in the change's own transaction where it has one (`src/audit.js`); actor = token name or a person's email. Logs carry a person's email only as `email_hash`.
-- Routes declare roles with `requireRole`: token roles `publisher`/`router`/`admin`, people `viewer` ⊂ `editor` ⊂ `admin` (editor satisfies `publisher`, admin everything). A cookie write needs `X-Ikf-Csrf`.
+- Routes declare a grant with `requireRole`: token roles `publisher`/`router`/`admin`, people `viewer`/`support`/`editor`/`admin` through the grants table `USER_GRANTS` in `src/auth.js` (same table as `apps/admin/src/roles.js` `GRANTS`, a test keeps them equal): editor satisfies `publisher`, `prices:read`, `apps:read`; support satisfies `support`; admin everything. A cookie write needs `X-Ikf-Csrf`.
+- The console never receives a buyer's `user_id` or email (customer lookup report v2); customers are named by `customer_ref` (`cus_…`) in URLs, audit and logs.
 - `ADMIN_LOCAL_USER` (sign-in without Google) is local-demo only: `loadConfig`, `buildApp`, the core-service Terraform module and `apps/admin/scripts/deploy-config.js` all refuse it.
 
 ## Process
@@ -73,4 +74,4 @@ Work follows spec → plan → TDD tasks (superpowers skills), one reviewed task
 
 ## Local demo
 
-`npm run demo` runs real funnels locally (Miniflare edge-router + event-consumer, core-api in-process, Postgres + ClickHouse in Docker, compose project `ikf-demo`), plus the admin console at `http://localhost:8792` (local admin from `--admin-user`, default `demo@ikameglobal.com`; publish to `demo.localhost`). Scripts: `npm run demo`, `npm run demo:events`, `npm run demo:purchase` (full purchase flow on a phone: fake Paddle/Turnstile/SES, quick tunnel + QR), `npm run demo:down` (`-- --reset` wipes data), `npm run demo:test` (never two at once: fixed ports). Options, ports and troubleshooting: `demo/README.md`. Code in `demo/` only; it must not change `services/`, `workers/` or `packages/`, except the sanctioned `PADDLE_JS_URL` → `__IKF.paddle.js` hook (edge-router emits it only for `https://` values, the SDK loads only `https:`, and `workers/edge-router/scripts/deploy-config.js` refuses the variable so it never reaches a deployed Worker). Fakes are injected only through `buildApp({deps})` from `demo/lib/purchase.mjs`; nothing in `services/` or `workers/` reads a demo flag.
+`npm run demo` runs real funnels locally (Miniflare edge-router + event-consumer, core-api in-process, Postgres + ClickHouse in Docker, compose project `ikf-demo`), plus the admin console at `http://localhost:8792` (local admin from `--admin-user`, default `demo@ikameglobal.com`; publish to `demo.localhost`; a `support@ikameglobal.com` support user is seeded; prices and customers need the purchase flow: `npm run demo -- --purchase --host https://… --admin-user <email>`). Scripts: `npm run demo`, `npm run demo:events`, `npm run demo:purchase` (full purchase flow on a phone: fake Paddle/Turnstile/SES, quick tunnel + QR), `npm run demo:down` (`-- --reset` wipes data), `npm run demo:test` (never two at once: fixed ports). Options, ports and troubleshooting: `demo/README.md`. Code in `demo/` only; it must not change `services/`, `workers/` or `packages/`, except the sanctioned `PADDLE_JS_URL` → `__IKF.paddle.js` hook (edge-router emits it only for `https://` values, the SDK loads only `https:`, and `workers/edge-router/scripts/deploy-config.js` refuses the variable so it never reaches a deployed Worker). Fakes are injected only through `buildApp({deps})` from `demo/lib/purchase.mjs`; nothing in `services/` or `workers/` reads a demo flag.
diff --git a/demo/README.md b/demo/README.md
index 922f0f6..cc2c12c 100644
--- a/demo/README.md
+++ b/demo/README.md
@@ -82,6 +82,14 @@ ports 8837/8138/8839/8842, databases `ikf_admin_test`); install the browser once
 With `--tunnel` (`npm run demo:purchase`) the console is off unless you pass `--admin-user` yourself; even then it
 stays on `http://localhost:8792` → `http://localhost:8080`, and the tunnel's proxy refuses every admin request.
 
+Phase 2 screens (spec admin-console-p2): **Giá**, **Khách hàng** and **Billing** need the fake Paddle, so run the
+purchase flow with the console (`npm run demo -- --purchase --tunnel --admin-user demo@ikameglobal.com`). The fake
+catalog has three prices (`Weekly`, `Tarot reading 2027`, one archived `Weekly (old)`). A support person,
+`support@ikameglobal.com`, is seeded (Settings → Users); local sign-in is always the `--admin-user` (an admin).
+`npm run demo:test` includes `test/admin-p2-e2e.test.mjs`: prices from the catalog → purchase → support looks the
+buyer up → grant, revoke → resend the app-link email → rotate the user_id (ports 8857/8158/8859/8858/8861/8862,
+databases `ikf_admin_p2_test`).
+
 ## Full purchase flow (`npm run demo:purchase`)
 
 Buy on a real funnel from your phone, open the "app", see **PRO**; refund from the control panel, see **FREE**.
diff --git a/docs/runbooks/admin-console.md b/docs/runbooks/admin-console.md
index 8523a77..dc494fe 100644
--- a/docs/runbooks/admin-console.md
+++ b/docs/runbooks/admin-console.md
@@ -1,4 +1,4 @@
-# Runbook: admin console (đợt 1: nền + publish)
+# Runbook: admin console (đợt 1: nền + publish; đợt 2: billing + identity)
 
 Rollout per environment (staging first). The admin console is the SPA `apps/admin` on `https://admin.<zone>`
 (Worker `ikf-admin-<env>`, static assets) calling `https://api.<zone>/v1/*` with a session cookie for
@@ -50,7 +50,7 @@ ikf login --api https://api.<zone> --token <admin token>
 ikf admin add <your email>@ikameglobal.com --role admin --name "<Tên>"
 ikf admin ls
 ```
-More people: in the console, Settings → Users (admin), or `ikf admin add <email> --role editor|viewer`.
+More people: in the console, Settings → Users (admin), or `ikf admin add <email> --role editor|support|viewer` (§11).
 
 ## 6. Check (staging, then prod)
 
@@ -89,3 +89,43 @@ Domains stay Terraform's (publisher spec): add the host to `TF_VAR_funnel_domain
 ## 10. Notes
 
 The publish-time lint check (`409 version_lint_failed`) only applies to versions uploaded after migration 005 (the admin console); versions uploaded before it have no server lint report and are not re-linted. The platform is pre-release, so no backfill is planned.
+
+## 11. Role support
+
+Four roles (spec `ifunnel/docs/specs/2026-10-11-admin-console-p2-design.md` §1; core `USER_GRANTS` = SPA `GRANTS`):
+
+| Role | May |
+|---|---|
+| viewer | read funnels, domains, audit |
+| support | viewer + Khách hàng: look a customer up (email, `cus_…`, checkout id), resend the app-link email |
+| editor | viewer + upload, pixel/app, read prices (Giá) and apps (Apps, webhooks) |
+| admin | everything: publish, prices, apps, grants, rotate user_id, Billing, Users |
+
+A CS person gets `ikf admin add <email>@ikameglobal.com --role support` (or Settings → Users). Support never sees
+Funnels upload, Giá, Apps, Billing or Users; editors never see Khách hàng. Tokens keep their meaning (`router` and
+`admin` tokens read prices and apps; `publisher` reads prices).
+
+## 12. Hỗ trợ khách (resend, rotate, grant)
+
+Console: **Khách hàng**, type the buyer's email, `cus_…` or checkout id. The page never shows the `user_id` or the
+email; every action below is in Audit (`customer:<cus_…>`), never with the email or a `user_id`. CLI equivalents
+need an admin token (`ikf customer …`).
+
+- **Gửi lại email link app** (support, admin; `ikf customer resend-email <cus_…>`): the claim email of the newest
+  checkout is sent again within seconds by the claim-email loop (3 attempts, alarm `claim_email_failed`), valid
+  7 more days. `409 no_email`: Paddle gave no address (ask the buyer to restore with OTP in the app). `404
+  no_claim`: no app-link email ever existed (the funnel had no app at purchase time).
+- **Cấp lại user_id** (admin; `ikf customer rotate-user-id <cus_…> --yes`), when a buyer's link leaked (shared on a
+  forum, a refund-abuse ring): the buyer gets a new `user_id` at once and the old one stops working. **Every
+  installed app of that buyer is FREE until they open the new link** from the email sent right after (the
+  checkout's claim page, 60 minutes after purchase, also answers with the new link). Tell the buyer before you do
+  it. No email address → the rotation still happens (`email_queued: false`): the buyer restores by OTP.
+- **Cấp quyền** (admin; `ikf customer grant <cus_…> --app <id> --key <key> [--expires <ISO>] --reason <text>`):
+  an entitlement by hand (Paddle charged but no webhook, goodwill). It works like a purchase: the app's webhook
+  fires, IKameSDK's check-purchased says pro, the 5-minute expiry sweep ends it at `--expires`. A never-ending
+  grant wins over a subscription of the same key. Reason is required (shown on the customer page and in Audit).
+- **Thu hồi** (admin; `ikf customer revoke <cus_…> <grant_id>`): the grant stays as history (`revoked_at`,
+  `revoked_by`); the entitlement falls back to what was bought, the app is told at once.
+- **Billing** (admin): reconcile 24 h / 7 d / 30 d (audited `billing.reconcile`) and the outbox, as `ikf billing`.
+
+Rate limits: `/v1/customers/*` and `/v1/paddle/prices` are in the edge's identity rule (50 requests per 10 s per IP).
PATCH
````

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npx vitest run --config demo/vitest.config.mjs demo/test/admin-p2-e2e.test.mjs 2>&1 | grep -E "Tests  |Duration"
(cd infra/modules/edge && terraform test -no-color | tail -1)
terraform fmt -check -recursive infra
npm test -w @ikf/core-api -- test/rate-limit-path.test.js 2>&1 | grep -E "Tests  "
npm run demo:test 2>&1 | grep -E "Test Files|Tests  "
```

Expected: e2e `Tests  1 passed (1)` (~12 s sau khi stack lên); Terraform `Success! 12 passed, 0 failed.`; fmt không in gì; `Tests  1 passed (1)` (check-purchased vẫn trong `rate_limited_paths`); demo `Test Files  20 passed (20)`, `Tests  115 passed (115)`.

- [ ] **Step 5: Commit**

```bash
git add demo infra docs CLAUDE.md
git commit -m "feat: demo support user + phase 2 e2e; rate limit /v1/customers/* and /v1/paddle/prices; runbook role support + Hỗ trợ khách; CLAUDE.md"
```

---

### Task 15: Chạy lại toàn nhánh

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

Expected: paddle **34**, event-schema 145, funnel-lint **35** (3 file), sdk 159, cli **148** (14 file), edge-router 106 (7 file, `ikf sdk d1a533c86611: 8154 bytes gzip`, không đổi), event-consumer 8 + 27, core-api **485** (52 file), route-match 35, admin **93** (12 file); demo **115** (20 file); fmt không in gì; edge `Success! 12 passed, 0 failed.`, core-service `Success! 6 passed, 0 failed.`, stack `Success! 12 passed, 0 failed.`; hai env `Success! The configuration is valid.`; `git status` sạch. Không còn tiến trình nào nghe trên cổng demo (`lsof -nP -iTCP -sTCP:LISTEN`).

- [ ] **Step 2: Review toàn nhánh** (superpowers:requesting-code-review) trước PR vào `feat/admin-console-p1` (PR #6) — hoặc theo thứ tự stack mà Tech Lead chọn. PR body kết thúc bằng dòng attribution Claude Code.

---

## Theo sau (thủ công, ngoài phạm vi plan này)

1. **Deploy**: migration 006 chạy khi core-api khởi động (như 005); `terraform apply` module edge (rate limit mới) qua workflow infra; deploy SPA (`admin.yml`). Không secret mới.
2. **Người dùng**: thêm CS bằng `ikf admin add <email>@ikameglobal.com --role support` (runbook §11); báo team CS quy trình runbook §12, nhất là **Cấp lại user_id** (app của khách về FREE tới khi mở link mới).
3. **Giá**: các funnel upload trước migration 006 có `plan_keys` NULL → tab Giá hiện "upload lại demo.html để đọc plan"; upload lại (kể cả đúng file cũ, A13) để có cột "Chưa có giá".
4. **Kiểm thật trên staging**: catalog Paddle sandbox thật (`listPrices` nhiều trang, `include=product`), luật rate limit `starts_with(…)` trên Cloudflare thật (mock provider không kiểm được cú pháp biểu thức), email SES thật khi gửi lại.
5. **Đợt 3** (spec đợt 1 §8): dashboard ClickHouse.

---

## Self-Review

**Spec coverage:**

| Spec | Task |
|---|---|
| Điều kiện xong: demo map giá từ catalog → mua → support tra khách thấy checkout, subscription, quyền → admin cấp quyền, app hiện key mới → thu hồi → gửi lại email thấy trong hộp thư → cấp lại `user_id`, app FREE tới khi mở link mới; e2e Playwright đúng luồng | 14 (e2e, +A19, A20), 7, 10, 12 |
| Điều kiện xong: `support` không vào Funnels upload, Giá, Apps sửa, Users; `editor` không thấy Khách hàng; test cũ pass | 2 (bảng quyền + menu), 10, 11, 12, 13, 15 |
| Quyết định #2 dropdown catalog Paddle, vẫn dán `pri_…` | 7, 10 (+A10, A11, A23) |
| Quyết định #3 tra + xem, gửi lại email, cấp lại `user_id`, cấp/gia hạn thủ công | 4, 5, 6, 12 |
| Quyết định #4 role `support`, `can()` bảng grants | 2 (+A2, A3) |
| Quyết định #5 app/webhook/billing đủ như CLI | 9, 11, 13 |
| Quyết định #6 `manual_grants`, `versions.plan_keys`, catalog proxy, report v2; SPA chỉ gọi API | 1, 3, 4, 5, 7, 8 |
| §1 Role + grants, token, SPA `can`, nav, self-lockout giữ | 1, 2, 13 |
| §1 `manual_grants`, `computeEntitlements` manual, CHECK `manual`, `loadSources`, thu hồi = `revoked_at` | 1, 3, 4 (+A14) |
| §1 `versions.plan_keys`, `planKeysFromHtml` sang funnel-lint, `plan_keys`/`unmapped` | 1, 8 (+A12, A13) |
| §1 `customers.user_id_rotated_at`, xoay không tombstone, audit chỉ `customer_ref`, dialog + runbook nói hệ quả | 1, 6, 12, 14 |
| §1 Audit mới (7 hành động), target, trong transaction | 4, 6, 9 (+A17) |
| §2 bảng route (13 dòng), `:ref` pattern, `404 customer_not_found`, no-store, log chỉ `customer_ref` | 2, 4, 5, 6, 7, 8, 9 (+A1, A4–A9, A15, A16) |
| §2 rate limit `/v1/customers/*`, `/v1/paddle/*` | 14 (+A18) |
| §2 CLI 7 lệnh | 2, 4, 5, 6, 9 (+A26) |
| §3 Funnel → Giá; Apps; Khách hàng; Billing; Users; Nav | 10, 11, 12, 13, 2 (+A22–A25) |
| §4 entitlement-sync (không worker mới), email qua `sendClaimEmails`, Paddle giả `listPrices` 3 giá, demo seed support, e2e, hạ tầng, runbook | 3, 6, 7, 14 (+A19–A21) |
| §4 Kiểm thử (migration, compute manual, recompute, lookup 3 kiểu, resend + mailer giả + 404/409, rotate + check-purchased cũ/mới, bảng quyền 4 role, listPrices phân trang + cache + 503, plan_keys + unmapped, PUT apps, SPA fake client, CLI, e2e, log/audit) | 1–14 |
| §5 ngoài phạm vi | không task (đúng) |

**Placeholder:** không có "TBD"/"tương tự Task N". Mọi khối code và patch được sinh từ cây đã chạy test (Node 26, colima), rồi áp lại theo thứ tự lên một bản `e1b92cf` sạch và so khớp. Không chạy được ở đây: Cloudflare thật (cú pháp `starts_with` trong luật rate limit chỉ kiểm bằng mock), Paddle sandbox thật (`listPrices` chỉ kiểm bằng fetch giả và Paddle giả), SES thật — "Theo sau" 4.

**Nhất quán tên / kiểu:**
- `USER_GRANTS` (Task 2, core) = `GRANTS` (Task 2, SPA) — `test/grants.test.jsx`; grant `prices:read` ← route `GET …/prices`, `GET /v1/paddle/prices` (Task 7), tab Giá (Task 10); `apps:read` ← `GET …/webhooks`, màn Apps (Task 11); `support` ← lookup (Task 5), resend (Task 6), Khách hàng (Task 12); `router` ← `PUT …/prices`, `PUT /v1/apps/:id` (Task 9); `admin` ← grants, rotate (Task 4, 6), Billing (Task 13).
- `CUSTOMER_REF_PATTERN`, `customerByRef`, `listEntitlements`, `grantView` (Task 4/5, `identity/customers.js`) ← `grants.js` (Task 4), `customer-actions.js` (Task 6), `customerReport` (Task 5); `CUSTOMER_REF_RE` SPA (Task 12) và CLI (Task 4) cùng regex `^cus_[0-9A-HJKMNP-TV-Z]{26}$`.
- `customerReport` fields (Task 5) = SPA `CustomerDetail` (Task 12: `has_email`, `claim`, `manual_grants`, `checkouts`) = CLI `customer show` (Task 5).
- `listFunnelPrices` → `{plans, plan_keys, unmapped}` (Task 8) ← `PricesTab` (Task 10); `priceView` (Task 7) ← `priceLabel` (Task 10); Paddle giả `DEMO_PRICES` (Task 7) ← nhãn e2e `Starlyn premium · Weekly — 13.67 USD/tuần` (Task 14).
- `listDeliveries` → `{items, next_before, counts}` (Task 9) ← `AppDetail` Webhooks (Task 11); `updateApp` field (Task 9) = `FIELDS` của `EditApp` (Task 11).
- Nhãn SPA dùng trong e2e (Task 14) = Task 10–12: `Giá`, `price-row`, `Chọn giá cho <plan>`, `Entitlement key của addon`, `Lưu giá`, `Đã lưu giá.`, `Tìm khách`, `Tìm`, region `Mua hàng`/`Quyền`/`Hành động admin`/`Email link app`, `Cấp quyền`, `App`, `Lý do`, `Xác nhận cấp quyền`, `Đã cấp <app>/<key> (grant <id>).`, `Thu hồi #<id>`, `Xác nhận thu hồi`, `Gửi lại`, `Cấp lại user_id`, `Xác nhận cấp lại user_id`, `Xem audit`, `data-testid="audit"`.
- `DEMO_SUPPORT_USER`, `seedSupportUser`, `stack.supportUser` (Task 14) ← e2e; cổng e2e (Task 14) = README demo = Global Constraints.

**Review Focus đã ghim:** 1 → Task 4; 2 → Task 6; 3 → Task 5, 12; 4 → Task 7, 10; 5 → Task 2, 10, 12, 13, 14.

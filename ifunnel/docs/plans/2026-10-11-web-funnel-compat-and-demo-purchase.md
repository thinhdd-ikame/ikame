# iKame Funnel Platform — Web Funnel SDK Compat + Demo Purchase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** App mobile đang dùng IKameSDK nhận trạng thái pro sau khi người dùng trả tiền trên funnel iFunnel mà **không sửa code app** (chỉ đổi `baseUrl`): deep link Adjust mang `user_id`, SDK hỏi `POST /v1/payment/check-purchased-web-funnel`. Rồi `npm run demo:purchase` chạy toàn bộ luồng mua trên điện thoại (funnel thật → Paddle giả → app giả **PRO** → refund → **FREE**) không cần tài khoản nào, với code billing / entitlement / SDK đúng bản production.

**Architecture:**
- **Migration `004_entitlements.sql`** (chưa release, sửa tại chỗ): `customers.user_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE`; `apps.handoff ('user_id' | 'claim', mặc định user_id)`, `apps.deeplink_path` (mặc định `open`), `apps.bundle_ids TEXT[]`.
- **`core-api` identity**: app `kind = app` + `handoff = user_id` (`usesUserId`): `GET /v1/checkout/:id/claim` trả `app_link = <tracker>?deep_link=<scheme>://<path>?user_id=<uuid>` khi transaction của checkout `completed`; email sau thanh toán chứa cùng link; `claim_tokens` chỉ còn vai trò "đã gửi email" (token ngẫu nhiên không dùng); redeem → 404, OTP send no-op, verify → 401; không có webhook. App `handoff = claim` chạy y như cũ.
- **Endpoint SDK**: `POST /v1/payment/check-purchased-web-funnel` (public, không CORS, `no-store`) đọc `entitlements` đã tính, mọi tên field nằm trong **một** module `src/identity/sdk-contract.js` (tạm theo tài liệu SDK; cập nhật khi có swagger). Mode AUTH: `POST /v1/web-funnel/entitlements` (Bearer key của app). `ikf customer show` hiện `user_id`.
- **`@ikf/event-schema`**: giá trị chứa UUID bị scrub (funnel phát `app_handoff {url}` mang link app).
- **CLI**: `ikf app create … --handoff user_id|claim [--deeplink-path] [--bundle-ids]`, `ikf app ls` có cột handoff.
- **Docs/infra**: `docs/integration/app-backend.md` mục đầu "A. Apps on IKameSDK"; runbook; rate limit prod thêm đường dẫn check-purchased (50/10s/IP).
- **Demo** (merge `feat/local-demo`): SDK nhận `__IKF.paddle.js` (https), edge-router chèn khi có Worker var `PADDLE_JS_URL` (chỉ demo; `deploy-config.js` chặn ở staging/prod); `demo/lib/{paddle-fake,queue,tunnel,proxy,mailbox,purchase,seed,options}.mjs`; `demo/server/*` (paddle.js giả, app giả, hộp thư, bảng điều khiển); smoke `demo/test/purchase.test.mjs` không tunnel (host `https://demo.test`).

**Tech Stack:** Node.js 22 trên CI (local Node 26) · JavaScript ESM · npm workspaces · Fastify 5 · `pg` 8 · Vitest ~3.2 · happy-dom 20 · esbuild 0.25 · `@testcontainers/postgresql` 11 · Miniflare 4 · `cloudflared` (quick tunnel) · `qrcode-terminal` 0.12 (mới, devDependency gốc) · Terraform + Cloudflare provider (mock).

**Spec:** `ifunnel/docs/specs/2026-10-11-web-funnel-sdk-compat-design.md` (Task 1–8) và `ifunnel/docs/specs/2026-10-11-demo-purchase-design.md` (Task 9–15). Xây trên spec/plan Entitlement + Identity (`ifunnel/docs/specs/2026-10-09-entitlement-identity-design.md`, `ifunnel/docs/plans/2026-10-09-entitlement-identity.md`) và Local Demo (`ifunnel/docs/specs/2026-10-09-local-demo-design.md`).

**Repo / nhánh / worktree:** repo `/Users/daothinh/ikf-platform`. Nhánh mới **`feat/demo-purchase`** cắt từ `feat/entitlement-identity` — đã kiểm với tip **`2cd090a`** (`Merge remote-tracking branch 'origin/feat/runtime-sdk-collector' into feat/entitlement-identity`, đã gồm `origin/feat/runtime-sdk-collector`). Task 9 merge **`feat/local-demo`** (tip **`5d3627f`**, `test(demo): isolate e2e data, apply all ClickHouse DDL`). Code nằm trong worktree mới **`/Users/daothinh/ikf-platform-demo-purchase`** (Task 1 tạo). **Không bao giờ** đụng working tree `/Users/daothinh/ikf-platform-billing`, `/Users/daothinh/ikf-platform-entitlement`, `/Users/daothinh/ikf-platform-demo` (session khác dùng; worktree mới chỉ đọc ref của chúng). Mọi lệnh trong plan chạy từ gốc worktree mới. Quy ước repo: `CLAUDE.md` ở gốc repo.

**Môi trường chạy test (local):**
```bash
cd /Users/daothinh/ikf-platform-demo-purchase
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock          # Docker qua colima
export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock     # Testcontainers (Postgres)
export TF_PLUGIN_CACHE_DIR=$HOME/.terraform.d/plugin-cache            # Terraform (chỉ mock provider)
```
Demo (Task 9–15) cần thêm: colima đang chạy, `docker compose` (README demo), `cloudflared` (`/opt/homebrew/bin/cloudflared`, chỉ cho chạy tay), funnel `witch-power` ở `~/ikame/funnel/funnel-development/nebula/witch-power/demo.html` (nhánh `funnel` của repo ikame; smoke test tự skip nếu thiếu).

Số test ghi ở mỗi task là số **thật** khi chạy toàn bộ code của plan này trên bản sao `feat/entitlement-identity@2cd090a` + merge `feat/local-demo@5d3627f` (Node 26, colima, 2026-10-11); mỗi khối code / patch trong plan được sinh trực tiếp từ cây đã chạy test đó (trùng từng byte). Số demo của Task 10–13 được chạy lại trên đúng commit của từng task. Mốc ban đầu tại `2cd090a`: core-api **324** (31 file), sdk **152** (11 file, bundle **8123** byte gzip), cli **114** (12 file), edge-router **101** (6 file), event-schema **138**, paddle **31**, route-match **35**, event-consumer **8 + 27**; Terraform edge **10**, stack **11**. Sau merge `feat/local-demo`: `npm run demo:test` **45** (7 file).

Nếu lúc thực thi `feat/entitlement-identity` hoặc `feat/local-demo` đã đi xa hơn các tip trên: chạy lại mốc (Task 1 Step 2, Task 9 Step 2); số khác thì ghi lại và chỉnh các con số "Expected" theo chênh lệch; patch không áp được thì đọc phần code tương ứng và áp tay đúng nội dung, không sửa gì ngoài phạm vi task.

## Điều chỉnh so với spec (phát hiện khi đọc code tại `2cd090a` / `5d3627f`, khảo sát `witch-power`, và chạy thử, 2026-10-11)

| # | Spec | Plan làm | Lý do |
|---|---|---|---|
| C1 | Tên field check-purchased "*(swagger)*" | Mọi tên + hình dạng request/response nằm trong `src/identity/sdk-contract.js`: `PATH`, `REQUEST_USER_ID_FIELD = 'user_id'`, `REQUEST_APP_FIELD = 'bundle_id'`, `RESPONSE_IS_PRO_FIELD = 'is_pro'`, `RESPONSE_EXPIRES_FIELD = 'expires_at'`, `FOREVER_EXPIRES_VALUE = null`, cùng `readRequest`, `responseBody`, `contractJson`. Test core, smoke demo, trang app giả (qua `/_demo/sdk-contract.json`) và `docs-vector.test.js` (tài liệu) đều đọc từ đây | Swagger `api-slt-aio` chưa có: khi có, sửa một file (+ đoạn tài liệu mà test chỉ ra) |
| C2 | Mode AUTH: `GET /v1/web-funnel/users/:user_id/entitlements` | `POST /v1/web-funnel/entitlements {user_id}` (Bearer API key `ikfa_`), cùng response | `user_id` là bí mật kiểu token (spec §1); trên path nó vào access log của Fastify/ALB/Cloudflare. Giống E10 (email) của plan trước |
| C3 | `is_pro` = có quyền `active = true` | `active AND (expires_at IS NULL OR expires_at > now())` — vẫn chỉ đọc `entitlements`, không tính lại | Lượt quét hết hạn chạy 5 phút/lần; trong khoảng đó `active` còn `true` dù hạn đã qua |
| C4 | Phạm vi app qua `apps.bundle_ids TEXT[]` *(swagger)* | Cột `bundle_ids TEXT[] NOT NULL DEFAULT '{}'`; `bundle_id` khớp `apps.id` **hoặc** một phần tử `bundle_ids`; khớp không app nào → `is_pro false`. Đặt qua `POST /v1/apps {bundle_ids}` / `ikf app create --bundle-ids a,b` | Spec không nói cách đặt giá trị. Chọn chặt (không rơi về "mọi app"): app quên khai bundle id thấy FREE ngay khi test staging, thay vì âm thầm cho pro chéo app (runbook ghi rõ) |
| C5 | Email sau thanh toán "nội dung như email claim hiện tại nhưng link là `app_link`" | Link `user_id` **và** đổi 2 câu cuối thành "Keep this email: … open this link again to restore your purchase." (`claimEmail(app, link, {reusable})`); email app `claim` giữ nguyên từng byte | Câu cũ ("works once, 7 days", "6-digit code") sai với app `user_id` (link dùng mãi, không có OTP) |
| C6 | "`user_id` … không đưa vào event ClickHouse" | `@ikf/event-schema` `isPiiValue`: giá trị chứa UUID bị bỏ (SDK + collector). Bundle SDK 8123 → 8146 (→ 8154 sau Task 9) | `witch-power` phát `emit('app_handoff', {url})` với chính link app; link chứa `user_id` (không còn email khi funnel không có email) sẽ vào `props.url` |
| C7 | CLI `--handoff user_id\|claim [--deeplink-path open]` | `--handoff` **bắt buộc** khi `--kind app`; thêm `--bundle-ids` (C4); `ikf app ls` thêm cột handoff (`-` cho app web); `ikf customer show` thêm dòng `user_id` kèm cảnh báo bí mật | Handoff "chọn lúc tạo app, đổi sau phải cân nhắc" (spec §5): bắt người tạo chọn có ý thức. API vẫn mặc định `user_id` như spec §1 |
| C8 | `handoff` "chỉ có nghĩa với kind = 'app'" | `usesUserId(app) = kind === 'app' && handoff === 'user_id'` (trong `claims.js`). App `web` giữ magic link + OTP; `appView` trả `handoff`/`deeplink_path` = `null` cho app web | Cột có default `user_id` cho mọi dòng; không lọc theo `kind` thì app web mất OTP |
| C9 | Check-purchased "tắt sau refund / hết hạn như spec entitlement" | Endpoint chỉ đăng ký khi identity bật (`claimKey`, như các route identity khác); tắt → 404 (SDK giữ cache) | Không có `entitlement-sync` thì `entitlements` không cập nhật; trả lời từ dữ liệu cũ còn tệ hơn |
| D1 | Terraform test `infra/modules/edge`: "bảng vars của Worker staging/prod không chứa `PADDLE_JS_URL`" | Vars của Worker **không** nằm trong Terraform: `workers/edge-router/scripts/render-config.mjs` dựng chúng từ biến GitHub environment lúc deploy. Logic tách sang `scripts/deploy-config.js` (hàm thuần) — từ chối khi `PADDLE_JS_URL` có trong env deploy hoặc `wrangler.json`; test `workers/edge-router/test/deploy-config.test.js` (chạy trên CI) | Đặt chặn đúng nơi duy nhất tạo vars cho staging/prod |
| D2 | Expire = "đẩy `current_period_end` về quá khứ + `subscription.updated` → sweep (nút)" | Expire = `past_due`, kỳ kết thúc **4 ngày** trước (gia hạn thất bại, hết 3 ngày ân hạn) + webhook → outbox `subscription.past_due` → FREE trong ≤ 2 s. Không có nút sweep. Renew = transaction gia hạn `completed` (origin `subscription_recurring`) + `active`, kỳ mới | Cùng status thì billing không ghi outbox (không recompute); `entitlements.expires_at` đã lưu vẫn ở tương lai nên sweep cũng không chọn khách này |
| D3 | Prices `pri_demo_1w`, `pri_demo_addon` | `pri_demoweekly0000000000000000` ($13.67, recurring), `pri_demoaddon00000000000000000` ($19.99, one-time) | `PRICE_ID_RE = /^pri_[a-z0-9]{26}$/` của core từ chối id spec |
| D4 | Proxy: `/v1/*`, `/_demo/*`, còn lại → Miniflare | Thêm `/_media/*` → media server (bỏ tiền tố); ở chế độ purchase `mediaBase = <base>/_media` | Ảnh `http://<LAN>:8790` bị chặn trên trang https (mixed content) |
| D5 | Seed tạo app, gắn funnel, prices | Qua API thật của core (`POST /v1/apps`, `PUT /v1/funnels/:slug`, `PUT …/prices`); `409 app_exists` → `UPDATE apps` URL tracker/webhook bằng SQL | Không có API sửa app; URL tunnel đổi mỗi lần chạy |
| D6 | Thứ tự: proxy → tunnel → … | Tunnel trước, rồi cả stack (Miniflare cần `API_ORIGIN`/`PADDLE_JS_URL` lúc khởi động) | `cloudflared` cấp URL không cần origin sẵn sàng (đã kiểm) |
| D7 | "in ra … mã QR" | devDependency gốc mới `qrcode-terminal@^0.12.0` (không dependency con) | Node không có sẵn |
| D8 | `run.mjs` thêm cờ | Phân tích cờ tách sang `demo/lib/options.mjs` (có test): `--host` phải là origin https; `--tunnel`/`--host` chỉ đi với `--purchase`; `--purchase` từ chối `--funnels` | Thông báo lỗi rõ trước khi khởi động gì |
| D9 | Overlay giả: "email + nút Pay / Cancel" | Overlay hỏi email **chỉ khi** transaction chưa có customer (`GET /_demo/paddle/txn/:id` → `needs_email`, không trả email); phát `checkout.loaded` như Paddle | SDK gửi email của funnel trong `POST /v1/checkout`, core tạo customer trước |
| D10 | App giả "tách `user_id` (bỏ placeholder như SDK)" | Chỉ đọc `user_id` **trong** `deep_link` (giá trị hợp lệ cuối, bỏ rỗng và `{…}`); `user_id=` mà `appHandoffUrl()` của witch-power nối vào URL tracker bị bỏ qua | Adjust chỉ trao `deep_link` cho app |
| D11 | Smoke: "Không có email nào trong log" | `startStack({logStream})` gom log Fastify + worker; smoke kiểm **cả** email lẫn `user_id` | Quy tắc dự án: log không email, không `user_id` |
| D12 | `queue.mjs` "cùng interface" | Thêm như SQS: message không bị `delete` quay lại sau visibility timeout (5 s), tối đa 5 lần rồi bỏ | Lỗi tạm của billing-sync không làm mất thanh toán trong demo |
| D13 | Merge `feat/local-demo` "resolve package-lock" | Tại `5d3627f` merge **không xung đột** (kể cả `package-lock.json`); `npm ci` sau merge sạch | Ghi lại; bước dự phòng vẫn có trong Task 9 |

## Global Constraints

- Code trong repo `ikf-platform`, nhánh `feat/demo-purchase`, worktree `/Users/daothinh/ikf-platform-demo-purchase`. HTML funnel **không sửa**.
- **App `handoff = claim` chạy y như trước**: toàn bộ test cũ pass; test cũ chỉ được sửa ở helper `APP_BODY` (thêm `handoff: 'claim'`) và các test CLI/SDK nêu trong task.
- **`user_id` là bí mật kiểu token**: UUID v4 (`gen_random_uuid()`), không bao giờ là email; log chỉ `user_hash = sha256(lower(user_id))`; không trên URL nào của API (C2), không vào event ClickHouse (C6), không vào payload webhook; chỉ qua https. **Log không email, không `user_id`, không `err.message`** (chỉ code).
- `app_link` (handoff `user_id`) = `<adjust_tracker_url>?deep_link=<urlencode("<scheme>://<deeplink_path>?user_id=<uuid>")>`, giữ query sẵn có của tracker; cửa sổ `GET …/claim` 1 giờ sau `completed_at` như cũ.
- **Check-purchased** `POST /v1/payment/check-purchased-web-funnel`: public, không CORS, `cache-control: no-store`; `user_id` sai/lạ/thiếu → `200 {is_pro:false, expires_at:null}` (không bao giờ 4xx vì input); lỗi DB → `503 {error:'unavailable'}`; `expires_at` = hạn xa nhất của quyền active, vĩnh viễn → `FOREVER_EXPIRES_VALUE`. Tên field chỉ ở `sdk-contract.js` (C1).
- **Rate limit Cloudflare** (prod, `ratelimit_full`): `/v1/payment/check-purchased-web-funnel` vào nhóm identity **50 / 10s / IP**. Không secret mới.
- **Production chỉ đổi đúng chỗ spec nói**: compat (Task 1–8) + chỗ cắm `__IKF.paddle.js` (Task 9). `__IKF.paddle.js` chỉ nhận `https://`; không có `PADDLE_JS_URL` thì `__IKF` không đổi một byte; `PADDLE_JS_URL` không bao giờ vào config deploy (D1). Bundle SDK ≤ **8192** byte gzip (sau Task 9: **8154**).
- **Demo**: giá trị demo không phải bí mật (`DEMO_CLAIM_KEY`, `DEMO_WEBHOOK_SECRET`), sitekey test Cloudflare `1x00000000000000000000AA`, `PADDLE_CLIENT_TOKEN = test_demo`, `PADDLE_ENV = sandbox`. Cổng: edge 8787, core 8080, media 8790, **proxy 8788** (mọi interface), **demo server 8791** (127.0.0.1). Smoke dùng cổng riêng `8827/8128/8829/8828/8831` và DB riêng `ikf_purchase_test`. Paddle giả + hộp thư (50 email) chỉ trong bộ nhớ.

## Review Focus

1. **`user_id` lọt ra ngoài** (log core khi gọi check-purchased, log khi DB lỗi kèm message, URL của API AUTH, event `app_handoff` của funnel, log demo). Test: Task 4 `logs check_purchased with the user_id hash only; a DB failure is 503 unavailable`; Task 5 (POST body, C2); Task 6 `drops a UUID anywhere in the value`, `drops the app link of a handoff = user_id funnel's app_handoff event`; Task 12/13 smoke kiểm log không có email và `user_id`.
2. **SDK giữ "pro" cũ mãi** khi endpoint trả 4xx cho input lạ (thân rỗng, mảng, số, placeholder `{email}`, UUID chữ hoa). Test: Task 4 `unknown, malformed or missing user_id: 200 not pro, never a 4xx`, chữ hoa trong test đầu; DB lỗi → 503.
3. **Pro không tắt sau refund / hết hạn** (refund toàn phần vs một phần, hạn đã qua mà sweep chưa chạy, gia hạn thất bại quá ân hạn). Test: Task 4 `a full refund turns pro off; a partial refund does not`, `weekly plan: off once the period + 3 days are over (sweep), and at once when the stored end has passed`; Task 13 smoke `Expire → not pro, Renew → pro`.
4. **App `claim` và app `web` bị ảnh hưởng** bởi default `handoff = user_id`. Test: toàn bộ test claim/OTP/magic/webhook cũ pass không đổi (APP_BODY = claim); Task 2 `handoff: user_id unless the app asks for claim …` (web → `null`); `usesUserId` chỉ cho `kind = 'app'` (C8).
5. **`PADDLE_JS_URL` lọt vào staging/prod hoặc nạp script không https**. Test: Task 9 `refuses to render when PADDLE_JS_URL is set in the deploy environment` (cả `wrangler.json`), `%s: Worker vars are exactly the known ones`, SDK `__IKF.paddle.js "http://…" / "javascript:…" → PADDLE_JS`, edge `PADDLE_JS_URL (https) becomes __IKF.paddle.js; unset, empty or not https adds nothing`.

## File Structure (repo `ikf-platform`, phần mới/sửa)

```
ikf-platform/
├── services/core-api/
│   ├── migrations/004_entitlements.sql            # SỬA: customers.user_id, apps.handoff/deeplink_path/bundle_ids
│   ├── src/app.js                                  # SỬA: đăng ký http/sdk.js
│   ├── src/http/apps.js, src/http/identity.js      # SỬA: body POST /v1/apps; POST /v1/web-funnel/entitlements
│   ├── src/http/sdk.js                             # MỚI: POST /v1/payment/check-purchased-web-funnel
│   ├── src/identity/sdk-contract.js                # MỚI: tên field/hình dạng của endpoint SDK (C1)
│   ├── src/identity/purchased.js                   # MỚI: checkPurchased, webFunnelEntitlements
│   ├── src/identity/{apps,claims,link,otp,sync,customers}.js   # SỬA: handoff, userAppLinkFor, usesUserId, email, user_id
│   └── test/{sdk-handoff,check-purchased,web-funnel-auth}.test.js (mới); sửa test/{entitlements-schema,apps,docs-vector}.test.js, test/helpers/identity.js
├── packages/event-schema/src/index.js + test        # SỬA: UUID là PII theo giá trị (C6)
├── packages/cli/src/main.js + test/app.test.js     # SỬA: --handoff, --deeplink-path, --bundle-ids, ls, customer show
├── packages/sdk/src/checkout.js + test             # SỬA: __IKF.paddle.js (https) thay PADDLE_JS
├── workers/edge-router/src/pay.js                  # SỬA: PADDLE_JS_URL → __IKF.paddle.js
├── workers/edge-router/scripts/{deploy-config.js (mới), render-config.mjs} + test/deploy-config.test.js (mới), test/pay.test.js
├── infra/modules/edge/{main,variables}.tf + tests  # SỬA: đường dẫn check-purchased trong rule identity
├── docs/integration/app-backend.md, docs/runbooks/entitlement-identity.md   # SỬA
├── package.json, package-lock.json                 # SỬA: demo:purchase, qrcode-terminal
└── demo/                                           # (từ feat/local-demo) + mới:
    ├── run.mjs (sửa), README.md (sửa)
    ├── lib/{paddle-fake,queue,tunnel,proxy,mailbox,purchase,seed,options}.mjs (mới); lib/{stack,miniflare}.mjs (sửa)
    ├── server/{index,paddle-js,app-page,pages}.mjs (mới)
    └── test/{queue,paddle-fake,tunnel,proxy,purchase-deps,seed,purchase,server,paddle-js,options}.test.mjs (mới)
```

---

### Task 1: Nhánh + worktree; migration: `customers.user_id`, `apps.handoff` / `deeplink_path` / `bundle_ids`

**Files:**
- Modify: `services/core-api/migrations/004_entitlements.sql`
- Test: `services/core-api/test/entitlements-schema.test.js`

**Interfaces:**
- Consumes: `004_entitlements.sql` của `feat/entitlement-identity` (chưa release nên sửa tại chỗ).
- Produces: `customers.user_id UUID NOT NULL DEFAULT gen_random_uuid()` (constraint `customers_user_id_key`); `apps.handoff TEXT NOT NULL DEFAULT 'user_id'` (`apps_handoff_check`: `user_id` | `claim`), `apps.deeplink_path TEXT NOT NULL DEFAULT 'open'` (`apps_deeplink_path_check`: `^[a-z0-9_-]{1,32}$`), `apps.bundle_ids TEXT[] NOT NULL DEFAULT '{}'`. Billing tạo khách không đổi.

- [ ] **Step 1: Tạo nhánh + worktree (ghi lại SHA)**

```bash
git -C /Users/daothinh/ikf-platform rev-parse --short feat/entitlement-identity feat/local-demo
# đã kiểm với 2cd090a và 5d3627f; khác thì xem ghi chú ở đầu plan
git -C /Users/daothinh/ikf-platform worktree add -b feat/demo-purchase /Users/daothinh/ikf-platform-demo-purchase feat/entitlement-identity
cd /Users/daothinh/ikf-platform-demo-purchase
npm ci
```

Không `checkout` trong các worktree khác; worktree mới chỉ đọc ref của chúng.

- [ ] **Step 2: Chạy mốc ban đầu**

```bash
npm test -w @ikf/core-api -w @ikf/sdk -w @ikf/cli -w @ikf/edge-router -w @ikf/event-schema 2>&1 | grep -E "Test Files|Tests  |bytes gzip"
```

Expected (tại `2cd090a`): core-api `31 passed (31)` / `324 passed (324)`, sdk `11` / `152`, cli `12` / `114`, edge-router `6` / `101` (`ikf sdk 048813807adf: 8123 bytes gzip`), event-schema `138`.

- [ ] **Step 3: Viết test fail**

`services/core-api/test/entitlements-schema.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/test/entitlements-schema.test.js b/services/core-api/test/entitlements-schema.test.js
index 7effae4..84f8664 100644
--- a/services/core-api/test/entitlements-schema.test.js
+++ b/services/core-api/test/entitlements-schema.test.js
@@ -52,6 +52,27 @@ describe('004_entitlements schema', () => {
     await expect(db.pool.query(`UPDATE customers SET ref = 'cus_${EV}' WHERE id = $1`, [c2])).rejects.toThrow(/customers_ref_key/);
   });
 
+  it('customers.user_id: a random v4 UUID for every customer (billing inserts unchanged), unique, never NULL', async () => {
+    const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
+    const second = (await db.pool.query("INSERT INTO customers (paddle_customer_id) VALUES ('ctm_2') RETURNING id, user_id")).rows[0];
+    const first = (await db.pool.query('SELECT user_id FROM customers WHERE id = $1', [customerId])).rows[0].user_id;
+    expect(first).toMatch(UUID_V4);
+    expect(second.user_id).toMatch(UUID_V4);
+    expect(second.user_id).not.toBe(first);
+    await expect(db.pool.query('UPDATE customers SET user_id = $1 WHERE id = $2', [first, second.id])).rejects.toThrow(/customers_user_id_key/);
+    await expect(db.pool.query('UPDATE customers SET user_id = NULL WHERE id = $1', [customerId])).rejects.toThrow(/null value in column "user_id"/);
+  });
+
+  it('apps: handoff user_id | claim (default user_id), deeplink_path (default open, checked), bundle_ids (default empty)', async () => {
+    const { rows } = await db.pool.query("SELECT handoff, deeplink_path, bundle_ids FROM apps WHERE id = 'starlyn'");
+    expect(rows[0]).toEqual({ handoff: 'user_id', deeplink_path: 'open', bundle_ids: [] });
+    await db.pool.query("UPDATE apps SET handoff = 'claim', deeplink_path = 'web_funnel-2', bundle_ids = '{com.ikame.starlyn}' WHERE id = 'starlyn'");
+    await expect(db.pool.query("UPDATE apps SET handoff = 'push' WHERE id = 'starlyn'")).rejects.toThrow(/apps_handoff_check/);
+    for (const bad of ['', 'Open', 'a/b', 'x'.repeat(33)]) {
+      await expect(db.pool.query('UPDATE apps SET deeplink_path = $1 WHERE id = $2', [bad, 'starlyn'])).rejects.toThrow(/apps_deeplink_path_check/);
+    }
+  });
+
   it('app_links: one ACTIVE link per (app, app_user_id); a revoked one can be linked again', async () => {
     const link = () => db.pool.query("INSERT INTO app_links (customer_id, app_id, app_user_id) VALUES ($1, 'starlyn', 'u1') RETURNING id", [customerId]);
     const first = (await link()).rows[0].id;
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/entitlements-schema.test.js 2>&1 | grep -E "×|Tests  "
```

Expected: 2 test mới FAIL (`customers.user_id …`, `apps: handoff …`: cột chưa có), `Tests  2 failed | 8 passed (10)`.

- [ ] **Step 5: Implement**

`services/core-api/migrations/004_entitlements.sql` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/migrations/004_entitlements.sql b/services/core-api/migrations/004_entitlements.sql
index acfc43c..1355a66 100644
--- a/services/core-api/migrations/004_entitlements.sql
+++ b/services/core-api/migrations/004_entitlements.sql
@@ -8,6 +8,13 @@ CREATE TABLE apps (
   deeplink_scheme     TEXT NULL CONSTRAINT apps_deeplink_scheme_check CHECK (deeplink_scheme ~ '^[a-z][a-z0-9+.-]{1,30}$'),
   return_url          TEXT NULL,
   webhook_url         TEXT NULL,
+  -- How a buyer reaches the app (kind 'app' only; web apps ignore it): 'user_id' = the Adjust deep link
+  -- carries customers.user_id and IKameSDK asks POST /v1/payment/check-purchased-web-funnel; 'claim' = the
+  -- single-use claim token + webhooks to the app's own backend.
+  handoff             TEXT NOT NULL DEFAULT 'user_id' CONSTRAINT apps_handoff_check CHECK (handoff IN ('user_id', 'claim')),
+  deeplink_path       TEXT NOT NULL DEFAULT 'open' CONSTRAINT apps_deeplink_path_check CHECK (deeplink_path ~ '^[a-z0-9_-]{1,32}$'),
+  -- App/bundle ids the SDK may send to scope check-purchased to this app.
+  bundle_ids          TEXT[] NOT NULL DEFAULT '{}',
   api_key_hash        TEXT NOT NULL UNIQUE,
   prev_api_key_hash   TEXT NULL UNIQUE,
   prev_key_expires_at TIMESTAMPTZ NULL,
@@ -26,6 +33,9 @@ ALTER TABLE funnel_prices
 -- customer_ref (cus_<ULID>): stable, reveals nothing; assigned on first use.
 ALTER TABLE customers
   ADD COLUMN ref TEXT NULL UNIQUE CONSTRAINT customers_ref_check CHECK (ref ~ '^cus_[0-7][0-9A-HJKMNP-TV-Z]{25}$');
+-- user_id: the buyer's id in the app's Adjust deep link (handoff = user_id). A bearer secret: whoever holds it
+-- gets the buyer's entitlements, so it is never logged, never in events or webhooks. Billing inserts get it by default.
+ALTER TABLE customers ADD COLUMN user_id UUID NOT NULL DEFAULT gen_random_uuid() CONSTRAINT customers_user_id_key UNIQUE;
 -- OTP looks a buyer up by email (lowercased, trimmed).
 CREATE INDEX customers_by_email ON customers (lower(btrim(email)));
 
PATCH
```

- [ ] **Step 6: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/entitlements-schema.test.js 2>&1 | grep -E "Tests  "
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  10 passed (10)`; toàn bộ core-api `Test Files  31 passed (31)`, `Tests  326 passed (326)` (test cũ không đổi: chưa code nào đọc `handoff`).

- [ ] **Step 7: Commit**

```bash
git add services/core-api
git commit -m "feat(core-api): customers.user_id and apps.handoff / deeplink_path / bundle_ids (web funnel SDK compat)"
```

---

### Task 2: App registry nhận `handoff`, `deeplink_path`, `bundle_ids`

**Files:**
- Modify: `services/core-api/src/identity/apps.js`, `services/core-api/src/http/apps.js`
- Test: `services/core-api/test/apps.test.js`, `services/core-api/test/helpers/identity.js`

**Interfaces:**
- Consumes: cột mới (Task 1).
- Produces:
  - `POST /v1/apps` body thêm `handoff` (`user_id` | `claim`, mặc định `user_id`), `deeplink_path` (mặc định `open`), `bundle_ids` (mảng ≤ 20, mỗi phần tử `^[A-Za-z0-9._-]{1,100}$`); sai → `400 invalid_app` với `{field: 'handoff'|'deeplink_path'|'bundle_ids', reason: 'format'}`. App `web` bỏ qua `handoff`/`deeplink_path`.
  - `appView` thêm `handoff`, `deeplink_path` (`null` cho app web), `bundle_ids`; `appForKey` (→ `req.caller`) thêm `handoff`, `deeplink_path`.
  - `apps.js` export `HANDOFFS`, `DEEPLINK_PATH_RE`, `BUNDLE_ID_RE`.
  - Test helper: `APP_BODY.handoff = 'claim'` (mọi test claim cũ giữ mô hình cũ); `SDK_APP_BODY = { ...APP_BODY, handoff: 'user_id', deeplink_path: 'open' }` (dùng ở Task 3–5).

- [ ] **Step 1: Viết test fail**

`services/core-api/test/helpers/identity.js` và `services/core-api/test/apps.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/test/apps.test.js b/services/core-api/test/apps.test.js
index 6817e8e..66d3d15 100644
--- a/services/core-api/test/apps.test.js
+++ b/services/core-api/test/apps.test.js
@@ -56,6 +56,26 @@ describe('app registry: POST/GET /v1/apps, rotate-key, app API keys', () => {
     expect((await create({ ...WEB_BODY, id: 'w3', webhook_url: 'https://u:p@x.example/h' })).json().detail).toEqual([{ field: 'webhook_url', reason: 'https_required' }]);
   });
 
+  it('handoff: user_id unless the app asks for claim; deeplink_path (default open) and bundle_ids are kept and listed', async () => {
+    const { handoff, ...noHandoff } = APP_BODY;
+    expect(handoff).toBe('claim');
+    const sdk = (await create({ ...noHandoff, id: 'zodiac' })).json().app;
+    expect(sdk).toMatchObject({ id: 'zodiac', handoff: 'user_id', deeplink_path: 'open', bundle_ids: [] });
+    const own = await create({ ...APP_BODY, deeplink_path: 'restore', bundle_ids: ['com.ikame.starlyn', '6471234567'] });
+    expect(own.statusCode).toBe(201);
+    expect(own.json().app).toMatchObject({ handoff: 'claim', deeplink_path: 'restore', bundle_ids: ['com.ikame.starlyn', '6471234567'] });
+    const web = (await create({ ...WEB_BODY, handoff: 'claim', deeplink_path: 'x' })).json().app;
+    expect(web).toMatchObject({ kind: 'web', handoff: null, deeplink_path: null, bundle_ids: [] });
+    const list = (await app.inject({ method: 'GET', url: '/v1/apps', headers: bearer(router) })).json().apps;
+    expect(list.map((a) => [a.id, a.handoff, a.deeplink_path])).toEqual([['starlyn', 'claim', 'restore'], ['tarot-web', null, null], ['zodiac', 'user_id', 'open']]);
+    const bad = await create({ ...APP_BODY, id: 'bad', handoff: 'push', deeplink_path: 'Open/Now', bundle_ids: ['com ikame'] });
+    expect(bad.statusCode).toBe(400);
+    expect(bad.json()).toEqual({
+      error: 'invalid_app',
+      detail: [{ field: 'handoff', reason: 'format' }, { field: 'deeplink_path', reason: 'format' }, { field: 'bundle_ids', reason: 'format' }],
+    });
+  });
+
   it('an existing id is 409 and its secret is not overwritten', async () => {
     await create();
     const before = secrets.values.get('starlyn');
@@ -121,6 +141,7 @@ describe('app registry: POST/GET /v1/apps, rotate-key, app API keys', () => {
     f.get('/who', { onRequest: requireApp(db.pool) }, async (req) => ({ app: req.caller.id, kind: req.caller.kind }));
     const who = (authorization) => f.inject({ method: 'GET', url: '/who', headers: authorization ? { authorization } : {} });
     expect((await who(`Bearer ${key}`)).json()).toEqual({ app: 'starlyn', kind: 'app' });
+    expect(await appForKey(db.pool, key)).toMatchObject({ id: 'starlyn', kind: 'app', handoff: 'claim', deeplink_path: 'open' });
     for (const h of [undefined, 'Bearer nope', `Bearer ikfa_${'A'.repeat(43)}`, key]) {
       const res = await who(h);
       expect(res.statusCode).toBe(401);
diff --git a/services/core-api/test/helpers/identity.js b/services/core-api/test/helpers/identity.js
index 5686da4..925da71 100644
--- a/services/core-api/test/helpers/identity.js
+++ b/services/core-api/test/helpers/identity.js
@@ -29,7 +29,10 @@ export const APP_BODY = {
   adjust_tracker_url: 'https://app.adjust.com/abc123',
   deeplink_scheme: 'starlyn',
   webhook_url: 'https://be.starlyn.example/ikf/webhook',
+  handoff: 'claim',
 };
+// The same app on IKameSDK: the deep link carries the buyer's user_id (spec web-funnel-sdk-compat §2).
+export const SDK_APP_BODY = { ...APP_BODY, handoff: 'user_id', deeplink_path: 'open' };
 export const WEB_BODY = {
   id: 'tarot-web',
   name: 'Tarot Web',
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/apps.test.js 2>&1 | grep -E "×|Tests  "
```

Expected: FAIL 2 test (`handoff: user_id unless …`: app trả về chưa có `handoff`; `requireApp: …`: `appForKey` chưa có `handoff`), `Tests  2 failed | 7 passed (9)`. (Fastify bỏ khóa lạ trong body nên `handoff` của `APP_BODY` chưa làm hỏng test nào.)

- [ ] **Step 3: Implement**

`services/core-api/src/identity/apps.js`, `services/core-api/src/http/apps.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/http/apps.js b/services/core-api/src/http/apps.js
index fea0fdd..e9b61fd 100644
--- a/services/core-api/src/http/apps.js
+++ b/services/core-api/src/http/apps.js
@@ -32,6 +32,9 @@ export default async function appsHttp(app, { pool, webhookSecrets }) {
             deeplink_scheme: { type: 'string', maxLength: 31 },
             return_url: url,
             webhook_url: url,
+            handoff: { type: 'string', maxLength: 16 },
+            deeplink_path: { type: 'string', maxLength: 64 },
+            bundle_ids: { type: 'array', maxItems: 20, items: { type: 'string', maxLength: 200 } },
           },
         },
       },
diff --git a/services/core-api/src/identity/apps.js b/services/core-api/src/identity/apps.js
index 06c5ef3..9fb00c1 100644
--- a/services/core-api/src/identity/apps.js
+++ b/services/core-api/src/identity/apps.js
@@ -6,8 +6,11 @@ import { API_KEY_RE, newApiKey, newWebhookSecret, sha256 } from './tokens.js';
 export const APP_ID_RE = /^[a-z0-9][a-z0-9-]{1,30}$/;
 export const SCHEME_RE = /^[a-z][a-z0-9+.-]{1,30}$/;
 export const PREV_KEY_HOURS = 24;
+export const HANDOFFS = ['user_id', 'claim'];
+export const DEEPLINK_PATH_RE = /^[a-z0-9_-]{1,32}$/;
+export const BUNDLE_ID_RE = /^[A-Za-z0-9._-]{1,100}$/;
 
-const COLUMNS = 'id, name, kind, adjust_tracker_url, deeplink_scheme, return_url, webhook_url, prev_key_expires_at, created_at';
+const COLUMNS = 'id, name, kind, adjust_tracker_url, deeplink_scheme, return_url, webhook_url, handoff, deeplink_path, bundle_ids, prev_key_expires_at, created_at';
 
 export const appView = (r) => ({
   id: r.id,
@@ -17,6 +20,9 @@ export const appView = (r) => ({
   deeplink_scheme: r.deeplink_scheme,
   return_url: r.return_url,
   webhook_url: r.webhook_url,
+  handoff: r.kind === 'app' ? r.handoff : null,
+  deeplink_path: r.kind === 'app' ? r.deeplink_path : null,
+  bundle_ids: r.bundle_ids,
   prev_key_expires_at: r.prev_key_expires_at ? r.prev_key_expires_at.toISOString() : null,
   created_at: r.created_at.toISOString(),
 });
@@ -37,9 +43,12 @@ function checkApp(b) {
   if (b.kind === 'app') {
     if (!httpsUrl(b.adjust_tracker_url)) problems.push({ field: 'adjust_tracker_url', reason: 'https_required' });
     if (!SCHEME_RE.test(b.deeplink_scheme ?? '')) problems.push({ field: 'deeplink_scheme', reason: 'format' });
+    if (b.handoff !== undefined && !HANDOFFS.includes(b.handoff)) problems.push({ field: 'handoff', reason: 'format' });
+    if (b.deeplink_path !== undefined && !DEEPLINK_PATH_RE.test(b.deeplink_path)) problems.push({ field: 'deeplink_path', reason: 'format' });
   } else if (!httpsUrl(b.return_url)) {
     problems.push({ field: 'return_url', reason: 'https_required' });
   }
+  if (!(b.bundle_ids ?? []).every((id) => BUNDLE_ID_RE.test(id))) problems.push({ field: 'bundle_ids', reason: 'format' });
   if (problems.length) throw new HttpError(400, 'invalid_app', problems);
 }
 
@@ -59,10 +68,12 @@ export async function createApp(pool, webhookSecrets, b) {
   const isApp = b.kind === 'app';
   try {
     const { rows } = await pool.query(
-      `INSERT INTO apps (id, name, kind, adjust_tracker_url, deeplink_scheme, return_url, webhook_url, api_key_hash)
-       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING ${COLUMNS}`,
+      `INSERT INTO apps (id, name, kind, adjust_tracker_url, deeplink_scheme, return_url, webhook_url, api_key_hash,
+                         handoff, deeplink_path, bundle_ids)
+       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, 'user_id'), COALESCE($10, 'open'), $11) RETURNING ${COLUMNS}`,
       [b.id, b.name, b.kind, isApp ? b.adjust_tracker_url : null, isApp ? b.deeplink_scheme : null,
-        isApp ? null : b.return_url, b.webhook_url, sha256(apiKey)],
+        isApp ? null : b.return_url, b.webhook_url, sha256(apiKey),
+        isApp ? b.handoff ?? null : null, isApp ? b.deeplink_path ?? null : null, b.bundle_ids ?? []],
     );
     return { app: appView(rows[0]), api_key: apiKey, webhook_secret: secret };
   } catch (err) {
@@ -99,7 +110,7 @@ export async function appForKey(db, key) {
   if (!API_KEY_RE.test(key ?? '')) return null;
   const h = sha256(key);
   const { rows } = await db.query(
-    `SELECT id, name, kind, adjust_tracker_url, deeplink_scheme, return_url FROM apps
+    `SELECT id, name, kind, adjust_tracker_url, deeplink_scheme, return_url, handoff, deeplink_path FROM apps
       WHERE api_key_hash = $1 OR (prev_api_key_hash = $1 AND prev_key_expires_at > now())`,
     [h],
   );
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/apps.test.js 2>&1 | grep -E "Tests  "
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  9 passed (9)`; toàn bộ `Test Files  31 passed (31)`, `Tests  327 passed (327)`.

- [ ] **Step 5: Commit**

```bash
git add services/core-api
git commit -m "feat(core-api): apps take handoff (user_id | claim), deeplink_path and bundle_ids"
```

---

### Task 3: `handoff = user_id`: link Adjust mang `user_id`, email khôi phục, không claim / OTP / webhook

**Files:**
- Modify: `services/core-api/src/identity/claims.js`, `src/identity/link.js`, `src/identity/otp.js`, `src/identity/sync.js`
- Test: `services/core-api/test/sdk-handoff.test.js` (mới)

**Interfaces:**
- Consumes: `appForKey` có `handoff` (Task 2); `SDK_APP_BODY` (Task 2); `claimTokenFor`, `randomToken`, `sha256` (`tokens.js`).
- Produces (`src/identity/claims.js`):
  - `usesUserId(app) → boolean` = `app.kind === 'app' && app.handoff === 'user_id'` (C8).
  - `userAppLinkFor(app: {adjust_tracker_url, deeplink_scheme, deeplink_path}, userId) → string`.
  - `createClaimForCheckout`: app `user_id` → dòng `claim_tokens` với hash của token ngẫu nhiên (chỉ đánh dấu email).
- `claimForCheckout` (`GET /v1/checkout/:id/claim`): app `user_id` → `{app_link: userAppLinkFor(app, customers.user_id)}` khi có transaction `completed` của checkout, không thì `null` (202). `redeemClaim` → `404 claim_not_found`; `sendOtp` không làm gì; `verifyOtp` → `401 otp_invalid`.
- `claimEmail(app, link, {reusable = false})`; `sendClaimEmails` dùng link `user_id` + `reusable: true` cho app `user_id`.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/sdk-handoff.test.js` (tạo mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { syncMessage } from '../src/billing/sync.js';
import { userAppLinkFor } from '../src/identity/claims.js';
import { sendClaimEmails, syncOutbox } from '../src/identity/sync.js';
import { claimTokenFor } from '../src/identity/tokens.js';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, sha } from './helpers/app.js';
import { fakePaddle, paddleSub, paddleTxn } from './helpers/paddle.js';
import { CK, CLAIM_KEY, SDK_APP_BODY, custom, fakeMailer, fakeSecrets, inDays, seedShop } from './helpers/identity.js';

const ORIGIN = 'https://try.witch.example';
const T = (n) => `2026-10-09T10:00:0${n}.123456Z`;
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('handoff = user_id (IKameSDK): the Adjust deep link carries the buyer user_id', () => {
  let db;
  let app;
  let key;
  let paddle;
  let mailer;
  const log = { warn: () => {}, error: () => {}, info: () => {} };
  const q = async (sql, p) => (await db.pool.query(sql, p)).rows;
  const post = (url, payload) => app.inject({ method: 'POST', url, payload, headers: { authorization: `Bearer ${key}` } });
  const claimGet = () => app.inject({ method: 'GET', url: `/v1/checkout/${CK}/claim`, headers: { origin: ORIGIN } });
  const tick = () => syncOutbox({ pool: db.pool, claimKey: CLAIM_KEY, log });
  const emails = () => sendClaimEmails({ pool: db.pool, mailer, claimKey: CLAIM_KEY, log });
  const userId = async () => (await q("SELECT user_id FROM customers WHERE paddle_customer_id = 'ctm_1'"))[0].user_id;
  const buyWeekly = async () => {
    paddle.subscription(paddleSub({ status: 'active', custom_data: custom(CK), period_end: inDays(7), updated_at: T(1) }));
    paddle.transaction(paddleTxn({ id: 'txn_a', subscription_id: 'sub_1', custom_data: custom(CK), updated_at: T(2) }));
    await syncMessage({ pool: db.pool, paddle, log }, { entity: 'transaction', entity_id: 'txn_a' });
  };

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    const secrets = fakeSecrets();
    ({ api_key: key } = await seedShop(db.pool, { secrets, app: SDK_APP_BODY }));
    await db.pool.query("INSERT INTO domains (host, status) VALUES ('try.witch.example', 'active')");
    paddle = fakePaddle();
    paddle.customer('ctm_1', 'buyer@example.com');
    mailer = fakeMailer();
    ({ app } = await makeApp(db.pool, { webhookSecrets: secrets, claimKey: CLAIM_KEY, mailer }));
  });
  afterEach(() => app.close());

  it('userAppLinkFor keeps the tracker query and uses the app deeplink_path', () => {
    const uid = '3f1c2a9e-4b7d-4c1e-9a2b-0c4d5e6f7a8b';
    expect(userAppLinkFor(SDK_APP_BODY, uid).replace(uid, '<uuid>')).toBe(
      'https://app.adjust.com/abc123?deep_link=starlyn%3A%2F%2Fopen%3Fuser_id%3D<uuid>',
    );
    const goLink = { adjust_tracker_url: 'https://starlyn.go.link/x?adj_t=abc', deeplink_scheme: 'starlyn', deeplink_path: 'restore' };
    expect(userAppLinkFor(goLink, uid)).toBe(`https://starlyn.go.link/x?adj_t=abc&deep_link=starlyn%3A%2F%2Frestore%3Fuser_id%3D${uid}`);
  });

  it('GET /v1/checkout/:id/claim: 202 until the payment is completed, then the user_id link (no entitlement-sync tick needed)', async () => {
    expect((await claimGet()).statusCode).toBe(202);
    await buyWeekly();
    const res = await claimGet();
    expect(res.statusCode).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe(ORIGIN);
    const uid = await userId();
    expect(uid).toMatch(UUID_V4);
    expect(res.json()).toEqual({ app_link: userAppLinkFor(SDK_APP_BODY, uid) });
    expect(res.body).not.toContain('buyer');
    await db.pool.query("UPDATE checkouts SET completed_at = now() - interval '61 minutes'");
    expect((await claimGet()).json()).toEqual({ error: 'claim_not_found' });
  });

  it('entitlement-sync: entitlements as usual, a claim row that only tracks the email (no redeemable token), no webhook', async () => {
    await buyWeekly();
    await tick();
    expect(await q('SELECT app_id, key, active FROM entitlements')).toEqual([{ app_id: 'starlyn', key: 'premium', active: true }]);
    const rows = await q('SELECT token_hash, checkout_id FROM claim_tokens');
    expect(rows).toHaveLength(1);
    expect(rows[0].checkout_id).toBe(CK);
    expect(rows[0].token_hash).not.toBe(sha(claimTokenFor(CLAIM_KEY, CK)));
    const redeem = await post('/v1/claims/redeem', { token: claimTokenFor(CLAIM_KEY, CK), app_user_id: 'u1' });
    expect(redeem.statusCode).toBe(404);
    expect(redeem.json()).toEqual({ error: 'claim_not_found' });
    await db.pool.query('UPDATE outbox SET published_at = NULL');
    await tick();
    expect(await q('SELECT count(*)::int AS n FROM claim_tokens')).toEqual([{ n: 1 }]);
    expect(await q('SELECT count(*)::int AS n FROM webhook_deliveries')).toEqual([{ n: 0 }]);
  });

  it('the email after payment carries the same user_id link, says to keep it, and goes out once', async () => {
    await buyWeekly();
    await tick();
    expect(await emails()).toEqual({ sent: 1 });
    expect(await emails()).toEqual({ sent: 0 });
    const [m] = mailer.sent;
    const link = userAppLinkFor(SDK_APP_BODY, await userId());
    expect(m.to).toBe('buyer@example.com');
    expect(m.subject).toBe('Your Starlyn access is ready');
    expect(m.text).toContain(link);
    expect(m.html).toContain(`<a href="${link.replace(/&/g, '&amp;')}">`);
    expect(m.text).toContain('Keep this email');
    expect(m.text).not.toContain('works once');
    expect(m.text).not.toContain('6-digit code');
  });

  it('OTP: send answers 200 {} and stores or mails nothing; verify is 401 otp_invalid', async () => {
    await buyWeekly();
    await tick();
    const sent = await post('/v1/otp/send', { email: 'buyer@example.com' });
    expect(sent.statusCode).toBe(200);
    expect(sent.json()).toEqual({});
    await new Promise((r) => setTimeout(r, 20));
    expect(mailer.sent).toEqual([]);
    expect(await q('SELECT count(*)::int AS n FROM otp_codes')).toEqual([{ n: 0 }]);
    const verify = await post('/v1/otp/verify', { email: 'buyer@example.com', code: '123456', app_user_id: 'u1' });
    expect(verify.statusCode).toBe(401);
    expect(verify.json()).toEqual({ error: 'otp_invalid' });
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/sdk-handoff.test.js 2>&1 | grep -E "×|Tests  "
```

Expected: FAIL cả 5 (`userAppLinkFor is not a function`, link vẫn là claim token, email cũ, OTP vẫn gửi), `Tests  5 failed (5)`.

- [ ] **Step 3: Implement**

`claims.js`, `link.js`, `otp.js`, `sync.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/identity/claims.js b/services/core-api/src/identity/claims.js
index 8c72f2c..70dc17a 100644
--- a/services/core-api/src/identity/claims.js
+++ b/services/core-api/src/identity/claims.js
@@ -1,7 +1,10 @@
-import { claimTokenFor, sha256 } from './tokens.js';
+import { claimTokenFor, randomToken, sha256 } from './tokens.js';
 
 export const CLAIM_TTL_DAYS = 7;
 
+// handoff = user_id (IKameSDK, spec web-funnel-sdk-compat §2) applies to kind 'app' only; web apps ignore it.
+export const usesUserId = (app) => app.kind === 'app' && app.handoff === 'user_id';
+
 // <adjust_tracker_url>?deep_link=<url-encoded "<scheme>://claim?t=<token>"> (spec §3). Never an email.
 export function appLinkFor(app, token) {
   const u = new URL(app.adjust_tracker_url);
@@ -9,11 +12,20 @@ export function appLinkFor(app, token) {
   return u.toString();
 }
 
+// handoff = user_id: <adjust_tracker_url>?deep_link=<url-encoded "<scheme>://<deeplink_path>?user_id=<uuid>">.
+// The same link every time (web page and email): it is how a reinstall restores the purchase.
+export function userAppLinkFor(app, userId) {
+  const u = new URL(app.adjust_tracker_url);
+  u.searchParams.set('deep_link', `${app.deeplink_scheme}://${app.deeplink_path}?user_id=${userId}`);
+  return u.toString();
+}
+
 // payment.succeeded with a checkout of a funnel whose app is kind 'app' → one claim token per checkout
 // (unique checkout_id; the token is derived, so a replay inserts nothing). Returns true if inserted.
+// handoff = user_id: the row only tracks the email after payment; its token is random and never shown.
 export async function createClaimForCheckout(c, { claimKey, checkoutId, customerId, log }) {
   const { rows } = await c.query(
-    `SELECT a.id AS app_id FROM checkouts ck JOIN funnels f ON f.id = ck.funnel_id JOIN apps a ON a.id = f.app_id
+    `SELECT a.id AS app_id, a.handoff FROM checkouts ck JOIN funnels f ON f.id = ck.funnel_id JOIN apps a ON a.id = f.app_id
       WHERE ck.id = $1 AND a.kind = 'app'`,
     [checkoutId],
   );
@@ -22,7 +34,7 @@ export async function createClaimForCheckout(c, { claimKey, checkoutId, customer
     log?.warn({ checkout_id: checkoutId }, 'claim_skipped_no_customer');
     return false;
   }
-  const token = claimTokenFor(claimKey, checkoutId);
+  const token = rows[0].handoff === 'user_id' ? randomToken(32) : claimTokenFor(claimKey, checkoutId);
   const r = await c.query(
     `INSERT INTO claim_tokens (token_hash, customer_id, app_id, checkout_id, expires_at)
      VALUES ($1, $2, $3, $4, now() + make_interval(days => $5)) ON CONFLICT DO NOTHING`,
diff --git a/services/core-api/src/identity/link.js b/services/core-api/src/identity/link.js
index 3381bb9..7eda2be 100644
--- a/services/core-api/src/identity/link.js
+++ b/services/core-api/src/identity/link.js
@@ -1,5 +1,5 @@
 import { HttpError } from '../errors.js';
-import { appLinkFor } from './claims.js';
+import { appLinkFor, userAppLinkFor, usesUserId } from './claims.js';
 import { addDelivery, customerRef, entitlementsOf, lockCustomer } from './entitlements.js';
 import { claimTokenFor, randomToken, sha256, TOKEN_RE } from './tokens.js';
 
@@ -93,7 +93,11 @@ async function redeem(pool, table, notFound, used, expired, { app, token, appUse
   });
 }
 
-export const redeemClaim = (pool, args) => redeem(pool, 'claim_tokens', 'claim_not_found', 'claim_used', 'claim_expired', args);
+// handoff = user_id apps have no claim token to redeem: the app reads the buyer's user_id from the deep link.
+export async function redeemClaim(pool, args) {
+  if (usesUserId(args.app)) throw new HttpError(404, 'claim_not_found');
+  return redeem(pool, 'claim_tokens', 'claim_not_found', 'claim_used', 'claim_expired', args);
+}
 export const redeemMagic = (pool, args) => redeem(pool, 'magic_links', 'magic_not_found', 'magic_used', 'magic_expired', args);
 
 export async function userEntitlements(db, { appId, appUserId }) {
@@ -110,7 +114,7 @@ export async function userEntitlements(db, { appId, appUserId }) {
 // web2web buyer restores by email); 429 claim_limit after 5 magic links for one checkout.
 export async function claimForCheckout(pool, { claimKey, checkoutId }) {
   const { rows } = await pool.query(
-    `SELECT a.id, a.kind, a.adjust_tracker_url, a.deeplink_scheme, a.return_url, (f.app_id IS NOT NULL) AS has_app,
+    `SELECT a.id, a.kind, a.adjust_tracker_url, a.deeplink_scheme, a.deeplink_path, a.handoff, a.return_url, (f.app_id IS NOT NULL) AS has_app,
             (ck.completed_at IS NOT NULL AND ck.completed_at <= now() - make_interval(mins => $2)) AS closed
        FROM checkouts ck JOIN funnels f ON f.id = ck.funnel_id LEFT JOIN apps a ON a.id = f.app_id WHERE ck.id = $1`,
     [checkoutId, CLAIM_WINDOW_MINUTES],
@@ -119,6 +123,14 @@ export async function claimForCheckout(pool, { claimKey, checkoutId }) {
   const app = rows[0];
   if (!app.has_app) throw new HttpError(404, 'no_app');
   if (app.closed) throw new HttpError(404, 'claim_not_found');
+  if (usesUserId(app)) {
+    const paid = await pool.query(
+      `SELECT cu.user_id FROM transactions t JOIN customers cu ON cu.id = t.customer_id
+        WHERE t.checkout_id = $1 AND t.status = 'completed' LIMIT 1`,
+      [checkoutId],
+    );
+    return paid.rows.length ? { app_link: userAppLinkFor(app, paid.rows[0].user_id) } : null;
+  }
   if (app.kind === 'app') {
     const claim = await pool.query('SELECT 1 FROM claim_tokens WHERE checkout_id = $1', [checkoutId]);
     return claim.rows.length ? { app_link: appLinkFor(app, claimTokenFor(claimKey, checkoutId)) } : null;
diff --git a/services/core-api/src/identity/otp.js b/services/core-api/src/identity/otp.js
index 94cf7fb..9a02d35 100644
--- a/services/core-api/src/identity/otp.js
+++ b/services/core-api/src/identity/otp.js
@@ -1,5 +1,6 @@
 import { randomInt } from 'node:crypto';
 import { HttpError } from '../errors.js';
+import { usesUserId } from './claims.js';
 import { link, linkView, withTx } from './link.js';
 import { emailHash, safeEqual, sha256 } from './tokens.js';
 
@@ -26,7 +27,9 @@ export async function customerForEmail(db, email, appId) {
 // POST /v1/otp/send: always 200 {} to the caller (spec §3). A code is stored and mailed only for a buyer
 // with entitlements in this app, at most 3 per hour per (email_hash, app). The SES call is NOT awaited, so
 // the reply time does not tell a buyer's email from a stranger's (Review Focus 3).
+// handoff = user_id apps restore through the user_id link in the email: nothing is stored or sent.
 export async function sendOtp(pool, { app, email, mailer, log }) {
+  if (usesUserId(app)) return;
   const h = emailHash(email);
   const recent = await pool.query(
     "SELECT count(*)::int AS n FROM otp_codes WHERE email_hash = $1 AND app_id = $2 AND created_at > now() - interval '1 hour'",
@@ -59,6 +62,7 @@ export async function sendOtp(pool, { app, email, mailer, log }) {
 // POST /v1/otp/verify: the latest unused code of (email_hash, app). Wrong → 401 otp_invalid (the attempt
 // is counted and committed); 5 wrong → 429 otp_locked; right → link like a claim (spec §3).
 export async function verifyOtp(pool, { app, email, code, appUserId }) {
+  if (usesUserId(app)) throw new HttpError(401, 'otp_invalid');
   const h = emailHash(email);
   const out = await withTx(pool, async (c) => {
     const { rows } = await c.query(
diff --git a/services/core-api/src/identity/sync.js b/services/core-api/src/identity/sync.js
index 7e5e672..9129a1e 100644
--- a/services/core-api/src/identity/sync.js
+++ b/services/core-api/src/identity/sync.js
@@ -1,5 +1,5 @@
 import { isUlid } from '@ikf/event-schema';
-import { appLinkFor, createClaimForCheckout } from './claims.js';
+import { appLinkFor, createClaimForCheckout, userAppLinkFor, usesUserId } from './claims.js';
 import { recompute } from './entitlements.js';
 import { claimTokenFor, emailHash } from './tokens.js';
 
@@ -150,21 +150,20 @@ export async function sweepExpired({ pool, log, alarm, now = () => new Date() })
   return { customers: rows.length, deliveries };
 }
 
-export function claimEmail(app, link) {
+// reusable: the handoff = user_id link (always the same link, how a new phone or a reinstall restores).
+export function claimEmail(app, link, { reusable = false } = {}) {
   const subject = `Your ${app.name} access is ready`;
-  const text = [
-    `Thanks for your purchase! Open ${app.name} with this link to unlock what you bought:`,
-    '',
-    link,
-    '',
-    'The link works once and expires in 7 days.',
-    `On another phone, or after reinstalling, open ${app.name}, choose "Restore purchase" and enter this email address: we send you a 6-digit code.`,
-  ].join('\n');
+  const after = reusable
+    ? ['Keep this email: on another phone, or after reinstalling, open this link again to restore your purchase.']
+    : [
+      'The link works once and expires in 7 days.',
+      `On another phone, or after reinstalling, open ${app.name}, choose "Restore purchase" and enter this email address: we send you a 6-digit code.`,
+    ];
+  const text = [`Thanks for your purchase! Open ${app.name} with this link to unlock what you bought:`, '', link, '', ...after].join('\n');
   const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
   const html = `<p>Thanks for your purchase! Open ${esc(app.name)} to unlock what you bought:</p>`
     + `<p><a href="${esc(link)}">Open ${esc(app.name)}</a></p>`
-    + '<p>The link works once and expires in 7 days.</p>'
-    + `<p>On another phone, or after reinstalling, open ${esc(app.name)}, choose "Restore purchase" and enter this email address: we send you a 6-digit code.</p>`;
+    + after.map((p) => `<p>${esc(p)}</p>`).join('');
   return { subject, text, html };
 }
 
@@ -185,7 +184,8 @@ export async function sendClaimEmails({ pool, mailer, claimKey, alarm, log, batc
                WHERE emailed_at IS NULL AND email_attempts < $1 AND checkout_id IS NOT NULL AND expires_at > now() AND next_email_at <= now()
                ORDER BY next_email_at, created_at LIMIT $2 FOR UPDATE SKIP LOCKED)
         AND cu.id = ct.customer_id AND a.id = ct.app_id
-      RETURNING ct.token_hash, ct.checkout_id, ct.email_attempts AS attempts, cu.email, a.id AS app_id, a.name, a.adjust_tracker_url, a.deeplink_scheme`,
+      RETURNING ct.token_hash, ct.checkout_id, ct.email_attempts AS attempts, cu.email, cu.user_id, a.id AS app_id, a.name, a.kind,
+                a.handoff, a.adjust_tracker_url, a.deeplink_scheme, a.deeplink_path`,
     [CLAIM_EMAIL_ATTEMPTS, batch, CLAIM_EMAIL_BACKOFF_S[0], CLAIM_EMAIL_BACKOFF_S[1]],
   );
   let sent = 0;
@@ -195,9 +195,10 @@ export async function sendClaimEmails({ pool, mailer, claimKey, alarm, log, batc
       log?.warn({ checkout_id: r.checkout_id }, 'claim_email_no_address');
       continue;
     }
-    const link = appLinkFor(r, claimTokenFor(claimKey, r.checkout_id));
+    const reusable = usesUserId(r);
+    const link = reusable ? userAppLinkFor(r, r.user_id) : appLinkFor(r, claimTokenFor(claimKey, r.checkout_id));
     try {
-      await mailer.send({ to: r.email, ...claimEmail(r, link) });
+      await mailer.send({ to: r.email, ...claimEmail(r, link, { reusable }) });
     } catch (err) {
       const code = errCode(err);
       log?.warn({ checkout_id: r.checkout_id, email_hash: emailHash(r.email), attempts: r.attempts, code }, 'claim_email_failed');
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/sdk-handoff.test.js 2>&1 | grep -E "Tests  "
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  5 passed (5)`; toàn bộ `Test Files  32 passed (32)`, `Tests  332 passed (332)` — `claims.test.js`, `otp.test.js`, `entitlement-sync.test.js` (app `claim`) pass không đổi.

- [ ] **Step 5: Commit**

```bash
git add services/core-api
git commit -m "feat(core-api): handoff user_id: Adjust link with the buyer user_id, restore email, no claim / OTP / webhook"
```

---

### Task 4: `sdk-contract.js` + `POST /v1/payment/check-purchased-web-funnel`

**Files:**
- Create: `services/core-api/src/identity/sdk-contract.js`, `src/identity/purchased.js`, `src/http/sdk.js`
- Modify: `services/core-api/src/app.js`
- Test: `services/core-api/test/check-purchased.test.js` (mới)

**Interfaces:**
- Consumes: `entitlements` (đã tính bởi `entitlement-sync`), `customers.user_id`, `apps.bundle_ids`; `sha256` (`tokens.js`).
- Produces:
  - `sdk-contract.js`: `PATH`, `REQUEST_USER_ID_FIELD`, `REQUEST_APP_FIELD`, `RESPONSE_IS_PRO_FIELD`, `RESPONSE_EXPIRES_FIELD`, `FOREVER_EXPIRES_VALUE`, `readRequest(body) → {userId: string|null, app: string|null}`, `responseBody({isPro, expiresAt: Date|null}) → object`, `contractJson() → {path, request_user_id_field, request_app_field, response_is_pro_field, response_expires_field, forever_expires_value}` (trang app giả của demo dùng, Task 13).
  - `purchased.js`: `USER_ID_RE`, `checkPurchased(db, {userId, app}) → {isPro, expiresAt: Date|null}` (C3, C4).
  - Route đăng ký khi `deps.pool && deps.claimKey` (C9). Log `check_purchased {user_hash, is_pro, app_id?}`; lỗi DB log `check_purchased_failed {code}`.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/check-purchased.test.js` (tạo mới):

```js
import { Writable } from 'node:stream';
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { buildApp } from '../src/app.js';
import { syncMessage } from '../src/billing/sync.js';
import {
  FOREVER_EXPIRES_VALUE, PATH, REQUEST_APP_FIELD, REQUEST_USER_ID_FIELD, RESPONSE_EXPIRES_FIELD, RESPONSE_IS_PRO_FIELD,
} from '../src/identity/sdk-contract.js';
import { sweepExpired, syncOutbox } from '../src/identity/sync.js';
import { startDb, resetDb } from './helpers/db.js';
import { PREVIEW, makeApp, sha } from './helpers/app.js';
import { fakePaddle, paddleSub, paddleTxn } from './helpers/paddle.js';
import { CK, CLAIM_KEY, SDK_APP_BODY, custom, fakeMailer, fakeSecrets, inDays, seedApp, seedShop } from './helpers/identity.js';

const T = (n) => `2026-10-09T10:00:0${n}.123456Z`;
const STRANGER = '0b8e7c1a-2f3d-4e5f-8a9b-1c2d3e4f5a6b';
const GRACE_MS = 3 * 86400_000;

describe(`POST ${PATH} (IKameSDK mode NOT_AUTH)`, () => {
  let db;
  let app;
  let paddle;
  const log = { warn: () => {}, error: () => {}, info: () => {} };
  const q = async (sql, p) => (await db.pool.query(sql, p)).rows;
  const check = (body, headers = {}) => app.inject({ method: 'POST', url: PATH, payload: body, headers });
  const isPro = async (userId, extra = {}) => (await check({ [REQUEST_USER_ID_FIELD]: userId, ...extra })).json();
  const tick = () => syncOutbox({ pool: db.pool, claimKey: CLAIM_KEY, log });
  const userId = async () => (await q("SELECT user_id FROM customers WHERE paddle_customer_id = 'ctm_1'"))[0].user_id;
  const adj = (id, type) => ({ id, action: 'refund', status: 'approved', type, totals: { total: '1367', currency_code: 'USD' } });
  const buyWeekly = async ({ periodEnd = inDays(7), adjustments = [], updatedAt = T(2) } = {}) => {
    paddle.subscription(paddleSub({ status: 'active', custom_data: custom(CK), period_end: periodEnd, updated_at: T(1) }));
    paddle.transaction(paddleTxn({ id: 'txn_a', subscription_id: 'sub_1', custom_data: custom(CK), updated_at: updatedAt, adjustments }));
    await syncMessage({ pool: db.pool, paddle, log }, { entity: 'transaction', entity_id: 'txn_a' });
    await tick();
  };
  const answer = (pro, expires) => ({ [RESPONSE_IS_PRO_FIELD]: pro, [RESPONSE_EXPIRES_FIELD]: expires });

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    await seedShop(db.pool, { app: SDK_APP_BODY });
    paddle = fakePaddle();
    paddle.customer('ctm_1', 'buyer@example.com');
    ({ app } = await makeApp(db.pool, { webhookSecrets: fakeSecrets(), claimKey: CLAIM_KEY, mailer: fakeMailer() }));
  });
  afterEach(() => app.close());

  it('pro once entitlement-sync has run, until the end of the period + 3 days; never cached, no CORS', async () => {
    paddle.subscription(paddleSub({ status: 'active', custom_data: custom(CK), period_end: inDays(7), updated_at: T(1) }));
    paddle.transaction(paddleTxn({ id: 'txn_a', subscription_id: 'sub_1', custom_data: custom(CK), updated_at: T(2) }));
    await syncMessage({ pool: db.pool, paddle, log }, { entity: 'transaction', entity_id: 'txn_a' });
    const uid = await userId();
    expect(await isPro(uid)).toEqual(answer(false, null));
    await tick();
    const res = await check({ [REQUEST_USER_ID_FIELD]: uid }, { origin: 'https://evil.example' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
    const [{ expires_at: end }] = await q('SELECT expires_at FROM entitlements');
    expect(res.json()).toEqual(answer(true, end.toISOString()));
    const period = (await q('SELECT current_period_end FROM subscriptions'))[0].current_period_end;
    expect(end.getTime() - period.getTime()).toBe(GRACE_MS);
    expect(await isPro(uid.toUpperCase())).toEqual(answer(true, end.toISOString()));
  });

  it('a full refund turns pro off; a partial refund does not', async () => {
    await buyWeekly();
    const uid = await userId();
    await buyWeekly({ adjustments: [adj('adj_p', 'partial')], updatedAt: T(3) });
    expect((await isPro(uid))[RESPONSE_IS_PRO_FIELD]).toBe(true);
    await buyWeekly({ adjustments: [adj('adj_p', 'partial'), adj('adj_f', 'full')], updatedAt: T(4) });
    expect(await isPro(uid)).toEqual(answer(false, null));
  });

  it('weekly plan: off once the period + 3 days are over (sweep), and at once when the stored end has passed', async () => {
    await buyWeekly();
    const uid = await userId();
    await db.pool.query("UPDATE entitlements SET expires_at = now() - interval '1 minute'");
    expect(await isPro(uid)).toEqual(answer(false, null));
    await sweepExpired({ pool: db.pool, log, now: () => new Date(Date.now() + 8 * 86400_000 + GRACE_MS) });
    expect(await q('SELECT active FROM entitlements')).toEqual([{ active: false }]);
    expect(await isPro(uid)).toEqual(answer(false, null));
  });

  it('unknown, malformed or missing user_id: 200 not pro, never a 4xx (the SDK would keep a stale pro)', async () => {
    await buyWeekly();
    for (const body of [
      { [REQUEST_USER_ID_FIELD]: STRANGER },
      { [REQUEST_USER_ID_FIELD]: 'not-a-uuid' },
      { [REQUEST_USER_ID_FIELD]: '{email}' },
      { [REQUEST_USER_ID_FIELD]: 42 },
      {},
      [],
    ]) {
      const res = await check(body);
      expect(res.statusCode, JSON.stringify(body)).toBe(200);
      expect(res.json()).toEqual(answer(false, null));
    }
  });

  it('scoped to one app when the body names it (app id or bundle id), else every app; one-time = forever', async () => {
    await buyWeekly();
    const uid = await userId();
    await seedApp(db.pool, fakeSecrets(), { ...SDK_APP_BODY, id: 'zodiac', name: 'Zodiac' });
    await db.pool.query("UPDATE apps SET bundle_ids = '{com.ikame.starlyn,6471234567}' WHERE id = 'starlyn'");
    const cid = (await q("SELECT id FROM customers WHERE paddle_customer_id = 'ctm_1'"))[0].id;
    await db.pool.query(
      "INSERT INTO entitlements (customer_id, app_id, key, active, expires_at, source, source_id) VALUES ($1, 'zodiac', 'lifetime', true, NULL, 'one_time', 'txn_z')",
      [cid],
    );
    const weekly = (await q("SELECT expires_at FROM entitlements WHERE app_id = 'starlyn'"))[0].expires_at.toISOString();
    expect(await isPro(uid, { [REQUEST_APP_FIELD]: 'com.ikame.starlyn' })).toEqual(answer(true, weekly));
    expect(await isPro(uid, { [REQUEST_APP_FIELD]: '6471234567' })).toEqual(answer(true, weekly));
    expect(await isPro(uid, { [REQUEST_APP_FIELD]: 'starlyn' })).toEqual(answer(true, weekly));
    expect(await isPro(uid, { [REQUEST_APP_FIELD]: 'zodiac' })).toEqual(answer(true, FOREVER_EXPIRES_VALUE));
    expect(await isPro(uid, { [REQUEST_APP_FIELD]: 'com.other.app' })).toEqual(answer(false, null));
    expect(await isPro(uid)).toEqual(answer(true, FOREVER_EXPIRES_VALUE));
  });

  it('logs check_purchased with the user_id hash only; a DB failure is 503 unavailable (the SDK keeps its cache)', async () => {
    await buyWeekly();
    const uid = await userId();
    let logs = '';
    const stream = new Writable({ write(chunk, _enc, done) { logs += chunk; done(); } });
    const deps = { previewBaseUrl: PREVIEW, claimKey: CLAIM_KEY };
    const logged = buildApp({ logger: { level: 'info', stream }, deps: { ...deps, pool: db.pool } });
    const res = await logged.inject({ method: 'POST', url: PATH, payload: { [REQUEST_USER_ID_FIELD]: uid, [REQUEST_APP_FIELD]: 'starlyn' } });
    expect(res.json()[RESPONSE_IS_PRO_FIELD]).toBe(true);
    const line = logs.split('\n').map((l) => (l ? JSON.parse(l) : {})).find((l) => l.msg === 'check_purchased');
    expect(line).toMatchObject({ user_hash: sha(uid), is_pro: true, app_id: 'starlyn' });
    expect(logs).not.toContain(uid);
    await logged.close();

    const down = { query: async () => { throw Object.assign(new Error(`connect ECONNREFUSED for ${uid}`), { code: 'ECONNREFUSED' }); } };
    logs = '';
    const broken = buildApp({ logger: { level: 'info', stream }, deps: { ...deps, pool: down } });
    const fail = await broken.inject({ method: 'POST', url: PATH, payload: { [REQUEST_USER_ID_FIELD]: uid } });
    expect(fail.statusCode).toBe(503);
    expect(fail.json()).toEqual({ error: 'unavailable' });
    expect(fail.headers['cache-control']).toBe('no-store');
    expect(logs).toContain('"code":"ECONNREFUSED"');
    expect(logs).not.toContain(uid);
    await broken.close();
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/check-purchased.test.js 2>&1 | grep -E "Error|Tests  "
```

Expected: FAIL — `Cannot find module '../src/identity/sdk-contract.js'` (`Test Files  1 failed (1)`, `Tests  no tests`).

- [ ] **Step 3: Implement**

`services/core-api/src/identity/sdk-contract.js` (tạo mới):

```js
// POST /v1/payment/check-purchased-web-funnel: what IKameSDK (mode NOT_AUTH) sends and reads back.
// Tên field tạm theo tài liệu SDK (developers.begamob.com, đọc 2026-10-10); cập nhật khi có swagger api-slt-aio.
// Every name and shape of this endpoint lives in this file only: core-api, its tests and the demo's fake app
// page all read it from here, so a swagger change touches one file.
export const PATH = '/v1/payment/check-purchased-web-funnel';
export const REQUEST_USER_ID_FIELD = 'user_id';
// App / bundle id the SDK sends along (matched against apps.id and apps.bundle_ids); absent = every app.
export const REQUEST_APP_FIELD = 'bundle_id';
export const RESPONSE_IS_PRO_FIELD = 'is_pro';
export const RESPONSE_EXPIRES_FIELD = 'expires_at';
// expires_at of a purchase that never ends (one-time add-on).
export const FOREVER_EXPIRES_VALUE = null;

const str = (v) => (typeof v === 'string' ? v : null);

// Request body → {userId, app}: strings or null; anything else (no object, wrong types) reads as null.
export function readRequest(body) {
  const b = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  return { userId: str(b[REQUEST_USER_ID_FIELD]), app: str(b[REQUEST_APP_FIELD]) };
}

// {isPro, expiresAt: Date | null (= forever)} → response body. Not pro → expires null.
export function responseBody({ isPro, expiresAt }) {
  const expires = !isPro ? null : expiresAt === null ? FOREVER_EXPIRES_VALUE : expiresAt.toISOString();
  return { [RESPONSE_IS_PRO_FIELD]: isPro, [RESPONSE_EXPIRES_FIELD]: expires };
}

// The same names as JSON, for pages that call the endpoint (the demo's fake app).
export const contractJson = () => ({
  path: PATH,
  request_user_id_field: REQUEST_USER_ID_FIELD,
  request_app_field: REQUEST_APP_FIELD,
  response_is_pro_field: RESPONSE_IS_PRO_FIELD,
  response_expires_field: RESPONSE_EXPIRES_FIELD,
  forever_expires_value: FOREVER_EXPIRES_VALUE,
});
```

`services/core-api/src/identity/purchased.js` (tạo mới):

```js
// Pull-style answers for IKameSDK (spec web-funnel-sdk-compat §3, §4): read the entitlements entitlement-sync
// already computed, never recompute. customers.user_id is a bearer secret: callers log its sha256 only.
export const USER_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// app: an apps.id or one of an app's bundle_ids, or null for every app. An entitlement whose stored end has
// passed counts as off even before the 5-minute expiry sweep flips it.
// → {isPro, expiresAt: Date | null}; expiresAt is the farthest end of the active entitlements, null = forever.
export async function checkPurchased(db, { userId, app = null }) {
  if (!USER_ID_RE.test(userId ?? '')) return { isPro: false, expiresAt: null };
  const { rows } = await db.query(
    `SELECT e.expires_at FROM customers c JOIN entitlements e ON e.customer_id = c.id
      WHERE c.user_id = $1 AND e.active AND (e.expires_at IS NULL OR e.expires_at > now())
        AND ($2::text IS NULL OR e.app_id IN (SELECT id FROM apps WHERE id = $2 OR $2 = ANY (bundle_ids)))`,
    [userId.toLowerCase(), app],
  );
  if (!rows.length) return { isPro: false, expiresAt: null };
  if (rows.some((r) => r.expires_at === null)) return { isPro: true, expiresAt: null };
  return { isPro: true, expiresAt: new Date(Math.max(...rows.map((r) => r.expires_at.getTime()))) };
}
```

`services/core-api/src/http/sdk.js` (tạo mới):

```js
import { checkPurchased } from '../identity/purchased.js';
import { PATH, readRequest, responseBody } from '../identity/sdk-contract.js';
import { sha256 } from '../identity/tokens.js';

// IKameSDK mode NOT_AUTH (spec web-funnel-sdk-compat §3): public, no auth, no CORS (the SDK calls from native
// code), never cached. An unknown or malformed user_id is 200 not pro: the SDK keeps its cache on errors, so a
// 4xx would keep a stale pro forever. A DB failure is 503 (the SDK keeps its cache). Logs never hold the user_id.
export default async function sdkHttp(app, { pool }) {
  app.post(PATH, { bodyLimit: 4096 }, async (req, reply) => {
    reply.header('cache-control', 'no-store');
    const { userId, app: appRef } = readRequest(req.body);
    let out;
    try {
      out = await checkPurchased(pool, { userId, app: appRef });
    } catch (err) {
      req.log.error({ code: String(err?.code ?? err?.name ?? 'Error') }, 'check_purchased_failed');
      return reply.code(503).send({ error: 'unavailable' });
    }
    req.log.info({ user_hash: userId ? sha256(userId.toLowerCase()) : null, is_pro: out.isPro, ...(appRef && { app_id: appRef }) }, 'check_purchased');
    return responseBody(out);
  });
}
```

`services/core-api/src/app.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/app.js b/services/core-api/src/app.js
index 80aac1f..c93b038 100644
--- a/services/core-api/src/app.js
+++ b/services/core-api/src/app.js
@@ -12,6 +12,7 @@ import billingHttp from './http/billing.js';
 import appsHttp from './http/apps.js';
 import identityHttp from './http/identity.js';
 import claimHttp from './http/claim.js';
+import sdkHttp from './http/sdk.js';
 
 export function buildApp({ checks = {}, timeoutMs = 1000, logger = false, deps } = {}) {
   const app = Fastify({ logger });
@@ -56,6 +57,7 @@ export function buildApp({ checks = {}, timeoutMs = 1000, logger = false, deps }
   if (deps?.pool && deps?.webhookSecrets) app.register(appsHttp, deps);
   if (deps?.pool && deps?.claimKey && deps?.mailer) app.register(identityHttp, deps);
   if (deps?.pool && deps?.claimKey) app.register(claimHttp, deps);
+  if (deps?.pool && deps?.claimKey) app.register(sdkHttp, deps);
 
   return app;
 }
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/check-purchased.test.js 2>&1 | grep -E "Tests  "
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  6 passed (6)`; toàn bộ `Test Files  33 passed (33)`, `Tests  338 passed (338)`.

- [ ] **Step 5: Commit**

```bash
git add services/core-api
git commit -m "feat(core-api): POST /v1/payment/check-purchased-web-funnel for IKameSDK; field names in one sdk-contract module"
```

---

### Task 5: Mode AUTH `POST /v1/web-funnel/entitlements` + `user_id` trong tra cứu khách

**Files:**
- Modify: `services/core-api/src/identity/purchased.js`, `src/http/identity.js`, `src/identity/customers.js`
- Test: `services/core-api/test/web-funnel-auth.test.js` (mới)

**Interfaces:**
- Consumes: `requireApp` (Bearer `ikfa_`, `req.caller`), `linkView(c, customerId, appId) → {customer_ref, entitlements}` (`link.js`), `USER_ID_RE` (Task 4).
- Produces: `webFunnelEntitlements(db, {appId, userId}) → {customer_ref: string|null, entitlements: [{key, active, expires_at}]}`; route `POST /v1/web-funnel/entitlements {user_id}` (C2); `customerReport` thêm `user_id` (dùng ở Task 7 `ikf customer show`).

- [ ] **Step 1: Viết test fail**

`services/core-api/test/web-funnel-auth.test.js` (tạo mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { syncMessage } from '../src/billing/sync.js';
import { syncOutbox } from '../src/identity/sync.js';
import { startDb, resetDb } from './helpers/db.js';
import { bearer, makeApp, tokenFor } from './helpers/app.js';
import { fakePaddle, paddleSub, paddleTxn } from './helpers/paddle.js';
import { CK, CLAIM_KEY, SDK_APP_BODY, custom, fakeMailer, fakeSecrets, inDays, seedApp, seedShop } from './helpers/identity.js';

const T = (n) => `2026-10-09T10:00:0${n}.123456Z`;
const URL_PATH = '/v1/web-funnel/entitlements';

describe(`POST ${URL_PATH} (IKameSDK mode AUTH: the app backend asks by user_id)`, () => {
  let db;
  let app;
  let key;
  let zodiacKey;
  let uid;
  const log = { warn: () => {}, error: () => {}, info: () => {} };
  const q = async (sql, p) => (await db.pool.query(sql, p)).rows;
  const lookup = (userId, apiKey = key) =>
    app.inject({ method: 'POST', url: URL_PATH, payload: { user_id: userId }, headers: apiKey ? { authorization: `Bearer ${apiKey}` } : {} });

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    const secrets = fakeSecrets();
    ({ api_key: key } = await seedShop(db.pool, { secrets, app: SDK_APP_BODY }));
    ({ api_key: zodiacKey } = await seedApp(db.pool, secrets, { ...SDK_APP_BODY, id: 'zodiac', name: 'Zodiac' }));
    const paddle = fakePaddle();
    paddle.customer('ctm_1', 'Buyer@Example.com');
    paddle.subscription(paddleSub({ status: 'active', custom_data: custom(CK), period_end: inDays(7), updated_at: T(1) }));
    paddle.transaction(paddleTxn({ id: 'txn_a', subscription_id: 'sub_1', custom_data: custom(CK), updated_at: T(2) }));
    await syncMessage({ pool: db.pool, paddle, log }, { entity: 'transaction', entity_id: 'txn_a' });
    await syncOutbox({ pool: db.pool, claimKey: CLAIM_KEY, log });
    uid = (await q("SELECT user_id FROM customers WHERE paddle_customer_id = 'ctm_1'"))[0].user_id;
    ({ app } = await makeApp(db.pool, { webhookSecrets: secrets, claimKey: CLAIM_KEY, mailer: fakeMailer() }));
  });
  afterEach(() => app.close());

  it("the calling app's entitlements of the buyer, with customer_ref; the user_id never sits in the URL", async () => {
    const res = await lookup(uid);
    expect(res.statusCode).toBe(200);
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.json()).toEqual({
      customer_ref: expect.stringMatching(/^cus_[0-7][0-9A-HJKMNP-TV-Z]{25}$/),
      entitlements: [{ key: 'premium', active: true, expires_at: expect.any(String) }],
    });
    const other = await lookup(uid.toUpperCase(), zodiacKey);
    expect(other.json()).toEqual({ customer_ref: res.json().customer_ref, entitlements: [] });
    expect(await q('SELECT count(*)::int AS n FROM app_links')).toEqual([{ n: 0 }]);
  });

  it('unknown or malformed user_id: 200 with no customer; a missing or wrong key is 401', async () => {
    for (const u of ['0b8e7c1a-2f3d-4e5f-8a9b-1c2d3e4f5a6b', 'nope', '']) {
      const res = await lookup(u);
      expect(res.statusCode, u).toBe(200);
      expect(res.json()).toEqual({ customer_ref: null, entitlements: [] });
    }
    expect((await lookup(uid, null)).statusCode).toBe(401);
    expect((await lookup(uid, `ikfa_${'A'.repeat(43)}`)).json()).toEqual({ error: 'unauthorized' });
  });

  it('CS lookup (ikf customer show) shows the user_id', async () => {
    const res = await app.inject({
      method: 'POST', url: '/v1/customers/lookup', headers: bearer(await tokenFor(db.pool, 'admin')), payload: { email: 'buyer@example.com' },
    });
    expect(res.json().customers).toEqual([expect.objectContaining({ paddle_customer_id: 'ctm_1', user_id: uid })]);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/web-funnel-auth.test.js 2>&1 | grep -E "→|Tests  "
```

Expected: FAIL cả 3 (`expected 404 to be 200` cho route chưa có; lookup chưa có `user_id`), `Tests  3 failed (3)`.

- [ ] **Step 3: Implement**

`purchased.js`, `http/identity.js`, `customers.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/http/identity.js b/services/core-api/src/http/identity.js
index f399dd8..217e457 100644
--- a/services/core-api/src/http/identity.js
+++ b/services/core-api/src/http/identity.js
@@ -1,6 +1,7 @@
 import { requireApp } from '../identity/apps.js';
 import { redeemClaim, redeemMagic, userEntitlements } from '../identity/link.js';
 import { sendOtp, verifyOtp } from '../identity/otp.js';
+import { webFunnelEntitlements } from '../identity/purchased.js';
 
 export const APP_USER_ID = { type: 'string', minLength: 1, maxLength: 128, pattern: '^[\\x21-\\x7e]+$' };
 const tokenBody = {
@@ -52,4 +53,12 @@ export default async function identityHttp(app, deps) {
     { schema: { params: { type: 'object', required: ['app_user_id'], properties: { app_user_id: APP_USER_ID } } } },
     async (req) => userEntitlements(pool, { appId: req.caller.id, appUserId: req.params.app_user_id }),
   );
+
+  // IKameSDK mode AUTH (spec web-funnel-sdk-compat §4). POST, not GET /users/:user_id: the user_id is a bearer
+  // secret and must stay out of URLs and access logs (like E10 for emails).
+  app.post(
+    '/v1/web-funnel/entitlements',
+    { schema: { body: { type: 'object', required: ['user_id'], properties: { user_id: { type: 'string', maxLength: 64 } } } } },
+    async (req) => webFunnelEntitlements(pool, { appId: req.caller.id, userId: req.body.user_id }),
+  );
 }
diff --git a/services/core-api/src/identity/customers.js b/services/core-api/src/identity/customers.js
index 5c8d674..e2f026e 100644
--- a/services/core-api/src/identity/customers.js
+++ b/services/core-api/src/identity/customers.js
@@ -3,7 +3,7 @@ const iso = (d) => (d ? d.toISOString() : null);
 // CS lookup (E10: POST body, so the email never sits in a URL or an access log).
 export async function customerReport(db, email) {
   const { rows: customers } = await db.query(
-    'SELECT id, ref, paddle_customer_id, created_at FROM customers WHERE lower(btrim(email)) = $1 ORDER BY id',
+    'SELECT id, ref, user_id, paddle_customer_id, created_at FROM customers WHERE lower(btrim(email)) = $1 ORDER BY id',
     [String(email).trim().toLowerCase()],
   );
   const out = [];
@@ -25,6 +25,7 @@ export async function customerReport(db, email) {
       : { rows: [] };
     out.push({
       customer_ref: c.ref,
+      user_id: c.user_id,
       paddle_customer_id: c.paddle_customer_id,
       created_at: iso(c.created_at),
       entitlements: ents.rows.map((e) => ({ ...e, expires_at: iso(e.expires_at), updated_at: iso(e.updated_at) })),
diff --git a/services/core-api/src/identity/purchased.js b/services/core-api/src/identity/purchased.js
index cd5c4e1..503eeb3 100644
--- a/services/core-api/src/identity/purchased.js
+++ b/services/core-api/src/identity/purchased.js
@@ -1,3 +1,5 @@
+import { linkView } from './link.js';
+
 // Pull-style answers for IKameSDK (spec web-funnel-sdk-compat §3, §4): read the entitlements entitlement-sync
 // already computed, never recompute. customers.user_id is a bearer secret: callers log its sha256 only.
 export const USER_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
@@ -17,3 +19,12 @@ export async function checkPurchased(db, { userId, app = null }) {
   if (rows.some((r) => r.expires_at === null)) return { isPro: true, expiresAt: null };
   return { isPro: true, expiresAt: new Date(Math.max(...rows.map((r) => r.expires_at.getTime()))) };
 }
+
+// Mode AUTH (spec §4): the calling app's entitlements of the buyer behind a user_id, for the app backend to
+// turn into the SDK's Bool. Unknown or malformed user_id → no customer. No app_links involved.
+export async function webFunnelEntitlements(db, { appId, userId }) {
+  if (!USER_ID_RE.test(userId ?? '')) return { customer_ref: null, entitlements: [] };
+  const { rows } = await db.query('SELECT id FROM customers WHERE user_id = $1', [userId.toLowerCase()]);
+  if (!rows.length) return { customer_ref: null, entitlements: [] };
+  return linkView(db, Number(rows[0].id), appId);
+}
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/web-funnel-auth.test.js 2>&1 | grep -E "Tests  "
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  3 passed (3)`; toàn bộ `Test Files  34 passed (34)`, `Tests  341 passed (341)`.

- [ ] **Step 5: Commit**

```bash
git add services/core-api
git commit -m "feat(core-api): POST /v1/web-funnel/entitlements (IKameSDK mode AUTH); CS lookup shows user_id"
```

---

### Task 6: `user_id` không vào event ClickHouse (event-schema scrub UUID)

**Files:**
- Modify: `packages/event-schema/src/index.js`
- Test: `packages/event-schema/test/event-schema.test.js`

**Interfaces:**
- Consumes: —
- Produces: `isPiiValue(v)` trả `true` cho chuỗi chứa UUID (`[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}`, không phân biệt hoa thường) — áp cho cả SDK (`buildProps`) và collector (`scrubEvent`).

- [ ] **Step 1: Viết test fail**

`packages/event-schema/test/event-schema.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/packages/event-schema/test/event-schema.test.js b/packages/event-schema/test/event-schema.test.js
index e79bd23..749fa13 100644
--- a/packages/event-schema/test/event-schema.test.js
+++ b/packages/event-schema/test/event-schema.test.js
@@ -32,6 +32,13 @@ describe('isPiiValue', () => {
   ])('drops slash/dot dates: %j', (v) => expect(isPiiValue(v)).toBe(true));
   it.each(['$14.99', '14.99', 'v1.2', '2/3'])('keeps prices and versions: %j', (v) => expect(isPiiValue(v)).toBe(false));
   it('drops phone with dot separators', () => expect(isPiiValue('123.456.7890')).toBe(true));
+  // customers.user_id (handoff = user_id) is a bearer secret: a funnel event carrying the app link must not keep it.
+  it.each([
+    '3f1c2a9e-4b7d-4c1e-9a2b-0c4d5e6f7a8b',
+    'https://app.adjust.com/abc?deep_link=starlyn%3A%2F%2Fopen%3Fuser_id%3D3f1c2a9e-4b7d-4c1e-9a2b-0c4d5e6f7a8b',
+    'starlyn://open?user_id=3F1C2A9E-4B7D-4C1E-9A2B-0C4D5E6F7A8B',
+  ])('drops a UUID anywhere in the value: %j', (v) => expect(isPiiValue(v)).toBe(true));
+  it.each(['3f1c2a9e-4b7d', 'plan-w4-2026', 'abcdef01-abcd'])('keeps short hex-and-dash values: %j', (v) => expect(isPiiValue(v)).toBe(false));
 });
 
 describe('scrub', () => {
@@ -127,6 +134,10 @@ describe('buildProps', () => {
     expect(buildProps({ event: 'lead', funnel: 'f', screen: 4, data: { email: 'a@b.co', goal: 'sleep', age: '25-34', dob: '1990-01-02' } }))
       .toEqual({ 'data.goal': 'sleep', 'data.age': '25-34' });
   });
+  it("drops the app link of a handoff = user_id funnel's app_handoff event", () => {
+    const url = 'https://app.adjust.com/abc?deep_link=starlyn%3A%2F%2Fopen%3Fuser_id%3D3f1c2a9e-4b7d-4c1e-9a2b-0c4d5e6f7a8b&user_id=';
+    expect(buildProps({ event: 'app_handoff', url })).toEqual({});
+  });
 });
 
 describe('screenOf', () => {
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/event-schema 2>&1 | grep -E "×|Tests  "
```

Expected: FAIL 4 (`drops a UUID anywhere in the value` × 3, `drops the app link of a handoff = user_id funnel's app_handoff event`), `Tests  4 failed | 141 passed (145)`.

- [ ] **Step 3: Implement**

`packages/event-schema/src/index.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/packages/event-schema/src/index.js b/packages/event-schema/src/index.js
index d416556..a10d5ad 100644
--- a/packages/event-schema/src/index.js
+++ b/packages/event-schema/src/index.js
@@ -15,6 +15,8 @@ const EMAIL_RE = /[^\s@<>"'(),;:]+@[^\s@<>"'(),;:]+\.[a-z]{2,}/i;
 const LONG_DIGITS_RE = /\d{7,}/;
 const DATE_RE = /^\d{4}-\d{2}-\d{2}/;
 const SLASH_DOT_DATE_RE = /\b\d{1,4}[-/.]\d{1,2}[-/.]\d{2,4}\b/;
+// A UUID anywhere: the handoff = user_id app link carries customers.user_id, a bearer secret.
+const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
 const SKIP_TOP = new Set(['screen', 'index', 'funnel', 'event']);
 const MAX_DEPTH = 6;
 const MAX_KEY_LEN = 100;
@@ -57,7 +59,7 @@ export function containsEmail(s) {
 // Strings only: numbers (prices, timestamps) are never treated as PII by value.
 export function isPiiValue(v) {
   if (typeof v !== 'string') return false;
-  if (containsEmail(v)) return true;
+  if (containsEmail(v) || UUID_RE.test(v)) return true;
   // Check slash/dot dates (anywhere in string)
   if (SLASH_DOT_DATE_RE.test(v)) return true;
   // Check for ≥7 digit phone (remove space, +, -, (, ), /, . before checking)
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS (cả các gói dùng event-schema)**

```bash
npm test -w @ikf/event-schema -w @ikf/sdk -w @ikf/edge-router -w @ikf/event-consumer 2>&1 | grep -E "Test Files|Tests  |bytes gzip"
```

Expected: event-schema `145 passed (145)`; sdk `152`; edge-router `101` với `ikf sdk 3d1717a50f4b: 8146 bytes gzip`; event-consumer `8` + `27`.

- [ ] **Step 5: Commit**

```bash
git add packages/event-schema
git commit -m "feat(event-schema): a value holding a UUID is PII (the user_id app link never reaches ClickHouse)"
```

---

### Task 7: CLI: `--handoff`, `--deeplink-path`, `--bundle-ids`; `app ls`; `customer show` có `user_id`

**Files:**
- Modify: `packages/cli/src/main.js`
- Test: `packages/cli/test/app.test.js`

**Interfaces:**
- Consumes: `POST /v1/apps` (Task 2: `handoff`, `deeplink_path`, `bundle_ids`), `appView.handoff` (`null` cho web), `customerReport.user_id` (Task 5). `api.createApp(body)` không đổi.
- Produces: `ikf app create <id> … --kind app … --handoff user_id|claim [--deeplink-path <p>] [--bundle-ids a,b]` (C7); `ikf app ls`: `<id 20> <kind 4> <handoff|- 7> <name 24> <webhook>`; `ikf customer show`: dòng `  user_id: <uuid>  (bí mật: …)`.

- [ ] **Step 1: Viết test fail**

`packages/cli/test/app.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/packages/cli/test/app.test.js b/packages/cli/test/app.test.js
index 87773d1..470b1c5 100644
--- a/packages/cli/test/app.test.js
+++ b/packages/cli/test/app.test.js
@@ -7,14 +7,15 @@ const KEY = `ikfa_${'k'.repeat(43)}`;
 const SECRET = `whsec_${'s'.repeat(43)}`;
 const EV = '01K75Z0000000000000000000A';
 const EV2 = '01K75Z0000000000000000000C';
-const appView = { id: 'starlyn', name: 'Starlyn', kind: 'app', webhook_url: 'https://be.example/hook', prev_key_expires_at: null };
+const appView = { id: 'starlyn', name: 'Starlyn', kind: 'app', handoff: 'claim', webhook_url: 'https://be.example/hook', prev_key_expires_at: null };
+const UID = '3f1c2a9e-4b7d-4c1e-9a2b-0c4d5e6f7a8b';
 
 describe('ikf app', () => {
   it('create (kind app) sends the fields and prints the key and secret once', async () => {
     const calls = [];
     const t = io({ createApp: async (b) => { calls.push(b); return { app: appView, api_key: KEY, webhook_secret: SECRET }; } });
-    expect(await run(['app', 'create', 'starlyn', '--name', 'Starlyn', '--kind', 'app', '--adjust', 'https://app.adjust.com/abc', '--scheme', 'starlyn', '--webhook', 'https://be.example/hook'], t.opts)).toBe(0);
-    expect(calls).toEqual([{ id: 'starlyn', name: 'Starlyn', kind: 'app', webhook_url: 'https://be.example/hook', adjust_tracker_url: 'https://app.adjust.com/abc', deeplink_scheme: 'starlyn' }]);
+    expect(await run(['app', 'create', 'starlyn', '--name', 'Starlyn', '--kind', 'app', '--adjust', 'https://app.adjust.com/abc', '--scheme', 'starlyn', '--webhook', 'https://be.example/hook', '--handoff', 'claim'], t.opts)).toBe(0);
+    expect(calls).toEqual([{ id: 'starlyn', name: 'Starlyn', kind: 'app', webhook_url: 'https://be.example/hook', adjust_tracker_url: 'https://app.adjust.com/abc', deeplink_scheme: 'starlyn', handoff: 'claim' }]);
     expect(t.lines).toEqual([
       'starlyn (app) đã tạo.',
       'Hai giá trị dưới đây chỉ hiện MỘT lần: lưu vào password manager rồi gửi riêng cho team backend app.',
@@ -23,6 +24,16 @@ describe('ikf app', () => {
     ]);
   });
 
+  it('create --handoff user_id sends the deep-link path and bundle ids when given', async () => {
+    const calls = [];
+    const t = io({ createApp: async (b) => { calls.push(b); return { app: { ...appView, handoff: 'user_id' }, api_key: KEY, webhook_secret: SECRET }; } });
+    const base = ['app', 'create', 'starlyn', '--name', 'Starlyn', '--kind', 'app', '--adjust', 'https://app.adjust.com/abc', '--scheme', 'starlyn', '--webhook', 'https://be.example/hook', '--handoff', 'user_id'];
+    expect(await run(base, t.opts)).toBe(0);
+    expect(await run([...base, '--deeplink-path', 'restore', '--bundle-ids', 'com.ikame.starlyn, 6471234567'], t.opts)).toBe(0);
+    const common = { id: 'starlyn', name: 'Starlyn', kind: 'app', webhook_url: 'https://be.example/hook', adjust_tracker_url: 'https://app.adjust.com/abc', deeplink_scheme: 'starlyn', handoff: 'user_id' };
+    expect(calls).toEqual([common, { ...common, deeplink_path: 'restore', bundle_ids: ['com.ikame.starlyn', '6471234567'] }]);
+  });
+
   it('create (kind web) sends return_url', async () => {
     const calls = [];
     const t = io({ createApp: async (b) => { calls.push(b); return { app: { ...appView, id: 'tarot-web', kind: 'web' }, api_key: KEY, webhook_secret: SECRET }; } });
@@ -33,6 +44,9 @@ describe('ikf app', () => {
   it.each([
     [['app', 'create', 'starlyn', '--kind', 'app'], 'cần --name, --kind app|web và --webhook <url>'],
     [['app', 'create', 'starlyn', '--name', 'S', '--kind', 'app', '--webhook', 'https://x'], 'app kiểu app cần --adjust <url> và --scheme <scheme>'],
+    [['app', 'create', 'starlyn', '--name', 'S', '--kind', 'app', '--webhook', 'https://x', '--adjust', 'https://a', '--scheme', 's1'], 'app kiểu app cần --handoff user_id|claim (user_id: app dùng IKameSDK; claim: app có backend riêng)'],
+    [['app', 'create', 'starlyn', '--name', 'S', '--kind', 'app', '--webhook', 'https://x', '--adjust', 'https://a', '--scheme', 's1', '--handoff', 'push'], 'app kiểu app cần --handoff user_id|claim (user_id: app dùng IKameSDK; claim: app có backend riêng)'],
+    [['app', 'create', 'starlyn', '--name', 'S', '--kind', 'app', '--webhook', 'https://x', '--adjust', 'https://a', '--scheme', 's1', '--handoff', 'user_id', '--deeplink-path', 'Open/x'], '--deeplink-path không hợp lệ: "Open/x" (a-z, 0-9, _ hoặc -, tối đa 32 ký tự)'],
     [['app', 'create', 'w', '--name', 'S', '--kind', 'web', '--webhook', 'https://x'], 'app id không hợp lệ: "w"'],
     [['app', 'create', 'tw', '--name', 'S', '--kind', 'web', '--webhook', 'https://x'], 'app kiểu web cần --return-url <url>'],
     [['app', 'webhooks', 'starlyn', '--resend', 'evt_1'], 'event id không hợp lệ: "evt_1"'],
@@ -45,13 +59,14 @@ describe('ikf app', () => {
 
   it('ls and rotate-key', async () => {
     const t = io({
-      listApps: async () => ({ apps: [appView] }),
+      listApps: async () => ({ apps: [appView, { ...appView, id: 'tarot-web', kind: 'web', handoff: null, name: 'Tarot', webhook_url: 'https://tarot.example/h' }] }),
       rotateKey: async () => ({ app: { ...appView, prev_key_expires_at: '2026-10-10T10:00:00.000Z' }, api_key: KEY }),
     });
     await run(['app', 'ls'], t.opts);
     await run(['app', 'rotate-key', 'starlyn'], t.opts);
     expect(t.lines).toEqual([
-      `starlyn              app  Starlyn                  https://be.example/hook`,
+      `starlyn              app  claim   Starlyn                  https://be.example/hook`,
+      `tarot-web            web  -       Tarot                    https://tarot.example/h`,
       `starlyn: API key mới (chỉ hiện MỘT lần): ${KEY}`,
       'Key cũ còn dùng được tới 2026-10-10T10:00:00.000Z.',
     ]);
@@ -125,7 +140,7 @@ describe('ikf customer show', () => {
         calls.push(email);
         return {
           customers: [{
-            customer_ref: 'cus_01K75Z0000000000000000000B', paddle_customer_id: 'ctm_1', created_at: '2026-10-09T10:00:00.000Z',
+            customer_ref: 'cus_01K75Z0000000000000000000B', user_id: UID, paddle_customer_id: 'ctm_1', created_at: '2026-10-09T10:00:00.000Z',
             entitlements: [{ app_id: 'starlyn', key: 'premium', active: true, expires_at: '2026-10-19T10:00:00.000Z', source: 'subscription', source_id: 'sub_1' }],
             links: [{ app_id: 'starlyn', app_user_id: 'u_42', linked_at: '2026-10-09T10:01:00.000Z', revoked_at: null }],
             deliveries: [{ event_id: EV, type: 'link.created', app_id: 'starlyn', app_user_id: 'u_42', status: 'delivered', attempts: 1 }],
@@ -137,6 +152,7 @@ describe('ikf customer show', () => {
     expect(calls).toEqual(['buyer@example.com']);
     expect(t.lines).toEqual([
       'cus_01K75Z0000000000000000000B  ctm_1  từ 2026-10-09T10:00:00.000Z',
+      `  user_id: ${UID}  (bí mật: ai có nó là có quyền của khách trong app dùng IKameSDK)`,
       '  Quyền:',
       '    starlyn/premium  active  hết hạn 2026-10-19T10:00:00.000Z  (subscription sub_1)',
       '  Liên kết:',
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/cli 2>&1 | grep -E "×|Tests  "
```

Expected: FAIL 7 (create không gửi `handoff`, 3 lỗi cách dùng mới, `ls`, `customer show`), `Tests  7 failed | 111 passed (118)`.

- [ ] **Step 3: Implement**

`packages/cli/src/main.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/packages/cli/src/main.js b/packages/cli/src/main.js
index 87bd96e..c8f3974 100755
--- a/packages/cli/src/main.js
+++ b/packages/cli/src/main.js
@@ -22,7 +22,8 @@ const USAGE = `Cách dùng:
   ikf funnel prices ls <slug>
   ikf billing reconcile --since <24h|7d|…>
   ikf billing outbox ls [--topic <topic>] [--limit <n>]
-  ikf app create <id> --name <tên> --kind app --adjust <url> --scheme <scheme> --webhook <url>
+  ikf app create <id> --name <tên> --kind app --adjust <url> --scheme <scheme> --webhook <url> --handoff user_id|claim [--deeplink-path open] [--bundle-ids a,b]
+      (handoff user_id: app dùng IKameSDK, deep link mang user_id; claim: app có backend riêng, claim token + webhook)
   ikf app create <id> --name <tên> --kind web --return-url <url> --webhook <url>
   ikf app ls
   ikf app rotate-key <id> [--force]   (--force: cả khi key trước còn trong 24h, key đó bị khoá ngay)
@@ -55,6 +56,7 @@ const PIXEL_RE = /^[0-9]{6,20}$/;
 
 const PAIR_RE = /^([A-Za-z0-9_-]{1,40})=(?:(-)|(pri_[a-z0-9]{26})(?::(dsc_[a-z0-9]{26}))?(?:@([a-z0-9_]{1,40}))?)$/;
 const APP_ID_RE = /^[a-z0-9][a-z0-9-]{1,30}$/;
+const DEEPLINK_PATH_RE = /^[a-z0-9_-]{1,32}$/;
 const EVENT_ID_RE = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
 
 function printPrices(out, r) {
@@ -124,7 +126,7 @@ async function appCommand(api, sub, args, values, out) {
   if (sub === 'ls') {
     const { apps } = await api.listApps();
     if (!apps.length) out('(chưa có app nào)');
-    for (const a of apps) out(`${a.id.padEnd(20)} ${a.kind.padEnd(4)} ${a.name.padEnd(24)} ${a.webhook_url ?? '-'}`);
+    for (const a of apps) out(`${a.id.padEnd(20)} ${a.kind.padEnd(4)} ${(a.handoff ?? '-').padEnd(7)} ${a.name.padEnd(24)} ${a.webhook_url ?? '-'}`);
     return 0;
   }
   if (!['create', 'rotate-key', 'webhooks'].includes(sub) || !id) throw new UsageError(USAGE);
@@ -134,13 +136,22 @@ async function appCommand(api, sub, args, values, out) {
       throw new UsageError('cần --name, --kind app|web và --webhook <url>');
     }
     if (values.kind === 'app' && (!values.adjust || !values.scheme)) throw new UsageError('app kiểu app cần --adjust <url> và --scheme <scheme>');
+    if (values.kind === 'app' && !['user_id', 'claim'].includes(values.handoff)) {
+      throw new UsageError('app kiểu app cần --handoff user_id|claim (user_id: app dùng IKameSDK; claim: app có backend riêng)');
+    }
+    const path = values['deeplink-path'];
+    if (path !== undefined && !DEEPLINK_PATH_RE.test(path)) throw new UsageError(`--deeplink-path không hợp lệ: "${path}" (a-z, 0-9, _ hoặc -, tối đa 32 ký tự)`);
     if (values.kind === 'web' && !values['return-url']) throw new UsageError('app kiểu web cần --return-url <url>');
+    const bundles = values['bundle-ids']?.split(',').map((b) => b.trim()).filter(Boolean);
     const r = await api.createApp({
       id,
       name: values.name,
       kind: values.kind,
       webhook_url: values.webhook,
-      ...(values.kind === 'app' ? { adjust_tracker_url: values.adjust, deeplink_scheme: values.scheme } : { return_url: values['return-url'] }),
+      ...(values.kind === 'app'
+        ? { adjust_tracker_url: values.adjust, deeplink_scheme: values.scheme, handoff: values.handoff, ...(path !== undefined && { deeplink_path: path }) }
+        : { return_url: values['return-url'] }),
+      ...(bundles?.length && { bundle_ids: bundles }),
     });
     out(`${r.app.id} (${r.app.kind}) đã tạo.`);
     out('Hai giá trị dưới đây chỉ hiện MỘT lần: lưu vào password manager rồi gửi riêng cho team backend app.');
@@ -175,6 +186,7 @@ async function customerCommand(api, sub, args, out) {
   if (!customers.length) out('Không có khách nào với email này.');
   for (const c of customers) {
     out(`${c.customer_ref ?? '(chưa có customer_ref)'}  ${c.paddle_customer_id}  từ ${c.created_at}`);
+    out(`  user_id: ${c.user_id}  (bí mật: ai có nó là có quyền của khách trong app dùng IKameSDK)`);
     out('  Quyền:');
     if (!c.entitlements.length) out('    (không có)');
     for (const e of c.entitlements) {
@@ -316,6 +328,9 @@ export async function run(argv, { out = console.log, err = console.error, env =
         scheme: { type: 'string' },
         'return-url': { type: 'string' },
         webhook: { type: 'string' },
+        handoff: { type: 'string' },
+        'deeplink-path': { type: 'string' },
+        'bundle-ids': { type: 'string' },
         dead: { type: 'boolean', default: false },
         resend: { type: 'string' },
         force: { type: 'boolean', default: false },
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/cli 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Test Files  12 passed (12)`, `Tests  118 passed (118)`.

- [ ] **Step 5: Commit**

```bash
git add packages/cli
git commit -m "feat(cli): ikf app create --handoff user_id|claim [--deeplink-path] [--bundle-ids]; app ls and customer show"
```

---

### Task 8: Tài liệu tích hợp ("A. Apps on IKameSDK") + runbook + rate limit

**Files:**
- Modify: `docs/integration/app-backend.md`, `docs/runbooks/entitlement-identity.md`, `infra/modules/edge/main.tf`, `infra/modules/edge/variables.tf`
- Test: `infra/modules/edge/tests/edge.tftest.hcl`, `services/core-api/test/docs-vector.test.js`

**Interfaces:**
- Consumes: `sdk-contract.js` (Task 4), `POST /v1/web-funnel/entitlements` (Task 5), `ikf app create --handoff/--bundle-ids` (Task 7).
- Produces: `rate_limited_paths` mặc định thêm `/v1/payment/check-purchased-web-funnel` (rule identity, 50/10s/IP; staging Free plan không có rule này, B19); tài liệu có mục `## A. Apps on IKameSDK` trước `## B. Apps with their own backend` trước `## 1.` — test giữ tên field trong tài liệu khớp `sdk-contract.js` (vector chữ ký cũ không đổi).

- [ ] **Step 1: Viết test fail**

`infra/modules/edge/tests/edge.tftest.hcl`, `services/core-api/test/docs-vector.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/infra/modules/edge/tests/edge.tftest.hcl b/infra/modules/edge/tests/edge.tftest.hcl
index 3dd21e9..a60a35c 100644
--- a/infra/modules/edge/tests/edge.tftest.hcl
+++ b/infra/modules/edge/tests/edge.tftest.hcl
@@ -40,6 +40,11 @@ run "sensitive_paths_are_rate_limited" {
     error_message = "The real OTP, claim and magic-link paths must be rate limited."
   }
 
+  assert {
+    condition     = strcontains(cloudflare_ruleset.ratelimit.rules[0].expression, "\"/v1/payment/check-purchased-web-funnel\"")
+    error_message = "IKameSDK's check-purchased endpoint (public, no auth) belongs to the identity rule (50 per 10 s per IP)."
+  }
+
   assert {
     condition     = cloudflare_ruleset.ratelimit.rules[0].ratelimit.requests_per_period == 50 && cloudflare_ruleset.ratelimit.rules[0].ratelimit.period == 10
     error_message = "Identity endpoints: 50 requests per 10 seconds per IP (app backends call them)."
diff --git a/services/core-api/test/docs-vector.test.js b/services/core-api/test/docs-vector.test.js
index 5b15644..950021f 100644
--- a/services/core-api/test/docs-vector.test.js
+++ b/services/core-api/test/docs-vector.test.js
@@ -1,5 +1,8 @@
 import { readFileSync } from 'node:fs';
 import { describe, it, expect } from 'vitest';
+import {
+  PATH, REQUEST_APP_FIELD, REQUEST_USER_ID_FIELD, RESPONSE_EXPIRES_FIELD, RESPONSE_IS_PRO_FIELD,
+} from '../src/identity/sdk-contract.js';
 import { signPayload, verifySignature } from '../src/identity/webhooks.js';
 
 const DOC = new URL('../../../docs/integration/app-backend.md', import.meta.url);
@@ -13,4 +16,16 @@ describe('docs/integration/app-backend.md', () => {
     expect(verifySignature(body, signature, secret, Number(t) * 1000)).toBe(true);
     expect(md).toContain(`Ikf-Signature: ${signature}`);
   });
+
+  it('comes first with the IKameSDK section, which names the check-purchased path and fields of sdk-contract.js', () => {
+    const md = readFileSync(DOC, 'utf8');
+    const sdk = md.indexOf('## A. Apps on IKameSDK');
+    expect(sdk).toBeGreaterThan(0);
+    expect(sdk).toBeLessThan(md.indexOf('## B. Apps with their own backend'));
+    expect(md.indexOf('## B. Apps with their own backend')).toBeLessThan(md.indexOf('## 1. What you get from the platform team'));
+    const section = md.slice(sdk, md.indexOf('## B.'));
+    expect(section).toContain(`POST ${PATH}`);
+    for (const f of [REQUEST_USER_ID_FIELD, REQUEST_APP_FIELD, RESPONSE_IS_PRO_FIELD, RESPONSE_EXPIRES_FIELD]) expect(section).toContain(`"${f}"`);
+    expect(section).toContain('POST /v1/web-funnel/entitlements');
+  });
 });
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
(cd infra/modules/edge && terraform init -backend=false -input=false >/dev/null && terraform test -no-color | grep -E "fail|Success|Failure")
npm test -w @ikf/core-api -- test/docs-vector.test.js 2>&1 | grep -E "×|Tests  "
```

Expected: edge `run "sensitive_paths_are_rate_limited"... fail`, `Failure! 9 passed, 1 failed.`; docs `comes first with the IKameSDK section …` FAIL, `Tests  1 failed | 1 passed (2)`.

- [ ] **Step 3: Implement**

`infra/modules/edge/main.tf`, `infra/modules/edge/variables.tf` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/infra/modules/edge/main.tf b/infra/modules/edge/main.tf
index 9de0a9f..c544704 100644
--- a/infra/modules/edge/main.tf
+++ b/infra/modules/edge/main.tf
@@ -53,7 +53,7 @@ resource "cloudflare_ruleset" "origin_auth" {
 locals {
   ratelimit_api_rules = [
     {
-      description = "Throttle the app-backend identity API (OTP, claim, magic link) per IP"
+      description = "Throttle the identity API (OTP, claim, magic link, IKameSDK check-purchased) per IP"
       expression  = "(http.host eq \"${local.api_fqdn}\" and http.request.uri.path in {${local.paths}})"
       action      = "block"
       ratelimit = {
diff --git a/infra/modules/edge/variables.tf b/infra/modules/edge/variables.tf
index 89cb143..d56ce81 100644
--- a/infra/modules/edge/variables.tf
+++ b/infra/modules/edge/variables.tf
@@ -24,9 +24,9 @@ variable "origin_auth_secret" {
 }
 
 variable "rate_limited_paths" {
-  description = "App-backend identity endpoints (exact paths; the rule is an `in` set)."
+  description = "Identity endpoints (exact paths; the rule is an `in` set): the app-backend API and IKameSDK's check-purchased (called on every app open; many users share a NAT IP)."
   type        = list(string)
-  default     = ["/v1/otp/send", "/v1/otp/verify", "/v1/claims/redeem", "/v1/magic/redeem"]
+  default     = ["/v1/otp/send", "/v1/otp/verify", "/v1/claims/redeem", "/v1/magic/redeem", "/v1/payment/check-purchased-web-funnel"]
 }
 
 variable "rate_limit_requests_per_10s" {
PATCH
```

`docs/integration/app-backend.md` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/docs/integration/app-backend.md b/docs/integration/app-backend.md
index 8924516..44310b0 100644
--- a/docs/integration/app-backend.md
+++ b/docs/integration/app-backend.md
@@ -1,12 +1,59 @@
 # iFunnel → app backend integration
 
-For the backend team of an app that sells through iFunnel funnels (web2app) or a web product (web2web).
-iFunnel takes the payment on the web (Paddle) and keeps the **entitlements** a buyer paid for. **Your backend
-stays the place that decides premium**: it links its own user account to the buyer, then iFunnel pushes every
-entitlement change (renewal, cancel, refund, chargeback) to your backend as a signed webhook.
+For the team of an app that sells through iFunnel funnels (web2app) or a web product (web2web).
+iFunnel takes the payment on the web (Paddle) and keeps the **entitlements** a buyer paid for. An app hands a
+buyer over in one of two ways, chosen when the platform team creates it (`handoff`):
+
+- **A. App on IKameSDK** (`handoff = user_id`, the default): the deep link carries the buyer's `user_id` and the
+  SDK asks iFunnel whether that user is pro. No backend work.
+- **B. App with its own backend** (`handoff = claim`): **your backend stays the place that decides premium**: it
+  links its own user account to the buyer, then iFunnel pushes every entitlement change (renewal, cancel, refund,
+  chargeback) to your backend as a signed webhook.
 
 Base URL: `https://api.<zone>` (staging and prod differ; ask the platform team). All bodies are JSON.
 
+## A. Apps on IKameSDK (`handoff = user_id`)
+
+For an app that already uses IKameSDK's web-funnel check: no backend work and no new app code.
+
+1. **Point the SDK at iFunnel.** Set the web-funnel `baseUrl` to `https://api.<zone>/v1`. In mode **NOT_AUTH**
+   (recommended) the SDK itself calls check-purchased (below) when it sees a new `user_id` and on every app open.
+2. **The link.** After payment the funnel's "Get the app" button, and the email sent after payment, both open
+   `<adjust tracker>?deep_link=<scheme>://<path>?user_id=<uuid>` (`<path>` is `open` unless agreed otherwise).
+   `user_id` is a random UUID per buyer, never an email, and it never expires: opening the link from the email on
+   a new phone or after a reinstall restores the purchase.
+3. **Check-purchased** (what the SDK sends and reads; field names follow the SDK docs until the `api-slt-aio`
+   swagger is final):
+
+   | | |
+   |---|---|
+   | Request | `POST /v1/payment/check-purchased-web-funnel` with `{"user_id": "<uuid>", "bundle_id": "<app or bundle id, optional>"}` |
+   | Reply | `200 {"is_pro": true, "expires_at": "2026-10-19T10:00:00.000Z"}`; a purchase that never ends has `"expires_at": null` |
+   | Unknown or malformed `user_id` | `200 {"is_pro": false, "expires_at": null}` (never a 4xx) |
+   | iFunnel unavailable | `503` (the SDK keeps its cached state) |
+
+   With `bundle_id`, only purchases for that app count (give the platform team your bundle ids); without it,
+   every purchase of the buyer counts. `is_pro` turns false after a full refund or a chargeback, and when a
+   subscription ends (3 days of grace after the paid period). Updates show up within a few seconds of the payment
+   event.
+4. **Test before release.** Ask the platform team for the `user_id` of a staging test purchase
+   (`ikf customer show <email>`), then open
+   `<adjust tracker>?deep_link=<scheme>%3A%2F%2Fopen%3Fuser_id%3D<uuid>` on a phone with the app: the SDK
+   reports pro.
+5. **Mode AUTH** (your backend answers the SDK through `IKWebFunnelClient`): your backend calls
+   `POST /v1/web-funnel/entitlements` with `Authorization: Bearer <api key>` and `{"user_id": "<uuid>"}` →
+   `200 {"customer_ref", "entitlements": [{"key", "active", "expires_at"}]}`, for your app only (an unknown
+   `user_id` gives `{"customer_ref": null, "entitlements": []}`), and returns `true` to the SDK when an
+   entitlement you sell is active. The API key comes from section 1.
+
+Treat `user_id` like a password: whoever has it gets the buyer's purchases. Never log it and never send it to
+analytics. These apps get no claim token, no email code and no webhooks (`/v1/otp/send` answers `200 {}` and sends
+nothing; `/v1/claims/redeem` answers `404 claim_not_found`).
+
+## B. Apps with their own backend (`handoff = claim`)
+
+Sections 1 to 5 below are for apps whose backend links its users with a claim token and receives webhooks.
+
 ## 1. What you get from the platform team
 
 Created with `ikf app create` (shown once, sent to you out of band):
PATCH
```

`docs/runbooks/entitlement-identity.md` (sửa, áp dụng đúng diff này):

````bash
git apply <<'PATCH'
diff --git a/docs/runbooks/entitlement-identity.md b/docs/runbooks/entitlement-identity.md
index 7f83b8a..9c55f44 100644
--- a/docs/runbooks/entitlement-identity.md
+++ b/docs/runbooks/entitlement-identity.md
@@ -4,7 +4,8 @@ Rollout per environment (staging first). Needs billing live (docs/runbooks/billi
 goes into git, a shell history or a chat.
 
 Identity is off until it is configured: core-api registers `/v1/apps`, `/v1/claims/*`, `/v1/otp/*`,
-`/v1/magic/*`, `/v1/users/*`, `/v1/checkout/:id/claim` and starts `entitlement-sync` + `webhook-sender` only when
+`/v1/magic/*`, `/v1/users/*`, `/v1/web-funnel/entitlements`, `/v1/checkout/:id/claim`,
+`/v1/payment/check-purchased-web-funnel` and starts `entitlement-sync` + `webhook-sender` only when
 the secret `claim-token-key` has a value and `MAIL_FROM` is set (otherwise it logs
 `identity disabled, missing: …`). While off, `outbox.published_at` stays NULL: nothing is lost, the worker
 catches up when it starts.
@@ -12,7 +13,8 @@ catches up when it starts.
 ## 1. Terraform
 
 `terraform apply` the env: secret `ikf/<env>/claim-token-key` (empty), IAM `AppWebhookSecrets`
-(`ikf/<env>/app-webhook/*`), identity rate-limit paths (prod only: staging's Free plan keeps one rule, B19).
+(`ikf/<env>/app-webhook/*`), identity rate-limit paths incl. `/v1/payment/check-purchased-web-funnel`, 50 per 10 s
+per IP (prod only: staging's Free plan keeps one rule, B19).
 
 ## 2. Secret value
 
@@ -32,7 +34,8 @@ access for the region before real buyers, or only verified addresses receive cla
 
 ```bash
 ikf app create starlyn --name "Starlyn" --kind app --adjust https://app.adjust.com/<token> --scheme starlyn \
-  --webhook https://<app backend>/ikf/webhook          # prints API key + webhook secret ONCE
+  --webhook https://<app backend>/ikf/webhook --handoff user_id --bundle-ids <ios bundle>,<android package>
+                                                       # prints API key + webhook secret ONCE
 ikf funnel set witch-power --app starlyn
 ikf funnel prices set witch-power 1w=pri_…:dsc_… addon=pri_…@tarot_2027
 ```
@@ -49,6 +52,24 @@ email (they restore with the email code). Done when `SELECT count(*) FROM entitl
 Send the key and secret to the app backend team through the password manager, with
 `docs/integration/app-backend.md`.
 
+### Handoff: chosen when the app is created
+
+- `--handoff user_id`: the app uses IKameSDK (the SDK checks `POST /v1/payment/check-purchased-web-funnel`). The
+  get-app link and the email carry `deep_link=<scheme>://<path>?user_id=<uuid>` (`--deeplink-path`, default
+  `open`). No claim token, OTP or webhook for this app. `--bundle-ids`: the ids the SDK may send as `bundle_id`;
+  a `bundle_id` that matches no app counts as "not pro", so register them before release. `--webhook` is still
+  required by the API but receives nothing.
+- `--handoff claim`: the app has its own backend (claim token, OTP, webhooks), as in sections 1–5 of
+  `docs/integration/app-backend.md`, part B.
+
+There is no API to change `handoff` later, on purpose: buyers already have links of the old kind. A claim link
+does nothing on a `user_id` app (`/v1/claims/redeem` → 404), and a `user_id` link means nothing to an app that does
+not read it. Change it (SQL, see Database access) only before the first real sale, or together with the app
+team's plan for the buyers who already have a link.
+
+A leaked `user_id` gives its holder the buyer's purchases; there is no way to issue a new one yet (spec §6).
+`ikf customer show <email>` prints it for support.
+
 ## 5. Verify (staging)
 
 1. Buy the weekly plan on the funnel (sandbox card) → the "Get the app" link becomes the Adjust link within ~20 s;
@@ -61,7 +82,11 @@ Send the key and secret to the app backend team through the password manager, wi
    schedule (or by setting `next_attempt_at` in the staging DB, see Database access) → dead + one alarm email; restore the endpoint and
    `ikf app webhooks starlyn --resend <event_id>` → a NEW delivery (new event id, response has `resent_from`) with the
    user's current state → delivered.
-6. Exit criterion (spec): ≥ 98% of paid staging buyers linked —
+6. App on IKameSDK (`handoff user_id`): buy → the "Get the app" link holds `deep_link=…user_id%3D<uuid>`, the
+   email has the same link; `curl -s -X POST https://api.<zone>/v1/payment/check-purchased-web-funnel -H 'content-type: application/json' -d '{"user_id":"<uuid>"}'`
+   → `"is_pro":true`; refund in Paddle → `"is_pro":false` within a minute. The core-api log has
+   `check_purchased` lines with `user_hash`, never the UUID.
+7. Exit criterion (spec): ≥ 98% of paid staging buyers linked —
    `SELECT count(DISTINCT ct.customer_id) FILTER (WHERE l.id IS NOT NULL)::float / count(DISTINCT ct.customer_id) FROM claim_tokens ct LEFT JOIN app_links l ON l.customer_id = ct.customer_id AND l.app_id = ct.app_id;`
 
 ## Operations
PATCH
````

- [ ] **Step 4: Chạy test, xác nhận PASS (toàn bộ phần compat)**

```bash
terraform fmt -check -recursive infra
(cd infra/modules/edge && terraform test -no-color | tail -1)
(cd infra/stack && terraform init -backend=false -input=false >/dev/null && terraform test -no-color | tail -1)
npm test -w @ikf/paddle -w @ikf/event-schema -w @ikf/sdk -w @ikf/cli -w @ikf/edge-router -w @ikf/event-consumer -w @ikf/core-api -w @ikf/route-match 2>&1 | grep -E "Test Files|Tests  "
```

Expected: fmt không in gì; edge `Success! 10 passed, 0 failed.`; stack `Success! 11 passed, 0 failed.`; paddle 31, event-schema 145, sdk 152, cli 118, edge-router 101, event-consumer 8 + 27, core-api **342** (34 file), route-match 35 — tất cả PASS. Workflow CI không đổi (`core-api.yml` đã chạy khi `docs/integration/**` đổi).

- [ ] **Step 5: Commit**

```bash
git add docs infra/modules/edge services/core-api
git commit -m "docs(identity): IKameSDK apps (handoff user_id) first in app-backend.md, runbook; infra: rate-limit check-purchased"
```

---

### Task 9: Merge `feat/local-demo`; chỗ cắm `__IKF.paddle.js` (SDK + edge-router) và chặn ở deploy

**Files:**
- Merge: `feat/local-demo` (`demo/`, `package.json`, `package-lock.json`, `.gitignore`, `CLAUDE.md`)
- Create: `workers/edge-router/scripts/deploy-config.js`
- Modify: `packages/sdk/src/checkout.js`, `workers/edge-router/src/pay.js`, `workers/edge-router/scripts/render-config.mjs`
- Test: `packages/sdk/test/checkout.test.js`, `packages/sdk/test/helpers/billing.js`, `workers/edge-router/test/pay.test.js`, `workers/edge-router/test/deploy-config.test.js` (mới)

**Interfaces:**
- Consumes: `billingConfig(env)` (`pay.js`), `createCheckout` (`checkout.js`, helper `https(u)`), `wrangler.json`.
- Produces:
  - `__IKF.paddle = {env, clientToken, js?}`: `js` = `PADDLE_JS_URL` khi biến bắt đầu bằng `https://`; SDK nạp `cfg.paddle.js` nếu là https, ngược lại `PADDLE_JS` (CDN Paddle).
  - `deployConfig(base: wrangler.json, env) → config` (ném `Error` với thông báo cũ của `render-config.mjs`, cộng `PADDLE_JS_URL is for the local demo only; unset it in the deploy environment`); `render-config.mjs` chỉ in kết quả (D1).
  - Sau merge: `demo/lib/{docker,funnels,media,miniflare,adapters,stack}.mjs`, `demo/run.mjs`, `npm run demo`, `npm run demo:test` (Task 10–15 dùng).

- [ ] **Step 1: Merge `feat/local-demo`**

```bash
git merge --no-ff feat/local-demo -m "Merge branch 'feat/local-demo' into feat/demo-purchase"
# Tại 5d3627f: không xung đột (D13). Nếu package-lock.json xung đột:
#   git checkout --ours package-lock.json && npm install && git add package-lock.json && git commit --no-edit
npm ci
git status --short   # phải sạch (npm ci không đổi lock)
```

- [ ] **Step 2: Chạy mốc sau merge**

```bash
npm run demo:test 2>&1 | grep -E "Test Files|Tests  "
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: demo `Test Files  7 passed (7)`, `Tests  45 passed (45)` (gồm e2e `demo.test.mjs`, cần Docker + funnel); core-api vẫn `342`.

- [ ] **Step 3: Viết test fail**

`packages/sdk/test/helpers/billing.js`, `packages/sdk/test/checkout.test.js`, `workers/edge-router/test/pay.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/packages/sdk/test/checkout.test.js b/packages/sdk/test/checkout.test.js
index 7dccd9c..c1056f4 100644
--- a/packages/sdk/test/checkout.test.js
+++ b/packages/sdk/test/checkout.test.js
@@ -61,6 +61,21 @@ describe('SDK checkout', () => {
     expect(h.paddle.init.token).toBe('live_x');
   });
 
+  // Demo only (spec demo-purchase §2): edge-router sets __IKF.paddle.js when its PADDLE_JS_URL var is set; https only.
+  it.each([
+    ['https://demo.trycloudflare.com/_demo/paddle.js', 'https://demo.trycloudflare.com/_demo/paddle.js'],
+    ['http://demo.test/_demo/paddle.js', PADDLE_JS],
+    ['javascript:alert(1)', PADDLE_JS],
+    [undefined, PADDLE_JS],
+  ])('__IKF.paddle.js %j → Paddle.js loaded from %s', async (js, src) => {
+    h.replies.push(json(201, { checkout_id: CK, transaction_id: 'txn_1' }));
+    boot(IKF({ paddle: { env: 'sandbox', clientToken: 'test_client_token', ...(js && { js }) } }));
+    clickBuy();
+    await flushAll();
+    expect(h.loads).toEqual([TURNSTILE_JS, src]);
+    expect(h.paddle.opened).toEqual([{ transactionId: 'txn_1', settings: { displayMode: 'overlay', variant: 'one-page' } }]);
+  });
+
   it.each([
     ['without __IKF.paddle', { paddle: undefined }],
     ['without a Turnstile sitekey', { turnstile: undefined }],
diff --git a/packages/sdk/test/helpers/billing.js b/packages/sdk/test/helpers/billing.js
index d34f153..da19986 100644
--- a/packages/sdk/test/helpers/billing.js
+++ b/packages/sdk/test/helpers/billing.js
@@ -63,7 +63,7 @@ export function boot(ikf = IKF(), { url = 'https://try.x.com/promo?utm_source=me
     loadScript: async (src) => {
       h.loads.push(src);
       if (h.loadFails.includes(src)) throw new Error('blocked');
-      if (src === PADDLE_JS) window.Paddle = h.paddle;
+      if (src !== TURNSTILE_JS) window.Paddle = h.paddle; // PADDLE_JS, or the demo's __IKF.paddle.js
       if (src === TURNSTILE_JS) {
         window.turnstile = {
           render: (el, opts) => {
diff --git a/workers/edge-router/test/pay.test.js b/workers/edge-router/test/pay.test.js
index 7446118..602f249 100644
--- a/workers/edge-router/test/pay.test.js
+++ b/workers/edge-router/test/pay.test.js
@@ -94,6 +94,16 @@ describe('__IKF billing keys', () => {
     });
   });
 
+  // Demo only (spec demo-purchase §2): the local demo serves a fake Paddle.js. Without the var nothing changes.
+  it('PADDLE_JS_URL (https) becomes __IKF.paddle.js; unset, empty or not https adds nothing', async () => {
+    const js = 'https://demo.trycloudflare.com/_demo/paddle.js';
+    const plain = { env: 'sandbox', clientToken: 'test_client_token' };
+    expect((await ikf(`https://${HOST}/`, { ...withBilling, PADDLE_JS_URL: js })).paddle).toEqual({ ...plain, js });
+    expect((await ikf(`https://${HOST}/`, { ...withBilling, PADDLE_JS_URL: 'http://demo.test/_demo/paddle.js' })).paddle).toEqual(plain);
+    expect(billingConfig({ ...BILLING, PADDLE_JS_URL: '' }).paddle).toEqual(plain);
+    expect(billingConfig(BILLING).paddle).toEqual(plain);
+  });
+
   it('previews never do', async () => {
     await env.BUNDLES.put('bundles/aivideo/v1/index.html', '<head></head>');
     const doc = await ikf(`https://${env.PREVIEW_HOST}/aivideo/v1/`, withBilling);
PATCH
```

`workers/edge-router/test/deploy-config.test.js` (tạo mới):

```js
import { describe, it, expect } from 'vitest';
import base from '../wrangler.json';
import { deployConfig } from '../scripts/deploy-config.js';

const ENV = { WORKER_ENV: 'staging', KV_NAMESPACE_ID: 'kv1', R2_BUCKET: 'ikf-bundles-staging', PREVIEW_HOST: 'preview.ikf-staging.example' };

describe('deploy config (scripts/render-config.mjs)', () => {
  // Spec demo-purchase §2: the fake Paddle.js hook is for the local demo only.
  it.each([['staging', 'sandbox'], ['prod', 'live']])('%s: Worker vars are exactly the known ones, never PADDLE_JS_URL', (env, paddle) => {
    const cfg = deployConfig(base, { ...ENV, WORKER_ENV: env, PADDLE_ENV: paddle, TURNSTILE_SITEKEY: '0x4AAAAAAA', API_ORIGIN: 'https://api.x' });
    expect(cfg.name).toBe(`ikf-edge-router-${env}`);
    expect(Object.keys(cfg.vars).sort()).toEqual(['API_ORIGIN', 'PADDLE_ENV', 'PREVIEW_HOST', 'SDK_ENABLED', 'TURNSTILE_SITEKEY']);
    expect(base.vars).not.toHaveProperty('PADDLE_JS_URL');
  });

  it('refuses to render when PADDLE_JS_URL is set in the deploy environment', () => {
    expect(() => deployConfig(base, { ...ENV, PADDLE_JS_URL: 'https://evil.example/paddle.js' })).toThrow('PADDLE_JS_URL is for the local demo only');
    const tampered = { ...base, vars: { ...base.vars, PADDLE_JS_URL: 'https://evil.example/paddle.js' } };
    expect(() => deployConfig(tampered, ENV)).toThrow('PADDLE_JS_URL is for the local demo only');
  });

  it('keeps the existing checks: required env, PADDLE_ENV value, sandbox on staging and live on prod', () => {
    expect(() => deployConfig(base, { ...ENV, R2_BUCKET: '' })).toThrow('missing env: R2_BUCKET');
    expect(() => deployConfig(base, { ...ENV, PADDLE_ENV: 'test' })).toThrow('PADDLE_ENV must be sandbox or live');
    expect(() => deployConfig(base, { ...ENV, PADDLE_ENV: 'live' })).toThrow('staging must use PADDLE_ENV=sandbox, got live');
    expect(() => deployConfig(base, { ...ENV, WORKER_ENV: 'prod', PADDLE_ENV: 'sandbox' })).toThrow('prod must use PADDLE_ENV=live, got sandbox');
    expect(deployConfig(base, ENV).vars).toEqual({ PREVIEW_HOST: ENV.PREVIEW_HOST, SDK_ENABLED: 'false', PADDLE_ENV: '', TURNSTILE_SITEKEY: '', API_ORIGIN: '' });
    expect(deployConfig(base, { ...ENV, SDK_ENABLED: 'true' }).vars.SDK_ENABLED).toBe('true');
  });
});
```

- [ ] **Step 4: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/sdk -w @ikf/edge-router 2>&1 | grep -E "×|Test Files|Tests  |Cannot find"
```

Expected: sdk FAIL 1 (`__IKF.paddle.js "https://demo.trycloudflare.com/_demo/paddle.js" → …`: vẫn nạp CDN), `Tests  1 failed | 155 passed (156)`; edge-router `Cannot find module '../scripts/deploy-config.js'` + FAIL `PADDLE_JS_URL (https) becomes __IKF.paddle.js …`, `Test Files  2 failed | 5 passed (7)`, `Tests  1 failed | 101 passed (102)`.

- [ ] **Step 5: Implement**

`packages/sdk/src/checkout.js`, `workers/edge-router/src/pay.js`, `workers/edge-router/scripts/render-config.mjs` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/packages/sdk/src/checkout.js b/packages/sdk/src/checkout.js
index 6c82ddb..842ea7a 100644
--- a/packages/sdk/src/checkout.js
+++ b/packages/sdk/src/checkout.js
@@ -285,7 +285,9 @@ export function createCheckout(win, { cfg, sid, track, attribution, loadScript,
 
   function paddle() {
     if (!paddleReady) {
-      paddleReady = load(PADDLE_JS).then(() => {
+      // __IKF.paddle.js: the local demo's fake Paddle.js (edge-router sets it only with PADDLE_JS_URL); https only.
+      const js = cfg.paddle.js;
+      paddleReady = load(https(js) ? js : PADDLE_JS).then(() => {
         const P = win.Paddle;
         if (cfg.paddle.env === 'sandbox') P.Environment.set('sandbox');
         P.Initialize({ token: cfg.paddle.clientToken, eventCallback: onPaddleEvent });
diff --git a/workers/edge-router/scripts/render-config.mjs b/workers/edge-router/scripts/render-config.mjs
index 68ef995..b0af64b 100644
--- a/workers/edge-router/scripts/render-config.mjs
+++ b/workers/edge-router/scripts/render-config.mjs
@@ -1,43 +1,12 @@
 #!/usr/bin/env node
 // Prints the deploy config for one environment: node scripts/render-config.mjs > wrangler.deploy.json
 import { readFileSync } from 'node:fs';
+import { deployConfig } from './deploy-config.js';
 
 const base = JSON.parse(readFileSync(new URL('../wrangler.json', import.meta.url), 'utf8'));
-const need = ['WORKER_ENV', 'KV_NAMESPACE_ID', 'R2_BUCKET', 'PREVIEW_HOST'];
-const missing = need.filter((k) => !process.env[k]);
-if (missing.length) {
-  console.error(`missing env: ${missing.join(', ')}`);
+try {
+  console.log(JSON.stringify(deployConfig(base, process.env), null, 2));
+} catch (err) {
+  console.error(err.message);
   process.exit(1);
 }
-const { WORKER_ENV, KV_NAMESPACE_ID, R2_BUCKET, PREVIEW_HOST } = process.env;
-// Kill switch for the SDK script tag and POST /_ikf/c: only the exact string "true" turns them on.
-const SDK_ENABLED = process.env.SDK_ENABLED === 'true' ? 'true' : 'false';
-// Billing (__IKF.paddle/turnstile/api, /_ikf/pay): all three vars plus the PADDLE_CLIENT_TOKEN secret, or off.
-const PADDLE_ENV = process.env.PADDLE_ENV || '';
-if (PADDLE_ENV && !['sandbox', 'live'].includes(PADDLE_ENV)) {
-  console.error('PADDLE_ENV must be sandbox or live');
-  process.exit(1);
-}
-// staging = Paddle sandbox, prod = live; never the other way round.
-const PADDLE_ENV_FOR = { staging: 'sandbox', prod: 'live' };
-if (PADDLE_ENV && PADDLE_ENV_FOR[WORKER_ENV] && PADDLE_ENV !== PADDLE_ENV_FOR[WORKER_ENV]) {
-  console.error(`${WORKER_ENV} must use PADDLE_ENV=${PADDLE_ENV_FOR[WORKER_ENV]}, got ${PADDLE_ENV}`);
-  process.exit(1);
-}
-const billingVars = { PADDLE_ENV, TURNSTILE_SITEKEY: process.env.TURNSTILE_SITEKEY || '', API_ORIGIN: process.env.API_ORIGIN || '' };
-
-console.log(
-  JSON.stringify(
-    {
-      ...base,
-      name: `ikf-edge-router-${WORKER_ENV}`,
-      workers_dev: false,
-      vars: { ...base.vars, PREVIEW_HOST, SDK_ENABLED, ...billingVars },
-      kv_namespaces: [{ binding: 'ROUTES', id: KV_NAMESPACE_ID }],
-      r2_buckets: [{ binding: 'BUNDLES', bucket_name: R2_BUCKET }],
-      queues: { producers: [{ binding: 'EVENTS', queue: `ikf-events-${WORKER_ENV}` }] },
-    },
-    null,
-    2,
-  ),
-);
diff --git a/workers/edge-router/src/pay.js b/workers/edge-router/src/pay.js
index 24547a6..1c7767b 100644
--- a/workers/edge-router/src/pay.js
+++ b/workers/edge-router/src/pay.js
@@ -4,12 +4,15 @@ const TXN_RE = /^txn_[a-z0-9]{26}$/;
 export const PADDLE_JS = 'https://cdn.paddle.com/paddle/v2/paddle.js';
 
 // __IKF billing keys, only when every value is configured (spec §1): {paddle: {env, clientToken}, turnstile, api}.
+// PADDLE_JS_URL (local demo only, never in a deploy config) adds paddle.js: the SDK loads Paddle.js from there.
 export function billingConfig(env) {
   const ok =
     (env.PADDLE_ENV === 'sandbox' || env.PADDLE_ENV === 'live') &&
     env.PADDLE_CLIENT_TOKEN && env.TURNSTILE_SITEKEY && /^https:\/\/[^/]+$/.test(env.API_ORIGIN || '');
   if (!ok) return null;
-  return { paddle: { env: env.PADDLE_ENV, clientToken: env.PADDLE_CLIENT_TOKEN }, turnstile: env.TURNSTILE_SITEKEY, api: env.API_ORIGIN };
+  const paddle = { env: env.PADDLE_ENV, clientToken: env.PADDLE_CLIENT_TOKEN };
+  if (/^https:\/\//.test(env.PADDLE_JS_URL || '')) paddle.js = env.PADDLE_JS_URL;
+  return { paddle, turnstile: env.TURNSTILE_SITEKEY, api: env.API_ORIGIN };
 }
 
 // `ret` must be an absolute URL on the host serving this page, so the page cannot redirect elsewhere.
PATCH
```

`workers/edge-router/scripts/deploy-config.js` (tạo mới):

```js
// The deploy config of one environment, from wrangler.json and the deploy job's env (render-config.mjs prints it).
// Throws an Error whose message says what is wrong. Worker vars are wrangler.json's plus an explicit list from the
// job's environment: PADDLE_JS_URL (the local demo's fake Paddle.js) never reaches a deployed Worker.
const NEED = ['WORKER_ENV', 'KV_NAMESPACE_ID', 'R2_BUCKET', 'PREVIEW_HOST'];
// staging = Paddle sandbox, prod = live; never the other way round.
const PADDLE_ENV_FOR = { staging: 'sandbox', prod: 'live' };

export function deployConfig(base, env) {
  const missing = NEED.filter((k) => !env[k]);
  if (missing.length) throw new Error(`missing env: ${missing.join(', ')}`);
  if (env.PADDLE_JS_URL || base.vars?.PADDLE_JS_URL) throw new Error('PADDLE_JS_URL is for the local demo only; unset it in the deploy environment');
  const { WORKER_ENV, KV_NAMESPACE_ID, R2_BUCKET, PREVIEW_HOST } = env;
  // Kill switch for the SDK script tag and POST /_ikf/c: only the exact string "true" turns them on.
  const SDK_ENABLED = env.SDK_ENABLED === 'true' ? 'true' : 'false';
  // Billing (__IKF.paddle/turnstile/api, /_ikf/pay): all three vars plus the PADDLE_CLIENT_TOKEN secret, or off.
  const PADDLE_ENV = env.PADDLE_ENV || '';
  if (PADDLE_ENV && !['sandbox', 'live'].includes(PADDLE_ENV)) throw new Error('PADDLE_ENV must be sandbox or live');
  if (PADDLE_ENV && PADDLE_ENV_FOR[WORKER_ENV] && PADDLE_ENV !== PADDLE_ENV_FOR[WORKER_ENV]) {
    throw new Error(`${WORKER_ENV} must use PADDLE_ENV=${PADDLE_ENV_FOR[WORKER_ENV]}, got ${PADDLE_ENV}`);
  }
  const billingVars = { PADDLE_ENV, TURNSTILE_SITEKEY: env.TURNSTILE_SITEKEY || '', API_ORIGIN: env.API_ORIGIN || '' };
  return {
    ...base,
    name: `ikf-edge-router-${WORKER_ENV}`,
    workers_dev: false,
    vars: { ...base.vars, PREVIEW_HOST, SDK_ENABLED, ...billingVars },
    kv_namespaces: [{ binding: 'ROUTES', id: KV_NAMESPACE_ID }],
    r2_buckets: [{ binding: 'BUNDLES', bucket_name: R2_BUCKET }],
    queues: { producers: [{ binding: 'EVENTS', queue: `ikf-events-${WORKER_ENV}` }] },
  };
}
```

- [ ] **Step 6: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/sdk -w @ikf/edge-router 2>&1 | grep -E "Test Files|Tests  |bytes gzip"
(cd workers/edge-router && WORKER_ENV=prod KV_NAMESPACE_ID=k R2_BUCKET=b PREVIEW_HOST=p PADDLE_JS_URL=https://x node scripts/render-config.mjs; echo "exit $?")
npm run demo:test 2>&1 | grep -E "Test Files|Tests  "
```

Expected: sdk `Test Files  11 passed (11)`, `Tests  156 passed (156)`; edge-router `ikf sdk d1a533c86611: 8154 bytes gzip`, `Test Files  7 passed (7)`, `Tests  106 passed (106)`; render-config in `PADDLE_JS_URL is for the local demo only; unset it in the deploy environment` và `exit 1`; demo vẫn `45 passed (45)`.

- [ ] **Step 7: Commit**

```bash
git add packages/sdk workers/edge-router
git commit -m "feat(sdk,edge-router): __IKF.paddle.js (https) from PADDLE_JS_URL for the local demo; deploy config refuses it"
```

---

### Task 10: Paddle giả + hàng đợi trong bộ nhớ

**Files:**
- Create: `demo/lib/paddle-fake.mjs`, `demo/lib/queue.mjs`
- Test: `demo/test/paddle-fake.test.mjs`, `demo/test/queue.test.mjs` (mới)

**Interfaces:**
- Consumes: `PaddleError`, `signWebhook`, `verifyWebhook` (`@ikf/paddle`); `startQueueWorker` (`services/core-api/src/billing/queue.js`).
- Produces:
  - `DEMO_PRICES = {'1w': {id: 'pri_demoweekly0000000000000000', amount: 1367, recurring: true}, addon: {id: 'pri_demoaddon00000000000000000', amount: 1999, recurring: false}}` (D3); `paddleId(prefix)`.
  - `createFakePaddle({webhookUrl, webhookSecret, prices?, fetch?, now?})` → bề mặt `@ikf/paddle`: `createTransaction`, `getTransaction` (kèm `customer`, `adjustments`), `getSubscription`, `getCustomer`, `createCustomer` (409 `customer_already_exists` như Paddle), `getPrice`, `getDiscount`, `listTransactions`, `listAdjustments`; hành động `pay(txnId, email)`, `refund(txnId, {type: 'full'|'partial'})`, `expire(subId)` (D2), `renew(subId) → renewal txn`; lỗi hành động có `.status` (400/404/409); `state() → {transactions: [{id, status, plan, amount, origin, subscription_id, created_at, refunds}], subscriptions: [{id, status, plan, ends_at}]}` (không email). Webhook: `subscription.created`, `transaction.completed`, `adjustment.updated`, `subscription.updated`, ký `Paddle-Signature` bằng `signWebhook`; core trả không 2xx → hành động ném `webhook <type>: HTTP <status>`.
  - `memoryQueue({visibilityMs = 5000, maxReceives = 5})` → `{send, receive({signal}), delete, pending, inFlight, dropped}` (D12).

- [ ] **Step 1: Viết test fail**

`demo/test/queue.test.mjs` (tạo mới):

```js
import { describe, it, expect } from 'vitest';
import { startQueueWorker } from '../../services/core-api/src/billing/queue.js';
import { memoryQueue } from '../lib/queue.mjs';

describe('memoryQueue (the createSqsQueue surface, in memory)', () => {
  it('receive long-polls until a send, returns SQS-shaped messages, and delete acks them', async () => {
    const q = memoryQueue();
    const got = q.receive();
    await q.send({ event_id: 'evt_1', entity: 'transaction', entity_id: 'txn_1' });
    const [m] = await got;
    expect(m).toEqual({ id: 'm1', receiptHandle: 'rh1', receiveCount: 1, body: { event_id: 'evt_1', entity: 'transaction', entity_id: 'txn_1' } });
    await q.delete(m.receiptHandle);
    expect(q.inFlight).toBe(0);
  });

  it('an aborted receive resolves with no messages', async () => {
    const q = memoryQueue();
    const ac = new AbortController();
    const got = q.receive({ signal: ac.signal });
    ac.abort();
    expect(await got).toEqual([]);
  });

  it('a message not deleted comes back after the visibility timeout, at most maxReceives times', async () => {
    const q = memoryQueue({ visibilityMs: 10, maxReceives: 2 });
    await q.send({ n: 1 });
    expect((await q.receive())[0].receiveCount).toBe(1);
    const again = await q.receive();
    expect(again[0].receiveCount).toBe(2);
    await new Promise((r) => setTimeout(r, 30));
    expect(q.pending).toBe(0);
    expect(q.dropped).toEqual([{ n: 1 }]);
  });

  it("drives core's billing queue worker: handled messages are deleted, a failed one is retried", async () => {
    const q = memoryQueue({ visibilityMs: 10 });
    const seen = [];
    let failOnce = true;
    const stop = startQueueWorker({
      queue: q,
      handle: async (body) => {
        seen.push(body.n);
        if (body.n === 2 && failOnce) {
          failOnce = false;
          throw new Error('db blip');
        }
      },
      log: { error: () => {} },
    });
    await q.send({ n: 1 });
    await q.send({ n: 2 });
    for (let i = 0; i < 50 && seen.length < 3; i += 1) await new Promise((r) => setTimeout(r, 10));
    await stop();
    expect(seen).toEqual([1, 2, 2]);
    expect(q.inFlight).toBe(0);
  });
});
```

`demo/test/paddle-fake.test.mjs` (tạo mới):

```js
import { createServer } from 'node:http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PaddleError, verifyWebhook } from '@ikf/paddle';
import { DEMO_PRICES, createFakePaddle } from '../lib/paddle-fake.mjs';

const SECRET = 'pdl_ntfset_demo_secret';
const DAY = 86400_000;

// A stand-in for core's POST /v1/paddle/webhook: records the raw body and the signature check.
async function startHook() {
  const got = [];
  let status = 200;
  const server = createServer((req, res) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      got.push({ event: JSON.parse(raw), check: verifyWebhook(raw, req.headers['paddle-signature'], SECRET) });
      res.writeHead(status).end('{}');
    });
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return {
    url: `http://127.0.0.1:${server.address().port}/v1/paddle/webhook`,
    got,
    types: () => got.map((g) => g.event.event_type),
    reply: (s) => { status = s; },
    close: () => new Promise((r) => server.close(r)),
  };
}

describe('fake Paddle (demo)', () => {
  let hook;
  let paddle;
  const checkout = (price = DEMO_PRICES['1w'].id, plan = '1w') =>
    paddle.createTransaction({ items: [{ price_id: price, quantity: 1 }], custom_data: { checkout_id: '01JA0000000000000000000001', funnel: 'witch-power', plan } });

  beforeEach(async () => {
    hook = await startHook();
    paddle = createFakePaddle({ webhookUrl: hook.url, webhookSecret: SECRET });
  });
  afterEach(() => hook.close());

  it('pay: the transaction completes with a customer and a weekly subscription; webhooks are signed like Paddle', async () => {
    const txn = await checkout();
    expect(txn).toMatchObject({ status: 'draft', customer_id: null, items: [{ price: { id: DEMO_PRICES['1w'].id }, quantity: 1 } ] });
    expect(txn.id).toMatch(/^txn_[a-z0-9]{26}$/);
    await paddle.pay(txn.id, 'buyer@demo.test');
    const paid = await paddle.getTransaction(txn.id);
    expect(paid).toMatchObject({ status: 'completed', origin: 'web', custom_data: { plan: '1w' }, customer: { email: 'buyer@demo.test' }, adjustments: [] });
    expect(paid.customer_id).toMatch(/^ctm_[a-z0-9]{26}$/);
    expect(paid.updated_at).toMatch(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{6}Z$/);
    const sub = await paddle.getSubscription(paid.subscription_id);
    expect(sub).toMatchObject({ status: 'active', customer_id: paid.customer_id, custom_data: { plan: '1w' } });
    const p = sub.current_billing_period;
    expect(Date.parse(p.ends_at) - Date.parse(p.starts_at)).toBe(7 * DAY);
    expect(hook.types()).toEqual(['subscription.created', 'transaction.completed']);
    expect(hook.got.every((g) => g.check.ok)).toBe(true);
    expect(hook.got[1].event.data.id).toBe(txn.id);
    await expect(paddle.pay(txn.id, 'buyer@demo.test')).rejects.toMatchObject({ status: 409 });
    await expect(paddle.pay('txn_nope', 'buyer@demo.test')).rejects.toMatchObject({ status: 404 });
  });

  it('the add-on is one-time (no subscription); a known email reuses its customer; createCustomer conflicts like Paddle', async () => {
    const first = await checkout();
    await paddle.pay(first.id, 'buyer@demo.test');
    const addon = await checkout(DEMO_PRICES.addon.id, 'addon');
    await paddle.pay(addon.id, 'Buyer@Demo.test');
    const t1 = await paddle.getTransaction(first.id);
    const t2 = await paddle.getTransaction(addon.id);
    expect(t2.subscription_id).toBeNull();
    expect(t2.customer_id).toBe(t1.customer_id);
    expect(t2.details.totals.grand_total).toBe(String(DEMO_PRICES.addon.amount));
    expect(hook.types().slice(2)).toEqual(['transaction.completed']);
    const err = await paddle.createCustomer({ email: 'buyer@demo.test' }).catch((e) => e);
    expect(err).toBeInstanceOf(PaddleError);
    expect(err).toMatchObject({ kind: 'client', status: 409, code: 'customer_already_exists' });
    expect(err.detail).toContain(t1.customer_id);
    const fresh = await paddle.createCustomer({ email: 'new@demo.test' });
    const ready = await paddle.createTransaction({ items: [{ price_id: DEMO_PRICES.addon.id, quantity: 1 }], customer_id: fresh.id, custom_data: {} });
    expect(ready.status).toBe('ready');
    await paddle.pay(ready.id, '');
    expect((await paddle.getTransaction(ready.id)).customer.email).toBe('new@demo.test');
  });

  it('refund adds an approved adjustment of that type and sends adjustment.updated', async () => {
    const txn = await checkout();
    await paddle.pay(txn.id, 'buyer@demo.test');
    await paddle.refund(txn.id, { type: 'partial' });
    await paddle.refund(txn.id);
    const { adjustments } = await paddle.getTransaction(txn.id);
    expect(adjustments.map((a) => [a.action, a.type, a.status, a.transaction_id])).toEqual([
      ['refund', 'partial', 'approved', txn.id],
      ['refund', 'full', 'approved', txn.id],
    ]);
    expect(adjustments[1].totals.total).toBe(String(DEMO_PRICES['1w'].amount));
    expect(hook.types().slice(2)).toEqual(['adjustment.updated', 'adjustment.updated']);
    expect(hook.got.at(-1).event.data.transaction_id).toBe(txn.id);
    expect((await paddle.listAdjustments({ createdAfter: '2000-01-01T00:00:00Z' })).map((a) => a.type)).toEqual(['full', 'partial']);
    await expect(paddle.refund((await checkout()).id)).rejects.toMatchObject({ status: 409 });
  });

  it('expire: past_due with the period over 4 days ago; renew: a completed renewal and a new period', async () => {
    const txn = await checkout();
    await paddle.pay(txn.id, 'buyer@demo.test');
    const subId = (await paddle.getTransaction(txn.id)).subscription_id;
    const before = Date.now();
    await paddle.expire(subId);
    const expired = await paddle.getSubscription(subId);
    expect(expired.status).toBe('past_due');
    expect(before - Date.parse(expired.current_billing_period.ends_at)).toBeGreaterThanOrEqual(4 * DAY);
    const renewal = await paddle.renew(subId);
    const sub = await paddle.getSubscription(subId);
    expect(sub.status).toBe('active');
    expect(Date.parse(sub.current_billing_period.ends_at)).toBeGreaterThan(before + 6 * DAY);
    expect(await paddle.getTransaction(renewal.id)).toMatchObject({ status: 'completed', origin: 'subscription_recurring', subscription_id: subId, custom_data: { plan: '1w' } });
    expect(hook.types().slice(2)).toEqual(['subscription.updated', 'subscription.updated', 'transaction.completed']);
    expect(Date.parse(sub.updated_at)).toBeGreaterThan(Date.parse(expired.updated_at) - 1);
    await expect(paddle.expire('sub_nope')).rejects.toMatchObject({ status: 404 });
  });

  it('prices, not found, and a webhook core rejects (the action fails)', async () => {
    expect(await paddle.getPrice(DEMO_PRICES['1w'].id)).toMatchObject({ status: 'active', billing_cycle: { interval: 'week', frequency: 1 } });
    expect((await paddle.getPrice(DEMO_PRICES.addon.id)).billing_cycle).toBeNull();
    for (const call of [() => paddle.getPrice('pri_nope'), () => paddle.getDiscount('dsc_x'), () => paddle.getTransaction('txn_x'), () => paddle.getCustomer('ctm_x')]) {
      await expect(call()).rejects.toMatchObject({ kind: 'not_found', status: 404 });
    }
    hook.reply(401);
    await expect(paddle.pay((await checkout()).id, 'buyer@demo.test')).rejects.toThrow('webhook subscription.created: HTTP 401');
  });

  it('state() lists transactions and subscriptions for the control panel, without emails', async () => {
    const txn = await checkout();
    await paddle.pay(txn.id, 'buyer@demo.test');
    const s = paddle.state();
    expect(s.transactions).toEqual([expect.objectContaining({ id: txn.id, status: 'completed', plan: '1w', amount: DEMO_PRICES['1w'].amount, refunds: [] })]);
    expect(s.subscriptions).toEqual([expect.objectContaining({ status: 'active', plan: '1w' })]);
    expect(JSON.stringify(s)).not.toContain('buyer@demo.test');
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npx vitest run --config demo/vitest.config.mjs test/queue.test.mjs test/paddle-fake.test.mjs 2>&1 | grep -E "Cannot find|Tests  "
```

Expected: FAIL — `Cannot find module '../lib/paddle-fake.mjs'`, `Cannot find module '../lib/queue.mjs'` (`Test Files  2 failed (2)`, `Tests  no tests`).

- [ ] **Step 3: Implement**

`demo/lib/queue.mjs` (tạo mới):

```js
// In-memory stand-in for the SQS queue billing uses (src/billing/queue.js createSqsQueue):
// send(body), receive({signal}) → [{id, receiptHandle, receiveCount, body}], delete(receiptHandle).
// Like SQS, a message that is received but not deleted comes back after the visibility timeout, and is
// dropped after maxReceives receives (SQS would move it to the DLQ).
export function memoryQueue({ visibilityMs = 5000, maxReceives = 5 } = {}) {
  const pending = [];
  const inFlight = new Map();
  const waiters = new Set();
  const dropped = [];
  let seq = 0;
  const wake = () => {
    for (const w of waiters) w();
    waiters.clear();
  };
  const back = (m) => {
    inFlight.delete(m.receiptHandle);
    if (m.receiveCount >= maxReceives) dropped.push(m.body);
    else pending.push(m);
    wake();
  };
  return {
    async send(body) {
      seq += 1;
      pending.push({ id: `m${seq}`, receiptHandle: `rh${seq}`, receiveCount: 0, body: structuredClone(body) });
      wake();
    },
    async receive({ signal } = {}) {
      if (!pending.length && !signal?.aborted) {
        await new Promise((resolve) => {
          waiters.add(resolve);
          signal?.addEventListener('abort', resolve, { once: true });
        });
      }
      if (signal?.aborted) return [];
      const batch = pending.splice(0, 10);
      for (const m of batch) {
        m.receiveCount += 1;
        const timer = setTimeout(() => back(m), visibilityMs);
        timer.unref?.();
        inFlight.set(m.receiptHandle, { m, timer });
      }
      return batch.map((m) => ({ id: m.id, receiptHandle: m.receiptHandle, receiveCount: m.receiveCount, body: structuredClone(m.body) }));
    },
    async delete(receiptHandle) {
      const f = inFlight.get(receiptHandle);
      if (!f) return;
      clearTimeout(f.timer);
      inFlight.delete(receiptHandle);
    },
    get pending() {
      return pending.length;
    },
    get inFlight() {
      return inFlight.size;
    },
    dropped,
  };
}
```

`demo/lib/paddle-fake.mjs` (tạo mới):

```js
// A Paddle stand-in for the purchase demo: the client surface core-api uses (@ikf/paddle createPaddleClient)
// over in-memory state, plus the buyer / dashboard actions (pay, refund, expire, renew). Every action changes
// the state first, then POSTs the webhook Paddle would send, signed with the same signWebhook core verifies,
// so billing-sync re-reads this state exactly as it would re-read Paddle. Nothing is written to disk.
import { randomBytes } from 'node:crypto';
import { PaddleError, signWebhook } from '@ikf/paddle';

const DAY = 86400_000;
const PERIOD_DAYS = 7;
// "Expire" = the renewal payment failed and the 3-day grace is over too (past_due, period ended 4 days ago).
const EXPIRED_DAYS_AGO = 4;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALNUM = 'abcdefghijklmnopqrstuvwxyz0123456789';

// witch-power's plans: 1w = $13.67 weekly, addon = $19.99 once (prices in minor units).
export const DEMO_PRICES = {
  '1w': { id: 'pri_demoweekly0000000000000000', amount: 1367, recurring: true },
  addon: { id: 'pri_demoaddon00000000000000000', amount: 1999, recurring: false },
};

// <prefix>_ + 26 lowercase alphanumerics, the shape of Paddle ids.
export function paddleId(prefix) {
  let s = '';
  for (const b of randomBytes(26)) s += ALNUM[b % 36];
  return `${prefix}_${s}`;
}

// An action error the demo server turns into an HTTP status.
const fail = (status, message) => Object.assign(new Error(message), { status });
const notFound = (what, id) => new PaddleError('not_found', { status: 404, code: 'entity_not_found', detail: `${what} ${id} not found` });

export function createFakePaddle({ webhookUrl, webhookSecret, prices = DEMO_PRICES, fetch: doFetch = globalThis.fetch, now = () => Date.now() }) {
  const priceById = new Map(Object.values(prices).map((p) => [p.id, p]));
  const customers = new Map();
  const transactions = new Map();
  const subscriptions = new Map();
  const adjustments = new Map();
  let lastMicros = 0;

  // Paddle timestamps: RFC 3339 with 6 fraction digits, strictly increasing here so billing never sees an
  // update as "same or older" than the one it has.
  const stamp = (ms = now()) => {
    lastMicros = Math.max(ms * 1000, lastMicros + 1);
    const iso = new Date(Math.floor(lastMicros / 1000)).toISOString();
    return `${iso.slice(0, 23)}${String(lastMicros % 1000).padStart(3, '0')}Z`;
  };
  const iso = (ms) => new Date(ms).toISOString();
  const copy = (v) => structuredClone(v);
  const get = (map, what, id) => {
    if (!map.has(id)) throw notFound(what, id);
    return map.get(id);
  };

  async function webhook(eventType, data) {
    const raw = JSON.stringify({ event_id: paddleId('evt'), event_type: eventType, occurred_at: stamp(), notification_id: paddleId('ntf'), data });
    const res = await doFetch(webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'paddle-signature': signWebhook(raw, webhookSecret) },
      body: raw,
    });
    if (!res.ok) throw new Error(`webhook ${eventType}: HTTP ${res.status}`);
  }

  function customerFor(email) {
    const e = String(email ?? '').trim();
    for (const c of customers.values()) if (c.email.toLowerCase() === e.toLowerCase()) return c;
    if (!EMAIL_RE.test(e)) throw fail(400, 'a valid email is needed to pay');
    const c = { id: paddleId('ctm'), email: e, created_at: stamp() };
    customers.set(c.id, c);
    return c;
  }

  const period = (startMs) => ({ starts_at: iso(startMs), ends_at: iso(startMs + PERIOD_DAYS * DAY) });

  function newTransaction({ priceId, customerId = null, customData = null, status, subscriptionId = null, origin = 'web' }) {
    const price = priceById.get(priceId);
    if (!price) throw new PaddleError('client', { status: 400, code: 'price_not_found', detail: `price ${priceId} not found` });
    const at = stamp();
    const t = {
      id: paddleId('txn'),
      status,
      customer_id: customerId,
      subscription_id: subscriptionId,
      origin,
      currency_code: 'USD',
      custom_data: customData,
      billed_at: status === 'completed' ? at : null,
      created_at: at,
      updated_at: at,
      items: [{ price: { id: priceId }, quantity: 1 }],
      details: { totals: { grand_total: String(price.amount), currency_code: 'USD' } },
      adjustments: [],
    };
    transactions.set(t.id, t);
    return t;
  }

  return {
    env: 'sandbox',

    // --- the @ikf/paddle client surface (what core-api calls) ---
    async createTransaction(body) {
      const t = newTransaction({
        priceId: body.items?.[0]?.price_id,
        customerId: body.customer_id ?? null,
        customData: body.custom_data ?? null,
        status: body.customer_id ? 'ready' : 'draft',
      });
      return copy(t);
    },
    async getTransaction(id) {
      const t = get(transactions, 'transaction', id);
      return copy({ ...t, customer: t.customer_id ? customers.get(t.customer_id) ?? null : null });
    },
    async getSubscription(id) {
      return copy(get(subscriptions, 'subscription', id));
    },
    async getCustomer(id) {
      return copy(get(customers, 'customer', id));
    },
    async createCustomer({ email }) {
      for (const c of customers.values()) {
        if (c.email.toLowerCase() === String(email).trim().toLowerCase()) {
          throw new PaddleError('client', { status: 409, code: 'customer_already_exists', detail: `customer email conflicts with customer of id ${c.id}` });
        }
      }
      return copy(customerFor(email));
    },
    async getPrice(id) {
      const p = priceById.get(id);
      if (!p) throw notFound('price', id);
      return { id, status: 'active', billing_cycle: p.recurring ? { interval: 'week', frequency: 1 } : null, unit_price: { amount: String(p.amount), currency_code: 'USD' } };
    },
    async getDiscount(id) {
      throw notFound('discount', id);
    },
    async listTransactions({ updatedAfter }) {
      return [...transactions.values()].filter((t) => t.updated_at > updatedAfter).sort((a, b) => a.updated_at.localeCompare(b.updated_at)).map(copy);
    },
    async listAdjustments({ createdAfter }) {
      return [...adjustments.values()].filter((a) => a.created_at > createdAfter).sort((a, b) => b.created_at.localeCompare(a.created_at)).map(copy);
    },

    // --- buyer and dashboard actions (the demo's overlay and control panel) ---
    // The buyer pays: customer (by email, or the one already on the transaction), subscription for a
    // recurring price, transaction completed; then subscription.created + transaction.completed.
    async pay(txnId, email) {
      const t = transactions.get(txnId);
      if (!t) throw fail(404, `transaction ${txnId} not found`);
      if (t.status !== 'draft' && t.status !== 'ready') throw fail(409, `transaction ${txnId} is ${t.status}`);
      const customer = t.customer_id ? customers.get(t.customer_id) : customerFor(email);
      const at = stamp();
      let sub = null;
      if (priceById.get(t.items[0].price.id).recurring) {
        sub = {
          id: paddleId('sub'),
          status: 'active',
          customer_id: customer.id,
          custom_data: t.custom_data,
          items: copy(t.items),
          current_billing_period: period(now()),
          canceled_at: null,
          scheduled_change: null,
          created_at: at,
          updated_at: at,
        };
        subscriptions.set(sub.id, sub);
      }
      Object.assign(t, { status: 'completed', customer_id: customer.id, subscription_id: sub?.id ?? null, billed_at: at, updated_at: stamp() });
      if (sub) await webhook('subscription.created', copy(sub));
      await webhook('transaction.completed', copy(t));
      return { transaction: copy(t), subscription: sub && copy(sub) };
    },

    // An approved refund (type full | partial) on a completed transaction → adjustment.updated.
    async refund(txnId, { type = 'full' } = {}) {
      const t = transactions.get(txnId);
      if (!t) throw fail(404, `transaction ${txnId} not found`);
      if (t.status !== 'completed') throw fail(409, `transaction ${txnId} is ${t.status}`);
      const total = Number(t.details.totals.grand_total);
      const at = stamp();
      const a = {
        id: paddleId('adj'),
        action: 'refund',
        type,
        status: 'approved',
        transaction_id: t.id,
        subscription_id: t.subscription_id,
        customer_id: t.customer_id,
        currency_code: 'USD',
        totals: { total: String(type === 'full' ? total : Math.floor(total / 2)), currency_code: 'USD' },
        created_at: at,
        updated_at: at,
      };
      t.adjustments.push(a);
      adjustments.set(a.id, a);
      await webhook('adjustment.updated', copy(a));
      return copy(a);
    },

    // The renewal failed and the grace is over: past_due, period ended 4 days ago → subscription.updated.
    async expire(subId) {
      const s = subscriptions.get(subId);
      if (!s) throw fail(404, `subscription ${subId} not found`);
      Object.assign(s, { status: 'past_due', current_billing_period: period(now() - (EXPIRED_DAYS_AGO + PERIOD_DAYS) * DAY), updated_at: stamp() });
      await webhook('subscription.updated', copy(s));
      return copy(s);
    },

    // A renewal payment: a new completed transaction (origin subscription_recurring), a new period, active.
    async renew(subId) {
      const s = subscriptions.get(subId);
      if (!s) throw fail(404, `subscription ${subId} not found`);
      const t = newTransaction({
        priceId: s.items[0].price.id, customerId: s.customer_id, customData: s.custom_data, status: 'completed', subscriptionId: s.id, origin: 'subscription_recurring',
      });
      Object.assign(s, { status: 'active', current_billing_period: period(now()), updated_at: stamp() });
      await webhook('subscription.updated', copy(s));
      await webhook('transaction.completed', copy(t));
      return copy(t);
    },

    // For the control panel: no emails.
    state() {
      const plan = (x) => x.custom_data?.plan ?? null;
      return {
        transactions: [...transactions.values()].map((t) => ({
          id: t.id, status: t.status, plan: plan(t), amount: Number(t.details.totals.grand_total), origin: t.origin,
          subscription_id: t.subscription_id, created_at: t.created_at, refunds: t.adjustments.map((a) => a.type),
        })),
        subscriptions: [...subscriptions.values()].map((s) => ({
          id: s.id, status: s.status, plan: plan(s), ends_at: s.current_billing_period.ends_at,
        })),
      };
    },
  };
}
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npx vitest run --config demo/vitest.config.mjs test/queue.test.mjs test/paddle-fake.test.mjs 2>&1 | grep -E "Tests  "
npm run demo:test 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  10 passed (10)`; toàn bộ demo `Test Files  9 passed (9)`, `Tests  55 passed (55)`.

- [ ] **Step 5: Commit**

```bash
git add demo
git commit -m "feat(demo): fake Paddle (client surface + pay/refund/expire/renew with signed webhooks) and an in-memory queue"
```

---

### Task 11: Quick tunnel (`cloudflared`) + proxy một origin

**Files:**
- Create: `demo/lib/tunnel.mjs`, `demo/lib/proxy.mjs`
- Test: `demo/test/tunnel.test.mjs`, `demo/test/proxy.test.mjs` (mới)

**Interfaces:**
- Consumes: `DemoError` (`demo/lib/docker.mjs`).
- Produces:
  - `parseTunnelUrl(text) → 'https://<words>.trycloudflare.com' | null` (bỏ `api.trycloudflare.com`); `startTunnel(port, {bin = 'cloudflared', spawnFn, timeoutMs = 30000}) → Promise<{url, host, stop()}>`; lỗi: `cloudflared not found. Install it: brew install cloudflared`, `cloudflared gave no https://*.trycloudflare.com URL within <s> s:\n<output>`, `cloudflared exited (code <n>) before giving a URL:\n<output>`.
  - `targetOf(url) → 'core' | 'demo' | 'media' | 'edge'`; `startProxy({port = 8788, host = '0.0.0.0', ports: {core, demo, media, edge}}) → {port, close()}` — giữ `Host`, thêm `X-Forwarded-Proto: https`, `/_media` bị bỏ khi chuyển tới media (D4), upstream không lên → `502 demo proxy: <target> is not reachable`.

- [ ] **Step 1: Viết test fail**

`demo/test/tunnel.test.mjs` (tạo mới; mẫu output là output thật của `cloudflared 2026.10.0`):

```js
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { describe, it, expect } from 'vitest';
import { DemoError } from '../lib/docker.mjs';
import { parseTunnelUrl, startTunnel } from '../lib/tunnel.mjs';

// What cloudflared 2026.10 prints on stderr for a quick tunnel (trimmed).
const SAMPLE = `2026-10-11T06:00:35Z INF Thank you for trying Cloudflare Tunnel. ... (https://www.cloudflare.com/website-terms/) ... https://developers.cloudflare.com/cloudflare-one/connections/connect-apps
2026-10-11T06:00:35Z INF Requesting new quick Tunnel on trycloudflare.com...
2026-10-11T06:00:39Z INF +--------------------------------------------------------------------------------------------+
2026-10-11T06:00:39Z INF |  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):  |
2026-10-11T06:00:39Z INF |  https://individual-outside-deer-seven.trycloudflare.com                                   |
2026-10-11T06:00:39Z INF +--------------------------------------------------------------------------------------------+
`;

// A child process stand-in: spawnFn records the call and returns it; the test writes to its stderr.
function fakeSpawn({ error = null } = {}) {
  const child = new EventEmitter();
  child.stdout = new PassThrough();
  child.stderr = new PassThrough();
  child.exitCode = null;
  child.signalCode = null;
  child.killed = [];
  child.kill = (sig) => {
    child.killed.push(sig);
    child.signalCode = sig;
    queueMicrotask(() => child.emit('exit', null, sig));
  };
  const calls = [];
  const spawnFn = (bin, args) => {
    calls.push([bin, ...args]);
    if (error) queueMicrotask(() => child.emit('error', error));
    return child;
  };
  return { child, calls, spawnFn };
}

describe('parseTunnelUrl', () => {
  it('finds the quick tunnel URL and ignores the other https links and api.trycloudflare.com', () => {
    expect(parseTunnelUrl(SAMPLE)).toBe('https://individual-outside-deer-seven.trycloudflare.com');
    expect(parseTunnelUrl('ERR failed to request quick Tunnel: Post "https://api.trycloudflare.com/tunnel": EOF')).toBeNull();
    expect(parseTunnelUrl('Requesting new quick Tunnel on trycloudflare.com...')).toBeNull();
  });
});

describe('startTunnel', () => {
  it('spawns cloudflared for the port and resolves with the URL from its stderr; stop() ends it', async () => {
    const f = fakeSpawn();
    const p = startTunnel(8788, { spawnFn: f.spawnFn });
    f.child.stderr.write(SAMPLE.slice(0, 300));
    f.child.stderr.write(SAMPLE.slice(300));
    const t = await p;
    expect(f.calls).toEqual([['cloudflared', 'tunnel', '--no-autoupdate', '--url', 'http://localhost:8788']]);
    expect(t.url).toBe('https://individual-outside-deer-seven.trycloudflare.com');
    expect(t.host).toBe('individual-outside-deer-seven.trycloudflare.com');
    await t.stop();
    expect(f.child.killed).toEqual(['SIGTERM']);
  });

  it('missing binary: a DemoError that says brew install cloudflared', async () => {
    const f = fakeSpawn({ error: Object.assign(new Error('spawn cloudflared ENOENT'), { code: 'ENOENT' }) });
    const err = await startTunnel(8788, { spawnFn: f.spawnFn }).catch((e) => e);
    expect(err).toBeInstanceOf(DemoError);
    expect(err.message).toBe('cloudflared not found. Install it: brew install cloudflared');
  });

  it('no URL in time: a DemoError with what cloudflared printed, and the process is stopped', async () => {
    const f = fakeSpawn();
    const p = startTunnel(8788, { spawnFn: f.spawnFn, timeoutMs: 20 });
    f.child.stderr.write('ERR failed to request quick Tunnel: Post "https://api.trycloudflare.com/tunnel": EOF\n');
    const err = await p.catch((e) => e);
    expect(err).toBeInstanceOf(DemoError);
    expect(err.message).toContain('no https://*.trycloudflare.com URL within 0.02 s');
    expect(err.message).toContain('failed to request quick Tunnel');
    expect(f.child.killed).toEqual(['SIGTERM']);
  });

  it('cloudflared exiting before a URL: a DemoError with its output', async () => {
    const f = fakeSpawn();
    const p = startTunnel(8788, { spawnFn: f.spawnFn });
    f.child.stderr.write('ERR something broke\n');
    await new Promise((r) => setImmediate(r));
    f.child.exitCode = 1;
    f.child.emit('exit', 1, null);
    const err = await p.catch((e) => e);
    expect(err.message).toBe('cloudflared exited (code 1) before giving a URL:\nERR something broke');
  });
});
```

`demo/test/proxy.test.mjs` (tạo mới):

```js
import { createServer, request } from 'node:http';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startProxy, targetOf } from '../lib/proxy.mjs';

// Upstream that answers with who it is and what it received.
async function echo(name) {
  const server = createServer((req, res) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      res.writeHead(201, { 'content-type': 'application/json', 'x-who': name });
      res.end(JSON.stringify({ who: name, method: req.method, url: req.url, host: req.headers.host, proto: req.headers['x-forwarded-proto'], body: Buffer.concat(chunks).toString() }));
    });
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return { port: server.address().port, close: () => new Promise((r) => server.close(r)) };
}

// node:http, not fetch: fetch does not let a caller set Host.
const send = (port, { method = 'GET', path, host = 'demo.test', body } = {}) =>
  new Promise((resolve, reject) => {
    const req = request({ host: '127.0.0.1', port, method, path, headers: { host, ...(body && { 'content-type': 'application/json' }) } }, (res) => {
      let text = '';
      res.on('data', (c) => { text += c; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, text }));
    });
    req.on('error', reject);
    req.end(body);
  });

describe('demo proxy (one https origin for the tunnel)', () => {
  let ups;
  let proxy;
  beforeAll(async () => {
    ups = { core: await echo('core'), demo: await echo('demo'), media: await echo('media'), edge: await echo('edge') };
    proxy = await startProxy({ port: 0, host: '127.0.0.1', ports: { core: ups.core.port, demo: ups.demo.port, media: ups.media.port, edge: ups.edge.port } });
  });
  afterAll(async () => {
    await proxy.close();
    for (const u of Object.values(ups)) await u.close();
  });

  it('targetOf: /v1/* → core, /_demo/* → demo server, /_media/* → media, everything else → edge-router', () => {
    expect(['/v1/checkout', '/v1/payment/check-purchased-web-funnel', '/_demo', '/_demo/app?deep_link=x', '/_media/witch-power/img/a.jpg', '/witch-power', '/v1', '/v10/x', '/_ikf/sdk.abc.js', '/']
      .map(targetOf)).toEqual(['core', 'core', 'demo', 'demo', 'media', 'edge', 'edge', 'edge', 'edge', 'edge']);
  });

  it('forwards method, path, body and Host unchanged, adds X-Forwarded-Proto: https, passes status and headers back', async () => {
    const r = await send(proxy.port, { method: 'POST', path: '/v1/checkout?x=1', body: '{"plan":"1w"}' });
    expect(r.status).toBe(201);
    expect(r.headers['x-who']).toBe('core');
    expect(JSON.parse(r.text)).toEqual({ who: 'core', method: 'POST', url: '/v1/checkout?x=1', host: 'demo.test', proto: 'https', body: '{"plan":"1w"}' });
    expect(JSON.parse((await send(proxy.port, { path: '/_demo/state' })).text).who).toBe('demo');
    expect(JSON.parse((await send(proxy.port, { path: '/_media/witch-power/img/hook-moon.jpg' })).text)).toMatchObject({ who: 'media', url: '/witch-power/img/hook-moon.jpg' });
    expect(JSON.parse((await send(proxy.port, { path: '/witch-power', host: 'abc.trycloudflare.com' })).text)).toMatchObject({ who: 'edge', host: 'abc.trycloudflare.com' });
  });

  it('502 with a short text when the upstream is not up (yet)', async () => {
    const down = await startProxy({ port: 0, host: '127.0.0.1', ports: { core: 1, demo: 1, media: 1, edge: 1 } });
    const r = await send(down.port, { path: '/witch-power' });
    expect(r.status).toBe(502);
    expect(r.text).toBe('demo proxy: edge is not reachable');
    await down.close();
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npx vitest run --config demo/vitest.config.mjs test/tunnel.test.mjs test/proxy.test.mjs 2>&1 | grep -E "Cannot find|Tests  "
```

Expected: FAIL — `Cannot find module '../lib/proxy.mjs'`, `Cannot find module '../lib/tunnel.mjs'` (`Tests  no tests`).

- [ ] **Step 3: Implement**

`demo/lib/tunnel.mjs` (tạo mới):

```js
// Cloudflare quick tunnel (no account): `cloudflared tunnel --url http://localhost:<port>` prints a random
// https://<words>.trycloudflare.com URL on stderr. The URL changes on every run.
import { spawn } from 'node:child_process';
import { DemoError } from './docker.mjs';

// Not api.trycloudflare.com (cloudflared prints that in its errors).
const TUNNEL_URL_RE = /https:\/\/(?!api\.)[a-z0-9-]+\.trycloudflare\.com/;
export const TUNNEL_TIMEOUT_MS = 30_000;
const KEEP = 4000; // characters of cloudflared output kept for error messages

export const parseTunnelUrl = (text) => TUNNEL_URL_RE.exec(text)?.[0] ?? null;

// → {url, host, stop()}; DemoError when cloudflared is missing, exits, or prints no URL within timeoutMs.
export function startTunnel(port, { bin = 'cloudflared', spawnFn = spawn, timeoutMs = TUNNEL_TIMEOUT_MS } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawnFn(bin, ['tunnel', '--no-autoupdate', '--url', `http://localhost:${port}`], { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let settled = false;
    const stop = () =>
      new Promise((done) => {
        if (child.exitCode !== null || child.signalCode !== null) return done();
        child.once('exit', () => done());
        child.kill('SIGTERM');
      });
    const finish = (err, url) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (!err) return resolve({ url, host: new URL(url).host, stop });
      if (child.exitCode === null && child.signalCode === null) child.kill('SIGTERM');
      reject(err);
    };
    const onData = (chunk) => {
      out = (out + chunk).slice(-KEEP);
      const url = parseTunnelUrl(out);
      if (url) finish(null, url);
    };
    child.stdout?.on('data', onData);
    child.stderr?.on('data', onData);
    child.once('error', (err) => {
      finish(new DemoError(err.code === 'ENOENT' ? 'cloudflared not found. Install it: brew install cloudflared' : `cloudflared failed to start: ${err.code ?? err.message}`));
    });
    child.once('exit', (code) => finish(new DemoError(`cloudflared exited (code ${code}) before giving a URL:\n${out.trim()}`)));
    const timer = setTimeout(
      () => finish(new DemoError(`cloudflared gave no https://*.trycloudflare.com URL within ${timeoutMs / 1000} s:\n${out.trim()}`)),
      timeoutMs,
    );
  });
}
```

`demo/lib/proxy.mjs` (tạo mới):

```js
// One origin for the phone (the tunnel points here): /v1/* → core-api, /_demo/* → demo server, /_media/* →
// media server (prefix dropped: an https page cannot load http images), everything else → edge-router
// (Miniflare). Host is kept (routing, CORS and Turnstile all key on it) and X-Forwarded-Proto: https is
// added (the tunnel terminates TLS).
import { createServer, request } from 'node:http';

export const targetOf = (url) => {
  const path = url.split('?')[0];
  if (path.startsWith('/v1/')) return 'core';
  if (path === '/_demo' || path.startsWith('/_demo/')) return 'demo';
  if (path.startsWith('/_media/')) return 'media';
  return 'edge';
};

// ports: {core, demo, media, edge} on 127.0.0.1. → {port, close()}
export async function startProxy({ port = 8788, host = '0.0.0.0', ports }) {
  const server = createServer((req, res) => {
    const target = targetOf(req.url);
    const path = target === 'media' ? req.url.slice('/_media'.length) : req.url;
    const up = request(
      { host: '127.0.0.1', port: ports[target], method: req.method, path, headers: { ...req.headers, 'x-forwarded-proto': 'https' } },
      (r) => {
        res.writeHead(r.statusCode, r.headers);
        r.pipe(res);
      },
    );
    up.on('error', () => {
      if (res.headersSent) return res.destroy();
      res.writeHead(502, { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' }).end(`demo proxy: ${target} is not reachable`);
    });
    req.pipe(up);
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

- [ ] **Step 4: Chạy test, xác nhận PASS (+ kiểm tunnel thật một lần)**

```bash
npx vitest run --config demo/vitest.config.mjs test/tunnel.test.mjs test/proxy.test.mjs 2>&1 | grep -E "Tests  "
npm run demo:test 2>&1 | grep -E "Test Files|Tests  "
node -e "import('./demo/lib/tunnel.mjs').then(async ({ startTunnel }) => { const t = await startTunnel(59998); console.log('url', t.url); await t.stop(); console.log('stopped'); })"
```

Expected: `Tests  8 passed (8)`; demo `Test Files  11 passed (11)`, `Tests  63 passed (63)`; lệnh cuối (cần internet) in `url https://<words>.trycloudflare.com` rồi `stopped`.

- [ ] **Step 5: Commit**

```bash
git add demo
git commit -m "feat(demo): Cloudflare quick tunnel and a one-origin proxy (/v1 core, /_demo server, /_media media, rest edge)"
```

---

### Task 12: Stack chế độ purchase (deps, worker, Miniflare vars, seed, hộp thư) + smoke phần 1

**Files:**
- Create: `demo/lib/mailbox.mjs`, `demo/lib/purchase.mjs`, `demo/lib/seed.mjs`
- Modify: `demo/lib/miniflare.mjs`, `demo/lib/stack.mjs`
- Test: `demo/test/purchase-deps.test.mjs`, `demo/test/seed.test.mjs`, `demo/test/purchase.test.mjs` (mới)

**Interfaces:**
- Consumes: Task 10 (`createFakePaddle`, `DEMO_PRICES`, `memoryQueue`), Task 11 (`startProxy`); core: `buildApp`, `startQueueWorker`, `syncMessage`, `startEntitlementSync`, `startWebhookSender`, `secretCache`; `sdk-contract.js` (Task 4); app `handoff` (Task 2).
- Produces:
  - `createMailbox({keep = 50, now}) → {send({to, subject, text, html}), list() → [{to, subject, text, html, link, at}]}` (mới nhất trước).
  - `DEMO_CLAIM_KEY`, `DEMO_WEBHOOK_SECRET`, `TURNSTILE_TEST_SITEKEY`; `jsonLog(write, {verbose})`; `purchaseDeps({host, coreUrl, log}) → {paddle, mailbox, deps: {paddle, queue, webhookSecret, webhookSecrets, claimKey, mailer, turnstile, alarm}}`; `startPurchaseWorkers({pool, deps, log}) → stop()`.
  - `purchaseBindings(base)` + `startMiniflare({…, purchaseBase})`.
  - `DEMO_APP = 'starlyn'`, `coreRequest(coreUrl, token)`, `seedPurchase({request, pool, base, funnel})` (D5).
  - `startStack({…, purchase: {base}, logStream})` → thêm `purchase: {base, host, funnel, url, panel, paddle, mailbox}` (null khi không purchase); `PORTS = {edge: 8787, core: 8080, media: 8790, proxy: 8788, demo: 8791}`.

- [ ] **Step 1: Viết test fail**

`demo/test/purchase-deps.test.mjs` (tạo mới):

```js
import { describe, it, expect } from 'vitest';
import { createMailbox } from '../lib/mailbox.mjs';
import { purchaseBindings } from '../lib/miniflare.mjs';
import { DEMO_CLAIM_KEY, DEMO_WEBHOOK_SECRET, TURNSTILE_TEST_SITEKEY, jsonLog, purchaseDeps } from '../lib/purchase.mjs';

describe('purchase deps for core-api', () => {
  it('fake Turnstile passes for the purchase host; webhook secrets live in memory; fixed demo keys', async () => {
    const lines = [];
    const p = purchaseDeps({ host: 'demo.test', coreUrl: 'http://127.0.0.1:8080', log: jsonLog((l) => lines.push(l)) });
    expect(await p.deps.turnstile('XXXX.DUMMY.TOKEN.XXXX', '1.2.3.4')).toEqual({ ok: true, hostname: 'demo.test', codes: [] });
    await p.deps.webhookSecrets.put('starlyn', 'whsec_x');
    expect(await p.deps.webhookSecrets.get('starlyn')).toBe('whsec_x');
    expect(await p.deps.webhookSecrets.get('other')).toBeNull();
    expect(p.deps).toMatchObject({ claimKey: DEMO_CLAIM_KEY, webhookSecret: DEMO_WEBHOOK_SECRET, paddle: p.paddle, mailer: p.mailbox });
    expect(typeof p.deps.queue.receive).toBe('function');
    await p.deps.alarm('claim_email_failed', 'Claim email failed 3 times (app starlyn, checkout 01J…): Throttling');
    expect(lines.map((l) => JSON.parse(l))).toEqual([{ level: 'warn', msg: 'alarm', kind: 'claim_email_failed' }]);
  });

  it('jsonLog writes one JSON line per entry; info only when verbose', () => {
    const lines = [];
    const quiet = jsonLog((l) => lines.push(l), { verbose: false });
    quiet.info({ n: 1 }, 'tick');
    quiet.error({ code: 'ECONNREFUSED' }, 'entitlement_sync_failed');
    jsonLog((l) => lines.push(l)).info({ n: 2 }, 'tick');
    expect(lines).toEqual(['{"level":"error","msg":"entitlement_sync_failed","code":"ECONNREFUSED"}', '{"level":"info","msg":"tick","n":2}']);
  });

  it('Miniflare vars: sandbox, test client token, Cloudflare test sitekey, API and Paddle.js on the purchase origin', () => {
    expect(purchaseBindings('https://abc-def.trycloudflare.com')).toEqual({
      PADDLE_ENV: 'sandbox',
      PADDLE_CLIENT_TOKEN: 'test_demo',
      TURNSTILE_SITEKEY: TURNSTILE_TEST_SITEKEY,
      API_ORIGIN: 'https://abc-def.trycloudflare.com',
      PADDLE_JS_URL: 'https://abc-def.trycloudflare.com/_demo/paddle.js',
    });
    expect(TURNSTILE_TEST_SITEKEY).toBe('1x00000000000000000000AA');
  });
});

describe('mailbox', () => {
  it('keeps the newest 50 in memory, newest first, with the first https link of each', async () => {
    let t = Date.parse('2026-10-11T10:00:00Z');
    const box = createMailbox({ now: () => new Date((t += 1000)) });
    for (let i = 1; i <= 52; i += 1) await box.send({ to: `b${i}@demo.test`, subject: `S${i}`, text: `Open https://x.test/${i}?a=1 now`, html: '<p/>' });
    const list = box.list();
    expect(list).toHaveLength(50);
    expect(list[0]).toEqual({ to: 'b52@demo.test', subject: 'S52', text: 'Open https://x.test/52?a=1 now', html: '<p/>', link: 'https://x.test/52?a=1', at: '2026-10-11T10:00:52.000Z' });
    expect(list.at(-1).subject).toBe('S3');
    await box.send({ to: 'c@demo.test', subject: 'no link', text: 'hi' });
    expect(box.list()[0].link).toBeNull();
  });
});
```

`demo/test/seed.test.mjs` (tạo mới):

```js
import { describe, it, expect } from 'vitest';
import { DemoError } from '../lib/docker.mjs';
import { DEMO_PRICES } from '../lib/paddle-fake.mjs';
import { seedPurchase } from '../lib/seed.mjs';

// Records the core API calls and the SQL; reply(method path) decides the status.
function fakes(status = {}) {
  const calls = [];
  const sql = [];
  const request = async (method, path, body) => {
    calls.push([method, path, body]);
    const s = status[`${method} ${path}`] ?? 200;
    return { status: s, json: s >= 400 ? { error: s === 409 ? 'app_exists' : 'boom' } : {} };
  };
  const pool = { query: async (text, params) => { sql.push([text.replace(/\s+/g, ' ').trim(), params]); return { rowCount: 1, rows: [] }; } };
  return { calls, sql, request, pool };
}

const APP = {
  id: 'starlyn', name: 'Starlyn (demo)', kind: 'app', handoff: 'user_id', deeplink_scheme: 'starlyn',
  adjust_tracker_url: 'https://demo.test/_demo/app', webhook_url: 'https://demo.test/_demo/null',
};

describe('seedPurchase', () => {
  it('creates the app (handoff user_id), attaches the funnel and maps 1w → premium, addon → tarot_2027 through the API', async () => {
    const f = fakes({ 'POST /v1/apps': 201 });
    await seedPurchase({ request: f.request, pool: f.pool, base: 'https://demo.test', funnel: 'witch-power' });
    expect(f.calls).toEqual([
      ['POST', '/v1/apps', APP],
      ['PUT', '/v1/funnels/witch-power', { app_id: 'starlyn' }],
      ['PUT', '/v1/funnels/witch-power/prices', {
        plans: {
          '1w': { price_id: DEMO_PRICES['1w'].id, entitlement_key: 'premium' },
          addon: { price_id: DEMO_PRICES.addon.id, entitlement_key: 'tarot_2027' },
        },
      }],
    ]);
    expect(f.sql).toEqual([]);
  });

  it('idempotent: an existing app gets this run\'s URLs (the tunnel URL changes every run)', async () => {
    const f = fakes({ 'POST /v1/apps': 409 });
    await seedPurchase({ request: f.request, pool: f.pool, base: 'https://new-words.trycloudflare.com', funnel: 'witch-power' });
    expect(f.sql).toEqual([[
      "UPDATE apps SET adjust_tracker_url = $2, webhook_url = $3, deeplink_scheme = $4, handoff = 'user_id', deeplink_path = 'open' WHERE id = $1",
      ['starlyn', 'https://new-words.trycloudflare.com/_demo/app', 'https://new-words.trycloudflare.com/_demo/null', 'starlyn'],
    ]]);
    expect(f.calls.map((c) => c[1])).toEqual(['/v1/apps', '/v1/funnels/witch-power', '/v1/funnels/witch-power/prices']);
  });

  it('any other API error stops the demo with the response', async () => {
    const f = fakes({ 'PUT /v1/funnels/witch-power/prices': 422 });
    const err = await seedPurchase({ request: f.request, pool: f.pool, base: 'https://demo.test', funnel: 'witch-power' }).catch((e) => e);
    expect(err).toBeInstanceOf(DemoError);
    expect(err.message).toBe('PUT /v1/funnels/witch-power/prices -> 422 {"error":"boom"}');
  });
});
```

`demo/test/purchase.test.mjs` (tạo mới; Task 13 thêm 2 test):

```js
// The purchase demo end to end, no tunnel (needs Docker and the witch-power funnel): the browser's requests
// are sent to the demo proxy with Host demo.test and Origin https://demo.test, as the tunnel would deliver them.
// Own ports and databases (Postgres + ClickHouse ikf_purchase_test): runs next to `npm run demo`.
import { existsSync } from 'node:fs';
import { request } from 'node:http';
import { Writable } from 'node:stream';
import { describe, it, expect, afterAll } from 'vitest';
import { REQUEST_USER_ID_FIELD, RESPONSE_EXPIRES_FIELD, RESPONSE_IS_PRO_FIELD, PATH } from '../../services/core-api/src/identity/sdk-contract.js';
import { DEFAULT_FUNNELS_DIR, findFunnels } from '../lib/funnels.mjs';
import { startStack } from '../lib/stack.mjs';

const FUNNELS_DIR = process.env.IKF_FUNNELS_DIR || DEFAULT_FUNNELS_DIR;
const FUNNEL = 'witch-power';
let skipReason = '';
if (!existsSync(FUNNELS_DIR)) skipReason = `funnels folder not found: ${FUNNELS_DIR}`;
else if (!(await findFunnels(FUNNELS_DIR)).has(FUNNEL)) skipReason = `${FUNNEL} not found in ${FUNNELS_DIR}`;
if (skipReason) console.warn(`purchase smoke skipped: ${skipReason}`);

const BASE = 'https://demo.test';
const HOST = 'demo.test';
const PORTS = { edge: 8827, core: 8128, media: 8829, proxy: 8828, demo: 8831 };
const DBS = { pgDatabase: 'ikf_purchase_test', chDatabase: 'ikf_purchase_test' };
const EMAIL = 'smoke-buyer@demo.test';
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const ulid = () => `01${Array.from({ length: 24 }, () => CROCKFORD[Math.floor(Math.random() * 32)]).join('')}`;

// What the tunnel delivers: the proxy, Host demo.test; /v1 calls from the page carry Origin https://demo.test.
const http = (method, path, { body, origin = path.startsWith('/v1/') ? BASE : undefined } = {}) =>
  new Promise((resolve, reject) => {
    const headers = { host: HOST, ...(origin && { origin }), ...(body !== undefined && { 'content-type': 'application/json' }) };
    const req = request({ host: '127.0.0.1', port: PORTS.proxy, method, path, headers }, (res) => {
      let text = '';
      res.on('data', (c) => { text += c; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(text);
        } catch {
          // not JSON
        }
        resolve({ status: res.statusCode, headers: res.headers, text, json });
      });
    });
    req.on('error', reject);
    req.end(body === undefined ? undefined : JSON.stringify(body));
  });
const until = async (fn, ms) => {
  for (const end = Date.now() + ms; Date.now() < end; await new Promise((r) => setTimeout(r, 250))) {
    const v = await fn();
    if (v) return v;
  }
  return fn();
};
const check = async (userId) => (await http('POST', PATH, { body: { [REQUEST_USER_ID_FIELD]: userId }, origin: null })).json;

let logs = '';
const logStream = new Writable({ write(chunk, _enc, done) { logs += chunk; done(); } });
let stack;
let v;
afterAll(() => stack?.stop());

describe.skipIf(skipReason)('npm run demo:purchase (no tunnel, host https://demo.test)', () => {
  it('serves witch-power on the purchase host with the fake Paddle.js, the Turnstile test sitekey and the API on that origin', async () => {
    stack = await startStack({ funnels: [FUNNEL], purchase: { base: BASE }, ports: PORTS, lan: false, logStream, ...DBS });
    expect(stack.purchase).toMatchObject({ base: BASE, host: HOST, url: `${BASE}/${FUNNEL}`, panel: `${BASE}/_demo/` });
    const res = await http('GET', `/${FUNNEL}`);
    expect(res.status).toBe(200);
    const ikf = JSON.parse(/window\.__IKF=(\{.*?\})<\/script>/.exec(res.text)[1]);
    expect(ikf).toMatchObject({
      funnel: FUNNEL,
      paddle: { env: 'sandbox', clientToken: 'test_demo', js: `${BASE}/_demo/paddle.js` },
      turnstile: '1x00000000000000000000AA',
      api: BASE,
    });
    expect(res.text).toContain(`${BASE}/_media/${FUNNEL}/img/`);
    v = ikf.v;
  });

  it('checkout → pay → get-app link with the user_id within 20 s → pro → full refund → not pro within 10 s; logs hold no email or user_id', async () => {
    const created = await http('POST', '/v1/checkout', {
      body: { funnel: FUNNEL, v, plan: '1w', sid: ulid(), email: EMAIL, attribution: {}, turnstile_token: 'XXXX.DUMMY.TOKEN.XXXX' },
    });
    expect(created.status).toBe(201);
    const { checkout_id: checkoutId, transaction_id: txnId } = created.json;
    await stack.purchase.paddle.pay(txnId, EMAIL);

    const appLink = await until(async () => {
      const r = await http('GET', `/v1/checkout/${checkoutId}/claim`);
      return r.status === 200 && r.json.app_link;
    }, 20_000);
    expect(appLink).toMatch(new RegExp(`^${BASE}/_demo/app\\?deep_link=starlyn%3A%2F%2Fopen%3Fuser_id%3D[0-9a-f-]{36}$`));
    const userId = new URL(new URL(appLink).searchParams.get('deep_link')).searchParams.get('user_id');

    const pro = await until(async () => {
      const r = await check(userId);
      return r[RESPONSE_IS_PRO_FIELD] === true && r;
    }, 10_000);
    expect(pro[RESPONSE_IS_PRO_FIELD]).toBe(true);
    expect(Date.parse(pro[RESPONSE_EXPIRES_FIELD])).toBeGreaterThan(Date.now() + 9 * 86400_000);

    await stack.purchase.paddle.refund(txnId);
    expect(await until(async () => (await check(userId))[RESPONSE_IS_PRO_FIELD] === false, 10_000)).toBe(true);

    expect(logs).toContain('"msg":"check_purchased"');
    expect(logs).not.toContain(EMAIL);
    expect(logs).not.toContain(userId);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npx vitest run --config demo/vitest.config.mjs test/purchase-deps.test.mjs test/seed.test.mjs test/purchase.test.mjs 2>&1 | grep -E "Cannot find|→|Tests  "
```

Expected: `Cannot find module '../lib/mailbox.mjs'`, `Cannot find module '../lib/seed.mjs'`; smoke FAIL 2 (`expected undefined to match object { base: 'https://demo.test', …(3) }`, `connect ECONNREFUSED 127.0.0.1:8828`).

- [ ] **Step 3: Implement**

`demo/lib/mailbox.mjs` (tạo mới):

```js
// The demo's inbox: core-api's mailer ({send({to, subject, text, html})}) writes here instead of SES.
// The newest `keep` emails, in memory only (never on disk, never logged); /_demo/mail shows them.
const LINK_RE = /https:\/\/\S+/;

export function createMailbox({ keep = 50, now = () => new Date() } = {}) {
  const mails = [];
  return {
    async send({ to, subject, text, html }) {
      mails.unshift({ to, subject, text, html, link: LINK_RE.exec(text ?? '')?.[0] ?? null, at: now().toISOString() });
      if (mails.length > keep) mails.length = keep;
    },
    list: () => mails.map((m) => ({ ...m })),
  };
}
```

`demo/lib/purchase.mjs` (tạo mới):

```js
// What core-api needs for the full purchase flow in the demo, all local: fake Paddle, fake Turnstile check,
// in-memory queue and webhook-secret store, the mailbox, fixed (non-secret) keys, and the three workers that
// run next to core-api in production (billing-sync, entitlement-sync, webhook-sender).
import { startQueueWorker } from '../../services/core-api/src/billing/queue.js';
import { syncMessage } from '../../services/core-api/src/billing/sync.js';
import { startEntitlementSync } from '../../services/core-api/src/identity/sync.js';
import { secretCache, startWebhookSender } from '../../services/core-api/src/identity/webhooks.js';
import { createMailbox } from './mailbox.mjs';
import { createFakePaddle } from './paddle-fake.mjs';
import { memoryQueue } from './queue.mjs';

// Demo-only values, not secrets (they protect nothing outside this process).
export const DEMO_CLAIM_KEY = 'ikf-demo-claim-key-not-a-secret-0123456789';
export const DEMO_WEBHOOK_SECRET = 'pdl_ntfset_ikf_demo_not_a_secret';
// Cloudflare's official test sitekey: the browser widget always passes and returns a dummy token.
export const TURNSTILE_TEST_SITEKEY = '1x00000000000000000000AA';

// {info, warn, error}(obj, msg) → one JSON line each through write(); info only when verbose. Core's workers
// log codes and ids only, never emails, user_ids or error messages.
export function jsonLog(write, { verbose = true } = {}) {
  const line = (level) => (obj, msg) => write(JSON.stringify({ level, msg, ...obj }));
  return { info: verbose ? line('info') : () => {}, warn: line('warn'), error: line('error') };
}

// host: the purchase host the browser is on (Turnstile's hostname check); coreUrl: where Paddle webhooks go.
export function purchaseDeps({ host, coreUrl, log }) {
  const mailbox = createMailbox();
  const paddle = createFakePaddle({ webhookUrl: `${coreUrl}/v1/paddle/webhook`, webhookSecret: DEMO_WEBHOOK_SECRET });
  const secrets = new Map();
  return {
    paddle,
    mailbox,
    deps: {
      paddle,
      queue: memoryQueue(),
      webhookSecret: DEMO_WEBHOOK_SECRET,
      webhookSecrets: { get: async (id) => secrets.get(id) ?? null, put: async (id, s) => { secrets.set(id, s); } },
      claimKey: DEMO_CLAIM_KEY,
      mailer: mailbox,
      // The test sitekey's dummy token would fail Cloudflare's real siteverify: accept it for this host.
      turnstile: async () => ({ ok: true, hostname: host, codes: [] }),
      // Alarm messages may name a checkout; the kind is enough here.
      alarm: async (kind) => log.warn({ kind }, 'alarm'),
    },
  };
}

// billing-sync (queue → Paddle re-read → Postgres), entitlement-sync (outbox → entitlements, claim emails,
// expiry sweep), webhook-sender. Returns stop().
export function startPurchaseWorkers({ pool, deps, log }) {
  const stopBilling = startQueueWorker({ queue: deps.queue, handle: (msg) => syncMessage({ pool, paddle: deps.paddle, log }, msg), log, errorBackoffMs: 1000 });
  const stopSync = startEntitlementSync({ pool, mailer: deps.mailer, claimKey: deps.claimKey, alarm: deps.alarm, log });
  const stopSender = startWebhookSender({ pool, secrets: secretCache(deps.webhookSecrets), alarm: deps.alarm, log });
  return async () => {
    await stopBilling();
    await Promise.all([stopSync(), stopSender()]);
  };
}
```

`demo/lib/seed.mjs` (tạo mới):

```js
// The purchase demo's app and plans, through core's own API (the same calls as `ikf app create`,
// `ikf funnel set --app`, `ikf funnel prices set`). Idempotent; the app's URLs follow this run's base URL.
import { DemoError } from './docker.mjs';
import { DEMO_PRICES } from './paddle-fake.mjs';

export const DEMO_APP = 'starlyn';

// request(method, path, body) → {status, json} against core-api with the demo admin token.
export const coreRequest = (coreUrl, token) => async (method, path, body) => {
  const res = await fetch(coreUrl + path, {
    method,
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, json: await res.json().catch(() => ({})) };
};

export async function seedPurchase({ request, pool, base, funnel }) {
  const call = async (method, path, body, ok = []) => {
    const r = await request(method, path, body);
    if (r.status >= 400 && !ok.includes(r.status)) throw new DemoError(`${method} ${path} -> ${r.status} ${JSON.stringify(r.json)}`);
    return r;
  };
  const urls = { adjust_tracker_url: `${base}/_demo/app`, webhook_url: `${base}/_demo/null` };
  // The "Adjust tracker" is the fake app page; nothing listens behind the webhook URL (handoff user_id sends none).
  const created = await call('POST', '/v1/apps', {
    id: DEMO_APP, name: 'Starlyn (demo)', kind: 'app', handoff: 'user_id', deeplink_scheme: 'starlyn', ...urls,
  }, [409]);
  if (created.status === 409) {
    // No API edits an app; the tunnel URL is new on every run.
    await pool.query(
      "UPDATE apps SET adjust_tracker_url = $2, webhook_url = $3, deeplink_scheme = $4, handoff = 'user_id', deeplink_path = 'open' WHERE id = $1",
      [DEMO_APP, urls.adjust_tracker_url, urls.webhook_url, 'starlyn'],
    );
  }
  await call('PUT', `/v1/funnels/${funnel}`, { app_id: DEMO_APP });
  await call('PUT', `/v1/funnels/${funnel}/prices`, {
    plans: {
      '1w': { price_id: DEMO_PRICES['1w'].id, entitlement_key: 'premium' },
      addon: { price_id: DEMO_PRICES.addon.id, entitlement_key: 'tarot_2027' },
    },
  });
}
```

`demo/lib/miniflare.mjs`, `demo/lib/stack.mjs` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/demo/lib/miniflare.mjs b/demo/lib/miniflare.mjs
index a85f2f6..cbf5679 100644
--- a/demo/lib/miniflare.mjs
+++ b/demo/lib/miniflare.mjs
@@ -6,6 +6,7 @@ import { fileURLToPath } from 'node:url';
 import { build } from 'esbuild';
 import { Log, LogLevel, Miniflare } from 'miniflare';
 import { buildSdk } from '../../packages/sdk/scripts/build.mjs';
+import { TURNSTILE_TEST_SITEKEY } from './purchase.mjs';
 
 const ROOT = fileURLToPath(new URL('../../', import.meta.url));
 export const BUILD_DIR = join(ROOT, 'demo/.build');
@@ -32,6 +33,15 @@ export async function bundleWorker(dir) {
   return { cfg, outfile };
 }
 
+// --purchase: billing on in edge-router (__IKF.paddle/turnstile/api), Paddle.js from the demo server.
+export const purchaseBindings = (base) => ({
+  PADDLE_ENV: 'sandbox',
+  PADDLE_CLIENT_TOKEN: 'test_demo',
+  TURNSTILE_SITEKEY: TURNSTILE_TEST_SITEKEY,
+  API_ORIGIN: base,
+  PADDLE_JS_URL: `${base}/_demo/paddle.js`,
+});
+
 export async function startMiniflare({
   host = '0.0.0.0',
   port = 8787,
@@ -40,6 +50,7 @@ export async function startMiniflare({
   ipSalt = 'ikf-demo-salt',
   previewHost = 'preview.localhost',
   verbose = false,
+  purchaseBase = null,
 }) {
   // Writes workers/edge-router/src/sdk-bundle.generated.js, which the edge-router bundle imports.
   const sdk = await buildSdk();
@@ -61,7 +72,9 @@ export async function startMiniflare({
         modules: true,
         scriptPath: edge.outfile,
         compatibilityDate: edge.cfg.compatibility_date,
-        bindings: { ...edge.cfg.vars, SDK_ENABLED: 'true', PREVIEW_HOST: previewHost, IP_SALT: ipSalt },
+        bindings: {
+          ...edge.cfg.vars, SDK_ENABLED: 'true', PREVIEW_HOST: previewHost, IP_SALT: ipSalt, ...(purchaseBase && purchaseBindings(purchaseBase)),
+        },
         kvNamespaces: { ROUTES: 'ikf-demo-routes' },
         r2Buckets: { BUNDLES: 'ikf-demo-bundles' },
         queueProducers: { [producer.binding]: { queueName: producer.queue } },
diff --git a/demo/lib/stack.mjs b/demo/lib/stack.mjs
index df36718..110726b 100644
--- a/demo/lib/stack.mjs
+++ b/demo/lib/stack.mjs
@@ -1,5 +1,6 @@
 // The whole local demo in one call: containers, core-api, Miniflare (edge-router + event-consumer),
-// media server, published + routed funnels. Used by demo/run.mjs and demo/test/demo.test.mjs.
+// media server, published + routed funnels; with `purchase`, also the full purchase flow (fake Paddle,
+// billing + entitlement workers, demo proxy). Used by demo/run.mjs and demo/test/{demo,purchase}.test.mjs.
 import { readdir, readFile } from 'node:fs/promises';
 import { networkInterfaces } from 'node:os';
 import pg from 'pg';
@@ -11,9 +12,12 @@ import { checkPortsFree, composeUp, DemoError, ensureDocker } from './docker.mjs
 import { DEFAULT_FUNNELS, DEFAULT_FUNNELS_DIR, findFunnels, pickFunnels, publishFunnels } from './funnels.mjs';
 import { startMediaServer } from './media.mjs';
 import { startMiniflare } from './miniflare.mjs';
+import { startProxy } from './proxy.mjs';
+import { jsonLog, purchaseDeps, startPurchaseWorkers } from './purchase.mjs';
+import { coreRequest, seedPurchase } from './seed.mjs';
 
 export const DEMO_TOKEN = 'ikf_demo_admin';
-export const PORTS = { edge: 8787, core: 8080, media: 8790 };
+export const PORTS = { edge: 8787, core: 8080, media: 8790, proxy: 8788, demo: 8791 };
 export const PG = { host: '127.0.0.1', port: 54329, database: 'ikf', user: 'ikf', password: 'ikf' };
 export const CH = { url: 'http://127.0.0.1:18123', user: 'ikf', password: 'ikf', database: 'ikf' };
 const DDL_DIR = new URL('../../clickhouse/', import.meta.url);
@@ -83,11 +87,18 @@ export async function startStack({
   verbose = false,
   pgDatabase = PG.database,
   chDatabase = CH.database,
+  // {base: 'https://<host>'}: the https origin phones use (tunnel URL, or https://demo.test in the smoke test).
+  purchase = null,
+  // Writable for core-api's and the workers' logs (JSON lines); default: workers' warnings/errors to stderr.
+  logStream = null,
 } = {}) {
   ident(pgDatabase, 'Postgres database');
   ident(chDatabase, 'ClickHouse database');
   const chosen = pickFunnels(await findFunnels(funnelsDir), funnels);
-  await checkPortsFree({ [ports.edge]: 'edge-router (Miniflare)', [ports.core]: 'core-api', [ports.media]: 'media server' });
+  await checkPortsFree({
+    [ports.edge]: 'edge-router (Miniflare)', [ports.core]: 'core-api', [ports.media]: 'media server',
+    ...(purchase && { [ports.proxy]: 'demo proxy' }),
+  });
   await ensureDocker();
   await composeUp();
 
@@ -120,28 +131,51 @@ export async function startStack({
     const ip = lan ? lanIp() : null;
     const media = await startMediaServer({ dirs: new Map(chosen.map((f) => [f.slug, f.dir])), port: ports.media });
     stops.push(() => media.close());
-    // Phones load images from the LAN IP; the desktop browser can use it too.
-    const mediaBase = `http://${ip ?? '127.0.0.1'}:${ports.media}`;
+    // Phones load images from the LAN IP; the desktop browser can use it too. An https purchase page cannot
+    // load http images: there the proxy serves them under /_media.
+    const mediaBase = purchase ? `${purchase.base}/_media` : `http://${ip ?? '127.0.0.1'}:${ports.media}`;
 
-    const edge = await startMiniflare({ port: ports.edge, country, clickhouse: { ...CH, database: chDatabase }, verbose });
+    const log = jsonLog((line) => (logStream ?? process.stderr).write(`${line}\n`), { verbose: verbose || Boolean(logStream) });
+    const purchaseHost = purchase ? new URL(purchase.base).hostname : null;
+    const shop = purchase ? purchaseDeps({ host: purchaseHost, coreUrl: `http://127.0.0.1:${ports.core}`, log }) : null;
+
+    const edge = await startMiniflare({
+      port: ports.edge, country, clickhouse: { ...CH, database: chDatabase }, verbose, purchaseBase: purchase?.base ?? null,
+    });
     stops.push(() => edge.dispose());
     const store = miniflareStore(edge.bundles);
     const kv = miniflareKv(edge.routes);
 
     const app = buildApp({
-      logger: verbose,
+      logger: logStream ? { level: 'info', stream: logStream } : verbose,
       checks: { db: () => pool.query('select 1') },
-      deps: { pool, store, kv, mediaOrigins: [mediaBase], previewBaseUrl: `http://preview.localhost:${ports.edge}` },
+      deps: { pool, store, kv, mediaOrigins: [mediaBase], previewBaseUrl: `http://preview.localhost:${ports.edge}`, ...shop?.deps },
     });
     await app.listen({ host: '127.0.0.1', port: ports.core });
     stops.push(() => app.close());
     const coreUrl = `http://127.0.0.1:${app.server.address().port}`;
+    if (shop) stops.push(startPurchaseWorkers({ pool, deps: shop.deps, log }));
 
     const hosts = ['localhost', ...(ip ? [ip] : [])];
-    const published = await publishFunnels({ coreUrl, token: DEMO_TOKEN, pool, store, kv, funnels: chosen, hosts, mediaBase, pixel });
+    const published = await publishFunnels({
+      coreUrl, token: DEMO_TOKEN, pool, store, kv, funnels: chosen, hosts: [...hosts, ...(purchaseHost ? [purchaseHost] : [])], mediaBase, pixel,
+    });
+
+    let purchaseInfo = null;
+    if (shop) {
+      const funnel = chosen[0].slug;
+      await seedPurchase({ request: coreRequest(coreUrl, DEMO_TOKEN), pool, base: purchase.base, funnel });
+      const proxy = await startProxy({ port: ports.proxy, ports: { core: ports.core, demo: ports.demo, media: ports.media, edge: ports.edge } });
+      stops.push(() => proxy.close());
+      purchaseInfo = {
+        base: purchase.base, host: purchaseHost, funnel, url: `${purchase.base}/${funnel}`, panel: `${purchase.base}/_demo/`,
+        paddle: shop.paddle, mailbox: shop.mailbox,
+      };
+    }
 
     return {
       published: published.map((p) => ({ ...p, urls: hosts.map((h) => `http://${h}:${ports.edge}/${p.slug}`) })),
+      purchase: purchaseInfo,
       hosts,
       lanIp: ip,
       country,
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npx vitest run --config demo/vitest.config.mjs test/purchase-deps.test.mjs test/seed.test.mjs test/purchase.test.mjs 2>&1 | grep -E "Tests  "
npm run demo:test 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  9 passed (9)` (smoke ~6 s); toàn bộ demo `Test Files  14 passed (14)`, `Tests  72 passed (72)`. Chạy lại lần hai cũng pass (seed đi đường `409` → `UPDATE apps`).

- [ ] **Step 5: Commit**

```bash
git add demo
git commit -m "feat(demo): purchase mode: fake Paddle, Turnstile and SES in core-api, billing + entitlement workers, seed, proxy"
```

---

### Task 13: Demo server: Paddle.js giả (overlay), app giả, hộp thư, bảng điều khiển

**Files:**
- Create: `demo/server/index.mjs`, `demo/server/paddle-js.mjs`, `demo/server/app-page.mjs`, `demo/server/pages.mjs`
- Modify: `demo/lib/stack.mjs`
- Test: `demo/test/server.test.mjs`, `demo/test/paddle-js.test.mjs` (mới), `demo/test/purchase.test.mjs`

**Interfaces:**
- Consumes: `createFakePaddle` (`pay`, `refund`, `expire`, `renew`, `getTransaction`, `state`), `createMailbox` (`list`), `contractJson()` (Task 4), `stack.purchase` (Task 12).
- Produces:
  - `startDemoServer({port = 8791, host = '127.0.0.1', paddle, mailbox, funnel}) → {port, close()}`: `GET /_demo/` (bảng điều khiển), `GET /_demo/state` (`{funnel, app, mail, transactions, subscriptions}`), `GET /_demo/paddle.js`, `GET /_demo/paddle/txn/:id` (`{id, status, plan, amount, needs_email}`, D9), `POST /_demo/paddle/pay {transactionId, email?}`, `GET /_demo/app`, `GET /_demo/sdk-contract.json`, `GET /_demo/mail`, `POST /_demo/actions/{refund {transactionId, type}, expire {subscriptionId}, renew {subscriptionId}}`, `POST /_demo/null` (204). Không log, `no-store`.
  - `PADDLE_JS` (chuỗi; `window.Paddle` với `Environment.set`, `Initialize({eventCallback})`, `Checkout.open({transactionId})`, `Checkout.close()`; phát `checkout.loaded`, `checkout.completed`, `checkout.closed`, `checkout.error`).
  - `pickUserId(href) → string|null` (D10); `appPage()`; `panelPage(funnel)`, `mailPage(mails)`.

- [ ] **Step 1: Viết test fail**

`demo/test/server.test.mjs` (tạo mới):

```js
import { createServer } from 'node:http';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { contractJson } from '../../services/core-api/src/identity/sdk-contract.js';
import { createMailbox } from '../lib/mailbox.mjs';
import { DEMO_PRICES, createFakePaddle } from '../lib/paddle-fake.mjs';
import { pickUserId } from '../server/app-page.mjs';
import { startDemoServer } from '../server/index.mjs';

const UID = '3f1c2a9e-4b7d-4c1e-9a2b-0c4d5e6f7a8b';

describe('pickUserId (what IKameSDK reads from the Adjust deep link)', () => {
  const link = (deep, extra = '') => `https://demo.test/_demo/app?deep_link=${encodeURIComponent(deep)}${extra}`;
  it.each([
    [link(`starlyn://open?user_id=${UID}`), UID],
    [link(`starlyn://open?user_id={email}&user_id=${UID}`), UID],
    [link(`starlyn://open?user_id=${UID}&user_id={user_id}`), UID],
    [link('starlyn://open?user_id=a&user_id=b'), 'b'],
    [link('starlyn://open?user_id='), null],
    [link('starlyn://open'), null],
    [`https://demo.test/_demo/app?user_id=${UID}`, null],
    [link(`starlyn://open?user_id=${UID}`, '&email=b%40x.co&user_id='), UID],
    ['not a url', null],
  ])('%s → %s', (href, want) => expect(pickUserId(href)).toBe(want));
});

describe('demo server (/_demo/*)', () => {
  let hook;
  let paddle;
  let mailbox;
  let server;
  let base;
  const get = (path) => fetch(base + path);
  const post = (path, body, raw) => fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: raw ?? JSON.stringify(body) });
  const newTxn = (o = {}) => paddle.createTransaction({ items: [{ price_id: DEMO_PRICES['1w'].id }], custom_data: { plan: '1w' }, ...o });

  beforeAll(async () => {
    hook = createServer((req, res) => { req.resume(); req.on('end', () => res.writeHead(200).end('{}')); });
    await new Promise((r) => hook.listen(0, '127.0.0.1', r));
    paddle = createFakePaddle({ webhookUrl: `http://127.0.0.1:${hook.address().port}/`, webhookSecret: 's' });
    mailbox = createMailbox();
    server = await startDemoServer({ port: 0, paddle, mailbox, funnel: 'witch-power' });
    base = `http://127.0.0.1:${server.port}`;
  });
  afterAll(async () => {
    await server.close();
    await new Promise((r) => hook.close(r));
  });

  it('serves the fake Paddle.js, the app page, the panel and the SDK contract; never cached', async () => {
    const js = await get('/_demo/paddle.js');
    expect(js.headers.get('content-type')).toBe('text/javascript; charset=utf-8');
    expect(js.headers.get('cache-control')).toBe('no-store');
    expect(await js.text()).toContain('window.Paddle');
    const app = await (await get('/_demo/app?deep_link=x')).text();
    expect(app).toContain('function pickUserId');
    expect(app).toContain("fetch('/_demo/sdk-contract.json'");
    expect(await (await get('/_demo/')).text()).toContain('/witch-power');
    expect(await (await get('/_demo/sdk-contract.json')).json()).toEqual(contractJson());
  });

  it('overlay endpoints: transaction summary (asks for an email only when Paddle has none), then pay', async () => {
    const t = await newTxn();
    expect(await (await get(`/_demo/paddle/txn/${t.id}`)).json()).toEqual({ id: t.id, status: 'draft', plan: '1w', amount: DEMO_PRICES['1w'].amount, needs_email: true });
    expect((await post('/_demo/paddle/pay', { transactionId: t.id, email: 'nope' })).status).toBe(400);
    const paid = await post('/_demo/paddle/pay', { transactionId: t.id, email: 'buyer@demo.test' });
    expect(paid.status).toBe(200);
    expect(await paid.json()).toEqual({ status: 'completed' });
    expect((await post('/_demo/paddle/pay', { transactionId: t.id })).status).toBe(409);
    expect((await get('/_demo/paddle/txn/txn_nope')).status).toBe(404);
    const c = await paddle.createCustomer({ email: 'known@demo.test' });
    const ready = await newTxn({ customer_id: c.id });
    expect((await (await get(`/_demo/paddle/txn/${ready.id}`)).json()).needs_email).toBe(false);
    expect((await post('/_demo/paddle/pay', null, '{oops')).status).toBe(400);
  });

  it('control panel actions: refund (full/partial), expire, renew; state has no emails', async () => {
    const t = await newTxn();
    await paddle.pay(t.id, 'panel@demo.test');
    const sub = paddle.state().subscriptions.at(-1).id;
    expect((await post('/_demo/actions/refund', { transactionId: t.id, type: 'partial' })).status).toBe(200);
    expect((await post('/_demo/actions/refund', { transactionId: t.id, type: 'everything' })).status).toBe(400);
    expect((await post('/_demo/actions/expire', { subscriptionId: sub })).status).toBe(200);
    expect((await post('/_demo/actions/renew', { subscriptionId: sub })).status).toBe(200);
    expect((await post('/_demo/actions/renew', { subscriptionId: 'sub_nope' })).status).toBe(404);
    const state = await (await get('/_demo/state')).json();
    expect(state.transactions.find((x) => x.id === t.id).refunds).toEqual(['partial']);
    expect(state.subscriptions.find((s) => s.id === sub).status).toBe('active');
    expect(state).toMatchObject({ funnel: '/witch-power', app: '/_demo/app', mail: '/_demo/mail' });
    expect(JSON.stringify(state)).not.toContain('@demo.test');
  });

  it('mailbox page: newest first, HTML escaped, links clickable', async () => {
    await mailbox.send({ to: 'a@demo.test', subject: 'Your <Starlyn> access', text: 'Open https://demo.test/_demo/app?deep_link=x&y=1 now' });
    const html = await (await get('/_demo/mail')).text();
    expect(html).toContain('Your &lt;Starlyn&gt; access');
    expect(html).toContain('<a href="https://demo.test/_demo/app?deep_link=x&amp;y=1">');
    expect(html).not.toContain('<Starlyn>');
  });

  it('the webhook sink answers 204; anything else is 404', async () => {
    expect((await post('/_demo/null', {})).status).toBe(204);
    expect((await get('/_demo/nope')).status).toBe(404);
    expect((await get('/witch-power')).status).toBe(404);
  });
});
```

`demo/test/paddle-js.test.mjs` (tạo mới; chạy trong happy-dom):

```js
// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { PADDLE_JS } from '../server/paddle-js.mjs';

const flush = () => new Promise((r) => setTimeout(r, 0));

describe('fake Paddle.js (browser side of the demo overlay)', () => {
  let calls;
  let events;
  let replies;
  const root = () => document.getElementById('ikf-demo-paddle')?.shadowRoot;
  const button = (name) => root().querySelector(`[data-a="${name}"]`);

  beforeEach(() => {
    document.body.innerHTML = '';
    calls = [];
    events = [];
    replies = [];
    window.fetch = async (url, init) => {
      calls.push([url, init?.method ?? 'GET', init?.body ? JSON.parse(init.body) : undefined]);
      const [status, body] = replies.shift() ?? [200, {}];
      return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
    };
    new Function(PADDLE_JS)();
    window.Paddle.Environment.set('sandbox');
    window.Paddle.Initialize({ token: 'test_demo', eventCallback: (e) => events.push(e.name) });
  });

  it('opens an overlay for the transaction; Pay posts it, then checkout.completed; close() → checkout.closed', async () => {
    replies.push([200, { id: 'txn_1', status: 'ready', plan: '1w', amount: 1367, needs_email: false }], [200, { status: 'completed' }]);
    window.Paddle.Checkout.open({ transactionId: 'txn_1', settings: { displayMode: 'overlay' } });
    await flush();
    expect(root().textContent).toContain('$13.67');
    expect(root().querySelector('input')).toBeNull();
    button('pay').click();
    await flush();
    await flush();
    expect(calls).toEqual([['/_demo/paddle/txn/txn_1', 'GET', undefined], ['/_demo/paddle/pay', 'POST', { transactionId: 'txn_1' }]]);
    expect(events).toEqual(['checkout.loaded', 'checkout.completed']);
    window.Paddle.Checkout.close();
    expect(events).toEqual(['checkout.loaded', 'checkout.completed', 'checkout.closed']);
    expect(root()).toBeUndefined();
  });

  it('asks for the email when Paddle has none and sends it; a failed payment shows the error and keeps the overlay', async () => {
    replies.push([200, { id: 'txn_2', status: 'draft', plan: '1w', amount: 1367, needs_email: true }], [400, { error: 'a valid email is needed to pay' }], [200, { status: 'completed' }]);
    window.Paddle.Checkout.open({ transactionId: 'txn_2' });
    await flush();
    button('pay').click();
    await flush();
    await flush();
    expect(root().textContent).toContain('a valid email is needed to pay');
    expect(events).toEqual(['checkout.loaded']);
    root().querySelector('input').value = 'buyer@demo.test';
    button('pay').click();
    await flush();
    await flush();
    expect(calls.at(-1)).toEqual(['/_demo/paddle/pay', 'POST', { transactionId: 'txn_2', email: 'buyer@demo.test' }]);
    expect(events).toEqual(['checkout.loaded', 'checkout.completed']);
  });

  it('Cancel closes without paying: checkout.closed only', async () => {
    replies.push([200, { id: 'txn_3', status: 'ready', plan: 'addon', amount: 1999, needs_email: false }]);
    window.Paddle.Checkout.open({ transactionId: 'txn_3' });
    await flush();
    button('cancel').click();
    expect(events).toEqual(['checkout.loaded', 'checkout.closed']);
    expect(calls).toHaveLength(1);
    expect(root()).toBeUndefined();
  });
});
```

`demo/test/purchase.test.mjs` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/demo/test/purchase.test.mjs b/demo/test/purchase.test.mjs
index f591dc8..b62d821 100644
--- a/demo/test/purchase.test.mjs
+++ b/demo/test/purchase.test.mjs
@@ -105,4 +105,38 @@ describe.skipIf(skipReason)('npm run demo:purchase (no tunnel, host https://demo
     expect(logs).not.toContain(EMAIL);
     expect(logs).not.toContain(userId);
   });
+
+  it('through the demo pages: overlay pay, the same link in the inbox, the app page contract, Expire → not pro, Renew → pro', async () => {
+    const email = 'smoke-pages@demo.test';
+    const created = (await http('POST', '/v1/checkout', {
+      body: { funnel: FUNNEL, v, plan: '1w', sid: ulid(), email, attribution: {}, turnstile_token: 'XXXX.DUMMY.TOKEN.XXXX' },
+    })).json;
+    const txn = await http('GET', `/_demo/paddle/txn/${created.transaction_id}`);
+    expect(txn.json).toMatchObject({ status: 'ready', plan: '1w', needs_email: false });
+    expect((await http('POST', '/_demo/paddle/pay', { body: { transactionId: created.transaction_id } })).status).toBe(200);
+    const appLink = await until(async () => {
+      const r = await http('GET', `/v1/checkout/${created.checkout_id}/claim`);
+      return r.status === 200 && r.json.app_link;
+    }, 20_000);
+    const userId = new URL(new URL(appLink).searchParams.get('deep_link')).searchParams.get('user_id');
+
+    expect(await until(async () => (await http('GET', '/_demo/mail')).text.includes(`<a href="${appLink}">`), 10_000)).toBe(true);
+    expect((await http('GET', '/_demo/sdk-contract.json')).json).toMatchObject({ path: PATH, request_user_id_field: REQUEST_USER_ID_FIELD });
+    expect((await http('GET', '/_demo/app')).status).toBe(200);
+    expect(await until(async () => (await check(userId))[RESPONSE_IS_PRO_FIELD] === true, 10_000)).toBe(true);
+
+    const sub = (await http('GET', '/_demo/state')).json.transactions.find((t) => t.id === created.transaction_id).subscription_id;
+    expect((await http('POST', '/_demo/actions/expire', { body: { subscriptionId: sub } })).status).toBe(200);
+    expect(await until(async () => (await check(userId))[RESPONSE_IS_PRO_FIELD] === false, 10_000)).toBe(true);
+    expect((await http('POST', '/_demo/actions/renew', { body: { subscriptionId: sub } })).status).toBe(200);
+    expect(await until(async () => (await check(userId))[RESPONSE_IS_PRO_FIELD] === true, 10_000)).toBe(true);
+    expect(logs).not.toContain(email);
+    expect(logs).not.toContain(userId);
+  });
+
+  it('stop() frees every port', async () => {
+    await stack.stop();
+    stack = null;
+    for (const port of Object.values(PORTS)) await expect(fetch(`http://127.0.0.1:${port}/`)).rejects.toThrow();
+  });
 });
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npx vitest run --config demo/vitest.config.mjs test/server.test.mjs test/paddle-js.test.mjs test/purchase.test.mjs 2>&1 | grep -E "Cannot find|Failed to resolve|→|Tests  "
```

Expected: `Cannot find module '../server/app-page.mjs'`, `Failed to resolve import "../server/paddle-js.mjs"`; smoke FAIL 1 (`through the demo pages …`: `expected null to match object { status: 'ready', plan: '1w', …(1) }` — proxy trả 502 cho `/_demo/*`), `Tests  1 failed | 3 passed (4)` trong `purchase.test.mjs`.

- [ ] **Step 3: Implement**

`demo/server/paddle-js.mjs` (tạo mới):

```js
// The browser side of the fake Paddle: the same window.Paddle surface the SDK uses (Environment.set,
// Initialize({eventCallback}), Checkout.open({transactionId}), Checkout.close()). Checkout.open shows an
// overlay with the plan and price, an email field when Paddle has no customer yet, Pay and Cancel. Pay posts
// to /_demo/paddle/pay (same origin) and then fires checkout.completed, like Paddle after a payment.
// Written as a function so it is checked like any module; served as `(fakePaddle)();`.
function fakePaddle() {
  var callback = null;
  var host = null;
  var current = null;
  var CSS = ':host{all:initial}.bg{position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:2147483647;font:15px/1.4 system-ui,sans-serif}'
    + '.c{background:#fff;color:#111;border-radius:14px;padding:20px;width:min(92vw,360px);box-shadow:0 10px 40px rgba(0,0,0,.3)}h2{margin:0 0 4px;font-size:18px}'
    + '.t{color:#666;font-size:12px;margin-bottom:14px}.p{font-size:28px;font-weight:700;margin:6px 0 14px}'
    + 'input{box-sizing:border-box;width:100%;padding:10px;border:1px solid #ccc;border-radius:8px;font:inherit;margin-bottom:12px}'
    + 'button{font:inherit;border:0;border-radius:8px;padding:11px 16px;margin-right:8px;cursor:pointer}[data-a=pay]{background:#1a7f37;color:#fff;font-weight:600}[data-a=cancel]{background:#eee}'
    + '.e{color:#b42318;margin-top:10px;min-height:1em}';
  var HEAD = '<h2>Paddle (demo)</h2><div class="t">Fake checkout: no card, no real payment.</div>';

  function emit(name, data) {
    try {
      if (callback) callback({ name: name, data: data || {} });
    } catch (e) {
      // the page's handler failed; the overlay keeps working
    }
  }

  function close() {
    if (!host) return;
    host.remove();
    host = null;
    var txn = current;
    current = null;
    emit('checkout.closed', { transaction_id: txn });
  }

  function pay(txn, box) {
    var btn = box.querySelector('[data-a=pay]');
    var input = box.querySelector('input');
    var err = box.querySelector('.e');
    var body = { transactionId: txn };
    if (input) body.email = input.value;
    btn.disabled = true;
    err.textContent = '';
    window.fetch('/_demo/paddle/pay', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) {
        return r.json().then(function (b) {
          return { ok: r.ok, b: b };
        });
      })
      .then(function (x) {
        if (x.ok) {
          emit('checkout.completed', { transaction_id: txn });
          return;
        }
        btn.disabled = false;
        err.textContent = x.b.error || 'Payment failed';
      })
      .catch(function () {
        btn.disabled = false;
        err.textContent = 'Payment failed';
      });
  }

  function open(opts) {
    var txn = opts && opts.transactionId;
    if (!txn) return;
    if (host) close();
    current = txn;
    host = document.createElement('div');
    host.id = 'ikf-demo-paddle';
    var root = host.attachShadow({ mode: 'open' });
    root.innerHTML = '<style>' + CSS + '</style><div class="bg"><div class="c" role="dialog">' + HEAD + '<div class="s">Loading...</div></div></div>';
    document.body.appendChild(host);
    var box = root.querySelector('.c');
    window.fetch('/_demo/paddle/txn/' + encodeURIComponent(txn))
      .then(function (r) {
        if (!r.ok) throw new Error('txn');
        return r.json();
      })
      .then(function (info) {
        if (current !== txn) return;
        box.innerHTML = HEAD + '<div>Plan <b></b></div><div class="p"></div>'
          + (info.needs_email ? '<input type="email" placeholder="Email" autocomplete="email">' : '')
          + '<button data-a="pay">Pay</button><button data-a="cancel">Cancel</button><div class="e"></div>';
        box.querySelector('b').textContent = info.plan || '';
        box.querySelector('.p').textContent = '$' + ((info.amount || 0) / 100).toFixed(2);
        box.querySelector('[data-a=cancel]').addEventListener('click', close);
        box.querySelector('[data-a=pay]').addEventListener('click', function () {
          pay(txn, box);
        });
        emit('checkout.loaded', { transaction_id: txn });
      })
      .catch(function () {
        box.querySelector('.s').textContent = 'Could not load the transaction.';
        emit('checkout.error', { transaction_id: txn });
      });
  }

  window.Paddle = {
    Environment: { set: function () {} },
    Initialize: function (o) {
      callback = (o && o.eventCallback) || null;
    },
    Checkout: { open: open, close: close },
  };
}

export const PADDLE_JS = `(${fakePaddle.toString()})();\n`;
```

`demo/server/app-page.mjs` (tạo mới):

```js
// The fake "app": a web page that does what IKameSDK does on a phone. It takes the user_id from the Adjust
// deep link (last non-placeholder value), keeps it in localStorage, and asks check-purchased with the field
// names of services/core-api/src/identity/sdk-contract.js (served as /_demo/sdk-contract.json). PRO / FREE
// comes from that endpoint only. On an error it keeps the last state, like the SDK.

// href of /_demo/app?deep_link=<scheme>://<path>?user_id=… → the user_id, or null. Skips empty values and
// unfilled placeholders such as {email}; only the deep link counts (Adjust hands the app only that).
export function pickUserId(href) {
  var url;
  var deep;
  try {
    url = new URL(href);
    deep = new URL(url.searchParams.get('deep_link') || '');
  } catch (e) {
    return null;
  }
  var ids = deep.searchParams.getAll('user_id').filter(function (v) {
    return v && !/^\{.*\}$/.test(v);
  });
  return ids.length ? ids[ids.length - 1] : null;
}

const CSS = 'body{margin:0;font:16px/1.45 system-ui,sans-serif;background:#0f1020;color:#fff;display:flex;min-height:100vh;align-items:center;justify-content:center}'
  + '.c{width:min(92vw,380px);text-align:center;padding:24px}h1{font-size:20px;margin:0 0 18px;color:#c9c6ff}'
  + '.b{font-size:44px;font-weight:800;letter-spacing:2px;border-radius:16px;padding:18px;margin:10px 0}.pro{background:#1a7f37}.free{background:#3a3b4f}'
  + '.m{color:#b9b8cc;font-size:14px;min-height:1.4em}button,a.btn{display:block;width:100%;box-sizing:border-box;font:inherit;border:0;border-radius:10px;padding:12px;margin-top:10px;background:#fff;color:#111;text-decoration:none;cursor:pointer}'
  + 'a.l{color:#c9c6ff;display:inline-block;margin:14px 8px 0;font-size:14px}code{font-size:11px;color:#8d8ca3;word-break:break-all}';

export function appPage() {
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>Starlyn (app giả)</title><style>${CSS}</style></head><body><div class="c">
<h1>Starlyn: app giả (mô phỏng IKameSDK)</h1>
<div id="badge" class="b free">...</div><div id="msg" class="m"></div><div><code id="uid"></code></div>
<button id="check">Kiểm tra lại</button><button id="reinstall">Cài lại app (xóa dữ liệu)</button>
<a class="l" href="/_demo/mail">Hộp thư</a><a class="l" href="/_demo/">Bảng điều khiển</a>
</div><script>
${pickUserId.toString()}
(function () {
  var KEY = 'ikf_demo_user_id';
  var STATE = 'ikf_demo_state';
  var C = null;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) { /* private mode */ } },
  };
  function show(pro, msg) {
    var b = document.getElementById('badge');
    b.textContent = pro ? 'PRO' : 'FREE';
    b.className = 'b ' + (pro ? 'pro' : 'free');
    document.getElementById('msg').textContent = msg;
    var id = store.get(KEY);
    document.getElementById('uid').textContent = id ? 'user_id ' + id : '';
  }
  function check() {
    var id = store.get(KEY);
    if (!id) return show(false, 'Chưa có user_id: mở nút "Open the app" trên funnel hoặc link trong hộp thư.');
    document.getElementById('msg').textContent = 'Đang kiểm tra...';
    var body = {};
    body[C.request_user_id_field] = id;
    body[C.request_app_field] = 'starlyn';
    fetch(C.path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); })
      .then(function (b) {
        var pro = b[C.response_is_pro_field] === true;
        var exp = b[C.response_expires_field];
        store.set(STATE, pro ? 'pro' : 'free');
        show(pro, pro ? (exp === C.forever_expires_value ? 'Vĩnh viễn' : 'Hết hạn ' + new Date(exp).toLocaleString()) : 'Không có quyền đang hoạt động.');
      })
      .catch(function () {
        show(store.get(STATE) === 'pro', 'Lỗi mạng: giữ trạng thái đã lưu (như SDK).');
      });
  }
  document.getElementById('check').addEventListener('click', check);
  document.getElementById('reinstall').addEventListener('click', function () {
    store.del(KEY);
    store.del(STATE);
    show(false, 'Đã cài lại: mở link trong hộp thư để khôi phục.');
  });
  fetch('/_demo/sdk-contract.json').then(function (r) { return r.json(); }).then(function (c) {
    C = c;
    var id = pickUserId(location.href);
    if (id) {
      store.set(KEY, id);
      history.replaceState(null, '', location.pathname);
    }
    check();
  });
})();
</script></body></html>`;
}
```

`demo/server/pages.mjs` (tạo mới):

```js
// The demo's control panel (/_demo/) and inbox (/_demo/mail). Plain HTML; the panel polls /_demo/state.
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const HEAD = (title) => `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title>
<style>body{margin:0;padding:16px;font:15px/1.45 system-ui,sans-serif;background:#f6f6f8;color:#111}h1{font-size:20px}h2{font-size:16px;margin-top:22px}
table{border-collapse:collapse;width:100%;background:#fff}td,th{border-bottom:1px solid #e5e5ea;padding:8px;text-align:left;font-size:13px;vertical-align:top}
button{font:inherit;font-size:13px;border:0;border-radius:6px;padding:6px 10px;margin:2px;background:#111;color:#fff;cursor:pointer}a{color:#3b3bd6}
.mail{background:#fff;border-radius:10px;padding:12px;margin:10px 0}pre{white-space:pre-wrap;font-size:12px;color:#444}.m{color:#666;font-size:12px}</style></head><body>`;

export function panelPage(funnel) {
  return `${HEAD('iFunnel demo: bảng điều khiển')}
<h1>iFunnel demo: luồng mua</h1>
<p><a href="/${esc(funnel)}">Funnel /${esc(funnel)}</a> · <a href="/_demo/app">App giả</a> · <a href="/_demo/mail">Hộp thư</a></p>
<p class="m">Refund / Expire / Renew gửi webhook có chữ ký từ Paddle giả tới core-api; trang app giả đọc PRO / FREE từ check-purchased thật (bấm "Kiểm tra lại").</p>
<h2>Giao dịch</h2><table><thead><tr><th>Transaction</th><th>Plan</th><th>Status</th><th>Refund</th><th></th></tr></thead><tbody id="tx"></tbody></table>
<h2>Subscription</h2><table><thead><tr><th>Subscription</th><th>Plan</th><th>Status</th><th>Hết kỳ</th><th></th></tr></thead><tbody id="sub"></tbody></table>
<p id="err" class="m"></p>
<script>
(function () {
  function td(text) { var c = document.createElement('td'); c.textContent = text; return c; }
  function btn(label, path, body) {
    var b = document.createElement('button');
    b.textContent = label;
    b.addEventListener('click', function () {
      b.disabled = true;
      fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
        .then(function (r) { return r.json().then(function (j) { document.getElementById('err').textContent = r.ok ? '' : (j.error || 'HTTP ' + r.status); }); })
        .finally(load);
    });
    return b;
  }
  function load() {
    fetch('/_demo/state').then(function (r) { return r.json(); }).then(function (s) {
      var tx = document.getElementById('tx');
      tx.textContent = '';
      s.transactions.slice().reverse().forEach(function (t) {
        var tr = document.createElement('tr');
        [t.id, t.plan + ' $' + (t.amount / 100).toFixed(2), t.status + (t.origin === 'subscription_recurring' ? ' (gia hạn)' : ''), t.refunds.join(', ') || '-'].forEach(function (x) { tr.appendChild(td(x)); });
        var act = document.createElement('td');
        if (t.status === 'completed') {
          act.appendChild(btn('Refund', '/_demo/actions/refund', { transactionId: t.id, type: 'full' }));
          act.appendChild(btn('Refund 1 phần', '/_demo/actions/refund', { transactionId: t.id, type: 'partial' }));
        }
        tr.appendChild(act);
        tx.appendChild(tr);
      });
      var sub = document.getElementById('sub');
      sub.textContent = '';
      s.subscriptions.slice().reverse().forEach(function (x) {
        var tr = document.createElement('tr');
        [x.id, x.plan, x.status, new Date(x.ends_at).toLocaleString()].forEach(function (v) { tr.appendChild(td(v)); });
        var act = document.createElement('td');
        act.appendChild(btn('Expire', '/_demo/actions/expire', { subscriptionId: x.id }));
        act.appendChild(btn('Renew', '/_demo/actions/renew', { subscriptionId: x.id }));
        tr.appendChild(act);
        sub.appendChild(tr);
      });
    });
  }
  load();
  setInterval(load, 3000);
})();
</script></body></html>`;
}

const linkify = (text) => esc(text).replace(/https:\/\/[^\s<]+/g, (u) => `<a href="${u}">${u}</a>`);

export function mailPage(mails) {
  const items = mails.length
    ? mails.map((m) => `<div class="mail"><b>${esc(m.subject)}</b><div class="m">${esc(m.to)} · ${esc(m.at)}</div><pre>${linkify(m.text)}</pre></div>`).join('')
    : '<p class="m">Chưa có email nào. Email sau thanh toán tới trong vài giây.</p>';
  return `${HEAD('iFunnel demo: hộp thư')}<h1>Hộp thư (50 email gần nhất, chỉ trong bộ nhớ)</h1><p><a href="/_demo/">Bảng điều khiển</a> · <a href="/_demo/app">App giả</a></p>${items}</body></html>`;
}
```

`demo/server/index.mjs` (tạo mới):

```js
// Demo server (behind the proxy at /_demo/*): fake Paddle.js and its endpoints, the fake app page, the
// inbox, the control panel and its actions. Node http, HTML + JSON, nothing cached, nothing logged.
import { createServer } from 'node:http';
import { contractJson } from '../../services/core-api/src/identity/sdk-contract.js';
import { appPage } from './app-page.mjs';
import { mailPage, panelPage } from './pages.mjs';
import { PADDLE_JS } from './paddle-js.mjs';

const BODY_LIMIT = 16 * 1024;
const REFUND_TYPES = ['full', 'partial'];

const reply = (res, status, body, type = 'application/json; charset=utf-8') => {
  res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store', 'x-robots-tag': 'noindex' });
  res.end(type.startsWith('application/json') ? JSON.stringify(body) : body);
};

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > BODY_LIMIT) req.destroy();
      else chunks.push(c);
    });
    req.on('end', () => {
      try {
        const v = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
        resolve(v && typeof v === 'object' ? v : {});
      } catch {
        reject(Object.assign(new Error('bad json'), { status: 400 }));
      }
    });
    req.on('error', reject);
  });
}

// paddle: createFakePaddle(); mailbox: createMailbox(); funnel: the slug the panel links to.
export async function startDemoServer({ port = 8791, host = '127.0.0.1', paddle, mailbox, funnel }) {
  const routes = {
    'GET /_demo/': () => [200, panelPage(funnel), 'text/html; charset=utf-8'],
    'GET /_demo/state': () => [200, { funnel: `/${funnel}`, app: '/_demo/app', mail: '/_demo/mail', ...paddle.state() }],
    'GET /_demo/paddle.js': () => [200, PADDLE_JS, 'text/javascript; charset=utf-8'],
    'GET /_demo/app': () => [200, appPage(), 'text/html; charset=utf-8'],
    'GET /_demo/sdk-contract.json': () => [200, contractJson()],
    'GET /_demo/mail': () => [200, mailPage(mailbox.list()), 'text/html; charset=utf-8'],
    'POST /_demo/null': () => [204, ''],
    'POST /_demo/paddle/pay': async (b) => {
      await paddle.pay(String(b.transactionId ?? ''), b.email);
      return [200, { status: 'completed' }];
    },
    'POST /_demo/actions/refund': async (b) => {
      const type = b.type ?? 'full';
      if (!REFUND_TYPES.includes(type)) return [400, { error: 'type must be full or partial' }];
      return [200, await paddle.refund(String(b.transactionId ?? ''), { type })];
    },
    'POST /_demo/actions/expire': async (b) => [200, await paddle.expire(String(b.subscriptionId ?? ''))],
    'POST /_demo/actions/renew': async (b) => [200, await paddle.renew(String(b.subscriptionId ?? ''))],
  };

  const server = createServer(async (req, res) => {
    const path = new URL(req.url, 'http://x').pathname;
    try {
      const txn = /^\/_demo\/paddle\/txn\/([A-Za-z0-9_]{1,64})$/.exec(path);
      if (req.method === 'GET' && txn) {
        const t = await paddle.getTransaction(txn[1]);
        return reply(res, 200, {
          id: t.id, status: t.status, plan: t.custom_data?.plan ?? null, amount: Number(t.details.totals.grand_total), needs_email: !t.customer_id,
        });
      }
      const route = routes[`${req.method} ${path}`];
      if (!route) return reply(res, 404, { error: 'not_found' });
      const body = req.method === 'POST' ? await readJson(req) : null;
      const [status, out, type] = await route(body);
      if (status === 204) return res.writeHead(204, { 'cache-control': 'no-store' }).end();
      return reply(res, status, out, type);
    } catch (err) {
      const status = err.status ?? (err.kind === 'not_found' ? 404 : 500);
      return reply(res, status, { error: status === 500 ? 'internal' : err.message });
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

`demo/lib/stack.mjs` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/demo/lib/stack.mjs b/demo/lib/stack.mjs
index 110726b..7a4390b 100644
--- a/demo/lib/stack.mjs
+++ b/demo/lib/stack.mjs
@@ -11,6 +11,7 @@ import { miniflareKv, miniflareStore } from './adapters.mjs';
 import { checkPortsFree, composeUp, DemoError, ensureDocker } from './docker.mjs';
 import { DEFAULT_FUNNELS, DEFAULT_FUNNELS_DIR, findFunnels, pickFunnels, publishFunnels } from './funnels.mjs';
 import { startMediaServer } from './media.mjs';
+import { startDemoServer } from '../server/index.mjs';
 import { startMiniflare } from './miniflare.mjs';
 import { startProxy } from './proxy.mjs';
 import { jsonLog, purchaseDeps, startPurchaseWorkers } from './purchase.mjs';
@@ -97,7 +98,7 @@ export async function startStack({
   const chosen = pickFunnels(await findFunnels(funnelsDir), funnels);
   await checkPortsFree({
     [ports.edge]: 'edge-router (Miniflare)', [ports.core]: 'core-api', [ports.media]: 'media server',
-    ...(purchase && { [ports.proxy]: 'demo proxy' }),
+    ...(purchase && { [ports.proxy]: 'demo proxy', [ports.demo]: 'demo server' }),
   });
   await ensureDocker();
   await composeUp();
@@ -165,6 +166,8 @@ export async function startStack({
     if (shop) {
       const funnel = chosen[0].slug;
       await seedPurchase({ request: coreRequest(coreUrl, DEMO_TOKEN), pool, base: purchase.base, funnel });
+      const demo = await startDemoServer({ port: ports.demo, paddle: shop.paddle, mailbox: shop.mailbox, funnel });
+      stops.push(() => demo.close());
       const proxy = await startProxy({ port: ports.proxy, ports: { core: ports.core, demo: ports.demo, media: ports.media, edge: ports.edge } });
       stops.push(() => proxy.close());
       purchaseInfo = {
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npx vitest run --config demo/vitest.config.mjs test/server.test.mjs test/paddle-js.test.mjs test/purchase.test.mjs 2>&1 | grep -E "Tests  "
npm run demo:test 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  21 passed (21)` (server 14, paddle-js 3, smoke 4; smoke ~14 s); toàn bộ demo `Test Files  16 passed (16)`, `Tests  91 passed (91)`.

- [ ] **Step 5: Commit**

```bash
git add demo
git commit -m "feat(demo): demo server: fake Paddle.js overlay, fake app (IKameSDK check), inbox, control panel"
```

---

### Task 14: `npm run demo:purchase` (cờ, QR, tunnel) + README

**Files:**
- Create: `demo/lib/options.mjs`
- Modify: `demo/run.mjs`, `demo/README.md`, `package.json`, `package-lock.json`
- Test: `demo/test/options.test.mjs` (mới)

**Interfaces:**
- Consumes: `startTunnel` (Task 11), `startStack({purchase, …})`, `PORTS` (Task 12), `stack.purchase` (Task 12–13).
- Produces: `PURCHASE_FUNNEL = 'witch-power'`, `USAGE`, `parseOptions(argv)` (D8), `qrText(url) → Promise<string>`; script `demo:purchase` = `node demo/run.mjs --purchase --tunnel`; devDependency `qrcode-terminal@^0.12.0` (D7).

- [ ] **Step 1: Viết test fail**

`demo/test/options.test.mjs` (tạo mới):

```js
import { describe, it, expect } from 'vitest';
import { DemoError } from '../lib/docker.mjs';
import { parseOptions, qrText } from '../lib/options.mjs';

describe('demo options', () => {
  it('defaults (plain demo) are unchanged', () => {
    expect(parseOptions([])).toMatchObject({ country: 'VN', purchase: false, tunnel: false, funnel: 'witch-power', 'no-lan': false });
    expect(parseOptions(['--country', 'de']).country).toBe('DE');
  });

  it('--purchase --tunnel (npm run demo:purchase); --funnel picks another funnel', () => {
    const o = parseOptions(['--purchase', '--tunnel']);
    expect(o).toMatchObject({ purchase: true, tunnel: true, funnel: 'witch-power' });
    expect(o.host).toBeUndefined();
    expect(parseOptions(['--purchase', '--tunnel', '--funnel', 'moon-reading']).funnel).toBe('moon-reading');
  });

  it('--purchase with --host https://<host> (your own https, e.g. mkcert): the base URL, never http', () => {
    expect(parseOptions(['--purchase', '--host', 'https://demo.example']).host).toBe('https://demo.example');
    for (const [argv, msg] of [
      [['--purchase'], '--purchase cần --tunnel (Cloudflare quick tunnel) hoặc --host https://<host>'],
      [['--purchase', '--host', 'http://demo.example'], '--host phải là https://<host> (không path), nhận được http://demo.example'],
      [['--purchase', '--host', 'https://demo.example/x'], '--host phải là https://<host> (không path), nhận được https://demo.example/x'],
      [['--purchase', '--tunnel', '--host', 'https://demo.example'], 'chọn một: --tunnel hoặc --host'],
      [['--tunnel'], '--tunnel và --host chỉ dùng với --purchase'],
      [['--purchase', '--tunnel', '--funnels', 'a,b'], '--purchase chạy một funnel: dùng --funnel <slug>'],
      [['--country', 'Germany'], '--country must be a 2-letter code, got GERMANY'],
    ]) {
      expect(() => parseOptions(argv), argv.join(' ')).toThrow(DemoError);
      expect(() => parseOptions(argv)).toThrow(msg);
    }
  });

  it('qrText draws the URL as a terminal QR code', async () => {
    const qr = await qrText('https://individual-outside-deer-seven.trycloudflare.com/witch-power');
    const lines = qr.trim().split('\n');
    expect(lines.length).toBeGreaterThan(10);
    expect(qr).toMatch(/[▀▄█]/);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npx vitest run --config demo/vitest.config.mjs test/options.test.mjs 2>&1 | grep -E "Cannot find|Tests  "
```

Expected: FAIL — `Cannot find module '../lib/options.mjs'` (`Tests  no tests`).

- [ ] **Step 3: Implement**

`package.json` (sửa, áp dụng đúng diff này), rồi cập nhật lock:

```bash
git apply <<'PATCH'
diff --git a/package.json b/package.json
index 97bea10..923b883 100644
--- a/package.json
+++ b/package.json
@@ -13,6 +13,7 @@
     "test": "npm test --workspaces --if-present",
     "demo:test": "vitest run --config demo/vitest.config.mjs",
     "demo": "node demo/run.mjs",
+    "demo:purchase": "node demo/run.mjs --purchase --tunnel",
     "demo:events": "node demo/events.mjs",
     "demo:down": "node demo/run.mjs --down"
   },
@@ -20,6 +21,7 @@
     "esbuild": "^0.25.12",
     "miniflare": "4.20260310.0",
     "pg": "^8.23.1",
+    "qrcode-terminal": "^0.12.0",
     "vitest": "~3.2.0"
   }
 }
PATCH
```

```bash
npm install
git diff --stat package-lock.json   # chỉ thêm node_modules/qrcode-terminal (10 dòng)
```

`demo/lib/options.mjs` (tạo mới):

```js
// Command-line options of demo/run.mjs, checked before anything starts.
import { parseArgs } from 'node:util';
import qrcode from 'qrcode-terminal';
import { DemoError } from './docker.mjs';

export const PURCHASE_FUNNEL = 'witch-power';

export const USAGE = `Usage: npm run demo -- [options]
  --funnels a,b,c     funnel slugs (CONFIG.funnel); default ewa-books,calmio-calm-kids,moon-reading
  --funnels-dir <d>   funnel-development folder; default $IKF_FUNNELS_DIR or ~/ikame/funnel/funnel-development (ikame repo, funnel branch)
  --country <CC>      request.cf.country for every request; default VN (DE shows the consent banner)
  --pixel <id>        set this Meta Pixel id on every demo funnel (the browser loads Meta's real fbevents.js and
                      sends real events to Meta when online: use a test Pixel)
  --no-lan            only localhost (no LAN IP route, images from 127.0.0.1)
  --reset             wipe Postgres + ClickHouse volumes first
  --verbose           Miniflare + core-api logs
Full purchase flow (fake Paddle, fake app, inbox; npm run demo:purchase = --purchase --tunnel):
  --purchase          buy on a real funnel over https, get-app → fake app (PRO), refund → FREE
  --tunnel            https through a Cloudflare quick tunnel (brew install cloudflared; no account)
  --host https://<h>  or your own https origin that reaches the demo proxy on port 8788
  --funnel <slug>     the funnel to sell; default ${PURCHASE_FUNNEL}
npm run demo:down [-- --reset]   stop the containers (--reset also deletes their volumes)`;

export function parseOptions(argv) {
  const { values } = parseArgs({
    args: argv,
    options: {
      funnels: { type: 'string' },
      'funnels-dir': { type: 'string' },
      country: { type: 'string', default: 'VN' },
      pixel: { type: 'string' },
      'no-lan': { type: 'boolean', default: false },
      reset: { type: 'boolean', default: false },
      down: { type: 'boolean', default: false },
      verbose: { type: 'boolean', default: false },
      help: { type: 'boolean', default: false },
      purchase: { type: 'boolean', default: false },
      tunnel: { type: 'boolean', default: false },
      host: { type: 'string' },
      funnel: { type: 'string', default: PURCHASE_FUNNEL },
    },
  });
  values.country = values.country.toUpperCase();
  if (!/^[A-Z]{2}$/.test(values.country)) throw new DemoError(`--country must be a 2-letter code, got ${values.country}`);
  if (!values.purchase) {
    if (values.tunnel || values.host !== undefined) throw new DemoError('--tunnel và --host chỉ dùng với --purchase');
    return values;
  }
  if (values.tunnel && values.host !== undefined) throw new DemoError('chọn một: --tunnel hoặc --host');
  if (!values.tunnel && values.host === undefined) throw new DemoError('--purchase cần --tunnel (Cloudflare quick tunnel) hoặc --host https://<host>');
  if (values.host !== undefined) {
    let u = null;
    try {
      u = new URL(values.host);
    } catch {
      // reported below
    }
    if (!u || u.protocol !== 'https:' || u.origin !== values.host.replace(/\/$/, '')) {
      throw new DemoError(`--host phải là https://<host> (không path), nhận được ${values.host}`);
    }
    values.host = u.origin;
  }
  if (values.funnels !== undefined) throw new DemoError('--purchase chạy một funnel: dùng --funnel <slug>');
  return values;
}

// The URL as a QR code for the terminal (scan with the phone camera).
export const qrText = (url) => new Promise((resolve) => qrcode.generate(url, { small: true }, resolve));
```

`demo/run.mjs`, `demo/README.md` (sửa, áp dụng đúng diff này):

````bash
git apply <<'PATCH'
diff --git a/demo/README.md b/demo/README.md
index fdedb12..6a1004b 100644
--- a/demo/README.md
+++ b/demo/README.md
@@ -64,6 +64,43 @@ With `--pixel`, the browser loads the real `fbevents.js` and sends to Meta when
 The API rejects `localhost` as a host (no dot), so the demo registers hosts and routes through core's
 publisher functions; `ikf route ls` works for the LAN IP.
 
+## Full purchase flow (`npm run demo:purchase`)
+
+Buy on a real funnel from your phone, open the "app", see **PRO**; refund from the control panel, see **FREE**.
+Billing, entitlement-sync and the SDK run the production code; Paddle, the app and the inbox are fakes. No
+account anywhere (Paddle, Cloudflare, Adjust, AWS).
+
+```bash
+brew install cloudflared       # once
+npm run demo:purchase          # prints an https://<words>.trycloudflare.com URL and a QR code (~1 minute)
+```
+
+1. Scan the QR with the phone: `witch-power` opens over https (a new tunnel can take up to a minute to answer).
+2. Go through the funnel and buy: Turnstile runs with Cloudflare's test sitekey (always passes; the phone needs
+   internet), then the **fake Paddle overlay** asks for an email if the funnel had none: **Pay** or **Cancel**.
+3. After Pay the funnel's "Open the app" button points to `/_demo/app?deep_link=starlyn://open?user_id=<uuid>`
+   (Adjust stand-in). The **fake app** takes the `user_id` the way IKameSDK does, calls
+   `POST /v1/payment/check-purchased-web-funnel` and shows **PRO** with the expiry. "Cài lại app" forgets the
+   `user_id` (FREE); the link in the inbox (`/_demo/mail`) restores it.
+4. Control panel `/_demo/`: **Refund** (full; "Refund 1 phần" = partial, stays PRO), **Expire** (renewal failed and
+   the 3-day grace is over), **Renew**. Each sends a signed Paddle webhook to core-api; press "Kiểm tra lại" in the
+   app: FREE / PRO within a few seconds.
+
+| Option | |
+|---|---|
+| `--funnel <slug>` | sell another funnel (its plans must be `1w` and `addon`) |
+| `--host https://<host>` | instead of `--tunnel`: your own https origin that reaches port 8788 (e.g. mkcert + a reverse proxy); `npm run demo -- --purchase --host https://…` |
+| `--reset`, `--verbose` | as above |
+
+| Port | What |
+|---|---|
+| 8788 (all interfaces) | demo proxy, the tunnel's origin: `/v1/*` → core-api, `/_demo/*` → demo server, `/_media/*` → media, the rest → edge-router |
+| 8791 (127.0.0.1) | demo server: fake Paddle.js and its endpoints, fake app, inbox, control panel |
+
+Paddle state lives in memory: after a restart the panel is empty while Postgres still has the old checkouts and
+entitlements (the seed is idempotent). `npm run demo:down -- --reset` starts clean. `npm run demo:test` includes a
+smoke test of this flow without a tunnel (host `https://demo.test`, own databases `ikf_purchase_test`).
+
 ## Troubleshooting
 
 | Message | Fix |
@@ -75,3 +112,9 @@ publisher functions; `ikf route ls` works for the LAN IP.
 | `Funnels folder not found` | clone the ikame repo on the `funnel` branch to `~/ikame`, or `IKF_FUNNELS_DIR=/path/to/funnel-development npm run demo` |
 | Phone cannot open the LAN link | same wifi, no client isolation; allow `node`/`workerd` in macOS firewall |
 | `ClickHouse is not reachable` (demo:events) | start the demo first |
+| `cloudflared not found` | `brew install cloudflared` |
+| `cloudflared gave no https://*.trycloudflare.com URL within 30 s` | no internet, or Cloudflare refused a quick tunnel (rate limit): wait a minute and retry; the message shows cloudflared's own output |
+| Phone shows a Cloudflare error page right after start | the new tunnel is not reachable yet; reload after ~30 s |
+| `Port 8788 (demo proxy) is already in use` | an earlier `demo:purchase`; `lsof -nP -iTCP:8788 -sTCP:LISTEN` |
+| Overlay "Pay" shows `internal` | core-api did not take the fake Paddle webhook; rerun with `--verbose` to see why |
+| App stays FREE after Pay | press "Kiểm tra lại": entitlement-sync runs every 2 s |
diff --git a/demo/run.mjs b/demo/run.mjs
index 3df68fd..023f0e0 100644
--- a/demo/run.mjs
+++ b/demo/run.mjs
@@ -1,45 +1,16 @@
 #!/usr/bin/env node
 // npm run demo [-- --funnels a,b,c --country DE --pixel <id> --no-lan --reset --verbose]
+// npm run demo:purchase [-- --funnel <slug> --reset --verbose]   (= --purchase --tunnel)
 // npm run demo:down [-- --reset]
-import { parseArgs } from 'node:util';
 import { composeDown, DemoError, ensureDocker } from './lib/docker.mjs';
-import { startStack } from './lib/stack.mjs';
-
-const USAGE = `Usage: npm run demo -- [options]
-  --funnels a,b,c     funnel slugs (CONFIG.funnel); default ewa-books,calmio-calm-kids,moon-reading
-  --funnels-dir <d>   funnel-development folder; default $IKF_FUNNELS_DIR or ~/ikame/funnel/funnel-development (ikame repo, funnel branch)
-  --country <CC>      request.cf.country for every request; default VN (DE shows the consent banner)
-  --pixel <id>        set this Meta Pixel id on every demo funnel (the browser loads Meta's real fbevents.js and
-                      sends real events to Meta when online: use a test Pixel)
-  --no-lan            only localhost (no LAN IP route, images from 127.0.0.1)
-  --reset             wipe Postgres + ClickHouse volumes first
-  --verbose           Miniflare + core-api logs
-npm run demo:down [-- --reset]   stop the containers (--reset also deletes their volumes)`;
-
-function parse(argv) {
-  const { values } = parseArgs({
-    args: argv,
-    options: {
-      funnels: { type: 'string' },
-      'funnels-dir': { type: 'string' },
-      country: { type: 'string', default: 'VN' },
-      pixel: { type: 'string' },
-      'no-lan': { type: 'boolean', default: false },
-      reset: { type: 'boolean', default: false },
-      down: { type: 'boolean', default: false },
-      verbose: { type: 'boolean', default: false },
-      help: { type: 'boolean', default: false },
-    },
-  });
-  values.country = values.country.toUpperCase();
-  if (!/^[A-Z]{2}$/.test(values.country)) throw new DemoError(`--country must be a 2-letter code, got ${values.country}`);
-  return values;
-}
+import { USAGE, parseOptions, qrText } from './lib/options.mjs';
+import { PORTS, startStack } from './lib/stack.mjs';
+import { startTunnel } from './lib/tunnel.mjs';
 
 async function main() {
   let opts;
   try {
-    opts = parse(process.argv.slice(2));
+    opts = parseOptions(process.argv.slice(2));
   } catch (err) {
     throw new DemoError(`${err.message}\n\n${USAGE}`);
   }
@@ -52,25 +23,48 @@ async function main() {
   }
 
   console.log('Starting the iFunnel demo (first run pulls images and takes longer)...');
-  const stack = await startStack({
-    ...(opts.funnels && { funnels: opts.funnels.split(',').map((s) => s.trim()).filter(Boolean) }),
-    ...(opts['funnels-dir'] && { funnelsDir: opts['funnels-dir'] }),
-    country: opts.country,
-    lan: !opts['no-lan'],
-    pixel: opts.pixel ?? null,
-    verbose: opts.verbose,
-  });
+  let tunnel = null;
+  if (opts.tunnel) {
+    console.log('Opening a Cloudflare quick tunnel...');
+    tunnel = await startTunnel(PORTS.proxy);
+  }
+  const base = tunnel?.url ?? opts.host ?? null;
+  let stack;
+  try {
+    stack = await startStack({
+      ...(opts.funnels && { funnels: opts.funnels.split(',').map((s) => s.trim()).filter(Boolean) }),
+      ...(opts.purchase && { funnels: [opts.funnel], purchase: { base } }),
+      ...(opts['funnels-dir'] && { funnelsDir: opts['funnels-dir'] }),
+      country: opts.country,
+      lan: !opts['no-lan'],
+      pixel: opts.pixel ?? null,
+      verbose: opts.verbose,
+    });
+  } catch (err) {
+    await tunnel?.stop();
+    throw err;
+  }
 
   const w = Math.max(...stack.published.map((p) => p.slug.length));
   console.log(`\niFunnel demo is up. SDK ${stack.sdkHash}, country ${stack.country}${opts.pixel ? `, pixel ${opts.pixel}` : ''}\n`);
   for (const p of stack.published) console.log(`  ${p.slug.padEnd(w)}  v${p.v}  ${p.urls.join('   ')}`);
   console.log('');
   if (opts.pixel) console.log(`  WARNING: Pixel ${opts.pixel} is live: browsers load Meta's real fbevents.js and send real events to Meta when online. Use a test Pixel.\n`);
-  if (stack.lanIp) console.log(`  Phone (same wifi): open the http://${stack.lanIp}:8787/... links above`);
+  if (stack.lanIp && !stack.purchase) console.log(`  Phone (same wifi): open the http://${stack.lanIp}:8787/... links above`);
   console.log('  Events:   npm run demo:events');
   console.log(`  core-api: ${stack.coreUrl}  token ${stack.adminToken}`);
   if (stack.lanIp) console.log(`            IKF_API=${stack.coreUrl} IKF_TOKEN=${stack.adminToken} npx ikf route ls ${stack.lanIp}`);
   console.log('  Stop:     Ctrl-C (containers keep running; npm run demo:down stops them)\n');
+  if (stack.purchase) {
+    const p = stack.purchase;
+    console.log(`Purchase demo on ${p.base} (fake Paddle: no card, no real payment)\n`);
+    console.log(await qrText(p.url));
+    console.log(`  Funnel:   ${p.url}   <- scan the QR with the phone`);
+    console.log(`  Panel:    ${p.panel}   (refund / expire / renew)`);
+    console.log(`  App:      ${p.base}/_demo/app   Inbox: ${p.base}/_demo/mail`);
+    if (tunnel) console.log('  A new tunnel can take up to a minute to answer; the URL changes on every run.');
+    console.log('');
+  }
 
   let stopping = false;
   const shutdown = async () => {
@@ -82,6 +76,7 @@ async function main() {
     console.log('\nStopping...');
     setTimeout(() => process.exit(1), 10_000).unref();
     await stack.stop();
+    await tunnel?.stop();
     console.log('Stopped. Postgres + ClickHouse keep running: npm run demo:down');
     process.exit(0);
   };
PATCH
````

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npx vitest run --config demo/vitest.config.mjs test/options.test.mjs 2>&1 | grep -E "Tests  "
node demo/run.mjs --purchase; echo "exit $?"
npm run demo:test 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  4 passed (4)`; lệnh thứ hai in `ikf demo: --purchase cần --tunnel (Cloudflare quick tunnel) hoặc --host https://<host>` + USAGE và `exit 1`; demo `Test Files  17 passed (17)`, `Tests  95 passed (95)`.

- [ ] **Step 5: Chạy thật qua tunnel (cần internet, cổng 8787/8080/8790/8788/8791 trống)**

```bash
npm run demo:purchase > /tmp/demo-purchase.log 2>&1 &
until grep -qE "Panel:|ikf demo:" /tmp/demo-purchase.log; do sleep 1; done; grep -vE "▄|█|▀" /tmp/demo-purchase.log
U=$(grep -oE "https://[a-z0-9-]+\.trycloudflare\.com" /tmp/demo-purchase.log | head -1)
for i in $(seq 1 40); do [ "$(curl -s -o /tmp/dp-f.html -w '%{http_code}' "$U/witch-power")" = 200 ] && break; sleep 3; done
grep -o 'window.__IKF={[^<]*' /tmp/dp-f.html
curl -s -o /dev/null -w "paddle.js %{http_code} %{content_type}\n" "$U/_demo/paddle.js"
curl -s -X POST "$U/v1/payment/check-purchased-web-funnel" -H 'content-type: application/json' -d '{"user_id":"3f1c2a9e-4b7d-4c1e-9a2b-0c4d5e6f7a8b"}'; echo
curl -s -o /dev/null -w "img %{http_code} %{content_type}\n" "$U/_media/witch-power/img/hook-moon.jpg"
pkill -INT -f "demo/run.mjs --purchase --tunnel"; sleep 4; tail -2 /tmp/demo-purchase.log; pgrep -fl cloudflared || echo "no cloudflared"
```

Expected (đã chạy 2026-10-11): QR + `Funnel: https://<words>.trycloudflare.com/witch-power`, `Panel: …/_demo/`, `App: …/_demo/app   Inbox: …/_demo/mail` trong < 1 phút; `__IKF` có `"paddle":{"env":"sandbox","clientToken":"test_demo","js":"https://<words>.trycloudflare.com/_demo/paddle.js"},"turnstile":"1x00000000000000000000AA","api":"https://<words>.trycloudflare.com"`; `paddle.js 200 text/javascript; charset=utf-8`; `{"is_pro":false,"expires_at":null}`; `img 200 image/jpeg`; sau Ctrl-C: `Stopping...`, `Stopped. Postgres + ClickHouse keep running: npm run demo:down`, `no cloudflared`.

- [ ] **Step 6: Commit**

```bash
git add demo package.json package-lock.json
git commit -m "feat(demo): npm run demo:purchase (quick tunnel + QR), options module, README: full purchase flow"
```

---

### Task 15: Chạy lại toàn nhánh

**Files:** — (chỉ kiểm tra)

- [ ] **Step 1: Toàn bộ workspace + demo + Terraform**

```bash
npm test -w @ikf/paddle -w @ikf/event-schema -w @ikf/sdk -w @ikf/cli -w @ikf/edge-router -w @ikf/event-consumer -w @ikf/core-api -w @ikf/route-match 2>&1 | grep -E "Test Files|Tests  |bytes gzip"
npm run demo:test 2>&1 | grep -E "Test Files|Tests  "
terraform fmt -check -recursive infra
(cd infra/modules/edge && terraform test -no-color | tail -1)
(cd infra/stack && terraform test -no-color | tail -1)
for e in staging prod; do (cd infra/envs/$e && terraform init -backend=false -input=false >/dev/null && terraform validate -no-color | tail -1); done
git status --short
```

Expected: paddle 31, event-schema **145**, sdk **156**, cli **118**, edge-router **106** (7 file, `ikf sdk d1a533c86611: 8154 bytes gzip`), event-consumer 8 + 27, core-api **342** (34 file), route-match 35; demo **95** (17 file); fmt không in gì; edge `Success! 10 passed, 0 failed.`; stack `Success! 11 passed, 0 failed.`; hai env `Success! The configuration is valid.`; `git status` sạch. Không workflow nào đổi (actionlint không cần).

- [ ] **Step 2: Review toàn nhánh** (superpowers:requesting-code-review) trước PR vào `feat/entitlement-identity` (PR #4) — hoặc theo thứ tự stack mà Tech Lead chọn, vì nhánh này chứa cả `feat/local-demo` (PR #3).

---

## Theo sau (thủ công, ngoài phạm vi plan này)

1. **Chạy tay trên điện thoại** (`npm run demo:purchase`): quét QR → đi funnel → widget Turnstile thật (sitekey test) → overlay giả → Pay → nút "Open the app" → app giả **PRO** → bảng điều khiển Refund → "Kiểm tra lại" → **FREE**; "Cài lại app" → FREE → link trong hộp thư → PRO; Expire → FREE; Renew → PRO. Plan chỉ kiểm được phần HTTP (Task 14 Step 5) và DOM của overlay (happy-dom), không có trình duyệt thật.
2. **Swagger `api-slt-aio`** về: sửa `services/core-api/src/identity/sdk-contract.js` (tên field, `bundle_id`, `FOREVER_EXPIRES_VALUE`, bọc response nếu có), chạy core-api + demo; `docs-vector.test.js` chỉ ra đoạn `docs/integration/app-backend.md` §A cần sửa.
3. **Staging**: `ikf app create <app> … --handoff user_id --bundle-ids <ios>,<android>` (sau khi deploy), mua sandbox → link get-app có `user_id`, `curl` check-purchased (runbook §5.6); bàn giao `baseUrl = https://api.<zone>/v1` cho team mobile.
4. **Team nội dung**: bỏ `email=` (và `user_id=` FunnelFox) mà `appHandoffUrl()` của các funnel nebula/scanner nối vào link app (spec §5; E11 plan trước) — SDK web đã tự gắn `app_link`.
5. Thu hồi / cấp lại `user_id` bị lộ (spec §6): chưa làm.

---

## Self-Review

**Spec coverage — web funnel SDK compat:**

| Spec | Task |
|---|---|
| Điều kiện xong: get-app + email mở link Adjust `deep_link=<scheme>://open?user_id=<uuid>` | 3 (link, email), demo smoke 12–13 |
| Điều kiện xong: check-purchased đúng format SDK, đúng `entitlements`, tắt sau refund / hết hạn | 4 (+C1, C3), 13 (Expire/Renew) |
| Điều kiện xong: app `claim` như cũ, test cũ pass | 2 (APP_BODY claim), 3 Step 4, 8 Step 4 |
| Quyết định #1 iFunnel trả lời trực tiếp (`baseUrl = https://api.<zone>/v1`) | 4, 8 (tài liệu §A) |
| Quyết định #2 `user_id` UUID v4 per khách, không phải email | 1, 3 |
| Quyết định #3 mô hình cũ theo `apps.handoff` | 1, 2, 3 (+C8) |
| Quyết định #4 format theo swagger (tạm) | 4 (C1), "Theo sau" 2 |
| §1 dữ liệu: `customers.user_id`, `apps.handoff`, `apps.deeplink_path`, `user_id` là bí mật | 1, 3, 4 (log hash), 5 (C2), 6 (C6) |
| §2 claim → `app_link` user_id, cửa sổ 1 giờ, không claim token thật, email = link khôi phục, redeem 404, không webhook / link / OTP | 3 (+C5) |
| §3 endpoint: public, no CORS, no-store, body/response, user_id lạ → 200 false, phạm vi app (`bundle_ids`), `is_pro`, `expires_at`, 503, log `user_hash` | 4 (+C3, C4, C9) |
| §3 rate limit 50/10s/IP | 8 |
| §4 mode AUTH | 5 (+C2) |
| §5 CLI `--handoff`, `--deeplink-path`, `app ls`, `customer show` user_id | 5, 7 (+C7) |
| §5 tài liệu §A trước, claim chuyển xuống B; runbook handoff | 8 |
| §5 infra chỉ thêm đường dẫn; funnel không cần `email=` | 8; "Theo sau" 4 |
| §6 ngoài phạm vi (thu hồi, chữ ký, api-slt-aio) | không task (đúng); runbook ghi `user_id` lộ |
| §7 kiểm thử: migration; claim; check-purchased (pro, refund, hết hạn +3 ngày, lạ, lọc app, log); AUTH (đúng app, key sai 401); CLI; test vector; Terraform | 1; 3; 4; 5; 7; 8 |

**Spec coverage — demo purchase:**

| Spec | Task |
|---|---|
| Điều kiện xong: `npm run demo:purchase` in URL + QR ~1 phút | 14 (Step 5 đã chạy thật) |
| Điều kiện xong: `npm run demo:test` smoke luồng mua | 12, 13 |
| Điều kiện xong: production chỉ đổi chỗ cắm Paddle.js, có test chặn staging/prod | 9 (+D1) |
| Quyết định #1 quick tunnel; #2 Paddle giả + webhook tự ký; #3 `__IKF.paddle.js` + `PADDLE_JS_URL`; #4 sitekey test + verify giả; #5 app `starlyn` handoff user_id; #6 `witch-power` | 11; 10; 9; 12; 12 (seed); 12, 14 |
| §1 `run.mjs` cờ; `tunnel.mjs`; `proxy.mjs`; `paddle-fake.mjs`; `queue.mjs`; `stack.mjs` deps + 3 worker; `seed.mjs`; `server/`; `miniflare.mjs` vars; smoke; README | 14 (+D8); 11; 11 (+D4); 10 (+D2, D3); 10 (+D12); 12; 12 (+D5); 13 (+D9, D10); 12; 12–13; 14 |
| §2 SDK `cfg.paddle.js` https, bundle ≤ 8192; edge-router chỉ thêm khi có biến; test SDK/edge/"Terraform" | 9 (+D1) |
| §3 luồng 1–7 (gồm Ctrl-C dừng tunnel/proxy/worker/Miniflare/core) | 12–14 (Step 5 Ctrl-C) |
| §4 hành vi: pro chỉ từ endpoint thật; hộp thư 50; Paddle giả không lưu đĩa; cloudflared thiếu / 30 s; `--purchase` không tunnel → `--host https`; Turnstile thật trong trình duyệt | 13 (app page); 12; 10; 11; 14; README |
| §5 kiểm thử: unit paddle-fake (state, chữ ký verify, `adjustments[].type`); unit tunnel (parse, binary thiếu); smoke (`__IKF.paddle.js`, checkout với Origin, pay, claim ≤ 20 s, pro, refund ≤ 10 s, không email trong log); `demo.test.mjs` vẫn pass | 10; 11; 12–13 (+D11); 9 Step 2, 15 |
| §6 ngoài phạm vi | không task |

**Placeholder:** không có "TBD"/"tương tự Task N". Mọi khối code và patch được sinh từ cây đã chạy test (Node 26, colima): test fail đúng như "Expected" ở Step 2/4, pass với số ghi ở mỗi task; số demo Task 10–13 chạy lại trên đúng commit từng task. Không chạy được ở đây: trình duyệt thật trên điện thoại (widget Turnstile, overlay, chạm get-app) — "Theo sau" 1.

**Nhất quán tên / kiểu:**
- `usesUserId(app)` (`claims.js`, Task 3) dùng ở `link.js`, `otp.js`, `sync.js`; `appForKey` trả `handoff`, `deeplink_path` (Task 2) → `req.caller`.
- `userAppLinkFor(app, userId)` (Task 3) = link trong `GET …/claim` = link trong email = `adjust_tracker_url` của seed demo (`<base>/_demo/app`, Task 12) = `pickUserId` đọc (Task 13).
- `sdk-contract.js` (Task 4) ← `check-purchased.test.js` (4), `docs-vector.test.js` (8), `purchase.test.mjs` (12–13), `demo/server/index.mjs` `contractJson()` (13) → `app-page.mjs` đọc `path`, `request_user_id_field`, `request_app_field`, `response_is_pro_field`, `response_expires_field`, `forever_expires_value`.
- `DEMO_PRICES['1w'|'addon'].id` (Task 10) = prices seed (12) = `PRICE_ID_RE` của core (D3).
- `createFakePaddle().state()` (10) = `/_demo/state` (13) = bảng điều khiển; `pay/refund/expire/renew` (10) = `/_demo/paddle/pay`, `/_demo/actions/*` (13).
- `PORTS.proxy = 8788` (12) = `startTunnel(PORTS.proxy)` (14) = README; `purchaseBindings(base).PADDLE_JS_URL = <base>/_demo/paddle.js` (12) = route demo server (13) = `__IKF.paddle.js` (9).
- `jsonLog` / `logStream` (12) = log smoke kiểm (12–13).

**Review Focus đã ghim:** 1 → Task 4, 5, 6, 12–13; 2 → Task 4; 3 → Task 4, 13; 4 → Task 2, 3 (+ test cũ); 5 → Task 9.

# iKame Funnel Platform — Admin Console đợt 3 (Dashboard ClickHouse) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mọi người có tài khoản console (từ `viewer`) xem được funnel đang chuyển đổi ra sao — session → từng screen → lead → checkout → paid, doanh thu theo currency — theo giờ/ngày UTC, so sánh version, cắt theo nguồn/campaign/quốc gia/thiết bị, trên **Dashboard** và tab **Số liệu** của funnel (và `ikf stats`), không cần truy vấn ClickHouse bằng tay; thiếu cấu hình ClickHouse thì analytics tắt gọn, mọi thứ khác chạy như cũ.

**Architecture:**
- **ClickHouse**: `clickhouse/002_funnel_hourly.sql` — bảng `funnel_hourly` (`AggregatingMergeTree`, `sessions AggregateFunction(uniqExact, String)`, `hour DateTime('UTC')`, TTL 13 tháng) + MV `funnel_hourly_mv` (`DEFINER = CURRENT_USER SQL SECURITY DEFINER`) từ `events`; backfill một lần `clickhouse/backfill/002_funnel_hourly.sql` (chạy lại vô hại vì trạng thái là tập `sid`). Demo apply từng statement (`sqlStatements`) và chạy backfill mỗi lần khởi động.
- **core-api** `src/analytics/`: `clickhouse.js` (client đọc: POST, `param_*`, JSONEachRow, Basic auth, 1 retry, `ClickhouseError(kind)`), `setup.js` (`analyticsDeps`: 3 secret `clickhouse-url`, `clickhouse-reader-user`, `clickhouse-reader-password` + env `CLICKHOUSE_DATABASE`; thiếu → log `analytics disabled, missing: …`, không đăng ký route), `queries.js` (SQL `uniqExactMerge(h.sessions)` trên `funnel_hourly`), `revenue.js` (Postgres: paid, doanh thu gross theo currency, refund từ `outbox`), `service.js` (khoảng UTC + giới hạn, ghép theo bucket, điền 0, cache 30 s). Routes `src/http/analytics.js`: `GET /v1/analytics/overview`, `/funnels/:slug`, `/funnels/:slug/breakdown` (grant `viewer`, `cache-control: private, max-age=30`, `503 analytics_unavailable`).
- **CLI**: `ikf stats <slug> [--days 7] [--by hour|day]`.
- **`apps/admin`**: `format.js` (`fmtNum`, `fmtPct`, `fmtMoney` không lẻ cho JPY/KRW/VND…), `RangePicker`, `charts/LineChart.jsx` + `charts/Bars.jsx` (SVG tự viết), `AnalyticsState.jsx`; **Dashboard** ở `/` (mục menu đầu); Funnel detail → tab **Số liệu** (mặc định, URL `?tab=`).
- **Demo**: core đọc ClickHouse của demo; `demo/lib/sample.mjs` + `npm run demo:events -- --seed` (3 ngày dữ liệu mẫu ClickHouse + Postgres); e2e Playwright `demo/test/admin-p3-e2e.test.mjs`.
- **Infra/docs**: Terraform stack thêm 2 secret rỗng + env `CLICKHOUSE_DATABASE`; edge `rate_limited_prefixes` thêm `/v1/analytics/`; runbook `docs/runbooks/analytics.md`; `CLAUDE.md`.

**Tech Stack:** Node.js 22 trên CI (local Node 26) · JavaScript ESM · npm workspaces · Fastify 5 · `pg` 8 · ClickHouse 25.8 (HTTP interface) · Vitest ~3.2 · happy-dom 20 · `@testcontainers/postgresql` + `@testcontainers/clickhouse` 11 · React 19 · react-router 7 · Vite 7 · `@testing-library/react` 16 · Playwright 1.63 · Terraform + Cloudflare provider (mock). Không dependency runtime mới (core-api thêm **devDependency** `@testcontainers/clickhouse`, đã có trong lockfile qua event-consumer).

**Spec:** `ifunnel/docs/specs/2026-10-11-admin-console-p3-design.md`. Bối cảnh: `ifunnel/docs/specs/2026-10-08-runtime-sdk-collector-design.md` (envelope sự kiện, bảng ClickHouse `events`), `ifunnel/docs/specs/2026-10-11-admin-console-p2-design.md` + plan `ifunnel/docs/plans/2026-10-11-admin-console-p2.md` (grants, quy ước SPA, `fakeClient`/`renderApp`, e2e cổng riêng).

**Repo / nhánh / worktree:** repo `/Users/daothinh/ikf-platform`. Nhánh mới **`feat/admin-console-p3`** cắt từ **`feat/admin-console-p2`** — đã kiểm với tip **`331299d`** (`fix: versions.plan_keys keeps only valid plan keys, at most 50`). Code nằm trong worktree **`/Users/daothinh/ikf-platform-admin-p3`** (controller đã tạo sẵn; Task 1 Step 1 chỉ kiểm). PR sau này vào base `feat/admin-console-p2`. **Không bao giờ** đụng working tree `/Users/daothinh/ikf-platform-*` khác (session khác dùng: `-admin`, `-admin-p2`, `-demo`, `-demo-purchase`, `-entitlement`, `-billing`); `~/ikame/funnel/funnel-development` chỉ đọc. Mọi lệnh trong plan chạy từ gốc worktree mới. Quy ước repo: `CLAUDE.md` ở gốc repo.

**Môi trường chạy test (local):**
```bash
cd /Users/daothinh/ikf-platform-admin-p3
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock          # Docker qua colima (colima start)
export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock     # Testcontainers (Postgres, ClickHouse)
export TF_PLUGIN_CACHE_DIR=$HOME/.terraform.d/plugin-cache            # Terraform (chỉ mock provider; không bao giờ apply)
```
Demo (Task 1, 10, 11, 13) cần thêm: `docker compose` (README demo), Chromium của Playwright (`~/Library/Caches/ms-playwright`; thiếu thì `npx playwright install chromium`), funnel `ewa-books`, `moon-reading` (e2e đợt này) và `witch-power` (e2e đợt 2) trong `~/ikame/funnel/funnel-development` (e2e tự skip nếu thiếu). **`npm run demo:test` không bao giờ chạy song song với một demo test khác** (cổng cố định); nếu cổng bận vì session khác đang chạy demo, đợi rồi chạy lại, không kill gì. Các test core-api dùng ClickHouse (Testcontainers `clickhouse/clickhouse-server:25.8`, ~5 s khởi động) nằm trong file riêng `test/{funnel-hourly,analytics-client,analytics-queries,analytics-http}.test.js`; phần còn lại của core-api không đổi.

Số test ghi ở mỗi task là số **thật** khi chạy toàn bộ code của plan này trên bản sao `feat/admin-console-p2@331299d` (Node 26, colima, 2026-10-12); mỗi khối code / patch trong plan được sinh trực tiếp từ cây đã chạy test đó (trùng từng byte), bước "FAIL" được chạy thật trên cây chưa có phần implement của task; sau cùng toàn bộ plan được áp lại theo thứ tự lên một bản `331299d` sạch thứ hai và so khớp tree với cây đã chạy sau từng task (chỉ khác `package-lock.json`/artefact của `npm install`). Mốc ban đầu tại `331299d` (đo lại 2026-10-12, khớp mốc đợt 2): core-api **492** (52 file), admin SPA **105** (12 file), cli **148** (14 file), funnel-lint **35** (3 file), paddle **34** (2 file), event-schema **145**, sdk **159** (11 file, bundle **8154** byte gzip), edge-router **106** (7 file), route-match **35**, event-consumer **8 + 27**; `npm run demo:test` **115** (20 file); Terraform edge **12**, core-service **6**, stack **12**. (Một lần chạy `demo:test` ở mốc có 1 test chập chờn sẵn từ trước, `paddle-fake.test.mjs` "expire: past_due …" lệch 1 ms — `expected 345599999 to be greater than or equal to 345600000`; chạy lại thì pass. Không thuộc đợt này, không sửa.)

Nếu lúc thực thi `feat/admin-console-p2` đã đi xa hơn `331299d`: chạy lại mốc (Task 1 Step 2); số khác thì ghi lại và chỉnh các con số "Expected" theo chênh lệch; patch không áp được thì đọc phần code tương ứng và áp tay đúng nội dung, không sửa gì ngoài phạm vi task. `package-lock.json` không in trong plan (Task 1 thêm một devDependency đã có trong lockfile; `npm install` chỉ thêm một dòng vào lockfile).

## Điều chỉnh so với spec (phát hiện khi đọc code tại `331299d` và chạy thử, 2026-10-12)

| # | Spec | Plan làm | Lý do |
|---|---|---|---|
| A1 | §1 MV `funnel_hourly_mv` "TO funnel_hourly AS SELECT từ events" | `CREATE MATERIALIZED VIEW IF NOT EXISTS funnel_hourly_mv TO funnel_hourly DEFINER = CURRENT_USER SQL SECURITY DEFINER AS …`; test Task 1 tạo đúng user của runbook (`ikf_writer` chỉ `INSERT ON ikf.events`, `ikf_reader` chỉ `SELECT`) | Đã chạy thật: không có `SQL SECURITY DEFINER`, khi MV tồn tại mọi insert của `ikf_writer` vào `events` bị `ACCESS_DENIED` (HTTP 500, cần `SELECT` trên `events` + `INSERT` trên `funnel_hourly`) → event consumer retry rồi đẩy hết vào DLQ. Runbook: tạo view bằng admin "ở lại" (view chạy dưới quyền người tạo) |
| A2 | §1 `hour DateTime`, `hour = toStartOfHour(received_at)` | `hour DateTime('UTC')`, `toStartOfHour(toDateTime(received_at, 'UTC'))`; ngày = `toStartOfDay(hour)` | `events.received_at` là `DateTime64(3)` không múi giờ (theo múi giờ server); cố định UTC thì bucket không phụ thuộc cấu hình server (spec: "Bucket Postgres và ClickHouse cùng UTC") |
| A3 | §1 `ORDER BY (…, screen, …)` với `screen Nullable(Int32)` | Thêm `SETTINGS allow_nullable_key = 1` | ClickHouse từ chối khoá sắp xếp có cột Nullable nếu thiếu setting này |
| A4 | §1 "`002` … demo tự apply theo thứ tự tên; prod chạy tay như `001`"; "Backfill một lần (runbook)" | `002` có 2 statement → demo `applyClickhouseDdl` tách theo `;` cuối dòng (`sqlStatements`, bỏ khúc chỉ có comment); backfill nằm ở `clickhouse/backfill/002_funnel_hourly.sql` (thư mục con: không bị apply như DDL), demo chạy nó **mỗi lần khởi động** (idempotent); prod: `clickhouse client --multiquery` | HTTP interface của ClickHouse chỉ nhận một statement mỗi request. Backfill chạy lại không đổi số nào: trạng thái `uniqExact` là tập `sid`, `AggregatingMergeTree` gộp dòng trùng khoá lúc merge |
| A5 | §1 "Đọc: `uniqExactMerge(sessions)`" | Luôn `FROM funnel_hourly AS h` và `uniqExactMerge(h.sessions)` / `uniqExactMergeIf(h.sessions, name = '…')` | Đã chạy thật: trong `SELECT uniqExactMerge(sessions) AS sessions, uniqExactMergeIf(sessions, …)` chữ `sessions` thứ hai là **alias** (UInt64) → `Code: 43 ILLEGAL_TYPE_OF_ARGUMENT` (HTTP 500) |
| A6 | §2 client: "lỗi → `ClickhouseError(kind: 'auth' \| 'client' \| 'unavailable')`", "1 retry trên 5xx/timeout/mạng" | `auth` = 401/403 (ClickHouse 25.8 trả **403** + code 516 khi sai mật khẩu); `client` = 4xx khác (400 cú pháp, 404); mọi 5xx, mạng, timeout = `unavailable` (retry 1 lần). Thông điệp lỗi chỉ `clickhouse <kind> (HTTP <status>)` | ClickHouse trả **HTTP 500** cho cả lỗi truy vấn (code 43, `ACCESS_DENIED` 497): không phân biệt được bằng status, nên một câu SQL hỏng hiện ra là `503 analytics_unavailable` sau 1 retry; log có `kind` + `status`, runbook chỉ `system.query_log` |
| A7 | §2 overview `{… sessions, leads, checkouts, paid …}` (không nói `checkouts` lấy đâu) | `checkouts` = số dòng Postgres `checkouts` mở trong khoảng (`created_at`, mọi status) | Bậc giữa lead và paid có ở mọi funnel có thanh toán (POST `/v1/checkout`); event `checkout_click` do HTML funnel tự phát, không funnel nào cũng có |
| A8 | §1 "`revenue[]`: `SUM(transactions.amount_minor)` theo `currency`"; "doanh thu từ Postgres nối theo `sid`" | Doanh thu = giao dịch `status IN PAID` có `billed_at` (thiếu thì `paddle_updated_at`) trong khoảng, nối `transactions.checkout_id = checkouts.id` → funnel/`v`/utm của checkout; **tính cả gia hạn** (cùng `checkout_id`). `paid` = checkout `completed` có giao dịch PAID, bucket theo `completed_at`. Không nối ClickHouse ↔ Postgres theo `sid`: hai phía ghép theo bucket/khoá trong `service.js` | `custom_data.checkout_id` luôn có (POST `/v1/checkout`); gia hạn mang `checkout_id` của lần mua đầu. Nối theo `sid` giữa hai kho không làm được trong một truy vấn và không cần cho các tổng spec hỏi |
| A9 | §1 "Khoảng: `from`, `to` ISO UTC; mặc định 7 ngày theo giờ; `by=hour` ≤ 14 ngày, `by=day` ≤ 90 ngày; `from < to`; `to` cắt ở hiện tại" | `resolveRange`: `to` cắt ở `now`, kiểm giới hạn trên khoảng được hỏi, rồi làm tròn ra giờ UTC (`from` xuống, `to` lên). Vi phạm → `400 invalid_range {reason: 'from_not_before_to' \| 'too_long', by, max_days}`. Overview và breakdown (không có `by`) dùng giới hạn `day` (90 ngày) | Bucket giờ phải trọn giờ; giới hạn tính trên khoảng hỏi để "14 ngày tới bây giờ" không bị từ chối vì làm tròn |
| A10 | §2 response funnel/breakdown | `series[].t` là ISO; `versions` = các `v` có sự kiện trong khoảng (bỏ qua bộ lọc `v`, để đổi lại được); breakdown `dim` **bắt buộc**; `key` dạng chữ (`v` → `"2"`); khoá chỉ Postgres biết (có tiền, không có sự kiện) vẫn giữ với `sessions: 0`; cắt 50 dòng sau khi ghép | SPA cần danh sách version đầy đủ khi đang lọc; một khoá có tiền không được biến mất |
| A11 | §4 "token `viewer` 200" | Không có role token `viewer`: mọi token hợp lệ đều thoả grant `viewer` (đã có từ đợt 2) → test token `publisher` và `router` đọc được 3 route | `ROLES` token = `publisher`/`router`/`admin` |
| A12 | §3 "Thiếu secret ClickHouse → console hiện thẻ 'chưa bật'" | Route analytics không đăng ký → Fastify trả 404 mặc định (`error: 'Not Found'`). SPA `analyticsOff(err)` = `503 analytics_unavailable` **hoặc** 404 không phải `funnel_not_found` → cùng thẻ "Analytics chưa bật hoặc ClickHouse không phản hồi…" | Spec §2 nói không đăng ký route; SPA vẫn phải nhận ra |
| A13 | §3 "tab Số liệu (mặc định khi mở funnel; các tab khác giữ nguyên)" | Tab theo URL: `/funnels/:slug` = Số liệu, `?tab=main` = Tổng quan, `?tab=prices` = Giá (khi có `prices:read`); thanh tab luôn hiện (Số liệu · Tổng quan [· Giá]) | Test cũ mở `/funnels/aivideo` để xem Tổng quan → đổi sang `?tab=main` (đúng nghĩa cũ); e2e đợt 1 `goto …?tab=main` |
| A14 | §4 "Testcontainers ClickHouse (như event-consumer)" | core-api thêm devDependency `@testcontainers/clickhouse` `^11.14.0`; helper `test/helpers/clickhouse.js` bật `CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1` | Cần quyền tạo user/grant cho test A1 (như compose của demo); không đổi gì khác |
| A15 | §4 Demo: "`npm run demo` … `demo/events.mjs` mở rộng: sinh 3 ngày …" | `npm run demo:events -- --seed` ghi dữ liệu mẫu (ClickHouse + Postgres) cho mọi funnel đã publish (hoặc `--funnel`); **không** tự seed khi `npm run demo` | Giữ nguyên số đếm của `demo.test.mjs`; id phụ thuộc giờ chạy → seed lại trong cùng giờ không thêm gì; refund ghi sẵn `published_at` để worker không xử lý; e2e dùng `ewa-books`, `moon-reading` (funnel mặc định của demo, không cần luồng mua) |
| A16 | §1 bậc thang = event `screen_view` với `screen = k` | Giữ nguyên (53/60 funnel trong `funnel-development` phát `emit('screen_view', {index})`); funnel không phát → bậc thang trống, UI ghi "Không có screen_view trong khoảng này." | Đã kiểm corpus |
| A17 | §2 CLI "in các mốc, bậc thang screen, doanh thu theo currency" | Thêm dòng "Sự kiện khác"; `--days` 1..90, `--by` mặc định theo số ngày, `--by hour` > 14 ngày → exit 2; bảng `ZERO_DECIMAL` riêng trong CLI; `503 analytics_unavailable` → thông điệp chỉ runbook | CLI không phụ thuộc SPA |
| A18 | §4 "Terraform stack … env `CLICKHOUSE_DATABASE`" | `CLICKHOUSE_DATABASE = "ikf"` cố định trong `core_environment` (không thêm biến); assert biểu thức đầy đủ của luật identity trong test edge cũ thêm `or starts_with(…, "/v1/analytics/")` | Prod/staging đều dùng database `ikf` (runbook collector) |
| A19 | §2 "Log mỗi request: `analytics {route, slug, from, to, ms}`"; "log `analytics_unavailable {kind}`" | `from`/`to` trong log là giá trị được hỏi (query); `analytics_unavailable {route, kind, status}` | Không log SQL, tham số hay `err.message` |
| A20 | §3 "% rơi mỗi bước"; bậc thang "% so với screen đầu" | Mốc: `rơi (trước − sau)/trước` so với mốc ngay trước; bậc thang: % so với screen nhỏ nhất | Đúng chữ spec |

## Global Constraints

- Code trong repo `ikf-platform`, nhánh `feat/admin-console-p3` (từ `feat/admin-console-p2@331299d`), worktree `/Users/daothinh/ikf-platform-admin-p3`, PR base `feat/admin-console-p2`. JavaScript (không TypeScript). HTML funnel **không sửa**.
- **Log không email, không `user_id`, không `err.message`**, không SQL có tham số (spec §2: "Log chỉ `kind` + status, không `err.message`, không SQL có tham số").
- **Response analytics chỉ có số tổng hợp, không PII; `sid` không bao giờ được trả về** (spec quyết định #3: "số liệu tổng hợp, không PII").
- Quyền: mọi route analytics khai báo grant **`viewer`** (cả doanh thu); không audit (đọc tổng hợp).
- ClickHouse: DDL **idempotent** (`CREATE … IF NOT EXISTS`), MV **an toàn khi insert trùng** (`uniqExactState(sid)`), đọc bằng **`uniqExactMerge`**, luôn lọc `funnel` (trừ overview) và khoảng `hour`. **UTC mọi nơi** (bucket ClickHouse và Postgres).
- Khoảng: `by=hour` ≤ **14 ngày**, `by=day` ≤ **90 ngày**, `from < to`, `to` cắt ở hiện tại; mặc định **7 ngày theo giờ**.
- Cache in-process **30 s** theo khoá `route|slug|from|to|by|dim|v`; lỗi không cache; header `cache-control: private, max-age=30`.
- Lỗi ClickHouse → **`503 {error: 'analytics_unavailable'}`**; Postgres lỗi → 500 như thường; funnel không có → `404 funnel_not_found`; query sai schema → 400.
- SPA: dependency runtime **không đổi**: `react`, `react-dom`, `react-router`, `qrcode`, `@ikf/funnel-lint`, `@ikf/route-match`; biểu đồ **SVG inline** tự viết; một file CSS (`src/styles.css`).
- Demo: không sửa `services/` từ `demo/` (chỉ tiêm qua `buildApp({deps})`); cổng cố định, `npm run demo:test` chạy một mình, tuần tự. e2e đợt này: cổng **8877/8178/8879/8878/8881/8882** (edge/core/media/proxy/demo/admin), DB Postgres + ClickHouse **`ikf_admin_p3_test`**, build SPA `demo/.build/admin-p3/`. Không bao giờ `terraform apply`.
- Bundle SDK không đổi (**8154** byte gzip).
- **Test cũ giữ nguyên ý nghĩa**; chỉ được sửa đúng các chỗ sau:
  - Task 1: `demo/test/stack.test.mjs` (chỉ thêm 2 test cuối `describe('applyClickhouseDdl')` và import `BACKFILL_DIR`).
  - Task 2: `services/core-api/test/config.test.js` (`toEqual` của `loadConfig` thêm đúng dòng `analytics: { clickhouseDatabase: 'ikf' }`).
  - Task 9: `apps/admin/test/auth.test.jsx` (test "/ goes to Funnels" → "/ is the Dashboard": spec §3 đặt Dashboard ở `/`), `apps/admin/test/grants.test.jsx` (mỗi danh sách menu thêm `Dashboard` đầu), `apps/admin/test/helpers.jsx` (thêm `getOverview` giả).
  - Task 10: `apps/admin/test/funnels.test.jsx` và `apps/admin/test/publish.test.jsx` (đường dẫn `/funnels/aivideo` → `/funnels/aivideo?tab=main`, A13), `apps/admin/test/helpers.jsx` (thêm `getFunnelStats`, `getFunnelBreakdown` giả), `demo/test/admin-e2e.test.mjs` (`goto …/funnels/${FUNNEL}?tab=main`).
  - Task 12: `infra/modules/edge/tests/edge.tftest.hcl` (assert biểu thức đầy đủ thêm tiền tố `/v1/analytics/` + một run mới), `infra/stack/tests/stack.tftest.hcl` (chỉ thêm run mới cuối file).

## Review Focus

1. **Funnel có sự kiện nhưng chưa có checkout nào** (chưa gắn giá, hoặc mới mở): người dùng mong `paid 0`, doanh thu "—", không thiếu trường, không 500. Test: Task 5 `a funnel with events and no money: paid 0 and revenue [] everywhere, nothing missing`; Task 6 `overview, funnel and breakdown answer a viewer…` (funnel chỉ có sự kiện → `checkouts: 0, paid: 0, revenue: []`); Task 9 hàng `quiz-only` (`0.0%`, `—`).
2. **Khoảng cắt qua ranh giới partition tháng** (30/9 → 1/10, `PARTITION BY toYYYYMM(hour)`): mong số đếm cả hai phía, ngày UTC đúng. Test: Task 3 `totals: … a range that crosses a month partition counts both sides` và `series by hour and by day…` (`T0 = 2026-09-30 22:00 UTC`); Task 1 `hour and day boundaries are UTC…`.
3. **Lọc `v` theo một version không có sự kiện trong khoảng**: mong toàn số 0 / danh sách rỗng, thẻ "Chưa có sự kiện trong khoảng này", danh sách version vẫn còn để đổi lại. Test: Task 3 `the v filter; a version with no events is all zeros and empty lists; versions seen ignore the filter`; Task 10 `a version with no events: "Chưa có sự kiện trong khoảng này", the version list stays…`.
4. **Currency không có số lẻ trong overview** (JPY 2000 = ¥2000): mong "2000 JPY", không "20.00 JPY". Test: Task 8 `fmtMoney: two decimals, none for zero-decimal currencies…`; Task 9 hàng `aivideo` `2000 JPY164.04 USD`; Task 7 `Doanh thu (gross): 2000 JPY, 27.34 USD`.
5. **ClickHouse chậm (timeout) hoặc lỗi trong khi Postgres vẫn ổn**: mong `503 analytics_unavailable` cho cả request (không trả nửa số), log chỉ `kind`/`status`, console hiện một thẻ, các tab khác vẫn dùng được. Test: Task 6 `ClickHouse %s → 503 analytics_unavailable; the log has the kind, not the message or the SQL` (`failing`, `slow`); Task 2 `one retry on 5xx, a network error or a timeout`; Task 10 `503: one "chưa bật" card, no breakdown; the other tabs still work`.

## File Structure (repo `ikf-platform`, phần mới/sửa)

```
ikf-platform/
├── CLAUDE.md                                        # SỬA: layout clickhouse/, quy ước analytics, demo --seed
├── clickhouse/002_funnel_hourly.sql                 # MỚI: funnel_hourly (AggregatingMergeTree) + funnel_hourly_mv (SQL SECURITY DEFINER)
├── clickhouse/backfill/002_funnel_hourly.sql        # MỚI: backfill một lần (chạy lại vô hại)
├── docs/runbooks/analytics.md                       # MỚI: DDL + backfill, ikf_reader, secrets, kiểm, xử lý sự cố
├── services/core-api/
│   ├── package.json                                 # SỬA: devDependency @testcontainers/clickhouse
│   ├── src/analytics/clickhouse.js                  # MỚI: createClickhouse, ClickhouseError
│   ├── src/analytics/setup.js                       # MỚI: ANALYTICS_SECRETS, analyticsDeps
│   ├── src/analytics/queries.js                     # MỚI: SQL trên funnel_hourly
│   ├── src/analytics/revenue.js                     # MỚI: tiền từ Postgres
│   ├── src/analytics/service.js                     # MỚI: resolveRange, buckets, analyticsService (cache 30 s)
│   ├── src/http/analytics.js                        # MỚI: 3 route GET /v1/analytics/*
│   ├── src/{app,config,server}.js                   # SỬA: đăng ký route, CLICKHOUSE_DATABASE, nạp secret
│   └── test/{funnel-hourly,analytics-client,analytics-setup,analytics-queries,analytics-revenue,analytics-service,analytics-http}.test.js,
│       test/helpers/clickhouse.js (mới); test/config.test.js (sửa)
├── packages/cli/src/{api,main}.js + test/stats.test.js   # SỬA/MỚI: ikf stats
├── apps/admin/src/
│   ├── api.js, format.js, styles.css, App.jsx, Layout.jsx, pages/FunnelDetail.jsx   # SỬA
│   ├── components/{RangePicker,AnalyticsState,StatsTab}.jsx, components/charts/{LineChart,Bars}.jsx  # MỚI
│   ├── pages/Dashboard.jsx                          # MỚI
│   └── ../test/{charts,dashboard,stats-tab}.test.jsx (mới); test/{helpers,auth,grants,funnels,publish}.test.jsx (sửa)
├── demo/lib/{stack.mjs (sửa), sample.mjs (mới)}, demo/events.mjs, demo/README.md
│   └── test/{sample,admin-p3-e2e}.test.mjs (mới); test/{stack,admin-e2e}.test.mjs (sửa)
└── infra/modules/edge/{main.tf, variables.tf, tests/edge.tftest.hcl}, infra/stack/{main.tf, tests/stack.tftest.hcl}   # SỬA
```

---

### Task 1: Worktree + mốc ban đầu; `clickhouse/002_funnel_hourly.sql` (bảng + MV) và backfill; demo apply từng statement

**Files:**
- Create: `clickhouse/002_funnel_hourly.sql`, `clickhouse/backfill/002_funnel_hourly.sql`, `services/core-api/test/helpers/clickhouse.js`
- Modify: `services/core-api/package.json` (devDependency), `demo/lib/stack.mjs`
- Test: `services/core-api/test/funnel-hourly.test.js` (mới); Modify: `demo/test/stack.test.mjs`

**Interfaces:**
- Consumes: bảng `events` (`clickhouse/001_events.sql`: `id, sid, received_at DateTime64(3), name, funnel, v, screen Nullable(Int32), attr Map, country, ua_class`, `ReplacingMergeTree(received_at)`); `applyClickhouseDdl(run, dir)` của demo (`demo/lib/stack.mjs`).
- Produces: ClickHouse `funnel_hourly (funnel, hour DateTime('UTC'), v, name, screen, country, ua_class, utm_source, utm_campaign, sessions AggregateFunction(uniqExact, String))` — đọc bằng `uniqExactMerge(h.sessions)`; MV `funnel_hourly_mv` (`SQL SECURITY DEFINER`); `clickhouse/backfill/002_funnel_hourly.sql`. Demo: `sqlStatements(sql)`, `BACKFILL_DIR` (export từ `demo/lib/stack.mjs`), `startStack` chạy DDL rồi backfill. Test helper `startClickhouse()` → `{url, user, password, database, run(sql, params), rows(sql, params), apply(dir = DDL_DIR), as(user, password, sql), eventRow(e), insertEvents(events), stop()}`, `DDL_DIR`, `BACKFILL_DIR` (dùng lại ở Task 2, 3, 6).

- [ ] **Step 1: Kiểm worktree (controller đã tạo) và cài**

```bash
git -C /Users/daothinh/ikf-platform-admin-p3 rev-parse --abbrev-ref HEAD   # feat/admin-console-p3
git -C /Users/daothinh/ikf-platform-admin-p3 log -1 --format=%h           # 331299d (tip của feat/admin-console-p2)
cd /Users/daothinh/ikf-platform-admin-p3
npm install
```

Nếu worktree chưa có: `git -C /Users/daothinh/ikf-platform worktree add -b feat/admin-console-p3 /Users/daothinh/ikf-platform-admin-p3 feat/admin-console-p2`. Không `checkout` trong các worktree khác. `npm install` chạy từ gốc worktree (không `-w .`).

- [ ] **Step 2: Chạy mốc ban đầu**

```bash
npm test -w @ikf/paddle -w @ikf/event-schema -w @ikf/funnel-lint -w @ikf/sdk -w @ikf/cli -w @ikf/edge-router -w @ikf/event-consumer -w @ikf/core-api -w @ikf/route-match -w @ikf/admin 2>&1 | grep -E "Test Files|Tests  |bytes gzip"
npm run demo:test 2>&1 | grep -E "Test Files|Tests  "
for d in infra/modules/edge infra/modules/core-service infra/stack; do (cd $d && terraform init -backend=false -input=false >/dev/null && terraform test -no-color | tail -1); done
```

Expected (tại `331299d`): paddle `2`/`34`, event-schema `1`/`145`, funnel-lint `3`/`35`, sdk `11`/`159`, cli `14`/`148`, edge-router `7`/`106` (`ikf sdk d1a533c86611: 8154 bytes gzip`), event-consumer `2`/`8` + `1`/`27`, core-api `52`/`492`, route-match `1`/`35`, admin `12`/`105`; demo `20`/`115`; Terraform `Success! 12 passed`, `6 passed`, `12 passed`.

- [ ] **Step 3: devDependency + test fail**

`services/core-api/package.json` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/package.json b/services/core-api/package.json
index 73b21b3..6473a70 100644
--- a/services/core-api/package.json
+++ b/services/core-api/package.json
@@ -26,6 +26,7 @@
     "redis": "^4.7.1"
   },
   "devDependencies": {
+    "@testcontainers/clickhouse": "^11.14.0",
     "@testcontainers/postgresql": "^11.14.0",
     "vitest": "^3.2.7"
   }
PATCH
```

```bash
npm install
```

`services/core-api/test/helpers/clickhouse.js` (mới):

```js
import { readdir, readFile } from 'node:fs/promises';
import { ClickHouseContainer } from '@testcontainers/clickhouse';

export const DDL_DIR = new URL('../../../../clickhouse/', import.meta.url);
export const BACKFILL_DIR = new URL('../../../../clickhouse/backfill/', import.meta.url);

// The statements of one .sql file (ClickHouse's HTTP interface takes one per request); comment-only chunks dropped.
const statements = (sql) => sql.split(/;\s*(?:\n|$)/).filter((s) => s.replace(/--.*$/gm, '').trim());

// A real ClickHouse (same image as production's schema tests in event-consumer), database `ikf`, user `ikf` allowed
// to create users and grants (like the demo's). run(sql, params) → response text; rows(sql, params) → JSONEachRow
// objects; apply(dir) runs every .sql in it; as(user, password, sql) → the raw Response for another user.
export async function startClickhouse() {
  const container = await new ClickHouseContainer('clickhouse/clickhouse-server:25.8')
    .withEnvironment({ CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT: '1' })
    .withDatabase('ikf').withUsername('ikf').withPassword('pw').start();
  const cfg = { url: container.getHttpUrl(), user: 'ikf', password: 'pw', database: 'ikf' };
  const run = async (sql, params = {}) => {
    const qs = new URLSearchParams({ database: 'ikf' });
    for (const [k, v] of Object.entries(params)) qs.set(`param_${k}`, String(v));
    const res = await fetch(`${cfg.url}/?${qs}`, { method: 'POST', body: sql, headers: { authorization: `Basic ${btoa('ikf:pw')}` } });
    const text = await res.text();
    if (!res.ok) throw new Error(text);
    return text;
  };
  const rows = async (sql, params) => (await run(`${sql} FORMAT JSONEachRow`, params)).split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const apply = async (dir = DDL_DIR) => {
    const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
    for (const f of files) for (const s of statements(await readFile(new URL(f, dir), 'utf8'))) await run(s);
    return files;
  };
  const as = (user, password, sql) => fetch(`${cfg.url}/?database=ikf`, { method: 'POST', body: sql, headers: { authorization: `Basic ${btoa(`${user}:${password}`)}` } });
  // One event row as the event consumer writes it (times in ms → 'YYYY-MM-DD hh:mm:ss.mmm' UTC).
  const ch = (ms) => new Date(ms).toISOString().replace('T', ' ').replace('Z', '');
  let n = 0;
  const eventRow = (e) => {
    n += 1;
    const at = e.at ?? Date.UTC(2026, 9, 8, 10, 0, 0);
    return JSON.stringify({
      id: e.id ?? `01JA${String(n).padStart(22, '0')}`, sid: e.sid, aid: null, t: ch(at - 1000), received_at: ch(at),
      name: e.name ?? 'page_load', funnel: e.funnel ?? 'aivideo', v: e.v ?? 1, rev: 1, host: 'try.x.com', path: '/',
      screen: e.screen ?? null, props: {}, attr: e.attr ?? {}, country: e.country ?? 'VN', ua_class: e.ua_class ?? 'mobile', ip_hash: '',
    });
  };
  const insertEvents = (events) => run(`INSERT INTO events FORMAT JSONEachRow\n${events.map(eventRow).join('\n')}`);
  return { ...cfg, run, rows, apply, as, eventRow, insertEvents, stop: () => container.stop() };
}
```

`services/core-api/test/funnel-hourly.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { BACKFILL_DIR, startClickhouse } from './helpers/clickhouse.js';

const H = (h, m = 0, s = 0, ms = 0) => Date.UTC(2026, 9, 8, h, m, s, ms);
const S1 = '01JA0000000000000000000S01';
const S2 = '01JA0000000000000000000S02';
const S3 = '01JA0000000000000000000S03';

// Spec admin-console-p3 §1: funnel_hourly (AggregatingMergeTree) fed by funnel_hourly_mv from events.
describe('clickhouse/002_funnel_hourly.sql (real ClickHouse)', () => {
  let ch;
  // Sessions per group, read the way the API reads them: uniqExactMerge over the states.
  const sessions = (group, where = '1') =>
    ch.rows(`SELECT ${group ? `${group} AS k, ` : ''}uniqExactMerge(sessions) AS n FROM funnel_hourly WHERE ${where}${group ? ' GROUP BY k ORDER BY k' : ''}`);

  beforeAll(async () => {
    ch = await startClickhouse();
  });
  afterAll(() => ch?.stop());
  beforeEach(async () => {
    await ch.apply();
    await ch.run('TRUNCATE TABLE events');
    await ch.run('TRUNCATE TABLE funnel_hourly');
  });

  it('applies twice without error: table, view, engine, keys and TTL as the spec says', async () => {
    expect(await ch.apply()).toEqual(['001_events.sql', '002_funnel_hourly.sql']);
    const t = (await ch.rows("SELECT name, engine, partition_key, sorting_key FROM system.tables WHERE database = 'ikf' ORDER BY name")).map((r) => [r.name, r.engine, r.partition_key, r.sorting_key]);
    expect(t).toEqual([
      ['events', 'ReplacingMergeTree', 'toYYYYMM(received_at)', 'funnel, toDate(received_at), sid, id'],
      ['funnel_hourly', 'AggregatingMergeTree', 'toYYYYMM(hour)', 'funnel, hour, v, name, screen, country, ua_class, utm_source, utm_campaign'],
      ['funnel_hourly_mv', 'MaterializedView', '', ''],
    ]);
    const ddl = (await ch.rows("SELECT create_table_query AS q FROM system.tables WHERE database = 'ikf' AND name = 'funnel_hourly'"))[0].q;
    expect(ddl).toMatch(/TTL hour \+ toIntervalMonth\(13\)/);
    expect(ddl).toMatch(/`sessions` AggregateFunction\(uniqExact, String\)/);
    expect(ddl).toMatch(/`hour` DateTime\('UTC'\)/);
  });

  // The runbook's users: the event consumer keeps INSERT on events only; the dashboard's reader only reads.
  it('with the view in place, ikf_writer (INSERT on events) still inserts and fills funnel_hourly; ikf_reader reads, never writes', async () => {
    for (const sql of [
      "CREATE USER IF NOT EXISTS ikf_writer IDENTIFIED WITH sha256_password BY 'w'",
      'GRANT INSERT ON ikf.events TO ikf_writer',
      "CREATE USER IF NOT EXISTS ikf_reader IDENTIFIED WITH sha256_password BY 'r'",
      'GRANT SELECT ON ikf.events TO ikf_reader',
      'GRANT SELECT ON ikf.funnel_hourly TO ikf_reader',
    ]) await ch.run(sql);
    expect((await ch.as('ikf_writer', 'w', `INSERT INTO events FORMAT JSONEachRow\n${ch.eventRow({ sid: S1, name: 'lead' })}`)).status).toBe(200);
    const read = await ch.as('ikf_reader', 'r', 'SELECT uniqExactMerge(sessions) AS n FROM funnel_hourly FORMAT JSONEachRow');
    expect(await read.json()).toEqual({ n: 1 });
    for (const sql of ["INSERT INTO funnel_hourly (funnel) VALUES ('x')", `INSERT INTO events FORMAT JSONEachRow\n${ch.eventRow({ sid: S2 })}`]) {
      const res = await ch.as('ikf_reader', 'r', sql);
      expect([res.status, (await res.text()).includes('ACCESS_DENIED')]).toEqual([500, true]);
    }
  });

  it('the same event id inserted twice (a retried batch) is still one session', async () => {
    const e = { id: '01JA0000000000000000000E01', sid: S1, name: 'lead' };
    await ch.insertEvents([e]);
    await ch.insertEvents([e]);
    expect((await ch.rows('SELECT count() AS c FROM events'))[0].c).toBe(2);
    expect(await sessions(null)).toEqual([{ n: 1 }]);
    expect(await sessions('name')).toEqual([{ k: 'lead', n: 1 }]);
  });

  it('uniqExactMerge by screen, name, dimension and hour; missing utm is the empty string', async () => {
    await ch.insertEvents([
      { sid: S1, name: 'screen_view', screen: 0, attr: { utm_source: 'meta', utm_campaign: 'c1' }, at: H(10, 5) },
      { sid: S1, name: 'screen_view', screen: 1, attr: { utm_source: 'meta', utm_campaign: 'c1' }, at: H(10, 6) },
      { sid: S1, name: 'screen_view', screen: 1, attr: { utm_source: 'meta', utm_campaign: 'c1' }, at: H(10, 7) },
      { sid: S2, name: 'screen_view', screen: 0, country: 'US', ua_class: 'desktop', v: 2, at: H(10, 30) },
      { sid: S2, name: 'quiz_done', country: 'US', ua_class: 'desktop', v: 2, at: H(11, 1) },
      { sid: S3, name: 'page_load', attr: { utm_source: 'tiktok' }, at: H(11, 2) },
    ]);
    expect(await sessions('screen', "name = 'screen_view'")).toEqual([{ k: 0, n: 2 }, { k: 1, n: 1 }]);
    expect(await sessions('name')).toEqual([{ k: 'page_load', n: 1 }, { k: 'quiz_done', n: 1 }, { k: 'screen_view', n: 2 }]);
    expect(await sessions('utm_source')).toEqual([{ k: '', n: 1 }, { k: 'meta', n: 1 }, { k: 'tiktok', n: 1 }]);
    expect(await sessions('utm_campaign')).toEqual([{ k: '', n: 2 }, { k: 'c1', n: 1 }]);
    expect(await sessions('country')).toEqual([{ k: 'US', n: 1 }, { k: 'VN', n: 2 }]);
    expect(await sessions('ua_class')).toEqual([{ k: 'desktop', n: 1 }, { k: 'mobile', n: 2 }]);
    expect(await sessions('v')).toEqual([{ k: 1, n: 2 }, { k: 2, n: 1 }]);
    expect(await sessions('toString(hour)')).toEqual([{ k: '2026-10-08 10:00:00', n: 2 }, { k: '2026-10-08 11:00:00', n: 2 }]);
    // A session seen in two hours counts once over the range.
    expect(await sessions(null)).toEqual([{ n: 3 }]);
  });

  it('hour and day boundaries are UTC: 10:59:59.999 is hour 10, 11:00:00.000 is hour 11, 23:59 and 00:00 are two days', async () => {
    await ch.insertEvents([
      { sid: S1, at: H(10, 59, 59, 999) },
      { sid: S2, at: H(11) },
      { sid: S3, at: H(23, 59) },
      { sid: S3, at: Date.UTC(2026, 9, 9, 0, 0) },
    ]);
    expect(await sessions('toString(hour)')).toEqual([
      { k: '2026-10-08 10:00:00', n: 1 }, { k: '2026-10-08 11:00:00', n: 1 }, { k: '2026-10-08 23:00:00', n: 1 }, { k: '2026-10-09 00:00:00', n: 1 },
    ]);
    expect(await sessions('toString(toStartOfDay(hour))')).toEqual([{ k: '2026-10-08 00:00:00', n: 3 }, { k: '2026-10-09 00:00:00', n: 1 }]);
  });

  it('the backfill fills events that predate the view, and running it again changes no count', async () => {
    await ch.run('DROP VIEW funnel_hourly_mv');
    await ch.insertEvents([{ sid: S1 }, { sid: S2, name: 'lead' }]);
    expect(await sessions(null)).toEqual([{ n: 0 }]);
    await ch.apply();
    await ch.apply(BACKFILL_DIR);
    await ch.apply(BACKFILL_DIR);
    expect(await sessions('name')).toEqual([{ k: 'lead', n: 1 }, { k: 'page_load', n: 1 }]);
    await ch.insertEvents([{ sid: S3 }]);
    expect(await sessions(null)).toEqual([{ n: 3 }]);
  });
});
```

`demo/test/stack.test.mjs` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/demo/test/stack.test.mjs b/demo/test/stack.test.mjs
index 7dddd3e..1310706 100644
--- a/demo/test/stack.test.mjs
+++ b/demo/test/stack.test.mjs
@@ -3,7 +3,7 @@ import { tmpdir } from 'node:os';
 import { join } from 'node:path';
 import { pathToFileURL } from 'node:url';
 import { describe, it, expect } from 'vitest';
-import { applyClickhouseDdl, lanIp } from '../lib/stack.mjs';
+import { applyClickhouseDdl, BACKFILL_DIR, lanIp } from '../lib/stack.mjs';
 
 const v4 = (address, internal = false) => ({ family: 'IPv4', address, internal });
 const v6 = (address) => ({ family: 'IPv6', address, internal: false });
@@ -39,4 +39,21 @@ describe('applyClickhouseDdl', () => {
     expect(files).toContain('001_events.sql');
     expect(seen[0]).toMatch(/CREATE TABLE IF NOT EXISTS events/);
   });
+  // Spec admin-console-p3 §1: 002 is a table and its materialized view in one file.
+  it('runs a file statement by statement; comment-only chunks are dropped', async () => {
+    const dir = mkdtempSync(join(tmpdir(), 'ddl-'));
+    writeFileSync(join(dir, '001_a.sql'), '-- table\nCREATE A (x String);\n\n-- view\nCREATE B AS SELECT 1;\n-- the end\n');
+    const seen = [];
+    await applyClickhouseDdl(async (sql) => seen.push(sql), pathToFileURL(`${dir}/`));
+    expect(seen).toEqual(['-- table\nCREATE A (x String)', '-- view\nCREATE B AS SELECT 1']);
+  });
+  it('the repo: 001 events, then 002 funnel_hourly and funnel_hourly_mv; the backfill fills funnel_hourly from events', async () => {
+    const seen = [];
+    expect(await applyClickhouseDdl(async (sql) => seen.push(sql))).toEqual(['001_events.sql', '002_funnel_hourly.sql']);
+    expect(seen.map((s) => /CREATE (?:TABLE|MATERIALIZED VIEW) IF NOT EXISTS (\w+)/.exec(s)[1])).toEqual(['events', 'funnel_hourly', 'funnel_hourly_mv']);
+    const backfill = [];
+    expect(await applyClickhouseDdl(async (sql) => backfill.push(sql), BACKFILL_DIR)).toEqual(['002_funnel_hourly.sql']);
+    expect(backfill).toHaveLength(1);
+    expect(backfill[0]).toMatch(/INSERT INTO funnel_hourly\nSELECT [\s\S]* FROM events FINAL/);
+  });
 });
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/funnel-hourly.test.js 2>&1 | grep -E "×|Error:|Test Files|Tests  "
npx vitest run --config demo/vitest.config.mjs demo/test/stack.test.mjs 2>&1 | grep -E "×|Tests  "
```

Expected: core `Error: Code: 60. DB::Exception: Table ikf.funnel_hourly does not exist. (UNKNOWN_TABLE)` (từ `beforeEach`), `Tests  6 failed (6)`; demo 2 test mới FAIL (`expected [ Array(1) ] to deeply equal [ …(2) ]`, `expected [ '001_events.sql' ] to deeply equal [ '001_events.sql', …(1) ]`), `Tests  2 failed | 5 passed (7)`.

- [ ] **Step 5: Implement**

`clickhouse/002_funnel_hourly.sql` (mới):

```sql
-- Admin console phase 3 (spec admin-console-p3 §1): sessions per funnel, UTC hour, version, event name, screen,
-- country, device and utm source/campaign, as uniqExact states of sid. A retried insert of the same event (events
-- only dedupes at merge time) adds the same sid to a set: sessions never count twice. Read with uniqExactMerge.
CREATE TABLE IF NOT EXISTS funnel_hourly (
  funnel LowCardinality(String),
  hour DateTime('UTC'),
  v UInt32,
  name LowCardinality(String),
  screen Nullable(Int32),
  country LowCardinality(String),
  ua_class LowCardinality(String),
  utm_source LowCardinality(String),
  utm_campaign LowCardinality(String),
  sessions AggregateFunction(uniqExact, String)
) ENGINE = AggregatingMergeTree
PARTITION BY toYYYYMM(hour)
ORDER BY (funnel, hour, v, name, screen, country, ua_class, utm_source, utm_campaign)
TTL hour + INTERVAL 13 MONTH
SETTINGS allow_nullable_key = 1;

-- Every insert into events from now on (the backfill in clickhouse/backfill/ covers what came before). The view runs
-- as the user who creates it (an admin that stays): the event consumer's ikf_writer keeps INSERT on events only;
-- without SQL SECURITY DEFINER its inserts would need SELECT on events and INSERT on funnel_hourly, and fail.
CREATE MATERIALIZED VIEW IF NOT EXISTS funnel_hourly_mv TO funnel_hourly
DEFINER = CURRENT_USER SQL SECURITY DEFINER AS
SELECT funnel, toStartOfHour(toDateTime(received_at, 'UTC')) AS hour, v, name, screen, country, ua_class,
       attr['utm_source'] AS utm_source, attr['utm_campaign'] AS utm_campaign, uniqExactState(sid) AS sessions
  FROM events
 GROUP BY funnel, hour, v, name, screen, country, ua_class, utm_source, utm_campaign;
```

`clickhouse/backfill/002_funnel_hourly.sql` (mới):

```sql
-- One-off backfill of funnel_hourly from the events that predate funnel_hourly_mv (runbook analytics.md).
-- Safe to run again, or while the view is live: the states are sets of sid, merging duplicates changes no count.
INSERT INTO funnel_hourly
SELECT funnel, toStartOfHour(toDateTime(received_at, 'UTC')) AS hour, v, name, screen, country, ua_class,
       attr['utm_source'] AS utm_source, attr['utm_campaign'] AS utm_campaign, uniqExactState(sid) AS sessions
  FROM events FINAL
 GROUP BY funnel, hour, v, name, screen, country, ua_class, utm_source, utm_campaign;
```

`demo/lib/stack.mjs` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/demo/lib/stack.mjs b/demo/lib/stack.mjs
index 7467f0b..a8cdcd7 100644
--- a/demo/lib/stack.mjs
+++ b/demo/lib/stack.mjs
@@ -26,12 +26,18 @@ export const ADMIN_DEMO_HOST = 'demo.localhost';
 export const PG = { host: '127.0.0.1', port: 54329, database: 'ikf', user: 'ikf', password: 'ikf' };
 export const CH = { url: 'http://127.0.0.1:18123', user: 'ikf', password: 'ikf', database: 'ikf' };
 const DDL_DIR = new URL('../../clickhouse/', import.meta.url);
+// One-off INSERT … SELECT backfills (clickhouse/backfill/*.sql); each is safe to re-run (spec admin-console-p3 §4).
+export const BACKFILL_DIR = new URL('../../clickhouse/backfill/', import.meta.url);
 
-// Every clickhouse/*.sql in lexical order (the files are CREATE ... IF NOT EXISTS, so re-runs are no-ops).
-// A file that is not idempotent (a bare ALTER) must be made so before it lands there.
+// The statements of one .sql file: ClickHouse's HTTP interface takes one per request. A statement ends with ";"
+// at the end of a line; chunks with nothing but comments are dropped.
+export const sqlStatements = (sql) => sql.split(/;\s*(?:\n|$)/).filter((s) => s.replace(/--.*$/gm, '').trim());
+
+// Every clickhouse/*.sql in lexical order, statement by statement (the files are CREATE ... IF NOT EXISTS, so
+// re-runs are no-ops). A file that is not idempotent (a bare ALTER) must be made so before it lands there.
 export async function applyClickhouseDdl(run = clickhouse, dir = DDL_DIR) {
   const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
-  for (const f of files) await run(await readFile(new URL(f, dir), 'utf8'));
+  for (const f of files) for (const sql of sqlStatements(await readFile(new URL(f, dir), 'utf8'))) await run(sql);
   return files;
 }
 
@@ -136,6 +142,7 @@ export async function startStack({
     if (chDatabase !== CH.database) await clickhouse(`CREATE DATABASE IF NOT EXISTS ${chDatabase}`);
     const chRun = (sql, opts) => clickhouse(sql, { ...opts, database: chDatabase });
     await applyClickhouseDdl(chRun);
+    await applyClickhouseDdl(chRun, BACKFILL_DIR);
 
     const ip = lan ? lanIp() : null;
     const media = await startMediaServer({ dirs: new Map(chosen.map((f) => [f.slug, f.dir])), port: ports.media });
PATCH
```

- [ ] **Step 6: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/funnel-hourly.test.js 2>&1 | grep -E "Tests  "
npx vitest run --config demo/vitest.config.mjs demo/test/stack.test.mjs 2>&1 | grep -E "Tests  "
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
npm run demo:test 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  6 passed (6)`; `Tests  7 passed (7)`; core-api `Test Files  53 passed (53)`, `Tests  498 passed (498)`; demo `Test Files  20 passed (20)`, `Tests  117 passed (117)` (stack demo thật apply `002` từng statement + backfill trên ClickHouse của compose).

- [ ] **Step 7: Commit**

```bash
git add clickhouse demo services/core-api package-lock.json
git commit -m "feat: ClickHouse funnel_hourly (AggregatingMergeTree + MV, uniqExact sessions) with backfill; demo applies DDL statement by statement"
```

---

### Task 2: Client đọc ClickHouse `src/analytics/clickhouse.js`; `analyticsDeps` (secrets, `CLICKHOUSE_DATABASE`); nối vào `server.js`

**Files:**
- Create: `services/core-api/src/analytics/clickhouse.js`, `services/core-api/src/analytics/setup.js`
- Modify: `services/core-api/src/config.js`, `services/core-api/src/server.js`
- Test: `services/core-api/test/analytics-client.test.js`, `services/core-api/test/analytics-setup.test.js` (mới); Modify: `services/core-api/test/config.test.js`

**Interfaces:**
- Consumes: `startClickhouse()` (Task 1); `loadConfig(env)`, `loadSecrets(prefix, names)` (`src/config.js`, `src/secrets.js`); `log` của `server.js` (`log.error(obj, msg)`).
- Produces: `CLICKHOUSE_TIMEOUT_MS = 10_000`; `class ClickhouseError extends Error {kind: 'auth'|'client'|'unavailable', status: number|null}` (message `clickhouse <kind> (HTTP <status>)`); `createClickhouse({url, user, password, database, fetch, timeoutMs})` → `{query(sql, params = {}) → Promise<row[]>}` (POST `<url>/?database=<db>&default_format=JSONEachRow&param_<k>=<v>`, Basic auth, 1 retry khi `unavailable`). `ANALYTICS_SECRETS = ['clickhouse-url', 'clickhouse-reader-user', 'clickhouse-reader-password']`; `analyticsDeps({config: {clickhouseDatabase}, secrets, prefix, fetch, log})` → `{deps: {clickhouse}, missing: []}` | `{deps: null, missing: [prefix + name…]}` (+ `log.error({missing}, 'analytics disabled, missing: …')`). `loadConfig(env).analytics = {clickhouseDatabase: env.CLICKHOUSE_DATABASE || 'ikf'}`. `server.js` nạp thêm 3 secret và trải `...analytics.deps` vào `buildApp`.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/analytics-client.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ClickhouseError, createClickhouse } from '../src/analytics/clickhouse.js';
import { startClickhouse } from './helpers/clickhouse.js';

// A fetch that answers from a list (a Response, an Error to throw, or 'hang' to wait for the abort) and records calls.
function fakeFetch(...answers) {
  const calls = [];
  const f = async (url, init) => {
    calls.push({ url, init });
    const a = answers.shift();
    if (a === 'hang') {
      return new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(init.signal.reason)));
    }
    if (a instanceof Error) throw a;
    return a;
  };
  f.calls = calls;
  return f;
}
const text = (status, body = '') => new Response(body, { status });
const client = (fetch, extra = {}) => createClickhouse({ url: 'https://ch.example:8443/', user: 'ikf_reader', password: 'pw', database: 'ikf', fetch, ...extra });

// Spec admin-console-p3 §2: the read client (POST, param_*, JSONEachRow, Basic auth, one retry, ClickhouseError(kind)).
describe('createClickhouse (fake fetch)', () => {
  it('POSTs the SQL with database, JSONEachRow and param_* in the URL, Basic auth; parses the rows', async () => {
    const f = fakeFetch(text(200, '{"funnel":"aivideo","n":3}\n{"funnel":"tarot","n":1}\n'));
    const rows = await client(f).query('SELECT funnel, count() AS n FROM events WHERE funnel = {slug:String} GROUP BY funnel', { slug: 'aivideo', v: 2 });
    expect(rows).toEqual([{ funnel: 'aivideo', n: 3 }, { funnel: 'tarot', n: 1 }]);
    expect(f.calls).toHaveLength(1);
    const { url, init } = f.calls[0];
    expect(url).toBe('https://ch.example:8443/?database=ikf&default_format=JSONEachRow&param_slug=aivideo&param_v=2');
    expect(init.method).toBe('POST');
    expect(init.body).toBe('SELECT funnel, count() AS n FROM events WHERE funnel = {slug:String} GROUP BY funnel');
    expect(init.headers.authorization).toBe(`Basic ${btoa('ikf_reader:pw')}`);
    expect(await client(fakeFetch(text(200, ''))).query('SELECT 1 WHERE 0')).toEqual([]);
  });

  it('one retry on 5xx, a network error or a timeout; twice → unavailable', async () => {
    const ok = text(200, '{"x":1}\n');
    const flaky = fakeFetch(text(503), ok);
    expect(await client(flaky).query('SELECT 1 AS x')).toEqual([{ x: 1 }]);
    expect(flaky.calls).toHaveLength(2);
    for (const answers of [[text(500), text(502)], [new TypeError('fetch failed'), new TypeError('fetch failed')], ['hang', 'hang']]) {
      const f = fakeFetch(...answers);
      const err = await client(f, { timeoutMs: 20 }).query('SELECT 1').catch((e) => e);
      expect(err).toBeInstanceOf(ClickhouseError);
      expect(err.kind).toBe('unavailable');
      expect(f.calls).toHaveLength(2);
    }
  });

  it('401/403 → auth, other 4xx → client: never retried; the message never carries the body or the SQL', async () => {
    for (const [status, kind] of [[401, 'auth'], [403, 'auth'], [400, 'client'], [404, 'client']]) {
      const f = fakeFetch(text(status, 'Code: 62. Syntax error near secret_sql'));
      const err = await client(f).query('SELECT secret_sql').catch((e) => e);
      expect([err.kind, err.status, f.calls.length]).toEqual([kind, status, 1]);
      expect(err.message).toBe(`clickhouse ${kind} (HTTP ${status})`);
    }
    const net = await client(fakeFetch(new TypeError('connect ECONNREFUSED 10.0.0.1:8443'), new TypeError('connect ECONNREFUSED 10.0.0.1:8443'))).query('SELECT 1').catch((e) => e);
    expect(net.message).toBe('clickhouse unavailable');
  });
});

describe('createClickhouse (real ClickHouse)', () => {
  let ch;
  beforeAll(async () => {
    ch = await startClickhouse();
  });
  afterAll(() => ch?.stop());

  it('typed params, numbers as numbers; a wrong password is auth, bad SQL is client', async () => {
    const c = createClickhouse({ url: ch.url, user: ch.user, password: ch.password, database: 'ikf' });
    expect(await c.query("SELECT {slug:String} AS slug, toUInt64({n:UInt32}) * 2 AS n, toDateTime({at:DateTime('UTC')}, 'UTC') AS at", { slug: 'a-b', n: 21, at: '2026-10-08 10:00:00' }))
      .toEqual([{ slug: 'a-b', n: 42, at: '2026-10-08 10:00:00' }]);
    await expect(createClickhouse({ url: ch.url, user: ch.user, password: 'wrong', database: 'ikf' }).query('SELECT 1')).rejects.toMatchObject({ kind: 'auth' });
    await expect(c.query('SELEC 1')).rejects.toMatchObject({ kind: 'client', status: 400 });
  });
});
```

`services/core-api/test/analytics-setup.test.js` (mới):

```js
import { describe, it, expect } from 'vitest';
import { ANALYTICS_SECRETS, analyticsDeps } from '../src/analytics/setup.js';
import { loadConfig } from '../src/config.js';

const SECRETS = { 'clickhouse-url': 'https://ch.example:8443', 'clickhouse-reader-user': 'ikf_reader', 'clickhouse-reader-password': 'pw' };
const ENV = {
  DB_HOST: 'proxy', DB_USER: 'u', DB_PASSWORD: 'p', DB_SECRET_ARN: 'arn:db-secret', REDIS_HOST: 'r', CF_ACCOUNT_ID: 'acc', R2_BUCKET: 'b',
  KV_NAMESPACE_ID: 'ns', MEDIA_ORIGINS: 'https://media.test/', PREVIEW_BASE_URL: 'https://preview.test', SECRETS_PREFIX: 'ikf/staging/',
  APP_ENV: 'staging', PADDLE_ENV: 'sandbox', WEBHOOK_QUEUE_URL: 'https://sqs.test/q',
};
const logger = () => {
  const lines = [];
  return { lines, error: (o, m) => lines.push([m, o]) };
};

// Spec admin-console-p3 §2 "Config và secret".
describe('analyticsDeps', () => {
  it('three secrets → a ClickHouse client on CLICKHOUSE_DATABASE', async () => {
    expect(ANALYTICS_SECRETS).toEqual(['clickhouse-url', 'clickhouse-reader-user', 'clickhouse-reader-password']);
    const calls = [];
    const fetch = async (url, init) => {
      calls.push([url, init.headers.authorization]);
      return new Response('{"x":1}\n');
    };
    const log = logger();
    const a = analyticsDeps({ config: { clickhouseDatabase: 'ikf_staging' }, secrets: SECRETS, prefix: 'ikf/staging/', fetch, log });
    expect(a.missing).toEqual([]);
    expect(Object.keys(a.deps)).toEqual(['clickhouse']);
    expect(await a.deps.clickhouse.query('SELECT 1 AS x')).toEqual([{ x: 1 }]);
    expect(calls).toEqual([['https://ch.example:8443/?database=ikf_staging&default_format=JSONEachRow', `Basic ${btoa('ikf_reader:pw')}`]]);
    expect(log.lines).toEqual([]);
  });

  it('a missing (or empty) secret: analytics off, the missing names logged, nothing thrown', () => {
    const log = logger();
    const a = analyticsDeps({ config: { clickhouseDatabase: 'ikf' }, secrets: { 'clickhouse-url': 'https://ch.example', 'clickhouse-reader-user': '' }, prefix: 'ikf/prod/', log });
    expect(a).toEqual({ deps: null, missing: ['ikf/prod/clickhouse-reader-user', 'ikf/prod/clickhouse-reader-password'] });
    expect(log.lines).toEqual([['analytics disabled, missing: ikf/prod/clickhouse-reader-user, ikf/prod/clickhouse-reader-password', { missing: a.missing }]]);
  });

  it('loadConfig: CLICKHOUSE_DATABASE, default ikf', () => {
    expect(loadConfig(ENV).analytics).toEqual({ clickhouseDatabase: 'ikf' });
    expect(loadConfig({ ...ENV, CLICKHOUSE_DATABASE: 'ikf_staging' }).analytics).toEqual({ clickhouseDatabase: 'ikf_staging' });
  });
});
```

`services/core-api/test/config.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/test/config.test.js b/services/core-api/test/config.test.js
index 47d3df1..ab1037d 100644
--- a/services/core-api/test/config.test.js
+++ b/services/core-api/test/config.test.js
@@ -37,6 +37,7 @@ describe('loadConfig', () => {
         alarmTopicArn: 'arn:aws:sns:us-east-1:111111111111:ikf-staging-alarms',
       },
       admin: { appEnv: 'staging', localUser: null, origin: null, apiOrigin: null, googleClientId: null },
+      analytics: { clickhouseDatabase: 'ikf' },
     });
   });
 
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/analytics-client.test.js test/analytics-setup.test.js test/config.test.js 2>&1 | grep -E "×|^Error|Test Files|Tests  "
```

Expected: `Error: Cannot find module '../src/analytics/clickhouse.js'`, `Error: Cannot find module '../src/analytics/setup.js'`, `× loadConfig > parses the environment`; `Test Files  3 failed (3)`, `Tests  1 failed | 9 passed (10)`.

- [ ] **Step 3: Implement**

`services/core-api/src/analytics/clickhouse.js` (mới):

```js
// Read-only ClickHouse client for the admin console's analytics (spec admin-console-p3 §2): one POST per query,
// typed parameters as param_<name> ({name:Type} in the SQL), rows as JSONEachRow. Plain fetch, no dependency.
export const CLICKHOUSE_TIMEOUT_MS = 10_000;

// kind: 'auth' (401/403: the reader's credentials), 'client' (other 4xx: our SQL), 'unavailable' (5xx, network,
// timeout). The message carries the kind and status only: never the response body, the SQL or its parameters.
export class ClickhouseError extends Error {
  constructor(kind, status = null) {
    super(`clickhouse ${kind}${status ? ` (HTTP ${status})` : ''}`);
    this.name = 'ClickhouseError';
    this.kind = kind;
    this.status = status;
  }
}

export function createClickhouse({ url, user, password, database, fetch = globalThis.fetch, timeoutMs = CLICKHOUSE_TIMEOUT_MS }) {
  const base = url.replace(/\/+$/, '');
  const authorization = `Basic ${btoa(`${user}:${password}`)}`;

  async function once(sql, params) {
    const qs = new URLSearchParams({ database, default_format: 'JSONEachRow' });
    for (const [k, v] of Object.entries(params)) qs.set(`param_${k}`, String(v));
    let body;
    try {
      const res = await fetch(`${base}/?${qs}`, { method: 'POST', headers: { authorization }, body: sql, signal: AbortSignal.timeout(timeoutMs) });
      if (res.status === 401 || res.status === 403) throw new ClickhouseError('auth', res.status);
      if (res.status >= 500) throw new ClickhouseError('unavailable', res.status);
      if (!res.ok) throw new ClickhouseError('client', res.status);
      body = await res.text();
    } catch (err) {
      if (err instanceof ClickhouseError) throw err;
      throw new ClickhouseError('unavailable');
    }
    return body.split('\n').filter(Boolean).map((line) => JSON.parse(line));
  }

  return {
    // One retry when ClickHouse is unavailable (5xx, network, timeout); auth and client errors are final.
    async query(sql, params = {}) {
      try {
        return await once(sql, params);
      } catch (err) {
        if (err.kind !== 'unavailable') throw err;
        return once(sql, params);
      }
    },
  };
}
```

`services/core-api/src/analytics/setup.js` (mới):

```js
import { createClickhouse } from './clickhouse.js';

export const ANALYTICS_SECRETS = ['clickhouse-url', 'clickhouse-reader-user', 'clickhouse-reader-password'];

// The admin console's analytics (spec admin-console-p3 §2): a read-only ClickHouse user. A missing secret value
// turns analytics off (its routes are not registered, the console shows "chưa bật"); every other route keeps working.
export function analyticsDeps({ config, secrets, prefix = '', fetch = globalThis.fetch, log }) {
  const missing = ANALYTICS_SECRETS.filter((n) => !secrets[n]).map((n) => prefix + n);
  if (missing.length) {
    log.error({ missing }, `analytics disabled, missing: ${missing.join(', ')}`);
    return { deps: null, missing };
  }
  return {
    missing,
    deps: {
      clickhouse: createClickhouse({
        url: secrets['clickhouse-url'],
        user: secrets['clickhouse-reader-user'],
        password: secrets['clickhouse-reader-password'],
        database: config.clickhouseDatabase,
        fetch,
      }),
    },
  };
}
```

`services/core-api/src/config.js`, `services/core-api/src/server.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/config.js b/services/core-api/src/config.js
index 0b69a36..bc0c8e9 100644
--- a/services/core-api/src/config.js
+++ b/services/core-api/src/config.js
@@ -60,5 +60,7 @@ export function loadConfig(env = process.env) {
       apiOrigin: origin(env, 'API_ORIGIN'),
       googleClientId: env.GOOGLE_OAUTH_CLIENT_ID || null,
     },
+    // Admin console analytics (spec admin-console-p3 §2): the ClickHouse database the reader queries.
+    analytics: { clickhouseDatabase: env.CLICKHOUSE_DATABASE || 'ikf' },
   };
 }
diff --git a/services/core-api/src/server.js b/services/core-api/src/server.js
index 1fe106d..70d37ec 100644
--- a/services/core-api/src/server.js
+++ b/services/core-api/src/server.js
@@ -18,6 +18,7 @@ import { BILLING_SECRETS, billingDeps } from './billing/setup.js';
 import { syncMessage } from './billing/sync.js';
 import { IDENTITY_SECRETS, identityDeps } from './identity/setup.js';
 import { ADMIN_SECRETS, adminDeps } from './admin/setup.js';
+import { ANALYTICS_SECRETS, analyticsDeps } from './analytics/setup.js';
 import { startSessionSweep } from './admin/sweep.js';
 import { startEntitlementSync } from './identity/sync.js';
 import { startWebhookSender } from './identity/webhooks.js';
@@ -25,7 +26,7 @@ import { startWebhookSender } from './identity/webhooks.js';
 const REQUIRED_SECRETS = ['cf-kv-api-token', 'r2-access-key-id', 'r2-secret-access-key'];
 
 const config = loadConfig();
-const secrets = await loadSecrets(config.secretsPrefix, [...REQUIRED_SECRETS, 'bootstrap-admin-token', ...BILLING_SECRETS, ...IDENTITY_SECRETS, ...ADMIN_SECRETS]);
+const secrets = await loadSecrets(config.secretsPrefix, [...REQUIRED_SECRETS, 'bootstrap-admin-token', ...BILLING_SECRETS, ...IDENTITY_SECRETS, ...ADMIN_SECRETS, ...ANALYTICS_SECRETS]);
 const missing = REQUIRED_SECRETS.filter((n) => !secrets[n]);
 if (missing.length) {
   console.error(`missing secret values: ${missing.map((n) => config.secretsPrefix + n).join(', ')}`);
@@ -104,13 +105,16 @@ if (!admin.deps) {
   console.error(`admin console disabled, missing: ${admin.missing.join(', ')}`);
 }
 
+// Dashboard analytics off until the three ClickHouse reader values are entered (logged inside).
+const analytics = analyticsDeps({ config: config.analytics, secrets, prefix: config.secretsPrefix, log });
+
 const app = buildApp({
   logger: true,
   checks: {
     db: () => pool.query('select 1'),
     cache: () => redis.ping(),
   },
-  deps: { pool, store, kv, mediaOrigins: config.mediaOrigins, previewBaseUrl: config.previewBaseUrl, ...billing.deps, ...identity.deps, ...admin.deps },
+  deps: { pool, store, kv, mediaOrigins: config.mediaOrigins, previewBaseUrl: config.previewBaseUrl, ...billing.deps, ...identity.deps, ...admin.deps, ...analytics.deps },
 });
 
 const stopResync = startResync({ pool, kv, log: app.log });
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/analytics-client.test.js test/analytics-setup.test.js test/config.test.js 2>&1 | grep -E "Tests  "
node --check services/core-api/src/server.js
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  17 passed (17)` (gồm round-trip ClickHouse thật: tham số có kiểu, số là số; sai mật khẩu → `auth`; `SELEC 1` → `client` 400); `server.js` không lỗi cú pháp; core-api `Test Files  55 passed (55)`, `Tests  505 passed (505)`.

- [ ] **Step 5: Commit**

```bash
git add services/core-api
git commit -m "feat(core-api): read-only ClickHouse client (param_*, JSONEachRow, one retry, ClickhouseError kind) and analytics setup (CLICKHOUSE_DATABASE, reader secrets)"
```

---

### Task 3: `src/analytics/queries.js` — SQL ClickHouse trên `funnel_hourly`

**Files:**
- Create: `services/core-api/src/analytics/queries.js`
- Test: `services/core-api/test/analytics-queries.test.js` (mới)

**Interfaces:**
- Consumes: `createClickhouse` (Task 2), `startClickhouse().insertEvents` (Task 1), bảng `funnel_hourly` (Task 1).
- Produces (mọi hàm nhận `ch = {query}` và `q = {slug, from: Date, to: Date, by: 'hour'|'day', v: number|null, dim}`; `to` loại trừ; mọi số là số phiên): `MILESTONE_EVENTS = {page_load: 'page_load', leads: 'lead', checkout_click: 'checkout_click', checkout_complete: 'checkout_complete'}`, `STEP_EVENT = 'screen_view'`, `DIMENSIONS = ['v', 'utm_source', 'utm_campaign', 'country', 'ua_class']`, `BREAKDOWN_LIMIT = 50`, `chTime(date)` → `'YYYY-MM-DD hh:mm:ss'`; `eventSeries(ch, q)` → `[{t (epoch ms), sessions, page_load, leads, checkout_click, checkout_complete}]` (chỉ bucket có sự kiện); `eventTotals(ch, q)` → `{sessions, page_load, leads, checkout_click, checkout_complete}`; `screenSteps(ch, q)` → `[{screen, sessions}]`; `otherEvents(ch, q)` → `[{name, sessions}]` (tối đa 200); `versionsSeen(ch, q)` → `[v…]` (bỏ qua `q.v`); `eventBreakdown(ch, q)` → `[{key (chữ), sessions, leads, checkout_complete}]` (≤ 50, `Error('unknown dimension …')` nếu `dim` lạ); `eventOverview(ch, {from, to})` → `[{slug, sessions, leads}]`.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/analytics-queries.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  BREAKDOWN_LIMIT, chTime, eventBreakdown, eventOverview, eventSeries, eventTotals, otherEvents, screenSteps, versionsSeen,
} from '../src/analytics/queries.js';
import { createClickhouse } from '../src/analytics/clickhouse.js';
import { startClickhouse } from './helpers/clickhouse.js';

// 2026-09-30 22:00 UTC: the range crosses the September → October partition boundary.
const T0 = Date.UTC(2026, 8, 30, 22);
const at = (h, m = 0) => T0 + h * 3_600_000 + m * 60_000;
const sid = (n) => `01JA00000000000000000000${String(n).padStart(2, '0')}`;
const FROM = new Date(T0);
const TO = new Date(at(4));

// One session's walk: page_load, screen_view 0..depth-1, then the milestones it reached.
function walk(n, { depth, lead = false, click = false, complete = false, v = 1, h = 0, utm = {}, country = 'VN', ua = 'mobile', funnel = 'aivideo' }) {
  const base = { sid: sid(n), v, attr: utm, country, ua_class: ua, funnel };
  return [
    { ...base, name: 'page_load', at: at(h, 1) },
    ...Array.from({ length: depth }, (_, k) => ({ ...base, name: 'screen_view', screen: k, at: at(h, 2 + k) })),
    ...(lead ? [{ ...base, name: 'lead', at: at(h, 20) }] : []),
    ...(click ? [{ ...base, name: 'checkout_click', at: at(h, 21) }] : []),
    ...(complete ? [{ ...base, name: 'checkout_complete', at: at(h, 22) }] : []),
  ];
}

// Spec admin-console-p3 §1 "Số liệu từ ClickHouse": every count is distinct sessions, read with uniqExactMerge.
describe('analytics queries (real ClickHouse)', () => {
  let ch;
  let c;
  const q = (extra = {}) => ({ slug: 'aivideo', from: FROM, to: TO, by: 'hour', v: null, ...extra });

  beforeAll(async () => {
    ch = await startClickhouse();
    await ch.apply();
    c = createClickhouse({ url: ch.url, user: ch.user, password: ch.password, database: 'ikf' });
    const events = [
      ...walk(1, { depth: 4, lead: true, click: true, complete: true, utm: { utm_source: 'meta', utm_campaign: 'spring' } }),
      ...walk(2, { depth: 3, lead: true, click: true, utm: { utm_source: 'meta', utm_campaign: 'spring' }, country: 'US' }),
      ...walk(3, { depth: 2, h: 1, utm: { utm_source: 'tiktok' }, ua: 'desktop' }),
      ...walk(4, { depth: 4, lead: true, h: 2, v: 2 }), // 2026-10-01 00:xx: October partition
      ...walk(5, { depth: 1, h: 3, v: 2 }),
      ...walk(6, { depth: 2, funnel: 'tarot' }),
      { sid: sid(3), name: 'quiz_done', at: at(1, 30), attr: { utm_source: 'tiktok' }, ua_class: 'desktop' },
      { sid: sid(4), name: 'quiz_done', at: at(2, 30), v: 2 },
      { sid: sid(4), name: 'screen_view', screen: null, at: at(2, 31), v: 2 }, // a screen_view without a screen
      { sid: sid(9), name: 'page_load', at: at(4) }, // at `to`: outside the range
      { sid: sid(8), name: 'page_load', at: at(-1) }, // before `from`
    ];
    await ch.insertEvents(events);
    // A retried batch: one event of the first session twice, same id.
    await ch.insertEvents([{ id: '01JA0000000000000000000DUP', sid: sid(1), name: 'lead', at: at(0, 20), attr: { utm_source: 'meta', utm_campaign: 'spring' } }]);
    await ch.insertEvents([{ id: '01JA0000000000000000000DUP', sid: sid(1), name: 'lead', at: at(0, 20), attr: { utm_source: 'meta', utm_campaign: 'spring' } }]);
    // Funnel `many`: 55 campaigns, one of them with two sessions.
    const many = Array.from({ length: 55 }, (_, i) => ({ sid: `01JB${String(i).padStart(22, '0')}`, funnel: 'many', at: at(0), attr: { utm_campaign: `c${String(i).padStart(2, '0')}` } }));
    many.push({ sid: '01JC0000000000000000000000', funnel: 'many', at: at(0), attr: { utm_campaign: 'c54' } });
    await ch.insertEvents(many);
  });
  afterAll(() => ch?.stop());

  it('chTime: a Date as ClickHouse DateTime text (UTC, seconds)', () => {
    expect(chTime(new Date('2026-10-01T00:00:00.999Z'))).toBe('2026-10-01 00:00:00');
  });

  it('totals: sessions with any event and per milestone; a range that crosses a month partition counts both sides', async () => {
    expect(await eventTotals(c, q())).toEqual({ sessions: 5, page_load: 5, leads: 3, checkout_click: 2, checkout_complete: 1 });
  });

  it('series by hour and by day, UTC buckets as epoch ms, `to` exclusive', async () => {
    expect(await eventSeries(c, q())).toEqual([
      { t: at(0), sessions: 2, page_load: 2, leads: 2, checkout_click: 2, checkout_complete: 1 },
      { t: at(1), sessions: 1, page_load: 1, leads: 0, checkout_click: 0, checkout_complete: 0 },
      { t: at(2), sessions: 1, page_load: 1, leads: 1, checkout_click: 0, checkout_complete: 0 },
      { t: at(3), sessions: 1, page_load: 1, leads: 0, checkout_click: 0, checkout_complete: 0 },
    ]);
    expect(await eventSeries(c, q({ by: 'day' }))).toEqual([
      { t: Date.UTC(2026, 8, 30), sessions: 3, page_load: 3, leads: 2, checkout_click: 2, checkout_complete: 1 },
      { t: Date.UTC(2026, 9, 1), sessions: 2, page_load: 2, leads: 1, checkout_click: 0, checkout_complete: 0 },
    ]);
  });

  it('steps: sessions per screen of screen_view (not cumulative), a screen_view without a screen left out', async () => {
    expect(await screenSteps(c, q())).toEqual([{ screen: 0, sessions: 5 }, { screen: 1, sessions: 4 }, { screen: 2, sessions: 3 }, { screen: 3, sessions: 2 }]);
  });

  it('other events: every free-form name that is not a milestone or screen_view', async () => {
    expect(await otherEvents(c, q())).toEqual([{ name: 'quiz_done', sessions: 2 }]);
  });

  it('the v filter; a version with no events is all zeros and empty lists; versions seen ignore the filter', async () => {
    expect(await eventTotals(c, q({ v: 2 }))).toEqual({ sessions: 2, page_load: 2, leads: 1, checkout_click: 0, checkout_complete: 0 });
    expect(await eventTotals(c, q({ v: 7 }))).toEqual({ sessions: 0, page_load: 0, leads: 0, checkout_click: 0, checkout_complete: 0 });
    expect(await eventSeries(c, q({ v: 7 }))).toEqual([]);
    expect(await screenSteps(c, q({ v: 7 }))).toEqual([]);
    expect(await versionsSeen(c, q({ v: 7 }))).toEqual([1, 2]);
  });

  it('breakdown by each dimension: key, sessions, leads, checkout_complete; empty utm is the key ""', async () => {
    const b = (dim, extra) => eventBreakdown(c, q({ dim, ...extra }));
    expect(await b('v')).toEqual([
      { key: '1', sessions: 3, leads: 2, checkout_complete: 1 },
      { key: '2', sessions: 2, leads: 1, checkout_complete: 0 },
    ]);
    expect(await b('utm_source')).toEqual([
      { key: '', sessions: 2, leads: 1, checkout_complete: 0 },
      { key: 'meta', sessions: 2, leads: 2, checkout_complete: 1 },
      { key: 'tiktok', sessions: 1, leads: 0, checkout_complete: 0 },
    ]);
    expect(await b('utm_campaign', { v: 1 })).toEqual([
      { key: 'spring', sessions: 2, leads: 2, checkout_complete: 1 },
      { key: '', sessions: 1, leads: 0, checkout_complete: 0 },
    ]);
    expect((await b('country')).map((r) => [r.key, r.sessions])).toEqual([['VN', 4], ['US', 1]]);
    expect((await b('ua_class')).map((r) => [r.key, r.sessions])).toEqual([['mobile', 4], ['desktop', 1]]);
    await expect(b('ip_hash')).rejects.toThrow(/unknown dimension/);
  });

  it(`breakdown keeps the ${BREAKDOWN_LIMIT} biggest keys`, async () => {
    const rows = await eventBreakdown(c, q({ slug: 'many', dim: 'utm_campaign' }));
    expect(rows).toHaveLength(50);
    expect(rows.slice(0, 3).map((r) => [r.key, r.sessions])).toEqual([['c54', 2], ['c00', 1], ['c01', 1]]);
  });

  it('overview: sessions and leads per funnel in the range, most sessions first', async () => {
    expect(await eventOverview(c, { from: FROM, to: TO })).toEqual([
      { slug: 'many', sessions: 56, leads: 0 },
      { slug: 'aivideo', sessions: 5, leads: 3 },
      { slug: 'tarot', sessions: 1, leads: 0 },
    ]);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/analytics-queries.test.js 2>&1 | grep -E "×|^Error|Test Files|Tests  "
```

Expected: `Error: Cannot find module '../src/analytics/queries.js'`, `Test Files  1 failed (1)`, `Tests  no tests`.

- [ ] **Step 3: Implement**

`services/core-api/src/analytics/queries.js` (mới):

```js
// ClickHouse side of the dashboard (spec admin-console-p3 §1): every count is distinct sessions (sid), merged
// from funnel_hourly's uniqExact states. q = {slug, from: Date, to: Date (exclusive, whole hours), by, v, dim}.
// The states are always read as h.sessions: a bare `sessions` after `… AS sessions` would be that alias (a number).
export const MILESTONE_EVENTS = { page_load: 'page_load', leads: 'lead', checkout_click: 'checkout_click', checkout_complete: 'checkout_complete' };
export const STEP_EVENT = 'screen_view';
export const DIMENSIONS = ['v', 'utm_source', 'utm_campaign', 'country', 'ua_class'];
export const BREAKDOWN_LIMIT = 50;
const OTHER_EVENTS_LIMIT = 200;

// A Date as the text of a DateTime('UTC') parameter.
export const chTime = (d) => d.toISOString().slice(0, 19).replace('T', ' ');

const params = ({ slug, from, to, v }) => ({ ...(slug !== undefined && { funnel: slug }), from: chTime(from), to: chTime(to), ...(v && { v }) });
const where = ({ slug, v }) =>
  `${slug !== undefined ? 'funnel = {funnel:String} AND ' : ''}hour >= {from:DateTime('UTC')} AND hour < {to:DateTime('UTC')}${v ? ' AND v = {v:UInt32}' : ''}`;
const COUNTS = [
  'uniqExactMerge(h.sessions) AS sessions',
  ...Object.entries(MILESTONE_EVENTS).map(([as, name]) => `uniqExactMergeIf(h.sessions, name = '${name}') AS ${as}`),
].join(', ');
const KNOWN = [...Object.values(MILESTONE_EVENTS), STEP_EVENT].map((n) => `'${n}'`).join(', ');

// Sessions and milestones per bucket (epoch ms of the UTC hour or day); buckets without events are absent.
export async function eventSeries(ch, q) {
  const bucket = q.by === 'day' ? 'toStartOfDay(hour)' : 'hour';
  const rows = await ch.query(`SELECT toUnixTimestamp(${bucket}) AS t, ${COUNTS} FROM funnel_hourly AS h WHERE ${where(q)} GROUP BY t ORDER BY t`, params(q));
  return rows.map((r) => ({ ...r, t: r.t * 1000 }));
}

// Over the whole range (a session seen in two buckets counts once).
export async function eventTotals(ch, q) {
  const [row] = await ch.query(`SELECT ${COUNTS} FROM funnel_hourly AS h WHERE ${where(q)}`, params(q));
  return row;
}

// Sessions that viewed screen k (not "k or later": funnels can skip screens), by screen.
export async function screenSteps(ch, q) {
  return ch.query(
    `SELECT screen, uniqExactMerge(h.sessions) AS sessions FROM funnel_hourly AS h
      WHERE ${where(q)} AND name = '${STEP_EVENT}' AND screen IS NOT NULL GROUP BY screen ORDER BY screen`,
    params(q),
  );
}

// Every other event name (funnels name their own), most sessions first.
export async function otherEvents(ch, q) {
  return ch.query(
    `SELECT name, uniqExactMerge(h.sessions) AS sessions FROM funnel_hourly AS h
      WHERE ${where(q)} AND name NOT IN (${KNOWN}) GROUP BY name ORDER BY sessions DESC, name LIMIT ${OTHER_EVENTS_LIMIT}`,
    params(q),
  );
}

// Versions with events in the range (the version filter's choices; ignores q.v).
export async function versionsSeen(ch, q) {
  const rows = await ch.query(`SELECT DISTINCT v FROM funnel_hourly AS h WHERE ${where({ ...q, v: null })} ORDER BY v`, params({ ...q, v: null }));
  return rows.map((r) => r.v);
}

// One row per value of the dimension (v as text), the BREAKDOWN_LIMIT with most sessions.
export async function eventBreakdown(ch, q) {
  if (!DIMENSIONS.includes(q.dim)) throw new Error(`unknown dimension ${q.dim}`);
  const key = q.dim === 'v' ? 'toString(v)' : q.dim;
  return ch.query(
    `SELECT ${key} AS key, uniqExactMerge(h.sessions) AS sessions, uniqExactMergeIf(h.sessions, name = 'lead') AS leads,
            uniqExactMergeIf(h.sessions, name = 'checkout_complete') AS checkout_complete
       FROM funnel_hourly AS h WHERE ${where(q)} GROUP BY key ORDER BY sessions DESC, key LIMIT ${BREAKDOWN_LIMIT}`,
    params(q),
  );
}

// Every funnel with events in the range: sessions and leads.
export async function eventOverview(ch, { from, to }) {
  return ch.query(
    `SELECT funnel AS slug, uniqExactMerge(h.sessions) AS sessions, uniqExactMergeIf(h.sessions, name = 'lead') AS leads
       FROM funnel_hourly AS h WHERE ${where({ from, to })} GROUP BY funnel ORDER BY sessions DESC, slug`,
    params({ from, to }),
  );
}
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/analytics-queries.test.js 2>&1 | grep -E "Tests  "
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  9 passed (9)`; core-api `Test Files  56 passed (56)`, `Tests  514 passed (514)`. (Nếu viết `uniqExactMergeIf(sessions, …)` thay vì `h.sessions`, 6 test fail với `clickhouse unavailable (HTTP 500)` — A5.)

- [ ] **Step 5: Commit**

```bash
git add services/core-api
git commit -m "feat(core-api): analytics ClickHouse queries (series, totals, screen steps, other events, versions, breakdown, overview) on funnel_hourly"
```

---

### Task 4: `src/analytics/revenue.js` — paid, doanh thu, refund từ Postgres

**Files:**
- Create: `services/core-api/src/analytics/revenue.js`
- Test: `services/core-api/test/analytics-revenue.test.js` (mới)

**Interfaces:**
- Consumes: `PAID` (`src/billing/sync.js`), bảng `funnels`, `checkouts`, `transactions`, `outbox` (003); `startDb`/`resetDb`.
- Produces: `REFUND_TOPICS = ['payment.refunded', 'payment.chargeback']`; `funnelIdOf(pool, slug)` → `number | null`; `moneySeries(pool, {funnelId, from, to, by, v})` → `{paid: [{t, paid}], revenue: [{t, currency, amount_minor}]}` (t = epoch ms UTC, bucket giờ/ngày); `moneyBreakdown(pool, {funnelId, from, to, dim, v})` → `[{key, paid, revenue: [{currency, amount_minor}]}]` theo `key`, hoặc `null` khi `dim ∈ {country, ua_class}`; `moneyOverview(pool, {from, to})` → `[{slug, checkouts, paid, revenue, refunds}]` theo slug. Số tiền là số (không chuỗi).

- [ ] **Step 1: Viết test fail**

`services/core-api/test/analytics-revenue.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { funnelIdOf, moneyBreakdown, moneyOverview, moneySeries } from '../src/analytics/revenue.js';
import { startDb, resetDb } from './helpers/db.js';

const H = (h, m = 0) => new Date(Date.UTC(2026, 9, 8, h, m));
const FROM = H(0);
const TO = H(24);
const ck = (n) => `01JA000000000000000000CK${String(n).padStart(2, '0')}`;

// Spec admin-console-p3 §1 "Số liệu từ Postgres": paid, gross revenue per currency, refunds; by v / utm.
describe('analytics revenue (Postgres)', () => {
  let db;
  let aivideo;
  let tarot;
  const checkout = (n, funnel, { v = 1, status = 'completed', created = H(9), completed = null, attribution = {} }) =>
    db.pool.query(
      `INSERT INTO checkouts (id, paddle_transaction_id, funnel_id, v, plan_key, sid, attribution, status, created_at, completed_at)
       VALUES ($1, $2, $3, $4, '1w', $5, $6, $7, $8, $9)`,
      [ck(n), `txn_${n}`, funnel, v, `01JA000000000000000000SD${String(n).padStart(2, '0')}`, attribution, status, created, completed],
    );
  const txn = (id, n, { status = 'completed', amount, currency = 'USD', billed }) =>
    db.pool.query(
      `INSERT INTO transactions (paddle_transaction_id, checkout_id, status, origin, amount_minor, currency, billed_at, paddle_updated_at)
       VALUES ($1, $2, $3, 'web', $4, $5, $6, $7)`,
      [id, ck(n), status, amount, currency, billed, billed ?? H(9)],
    );
  const outbox = (key, topic, payload, at) =>
    db.pool.query('INSERT INTO outbox (topic, aggregate_id, dedupe_key, payload, created_at) VALUES ($1, $2, $3, $4, $5)', [topic, payload.paddle_transaction_id, key, payload, at]);

  beforeAll(async () => {
    db = await startDb();
    await resetDb(db.pool);
    aivideo = Number((await db.pool.query("INSERT INTO funnels (slug, created_by) VALUES ('aivideo', 't') RETURNING id")).rows[0].id);
    tarot = Number((await db.pool.query("INSERT INTO funnels (slug, created_by) VALUES ('tarot', 't') RETURNING id")).rows[0].id);
    // A: v1 from meta/spring, paid 13.67 USD at 10:05. B: v2 from tiktok (no campaign), paid 2000 JPY at 11:10 and
    // renewed at 12:00. C: opened, never paid. D: abandoned (its transaction canceled). E: tarot, paid 9.99 USD.
    // F: paid the day before (outside the range).
    await checkout(1, aivideo, { completed: H(10, 5), attribution: { utm_source: 'meta', utm_campaign: 'spring' } });
    await txn('txn_1', 1, { amount: 1367, billed: H(10, 5) });
    await checkout(2, aivideo, { v: 2, created: H(11), completed: H(11, 10), attribution: { utm_source: 'tiktok' } });
    await txn('txn_2', 2, { amount: 2000, currency: 'JPY', billed: H(11, 10) });
    await txn('txn_2r', 2, { amount: 2000, currency: 'JPY', billed: H(12) });
    await checkout(3, aivideo, { status: 'created' });
    await checkout(4, aivideo, { status: 'abandoned' });
    await txn('txn_4', 4, { status: 'canceled', amount: 999, billed: null });
    await checkout(5, tarot, { completed: H(10, 30) });
    await txn('txn_5', 5, { amount: 999, billed: H(10, 30) });
    await checkout(6, aivideo, { created: H(-20), completed: H(-20) });
    await txn('txn_6', 6, { amount: 1367, billed: H(-20) });
    // Refunds live in the outbox only: a refund of A, a chargeback of E, a refund before the range, and a
    // payment.succeeded that is not a refund.
    await outbox('r1', 'payment.refunded', { paddle_transaction_id: 'txn_1', adjustment_id: 'adj_1', amount_minor: 1367, currency: 'USD' }, H(13));
    await outbox('r2', 'payment.chargeback', { paddle_transaction_id: 'txn_5', adjustment_id: 'adj_2', amount_minor: 999, currency: 'USD' }, H(14));
    await outbox('r3', 'payment.refunded', { paddle_transaction_id: 'txn_6', adjustment_id: 'adj_3', amount_minor: 1367, currency: 'USD' }, H(-1));
    await outbox('s1', 'payment.succeeded', { paddle_transaction_id: 'txn_1', amount_minor: 1367, currency: 'USD' }, H(10, 5));
  });
  afterAll(() => db.stop());

  const q = (extra = {}) => ({ funnelId: aivideo, from: FROM, to: TO, by: 'hour', v: null, ...extra });

  it('funnelIdOf: the id, or null for an unknown slug', async () => {
    expect(await funnelIdOf(db.pool, 'aivideo')).toBe(aivideo);
    expect(await funnelIdOf(db.pool, 'nope')).toBeNull();
  });

  it('by hour: paid by completion hour (once per checkout), revenue by billing hour per currency incl. the renewal', async () => {
    expect(await moneySeries(db.pool, q())).toEqual({
      paid: [{ t: H(10).getTime(), paid: 1 }, { t: H(11).getTime(), paid: 1 }],
      revenue: [
        { t: H(10).getTime(), currency: 'USD', amount_minor: 1367 },
        { t: H(11).getTime(), currency: 'JPY', amount_minor: 2000 },
        { t: H(12).getTime(), currency: 'JPY', amount_minor: 2000 },
      ],
    });
  });

  it('by day (UTC), and the v filter; a version nobody paid for is empty', async () => {
    const day = H(0).getTime();
    expect(await moneySeries(db.pool, q({ by: 'day' }))).toEqual({
      paid: [{ t: day, paid: 2 }],
      revenue: [{ t: day, currency: 'JPY', amount_minor: 4000 }, { t: day, currency: 'USD', amount_minor: 1367 }],
    });
    expect(await moneySeries(db.pool, q({ by: 'day', v: 2 }))).toEqual({ paid: [{ t: day, paid: 1 }], revenue: [{ t: day, currency: 'JPY', amount_minor: 4000 }] });
    expect(await moneySeries(db.pool, q({ v: 9 }))).toEqual({ paid: [], revenue: [] });
  });

  it('breakdown by v, utm_source, utm_campaign (none → ""); none by country or device', async () => {
    expect(await moneyBreakdown(db.pool, q({ dim: 'v' }))).toEqual([
      { key: '1', paid: 1, revenue: [{ currency: 'USD', amount_minor: 1367 }] },
      { key: '2', paid: 1, revenue: [{ currency: 'JPY', amount_minor: 4000 }] },
    ]);
    expect(await moneyBreakdown(db.pool, q({ dim: 'utm_source' }))).toEqual([
      { key: 'meta', paid: 1, revenue: [{ currency: 'USD', amount_minor: 1367 }] },
      { key: 'tiktok', paid: 1, revenue: [{ currency: 'JPY', amount_minor: 4000 }] },
    ]);
    expect(await moneyBreakdown(db.pool, q({ dim: 'utm_campaign', v: 2 }))).toEqual([{ key: '', paid: 1, revenue: [{ currency: 'JPY', amount_minor: 4000 }] }]);
    expect(await moneyBreakdown(db.pool, q({ dim: 'country' }))).toBeNull();
    expect(await moneyBreakdown(db.pool, q({ dim: 'ua_class' }))).toBeNull();
  });

  it('overview: checkouts opened, paid, revenue and refunds (outbox) per funnel; the unpaid ones only count as opened', async () => {
    expect(await moneyOverview(db.pool, { from: FROM, to: TO })).toEqual([
      { slug: 'aivideo', checkouts: 4, paid: 2, revenue: [{ currency: 'JPY', amount_minor: 4000 }, { currency: 'USD', amount_minor: 1367 }], refunds: [{ currency: 'USD', amount_minor: 1367 }] },
      { slug: 'tarot', checkouts: 1, paid: 1, revenue: [{ currency: 'USD', amount_minor: 999 }], refunds: [{ currency: 'USD', amount_minor: 999 }] },
    ]);
    expect(await moneyOverview(db.pool, { from: H(30), to: H(40) })).toEqual([]);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/analytics-revenue.test.js 2>&1 | grep -E "×|^Error|Test Files|Tests  "
```

Expected: `Error: Cannot find module '../src/analytics/revenue.js'`, `Test Files  1 failed (1)`, `Tests  no tests`.

- [ ] **Step 3: Implement**

`services/core-api/src/analytics/revenue.js` (mới):

```js
import { PAID } from '../billing/sync.js';

// Postgres side of the dashboard (spec admin-console-p3 §1): money is counted here, never in ClickHouse.
// paid = checkouts completed in [from, to) with a paid transaction (bucket: completed_at); revenue = gross
// transactions.amount_minor per currency billed in [from, to) (renewals carry their checkout_id: they count for
// the funnel, version and utm of the first purchase); refunds = outbox payment.refunded | payment.chargeback.
export const REFUND_TOPICS = ['payment.refunded', 'payment.chargeback'];
// Checkouts keep version and utm; there is no country or device on a checkout (breakdown → null).
const MONEY_KEYS = {
  v: 'c.v::text',
  utm_source: "COALESCE(c.attribution->>'utm_source', '')",
  utm_campaign: "COALESCE(c.attribution->>'utm_campaign', '')",
};
const BILLED = 'COALESCE(t.billed_at, t.paddle_updated_at)';
// $1 from, $2 to, $3 the paid transaction statuses.
const PAID_WHERE = `c.status = 'completed' AND c.completed_at >= $1 AND c.completed_at < $2
  AND EXISTS (SELECT 1 FROM transactions p WHERE p.checkout_id = c.id AND p.status = ANY($3))`;
const REVENUE_WHERE = `t.status = ANY($3) AND ${BILLED} >= $1 AND ${BILLED} < $2`;

const amount = (r) => ({ currency: r.currency, amount_minor: Number(r.amount_minor) });
const byText = (k) => (a, b) => (a[k] < b[k] ? -1 : a[k] > b[k] ? 1 : 0);

// " AND c.funnel_id = $n [AND c.v = $m]", the values pushed onto args.
function funnelFilter({ funnelId, v }, args) {
  args.push(funnelId);
  let sql = ` AND c.funnel_id = $${args.length}`;
  if (v) {
    args.push(v);
    sql += ` AND c.v = $${args.length}`;
  }
  return sql;
}

export async function funnelIdOf(pool, slug) {
  const { rows } = await pool.query('SELECT id FROM funnels WHERE slug = $1', [slug]);
  return rows.length ? Number(rows[0].id) : null;
}

// q = {funnelId, from, to, by: 'hour'|'day', v} → {paid: [{t, paid}], revenue: [{t, currency, amount_minor}]}, t = epoch ms (UTC).
export async function moneySeries(pool, q) {
  const args = [q.from, q.to, [...PAID], q.by === 'day' ? 'day' : 'hour'];
  const where = funnelFilter(q, args);
  const bucket = (col) => `(extract(epoch FROM date_trunc($4, ${col}, 'UTC')) * 1000)::bigint`;
  const [paid, revenue] = await Promise.all([
    pool.query(`SELECT ${bucket('c.completed_at')} AS bucket, count(*)::int AS paid FROM checkouts c WHERE ${PAID_WHERE}${where} GROUP BY 1 ORDER BY 1`, args),
    pool.query(
      `SELECT ${bucket(BILLED)} AS bucket, t.currency, sum(t.amount_minor) AS amount_minor
         FROM transactions t JOIN checkouts c ON c.id = t.checkout_id
        WHERE ${REVENUE_WHERE}${where} GROUP BY 1, 2 ORDER BY 1, 2`,
      args,
    ),
  ]);
  return {
    paid: paid.rows.map((r) => ({ t: Number(r.bucket), paid: r.paid })),
    revenue: revenue.rows.map((r) => ({ t: Number(r.bucket), ...amount(r) })),
  };
}

// q = {funnelId, from, to, dim, v} → [{key, paid, revenue}] by key, or null for a dimension checkouts do not have.
export async function moneyBreakdown(pool, q) {
  const key = MONEY_KEYS[q.dim];
  if (!key) return null;
  const args = [q.from, q.to, [...PAID]];
  const where = funnelFilter(q, args);
  const [paid, revenue] = await Promise.all([
    pool.query(`SELECT ${key} AS key, count(*)::int AS paid FROM checkouts c WHERE ${PAID_WHERE}${where} GROUP BY 1`, args),
    pool.query(
      `SELECT ${key} AS key, t.currency, sum(t.amount_minor) AS amount_minor
         FROM transactions t JOIN checkouts c ON c.id = t.checkout_id
        WHERE ${REVENUE_WHERE}${where} GROUP BY 1, 2 ORDER BY 1, 2`,
      args,
    ),
  ]);
  const rows = new Map();
  const row = (k) => rows.get(k) ?? rows.set(k, { key: k, paid: 0, revenue: [] }).get(k);
  for (const r of paid.rows) row(r.key).paid = r.paid;
  for (const r of revenue.rows) row(r.key).revenue.push(amount(r));
  return [...rows.values()].sort(byText('key'));
}

// Every funnel with a checkout opened, paid, billed or refunded in [from, to): {slug, checkouts, paid, revenue, refunds}.
export async function moneyOverview(pool, { from, to }) {
  const args = [from, to, [...PAID]];
  const [opened, paid, revenue, refunds] = await Promise.all([
    pool.query(
      `SELECT f.slug, count(*)::int AS n FROM checkouts c JOIN funnels f ON f.id = c.funnel_id
        WHERE c.created_at >= $1 AND c.created_at < $2 GROUP BY 1`,
      args.slice(0, 2),
    ),
    pool.query(`SELECT f.slug, count(*)::int AS n FROM checkouts c JOIN funnels f ON f.id = c.funnel_id WHERE ${PAID_WHERE} GROUP BY 1`, args),
    pool.query(
      `SELECT f.slug, t.currency, sum(t.amount_minor) AS amount_minor
         FROM transactions t JOIN checkouts c ON c.id = t.checkout_id JOIN funnels f ON f.id = c.funnel_id
        WHERE ${REVENUE_WHERE} GROUP BY 1, 2 ORDER BY 1, 2`,
      args,
    ),
    pool.query(
      `SELECT f.slug, o.payload->>'currency' AS currency, sum((o.payload->>'amount_minor')::bigint) AS amount_minor
         FROM outbox o
         JOIN transactions t ON t.paddle_transaction_id = o.payload->>'paddle_transaction_id'
         JOIN checkouts c ON c.id = t.checkout_id JOIN funnels f ON f.id = c.funnel_id
        WHERE o.topic = ANY($3) AND o.created_at >= $1 AND o.created_at < $2 GROUP BY 1, 2 ORDER BY 1, 2`,
      [from, to, REFUND_TOPICS],
    ),
  ]);
  const rows = new Map();
  const row = (slug) => rows.get(slug) ?? rows.set(slug, { slug, checkouts: 0, paid: 0, revenue: [], refunds: [] }).get(slug);
  for (const r of opened.rows) row(r.slug).checkouts = r.n;
  for (const r of paid.rows) row(r.slug).paid = r.n;
  for (const r of revenue.rows) row(r.slug).revenue.push(amount(r));
  for (const r of refunds.rows) row(r.slug).refunds.push(amount(r));
  return [...rows.values()].sort(byText('slug'));
}
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/analytics-revenue.test.js 2>&1 | grep -E "Tests  "
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  5 passed (5)`; core-api `Test Files  57 passed (57)`, `Tests  519 passed (519)`.

- [ ] **Step 5: Commit**

```bash
git add services/core-api
git commit -m "feat(core-api): analytics money from Postgres (paid by completion, gross revenue per currency incl. renewals, outbox refunds; by v/utm; overview)"
```

---

### Task 5: `src/analytics/service.js` — khoảng UTC, ghép theo bucket, điền 0, cache 30 s

**Files:**
- Create: `services/core-api/src/analytics/service.js`
- Test: `services/core-api/test/analytics-service.test.js` (mới; queries/revenue giả, không Docker)

**Interfaces:**
- Consumes: `queries.js` (Task 3), `revenue.js` (Task 4), `HttpError` (`src/errors.js`), `ClickhouseError` (Task 2, chỉ trong test).
- Produces: `CACHE_TTL_MS = 30_000`, `MAX_DAYS = {hour: 14, day: 90}`, `DEFAULT_DAYS = 7`; `resolveRange({from, to, by = 'hour'}, nowMs)` → `{from: Date, to: Date, by}` hoặc ném `HttpError(400, 'invalid_range', {reason: 'from_not_before_to'} | {reason: 'too_long', by, max_days})`; `buckets({from, to, by})` → `[epoch ms…]`; `analyticsService({pool, clickhouse, now = Date.now, ttlMs, queries, revenue})` → `{overview(query) → {range: {from, to}, funnels: [{slug, sessions, leads, checkouts, paid, revenue, refunds}]}, funnel(slug, query) → {range, by, versions, series: [{t (ISO), sessions, page_load, leads, checkout_click, checkout_complete, paid, revenue}], steps, milestones: {sessions, page_load, leads, checkout_click, checkout_complete, paid}, events}, breakdown(slug, query) → {dim, rows: [{key, sessions, leads, checkout_complete, paid, revenue}]}}`; funnel lạ → `HttpError(404, 'funnel_not_found')` trước mọi truy vấn ClickHouse; `ClickhouseError` lọt ra nguyên vẹn (không cache).

- [ ] **Step 1: Viết test fail**

`services/core-api/test/analytics-service.test.js` (mới):

```js
import { describe, it, expect } from 'vitest';
import { ClickhouseError } from '../src/analytics/clickhouse.js';
import { analyticsService, buckets, CACHE_TTL_MS, MAX_DAYS, resolveRange } from '../src/analytics/service.js';

const HOUR = 3_600_000;
const DAY = 86_400_000;
const NOW = Date.UTC(2026, 9, 8, 10, 37);
const H = (h) => Date.UTC(2026, 9, 8, h);
const ZERO = { sessions: 0, page_load: 0, leads: 0, checkout_click: 0, checkout_complete: 0 };

// Fakes for queries.js (ClickHouse) and revenue.js (Postgres): canned answers, every call recorded.
function fakes(over = {}) {
  const calls = [];
  const rec = (name, value) => async (_, q) => {
    calls.push([name, q]);
    const v = typeof value === 'function' ? value(q) : value;
    if (v instanceof Error) throw v;
    return v;
  };
  const queries = {
    versionsSeen: rec('versionsSeen', [1, 2]),
    eventSeries: rec('eventSeries', [{ t: H(8), ...ZERO, sessions: 5, page_load: 5, leads: 2 }, { t: H(10), ...ZERO, sessions: 1, page_load: 1 }]),
    eventTotals: rec('eventTotals', { sessions: 6, page_load: 6, leads: 2, checkout_click: 1, checkout_complete: 1 }),
    screenSteps: rec('screenSteps', [{ screen: 0, sessions: 6 }, { screen: 1, sessions: 3 }]),
    otherEvents: rec('otherEvents', [{ name: 'quiz_done', sessions: 2 }]),
    eventBreakdown: rec('eventBreakdown', [{ key: '1', sessions: 4, leads: 1, checkout_complete: 1 }, { key: '2', sessions: 2, leads: 1, checkout_complete: 0 }]),
    eventOverview: rec('eventOverview', [{ slug: 'aivideo', sessions: 6, leads: 2 }, { slug: 'quiz-only', sessions: 9, leads: 0 }]),
    ...over.queries,
  };
  const revenue = {
    funnelIdOf: rec('funnelIdOf', (slug) => (slug === 'nope' ? null : 7)),
    moneySeries: rec('moneySeries', {
      paid: [{ t: H(8), paid: 1 }],
      revenue: [{ t: H(8), currency: 'JPY', amount_minor: 2000 }, { t: H(8), currency: 'USD', amount_minor: 1367 }],
    }),
    moneyBreakdown: rec('moneyBreakdown', (q) => (['country', 'ua_class'].includes(q.dim) ? null : [
      { key: '1', paid: 1, revenue: [{ currency: 'USD', amount_minor: 1367 }] },
      { key: '9', paid: 1, revenue: [{ currency: 'USD', amount_minor: 999 }] },
    ])),
    moneyOverview: rec('moneyOverview', [
      { slug: 'aivideo', checkouts: 3, paid: 1, revenue: [{ currency: 'USD', amount_minor: 1367 }], refunds: [] },
      { slug: 'paid-only', checkouts: 1, paid: 1, revenue: [{ currency: 'JPY', amount_minor: 2000 }], refunds: [{ currency: 'JPY', amount_minor: 2000 }] },
    ]),
    ...over.revenue,
  };
  return { queries, revenue, calls };
}

function service(over) {
  const f = fakes(over);
  let t = NOW;
  const s = analyticsService({ pool: 'pool', clickhouse: 'ch', now: () => t, queries: f.queries, revenue: f.revenue });
  return { s, calls: f.calls, tick: (ms) => { t += ms; } };
}

// Spec admin-console-p3 §1 "Khoảng thời gian" and §2 service.js.
describe('resolveRange', () => {
  const r = (q) => {
    const out = resolveRange(q, NOW);
    return { from: out.from.toISOString(), to: out.to.toISOString(), by: out.by };
  };
  it('default: the last 7 days by hour; whole UTC hours (from down, to up); to cut at now', () => {
    expect(r({})).toEqual({ from: '2026-10-01T10:00:00.000Z', to: '2026-10-08T11:00:00.000Z', by: 'hour' });
    expect(r({ from: '2026-10-08T08:15:00Z', to: '2026-10-09T00:00:00Z', by: 'day' })).toEqual({ from: '2026-10-08T08:00:00.000Z', to: '2026-10-08T11:00:00.000Z', by: 'day' });
  });
  it('limits: by=hour ≤ 14 days, by=day ≤ 90 days; from must be before to → 400 invalid_range', () => {
    expect(MAX_DAYS).toEqual({ hour: 14, day: 90 });
    const iso = (ms) => new Date(ms).toISOString();
    expect(r({ from: iso(NOW - 14 * DAY), by: 'hour' }).from).toBe('2026-09-24T10:00:00.000Z');
    expect(r({ from: iso(NOW - 90 * DAY), by: 'day' }).from).toBe('2026-07-10T10:00:00.000Z');
    for (const [q, detail] of [
      [{ from: iso(NOW - 14 * DAY - 1), by: 'hour' }, { reason: 'too_long', by: 'hour', max_days: 14 }],
      [{ from: iso(NOW - 90 * DAY - 1), by: 'day' }, { reason: 'too_long', by: 'day', max_days: 90 }],
      [{ from: '2026-10-08T09:00:00Z', to: '2026-10-08T09:00:00Z' }, { reason: 'from_not_before_to' }],
      [{ from: '2026-10-09T00:00:00Z' }, { reason: 'from_not_before_to' }],
    ]) {
      expect(() => resolveRange(q, NOW)).toThrow(expect.objectContaining({ status: 400, code: 'invalid_range', detail }));
    }
  });
  it('buckets: every hour of the range, or every UTC day from the day it starts in', () => {
    expect(buckets({ from: new Date(H(8)), to: new Date(H(11)), by: 'hour' })).toEqual([H(8), H(9), H(10)]);
    expect(buckets({ from: new Date(H(8)), to: new Date(H(8) + 2 * DAY), by: 'day' })).toEqual([Date.UTC(2026, 9, 8), Date.UTC(2026, 9, 9), Date.UTC(2026, 9, 10)]);
  });
});

describe('analyticsService', () => {
  const Q = { from: '2026-10-08T08:00:00Z', to: '2026-10-08T10:37:00Z', by: 'hour' };

  it('funnel: every bucket present (0 where nothing happened), money merged by bucket, milestones with paid', async () => {
    const { s, calls } = service();
    expect(await s.funnel('aivideo', Q)).toEqual({
      range: { from: '2026-10-08T08:00:00.000Z', to: '2026-10-08T11:00:00.000Z' },
      by: 'hour',
      versions: [1, 2],
      series: [
        { t: '2026-10-08T08:00:00.000Z', ...ZERO, sessions: 5, page_load: 5, leads: 2, paid: 1, revenue: [{ currency: 'JPY', amount_minor: 2000 }, { currency: 'USD', amount_minor: 1367 }] },
        { t: '2026-10-08T09:00:00.000Z', ...ZERO, paid: 0, revenue: [] },
        { t: '2026-10-08T10:00:00.000Z', ...ZERO, sessions: 1, page_load: 1, paid: 0, revenue: [] },
      ],
      steps: [{ screen: 0, sessions: 6 }, { screen: 1, sessions: 3 }],
      milestones: { sessions: 6, page_load: 6, leads: 2, checkout_click: 1, checkout_complete: 1, paid: 1 },
      events: [{ name: 'quiz_done', sessions: 2 }],
    });
    const q = calls.find((c) => c[0] === 'eventSeries')[1];
    expect(q).toEqual({ slug: 'aivideo', funnelId: 7, from: new Date(H(8)), to: new Date(H(11)), by: 'hour', v: null });
  });

  // Review Focus 1: events but no checkout at all (a funnel without prices yet).
  it('a funnel with events and no money: paid 0 and revenue [] everywhere, nothing missing', async () => {
    const { s } = service({ revenue: { moneySeries: async () => ({ paid: [], revenue: [] }) } });
    const out = await s.funnel('aivideo', Q);
    expect(out.milestones.paid).toBe(0);
    expect(out.series.every((b) => b.paid === 0 && Array.isArray(b.revenue) && b.revenue.length === 0)).toBe(true);
  });

  it('unknown funnel → 404 funnel_not_found before any ClickHouse query', async () => {
    const { s, calls } = service();
    await expect(s.funnel('nope', Q)).rejects.toMatchObject({ status: 404, code: 'funnel_not_found' });
    await expect(s.breakdown('nope', { ...Q, dim: 'v' })).rejects.toMatchObject({ status: 404 });
    expect(calls.map((c) => c[0])).toEqual(['funnelIdOf', 'funnelIdOf']);
  });

  it(`cached ${CACHE_TTL_MS / 1000} s per route|slug|from|to|by|dim|v; a failure is not cached`, async () => {
    expect(CACHE_TTL_MS).toBe(30_000);
    let fail = true;
    const { s, calls, tick } = service({ queries: { eventTotals: async () => { if (fail) throw new ClickhouseError('unavailable', 503); return ZERO; } } });
    await expect(s.funnel('aivideo', Q)).rejects.toMatchObject({ kind: 'unavailable' });
    fail = false;
    await s.funnel('aivideo', Q);
    const n = calls.length;
    tick(29_000);
    await s.funnel('aivideo', Q);
    await s.funnel('aivideo', { ...Q, to: '2026-10-08T10:59:00Z' }); // same whole hours: same entry
    expect(calls.length).toBe(n + 2); // funnelIdOf only
    await s.funnel('aivideo', { ...Q, v: 2 });
    expect(calls.length).toBeGreaterThan(n + 4);
    const m = calls.length;
    tick(2_000);
    await s.funnel('aivideo', Q);
    expect(calls.length).toBeGreaterThan(m + 1);
  });

  it('overview: funnels with events or money, zeros where one side is missing, most sessions first', async () => {
    const { s } = service();
    expect(await s.overview({ from: '2026-10-01T10:37:00Z' })).toEqual({
      range: { from: '2026-10-01T10:00:00.000Z', to: '2026-10-08T11:00:00.000Z' },
      funnels: [
        { slug: 'quiz-only', sessions: 9, leads: 0, checkouts: 0, paid: 0, revenue: [], refunds: [] },
        { slug: 'aivideo', sessions: 6, leads: 2, checkouts: 3, paid: 1, revenue: [{ currency: 'USD', amount_minor: 1367 }], refunds: [] },
        { slug: 'paid-only', sessions: 0, leads: 0, checkouts: 1, paid: 1, revenue: [{ currency: 'JPY', amount_minor: 2000 }], refunds: [{ currency: 'JPY', amount_minor: 2000 }] },
      ],
    });
  });

  it('breakdown: money joined by key (a key only Postgres knows is kept); country/ua_class have paid and revenue null', async () => {
    const { s } = service();
    expect(await s.breakdown('aivideo', { ...Q, dim: 'v' })).toEqual({
      dim: 'v',
      rows: [
        { key: '1', sessions: 4, leads: 1, checkout_complete: 1, paid: 1, revenue: [{ currency: 'USD', amount_minor: 1367 }] },
        { key: '2', sessions: 2, leads: 1, checkout_complete: 0, paid: 0, revenue: [] },
        { key: '9', sessions: 0, leads: 0, checkout_complete: 0, paid: 1, revenue: [{ currency: 'USD', amount_minor: 999 }] },
      ],
    });
    const country = await s.breakdown('aivideo', { ...Q, dim: 'country' });
    expect(country.rows.every((r) => r.paid === null && r.revenue === null)).toBe(true);
  });

  it(`breakdown keeps at most 50 rows`, async () => {
    const many = Array.from({ length: 50 }, (_, i) => ({ key: `c${String(i).padStart(2, '0')}`, sessions: 100 - i, leads: 0, checkout_complete: 0 }));
    const { s } = service({ queries: { eventBreakdown: async () => many }, revenue: { moneyBreakdown: async () => [{ key: 'zz', paid: 1, revenue: [] }] } });
    const { rows } = await s.breakdown('aivideo', { ...Q, dim: 'utm_campaign' });
    expect(rows).toHaveLength(50);
    expect(rows.at(-1).key).toBe('c49');
  });

  it('a range of whole days: by=day buckets from the first day', async () => {
    const { s } = service({ queries: { eventSeries: async () => [] }, revenue: { moneySeries: async () => ({ paid: [{ t: Date.UTC(2026, 9, 7), paid: 2 }], revenue: [] }) } });
    const out = await s.funnel('aivideo', { from: '2026-10-06T12:00:00Z', by: 'day' });
    expect(out.series.map((b) => [b.t, b.paid])).toEqual([['2026-10-06T00:00:00.000Z', 0], ['2026-10-07T00:00:00.000Z', 2], ['2026-10-08T00:00:00.000Z', 0]]);
    expect(out.by).toBe('day');
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/analytics-service.test.js 2>&1 | grep -E "×|^Error|Test Files|Tests  "
```

Expected: `Error: Cannot find module '../src/analytics/service.js'`, `Test Files  1 failed (1)`, `Tests  no tests`.

- [ ] **Step 3: Implement**

`services/core-api/src/analytics/service.js` (mới):

```js
import { HttpError } from '../errors.js';
import * as Queries from './queries.js';
import * as Revenue from './revenue.js';

// The dashboard's numbers (spec admin-console-p3 §1–2): ClickHouse sessions merged with Postgres money per UTC
// bucket, empty buckets filled with 0, each answer cached in this process for 30 s (failures are not cached).
export const CACHE_TTL_MS = 30_000;
export const MAX_DAYS = { hour: 14, day: 90 };
export const DEFAULT_DAYS = 7;
const HOUR = 3_600_000;
const DAY = 86_400_000;
const STEP = { hour: HOUR, day: DAY };
const CACHE_MAX = 1000;
const ZERO = { sessions: 0, page_load: 0, leads: 0, checkout_click: 0, checkout_complete: 0 };

// The query's {from, to, by} (ISO strings; default the last 7 days by hour) → whole UTC hours: `to` cut at now and
// rounded up, `from` rounded down. Limits on the asked span: by=hour ≤ 14 days, by=day ≤ 90 days.
export function resolveRange({ from, to, by = 'hour' } = {}, nowMs) {
  const end = Math.min(to ? Date.parse(to) : nowMs, nowMs);
  const start = from ? Date.parse(from) : end - DEFAULT_DAYS * DAY;
  if (!(start < end)) throw new HttpError(400, 'invalid_range', { reason: 'from_not_before_to' });
  if (end - start > MAX_DAYS[by] * DAY) throw new HttpError(400, 'invalid_range', { reason: 'too_long', by, max_days: MAX_DAYS[by] });
  return { from: new Date(Math.floor(start / HOUR) * HOUR), to: new Date(Math.ceil(end / HOUR) * HOUR), by };
}

// Bucket starts (epoch ms) of [from, to): every hour, or every UTC day from the day `from` is in.
export function buckets({ from, to, by }) {
  const out = [];
  for (let t = by === 'day' ? Math.floor(from / DAY) * DAY : from.getTime(); t < to.getTime(); t += STEP[by]) out.push(t);
  return out;
}

const byText = (k) => (a, b) => (a[k] < b[k] ? -1 : a[k] > b[k] ? 1 : 0);
const range = (r) => ({ from: r.from.toISOString(), to: r.to.toISOString() });

export function analyticsService({ pool, clickhouse, now = Date.now, ttlMs = CACHE_TTL_MS, queries = Queries, revenue = Revenue }) {
  const cache = new Map();
  async function cached(key, load) {
    const hit = cache.get(key);
    if (hit && now() - hit.at < ttlMs) return hit.value;
    const value = await load();
    if (cache.size >= CACHE_MAX) cache.clear();
    cache.set(key, { value, at: now() });
    return value;
  }
  const keyOf = (route, slug, r, { by = '', dim = '', v = '' } = {}) => [route, slug, r.from.toISOString(), r.to.toISOString(), by, dim, v ?? ''].join('|');
  async function funnelId(slug) {
    const id = await revenue.funnelIdOf(pool, slug);
    if (!id) throw new HttpError(404, 'funnel_not_found');
    return id;
  }

  return {
    // GET /v1/analytics/overview: every funnel with events or a checkout in the range, most sessions first.
    async overview(query) {
      const r = resolveRange({ ...query, by: 'day' }, now());
      return cached(keyOf('overview', '', r), async () => {
        const [events, money] = await Promise.all([queries.eventOverview(clickhouse, r), revenue.moneyOverview(pool, r)]);
        const rows = new Map(money.map((m) => [m.slug, { slug: m.slug, sessions: 0, leads: 0, ...m }]));
        for (const e of events) rows.set(e.slug, { checkouts: 0, paid: 0, revenue: [], refunds: [], ...rows.get(e.slug), ...e });
        const funnels = [...rows.values()]
          .map(({ slug, sessions, leads, checkouts, paid, revenue: rev, refunds }) => ({ slug, sessions, leads, checkouts, paid, revenue: rev, refunds }))
          .sort((a, b) => b.sessions - a.sessions || byText('slug')(a, b));
        return { range: range(r), funnels };
      });
    },

    // GET /v1/analytics/funnels/:slug: series per bucket, screen steps, milestones, other events.
    async funnel(slug, query) {
      const r = resolveRange(query, now());
      const id = await funnelId(slug);
      const v = query.v ?? null;
      return cached(keyOf('funnel', slug, r, { by: r.by, v }), async () => {
        const q = { slug, funnelId: id, ...r, v };
        const [versions, events, totals, steps, other, money] = await Promise.all([
          queries.versionsSeen(clickhouse, q), queries.eventSeries(clickhouse, q), queries.eventTotals(clickhouse, q),
          queries.screenSteps(clickhouse, q), queries.otherEvents(clickhouse, q), revenue.moneySeries(pool, q),
        ]);
        const byT = new Map(buckets(r).map((t) => [t, { t: new Date(t).toISOString(), ...ZERO, paid: 0, revenue: [] }]));
        for (const { t, ...counts } of events) Object.assign(byT.get(t) ?? {}, counts);
        for (const p of money.paid) if (byT.has(p.t)) byT.get(p.t).paid = p.paid;
        for (const m of money.revenue) byT.get(m.t)?.revenue.push({ currency: m.currency, amount_minor: m.amount_minor });
        const series = [...byT.values()];
        return {
          range: range(r),
          by: r.by,
          versions,
          series,
          steps,
          milestones: { ...ZERO, ...totals, paid: money.paid.reduce((n, p) => n + p.paid, 0) },
          events: other,
        };
      });
    },

    // GET /v1/analytics/funnels/:slug/breakdown: one row per value of dim; money only where checkouts have it.
    async breakdown(slug, query) {
      const r = resolveRange({ ...query, by: 'day' }, now());
      const id = await funnelId(slug);
      const v = query.v ?? null;
      const { dim } = query;
      return cached(keyOf('breakdown', slug, r, { dim, v }), async () => {
        const q = { slug, funnelId: id, ...r, v, dim };
        const [events, money] = await Promise.all([queries.eventBreakdown(clickhouse, q), revenue.moneyBreakdown(pool, q)]);
        if (!money) return { dim, rows: events.map((e) => ({ ...e, paid: null, revenue: null })) };
        const rows = new Map(events.map((e) => [e.key, { ...e, paid: 0, revenue: [] }]));
        for (const m of money) rows.set(m.key, { key: m.key, sessions: 0, leads: 0, checkout_complete: 0, ...rows.get(m.key), paid: m.paid, revenue: m.revenue });
        const all = [...rows.values()].sort((a, b) => b.sessions - a.sessions || byText('key')(a, b));
        return { dim, rows: all.slice(0, Queries.BREAKDOWN_LIMIT) };
      });
    },
  };
}
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/analytics-service.test.js 2>&1 | grep -E "Tests  "
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  11 passed (11)`; core-api `Test Files  58 passed (58)`, `Tests  530 passed (530)`.

- [ ] **Step 5: Commit**

```bash
git add services/core-api
git commit -m "feat(core-api): analytics service (UTC range limits, merge by bucket with zero-fill, 30 s cache without caching failures)"
```

---

### Task 6: Routes `src/http/analytics.js` (`viewer`, cache private 30 s, 400/404/503), đăng ký có điều kiện trong `app.js`

**Files:**
- Create: `services/core-api/src/http/analytics.js`
- Modify: `services/core-api/src/app.js`
- Test: `services/core-api/test/analytics-http.test.js` (mới; Postgres + ClickHouse thật)

**Interfaces:**
- Consumes: `analyticsService` (Task 5), `DIMENSIONS` (Task 3), `ClickhouseError` (Task 2), `requireRole(pool, 'viewer')` (`src/auth.js`), `HttpError`; test helpers `makeApp`, `tokenFor`, `bearer`, `signIn`, `ADMIN_ORIGIN`, `startDb`, `startClickhouse`.
- Produces: `GET /v1/analytics/overview?from&to`, `GET /v1/analytics/funnels/:slug?from&to&by&v`, `GET /v1/analytics/funnels/:slug/breakdown?from&to&dim&v` (`dim` bắt buộc), response như Task 5, header `cache-control: private, max-age=30`; schema sai → `400 bad_request`; `400 invalid_range`; `404 funnel_not_found`; `ClickhouseError` → `503 {error: 'analytics_unavailable'}` + log `analytics_unavailable {route, kind, status}`; mỗi câu trả lời log `analytics {route, slug, from, to, ms}`. `buildApp` đăng ký khi có `deps.pool && deps.clickhouse` (`deps.now` dùng cho khoảng và cache).

- [ ] **Step 1: Viết test fail**

`services/core-api/test/analytics-http.test.js` (mới):

```js
import { Writable } from 'node:stream';
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { buildApp } from '../src/app.js';
import { createClickhouse } from '../src/analytics/clickhouse.js';
import { startDb, resetDb } from './helpers/db.js';
import { startClickhouse } from './helpers/clickhouse.js';
import { makeApp, tokenFor, bearer } from './helpers/app.js';
import { ADMIN_ORIGIN, signIn } from './helpers/admin.js';

const NOW = Date.UTC(2026, 9, 8, 12);
const H = (h, m = 0) => Date.UTC(2026, 9, 8, h, m);
const RANGE = 'from=2026-10-08T08:00:00Z&to=2026-10-08T12:00:00Z';
const URLS = [`/v1/analytics/overview?${RANGE}`, `/v1/analytics/funnels/aivideo?${RANGE}`, `/v1/analytics/funnels/aivideo/breakdown?${RANGE}&dim=v`];

// A ClickHouse client whose server always answers 500 with internals in the body, or never answers.
const brokenClickhouse = (mode) =>
  createClickhouse({
    url: 'http://ch.invalid:8123', user: 'r', password: 'p', database: 'ikf', timeoutMs: 50,
    fetch: async (_url, init) => {
      if (mode === 'slow') return new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(init.signal.reason)));
      return new Response('Code: 241. DB::Exception: Memory limit exceeded while running SELECT secret_column FROM funnel_hourly', { status: 500 });
    },
  });

// Spec admin-console-p3 §2 "Routes": viewer and up, private cache 30 s, 400/404/503, logs without internals.
describe('analytics routes', () => {
  let db;
  let ch;
  let clickhouse;
  let app;
  let viewer;

  beforeAll(async () => {
    [db, ch] = await Promise.all([startDb(), startClickhouse()]);
    await ch.apply();
    clickhouse = createClickhouse({ url: ch.url, user: ch.user, password: ch.password, database: 'ikf' });
    await ch.insertEvents([
      { sid: '01JA0000000000000000000S01', name: 'page_load', at: H(9) },
      { sid: '01JA0000000000000000000S01', name: 'screen_view', screen: 0, at: H(9, 1) },
      { sid: '01JA0000000000000000000S01', name: 'lead', at: H(9, 2) },
      { sid: '01JA0000000000000000000S02', name: 'page_load', v: 2, at: H(10) },
    ]);
  });
  afterAll(async () => {
    await Promise.all([db?.stop(), ch?.stop()]);
  });
  beforeEach(async () => {
    await resetDb(db.pool);
    await db.pool.query("INSERT INTO funnels (slug, created_by) VALUES ('aivideo', 't')");
    ({ app } = await makeApp(db.pool, { clickhouse, now: () => NOW, admin: { origin: ADMIN_ORIGIN, appEnv: 'staging' } }));
    viewer = await signIn(db.pool, 'vi@ikameglobal.com', 'viewer');
  });
  afterEach(() => app.close());

  const get = (url, headers = viewer.headers(false), on = app) => on.inject({ method: 'GET', url, headers });

  it('overview, funnel and breakdown answer a viewer, cached privately for 30 s', async () => {
    const [overview, funnel, breakdown] = await Promise.all(URLS.map((u) => get(u)));
    for (const res of [overview, funnel, breakdown]) {
      expect(res.statusCode).toBe(200);
      expect(res.headers['cache-control']).toBe('private, max-age=30');
    }
    expect(overview.json()).toEqual({
      range: { from: '2026-10-08T08:00:00.000Z', to: '2026-10-08T12:00:00.000Z' },
      funnels: [{ slug: 'aivideo', sessions: 2, leads: 1, checkouts: 0, paid: 0, revenue: [], refunds: [] }],
    });
    expect(funnel.json()).toMatchObject({
      by: 'hour', versions: [1, 2], steps: [{ screen: 0, sessions: 1 }], events: [],
      milestones: { sessions: 2, page_load: 2, leads: 1, checkout_click: 0, checkout_complete: 0, paid: 0 },
    });
    expect(funnel.json().series.map((b) => [b.t, b.sessions])).toEqual([
      ['2026-10-08T08:00:00.000Z', 0], ['2026-10-08T09:00:00.000Z', 1], ['2026-10-08T10:00:00.000Z', 1], ['2026-10-08T11:00:00.000Z', 0],
    ]);
    expect(breakdown.json()).toEqual({
      dim: 'v',
      rows: [
        { key: '1', sessions: 1, leads: 1, checkout_complete: 0, paid: 0, revenue: [] },
        { key: '2', sessions: 1, leads: 0, checkout_complete: 0, paid: 0, revenue: [] },
      ],
    });
    // A response holds aggregates only: no session id anywhere.
    expect(JSON.stringify([overview.json(), funnel.json(), breakdown.json()])).not.toMatch(/01JA0000000000000000000S0/);
  });

  it.each(['viewer', 'support', 'editor', 'admin'])('%s reads all three', async (role) => {
    const p = role === 'viewer' ? viewer : await signIn(db.pool, `${role}@ikameglobal.com`, role);
    for (const u of URLS) expect((await get(u, p.headers(false))).statusCode, u).toBe(200);
  });

  it('any API token reads (grant viewer); no credentials → 401', async () => {
    for (const roles of [['publisher'], ['router']]) {
      const token = await tokenFor(db.pool, ...roles);
      for (const u of URLS) expect((await get(u, bearer(token))).statusCode, `${roles} ${u}`).toBe(200);
    }
    expect((await get(URLS[0], {})).statusCode).toBe(401);
  });

  it.each([
    ['/v1/analytics/overview?from=yesterday', 'from not ISO'],
    ['/v1/analytics/funnels/aivideo?by=week', 'by not hour|day'],
    ['/v1/analytics/funnels/aivideo?v=0', 'v < 1'],
    ['/v1/analytics/funnels/aivideo?v=x', 'v not an integer'],
    ['/v1/analytics/funnels/aivideo/breakdown?dim=ip_hash', 'dim not allowed'],
    ['/v1/analytics/funnels/aivideo/breakdown', 'dim missing'],
    ['/v1/analytics/funnels/Not_A_Slug', 'slug'],
  ])('400 bad_request: %s (%s)', async (url) => {
    const res = await get(url);
    expect([res.statusCode, res.json().error]).toEqual([400, 'bad_request']);
  });

  it('400 invalid_range (from not before to, by=hour over 14 days); 404 funnel_not_found', async () => {
    expect((await get('/v1/analytics/funnels/aivideo?from=2026-10-08T10:00:00Z&to=2026-10-08T09:00:00Z')).json()).toEqual({ error: 'invalid_range', detail: { reason: 'from_not_before_to' } });
    expect((await get('/v1/analytics/funnels/aivideo?from=2026-09-20T00:00:00Z&by=hour')).json()).toEqual({ error: 'invalid_range', detail: { reason: 'too_long', by: 'hour', max_days: 14 } });
    expect((await get('/v1/analytics/funnels/aivideo?from=2026-09-20T00:00:00Z&by=day')).statusCode).toBe(200);
    for (const u of ['/v1/analytics/funnels/nope', '/v1/analytics/funnels/nope/breakdown?dim=v']) {
      const res = await get(u);
      expect([res.statusCode, res.json()]).toEqual([404, { error: 'funnel_not_found' }]);
    }
  });

  // Review Focus 5: ClickHouse slow or failing while Postgres is fine → 503, never a half answer.
  it.each(['failing', 'slow'])('ClickHouse %s → 503 analytics_unavailable; the log has the kind, not the message or the SQL', async (mode) => {
    let logs = '';
    const stream = new Writable({ write(chunk, _enc, done) { logs += chunk; done(); } });
    const logged = buildApp({ logger: { level: 'info', stream }, deps: { pool: db.pool, clickhouse: brokenClickhouse(mode), now: () => NOW } });
    for (const u of URLS) {
      const res = await get(u, viewer.headers(false), logged);
      expect([res.statusCode, res.json()]).toEqual([503, { error: 'analytics_unavailable' }]);
      expect(res.headers['cache-control']).toBeUndefined();
    }
    await logged.close();
    const lines = logs.split('\n').filter(Boolean).map((l) => JSON.parse(l));
    const warn = lines.filter((l) => l.msg === 'analytics_unavailable');
    expect(warn).toHaveLength(3);
    expect(warn[0]).toMatchObject({ kind: 'unavailable', ...(mode === 'failing' ? { status: 500 } : { status: null }) });
    expect(logs).not.toMatch(/secret_column|Memory limit|funnel_hourly|uniqExact|vi@ikameglobal\.com/);
  });

  it('every answered request logs `analytics` with route, slug, from, to and ms', async () => {
    let logs = '';
    const stream = new Writable({ write(chunk, _enc, done) { logs += chunk; done(); } });
    const logged = buildApp({ logger: { level: 'info', stream }, deps: { pool: db.pool, clickhouse, now: () => NOW } });
    expect((await get(URLS[1], viewer.headers(false), logged)).statusCode).toBe(200);
    await logged.close();
    const line = logs.split('\n').filter(Boolean).map((l) => JSON.parse(l)).find((l) => l.msg === 'analytics');
    expect(line).toMatchObject({ route: 'funnel', slug: 'aivideo', from: '2026-10-08T08:00:00Z', to: '2026-10-08T12:00:00Z' });
    expect(typeof line.ms).toBe('number');
  });

  it('without a ClickHouse client the routes do not exist (analytics off); everything else works', async () => {
    const off = buildApp({ deps: { pool: db.pool } });
    expect((await get(URLS[0], viewer.headers(false), off)).statusCode).toBe(404);
    expect((await get('/v1/domains', viewer.headers(false), off)).statusCode).toBe(200);
    await off.close();
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/analytics-http.test.js 2>&1 | grep -E "×|Test Files|Tests  "
```

Expected: 17 test FAIL (route chưa có: 404 thay vì 200/400/503), chỉ `without a ClickHouse client the routes do not exist…` pass; `Tests  17 failed | 1 passed (18)`.

- [ ] **Step 3: Implement**

`services/core-api/src/http/analytics.js` (mới):

```js
import { requireRole } from '../auth.js';
import { ClickhouseError } from '../analytics/clickhouse.js';
import { DIMENSIONS } from '../analytics/queries.js';
import { analyticsService } from '../analytics/service.js';
import { HttpError } from '../errors.js';

const iso = { type: 'string', format: 'date-time' };
const version = { type: 'integer', minimum: 1, maximum: 4294967295 };
const slugParams = { type: 'object', required: ['slug'], properties: { slug: { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{1,62}$' } } };
const query = (properties, required = []) => ({ type: 'object', additionalProperties: false, required, properties: { from: iso, to: iso, ...properties } });

// Dashboard numbers for the admin console (spec admin-console-p3 §2): aggregates only (no sid, no PII), so every
// person and every token may read them (grant viewer). Registered only when the ClickHouse reader is configured.
export default async function analyticsHttp(app, { pool, clickhouse, now = Date.now }) {
  const service = analyticsService({ pool, clickhouse, now });
  const viewer = requireRole(pool, 'viewer');

  // ClickHouse down, slow or refusing us → 503 (the console shows "chưa bật hoặc không phản hồi"); the log has the
  // kind and status only. Postgres errors stay 500.
  async function answer(req, reply, route, load) {
    const started = performance.now();
    try {
      const out = await load();
      reply.header('cache-control', 'private, max-age=30');
      req.log.info({ route, slug: req.params.slug ?? null, from: req.query.from ?? null, to: req.query.to ?? null, ms: Math.round(performance.now() - started) }, 'analytics');
      return out;
    } catch (err) {
      if (!(err instanceof ClickhouseError)) throw err;
      req.log.warn({ route, kind: err.kind, status: err.status }, 'analytics_unavailable');
      throw new HttpError(503, 'analytics_unavailable');
    }
  }

  app.get('/v1/analytics/overview', { onRequest: viewer, schema: { querystring: query({}) } }, (req, reply) =>
    answer(req, reply, 'overview', () => service.overview(req.query)));

  app.get(
    '/v1/analytics/funnels/:slug',
    { onRequest: viewer, schema: { params: slugParams, querystring: query({ by: { type: 'string', enum: ['hour', 'day'] }, v: version }) } },
    (req, reply) => answer(req, reply, 'funnel', () => service.funnel(req.params.slug, req.query)),
  );

  app.get(
    '/v1/analytics/funnels/:slug/breakdown',
    { onRequest: viewer, schema: { params: slugParams, querystring: query({ dim: { type: 'string', enum: DIMENSIONS }, v: version }, ['dim']) } },
    (req, reply) => answer(req, reply, 'breakdown', () => service.breakdown(req.params.slug, req.query)),
  );
}
```

`services/core-api/src/app.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/app.js b/services/core-api/src/app.js
index 553f3e9..eeb9202 100644
--- a/services/core-api/src/app.js
+++ b/services/core-api/src/app.js
@@ -19,6 +19,7 @@ import googleHttp from './http/google.js';
 import catalogHttp from './http/catalog.js';
 import usersHttp from './http/users.js';
 import customersHttp from './http/customers.js';
+import analyticsHttp from './http/analytics.js';
 import { adminCors } from './admin/cors.js';
 
 export function buildApp({ checks = {}, timeoutMs = 1000, logger = false, deps } = {}) {
@@ -76,6 +77,7 @@ export function buildApp({ checks = {}, timeoutMs = 1000, logger = false, deps }
   if (deps?.pool && deps?.claimKey && deps?.mailer) app.register(identityHttp, deps);
   if (deps?.pool && deps?.claimKey) app.register(claimHttp, deps);
   if (deps?.pool && deps?.claimKey) app.register(sdkHttp, deps);
+  if (deps?.pool && deps?.clickhouse) app.register(analyticsHttp, deps);
   if (deps?.pool && deps?.admin) app.register(authHttp, deps);
   if (deps?.pool && deps?.admin?.google && !deps.admin.localUser) app.register(googleHttp, deps);
 
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/analytics-http.test.js 2>&1 | grep -E "Tests  "
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  18 passed (18)`; core-api `Test Files  59 passed (59)`, `Tests  548 passed (548)`.

- [ ] **Step 5: Commit**

```bash
git add services/core-api
git commit -m "feat(core-api): GET /v1/analytics/overview, /funnels/:slug, /funnels/:slug/breakdown (viewer, private 30 s, 503 analytics_unavailable), registered only with a ClickHouse reader"
```

---

### Task 7: CLI `ikf stats <slug> [--days 7] [--by hour|day]`

**Files:**
- Modify: `packages/cli/src/api.js`, `packages/cli/src/main.js`
- Test: `packages/cli/test/stats.test.js` (mới)

**Interfaces:**
- Consumes: `GET /v1/analytics/funnels/:slug` (Task 6); `createApi` (retry 503/mạng cho lệnh có `retry: true`), `run(argv, {out, err, env, deps})`, `UsageError`, `formatApiError`, `SLUG_RE`; test helper `io(api)`.
- Produces: `api.funnelStats(slug, {from, to, by, v})` (GET, `retry: true`); lệnh `ikf stats` (dòng USAGE mới; `deps.now` thay `Date.now` trong test); `formatApiError` cho `analytics_unavailable` → `Analytics chưa bật hoặc ClickHouse không phản hồi (503 analytics_unavailable): xem docs/runbooks/analytics.md`. Thông báo usage: `cách dùng: ikf stats <slug> [--days 7] [--by hour|day]`, `slug không hợp lệ: "<slug>"`, `--days phải là số nguyên từ 1 đến 90`, `--by phải là hour hoặc day`, `--by hour tối đa 14 ngày (dùng --by day)`.

- [ ] **Step 1: Viết test fail**

`packages/cli/test/stats.test.js` (mới):

```js
import { describe, it, expect } from 'vitest';
import { run } from '../src/main.js';
import { createApi } from '../src/api.js';
import { io } from './helpers/io.js';

const NOW = Date.UTC(2026, 9, 8, 10, 37);
const STATS = {
  range: { from: '2026-10-01T10:00:00.000Z', to: '2026-10-08T11:00:00.000Z' },
  by: 'hour',
  versions: [1, 2],
  series: [
    { t: '2026-10-08T09:00:00.000Z', sessions: 3, revenue: [{ currency: 'USD', amount_minor: 1367 }, { currency: 'JPY', amount_minor: 2000 }] },
    { t: '2026-10-08T10:00:00.000Z', sessions: 1, revenue: [{ currency: 'USD', amount_minor: 1367 }] },
  ],
  steps: [{ screen: 0, sessions: 200 }, { screen: 1, sessions: 150 }, { screen: 3, sessions: 40 }],
  milestones: { sessions: 200, page_load: 198, leads: 60, checkout_click: 30, checkout_complete: 12, paid: 10 },
  events: [{ name: 'quiz_done', sessions: 80 }, { name: 'answer', sessions: 75 }],
};

function harness(stats = STATS) {
  const calls = [];
  const t = io({ funnelStats: async (slug, q) => { calls.push([slug, q]); return stats; } });
  t.opts.deps.now = () => NOW;
  return { t, calls };
}

// Spec admin-console-p3 §2: ikf stats <slug> [--days 7] [--by hour|day].
describe('ikf stats', () => {
  it('7 days by hour by default: milestones with % of sessions, screen ladder with % of the first, revenue per currency, other events', async () => {
    const { t, calls } = harness();
    expect(await run(['stats', 'aivideo'], t.opts)).toBe(0);
    expect(calls).toEqual([['aivideo', { from: '2026-10-01T10:37:00.000Z', to: '2026-10-08T10:37:00.000Z', by: 'hour' }]]);
    expect(t.lines).toEqual([
      'aivideo: 2026-10-01T10:00:00.000Z → 2026-10-08T11:00:00.000Z (UTC, theo giờ)',
      'Mốc (session):',
      '  sessions                200  100.0%',
      '  page_load               198   99.0%',
      '  lead                     60   30.0%',
      '  checkout_click           30   15.0%',
      '  checkout_complete        12    6.0%',
      '  paid                     10    5.0%',
      'Screen (session đã xem):',
      '  screen 0                200  100.0%',
      '  screen 1                150   75.0%',
      '  screen 3                 40   20.0%',
      'Doanh thu (gross): 2000 JPY, 27.34 USD',
      'Sự kiện khác: quiz_done 80, answer 75',
    ]);
  });

  it('--days 30 is by day; --by overrides; nothing in the range says so', async () => {
    const empty = { ...STATS, series: [], steps: [], events: [], milestones: { sessions: 0, page_load: 0, leads: 0, checkout_click: 0, checkout_complete: 0, paid: 0 } };
    const { t, calls } = harness(empty);
    expect(await run(['stats', 'aivideo', '--days', '30'], t.opts)).toBe(0);
    expect(await run(['stats', 'aivideo', '--days', '2', '--by', 'day'], t.opts)).toBe(0);
    expect(calls.map((c) => [c[1].by, (Date.parse(c[1].to) - Date.parse(c[1].from)) / 86_400_000])).toEqual([['day', 30], ['day', 2]]);
    expect(t.lines).toContain('  sessions                  0       —');
    expect(t.lines).toContain('  (không có screen_view)');
    expect(t.lines).toContain('Doanh thu (gross): —');
    expect(t.lines.some((l) => l.startsWith('Sự kiện khác'))).toBe(false);
  });

  it.each([
    [['stats'], 'cách dùng: ikf stats <slug> [--days 7] [--by hour|day]'],
    [['stats', 'Bad_Slug'], 'slug không hợp lệ: "Bad_Slug"'],
    [['stats', 'aivideo', '--days', '0'], '--days phải là số nguyên từ 1 đến 90'],
    [['stats', 'aivideo', '--days', '91'], '--days phải là số nguyên từ 1 đến 90'],
    [['stats', 'aivideo', '--days', '1.5'], '--days phải là số nguyên từ 1 đến 90'],
    [['stats', 'aivideo', '--by', 'week'], '--by phải là hour hoặc day'],
    [['stats', 'aivideo', '--days', '15', '--by', 'hour'], '--by hour tối đa 14 ngày (dùng --by day)'],
  ])('exit 2 for %j', async (argv, msg) => {
    const { t, calls } = harness();
    expect(await run(argv, t.opts)).toBe(2);
    expect(t.errors).toEqual([msg]);
    expect(calls).toEqual([]);
  });

  it('analytics unavailable (503 after the retries): exit 1 with what to check', async () => {
    const t = io({ funnelStats: async () => { const { ApiError } = await import('../src/api.js'); throw new ApiError(503, { error: 'analytics_unavailable' }); } });
    expect(await run(['stats', 'aivideo'], t.opts)).toBe(1);
    expect(t.errors).toEqual(['Analytics chưa bật hoặc ClickHouse không phản hồi (503 analytics_unavailable): xem docs/runbooks/analytics.md']);
  });

  it('api.funnelStats: GET with the range in the query string, retried like every read', async () => {
    const calls = [];
    const responses = [new Response('{}', { status: 503 }), new Response(JSON.stringify(STATS), { status: 200 })];
    const api = createApi({ api: 'https://api.x', token: 'ikf_t' }, { fetch: async (url, init) => { calls.push([url, init.method]); return responses.shift(); }, sleep: async () => {} });
    expect(await api.funnelStats('aivideo', { from: '2026-10-01T10:37:00.000Z', to: '2026-10-08T10:37:00.000Z', by: 'day', v: 2 })).toEqual(STATS);
    expect(calls).toEqual([
      ['https://api.x/v1/analytics/funnels/aivideo?from=2026-10-01T10%3A37%3A00.000Z&to=2026-10-08T10%3A37%3A00.000Z&by=day&v=2', 'GET'],
      ['https://api.x/v1/analytics/funnels/aivideo?from=2026-10-01T10%3A37%3A00.000Z&to=2026-10-08T10%3A37%3A00.000Z&by=day&v=2', 'GET'],
    ]);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/cli -- test/stats.test.js 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Test Files  1 failed (1)`, `Tests  11 failed (11)` (lệnh `stats` chưa có → exit 2 với USAGE; `api.funnelStats` không phải hàm).

- [ ] **Step 3: Implement**

`packages/cli/src/api.js`, `packages/cli/src/main.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/packages/cli/src/api.js b/packages/cli/src/api.js
index d91e755..c4ee61b 100644
--- a/packages/cli/src/api.js
+++ b/packages/cli/src/api.js
@@ -83,6 +83,11 @@ export function createApi({ api, token }, { fetch: doFetch = fetch, retries = 3,
     resendEmail: (ref) => call('POST', `/v1/customers/${ref}/resend-email`, { retry: true }),
     // Not retried: a lost reply would rotate twice (the first new user_id is lost with it).
     rotateUserId: (ref) => call('POST', `/v1/customers/${ref}/rotate-user-id`, { retry: false }),
+    // Dashboard numbers of one funnel (spec admin-console-p3 §2); a read, retried like the others.
+    funnelStats: (slug, { from, to, by, v } = {}) => {
+      const qs = new URLSearchParams({ ...(from && { from }), ...(to && { to }), ...(by && { by }), ...(v && { v: String(v) }) }).toString();
+      return call('GET', `/v1/analytics/funnels/${slug}${qs ? `?${qs}` : ''}`, { retry: true });
+    },
     listAdminUsers: () => call('GET', '/v1/admin/users', { retry: true }),
     // Not retried: a lost reply would turn the retry into 409 user_exists.
     createAdminUser: (body) => call('POST', '/v1/admin/users', { body, retry: false }),
diff --git a/packages/cli/src/main.js b/packages/cli/src/main.js
index 4136ce6..7ccfcc6 100755
--- a/packages/cli/src/main.js
+++ b/packages/cli/src/main.js
@@ -37,7 +37,8 @@ const USAGE = `Cách dùng:
   ikf admin add <email> --role viewer|support|editor|admin [--name <tên>]   (người dùng trang admin, đăng nhập Google; support: tra khách, gửi lại email)
   ikf admin ls
   ikf admin disable <email>   (khoá ngay, mọi phiên đăng nhập kết thúc)
-  ikf events replay-dlq --env <staging|prod>   (cần CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN)`;
+  ikf events replay-dlq --env <staging|prod>   (cần CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN)
+  ikf stats <slug> [--days 7] [--by hour|day]   (số liệu funnel: mốc, bậc thang screen, doanh thu; giờ UTC; --by hour tối đa 14 ngày)`;
 
 const where = (r) => `${r.host}${r.prefix === '/' ? '/' : r.prefix}`;
 
@@ -363,7 +364,44 @@ async function billingCommand(api, sub, args, values, out) {
   throw new UsageError(USAGE);
 }
 
+const DAY_MS = 86_400_000;
+// Currencies without minor units (Paddle amounts are in the lowest denomination): 2000 JPY is ¥2000.
+const ZERO_DECIMAL = new Set(['BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF']);
+const money = (minor, currency) => (ZERO_DECIMAL.has(currency) ? `${minor} ${currency}` : `${(minor / 100).toFixed(2)} ${currency}`);
+const pct = (n, base) => (base ? `${((n / base) * 100).toFixed(1)}%` : '—');
+const statLine = (label, n, base) => `  ${label.padEnd(18)} ${String(n).padStart(8)}  ${pct(n, base).padStart(6)}`;
+
+async function statsCommand(api, slug, values, out, now) {
+  if (!slug) throw new UsageError('cách dùng: ikf stats <slug> [--days 7] [--by hour|day]');
+  if (!SLUG_RE.test(slug)) throw new UsageError(`slug không hợp lệ: "${slug}"`);
+  const days = values.days === undefined ? 7 : Number(values.days);
+  if (!Number.isInteger(days) || days < 1 || days > 90) throw new UsageError('--days phải là số nguyên từ 1 đến 90');
+  const by = values.by ?? (days <= 14 ? 'hour' : 'day');
+  if (!['hour', 'day'].includes(by)) throw new UsageError('--by phải là hour hoặc day');
+  if (by === 'hour' && days > 14) throw new UsageError('--by hour tối đa 14 ngày (dùng --by day)');
+  const end = now();
+  const r = await api.funnelStats(slug, { from: new Date(end - days * DAY_MS).toISOString(), to: new Date(end).toISOString(), by });
+  const m = r.milestones;
+  out(`${slug}: ${r.range.from} → ${r.range.to} (UTC, theo ${by === 'hour' ? 'giờ' : 'ngày'})`);
+  out('Mốc (session):');
+  for (const [label, n] of [['sessions', m.sessions], ['page_load', m.page_load], ['lead', m.leads], ['checkout_click', m.checkout_click], ['checkout_complete', m.checkout_complete], ['paid', m.paid]]) {
+    out(statLine(label, n, m.sessions));
+  }
+  out('Screen (session đã xem):');
+  if (!r.steps.length) out('  (không có screen_view)');
+  for (const s of r.steps) out(statLine(`screen ${s.screen}`, s.sessions, r.steps[0].sessions));
+  const revenue = new Map();
+  for (const b of r.series) for (const x of b.revenue) revenue.set(x.currency, (revenue.get(x.currency) ?? 0) + x.amount_minor);
+  const totals = [...revenue].sort(([a], [b]) => (a < b ? -1 : 1)).map(([c, n]) => money(n, c));
+  out(`Doanh thu (gross): ${totals.join(', ') || '—'}`);
+  if (r.events.length) out(`Sự kiện khác: ${r.events.map((e) => `${e.name} ${e.sessions}`).join(', ')}`);
+  return 0;
+}
+
 export function formatApiError(e) {
+  if (e.code === 'analytics_unavailable') {
+    return `Analytics chưa bật hoặc ClickHouse không phản hồi (${e.status} analytics_unavailable): xem docs/runbooks/analytics.md`;
+  }
   if (e.code === 'funnel_change_requires_confirmation') {
     return `Route đang trỏ tới funnel "${e.detail.from}". Chạy lại với --yes để chuyển sang "${e.detail.to}".`;
   }
@@ -471,6 +509,8 @@ export async function run(argv, { out = console.log, err = console.error, env =
         key: { type: 'string' },
         expires: { type: 'string' },
         reason: { type: 'string' },
+        days: { type: 'string' },
+        by: { type: 'string' },
       },
     });
     const [cmd, sub, ...rest] = positionals;
@@ -480,7 +520,7 @@ export async function run(argv, { out = console.log, err = console.error, env =
       out('Đã lưu thông tin đăng nhập.');
       return 0;
     }
-    if (!['route', 'publish', 'funnel', 'events', 'billing', 'app', 'customer', 'admin'].includes(cmd)) throw new UsageError(USAGE);
+    if (!['route', 'publish', 'funnel', 'events', 'billing', 'app', 'customer', 'admin', 'stats'].includes(cmd)) throw new UsageError(USAGE);
     if (cmd === 'events') return await eventsCommand(sub, values, out, env, deps);
     if (cmd === 'publish' && (!sub || !values.slug)) throw new UsageError('cách dùng: ikf publish <folder> --slug <slug>');
     const api = deps.api ?? createApi(await loadCredentials(env));
@@ -493,6 +533,7 @@ export async function run(argv, { out = console.log, err = console.error, env =
     if (cmd === 'app') return await appCommand(api, sub, rest, values, out);
     if (cmd === 'customer') return await customerCommand(api, sub, rest, values, out);
     if (cmd === 'admin') return await adminCommand(api, sub, rest, values, out, err);
+    if (cmd === 'stats') return await statsCommand(api, sub, values, out, deps.now ?? Date.now);
     return await routeCommand(api, sub, rest, values, out);
   } catch (e) {
     if (e instanceof UsageError) {
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/cli -- test/stats.test.js 2>&1 | grep -E "Tests  "
npm test -w @ikf/cli 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  11 passed (11)`; cli `Test Files  15 passed (15)`, `Tests  159 passed (159)`.

- [ ] **Step 5: Commit**

```bash
git add packages/cli
git commit -m "feat(cli): ikf stats <slug> [--days] [--by] (milestones, screen ladder, revenue per currency)"
```

---

### Task 8: SPA — client analytics, `format.js` (`fmtNum`, `fmtPct`, `fmtMoney` không lẻ), `RangePicker`, `LineChart`, `Bars`

**Files:**
- Create: `apps/admin/src/components/RangePicker.jsx`, `apps/admin/src/components/charts/LineChart.jsx`, `apps/admin/src/components/charts/Bars.jsx`
- Modify: `apps/admin/src/api.js`, `apps/admin/src/format.js`, `apps/admin/src/styles.css`
- Test: `apps/admin/test/charts.test.jsx` (mới)

**Interfaces:**
- Consumes: `createClient` (`call`, `q`), `fmtTime` (`format.js`).
- Produces: client `getOverview({from, to})`, `getFunnelStats(slug, {from, to, by, v})`, `getFunnelBreakdown(slug, {from, to, dim, v})` (tham số rỗng/undefined bị bỏ khỏi query string); `format.js`: `ZERO_DECIMAL` (Set), `fmtMoney(minor, currency)` (JPY/KRW/VND… không lẻ; `null` → `—`), `fmtNum(n)` (`1,234,567`; `null` → `—`), `fmtPct(n, base)` (`33.3%`; base 0 → `—`). `RANGES` (`24 h`·`7 d`·`14 d`·`30 d`·`90 d`), `rangeFor(days, now)` → `{from, to, by}` (`by` = hour khi ≤ 14 ngày), `<RangePicker days onChange disabled>` (nút `aria-pressed`, chữ "giờ UTC"). `<LineChart points lines label>` (`viewBox="0 0 640 200"`, `data-testid` `line-<key>`, `y-max`, `x-label`, `bucket` với `<title>`, legend `.legend span`), `COLORS`; `<Bars items label testid>` (`viewBox="0 0 640 <24n+8>"`, mỗi item một `<g data-testid={testid}>` gồm text nhãn, `rect` rộng theo giá trị lớn nhất, text ghi chú).

- [ ] **Step 1: Viết test fail**

`apps/admin/test/charts.test.jsx` (mới):

```jsx
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { createClient } from '../src/api.js';
import { fmtMoney, fmtNum, fmtPct } from '../src/format.js';
import { RangePicker, rangeFor } from '../src/components/RangePicker.jsx';
import { LineChart } from '../src/components/charts/LineChart.jsx';
import { Bars } from '../src/components/charts/Bars.jsx';

const NOW = Date.UTC(2026, 9, 8, 10, 37);

// Spec admin-console-p3 §3: formats, RangePicker, hand-written SVG charts (no chart dependency).
describe('format', () => {
  it('fmtMoney: two decimals, none for zero-decimal currencies (JPY, KRW, VND…); null is —', () => {
    expect([fmtMoney(1367, 'USD'), fmtMoney(2000, 'JPY'), fmtMoney(15000, 'KRW'), fmtMoney(99000, 'VND'), fmtMoney(5, 'EUR'), fmtMoney(null, 'USD')])
      .toEqual(['13.67 USD', '2000 JPY', '15000 KRW', '99000 VND', '0.05 EUR', '—']);
  });
  it('fmtNum with thousands separators; fmtPct of a base, — without one', () => {
    expect([fmtNum(0), fmtNum(1234567), fmtNum(null)]).toEqual(['0', '1,234,567', '—']);
    expect([fmtPct(1, 3), fmtPct(5, 5), fmtPct(0, 7), fmtPct(3, 0)]).toEqual(['33.3%', '100.0%', '0.0%', '—']);
  });
});

describe('RangePicker', () => {
  it('24 h · 7 d · 14 d · 30 d · 90 d, the chosen one pressed, all locked while loading; "giờ UTC"', () => {
    const onChange = vi.fn();
    const { rerender } = render(<RangePicker days={7} onChange={onChange} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.map((b) => [b.textContent, b.getAttribute('aria-pressed')])).toEqual([
      ['24 h', 'false'], ['7 d', 'true'], ['14 d', 'false'], ['30 d', 'false'], ['90 d', 'false'],
    ]);
    fireEvent.click(screen.getByRole('button', { name: '30 d' }));
    expect(onChange).toHaveBeenCalledWith(30);
    expect(screen.getByText('giờ UTC')).toBeTruthy();
    rerender(<RangePicker days={7} onChange={onChange} disabled />);
    expect(screen.getAllByRole('button').every((b) => b.disabled)).toBe(true);
  });
  it('rangeFor: the last N days up to now; by hour up to 14 days, by day beyond', () => {
    expect(rangeFor(1, NOW)).toEqual({ from: '2026-10-07T10:37:00.000Z', to: '2026-10-08T10:37:00.000Z', by: 'hour' });
    expect(rangeFor(14, NOW).by).toBe('hour');
    expect(rangeFor(30, NOW)).toEqual({ from: '2026-09-08T10:37:00.000Z', to: '2026-10-08T10:37:00.000Z', by: 'day' });
  });
});

describe('LineChart', () => {
  const points = [
    { t: '2026-10-08T08:00:00.000Z', sessions: 10, leads: 2 },
    { t: '2026-10-08T09:00:00.000Z', sessions: 20, leads: 5 },
    { t: '2026-10-08T10:00:00.000Z', sessions: 0, leads: 0 },
  ];
  const lines = [{ key: 'sessions', label: 'Sessions' }, { key: 'leads', label: 'Leads' }];

  it('one polyline per series scaled to the largest value, a viewBox (no fixed size), legend, time axis in UTC', () => {
    const { container } = render(<LineChart points={points} lines={lines} label="Theo giờ" />);
    const svg = container.querySelector('svg');
    expect(svg.getAttribute('viewBox')).toBe('0 0 640 200');
    expect(svg.getAttribute('width')).toBeNull();
    expect(svg.getAttribute('aria-label')).toBe('Theo giờ');
    expect(screen.getByTestId('line-sessions').getAttribute('points')).toBe('40.0,92.0 336.0,8.0 632.0,176.0');
    expect(screen.getByTestId('line-leads').getAttribute('points')).toBe('40.0,159.2 336.0,134.0 632.0,176.0');
    expect(screen.getByTestId('y-max').textContent).toBe('20');
    expect([...container.querySelectorAll('[data-testid="x-label"]')].map((t) => t.textContent)).toEqual(['2026-10-08 08:00', '2026-10-08 10:00']);
    expect([...container.querySelectorAll('.legend span')].map((s) => s.textContent)).toEqual(['Sessions', 'Leads']);
  });

  it('hover: each bucket has a tooltip with its time and values', () => {
    render(<LineChart points={points} lines={lines} label="x" />);
    const buckets = screen.getAllByTestId('bucket');
    expect(buckets).toHaveLength(3);
    expect(buckets[1].querySelector('title').textContent).toBe('2026-10-08 09:00 · Sessions 20 · Leads 5');
  });

  it('a single point sits in the middle; no point draws nothing', () => {
    render(<LineChart points={[points[0]]} lines={lines.slice(0, 1)} label="x" />);
    expect(screen.getByTestId('line-sessions').getAttribute('points')).toBe('336.0,8.0');
    const { container } = render(<LineChart points={[]} lines={lines} label="y" />);
    expect(container.querySelectorAll('polyline')).toHaveLength(0);
  });
});

describe('Bars', () => {
  it('one bar per item, width proportional to the largest, label and note as text', () => {
    const items = [{ label: 'screen 0', value: 200, note: '200 · 100.0%' }, { label: 'screen 1', value: 50, note: '50 · 25.0%' }];
    const { container } = render(<Bars items={items} testid="step" label="Bậc thang screen" />);
    expect(container.querySelector('svg').getAttribute('viewBox')).toBe('0 0 640 56');
    const bars = screen.getAllByTestId('step');
    expect(bars.map((b) => [b.querySelectorAll('text')[0].textContent, b.querySelector('rect').getAttribute('width'), b.querySelectorAll('text')[1].textContent])).toEqual([
      ['screen 0', '380.0', '200 · 100.0%'],
      ['screen 1', '95.0', '50 · 25.0%'],
    ]);
  });
});

describe('client: analytics', () => {
  it('getOverview, getFunnelStats, getFunnelBreakdown send the range and filters in the query string', async () => {
    const calls = [];
    const c = createClient({ base: 'https://api.test', fetch: async (url) => { calls.push(url); return new Response('{}'); } });
    const r = { from: '2026-10-01T10:37:00.000Z', to: '2026-10-08T10:37:00.000Z' };
    await c.getOverview(r);
    await c.getFunnelStats('aivideo', { ...r, by: 'hour', v: '' });
    await c.getFunnelBreakdown('aivideo', { ...r, dim: 'utm_source', v: 2 });
    expect(calls).toEqual([
      'https://api.test/v1/analytics/overview?from=2026-10-01T10%3A37%3A00.000Z&to=2026-10-08T10%3A37%3A00.000Z',
      'https://api.test/v1/analytics/funnels/aivideo?from=2026-10-01T10%3A37%3A00.000Z&to=2026-10-08T10%3A37%3A00.000Z&by=hour',
      'https://api.test/v1/analytics/funnels/aivideo/breakdown?from=2026-10-01T10%3A37%3A00.000Z&to=2026-10-08T10%3A37%3A00.000Z&dim=utm_source&v=2',
    ]);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/admin -- test/charts.test.jsx 2>&1 | grep -E "^Error|Test Files|Tests  "
```

Expected: `Error: Failed to resolve import "../src/components/RangePicker.jsx" from "test/charts.test.jsx". Does the file exist?`, `Test Files  1 failed (1)`, `Tests  no tests`.

- [ ] **Step 3: Implement**

`apps/admin/src/components/RangePicker.jsx` (mới):

```jsx
const DAY = 86_400_000;

export const RANGES = [
  { days: 1, label: '24 h' },
  { days: 7, label: '7 d' },
  { days: 14, label: '14 d' },
  { days: 30, label: '30 d' },
  { days: 90, label: '90 d' },
];

// The last `days` days up to now: by hour up to 14 days (the API's limit), by day beyond (spec admin-console-p3 §3).
export const rangeFor = (days, now = Date.now()) => ({
  from: new Date(now - days * DAY).toISOString(),
  to: new Date(now).toISOString(),
  by: days <= 14 ? 'hour' : 'day',
});

export function RangePicker({ days, onChange, disabled = false }) {
  return (
    <div className="row range" role="group" aria-label="Khoảng thời gian">
      {RANGES.map((r) => (
        <button key={r.days} type="button" aria-pressed={r.days === days} disabled={disabled} onClick={() => onChange(r.days)}>
          {r.label}
        </button>
      ))}
      <span className="muted">giờ UTC</span>
    </div>
  );
}
```

`apps/admin/src/components/charts/LineChart.jsx` (mới):

```jsx
import { fmtTime } from '../../format.js';

const W = 640;
const H = 200;
const PAD = { l: 40, r: 8, t: 8, b: 24 };
export const COLORS = ['#2457d6', '#1a7f37', '#9a6700', '#b42318'];

// Series over time as inline SVG (spec admin-console-p3 §3: no chart dependency). points = [{t (ISO), [key]: n}],
// lines = [{key, label}]. Scales to the viewBox (CSS sets the width); a native <title> per bucket is the tooltip.
export function LineChart({ points, lines, label }) {
  const max = Math.max(1, ...points.flatMap((p) => lines.map((l) => p[l.key] ?? 0)));
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;
  const x = (i) => PAD.l + (points.length > 1 ? (i * plotW) / (points.length - 1) : plotW / 2);
  const y = (v) => PAD.t + plotH * (1 - v / max);
  const step = points.length > 1 ? plotW / (points.length - 1) : plotW;
  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        <line x1={PAD.l} y1={PAD.t + plotH} x2={W - PAD.r} y2={PAD.t + plotH} className="axis" />
        <text x={PAD.l - 6} y={PAD.t + 10} textAnchor="end" data-testid="y-max">{max}</text>
        <text x={PAD.l - 6} y={PAD.t + plotH} textAnchor="end">0</text>
        {points.length > 0 && (
          <>
            <text x={PAD.l} y={H - 6} data-testid="x-label">{fmtTime(points[0].t)}</text>
            {points.length > 1 && <text x={W - PAD.r} y={H - 6} textAnchor="end" data-testid="x-label">{fmtTime(points.at(-1).t)}</text>}
          </>
        )}
        {points.length > 0 && lines.map((l, k) => (
          <polyline
            key={l.key}
            data-testid={`line-${l.key}`}
            points={points.map((p, i) => `${x(i).toFixed(1)},${y(p[l.key] ?? 0).toFixed(1)}`).join(' ')}
            fill="none"
            stroke={COLORS[k % COLORS.length]}
            strokeWidth="2"
          />
        ))}
        {points.map((p, i) => (
          <rect key={p.t} data-testid="bucket" x={x(i) - step / 2} y={PAD.t} width={step} height={plotH} fill="transparent">
            <title>{[fmtTime(p.t), ...lines.map((l) => `${l.label} ${p[l.key] ?? 0}`)].join(' · ')}</title>
          </rect>
        ))}
      </svg>
      <figcaption className="legend">
        {lines.map((l, k) => <span key={l.key} style={{ borderColor: COLORS[k % COLORS.length] }}>{l.label}</span>)}
      </figcaption>
    </figure>
  );
}
```

`apps/admin/src/components/charts/Bars.jsx` (mới):

```jsx
const W = 640;
const ROW = 24;
const LABEL = 120;
const NOTE = 140;

// Horizontal bars as inline SVG: items = [{label, value, note}], widths relative to the largest value.
export function Bars({ items, label, testid = 'bar' }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <svg viewBox={`0 0 ${W} ${items.length * ROW + 8}`} role="img" aria-label={label} className="bars">
      {items.map((it, i) => (
        <g key={it.label} data-testid={testid} transform={`translate(0 ${i * ROW})`}>
          <text x="0" y="16">{it.label}</text>
          <rect x={LABEL} y="4" height="16" width={(((W - LABEL - NOTE) * it.value) / max).toFixed(1)} />
          <text x={W - NOTE + 8} y="16">{it.note}</text>
        </g>
      ))}
    </svg>
  );
}
```

`apps/admin/src/api.js`, `apps/admin/src/format.js`, `apps/admin/src/styles.css` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/src/api.js b/apps/admin/src/api.js
index ccecf37..519048e 100644
--- a/apps/admin/src/api.js
+++ b/apps/admin/src/api.js
@@ -71,6 +71,10 @@ export function createClient({ base = API_BASE, fetch = (...a) => globalThis.fet
   }
 
   const q = encodeURIComponent;
+  const query = (params = {}) => {
+    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null).map(([k, v]) => [k, String(v)])).toString();
+    return qs ? `?${qs}` : '';
+  };
   return {
     setOnUnauthorized: (fn) => {
       onUnauthorized = fn;
@@ -114,6 +118,10 @@ export function createClient({ base = API_BASE, fetch = (...a) => globalThis.fet
       const qs = new URLSearchParams({ ...(topic && { topic }), ...(before && { before_id: String(before) }) }).toString();
       return call('GET', `/v1/billing/outbox${qs ? `?${qs}` : ''}`);
     },
+    // Dashboard (spec admin-console-p3 §3); empty filters are left out of the query string.
+    getOverview: (params) => call('GET', `/v1/analytics/overview${query(params)}`),
+    getFunnelStats: (slug, params) => call('GET', `/v1/analytics/funnels/${q(slug)}${query(params)}`),
+    getFunnelBreakdown: (slug, params) => call('GET', `/v1/analytics/funnels/${q(slug)}/breakdown${query(params)}`),
     listUsers: () => call('GET', '/v1/admin/users'),
     createUser: (body) => call('POST', '/v1/admin/users', body),
     updateUser: (id, body) => call('PUT', `/v1/admin/users/${id}`, body),
diff --git a/apps/admin/src/format.js b/apps/admin/src/format.js
index 6b215f5..4bb8848 100644
--- a/apps/admin/src/format.js
+++ b/apps/admin/src/format.js
@@ -3,8 +3,18 @@ export const fmtTime = (iso) => (iso ? iso.slice(0, 16).replace('T', ' ') : '—
 export const fmtSize = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
 export const fmtLive = (live) => live.map((l) => `${l.host}${l.prefix} v${l.v}`).join(', ') || '—';
 
-// Money in minor units: 1367 USD → "13.67 USD".
-export const fmtMoney = (minor, currency) => (minor === null || minor === undefined ? '—' : `${(minor / 100).toFixed(2)} ${currency ?? ''}`.trim());
+// Currencies without minor units (Paddle amounts are in the lowest denomination: 2000 JPY is ¥2000).
+export const ZERO_DECIMAL = new Set(['BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF']);
+// Money in minor units: 1367 USD → "13.67 USD", 2000 JPY → "2000 JPY".
+export const fmtMoney = (minor, currency) => {
+  if (minor === null || minor === undefined) return '—';
+  const digits = ZERO_DECIMAL.has(currency) ? 0 : 2;
+  return `${(minor / 10 ** digits).toFixed(digits)} ${currency ?? ''}`.trim();
+};
+const NUM = new Intl.NumberFormat('en-US');
+export const fmtNum = (n) => (n === null || n === undefined ? '—' : NUM.format(n));
+// n as a share of base: "33.3%"; no base → "—".
+export const fmtPct = (n, base) => (base ? `${((n / base) * 100).toFixed(1)}%` : '—');
 const UNITS = { day: 'ngày', week: 'tuần', month: 'tháng', year: 'năm' };
 export const fmtInterval = (i) => (i ? `/${i.frequency === 1 ? '' : `${i.frequency} `}${UNITS[i.unit] ?? i.unit}` : ' (một lần)');
 // A Paddle price in a picker: "Starlyn premium · Weekly — 13.67 USD/tuần" (+ " (archived)").
diff --git a/apps/admin/src/styles.css b/apps/admin/src/styles.css
index 7d1cd29..8577114 100644
--- a/apps/admin/src/styles.css
+++ b/apps/admin/src/styles.css
@@ -35,3 +35,10 @@ dialog, .dialog { border: 1px solid #c8ced8; border-radius: 8px; padding: 16px;
 .form label { display: flex; flex-direction: column; gap: 4px; margin: 8px 0; max-width: 480px; font-size: 13px; color: #5a6475; }
 .secrets { border-color: #9a6700; }
 .secrets code { word-break: break-all; }
+.chart { margin: 0; }
+.chart svg, svg.bars { width: 100%; height: auto; display: block; }
+.chart text, svg.bars text { font-size: 11px; fill: #5a6475; }
+.chart .axis { stroke: #c8ced8; }
+svg.bars rect { fill: #2457d6; }
+.legend { display: flex; gap: 12px; font-size: 13px; }
+.legend span { border-left: 12px solid; padding-left: 6px; }
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/admin -- test/charts.test.jsx 2>&1 | grep -E "Tests  "
npm test -w @ikf/admin 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  9 passed (9)`; admin `Test Files  13 passed (13)`, `Tests  114 passed (114)` (test cũ dùng `fmtMoney`/`priceLabel` với USD không đổi).

- [ ] **Step 5: Commit**

```bash
git add apps/admin
git commit -m "feat(admin): analytics client, fmtNum/fmtPct, fmtMoney for zero-decimal currencies, RangePicker, SVG LineChart and Bars"
```

---

### Task 9: SPA **Dashboard** ở `/` (bảng overview, sắp xếp, khoảng, thẻ "chưa bật", request token), menu "Dashboard" đầu tiên

**Files:**
- Create: `apps/admin/src/components/AnalyticsState.jsx`, `apps/admin/src/pages/Dashboard.jsx`
- Modify: `apps/admin/src/App.jsx`, `apps/admin/src/Layout.jsx`, `apps/admin/src/styles.css`
- Test: `apps/admin/test/dashboard.test.jsx` (mới); Modify: `apps/admin/test/auth.test.jsx`, `apps/admin/test/grants.test.jsx`, `apps/admin/test/helpers.jsx`

**Interfaces:**
- Consumes: `getOverview` (Task 8 client; Task 6 route), `RangePicker`/`rangeFor`, `fmtMoney`/`fmtNum`/`fmtPct` (Task 8), `ErrorNote`, `useAuth`; test `fakeClient`, `renderApp`, `ME`.
- Produces: `analyticsOff(err)` (503 `analytics_unavailable` hoặc 404 khác `funnel_not_found`), `<AnalyticsError error>` (thẻ `data-testid="analytics-off"`: "Analytics chưa bật hoặc ClickHouse không phản hồi. Thử lại sau, hoặc báo người vận hành (runbook analytics)." hoặc `ErrorNote`), `<Loading>` (`data-testid="loading"`, class `skeleton`) — dùng lại ở Task 10. `Dashboard` ở route index `/` (thay `Navigate` sang `/funnels`), hàng `data-testid="overview-row"` (Funnel · Sessions · Leads · Checkouts · Paid · Paid/session · Doanh thu · Refund), tiêu đề cột là nút sắp xếp; `NAV[0] = {to: '/', label: 'Dashboard', need: 'viewer', end: true}`. Fake client thêm `getOverview`.

- [ ] **Step 1: Viết test fail**

`apps/admin/test/dashboard.test.jsx` (mới):

```jsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StrictMode } from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ApiError } from '../src/api.js';
import { App } from '../src/App.jsx';
import { fakeClient, renderApp, ME } from './helpers.jsx';

const NOW = Date.UTC(2026, 9, 8, 10, 37);
const RANGE = { from: '2026-10-01T10:00:00.000Z', to: '2026-10-08T11:00:00.000Z' };
const OVERVIEW = {
  range: RANGE,
  funnels: [
    { slug: 'aivideo', sessions: 1200, leads: 300, checkouts: 40, paid: 12, revenue: [{ currency: 'JPY', amount_minor: 2000 }, { currency: 'USD', amount_minor: 16404 }], refunds: [{ currency: 'USD', amount_minor: 1367 }] },
    { slug: 'tarot', sessions: 90, leads: 20, checkouts: 5, paid: 3, revenue: [{ currency: 'USD', amount_minor: 2997 }], refunds: [] },
    { slug: 'quiz-only', sessions: 400, leads: 0, checkouts: 0, paid: 0, revenue: [], refunds: [] },
  ],
};
const cells = (row) => within(row).getAllByRole('cell').map((c) => c.textContent);
const slugs = () => screen.getAllByTestId('overview-row').map((r) => cells(r)[0]);

// Spec admin-console-p3 §3 "Dashboard".
describe('Dashboard', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
  });
  afterEach(() => vi.useRealTimers());

  it('is the home page and the first menu item; one row per funnel with rates, money per currency (JPY without decimals), refunds', async () => {
    const client = fakeClient(ME.viewer, { getOverview: vi.fn(async () => OVERVIEW) });
    renderApp(client, '/');
    const rows = await screen.findAllByTestId('overview-row');
    expect(within(screen.getByRole('navigation')).getAllByRole('link')[0].textContent).toBe('Dashboard');
    expect(client.getOverview).toHaveBeenCalledWith({ from: '2026-10-01T10:37:00.000Z', to: '2026-10-08T10:37:00.000Z' });
    expect(rows.map(cells)).toEqual([
      ['aivideo', '1,200', '300', '40', '12', '1.0%', '2000 JPY164.04 USD', '13.67 USD'],
      ['quiz-only', '400', '0', '0', '0', '0.0%', '—', '—'],
      ['tarot', '90', '20', '5', '3', '3.3%', '29.97 USD', '—'],
    ]);
    expect(within(rows[0]).getByRole('link', { name: 'aivideo' }).getAttribute('href')).toBe('/funnels/aivideo');
    expect(screen.getByText('giờ UTC')).toBeTruthy();
  });

  it('sorts by any column, client-side: click again to flip', async () => {
    const client = fakeClient(ME.viewer, { getOverview: vi.fn(async () => OVERVIEW) });
    renderApp(client, '/');
    await screen.findAllByTestId('overview-row');
    fireEvent.click(screen.getByRole('button', { name: 'Paid' }));
    expect(slugs()).toEqual(['aivideo', 'tarot', 'quiz-only']);
    fireEvent.click(screen.getByRole('button', { name: 'Paid' }));
    expect(slugs()).toEqual(['quiz-only', 'tarot', 'aivideo']);
    fireEvent.click(screen.getByRole('button', { name: 'Paid/session' }));
    expect(slugs()).toEqual(['tarot', 'aivideo', 'quiz-only']);
    fireEvent.click(screen.getByRole('button', { name: 'Funnel' }));
    expect(slugs()).toEqual(['aivideo', 'quiz-only', 'tarot']);
    expect(client.getOverview).toHaveBeenCalledTimes(1);
  });

  it('a new range: buttons locked while loading, grey placeholder, then the new rows', async () => {
    const pending = [];
    const client = fakeClient(ME.viewer, { getOverview: vi.fn(() => new Promise((resolve) => pending.push(resolve))) });
    renderApp(client, '/');
    await waitFor(() => expect(pending).toHaveLength(1));
    expect(screen.getByTestId('loading')).toBeTruthy();
    expect(screen.getByRole('button', { name: '30 d' }).disabled).toBe(true);
    pending[0](OVERVIEW);
    await screen.findAllByTestId('overview-row');
    fireEvent.click(screen.getByRole('button', { name: '30 d' }));
    expect(client.getOverview).toHaveBeenLastCalledWith({ from: '2026-09-08T10:37:00.000Z', to: '2026-10-08T10:37:00.000Z' });
    expect(screen.getByRole('button', { name: '7 d' }).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: '30 d' })); // locked: no third request
    expect(client.getOverview).toHaveBeenCalledTimes(2);
    pending[1]({ range: RANGE, funnels: [OVERVIEW.funnels[1]] });
    await waitFor(() => expect(slugs()).toEqual(['tarot']));
    expect(screen.getByRole('button', { name: '30 d' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('request token: of two answers in flight (React StrictMode runs the effect twice), only the newest is shown', async () => {
    const pending = [];
    const client = fakeClient(ME.viewer, { getOverview: vi.fn(() => new Promise((resolve) => pending.push(resolve))) });
    render(
      <StrictMode>
        <MemoryRouter initialEntries={['/']}>
          <App client={client} />
        </MemoryRouter>
      </StrictMode>,
    );
    await waitFor(() => expect(pending).toHaveLength(2));
    pending[1]({ range: RANGE, funnels: [OVERVIEW.funnels[1]] });
    await waitFor(() => expect(slugs()).toEqual(['tarot']));
    pending[0](OVERVIEW);
    await new Promise((r) => setTimeout(r, 20));
    expect(slugs()).toEqual(['tarot']);
  });

  it.each([
    ['503 analytics_unavailable', new ApiError(503, { error: 'analytics_unavailable' })],
    ['404 (analytics routes not registered)', new ApiError(404, { error: 'Not Found' })],
  ])('%s: the "chưa bật" card, the page and range picker still there', async (_, err) => {
    renderApp(fakeClient(ME.viewer, { getOverview: vi.fn(async () => { throw err; }) }), '/');
    expect((await screen.findByTestId('analytics-off')).textContent).toBe('Analytics chưa bật hoặc ClickHouse không phản hồi. Thử lại sau, hoặc báo người vận hành (runbook analytics).');
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '7 d' }).disabled).toBe(false);
  });

  it('another error is shown as an error; nothing in the range says so', async () => {
    renderApp(fakeClient(ME.viewer, { getOverview: vi.fn(async () => { throw new ApiError(500, { error: 'internal' }, 'req-1'); }) }), '/');
    expect((await screen.findByRole('alert')).textContent).toBe('Lỗi máy chủ (internal), request id req-1.');
    renderApp(fakeClient(ME.viewer, { getOverview: vi.fn(async () => ({ range: RANGE, funnels: [] })) }), '/');
    expect(await screen.findByText('Chưa có sự kiện trong khoảng này.')).toBeTruthy();
  });
});
```

`apps/admin/test/auth.test.jsx`, `apps/admin/test/grants.test.jsx`, `apps/admin/test/helpers.jsx` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/test/auth.test.jsx b/apps/admin/test/auth.test.jsx
index a29d158..f2c929c 100644
--- a/apps/admin/test/auth.test.jsx
+++ b/apps/admin/test/auth.test.jsx
@@ -3,10 +3,11 @@ import { act, cleanup, fireEvent, screen, waitFor } from '@testing-library/react
 import { fakeClient, renderApp, ME } from './helpers.jsx';
 
 describe('sign-in gate and layout', () => {
-  it('signed in: the layout shows the email and role, and / goes to Funnels', async () => {
+  it('signed in: the layout shows the email and role, and / is the Dashboard', async () => {
     renderApp(fakeClient(ME.editor), '/');
     expect(await screen.findByTestId('who')).toHaveProperty('textContent', 'ed@ikameglobal.com · editor');
-    await waitFor(() => expect(screen.getByRole('link', { name: 'Funnels' }).getAttribute('aria-current')).toBe('page'));
+    await waitFor(() => expect(screen.getByRole('link', { name: 'Dashboard' }).getAttribute('aria-current')).toBe('page'));
+    expect(screen.getByRole('link', { name: 'Funnels' }).getAttribute('aria-current')).toBeNull();
   });
 
   it('signed out: Login with the Google button keeping the path to return to', async () => {
diff --git a/apps/admin/test/grants.test.jsx b/apps/admin/test/grants.test.jsx
index fdc20f4..656f44b 100644
--- a/apps/admin/test/grants.test.jsx
+++ b/apps/admin/test/grants.test.jsx
@@ -51,10 +51,10 @@ describe('nav by grants', () => {
   };
 
   it.each([
-    ['viewer', ['Funnels', 'Domains', 'Audit']],
-    ['support', ['Funnels', 'Khách hàng', 'Domains', 'Audit']],
-    ['editor', ['Funnels', 'Apps', 'Domains', 'Audit']],
-    ['admin', ['Funnels', 'Apps', 'Khách hàng', 'Domains', 'Billing', 'Audit', 'Settings']],
+    ['viewer', ['Dashboard', 'Funnels', 'Domains', 'Audit']],
+    ['support', ['Dashboard', 'Funnels', 'Khách hàng', 'Domains', 'Audit']],
+    ['editor', ['Dashboard', 'Funnels', 'Apps', 'Domains', 'Audit']],
+    ['admin', ['Dashboard', 'Funnels', 'Apps', 'Khách hàng', 'Domains', 'Billing', 'Audit', 'Settings']],
   ])('%s sees %j', async (role, items) => {
     expect(await navOf(ME[role])).toEqual(items);
   });
diff --git a/apps/admin/test/helpers.jsx b/apps/admin/test/helpers.jsx
index d34243c..4c6ff9f 100644
--- a/apps/admin/test/helpers.jsx
+++ b/apps/admin/test/helpers.jsx
@@ -51,6 +51,7 @@ export function fakeClient(me = ME.admin, overrides = {}) {
     revokeGrant: vi.fn(),
     reconcile: vi.fn(),
     listOutbox: vi.fn(async () => ({ items: [] })),
+    getOverview: vi.fn(async () => ({ range: { from: '2026-10-01T00:00:00.000Z', to: '2026-10-08T00:00:00.000Z' }, funnels: [] })),
     ...overrides,
   };
   return client;
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/admin -- test/dashboard.test.jsx test/grants.test.jsx test/auth.test.jsx 2>&1 | grep -E "Test Files|Tests  "
```

Expected: 7 test Dashboard FAIL (hết giờ chờ `overview-row`/`analytics-off`), 4 test `nav by grants` và `signed in: … / is the Dashboard` FAIL (chưa có mục Dashboard); `Test Files  3 failed (3)`, `Tests  12 failed | 14 passed (26)`.

- [ ] **Step 3: Implement**

`apps/admin/src/components/AnalyticsState.jsx` (mới):

```jsx
import { ErrorNote } from './ErrorNote.jsx';

// Analytics off (core without the ClickHouse reader: the routes are not registered → 404 that is not
// funnel_not_found) or ClickHouse not answering (503 analytics_unavailable): one card, the page stays usable.
export const analyticsOff = (err) => (err?.status === 503 && err.code === 'analytics_unavailable') || (err?.status === 404 && err.code !== 'funnel_not_found');

export function AnalyticsError({ error }) {
  if (!error) return null;
  if (!analyticsOff(error)) return <ErrorNote error={error} />;
  return (
    <p className="card warn" data-testid="analytics-off">
      Analytics chưa bật hoặc ClickHouse không phản hồi. Thử lại sau, hoặc báo người vận hành (runbook analytics).
    </p>
  );
}

export const Loading = () => <div className="skeleton" data-testid="loading" aria-label="Đang tải" />;
```

`apps/admin/src/pages/Dashboard.jsx` (mới):

```jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../auth.jsx';
import { AnalyticsError, Loading } from '../components/AnalyticsState.jsx';
import { RangePicker, rangeFor } from '../components/RangePicker.jsx';
import { fmtMoney, fmtNum, fmtPct } from '../format.js';

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

// Dashboard (spec admin-console-p3 §3): one row per funnel with events or a checkout in the range.
export function Dashboard() {
  const { client } = useAuth();
  const [days, setDays] = useState(7);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState({ key: 'sessions', desc: true });
  const seq = useRef(0);

  useEffect(() => {
    const n = ++seq.current; // only the newest request may change the page
    const { from, to } = rangeFor(days);
    setLoading(true);
    setError(null);
    client.getOverview({ from, to }).then(
      (r) => n === seq.current && (setData(r), setLoading(false)),
      (err) => n === seq.current && (setError(err), setData(null), setLoading(false)),
    );
  }, [client, days]);

  const rows = useMemo(() => {
    const out = [...(data?.funnels ?? [])].sort(SORTS[sort.key]);
    return sort.desc ? out.reverse() : out;
  }, [data, sort]);
  const sortBy = (key) => setSort((s) => (s.key === key ? { key, desc: !s.desc } : { key, desc: key !== 'slug' }));

  return (
    <section>
      <h1>Dashboard</h1>
      <RangePicker days={days} onChange={setDays} disabled={loading} />
      <AnalyticsError error={error} />
      {loading && <Loading />}
      {!loading && data && !rows.length && <p className="muted">Chưa có sự kiện trong khoảng này.</p>}
      {!loading && rows.length > 0 && (
        <table>
          <thead>
            <tr>
              {HEADERS.map(([key, label]) => (
                <th key={key} aria-sort={sort.key === key ? (sort.desc ? 'descending' : 'ascending') : undefined}>
                  <button type="button" className="link" onClick={() => sortBy(key)}>{label}</button>
                </th>
              ))}
              <th>Doanh thu</th>
              <th>Refund</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((f) => (
              <tr key={f.slug} data-testid="overview-row">
                <td><Link to={`/funnels/${f.slug}`}>{f.slug}</Link></td>
                <td>{fmtNum(f.sessions)}</td>
                <td>{fmtNum(f.leads)}</td>
                <td>{fmtNum(f.checkouts)}</td>
                <td>{fmtNum(f.paid)}</td>
                <td>{fmtPct(f.paid, f.sessions)}</td>
                <td><Money items={f.revenue} /></td>
                <td><Money items={f.refunds} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
```

`apps/admin/src/App.jsx`, `apps/admin/src/Layout.jsx`, `apps/admin/src/styles.css` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/src/App.jsx b/apps/admin/src/App.jsx
index cf378a7..e147bfc 100644
--- a/apps/admin/src/App.jsx
+++ b/apps/admin/src/App.jsx
@@ -1,4 +1,4 @@
-import { Navigate, Route, Routes } from 'react-router';
+import { Route, Routes } from 'react-router';
 import { AuthProvider, RequireAuth } from './auth.jsx';
 import { Layout } from './Layout.jsx';
 import { RequireGrant } from './components/RequireGrant.jsx';
@@ -7,6 +7,7 @@ import { Apps } from './pages/Apps.jsx';
 import { Audit } from './pages/Audit.jsx';
 import { Billing } from './pages/Billing.jsx';
 import { CustomerDetail } from './pages/CustomerDetail.jsx';
+import { Dashboard } from './pages/Dashboard.jsx';
 import { Customers } from './pages/Customers.jsx';
 import { Domains } from './pages/Domains.jsx';
 import { FunnelDetail } from './pages/FunnelDetail.jsx';
@@ -20,7 +21,7 @@ export function App({ client }) {
       <Routes>
         <Route path="/login" element={<Login />} />
         <Route element={<RequireAuth><Layout /></RequireAuth>}>
-          <Route index element={<Navigate to="/funnels" replace />} />
+          <Route index element={<Dashboard />} />
           <Route path="/funnels" element={<Funnels />} />
           <Route path="/funnels/:slug" element={<FunnelDetail />} />
           <Route path="/apps" element={<RequireGrant need="apps:read"><Apps /></RequireGrant>} />
diff --git a/apps/admin/src/Layout.jsx b/apps/admin/src/Layout.jsx
index 54a8207..8cb2c75 100644
--- a/apps/admin/src/Layout.jsx
+++ b/apps/admin/src/Layout.jsx
@@ -4,6 +4,7 @@ import { can } from './roles.js';
 
 // The side menu, in order; an item shows only for roles that have its grant (spec admin-console-p2 §3).
 export const NAV = [
+  { to: '/', label: 'Dashboard', need: 'viewer', end: true },
   { to: '/funnels', label: 'Funnels', need: 'viewer' },
   { to: '/apps', label: 'Apps', need: 'apps:read' },
   { to: '/customers', label: 'Khách hàng', need: 'support' },
@@ -19,7 +20,7 @@ export function Layout() {
     <div className="shell">
       <nav className="side">
         <strong className="brand">iFunnel</strong>
-        {NAV.filter((n) => can(me.role, n.need)).map((n) => <NavLink key={n.to} to={n.to}>{n.label}</NavLink>)}
+        {NAV.filter((n) => can(me.role, n.need)).map((n) => <NavLink key={n.to} to={n.to} end={n.end}>{n.label}</NavLink>)}
       </nav>
       <div className="main">
         <header className="top">
diff --git a/apps/admin/src/styles.css b/apps/admin/src/styles.css
index 8577114..61584e8 100644
--- a/apps/admin/src/styles.css
+++ b/apps/admin/src/styles.css
@@ -42,3 +42,7 @@ dialog, .dialog { border: 1px solid #c8ced8; border-radius: 8px; padding: 16px;
 svg.bars rect { fill: #2457d6; }
 .legend { display: flex; gap: 12px; font-size: 13px; }
 .legend span { border-left: 12px solid; padding-left: 6px; }
+.skeleton { height: 160px; border-radius: 8px; margin: 16px 0; background: linear-gradient(90deg, #eef0f4, #f6f7f9, #eef0f4); }
+.range { margin: 8px 0; }
+.range [aria-pressed='true'] { background: #1d2330; border-color: #1d2330; color: #fff; }
+button.link { border: 0; padding: 0; background: none; color: inherit; font-weight: 600; }
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/admin -- test/dashboard.test.jsx test/grants.test.jsx test/auth.test.jsx 2>&1 | grep -E "Tests  "
npm test -w @ikf/admin 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  26 passed (26)`; admin `Test Files  14 passed (14)`, `Tests  121 passed (121)`.

- [ ] **Step 5: Commit**

```bash
git add apps/admin
git commit -m "feat(admin): Dashboard at / (overview per funnel, sortable, range picker, analytics-off card, request token); Dashboard first in the menu"
```

---

### Task 10: SPA Funnel detail → tab **Số liệu** (mặc định): biểu đồ, bậc thang screen, mốc, breakdown, "Sự kiện khác"

**Files:**
- Create: `apps/admin/src/components/StatsTab.jsx`
- Modify: `apps/admin/src/pages/FunnelDetail.jsx`, `apps/admin/src/styles.css`
- Test: `apps/admin/test/stats-tab.test.jsx` (mới); Modify: `apps/admin/test/funnels.test.jsx`, `apps/admin/test/publish.test.jsx`, `apps/admin/test/helpers.jsx`, `demo/test/admin-e2e.test.mjs`

**Interfaces:**
- Consumes: `getFunnelStats`, `getFunnelBreakdown` (Task 8), `RangePicker`/`rangeFor`, `LineChart`, `Bars`, `fmtMoney`/`fmtNum`/`fmtPct` (Task 8), `AnalyticsError`/`analyticsOff`/`Loading` (Task 9), `PricesTab`, `can`.
- Produces: `<StatsTab slug>`: `RangePicker` + `select aria-label="Version"` ("Mọi version", `v1`…), `LineChart` (sessions · leads · checkout_complete · paid), `data-testid="milestone"` × 5 (`page_load → lead → checkout_click → checkout_complete → paid`, "rơi x%"), `Bars testid="step"` (nhãn `screen k`, ghi chú `n · x%`), bảng `aria-label="Sự kiện khác"`, tablist `aria-label="Chiều"` (Version · Nguồn · Campaign · Quốc gia · Thiết bị), hàng `data-testid="breakdown-row"` (khoá `v2`, `(không có)`), cột tiền "—" + "Doanh thu không có theo chiều này (checkout không lưu quốc gia, thiết bị)."; mọi nút/select khoá khi đang tải. `FunnelDetail`: tab theo `?tab=` (mặc định Số liệu; `main` = Tổng quan; `prices` = Giá khi có `prices:read`). Fake client thêm `getFunnelStats`, `getFunnelBreakdown`.

- [ ] **Step 1: Viết test fail**

`apps/admin/test/stats-tab.test.jsx` (mới):

```jsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { ApiError } from '../src/api.js';
import { fakeClient, renderApp, ME } from './helpers.jsx';

const NOW = Date.UTC(2026, 9, 8, 10, 37);
const DETAIL = { slug: 'aivideo', pixel_id: null, app_id: null, versions: [], live: [] };
const bucket = (h, o = {}) => ({ t: `2026-10-08T${String(h).padStart(2, '0')}:00:00.000Z`, sessions: 0, page_load: 0, leads: 0, checkout_click: 0, checkout_complete: 0, paid: 0, revenue: [], ...o });
const STATS = {
  range: { from: '2026-10-01T10:00:00.000Z', to: '2026-10-08T11:00:00.000Z' },
  by: 'hour',
  versions: [1, 2],
  series: [bucket(8, { sessions: 120, leads: 30, checkout_complete: 6, paid: 5 }), bucket(9), bucket(10, { sessions: 80, leads: 10 })],
  steps: [{ screen: 0, sessions: 200 }, { screen: 1, sessions: 150 }, { screen: 3, sessions: 40 }],
  milestones: { sessions: 200, page_load: 200, leads: 40, checkout_click: 20, checkout_complete: 6, paid: 5 },
  events: [{ name: 'quiz_done', sessions: 90 }, { name: 'answer', sessions: 70 }],
};
const BY_VERSION = {
  dim: 'v',
  rows: [
    { key: '2', sessions: 120, leads: 30, checkout_complete: 5, paid: 4, revenue: [{ currency: 'USD', amount_minor: 5468 }, { currency: 'JPY', amount_minor: 2000 }] },
    { key: '1', sessions: 80, leads: 10, checkout_complete: 1, paid: 1, revenue: [] },
  ],
};
const BY_SOURCE = { dim: 'utm_source', rows: [{ key: '', sessions: 150, leads: 20, checkout_complete: 2, paid: 2, revenue: [{ currency: 'USD', amount_minor: 2734 }] }, { key: 'meta', sessions: 50, leads: 20, checkout_complete: 4, paid: 3, revenue: [] }] };
const BY_COUNTRY = { dim: 'country', rows: [{ key: 'VN', sessions: 150, leads: 30, checkout_complete: 5, paid: null, revenue: null }] };
const BREAKDOWNS = { v: BY_VERSION, utm_source: BY_SOURCE, country: BY_COUNTRY };

function setup(over = {}, me = ME.viewer) {
  const client = fakeClient(me, {
    getFunnel: vi.fn(async () => DETAIL),
    getFunnelStats: vi.fn(async () => STATS),
    getFunnelBreakdown: vi.fn(async (_, q) => BREAKDOWNS[q.dim]),
    ...over,
  });
  renderApp(client, '/funnels/aivideo');
  return client;
}
const texts = (els) => els.map((e) => e.textContent);
const rowCells = () => screen.getAllByTestId('breakdown-row').map((r) => texts(within(r).getAllByRole('cell')));

// Spec admin-console-p3 §3 "Funnel detail → tab Số liệu".
describe('Funnel detail → Số liệu', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
  });
  afterEach(() => vi.useRealTimers());

  it('the default tab, for every role: last 7 days by hour; chart, screen ladder, milestones with drop-off, other events', async () => {
    const client = setup();
    expect((await screen.findByRole('tab', { name: 'Số liệu' })).getAttribute('aria-selected')).toBe('true');
    expect(texts(screen.getAllByRole('tab'))).toEqual(['Số liệu', 'Tổng quan', 'Version', 'Nguồn', 'Campaign', 'Quốc gia', 'Thiết bị']);
    await screen.findAllByTestId('step');
    expect(client.getFunnelStats).toHaveBeenCalledWith('aivideo', { from: '2026-10-01T10:37:00.000Z', to: '2026-10-08T10:37:00.000Z', by: 'hour' });
    expect(['line-sessions', 'line-leads', 'line-checkout_complete', 'line-paid'].map((id) => Boolean(screen.getByTestId(id)))).toEqual([true, true, true, true]);
    expect(screen.getAllByTestId('bucket')).toHaveLength(3);
    expect(screen.getAllByTestId('step').map((s) => texts([...s.querySelectorAll('text')]))).toEqual([
      ['screen 0', '200 · 100.0%'], ['screen 1', '150 · 75.0%'], ['screen 3', '40 · 20.0%'],
    ]);
    expect(texts(screen.getAllByTestId('milestone'))).toEqual(['page_load200', 'lead40rơi 80.0%', 'checkout_click20rơi 50.0%', 'checkout_complete6rơi 70.0%', 'paid5rơi 16.7%']);
    const other = screen.getByRole('table', { name: 'Sự kiện khác' });
    expect(within(other).getAllByRole('row').slice(1).map((r) => texts(within(r).getAllByRole('cell')))).toEqual([['quiz_done', '90'], ['answer', '70']]);
    expect(screen.getByText('giờ UTC')).toBeTruthy();
  });

  it('breakdown: Version first (2 rows, money per currency); Nguồn shows "(không có)"; Quốc gia has no money and says why', async () => {
    const client = setup();
    await screen.findAllByTestId('breakdown-row');
    expect(rowCells()).toEqual([
      ['v2', '120', '30', '5', '4', '54.68 USD2000 JPY'],
      ['v1', '80', '10', '1', '1', '—'],
    ]);
    fireEvent.click(screen.getByRole('tab', { name: 'Nguồn' }));
    await waitFor(() => expect(rowCells()[0][0]).toBe('(không có)'));
    expect(client.getFunnelBreakdown).toHaveBeenLastCalledWith('aivideo', { from: '2026-10-01T10:37:00.000Z', to: '2026-10-08T10:37:00.000Z', dim: 'utm_source' });
    expect(screen.queryByText('Doanh thu không có theo chiều này (checkout không lưu quốc gia, thiết bị).')).toBeNull();
    fireEvent.click(screen.getByRole('tab', { name: 'Quốc gia' }));
    await waitFor(() => expect(rowCells()).toEqual([['VN', '150', '30', '5', '—', '—']]));
    expect(screen.getByText('Doanh thu không có theo chiều này (checkout không lưu quốc gia, thiết bị).')).toBeTruthy();
  });

  it('version filter: both requests carry v; controls locked while loading', async () => {
    const pending = [];
    const client = setup({ getFunnelStats: vi.fn((_, q) => (q.v ? new Promise((r) => pending.push(r)) : Promise.resolve(STATS))) });
    await screen.findAllByTestId('step');
    const pick = screen.getByLabelText('Version');
    expect(texts([...pick.options])).toEqual(['Mọi version', 'v1', 'v2']);
    fireEvent.change(pick, { target: { value: '2' } });
    await waitFor(() => expect(client.getFunnelStats).toHaveBeenLastCalledWith('aivideo', { from: '2026-10-01T10:37:00.000Z', to: '2026-10-08T10:37:00.000Z', by: 'hour', v: 2 }));
    expect(client.getFunnelBreakdown).toHaveBeenLastCalledWith('aivideo', { from: '2026-10-01T10:37:00.000Z', to: '2026-10-08T10:37:00.000Z', dim: 'v', v: 2 });
    expect(screen.getByLabelText('Version').disabled).toBe(true);
    expect(screen.getByRole('button', { name: '30 d' }).disabled).toBe(true);
    expect(screen.getByRole('tab', { name: 'Nguồn' }).disabled).toBe(true);
    expect(screen.getAllByTestId('loading').length).toBeGreaterThan(0);
    pending[0](STATS);
    await waitFor(() => expect(screen.getByLabelText('Version').disabled).toBe(false));
  });

  // Review Focus 3: a version with no events in the range.
  it('a version with no events: "Chưa có sự kiện trong khoảng này", the version list stays so one can switch back', async () => {
    const empty = { ...STATS, versions: [1, 2, 3], series: [bucket(8), bucket(9), bucket(10)], steps: [], events: [], milestones: { sessions: 0, page_load: 0, leads: 0, checkout_click: 0, checkout_complete: 0, paid: 0 } };
    setup({ getFunnelStats: vi.fn(async (_, q) => (q.v === 3 ? empty : { ...STATS, versions: [1, 2, 3] })) });
    await screen.findAllByTestId('step');
    fireEvent.change(screen.getByLabelText('Version'), { target: { value: '3' } });
    expect(await screen.findByText('Chưa có sự kiện trong khoảng này.')).toBeTruthy();
    expect(screen.queryAllByTestId('step')).toHaveLength(0);
    expect(texts([...screen.getByLabelText('Version').options])).toEqual(['Mọi version', 'v1', 'v2', 'v3']);
    expect(screen.getByLabelText('Version').disabled).toBe(false);
  });

  it('30 d asks by day', async () => {
    const client = setup();
    await screen.findAllByTestId('step');
    fireEvent.click(screen.getByRole('button', { name: '30 d' }));
    await waitFor(() => expect(client.getFunnelStats).toHaveBeenLastCalledWith('aivideo', { from: '2026-09-08T10:37:00.000Z', to: '2026-10-08T10:37:00.000Z', by: 'day' }));
  });

  it('503: one "chưa bật" card, no breakdown; the other tabs still work', async () => {
    const off = vi.fn(async () => { throw new ApiError(503, { error: 'analytics_unavailable' }); });
    setup({ getFunnelStats: off, getFunnelBreakdown: off });
    expect(await screen.findAllByTestId('analytics-off')).toHaveLength(1);
    expect(screen.queryAllByTestId('breakdown-row')).toHaveLength(0);
    fireEvent.click(screen.getByRole('tab', { name: 'Tổng quan' }));
    expect(await screen.findByRole('heading', { name: 'Versions' })).toBeTruthy();
  });

  it('Giá stays an extra tab for prices:read; ?tab=main opens Tổng quan', async () => {
    setup({}, ME.editor);
    expect(texts((await screen.findAllByRole('tab')).slice(0, 3))).toEqual(['Số liệu', 'Tổng quan', 'Giá']);
    renderApp(fakeClient(ME.viewer, { getFunnel: vi.fn(async () => DETAIL) }), '/funnels/aivideo?tab=main');
    expect(await screen.findByRole('heading', { name: 'Versions' })).toBeTruthy();
  });
});
```

`apps/admin/test/funnels.test.jsx`, `apps/admin/test/publish.test.jsx`, `apps/admin/test/helpers.jsx`, `demo/test/admin-e2e.test.mjs` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/test/funnels.test.jsx b/apps/admin/test/funnels.test.jsx
index 0ef7c4f..d189cd3 100644
--- a/apps/admin/test/funnels.test.jsx
+++ b/apps/admin/test/funnels.test.jsx
@@ -63,7 +63,7 @@ describe('Funnels list', () => {
 
 describe('Funnel detail', () => {
   it('versions newest first with author, size and lint; Preview opens the link and its QR code', async () => {
-    renderApp(fakeClient(ME.viewer, { getFunnel: vi.fn(async () => DETAIL) }), '/funnels/aivideo');
+    renderApp(fakeClient(ME.viewer, { getFunnel: vi.fn(async () => DETAIL) }), '/funnels/aivideo?tab=main');
     const rows = (await screen.findAllByTestId('version')).map((r) => [...r.querySelectorAll('td')].slice(0, 5).map((td) => td.textContent));
     expect(rows).toEqual([
       ['v2', '2026-10-02 08:00', 'ed@ikameglobal.com', '4.0 KB', '1 cảnh báo'],
@@ -88,7 +88,7 @@ describe('Funnel detail', () => {
         return { funnel: 'aivideo', v: 3, created: true, preview_url: 'https://preview.ikf.example/aivideo/v3' };
       }),
     });
-    renderApp(client, '/funnels/aivideo');
+    renderApp(client, '/funnels/aivideo?tab=main');
     const input = await screen.findByLabelText('Chọn demo.html');
     drop(input, 'x'.repeat(MAX_BYTES + 1));
     expect((await screen.findByRole('alert')).textContent).toMatch(/^File quá lớn: 1\.00 MB/);
@@ -111,7 +111,7 @@ describe('Funnel detail', () => {
         return { funnel: 'aivideo', v: 3, created: true };
       }),
     });
-    renderApp(client, '/funnels/aivideo');
+    renderApp(client, '/funnels/aivideo?tab=main');
     const input = await screen.findByLabelText('Chọn demo.html');
     // Like a browser: the input keeps the picked path, and picking the same path again fires no change event.
     let value = '';
@@ -132,7 +132,7 @@ describe('Funnel detail', () => {
 
   it('a file that cannot be read says so instead of failing silently', async () => {
     const client = fakeClient(ME.editor, { getFunnel: vi.fn(async () => DETAIL), uploadVersion: vi.fn() });
-    renderApp(client, '/funnels/aivideo');
+    renderApp(client, '/funnels/aivideo?tab=main');
     const input = await screen.findByLabelText('Chọn demo.html');
     const file = new File(['x'], 'demo.html', { type: 'text/html' });
     file.text = () => Promise.reject(new Error('NotReadableError'));
@@ -146,11 +146,11 @@ describe('Funnel detail', () => {
       getFunnel: vi.fn(async () => DETAIL),
       uploadVersion: vi.fn(async () => ({ funnel: 'aivideo', v: 2, created: false })),
     });
-    renderApp(client, '/funnels/aivideo');
+    renderApp(client, '/funnels/aivideo?tab=main');
     drop(await screen.findByLabelText('Chọn demo.html'), PAGE);
     expect(await screen.findByText('Nội dung không đổi: vẫn là v2.')).toBeTruthy();
     cleanup();
-    renderApp(fakeClient(ME.viewer, { getFunnel: vi.fn(async () => DETAIL) }), '/funnels/aivideo');
+    renderApp(fakeClient(ME.viewer, { getFunnel: vi.fn(async () => DETAIL) }), '/funnels/aivideo?tab=main');
     expect((await screen.findByLabelText('Chọn demo.html')).disabled).toBe(true);
   });
 
@@ -163,7 +163,7 @@ describe('Funnel detail', () => {
         return { funnel: 'aivideo', ...body };
       }),
     });
-    renderApp(client, '/funnels/aivideo');
+    renderApp(client, '/funnels/aivideo?tab=main');
     const pixel = await screen.findByLabelText('Pixel ID');
     expect(pixel.value).toBe('123456');
     fireEvent.change(pixel, { target: { value: '12' } });
diff --git a/apps/admin/test/helpers.jsx b/apps/admin/test/helpers.jsx
index 4c6ff9f..05e59e9 100644
--- a/apps/admin/test/helpers.jsx
+++ b/apps/admin/test/helpers.jsx
@@ -52,6 +52,11 @@ export function fakeClient(me = ME.admin, overrides = {}) {
     reconcile: vi.fn(),
     listOutbox: vi.fn(async () => ({ items: [] })),
     getOverview: vi.fn(async () => ({ range: { from: '2026-10-01T00:00:00.000Z', to: '2026-10-08T00:00:00.000Z' }, funnels: [] })),
+    getFunnelStats: vi.fn(async () => ({
+      range: { from: '2026-10-01T00:00:00.000Z', to: '2026-10-08T00:00:00.000Z' }, by: 'hour', versions: [], series: [], steps: [], events: [],
+      milestones: { sessions: 0, page_load: 0, leads: 0, checkout_click: 0, checkout_complete: 0, paid: 0 },
+    })),
+    getFunnelBreakdown: vi.fn(async (_, q) => ({ dim: q.dim, rows: [] })),
     ...overrides,
   };
   return client;
diff --git a/apps/admin/test/publish.test.jsx b/apps/admin/test/publish.test.jsx
index 3eee885..b28d728 100644
--- a/apps/admin/test/publish.test.jsx
+++ b/apps/admin/test/publish.test.jsx
@@ -28,7 +28,7 @@ function setup(me = ME.admin, overrides = {}) {
     rollback: vi.fn(async (host, prefix) => ({ host, prefix, funnel: 'aivideo', v: 1, rev: 6, kv_sync: 'ok', propagation_seconds: 90 })),
     ...overrides,
   });
-  renderApp(client, '/funnels/aivideo');
+  renderApp(client, '/funnels/aivideo?tab=main');
   return client;
 }
 
diff --git a/demo/test/admin-e2e.test.mjs b/demo/test/admin-e2e.test.mjs
index 593dcae..58dc9e3 100644
--- a/demo/test/admin-e2e.test.mjs
+++ b/demo/test/admin-e2e.test.mjs
@@ -52,7 +52,7 @@ describe.skipIf(skipReason)('admin console e2e', () => {
     browser = await chromium.launch();
     expect(await liveVersion(before)).toBe(before);
     const page = await browser.newPage();
-    await page.goto(`${stack.adminUrl}/funnels/${FUNNEL}`);
+    await page.goto(`${stack.adminUrl}/funnels/${FUNNEL}?tab=main`); // Tổng quan (Số liệu is the default tab since phase 3)
     await page.getByRole('link', { name: 'Đăng nhập bằng Google' }).click();
     await page.getByRole('heading', { name: FUNNEL }).waitFor();
     expect(await page.getByTestId('who').textContent()).toBe(`${ADMIN_USER} · admin`);
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/admin 2>&1 | grep -E "Test Files|Tests  "
```

Expected: 7 test `Funnel detail → Số liệu` FAIL (chưa có tab `Số liệu`); test cũ vẫn pass với `?tab=main` (route chưa đọc `tab`); `Test Files  1 failed | 14 passed (15)`, `Tests  7 failed | 121 passed (128)`.

- [ ] **Step 3: Implement**

`apps/admin/src/components/StatsTab.jsx` (mới):

```jsx
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth.jsx';
import { fmtMoney, fmtNum, fmtPct } from '../format.js';
import { AnalyticsError, analyticsOff, Loading } from './AnalyticsState.jsx';
import { Bars } from './charts/Bars.jsx';
import { LineChart } from './charts/LineChart.jsx';
import { RangePicker, rangeFor } from './RangePicker.jsx';

const LINES = [
  { key: 'sessions', label: 'Sessions' },
  { key: 'leads', label: 'Leads' },
  { key: 'checkout_complete', label: 'Checkout xong' },
  { key: 'paid', label: 'Paid' },
];
const MILESTONES = [['page_load', 'page_load'], ['lead', 'leads'], ['checkout_click', 'checkout_click'], ['checkout_complete', 'checkout_complete'], ['paid', 'paid']];
const DIMS = [['v', 'Version'], ['utm_source', 'Nguồn'], ['utm_campaign', 'Campaign'], ['country', 'Quốc gia'], ['ua_class', 'Thiết bị']];

// One request at a time per kind: the newest answer wins (request token), `loading` locks the controls.
function useLatest(load, deps) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const seq = useRef(0);
  useEffect(() => {
    const n = ++seq.current;
    setState((s) => ({ ...s, error: null, loading: true }));
    load().then(
      (data) => n === seq.current && setState({ data, error: null, loading: false }),
      (error) => n === seq.current && setState({ data: null, error, loading: false }),
    );
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return state;
}

const Money = ({ items }) => (items === null ? '—' : items.length ? items.map((m) => <div key={m.currency}>{fmtMoney(m.amount_minor, m.currency)}</div>) : '—');

// Funnel detail → Số liệu (spec admin-console-p3 §3): series, screen ladder, milestones, breakdown, other events.
export function StatsTab({ slug }) {
  const { client } = useAuth();
  const [days, setDays] = useState(7);
  const [v, setV] = useState('');
  const [dim, setDim] = useState('v');
  const filter = v ? { v: Number(v) } : {};
  const stats = useLatest(() => {
    const { from, to, by } = rangeFor(days);
    return client.getFunnelStats(slug, { from, to, by, ...filter });
  }, [client, slug, days, v]);
  const breakdown = useLatest(() => {
    const { from, to } = rangeFor(days);
    return client.getFunnelBreakdown(slug, { from, to, dim, ...filter });
  }, [client, slug, days, v, dim]);
  // The last answer stays in `data` while the next one loads: the version list does not flicker.
  const versions = stats.data?.versions ?? [];
  const busy = stats.loading || breakdown.loading;
  const off = analyticsOff(stats.error);
  const s = stats.data;

  return (
    <div className="card stats">
      <div className="row">
        <RangePicker days={days} onChange={setDays} disabled={busy} />
        <label className="row">
          Version
          <select aria-label="Version" value={v} disabled={busy} onChange={(e) => setV(e.target.value)}>
            <option value="">Mọi version</option>
            {versions.map((n) => <option key={n} value={String(n)}>v{n}</option>)}
          </select>
        </label>
      </div>
      <AnalyticsError error={stats.error} />
      {stats.loading && <Loading />}
      {!stats.loading && s && s.milestones.sessions === 0 && <p className="muted">Chưa có sự kiện trong khoảng này.</p>}
      {!stats.loading && s && s.milestones.sessions > 0 && (
        <>
          <h3>Theo {s.by === 'hour' ? 'giờ' : 'ngày'}</h3>
          <LineChart points={s.series} lines={LINES} label={`${slug} theo ${s.by === 'hour' ? 'giờ' : 'ngày'}`} />
          <h3>Mốc</h3>
          <ol className="milestones">
            {MILESTONES.map(([label, key], i) => {
              const n = s.milestones[key];
              const prev = i ? s.milestones[MILESTONES[i - 1][1]] : null;
              return (
                <li key={key} data-testid="milestone">
                  <span>{label}</span>
                  <strong>{fmtNum(n)}</strong>
                  {i > 0 && <span className="muted">rơi {fmtPct(prev - n, prev)}</span>}
                </li>
              );
            })}
          </ol>
          <h3>Bậc thang screen</h3>
          {s.steps.length ? (
            <Bars
              testid="step"
              label="Bậc thang screen"
              items={s.steps.map((st) => ({ label: `screen ${st.screen}`, value: st.sessions, note: `${fmtNum(st.sessions)} · ${fmtPct(st.sessions, s.steps[0].sessions)}` }))}
            />
          ) : (
            <p className="muted">Không có screen_view trong khoảng này.</p>
          )}
          <h3>Sự kiện khác</h3>
          {s.events.length ? (
            <table aria-label="Sự kiện khác">
              <thead><tr><th>Sự kiện</th><th>Sessions</th></tr></thead>
              <tbody>{s.events.map((e) => <tr key={e.name}><td>{e.name}</td><td>{fmtNum(e.sessions)}</td></tr>)}</tbody>
            </table>
          ) : (
            <p className="muted">Không có.</p>
          )}
        </>
      )}
      {!off && (
        <>
          <h3>Breakdown</h3>
          <div role="tablist" aria-label="Chiều" className="row">
            {DIMS.map(([key, label]) => (
              <button key={key} type="button" role="tab" aria-selected={dim === key} disabled={busy} onClick={() => setDim(key)}>{label}</button>
            ))}
          </div>
          <AnalyticsError error={breakdown.error} />
          {breakdown.loading && <Loading />}
          {!breakdown.loading && breakdown.data && (
            <>
              <table aria-label="Breakdown">
                <thead><tr><th>{DIMS.find(([k]) => k === dim)[1]}</th><th>Sessions</th><th>Leads</th><th>Checkout xong</th><th>Paid</th><th>Doanh thu</th></tr></thead>
                <tbody>
                  {breakdown.data.rows.map((r) => (
                    <tr key={r.key} data-testid="breakdown-row">
                      <td>{r.key === '' ? '(không có)' : dim === 'v' ? `v${r.key}` : r.key}</td>
                      <td>{fmtNum(r.sessions)}</td>
                      <td>{fmtNum(r.leads)}</td>
                      <td>{fmtNum(r.checkout_complete)}</td>
                      <td>{fmtNum(r.paid)}</td>
                      <td><Money items={r.revenue} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {['country', 'ua_class'].includes(dim) && <p className="muted">Doanh thu không có theo chiều này (checkout không lưu quốc gia, thiết bị).</p>}
            </>
          )}
        </>
      )}
    </div>
  );
}
```

`apps/admin/src/pages/FunnelDetail.jsx`, `apps/admin/src/styles.css` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/src/pages/FunnelDetail.jsx b/apps/admin/src/pages/FunnelDetail.jsx
index 2eda765..4dd26c3 100644
--- a/apps/admin/src/pages/FunnelDetail.jsx
+++ b/apps/admin/src/pages/FunnelDetail.jsx
@@ -1,5 +1,5 @@
 import { useCallback, useEffect, useState } from 'react';
-import { useParams } from 'react-router';
+import { useParams, useSearchParams } from 'react-router';
 import { useAuth } from '../auth.jsx';
 import { ErrorNote } from '../components/ErrorNote.jsx';
 import { FunnelSettings } from '../components/FunnelSettings.jsx';
@@ -9,6 +9,7 @@ import { PublishDialog } from '../components/PublishDialog.jsx';
 import { Qr } from '../components/Qr.jsx';
 import { RoleButton } from '../components/RoleButton.jsx';
 import { RollbackDialog } from '../components/RollbackDialog.jsx';
+import { StatsTab } from '../components/StatsTab.jsx';
 import { UploadBox } from '../components/UploadBox.jsx';
 import { fmtSize, fmtTime } from '../format.js';
 import { can } from '../roles.js';
@@ -16,7 +17,10 @@ import { can } from '../roles.js';
 export function FunnelDetail() {
   const { slug } = useParams();
   const { client, me } = useAuth();
-  const [tab, setTab] = useState('main');
+  // Số liệu is the default tab (spec admin-console-p3 §3); ?tab=main | prices opens the others.
+  const [params, setParams] = useSearchParams();
+  const tab = params.get('tab') ?? 'stats';
+  const setTab = (t) => setParams(t === 'stats' ? {} : { tab: t }, { replace: true });
   const [funnel, setFunnel] = useState(null);
   const [error, setError] = useState(null);
   const [preview, setPreview] = useState(null);
@@ -36,18 +40,19 @@ export function FunnelDetail() {
     setNotice(text);
     load();
   };
-  const tabs = can(me.role, 'prices:read') && (
+  const tabs = (
     <div role="tablist" className="row">
+      <button type="button" role="tab" aria-selected={tab === 'stats'} onClick={() => setTab('stats')}>Số liệu</button>
       <button type="button" role="tab" aria-selected={tab === 'main'} onClick={() => setTab('main')}>Tổng quan</button>
-      <button type="button" role="tab" aria-selected={tab === 'prices'} onClick={() => setTab('prices')}>Giá</button>
+      {can(me.role, 'prices:read') && <button type="button" role="tab" aria-selected={tab === 'prices'} onClick={() => setTab('prices')}>Giá</button>}
     </div>
   );
-  if (tab === 'prices') {
+  if (tab === 'stats' || (tab === 'prices' && can(me.role, 'prices:read'))) {
     return (
       <section>
         <h1>{funnel.slug}</h1>
         {tabs}
-        <PricesTab slug={funnel.slug} />
+        {tab === 'stats' ? <StatsTab slug={funnel.slug} /> : <PricesTab slug={funnel.slug} />}
       </section>
     );
   }
diff --git a/apps/admin/src/styles.css b/apps/admin/src/styles.css
index 61584e8..72b97bc 100644
--- a/apps/admin/src/styles.css
+++ b/apps/admin/src/styles.css
@@ -46,3 +46,7 @@ svg.bars rect { fill: #2457d6; }
 .range { margin: 8px 0; }
 .range [aria-pressed='true'] { background: #1d2330; border-color: #1d2330; color: #fff; }
 button.link { border: 0; padding: 0; background: none; color: inherit; font-weight: 600; }
+.milestones { display: flex; gap: 8px; list-style: none; padding: 0; flex-wrap: wrap; }
+.milestones li { display: flex; flex-direction: column; min-width: 120px; padding: 8px 12px; border: 1px solid #e6e9ef; border-radius: 8px; }
+.milestones strong { font-size: 20px; }
+.stats h3 { margin: 20px 0 8px; font-size: 15px; }
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/admin 2>&1 | grep -E "Test Files|Tests  "
npx vitest run --config demo/vitest.config.mjs demo/test/admin-e2e.test.mjs 2>&1 | grep -E "Tests  "
```

Expected: admin `Test Files  15 passed (15)`, `Tests  128 passed (128)`; e2e đợt 1 (Tổng quan qua `?tab=main`) `Tests  1 passed (1)`.

- [ ] **Step 5: Commit**

```bash
git add apps/admin demo/test/admin-e2e.test.mjs
git commit -m "feat(admin): Funnel detail → Số liệu tab (default): series chart, screen ladder, milestones with drop-off, breakdown by version/source/campaign/country/device, other events"
```

---

### Task 11: Demo — core đọc ClickHouse; dữ liệu mẫu (`demo:events -- --seed`); e2e đợt 3; README

**Files:**
- Create: `demo/lib/sample.mjs`
- Modify: `demo/lib/stack.mjs`, `demo/events.mjs`, `demo/README.md`
- Test: `demo/test/sample.test.mjs`, `demo/test/admin-p3-e2e.test.mjs` (mới)

**Interfaces:**
- Consumes: `createClickhouse` (Task 2), `startStack({…, adminUser, adminBuildDir, logStream})` → `{clickhouse: chRun, adminUrl, …}`, `CH`, `PG`, `DEMO_TOKEN`, `clickhouse(sql)` (`demo/lib/stack.mjs`); `ULID_RE` (`@ikf/event-schema`); mọi màn Task 9–10 (`overview-row`, tab `Số liệu`, `step`, `milestone`, `breakdown-row`).
- Produces: `startStack` tiêm `deps.clickhouse = createClickhouse({...CH, database: chDatabase})` vào `buildApp`. `demo/lib/sample.mjs`: `SAMPLE` (`days: 3`, `versions: [1, 2]`, 3 nguồn `meta/spring_sale`, `tiktok/ugc_1`, không utm; `countries: ['VN','US','DE']`; `devices: ['mobile','desktop']`; 2 session mỗi ô; 6 screen), `sampleData({funnels, now})` → `{events, checkouts: [{id, txn, funnel, v, sid, attribution, status, created_at, completed_at}], transactions: [{id, checkout_id, amount_minor, currency, billed_at}], refunds: [{transaction_id, amount_minor, currency, at}]}` (id theo giờ chạy), `seedSample({clickhouse, pool, funnels, now})` → `{events, sessions, checkouts, paid, refunds}`. `npm run demo:events -- --seed [--funnel <slug>]`.

- [ ] **Step 1: Viết test fail**

`demo/test/sample.test.mjs` (mới):

```js
import { describe, it, expect } from 'vitest';
import { ULID_RE } from '@ikf/event-schema';
import { SAMPLE, sampleData, seedSample } from '../lib/sample.mjs';

const NOW = Date.UTC(2026, 9, 8, 10, 37);
const FUNNELS = ['ewa-books', 'moon-reading'];

// Spec admin-console-p3 §4 "Demo": sample data for the dashboard, no Docker needed here.
describe('sampleData', () => {
  const data = sampleData({ funnels: FUNNELS, now: NOW });
  const sessions = new Map();
  for (const e of data.events) sessions.set(e.sid, [...(sessions.get(e.sid) ?? []), e]);

  it('3 days × 2 versions × 3 sources × 3 countries × 2 devices × 2 sessions per funnel, ULID ids, all before now', () => {
    expect(sessions.size).toBe(FUNNELS.length * SAMPLE.days * 2 * 3 * 3 * 2 * SAMPLE.sessionsPerCell);
    expect(new Set(data.events.map((e) => e.id)).size).toBe(data.events.length);
    expect(data.events.every((e) => ULID_RE.test(e.id) && ULID_RE.test(e.sid))).toBe(true);
    expect(data.checkouts.every((c) => ULID_RE.test(c.id))).toBe(true);
    const times = data.events.map((e) => Date.parse(`${e.received_at.replace(' ', 'T')}Z`));
    expect(Math.max(...times)).toBeLessThan(NOW);
    expect(Math.min(...times)).toBeGreaterThan(NOW - 3 * 86_400_000 - 3_600_000);
    for (const key of ['country', 'ua_class', 'v']) expect(new Set(data.events.map((e) => e[key])).size).toBeGreaterThan(1);
    expect([...new Set(data.events.map((e) => e.attr.utm_source ?? ''))].sort()).toEqual(['', 'meta', 'tiktok']);
  });

  it('every session: page_load, then screens 0..k in order; the ladder thins out; milestones follow the depth', () => {
    for (const evs of sessions.values()) {
      expect(evs[0].name).toBe('page_load');
      const screens = evs.filter((e) => e.name === 'screen_view').map((e) => e.screen);
      expect(screens).toEqual(screens.map((_, i) => i));
      const names = new Set(evs.map((e) => e.name));
      if (names.has('checkout_complete')) expect(['lead', 'checkout_click'].every((n) => names.has(n))).toBe(true);
    }
    const reached = (k) => [...sessions.values()].filter((evs) => evs.some((e) => e.name === 'screen_view' && e.screen === k)).length;
    const ladder = Array.from({ length: SAMPLE.screens }, (_, k) => reached(k));
    expect(ladder[0]).toBe(sessions.size);
    expect(ladder.every((n, k) => k === 0 || n <= ladder[k - 1])).toBe(true);
    expect(ladder.at(-1)).toBeGreaterThan(0);
  });

  it('per funnel: checkouts for checkout_click, paid ones with a USD or JPY transaction; one refund', () => {
    for (const f of FUNNELS) {
      const mine = data.checkouts.filter((c) => c.funnel === f);
      expect(mine.some((c) => c.status === 'completed') && mine.some((c) => c.status === 'created')).toBe(true);
      expect(new Set(mine.map((c) => c.v))).toEqual(new Set([1, 2]));
    }
    const completed = data.checkouts.filter((c) => c.status === 'completed');
    expect(data.transactions.map((t) => t.checkout_id)).toEqual(completed.map((c) => c.id));
    expect(data.transactions.map((t) => t.id)).toEqual(completed.map((c) => c.txn));
    expect(new Set(data.transactions.map((t) => t.currency))).toEqual(new Set(['USD', 'JPY']));
    expect(data.refunds).toEqual([{ transaction_id: data.transactions[0].id, amount_minor: data.transactions[0].amount_minor, currency: data.transactions[0].currency, at: data.transactions[0].billed_at + 60_000 }]);
  });

  it('the same hour gives the same data (re-seeding adds nothing); another hour gives new ids', () => {
    expect(sampleData({ funnels: FUNNELS, now: NOW + 60_000 })).toEqual(data);
    const later = sampleData({ funnels: FUNNELS, now: NOW + 3_600_000 });
    expect(later.events[0].id).not.toBe(data.events[0].id);
  });
});

describe('seedSample', () => {
  const fakes = (slugs = FUNNELS) => {
    const ch = [];
    const sql = [];
    const pool = {
      query: async (text, params) => {
        sql.push(text.replace(/\s+/g, ' ').trim().split(' ').slice(0, 3).join(' '));
        if (text.startsWith('SELECT')) return { rows: slugs.map((slug, i) => ({ id: i + 1, slug })) };
        return { rowCount: 1, rows: [] };
      },
    };
    return { ch, sql, pool, clickhouse: async (q) => ch.push(q) };
  };

  it('events in one JSONEachRow insert, then checkouts, transactions and the refund (already published) in Postgres', async () => {
    const f = fakes();
    const out = await seedSample({ clickhouse: f.clickhouse, pool: f.pool, funnels: FUNNELS, now: NOW });
    const data = sampleData({ funnels: FUNNELS, now: NOW });
    expect(out).toEqual({ events: data.events.length, sessions: 432, checkouts: data.checkouts.length, paid: data.transactions.length, refunds: 1 });
    expect(f.ch).toHaveLength(1);
    expect(f.ch[0].split('\n')[0]).toBe('INSERT INTO events FORMAT JSONEachRow');
    expect(f.ch[0].split('\n')).toHaveLength(data.events.length + 1);
    expect(f.sql[0]).toBe('SELECT id, slug');
    expect(f.sql.filter((s) => s === 'INSERT INTO checkouts')).toHaveLength(data.checkouts.length);
    expect(f.sql.filter((s) => s === 'INSERT INTO transactions')).toHaveLength(data.transactions.length);
    expect(f.sql.filter((s) => s === 'INSERT INTO outbox')).toHaveLength(1);
  });

  it('refuses funnels that are not published', async () => {
    const f = fakes(['ewa-books']);
    await expect(seedSample({ clickhouse: f.clickhouse, pool: f.pool, funnels: FUNNELS, now: NOW })).rejects.toThrow('funnels not in Postgres (publish them first): moon-reading');
    expect(f.ch).toEqual([]);
  });
});
```

`demo/test/admin-p3-e2e.test.mjs` (mới):

```js
// Admin console phase 3 end to end (spec admin-console-p3 "Điều kiện xong") on the real demo stack: sample
// sessions in ClickHouse (through funnel_hourly_mv) and checkouts/payments in Postgres → the API's numbers →
// the console in Chromium: Dashboard rows > 0 → a funnel's Số liệu tab (screen ladder ≥ 3, paid > 0, breakdown by
// version with 2 rows). Own ports and databases; skips without the two funnels.
import { existsSync } from 'node:fs';
import { Writable } from 'node:stream';
import { describe, it, expect, afterAll } from 'vitest';
import pg from 'pg';
import { chromium } from 'playwright';
import { DEFAULT_FUNNELS_DIR, findFunnels } from '../lib/funnels.mjs';
import { seedSample } from '../lib/sample.mjs';
import { DEMO_TOKEN, PG, startStack } from '../lib/stack.mjs';

const FUNNELS_DIR = process.env.IKF_FUNNELS_DIR || DEFAULT_FUNNELS_DIR;
const FUNNELS = ['ewa-books', 'moon-reading'];
const found = existsSync(FUNNELS_DIR) ? await findFunnels(FUNNELS_DIR) : null;
const skipReason = !found ? `funnels folder not found: ${FUNNELS_DIR}` : FUNNELS.filter((f) => !found.has(f)).map((f) => `${f} missing`).join(', ');
if (skipReason) console.warn(`admin p3 e2e skipped: ${skipReason}`);

const PORTS = { edge: 8877, core: 8178, media: 8879, proxy: 8878, demo: 8881, admin: 8882 };
const DB = 'ikf_admin_p3_test';
const ADMIN_USER = 'e2e-p3@ikameglobal.com';
const num = (s) => Number(s.replace(/,/g, ''));
const core = (path) => fetch(`http://127.0.0.1:${PORTS.core}${path}`, { headers: { authorization: `Bearer ${DEMO_TOKEN}` } }).then(async (r) => ({ status: r.status, json: await r.json() }));

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

describe.skipIf(skipReason)('admin console phase 3 e2e', () => {
  it('sample data → Dashboard rows > 0 → Số liệu: screen ladder, paid, breakdown by version', async () => {
    stack = await startStack({
      funnels: FUNNELS, ports: PORTS, lan: false, pgDatabase: DB, chDatabase: DB, logStream,
      adminUser: ADMIN_USER, adminBuildDir: new URL('../.build/admin-p3/', import.meta.url).pathname,
    });
    pool = new pg.Pool({ ...PG, database: DB, max: 2 });
    const seeded = await seedSample({ clickhouse: stack.clickhouse, pool, funnels: FUNNELS });
    expect(seeded.sessions).toBe(432);
    expect(seeded.paid).toBeGreaterThan(0);

    // The API (what `ikf stats` reads): every funnel has sessions, leads, checkouts, paid and revenue.
    const overview = (await core('/v1/analytics/overview')).json;
    for (const f of FUNNELS) {
      const row = overview.funnels.find((r) => r.slug === f);
      expect(row, f).toBeTruthy();
      expect([row.sessions, row.leads, row.checkouts, row.paid].every((n) => n > 0), f).toBe(true);
      expect(row.revenue.length, f).toBeGreaterThan(0);
    }
    const stats = (await core(`/v1/analytics/funnels/${FUNNELS[0]}`)).json;
    expect(stats.versions).toEqual(expect.arrayContaining([1, 2]));
    expect(stats.milestones.paid).toBeGreaterThan(0);

    // The console: Dashboard first.
    browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`${stack.adminUrl}/`);
    await page.getByRole('link', { name: 'Đăng nhập bằng Google' }).click();
    await page.getByRole('heading', { name: 'Dashboard' }).waitFor();
    const rows = page.getByTestId('overview-row');
    await expect.poll(() => rows.count()).toBeGreaterThanOrEqual(2);
    for (const f of FUNNELS) {
      const cells = await rows.filter({ hasText: f }).locator('td').allTextContents();
      expect(cells[0]).toBe(f);
      expect(cells.slice(1, 5).map(num).every((n) => n > 0), `${f}: ${cells}`).toBe(true);
      expect(cells[6]).not.toBe('—');
    }

    // A funnel's Số liệu tab (the default one).
    await rows.filter({ hasText: FUNNELS[0] }).getByRole('link', { name: FUNNELS[0] }).click();
    await page.getByRole('heading', { name: FUNNELS[0] }).waitFor();
    expect(await page.getByRole('tab', { name: 'Số liệu' }).getAttribute('aria-selected')).toBe('true');
    await expect.poll(() => page.getByTestId('step').count()).toBeGreaterThanOrEqual(3);
    const paid = await page.getByTestId('milestone').filter({ hasText: /^paid/ }).locator('strong').textContent();
    expect(num(paid)).toBeGreaterThan(0);
    await expect.poll(() => page.getByTestId('breakdown-row').count()).toBe(2);
    expect(await page.getByTestId('breakdown-row').locator('td:first-child').allTextContents()).toEqual(expect.arrayContaining(['v1', 'v2']));

    // One line per answered request, never the person's email.
    expect(logs).toContain('"msg":"analytics"');
    expect(logs).not.toContain(ADMIN_USER);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npx vitest run --config demo/vitest.config.mjs demo/test/sample.test.mjs 2>&1 | grep -E "^Error|Tests  "
npx vitest run --config demo/vitest.config.mjs demo/test/admin-p3-e2e.test.mjs 2>&1 | grep -E "×|Error|Tests  "
```

Expected: `Error: Cannot find module '../lib/sample.mjs'`, `Tests  no tests` (cả hai file import `sample.mjs`; muốn thấy e2e fail đúng chỗ thì tạo `demo/lib/sample.mjs` trước (Step 3, khối đầu) rồi chạy lại e2e: `TypeError: Cannot read properties of undefined (reading 'find')` — core của demo chưa có route analytics, `/v1/analytics/overview` 404 — `Tests  1 failed (1)`).

- [ ] **Step 3: Implement**

`demo/lib/sample.mjs` (mới):

```js
// Sample analytics data for the demo dashboard (spec admin-console-p3 §4): 3 days of sessions per funnel ×
// 2 versions × 3 sources × 3 countries × 2 devices, a screen ladder that thins out, some leads, checkouts and
// payments (USD and JPY) and one refund. Events go to ClickHouse as the event consumer writes them; checkouts,
// transactions and the refund go to Postgres. Ids depend on the hour it runs in: seeding twice in the same hour
// adds nothing (ReplacingMergeTree ids, uniqExact sessions, ON CONFLICT DO NOTHING).
const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
export const SAMPLE = {
  days: 3,
  versions: [1, 2],
  sources: [['meta', 'spring_sale'], ['tiktok', 'ugc_1'], ['', '']],
  countries: ['VN', 'US', 'DE'],
  devices: ['mobile', 'desktop'],
  sessionsPerCell: 2,
  screens: 6,
};
const PRICES = [{ currency: 'USD', amount: 1367 }, { currency: 'JPY', amount: 2000 }];

const base32 = (n, len) => {
  let s = '';
  for (let i = 0; i < len; i += 1, n = Math.floor(n / 32)) s = CROCKFORD[n % 32] + s;
  return s;
};
// A ULID-shaped id (what event-schema accepts): 01 + kind + the seeding hour + a counter.
const id = (kind, hour, n) => `01${kind}${base32(hour, 7)}${base32(n, 16)}`;
// mulberry32: the same hour gives the same data.
function random(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const chTime = (ms) => new Date(ms).toISOString().replace('T', ' ').replace('Z', '');

// → {events: [ClickHouse rows], checkouts: [{id, txn, funnel, v, sid, attribution, status, created_at, completed_at}],
//    transactions: [{id, checkout_id, amount_minor, currency, billed_at}], refunds: [{transaction_id, amount_minor, currency, at}]}
export function sampleData({ funnels, now = Date.now() }) {
  const hour = Math.floor(now / HOUR);
  const rnd = random(hour);
  const out = { events: [], checkouts: [], transactions: [], refunds: [] };
  let n = 0;
  let paid = 0;
  for (const funnel of funnels) {
    for (let d = 0; d < SAMPLE.days; d += 1) {
      for (const v of SAMPLE.versions) {
        for (const [source, campaign] of SAMPLE.sources) {
          for (const country of SAMPLE.countries) {
            for (const ua of SAMPLE.devices) {
              for (let k = 0; k < SAMPLE.sessionsPerCell; k += 1) {
                n += 1;
                const sid = id('S', hour, n);
                const start = hour * HOUR - d * DAY - (1 + Math.floor(rnd() * 22)) * HOUR - Math.floor(rnd() * 50) * 60_000;
                // How far the session gets: screens 1..6, version 2 a little further.
                const depth = Math.min(SAMPLE.screens, 1 + Math.floor(rnd() * SAMPLE.screens) + (v === 2 && rnd() < 0.4 ? 1 : 0));
                const attr = { ...(source && { utm_source: source }), ...(campaign && { utm_campaign: campaign }) };
                let e = 0;
                const event = (name, at, screen = null) => {
                  e += 1;
                  out.events.push({
                    id: id('E', hour, n * 32 + e), sid, aid: null, t: chTime(at - 200), received_at: chTime(at), name, funnel, v, rev: 1,
                    host: 'localhost', path: `/${funnel}`, screen, props: {}, attr, country, ua_class: ua, ip_hash: '',
                  });
                };
                event('page_load', start);
                for (let s = 0; s < depth; s += 1) event('screen_view', start + (s + 1) * 15_000, s);
                if (depth >= 2) event('answer', start + 40_000, 1);
                if (depth >= 4) event('lead', start + 100_000);
                if (depth >= 5) {
                  const at = start + 120_000;
                  event('checkout_click', at);
                  const cid = id('C', hour, n);
                  const checkout = { id: cid, txn: `txn_sample${cid.toLowerCase()}`, funnel, v, sid, attribution: attr, status: 'created', created_at: at, completed_at: null };
                  out.checkouts.push(checkout);
                  if (depth === SAMPLE.screens) {
                    const done = at + 60_000;
                    event('checkout_complete', done);
                    Object.assign(checkout, { status: 'completed', completed_at: done });
                    const price = PRICES[paid % PRICES.length];
                    paid += 1;
                    out.transactions.push({ id: checkout.txn, checkout_id: cid, amount_minor: price.amount, currency: price.currency, billed_at: done });
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  const first = out.transactions[0];
  if (first) out.refunds.push({ transaction_id: first.id, amount_minor: first.amount_minor, currency: first.currency, at: first.billed_at + 60_000 });
  return out;
}

// Writes sampleData into the demo's ClickHouse (`run(sql)`) and Postgres (`pool`); funnels must exist in Postgres.
// The refund is written already published, so no worker ever acts on it.
export async function seedSample({ clickhouse, pool, funnels, now = Date.now() }) {
  const data = sampleData({ funnels, now });
  const { rows } = await pool.query('SELECT id, slug FROM funnels WHERE slug = ANY($1)', [funnels]);
  const funnelId = new Map(rows.map((r) => [r.slug, r.id]));
  const missing = funnels.filter((f) => !funnelId.has(f));
  if (missing.length) throw new Error(`funnels not in Postgres (publish them first): ${missing.join(', ')}`);
  await clickhouse(`INSERT INTO events FORMAT JSONEachRow\n${data.events.map((e) => JSON.stringify(e)).join('\n')}`);
  for (const c of data.checkouts) {
    await pool.query(
      `INSERT INTO checkouts (id, paddle_transaction_id, funnel_id, v, plan_key, sid, attribution, status, created_at, completed_at)
       VALUES ($1, $2, $3, $4, '1w', $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING`,
      [c.id, c.txn, funnelId.get(c.funnel), c.v, c.sid, c.attribution, c.status, new Date(c.created_at), c.completed_at && new Date(c.completed_at)],
    );
  }
  for (const t of data.transactions) {
    await pool.query(
      `INSERT INTO transactions (paddle_transaction_id, checkout_id, status, origin, amount_minor, currency, billed_at, paddle_updated_at)
       VALUES ($1, $2, 'completed', 'web', $3, $4, $5, $5) ON CONFLICT (paddle_transaction_id) DO NOTHING`,
      [t.id, t.checkout_id, t.amount_minor, t.currency, new Date(t.billed_at)],
    );
  }
  for (const r of data.refunds) {
    await pool.query(
      `INSERT INTO outbox (topic, aggregate_id, dedupe_key, payload, created_at, published_at)
       VALUES ('payment.refunded', $1, $2, $3, $4, now()) ON CONFLICT (dedupe_key) DO NOTHING`,
      [r.transaction_id, `payment.refunded:sample:${r.transaction_id}`, { paddle_transaction_id: r.transaction_id, adjustment_id: `adj_sample_${r.transaction_id}`, amount_minor: r.amount_minor, currency: r.currency, type: 'full' }, new Date(r.at)],
    );
  }
  const sessions = new Set(data.events.map((e) => e.sid)).size;
  return { events: data.events.length, sessions, checkouts: data.checkouts.length, paid: data.transactions.length, refunds: data.refunds.length };
}
```

`demo/lib/stack.mjs`, `demo/events.mjs`, `demo/README.md` (sửa, áp dụng đúng diff này):

````bash
git apply <<'PATCH'
diff --git a/demo/README.md b/demo/README.md
index cc2c12c..402c58f 100644
--- a/demo/README.md
+++ b/demo/README.md
@@ -25,6 +25,7 @@ or `--funnels-dir`.
 npm ci
 npm run demo             # prints a URL per funnel, for localhost and for your LAN IP
 npm run demo:events      # newest 30 events + counts per funnel / name / screen (-- --funnel <slug>)
+npm run demo:events -- --seed   # first adds 3 days of sample sessions, checkouts and payments (Dashboard)
 npm run demo:down        # stop the containers (-- --reset also deletes their data)
 npm run demo:test        # unit tests + end-to-end smoke test (needs Docker; e2e skips without the funnels)
 ```
@@ -90,6 +91,14 @@ catalog has three prices (`Weekly`, `Tarot reading 2027`, one archived `Weekly (
 buyer up → grant, revoke → resend the app-link email → rotate the user_id (ports 8857/8158/8859/8858/8861/8862,
 databases `ikf_admin_p2_test`).
 
+Phase 3 (spec admin-console-p3): the **Dashboard** (`/`) and each funnel's **Số liệu** tab read ClickHouse
+(`funnel_hourly`, filled by a materialized view; `clickhouse/002_funnel_hourly.sql` and its backfill run at every
+start) and Postgres. With the demo running, `npm run demo:events -- --seed` writes 3 days of sample sessions for
+every published funnel (2 versions, 3 sources, 3 countries, 2 devices, a screen ladder, leads, checkouts, USD and
+JPY payments, one refund); seeding again in the same hour adds nothing. `npm run demo:test` includes
+`test/admin-p3-e2e.test.mjs`: sample data → Dashboard → Số liệu (ports 8877/8178/8879/8878/8881/8882, databases
+`ikf_admin_p3_test`).
+
 ## Full purchase flow (`npm run demo:purchase`)
 
 Buy on a real funnel from your phone, open the "app", see **PRO**; refund from the control panel, see **FREE**.
diff --git a/demo/events.mjs b/demo/events.mjs
index 66aea82..341cc36 100644
--- a/demo/events.mjs
+++ b/demo/events.mjs
@@ -1,14 +1,31 @@
 #!/usr/bin/env node
-// npm run demo:events [-- --funnel <slug>]: the 30 newest events and counts per funnel/name/screen.
+// npm run demo:events [-- --funnel <slug>] [-- --seed]: the 30 newest events and counts per funnel/name/screen.
+// --seed first writes 3 days of sample sessions, checkouts and payments for the dashboard (demo/lib/sample.mjs).
 import { parseArgs } from 'node:util';
+import pg from 'pg';
 import { DemoError } from './lib/docker.mjs';
-import { clickhouse } from './lib/stack.mjs';
+import { seedSample } from './lib/sample.mjs';
+import { clickhouse, PG } from './lib/stack.mjs';
+
+async function seed(funnel) {
+  const pool = new pg.Pool({ ...PG, max: 2 });
+  try {
+    const slugs = funnel ? [funnel] : (await pool.query('SELECT slug FROM funnels ORDER BY slug')).rows.map((r) => r.slug);
+    if (!slugs.length) throw new DemoError('no funnel in Postgres: start the demo first (npm run demo)');
+    const r = await seedSample({ clickhouse, pool, funnels: slugs });
+    console.log(`Sample data for ${slugs.join(', ')}: ${r.sessions} sessions, ${r.events} events, ${r.checkouts} checkouts, ${r.paid} paid, ${r.refunds} refund.`);
+    console.log('Open the admin console (Dashboard) to see them.\n');
+  } finally {
+    await pool.end();
+  }
+}
 
 async function main() {
-  const { values } = parseArgs({ args: process.argv.slice(2), options: { funnel: { type: 'string' } } });
+  const { values } = parseArgs({ args: process.argv.slice(2), options: { funnel: { type: 'string' }, seed: { type: 'boolean', default: false } } });
   if (values.funnel !== undefined && !/^[a-z0-9][a-z0-9-]{1,62}$/.test(values.funnel)) {
     throw new DemoError(`--funnel must be a funnel slug, got ${values.funnel}`);
   }
+  if (values.seed) await seed(values.funnel);
   const where = values.funnel ? 'WHERE funnel = {funnel:String}' : '';
   const params = values.funnel ? { funnel: values.funnel } : {};
   const total = (await clickhouse(`SELECT count() FROM events FINAL ${where}`, { params })).trim();
diff --git a/demo/lib/stack.mjs b/demo/lib/stack.mjs
index a8cdcd7..768b8d2 100644
--- a/demo/lib/stack.mjs
+++ b/demo/lib/stack.mjs
@@ -5,6 +5,7 @@ import { readdir, readFile } from 'node:fs/promises';
 import { networkInterfaces } from 'node:os';
 import pg from 'pg';
 import { buildApp } from '../../services/core-api/src/app.js';
+import { createClickhouse } from '../../services/core-api/src/analytics/clickhouse.js';
 import { ensureToken } from '../../services/core-api/src/auth.js';
 import { migrate } from '../../services/core-api/src/db/migrate.js';
 import { miniflareKv, miniflareStore } from './adapters.mjs';
@@ -165,10 +166,12 @@ export async function startStack({
     // The SPA and core-api are both on localhost (one site): the session cookie rides on the SPA's fetches.
     const adminOrigin = `http://localhost:${ports.admin}`;
     const admin = adminUser ? { admin: { appEnv: 'local', origin: adminOrigin, localUser: adminUser } } : {};
+    // The dashboard reads the demo's ClickHouse as core-api does in production (spec admin-console-p3 §2).
+    const analytics = { clickhouse: createClickhouse({ url: CH.url, user: CH.user, password: CH.password, database: chDatabase }) };
     const app = buildApp({
       logger: logStream ? { level: 'info', stream: logStream } : verbose,
       checks: { db: () => pool.query('select 1') },
-      deps: { pool, store, kv, mediaOrigins: [mediaBase], previewBaseUrl: `http://preview.localhost:${ports.edge}`, ...shop?.deps, ...admin },
+      deps: { pool, store, kv, mediaOrigins: [mediaBase], previewBaseUrl: `http://preview.localhost:${ports.edge}`, ...shop?.deps, ...admin, ...analytics },
     });
     await app.listen({ host: '127.0.0.1', port: ports.core });
     stops.push(() => app.close());
PATCH
````

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npx vitest run --config demo/vitest.config.mjs demo/test/sample.test.mjs 2>&1 | grep -E "Tests  "
npx vitest run --config demo/vitest.config.mjs demo/test/admin-p3-e2e.test.mjs 2>&1 | grep -E "Tests  |Duration"
npm run demo:test 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  6 passed (6)` (không cần Docker); e2e `Tests  1 passed (1)` (~5 s sau khi stack lên); demo `Test Files  22 passed (22)`, `Tests  124 passed (124)`. Không chạy `npm run demo:events -- --seed` vào DB `ikf` của demo khi session khác đang dùng demo (e2e đã chạy `seedSample` trên `ikf_admin_p3_test`).

- [ ] **Step 5: Commit**

```bash
git add demo
git commit -m "feat(demo): core reads ClickHouse for the dashboard; sample sessions/checkouts/payments (demo:events --seed); phase 3 e2e"
```

---

### Task 12: Hạ tầng + docs: rate limit `/v1/analytics/*`, 2 secret mới + `CLICKHOUSE_DATABASE`, runbook `analytics.md`, `CLAUDE.md`

**Files:**
- Create: `docs/runbooks/analytics.md`
- Modify: `infra/modules/edge/{main.tf, variables.tf}`, `infra/stack/main.tf`, `CLAUDE.md`
- Test: Modify `infra/modules/edge/tests/edge.tftest.hcl`, `infra/stack/tests/stack.tftest.hcl`

**Interfaces:**
- Consumes: biến edge `rate_limited_prefixes` (đợt 2, validation: bắt đầu `/v1/`, kết thúc `/`, không phủ `/v1/paddle/webhook`), `local.secret_names` → `module.security.secret_arns` (đã nằm trong policy `AppSecrets` của task core), `local.core_environment`.
- Produces: `rate_limited_prefixes` mặc định `["/v1/customers/", "/v1/analytics/"]`; secret rỗng `ikf/<env>/clickhouse-reader-user`, `ikf/<env>/clickhouse-reader-password` (cạnh `clickhouse-url` đã có); env core `CLICKHOUSE_DATABASE = "ikf"`; runbook các bước DDL → backfill → `ikf_reader` → secret → redeploy → `ikf stats`.

- [ ] **Step 1: Viết test fail**

`infra/modules/edge/tests/edge.tftest.hcl`, `infra/stack/tests/stack.tftest.hcl` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/infra/modules/edge/tests/edge.tftest.hcl b/infra/modules/edge/tests/edge.tftest.hcl
index 4299e33..0791a98 100644
--- a/infra/modules/edge/tests/edge.tftest.hcl
+++ b/infra/modules/edge/tests/edge.tftest.hcl
@@ -139,11 +139,21 @@ run "admin_console_customer_and_catalog_paths_are_rate_limited" {
   }
 
   assert {
-    condition     = cloudflare_ruleset.ratelimit.rules[0].expression == "(http.host eq \"api.ikf-staging.example\" and (http.request.uri.path in {\"/v1/otp/send\" \"/v1/otp/verify\" \"/v1/claims/redeem\" \"/v1/magic/redeem\" \"/v1/payment/check-purchased-web-funnel\" \"/v1/paddle/prices\"} or starts_with(http.request.uri.path, \"/v1/customers/\")))"
+    condition     = cloudflare_ruleset.ratelimit.rules[0].expression == "(http.host eq \"api.ikf-staging.example\" and (http.request.uri.path in {\"/v1/otp/send\" \"/v1/otp/verify\" \"/v1/claims/redeem\" \"/v1/magic/redeem\" \"/v1/payment/check-purchased-web-funnel\" \"/v1/paddle/prices\"} or starts_with(http.request.uri.path, \"/v1/customers/\") or starts_with(http.request.uri.path, \"/v1/analytics/\")))"
     error_message = "Identity rule: exact paths, or a path under one of the prefixes, on the API host."
   }
 }
 
+run "admin_console_analytics_paths_are_rate_limited" {
+  command = apply
+
+  # Spec admin-console-p3 §2: the dashboard's /v1/analytics/* (ClickHouse reads) join the identity rule.
+  assert {
+    condition     = strcontains(cloudflare_ruleset.ratelimit.rules[0].expression, "starts_with(http.request.uri.path, \"/v1/analytics/\")")
+    error_message = "The identity rule must cover /v1/analytics/* (each request runs ClickHouse queries)."
+  }
+}
+
 run "turnstile_covers_funnel_hosts" {
   command = apply
 
diff --git a/infra/stack/tests/stack.tftest.hcl b/infra/stack/tests/stack.tftest.hcl
index a758e4e..e655e1a 100644
--- a/infra/stack/tests/stack.tftest.hcl
+++ b/infra/stack/tests/stack.tftest.hcl
@@ -303,3 +303,18 @@ run "admin_console_wiring" {
     error_message = "The admin console is ikf-admin-<env> at admin.<zone>."
   }
 }
+
+run "analytics_wiring" {
+  command = apply
+
+  # Spec admin-console-p3 §2: a read-only ClickHouse user (URL, user, password: created empty, set by hand) and the database.
+  assert {
+    condition     = alltrue([for n in ["clickhouse-url", "clickhouse-reader-user", "clickhouse-reader-password"] : contains(keys(module.security.secret_arns), n)])
+    error_message = "core-api needs the clickhouse-url, clickhouse-reader-user and clickhouse-reader-password secrets."
+  }
+
+  assert {
+    condition     = local.core_environment["CLICKHOUSE_DATABASE"] == "ikf"
+    error_message = "core-api reads analytics from the ikf ClickHouse database."
+  }
+}
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
for d in infra/modules/edge infra/stack; do (cd $d && terraform test -no-color 2>&1 | grep -E "\.\.\. fail|Failure!|Success!"); done
```

Expected: edge `run "admin_console_customer_and_catalog_paths_are_rate_limited"... fail`, `run "admin_console_analytics_paths_are_rate_limited"... fail`, `Failure! 11 passed, 2 failed.`; stack `run "analytics_wiring"... fail`, `Failure! 12 passed, 1 failed.`

- [ ] **Step 3: Implement**

`infra/modules/edge/main.tf`, `infra/modules/edge/variables.tf`, `infra/stack/main.tf` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/infra/modules/edge/main.tf b/infra/modules/edge/main.tf
index d39b693..0d4164b 100644
--- a/infra/modules/edge/main.tf
+++ b/infra/modules/edge/main.tf
@@ -72,7 +72,7 @@ resource "cloudflare_ruleset" "origin_auth" {
 locals {
   ratelimit_api_rules = [
     {
-      description = "Throttle the identity API (OTP, claim, magic link, IKameSDK check-purchased, admin console customers and price catalog) per IP"
+      description = "Throttle the identity API (OTP, claim, magic link, IKameSDK check-purchased, admin console customers, price catalog and dashboard) per IP"
       expression  = "(http.host eq \"${local.api_fqdn}\" and (http.request.uri.path in {${local.paths}}${local.prefixes}))"
       action      = "block"
       ratelimit = {
diff --git a/infra/modules/edge/variables.tf b/infra/modules/edge/variables.tf
index c454615..cfdae6a 100644
--- a/infra/modules/edge/variables.tf
+++ b/infra/modules/edge/variables.tf
@@ -35,9 +35,9 @@ variable "rate_limited_paths" {
 }
 
 variable "rate_limited_prefixes" {
-  description = "Identity endpoints by path prefix (starts_with), for paths with an id in them: the admin console's customer routes. Never a prefix of /v1/paddle/webhook."
+  description = "Identity endpoints by path prefix (starts_with), for paths with an id in them: the admin console's customer routes and its dashboard (ClickHouse reads). Never a prefix of /v1/paddle/webhook."
   type        = list(string)
-  default     = ["/v1/customers/"]
+  default     = ["/v1/customers/", "/v1/analytics/"]
 
   validation {
     condition     = alltrue([for p in var.rate_limited_prefixes : startswith(p, "/v1/") && endswith(p, "/") && !startswith("/v1/paddle/webhook", p)])
diff --git a/infra/stack/main.tf b/infra/stack/main.tf
index 84acf2c..4a2f563 100644
--- a/infra/stack/main.tf
+++ b/infra/stack/main.tf
@@ -5,7 +5,7 @@ locals {
   secret_names = [
     "paddle-api-key", "paddle-webhook-secret", "paddle-client-token", "meta-capi-token", "adjust-s2s-token", "clickhouse-url",
     "cf-kv-api-token", "r2-access-key-id", "r2-secret-access-key", "bootstrap-admin-token", "claim-token-key",
-    "google-oauth-client-secret",
+    "google-oauth-client-secret", "clickhouse-reader-user", "clickhouse-reader-password",
   ]
   # Staging never charges real cards; prod never takes sandbox payments.
   paddle_env = var.env == "prod" ? "live" : "sandbox"
@@ -174,6 +174,8 @@ locals {
     ADMIN_ORIGIN           = "https://${module.edge.admin_fqdn}"
     API_ORIGIN             = "https://${local.api_fqdn}"
     GOOGLE_OAUTH_CLIENT_ID = var.google_oauth_client_id
+    # Admin console dashboard (spec admin-console-p3 §2): the database the read-only ClickHouse user queries.
+    CLICKHOUSE_DATABASE = "ikf"
   }
 }
 
PATCH
```

`docs/runbooks/analytics.md` (mới):

````markdown
# Runbook: admin console analytics (đợt 3: Dashboard ClickHouse)

Rollout per environment (staging first) of the console's **Dashboard** and the funnel **Số liệu** tab
(spec `ifunnel/docs/specs/2026-10-11-admin-console-p3-design.md`, ikame repo). core-api reads ClickHouse with a
read-only user (sessions, screens, milestones from `funnel_hourly`) and Postgres (paid, revenue, refunds). No
secret value goes into git, a shell history or a chat. Never `terraform apply` from a laptop.

Analytics is off until it is configured: core-api registers `/v1/analytics/*` only when the three secrets
`clickhouse-url`, `clickhouse-reader-user`, `clickhouse-reader-password` have values (otherwise it logs
`analytics disabled, missing: …`); the console then shows "Analytics chưa bật hoặc ClickHouse không phản hồi" and
every other screen works.

## 0. Before you start

- The events pipeline is live (runbook `runtime-sdk-collector.md`): `ikf.events` exists and fills.
- **Ask first whether staging and prod share one ClickHouse service.** If they do, the `ikf` database holds both
  environments' events (funnel slugs tell them apart only by convention): do steps 1–2 once, on that service, and
  give each env its own reader user; never run the backfill twice at the same time.

## 1. funnel_hourly (table + materialized view) and backfill

As the ClickHouse admin, per service (`clickhouse/002_funnel_hourly.sql` holds two statements: run it with
`clickhouse client --multiquery`, or paste the statements one by one into the Cloud SQL console). Use an admin
user that stays: the view runs as its creator (`DEFINER = CURRENT_USER SQL SECURITY DEFINER`), so dropping that
user later breaks every insert into `events`.

```bash
clickhouse client --host <host> --secure --user ikf_admin --database ikf --multiquery < clickhouse/002_funnel_hourly.sql
```

Then the one-off backfill of the events that predate the view (safe to run again, or while the view is already
filling: sessions are sets of `sid`, a duplicate changes no count):

```bash
clickhouse client --host <host> --secure --user ikf_admin --database ikf --multiquery < clickhouse/backfill/002_funnel_hourly.sql
```

Check: `SELECT count() FROM ikf.funnel_hourly` > 0, and for a funnel with traffic
`SELECT uniqExactMerge(sessions) FROM ikf.funnel_hourly WHERE funnel = '<slug>'` is close to
`SELECT uniqExact(sid) FROM ikf.events WHERE funnel = '<slug>'` (equal when nothing arrived in between).

## 2. Read-only user

```sql
CREATE USER ikf_reader IDENTIFIED WITH sha256_password BY '<random 32+ chars>';
GRANT SELECT ON ikf.events TO ikf_reader;
GRANT SELECT ON ikf.funnel_hourly TO ikf_reader;
```

No `INSERT`, no other database. `ikf_writer` (the event consumer) keeps only `INSERT ON ikf.events`: the view
writes `funnel_hourly` as its definer. Check right after step 1 that the consumer still inserts (its
`insert_failing` alarm stays quiet, new rows keep arriving in `ikf.events`): a view created without `SQL SECURITY
DEFINER` makes every consumer insert fail with `ACCESS_DENIED` (HTTP 500, retried, then the DLQ).

## 3. Terraform, secrets, core-api

`terraform apply` (workflow `infra`) creates the empty secrets `ikf/<env>/clickhouse-reader-user` and
`ikf/<env>/clickhouse-reader-password` (`ikf/<env>/clickhouse-url` exists since the collector), sets
`CLICKHOUSE_DATABASE=ikf` on core-api and adds `/v1/analytics/` to the edge's identity rate limit. Then:

```bash
aws secretsmanager put-secret-value --secret-id ikf/<env>/clickhouse-url --secret-string 'https://<host>:8443'
aws secretsmanager put-secret-value --secret-id ikf/<env>/clickhouse-reader-user --secret-string 'ikf_reader'
aws secretsmanager put-secret-value --secret-id ikf/<env>/clickhouse-reader-password --secret-string '<password>'
```

Force a new deployment of core-api. The log must not say `analytics disabled`.

## 4. Check

```bash
ikf stats <a funnel with traffic> --days 1
```

prints the milestones, the screen ladder and the revenue per currency. In the console: Dashboard lists the funnels;
a funnel's Số liệu tab shows the chart, the ladder and the breakdown. Every answer is logged as
`analytics {route, slug, from, to, ms}`.

## 5. When it breaks

- Console card "Analytics chưa bật hoặc ClickHouse không phản hồi", API `503 analytics_unavailable`: core-api logs
  `analytics_unavailable {kind, status}` — `auth` (wrong reader user/password, or the grants of step 2 missing),
  `unavailable` (ClickHouse down, slow > 10 s, or HTTP 5xx: ClickHouse also answers 500 for a failing query, so
  look at the query log), `client` (a 4xx: our SQL against an older schema — was step 1 run?). The message and the
  SQL are never logged; ClickHouse's `system.query_log` has them.
- Numbers lag: `funnel_hourly` follows `events` on insert (no lag of its own); the consumer's batching adds up to a
  minute. Answers are cached 30 s per request in each core-api task.
- Money looks wrong: it comes from Postgres (`checkouts`, `transactions`, refunds in `outbox`), gross per currency,
  no FX; renewals count for the funnel, version and utm of the first purchase. Country and device have no money
  (checkouts do not store them).
````

`CLAUDE.md` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/CLAUDE.md b/CLAUDE.md
index 6043a15..7f0d418 100644
--- a/CLAUDE.md
+++ b/CLAUDE.md
@@ -11,6 +11,7 @@ iKame Funnel Platform (iFunnel): replaces FunnelFox for web2app / web2web funnel
 | `apps/admin` | Admin console SPA (Vite + React, JS) → Worker `ikf-admin-<env>` (static assets) at `admin.<zone>`; `scripts/deploy-config.js` |
 | `workers/edge-router` | Cloudflare Worker: host+prefix routing, `__IKF` + SDK injection, `/_ikf/sdk.<hash>.js`, collector `POST /_ikf/c` |
 | `workers/event-consumer` | Queue consumer → ClickHouse, split-on-400, rejected → DLQ, SNS alarms |
+| `clickhouse/` | ClickHouse DDL (`001_events`, `002_funnel_hourly` + view), applied in name order (demo: at start; prod: by hand); `backfill/` one-off inserts |
 | `packages/sdk` | `ikf.js` browser SDK (capture, queue, consent, Meta Pixel); `scripts/build.mjs` makes the Worker module |
 | `packages/event-schema` | Event validation + PII scrub, shared by SDK and collector |
 | `packages/route-match` | Path-prefix matching shared by core, Worker, CLI |
@@ -66,6 +67,7 @@ Workflows: `docker run --rm -v "$PWD:/repo" -w /repo rhysd/actionlint:latest`.
 - Every change made through the API (token or person) writes `audit_log` in the change's own transaction where it has one (`src/audit.js`); actor = token name or a person's email. Logs carry a person's email only as `email_hash`.
 - Routes declare a grant with `requireRole`: token roles `publisher`/`router`/`admin`, people `viewer`/`support`/`editor`/`admin` through the grants table `USER_GRANTS` in `src/auth.js` (same table as `apps/admin/src/roles.js` `GRANTS`, a test keeps them equal): editor satisfies `publisher`, `prices:read`, `apps:read`; support satisfies `support`; admin everything. A cookie write needs `X-Ikf-Csrf`.
 - The console never receives a buyer's `user_id` or email (customer lookup report v2); customers are named by `customer_ref` (`cus_…`) in URLs, audit and logs.
+- Dashboard analytics (`/v1/analytics/*`, grant `viewer`): sessions come from ClickHouse `funnel_hourly` (`clickhouse/002_funnel_hourly.sql`, a materialized view of `events` with `uniqExactState(sid)`: read with `uniqExactMerge(h.sessions)`, never a bare `sessions` after an `AS sessions` alias); money only from Postgres. Analytics answers carry aggregates only (no `sid`, no PII), are cached 30 s per core task, and a ClickHouse failure is `503 analytics_unavailable` (log: `kind` + status only). New `clickhouse/*.sql` files must stay idempotent; a materialized view needs `DEFINER = CURRENT_USER SQL SECURITY DEFINER` or the consumer's `ikf_writer` inserts fail. Runbook `docs/runbooks/analytics.md`.
 - `ADMIN_LOCAL_USER` (sign-in without Google) is local-demo only: `loadConfig`, `buildApp`, the core-service Terraform module and `apps/admin/scripts/deploy-config.js` all refuse it.
 
 ## Process
@@ -74,4 +76,4 @@ Work follows spec → plan → TDD tasks (superpowers skills), one reviewed task
 
 ## Local demo
 
-`npm run demo` runs real funnels locally (Miniflare edge-router + event-consumer, core-api in-process, Postgres + ClickHouse in Docker, compose project `ikf-demo`), plus the admin console at `http://localhost:8792` (local admin from `--admin-user`, default `demo@ikameglobal.com`; publish to `demo.localhost`; a `support@ikameglobal.com` support user is seeded; prices and customers need the purchase flow: `npm run demo -- --purchase --host https://… --admin-user <email>`). Scripts: `npm run demo`, `npm run demo:events`, `npm run demo:purchase` (full purchase flow on a phone: fake Paddle/Turnstile/SES, quick tunnel + QR), `npm run demo:down` (`-- --reset` wipes data), `npm run demo:test` (never two at once: fixed ports). Options, ports and troubleshooting: `demo/README.md`. Code in `demo/` only; it must not change `services/`, `workers/` or `packages/`, except the sanctioned `PADDLE_JS_URL` → `__IKF.paddle.js` hook (edge-router emits it only for `https://` values, the SDK loads only `https:`, and `workers/edge-router/scripts/deploy-config.js` refuses the variable so it never reaches a deployed Worker). Fakes are injected only through `buildApp({deps})` from `demo/lib/purchase.mjs`; nothing in `services/` or `workers/` reads a demo flag.
+`npm run demo` runs real funnels locally (Miniflare edge-router + event-consumer, core-api in-process, Postgres + ClickHouse in Docker, compose project `ikf-demo`), plus the admin console at `http://localhost:8792` (local admin from `--admin-user`, default `demo@ikameglobal.com`; publish to `demo.localhost`; a `support@ikameglobal.com` support user is seeded; prices and customers need the purchase flow: `npm run demo -- --purchase --host https://… --admin-user <email>`; the Dashboard reads the demo's ClickHouse, `npm run demo:events -- --seed` adds 3 days of sample data). Scripts: `npm run demo`, `npm run demo:events`, `npm run demo:purchase` (full purchase flow on a phone: fake Paddle/Turnstile/SES, quick tunnel + QR), `npm run demo:down` (`-- --reset` wipes data), `npm run demo:test` (never two at once: fixed ports). Options, ports and troubleshooting: `demo/README.md`. Code in `demo/` only; it must not change `services/`, `workers/` or `packages/`, except the sanctioned `PADDLE_JS_URL` → `__IKF.paddle.js` hook (edge-router emits it only for `https://` values, the SDK loads only `https:`, and `workers/edge-router/scripts/deploy-config.js` refuses the variable so it never reaches a deployed Worker). Fakes are injected only through `buildApp({deps})` from `demo/lib/purchase.mjs`; nothing in `services/` or `workers/` reads a demo flag.
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
for d in infra/modules/edge infra/modules/core-service infra/stack; do (cd $d && terraform test -no-color | tail -1); done
terraform fmt -check -recursive infra
for e in staging prod; do (cd infra/envs/$e && terraform init -backend=false -input=false >/dev/null; terraform validate -no-color | tail -1); done
npm test -w @ikf/core-api -- test/rate-limit-path.test.js 2>&1 | grep -E "Tests  "
```

Expected: `Success! 13 passed, 0 failed.`, `Success! 6 passed, 0 failed.`, `Success! 13 passed, 0 failed.`; fmt không in gì; hai env `Success! The configuration is valid.`; `Tests  1 passed (1)` (check-purchased vẫn trong `rate_limited_paths`).

- [ ] **Step 5: Commit**

```bash
git add infra docs CLAUDE.md
git commit -m "feat: rate limit /v1/analytics/*; Terraform reader secrets + CLICKHOUSE_DATABASE; runbook analytics; CLAUDE.md"
```

---

### Task 13: Chạy lại toàn nhánh

**Files:** — (chỉ kiểm tra)

- [ ] **Step 1: Toàn bộ workspace + demo + Terraform**

```bash
npm test -w @ikf/paddle -w @ikf/event-schema -w @ikf/funnel-lint -w @ikf/sdk -w @ikf/cli -w @ikf/edge-router -w @ikf/event-consumer -w @ikf/core-api -w @ikf/route-match -w @ikf/admin 2>&1 | grep -E "Test Files|Tests  |bytes gzip"
npm run demo:test 2>&1 | grep -E "Test Files|Tests  "
terraform fmt -check -recursive infra
for d in infra/modules/edge infra/modules/core-service infra/stack; do (cd $d && terraform test -no-color | tail -1); done
for e in staging prod; do (cd infra/envs/$e && terraform init -backend=false -input=false >/dev/null; terraform validate -no-color | tail -1); done
git status --short
```

Expected: paddle 34, event-schema 145, funnel-lint 35, sdk 159, cli **159** (15 file), edge-router 106 (7 file, `ikf sdk d1a533c86611: 8154 bytes gzip`, không đổi), event-consumer 8 + 27, core-api **548** (59 file), route-match 35, admin **128** (15 file); demo **124** (22 file); fmt không in gì; edge `Success! 13 passed, 0 failed.`, core-service `Success! 6 passed, 0 failed.`, stack `Success! 13 passed, 0 failed.`; hai env `Success! The configuration is valid.`; `git status` sạch. Không còn tiến trình nào của mình nghe trên cổng demo (`lsof -nP -iTCP -sTCP:LISTEN`). (Khi soạn plan, một lần `demo:test` có `admin-p2-e2e` fail sau 5 s rồi pass ở hai lần chạy tiếp và khi chạy riêng — nếu gặp lại, chạy riêng file đó trước khi kết luận.)

- [ ] **Step 2: Review toàn nhánh** (superpowers:requesting-code-review) trước PR vào `feat/admin-console-p2` (PR #7) — hoặc theo thứ tự stack mà Tech Lead chọn. PR body kết thúc bằng dòng attribution Claude Code.

---

## Theo sau (thủ công, ngoài phạm vi plan này)

1. **ClickHouse (staging rồi prod)** theo `docs/runbooks/analytics.md`: hỏi trước staging/prod có dùng chung service không; chạy `002` bằng một admin "ở lại" (view chạy dưới quyền người tạo), **ngay sau đó kiểm consumer vẫn insert** (A1), rồi backfill, tạo `ikf_reader`. Không làm trong plan.
2. **Deploy**: `terraform apply` (workflow `infra`: 2 secret rỗng, `CLICKHOUSE_DATABASE`, luật rate limit), nạp 3 secret, redeploy core-api, deploy SPA (`admin.yml`), kiểm `ikf stats <slug> --days 1`.
3. **Kiểm thật trên staging** những gì mock/Testcontainers không chứng minh được: mã lỗi xác thực của ClickHouse Cloud (403/516 → `auth`), thời gian truy vấn trên dữ liệu thật (mặc định timeout 10 s), cú pháp `starts_with(…)` của Cloudflare thật, độ trễ của view so với consumer.
4. **Postgres**: truy vấn tiền lọc theo `checkouts.completed_at`, `checkouts.created_at`, `transactions.billed_at`, `outbox.created_at` không có index riêng; khi số giao dịch lớn mà Dashboard chậm, thêm index (migration riêng).
5. **Ngoài phạm vi spec** (đặt tên step từ HTML, FX, net revenue/MRR/LTV, cohort, export CSV, cảnh báo, so sánh hai khoảng, real-time < 1 phút, OPTIMIZE định kỳ) — không có task.

---

## Self-Review

**Spec coverage:**

| Spec | Task |
|---|---|
| Điều kiện xong: demo Dashboard mỗi funnel một dòng sessions/leads/checkouts/paid/doanh thu > 0; tab Số liệu biểu đồ giờ, bậc thang, mốc, breakdown Version ≥ 2 dòng; e2e Playwright đúng luồng | 11 (e2e, `seedSample`), 9, 10 (+A15) |
| Điều kiện xong: insert trùng `id` không đếm đôi session (test MV) | 1 (`the same event id inserted twice…`), 3 (`DUP`) |
| Điều kiện xong: thiếu secret → analytics tắt, thẻ "chưa bật", route khác chạy; test cũ pass; bundle SDK không đổi | 2 (`analyticsDeps`), 6 (`without a ClickHouse client…`), 9 (404/503 → thẻ, +A12), 13 |
| Quyết định #1 chuyển đổi session → screen → lead → checkout → paid + doanh thu | 3, 4, 5, 9, 10 |
| Quyết định #2 theo giờ, gần real-time (MV), 24 h … 90 ngày | 1, 5 (`resolveRange`), 8 (`RangePicker`) |
| Quyết định #3 `viewer` trở lên, cả doanh thu, không PII | 6 (bảng role, token, không `sid`) |
| Quyết định #4 chiều Version · utm_source · utm_campaign · Quốc gia · Thiết bị | 1 (cột MV), 3, 4, 5, 10 |
| Quyết định #5 MV `uniqExactState(sid)` + tiền từ Postgres | 1 (+A1–A4), 4 (+A8) |
| Quyết định #6 SVG tự viết, không dependency runtime SPA | 8 (+Global Constraints) |
| §1 ClickHouse: bảng, MV, backfill, đọc `uniqExactMerge`, lọc funnel + giờ | 1, 3 (+A5) |
| §1 số liệu ClickHouse (sessions, mốc, bậc thang `screen_view`, `events[]`, chiều) | 3 (+A16) |
| §1 số liệu Postgres (paid, revenue, refunds, chiều tiền, không quốc gia/thiết bị, không FX) | 4 (+A7, A8) |
| §1 khoảng thời gian, giới hạn, UTC | 5 (+A9), 6 (`invalid_range`) |
| §2 client đọc ClickHouse (POST, `param_*`, JSONEachRow, Basic, retry, `ClickhouseError`, log) | 2 (+A6) |
| §2 config/secret (`CLICKHOUSE_DATABASE`, 3 secret, `analyticsDeps`, log, demo tiêm deps) | 2, 11, 12 |
| §2 3 route, schema 400, 404, cache 30 s, 503, log `analytics`, không audit | 5, 6 (+A10, A11, A19) |
| §2 rate limit `/v1/analytics/`; CLI `ikf stats` | 12, 7 (+A17, A18) |
| §3 SPA Dashboard, tab Số liệu, thành phần, client, format, trạng thái, request token, nav | 8, 9, 10 (+A12, A13, A20) |
| §4 demo (apply 002 + backfill, dữ liệu mẫu, e2e cổng/DB riêng), hạ tầng, runbook, kiểm thử | 1, 11, 12 (+A4, A14, A15) |
| §4 ngoài phạm vi | không task (đúng) |

**Placeholder:** không có "TBD"/"tương tự Task N". Mọi khối code và patch được sinh từ cây đã chạy test (Node 26, colima), rồi áp lại theo thứ tự lên một bản `331299d` sạch và so khớp tree sau từng task. Không chạy được ở đây: ClickHouse Cloud thật (mã lỗi, `--multiquery`, quyền definer trên Cloud), Cloudflare thật, `npm run demo:events -- --seed` trên DB `ikf` dùng chung của demo (đã chạy `seedSample` qua e2e trên `ikf_admin_p3_test`) — "Theo sau" 3.

**Nhất quán tên / kiểu:**
- `funnel_hourly` cột (Task 1) = `where()`/`COUNTS` của `queries.js` (Task 3) = backfill; `h.sessions` ở mọi truy vấn (A5).
- `ClickhouseError.kind` (Task 2) ← `answer()` của route (Task 6, 503 + log `kind`, `status`); `createClickhouse` (Task 2) ← `analyticsDeps` (Task 2), `startStack` (Task 11), test Task 3/6.
- `queries.js` (Task 3) + `revenue.js` (Task 4) ← `analyticsService` (Task 5, tên hàm giả trong test trùng tên thật: `versionsSeen`, `eventSeries`, `eventTotals`, `screenSteps`, `otherEvents`, `eventBreakdown`, `eventOverview`, `funnelIdOf`, `moneySeries`, `moneyBreakdown`, `moneyOverview`).
- Response (Task 5/6): overview `{range, funnels: [{slug, sessions, leads, checkouts, paid, revenue, refunds}]}` = `Dashboard` (Task 9) = e2e (Task 11); funnel `{range, by, versions, series, steps, milestones, events}` = `StatsTab` (Task 10) = `ikf stats` (Task 7); breakdown `{dim, rows: [{key, sessions, leads, checkout_complete, paid, revenue}]}` = `StatsTab`.
- Client `getOverview`/`getFunnelStats`/`getFunnelBreakdown` (Task 8) = `fakeClient` (Task 9/10) = trang (Task 9/10); `analyticsOff`, `AnalyticsError`, `Loading` (Task 9) ← `StatsTab` (Task 10).
- Nhãn dùng trong e2e (Task 11) = Task 9–10: heading `Dashboard`, `overview-row`, link slug, tab `Số liệu`, `step`, `milestone` (`paid…`), `breakdown-row` (`v1`, `v2`).
- Cổng/DB e2e (Task 11) = README demo = Global Constraints; secret names (Task 2 `ANALYTICS_SECRETS`) = Terraform (Task 12) = runbook.

**Review Focus đã ghim:** 1 → Task 5, 6, 9; 2 → Task 3, 1; 3 → Task 3, 10; 4 → Task 8, 9, 7; 5 → Task 6, 2, 10.

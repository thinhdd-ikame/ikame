# Admin Console đợt 3 (Dashboard ClickHouse) — Design Spec

> Nối tiếp đợt 1 (PR #6) và đợt 2 (PR #7). Đưa số liệu chuyển đổi funnel và doanh thu lên console, gần real-time theo giờ, đọc từ ClickHouse (sự kiện) và Postgres (tiền). Code trong repo `ikf-platform`, nhánh mới cắt từ `feat/admin-console-p2`.

**Mục tiêu:** mọi người có tài khoản console trả lời được "funnel này đang chuyển đổi ra sao" — session → từng screen → lead → checkout → paid, doanh thu kèm theo, so sánh version, cắt theo nguồn/quốc gia/thiết bị — mà không cần truy vấn ClickHouse bằng tay.

**Điều kiện xong:**
- Trên demo (`npm run demo` với dữ liệu mẫu): Dashboard hiện mỗi funnel một dòng với sessions/leads/checkouts/paid/doanh thu > 0; tab "Số liệu" của funnel hiện biểu đồ theo giờ, bậc thang screen, các mốc, breakdown theo Version có ≥ 2 dòng. e2e Playwright chạy đúng luồng này.
- Insert trùng `id` vào `events` không làm số session đếm đôi (test MV).
- Thiếu secret ClickHouse → analytics tắt, console hiện thẻ "chưa bật", mọi route khác chạy bình thường. Toàn bộ test cũ pass; bundle SDK không đổi.

## Quyết định (2026-10-11)

| # | Hạng mục | Lựa chọn |
|---|---|---|
| 1 | Câu hỏi chính | Chuyển đổi funnel (session → screen → lead → checkout → paid) kèm doanh thu |
| 2 | Độ tươi / khoảng | Theo **giờ**, gần real-time (MV cập nhật theo insert); khoảng 24 h … 90 ngày |
| 3 | Quyền xem | `viewer` trở lên, kể cả doanh thu (số liệu tổng hợp, không PII) |
| 4 | Chiều | Version · `utm_source` · `utm_campaign` · Quốc gia · Thiết bị (`ua_class`) |
| 5 | Kiến trúc | **B:** MV theo giờ `funnel_hourly` với `uniqExactState(sid)` (insert trùng không đếm đôi) + doanh thu từ Postgres nối theo `sid`; không đẩy purchase vào ClickHouse |
| 6 | Biểu đồ | SVG inline tự viết; không thêm dependency runtime cho SPA |

## 1. Dữ liệu và số liệu

### ClickHouse
- `clickhouse/002_funnel_hourly.sql` (idempotent `CREATE … IF NOT EXISTS`; demo tự apply theo thứ tự tên; prod chạy tay như `001`):
  - Bảng `funnel_hourly` ENGINE `AggregatingMergeTree`, cột: `funnel LowCardinality(String)`, `hour DateTime`, `v UInt32`, `name LowCardinality(String)`, `screen Nullable(Int32)`, `country LowCardinality(String)`, `ua_class LowCardinality(String)`, `utm_source LowCardinality(String)`, `utm_campaign LowCardinality(String)`, `sessions AggregateFunction(uniqExact, String)`. `ORDER BY (funnel, hour, v, name, screen, country, ua_class, utm_source, utm_campaign)`, `PARTITION BY toYYYYMM(hour)`, `TTL hour + INTERVAL 13 MONTH`.
  - MV `funnel_hourly_mv` TO `funnel_hourly` AS SELECT từ `events`: `hour = toStartOfHour(received_at)`, `utm_source = attr['utm_source']`, `utm_campaign = attr['utm_campaign']` (rỗng → `''`), `uniqExactState(sid)`.
  - Backfill một lần: `INSERT INTO funnel_hourly SELECT … FROM events FINAL GROUP BY …` (runbook).
- Đọc: `uniqExactMerge(sessions)` với `GROUP BY` theo chiều cần; luôn lọc `funnel` và `hour BETWEEN`.
- Insert trùng (`ReplacingMergeTree` chỉ dedupe lúc merge) không ảnh hưởng vì trạng thái `uniqExact` là tập hợp.

### Số liệu từ ClickHouse (đơn vị = session, `sid`)
- `sessions`: session có bất kỳ event nào.
- Mốc: `page_load`, `lead`, `checkout_click`, `checkout_complete` (SDK phát, có `props.checkout_id` — đáng tin).
- Bậc thang screen: `steps[k].sessions` = số session có event `screen_view` với `screen = k` (session đã xem screen k; không cộng dồn `≥ k`, vì funnel có thể nhảy screen). Màn hiển thị theo `screen` tăng dần, % so với screen nhỏ nhất.
- `events[]`: mọi `name` còn lại của funnel (tên tự do) với số session, để không mất dữ liệu funnel tự định nghĩa.
- Chiều: `v`, `utm_source`, `utm_campaign`, `country`, `ua_class` đều có sẵn trong MV.

### Số liệu từ Postgres (nguồn chuẩn về tiền)
- `paid`: `checkouts.status = 'completed'` có `transactions` với `status IN PAID` (`billing/sync.js`), bucket theo giờ của `checkouts.completed_at`.
- `revenue[]`: `SUM(transactions.amount_minor)` theo `currency` (gross, có tax, chưa trừ fee).
- `refunds[]`: từ `outbox` topic `payment.refunded` | `payment.chargeback` (`payload->>'amount_minor'`, `payload->>'currency'`), nối `payload->>'paddle_transaction_id'` → `transactions.checkout_id` → `checkouts.funnel_id`, bucket theo `outbox.created_at`.
- Chiều cho tiền: `v` (`checkouts.v`), `utm_source`/`utm_campaign` (`checkouts.attribution`). **Không** có theo quốc gia/thiết bị (không lưu trong `checkouts`); breakdown các chiều này chỉ có cột event, cột tiền `null` và UI ghi chú.
- Không FX, không net revenue, không MRR.

### Khoảng thời gian
- `from`, `to` ISO UTC; `by = hour | day`; mặc định 7 ngày theo giờ. Giới hạn: `by=hour` ≤ 14 ngày, `by=day` ≤ 90 ngày; `from < to`; `to` cắt ở hiện tại. Bucket Postgres và ClickHouse cùng UTC.

## 2. Core-api

### Client đọc ClickHouse — `src/analytics/clickhouse.js`
- `createClickhouse({url, user, password, database, fetch, timeoutMs = 10_000})` → `{query(sql, params = {})}`: `POST <url>/?database=<db>&default_format=JSONEachRow&param_<k>=<v>…`, body = SQL, Basic auth; parse NDJSON; 1 retry trên 5xx/timeout/mạng; lỗi → `ClickhouseError(kind: 'auth' | 'client' | 'unavailable')`. Log chỉ `kind` + status, không `err.message`, không SQL có tham số.
- Không dependency mới (fetch chuẩn Node).

### Config và secret
- Env `CLICKHOUSE_DATABASE` (mặc định `ikf`). Secrets: `clickhouse-url` (đã có trong Terraform, hiện rỗng), **mới** `clickhouse-reader-user`, `clickhouse-reader-password`. `src/analytics/setup.js` `analyticsDeps({config, secrets, fetch})` → `{deps: {clickhouse}} | null` + `missing`; thiếu → log `analytics disabled, missing: …`, không đăng ký route analytics.
- Demo: `buildApp({deps: {clickhouse: createClickhouse({url: 'http://127.0.0.1:18123', user: 'ikf', password: 'ikf', database})}})` từ `demo/lib/stack.mjs` (không sửa `services/` từ `demo/`).

### Routes (`src/http/analytics.js`, grant `viewer`, `cache-control: private, max-age=30`)

| Route | Trả về |
|---|---|
| `GET /v1/analytics/overview?from&to` | `{range: {from, to}, funnels: [{slug, sessions, leads, checkouts, paid, revenue: [{currency, amount_minor}], refunds: [{currency, amount_minor}]}]}` — mọi funnel có event hoặc checkout trong khoảng, sắp theo `sessions` giảm dần |
| `GET /v1/analytics/funnels/:slug?from&to&by&v` | `{range, by, versions: [UInt32…], series: [{t, sessions, page_load, leads, checkout_click, checkout_complete, paid, revenue: [...]}], steps: [{screen, sessions}], milestones: {sessions, page_load, leads, checkout_click, checkout_complete, paid}, events: [{name, sessions}]}` |
| `GET /v1/analytics/funnels/:slug/breakdown?from&to&dim&v` | `{dim, rows: [{key, sessions, leads, checkout_complete, paid, revenue}]}`; `dim ∈ v \| utm_source \| utm_campaign \| country \| ua_class`; `paid`/`revenue` = `null` khi `dim ∈ {country, ua_class}`; `key = ''` hiển thị `(không có)`; tối đa 50 dòng theo `sessions` |

- Validate query bằng schema Fastify: `from/to` ISO, `by` enum, `dim` enum, `v` integer ≥ 1; vi phạm → 400. Funnel không tồn tại → `404 funnel_not_found`.
- `src/analytics/queries.js` (ClickHouse SQL với `param_*`), `src/analytics/revenue.js` (Postgres), `src/analytics/service.js` (ghép theo bucket, điền 0 cho bucket trống, cache in-process 30 s theo khoá `route|slug|from|to|by|dim|v`; lỗi không cache).
- Lỗi ClickHouse → `503 {error: 'analytics_unavailable'}` (log `analytics_unavailable {kind}`); Postgres lỗi → 500 như thường. Không audit (đọc tổng hợp). Log mỗi request: `analytics {route, slug, from, to, ms}`.
- Rate limit Cloudflare: thêm prefix `/v1/analytics/` vào `rate_limited_prefixes`.
- CLI: `ikf stats <slug> [--days 7] [--by hour|day]` in các mốc, bậc thang screen, doanh thu theo currency (gọi API, retry như GET).

## 3. SPA (`apps/admin`)

- Không thêm dependency runtime; biểu đồ SVG inline; một `styles.css`.
- **Dashboard** (`/`, mục menu đầu "Dashboard", `viewer`): `RangePicker` (24 h · 7 d · 14 d · 30 d · 90 d; `by` tự chọn: ≤ 14 ngày → giờ, còn lại → ngày), bảng `data-testid="overview-row"`: funnel · sessions · leads · checkouts · paid · paid/session % · doanh thu (mỗi currency một dòng nhỏ) · refund; click slug → `/funnels/:slug` (tab Số liệu). Sắp xếp theo cột (client-side).
- **Funnel detail → tab "Số liệu"** (mặc định khi mở funnel; các tab khác giữ nguyên): `RangePicker` + lọc version (`versions` từ API); (1) `LineChart` series sessions / leads / checkout_complete / paid; (2) `Bars` bậc thang screen (`data-testid="step"`), nhãn `screen k`, giá trị + % so với screen đầu; (3) dải mốc `page_load → lead → checkout_click → checkout_complete → paid` với % rơi mỗi bước (`data-testid="milestone"`); (4) breakdown tab nhỏ Version · Nguồn · Campaign · Quốc gia · Thiết bị (`data-testid="breakdown-row"`), cột tiền hiện "—" kèm chú thích "doanh thu không có theo chiều này" với Quốc gia/Thiết bị; (5) bảng "Sự kiện khác". Ghi "giờ UTC" cạnh RangePicker.
- Thành phần: `components/charts/LineChart.jsx` (viewBox responsive, trục thời gian, legend, tooltip hover đơn giản), `components/charts/Bars.jsx`, `components/RangePicker.jsx`, `components/StatsTab.jsx`, `pages/Dashboard.jsx`; client `getOverview({from, to})`, `getFunnelStats(slug, {from, to, by, v})`, `getFunnelBreakdown(slug, {from, to, dim, v})`; `format.js` thêm `fmtNum`, `fmtPct`; `fmtMoney` nhận currency 0 chữ số thập phân (JPY, KRW, VND…) — bảng `ZERO_DECIMAL`.
- Trạng thái: `503 analytics_unavailable` → thẻ "Analytics chưa bật hoặc ClickHouse không phản hồi" (không ẩn phần còn lại của trang); rỗng → "Chưa có sự kiện trong khoảng này"; đang tải → khung xám. Mọi nút đổi khoảng/chiều khoá khi đang tải; phản hồi cũ bị bỏ (request token).
- Nav: Dashboard · Funnels · Apps · Khách hàng · Domains · Billing · Audit · Settings.

## 4. Demo, hạ tầng, kiểm thử, ngoài phạm vi

- **Demo:** `npm run demo` apply `002` (và chạy backfill idempotent cho dữ liệu đã có); `demo/events.mjs` mở rộng: sinh 3 ngày sự kiện cho 2 funnel × 2 version × 3 nguồn × 3 quốc gia × 2 thiết bị với bậc thang screen rơi dần và một phần `lead`/`checkout_click`/`checkout_complete`; đồng thời tạo `checkouts` (`completed`, cùng `sid`, `attribution`) + `transactions` (paid, 2 currency) + một `outbox` refund để có tiền. `--admin-user` như đợt 1. e2e `demo/test/admin-p3-e2e.test.mjs` (cổng riêng, DB `ikf_admin_p3_test` cả Postgres lẫn ClickHouse): Dashboard có dòng > 0 → tab Số liệu có `step` ≥ 3, `milestone` paid > 0, breakdown Version 2 dòng.
- **Hạ tầng:** Terraform stack thêm 2 secret rỗng vào `secret_arns`, env `CLICKHOUSE_DATABASE`; edge `rate_limited_prefixes` thêm `/v1/analytics/`. Runbook `docs/runbooks/analytics.md`: tạo `ikf_reader` (GRANT SELECT ON `ikf.events`, `ikf.funnel_hourly`; không INSERT), chạy `002`, backfill, nạp 3 secret, redeploy core-api, kiểm `ikf stats`; lưu ý staging/prod dùng chung service hay không (xác nhận trước khi backfill). Không `apply` trong plan.
- **Kiểm thử:** Testcontainers ClickHouse (image `clickhouse/clickhouse-server:25.8`, như event-consumer): `002` idempotent (apply 2 lần), MV đếm 1 session khi insert trùng `id`, `uniqExactMerge` theo screen/name/dim, biên giờ/ngày; `revenue.js` với Postgres (paid, refund, 2 currency, bucket giờ, `v`/utm); `service.js` ghép + điền 0 + cache 30 s (clock giả) + không cache lỗi; routes: schema 400, 404, bảng 4 role × 3 route (đều 200), token `viewer` 200; `503` khi ClickHouse 500/timeout và log không có `err.message`; `analyticsDeps` thiếu secret → null + log; SPA: Dashboard, StatsTab (steps/milestones/breakdown/events), RangePicker, trạng thái rỗng/503, `fmtMoney` JPY; CLI `stats`; e2e. Bundle SDK không đổi (8154 B).
- **Ngoài phạm vi:** đặt tên step từ HTML, FX quy đổi, net revenue / MRR / LTV, cohort/retention, export CSV, cảnh báo ngưỡng, so sánh hai khoảng, real-time < 1 phút, dedupe `events` bằng OPTIMIZE định kỳ (ngoài MV).

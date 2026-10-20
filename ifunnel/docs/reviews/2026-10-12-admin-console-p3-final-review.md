# Admin Console đợt 3 — Final whole-branch review

- Repo `ikf-platform`, nhánh `feat/admin-console-p3`, range `331299d..9c820e5` (12 commit, 60 file, +2769/−44). PR base `feat/admin-console-p2` (#7).
- Reviewer: Claude Opus (read-only, ba lượt: core-api + ClickHouse DDL/backfill; SPA + CLI; demo + infra + docs), 2026-10-12. Plan: `docs/plans/2026-10-12-admin-console-p3.md`. Spec: `docs/specs/2026-10-11-admin-console-p3-design.md`.
- Verdict: **Mergeable after two Important fixes.** Fix wave + scoped re-review: `2026-10-12-admin-console-p3-final-rereview.md`.

## Strengths
- **Bề mặt SQL injection đóng:** mọi giá trị người dùng đi qua `param_*` có kiểu; chỉ hằng module (`MILESTONE_EVENTS`, `STEP_EVENT`, `KNOWN`, limit) được nối vào SQL; `dim` whitelist hai lớp (enum Fastify + `DIMENSIONS.includes`); phía Postgres `MONEY_KEYS` cố định, mọi giá trị `$n`.
- **Hai kho đồng ý về bucket:** ClickHouse `toStartOfHour(toDateTime(received_at,'UTC'))` → `DateTime('UTC')`, `toStartOfDay(hour)`; Postgres `date_trunc($4, col, 'UTC')`; cả hai `[from, to)` trọn giờ. Ranh giới partition tháng, 10:59:59.999/11:00, 23:59/00:00 được ghim trên ClickHouse thật.
- **Insert trùng an toàn theo cấu trúc:** `uniqExactState(sid)` là tập; test insert cùng `id` hai lần → 1 session; backfill chạy hai lần không đổi số.
- **A1 được kiểm thật:** test tạo đúng `ikf_writer` (INSERT trên `events`) và `ikf_reader`, chứng minh writer vẫn insert khi view tồn tại và reader không ghi được.
- **Lỗi không lọt vào log/response:** `ClickhouseError` chỉ `kind` + `status`; body lỗi bị cancel; body 200 hỏng → `unavailable` không kèm body; test route đẩy một ClickHouse trả 500 có `secret_column` và khẳng định log không chứa nó lẫn SQL; test khẳng định không có `sid` ở cả ba route.
- **"Analytics tắt" giữ nguyên mọi thứ khác:** route chỉ đăng ký khi `pool && clickhouse`; SPA coi 503 `analytics_unavailable` hoặc 404 khác `funnel_not_found` là "chưa bật" (một thẻ), các tab khác vẫn dùng được.
- **Cache bounded:** khoảng làm tròn giờ; `funnelIdOf` chạy trước `cached()` nên slug lạ không bao giờ được cache; xoá cứng ở 1000 entry; lỗi không cache.
- **SPA xử lý request song song đúng:** request token ở Dashboard và StatsTab, khoá control khi tải, danh sách version cũ giữ nguyên khi tải tiếp; có test StrictMode double-effect.
- Test quan trọng chạy trên container thật (ClickHouse 25.8 cho MV/queries/client/routes, Postgres cho revenue/refund/renewal/routes). Dependency SPA không đổi; SDK không đụng; demo chỉ tiêm qua `buildApp({deps})`; cổng/DB e2e không trùng p1/p2.

## Declined to judge
Chi phí bộ nhớ `uniqExact` ở 90 ngày lưu lượng lớn (quyết định spec #5); `paid` bucket theo `checkouts.completed_at` = giờ xử lý webhook, không phải giờ Paddle (đúng spec §1); doanh thu tính gia hạn còn `paid` thì không (A8); trường `funnel` do client đặt nên ai cũng bơm được session (mô hình tin cậy sẵn có của pipeline — hệ quả riêng của đợt này ở M4); Số liệu là tab mặc định và `/` là Dashboard kể cả khi analytics tắt (spec §3); staging/prod có chung ClickHouse không (runbook hỏi trước); `v` tiền lấy từ `c.v` còm sự kiện từ `v` của event (khớp theo cấu trúc).

## Issues
### Important
1. **ClickHouse chậm bị đánh nặng hơn: truy vấn hết giờ không bị huỷ phía server và còn bị retry.** `clickhouse.js:75-79,101-107`: `AbortSignal.timeout` 10 s chỉ ngắt kết nối; ClickHouse không huỷ truy vấn HTTP khi client ngắt (`cancel_http_readonly_queries_on_client_close` mặc định 0), không gửi `max_execution_time`, và runbook không đặt profile cho reader → truy vấn chạy tiếp rồi `query()` chạy lần hai. Một trang funnel = 6 truy vấn → 12 truy vấn server không huỷ, người dùng nhận 503 sau ~20 s; lỗi không cache nên mỗi reload/mỗi người thêm 12; `Promise.all` để các truy vấn anh em chạy tiếp. Cùng service với event consumer → có thể đẩy ingestion vào `insert_failing` rồi DLQ (đúng case Review Focus 5). Fix: thêm `max_execution_time` (dưới timeout client), `cancel_http_readonly_queries_on_client_close=1`, gộp với `output_format_json_quote_64bit_integers=0`; runbook: reader không được `readonly=1`.
2. **Runbook vẫn có thể làm hỏng consumer, và không có rollback.** `docs/runbooks/analytics.md` §1–2: lựa chọn "dán từng statement vào Cloud SQL console" đứng cạnh "dùng admin ở lại" — `DEFINER = CURRENT_USER` bắt đúng người chạy; SQL console của Cloud có thể chạy dưới identity cá nhân (`sql-console:<email>`); khi người đó bị xoá/mất grant, mọi insert vào `events` thành `ACCESS_DENIED` → DLQ (chính lỗi A1 ngăn, chỉ muộn hơn). §2 bảo "kiểm consumer vẫn insert" nhưng không nói làm gì nếu không. Fix: bỏ lựa chọn console hoặc bắt `SELECT currentUser()` = `ikf_admin`; tốt hơn: definer riêng không đăng nhập được (`CREATE USER ikf_mv HOST NONE` + grant + `ALTER TABLE … MODIFY SQL SECURITY DEFINER DEFINER = ikf_mv`); thêm Rollback: `DROP VIEW ikf.funnel_hourly_mv` rồi replay DLQ.

### Minor
3. Tạo funnel mới giờ rơi vào tab Số liệu thay vì màn upload (`Funnels.jsx:25`) → `?tab=main`.
4. Số liệu giấu tiền khi khoảng không có sự kiện (`StatsTab.jsx:208-209`): funnel chỉ gia hạn hiện "Chưa có sự kiện" dù Dashboard/`ikf stats` có tiền.
5. Request giống nhau cùng trượt cache đều đập ClickHouse (`service.js:357-364`) → coalesce promise đang chạy.
6. Overview liệt kê mọi `funnel` trong ClickHouse kể cả không có trong Postgres (`service.js:374-384`) → link mở trang 404.
7. Postgres chưa có index cho `checkouts(created_at|completed_at)`, `outbox(topic, created_at)` — thêm migration khi volume lớn.
8. Series theo ngày bắt đầu giữa ngày UTC đầu tiên (`service.js:346-349`) — cột đầu trông như tụt.

## Deferred-list verdicts
Đồng ý cả 8 candidate của ledger (settings 64-bit; tie-break `v` số; "rơi" âm → "tăng"; `?tab=` lạ → Số liệu; README `--seed`; `y-max`; thu hẹp grant `ikf_reader` về `funnel_hourly`; chuyển bước kiểm consumer vào §1). Không nâng mục parked nào lên Important.

## Recommendations
Gộp I1 + candidate 1 thành một thay đổi client + runbook; I2 cùng commit docs. Spec nên bàn chi phí `uniqExact` cho khoảng dài ở lưu lượng thật (`uniqCombined64` cho overview, hoặc overview 90 ngày từ trạng thái ngày). Runbook §4 thêm kiểm lag `max(hour)` so với `now()`.

## Triage (ruling của controller)
Fix before merge: I1, I2, candidate 1–8, minors #3 #4 #5 #6. Defer: #7 (đã nằm "Theo sau" 4 của plan), #8 (cosmetic).

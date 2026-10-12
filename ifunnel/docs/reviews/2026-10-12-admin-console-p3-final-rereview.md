# Admin Console đợt 3 — Fix wave + scoped re-review

- Range `9c820e5..ae40d6b` (4 commit, đợt sửa duy nhất) + 2 commit theo sau (`6302d3e`, docs). Re-reviewer Claude Opus, 2026-10-12, có thăm dò thật trên `clickhouse-server:25.8` (container riêng). Final review: `2026-10-12-admin-console-p3-final-review.md`.
- Verdict: **F1–F17 đều ADDRESSED**; đợt sửa phát sinh một Important mới (N1) → controller sửa trực tiếp (`6302d3e`), kiểm bằng test fake 408 + suite container; hai quan sát ngoài phạm vi sửa docs (commit theo sau).

## Fix wave commits
| SHA | Mục | Thay đổi |
|---|---|---|
| aebecc8 | I1, cand. 1–2, 7(test), M3, M4, F6 | `clickhouse.js` gửi `max_execution_time` (= timeout client − 1 s, tối thiểu 1), `cancel_http_readonly_queries_on_client_close=1`, `output_format_json_quote_64bit_integers=0` trên mọi request kể cả retry (test ghim URL + ba mốc timeout); `service.js` coalesce load đang chạy theo khoá (lỗi không cache, joiner nhận cùng rejection), tie-break `v` theo số, overview bỏ slug chỉ có ở ClickHouse (`revenue.funnelSlugs`); test `funnel-hourly` thu hẹp `ikf_reader` về `funnel_hourly` (đọc `events` → ACCESS_DENIED) và ghim `ALTER TABLE … MODIFY SQL SECURITY DEFINER DEFINER = ikf_mv` (writer vẫn insert, view vẫn đầy). |
| b64f8c2 | cand. 3, 4, 6; M1; M2 | `StatsTab`: mốc tăng hiện "tăng x%" (prev=0 vẫn "—"); thẻ "Chưa có sự kiện" chỉ khi sessions=0 ∧ paid=0 ∧ không có doanh thu; `FunnelDetail`: `?tab=` lạ hoặc `prices` không có grant → Số liệu (`aria-selected` đúng, không redirect); `Funnels.jsx` tạo funnel → `?tab=main`; `LineChart` nhãn `y-max` = `fmtNum(max thật)` (0 cho series toàn 0). |
| 319a175 | cand. 5 | README/comment `--seed`: "every funnel in `funnels`". |
| ae40d6b | I2, cand. 7–8, I1 (docs), rec. | Runbook: bỏ lựa chọn SQL console, bắt `SELECT currentUser()` = `ikf_admin`; definer riêng `ikf_mv HOST NONE` + `SHOW CREATE` (verified 25.8); bước kiểm consumer + **Rollback** (`DROP VIEW` → `ikf events replay-dlq`) chuyển vào §1; reader chỉ `SELECT ON ikf.funnel_hourly`, không `readonly=1` (thăm dò: `readonly=1` → 500/164 → `unavailable`, không phải `client` như brief); §4 kiểm lag `max(hour)`. |
| 6302d3e | N1 | ClickHouse trả **HTTP 408** (code 159) khi chạm `max_execution_time` → client xếp `unavailable`, retry một lần; test fake 408; runbook §5 nêu 408. |
| 2f22148 | ngoài phạm vi | §4 `now('UTC')`; §5: thiếu grant hiện `unavailable`/500 ACCESS_DENIED, `auth` chỉ 401/403. |

Totals sau đợt sửa: core-api 554 (59 file), admin SPA 132 (15 file), cli 159, `demo:test` 124 (22 file, e2e đợt 3 ≈ 5 s), build OK, Terraform 13/6/13, staging + prod validate OK, SDK 8154 B gzip không đổi, tree sạch, không còn listener.

## Parked (ruling trong ledger)
- Postgres chưa có index cho truy vấn tiền/overview (plan "Theo sau" 4); series theo ngày bắt đầu giữa ngày UTC đầu (cosmetic); chi phí `uniqExact` khoảng dài (spec #5).
- `max_execution_time` sàn 1 s có thể vượt timeout client khi `timeoutMs < 2000` (chỉ test).
- Các minor per-task chưa sửa: `sqlStatements` lặp giữa test helper và demo (plan-mandated), `v=0` coi như không lọc, a11y SVG, select version lệch sau lỗi stats, DB e2e không drop, `Number(--days)` nhận `1e1`, `query` helper bị param che, …
- Chưa kiểm trên ClickHouse Cloud: mã 408/403/516/500-164, `ALTER … MODIFY SQL SECURITY`, `--multiquery`; Cloudflare `starts_with`.

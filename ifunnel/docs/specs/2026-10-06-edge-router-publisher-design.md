# Edge Router + Publisher — Design Spec

> Subsystem số 2 trong [master plan](../plans/2026-10-05-ikame-funnel-platform.md) §10. Spec này là đầu vào cho plan TDD `…-edge-router-publisher.md`.

**Mục tiêu:** đưa funnel HTML có sẵn (`funnel/funnel-development/**/demo.html`) lên domain thật để chạy ads. Mỗi lần publish tạo một version bất biến có link preview. Route (host + path) được gắn và rollback độc lập với publish. Funnel phục vụ hoàn toàn từ Cloudflare edge, không phụ thuộc core khi chạy.

**Điều kiện xong:** một funnel thật của app pilot chạy trên domain thật; rollback thử trên staging có hiệu lực trong ≤ 90 giây; k6 400 req/s đạt p95 TTFB < 200ms, 0 lỗi 5xx.

## Quyết định đã chốt (2026-10-06)

| # | Hạng mục | Lựa chọn |
|---|---|---|
| 1 | Phạm vi | Edge router + publisher. Chưa có SDK, checkout, A/B, admin |
| 2 | Cách publish | CLI `ikf` gọi Publisher API trên core (ECS). Admin sau này dùng lại cùng API |
| 3 | Media | Ảnh/video nằm trên **thư viện S3 dùng chung do team khác dựng**. Funnel tham chiếu URL tuyệt đối. Publisher chỉ kiểm tra URL thuộc `MEDIA_ORIGINS`, không xử lý file |
| 4 | URL funnel | Route theo **host + path prefix**, path mặc định `/`. Một domain chứa nhiều funnel, một funnel gắn được vào nhiều domain |
| 5 | Domain | Mỗi domain là một zone trong Cloudflare account iKame, khai báo bằng Terraform. Worker chỉ đọc `host` từ KV nên sau này chuyển sang Cloudflare for SaaS không phải đổi code |
| 6 | Luồng lên traffic | Tách hai bước: `publish` tạo version + preview, `route set` mới đưa lên traffic thật |
| 7 | Nơi giữ route | Postgres là nguồn gốc (có audit), KV là bản chiếu cho Worker đọc. Worker không bao giờ gọi core |

## 1. Thành phần

Tất cả nằm trong repo `ikf-platform`.

| Unit | Chạy ở | Trách nhiệm | Phụ thuộc |
|---|---|---|---|
| `packages/cli` (`ikf`) | Máy người làm funnel | Đọc folder funnel, chạy lint + smoke local, gọi Publisher API, quản lý route | Publisher API, `lint_funnel.py`, `smoke_demo.mjs` |
| `services/core-api` module `publisher` | ECS Fargate | Validate bundle, ghi R2, lưu version, quản lý route, chiếu route sang KV | Postgres, R2 (S3 API), KV (REST API) |
| `workers/edge-router` | Cloudflare Worker | `host + path` → KV → R2/Cache → HTML, chèn `__IKF` | KV, R2, Cache API |
| `packages/route-match` | Thư viện dùng chung | So khớp path prefix. Worker và core dùng cùng code nên kết quả luôn giống nhau | Không |

## 2. Dữ liệu

### Postgres

```sql
funnels      (id, slug UNIQUE, app, created_by, created_at)
versions     (id, funnel_id, n, sha256, r2_key, size, lint_report jsonb,
              created_by, created_at, UNIQUE (funnel_id, n))
domains      (host PK, status TEXT CHECK (status IN ('active','disabled')))
routes       (host FK domains, path_prefix, version_id FK versions,
              updated_by, updated_at, PRIMARY KEY (host, path_prefix))
route_events (id, host, path_prefix, from_version, to_version, actor, at)
host_revs    (host PK, rev BIGINT, kv_synced_rev BIGINT)
```

- `domains` được đồng bộ từ Terraform output. Không tạo domain qua API.
- `host_revs.rev` tăng mỗi lần route của host thay đổi. `kv_synced_rev` là rev đã ghi thành công lên KV. Hai số lệch nhau nghĩa là KV đang chậm.
- `path_prefix` được chuẩn hóa khi ghi: bắt đầu bằng `/`, không có `/` cuối (trừ chính `/`), lowercase, đã decode percent-encoding.

### R2

`bundles/<slug>/v<n>/index.html`. Object đã ghi thì không bao giờ bị ghi đè hay xóa ở MVP.

### KV

Một key cho mỗi host, là bản chiếu đầy đủ từ DB:

```json
route:try.aivideo.app = {
  "rev": 17,
  "routes": [
    {"prefix": "/tiktok-ugc", "bundle": "bundles/aivideo/v3/index.html", "funnel": "aivideo", "v": 3},
    {"prefix": "/",           "bundle": "bundles/aivideo/v2/index.html", "funnel": "aivideo", "v": 2}
  ]
}
```

Route sắp theo độ dài prefix giảm dần.

### Auth

- CLI dùng token cá nhân do core cấp, gửi qua `Authorization: Bearer`. Token lưu ở `~/.config/ikf/credentials`.
- Hai quyền: `publisher` (tạo version) và `router` (đổi route, rollback). Quyền đổi route tách riêng vì nó ảnh hưởng trực tiếp tới traffic thật.

## 3. Luồng publish

```
ikf publish <folder> --slug <slug>
```

**CLI (local):**
1. Đọc `<folder>/demo.html`. Nếu HTML còn tham chiếu `img/...` tương đối thì dừng, liệt kê các dòng vi phạm. Người làm funnel tự đổi sang URL thư viện media trước.
2. Chạy `lint_funnel.py` và `smoke_demo.mjs`. Một trong hai fail thì dừng.
3. `POST /v1/funnels/<slug>/versions` với body HTML, sha256, báo cáo lint/smoke. Header `Idempotency-Key: <sha256>`.

**Core (chốt chặn thật, không tin kết quả CLI):**

| Kiểm tra | Lỗi |
|---|---|
| Kích thước ≤ 1MB | `413 bundle_too_large` |
| Mọi `src`, `href`, `url()`, `poster`, `srcset` trỏ tới media là `data:`, thuộc `MEDIA_ORIGINS`, hoặc thuộc allowlist (`fonts.googleapis.com`, `fonts.gstatic.com`) | `422 media_origin_not_allowed` + danh sách URL |
| Không có `<script src>` ngoài allowlist script (MVP: rỗng) | `422 script_origin_not_allowed` |
| `CONFIG.funnel` trong HTML bằng `slug` | `422 slug_mismatch` |
| sha256 trùng version mới nhất của slug | `200`, trả lại version đó, không tạo mới |

Funnel slug chưa tồn tại thì được tạo luôn ở lần publish đầu.

Thứ tự ghi: **R2 trước, rồi mới ghi row `versions`**. R2 xong mà DB lỗi thì chỉ để lại object mồ côi, vô hại. Làm ngược lại có thể tạo version trỏ tới object không tồn tại.

Kết quả: `aivideo@v3` và `https://preview.<zone>/aivideo/v3`.

## 4. Luồng route

```
ikf route set <host><prefix> <slug>@v<n> [--yes]
ikf route rollback <host><prefix>
ikf route rm <host><prefix>
ikf route ls <host>
ikf route sync <host>
```

- `set`, `rollback`, `rm` chạy trong một transaction: thay đổi `routes`, ghi `route_events`, tăng `host_revs.rev`.
- Commit xong thì dựng lại **toàn bộ** JSON của host từ DB và ghi KV, rồi cập nhật `kv_synced_rev`. Không vá từng phần.
- `rollback` lấy `from_version` của `route_events` gần nhất cho route đó.
- Trỏ route sang slug khác slug hiện tại là hợp lệ (đổi funnel trên một link ads), nhưng CLI yêu cầu `--yes`.
- Output của `set` và `rollback` ghi rõ: thay đổi có hiệu lực toàn cầu trong tối đa ~90 giây.

## 5. Luồng request ở edge

```
GET https://try.aivideo.app/tiktok-ugc?fbclid=...&utm_source=fb
```

1. Đọc `KV route:<host>` với `cacheTtl: 30`.
2. `route-match`: prefix dài nhất, khớp theo ranh giới segment (`/v1` khớp `/v1` và `/v1/x`, không khớp `/v10`). Path được chuẩn hóa như §2 trước khi so khớp. Prefix `/` khớp mọi path.
3. Lấy bundle từ Cache API theo khóa `r2_key`. Trượt cache thì đọc R2 rồi ghi vào cache. Query string không nằm trong khóa nhưng vẫn ở trên URL, để funnel tự đọc UTM/click id như hiện tại.
4. `HTMLRewriter` chèn vào đầu `<head>`:
   ```html
   <script>window.__IKF={funnel:"aivideo",v:3,rev:17}</script>
   ```
   Spec Runtime SDK sẽ thêm `<script src>` tại cùng vị trí.
5. Header:
   - `Content-Type: text/html; charset=utf-8`
   - `Cache-Control: no-cache`
   - `x-ikf: aivideo@3; rev=17`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `X-Content-Type-Options: nosniff`
   - Chưa đặt CSP. Nguồn script đã được kiểm soát ở bước publish.

Chỉ phục vụ `GET` và `HEAD`. Method khác trả `405`.

**Preview:** `preview.<zone>/<slug>/v<n>` (`<zone>` là zone platform của Task 9 plan infra, ví dụ `ikf-staging.example`) đọc thẳng `bundles/<slug>/v<n>/index.html`, không qua KV. Thêm `X-Robots-Tag: noindex` và `__IKF.preview=true` để SDK sau này không bắn Pixel.

**Thời gian thay đổi route có hiệu lực:** KV lan toàn cầu ≤ 60s + `cacheTtl` 30s, nên trường hợp xấu nhất khoảng 90 giây.

## 6. Xử lý lỗi

### Edge

| Tình huống | Xử lý |
|---|---|
| Host không có trong KV | `404`, trang trắng tối giản |
| Không prefix nào khớp | `404` như trên |
| KV lỗi hoặc timeout | Dùng bản route đọc gần nhất, giữ trong bộ nhớ isolate tối đa 10 phút. Không có bản nào thì `503` + `Retry-After: 5` |
| R2 thiếu object | `502`, log `bundle_missing` kèm key |
| `HTMLRewriter` lỗi | Trả HTML gốc không chèn `__IKF` |

Log có cấu trúc qua Workers Logs: `host`, `path`, `funnel`, `v`, `rev`, `status`, `error`. Alarm khi 5xx > 1% trong 5 phút, dùng chung kênh SNS với plan infra.

### Core và CLI

| Tình huống | Xử lý |
|---|---|
| Validate fail | `4xx` + mã lỗi + danh sách vi phạm cụ thể. CLI in ra dễ đọc |
| Ghi R2 lỗi | `503`, không ghi DB. CLI retry 3 lần với backoff |
| DB commit xong, ghi KV lỗi | `200` kèm `kv_sync: "pending"`. CLI cảnh báo route chưa lên edge. Job nền mỗi phút chiếu lại các host có `kv_synced_rev < rev` |
| Rollback khi không có lịch sử | `409 no_previous_version` |
| Gắn route vào domain `disabled` | `409 domain_disabled`. Route cũ của domain đó vẫn chạy đến khi bị gỡ bằng tay |
| Thiếu quyền | `403 forbidden` |

## 7. Kiểm thử

| Tầng | Nội dung | Công cụ |
|---|---|---|
| Unit `route-match` | Prefix dài nhất, ranh giới segment, `/` cuối, prefix `/`, percent-encoding, chữ hoa. Một bộ case dùng chung cho Worker và core | Vitest |
| Unit validator | Mỗi luật ở §3 có case pass và fail. Chạy thêm trên toàn bộ `demo.html` hiện có (sau khi đổi link media) để chắc không chặn nhầm funnel thật | Vitest |
| Integration core | Publish → R2 + DB, idempotency theo sha256, `route set` → KV khớp DB, rollback, job đồng bộ lại khi ghi KV lỗi | Vitest + Postgres (Testcontainers) + R2/KV giả |
| Integration Worker | Host/prefix → đúng bundle, query không làm lệch cache, chèn `__IKF`, header, các lỗi ở §6 | Vitest + `@cloudflare/vitest-pool-workers` |
| E2E staging | `publish` → preview → `route set` → mở bằng iOS Safari, Android Chrome, webview FB/IG/TikTok → rollback → xác nhận đổi bản trong ≤ 90 giây | Playwright + máy thật |
| Tải | 400 req/s (10× peak Tier A), p95 TTFB < 200ms, 0 lỗi 5xx | k6 |

## 8. Ngoài phạm vi

- Runtime SDK, `session_id`, Pixel, event collector: spec `runtime-sdk-collector`.
- A/B split ở edge: P2.
- Checkout Paddle. `checkoutNav` trong `demo.html` hiện đưa `email` lên query string của URL checkout, trái ràng buộc "không có PII trên URL". Spec billing phải sửa chỗ này.
- Admin UI: spec `admin-console`, dùng lại Publisher API.
- Thư viện media S3: team khác dựng, spec này chỉ nhận `MEDIA_ORIGINS`.
- Xóa version cũ, dọn object R2 mồ côi.
- Geo/locale routing: P2.

## 9. Phụ thuộc vào plan infra

Cần các task sau của [plan infra](../plans/2026-10-05-ikf-infra-aws.md) xong trước khi chạy integration trên staging: Task 3 (RDS), Task 7–8 (core-api trên ECS), Task 9 (Cloudflare edge: zone, R2, KV, Worker route), Task 11 (alarm).

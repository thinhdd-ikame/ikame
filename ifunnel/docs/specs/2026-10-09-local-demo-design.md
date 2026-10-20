# Local Demo — Design Spec

> Tooling cho repo `thinhdd-ikame/ikf-platform`. Không thay đổi code production. Xây trên PR #1 (Edge Router + Publisher) và PR #2 (Runtime SDK + Collector).

**Mục tiêu:** chạy `npm run demo` một lệnh, trong khoảng 1 phút có funnel thật chạy trên máy dev. Mở bằng trình duyệt hoặc bằng điện thoại cùng wifi, bấm qua các màn, thấy event về ClickHouse. Không cần tài khoản AWS, Cloudflare, Paddle hay Meta. Dùng để show cho team và để dev thử end-to-end trong lúc chờ Task 0.

**Điều kiện xong:**
- Trên máy đã có Colima: `npm run demo` in ra URL funnel. Mở URL thì thấy funnel có `window.__IKF` và script SDK. Bấm qua vài màn, rồi `npm run demo:events` hiện các event `page_load`, `funnel_start`, `screen_view`… của đúng funnel.
- Smoke test `npm run demo:test` pass.
- Không file production nào trong `services/`, `workers/`, `packages/` bị sửa hành vi. Chỉ được export thêm nếu thật cần, và phải ghi lý do.

## Quyết định (2026-10-09)

| # | Hạng mục | Lựa chọn |
|---|---|---|
| 1 | Hình thức | Chạy local, một process Node điều phối, cộng 2 container Docker (Colima) |
| 2 | Cloudflare | Miniflare (API lập trình) chạy `edge-router` và `event-consumer` với KV, R2, Queue giả lập, nối producer `/_ikf/c` với consumer |
| 3 | core-api | Dùng `buildApp()` của core-api trong process demo, với `pool` Postgres container, và adapter `store`/`kv` ghi thẳng vào binding R2/KV của Miniflare |
| 4 | Dữ liệu | `postgres:17-alpine` và `clickhouse/clickhouse-server` qua `docker compose` (`demo/compose.yaml`), volume có tên để giữ dữ liệu giữa các lần chạy |
| 5 | Media | Server tĩnh local phục vụ thư mục `img/` của funnel. Demo đổi giá trị map `IMG` và các literal `img/…` sang URL server đó, và đặt `mediaOrigins` tương ứng |
| 6 | Funnel | Mặc định 3 funnel thật từ `IKF_FUNNELS_DIR` (mặc định `/Users/daothinh/ikame/funnel/funnel-development`) có `CONFIG.funnel`. Chọn bằng `--funnels a,b,c` |
| 7 | Checkout | Ngoài phạm vi lần này (Billing đang code ở nhánh khác). Thiết kế chừa chỗ để sau thêm Paddle giả |

## 1. Thành phần (tất cả trong `demo/`)

| File | Trách nhiệm |
|---|---|
| `demo/compose.yaml` | Postgres 17 (cổng 54329) và ClickHouse (HTTP 18123), volume có tên, healthcheck |
| `demo/run.mjs` | Entry `npm run demo`: parse cờ, `docker compose up -d --wait`, chạy migration và DDL, khởi động Miniflare + core + media server, publish và gắn route cho các funnel, in thông tin, dừng gọn khi Ctrl-C |
| `demo/lib/stack.mjs` | `startStack(opts)` → `{ urls, adminToken, stop() }`: dùng chung cho `run.mjs` và smoke test |
| `demo/lib/miniflare.mjs` | Cấu hình Miniflare cho 2 Worker (build bằng esbuild giống wrangler; SDK build trước bằng `packages/sdk/scripts/build.mjs`), binding `ROUTES`, `BUNDLES`, `EVENTS` (producer) nối consumer, `STATE`, vars `SDK_ENABLED="true"`, `PREVIEW_HOST`, `IP_SALT`, `CLICKHOUSE_URL/USER/PASSWORD`; `cf.country` lấy từ `--country` (mặc định `VN`) |
| `demo/lib/adapters.mjs` | `miniflareStore(r2)` và `miniflareKv(kv)`, cùng interface với `createR2Store`/`createKvClient` của core (`put(key, body, {sha256})` / `put(key, value)`) |
| `demo/lib/media.mjs` | Server tĩnh (cổng 8790) cho `img/` của từng funnel; `rewriteMedia(html, slug, base)` đổi map `IMG` và literal `img/…` |
| `demo/lib/funnels.mjs` | Chọn funnel, đọc `demo.html`, rewrite, publish qua `POST /v1/funnels/:slug/versions`, đăng ký domain `localhost` và IP LAN, gắn route `/<slug>` |
| `demo/events.mjs` | `npm run demo:events`: truy vấn ClickHouse, in 30 event gần nhất và số event theo `funnel`/`name`/`screen` |
| `demo/test/demo.test.mjs` | `npm run demo:test`: khởi động stack, GET funnel (có `__IKF` và SDK), POST một event hợp lệ tới `/_ikf/c` (204), chờ tối đa 15 giây đến khi dòng đó có trong ClickHouse, rồi dừng |
| `demo/README.md` | Cách chạy, các cờ, xử lý sự cố |

## 2. Hành vi

- **Host:** Miniflare lắng nghe `0.0.0.0:8787`. Domain được đăng ký là `localhost` và IP LAN của máy (tự dò; tắt bằng `--no-lan`). Preview host là `preview.localhost` (Chrome tự trỏ `*.localhost` về 127.0.0.1).
- **core-api:** cổng 8080, chỉ phục vụ API, không có `/v1` từ bên ngoài ngoài máy. Token admin được tạo bằng `ensureToken` với giá trị cố định cho demo (`ikf_demo_admin`) và in ra để dùng với `IKF_API=http://localhost:8080 IKF_TOKEN=ikf_demo_admin ikf route ls localhost`.
- **Pixel:** mặc định không có. `--pixel <id>` gọi `PUT /v1/funnels/:slug` cho các funnel. Trên trình duyệt, SDK vẫn tải `fbevents.js` thật, nên README ghi rõ: có mạng thì request đi tới Meta (dùng Pixel test). Demo không chặn mạng của trình duyệt.
- **Consent:** `--country DE` làm `__IKF.country = 'DE'` → banner hiện ra.
- **Dừng:** Ctrl-C dừng Miniflare, core, media server và đóng pool. Container vẫn chạy để lần sau nhanh. `npm run demo:down` dừng container, `--reset` xóa volume.
- **Lỗi:** Docker hoặc Colima không chạy → thông báo rõ "chạy `colima start`". Thiếu thư mục funnel → thông báo rõ. Cổng bị chiếm → báo cổng nào.

## 3. Kiểm thử

- `demo/test/demo.test.mjs` (Vitest, timeout 120 giây) như mô tả ở §1. Chỉ chạy local vì cần Docker, không thêm vào CI.
- Unit cho `rewriteMedia` (map `IMG`, literal `img/`, giữ nguyên `data:` và URL tuyệt đối) và cho 2 adapter (gọi đúng binding).

## 4. Ngoài phạm vi

- Checkout và Paddle giả (thêm sau khi nhánh billing merge).
- Demo public trên internet.
- Admin UI hay dashboard: `demo:events` là đủ cho lần này.

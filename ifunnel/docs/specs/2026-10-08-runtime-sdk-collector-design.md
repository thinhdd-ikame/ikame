# Runtime SDK + Collector — Design Spec

> Subsystem số 3 trong [master plan](../plans/2026-10-05-ikame-funnel-platform.md) §10. Spec này là đầu vào cho plan TDD `…-runtime-sdk-collector.md`. Xây trên [Edge Router + Publisher](2026-10-06-edge-router-publisher-design.md) (repo `thinhdd-ikame/ikf-platform`).

**Mục tiêu:** mọi funnel đang chạy trên edge gửi được event hành vi về ClickHouse để đo drop-off theo màn và CVR, và bắn Meta Pixel (`PageView`, `Lead`, `InitiateCheckout`) để chạy ads. HTML funnel không phải sửa. Đồng thời lưu click id và UTM, để spec checkout gắn attribution.

**Điều kiện xong:**
- Trên staging, ít nhất 99% event funnel phát ra có trong ClickHouse. Cách đo: so số event Playwright đếm ở trình duyệt với số dòng trong ClickHouse.
- ClickHouse không có dòng nào chứa email.
- Meta Test Events thấy đủ 3 event chuẩn, mỗi event có `eventID`.
- p95 TTFB của trang funnel không tăng quá 20ms so với khi chưa có SDK.

## Quyết định đã chốt (2026-10-08)

| # | Hạng mục | Lựa chọn |
|---|---|---|
| 1 | Phạm vi | Analytics vào ClickHouse, cộng Meta Pixel phía trình duyệt (`PageView`, `Lead`, `InitiateCheckout`), cộng lưu click id và UTM. **Không** làm `Purchase` hay CAPI |
| 2 | Câu trả lời của user | Lưu vào ClickHouse sau khi lọc PII ở cả SDK lẫn collector. Pixel chỉ nhận tham số chuẩn, không có câu trả lời |
| 3 | Consent | Theo quốc gia. EEA, UK và CH hiện banner, Pixel và cookie quảng cáo chỉ bật sau khi user đồng ý. Nước khác bật luôn. Analytics first-party luôn chạy, chỉ dùng `sid` |
| 4 | Pixel ID | Cấu hình theo funnel, lưu ở core (`funnels.pixel_id`), đưa vào KV rồi vào `__IKF.pixel` |
| 5 | Kiến trúc | Cùng domain với funnel: `/_ikf/sdk.<hash>.js` và `POST /_ikf/c` trên Worker `edge-router`, đẩy vào Cloudflare Queue, rồi Worker consumer insert vào ClickHouse |

## Hiện trạng funnel (khảo sát 69 `demo.html`, 2026-10-08)

- 60 funnel phát event bằng `window.dispatchEvent(new CustomEvent('ikfunnel:<name>', {detail}))`. 37 funnel có dùng `window.dataLayer`, và 8 funnel đẩy vào `window.ikfEvents`.
- 53 funnel có bộ event chuẩn: `funnel_start`, `screen_view`, `answer`, `lead`, `paywall_view`, `plan_select`, `checkout_click`, `purchase_complete`.
- `detail` thường kèm `data: snapshot()`, tức trạng thái câu trả lời. Ở vài funnel, phần này có email hoặc ngày sinh.

## 1. Thành phần

Tất cả nằm trong repo `ikf-platform`.

| Unit | Chạy ở | Trách nhiệm |
|---|---|---|
| `packages/event-schema` | Dùng chung | Kiểm tra event, lọc PII, làm phẳng `props`. SDK và collector chạy cùng đoạn code này |
| `packages/sdk` → `ikf.js` | Trình duyệt | Bắt event, gom batch và gửi, attribution, consent, Pixel |
| `workers/edge-router` (sửa) | Worker | `GET /_ikf/sdk.<hash>.js`, `POST /_ikf/c`, chèn `<script src>`, thêm `country` và `pixel` vào `__IKF` |
| `workers/event-consumer` | Worker (queue consumer) | Nhận batch từ Queue, insert vào ClickHouse, retry, DLQ, alarm |
| `services/core-api` (sửa) | ECS | Migration `funnels.pixel_id`, `PUT /v1/funnels/:slug`, đưa `pixel` vào bản ghi KV |
| `packages/cli` (sửa) | Local | `ikf funnel set <slug> --pixel <id>` / `--no-pixel`, `ikf events replay-dlq` |
| `clickhouse/` | ClickHouse Cloud | File SQL tạo bảng |
| `infra/` (sửa) | Terraform | Rate limit `/_ikf/c`, consumer binding, secret của Worker, IAM user publish SNS |

## 2. Dữ liệu

### Event SDK gửi lên (`POST /_ikf/c`)

Body là `{"events": [...]}`, tối đa 50 event và 64KB.

| Field | Kiểu | Ghi chú |
|---|---|---|
| `id` | ULID | event id. Dùng làm `eventID` của Pixel |
| `sid` | ULID | session, lưu ở `sessionStorage` |
| `aid` | ULID hoặc null | anonymous id, lưu ở `localStorage`, sống 1 năm. Chỉ có khi được phép theo consent |
| `t` | số (ms) | thời điểm ở client |
| `name` | `^[a-z0-9_]{1,40}$` | tên event, bỏ tiền tố `ikfunnel:` |
| `funnel`, `v`, `rev` | | lấy từ `__IKF` |
| `host`, `path` | | `location.hostname`, `location.pathname`, không có query |
| `screen` | số hoặc null | từ `detail.screen`, `detail.index` hoặc `detail.data.screen` |
| `props` | object string→string | `detail` sau khi lọc PII và làm phẳng |
| `attr` | object | `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `fbclid`, `ttclid`, `gclid` (lượt đầu trong session thắng) |

### Collector thêm vào trước khi đẩy Queue

`received_at` (ms phía server), `country` (`request.cf.country`), `ua_class` (`mobile` / `desktop` / `inapp_fb` / `inapp_ig` / `inapp_tiktok` / `other`), `ip_hash` (= `sha256(IP_SALT + ngày UTC + IP)`, không bao giờ lưu IP thô).

### Bảng ClickHouse

```sql
CREATE TABLE events (
  id String, sid String, aid Nullable(String),
  t DateTime64(3), received_at DateTime64(3),
  name LowCardinality(String),
  funnel LowCardinality(String), v UInt32, rev UInt64,
  host LowCardinality(String), path String, screen Nullable(Int32),
  props Map(String, String), attr Map(String, String),
  country LowCardinality(String), ua_class LowCardinality(String), ip_hash String
) ENGINE = ReplacingMergeTree(received_at)
PARTITION BY toYYYYMM(received_at)
ORDER BY (funnel, toDate(received_at), sid, id)
TTL toDateTime(received_at) + INTERVAL 13 MONTH;
```

Một event có thể được ghi hai lần (do retry hoặc SDK gửi lại). Khi merge, ClickHouse gộp các dòng trùng `id`. Báo cáo cần đếm chính xác thì dùng `FINAL` hoặc `uniqExact(id)`.

### Core

Migration `002_funnel_pixel.sql`: thêm cột `funnels.pixel_id TEXT NULL CHECK (pixel_id ~ '^[0-9]{6,20}$')`. Mỗi route trong bản ghi KV có thêm field `"pixel": "<id>" | null`.

### `__IKF` (Worker chèn vào trang)

```js
window.__IKF = { funnel, v, rev, country: "VN", pixel: "123..." | null, preview?: true }
```

## 3. SDK `ikf.js`

**Cách nạp:** Worker chèn `<script src="/_ikf/sdk.<hash>.js"></script>` ngay sau script `__IKF`, không có `async`, để SDK chạy trước script của funnel. Kích thước ≤ 8KB gzip.

**Bắt event:**
- Bọc `window.dispatchEvent`. Event có `type` bắt đầu bằng `ikfunnel:` sẽ được copy ra, sau đó luôn gọi hàm gốc.
- Theo dõi `window.dataLayer.push` cho object có `event`, và `window.ikfEvents.push`.
- Chống trùng: cùng `name` và cùng `detail` đã serialize trong vòng 50ms thì chỉ tính một lần.
- Tự phát `page_load` khi SDK chạy.

**Lọc PII** (`event-schema.scrub`):
- Bỏ key khớp `/(e-?mail|phone|tel|name|dob|birth|address|password|card)/i`, xét ở mọi cấp lồng nhau.
- Bỏ giá trị là email, là chuỗi có từ 7 chữ số trở lên (bỏ qua dấu cách, `+`, `-`, `(`, `)`), hoặc khớp `^\d{4}-\d{2}-\d{2}`.
- Làm phẳng thành `props`. Key lồng nối bằng `.`. Mảng chuyển thành chuỗi nối bằng `|`. Mỗi giá trị tối đa 200 ký tự, tối đa 40 key. Các key `screen`, `index`, `funnel`, `event` không đưa vào `props`.

**Gom và gửi:**
- Gửi khi hàng đợi đủ 20 event, sau 5 giây, khi `visibilitychange` sang `hidden`, và khi `pagehide`.
- `navigator.sendBeacon('/_ikf/c', JSON)`. Nếu không có hoặc trả `false` thì dùng `fetch(..., {method:'POST', keepalive:true})`.
- Gửi lỗi thì giữ tối đa 200 event trong `sessionStorage` (hoặc bộ nhớ) và thử lại ở lần flush sau.
- Mỗi session tối đa 2000 event, vượt quá thì ngừng gửi.

**Attribution:**
- Khi tải trang, đọc `utm_*`, `fbclid`, `ttclid`, `gclid` từ URL và lưu vào `sessionStorage`. Lượt đầu trong session thắng.
- Nếu được phép quảng cáo:
  - có `fbclid` thì đặt cookie `_fbc=fb.1.<ms>.<fbclid>`;
  - chưa có cookie `_fbp` thì đặt `_fbp=fb.1.<ms>.<rand10>`.

  Cả hai cookie: `Path=/`, `Max-Age=7776000`, `SameSite=Lax`, có `Secure`.
- `window.IKF.attribution()` trả `{ ...attr, fbc, fbp, sid, aid }` cho spec checkout.

**Meta Pixel:**
- Chỉ nạp `https://connect.facebook.net/en_US/fbevents.js` khi có `__IKF.pixel`, không phải preview, và được phép quảng cáo.
- Bảng chuyển đổi:

  | Event funnel | Event Meta | Tham số gửi kèm |
  |---|---|---|
  | `page_load` | `PageView` | không có |
  | `lead` | `Lead` | không có |
  | `checkout_click` | `InitiateCheckout` | `value` và `currency` nếu `detail` có giá trị số hợp lệ |

- Mọi lần bắn dùng `{eventID: event.id}`. Không gửi tham số nào khác, không gửi câu trả lời.

**Consent:**
- `__IKF.country` thuộc EEA (27 nước EU + IS, LI, NO), GB hoặc CH: hiện banner ở cuối màn hình, trong shadow DOM, với 2 nút "Accept" và "Decline". Lựa chọn lưu `ikf_consent=granted|denied` ở `localStorage`.
- Được phép quảng cáo khi: không thuộc vùng trên, hoặc đã `granted`.
- Chưa được phép thì: không có Pixel, không có `_fbc`/`_fbp`, `aid` là null. Analytics vẫn gửi, chỉ có `sid`.

**Không bao giờ làm hỏng funnel:** mọi hook đều bọc trong `try/catch`, và `dispatchEvent` gốc luôn được gọi.

## 4. Collector `POST /_ikf/c` (trong `edge-router`)

1. Method phải là `POST`. `content-type` phải là `application/json` hoặc `text/plain`. Body tối đa 64KB, nếu vượt thì trả `413`.
2. `Origin` (hoặc host của `Referer` nếu không có `Origin`) phải bằng host của request, nếu không thì `403`.
3. Parse JSON lỗi hoặc `events` không phải mảng có 1 đến 50 phần tử thì trả `400`.
4. Với từng event, gọi `event-schema.validate`: ULID hợp lệ, `name` đúng regex, `funnel` đúng slug, và `|t - now| ≤ 24h`. Event sai bị bỏ riêng.
5. Gọi `event-schema.scrub` lần nữa, rồi thêm `received_at`, `country`, `ua_class`, `ip_hash`.
6. `env.EVENTS.sendBatch(validEvents)`, rồi trả `204`. Nếu Queue ném lỗi thì trả `503` và ghi log `queue_unavailable`.

Rate limit theo IP: rule Cloudflare cho `/_ikf/c`, mặc định 30 request mỗi 10 giây.

`GET /_ikf/sdk.<hash>.js`: trả nội dung SDK được build vào Worker, `content-type: text/javascript`, `cache-control: public, max-age=31536000, immutable`. Hash không khớp thì `404`.

## 5. Consumer `workers/event-consumer`

- Queue `ikf-events-<env>`: `max_batch_size = 100`, `max_batch_timeout = 10`, `max_retries = 5`, `dead_letter_queue = ikf-events-<env>-dlq`.
- Mỗi batch là một lệnh `POST <CLICKHOUSE_URL>/?query=INSERT INTO events FORMAT JSONEachRow&async_insert=1&wait_for_async_insert=1` qua HTTPS, xác thực Basic. Timeout 15 giây.
  - **2xx:** `batch.ackAll()`.
  - **5xx, lỗi mạng hoặc timeout:** `batch.retryAll({ delaySeconds: 2^attempt })`.
  - **4xx:** chia đôi batch và insert lại từng nửa cho tới khi tìm ra event hỏng. Event hỏng thì `ack` và ghi log `{error:'row_rejected', id, reason}`.
- Message vào DLQ, hoặc insert lỗi 3 lần liên tiếp: publish một thông báo lên topic SNS alarm của plan infra qua AWS SigV4 (IAM user chỉ có quyền `sns:Publish`). Mỗi loại thông báo gửi tối đa 1 lần mỗi 15 phút.
- `ikf events replay-dlq --env <env>` kéo message từ DLQ (Cloudflare Queues pull API) và đẩy lại vào queue chính.

## 6. Core và CLI

- `PUT /v1/funnels/:slug` (quyền `router`), body `{ "pixel_id": "<digits>" | null }`:
  - `404 funnel_not_found` nếu chưa có funnel;
  - `400` nếu `pixel_id` sai định dạng.
  - Sau khi commit, gọi `syncHost` cho mọi host có route trỏ vào một version của funnel đó. KV lỗi thì trả `kv_sync: "pending"`, job resync sẽ chiếu lại.
- `ikf funnel set <slug> --pixel <id>` / `--no-pixel`, in ra số host đã đồng bộ.

## 7. Xử lý lỗi

| Tình huống | Xử lý |
|---|---|
| SDK ném lỗi | Bọc trong `try/catch`, funnel vẫn chạy |
| SDK tải không được (404 hoặc adblock) | Funnel vẫn chạy, mất analytics và Pixel |
| Storage bị chặn | Lưu trong bộ nhớ |
| Collector `503` hoặc mất mạng | SDK giữ tối đa 200 event, thử lại sau, quá thì bỏ event cũ nhất |
| Body sai | `400`, SDK không retry |
| Queue lỗi | `503`, có log |
| ClickHouse ngừng | Consumer retry 5 lần, rồi DLQ, rồi alarm SNS. Khôi phục bằng `ikf events replay-dlq` |
| Một dòng bị ClickHouse từ chối | Chia đôi batch để tìm, `ack` dòng hỏng, ghi log |
| Pixel lỗi | Không ảnh hưởng gì khác |
| User chưa trả lời consent | Không gửi gì cho Meta, analytics chỉ có `sid` |

## 8. Kiểm thử

| Tầng | Nội dung | Công cụ |
|---|---|---|
| Unit `event-schema` | Lọc theo key và theo giá trị (email, số điện thoại, ngày), làm phẳng, giới hạn độ dài, kiểm tra ULID, `name`, `funnel`, `t` | Vitest |
| Unit SDK | Bắt qua 3 đường, chống trùng, flush theo số lượng, thời gian và `pagehide`, beacon lỗi thì dùng fetch, giữ 200 event, attribution và cookie, consent ở EEA và nước khác, không bắn ở preview, lỗi SDK không làm hỏng funnel | Vitest + happy-dom |
| SDK trên funnel thật | 3 `demo.html` thật (bản mẫu, có `<head>`, không có `<head>`), bấm qua bằng `go()`. Request có đủ event chuẩn và không có PII. Pixel bắn đúng event với `eventID` | Playwright |
| Collector + chèn script | Origin, kích thước, event sai, lọc lại PII, các field enrich, Queue lỗi; `__IKF` có `country`/`pixel`; thẻ script và route SDK | `@cloudflare/vitest-pool-workers` |
| Consumer | Ack, retry, chia đôi khi 4xx, giới hạn tần suất alarm | `vitest-pool-workers` + ClickHouse thật (Testcontainers) |
| Core + CLI | Migration 002, `PUT /v1/funnels/:slug`, đồng bộ lại các host, `ikf funnel set` | Vitest + Postgres Testcontainers |
| Staging | Event về ClickHouse trong vòng 1 phút, Meta Test Events, banner qua VPN EU, k6 bắn `/_ikf/c` 400 rps | Thủ công + k6 |

## 9. Ngoài phạm vi

- Dashboard và báo cáo: `admin-console` hoặc phần data.
- CAPI, `Purchase`, Adjust S2S: `conversions-relay`.
- A/B test (P2), lưu trữ event thô lên R2, TikTok Pixel.
- Consent theo tiêu chuẩn IAB TCF: banner tự làm đủ cho MVP. Cần thì xem lại ở P2.

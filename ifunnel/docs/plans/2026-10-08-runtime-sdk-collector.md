# iKame Funnel Platform — Runtime SDK + Collector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mọi funnel đang chạy trên edge gửi event hành vi về ClickHouse (đo drop-off theo màn và CVR) và bắn Meta Pixel (`PageView`, `Lead`, `InitiateCheckout`, có `eventID`) mà **không sửa HTML funnel**. Đồng thời lưu click id + UTM để spec checkout gắn attribution.

**Architecture:**
- **`@ikf/event-schema`** (dùng chung): validate event, lọc PII, làm phẳng `props`. SDK và collector chạy cùng một đoạn code.
- **`@ikf/sdk` → `ikf.js`** (trình duyệt, ≤ 8KB gzip): bọc `window.dispatchEvent`, hook `dataLayer`/`ikfEvents`, gom batch gửi `POST /_ikf/c` (beacon → fetch keepalive), attribution + cookie `_fbc`/`_fbp`, banner consent (shadow DOM) cho EEA/GB/CH, Meta Pixel có cổng chặn.
- **Worker `edge-router`** (sửa): chèn `<script src="/_ikf/sdk.<hash>.js">` ngay sau `__IKF`, `__IKF` thêm `country` + `pixel`, phục vụ SDK (immutable), collector `POST /_ikf/c` → `env.EVENTS.sendBatch`.
- **Worker `event-consumer`** (mới): Queue `ikf-events-<env>` → ClickHouse `INSERT … FORMAT JSONEachRow` (async insert), 400 thì chia đôi tìm dòng hỏng, lỗi khác thì retry có backoff, sắp vào DLQ hoặc lỗi 3 lần thì alarm SNS (tối đa 1 lần / 15 phút / loại).
- **`core-api`** (sửa): `funnels.pixel_id`, `PUT /v1/funnels/:slug`, KV route có thêm `pixel`. **CLI** (sửa): `ikf funnel set`, `ikf events replay-dlq`.

**Tech Stack:** Node.js 22 trên CI (local Node 26) · JavaScript ESM · npm workspaces · Vitest ~3.2 · happy-dom 20 · esbuild 0.25 · `@cloudflare/vitest-pool-workers` ^0.12.0 (0.8.x không nhận `cacheTtl: 30`; giữ `cacheTtl: 30`) · wrangler 4 · `@testcontainers/postgresql` 11 + `@testcontainers/clickhouse` 11 (`clickhouse/clickhouse-server:25.8`) · `aws4fetch` 1 (SigV4 cho SNS) · `@playwright/test` · Terraform + Cloudflare provider `~> 5.0` (lock 5.27.0) + AWS provider.

**Spec:** `ifunnel/docs/specs/2026-10-08-runtime-sdk-collector-design.md`. Xây trên plan `ifunnel/docs/plans/2026-10-06-edge-router-publisher.md` (đã merge vào nhánh `feat/infra-edge-router`).

**Repo / nhánh:** code nằm trong `/Users/daothinh/ikf-platform`, nhánh mới `feat/runtime-sdk-collector` cắt từ `feat/infra-edge-router` (HEAD `4f13c44`). Task 1 tạo nhánh.

**Môi trường chạy test (local):**
```bash
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock          # Docker qua colima
export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock     # cho Testcontainers (Postgres, ClickHouse)
export TF_PLUGIN_CACHE_DIR=$HOME/.terraform.d/plugin-cache            # Terraform
```
actionlint: `docker run --rm -v "$PWD:/repo" -w /repo rhysd/actionlint:latest`.

## Điều chỉnh so với spec (phát hiện khi khảo sát `demo.html` và code hiện có, 2026-10-08)

| # | Spec | Plan làm | Lý do |
|---|---|---|---|
| A1 | Không nói funnel tự gọi `fbq` | SDK cài stub Meta **có cổng**: chỉ lời gọi từ SDK đi qua; `fbq('set','autoConfig',false,id)`, `disablePushState = true` | 15/69 funnel (calmio-\*, testlibrary/\*, chai-\*) gọi `window.fbq('trackCustom', name, answers)` khi `fbq` tồn tại → sẽ gửi câu trả lời sang Meta, trái quyết định #2. Funnel dùng `pushState` mỗi màn → Pixel tự bắn PageView |
| A2 | Hook `dataLayer.push` | SDK **không tạo** `dataLayer`; dùng accessor trên `window`. Bỏ qua event `ikfunnel_*`, `ikf_*`, `gtm.*` | Các funnel đó chỉ push khi `Array.isArray(window.dataLayer)`, với tên có tiền tố — là bản sao của event `ikfunnel:*` đã bắt → đếm đôi |
| A3 | Không nói mã lỗi khi sai `content-type` | `415` | Phân biệt với `400` (body sai) |
| A4 | Insert URL cố định | Thêm `database=<CLICKHOUSE_DATABASE>` và `date_time_input_format=best_effort`; consumer gửi thời gian dạng ISO-8601 | Số ms vào `DateTime64(3)` dễ bị hiểu sai đơn vị; DB của user không nhất thiết là `default` |
| A5 | "4xx: chia đôi" | Chỉ **400** mới chia đôi; 401/403/404/413/429… → retry như 5xx | Sai mật khẩu ClickHouse trả 403/516: chia đôi sẽ `ack` (vứt) toàn bộ dữ liệu |
| A6 | "insert lỗi 3 lần liên tiếp" / "message vào DLQ" | Batch lỗi có `max(attempts) ≥ 3` → alarm `insert_failing`; `≥ 5` (lần thử cuối) → alarm `dlq`. Chặn tần suất bằng KV `ikf-consumer-state-<env>`, key `alarm:<kind>`, `expirationTtl 900` | Consumer không có trạng thái giữa isolate; `attempts` của message chính là số lần liên tiếp |
| A7 | Consent theo `__IKF.country` | Country thiếu, `XX` hoặc `T1` (Tor) → coi như vùng cần consent | An toàn mặc định |
| A8 | Lọc giá trị "là email" | Bỏ giá trị **chứa** email (kể cả dạng `%40` trong URL); số (number) không bao giờ bị coi là PII theo giá trị; `attr` chỉ lọc email | `checkout_click` có `url` kèm `email=`; `utm_content` thường là ad id 18 chữ số |
| A9 | `InitiateCheckout` "nếu `detail` có giá trị số hợp lệ" | `value = detail.value ?? price ?? amount` (number hoặc chuỗi số), > 0; `currency` = `detail.currency` nếu là 3 chữ hoa, không thì `USD` | Meta bắt buộc `currency` khi có `value` |
| A10 | Attribution "lượt đầu thắng" | Cả bộ: đã lưu được bất kỳ key nào thì URL sau bị bỏ qua | Không trộn 2 chiến dịch trong một session |
| A11 | SDK build vào Worker | Module `workers/edge-router/src/sdk-bundle.generated.js` **không commit** (gitignore); `pretest` của edge-router và CI build trước test/deploy. Hash = 12 hex đầu sha256 | Không bao giờ serve SDK cũ hơn source |
| A12 | `ikf events replay-dlq` | DLQ cần **HTTP pull consumer** (Terraform `cloudflare_queue_consumer`), retention 14 ngày | Pull API chỉ chạy trên queue có pull consumer |
| A13 | Rate limit `/_ikf/c` | Thêm rule thứ 2 vào ruleset `http_ratelimit` sẵn có của zone platform (preview) + một ruleset cho mỗi zone funnel khác zone platform | Mỗi zone chỉ có một entrypoint ruleset/phase. Zone platform cần gói cho phép ≥ 2 rule rate limit (Task 0) |
| A15 | Chống trùng: "cùng `name` + cùng `detail` trong 50ms" | Giữ luật đó, **thêm**: event từ `dataLayer`/`ikfEvents` bị bỏ nếu có `ikfunnel:<cùng name>` trong 50ms (quyết định ở microtask sau lời gọi push). DOM event thắng | 12 funnel `ewa-*`/`mygrowth-*`/`coursiv-*` push `d` vào `dataLayer` rồi dispatch `{...d, data: snapshot()}` → `detail` khác nhau, luật gốc đếm đôi (Playwright Task 13 bắt được) |
| A14 | `PUT /v1/funnels/:slug` "KV lỗi thì pending" | Trong cùng transaction tăng `host_revs.rev` cho các host bị ảnh hưởng | Job resync chỉ chiếu lại host có `kv_synced_rev < rev` |

## Global Constraints

- Code trong repo `ikf-platform`, nhánh `feat/runtime-sdk-collector`. HTML funnel **không sửa**, chỉ chèn script.
- Không bao giờ làm hỏng funnel: mọi hook bọc `try/catch`, `dispatchEvent` gốc luôn được gọi, SDK tải lỗi thì funnel vẫn chạy.
- SDK ≤ **8KB gzip** (`8192` byte, có test). p95 TTFB trang funnel tăng **≤ 20ms** so với khi chưa có SDK (đo ở staging).
- Body `POST /_ikf/c` = `{"events":[...]}`: **1–50 event, ≤ 64KB** (`65536` byte). `content-type` `application/json` hoặc `text/plain` (bỏ qua tham số).
- SDK flush khi: đủ **20 event**, sau **5 giây**, `visibilitychange → hidden`, `pagehide`. Giữ tối đa **200** event chưa gửi (bỏ cũ nhất), tối đa **2000 event/session**. Chống trùng: cùng `name` + `detail` serialize trong **50ms**; bản sao `dataLayer`/`ikfEvents` của một `ikfunnel:<name>` trong 50ms bị bỏ (A15).
- `props`: tối đa **40 key**, mỗi giá trị **200 ký tự**, key lồng nối `.`, mảng nối `|`; bỏ key top-level `screen`, `index`, `funnel`, `event`.
- PII key regex: `/(e-?mail|phone|tel|name|dob|birth|address|password|card)/i` ở mọi cấp. PII giá trị (chuỗi): chứa email; ≥ 7 chữ số liền sau khi bỏ dấu cách `+ - ( ) .`; khớp `^\d{4}-\d{2}-\d{2}`.
- Event: `id`, `sid`, `aid` = ULID (`^[0-7][0-9A-HJKMNP-TV-Z]{25}$`), `name` `^[a-z0-9_]{1,40}$`, `funnel` `^[a-z0-9][a-z0-9-]{1,62}$`, `|t − now| ≤ 24h`.
- `attr` keys: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `fbclid`, `ttclid`, `gclid`.
- Consent: `AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE` + `IS LI NO` + `GB` + `CH` (+ country không rõ). Lựa chọn lưu `localStorage.ikf_consent = granted|denied`. Chưa được phép: không Pixel, không `_fbc`/`_fbp`, `aid = null`.
- Cookie quảng cáo: `_fbc=fb.1.<ms>.<fbclid>`, `_fbp=fb.1.<ms>.<rand10>`; cả hai `Path=/; Max-Age=7776000; SameSite=Lax; Secure`.
- Pixel chỉ nhận `PageView`/`Lead`/`InitiateCheckout` với `{eventID: event.id}`; `InitiateCheckout` chỉ thêm `value`, `currency`. Không bao giờ gửi câu trả lời.
- `__IKF = {funnel, v, rev, country, pixel, preview?}`; script SDK chèn **ngay sau** `__IKF`, không `async`.
- `GET /_ikf/sdk.<12 hex>.js`: `content-type: text/javascript; charset=utf-8`, `cache-control: public, max-age=31536000, immutable`; hash sai → `404`.
- Collector trả `204` / `400` / `403` / `405` / `413` / `415` / `503`; Queue lỗi → `503` + log `queue_unavailable`.
- Enrich: `received_at` (ms server), `country` (`request.cf.country`, thiếu → `XX`), `ua_class` ∈ `mobile|desktop|inapp_fb|inapp_ig|inapp_tiktok|other`, `ip_hash = sha256_hex(IP_SALT + "YYYY-MM-DD"(UTC) + IP)`. **Không lưu IP thô.**
- Rate limit `/_ikf/c`: **30 request / 10 giây / IP** (`ip.src` + `cf.colo.id`).
- Queue `ikf-events-<env>`: `max_batch_size = 100`, `max_batch_timeout = 10`, `max_retries = 5`, `dead_letter_queue = ikf-events-<env>-dlq`. Retry `delaySeconds = 2^attempts`. ClickHouse timeout **15 giây**.
- Alarm SNS: tối đa **1 lần / 15 phút / loại** (`dlq`, `insert_failing`). IAM user chỉ có `sns:Publish` trên topic alarm.
- Bảng ClickHouse (file `clickhouse/001_events.sql`):

```sql
CREATE TABLE IF NOT EXISTS events (
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
- KV doc `route:<host>` = `{"rev": <int>, "routes": [{"prefix","bundle","funnel","v","pixel"}]}` (`pixel`: chuỗi số hoặc `null`).
- Không có giá trị secret trong Terraform hay git: `IP_SALT`, `CLICKHOUSE_URL/USER/PASSWORD`, `AWS_ACCESS_KEY_ID/SECRET_ACCESS_KEY` vào Worker bằng `wrangler secret put`.

## Review Focus

1. **Đếm đôi event**: funnel vừa `dataLayer.push(d)` vừa `dispatchEvent('ikfunnel:'+name, {detail: d})`, có funnel push thêm bản sao `ikfunnel_<name>`/`ikf_<name>`. Người dùng mong số liệu drop-off đúng. Test: Task 2 (`counts the same event once…`, `keeps the DOM event and drops the dataLayer copy…`, `ignoring prefixed copies…`), Task 13 (`ewa-books`: `funnel_start` đúng 1 lần).
2. **Câu trả lời / PII lọt sang Meta hoặc ClickHouse**: funnel tự gọi `fbq('trackCustom', name, answers)`; `detail.data` có email/ngày sinh. Test: Task 4 (`blocks funnels calling window.fbq directly…`), Task 9 (`re-scrubs props…`), Task 13 (body POST không chứa email/ngày sinh/số điện thoại; không có `trackCustom`).
3. **ClickHouse sai credential hoặc down làm mất dữ liệu**: chỉ `400` mới được chia đôi + ack dòng hỏng; `403`/`5xx`/timeout phải retry rồi DLQ. Test: Task 10 (`wrong credentials are retryable, never split`, `retries 5xx with backoff…`).
4. **SDK làm hỏng funnel**: lỗi trong SDK, storage bị chặn, transport ném lỗi. Test: Task 2 (`still dispatches when the capture callback throws`), Task 4 (`never breaks the funnel` ×3).
5. **Deploy đổi hash SDK**: HTML phải trỏ đúng hash đang serve, hash cũ `404` chứ không trả nhầm nội dung, và Worker không được deploy với SDK cũ. Test: Task 8 (`script tag points at the SDK this Worker serves`, `404 for another hash`), Task 5 (bundle build lại trong `pretest`/CI, không commit).

## File Structure (repo `ikf-platform`, phần mới/sửa)

```
ikf-platform/
├── .gitignore                                  # SỬA: dist SDK, sdk-bundle.generated.js
├── clickhouse/001_events.sql                   # MỚI: DDL bảng events
├── packages/
│   ├── event-schema/                           # MỚI: validateEvent, scrub, flatten, buildProps, screenOf, cleanAttr, scrubEvent
│   │   ├── package.json, src/index.js, test/event-schema.test.js
│   ├── sdk/                                    # MỚI: ikf.js
│   │   ├── package.json, vitest.config.js, playwright.config.js
│   │   ├── src/{ulid,storage,capture,transport,queue,attribution,consent,pixel,index,entry}.js
│   │   ├── scripts/build.mjs                   # esbuild → dist/ikf.min.js + sdk-bundle.generated.js
│   │   ├── test/{ulid,capture,queue,attribution,consent,sdk,build}.test.js
│   │   └── e2e/{server.js,funnels.spec.js}     # Playwright trên demo.html thật
│   └── cli/
│       ├── src/{main,api}.js                   # SỬA: funnel set, events replay-dlq
│       ├── src/replay.js                       # MỚI: Cloudflare Queues pull/ack/send
│       └── test/{main,api,replay}.test.js
├── services/core-api/
│   ├── migrations/002_funnel_pixel.sql         # MỚI
│   ├── src/app.js                              # SỬA: đăng ký funnels.js
│   ├── src/http/funnels.js                     # MỚI: PUT /v1/funnels/:slug
│   ├── src/publisher/funnels.js                # MỚI: setFunnelPixel
│   ├── src/publisher/routes.js                 # SỬA: syncHost đưa pixel vào KV
│   └── test/{funnels,migrate,routes,resync}.test.js
├── workers/edge-router/
│   ├── package.json                            # SỬA: pretest build SDK, dep @ikf/event-schema
│   ├── wrangler.json, vitest.config.js         # SỬA: queue producer EVENTS, IP_SALT test binding
│   ├── scripts/render-config.mjs               # SỬA: producer ikf-events-<env>
│   ├── src/{index,inject}.js                   # SỬA
│   ├── src/{sdk,collector}.js                  # MỚI
│   └── test/{inject,router,sdk,collector}.test.js
├── workers/event-consumer/                     # MỚI
│   ├── package.json, wrangler.json, vitest.config.js, vitest.node.config.js
│   ├── scripts/render-config.mjs
│   ├── src/{clickhouse,alarm,index}.js
│   └── test/node/clickhouse.test.js, test/worker/consumer.test.js
├── infra/modules/edge/                         # SỬA: rule /_ikf/c, KV consumer-state, DLQ pull consumer + retention
├── infra/modules/funnel-domains/               # SỬA: ruleset rate limit /_ikf/c cho zone funnel
├── infra/stack/{main,outputs}.tf + tests       # SỬA: IAM user sns:Publish, outputs
└── .github/workflows/{edge-router,packages,event-consumer}.yml   # SỬA/MỚI
```

---

### Task 0: Chuẩn bị đầu vào (thủ công, không có code)

Ai làm: DevOps + Tech Lead. Task 1–11, 13 làm được ngay. Task 12 (apply) và phần theo sau cần các mục này.

- [ ] **Step 1: ClickHouse Cloud.** Tạo service cho staging và prod. Tạo database `ikf` và user ghi:
  ```sql
  CREATE DATABASE IF NOT EXISTS ikf;
  CREATE USER ikf_writer IDENTIFIED WITH sha256_password BY '<random 32+ ký tự>';
  GRANT INSERT ON ikf.events TO ikf_writer;
  ```
  Ghi lại HTTPS endpoint (`https://<id>.<region>.clickhouse.cloud:8443`), user, mật khẩu vào password manager. DDL `clickhouse/001_events.sql` chạy sau khi Task 10 merge (xem phần "Theo sau").
- [ ] **Step 2: `IP_SALT`.** Mỗi env một giá trị: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`. Lưu vào password manager. Không đổi sau khi chạy thật (đổi salt = `ip_hash` không so sánh được giữa hai giai đoạn).
- [ ] **Step 3: Token Cloudflare cho CI.** Token `CLOUDFLARE_WORKERS_TOKEN` (plan trước) thêm quyền `Account: Queues:Edit` (wrangler cần khi deploy producer/consumer) và `Account: Workers KV Storage:Read`.
- [ ] **Step 4: Token Cloudflare cho người chạy `replay-dlq`.** Token `Account: Queues:Edit`, giới hạn account iKame. Lưu password manager; dùng qua `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`.
- [ ] **Step 5: Gói zone.** Kiểm tra zone platform cho phép ít nhất 2 rule rate limit (Free chỉ cho 1). Nếu không, báo Tech Lead nâng gói trước khi apply Task 12.
- [ ] **Step 6: Meta.** Lấy Pixel ID của từng app (6–20 chữ số) và quyền vào Events Manager → Test Events.

---

### Task 1: Nhánh mới + `@ikf/event-schema`

**Files:**
- Create: `packages/event-schema/package.json`, `packages/event-schema/src/index.js`
- Test: `packages/event-schema/test/event-schema.test.js`

**Interfaces:**
- Produces (`@ikf/event-schema`, dùng ở Task 2, 3, 4, 9):
  - Hằng: `MAX_EVENTS = 50`, `MAX_BODY_BYTES = 65536`, `MAX_PROPS = 40`, `MAX_VALUE_LEN = 200`, `MAX_SKEW_MS = 86400000`, `ATTR_KEYS: string[]`, `PII_KEY_RE`, `NAME_RE`, `SLUG_RE`, `ULID_RE`.
  - `isUlid(s): boolean`, `containsEmail(s): boolean`, `isPiiValue(v): boolean`
  - `scrub(value): any | undefined` (bản sao sâu không có PII), `flatten(obj): Record<string,string>`, `buildProps(detail) = flatten(scrub(detail))`
  - `screenOf(detail): number | null` (từ `detail.screen`, `detail.index`, `detail.data.screen`)
  - `cleanAttr(attr): Record<string,string>` (chỉ `ATTR_KEYS`, bỏ giá trị chứa email)
  - `validateEvent(raw, now): {ok: true, event} | {ok: false, reason}`; `event` = `{id,sid,aid,t,name,funnel,v,rev,host,path,screen,props,attr}` (host lowercase, mặc định `aid=null, screen=null, props={}, attr={}`)
  - `scrubEvent(event) → {...event, props: flatten(scrub(props)), attr: cleanAttr(attr)}`

- [ ] **Step 1: Tạo nhánh**

```bash
cd /Users/daothinh/ikf-platform
git fetch origin && git checkout feat/infra-edge-router && git pull --ff-only
git checkout -b feat/runtime-sdk-collector
```

- [ ] **Step 2: Tạo package**

```bash
mkdir -p packages/event-schema/src packages/event-schema/test
```

`packages/event-schema/package.json`:

```json
{
  "name": "@ikf/event-schema",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": "./src/index.js",
  "sideEffects": false,
  "scripts": { "test": "vitest run" },
  "devDependencies": { "vitest": "~3.2.0" }
}
```

- [ ] **Step 3: Viết test fail**

`packages/event-schema/test/event-schema.test.js`:

```js
import { describe, it, expect } from 'vitest';
import {
  isUlid, isPiiValue, containsEmail, scrub, flatten, buildProps, screenOf, cleanAttr, validateEvent, scrubEvent,
  MAX_SKEW_MS,
} from '../src/index.js';

const NOW = Date.UTC(2026, 9, 8, 10, 0, 0);
const ID = '01JA0000000000000000000001';
const SID = '01JA0000000000000000000002';
const good = (extra = {}) => ({
  id: ID, sid: SID, aid: null, t: NOW, name: 'screen_view', funnel: 'aivideo', v: 3, rev: 7,
  host: 'try.x.com', path: '/promo', screen: 2, props: { plan: 'w4' }, attr: { utm_source: 'meta' }, ...extra,
});

describe('isUlid', () => {
  it.each([ID, '7ZZZZZZZZZZZZZZZZZZZZZZZZZ'])('accepts %s', (s) => expect(isUlid(s)).toBe(true));
  it.each(['', '01ja0000000000000000000001', '8ZZZZZZZZZZZZZZZZZZZZZZZZZ', '01JA000000000000000000000I', ID.slice(1), 42])(
    'rejects %j', (s) => expect(isUlid(s)).toBe(false),
  );
});

describe('isPiiValue', () => {
  it.each([
    'a.b@example.com', 'mail me: x+y@ex.co.uk', 'https://pay.x/?email=a%40b.com', '+1 (415) 555-0100', '0912345678',
    '1990-01-02', '2026-10-08T10:00:00Z', 'order 12345678',
  ])('drops %j', (v) => expect(isPiiValue(v)).toBe(true));
  it.each(['w4', '123456', '12-34-56', 'yes', '$9.99', '1 2 3'])('keeps %j', (v) => expect(isPiiValue(v)).toBe(false));
  it('never treats numbers as PII', () => expect(isPiiValue(1700000000000)).toBe(false));
  it('containsEmail ignores non-strings', () => expect(containsEmail(null)).toBe(false));
});

describe('scrub', () => {
  it('drops PII keys at every depth', () => {
    expect(scrub({ email: 'x', Phone: 1, data: { userName: 'a', dob: 'b', birthYear: 1990, plan: 'w4', home_address: 'z', tel: 1 }, card_no: 1, password: 'p', 'e-mail': 'q' }))
      .toEqual({ data: { plan: 'w4' } });
  });
  it('drops PII values, also inside arrays', () => {
    expect(scrub({ a: 'x@y.co', b: ['ok', '0912345678'], c: '1990-01-02', d: 3 })).toEqual({ b: ['ok'], d: 3 });
  });
  it('drops functions, NaN and anything deeper than 6 levels', () => {
    const deep = { a: { b: { c: { d: { e: { f: { g: 1 } } } } } } };
    expect(scrub({ f: () => 1, n: NaN, deep })).toEqual({ deep: { a: { b: { c: { d: {} } } } } });
  });
  it('survives cycles', () => {
    const o = { k: 'v' };
    o.self = o;
    expect(() => scrub(o)).not.toThrow();
  });
});

describe('flatten', () => {
  it('joins nested keys with "." and arrays with "|"', () => {
    expect(flatten({ data: { plan: 'w4', goals: ['sleep', 'focus'], paid: false, n: 2 }, list: [{ a: 1 }, 2] })).toEqual({
      'data.plan': 'w4', 'data.goals': 'sleep|focus', 'data.paid': 'false', 'data.n': '2', list: '{"a":1}|2',
    });
  });
  it('leaves out top-level screen, index, funnel and event', () => {
    expect(flatten({ screen: 1, index: 2, funnel: 'f', event: 'e', data: { screen: 3 } })).toEqual({ 'data.screen': '3' });
  });
  it('caps values at 200 chars and keys at 40', () => {
    const many = Object.fromEntries(Array.from({ length: 60 }, (_, i) => [`k${i}`, 'x'.repeat(300)]));
    const out = flatten(many);
    expect(Object.keys(out)).toHaveLength(40);
    expect(out.k0).toHaveLength(200);
    expect(out.k40).toBeUndefined();
  });
  it('returns {} for non-objects', () => {
    expect(flatten('x')).toEqual({});
    expect(flatten(null)).toEqual({});
    expect(flatten([1])).toEqual({});
  });
});

describe('buildProps', () => {
  it('scrubs then flattens a typical funnel detail', () => {
    expect(buildProps({ event: 'lead', funnel: 'f', screen: 4, data: { email: 'a@b.co', goal: 'sleep', age: '25-34', dob: '1990-01-02' } }))
      .toEqual({ 'data.goal': 'sleep', 'data.age': '25-34' });
  });
});

describe('screenOf', () => {
  it.each([
    [{ screen: 3 }, 3], [{ index: 4 }, 4], [{ data: { screen: 5 } }, 5], [{ screen: '6' }, 6],
    [{ screen: 'quiz' }, null], [{ screen: -1 }, null], [{ screen: 1.5 }, null], [null, null], ['x', null],
  ])('%j -> %j', (d, s) => expect(screenOf(d)).toBe(s));
});

describe('cleanAttr', () => {
  it('keeps only known keys, drops emails, keeps long ad ids', () => {
    expect(cleanAttr({ utm_source: 'meta', utm_content: '120212345678901234', utm_term: 'a@b.co', fbclid: 'IwAR1', foo: 'x', gclid: 5 }))
      .toEqual({ utm_source: 'meta', utm_content: '120212345678901234', fbclid: 'IwAR1' });
  });
});

describe('validateEvent', () => {
  it('accepts a good event and keeps only known fields', () => {
    const r = validateEvent({ ...good(), extra: 'x', host: 'Try.X.com' }, NOW);
    expect(r.ok).toBe(true);
    expect(r.event).toEqual(good({ host: 'try.x.com' }));
  });
  it('defaults aid, screen, props and attr', () => {
    const { aid, screen, props, attr, ...rest } = good();
    expect(validateEvent(rest, NOW).event).toMatchObject({ aid: null, screen: null, props: {}, attr: {} });
  });
  it.each([
    [null, 'not_object'], [[], 'not_object'],
    [good({ id: 'x' }), 'bad_id'], [good({ sid: undefined }), 'bad_sid'], [good({ aid: 'nope' }), 'bad_aid'],
    [good({ t: NOW + MAX_SKEW_MS + 1 }), 'bad_t'], [good({ t: NOW - MAX_SKEW_MS - 1 }), 'bad_t'], [good({ t: '1' }), 'bad_t'],
    [good({ name: 'Screen-View' }), 'bad_name'], [good({ name: 'x'.repeat(41) }), 'bad_name'],
    [good({ funnel: 'A' }), 'bad_funnel'], [good({ v: -1 }), 'bad_v'], [good({ rev: 1.5 }), 'bad_rev'],
    [good({ host: '' }), 'bad_host'], [good({ path: 'promo' }), 'bad_path'], [good({ screen: 'x' }), 'bad_screen'],
    [good({ props: [] }), 'bad_props'], [good({ attr: 'x' }), 'bad_attr'],
  ])('rejects %#', (raw, reason) => expect(validateEvent(raw, NOW)).toEqual({ ok: false, reason }));
  it('accepts t exactly 24h away', () => expect(validateEvent(good({ t: NOW - MAX_SKEW_MS }), NOW).ok).toBe(true));
});

describe('scrubEvent', () => {
  it('re-scrubs flat props and attr sent by a client that skipped the SDK filter', () => {
    const ev = validateEvent(good({ props: { 'data.email': 'a@b.co', note: 'call 0912345678', plan: 'w4', screen: '2' }, attr: { utm_term: 'a@b.co' } }), NOW).event;
    expect(scrubEvent(ev)).toMatchObject({ props: { plan: 'w4' }, attr: {} });
  });
});
```

- [ ] **Step 4: Chạy test, xác nhận FAIL**

Run: `npm install && npm test -w @ikf/event-schema`
Expected: FAIL với `Failed to load url ../src/index.js`.

- [ ] **Step 5: Implement**

`packages/event-schema/src/index.js`:

```js
// Shared by the browser SDK and the edge collector: both sides must validate and scrub identically.
export const MAX_EVENTS = 50;
export const MAX_BODY_BYTES = 65536;
export const MAX_PROPS = 40;
export const MAX_VALUE_LEN = 200;
export const MAX_SKEW_MS = 24 * 60 * 60 * 1000;
export const ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'ttclid', 'gclid'];

export const PII_KEY_RE = /(e-?mail|phone|tel|name|dob|birth|address|password|card)/i;
export const NAME_RE = /^[a-z0-9_]{1,40}$/;
export const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,62}$/;
export const ULID_RE = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;

const EMAIL_RE = /[^\s@<>"'(),;:]+@[^\s@<>"'(),;:]+\.[a-z]{2,}/i;
const LONG_DIGITS_RE = /\d{7,}/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}/;
const SKIP_TOP = new Set(['screen', 'index', 'funnel', 'event']);
const MAX_DEPTH = 6;

export const isUlid = (s) => typeof s === 'string' && ULID_RE.test(s);

export function containsEmail(s) {
  if (typeof s !== 'string') return false;
  let decoded = s;
  try {
    decoded = decodeURIComponent(s);
  } catch {
    // malformed %-escape: test the raw text only
  }
  return EMAIL_RE.test(s) || EMAIL_RE.test(decoded);
}

// Strings only: numbers (prices, timestamps) are never treated as PII by value.
export function isPiiValue(v) {
  if (typeof v !== 'string') return false;
  if (containsEmail(v)) return true;
  if (LONG_DIGITS_RE.test(v.replace(/[\s+\-().]/g, ''))) return true;
  return DATE_RE.test(v.trim());
}

// Deep copy without PII keys (any depth) or PII values; drops functions, NaN, cycles past MAX_DEPTH.
export function scrub(value, depth = 0) {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string') return isPiiValue(value) ? undefined : value;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'object' || depth >= MAX_DEPTH) return undefined;
  if (Array.isArray(value)) {
    const out = [];
    for (const x of value) {
      const y = scrub(x, depth + 1);
      if (y !== undefined) out.push(y);
    }
    return out;
  }
  const out = {};
  for (const k of Object.keys(value)) {
    if (PII_KEY_RE.test(k)) continue;
    const y = scrub(value[k], depth + 1);
    if (y !== undefined) out[k] = y;
  }
  return out;
}

// Nested keys joined with ".", arrays joined with "|", values ≤ 200 chars, at most 40 keys.
export function flatten(obj) {
  const out = {};
  let n = 0;
  const put = (k, v) => {
    if (n >= MAX_PROPS || !k || Object.prototype.hasOwnProperty.call(out, k)) return;
    out[k] = String(v).slice(0, MAX_VALUE_LEN);
    n += 1;
  };
  const walk = (val, prefix) => {
    if (n >= MAX_PROPS || val === undefined || val === null) return;
    if (Array.isArray(val)) {
      put(prefix, val.map((x) => (x !== null && typeof x === 'object' ? JSON.stringify(x) : String(x))).join('|'));
      return;
    }
    if (typeof val === 'object') {
      for (const k of Object.keys(val)) {
        if (!prefix && SKIP_TOP.has(k)) continue;
        walk(val[k], prefix ? `${prefix}.${k}` : k);
      }
      return;
    }
    put(prefix, val);
  };
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) walk(obj, '');
  return out;
}

export const buildProps = (detail) => flatten(scrub(detail) ?? {});

export function screenOf(detail) {
  if (!detail || typeof detail !== 'object') return null;
  const data = detail.data && typeof detail.data === 'object' ? detail.data : {};
  for (const c of [detail.screen, detail.index, data.screen]) {
    if (typeof c === 'number' && Number.isInteger(c) && c >= 0 && c <= 1000000) return c;
    if (typeof c === 'string' && /^\d{1,6}$/.test(c)) return Number(c);
  }
  return null;
}

// Click ids and utm_* are kept as given (ad ids are long digit runs), but never an email.
export function cleanAttr(attr) {
  const out = {};
  if (!attr || typeof attr !== 'object') return out;
  for (const k of ATTR_KEYS) {
    const v = attr[k];
    if (typeof v === 'string' && v && !containsEmail(v)) out[k] = v.slice(0, MAX_VALUE_LEN);
  }
  return out;
}

const fail = (reason) => ({ ok: false, reason });

// Shape check only; returns the event reduced to known fields. Call scrubEvent afterwards.
export function validateEvent(raw, now = Date.now()) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return fail('not_object');
  const { id, sid, aid = null, t, name, funnel, v, rev, host, path, screen = null, props = {}, attr = {} } = raw;
  if (!isUlid(id)) return fail('bad_id');
  if (!isUlid(sid)) return fail('bad_sid');
  if (aid !== null && !isUlid(aid)) return fail('bad_aid');
  if (typeof t !== 'number' || !Number.isFinite(t) || Math.abs(t - now) > MAX_SKEW_MS) return fail('bad_t');
  if (typeof name !== 'string' || !NAME_RE.test(name)) return fail('bad_name');
  if (typeof funnel !== 'string' || !SLUG_RE.test(funnel)) return fail('bad_funnel');
  if (!Number.isInteger(v) || v < 0 || v > 4294967295) return fail('bad_v');
  if (!Number.isInteger(rev) || rev < 0) return fail('bad_rev');
  if (typeof host !== 'string' || !host || host.length > 253) return fail('bad_host');
  if (typeof path !== 'string' || !path.startsWith('/') || path.length > 2048) return fail('bad_path');
  if (screen !== null && (!Number.isInteger(screen) || screen < 0 || screen > 2147483647)) return fail('bad_screen');
  if (!props || typeof props !== 'object' || Array.isArray(props)) return fail('bad_props');
  if (!attr || typeof attr !== 'object' || Array.isArray(attr)) return fail('bad_attr');
  return { ok: true, event: { id, sid, aid, t, name, funnel, v, rev, host: host.toLowerCase(), path, screen, props, attr } };
}

export const scrubEvent = (ev) => ({ ...ev, props: flatten(scrub(ev.props) ?? {}), attr: cleanAttr(ev.attr) });
```

- [ ] **Step 6: Chạy test, xác nhận PASS**

Run: `npm test -w @ikf/event-schema`
Expected: `Tests  65 passed (65)`.

- [ ] **Step 7: Commit**

```bash
git add package-lock.json packages/event-schema
git commit -m "feat(event-schema): shared event validation, PII scrub and props flattening"
```

---

### Task 2: SDK core — bắt event, hàng đợi, gửi

**Files:**
- Create: `packages/sdk/package.json`, `packages/sdk/vitest.config.js`
- Create: `packages/sdk/src/{ulid,storage,capture,transport,queue}.js`
- Test: `packages/sdk/test/{ulid,capture,queue}.test.js`

**Interfaces:**
- Consumes: `isUlid`, `MAX_EVENTS`, `MAX_BODY_BYTES` (Task 1).
- Produces (dùng ở Task 4):
  - `ulid(now?: number, bytes?: Uint8Array): string`, `randomBytes(n)`
  - `safeStorage(getStore: () => Storage): {get(k): string|null, set(k, v): void}` (rơi về bộ nhớ khi bị chặn)
  - `installCapture(win, onEvent: (name, detail) => void, now: () => number): void` — `ikfunnel:*` gọi `onEvent` đồng bộ; event từ `dataLayer`/`ikfEvents` gọi ở microtask kế tiếp (và bị bỏ nếu có DOM event cùng tên trong 50ms); `normalizeName(raw): string|null`; `DEDUPE_MS = 50`
  - `createTransport(win): (url, body: string) => 'ok' | 'retry' | 'drop' | Promise<…>` (beacon → fetch keepalive; 2xx ok, 5xx/429/mạng retry, 4xx khác drop)
  - `createQueue({transport, storage, setTimer, clearTimer, url = '/_ikf/c'}): {push(ev): boolean, flush(): void, size}`; hằng `FLUSH_AT = 20`, `FLUSH_MS = 5000`, `RETAIN = 200`, `SESSION_CAP = 2000`. Key storage: `ikf_q` (event chưa gửi), `ikf_n` (đếm trong session). Event phải có `t` (requeue sắp theo `t`).

- [ ] **Step 1: Tạo package**

```bash
mkdir -p packages/sdk/src packages/sdk/test
cat > packages/sdk/package.json <<'JSON'
{
  "name": "@ikf/sdk",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": "./src/index.js",
  "scripts": { "test": "vitest run" },
  "dependencies": { "@ikf/event-schema": "*" },
  "devDependencies": { "vitest": "~3.2.0" }
}
JSON
npm install -D -w @ikf/sdk happy-dom@^20
```

`packages/sdk/vitest.config.js`:

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    environmentOptions: { happyDOM: { url: 'https://try.x.com/promo' } },
    include: ['test/**/*.test.js'],
    // Node ≥ 25 ships its own global localStorage, which shadows happy-dom's; turn it off.
    poolOptions: { forks: { execArgv: ['--no-experimental-webstorage'] } },
  },
});
```

- [ ] **Step 2: Viết test fail**

`packages/sdk/test/ulid.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { isUlid } from '@ikf/event-schema';
import { ulid } from '../src/ulid.js';

describe('ulid', () => {
  it('encodes time first so ids sort by creation', () => {
    const a = ulid(1000, new Uint8Array(16));
    const b = ulid(1001, new Uint8Array(16));
    expect(a).toBe(`00000000Z8${'0'.repeat(16)}`);
    expect(a < b).toBe(true);
  });
  it('produces valid ULIDs', () => {
    for (let i = 0; i < 100; i += 1) expect(isUlid(ulid())).toBe(true);
  });
});
```

`packages/sdk/test/capture.test.js`:

```js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { installCapture, normalizeName } from '../src/capture.js';

const ORIGINAL_DISPATCH = window.dispatchEvent;
let got;
let clock;
beforeEach(() => {
  window.dispatchEvent = ORIGINAL_DISPATCH;
  delete window.dataLayer;
  delete window.ikfEvents;
  got = [];
  clock = 1000;
});
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
const install = () => installCapture(window, (name, detail) => got.push({ name, detail }), () => clock);

describe('installCapture', () => {
  it('copies ikfunnel:* DOM events and still delivers them to page listeners', () => {
    install();
    const seen = vi.fn();
    window.addEventListener('ikfunnel:lead', seen);
    window.dispatchEvent(new CustomEvent('ikfunnel:lead', { detail: { a: 1 } }));
    window.dispatchEvent(new CustomEvent('other', { detail: 1 }));
    expect(got).toEqual([{ name: 'lead', detail: { a: 1 } }]);
    expect(seen).toHaveBeenCalledTimes(1);
  });

  it('hooks dataLayer created after the SDK, ignoring prefixed copies and GTM internals', async () => {
    install();
    expect(Array.isArray(window.dataLayer)).toBe(false);
    (window.dataLayer = window.dataLayer || []).push({ event: 'screen_view', screen: 2 }, { event: 'ikfunnel_screen_view' }, { event: 'gtm.js' }, ['x']);
    await tick();
    expect(got.map((g) => g.name)).toEqual(['screen_view']);
    expect(window.dataLayer).toHaveLength(4);
  });

  it('hooks a dataLayer that the page replaces, including items already in it', async () => {
    install();
    window.dataLayer = [{ event: 'funnel_start' }];
    window.dataLayer.push({ event: 'answer' });
    await tick();
    expect(got.map((g) => g.name)).toEqual(['funnel_start', 'answer']);
  });

  it('hooks window.ikfEvents', async () => {
    install();
    (window.ikfEvents = window.ikfEvents || []).push({ event: 'checkout_click', plan: 'w4' });
    await tick();
    expect(got).toEqual([{ name: 'checkout_click', detail: { event: 'checkout_click', plan: 'w4' } }]);
  });

  it('counts the same event once when dataLayer and dispatchEvent carry it within 50ms', async () => {
    install();
    const d = { event: 'answer', funnel: 'f', screen: 3, value: 'a' };
    (window.dataLayer = window.dataLayer || []).push(d);
    clock += 50;
    window.dispatchEvent(new CustomEvent('ikfunnel:answer', { detail: d }));
    clock += 51;
    window.dispatchEvent(new CustomEvent('ikfunnel:answer', { detail: d }));
    window.dispatchEvent(new CustomEvent('ikfunnel:answer', { detail: { ...d, value: 'b' } }));
    await tick();
    expect(got.map((g) => g.detail.value)).toEqual(['a', 'a', 'b']);
  });

  it('keeps the DOM event and drops the dataLayer copy when the DOM detail is richer (ewa-* funnels)', async () => {
    install();
    const d = { event: 'funnel_start', funnel: 'f', screen: 1 };
    (window.dataLayer = window.dataLayer || []).push(d);
    window.dispatchEvent(new CustomEvent('ikfunnel:funnel_start', { detail: { ...d, data: { plan: 'w4' } } }));
    await tick();
    expect(got).toEqual([{ name: 'funnel_start', detail: { ...d, data: { plan: 'w4' } } }]);
  });

  it('keeps a dataLayer event when no DOM event of that name follows within 50ms', async () => {
    install();
    window.dispatchEvent(new CustomEvent('ikfunnel:answer'));
    clock += 51;
    (window.dataLayer = window.dataLayer || []).push({ event: 'answer', v: 1 }, { event: 'plan_select' });
    await tick();
    expect(got.map((g) => g.name)).toEqual(['answer', 'answer', 'plan_select']);
  });

  it('still dispatches when the capture callback throws', () => {
    installCapture(window, () => { throw new Error('boom'); }, () => clock);
    const seen = vi.fn();
    window.addEventListener('ikfunnel:x', seen);
    expect(() => window.dispatchEvent(new CustomEvent('ikfunnel:x'))).not.toThrow();
    expect(() => (window.dataLayer = []).push({ event: 'x' })).not.toThrow();
    expect(seen).toHaveBeenCalledTimes(1);
  });

  it('works when dispatchEvent is called without a receiver', () => {
    install();
    const bare = window.dispatchEvent;
    expect(bare(new CustomEvent('ikfunnel:paywall_view'))).toBe(true);
    expect(got.map((g) => g.name)).toEqual(['paywall_view']);
  });
});

describe('normalizeName', () => {
  it.each([['Screen-View', 'screen_view'], ['x'.repeat(50), 'x'.repeat(40)], ['---', null], [5, null]])('%j -> %j', (a, b) => {
    expect(normalizeName(a)).toBe(b);
  });
});
```

`packages/sdk/test/queue.test.js`:

```js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createQueue, FLUSH_MS, RETAIN, SESSION_CAP } from '../src/queue.js';
import { createTransport } from '../src/transport.js';
import { safeStorage } from '../src/storage.js';

const memStorage = () => safeStorage(() => { throw new Error('blocked'); });
const ev = (i, extra = {}) => ({ id: `e${i}`, t: i, name: 'screen_view', props: {}, ...extra });
const flushPromises = () => new Promise((r) => setTimeout(r, 0));

let sent;
let storage;
let result;
const transport = (url, body) => {
  sent.push({ url, events: JSON.parse(body).events });
  return result;
};
const make = (extra = {}) => createQueue({ transport, storage, setTimer: setTimeout, clearTimer: clearTimeout, ...extra });

beforeEach(() => {
  vi.useRealTimers();
  sent = [];
  storage = memStorage();
  result = 'ok';
});

describe('queue', () => {
  it('flushes as soon as 20 events are queued', () => {
    const q = make();
    for (let i = 0; i < 19; i += 1) q.push(ev(i));
    expect(sent).toHaveLength(0);
    q.push(ev(19));
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({ url: '/_ikf/c' });
    expect(sent[0].events).toHaveLength(20);
  });

  it('flushes after 5 seconds', () => {
    vi.useFakeTimers();
    const q = make();
    q.push(ev(1));
    vi.advanceTimersByTime(FLUSH_MS - 1);
    expect(sent).toHaveLength(0);
    vi.advanceTimersByTime(1);
    expect(sent.map((s) => s.events.length)).toEqual([1]);
  });

  it('flush sends everything in batches of at most 50', () => {
    const q = make();
    result = 'ok';
    const big = createQueue({ transport, storage, setTimer: () => 1, clearTimer: () => {} });
    for (let i = 0; i < 19; i += 1) big.push(ev(i));
    expect(q.size).toBe(0);
    big.flush();
    expect(sent.map((s) => s.events.length)).toEqual([19]);
  });

  it('splits a batch whose body would exceed 64KB', () => {
    const q = createQueue({ transport, storage, setTimer: () => 1, clearTimer: () => {} });
    for (let i = 0; i < 19; i += 1) q.push(ev(i, { props: { blob: 'x'.repeat(5000) } }));
    q.flush();
    expect(sent.length).toBeGreaterThan(1);
    expect(sent.flatMap((s) => s.events)).toHaveLength(19);
    for (const s of sent) expect(JSON.stringify({ events: s.events }).length).toBeLessThanOrEqual(65536);
  });

  it('keeps failed batches, retries them on the next flush, and keeps at most 200 (oldest dropped)', async () => {
    const q = createQueue({ transport, storage, setTimer: () => 1, clearTimer: () => {} });
    result = 'retry';
    for (let i = 0; i < 250; i += 1) q.push(ev(i));
    await flushPromises();
    expect(q.size).toBe(RETAIN);
    expect(JSON.parse(storage.get('ikf_q'))[0].id).toBe('e50');
    result = 'ok';
    sent = [];
    q.flush();
    expect(sent.flatMap((s) => s.events).map((e) => e.id)).toEqual(Array.from({ length: 200 }, (_, i) => `e${i + 50}`));
  });

  it('does not retry a batch the collector refused', async () => {
    const q = createQueue({ transport, storage, setTimer: () => 1, clearTimer: () => {} });
    result = 'drop';
    q.push(ev(1));
    q.flush();
    await flushPromises();
    expect(q.size).toBe(0);
  });

  it('treats a throwing or rejecting transport as retry', async () => {
    const q = createQueue({ transport: () => Promise.reject(new Error('x')), storage, setTimer: () => 1, clearTimer: () => {} });
    q.push(ev(1));
    q.flush();
    await flushPromises();
    expect(q.size).toBe(1);
    const q2 = createQueue({ transport: () => { throw new Error('x'); }, storage: memStorage(), setTimer: () => 1, clearTimer: () => {} });
    q2.push(ev(2));
    expect(() => q2.flush()).not.toThrow();
    await flushPromises();
    expect(q2.size).toBe(1);
  });

  it('stops accepting events after 2000 in a session', () => {
    storage.set('ikf_n', String(SESSION_CAP - 1));
    const q = createQueue({ transport, storage, setTimer: () => 1, clearTimer: () => {} });
    expect(q.push(ev(1))).toBe(true);
    expect(q.push(ev(2))).toBe(false);
    expect(q.size).toBe(1);
  });

  it('picks up events a previous page of this session left behind', () => {
    vi.useFakeTimers();
    storage.set('ikf_q', JSON.stringify([ev(1)]));
    make();
    vi.advanceTimersByTime(FLUSH_MS);
    expect(sent[0].events.map((e) => e.id)).toEqual(['e1']);
  });
});

describe('transport', () => {
  it('uses sendBeacon when it accepts the body', async () => {
    const win = { navigator: { sendBeacon: vi.fn(() => true) }, fetch: vi.fn() };
    expect(await createTransport(win)('/_ikf/c', '{}')).toBe('ok');
    expect(win.navigator.sendBeacon).toHaveBeenCalledWith('/_ikf/c', '{}');
    expect(win.fetch).not.toHaveBeenCalled();
  });

  it.each([
    [204, 'ok'], [503, 'retry'], [429, 'retry'], [400, 'drop'], [413, 'drop'],
  ])('falls back to keepalive fetch when sendBeacon returns false (%i -> %s)', async (status, want) => {
    const win = { navigator: { sendBeacon: () => false }, fetch: vi.fn(async () => new Response(null, { status })) };
    expect(await createTransport(win)('/_ikf/c', '{"events":[]}')).toBe(want);
    expect(win.fetch.mock.calls[0][1]).toMatchObject({ method: 'POST', keepalive: true, body: '{"events":[]}' });
  });

  it('uses fetch when there is no sendBeacon, and retries on network errors', async () => {
    const win = { navigator: {}, fetch: vi.fn(async () => { throw new TypeError('offline'); }) };
    expect(await createTransport(win)('/_ikf/c', '{}')).toBe('retry');
  });

  it('retries when there is neither', async () => {
    expect(await createTransport({ navigator: {} })('/_ikf/c', '{}')).toBe('retry');
  });
});

describe('safeStorage', () => {
  it('falls back to memory when storage is blocked', () => {
    const s = memStorage();
    s.set('k', 1);
    expect(s.get('k')).toBe('1');
    expect(s.get('missing')).toBeNull();
  });
  it('uses the real store when it works', () => {
    const s = safeStorage(() => window.sessionStorage);
    s.set('ikf_test', 'v');
    expect(window.sessionStorage.getItem('ikf_test')).toBe('v');
  });
});
```

- [ ] **Step 3: Chạy test, xác nhận FAIL**

Run: `npm test -w @ikf/sdk`
Expected: FAIL, 3 file không load được (`../src/ulid.js`, `../src/capture.js`, `../src/queue.js`).

- [ ] **Step 4: Implement**

`packages/sdk/src/ulid.js`:

```js
const ENC = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export function randomBytes(n) {
  const a = new Uint8Array(n);
  try {
    crypto.getRandomValues(a);
  } catch {
    for (let i = 0; i < n; i += 1) a[i] = Math.floor(Math.random() * 256);
  }
  return a;
}

// 48-bit ms timestamp + 80 random bits, Crockford base32 (26 chars).
export function ulid(now = Date.now(), bytes = randomBytes(16)) {
  let t = now;
  let time = '';
  for (let i = 0; i < 10; i += 1) {
    time = ENC[t % 32] + time;
    t = Math.floor(t / 32);
  }
  let rand = '';
  for (let i = 0; i < 16; i += 1) rand += ENC[bytes[i] % 32];
  return time + rand;
}
```

`packages/sdk/src/storage.js`:

```js
// Web storage that falls back to memory when blocked (Safari private mode, sandboxed iframes, quota).
export function safeStorage(getStore) {
  const mem = new Map();
  let store = null;
  try {
    store = getStore();
    store.setItem('__ikf_t', '1');
    store.removeItem('__ikf_t');
  } catch {
    store = null;
  }
  return {
    get(k) {
      try {
        if (store) return store.getItem(k);
      } catch {
        // fall through to memory
      }
      return mem.has(k) ? mem.get(k) : null;
    },
    set(k, v) {
      try {
        if (store) {
          store.setItem(k, String(v));
          return;
        }
      } catch {
        // fall through to memory
      }
      mem.set(k, String(v));
    },
  };
}
```

`packages/sdk/src/capture.js`:

```js
const PREFIX = 'ikfunnel:';
// Prefixed copies that some funnels push next to their ikfunnel:* DOM event, plus GTM internals.
const IGNORED_DATALAYER = /^(ikfunnel_|ikf_|gtm[._])/;
export const DEDUPE_MS = 50;

export function normalizeName(raw) {
  if (typeof raw !== 'string') return null;
  const n = raw.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 40);
  return /[a-z0-9]/.test(n) ? n : null;
}

function hookArray(win, prop, onItem) {
  const wrap = (arr) => {
    if (!Array.isArray(arr) || arr.__ikfHooked) return arr;
    try {
      const push = arr.push;
      Object.defineProperty(arr, '__ikfHooked', { value: true });
      arr.push = function ikfPush() {
        for (let i = 0; i < arguments.length; i += 1) {
          try {
            onItem(arguments[i]);
          } catch {
            // never break the page's push
          }
        }
        return push.apply(this, arguments);
      };
      for (const item of arr) {
        try {
          onItem(item);
        } catch {
          // ignore
        }
      }
    } catch {
      // frozen array etc.: leave it alone
    }
    return arr;
  };
  let current = wrap(win[prop]);
  try {
    // An accessor, not an array: `window.dataLayer = window.dataLayer || []` and plain reassignment both get hooked,
    // and `Array.isArray(window.dataLayer)` stays false until the page creates one.
    Object.defineProperty(win, prop, {
      configurable: true,
      enumerable: true,
      get() {
        return current;
      },
      set(v) {
        current = wrap(v);
      },
    });
  } catch {
    // non-configurable property: only the array we already wrapped is hooked
  }
}

// Calls onEvent(name, detail) once per funnel event, from any of the three channels funnels use.
export function installCapture(win, onEvent, now = () => Date.now()) {
  const seen = new Map();
  const lastDom = new Map(); // name -> time of the last ikfunnel:<name> DOM event
  const emit = (name, detail) => {
    let key;
    try {
      key = `${name}|${JSON.stringify(detail === undefined ? null : detail)}`;
    } catch {
      key = `${name}|?`;
    }
    const t = now();
    const last = seen.get(key);
    if (last !== undefined && t - last <= DEDUPE_MS) return;
    seen.set(key, t);
    if (seen.size > 200) {
      for (const [k, at] of seen) if (t - at > DEDUPE_MS) seen.delete(k);
    }
    onEvent(name, detail);
  };

  const fromDom = (rawName, detail) => {
    const name = normalizeName(rawName);
    if (!name) return;
    lastDom.set(name, now());
    emit(name, detail);
  };

  // Funnels often push to dataLayer and then dispatch ikfunnel:<name> with a richer detail
  // (the same object plus a state snapshot). Decide after the current script step: if the DOM event
  // for this name came within 50ms, the array copy is dropped.
  const fromArray = (rawName, item) => {
    const name = normalizeName(rawName);
    if (!name) return;
    const t = now();
    const decide = () => {
      try {
        const dom = lastDom.get(name);
        if (dom !== undefined && Math.abs(dom - t) <= DEDUPE_MS) return;
        emit(name, item);
      } catch {
        // never surface capture errors
      }
    };
    if (typeof queueMicrotask === 'function') queueMicrotask(decide);
    else Promise.resolve().then(decide);
  };

  const original = win.dispatchEvent;
  win.dispatchEvent = function ikfDispatchEvent(ev) {
    try {
      if (ev && typeof ev.type === 'string' && ev.type.indexOf(PREFIX) === 0) fromDom(ev.type.slice(PREFIX.length), ev.detail);
    } catch {
      // capture must never stop the event
    }
    return original.call(this == null ? win : this, ev);
  };

  hookArray(win, 'dataLayer', (item) => {
    if (item && typeof item === 'object' && typeof item.event === 'string' && !IGNORED_DATALAYER.test(item.event)) {
      fromArray(item.event, item);
    }
  });
  hookArray(win, 'ikfEvents', (item) => {
    if (item && typeof item === 'object' && typeof item.event === 'string') fromArray(item.event, item);
  });
}
```

`packages/sdk/src/transport.js`:

```js
// Resolves to 'ok', 'retry' (keep the batch) or 'drop' (the collector refused it; retrying cannot help).
export function createTransport(win) {
  return function transport(url, body) {
    try {
      const nav = win.navigator;
      if (nav && typeof nav.sendBeacon === 'function' && nav.sendBeacon(url, body)) return 'ok';
    } catch {
      // fall back to fetch
    }
    if (typeof win.fetch !== 'function') return 'retry';
    try {
      return win
        .fetch(url, { method: 'POST', body, keepalive: true, credentials: 'omit', headers: { 'content-type': 'text/plain' } })
        .then(
          (res) => (res.ok ? 'ok' : res.status >= 500 || res.status === 429 ? 'retry' : 'drop'),
          () => 'retry',
        );
    } catch {
      return 'retry';
    }
  };
}
```

`packages/sdk/src/queue.js`:

```js
import { MAX_BODY_BYTES, MAX_EVENTS } from '@ikf/event-schema';

export const FLUSH_AT = 20;
export const FLUSH_MS = 5000;
export const RETAIN = 200;
export const SESSION_CAP = 2000;
const Q_KEY = 'ikf_q';
const N_KEY = 'ikf_n';

function byteLength(s) {
  try {
    return new TextEncoder().encode(s).length;
  } catch {
    return s.length * 3;
  }
}

export function createQueue({ transport, storage, setTimer, clearTimer, url = '/_ikf/c' }) {
  let q = [];
  try {
    const saved = JSON.parse(storage.get(Q_KEY) || '[]');
    if (Array.isArray(saved)) q = saved.slice(-RETAIN);
  } catch {
    q = [];
  }
  let count = Number(storage.get(N_KEY)) || 0;
  let timer = null;

  const persist = () => storage.set(Q_KEY, JSON.stringify(q));
  const trim = () => {
    if (q.length > RETAIN) q.splice(0, q.length - RETAIN); // oldest go first
  };
  const schedule = () => {
    if (timer === null) {
      timer = setTimer(() => {
        timer = null;
        flush();
      }, FLUSH_MS);
    }
  };

  function requeue(batch) {
    // Batches settle in any order; keep the queue oldest-first so trim() drops the oldest.
    q = batch.concat(q).sort((a, b) => a.t - b.t);
    trim();
    persist();
    schedule();
  }

  function send(batch) {
    const body = JSON.stringify({ events: batch });
    if (batch.length > 1 && byteLength(body) > MAX_BODY_BYTES) {
      const half = Math.ceil(batch.length / 2);
      send(batch.slice(0, half));
      send(batch.slice(half));
      return;
    }
    let result;
    try {
      result = Promise.resolve(transport(url, body));
    } catch {
      result = Promise.resolve('retry');
    }
    result.then(
      (r) => {
        if (r === 'retry') requeue(batch);
      },
      () => requeue(batch),
    );
  }

  function flush() {
    if (timer !== null) {
      clearTimer(timer);
      timer = null;
    }
    while (q.length) send(q.splice(0, MAX_EVENTS));
    persist();
  }

  function push(ev) {
    if (count >= SESSION_CAP) return false;
    count += 1;
    storage.set(N_KEY, String(count));
    q.push(ev);
    trim();
    persist();
    if (q.length >= FLUSH_AT) flush();
    else schedule();
    return true;
  }

  if (q.length) schedule(); // events a previous page of this session could not send
  return {
    push,
    flush,
    get size() {
      return q.length;
    },
  };
}
```

- [ ] **Step 5: Chạy test, xác nhận PASS**

Run: `npm test -w @ikf/sdk`
Expected: `Tests  34 passed (34)`. (Trên Node ≥ 25, nếu thấy `Cannot read properties of undefined (reading 'clear')` thì `execArgv: ['--no-experimental-webstorage']` trong `vitest.config.js` chưa có hiệu lực.)

- [ ] **Step 6: Commit**

```bash
git add package-lock.json packages/sdk
git commit -m "feat(sdk): capture ikfunnel events, batch queue with beacon/fetch transport"
```

---

### Task 3: SDK attribution + consent

**Files:**
- Create: `packages/sdk/src/attribution.js`, `packages/sdk/src/consent.js`
- Test: `packages/sdk/test/attribution.test.js`, `packages/sdk/test/consent.test.js`

**Interfaces:**
- Consumes: `ATTR_KEYS`, `cleanAttr` (Task 1), `safeStorage` (Task 2).
- Produces (dùng ở Task 4):
  - `captureAttribution(search: string, session): attr` (lưu `sessionStorage.ikf_attr`, lượt đầu thắng)
  - `readCookie(doc, name): string | null`, `setAdCookies(doc, attr, now, random?)`, `AD_COOKIE_ATTRS`
  - `CONSENT_COUNTRIES` (32 mã), `needsConsent(country): boolean`, `readConsent(local): 'granted'|'denied'|null`, `saveConsent(local, value)`
  - `showBanner(win, onChoice: ('granted'|'denied') => void)`: phần tử `#ikf-consent`, shadow root `open`, nút `[data-c="denied"]` "Decline" và `[data-c="granted"]` "Accept"

- [ ] **Step 1: Viết test fail**

`packages/sdk/test/attribution.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest';
import { captureAttribution, readCookie, setAdCookies } from '../src/attribution.js';
import { safeStorage } from '../src/storage.js';

const mem = () => safeStorage(() => { throw new Error('blocked'); });
const clearCookies = () => {
  for (const c of document.cookie.split(';')) {
    const name = c.split('=')[0].trim();
    if (name) document.cookie = `${name}=; Path=/; Max-Age=0`;
  }
};

beforeEach(clearCookies);

describe('captureAttribution', () => {
  it('reads utm_* and click ids from the URL and stores them for the session', () => {
    const s = mem();
    const attr = captureAttribution('?utm_source=meta&utm_campaign=c1&fbclid=IwAR1&gclid=g&ttclid=t&utm_medium=paid&utm_content=120212345678901234&utm_term=x&other=1', s);
    expect(attr).toEqual({
      utm_source: 'meta', utm_medium: 'paid', utm_campaign: 'c1', utm_content: '120212345678901234', utm_term: 'x',
      fbclid: 'IwAR1', ttclid: 't', gclid: 'g',
    });
    expect(JSON.parse(s.get('ikf_attr'))).toEqual(attr);
  });

  it('keeps the first touch of the session', () => {
    const s = mem();
    captureAttribution('?utm_source=meta&fbclid=first', s);
    expect(captureAttribution('?utm_source=tiktok&fbclid=second', s)).toEqual({ utm_source: 'meta', fbclid: 'first' });
  });

  it('a landing without parameters does not block a later one', () => {
    const s = mem();
    expect(captureAttribution('', s)).toEqual({});
    expect(captureAttribution('?utm_source=meta', s)).toEqual({ utm_source: 'meta' });
  });

  it('never stores an email passed in a utm parameter', () => {
    expect(captureAttribution('?utm_term=a%40b.co&utm_source=x', mem())).toEqual({ utm_source: 'x' });
  });
});

describe('ad cookies', () => {
  it('sets _fbc from fbclid and a fresh _fbp', () => {
    setAdCookies(document, { fbclid: 'IwAR1' }, () => 1700000000000, () => '1234567890');
    expect(readCookie(document, '_fbc')).toBe('fb.1.1700000000000.IwAR1');
    expect(readCookie(document, '_fbp')).toBe('fb.1.1700000000000.1234567890');
  });

  it('keeps an existing _fbp and does not set _fbc without fbclid', () => {
    document.cookie = '_fbp=fb.1.1.111; Path=/';
    setAdCookies(document, {}, () => 2, () => '9');
    expect(readCookie(document, '_fbp')).toBe('fb.1.1.111');
    expect(readCookie(document, '_fbc')).toBeNull();
  });

  it('writes Path, Max-Age 90 days, SameSite=Lax and Secure', () => {
    const writes = [];
    const fake = { get cookie() { return ''; }, set cookie(v) { writes.push(v); } };
    setAdCookies(fake, { fbclid: 'x' }, () => 5, () => '1');
    expect(writes).toEqual([
      '_fbc=fb.1.5.x; Path=/; Max-Age=7776000; SameSite=Lax; Secure',
      '_fbp=fb.1.5.1; Path=/; Max-Age=7776000; SameSite=Lax; Secure',
    ]);
  });

  it('never throws when cookies are blocked', () => {
    const blocked = { get cookie() { throw new Error('no'); }, set cookie(v) { throw new Error('no'); } };
    expect(() => setAdCookies(blocked, { fbclid: 'x' }, () => 1)).not.toThrow();
    expect(readCookie(blocked, '_fbc')).toBeNull();
  });
});
```

`packages/sdk/test/consent.test.js`:

```js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CONSENT_COUNTRIES, needsConsent, readConsent, saveConsent, showBanner } from '../src/consent.js';
import { safeStorage } from '../src/storage.js';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('needsConsent', () => {
  it('covers EU 27 + EEA + GB + CH (32 countries)', () => {
    expect(CONSENT_COUNTRIES).toHaveLength(32);
    expect(new Set(CONSENT_COUNTRIES).size).toBe(32);
  });
  it.each(['DE', 'FR', 'GR', 'HU', 'NO', 'IS', 'LI', 'GB', 'CH', 'XX', 'T1', null, undefined, '', 'de'])('asks in %j', (c) => {
    expect(needsConsent(c)).toBe(true);
  });
  it.each(['US', 'VN', 'BR', 'TR', 'UA'])('does not ask in %s', (c) => expect(needsConsent(c)).toBe(false));
});

describe('stored choice', () => {
  it('round-trips granted/denied and ignores junk', () => {
    const s = safeStorage(() => { throw new Error('x'); });
    expect(readConsent(s)).toBeNull();
    saveConsent(s, 'granted');
    expect(readConsent(s)).toBe('granted');
    s.set('ikf_consent', 'maybe');
    expect(readConsent(s)).toBeNull();
  });
});

describe('showBanner', () => {
  it('renders Accept/Decline in a shadow root and reports the click once', () => {
    const onChoice = vi.fn();
    showBanner(window, onChoice);
    const host = document.getElementById('ikf-consent');
    const buttons = [...host.shadowRoot.querySelectorAll('button')];
    expect(buttons.map((b) => b.textContent)).toEqual(['Decline', 'Accept']);
    buttons[1].click();
    expect(onChoice).toHaveBeenCalledWith('granted');
    expect(document.getElementById('ikf-consent')).toBeNull();
  });

  it('Decline reports denied', () => {
    const onChoice = vi.fn();
    showBanner(window, onChoice);
    document.getElementById('ikf-consent').shadowRoot.querySelector('[data-c="denied"]').click();
    expect(onChoice).toHaveBeenCalledWith('denied');
  });

  it('waits for <body> when the SDK runs from <head>', () => {
    const listeners = {};
    const doc = {
      body: null,
      addEventListener: (t, fn) => { listeners[t] = fn; },
      createElement: (t) => document.createElement(t),
    };
    showBanner({ document: doc }, () => {});
    expect(listeners.DOMContentLoaded).toBeTypeOf('function');
    doc.body = document.body;
    listeners.DOMContentLoaded();
    expect(document.getElementById('ikf-consent')).not.toBeNull();
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run: `npm test -w @ikf/sdk`
Expected: FAIL, không load được `../src/attribution.js` và `../src/consent.js`.

- [ ] **Step 3: Implement**

`packages/sdk/src/attribution.js`:

```js
import { ATTR_KEYS, cleanAttr } from '@ikf/event-schema';

export const AD_COOKIE_ATTRS = '; Path=/; Max-Age=7776000; SameSite=Lax; Secure';
const ATTR_KEY = 'ikf_attr';

// First touch in the session wins: once any utm_*/click id was stored, later URLs are ignored.
export function captureAttribution(search, session) {
  let stored = {};
  try {
    stored = JSON.parse(session.get(ATTR_KEY) || '{}') || {};
  } catch {
    stored = {};
  }
  if (Object.keys(cleanAttr(stored)).length) return cleanAttr(stored);
  const found = {};
  try {
    const q = new URLSearchParams(search || '');
    for (const k of ATTR_KEYS) {
      const v = q.get(k);
      if (v) found[k] = v;
    }
  } catch {
    // unparsable query: no attribution
  }
  const attr = cleanAttr(found);
  if (Object.keys(attr).length) session.set(ATTR_KEY, JSON.stringify(attr));
  return attr;
}

export function readCookie(doc, name) {
  try {
    const m = doc.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return m && m[1] ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
}

const rand10 = () => String(Math.floor(1e9 + Math.random() * 9e9));

// Only called once advertising is allowed for this visitor.
export function setAdCookies(doc, attr, now, random = rand10) {
  try {
    const t = now();
    if (attr.fbclid) {
      const cur = readCookie(doc, '_fbc');
      if (!cur || !cur.endsWith(`.${attr.fbclid}`)) doc.cookie = `_fbc=fb.1.${t}.${attr.fbclid}${AD_COOKIE_ATTRS}`;
    }
    if (!readCookie(doc, '_fbp')) doc.cookie = `_fbp=fb.1.${t}.${random()}${AD_COOKIE_ATTRS}`;
  } catch {
    // cookies blocked: Pixel falls back to its own
  }
}
```

`packages/sdk/src/consent.js`:

```js
// EU 27 + IS, LI, NO (EEA) + GB + CH.
export const CONSENT_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB', 'CH',
];
const CONSENT_KEY = 'ikf_consent';

// Unknown country (missing, XX, Tor T1) is treated like the EEA: ask first.
export function needsConsent(country) {
  if (typeof country !== 'string' || !/^[A-Z]{2}$/.test(country)) return true;
  return country === 'XX' || country === 'T1' || CONSENT_COUNTRIES.includes(country);
}

export function readConsent(local) {
  const v = local.get(CONSENT_KEY);
  return v === 'granted' || v === 'denied' ? v : null;
}

export function saveConsent(local, value) {
  local.set(CONSENT_KEY, value);
}

const CSS = `
:host{all:initial}
.b{box-sizing:border-box;margin:0 auto;max-width:560px;padding:14px 16px;background:#111;color:#fff;
font:14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;border-radius:12px 12px 0 0;
box-shadow:0 -4px 20px rgba(0,0,0,.25)}
p{margin:0 0 10px}
.r{display:flex;gap:8px;justify-content:flex-end}
button{font:inherit;border:0;border-radius:8px;padding:9px 16px;cursor:pointer}
.d{background:#333;color:#fff}.a{background:#fff;color:#111;font-weight:600}`;

// Bottom banner in a shadow root, so funnel CSS cannot restyle it and it cannot restyle the funnel.
export function showBanner(win, onChoice) {
  const doc = win.document;
  const mount = () => {
    try {
      const host = doc.createElement('div');
      host.id = 'ikf-consent';
      host.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:2147483647';
      const root = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
      root.innerHTML = `<style>${CSS}</style><div class="b" role="dialog" aria-label="Cookie consent"><p>We use cookies to measure our ads. You can accept or decline them.</p><div class="r"><button class="d" data-c="denied">Decline</button><button class="a" data-c="granted">Accept</button></div></div>`;
      root.addEventListener('click', (e) => {
        const c = e.target && e.target.getAttribute ? e.target.getAttribute('data-c') : null;
        if (c !== 'granted' && c !== 'denied') return;
        host.remove();
        onChoice(c);
      });
      doc.body.appendChild(host);
    } catch {
      // no banner: ads stay off, analytics keeps running
    }
  };
  if (doc.body) mount();
  else doc.addEventListener('DOMContentLoaded', mount, { once: true });
}
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

Run: `npm test -w @ikf/sdk`
Expected: `Tests  67 passed (67)`.

- [ ] **Step 5: Commit**

```bash
git add packages/sdk
git commit -m "feat(sdk): first-touch attribution, ad cookies and EEA consent banner"
```

---

### Task 4: SDK Meta Pixel + lắp ráp `createSdk`

**Files:**
- Create: `packages/sdk/src/pixel.js`, `packages/sdk/src/index.js`, `packages/sdk/src/entry.js`
- Test: `packages/sdk/test/sdk.test.js`

**Interfaces:**
- Consumes: mọi thứ của Task 1–3.
- Produces:
  - `PIXEL_SRC = 'https://connect.facebook.net/en_US/fbevents.js'`, `checkoutParams(detail): {} | {value, currency}`
  - `createPixel(win, cfg): {load(): boolean, fire(ev, detail): void, loaded}`; map `page_load→PageView`, `lead→Lead`, `checkout_click→InitiateCheckout`; mọi lần bắn `fbq('track', name, params, {eventID: ev.id})`
  - `createSdk(win, deps?: {now, transport, setTimer, clearTimer}): api | null`; `start(win, deps?)` (bắt mọi lỗi, chỉ chạy một lần)
  - `window.IKF = { attribution(): {...attr, fbc, fbp, sid, aid}, flush(): void }` (dùng ở spec checkout và Task 13)
  - Event gửi lên: `{id, sid, aid, t, name, funnel, v, rev, host, path, screen, props, attr}` (khớp `validateEvent`)
  - Storage: `sessionStorage.ikf_sid`, `localStorage.ikf_aid = "<ulid>.<expiresMs>"` (1 năm), `localStorage.ikf_consent`
  - `src/entry.js`: entry của bundle (Task 5)

- [ ] **Step 1: Viết test fail**

`packages/sdk/test/sdk.test.js`:

```js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { isUlid } from '@ikf/event-schema';
import { createSdk, start } from '../src/index.js';
import { PIXEL_SRC, checkoutParams } from '../src/pixel.js';

const ORIGINAL_DISPATCH = window.dispatchEvent;
let posted;
let clock;

function boot(ikf, { url = 'https://try.x.com/promo?utm_source=meta&fbclid=IwAR1' } = {}) {
  window.happyDOM.setURL(url);
  window.__IKF = ikf;
  return createSdk(window, {
    now: () => clock,
    transport: (u, body) => {
      posted.push(...JSON.parse(body).events);
      return 'ok';
    },
    setTimer: () => 1,
    clearTimer: () => {},
  });
}
const IKF = (extra = {}) => ({ funnel: 'aivideo', v: 3, rev: 7, country: 'US', pixel: '123456789012345', ...extra });
const fbqCalls = () => (window.fbq ? window.fbq.queue.map((a) => [...a]) : []);
const pixelScripts = () => [...document.querySelectorAll('script')].filter((s) => s.src === PIXEL_SRC);

beforeEach(() => {
  window.dispatchEvent = ORIGINAL_DISPATCH;
  for (const k of ['IKF', '__IKF', 'fbq', '_fbq', 'dataLayer', 'ikfEvents']) delete window[k];
  window.sessionStorage.clear();
  window.localStorage.clear();
  for (const c of document.cookie.split(';')) {
    const n = c.split('=')[0].trim();
    if (n) document.cookie = `${n}=; Path=/; Max-Age=0`;
  }
  document.head.innerHTML = '';
  document.body.innerHTML = '';
  posted = [];
  clock = Date.UTC(2026, 9, 8, 10, 0, 0);
});

describe('createSdk', () => {
  it('does nothing without window.__IKF', () => {
    expect(boot(undefined)).toBeNull();
    expect(window.IKF).toBeUndefined();
  });

  it('emits page_load and builds events from __IKF, location and the funnel detail', () => {
    boot(IKF());
    window.dispatchEvent(new CustomEvent('ikfunnel:answer', { detail: { screen: 4, data: { goal: 'sleep', email: 'a@b.co' } } }));
    window.IKF.flush();
    expect(posted.map((e) => e.name)).toEqual(['page_load', 'answer']);
    const [load, answer] = posted;
    expect(isUlid(load.id) && isUlid(load.sid) && isUlid(load.aid)).toBe(true);
    expect(answer).toMatchObject({
      sid: load.sid, aid: load.aid, t: clock, funnel: 'aivideo', v: 3, rev: 7, host: 'try.x.com', path: '/promo',
      screen: 4, props: { 'data.goal': 'sleep' }, attr: { utm_source: 'meta', fbclid: 'IwAR1' },
    });
    expect(JSON.stringify(posted)).not.toContain('a@b.co');
  });

  it('flushes on pagehide and when the page becomes hidden', () => {
    boot(IKF());
    window.dispatchEvent(new Event('pagehide'));
    expect(posted.map((e) => e.name)).toEqual(['page_load']);
    window.dispatchEvent(new CustomEvent('ikfunnel:lead'));
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
    delete document.visibilityState;
    expect(posted.map((e) => e.name)).toEqual(['page_load', 'lead']);
  });

  it('outside the consent region: loads the Pixel, sets cookies and fires mapped events with eventID', () => {
    boot(IKF());
    window.dispatchEvent(new CustomEvent('ikfunnel:lead', { detail: { data: { goal: 'x' } } }));
    window.dispatchEvent(new CustomEvent('ikfunnel:checkout_click', { detail: { plan: 'w4', value: 19.99, currency: 'EUR' } }));
    window.dispatchEvent(new CustomEvent('ikfunnel:screen_view', { detail: { screen: 2 } }));
    window.IKF.flush();
    const id = (name) => posted.find((e) => e.name === name).id;
    expect(pixelScripts()).toHaveLength(1);
    expect(fbqCalls()).toEqual([
      ['set', 'autoConfig', false, '123456789012345'],
      ['init', '123456789012345'],
      ['track', 'PageView', {}, { eventID: id('page_load') }],
      ['track', 'Lead', {}, { eventID: id('lead') }],
      ['track', 'InitiateCheckout', { value: 19.99, currency: 'EUR' }, { eventID: id('checkout_click') }],
    ]);
    expect(document.cookie).toMatch(/_fbc=fb\.1\.\d+\.IwAR1/);
    expect(document.cookie).toMatch(/_fbp=fb\.1\.\d+\.\d{10}/);
  });

  it('blocks funnels calling window.fbq directly with their answers', () => {
    boot(IKF());
    window.fbq('trackCustom', 'answer', { goal: 'sleep', email: 'a@b.co' });
    expect(fbqCalls().some((c) => c[0] === 'trackCustom')).toBe(false);
  });

  it('in the EEA: no Pixel, no ad cookies, aid null and a banner until the visitor accepts', () => {
    boot(IKF({ country: 'DE' }));
    window.IKF.flush();
    expect(window.fbq).toBeUndefined();
    expect(pixelScripts()).toHaveLength(0);
    expect(document.cookie).not.toContain('_fbp');
    expect(posted[0].aid).toBeNull();
    expect(window.IKF.attribution()).toMatchObject({ fbc: null, fbp: null, aid: null, utm_source: 'meta' });

    document.getElementById('ikf-consent').shadowRoot.querySelector('[data-c="granted"]').click();
    expect(window.localStorage.getItem('ikf_consent')).toBe('granted');
    expect(fbqCalls()).toContainEqual(['track', 'PageView', {}, { eventID: posted[0].id }]);
    window.dispatchEvent(new CustomEvent('ikfunnel:lead'));
    window.IKF.flush();
    expect(isUlid(posted[1].aid)).toBe(true);
    expect(window.IKF.attribution().fbc).toMatch(/IwAR1$/);
  });

  it('in the EEA after Decline: stays off, and the banner does not return', () => {
    boot(IKF({ country: 'FR' }));
    document.getElementById('ikf-consent').shadowRoot.querySelector('[data-c="denied"]').click();
    expect(window.fbq).toBeUndefined();
    delete window.IKF;
    document.body.innerHTML = '';
    boot(IKF({ country: 'FR' }));
    expect(document.getElementById('ikf-consent')).toBeNull();
  });

  it('a stored grant in the EEA enables ads without a banner', () => {
    window.localStorage.setItem('ikf_consent', 'granted');
    boot(IKF({ country: 'DE' }));
    expect(document.getElementById('ikf-consent')).toBeNull();
    expect(window.fbq).toBeTypeOf('function');
  });

  it.each([
    ['preview', { preview: true }],
    ['no pixel configured', { pixel: null }],
    ['malformed pixel id', { pixel: '12ab' }],
  ])('never loads the Pixel for %s, but still sends analytics', (_n, extra) => {
    boot(IKF(extra));
    window.IKF.flush();
    expect(window.fbq).toBeUndefined();
    expect(posted.map((e) => e.name)).toEqual(['page_load']);
  });

  it('keeps one session id per tab and one aid per browser', () => {
    boot(IKF());
    const first = window.IKF.attribution();
    delete window.IKF;
    boot(IKF());
    expect(window.IKF.attribution()).toMatchObject({ sid: first.sid, aid: first.aid });
  });

  it('IKF.attribution returns attribution, cookies and ids for checkout', () => {
    boot(IKF());
    expect(window.IKF.attribution()).toEqual({
      utm_source: 'meta', fbclid: 'IwAR1',
      fbc: expect.stringMatching(/^fb\.1\.\d+\.IwAR1$/), fbp: expect.stringMatching(/^fb\.1\.\d+\.\d{10}$/),
      sid: expect.any(String), aid: expect.any(String),
    });
  });
});

describe('never breaks the funnel', () => {
  it('start() swallows SDK errors and runs only once', () => {
    window.__IKF = IKF();
    const broken = new Proxy(window, { get: (t, k) => (k === 'document' ? undefined : Reflect.get(t, k)) });
    expect(() => start(broken)).not.toThrow();
    window.IKF = { marker: 1 };
    expect(start(window)).toEqual({ marker: 1 });
  });

  it('funnel events still reach page listeners when the transport throws', () => {
    window.happyDOM.setURL('https://try.x.com/');
    window.__IKF = IKF({ pixel: null });
    createSdk(window, { transport: () => { throw new Error('down'); }, setTimer: () => 1, clearTimer: () => {} });
    const seen = vi.fn();
    window.addEventListener('ikfunnel:lead', seen);
    expect(() => window.dispatchEvent(new CustomEvent('ikfunnel:lead'))).not.toThrow();
    expect(() => window.IKF.flush()).not.toThrow();
    expect(seen).toHaveBeenCalledTimes(1);
  });

  it('works with storage blocked', () => {
    const real = Object.getOwnPropertyDescriptor(window, 'sessionStorage');
    Object.defineProperty(window, 'sessionStorage', { configurable: true, get() { throw new Error('denied'); } });
    try {
      boot(IKF({ pixel: null }));
      window.IKF.flush();
      expect(posted.map((e) => e.name)).toEqual(['page_load']);
    } finally {
      if (real) Object.defineProperty(window, 'sessionStorage', real);
      else delete window.sessionStorage;
    }
  });
});

describe('checkoutParams', () => {
  it.each([
    [{ value: 9.99, currency: 'USD' }, { value: 9.99, currency: 'USD' }],
    [{ price: '19.99' }, { value: 19.99, currency: 'USD' }],
    [{ amount: 5, currency: 'eur' }, { value: 5, currency: 'USD' }],
    [{ price: '$9.99' }, {}], [{ value: 0 }, {}], [{ value: -1 }, {}], [null, {}],
  ])('%j -> %j', (d, want) => expect(checkoutParams(d)).toEqual(want));
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run: `npm test -w @ikf/sdk`
Expected: FAIL, không load được `../src/index.js`.

- [ ] **Step 3: Implement**

`packages/sdk/src/pixel.js`:

```js
export const PIXEL_SRC = 'https://connect.facebook.net/en_US/fbevents.js';
const META_EVENTS = { page_load: 'PageView', lead: 'Lead', checkout_click: 'InitiateCheckout' };

// value/currency only when the funnel gave a usable number; nothing else ever reaches Meta.
export function checkoutParams(detail) {
  const d = detail && typeof detail === 'object' ? detail : {};
  const raw = d.value ?? d.price ?? d.amount;
  const value =
    typeof raw === 'number' ? raw : typeof raw === 'string' && /^\d+(\.\d+)?$/.test(raw.trim()) ? Number(raw) : NaN;
  if (!Number.isFinite(value) || value <= 0) return {};
  const currency = typeof d.currency === 'string' && /^[A-Z]{3}$/.test(d.currency) ? d.currency : 'USD';
  return { value, currency };
}

export function createPixel(win, cfg) {
  const enabled = typeof cfg.pixel === 'string' && /^[0-9]{6,20}$/.test(cfg.pixel) && !cfg.preview;
  let fbq = null;
  let allow = false;

  const call = (...args) => {
    allow = true;
    try {
      fbq(...args);
    } finally {
      allow = false;
    }
  };

  function load() {
    if (!enabled || fbq) return false;
    try {
      // Meta's stub, gated: funnels call window.fbq('trackCustom', name, answers) when fbq exists,
      // and those calls must not reach Meta. Only calls made through call() pass.
      const n = function fbqGate() {
        if (!allow) return;
        if (n.callMethod) n.callMethod.apply(n, arguments);
        else n.queue.push(arguments);
      };
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      n.disablePushState = true; // funnels use pushState per screen; no automatic PageViews
      win.fbq = n;
      win._fbq = n;
      fbq = n;
      call('set', 'autoConfig', false, cfg.pixel); // no automatic button/metadata events
      call('init', cfg.pixel);
      const s = win.document.createElement('script');
      s.async = true;
      s.src = PIXEL_SRC;
      (win.document.head || win.document.documentElement).appendChild(s);
      return true;
    } catch {
      return false;
    }
  }

  function fire(ev, detail) {
    const name = META_EVENTS[ev.name];
    if (!fbq || !name) return;
    try {
      call('track', name, name === 'InitiateCheckout' ? checkoutParams(detail) : {}, { eventID: ev.id });
    } catch {
      // Pixel errors never affect the funnel or analytics
    }
  }

  return {
    load,
    fire,
    get loaded() {
      return fbq !== null;
    },
  };
}
```

`packages/sdk/src/index.js`:

```js
import { buildProps, isUlid, screenOf } from '@ikf/event-schema';
import { captureAttribution, readCookie, setAdCookies } from './attribution.js';
import { installCapture } from './capture.js';
import { needsConsent, readConsent, saveConsent, showBanner } from './consent.js';
import { createPixel } from './pixel.js';
import { createQueue } from './queue.js';
import { safeStorage } from './storage.js';
import { createTransport } from './transport.js';
import { ulid } from './ulid.js';

const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export function createSdk(win, deps = {}) {
  const cfg = win.__IKF;
  if (!cfg || typeof cfg.funnel !== 'string') return null;
  const now = deps.now || (() => Date.now());
  const doc = win.document;
  const session = safeStorage(() => win.sessionStorage);
  const local = safeStorage(() => win.localStorage);

  let sid = session.get('ikf_sid');
  if (!isUlid(sid)) {
    sid = ulid(now());
    session.set('ikf_sid', sid);
  }
  const attr = captureAttribution(win.location.search, session);
  const consent = { required: needsConsent(cfg.country), value: readConsent(local) };
  const adsAllowed = () => !consent.required || consent.value === 'granted';

  function getAid() {
    if (!adsAllowed()) return null;
    const [id, exp] = (local.get('ikf_aid') || '').split('.');
    if (isUlid(id) && Number(exp) > now()) return id;
    const fresh = ulid(now());
    local.set('ikf_aid', `${fresh}.${now() + YEAR_MS}`);
    return fresh;
  }

  const queue = createQueue({
    transport: deps.transport || createTransport(win),
    storage: session,
    setTimer: deps.setTimer || ((fn, ms) => win.setTimeout(fn, ms)),
    clearTimer: deps.clearTimer || ((id) => win.clearTimeout(id)),
  });
  const pixel = createPixel(win, cfg);
  let pageLoad = null;

  function track(name, detail) {
    const ev = {
      id: ulid(now()),
      sid,
      aid: getAid(),
      t: now(),
      name,
      funnel: cfg.funnel,
      v: cfg.v,
      rev: cfg.rev,
      host: win.location.hostname,
      path: win.location.pathname,
      screen: screenOf(detail),
      props: buildProps(detail),
      attr,
    };
    queue.push(ev);
    if (adsAllowed()) pixel.fire(ev, detail);
    return ev;
  }

  function enableAds() {
    setAdCookies(doc, attr, now);
    if (pixel.load() && pageLoad) pixel.fire(pageLoad, {});
  }

  const safeTrack = (name, detail) => {
    try {
      track(name, detail);
    } catch {
      // never break the funnel
    }
  };

  installCapture(win, safeTrack, now);
  if (adsAllowed()) enableAds();
  pageLoad = track('page_load', {});
  if (consent.required && consent.value === null) {
    showBanner(win, (choice) => {
      consent.value = choice;
      saveConsent(local, choice);
      if (choice === 'granted') enableAds();
    });
  }

  doc.addEventListener('visibilitychange', () => {
    if (doc.visibilityState === 'hidden') queue.flush();
  });
  win.addEventListener('pagehide', () => queue.flush());

  const api = {
    attribution: () => ({ ...attr, fbc: readCookie(doc, '_fbc'), fbp: readCookie(doc, '_fbp'), sid, aid: getAid() }),
    flush: () => queue.flush(),
  };
  win.IKF = api;
  return api;
}

export function start(win, deps) {
  try {
    if (win.IKF) return win.IKF;
    return createSdk(win, deps);
  } catch {
    return null;
  }
}
```

`packages/sdk/src/entry.js`:

```js
import { start } from './index.js';

start(window);
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

Run: `npm test -w @ikf/sdk`
Expected: `Tests  90 passed (90)`.

- [ ] **Step 5: Commit**

```bash
git add packages/sdk
git commit -m "feat(sdk): gated Meta Pixel with eventIDs and createSdk wiring"
```

---

### Task 5: Build SDK → module cho Worker, giới hạn 8KB gzip

**Quyết định:** `workers/edge-router/src/sdk-bundle.generated.js` và `packages/sdk/dist/` **không commit**. `@ikf/edge-router` có `pretest` build SDK; CI build trước test và trước `wrangler deploy` (Task 12). Như vậy Worker luôn serve đúng SDK của commit đang deploy.

**Files:**
- Create: `packages/sdk/scripts/build.mjs`
- Test: `packages/sdk/test/build.test.js`
- Modify: `packages/sdk/package.json` (script `build`, devDependency `esbuild`), `workers/edge-router/package.json` (`pretest`), `.gitignore`

**Interfaces:**
- Consumes: `packages/sdk/src/entry.js` (Task 4).
- Produces (dùng ở Task 8, 12, 13):
  - `buildSdk({write = true}): Promise<{code: string, hash: string /* 12 hex */, gzipBytes: number}>`, `MAX_GZIP_BYTES = 8192`, `DIST_FILE`, `GENERATED_FILE`
  - File sinh ra `workers/edge-router/src/sdk-bundle.generated.js`: `export const SDK_HASH: string; export const SDK_SOURCE: string;`
  - Lệnh: `node packages/sdk/scripts/build.mjs` (in `ikf sdk <hash>: <n> bytes gzip`, exit 1 nếu > 8192)

- [ ] **Step 1: Cài esbuild, viết test fail**

```bash
npm install -D -w @ikf/sdk esbuild@^0.25
mkdir -p packages/sdk/scripts
npm pkg set -w @ikf/sdk scripts.build="node scripts/build.mjs"
```

`packages/sdk/test/build.test.js`:

```js
// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { buildSdk, MAX_GZIP_BYTES } from '../scripts/build.mjs';

describe('SDK bundle', () => {
  it('fits the 8KB gzip budget and has a stable 12-hex content hash', async () => {
    const a = await buildSdk({ write: false });
    const b = await buildSdk({ write: false });
    expect(a.gzipBytes).toBeLessThanOrEqual(MAX_GZIP_BYTES);
    expect(a.hash).toMatch(/^[0-9a-f]{12}$/);
    expect(b.hash).toBe(a.hash);
  });

  it('is a self-contained script with no imports and no non-ASCII bytes', async () => {
    const { code } = await buildSdk({ write: false });
    expect(code).not.toMatch(/\bimport\s*[{(*"']/);
    expect(code).not.toMatch(/[^\x00-\x7f]/);
    expect(code).toContain('ikfunnel:');
  });
});
```

Run: `npm test -w @ikf/sdk`
Expected: FAIL, không load được `../scripts/build.mjs`.

- [ ] **Step 2: Implement**

`packages/sdk/scripts/build.mjs`:

```js
#!/usr/bin/env node
// Bundles the SDK and writes the module the edge-router Worker serves it from.
//   node packages/sdk/scripts/build.mjs   (also run by edge-router's pretest and by CI before deploy)
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { build } from 'esbuild';

export const MAX_GZIP_BYTES = 8192;
const here = (p) => fileURLToPath(new URL(p, import.meta.url));
export const DIST_FILE = here('../dist/ikf.min.js');
export const GENERATED_FILE = here('../../../workers/edge-router/src/sdk-bundle.generated.js');

export async function buildSdk({ write = true } = {}) {
  const out = await build({
    entryPoints: [here('../src/entry.js')],
    bundle: true,
    minify: true,
    format: 'iife',
    target: ['es2018'],
    charset: 'ascii',
    legalComments: 'none',
    write: false,
  });
  const code = out.outputFiles[0].text;
  const hash = createHash('sha256').update(code).digest('hex').slice(0, 12);
  const gzipBytes = gzipSync(code, { level: 9 }).length;
  if (write) {
    await mkdir(dirname(DIST_FILE), { recursive: true });
    await writeFile(DIST_FILE, code);
    await writeFile(
      GENERATED_FILE,
      `// Generated by packages/sdk/scripts/build.mjs. Do not edit, do not commit.\nexport const SDK_HASH = ${JSON.stringify(hash)};\nexport const SDK_SOURCE = ${JSON.stringify(code)};\n`,
    );
  }
  return { code, hash, gzipBytes };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { hash, gzipBytes } = await buildSdk();
  console.log(`ikf sdk ${hash}: ${gzipBytes} bytes gzip`);
  if (gzipBytes > MAX_GZIP_BYTES) {
    console.error(`SDK is over the ${MAX_GZIP_BYTES}-byte gzip budget`);
    process.exit(1);
  }
}
```

- [ ] **Step 3: Chạy test + build**

Run:
```bash
npm test -w @ikf/sdk
node packages/sdk/scripts/build.mjs
```
Expected: `Tests  92 passed (92)`; build in `ikf sdk <12 hex>: ~4900 bytes gzip` (lúc viết plan: 4923), tạo `packages/sdk/dist/ikf.min.js` và `workers/edge-router/src/sdk-bundle.generated.js`.

- [ ] **Step 4: Không commit file sinh ra; edge-router tự build trước test**

Thêm vào cuối `.gitignore`:

```
packages/sdk/dist/
workers/edge-router/src/sdk-bundle.generated.js
```

```bash
npm pkg set -w @ikf/edge-router scripts.pretest="node ../../packages/sdk/scripts/build.mjs"
rm workers/edge-router/src/sdk-bundle.generated.js
npm test -w @ikf/edge-router
git status --short
```
Expected: `pretest` in `ikf sdk …`, rồi `Tests  28 passed (28)` (test cũ chưa dùng SDK); `git status` không liệt kê `sdk-bundle.generated.js` hay `dist/`.

- [ ] **Step 5: Commit**

```bash
git add .gitignore package-lock.json packages/sdk workers/edge-router/package.json
git commit -m "build(sdk): esbuild bundle with content hash and 8KB gzip budget; edge-router builds it before tests"
```

---

### Task 6: core-api — `funnels.pixel_id`, `PUT /v1/funnels/:slug`, `pixel` trong KV

**Files:**
- Create: `services/core-api/migrations/002_funnel_pixel.sql`
- Create: `services/core-api/src/publisher/funnels.js`, `services/core-api/src/http/funnels.js`
- Modify: `services/core-api/src/app.js`, `services/core-api/src/publisher/routes.js` (`syncHost`)
- Test: `services/core-api/test/funnels.test.js` (mới); sửa `test/migrate.test.js`, `test/routes.test.js`, `test/resync.test.js`

**Interfaces:**
- Consumes: `syncHost`, `PROPAGATION_SECONDS` (`src/publisher/routes.js`), `requireRole`, `HttpError`, test helpers `startDb/resetDb/makeApp/tokenFor/bearer/seedVersions`, `fakeKv().fail()/doc()`.
- Produces:
  - Cột `funnels.pixel_id TEXT NULL`, constraint `funnels_pixel_id_check` (`^[0-9]{6,20}$`).
  - KV route: `{prefix, bundle, funnel, v, pixel}` (`pixel: string | null`) — Worker đọc ở Task 8.
  - `setFunnelPixel(pool, kv, {slug, pixelId: string|null, log}) → {funnel, pixel_id, hosts: string[], synced: number, kv_sync: 'ok'|'pending', propagation_seconds: 90}`; `PIXEL_RE`.
  - `PUT /v1/funnels/:slug` (role `router`, admin cũng được), body `{"pixel_id": "<6-20 chữ số>" | null}` → `200` với object trên; `404 {"error":"funnel_not_found","detail":{"funnel":slug}}`; `400 {"error":"invalid_pixel_id",...}`; thiếu `pixel_id` → `400 bad_request`. CLI dùng ở Task 7.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/funnels.test.js`:

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, tokenFor, bearer, seedVersions } from './helpers/app.js';
import { resyncPending } from '../src/publisher/resync.js';

const PIXEL = '123456789012345';
const silent = { warn: () => {}, error: () => {} };

describe('PUT /v1/funnels/:slug', () => {
  let db;
  let app;
  let kv;
  let store;
  let router;
  let admin;

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    ({ app, kv, store } = await makeApp(db.pool));
    router = await tokenFor(db.pool, 'router');
    admin = await tokenFor(db.pool, 'admin');
    for (const host of ['a.x.com', 'b.x.com', 'c.x.com']) {
      await app.inject({ method: 'PUT', url: `/v1/domains/${host}`, headers: bearer(admin), payload: { status: 'active' } });
    }
    await seedVersions(db.pool, store, 'aivideo', 2);
    await seedVersions(db.pool, store, 'other', 1);
    await route('a.x.com', '/', 'aivideo', 1);
    await route('b.x.com', '/ugc', 'aivideo', 2);
    await route('c.x.com', '/', 'other', 1);
  });
  afterEach(() => app.close());

  const route = (host, prefix, funnel, v) =>
    app.inject({ method: 'PUT', url: `/v1/routes/${host}`, headers: bearer(router), payload: { prefix, funnel, v } });
  const put = (slug, body, token = router) =>
    app.inject({ method: 'PUT', url: `/v1/funnels/${slug}`, headers: bearer(token), payload: body });

  it('stores the pixel and re-projects every host routing to any version of the funnel', async () => {
    const res = await put('aivideo', { pixel_id: PIXEL });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      funnel: 'aivideo', pixel_id: PIXEL, hosts: ['a.x.com', 'b.x.com'], synced: 2, kv_sync: 'ok', propagation_seconds: 90,
    });
    expect(kv.doc('a.x.com')).toEqual({
      rev: 2,
      routes: [{ prefix: '/', bundle: 'bundles/aivideo/v1/index.html', funnel: 'aivideo', v: 1, pixel: PIXEL }],
    });
    expect(kv.doc('b.x.com').routes[0].pixel).toBe(PIXEL);
    expect(kv.doc('c.x.com')).toEqual({ rev: 1, routes: [expect.objectContaining({ funnel: 'other', pixel: null })] });
  });

  it('null removes the pixel', async () => {
    await put('aivideo', { pixel_id: PIXEL });
    const res = await put('aivideo', { pixel_id: null });
    expect(res.json()).toMatchObject({ pixel_id: null, synced: 2, kv_sync: 'ok' });
    expect(kv.doc('a.x.com').routes[0].pixel).toBeNull();
  });

  it('a funnel without routes is saved and syncs nothing', async () => {
    await seedVersions(db.pool, store, 'lonely', 1);
    expect((await put('lonely', { pixel_id: PIXEL })).json()).toMatchObject({ hosts: [], synced: 0, kv_sync: 'ok' });
    const { rows } = await db.pool.query("SELECT pixel_id FROM funnels WHERE slug = 'lonely'");
    expect(rows[0].pixel_id).toBe(PIXEL);
  });

  it('404 for an unknown funnel', async () => {
    const res = await put('nope', { pixel_id: PIXEL });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({ error: 'funnel_not_found', detail: { funnel: 'nope' } });
  });

  it.each(['12345', '123456789012345678901', '12ab56', ''])('400 for pixel_id %j', async (pixel) => {
    const res = await put('aivideo', { pixel_id: pixel });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe('invalid_pixel_id');
  });

  it('400 when pixel_id is missing', async () => {
    expect((await put('aivideo', {})).statusCode).toBe(400);
  });

  it('reports pending when KV is down, and the resync job finishes the projection', async () => {
    kv.fail();
    const res = await put('aivideo', { pixel_id: PIXEL });
    expect(res.json()).toMatchObject({ synced: 0, kv_sync: 'pending' });
    kv.fail(false);
    expect(await resyncPending(db.pool, kv, silent)).toEqual(['a.x.com', 'b.x.com']);
    expect(kv.doc('a.x.com').routes[0].pixel).toBe(PIXEL);
  });

  it('only router or admin may set it', async () => {
    const publisher = await tokenFor(db.pool, 'publisher');
    expect((await put('aivideo', { pixel_id: PIXEL }, publisher)).statusCode).toBe(403);
    expect((await put('aivideo', { pixel_id: PIXEL }, admin)).statusCode).toBe(200);
  });
});
```

`services/core-api/test/migrate.test.js` (thay toàn bộ):

```js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startDb } from './helpers/db.js';
import { migrate } from '../src/db/migrate.js';

describe('migrate', () => {
  let db;
  beforeAll(async () => {
    db = await startDb({ migrate: false });
  });
  afterAll(() => db.stop());

  it('applies the publisher schema once and is idempotent', async () => {
    expect(await migrate(db.pool)).toEqual(['001_publisher.sql', '002_funnel_pixel.sql']);
    expect(await migrate(db.pool)).toEqual([]);
    const { rows } = await db.pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY 1",
    );
    expect(rows.map((r) => r.table_name)).toEqual([
      'api_tokens', 'domains', 'funnels', 'host_revs', 'route_events', 'routes', 'schema_migrations', 'versions',
    ]);
  });

  it('rejects slugs that are not url-safe', async () => {
    await expect(
      db.pool.query("INSERT INTO funnels (slug, created_by) VALUES ('Bad Slug', 't')"),
    ).rejects.toThrow(/funnels_slug_check/);
  });

  it('rejects pixel ids that are not 6-20 digits', async () => {
    await expect(
      db.pool.query("INSERT INTO funnels (slug, created_by, pixel_id) VALUES ('px-bad', 't', '12ab')"),
    ).rejects.toThrow(/funnels_pixel_id_check/);
    await db.pool.query("INSERT INTO funnels (slug, created_by, pixel_id) VALUES ('px-ok', 't', '123456')");
  });

  it('rejects unknown domain statuses', async () => {
    await expect(
      db.pool.query("INSERT INTO domains (host, status) VALUES ('x.test', 'paused')"),
    ).rejects.toThrow(/domains_status_check/);
  });

  it('runs concurrent migrators without applying anything twice', async () => {
    const results = await Promise.all([migrate(db.pool), migrate(db.pool), migrate(db.pool)]);
    expect(results.flat()).toEqual([]);
  });
});
```

`services/core-api/test/routes.test.js`, test đầu tiên: KV route giờ có `pixel`. Thay dòng

```js
      routes: [{ prefix: '/tiktok-ugc', bundle: 'bundles/aivideo/v3/index.html', funnel: 'aivideo', v: 3 }],
```
bằng
```js
      routes: [{ prefix: '/tiktok-ugc', bundle: 'bundles/aivideo/v3/index.html', funnel: 'aivideo', v: 3, pixel: null }],
```

`services/core-api/test/resync.test.js`: thay dòng

```js
      routes: [{ prefix: '/', bundle: 'bundles/aivideo/v1/index.html', funnel: 'aivideo', v: 1 }],
```
bằng
```js
      routes: [{ prefix: '/', bundle: 'bundles/aivideo/v1/index.html', funnel: 'aivideo', v: 1, pixel: null }],
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run:
```bash
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock
npm test -w @ikf/core-api
```
Expected: FAIL — `migrate` thiếu `002_funnel_pixel.sql`, `routes`/`resync` thiếu `pixel`, `funnels.test.js` nhận `404` cho `PUT /v1/funnels/aivideo`.

- [ ] **Step 3: Implement**

`services/core-api/migrations/002_funnel_pixel.sql`:

```sql
ALTER TABLE funnels
  ADD COLUMN pixel_id TEXT NULL CONSTRAINT funnels_pixel_id_check CHECK (pixel_id ~ '^[0-9]{6,20}$');
```

`services/core-api/src/publisher/routes.js`, trong `syncHost`: thay

```js
      `SELECT r.path_prefix AS prefix, v.r2_key AS bundle, f.slug AS funnel, v.n AS v
         FROM routes r JOIN versions v ON v.id = r.version_id JOIN funnels f ON f.id = v.funnel_id
        WHERE r.host = $1`,
```
bằng
```js
      `SELECT r.path_prefix AS prefix, v.r2_key AS bundle, f.slug AS funnel, v.n AS v, f.pixel_id AS pixel
         FROM routes r JOIN versions v ON v.id = r.version_id JOIN funnels f ON f.id = v.funnel_id
        WHERE r.host = $1`,
```

`services/core-api/src/publisher/funnels.js`:

```js
import { HttpError } from '../errors.js';
import { PROPAGATION_SECONDS, syncHost } from './routes.js';

export const PIXEL_RE = /^[0-9]{6,20}$/;

// Saves the pixel, bumps rev on every host routing to any version of the funnel (so the resync
// job re-projects them if KV fails now), then re-projects those hosts.
export async function setFunnelPixel(pool, kv, { slug, pixelId, log }) {
  if (pixelId !== null && !PIXEL_RE.test(pixelId)) throw new HttpError(400, 'invalid_pixel_id', { pixel_id: pixelId });
  const c = await pool.connect();
  let hosts;
  try {
    await c.query('BEGIN');
    const f = await c.query('UPDATE funnels SET pixel_id = $2 WHERE slug = $1 RETURNING id', [slug, pixelId]);
    if (!f.rows.length) throw new HttpError(404, 'funnel_not_found', { funnel: slug });
    hosts = (
      await c.query(
        `SELECT DISTINCT r.host FROM routes r JOIN versions v ON v.id = r.version_id
          WHERE v.funnel_id = $1 ORDER BY r.host`,
        [f.rows[0].id],
      )
    ).rows.map((r) => r.host);
    if (hosts.length) {
      // Same lock order as route changes (domains row first), host by host in a fixed order.
      await c.query('SELECT host FROM domains WHERE host = ANY($1) ORDER BY host FOR UPDATE', [hosts]);
      await c.query('UPDATE host_revs SET rev = rev + 1 WHERE host = ANY($1)', [hosts]);
    }
    await c.query('COMMIT');
  } catch (err) {
    await c.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    c.release();
  }

  let synced = 0;
  for (const host of hosts) {
    try {
      await syncHost(pool, kv, host);
      synced += 1;
    } catch (err) {
      log?.warn({ host, err: err.message }, 'kv sync failed; resync job will retry');
    }
  }
  return {
    funnel: slug,
    pixel_id: pixelId,
    hosts,
    synced,
    kv_sync: synced === hosts.length ? 'ok' : 'pending',
    propagation_seconds: PROPAGATION_SECONDS,
  };
}
```

`services/core-api/src/http/funnels.js`:

```js
import { requireRole } from '../auth.js';
import { setFunnelPixel } from '../publisher/funnels.js';

export default async function funnelsHttp(app, { pool, kv }) {
  app.put(
    '/v1/funnels/:slug',
    {
      onRequest: requireRole(pool, 'router'),
      schema: {
        params: {
          type: 'object',
          required: ['slug'],
          properties: { slug: { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{1,62}$' } },
        },
        body: {
          type: 'object',
          required: ['pixel_id'],
          properties: { pixel_id: { type: ['string', 'null'] } },
        },
      },
    },
    async (req) => setFunnelPixel(pool, kv, { slug: req.params.slug, pixelId: req.body.pixel_id, log: req.log }),
  );
}
```

`services/core-api/src/app.js`: thêm import sau dòng `import domainsHttp from './http/domains.js';`

```js
import funnelsHttp from './http/funnels.js';
```
và đăng ký ngay sau `if (deps?.kv) app.register(routesHttp, deps);`:

```js
  if (deps?.kv) app.register(funnelsHttp, deps);
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

Run: `npm test -w @ikf/core-api`
Expected: `Test Files  11 passed (11)`, `Tests  104 passed (104)`.

- [ ] **Step 5: Commit**

```bash
git add services/core-api
git commit -m "feat(core-api): per-funnel Meta pixel id, PUT /v1/funnels/:slug re-projects routed hosts"
```

---

### Task 7: CLI `ikf funnel set <slug> --pixel <id> | --no-pixel`

**Files:**
- Modify: `packages/cli/src/api.js`, `packages/cli/src/main.js`
- Test: `packages/cli/test/funnel.test.js`

**Interfaces:**
- Consumes: `PUT /v1/funnels/:slug` (Task 6).
- Produces:
  - `api.setFunnel(slug, {pixel_id}) → {funnel, pixel_id, hosts, synced, kv_sync, propagation_seconds}` (retry như `setRoute`: idempotent).
  - Lệnh `ikf funnel set <slug> --pixel <id>` / `--no-pixel`. Output: `<slug>: pixel <id>` hoặc `<slug>: đã tắt pixel`, rồi `Đã đồng bộ <synced>/<n> host[: h1, h2].`, rồi dòng propagation hoặc `CẢNH BÁO: …`. Sai cách dùng → exit 2.

- [ ] **Step 1: Viết test fail**

`packages/cli/test/funnel.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { run } from '../src/main.js';
import { createApi } from '../src/api.js';

function io(api = {}) {
  const lines = [];
  const errors = [];
  return { lines, errors, opts: { out: (l) => lines.push(l), err: (l) => errors.push(l), env: {}, deps: { api } } };
}
const result = (extra = {}) => ({
  funnel: 'aivideo', pixel_id: '123456789012345', hosts: ['a.x.com', 'b.x.com'], synced: 2, kv_sync: 'ok', propagation_seconds: 90, ...extra,
});

describe('ikf funnel set', () => {
  it('--pixel sends the id and prints how many hosts were synced', async () => {
    const calls = [];
    const t = io({ setFunnel: async (slug, body) => { calls.push([slug, body]); return result(); } });
    expect(await run(['funnel', 'set', 'aivideo', '--pixel', '123456789012345'], t.opts)).toBe(0);
    expect(calls).toEqual([['aivideo', { pixel_id: '123456789012345' }]]);
    expect(t.lines).toEqual([
      'aivideo: pixel 123456789012345',
      'Đã đồng bộ 2/2 host: a.x.com, b.x.com.',
      'Có hiệu lực toàn cầu trong tối đa ~90 giây.',
    ]);
  });

  it('--no-pixel sends null', async () => {
    const calls = [];
    const t = io({ setFunnel: async (slug, body) => { calls.push(body); return result({ pixel_id: null, hosts: [], synced: 0 }); } });
    expect(await run(['funnel', 'set', 'aivideo', '--no-pixel'], t.opts)).toBe(0);
    expect(calls).toEqual([{ pixel_id: null }]);
    expect(t.lines).toEqual(['aivideo: đã tắt pixel', 'Đã đồng bộ 0/0 host.']);
  });

  it('warns when some hosts did not reach the edge', async () => {
    const t = io({ setFunnel: async () => result({ synced: 1, kv_sync: 'pending' }) });
    await run(['funnel', 'set', 'aivideo', '--pixel', '123456'], t.opts);
    expect(t.lines[1]).toBe('Đã đồng bộ 1/2 host: a.x.com, b.x.com.');
    expect(t.lines[2]).toMatch(/^CẢNH BÁO: có host CHƯA lên edge/);
  });

  it.each([
    [['funnel', 'set', 'aivideo'], 'cần đúng một trong --pixel <id> hoặc --no-pixel'],
    [['funnel', 'set', 'aivideo', '--pixel', '1', '--no-pixel'], 'cần đúng một trong --pixel <id> hoặc --no-pixel'],
    [['funnel', 'set', 'aivideo', '--pixel', '12ab56'], 'Pixel ID phải là 6-20 chữ số, nhận được "12ab56"'],
    [['funnel', 'set', 'Bad Slug', '--no-pixel'], 'slug không hợp lệ: "Bad Slug"'],
  ])('exits 2 on bad usage %j', async (argv, msg) => {
    const t = io({ setFunnel: async () => { throw new Error('must not be called'); } });
    expect(await run(argv, t.opts)).toBe(2);
    expect(t.errors).toEqual([msg]);
  });

  it('exits 2 with usage for an unknown funnel subcommand', async () => {
    const t = io();
    expect(await run(['funnel', 'rm', 'aivideo'], t.opts)).toBe(2);
    expect(t.errors[0]).toContain('ikf funnel set <slug> --pixel <id> | --no-pixel');
  });
});

describe('api.setFunnel', () => {
  it('PUTs /v1/funnels/:slug and retries on 503', async () => {
    const calls = [];
    const responses = [503, 200];
    const fetch = async (url, init) => {
      calls.push({ url, init });
      return new Response(JSON.stringify({ funnel: 'aivideo' }), { status: responses.shift() });
    };
    const api = createApi({ api: 'https://api.x', token: 't' }, { fetch, sleep: async () => {} });
    expect(await api.setFunnel('aivideo', { pixel_id: null })).toEqual({ funnel: 'aivideo' });
    expect(calls).toHaveLength(2);
    expect(calls[0].url).toBe('https://api.x/v1/funnels/aivideo');
    expect(calls[0].init.method).toBe('PUT');
    expect(JSON.parse(calls[0].init.body)).toEqual({ pixel_id: null });
  });
});
```

Run: `npm test -w @ikf/cli`
Expected: FAIL (`funnel` chưa phải lệnh → exit 2 với usage; `api.setFunnel is not a function`).

- [ ] **Step 2: Implement**

`packages/cli/src/api.js`: thêm vào object trả về, ngay sau `syncHost: …,`:

```js
    // Idempotent: setting the same pixel twice gives the same result.
    setFunnel: (slug, body) => call('PUT', `/v1/funnels/${slug}`, { body, retry: true }),
```

`packages/cli/src/main.js`:

1. Trong `USAGE`, thay dòng cuối `  ikf route sync <host>\`;` bằng:
```js
  ikf route sync <host>
  ikf funnel set <slug> --pixel <id> | --no-pixel`;
```
2. Thêm ngay trước `async function routeCommand(`:
```js
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,62}$/;
const PIXEL_RE = /^[0-9]{6,20}$/;

async function funnelCommand(api, sub, args, values, out) {
  const slug = args[0];
  if (sub !== 'set' || !slug) throw new UsageError(USAGE);
  if (!SLUG_RE.test(slug)) throw new UsageError(`slug không hợp lệ: "${slug}"`);
  if ((values.pixel === undefined) === !values['no-pixel']) throw new UsageError('cần đúng một trong --pixel <id> hoặc --no-pixel');
  if (values.pixel !== undefined && !PIXEL_RE.test(values.pixel)) throw new UsageError(`Pixel ID phải là 6-20 chữ số, nhận được "${values.pixel}"`);
  const r = await api.setFunnel(slug, { pixel_id: values['no-pixel'] ? null : values.pixel });
  out(r.pixel_id ? `${r.funnel}: pixel ${r.pixel_id}` : `${r.funnel}: đã tắt pixel`);
  out(`Đã đồng bộ ${r.synced}/${r.hosts.length} host${r.hosts.length ? `: ${r.hosts.join(', ')}` : ''}.`);
  if (r.kv_sync === 'pending') {
    out('CẢNH BÁO: có host CHƯA lên edge (KV lỗi). Hệ thống tự thử lại mỗi phút, hoặc chạy: ikf route sync <host>');
  } else if (r.hosts.length) {
    out(`Có hiệu lực toàn cầu trong tối đa ~${r.propagation_seconds} giây.`);
  }
  return 0;
}
```
3. Trong `parseArgs` `options`, sau `yes: { type: 'boolean', default: false },` thêm:
```js
        pixel: { type: 'string' },
        'no-pixel': { type: 'boolean', default: false },
```
4. Thay `if (cmd !== 'route' && cmd !== 'publish') throw new UsageError(USAGE);` bằng:
```js
    if (!['route', 'publish', 'funnel'].includes(cmd)) throw new UsageError(USAGE);
```
5. Thay `return await routeCommand(api, sub, rest, values, out);` bằng:
```js
    if (cmd === 'funnel') return await funnelCommand(api, sub, rest, values, out);
    return await routeCommand(api, sub, rest, values, out);
```

- [ ] **Step 3: Chạy test, xác nhận PASS**

Run: `npm test -w @ikf/cli`
Expected: `Tests  55 passed (55)` (46 cũ + 9 mới).

- [ ] **Step 4: Commit**

```bash
git add packages/cli
git commit -m "feat(cli): ikf funnel set --pixel/--no-pixel"
```

---

### Task 8: edge-router — `__IKF.country/pixel`, chèn script SDK, `GET /_ikf/sdk.<hash>.js`

**Files:**
- Create: `workers/edge-router/src/sdk.js`
- Modify: `workers/edge-router/src/inject.js`, `workers/edge-router/src/index.js`
- Test: `workers/edge-router/test/sdk.test.js` (mới); thay `test/inject.test.js`, `test/router.test.js`

**Interfaces:**
- Consumes: `SDK_HASH`, `SDK_SOURCE` từ `src/sdk-bundle.generated.js` (Task 5, sinh bởi `pretest`); KV route `pixel` (Task 6).
- Produces:
  - `injectIkf(html, {funnel, v, rev, country = null, pixel = null, preview}, {sdkSrc}): string` — chèn `<script>window.__IKF={"funnel","v","rev","country","pixel"[,"preview":true]}</script><script src="<sdkSrc>"></script>`. Task 13 dùng lại hàm này cho server local.
  - `SDK_PATH = '/_ikf/sdk.<SDK_HASH>.js'`, `sdkResponse(request, url): Response`.
  - Mọi path `/_ikf/*` được xử lý **trước** kiểm tra method và KV (Task 9 thêm `/_ikf/c`).
  - `country` = `request.cf.country` hoặc `null`; preview luôn `pixel: null`.

- [ ] **Step 1: Viết test fail**

`workers/edge-router/test/inject.test.js` (thay toàn bộ):

```js
import { describe, it, expect } from 'vitest';
import { injectIkf } from '../src/inject.js';

const T = { funnel: 'aivideo', v: 3, rev: 7, country: 'VN', pixel: '123456789012345', preview: false };
const OPTS = { sdkSrc: '/_ikf/sdk.0123456789ab.js' };
const SDK_TAG = '<script src="/_ikf/sdk.0123456789ab.js"></script>';
const TAG = `<script>window.__IKF={"funnel":"aivideo","v":3,"rev":7,"country":"VN","pixel":"123456789012345"}</script>${SDK_TAG}`;

describe('injectIkf', () => {
  it('goes right after <head>, keeping its attributes', () => {
    expect(injectIkf('<!doctype html><html><head lang="en"><title>x</title></head></html>', T, OPTS)).toBe(
      `<!doctype html><html><head lang="en">${TAG}<title>x</title></head></html>`,
    );
  });

  it('goes right after the doctype when there is no <head>', () => {
    expect(injectIkf('<!DOCTYPE html>\n<body><header>x</header></body>', T, OPTS)).toBe(
      `<!DOCTYPE html>${TAG}\n<body><header>x</header></body>`,
    );
  });

  it('goes first when there is neither <head> nor doctype', () => {
    expect(injectIkf('<body>x</body>', T, OPTS)).toBe(`${TAG}<body>x</body>`);
  });

  it('marks previews', () => {
    expect(injectIkf('<head></head>', { ...T, pixel: null, preview: true }, OPTS)).toBe(
      `<head><script>window.__IKF={"funnel":"aivideo","v":3,"rev":7,"country":"VN","pixel":null,"preview":true}</script>${SDK_TAG}</head>`,
    );
  });

  it('defaults country and pixel to null', () => {
    expect(injectIkf('', { funnel: 'a', v: 1, rev: 1 }, OPTS)).toBe(
      `<script>window.__IKF={"funnel":"a","v":1,"rev":1,"country":null,"pixel":null}</script>${SDK_TAG}`,
    );
  });

  it('cannot break out of the script element', () => {
    const out = injectIkf('<head></head>', { ...T, funnel: '</script><b>' }, OPTS);
    expect(out).not.toContain('</script><b>');
    expect(out).toContain('\\u003c/script>\\u003cb>');
  });
});
```

`workers/edge-router/test/router.test.js` (thay toàn bộ):

```js
import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { describe, it, expect, beforeEach } from 'vitest';
import worker from '../src/index.js';
import { resetRouteMemory } from '../src/routes.js';
import { SDK_HASH } from '../src/sdk-bundle.generated.js';

const SDK_TAG = `<script src="/_ikf/sdk.${SDK_HASH}.js"></script>`;

const HOST = 'try.aivideo.app';
const PREVIEW = 'preview.ikf-staging.example';
const page = (marker) => `<!doctype html><html><head><title>${marker}</title></head><body>${marker}</body></html>`;

async function call(url, init = {}, e = env) {
  const ctx = createExecutionContext();
  const res = await worker.fetch(new Request(url, init), e, ctx);
  await waitOnExecutionContext(ctx);
  return res;
}

beforeEach(async () => {
  resetRouteMemory();
  await env.ROUTES.put(
    `route:${HOST}`,
    JSON.stringify({
      rev: 7,
      routes: [
        { prefix: '/tiktok-ugc', bundle: 'bundles/aivideo/v3/index.html', funnel: 'aivideo', v: 3, pixel: '123456789012345' },
        { prefix: '/', bundle: 'bundles/aivideo/v2/index.html', funnel: 'aivideo', v: 2, pixel: null },
      ],
    }),
  );
  await env.BUNDLES.put('bundles/aivideo/v3/index.html', page('v3'));
  await env.BUNDLES.put('bundles/aivideo/v2/index.html', page('v2'));
});

describe('edge-router', () => {
  it.each([
    ['/tiktok-ugc?fbclid=abc&utm_source=fb', 'aivideo@3; rev=7'],
    ['/TikTok-UGC/', 'aivideo@3; rev=7'],
    ['/tiktok-ugc/step/2', 'aivideo@3; rev=7'],
    ['/tiktok-ugc-2', 'aivideo@2; rev=7'],
    ['/', 'aivideo@2; rev=7'],
  ])('%s -> %s', async (path, xikf) => {
    const res = await call(`https://${HOST}${path}`);
    expect(res.status).toBe(200);
    expect(res.headers.get('x-ikf')).toBe(xikf);
  });

  it('injects __IKF with country and pixel, then the SDK script, right after <head>', async () => {
    const res = await call(`https://${HOST}/tiktok-ugc`, { cf: { country: 'DE' } });
    expect(await res.text()).toBe(
      `<!doctype html><html><head><script>window.__IKF={"funnel":"aivideo","v":3,"rev":7,"country":"DE","pixel":"123456789012345"}</script>${SDK_TAG}<title>v3</title></head><body>v3</body></html>`,
    );
  });

  it('country is null when Cloudflare gives none, pixel null when the route has none', async () => {
    const res = await call(`https://${HOST}/`);
    expect(await res.text()).toContain('window.__IKF={"funnel":"aivideo","v":2,"rev":7,"country":null,"pixel":null}');
  });

  it('routes written before pixel existed still work', async () => {
    await env.ROUTES.put('route:old.example', JSON.stringify({ rev: 1, routes: [{ prefix: '/', bundle: 'bundles/aivideo/v2/index.html', funnel: 'aivideo', v: 2 }] }));
    expect(await (await call('https://old.example/')).text()).toContain('"pixel":null');
  });

  it('sets the funnel response headers', async () => {
    const res = await call(`https://${HOST}/`);
    expect(Object.fromEntries(res.headers)).toMatchObject({
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-cache',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'x-content-type-options': 'nosniff',
    });
    expect(res.headers.has('x-robots-tag')).toBe(false);
    expect(res.headers.has('content-security-policy')).toBe(false);
  });

  it('404 for an unknown host', async () => {
    const res = await call('https://unknown.example/');
    expect(res.status).toBe(404);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
  });

  it('404 when no prefix matches', async () => {
    await env.ROUTES.put('route:only-a.example', JSON.stringify({ rev: 1, routes: [{ prefix: '/a', bundle: 'x', funnel: 'f', v: 1 }] }));
    expect((await call('https://only-a.example/b')).status).toBe(404);
  });

  it('405 for methods other than GET and HEAD', async () => {
    const res = await call(`https://${HOST}/`, { method: 'POST' });
    expect(res.status).toBe(405);
    expect(res.headers.get('allow')).toBe('GET, HEAD');
  });

  it('HEAD returns the headers without a body', async () => {
    const res = await call(`https://${HOST}/`, { method: 'HEAD' });
    expect(res.status).toBe(200);
    expect(res.headers.get('x-ikf')).toBe('aivideo@2; rev=7');
    expect(await res.text()).toBe('');
  });

  it('serves from the edge cache once fetched, whatever the query string', async () => {
    await call(`https://${HOST}/tiktok-ugc?fbclid=1`);
    await env.BUNDLES.delete('bundles/aivideo/v3/index.html');
    const res = await call(`https://${HOST}/tiktok-ugc?fbclid=2`);
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('<title>v3</title>');
  });

  it('serves previews straight from R2 with noindex', async () => {
    const res = await call(`https://${PREVIEW}/aivideo/v3`);
    expect(res.status).toBe(200);
    expect(res.headers.get('x-robots-tag')).toBe('noindex');
    expect(res.headers.get('x-ikf')).toBe('aivideo@3; rev=0');
    expect(await res.text()).toContain('window.__IKF={"funnel":"aivideo","v":3,"rev":0,"country":null,"pixel":null,"preview":true}');
  });

  it.each(['/aivideo/v9', '/aivideo', '/', '/AIVIDEO/v3/x'])('404 for preview path %s', async (path) => {
    expect((await call(`https://${PREVIEW}${path}`)).status).toBe(404);
  });
});
```

`workers/edge-router/test/sdk.test.js`:

```js
import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { describe, it, expect, beforeEach } from 'vitest';
import worker from '../src/index.js';
import { resetRouteMemory } from '../src/routes.js';
import { SDK_HASH, SDK_SOURCE } from '../src/sdk-bundle.generated.js';

const HOST = 'try.aivideo.app';

async function call(url, init = {}) {
  const ctx = createExecutionContext();
  const res = await worker.fetch(new Request(url, init), env, ctx);
  await waitOnExecutionContext(ctx);
  return res;
}

beforeEach(async () => {
  resetRouteMemory();
  await env.ROUTES.put(`route:${HOST}`, JSON.stringify({ rev: 1, routes: [{ prefix: '/', bundle: 'b/x.html', funnel: 'aivideo', v: 1, pixel: null }] }));
  await env.BUNDLES.put('b/x.html', '<head></head>');
});

describe('GET /_ikf/sdk.<hash>.js', () => {
  it('serves the bundled SDK as immutable JavaScript on any routed host', async () => {
    const res = await call(`https://${HOST}/_ikf/sdk.${SDK_HASH}.js`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('text/javascript; charset=utf-8');
    expect(res.headers.get('cache-control')).toBe('public, max-age=31536000, immutable');
    expect(await res.text()).toBe(SDK_SOURCE);
  });

  it('script tag points at the SDK this Worker serves', async () => {
    const html = await (await call(`https://${HOST}/`)).text();
    const src = /<script src="([^"]+)"><\/script>/.exec(html)[1];
    expect((await call(`https://${HOST}${src}`)).status).toBe(200);
  });

  it('HEAD has headers and no body', async () => {
    const res = await call(`https://${HOST}/_ikf/sdk.${SDK_HASH}.js`, { method: 'HEAD' });
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('');
  });

  it('404 for another hash (an older deploy), never stale content', async () => {
    const other = SDK_HASH === '0'.repeat(12) ? '1'.repeat(12) : '0'.repeat(12);
    const res = await call(`https://${HOST}/_ikf/sdk.${other}.js`);
    expect(res.status).toBe(404);
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it.each(['/_ikf/sdk.js', '/_ikf/other', `/_ikf/sdk.${'f'.repeat(12)}.js/x`])('404 for %s', async (path) => {
    expect((await call(`https://${HOST}${path}`)).status).toBe(404);
  });

  it('405 for other methods', async () => {
    expect((await call(`https://${HOST}/_ikf/sdk.${SDK_HASH}.js`, { method: 'PUT' })).status).toBe(405);
  });

  it('is served even where no route matches (it does not depend on KV)', async () => {
    expect((await call(`https://unknown.example/_ikf/sdk.${SDK_HASH}.js`)).status).toBe(200);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run: `npm test -w @ikf/edge-router`
Expected: `pretest` build SDK, rồi FAIL: `inject.test.js` (thiếu `country`/script SDK), `router.test.js` (chuỗi `__IKF` cũ), `sdk.test.js` (`/_ikf/sdk…` trả 404 vì đi vào nhánh route).

- [ ] **Step 3: Implement**

`workers/edge-router/src/inject.js` (thay toàn bộ):

```js
const HEAD_OPEN = /<head(?:\s[^>]*)?>/i;
const DOCTYPE = /^\s*<!doctype[^>]*>/i;

// String insertion instead of HTMLRewriter: bundles are ≤1MB, and 21 of 67 funnels have no <head>.
// The SDK tag follows __IKF directly and is not async, so it runs before any funnel script.
export function injectIkf(html, { funnel, v, rev, country = null, pixel = null, preview }, { sdkSrc }) {
  const data = JSON.stringify({ funnel, v, rev, country, pixel, ...(preview && { preview: true }) }).replace(/</g, '\\u003c');
  const tag = `<script>window.__IKF=${data}</script><script src="${sdkSrc}"></script>`;
  const anchor = HEAD_OPEN.exec(html) ?? DOCTYPE.exec(html);
  if (!anchor) return tag + html;
  const at = anchor.index + anchor[0].length;
  return html.slice(0, at) + tag + html.slice(at);
}
```

`workers/edge-router/src/sdk.js`:

```js
import { errorResponse } from './responses.js';
import { SDK_HASH, SDK_SOURCE } from './sdk-bundle.generated.js';

export const SDK_PATH = `/_ikf/sdk.${SDK_HASH}.js`;
const SDK_PATH_RE = /^\/_ikf\/sdk\.([0-9a-f]{12})\.js$/;

// Only the SDK built into this deploy is served; any other hash is a 404, never stale content.
export function sdkResponse(request, url) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return errorResponse(request, 405, { allow: 'GET, HEAD' });
  const m = SDK_PATH_RE.exec(url.pathname);
  if (!m || m[1] !== SDK_HASH) return errorResponse(request, 404);
  return new Response(request.method === 'HEAD' ? null : SDK_SOURCE, {
    status: 200,
    headers: {
      'content-type': 'text/javascript; charset=utf-8',
      'cache-control': 'public, max-age=31536000, immutable',
      'x-content-type-options': 'nosniff',
    },
  });
}
```

`workers/edge-router/src/index.js` (thay toàn bộ; dòng `collect` thuộc Task 9 — ở task này **bỏ** dòng `import { collect } …` và dòng `if (url.pathname === '/_ikf/c') …`):

```js
import { matchRoute } from '@ikf/route-match';
import { getBundle } from './bundle.js';
import { collect } from './collector.js';
import { injectIkf } from './inject.js';
import { errorResponse, htmlResponse, log } from './responses.js';
import { getHostRoutes } from './routes.js';
import { SDK_PATH, sdkResponse } from './sdk.js';

const PREVIEW_PATH = /^\/([a-z0-9][a-z0-9-]{1,62})\/v([1-9]\d{0,8})\/?$/;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/_ikf/c') return collect(request, env);
    if (url.pathname.startsWith('/_ikf/')) return sdkResponse(request, url);
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return errorResponse(request, 405, { allow: 'GET, HEAD' });
    }
    const host = url.hostname.toLowerCase();
    const path = url.pathname;

    let target;
    if (host === env.PREVIEW_HOST) {
      const m = PREVIEW_PATH.exec(path);
      if (!m) return errorResponse(request, 404);
      target = { funnel: m[1], v: Number(m[2]), rev: 0, bundle: `bundles/${m[1]}/v${m[2]}/index.html`, pixel: null, preview: true };
    } else {
      let doc;
      try {
        doc = await getHostRoutes(env, host);
      } catch (err) {
        log({ host, path, status: 503, error: 'kv_unavailable', detail: err.message });
        return errorResponse(request, 503, { 'retry-after': '5' });
      }
      const route = doc && matchRoute(doc.routes, path);
      if (!route) return errorResponse(request, 404);
      target = { funnel: route.funnel, v: route.v, rev: doc.rev, bundle: route.bundle, pixel: route.pixel ?? null, preview: false };
    }

    const where = { host, path, funnel: target.funnel, v: target.v, rev: target.rev };
    let html;
    try {
      html = await getBundle(env, ctx, target.bundle);
    } catch (err) {
      log({ ...where, status: 502, error: 'bundle_unavailable', key: target.bundle, detail: err.message });
      return errorResponse(request, 502);
    }
    if (html === null) {
      if (target.preview) return errorResponse(request, 404);
      log({ ...where, status: 502, error: 'bundle_missing', key: target.bundle });
      return errorResponse(request, 502);
    }
    const country = typeof request.cf?.country === 'string' ? request.cf.country : null;
    return htmlResponse(request, injectIkf(html, { ...target, country }, { sdkSrc: SDK_PATH }), target);
  },
};
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

Run: `npm test -w @ikf/edge-router`
Expected: `Tests  40 passed (40)`.

- [ ] **Step 5: Commit**

```bash
git add workers/edge-router
git commit -m "feat(edge-router): inject SDK script after __IKF (country, pixel) and serve /_ikf/sdk.<hash>.js"
```

---

### Task 9: edge-router — collector `POST /_ikf/c` + Queue producer

**Files:**
- Create: `workers/edge-router/src/collector.js`
- Modify: `workers/edge-router/src/index.js` (2 dòng), `workers/edge-router/package.json` (dep `@ikf/event-schema`), `workers/edge-router/wrangler.json`, `workers/edge-router/vitest.config.js`, `workers/edge-router/scripts/render-config.mjs`
- Test: `workers/edge-router/test/collector.test.js`

**Interfaces:**
- Consumes: `validateEvent`, `scrubEvent`, `MAX_EVENTS`, `MAX_BODY_BYTES` (Task 1); `log` (`src/responses.js`).
- Produces:
  - `collect(request, env, now = Date.now()): Promise<Response>`; `uaClass(ua): 'mobile'|'desktop'|'inapp_fb'|'inapp_ig'|'inapp_tiktok'|'other'`; `ipHash(salt, now, ip): Promise<hex64>`.
  - Binding `env.EVENTS` (Queue producer `ikf-events-<env>`), secret `env.IP_SALT`.
  - Message Queue (`contentType: 'json'`), đầu vào của Task 10:
    ```json
    {"id","sid","aid","t","name","funnel","v","rev","host","path","screen","props":{},"attr":{},
     "received_at": 1791453600000, "country": "VN", "ua_class": "mobile", "ip_hash": "<64 hex>"}
    ```
  - Log JSON: `{path, error:'events_rejected', count}`, `{path, status:503, error:'queue_unavailable', detail, events}`, `{path, status:503, error:'ip_salt_missing'}`.

- [ ] **Step 1: Viết test fail**

`workers/edge-router/test/collector.test.js`:

```js
import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import worker from '../src/index.js';
import { collect, ipHash, uaClass } from '../src/collector.js';

const HOST = 'try.aivideo.app';
const NOW = Date.UTC(2026, 9, 8, 10, 0, 0);
const event = (extra = {}) => ({
  id: '01JA0000000000000000000001', sid: '01JA0000000000000000000002', aid: null, t: NOW - 1000,
  name: 'answer', funnel: 'aivideo', v: 3, rev: 7, host: HOST, path: '/promo', screen: 2,
  props: { 'data.goal': 'sleep' }, attr: { utm_source: 'meta' }, ...extra,
});

let sent;
let logSpy;
const queueEnv = (sendBatch) => ({ ...env, EVENTS: { sendBatch } });
const okEnv = () => queueEnv(async (msgs) => { sent.push(...msgs); });

function post(body, { headers = {}, cf = { country: 'VN' } } = {}) {
  return new Request(`https://${HOST}/_ikf/c`, {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: {
      'content-type': 'text/plain;charset=UTF-8',
      origin: `https://${HOST}`,
      'cf-connecting-ip': '203.0.113.7',
      'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148',
      ...headers,
    },
    cf,
  });
}
const logged = () => logSpy.mock.calls.map(([line]) => JSON.parse(line));

beforeEach(() => {
  sent = [];
  logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => logSpy.mockRestore());

describe('POST /_ikf/c', () => {
  it('validates, scrubs, enriches and queues each event, then answers 204', async () => {
    const res = await collect(post({ events: [event()] }), okEnv(), NOW);
    expect(res.status).toBe(204);
    expect(sent).toEqual([{
      contentType: 'json',
      body: {
        ...event(),
        received_at: NOW,
        country: 'VN',
        ua_class: 'mobile',
        ip_hash: 'f89c41f415a0bc039af202d11134abe7cc513c9ae60b2253ce17753ec8c77706',
      },
    }]);
    expect(JSON.stringify(sent)).not.toContain('203.0.113.7');
  });

  it('is wired into the Worker at /_ikf/c', async () => {
    const ctx = createExecutionContext();
    const res = await worker.fetch(post({ events: [event({ t: Date.now() })] }), okEnv(), ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(204);
    expect(sent).toHaveLength(1);
  });

  it('re-scrubs props and attr from a client that skipped the SDK filter', async () => {
    const dirty = event({ props: { 'data.email': 'a@b.co', note: 'call +1 (415) 555-0100', dob: '1990-01-02', plan: 'w4' }, attr: { utm_term: 'a@b.co' } });
    await collect(post({ events: [dirty] }), okEnv(), NOW);
    expect(sent[0].body.props).toEqual({ plan: 'w4' });
    expect(sent[0].body.attr).toEqual({});
  });

  it('drops invalid events one by one and still queues the rest', async () => {
    const res = await collect(post({ events: [event({ name: 'Bad Name' }), event({ t: NOW - 25 * 3600 * 1000 }), event({ id: 'x' }), event()] }), okEnv(), NOW);
    expect(res.status).toBe(204);
    expect(sent).toHaveLength(1);
    expect(logged()).toEqual([{ path: '/_ikf/c', error: 'events_rejected', count: 3 }]);
  });

  it('204 without queueing when every event is invalid', async () => {
    const sendBatch = vi.fn();
    expect((await collect(post({ events: [event({ funnel: 'X' })] }), queueEnv(sendBatch), NOW)).status).toBe(204);
    expect(sendBatch).not.toHaveBeenCalled();
  });

  it('accepts application/json too', async () => {
    expect((await collect(post({ events: [event()] }, { headers: { 'content-type': 'application/json' } }), okEnv(), NOW)).status).toBe(204);
  });

  it('uses XX when Cloudflare gives no country', async () => {
    await collect(post({ events: [event()] }, { cf: {} }), okEnv(), NOW);
    expect(sent[0].body.country).toBe('XX');
  });

  it.each([
    ['not JSON', '{'],
    ['no events array', { evts: [] }],
    ['empty events', { events: [] }],
    ['51 events', { events: Array.from({ length: 51 }, () => event()) }],
  ])('400 for %s', async (_n, body) => {
    expect((await collect(post(body), okEnv(), NOW)).status).toBe(400);
  });

  it('413 above 64KB, by content-length or by actual size', async () => {
    const big = JSON.stringify({ events: [event({ props: { x: 'y'.repeat(70000) } })] });
    expect((await collect(post(big), okEnv(), NOW)).status).toBe(413);
    const stream = new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode(big)); c.close(); } });
    const chunked = new Request(`https://${HOST}/_ikf/c`, {
      method: 'POST', body: stream, duplex: 'half', headers: { 'content-type': 'text/plain', origin: `https://${HOST}` },
    });
    expect((await collect(chunked, okEnv(), NOW)).status).toBe(413);
  });

  it.each([
    ['another origin', { origin: 'https://evil.example' }],
    ['origin "null"', { origin: 'null' }],
    ['neither origin nor referer', { origin: '' }],
    ['a referer from another host', { origin: '', referer: 'https://evil.example/x' }],
  ])('403 for %s', async (_n, headers) => {
    expect((await collect(post({ events: [event()] }, { headers }), okEnv(), NOW)).status).toBe(403);
  });

  it('falls back to the Referer host when there is no Origin', async () => {
    expect((await collect(post({ events: [event()] }, { headers: { origin: '', referer: `https://${HOST}/promo?x=1` } }), okEnv(), NOW)).status).toBe(204);
  });

  it('415 for other content types, 405 for other methods', async () => {
    expect((await collect(post({ events: [event()] }, { headers: { 'content-type': 'application/x-www-form-urlencoded' } }), okEnv(), NOW)).status).toBe(415);
    const get = await collect(new Request(`https://${HOST}/_ikf/c`), okEnv(), NOW);
    expect(get.status).toBe(405);
    expect(get.headers.get('allow')).toBe('POST');
  });

  it('503 and a queue_unavailable log when the Queue throws', async () => {
    const res = await collect(post({ events: [event()] }), queueEnv(async () => { throw new Error('queue down'); }), NOW);
    expect(res.status).toBe(503);
    expect(logged()).toEqual([{ path: '/_ikf/c', status: 503, error: 'queue_unavailable', detail: 'queue down', events: 1 }]);
  });

  it('503 when IP_SALT is not configured', async () => {
    const res = await collect(post({ events: [event()] }), { ...okEnv(), IP_SALT: undefined }, NOW);
    expect(res.status).toBe(503);
    expect(logged()[0].error).toBe('ip_salt_missing');
  });

  it('the real queue binding accepts the batch', async () => {
    expect((await collect(post({ events: [event()] }), env, NOW)).status).toBe(204);
  });
});

describe('uaClass', () => {
  it.each([
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) [FBAN/FBIOS;FBAV/450.0]', 'inapp_fb'],
    ['Mozilla/5.0 (Linux; Android 14) Instagram 300.0.0', 'inapp_ig'],
    ['Mozilla/5.0 (iPhone) musical_ly_32.0 BytedanceWebview', 'inapp_tiktok'],
    ['Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile Safari/537.36', 'mobile'],
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) Safari/605.1.15', 'desktop'],
    ['curl/8.0', 'other'],
    [null, 'other'],
  ])('%s -> %s', (ua, want) => expect(uaClass(ua)).toBe(want));
});

describe('ipHash', () => {
  it('is sha256(salt + UTC day + ip) and changes every day', async () => {
    expect(await ipHash('test-salt', NOW, '203.0.113.7')).toBe('f89c41f415a0bc039af202d11134abe7cc513c9ae60b2253ce17753ec8c77706');
    expect(await ipHash('test-salt', NOW + 86400000, '203.0.113.7')).not.toBe(await ipHash('test-salt', NOW, '203.0.113.7'));
  });
});
```

Run: `npm test -w @ikf/edge-router`
Expected: FAIL, không load được `../src/collector.js`.

- [ ] **Step 2: Cấu hình binding**

```bash
npm pkg set -w @ikf/edge-router 'dependencies.@ikf/event-schema=*'
npm install
```

`workers/edge-router/wrangler.json` (thay toàn bộ):

```json
{
  "name": "ikf-edge-router",
  "main": "src/index.js",
  "compatibility_date": "2026-09-01",
  "observability": { "enabled": true },
  "vars": { "PREVIEW_HOST": "preview.ikf-staging.example" },
  "kv_namespaces": [{ "binding": "ROUTES", "id": "local-routes" }],
  "r2_buckets": [{ "binding": "BUNDLES", "bucket_name": "local-bundles" }],
  "queues": { "producers": [{ "binding": "EVENTS", "queue": "ikf-events-local" }] }
}
```

`workers/edge-router/vitest.config.js` (thay toàn bộ):

```js
import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.json' },
        // Secrets are not in wrangler.json; tests get a fixed salt.
        miniflare: { bindings: { IP_SALT: 'test-salt' } },
      },
    },
  },
});
```

`workers/edge-router/scripts/render-config.mjs` (thay toàn bộ):

```js
#!/usr/bin/env node
// Prints the deploy config for one environment: node scripts/render-config.mjs > wrangler.deploy.json
import { readFileSync } from 'node:fs';

const base = JSON.parse(readFileSync(new URL('../wrangler.json', import.meta.url), 'utf8'));
const need = ['WORKER_ENV', 'KV_NAMESPACE_ID', 'R2_BUCKET', 'PREVIEW_HOST'];
const missing = need.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`missing env: ${missing.join(', ')}`);
  process.exit(1);
}
const { WORKER_ENV, KV_NAMESPACE_ID, R2_BUCKET, PREVIEW_HOST } = process.env;

console.log(
  JSON.stringify(
    {
      ...base,
      name: `ikf-edge-router-${WORKER_ENV}`,
      workers_dev: false,
      vars: { ...base.vars, PREVIEW_HOST },
      kv_namespaces: [{ binding: 'ROUTES', id: KV_NAMESPACE_ID }],
      r2_buckets: [{ binding: 'BUNDLES', bucket_name: R2_BUCKET }],
      queues: { producers: [{ binding: 'EVENTS', queue: `ikf-events-${WORKER_ENV}` }] },
    },
    null,
    2,
  ),
);
```

- [ ] **Step 3: Implement**

`workers/edge-router/src/collector.js`:

```js
import { MAX_BODY_BYTES, MAX_EVENTS, scrubEvent, validateEvent } from '@ikf/event-schema';
import { log } from './responses.js';

const TYPES = new Set(['application/json', 'text/plain']);

const reply = (status, extra = {}) => new Response(null, { status, headers: { 'cache-control': 'no-store', ...extra } });

export function uaClass(ua) {
  const s = ua || '';
  if (/Instagram/.test(s)) return 'inapp_ig';
  if (/FBAN|FBAV|FB_IAB|FBIOS/.test(s)) return 'inapp_fb';
  if (/musical_ly|BytedanceWebview|TikTok|trill_/i.test(s)) return 'inapp_tiktok';
  if (/Mobi|Android|iPhone|iPad|iPod/.test(s)) return 'mobile';
  if (/Windows NT|Macintosh|X11|CrOS/.test(s)) return 'desktop';
  return 'other';
}

// sha256(IP_SALT + UTC day + IP): joins a visitor's events within one day, never stores the IP.
export async function ipHash(salt, now, ip) {
  const day = new Date(now).toISOString().slice(0, 10);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}${day}${ip || ''}`));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function sameOrigin(request, url) {
  const src = request.headers.get('origin') || request.headers.get('referer');
  if (!src || src === 'null') return false;
  try {
    return new URL(src).host === url.host;
  } catch {
    return false;
  }
}

// Reads at most `limit` bytes; null when the body is larger (chunked bodies have no content-length).
async function readLimited(request, limit) {
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel().catch(() => {});
      return null;
    }
    chunks.push(value);
  }
  const all = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    all.set(c, offset);
    offset += c.byteLength;
  }
  return new TextDecoder().decode(all);
}

export async function collect(request, env, now = Date.now()) {
  if (request.method !== 'POST') return reply(405, { allow: 'POST' });
  const type = (request.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  if (!TYPES.has(type)) return reply(415);
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY_BYTES) return reply(413);
  const url = new URL(request.url);
  if (!sameOrigin(request, url)) return reply(403);
  const text = await readLimited(request, MAX_BODY_BYTES);
  if (text === null) return reply(413);

  let body;
  try {
    body = JSON.parse(text);
  } catch {
    return reply(400);
  }
  const raw = body && body.events;
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > MAX_EVENTS) return reply(400);

  if (!env.IP_SALT) {
    log({ path: url.pathname, status: 503, error: 'ip_salt_missing' });
    return reply(503);
  }
  const enrich = {
    received_at: now,
    country: typeof request.cf?.country === 'string' ? request.cf.country : 'XX',
    ua_class: uaClass(request.headers.get('user-agent')),
    ip_hash: await ipHash(env.IP_SALT, now, request.headers.get('cf-connecting-ip')),
  };
  const messages = [];
  for (const r of raw) {
    const v = validateEvent(r, now);
    if (v.ok) messages.push({ body: { ...scrubEvent(v.event), ...enrich }, contentType: 'json' });
  }
  if (messages.length < raw.length) log({ path: url.pathname, error: 'events_rejected', count: raw.length - messages.length });
  if (!messages.length) return reply(204);

  try {
    await env.EVENTS.sendBatch(messages);
  } catch (err) {
    log({ path: url.pathname, status: 503, error: 'queue_unavailable', detail: err.message, events: messages.length });
    return reply(503);
  }
  return reply(204);
}
```

`workers/edge-router/src/index.js`: thêm `import { collect } from './collector.js';` (sau `import { getBundle } …`) và dòng đầu tiên sau `const url = new URL(request.url);`:

```js
    if (url.pathname === '/_ikf/c') return collect(request, env);
```
(file đầy đủ đúng như bản ở Task 8 Step 3 khi giữ hai dòng này).

- [ ] **Step 4: Chạy test, xác nhận PASS**

Run:
```bash
npm test -w @ikf/edge-router
WORKER_ENV=staging KV_NAMESPACE_ID=k R2_BUCKET=b PREVIEW_HOST=p node workers/edge-router/scripts/render-config.mjs | grep -A1 producers
```
Expected: `Tests  69 passed (69)`; output render có `"queue": "ikf-events-staging"`.

- [ ] **Step 5: Commit**

```bash
git add package-lock.json workers/edge-router
git commit -m "feat(edge-router): POST /_ikf/c collector validates, scrubs, enriches and queues events"
```

---

### Task 10: Worker `event-consumer` — ClickHouse insert, retry, chia đôi khi 400, DLQ alarm

**Files:**
- Create: `clickhouse/001_events.sql`
- Create: `workers/event-consumer/{package.json,wrangler.json,vitest.config.js,vitest.node.config.js}`
- Create: `workers/event-consumer/scripts/render-config.mjs`
- Create: `workers/event-consumer/src/{clickhouse,alarm,index}.js`
- Test: `workers/event-consumer/test/node/clickhouse.test.js` (Node + ClickHouse thật qua Testcontainers), `workers/event-consumer/test/worker/consumer.test.js` (`vitest-pool-workers`, fetch giả)

**Interfaces:**
- Consumes: message Queue của Task 9 (`contentType: 'json'`).
- Produces:
  - `insertUrl({url, database}): string`, `toRow(body): row` (thời gian ISO-8601, `aid`/`screen` null), `RetryableInsertError`, `INSERT_TIMEOUT_MS = 15000`
  - `createInserter({url, user, password, database, fetch?, timeoutMs?}).insert(rows) → {inserted, rejected: [{id, reason}]}`; 2xx ok; **400** → chia đôi; status khác / lỗi mạng / timeout → `RetryableInsertError`
  - `createAlarm(env, {fetch?, log?}).notify(kind: 'dlq'|'insert_failing', message): Promise<boolean>`; `ALARM_THROTTLE_SECONDS = 900`; KV key `alarm:<kind>`
  - `handleBatch(batch, env, {fetch?, log?})`; `MAX_RETRIES = 5`, `FAILING_AFTER = 3`; `export default { queue }`
  - Bindings: `STATE` (KV), vars `WORKER_ENV`, `CLICKHOUSE_DATABASE` (`ikf`), `AWS_REGION`, `SNS_TOPIC_ARN`; secrets `CLICKHOUSE_URL`, `CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
  - Log: `{error:'row_rejected', id, reason}`, `{error:'insert_failed', attempts, messages, detail}`, `{error:'alarm_publish_failed', kind, …}`, `{error:'alarm_state_unavailable', kind, detail}`
  - Render config (Task 12): env `WORKER_ENV`, `STATE_KV_NAMESPACE_ID`, `SNS_TOPIC_ARN`, `AWS_REGION` → Worker `ikf-event-consumer-<env>`, consumer `ikf-events-<env>`, DLQ `ikf-events-<env>-dlq`

- [ ] **Step 1: DDL + package**

`clickhouse/001_events.sql`:

```sql
CREATE TABLE IF NOT EXISTS events (
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
TTL toDateTime(received_at) + INTERVAL 13 MONTH
```

```bash
mkdir -p workers/event-consumer/{src,scripts,test/node,test/worker}
```

`workers/event-consumer/package.json`:

```json
{
  "name": "@ikf/event-consumer",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "vitest run --config vitest.node.config.js && vitest run"
  },
  "dependencies": { "aws4fetch": "^1.0.20" },
  "devDependencies": {
    "@cloudflare/vitest-pool-workers": "^0.12.0",
    "@testcontainers/clickhouse": "^11.14.0",
    "vitest": "~3.2.0",
    "wrangler": "^4.0.0"
  }
}
```

`workers/event-consumer/wrangler.json`:

```json
{
  "name": "ikf-event-consumer",
  "main": "src/index.js",
  "compatibility_date": "2026-09-01",
  "observability": { "enabled": true },
  "vars": {
    "WORKER_ENV": "local",
    "CLICKHOUSE_DATABASE": "ikf",
    "AWS_REGION": "us-east-1",
    "SNS_TOPIC_ARN": "arn:aws:sns:us-east-1:111111111111:ikf-local-alarms"
  },
  "kv_namespaces": [{ "binding": "STATE", "id": "local-state" }],
  "queues": {
    "consumers": [
      {
        "queue": "ikf-events-local",
        "max_batch_size": 100,
        "max_batch_timeout": 10,
        "max_retries": 5,
        "dead_letter_queue": "ikf-events-local-dlq"
      }
    ]
  }
}
```

`workers/event-consumer/vitest.node.config.js`:

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/node/**/*.test.js'],
    // ClickHouse in Testcontainers: first pull and start can take a while.
    testTimeout: 30_000,
    hookTimeout: 180_000,
  },
});
```

`workers/event-consumer/vitest.config.js`:

```js
import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    include: ['test/worker/**/*.test.js'],
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.json' },
        // Secrets are not in wrangler.json.
        miniflare: {
          bindings: {
            CLICKHOUSE_URL: 'https://ch.test:8443',
            CLICKHOUSE_USER: 'ikf_writer',
            CLICKHOUSE_PASSWORD: 'pw',
            AWS_ACCESS_KEY_ID: 'AKIATEST',
            AWS_SECRET_ACCESS_KEY: 'secret',
          },
        },
      },
    },
  },
});
```

Run: `npm install`

- [ ] **Step 2: Viết test fail (phần insert, Node + ClickHouse thật)**

`workers/event-consumer/test/node/clickhouse.test.js`:

```js
import { readFile } from 'node:fs/promises';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { ClickHouseContainer } from '@testcontainers/clickhouse';
import { createInserter, insertUrl, RetryableInsertError, toRow } from '../../src/clickhouse.js';

const DDL = new URL('../../../../clickhouse/001_events.sql', import.meta.url);
const NOW = Date.UTC(2026, 9, 8, 10, 0, 0);
let n = 0;
const event = (extra = {}) => {
  n += 1;
  return {
    id: `01JA00000000000000000000${String(n).padStart(2, '0')}`, sid: '01JA0000000000000000000S01', aid: null,
    t: NOW - 1000, received_at: NOW, name: 'answer', funnel: 'aivideo', v: 3, rev: 7, host: 'try.x.com', path: '/promo',
    screen: 2, props: { 'data.goal': 'sleep' }, attr: { utm_source: 'meta' }, country: 'VN', ua_class: 'mobile',
    ip_hash: 'f'.repeat(64), ...extra,
  };
};

describe('ClickHouse inserter (real ClickHouse)', () => {
  let ch;
  let cfg;
  const query = async (sql) => {
    const res = await fetch(`${ch.getHttpUrl()}/?database=ikf&default_format=JSON`, {
      method: 'POST', body: sql, headers: { authorization: `Basic ${btoa('ikf:pw')}` },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.text();
  };
  const count = async (final = false) => Number(JSON.parse(await query(`SELECT count() AS c FROM events${final ? ' FINAL' : ''}`)).data[0].c);

  beforeAll(async () => {
    ch = await new ClickHouseContainer('clickhouse/clickhouse-server:25.8').withDatabase('ikf').withUsername('ikf').withPassword('pw').start();
    cfg = { url: ch.getHttpUrl(), user: 'ikf', password: 'pw', database: 'ikf' };
    await query(await readFile(DDL, 'utf8'));
  });
  afterAll(() => ch?.stop());
  beforeEach(() => query('TRUNCATE TABLE events'));

  it('inserts a batch with maps, nulls and millisecond times', async () => {
    const rows = [event(), event({ aid: '01JA0000000000000000000A01', screen: null, props: {} })];
    expect(await createInserter(cfg).insert(rows.map(toRow))).toEqual({ inserted: 2, rejected: [] });
    const got = JSON.parse(await query("SELECT id, aid, t, props, screen FROM events ORDER BY id")).data;
    expect(got[0]).toMatchObject({ aid: null, t: '2026-10-08 09:59:59.000', props: { 'data.goal': 'sleep' }, screen: 2 });
    expect(got[1]).toMatchObject({ aid: '01JA0000000000000000000A01', screen: null, props: {} });
  });

  it('on 400 halves the batch, inserts every good row and reports the bad one', async () => {
    const rows = [event(), event(), { ...toRow(event()), t: 'not-a-date' }, event(), event()].map((r) => (typeof r.t === 'number' ? toRow(r) : r));
    const calls = [];
    const counting = (url, init) => {
      calls.push(init.body.split('\n').filter(Boolean).length);
      return fetch(url, init);
    };
    const out = await createInserter({ ...cfg, fetch: counting }).insert(rows);
    expect(out.inserted).toBe(4);
    expect(out.rejected).toEqual([{ id: rows[2].id, reason: expect.stringMatching(/\S/) }]);
    expect(calls).toEqual([5, 3, 2, 1, 2]);
    expect(await count()).toBe(4);
  });

  it('a retried batch does not double-count: ReplacingMergeTree collapses equal ids', async () => {
    const rows = [event(), event()].map(toRow);
    const ins = createInserter(cfg);
    await ins.insert(rows);
    await ins.insert(rows);
    expect(await count(true)).toBe(2);
  });

  it('wrong credentials are retryable, never split', async () => {
    const calls = [];
    const counting = (url, init) => {
      calls.push(1);
      return fetch(url, init);
    };
    await expect(createInserter({ ...cfg, password: 'wrong', fetch: counting }).insert([event(), event()].map(toRow)))
      .rejects.toBeInstanceOf(RetryableInsertError);
    expect(calls).toHaveLength(1);
  });

  it('an unreachable server is retryable', async () => {
    await expect(createInserter({ ...cfg, url: 'http://127.0.0.1:9', timeoutMs: 2000 }).insert([toRow(event())]))
      .rejects.toThrow(/clickhouse unreachable/);
  });
});

describe('insertUrl / toRow', () => {
  it('builds the async insert URL', () => {
    expect(insertUrl({ url: 'https://ch.example:8443/', database: 'ikf' })).toBe(
      'https://ch.example:8443/?query=INSERT+INTO+events+FORMAT+JSONEachRow&database=ikf&async_insert=1&wait_for_async_insert=1&date_time_input_format=best_effort',
    );
  });
  it('rejects bodies that are not events', () => {
    expect(() => toRow('x')).toThrow(TypeError);
    expect(() => toRow({ t: 'garbage', received_at: 1 })).toThrow(RangeError);
  });
});
```

Run:
```bash
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock
cd workers/event-consumer && npx vitest run --config vitest.node.config.js; cd ../..
```
Expected: FAIL, không load được `../../src/clickhouse.js`.

- [ ] **Step 3: Implement insert**

`workers/event-consumer/src/clickhouse.js`:

```js
// Plain fetch, no Worker APIs: tested in Node against a real ClickHouse.
export class RetryableInsertError extends Error {}

const QUERY = 'INSERT INTO events FORMAT JSONEachRow';
export const INSERT_TIMEOUT_MS = 15_000;

export function insertUrl({ url, database }) {
  const params = new URLSearchParams({
    query: QUERY,
    database,
    async_insert: '1',
    wait_for_async_insert: '1',
    date_time_input_format: 'best_effort',
  });
  return `${url.replace(/\/+$/, '')}/?${params}`;
}

const iso = (ms) => new Date(ms).toISOString();

// Queue message body (collector output) -> one JSONEachRow row. Throws on a body that is not an event.
export function toRow(e) {
  if (!e || typeof e !== 'object' || Array.isArray(e)) throw new TypeError('message body is not an object');
  return {
    id: e.id,
    sid: e.sid,
    aid: e.aid ?? null,
    t: iso(e.t),
    received_at: iso(e.received_at),
    name: e.name,
    funnel: e.funnel,
    v: e.v,
    rev: e.rev,
    host: e.host,
    path: e.path,
    screen: e.screen ?? null,
    props: e.props ?? {},
    attr: e.attr ?? {},
    country: e.country ?? 'XX',
    ua_class: e.ua_class ?? 'other',
    ip_hash: e.ip_hash ?? '',
  };
}

export function createInserter({ url, user, password, database, fetch: doFetch = fetch, timeoutMs = INSERT_TIMEOUT_MS }) {
  const endpoint = insertUrl({ url, database });
  const authorization = `Basic ${btoa(`${user}:${password}`)}`;

  async function post(rows) {
    let res;
    try {
      res = await doFetch(endpoint, {
        method: 'POST',
        headers: { authorization, 'content-type': 'application/x-ndjson' },
        body: `${rows.map((r) => JSON.stringify(r)).join('\n')}\n`,
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (err) {
      throw new RetryableInsertError(`clickhouse unreachable: ${err.message}`);
    }
    const text = await res.text().catch(() => '');
    if (res.ok) return { ok: true };
    // Only 400 means "this data is bad". 401/403 (credentials), 404 (table), 5xx: retry, never drop.
    if (res.status === 400) return { ok: false, reason: text.slice(0, 500) };
    throw new RetryableInsertError(`clickhouse HTTP ${res.status}: ${text.slice(0, 200)}`);
  }

  // On 400, halve until the bad rows are isolated; every good row still gets inserted.
  async function insert(rows) {
    if (!rows.length) return { inserted: 0, rejected: [] };
    const r = await post(rows);
    if (r.ok) return { inserted: rows.length, rejected: [] };
    if (rows.length === 1) return { inserted: 0, rejected: [{ id: rows[0].id, reason: r.reason }] };
    const mid = Math.ceil(rows.length / 2);
    const a = await insert(rows.slice(0, mid));
    const b = await insert(rows.slice(mid));
    return { inserted: a.inserted + b.inserted, rejected: [...a.rejected, ...b.rejected] };
  }

  return { insert };
}
```

Run: `cd workers/event-consumer && npx vitest run --config vitest.node.config.js; cd ../..`
Expected: `Tests  7 passed (7)` (lần đầu kéo image ClickHouse mất ~30s). Test chia đôi xác nhận chuỗi request `[5, 3, 2, 1, 2]` và 4/5 dòng vào bảng.

- [ ] **Step 4: Viết test fail (queue handler + alarm, trong Worker)**

`workers/event-consumer/test/worker/consumer.test.js`:

```js
import { env, createExecutionContext, createMessageBatch, getQueueResult } from 'cloudflare:test';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import worker, { handleBatch } from '../../src/index.js';
import { createAlarm, ALARM_THROTTLE_SECONDS } from '../../src/alarm.js';

const NOW = Date.UTC(2026, 9, 8, 10, 0, 0);
const event = (i) => ({
  id: `01JA00000000000000000000${String(i).padStart(2, '0')}`, sid: '01JA0000000000000000000S01', aid: null,
  t: NOW - 1000, received_at: NOW, name: 'answer', funnel: 'aivideo', v: 3, rev: 7, host: 'try.x.com', path: '/',
  screen: null, props: {}, attr: {}, country: 'VN', ua_class: 'mobile', ip_hash: 'f'.repeat(64),
});
const batchOf = (count, attempts = 1) =>
  createMessageBatch('ikf-events-local', Array.from({ length: count }, (_, i) => ({
    id: `m${i}`, timestamp: new Date(NOW), attempts, body: event(i + 1),
  })));

// Fake ClickHouse + SNS: `plan` maps a request to a status code.
function fakeFetch(plan) {
  const calls = [];
  const fn = async (input, init) => {
    const req = new Request(input, init);
    const body = await req.text();
    const call = { url: req.url, method: req.method, headers: Object.fromEntries(req.headers), body };
    calls.push(call);
    if (req.url.startsWith('https://sns.')) return new Response('<PublishResponse/>', { status: 200 });
    const status = plan(call);
    if (status instanceof Error) throw status;
    return new Response(status === 200 ? '' : 'Code: 27. DB::Exception: Cannot parse input', { status });
  };
  fn.calls = calls;
  fn.ch = () => calls.filter((c) => c.url.startsWith('https://ch.test'));
  fn.sns = () => calls.filter((c) => c.url.startsWith('https://sns.'));
  return fn;
}

let logs;
const log = (o) => logs.push(o);
// getQueueResult does not report delaySeconds, so retryAll is spied as well.
async function run(batch, fetch, e = env) {
  const retryAll = vi.spyOn(batch, 'retryAll');
  const ctx = createExecutionContext();
  await handleBatch(batch, e, { fetch, log });
  const result = await getQueueResult(batch, ctx);
  return { ...result, retryArgs: retryAll.mock.calls[0]?.[0] };
}

beforeEach(async () => {
  logs = [];
  await env.STATE.delete('alarm:dlq');
  await env.STATE.delete('alarm:insert_failing');
});

describe('queue consumer', () => {
  it('2xx: one INSERT with Basic auth, then ackAll', async () => {
    const fetch = fakeFetch(() => 200);
    const r = await run(batchOf(3), fetch);
    expect(r.ackAll).toBe(true);
    expect(r.retryBatch.retry).toBe(false);
    const [call] = fetch.ch();
    expect(call.url).toBe('https://ch.test:8443/?query=INSERT+INTO+events+FORMAT+JSONEachRow&database=ikf&async_insert=1&wait_for_async_insert=1&date_time_input_format=best_effort');
    expect(call.headers.authorization).toBe(`Basic ${btoa('ikf_writer:pw')}`);
    expect(call.body.trim().split('\n').map((l) => JSON.parse(l).id)).toEqual([event(1).id, event(2).id, event(3).id]);
    expect(JSON.parse(call.body.split('\n')[0]).t).toBe('2026-10-08T09:59:59.000Z');
  });

  it('retries 5xx with backoff 2^attempts and no alarm before the third attempt', async () => {
    const fetch = fakeFetch(() => 503);
    const r = await run(batchOf(2, 2), fetch);
    expect(r.ackAll).toBe(false);
    expect(r.retryBatch.retry).toBe(true);
    expect(r.retryArgs).toEqual({ delaySeconds: 4 });
    expect(fetch.sns()).toHaveLength(0);
    expect(logs).toEqual([expect.objectContaining({ error: 'insert_failed', attempts: 2, messages: 2 })]);
  });

  it.each([401, 403, 404, 413, 429])('treats %i as retryable (never splits or acks)', async (status) => {
    const fetch = fakeFetch(() => status);
    const r = await run(batchOf(4), fetch);
    expect(fetch.ch()).toHaveLength(1);
    expect(r.ackAll).toBe(false);
    expect(r.retryBatch.retry).toBe(true);
  });

  it('retries network errors', async () => {
    const r = await run(batchOf(1), fakeFetch(() => new TypeError('connect failed')));
    expect(r.retryBatch.retry).toBe(true);
    expect(r.retryArgs).toEqual({ delaySeconds: 2 });
  });

  it('400: splits to find the bad row, acks everything and logs row_rejected', async () => {
    const bad = event(3).id;
    const fetch = fakeFetch((c) => (c.body.includes(bad) ? 400 : 200));
    const r = await run(batchOf(4), fetch);
    expect(r.ackAll).toBe(true);
    expect(fetch.ch().map((c) => c.body.trim().split('\n').length)).toEqual([4, 2, 2, 1, 1]);
    expect(logs).toEqual([{ error: 'row_rejected', id: bad, reason: 'Code: 27. DB::Exception: Cannot parse input' }]);
  });

  it('a message body that is not an event is acked and logged, the rest inserted', async () => {
    const batch = createMessageBatch('ikf-events-local', [
      { id: 'm0', timestamp: new Date(NOW), attempts: 1, body: 'junk' },
      { id: 'm1', timestamp: new Date(NOW), attempts: 1, body: event(1) },
    ]);
    const fetch = fakeFetch(() => 200);
    const r = await run(batch, fetch);
    expect(r.ackAll).toBe(true);
    expect(fetch.ch()[0].body.trim().split('\n')).toHaveLength(1);
    expect(logs[0]).toMatchObject({ error: 'row_rejected', id: 'm0' });
  });

  it('third failure in a row publishes insert_failing to SNS, signed with SigV4', async () => {
    const fetch = fakeFetch(() => 500);
    await run(batchOf(1, 3), fetch);
    const [sns] = fetch.sns();
    expect(sns.url).toBe('https://sns.us-east-1.amazonaws.com/');
    expect(sns.headers.authorization).toMatch(/^AWS4-HMAC-SHA256 Credential=AKIATEST\/\d{8}\/us-east-1\/sns\/aws4_request/);
    const form = new URLSearchParams(sns.body);
    expect(Object.fromEntries(form)).toMatchObject({
      Action: 'Publish',
      TopicArn: 'arn:aws:sns:us-east-1:111111111111:ikf-local-alarms',
      Subject: '[ikf local] event-consumer insert_failing',
    });
  });

  it('last attempt publishes dlq with the replay command', async () => {
    const fetch = fakeFetch(() => 500);
    await run(batchOf(1, 5), fetch);
    const form = new URLSearchParams(fetch.sns()[0].body);
    expect(form.get('Subject')).toBe('[ikf local] event-consumer dlq');
    expect(form.get('Message')).toContain('ikf events replay-dlq --env local');
  });

  it('sends each kind of alarm at most once per 15 minutes', async () => {
    const fetch = fakeFetch(() => 500);
    await run(batchOf(1, 3), fetch);
    await run(batchOf(1, 4), fetch);
    await run(batchOf(1, 5), fetch);
    await run(batchOf(1, 5), fetch);
    expect(fetch.sns().map((c) => new URLSearchParams(c.body).get('Subject'))).toEqual([
      '[ikf local] event-consumer insert_failing',
      '[ikf local] event-consumer dlq',
    ]);
  });

  it('the throttle key expires after 900 seconds', async () => {
    const puts = [];
    const state = { get: async () => null, put: async (...a) => { puts.push(a); } };
    await createAlarm({ ...env, STATE: state }, { fetch: fakeFetch(() => 200), log }).notify('dlq', 'x');
    expect(ALARM_THROTTLE_SECONDS).toBe(900);
    expect(puts).toEqual([['alarm:dlq', expect.any(String), { expirationTtl: 900 }]]);
  });

  it('an SNS failure never changes the retry decision', async () => {
    const fetch = async (input) => {
      if (String(input.url ?? input).startsWith('https://sns.')) throw new Error('sns down');
      return new Response('boom', { status: 500 });
    };
    const r = await run(batchOf(1, 5), fetch);
    expect(r.retryBatch.retry).toBe(true);
    expect(r.retryArgs).toEqual({ delaySeconds: 32 });
    expect(logs).toContainEqual(expect.objectContaining({ error: 'alarm_publish_failed', kind: 'dlq' }));
  });
});

describe('worker.queue', () => {
  let spy;
  afterEach(() => spy?.mockRestore());

  it('uses the global fetch and the env bindings', async () => {
    const fake = fakeFetch(() => 200);
    spy = vi.spyOn(globalThis, 'fetch').mockImplementation(fake);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const batch = batchOf(2);
    const ctx = createExecutionContext();
    await worker.queue(batch, env, ctx);
    expect((await getQueueResult(batch, ctx)).ackAll).toBe(true);
    expect(fake.ch()).toHaveLength(1);
  });
});
```

Run: `cd workers/event-consumer && npx vitest run; cd ../..`
Expected: FAIL, không load được `../../src/index.js`.

- [ ] **Step 5: Implement handler + alarm + render-config**

`workers/event-consumer/src/alarm.js`:

```js
import { AwsClient } from 'aws4fetch';

export const ALARM_THROTTLE_SECONDS = 900;

// SNS Publish signed with SigV4; each kind at most once per 15 minutes (KV key with a TTL).
// Never throws: an alarm problem must not change what happens to the batch.
export function createAlarm(env, { fetch: doFetch = fetch, log = (o) => console.log(JSON.stringify(o)) } = {}) {
  return {
    async notify(kind, message) {
      const key = `alarm:${kind}`;
      try {
        if (await env.STATE.get(key)) return false;
        await env.STATE.put(key, new Date().toISOString(), { expirationTtl: ALARM_THROTTLE_SECONDS });
      } catch (err) {
        log({ error: 'alarm_state_unavailable', kind, detail: err.message });
      }
      try {
        const aws = new AwsClient({
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
          region: env.AWS_REGION,
          service: 'sns',
        });
        const req = await aws.sign(`https://sns.${env.AWS_REGION}.amazonaws.com/`, {
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded; charset=utf-8' },
          body: new URLSearchParams({
            Action: 'Publish',
            Version: '2010-03-31',
            TopicArn: env.SNS_TOPIC_ARN,
            Subject: `[ikf ${env.WORKER_ENV}] event-consumer ${kind}`,
            Message: message,
          }).toString(),
        });
        const res = await doFetch(req);
        if (!res.ok) log({ error: 'alarm_publish_failed', kind, status: res.status });
        return res.ok;
      } catch (err) {
        log({ error: 'alarm_publish_failed', kind, detail: err.message });
        return false;
      }
    },
  };
}
```

`workers/event-consumer/src/index.js`:

```js
import { createAlarm } from './alarm.js';
import { createInserter, toRow } from './clickhouse.js';

export const MAX_RETRIES = 5; // = max_retries of the queue consumer (wrangler.json)
export const FAILING_AFTER = 3;

const defaultLog = (o) => console.log(JSON.stringify(o));

export async function handleBatch(batch, env, { fetch: doFetch = fetch, log = defaultLog } = {}) {
  const rows = [];
  for (const m of batch.messages) {
    try {
      rows.push(toRow(m.body));
    } catch (err) {
      log({ error: 'row_rejected', id: m.body?.id ?? m.id, reason: err.message });
    }
  }
  const inserter = createInserter({
    url: env.CLICKHOUSE_URL,
    user: env.CLICKHOUSE_USER,
    password: env.CLICKHOUSE_PASSWORD,
    database: env.CLICKHOUSE_DATABASE,
    fetch: doFetch,
  });
  try {
    const { rejected } = await inserter.insert(rows);
    for (const r of rejected) log({ error: 'row_rejected', id: r.id, reason: r.reason });
    batch.ackAll();
  } catch (err) {
    const attempts = Math.max(1, ...batch.messages.map((m) => m.attempts));
    log({ error: 'insert_failed', attempts, messages: batch.messages.length, detail: err.message });
    const alarm = createAlarm(env, { fetch: doFetch, log });
    if (attempts >= MAX_RETRIES) {
      await alarm.notify('dlq', `${batch.messages.length} event(s) failed their last attempt and go to ${batch.queue}-dlq. Replay with: ikf events replay-dlq --env ${env.WORKER_ENV}. Last error: ${err.message}`);
    } else if (attempts >= FAILING_AFTER) {
      await alarm.notify('insert_failing', `ClickHouse insert failed ${attempts} times in a row for a batch of ${batch.messages.length}. Last error: ${err.message}`);
    }
    batch.retryAll({ delaySeconds: 2 ** attempts });
  }
}

export default {
  async queue(batch, env) {
    await handleBatch(batch, env);
  },
};
```

`workers/event-consumer/scripts/render-config.mjs`:

```js
#!/usr/bin/env node
// Prints the deploy config for one environment: node scripts/render-config.mjs > wrangler.deploy.json
import { readFileSync } from 'node:fs';

const base = JSON.parse(readFileSync(new URL('../wrangler.json', import.meta.url), 'utf8'));
const need = ['WORKER_ENV', 'STATE_KV_NAMESPACE_ID', 'SNS_TOPIC_ARN', 'AWS_REGION'];
const missing = need.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`missing env: ${missing.join(', ')}`);
  process.exit(1);
}
const { WORKER_ENV, STATE_KV_NAMESPACE_ID, SNS_TOPIC_ARN, AWS_REGION } = process.env;
const [consumer] = base.queues.consumers;

console.log(
  JSON.stringify(
    {
      ...base,
      name: `ikf-event-consumer-${WORKER_ENV}`,
      workers_dev: false,
      vars: { ...base.vars, WORKER_ENV, SNS_TOPIC_ARN, AWS_REGION },
      kv_namespaces: [{ binding: 'STATE', id: STATE_KV_NAMESPACE_ID }],
      queues: {
        consumers: [{ ...consumer, queue: `ikf-events-${WORKER_ENV}`, dead_letter_queue: `ikf-events-${WORKER_ENV}-dlq` }],
      },
    },
    null,
    2,
  ),
);
```

- [ ] **Step 6: Chạy toàn bộ, xác nhận PASS**

Run:
```bash
npm test -w @ikf/event-consumer
WORKER_ENV=staging STATE_KV_NAMESPACE_ID=s SNS_TOPIC_ARN=arn:aws:sns:us-east-1:1:a AWS_REGION=us-east-1 \
  node workers/event-consumer/scripts/render-config.mjs | grep -E '"(name|queue|dead_letter_queue)"'
```
Expected: `Tests  7 passed (7)` rồi `Tests  16 passed (16)`; render in `ikf-event-consumer-staging`, `ikf-events-staging`, `ikf-events-staging-dlq`.

- [ ] **Step 7: Commit**

```bash
git add package-lock.json clickhouse workers/event-consumer
git commit -m "feat(event-consumer): queue consumer inserts into ClickHouse, splits on 400, alarms via SNS"
```

---

### Task 11: CLI `ikf events replay-dlq --env <env>`

**Files:**
- Create: `packages/cli/src/replay.js`
- Modify: `packages/cli/src/main.js`
- Test: `packages/cli/test/replay.test.js`

**Interfaces:**
- Consumes: Cloudflare Queues REST API (`GET /accounts/{acc}/queues`, `POST /queues/{id}/messages/pull` `{batch_size, visibility_timeout_ms}`, `POST /queues/{id}/messages/batch` `{messages:[{body, content_type:'json'}]}`, `POST /queues/{id}/messages/ack` `{acks:[{lease_id}], retries:[]}`); DLQ có HTTP pull consumer (Task 12).
- Produces:
  - `createQueuesApi({accountId, apiToken, fetch?}) → {findQueueId(name), pull(id, opts), send(id, messages), ack(id, leaseIds)}`; `QueuesApiError`
  - `decodeBody(message): object | undefined`
  - `replayDlq({queues, env, out}) → {moved, skipped}` (gửi trước, ack sau; mỗi lần gửi ≤ 100 message và ≤ 200KB)
  - Lệnh: `ikf events replay-dlq --env staging|prod`, cần `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN` (Task 0 Step 4). Exit 0 / 1 (`Lỗi Cloudflare Queues: …`) / 2 (cách dùng).

- [ ] **Step 1: Viết test fail**

`packages/cli/test/replay.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { createQueuesApi, decodeBody, replayDlq, QueuesApiError } from '../src/replay.js';
import { run } from '../src/main.js';

const ev = (i, size = 10) => ({ id: `e${i}`, props: { x: 'y'.repeat(size) } });
const msg = (i, extra = {}) => ({
  id: `m${i}`, lease_id: `l${i}`, attempts: 1, timestamp_ms: 1, metadata: { 'CF-Content-Type': 'json' }, body: JSON.stringify(ev(i)), ...extra,
});

// In-memory Cloudflare Queues REST API.
function fakeCloudflare({ dlq = [], failSend = false } = {}) {
  const state = { main: [], dlq: [...dlq], acked: [], calls: [] };
  const queues = [{ queue_id: 'q-main', queue_name: 'ikf-events-staging' }, { queue_id: 'q-dlq', queue_name: 'ikf-events-staging-dlq' }];
  const fetch = async (url, init) => {
    const u = new URL(url);
    const body = init.body ? JSON.parse(init.body) : undefined;
    state.calls.push({ method: init.method, path: u.pathname + u.search, auth: init.headers.authorization, body });
    const ok = (result) => new Response(JSON.stringify({ success: true, errors: [], result, result_info: { page: 1, total_pages: 1 } }));
    const p = u.pathname.replace('/client/v4/accounts/acc/queues', '');
    if (init.method === 'GET' && p === '') return ok(queues);
    if (p === '/q-dlq/messages/pull') {
      const leased = state.dlq.filter((m) => !m.leased).slice(0, body.batch_size);
      for (const m of leased) m.leased = true;
      return ok({ messages: leased.map(({ leased: _, ...m }) => m) });
    }
    if (p === '/q-main/messages/batch') {
      if (failSend) return new Response(JSON.stringify({ success: false, errors: [{ message: 'boom' }] }), { status: 500 });
      state.main.push(...body.messages);
      return ok({});
    }
    if (p === '/q-dlq/messages/ack') {
      const ids = new Set(body.acks.map((a) => a.lease_id));
      state.acked.push(...ids);
      state.dlq = state.dlq.filter((m) => !ids.has(m.lease_id));
      return ok({ ackCount: ids.size });
    }
    return new Response('{}', { status: 404 });
  };
  return { state, api: createQueuesApi({ accountId: 'acc', apiToken: 'cf_t', fetch }) };
}

describe('replayDlq', () => {
  it('moves every DLQ message back to the main queue as JSON, then acks it', async () => {
    const cf = fakeCloudflare({ dlq: Array.from({ length: 150 }, (_, i) => msg(i)) });
    const r = await replayDlq({ queues: cf.api, env: 'staging' });
    expect(r).toEqual({ moved: 150, skipped: 0 });
    expect(cf.state.main).toHaveLength(150);
    expect(cf.state.main[0]).toEqual({ body: ev(0), content_type: 'json' });
    expect(cf.state.dlq).toHaveLength(0);
    expect(cf.state.calls[0]).toMatchObject({ method: 'GET', auth: 'Bearer cf_t' });
    expect(cf.state.calls.find((c) => c.path.endsWith('/pull')).body).toEqual({ batch_size: 100, visibility_timeout_ms: 60000 });
  });

  it('sends in batches under the 256KB API limit', async () => {
    const cf = fakeCloudflare({ dlq: Array.from({ length: 60 }, (_, i) => msg(i, { body: JSON.stringify(ev(i, 9000)) })) });
    await replayDlq({ queues: cf.api, env: 'staging' });
    const sends = cf.state.calls.filter((c) => c.path.endsWith('/messages/batch'));
    expect(sends.length).toBeGreaterThan(1);
    for (const s of sends) expect(JSON.stringify(s.body).length).toBeLessThan(256 * 1024);
    expect(cf.state.main).toHaveLength(60);
  });

  it('leaves non-JSON messages in the DLQ and reports them', async () => {
    const cf = fakeCloudflare({ dlq: [msg(1), msg(2, { metadata: { 'CF-Content-Type': 'v8' }, body: 'AAEC' })] });
    expect(await replayDlq({ queues: cf.api, env: 'staging' })).toEqual({ moved: 1, skipped: 1 });
    expect(cf.state.dlq.map((m) => m.id)).toEqual(['m2']);
  });

  it('never acks what it could not send', async () => {
    const cf = fakeCloudflare({ dlq: [msg(1)], failSend: true });
    await expect(replayDlq({ queues: cf.api, env: 'staging' })).rejects.toBeInstanceOf(QueuesApiError);
    expect(cf.state.acked).toEqual([]);
  });

  it('fails clearly when a queue does not exist', async () => {
    const cf = fakeCloudflare();
    await expect(replayDlq({ queues: cf.api, env: 'prod' })).rejects.toThrow('queue not found: ikf-events-prod');
  });
});

describe('decodeBody', () => {
  it.each([
    [{ body: '{"a":1}', metadata: { 'CF-Content-Type': 'json' } }, { a: 1 }],
    [{ body: { a: 1 }, metadata: { 'CF-Content-Type': 'json' } }, { a: 1 }],
    [{ body: '{"a":1}' }, { a: 1 }],
    [{ body: 'x', metadata: { 'CF-Content-Type': 'text' } }, undefined],
    [{ body: '{bad', metadata: { 'CF-Content-Type': 'json' } }, undefined],
  ])('%j -> %j', (m, want) => expect(decodeBody(m)).toEqual(want));
});

describe('ikf events replay-dlq', () => {
  const io = (deps = {}, env = {}) => {
    const lines = [];
    const errors = [];
    return { lines, errors, opts: { out: (l) => lines.push(l), err: (l) => errors.push(l), env, deps } };
  };

  it('replays and prints the count', async () => {
    const cf = fakeCloudflare({ dlq: [msg(1), msg(2)] });
    const t = io({ queues: cf.api });
    expect(await run(['events', 'replay-dlq', '--env', 'staging'], t.opts)).toBe(0);
    expect(t.lines[0]).toBe('Chuyển ikf-events-staging-dlq → ikf-events-staging…');
    expect(t.lines.at(-1)).toBe('Xong: 2 message đã về queue chính.');
  });

  it.each([
    [['events', 'replay-dlq'], 'cần --env staging hoặc --env prod'],
    [['events', 'replay-dlq', '--env', 'dev'], 'cần --env staging hoặc --env prod'],
    [['events', 'replay-dlq', '--env', 'prod'], 'cần biến môi trường CLOUDFLARE_ACCOUNT_ID và CLOUDFLARE_API_TOKEN (quyền Queues:Edit)'],
  ])('exits 2 for %j', async (argv, msgText) => {
    const t = io();
    expect(await run(argv, t.opts)).toBe(2);
    expect(t.errors).toEqual([msgText]);
  });

  it('exits 1 with the Cloudflare error message', async () => {
    const cf = fakeCloudflare({ dlq: [msg(1)], failSend: true });
    const t = io({ queues: cf.api });
    expect(await run(['events', 'replay-dlq', '--env', 'staging'], t.opts)).toBe(1);
    expect(t.errors[0]).toBe('Lỗi Cloudflare Queues: POST /q-main/messages/batch: boom');
  });
});
```

Run: `npm test -w @ikf/cli`
Expected: FAIL, không load được `../src/replay.js`.

- [ ] **Step 2: Implement**

`packages/cli/src/replay.js`:

```js
// Moves messages from ikf-events-<env>-dlq back to ikf-events-<env> through the Cloudflare Queues
// REST API (the DLQ has an HTTP pull consumer, see infra/modules/edge).
export class QueuesApiError extends Error {}

export function createQueuesApi({ accountId, apiToken, fetch: doFetch = fetch }) {
  const base = `https://api.cloudflare.com/client/v4/accounts/${accountId}/queues`;
  async function call(method, path, body) {
    let res;
    try {
      res = await doFetch(base + path, {
        method,
        headers: { authorization: `Bearer ${apiToken}`, ...(body !== undefined && { 'content-type': 'application/json' }) },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (err) {
      throw new QueuesApiError(`${method} ${path}: ${err.message}`);
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) {
      const msg = (data.errors ?? []).map((e) => e.message).join('; ') || `HTTP ${res.status}`;
      throw new QueuesApiError(`${method} ${path}: ${msg}`);
    }
    return data;
  }
  return {
    async findQueueId(name) {
      for (let page = 1; ; page += 1) {
        const data = await call('GET', `?page=${page}&per_page=100`);
        const hit = (data.result ?? []).find((q) => q.queue_name === name);
        if (hit) return hit.queue_id;
        const totalPages = data.result_info?.total_pages ?? 1;
        if (!data.result?.length || page >= totalPages) throw new QueuesApiError(`queue not found: ${name}`);
      }
    },
    async pull(queueId, { batchSize = 100, visibilityTimeoutMs = 60_000 } = {}) {
      const data = await call('POST', `/${queueId}/messages/pull`, { batch_size: batchSize, visibility_timeout_ms: visibilityTimeoutMs });
      return data.result?.messages ?? [];
    },
    send: (queueId, messages) => call('POST', `/${queueId}/messages/batch`, { messages }),
    ack: (queueId, leaseIds) => call('POST', `/${queueId}/messages/ack`, { acks: leaseIds.map((lease_id) => ({ lease_id })), retries: [] }),
  };
}

// Collector messages are JSON; anything else is left in the DLQ for a human to look at.
export function decodeBody(m) {
  const type = m.metadata?.['CF-Content-Type'] ?? 'json';
  if (type !== 'json') return undefined;
  try {
    return typeof m.body === 'string' ? JSON.parse(m.body) : m.body;
  } catch {
    return undefined;
  }
}

const SEND_MAX_MESSAGES = 100;
const SEND_MAX_BYTES = 200_000; // API limit is 256KB per batch

function chunks(items) {
  const out = [];
  let cur = [];
  let size = 0;
  for (const it of items) {
    const n = JSON.stringify(it.body).length;
    if (cur.length && (cur.length >= SEND_MAX_MESSAGES || size + n > SEND_MAX_BYTES)) {
      out.push(cur);
      cur = [];
      size = 0;
    }
    cur.push(it);
    size += n;
  }
  if (cur.length) out.push(cur);
  return out;
}

// Send first, ack after: a crash in between only re-sends (ClickHouse collapses equal ids).
export async function replayDlq({ queues, env, out = () => {} }) {
  const mainId = await queues.findQueueId(`ikf-events-${env}`);
  const dlqId = await queues.findQueueId(`ikf-events-${env}-dlq`);
  let moved = 0;
  let skipped = 0;
  for (;;) {
    const msgs = await queues.pull(dlqId);
    if (!msgs.length) break;
    const good = [];
    for (const m of msgs) {
      const body = decodeBody(m);
      if (body === undefined) skipped += 1;
      else good.push({ lease: m.lease_id, body });
    }
    if (!good.length) break;
    for (const part of chunks(good)) {
      await queues.send(mainId, part.map((g) => ({ body: g.body, content_type: 'json' })));
      await queues.ack(dlqId, part.map((g) => g.lease));
      moved += part.length;
      out(`  đã chuyển ${moved} message`);
    }
  }
  return { moved, skipped };
}
```

`packages/cli/src/main.js` (thay toàn bộ; đã gồm thay đổi của Task 7):

```js
#!/usr/bin/env node
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { ApiError, createApi } from './api.js';
import { CheckFailedError } from './checks.js';
import { loadCredentials, saveCredentials } from './credentials.js';
import { publishCommand } from './publish.js';
import { createQueuesApi, QueuesApiError, replayDlq } from './replay.js';
import { parseTarget, parseVersionRef, UsageError } from './target.js';

const USAGE = `Cách dùng:
  ikf login --api <url> --token <token>
  ikf publish <folder> --slug <slug>
  ikf route set <host>[/prefix] <funnel>@v<n> [--yes]
  ikf route rollback <host>[/prefix]
  ikf route rm <host>[/prefix]
  ikf route ls <host>
  ikf route sync <host>
  ikf funnel set <slug> --pixel <id> | --no-pixel
  ikf events replay-dlq --env <staging|prod>   (cần CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN)`;

const where = (r) => `${r.host}${r.prefix === '/' ? '/' : r.prefix}`;

function printChange(out, r) {
  out(`${where(r)} → ${r.funnel}@v${r.v} (rev ${r.rev})`);
  if (r.kv_sync === 'pending') {
    out(`CẢNH BÁO: đã lưu nhưng CHƯA lên edge (KV lỗi). Hệ thống tự thử lại mỗi phút, hoặc chạy: ikf route sync ${r.host}`);
  } else {
    out(`Có hiệu lực toàn cầu trong tối đa ~${r.propagation_seconds} giây.`);
  }
}

function printList(out, r) {
  out(`${r.host} (${r.status}) rev ${r.rev}, KV rev ${r.kv_synced_rev}`);
  if (r.kv_synced_rev < r.rev) out(`CẢNH BÁO: KV đang chậm hơn DB; chạy: ikf route sync ${r.host}`);
  if (!r.routes.length) out('  (chưa có route)');
  for (const x of r.routes) {
    out(`  ${x.prefix.padEnd(24)} ${`${x.funnel}@v${x.v}`.padEnd(24)} ${x.updated_by}  ${x.updated_at}`);
  }
}

export function formatApiError(e) {
  if (e.code === 'funnel_change_requires_confirmation') {
    return `Route đang trỏ tới funnel "${e.detail.from}". Chạy lại với --yes để chuyển sang "${e.detail.to}".`;
  }
  const lines = [`Lỗi ${e.status || ''} ${e.code}`.replace('  ', ' ')];
  const details = Array.isArray(e.detail) ? e.detail : e.detail === undefined ? [] : [e.detail];
  for (const d of details) {
    if (d?.code && Array.isArray(d.detail?.urls)) lines.push(`  ${d.code}:`, ...d.detail.urls.map((u) => `    ${u}`));
    else lines.push(`  ${JSON.stringify(d)}`);
  }
  return lines.join('\n');
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,62}$/;
const PIXEL_RE = /^[0-9]{6,20}$/;

async function funnelCommand(api, sub, args, values, out) {
  const slug = args[0];
  if (sub !== 'set' || !slug) throw new UsageError(USAGE);
  if (!SLUG_RE.test(slug)) throw new UsageError(`slug không hợp lệ: "${slug}"`);
  if ((values.pixel === undefined) === !values['no-pixel']) throw new UsageError('cần đúng một trong --pixel <id> hoặc --no-pixel');
  if (values.pixel !== undefined && !PIXEL_RE.test(values.pixel)) throw new UsageError(`Pixel ID phải là 6-20 chữ số, nhận được "${values.pixel}"`);
  const r = await api.setFunnel(slug, { pixel_id: values['no-pixel'] ? null : values.pixel });
  out(r.pixel_id ? `${r.funnel}: pixel ${r.pixel_id}` : `${r.funnel}: đã tắt pixel`);
  out(`Đã đồng bộ ${r.synced}/${r.hosts.length} host${r.hosts.length ? `: ${r.hosts.join(', ')}` : ''}.`);
  if (r.kv_sync === 'pending') {
    out('CẢNH BÁO: có host CHƯA lên edge (KV lỗi). Hệ thống tự thử lại mỗi phút, hoặc chạy: ikf route sync <host>');
  } else if (r.hosts.length) {
    out(`Có hiệu lực toàn cầu trong tối đa ~${r.propagation_seconds} giây.`);
  }
  return 0;
}

async function eventsCommand(sub, values, out, env, deps) {
  if (sub !== 'replay-dlq') throw new UsageError(USAGE);
  if (!['staging', 'prod'].includes(values.env)) throw new UsageError('cần --env staging hoặc --env prod');
  let queues = deps.queues;
  if (!queues) {
    if (!env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_API_TOKEN) {
      throw new UsageError('cần biến môi trường CLOUDFLARE_ACCOUNT_ID và CLOUDFLARE_API_TOKEN (quyền Queues:Edit)');
    }
    queues = createQueuesApi({ accountId: env.CLOUDFLARE_ACCOUNT_ID, apiToken: env.CLOUDFLARE_API_TOKEN });
  }
  out(`Chuyển ikf-events-${values.env}-dlq → ikf-events-${values.env}…`);
  const r = await replayDlq({ queues, env: values.env, out });
  out(`Xong: ${r.moved} message đã về queue chính.`);
  if (r.skipped) out(`CẢNH BÁO: ${r.skipped} message không đọc được (không phải JSON), vẫn nằm trong DLQ.`);
  return 0;
}

async function routeCommand(api, sub, args, values, out) {
  const target = () => {
    if (!args[0]) throw new UsageError(USAGE);
    return parseTarget(args[0]);
  };
  switch (sub) {
    case 'set': {
      const { host, prefix } = target();
      if (!args[1]) throw new UsageError(USAGE);
      const { funnel, v } = parseVersionRef(args[1]);
      printChange(out, await api.setRoute(host, { prefix, funnel, v, confirm_funnel_change: values.yes }));
      return 0;
    }
    case 'rollback': {
      const { host, prefix } = target();
      printChange(out, await api.rollback(host, prefix));
      return 0;
    }
    case 'rm': {
      const { host, prefix } = target();
      const r = await api.removeRoute(host, prefix);
      out(`${where(r)} đã gỡ (trước đó: ${r.funnel}@v${r.v}, rev ${r.rev})`);
      return 0;
    }
    case 'ls': {
      printList(out, await api.listRoutes(target().host));
      return 0;
    }
    case 'sync': {
      const r = await api.syncHost(target().host);
      out(`${r.host}: KV đã đồng bộ (rev ${r.rev}).`);
      return 0;
    }
    default:
      throw new UsageError(USAGE);
  }
}

export async function run(argv, { out = console.log, err = console.error, env = process.env, deps = {} } = {}) {
  try {
    const { positionals, values } = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        api: { type: 'string' },
        token: { type: 'string' },
        slug: { type: 'string' },
        yes: { type: 'boolean', default: false },
        pixel: { type: 'string' },
        'no-pixel': { type: 'boolean', default: false },
        env: { type: 'string' },
      },
    });
    const [cmd, sub, ...rest] = positionals;
    if (cmd === 'login') {
      if (!values.api || !values.token) throw new UsageError(USAGE);
      await (deps.saveCredentials ?? saveCredentials)({ api: values.api, token: values.token });
      out('Đã lưu thông tin đăng nhập.');
      return 0;
    }
    if (!['route', 'publish', 'funnel', 'events'].includes(cmd)) throw new UsageError(USAGE);
    if (cmd === 'events') return await eventsCommand(sub, values, out, env, deps);
    if (cmd === 'publish' && (!sub || !values.slug)) throw new UsageError('cách dùng: ikf publish <folder> --slug <slug>');
    const api = deps.api ?? createApi(await loadCredentials(env));
    if (cmd === 'publish') {
      await publishCommand({ api, folder: sub, slug: values.slug, out, runner: deps.runner, env });
      return 0;
    }
    if (cmd === 'funnel') return await funnelCommand(api, sub, rest, values, out);
    return await routeCommand(api, sub, rest, values, out);
  } catch (e) {
    if (e instanceof UsageError) {
      err(e.message);
      return 2;
    }
    if (e instanceof CheckFailedError) {
      err(`${e.stage} fail:\n${e.output}`);
      return 1;
    }
    if (e instanceof QueuesApiError) {
      err(`Lỗi Cloudflare Queues: ${e.message}`);
      return 1;
    }
    if (e instanceof ApiError) {
      err(formatApiError(e));
      return 1;
    }
    if (e.code === 'ERR_PARSE_ARGS_UNKNOWN_OPTION') {
      err(`${e.message}\n${USAGE}`);
      return 2;
    }
    throw e;
  }
}

if (realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await run(process.argv.slice(2));
}
```

- [ ] **Step 3: Chạy test, xác nhận PASS**

Run: `npm test -w @ikf/cli`
Expected: `Tests  70 passed (70)`.

- [ ] **Step 4: Commit**

```bash
git add packages/cli
git commit -m "feat(cli): ikf events replay-dlq moves DLQ messages back via the Queues pull API"
```

---

### Task 12: Hạ tầng — rate limit `/_ikf/c`, DLQ pull, KV consumer, IAM SNS, CI deploy, secrets

**Files:**
- Modify: `infra/modules/edge/{main,variables,outputs}.tf`, `infra/modules/edge/tests/edge.tftest.hcl`
- Modify: `infra/modules/funnel-domains/{main,variables}.tf`, `infra/modules/funnel-domains/tests/funnel_domains.tftest.hcl`
- Modify: `infra/stack/{main,outputs}.tf`, `infra/stack/tests/stack.tftest.hcl`
- Modify: `.github/workflows/edge-router.yml`, `.github/workflows/packages.yml`
- Create: `.github/workflows/event-consumer.yml`

Không có module hay provider mới nên **không đổi** `.terraform.lock.hcl` (cloudflare 5.27.0 đã có `cloudflare_queue_consumer`). Không thêm thư mục vào matrix của `infra.yml`.

**Interfaces:**
- Consumes: `module.observability.alarm_topic_arn`; queue `ikf-events-<env>` + DLQ đã có trong `modules/edge`; render-config của Task 9, 10; `node packages/sdk/scripts/build.mjs` (Task 5).
- Produces:
  - `cloudflare_ruleset.ratelimit.rules[1]` (zone platform): `(http.request.uri.path eq "/_ikf/c")`, 30 / 10s / (`ip.src`, `cf.colo.id`); biến `collector_requests_per_10s = 30` ở `modules/edge` và `modules/funnel-domains`.
  - `module.funnel_domains.cloudflare_ruleset.collector_ratelimit[<zone_id>]` cho mỗi zone funnel ≠ zone platform.
  - `cloudflare_queue_consumer.events_dlq_pull` (`http_pull`, batch 100, visibility 60s); DLQ `message_retention_period = 1209600`.
  - `cloudflare_workers_kv_namespace.consumer_state` (`ikf-consumer-state-<env>`); output `consumer_state_kv_namespace_id` (module + stack).
  - `aws_iam_user.event_alarms` (`ikf-<env>-event-alarms`) + `aws_iam_user_policy.event_alarms` chỉ `sns:Publish` trên topic alarm; stack outputs `alarm_topic_arn`, `event_alarms_user`.
  - GitHub environment variables mới: `CONSUMER_STATE_KV_NAMESPACE_ID`, `ALARM_TOPIC_ARN`, `AWS_REGION`. Worker secrets: `IP_SALT` (edge-router); `CLICKHOUSE_URL`, `CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (event-consumer).

- [ ] **Step 1: Viết test Terraform fail**

`infra/modules/edge/tests/edge.tftest.hcl` (thay toàn bộ; thêm 2 run cuối):

```hcl
mock_provider "cloudflare" {}

variables {
  env                = "staging"
  account_id         = "acc123"
  zone_id            = "023e105f4ecef8ad9ca31a8372d0c353"
  zone_name          = "ikf-staging.example"
  alb_dns_name       = "ikf-staging-api-123.us-east-1.elb.amazonaws.com"
  origin_auth_secret = "test-origin-secret"
}

run "api_record_is_proxied_through_cloudflare" {
  command = apply

  assert {
    condition     = cloudflare_dns_record.api.proxied && cloudflare_dns_record.api.content == var.alb_dns_name
    error_message = "api record must be a proxied CNAME to the ALB."
  }

  assert {
    condition     = output.api_fqdn == "api.ikf-staging.example"
    error_message = "API hostname must be api.<zone>."
  }
}

run "origin_header_is_injected_for_api_host" {
  command = apply

  assert {
    condition     = cloudflare_ruleset.origin_auth.phase == "http_request_late_transform" && cloudflare_ruleset.origin_auth.rules[0].action_parameters.headers["X-Origin-Auth"].value == var.origin_auth_secret
    error_message = "Cloudflare must set X-Origin-Auth on requests to the API host."
  }
}

run "sensitive_paths_are_rate_limited" {
  command = apply

  assert {
    condition     = alltrue([for p in ["/v1/otp", "/v1/checkout", "/v1/claim"] : strcontains(cloudflare_ruleset.ratelimit.rules[0].expression, "\"${p}\"")])
    error_message = "OTP, checkout and claim must be rate limited."
  }
}

run "edge_storage_named_per_env" {
  command = apply

  assert {
    condition     = cloudflare_r2_bucket.bundles.name == "ikf-bundles-staging" && cloudflare_queue.events.queue_name == "ikf-events-staging"
    error_message = "Edge resources must be named per environment."
  }

  assert {
    condition     = cloudflare_turnstile_widget.this.mode == "managed"
    error_message = "Turnstile must run in managed mode."
  }
}

run "collector_is_rate_limited_per_ip" {
  command = apply

  assert {
    condition     = length(cloudflare_ruleset.ratelimit.rules) == 2 && cloudflare_ruleset.ratelimit.rules[1].expression == "(http.request.uri.path eq \"/_ikf/c\")"
    error_message = "The ratelimit ruleset must keep the API rule first and add one rule for /_ikf/c."
  }

  assert {
    condition = (
      cloudflare_ruleset.ratelimit.rules[1].ratelimit.requests_per_period == 30 &&
      cloudflare_ruleset.ratelimit.rules[1].ratelimit.period == 10 &&
      contains(cloudflare_ruleset.ratelimit.rules[1].ratelimit.characteristics, "ip.src")
    )
    error_message = "/_ikf/c must default to 30 requests per 10 seconds per IP."
  }
}

run "events_dlq_can_be_replayed" {
  command = apply

  assert {
    condition     = cloudflare_queue_consumer.events_dlq_pull.type == "http_pull" && cloudflare_queue_consumer.events_dlq_pull.queue_id == cloudflare_queue.events_dlq.queue_id
    error_message = "The DLQ needs an HTTP pull consumer for ikf events replay-dlq."
  }

  assert {
    condition     = cloudflare_queue.events_dlq.settings.message_retention_period == 1209600
    error_message = "DLQ messages must be kept 14 days."
  }

  assert {
    condition     = cloudflare_workers_kv_namespace.consumer_state.title == "ikf-consumer-state-staging"
    error_message = "event-consumer needs its own KV namespace per env."
  }
}
```

`infra/modules/funnel-domains/tests/funnel_domains.tftest.hcl` (thay toàn bộ). Zone id giờ là 32 hex, vì `cloudflare_ruleset` kiểm tra định dạng `zone_id`: `zone-platform` → `023e105f4ecef8ad9ca31a8372d0c353`, `zone-aivideo` → `1a2b3c4d5e6f708192a3b4c5d6e7f801`, `zone-calmio` → `9f8e7d6c5b4a39281706f5e4d3c2b1a0`:

```hcl
mock_provider "cloudflare" {}

variables {
  platform_zone_id   = "023e105f4ecef8ad9ca31a8372d0c353"
  platform_zone_name = "ikf-staging.example"
  worker_script_name = "ikf-edge-router-staging"
  funnel_domains = {
    "try.aivideo.app" = { zone_id = "1a2b3c4d5e6f708192a3b4c5d6e7f801" }
    "go.calmio.app"   = { zone_id = "9f8e7d6c5b4a39281706f5e4d3c2b1a0", status = "disabled" }
  }
}

run "every_host_routes_to_the_worker" {
  command = apply

  assert {
    condition     = length(cloudflare_workers_route.host) == 3
    error_message = "Two funnel hosts plus the preview host must be routed."
  }

  assert {
    condition     = alltrue([for h, r in cloudflare_workers_route.host : r.pattern == "${h}/*" && r.script == var.worker_script_name])
    error_message = "Every route must send host/* to the edge-router script."
  }

  assert {
    condition = (
      cloudflare_workers_route.host["try.aivideo.app"].zone_id == "1a2b3c4d5e6f708192a3b4c5d6e7f801" &&
      cloudflare_workers_route.host["preview.ikf-staging.example"].zone_id == "023e105f4ecef8ad9ca31a8372d0c353"
    )
    error_message = "Routes must live in the zone that holds the host."
  }
}

run "every_host_has_a_proxied_originless_record" {
  command = apply

  assert {
    condition     = alltrue([for r in cloudflare_dns_record.host : r.proxied && r.type == "AAAA" && r.content == "100::"])
    error_message = "Hosts must be proxied AAAA 100:: so only the Worker answers."
  }
}

run "disabled_domains_keep_serving_and_are_reported" {
  command = apply

  assert {
    condition     = contains(keys(cloudflare_workers_route.host), "go.calmio.app")
    error_message = "A disabled domain keeps its existing routes."
  }

  assert {
    condition     = output.funnel_hosts == { "try.aivideo.app" = "active", "go.calmio.app" = "disabled" }
    error_message = "funnel_hosts must list funnel domains (not preview) with their status."
  }

  assert {
    condition     = output.preview_host == "preview.ikf-staging.example"
    error_message = "Preview host lives under the platform zone."
  }
}

run "rejects_unknown_status" {
  command = plan

  variables {
    funnel_domains = { "x.app" = { zone_id = "z", status = "paused" } }
  }

  expect_failures = [var.funnel_domains]
}

run "rejects_uppercase_hosts" {
  command = plan

  variables {
    funnel_domains = { "Try.App" = { zone_id = "0123456789abcdef0123456789abcdef" } }
  }

  expect_failures = [var.funnel_domains]
}

run "collector_rate_limited_once_per_funnel_zone" {
  command = apply

  variables {
    platform_zone_id = "023e105f4ecef8ad9ca31a8372d0c353"
    funnel_domains = {
      "try.aivideo.app" = { zone_id = "1a2b3c4d5e6f708192a3b4c5d6e7f801" }
      "go.aivideo.app"  = { zone_id = "1a2b3c4d5e6f708192a3b4c5d6e7f801" }
      "try.calmio.app"  = { zone_id = "9f8e7d6c5b4a39281706f5e4d3c2b1a0" }
      "try.ikf.example" = { zone_id = "023e105f4ecef8ad9ca31a8372d0c353" }
    }
  }

  assert {
    condition     = toset(keys(cloudflare_ruleset.collector_ratelimit)) == toset(["1a2b3c4d5e6f708192a3b4c5d6e7f801", "9f8e7d6c5b4a39281706f5e4d3c2b1a0"])
    error_message = "One collector ruleset per funnel zone, none for the platform zone (modules/edge owns it)."
  }

  assert {
    condition = alltrue([for z, r in cloudflare_ruleset.collector_ratelimit : (
      r.zone_id == z && r.phase == "http_ratelimit" &&
      r.rules[0].expression == "(http.request.uri.path eq \"/_ikf/c\")" &&
      r.rules[0].ratelimit.requests_per_period == 30 && r.rules[0].ratelimit.period == 10
    )])
    error_message = "Collector rule must limit /_ikf/c to 30 requests per 10s per IP."
  }
}
```

`infra/stack/tests/stack.tftest.hcl` (thay toàn bộ; `publisher_wiring` dùng zone 32 hex, thêm run cuối):

```hcl
mock_provider "aws" {
  mock_data "aws_iam_policy_document" {
    defaults = { json = "{\"Version\":\"2012-10-17\",\"Statement\":[]}" }
  }
  mock_resource "aws_db_instance" {
    defaults = {
      master_user_secret = [{
        secret_arn    = "arn:aws:secretsmanager:us-east-1:111111111111:secret:rds!db-test"
        kms_key_id    = "arn:aws:kms:us-east-1:111111111111:key/test"
        secret_status = "active"
      }]
    }
  }
  mock_resource "aws_acm_certificate" {
    defaults = {
      domain_validation_options = [{
        domain_name           = "api.ikf.example"
        resource_record_name  = "_abc.api.ikf.example."
        resource_record_type  = "CNAME"
        resource_record_value = "_xyz.acm-validations.aws."
      }]
      arn = "arn:aws:acm:us-east-1:111111111111:certificate/mock"
    }
  }
  mock_resource "aws_sesv2_email_identity" {
    defaults = {
      dkim_signing_attributes = {
        tokens                        = ["tok1", "tok2", "tok3"]
        current_signing_key_length    = "RSA_2048_BIT"
        next_signing_key_length       = "RSA_2048_BIT"
        signing_attributes_origin     = "AWS_SES"
        status                        = "PENDING"
        domain_signing_private_key    = null
        domain_signing_selector       = null
        last_key_generation_timestamp = ""
      }
    }
  }
  mock_resource "aws_iam_role" { defaults = { arn = "arn:aws:iam::111111111111:role/mock" } }
  mock_resource "aws_db_proxy_default_target_group" { defaults = { name = "default" } }
  mock_resource "aws_lb" { defaults = { arn = "arn:aws:elasticloadbalancing:us-east-1:111111111111:loadbalancer/app/ikf-staging-api/abc", arn_suffix = "app/ikf-staging-api/abc" } }
  mock_resource "aws_lb_listener" { defaults = { arn = "arn:aws:elasticloadbalancing:us-east-1:111111111111:listener/app/ikf-staging-api/abc/def" } }
  mock_resource "aws_lb_target_group" { defaults = { arn = "arn:aws:elasticloadbalancing:us-east-1:111111111111:targetgroup/ikf-staging-api/def", arn_suffix = "targetgroup/ikf-staging-api/def" } }
  mock_resource "aws_sns_topic" { defaults = { arn = "arn:aws:sns:us-east-1:111111111111:ikf-staging-alarms" } }
}

mock_provider "cloudflare" {
  mock_data "cloudflare_ip_ranges" {
    defaults = {
      ipv4_cidrs = ["173.245.48.0/20", "103.21.244.0/22"]
      ipv6_cidrs = []
    }
  }
}

mock_provider "random" {}

variables {
  env                   = "prod"
  region                = "us-east-1"
  azs                   = ["us-east-1a", "us-east-1b"]
  vpc_cidr              = "10.30.0.0/16"
  single_nat_gateway    = false
  db_instance_class     = "db.t4g.large"
  db_multi_az           = true
  deletion_protection   = true
  cache_node_type       = "cache.t4g.small"
  cache_replicas        = 1
  api_cpu               = 512
  api_memory            = 1024
  api_min_tasks         = 2
  api_max_tasks         = 6
  cloudflare_account_id = "acc123"
  zone_id               = "023e105f4ecef8ad9ca31a8372d0c353"
  zone_name             = "ikf.example"
  alarm_email           = "oncall@example.com"
  media_origins         = ["https://media.ikf-staging.example/funnels/"]
}

run "prod_profile_protects_data" {
  command = apply

  assert {
    condition     = module.database.multi_az && module.database.deletion_protection
    error_message = "Prod DB must be Multi-AZ with deletion protection."
  }
}

run "tasks_can_reach_db_and_cache" {
  command = apply

  assert {
    condition     = contains(module.core.task_security_group_ids, module.database.client_security_group_id) && contains(module.core.task_security_group_ids, module.cache.client_security_group_id)
    error_message = "core-api tasks must carry the DB and cache client SGs."
  }
}

run "api_is_exposed_through_cloudflare_host" {
  command = apply

  assert {
    condition     = output.api_fqdn == "api.ikf.example"
    error_message = "API must live at api.<zone>."
  }
}

run "task_policy_can_read_turnstile_secret" {
  command = apply

  assert {
    condition     = anytrue([for s in data.aws_iam_policy_document.task.statement : s.sid == "AppSecrets" && contains(s.resources, aws_secretsmanager_secret.turnstile.arn)])
    error_message = "core-api task policy must allow reading the Turnstile secret."
  }
}

run "core_api_can_refetch_rotated_db_password" {
  command = apply

  assert {
    condition     = local.core_environment["DB_SECRET_ARN"] == module.database.master_secret_arn
    error_message = "core-api must get DB_SECRET_ARN pointing at the RDS master secret."
  }

  assert {
    condition     = anytrue([for s in data.aws_iam_policy_document.task.statement : s.sid == "DbMasterSecret" && contains(s.actions, "secretsmanager:GetSecretValue") && contains(s.resources, module.database.master_secret_arn)])
    error_message = "core-api task role must be able to read the RDS master secret."
  }

  assert {
    condition     = anytrue([for s in data.aws_iam_policy_document.task.statement : s.sid == "AppSecrets" && contains(s.resources, aws_secretsmanager_secret.turnstile.arn)])
    error_message = "AppSecrets statement must stay intact."
  }
}

run "publisher_wiring" {
  command = apply

  variables {
    funnel_domains = { "try.aivideo.app" = { zone_id = "1a2b3c4d5e6f708192a3b4c5d6e7f801" } }
  }

  assert {
    condition     = alltrue([for n in ["cf-kv-api-token", "r2-access-key-id", "r2-secret-access-key", "bootstrap-admin-token"] : contains(keys(module.security.secret_arns), n)])
    error_message = "core-api needs the KV, R2 and bootstrap secrets."
  }

  assert {
    condition     = output.preview_host == "preview.${var.zone_name}" && output.worker_script_name == "ikf-edge-router-${var.env}"
    error_message = "Preview host and Worker name must follow the env naming."
  }

  assert {
    condition     = output.funnel_hosts == { "try.aivideo.app" = "active" }
    error_message = "Funnel hosts must be exported for sync-domains.sh."
  }
}

run "media_origins_must_be_https" {
  command = plan

  variables {
    media_origins = ["http://media.test/"]
  }

  expect_failures = [var.media_origins]
}

run "event_consumer_can_only_publish_alarms" {
  command = apply

  assert {
    condition     = aws_iam_user.event_alarms.name == "ikf-prod-event-alarms" && aws_iam_user_policy.event_alarms.user == aws_iam_user.event_alarms.name
    error_message = "event-consumer needs a dedicated IAM user per env."
  }

  assert {
    condition = (
      length(data.aws_iam_policy_document.event_alarms.statement) == 1 &&
      data.aws_iam_policy_document.event_alarms.statement[0].actions == toset(["sns:Publish"]) &&
      data.aws_iam_policy_document.event_alarms.statement[0].resources == toset([module.observability.alarm_topic_arn])
    )
    error_message = "The alarm user may only sns:Publish to the alarm topic."
  }

  assert {
    condition     = output.alarm_topic_arn == module.observability.alarm_topic_arn && output.consumer_state_kv_namespace_id == module.edge.consumer_state_kv_namespace_id
    error_message = "Deploy of event-consumer needs the alarm topic and its KV namespace id."
  }
}
```

Run:
```bash
export TF_PLUGIN_CACHE_DIR=$HOME/.terraform.d/plugin-cache
for d in infra/modules/edge infra/modules/funnel-domains infra/stack; do (cd $d && terraform init -backend=false -input=false >/dev/null && terraform test); done
```
Expected: FAIL — `edge`: `rules[1]` không tồn tại, `cloudflare_queue_consumer.events_dlq_pull` chưa khai báo; `funnel-domains`: `cloudflare_ruleset.collector_ratelimit` chưa khai báo; `stack`: `aws_iam_user.event_alarms` chưa khai báo.

- [ ] **Step 2: Implement module `edge`**

`infra/modules/edge/main.tf` (thay toàn bộ):

```hcl
locals {
  api_fqdn = "api.${var.zone_name}"
  paths    = join(" ", [for p in var.rate_limited_paths : "\"${p}\""])
}

resource "cloudflare_zone_setting" "ssl" {
  zone_id    = var.zone_id
  setting_id = "ssl"
  value      = "strict"
}

resource "cloudflare_zone_setting" "min_tls" {
  zone_id    = var.zone_id
  setting_id = "min_tls_version"
  value      = "1.2"
}

resource "cloudflare_zone_setting" "always_https" {
  zone_id    = var.zone_id
  setting_id = "always_use_https"
  value      = "on"
}

resource "cloudflare_dns_record" "api" {
  zone_id = var.zone_id
  name    = local.api_fqdn
  type    = "CNAME"
  content = var.alb_dns_name
  proxied = true
  ttl     = 1
}

resource "cloudflare_ruleset" "origin_auth" {
  zone_id = var.zone_id
  name    = "ikf origin auth header"
  kind    = "zone"
  phase   = "http_request_late_transform"
  rules = [{
    description = "Prove to the ALB that the request came through Cloudflare"
    expression  = "(http.host eq \"${local.api_fqdn}\")"
    action      = "rewrite"
    action_parameters = {
      headers = {
        "X-Origin-Auth" = {
          operation = "set"
          value     = var.origin_auth_secret
        }
      }
    }
  }]
}

resource "cloudflare_ruleset" "ratelimit" {
  zone_id = var.zone_id
  name    = "ikf rate limits"
  kind    = "zone"
  phase   = "http_ratelimit"
  rules = [{
    description = "Throttle OTP, checkout and claim per IP"
    expression  = "(http.host eq \"${local.api_fqdn}\" and http.request.uri.path in {${local.paths}})"
    action      = "block"
    ratelimit = {
      characteristics     = ["ip.src", "cf.colo.id"]
      period              = 10
      requests_per_period = var.rate_limit_requests_per_10s
      mitigation_timeout  = 10
    }
    }, {
    description = "Throttle the funnel event collector per IP (preview and any funnel host in this zone)"
    expression  = "(http.request.uri.path eq \"/_ikf/c\")"
    action      = "block"
    ratelimit = {
      characteristics     = ["ip.src", "cf.colo.id"]
      period              = 10
      requests_per_period = var.collector_requests_per_10s
      mitigation_timeout  = 10
    }
  }]
}

resource "cloudflare_r2_bucket" "bundles" {
  account_id = var.account_id
  name       = "ikf-bundles-${var.env}"
  location   = "enam"
}

resource "cloudflare_workers_kv_namespace" "routing" {
  account_id = var.account_id
  title      = "ikf-routing-${var.env}"
}

resource "cloudflare_queue" "events" {
  account_id = var.account_id
  queue_name = "ikf-events-${var.env}"
}

resource "cloudflare_queue" "events_dlq" {
  account_id = var.account_id
  queue_name = "ikf-events-${var.env}-dlq"
  settings = {
    # Longest retention Queues allows, so a ClickHouse outage can be replayed days later.
    message_retention_period = 1209600
  }
}

# `ikf events replay-dlq` pulls the DLQ over HTTP; the main queue's consumer is the
# event-consumer Worker, attached by wrangler deploy.
resource "cloudflare_queue_consumer" "events_dlq_pull" {
  account_id = var.account_id
  queue_id   = cloudflare_queue.events_dlq.queue_id
  type       = "http_pull"
  settings = {
    batch_size            = 100
    visibility_timeout_ms = 60000
  }
}

# Alarm throttle state of the event-consumer Worker (keys alarm:<kind>, 15-minute TTL).
resource "cloudflare_workers_kv_namespace" "consumer_state" {
  account_id = var.account_id
  title      = "ikf-consumer-state-${var.env}"
}

resource "cloudflare_turnstile_widget" "this" {
  account_id = var.account_id
  name       = "ikf-${var.env}"
  domains    = [var.zone_name]
  mode       = "managed"
}
```

`infra/modules/edge/variables.tf` (thay toàn bộ):

```hcl
variable "env" {
  type = string
}

variable "account_id" {
  type = string
}

variable "zone_id" {
  type = string
}

variable "zone_name" {
  type = string
}

variable "alb_dns_name" {
  type = string
}

variable "origin_auth_secret" {
  type      = string
  sensitive = true
}

variable "rate_limited_paths" {
  type    = list(string)
  default = ["/v1/otp", "/v1/checkout", "/v1/claim"]
}

variable "rate_limit_requests_per_10s" {
  type    = number
  default = 5
}

variable "collector_requests_per_10s" {
  description = "Per-IP limit on POST /_ikf/c (funnel events)."
  type        = number
  default     = 30
}
```

`infra/modules/edge/outputs.tf` (thay toàn bộ):

```hcl
output "api_fqdn" {
  value = local.api_fqdn
}

output "r2_bucket_name" {
  value = cloudflare_r2_bucket.bundles.name
}

output "kv_namespace_id" {
  value = cloudflare_workers_kv_namespace.routing.id
}

output "events_queue_name" {
  value = cloudflare_queue.events.queue_name
}

output "events_dlq_name" {
  value = cloudflare_queue.events_dlq.queue_name
}

output "consumer_state_kv_namespace_id" {
  value = cloudflare_workers_kv_namespace.consumer_state.id
}

output "turnstile_sitekey" {
  value = cloudflare_turnstile_widget.this.sitekey
}

output "turnstile_secret" {
  value     = cloudflare_turnstile_widget.this.secret
  sensitive = true
}
```

- [ ] **Step 3: Implement module `funnel-domains`**

`infra/modules/funnel-domains/main.tf` (thay toàn bộ):

```hcl
locals {
  # Zones holding funnel hosts, other than the platform zone (whose ratelimit ruleset lives in modules/edge).
  collector_zones = toset([for host, d in var.funnel_domains : d.zone_id if d.zone_id != var.platform_zone_id])
  hosts = merge(
    { for host, d in var.funnel_domains : host => d.zone_id },
    { "preview.${var.platform_zone_name}" = var.platform_zone_id },
  )
}

# 100:: is a discard address: nothing sits behind it, the Worker route answers every request.
resource "cloudflare_dns_record" "host" {
  for_each = local.hosts
  zone_id  = each.value
  name     = each.key
  type     = "AAAA"
  content  = "100::"
  proxied  = true
  ttl      = 1
}

resource "cloudflare_workers_route" "host" {
  for_each = local.hosts
  zone_id  = each.value
  pattern  = "${each.key}/*"
  script   = var.worker_script_name
}

# One http_ratelimit entrypoint per zone: if a funnel zone ever needs other rate limits, add them here.
resource "cloudflare_ruleset" "collector_ratelimit" {
  for_each = local.collector_zones
  zone_id  = each.value
  name     = "ikf funnel collector rate limit"
  kind     = "zone"
  phase    = "http_ratelimit"
  rules = [{
    description = "Throttle the funnel event collector per IP"
    expression  = "(http.request.uri.path eq \"/_ikf/c\")"
    action      = "block"
    ratelimit = {
      characteristics     = ["ip.src", "cf.colo.id"]
      period              = 10
      requests_per_period = var.collector_requests_per_10s
      mitigation_timeout  = 10
    }
  }]
}
```

`infra/modules/funnel-domains/variables.tf` (thay toàn bộ):

```hcl
variable "platform_zone_id" {
  type = string
}

variable "platform_zone_name" {
  type = string
}

variable "worker_script_name" {
  type = string
}

variable "funnel_domains" {
  description = "Funnel host => the Cloudflare zone holding it, and whether new routes may be attached (synced to core)."
  type = map(object({
    zone_id = string
    status  = optional(string, "active")
  }))
  default = {}

  validation {
    condition     = alltrue([for h, d in var.funnel_domains : contains(["active", "disabled"], d.status)])
    error_message = "status must be \"active\" or \"disabled\"."
  }

  validation {
    condition     = alltrue([for h, d in var.funnel_domains : can(regex("^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$", h))])
    error_message = "funnel_domains keys must be lowercase hostnames."
  }
}

variable "collector_requests_per_10s" {
  description = "Per-IP limit on POST /_ikf/c (funnel events)."
  type        = number
  default     = 30
}
```

- [ ] **Step 4: Implement stack (IAM user chỉ publish SNS)**

Thêm vào cuối `infra/stack/main.tf`:

```hcl
# The event-consumer Worker publishes alarms to SNS with this user's key (created by hand:
# aws iam create-access-key, then wrangler secret put). It can do nothing else.
resource "aws_iam_user" "event_alarms" {
  name = "ikf-${var.env}-event-alarms"
}

data "aws_iam_policy_document" "event_alarms" {
  statement {
    sid       = "PublishAlarms"
    actions   = ["sns:Publish"]
    resources = [module.observability.alarm_topic_arn]
  }
}

resource "aws_iam_user_policy" "event_alarms" {
  name   = "sns-publish-alarms"
  user   = aws_iam_user.event_alarms.name
  policy = data.aws_iam_policy_document.event_alarms.json
}
```

Thêm vào cuối `infra/stack/outputs.tf`:

```hcl
output "consumer_state_kv_namespace_id" {
  value = module.edge.consumer_state_kv_namespace_id
}

output "alarm_topic_arn" {
  value = module.observability.alarm_topic_arn
}

output "event_alarms_user" {
  value = aws_iam_user.event_alarms.name
}
```

- [ ] **Step 5: Chạy test Terraform, xác nhận PASS**

Run:
```bash
terraform fmt -recursive infra
terraform fmt -check -recursive infra
for d in infra/modules/edge infra/modules/funnel-domains infra/stack; do (cd $d && terraform test); done
```
Expected: fmt không báo gì; `edge`: `Success! 6 passed, 0 failed.`; `funnel-domains`: `Success! 6 passed, 0 failed.`; `stack`: `Success! 8 passed, 0 failed.`

- [ ] **Step 6: CI workflows**

`.github/workflows/edge-router.yml` (thay toàn bộ — test thêm event-schema + sdk; deploy build SDK trước render/deploy):

```yaml
name: edge-router

on:
  pull_request:
    paths: ["workers/edge-router/**", "packages/route-match/**", "packages/event-schema/**", "packages/sdk/**", "package-lock.json", ".github/workflows/edge-router.yml"]
  push:
    branches: [main]
    paths: ["workers/edge-router/**", "packages/route-match/**", "packages/event-schema/**", "packages/sdk/**", "package-lock.json", ".github/workflows/edge-router.yml"]

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      # edge-router's pretest builds the SDK bundle it serves (sdk-bundle.generated.js is not committed).
      - run: npm test -w @ikf/route-match -w @ikf/event-schema -w @ikf/sdk -w @ikf/edge-router

  deploy:
    if: github.event_name == 'push'
    needs: test
    runs-on: ubuntu-latest
    strategy:
      max-parallel: 1
      matrix:
        env: [staging, prod]
    environment: ${{ matrix.env }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - name: Build SDK bundle
        run: node packages/sdk/scripts/build.mjs
      - name: Render wrangler config
        working-directory: workers/edge-router
        env:
          WORKER_ENV: ${{ matrix.env }}
          KV_NAMESPACE_ID: ${{ vars.KV_NAMESPACE_ID }}
          R2_BUCKET: ${{ vars.R2_BUCKET }}
          PREVIEW_HOST: ${{ vars.PREVIEW_HOST }}
        run: node scripts/render-config.mjs > wrangler.deploy.json
      - name: Deploy
        working-directory: workers/edge-router
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_WORKERS_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ vars.CLOUDFLARE_ACCOUNT_ID }}
        run: npx wrangler deploy -c wrangler.deploy.json
      - name: Smoke
        # Routes are created by Terraform after the first deploy; skip until PREVIEW_ROUTED is set.
        if: vars.PREVIEW_ROUTED == 'true'
        run: scripts/smoke-edge.sh "${{ vars.PREVIEW_HOST }}"
```

`.github/workflows/packages.yml` (thay toàn bộ):

```yaml
name: packages

on:
  pull_request:
    paths: ["packages/**", "package-lock.json", ".github/workflows/packages.yml"]
  push:
    branches: [main]
    paths: ["packages/**", "package-lock.json", ".github/workflows/packages.yml"]

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test -w @ikf/route-match -w @ikf/event-schema -w @ikf/sdk -w @ikf/cli
```

`.github/workflows/event-consumer.yml`:

```yaml
name: event-consumer

on:
  pull_request:
    paths: ["workers/event-consumer/**", "clickhouse/**", "package-lock.json", ".github/workflows/event-consumer.yml"]
  push:
    branches: [main]
    paths: ["workers/event-consumer/**", "clickhouse/**", "package-lock.json", ".github/workflows/event-consumer.yml"]

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      # Node tests start ClickHouse with Testcontainers (Docker is available on ubuntu-latest).
      - run: npm test -w @ikf/event-consumer

  deploy:
    if: github.event_name == 'push'
    needs: test
    runs-on: ubuntu-latest
    strategy:
      max-parallel: 1
      matrix:
        env: [staging, prod]
    environment: ${{ matrix.env }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - name: Render wrangler config
        working-directory: workers/event-consumer
        env:
          WORKER_ENV: ${{ matrix.env }}
          STATE_KV_NAMESPACE_ID: ${{ vars.CONSUMER_STATE_KV_NAMESPACE_ID }}
          SNS_TOPIC_ARN: ${{ vars.ALARM_TOPIC_ARN }}
          AWS_REGION: ${{ vars.AWS_REGION }}
        run: node scripts/render-config.mjs > wrangler.deploy.json
      - name: Deploy
        working-directory: workers/event-consumer
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_WORKERS_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ vars.CLOUDFLARE_ACCOUNT_ID }}
        run: npx wrangler deploy -c wrangler.deploy.json
```

Run: `docker run --rm -v "$PWD:/repo" -w /repo rhysd/actionlint:latest`
Expected: không báo lỗi.

- [ ] **Step 7: Commit**

```bash
git add infra .github/workflows
git commit -m "feat(infra): rate limit /_ikf/c, DLQ pull consumer, consumer KV, SNS publish user; CI for event-consumer"
```

- [ ] **Step 8: Ghi lại bước secrets/biến (thủ công, chạy khi dựng staging/prod — xem "Theo sau")**

Không commit giá trị nào. Sau `terraform apply` của env:

```bash
cd infra/envs/<env>
gh variable set CONSUMER_STATE_KV_NAMESPACE_ID --env <env> --body "$(terraform output -raw consumer_state_kv_namespace_id)"
gh variable set ALARM_TOPIC_ARN --env <env> --body "$(terraform output -raw alarm_topic_arn)"
gh variable set AWS_REGION --env <env> --body us-east-1
aws iam create-access-key --user-name "$(terraform output -raw event_alarms_user)"   # lưu vào password manager
```

Sau lần deploy đầu của mỗi Worker (`wrangler secret put` hỏi giá trị qua stdin, không lưu vào shell history):

```bash
cd workers/edge-router
npx wrangler secret put IP_SALT --name ikf-edge-router-<env>
cd ../event-consumer
for s in CLICKHOUSE_URL CLICKHOUSE_USER CLICKHOUSE_PASSWORD AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY; do
  npx wrangler secret put "$s" --name ikf-event-consumer-<env>
done
```

---

### Task 13: Playwright — SDK trên 3 `demo.html` thật

**Files:**
- Create: `packages/sdk/playwright.config.js`, `packages/sdk/e2e/server.js`, `packages/sdk/e2e/funnels.spec.js`
- Modify: `packages/sdk/package.json` (script `e2e`, devDependency `@playwright/test`)

**Demo được chọn** (đã kiểm tra trong `IKF_FUNNELS_DIR`, mặc định `/Users/daothinh/ikame/funnel/funnel-development`; thiếu thư mục → test `skip`):

| Demo | Vì sao |
|---|---|
| `learning/ewa-books/demo.html` | Bản mẫu chuẩn: 8 event chuẩn, `dataLayer.push(d)` + `ikfunnel:*` với `{...d, data}` (A15) |
| `mental-health/calmio-calm-kids/demo.html` | Có `<!doctype>` + `<head>`, tự gọi `window.fbq('trackCustom', …, answers)` (A1), có trường ngày sinh |
| `chat-ai-character/chai-ai-girlfriend/demo.html` | Có `<!doctype>`, **không** có `<head>`; dùng `CONFIG.slug` |

**Interfaces:**
- Consumes: `injectIkf` (Task 8), `buildSdk({write:false})` (Task 5), `window.IKF.flush()` (Task 4), `window.go(n)` và `window.emit(name, detail)` của funnel (khai báo top-level trong script thường nên nằm trên `window`).
- Produces: `startFunnelServer({file, funnel, country?, pixel?}) → {origin, posts, events(), close()}`; lệnh `npm run e2e -w @ikf/sdk`.

- [ ] **Step 1: Cài Playwright**

```bash
npm install -D -w @ikf/sdk @playwright/test@~1.63.0
npm pkg set -w @ikf/sdk scripts.e2e="playwright test"
npx -w @ikf/sdk playwright install chromium
```

`packages/sdk/playwright.config.js`:

```js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  workers: 1,
  reporter: 'list',
  use: { ...devices['Pixel 7'], browserName: 'chromium' },
});
```

`vitest.config.js` của SDK chỉ nhận `test/**/*.test.js`, nên Vitest không chạy nhầm `e2e/*.spec.js`.

- [ ] **Step 2: Server local giống Worker**

`packages/sdk/e2e/server.js`:

```js
// Serves a real demo.html the way the edge-router Worker does: same injectIkf, same SDK bundle,
// and records every POST /_ikf/c body.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { injectIkf } from '../../../workers/edge-router/src/inject.js';
import { buildSdk } from '../scripts/build.mjs';

export async function startFunnelServer({ file, funnel, country = 'US', pixel = '123456789012345' }) {
  const { code, hash } = await buildSdk({ write: false });
  const sdkSrc = `/_ikf/sdk.${hash}.js`;
  const posts = [];
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      if (req.method === 'POST' && url.pathname === '/_ikf/c') {
        let body = '';
        for await (const chunk of req) body += chunk;
        posts.push({ contentType: req.headers['content-type'], origin: req.headers.origin, body });
        res.writeHead(204).end();
        return;
      }
      if (url.pathname === sdkSrc) {
        res.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8' }).end(code);
        return;
      }
      if (url.pathname === '/promo') {
        const html = injectIkf(await readFile(file, 'utf8'), { funnel, v: 1, rev: 1, country, pixel, preview: false }, { sdkSrc });
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache' }).end(html);
        return;
      }
      res.writeHead(404).end();
    } catch (err) {
      res.writeHead(500).end(String(err));
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return {
    origin: `http://127.0.0.1:${server.address().port}`,
    posts,
    events: () => posts.flatMap((p) => JSON.parse(p.body).events),
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}
```

- [ ] **Step 3: Viết test**

`packages/sdk/e2e/funnels.spec.js`:

```js
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect } from '@playwright/test';
import { startFunnelServer } from './server.js';

const DIR = process.env.IKF_FUNNELS_DIR || '/Users/daothinh/ikame/funnel/funnel-development';

// One standard funnel (dataLayer + ikfunnel:* with the same detail), one with doctype + <head> that
// calls window.fbq('trackCustom', …, answers) itself, one with doctype and no <head>.
const DEMOS = [
  { name: 'standard (dataLayer + dispatchEvent)', path: 'learning/ewa-books/demo.html', funnel: 'ewa-books' },
  { name: 'with <head>, calls fbq itself', path: 'mental-health/calmio-calm-kids/demo.html', funnel: 'calmio-calm-kids' },
  { name: 'without <head>', path: 'chat-ai-character/chai-ai-girlfriend/demo.html', funnel: 'chai-ai-girlfriend' },
];

const PII = ['e2e.person@example.com', 'e2e.person%40example.com', '1990-01-02', '555-0100', '4155550100'];

// Stand-in for fbevents.js: records what reaches Meta, including the calls queued before it loaded.
const FAKE_FBEVENTS = `(function(){var f=window._fbq||window.fbq;window.__fbqCalls=window.__fbqCalls||[];
f.callMethod=function(){window.__fbqCalls.push(Array.prototype.slice.call(arguments))};
var q=f.queue||[];f.queue=[];q.forEach(function(a){f.callMethod.apply(f,a)});})();`;

async function open(page, srv) {
  const metaRequests = [];
  await page.route('https://connect.facebook.net/**', (route) => {
    metaRequests.push(route.request().url());
    return route.fulfill({ contentType: 'text/javascript', body: FAKE_FBEVENTS });
  });
  // Everything else off-origin (fonts, media) is irrelevant to the SDK.
  await page.route((url) => !url.href.startsWith(srv.origin) && !url.href.startsWith('https://connect.facebook.net/'), (r) => r.abort());
  await page.goto(`${srv.origin}/promo?utm_source=meta&utm_campaign=e2e&fbclid=E2Eclick`);
  await page.waitForFunction(() => typeof window.go === 'function' && typeof window.emit === 'function' && !!window.IKF);
  return metaRequests;
}

async function walk(page) {
  for (let i = 1; i <= 6; i += 1) {
    await page.evaluate((n) => window.go(n), i);
    await page.waitForTimeout(100);
  }
  // The funnel's own emit(), with PII in keys a funnel might use and in values under innocent keys.
  await page.evaluate(() => {
    window.emit('lead', { email: 'e2e.person@example.com', dob: '1990-01-02', phone: '+1 415 555 0100', note: 'reach me at e2e.person@example.com', when: '1990-01-02', tel_text: '(415) 555-0100' });
    window.emit('checkout_click', { plan: 'w4', value: 19.99, currency: 'USD', url: 'https://pay.example/?email=e2e.person%40example.com' });
  });
  await page.evaluate(() => window.IKF.flush());
}

test.describe('SDK on real funnels', () => {
  test.skip(!existsSync(DIR), `IKF_FUNNELS_DIR not found: ${DIR}`);

  for (const demo of DEMOS) {
    test(`${demo.name}: events captured, no PII, Pixel with eventIDs`, async ({ page }) => {
      const file = join(DIR, demo.path);
      test.skip(!existsSync(file), `missing ${file}`);
      const srv = await startFunnelServer({ file, funnel: demo.funnel, country: 'US' });
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      try {
        const metaRequests = await open(page, srv);
        await walk(page);
        await expect.poll(() => srv.events().map((e) => e.name)).toEqual(expect.arrayContaining(['page_load', 'funnel_start', 'screen_view', 'lead', 'checkout_click']));

        const events = srv.events();
        for (const e of events) {
          expect(e).toMatchObject({ funnel: demo.funnel, v: 1, rev: 1, path: '/promo', attr: { utm_source: 'meta', utm_campaign: 'e2e', fbclid: 'E2Eclick' } });
        }
        expect(events.filter((e) => e.name === 'funnel_start')).toHaveLength(1);
        expect(new Set(events.map((e) => e.id)).size).toBe(events.length);
        expect(srv.posts.every((p) => p.origin === srv.origin)).toBe(true);
        const raw = srv.posts.map((p) => p.body).join('\n');
        for (const s of PII) expect(raw).not.toContain(s);

        expect(metaRequests).toHaveLength(1);
        const calls = await page.evaluate(() => window.__fbqCalls);
        const idOf = (name) => events.find((e) => e.name === name).id;
        expect(calls).toContainEqual(['init', '123456789012345']);
        expect(calls).toContainEqual(['track', 'PageView', {}, { eventID: idOf('page_load') }]);
        expect(calls).toContainEqual(['track', 'Lead', {}, { eventID: idOf('lead') }]);
        expect(calls).toContainEqual(['track', 'InitiateCheckout', { value: 19.99, currency: 'USD' }, { eventID: idOf('checkout_click') }]);
        expect(calls.filter((c) => c[0] === 'track' || c[0] === 'trackCustom').map((c) => c[1]).sort()).toEqual(['InitiateCheckout', 'Lead', 'PageView']);
        expect(JSON.stringify(calls)).not.toContain('e2e.person');
        expect(errors).toEqual([]);
      } finally {
        await srv.close();
      }
    });
  }

  test('EEA visitor: banner, no Pixel until Accept, then PageView for the same page_load', async ({ page }) => {
    const demo = DEMOS[2];
    const file = join(DIR, demo.path);
    test.skip(!existsSync(file), `missing ${file}`);
    const srv = await startFunnelServer({ file, funnel: demo.funnel, country: 'DE' });
    try {
      const metaRequests = await open(page, srv);
      await expect(page.locator('#ikf-consent button[data-c="granted"]')).toBeVisible();
      await page.evaluate(() => window.emit('lead', {}));
      await page.evaluate(() => window.IKF.flush());
      await expect.poll(() => srv.events().map((e) => e.name)).toContain('lead');
      expect(metaRequests).toHaveLength(0);
      expect(srv.events().every((e) => e.aid === null)).toBe(true);
      expect(await page.evaluate(() => document.cookie)).not.toContain('_fbp');

      await page.locator('#ikf-consent button[data-c="granted"]').click();
      await expect.poll(() => metaRequests.length).toBe(1);
      const pageLoad = srv.events().find((e) => e.name === 'page_load');
      await expect.poll(() => page.evaluate(() => window.__fbqCalls || [])).toContainEqual(['track', 'PageView', {}, { eventID: pageLoad.id }]);
      expect(await page.locator('#ikf-consent').count()).toBe(0);
    } finally {
      await srv.close();
    }
  });
});
```

- [ ] **Step 4: Chạy**

Run: `npm run e2e -w @ikf/sdk`
Expected: `4 passed`. Lúc viết plan, test `standard` đã **fail** trước khi có A15 (`funnel_start` xuất hiện 2 lần) — nếu thấy lỗi này thì Task 2 đã bị làm theo luật chống trùng gốc.

Run thêm (xác nhận skip khi không có thư mục funnel): `IKF_FUNNELS_DIR=/nonexistent npm run e2e -w @ikf/sdk`
Expected: `4 skipped`.

- [ ] **Step 5: Chạy lại toàn bộ test của nhánh**

```bash
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock
npm test -w @ikf/event-schema -w @ikf/sdk -w @ikf/cli -w @ikf/edge-router -w @ikf/event-consumer -w @ikf/core-api -w @ikf/route-match
```
Expected: event-schema 65, sdk 92, cli 70, edge-router 69, event-consumer 7 + 16, core-api 104, route-match 35 — tất cả PASS.

- [ ] **Step 6: Commit**

```bash
git add package-lock.json packages/sdk
git commit -m "test(sdk): Playwright on three real funnels: capture, no PII, Pixel eventIDs, EEA consent"
```

---

## Theo sau (thủ công, ngoài phạm vi plan này)

Staging checklist **không** phải task của plan; ghi lại để người dựng staging làm theo thứ tự:

1. `terraform apply` staging (Task 12) → đặt GitHub variables + tạo access key (Task 12 Step 8).
2. ClickHouse Cloud: chạy `clickhouse/001_events.sql` trên database `ikf` (`curl --user ikf_admin … --data-binary @clickhouse/001_events.sql "https://<host>:8443/?database=ikf"`).
3. Merge → workflow `event-consumer` và `edge-router` deploy; `wrangler secret put` các secret; deploy lại một lần cho chắc.
4. `ikf funnel set <pilot> --pixel <id>`; mở funnel pilot, Meta Events Manager → Test Events thấy `PageView`, `Lead`, `InitiateCheckout`, mỗi event có `eventID`.
5. Đo ≥ 99%: chạy Playwright (Task 13) trỏ vào URL staging, đếm event phía trình duyệt, so `SELECT uniqExact(id) FROM events WHERE sid IN (…)`; trong 1 phút phải có. `SELECT count() FROM events WHERE arrayExists(v -> match(v, '@'), mapValues(props))` = 0.
6. Banner qua VPN EU (DE, GB, CH), xác nhận không có request `connect.facebook.net` trước khi Accept.
7. p95 TTFB trước/sau SDK (k6 `loadtest/edge-router.js` của plan trước), chênh ≤ 20ms; k6 bắn `POST /_ikf/c` 400 rps xem rate limit trả 429 theo IP, không có 5xx.
8. Thử DLQ: đổi tạm `CLICKHOUSE_PASSWORD` sai → thấy alarm `insert_failing` rồi `dlq` (mỗi loại 1 email / 15 phút) → sửa lại → `ikf events replay-dlq --env staging` → số dòng khớp.

---

## Self-Review

**Spec coverage:**

| Spec | Task |
|---|---|
| Mục tiêu / điều kiện xong (99%, không email, Test Events, TTFB) | 13 (local), "Theo sau" 4–7 (staging) |
| Quyết định #1 phạm vi (ClickHouse + Pixel 3 event + click id/UTM, không CAPI) | 1–4, 9–10 |
| Quyết định #2 lọc PII ở SDK và collector, Pixel không có câu trả lời | 1, 4 (A1), 9, 13 |
| Quyết định #3 consent theo quốc gia | 3, 4, 13 |
| Quyết định #4 `funnels.pixel_id` → KV → `__IKF.pixel` | 6, 7, 8 |
| Quyết định #5 cùng domain, `/_ikf/sdk.<hash>.js`, `/_ikf/c`, Queue, consumer | 5, 8, 9, 10 |
| §1 Thành phần: event-schema, sdk, edge-router, event-consumer, core-api, cli, clickhouse, infra | 1, 2–5, 8–9, 10, 6, 7 + 11, 10, 12 |
| §2 Event SDK gửi (field, ULID, `name`, `screen`, `props`, `attr`) | 1, 4 |
| §2 Collector enrich (`received_at`, `country`, `ua_class`, `ip_hash`) | 9 |
| §2 Bảng ClickHouse, `ReplacingMergeTree`, trùng `id` | 10 (DDL + test FINAL) |
| §2 Core migration 002, KV `pixel`; `__IKF` | 6, 8 |
| §3 Nạp SDK sau `__IKF`, không async, ≤ 8KB gzip | 5, 8 |
| §3 Bắt event 3 đường, chống trùng 50ms, `page_load` | 2 (+A15), 4 |
| §3 Lọc PII + làm phẳng | 1 |
| §3 Gom/gửi: 20 / 5s / hidden / pagehide, beacon → fetch, giữ 200, 2000/session | 2, 4 |
| §3 Attribution, cookie `_fbc`/`_fbp`, `IKF.attribution()` | 3, 4 |
| §3 Meta Pixel (điều kiện nạp, bảng chuyển, `eventID`) | 4, 13 |
| §3 Consent (vùng, banner shadow DOM, `ikf_consent`, `aid` null) | 3, 4, 13 |
| §3 Không làm hỏng funnel | 2, 4 |
| §4 Collector 1–6 (method, content-type, 64KB, origin/referer, 400, validate, scrub, enrich, sendBatch, 503) | 9 |
| §4 Rate limit 30/10s | 12 |
| §4 `GET /_ikf/sdk.<hash>.js` | 8 |
| §5 Queue settings, insert async, Basic, 15s, ack/retry/chia đôi, DLQ, alarm SNS SigV4, 15 phút | 10, 12 (+A4–A6) |
| §5 `ikf events replay-dlq` | 11, 12 (pull consumer, A12) |
| §6 `PUT /v1/funnels/:slug` (404, 400, syncHost mọi host, pending) | 6 (+A14) |
| §6 `ikf funnel set` in số host | 7 |
| §7 Bảng xử lý lỗi | 2, 4 (SDK lỗi, storage), 9 (body sai, Queue lỗi), 10 (ClickHouse ngừng, dòng hỏng), 4 (Pixel lỗi, consent) |
| §8 Kiểm thử: unit, SDK happy-dom, Playwright 3 demo, pool-workers, ClickHouse Testcontainers, Postgres Testcontainers | 1, 2–5, 13, 8–9, 10, 6–7 |
| §8 Staging (thủ công + k6) | "Theo sau" |
| §9 Ngoài phạm vi | không có task (đúng) |

**Placeholder:** không có "TBD"/"tương tự Task N". Giá trị thật (endpoint ClickHouse, mật khẩu, salt, Pixel ID, access key) là đầu vào Task 0 / Task 12 Step 8, không phải phần thiếu của plan. Toàn bộ code trong plan đã chạy thử trên bản sao `feat/infra-edge-router@4f13c44` (Node 26, colima) với đúng số test ghi ở mỗi task.

**Nhất quán tên / kiểu:**
- Event `{id,sid,aid,t,name,funnel,v,rev,host,path,screen,props,attr}`: SDK `createSdk.track` (Task 4) = `validateEvent` (Task 1) = input collector (Task 9); collector thêm `{received_at,country,ua_class,ip_hash}` = `toRow` (Task 10) = cột ClickHouse.
- `__IKF = {funnel,v,rev,country,pixel,preview?}`: `injectIkf` (Task 8) → `createSdk` đọc `cfg.country`, `cfg.pixel`, `cfg.preview` (Task 4) → server e2e (Task 13) dùng chính `injectIkf`.
- KV route `{prefix,bundle,funnel,v,pixel}`: `syncHost` (Task 6) → `index.js` `route.pixel ?? null` (Task 8).
- `SDK_HASH`/`SDK_SOURCE`/`SDK_PATH`: `build.mjs` (Task 5) → `sdk.js` (Task 8) → test Task 8; CI build trước deploy (Task 12).
- Queue `ikf-events-<env>` / `ikf-events-<env>-dlq`: Terraform (có sẵn + Task 12), render-config edge-router (Task 9) và consumer (Task 10), `replayDlq` (Task 11), message alarm `dlq` (Task 10).
- Response `PUT /v1/funnels/:slug` `{funnel,pixel_id,hosts,synced,kv_sync,propagation_seconds}`: Task 6 ↔ CLI Task 7.
- Alarm kinds `dlq`, `insert_failing`; KV `STATE` key `alarm:<kind>` TTL 900: Task 10 ↔ namespace `consumer_state` Task 12.

**Review Focus đã ghim:** 1 → Task 2 + 13; 2 → Task 4 + 9 + 13; 3 → Task 10; 4 → Task 2 + 4; 5 → Task 5 + 8.

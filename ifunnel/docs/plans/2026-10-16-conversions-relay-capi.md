# iKame Funnel Platform — Conversions Relay (Meta CAPI) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mọi lần thu tiền thành công (mua lần đầu và gia hạn) tới pixel Meta của funnel trong vòng 5 phút dưới dạng `Purchase` qua Conversions API, đúng một lần, không PII thô; checkout không bao giờ chờ Meta.

**Architecture:**
- **Postgres** migration `009_capi.sql`: bảng `capi_events` (một dòng mỗi `payment.succeeded`, trạng thái `pending/sent/skipped/dead`), cột token (chỉ 4 ký tự cuối) và test code trên `apps`, `client_ip/client_ua/client_url` trên `checkouts` (IP/UA xoá sau 30 ngày).
- **core-api** `src/conversions/`: `event.js` (dựng event, hash, phân loại kết quả, backoff — hàm thuần), `relay.js` (tick `enqueue` anti-join outbox 7 ngày, tick `send` claim rồi gọi Graph API ngoài transaction, tick `sweep`), `store.js` (token theo app trong Secrets Manager `app-capi/<id>`), `setup.js`; chạy trong process core-api như entitlement-sync. Route `GET/PUT /v1/apps/:id/capi`, `GET /v1/capi-events`, `POST /v1/capi-events/:id/resend` theo quyền từng app của đợt 4b.
- **SDK** gửi `ads_consent`; checkout lưu consent, IP, UA, URL trang.
- **CLI** `ikf capi …`; **SPA** cài đặt Meta CAPI, trang Conversions, cảnh báo ở Tổng quan; **demo** fake Graph API + e2e; IAM cho `app-capi/*`.

**Tech Stack:** Node.js 22 trên CI (local Node 26) · JavaScript ESM · npm workspaces · Fastify 5 · `pg` 8 · `@aws-sdk/client-secrets-manager` (đã có) · Vitest ~3.2 · happy-dom 20 · `@testcontainers/postgresql` 11 · React 19 · react-router 7 · Vite 7 · Playwright 1.63. Không dependency mới.

**Spec:** `ifunnel/docs/specs/2026-10-16-conversions-relay-capi-design.md`. Bối cảnh: spec billing-paddle (outbox), entitlement-identity (`app-webhook` secret, `webhook_deliveries`), admin-console đợt 4b (quyền theo app).

**Repo / nhánh / worktree:** repo `/Users/daothinh/ikf-platform`. Nhánh **`feat/conversions-relay-capi`** cắt từ **`feat/admin-console-p4b`** — đã kiểm với tip **`0b8b00c`**. Worktree **`/Users/daothinh/ikf-platform-capi`** (controller tạo, `npm install`). PR vào base `feat/admin-console-p4b` (PR #11). **Không bao giờ** đụng working tree `/Users/daothinh/ikf-platform-*` khác; demo đang chạy từ `-admin-p3` trên 8080/8787/8790/8792 — không đụng.

**Môi trường chạy test (local):**
```bash
cd /Users/daothinh/ikf-platform-capi
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock
export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock
```
`npm run demo:test` chạy một mình. Bộ core-api đầy đủ ~8–10 phút; file chỉ fail vì timeout hook 120 s của Testcontainers → chạy lại riêng file đó.

Số test ở mỗi task là số **thật** khi chạy code của plan trên bản sao `0b8b00c` (Node 26, colima, 2026-10-16); mọi khối code/patch sinh từ commit của cây scratch đã chạy test đó (trùng từng byte). Mốc tại `0b8b00c`: paddle 34, event-schema 145, funnel-lint 35, sdk 159 (8154 B gzip), cli **244** (24 file), edge-router 106, event-consumer 8 + 27, core-api **707** (74 file), route-match 35, admin **248** (28 file); `demo:test` **133** (24 file).

## Điều chỉnh so với spec (phát hiện khi đọc code và chạy thử, 2026-10-16)

| # | Spec ghi | Plan làm | Lý do |
|---|---|---|---|
| A1 | Xoá token → xoá secret | Ghi đè secret bằng `cleared` (PutSecretValue), `get` coi `cleared` = không có; IAM không có `DeleteSecret` (Task 5, 9) | Secret đã xoá chặn tạo lại cùng tên 7 ngày |
| A2 | `access_token` là trường form | Body JSON `{data, access_token, test_event_code?}`; không bao giờ trên URL (Task 3, 5) | Một kiểu mã hoá cho test và fake server |
| A3 | `event_source_url = https://<host>/<slug>` | Cột mới `checkouts.client_url` (Referer bỏ query/fragment, chỉ `https:` hoặc localhost, ≤1024); có URL → `action_source: website` + `event_source_url`, không có → `system_generated` (Task 1, 3) | Checkout chưa bao giờ lưu host; Meta bắt buộc `event_source_url` với `website` |
| A4 | Lỗi token: 401/403, code 190 | Thêm Meta code 10/200 (quyền pixel); mã lỗi `meta_<code>[_<subcode>]`, `http_<status>`, `network`, `secrets_<name>` khi Secrets Manager lỗi (retry) (Task 3, 5) | Lỗi quyền pixel cũng không bao giờ tự hết |
| A5 | Alarm `capi_token_invalid {app_id}` một lần/app/giờ | Tên alarm `capi_token_invalid:<app_id>` (throttle theo tên → mỗi app riêng); cửa sổ throttle sẵn có 15 phút, không phải 1 giờ (Task 5) | Một tên chung sẽ che token hỏng của app thứ hai; giữ throttle chung của hệ thống |
| A6 | Quyền route | Xem = `viewer` trong app; PUT/resend = `admin` trong app; `GET /v1/capi-events` không `?app=` → `400 app_required` trước khi kiểm quyền; app không tồn tại ở PUT/list → `404 app_not_found`; body PUT rỗng → `400 bad_request`; xoá token khi không có store → `503 capi_unavailable` (Task 6) | Theo mô hình 4b; spec không nói các trường hợp biên |
| A7 | `counts_24h`, `dead_24h` | Đếm theo `created_at` của event (không có cột updated) (Task 6) | Đơn giản, đủ cho cảnh báo |
| A8 | Lưu token | Secret trước, rồi transaction DB; DB lỗi thì secret giữ token mới, PUT lại là khớp (Task 6) | Theo thứ tự "secret first" của spec |
| A9 | `META_GRAPH_URL` | Phải `https:` (cho `http:` chỉ khi `APP_ENV=local`) (Task 5) | Token đi trong body |
| A10 | Relay bật khi có giá trị | Cần `SECRETS_PREFIX`; route luôn đăng ký; demo không chạy `server.js` mà tự gọi `buildApp` + `startConversions` với `memoryTokenStore` (Task 5, 9) | Route test được không cần AWS; demo không sửa `services/` |
| A11 | SPA "tab Meta CAPI" trong Cài đặt | Thẻ (card) "Meta CAPI" trên trang Cài đặt app (trang không có tab); viewer không vào được Cài đặt (cần `apps:read`) nên chế độ chỉ-đọc là của editor; xác nhận xoá bằng dialog trong trang; menu "Conversions" giữa Webhooks và Audit (Task 8) | Theo cấu trúc trang hiện có |
| A12 | Demo: Starlyn mua + gia hạn | e2e làm qua API trên Starlyn; demo tương tác `npm run demo:purchase` bán `witch-power` của app `demo` → xem ở `/apps/demo/conversions`; `run.mjs` in dòng `CAPI:` với link và `http://127.0.0.1:8793/__requests` (Task 9) | Chuyển `witch-power` sang Starlyn làm hỏng test cũ |
| A13 | Bundle SDK | 8154 → **8183 B** gzip (ngân sách 8192, còn 9 B); hai test `toEqual` attribution thêm `ads_consent: 'granted'` (Task 2) | Trường mới bắt buộc xuất hiện trong object |
| A14 | `enqueue` | Trả `{created, skipped}` (`created` = mọi dòng tạo, `skipped` ⊂ created); `ON CONFLICT DO NOTHING` không target (chắn cả `event_id`) (Task 4) | Spec không định nghĩa giá trị trả |
| A15 | Thứ tự skip `no_app, no_pixel, no_token, no_consent, too_old` | Sau review toàn nhánh: `no_app, no_pixel, no_consent, zero_value, no_token, too_old`; giao dịch `value_minor <= 0` (trial) → `skipped zero_value` | Token đến sau không bao giờ gửi giao dịch khách từ chối hoặc 0đ |
| A16 | `website` khi có `client_url` | `website` chỉ khi có cả `client_url` và `client_ua`; còn lại `system_generated` | Gia hạn sau sweep 30 ngày không còn UA; Meta yêu cầu UA cho `website` |
| A17 | Lỗi Meta | Mã tạm thời `1, 2, 4, 17, 32, 613, 80004` hoặc `is_transient`, và HTTP 408 → retry (xét trước nhánh token); lúc gửi, event quá 7 ngày → `skipped too_old`; `client_ip` chỉ lưu khi `net.isIP`; payload outbox hỏng bị lọc ở enqueue | Một event xấu không giết cả lô 50; một dòng hỏng không chặn enqueue 7 ngày |
| A18 | Cache token 10 phút | Cache bị bỏ khi `apps.capi_token_set_at` mới hơn lúc cache; alarm tiền tố `ikf conversions:`; ghi kết quả chỉ khi dòng còn `pending` với đúng `attempts` đã claim; app có `set_at` mà secret mất → backoff `no_token_secret` rồi `dead` | Đổi token có hiệu lực ở mọi task core-api ngay lần gửi sau; không ghi đè kết quả mới hơn |

## Global Constraints

- Code trong repo `ikf-platform`, nhánh `feat/conversions-relay-capi` (từ `feat/admin-console-p4b@0b8b00c`), worktree `/Users/daothinh/ikf-platform-capi`, PR base `feat/admin-console-p4b`. JavaScript, không TypeScript. Không dependency mới; SPA một file CSS.
- **Token CAPI không bao giờ nằm trong Postgres, log, audit, response hay URL**; chỉ ở Secrets Manager `ikf/<env>/app-capi/<app_id>` (Postgres giữ 4 ký tự cuối).
- **Log/audit không email khách, `user_id`, IP, user-agent, fbc/fbp, body gửi Meta, `err.message`**, không SQL có tham số. Body gửi Meta không có email thô (chỉ SHA-256 sau trim + lowercase).
- `capi_events` không chứa email/IP/UA/fbc/fbp; relay đọc chúng lúc gửi.
- Mọi `payment.succeeded` trong 7 ngày → đúng một dòng `capi_events`; `event_id = paddle_transaction_id`; gọi Graph API **ngoài** transaction giữ khoá.
- Lý do skip theo thứ tự: `no_app`, `no_pixel`, `no_token`, `no_consent`, `too_old`. Backoff 1m, 5m, 30m, 2h, 6h; lần thứ 6 lỗi → `dead`; lỗi token → `dead` ngay + alarm.
- Quyền: xem = `viewer` trong app; sửa token/test code và gửi lại = `admin` trong app; ngoài phạm vi GET → 404, ghi → 403 (đợt 4b).
- `META_GRAPH_URL` mặc định `https://graph.facebook.com/v21.0`.
- Demo: không sửa `services/` từ `demo/`; e2e cổng/DB riêng; không `terraform apply`. Bundle SDK chỉ tăng vì trường `ads_consent`.
- Test cũ giữ nguyên ý nghĩa; chỉ sửa đúng chỗ từng task ghi.

## Review Focus

1. **Gia hạn (renewal) không có `checkout_id`**: mong vẫn gửi Purchase với attribution/consent của checkout đầu của subscription. Test: Task 4 (consent qua subscription), Task 5 (body của renewal có fbc/fbp của checkout đầu).
2. **Token sai/hết hạn hoặc thiếu quyền pixel**: mong `dead` ngay, một alarm, không retry vô ích; nhập token mới rồi "Gửi lại" thì đi. Test: Task 5 (401/190), Task 6 (resend), Task 9 e2e.
3. **Hai process core-api cùng chạy relay** (ECS 2+ task): mỗi `event_id` POST đúng một lần; process chết giữa chừng thì dòng quay lại sau 2 phút. Test: Task 4 (enqueue song song), Task 5 (send song song, crash).
4. **Tiền không có phần thập phân (JPY/KRW)**: mong `value` đúng số tiền, không chia 100. Test: Task 3.
5. **Token lộ qua bất kỳ đường nào** (response, audit, log, CLI stdout, SPA DOM): mong không bao giờ. Test: Task 5 (log), Task 6 (response + audit), Task 7 (CLI), Task 8 (DOM).

## File Structure (repo `ikf-platform`, phần mới/sửa)

- **Task 1:** `services/core-api/migrations/009_capi.sql` (mới), `services/core-api/src/billing/checkout.js`, `services/core-api/src/http/checkout.js`, `services/core-api/test/capi-schema.test.js` (mới), `services/core-api/test/checkout.test.js`, `services/core-api/test/migrate.test.js`
- **Task 2:** `packages/sdk/src/index.js`, `packages/sdk/test/checkout.test.js`, `packages/sdk/test/sdk.test.js`
- **Task 3:** `services/core-api/src/conversions/event.js` (mới), `services/core-api/test/conversions-event.test.js` (mới)
- **Task 4:** `services/core-api/src/conversions/relay.js` (mới), `services/core-api/test/conversions-enqueue.test.js` (mới)
- **Task 5:** `services/core-api/src/config.js`, `services/core-api/src/conversions/relay.js`, `services/core-api/src/conversions/setup.js` (mới), `services/core-api/src/conversions/store.js` (mới), `services/core-api/src/identity/webhooks.js`, `services/core-api/src/server.js`, `services/core-api/test/config.test.js`, `services/core-api/test/conversions-send.test.js` (mới), `services/core-api/test/conversions-store.test.js` (mới)
- **Task 6:** `services/core-api/src/admin/resolve.js`, `services/core-api/src/app.js`, `services/core-api/src/http/capi.js` (mới), `services/core-api/src/http/schemas.js`, `services/core-api/src/identity/app-summary.js`, `services/core-api/test/capi-http.test.js` (mới), `services/core-api/test/scope-capi.test.js` (mới)
- **Task 7:** `packages/cli/src/api.js`, `packages/cli/src/main.js`, `packages/cli/test/capi.test.js` (mới)
- **Task 8:** `apps/admin/src/App.jsx`, `apps/admin/src/Layout.jsx`, `apps/admin/src/api.js`, `apps/admin/src/components/CapiSettings.jsx` (mới), `apps/admin/src/icons.jsx`, `apps/admin/src/pages/AppConversions.jsx` (mới), `apps/admin/src/pages/AppOverview.jsx`, `apps/admin/src/pages/AppSettings.jsx`, `apps/admin/test/capi-settings.test.jsx` (mới), `apps/admin/test/conversions.test.jsx` (mới), `apps/admin/test/grants.test.jsx`, `apps/admin/test/helpers.jsx`, `apps/admin/test/layout-app.test.jsx`, `apps/admin/test/scope-ui.test.jsx`
- **Task 9:** `CLAUDE.md`, `demo/README.md`, `demo/lib/fake-graph.mjs` (mới), `demo/lib/seed.mjs`, `demo/lib/stack.mjs`, `demo/run.mjs`, `demo/test/capi-e2e.test.mjs` (mới), `demo/test/fake-graph.test.mjs` (mới), `docs/runbooks/admin-console.md`, `infra/stack/main.tf`, `infra/stack/tests/stack.tftest.hcl`

---

### Task 1: Migration 009 + checkout lưu IP/UA/URL/consent

**Files:**
- Create: `services/core-api/migrations/009_capi.sql`
- Modify: `services/core-api/src/billing/checkout.js`, `services/core-api/src/http/checkout.js`
- Test: `services/core-api/test/capi-schema.test.js` (mới); sửa `services/core-api/test/checkout.test.js` (thêm 4 test), `services/core-api/test/migrate.test.js` (danh sách migration + bảng `capi_events`)

**Interfaces:**
- Consumes: `cleanAttr` (`@ikf/event-schema`), `createCheckout` hiện có (`ip` đã dùng cho Turnstile).
- Produces:
  - Bảng `capi_events` (cột theo spec §1), `apps.capi_token_last4/capi_token_set_at/capi_test_code`, `checkouts.client_ip/client_ua/client_url`, index `capi_events_due`, `capi_events_by_app`, `outbox_payment_recent`.
  - `cleanAttribution` giữ `ads_consent` chỉ khi là `granted` / `denied` / `unknown_required` (ruling C7).
  - `cleanClientUrl(referer)` (export từ `src/billing/checkout.js`): `origin + pathname` khi protocol `https:` hoặc `http:` trên `localhost`/`127.0.0.1`, tối đa 1024 ký tự, nếu không thì `null` (ruling C3).
  - `createCheckout(deps, { origin, ip, ua, referer, body })`: ghi `client_ip = ip`, `client_ua` (cắt 512, `NULL` khi thiếu/rỗng), `client_url`. Handler HTTP truyền `req.headers['user-agent']` và `req.headers.referer`.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/capi-schema.test.js` (mới):

`services/core-api/test/capi-schema.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';

const q = (db, sql, p) => db.pool.query(sql, p);

// Spec conversions-relay §1: migration 009 (apps.capi_*, checkouts.client_ip/ua/url, capi_events).
describe('migration 009_capi', () => {
  let db;
  let outboxId = 0;
  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    outboxId = 0;
  });

  const columns = async (table) =>
    (await q(db, "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = $1", [table])).rows;
  const outbox = async () => {
    outboxId += 1;
    return (await q(db, "INSERT INTO outbox (topic, aggregate_id, dedupe_key, payload) VALUES ('payment.succeeded', 'txn', $1, '{}') RETURNING id", [`k${outboxId}`])).rows[0].id;
  };
  const event = async ({ outbox_id, event_id = 'txn_1', ...rest } = {}) => {
    const oid = outbox_id ?? (await outbox());
    const cols = { outbox_id: oid, event_id, value_minor: 999, currency: 'USD', event_time: new Date().toISOString(), ...rest };
    const keys = Object.keys(cols);
    return q(db, `INSERT INTO capi_events (${keys.join(', ')}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`, keys.map((k) => cols[k]));
  };

  it('adds the app token metadata and the checkout client columns, all nullable', async () => {
    const apps = Object.fromEntries((await columns('apps')).map((c) => [c.column_name, c]));
    expect(apps.capi_token_last4).toMatchObject({ data_type: 'text', is_nullable: 'YES' });
    expect(apps.capi_token_set_at).toMatchObject({ data_type: 'timestamp with time zone', is_nullable: 'YES' });
    expect(apps.capi_test_code).toMatchObject({ data_type: 'text', is_nullable: 'YES' });
    const checkouts = Object.fromEntries((await columns('checkouts')).map((c) => [c.column_name, c]));
    for (const c of ['client_ip', 'client_ua', 'client_url']) expect(checkouts[c]).toMatchObject({ data_type: 'text', is_nullable: 'YES' });
  });

  it('capi_events has the spec columns and applies the defaults', async () => {
    const names = (await columns('capi_events')).map((c) => c.column_name).sort();
    expect(names).toEqual([
      'app_id', 'attempts', 'created_at', 'currency', 'event_id', 'event_time', 'funnel_id', 'id', 'last_error', 'next_attempt_at',
      'outbox_id', 'pixel_id', 'sent_at', 'skip_reason', 'status', 'test_code', 'value_minor',
    ]);
    const { rows } = await event();
    expect(rows[0]).toMatchObject({ status: 'pending', attempts: 0, skip_reason: null, app_id: null, sent_at: null });
    expect(rows[0].next_attempt_at).toBeInstanceOf(Date);
  });

  it('status and skip_reason are checked', async () => {
    await expect(event({ event_id: 'a', status: 'queued' })).rejects.toThrow(/capi_events_status_check/);
    await expect(event({ event_id: 'b', status: 'skipped', skip_reason: 'weird' })).rejects.toThrow(/capi_events_skip_check/);
    for (const [i, reason] of ['no_app', 'no_pixel', 'no_token', 'no_consent', 'too_old'].entries()) {
      await event({ event_id: `ok${i}`, status: 'skipped', skip_reason: reason });
    }
    for (const [i, status] of ['pending', 'sent', 'skipped', 'dead'].entries()) await event({ event_id: `st${i}`, status });
  });

  it('one row per outbox row and one per event_id', async () => {
    const oid = await outbox();
    await event({ outbox_id: oid, event_id: 'txn_a' });
    await expect(event({ outbox_id: oid, event_id: 'txn_b' })).rejects.toThrow(/capi_events_outbox_id_key/);
    await expect(event({ event_id: 'txn_a' })).rejects.toThrow(/capi_events_event_id_key/);
  });

  it('outbox_id must exist; app_id and funnel_id are foreign keys', async () => {
    await expect(event({ outbox_id: 999999 })).rejects.toThrow(/capi_events_outbox_id_fkey/);
    await expect(event({ app_id: 'ghost' })).rejects.toThrow(/capi_events_app_id_fkey/);
    await expect(event({ funnel_id: 424242 })).rejects.toThrow(/capi_events_funnel_id_fkey/);
  });

  it('apps.capi_test_code accepts TEST + 1-20 alphanumerics and NULL only', async () => {
    const app = (id, code) =>
      q(db, "INSERT INTO apps (id, name, kind, return_url, api_key_hash, capi_test_code) VALUES ($1, $1, 'web', 'https://x.example/d', $1, $2)", [id, code]);
    await app('tc-null', null);
    await app('tc-ok', 'TEST12345');
    await app('tc-max', `TEST${'a'.repeat(20)}`);
    for (const [i, bad] of ['test123', 'TEST', 'TEST-1', 'XTEST1', `TEST${'a'.repeat(21)}`].entries()) {
      await expect(app(`tc-bad${i}`, bad)).rejects.toThrow(/apps_capi_test_code_check/);
    }
  });

  it('indexes for the relay exist', async () => {
    const { rows } = await q(db, "SELECT indexname FROM pg_indexes WHERE indexname IN ('capi_events_due', 'capi_events_by_app', 'outbox_payment_recent') ORDER BY 1");
    expect(rows.map((r) => r.indexname)).toEqual(['capi_events_by_app', 'capi_events_due', 'outbox_payment_recent']);
  });
});
```

`services/core-api/test/checkout.test.js`, `services/core-api/test/migrate.test.js` (sửa, áp dụng đúng diff này):

`services/core-api/test/checkout.test.js`, `services/core-api/test/migrate.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/test/checkout.test.js b/services/core-api/test/checkout.test.js
index 03777fc..b037b4a 100644
--- a/services/core-api/test/checkout.test.js
+++ b/services/core-api/test/checkout.test.js
@@ -78,6 +78,48 @@ describe('POST /v1/checkout', () => {
     })]);
   });
 
+  // Spec conversions-relay §3 + rulings C3/C7: what the relay later needs from the buyer's browser.
+  const stored = async () => (await db.pool.query('SELECT client_ip, client_ua, client_url, attribution FROM checkouts')).rows[0];
+
+  it('stores the client IP, user-agent and page URL (Referer without query or fragment)', async () => {
+    const res = await post(body(), { 'user-agent': 'Mozilla/5.0 (iPhone)', referer: 'https://try.aivideo.app/aivideo?utm_source=meta&fbclid=x#top' });
+    expect(res.statusCode).toBe(201);
+    expect(await stored()).toMatchObject({ client_ip: '203.0.113.9', client_ua: 'Mozilla/5.0 (iPhone)', client_url: 'https://try.aivideo.app/aivideo' });
+  });
+
+  it('cuts the user-agent to 512 chars; a missing one is NULL', async () => {
+    await post(body(), { 'user-agent': 'u'.repeat(600) });
+    expect((await stored()).client_ua).toBe('u'.repeat(512));
+    await db.pool.query('TRUNCATE checkouts');
+    await post(body(), { 'user-agent': '' });
+    expect((await stored()).client_ua).toBeNull();
+  });
+
+  it('keeps the page URL only for https (or localhost) and at most 1024 chars', async () => {
+    const urlFor = async (referer) => {
+      await db.pool.query('TRUNCATE checkouts');
+      expect((await post(body(), referer === undefined ? {} : { referer })).statusCode).toBe(201);
+      return (await stored()).client_url;
+    };
+    expect(await urlFor('http://evil.example/x')).toBeNull();
+    expect(await urlFor('not a url')).toBeNull();
+    expect(await urlFor(undefined)).toBeNull();
+    expect(await urlFor('http://localhost:8080/aivideo?a=1')).toBe('http://localhost:8080/aivideo');
+    expect(await urlFor('http://127.0.0.1:8080/aivideo')).toBe('http://127.0.0.1:8080/aivideo');
+    expect(await urlFor(`https://try.aivideo.app/${'a'.repeat(1100)}`)).toBeNull();
+  });
+
+  it('keeps ads_consent only when it is granted, denied or unknown_required', async () => {
+    for (const v of ['granted', 'denied', 'unknown_required']) {
+      await db.pool.query('TRUNCATE checkouts');
+      await post(body({ attribution: { utm_source: 'meta', ads_consent: v } }));
+      expect((await stored()).attribution).toEqual({ utm_source: 'meta', ads_consent: v });
+    }
+    await db.pool.query('TRUNCATE checkouts');
+    await post(body({ attribution: { utm_source: 'meta', ads_consent: 'maybe' } }));
+    expect((await stored()).attribution).toEqual({ utm_source: 'meta' });
+  });
+
   it('add-on: one_time price, no discount', async () => {
     await post(body({ plan: 'addon' }));
     expect(paddle.calls[0][1]).toEqual({
diff --git a/services/core-api/test/migrate.test.js b/services/core-api/test/migrate.test.js
index ff98c1d..bda0cd5 100644
--- a/services/core-api/test/migrate.test.js
+++ b/services/core-api/test/migrate.test.js
@@ -10,13 +10,13 @@ describe('migrate', () => {
   afterAll(() => db.stop());
 
   it('applies the publisher schema once and is idempotent', async () => {
-    expect(await migrate(db.pool)).toEqual(['001_publisher.sql', '002_funnel_pixel.sql', '003_billing.sql', '004_entitlements.sql', '005_admin.sql', '006_admin_p2.sql', '007_apps_container.sql', '008_app_roles.sql']);
+    expect(await migrate(db.pool)).toEqual(['001_publisher.sql', '002_funnel_pixel.sql', '003_billing.sql', '004_entitlements.sql', '005_admin.sql', '006_admin_p2.sql', '007_apps_container.sql', '008_app_roles.sql', '009_capi.sql']);
     expect(await migrate(db.pool)).toEqual([]);
     const { rows } = await db.pool.query(
       "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY 1",
     );
     expect(rows.map((r) => r.table_name)).toEqual([
-      'admin_sessions', 'admin_user_apps', 'admin_users', 'api_tokens', 'app_links', 'apps', 'audit_log', 'checkouts', 'claim_tokens', 'customers', 'domains', 'entitlement_recompute', 'entitlements',
+      'admin_sessions', 'admin_user_apps', 'admin_users', 'api_tokens', 'app_links', 'apps', 'audit_log', 'capi_events', 'checkouts', 'claim_tokens', 'customers', 'domains', 'entitlement_recompute', 'entitlements',
       'funnel_prices', 'funnels', 'host_revs', 'magic_links', 'manual_grants', 'otp_codes', 'outbox', 'route_events', 'routes',
       'schema_migrations', 'subscriptions', 'sync_failures', 'transactions', 'versions', 'webhook_deliveries', 'webhook_inbox',
     ]);
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock
export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock
npm test -w @ikf/core-api -- test/capi-schema.test.js test/migrate.test.js test/checkout.test.js
```

Expected: `Test Files  3 failed (3)`, `Tests  12 failed | 22 passed (34)`: 7 test `migration 009_capi` và `migrate > applies the publisher schema once and is idempotent` fail vì chưa có `009_capi.sql`; 4 test mới của `POST /v1/checkout` (IP/UA/URL, UA cắt 512, URL chỉ https/localhost, `ads_consent`) fail vì chưa có cột `client_*` và `cleanAttribution` bỏ `ads_consent`.

- [ ] **Step 3: Implement**

`services/core-api/migrations/009_capi.sql` (mới):

`services/core-api/migrations/009_capi.sql` (mới):

```sql
-- Conversions relay, Meta CAPI (spec conversions-relay §1). The CAPI token is never in Postgres: it lives in
-- Secrets Manager (ikf/<env>/app-capi/<app_id>); apps keeps only its last 4 characters and the time it was set.
-- capi_events never holds an email, IP, user-agent, fbc or fbp: the relay reads those from customers/checkouts
-- at send time, and checkouts.client_ip/client_ua are cleared 30 days after the checkout.
-- migrate.js runs each file in one transaction: give up after 5 s waiting for a table lock instead of queueing
-- every request behind the ALTERs (a failed migration rolls back and the next deploy retries it)
SET LOCAL lock_timeout = '5s';

ALTER TABLE apps ADD COLUMN capi_token_last4  TEXT NULL;
ALTER TABLE apps ADD COLUMN capi_token_set_at TIMESTAMPTZ NULL;
ALTER TABLE apps ADD COLUMN capi_test_code    TEXT NULL CONSTRAINT apps_capi_test_code_check CHECK (capi_test_code ~ '^TEST[0-9A-Za-z]{1,20}$');

ALTER TABLE checkouts ADD COLUMN client_ip  TEXT NULL;   -- cleared 30 days after created_at
ALTER TABLE checkouts ADD COLUMN client_ua  TEXT NULL;   -- max 512 chars; cleared together with client_ip
-- Page the buyer was on (Referer without query/fragment): Meta wants event_source_url for action_source 'website'.
-- Nothing personal is left after stripping the query, so the 30-day sweep does not touch it (ruling C3).
ALTER TABLE checkouts ADD COLUMN client_url TEXT NULL;

CREATE TABLE capi_events (
  id              BIGSERIAL PRIMARY KEY,
  outbox_id       BIGINT NOT NULL UNIQUE REFERENCES outbox (id),
  event_id        TEXT NOT NULL UNIQUE,                  -- = paddle_transaction_id
  app_id          TEXT NULL REFERENCES apps (id),        -- NULL: funnel not assigned to an app
  funnel_id       BIGINT NULL REFERENCES funnels (id),
  pixel_id        TEXT NULL,                             -- funnel pixel at the time the row was created
  value_minor     BIGINT NOT NULL,
  currency        TEXT NOT NULL,
  event_time      TIMESTAMPTZ NOT NULL,                  -- billed_at, else outbox.created_at
  status          TEXT NOT NULL DEFAULT 'pending'
                    CONSTRAINT capi_events_status_check CHECK (status IN ('pending', 'sent', 'skipped', 'dead')),
  skip_reason     TEXT NULL
                    CONSTRAINT capi_events_skip_check CHECK (skip_reason IN ('no_app', 'no_pixel', 'no_token', 'no_consent', 'too_old')),
  attempts        INT NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_error      TEXT NULL,                             -- Meta error code/subcode or 'http_<status>' / 'network'; never a message
  test_code       TEXT NULL,                             -- test_event_code used when it was sent
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at         TIMESTAMPTZ NULL
);
CREATE INDEX capi_events_due    ON capi_events (next_attempt_at, id) WHERE status = 'pending';
CREATE INDEX capi_events_by_app ON capi_events (app_id, id DESC);
CREATE INDEX outbox_payment_recent ON outbox (created_at, id) WHERE topic = 'payment.succeeded';
```

`services/core-api/src/billing/checkout.js`, `services/core-api/src/http/checkout.js` (sửa, áp dụng đúng diff này):

`services/core-api/src/billing/checkout.js`, `services/core-api/src/http/checkout.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/billing/checkout.js b/services/core-api/src/billing/checkout.js
index 51d61ab..a21938f 100644
--- a/services/core-api/src/billing/checkout.js
+++ b/services/core-api/src/billing/checkout.js
@@ -8,6 +8,10 @@ import { ulid } from './ulid.js';
 const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 const FBC_RE = /^fb\.1\.\d{10,16}\.[A-Za-z0-9_-]{1,500}$/;
 const FBP_RE = /^fb\.1\.\d{10,16}\.\d{1,20}$/;
+// Spec conversions-relay §3 / ruling C7: what the SDK says about ad consent; anything else is dropped.
+const ADS_CONSENT = new Set(['granted', 'denied', 'unknown_required']);
+const UA_MAX = 512;
+const URL_MAX = 1024;
 
 // UTM + click ids (no value containing an email) and the Meta cookies; nothing else from the browser.
 export function cleanAttribution(a) {
@@ -16,9 +20,26 @@ export function cleanAttribution(a) {
     ...cleanAttr(src),
     ...(typeof src.fbc === 'string' && FBC_RE.test(src.fbc) && { fbc: src.fbc }),
     ...(typeof src.fbp === 'string' && FBP_RE.test(src.fbp) && { fbp: src.fbp }),
+    ...(ADS_CONSENT.has(src.ads_consent) && { ads_consent: src.ads_consent }),
   };
 }
 
+// Spec conversions-relay §3 / ruling C3: the page the buyer was on, for Meta's event_source_url. Referer
+// without query and fragment (they can carry click ids and emails); https only, or localhost in dev/tests.
+export function cleanClientUrl(referer) {
+  if (typeof referer !== 'string' || !referer) return null;
+  let u;
+  try {
+    u = new URL(referer);
+  } catch {
+    return null;
+  }
+  const local = u.hostname === 'localhost' || u.hostname === '127.0.0.1';
+  if (u.protocol !== 'https:' && !(u.protocol === 'http:' && local)) return null;
+  const clean = u.origin + u.pathname;
+  return clean.length <= URL_MAX ? clean : null;
+}
+
 // Paddle has no "customer by email" on POST /transactions: create the customer, or take the id
 // Paddle reports in its 409. null → the transaction goes without a customer (user types the email).
 async function resolveCustomer(paddle, email) {
@@ -31,7 +52,7 @@ async function resolveCustomer(paddle, email) {
   }
 }
 
-export async function createCheckout({ pool, paddle, turnstile, log, alarm }, { origin, ip, body }) {
+export async function createCheckout({ pool, paddle, turnstile, log, alarm }, { origin, ip, ua, referer, body }) {
   const { funnel, v, plan, sid } = body;
   let check;
   try {
@@ -76,9 +97,12 @@ export async function createCheckout({ pool, paddle, turnstile, log, alarm }, {
   }
 
   await pool.query(
-    `INSERT INTO checkouts (id, paddle_transaction_id, funnel_id, v, plan_key, sid, attribution)
-     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
-    [checkoutId, txn.id, funnelId, v, plan, sid, cleanAttribution(body.attribution)],
+    `INSERT INTO checkouts (id, paddle_transaction_id, funnel_id, v, plan_key, sid, attribution, client_ip, client_ua, client_url)
+     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
+    [
+      checkoutId, txn.id, funnelId, v, plan, sid, cleanAttribution(body.attribution),
+      ip ?? null, typeof ua === 'string' && ua ? ua.slice(0, UA_MAX) : null, cleanClientUrl(referer),
+    ],
   );
   return { checkout_id: checkoutId, transaction_id: txn.id };
 }
diff --git a/services/core-api/src/http/checkout.js b/services/core-api/src/http/checkout.js
index d2e5859..69a2e89 100644
--- a/services/core-api/src/http/checkout.js
+++ b/services/core-api/src/http/checkout.js
@@ -51,7 +51,7 @@ export default async function checkoutHttp(app, deps) {
       const ip = req.headers['cf-connecting-ip'] ?? req.ip;
       const out = await createCheckout(
         { ...deps, log: req.log },
-        { origin: req.headers.origin, ip, body: req.body },
+        { origin: req.headers.origin, ip, ua: req.headers['user-agent'], referer: req.headers.referer, body: req.body },
       );
       reply.code(201).header('cache-control', 'no-store');
       return out;
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/capi-schema.test.js test/migrate.test.js test/checkout.test.js test/scope.test.js
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: file-level `Test Files  4 passed (4)`, `Tests  48 passed (48)` (chạy 4 file Testcontainers cùng lúc đôi khi lỗi khởi động container một lần, chạy lại là qua); toàn bộ core-api `Test Files  75 passed (75)`, `Tests  718 passed (718)` (trước đó 707 / 74 file).

- [ ] **Step 5: Commit**

```bash
git add services/core-api/migrations/009_capi.sql services/core-api/src/billing/checkout.js services/core-api/src/http/checkout.js services/core-api/test/capi-schema.test.js services/core-api/test/checkout.test.js services/core-api/test/migrate.test.js
git commit -m "feat(core-api): migration 009 capi_events; checkout keeps IP, user-agent, page URL and ads consent
```

---

---

### Task 2: SDK gửi ads_consent

**Files:**
- Modify: `packages/sdk/src/index.js`
- Test: `packages/sdk/test/sdk.test.js`, `packages/sdk/test/checkout.test.js`

**Interfaces:**
- Consumes: object `consent` có sẵn trong `createSdk` (`required`, `value`).
- Produces: `IKF.attribution().ads_consent` ∈ `granted` | `denied` | `unknown_required`, đi vào body `POST /v1/checkout` (Task 1 đã giữ giá trị này phía server). Bundle SDK tăng từ 8154 lên 8183 byte gzip (budget 8192, còn dư 9 byte).

- [ ] **Step 1: Viết test fail**

`packages/sdk/test/sdk.test.js` và `packages/sdk/test/checkout.test.js` (sửa, áp dụng đúng diff này; hai test cũ cần thêm `ads_consent: 'granted'` vì dùng `toEqual`):

`packages/sdk/test/sdk.test.js`, `packages/sdk/test/checkout.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/packages/sdk/test/checkout.test.js b/packages/sdk/test/checkout.test.js
index 1500493..11166d4 100644
--- a/packages/sdk/test/checkout.test.js
+++ b/packages/sdk/test/checkout.test.js
@@ -18,7 +18,7 @@ describe('SDK checkout', () => {
     expect(h.fetches[0].init).toMatchObject({ method: 'POST', credentials: 'omit', headers: { 'content-type': 'application/json' } });
     expect(h.fetches[0].body).toEqual({
       funnel: 'aivideo', v: 3, plan: '1w', sid: sdk.attribution().sid, email: EMAIL,
-      attribution: { utm_source: 'meta', fbc: null, fbp: expect.any(String) }, turnstile_token: 'tok0',
+      attribution: { utm_source: 'meta', fbc: null, fbp: expect.any(String), ads_consent: 'granted' }, turnstile_token: 'tok0',
     });
     expect(h.paddle.env).toBe('sandbox');
     expect(h.paddle.init.token).toBe('test_client_token');
diff --git a/packages/sdk/test/sdk.test.js b/packages/sdk/test/sdk.test.js
index 243811e..e800cad 100644
--- a/packages/sdk/test/sdk.test.js
+++ b/packages/sdk/test/sdk.test.js
@@ -162,11 +162,37 @@ describe('createSdk', () => {
     expect(window.IKF.attribution()).toEqual({
       utm_source: 'meta', fbclid: 'IwAR1',
       fbc: expect.stringMatching(/^fb\.1\.\d+\.IwAR1$/), fbp: expect.stringMatching(/^fb\.1\.\d+\.\d{10}$/),
-      sid: expect.any(String), aid: expect.any(String),
+      sid: expect.any(String), aid: expect.any(String), ads_consent: 'granted',
     });
   });
 });
 
+describe('ads_consent in attribution (Spec conversions-relay §3)', () => {
+  it('is granted when consent is not required', () => {
+    boot(IKF({ country: 'US' }));
+    expect(window.IKF.attribution().ads_consent).toBe('granted');
+  });
+
+  it('is granted when required and the visitor accepted', () => {
+    window.localStorage.setItem('ikf_consent', 'granted');
+    boot(IKF({ country: 'DE' }));
+    expect(window.IKF.attribution().ads_consent).toBe('granted');
+  });
+
+  it('is denied when required and the visitor declined', () => {
+    window.localStorage.setItem('ikf_consent', 'denied');
+    boot(IKF({ country: 'DE' }));
+    expect(window.IKF.attribution().ads_consent).toBe('denied');
+  });
+
+  it('is unknown_required when required and unanswered, then follows the banner choice', () => {
+    boot(IKF({ country: 'DE' }));
+    expect(window.IKF.attribution().ads_consent).toBe('unknown_required');
+    document.getElementById('ikf-consent').shadowRoot.querySelector('[data-c="denied"]').click();
+    expect(window.IKF.attribution().ads_consent).toBe('denied');
+  });
+});
+
 describe('never breaks the funnel', () => {
   it('start() swallows SDK errors and runs only once', () => {
     window.__IKF = IKF();
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/sdk 2>&1 | grep -E "Test Files|Tests  |×"
```

Expected: `Tests  6 failed | 157 passed (163)`: 4 test mới fail cộng 2 test cũ (`IKF.attribution returns attribution...`, `checkout_click → ... POST /v1/checkout`) vì `ads_consent` chưa có trong attribution.

- [ ] **Step 3: Implement**

`packages/sdk/src/index.js` (sửa, áp dụng đúng diff này; một helper inline, dùng ở cả hai chỗ dựng attribution):

`packages/sdk/src/index.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/packages/sdk/src/index.js b/packages/sdk/src/index.js
index 74946ba..4f52f8d 100644
--- a/packages/sdk/src/index.js
+++ b/packages/sdk/src/index.js
@@ -27,6 +27,8 @@ export function createSdk(win, deps = {}) {
   const attr = captureAttribution(win.location.search, session);
   const consent = { required: needsConsent(cfg.country), value: readConsent(local) };
   const adsAllowed = () => !consent.required || consent.value === 'granted';
+  // Spec conversions-relay §3: the server relays Meta CAPI only for 'granted'; when required and unanswered it must see 'unknown_required', not a guess.
+  const adsConsent = () => (adsAllowed() ? 'granted' : consent.value || 'unknown_required');
 
   function getAid() {
     if (!adsAllowed()) return null;
@@ -92,7 +94,7 @@ export function createSdk(win, deps = {}) {
         // never break the funnel
       }
     },
-    attribution: () => ({ ...attr, fbc: readCookie(doc, '_fbc'), fbp: readCookie(doc, '_fbp') }),
+    attribution: () => ({ ...attr, fbc: readCookie(doc, '_fbc'), fbp: readCookie(doc, '_fbp'), ads_consent: adsConsent() }),
     loadScript: deps.loadScript,
     fetch: deps.fetch,
     wait: deps.wait,
@@ -119,7 +121,7 @@ export function createSdk(win, deps = {}) {
   win.addEventListener('pagehide', () => queue.flush({ unload: true }));
 
   const api = {
-    attribution: () => ({ ...attr, fbc: readCookie(doc, '_fbc'), fbp: readCookie(doc, '_fbp'), sid, aid: getAid() }),
+    attribution: () => ({ ...attr, fbc: readCookie(doc, '_fbc'), fbp: readCookie(doc, '_fbp'), sid, aid: getAid(), ads_consent: adsConsent() }),
     flush: () => queue.flush(),
     paid: () => checkout.confirmation,
     claim: () => checkout.claimed(),
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/sdk 2>&1 | grep -E "Test Files|Tests  |bytes"
npm test -w @ikf/edge-router 2>&1 | grep -E "Test Files|Tests  "
```

Expected: sdk `Test Files  11 passed (11)`, `Tests  163 passed (163)`, `ikf sdk 00fafbb5699c: 8183 bytes gzip`; edge-router `Test Files  7 passed (7)`, `Tests  106 passed (106)`.

- [ ] **Step 5: Commit**

```bash
git add packages/sdk/src/index.js packages/sdk/test/sdk.test.js packages/sdk/test/checkout.test.js
git commit -m "feat(sdk): send ads consent state with checkout attribution"
```

---

---

### Task 3: Dựng sự kiện CAPI (hàm thuần)

**Files:**
- Create: `services/core-api/src/conversions/event.js`
- Test: `services/core-api/test/conversions-event.test.js` (mới)

**Interfaces:**
- Consumes: không có (hàm thuần, không DB, không fetch). Quy tắc theo spec conversions-relay §2 "Building one event", bảng "Results", và ruling C2, C3, C4.
- Produces: `ZERO_DECIMAL`, `toValue(valueMinor, currency)`, `hashEmail(email)`, `externalId(customerId)`, `buildEvent(row, ctx)`, `buildBody(events, {token, testCode})`, `RETRY_MS`, `retryDelay(attempts)`, `classify({status, body, error})` trả `{kind: 'ok'|'retry'|'dead'|'token', code}`. Task relay (send tick) dùng các hàm này.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/conversions-event.test.js` (mới):

`services/core-api/test/conversions-event.test.js` (mới):

```js
import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import {
  ZERO_DECIMAL, toValue, hashEmail, externalId, buildEvent, buildBody, RETRY_MS, retryDelay, classify,
} from '../src/conversions/event.js';

const sha256 = (s) => createHash('sha256').update(s).digest('hex');

const ROW = { event_id: 'evt_1', event_time: new Date('2026-10-16T10:00:00.789Z'), value_minor: 999, currency: 'USD', funnel: 'starlyn-a' };
const CTX = {
  email: 'Jane@Example.com', customer_id: 'cus-1', attribution: { fbc: 'fb.1.1.abc', fbp: 'fb.1.1.def' },
  client_ip: '203.0.113.9', client_ua: 'UA/1.0', client_url: 'https://go.example.com/starlyn-a',
};

// Spec conversions-relay §2 "Building one event"
describe('Meta CAPI event building', () => {
  it('hashes the email after trim + lowercase, and rejects missing or invalid ones', () => {
    expect(hashEmail('  A@B.com ')).toBe(hashEmail('a@b.com'));
    expect(hashEmail('a@b.com')).toBe(sha256('a@b.com'));
    expect(hashEmail(null)).toBeNull();
    expect(hashEmail('')).toBeNull();
    expect(hashEmail('   ')).toBeNull();
    expect(hashEmail('not-an-email')).toBeNull();
    expect(hashEmail(42)).toBeNull();
  });

  it('derives external_id from the customer id with the ikf: prefix', () => {
    expect(externalId('cus-1')).toBe(sha256('ikf:cus-1'));
  });

  it('converts minor units: 2 decimals, but JPY and KRW have none', () => {
    expect(ZERO_DECIMAL.has('JPY')).toBe(true);
    expect(toValue(999, 'USD')).toBe(9.99);
    expect(toValue(1200, 'JPY')).toBe(1200);
    expect(toValue(5000, 'KRW')).toBe(5000);
    expect(toValue(5000, 'EUR')).toBe(50);
  });

  it('builds a website Purchase with every field when the checkout is known', () => {
    const ev = buildEvent(ROW, CTX);
    expect(ev).toEqual({
      event_name: 'Purchase',
      event_id: 'evt_1',
      event_time: 1792144800,
      action_source: 'website',
      event_source_url: 'https://go.example.com/starlyn-a',
      user_data: {
        em: [sha256('jane@example.com')],
        external_id: [sha256('ikf:cus-1')],
        fbc: 'fb.1.1.abc',
        fbp: 'fb.1.1.def',
        client_ip_address: '203.0.113.9',
        client_user_agent: 'UA/1.0',
      },
      custom_data: { value: 9.99, currency: 'USD', content_ids: ['starlyn-a'], content_type: 'product' },
    });
    expect(Number.isInteger(ev.event_time)).toBe(true);
  });

  it('never carries the raw email', () => {
    const json = JSON.stringify(buildEvent(ROW, CTX));
    expect(json).not.toContain('Jane');
    expect(json).not.toContain('example.com/jane');
    expect(json.toLowerCase()).not.toContain('jane@example.com');
  });

  it('falls back to system_generated without a page URL', () => {
    const ev = buildEvent(ROW, { ...CTX, client_url: null });
    expect(ev.action_source).toBe('system_generated');
    expect('event_source_url' in ev).toBe(false);
  });

  it('omits user_data keys that have no value instead of sending null', () => {
    const ev = buildEvent(ROW, { email: null, customer_id: 'cus-1', attribution: null, client_ip: null, client_ua: null, client_url: null });
    expect(ev.user_data).toEqual({ external_id: [sha256('ikf:cus-1')] });
    const partial = buildEvent(ROW, { ...CTX, attribution: { fbc: 'fb.1.1.abc' }, client_ip: null });
    expect(Object.keys(partial.user_data).sort()).toEqual(['client_user_agent', 'em', 'external_id', 'fbc']);
  });

  it('omits content_ids when the funnel is unknown', () => {
    const ev = buildEvent({ ...ROW, funnel: null }, CTX);
    expect(ev.custom_data).toEqual({ value: 9.99, currency: 'USD', content_type: 'product' });
  });
});

describe('Meta CAPI request body', () => {
  it('is JSON with the token inside and an optional test_event_code', () => {
    const events = [buildEvent(ROW, CTX)];
    expect(buildBody(events, { token: 'tok' })).toEqual({ data: events, access_token: 'tok' });
    const withTest = buildBody(events, { token: 'tok', testCode: 'TEST123' });
    expect(withTest).toEqual({ data: events, access_token: 'tok', test_event_code: 'TEST123' });
    expect(JSON.parse(JSON.stringify(withTest))).toEqual(withTest);
  });
});

// Spec conversions-relay §2 backoff: 1m, 5m, 30m, 2h, 6h, then dead
describe('retry backoff', () => {
  it('maps attempts made to the next delay and gives up after the 6th', () => {
    expect(RETRY_MS).toEqual([60e3, 300e3, 1800e3, 7200e3, 21600e3]);
    expect([1, 2, 3, 4, 5].map(retryDelay)).toEqual(RETRY_MS);
    expect(retryDelay(6)).toBeNull();
    expect(retryDelay(9)).toBeNull();
  });
});

// Spec conversions-relay §2 "Results" + ruling C4
describe('Graph API result classification', () => {
  it('200 is ok', () => {
    expect(classify({ status: 200, body: { events_received: 1 } })).toEqual({ kind: 'ok', code: null });
  });
  it('plain 400 (code 100) is dead with the Meta code', () => {
    expect(classify({ status: 400, body: { error: { code: 100, error_subcode: 2804003 } } })).toEqual({ kind: 'dead', code: 'meta_100_2804003' });
    expect(classify({ status: 400, body: { error: { code: 100 } } })).toEqual({ kind: 'dead', code: 'meta_100' });
  });
  it('401/403 are token errors, with http_<status> when Meta sent no body', () => {
    expect(classify({ status: 401 })).toEqual({ kind: 'token', code: 'http_401' });
    expect(classify({ status: 403, body: null })).toEqual({ kind: 'token', code: 'http_403' });
  });
  it('Meta codes 190, 10 and 200 are token errors even on a 400', () => {
    expect(classify({ status: 400, body: { error: { code: 190 } } })).toEqual({ kind: 'token', code: 'meta_190' });
    expect(classify({ status: 400, body: { error: { code: 10 } } })).toEqual({ kind: 'token', code: 'meta_10' });
    expect(classify({ status: 400, body: { error: { code: 200, error_subcode: 1 } } })).toEqual({ kind: 'token', code: 'meta_200_1' });
  });
  it('429 and 5xx retry', () => {
    expect(classify({ status: 429, body: { error: { code: 4 } } })).toEqual({ kind: 'retry', code: 'meta_4' });
    expect(classify({ status: 503 })).toEqual({ kind: 'retry', code: 'http_503' });
  });
  it('timeouts and network errors retry as network', () => {
    expect(classify({ error: new Error('boom') })).toEqual({ kind: 'retry', code: 'network' });
    expect(classify({ status: undefined, error: Object.assign(new Error('t'), { name: 'TimeoutError' }) })).toEqual({ kind: 'retry', code: 'network' });
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/conversions-event.test.js
```

Expected: `Test Files  1 failed (1)`, `Tests  no tests`: file test không load được vì `Cannot find module '../src/conversions/event.js'`.

- [ ] **Step 3: Implement**

`services/core-api/src/conversions/event.js` (mới):

`services/core-api/src/conversions/event.js` (mới):

```js
import { createHash } from 'node:crypto';

// Spec conversions-relay §2 "Building one event": pure functions, no DB and no fetch,
// so the relay (send tick) and the tests share one definition of what Meta receives.

// Currencies whose minor unit is the major unit (Paddle amounts for these have no cents).
export const ZERO_DECIMAL = new Set(['JPY', 'KRW']);

const sha256 = (s) => createHash('sha256').update(s).digest('hex');

export function toValue(valueMinor, currency) {
  return ZERO_DECIMAL.has(currency) ? valueMinor / 1 : valueMinor / 100;
}

// Meta matches on sha256 of the trimmed, lower-cased address; anything that is not
// plausibly an address is dropped rather than hashed, so we never send a useless `em`.
export function hashEmail(email) {
  if (typeof email !== 'string') return null;
  const e = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+$/.test(e)) return null;
  return sha256(e);
}

// The `ikf:` prefix keeps the id from being a bare hash of our internal uuid.
export function externalId(customerId) {
  return sha256(`ikf:${customerId}`);
}

// row = {event_id, event_time: Date, value_minor, currency, funnel}
// ctx = {email, customer_id, attribution: {fbc?, fbp?} | null, client_ip, client_ua, client_url}
export function buildEvent(row, ctx) {
  const em = hashEmail(ctx.email);
  const attr = ctx.attribution || {};
  // Only keys with a value: Meta treats an explicit null as a malformed parameter.
  const userData = {};
  if (em) userData.em = [em];
  userData.external_id = [externalId(ctx.customer_id)];
  if (attr.fbc) userData.fbc = attr.fbc;
  if (attr.fbp) userData.fbp = attr.fbp;
  if (ctx.client_ip) userData.client_ip_address = ctx.client_ip;
  if (ctx.client_ua) userData.client_user_agent = ctx.client_ua;

  const customData = { value: toValue(row.value_minor, row.currency), currency: row.currency };
  if (row.funnel) customData.content_ids = [row.funnel];
  customData.content_type = 'product';

  // Ruling C3: `website` needs event_source_url; without a recorded page the honest value is system_generated.
  const event = {
    event_name: 'Purchase',
    event_id: row.event_id,
    event_time: Math.floor(row.event_time.getTime() / 1000),
    action_source: ctx.client_url ? 'website' : 'system_generated',
  };
  if (ctx.client_url) event.event_source_url = ctx.client_url;
  event.user_data = userData;
  event.custom_data = customData;
  return event;
}

// Ruling C2: JSON body with the token inside; the token never goes in the URL.
export function buildBody(events, { token, testCode }) {
  const body = { data: events, access_token: token };
  if (testCode) body.test_event_code = testCode;
  return body;
}

// Spec §2 backoff: delay after attempt 1..5; the 6th failed attempt is final.
export const RETRY_MS = [60e3, 300e3, 1800e3, 7200e3, 21600e3];

export function retryDelay(attempts) {
  return attempts > RETRY_MS.length ? null : RETRY_MS[Math.max(attempts, 1) - 1];
}

// Ruling C4: Meta codes that mean "the token or its permission on the pixel is bad".
const TOKEN_CODES = new Set([190, 10, 200]);

// -> {kind: 'ok'|'retry'|'dead'|'token', code}. `code` is the only thing that gets stored or logged.
export function classify({ status, body, error } = {}) {
  if (error || typeof status !== 'number') return { kind: 'retry', code: 'network' };
  if (status >= 200 && status < 300) return { kind: 'ok', code: null };
  const e = body && typeof body === 'object' ? body.error : null;
  const metaCode = e && Number.isInteger(e.code) ? e.code : null;
  const sub = e && Number.isInteger(e.error_subcode) ? e.error_subcode : null;
  const code = metaCode === null ? `http_${status}` : `meta_${metaCode}${sub === null ? '' : `_${sub}`}`;
  if (status === 401 || status === 403 || TOKEN_CODES.has(metaCode)) return { kind: 'token', code };
  if (status === 429 || status >= 500) return { kind: 'retry', code };
  return { kind: 'dead', code };
}
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/conversions-event.test.js
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  16 passed (16)`; toàn bộ core-api: `Test Files  76 passed (76)`, `Tests  734 passed (734)`

- [ ] **Step 5: Commit**

```bash
git add services/core-api/src/conversions/event.js services/core-api/test/conversions-event.test.js
git commit -m "feat(core-api): build Meta CAPI Purchase events and classify Graph API results"
```

---

---

### Task 4: Relay — enqueue từ outbox, sweep IP/UA, mở lại no_token

**Files:**
- Create: `services/core-api/src/conversions/relay.js`
- Test: `services/core-api/test/conversions-enqueue.test.js` (mới)

**Interfaces:**
- Consumes: bảng `capi_events`, `apps.capi_token_set_at`, `checkouts.client_ip/client_ua/client_url` (migration 009, Task 1); `checkouts.attribution.ads_consent` chỉ giữ `granted`/`denied`/`unknown_required` (`cleanAttribution`, Task 1, ruling C7); payload `payment.succeeded` của outbox (`paddle_transaction_id`, `amount_minor`, `currency`, `funnel`) do `src/billing/sync.js` ghi.
- Produces (`src/conversions/relay.js`):
  - `ENQUEUE_BATCH = 200`, `SWEEP_BATCH = 1000`.
  - `enqueue(pool, { now = null, batch = ENQUEUE_BATCH } = {})` → `{created, skipped}`: `created` = số dòng `capi_events` vừa chèn (cả `pending` lẫn `skipped`), `skipped` = trong đó bao nhiêu dòng `skipped`. Một transaction; anti-join `payment.succeeded` 7 ngày, `ORDER BY o.id LIMIT batch FOR UPDATE OF o SKIP LOCKED`; `event_id = payload.paddle_transaction_id`, `event_time = transactions.billed_at` hoặc `outbox.created_at`; lý do skip đầu tiên khớp theo thứ tự `no_app`, `no_pixel`, `no_token`, `no_consent`, `too_old`; `INSERT … ON CONFLICT DO NOTHING` (không target: cả `outbox_id` lẫn `event_id`). `now` (Date) chỉ để test dời cửa sổ 7 ngày; mặc định đồng hồ Postgres.
  - `checkoutFor(db, paddleTransactionId)` → `{attribution, client_ip, client_ua, client_url}` hoặc `null`: checkout của `transactions.checkout_id`; renewal không có thì checkout của giao dịch sớm nhất cùng `paddle_subscription_id` có `checkout_id` (`ORDER BY billed_at NULLS LAST, paddle_updated_at, paddle_transaction_id`). Task 5 (send) dùng lại.
  - `sweepClientData(pool, { batch = SWEEP_BATCH } = {})` → số checkout đã xoá IP/UA (> 30 ngày), lặp tới khi một lượt < `batch`; `client_url` giữ nguyên.
  - `reviveNoToken(db, appId)` → số dòng: `skipped no_token` của app, `event_time` trong 7 ngày → `pending`, `skip_reason = NULL`, `attempts = 0`, `next_attempt_at = now()`. Chạy trong transaction của người gọi (Task 6, `PUT /v1/apps/:id/capi`).

- [ ] **Step 1: Viết test fail**

`services/core-api/test/conversions-enqueue.test.js` (mới):

`services/core-api/test/conversions-enqueue.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';
import { checkoutFor, enqueue, reviveNoToken, sweepClientData } from '../src/conversions/relay.js';

const DAY = 24 * 60 * 60 * 1000;
const ago = (days) => new Date(Date.now() - days * DAY);
const ck = (n) => `01JA000000000000000000CK${String(n).padStart(2, '0')}`;
const GATE = 4343;

// Spec conversions-relay §2 Tick 1 "enqueue" (anti-join over 7 days, skip reasons, ON CONFLICT), Tick 3 "sweep",
// "When a token is entered" (reviveNoToken) and ruling C7 (ads_consent from the checkout, missing = granted).
describe('conversions relay: enqueue, sweep, reviveNoToken (spec conversions-relay §2)', () => {
  let db;
  let fid;
  const q = async (sql, p) => (await db.pool.query(sql, p)).rows;

  const app = (id, { token = true } = {}) =>
    q(
      `INSERT INTO apps (id, name, kind, return_url, api_key_hash, capi_token_last4, capi_token_set_at)
       VALUES ($1, $1, 'web', 'https://x.example/done', $1, $2, $3)`,
      [id, token ? 'abcd' : null, token ? new Date() : null],
    );
  const funnel = async (slug, appId, pixel) =>
    Number((await q('INSERT INTO funnels (slug, created_by, app_id, pixel_id) VALUES ($1, $2, $3, $4) RETURNING id', [slug, 't', appId, pixel]))[0].id);
  const checkout = (n, funnelId, { attribution = {}, created = new Date(), ip = null, ua = null, url = null } = {}) =>
    q(
      `INSERT INTO checkouts (id, paddle_transaction_id, funnel_id, v, plan_key, sid, attribution, status, created_at, client_ip, client_ua, client_url)
       VALUES ($1, $2, $3, 1, '1w', 's', $4, 'completed', $5, $6, $7, $8)`,
      [ck(n), `txn_ck${n}`, funnelId, attribution, created, ip, ua, url],
    );
  const txn = (id, { checkout: n = null, sub = null, billed = new Date() } = {}) =>
    q(
      `INSERT INTO transactions (paddle_transaction_id, paddle_subscription_id, checkout_id, status, origin, amount_minor, currency, billed_at, paddle_updated_at)
       VALUES ($1, $2, $3, 'completed', 'web', 999, 'USD', $4, now())`,
      [id, sub, n === null ? null : ck(n), billed],
    );
  const outbox = async (txnId, { topic = 'payment.succeeded', funnel: slug = 'star', amount = 999, currency = 'USD', created = new Date() } = {}) =>
    Number((await q(
      'INSERT INTO outbox (topic, aggregate_id, dedupe_key, payload, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [topic, txnId, `${topic}:${txnId}`, { paddle_transaction_id: txnId, amount_minor: amount, currency, funnel: slug }, created],
    ))[0].id);
  const events = () =>
    q('SELECT outbox_id, event_id, app_id, funnel_id, pixel_id, value_minor, currency, event_time, status, skip_reason FROM capi_events ORDER BY id');

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    await app('starlyn');
    fid = await funnel('star', 'starlyn', '1234567');
  });

  it('creates one pending row per payment.succeeded with the funnel, pixel, amount and billed_at', async () => {
    const billed = ago(1);
    await checkout(1, fid);
    await txn('txn_1', { checkout: 1, billed });
    const o1 = await outbox('txn_1', { amount: 1367 });
    const o2 = await outbox('txn_2', { amount: 2000, currency: 'JPY' }); // no transactions row: event_time = outbox.created_at
    expect(await enqueue(db.pool)).toEqual({ created: 2, skipped: 0 });
    const rows = await events();
    expect(rows).toEqual([
      { outbox_id: String(o1), event_id: 'txn_1', app_id: 'starlyn', funnel_id: String(fid), pixel_id: '1234567', value_minor: '1367', currency: 'USD', event_time: billed, status: 'pending', skip_reason: null },
      { outbox_id: String(o2), event_id: 'txn_2', app_id: 'starlyn', funnel_id: String(fid), pixel_id: '1234567', value_minor: '2000', currency: 'JPY', event_time: expect.any(Date), status: 'pending', skip_reason: null },
    ]);
    const [{ created_at: outboxAt }] = await q('SELECT created_at FROM outbox WHERE id = $1', [o2]);
    expect(rows[1].event_time).toEqual(outboxAt);
  });

  it('ignores other topics and outbox rows older than 7 days', async () => {
    await outbox('txn_r', { topic: 'payment.refunded' });
    await outbox('txn_s', { topic: 'subscription.activated' });
    await outbox('txn_old', { created: ago(8) });
    await outbox('txn_new', { created: ago(6) });
    expect(await enqueue(db.pool)).toEqual({ created: 1, skipped: 0 });
    expect((await events()).map((e) => e.event_id)).toEqual(['txn_new']);
  });

  it('a second enqueue creates nothing', async () => {
    await outbox('txn_1');
    await outbox('txn_2', { funnel: 'ghost' });
    expect(await enqueue(db.pool)).toEqual({ created: 2, skipped: 1 });
    expect(await enqueue(db.pool)).toEqual({ created: 0, skipped: 0 });
    expect(await events()).toHaveLength(2);
  });

  it('a transaction already enqueued through another outbox row is not inserted twice (event_id conflict)', async () => {
    await outbox('txn_1');
    await q(
      "INSERT INTO outbox (topic, aggregate_id, dedupe_key, payload) VALUES ('payment.succeeded', 'txn_1', 'dup:txn_1', $1)",
      [{ paddle_transaction_id: 'txn_1', amount_minor: 999, currency: 'USD', funnel: 'star' }],
    );
    expect(await enqueue(db.pool)).toEqual({ created: 1, skipped: 0 });
    expect((await events()).map((e) => e.event_id)).toEqual(['txn_1']);
  });

  it('skips with the first matching reason: no_app, no_pixel, no_token, no_consent, too_old', async () => {
    await app('bare', { token: false });
    const orphan = await funnel('orphan', null, '7654321');
    await funnel('nopix', 'bare', null); // no pixel and no token: no_pixel comes first
    await funnel('notok', 'bare', '1111111');
    await outbox('txn_ghost', { funnel: 'ghost' });
    await outbox('txn_null', { funnel: null });
    await outbox('txn_orphan', { funnel: 'orphan' });
    await outbox('txn_nopix', { funnel: 'nopix' });
    await outbox('txn_notok', { funnel: 'notok' });
    await checkout(1, fid, { attribution: { ads_consent: 'denied' } });
    await txn('txn_denied', { checkout: 1 });
    await outbox('txn_denied');
    await checkout(2, fid, { attribution: { ads_consent: 'unknown_required' } });
    await txn('txn_unknown', { checkout: 2 });
    await outbox('txn_unknown');
    await checkout(3, fid, { attribution: { ads_consent: 'denied' } });
    await txn('txn_old_denied', { checkout: 3, billed: ago(9) }); // no_consent wins over too_old
    await outbox('txn_old_denied');
    await txn('txn_late', { billed: ago(8) }); // outbox row is fresh, the charge is not
    await outbox('txn_late');
    expect(await enqueue(db.pool)).toEqual({ created: 9, skipped: 9 });
    const by = Object.fromEntries((await events()).map((e) => [e.event_id, [e.status, e.skip_reason, e.app_id, e.funnel_id, e.pixel_id]]));
    expect(by).toEqual({
      txn_ghost: ['skipped', 'no_app', null, null, null],
      txn_null: ['skipped', 'no_app', null, null, null],
      txn_orphan: ['skipped', 'no_app', null, String(orphan), '7654321'],
      txn_nopix: ['skipped', 'no_pixel', 'bare', expect.any(String), null],
      txn_notok: ['skipped', 'no_token', 'bare', expect.any(String), '1111111'],
      txn_denied: ['skipped', 'no_consent', 'starlyn', String(fid), '1234567'],
      txn_unknown: ['skipped', 'no_consent', 'starlyn', String(fid), '1234567'],
      txn_old_denied: ['skipped', 'no_consent', 'starlyn', String(fid), '1234567'],
      txn_late: ['skipped', 'too_old', 'starlyn', String(fid), '1234567'],
    });
  });

  it('a renewal takes consent from the earliest transaction of its subscription that has a checkout', async () => {
    await checkout(1, fid, { attribution: { ads_consent: 'denied' }, ip: '203.0.113.9', ua: 'UA/1', url: 'https://go.example/star' });
    await checkout(2, fid, { attribution: { ads_consent: 'granted' } });
    await checkout(3, fid, { attribution: { ads_consent: 'granted' } });
    await checkout(4, fid, { attribution: { ads_consent: 'denied' } });
    // sub_a: first purchase denied → its renewal is skipped no_consent.
    await txn('txn_a1', { checkout: 1, sub: 'sub_a', billed: ago(20) });
    await txn('txn_a2', { sub: 'sub_a', billed: ago(1) });
    // sub_b: the earliest (granted) decides, not a later denied one.
    await txn('txn_b0', { checkout: 2, sub: 'sub_b', billed: ago(40) });
    await txn('txn_b1', { checkout: 4, sub: 'sub_b', billed: ago(10) });
    await txn('txn_b2', { sub: 'sub_b', billed: ago(1) });
    await txn('txn_c1', { sub: 'sub_c', billed: ago(1) }); // no checkout anywhere
    for (const id of ['txn_a2', 'txn_b2', 'txn_c1']) await outbox(id);
    expect(await enqueue(db.pool)).toEqual({ created: 3, skipped: 1 });
    const by = Object.fromEntries((await events()).map((e) => [e.event_id, [e.status, e.skip_reason]]));
    expect(by).toEqual({ txn_a2: ['skipped', 'no_consent'], txn_b2: ['pending', null], txn_c1: ['pending', null] });

    expect(await checkoutFor(db.pool, 'txn_a2')).toEqual({
      attribution: { ads_consent: 'denied' }, client_ip: '203.0.113.9', client_ua: 'UA/1', client_url: 'https://go.example/star',
    });
    expect(await checkoutFor(db.pool, 'txn_a1')).toMatchObject({ attribution: { ads_consent: 'denied' } });
    expect(await checkoutFor(db.pool, 'txn_b2')).toMatchObject({ attribution: { ads_consent: 'granted' } });
    expect(await checkoutFor(db.pool, 'txn_c1')).toBeNull();
    expect(await checkoutFor(db.pool, 'txn_missing')).toBeNull();
  });

  it('a checkout without ads_consent (older bundles) counts as granted', async () => {
    await checkout(1, fid, { attribution: { utm_source: 'meta' } });
    await txn('txn_1', { checkout: 1 });
    await outbox('txn_1');
    await checkout(2, fid, { attribution: { ads_consent: 'granted' } });
    await txn('txn_2', { checkout: 2 });
    await outbox('txn_2');
    expect(await enqueue(db.pool)).toEqual({ created: 2, skipped: 0 });
    expect((await events()).map((e) => e.status)).toEqual(['pending', 'pending']);
  });

  // Barrier, no sleeps (pattern of test/lock-order.test.js): a test-only AFTER INSERT trigger on capi_events makes
  // each enqueue wait on a shared advisory lock the test holds, i.e. after it locked its outbox rows. With batch 2 the
  // first enqueue holds rows 1-2, the second skips them and takes 3-4; both wait, then the gate opens.
  describe('two enqueue workers at once', () => {
    let gate;
    beforeEach(async () => {
      await q(`CREATE OR REPLACE FUNCTION capi_gate() RETURNS trigger LANGUAGE plpgsql AS $$
                 BEGIN PERFORM pg_advisory_xact_lock_shared(${GATE}); RETURN NULL; END $$`);
      await q('CREATE TRIGGER capi_gate AFTER INSERT ON capi_events FOR EACH ROW EXECUTE FUNCTION capi_gate()');
      gate = await db.pool.connect();
      await gate.query('SELECT pg_advisory_lock($1)', [GATE]);
    });
    afterEach(async () => {
      await gate.query('SELECT pg_advisory_unlock_all()');
      gate.release();
      await q('DROP TRIGGER IF EXISTS capi_gate ON capi_events');
    });
    const waiters = async (n, ...done) => {
      let settled = false;
      for (const p of done) p.then(() => { settled = true; }, () => { settled = true; });
      const deadline = Date.now() + 5000;
      for (;;) {
        const [{ c }] = await q(
          "SELECT count(*)::int AS c FROM pg_stat_activity WHERE datname = current_database() AND wait_event_type = 'Lock' AND pid <> pg_backend_pid()",
        );
        if (c >= n || settled) return;
        if (Date.now() > deadline) throw new Error(`barrier: ${c} of ${n} waiting`);
        await new Promise((r) => setTimeout(r, 5));
      }
    };

    it('each outbox row gets exactly one capi_events row', async () => {
      const ids = [];
      for (const n of [1, 2, 3, 4]) ids.push(await outbox(`txn_${n}`));
      const one = enqueue(db.pool, { batch: 2 });
      await waiters(1, one);
      const two = enqueue(db.pool, { batch: 2 });
      await waiters(2, two);
      await gate.query('SELECT pg_advisory_unlock($1)', [GATE]);
      expect([await one, await two]).toEqual([{ created: 2, skipped: 0 }, { created: 2, skipped: 0 }]);
      const rows = await q('SELECT outbox_id, count(*)::int AS n FROM capi_events GROUP BY outbox_id ORDER BY outbox_id');
      expect(rows).toEqual(ids.map((id) => ({ outbox_id: String(id), n: 1 })));
      expect(await enqueue(db.pool)).toEqual({ created: 0, skipped: 0 });
    });
  });

  it('sweep clears IP and user-agent only on checkouts older than 30 days and keeps client_url', async () => {
    const client = { ip: '203.0.113.9', ua: 'UA/1', url: 'https://go.example/star' };
    await checkout(1, fid, { ...client, created: ago(31) });
    await checkout(2, fid, { ...client, created: ago(45) });
    await checkout(3, fid, { ua: 'UA/only', created: ago(60) });
    await checkout(4, fid, { ...client, created: ago(29) });
    await checkout(5, fid, { url: client.url, created: ago(90) }); // nothing to clear
    expect(await sweepClientData(db.pool, { batch: 2 })).toBe(3);
    const rows = await q('SELECT id, client_ip, client_ua, client_url FROM checkouts ORDER BY id');
    expect(rows.map((r) => [r.id, r.client_ip, r.client_ua, r.client_url])).toEqual([
      [ck(1), null, null, client.url],
      [ck(2), null, null, client.url],
      [ck(3), null, null, null],
      [ck(4), client.ip, client.ua, client.url],
      [ck(5), null, null, client.url],
    ]);
    expect(await sweepClientData(db.pool)).toBe(0);
  });

  it('reviveNoToken turns only that app’s no_token rows of the last 7 days back into pending', async () => {
    await app('bare', { token: false });
    await app('other', { token: false });
    await funnel('notok', 'bare', '1111111');
    await funnel('other', 'other', '2222222');
    // txn_old: no_token too, but its charge is older than 7 days, so it stays skipped (Meta would reject it).
    await txn('txn_old', { billed: ago(8) });
    for (const [id, slug] of [['txn_1', 'notok'], ['txn_old', 'notok'], ['txn_o', 'other'], ['txn_ghost', 'ghost']]) await outbox(id, { funnel: slug });
    expect(await enqueue(db.pool)).toEqual({ created: 4, skipped: 4 });
    await q("UPDATE capi_events SET attempts = 3, next_attempt_at = now() + interval '1 hour' WHERE event_id = 'txn_1'");
    expect(await reviveNoToken(db.pool, 'bare')).toBe(1);
    const by = Object.fromEntries(
      (await q('SELECT event_id, status, skip_reason, attempts, next_attempt_at <= now() AS due FROM capi_events')).map((e) => [e.event_id, [e.status, e.skip_reason, e.attempts, e.due]]),
    );
    expect(by).toEqual({
      txn_1: ['pending', null, 0, true],
      txn_old: ['skipped', 'no_token', 0, true],
      txn_o: ['skipped', 'no_token', 0, true],
      txn_ghost: ['skipped', 'no_app', 0, true],
    });
    expect(await reviveNoToken(db.pool, 'bare')).toBe(0);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/conversions-enqueue.test.js
```

Expected: `Test Files  1 failed (1)`, `Tests  no tests`: file test không load được vì `Cannot find module '../src/conversions/relay.js'`.

- [ ] **Step 3: Implement**

`services/core-api/src/conversions/relay.js` (mới):

`services/core-api/src/conversions/relay.js` (mới):

```js
// Spec conversions-relay §2: the relay that turns payment.succeeded outbox rows into Meta CAPI Purchase events.
// Tick 1 (enqueue) and Tick 3 (sweep) live here, plus reviveNoToken for "When a token is entered".

export const ENQUEUE_BATCH = 200;
export const SWEEP_BATCH = 1000;

// Ruling C7: checkouts only keep these three values; a missing one (older bundles) counts as granted.
const NO_CONSENT = new Set(['denied', 'unknown_required']);

// The checkout whose attribution, IP, user-agent and page belong to a Paddle transaction (spec §2 "Attribution
// source"): its own checkout_id; a renewal has none, so the earliest transaction of the same subscription that
// has one. null when there is no such checkout. Task 5 (send) reuses it.
export async function checkoutFor(db, paddleTransactionId) {
  const { rows } = await db.query(
    `SELECT c.attribution, c.client_ip, c.client_ua, c.client_url
       FROM transactions t
       JOIN checkouts c ON c.id = COALESCE(t.checkout_id, (
              SELECT f.checkout_id FROM transactions f
               WHERE f.paddle_subscription_id = t.paddle_subscription_id AND f.checkout_id IS NOT NULL
               ORDER BY f.billed_at NULLS LAST, f.paddle_updated_at, f.paddle_transaction_id
               LIMIT 1))
      WHERE t.paddle_transaction_id = $1`,
    [paddleTransactionId],
  );
  return rows[0] ?? null;
}

// First matching reason in the spec's order, or null (pending).
async function skipReason(c, r) {
  if (!r.app_id) return 'no_app';
  if (!r.pixel_id) return 'no_pixel';
  if (!r.has_token) return 'no_token';
  const checkout = await checkoutFor(c, r.event_id);
  if (NO_CONSENT.has(checkout?.attribution?.ads_consent)) return 'no_consent';
  if (r.too_old) return 'too_old'; // Meta rejects events older than 7 days
  return null;
}

// Tick 1 (spec §2, decision #5): anti-join over the last 7 days of payment.succeeded, no cursor, the outbox row
// untouched (entitlement-sync owns published_at). SKIP LOCKED lets two workers split the batch; ON CONFLICT DO
// NOTHING (both unique keys: outbox_id, event_id) covers a row another worker inserted after our snapshot.
// `now` (Date) only moves the 7-day windows in tests; default is the database clock.
// → {created: capi_events rows inserted, skipped: how many of those were inserted as skipped}.
export async function enqueue(pool, { now = null, batch = ENQUEUE_BATCH } = {}) {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    const { rows } = await c.query(
      `SELECT o.id, o.payload->>'paddle_transaction_id' AS event_id,
              (o.payload->>'amount_minor')::bigint AS value_minor, o.payload->>'currency' AS currency,
              COALESCE(t.billed_at, o.created_at) AS event_time,
              COALESCE(t.billed_at, o.created_at) < COALESCE($1::timestamptz, now()) - interval '7 days' AS too_old,
              f.id AS funnel_id, f.app_id, f.pixel_id, a.capi_token_set_at IS NOT NULL AS has_token
         FROM outbox o
         LEFT JOIN capi_events ce ON ce.outbox_id = o.id
         LEFT JOIN transactions t ON t.paddle_transaction_id = o.payload->>'paddle_transaction_id'
         LEFT JOIN funnels f ON f.slug = o.payload->>'funnel'
         LEFT JOIN apps a ON a.id = f.app_id
        WHERE o.topic = 'payment.succeeded' AND o.created_at > COALESCE($1::timestamptz, now()) - interval '7 days'
          AND ce.id IS NULL
        ORDER BY o.id LIMIT $2 FOR UPDATE OF o SKIP LOCKED`,
      [now, batch],
    );
    let created = 0;
    let skipped = 0;
    for (const r of rows) {
      const reason = await skipReason(c, r);
      const { rowCount } = await c.query(
        `INSERT INTO capi_events (outbox_id, event_id, app_id, funnel_id, pixel_id, value_minor, currency, event_time, status, skip_reason)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT DO NOTHING`,
        [r.id, r.event_id, r.app_id ?? null, r.funnel_id ?? null, r.pixel_id ?? null, r.value_minor, r.currency, r.event_time,
          reason ? 'skipped' : 'pending', reason],
      );
      created += rowCount;
      if (reason) skipped += rowCount;
    }
    await c.query('COMMIT');
    return { created, skipped };
  } catch (err) {
    await c.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    c.release();
  }
}

// Tick 3 (spec §2, decision #7): IP and user-agent live 30 days on the checkout, then go; client_url stays
// (ruling C3: nothing personal left after the query is stripped). Batches keep each UPDATE short.
export async function sweepClientData(pool, { batch = SWEEP_BATCH } = {}) {
  let total = 0;
  for (;;) {
    const { rowCount } = await pool.query(
      `UPDATE checkouts SET client_ip = NULL, client_ua = NULL
        WHERE id IN (SELECT id FROM checkouts
                      WHERE created_at < now() - interval '30 days' AND (client_ip IS NOT NULL OR client_ua IS NOT NULL)
                      LIMIT $1)`,
      [batch],
    );
    total += rowCount;
    if (rowCount < batch) return total;
  }
}

// Spec §2 "When a token is entered": the app's no_token rows Meta would still accept go back to pending.
// Runs in the caller's transaction (PUT /v1/apps/:id/capi updates apps in the same one).
export async function reviveNoToken(db, appId) {
  const { rowCount } = await db.query(
    `UPDATE capi_events SET status = 'pending', skip_reason = NULL, attempts = 0, next_attempt_at = now()
      WHERE app_id = $1 AND status = 'skipped' AND skip_reason = 'no_token' AND event_time > now() - interval '7 days'`,
    [appId],
  );
  return rowCount;
}
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/conversions-enqueue.test.js
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  10 passed (10)`; toàn bộ core-api: `Test Files  77 passed (77)`, `Tests  744 passed (744)`

- [ ] **Step 5: Commit**

```bash
git add services/core-api/src/conversions/relay.js services/core-api/test/conversions-enqueue.test.js
git commit -m "feat(core-api): conversions relay enqueue from the outbox, 30-day IP/UA sweep"
```

---

---

### Task 5: Relay — gửi sang Graph API, token store, bật trong server

**Files:**
- Create: `services/core-api/src/conversions/store.js`, `services/core-api/src/conversions/setup.js`
- Modify: `services/core-api/src/conversions/relay.js`, `services/core-api/src/identity/webhooks.js` (thêm `drop` cho `secretCache`), `services/core-api/src/config.js`, `services/core-api/src/server.js`
- Test: `services/core-api/test/conversions-send.test.js` (mới), `services/core-api/test/conversions-store.test.js` (mới), `services/core-api/test/config.test.js` (sửa)

**Interfaces:**
- Consumes: `buildEvent`, `buildBody`, `classify`, `retryDelay` từ `src/conversions/event.js` (Task 3); `enqueue`, `checkoutFor`, `sweepClientData` từ `src/conversions/relay.js` (Task 4); bảng `capi_events`, `apps.capi_test_code` (Task 1); `secretCache` (`src/identity/webhooks.js`), `createAlarm`/`memoryThrottle`/`redisThrottle`/`snsPublisher` (`src/billing/alarm.js`).
- Produces:
  - `src/conversions/store.js`: `CLEARED = 'cleared'`; `capiTokenStore({client, prefix})` → `{get(appId), put(appId, token), clear(appId)}` trên Secrets Manager, tên `${prefix}app-capi/<app_id>` (ruling C6), `put` = Create rồi `PutSecretValue` khi `ResourceExistsException`, `clear` = ghi `cleared` (ruling C1, không bao giờ `DeleteSecret`), `get` → `null` khi không có secret, rỗng hoặc `cleared`; `memoryTokenStore(initial = {})` cùng interface (test, demo); `cachedTokenStore(store, opts?)` → `{get, put, clear, drop}`: `get` qua cache 10 phút (`secretCache`), `put`/`clear` ghi vào store rồi `drop` cache của task này, `drop(appId)` xoá cache một app.
  - `secretCache(store, opts)` (webhooks.js) có thêm `drop(appId)`.
  - `src/conversions/relay.js`: `SEND_BATCH = 200`, `EVENTS_PER_REQUEST = 50`, `SEND_TIMEOUT_MS = 10_000`, `ENQUEUE_INTERVAL_MS = 15_000`, `SEND_INTERVAL_MS = 10_000`, `SWEEP_INTERVAL_MS = 3_600_000`.
    - `send(deps, { batch = SEND_BATCH } = {})`, `deps = {pool, tokens: {get, drop}, fetch = globalThis.fetch, graphUrl, alarm, log, timeoutMs = SEND_TIMEOUT_MS}` → `{claimed, sent, retry, dead, skipped}` (số dòng). Claim một câu lệnh (CTE `FOR UPDATE SKIP LOCKED`, `attempts + 1`, `next_attempt_at = now() + 2 minutes`), nhóm theo `(app_id, pixel_id)` (các nhóm chạy song song), mỗi request ≤ 50 event, `POST ${graphUrl}/${pixel_id}/events` JSON (`buildBody`, token trong body), `redirect: 'manual'`, `AbortSignal.timeout`. Kết quả: ok → `sent`, `sent_at`, `test_code`; retry → `next_attempt_at = now() + retryDelay(attempts)` hoặc `dead` khi hết lượt, `last_error`; dead → `dead`; token → phần còn lại của nhóm `dead`, `tokens.drop(app_id)`, `alarm('capi_token_invalid:<app_id>', '{"app_id":"<app_id>"}')`. Không có token → `skipped no_token`. Secrets Manager lỗi → như retry với `last_error = secrets_<err.name>`. Log `capi_send` chỉ `{app_id, pixel_id, count, status, error_code}`, `status` ∈ `sent`/`retry`/`dead`/`token_invalid`/`skipped`.
    - `startConversions({pool, tokens, fetch = globalThis.fetch, graphUrl, alarm, log, enqueueMs = 15_000, sendMs = 10_000, sweepMs = 3_600_000})` → `async stop()`; ba vòng `enqueue`/`send`/`sweep`, lỗi chỉ log `log.error({tick, code: err.code ?? 'error'}, 'conversions_tick_failed')`.
  - `src/conversions/setup.js`: `conversionsDeps({config, secretsClient, snsClient, redis, log})` với `config = loadConfig().conversions` → `{deps: {capiTokens} | null, missing, alarm, start({pool, ...opts}) → stop}`; thiếu `SECRETS_PREFIX` / secrets client / `META_GRAPH_URL` → `deps: null`, `missing` liệt kê, `start` trả stop rỗng (ruling C8). `capiTokens` = `cachedTokenStore(capiTokenStore(...))`, dùng chung cho route (Task 6) và relay.
  - `src/config.js`: `DEFAULT_META_GRAPH_URL`; `loadConfig().conversions = {graphUrl, secretsPrefix, alarmTopicArn}`; `META_GRAPH_URL` tuỳ chọn, mặc định `https://graph.facebook.com/v21.0`, bỏ `/` cuối, phải là URL https không query/fragment (http chỉ khi `APP_ENV=local`).
  - `src/server.js`: log `conversions disabled, missing: …` khi tắt; `capiTokens` vào deps của `buildApp`; relay chạy và dừng cùng các worker khác khi shutdown.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/conversions-send.test.js` (mới):

`services/core-api/test/conversions-send.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { startDb, resetDb } from './helpers/db.js';
import { send, startConversions } from '../src/conversions/relay.js';
import { cachedTokenStore, memoryTokenStore } from '../src/conversions/store.js';

const sha256 = (s) => createHash('sha256').update(s).digest('hex');
const TOKEN = 'EAAB_secret_token_value_42';
const EMAIL = 'Buyer.One@Example.com';
const IP = '203.0.113.77';
const UA = 'Mozilla/5.0 (LeakCheck UA)';
const FBC = 'fb.1.1700000000.AbCdEfLeak';
const FBP = 'fb.1.1700000000.987654321';
const PIXEL = '1234567';
const GATE = 4545;
const ck = (n) => `01JA000000000000000000CK${String(n).padStart(2, '0')}`;

// A local Graph API: records every request; reply(fn | [status, body]) scripts the next answers (default 200),
// hold() keeps answers back until release() (barrier for the parallel test).
async function fakeGraph() {
  const requests = [];
  const replies = [];
  let held = null;
  const server = createServer((req, res) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', async () => {
      requests.push({ url: req.url, headers: req.headers, body: JSON.parse(Buffer.concat(chunks).toString('utf8')) });
      if (held) await held.promise;
      const [status, body] = replies.length ? replies.shift() : [200, { events_received: 1, fbtrace_id: 'x' }];
      res.writeHead(status, { 'content-type': 'application/json' }).end(JSON.stringify(body));
    });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return {
    url: `http://127.0.0.1:${server.address().port}/v21.0`,
    requests,
    reply: (...r) => replies.push(...r),
    hold: () => {
      let release;
      held = { promise: new Promise((r) => { release = r; }) };
      held.release = release;
    },
    release: () => { held?.release(); held = null; },
    close: () => new Promise((resolve) => {
      server.closeAllConnections();
      server.close(resolve);
    }),
  };
}

// Spec conversions-relay §2 Tick 2 "send" (claim, groups of 50, results table, token, logs) and rulings C1, C2, C4.
describe('conversions relay: send to the Graph API (spec conversions-relay §2)', () => {
  let db;
  let graph;
  let store;
  let tokens;
  let alarms;
  let logs;
  let fid;
  let outboxN;
  const q = async (sql, p) => (await db.pool.query(sql, p)).rows;
  const log = {
    info: (...a) => logs.push(['info', ...a]),
    warn: (...a) => logs.push(['warn', ...a]),
    error: (...a) => logs.push(['error', ...a]),
  };
  const deps = () => ({ pool: db.pool, tokens, fetch: globalThis.fetch, graphUrl: graph.url, alarm: async (...a) => { alarms.push(a); }, log });

  const app = (id, { testCode = null } = {}) =>
    q(
      `INSERT INTO apps (id, name, kind, return_url, api_key_hash, capi_token_last4, capi_token_set_at, capi_test_code)
       VALUES ($1, $1, 'web', 'https://x.example/done', $1, '_42', now(), $2)`,
      [id, testCode],
    );
  const funnel = async (slug, appId) =>
    Number((await q('INSERT INTO funnels (slug, created_by, app_id, pixel_id) VALUES ($1, $2, $3, $4) RETURNING id', [slug, 't', appId, PIXEL]))[0].id);
  const customer = async (email) =>
    Number((await q('INSERT INTO customers (paddle_customer_id, email) VALUES ($1, $2) RETURNING id', [`ctm_${Math.random()}`, email]))[0].id);
  const checkout = (n, { attribution = {}, ip = null, ua = null, url = null } = {}) =>
    q(
      `INSERT INTO checkouts (id, paddle_transaction_id, funnel_id, v, plan_key, sid, attribution, status, client_ip, client_ua, client_url)
       VALUES ($1, $2, $3, 1, '1w', 's', $4, 'completed', $5, $6, $7)`,
      [ck(n), `txn_ck${n}`, fid, attribution, ip, ua, url],
    );
  // One pending capi_events row (what enqueue made) + its transaction and outbox row.
  const pending = async (txnId, { customerId = null, checkout: n = null, appId = 'starlyn', funnelId = fid, value = 1999, currency = 'USD', billed = new Date('2026-10-16T08:00:00Z') } = {}) => {
    await q(
      `INSERT INTO transactions (paddle_transaction_id, customer_id, checkout_id, status, origin, amount_minor, currency, billed_at, paddle_updated_at)
       VALUES ($1, $2, $3, 'completed', 'web', $4, $5, $6, now())`,
      [txnId, customerId, n === null ? null : ck(n), value, currency, billed],
    );
    outboxN += 1;
    const [{ id: oid }] = await q(
      "INSERT INTO outbox (topic, aggregate_id, dedupe_key, payload) VALUES ('payment.succeeded', $1, $2, '{}') RETURNING id",
      [txnId, `payment.succeeded:${txnId}:${outboxN}`],
    );
    await q(
      `INSERT INTO capi_events (outbox_id, event_id, app_id, funnel_id, pixel_id, value_minor, currency, event_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [oid, txnId, appId, funnelId, PIXEL, value, currency, billed],
    );
  };
  const rows = () => q('SELECT event_id, status, skip_reason, attempts, last_error, test_code, sent_at IS NOT NULL AS sent FROM capi_events ORDER BY id');
  const row = async (eventId) => (await q('SELECT * FROM capi_events WHERE event_id = $1', [eventId]))[0];
  const due = (eventId) => q("UPDATE capi_events SET next_attempt_at = now() - interval '1 second' WHERE event_id = $1", [eventId]);

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    graph = await fakeGraph();
    store = memoryTokenStore({ starlyn: TOKEN });
    tokens = cachedTokenStore(store);
    alarms = [];
    logs = [];
    outboxN = 0;
    await app('starlyn', { testCode: 'TEST12345' });
    fid = await funnel('star', 'starlyn');
  });
  afterEach(async () => {
    graph.release();
    await graph.close();
  });

  it('pending → sent: one POST to <graph>/<pixel>/events with the token in the JSON body, never in the URL', async () => {
    const cid = await customer(`  ${EMAIL} `);
    await checkout(1, { attribution: { fbc: FBC, fbp: FBP, ads_consent: 'granted' }, ip: IP, ua: UA, url: 'https://go.example/star' });
    await pending('txn_1', { customerId: cid, checkout: 1, value: 1999 });
    expect(await send(deps())).toEqual({ claimed: 1, sent: 1, retry: 0, dead: 0, skipped: 0 });
    expect(graph.requests).toHaveLength(1);
    const [req] = graph.requests;
    expect(req.url).toBe(`/v21.0/${PIXEL}/events`);
    expect(req.url).not.toContain(TOKEN);
    expect(req.headers['content-type']).toBe('application/json');
    expect(req.body).toEqual({
      data: [{
        event_name: 'Purchase',
        event_id: 'txn_1',
        event_time: Math.floor(Date.parse('2026-10-16T08:00:00Z') / 1000),
        action_source: 'website',
        event_source_url: 'https://go.example/star',
        user_data: {
          em: [sha256(EMAIL.toLowerCase())],
          external_id: [sha256(`ikf:${cid}`)],
          fbc: FBC,
          fbp: FBP,
          client_ip_address: IP,
          client_user_agent: UA,
        },
        custom_data: { value: 19.99, currency: 'USD', content_ids: ['star'], content_type: 'product' },
      }],
      access_token: TOKEN,
      test_event_code: 'TEST12345',
    });
    expect(JSON.stringify(req.body)).not.toContain(EMAIL.toLowerCase());
    expect(await rows()).toEqual([{ event_id: 'txn_1', status: 'sent', skip_reason: null, attempts: 1, last_error: null, test_code: 'TEST12345', sent: true }]);
    expect(await send(deps())).toEqual({ claimed: 0, sent: 0, retry: 0, dead: 0, skipped: 0 });
  });

  it('a renewal without a checkout of its own and no test code: em + external_id, system_generated, no test_event_code', async () => {
    await q("UPDATE apps SET capi_test_code = NULL WHERE id = 'starlyn'");
    const cid = await customer(EMAIL);
    await pending('txn_r', { customerId: cid, value: 1500, currency: 'JPY' });
    await send(deps());
    const [{ body }] = graph.requests;
    expect(body.test_event_code).toBeUndefined();
    expect(body.data[0]).toMatchObject({ action_source: 'system_generated', custom_data: { value: 1500, currency: 'JPY' } });
    expect(body.data[0].event_source_url).toBeUndefined();
    expect(body.data[0].user_data).toEqual({ em: [sha256(EMAIL.toLowerCase())], external_id: [sha256(`ikf:${cid}`)] });
    expect((await row('txn_r')).test_code).toBeNull();
  });

  it('sends at most 50 events per request: 51 rows → 2 requests, all sent', async () => {
    const cid = await customer(EMAIL);
    for (let i = 0; i < 51; i += 1) await pending(`txn_${String(i).padStart(2, '0')}`, { customerId: cid });
    expect(await send(deps())).toMatchObject({ claimed: 51, sent: 51 });
    expect(graph.requests.map((r) => r.body.data.length)).toEqual([50, 1]);
    const ids = graph.requests.flatMap((r) => r.body.data.map((e) => e.event_id));
    expect(new Set(ids).size).toBe(51);
    expect((await q("SELECT count(*)::int AS n FROM capi_events WHERE status = 'sent'"))[0].n).toBe(51);
  });

  it('groups by app and pixel: one request per group, each with its own token', async () => {
    await app('other');
    await store.put('other', 'EAAB_other_token_value_77');
    const f2 = await funnel('oth', 'other');
    await q("UPDATE funnels SET pixel_id = '7654321' WHERE id = $1", [f2]);
    const cid = await customer(EMAIL);
    await pending('txn_a', { customerId: cid });
    await pending('txn_b', { customerId: cid, appId: 'other', funnelId: f2 });
    await q("UPDATE capi_events SET pixel_id = '7654321' WHERE event_id = 'txn_b'");
    expect(await send(deps())).toMatchObject({ claimed: 2, sent: 2 });
    const by = Object.fromEntries(graph.requests.map((r) => [r.url, [r.body.access_token, r.body.data.map((e) => e.event_id)]]));
    expect(by).toEqual({
      [`/v21.0/${PIXEL}/events`]: [TOKEN, ['txn_a']],
      '/v21.0/7654321/events': ['EAAB_other_token_value_77', ['txn_b']],
    });
  });

  it('503 → stays pending, next attempt in ≈1 minute, last_error http_503; the sixth failure → dead', async () => {
    await pending('txn_1', { customerId: await customer(EMAIL) });
    graph.reply([503, {}]);
    expect(await send(deps())).toMatchObject({ claimed: 1, retry: 1 });
    const r = await row('txn_1');
    expect(r).toMatchObject({ status: 'pending', attempts: 1, last_error: 'http_503' });
    const [{ s }] = await q("SELECT extract(epoch FROM next_attempt_at - now())::int AS s FROM capi_events WHERE event_id = 'txn_1'");
    expect(s).toBeGreaterThanOrEqual(55);
    expect(s).toBeLessThanOrEqual(60);
    for (let n = 2; n <= 6; n += 1) {
      await due('txn_1');
      graph.reply([500, { error: { code: 2, message: 'Service temporarily unavailable for jane@example.com' } }]);
      await send(deps());
    }
    expect(await row('txn_1')).toMatchObject({ status: 'dead', attempts: 6, last_error: 'meta_2' });
    await due('txn_1');
    expect(await send(deps())).toMatchObject({ claimed: 0 });
    expect(graph.requests).toHaveLength(6);
  });

  it('a network failure (nothing listening) → retry with last_error network', async () => {
    await pending('txn_1', { customerId: await customer(EMAIL) });
    await send({ ...deps(), graphUrl: 'http://127.0.0.1:1/v21.0' });
    expect(await row('txn_1')).toMatchObject({ status: 'pending', attempts: 1, last_error: 'network' });
  });

  it('400 code 100 → dead at once with meta_100', async () => {
    await pending('txn_1', { customerId: await customer(EMAIL) });
    graph.reply([400, { error: { message: 'Invalid parameter', type: 'OAuthException', code: 100, fbtrace_id: 'x' } }]);
    expect(await send(deps())).toMatchObject({ claimed: 1, dead: 1 });
    expect(await row('txn_1')).toMatchObject({ status: 'dead', attempts: 1, last_error: 'meta_100' });
    expect(alarms).toEqual([]);
  });

  it('401 → the whole group dead, token cache dropped, one capi_token_invalid alarm', async () => {
    const cid = await customer(EMAIL);
    for (let i = 0; i < 51; i += 1) await pending(`txn_${String(i).padStart(2, '0')}`, { customerId: cid });
    let reads = 0;
    tokens = cachedTokenStore({ ...store, get: async (id) => { reads += 1; return store.get(id); } });
    graph.reply([401, { error: { message: 'Error validating access token', type: 'OAuthException', code: 190, error_subcode: 463 } }]);
    expect(await send(deps())).toMatchObject({ claimed: 51, dead: 51 });
    expect(graph.requests).toHaveLength(1); // the second chunk is not tried with a bad token
    expect((await q("SELECT DISTINCT status, last_error FROM capi_events"))).toEqual([{ status: 'dead', last_error: 'meta_190_463' }]);
    expect(alarms).toEqual([['capi_token_invalid:starlyn', JSON.stringify({ app_id: 'starlyn' })]]);
    expect(reads).toBe(1);
    await tokens.get('starlyn');
    expect(reads).toBe(2); // dropped: the next read goes to the store
  });

  it('no token for the app → skipped no_token, nothing sent', async () => {
    await store.clear('starlyn');
    await pending('txn_1', { customerId: await customer(EMAIL) });
    expect(await send(deps())).toMatchObject({ claimed: 1, skipped: 1 });
    expect(graph.requests).toEqual([]);
    expect(await row('txn_1')).toMatchObject({ status: 'skipped', skip_reason: 'no_token' });
  });

  it('a crash after the claim leaves the row pending and invisible for 2 minutes, then it is sent', async () => {
    await pending('txn_1', { customerId: await customer(EMAIL) });
    // The "worker" claims, then dies in the middle of the POST: its fetch never returns.
    let posting;
    const called = new Promise((r) => { posting = r; });
    send({ ...deps(), fetch: () => { posting(); return new Promise(() => {}); } });
    await called;
    const r = await row('txn_1');
    expect(r).toMatchObject({ status: 'pending', attempts: 1 });
    const [{ s }] = await q("SELECT extract(epoch FROM next_attempt_at - now())::int AS s FROM capi_events WHERE event_id = 'txn_1'");
    expect(s).toBeGreaterThanOrEqual(115);
    expect(s).toBeLessThanOrEqual(120);
    expect(await send(deps())).toMatchObject({ claimed: 0 });
    expect(graph.requests).toEqual([]);
    await due('txn_1');
    expect(await send(deps())).toMatchObject({ claimed: 1, sent: 1 });
    expect(await row('txn_1')).toMatchObject({ status: 'sent', attempts: 2 });
  });

  // Barrier, no sleeps (pattern of test/conversions-enqueue.test.js): a test-only AFTER UPDATE trigger makes each
  // claim wait on an advisory lock the test holds, i.e. while it holds its rows. With batch 2 the first send holds
  // rows 1-2, the second skips them and takes 3-4; both wait, then the gate opens.
  describe('two send workers at once', () => {
    let gate;
    beforeEach(async () => {
      await q(`CREATE OR REPLACE FUNCTION capi_gate() RETURNS trigger LANGUAGE plpgsql AS $$
                 BEGIN PERFORM pg_advisory_xact_lock_shared(${GATE}); RETURN NULL; END $$`);
      await q('CREATE TRIGGER capi_gate AFTER UPDATE ON capi_events FOR EACH ROW EXECUTE FUNCTION capi_gate()');
      gate = await db.pool.connect();
      await gate.query('SELECT pg_advisory_lock($1)', [GATE]);
    });
    afterEach(async () => {
      await gate.query('SELECT pg_advisory_unlock_all()');
      gate.release();
      await q('DROP TRIGGER IF EXISTS capi_gate ON capi_events');
    });
    const waiters = async (n, ...done) => {
      let settled = false;
      for (const p of done) p.then(() => { settled = true; }, () => { settled = true; });
      const deadline = Date.now() + 5000;
      for (;;) {
        const [{ c }] = await q(
          "SELECT count(*)::int AS c FROM pg_stat_activity WHERE datname = current_database() AND wait_event_type = 'Lock' AND pid <> pg_backend_pid()",
        );
        if (c >= n || settled) return;
        if (Date.now() > deadline) throw new Error(`barrier: ${c} of ${n} waiting`);
        await new Promise((r) => setTimeout(r, 5));
      }
    };

    it('each event_id is POSTed once', async () => {
      const cid = await customer(EMAIL);
      for (const n of [1, 2, 3, 4]) await pending(`txn_${n}`, { customerId: cid });
      const one = send(deps(), { batch: 2 });
      await waiters(1, one);
      const two = send(deps(), { batch: 2 });
      await waiters(2, two);
      await gate.query('SELECT pg_advisory_unlock($1)', [GATE]);
      expect([await one, await two]).toEqual([
        { claimed: 2, sent: 2, retry: 0, dead: 0, skipped: 0 },
        { claimed: 2, sent: 2, retry: 0, dead: 0, skipped: 0 },
      ]);
      const ids = graph.requests.flatMap((r) => r.body.data.map((e) => e.event_id)).sort();
      expect(ids).toEqual(['txn_1', 'txn_2', 'txn_3', 'txn_4']);
      expect((await q("SELECT count(*)::int AS n FROM capi_events WHERE status = 'sent' AND attempts = 1"))[0].n).toBe(4);
    });
  });

  it('logs only app, pixel, count, status and error code: no email, IP, user-agent, token, fbc or fbp', async () => {
    const cid = await customer(EMAIL);
    await checkout(1, { attribution: { fbc: FBC, fbp: FBP }, ip: IP, ua: UA, url: 'https://go.example/star' });
    await pending('txn_ok', { customerId: cid, checkout: 1 });
    await send(deps());
    await pending('txn_retry', { customerId: cid, checkout: 1 });
    graph.reply([500, { error: { code: 1, message: `boom for ${EMAIL} ${IP}` } }]);
    await send(deps());
    await pending('txn_dead', { customerId: cid, checkout: 1 });
    graph.reply([401, { error: { code: 190, message: `bad token ${TOKEN}` } }]);
    await send(deps());
    expect(logs.map(([level, obj, msg]) => [level, msg, Object.keys(obj).sort()])).toEqual([
      ['info', 'capi_send', ['app_id', 'count', 'error_code', 'pixel_id', 'status']],
      ['warn', 'capi_send', ['app_id', 'count', 'error_code', 'pixel_id', 'status']],
      ['warn', 'capi_send', ['app_id', 'count', 'error_code', 'pixel_id', 'status']],
    ]);
    expect(logs.map(([, obj]) => obj)).toEqual([
      { app_id: 'starlyn', pixel_id: PIXEL, count: 1, status: 'sent', error_code: null },
      { app_id: 'starlyn', pixel_id: PIXEL, count: 1, status: 'retry', error_code: 'meta_1' },
      { app_id: 'starlyn', pixel_id: PIXEL, count: 1, status: 'token_invalid', error_code: 'meta_190' },
    ]);
    const all = JSON.stringify([logs, alarms]).toLowerCase();
    for (const secret of [EMAIL, IP, UA, TOKEN, FBC, FBP]) expect(all).not.toContain(secret.toLowerCase());
  });

  it('startConversions runs enqueue, send and sweep in loops; stop() waits for the tick in hand', async () => {
    await q("INSERT INTO transactions (paddle_transaction_id, customer_id, status, origin, amount_minor, currency, billed_at, paddle_updated_at) VALUES ('txn_loop', $1, 'completed', 'web', 999, 'USD', now(), now())", [await customer(EMAIL)]);
    await q(
      "INSERT INTO outbox (topic, aggregate_id, dedupe_key, payload) VALUES ('payment.succeeded', 'txn_loop', 'payment.succeeded:txn_loop', $1)",
      [{ paddle_transaction_id: 'txn_loop', amount_minor: 999, currency: 'USD', funnel: 'star' }],
    );
    const stop = startConversions({ ...deps(), enqueueMs: 5, sendMs: 5, sweepMs: 60_000 });
    const deadline = Date.now() + 5000;
    while ((await row('txn_loop'))?.status !== 'sent') {
      if (Date.now() > deadline) throw new Error('relay loop did not send');
      await new Promise((r) => setTimeout(r, 10));
    }
    await stop();
    expect(graph.requests.map((r) => r.body.data[0].event_id)).toEqual(['txn_loop']);
  });

  it('startConversions logs a failed tick by code only', async () => {
    const broken = { query: async () => { throw Object.assign(new Error(`relation for ${EMAIL}`), { code: '42P01' }); }, connect: async () => { throw Object.assign(new Error('x'), { code: 'ECONNREFUSED' }); } };
    const stop = startConversions({ ...deps(), pool: broken, enqueueMs: 60_000, sendMs: 60_000, sweepMs: 60_000 });
    const deadline = Date.now() + 5000;
    while (logs.filter(([, , msg]) => msg === 'conversions_tick_failed').length < 3) {
      if (Date.now() > deadline) throw new Error('no tick failure logged');
      await new Promise((r) => setTimeout(r, 10));
    }
    await stop();
    const failed = logs.filter(([, , msg]) => msg === 'conversions_tick_failed').map(([level, obj]) => [level, obj]);
    expect(failed.sort((a, b) => a[1].tick.localeCompare(b[1].tick))).toEqual([
      ['error', { tick: 'enqueue', code: 'ECONNREFUSED' }],
      ['error', { tick: 'send', code: '42P01' }],
      ['error', { tick: 'sweep', code: '42P01' }],
    ]);
    expect(JSON.stringify(logs)).not.toContain(EMAIL);
  });
});
```

`services/core-api/test/conversions-store.test.js` (mới):

`services/core-api/test/conversions-store.test.js` (mới):

```js
import { describe, it, expect } from 'vitest';
import { CLEARED, cachedTokenStore, capiTokenStore, memoryTokenStore } from '../src/conversions/store.js';
import { secretCache } from '../src/identity/webhooks.js';
import { conversionsDeps } from '../src/conversions/setup.js';

const awsError = (name) => Object.assign(new Error(name), { name });

// Fake AWS client: records [command name, input]; replies from a script keyed by command name.
function fakeClient(replies = {}) {
  const calls = [];
  return {
    calls,
    async send(cmd) {
      const name = cmd.constructor.name;
      calls.push([name, cmd.input]);
      const r = replies[name];
      const v = typeof r === 'function' ? r(cmd.input) : r;
      if (v instanceof Error) throw v;
      return v ?? {};
    },
  };
}

// Spec conversions-relay §1 "token never in Postgres", rulings C1 (clear = sentinel) and C6 (secret name).
describe('Meta CAPI token store', () => {
  it('Secrets Manager: ikf/<env>/app-capi/<app>; get, create on first put', async () => {
    const client = fakeClient({ GetSecretValueCommand: { SecretString: 'EAAB_token_value_0001' } });
    const store = capiTokenStore({ client, prefix: 'ikf/prod/' });
    expect(await store.get('starlyn')).toBe('EAAB_token_value_0001');
    await store.put('starlyn', 'EAAB_token_value_0002');
    expect(client.calls).toEqual([
      ['GetSecretValueCommand', { SecretId: 'ikf/prod/app-capi/starlyn' }],
      ['CreateSecretCommand', { Name: 'ikf/prod/app-capi/starlyn', SecretString: 'EAAB_token_value_0002' }],
    ]);
  });

  it('Secrets Manager: an existing secret gets a new value (ResourceExists → PutSecretValue)', async () => {
    const client = fakeClient({ CreateSecretCommand: awsError('ResourceExistsException') });
    await capiTokenStore({ client, prefix: 'ikf/prod/' }).put('starlyn', 'EAAB_token_value_0003');
    expect(client.calls).toEqual([
      ['CreateSecretCommand', { Name: 'ikf/prod/app-capi/starlyn', SecretString: 'EAAB_token_value_0003' }],
      ['PutSecretValueCommand', { SecretId: 'ikf/prod/app-capi/starlyn', SecretString: 'EAAB_token_value_0003' }],
    ]);
  });

  it('Secrets Manager: clear writes the sentinel (never DeleteSecret); missing or cleared → null; other errors throw', async () => {
    const client = fakeClient({ CreateSecretCommand: awsError('ResourceExistsException'), GetSecretValueCommand: { SecretString: CLEARED } });
    const store = capiTokenStore({ client, prefix: 'ikf/prod/' });
    await store.clear('starlyn');
    expect(client.calls.map(([n]) => n)).toEqual(['CreateSecretCommand', 'PutSecretValueCommand']);
    expect(client.calls[1][1]).toEqual({ SecretId: 'ikf/prod/app-capi/starlyn', SecretString: 'cleared' });
    expect(await store.get('starlyn')).toBeNull();
    const missing = capiTokenStore({ client: fakeClient({ GetSecretValueCommand: awsError('ResourceNotFoundException') }), prefix: 'p/' });
    expect(await missing.get('a')).toBeNull();
    const empty = capiTokenStore({ client: fakeClient({ GetSecretValueCommand: {} }), prefix: 'p/' });
    expect(await empty.get('a')).toBeNull();
    const down = capiTokenStore({ client: fakeClient({ GetSecretValueCommand: awsError('ThrottlingException') }), prefix: 'p/' });
    await expect(down.get('a')).rejects.toThrow('ThrottlingException');
  });

  it('memory store: same interface', async () => {
    const store = memoryTokenStore({ starlyn: 'EAAB_token_value_0001' });
    expect(await store.get('starlyn')).toBe('EAAB_token_value_0001');
    expect(await store.get('other')).toBeNull();
    await store.put('other', 'EAAB_token_value_0002');
    expect(await store.get('other')).toBe('EAAB_token_value_0002');
    await store.clear('starlyn');
    expect(await store.get('starlyn')).toBeNull();
  });

  it('secretCache.drop forgets one app only', async () => {
    let reads = 0;
    const cache = secretCache({ get: async (id) => { reads += 1; return `v_${id}`; } });
    await cache.get('a');
    await cache.get('b');
    cache.drop('a');
    await cache.get('a');
    await cache.get('b');
    expect(reads).toBe(3);
  });

  it('cached store: reads are cached 10 minutes; put, clear and drop take effect at once', async () => {
    const inner = memoryTokenStore({ starlyn: 'EAAB_token_value_0001' });
    let reads = 0;
    const counted = { ...inner, get: async (id) => { reads += 1; return inner.get(id); } };
    let now = 0;
    const tokens = cachedTokenStore(counted, { now: () => now });
    expect(await tokens.get('starlyn')).toBe('EAAB_token_value_0001');
    await inner.put('starlyn', 'EAAB_token_value_0002'); // changed behind the cache
    expect(await tokens.get('starlyn')).toBe('EAAB_token_value_0001');
    expect(reads).toBe(1);
    now = 10 * 60_000;
    expect(await tokens.get('starlyn')).toBe('EAAB_token_value_0002');
    tokens.drop('starlyn');
    await inner.put('starlyn', 'EAAB_token_value_0003');
    expect(await tokens.get('starlyn')).toBe('EAAB_token_value_0003');
    await tokens.put('starlyn', 'EAAB_token_value_0004');
    expect(await tokens.get('starlyn')).toBe('EAAB_token_value_0004');
    await tokens.clear('starlyn');
    expect(await tokens.get('starlyn')).toBeNull();
    expect(await inner.get('starlyn')).toBeNull();
  });
});

// Ruling C8: the relay runs only with a secrets prefix and a secrets client; routes work either way.
describe('conversionsDeps', () => {
  const config = { graphUrl: 'https://graph.facebook.com/v21.0', secretsPrefix: 'ikf/prod/', alarmTopicArn: 'arn:aws:sns:us-east-1:1:alarms' };
  const log = { info: () => {}, warn: () => {}, error: () => {} };

  it('names what is missing and starts nothing', async () => {
    const off = conversionsDeps({ config: { ...config, secretsPrefix: null }, secretsClient: null, snsClient: null, log });
    expect(off.deps).toBeNull();
    expect(off.missing).toEqual(['SECRETS_PREFIX', 'secrets client']);
    const stop = off.start({ pool: null });
    await stop();
  });

  it('a Secrets Manager token store with the 10-minute cache, and an SNS alarm', async () => {
    const client = fakeClient({ GetSecretValueCommand: { SecretString: 'EAAB_token_value_0001' } });
    const sns = fakeClient();
    const on = conversionsDeps({ config, secretsClient: client, snsClient: sns, log });
    expect(on.missing).toEqual([]);
    expect(Object.keys(on.deps)).toEqual(['capiTokens']);
    expect(await on.deps.capiTokens.get('starlyn')).toBe('EAAB_token_value_0001');
    expect(await on.deps.capiTokens.get('starlyn')).toBe('EAAB_token_value_0001');
    expect(client.calls).toEqual([['GetSecretValueCommand', { SecretId: 'ikf/prod/app-capi/starlyn' }]]);
    await on.alarm('capi_token_invalid:starlyn', '{"app_id":"starlyn"}');
    await on.alarm('capi_token_invalid:starlyn', '{"app_id":"starlyn"}');
    expect(sns.calls).toEqual([['PublishCommand', {
      TopicArn: 'arn:aws:sns:us-east-1:1:alarms', Subject: 'ikf billing: capi_token_invalid:starlyn', Message: '{"app_id":"starlyn"}',
    }]]);
  });
});
```

`services/core-api/test/config.test.js` (sửa, áp dụng đúng diff này):

`services/core-api/test/config.test.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/test/config.test.js b/services/core-api/test/config.test.js
index ab1037d..5c63e36 100644
--- a/services/core-api/test/config.test.js
+++ b/services/core-api/test/config.test.js
@@ -38,9 +38,24 @@ describe('loadConfig', () => {
       },
       admin: { appEnv: 'staging', localUser: null, origin: null, apiOrigin: null, googleClientId: null },
       analytics: { clickhouseDatabase: 'ikf' },
+      conversions: {
+        graphUrl: 'https://graph.facebook.com/v21.0',
+        secretsPrefix: 'ikf/staging/',
+        alarmTopicArn: 'arn:aws:sns:us-east-1:111111111111:ikf-staging-alarms',
+      },
     });
   });
 
+  // Spec conversions-relay §5 "Config": the Graph version is a config change, not a code change.
+  it('META_GRAPH_URL: default v21.0, override without a trailing slash; https only (http for APP_ENV=local)', () => {
+    expect(loadConfig({ ...ENV, META_GRAPH_URL: '' }).conversions.graphUrl).toBe('https://graph.facebook.com/v21.0');
+    expect(loadConfig({ ...ENV, META_GRAPH_URL: 'https://graph.facebook.com/v22.0/' }).conversions.graphUrl).toBe('https://graph.facebook.com/v22.0');
+    expect(() => loadConfig({ ...ENV, META_GRAPH_URL: 'http://127.0.0.1:8795/v21.0' })).toThrow('META_GRAPH_URL must be an https URL: http://127.0.0.1:8795/v21.0');
+    expect(() => loadConfig({ ...ENV, META_GRAPH_URL: 'graph.facebook.com/v21.0' })).toThrow('META_GRAPH_URL must be an https URL');
+    expect(() => loadConfig({ ...ENV, META_GRAPH_URL: 'https://graph.facebook.com/v21.0?x=1' })).toThrow('META_GRAPH_URL must be an https URL');
+    expect(loadConfig({ ...ENV, APP_ENV: 'local', META_GRAPH_URL: 'http://127.0.0.1:8795/v21.0' }).conversions.graphUrl).toBe('http://127.0.0.1:8795/v21.0');
+  });
+
   // Spec admin-console-p1 §1: the demo's sign-in without Google never starts outside APP_ENV=local.
   it('ADMIN_LOCAL_USER: refused unless APP_ENV=local', () => {
     for (const APP_ENV of ['staging', 'prod', undefined]) {
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/conversions-send.test.js test/conversions-store.test.js test/config.test.js
```

Expected: `Test Files  3 failed (3)`, `Tests  2 failed | 9 passed (11)`: `conversions-send.test.js` và `conversions-store.test.js` không load được vì `Cannot find module '../src/conversions/store.js'`; trong `config.test.js` fail `× loadConfig > parses the environment` (chưa có `conversions`) và `× loadConfig > META_GRAPH_URL: default v21.0, …` (`Cannot read properties of undefined (reading 'graphUrl')`).

- [ ] **Step 3: Implement**

`services/core-api/src/conversions/store.js`, `services/core-api/src/conversions/setup.js` (mới):

`services/core-api/src/conversions/store.js` (mới):

```js
import { CreateSecretCommand, GetSecretValueCommand, PutSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { secretCache } from '../identity/webhooks.js';

// Spec conversions-relay §1 + ruling C1: a removed token is overwritten with this value instead of deleting the
// secret (a deleted secret blocks re-creating its name for the 7-day recovery window). `get` reads it as "no token".
export const CLEARED = 'cleared';

// Per-app Meta CAPI tokens at <prefix>app-capi/<app_id> (ruling C6), e.g. ikf/prod/app-capi/starlyn.
export function capiTokenStore({ client, prefix }) {
  const name = (appId) => `${prefix}app-capi/${appId}`;
  const put = async (appId, value) => {
    try {
      await client.send(new CreateSecretCommand({ Name: name(appId), SecretString: value }));
    } catch (err) {
      if (err.name !== 'ResourceExistsException') throw err;
      await client.send(new PutSecretValueCommand({ SecretId: name(appId), SecretString: value }));
    }
  };
  return {
    async get(appId) {
      try {
        const v = (await client.send(new GetSecretValueCommand({ SecretId: name(appId) }))).SecretString ?? null;
        return v && v !== CLEARED ? v : null;
      } catch (err) {
        if (err.name === 'ResourceNotFoundException') return null;
        throw err;
      }
    },
    put,
    clear: (appId) => put(appId, CLEARED),
  };
}

// Same interface, in memory: tests and the local demo (no AWS).
export function memoryTokenStore(initial = {}) {
  const tokens = new Map(Object.entries(initial));
  return {
    get: async (appId) => tokens.get(appId) ?? null,
    put: async (appId, token) => {
      tokens.set(appId, token);
    },
    clear: async (appId) => {
      tokens.delete(appId);
    },
  };
}

// What core-api holds as `capiTokens`: reads go through the 10-minute secret cache (spec §2 "Token"); a put or a
// clear through this object drops this task's cached value at once, and the relay drops it on a token error.
// Another ECS task keeps its cached token until the TTL or its own token error.
export function cachedTokenStore(store, opts) {
  const cache = secretCache(store, opts);
  return {
    get: (appId) => cache.get(appId),
    drop: (appId) => cache.drop(appId),
    put: async (appId, token) => {
      await store.put(appId, token);
      cache.drop(appId);
    },
    clear: async (appId) => {
      await store.clear(appId);
      cache.drop(appId);
    },
  };
}
```

`services/core-api/src/conversions/setup.js` (mới):

```js
import { createAlarm, memoryThrottle, redisThrottle, snsPublisher } from '../billing/alarm.js';
import { startConversions } from './relay.js';
import { cachedTokenStore, capiTokenStore } from './store.js';

// Spec conversions-relay §2 "Startup" + ruling C8: the relay needs the per-app token store (Secrets Manager under
// SECRETS_PREFIX); without it core-api logs `conversions disabled, missing: …` and capi_events simply waits.
// config = loadConfig().conversions. → {deps: {capiTokens} | null, missing, alarm, start({pool, …}) → stop}.
// capiTokens is the cached store (get/put/clear/drop) shared by the routes and the relay of this task.
export function conversionsDeps({ config, secretsClient, snsClient, redis = null, log }) {
  const missing = [];
  if (!config.secretsPrefix) missing.push('SECRETS_PREFIX');
  if (!secretsClient) missing.push('secrets client');
  if (!config.graphUrl) missing.push('META_GRAPH_URL');
  if (missing.length) return { deps: null, missing, alarm: null, start: () => async () => {} };
  const capiTokens = cachedTokenStore(capiTokenStore({ client: secretsClient, prefix: config.secretsPrefix }));
  const publish = config.alarmTopicArn
    ? snsPublisher({ client: snsClient, topicArn: config.alarmTopicArn })
    : async (subject, message) => log.error({ subject, message }, 'alarm');
  const alarm = createAlarm({ publish, throttle: redis ? redisThrottle(redis, memoryThrottle()) : memoryThrottle(), log });
  return {
    deps: { capiTokens },
    missing,
    alarm,
    // opts: fetch and the loop intervals (tests); production uses the defaults of startConversions.
    start: ({ pool, ...opts }) => startConversions({ pool, tokens: capiTokens, graphUrl: config.graphUrl, alarm, log, ...opts }),
  };
}
```

`services/core-api/src/conversions/relay.js`, `services/core-api/src/identity/webhooks.js`, `services/core-api/src/config.js`, `services/core-api/src/server.js` (sửa, áp dụng đúng diff này):

`services/core-api/src/conversions/relay.js`, `services/core-api/src/identity/webhooks.js`, `services/core-api/src/config.js`, `services/core-api/src/server.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/config.js b/services/core-api/src/config.js
index bc0c8e9..b003e3e 100644
--- a/services/core-api/src/config.js
+++ b/services/core-api/src/config.js
@@ -22,6 +22,23 @@ function origin(env, name) {
   return u.origin;
 }
 
+// Spec conversions-relay §5 "Config": the Graph API base with its version, e.g. https://graph.facebook.com/v21.0.
+export const DEFAULT_META_GRAPH_URL = 'https://graph.facebook.com/v21.0';
+
+// https (http only for the local demo's fake Graph server), no query or fragment; returned without a trailing slash.
+function graphUrl(env) {
+  const v = env.META_GRAPH_URL || DEFAULT_META_GRAPH_URL;
+  let u = null;
+  try {
+    u = new URL(v);
+  } catch {
+    // reported below
+  }
+  const ok = u && !u.search && !u.hash && (u.protocol === 'https:' || (env.APP_ENV === 'local' && u.protocol === 'http:'));
+  if (!ok) throw new Error(`META_GRAPH_URL must be an https URL: ${v}`);
+  return v.replace(/\/+$/, '');
+}
+
 export function loadConfig(env = process.env) {
   const missing = REQUIRED.filter((k) => !env[k]);
   if (missing.length) throw new Error(`missing env: ${missing.join(', ')}`);
@@ -62,5 +79,12 @@ export function loadConfig(env = process.env) {
     },
     // Admin console analytics (spec admin-console-p3 §2): the ClickHouse database the reader queries.
     analytics: { clickhouseDatabase: env.CLICKHOUSE_DATABASE || 'ikf' },
+    // Conversions relay, Meta CAPI (spec conversions-relay §2 "Startup", ruling C8): META_GRAPH_URL (optional,
+    // default above); per-app tokens in Secrets Manager under SECRETS_PREFIX; token alarms to ALARM_TOPIC_ARN.
+    conversions: {
+      graphUrl: graphUrl(env),
+      secretsPrefix: env.SECRETS_PREFIX,
+      alarmTopicArn: env.ALARM_TOPIC_ARN || null,
+    },
   };
 }
diff --git a/services/core-api/src/conversions/relay.js b/services/core-api/src/conversions/relay.js
index bb871a5..f529b2c 100644
--- a/services/core-api/src/conversions/relay.js
+++ b/services/core-api/src/conversions/relay.js
@@ -1,8 +1,17 @@
+import { buildBody, buildEvent, classify, retryDelay } from './event.js';
+
 // Spec conversions-relay §2: the relay that turns payment.succeeded outbox rows into Meta CAPI Purchase events.
-// Tick 1 (enqueue) and Tick 3 (sweep) live here, plus reviveNoToken for "When a token is entered".
+// Tick 1 (enqueue), Tick 2 (send) and Tick 3 (sweep) live here, plus reviveNoToken for "When a token is entered"
+// and startConversions, the three loops core-api runs.
 
 export const ENQUEUE_BATCH = 200;
 export const SWEEP_BATCH = 1000;
+export const SEND_BATCH = 200;
+export const EVENTS_PER_REQUEST = 50;
+export const SEND_TIMEOUT_MS = 10_000;
+export const ENQUEUE_INTERVAL_MS = 15_000;
+export const SEND_INTERVAL_MS = 10_000;
+export const SWEEP_INTERVAL_MS = 3_600_000;
 
 // Ruling C7: checkouts only keep these three values; a missing one (older bundles) counts as granted.
 const NO_CONSENT = new Set(['denied', 'unknown_required']);
@@ -112,3 +121,216 @@ export async function reviveNoToken(db, appId) {
   );
   return rowCount;
 }
+
+// Claim (spec §2 "Locking"): one short statement, its own transaction. The due rows get attempts + 1 and are hidden
+// for 2 minutes, then the lock is gone before any HTTP call: a worker that dies mid-send lets them come back after
+// 2 minutes (Meta deduplicates event_id + event_name). The CTE locks the whole batch before the UPDATE runs, and
+// SKIP LOCKED makes a second worker take the next rows instead of waiting.
+async function claim(pool, batch) {
+  const { rows } = await pool.query(
+    `WITH due AS (
+       SELECT id FROM capi_events WHERE status = 'pending' AND next_attempt_at <= now()
+        ORDER BY next_attempt_at, id LIMIT $1 FOR UPDATE SKIP LOCKED)
+     UPDATE capi_events ce SET attempts = ce.attempts + 1, next_attempt_at = now() + interval '2 minutes'
+       FROM due WHERE ce.id = due.id
+     RETURNING ce.id, ce.event_id, ce.app_id, ce.pixel_id, ce.attempts`,
+    [batch],
+  );
+  return rows.sort((a, b) => Number(a.id) - Number(b.id));
+}
+
+// What Meta needs beyond the row, read at send time (spec §1: capi_events never holds an email): the funnel slug,
+// the customer (email, id) of the transaction.
+async function details(pool, ids) {
+  const { rows } = await pool.query(
+    `SELECT ce.id, ce.event_id, ce.event_time, ce.value_minor::float8 AS value_minor, ce.currency, f.slug AS funnel,
+            t.customer_id, cu.email
+       FROM capi_events ce
+       LEFT JOIN funnels f ON f.id = ce.funnel_id
+       LEFT JOIN transactions t ON t.paddle_transaction_id = ce.event_id
+       LEFT JOIN customers cu ON cu.id = t.customer_id
+      WHERE ce.id = ANY($1::bigint[])`,
+    [ids],
+  );
+  return new Map(rows.map((r) => [String(r.id), r]));
+}
+
+async function eventFor(pool, r) {
+  const checkout = await checkoutFor(pool, r.event_id);
+  const event = buildEvent(r, {
+    email: r.email,
+    customer_id: r.customer_id,
+    attribution: checkout?.attribution ?? null,
+    client_ip: checkout?.client_ip ?? null,
+    client_ua: checkout?.client_ua ?? null,
+    client_url: checkout?.client_url ?? null,
+  });
+  // A transaction without a customer would hash 'ikf:null', the same id for every such buyer.
+  if (r.customer_id == null) delete event.user_data.external_id;
+  return event;
+}
+
+// Ruling C2: JSON body, token inside it, never in the URL; no redirects followed; 10 s bound. The response is read
+// for Meta's error code only.
+async function post({ fetch, graphUrl, timeoutMs }, pixelId, body) {
+  try {
+    const res = await fetch(`${graphUrl}/${encodeURIComponent(pixelId)}/events`, {
+      method: 'POST',
+      redirect: 'manual',
+      signal: AbortSignal.timeout(timeoutMs),
+      headers: { 'content-type': 'application/json' },
+      body: JSON.stringify(body),
+    });
+    let json = null;
+    try {
+      json = await res.json();
+    } catch {
+      // not JSON: the HTTP status decides
+    }
+    return classify({ status: res.status, body: json });
+  } catch (error) {
+    return classify({ error });
+  }
+}
+
+const ids = (rows) => rows.map((r) => r.id);
+
+async function markRetry(pool, rows, code) {
+  // Spec §2 backoff by attempt (1m, 5m, 30m, 2h, 6h); retryDelay null after the 6th attempt → dead.
+  const delays = rows.map((r) => {
+    const ms = retryDelay(r.attempts);
+    return ms === null ? null : ms / 1000;
+  });
+  await pool.query(
+    `UPDATE capi_events ce
+        SET status = CASE WHEN v.delay IS NULL THEN 'dead' ELSE 'pending' END,
+            next_attempt_at = CASE WHEN v.delay IS NULL THEN ce.next_attempt_at ELSE now() + make_interval(secs => v.delay) END,
+            last_error = $3
+       FROM unnest($1::bigint[], $2::float8[]) AS v(id, delay)
+      WHERE ce.id = v.id`,
+    [ids(rows), delays, code],
+  );
+  const dead = delays.filter((d) => d === null).length;
+  return { retry: rows.length - dead, dead };
+}
+
+const markDead = (pool, rows, code) =>
+  pool.query("UPDATE capi_events SET status = 'dead', last_error = $2 WHERE id = ANY($1::bigint[])", [ids(rows), code]);
+
+// One (app, pixel) group: token, then chunks of 50 in order; a token error stops the group (spec §2 "Results").
+async function sendGroup(deps, group, out) {
+  const { pool, tokens, alarm, log } = deps;
+  const { app_id: appId, pixel_id: pixelId, rows } = group;
+  const note = (level, count, status, code) =>
+    log?.[level]?.({ app_id: appId, pixel_id: pixelId, count, status, error_code: code }, 'capi_send');
+  if (!appId || !pixelId) {
+    // Not made by enqueue (it only queues rows with both); kept out of the Graph URL.
+    await pool.query("UPDATE capi_events SET status = 'skipped', skip_reason = $2 WHERE id = ANY($1::bigint[])", [ids(rows), appId ? 'no_pixel' : 'no_app']);
+    out.skipped += rows.length;
+    return;
+  }
+  let token;
+  try {
+    token = await tokens.get(appId);
+  } catch (err) {
+    // Secrets Manager down: the rows wait like any other retryable failure (code only, never the message).
+    const code = `secrets_${err?.name ?? 'error'}`;
+    const r = await markRetry(pool, rows, code);
+    out.retry += r.retry;
+    out.dead += r.dead;
+    note('warn', rows.length, 'retry', code);
+    return;
+  }
+  if (!token) {
+    // Spec §2 "Token": a token entered later revives these (reviveNoToken).
+    await pool.query("UPDATE capi_events SET status = 'skipped', skip_reason = 'no_token' WHERE id = ANY($1::bigint[])", [ids(rows)]);
+    out.skipped += rows.length;
+    note('warn', rows.length, 'skipped', 'no_token');
+    return;
+  }
+  const { rows: [app] } = await pool.query('SELECT capi_test_code FROM apps WHERE id = $1', [appId]);
+  const testCode = app?.capi_test_code ?? null;
+  const info = await details(pool, ids(rows));
+  for (let i = 0; i < rows.length; i += EVENTS_PER_REQUEST) {
+    const chunk = rows.slice(i, i + EVENTS_PER_REQUEST);
+    const events = [];
+    for (const r of chunk) events.push(await eventFor(pool, info.get(String(r.id))));
+    const result = await post(deps, pixelId, buildBody(events, { token, testCode }));
+    if (result.kind === 'ok') {
+      await pool.query(
+        "UPDATE capi_events SET status = 'sent', sent_at = now(), test_code = $2, last_error = NULL WHERE id = ANY($1::bigint[])",
+        [ids(chunk), testCode],
+      );
+      out.sent += chunk.length;
+      note('info', chunk.length, 'sent', null);
+    } else if (result.kind === 'retry') {
+      const r = await markRetry(pool, chunk, result.code);
+      out.retry += r.retry;
+      out.dead += r.dead;
+      note('warn', chunk.length, r.dead ? 'dead' : 'retry', result.code);
+    } else if (result.kind === 'dead') {
+      await markDead(pool, chunk, result.code);
+      out.dead += chunk.length;
+      note('warn', chunk.length, 'dead', result.code);
+    } else {
+      // Bad token or no permission on the pixel: nothing in this group can succeed until an admin fixes it (C4).
+      const rest = rows.slice(i);
+      await markDead(pool, rest, result.code);
+      out.dead += rest.length;
+      tokens.drop?.(appId);
+      note('warn', rest.length, 'token_invalid', result.code);
+      // Kind per app: the alarm throttle then holds back repeats of the same app only.
+      await alarm?.(`capi_token_invalid:${appId}`, JSON.stringify({ app_id: appId }));
+      return;
+    }
+  }
+}
+
+// Tick 2 (spec §2): claim up to `batch` due rows, group them by (app, pixel), send each group outside any
+// transaction, write each chunk's result. deps = {pool, tokens: {get, drop}, fetch, graphUrl, alarm, log, timeoutMs}.
+// → counts of rows: {claimed, sent, retry, dead, skipped}.
+export async function send(deps, { batch = SEND_BATCH } = {}) {
+  const full = { fetch: globalThis.fetch, timeoutMs: SEND_TIMEOUT_MS, ...deps };
+  const rows = await claim(full.pool, batch);
+  const groups = new Map();
+  for (const r of rows) {
+    const key = `${r.app_id ?? ''}\u0000${r.pixel_id ?? ''}`;
+    if (!groups.has(key)) groups.set(key, { app_id: r.app_id, pixel_id: r.pixel_id, rows: [] });
+    groups.get(key).rows.push(r);
+  }
+  const out = { claimed: rows.length, sent: 0, retry: 0, dead: 0, skipped: 0 };
+  // Groups in parallel: one slow pixel must not keep the others past their 2-minute claim.
+  await Promise.all([...groups.values()].map((g) => sendGroup(full, g, out)));
+  return out;
+}
+
+// Runs in the core-api process (spec §2): enqueue every 15 s, send every 10 s, sweep hourly, each its own loop that
+// waits for its previous run (no overlap). Returns stop(), which resolves when all loops are idle.
+export function startConversions({
+  pool, tokens, fetch = globalThis.fetch, graphUrl, alarm, log,
+  enqueueMs = ENQUEUE_INTERVAL_MS, sendMs = SEND_INTERVAL_MS, sweepMs = SWEEP_INTERVAL_MS,
+}) {
+  let stopped = false;
+  const timers = new Map();
+  const running = new Set();
+  const loop = (tick, ms, fn) => {
+    const run = async () => {
+      if (stopped) return;
+      // Code only: a pg or fetch message can carry parameters (emails, tokens).
+      const p = fn().catch((err) => log?.error({ tick, code: err?.code ?? 'error' }, 'conversions_tick_failed'));
+      running.add(p);
+      await p;
+      running.delete(p);
+      if (!stopped) timers.set(tick, setTimeout(run, ms));
+    };
+    timers.set(tick, setTimeout(run, 0));
+  };
+  loop('enqueue', enqueueMs, () => enqueue(pool));
+  loop('send', sendMs, () => send({ pool, tokens, fetch, graphUrl, alarm, log }));
+  loop('sweep', sweepMs, () => sweepClientData(pool));
+  return async function stop() {
+    stopped = true;
+    for (const t of timers.values()) clearTimeout(t);
+    await Promise.allSettled([...running]);
+  };
+}
diff --git a/services/core-api/src/identity/webhooks.js b/services/core-api/src/identity/webhooks.js
index e0fe67c..696808c 100644
--- a/services/core-api/src/identity/webhooks.js
+++ b/services/core-api/src/identity/webhooks.js
@@ -40,6 +40,10 @@ export function secretCache(store, { ttlMs = SECRET_CACHE_MS, now = Date.now } =
       if (value) cache.set(appId, { value, at: now() });
       return value;
     },
+    // Forget one app's value (Meta CAPI: a rejected or replaced token, spec conversions-relay §2).
+    drop(appId) {
+      cache.delete(appId);
+    },
   };
 }
 
diff --git a/services/core-api/src/server.js b/services/core-api/src/server.js
index 70d37ec..991316c 100644
--- a/services/core-api/src/server.js
+++ b/services/core-api/src/server.js
@@ -22,6 +22,7 @@ import { ANALYTICS_SECRETS, analyticsDeps } from './analytics/setup.js';
 import { startSessionSweep } from './admin/sweep.js';
 import { startEntitlementSync } from './identity/sync.js';
 import { startWebhookSender } from './identity/webhooks.js';
+import { conversionsDeps } from './conversions/setup.js';
 
 const REQUIRED_SECRETS = ['cf-kv-api-token', 'r2-access-key-id', 'r2-secret-access-key'];
 
@@ -85,10 +86,11 @@ if (!billing.deps) {
 }
 
 const log = { info: (o, m) => console.log(m, JSON.stringify(o)), warn: (o, m) => console.warn(m, JSON.stringify(o)), error: (o, m) => console.error(m, JSON.stringify(o)) };
+const secretsClient = new SecretsManagerClient({ region, requestHandler: { requestTimeout: 10_000, connectionTimeout: 5_000 } });
 const identity = identityDeps({
   config: config.identity,
   secrets,
-  secretsClient: new SecretsManagerClient({ region, requestHandler: { requestTimeout: 10_000, connectionTimeout: 5_000 } }),
+  secretsClient,
   sesClient: new SESv2Client({ region, requestHandler: { requestTimeout: 10_000, connectionTimeout: 5_000 } }),
   snsClient: new SNSClient({ region, requestHandler: { requestTimeout: 10_000, connectionTimeout: 5_000 } }),
   redis,
@@ -105,6 +107,17 @@ if (!admin.deps) {
   console.error(`admin console disabled, missing: ${admin.missing.join(', ')}`);
 }
 
+// Conversions relay, Meta CAPI (spec conversions-relay §2 "Startup", ruling C8): the per-app token store and the
+// relay loops. Off: the /capi routes still answer (a token PUT → 503 capi_unavailable) and capi_events waits.
+const conversions = conversionsDeps({
+  config: config.conversions,
+  secretsClient,
+  snsClient: new SNSClient({ region, requestHandler: { requestTimeout: 10_000, connectionTimeout: 5_000 } }),
+  redis,
+  log,
+});
+if (!conversions.deps) console.error(`conversions disabled, missing: ${conversions.missing.join(', ')}`);
+
 // Dashboard analytics off until the three ClickHouse reader values are entered (logged inside).
 const analytics = analyticsDeps({ config: config.analytics, secrets, prefix: config.secretsPrefix, log });
 
@@ -114,7 +127,7 @@ const app = buildApp({
     db: () => pool.query('select 1'),
     cache: () => redis.ping(),
   },
-  deps: { pool, store, kv, mediaOrigins: config.mediaOrigins, previewBaseUrl: config.previewBaseUrl, ...billing.deps, ...identity.deps, ...admin.deps, ...analytics.deps },
+  deps: { pool, store, kv, mediaOrigins: config.mediaOrigins, previewBaseUrl: config.previewBaseUrl, ...billing.deps, ...identity.deps, ...admin.deps, ...analytics.deps, ...conversions.deps },
 });
 
 const stopResync = startResync({ pool, kv, log: app.log });
@@ -135,6 +148,8 @@ const stopEntitlementSync = identity.deps
 const stopWebhookSender = identity.deps
   ? startWebhookSender({ pool, secrets: identity.secrets, alarm: identity.alarm, log })
   : async () => {};
+// Conversions relay (enqueue 15 s, send 10 s, sweep hourly); a no-op stop when disabled.
+const stopConversions = conversions.start({ pool });
 
 let shuttingDown = false;
 const shutdown = async () => {
@@ -144,7 +159,7 @@ const shutdown = async () => {
   stopResync();
   stopSessionSweep();
   await stopBillingSync(); // ends the long poll; the message in hand finishes or returns to the queue
-  await Promise.all([stopEntitlementSync(), stopWebhookSender()]); // the tick in hand commits or rolls back
+  await Promise.all([stopEntitlementSync(), stopWebhookSender(), stopConversions()]); // the tick in hand commits or rolls back
   await app.close();
   await Promise.allSettled([pool.end(), redis.quit()]);
   process.exit(0);
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/conversions-send.test.js test/conversions-store.test.js test/config.test.js
node --check services/core-api/src/server.js
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Test Files  3 passed (3)`, `Tests  33 passed (33)` (14 send + 8 store + 11 config); toàn bộ core-api: `Test Files  79 passed (79)`, `Tests  767 passed (767)`

- [ ] **Step 5: Commit**

```bash
git add services/core-api/src/conversions/store.js services/core-api/src/conversions/setup.js services/core-api/src/conversions/relay.js services/core-api/src/identity/webhooks.js services/core-api/src/config.js services/core-api/src/server.js services/core-api/test/conversions-send.test.js services/core-api/test/conversions-store.test.js services/core-api/test/config.test.js
git commit -m "feat(core-api): conversions relay sends Purchase to Meta CAPI with retries, dead letters and per-app tokens"
```

---

---

### Task 6: API — cài đặt CAPI của app, danh sách sự kiện, gửi lại, summary

**Files:**
- Create: `services/core-api/src/http/capi.js`
- Modify: `services/core-api/src/http/schemas.js` (thêm `capiBody`), `services/core-api/src/admin/resolve.js` (thêm `appOfCapiEvent`), `services/core-api/src/app.js` (đăng ký `capiHttp`), `services/core-api/src/identity/app-summary.js` (thêm `capi`)
- Test: `services/core-api/test/capi-http.test.js` (mới), `services/core-api/test/scope-capi.test.js` (mới)

**Interfaces:**
- Consumes: `capiTokens` trong deps của `buildApp` = `cachedTokenStore(...)` `{get, put, clear, drop}` (Task 5; có thể `undefined`); `reviveNoToken(db, appId)` từ `src/conversions/relay.js` (Task 4); cột `apps.capi_token_last4/capi_token_set_at/capi_test_code`, bảng `capi_events` (Task 1); `requireGrant`, `appOfApp`, `audit`, `withTx` (`src/identity/link.js`), `HttpError`.
- Produces:
  - `src/http/capi.js` (default export `capiHttp(app, {pool, capiTokens})`), luôn đăng ký khi có `pool` (ruling C8):
    - `GET /v1/apps/:id/capi` (viewer trong app; ngoài scope / không có app → `404 app_not_found {app_id}`) → `{token_last4, token_set_at, test_code, counts_24h: {pending, sent, skipped, dead}, pixel_funnels_without_token}`; `counts_24h` theo `created_at` trong 24h; `pixel_funnels_without_token` = số funnel của app có `pixel_id` khi app chưa có token, ngược lại 0.
    - `PUT /v1/apps/:id/capi` (admin trong app) body `capiBody` `{token?: string|null, test_code?: string|null}`: không key nào → `400 bad_request`; app không có → `404 app_not_found`; token sai `^[A-Za-z0-9_-]{20,400}$` → `400 invalid_token`; test_code sai `^TEST[0-9A-Za-z]{1,20}$` → `400 invalid_test_code` (mọi kiểm tra trước khi đụng Secrets Manager); đổi token mà không có `capiTokens` → `503 capi_unavailable`. Token string: `capiTokens.put` trước, rồi một `withTx`: `capi_token_last4`, `capi_token_set_at = now()`, `reviveNoToken`, audit `app.capi_token {action: 'set', last4}`. `token: null`: `capiTokens.clear` (ruling C1) rồi null hai cột, audit `{action: 'clear'}`. `test_code`: update + audit `app.capi_test_code {test_code}` (cùng transaction). Header `cache-control: no-store`; trả body như GET; không bao giờ trả token.
    - `GET /v1/capi-events?app=<id>&status=&before=<id>` (viewer trong app đó; thiếu `app` → `400 app_required`; app không có / ngoài scope → `404 app_not_found`) → `{events: [{id, event_id, funnel (slug|null), value_minor, currency, event_time, status, skip_reason, attempts, last_error, test_code, sent_at}], next_before}`, 50 dòng, mới nhất trước.
    - `POST /v1/capi-events/:id/resend` (admin trong app của event; event không app → chỉ global/default role): không có → `404 capi_event_not_found`; id không phải số → `400`; khác `dead` → `409 not_dead`; `dead` → `pending`, `attempts = 0`, `next_attempt_at = now()`, giữ `last_error`; audit `capi.resend {event_id}` (target `app:<app_id>`, `app_id`); trả dòng event (cùng dạng như list).
  - `src/admin/resolve.js`: `appOfCapiEvent(db, id)` → app_id / null / undefined (id không phải chữ số → undefined).
  - `src/http/schemas.js`: `capiBody`.
  - `appSummary` (`GET /v1/apps/:id/summary`) thêm `capi: {configured: boolean, dead_24h: number}`.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/capi-http.test.js`, `services/core-api/test/scope-capi.test.js` (mới):

`services/core-api/test/capi-http.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp } from './helpers/app.js';
import { signIn } from './helpers/admin.js';
import { fakeSecrets } from './helpers/identity.js';
import { cachedTokenStore, memoryTokenStore } from '../src/conversions/store.js';

const APP = (id) =>
  `INSERT INTO apps (id, name, kind, adjust_tracker_url, deeplink_scheme, api_key_hash)
   VALUES ('${id}', '${id}', 'app', 'https://app.adjust.com/${id}', '${id}', 'h-${id}')`;
const TOKEN = 'EAAB_capi_secret_token_value_9xYz';
const TOKEN2 = 'EAAB-second-secret-token-0000_wxyz';
const EMPTY = { pending: 0, sent: 0, skipped: 0, dead: 0 };

// Spec conversions-relay §4 "Routes" + `/summary` capi field; rulings C1 (clear = overwrite), C5, C8 (503 without a
// token store). The token never comes back in any answer nor in audit_log, only its last 4 characters.
describe('CAPI settings, conversions list and resend (spec conversions-relay §4)', () => {
  let db;
  let app;
  let store;
  let tokens;
  let g;
  let outboxN;
  const q = async (sql, p) => (await db.pool.query(sql, p)).rows;
  const call = (method, url, payload) => app.inject({ method, url, headers: g.headers(method !== 'GET'), ...(payload !== undefined && { payload }) });
  const funnelId = async (slug) => Number((await q('SELECT id FROM funnels WHERE slug = $1', [slug]))[0].id);
  // One capi_events row (+ its outbox row): created/event times as SQL intervals before now().
  const event = async (eventId, { appId = 'starlyn', slug = 'star', status = 'pending', skip = null, age = '1 hour', eventAge = age, attempts = 0, lastError = null } = {}) => {
    outboxN += 1;
    const [{ id: oid }] = await q(
      "INSERT INTO outbox (topic, aggregate_id, dedupe_key, payload) VALUES ('payment.succeeded', $1, $2, '{}') RETURNING id",
      [eventId, `payment.succeeded:${eventId}:${outboxN}`],
    );
    const [{ id }] = await q(
      `INSERT INTO capi_events (outbox_id, event_id, app_id, funnel_id, pixel_id, value_minor, currency, event_time, status, skip_reason,
                                attempts, last_error, created_at, next_attempt_at)
       VALUES ($1, $2, $3, $4, '1234567', 1999, 'USD', now() - $5::interval, $6, $7, $8, $9, now() - $10::interval, now() + interval '1 hour')
       RETURNING id`,
      [oid, eventId, appId, slug ? await funnelId(slug) : null, eventAge, status, skip, attempts, lastError, age],
    );
    return Number(id);
  };
  const auditRows = () => q('SELECT action, target, details, app_id FROM audit_log ORDER BY id');

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    outboxN = 0;
    await q(APP('starlyn'));
    await q(APP('chatchi'));
    await q(
      `INSERT INTO funnels (slug, created_by, app_id, pixel_id) VALUES
         ('star', 't', 'starlyn', '1234567'), ('sun', 't', 'starlyn', NULL), ('chat', 't', 'chatchi', '7654321')`,
    );
    store = memoryTokenStore();
    tokens = cachedTokenStore(store);
    ({ app } = await makeApp(db.pool, { webhookSecrets: fakeSecrets(), capiTokens: tokens }));
    g = await signIn(db.pool, 'g@ikameglobal.com', 'admin');
  });
  afterEach(() => app.close());

  it('GET /v1/apps/:id/capi: no token yet → nulls, 24h counts of this app only, funnels with a pixel waiting for a token', async () => {
    await event('txn_p');
    await event('txn_s1', { status: 'sent' });
    await event('txn_s2', { status: 'sent' });
    await event('txn_k', { status: 'skipped', skip: 'no_token' });
    await event('txn_d', { status: 'dead', lastError: 'meta_190' });
    await event('txn_old', { status: 'dead', age: '25 hours' }); // older than 24h: not counted
    await event('txn_c', { appId: 'chatchi', slug: 'chat', status: 'dead' }); // another app
    const res = await call('GET', '/v1/apps/starlyn/capi');
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      token_last4: null,
      token_set_at: null,
      test_code: null,
      counts_24h: { pending: 1, sent: 2, skipped: 1, dead: 1 },
      pixel_funnels_without_token: 1,
    });
    const missing = await call('GET', '/v1/apps/ghost/capi');
    expect([missing.statusCode, missing.json()]).toEqual([404, { error: 'app_not_found', detail: { app_id: 'ghost' } }]);
    expect((await app.inject({ method: 'GET', url: '/v1/apps/starlyn/capi' })).statusCode).toBe(401);
  });

  it('PUT {token}: Secrets Manager first, then last4 + set_at, revives this app\'s no_token rows of the last 7 days, audit set; token never echoed', async () => {
    await event('txn_k1', { status: 'skipped', skip: 'no_token', attempts: 0 });
    await event('txn_k2', { status: 'skipped', skip: 'no_token', age: '2 days' });
    await event('txn_k_old', { status: 'skipped', skip: 'no_token', age: '8 days' }); // outside the 7-day window
    await event('txn_np', { status: 'skipped', skip: 'no_pixel' });
    await event('txn_kc', { appId: 'chatchi', slug: 'chat', status: 'skipped', skip: 'no_token' });
    await tokens.get('starlyn'); // cached "no token" must not survive the put
    const res = await call('PUT', '/v1/apps/starlyn/capi', { token: TOKEN });
    expect(res.statusCode).toBe(200);
    expect(res.headers['cache-control']).toBe('no-store');
    const body = res.json();
    expect(body).toEqual({
      token_last4: TOKEN.slice(-4),
      token_set_at: expect.any(String),
      test_code: null,
      counts_24h: { pending: 1, sent: 0, skipped: 1, dead: 0 },
      pixel_funnels_without_token: 0,
    });
    expect(res.body).not.toContain(TOKEN);
    expect(await store.get('starlyn')).toBe(TOKEN);
    expect(await tokens.get('starlyn')).toBe(TOKEN);
    expect(await q("SELECT event_id, status, skip_reason, attempts, next_attempt_at <= now() AS due FROM capi_events ORDER BY id")).toEqual([
      { event_id: 'txn_k1', status: 'pending', skip_reason: null, attempts: 0, due: true },
      { event_id: 'txn_k2', status: 'pending', skip_reason: null, attempts: 0, due: true },
      { event_id: 'txn_k_old', status: 'skipped', skip_reason: 'no_token', attempts: 0, due: false },
      { event_id: 'txn_np', status: 'skipped', skip_reason: 'no_pixel', attempts: 0, due: false },
      { event_id: 'txn_kc', status: 'skipped', skip_reason: 'no_token', attempts: 0, due: false },
    ]);
    expect(await auditRows()).toEqual([
      { action: 'app.capi_token', target: 'app:starlyn', details: { action: 'set', last4: TOKEN.slice(-4) }, app_id: 'starlyn' },
    ]);

    // replace: the new token's last 4; GET answers the same body
    const again = await call('PUT', '/v1/apps/starlyn/capi', { token: TOKEN2 });
    expect(again.json().token_last4).toBe('wxyz');
    expect(await store.get('starlyn')).toBe(TOKEN2);
    expect((await call('GET', '/v1/apps/starlyn/capi')).json()).toEqual(again.json());
    const everything = JSON.stringify([await auditRows(), (await call('GET', '/v1/apps/starlyn/capi')).json(), (await call('GET', '/v1/capi-events?app=starlyn')).json()]);
    expect(everything).not.toContain(TOKEN);
    expect(everything).not.toContain(TOKEN2);
  });

  it('PUT {token: null}: the store is cleared (ruling C1), the columns nulled, audit clear', async () => {
    await call('PUT', '/v1/apps/starlyn/capi', { token: TOKEN });
    const res = await call('PUT', '/v1/apps/starlyn/capi', { token: null });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ token_last4: null, token_set_at: null, pixel_funnels_without_token: 1 });
    expect(await store.get('starlyn')).toBeNull();
    expect(await tokens.get('starlyn')).toBeNull();
    expect(await q("SELECT capi_token_last4, capi_token_set_at FROM apps WHERE id = 'starlyn'")).toEqual([{ capi_token_last4: null, capi_token_set_at: null }]);
    expect((await auditRows()).map((r) => [r.action, r.details])).toEqual([
      ['app.capi_token', { action: 'set', last4: TOKEN.slice(-4) }],
      ['app.capi_token', { action: 'clear' }],
    ]);
  });

  it('PUT {test_code}: set and clear, audit app.capi_test_code; token + test_code in one call', async () => {
    const set = await call('PUT', '/v1/apps/starlyn/capi', { test_code: 'TEST12345' });
    expect([set.statusCode, set.json().test_code]).toEqual([200, 'TEST12345']);
    const off = await call('PUT', '/v1/apps/starlyn/capi', { test_code: null });
    expect([off.statusCode, off.json().test_code]).toEqual([200, null]);
    const both = await call('PUT', '/v1/apps/starlyn/capi', { token: TOKEN, test_code: 'TESTabc9' });
    expect(both.json()).toMatchObject({ token_last4: TOKEN.slice(-4), test_code: 'TESTabc9' });
    expect(await q("SELECT capi_test_code FROM apps WHERE id = 'starlyn'")).toEqual([{ capi_test_code: 'TESTabc9' }]);
    expect((await auditRows()).map((r) => [r.action, r.details, r.app_id])).toEqual([
      ['app.capi_test_code', { test_code: 'TEST12345' }, 'starlyn'],
      ['app.capi_test_code', { test_code: null }, 'starlyn'],
      ['app.capi_token', { action: 'set', last4: TOKEN.slice(-4) }, 'starlyn'],
      ['app.capi_test_code', { test_code: 'TESTabc9' }, 'starlyn'],
    ]);
  });

  it('PUT validation: invalid_token, invalid_test_code, empty or unknown body → 400; nothing stored, no audit', async () => {
    // a number is coerced to a string by Fastify's schema (coerceTypes) and then fails the pattern
    for (const token of ['short_token_19chars', 'x'.repeat(401), 'EAAB secret token with spaces', 'EAAB+secret/token=value12', 42]) {
      const res = await call('PUT', '/v1/apps/starlyn/capi', { token });
      expect([res.statusCode, res.json().error], String(token)).toEqual([400, 'invalid_token']);
    }
    for (const code of ['TEST', 'test123', 'TEST12-3', `TEST${'1'.repeat(21)}`]) {
      const res = await call('PUT', '/v1/apps/starlyn/capi', { test_code: code });
      expect([res.statusCode, res.json().error], code).toEqual([400, 'invalid_test_code']);
    }
    // a bad test code also stops a valid token: nothing is written to the store
    const mixed = await call('PUT', '/v1/apps/starlyn/capi', { token: TOKEN, test_code: 'nope' });
    expect([mixed.statusCode, mixed.json().error]).toEqual([400, 'invalid_test_code']);
    for (const payload of [{}, { extra: 1 }]) {
      expect((await call('PUT', '/v1/apps/starlyn/capi', payload)).json().error).toBe('bad_request');
    }
    expect(await store.get('starlyn')).toBeNull();
    expect(await auditRows()).toEqual([]);
    expect((await call('PUT', '/v1/apps/ghost/capi', { token: TOKEN })).statusCode).toBe(404);
    expect(await store.get('ghost')).toBeNull();
  });

  it('ruling C8: without a token store a token change → 503 capi_unavailable; test_code and GET still work', async () => {
    await app.close();
    ({ app } = await makeApp(db.pool, { webhookSecrets: fakeSecrets() }));
    for (const token of [TOKEN, null]) {
      const res = await call('PUT', '/v1/apps/starlyn/capi', { token });
      expect([res.statusCode, res.json().error]).toEqual([503, 'capi_unavailable']);
    }
    expect((await call('PUT', '/v1/apps/starlyn/capi', { test_code: 'TEST1' })).statusCode).toBe(200);
    expect((await call('GET', '/v1/apps/starlyn/capi')).json()).toMatchObject({ token_last4: null, test_code: 'TEST1' });
    expect((await auditRows()).map((r) => r.action)).toEqual(['app.capi_test_code']);
  });

  it('GET /v1/capi-events: 50 per page newest first, next_before, status filter, the fields of spec §4; app_required, app_not_found', async () => {
    for (let i = 0; i < 53; i += 1) await event(`txn_${String(i).padStart(2, '0')}`, { status: i % 10 === 0 ? 'dead' : 'sent' });
    await event('txn_other', { appId: 'chatchi', slug: 'chat' });
    await q("UPDATE capi_events SET sent_at = '2026-10-16T08:00:05Z', test_code = 'TEST1', event_time = '2026-10-16T08:00:00Z' WHERE event_id = 'txn_52'");
    const page1 = (await call('GET', '/v1/capi-events?app=starlyn')).json();
    expect(page1.events).toHaveLength(50);
    expect(page1.events[0]).toEqual({
      id: 53,
      event_id: 'txn_52',
      funnel: 'star',
      value_minor: 1999,
      currency: 'USD',
      event_time: '2026-10-16T08:00:00.000Z',
      status: 'sent',
      skip_reason: null,
      attempts: 0,
      last_error: null,
      test_code: 'TEST1',
      sent_at: '2026-10-16T08:00:05.000Z',
    });
    expect(page1.events.map((e) => e.id)).toEqual(Array.from({ length: 50 }, (_, i) => 53 - i));
    expect(page1.next_before).toBe(4);
    const page2 = (await call('GET', `/v1/capi-events?app=starlyn&before=${page1.next_before}`)).json();
    expect([page2.events.map((e) => e.event_id), page2.next_before]).toEqual([['txn_02', 'txn_01', 'txn_00'], null]);
    const dead = (await call('GET', '/v1/capi-events?app=starlyn&status=dead')).json();
    expect(dead.events.map((e) => e.event_id)).toEqual(['txn_50', 'txn_40', 'txn_30', 'txn_20', 'txn_10', 'txn_00']);
    expect((await call('GET', '/v1/capi-events?app=chatchi')).json().events.map((e) => e.event_id)).toEqual(['txn_other']);
    // an event whose funnel is gone from the row: funnel null
    await q("UPDATE capi_events SET funnel_id = NULL WHERE event_id = 'txn_other'");
    expect((await call('GET', '/v1/capi-events?app=chatchi')).json().events[0].funnel).toBeNull();

    const none = await call('GET', '/v1/capi-events');
    expect([none.statusCode, none.json()]).toEqual([400, { error: 'app_required' }]);
    const ghost = await call('GET', '/v1/capi-events?app=ghost');
    expect([ghost.statusCode, ghost.json()]).toEqual([404, { error: 'app_not_found', detail: { app_id: 'ghost' } }]);
    expect((await call('GET', '/v1/capi-events?app=starlyn&status=nope')).statusCode).toBe(400);
  });

  it('POST /v1/capi-events/:id/resend: dead → pending (attempts 0, due now, last_error kept), audit capi.resend; other statuses 409; missing 404', async () => {
    const id = await event('txn_d', { status: 'dead', attempts: 6, lastError: 'http_500' });
    const sent = await event('txn_s', { status: 'sent' });
    const res = await call('POST', `/v1/capi-events/${id}/resend`);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ id, event_id: 'txn_d', status: 'pending', attempts: 0, last_error: 'http_500' });
    expect(await q('SELECT status, attempts, last_error, next_attempt_at <= now() AS due FROM capi_events WHERE id = $1', [id])).toEqual([
      { status: 'pending', attempts: 0, last_error: 'http_500', due: true },
    ]);
    expect(await auditRows()).toEqual([{ action: 'capi.resend', target: 'app:starlyn', details: { event_id: 'txn_d' }, app_id: 'starlyn' }]);
    for (const target of [id, sent]) {
      const again = await call('POST', `/v1/capi-events/${target}/resend`);
      expect([again.statusCode, again.json().error]).toEqual([409, 'not_dead']);
    }
    const missing = await call('POST', '/v1/capi-events/999/resend');
    expect([missing.statusCode, missing.json()]).toEqual([404, { error: 'capi_event_not_found' }]);
    expect((await call('POST', '/v1/capi-events/abc/resend')).statusCode).toBe(400);
    expect(await auditRows()).toHaveLength(1);
  });

  it('GET /v1/apps/:id/summary carries capi {configured, dead_24h}', async () => {
    await event('txn_d1', { status: 'dead' });
    await event('txn_d2', { status: 'dead' });
    await event('txn_d_old', { status: 'dead', age: '2 days' });
    await event('txn_c', { appId: 'chatchi', slug: 'chat', status: 'dead' });
    expect((await call('GET', '/v1/apps/starlyn/summary')).json().capi).toEqual({ configured: false, dead_24h: 2 });
    await call('PUT', '/v1/apps/starlyn/capi', { token: TOKEN });
    expect((await call('GET', '/v1/apps/starlyn/summary')).json().capi).toEqual({ configured: true, dead_24h: 2 });
    expect((await call('GET', '/v1/apps/chatchi/summary')).json().capi).toEqual({ configured: false, dead_24h: 1 });
  });
});
```

`services/core-api/test/scope-capi.test.js` (mới):

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp } from './helpers/app.js';
import { signIn } from './helpers/admin.js';
import { fakeSecrets } from './helpers/identity.js';
import { cachedTokenStore, memoryTokenStore } from '../src/conversions/store.js';

const APP = (id) =>
  `INSERT INTO apps (id, name, kind, adjust_tracker_url, deeplink_scheme, api_key_hash)
   VALUES ('${id}', '${id}', 'app', 'https://app.adjust.com/${id}', '${id}', 'h-${id}')`;
const TOKEN = 'EAAB_scope_secret_token_value_1234';

// Spec conversions-relay §4 "Routes" + ruling C5, per-app permissions of spec admin-console-p4b: a global admin, the
// admin of starlyn only and the viewer of starlyn only, two apps, × the 4 new routes. Out of scope: GET 404 with the
// body of a missing app, write 403. An event without an app (no_app) is global only.
describe('per-app scope on the CAPI routes (spec conversions-relay §4, ruling C5)', () => {
  let db;
  let app;
  let who;
  const ev = {};
  const q = async (sql, p) => (await db.pool.query(sql, p)).rows;
  const event = async (eventId, appId, slug, status) => {
    const [{ id: oid }] = await q(
      "INSERT INTO outbox (topic, aggregate_id, dedupe_key, payload) VALUES ('payment.succeeded', $1, $2, '{}') RETURNING id",
      [eventId, `payment.succeeded:${eventId}`],
    );
    const [{ id }] = await q(
      `INSERT INTO capi_events (outbox_id, event_id, app_id, funnel_id, pixel_id, value_minor, currency, event_time, status, skip_reason)
       VALUES ($1, $2, $3, (SELECT id FROM funnels WHERE slug = $4), '1234567', 1999, 'USD', now(), $5, $6) RETURNING id`,
      [oid, eventId, appId, slug, status, status === 'skipped' ? 'no_app' : null],
    );
    return Number(id);
  };

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    await q(APP('starlyn'));
    await q(APP('chatchi'));
    await q("INSERT INTO funnels (slug, created_by, app_id, pixel_id) VALUES ('star', 't', 'starlyn', '1234567'), ('chat', 't', 'chatchi', '7654321')");
    ev.star = await event('txn_star', 'starlyn', 'star', 'dead');
    ev.chat = await event('txn_chat', 'chatchi', 'chat', 'dead');
    ev.loose = await event('txn_loose', null, null, 'skipped');
    ({ app } = await makeApp(db.pool, { webhookSecrets: fakeSecrets(), capiTokens: cachedTokenStore(memoryTokenStore()) }));
    const g = await signIn(db.pool, 'g@ikameglobal.com', 'admin');
    const a = await signIn(db.pool, 'a@ikameglobal.com', null, { apps: [{ app_id: 'starlyn', role: 'admin' }] });
    const v = await signIn(db.pool, 'v@ikameglobal.com', null, { apps: [{ app_id: 'starlyn', role: 'viewer' }] });
    who = { g: g.headers, a: a.headers, v: v.headers };
  });
  afterEach(() => app.close());

  const call = (k, method, url, payload) => app.inject({ method, url, headers: who[k](method !== 'GET'), ...(payload !== undefined && { payload }) });
  // Status per caller in the order g, a, v.
  const codes = async (method, url, payload) => {
    const out = [];
    for (const k of ['g', 'a', 'v']) out.push((await call(k, method, url, payload)).statusCode);
    return out;
  };
  // A resend per caller on a freshly dead row (a successful resend makes it pending): order g, a, v.
  const resendCodes = async (id) => {
    const out = [];
    for (const k of ['g', 'a', 'v']) {
      await q("UPDATE capi_events SET status = 'dead' WHERE id = $1 AND status = 'pending'", [id]);
      out.push((await call(k, 'POST', `/v1/capi-events/${id}/resend`)).statusCode);
    }
    return out;
  };
  const NOT_FOUND = (id) => ({ error: 'app_not_found', detail: { app_id: id } });

  it('GET /v1/apps/:id/capi: viewer in the app; out of scope → the body of a missing app', async () => {
    expect(await codes('GET', '/v1/apps/starlyn/capi')).toEqual([200, 200, 200]);
    expect(await codes('GET', '/v1/apps/chatchi/capi')).toEqual([200, 404, 404]);
    for (const k of ['a', 'v']) expect((await call(k, 'GET', '/v1/apps/chatchi/capi')).json(), k).toEqual(NOT_FOUND('chatchi'));
    expect((await call('a', 'GET', '/v1/apps/ghost/capi')).json()).toEqual(NOT_FOUND('ghost'));
  });

  it('PUT /v1/apps/:id/capi: admin in the app (token and test_code); another app → 403', async () => {
    expect(await codes('PUT', '/v1/apps/starlyn/capi', { test_code: 'TEST1' })).toEqual([200, 200, 403]);
    expect(await codes('PUT', '/v1/apps/starlyn/capi', { token: TOKEN })).toEqual([200, 200, 403]);
    expect(await codes('PUT', '/v1/apps/chatchi/capi', { test_code: 'TEST1' })).toEqual([200, 403, 403]);
    expect(await codes('PUT', '/v1/apps/chatchi/capi', { token: null })).toEqual([200, 403, 403]);
    expect((await q("SELECT action, app_id FROM audit_log WHERE actor <> 'g@ikameglobal.com' ORDER BY id")).map((r) => [r.action, r.app_id])).toEqual([
      ['app.capi_test_code', 'starlyn'],
      ['app.capi_token', 'starlyn'],
    ]);
  });

  it('GET /v1/capi-events?app=: viewer in that app; out of scope → 404 app_not_found; no app → 400 for everyone', async () => {
    expect(await codes('GET', '/v1/capi-events?app=starlyn')).toEqual([200, 200, 200]);
    expect(await codes('GET', '/v1/capi-events?app=chatchi')).toEqual([200, 404, 404]);
    expect((await call('v', 'GET', '/v1/capi-events?app=chatchi')).json()).toEqual(NOT_FOUND('chatchi'));
    expect(await codes('GET', '/v1/capi-events')).toEqual([400, 400, 400]);
    for (const k of ['a', 'v']) {
      expect((await call(k, 'GET', '/v1/capi-events?app=starlyn')).json().events.map((e) => e.event_id), k).toEqual(['txn_star']);
    }
  });

  it('POST /v1/capi-events/:id/resend: admin in the event\'s app; another app or no app → 403; missing → 404 for everyone', async () => {
    expect(await resendCodes(ev.star)).toEqual([200, 200, 403]);
    expect(await resendCodes(ev.chat)).toEqual([200, 403, 403]);
    // no app: global only (the skipped row is not dead → 409 for the one caller who may act on it)
    expect(await codes('POST', `/v1/capi-events/${ev.loose}/resend`)).toEqual([409, 403, 403]);
    expect(await codes('POST', '/v1/capi-events/999/resend')).toEqual([404, 404, 404]);
  });

  it('GET /v1/apps/:id/summary carries capi for whoever sees the app', async () => {
    for (const k of ['g', 'a', 'v']) {
      expect((await call(k, 'GET', '/v1/apps/starlyn/summary')).json().capi, k).toEqual({ configured: false, dead_24h: 1 });
    }
    expect(await codes('GET', '/v1/apps/chatchi/summary')).toEqual([200, 404, 404]);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/core-api -- test/capi-http.test.js test/scope-capi.test.js
```

Expected: `Test Files  2 failed (2)`, `Tests  14 failed (14)`: cả 9 test của `capi-http.test.js` và 5 test của `scope-capi.test.js` fail vì các route `/v1/apps/:id/capi`, `/v1/capi-events`, `/v1/capi-events/:id/resend` chưa có (Fastify trả 404) và `/summary` chưa có `capi`.

- [ ] **Step 3: Implement**

`services/core-api/src/http/capi.js` (mới):

`services/core-api/src/http/capi.js` (mới):

```js
import { audit } from '../audit.js';
import { requireGrant } from '../auth.js';
import { appOfApp, appOfCapiEvent } from '../admin/resolve.js';
import { reviveNoToken } from '../conversions/relay.js';
import { HttpError } from '../errors.js';
import { withTx } from '../identity/link.js';
import { capiBody } from './schemas.js';

// Spec conversions-relay §4: a system-user token is 20–400 characters of [A-Za-z0-9_-]; the test code follows the
// apps_capi_test_code_check constraint of migration 009.
const TOKEN_RE = /^[A-Za-z0-9_-]{20,400}$/;
const TEST_CODE_RE = /^TEST[0-9A-Za-z]{1,20}$/;
const PAGE = 50;
const STATUSES = ['pending', 'sent', 'skipped', 'dead'];

const APP_ID = { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{1,30}$' };
const idParams = { type: 'object', required: ['id'], properties: { id: APP_ID } };
const iso = (d) => (d ? d.toISOString() : null);

// Out of scope a GET answers the body of a missing app (ruling B4, same as GET /v1/apps/:id).
const appNotFound = (id) => ({ error: 'app_not_found', detail: { app_id: id } });

// The body of GET /v1/apps/:id/capi (and of PUT): never the token, only its last 4 characters. counts_24h by
// created_at; pixel_funnels_without_token feeds the overview warning (0 once the app has a token). null = no app.
async function capiSettings(db, appId) {
  const { rows: [a] } = await db.query(
    `SELECT a.capi_token_last4, a.capi_token_set_at, a.capi_test_code,
            CASE WHEN a.capi_token_set_at IS NULL
                 THEN (SELECT count(*)::int FROM funnels f WHERE f.app_id = a.id AND f.pixel_id IS NOT NULL) ELSE 0 END AS waiting
       FROM apps a WHERE a.id = $1`,
    [appId],
  );
  if (!a) return null;
  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  const { rows } = await db.query(
    `SELECT status, count(*)::int AS n FROM capi_events
      WHERE app_id = $1 AND created_at > now() - interval '24 hours' GROUP BY status`,
    [appId],
  );
  for (const r of rows) counts[r.status] = r.n;
  return {
    token_last4: a.capi_token_last4,
    token_set_at: iso(a.capi_token_set_at),
    test_code: a.capi_test_code,
    counts_24h: counts,
    pixel_funnels_without_token: a.waiting,
  };
}

const EVENT_COLUMNS = `e.id, e.event_id, f.slug AS funnel, e.value_minor, e.currency, e.event_time, e.status, e.skip_reason,
  e.attempts, e.last_error, e.test_code, e.sent_at`;
const eventItem = (r) => ({
  id: Number(r.id),
  event_id: r.event_id,
  funnel: r.funnel,
  value_minor: Number(r.value_minor),
  currency: r.currency,
  event_time: iso(r.event_time),
  status: r.status,
  skip_reason: r.skip_reason,
  attempts: r.attempts,
  last_error: r.last_error,
  test_code: r.test_code,
  sent_at: iso(r.sent_at),
});

// Spec conversions-relay §4 "Routes", ruling C5: viewer in the app reads, admin in the app writes; the resend checks
// the event's own app. Out of scope a GET → 404 (same body as a missing app), a write → 403.
export default async function capiHttp(app, { pool, capiTokens }) {
  const inApp = (grant) => requireGrant(pool, grant, { app: (req, db) => appOfApp(db, req.params.id), notFound: (req) => appNotFound(req.params.id) });

  app.get('/v1/apps/:id/capi', { onRequest: inApp('viewer'), schema: { params: idParams } }, async (req) => {
    const out = await capiSettings(pool, req.params.id);
    if (!out) throw new HttpError(404, 'app_not_found', { app_id: req.params.id });
    return out;
  });

  app.put('/v1/apps/:id/capi', { onRequest: inApp('admin'), schema: { params: idParams, body: capiBody } }, async (req, reply) => {
    const appId = req.params.id;
    const { token, test_code: testCode } = req.body;
    // Fastify strips unknown keys before minProperties is seen, so {other: 1} arrives as {}: refuse it here too.
    if (token === undefined && testCode === undefined) throw new HttpError(400, 'bad_request');
    if ((await appOfApp(pool, appId)) === undefined) throw new HttpError(404, 'app_not_found', { app_id: appId });
    // Every check before Secrets Manager is touched: a refused body changes nothing.
    if (typeof token === 'string' && !TOKEN_RE.test(token)) throw new HttpError(400, 'invalid_token');
    if (typeof testCode === 'string' && !TEST_CODE_RE.test(testCode)) throw new HttpError(400, 'invalid_test_code');
    const tokenChange = token !== undefined;
    if (tokenChange && !capiTokens) throw new HttpError(503, 'capi_unavailable');
    // Secrets Manager first, then the row (spec §4): a failed put leaves the app as it was. capiTokens is the cached
    // store the relay reads, so this task's cache drops the old value at once. Clear = overwrite (ruling C1).
    if (tokenChange) await (token === null ? capiTokens.clear(appId) : capiTokens.put(appId, token));
    await withTx(pool, async (c) => {
      if (tokenChange && token !== null) {
        const last4 = token.slice(-4);
        await c.query('UPDATE apps SET capi_token_last4 = $2, capi_token_set_at = now() WHERE id = $1', [appId, last4]);
        // Spec §2 "When a token is entered": this app's no_token rows of the last 7 days go back to pending.
        await reviveNoToken(c, appId);
        await audit(c, req.actor, 'app.capi_token', `app:${appId}`, { action: 'set', last4 }, { app_id: appId });
      } else if (tokenChange) {
        await c.query('UPDATE apps SET capi_token_last4 = NULL, capi_token_set_at = NULL WHERE id = $1', [appId]);
        await audit(c, req.actor, 'app.capi_token', `app:${appId}`, { action: 'clear' }, { app_id: appId });
      }
      if (testCode !== undefined) {
        await c.query('UPDATE apps SET capi_test_code = $2 WHERE id = $1', [appId, testCode]);
        await audit(c, req.actor, 'app.capi_test_code', `app:${appId}`, { test_code: testCode }, { app_id: appId });
      }
    });
    reply.header('cache-control', 'no-store');
    return capiSettings(pool, appId);
  });

  app.get(
    '/v1/capi-events',
    {
      // No ?app= → the resolver has nothing to check and the handler answers 400 app_required (ruling C5).
      onRequest: requireGrant(pool, 'viewer', {
        app: async (req) => (typeof req.query?.app === 'string' && req.query.app ? req.query.app : undefined),
        notFound: (req) => appNotFound(req.query.app),
      }),
      schema: {
        querystring: {
          type: 'object',
          properties: {
            app: APP_ID,
            status: { type: 'string', enum: STATUSES },
            before: { type: 'integer', minimum: 1 },
          },
        },
      },
    },
    async (req) => {
      const { app: appId, status = null, before = null } = req.query;
      if (!appId) throw new HttpError(400, 'app_required');
      if ((await appOfApp(pool, appId)) === undefined) throw new HttpError(404, 'app_not_found', { app_id: appId });
      const { rows } = await pool.query(
        `SELECT ${EVENT_COLUMNS} FROM capi_events e LEFT JOIN funnels f ON f.id = e.funnel_id
          WHERE e.app_id = $1 AND ($2::text IS NULL OR e.status = $2) AND ($3::bigint IS NULL OR e.id < $3)
          ORDER BY e.id DESC LIMIT ${PAGE}`,
        [appId, status, before],
      );
      const events = rows.map(eventItem);
      return { events, next_before: events.length === PAGE ? events.at(-1).id : null };
    },
  );

  app.post(
    '/v1/capi-events/:id/resend',
    {
      onRequest: requireGrant(pool, 'admin', { app: (req, db) => appOfCapiEvent(db, req.params.id) }),
      schema: { params: { type: 'object', required: ['id'], properties: { id: { type: 'string', pattern: '^[0-9]{1,18}$' } } } },
    },
    // Only a dead row goes back to the queue (spec §4): attempts from 0, due now; last_error stays until the next
    // try so the console still shows why it died.
    async (req) =>
      withTx(pool, async (c) => {
        const { rows: [row] } = await c.query('SELECT id, event_id, app_id, status FROM capi_events WHERE id = $1 FOR UPDATE', [req.params.id]);
        if (!row) throw new HttpError(404, 'capi_event_not_found');
        if (row.status !== 'dead') throw new HttpError(409, 'not_dead');
        await c.query("UPDATE capi_events SET status = 'pending', attempts = 0, next_attempt_at = now() WHERE id = $1", [row.id]);
        await audit(c, req.actor, 'capi.resend', `app:${row.app_id}`, { event_id: row.event_id }, { app_id: row.app_id });
        const { rows: [out] } = await c.query(`SELECT ${EVENT_COLUMNS} FROM capi_events e LEFT JOIN funnels f ON f.id = e.funnel_id WHERE e.id = $1`, [row.id]);
        return eventItem(out);
      }),
  );
}
```

`services/core-api/src/http/schemas.js`, `services/core-api/src/admin/resolve.js`, `services/core-api/src/app.js`, `services/core-api/src/identity/app-summary.js` (sửa, áp dụng đúng diff này):

`services/core-api/src/http/schemas.js`, `services/core-api/src/admin/resolve.js`, `services/core-api/src/app.js`, `services/core-api/src/identity/app-summary.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/services/core-api/src/admin/resolve.js b/services/core-api/src/admin/resolve.js
index 3a5fec2..5a6355a 100644
--- a/services/core-api/src/admin/resolve.js
+++ b/services/core-api/src/admin/resolve.js
@@ -19,6 +19,11 @@ export const appOfGrant = async (db, grantId) =>
 
 export const appOfApp = (db, id) => one(db, 'SELECT id AS app_id FROM apps WHERE id = $1', id);
 
+// capi_events.id is a BIGSERIAL (spec conversions-relay §4 resend): anything but digits is no event, like appOfGrant.
+// app_id NULL (an event of a funnel without an app, skipped no_app) → null: global or default role only.
+export const appOfCapiEvent = async (db, eventId) =>
+  (/^\d{1,18}$/.test(String(eventId)) ? one(db, 'SELECT app_id FROM capi_events WHERE id = $1', String(eventId)) : undefined);
+
 // requireGrant notFound bodies (ruling B4): out of scope a GET answers exactly what the handler answers for a missing
 // funnel, so the two cannot be told apart.
 export const funnelNotFound = (req) => ({ error: 'funnel_not_found', detail: { funnel: req.params.slug } });
diff --git a/services/core-api/src/app.js b/services/core-api/src/app.js
index eeb9202..23fef45 100644
--- a/services/core-api/src/app.js
+++ b/services/core-api/src/app.js
@@ -20,6 +20,7 @@ import catalogHttp from './http/catalog.js';
 import usersHttp from './http/users.js';
 import customersHttp from './http/customers.js';
 import analyticsHttp from './http/analytics.js';
+import capiHttp from './http/capi.js';
 import { adminCors } from './admin/cors.js';
 
 export function buildApp({ checks = {}, timeoutMs = 1000, logger = false, deps } = {}) {
@@ -78,6 +79,8 @@ export function buildApp({ checks = {}, timeoutMs = 1000, logger = false, deps }
   if (deps?.pool && deps?.claimKey) app.register(claimHttp, deps);
   if (deps?.pool && deps?.claimKey) app.register(sdkHttp, deps);
   if (deps?.pool && deps?.clickhouse) app.register(analyticsHttp, deps);
+  // Ruling C8: always registered; without deps.capiTokens a token change answers 503 capi_unavailable.
+  if (deps?.pool) app.register(capiHttp, deps);
   if (deps?.pool && deps?.admin) app.register(authHttp, deps);
   if (deps?.pool && deps?.admin?.google && !deps.admin.localUser) app.register(googleHttp, deps);
 
diff --git a/services/core-api/src/http/schemas.js b/services/core-api/src/http/schemas.js
index ea0e037..cb1a011 100644
--- a/services/core-api/src/http/schemas.js
+++ b/services/core-api/src/http/schemas.js
@@ -7,3 +7,15 @@ export const hostParams = {
 };
 
 export const prefixSchema = { type: 'string', minLength: 1, maxLength: 200 };
+
+// Spec conversions-relay §4: PUT /v1/apps/:id/capi. Only the types here; the token and test code patterns are
+// checked by the handler so a bad value answers invalid_token / invalid_test_code instead of bad_request.
+export const capiBody = {
+  type: 'object',
+  additionalProperties: false,
+  minProperties: 1,
+  properties: {
+    token: { type: ['string', 'null'] },
+    test_code: { type: ['string', 'null'] },
+  },
+};
diff --git a/services/core-api/src/identity/app-summary.js b/services/core-api/src/identity/app-summary.js
index a40f502..03bffba 100644
--- a/services/core-api/src/identity/app-summary.js
+++ b/services/core-api/src/identity/app-summary.js
@@ -11,7 +11,7 @@ async function appOr404(pool, id) {
   return app;
 }
 
-// {app, funnels, domains}: the app's own funnels and domains. listDomains({app}) also returns the shared hosts
+// {app, funnels, domains, capi}: the app's own funnels and domains. listDomains({app}) also returns the shared hosts
 // (every app can publish there); the overview shows only the app's own, so they are filtered out here.
 export async function appSummary(pool, id) {
   const app = await appOr404(pool, id);
@@ -21,9 +21,23 @@ export async function appSummary(pool, id) {
     app,
     funnels: funnels.map(({ slug, latest_v, live, pixel_id, updated_at }) => ({ slug, latest_v, live, pixel_id, updated_at })),
     domains: domains.map(({ host, status, routes }) => ({ host, status, routes })),
+    capi: await capiStatus(pool, id),
   };
 }
 
+// Spec conversions-relay §4: the overview warns when the app has no CAPI token or events went dead in 24h
+// (by created_at, like counts_24h of GET /v1/apps/:id/capi).
+async function capiStatus(pool, id) {
+  const { rows: [r] } = await pool.query(
+    `SELECT a.capi_token_set_at IS NOT NULL AS configured,
+            (SELECT count(*)::int FROM capi_events e
+              WHERE e.app_id = a.id AND e.status = 'dead' AND e.created_at > now() - interval '24 hours') AS dead_24h
+       FROM apps a WHERE a.id = $1`,
+    [id],
+  );
+  return { configured: r.configured, dead_24h: r.dead_24h };
+}
+
 // {plans: [{slug, plan, price_id, discount_id, entitlement_key, unmapped, in_html}]}, sorted by slug then plan:
 // per funnel, the union of its prices and the plan keys of its latest version, merged as the Prices tab does
 // (listFunnelPrices). unmapped = a plan key in the HTML with no price; in_html = the plan key is in the latest
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/core-api -- test/capi-http.test.js test/scope-capi.test.js test/apps-read.test.js test/scope-routes-a.test.js
npm test -w @ikf/core-api 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Test Files  4 passed (4)`, `Tests  45 passed (45)` (9 capi-http + 5 scope-capi + các test `/summary` cũ vẫn xanh); toàn bộ core-api: `Test Files  81 passed (81)`, `Tests  781 passed (781)`

- [ ] **Step 5: Commit**

```bash
git add services/core-api/src/http/capi.js services/core-api/src/http/schemas.js services/core-api/src/admin/resolve.js services/core-api/src/app.js services/core-api/src/identity/app-summary.js services/core-api/test/capi-http.test.js services/core-api/test/scope-capi.test.js
git commit -m "feat(core-api): CAPI settings per app, conversions list and resend API"
```

---

---

### Task 7: CLI `ikf capi`

**Files:**
- Modify: `packages/cli/src/api.js` (thêm `getCapi`, `setCapi`, `listCapiEvents`, `resendCapiEvent`), `packages/cli/src/main.js` (lệnh `capi`, thông báo lỗi, help)
- Test: `packages/cli/test/capi.test.js` (mới)

**Interfaces:**
- Consumes: routes của Task 6: `GET|PUT /v1/apps/:id/capi`, `GET /v1/capi-events?app=&status=&before=`, `POST /v1/capi-events/:id/resend`; mã lỗi `invalid_token`, `invalid_test_code`, `not_dead`, `capi_unavailable`, `app_required`, `app_not_found`, `capi_event_not_found`.
- Produces:
  - `createApi`: `getCapi(app)`, `setCapi(app, body)` (PUT, retry vì idempotent; token chỉ nằm trong body), `listCapiEvents({app, status, before})`, `resendCapiEvent(id)` (không retry: gửi lại lần hai sẽ ra 409 `not_dead`).
  - Lệnh: `ikf capi status --app <id>`, `ikf capi token set <app>` (token đọc từ stdin, trim; stdin là TTY → lỗi `Pipe the token on stdin: echo "$TOKEN" | ikf capi token set <app>`, exit 1; token không bao giờ được in), `ikf capi token clear <app>` (`{token: null}`), `ikf capi test-code <app> <code|off>` (`off` → `{test_code: null}`), `ikf capi resend <id>`.
  - `deps.stdin = {isTTY, text()}` để test tiêm stdin; mặc định là `process.stdin`.
  - `formatApiError` có câu đọc được cho `invalid_token`, `invalid_test_code`, `not_dead`, `capi_event_not_found`, `capi_unavailable`, `app_required` (lệnh `capi`).

- [ ] **Step 1: Viết test fail**

`packages/cli/test/capi.test.js` (mới):

`packages/cli/test/capi.test.js` (mới):

```js
import { describe, it, expect } from 'vitest';
import { run } from '../src/main.js';
import { ApiError, createApi } from '../src/api.js';
import { io } from './helpers/io.js';

const TOKEN = 'EAAGm0PX4ZCpsBAxyz1234567890abcd';
const settings = (o = {}) => ({
  token_last4: 'abcd', token_set_at: '2026-10-16T08:00:00.000Z', test_code: 'TEST123',
  counts_24h: { pending: 1, sent: 5, skipped: 2, dead: 3 }, pixel_funnels_without_token: 0, ...o,
});
const ev = (o = {}) => ({
  id: 41, event_id: '01JA0000000000000000000001', funnel: 'moon-reading', value_minor: 999, currency: 'USD', event_time: '2026-10-16T07:00:00.000Z',
  status: 'dead', skip_reason: null, attempts: 6, last_error: 'meta_190', test_code: null, sent_at: null, ...o,
});
const fail = (status, body) => async () => { throw new ApiError(status, body); };
const stdin = (text, isTTY = false) => ({ isTTY, text: async () => text });
const withStdin = (t, s) => { t.opts.deps.stdin = s; return t; };

// Spec conversions-relay §4 "CLI": ikf capi status | token set|clear | test-code | resend.
describe('ikf capi status --app <id>', () => {
  it('prints the token state, test code, 24h counts and the dead rows (max 10)', async () => {
    const calls = [];
    const dead = Array.from({ length: 12 }, (_, i) => ev({ id: 50 - i, event_id: `01JA00000000000000000000${String(i).padStart(2, '0')}`, last_error: i === 0 ? 'meta_190' : 'http_500' }));
    const t = io({
      getCapi: async (app) => { calls.push(['get', app]); return settings(); },
      listCapiEvents: async (q) => { calls.push(['list', q]); return { events: dead, next_before: null }; },
    });
    expect(await run(['capi', 'status', '--app', 'starlyn'], t.opts)).toBe(0);
    expect(calls).toEqual([['get', 'starlyn'], ['list', { app: 'starlyn', status: 'dead' }]]);
    expect(t.lines.slice(0, 4)).toEqual([
      'token: ••••abcd (set 2026-10-16T08:00:00.000Z)',
      'test code: TEST123',
      '24h: sent 5, pending 1, skipped 2, dead 3',
      'dead (mới nhất, tối đa 10):',
    ]);
    expect(t.lines).toHaveLength(4 + 10);
    expect(t.lines[4]).toBe('  50  01JA0000000000000000000000  moon-reading  meta_190');
    expect(t.lines[5]).toBe('  49  01JA0000000000000000000001  moon-reading  http_500');
  });

  it('no token, no test code, no dead rows; warns when pixel funnels wait for a token', async () => {
    const t = io({
      getCapi: async () => settings({ token_last4: null, token_set_at: null, test_code: null, pixel_funnels_without_token: 2, counts_24h: { pending: 0, sent: 0, skipped: 0, dead: 0 } }),
      listCapiEvents: async () => ({ events: [], next_before: null }),
    });
    expect(await run(['capi', 'status', '--app', 'starlyn'], t.opts)).toBe(0);
    expect(t.lines).toEqual([
      'token: none',
      'test code: none',
      '24h: sent 0, pending 0, skipped 0, dead 0',
      'CẢNH BÁO: 2 funnel có pixel nhưng app chưa có token: Purchase chưa gửi lên Meta (ikf capi token set starlyn).',
      '(không có sự kiện dead)',
    ]);
  });

  it('a funnel-less event shows "-"', async () => {
    const t = io({ getCapi: async () => settings(), listCapiEvents: async () => ({ events: [ev({ funnel: null })], next_before: null }) });
    expect(await run(['capi', 'status', '--app', 'starlyn'], t.opts)).toBe(0);
    expect(t.lines.at(-1)).toBe('  41  01JA0000000000000000000001  -  meta_190');
  });

  it.each([
    [['capi', 'status'], 'cần --app <id>'],
    [['capi', 'status', '--app', 'Bad_App'], 'app id không hợp lệ: "Bad_App"'],
  ])('exits 2 on bad usage %j', async (argv, msg) => {
    const t = io({ getCapi: async () => { throw new Error('must not be called'); } });
    expect(await run(argv, t.opts)).toBe(2);
    expect(t.errors).toEqual([msg]);
  });
});

describe('ikf capi token set | clear', () => {
  it('set <app> reads the token from stdin (trimmed), sends it and never prints it', async () => {
    const calls = [];
    const t = withStdin(io({ setCapi: async (app, b) => { calls.push([app, b]); return settings(); } }), stdin(`${TOKEN}\n`));
    expect(await run(['capi', 'token', 'set', 'starlyn'], t.opts)).toBe(0);
    expect(calls).toEqual([['starlyn', { token: TOKEN }]]);
    expect(t.lines).toEqual(['starlyn: token đã lưu (••••abcd).']);
    expect(JSON.stringify([t.lines, t.errors])).not.toContain(TOKEN);
  });

  it('set with a TTY stdin: tells to pipe, exit 1, calls nothing', async () => {
    const t = withStdin(io({ setCapi: async () => { throw new Error('must not be called'); } }), stdin('', true));
    expect(await run(['capi', 'token', 'set', 'starlyn'], t.opts)).toBe(1);
    expect(t.errors).toEqual(['Pipe the token on stdin: echo "$TOKEN" | ikf capi token set starlyn']);
    expect(t.lines).toEqual([]);
  });

  it('set with an empty stdin exits 2', async () => {
    const t = withStdin(io({ setCapi: async () => { throw new Error('must not be called'); } }), stdin('  \n'));
    expect(await run(['capi', 'token', 'set', 'starlyn'], t.opts)).toBe(2);
    expect(t.errors).toEqual(['stdin không có token']);
  });

  it('a refused token is a sentence and the token is still not echoed', async () => {
    const t = withStdin(io({ setCapi: fail(400, { error: 'invalid_token' }) }), stdin(TOKEN));
    expect(await run(['capi', 'token', 'set', 'starlyn'], t.opts)).toBe(1);
    expect(t.errors).toEqual(['Token không hợp lệ: system-user token Meta gồm 20-400 ký tự a-z, A-Z, 0-9, _ hoặc -.']);
    expect(JSON.stringify([t.lines, t.errors])).not.toContain(TOKEN);
  });

  it('clear <app> sends token null', async () => {
    const calls = [];
    const t = io({ setCapi: async (app, b) => { calls.push([app, b]); return settings({ token_last4: null, token_set_at: null }); } });
    expect(await run(['capi', 'token', 'clear', 'starlyn'], t.opts)).toBe(0);
    expect(calls).toEqual([['starlyn', { token: null }]]);
    expect(t.lines).toEqual(['starlyn: đã xoá token (Purchase của app này sẽ bỏ qua với no_token).']);
  });

  it.each([
    [['capi', 'token', 'set'], 'cách dùng: ikf capi token set|clear <app>'],
    [['capi', 'token', 'rotate', 'starlyn'], 'cách dùng: ikf capi token set|clear <app>'],
    [['capi', 'token', 'clear', 'Bad_App'], 'app id không hợp lệ: "Bad_App"'],
  ])('exits 2 on bad usage %j', async (argv, msg) => {
    const t = io({ setCapi: async () => { throw new Error('must not be called'); } });
    expect(await run(argv, t.opts)).toBe(2);
    expect(t.errors).toEqual([msg]);
  });
});

describe('ikf capi test-code <app> <code|off>', () => {
  it('sets a code', async () => {
    const calls = [];
    const t = io({ setCapi: async (app, b) => { calls.push([app, b]); return settings({ test_code: 'TEST99' }); } });
    expect(await run(['capi', 'test-code', 'starlyn', 'TEST99'], t.opts)).toBe(0);
    expect(calls).toEqual([['starlyn', { test_code: 'TEST99' }]]);
    expect(t.lines).toEqual(['starlyn: test code TEST99 (Purchase mới gửi vào Test Events của Meta, chưa tính vào quảng cáo).']);
  });

  it('off sends null', async () => {
    const calls = [];
    const t = io({ setCapi: async (app, b) => { calls.push([app, b]); return settings({ test_code: null }); } });
    expect(await run(['capi', 'test-code', 'starlyn', 'off'], t.opts)).toBe(0);
    expect(calls).toEqual([['starlyn', { test_code: null }]]);
    expect(t.lines).toEqual(['starlyn: đã tắt test code.']);
  });

  it('a refused code is a sentence', async () => {
    const t = io({ setCapi: fail(400, { error: 'invalid_test_code' }) });
    expect(await run(['capi', 'test-code', 'starlyn', 'nope'], t.opts)).toBe(1);
    expect(t.errors).toEqual(['Test code không hợp lệ: dạng TEST + tối đa 20 chữ/số (lấy ở Events Manager > Test Events), hoặc "off".']);
  });

  it('missing arguments exit 2', async () => {
    const t = io();
    expect(await run(['capi', 'test-code', 'starlyn'], t.opts)).toBe(2);
    expect(t.errors).toEqual(['cách dùng: ikf capi test-code <app> <code|off>']);
  });
});

describe('ikf capi resend <id>', () => {
  it('requeues a dead event', async () => {
    const calls = [];
    const t = io({ resendCapiEvent: async (id) => { calls.push(id); return ev({ status: 'pending', attempts: 0 }); } });
    expect(await run(['capi', 'resend', '41'], t.opts)).toBe(0);
    expect(calls).toEqual(['41']);
    expect(t.lines).toEqual(['41: đã xếp hàng gửi lại (event 01JA0000000000000000000001), gửi trong vài giây.']);
  });

  it('a non-numeric id exits 2', async () => {
    const t = io();
    expect(await run(['capi', 'resend', 'abc'], t.opts)).toBe(2);
    expect(t.errors).toEqual(['id sự kiện phải là số nguyên dương: "abc"']);
  });

  it('not_dead is a sentence', async () => {
    const t = io({ resendCapiEvent: fail(409, { error: 'not_dead' }) });
    expect(await run(['capi', 'resend', '41'], t.opts)).toBe(1);
    expect(t.errors).toEqual(['Chỉ gửi lại được sự kiện dead (sự kiện này đang pending, đã gửi hoặc đã bỏ qua).']);
  });
});

describe('capi error messages', () => {
  it.each([
    [503, 'capi_unavailable', 'Server chưa cấu hình kho secret cho token CAPI (503 capi_unavailable): liên hệ người vận hành.'],
    [400, 'app_required', 'Cần chỉ định app: --app <id>.'],
    [403, 'forbidden', 'Bạn không có quyền với thao tác này.'],
    [404, 'not_found', 'Không tìm thấy (hoặc bạn không có quyền).'],
  ])('%i %s', async (status, code, msg) => {
    const t = io({ getCapi: fail(status, { error: code }) });
    expect(await run(['capi', 'status', '--app', 'starlyn'], t.opts)).toBe(1);
    expect(t.errors).toEqual([msg]);
  });

  it('app_not_found names the app', async () => {
    const t = io({ getCapi: fail(404, { error: 'app_not_found', detail: { app_id: 'ghost' } }) });
    expect(await run(['capi', 'status', '--app', 'ghost'], t.opts)).toBe(1);
    expect(t.errors).toEqual(['Không có app "ghost" (xem: ikf app ls)']);
  });

  it('capi_event_not_found on resend', async () => {
    const t = io({ resendCapiEvent: fail(404, { error: 'capi_event_not_found' }) });
    expect(await run(['capi', 'resend', '9'], t.opts)).toBe(1);
    expect(t.errors).toEqual(['Không có sự kiện CAPI này.']);
  });
});

describe('api client: capi methods', () => {
  function harness(body = {}) {
    const calls = [];
    const fetch = async (url, init) => { calls.push({ url, init }); return new Response(JSON.stringify(body), { status: 200 }); };
    return { calls, api: createApi({ api: 'https://api.x/', token: 'ikf_t' }, { fetch, sleep: async () => {} }) };
  }

  it('getCapi GET /v1/apps/:id/capi', async () => {
    const { api, calls } = harness(settings());
    expect(await api.getCapi('starlyn')).toEqual(settings());
    expect([calls[0].url, calls[0].init.method]).toEqual(['https://api.x/v1/apps/starlyn/capi', 'GET']);
  });

  it('setCapi PUT with a JSON body', async () => {
    const { api, calls } = harness(settings());
    await api.setCapi('starlyn', { token: TOKEN });
    expect([calls[0].url, calls[0].init.method]).toEqual(['https://api.x/v1/apps/starlyn/capi', 'PUT']);
    expect(JSON.parse(calls[0].init.body)).toEqual({ token: TOKEN });
  });

  it('listCapiEvents puts app, status and before in the query', async () => {
    const { api, calls } = harness({ events: [], next_before: null });
    await api.listCapiEvents({ app: 'starlyn', status: 'dead', before: 40 });
    expect(calls[0].url).toBe('https://api.x/v1/capi-events?app=starlyn&status=dead&before=40');
  });

  it('resendCapiEvent POST /v1/capi-events/:id/resend', async () => {
    const { api, calls } = harness(ev());
    await api.resendCapiEvent('41');
    expect([calls[0].url, calls[0].init.method]).toEqual(['https://api.x/v1/capi-events/41/resend', 'POST']);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/cli -- test/capi.test.js
```

Expected: `Test Files  1 failed (1)`, `Tests  30 failed (30)`: mọi test fail vì `capi` chưa là lệnh (CLI in usage, exit 2) và `createApi` chưa có bốn method.

- [ ] **Step 3: Implement**

`packages/cli/src/api.js`, `packages/cli/src/main.js` (sửa, áp dụng đúng diff này):

`packages/cli/src/api.js`, `packages/cli/src/main.js` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/packages/cli/src/api.js b/packages/cli/src/api.js
index 488d0e3..a2dd43e 100644
--- a/packages/cli/src/api.js
+++ b/packages/cli/src/api.js
@@ -104,6 +104,16 @@ export function createApi({ api, token }, { fetch: doFetch = fetch, retries = 3,
       return call('GET', `/v1/analytics/overview${qs ? `?${qs}` : ''}`, { retry: true });
     },
     listAdminUsers: () => call('GET', '/v1/admin/users', { retry: true }),
+    // Spec conversions-relay §4 "Routes". The token only ever travels in a PUT body, never in a URL.
+    getCapi: (app) => call('GET', `/v1/apps/${q(app)}/capi`, { retry: true }),
+    // Idempotent: the same token or test code twice gives the same result.
+    setCapi: (app, body) => call('PUT', `/v1/apps/${q(app)}/capi`, { body, retry: true }),
+    listCapiEvents: ({ app, status, before } = {}) => {
+      const qs = new URLSearchParams({ ...(app && { app }), ...(status && { status }), ...(before && { before: String(before) }) }).toString();
+      return call('GET', `/v1/capi-events${qs ? `?${qs}` : ''}`, { retry: true });
+    },
+    // Not retried: a lost reply would turn the retry into 409 not_dead (the first call already requeued it).
+    resendCapiEvent: (id) => call('POST', `/v1/capi-events/${q(id)}/resend`, { retry: false }),
     // Not retried: a lost reply would turn the retry into 409 user_exists.
     createAdminUser: (body) => call('POST', '/v1/admin/users', { body, retry: false }),
     // Idempotent: the same change twice gives the same result.
diff --git a/packages/cli/src/main.js b/packages/cli/src/main.js
index 8139468..2cc95e2 100755
--- a/packages/cli/src/main.js
+++ b/packages/cli/src/main.js
@@ -47,6 +47,11 @@ const USAGE = `Cách dùng:
   ikf admin global <email> on|off   (global admin: mọi app, Users, Billing, token)
   ikf admin disable <email>   (khoá ngay, mọi phiên đăng nhập kết thúc)
   ikf token create <name> --roles publisher[,router] [--app <id>]   (token chỉ hiện một lần; --app: chỉ dùng trong app đó)
+  ikf capi status --app <id>   (token Meta CAPI: ••••4 ký tự cuối, test code, số sự kiện 24h, tối đa 10 sự kiện dead gần nhất)
+  ikf capi token set <app>   (đọc token từ stdin: echo "$TOKEN" | ikf capi token set <app>; token không bao giờ được in ra)
+  ikf capi token clear <app>   (xoá token: Purchase của app này bỏ qua với no_token)
+  ikf capi test-code <app> <TEST…|off>   (Purchase mới gửi vào Test Events của Meta; off để tắt)
+  ikf capi resend <id>   (đưa một sự kiện dead về hàng đợi; id lấy từ ikf capi status)
   ikf events replay-dlq --env <staging|prod>   (cần CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN)
   ikf stats <slug> [--days 7] [--by hour|day]   (số liệu funnel: mốc, bậc thang screen, doanh thu; giờ UTC; --by hour tối đa 14 ngày)
   ikf stats --app <id> [--days 7]   (mỗi funnel của app một dòng + dòng Tổng)`;
@@ -601,6 +606,7 @@ export function formatApiError(e, cmd, typedApp) {
   // Spec admin-console-p4b decision #4: a token bound to an app holds only publisher/router.
   if (e.code === 'invalid_roles' && cmd === 'token' && typedApp) return 'Token theo app chỉ nhận role publisher, router.';
   // Spec admin-console-p4a §2: an upload of a new slug needs an app; a funnel is never moved back to no app.
+  if (e.code === 'app_required' && cmd === 'capi') return 'Cần chỉ định app: --app <id>.';
   if (e.code === 'app_required') {
     return cmd === 'publish' ? 'Funnel mới cần --app <id>' : 'Funnel phải thuộc một app, không gỡ được (đổi app: ikf funnel set <slug> --app <id>)';
   }
@@ -644,6 +650,12 @@ export function formatApiError(e, cmd, typedApp) {
   if (e.code === 'key_rotation_pending') {
     return `Key trước vẫn còn hiệu lực tới ${e.detail?.prev_key_expires_at}. Xoay tiếp bây giờ sẽ khoá key đó NGAY: chỉ chạy lại với --force khi chắc backend đã dùng key mới nhất.`;
   }
+  // Spec conversions-relay §4: the CAPI codes read as sentences. Neither names the token or the test code typed.
+  if (e.code === 'invalid_token') return 'Token không hợp lệ: system-user token Meta gồm 20-400 ký tự a-z, A-Z, 0-9, _ hoặc -.';
+  if (e.code === 'invalid_test_code') return 'Test code không hợp lệ: dạng TEST + tối đa 20 chữ/số (lấy ở Events Manager > Test Events), hoặc "off".';
+  if (e.code === 'not_dead') return 'Chỉ gửi lại được sự kiện dead (sự kiện này đang pending, đã gửi hoặc đã bỏ qua).';
+  if (e.code === 'capi_event_not_found') return 'Không có sự kiện CAPI này.';
+  if (e.code === 'capi_unavailable') return 'Server chưa cấu hình kho secret cho token CAPI (503 capi_unavailable): liên hệ người vận hành.';
   const lines = [`Lỗi ${e.status || ''} ${e.code}`.replace('  ', ' ')];
   const details = Array.isArray(e.detail) ? e.detail : e.detail === undefined ? [] : [e.detail];
   for (const d of details) {
@@ -653,6 +665,85 @@ export function formatApiError(e, cmd, typedApp) {
   return lines.join('\n');
 }
 
+// Spec conversions-relay §4 "CLI". The token is read from stdin only (a flag would land in shell history and ps),
+// and no message below ever carries it.
+async function readStdin() {
+  const chunks = [];
+  for await (const c of process.stdin) chunks.push(c);
+  return Buffer.concat(chunks).toString('utf8');
+}
+
+const capiAppId = (id) => {
+  if (!APP_ID_RE.test(id)) throw new UsageError(`app id không hợp lệ: "${id}"`);
+  return id;
+};
+
+async function capiStatus(api, values, out) {
+  if (values.app === undefined) throw new UsageError('cần --app <id>');
+  const app = capiAppId(values.app);
+  const s = await api.getCapi(app);
+  const { events } = await api.listCapiEvents({ app, status: 'dead' });
+  const c = s.counts_24h;
+  out(s.token_last4 ? `token: ••••${s.token_last4} (set ${s.token_set_at})` : 'token: none');
+  out(`test code: ${s.test_code ?? 'none'}`);
+  out(`24h: sent ${c.sent}, pending ${c.pending}, skipped ${c.skipped}, dead ${c.dead}`);
+  if (s.pixel_funnels_without_token > 0) {
+    out(`CẢNH BÁO: ${s.pixel_funnels_without_token} funnel có pixel nhưng app chưa có token: Purchase chưa gửi lên Meta (ikf capi token set ${app}).`);
+  }
+  if (!events.length) {
+    out('(không có sự kiện dead)');
+    return 0;
+  }
+  out('dead (mới nhất, tối đa 10):');
+  for (const e of events.slice(0, 10)) out(`  ${e.id}  ${e.event_id}  ${e.funnel ?? '-'}  ${e.last_error ?? ''}`.trimEnd());
+  return 0;
+}
+
+async function capiToken(api, args, out, err, stdin) {
+  const [action, id] = args;
+  if (!['set', 'clear'].includes(action) || !id) throw new UsageError('cách dùng: ikf capi token set|clear <app>');
+  const app = capiAppId(id);
+  if (action === 'clear') {
+    await api.setCapi(app, { token: null });
+    out(`${app}: đã xoá token (Purchase của app này sẽ bỏ qua với no_token).`);
+    return 0;
+  }
+  if (stdin.isTTY) {
+    err(`Pipe the token on stdin: echo "$TOKEN" | ikf capi token set ${app}`);
+    return 1;
+  }
+  const token = (await stdin.text()).trim();
+  if (!token) throw new UsageError('stdin không có token');
+  const s = await api.setCapi(app, { token });
+  out(`${app}: token đã lưu (••••${s.token_last4}).`);
+  return 0;
+}
+
+async function capiTestCode(api, args, out) {
+  const [id, code] = args;
+  if (!id || !code) throw new UsageError('cách dùng: ikf capi test-code <app> <code|off>');
+  const app = capiAppId(id);
+  const s = await api.setCapi(app, { test_code: code === 'off' ? null : code });
+  out(s.test_code
+    ? `${app}: test code ${s.test_code} (Purchase mới gửi vào Test Events của Meta, chưa tính vào quảng cáo).`
+    : `${app}: đã tắt test code.`);
+  return 0;
+}
+
+async function capiCommand(api, sub, args, values, out, err, stdin) {
+  if (sub === 'status') return capiStatus(api, values, out);
+  if (sub === 'token') return capiToken(api, args, out, err, stdin);
+  if (sub === 'test-code') return capiTestCode(api, args, out);
+  if (sub === 'resend') {
+    if (!args[0]) throw new UsageError('cách dùng: ikf capi resend <id>');
+    if (!/^[1-9][0-9]{0,17}$/.test(args[0])) throw new UsageError(`id sự kiện phải là số nguyên dương: "${args[0]}"`);
+    const r = await api.resendCapiEvent(args[0]);
+    out(`${r.id}: đã xếp hàng gửi lại (event ${r.event_id}), gửi trong vài giây.`);
+    return 0;
+  }
+  throw new UsageError(USAGE);
+}
+
 async function eventsCommand(sub, values, out, env, deps) {
   if (sub !== 'replay-dlq') throw new UsageError(USAGE);
   if (!['staging', 'prod'].includes(values.env)) throw new UsageError('cần --env staging hoặc --env prod');
@@ -766,7 +857,7 @@ export async function run(argv, { out = console.log, err = console.error, env =
       out('Đã lưu thông tin đăng nhập.');
       return 0;
     }
-    if (!['route', 'publish', 'funnel', 'domain', 'events', 'billing', 'app', 'customer', 'admin', 'stats', 'token'].includes(cmd)) throw new UsageError(USAGE);
+    if (!['route', 'publish', 'funnel', 'domain', 'events', 'billing', 'app', 'customer', 'admin', 'stats', 'token', 'capi'].includes(cmd)) throw new UsageError(USAGE);
     if (cmd === 'events') return await eventsCommand(sub, values, out, env, deps);
     if (cmd === 'publish' && (!sub || !values.slug)) throw new UsageError('cách dùng: ikf publish <folder> --slug <slug> [--app <id>]');
     const api = deps.api ?? createApi(await loadCredentials(env));
@@ -782,6 +873,9 @@ export async function run(argv, { out = console.log, err = console.error, env =
     if (cmd === 'admin') return await adminCommand(api, sub, rest, values, out, err);
     if (cmd === 'stats') return await statsCommand(api, sub, values, out, deps.now ?? Date.now);
     if (cmd === 'token') return await tokenCommand(api, sub, rest, values, out);
+    if (cmd === 'capi') {
+      return await capiCommand(api, sub, rest, values, out, err, deps.stdin ?? { isTTY: Boolean(process.stdin.isTTY), text: readStdin });
+    }
     return await routeCommand(api, sub, rest, values, out);
   } catch (e) {
     if (e instanceof UsageError) {
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/cli -- test/capi.test.js
npm test -w @ikf/cli 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  30 passed (30)`; toàn bộ CLI `Test Files  25 passed (25)`, `Tests  274 passed (274)`.

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/api.js packages/cli/src/main.js packages/cli/test/capi.test.js
git commit -m "feat(cli): ikf capi status, token, test-code and resend"
```

---

---

### Task 8: SPA — Cài đặt Meta CAPI, trang Conversions, cảnh báo ở Tổng quan

**Files:**
- Create: `apps/admin/src/components/CapiSettings.jsx`, `apps/admin/src/pages/AppConversions.jsx`, `apps/admin/test/capi-settings.test.jsx`, `apps/admin/test/conversions.test.jsx`
- Modify: `apps/admin/src/api.js`, `src/App.jsx`, `src/Layout.jsx`, `src/icons.jsx`, `src/pages/AppSettings.jsx`, `src/pages/AppOverview.jsx`, `test/helpers.jsx`
- Test (sửa vì menu app có thêm mục): `apps/admin/test/grants.test.jsx`, `layout-app.test.jsx`, `scope-ui.test.jsx`

**Interfaces:**
- Consumes: `GET/PUT /v1/apps/:id/capi`, `GET /v1/capi-events?app=&status=&before=`, `POST /v1/capi-events/:id/resend`, `summary.capi {configured, dead_24h}` (Task 5/6); `canIn`, `RoleButton`, `useApp`, `AppNotFound` (đợt 4a/4b).
- Produces: client `getCapi(id)`, `setCapi(id, body)`, `listCapiEvents({app, status, before})`, `resendCapiEvent(id)`; mục menu "Conversions" (grant `viewer`) tới `/apps/:id/conversions`; `data-testid` `capi-settings`, `capi-token-input`, `capi-events`, `capi-row`, `capi-resend`, `capi-warning`, `capi-counts`.

Ghi chú thiết kế: trang Cài đặt app chưa có tab, nên "Meta CAPI" là một card riêng ngay trên form sửa app. Người xem Cài đặt cần grant `apps:read` (editor trở lên), nên "read-only" thực tế là editor/support-không-vào-được; viewer không mở được trang này. Token chỉ nằm trong state của ô nhập và bị xoá sau khi lưu thành công; không bao giờ render lại.

- [ ] **Step 1: Viết test fail**

`apps/admin/test/capi-settings.test.jsx`, `apps/admin/test/conversions.test.jsx` (mới):

`apps/admin/test/capi-settings.test.jsx` (mới):

```jsx
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { ApiError } from '../src/api.js';
import { renderApp, ME } from './helpers.jsx';
import { appsClient as client } from './apps-fixtures.js';

const TOKEN = `EAAB${'x'.repeat(40)}wxyz`;
const COUNTS = { pending: 0, sent: 0, skipped: 0, dead: 0 };
const NONE = { token_last4: null, token_set_at: null, test_code: null, counts_24h: COUNTS, pixel_funnels_without_token: 0 };
const SET = { ...NONE, token_last4: 'abcd', token_set_at: '2026-10-16T08:30:00.000Z' };

// Spec conversions-relay §4 "SPA": the Meta CAPI section of the app settings. Editable by an app admin only.
describe('CAPI settings', () => {
  it('shows "Chưa có token" and saves a token: sent as typed, input cleared, the token never rendered', async () => {
    let state = NONE;
    const c = client(ME.admin, {
      getCapi: vi.fn(async () => state),
      setCapi: vi.fn(async () => { state = SET; return SET; }),
    });
    renderApp(c, '/apps/starlyn/settings');
    const box = await screen.findByTestId('capi-settings');
    expect(await within(box).findByText('Chưa có token')).toBeTruthy();
    const input = within(box).getByTestId('capi-token-input');
    expect(input.type).toBe('password');
    fireEvent.change(input, { target: { value: TOKEN } });
    fireEvent.click(within(box).getByRole('button', { name: 'Lưu token' }));
    await waitFor(() => expect(c.setCapi).toHaveBeenCalledWith('starlyn', { token: TOKEN }));
    expect(await within(box).findByText('••••abcd · đặt lúc 2026-10-16 08:30')).toBeTruthy();
    expect(input.value).toBe('');
    expect(document.body.textContent).not.toContain(TOKEN);
  });

  it('an empty token is not sent', async () => {
    const c = client(ME.admin);
    renderApp(c, '/apps/starlyn/settings');
    const box = await screen.findByTestId('capi-settings');
    await within(box).findByText('Chưa có token');
    expect(within(box).getByRole('button', { name: 'Lưu token' }).disabled).toBe(true);
    expect(c.setCapi).not.toHaveBeenCalled();
  });

  it('Xoá token asks to confirm, then sends token: null', async () => {
    let state = SET;
    const c = client(ME.admin, {
      getCapi: vi.fn(async () => state),
      setCapi: vi.fn(async () => { state = NONE; return NONE; }),
    });
    renderApp(c, '/apps/starlyn/settings');
    const box = await screen.findByTestId('capi-settings');
    await within(box).findByText('••••abcd · đặt lúc 2026-10-16 08:30');
    fireEvent.click(within(box).getByRole('button', { name: 'Xoá token' }));
    expect(c.setCapi).not.toHaveBeenCalled();
    const dialog = screen.getByRole('dialog', { name: 'Xoá token CAPI' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xác nhận xoá' }));
    await waitFor(() => expect(c.setCapi).toHaveBeenCalledWith('starlyn', { token: null }));
    expect(await within(box).findByText('Chưa có token')).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('Huỷ in the confirm dialog sends nothing', async () => {
    const c = client(ME.admin, { getCapi: vi.fn(async () => SET) });
    renderApp(c, '/apps/starlyn/settings');
    await screen.findByText('••••abcd · đặt lúc 2026-10-16 08:30');
    fireEvent.click(screen.getByRole('button', { name: 'Xoá token' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Huỷ' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(c.setCapi).not.toHaveBeenCalled();
  });

  it('test code: saved, explained, and Bỏ test code sends null', async () => {
    let state = NONE;
    const c = client(ME.admin, {
      getCapi: vi.fn(async () => state),
      setCapi: vi.fn(async (id, b) => { state = { ...NONE, test_code: b.test_code }; return state; }),
    });
    renderApp(c, '/apps/starlyn/settings');
    const box = await screen.findByTestId('capi-settings');
    expect(within(box).getByText('Khi có test code, sự kiện chỉ hiện ở Test Events, không vào số liệu thật.')).toBeTruthy();
    fireEvent.change(await within(box).findByLabelText('Test code'), { target: { value: 'TEST12345' } });
    fireEvent.click(within(box).getByRole('button', { name: 'Lưu test code' }));
    await waitFor(() => expect(c.setCapi).toHaveBeenCalledWith('starlyn', { test_code: 'TEST12345' }));
    fireEvent.click(await within(box).findByRole('button', { name: 'Bỏ test code' }));
    await waitFor(() => expect(c.setCapi).toHaveBeenLastCalledWith('starlyn', { test_code: null }));
    await waitFor(() => expect(within(box).getByLabelText('Test code').value).toBe(''));
  });

  it('a refused token shows the error and keeps what was typed', async () => {
    const c = client(ME.admin, { setCapi: vi.fn(async () => { throw new ApiError(400, { error: 'invalid_token' }); }) });
    renderApp(c, '/apps/starlyn/settings');
    const box = await screen.findByTestId('capi-settings');
    fireEvent.change(within(box).getByTestId('capi-token-input'), { target: { value: 'short' } });
    fireEvent.click(within(box).getByRole('button', { name: 'Lưu token' }));
    expect((await within(box).findByRole('alert')).textContent).toContain('invalid_token');
  });

  it('an editor sees the section read-only: status shown, inputs and buttons disabled', async () => {
    const c = client(ME.editor, { getCapi: vi.fn(async () => ({ ...SET, test_code: 'TEST1' })) });
    renderApp(c, '/apps/starlyn/settings');
    const box = await screen.findByTestId('capi-settings');
    expect(await within(box).findByText('••••abcd · đặt lúc 2026-10-16 08:30')).toBeTruthy();
    expect(within(box).getByTestId('capi-token-input').disabled).toBe(true);
    expect(within(box).getByLabelText('Test code').disabled).toBe(true);
    for (const n of ['Lưu token', 'Xoá token', 'Lưu test code', 'Bỏ test code']) expect(within(box).getByRole('button', { name: n }).disabled).toBe(true);
  });

  it('role in the app counts: an app admin who is not global can edit', async () => {
    const me = { ...ME.viewer, apps: [{ id: 'starlyn', name: 'Starlyn', role: 'admin' }, { id: 'tarot-web', name: 'Tarot Web', role: 'viewer' }] };
    renderApp(client(me, { getCapi: vi.fn(async () => SET) }), '/apps/starlyn/settings');
    const box = await screen.findByTestId('capi-settings');
    await within(box).findByText('••••abcd · đặt lúc 2026-10-16 08:30');
    expect(within(box).getByTestId('capi-token-input').disabled).toBe(false);
  });
});
```

`apps/admin/test/conversions.test.jsx` (mới):

```jsx
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { ApiError } from '../src/api.js';
import { renderApp, ME } from './helpers.jsx';
import { appsClient, STARLYN } from './apps-fixtures.js';

const COUNTS = { pending: 1, sent: 12, skipped: 3, dead: 2 };
const NONE = { token_last4: 'abcd', token_set_at: '2026-10-16T08:30:00.000Z', test_code: null, counts_24h: COUNTS, pixel_funnels_without_token: 0 };
const ev = (id, status, extra = {}) => ({
  id, event_id: `pay_${id}`, funnel: 'moon-reading', value_minor: 1367, currency: 'USD', event_time: '2026-10-16T08:00:00.000Z', status,
  skip_reason: null, attempts: status === 'sent' ? 1 : 0, last_error: null, test_code: null, sent_at: null, ...extra,
});
const client = (me, overrides = {}) => appsClient(me, { getCapi: vi.fn(async () => NONE), ...overrides });
const cells = (row) => within(row).getAllByRole('cell').map((c) => c.textContent);

// Spec conversions-relay §4 "SPA": the Conversions page of an app.
describe('App conversions', () => {
  it('24h counts and a row per event: time, funnel, value, status, attempts, error', async () => {
    const c = client(ME.admin, {
      listCapiEvents: vi.fn(async () => ({ events: [ev(7, 'dead', { attempts: 8, last_error: 'meta_190' }), ev(6, 'sent')], next_before: null })),
    });
    renderApp(c, '/apps/starlyn/conversions');
    const table = await screen.findByTestId('capi-events');
    expect(screen.getByTestId('capi-counts').textContent).toBe('pending 1 · sent 12 · skipped 3 · dead 2');
    const rows = await within(table).findAllByTestId('capi-row');
    expect(cells(rows[0]).slice(0, 6)).toEqual(['2026-10-16 08:00', 'moon-reading', '13.67 USD', 'dead', '8', 'meta_190']);
    expect(cells(rows[1]).slice(3, 5)).toEqual(['sent', '1']);
    expect(c.listCapiEvents).toHaveBeenCalledWith({ app: 'starlyn', status: undefined, before: undefined });
    expect(screen.getByRole('heading', { level: 1, name: 'Conversions · Starlyn' })).toBeTruthy();
  });

  it('skip reasons are shown in Vietnamese', async () => {
    const reasons = ['no_app', 'no_pixel', 'no_token', 'no_consent', 'too_old'];
    const c = client(ME.admin, {
      listCapiEvents: vi.fn(async () => ({ events: reasons.map((r, i) => ev(10 + i, 'skipped', { skip_reason: r })), next_before: null })),
    });
    renderApp(c, '/apps/starlyn/conversions');
    const rows = await screen.findAllByTestId('capi-row');
    expect(rows.map((r) => cells(r)[5])).toEqual([
      'Funnel chưa gán app', 'Funnel chưa có pixel', 'App chưa có token', 'Khách không đồng ý quảng cáo', 'Quá 7 ngày',
    ]);
  });

  it('status filter reloads with the status; Tất cả clears it', async () => {
    const c = client(ME.admin, {
      listCapiEvents: vi.fn(async (q) => ({ events: [ev(q.status ? 5 : 6, q.status ?? 'sent')], next_before: null })),
    });
    renderApp(c, '/apps/starlyn/conversions');
    await screen.findAllByTestId('capi-row');
    fireEvent.change(screen.getByLabelText('Trạng thái'), { target: { value: 'skipped' } });
    await waitFor(() => expect(c.listCapiEvents).toHaveBeenLastCalledWith({ app: 'starlyn', status: 'skipped', before: undefined }));
    await waitFor(() => expect(cells(screen.getByTestId('capi-row'))[3]).toBe('skipped'));
    fireEvent.change(screen.getByLabelText('Trạng thái'), { target: { value: '' } });
    await waitFor(() => expect(c.listCapiEvents).toHaveBeenLastCalledWith({ app: 'starlyn', status: undefined, before: undefined }));
  });

  it('?status=dead in the URL is the starting filter', async () => {
    const c = client(ME.admin, { listCapiEvents: vi.fn(async () => ({ events: [ev(7, 'dead')], next_before: null })) });
    renderApp(c, '/apps/starlyn/conversions?status=dead');
    await screen.findAllByTestId('capi-row');
    expect(c.listCapiEvents).toHaveBeenCalledWith({ app: 'starlyn', status: 'dead', before: undefined });
    expect(screen.getByLabelText('Trạng thái').value).toBe('dead');
  });

  it('Tải thêm appends the next page by next_before and disappears at the end', async () => {
    const c = client(ME.admin, {
      listCapiEvents: vi.fn(async ({ before }) => (before ? { events: [ev(3, 'sent')], next_before: null } : { events: [ev(5, 'sent'), ev(4, 'sent')], next_before: 4 })),
    });
    renderApp(c, '/apps/starlyn/conversions');
    await screen.findAllByTestId('capi-row');
    fireEvent.click(screen.getByRole('button', { name: 'Tải thêm' }));
    await waitFor(() => expect(screen.getAllByTestId('capi-row')).toHaveLength(3));
    expect(c.listCapiEvents).toHaveBeenLastCalledWith({ app: 'starlyn', status: undefined, before: 4 });
    expect(screen.queryByRole('button', { name: 'Tải thêm' })).toBeNull();
  });

  it('Gửi lại only on dead rows, for an app admin; resend then refresh', async () => {
    let dead = true;
    const c = client(ME.admin, {
      listCapiEvents: vi.fn(async () => ({ events: [ev(7, dead ? 'dead' : 'pending'), ev(6, 'sent')], next_before: null })),
      resendCapiEvent: vi.fn(async () => { dead = false; return ev(7, 'pending'); }),
    });
    renderApp(c, '/apps/starlyn/conversions');
    const rows = await screen.findAllByTestId('capi-row');
    expect(within(rows[1]).queryByTestId('capi-resend')).toBeNull();
    fireEvent.click(within(rows[0]).getByTestId('capi-resend'));
    await waitFor(() => expect(c.resendCapiEvent).toHaveBeenCalledWith(7));
    await waitFor(() => expect(screen.queryByTestId('capi-resend')).toBeNull());
    expect(c.listCapiEvents).toHaveBeenCalledTimes(2);
  });

  it('two quick clicks on Gửi lại resend once', async () => {
    const c = client(ME.admin, {
      listCapiEvents: vi.fn(async () => ({ events: [ev(7, 'dead')], next_before: null })),
      resendCapiEvent: vi.fn(() => new Promise(() => {})),
    });
    renderApp(c, '/apps/starlyn/conversions');
    const btn = await screen.findByTestId('capi-resend');
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(c.resendCapiEvent).toHaveBeenCalledTimes(1);
  });

  it('a viewer sees dead rows but Gửi lại is greyed out', async () => {
    const c = client(ME.viewer, { listCapiEvents: vi.fn(async () => ({ events: [ev(7, 'dead')], next_before: null })) });
    renderApp(c, '/apps/starlyn/conversions');
    expect((await screen.findByTestId('capi-resend')).disabled).toBe(true);
  });

  it('a failed resend shows the error', async () => {
    const c = client(ME.admin, {
      listCapiEvents: vi.fn(async () => ({ events: [ev(7, 'dead')], next_before: null })),
      resendCapiEvent: vi.fn(async () => { throw new ApiError(409, { error: 'not_dead' }); }),
    });
    renderApp(c, '/apps/starlyn/conversions');
    fireEvent.click(await screen.findByTestId('capi-resend'));
    expect((await screen.findByRole('alert')).textContent).toContain('not_dead');
  });

  it('an app out of scope or unknown shows Không tìm thấy app', async () => {
    renderApp(client(ME.admin), '/apps/nope/conversions');
    expect(await screen.findByText('Không tìm thấy app nope.')).toBeTruthy();
  });

  it('the app menu has Conversions', async () => {
    renderApp(client(ME.viewer), '/apps/starlyn/conversions');
    const link = await screen.findByRole('link', { name: 'Conversions' });
    expect(link.getAttribute('href')).toBe('/apps/starlyn/conversions');
  });
});

const SUMMARY = (capi) => ({ app: STARLYN, funnels: [], domains: [], capi });
const overview = (capiSummary, capi, me = ME.viewer) =>
  client(me, { getAppSummary: vi.fn(async () => SUMMARY(capiSummary)), getCapi: vi.fn(async () => capi) });

describe('App overview CAPI warnings', () => {
  it('pixel funnels without a token: warning without a dead-events link', async () => {
    renderApp(overview({ configured: false, dead_24h: 0 }, { ...NONE, token_last4: null, pixel_funnels_without_token: 2 }), '/apps/starlyn');
    const w = await screen.findByTestId('capi-warning');
    expect(w.textContent).toBe('Có funnel gắn pixel nhưng app chưa có token CAPI — Purchase chưa gửi về Meta.');
    expect(screen.getAllByTestId('capi-warning')).toHaveLength(1);
  });

  it('dead events in 24h: "N sự kiện CAPI lỗi trong 24h" linking to conversions?status=dead', async () => {
    renderApp(overview({ configured: true, dead_24h: 4 }, NONE), '/apps/starlyn');
    const w = await screen.findByTestId('capi-warning');
    expect(w.textContent).toContain('4 sự kiện CAPI lỗi trong 24h');
    expect(within(w).getByRole('link').getAttribute('href')).toBe('/apps/starlyn/conversions?status=dead');
  });

  it('both warnings at once; none when all is well', async () => {
    const { unmount } = renderApp(overview({ configured: false, dead_24h: 1 }, { ...NONE, pixel_funnels_without_token: 1 }), '/apps/starlyn');
    await waitFor(() => expect(screen.getAllByTestId('capi-warning')).toHaveLength(2));
    unmount();
    const c = overview({ configured: true, dead_24h: 0 }, NONE);
    renderApp(c, '/apps/starlyn');
    await screen.findByTestId('app-kind');
    await waitFor(() => expect(c.getCapi).toHaveBeenCalledWith('starlyn'));
    expect(screen.queryByTestId('capi-warning')).toBeNull();
  });

  it('an old server without summary.capi, or a failing getCapi, shows no warning and no error', async () => {
    const c = client(ME.viewer, { getAppSummary: vi.fn(async () => ({ app: STARLYN, funnels: [], domains: [] })), getCapi: vi.fn(async () => { throw new ApiError(500, { error: 'internal' }); }) });
    renderApp(c, '/apps/starlyn');
    await screen.findByTestId('app-kind');
    await waitFor(() => expect(c.getCapi).toHaveBeenCalled());
    expect(screen.queryByTestId('capi-warning')).toBeNull();
  });
});
```

`apps/admin/test/helpers.jsx`, `apps/admin/test/grants.test.jsx`, `apps/admin/test/layout-app.test.jsx`, `apps/admin/test/scope-ui.test.jsx` (sửa, áp dụng đúng diff này; ba file sau chỉ thêm "Conversions" vào danh sách menu trong app, giữa Webhooks và Audit):

`apps/admin/test/helpers.jsx`, `apps/admin/test/grants.test.jsx`, `apps/admin/test/layout-app.test.jsx`, `apps/admin/test/scope-ui.test.jsx` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/test/grants.test.jsx b/apps/admin/test/grants.test.jsx
index dd0af77..d03d927 100644
--- a/apps/admin/test/grants.test.jsx
+++ b/apps/admin/test/grants.test.jsx
@@ -75,10 +75,10 @@ describe('nav by grants', () => {
   };
 
   it.each([
-    ['viewer', ['Tổng quan', 'Funnels', 'Domains', 'Audit']],
-    ['support', ['Tổng quan', 'Funnels', 'Khách hàng', 'Domains', 'Audit']],
-    ['editor', ['Tổng quan', 'Funnels', 'Giá', 'Domains', 'Webhooks', 'Audit', 'Cài đặt']],
-    ['admin', ['Tổng quan', 'Funnels', 'Giá', 'Khách hàng', 'Domains', 'Webhooks', 'Audit', 'Cài đặt']],
+    ['viewer', ['Tổng quan', 'Funnels', 'Domains', 'Conversions', 'Audit']],
+    ['support', ['Tổng quan', 'Funnels', 'Khách hàng', 'Domains', 'Conversions', 'Audit']],
+    ['editor', ['Tổng quan', 'Funnels', 'Giá', 'Domains', 'Webhooks', 'Conversions', 'Audit', 'Cài đặt']],
+    ['admin', ['Tổng quan', 'Funnels', 'Giá', 'Khách hàng', 'Domains', 'Webhooks', 'Conversions', 'Audit', 'Cài đặt']],
   ])('in an app, %s sees %j', async (role, items) => {
     expect(await appNavOf(ME[role])).toEqual([...items, '← Tất cả app']);
   });
@@ -87,6 +87,7 @@ describe('nav by grants', () => {
     expect(APP_NAV.map((n) => [n.label, n.to('starlyn'), n.need])).toEqual([
       ['Tổng quan', '/apps/starlyn', 'viewer'], ['Funnels', '/apps/starlyn/funnels', 'viewer'], ['Giá', '/apps/starlyn/plans', 'prices:read'],
       ['Khách hàng', '/apps/starlyn/customers', 'support'], ['Domains', '/apps/starlyn/domains', 'viewer'], ['Webhooks', '/apps/starlyn/webhooks', 'apps:read'],
+      ['Conversions', '/apps/starlyn/conversions', 'viewer'],
       ['Audit', '/apps/starlyn/audit', 'viewer'], ['Cài đặt', '/apps/starlyn/settings', 'apps:read'],
     ]);
   });
diff --git a/apps/admin/test/helpers.jsx b/apps/admin/test/helpers.jsx
index 69c7443..0c201a0 100644
--- a/apps/admin/test/helpers.jsx
+++ b/apps/admin/test/helpers.jsx
@@ -56,6 +56,10 @@ export function fakeClient(me = ME.admin, overrides = {}) {
     rotateKey: vi.fn(),
     listWebhooks: vi.fn(async () => ({ items: [], next_before: null, counts: { pending: 0, delivered: 0, dead: 0 } })),
     resendWebhook: vi.fn(),
+    getCapi: vi.fn(async () => ({ token_last4: null, token_set_at: null, test_code: null, counts_24h: { pending: 0, sent: 0, skipped: 0, dead: 0 }, pixel_funnels_without_token: 0 })),
+    setCapi: vi.fn(),
+    listCapiEvents: vi.fn(async () => ({ events: [], next_before: null })),
+    resendCapiEvent: vi.fn(),
     lookupCustomers: vi.fn(async () => ({ customers: [] })),
     resendEmail: vi.fn(),
     rotateUserId: vi.fn(),
diff --git a/apps/admin/test/layout-app.test.jsx b/apps/admin/test/layout-app.test.jsx
index 12fb750..8524c5c 100644
--- a/apps/admin/test/layout-app.test.jsx
+++ b/apps/admin/test/layout-app.test.jsx
@@ -20,7 +20,7 @@ describe('app switcher and menu by context', () => {
     fireEvent.change(switcher(), { target: { value: 'starlyn' } });
     expect(await screen.findByRole('heading', { level: 1, name: 'Starlyn' })).toBeTruthy();
     expect(switcher().value).toBe('starlyn');
-    expect(links()).toEqual(['Tổng quan', 'Funnels', 'Domains', 'Audit', '← Tất cả app']);
+    expect(links()).toEqual(['Tổng quan', 'Funnels', 'Domains', 'Conversions', 'Audit', '← Tất cả app']);
     fireEvent.change(switcher(), { target: { value: '' } });
     expect(await screen.findByRole('heading', { level: 1, name: 'Dashboard' })).toBeTruthy();
     expect(links()).toEqual(['Dashboard', 'Funnels', 'Domains', 'Audit']);
@@ -36,6 +36,7 @@ describe('app switcher and menu by context', () => {
       ['Khách hàng', '/apps/starlyn/customers'],
       ['Domains', '/apps/starlyn/domains'],
       ['Webhooks', '/apps/starlyn/webhooks'],
+      ['Conversions', '/apps/starlyn/conversions'],
       ['Audit', '/apps/starlyn/audit'],
       ['Cài đặt', '/apps/starlyn/settings'],
       ['← Tất cả app', '/'],
@@ -53,7 +54,7 @@ describe('app switcher and menu by context', () => {
   it('a viewer in an app: Tổng quan, Funnels, Domains, Audit and the way back', async () => {
     renderApp(client(ME.viewer), '/apps/starlyn');
     await screen.findByRole('heading', { level: 1, name: 'Starlyn' });
-    expect(links()).toEqual(['Tổng quan', 'Funnels', 'Domains', 'Audit', '← Tất cả app']);
+    expect(links()).toEqual(['Tổng quan', 'Funnels', 'Domains', 'Conversions', 'Audit', '← Tất cả app']);
   });
 
   it('the global menu is unchanged at / and on /apps (the list is not "in an app")', async () => {
diff --git a/apps/admin/test/scope-ui.test.jsx b/apps/admin/test/scope-ui.test.jsx
index a41ed25..82133ff 100644
--- a/apps/admin/test/scope-ui.test.jsx
+++ b/apps/admin/test/scope-ui.test.jsx
@@ -50,7 +50,7 @@ describe('switcher, menu and home by scope', () => {
     expect(await screen.findByRole('heading', { level: 1, name: 'Starlyn' })).toBeTruthy();
     expect(options()).toEqual([['starlyn', 'Starlyn']]);
     expect(screen.getByTestId('app-switcher').value).toBe('starlyn');
-    expect(links()).toEqual(['Tổng quan', 'Funnels', 'Giá', 'Domains', 'Webhooks', 'Audit', 'Cài đặt']);
+    expect(links()).toEqual(['Tổng quan', 'Funnels', 'Giá', 'Domains', 'Webhooks', 'Conversions', 'Audit', 'Cài đặt']);
     expect(screen.getByTestId('who').textContent).toBe('sl@ikameglobal.com');
   });
 
@@ -71,11 +71,11 @@ describe('switcher, menu and home by scope', () => {
   it('the menu and the buttons follow the role in the app shown', async () => {
     renderApp(client(MIXED), '/apps/starlyn');
     expect(await screen.findByRole('heading', { level: 1, name: 'Starlyn' })).toBeTruthy();
-    expect(links()).toEqual(['Tổng quan', 'Funnels', 'Domains', 'Audit']);
+    expect(links()).toEqual(['Tổng quan', 'Funnels', 'Domains', 'Conversions', 'Audit']);
     expect(screen.getByRole('button', { name: 'Tạo funnel' }).disabled).toBe(true);
     fireEvent.change(screen.getByTestId('app-switcher'), { target: { value: 'tarot-web' } });
     expect(await screen.findByRole('heading', { level: 1, name: 'Tarot Web' })).toBeTruthy();
-    expect(links()).toEqual(['Tổng quan', 'Funnels', 'Giá', 'Khách hàng', 'Domains', 'Webhooks', 'Audit', 'Cài đặt']);
+    expect(links()).toEqual(['Tổng quan', 'Funnels', 'Giá', 'Khách hàng', 'Domains', 'Webhooks', 'Conversions', 'Audit', 'Cài đặt']);
     expect(screen.getByRole('button', { name: 'Tạo funnel' }).disabled).toBe(false);
   });
 
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
npm test -w @ikf/admin -- test/capi-settings.test.jsx test/conversions.test.jsx
```

Expected: `Test Files  2 failed (2)`, `Tests  23 failed (23)`: mọi test mới fail vì chưa có card `capi-settings`, trang `/apps/:id/conversions`, mục menu và cảnh báo.

- [ ] **Step 3: Implement**

`apps/admin/src/components/CapiSettings.jsx`, `apps/admin/src/pages/AppConversions.jsx` (mới):

`apps/admin/src/components/CapiSettings.jsx` (mới):

```jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../auth.jsx';
import { fmtTime } from '../format.js';
import { canIn } from '../roles.js';
import { ErrorNote } from './ErrorNote.jsx';
import { RoleButton } from './RoleButton.jsx';

function ConfirmClear({ busy, onConfirm, onClose }) {
  return (
    <div role="dialog" aria-modal="true" aria-label="Xoá token CAPI" className="dialog">
      <h3>Xoá token CAPI</h3>
      <p>Sau khi xoá, Purchase của app này sẽ không gửi về Meta cho tới khi có token mới.</p>
      <div className="row">
        <button type="button" className="primary" disabled={busy} onClick={onConfirm}>Xác nhận xoá</button>
        <button type="button" onClick={onClose}>Huỷ</button>
      </div>
    </div>
  );
}

// Spec conversions-relay §4 "SPA": the Meta CAPI section of an app's settings. GET /v1/apps/:id/capi never carries
// the token, only its last 4; the token typed here goes to PUT once and the input is cleared whatever the answer.
// Editable by the app's admin, read-only for every other role.
export function CapiSettings({ appId }) {
  const { client, me } = useAuth();
  const editable = canIn(me, 'admin', appId);
  const [capi, setCapi] = useState(null);
  const [token, setToken] = useState('');
  const [testCode, setTestCode] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const show = (r) => {
    setCapi(r);
    setTestCode(r.test_code ?? '');
  };
  useEffect(() => {
    let live = true;
    client.getCapi(appId).then((r) => live && show(r), (err) => live && setError(err));
    return () => {
      live = false;
    };
  }, [client, appId]);

  const put = async (body, { clearToken = false } = {}) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      show(await client.setCapi(appId, body));
      if (clearToken) setToken('');
      setConfirming(false);
    } catch (err) {
      setError(err);
      setConfirming(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card form" data-testid="capi-settings">
      <h2>Meta CAPI</h2>
      {capi && (
        <p>{capi.token_last4 ? `••••${capi.token_last4} · đặt lúc ${fmtTime(capi.token_set_at)}` : 'Chưa có token'}</p>
      )}
      <label>
        Token
        <input data-testid="capi-token-input" type="password" autoComplete="off" aria-label="Token" value={token} disabled={!editable} onChange={(e) => setToken(e.target.value)} />
      </label>
      <div className="row">
        <RoleButton need="admin" className="primary" disabled={busy || !token.trim()} onClick={() => put({ token: token.trim() }, { clearToken: true })}>Lưu token</RoleButton>
        <RoleButton need="admin" disabled={busy || !capi?.token_last4} onClick={() => setConfirming(true)}>Xoá token</RoleButton>
      </div>
      <label>
        Test code
        <input aria-label="Test code" value={testCode} disabled={!editable} onChange={(e) => setTestCode(e.target.value)} />
      </label>
      <p className="muted">Khi có test code, sự kiện chỉ hiện ở Test Events, không vào số liệu thật.</p>
      <div className="row">
        <RoleButton need="admin" disabled={busy || !testCode.trim()} onClick={() => put({ test_code: testCode.trim() })}>Lưu test code</RoleButton>
        <RoleButton need="admin" disabled={busy || !capi?.test_code} onClick={() => put({ test_code: null })}>Bỏ test code</RoleButton>
      </div>
      <ErrorNote error={error} />
      {confirming && <ConfirmClear busy={busy} onConfirm={() => put({ token: null })} onClose={() => setConfirming(false)} />}
    </div>
  );
}
```

`apps/admin/src/pages/AppConversions.jsx` (mới):

```jsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { AppNotFound, useApp } from '../app-context.jsx';
import { useAuth } from '../auth.jsx';
import { ErrorNote } from '../components/ErrorNote.jsx';
import { RoleButton } from '../components/RoleButton.jsx';
import { fmtMoney, fmtTime } from '../format.js';

const STATUSES = ['pending', 'sent', 'skipped', 'dead'];
// Spec conversions-relay §4: why a conversion was not sent, in words.
const SKIP = {
  no_app: 'Funnel chưa gán app',
  no_pixel: 'Funnel chưa có pixel',
  no_token: 'App chưa có token',
  no_consent: 'Khách không đồng ý quảng cáo',
  too_old: 'Quá 7 ngày',
};

function Conversions({ appId }) {
  const { client } = useAuth();
  const [params, setParams] = useSearchParams();
  const wanted = params.get('status');
  const status = STATUSES.includes(wanted) ? wanted : ''; // ?status=dead from the overview warning
  const [events, setEvents] = useState(null);
  const [next, setNext] = useState(null);
  const [counts, setCounts] = useState(null);
  const [error, setError] = useState(null);
  const [resending, setResending] = useState(false);
  const seq = useRef(0);

  // Only the newest load may change the list: a slow answer of an old filter never replaces a newer one.
  const load = useCallback(async (before) => {
    const n = ++seq.current;
    setError(null);
    try {
      const [r, c] = await Promise.all([
        client.listCapiEvents({ app: appId, status: status || undefined, before }),
        before ? null : client.getCapi(appId),
      ]);
      if (n !== seq.current) return;
      setEvents((prev) => (before ? [...prev, ...r.events] : r.events));
      setNext(r.next_before);
      if (c) setCounts(c.counts_24h);
    } catch (err) {
      if (n === seq.current) setError(err);
    }
  }, [client, appId, status]);
  useEffect(() => {
    setEvents(null);
    load(undefined);
  }, [load]);

  // One resend at a time: the button stays disabled until the answer, then the list reloads.
  const resend = async (id) => {
    if (resending) return;
    setResending(true);
    setError(null);
    try {
      await client.resendCapiEvent(id);
      await load(undefined);
    } catch (err) {
      setError(err);
    } finally {
      setResending(false);
    }
  };

  const pick = (value) => setParams(value ? { status: value } : {}, { replace: true });
  return (
    <div className="card">
      {counts && <p data-testid="capi-counts">pending {counts.pending} · sent {counts.sent} · skipped {counts.skipped} · dead {counts.dead}</p>}
      <label htmlFor="capi-status">Trạng thái</label>
      <select id="capi-status" value={status} onChange={(e) => pick(e.target.value)}>
        <option value="">Tất cả</option>
        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <ErrorNote error={error} />
      {events === null ? (
        <p className="muted">Đang tải…</p>
      ) : (
        <table data-testid="capi-events">
          <thead>
            <tr><th>Thời gian</th><th>Funnel</th><th>Giá trị</th><th>Trạng thái</th><th>Lần thử</th><th>Lỗi</th><th /></tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} data-testid="capi-row">
                <td>{fmtTime(e.event_time)}</td>
                <td>{e.funnel ?? '—'}</td>
                <td>{fmtMoney(e.value_minor, e.currency)}</td>
                <td>{e.status}</td>
                <td>{e.attempts}</td>
                <td>{e.skip_reason ? SKIP[e.skip_reason] ?? e.skip_reason : e.last_error ?? ''}</td>
                <td>
                  {e.status === 'dead' && (
                    <RoleButton need="admin" data-testid="capi-resend" disabled={resending} onClick={() => resend(e.id)}>Gửi lại</RoleButton>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {next && <button type="button" onClick={() => load(next)}>Tải thêm</button>}
    </div>
  );
}

// Conversions of an app (spec conversions-relay §4, at /apps/:id/conversions): the Purchase events relayed to Meta,
// 24h counts, status filter, load more, resend of a dead one.
export function AppConversions() {
  const { id } = useParams();
  const { app, error, notFound } = useApp(id);

  if (notFound) return <AppNotFound id={id} />; // out of scope looks the same as unknown (spec admin-console-p4b §3)
  if (!app) return error ? <ErrorNote error={error} /> : <p className="muted">Đang tải…</p>;
  return (
    <section>
      <h1>Conversions · {app.name}</h1>
      <Conversions appId={app.id} />
    </section>
  );
}
```

`apps/admin/src/api.js`, `src/App.jsx`, `src/Layout.jsx`, `src/icons.jsx`, `src/pages/AppSettings.jsx`, `src/pages/AppOverview.jsx` (sửa, áp dụng đúng diff này):

`apps/admin/src/api.js`, `apps/admin/src/App.jsx`, `apps/admin/src/Layout.jsx`, `apps/admin/src/icons.jsx`, `apps/admin/src/pages/AppSettings.jsx`, `apps/admin/src/pages/AppOverview.jsx` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/apps/admin/src/App.jsx b/apps/admin/src/App.jsx
index e6b5ac7..b477a89 100644
--- a/apps/admin/src/App.jsx
+++ b/apps/admin/src/App.jsx
@@ -2,6 +2,7 @@ import { Navigate, Route, Routes } from 'react-router';
 import { AuthProvider, RequireAuth, useAuth } from './auth.jsx';
 import { Layout } from './Layout.jsx';
 import { AllApps, RequireGrant } from './components/RequireGrant.jsx';
+import { AppConversions } from './pages/AppConversions.jsx';
 import { AppOverview } from './pages/AppOverview.jsx';
 import { AppPlans } from './pages/AppPlans.jsx';
 import { Apps } from './pages/Apps.jsx';
@@ -44,6 +45,7 @@ export function App({ client }) {
           <Route path="/apps/:id/funnels" element={<Funnels />} />
           <Route path="/apps/:id/settings" element={<RequireGrant need="apps:read"><AppSettings /></RequireGrant>} />
           <Route path="/apps/:id/webhooks" element={<RequireGrant need="apps:read"><AppWebhooks /></RequireGrant>} />
+          <Route path="/apps/:id/conversions" element={<AppConversions />} />
           <Route path="/apps/:id/domains" element={<Domains />} />
           <Route path="/apps/:id/plans" element={<RequireGrant need="prices:read"><AppPlans /></RequireGrant>} />
           <Route path="/apps/:id/customers" element={<RequireGrant need="support"><Customers /></RequireGrant>} />
diff --git a/apps/admin/src/Layout.jsx b/apps/admin/src/Layout.jsx
index 7eaf85e..86afbf7 100644
--- a/apps/admin/src/Layout.jsx
+++ b/apps/admin/src/Layout.jsx
@@ -27,6 +27,7 @@ export const APP_NAV = [
   { to: under('/customers'), label: 'Khách hàng', need: 'support', icon: 'customers' },
   { to: under('/domains'), label: 'Domains', need: 'viewer', icon: 'domains' },
   { to: under('/webhooks'), label: 'Webhooks', need: 'apps:read', icon: 'webhooks' },
+  { to: under('/conversions'), label: 'Conversions', need: 'viewer', icon: 'conversions' },
   { to: under('/audit'), label: 'Audit', need: 'viewer', icon: 'audit' },
   { to: under('/settings'), label: 'Cài đặt', need: 'apps:read', icon: 'settings' },
 ];
diff --git a/apps/admin/src/api.js b/apps/admin/src/api.js
index 4d1157b..bc406c2 100644
--- a/apps/admin/src/api.js
+++ b/apps/admin/src/api.js
@@ -103,6 +103,12 @@ export function createClient({ base = API_BASE, fetch = (...a) => globalThis.fet
       return call('GET', `/v1/apps/${q(id)}/webhooks${qs ? `?${qs}` : ''}`);
     },
     resendWebhook: (id, eventId) => call('POST', `/v1/apps/${q(id)}/webhooks/${q(eventId)}/resend`),
+    // Spec conversions-relay §4: the app's Meta CAPI settings (never the token, only its last 4), the conversions list
+    // (50 per page, `before` = the previous page's next_before) and the resend of a dead one.
+    getCapi: (id) => call('GET', `/v1/apps/${q(id)}/capi`),
+    setCapi: (id, body) => call('PUT', `/v1/apps/${q(id)}/capi`, body),
+    listCapiEvents: ({ app, status, before } = {}) => call('GET', `/v1/capi-events${query({ app, status, before })}`),
+    resendCapiEvent: (id) => call('POST', `/v1/capi-events/${q(id)}/resend`),
     // app: that app's domains and the shared ones (both publishable); 'none' → the shared ones only.
     listDomains: ({ app } = {}) => call('GET', `/v1/domains${query({ app })}`),
     // body {status?, app_id?}: app_id null makes the host shared again (p4a §2 "Domain và publish").
diff --git a/apps/admin/src/icons.jsx b/apps/admin/src/icons.jsx
index ac24dec..66cee46 100644
--- a/apps/admin/src/icons.jsx
+++ b/apps/admin/src/icons.jsx
@@ -34,6 +34,8 @@ export const ICONS = {
   webhooks: () => (
     <Icon><path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2" /><path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06" /><path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8" /></Icon>
   ),
+  // Conversions (spec conversions-relay §4): a share/send arrow.
+  conversions: () => <Icon><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4z" /></Icon>,
   logout: () => <Icon><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></Icon>,
 };
 
diff --git a/apps/admin/src/pages/AppOverview.jsx b/apps/admin/src/pages/AppOverview.jsx
index 4389107..b1f0b09 100644
--- a/apps/admin/src/pages/AppOverview.jsx
+++ b/apps/admin/src/pages/AppOverview.jsx
@@ -1,5 +1,5 @@
 import { useEffect, useRef, useState } from 'react';
-import { useNavigate, useParams } from 'react-router';
+import { Link, useNavigate, useParams } from 'react-router';
 import { AppNotFound, isAppNotFound } from '../app-context.jsx';
 import { useAuth } from '../auth.jsx';
 import { AnalyticsError, Loading } from '../components/AnalyticsState.jsx';
@@ -37,6 +37,24 @@ function AppDomains({ domains }) {
   );
 }
 
+// Spec conversions-relay §4 "App overview": what is wrong with the app's Purchase relay. waiting comes from
+// GET /v1/apps/:id/capi (pixel funnels while the app has no token), dead24h from summary.capi.
+function CapiWarnings({ appId, waiting, dead24h }) {
+  if (!waiting && !dead24h) return null;
+  return (
+    <>
+      {waiting > 0 && (
+        <p className="card warn" data-testid="capi-warning">Có funnel gắn pixel nhưng app chưa có token CAPI — Purchase chưa gửi về Meta.</p>
+      )}
+      {dead24h > 0 && (
+        <p className="card warn" data-testid="capi-warning">
+          {dead24h} sự kiện CAPI lỗi trong 24h · <Link to={`/apps/${encodeURIComponent(appId)}/conversions?status=dead`}>Xem sự kiện lỗi</Link>
+        </p>
+      )}
+    </>
+  );
+}
+
 // Tổng quan app (spec admin-console-p4a §3): name and kind, the p3 Dashboard filtered by the app (KPI row and a
 // row per funnel), the app's domains and "Tạo funnel". GET /v1/apps/:id/summary gives the app and its domains;
 // the numbers come from GET /v1/analytics/overview?app=, which is 404 app_not_found for an unknown app too.
@@ -46,6 +64,7 @@ export function AppOverview() {
   const navigate = useNavigate();
   const [summary, setSummary] = useState(null);
   const [summaryError, setSummaryError] = useState(null);
+  const [waiting, setWaiting] = useState(0);
   const [days, setDays] = useState(7);
   const [data, setData] = useState(null);
   const [error, setError] = useState(null);
@@ -62,6 +81,16 @@ export function AppOverview() {
     };
   }, [client, id]);
 
+  // A failing getCapi only hides its warning: the overview itself must not break on it.
+  useEffect(() => {
+    setWaiting(0);
+    let live = true;
+    client.getCapi(id).then((r) => live && setWaiting(r.pixel_funnels_without_token ?? 0), () => {});
+    return () => {
+      live = false;
+    };
+  }, [client, id]);
+
   useEffect(() => {
     const n = ++seq.current; // only the newest request may change the page
     const { from, to } = rangeFor(days);
@@ -85,6 +114,7 @@ export function AppOverview() {
         <span className="badge kind" data-testid="app-kind">{app.kind}</span>
         <RoleButton need="editor" className="primary" onClick={() => navigate(`/apps/${encodeURIComponent(app.id)}/funnels?new=1`)}>Tạo funnel</RoleButton>
       </div>
+      <CapiWarnings appId={app.id} waiting={waiting} dead24h={summary.capi?.dead_24h ?? 0} />
       <RangePicker days={days} onChange={setDays} disabled={loading} />
       <AnalyticsError error={error} />
       {loading && <Loading />}
diff --git a/apps/admin/src/pages/AppSettings.jsx b/apps/admin/src/pages/AppSettings.jsx
index 1bb894c..8d9a57d 100644
--- a/apps/admin/src/pages/AppSettings.jsx
+++ b/apps/admin/src/pages/AppSettings.jsx
@@ -4,6 +4,7 @@ import { AppNotFound, useApp, useAppContext } from '../app-context.jsx';
 import { useAuth } from '../auth.jsx';
 import { ErrorNote } from '../components/ErrorNote.jsx';
 import { FieldErrors } from '../components/FieldErrors.jsx';
+import { CapiSettings } from '../components/CapiSettings.jsx';
 import { RoleButton } from '../components/RoleButton.jsx';
 import { SecretsBox } from '../components/SecretsBox.jsx';
 import { fmtTime } from '../format.js';
@@ -130,6 +131,7 @@ export function AppSettings() {
           }}
         />
       )}
+      <CapiSettings key={`capi-${app.id}`} appId={app.id} />
       <EditApp
         key={app.id}
         app={app}
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npm test -w @ikf/admin -- test/capi-settings.test.jsx test/conversions.test.jsx
npm test -w @ikf/admin 2>&1 | grep -E "Test Files|Tests  "
npm run build -w @ikf/admin 2>&1 | tail -3
```

Expected: 23 test mới pass; toàn bộ admin `Test Files  30 passed (30)`, `Tests  271 passed (271)` (trước: 28 file, 248 test); build `✓ built`.

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src apps/admin/test
git commit -m "feat(admin): Meta CAPI settings, Conversions page and overview warnings"
```

---

---

### Task 9: Demo fake Graph + e2e, IAM, runbook

**Files:**
- Create: `demo/lib/fake-graph.mjs`
- Modify: `demo/lib/stack.mjs` (fake Graph + relay khi có purchase flow và `ports.graph`; `PORTS.graph = 8793`; option `conversionsMs`; trả `graph`, `purchase.conversions`), `demo/lib/seed.mjs` (`seedCapi`, `DEMO_CAPI_TOKEN`, `DEMO_CAPI_TEST_CODE`, `DEMO_CAPI_PIXEL`), `demo/run.mjs` (dòng `CAPI:`), `infra/stack/main.tf` (statement `AppCapiSecrets`), `docs/runbooks/admin-console.md` (§15 Meta CAPI), `demo/README.md`, `CLAUDE.md`
- Test: `demo/test/fake-graph.test.mjs` (mới), `demo/test/capi-e2e.test.mjs` (mới), `infra/stack/tests/stack.tftest.hcl` (thêm một assert)

**Interfaces:**
- Consumes: `startConversions({pool, tokens, graphUrl, alarm, log, enqueueMs, sendMs})` (`services/core-api/src/conversions/relay.js`, Task 5), `cachedTokenStore`, `memoryTokenStore` (`conversions/store.js`, Task 5), dep `capiTokens` của `buildApp` và `PUT /v1/apps/:id/capi {token, test_code}` (Task 6), `classify` (`conversions/event.js`, Task 3), trang `/apps/:id/conversions` với testid `capi-row`, `capi-counts`, `capi-resend` (Task 8), fake Paddle `pay`/`renew` (`origin: 'subscription_recurring'`).
- Produces:
  - `startFakeGraph({port = 0, host = '127.0.0.1', mode = 'ok'})` → `{port, url, mode(), setMode(mode), requests(), close()}`; `GRAPH_MODES = ['ok', 'error500', 'token_invalid']`. HTTP: `POST /[vX.Y/]<pixel>/events` ghi `{pixel, mode, body}` và trả `200 {events_received}` / `500 {error:{code:2}}` (relay: retry `meta_2`) / `401 {error:{code:190}}` (relay: token, `meta_190`); `GET /__requests`; `POST /__mode {mode}` (sai → 400 `bad_mode`); path khác 404, body không phải JSON 400 (không ghi).
  - `startStack({..., conversionsMs = 1000})`: khi `purchase && ports.graph` → fake Graph trên `ports.graph`, `capiTokens: cachedTokenStore(memoryTokenStore())` vào `buildApp`, `startConversions` với `graphUrl = <fake>/v21.0`, `alarm` của purchase deps, `enqueueMs = sendMs = conversionsMs`; sau `seedPurchase` gọi `seedCapi`. Trả thêm `graph` (null khi tắt) và `purchase.conversions = '/apps/<app>/conversions'`.
  - `seedCapi({request, pool, app, funnel, pixel = null})`: `PUT /v1/apps/<app>/capi {token: DEMO_CAPI_TOKEN, test_code: 'TEST12345'}`; không có `--pixel` → `UPDATE funnels SET pixel_id = '100000000000001'` thẳng trong DB (route doc không re-sync nên trang funnel không tải Meta Pixel thật).
  - Terraform: statement `AppCapiSecrets` = `CreateSecret`, `PutSecretValue`, `GetSecretValue` trên `ikf/<env>/app-capi/*`, không `DeleteSecret` (ruling C1, C6).

- [ ] **Step 1: Viết test fail**

`demo/test/fake-graph.test.mjs` (mới):

`demo/test/fake-graph.test.mjs` (mới):

```js
import { describe, it, expect, afterEach } from 'vitest';
import { classify } from '../../services/core-api/src/conversions/event.js';
import { GRAPH_MODES, startFakeGraph } from '../lib/fake-graph.mjs';

let graph;
afterEach(async () => {
  await graph?.close();
  graph = null;
});

const post = async (url, body) => {
  const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  return { status: res.status, json: await res.json() };
};
const body = (ids) => ({ data: ids.map((id) => ({ event_name: 'Purchase', event_id: id })), access_token: 'demo_token_0000000000', test_event_code: 'TEST12345' });

describe('fake Graph API', () => {
  it('records POST /<version>/<pixel>/events and answers events_received; the relay reads it as ok', async () => {
    graph = await startFakeGraph();
    expect(graph.url).toBe(`http://127.0.0.1:${graph.port}`);
    const r = await post(`${graph.url}/v21.0/1234567890/events`, body(['txn_1', 'txn_2']));
    expect(r).toMatchObject({ status: 200, json: { events_received: 2 } });
    expect(classify({ status: r.status, body: r.json })).toEqual({ kind: 'ok', code: null });
    // No version prefix works too (graphUrl without /vXX.X).
    expect((await post(`${graph.url}/987654321/events`, body(['txn_3']))).status).toBe(200);
    const recorded = await (await fetch(`${graph.url}/__requests`)).json();
    expect(recorded).toEqual([
      { pixel: '1234567890', mode: 'ok', body: body(['txn_1', 'txn_2']) },
      { pixel: '987654321', mode: 'ok', body: body(['txn_3']) },
    ]);
    expect(graph.requests()).toEqual(recorded);
  });

  it('POST /__mode switches to error500 (retried) and token_invalid (401 + code 190); ok again; a bad mode is 400', async () => {
    graph = await startFakeGraph();
    expect(GRAPH_MODES).toEqual(['ok', 'error500', 'token_invalid']);
    expect(await post(`${graph.url}/__mode`, { mode: 'error500' })).toEqual({ status: 200, json: { mode: 'error500' } });
    let r = await post(`${graph.url}/v21.0/1234567890/events`, body(['txn_1']));
    expect(r.status).toBe(500);
    expect(classify({ status: r.status, body: r.json })).toEqual({ kind: 'retry', code: 'meta_2' });

    expect((await post(`${graph.url}/__mode`, { mode: 'token_invalid' })).status).toBe(200);
    r = await post(`${graph.url}/v21.0/1234567890/events`, body(['txn_2']));
    expect(r).toMatchObject({ status: 401, json: { error: { code: 190 } } });
    expect(classify({ status: r.status, body: r.json })).toEqual({ kind: 'token', code: 'meta_190' });

    expect(await post(`${graph.url}/__mode`, { mode: 'nope' })).toMatchObject({ status: 400, json: { error: 'bad_mode' } });
    expect(graph.mode()).toBe('token_invalid');
    graph.setMode('ok');
    expect((await post(`${graph.url}/v21.0/1234567890/events`, body(['txn_3']))).status).toBe(200);
    expect(graph.requests().map((x) => [x.mode, x.body.data[0].event_id])).toEqual([['error500', 'txn_1'], ['token_invalid', 'txn_2'], ['ok', 'txn_3']]);
    expect(() => graph.setMode('nope')).toThrow(/unknown fake graph mode/);
  });

  it('other paths are 404, a non-JSON body is 400 and not recorded; close() frees the port', async () => {
    graph = await startFakeGraph();
    expect((await fetch(`${graph.url}/v21.0/1234567890/other`, { method: 'POST', body: '{}' })).status).toBe(404);
    expect((await fetch(`${graph.url}/v21.0/1234567890/events`)).status).toBe(404);
    expect((await fetch(`${graph.url}/v21.0/1234567890/events`, { method: 'POST', body: 'not json' })).status).toBe(400);
    expect(graph.requests()).toEqual([]);
    const { url } = graph;
    await graph.close();
    graph = null;
    await expect(fetch(`${url}/__requests`)).rejects.toThrow();
  });
});
```

`demo/test/capi-e2e.test.mjs` (mới):

`demo/test/capi-e2e.test.mjs` (mới):

```js
// Conversions relay end to end (spec conversions-relay "Definition of done") on the real demo stack with the purchase
// flow (host https://demo.test, no tunnel) and the fake Graph API: Starlyn's funnel moon-reading has a pixel, Starlyn a
// demo token and test code TEST12345 → one purchase + one renewal (fake Paddle subscription_recurring) → the fake Graph
// got 2 Purchase events with event_id = the Paddle transaction ids, hashed email only → the Conversions page of
// starlyn shows 2 × sent → the fake Graph fails (error500), a new purchase is retried until dead (next_attempt_at
// fast-forwarded in SQL) → fake Graph ok, "Gửi lại" in the console → sent. Own ports and databases; the Postgres one
// is dropped first.
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { request } from 'node:http';
import { Writable } from 'node:stream';
import { describe, it, expect, afterAll } from 'vitest';
import pg from 'pg';
import { chromium } from 'playwright';
import { composeUp, ensureDocker } from '../lib/docker.mjs';
import { DEFAULT_FUNNELS_DIR, findFunnels } from '../lib/funnels.mjs';
import { appFor, DEMO_CAPI_PIXEL, DEMO_CAPI_TEST_CODE, DEMO_CAPI_TOKEN } from '../lib/seed.mjs';
import { DEMO_TOKEN, PG, startStack } from '../lib/stack.mjs';

const FUNNELS_DIR = process.env.IKF_FUNNELS_DIR || DEFAULT_FUNNELS_DIR;
const FUNNEL = 'moon-reading';
const APP = appFor(FUNNEL); // starlyn
const skipReason = !existsSync(FUNNELS_DIR) ? `funnels folder not found: ${FUNNELS_DIR}` : !(await findFunnels(FUNNELS_DIR)).has(FUNNEL) ? `${FUNNEL} missing` : '';
if (skipReason) console.warn(`capi e2e skipped: ${skipReason}`);

const PORTS = { edge: 8937, core: 8238, media: 8939, proxy: 8938, demo: 8941, admin: 8942, graph: 8943 };
const DB = 'ikf_capi_test';
const BASE = 'https://demo.test';
const ADMIN_USER = 'e2e-capi@ikameglobal.com';
const EMAIL = 'capi-buyer@demo.test';
const EMAIL_2 = 'capi-buyer-2@demo.test';
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const ulid = () => `01${Array.from({ length: 24 }, () => CROCKFORD[Math.floor(Math.random() * 32)]).join('')}`;
const sha256 = (s) => createHash('sha256').update(s).digest('hex');

// What the tunnel would deliver to the demo proxy: Host demo.test; the checkout carries the page's Origin and Referer.
const http = (method, path, body) =>
  new Promise((resolve, reject) => {
    const headers = {
      host: 'demo.test',
      ...(path.startsWith('/v1/checkout') && { origin: BASE, referer: `${BASE}/${FUNNEL}?utm_source=e2e#paywall`, 'user-agent': 'capi-e2e/1.0' }),
      ...(body !== undefined && { 'content-type': 'application/json' }),
    };
    const req = request({ host: '127.0.0.1', port: PORTS.proxy, method, path, headers }, (res) => {
      let text = '';
      res.on('data', (c) => { text += c; });
      res.on('end', () => resolve({ status: res.statusCode, json: text ? JSON.parse(text) : null }));
    });
    req.on('error', reject);
    req.end(body === undefined ? undefined : JSON.stringify(body));
  });
const core = (method, path, body) =>
  fetch(`http://127.0.0.1:${PORTS.core}${path}`, {
    method, headers: { authorization: `Bearer ${DEMO_TOKEN}`, 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body),
  }).then(async (r) => ({ status: r.status, json: await r.json() }));
const graph = (method, path, body) =>
  fetch(`http://127.0.0.1:${PORTS.graph}${path}`, {
    method, headers: { 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body),
  }).then(async (r) => ({ status: r.status, json: await r.json() }));
const until = async (fn, ms) => {
  for (const end = Date.now() + ms; Date.now() < end; await new Promise((r) => setTimeout(r, 250))) {
    const v = await fn();
    if (v) return v;
  }
  return fn();
};
// Every event the fake Graph received, in order, with the request it came in.
const graphEvents = async () => (await graph('GET', '/__requests')).json.flatMap((r) => r.body.data.map((e) => ({ ...e, request: r })));

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

async function dropDb() {
  await ensureDocker();
  await composeUp();
  const admin = new pg.Client(PG);
  await admin.connect();
  try {
    await admin.query(`DROP DATABASE IF EXISTS ${DB} WITH (FORCE)`);
  } finally {
    await admin.end();
  }
}

describe.skipIf(skipReason)('conversions relay (Meta CAPI) e2e', () => {
  it('purchase + renewal → 2 Purchase at the fake Graph, sent in the console; Graph errors → dead; Gửi lại → sent', async () => {
    await dropDb();
    stack = await startStack({
      funnels: [FUNNEL], ports: PORTS, lan: false, pgDatabase: DB, chDatabase: DB, purchase: { base: BASE }, logStream,
      adminUser: ADMIN_USER, adminBuildDir: new URL('../.build/capi/', import.meta.url).pathname, conversionsMs: 300,
    });
    pool = new pg.Pool({ ...PG, database: DB, max: 2 });
    expect(stack.purchase).toMatchObject({ app: APP, conversions: `/apps/${APP}/conversions` });
    expect(stack.graph).toMatchObject({ url: `http://127.0.0.1:${PORTS.graph}` });

    // The seed: Starlyn has the demo token (last 4 only) and test code; its funnel has a pixel.
    expect((await core('GET', `/v1/apps/${APP}/capi`)).json).toMatchObject({
      token_last4: DEMO_CAPI_TOKEN.slice(-4), test_code: DEMO_CAPI_TEST_CODE, pixel_funnels_without_token: 0,
    });
    expect((await pool.query('SELECT pixel_id FROM funnels WHERE slug = $1', [FUNNEL])).rows[0].pixel_id).toBe(DEMO_CAPI_PIXEL);

    // 1. A purchase (fake Paddle) and its renewal (subscription_recurring).
    const v = (await core('GET', `/v1/funnels/${FUNNEL}`)).json.versions[0].v;
    const buy = async (email) => {
      const created = await http('POST', '/v1/checkout', {
        funnel: FUNNEL, v, plan: '1w', sid: ulid(), email, attribution: { fbclid: 'IwAR-e2e', ads_consent: 'granted' }, turnstile_token: 'XXXX.DUMMY.TOKEN.XXXX',
      });
      expect(created.status).toBe(201);
      const paid = await stack.purchase.paddle.pay(created.json.transaction_id, email);
      return paid;
    };
    const first = await buy(EMAIL);
    const renewal = await stack.purchase.paddle.renew(first.subscription.id);
    expect(renewal.origin).toBe('subscription_recurring');
    const firstTxn = first.transaction.id;

    // 2. The fake Graph gets both as Purchase, event_id = Paddle transaction id, the test code and the token in the
    // JSON body (ruling C2), hashed email only.
    const sent = await until(async () => {
      const evs = await graphEvents();
      return evs.length >= 2 && evs;
    }, 30_000);
    expect(sent.map((e) => e.event_id).sort()).toEqual([firstTxn, renewal.id].sort());
    for (const e of sent) {
      expect(e).toMatchObject({ event_name: 'Purchase', custom_data: { currency: 'USD', value: 13.67 } });
      expect(e.user_data.em).toEqual([sha256(EMAIL)]);
      expect(e.request).toMatchObject({ pixel: DEMO_CAPI_PIXEL, body: { access_token: DEMO_CAPI_TOKEN, test_event_code: DEMO_CAPI_TEST_CODE } });
    }
    // The first purchase came from the funnel page (ruling C3: Referer without query/fragment).
    expect(sent.find((e) => e.event_id === firstTxn)).toMatchObject({ action_source: 'website', event_source_url: `${BASE}/${FUNNEL}` });
    expect(JSON.stringify((await graph('GET', '/__requests')).json)).not.toContain(EMAIL);
    await until(async () => (await pool.query("SELECT count(*)::int AS n FROM capi_events WHERE app_id = $1 AND status = 'sent'", [APP])).rows[0].n === 2, 10_000);

    // 3. The console: Conversions of starlyn, two rows, both sent.
    browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`${stack.adminUrl}/`);
    await page.getByRole('link', { name: 'Đăng nhập bằng Google' }).click();
    await page.getByRole('heading', { name: 'Dashboard' }).waitFor();
    await page.goto(`${stack.adminUrl}/apps/${APP}/conversions`);
    await page.getByRole('heading', { name: 'Conversions · Starlyn (demo)' }).waitFor();
    const rows = page.getByTestId('capi-row');
    await expect.poll(() => rows.count()).toBe(2);
    expect(await rows.filter({ hasText: 'sent' }).count()).toBe(2);
    await expect.poll(() => page.getByTestId('capi-counts').textContent()).toBe('pending 0 · sent 2 · skipped 0 · dead 0');

    // 4. The fake Graph fails: a new purchase is retried (backoff fast-forwarded here) until dead after 6 attempts.
    expect(await graph('POST', '/__mode', { mode: 'error500' })).toEqual({ status: 200, json: { mode: 'error500' } });
    const failed = (await buy(EMAIL_2)).transaction.id;
    const row = async () => (await pool.query('SELECT id, status, attempts, last_error FROM capi_events WHERE event_id = $1', [failed])).rows[0];
    const dead = await until(async () => {
      await pool.query("UPDATE capi_events SET next_attempt_at = now() WHERE event_id = $1 AND status = 'pending' AND attempts > 0", [failed]);
      const r = await row();
      return r?.status === 'dead' && r;
    }, 60_000);
    expect(dead).toMatchObject({ status: 'dead', attempts: 6, last_error: 'meta_2' });
    expect((await graphEvents()).filter((e) => e.event_id === failed)).toHaveLength(6);

    // 5. Graph ok again; "Gửi lại" in the console → sent.
    expect((await graph('POST', '/__mode', { mode: 'ok' })).status).toBe(200);
    await page.reload();
    const deadRow = rows.filter({ hasText: 'dead' });
    await expect.poll(() => deadRow.count()).toBe(1);
    expect(await deadRow.textContent()).toContain('meta_2');
    await deadRow.getByTestId('capi-resend').click();
    expect(await until(async () => (await row()).status === 'sent', 15_000)).toBe(true);
    await expect.poll(async () => {
      await page.reload();
      await rows.first().waitFor();
      return rows.filter({ hasText: 'sent' }).count();
    }, { timeout: 15_000 }).toBe(3);
    const after = (await graphEvents()).filter((e) => e.event_id === failed);
    expect(after.at(-1).request.mode).toBe('ok');
    expect(after.at(-1).user_data.em).toEqual([sha256(EMAIL_2)]);
    expect((await pool.query("SELECT details FROM audit_log WHERE action = 'capi.resend'")).rows).toEqual([{ details: { event_id: failed } }]);

    // Leak guard (spec §5): logs never hold an email, the token, the IP or the user-agent.
    expect(logs).toContain('"msg":"capi_send"');
    for (const secret of [EMAIL, EMAIL_2, DEMO_CAPI_TOKEN, 'capi-e2e/1.0', ADMIN_USER]) expect(logs).not.toContain(secret);
  });
});
```

`infra/stack/tests/stack.tftest.hcl` (sửa, áp dụng đúng diff này):

`infra/stack/tests/stack.tftest.hcl` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/infra/stack/tests/stack.tftest.hcl b/infra/stack/tests/stack.tftest.hcl
index e655e1a..78e0df9 100644
--- a/infra/stack/tests/stack.tftest.hcl
+++ b/infra/stack/tests/stack.tftest.hcl
@@ -266,6 +266,16 @@ run "identity_wiring" {
     error_message = "core-api may create, update and read only ikf/<env>/app-webhook/* secrets."
   }
 
+  assert {
+    condition = anytrue([for s in data.aws_iam_policy_document.task.statement : (
+      s.sid == "AppCapiSecrets" &&
+      length(setsubtract(["secretsmanager:CreateSecret", "secretsmanager:PutSecretValue", "secretsmanager:GetSecretValue"], s.actions)) == 0 &&
+      length(setsubtract(s.actions, ["secretsmanager:CreateSecret", "secretsmanager:PutSecretValue", "secretsmanager:GetSecretValue"])) == 0 &&
+      length(s.resources) == 1 && contains(s.resources, "arn:aws:secretsmanager:us-east-1:111111111111:secret:ikf/prod/app-capi/*")
+    )])
+    error_message = "core-api may create, update and read (never delete) only ikf/<env>/app-capi/* secrets (ruling C1)."
+  }
+
   assert {
     condition     = anytrue([for s in data.aws_iam_policy_document.task.statement : s.sid == "Email" && contains(s.actions, "ses:SendEmail")]) && local.core_environment["MAIL_FROM"] == "no-reply@mail.ikf.example"
     error_message = "core-api sends claim and OTP emails through SES from no-reply@mail.<zone>."
PATCH
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

```bash
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock
export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock
npx vitest run --config demo/vitest.config.mjs test/fake-graph.test.mjs test/capi-e2e.test.mjs
export TF_PLUGIN_CACHE_DIR=$HOME/.terraform.d/plugin-cache
(cd infra/stack && terraform init -backend=false >/dev/null && terraform test)
```

Expected: vitest `Test Files  2 failed (2)`, `Tests  1 failed (1)`: `fake-graph.test.mjs` fail vì `Cannot find module '../lib/fake-graph.mjs'`; `× conversions relay (Meta CAPI) e2e > purchase + renewal → …` fail ở `AssertionError: expected undefined to match object { url: 'http://127.0.0.1:8943' }` (stack chưa có `graph`). Terraform `Failure! 12 passed, 1 failed.`: run `identity_wiring` fail với "core-api may create, update and read (never delete) only ikf/<env>/app-capi/* secrets (ruling C1)." Chạy riêng, không có `npm run demo:test` nào khác (port cố định); demo khác trên 8080/8787/8790/8792 không bị đụng.

- [ ] **Step 3: Implement**

`demo/lib/fake-graph.mjs` (mới):

`demo/lib/fake-graph.mjs` (mới):

```js
// A Meta Graph API stand-in for the demo's conversions relay (spec conversions-relay §5 "Demo"): the relay POSTs
// `<graphUrl>/<pixel>/events` with a JSON body (ruling C2); this server records each request and answers like Meta
// would in the current mode. Control endpoints (never on Meta): POST /__mode {mode}, GET /__requests.
// Listens on 127.0.0.1 only: the recorded bodies hold the demo's (non-secret) token and hashed customer data.
import { createServer } from 'node:http';

export const GRAPH_MODES = ['ok', 'error500', 'token_invalid'];
const EVENTS_PATH = /^\/(?:v\d+\.\d+\/)?([^/]+)\/events$/;
const MAX_BODY = 1024 * 1024;

// What Meta answers: ok → events_received; error500 → a transient error (code 2, retried); token_invalid → 401 with
// OAuthException code 190 (the relay marks the group dead and raises capi_token_invalid, ruling C4).
const ANSWERS = {
  ok: (events) => [200, { events_received: events, messages: [], fbtrace_id: 'fake' }],
  error500: () => [500, { error: { message: 'fake graph: error500', type: 'OAuthException', code: 2, fbtrace_id: 'fake' } }],
  token_invalid: () => [401, { error: { message: 'fake graph: token_invalid', type: 'OAuthException', code: 190, fbtrace_id: 'fake' } }],
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) req.destroy(new Error('body too large'));
      else chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });

// → {port, url, mode(), setMode(mode), requests(), close()}. `url` is the origin; the relay's graphUrl is `${url}/v21.0`.
export async function startFakeGraph({ port = 0, host = '127.0.0.1', mode: initial = 'ok' } = {}) {
  if (!GRAPH_MODES.includes(initial)) throw new Error(`unknown fake graph mode ${initial}`);
  let mode = initial;
  const recorded = [];
  const send = (res, status, body) => {
    res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' }).end(JSON.stringify(body));
  };

  const server = createServer(async (req, res) => {
    const path = req.url.split('?')[0];
    try {
      if (req.method === 'GET' && path === '/__requests') return send(res, 200, recorded);
      if (req.method === 'POST' && path === '/__mode') {
        let next = null;
        try {
          next = JSON.parse(await readBody(req)).mode;
        } catch {
          // reported below
        }
        if (!GRAPH_MODES.includes(next)) return send(res, 400, { error: 'bad_mode', modes: GRAPH_MODES });
        mode = next;
        return send(res, 200, { mode });
      }
      const m = req.method === 'POST' ? EVENTS_PATH.exec(path) : null;
      if (!m) return send(res, 404, { error: { message: 'unknown path', code: 803 } });
      let body = null;
      try {
        body = JSON.parse(await readBody(req));
      } catch {
        return send(res, 400, { error: { message: 'body is not JSON', code: 100 } });
      }
      recorded.push({ pixel: decodeURIComponent(m[1]), mode, body });
      const [status, answer] = ANSWERS[mode](Array.isArray(body?.data) ? body.data.length : 0);
      return send(res, status, answer);
    } catch {
      if (!res.headersSent) send(res, 500, { error: { message: 'fake graph failed', code: 1 } });
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, resolve);
  });
  const bound = server.address().port;
  return {
    port: bound,
    url: `http://${host}:${bound}`,
    mode: () => mode,
    setMode(next) {
      if (!GRAPH_MODES.includes(next)) throw new Error(`unknown fake graph mode ${next}`);
      mode = next;
    },
    requests: () => structuredClone(recorded),
    close: () => new Promise((resolve) => {
      server.closeAllConnections();
      server.close(() => resolve());
    }),
  };
}
```

`demo/lib/seed.mjs`, `demo/lib/stack.mjs`, `demo/run.mjs` (sửa, áp dụng đúng diff này):

`demo/lib/seed.mjs`, `demo/lib/stack.mjs`, `demo/run.mjs` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/demo/lib/seed.mjs b/demo/lib/seed.mjs
index d8ff1de..9f39f26 100644
--- a/demo/lib/seed.mjs
+++ b/demo/lib/seed.mjs
@@ -58,3 +58,18 @@ export async function seedPurchase({ request, funnel }) {
   });
   return appFor(funnel);
 }
+
+// Spec conversions-relay §5 "Demo": the purchase app's Meta CAPI token (not a secret: it only ever reaches the fake
+// Graph API) and test code, set through core's own API (as `ikf capi token set` / `ikf capi test-code` do), and a
+// pixel on the purchase funnel. Without --pixel the pixel id goes straight into funnels.pixel_id, not through
+// PUT /v1/funnels/:slug: the relay reads that column, while the funnel page (whose route doc is not re-synced) loads no
+// Meta Pixel, so the browser sends nothing to Meta. With --pixel publishFunnels already set that real id.
+export const DEMO_CAPI_TOKEN = 'EAAdemo_capi_token_not_a_secret_0000';
+export const DEMO_CAPI_TEST_CODE = 'TEST12345';
+export const DEMO_CAPI_PIXEL = '100000000000001';
+
+export async function seedCapi({ request, pool, app, funnel, pixel = null }) {
+  await caller(request)('PUT', `/v1/apps/${app}/capi`, { token: DEMO_CAPI_TOKEN, test_code: DEMO_CAPI_TEST_CODE });
+  if (!pixel) await pool.query('UPDATE funnels SET pixel_id = $2 WHERE slug = $1', [funnel, DEMO_CAPI_PIXEL]);
+  return pixel ?? DEMO_CAPI_PIXEL;
+}
diff --git a/demo/lib/stack.mjs b/demo/lib/stack.mjs
index 2751b1f..1c4c1c7 100644
--- a/demo/lib/stack.mjs
+++ b/demo/lib/stack.mjs
@@ -7,20 +7,27 @@ import pg from 'pg';
 import { buildApp } from '../../services/core-api/src/app.js';
 import { createClickhouse } from '../../services/core-api/src/analytics/clickhouse.js';
 import { ensureToken } from '../../services/core-api/src/auth.js';
+import { startConversions } from '../../services/core-api/src/conversions/relay.js';
+import { cachedTokenStore, memoryTokenStore } from '../../services/core-api/src/conversions/store.js';
 import { migrate } from '../../services/core-api/src/db/migrate.js';
 import { miniflareKv, miniflareStore } from './adapters.mjs';
 import { ADMIN_BUILD_DIR, buildAdmin, seedSupportUser, startAdminServer } from './admin.mjs';
 import { checkPortsFree, composeUp, DemoError, ensureDocker } from './docker.mjs';
+import { startFakeGraph } from './fake-graph.mjs';
 import { DEFAULT_FUNNELS, DEFAULT_FUNNELS_DIR, findFunnels, pickFunnels, publishFunnels } from './funnels.mjs';
 import { startMediaServer } from './media.mjs';
 import { startDemoServer } from '../server/index.mjs';
 import { startMiniflare } from './miniflare.mjs';
 import { startProxy } from './proxy.mjs';
 import { jsonLog, memorySecrets, purchaseDeps, startPurchaseWorkers } from './purchase.mjs';
-import { coreRequest, ensureApps, seedPurchase } from './seed.mjs';
+import { coreRequest, ensureApps, seedCapi, seedPurchase } from './seed.mjs';
 
 export const DEMO_TOKEN = 'ikf_demo_admin';
-export const PORTS = { edge: 8787, core: 8080, media: 8790, proxy: 8788, demo: 8791, admin: 8792 };
+export const PORTS = { edge: 8787, core: 8080, media: 8790, proxy: 8788, demo: 8791, admin: 8792, graph: 8793 };
+// The conversions relay (spec conversions-relay §5 "Demo") runs only with the purchase flow and a ports.graph (the
+// fake Graph API's port); seedCapi (seed.mjs) gives the purchase funnel's app a token and test code, its funnel a pixel.
+// The Graph version core uses by default (config.js META_GRAPH_URL); the fake Graph accepts any.
+const GRAPH_VERSION = 'v21.0';
 // With the admin console: a funnel host it can publish to (core's API needs a dotted host; browsers send
 // *.localhost to this machine).
 export const ADMIN_DEMO_HOST = 'demo.localhost';
@@ -106,14 +113,18 @@ export async function startStack({
   // Email of the admin console's local admin (signs in without Google): serves the SPA on ports.admin.
   adminUser = null,
   adminBuildDir = ADMIN_BUILD_DIR,
+  // The relay's enqueue and send interval (production: 15 s / 10 s); the e2e makes it shorter.
+  conversionsMs = 1000,
 } = {}) {
   ident(pgDatabase, 'Postgres database');
   ident(chDatabase, 'ClickHouse database');
   const chosen = pickFunnels(await findFunnels(funnelsDir), funnels);
+  const capi = Boolean(purchase && ports.graph);
   await checkPortsFree({
     [ports.edge]: 'edge-router (Miniflare)', [ports.core]: 'core-api', [ports.media]: 'media server',
     ...(purchase && { [ports.proxy]: 'demo proxy', [ports.demo]: 'demo server' }),
     ...(adminUser && { [ports.admin]: 'admin console' }),
+    ...(capi && { [ports.graph]: 'fake Graph API' }),
   });
   await ensureDocker();
   await composeUp();
@@ -168,18 +179,34 @@ export async function startStack({
     const admin = adminUser ? { admin: { appEnv: 'local', origin: adminOrigin, localUser: adminUser } } : {};
     // The dashboard reads the demo's ClickHouse as core-api does in production (spec admin-console-p3 §2).
     const analytics = { clickhouse: createClickhouse({ url: CH.url, user: CH.user, password: CH.password, database: chDatabase }) };
+    // Spec conversions-relay §5: the per-app CAPI tokens in memory (Secrets Manager in production) behind the same
+    // cache core uses, so PUT /v1/apps/:id/capi works; the relay posts to the fake Graph API instead of Meta.
+    let graph = null;
+    let conversions = {};
+    if (capi) {
+      graph = await startFakeGraph({ port: ports.graph });
+      stops.push(() => graph.close());
+      conversions = { capiTokens: cachedTokenStore(memoryTokenStore()) };
+    }
     const app = buildApp({
       logger: logStream ? { level: 'info', stream: logStream } : verbose,
       checks: { db: () => pool.query('select 1') },
       deps: {
         pool, store, kv, mediaOrigins: [mediaBase], previewBaseUrl: `http://preview.localhost:${ports.edge}`,
-        webhookSecrets: memorySecrets(), ...shop?.deps, ...admin, ...analytics,
+        webhookSecrets: memorySecrets(), ...shop?.deps, ...admin, ...analytics, ...conversions,
       },
     });
     await app.listen({ host: '127.0.0.1', port: ports.core });
     stops.push(() => app.close());
     const coreUrl = `http://127.0.0.1:${app.server.address().port}`;
     if (shop) stops.push(startPurchaseWorkers({ pool, deps: shop.deps, log }));
+    // What server.js starts in production (Task 5's seam): enqueue + send + sweep, here every conversionsMs.
+    if (capi) {
+      stops.push(startConversions({
+        pool, tokens: conversions.capiTokens, graphUrl: `${graph.url}/${GRAPH_VERSION}`, alarm: shop.deps.alarm, log,
+        enqueueMs: conversionsMs, sendMs: conversionsMs,
+      }));
+    }
 
     // Spec admin-console-p4a §4: a funnel's first upload needs its app, so the apps come first, in every mode.
     // Without the purchase flow nothing serves the fake app page; the URLs only have to pass core's https check.
@@ -205,6 +232,7 @@ export async function startStack({
     if (shop) {
       const funnel = chosen[0].slug;
       const appId = await seedPurchase({ request: coreRequest(coreUrl, DEMO_TOKEN), funnel });
+      if (capi) await seedCapi({ request: coreRequest(coreUrl, DEMO_TOKEN), pool, app: appId, funnel, pixel });
       const demo = await startDemoServer({ port: ports.demo, paddle: shop.paddle, mailbox: shop.mailbox, funnel, app: appId });
       stops.push(() => demo.close());
       const proxy = await startProxy({ port: ports.proxy, ports: { core: ports.core, demo: ports.demo, media: ports.media, edge: ports.edge } });
@@ -212,6 +240,7 @@ export async function startStack({
       purchaseInfo = {
         base: purchase.base, host: purchaseHost, funnel, app: appId, url: `${purchase.base}/${funnel}`, panel: `${purchase.base}/_demo/`,
         paddle: shop.paddle, mailbox: shop.mailbox,
+        conversions: capi ? `/apps/${appId}/conversions` : null,
       };
     }
 
@@ -229,6 +258,7 @@ export async function startStack({
       adminUrl,
       adminUser,
       supportUser,
+      graph,
       pgDatabase,
       chDatabase,
       clickhouse: chRun,
diff --git a/demo/run.mjs b/demo/run.mjs
index c26d4ed..eb782f8 100644
--- a/demo/run.mjs
+++ b/demo/run.mjs
@@ -64,6 +64,10 @@ async function main() {
     console.log(`  Funnel:   ${p.url}   <- scan the QR with the phone`);
     console.log(`  Panel:    ${p.panel}   (refund / expire / renew)`);
     console.log(`  App:      ${p.base}/_demo/app (app ${p.app})   Inbox: ${p.base}/_demo/mail`);
+    if (stack.graph) {
+      // Spec conversions-relay §5: every Purchase (and renewal) goes to the fake Graph API, never to Meta.
+      console.log(`  CAPI:     ${stack.adminUrl ? `${stack.adminUrl}${p.conversions}` : `${p.conversions} (admin console off)`}   fake Graph: ${stack.graph.url}/__requests`);
+    }
     if (tunnel) console.log('  A new tunnel can take up to a minute to answer; the URL changes on every run.');
     console.log('');
   }
PATCH
```

`infra/stack/main.tf` (sửa, áp dụng đúng diff này):

`infra/stack/main.tf` (sửa, áp dụng đúng diff này):

```bash
git apply <<'PATCH'
diff --git a/infra/stack/main.tf b/infra/stack/main.tf
index 4a2f563..b255cfe 100644
--- a/infra/stack/main.tf
+++ b/infra/stack/main.tf
@@ -136,6 +136,13 @@ data "aws_iam_policy_document" "task" {
     actions   = ["secretsmanager:CreateSecret", "secretsmanager:PutSecretValue", "secretsmanager:GetSecretValue"]
     resources = ["arn:aws:secretsmanager:${var.region}:${data.aws_caller_identity.current.account_id}:secret:ikf/${var.env}/app-webhook/*"]
   }
+  # Per-app Meta CAPI tokens (spec conversions-relay §5, rulings C1/C6): set and read by core; a removed token is
+  # overwritten with "cleared", never deleted (a deleted name stays blocked for the recovery window), so no DeleteSecret.
+  statement {
+    sid       = "AppCapiSecrets"
+    actions   = ["secretsmanager:CreateSecret", "secretsmanager:PutSecretValue", "secretsmanager:GetSecretValue"]
+    resources = ["arn:aws:secretsmanager:${var.region}:${data.aws_caller_identity.current.account_id}:secret:ikf/${var.env}/app-capi/*"]
+  }
   statement {
     sid       = "Email"
     actions   = ["ses:SendEmail"]
PATCH
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

```bash
npx vitest run --config demo/vitest.config.mjs test/fake-graph.test.mjs test/capi-e2e.test.mjs
(cd infra/stack && terraform test)
terraform fmt -check -recursive infra
npm run demo:test 2>&1 | grep -E "Test Files|Tests  "
```

Expected: `Tests  4 passed (4)` (e2e ~8 s); terraform `Success! 13 passed, 0 failed.`, fmt không in gì; toàn bộ demo `Test Files  26 passed (26)`, `Tests  137 passed (137)` (trước: 24 files, 133).

- [ ] **Step 5: Docs**

`docs/runbooks/admin-console.md` (§15 Meta CAPI), `demo/README.md`, `CLAUDE.md` (sửa, áp dụng đúng diff này):

`docs/runbooks/admin-console.md`, `demo/README.md`, `CLAUDE.md` (sửa, áp dụng đúng diff này):

````bash
git apply <<'PATCH'
diff --git a/CLAUDE.md b/CLAUDE.md
index 42a2abd..6def135 100644
--- a/CLAUDE.md
+++ b/CLAUDE.md
@@ -79,4 +79,4 @@ Work follows spec → plan → TDD tasks (superpowers skills), one reviewed task
 
 ## Local demo
 
-`npm run demo` runs real funnels locally (Miniflare edge-router + event-consumer, core-api in-process, Postgres + ClickHouse in Docker, compose project `ikf-demo`), plus the admin console at `http://localhost:8792` (local admin from `--admin-user`, default `demo@ikameglobal.com`; publish to `demo.localhost`; the local admin is global; a `support@ikameglobal.com` user is seeded with no default role and `support` in `starlyn` only; prices and customers need the purchase flow: `npm run demo -- --purchase --host https://… --admin-user <email>`; the Dashboard reads the demo's ClickHouse, `npm run demo:events -- --seed` adds 3 days of sample data; three sample apps `starlyn` ← `moon-reading`, `calmio` ← `calmio-calm-kids`, `ewa` ← `ewa-books`, any other funnel in app `demo`, made through the API at every start; uploads carry `app_id`, demo hosts stay shared; `demo:purchase` uses the first funnel's app). Scripts: `npm run demo`, `npm run demo:events`, `npm run demo:purchase` (full purchase flow on a phone: fake Paddle/Turnstile/SES, quick tunnel + QR), `npm run demo:down` (`-- --reset` wipes data), `npm run demo:test` (never two at once: fixed ports). Options, ports and troubleshooting: `demo/README.md`. Code in `demo/` only; it must not change `services/`, `workers/` or `packages/`, except the sanctioned `PADDLE_JS_URL` → `__IKF.paddle.js` hook (edge-router emits it only for `https://` values, the SDK loads only `https:`, and `workers/edge-router/scripts/deploy-config.js` refuses the variable so it never reaches a deployed Worker). Fakes are injected only through `buildApp({deps})` from `demo/lib/purchase.mjs`; nothing in `services/` or `workers/` reads a demo flag.
+`npm run demo` runs real funnels locally (Miniflare edge-router + event-consumer, core-api in-process, Postgres + ClickHouse in Docker, compose project `ikf-demo`), plus the admin console at `http://localhost:8792` (local admin from `--admin-user`, default `demo@ikameglobal.com`; publish to `demo.localhost`; the local admin is global; a `support@ikameglobal.com` user is seeded with no default role and `support` in `starlyn` only; prices and customers need the purchase flow: `npm run demo -- --purchase --host https://… --admin-user <email>`; the Dashboard reads the demo's ClickHouse, `npm run demo:events -- --seed` adds 3 days of sample data; three sample apps `starlyn` ← `moon-reading`, `calmio` ← `calmio-calm-kids`, `ewa` ← `ewa-books`, any other funnel in app `demo`, made through the API at every start; uploads carry `app_id`, demo hosts stay shared; `demo:purchase` uses the first funnel's app; with the purchase flow the conversions relay posts to a fake Graph API on 127.0.0.1:8793 (`demo/lib/fake-graph.mjs`: `GET /__requests`, `POST /__mode {ok|error500|token_invalid}`) and the purchase app gets a demo CAPI token + test code `TEST12345`, its funnel a pixel; e2e `demo/test/capi-e2e.test.mjs` on ports 8937/8238/8939/8938/8941/8942 + fake Graph 8943, database `ikf_capi_test`). Scripts: `npm run demo`, `npm run demo:events`, `npm run demo:purchase` (full purchase flow on a phone: fake Paddle/Turnstile/SES, quick tunnel + QR), `npm run demo:down` (`-- --reset` wipes data), `npm run demo:test` (never two at once: fixed ports). Options, ports and troubleshooting: `demo/README.md`. Code in `demo/` only; it must not change `services/`, `workers/` or `packages/`, except the sanctioned `PADDLE_JS_URL` → `__IKF.paddle.js` hook (edge-router emits it only for `https://` values, the SDK loads only `https:`, and `workers/edge-router/scripts/deploy-config.js` refuses the variable so it never reaches a deployed Worker). Fakes are injected only through `buildApp({deps})` from `demo/lib/purchase.mjs`; nothing in `services/` or `workers/` reads a demo flag.
diff --git a/demo/README.md b/demo/README.md
index ede19b0..e65b9a1 100644
--- a/demo/README.md
+++ b/demo/README.md
@@ -121,6 +121,30 @@ person sees only Calmio, no menu across apps, Starlyn "not found", Upload locked
 and `/customers` is not in their menu (ports 8917/8218/8919/8918/8921/8922, database `ikf_admin_p4b_test`, dropped
 at the start of each run).
 
+Meta CAPI (spec conversions-relay): with the purchase flow the demo runs the conversions relay (enqueue + send every
+second) against a **fake Graph API** on `http://127.0.0.1:8793` (`demo/lib/fake-graph.mjs`), never against Meta. At
+start the purchase funnel's app gets a demo token (`EAAdemo_capi_token_not_a_secret_0000`, last 4 `0000`) and test code
+`TEST12345` through `PUT /v1/apps/:id/capi`, and its funnel the pixel `100000000000001` (written to the database only,
+so the funnel page loads no Meta Pixel; with `--pixel <id>` that id is used instead). Buy once (and press **Renew** in
+the control panel for a renewal), then:
+
+- the console: the app › **Conversions** (`http://localhost:8792/apps/<app>/conversions`; `<app>` = `demo` for
+  `witch-power`, `starlyn` for `--funnel moon-reading`) shows each Purchase as `sent`; the app › Cài đặt › **Meta
+  CAPI** shows the token's last 4 and the test code. `run.mjs` prints the exact link on the `CAPI:` line.
+- what "Meta" received: `curl -s http://127.0.0.1:8793/__requests` (each request: `pixel`, `mode`, the JSON `body`
+  with `data[]`, `access_token`, `test_event_code`; the email only as a sha256 in `user_data.em`).
+- failures: `curl -s -XPOST http://127.0.0.1:8793/__mode -d '{"mode":"error500"}'` (Meta down: retried with backoff,
+  `dead` after 6 tries; the demo keeps the production backoff of 1 m, 5 m, 30 m, 2 h, 6 h) or
+  `{"mode":"token_invalid"}` (401, code 190: `dead` at once and alarm `capi_token_invalid:<app>` in the log);
+  `{"mode":"ok"}` back, then **Gửi lại** on a dead row (or `ikf capi resend <id>`).
+- CLI: `IKF_API=http://127.0.0.1:8080 IKF_TOKEN=ikf_demo_admin npx ikf capi status --app <app>`.
+
+`npm run demo:test` includes `test/capi-e2e.test.mjs` (`moon-reading` → Starlyn, checkout through the API): a purchase
+and its renewal → the fake Graph gets 2 `Purchase` with `event_id` = the Paddle transaction ids and no raw email →
+the Conversions page of `starlyn` shows 2 × `sent` → fake Graph `error500`, a new purchase → `dead` after 6 tries (the
+test moves `next_attempt_at` forward in SQL) → `ok`, **Gửi lại** → `sent` (ports 8937/8238/8939/8938/8941/8942, fake
+Graph 8943, database `ikf_capi_test`, dropped at the start of each run). `test/fake-graph.test.mjs` covers the modes.
+
 ## Full purchase flow (`npm run demo:purchase`)
 
 Buy on a real funnel from your phone, open the "app", see **PRO**; refund from the control panel, see **FREE**.
@@ -154,6 +178,7 @@ npm run demo:purchase          # prints an https://<words>.trycloudflare.com URL
 |---|---|
 | 8788 (all interfaces) | demo proxy, the tunnel's origin: `/v1/*` → core-api (except requests with an `Authorization` header: 403, the admin API is only on 127.0.0.1:8080; `/v1/auth/*`, `/v1/admin/*` and any request with the admin session cookie: 403 `{error:'forbidden'}`), `/_demo/*` → demo server, `/_media/*` → media, the rest → edge-router |
 | 8791 (127.0.0.1) | demo server: fake Paddle.js and its endpoints, fake app, inbox, control panel |
+| 8793 (127.0.0.1) | fake Graph API for the conversions relay: `POST /<version>/<pixel>/events`, `GET /__requests`, `POST /__mode {mode: ok\|error500\|token_invalid}` |
 
 Paddle state lives in memory: after a restart the panel is empty while Postgres still has the old checkouts and
 entitlements (the seed is idempotent). `npm run demo:down -- --reset` starts clean. `npm run demo:test` includes a
diff --git a/docs/runbooks/admin-console.md b/docs/runbooks/admin-console.md
index 40cfe5b..b3af894 100644
--- a/docs/runbooks/admin-console.md
+++ b/docs/runbooks/admin-console.md
@@ -211,3 +211,56 @@ Last-global rule: at least one enabled global admin always remains. Turning off
 → `409 last_global_admin` ("Phải còn ít nhất một global admin"); nobody drops their own global flag, demotes or
 disables themselves (`409 cannot_lock_self`): ask another global admin. Before someone global leaves, make a
 successor global first (`ikf admin global <email> on`), then disable them (§8).
+
+## 15. Meta CAPI
+
+Spec: `ifunnel/docs/specs/2026-10-16-conversions-relay-capi-design.md` (ikame repo). core-api sends every paid
+transaction (first purchase and each renewal) of a funnel with a Meta Pixel as a server `Purchase` to the Conversions
+API, `event_id` = the Paddle transaction id. One token per app, kept in Secrets Manager at `ikf/<env>/app-capi/<app>`;
+the console and the CLI only ever show its last 4 characters.
+
+**Rollout (once per env).** `terraform apply` (workflow `infra`, the user runs it) gives the core-api task
+`CreateSecret` / `PutSecretValue` / `GetSecretValue` on `ikf/<env>/app-capi/*`, no `DeleteSecret`: removing a token
+overwrites the secret with `cleared` (a deleted name stays blocked for the 7-day recovery window). Deploy core-api with
+migration 009. `META_GRAPH_URL` defaults to `https://graph.facebook.com/v21.0`; set it only to change the Graph
+version. The log must not say `conversions disabled, missing: …` (that means `SECRETS_PREFIX` is unset; the
+console's Meta CAPI card then answers `503 capi_unavailable`).
+
+**1. Token (Business Manager, per app).** Business settings › Users › System users: add (or reuse) a system user
+`ikf-capi-<app>`, role Employee. Add assets › Pixels (Datasets): every pixel of the app's funnels, permission
+**Manage** (full control). Generate new token: the business's app, expiry **Never**, permissions
+`ads_management` and `business_management`. Copy the token once; it never goes into git, a shell history or a chat.
+(Events Manager › the pixel › Settings › Conversions API › Generate access token makes the same kind of token for one
+pixel.)
+
+**2. Enter it.** From a terminal with an admin session or token (`IKF_API`, `IKF_TOKEN`), without echoing it into the
+history (`read -rs TOKEN`, paste, Enter):
+
+```bash
+read -rs TOKEN && echo "$TOKEN" | ikf capi token set <app>; unset TOKEN
+```
+
+or the console: the app › Cài đặt › **Meta CAPI** › Token › **Lưu token** (admin in the app). Purchases of the last 7 days
+that waited with `no_token` are queued again at once.
+
+**3. Test.** Events Manager › the pixel › Test Events: copy the test code (`TEST…`), then
+`ikf capi test-code <app> TEST12345` (or the Test code field of the card). Buy once on a staging funnel of the app
+(Paddle sandbox). Within a minute Test Events shows a **Server** `Purchase` with the value, currency and `event_id`
+= the Paddle transaction id (`txn_…`); `ikf capi status --app <app>` shows it as `sent`.
+
+**4. Remove the test code** before real traffic, or every Purchase lands in Test Events only:
+`ikf capi test-code <app> off`.
+
+**5. Watch.** `ikf capi status --app <app>` (24 h counts per status, last dead events) or the app › **Conversions**
+(filter `dead`). The Tổng quan page warns when the app has funnels with a pixel but no token, and when Purchases died
+in the last 24 h.
+
+| Seen | Meaning | Do |
+|---|---|---|
+| alarm `capi_token_invalid:<app>`, events `dead` with `meta_190`, `meta_10`, `meta_200`, `http_401`, `http_403` | token revoked/expired or the system user lost the pixel | new token (step 1), `ikf capi token set <app>`, then resend the dead ones |
+| `dead` with `http_5xx`, `meta_2`, `network` after 6 tries | Meta down for hours | `ikf capi resend <id>` (or **Gửi lại**) once Meta is back |
+| `dead` with another `meta_<code>` | Meta refused the event (e.g. bad pixel id) | fix the funnel's pixel, then resend |
+| `skipped` `no_pixel` / `no_token` / `no_consent` / `too_old` | nothing to send by design | `no_token`: step 2 revives the last 7 days |
+
+Turn it off for an app: `ikf capi token clear <app>` (console: **Xoá token**); new Purchases are then skipped with
+`no_token`. Every change is in Audit (`app.capi_token` with the last 4 only, `app.capi_test_code`, `capi.resend`).
PATCH
````

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md demo/README.md demo/lib/fake-graph.mjs demo/lib/seed.mjs demo/lib/stack.mjs demo/run.mjs demo/test/capi-e2e.test.mjs demo/test/fake-graph.test.mjs docs/runbooks/admin-console.md infra/stack/main.tf infra/stack/tests/stack.tftest.hcl
git commit -m "feat(demo): fake Graph API and CAPI e2e; IAM for app-capi secrets; runbook"
```

---

---

### Task 10: Chạy lại toàn nhánh

**Files:** — (chỉ kiểm tra)

- [ ] **Step 1: Toàn bộ workspace + demo**

```bash
npm test -w @ikf/paddle -w @ikf/event-schema -w @ikf/funnel-lint -w @ikf/sdk -w @ikf/cli -w @ikf/edge-router -w @ikf/event-consumer -w @ikf/core-api -w @ikf/route-match -w @ikf/admin 2>&1 | grep -E "Test Files|Tests  |bytes gzip"
npm run build -w @ikf/admin 2>&1 | tail -3
npm run demo:test 2>&1 | grep -E "Test Files|Tests  "
git status --short
```

Expected: paddle 34, event-schema 145, funnel-lint 35, sdk **163** (11 file), cli **274** (25 file), edge-router 106 (7 file, `ikf sdk 00fafbb5699c: 8183 bytes gzip`), event-consumer 8 + 27, core-api **781** (81 file), route-match 35, admin **271** (30 file), build OK; demo **137** (26 file); `git status` sạch. Không còn tiến trình nào của mình nghe trên cổng e2e (`lsof -nP -iTCP -sTCP:LISTEN`); demo của worktree `-admin-p3` (8080/8787/8790/8792) vẫn chạy, không đụng.

- [ ] **Step 2: Review toàn nhánh** (superpowers:requesting-code-review) trước PR vào `feat/admin-console-p4b` (PR #11). PR body kết thúc bằng dòng attribution Claude Code.

---

## Theo sau (thủ công, ngoài phạm vi plan này)

1. **Sau khi deploy 009**: chạy `terraform apply` cho IAM `app-capi/*` (người vận hành), rồi với mỗi app: tạo token system-user trong Business Manager (gán pixel của app), `echo "$TOKEN" | ikf capi token set <app>`, đặt test code, kiểm Events Manager › Test Events, bỏ test code, theo dõi `ikf capi status --app <app>`.
2. **Funnel chưa có pixel / chưa gán app**: sự kiện bị `skipped`; gán pixel/app rồi các lần thu tiền sau sẽ gửi (không gửi bù sự kiện cũ ngoài `no_token`).
3. **Adjust S2S**: đợt sau, cần adid trong hợp đồng claim với team mobile.
4. **Ngoài phạm vi spec** (StartTrial/Lead từ server, refund sang Meta, Purchase phía browser, pLTV, token theo pixel) — không có task.

---

## Self-Review

**Spec coverage:**

| Spec | Task |
|---|---|
| Điều kiện xong: demo mua + gia hạn → 2 `Purchase`, Conversions `sent`, fake lỗi → `dead`, "Gửi lại" → `sent` | 9 (`capi-e2e.test.mjs`), 5, 6, 8 |
| Điều kiện xong: hai worker không gửi trùng; mỗi `payment.succeeded` 7 ngày → một dòng | 4 (enqueue song song), 5 (send song song) |
| Điều kiện xong: không email thô, log/audit không PII/token | 3 (body), 5 (log), 6 (response + audit), 7 (CLI), 8 (DOM) |
| Quyết định 1–2 (chỉ CAPI, mọi lần thu tiền) | 4 (chỉ `payment.succeeded`), 3 (`Purchase`) |
| Quyết định 3 (token theo app, Secrets Manager) | 5 (`store.js`), 6 (PUT), 9 (IAM) |
| Quyết định 4–5 (bảng `capi_events`, anti-join 7 ngày) | 1, 4 |
| Quyết định 6 (consent) | 1 (checkout), 2 (SDK), 4 (`no_consent`) |
| Quyết định 7 (IP/UA 30 ngày) | 1 (lưu), 4 (sweep), 5 (tick hằng giờ) |
| §2 claim 2 phút, gọi ngoài transaction, 50/request, backoff, lỗi token | 5 |
| §2 nhập token → mở lại `no_token` | 4 (`reviveNoToken`), 6 |
| §4 route, summary, SPA, CLI | 6, 8, 7 |
| §5 config, Terraform, demo, runbook | 5 (config), 9 |

**Placeholder:** không có "TBD"/"tương tự Task N". Mọi khối code và patch sinh từ commit của cây scratch đã chạy test (Node 26, colima, 2026-10-16). Khi thực thi, controller so khớp tree sau mỗi task với commit scratch tương ứng (`git diff --stat <scratch-commit> HEAD` chỉ được khác `package-lock.json`/artefact). Không chạy được ở đây: Graph API thật, Secrets Manager thật.

**Nhất quán tên:** `buildEvent/buildBody/classify/retryDelay/toValue/hashEmail/externalId` (Task 3) ← `send` (Task 5); `enqueue/checkoutFor/sweepClientData/reviveNoToken` (Task 4) ← Task 5, 6; `capiTokenStore/memoryTokenStore/cachedTokenStore` + `startConversions/conversionsDeps` (Task 5) ← `server.js`, demo (Task 9), route PUT (Task 6); lỗi `invalid_token`, `invalid_test_code`, `not_dead`, `capi_unavailable`, `app_required`, `app_not_found`, `capi_event_not_found` cùng tên ở server (6), CLI (7), SPA (8); `data-testid` (8) = e2e (9).

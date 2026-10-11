# Demo Purchase — Design Spec

> Tooling cho repo `thinhdd-ikame/ikf-platform`. Mở rộng Local Demo (`2026-10-09-local-demo-design.md`, PR #3) thành **full luồng mua** không cần tài khoản nào. Xây trên `feat/entitlement-identity` (PR #4) + `feat/local-demo` + spec `2026-10-11-web-funnel-sdk-compat-design.md`.

**Mục tiêu:** `npm run demo:purchase` in ra một URL https và mã QR. Mở trên điện thoại: đi qua funnel thật, trả tiền bằng overlay Paddle giả, bấm get-app → "app" (trang giả) hiện **PRO**. Trên bảng điều khiển bấm Refund → app hiện **FREE**. Toàn bộ code billing, entitlement, SDK chạy đúng bản production.

**Điều kiện xong:**
- Trên máy có Colima + cloudflared: `npm run demo:purchase` in URL `https://*.trycloudflare.com` + QR trong ~1 phút. Luồng mua → PRO → refund → FREE chạy được bằng tay trên điện thoại.
- `npm run demo:test` (smoke, không tunnel) pass luồng đó tự động.
- Code production chỉ đổi đúng một chỗ: SDK/edge-router nhận URL Paddle.js thay thế (§4), có test chặn ở staging/prod.

## Quyết định (2026-10-10)

| # | Hạng mục | Lựa chọn |
|---|---|---|
| 1 | HTTPS | Cloudflare **quick tunnel** (`cloudflared tunnel --url`, không tài khoản). URL đổi mỗi lần chạy |
| 2 | Paddle | Giả hoàn toàn: client phía server trong bộ nhớ + `paddle.js` giả phía trình duyệt; webhook tự ký như Paddle thật |
| 3 | Paddle.js giả | Thêm chỗ cắm `__IKF.paddle.js` vào SDK, edge-router chèn khi có Worker var `PADDLE_JS_URL` (chỉ demo) |
| 4 | Turnstile | Sitekey test chính thức của Cloudflare (`1x00000000000000000000AA`, luôn pass) + hàm xác thực giả phía server |
| 5 | App | Một app `starlyn`, `kind = app`, `handoff = user_id`; "app" là trang web giả mô phỏng SDK |
| 6 | Funnel | Mặc định `witch-power` (có `CONFIG.funnel`, plan `1w` + `addon`, `appUrl` https) |

## 1. Thành phần (trong `demo/`)

| File | Trách nhiệm |
|---|---|
| `demo/run.mjs` | Thêm cờ `--purchase`, `--tunnel`, `--funnel <slug>`; script `demo:purchase` = `--purchase --tunnel` |
| `demo/lib/tunnel.mjs` | `startTunnel(port)`: spawn `cloudflared tunnel --url http://localhost:<port>`, đọc URL `https://*.trycloudflare.com` từ stderr (timeout 30 s), `stop()`. Thiếu binary → lỗi rõ `brew install cloudflared` |
| `demo/lib/proxy.mjs` | Server HTTP cổng **8788**: `/v1/*` → core-api 8080, `/_demo/*` → demo server, còn lại → Miniflare 8787. Giữ nguyên `Host`, thêm `X-Forwarded-Proto: https` |
| `demo/lib/paddle-fake.mjs` | Client Paddle giả cùng interface `@ikf/paddle` (`createTransaction`, `getTransaction` kèm `customer` + `adjustments`, `getSubscription`, `getCustomer`, `createCustomer`, `getPrice`, `getDiscount`, `listTransactions`, `listAdjustments`). Trạng thái trong bộ nhớ. Hành động: `pay(txnId, email)`, `refund(txnId, {type:'full'\|'partial'})`, `expire(subId)`, `renew(subId)`. Mỗi hành động ghi state rồi **ký** (`signWebhook` của `@ikf/paddle`) và POST webhook tương ứng (`transaction.completed`, `subscription.created/updated`, `adjustment.updated`) tới `http://localhost:8080/v1/paddle/webhook` |
| `demo/lib/queue.mjs` | Hàng đợi trong bộ nhớ cùng interface `{send, receive({signal}), delete}` của `src/billing/queue.js` (không import test helper) |
| `demo/lib/stack.mjs` | Khi `--purchase`: `buildApp` thêm `paddle` (giả), `turnstile` (giả → `{ok:true, hostname:<host>}`), `queue`, `webhookSecret`, `webhookSecrets` (Map), `claimKey` (cố định), `mailer` (hộp thư giả), `alarm` (log); chạy `startQueueWorker` (billing-sync), `startEntitlementSync`, `startWebhookSender`; `stop()` dừng cả ba |
| `demo/lib/seed.mjs` | Tạo app `starlyn` (`adjust_tracker_url = <base>/_demo/app`, `deeplink_scheme = starlyn`, `handoff = user_id`, `webhook_url = <base>/_demo/null`), gắn funnel → app, prices `1w → pri_demo_1w @premium`, `addon → pri_demo_addon @tarot_2027`; idempotent |
| `demo/server/` | Server demo (Node `http`, HTML tĩnh + JSON): `/_demo/` bảng điều khiển, `/_demo/paddle.js`, `/_demo/paddle/pay`, `/_demo/app`, `/_demo/mail`, `/_demo/actions/{refund,expire,renew}`, `/_demo/state` |
| `demo/lib/miniflare.mjs` | Khi `--purchase`: vars `PADDLE_ENV=sandbox`, `PADDLE_CLIENT_TOKEN=test_demo`, `TURNSTILE_SITEKEY=1x00000000000000000000AA`, `API_ORIGIN=<base>`, `PADDLE_JS_URL=<base>/_demo/paddle.js` |
| `demo/test/purchase.test.mjs` | Smoke không tunnel (§5) |
| `demo/README.md` | Mục "Full luồng mua": cài cloudflared, cờ, QR, xử lý sự cố |

`<base>` = URL tunnel khi `--tunnel`, hoặc `https://demo.test` trong smoke test (chỉ là chuỗi; request đi thẳng vào proxy local với header `Host`/`Origin` tương ứng).

## 2. Thay đổi code production (duy nhất)

- `packages/sdk/src/checkout.js`: `const paddleJs = (cfg.paddle && cfg.paddle.js) || PADDLE_JS;` dùng khi `load(...)`. Chỉ nhận URL `https://`. Bundle vẫn ≤ 8192 B gzip.
- `workers/edge-router/src/pay.js`: nếu env `PADDLE_JS_URL` có giá trị → `__IKF.paddle.js = PADDLE_JS_URL`. Không có → không thêm field (prod không đổi một byte).
- Test: SDK unit (có `paddle.js` → load URL đó; không có → CDN; `http://` → bỏ qua); edge-router unit; **Terraform test** `infra/modules/edge`: bảng vars của Worker staging/prod không chứa `PADDLE_JS_URL`.

## 3. Luồng demo

1. `npm run demo:purchase`: compose up → migrate → Miniflare + core (purchase deps) + media + demo server + proxy → tunnel → đăng ký domain `<host>` (active) + route `/witch-power` → seed → in URL `https://<host>/witch-power`, QR, URL bảng điều khiển `/_demo/`.
2. Điện thoại quét QR → funnel thật (SDK injected, `__IKF.paddle`, `turnstile`, `api`).
3. Bấm mua → SDK: Turnstile test → `POST /v1/checkout` → load `/_demo/paddle.js` → overlay giả: email + nút **Pay** / **Cancel**.
4. Pay → `POST /_demo/paddle/pay {transactionId, email}` → Paddle giả hoàn tất transaction, tạo customer + subscription, bắn webhook có chữ ký → billing-sync → `checkouts.completed`, outbox → `entitlement-sync` → `entitlements`. Overlay phát `checkout.completed` cho SDK → `completePurchase` → SDK poll `/v1/checkout/:id/claim` → `app_link` gắn vào nút get-app.
5. Bấm get-app → `/_demo/app?deep_link=starlyn%3A%2F%2Fopen%3Fuser_id%3D…` → trang app giả: tách `user_id` (bỏ placeholder như SDK), lưu `localStorage`, `POST /v1/payment/check-purchased-web-funnel` → hiện **PRO**, `expires_at`, nút **Kiểm tra lại**, **Cài lại app** (xóa storage → FREE → mở link từ hộp thư → PRO).
6. Bảng điều khiển: **Refund** → Paddle giả tạo adjustment `approved` + webhook → quyền tắt → app check lại → **FREE**. **Expire** (đẩy `current_period_end` về quá khứ + webhook `subscription.updated`) → sweep (chạy ngay bằng nút, không chờ 5 phút) → FREE. **Renew** → PRO.
7. Ctrl-C: dừng tunnel, proxy, worker, Miniflare, core. Container giữ.

## 4. Hành vi và lỗi

- Mọi "pro" trên trang app giả đến từ endpoint thật, không từ state của demo.
- Hộp thư giả giữ 50 email gần nhất trong bộ nhớ; hiện subject, link, thời gian; không ghi đĩa.
- Paddle giả không lưu đĩa: restart demo = mất transaction (Postgres vẫn giữ `checkouts`/`entitlements` cũ; seed idempotent; README ghi `demo:down --reset` để sạch).
- `cloudflared` thiếu → thoát với hướng dẫn. Tunnel không trả URL trong 30 s → thoát, in stderr của cloudflared.
- Không `--tunnel` nhưng `--purchase` → dùng `--host https://<host>` do người dùng tự cấp (ví dụ mkcert sau này), không mặc định http.
- Trình duyệt vẫn tải Turnstile thật từ Cloudflare (cần internet, điện thoại có sẵn).

## 5. Kiểm thử

- Unit `paddle-fake`: trạng thái sau `pay/refund/expire/renew`; webhook được ký đúng (`verify` bằng `@ikf/paddle`); `getTransaction` trả `adjustments[].type`.
- Unit `tunnel`: parse URL từ output mẫu; binary thiếu → lỗi có hướng dẫn (spawn giả).
- Smoke `purchase.test.mjs` (Vitest, 180 s, chỉ local): start stack `--purchase --host https://demo.test` → GET funnel qua proxy (có `__IKF.paddle.js`) → `POST /v1/checkout` (Origin `https://demo.test`, token Turnstile bất kỳ) → `pay` → poll claim ≤ 20 s ra `app_link` chứa `user_id` → `check-purchased` `is_pro true` → `refund` → ≤ 10 s `is_pro false`. Không có email nào trong log stdout/stderr thu được.
- Có sẵn: `demo.test.mjs` (không purchase) vẫn pass.

## 6. Ngoài phạm vi

- App `web` / web2web, OTP trên app giả, Paddle sandbox thật, Adjust thật, Meta Pixel, demo public lâu dài (named tunnel cần tài khoản).

# Admin Console đợt 2 — Final whole-branch review

- Repo `ikf-platform`, nhánh `feat/admin-console-p2`, range `e1b92cf..f33c597` (18 commit, 81 file, +4042/−128). PR base `feat/admin-console-p1` (#6).
- Reviewer: Claude Opus (read-only, ba lượt: core-api, SPA, CLI/demo/infra/docs), 2026-10-11. Plan: `docs/plans/2026-10-11-admin-console-p2.md`. Spec: `docs/specs/2026-10-11-admin-console-p2-design.md`.
- Verdict: **Mergeable after three Important fixes.** Fix wave + scoped re-review: `2026-10-11-admin-console-p2-final-rereview.md`.

## Strengths
- **Grants matrix đúng trên mọi route mới/đổi:**

  | Route | Grant | Người | Token |
  |---|---|---|---|
  | `GET /v1/paddle/prices`, `GET /v1/funnels/:slug/prices` | `prices:read` | editor, admin | router, publisher, admin |
  | `PUT /v1/apps/:id`, webhook resend, `PUT …/prices` | `router` | admin | router, admin |
  | `GET …/webhooks` | `apps:read` | editor, admin | router, admin |
  | `POST /v1/customers/lookup`, `…/resend-email` | `support` | support, admin | admin |
  | rotate, grants, reconcile, outbox | `admin` | admin | admin |

  `support` chỉ tới reads + lookup + resend; role người đọc live qua `touchSession` nên hạ role có hiệu lực ngay.
- **Không lộ `user_id`:** grep mọi dòng thêm — không có trong response, audit, log, URL, SPA. `app_user_id` là id của app. Link email dựng lúc gửi từ `user_id` hiện tại, nên resend sau rotate mang link mới.
- **Mọi write mới audit trong transaction** đúng shape spec; CSRF qua `authenticate` cho mọi non-GET.
- **Grant abuse paths:** app lạ → `invalid_grant app_id`; revoke grant khách khác → 404 (filter `customer_id`); revoke 2 lần → 409 với `FOR UPDATE`; reason > 200 → 400.
- **Catalog:** Paddle error → 503, không cache lỗi, không `err.message`; validation Terraform chặn prefix phủ `/v1/paddle/webhook`.
- **Tab Giá:** `Object.hasOwn` + null-prototype, chỉ gửi dòng đổi, không gửi lại giá archived.
- e2e cookie workaround (A21) chỉ trong test; demo không đổi khi thiếu `--admin-user`; không dependency mới.

## Declined to judge
`starts_with()` trong rate-limit rule Cloudflare (mock provider); chi phí plan scanner trên upload 1 MB (ledger đo 28 ms); test F4 entitlement-sync flaky (cũ); double-click trên nút confirm rotate/revoke (dựa vào `disabled={busy}`, React flush giữa hai click); số test (không chạy lại).

## Issues
### Important
1. **"Tạo app" không có pending guard; double-click có thể để app với webhook secret không ai thấy.** `Apps.jsx:48-57,118`; server `identity/apps.js:58-67`: hai POST cùng qua check exists trong cửa sổ AWS `put`; `put` thứ hai ghi đè secret; INSERT đầu thắng → hộp một lần hiện secret 1, Secrets Manager giữ secret 2 → mọi chữ ký webhook sai, console chưa xoay webhook secret. Fix: `busy` guard + `disabled`; server: `pg_advisory_xact_lock(hashtext(id))` quanh check → put → insert.
2. **Webhook "Gửi lại" không có pending guard** (`AppDetail.jsx:126-135,166`): mỗi lần click tạo delivery + audit mới (CLI cố ý không retry vì lý do này). Fix: theo dõi `event_id` đang gửi, disable nút.
3. **Cấp lại `user_id` cho khách không có email/claim = khoá khách, nhưng dialog và runbook nói ngược lại.** OTP restore không áp dụng cho app `handoff=user_id` (`otp.js:30,62`); với `email_queued:false` khách chỉ còn claim page trong 60 phút sau mua. Runbook `:122` nói "khách khôi phục bằng OTP", `:116` khuyên OTP cho `409 no_email`. Dialog (`CustomerDetail.jsx:284-292`) chỉ cảnh báo sau khi làm. Fix: sửa runbook (không có tự khôi phục; sửa email rồi resend, hoặc grant thủ công trên khách mới); dialog cảnh báo trước khi confirm khi `!has_email || !claim`.

### Minor
4. Rotate rethrow lỗi resend khác `no_claim`/`no_email` sau khi đã commit → 500 che thành công (`customer-actions.js:55-58`).
5. `Customers.jsx:38-41`: query sai khi đang tìm làm `busy` kẹt.
6. Runbook `:126` nói reason nằm trong Audit — sai (reason ở `manual_grants`).
7. Grant id không có `maximum` (`http/customers.js:78-82`): 1e20 → BIGINT overflow 500.
8. `plan_keys` lưu không lọc/không cap (`http/versions.js:44`): key có `$`/quote/>40 ký tự thành dòng "Chưa có giá" không bao giờ lưu được.
9. "Lưu giá" / "Lưu" app edit không có pending guard (PUT idempotent, chỉ thừa audit).
10. Lookup khách không audit (support có thể dò email không dấu vết; spec im lặng).
11. Resend trên app `handoff=claim` có token đã dùng → `queued:true` nhưng link trả 409 (đã trong ledger).

## Triage
Fix before merge: #1 #2 #3 + minors #4 #5 #6 #7 #8. Defer: còn lại (ledger). Rulings A3 / T5 paid-only / T6 resend retry / T10 hasOwn / T11 force-after-409 / T12 pending guards: agree. Sửa ledger: reconcile audit fail → 500 internal, không phải paddle error.

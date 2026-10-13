# iFunnel

Platform funnel nội bộ thay dần FunnelFox: publish funnel web (quiz → paywall → checkout), thu tiền qua Paddle, rồi đưa user sang app (**web2app**) hoặc sang sản phẩm web (**web2web**).

## Quyết định đã chốt (2026-10-05)

| Hạng mục | Lựa chọn |
|---|---|
| Thanh toán | **Paddle** (Merchant of Record, Paddle lo thuế) |
| Entitlement / identity | **Tự xây** toàn bộ |
| Attribution app | **Adjust** (deferred deep link + S2S) |
| Tracking web | **Meta Pixel** + Conversions API |
| Cloud | **AWS us-east-1**, Cloudflare ở edge |
| Cloudflare zone platform (prod) | **Business** (~$200/tháng), đủ 3 rule rate limit (chốt 2026-10-09) |
| Quy mô khởi đầu | **Tier A** (~100k sessions/ngày), thiết kế sẵn để lên Tier B |

## Nội dung folder

| File | Nội dung |
|---|---|
| [docs/plans/2026-10-05-ikame-funnel-platform.md](docs/plans/2026-10-05-ikame-funnel-platform.md) | **Master plan:** phạm vi, kiến trúc, nguồn lực, roadmap P0–P3, rủi ro, hạ tầng theo tier |
| [docs/plans/2026-10-05-ikf-infra-aws.md](docs/plans/2026-10-05-ikf-infra-aws.md) | **Plan TDD hạ tầng** (Terraform, 15 task): Cloudflare, ECS, RDS Proxy, Valkey, SQS, SES, alarm, CI/CD |
| [docs/specs/2026-10-06-edge-router-publisher-design.md](docs/specs/2026-10-06-edge-router-publisher-design.md) | **Spec Edge Router + Publisher:** CLI `ikf` → Publisher API, version bất biến + preview, route host+prefix qua Postgres → KV, Worker phục vụ từ R2 |
| [docs/plans/2026-10-06-edge-router-publisher.md](docs/plans/2026-10-06-edge-router-publisher.md) | **Plan TDD Edge Router + Publisher** (16 task): route-match, core publisher, Worker, Terraform domain funnel, CLI `ikf`, E2E staging |
| [docs/specs/2026-10-08-runtime-sdk-collector-design.md](docs/specs/2026-10-08-runtime-sdk-collector-design.md) | **Spec Runtime SDK + Collector:** `ikf.js` bắt event `ikfunnel:*`, lọc PII, Meta Pixel + consent EEA, `/_ikf/c` → Queue → ClickHouse |
| [docs/plans/2026-10-08-runtime-sdk-collector.md](docs/plans/2026-10-08-runtime-sdk-collector.md) | **Plan TDD Runtime SDK + Collector** (14 task): event-schema, SDK `ikf.js`, collector `/_ikf/c`, event-consumer → ClickHouse, Pixel, infra |
| [docs/specs/2026-10-09-billing-paddle-design.md](docs/specs/2026-10-09-billing-paddle-design.md) | **Spec Billing (Paddle):** checkout inline trong funnel, map giá theo funnel, webhook inbox → SQS → đọc lại từ Paddle, state machine + outbox |
| [docs/plans/2026-10-09-billing-paddle.md](docs/plans/2026-10-09-billing-paddle.md) | **Plan TDD Billing (Paddle)** (13 task + Task 0): `@ikf/paddle`, migration 003, map giá, checkout, webhook, worker `billing-sync`, reconcile, SDK checkout, `/_ikf/pay`, infra, e2e |
| [docs/specs/2026-10-09-local-demo-design.md](docs/specs/2026-10-09-local-demo-design.md) · [plan](docs/plans/2026-10-09-local-demo.md) | **Demo local:** `npm run demo` chạy funnel thật trên máy (Miniflare + Postgres + ClickHouse), không cần tài khoản |
| [docs/specs/2026-10-09-entitlement-identity-design.md](docs/specs/2026-10-09-entitlement-identity-design.md) | **Spec Entitlement + Identity:** claim qua Adjust deep link / OTP email, liên kết server-to-server với backend app, tính lại quyền từ outbox, webhook có chữ ký |
| [docs/specs/2026-10-11-web-funnel-sdk-compat-design.md](docs/specs/2026-10-11-web-funnel-sdk-compat-design.md) | **Spec Web Funnel SDK Compat:** khớp IKameSDK (pull theo `user_id` UUID), endpoint `POST /v1/payment/check-purchased-web-funnel`, `apps.handoff` |
| [docs/specs/2026-10-11-demo-purchase-design.md](docs/specs/2026-10-11-demo-purchase-design.md) | **Spec Demo Purchase:** `npm run demo:purchase` — tunnel Cloudflare, Paddle giả, app giả, refund → FREE |
| [docs/specs/2026-10-11-admin-console-p1-design.md](docs/specs/2026-10-11-admin-console-p1-design.md) | **Spec Admin Console đợt 1:** Google login, role, upload/preview/publish/rollback, domain, audit; SPA `apps/admin` |
| [docs/specs/2026-10-11-admin-console-p2-design.md](docs/specs/2026-10-11-admin-console-p2-design.md) | **Spec Admin Console đợt 2:** giá từ catalog Paddle, app registry + webhook, khách hàng (resend email, cấp lại `user_id`, quyền thủ công), reconcile; role `support` |
| [docs/specs/2026-10-11-admin-console-p3-design.md](docs/specs/2026-10-11-admin-console-p3-design.md) | **Spec Admin Console đợt 3:** dashboard ClickHouse — MV `funnel_hourly` (`uniqExactState(sid)`), doanh thu từ Postgres, Dashboard + tab Số liệu (SVG inline), breakdown version/nguồn/quốc gia/thiết bị |
| [docs/plans/2026-10-12-admin-console-p3.md](docs/plans/2026-10-12-admin-console-p3.md) | **Plan TDD Admin Console đợt 3** (13 task): MV `funnel_hourly` + backfill, client ClickHouse, queries/revenue/service, 3 route analytics, `ikf stats`, SPA Dashboard + tab Số liệu (SVG), demo seed + e2e, infra + runbook; điều chỉnh A1–A20 |
| [docs/plans/2026-10-11-admin-console-p2.md](docs/plans/2026-10-11-admin-console-p2.md) | **Plan TDD Admin Console đợt 2** (15 task): migration 006, role `support`, quyền thủ công, lookup v2, resend/rotate, catalog Paddle, plan_keys, SPA Giá/Apps/Khách/Billing, e2e |
| [docs/plans/2026-10-11-admin-console-p1.md](docs/plans/2026-10-11-admin-console-p1.md) | **Plan TDD Admin Console đợt 1** (16 task): migration 005, audit, phiên + CSRF, Google OIDC, `@ikf/funnel-lint`, SPA `apps/admin`, demo + e2e, infra |
| [docs/plans/2026-10-11-web-funnel-compat-and-demo-purchase.md](docs/plans/2026-10-11-web-funnel-compat-and-demo-purchase.md) | **Plan TDD Web Funnel SDK Compat + Demo Purchase** (15 task): `user_id`/`handoff`, check-purchased, Paddle giả, tunnel, app giả |
| [docs/plans/2026-10-09-entitlement-identity.md](docs/plans/2026-10-09-entitlement-identity.md) | **Plan TDD Entitlement + Identity** (12 task): migration 004, computeEntitlements, app registry, sync, claim/OTP/magic, webhook-sender, SDK, CLI, infra, tài liệu tích hợp |
| [docs/reviews/2026-10-11-admin-console-p1-final-review.md](docs/reviews/2026-10-11-admin-console-p1-final-review.md) · [re-review](docs/reviews/2026-10-11-admin-console-p1-final-rereview.md) · [ledger](docs/reviews/2026-10-11-admin-console-p1-execution-ledger.md) | **Review Admin Console đợt 1** (PR #6): review toàn nhánh, đợt sửa (tunnel demo, regex validateBundle, cookie `__Host-`), ledger 16 task |
| [docs/reviews/2026-10-12-admin-console-p3-final-review.md](docs/reviews/2026-10-12-admin-console-p3-final-review.md) · [re-review](docs/reviews/2026-10-12-admin-console-p3-final-rereview.md) · [ledger](docs/reviews/2026-10-12-admin-console-p3-execution-ledger.md) | **Review Admin Console đợt 3** (PR #8): review toàn nhánh, đợt sửa (giới hạn truy vấn ClickHouse + coalescing, runbook definer `ikf_mv` + rollback, tab/milestone SPA), ledger 13 task |
| [docs/reviews/2026-10-11-admin-console-p2-final-review.md](docs/reviews/2026-10-11-admin-console-p2-final-review.md) · [re-review](docs/reviews/2026-10-11-admin-console-p2-final-rereview.md) · [ledger](docs/reviews/2026-10-11-admin-console-p2-execution-ledger.md) | **Review Admin Console đợt 2** (PR #7): review toàn nhánh, đợt sửa (khoá tạo app, guard nút, runbook rotate), ledger 15 task |
| [docs/checklist-chuan-bi.md](docs/checklist-chuan-bi.md) | Việc cần chuẩn bị: tài khoản, Paddle, pháp lý, Meta, Adjust, nhân sự |

## Trạng thái

- [x] Master plan
- [x] Plan hạ tầng AWS Tier A
- [ ] Checklist chuẩn bị (nhóm 1 xong thì bắt đầu code Task 1–13)
- [ ] Các plan TDD tiếp theo:
  - edge-router-publisher (spec + plan TDD xong 2026-10-06)
  - runtime-sdk-collector (spec + plan TDD xong 2026-10-08)
  - billing-paddle (spec + plan TDD xong 2026-10-09)
  - entitlement-identity (spec + plan TDD xong 2026-10-09, code PR #4)
  - web-funnel-sdk-compat + demo-purchase (spec + plan TDD + code xong 2026-10-11, PR #5)
  - app-sdk-adjust
  - conversions-relay
  - admin-console đợt 1 (spec + plan TDD + code xong 2026-10-11, PR #6) · đợt 2 billing+identity (spec + plan TDD + code xong 2026-10-11, PR #7) · đợt 3 dashboard ClickHouse (spec + plan TDD + code xong 2026-10-12, PR #8) · restyle giao diện console (PR #9, 2026-10-12, không spec: chỉ CSS/JSX) · đợt 4a app là đơn vị quản lý (spec + plan TDD + code xong 2026-10-13, PR #10) · đợt 4b quyền theo app (spec + plan TDD + code xong 2026-10-13, PR #11)

## Code

Code nằm trong một **git repo riêng**, `ikf-platform`, ở local `/Users/daothinh/ikf-platform`. Repo cần riêng vì GitHub Actions và Terraform đòi `.github/` nằm ở gốc repo. Folder này chỉ chứa tài liệu dự án.

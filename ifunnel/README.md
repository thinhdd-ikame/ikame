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
| [docs/checklist-chuan-bi.md](docs/checklist-chuan-bi.md) | Việc cần chuẩn bị: tài khoản, Paddle, pháp lý, Meta, Adjust, nhân sự |

## Trạng thái

- [x] Master plan
- [x] Plan hạ tầng AWS Tier A
- [ ] Checklist chuẩn bị (nhóm 1 xong thì bắt đầu code Task 1–13)
- [ ] Các plan TDD tiếp theo:
  - edge-router-publisher (spec + plan TDD xong 2026-10-06)
  - runtime-sdk-collector (spec + plan TDD xong 2026-10-08)
  - billing-paddle
  - entitlement-identity
  - app-sdk-adjust
  - conversions-relay
  - admin-console

## Code

Code nằm trong một **git repo riêng**, `ikf-platform`, ở local `/Users/daothinh/ikf-platform`. Repo cần riêng vì GitHub Actions và Terraform đòi `.github/` nằm ở gốc repo. Folder này chỉ chứa tài liệu dự án.

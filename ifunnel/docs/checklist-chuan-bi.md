# iFunnel — Checklist chuẩn bị

Cập nhật: 2026-10-05. Đánh dấu `[x]` khi xong, ghi người phụ trách sau dấu `—`.

## 1. Cần có để bắt đầu code hạ tầng (Task 0 của plan infra)

- [ ] **AWS account** + quyền admin (SSO hoặc IAM). Ghi Account ID. Đặt cảnh báo billing ở mức ~$1.500/tháng —
- [ ] **2 domain platform** (prod và staging), add vào Cloudflare (prod gói **Business** ~$200/tháng vì cần 3 rule rate limit: API, `/_ikf/c`, `/v1/checkout`; staging: xem quyết định ở README), đổi nameserver —
- [ ] **Cloudflare:** bật Workers Paid ($5) và R2. Ghi Account ID và Zone ID của 2 domain —
- [ ] **Cloudflare API token** với các quyền:
  - Account: R2, Workers KV, Queues, Turnstile: Edit
  - Zone: DNS, Zone Settings, Zone WAF, Transform Rules: Edit

  —
- [ ] **GitHub repo** `ikf-platform` (private), có 2 environment `staging` và `prod`. Prod cần người duyệt —
- [ ] **Email nhóm nhận alarm** (ví dụ `ikf-oncall@…`) —
- [ ] **Tài khoản ClickHouse Cloud** (tạo org) —
- [ ] **Tool trên máy chạy:** terraform ≥ 1.10, aws cli v2, docker buildx, node 22, k6, jq —

## 2. Business và pháp lý (bắt đầu ngay vì phải chờ duyệt)

### Paddle

- [ ] Đăng ký và làm KYC công ty, khai tài khoản ngân hàng nhận payout —
- [ ] **Xin xác nhận bằng văn bản** rằng Paddle nhận các niche: AI companion/romance, astrology, AI photo —
- [ ] Hỏi quy trình duyệt domain và có duyệt hàng loạt được không —
- [ ] Tạo tài khoản sandbox cho staging —
- [ ] Xem lại pricing theo phí 5% + $0.50 (gói $4.99/tuần mất ~15% vào phí) —

### Tài liệu pháp lý (Paddle yêu cầu để duyệt domain)

- [ ] Terms of Service —
- [ ] Privacy Policy —
- [ ] Điều khoản subscription/auto-renew —
- [ ] Refund policy —
- [ ] Trang liên hệ/hỗ trợ có tên công ty —

### Domain funnel (tách riêng với domain platform)

- [ ] Mua pool 5–10 domain chạy ads, warm-up, gửi Paddle duyệt —

### Meta

- [ ] Business Manager, Pixel ID, CAPI access token —
- [ ] Verify các domain funnel trong Business Manager —

### Adjust và app pilot

- [ ] Chọn 1 app pilot —
- [ ] App token, S2S security token —
- [ ] Event token cho purchase, renewal, refund —
- [ ] Link template cho deferred deep link —
- [ ] Associated Domains (iOS) và App Links (Android) —

### AWS SES

- [ ] Gửi yêu cầu production access (sau khi Task 10 dựng domain mail, thường duyệt trong ~1 ngày) —

## 3. Con người và số liệu

- [ ] Người phụ trách:
  - PM —
  - Tech Lead —
  - DevOps —
  - BE ×2 —
  - FE —
  - Mobile —
  - QA —
  - Người duyệt deploy prod —
- [ ] Baseline FunnelFox của funnel pilot: CVR, ARPU, refund rate —
- [ ] Chọn funnel pilot đầu tiên —

## Gửi cho người code hạ tầng

Chỉ gửi các giá trị **không bí mật**:
- AWS Account ID
- Cloudflare Account ID
- Zone ID và tên của 2 domain
- Tên repo GitHub
- Email nhận alarm

Token và secret tự nhập lúc chạy, không gửi qua chat.

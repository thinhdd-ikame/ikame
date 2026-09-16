# ikame Growth & UA Workflow

Workspace tập trung tài liệu, quy trình và sản phẩm công việc của đội Growth / User Acquisition (UA) tại ikame — bao gồm A/B testing, phát triển & tối ưu funnel, phát triển creative, phân tích dữ liệu, nghiên cứu, ưu tiên hoá sản phẩm, và các quy trình scale/iterate chiến dịch thắng.

## Cấu trúc thư mục

| Thư mục | Mục đích |
|---|---|
| `ab-testing/` | Thiết kế, triển khai và theo dõi kết quả các thử nghiệm A/B (pricing, onboarding, UI, ads...). |
| `creative-development/` | Ý tưởng, brief và quy trình sản xuất creative cho quảng cáo (ad copy, video, hình ảnh). |
| `data-analytics/` | Báo cáo, dashboard, truy vấn và mô hình phân tích dữ liệu phục vụ ra quyết định growth. |
| `funnel-development/` | Xây dựng funnel onboarding/monetization cho từng sản phẩm, chia theo ngách sản phẩm: |
| &nbsp;&nbsp;`funnel-development/chat-ai-character/` | Funnel cho sản phẩm AI Chat Character. |
| &nbsp;&nbsp;`funnel-development/nebula/` | Funnel cho sản phẩm Nebula. |
| &nbsp;&nbsp;`funnel-development/fitness/` | Funnel cho nhóm sản phẩm Fitness. |
| &nbsp;&nbsp;`funnel-development/mental-health/` | Funnel cho nhóm sản phẩm Mental Health. |
| &nbsp;&nbsp;`funnel-development/ai-photo-video/` | Funnel cho nhóm sản phẩm AI Photo/Video. |
| `funnel-optimization/` | Phân tích và tối ưu funnel hiện có (drop-off, conversion rate, A/B trên funnel). |
| `product-prioritization/` | Khung ưu tiên hoá roadmap, backlog và các đề xuất tính năng theo tác động growth. |
| `research/` | Nghiên cứu thị trường, đối thủ cạnh tranh và người dùng. |
| `scale-clone/` | Quy trình nhân bản (clone) chiến dịch/sản phẩm đã chứng minh hiệu quả sang thị trường/kênh mới. |
| `winner-iteration/` | Lặp lại và cải tiến liên tục các creative/funnel/chiến dịch đã là "winner". |

Mỗi thư mục hiện là khung sườn (`.gitkeep`) — nội dung thực tế được bổ sung dần trên nhánh tương ứng của từng workstream (xem bên dưới).

## Chiến lược nhánh (branching)

Repo dùng mô hình **một nhánh dài hạn cho mỗi workstream**, song song với `main`:

- **`main`** — nhánh ổn định, chỉ chứa khung sườn thư mục và tài liệu dùng chung (README, quy ước chung). Không commit trực tiếp công việc của từng workstream vào `main`.
- **Nhánh workstream** — mỗi thư mục cấp cao có một nhánh dài hạn cùng tên, là nơi đội phụ trách mảng đó phát triển nội dung/tài liệu/công cụ của mình:
  - `ab-testing`
  - `creative-development`
  - `data-analytics`
  - `funnel-development`
  - `funnel-optimization`
  - `product-prioritization`
  - `research`
  - `scale-clone`
  - `winner-iteration`

### Quy ước làm việc trên một nhánh workstream

1. Checkout nhánh workstream tương ứng:
   ```bash
   git checkout ab-testing
   ```
2. Với công việc cụ thể, tạo nhánh con đặt tên theo mẫu `feature/<workstream>-<mo-ta-ngan>`, ví dụ:
   ```bash
   git checkout -b feature/ab-testing-pricing-experiment
   ```
3. Commit theo cú pháp ngắn gọn, mô tả rõ thay đổi (khuyến khích prefix `feat:`, `fix:`, `docs:`, `chore:`).
4. Mở Pull Request merge vào nhánh workstream gốc (ví dụ `ab-testing`), không merge thẳng vào `main`.
5. Định kỳ, các thay đổi chung/ổn định có thể được đề xuất merge vào `main` qua PR riêng, sau khi review.

### Đồng bộ với `main`

Khi `main` có cập nhật dùng chung (README, cấu trúc thư mục mới...), các nhánh workstream nên rebase hoặc merge `main` vào để cập nhật:

```bash
git checkout ab-testing
git merge main
```

## Bắt đầu

```bash
git clone https://github.com/thinhdd-ikame/ikame.git
cd ikame
git checkout <ten-nhanh-workstream>   # ví dụ: git checkout funnel-development
```

## Đóng góp

- Không commit dữ liệu nhạy cảm (credentials, dữ liệu người dùng thật) vào repo.
- Giữ mỗi workstream tập trung vào phạm vi thư mục của mình; các thay đổi ảnh hưởng dùng chung nên đi qua `main`.

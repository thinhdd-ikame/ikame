# ikame Growth & UA Workflow

Workspace tập trung tài liệu, quy trình và sản phẩm công việc của đội Growth / User Acquisition (UA) tại ikame. Repo được tổ chức theo **category** — mỗi category là một mảng công việc lớn, có nhánh git dài hạn riêng. Category đầu tiên là `funnel/`; các category khác sẽ được bổ sung dần theo thời gian.

## Cấu trúc thư mục

```
funnel/
├── ab-testing/              # Thiết kế, triển khai và theo dõi kết quả các thử nghiệm A/B (pricing, onboarding, UI, ads...)
├── creative-development/    # Ý tưởng, brief và quy trình sản xuất creative cho quảng cáo (ad copy, video, hình ảnh)
├── data-analytics/          # Báo cáo, dashboard, truy vấn và mô hình phân tích dữ liệu phục vụ ra quyết định growth
├── funnel-development/      # Xây dựng funnel onboarding/monetization, chia theo ngách sản phẩm:
│   ├── chat-ai-character/   #   - AI Chat Character
│   ├── nebula/               #   - Nebula
│   ├── fitness/              #   - Fitness
│   ├── mental-health/        #   - Mental Health
│   └── ai-photo-video/       #   - AI Photo/Video
├── funnel-optimization/     # Phân tích và tối ưu funnel hiện có (drop-off, conversion rate, A/B trên funnel)
├── product-prioritization/  # Khung ưu tiên hoá roadmap, backlog theo tác động growth
├── research/                # Nghiên cứu thị trường, đối thủ cạnh tranh và người dùng
├── scale-clone/             # Nhân bản (clone) chiến dịch/sản phẩm đã chứng minh hiệu quả sang thị trường/kênh mới
└── winner-iteration/        # Lặp lại và cải tiến liên tục các creative/funnel/chiến dịch đã là "winner"
```

Mỗi thư mục hiện là khung sườn (`.gitkeep`) — nội dung thực tế được bổ sung dần trên nhánh `funnel` (xem bên dưới). Các category mới trong tương lai sẽ có cấu trúc con tương tự, nằm cạnh `funnel/` ở thư mục gốc.

## Chiến lược nhánh (branching)

Repo dùng mô hình **một nhánh dài hạn cho mỗi category**, song song với `main`:

- **`main`** — nhánh ổn định, chỉ chứa khung sườn thư mục và tài liệu dùng chung (README, quy ước chung). Không commit trực tiếp công việc của từng category vào `main`.
- **Nhánh category** — mỗi category có một nhánh dài hạn cùng tên:
  - `funnel` — chứa toàn bộ nội dung/tài liệu/công cụ của các mảng con bên trong `funnel/` (ab-testing, creative-development, data-analytics, funnel-development, funnel-optimization, product-prioritization, research, scale-clone, winner-iteration).
  - *(sẽ bổ sung thêm khi tạo category mới, ví dụ `category2`, ...)*

### Quy ước làm việc trên một nhánh category

1. Checkout nhánh category tương ứng:
   ```bash
   git checkout funnel
   ```
2. Với công việc cụ thể, tạo nhánh con đặt tên theo mẫu `feature/<category>-<khu-vuc-con>-<mo-ta-ngan>`, ví dụ:
   ```bash
   git checkout -b feature/funnel-ab-testing-pricing-experiment
   ```
3. Commit theo cú pháp ngắn gọn, mô tả rõ thay đổi (khuyến khích prefix `feat:`, `fix:`, `docs:`, `chore:`).
4. Mở Pull Request merge vào nhánh category gốc (ví dụ `funnel`), không merge thẳng vào `main`.
5. Định kỳ, các thay đổi chung/ổn định có thể được đề xuất merge vào `main` qua PR riêng, sau khi review.

### Đồng bộ với `main`

Khi `main` có cập nhật dùng chung (README, cấu trúc thư mục mới...), các nhánh category nên merge `main` vào để cập nhật:

```bash
git checkout funnel
git merge main
```

## Bắt đầu

```bash
git clone https://github.com/thinhdd-ikame/ikame.git
cd ikame
git checkout funnel   # hoặc nhánh category khác khi được tạo
```

## Đóng góp

- Không commit dữ liệu nhạy cảm (credentials, dữ liệu người dùng thật) vào repo.
- Giữ mỗi category tập trung vào phạm vi thư mục của mình; các thay đổi ảnh hưởng dùng chung nên đi qua `main`.

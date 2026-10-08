# Upload FunnelFox, 2026-10-01

9 funnel, mỗi funnel là **một file HTML duy nhất** đã nhúng sẵn ảnh. Tài nguyên ngoài duy nhất là Google Fonts. Mỗi file đã được mở riêng (không có thư mục ảnh bên cạnh) và chạy qua hết các màn: không có ảnh nào lỗi và không có lỗi JS.

| File | App | Số màn | Kích thước |
|---|---|---|---|
| `chai/chai-ai-girlfriend.html` | Chai | 22 | 736 KB |
| `chai/chai-dream-girl.html` | Chai | 15 | 2.5 MB (33 ảnh) |
| `chai/chai-ai-boyfriend.html` | Chai | 18 | 708 KB |
| `chai/chai-companion.html` | Chai | 20 | 522 KB |
| `chai/chai-romance-stories.html` | Chai | 18 | 1.3 MB |
| `nebula/nebula-astrocartography.html` | Nebula | 25 | 284 KB |
| `nebula/nebula-moon-reading.html` | Nebula | 24 | 328 KB |
| `nebula/nebula-soulmate-sketch.html` | Nebula | 25 | 364 KB |
| `nebula/nebula-palm-reading.html` | Nebula | 23 | 216 KB |

Bản nguồn nằm ở `funnel/funnel-development/…/funnel.html`. Nếu muốn sửa, hãy sửa bản nguồn rồi xuất lại, đừng sửa thẳng các file ở đây.

## Phải điền trước khi chạy thật

Mở file, tìm `const CONFIG` ở đầu phần script. Mọi giá trị dạng `{{...}}` đều là placeholder và hiện trên màn hình bằng khung viền vàng nét đứt, nên rất dễ thấy nếu còn sót.

**Chung cho cả 9 file:**
- **Giá từng gói:** phải là giá thật mà checkout sẽ thu.
- **`checkoutUrl` của từng gói:** link checkout FunnelFox. Để trống thì nút chỉ bắn event, không chuyển trang.
- **`CONFIG.offer`:** offer cơ hội cuối, hiện khi user đóng paywall mà không mua. Cần điền `price`, `renews`, `badge` (để trống nếu không có) và `checkoutUrl` riêng. `expiresMin` để `null` nếu offer không có hạn thật.
- **Link Terms, Privacy, email support, link app / store.**

**Riêng từng funnel:**
- **chai-ai-girlfriend:** `{{price_1m}}`, `{{price_3m}}`, `{{price_12m}}`, `{{week_3m}}`, `{{week_12m}}`; số tin nhắn miễn phí mỗi ngày; mức fair-use (`fairUseCap`).
- **chai-dream-girl:** `{{price_1m}}`, `{{price_3m}}`, `{{price_12m}}`; `CONFIG.stats` và `CONFIG.reviews` phải là số liệu và review thật (để `null` thì khối đó tự ẩn); `moneyBack` chỉ bật khi thật sự có chính sách hoàn tiền. File nặng 2.5 MB, nếu builder giới hạn dung lượng code thì host file rồi nhúng bằng iframe.
- **chai-ai-boyfriend, chai-companion:** `{{price_weekly}}`, `{{price_yearly}}`. Companion có luồng hỗ trợ khủng hoảng tâm lý; paywall và offer không bao giờ hiện trên luồng đó, đừng tắt cơ chế này.
- **chai-romance-stories:** `{{price_weekly}}`, `{{price_yearly}}`; `{{app_rating}}` và `{{stories_count}}` chỉ điền khi có số liệu thật.
- **astrocartography:** `{{week_intro_price}}`, `{{week_price}}`, `{{quarter_price}}`, `{{annual_price}}`, `{{annual_week_equiv}}`, `{{city_report_price}}`, `{{refund_days}}`.
- **moon-reading:** như astrocartography nhưng không có city report; `{{reader_count}}` chỉ điền khi có số liệu thật.
- **soulmate-sketch:** `{{sketch_price}}` (gói trả 1 lần), `{{week_intro_price}}`, `{{week_price}}`, `{{annual_price}}`, `{{refund_days}}`.
- **palm-reading:** `{{trial_price}}`, `{{week_price}}`, `{{annual_price}}`, `{{refund_days}}`; rating và review thật (`CONFIG.rating` và `CONFIG.reviews`, để trống thì khối đó tự ẩn); tên pháp nhân (`company`); `onPalmPhoto` để gửi ảnh tay về backend tạo bài đọc thật. Nếu không điền `onPalmPhoto`, bài đọc chỉ dựa trên câu trả lời quiz.

## Sau khi thanh toán

Checkout phải báo lại cho funnel bằng một trong hai cách: gọi `window.IkFunnel.completePurchase(plan)`, hoặc redirect về funnel với `?paid=<plan>`. Với offer, giá trị `plan` là `'offer'`.

## Event

Mỗi event được gửi qua `ikfunnel:<event>` (window CustomEvent), qua `postMessage` lên trang cha, và qua `fbq` / `ttq` nếu có.
- **Event chính:** `funnel_start`, `screen_view`, `answer`, `lead`, `paywall_view`, `plan_select`, `checkout_click`, `paywall_close`, `complete`.
- **Event của offer:** `offer_view`, `offer_accept`, `offer_decline`, `offer_expired`.

Không event nào gửi email thô, nội dung chat hay ảnh tay.

## Lưu ý

- **Chai:** tất cả đều là funnel 18+. Câu chữ là bản SFW. Riêng ảnh của chai-dream-girl là ảnh glamour giống Honey, nên kiểm tra với chính sách quảng cáo của Meta trước khi chạy ad.
- **Palm-reading:** ảnh tay chỉ nằm trên máy user cho tới khi `onPalmPhoto` được cấu hình. Funnel đã hứa với user là sẽ xoá ảnh sau khi tạo bài đọc, nên backend phải làm đúng như vậy.

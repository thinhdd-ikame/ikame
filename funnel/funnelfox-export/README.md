# FunnelFox export

Mỗi file `.html` trong thư mục này là **một funnel production hoàn chỉnh, một file duy nhất**:

- Ảnh đã được nhúng vào file (base64), nên không cần upload kèm thư mục ảnh.
- Tài nguyên ngoài duy nhất là Google Fonts.

Bản nguồn của mỗi file là `funnel.html` nằm cạnh `demo.html` trong `funnel/funnel-development/<ngách>/`. Nếu sửa, hãy sửa bản nguồn rồi copy lại vào đây.

| File | App | Ngách |
|---|---|---|
| coursiv-claude-cert.html | Coursiv | Chứng chỉ Claude AI |
| coursiv-ai-simple.html | Coursiv | AI đơn giản cho người không rành tech |
| coursiv-vibe-coding.html | Coursiv | Coding với AI / vibe coding |
| nebula-soulmate-sketch.html | Nebula | Soulmate sketch + xem chỉ tay |
| nebula-astrocartography.html | Nebula | Astrocartography |
| nebula-moon-reading.html | Nebula | Moon reading |
| chai-romance-stories.html | Chai | Truyện romance audio |
| chai-companion.html | Chai | AI companion "luôn bên bạn" |
| chai-ai-boyfriend.html | Chai | AI boyfriend cho nữ |
| chai-ai-girlfriend.html | Chai | AI girlfriend (cấu trúc Honey 4202-2, SFW) |

## Trước khi upload: sửa CONFIG

Mở file, tìm `const CONFIG` ở đầu phần script và điền các mục sau:

- **Giá từng gói.** Các giá trị đang là `{{...}}` hoặc có ghi `TODO`. Phải là giá thật.
- **`checkoutUrl` của từng gói.** Đây là link checkout của FunnelFox, hoặc Stripe/Paddle. Để trống thì nút CTA chỉ bắn event, không chuyển trang.
- **Link Terms, Privacy và email support.**
- **Chai:** link app store / deep link để chuyển sang app sau khi mua, số tin nhắn miễn phí mỗi ngày, và mức fair-use.

## Cách đưa lên FunnelFox

1. **Cả funnel trong một màn Custom HTML/Code:** tạo một màn, dán toàn bộ nội dung file vào, rồi để FunnelFox xử lý checkout qua `checkoutUrl`. Nếu builder giới hạn kích thước code, dùng cách 2.
2. **Host file rồi nhúng:** host file ở một nơi bất kỳ (Cloudflare Pages, S3…), sau đó nhúng bằng iframe hoặc dùng làm landing page. Funnel gửi `postMessage` lên trang cha nên FunnelFox vẫn bắt được event.

## Sau khi thanh toán

Checkout phải báo lại cho funnel biết đã thanh toán xong. Có hai cách:

- Trang chủ (FunnelFox) gọi `window.IkFunnel.completePurchase(plan)`. Hàm này bắn event `complete` và mở màn welcome/handoff.
- Checkout redirect về URL của funnel với tham số `?paid=<plan>`. Nebula đọc tham số này và khôi phục câu trả lời từ sessionStorage.

Funnel không bao giờ tự giả lập việc đã mua.

**Nút thanh toán trong trang:** Apple Pay, Google Pay và form nhập thẻ của bản demo đã bị bỏ. Việc thanh toán diễn ra ở `checkoutUrl`.

**Đăng nhập Apple/Google:** đang ẩn cho tới khi bật `socialAuth` hoặc `socialLogin` trong CONFIG. Khi bật, trang chủ phải cung cấp hàm xử lý đăng nhập.

**Tham số checkout:** `checkoutUrl` nhận thêm `plan`, `email` (nếu người dùng đã nhập), các tham số `utm_*` và `fbclid`/`ttclid`/`gclid`. Email thô chỉ có trong URL checkout, không nằm trong event nào.

## Việc còn thiếu trước khi launch

- **Nebula:**
  - Ô tìm thành phố mới biết 45 thành phố, cần thay bằng danh sách thật.
  - Các reading (Venus, partner sign, đường chỉ tay, vị trí hành tinh) vẫn là logic giả lập, suy ra từ input chứ chưa tính từ dữ liệu thật.
  - Hình soulmate sketch được chọn từ 4 ảnh có sẵn theo giới tính và màu tóc.
- **Chai companion:** bộ lọc từ khóa khủng hoảng chỉ là kiểm tra cơ bản phía client. App vẫn phải có bước kiểm tra thật ở server, và luồng này cần được review pháp lý.
- **Coursiv:** câu "Most people pick setup" (vibe-coding) và "A real person helps" (ai-simple) đang tắt trong CONFIG. Chỉ bật khi đã có dữ liệu chứng minh.

## URL params

- `?v=B` bật copy B để chạy A/B test. Mặc định là copy A.
- `?debug=1#s=N` mở thẳng màn N. Chỉ dùng khi QA.
- Các tham số `utm_*` được chuyển tiếp sang `checkoutUrl`.

## Event tracking

Mỗi event được gửi qua ba đường cùng lúc:

- `window` CustomEvent với tên `ikfunnel:<event>`.
- `window.parent.postMessage({source:'ikame-funnel', funnel, event, detail}, '*')`.
- `fbq('trackCustom', …)` và `ttq.track(…)`, nếu pixel đã được cài.

Danh sách event: `funnel_start`, `screen_view`, `answer`, `lead`, `paywall_view`, `plan_select`, `checkout_click`, `paywall_close`, `complete`.

Riêng Chai có thêm `age_gate_pass/fail` và `chat_message`. Event `chat_message` chỉ gửi số lượng tin, không gửi nội dung. Chai companion còn có `crisis_resources_shown`.

Không event nào gửi email thô hay nội dung chat.

## Checklist trước khi chạy ads

- [ ] Thay giá thật và link checkout.
- [ ] Thay các placeholder `{{app_rating}}`, số review và số user bằng số thật. Nếu chưa có số thật thì giữ nguyên bản không có số.
- [ ] Thay ảnh AI ở các vị trí "real learner / real review" bằng ảnh thật.
- [ ] Coursiv: kiểm tra lại tên tính năng của Claude. Giữ dòng "không liên kết với Anthropic".
- [ ] Nebula: xác nhận ảnh chụp lòng bàn tay thật sự bị xoá, trước khi giữ câu "ảnh đã được xoá".
- [ ] Chai: age gate 18+ hoạt động, dòng công khai là AI hiện đủ, link khủng hoảng hoạt động (bản companion).
- [ ] Billing: giá gia hạn hiện trên từng gói, hủy được bằng 1 click, không có countdown.

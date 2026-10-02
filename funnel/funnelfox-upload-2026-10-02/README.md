# Upload FunnelFox, 2026-10-02

43 funnel (Squad 1M), mỗi funnel là **một file HTML duy nhất** đã nhúng sẵn ảnh. Tài nguyên ngoài duy nhất là Google Fonts. Mỗi file đã được copy riêng (không có thư mục ảnh bên cạnh) và chạy qua hết các màn bằng `smoke_demo.mjs`: không có ảnh nào lỗi và không có lỗi JS.

| File | App | Số màn | Kích thước |
|---|---|---|---|
| `nebula/nebula-ex-compatibility.html` | Nebula | 24 | 271 KB |
| `nebula/nebula-marriage-compatibility.html` | Nebula | 24 | 273 KB |
| `nebula/nebula-witch-power.html` | Nebula | 24 | 184 KB |
| `nebula/nebula-past-life.html` | Nebula | 20 | 128 KB |
| `nebula/nebula-aura-tarot.html` | Nebula | 22 | 168 KB |
| `chai/chai-roleplay.html` | Chai | 19 | 138 KB |
| `chai/chai-named-character.html` | Chai | 16 | 119 KB |
| `chai/chai-short-drama.html` | Chai | 14 | 126 KB |
| `testlibrary/testlibrary-personality-mbti.html` | Testlibrary | 16 | 202 KB |
| `testlibrary/testlibrary-archetype.html` | Testlibrary | 16 | 179 KB |
| `testlibrary/testlibrary-autism-traits.html` | Testlibrary | 16 | 207 KB |
| `testlibrary/testlibrary-adhd-traits.html` | Testlibrary | 16 | 205 KB |
| `testlibrary/testlibrary-brain-memory.html` | Testlibrary | 16 | 221 KB |
| `testlibrary/testlibrary-relationship-patterns.html` | Testlibrary | 16 | 207 KB |
| `calmio/calmio-overthinking.html` | Calmio | 22 | 263 KB |
| `calmio/calmio-stress.html` | Calmio | 22 | 254 KB |
| `calmio/calmio-life-planner.html` | Calmio | 21 | 255 KB |
| `calmio/calmio-sleep.html` | Calmio | 22 | 265 KB |
| `calmio/calmio-calm-kids.html` | Calmio | 19 | 249 KB |
| `calmio/calmio-hypnosis.html` | Calmio | 21 | 272 KB |
| `calmio/calmio-nervous-system.html` | Calmio | 21 | 382 KB |
| `calmio/calmio-burnout.html` | Calmio | 22 | 247 KB |
| `calmio/calmio-self-discovery.html` | Calmio | 22 | 253 KB |
| `ewa/ewa-latam.html` | EWA | 22 | 393 KB |
| `ewa/ewa-movies.html` | EWA | 21 | 348 KB |
| `ewa/ewa-speak-ai.html` | EWA | 21 | 123 KB |
| `ewa/ewa-books.html` | EWA | 21 | 401 KB |
| `ewa/ewa-travel-work.html` | EWA | 19 | 126 KB |
| `mygrowth/mygrowth-scroll-swap.html` | MyGrowth | 23 | 490 KB |
| `mygrowth/mygrowth-anatomy.html` | MyGrowth | 22 | 76 KB |
| `mygrowth/mygrowth-charisma.html` | MyGrowth | 21 | 281 KB |
| `mygrowth/mygrowth-engineering.html` | MyGrowth | 22 | 102 KB |
| `mygrowth/mygrowth-genealogy.html` | MyGrowth | 20 | 77 KB |
| `mygrowth/mygrowth-book-summaries.html` | MyGrowth | 20 | 157 KB |
| `coursiv/coursiv-ai-automation.html` | Coursiv | 24 | 106 KB |
| `coursiv/coursiv-ai-career.html` | Coursiv | 24 | 108 KB |
| `coinin/coinin-collector.html` | CoinIn | 20 | 337 KB |
| `coinin/coinin-cards.html` | CoinIn | 18 | 187 KB |
| `coinin/coinin-antique.html` | CoinIn | 18 | 144 KB |
| `coinin/coinin-notes-stamps-gems.html` | CoinIn | 18 | 111 KB |
| `coinin/coinin-plant.html` | CoinIn | 20 | 169 KB |
| `ayahpath/ayahpath-halal-finance.html` | AyahPath | 22 | 468 KB |
| `ayahpath/ayahpath-arabic.html` | AyahPath | 21 | 279 KB |

Bản nguồn nằm ở `funnel/funnel-development/…/funnel.html`. Nếu muốn sửa, hãy sửa `demo.html` rồi xuất lại bằng `python3 funnel/tools/build_export.py <thư-mục-funnel> <tên-export> <thư-mục-out>`, đừng sửa thẳng các file ở đây.

## Phải điền trước khi chạy thật

Mở file, tìm `const CONFIG` ở đầu phần script. Mọi giá trị dạng `{{...}}` đều là placeholder và hiện trên màn hình bằng khung viền vàng nét đứt, nên rất dễ thấy nếu còn sót.

**Chung cho cả 43 file:**
- **Giá và renewal từng gói:** các token `{{price_*}}` và `{{renewal_*}}` phải là giá thật mà checkout sẽ thu. Giá renewal luôn hiện cạnh giá intro.
- **`checkoutUrl` của từng gói:** link checkout FunnelFox. Để trống thì nút chỉ bắn event hoặc hiện toast demo, không chuyển trang.
- **`CONFIG.offer`:** offer cơ hội cuối, hiện một lần khi user đóng paywall mà không mua. Cần `price`, `badge` (để trống nếu không có) và `checkoutUrl` riêng. `expiresMin` để `null` nếu offer không có hạn thật. **Lưu ý: mọi last-chance offer lần này đều là gói trả MỘT LẦN (one-time pass), nên cần tạo SKU không gia hạn (non-renewing) trong store/checkout. Không dùng SKU subscription cho offer.**
- **`refundDays` / `refundTerms`:** khối đảm bảo hoàn tiền tự ẩn khi còn là token. Chỉ điền khi có chính sách hoàn tiền thật.
- **`rating` / `reviews` / số liệu người dùng:** để trống thì khối đó tự ẩn. Chỉ điền số liệu và review thật; mọi số trong brief anh em chưa được kiểm chứng.
- **Link Terms, Privacy, email support, link app / store**, và tên pháp nhân (`company`).
- **Calmio (9 file):** `CONFIG.deletion` (chỉ `true` khi app thật sự có xoá dữ liệu/chat) và `CONFIG.privacyVerified` (calmio-self-discovery; chỉ `true` khi claim riêng tư đã được xác nhận). Cả hai đang tắt, copy tự dùng bản trung tính.

**Riêng từng funnel (từ mục Notes của brief, các điểm unverified / cần xác nhận trước khi chạy):**

- **nebula-ex-compatibility:** paywall/giá của Nebula và Astroline không được capture; thang giá đối thủ cố ý không copy. Giá, gói, offer là token của mình.
- **nebula-marriage-compatibility:** thang giá, mã khuyến mãi và bump EUR 3.99 của đối thủ không copy và chưa kiểm chứng. Offer là one-time pass.
- **nebula-witch-power:** màn witch-mode của Astroline là suy luận (unverified); `{{...}}` giá phải điền, không dùng thang giá trial của Nebula.
- **nebula-past-life:** paywall của Nebula/Astroline chưa kiểm chứng; không copy các mức giá $1/$5/$9/$13.67.
- **nebula-aura-tarot:** funnel Nebula aura chỉ biết qua tóm tắt research, thứ tự màn và copy là suy luận. Coi toàn bộ beat đối thủ là unverified.
- **chai-roleplay:** 10 tin nhắn miễn phí/ngày và fair-use 300 (lấy từ Chai gốc) cần xác nhận; mọi giá, rating, review, điều khoản hoàn tiền là token; age gate 18+ giữ nguyên.
- **chai-named-character:** 10 tin/ngày, fair-use 300 và gói 50 tin (đề xuất) chưa xác nhận; cấu trúc 1/4/12 tuần là gói chuẩn của Chai, không phải của Candy.
- **chai-short-drama:** cần có trong sản phẩm: opt-in thông báo sau mua và hàng "continue watching"; không hứa nhịp tập; series pass một lần cần SKU không gia hạn; nút phát voice line trong demo chỉ là stub.
- **testlibrary-personality-mbti:** giá, trial, consent chưa tick, email nhắc gia hạn, offer một lần: điền token; ngân hàng câu hỏi và công thức type + 4 phần trăm là bản của mình.
- **testlibrary-archetype:** 24 cặp ảnh là bản thiết kế của mình, ảnh cần gen; cần email nhắc gia hạn trước khi trừ tiền.
- **testlibrary-autism-traits:** luồng Testora suy luận (`[I]`); bộ câu hỏi tự viết, chưa validate lâm sàng; ngưỡng nhóm chỉ dùng nội bộ. Cần review sức khoẻ trước khi chạy và link "Need help now?" phải hoạt động.
- **testlibrary-adhd-traits:** chỉ landing testlibrary.com/adhd-test được kiểm chứng; bộ câu hỏi không phải ASRS, chưa validate lâm sàng. Cần review sức khoẻ; ads không được ám chỉ "bạn có ADHD".
- **testlibrary-brain-memory:** luồng memoryOS/Impulse đọc từ research, chưa kiểm chứng; không claim y khoa. Cần review sức khoẻ.
- **testlibrary-relationship-patterns:** luồng Impulse/Breeze suy luận; bộ câu hỏi chưa validate. Cần review sức khoẻ/trauma và màn hỗ trợ khẩn.
- **calmio-overthinking:** SKU thật của Calmio là 1 tháng/3 tháng, cần khớp với gói 1/4/12 tuần; offer là gói một lần `{{offer_price}}`; copy riêng tư chưa kiểm chứng; phạm vi free tier (3 phút unload) là giả định.
- **calmio-stress:** khớp SKU; `{{offer_price}}` phải là SKU không gia hạn; free tier (reset 2 phút) là giả định; rating, review, refund ẩn tới khi có số thật.
- **calmio-life-planner:** khớp SKU; `{{offer_price}}` là SKU không gia hạn; free tier (1 task + chat 3 phút) giả định; thứ tự câu hỏi sau #5 theo research summary.
- **calmio-sleep:** cần xác nhận Calmio có thư viện âm thanh trong app không (cả funnel phụ thuộc); gói sound pass là SKU mới không gia hạn; cần email nhắc gia hạn.
- **calmio-calm-kids:** flow Leaply là suy luận; kịch bản và tên tuần là bản nháp cần chuyên gia phát triển trẻ em review; free tier (1 script) giả định.
- **calmio-hypnosis:** cần file audio mẫu 60 giây thật (demo không phát tiếng); nhánh ăn uống (#6-#8) và quy tắc care-check cần review lâm sàng; funnel không hứa bỏ/giảm thói quen.
- **calmio-nervous-system:** toàn bộ flow là suy luận (không có capture); ba profile và bài thở là thiết kế của mình, cần review; `{{offer_price}}` là SKU không gia hạn.
- **calmio-burnout:** khớp SKU; `{{offer_price}}` là SKU không gia hạn; free tier (check-in 2 phút) giả định; mốc tuần là mục tiêu, không phải cam kết kết quả.
- **calmio-self-discovery:** claim riêng tư và xoá chat chưa xác nhận: nằm sau `CONFIG.privacyVerified` và `CONFIG.deletion` (đang tắt), chỉ bật khi thật sự có; `{{offer_price}}` là SKU không gia hạn.
- **ewa-latam:** chưa duyệt từng màn sau màn 2 của Praktika; refund days chưa rõ (ẩn sau `{{refund_days}}`); rating, số review và các review nay là token trống (`{{app_rating}}`, `{{rating_count}}`, `{{review_1}}`, `{{review_2}}`) và tự ẩn tới khi có số thật; offer là "Pase de falsos amigos" trả một lần (SKU không gia hạn); ES dùng `{{price_mxn_*}}`, PT dùng `{{price_brl_*}}`, lint headline PT riêng.
- **ewa-movies:** tên phim chỉ là text, không poster/clip; claim "same genre as {{show}}" cần legal duyệt trước khi nói "from {{show}}"; số mục tiêu tuần cần content team xác nhận.
- **ewa-speak-ai:** tính năng AI tutor và feedback phát âm của EWA phải xác nhận với product (paywall/FAQ có chữ "verify"); demo chấm bằng so khớp từ trên trình duyệt, không phải model phát âm; cách giữ audio phải nêu đúng sự thật.
- **ewa-books:** danh mục sách và audio narration chưa xác nhận; chỉ dùng bản chuyển thể gốc/public-domain, legal duyệt; mục tiêu tuần cần xác nhận.
- **ewa-travel-work:** toàn bộ spine là suy luận từ research (không capture); phase kit, drill và refund days chưa xác nhận; thang điểm tình huống cần content team chỉnh.
- **mygrowth-scroll-swap:** gói 1/4/12 tuần là cấu trúc kiểu Skillsta/Headway, không phải gói 1/3/6 tháng Stripe thật của MyGrowth; xác nhận với growth. Công thức giờ và ramp 3/5/7/7 ngày là thiết kế riêng.
- **mygrowth-anatomy:** capture dừng ở email gate, nên paywall/offer là cấu trúc mượn từ anh em; "Body Systems 101", catalogue, "6 subjects", single-system pass chưa xác nhận; kiến thức giải phẫu #7-9, #16 cần người có chuyên môn review.
- **mygrowth-charisma:** ba mô phỏng, dải style và gói starter là thiết kế riêng; không hứa "charismatic" sau N tuần; rating/review từ brief anh em là unverified nên ẩn tới khi có số thật.
- **mygrowth-engineering:** Smartyme là source-extracted, không phải capture; MyGrowth có khoá "How Things Work" hay không là unverified, tên module phải khớp catalogue thật.
- **mygrowth-genealogy:** chỉ Nibble genealogy màn 1-11 được xem; #16-19 là thiết kế riêng; hai fact di cư (#8-9), ba track và single-track pass cần xác nhận. Thư mục img/ chưa có ảnh nên funnel dùng placeholder.
- **mygrowth-book-summaries:** chưa có bằng chứng MyGrowth có thư viện book summary (chỉ Headway); đây là concept, panel demo ghi "library unverified"; ý mẫu là paraphrase của mình, editor phải kiểm.
- **coursiv-ai-automation:** ước lượng giờ tiết kiệm dùng hệ số 0.3 là giả định, validate hoặc bỏ con số; tên bài và "what's inside" phải khớp app thật.
- **coursiv-ai-career:** chi tiết capture Shift/Zenfy ngoài summary là unverified; năm skill mỗi ngành và danh sách project phải khớp bài học thật; kit một lần cần là sản phẩm bán được.
- **coinin-collector:** giá và chu kỳ gói thật; refund; rating/review; một số liệu database; ảnh có bản quyền cho game 1-2; API identify thật.
- **coinin-cards:** chưa có funnel tham chiếu (unverified); độ phủ database thẻ và nguồn giá trị; ảnh có bản quyền hoặc gen; API identify thật.
- **coinin-antique:** cần một kết quả đấu giá thật, có ngày và nguồn cho mỗi loại đồ ở màn 9 (demo là số minh hoạ có nhãn); đường huỷ và FAQ cancel chưa xác nhận; legal xem câu "$5" ở hook.
- **coinin-notes-stamps-gems:** một funnel ba nhánh (tiền giấy/tem/đá); API identify theo từng loại; chuyên gia đá xem claim bong bóng vs đường kim và "real or fake"; mẫu "Use a sample" phải khớp catalog thật.
- **coinin-plant:** chưa xác nhận thương hiệu thuộc CoinIn hay PlantIn (chuỗi "CoinIn" và thư mục có thể đổi); API nhận diện cây và bảng nguyên nhân-kế hoạch cần chuyên gia thực vật duyệt (bốn ảnh demo là hình vẽ placeholder).
- **ayahpath-halal-finance:** BẮT BUỘC học giả duyệt mọi chữ Ả Rập, bản dịch Sahih International (57:7, 65:2-3, 11:6), chủ đề tuần và câu hỏi suy ngẫm, và xác nhận không giống fatwa hay lời hứa về rizq.
- **ayahpath-arabic:** BẮT BUỘC học giả và nhà ngôn ngữ Ả Rập duyệt toàn bộ chữ, tashkil, phiên âm, nghĩa, số lần xuất hiện, và tổng 29 từ (quy ước Hafs); công thức phút ÷ 2.5 và các mốc 3/7 ngày là giả định; "Hear it" (audio từng từ) cần xác nhận app có thật.

## Sau khi thanh toán

Cả **43 funnel** đều có API `window.IkFunnel`. Checkout báo lại cho funnel bằng một trong hai cách: gọi `window.IkFunnel.completePurchase(plan)`, hoặc redirect về funnel với `?paid=<plan>`. Với offer, giá trị `plan` là `'offer'` (người mua offer chỉ thấy phần nội dung nhỏ hơn của offer, trừ MyGrowth và AyahPath vẫn vào màn payoff chung). Khi `checkoutUrl` của gói được điền, nút mua chuyển sang URL đó kèm `?funnel=<id>&plan=<plan>`.

Riêng Calmio: nếu user vừa gõ nội dung khủng hoảng, `completePurchase('offer')` / `?paid=offer` bị từ chối và offer không hiện lại; `completePurchase` chờ user đóng bảng hỗ trợ.

## Event

- Mỗi event được gửi qua `ikfunnel:<event>` (window CustomEvent), qua `postMessage` lên trang cha (`source:'ikame-funnel'`), và qua `fbq` / `ttq` nếu có (một số app còn đẩy vào `window.dataLayer`).
- **Event chính:** `funnel_start`, `screen_view`, `answer`, `lead`, `paywall_view`, `plan_select`, `checkout_click`, `paywall_close`, `purchase_complete` / `complete`.
- **Event của offer:** `offer_view`, `offer_accept`, `offer_decline`.
- `funnel_start` bắn ngay khi tải trang, nên listener phải gắn trước khi script của funnel chạy.

Không event nào gửi email thô, nội dung chat hay ảnh, và không funnel nào đưa email vào URL checkout (URL chỉ có `funnel`, `plan` và các tham số `utm_*`/pass-through, không có email).

**Email nhắc gia hạn (Testlibrary):** `CONFIG.reminder` mặc định `false` ở cả 6 funnel testlibrary nên dòng "We'll email you 2 days before your trial ends" bị ẩn. Chỉ đặt `true` khi email nhắc thật sự được gửi.

## Lưu ý

- **Ảnh hiện là placeholder hoặc bản tạm:** `IKAME_AI_KEY` chưa được đặt khi build, nên chưa gen ảnh thật. Chạy `gen_images.py` trong từng thư mục funnel (đặt `IKAME_AI_KEY`, model `gemini-3.1-flash-image`) rồi xuất lại bằng `build_export.py`. Các funnel `mygrowth-anatomy`, `mygrowth-genealogy`, `coursiv-ai-automation`, `coursiv-ai-career` không nhúng ảnh nào (dùng placeholder CSS/SVG); `mygrowth-genealogy` còn khai báo 7 ảnh chưa có file nên bị bỏ khỏi map khi xuất.
- **Sức khoẻ:** Calmio (9), Testlibrary autism/ADHD/brain/relationship (4) đều cần review sức khoẻ trước khi chạy ads: không claim y khoa, link "Need help now?" phải hoạt động, ads không ám chỉ thuộc tính cá nhân ("Do you have ADHD?"). Hypnosis và calm-kids cần review lâm sàng/chuyên gia riêng.
- **18+:** 3 funnel Chai là 18+, câu chữ SFW, giữ age gate (tháng + năm sinh, lưu trong sessionStorage).
- **Tôn giáo:** AyahPath cần học giả duyệt trước mọi traffic. Các niche Christian/Bible đã bỏ qua, không có trong đợt này.
- **CoinIn plant:** chưa xác nhận thương hiệu thuộc CoinIn hay PlantIn; chuỗi "CoinIn" có thể phải đổi.
- **Bản quyền:** EWA movies/books chỉ dùng tên text và nội dung gốc; không dùng poster, clip, trang sách thật khi chưa được duyệt.

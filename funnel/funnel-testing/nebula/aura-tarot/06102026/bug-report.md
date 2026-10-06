# Starlyn – aura-tarot – UI Bug Report (06/10/2026)

Giả định: review từ screenshot của file local `funnel/funnel-development/nebula/aura-tarot/funnel.html` (deep-jump từng màn + 1 lượt walk thật tới paywall), viewport small 375×667 và large 430×932; không có Figma, đối chiếu theo `funnel-content.md` và product rules Starlyn; capture.json không ghi nhận issue tự động nào, walk.errors rỗng; luồng under-18 không có trong bộ capture nên chưa kiểm tra.

### Intro 1 (hook)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 1 | [UI][Intro 1] Ảnh hero có đường viền hình chữ nhật lạ đè lên silhouette | Medium | - Ở ảnh hero (id: hook), một đường viền mảnh màu vàng-xanh hình chữ nhật/vòm đè ngang thân silhouette (ngang eo), cả small và large; lỗi tương tự ở Intro 14 (khung chữ nhật quanh thân + 2 đường kẻ dọc mép trái/phải ảnh) và Intro 19 (2 đường kẻ dọc mép ảnh). | - Ảnh hero chỉ hiển thị halo quanh silhouette trên nền sao, không có đường viền/khung lạ (Spec Visual #1, #14, #19). Cần đối chiếu Figma. | Screenshot/Video: screens/01-hook-small.png, screens/01-hook-large.png, screens/14-aura_reveal-large.png, screens/14-aura_reveal-small-p1.png, screens/19-teaser-large.png |
| 2 | [UI/UX][Intro 1] Text "Terms of Use" / "Privacy Policy" không nhận biết được là link | High | - Microcopy "By continuing you confirm you're 18+ and agree to our Terms of Use and Privacy Policy..." hiển thị "Terms of Use" và "Privacy Policy" cùng màu, cùng kiểu với text thường, không underline; tương tự ở Intro 18 (email). Trong khi footer Paywall 1 có underline cho các link này. | - Spec chưa định nghĩa – cần PM/Designer confirm. Đề xuất "Terms of Use"/"Privacy Policy" là link bấm được, style đồng nhất với footer Paywall; nếu là link thì tap target tối thiểu 44pt theo Apple HIG – cần Designer confirm. | Screenshot/Video: screens/01-hook-small.png, screens/18-email-small.png, screens/20-paywall-small-p4.png |
| 3 | [UI][Responsive][Intro 1] Khoảng trống lớn giữa cụm chip và CTA trên màn hình large | Low | - Ở viewport 430×932, sau dòng chip "2-min quiz · Your color · 3 cards" là một vùng trống rất lớn (gần nửa màn hình) trước button "Start quiz"; ở small khoảng trống này nhỏ hơn nhiều. | - Spec chưa định nghĩa – cần PM/Designer confirm bố cục trên màn hình cao (vd. căn giữa nội dung hoặc tăng kích thước hero). | Screenshot/Video: screens/01-hook-large.png, screens/01-hook-small.png |

### Intro 2 (energy_now)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 4 | [UI/UX][Intro 2] Hiển thị đồng thời 2 bộ đếm tiến trình khác nhau "1/10" và "1 OF 6" | Medium | - Trên các màn câu hỏi Intro 2–7 (id: energy_now → crave), header góc phải hiển thị "1/10"…"6/10" trong khi tag phía trên câu hỏi hiển thị "1 OF 6"…"6 OF 6"; hai con số khác nhau cùng lúc khiến user khó hiểu còn bao nhiêu bước. Không có progress bar. | - Spec chỉ định nghĩa tag "1 of 6" phía trên câu hỏi; bộ đếm "x/10" trên header Spec chưa định nghĩa – cần PM/Designer confirm giữ một kiểu chỉ báo tiến trình. | Screenshot/Video: screens/02-energy_now-small.png, screens/03-around_people-small.png, screens/07-crave-small.png, screens/02-energy_now-large.png |

### Intro 3 (around_people)

Không phát hiện lỗi.

### Intro 4 (st_rooms)

Không phát hiện lỗi.

### Intro 5 (friends_call)

Không phát hiện lỗi.

### Intro 6 (st_alone)

Không phát hiện lỗi.

### Intro 7 (crave)

Không phát hiện lỗi.

### Intro 8 (bridge)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 5 | [UI][Intro 8] Ảnh halo hiển thị dạng khối chữ nhật full-width, cạnh trên cắt cứng thay vì "round well" | Low | - Ảnh halo (id: bridge) là một khối chữ nhật full-width, cạnh trên cắt thẳng tạo đường ranh giới rõ với nền; trên large ảnh nằm giữa màn với khoảng trống lớn phía trên và dưới. Màn loader Intro 13 cũng có ảnh hero cạnh trên cắt cứng ngay dưới band tiêu đề. | - Theo Spec #8: "A soft halo shifting through hues in a round well" – ảnh cần nằm trong khung tròn, mép mềm. Với Intro 13: Spec chưa định nghĩa – cần Designer confirm. Cần đối chiếu Figma. | Screenshot/Video: screens/08-bridge-small.png, screens/08-bridge-large.png, screens/13-loader-small.png |

### Intro 9 (color_pull)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 6 | [UI][Intro 9] Các orb màu chưa chọn bị cắt vuông 4 cạnh và có vệt tối hình lưỡi liềm | Medium | - Ở màn chọn màu (id: color_pull), 5 orb chưa chọn (Red, Amber, Green, Blue, Violet) bị cắt phẳng ở mép trên/dưới/trái/phải và có vệt tối lệch ở góc dưới phải, không còn tròn; chỉ orb đang chọn (Indigo, viền vàng) hiển thị tròn đúng. Xảy ra cả small và large. | - Theo Spec #9: "Six large color orbs ... each glowing softly in its own color" – mọi orb cần hiển thị tròn trọn vẹn với glow mềm, không bị cắt. | Screenshot/Video: screens/09-color_pull-small.png, screens/09-color_pull-large.png |

### Intro 10 (focus)

Không phát hiện lỗi.

### Intro 11 (birth_date)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 7 | [UI/UX][Intro 11] Ba ô chọn Month / Day / Year không có icon dropdown | Low | - Ba ô "May", "14", "1994" (id: birth_date) hiển thị như text box thường, không có chevron/icon dropdown, user khó nhận biết đây là select có thể bấm để đổi. | - Spec #11 chỉ ghi "Three rounded selects in one row"; affordance dropdown Spec chưa định nghĩa – cần PM/Designer confirm. Cần đối chiếu Figma. | Screenshot/Video: screens/11-birth_date-small.png, screens/11-birth_date-large.png |

### Intro 12 (name)

Không phát hiện lỗi.

### Intro 13 (loader)

Không phát hiện lỗi.

### Intro 14 (aura_reveal)

Không phát hiện lỗi.

### Intro 15 (shuffle)

Không phát hiện lỗi.

### Intro 16 (pull)

Không phát hiện lỗi.

### Intro 17 (three_cards)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 8 | [UI/UX][Intro 17] Tiêu đề các dòng bị khóa bị blur hoàn toàn, không đọc được | Medium | - Dòng khóa dưới 3 lá bài (id: three_cards) hiển thị text bị blur hoàn toàn, chỉ thấy icon khóa; tương tự 4 dòng khóa ở Intro 19 (teaser). User không biết nội dung bị khóa là gì. | - Theo Spec #17: faded row "How the three connect" with a lock; Spec #19: locked rows "How the three connect", "Your 30-day aura plan", "Your {{focus}} guidance", "Your aura in each area of life" – tiêu đề cần đọc được (faded), chỉ phần nội dung bị khóa. Cần Designer confirm. | Screenshot/Video: screens/17-three_cards-small.png, screens/17-three_cards-large.png, screens/19-teaser-small-p2.png, screens/19-teaser-large.png |

### Intro 18 (email)

Không phát hiện lỗi.

### Intro 19 (teaser)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 9 | [UI][Intro 19] Câu link aura–card khác copy trong Spec | Low | - Màn teaser (id: teaser) hiển thị "Your Indigo aura meets The High Priestess." / "Your Indigo aura meets The Devil.". | - Theo Spec #19: "Your {{aura}} aura leans toward {{card}}". | Screenshot/Video: screens/19-teaser-small-p1.png, screens/19-teaser-large.png |

### Paywall 1 (paywall)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 10 | [UI][Paywall 1] Hero không hiển thị 3 card backs, có khung chữ nhật nhỏ lạc giữa ảnh | Medium | - Hero paywall (id: paywall) chỉ có ảnh nến + luồng sáng tím; không thấy 3 lá bài úp, giữa ảnh có một khung chữ nhật viền mảnh nhỏ và một vệt ngang mờ ở mép dưới ảnh. Xảy ra cả small và large. | - Theo Spec #20 mục Hero: "the aura halo with the three card backs" – hiển thị 3 card backs rõ ràng, không có khung/viền lạ. | Screenshot/Video: screens/20-paywall-small-p1.png, screens/20-paywall-large-p1.png |
| 11 | [UI][Paywall 1] Màu halo trên hero không đổi theo màu aura kết quả | Medium | - Khi walk thật cho kết quả "Your Red aura" (chip "Your aura: Red"), hero paywall vẫn hiển thị halo màu tím/indigo giống hệt kết quả Indigo. | - Theo Spec: "the aura color is the one accent that changes per result" – halo hero cần theo màu aura của user. Cần PM/Designer confirm nếu hero là ảnh tĩnh. | Screenshot/Video: screens/walk-end-paywall (paywall).png, screens/20-paywall-small-p1.png |
| 12 | [UI][Paywall 1] Dòng "Due today" lặp chữ "today" ở giá trị | Low | - Trong cả 2 plan block, dòng tổng hiển thị "Due today" bên trái và "$13.67 today" bên phải, lặp từ "today". | - Spec #20 chỉ ghi "Due today"; format giá trị Spec chưa định nghĩa – cần PM/Designer confirm (vd. chỉ "$13.67"). | Screenshot/Video: screens/20-paywall-small-p4.png, screens/20-paywall-large-p1.png |
| 13 | [UI][Paywall 1] Footer thiếu thông tin entity (tên pháp nhân) | High | - Footer chỉ hiển thị "Terms of Use", "Privacy Policy", "Subscription terms", "Support: support@starlyn.co" và "For entertainment purposes only."; không thấy tên pháp nhân/entity. | - Theo Spec #20 mục 9: "Footer: legal links, entity, entertainment disclaimer." Cần PM confirm nếu entity đang ẩn do chưa cấu hình. | Screenshot/Video: screens/20-paywall-small-p4.png, screens/20-paywall-large-p4.png |

### Upsale 1 (report_upsell)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 14 | [UI][Upsale 1] Ảnh cover report là silhouette đen phẳng thay vì ảnh reveal-aura | Medium | - Cover card "Chakra Balance Report" (id: report_upsell) hiển thị một khối silhouette đen phẳng (đầu + vai) trên nền gradient tím, đè lên label "STARLYN REPORT" và tên report. | - Theo Spec #21: "Report cover card (img/reveal-aura.jpg under a dark fade, 'Starlyn report' label, the report name)". | Screenshot/Video: screens/21-report_upsell-small-p1.png, screens/21-report_upsell-large.png |

### Download App (get_app)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 15 | [UI][Download App] Icon trên badge "Download on the App Store" không phải logo Apple | Medium | - Badge App Store (id: get_app) hiển thị icon dạng outline giống hình răng/trái tim thay vì logo Apple; badge Google Play dùng icon tam giác outline. | - Spec #22 ghi "App Store and Google Play badges"; style badge Spec chưa định nghĩa – cần PM/Designer confirm (đề xuất dùng badge chính thức). Cần đối chiếu Figma. | Screenshot/Video: screens/22-get_app-small.png, screens/22-get_app-large.png |

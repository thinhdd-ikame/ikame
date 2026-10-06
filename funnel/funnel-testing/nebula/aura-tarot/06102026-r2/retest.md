# Starlyn – aura-tarot – Retest (06/10/2026, lượt 2)

Giả định: review từ screenshot lượt 2 của `funnel-development/nebula/aura-tarot/funnel.html` (deep-jump từng màn + walk thật tới paywall, walk không lỗi, capture.json không có auto-issue), viewport 375×667 và 430×932; đối chiếu `funnel-content.md` và product rules Starlyn. Luồng under-18 không có trong bộ capture nên chưa kiểm tra.

**Tóm tắt:** 15 bug cũ – Fixed 12 · Partly fixed 2 · Not fixed 0 · Cần PM 1 · Không verify được 0; Bug mới: 3 (Medium 1, Low 2).

| # cũ | Title | Severity | Status lượt 2 | Ghi chú | Attachment |
|---|---|---|---|---|---|
| 1 | [UI][Intro 1] Ảnh hero có đường viền hình chữ nhật lạ đè lên silhouette | Medium | Partly fixed | Intro 1 (01-hook-*) và Intro 14 (14-aura_reveal-*) không còn khung/viền lạ. Intro 19 vẫn còn 2 đường kẻ dọc mờ ở mép trái/phải ảnh hero (x≈15pt và x≈415pt trên large), nhìn rõ hơn khi tăng sáng; Intro 14 còn một vệt dọc rất mờ ở mép phải. Độ tin cậy trung bình vì line rất mờ. | Screenshot/Video: screens/01-hook-small.png, screens/01-hook-large.png, screens/14-aura_reveal-large.png, screens/19-teaser-large.png, screens/19-teaser-small-p1.png |
| 2 | [UI/UX][Intro 1] Text "Terms of Use" / "Privacy Policy" không nhận biết được là link | High | Fixed | "Terms of Use" / "Privacy Policy" đã underline ở Intro 1 và Intro 18, đồng nhất với footer Paywall 1. Kích thước tap target không đo được từ ảnh tĩnh (capture.json không báo tap target nhỏ). | Screenshot/Video: screens/01-hook-small.png, screens/01-hook-large.png, screens/18-email-small.png, screens/18-email-large.png |
| 3 | [UI][Responsive][Intro 1] Khoảng trống lớn giữa cụm chip và CTA trên màn hình large | Low | Fixed | Hero ở large đã cao hơn, khoảng trống giữa chip và "Start quiz" giảm từ gần nửa màn còn khoảng 120pt. Còn khoảng trống nhỏ, chấp nhận được – độ tin cậy trung bình, Designer có thể confirm. | Screenshot/Video: screens/01-hook-large.png |
| 4 | [UI/UX][Intro 2] Hiển thị đồng thời 2 bộ đếm tiến trình khác nhau "1/10" và "1 OF 6" | Medium | Fixed | Tag "x OF 6" đã bỏ, chỉ còn bộ đếm "1/10"…"10/10" trên header kèm progress bar mới. Lưu ý brief #2–#7 vẫn ghi tag "1 of 6" – cần sync lại brief. Progress bar mới phát sinh bug N1, N2. | Screenshot/Video: screens/02-energy_now-small.png, screens/07-crave-small.png, screens/12-name-small.png |
| 5 | [UI][Intro 8] Ảnh halo hiển thị dạng khối chữ nhật full-width, cạnh trên cắt cứng thay vì "round well" | Low | Fixed | Ảnh halo Intro 8 đã nằm trong khung tròn mép mềm (fade), không còn cạnh trên cắt cứng; Intro 13 cũng đã fade mềm. | Screenshot/Video: screens/08-bridge-small.png, screens/08-bridge-large.png, screens/13-loader-small.png |
| 6 | [UI][Intro 9] Các orb màu chưa chọn bị cắt vuông 4 cạnh và có vệt tối hình lưỡi liềm | Medium | Partly fixed | Vệt tối lưỡi liềm đã gần như hết, nhưng 5 orb chưa chọn (Red, Amber, Green, Blue, Violet) vẫn bị cắt phẳng ở mép trái/phải/trên/dưới (thấy rõ vạch dọc hai bên và vệt sáng phẳng ở đáy orb), cả small và large. Orb Indigo đang chọn vẫn tròn đúng. | Screenshot/Video: screens/09-color_pull-small.png, screens/09-color_pull-large.png |
| 7 | [UI/UX][Intro 11] Ba ô chọn Month / Day / Year không có icon dropdown | Low | Fixed | Ba ô Month / Day / Year đã có chevron dropdown. | Screenshot/Video: screens/11-birth_date-small.png, screens/11-birth_date-large.png |
| 8 | [UI/UX][Intro 17] Tiêu đề các dòng bị khóa bị blur hoàn toàn, không đọc được | Medium | Fixed | Intro 17 hiển thị rõ "How the three connect" + icon khóa; Intro 19 hiển thị rõ 4 dòng khóa "How the three connect", "Your 30-day aura plan", "Your love guidance", "Your aura in each area of life". | Screenshot/Video: screens/17-three_cards-small.png, screens/17-three_cards-large.png, screens/19-teaser-small-p2.png, screens/19-teaser-large.png |
| 9 | [UI][Intro 19] Câu link aura–card khác copy trong Spec | Low | Fixed | Copy đã đúng brief: "Your Indigo aura leans toward The Empress." / "... leans toward The Tower." | Screenshot/Video: screens/19-teaser-small-p1.png, screens/19-teaser-large.png |
| 10 | [UI][Paywall 1] Hero không hiển thị 3 card backs, có khung chữ nhật nhỏ lạc giữa ảnh | Medium | Fixed | Hero paywall đã hiển thị halo + 3 card backs, không còn khung chữ nhật nhỏ / vệt ngang. | Screenshot/Video: screens/20-paywall-small-p1.png, screens/20-paywall-large-p1.png |
| 11 | [UI][Paywall 1] Màu halo trên hero không đổi theo màu aura kết quả | Medium | Fixed | Walk thật ra kết quả Red: hero paywall hiển thị halo đỏ/cam (chip "Your aura: Red"); deep-jump Indigo hiển thị halo tím-xanh. | Screenshot/Video: screens/walk-end-paywall (paywall).png, screens/20-paywall-small-p1.png |
| 12 | [UI][Paywall 1] Dòng "Due today" lặp chữ "today" ở giá trị | Low | Fixed | Plan block hiển thị "Due today" / "$13.67", không còn lặp "today". Sticky bottom bar dùng nhãn "1 week, then monthly" + "$13.67 today" nên không lặp. | Screenshot/Video: screens/20-paywall-small-p4.png, screens/20-paywall-large-p1.png |
| 13 | [UI][Paywall 1] Footer thiếu thông tin entity (tên pháp nhân) | High | Cần PM | Footer vẫn chỉ có "Terms of Use", "Privacy Policy", "Subscription terms", "Support: support@starlyn.co", "For entertainment purposes only." – chưa có tên pháp nhân. Đúng như dev báo, chờ PM cung cấp entity. | Screenshot/Video: screens/20-paywall-small-p4.png, screens/20-paywall-large-p4.png |
| 14 | [UI][Upsale 1] Ảnh cover report là silhouette đen phẳng thay vì ảnh reveal-aura | Medium | Fixed | Cover card đã dùng ảnh reveal-aura (silhouette trong halo) dưới lớp fade tối, label "STARLYN REPORT" + "Chakra Balance Report" đọc rõ. | Screenshot/Video: screens/21-report_upsell-small-p1.png, screens/21-report_upsell-large.png |
| 15 | [UI][Download App] Icon trên badge "Download on the App Store" không phải logo Apple | Medium | Fixed | Badge "Download on the App Store" đã dùng logo Apple, badge "GET IT ON Google Play" dạng badge chính thức. | Screenshot/Video: screens/22-get_app-small.png, screens/22-get_app-large.png |

## Bug mới

### Intro 8

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| N1 | [UI/UX][Intro 8] Progress bar nhảy lên 100% ở màn bridge rồi tụt về 7/10 ở màn sau | Medium | - Intro 7 hiển thị "6/10" (bar ~60%), Intro 8 "Your colors are showing" hiển thị progress bar full 100% và không có bộ đếm, sang Intro 9 bar tụt về ~70% với "7/10", khiến user tưởng đã xong rồi lại bị lùi. Chọn Medium thay vì High vì màn bridge không hiển thị số đếm. | - Progress bar tăng dần liên tục giữa các màn (vd. giữ ~60–65% hoặc ẩn bar ở màn bridge) – Spec chưa định nghĩa – cần PM/Designer confirm. | Screenshot/Video: screens/07-crave-small.png, screens/08-bridge-small.png, screens/08-bridge-large.png, screens/09-color_pull-small.png |

### Intro 2

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| N2 | [UI][Intro 2] Headline nằm sát progress bar mới, gần như không có khoảng cách | Low | - Progress bar mới thêm ở header nằm ngay trên headline, khoảng cách chỉ ~6–8pt (vd. "How do you feel right now?", "Which color pulls you in?", "When were you born?", "Pick three cards"), trên mọi màn có header Intro 2–7, 9–12, 16–18, cả small và large; nhìn chật so với khoảng cách headline–body bên dưới. | - Có khoảng cách rõ giữa progress bar và headline – Cần đối chiếu Figma (giá trị spacing). | Screenshot/Video: screens/02-energy_now-small.png, screens/02-energy_now-large.png, screens/09-color_pull-small.png, screens/11-birth_date-small.png, screens/16-pull-small.png |

### Upsale 1

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| N3 | [UI][Responsive][Upsale 1] Microcopy dưới report card bị đẩy xuống dưới CTA trên màn hình nhỏ | Low | - Trên small 375×667, ở viewport đầu dòng "Paid once through secure checkout. No subscription." dưới report card không hiển thị (CTA "Add for $19.99" nằm ngay dưới card), chỉ thấy sau khi cuộn; trên large dòng này hiển thị ngay dưới card. Low vì price row đã có "Paid once · no subscription". | - Microcopy hiển thị dưới card (brief #21: Under the card) và thấy được ở viewport đầu trên màn nhỏ – Spec chưa định nghĩa cho màn nhỏ – cần PM/Designer confirm. | Screenshot/Video: screens/21-report_upsell-small-p1.png, screens/21-report_upsell-small-p2.png, screens/21-report_upsell-large.png |

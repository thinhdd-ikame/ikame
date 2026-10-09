# Starlyn – witch-power – Retest (06/10/2026, lượt 2)

Giả định: retest bản local `funnel-development/nebula/witch-power/funnel.html` sau commit fix 47087fd, qua screenshot deep-jump 375×667 / 430×932 + walk tự động (capture.json: walk tới paywall, không lỗi, không auto-issue); spec = `funnel-content.md` (đã cập nhật trong commit fix) + product rule Starlyn (không có Figma). Animation (flip bài, count-up loader) có thể đang dở trong ảnh tĩnh và không tính là lỗi.

**Tổng kết:** 8 bug cũ – Fixed: 7, Cần PM: 1. Bug mới: 5 (High: 1, Medium: 1, Low: 3).

| # cũ | Title | Severity | Status lượt 2 | Ghi chú | Attachment |
|---|---|---|---|---|---|
| 1 | [UI][Intro 1] Ảnh hero không full-bleed, dải nền ở mép trên cắt mất đỉnh trăng | Low | Fixed | Hero đổi sang hình trăng khuyết + chart wheel vẽ trên nền sao, không còn khung ảnh/dải nền ở mép trên, đỉnh trăng hiển thị đủ (small và large). | Screenshot/Video: screens/01-hook-small.png, screens/01-hook-large.png |
| 2 | [UI][Intro 1] Ảnh minh họa trăng/chart wheel bị răng cưa và lộ khung chữ nhật của ảnh | Medium | Fixed | Hình trăng/chart wheel sắc nét, hòa vào nền, không còn mép chữ nhật ở Intro 1, Intro 18, Intro 19 và Paywall 1. | Screenshot/Video: screens/01-hook-large.png, screens/18-loader-small.png, screens/19-big_three-small-p1.png, screens/22-paywall-small-p1.png |
| 3 | [UI][Responsive][Intro 1] Viewport large: khoảng trống lớn giữa nội dung và CTA ghim đáy | Low | Fixed | Trên large, nội dung Intro 1, Intro 20, Intro 21, Upsale 1, Download App được căn giữa theo chiều dọc (khoảng trống chia đều trên/dưới). Độ tin cậy trung bình: vẫn còn khoảng trống, mức chấp nhận cần Designer confirm. | Screenshot/Video: screens/01-hook-large.png, screens/20-email-large.png, screens/21-power_teaser-large.png, screens/23-report_upsell-large.png, screens/24-get_app-large.png |
| 4 | [UI][Intro 19] Dòng mô tả Sun viết thường chữ đầu, không đồng nhất với Moon/Rising | Low | Fixed | Mô tả Sun hiển thị "Your steady root: how you shine.", viết hoa chữ đầu như Moon/Rising. | Screenshot/Video: screens/19-big_three-small-p1.png, screens/19-big_three-large.png |
| 5 | [UI][Intro 21] Disc glyph power bị lệch trái và quầng glow bị cắt phẳng ở mép trên | Medium | Fixed | Disc 👁️ căn giữa cùng headline/chips, glow tròn đầy đủ, không bị cắt (small p1 và large). Ở small p2 disc trượt dưới header là do cuộn. | Screenshot/Video: screens/21-power_teaser-small-p1.png, screens/21-power_teaser-large.png |
| 6 | [UI][Paywall 1] Hero hiển thị trăng khuyết thay vì glyph power trên chart wheel | Low | Fixed | Hero paywall hiển thị glyph 👁️ (Seer) ở giữa chart wheel, kèm 4 fact chips (Your power, Sun, Moon, Rising). | Screenshot/Video: screens/22-paywall-small-p1.png, screens/22-paywall-large-p1.png |
| 7 | [UI][Paywall 1] Footer thiếu thông tin entity | High | Cần PM | Footer vẫn chỉ có "Terms of Use · Privacy Policy · Subscription terms" và "For entertainment purposes only.", chưa có tên pháp nhân/địa chỉ. Khớp trạng thái dev báo (chờ PM cung cấp thông tin entity). | Screenshot/Video: screens/22-paywall-small-p4.png, screens/22-paywall-large-p4.png |
| 8 | [UI][Download App] Badge App Store / Google Play dùng icon generic, không phải logo chính thức | Medium | Fixed | Badge dùng logo Apple và Google Play chính thức. | Screenshot/Video: screens/24-get_app-small.png, screens/24-get_app-large.png |

## Bug mới

Ghi chú: Terms of Use / Privacy Policy ở Intro 1 (hook) và màn Email hiện đã là link gạch chân trên cả small và large (tarot lượt 1 là text thường, chưa log) – không còn lỗi. Tap target 44px không đo được từ screenshot.

### Intro 15 (birth_date)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| N1 | [UI][Intro 15] Select ngày sinh và giờ sinh không có chevron, không đồng nhất với các funnel Starlyn khác | Low | - Ba ô Month / Day / Year ở Intro 15 (id: birth_date) và ba ô giờ / phút / AM-PM ở Intro 16 (id: birth_time) chỉ hiển thị giá trị, không có chevron báo đây là dropdown; sau đợt fix các funnel Starlyn khác (vd. aura-tarot) đã có chevron trên cùng loại select. | - Spec: "Month / Day / Year selects" và "Hour / minute / AM-PM selects" – select cần có chevron đồng nhất với các funnel Starlyn khác; cần Designer confirm. | Screenshot/Video: screens/15-birth_date-small.png, screens/16-birth_time-small.png, screens/16-birth_time-large.png |

### Paywall 1 (paywall)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| N2 | [UI/UX][Responsive][Paywall 1] Màn small không thấy CTA nào ở first view | High | - Trên 375x667, first view Paywall 1 chỉ có brand bar (chưa có mini CTA), hero, 4 fact chips và đầu plan card "1 week, then monthly"; dòng "Due today", button "Get my reading" và sticky bottom CTA đều không hiển thị, user phải cuộn mới thấy CTA. Trên 430x932 CTA hiển thị ngay first view. Lỗi đã có từ lượt 1 nhưng chưa được log; các funnel Starlyn khác (vd. astrocartography) đã được fix đưa CTA vào first view. | - Có ít nhất một CTA (button trong plan block, mini CTA trên brand bar hoặc sticky bottom CTA) hiển thị ở first view trên màn small, đồng nhất với fix "a CTA in the first view at 375x667" ở các funnel Starlyn khác. | Screenshot/Video: screens/22-paywall-small-p1.png, screens/22-paywall-large-p1.png |
| N3 | [UI][Paywall 1] Dòng "Due today" lặp chữ "today" ("$13.67 today") | Low | - Trong cả 2 plan block, dòng tổng hiển thị "Due today ... $13.67 today" (chữ "today" lặp 2 lần trên cùng một dòng); các funnel Starlyn khác sau đợt fix chỉ hiển thị giá ("Due today $13.67"). | - "Due today" chỉ hiển thị giá ($13.67), đồng nhất với các funnel Starlyn khác; cần PM/Designer confirm copy. | Screenshot/Video: screens/22-paywall-small-p4.png, screens/22-paywall-large-p1.png |
| N4 | [UI][Paywall 1] Nội dung cuộn vẫn lộ mờ phía sau sticky header | Low | - Khi cuộn Paywall 1, nội dung phía sau vẫn hiện mờ xuyên qua sticky header (vd. hàng payment badges "Apple Pay / G Pay / VISA / Mastercard", dòng "Download Starlyn: Daily Astrology..." / "Get the app"), chồng nhẹ dưới logo "Starlyn". Mức mờ thấp, chỉ thấy rõ khi nhìn kỹ; độ tin cậy trung bình. | - Sticky header che hoàn toàn nội dung phía sau (đồng nhất với fix "opaque sticky paywall bars"); cần đối chiếu Figma. | Screenshot/Video: screens/22-paywall-small-p2.png, screens/22-paywall-small-p3.png |

### Upsale 1 (report_upsell)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| N5 | [UI][Responsive][Upsale 1] Report card bị vùng CTA cắt mép dưới, microcopy bị ẩn trên màn small | Medium | - Trên 375x667 (id: report_upsell), mép dưới report card (ngay dưới dòng "$19.99 · Paid once · no subscription") bị vùng CTA "Add for $19.99" cắt ngang, mất viền và góc bo dưới của card; dòng "One-time payment at a secure checkout. No subscription." chỉ thấy khi cuộn (p2). Trên large card và microcopy hiển thị đầy đủ. | - Card hiển thị đầy đủ, microcopy dưới card hiển thị như large (brief #23). | Screenshot/Video: screens/23-report_upsell-small-p1.png, screens/23-report_upsell-small-p2.png, screens/23-report_upsell-large.png |


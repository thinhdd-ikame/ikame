# Starlyn – past-life – Retest (06/10/2026, lượt 2)

Giả định: retest trên bản local `funnel-development/nebula/past-life/funnel.html` sau commit fix 47087fd, screenshot deep-jump lượt 2 (`06102026-r2/screens/`, 375×667 và 430×932) + walk-through từ màn 1 tới paywall (không lỗi, auto-check không báo issue). Spec: brief `funnel-content.md` đã cập nhật + product rules Starlyn, không có Figma.

**Tổng kết:** 15 bug cũ – Fixed: 14, Not fixed: 0, Partly fixed: 0, Cần PM: 1, Không verify được: 0. Bug mới: 2 (Low: 2).

| # cũ | Title | Severity | Status lượt 2 | Ghi chú | Attachment |
|---|---|---|---|---|---|
| 1 | [UI][Intro 1] Silhouette trong hero nằm đè lên vòng era, che chấm era phía dưới | Low | Fixed | Silhouette nằm gọn trong vòng trong, không còn che chấm era; vòng era ở Intro 16/Paywall 1/Upsale 1 cũng không còn bị che. | Screenshot/Video: screens/01-hook-small.png, screens/01-hook-large.png |
| 2 | [UI/UX][Intro 1] Text "Terms of Use" và "Privacy Policy" không hiển thị dạng link | High | Fixed | "Terms of Use" và "Privacy Policy" đã có gạch chân ở Intro 1 và Intro 17, đồng nhất với footer Paywall 1. | Screenshot/Video: screens/01-hook-small.png, screens/17-email-small.png, screens/18-paywall-small-p4.png |
| 3 | [UI][Intro 2] Option selected có một vệt viền sáng mảnh ở mép phải | Low | Fixed | Option selected không còn vệt sáng ở mép phải trên các màn chọn option (small và large). | Screenshot/Video: screens/02-era-small.png, screens/02-era-large.png, screens/04-deja_vu-small.png |
| 4 | [UI][Intro 2] Không có vòng era ở background sáng lên theo era đã chọn | Low | Fixed | Đã có vòng era ở cuối màn, chấm Medieval (era đã chọn) sáng gold. | Screenshot/Video: screens/02-era-small.png, screens/02-era-large.png |
| 5 | [UI][Intro 7] Statement không hiển thị dạng statement card lớn | Low | Fixed | Statement hiển thị trong card lớn có eyebrow "STATEMENT", phía dưới 3 pill option. | Screenshot/Video: screens/07-statement_friends-small.png, screens/08-statement_old_things-large.png, screens/09-statement_fears-small.png |
| 6 | [UI/UX][Intro 14] Ô Month/Day/Year không có icon dropdown | Low | Fixed | 3 ô Month/Day/Year đã có chevron. | Screenshot/Video: screens/14-birth_date-small.png, screens/14-birth_date-large.png |
| 7 | [UI][Intro 15] Icon era trên cùng của vòng era bị cắt mất nửa trên | Medium | Fixed | Icon era trên cùng hiển thị đầy đủ, cách headline "Finding your past life" một khoảng. | Screenshot/Video: screens/15-loader-small.png, screens/15-loader-large.png |
| 8 | [UI][Intro 15] Loader hiển thị số phần trăm "15%" trong progress ring | Low | Fixed | Progress ring chỉ còn icon đồng hồ cát, không còn số %. | Screenshot/Video: screens/15-loader-small.png, screens/15-loader-large.png |
| 9 | [UI][Intro 16] Role chip hiển thị màu xanh lá, không đồng bộ với era chip | Low | Fixed | Era chip "Medieval" và role chip "village herbalist" cùng màu gold, cùng chiều cao. | Screenshot/Video: screens/16-past_life_teaser-small-p1.png, screens/16-past_life_teaser-large.png |
| 10 | [UI][Intro 16] Hero không phải medallion tròn, ảnh chữ nhật lộ cạnh trên | Low | Fixed | Hero là medallion tròn (vòng gold bao ngoài vòng era), không còn ảnh chữ nhật lộ cạnh trên. | Screenshot/Video: screens/16-past_life_teaser-small-p1.png, screens/16-past_life_teaser-large.png |
| 11 | [UI][Paywall 1] Ảnh hero bị cắt phần trên vòng era ngay dưới khối headline | Medium | Fixed | Medallion hero hiển thị đầy đủ, không còn bị cắt mép trên. | Screenshot/Video: screens/18-paywall-small-p1.png, screens/18-paywall-large-p1.png |
| 12 | [UI][Paywall 1] Nội dung cuộn hiện xuyên qua sticky header | Low | Fixed | Sticky header đã che kín nội dung phía sau khi cuộn, không còn chữ xuyên qua vùng logo. | Screenshot/Video: screens/18-paywall-small-p2.png, screens/18-paywall-small-p3.png, screens/18-paywall-large-p2.png, screens/18-paywall-large-p4.png |
| 13 | [UI][Paywall 1] Footer thiếu thông tin entity | High | Cần PM | Vẫn chưa có tên entity ở footer (chỉ có Terms of Use / Privacy Policy / Subscription terms + disclaimer). Đúng như dev ghi "Cần PM", chờ PM cung cấp tên pháp nhân. | Screenshot/Video: screens/18-paywall-small-p4.png, screens/18-paywall-large-p4.png |
| 14 | [UI][Upsale 1] Ảnh cover report bị cắt phần trên vòng era | Medium | Fixed | Ảnh cover không còn bị cắt mép trên (vòng era hiển thị đủ). Tuy nhiên label/tên report giờ đè lên nửa dưới medallion, log thành bug mới N1. | Screenshot/Video: screens/19-report_upsell-small-p1.png, screens/19-report_upsell-large.png |
| 15 | [UI][Download App] Icon trên badge App Store không giống logo Apple | Medium | Fixed | Badge App Store đã dùng logo Apple chính thức. | Screenshot/Video: screens/20-get_app-small.png, screens/20-get_app-large.png |

## Bug mới

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| N1 | [UI][Upsale 1] Label "STARLYN REPORT" và tên report đè lên nửa dưới medallion trong cover card | Low | - Sau khi fix crop, medallion trong cover card "Karmic Lessons Report" được thu nhỏ đặt giữa card, nên label "STARLYN REPORT" và tên "Karmic Lessons Report" nằm đè lên nửa dưới vòng era, che 2 chấm era dưới cùng (small và large). | - Cần đối chiếu Figma: brief chỉ ghi ảnh dưới dark fade kèm label và tên report; chủ thể ảnh và text cần bố trí để không chồng lên nhau. | Screenshot/Video: screens/19-report_upsell-small-p1.png, screens/19-report_upsell-large.png |
| N2 | [UI][Download App] Icon trên badge Google Play là outline trắng đơn sắc, không phải logo chính thức | Low | - Badge "GET IT ON Google Play" dùng icon tam giác Play dạng outline trắng đơn sắc, trong khi badge App Store đã đổi sang logo Apple chính thức ở lượt fix này; lượt 1 không log điểm này nên có thể đã tồn tại từ trước. | - Cần đối chiếu Figma: badge store cần dùng đúng asset badge chính thức của Google Play (logo Play nhiều màu). | Screenshot/Video: screens/20-get_app-small.png, screens/20-get_app-large.png |

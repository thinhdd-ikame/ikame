# Starlyn – past-life – UI Bug Report (06/10/2026)

Giả định: review trên bản local `funnel-development/nebula/past-life/funnel.html` (screenshot deep-jump + walk-through từ màn 1, không có Figma – brief `funnel-content.md` + product rules Starlyn là spec), viewport 375×667 (small) và 430×932 (large).

### Intro 1 (hook)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 1 | [UI][Intro 1] Silhouette trong hero nằm đè lên vòng era, che chấm era phía dưới | Low | - Ở màn Hook (id: hook), hình silhouette màu đen nằm phía trước vòng tròn era, tràn ra ngoài vòng trong và che một phần chấm era ở góc dưới trái; cùng hình này lặp lại ở Intro 16, Paywall 1 và Upsale 1. | - Theo brief (Visual màn 1): silhouette "fading in behind" – nằm phía sau vòng era, không che các chấm era. | Screenshot/Video: screens/01-hook-small.png, screens/01-hook-large.png |
| 2 | [UI/UX][Intro 1] Text "Terms of Use" và "Privacy Policy" không hiển thị dạng link | High | - Ở Intro 1 (id: hook) và Intro 17 (id: email), "Terms of Use" và "Privacy Policy" trong dòng legal cùng màu, không gạch chân, không khác gì text thường, trong khi footer Paywall 1 hiển thị các link này có gạch chân. | - Spec chưa định nghĩa – cần PM/Designer confirm. Đề xuất hiển thị link đồng nhất với footer Paywall 1 để user nhận ra có thể bấm. | Screenshot/Video: screens/01-hook-small.png, screens/17-email-small.png, screens/18-paywall-small-p4.png |

### Intro 2 (era)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 3 | [UI][Intro 2] Option selected có một vệt viền sáng mảnh ở mép phải | Low | - Option đang selected (nền gold gradient) hiện một đường sáng mảnh dọc mép phải, không có ở mép trái; lặp lại trên mọi màn chọn option (Intro 2, 4, 5, 6, 7, 8, 9, 11, 12). | - Cần đối chiếu Figma: viền option selected cần đồng đều cả 4 cạnh. | Screenshot/Video: screens/02-era-small.png, screens/02-era-large.png, screens/04-deja_vu-small.png |
| 4 | [UI][Intro 2] Không có vòng era ở background sáng lên theo era đã chọn | Low | - Màn "Which era feels like home?" (id: era) chỉ có 5 option trên nền sao, không có vòng era nào ở background. | - Theo brief (Visual màn 2): "The ring in the background lights the picked era." | Screenshot/Video: screens/02-era-small.png, screens/02-era-large.png |

### Intro 3 (honest_frame)

Không phát hiện lỗi.

### Intro 4 (deja_vu)

Không phát hiện lỗi.

### Intro 5 (dreams)

Không phát hiện lỗi.

### Intro 6 (familiar_place)

Không phát hiện lỗi.

### Intro 7 (statement_friends)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 5 | [UI][Intro 7] Statement không hiển thị dạng statement card lớn | Low | - Ở Intro 7, 8, 9 (id: statement_friends, statement_old_things, statement_fears), câu statement chỉ hiển thị như headline thường, phía dưới là 3 option, không có card. | - Theo brief (Visual màn 7–9): "Large statement card, three pill options". | Screenshot/Video: screens/07-statement_friends-small.png, screens/08-statement_old_things-small.png, screens/09-statement_fears-small.png |

### Intro 8 (statement_old_things)

Không phát hiện lỗi.

### Intro 9 (statement_fears)

Không phát hiện lỗi.

### Intro 10 (echoes_bridge)

Không phát hiện lỗi.

### Intro 11 (talent)

Không phát hiện lỗi.

### Intro 12 (calling)

Không phát hiện lỗi.

### Intro 13 (name)

Không phát hiện lỗi.

### Intro 14 (birth_date)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 6 | [UI/UX][Intro 14] Ô Month/Day/Year không có icon dropdown | Low | - 3 ô chọn ngày sinh (id: birth_date) hiển thị giống text field, không có icon mũi tên/chevron báo đây là ô chọn. | - Spec chưa định nghĩa – cần PM/Designer confirm. | Screenshot/Video: screens/14-birth_date-small.png, screens/14-birth_date-large.png |

### Intro 15 (loader)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 7 | [UI][Intro 15] Icon era trên cùng của vòng era bị cắt mất nửa trên | Medium | - Ở màn loader (id: loader), icon era trên cùng (Ancient) bị cắt ngang phần trên, sát dưới headline "Finding your past life", trên cả small và large. | - Icon era cần hiển thị đầy đủ, không bị cắt (các icon era khác trên vòng và vòng ở Intro 10 đều hiển thị đủ). | Screenshot/Video: screens/15-loader-small.png, screens/15-loader-large.png |
| 8 | [UI][Intro 15] Loader hiển thị số phần trăm "15%" trong progress ring | Low | - Progress ring của loader hiển thị số phần trăm ("15%") ở giữa. | - Brief màn 15 ghi "a short progress ring" và "No percentage claims" – cần PM/Designer confirm có hiển thị số % hay không. | Screenshot/Video: screens/15-loader-small.png, screens/15-loader-large.png |

### Intro 16 (past_life_teaser)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 9 | [UI][Intro 16] Role chip hiển thị màu xanh lá, không đồng bộ với era chip | Low | - Ở teaser (id: past_life_teaser), era chip "Medieval" màu gold còn role chip "village herbalist" màu xanh lá, chiều cao 2 chip cũng không bằng nhau. | - Theo brief (Visual màn 16): "an era chip and a role chip in gold". | Screenshot/Video: screens/16-past_life_teaser-small-p1.png, screens/16-past_life_teaser-large.png |
| 10 | [UI][Intro 16] Hero không phải medallion tròn, ảnh chữ nhật lộ cạnh trên | Low | - Hero của teaser là ảnh chữ nhật full width, có một dải nền khác màu rõ rệt ở cạnh trên ngay dưới header, không có dạng medallion tròn. | - Theo brief (Visual màn 16): "A round medallion" chứa vòng era và silhouette. | Screenshot/Video: screens/16-past_life_teaser-small-p1.png, screens/16-past_life_teaser-large.png |

### Intro 17 (email)

Không phát hiện lỗi.

### Paywall 1 (paywall)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 11 | [UI][Paywall 1] Ảnh hero bị cắt phần trên vòng era ngay dưới khối headline | Medium | - Ảnh hero ở Paywall 1 (id: paywall) bị cắt ngang mép trên: phần trên vòng era và chấm era trên cùng bị mất, tạo cạnh thẳng ngay dưới dòng "Where you lived, your story, your lesson.". | - Ảnh hero (medallion) cần hiển thị đầy đủ, không bị cắt mép theo brief (Visual màn 18, mục Hero). | Screenshot/Video: screens/18-paywall-small-p1.png, screens/18-paywall-large-p1.png |
| 12 | [UI][Paywall 1] Nội dung cuộn hiện xuyên qua sticky header | Low | - Khi cuộn Paywall 1, text phía sau (vd. headline "From your answers to your story", payment badges, câu FAQ) vẫn nhìn thấy mờ xuyên qua sticky header, chồng lên vùng logo "Starlyn". | - Cần đối chiếu Figma: sticky header cần che nội dung phía sau để không bị chồng chữ. | Screenshot/Video: screens/18-paywall-small-p3.png, screens/18-paywall-large-p2.png, screens/18-paywall-large-p4.png |
| 13 | [UI][Paywall 1] Footer thiếu thông tin entity | High | - Footer Paywall 1 chỉ có link Terms of Use / Privacy Policy / Subscription terms và dòng disclaimer, không có tên entity. | - Theo brief (màn 18, mục 9): "Footer: legal links, entity, entertainment disclaimer". | Screenshot/Video: screens/18-paywall-small-p4.png, screens/18-paywall-large-p4.png |

### Upsale 1 (report_upsell)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 14 | [UI][Upsale 1] Ảnh cover report bị cắt phần trên vòng era | Medium | - Ở màn add-on (id: report_upsell), ảnh trong cover card "Karmic Lessons Report" bị cắt ở mép trên card: phần trên vòng era và các chấm era trên cùng bị mất. | - Cần đối chiếu Figma: ảnh cover cần được căn/crop để chủ thể không bị cắt. | Screenshot/Video: screens/19-report_upsell-small-p1.png, screens/19-report_upsell-large.png |

### Download App (get_app)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 15 | [UI][Download App] Icon trên badge App Store không giống logo Apple | Medium | - Badge "Download on the App Store" dùng icon hình quả táo không có cuống/lá, nhìn giống hình răng, không phải logo Apple. | - Cần đối chiếu Figma: badge store cần dùng đúng asset badge chính thức của App Store. | Screenshot/Video: screens/20-get_app-small.png, screens/20-get_app-large.png |

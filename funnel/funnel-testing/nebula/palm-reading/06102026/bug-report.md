# Starlyn – palm-reading – UI Bug Report (06/10/2026)

Giả định: test trên file local `funnel-development/nebula/palm-reading/funnel.html` (deep-jump từng màn + walk click-through từ màn 1 tới paywall, walk không có lỗi), viewport small 375×667 và large 430×932; không có Figma, spec = `funnel-content.md` + product rules Starlyn.

### Intro 1 (hook)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 1 | [UI/UX][Intro 1] Link "Terms of Use" / "Privacy Policy" có tap target quá nhỏ | High | - Ở màn Hook (id: hook) và màn Email (Intro 20, id: email), link "Terms of Use" và "Privacy Policy" trong dòng microcopy chỉ là text inline, vùng bấm đo được cao 27px (76×27 và 79×27), dễ bấm trượt trên mobile. | - Tap target tối thiểu 44pt theo Apple HIG – cần Designer confirm. | Screenshot/Video: screens/01-hook-small.png, screens/01-hook-large.png, screens/20-email-small.png, screens/20-email-large.png |

### Intro 2 (gender)
Không phát hiện lỗi.

### Intro 3 (hand)
Không phát hiện lỗi.

### Intro 4 (goal)
Không phát hiện lỗi.

### Intro 5 (goal_set)
Không phát hiện lỗi.

### Intro 6 (dob)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 2 | [UI/UX][Intro 6] 3 ô Month / Day / Year không có icon dropdown để nhận biết là select | Low | - Ở màn Date of birth (id: dob), 3 ô "May", "14", "1994" chỉ hiển thị giá trị trong khung bo góc, không có chevron/icon dropdown, nhìn giống text field tĩnh nên user khó biết có thể bấm để đổi ngày. | - Spec chỉ ghi "Month / Day / Year selects… Three rounded selects in one row", chưa định nghĩa affordance – cần PM/Designer confirm có cần icon dropdown hay không. | Screenshot/Video: screens/06-dob-small.png, screens/06-dob-large.png |

### Intro 7 (line_depth)
Không phát hiện lỗi.

### Intro 8 (palm_intro)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 3 | [UI][Intro 8] Hình minh họa bàn tay không hiển thị đủ 5 đường chỉ tay theo legend | Low | - Ở màn Palm intro (id: palm_intro), hình bàn tay chỉ thấy rõ đường hồng (Heart), xanh dương (Head) và một đoạn ngắn xanh lá (Life); không thấy đường vàng (Fate & money), đường tím (Marriage) chỉ là một chấm nhỏ, trong khi legend bên dưới liệt kê đủ 5 đường. Trạng thái giống nhau ở cả small và large. | - Theo spec: "Gold palm outline with the five coloured lines drawing in, plus a 2-column colour legend" – sau khi animation chạy xong cần thấy đủ 5 đường đúng màu legend (như hình minh họa ở màn Upload). Nếu ảnh chụp đang ở giữa animation thì cần Dev confirm trạng thái cuối. | Screenshot/Video: screens/08-palm_intro-small.png, screens/08-palm_intro-large.png, screens/16-upload-small.png |

### Intro 9 (fingers)
Không phát hiện lỗi.

### Intro 10 (texture)
Không phát hiện lỗi.

### Intro 11 (experience)
Không phát hiện lỗi.

### Intro 12 (feeling)
Không phát hiện lỗi.

### Intro 13 (sign_bridge)
Không phát hiện lỗi.

### Intro 14 (main_line)
Không phát hiện lỗi.

### Intro 15 (scan_guide)
Không phát hiện lỗi.

### Intro 16 (upload)
Không phát hiện lỗi.

### Intro 17 (analysis)
Không phát hiện lỗi.

### Intro 18 (line_trace)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 4 | [UI][Intro 18] Chấm vàng đầu ngón tay và đường chỉ tay không khớp vị trí bàn tay trên ảnh | Medium | - Ở màn Line trace (id: line_trace), khi label là "Analyzing Thumb", chấm vàng nằm ở mép trái gốc ngón trỏ chứ không nằm trên đầu ngón cái. Ở Intro 19 (id: report_teaser) và hero Paywall 1, các chấm nằm ở khe giữa các ngón/giữa thân ngón thay vì đầu ngón (đầu ngón cái và ngón út không có chấm), đường Life (xanh lá) chạy thẳng giữa lòng bàn tay thay vì vòng quanh gò ngón cái. Ở ảnh test của walk, overlay co cụm lệch khỏi lòng bàn tay. | - Theo spec: "A gold dot pops onto each fingertip in turn" và overlay "scaled to the hand box found in the photo" – chấm cần nằm trên đầu từng ngón tương ứng với label, các đường cần nằm trong vùng lòng bàn tay của ảnh. | Screenshot/Video: screens/18-line_trace-small.png, screens/18-line_trace-large.png, screens/19-report_teaser-small-p1.png, screens/19-report_teaser-large.png, screens/21-paywall-small-p1.png, screens/walk-end-paywall (paywall).png |

### Intro 19 (report_teaser)
Không phát hiện lỗi.

### Intro 20 (email)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 5 | [UI][Intro 20] Màn Email thiếu header (nút Back + logo Starlyn), title sát mép trên | Low | - Ở màn Email (id: email), không có header như các màn quiz trước (nút Back, logo "Starlyn"); title "Where should we send your reading?" bắt đầu gần sát mép trên màn hình ở cả small và large, khoảng cách phía trên khác hẳn các màn có header. | - Spec chưa định nghĩa header cho màn Email – cần PM/Designer confirm; nếu không dùng header thì title cần có khoảng cách phía trên đồng nhất với các màn khác (Cần đối chiếu Figma). | Screenshot/Video: screens/20-email-small.png, screens/20-email-large.png, screens/14-main_line-small.png |

### Paywall 1 (paywall)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 6 | [UI][Paywall 1] Thiếu section Rating + reviews và tên entity ở footer so với spec | High | - Trên cả small và large, sau section "How it works" (From your photo to your guide) là ngay section FAQ "Good to know", không có section Rating + reviews. Footer chỉ có "Terms of Use · Privacy Policy · Subscription terms", "Support: support@starlyn.co" và "For entertainment purposes only.", không có tên pháp nhân (entity). | - Theo spec thứ tự section: "5. Rating + reviews (from CONFIG, placeholders until real)" và "9. Footer with legal links and entity". Nếu cố ý ẩn reviews khi chưa có data thật thì cần PM confirm. | Screenshot/Video: screens/21-paywall-large-p2.png, screens/21-paywall-large-p3.png, screens/21-paywall-large-p4.png, screens/21-paywall-small-p4.png |

### Upsale 1 (report_upsell)
Không phát hiện lỗi.

### Download App (get_app)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 7 | [UI][Download App] Badge "Download on the App Store" dùng icon không phải logo Apple | Medium | - Ở màn Get the app (id: get_app), badge "Download on the App Store" hiển thị một icon outline giống hình trái tim/khiên thay cho logo Apple, trong khi badge Google Play dùng icon tam giác play. | - Spec ghi "App Store and Google Play badges under the CTA" – badge cần đúng logo/nhận diện của store (Cần đối chiếu Figma / badge chính thức của Apple). | Screenshot/Video: screens/23-get_app-small.png, screens/23-get_app-large.png |

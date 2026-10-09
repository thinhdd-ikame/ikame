# Starlyn – soulmate-sketch – UI Bug Report (06/10/2026)

Giả định: review trên bản local `funnel-development/nebula/soulmate-sketch/funnel.html` (screenshot deep-jump + walk-through từ màn 1, không có Figma – brief `funnel-content.md` + product rules Starlyn là spec), viewport 375×667 (small) và 430×932 (large).

### Intro 1 (1)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 1 | [UI/UX][Intro 1] Link "Terms" và "Privacy Policy" có tap target nhỏ | High | - Ở Intro 1 (id: 1) và Intro 21 (id: 21, màn email), link "Terms" chỉ có vùng bấm 35×27 và "Privacy Policy" 79×27 (đo tự động), nằm sát nhau trong dòng legal. | - Tap target tối thiểu 44pt theo Apple HIG – cần Designer confirm. | Screenshot/Video: screens/01-1-small.png, screens/01-1-large.png, screens/21-21-small.png |
| 2 | [UI][Intro 1] Nét outline gold lệch khỏi khuôn mặt trong ảnh sketch hero | Low | - Trên card hero, nét outline gold (mặt + vai) bị lệch sang phải so với khuôn mặt trong ảnh sketch, không trùng với đường nét khuôn mặt. | - Cần đối chiếu Figma: nét gold cần khớp với portrait (brief: "a half-drawn pencil portrait ... the finished strokes glowing gold"). | Screenshot/Video: screens/01-1-small.png, screens/01-1-large.png |

### Intro 2 (2)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 3 | [UI][Intro 2] Hiệu ứng sao băng vẽ đè lên card và text | Low | - Vệt sao băng trang trí chạy đè lên nội dung: ở large cắt ngang dòng "Your sketch is an AI illustration.", ở small chạm vào card step 2; lặp lại ở Intro 11. | - Cần đối chiếu Figma: hiệu ứng nền cần nằm dưới layer nội dung, không đè lên text/card. | Screenshot/Video: screens/02-2-small.png, screens/02-2-large.png, screens/11-11-small-p1.png |

### Intro 3 (3)

Không phát hiện lỗi.

### Intro 4 (4)

Không phát hiện lỗi.

### Intro 5 (5)

Không phát hiện lỗi.

### Intro 6 (6)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 4 | [UI/UX][Intro 6] Button Continue hiển thị enabled khi Month/Day/Year đang trống | Medium | - Ở màn ngày sinh (id: 6), cả 3 ô Month/Day/Year đang hiển thị placeholder nhưng button Continue vẫn ở trạng thái enabled (gold), trong khi Intro 8 và Intro 9 để Continue ở trạng thái disabled khi input trống. | - Trạng thái Continue khi chưa nhập cần đồng nhất giữa các màn input – Spec chưa định nghĩa – cần PM/Designer confirm. | Screenshot/Video: screens/06-6-small.png, screens/06-6-large.png, screens/08-8-large.png |
| 5 | [UI/UX][Intro 6] Ô Month/Day/Year không có icon dropdown | Low | - 3 ô chọn ngày sinh hiển thị giống text field, không có icon mũi tên/chevron báo đây là ô chọn. | - Spec chưa định nghĩa – cần PM/Designer confirm. | Screenshot/Video: screens/06-6-small.png, screens/06-6-large.png |

### Intro 7 (7)

Không phát hiện lỗi.

### Intro 8 (8)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 6 | [UI][Intro 8] Ô Time of birth hiển thị 2 icon đồng hồ | Medium | - Ô "Time of birth" (id: 8) có icon đồng hồ ở bên trái và thêm một icon đồng hồ khác ở bên phải, cả 2 cùng hiển thị. | - Cần đối chiếu Figma: ô input chỉ nên có 1 icon đồng hồ. | Screenshot/Video: screens/08-8-small.png, screens/08-8-large.png |

### Intro 9 (9)

Không phát hiện lỗi.

### Intro 10 (10)

Không phát hiện lỗi.

### Intro 11 (11)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 7 | [UI][Intro 11] Chip selected có một vệt viền sáng mảnh ở mép phải | Low | - Chip "Chart decides" đang selected (nền gold gradient) hiện một đường sáng mảnh dọc mép phải, không có ở mép trái. | - Cần đối chiếu Figma: viền chip selected cần đồng đều cả 4 cạnh. | Screenshot/Video: screens/11-11-small-p1.png, screens/11-11-large.png |
| 8 | [UI][Intro 11] Emoji ✨ trên chip "Chart decides" gần như không thấy trên nền gold | Low | - Khi chip "Chart decides" ở trạng thái selected, emoji ✨ màu vàng nằm trên nền gold nên rất khó nhìn thấy. | - Cần đối chiếu Figma: icon trên chip selected cần đủ độ tương phản. | Screenshot/Video: screens/11-11-small-p1.png, screens/11-11-large.png |

### Intro 12 (12)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 9 | [UI/UX][Intro 12] Màn multi-select dùng indicator dạng radio tròn | Low | - Màn "What must they have?" cho chọn tối đa 3 nhưng mỗi option có indicator hình tròn giống radio button (single-select). | - Cần đối chiếu Figma: brief ghi "Multi-select, 1-3 picks" và "selected ones fill solid with a small check"; indicator nên thể hiện được là chọn nhiều. | Screenshot/Video: screens/12-12-small.png, screens/12-12-large.png |

### Intro 13 (13)

Không phát hiện lỗi.

### Intro 14 (14)

Không phát hiện lỗi.

### Intro 15 (15)

Không phát hiện lỗi.

### Intro 16 (16)

Không phát hiện lỗi.

### Intro 17 (17)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 10 | [UI][Intro 17] Outline bàn tay nét đứt bị hở giữa các ngón | Low | - Trong khung camera (id: 17), outline bàn tay dạng nét đứt không liền: cạnh trong của các ngón dừng giữa chừng, không nối vào lòng bàn tay, nét ngón trỏ và ngón giữa chồng lên nhau. | - Cần đối chiếu Figma: outline cần là một đường liền mạch quanh bàn tay (brief: "palm-outline overlay"). | Screenshot/Video: screens/17-17-small.png, screens/17-17-large.png |

### Intro 18 (18)

Không phát hiện lỗi.

### Intro 19 (19)

Không phát hiện lỗi.

### Intro 20 (20)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 11 | [UI][Intro 20] Headline sát mép trên màn, không đồng nhất với các màn khác | Low | - Ở màn "test, your sketch is ready" (id: 20), headline nằm sát mép trên viewport, không có hàng back/progress, trong khi các màn trước đều có header và khoảng cách phía trên headline. | - Cần đối chiếu Figma: khoảng cách phía trên headline cần đồng nhất với các màn khác trong funnel. | Screenshot/Video: screens/20-20-small-p1.png, screens/20-20-large.png |

### Intro 21 (21)

Không phát hiện lỗi.

### Paywall 1 (22)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 12 | [UI/UX][Paywall 1] Không có sticky bottom CTA khi không còn plan block trên màn | High | - Khi cuộn qua các phần "Inside your reading", "How it works", FAQ (không có plan block trên màn), đáy màn không có thanh sticky CTA; chỉ còn mini CTA trên header. | - Theo brief (Visual màn 22): "a sticky bottom CTA while no plan block is visible". | Screenshot/Video: screens/22-22-small-p2.png, screens/22-22-small-p3.png, screens/22-22-large-p2.png |
| 13 | [UI][Paywall 1] Nội dung cuộn hiện xuyên qua sticky header | Low | - Khi cuộn Paywall 1, text phía sau (vd. "Log in with test@gmail.com...", eyebrow "QUESTIONS") vẫn nhìn thấy mờ xuyên qua sticky header, chồng lên vùng logo "Starlyn". | - Cần đối chiếu Figma: sticky header cần che nội dung phía sau để không bị chồng chữ. | Screenshot/Video: screens/22-22-small-p3.png, screens/22-22-large-p3.png |
| 14 | [UI][Paywall 1] Danh sách benefit không khớp copy trong brief | Low | - Mục "Everything in your reading" hiển thị 5 dòng: "Your partner sign", "Your soulmate sketch", "Their traits and what draws you", "Where and how you may meet", "Your love guidance in the app". | - Theo brief (Microcopy màn 22): benefit rows "Your soulmate sketch in full HD" / "Their nature, and where you may meet" / "Daily love forecast in the app". | Screenshot/Video: screens/22-22-small-p2.png, screens/22-22-large-p2.png |
| 15 | [UI][Paywall 1] Icon khóa không đồng nhất với các màn trước | Low | - Paywall 1 dùng emoji 🔒 màu (ở các dòng locked và "Secure checkout"), trong khi Intro 20 dùng icon khóa dạng line màu gold cho các dòng locked. | - Cần đối chiếu Figma: icon khóa cần cùng một style trong toàn funnel. | Screenshot/Video: screens/22-22-small-p2.png, screens/22-22-small-p4.png, screens/20-20-small-p2.png |
| 16 | [UI][Paywall 1] Lưới fact chip bị trống một ô | Low | - Khối fact chip ở hero có 3 chip (Sun, Name, Sketch) xếp lưới 2 cột nên ô bên phải hàng thứ 2 bị trống. | - Spec chưa định nghĩa – cần PM/Designer confirm. | Screenshot/Video: screens/22-22-small-p1.png, screens/22-22-large-p1.png |

### Upsale 1 (23)

Không phát hiện lỗi.

### Download App (24)

Không phát hiện lỗi.

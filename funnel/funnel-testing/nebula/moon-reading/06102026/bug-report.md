# Starlyn – moon-reading – UI Bug Report (06/10/2026)

Giả định: review từ screenshot của bản local `funnel-development/nebula/moon-reading/funnel.html`, viewport 375x667 (small) và 430x932 (large); walk từ màn 1 tới paywall không có lỗi; không có Figma, đối chiếu với funnel-content.md và product rules Starlyn.

### Intro 1 (id: 1)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 1 | [UI/UX][Intro 1] Link "Terms" và "Privacy Policy" có tap target quá nhỏ | High | - Ở dòng legal "By continuing, you agree to our Terms & Privacy Policy", link "Terms" chỉ cao khoảng 15px (35x15) và "Privacy Policy" khoảng 79x15, nằm sát nhau, khó bấm chính xác trên mobile. Lỗi tương tự ở Intro 20 (màn Email, id: 20) trên cả 2 viewport. | - Tap target tối thiểu 44pt theo Apple HIG – cần Designer confirm. | Screenshot/Video: screens/01-1-small.png, screens/01-1-large.png, screens/20-20-small.png, screens/20-20-large.png |
| 2 | [UI][Responsive][Intro 1] Ảnh background không phủ hết màn hình trên viewport large | Medium | - Trên 430x932, ảnh nền (người phụ nữ + mặt trăng) chỉ phủ khoảng 395px chiều ngang và dừng ở khoảng 2/3 chiều cao: lộ một dải tối bên phải và cả nửa dưới màn hình là nền trơn, headline đè lên mặt nhân vật. Trên 375x667 ảnh phủ kín. | - Ảnh nền cần phủ full màn hình (full-bleed) trên mọi kích thước như ở viewport small – Cần đối chiếu Figma. | Screenshot/Video: screens/01-1-large.png, screens/01-1-small.png |
| 3 | [UI][Intro 1] Mặt trăng hero đè lên mặt trăng có sẵn trong ảnh nền | Medium | - Mặt trăng hero (đang hiển thị phần tối lớn) nằm chồng lên mặt trăng tròn vẽ sẵn trong ảnh background, tạo thành 2 mặt trăng chồng nhau giống hiện tượng nhật thực, trên cả 2 viewport. | - Spec (Visual) mô tả một mặt trăng 3D lớn làm hero duy nhất trên nền trời tối; vị trí hero và ảnh nền không nên chồng 2 mặt trăng – Cần đối chiếu Figma. | Screenshot/Video: screens/01-1-small.png, screens/01-1-large.png |

### Intro 2 (id: 2)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 4 | [UI][Responsive][Intro 2] List bị cắt ngang bởi vùng CTA ở first view trên màn nhỏ | Medium | - Trên 375x667, card 3 dòng bị cắt ngang ngay dưới dòng "Tonight's phase, for you", dòng "A ritual that fits your day" chỉ thấy khi cuộn và không có dấu hiệu cho biết còn nội dung bên dưới. Tương tự ở Intro 14 (id: 14): option "Just me" bị cắt một nửa bởi vùng "Tap one to continue". | - Nội dung và option cần hiển thị trọn vẹn hoặc có scroll cue (fade/shadow) rõ ràng trên màn nhỏ – Spec chưa định nghĩa – cần PM/Designer confirm. | Screenshot/Video: screens/02-2-small-p1.png, screens/02-2-small-p2.png, screens/14-14-small-p1.png, screens/14-14-small-p2.png |

### Intro 3 (id: 3)
Không phát hiện lỗi.

### Intro 4 (id: 4)
Không phát hiện lỗi.

### Intro 5 (id: 5)
Không phát hiện lỗi.

### Intro 6 (id: 6)
Không phát hiện lỗi.

### Intro 7 (id: 7)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 5 | [UI][Intro 7] Ô "Time of birth" hiển thị 2 icon đồng hồ | Medium | - Ô nhập giờ sinh có một icon đồng hồ ở bên trái và thêm một icon đồng hồ ở bên phải (icon time picker của trình duyệt), trùng lặp trên cả 2 viewport. | - Ô nhập chỉ nên có một icon đồng hồ – Cần đối chiếu Figma. | Screenshot/Video: screens/07-7-small.png, screens/07-7-large.png |

### Intro 8 (id: 8)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 6 | [UI][Intro 8] Bản đồ chấm bị cắt ở viền trên card, icon mặt trăng đè lên bản đồ | Medium | - Hàng chấm trên cùng của bản đồ (Bắc Mỹ, Nga) chạm/bị cắt bởi viền trên của card, icon mặt trăng ở góc phải đè lên các chấm bản đồ. Không thấy pin vị trí trên bản đồ. | - Spec (Visual): "Search field, pin on a stylized map under a crescent" – bản đồ cần nằm gọn trong card, có pin và crescent không đè lên bản đồ – Cần đối chiếu Figma. | Screenshot/Video: screens/08-8-small.png, screens/08-8-large.png |

### Intro 9 (id: 9)
Không phát hiện lỗi.

### Intro 10 (id: 10)
Không phát hiện lỗi.

### Intro 11 (id: 11)
Không phát hiện lỗi.

### Intro 12 (id: 12)
Không phát hiện lỗi.

### Intro 13 (id: 13)
Không phát hiện lỗi.

### Intro 14 (id: 14)
Không phát hiện lỗi mới (option bị cắt đã gộp vào bug #4).

### Intro 15 (id: 15)
Không phát hiện lỗi.

### Intro 16 (id: 16)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 7 | [UI][Responsive][Intro 16] Màn nhỏ không hiển thị sample push trên lock-screen mock | Medium | - Trên 375x667, khung lock-screen chỉ có "8:00 / October 26", không có thông báo mẫu. Trên 430x932 có thông báo "STARLYN · now – Full Moon in Taurus tonight, test. Your 5-minute release ritual is ready." | - Spec (Visual/Microcopy): lock-screen mock có một sample push "🌕 Full Moon in Aries tonight, {{name}}. Your 5-minute release ritual is ready." – cần hiển thị trên mọi viewport. | Screenshot/Video: screens/16-16-small.png, screens/16-16-large.png |

### Intro 17 (id: 17)
Không phát hiện lỗi.

### Intro 18 (id: 18)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 8 | [UI][Intro 18] Headline sát mép trên màn hình, không có khoảng cách top | Low | - Headline "test, your Moon is Libra" bắt đầu gần sát mép trên viewport, không có header/khoảng đệm phía trên, trong khi các màn khác bắt đầu nội dung bên dưới thanh back/progress. Lỗi tương tự ở Intro 19 (id: 19) với headline "Your moon month, mapped". | - Spec chưa định nghĩa – cần PM/Designer confirm (khoảng cách top cần đồng nhất với các màn khác trong funnel). | Screenshot/Video: screens/18-18-small.png, screens/18-18-large.png, screens/19-19-small-p1.png, screens/19-19-large.png |
| 9 | [UI/UX][Intro 18] Câu "you feel through the people around you" bị lặp 3 lần | Medium | - Cùng một nội dung xuất hiện 3 lần trên màn: subtitle trong card ("you feel through the people around you."), dòng "Feel" của card và câu bên dưới card ("Moon in Libra — you feel through the people around you."). Subtitle card và subtitle phase bắt đầu bằng chữ thường. | - Spec (Visual): card gồm glyph và 3 dòng ngắn (feel / soothe / drain) cùng một câu mẫu; không định nghĩa subtitle lặp trong card – cần PM/Designer confirm. | Screenshot/Video: screens/18-18-small.png, screens/18-18-large.png |
| 10 | [Logic][Intro 18] Birth phase hiển thị khác với Intro 6 cho cùng ngày sinh | High | - Intro 6 (id: 6) hiển thị "Born under a First Quarter" cho ngày "August 12, 1994" (ảnh mặt trăng sáng chưa tới nửa), nhưng Intro 18 hiển thị "Born under a Waxing Crescent" trong card birth phase. Data test qua deep-jump, Intro 18 có thể đã có thêm giờ/nơi sinh. | - Cùng ngày sinh cần ra cùng một tên phase ở Intro 6 và Intro 18, hoặc báo rõ phase đã được chính xác lại sau khi nhập giờ sinh – Spec chưa định nghĩa – cần PM/Designer confirm. | Screenshot/Video: screens/06-6-small.png, screens/18-18-small.png |

### Intro 19 (id: 19)
Không phát hiện lỗi mới (headline sát mép trên đã gộp vào bug #8).

### Intro 20 (id: 20)
Không phát hiện lỗi mới (tap target Terms/Privacy đã gộp vào bug #1).

### Paywall 1 (id: 21)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 11 | [UI/UX][Responsive][Paywall 1] Màn nhỏ không thấy CTA nào ở first view | High | - Trên 375x667, first view chỉ có brand bar (không có mini CTA), hero và đầu plan card; dòng "Due today" bị cắt ở mép dưới, button "Unlock my rituals" và sticky bottom CTA đều không hiển thị. Trên 430x932 CTA trong plan block hiển thị ngay first view. | - Spec: sticky bottom CTA hiển thị khi không có plan block nào trong màn hình; trường hợp plan block chỉ lộ một phần chưa được định nghĩa – cần PM/Designer confirm. | Screenshot/Video: screens/21-21-small-p1.png, screens/21-21-large-p1.png |
| 12 | [UI][Paywall 1] Sticky bar trong suốt, text bên dưới lộ ra/chồng lên nội dung | Medium | - Khi cuộn, sticky bottom bar "1 week, then monthly – $13.67 today" chồng lên câu hỏi FAQ "Do I need candles or supplies?" (2 dòng text đè lên nhau). Brand bar phía trên cũng lộ mờ dòng "Secure checkout · Cancel anytime" phía sau. | - Sticky bar cần có nền đủ che nội dung phía sau, không để text chồng nhau – Cần đối chiếu Figma. | Screenshot/Video: screens/21-21-small-p3.png, screens/21-21-small-p2.png |

### Upsale 1 (id: 22)
Không phát hiện lỗi.

### Download App (id: 23)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 13 | [UI][Download App] Badge "Download on the App Store" dùng icon không phải logo Apple | Medium | - Badge App Store hiển thị icon dạng outline quả táo chung chung thay vì logo Apple chính thức; badge Google Play dùng icon tam giác play outline, trên cả 2 viewport. | - Spec (Visual): App Store và Google Play badges – nên dùng badge/logo chính thức của store – Cần đối chiếu Figma. | Screenshot/Video: screens/23-23-small.png, screens/23-23-large.png |

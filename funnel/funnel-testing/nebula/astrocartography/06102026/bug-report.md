# Starlyn – astrocartography – UI Bug Report (06/10/2026)

Giả định: review từ screenshot của bản local `funnel-development/nebula/astrocartography/funnel.html` (deep-jump từng màn + walk từ màn 1 tới paywall, walk không có lỗi), viewport small 375×667 và large 430×932; không có Figma, đối chiếu với `funnel-content.md` và product rules của Starlyn.

### Intro 1 (1)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 1 | [UI/UX][Intro 1] Link "Terms" và "Privacy Policy" có tap target quá nhỏ | High | - Ở dòng legal "By continuing, you agree to our Terms & Privacy Policy" (id: 1) và dưới button Continue ở Intro 20 (id: 20), vùng bấm của link "Terms" chỉ khoảng 35x15 và "Privacy Policy" khoảng 79x15 (đo tự động), trên cả small và large. | - Tap target tối thiểu 44pt theo Apple HIG – cần Designer confirm. | Screenshot/Video: screens/01-1-small.png, screens/01-1-large.png, screens/20-20-small.png, screens/20-20-large.png |
| 2 | [UI][Intro 1] Globe hero không hiển thị các planetary line màu theo spec | Low | - Globe 3D ở Intro 1 (id: 1) và Intro 17 (id: 17, loading) chỉ hiển thị chấm lục địa và viền glow vàng, không thấy line màu nào chạy qua globe, Intro 17 cũng không thấy city pin, trên cả small và large. | - Intro 1: globe có ba line màu phát sáng chạy qua; Intro 17: line màu chạy từ cực này sang cực kia, có city pin sáng dần dọc theo line (Visual note trong brief #1, #17). Cần verify thêm vì có thể phụ thuộc thời điểm animation. | Screenshot/Video: screens/01-1-small.png, screens/01-1-large.png, screens/17-17-small.png, screens/17-17-large.png |

### Intro 2 (2)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 3 | [UI][Intro 2] Venus và Jupiter hiển thị cùng màu vàng, không phân biệt được line | Medium | - Chip legend và line của Venus đang cùng tông vàng với Jupiter ở Intro 2 (id: 2), Intro 4 (id: 4), Intro 9 (id: 9) và trên map ở Intro 18 (id: 18), nên user không phân biệt được line Venus với line Jupiter trên map. | - Venus dùng màu rose, Jupiter gold, Sun amber, Moon silver theo Visual note của brief #2, áp dụng đồng nhất cho legend và line trên mọi màn map. | Screenshot/Video: screens/02-2-small.png, screens/04-4-small.png, screens/09-9-small.png, screens/18-18-small-p1.png |

### Intro 3 (3)
Không phát hiện lỗi.

### Intro 4 (4)
Không phát hiện lỗi.

### Intro 5 (5)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 4 | [UI][Intro 5] Label trên map card nằm đè lên lưới chấm bản đồ | Medium | - Label "test's map" (Intro 5, id: 5) và label "Chicago" (Intro 11, id: 11) nằm ở góc trên trái map card, đè trực tiếp lên các chấm vàng của bản đồ (Intro 11 còn đè lên cả line), nền label gần như trong suốt nên chữ bị lẫn với chấm phía sau. | - Label không bị lẫn với nội dung map, đọc rõ – Cần đối chiếu Figma (vị trí/nền label). | Screenshot/Video: screens/05-5-small.png, screens/05-5-large.png, screens/11-11-small.png, screens/11-11-large.png |

### Intro 6 (6)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 5 | [UI/UX][Intro 6] Button Continue hiển thị enabled khi chưa chọn ngày sinh, không đồng nhất với các màn input khác | Medium | - Ở Intro 6 (id: 6), khi Month/Day/Year đều trống, button Continue vẫn hiển thị trạng thái enabled (màu vàng). Các màn input khác (Intro 7, 8, 10, 12, 15) hiển thị Continue disabled (xám) khi chưa nhập. | - Spec chưa định nghĩa – cần PM/Designer confirm. (trạng thái button Continue khi input trống cần đồng nhất giữa các màn; brief #6 chỉ định nghĩa lỗi "Pick a full date to continue"). | Screenshot/Video: screens/06-6-small.png, screens/06-6-large.png, screens/07-7-small.png |

### Intro 7 (7)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 6 | [UI][Intro 7] Field Time of birth hiển thị hai icon đồng hồ | Medium | - Field "Time of birth" (id: 7) hiển thị một icon đồng hồ ở bên trái và thêm một icon đồng hồ khác ở bên phải (icon picker mặc định của trình duyệt), trên cả small và large. | - Field chỉ hiển thị một icon đồng hồ – Spec chưa định nghĩa – cần PM/Designer confirm. | Screenshot/Video: screens/07-7-small.png, screens/07-7-large.png |

### Intro 8 (8)
Không phát hiện lỗi.

### Intro 9 (9)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 7 | [UI][Responsive][Intro 9] Map card bị thu thấp và cắt mất phần dưới bản đồ trên màn hình nhỏ | Medium | - Trên small 375×667 (id: 9), map card dưới bảng vị trí hành tinh bị thu thấp, phần dưới bản đồ (Nam Mỹ, Úc) bị cắt. Trên large 430×932 map hiển thị đầy đủ. | - Map hiển thị đủ nội dung, cùng tỉ lệ như trên large – Cần đối chiếu Figma. | Screenshot/Video: screens/09-9-small.png, screens/09-9-large.png |

### Intro 10 (10)
Không phát hiện lỗi.

### Intro 11 (11)
Không phát hiện lỗi.

### Intro 12 (12)
Không phát hiện lỗi.

### Intro 13 (13)
Không phát hiện lỗi.

### Intro 14 (14)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 8 | [UI][Intro 14] Các image card hiển thị viền màu khác nhau khi chưa chọn | Medium | - Khi chưa chọn option nào (id: 14), 4 image card Big city / Coast / Mountains / Small town có viền gradient mỗi card một màu (vàng, cam, vàng-tím, xanh ngọc), nhìn giống selected state; option "Other" và option ở các màn khác dùng viền xám mặc định. | - Option ở trạng thái default dùng chung một style viền, chỉ option được chọn mới highlight (brief #3: "purple border on select") – Cần đối chiếu Figma. | Screenshot/Video: screens/14-14-small.png, screens/14-14-large.png |

### Intro 15 (15)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 9 | [UI][Responsive][Intro 15] Option "Anywhere" bị footer che và microcopy bị đẩy xuống dưới fold trên màn hình nhỏ | Medium | - Trên small 375×667 (id: 15), option cuối "Anywhere" bị cắt ngang bởi vùng footer ("Pick at least one" + Continue); dòng "Your full map still covers the whole world." chỉ thấy sau khi cuộn. Trên large cả 4 option và microcopy hiển thị đủ. | - Spec chưa định nghĩa – cần PM/Designer confirm. (option và microcopy không bị footer che trên màn hình nhỏ). | Screenshot/Video: screens/15-15-small-p1.png, screens/15-15-small-p2.png, screens/15-15-large.png |

### Intro 16 (16)
Không phát hiện lỗi.

### Intro 17 (17)
Không phát hiện lỗi.

### Intro 18 (18)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 10 | [UI][Intro 18] Màn không có back button và progress bar, nội dung sát mép trên, không đồng nhất header | Low | - Intro 18 (id: 18) và Intro 19 (id: 19) không có back button và progress bar; title "test, your map is ready" / map card bắt đầu sát mép trên màn hình, trong khi các màn intro trước đều có hàng header (back + progress) phía trên nội dung. | - Spec chưa định nghĩa – cần PM/Designer confirm. (header và khoảng cách phía trên cần đồng nhất giữa các màn). | Screenshot/Video: screens/18-18-small-p1.png, screens/18-18-large.png, screens/19-19-small.png, screens/19-19-large.png |

### Intro 19 (19)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 11 | [UI][Intro 19] Hiển thị dòng copy "Shown only because a line truly falls within 600 miles..." không có trong spec | Low | - Màn "Why Seattle felt right" (id: 19) hiển thị dòng "Shown only because a line truly falls within 600 miles. We never invent a match." dưới card meaning. Brief #19 chỉ ghi điều kiện này như path rule nội bộ, không phải copy hiển thị. | - Spec chưa định nghĩa – cần PM/Designer confirm. (copy hiển thị trên Intro 19 cần bám theo brief: Headline, Body và một meaning card). | Screenshot/Video: screens/19-19-small.png, screens/19-19-large.png |

### Intro 20 (20)
Không phát hiện lỗi riêng. Tap target nhỏ của link Terms/Privacy trên màn này đã gộp vào bug #1.

### Paywall 1 (21)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 12 | [UI][Responsive][Paywall 1] CTA "Unlock my map" bị cắt ở mép dưới viewport đầu trên màn hình nhỏ | High | - Trên small 375×667, khi vào Paywall (id: 21) thì button "Unlock my map" trong plan block chỉ hiện nửa trên ở mép dưới màn hình, chưa có sticky CTA (header chưa có mini CTA); user phải cuộn mới thấy đủ button. Trên large button hiển thị đầy đủ. | - Spec chưa định nghĩa – cần PM/Designer confirm. (CTA cần hiển thị trọn vẹn trong viewport đầu hoặc có sticky CTA thay thế). | Screenshot/Video: screens/21-21-small-p1.png, screens/walk-end-21 (paywall).png, screens/21-21-large-p1.png |
| 13 | [UI][Paywall 1] Sticky bottom CTA không có nền che, text phía sau đè lên label gói | Medium | - Khi cuộn Paywall trên large (id: 21), dòng "1 week, then monthly · $13.67 today" của sticky bottom CTA nằm đè lên eyebrow "QUESTIONS" của section phía sau, hai dòng chữ chồng lên nhau. | - Sticky CTA không overlap với nội dung phía sau (checklist A – Layout); nền/vùng che của sticky bar – Cần đối chiếu Figma. | Screenshot/Video: screens/21-21-large-p2.png |

### Upsale 1 (22)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 14 | [UI][Responsive][Upsale 1] Microcopy dưới card bị ẩn sau sticky CTA trên màn hình nhỏ | Medium | - Trên small 375×667 (id: 22), dòng "One-time payment at a secure checkout. No subscription." dưới report card không hiển thị ở viewport đầu (CTA "Add for $19.99" nằm ngay dưới card), chỉ thấy khi cuộn; trên large dòng này hiển thị ngay dưới card. | - Microcopy hiển thị dưới card (brief #22) và không bị CTA che trên màn hình nhỏ – Spec chưa định nghĩa – cần PM/Designer confirm. | Screenshot/Video: screens/22-22-small-p1.png, screens/22-22-small-p2.png, screens/22-22-large.png |

### Download App (23)
Không phát hiện lỗi.

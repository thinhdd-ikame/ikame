# Starlyn – marriage-compatibility – UI Bug Report (06/10/2026)

Giả định: review trên file local `funnel-development/nebula/marriage-compatibility/funnel.html` qua screenshot deep-jump + walk tự động (capture.json, walk không có lỗi), viewport small 375×667 và large 430×932; spec = `funnel-content.md` + product rules Starlyn (không có Figma). Deep-jump hiển thị cả #8 và #9 (thực tế chỉ một màn theo branch); count-up của gauge, sticky CTA đang trượt và test data ("test") không tính là lỗi.

### Intro 1 (hook)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 1 | [UI/UX][Intro 1] "Terms of Use" và "Privacy Policy" trong microcopy hiển thị dạng text thường, không phải link | High | - Ở microcopy dưới CTA "Start reading" (id: hook) và dưới CTA "Continue" của màn email (Intro 21, id: email), cụm "Terms of Use" và "Privacy Policy" hiển thị cùng màu/kiểu với phần text còn lại, không gạch chân, không có affordance bấm được; trong khi footer Paywall 1 có link "Terms of Use" / "Privacy Policy" gạch chân. | - "Terms of Use" và "Privacy Policy" ở màn hook và màn email cần là link mở đúng trang tương ứng, style đồng nhất với link ở footer Paywall 1. Spec chưa định nghĩa rõ dạng link – cần PM/Designer confirm. | Screenshot/Video: screens/01-hook-small.png, screens/01-hook-large.png, screens/21-email-small.png, screens/21-email-large.png |
| 2 | [UI][Intro 1] Hero art chưa đúng visual spec: thiếu 2 nhẫn vàng (Intro 1) và vòm sáng (Intro 20) | Medium | - Hero màn hook chỉ có 2 wheel chồng nhau, không có "two small gold rings" ở giữa; hero màn window_teaser (Intro 20) cũng là cùng ảnh 2 wheel, không có "soft arch of light". Ảnh này cũng dùng lại ở hero Paywall 1 và cover Upsale 1, giống hệt ảnh của funnel ex-compatibility. | - Theo spec #1 Visual: wheels "with two small gold rings between them" (`img/hook-rings.jpg`); #20: "Wheels over a soft arch of light" (`img/result-window.jpg`). Spec Notes ghi ảnh hiện tại là placeholder – cần PM/Designer confirm thời điểm thay ảnh thật. | Screenshot/Video: screens/01-hook-small.png, screens/20-window_teaser-small-p1.png, screens/22-paywall-small-p1.png |

### Intro 2 (status)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 3 | [UI][Intro 2] Header các màn câu hỏi chỉ có counter "n/14", không hiển thị progress bar | Low | - Trên header các màn câu hỏi (Intro 2, 3, 5–14, 16, 17) chỉ thấy nút back, logo "Starlyn" và counter "n/14"; không có thanh progress bar nào hiển thị dưới header ở cả viewport small và large. | - Spec chưa định nghĩa – cần PM/Designer confirm header có cần progress bar (trên header đang có sẵn vùng dành cho progress bar nhưng không hiển thị) hay chỉ dùng counter "n/14". | Screenshot/Video: screens/02-status-small.png, screens/02-status-large.png, screens/12-home-small.png |

### Intro 3 (gender)
Không phát hiện lỗi.

### Intro 4 (reassurance)
Không phát hiện lỗi.

### Intro 5 (birth_date)
Không phát hiện lỗi.

### Intro 6 (birth_time)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 4 | [UI][Intro 6] Thiếu line-art minh hoạ theo spec ở các màn nhập giờ/nơi/ngày sinh (clock-face, globe, wheel thứ hai) | Low | - Màn birth_time (Intro 6) chỉ có select Hour/Min/AM, không có clock-face; màn birth_place (Intro 7) chỉ có input "City, country", không có globe + pin; màn partner_birth_date (Intro 9) không hiển thị wheel thứ hai mờ; phần giữa màn để trống. | - Theo spec: #6 "Clock-face line art with tiny zodiac glyphs on the rim"; #7 "Light line-art globe with a gold pin, one input under it"; #9 "a second wheel appears faintly beside the first". | Screenshot/Video: screens/06-birth_time-small.png, screens/07-birth_place-small.png, screens/09-partner_birth_date-small.png |

### Intro 7 (birth_place)
Không phát hiện lỗi riêng (thiếu globe + pin đã gộp vào bug #4).

### Intro 8 (partner_wish)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 5 | [Logic][Intro 8] Step counter nhảy cóc một bước và tính cả màn bị skip theo branch | High | - Counter cố định theo màn: partner_wish hiển thị "6/14", partner_birth_date "7/14", name "8/14". Theo walk thực tế (branch Single: birth_place → partner_wish → name) user thấy 5/14 → 6/14 → 8/14; branch Dating/Engaged sẽ thấy 5/14 → 7/14. Tổng chỉ 13 câu hỏi nhưng màn timeline vẫn hiển thị "14/14". | - Spec #8/#9: mỗi user chỉ thấy một trong hai màn (Single → #8, Dating/Engaged → #9), nên counter cần đếm liên tục không nhảy số và tổng đúng số câu của branch. Cách hiển thị cụ thể – cần PM/Designer confirm. | Screenshot/Video: screens/07-birth_place-small.png, screens/08-partner_wish-small.png, screens/09-partner_birth_date-small.png, screens/10-name-small.png, screens/17-timeline-small.png |

### Intro 9 (partner_birth_date)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 6 | [UI][Intro 9] Chip Sun sign của người kia dùng icon mặt trăng, khác icon mặt trời của chip Sun sign người dùng | Low | - Sau khi chọn ngày sinh (Oct 3 1992) ở màn partner_birth_date, chip "Libra" hiển thị icon mặt trăng màu xanh; trong khi chip Sun sign của người dùng ở màn birth_date ("Taurus") dùng icon mặt trời màu vàng. Icon mặt trăng dễ bị hiểu là Moon sign. | - Cần đối chiếu Figma: icon của chip Sun sign người kia. Spec chưa định nghĩa – cần Designer confirm. | Screenshot/Video: screens/09-partner_birth_date-small.png, screens/05-birth_date-small.png |

### Intro 10 (name)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 7 | [UI][Intro 10] Input "First name" hiển thị nền tối, khác "light input" theo spec | Low | - Ô nhập tên ở màn name dùng nền tối cùng tông với nền màn (text "test" màu trắng); trong khi ô email ở Intro 21 dùng nền sáng. | - Theo spec #10 Visual: "Single light input on the navy field, gold caret". Cần đối chiếu Figma. | Screenshot/Video: screens/10-name-small.png, screens/10-name-large.png, screens/21-email-small.png |

### Intro 11 (children)
Không phát hiện lỗi.

### Intro 12 (home)
Không phát hiện lỗi.

### Intro 13 (money)
Không phát hiện lỗi.

### Intro 14 (love_language)
Không phát hiện lỗi.

### Intro 15 (charts_meet)
Không phát hiện lỗi.

### Intro 16 (feeling)
Không phát hiện lỗi.

### Intro 17 (timeline)
Không phát hiện lỗi.

### Intro 18 (palm_photo)
Không phát hiện lỗi.

### Intro 19 (loader)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 8 | [UI][Intro 19] Title loader "Finding your marriage window" nằm sát mép trên, nội dung dồn lên trên và để trống lớn phía dưới trên large | Low | - Màn loader (id: loader) không có header; title "Finding your marriage window" nằm sát mép trên màn hình (cao hơn vị trí title của các màn khác có header), toàn bộ wheel + progress ring + 4 task row dồn lên nửa trên; trên large (430×932) khoảng trống phía dưới chiếm gần một nửa màn. Màn bridge (charts_meet) cùng loại lại căn giữa theo chiều dọc. | - Cần đối chiếu Figma: top padding của title và vertical alignment của màn loader nên đồng nhất với màn bridge (charts_meet) / các màn có header. Spec chưa định nghĩa – cần Designer confirm. | Screenshot/Video: screens/19-loader-small.png, screens/19-loader-large.png |

### Intro 20 (window_teaser)
Không phát hiện lỗi riêng (hero thiếu vòm sáng đã gộp vào bug #2).

### Intro 21 (email)
Không phát hiện lỗi riêng (lỗi Terms of Use/Privacy Policy dạng text đã gộp vào bug #1).

### Paywall 1 (paywall)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 9 | [UI][Paywall 1] Footer thiếu tên pháp nhân (entity) theo spec | High | - Footer cuối Paywall 1 chỉ hiển thị 3 link "Terms of Use" · "Privacy Policy" · "Subscription terms" và dòng "For entertainment purposes only."; không có dòng tên pháp nhân/công ty. | - Theo spec mục 22 – section 9 "Footer: legal links, entity, entertainment disclaimer": footer cần hiển thị tên pháp nhân bên cạnh legal links và disclaimer. | Screenshot/Video: screens/22-paywall-small-p4.png, screens/22-paywall-large-p4.png |
| 10 | [UI][Paywall 1] Dòng "Due today" lặp chữ "today" ở giá trị "$13.67 today" | Low | - Trong plan block (cả block đầu và block cuối trang), dòng tổng hiển thị label "Due today" và giá trị "$13.67 today", chữ "today" bị lặp trên cùng một dòng. | - Spec chưa định nghĩa – cần PM/Designer confirm copy dòng "Due today" (vd. giá trị chỉ hiển thị "$13.67"). | Screenshot/Video: screens/22-paywall-small-p4.png, screens/22-paywall-large-p1.png |

### Upsale 1 (report_upsell)
Không phát hiện lỗi.

### Download App (get_app)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 11 | [UI][Download App] Badge App Store / Google Play dùng icon outline tự vẽ, không phải badge chính thức | Medium | - Hai badge dưới CTA "Open the app" dùng icon outline (hình quả táo không lá, tam giác play) với text "Download on the App Store" / "Get it on Google Play", không phải artwork badge chính thức của Apple/Google. | - Spec mục 24 yêu cầu "App Store and Google Play badges"; cần dùng badge chính thức theo brand guideline của Apple/Google – cần Designer confirm. | Screenshot/Video: screens/24-get_app-small.png, screens/24-get_app-large.png |

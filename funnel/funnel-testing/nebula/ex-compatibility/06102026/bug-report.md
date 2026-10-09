# Starlyn – ex-compatibility – UI Bug Report (06/10/2026)

Giả định: review trên file local `funnel-development/nebula/ex-compatibility/funnel.html` qua screenshot deep-jump + walk tự động (capture.json, walk không có lỗi), viewport small 375×667 và large 430×932; spec = `funnel-content.md` + product rules Starlyn (không có Figma). Count-up của gauge, sticky CTA đang trượt và cảnh state test data ("test", lựa chọn mặc định) không tính là lỗi.

### Intro 1 (hook)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 1 | [UI/UX][Intro 1] "Terms of Use" và "Privacy Policy" trong microcopy hiển thị dạng text thường, không phải link | High | - Ở microcopy dưới CTA "Start reading" (id: hook) và dưới CTA "Continue" của màn email (Intro 21, id: email), cụm "Terms of Use" và "Privacy Policy" hiển thị cùng màu/kiểu với phần text còn lại, không gạch chân, không có affordance bấm được; trong khi footer Paywall 1 có link "Terms of Use" / "Privacy Policy" gạch chân. | - "Terms of Use" và "Privacy Policy" ở màn hook và màn email cần là link mở đúng trang tương ứng, style đồng nhất với link ở footer Paywall 1. Spec chưa định nghĩa rõ dạng link – cần PM/Designer confirm. | Screenshot/Video: screens/01-hook-small.png, screens/01-hook-large.png, screens/21-email-small.png, screens/21-email-large.png |

### Intro 2 (gender)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 2 | [UI][Intro 2] Header các màn câu hỏi chỉ có counter "n/14", không hiển thị progress bar | Low | - Trên header các màn câu hỏi (Intro 2, 3, 5–13, 15–17) chỉ thấy nút back, logo "Starlyn" và counter "n/14"; không có thanh progress bar nào hiển thị dưới header ở cả viewport small và large. | - Spec chưa định nghĩa – cần PM/Designer confirm header có cần progress bar (trên header đang có sẵn vùng dành cho progress bar nhưng không hiển thị) hay chỉ dùng counter "n/14". | Screenshot/Video: screens/02-gender-small.png, screens/02-gender-large.png, screens/10-who_ended-small.png |

### Intro 3 (goal)
Không phát hiện lỗi.

### Intro 4 (goal_reassurance)
Không phát hiện lỗi.

### Intro 5 (birth_date)
Không phát hiện lỗi.

### Intro 6 (birth_time)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 3 | [UI][Intro 6] Thiếu line-art minh hoạ theo spec ở các màn nhập giờ/ngày sinh (clock-face, wheel thứ hai) | Low | - Màn birth_time (Intro 6) và ex_birth_time (Intro 9) chỉ có 3 select Hour/Min/AM và dòng hint, không có hình clock-face; màn ex_birth_date (Intro 8) không hiển thị wheel thứ hai mờ bên cạnh; phần giữa màn để trống. | - Theo spec: #6 "Clock-face line art with tiny zodiac glyphs on the rim"; #8 "a second wheel appears faintly beside the first"; #9 "Clock face as in #6, second wheel glows". | Screenshot/Video: screens/06-birth_time-small.png, screens/08-ex_birth_date-small.png, screens/09-ex_birth_time-small.png |

### Intro 7 (ex_gender)
Không phát hiện lỗi.

### Intro 8 (ex_birth_date)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 4 | [UI][Intro 8] Chip Sun sign của người kia dùng icon mặt trăng, khác icon mặt trời của chip Sun sign người dùng | Low | - Sau khi chọn ngày sinh (Oct 3 1992) ở màn ex_birth_date, chip "Libra" hiển thị icon mặt trăng màu xanh; trong khi chip Sun sign của người dùng ở màn birth_date ("Taurus") dùng icon mặt trời màu vàng. Icon mặt trăng dễ bị hiểu là Moon sign. | - Cần đối chiếu Figma: icon của chip Sun sign người kia. Spec chưa định nghĩa – cần Designer confirm. | Screenshot/Video: screens/08-ex_birth_date-small.png, screens/05-birth_date-small.png |

### Intro 9 (ex_birth_time)
Không phát hiện lỗi riêng (thiếu clock-face/wheel đã gộp vào bug #3).

### Intro 10 (who_ended)
Không phát hiện lỗi.

### Intro 11 (why_ended)
Không phát hiện lỗi.

### Intro 12 (contact)
Không phát hiện lỗi.

### Intro 13 (duration)
Không phát hiện lỗi.

### Intro 14 (charts_meet)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 5 | [UI][Intro 14] Thiếu sign chip dưới mỗi wheel ở màn "Taurus meets Libra" | Low | - Màn bridge (id: charts_meet) hiển thị 2 wheel chồng nhau, headline "Taurus meets Libra", progress ring và step text; không có chip tên cung dưới mỗi wheel. | - Theo spec #14 Visual: "The two wheels drift together and overlap, sign chips appear under each." | Screenshot/Video: screens/14-charts_meet-small.png, screens/14-charts_meet-large.png |

### Intro 15 (feeling)
Không phát hiện lỗi.

### Intro 16 (fate_1)
Không phát hiện lỗi.

### Intro 17 (fate_2)
Không phát hiện lỗi.

### Intro 18 (palm_photo)
Không phát hiện lỗi.

### Intro 19 (loader)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 6 | [UI][Intro 19] Title loader "Comparing your two charts" nằm sát mép trên, nội dung dồn lên trên và để trống lớn phía dưới trên large | Low | - Màn loader (id: loader) không có header; title "Comparing your two charts" nằm sát mép trên màn hình (cao hơn vị trí title của các màn khác có header), toàn bộ wheel + progress ring + 4 task row dồn lên nửa trên; trên large (430×932) khoảng trống phía dưới chiếm gần một nửa màn. Màn bridge (charts_meet) cùng loại lại căn giữa theo chiều dọc. | - Cần đối chiếu Figma: top padding của title và vertical alignment của màn loader nên đồng nhất với màn bridge (charts_meet) / các màn có header. Spec chưa định nghĩa – cần Designer confirm. | Screenshot/Video: screens/19-loader-small.png, screens/19-loader-large.png |

### Intro 20 (result_teaser)
Không phát hiện lỗi.

### Intro 21 (email)
Không phát hiện lỗi riêng (lỗi Terms of Use/Privacy Policy dạng text đã gộp vào bug #1).

### Paywall 1 (paywall)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 7 | [UI][Paywall 1] Footer thiếu tên pháp nhân (entity) theo spec | High | - Footer cuối Paywall 1 chỉ hiển thị 3 link "Terms of Use" · "Privacy Policy" · "Subscription terms" và dòng "For entertainment purposes only."; không có dòng tên pháp nhân/công ty. | - Theo spec mục 22 – section 9 "Footer: legal links, entity, entertainment disclaimer": footer cần hiển thị tên pháp nhân bên cạnh legal links và disclaimer. | Screenshot/Video: screens/22-paywall-small-p4.png, screens/22-paywall-large-p4.png |
| 8 | [UI][Paywall 1] Dòng "Due today" lặp chữ "today" ở giá trị "$13.67 today" | Low | - Trong plan block (cả block đầu và block cuối trang), dòng tổng hiển thị label "Due today" và giá trị "$13.67 today", chữ "today" bị lặp trên cùng một dòng. | - Spec chưa định nghĩa – cần PM/Designer confirm copy dòng "Due today" (vd. giá trị chỉ hiển thị "$13.67"). | Screenshot/Video: screens/22-paywall-small-p4.png, screens/22-paywall-large-p1.png |

### Upsale 1 (report_upsell)
Không phát hiện lỗi.

### Download App (get_app)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 9 | [UI][Download App] Badge App Store / Google Play dùng icon outline tự vẽ, không phải badge chính thức | Medium | - Hai badge dưới CTA "Open the app" dùng icon outline (hình quả táo không lá, tam giác play) với text "Download on the App Store" / "Get it on Google Play", không phải artwork badge chính thức của Apple/Google. | - Spec mục 24 yêu cầu "App Store and Google Play badges"; cần dùng badge chính thức theo brand guideline của Apple/Google – cần Designer confirm. | Screenshot/Video: screens/24-get_app-small.png, screens/24-get_app-large.png |

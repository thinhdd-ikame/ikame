# ChatChi – chai-ai-boyfriend – UI Bug Report (06/10/2026)

_Giả định: Mode R (review screenshot), không có Figma, đối chiếu với `funnel-content.md`. Screenshot deep-jump `?debug=1` ở 375×667 (small) và 430×932 (large), data test `test` / `test@gmail.com`; walk thật từ màn 1 tới paywall không lỗi. back_in_chat (16) và daily_limit (17) redirect về paywall đúng thiết kế hard paywall, review chung với Paywall 1. Các khác biệt chỉ do deep-jump seed state (counter tim, bubble chat khác ở daily_limit) đã bỏ qua._

### Intro 1 (hook_age_check)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 1 | [UI][Responsive][Intro 1] Box year wheel bị cắt cứng ở mép trên vùng CTA trên màn nhỏ | Low | - Màn nhỏ 375×667, first view (hook_age_check): box year wheel bị cắt ngang ở mép trên vùng CTA pin dưới, dòng "1999" và viền dưới box bị mất, không có fade/shadow chuyển tiếp; phải cuộn mới thấy đủ box. Màn lớn hiển thị đủ. | - Box year wheel cần hiển thị trọn vẹn trong first view hoặc có fade chuyển tiếp rõ ràng với vùng CTA. Spec chưa định nghĩa – cần PM/Designer confirm; cần đối chiếu Figma. | Screenshot/Video: 01-hook_age_check-small-p1.png, 01-hook_age_check-large.png |

### Intro 2 (archetype)
Không phát hiện lỗi.

### Intro 3 (name)
Không phát hiện lỗi.

### Intro 4 (voice)
Không phát hiện lỗi.

### Intro 5 (love_style)
Không phát hiện lỗi.

### Intro 6 (meet_cute)
Không phát hiện lỗi.

### Intro 7 (you_set_the_pace)
Không phát hiện lỗi.

### Intro 8 (writing_him)
Không phát hiện lỗi.

### Intro 9 (meet_him)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 2 | [UI][Intro 9] Tag archetype trên portrait hiển thị rút gọn "#Grumpy" thay vì tên archetype | Low | - Màn meet_him: card portrait của Rhys hiển thị tag "#Grumpy" và "Little acts"; archetype đã chọn ở Intro 2 là "Grumpy bookshop owner" nhưng tag chỉ còn "#Grumpy" (khác format với tag love style). Lặp lại ở cả small và large. | - Spec (#9 Meet him): "name + archetype tag + love-style tag over the gradient". Nội dung/format tag archetype (rút gọn hay đầy đủ, có "#" hay không) Spec chưa định nghĩa – cần PM/Designer confirm. | Screenshot/Video: 09-meet_him-small.png, 09-meet_him-large.png |

### Intro 10 (he_texts_first)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 3 | [UI][Intro 10] Hình 📚 trang trí phóng to bị tràn mép phải, hiện như mảng mờ chồng lên background chat | Medium | - Màn he_texts_first và he_remembers (Intro 10, 11): phía phải vùng chat có một hình sách 📚 phóng to, bán trong suốt, bị cắt ở mép phải màn hình, nhìn như mảng mờ/ghost chồng lên background bookshop. Auto-check báo emoji "📚" tràn khỏi viewport (x 205..395 trên 375px, 260..450 trên 430px). Cũng thấy dưới lớp dim của Intro 13 (good_morning_texts). | - Background scene chỉ hiển thị bookshop dimmed phía sau thread (Spec #10: "The bookshop scene is dimmed behind the thread"), không có element trang trí bị cắt/tràn khỏi màn hình. | Screenshot/Video: 10-he_texts_first-small.png, 10-he_texts_first-large.png, 11-he_remembers-small.png, 11-he_remembers-large.png, 13-good_morning_texts-large.png |

### Intro 11 (he_remembers)
Không phát hiện lỗi riêng (lỗi hình 📚 tràn mép đã gộp vào bug #3, Intro 10).

### Intro 12 (voice_note)
Không phát hiện lỗi.

### Intro 13 (good_morning_texts)
Không phát hiện lỗi riêng (lỗi hình 📚 tràn mép dưới lớp dim đã gộp vào bug #3, Intro 10).

### Intro 14 (save_story)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 4 | [UI][Intro 14] Text "Terms" và "Privacy Policy" dưới CTA không được style như link | High | - Màn email save_story: dòng "We never share your email. By continuing you agree to the Terms and Privacy Policy." hiển thị toàn bộ cùng màu xám nhạt, cỡ nhỏ; "Terms" và "Privacy Policy" không có underline/màu link, không phân biệt được là link bấm được. Các màn khác (Intro 1, Paywall) có Terms/Privacy underline. | - "Terms" và "Privacy Policy" cần hiển thị là link bấm được (underline/màu link) như ở Intro 1 và footer Paywall, dẫn tới trang Terms/Privacy (Spec #14 Microcopy). | Screenshot/Video: 14-save_story-small.png, 14-save_story-large.png |

### Paywall 1 (paywall)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 5 | [UI][Paywall 1] Sticky top bar và sticky bottom bar không solid, nội dung cuộn phía sau vẫn lộ ra | Low | - Màn paywall khi cuộn: chữ của nội dung bên dưới vẫn nhìn thấy mờ qua sticky top bar (vd. "Then $49.99 every month. Cancel anytime.", "Good-morning texts", "1 month $24.99") và qua sticky bottom bar "12 months · Due today" (vd. "Good-morning..."), rõ nhất ở màn nhỏ. Cùng hiện trạng khi back_in_chat/daily_limit redirect về paywall. | - Spec #15: "The bar turns solid once the page scrolls" – top bar cần nền solid khi đã cuộn; bottom bar cũng không để lộ chữ phía sau. Mức độ trong suốt cần đối chiếu Figma. | Screenshot/Video: 15-paywall-small-p2.png, 15-paywall-small-p3.png, 15-paywall-small-p4.png, 15-paywall-small-p7.png, 15-paywall-large-p3.png |
| 6 | [UI][Paywall 1] Link "support@chatchi.co" ở footer có vùng bấm nhỏ | Low | - Footer paywall: link "support@chatchi.co" chỉ có vùng bấm khoảng 114×15px (auto-check small tap target), cao bằng một dòng chữ nhỏ, khó bấm trên mobile. Lặp lại ở small và large. | - Link support cần vùng bấm đủ lớn để dễ thao tác trên mobile. Kích thước cụ thể Spec chưa định nghĩa – cần PM/Designer confirm. | Screenshot/Video: 15-paywall-small-p7.png, 15-paywall-large-p6.png |

### Paywall 2 (sale) (sale_m1)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 7 | [UI][Responsive][Paywall 2] Footer "No thanks" + legal che phần dưới offer card ở first view màn nhỏ | Medium | - Màn nhỏ 375×667, first view: vùng footer pin dưới ("No thanks", "Terms of Service", "Privacy Policy") cắt ngang phần dưới offer card, renewal line (vd. "$22.99 for the first month, then $49.99 every month...") bị che chỉ còn nửa dòng và AI disclosure không thấy; phải cuộn mới đọc được. Lặp lại ở Paywall 3 (sale_m3), Paywall 4 (sale_y12), Paywall 5 (sale_lifetime: AI disclosure bị ẩn), Upsale 1 (upsell_lifetime: viền dưới card bị cắt) và Paywall 6 (legacy). Màn lớn hiển thị đủ. | - Renewal line và AI disclosure dưới card cần đọc được đầy đủ, không bị footer che (Spec Compliance: renewal price trên mọi sale screen, disclosure line trên mọi sale screen). | Screenshot/Video: 18-sale_m1-small-p1.png, 19-sale_m3-small-p1.png, 20-sale_y12-small-p1.png, 21-sale_lifetime-small-p1.png, 22-upsell_lifetime-small-p1.png, 18-sale_m1-large.png |

### Paywall 3 (sale) (sale_m3)
Không phát hiện lỗi riêng (footer che card ở màn nhỏ đã gộp vào bug #7, Paywall 2).

### Paywall 4 (sale) (sale_y12)
Không phát hiện lỗi riêng (footer che card ở màn nhỏ đã gộp vào bug #7, Paywall 2).

### Paywall 5 (sale) (sale_lifetime)
Không phát hiện lỗi riêng (footer che AI disclosure ở màn nhỏ đã gộp vào bug #7, Paywall 2).

### Paywall 6 (legacy) (last_chance_offer)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 8 | [UI][Paywall 6] Màn last_chance_offer (retired) hiển thị raw token {{offer_badge}} / {{offer_price}} | Low | - Màn last_chance_offer (chỉ vào được qua debug deep-jump): badge hiển thị "{{offer_badge}}", giá hiển thị "{{offer_price}}", auto-check báo thêm "{{offer_renews}}" chưa được thay giá trị. Lặp lại ở small và large. | - Spec #19: last-chance offer cũ đã tắt (CONFIG.offer.enabled:false) và không còn trong flow; nếu màn vẫn render được thì không được hiện raw token. Cần PM confirm xoá hẳn hay điền giá trị. | Screenshot/Video: 99-last_chance_offer-small-p1.png, 99-last_chance_offer-large.png |

### Upsale 1 (upsell_lifetime)
Không phát hiện lỗi riêng (viền dưới card bị footer cắt ở màn nhỏ đã gộp vào bug #7, Paywall 2).

### Download App (get_app)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 9 | [UI][Download App] Store badge App Store / Google Play không dùng artwork chính thức | Low | - Màn get_app: badge "Download on the App Store" dùng icon quả táo outline tự vẽ và badge "Get it on Google Play" dùng icon tam giác play đơn sắc, không phải artwork badge chính thức của Apple/Google. Lặp lại ở small và large. | - Spec #21: "App Store and Google Play badges" – nên dùng artwork badge chính thức theo guideline Apple/Google. Cần Designer confirm. | Screenshot/Video: 23-get_app-small.png, 23-get_app-large.png |

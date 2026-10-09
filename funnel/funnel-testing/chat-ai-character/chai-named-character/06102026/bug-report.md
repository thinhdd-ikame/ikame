# ChatChi – chai-named-character – UI Bug Report (06/10/2026)

Giả định: Mode R, review `funnel-development/chat-ai-character/chai-named-character/funnel.html` (nhân vật mặc định Lena) qua screenshot deep-jump `?debug=1` (data `test` / `test@gmail.com`) ở 375×667 và 430×932 + walk tự động (`capture.json`, walk tới paywall không lỗi); spec = `funnel-content.md` + product rules ChatChi (không có Figma). Bubble chat mờ trong still Intro 3/4/8/9 là animation fade-in đang chạy (re-render chờ 4s thì hiển thị đủ) nên không tính lỗi; back_in_chat (15) deep-jump bị redirect về Paywall 1 là đúng hard paywall; last_chance_offer (99) là màn legacy ngoài flow, liệt kê cuối.

### Intro 1 (hook_character)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 1 | [UI/UX][Intro 1] Link "Terms" / "Privacy" có tap target quá nhỏ (lặp ở Intro 11, Paywall 1–6, Upsale 1) | High | - Ở Intro 1 (hook_character) link "Terms" / "Privacy" dưới CTA "Say hi" chỉ cao khoảng 14px (auto-check 34×14, 40×14). Cùng lỗi ở Intro 11 (email_gate) "Terms" 34×14, Paywall 1 (paywall) footer "Terms of Use" / "Privacy Policy" 76×19 / 79×19, Paywall 2–6 và Upsale 1 "Terms of Use" / "Privacy Policy" 73×14 / 76×14, trên cả small và large. Chọn Medium vì link vẫn bấm được nhưng khó bấm. | - Tap target tối thiểu 44pt theo Apple HIG – cần Designer confirm. | Screenshot/Video: screens/01-hook_character-small.png, screens/12-email_gate-small.png, screens/13-paywall-small-p7.png, screens/17-sale_m1-small-p2.png |

### Intro 2 (age_check)

Không phát hiện lỗi.

### Intro 3 (chat_reply_1)

Không phát hiện lỗi.

### Intro 4 (chat_reply_2)

Không phát hiện lỗi.

### Intro 5 (your_name)

Không phát hiện lỗi.

### Intro 6 (interest_love)

Không phát hiện lỗi.

### Intro 7 (interest_unwind)

Không phát hiện lỗi.

### Intro 8 (they_remember)

Không phát hiện lỗi.

### Intro 9 (voice_note)

Không phát hiện lỗi.

### Intro 10 (writing_back)

Không phát hiện lỗi.

### Intro 11 (email_gate)

Không phát hiện lỗi.

### Paywall 1 (paywall)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 2 | [UI/UX][Responsive][Paywall 1] Màn nhỏ: first view không có giá/CTA và sticky CTA chưa hiện | High | - Mở Paywall 1 (paywall) ở 375×667: first view chỉ có hero portrait, headline "Read what Lena wrote", hàng "1 new" và lưới 2×2 picks; plan block 1 chỉ lộ eyebrow "CHOOSE YOUR PLAN" ở mép dưới, không thấy giá hay CTA "Continue with Lena"; sticky bottom bar "12 months plan · $119.99 today" cũng không hiện (chỉ xuất hiện từ p3 sau khi cuộn qua plan block). Ở 430×932 first view thấy plan 1 month $24.99 nhưng vẫn chưa thấy CTA. | - Spec mục Sticky bottom CTA: bar chỉ ẩn khi plan block đang trên màn; ngưỡng "on screen" (chỉ mép trên plan block lọt vào màn) Spec chưa định nghĩa – cần PM/Designer confirm. Theo bảng Severity, CTA/giá cần thấy được ở first view màn nhỏ. | Screenshot/Video: screens/13-paywall-small-p1.png, screens/13-paywall-small-p3.png, screens/13-paywall-large-p1.png |
| 3 | [UI/UX][Paywall 1] Email support ở footer hiển thị dạng text thường, không phải link | Low | - Footer Paywall 1 (paywall) hiển thị "Support: support@chatchi.co" dạng text xám, không gạch chân/không phải link (auto-check không nhận là phần tử bấm được), trong khi "Terms of Use" / "Privacy Policy" cùng footer là link; ở funnel chai-roleplay cùng brand, email support ở footer là link gạch chân. | - Spec chỉ ghi "Support: support@chatchi.co"; có cần mailto link đồng nhất với các funnel ChatChi khác hay không: Spec chưa định nghĩa – cần PM/Designer confirm. | Screenshot/Video: screens/13-paywall-small-p7.png, screens/13-paywall-large-p7.png |

### Paywall 2 (sale) (sale_m1)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 4 | [UI][Paywall 2] Top bar màn sale không có nền đặc, title cuộn lộ dưới logo (lặp ở Paywall 3–6, Upsale 1) | Low | - Khi cuộn Paywall 2 (sale_m1) ở 375×667, title "Keep Lena for less" trôi vào vùng top bar và vẫn lộ dưới hàng logo ChatChi + nút X (p2); Paywall 1 (paywall) có top bar nền đặc + divider. Lặp ở Paywall 3–5 (sale_m3, sale_y12, sale_lifetime: eyebrow "Last offer · pay once" lộ dưới logo), Paywall 6 (last_chance_offer) và Upsale 1 (upsell_lifetime) khi cuộn. | - Spec: sale/lifetime/add-on dùng "Same web look as the paywall: top bar with the ChatChi logo and close X" → top bar nền đặc + divider như Paywall 1. Cần đối chiếu Figma. | Screenshot/Video: screens/17-sale_m1-small-p2.png, screens/20-sale_lifetime-small-p2.png, screens/13-paywall-small-p2.png |

### Paywall 3 (sale) (sale_m3)

Không phát hiện lỗi.

### Paywall 4 (sale) (sale_y12)

Không phát hiện lỗi.

### Paywall 5 (sale) (sale_lifetime)

Không phát hiện lỗi.

### Upsale 1 (upsell_lifetime)

Không phát hiện lỗi.

### Download App (get_app)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 5 | [UI][Download App] Badge App Store / Google Play không dùng artwork chính thức | Low | - Ở Download App (get_app), badge "Download on the App Store" dùng icon outline không phải logo Apple, badge "Get it on Google Play" dùng icon tam giác play đơn sắc, trên cả small và large. | - Spec Get the app: "App Store and Google Play badges". Badge nên dùng artwork chính thức theo guideline Apple/Google – cần Designer confirm. | Screenshot/Video: screens/22-get_app-small.png, screens/22-get_app-large.png |

### Paywall 6 (sale, ngoài flow – cần confirm loại màn) (last_chance_offer)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 6 | [UI][Paywall 6] Placeholder {{offer_badge}} / {{offer_price}} hiển thị thô trên màn Message pass legacy | Low | - Màn Paywall 6 (last_chance_offer, id 99, "One-time pass · shown once" / "Message pass · Lena") chỉ mở được bằng deep-jump; walk thật không đi qua (CONFIG.offer.enabled:false). Màn hiển thị nguyên token {{offer_badge}} trên ribbon, {{offer_price}} ở hàng giá và trong dòng "{{offer_price}} once. No renewal…", trên cả small và large (auto-check raw tokens). | - Theo product rules, giá placeholder là bug; chuỗi sale chỉ gồm sale_m1 $22.99 / sale_m3 $44.99 / sale_y12 $105.99 rồi sale_lifetime $99.99, spec ghi message pass đã retired. Cần PM confirm gỡ màn khỏi build/SCREENS hoặc điền giá thật. | Screenshot/Video: screens/99-last_chance_offer-small-p1.png, screens/99-last_chance_offer-large.png |

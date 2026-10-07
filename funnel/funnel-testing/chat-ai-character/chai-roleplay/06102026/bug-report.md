# ChatChi – chai-roleplay – UI Bug Report (06/10/2026)

Giả định: Mode R, review `funnel-development/chat-ai-character/chai-roleplay/funnel.html` (genre Fantasy, companion Kael) qua screenshot deep-jump `?debug=1` (data `test` / `test@gmail.com`) ở 375×667 và 430×932 + walk tự động (`capture.json`, walk tới paywall không lỗi); spec = `funnel-content.md` + product rules ChatChi (không có Figma). Cliffhanger (15) nằm trong flow: re-walk thủ công 12 → 13 → 15 → 16, walk tự động chỉ ghi nhầm path (bấm "Save my story" của cliffhanger khi còn ghi là scene_turn_2); SCREENS bỏ số 14/18 là index không dùng, không có điều hướng tới. Counter "2 messages left" ở still Intro 13 và toast đè lên Intro 14/15 là artefact deep-jump (walk thật: "1 message left", toast tắt trước khi sang cliffhanger); back_in_scene (19) redirect về Paywall 1 là đúng hard paywall; card cliffhanger đang lật trong still là animation.

### Intro 1 (hook)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 1 | [UI][Responsive][Intro 1] Khoảng trống lớn giữa fan card và CTA, nhất là ở màn lớn | Low | - Ở Intro 1 (hook), fan 5 card genre nằm ngay dưới headline, phía dưới là vùng trống tối rất lớn tới CTA "Start my story" ghim đáy (430×932: khoảng một nửa màn trống; 375×667 cũng còn khoảng trống rõ). | - Spec #1: storybook ở giữa màn "cracks open and spills five small genre scenes"; vị trí/khoảng cách cụ thể Spec chưa định nghĩa – cần PM/Designer confirm. Cần đối chiếu Figma. | Screenshot/Video: screens/01-hook-large.png, screens/01-hook-small.png |
| 2 | [UI][Intro 1] Thiếu tag "AI roleplay" trên đầu màn hook | Low | - Đầu Intro 1 (hook) chỉ có logo ChatChi, headline và body; không có tag "AI roleplay" (small và large). | - Spec #1 Visual: "Logo and a slim "AI roleplay" tag on top". | Screenshot/Video: screens/01-hook-small.png, screens/01-hook-large.png |

### Intro 2 (age_gate)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 3 | [UI/UX][Intro 2] Link "Terms of Service" / "Privacy Policy" có tap target quá nhỏ (lặp ở Intro 9, 15, Paywall 1–5, Upsale 1) | High | - Ở Intro 2 (age_gate) link "Terms of Service" / "Privacy Policy" chỉ cao khoảng 14px (auto-check 93×14, 76×14). Cùng lỗi ở Intro 9 (trust) và Intro 15 (save_story) "Terms" / "Privacy" 34×14 / 40×14, Paywall 1 (paywall) footer "Terms of Use" / "Privacy Policy" / "support@chatchi.co" 73×14 / 76×14 / 110×14, Paywall 2–5 và Upsale 1 "Terms of Use" / "Privacy Policy" 73×14 / 76×14, trên cả small và large. Chọn Medium vì link vẫn bấm được nhưng khó bấm. | - Tap target tối thiểu 44pt theo Apple HIG – cần Designer confirm. | Screenshot/Video: screens/02-age_gate-small.png, screens/09-trust-small.png, screens/16-save_story-small.png, screens/17-paywall-small-p7.png, screens/20-sale_m1-small-p2.png |
| 4 | [UI][Intro 2] Age gate không có nền storybook mờ và surface box như brief | Low | - Intro 2 (age_gate) hiển thị Month/Year select và legal trên nền tối trơn, không có ảnh storybook mờ phía sau và không có surface box bao select; phần giữa màn trống tới CTA "Continue" ở đáy. | - Spec #2 Visual: "Dimmed storybook cover behind a rounded `surface` box holding the year select." Cần đối chiếu Figma. | Screenshot/Video: screens/02-age_gate-small.png, screens/02-age_gate-large.png |

### Intro 3 (genre)

Không phát hiện lỗi.

### Intro 4 (role)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 5 | [UI][Intro 4] Option role / setting / tone dựng đơn giản hơn brief (lặp ở Intro 5, Intro 7) | Low | - Intro 4 (role) dùng emoji (🦸 ⚔️ 🧳) thay cho silhouette icon tô màu genre; Intro 5 (setting) xếp 3 card dọc thay vì hàng swipe ngang; Intro 7 (tone) là 3 hàng emoji (😄 🌑 ⚡) thay vì card mini storybook theo mood. Small và large giống nhau. | - Spec #4: "small silhouette icon each, tinted in the genre accent"; #5: "Three tall setting cards stacked as a horizontal swipe row"; #7: "Three large cards, each with a mini storybook spread in a different mood". Cần đối chiếu Figma. | Screenshot/Video: screens/04-role-small.png, screens/05-setting-small.png, screens/07-tone-small.png |

### Intro 5 (setting)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 6 | [UI][Intro 5] Ba card setting dùng cùng một ảnh lâu đài | Medium | - Ở Intro 5 (setting) genre Fantasy, cả 3 card "Ember Keep", "Whisperwood", "Drowned Harbour" đều dùng chung ảnh lâu đài của Ember Keep, chỉ khác tên và emoji, trên cả small và large; user không phân biệt được 3 địa điểm bằng hình. | - Spec #5: "each a painted scene in the genre palette" → mỗi setting cần ảnh riêng (rừng cho Whisperwood, bến cảng cho Drowned Harbour). | Screenshot/Video: screens/05-setting-small.png, screens/05-setting-large.png |

### Intro 6 (companion)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 7 | [UI][Intro 6] Portrait companion là emoji placeholder (lặp ở Intro 8, 11–13, Paywall 1–5, Upsale 1, card cliffhanger Intro 14) | Medium | - Ở Intro 6 (companion) avatar của Kael / Mira / Fenn là emoji khiên 🛡 / quả cầu 🔮 / sói 🐺 trong vòng tròn vàng, không phải portrait nhân vật. Avatar emoji khiên này lặp ở Intro 8 (character_name), Intro 11 (story_reveal), header chat Intro 12–13, hero Paywall 1, Paywall 2–5 và Upsale 1; scene card lật ra ở Intro 14 (cliffhanger) cũng chỉ là emoji rồng 🐉. | - Spec #6: "Three portrait cards (illustrated, adult, clothed) with a name plate"; spec Notes xác nhận ảnh hiện là placeholder chờ `gen_images.py` → cần art thật trước khi chạy ads. | Screenshot/Video: screens/06-companion-small.png, screens/08-character_name-small.png, screens/17-paywall-small-p1.png, screens/20-sale_m1-small-p1.png |

### Intro 7 (tone)

Không phát hiện lỗi.

### Intro 8 (character_name)

Không phát hiện lỗi.

### Intro 9 (trust)

Không phát hiện lỗi.

### Intro 10 (loader)

Không phát hiện lỗi.

### Intro 11 (story_reveal)

Không phát hiện lỗi.

### Intro 12 (scene_turn_1)

Không phát hiện lỗi.

### Intro 13 (scene_turn_2)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 8 | [UI][Intro 13] Toast "Kael will remember: …" đè lên tên và trạng thái trên header chat | Medium | - Khi vào Intro 13 (scene_turn_2), toast "Kael will remember: Draw your blade" hiện ở đầu màn và che mất tên "Kael" + "online · The Last Ember" trên header chat (chỉ còn thấy avatar), trên cả 375×667 và 430×932. | - Spec #13: toast "slides in from a notebook icon"; không được overlap header/tên nhân vật. Vị trí toast Spec chưa định nghĩa – cần PM/Designer confirm. | Screenshot/Video: screens/13-scene_turn_2-small.png, screens/13-scene_turn_2-large.png |

### Intro 14 (cliffhanger)

Không phát hiện lỗi.

### Intro 15 (save_story)

Không phát hiện lỗi.

### Paywall 1 (paywall)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 9 | [UI/UX][Responsive][Paywall 1] Màn nhỏ: first view không có CTA và sticky CTA chưa hiện | High | - Mở Paywall 1 (paywall) ở 375×667: first view là hero art, headline "Your story, unlocked", chip picks và chỉ lộ mép trên plan "1 month $24.99"; không thấy CTA "Continue with 12 months" và sticky bottom bar "12 months · $119.99 today · Continue" không hiện (chỉ xuất hiện từ p3). Ở 430×932 thấy đủ 3 plan nhưng CTA vẫn nằm dưới fold. | - Spec mục Sticky bottom CTA: bar chỉ ẩn khi plan block đang trên màn; ngưỡng "on screen" (chỉ mép trên plan block lọt vào màn) Spec chưa định nghĩa – cần PM/Designer confirm. Theo bảng Severity, CTA/giá cần thấy được ở first view màn nhỏ. | Screenshot/Video: screens/17-paywall-small-p1.png, screens/17-paywall-small-p3.png, screens/17-paywall-large-p1.png, screens/walk-end-paywall (paywall).png |

### Paywall 2 (sale) (sale_m1)

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 10 | [UI][Paywall 2] Top bar màn sale không có nền đặc, text cuộn lộ dưới logo (lặp ở Paywall 3–5, Upsale 1) | Low | - Khi cuộn Paywall 2 (sale_m1) ở 375×667, phần subtitle trôi vào vùng top bar ngay dưới logo ChatChi + nút X; rõ nhất ở Paywall 5 (sale_lifetime) title "Keep The Last Ember forever" đè dưới logo và Upsale 1 (upsell_lifetime) eyebrow "You're in · one more thing" lộ dưới logo. Paywall 1 (paywall) có top bar nền đặc + divider. | - Spec: sale/lifetime/add-on dùng "Same web look as the paywall: top bar with the ChatChi logo and close X" → top bar nền đặc + divider như Paywall 1. Cần đối chiếu Figma. | Screenshot/Video: screens/20-sale_m1-small-p2.png, screens/23-sale_lifetime-small-p2.png, screens/24-upsell_lifetime-small-p2.png |

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
| 11 | [UI][Download App] Badge App Store / Google Play không dùng artwork chính thức | Low | - Ở Download App (get_app), badge "Download on the App Store" dùng icon outline không phải logo Apple, badge "Get it on Google Play" dùng icon tam giác outline, trên cả small và large. | - Spec Get the app: "App Store and Google Play badges". Badge nên dùng artwork chính thức theo guideline Apple/Google – cần Designer confirm. | Screenshot/Video: screens/25-get_app-small.png, screens/25-get_app-large.png |

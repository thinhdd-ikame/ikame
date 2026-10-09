# Starlyn – tarot – UI Bug Report (06/10/2026)

Giả định: test bản local `funnel-development/nebula/tarot/funnel.html` (deep-jump từng màn + walk từ màn 1 tới paywall, walk không lỗi), viewport small 375×667 và large 430×932; spec = funnel-content.md + product rule Starlyn (không có Figma).

### Intro 1 (hook)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 1 | [UI][Intro 1] Ảnh hero không full-bleed, lộ dải nền ở mép trên | Low | - Ở màn Intro 1 (id: hook), ảnh hero không bắt đầu từ mép trên màn hình: phía trên ảnh lộ một dải nền navy mỏng (cả small và large). | - Spec: "Full-bleed img/hook-tarot.jpg" – ảnh cần phủ sát mép trên màn hình, không lộ dải nền. | Screenshot/Video: screens/01-hook-small.png, screens/01-hook-large.png |
| 2 | [UI][Intro 1] Chip thứ 3 hiển thị "You pull" thay vì "You pull the cards" | Low | - Hàng chip dưới body hiển thị: "2-min · Your question · You pull" trên cả small và large. | - Theo spec: Chips "2-min · Your question · You pull the cards". | Screenshot/Video: screens/01-hook-small.png, screens/01-hook-large.png |
| 3 | [UI][Responsive][Intro 1] Viewport large: khoảng trống lớn giữa nội dung và CTA ghim đáy | Low | - Trên viewport large (430×932), nội dung dồn lên nửa trên, CTA ghim sát đáy, để lại vùng trống rất lớn ở giữa. Lặp lại ở Intro 17 (teaser), Upsale 1 (report_upsell), Download App (get_app). | - Spec chưa định nghĩa – cần PM/Designer confirm (cân nhắc đưa CTA lên gần nội dung hoặc giãn layout trên màn cao). | Screenshot/Video: screens/01-hook-large.png, screens/17-teaser-large.png, screens/19-report_upsell-large.png, screens/20-get_app-large.png |

### Intro 2 (topic)
Không phát hiện lỗi.

### Intro 3 (situation)
Không phát hiện lỗi.

### Intro 4 (question)
Không phát hiện lỗi.

### Intro 5 (feeling)
Không phát hiện lỗi.

### Intro 6 (bridge)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 4 | [UI][Responsive][Intro 6] Ảnh card-back bị cắt mép trên trên màn small | Medium | - Trên viewport small (375×667), ảnh card-back ngay dưới header bị cắt phẳng ở mép trên (mất 2 góc bo phía trên của lá bài). Trên large lá bài hiển thị đầy đủ. | - Lá bài hiển thị đầy đủ, không bị cắt, giống viewport large. | Screenshot/Video: screens/06-bridge-small.png, screens/06-bridge-large.png |

### Intro 7 (birth_date)
Không phát hiện lỗi.

### Intro 8 (birth_card)
Không phát hiện lỗi.

### Intro 9 (name)
Không phát hiện lỗi.

### Intro 10 (spread)
Không phát hiện lỗi.

### Intro 11 (trust)
Không phát hiện lỗi.

### Intro 12 (shuffle_cut)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 5 | [UI/UX][Intro 12] Màn Shuffle và Pull không có header (nút Back + logo Starlyn) | Low | - Intro 12 (id: shuffle_cut) và Intro 13 (id: pull) không hiển thị header (nút Back, logo "✦ Starlyn") trong khi các màn Intro khác đều có; user không có nút quay lại trên 2 màn này. | - Spec chưa định nghĩa – cần PM/Designer confirm có giữ header/nút Back cho màn ritual hay không. | Screenshot/Video: screens/12-shuffle_cut-small.png, screens/13-pull-small.png |

### Intro 13 (pull)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 6 | [UI][Responsive][Intro 13] Quạt 22 lá bài sát và bị cắt ở mép trái/phải trên màn small | Medium | - Trên viewport small, lá ngoài cùng bên trái của quạt bài bị cắt tại mép màn hình và lá ngoài cùng bên phải sát mép, không còn lề; trên large quạt nằm gọn trong màn. | - Quạt bài nằm gọn trong màn hình có lề hai bên như trên viewport large – cần Designer confirm. | Screenshot/Video: screens/13-pull-small.png, screens/13-pull-large.png |

### Intro 14 (cards_reveal)
Không phát hiện lỗi.

### Intro 15 (daily_card)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 7 | [UI][Intro 15] Nội dung push mock khác copy trong spec | Low | - Lock-screen mock hiển thị push: "Today's card: The Star. Hope returns, quietly." | - Theo spec: push "Today's card: The Star. Rest and trust." | Screenshot/Video: screens/15-daily_card-small.png, screens/15-daily_card-large.png |

### Intro 16 (email)
Không phát hiện lỗi.

### Intro 17 (teaser)
Không phát hiện lỗi.

### Paywall 1 (paywall)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 8 | [UI/UX][Paywall 1] Eyebrow "YOUR READING IS READY" lặp nguyên văn headline ngay bên dưới | Low | - Hero hiển thị eyebrow "YOUR READING IS READY" và ngay dưới là headline "Your reading is ready" – cùng một câu lặp 2 lần liền nhau. | - Spec chưa định nghĩa eyebrow cho màn này – cần PM/Designer confirm (đổi eyebrow hoặc dùng Headline B "Read what your cards mean"). | Screenshot/Video: screens/18-paywall-small-p1.png, screens/18-paywall-large-p1.png |

### Upsale 1 (report_upsell)
Không phát hiện lỗi.

### Download App (get_app)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 9 | [UI][Download App] Badge App Store / Google Play dùng icon generic, không phải logo chính thức | Medium | - Ở màn Download App, badge "Download on the App Store" hiển thị icon dạng outline giống chiếc răng thay vì logo Apple; badge "Get it on Google Play" chỉ là tam giác outline thay vì logo Google Play. | - Spec yêu cầu "App Store and Google Play badges" – hiển thị badge chính thức theo brand guideline của Apple/Google; cần Designer confirm asset. | Screenshot/Video: screens/20-get_app-small.png, screens/20-get_app-large.png |

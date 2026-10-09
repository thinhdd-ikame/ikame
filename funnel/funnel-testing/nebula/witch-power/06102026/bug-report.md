# Starlyn – witch-power – UI Bug Report (06/10/2026)

Giả định: test bản local `funnel-development/nebula/witch-power/funnel.html` (deep-jump từng màn + walk từ màn 1 tới paywall, walk không lỗi), viewport small 375×667 và large 430×932; spec = funnel-content.md + product rule Starlyn (không có Figma).

### Intro 1 (hook)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 1 | [UI][Intro 1] Ảnh hero không full-bleed, dải nền ở mép trên cắt mất đỉnh trăng | Low | - Ở màn Intro 1 (id: hook), ảnh hero không bắt đầu từ mép trên màn hình: phía trên ảnh lộ một dải nền navy mỏng (cả small và large), làm phần đỉnh hình trăng khuyết bị cắt ngang. | - Ảnh hero (img/hook-moon.jpg) cần phủ sát mép trên màn hình, hình trăng không bị cắt. | Screenshot/Video: screens/01-hook-small.png, screens/01-hook-large.png |
| 2 | [UI][Intro 1] Ảnh minh họa trăng/chart wheel bị răng cưa và lộ khung chữ nhật của ảnh | Medium | - Ảnh trăng khuyết + chart wheel hiển thị viền răng cưa/vỡ nét và có mép chữ nhật lộ rõ, không hòa vào nền: Intro 1 (hook), Intro 18 (loader – hộp vuông sáng quanh hình trăng), Intro 19 (big_three – mép trên ảnh cắt ngang nền), Paywall 1 (hero). | - Ảnh hiển thị sắc nét, nền ảnh hòa vào nền trang, không lộ mép/khung – Cần đối chiếu Figma/asset final với Designer. | Screenshot/Video: screens/01-hook-large.png, screens/18-loader-small.png, screens/19-big_three-small-p1.png, screens/22-paywall-small-p1.png |
| 3 | [UI][Responsive][Intro 1] Viewport large: khoảng trống lớn giữa nội dung và CTA ghim đáy | Low | - Trên viewport large (430×932), nội dung dồn lên nửa trên, CTA ghim sát đáy, để lại vùng trống rất lớn ở giữa. Lặp lại ở Intro 20 (email), Intro 21 (power_teaser), Upsale 1 (report_upsell), Download App (get_app). | - Spec chưa định nghĩa – cần PM/Designer confirm (cân nhắc đưa CTA lên gần nội dung hoặc giãn layout trên màn cao). | Screenshot/Video: screens/01-hook-large.png, screens/20-email-large.png, screens/21-power_teaser-large.png, screens/23-report_upsell-large.png, screens/24-get_app-large.png |

### Intro 2 (gender)
Không phát hiện lỗi.

### Intro 3 (st_intuition)
Không phát hiện lỗi.

### Intro 4 (st_dreams)
Không phát hiện lỗi.

### Intro 5 (st_deja_vu)
Không phát hiện lỗi.

### Intro 6 (st_signs)
Không phát hiện lỗi.

### Intro 7 (st_moon)
Không phát hiện lỗi.

### Intro 8 (st_nature)
Không phát hiện lỗi.

### Intro 9 (bridge)
Không phát hiện lỗi.

### Intro 10 (empath_moods)
Không phát hiện lỗi.

### Intro 11 (empath_confide)
Không phát hiện lỗi.

### Intro 12 (family)
Không phát hiện lỗi.

### Intro 13 (family_side)
Không phát hiện lỗi.

### Intro 14 (image_test)
Không phát hiện lỗi.

### Intro 15 (birth_date)
Không phát hiện lỗi.

### Intro 16 (birth_time)
Không phát hiện lỗi.

### Intro 17 (birth_place)
Không phát hiện lỗi.

### Intro 18 (loader)
Không phát hiện lỗi riêng – lỗi ảnh minh họa của màn này đã gộp vào #2.

### Intro 19 (big_three)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 4 | [UI][Intro 19] Dòng mô tả Sun viết thường chữ đầu, không đồng nhất với Moon/Rising | Low | - Card "Sun in Taurus" hiển thị mô tả "your steady root: how you shine." (chữ "y" viết thường), trong khi Moon và Rising viết hoa chữ đầu ("How you feel, heal and recharge.", "The first thing people sense in you."). | - Mô tả cả 3 card viết hoa chữ đầu đồng nhất (spec mẫu: "Sun in {{sun}}: your core fire" – cần PM confirm câu chuẩn). | Screenshot/Video: screens/19-big_three-small-p1.png, screens/19-big_three-large.png |

### Intro 20 (email)
Không phát hiện lỗi.

### Intro 21 (power_teaser)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 5 | [UI][Intro 21] Disc glyph power bị lệch trái và quầng glow bị cắt phẳng ở mép trên | Medium | - Disc chứa glyph (👁️) nằm sát lề trái trong khi headline, mô tả, chips và list đều căn giữa; quầng glow của disc bị cắt thành cạnh thẳng tại mép dưới header (small và large). | - Spec: "One large glyph for the power type on a glowing disc" – disc cần căn giữa cùng các thành phần khác, glow không bị cắt; cần Designer confirm. | Screenshot/Video: screens/21-power_teaser-small-p1.png, screens/21-power_teaser-large.png |

### Paywall 1 (paywall)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 6 | [UI][Paywall 1] Hero hiển thị trăng khuyết thay vì glyph power trên chart wheel | Low | - Hero paywall hiển thị ảnh trăng khuyết trên chart wheel (giống ảnh hook), không có glyph của power type (power = Seer). | - Spec mục 1: "Hero: eyebrow 'Your reading is ready', the power glyph on the chart wheel, 4 fact chips". | Screenshot/Video: screens/22-paywall-small-p1.png, screens/22-paywall-large-p1.png |
| 7 | [UI][Paywall 1] Footer thiếu thông tin entity | High | - Footer chỉ có "Terms of Use · Privacy Policy · Subscription terms" và "For entertainment purposes only.", không có dòng entity (tên pháp nhân/địa chỉ). | - Spec mục 9: "Footer: legal links, entity, entertainment disclaimer". | Screenshot/Video: screens/22-paywall-small-p4.png, screens/22-paywall-large-p4.png |

### Upsale 1 (report_upsell)
Không phát hiện lỗi.

### Download App (get_app)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 8 | [UI][Download App] Badge App Store / Google Play dùng icon generic, không phải logo chính thức | Medium | - Ở màn Download App, badge "Download on the App Store" hiển thị icon dạng outline giống chiếc răng thay vì logo Apple; badge "Get it on Google Play" chỉ là tam giác outline thay vì logo Google Play. | - Spec yêu cầu "App Store and Google Play badges" – hiển thị badge chính thức theo brand guideline của Apple/Google; cần Designer confirm asset. | Screenshot/Video: screens/24-get_app-small.png, screens/24-get_app-large.png |

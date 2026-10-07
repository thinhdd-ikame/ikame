# ChatChi – chai-ai-girlfriend – UI Bug Report (06/10/2026)

Giả định: Mode R – review screenshot deep-jump (`?debug=1`, data test `test`/`test@gmail.com`) ở 375×667 và 430×932, đối chiếu `funnel-content.md` (không có Figma). Walk thật từ hook_age_check tới paywall: không lỗi, không kẹt. back_in_chat / daily_hello / daily_limit đều redirect về Paywall 1 (hard paywall, đúng ý build) nên không log riêng. Các điểm chỉ do deep-jump seed state (slider 72/58/45/64 trên profile card, frame animation loader/typing) đã bỏ qua.

### Intro 1 (hook_age_check)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 1 | [UI][Intro 1] Year wheel bị cắt mép dưới bởi vùng CTA ở first view màn nhỏ | Low | - Màn 375×667, first view (hook_age_check): box year wheel chỉ hiện 2 dòng (2004, 2005), mép dưới box bị cắt ngang bởi vùng button "I'm 18+ · Start", không có fade; phải cuộn mới thấy đủ 3 dòng. Màn 430×932 hiển thị đủ. | - Spec: "Year wheel in a rounded surface box below, pink CTA pinned at the bottom" – box wheel cần hiển thị trọn vẹn ở first view hoặc có cue cuộn rõ ràng; cách xử lý cụ thể cần Designer confirm (Cần đối chiếu Figma). | Screenshot/Video: 01-hook_age_check-small-p1.png, 01-hook_age_check-small-p2.png, 01-hook_age_check-large.png |

### Intro 2 (hair_colour)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 2 | [UI][Intro 2] Text "Tap a hair colour" bị nét vẽ placeholder đè lên trong preview card | Medium | - Trước khi chọn màu tóc (hair_colour), preview card hiển thị hình sketch placeholder với dấu "?" hồng; text "Tap a hair colour" nằm đè lên các nét vẽ (cổ, tóc) nên bị gạch ngang, khó đọc. Lỗi giống nhau ở cả 375×667 và 430×932. | - Text hướng dẫn cần đọc rõ, không bị nét vẽ đè (spec: preview card là hero object của funnel). Cách hiển thị placeholder: Spec chưa định nghĩa – cần PM/Designer confirm. | Screenshot/Video: 02-hair_colour-small.png, 02-hair_colour-large.png |

### Intro 3 (her_age)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 3 | [UI][Intro 3] Option tuổi hiển thị dạng grid 2×2 thay vì stacked pills theo spec | Low | - Màn her_age hiển thị 4 option (21-24, 25-29, 30-35, 36+) dạng grid 2 cột × 2 hàng ở cả 2 viewport. | - Spec #3 Visual: "Four stacked pills". Cần PM/Designer confirm giữ grid hay đổi sang stacked (Cần đối chiếu Figma). | Screenshot/Video: 03-her_age-small.png, 03-her_age-large.png |

### Intro 4 (hair_style)
Không phát hiện lỗi.

### Intro 5 (eyes)
Không phát hiện lỗi.

### Intro 6 (style)
Không phát hiện lỗi.

### Intro 7 (details)
Không phát hiện lỗi.

### Intro 8 (look_set)
Không phát hiện lỗi.

### Intro 9 (names)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 4 | [UI][Intro 9] Chip thông tin phủ kín portrait trong preview card nhỏ | Medium | - Ở names, preview card thu nhỏ: 5 chip (Cozy, Long waves, Green, 25-29, Freckles) xếp dọc phủ gần hết ảnh portrait, che mặt nhân vật; ảnh gần như không nhìn thấy. Lặp lại ở cả 375×667 và 430×932. | - Portrait cần nhìn thấy được trong preview card (spec #9: "Preview card small at top"); bố cục chip khi card thu nhỏ: Spec chưa định nghĩa – cần PM/Designer confirm. | Screenshot/Video: 09-names-small.png, 09-names-large.png |
| 5 | [UI][Intro 9] Field "Her name" để trống trong khi preview card đã hiện tên "Ivy" | Low | - Mở names: field "Her name" chỉ hiện placeholder "Her name" (trống) nhưng tiêu đề preview card đã hiển thị "Ivy"; 2 vị trí không khớp. (Cần verify trên luồng đi thật – ảnh chụp bằng deep-jump.) | - Spec #9: "Her name" prefilled with a suggestion from her hair colour (e.g. Chloe for blonde) with a shuffle button – field cần hiển thị sẵn tên gợi ý trùng với tên trên preview card. | Screenshot/Video: 09-names-small.png, 09-names-large.png |

### Intro 10 (looking_for)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 6 | [UI][Intro 10] Avatar preview nằm bên trái thay vì top-right theo spec | Low | - Màn looking_for hiển thị avatar tròn + "Ivy · Cozy" ở góc trên bên trái, phía trên headline. | - Spec #10 Visual: "Stacked pills, small preview avatar top-right". Cần PM/Designer confirm vị trí (Cần đối chiếu Figma). | Screenshot/Video: 10-looking_for-small-p1.png, 10-looking_for-large.png |

### Intro 11 (personality)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 7 | [UI][Intro 11] Chip "Cozy" bị chip "Long waves" đè và cắt chữ trên preview card | Medium | - Ở personality, preview card nhỏ: chip hồng "Cozy" bị chip "Long waves" đè lên, chỉ còn thấy viền hồng và một phần chữ; các chip còn lại phủ kín portrait. Lặp lại ở cả 375×667 và 430×932. | - Các chip không được chồng lên nhau, chữ đọc trọn vẹn; portrait cần nhìn thấy (spec #11: preview card small at top với trait line). Bố cục chip khi card nhỏ: Spec chưa định nghĩa – cần PM/Designer confirm. | Screenshot/Video: 11-personality-small-p1.png, 11-personality-large.png |

### Intro 12 (meet_scene)
Không phát hiện lỗi.

### Intro 13 (private_trust)
Không phát hiện lỗi.

### Intro 14 (creating_her)
Không phát hiện lỗi.

### Intro 15 (profile_card)
Không phát hiện lỗi.

### Intro 16 (she_texts_first)
Không phát hiện lỗi.

### Intro 17 (save_her)
Không phát hiện lỗi.

### Paywall 1 (paywall)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 8 | [UI/UX][Paywall 1] First view màn lớn không thấy CTA và gói 12 months được chọn sẵn | High | - Màn 430×932, first view paywall: thấy hero, chip và 2 card 1 month/3 months; card 12 months (pre-selected, "Best value") chỉ lộ badge ở mép dưới, không có button Continue nào trong khung hình và sticky bottom bar không hiện (vì plan block đang trên màn). Màn 375×667 thì có sticky bar "$119.99 today" + Continue ngay first view. | - CTA (và gói đang chọn) cần thấy được ngay first view ở mọi kích thước theo chuẩn team. Spec #18 chỉ định nghĩa sticky bar ẩn khi plan block hiển thị, chưa định nghĩa trường hợp plan block chỉ lộ một phần – cần PM/Designer confirm cách xử lý. | Screenshot/Video: 18-paywall-large-p1.png, 18-paywall-small-p1.png |
| 9 | [UI/UX][Paywall 1] Link "support@chatchi.co" có vùng bấm nhỏ | Low | - Link "support@chatchi.co" ở footer (Support:) có tap target khoảng 124×16 (auto-check capture.json), thấp hơn chiều cao các link khác; cả 2 viewport. | - Link email support cần có vùng bấm đủ lớn để dễ chạm; kích thước cụ thể: Spec chưa định nghĩa – cần PM/Designer confirm. | Screenshot/Video: 18-paywall-small-p7.png, 18-paywall-large-p7.png |
| 10 | [UI][Paywall 1] Payment badges hiển thị dạng pill chữ, không dùng logo chính thức | Low | - Hàng payment badges (Apple Pay · G Pay · VISA · Mastercard · PayPal) ở cả 2 plan block là pill nền trắng/đen chỉ có chữ, không phải artwork logo chính thức của từng phương thức. | - Spec #18 yêu cầu payment badges (Apple Pay · G Pay · VISA · Mastercard · PayPal); artwork cụ thể Cần đối chiếu Figma / brand guideline của từng bên. | Screenshot/Video: 18-paywall-small-p2.png, 18-paywall-large-p2.png |

### Paywall 2 (sale) (sale_m1)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 11 | [UI][Paywall 2] Renewal line trong offer card bị footer cố định che ở first view màn nhỏ | Medium | - Màn 375×667, first view sale_m1: card offer bị cắt ngang ngay dưới button "Claim 1 month offer", dòng renewal "$22.99 for the first month, then $49.99 every month until you cancel..." chỉ hiện ~2 dòng rồi bị khối "No thanks" + Terms/Privacy cố định che; viền card bị cắt, không có fade. Lặp lại ở Paywall 3 (sale_m3), Paywall 4 (sale_y12) và Paywall 6 (legacy). Màn 430×932 và Paywall 5 (sale_lifetime) hiển thị đủ. | - Spec #19-#21: renewal line là một phần của card offer, cần đọc trọn vẹn cùng CTA (không bị footer che); cách bố trí khi màn ngắn Cần đối chiếu Figma. | Screenshot/Video: 23-sale_m1-small-p1.png, 24-sale_m3-small-p1.png, 25-sale_y12-small-p1.png, 22-last_chance_offer-small-p1.png, 23-sale_m1-small-p2.png |

### Paywall 3 (sale) (sale_m3)
Lỗi renewal line bị footer che đã gộp vào bug của Paywall 2 (sale_m1). Không phát hiện lỗi khác.

### Paywall 4 (sale) (sale_y12)
Lỗi renewal line bị footer che đã gộp vào bug của Paywall 2 (sale_m1). Không phát hiện lỗi khác.

### Paywall 5 (sale) (sale_lifetime)
Không phát hiện lỗi.

### Paywall 6 (legacy) (last_chance_offer)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 12 | [UI][Paywall 6] Màn last_chance_offer (đã tắt) hiển thị raw token {{offer_*}} | Low | - Mở last_chance_offer bằng debug deep-jump: badge hiện "{{offer_badge}}", giá hiện "{{offer_price}}", dòng renewal hiện "{{offer_price}} today, then {{offer_renews}}". Màn này chỉ vào được qua deep-jump (offer đã retired). | - Spec #22: old one-size last-chance offer is off (CONFIG.offer.enabled = false); màn không được hiển thị cho user, hoặc nếu còn trong build thì không được lộ token thô. | Screenshot/Video: 22-last_chance_offer-small-p1.png, 22-last_chance_offer-large.png |

### Upsale 1 (upsell_lifetime)
Không phát hiện lỗi.

### Download App (get_app)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 13 | [UI][Download App] Badge App Store / Google Play không dùng artwork chính thức | Low | - Hai badge "Download on the App Store" / "Get it on Google Play" dùng icon outline tự vẽ (quả táo, tam giác play) trên nền đen, không phải badge artwork chính thức của Apple/Google; cả 2 viewport. | - Spec #24: App Store and Google Play badges – cần dùng badge artwork chính thức theo guideline của Apple/Google (Cần đối chiếu Figma). | Screenshot/Video: 28-get_app-small.png, 28-get_app-large.png |

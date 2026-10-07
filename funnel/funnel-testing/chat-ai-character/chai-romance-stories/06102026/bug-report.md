# ChatChi – chai-romance-stories – UI Bug Report (06/10/2026)

Giả định: review từ screenshot deep-jump (?debug=1, data `test` / `test@gmail.com`) ở 375×667 và 430×932 + walk thật tới paywall trong capture.json; spec là funnel-content.md + product rules ChatChi (không có Figma). Animation chụp giữa chừng không tính là bug. Màn sau Download App (chapter2_begins, nightly_reminder, limit_chapter_lock) và last_chance_offer nằm ngoài quy tắc đặt tên, đặt theo screen id.

### Intro 1 (hook_age_check)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 1 | [UI][Responsive][Intro 1] Hint "Scroll to your birth year" bị CTA sticky che ở màn nhỏ | Low | - Màn Intro 1 (hook_age_check) ở 375×667: first view không thấy hint "Scroll to your birth year" dưới year wheel vì CTA "I'm 18+ · Start" pinned đè lên; phải cuộn trang mới thấy hint. Ở 430×932 hint hiển thị đầy đủ. | - Hint dưới year wheel cần hiển thị đầy đủ, không bị CTA sticky che ở mọi kích thước màn – cần Designer confirm layout màn nhỏ. | Screenshot/Video: screens/01-hook_age_check-small-p1.png, screens/01-hook_age_check-small-p2.png, screens/01-hook_age_check-large.png |

### Intro 2 (trope)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 2 | [UI][Responsive][Intro 2] Emoji icon đè lên eyebrow "CHATCHI · A ROMANCE STORY" trên card trope ở màn lớn | Medium | - Màn Intro 2 (trope) ở 430×932: eyebrow trên mỗi card đổi thành "CHATCHI · A ROMANCE STORY" và emoji trope (⚔️, 🧚, ☕, 💍, 👑) nằm chồng lên chữ "C" đầu tiên ("✕HATCHI…"). Ở 375×667 eyebrow chỉ là "CHATCHI" và không bị đè. | - Emoji icon và eyebrow trên card không được overlap ở mọi kích thước màn; eyebrow cần nhất quán giữa 2 viewport – cần đối chiếu Figma. | Screenshot/Video: screens/02-trope-large.png, screens/02-trope-small.png |

### Intro 3 (story_name)
Không phát hiện lỗi.

### Intro 4 (love_interest)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 3 | [UI][Intro 4] Option "Surprise me" dùng lại đúng ảnh portrait của option "A man" | Low | - Màn Intro 4 (love_interest): option "🌈 Surprise me" hiển thị cùng ảnh portrait nam (hiệp sĩ) như option "👨 A man", nên 2 option trông giống nhau. | - Brief: mỗi pill có "blurred silhouette tinted in the chosen trope's palette"; ảnh riêng cho "Surprise me" chưa được định nghĩa – cần PM/Designer confirm. | Screenshot/Video: screens/04-love_interest-small.png, screens/04-love_interest-large.png |

### Intro 5 (narrator_voice)
Không phát hiện lỗi.

### Intro 6 (burn_pace)
Không phát hiện lỗi.

### Intro 7 (trust)
Không phát hiện lỗi.

### Intro 8 (writing_chapter)
Không phát hiện lỗi.

### Intro 9 (story_reveal)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 4 | [UI][Responsive][Intro 9] Sau khi cuộn, cover truyện mất title và hiện khối màu be trống ở đáy | Low | - Màn Intro 9 (story_reveal) ở 375×667, sau khi cuộn 1 bước: cover "Ashes & Oaths" bị cắt mất phần title phía trên và phần đáy cover (vị trí tag "Enemies to lovers") hiển thị một khối màu be trống. Trước khi cuộn và ở 430×932 cover hiển thị bình thường. (Độ tin cậy thấp: có thể là frame giữa animation cover.) | - Cover cần hiển thị đầy đủ (title, portrait, trope tag) khi cuộn – Spec chưa định nghĩa trạng thái khi cuộn – cần PM/Designer confirm. | Screenshot/Video: screens/09-story_reveal-small-p2.png, screens/09-story_reveal-small-p1.png |

### Intro 10 (chapter1_narration)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 5 | [UI/UX][Intro 10] Button tốc độ "1x" trên narrator bar có tap target nhỏ | Low | - Màn Intro 10 (chapter1_narration): button "1x" trên narrator bar có vùng bấm 35×29px (auto-check). Lặp lại ở Intro 11 (choice_bends_story) và các màn chat trả phí chapter2_begins / nightly_reminder / limit_chapter_lock. | - Tap target tối thiểu 44pt theo Apple HIG – cần Designer confirm. | Screenshot/Video: screens/10-chapter1_narration-small.png, screens/11-choice_bends_story-small.png, screens/15-chapter2_begins-small-p1.png |

### Intro 11 (choice_bends_story)
Không phát hiện lỗi.

### Intro 12 (chapter1_cliffhanger)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 6 | [UI][Intro 12] Chapter card vẫn trống, caption không phải "Chapter card 1/12 saved to your library" | Low | - Màn Intro 12 (chapter1_cliffhanger): chapter card chỉ là card tối với icon ✦, không có illustration; dòng dưới hiển thị "Your first chapter card is waiting." (Độ tin cậy thấp: ảnh chụp 1.2s sau khi vào màn, có thể card chưa flip xong.) | - Brief #12: card "flips from blank to revealed with an amber glow", caption "Chapter card 1/12 saved to your library". | Screenshot/Video: screens/12-chapter1_cliffhanger-small.png, screens/12-chapter1_cliffhanger-large.png |

### Intro 13 (save_story)
Không phát hiện lỗi.

### Paywall 1 (paywall)
Không phát hiện lỗi.

### Paywall 2 (sale) (sale_m1)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 7 | [UI][Responsive][Paywall 2] Dòng renewal trong offer card bị footer pinned cắt ở first view màn nhỏ | Medium | - Màn Paywall 2 (sale_m1) ở 375×667: dòng "$22.99 for the first month, then $49.99 every month until you cancel…" dưới CTA bị cắt ngang bởi khối footer pinned ("No thanks" + Terms/Privacy), viền dưới card cũng bị cắt; phải cuộn mới đọc hết. Lặp lại ở Paywall 3 (sale_m3), Paywall 4 (sale_y12) và Paywall 5 (sale_lifetime, dòng AI disclosure bị cắt). | - Điều khoản renewal cạnh CTA cần đọc được đầy đủ, không bị footer che ở first view – cần Designer confirm layout màn nhỏ. | Screenshot/Video: screens/18-sale_m1-small-p1.png, screens/19-sale_m3-small-p1.png, screens/20-sale_y12-small-p1.png, screens/21-sale_lifetime-small-p1.png |

### Paywall 3 (sale) (sale_m3)
Không phát hiện lỗi.

### Paywall 4 (sale) (sale_y12)
Không phát hiện lỗi.

### Paywall 5 (sale) (sale_lifetime)
Không phát hiện lỗi.

### Upsale 1 (upsell_lifetime)
Không phát hiện lỗi.

### Download App (get_app)
Không phát hiện lỗi.

### Chapter 2 – chat trả phí (chapter2_begins) (cần confirm loại màn)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|

### Nightly reminder (nightly_reminder) (cần confirm loại màn)
Không phát hiện lỗi.

### Limit / chapter lock (limit_chapter_lock) (cần confirm loại màn)
Không phát hiện lỗi.

### Last chance offer (last_chance_offer) – màn đã tắt (cần confirm loại màn)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 8 | [Logic][Last chance offer] Màn offer đã tắt vẫn mở được qua deep-jump và hiển thị raw token | Low | - Deep-jump tới last_chance_offer (99): màn vẫn render "One-time offer · shown once" với raw token {{offer_badge}}, {{offer_price}}, {{offer_renews}} ở badge, price row và dòng renewal. Không xuất hiện trong walk thật (chỉ thấy qua deep-jump). | - Brief Notes: "The old one-time last-chance offer (CONFIG.offer) is switched off (enabled:false) and no longer in the flow"; màn không nên mở được, hoặc không được hiển thị token chưa thay thế. | Screenshot/Video: screens/99-last_chance_offer-small-p1.png, screens/99-last_chance_offer-large.png |

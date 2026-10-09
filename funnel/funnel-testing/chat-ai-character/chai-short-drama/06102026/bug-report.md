# ChatChi – chai-short-drama – UI Bug Report (06/10/2026)

Giả định: review từ screenshot deep-jump (?debug=1, data `test` / `test@gmail.com`) ở 375×667 và 430×932 + walk thật tới paywall trong capture.json; spec là funnel-content.md + product rules ChatChi (không có Figma). Animation chụp giữa chừng không tính là bug. episode_3_and_chat (14) deep-jump bị redirect về paywall (12) – đúng hard paywall, không log. last_chance_offer nằm ngoài quy tắc đặt tên, đặt theo screen id.

### Intro 1 (hook)
Không phát hiện lỗi.

### Intro 2 (age_gate)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 1 | [UI/UX][Intro 2] Link Terms of Service / Privacy Policy có tap target nhỏ | High | - Màn Intro 2 (age_gate): link "Terms of Service" (93×14px) và "Privacy Policy" (76×14px) có vùng bấm cao 14px (auto-check). Lặp lại ở Intro 11 (save_progress: "Terms" 34×14, "Privacy" 40×14), Paywall 1 (paywall: "Terms of Use", "Privacy Policy", "support@chatchi.co" 110×14), Paywall 2–5 (sale_m1/m3/y12/lifetime), Upsale 1 (upsell_lifetime) và last_chance_offer. | - Tap target tối thiểu 44pt theo Apple HIG – cần Designer confirm. | Screenshot/Video: screens/02-age_gate-small.png, screens/11-save_progress-small.png, screens/12-paywall-small-p6.png, screens/19-upsell_lifetime-small.png |

### Intro 3 (series_pick)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 2 | [UI][Intro 3] Lead "NORA · a detective" nhưng poster Night Shift là nhân vật nam | Low | - Màn Intro 3 (series_pick): card Night Shift ghi lead "NORA · a detective" nhưng ảnh poster (và frame giữa ở Intro 1) là một người đàn ông mặc trench coat, khiến tên lead và hình không khớp. | - Spec chưa định nghĩa giới tính/ngoại hình của Nora – cần PM/Designer confirm poster khớp với lead. | Screenshot/Video: screens/03-series_pick-small.png, screens/01-hook-small.png |

### Intro 4 (your_name)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 3 | [UI][Intro 4] Header ghi "Your series" trên màn nhập tên | Low | - Màn Intro 4 (your_name): top bar vẫn hiển thị title "Your series" (giống Intro 3) trong khi nội dung là "What should they call you?". | - Spec chưa định nghĩa title top bar cho màn này – cần PM/Designer confirm (title cần khớp nội dung màn). | Screenshot/Video: screens/04-your_name-small.png, screens/04-your_name-large.png |
| 4 | [UI][Intro 4] Avatar của lead là emoji áo khoác placeholder thay vì portrait | Medium | - Màn Intro 4 (your_name): vòng tròn avatar hiển thị emoji 🧥 trên nền tối thay vì portrait của Leo. Cùng avatar emoji này lặp lại ở Intro 7 (cliffhanger, "Leo is typing…"), Intro 8–9 (header chat), Paywall 1 (tease quote) và last_chance_offer. | - Brief #4: "the lead's portrait blurred behind"; Brief #7: "the lead portrait sliding out of it". | Screenshot/Video: screens/04-your_name-small.png, screens/07-cliffhanger-small.png, screens/08-chat_turn_1-small.png, screens/12-paywall-small-p1.png |

### Intro 5 (episode_1)
Không phát hiện lỗi.

### Intro 6 (episode_2)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 5 | [UI][Intro 6] Episode 2 dùng lại đúng artwork của Episode 1 | Low | - Màn Intro 6 (episode_2): slide hiển thị cùng một ảnh terrace/bàn nến như Episode 1 (Intro 5), không thấy khác biệt về grade; chỉ caption thay đổi. | - Brief #6: "Same story frame, 3 slides, darker grade" – cần Designer confirm artwork/grade riêng cho Episode 2. | Screenshot/Video: screens/06-episode_2-small.png, screens/05-episode_1-small.png |

### Intro 7 (cliffhanger)
Không phát hiện lỗi.

### Intro 8 (chat_turn_1)
Không phát hiện lỗi.

### Intro 9 (chat_turn_2)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 6 | [Logic][Intro 9] Counter vẫn "2 messages left" sau khi user đã gửi 1 message | Low | - Màn Intro 9 (chat_turn_2): thread đã có 1 message của user ("Ask about the key") và reply của Leo, nhưng composer vẫn hiển thị "Free preview · 2 messages left". (Chụp qua deep-jump có seed data – cần verify lại trên walk thật.) (Cần verify trên luồng đi thật: ảnh chụp bằng deep-jump với seed data, có thể không phản ánh luồng thật.) | - Brief #9: "Counter drops 2 to 0 over the two turns"; sau message thứ nhất counter cần là 1 message left. | Screenshot/Video: screens/09-chat_turn_2-small.png, screens/09-chat_turn_2-large.png |
| 7 | [UI][Responsive][Intro 9] Reply chip "Walk away" bị cắt ngoài mép phải ở màn nhỏ | Low | - Màn Intro 9 (chat_turn_2) ở 375×667: 3 reply chip xếp thành 1 hàng ngang, chip "🚪 Walk away" bị cắt ngoài mép phải (chỉ thấy "Wa"), không có dấu hiệu cuộn ngang. Ở 430×932 3 chip xếp dọc và hiển thị đầy đủ. | - Reply chip cần hiển thị đủ hoặc có affordance cuộn rõ ràng, nhất quán giữa các viewport – cần Designer confirm. | Screenshot/Video: screens/09-chat_turn_2-small.png, screens/09-chat_turn_2-large.png |

### Intro 10 (episode_3_locked)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 8 | [UI][Intro 10] Toast "Leo remembers…" che headline "Episode 3 is locked." và logo màn email | Low | - Khi vào Intro 10 (episode_3_locked), toast "Leo remembers: the navy suit, the brass key" vẫn hiển thị ở đầu màn và che gần hết headline "Episode 3 is locked." ở cả 375 và 430. Ở Intro 11 (save_progress) toast này tiếp tục đè lên logo ChatChi. (Cần verify trên luồng đi thật: tool chụp deep-jump liên tiếp từng màn nên toast của màn 9 có thể còn sót sang màn 10/11.) | - Toast của màn chat không được che headline/logo của màn sau; headline Brief #10 "Episode 3 is locked." cần đọc được ngay khi vào màn. | Screenshot/Video: screens/10-episode_3_locked-small.png, screens/10-episode_3_locked-large.png, screens/11-save_progress-small.png |

### Intro 11 (save_progress)
Không phát hiện lỗi.

### Paywall 1 (paywall)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 9 | [UI][Paywall 1] Dòng plan/giá của sticky bottom CTA không có nền, chồng lên nội dung trang | Medium | - Màn Paywall 1 (paywall): khi sticky bottom bar hiện, dòng "12 months … $119.99 today" phía trên button "Unlock Episode 3" nằm trực tiếp trên nội dung và chồng chữ với eyebrow "CHOOSE YOUR PLAN", text step 3 "Episode 3 and Leo are waiting, with Plus already on", card FAQ "Is it explicit?" và tiles "Why go Plus". Thấy ở 375, 430 và cả walk thật. | - Brief #12 (11): sticky bottom CTA "{{plan}} · {{price}} today" + "Unlock Episode 3" không được che/chồng nội dung – cần Designer confirm nền cho cả cụm sticky bar. | Screenshot/Video: screens/12-paywall-small-p1.png, screens/12-paywall-small-p3.png, screens/12-paywall-small-p4.png, screens/12-paywall-large-p3.png, screens/walk-end-paywall (paywall).png |

### Paywall 2 (sale) (sale_m1)
Không phát hiện lỗi.

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

### Last chance offer (last_chance_offer) – màn đã tắt (cần confirm loại màn)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 10 | [Logic][Last chance offer] Màn Series pass đã retire vẫn mở được qua deep-jump và hiển thị raw token | Low | - Deep-jump tới last_chance_offer (99): màn "Just want this series?" / "Series pass" vẫn render, price row và fine print hiển thị raw token {{offer_price}}. Không xuất hiện trong walk thật. | - Brief #16: "The old one-time series pass offer is retired (CONFIG.offer.enabled: false)"; màn không nên mở được, hoặc không được hiển thị token chưa thay thế. | Screenshot/Video: screens/99-last_chance_offer-small-p1.png, screens/99-last_chance_offer-large.png |

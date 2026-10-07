# ChatChi – chai-companion – UI Bug Report (06/10/2026)

Giả định: Mode R, spec = funnel-content.md + product rule (không có Figma); màn chụp deep-jump `?debug=1` (data `test` / `test@gmail.com`) ở 375×667 và 430×932; back_in_chat / day2_remembered / daily_limit redirect về Paywall 1 là đúng rule hard paywall; last_chance_offer là màn legacy ngoài flow, liệt kê cuối.

### Intro 1 (hook_age_check)
Không phát hiện lỗi.

### Intro 2 (mood)
Không phát hiện lỗi.

### Intro 3 (day_topics)
Không phát hiện lỗi.

### Intro 4 (friend_not_therapist)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 1 | [UI][Responsive][Intro 4] Nội dung bị đẩy xuống giữa màn, để trống lớn phía trên trên màn lớn (lặp ở Intro 8) | Low | - Ở 430×932, màn Intro 4 (friend_not_therapist) và Intro 8 (memory_control) căn giữa theo chiều dọc: headline bắt đầu khoảng giữa màn, phía trên chỉ có back/progress và khoảng trống lớn; các màn Intro 2, 3, 5, 6, 7 cùng kích thước đều đặt headline ngay dưới progress bar nên vị trí headline nhảy giữa các màn. | - Spec chưa định nghĩa – cần PM/Designer confirm vị trí headline thống nhất giữa các màn Intro (Cần đối chiếu Figma). | Screenshot/Video: screens/04-friend_not_therapist-large.png, screens/08-memory_control-large.png, screens/03-day_topics-large.png |

### Intro 5 (name)
Không phát hiện lỗi.

### Intro 6 (support_style)
Không phát hiện lỗi.

### Intro 7 (personality)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 2 | [UI][Responsive][Intro 7] Hàng chip bị cắt ngang bởi vùng CTA ở first view màn nhỏ (lặp ở Intro 10) | Medium | - Ở 375×667, first view Intro 7 (personality) hiển thị hàng chip "He · She · They · Surprise me" bị cắt mất nửa dưới bởi vùng button Continue (mép cắt thẳng, không có fade); Intro 10 (meet_companion) bị tương tự với hàng "Or talk with Noor · Ben" sát button Say hi. Phải cuộn mới thấy đủ chip. | - Component không bị cắt nửa ở first view; nếu nội dung tràn thì cần cue cuộn (fade/shadow) rõ ràng. Spec chưa định nghĩa cách xử lý – cần PM/Designer confirm. | Screenshot/Video: screens/07-personality-small-p1.png, screens/07-personality-small-p2.png, screens/10-meet_companion-small-p1.png |

### Intro 8 (memory_control)
Không phát hiện lỗi.

### Intro 9 (getting_ready)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 3 | [UI][Intro 9] Số % và độ dài progress bar của bước 1 không khớp nhau | Low | - Trong ảnh chụp loader Intro 9 (getting_ready), dòng "Listening to how today went..." hiển thị "66%" nhưng thanh progress chỉ được fill khoảng 1/3 chiều dài, giống nhau ở cả 375 và 430. Ảnh tĩnh nên có thể do bar animate chậm hơn số (độ tin cậy thấp, cần verify bằng video). | - Số % và độ dài fill của progress bar cần khớp nhau tại cùng thời điểm (spec: mỗi step 0→100%). | Screenshot/Video: screens/09-getting_ready-small.png, screens/09-getting_ready-large.png |

### Intro 10 (meet_companion)
Không phát hiện lỗi.

### Intro 11 (first_checkin)
Không phát hiện lỗi.

### Intro 12 (it_remembers)
Không phát hiện lỗi.

### Intro 13 (day_remembered)
Không phát hiện lỗi.

### Intro 14 (checkin_time)
Không phát hiện lỗi.

### Intro 15 (save_memories)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 4 | [UI/UX][Intro 15] "Terms" và "Privacy Policy" trong legal line không hiển thị dạng link | High | - Ở Intro 15 (save_memories), dòng "By continuing you agree to the Terms and Privacy Policy." hiển thị cùng một màu xám, không underline/không đổi màu ở "Terms" và "Privacy Policy", trong khi các màn khác (Intro 1, Paywall, Sale) hiển thị Terms/Privacy có underline. | - Theo product rule, Terms/Privacy là link; cần style link nhất quán với các màn khác và bấm được – cần PM/Designer confirm. | Screenshot/Video: screens/15-save_memories-small.png, screens/15-save_memories-large.png |

### Paywall 1 (paywall)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 5 | [UI/UX][Responsive][Paywall 1] First view màn lớn không có CTA và giá nào | High | - Ở 430×932, first view Paywall 1 (paywall) chỉ có hero, chip và memory card; plan block 1 mới ló viền ở đáy màn nên cả sticky bottom bar ("ChatChi Plus · 12 months / Due today $119.99 / Continue") lẫn mini "Continue" trên header đều ẩn, user không thấy giá hay CTA nào nếu chưa cuộn. Ở 375×667 cả hai CTA đều hiển thị. | - Spec: sticky bar chỉ ẩn khi plan block đang trên màn; spec chưa định nghĩa ngưỡng "đang trên màn" khi block chỉ ló viền – cần PM/Designer confirm để first view luôn có CTA. | Screenshot/Video: screens/16-paywall-large-p1.png, screens/16-paywall-small-p1.png |

### Paywall 2 (sale) (sale_m1)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 6 | [UI][Responsive][Paywall 2] Wellbeing line bị footer cố định che ở first view màn nhỏ (lặp ở Paywall 3, 4) | Low | - Ở 375×667, first view Paywall 2 (sale_m1), Paywall 3 (sale_m3), Paywall 4 (sale_y12) không thấy dòng "ChatChi is AI, not therapy. Crisis resources are always free." dưới card vì bị vùng "No thanks" + Terms/Privacy cố định che; phải cuộn mới thấy. Ở 430×932 và Paywall 5 (sale_lifetime) dòng này hiển thị ngay. | - Nội dung không bị footer cố định che; wellbeing line (spec #17 Visual) cần nhìn thấy được – cần Designer confirm cách bố trí trên màn nhỏ. | Screenshot/Video: screens/21-sale_m1-small-p1.png, screens/21-sale_m1-small-p2.png, screens/22-sale_m3-small-p1.png, screens/23-sale_y12-small-p1.png |

### Paywall 3 (sale) (sale_m3)
Không phát hiện lỗi.

### Paywall 4 (sale) (sale_y12)
Không phát hiện lỗi.

### Paywall 5 (sale) (sale_lifetime)
Không phát hiện lỗi.

### Upsale 1 (upsell_lifetime)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 7 | [UI][Upsale 1] Card "Bonus companion" dùng avatar của companion hiện tại (Sam) | Low | - Ở Upsale 1 (upsell_lifetime), card "Bonus companion · Alongside Sam · private to you" hiển thị avatar Sam, giống hệt avatar trên các màn Sale, trong khi sản phẩm bán là một companion thứ hai tạo mới. | - Spec chưa định nghĩa avatar cho Bonus companion – cần PM/Designer confirm (ví dụ avatar placeholder/khác Sam để tránh hiểu nhầm). | Screenshot/Video: screens/25-upsell_lifetime-small.png, screens/21-sale_m1-small-p1.png |

### Download App (get_app)
Không phát hiện lỗi.

### Paywall 1 – redirect (back_in_chat)
Không phát hiện lỗi. (Deep-jump redirect về Paywall 1 – đúng rule hard paywall.)

### Paywall 1 – redirect (day2_remembered)
Không phát hiện lỗi. (Deep-jump redirect về Paywall 1 – đúng rule hard paywall.)

### Paywall 1 – redirect (daily_limit)
Không phát hiện lỗi. (Deep-jump redirect về Paywall 1 – đúng rule hard paywall.)

### Paywall 6 (legacy offer, ngoài flow) (cần confirm loại màn) (last_chance_offer)
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 8 | [UI][Paywall 6] Màn offer legacy vẫn render khi mở trực tiếp, hiển thị raw token giá | Low | - Mở trực tiếp màn last_chance_offer (screen 20, deep-jump không bị redirect) hiển thị badge "{{offer_badge}}", giá "{{offer_price}}" và "{{offer_price}} today, then {{offer_renews}}" ở cả 375 và 430. Walk thật không đi qua màn này (spec: offer cũ đã tắt, CONFIG.offer.enabled:false) nên đặt Medium; nếu màn này được điều hướng tới trong bản FunnelFox thì là sai giá (Critical). | - Theo spec, offer weekly cũ đã tắt: màn không được hiển thị cho user (redirect về Paywall 1 như back_in_chat/daily_limit, hoặc bỏ khỏi build); product rule: không để placeholder giá trong funnel. | Screenshot/Video: screens/20-last_chance_offer-small-p1.png, screens/20-last_chance_offer-large.png |

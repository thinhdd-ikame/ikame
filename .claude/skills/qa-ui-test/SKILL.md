---
name: "qa-ui-test"
description: Quy chuẩn test UI và log bug UI cho team QA. Dùng skill này bất cứ khi nào user muốn test UI, review UI, soi screenshot/video tìm lỗi hiển thị, viết/chuẩn hóa bug UI, hoặc phân loại bug [UI]/[UI/UX]/[Logic]/[Responsive]/[Crash]. Kích hoạt kể cả khi user chỉ nói ngắn như "check UI web", "test UI".
---

# QA UI Test

Skill này chuẩn hóa cách team QA test UI và log bug UI để QA, Dev và Designer đọc là hiểu ngay. Mặc định viết output bằng **tiếng Việt**, giữ nguyên thuật ngữ kỹ thuật tiếng Anh (font weight, safe area, selected state...) và nguyên văn text hiển thị trên app.

## Xác định mode

Đọc yêu cầu và input để chọn mode (có thể kết hợp):

| Mode | Khi nào | Output |
|---|---|---|
| **R – Review UI** | Có screenshot/video hoặc link web và muốn tìm lỗi | Bảng note bug (web: chia theo từng màn) + file Excel tổng hợp bug |
| **L – Log / chuẩn hóa bug** | User mô tả lỗi thô hoặc đưa bug viết chưa chuẩn | Bug report hoàn chỉnh theo template |

Nếu không rõ mode, chọn mode hợp lý nhất theo input rồi làm luôn, ghi một dòng giả định ở đầu.

## Mode R – Review UI

1. Lấy nội dung cần review:
   - **Screenshot/video**: xem trực tiếp.
   - **Link web**: mở trang bằng công cụ trình duyệt nếu có (chụp screenshot, xem ở nhiều kích thước màn hình). Nếu không mở được trang, báo lại và đề nghị user gửi screenshot thay vì đoán giao diện.
   - **Funnel trong repo (funnel.html/demo.html)**: chạy `node funnel/tools/qa_capture.mjs <funnel.html> funnel/funnel-testing/<app>/<niche>/<ddmmyyyy>` — tự chụp mọi màn (deep-jump `?debug=1`, data test `test`/`test@gmail.com`) ở 375×667 và 430×932, cuộn màn dài, ghi auto-check (overflow, `{{token}}` sót, text bị cắt, tap target nhỏ, lỗi console) và đi thật từ màn 1 tới paywall vào `capture.json`. Nếu walk báo kẹt, xem `walk-end-*.png` trước: thường là driver chưa hiểu widget mới (upload, rút bài, popup), không phải bug funnel. File local không gửi dữ liệu đi đâu nên không cần hỏi xác nhận trước khi nhập data test.
   - **Trên máy Mac này (link web khác)**: dùng Node + `playwright-core` với Chromium có sẵn ở `~/Library/Caches/ms-playwright` để click qua cả funnel (link FunnelFox hoặc file `demo.html` local) và chụp từng màn. Test tối thiểu viewport 375×667 (small) và 430×932 (large). Paywall dài thì cuộn từng đoạn (~780px) để thấy sticky CTA đúng như user thấy. Lưu screenshot vào `funnel/funnel-testing/<app>/<niche>/<ddmmyyyy>/screens/` và điền tên file vào cột Attachment.
2. Đọc `references/ui-checklist.md`, rồi review theo từng nhóm A→I (Layout, Typography, Component state, Color, Button, Input, Responsive, Navigation, System UI). Bỏ qua nhóm không áp dụng, ví dụ System UI/Permission với web.
3. Chỉ báo lỗi **nhìn thấy được** hoặc **có căn cứ**. Có Figma/spec thì đối chiếu với Figma/spec. Không có Figma thì chỉ báo lỗi hiển nhiên (overlap, truncate, bị che bởi safe area/keyboard, lệch căn chỉnh rõ ràng, không đồng nhất giữa các màn) và ghi rõ "Cần đối chiếu Figma" cho các điểm nghi ngờ về font/màu/spacing — không bịa giá trị px, hex, font size.
4. Log bug theo **bảng note bug** trong `references/bug-format.md` (`# | Title | Severity | Actual Result | Expected Result | Attachment`). Gán Severity cho mọi bug theo bảng Severity trong `references/bug-format.md`. Nếu nhiều lỗi cùng gốc (vd. cùng một token màu sai trên nhiều màn) thì gộp thành một dòng, liệt kê các màn bị ảnh hưởng.
5. **Với test Web**: log bug theo từng màn hình (mỗi màn một heading + một bảng riêng, theo thứ tự màn xuất hiện trong flow) và đặt tên màn theo quy tắc bên dưới. Màn nào không có lỗi thì ghi một dòng "Không phát hiện lỗi" thay vì bỏ trống.

### Đặt tên màn khi test Web
| Loại màn | Tên màn |
|---|---|
| Các màn intro/onboarding | `Intro 1`, `Intro 2`, … `Intro n` (đánh số theo thứ tự xuất hiện) |
| Màn Paywall chính | `Paywall 1`, `Paywall 2`, … |
| Màn upsale sau Paywall | `Upsale 1`, `Upsale 2`, … |
| Màn tải app | `Download App` |

Tên màn này dùng luôn làm phần `[Screen/Feature]` trong Title, ví dụ `[UI][Intro 2] Title bị lệch lên trên so với Design`, `[UI][Upsale 1] Button Continue bị che bởi footer`. Nếu không chắc một màn là Paywall hay Upsale, đặt tên theo phán đoán hợp lý nhất và ghi chú "(cần confirm loại màn)" ở heading.

## Mode L – Log / chuẩn hóa bug

1. Đọc `references/bug-format.md`.
2. Mặc định viết lại theo **bảng note bug**; chỉ dùng block template đầy đủ khi user yêu cầu bug report chi tiết cho một bug (thường sau khi đã verify). Phân loại đúng Bug Type; đặt `[Screen/Feature]` ngay sau type (với web dùng tên màn như Intro 1, Paywall 1, Upsale 1, Download App).
3. Chỉ giữ đúng các mục trong template (Title, Severity, Actual Result, Expected Result, Attachment); nếu bug gốc có Environment, Steps… thì đưa ngữ cảnh cần thiết vào Actual Result rồi bỏ các mục đó. Bug gốc chưa có Severity thì tự gán theo bảng Severity; đã có thì giữ, trừ khi rõ ràng sai mức. Nếu thiếu thông tin quan trọng để hiểu lỗi thì hỏi lại ngắn gọn ở cuối.

## Export file Excel tổng hợp bug

Sau khi review xong (Mode R) hoặc khi user yêu cầu, xuất thêm file Excel tổng hợp toàn bộ bug. Nếu review có từ 1 bug trở lên thì luôn xuất file, không cần hỏi.

1. Nếu cần quy tắc tạo/recalc Excel, gọi skill `anthropic-skills:xlsx`.
2. Ghi toàn bộ bug ra `bugs.json` theo đúng thứ tự màn trong flow. Mỗi bug là một object `{"screen", "title", "severity", "actual", "expected", "attachment"}` (`severity` ∈ `Critical` / `High` / `Medium` / `Low`), nội dung giống hệt bảng note bug. Màn không có lỗi ghi `{"screen": "Intro 2", "no_bug": true}`.
3. Chạy script đi kèm (cần `openpyxl`). Với funnel, lưu vào `funnel/funnel-testing/<app>/<niche>/<ddmmyyyy>/` (mirror path của `funnel-development/`, xem `funnel/funnel-testing/README.md`); bảng note bug lưu thêm thành `bug-report.md` cùng thư mục:
   ```
   python3 .claude/skills/qa-ui-test/scripts/export_bugs.py bugs.json <test-dir>/<Project>_UI_Bug_Report_<ddmmyyyy>.xlsx --project "<Project>" --tester "<Tester>"
   ```
   Summary dùng công thức COUNTIFS, Excel/Google Sheet tự tính khi mở. Nếu có LibreOffice và script `recalc.py` của skill xlsx thì chạy thêm để kiểm tra công thức.
4. Báo đường dẫn file, kèm 1–2 câu tóm tắt số bug theo màn/loại.
5. **Dọn screenshot:** screenshot chỉ dùng trong lượt test. Sau khi đã xuất xong `bug-report.md`, `bugs.json` và file Excel (và đã xác minh lại các bug cần xem ảnh), xoá thư mục `screens/` của lượt đó (`rm -rf <test-dir>/screens`). Khi bắt đầu lượt test mới, xoá `screens/` cũ của funnel đó trước khi chụp (`qa_capture.mjs` tự làm việc này). Report và Excel vẫn giữ tên file ảnh ở cột Attachment để tham chiếu; ảnh không đưa lên git (`.gitignore`).

File gồm 2 sheet:
- **Summary**: thông tin project/tester/ngày export, bảng đếm bug theo `Screen × Bug Type` và bảng đếm theo Severity (công thức COUNTIFS/COUNTIF, tự cập nhật khi QA sửa sheet Bug List).
- **Bug List**: `# | Screen | Bug Type | Severity | Title | Actual Result | Expected Result | Attachment`. Header cố định, có filter, Bug Type tự tách từ Title. Màn không có lỗi hiển thị dòng "Không phát hiện lỗi".

## Data test khi flow yêu cầu nhập thông tin

Khi màn yêu cầu nhập thông tin để đi tiếp luồng, dùng đúng data test dưới đây (không tự bịa data khác, trừ khi đang test case validation như input rỗng, toàn space, sai format):

| Field | Giá trị |
|---|---|
| Name | `test` |
| Email | `test@gmail.com` |

Card test (Stripe test card):
```
Name: test
Number: 4242 4242 4242 4242
Expiry date: 02/29
CVV: 222
```

Khi Claude tự thao tác trên trình duyệt:
- Trước khi nhập Name/Email hoặc bấm submit/Next/Continue, hỏi user xác nhận một lần cho bước đó.
- Chỉ tự nhập card test khi trang chạy trên host dev local (`localhost`, `127.0.0.1`, `*.localhost`, `*.test`). Với các link khác (staging, production, domain thật), dừng ở màn thanh toán, báo user tự nhập card test để đi tiếp, sau đó tiếp tục review các màn sau.
- Không nhập card thật hay thông tin cá nhân thật dưới bất kỳ hình thức nào.

Khi log bug, nếu lỗi xảy ra ở bước nhập data, ghi rõ data đã dùng trong Actual Result (vd. "Nhập Email `test@gmail.com` → button Continue vẫn disabled").

## 5 nguyên tắc bắt buộc

1. **Title ngắn, có Screen/Feature** — trả lời được "ở đâu + lỗi gì". Mỗi bug có **Severity** theo tác động lên user/doanh thu, không theo độ khó sửa.
2. **Actual chỉ mô tả hiện trạng**, không đoán nguyên nhân, không đổ lỗi ("Dev xử lý sai" là sai).
3. **Expected phải có căn cứ** từ Figma/Spec/Requirement/Design System. Nếu spec không đề cập, ghi rõ "Spec chưa định nghĩa – cần PM/Designer confirm" thay vì tự đặt expected.
4. **UI bug phải có screenshot/video** khi có thể — luôn có mục Attachment.
5. **Lỗi vừa UI vừa Logic** → tách thành 2 bug, hoặc ghi rõ phần nào là UI, phần nào là behavior. Ví dụ: "Nhập toàn khoảng trắng vẫn enable Next Step" là `[Logic]` (validation), không phải `[UI]`.

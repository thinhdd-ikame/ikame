# Quy chuẩn test UI – Checklist chi tiết

## Mục lục
A. Layout / Alignment · B. Typography / Text · C. Component / Control · D. Color / Highlight · E. Button · F. Input / Textbox · G. Responsive / Device · H. Navigation / Transition · I. System UI / Permission · Checklist nhanh

## A. Layout / Alignment
- Vị trí các thành phần đúng theo Design/Figma.
- Text, button, image, icon căn đúng trái/phải/giữa (cả horizontal và vertical).
- Khoảng cách (spacing/padding/margin) giữa các component đồng nhất.
- Không bị lệch khi thay đổi kích thước màn hình.
- Không bị che bởi: Status bar, Navigation bar, Home Indicator, Keyboard, Bottom sheet/Popup.
- Không overlap giữa các component.

Ví dụ: Title `What is your age group?` đang lệch lên trên, không đúng vertical alignment theo design.

## B. Typography / Text
Kiểm tra: font family, font size, font weight, text color, line height, letter spacing, text alignment, uppercase/lowercase, không truncate, không wrap sai, không vượt container, nội dung đúng copy/spec.

| Case | Expected |
|---|---|
| Text dài | Không bị cắt |
| Text nhiều dòng | Line height đúng |
| Text ngắn | Không bị lệch vị trí |
| Text uppercase | Đúng design |
| Text có special character | Hiển thị đúng |
| Input toàn space | Không được coi là dữ liệu hợp lệ |

## C. Component / Control
Component: Button, Text field, Checkbox, Radio, Option, Toggle, Slider, Tab, Dropdown, Card.

State cần test: **Default → Selected → Unselected → Disabled → Loading → Error → Success**

Luồng mẫu cho Option:
```
Default → Tap → Selected → highlight đúng màu → Tap option khác → Option cũ về Default → Option mới Selected
```

## D. Color / Highlight
Kiểm tra: background, text, border, selected, disabled, error, highlight color, opacity, gradient.
Ưu tiên kiểm tra **tính đồng nhất token màu giữa các màn cùng loại** (vd. Option selected ở mọi màn Paywall phải dùng cùng color/token, không được mỗi màn một màu).

## E. Button
Kiểm tra: size, width/height, corner radius, text, font, icon, position, enabled/disabled, loading, pressed state, navigation/action sau khi click.
Case đặc biệt: empty input, input hợp lệ, input không hợp lệ, input chỉ có space, loading, double tap, tap liên tục, keyboard đang mở, offline.

## F. Input / Textbox
Kiểm tra: placeholder, default value, text alignment, cursor, keyboard type, character limit, space, special characters, copy/paste, clear, error message, focus state.
Lưu ý: "Cho phép nhập toàn khoảng trắng nhưng vẫn enable Next Step" là **validation logic**, không chỉ UI.

## G. Responsive / Device
Mỗi UI quan trọng test tối thiểu: small screen, standard screen, large screen, iPhone có Dynamic Island, iPhone có Home Indicator, portrait, landscape (nếu app hỗ trợ). Android: màn nhỏ, màn có notch/punch-hole, gesture navigation vs 3-button nav.
Đối tượng kiểm tra: text, button, image, bottom CTA, progress bar, keyboard, popup, bottom sheet.

## H. Navigation / Transition
Không chỉ test "click có đi màn hay không". Luồng: `Screen A → Click → Loading → Screen B`. Verify:
- Transition đúng.
- Màn cũ không bị giữ lại.
- Popup / bottom sheet / overlay đã đóng.
- Back về đúng màn.
- Data/state được giữ đúng.

Ví dụ bug: chuyển màn nhưng cụm `Select Option` vẫn hiển thị trên màn mới.

## I. System UI / Permission
Test interaction với: ATT, Notification permission, Keyboard, Call, SMS, System popup, Background/Foreground, App kill/reopen.

## Checklist nhanh (trước khi log bug)
```
□ Layout          □ Alignment        □ Spacing          □ Font
□ Font size       □ Font weight      □ Text color       □ Background color
□ Border          □ Corner radius    □ Icon             □ Image
□ Button          □ Input            □ Selected state   □ Disabled state
□ Error state     □ Loading state    □ Empty state      □ Long text
□ Keyboard        □ Safe area        □ Small screen     □ Large screen
□ Portrait/Landscape □ Navigation    □ Popup/Overlay    □ Animation
□ Scroll          □ Dark/Light mode (nếu có)
```

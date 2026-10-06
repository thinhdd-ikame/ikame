# Format log bug UI

## Bug Type (prefix)
Dùng một trong: `[UI]` · `[UI/UX]` · `[Logic]` · `[API]` · `[Crash]` · `[Performance]` · `[Responsive]` (thường đi kèm `[UI][Responsive]`).
Luôn đặt `[Screen/Feature]` ngay sau type → filter bug theo feature nhanh khi regression.

| Type | Khi nào | Ví dụ title |
|---|---|---|
| `[UI]` | Lỗi hiển thị thuần túy | `[UI][Intro-Rate] Title không đúng font weight theo Design` |
| `[UI/UX]` | Liên quan trải nghiệm / interaction | `[UI/UX][Paywall] Option selected không đồng bộ highlight giữa các màn` |
| `[Logic]` | UI đúng nhưng behavior sai | `[Logic][Cancel Subscription] Click "Cancel It For Me" không điều hướng tới Draft Email` |
| `[UI][Responsive]` | Lỗi theo device/screen size | `[UI][Responsive][Intro] Text bị overlap với Top Bar trên màn hình nhỏ` |
| `[API]` | Dữ liệu/response từ server sai | `[API][Paywall] Giá gói không load khi response trả về lỗi 500` |
| `[Crash]` | App crash | `[Crash][Intro] App crash khi kill app và reopen` |
| `[Performance]` | Chậm, giật, lag | `[Performance][Home] Scroll danh sách bị giật trên thiết bị cấu hình thấp` |

## Bảng note bug (format mặc định)
Dùng để QA note nhanh trong quá trình test. Giữ đúng 4 cột nội dung + cột số thứ tự; khi dùng Google Sheet/Excel thì giữ 4 cột `Title | Actual Result | Expected Result | Attachment`.

| # | Title | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|
| 1 | `[Bug Type][Screen/Feature] Mô tả lỗi ngắn gọn` | - | - | Screenshot/Video: |

Ví dụ:

| # | Title | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|
| 1 | `[UI][Paywall 1] Option selected không đồng bộ highlight color` | - Option được chọn hiển thị highlight color khác với các màn Paywall khác. | - Option selected cần hiển thị cùng highlight color theo Design. | Screenshot/Video: |
| 2 | `[UI][Intro 3] Title và Description hiển thị ngược font weight` | - Title đang hiển thị font weight thường, Description hiển thị bold. | - Title cần bold/uppercase, Description cần font weight thường theo Design. | Screenshot/Video: |
| 3 | `[Logic][Cancel Subscription] Click "Cancel It For Me" không điều hướng` | - Click card nhưng không chuyển đến màn Draft Email/Send Mail. | - Click card cần điều hướng đến màn Draft Email/Send Mail. | Screenshot/Video: |
| 4 | `[UI][Intro 1] Progress bar chưa hiển thị background phía dưới` | - Progress bar không có phần background/faded cue phía dưới. | - Hiển thị background/faded cue phía dưới progress bar theo Design. | Screenshot/Video: |
| 5 | `[UI][Intro 2] Text "Age" không được căn giữa textbox` | - Text "Age" đang lệch khỏi vị trí center của textbox. | - Text "Age" cần được căn giữa textbox theo Design. | Screenshot/Video: |

Lưu ý khi viết trong bảng:
- Actual/Expected ngắn gọn 1–2 câu, bắt đầu bằng `- `; không xuống dòng trong ô.
- Cột Attachment luôn có `Screenshot/Video:`; chỉ điền tên file/link khi có thật, không bịa.

### Test Web: chia bảng theo từng màn
Mỗi màn một heading, theo thứ tự flow; số `#` đánh liên tục trên toàn bộ các bảng để dễ tham chiếu.

```
### Intro 1
| # | Title | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|
| 1 | [UI][Intro 1] ... | - ... | - ... | Screenshot/Video: |

### Intro 2
Không phát hiện lỗi.

### Paywall 1
| # | Title | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|
| 2 | [UI][Paywall 1] ... | - ... | - ... | Screenshot/Video: |

### Upsale 1
...

### Download App
...
```

## Template bug report đầy đủ
Dùng khi user yêu cầu bug report chi tiết cho một bug (sau khi đã verify từ bảng note). Chỉ dùng đúng các mục dưới đây, không thêm Severity, Environment, Pre-condition hay Steps to Reproduce.
```
Title:
[Bug Type][Screen/Feature] Mô tả lỗi ngắn gọn

Actual Result:
- 

Expected Result:
- 

Attachment:
- Screenshot/Video:
- Log:
- Figma/Spec:
```
Vì không có mục Steps, phần Actual cần nêu đủ ngữ cảnh (đang ở màn nào, thao tác gì) để Dev tự reproduce được. Mục Attachment không có thông tin thì để trống, không bịa.

## Quy chuẩn Title
Trả lời được **Ở đâu + lỗi gì**.
- ❌ `UI bị sai` · `Không đúng design` · `Option lỗi`
- ✅ `[UI][Paywall] Option selected không đồng bộ highlight color giữa các màn`
- ✅ `[UI][Intro-Rate] Title và Description đang sử dụng font weight ngược với Design`
- ✅ `[UI][Age Group] Text "Age" không được căn giữa trong textbox`
- ✅ `[UI][Progress] Progress bar không hiển thị background/shadow phía dưới`

## Quy chuẩn Actual / Expected
**Actual** – mô tả app đang làm gì, không giải thích nguyên nhân. Viết thành câu đầy đủ theo công thức: *Khi + thao tác → hệ thống phản hồi → ảnh hưởng*.
- ❌ `Developer xử lý sai UI.`
- ✅ `Sau khi chọn Option A, highlight của Option A hiển thị màu X, trong khi các màn Paywall khác sử dụng màu Y, khiến trải nghiệm chọn gói không đồng nhất.`

**Expected** – hành vi/UI mong muốn dựa trên Figma/spec.
- ✅ `Option được chọn cần sử dụng cùng màu highlight theo Design System/Figma trên tất cả các màn Paywall.`
- Nếu spec không định nghĩa: `Spec chưa định nghĩa – cần PM/Designer confirm.`

## Ví dụ bug hoàn chỉnh
```
Title:
[UI][Paywall] Option selected không đồng bộ highlight color giữa các màn

Actual Result:
- Khi chọn cùng loại Option trên các màn Paywall khác nhau, highlight color của option được selected hiển thị khác nhau giữa các màn, khiến giao diện chọn gói không đồng nhất.

Expected Result:
- Option được selected cần sử dụng cùng highlight color theo Design System/Figma trên tất cả các màn Paywall.

Attachment:
- Screenshot/Video: 
- Log: 
- Figma/Spec: 
```

## Tách bug UI vs Logic
Ví dụ "Textbox cho nhập toàn space, Next Step vẫn enable":
- `[Logic][Age Group] Button Next Step vẫn enable khi input chỉ chứa khoảng trắng` — validation.
- Nếu đồng thời text trong textbox lệch căn → bug `[UI]` riêng.

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

## Severity
Đánh theo **tác động lên user/doanh thu/pháp lý**, không theo độ khó sửa. Lỗi lặp nhiều màn vẫn chỉ một mức (theo màn nặng nhất).

| Severity | Khi nào | Ví dụ |
|---|---|---|
| `Critical` | Chặn luồng hoặc tiền: crash, không đi tiếp được, không thanh toán được, sai giá/sai gói, mất dữ liệu đã nhập | Button Continue không bấm được; paywall hiển thị sai giá; app crash khi reopen |
| `High` | Không chặn nhưng ảnh hưởng conversion, pháp lý hoặc logic hiển thị sai cho user | Không thấy CTA ở first view màn nhỏ; Terms/Privacy không bấm được; thiếu tên pháp nhân ở footer; step counter nhảy số; kết quả hiển thị mâu thuẫn giữa 2 màn |
| `Medium` | Lỗi nhìn thấy rõ, làm giảm tin tưởng hoặc khó dùng | Overlap/che chữ; component bị cắt; icon trùng; ảnh placeholder; không đồng nhất state/màu giữa các màn |
| `Low` | Cosmetic hoặc lệch nhỏ so với spec, cần Designer confirm | Thiếu chevron; spacing/khoảng trống; art lệch brief; copy lặp từ |

Không chắc giữa 2 mức thì chọn mức thấp hơn và ghi lý do ngắn trong Actual.

## Bảng note bug (format mặc định)
Dùng để QA note nhanh trong quá trình test. Giữ đúng 5 cột nội dung + cột số thứ tự; khi dùng Google Sheet/Excel thì giữ 5 cột `Title | Severity | Actual Result | Expected Result | Attachment`.

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 1 | `[Bug Type][Screen/Feature] Mô tả lỗi ngắn gọn` | Critical / High / Medium / Low | - | - | Screenshot/Video: |

Ví dụ:

| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 1 | `[UI][Paywall 1] Option selected không đồng bộ highlight color` | Medium | - Option được chọn hiển thị highlight color khác với các màn Paywall khác. | - Option selected cần hiển thị cùng highlight color theo Design. | Screenshot/Video: |
| 2 | `[UI][Intro 3] Title và Description hiển thị ngược font weight` | Medium | - Title đang hiển thị font weight thường, Description hiển thị bold. | - Title cần bold/uppercase, Description cần font weight thường theo Design. | Screenshot/Video: |
| 3 | `[Logic][Cancel Subscription] Click "Cancel It For Me" không điều hướng` | High | - Click card nhưng không chuyển đến màn Draft Email/Send Mail. | - Click card cần điều hướng đến màn Draft Email/Send Mail. | Screenshot/Video: |
| 4 | `[UI][Intro 1] Progress bar chưa hiển thị background phía dưới` | Low | - Progress bar không có phần background/faded cue phía dưới. | - Hiển thị background/faded cue phía dưới progress bar theo Design. | Screenshot/Video: |
| 5 | `[UI][Intro 2] Text "Age" không được căn giữa textbox` | Low | - Text "Age" đang lệch khỏi vị trí center của textbox. | - Text "Age" cần được căn giữa textbox theo Design. | Screenshot/Video: |

Lưu ý khi viết trong bảng:
- Actual/Expected ngắn gọn 1–2 câu, bắt đầu bằng `- `; không xuống dòng trong ô.
- Cột Severity luôn có một trong `Critical` / `High` / `Medium` / `Low`.
- Cột Attachment luôn có `Screenshot/Video:`; chỉ điền tên file/link khi có thật, không bịa.

### Test Web: chia bảng theo từng màn
Mỗi màn một heading, theo thứ tự flow; số `#` đánh liên tục trên toàn bộ các bảng để dễ tham chiếu.

```
### Intro 1
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 1 | [UI][Intro 1] ... | Medium | - ... | - ... | Screenshot/Video: |

### Intro 2
Không phát hiện lỗi.

### Paywall 1
| # | Title | Severity | Actual Result | Expected Result | Attachment |
|---|---|---|---|---|---|
| 2 | [UI][Paywall 1] ... | Medium | - ... | - ... | Screenshot/Video: |

### Upsale 1
...

### Download App
...
```

## Template bug report đầy đủ
Dùng khi user yêu cầu bug report chi tiết cho một bug (sau khi đã verify từ bảng note). Chỉ dùng đúng các mục dưới đây, không thêm Environment, Pre-condition hay Steps to Reproduce.
```
Title:
[Bug Type][Screen/Feature] Mô tả lỗi ngắn gọn

Severity:
Critical / High / Medium / Low

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

Severity:
Medium

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

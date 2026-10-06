# funnel-testing

Kết quả QA UI cho các funnel, tạo bằng skill `qa-ui-test` (`.claude/skills/qa-ui-test/`).

## Cấu trúc

Đường dẫn mirror `funnel-development/` (giống `creative-development/`): mỗi funnel có một thư mục cùng path app/niche.

```
funnel-testing/
└── <app>/<niche>/
    └── <ddmmyyyy>/                         # mỗi lần test một thư mục theo ngày
        ├── screens/                        # TẠM: screenshot từng màn, xoá sau khi xuất report; không commit
        ├── bugs.json                       # dữ liệu bug, input cho export_bugs.py
        ├── bug-report.md                   # bảng note bug chia theo màn
        └── <Project>_UI_Bug_Report_<ddmmyyyy>.xlsx
```

Ví dụ: funnel `funnel-development/ai-photo-video/dancing/cat-dancing/` → test lưu ở `funnel-testing/ai-photo-video/dancing/cat-dancing/06102026/`.

## Cách dùng

Chụp màn tự động: `node funnel/tools/qa_capture.mjs funnel/funnel-development/<app>/<niche>/funnel.html funnel/funnel-testing/<app>/<niche>/<ddmmyyyy>` (cần `cd funnel/tools && npm i` lần đầu). Ra `screens/` + `capture.json`.


Nói với Claude Code: "test UI funnel cat-dancing" (hoặc đưa link FunnelFox / screenshot). Skill sẽ click qua funnel, log bug theo màn (`Intro n`, `Paywall n`, `Upsale n`, `Download App`) và xuất file Excel.

Data test: Name `test`, Email `test@gmail.com`, card Stripe test `4242 4242 4242 4242` · `02/29` · `222` (chỉ tự nhập trên localhost; link thật thì QA tự nhập).

## Screenshot

Thư mục `screens/` là tạm: xoá sau mỗi lượt test (khi report + Excel đã xuất xong), và `qa_capture.mjs` tự xoá `screens/` cũ khi bắt đầu lượt mới. `.gitignore` chặn `funnel/funnel-testing/**/screens/`. Cột Attachment vẫn ghi tên file ảnh để tham chiếu.

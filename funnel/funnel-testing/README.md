# funnel-testing

Kết quả QA UI cho các funnel, tạo bằng skill `qa-ui-test` (`.claude/skills/qa-ui-test/`).

## Cấu trúc

Đường dẫn mirror `funnel-development/` (giống `creative-development/`): mỗi funnel có một thư mục cùng path app/niche.

```
funnel-testing/
└── <app>/<niche>/
    └── <ddmmyyyy>/                         # mỗi lần test một thư mục theo ngày
        ├── screens/                        # screenshot từng màn (Intro 1, Paywall 1, ...) ở 375×667 và 430×932
        ├── bugs.json                       # dữ liệu bug, input cho export_bugs.py
        ├── bug-report.md                   # bảng note bug chia theo màn
        └── <Project>_UI_Bug_Report_<ddmmyyyy>.xlsx
```

Ví dụ: funnel `funnel-development/ai-photo-video/dancing/cat-dancing/` → test lưu ở `funnel-testing/ai-photo-video/dancing/cat-dancing/06102026/`.

## Cách dùng

Nói với Claude Code: "test UI funnel cat-dancing" (hoặc đưa link FunnelFox / screenshot). Skill sẽ click qua funnel, log bug theo màn (`Intro n`, `Paywall n`, `Upsale n`, `Download App`) và xuất file Excel.

Data test: Name `test`, Email `test@gmail.com`, card Stripe test `4242 4242 4242 4242` · `02/29` · `222` (chỉ tự nhập trên localhost; link thật thì QA tự nhập).

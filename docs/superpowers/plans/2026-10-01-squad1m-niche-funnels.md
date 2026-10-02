# Squad 1M — Niche Funnels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Mỗi task funnel còn bắt buộc dùng skill `funnel-content-writer`.

**Goal:** Viết brief (`funnel-content.md`) + demo clickable (`demo.html`) cho toàn bộ ngách còn thiếu trong sheet "Ngách Squad 1M - số liệu tăng trưởng" (9 app), dựa trên các funnel đối thủ đang chạy trên Meta.

**Architecture:** Mỗi ngách là một folder độc lập dưới `funnel/funnel-development/<app-or-category>/<niche>/`, chứa brief, demo, ảnh `img/`. Task 0 dựng 2 công cụ kiểm tra (lint brief, smoke-test demo) để mọi task funnel có bước "test" khách quan. Các task funnel độc lập với nhau, chạy song song theo app được. Cuối cùng export FunnelFox theo app.

**Tech Stack:** Markdown brief theo `.claude/skills/funnel-content-writer/references/file-format.md`; demo single-file HTML/CSS/JS (khung từ `funnel/funnel-development/nebula/palm-reading/demo.html`); Python 3 (lint, build); Node + Playwright (smoke test); ảnh gen qua ikame gateway model `gemini-3.1-flash-image`.

**Spec:** Sheet Google `1RuNF8fCwMEmPEOvgG643Dl2NUrv46606XEJX5mBLveE` (tab "Untitled") + gap analysis trong hội thoại 2026-10-01. Nghiên cứu thị trường: `funnel/research/squad1m-niches-2026-10/*.md` (AdSpyLab captures 2026-09/10).

## Global Constraints

- Mỗi brief viết bằng skill `funnel-content-writer`, đúng frontmatter: `niche, display_name, archetype, subject, input, output, screens, monetization, creative_screens, motion`.
- Copy rules: Headline ≤6 từ, Body ≤12 từ, Options = emoji + 1-3 từ + "✏️ Other" ở câu hỏi tự do, CTA 1-4 từ, mỗi màn có A/B copy.
- Paywall = long-scroll web sales page (brand bar, hero cá nhân hoá, plan block, what's inside, how it works, proof, guarantee, FAQ, plan block lặp, sticky CTA). Không phải sheet 2 thẻ giá kiểu app.
- Mọi funnel có màn fallback/last-chance offer sau khi đóng paywall; `CONFIG.offer` trong demo, `expiresMin: null` nếu không có hạn thật.
- Không bịa giá: dùng token `{{price_*}}`, `{{renewal_*}}`; chỉ mô tả cấu trúc gói (thường 1-week intro / 4-week pre-selected / 12-week anchor). Giá renewal hiện cạnh mọi giá intro.
- Cấm copy dark pattern của đối thủ: timer reset, mã giảm giá giả, scratch-card định sẵn, "no charge yet" khi có charge, renewal tăng khi hết timer, persona chuyên gia giả, ticker user giả, % "nhanh hơn 93%" giữa test.
- Ngách sức khoẻ (Calmio, autism/ADHD/trauma/brain): link "Need help now?" mọi màn, màn kỳ vọng "companion/self-check, not therapy/diagnosis" trước câu hỏi nhạy cảm, không claim y khoa, không khuyên bỏ thuốc; copy ads không ám chỉ thuộc tính cá nhân ("Do you have ADHD?").
- Ngách 18+ (Chai): age gate, SFW, không input tình dục.
- Folder: niche nằm dưới folder app/category hiện có (memory `project-funnel-dev-app-folders`). Tên kebab-case như bảng dưới.
- Visual theo brand app sẵn có: đọc brief anh em cùng app (`Reuse:` trong từng task) để lấy palette, font, tokens, social proof thật của app. Không tái dùng số liệu/press logo của app khác.
- Commit chỉ add đúng file của task (`git add <folder>`), không `git add -A` — working tree đang có nhiều thay đổi chưa commit của user.
- Nếu research ghi `[I]`/inferred cho một màn, brief phải ghi rõ "unverified" ở Notes.

## Review Focus

1. Brief vượt giới hạn từ ở Headline/Body có token dài (`{{name}}`) → lint đếm token là 1 từ; reviewer đọc lại trên viewport 390px trong demo.
2. Demo bấm "Back" từ paywall/offer hoặc đóng offer hai lần → offer chỉ hiện một lần (sessionStorage flag), không kẹt vòng lặp; smoke test gọi `go()` qua mọi màn kể cả offer.
3. User chọn "✏️ Other" rồi để trống → nút CTA disabled, không crash; reviewer kiểm tay ít nhất 1 màn Other mỗi demo.
4. Token cá nhân hoá chưa nhập (bỏ qua màn name) → hiển thị fallback ("you"), không hiện `{{name}}` thô; smoke test fail nếu body text chứa `{{`.
5. Ngách sức khoẻ thiếu link hỗ trợ/disclaimer ở paywall → reviewer grep `Need help` trong demo Calmio/Testlibrary-health.

---

## Funnel Build Procedure (FBP) — dùng cho mọi task 1–44

Mỗi task funnel bên dưới chỉ ghi phần *riêng của ngách* (folder, reference, spine, result, paywall, khác biệt, rủi ro). Các bước thực thi giống nhau và được liệt kê đầy đủ ở đây; executor đọc FBP + task của mình.

- [ ] **Step 1: Đọc input** — section research được trỏ ở `Research:`, brief anh em ở `Reuse:`, archetype file `.claude/skills/funnel-content-writer/references/archetypes/<archetype>.md`, `references/blocks.md`, `references/file-format.md`, `references/visual-language.md`.
- [ ] **Step 2: Viết brief** `<folder>/funnel-content.md` bằng skill `funnel-content-writer` theo spine/result/paywall của task. Intro nêu reference funnel (brand, URL, ads, ngày capture) và điểm cố ý khác đối thủ.
- [ ] **Step 3: Lint brief**
  Run: `python3 funnel/tools/lint_funnel.py <folder>/funnel-content.md`
  Expected: `OK`. Nếu fail → sửa brief, chạy lại.
- [ ] **Step 4: Ảnh** — gen ảnh cho hook/result/paywall hero vào `<folder>/img/` (mẫu: `nebula/palm-reading/gen_images.py`, model `gemini-3.1-flash-image`; KHÔNG dùng model OpenAI cho prompt glamour). JPG, ≤200 KB/ảnh.
- [ ] **Step 5: Build demo** `<folder>/demo.html` theo `references/prototype.md`, khung từ `nebula/palm-reading/demo.html` (giữ `const SCREENS`, `function go(n)`, `CONFIG.offer`, web paywall). Đúng số màn, đánh số, A/B, nhánh như brief.
- [ ] **Step 6: Smoke test demo**
  Run: `node funnel/tools/smoke_demo.mjs <folder>/demo.html <screens>`
  Expected: `OK <screens> screens`. Fail → sửa, chạy lại.
- [ ] **Step 7: Kiểm tay** — mở demo, đi hết luồng thật bằng click: 1 màn "Other" để trống, đóng paywall → offer → đóng lần 2 (offer không hiện lại), Back từ offer.
- [ ] **Step 8: Đăng ký archetype** — nếu lệch archetype, thêm dòng "Known variants" vào file archetype; nếu shape mới, tạo file archetype + dòng index trong `archetypes/README.md`.
- [ ] **Step 9: Publish** demo lên Artifact (private), ghi link vào cuối Notes của brief.
- [ ] **Step 10: Commit**
  ```bash
  git add <folder> .claude/skills/funnel-content-writer/references/archetypes/
  git commit -m "feat(funnel): add <app> <niche> funnel brief + demo"
  ```

---

## Task 0: Công cụ kiểm tra (lint brief + smoke demo)

**Files:**
- Create: `funnel/tools/lint_funnel.py`
- Create: `funnel/tools/test_lint_funnel.py`
- Create: `funnel/tools/smoke_demo.mjs`
- Create: `funnel/tools/package.json`
- Modify: `.gitignore` (thêm `funnel/tools/node_modules/`)

**Interfaces:**
- Produces: `python3 funnel/tools/lint_funnel.py <md>...` → in `OK` exit 0, hoặc từng lỗi `<path>: <msg>` exit 1. `node funnel/tools/smoke_demo.mjs <demo.html> <N>` → `OK N screens` exit 0, hoặc danh sách lỗi exit 1. Demo phải expose global `go(n)`.

- [ ] **Step 1: Viết test thất bại** `funnel/tools/test_lint_funnel.py`

```python
import unittest
from lint_funnel import lint

GOOD = """---
niche: demo
display_name: Demo
archetype: personalization-quiz
subject: person
input: birth date
output: reading
screens: 3
monetization: web paywall
creative_screens:
  hook-a: 1
motion: stars drift
---
# Funnel Content — Demo

### 1. Hook A — Welcome
**Headline A:** Meet your {{name}} chart
**Body A:** Two minutes, five questions, one honest reading.
### 2. Paywall
**Headline A:** Your reading is ready
### 3. Last-chance offer
**Headline A:** One smaller option
"""

class LintTest(unittest.TestCase):
    def test_good_passes(self):
        self.assertEqual(lint(GOOD), [])

    def test_missing_frontmatter_key(self):
        errs = lint(GOOD.replace("motion: stars drift\n", ""))
        self.assertIn("frontmatter missing 'motion'", errs)

    def test_long_headline(self):
        errs = lint(GOOD.replace("Meet your {{name}} chart", "Meet your brand new personal birth chart today"))
        self.assertTrue(any(e.startswith("Headline A has 8 words") for e in errs))

    def test_long_body(self):
        errs = lint(GOOD.replace("Two minutes, five questions, one honest reading.",
                                 "It takes two short minutes and five simple questions to get one honest reading."))
        self.assertTrue(any(e.startswith("Body A has") for e in errs))

    def test_screen_count_mismatch(self):
        errs = lint(GOOD.replace("screens: 3", "screens: 4"))
        self.assertIn("frontmatter screens=4 but 3 screen headings", errs)

    def test_gap_in_numbering(self):
        errs = lint(GOOD.replace("### 3. Last-chance offer", "### 4. Last-chance offer"))
        self.assertTrue(any(e.startswith("screens not numbered") for e in errs))

    def test_no_paywall(self):
        errs = lint(GOOD.replace("### 2. Paywall", "### 2. Plans"))
        self.assertIn("no Paywall screen", errs)

    def test_no_offer(self):
        errs = lint(GOOD.replace("### 3. Last-chance offer", "### 3. Goodbye"))
        self.assertIn("no fallback/last-chance offer screen", errs)

    def test_placeholder(self):
        errs = lint(GOOD + "\nTBD pricing\n")
        self.assertIn("placeholder text (TBD/TODO/lorem)", errs)

if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Chạy test, xác nhận fail**
  Run: `cd funnel/tools && python3 -m unittest test_lint_funnel -v`
  Expected: FAIL — `ModuleNotFoundError: No module named 'lint_funnel'`

- [ ] **Step 3: Viết `funnel/tools/lint_funnel.py`**

```python
#!/usr/bin/env python3
"""Lint funnel-content.md files against the format contract and copy rules."""
import re
import sys

REQUIRED = ["niche", "display_name", "archetype", "subject", "input", "output",
            "screens", "monetization", "creative_screens", "motion"]
LIMITS = (("Headline", 6), ("Body", 12))


def lint(text):
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not m:
        return ["missing frontmatter"]
    fm = m.group(1)
    errs = []
    keys = set(re.findall(r"^([a-z_]+):", fm, re.M))
    errs += [f"frontmatter missing '{k}'" for k in REQUIRED if k not in keys]

    nums = [int(n) for n in re.findall(r"^### (\d+)\.", text, re.M)]
    if nums != list(range(1, len(nums) + 1)):
        errs.append(f"screens not numbered 1..N continuously: {nums}")
    sm = re.search(r"^screens:\s*(\d+)", fm, re.M)
    if sm and int(sm.group(1)) != len(nums):
        errs.append(f"frontmatter screens={sm.group(1)} but {len(nums)} screen headings")

    for label, limit in LIMITS:
        for var, val in re.findall(rf"^\*\*{label} ([AB]):\*\*\s*(.+)$", text, re.M):
            n = len(re.sub(r"\{\{[^}]+\}\}", "X", val).split())
            if n > limit:
                errs.append(f"{label} {var} has {n} words (>{limit}): {val.strip()}")

    heads = " ".join(re.findall(r"^### \d+\..*$", text, re.M)).lower()
    if "paywall" not in heads:
        errs.append("no Paywall screen")
    if not re.search(r"offer|upsell|last.chance", heads):
        errs.append("no fallback/last-chance offer screen")
    if re.search(r"\b(TBD|TODO|lorem ipsum)\b", text, re.I):
        errs.append("placeholder text (TBD/TODO/lorem)")
    return errs


if __name__ == "__main__":
    failed = 0
    for path in sys.argv[1:]:
        errs = lint(open(path, encoding="utf-8").read())
        for e in errs:
            print(f"{path}: {e}")
        failed += bool(errs)
    print("OK" if not failed else f"{failed} file(s) failed")
    sys.exit(1 if failed else 0)
```

- [ ] **Step 4: Chạy test, xác nhận pass**
  Run: `cd funnel/tools && python3 -m unittest test_lint_funnel -v`
  Expected: 9 tests OK.

- [ ] **Step 5: Chạy lint lên brief tham chiếu**
  Run: `python3 funnel/tools/lint_funnel.py funnel/funnel-development/nebula/palm-reading/funnel-content.md`
  Expected: `OK`. Nếu chỉ fail vì heading offer/từ ngữ của brief cũ: ghi danh sách vào commit message, KHÔNG sửa brief cũ; nếu fail vì regex quá chặt với format hợp lệ (vd. heading "Fallback"), nới regex + thêm test case tương ứng.

- [ ] **Step 6: Viết `funnel/tools/package.json` + `smoke_demo.mjs`**

```json
{ "name": "funnel-tools", "private": true, "type": "module",
  "dependencies": { "playwright": "^1.50.0" } }
```

```js
// Usage: node funnel/tools/smoke_demo.mjs <demo.html> <screens>
import { chromium } from 'playwright';
import path from 'node:path';

const [file, nArg] = process.argv.slice(2);
const N = Number(nArg);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
page.on('requestfailed', r => { if (!r.url().includes('fonts.g')) errors.push(`requestfailed: ${r.url()}`); });

await page.goto('file://' + path.resolve(file));
await page.waitForTimeout(500);
const blank = [], raw = [], overflow = [];
for (let i = 1; i <= N; i++) {
  await page.evaluate(n => window.go(n), i);
  await page.waitForTimeout(250);
  const info = await page.evaluate(() => ({
    text: document.body.innerText.trim(),
    wide: document.documentElement.scrollWidth > window.innerWidth,
  }));
  if (info.text.length < 10) blank.push(i);
  if (info.text.includes('{{')) raw.push(i);
  if (info.wide) overflow.push(i);
}
await browser.close();
if (blank.length) errors.push(`blank screens: ${blank.join(',')}`);
if (raw.length) errors.push(`raw {{token}} on screens: ${raw.join(',')}`);
if (overflow.length) errors.push(`horizontal overflow at 390px on screens: ${overflow.join(',')}`);
console.log(errors.length ? errors.join('\n') : `OK ${N} screens`);
process.exit(errors.length ? 1 : 0);
```

- [ ] **Step 7: Cài đặt + chạy smoke lên demo tham chiếu**
  Run: `cd funnel/tools && npm install && npx playwright install chromium && cd ../.. && node funnel/tools/smoke_demo.mjs funnel/funnel-development/nebula/palm-reading/demo.html 23`
  Expected: `OK 23 screens`. Lưu ý: demo cũ có `{{price}}` placeholder hiển thị có chủ đích trên paywall (khung vàng) — nếu chỉ fail vì `raw {{token}}` ở màn paywall/offer, thêm cờ `--allow-price-tokens` bỏ qua token bắt đầu bằng `{{price`/`{{renew`, ghi vào usage, chạy lại.

- [ ] **Step 8: Commit**
  ```bash
  echo "funnel/tools/node_modules/" >> .gitignore
  git add funnel/tools .gitignore
  git commit -m "chore(funnel): add brief linter and demo smoke test"
  ```

---

## Wave 1 — Ngách "có trong plan" còn thiếu + UT1 đang lên

### Task 1: Nebula — Ex back / ex compatibility ★

**Folder:** `funnel/funnel-development/nebula/ex-compatibility/` · **Archetype:** personalization-quiz · **Reuse:** `nebula/palm-reading/funnel-content.md` (web paywall chuẩn), `nebula/soulmate-sketch/`
**Research:** `funnel/research/squad1m-niches-2026-10/nebula-chai.md` §1
**Reference:** Nebula ex-compatibility (5,196 ads/7 tháng, 38 màn, live config); Astroline `mode=moon` "Is Your Relationship Truly Over?" (7,377 ads/7 tháng, 14 bước).
**Spine (~24 màn):** hook "Is it really over?" → goal (get back / closure / move on) → DOB+time của user → giới tính + DOB+time của ex → lịch sử (ai chia tay, lý do, còn liên lạc?) → 2-3 câu dấu hiệu/fate → palm photo tuỳ chọn → loader có micro-question → teaser kết quả → email → web paywall → offer → reading.
**Result trước paywall:** điểm hợp đôi 2 chart + verdict một dòng ("door still open / closure season") + 1 transit date mờ.
**Paywall:** subscription 3 gói chuẩn; KHÔNG làm "chọn mức trial $1/$5/$9/$13.67", không tăng renewal khi hết timer, không downsell ẩn $19, không upsell 900 credit chat trong web funnel.
**Khác biệt:** có nhánh "move on" lành mạnh (không chỉ "win them back"); verdict trung thực, không hứa ex quay lại.
**Rủi ro:** Meta policy về relationship claims — không "guaranteed", không ám chỉ thuộc tính cá nhân trong ad.

- [ ] Thực hiện FBP Steps 1–10 với `<folder>` trên, `<screens>` = số màn trong frontmatter.

### Task 2: Nebula — Marriage compatibility ★

**Folder:** `funnel/funnel-development/nebula/marriage-compatibility/` · **Archetype:** personalization-quiz · **Reuse:** `nebula/palm-reading/`, Task 1 brief
**Research:** `nebula-chai.md` §1 (Nebula marriage 605 ads/42 màn; Hint marriage-reading 1,342 ads/62 màn, paywall captured 2026-09-02)
**Spine (~24 màn):** hook "When will you marry?" → trạng thái (single / dating / engaged) → nhánh: single → mong muốn ở partner; có partner → DOB partner → DOB+time+place user → 3 câu giá trị hôn nhân (con cái, nơi sống, tài chính) → palm tuỳ chọn → loader → teaser "marriage window" (khoảng năm, không ngày cụ thể) → email → paywall → offer → reading.
**Result:** khoảng thời gian thuận lợi + 3 trục hợp đôi (single: hồ sơ partner phù hợp).
**Paywall:** subscription 3 gói chuẩn; không mã giả "MARRIAGE93", không bump "speed up" €3.99.
**Khác biệt:** cho cả người đã có partner (Hint chỉ single); trục giá trị thực tế thay vì chỉ sao.
**Rủi ro:** không dự đoán ngày cưới chắc chắn — ghi "astrology for reflection".

- [ ] Thực hiện FBP Steps 1–10.

### Task 3: Testlibrary — Personality / MBTI ★

**Folder:** `funnel/funnel-development/testlibrary/personality-mbti/` · **Archetype:** assessment-unlock · **Reuse:** `testlibrary/funnel-content.md` (IQ, mục "Reusing this for other tests": screens 1-3, 6-16 tái dùng, screen 4 → Likert, screen 14 → profile)
**Research:** `testlibrary.md` §1 (Testora ps1tp, 34 màn/90 câu 8 phần), §2 (64Personality); `testlibrary-captures.md`
**Spine (~16 màn, template lặp):** landing "Discover your type" + disclosure "free test, paid full report" → age band → lý do (career / relationships / self) → Likert 5 mức × 40 câu (4 checkpoint "you're 25% done", không flattery) → email → tên cho profile → loader → teaser: 4 chữ cái + 1 trait bar rõ, còn lại mờ → paywall → offer → full profile.
**Result:** type 4 chữ + 4 trait bar % + 3 strengths; khoá: career fit, relationship style, growth plan.
**Paywall:** giống IQ brief (trial plan có renewal hiện rõ, ô consent không tick sẵn, one-time report thay thế).
**Khác biệt:** 40 câu thay 90 (ít bỏ dở), trait % thay vì nhãn cứng; không lặp bẫy $1→$39.95 ẩn.
**Rủi ro:** không dùng thương hiệu "MBTI®" (trademark) — gọi "16-type personality test".

- [ ] Thực hiện FBP Steps 1–10.

### Task 4: Calmio — Overthinking at night ★

**Folder:** `funnel/funnel-development/mental-health/calmio-overthinking/` · **Archetype:** personalization-quiz (biến thể Calmio) · **Reuse:** `mental-health/calmio/funnel-content.md` (Need-help link, expectations screen, palette sage/lavender, flower motif)
**Research:** `calmio.md` §1-3 (Innerflo 44 màn, healthhorizon advertorial, Calm calm-cbe69 31 màn), `gaps.md` §2
**Spine (~22 màn):** hook "Mind loud at 2 a.m.?" → age 18+ → expectations "companion, not therapist" → khi nào xảy ra → 4 câu Likert ("As soon as it's quiet, I can't escape my thoughts") → chủ đề hay lặp (work / relationships / health / money / ✏️) → ảnh hưởng ngày hôm sau → đã thử gì → giờ đi ngủ → tên → loader → "night-mind profile" (kiểu: replayer / planner / worrier) → email → first 3-minute wind-down chat preview → paywall → offer → first conversation.
**Result:** profile kiểu overthinking + kế hoạch 4 tuần "evening unload" (journaling prompt + chat 10 phút).
**Paywall:** subscription programme như Calmio gốc; không "-60%" so với giá ảo.
**Khác biệt:** đối thủ chỉ có advertorial → app funnel đầu tiên; demo chat thật trước paywall.
**Rủi ro:** không gọi là insomnia treatment; không hỏi về thuốc ngủ; crisis link mọi màn.

- [ ] Thực hiện FBP Steps 1–10.

### Task 5: EWA — English for Spanish/Portuguese speakers ★

**Folder:** `funnel/funnel-development/learning/ewa-latam/` · **Archetype:** learning-plan · **Reuse:** `learning/ewa/funnel-content.md`
**Research:** `ewa-ayahpath.md` §4 (Praktika 1,234 ads, multilingual funnel hỏi native language bước 2; Master English, Learna AI)
**Spine (~22 màn), copy bằng tiếng Tây Ban Nha (ES-MX) với biến thể PT-BR ghi trong Notes:** hook "Inglés sin miedo" → native language (ES / PT) → mục tiêu (trabajo, viajes, series, hijos) → level tự đánh giá → khó khăn (false friends, pronunciation, listening) → word check 2 lưới (chọn từ biết) → 1 câu phụ đề phim đố nghĩa → phút/ngày → deadline tuỳ chọn → email → kết quả vocab size + level → plan → paywall → offer.
**Result:** số từ ước lượng + level + plan có "false friends pack" cho người nói ES/PT.
**Paywall:** subscription; giá tiền địa phương dạng token `{{price_mxn}}` / `{{price_brl}}`.
**Khác biệt:** nội dung theo lỗi đặc thù ES/PT (false friends, âm "th"), không chỉ dịch UI.
**Rủi ro:** headline ≤6 từ áp dụng cho bản ES; lint chạy trên bản ES.

- [ ] Thực hiện FBP Steps 1–10.

### Task 6: EWA — Learn English through movies & series ★

**Folder:** `funnel/funnel-development/learning/ewa-movies/` · **Archetype:** learning-plan · **Reuse:** `learning/ewa/funnel-content.md`
**Research:** `ewa-ayahpath.md` §1 (page "Language with Movies & Series" → sweetboarding 82 màn, có màn "learn with characters from your favorite shows")
**Spine (~20 màn):** hook "Learn English from Friends" (tên series là token `{{show}}` từ ad) → series yêu thích (grid poster) → level → hiện xem với phụ đề gì → 2 clip-to-word-card demo (xem 1 câu, chạm từ lạ → flashcard) → word check → phút/ngày → email → kết quả level + "words you'd learn from {{show}}" → plan → paywall → offer.
**Result:** level + 20 từ/thành ngữ đầu tiên rút từ series đã chọn.
**Paywall:** subscription; không ribbon "SUMMER SALE -90%" thường trực.
**Khác biệt:** demo học từ clip thật ngay trong funnel (đối thủ chỉ nói).
**Rủi ro:** poster/tên series có bản quyền → dùng ảnh minh hoạ gen, tên series chỉ ở dạng text.

- [ ] Thực hiện FBP Steps 1–10.

### Task 7: MyGrowth — Swap doomscrolling for 5-minute lessons ★

**Folder:** `funnel/funnel-development/learning/mygrowth-scroll-swap/` · **Archetype:** learning-plan · **Reuse:** `learning/mygrowth/funnel-content.md` (palette, knowledge-check có feedback)
**Research:** `gaps.md` §5 (Headway 61 màn "Swap doomscrolling…", Deepstash 48 màn), `mygrowth.md` §5, §7-8 (Nibble "Replace scrolling with…")
**Spine (~22 màn):** hook "Swap 5 minutes of scrolling" → screen time hằng ngày → app nuốt thời gian nhất → cảm giác sau khi lướt → môn muốn thay (grid) → 2 câu đố có feedback ngay → thời điểm hay lướt (sáng / trưa / tối) → reminder slot → email → "scroll-to-learn swap" chart (giờ lấy lại/tuần) → plan → paywall → offer.
**Result:** số giờ lấy lại/tháng + plan 4 tuần gắn vào khung giờ hay lướt.
**Paywall:** subscription 3 gói; không giá gạch ảo.
**Khác biệt:** tính từ screen time user khai, không pseudo-science "dopamine detox".

- [ ] Thực hiện FBP Steps 1–10.

### Task 8: Nebula — Witch power / birth chart

**Folder:** `funnel/funnel-development/nebula/witch-power/` · **Archetype:** personalization-quiz · **Reuse:** `nebula/palm-reading/`
**Research:** `nebula-chai.md` §2 (Nebula witch-power 2,720 ads, 55 màn ~41 câu; Astroline witch/birth-chart, free Big 3 reveal + "accuracy meter")
**Spine (~24 màn):** hook "What's your witch power?" → 6 câu agree/disagree (intuition, dreams, déjà vu) → empath 2 câu → "witches in your family?" nhánh → 1 ambiguous-image test → DOB+time+place → loader + free Sun/Moon/Rising reveal → email → teaser "your power: Seer / Healer / …" → paywall → offer → reading.
**Result:** loại witch power + Big Three; khoá: ritual 30 ngày, moon-timed practice.
**Paywall:** subscription; không accuracy-meter tăng giả, không trial-chọn-giá.
**Khác biệt:** gộp birth chart thật (Big 3) làm aha miễn phí — thay cho brief `nebula/funnel-content.md` cũ (chưa demo); ghi Notes rằng brief cũ được thay thế.

- [ ] Thực hiện FBP Steps 1–10.

### Task 9: Chai — AI roleplay

**Folder:** `funnel/funnel-development/chat-ai-character/chai-roleplay/` · **Archetype:** companion-chat · **Reuse:** `chat-ai-character/chai-romance-stories/`, `chai-dream-girl/` (web paywall long-scroll)
**Research:** `nebula-chai.md` §5 (không có web funnel roleplay nào đang chạy; Whisper Stories 8,110 ads 33 màn; Honey scenario picker), `chai-candy.md`
**Spine (~18 màn):** hook "Step into any story" → 18+ gate → genre (fantasy, mystery, sci-fi, romance, horror) → vai của bạn (hero / rival / stranger / ✏️) → setting card chọn → nhân vật đồng hành (3 card) → tone (playful / dark / epic) → tên nhân vật bạn → loader → scene mở đầu 3 lượt chat thật (user chọn 1 trong 3 hành động) → cliffhanger → email → paywall → offer → tiếp tục scene.
**Result:** một scene đang chạy dở với nhân vật nhớ lựa chọn của user.
**Paywall:** subscription chat (tin nhắn/ngày free + fair-use) như các Chai brief khác.
**Khác biệt:** lane trống (đối thủ chỉ chạy app-install); SFW, không chỉ romance.
**Rủi ro:** không input explicit/taboo như Whisper; AI disclosure.

- [ ] Thực hiện FBP Steps 1–10.

### Task 10: Chai — Named character funnel

**Folder:** `funnel/funnel-development/chat-ai-character/chai-named-character/` · **Archetype:** companion-chat · **Reuse:** `chai-ai-boyfriend/`, `chai-dream-girl/`
**Research:** `chai-candy.md` (Candy AI: funnel theo từng nhân vật có tên, ~20 series), `nebula-chai.md` §6
**Spine (~16 màn), 1 template + 3 nhân vật mẫu trong Notes (vd. "Leo – the bookshop owner", "Mara – the starship captain", "Kai – the rival chef"):** hook = ảnh + tên + một câu hook của nhân vật `{{char_name}}` → 18+ gate → 3 lượt chat mở đầu do nhân vật nói trước (user chọn reply) → nhân vật hỏi tên user → 2 câu sở thích (nhân vật nhớ) → voice note mẫu → loader "{{char_name}} is writing back…" → email → paywall (hero là nhân vật) → offer → chat tiếp.
**Result:** cuộc chat đang dở + voice note đầu tiên.
**Paywall:** subscription chat chuẩn Chai.
**Khác biệt:** SFW (mọi capture Candy đều adult); nhân vật giữ trí nhớ từ funnel sang app.

- [ ] Thực hiện FBP Steps 1–10.

---

## Wave 2 — Ngách Nóng ở UT2/UT3

### Task 11: Coursiv — AI automation & freelancing

**Folder:** `funnel/funnel-development/learning/coursiv-ai-automation/` · **Archetype:** learning-plan · **Reuse:** `learning/coursiv-ai-simple/`, `coursiv-claude-cert/`
**Research:** `coursiv-coinin.md` §1 (Jobescape chat-v3 ~15k ads 39 màn — đã pivot sang Claude; Zenfy 4.8k ads 31 màn)
**Spine (~24 màn):** hook "Automate the boring half" → công việc hiện tại → việc lặp lại tốn giờ nhất (multi) → đã dùng AI tool nào → mục tiêu (save time / side income / freelance clients) → kỹ năng có sẵn → 60-giây micro-task thật trong funnel (chọn 1 việc → xem AI tạo workflow) → phút/ngày → tên → loader → "automation profile" + giờ tiết kiệm/tuần → email → plan 4 tuần + certificate → paywall → offer.
**Result:** output micro-task + số giờ ước tính tiết kiệm.
**Paywall:** chuẩn Coursiv (1-week / 4-week pre-selected / 12-week, renewal ở mọi thẻ).
**Khác biệt:** không hỏi income target $50k–$350k (Zenfy), không hứa thu nhập.
**Rủi ro:** Meta policy "get rich" — không claim thu nhập freelance.

- [ ] Thực hiện FBP Steps 1–10.

### Task 12: Testlibrary — Archetype test

**Folder:** `funnel/funnel-development/testlibrary/archetype/` · **Archetype:** assessment-unlock · **Reuse:** `testlibrary/funnel-content.md`, Task 3 brief
**Research:** `testlibrary.md` §3 (Impulse archetype = hook dẫn về brain-training), §7 (TestLibrary landing), `ewa-ayahpath.md` §7 (Prayers archetype)
**Spine (~16 màn):** landing "Which archetype leads you?" + disclosure → gender/age → 24 câu forced-choice giữa 2 hình ảnh/câu (4 checkpoint) → email → tên → loader → teaser: archetype chính (vd. Sage / Explorer / Creator) rõ, archetype phụ + shadow mờ → paywall → offer → full profile.
**Result:** 12-archetype wheel với % — chính, phụ, shadow; khoá: love, career, growth.
**Paywall:** như Task 3.
**Khác biệt:** test thật có kết quả thật (Impulse chỉ là hook giả).

- [ ] Thực hiện FBP Steps 1–10.

### Task 13: MyGrowth — Anatomy / human body

**Folder:** `funnel/funnel-development/learning/mygrowth-anatomy/` · **Archetype:** learning-plan · **Reuse:** `learning/mygrowth/`
**Research:** `mygrowth.md` §1 (MyGrowth anatomy-bau 31 màn, capture dừng ở email), §7 (Nibble biology 37 bước, offer + upsell)
**Spine (~22 màn):** hook "Know your body in 5 min" → lý do (curiosity / health / kids' questions / study) → level → 3 câu đố có feedback + fact ("Your body has 206 bones…") → hệ cơ quan muốn học (grid) → format (đọc / nghe / quiz) → giờ → email → course match "Body Systems 101" + plan graph → paywall → offer.
**Result:** điểm quiz + course match + lịch 4 tuần.
**Paywall:** chuẩn MyGrowth đã sửa (không timer reset, plan name khớp kỳ hạn).
**Rủi ro:** giáo dục phổ thông, không lời khuyên y tế.

- [ ] Thực hiện FBP Steps 1–10.

### Task 14: MyGrowth — Charisma / small talk

**Folder:** `funnel/funnel-development/learning/mygrowth-charisma/` · **Archetype:** learning-plan · **Reuse:** `learning/mygrowth/`
**Research:** `mygrowth.md` §2 (MyGrowth communication 29 màn), §3 (RiseGuide buildcharisma 33 màn), §4 (Smartyme small talk 45 màn)
**Spine (~22 màn):** hook "Never run out of words" → tình huống khó (party, work, dates, calls) → điều xảy ra (blank mind, awkward silence) → 3 tình huống giả lập chọn câu trả lời, có feedback → mục tiêu → phút/ngày → tên → loader → "conversation style" (vd. Listener / Storyteller) + 3 kỹ năng cần → email → plan → paywall → offer.
**Result:** style + plan 4 tuần với "script cards".
**Khác biệt:** luyện bằng tình huống thật ngay trong funnel.

- [ ] Thực hiện FBP Steps 1–10.

### Task 15: MyGrowth — Engineering / electricity mindset

**Folder:** `funnel/funnel-development/learning/mygrowth-engineering/` · **Archetype:** learning-plan · **Reuse:** `learning/mygrowth/`
**Research:** `mygrowth.md` §4 (Smartyme engineering 47/48 màn + electricity, có paywall + upsell đầy đủ)
**Spine (~22 màn):** hook "Think like an engineer" → lý do (DIY home, career, kids, curiosity) → level → 3 câu đố trực quan (mạch đèn nào sáng?) có feedback → chủ đề (electricity, mechanics, structures) → giờ → email → course match + plan → paywall → offer.
**Result:** điểm + course match "How Things Work".
**Rủi ro:** không hướng dẫn sửa điện thật — thêm safety line ở course electricity.

- [ ] Thực hiện FBP Steps 1–10.

### Task 16: Calmio — Stress / cortisol

**Folder:** `funnel/funnel-development/mental-health/calmio-stress/` · **Archetype:** personalization-quiz (Calmio) · **Reuse:** `mental-health/calmio/`
**Research:** `calmio.md` §9 (Formula cortisol — thực chất diet), §10 (BB Fasting advertorial, nữ 45+), §4 (Liven "Cortisol detox 35+")
**Spine (~22 màn):** hook "Always on, never calm?" → 18+ → expectations → nguồn stress (multi) → biểu hiện (sleep, tension, irritability, cravings) → 4 Likert → nhịp ngày → đã thử gì → tên → loader → "stress pattern" (vd. Sprinter / Carrier / Juggler) → email → 2-phút reset chat preview → paywall → offer.
**Result:** stress pattern + plan 4 tuần (micro-reset + chat).
**Khác biệt:** không đi đường diet/“cortisol belly”; không claim hạ cortisol.
**Rủi ro:** health claims; không đo/hứa chỉ số sinh học.

- [ ] Thực hiện FBP Steps 1–10.

### Task 17: Calmio — AI life planner for the overwhelmed

**Folder:** `funnel/funnel-development/mental-health/calmio-life-planner/` · **Archetype:** personalization-quiz (Calmio) · **Reuse:** `mental-health/calmio/`
**Research:** `calmio.md` §6-7 (Chillio house-ai 37/54 màn, life-ai-assistant 46 màn), `gaps.md` §4
**Spine (~22 màn):** hook "Too much on your plate?" → 18+ → các mảng quá tải (work, home, family, money, health) → đang bỏ dở gì → giờ rảnh thật → cách bạn hay trì hoãn → tên → loader → "overwhelm profile" + "this week, 3 things" → email → chat demo: Calmio chia 1 việc lớn thành bước nhỏ → paywall → offer.
**Result:** danh sách 3 việc tuần này + profile.
**Khác biệt:** không scratch-card giảm giá định sẵn, không timer 10 phút, không persona PhD.

- [ ] Thực hiện FBP Steps 1–10.

### Task 18: EWA — Speaking practice with AI

**Folder:** `funnel/funnel-development/learning/ewa-speak-ai/` · **Archetype:** learning-plan · **Reuse:** `learning/ewa/`
**Research:** `ewa-ayahpath.md` §3 (Lola Speak 1,273 ads 62 màn, CEFR + "Lexical Access Score"; Jumpspeak 1,264 ads 30 màn, fear-of-speaking)
**Spine (~22 màn):** hook "Speak English out loud" → nỗi sợ khi nói (multi) → tình huống cần nói → level → mini test: 1 câu nói vào mic (fallback gõ nếu từ chối mic) → AI feedback phát âm mẫu → chọn AI tutor (3 avatar) → phút/ngày → email → CEFR level + plan → paywall → offer.
**Result:** level + 1 nhận xét phát âm cụ thể + plan.
**Khác biệt:** feedback thật trước paywall; không lifetime "€229 (was €459)", không scratch card.
**Rủi ro:** quyền mic — có đường bỏ qua; tính năng AI tutor của EWA cần xác minh (ghi Notes).

- [ ] Thực hiện FBP Steps 1–10.

### Task 19: Testlibrary — Autism traits self-check

**Folder:** `funnel/funnel-development/testlibrary/autism-traits/` · **Archetype:** assessment-unlock · **Reuse:** `testlibrary/funnel-content.md` (đoạn ADHD/autism: "not a diagnosis" ở màn 1, 14 + support link)
**Research:** `testlibrary.md` §6 (Testora IQ & Autism 46 màn), §7, `testlibrary-captures.md` §1
**Spine (~16 màn):** landing "Adult autism traits self-check" + "not a diagnosis" → age band → 30 câu Likert (AQ-style, 3 checkpoint, không flattery) → email → loader → teaser: trait profile 5 trục (social, sensory, routine, detail, communication) 1 trục rõ → paywall → offer → report + "how to talk to a professional".
**Result:** profile trait, không nhãn chẩn đoán.
**Rủi ro (cao):** Meta health policy, ad copy không "Are you autistic?"; reviewer phải đọc lại toàn bộ copy.

- [ ] Thực hiện FBP Steps 1–10.

### Task 20: Calmio — Sleep / insomnia sound therapy

**Folder:** `funnel/funnel-development/mental-health/calmio-sleep/` · **Archetype:** personalization-quiz (Calmio) · **Reuse:** `mental-health/calmio/`, Task 4 brief (tránh trùng câu hỏi)
**Research:** `calmio.md` §1-2 (Innerflo sleepcards 44 màn, 1,303 ads; healthhorizon advertorial 40 màn)
**Spine (~22 màn):** hook "Fall asleep without fighting" → 18+ → expectations → vấn đề (falling / staying / waking early) → tần suất → thời gian để ngủ → 3 Likert → âm thanh thích (rain, brown noise, voice, binaural) → giờ ngủ → tên → loader → "sleep profile" → email → nghe thử 30 giây soundscape → paywall → offer.
**Result:** sleep profile + soundscape cá nhân + plan 4 tuần.
**Khác biệt:** không hỏi/khuyên về thuốc ngủ, không "93% improved", không expert giả.
**Rủi ro:** "not intended to diagnose or treat"; crisis link.

- [ ] Thực hiện FBP Steps 1–10.

### Task 21: CoinIn — Collector persona web funnel (core coin)

**Folder:** `funnel/funnel-development/scanner/coinin-collector/` · **Archetype:** scanner-identifier (biến thể web) · **Reuse:** `scanner/coinin/funnel-content.md` (bản in-app; palette charcoal + antique gold)
**Research:** `coursiv-coinin.md` base (funnel.coininapp.com 20 màn) + §3 (The Wisest Collector, ~25 persona pages)
**Spine (~20 màn), persona host "Edward, 40 years collecting":** hook persona "Grandpa's coin jar?" → có coin từ đâu (inherited / found / collecting) → số lượng → loại (US cents, quarters, foreign, silver) → 2 game "guess the value" có đáp án thật → quét 1 coin (upload 2 mặt, có fallback chọn ảnh mẫu) → ID card miễn phí → collector level badge → email → paywall (giá trị theo grade, error check, collection value) → offer.
**Result:** ID card coin thật + badge cấp độ.
**Khác biệt:** cá nhân hoá trước paywall (funnel gốc không có kết quả nào); persona dẫn suốt luồng.
**Rủi ro:** không "become rich", không số tiền testimonial; giá trị luôn là "estimate".

- [ ] Thực hiện FBP Steps 1–10.

### Task 22: CoinIn — Trading cards (Pokémon, sports)

**Folder:** `funnel/funnel-development/scanner/coinin-cards/` · **Archetype:** scanner-identifier · **Reuse:** Task 21 brief
**Research:** `coursiv-coinin.md` §5 (chưa có web funnel; Ludex, Collectr scan-first)
**Spine (~18 màn):** hook "Which cards are worth grading?" → game (Pokémon / sports / MTG / ✏️) → thời kỳ → số lượng thẻ → 1 game "guess the PSA 10 price" → scan 1 thẻ → ID + raw value range miễn phí → teaser "grade potential" → email → paywall → offer.
**Result:** ID thẻ + khoảng giá raw; khoá: grade potential, top cards to grade, collection value.
**Khác biệt:** web quiz đầu tiên trong category; nhánh "sports-card dad" nostalgia.
**Rủi ro:** tên Pokémon/PSA là trademark — dùng dạng text mô tả, ảnh thẻ gen chung.

- [ ] Thực hiện FBP Steps 1–10.

---

## Wave 3 — Ngách Tăng / Trống

### Task 23: CoinIn — Antique appraisal

**Folder:** `funnel/funnel-development/scanner/coinin-antique/` · **Archetype:** scanner-identifier · **Reuse:** Task 21
**Research:** `coursiv-coinin.md` §4 (không có web funnel; Antique Identifier, Vintiq)
**Spine (~18 màn):** hook "Don't sell grandma's vase for $5" → loại đồ → nguồn gốc (inherited / attic / flea market / estate clearing) → có maker's mark? → 1 game giá đấu giá thật → upload ảnh → ID card (era, style, material) miễn phí → email → paywall (value range, where to sell, real-or-repro) → offer.
**Khác biệt:** góc thừa kế / dọn nhà chưa ai làm.

- [ ] Thực hiện FBP Steps 1–10.

### Task 24: CoinIn — Banknotes, stamps & gems (multi-object)

**Folder:** `funnel/funnel-development/scanner/coinin-notes-stamps-gems/` · **Archetype:** scanner-identifier · **Reuse:** Task 21
**Research:** `coursiv-coinin.md` §6 (CoinIn đã test "Coin&Note Scanner", "Crystal Collector"; NoteScan, Rock Identifier)
**Spine (~18 màn):** hook "Real, rare, or nothing?" → object picker (banknote / stamp / gem) → nhánh 2 câu riêng mỗi loại + 1 game (error note / Inverted Jenny / sapphire vs glass) → upload → ID miễn phí → email → paywall (real-or-fake + value range) → offer.
**Khác biệt:** một funnel ba nhánh thay ba funnel nhỏ (ngách nhỏ, search phẳng).

- [ ] Thực hiện FBP Steps 1–10.

### Task 25: EWA — Books & audiobooks

**Folder:** `funnel/funnel-development/learning/ewa-books/` · **Archetype:** learning-plan · **Reuse:** `learning/ewa/`
**Research:** `ewa-ayahpath.md` §2 (EWA red369 105 ads 55 màn: echo screen sau mỗi câu, 5 "is this true for you?" + feature card)
**Spine (~20 màn):** hook "Read real books in English" → thể loại yêu thích → level → đọc hay nghe → 1 đoạn adapted text có từ chạm-dịch → 3 "is this true for you?" + feature card → phút/ngày → email → level + "your first 3 books" → plan → paywall → offer.
**Result:** level + 3 sách adapted phù hợp.

- [ ] Thực hiện FBP Steps 1–10.

### Task 26: Testlibrary — Brain health / memory check

**Folder:** `funnel/funnel-development/testlibrary/brain-memory/` · **Archetype:** assessment-unlock · **Reuse:** `testlibrary/funnel-content.md`
**Research:** `testlibrary.md` §5 (memoryOS 34 màn), §3 (Impulse brain training 31 màn)
**Spine (~16 màn):** landing "How sharp is your memory?" + disclosure → age band → 5 mini-game (word recall, digit span, pattern, reaction, faces) có checkpoint → email → loader → teaser: điểm tổng + 1 domain rõ → paywall → offer → report + training plan.
**Rủi ro:** không ám chỉ dementia/chẩn đoán; "for curiosity and training".

- [ ] Thực hiện FBP Steps 1–10.

### Task 27: Testlibrary — Adult ADHD traits self-check

**Folder:** `funnel/funnel-development/testlibrary/adhd-traits/` · **Archetype:** assessment-unlock · **Reuse:** Task 19 brief
**Research:** `gaps.md` §1 (testlibrary.com/adhd-test 1,155 ads; chỉ landing verified, phần sau inferred)
**Spine (~16 màn):** landing "Adult ADHD traits self-check" + "not a diagnosis" → age band → 18 câu tần suất (ASRS-style, 2 checkpoint) → email → loader → teaser: 3 trục (attention, impulsivity, restlessness) 1 trục rõ → paywall → offer → report + strategies + "talking to a professional".
**Rủi ro (cao):** như Task 19; phần flow inferred phải ghi "unverified".

- [ ] Thực hiện FBP Steps 1–10.

### Task 28: MyGrowth — Genealogy / heritage

**Folder:** `funnel/funnel-development/learning/mygrowth-genealogy/` · **Archetype:** learning-plan · **Reuse:** `learning/mygrowth/`
**Research:** `mygrowth.md` §6 (Nibble genealogy 28 màn, 887 ads, có face scan; paywall chưa capture)
**Spine (~20 màn):** hook "Where does your family come from?" → muốn khám phá gì (origins, traditions, ancestor lands) → biết gì về ông bà → quốc gia nghi ngờ (multi) → 2 câu đố lịch sử di cư có feedback → giờ → email → course match "Your Heritage Path" + plan → paywall → offer.
**Khác biệt:** KHÔNG face-scan "ethnicity %" (không chính xác + nhạy cảm sinh trắc); bán khoá học lịch sử, không bán kết quả DNA giả.
**Rủi ro:** Meta policy thuộc tính chủng tộc — không suy đoán sắc tộc từ ảnh.

- [ ] Thực hiện FBP Steps 1–10.

### Task 29: Calmio — Calm kids (for parents)

**Folder:** `funnel/funnel-development/mental-health/calmio-calm-kids/` · **Archetype:** personalization-quiz (Calmio) · **Reuse:** `mental-health/calmio/`
**Research:** sheet (Leaply "Steady Mind: Calm & Connected Kids"); `calmio.md` GAP — capture Leaply là funnel khác → flow inferred, ghi "unverified".
**Spine (~20 màn):** hook "Calmer evenings with your kid" → tuổi con → tình huống (meltdowns, bedtime, homework, screens) → tần suất → phụ huynh hiện phản ứng thế nào → điều đã thử → tên con (token `{{child_name}}`) → loader → "calm plan for {{child_name}}" + 1 script cho tình huống chính → email → paywall → offer.
**Rủi ro:** user là phụ huynh 18+, không thu dữ liệu của trẻ ngoài tên/tuổi; không claim điều trị hành vi.

- [ ] Thực hiện FBP Steps 1–10.

### Task 30: Calmio — Hypnosis (drink less / quit smoking / weight)

**Folder:** `funnel/funnel-development/mental-health/calmio-hypnosis/` · **Archetype:** personalization-quiz (Calmio) · **Reuse:** `mental-health/calmio/` (đã có programme Alcohol, Smoking)
**Research:** `calmio.md` §8 (Hypnozio landing-alc 29 màn)
**Spine (~22 màn):** hook "Change a habit while relaxed" → 18+ → mục tiêu (drink less / quit smoking / eat calmer) → nhánh 3 câu riêng → động lực → đã thử → giờ nghe → tên → loader → "habit profile" → email → nghe thử 60 giây session → paywall → offer.
**Rủi ro:** không hứa kết quả cai nghiện/giảm cân; với rượu nặng hiển thị khuyến nghị gặp chuyên gia.

- [ ] Thực hiện FBP Steps 1–10.

### Task 31: Calmio — Nervous system regulation

**Folder:** `funnel/funnel-development/mental-health/calmio-nervous-system/` · **Archetype:** personalization-quiz (Calmio) · **Reuse:** `mental-health/calmio/`
**Research:** `gaps.md` §3 (HarmonyApps không có funnel; mẫu: Liven Neurobalance, Settle, NEUROFIT — inferred)
**Spine (~22 màn):** hook "Stuck in fight-or-flight?" → 18+ → expectations → 6 câu dấu hiệu → khi nào nặng nhất → "your state now" (wired / shut down / mixed) → điều giúp được → tên → loader → "regulation profile" + 1 bài thở 60 giây chạy được → email → paywall → offer.
**Rủi ro:** không claim vagus nerve/trauma healing; flow inferred → ghi "unverified".

- [ ] Thực hiện FBP Steps 1–10.

### Task 32: AyahPath — Islamic finance / halal money

**Folder:** `funnel/funnel-development/learning/ayahpath-halal-finance/` · **Archetype:** learning-plan · **Reuse:** `learning/ayahpath/`
**Research:** `ewa-ayahpath.md` §6 (AyahPath ap_finance 1,627 ads 33 màn, "30 Days Rizq Challenge")
**Spine (~22 màn):** hook "30 days of Rizq" → tình hình (debt, saving, halal income doubts) → 2 ayah card về tài sản → 3 câu thói quen tiền → mục tiêu → phút/ngày + giờ gắn salah → email → plan "Quran Study for Mindful Wealth" + chart now vs 4 tuần → paywall → offer.
**Khác biệt:** giữ thử thách 30 ngày nhưng bỏ "cancel by email only", bỏ "-90% promo", renewal rõ.
**Rủi ro:** không lời khuyên tài chính cụ thể; nội dung tôn giáo cần reviewer am hiểu duyệt.

- [ ] Thực hiện FBP Steps 1–10.

### Task 33: AyahPath — Learn Quranic Arabic

**Folder:** `funnel/funnel-development/learning/ayahpath-arabic/` · **Archetype:** learning-plan · **Reuse:** `learning/ayahpath/`
**Research:** `ewa-ayahpath.md` §9 (không có web funnel; Kalaam placement test "% Quran you understand")
**Spine (~20 màn):** hook "Understand what you recite" → đọc được chữ Arabic chưa → mục tiêu → mini test nhận diện 6 từ hay gặp → kết quả "% words of Al-Fatiha you know" → phút/ngày → email → plan → paywall → offer.
**Khác biệt:** lane trống; % hiểu Quran là aha mạnh và thật.

- [ ] Thực hiện FBP Steps 1–10.

### Task 34: Coursiv — AI for career change

**Folder:** `funnel/funnel-development/learning/coursiv-ai-career/` · **Archetype:** learning-plan · **Reuse:** `learning/coursiv-ai-simple/`
**Research:** `coursiv-coinin.md` §2 (Shift 938 ads 42 màn; Zenfy)
**Spine (~24 màn):** hook "Switch careers with AI skills" → nghề hiện tại → nghề muốn chuyển → life event (career break, relocation, parenting) → kỹ năng có sẵn → AI skill gap map → portfolio project gợi ý → phút/ngày → tên → loader → "career-switch plan" + "not a guarantee" → email → paywall → offer.
**Khác biệt:** map kỹ năng AI theo nghề đích + 1 portfolio project; không timer 10 phút, không hứa 1:1 coaching.

- [ ] Thực hiện FBP Steps 1–10.

---

## Wave 4 — Ngách Giảm / Bão hoà (làm sau cùng, có thể cắt)

### Task 35: Nebula — Past life

**Folder:** `funnel/funnel-development/nebula/past-life/` · **Archetype:** personalization-quiz · **Reuse:** `nebula/palm-reading/`
**Research:** `nebula-chai.md` §3 (Astroline pastlife 876 ads 26 màn; Nebula past-life 3,918 ads/7 tháng 49 màn)
**Spine (~22 màn):** hook "Who were you before?" → era resonates (Ancient → 1900s) → déjà vu / recurring dreams → nơi thấy quen → 3 câu agree/disagree → DOB → loader → teaser "past-life era + role" → email → paywall → offer.
**Khác biệt:** không "decoding progress %" kéo dài giả.

- [ ] Thực hiện FBP Steps 1–10.

### Task 36: Nebula — Aura / tarot

**Folder:** `funnel/funnel-development/nebula/aura-tarot/` · **Archetype:** personalization-quiz · **Reuse:** `nebula/palm-reading/`
**Research:** `nebula-chai.md` §4 (Nebula aura 3,162 ads 53 màn, reveal "aura Indigo" + palm breakdown free; upsell bundle report)
**Spine (~22 màn):** hook "What color is your aura?" → 6 câu cảm nhận/năng lượng → màu bị hút → DOB → loader → free aura color reveal → 3-card tarot kéo thật (user chạm) → email → paywall → offer.
**Khác biệt:** tarot pull tương tác làm aha thứ hai; không A/B "no charge yet".

- [ ] Thực hiện FBP Steps 1–10.

### Task 37: Chai — Short drama series

**Folder:** `funnel/funnel-development/chat-ai-character/chai-short-drama/` · **Archetype:** companion-chat (biến thể episode-unlock) · **Reuse:** Task 10 brief
**Research:** `nebula-chai.md` §6, `chai-candy.md` (Candy AI holly-donovan 31 màn: EP1-2 autoplay, EP3 khoá)
**Spine (~12 màn):** 18+ gate → EP1 (ảnh tĩnh + text/voice dạng vertical story) → EP2 → cliffhanger → "Chat with {{char_name}} now" 2 lượt → EP3 locked → email → paywall → offer → EP3 + chat.
**Khác biệt:** nhân vật nhớ nội dung tập vừa xem (Candy không); SFW, tiêu đề không taboo.
**Ghi chú:** sheet đánh dấu Giảm (CandyShorts đã dừng) — làm cuối, có thể cắt.

- [ ] Thực hiện FBP Steps 1–10.

### Task 38: Calmio — Self-discovery via persona

**Folder:** `funnel/funnel-development/mental-health/calmio-self-discovery/` · **Archetype:** personalization-quiz (Calmio) · **Reuse:** `mental-health/calmio/`
**Research:** `calmio.md` §4 (Liven Neurobalance 37 màn; 368K ads — bão hoà)
**Spine (~22 màn), persona host (nhân vật hư cấu, ghi rõ "illustrative guide"):** hook persona "I used to people-please too" → 18+ → 8 Likert (people-pleasing, inner critic, boundaries) → điều muốn đổi → tên → loader → "inner pattern profile" → email → chat preview → paywall → offer.
**Rủi ro:** persona không được giả làm chuyên gia/PhD.

- [ ] Thực hiện FBP Steps 1–10.

### Task 39: Calmio — Burnout

**Folder:** `funnel/funnel-development/mental-health/calmio-burnout/` · **Archetype:** personalization-quiz (Calmio) · **Reuse:** `mental-health/calmio/`, Task 16 (tránh trùng)
**Research:** `gaps.md` §4 (Chillio house-ai 54 màn; Liven "Anti-burnout 35+"), `calmio.md` §3, §11
**Spine (~22 màn):** hook "Running on empty?" → 18+ → expectations → 3 trục (exhaustion, cynicism, efficacy) × 3 Likert → nguồn → đã nghỉ chưa → tên → loader → "burnout stage" + 1 boundary script → email → paywall → offer.
**Rủi ro:** không gọi là chẩn đoán; crisis link.

- [ ] Thực hiện FBP Steps 1–10.

### Task 40: Testlibrary — Trauma & narcissism patterns

**Folder:** `funnel/funnel-development/testlibrary/relationship-patterns/` · **Archetype:** assessment-unlock · **Reuse:** Task 19 brief
**Research:** `testlibrary.md` §4 (Impulse trauma = hook), §8 (Breeze childhood trauma 38 màn)
**Spine (~16 màn):** landing "Spot your relationship patterns" + disclosure → age → 24 Likert (attachment, boundaries, people with narcissistic traits quanh bạn) → email → loader → teaser pattern profile → paywall → offer → report + support resources.
**Rủi ro (cao):** không chẩn đoán trauma/NPD người khác; reframe "patterns", support link.

- [ ] Thực hiện FBP Steps 1–10.

### Task 41: MyGrowth — Book summaries / key insights

**Folder:** `funnel/funnel-development/learning/mygrowth-book-summaries/` · **Archetype:** learning-plan · **Reuse:** `learning/mygrowth/`
**Research:** `mygrowth.md` §5 (Headway 41/61 màn, 77K ads — bão hoà)
**Spine (~20 màn):** hook "One big idea a day" → chủ đề → sách gần nhất đọc xong → đọc hay nghe → chọn 3 sách quan tâm → 1 insight mẫu 60 giây → giờ → email → reading plan → paywall → offer.
**Ghi chú:** bão hoà — làm nếu MyGrowth thật sự có thư viện tóm tắt (xác minh trước, ghi Notes).

- [ ] Thực hiện FBP Steps 1–10.

### Task 42: EWA — English for travel & work

**Folder:** `funnel/funnel-development/learning/ewa-travel-work/` · **Archetype:** learning-plan · **Reuse:** `learning/ewa/`
**Research:** `ewa-ayahpath.md` §5 (không có funnel riêng; Praktika "upcoming event?")
**Spine (~20 màn), deadline-led:** hook "Ready before your trip?" → sự kiện (trip, interview, new job, meeting) → ngày diễn ra → level → 3 câu tình huống → phút/ngày → email → "ready by {{date}}" plan → paywall (gợi ý gói ngắn) → offer.

- [ ] Thực hiện FBP Steps 1–10.

### Task 43: CoinIn — Plant ID & care

**Folder:** `funnel/funnel-development/scanner/coinin-plant/` · **Archetype:** scanner-identifier · **Reuse:** Task 21
**Research:** `coursiv-coinin.md` §7 (PlantIn 14 màn, careguide pre-lander; CoinIn/PlantIn cùng template)
**Spine (~16 màn):** hook "Why is my plant dying?" → plant nào → triệu chứng → ánh sáng/tưới → upload ảnh → chẩn đoán + care plan 7 ngày miễn phí một phần → email → paywall → offer.
**Ghi chú:** sheet Giảm; xác nhận với user có thuộc CoinIn app không trước khi làm (có thể là app khác).

- [ ] Thực hiện FBP Steps 1–10.

### Task 44: Ngách cần quyết định trước (không build)

**Files:** Modify: plan này (ghi quyết định)

- [ ] **Step 1:** Hỏi user: "Christian prayer / life reset" và "Bible study / audio Bible" được xếp dưới AyahPath (app Quran) — làm cho app nào? Nếu có app Christian riêng → thêm Task 44a/44b theo `ewa-ayahpath.md` §7-8 (Prayers Academy, BibleChat/verseread 2 câu hỏi + giá trên màn 1). Nếu không → bỏ.
- [ ] **Step 2:** Xác nhận "Lịch sử, nghệ thuật, sinh học" (MyGrowth, Giảm) đã được funnel chung `learning/mygrowth/` phủ → không làm riêng.
- [ ] **Step 3:** Ghi quyết định vào plan, commit `docs: record niche decisions`.

---

## Task 45: Export FunnelFox theo app

**Files:**
- Create: `<folder>/build.py` cho mỗi funnel đã xong (copy `nebula/palm-reading/build.py`, đổi tên file export)
- Create: `funnel/funnelfox-upload-<YYYY-MM-DD>/<app>/<app>-<niche>.html`
- Create: `funnel/funnelfox-upload-<YYYY-MM-DD>/README.md`

- [ ] **Step 1:** Với mỗi folder đã xong, tạo `build.py` từ mẫu palm-reading: đổi `EXPORT` thành `funnelfox-export/<app>-<niche>.html`, giữ cơ chế `/*IMG-START*/…/*IMG-END*/`. Đảm bảo demo có marker đó (nếu demo dùng `<img src="img/…">` trực tiếp, chuyển sang map `IMG` như palm-reading).
- [ ] **Step 2:** Run `python3 <folder>/build.py` → Expected: `N images embedded -> funnel.html (…KB)`.
- [ ] **Step 3:** Copy `funnel.html` vào `funnel/funnelfox-upload-<date>/<app>/<app>-<niche>.html`.
- [ ] **Step 4:** Smoke từng file export (không có folder img bên cạnh): `node funnel/tools/smoke_demo.mjs funnel/funnelfox-upload-<date>/<app>/<file>.html <screens>` → Expected `OK`.
- [ ] **Step 5:** Viết README theo mẫu `funnelfox-upload-2026-10-01/README.md`: bảng file/app/số màn/kích thước, danh sách placeholder phải điền (giá, checkoutUrl, `CONFIG.offer`, link Terms/Privacy/app) chung + riêng từng funnel.
- [ ] **Step 6:** Commit `feat(funnel): funnelfox export for <apps>`.

## Task 46: Cập nhật sheet "Reference funnel" (cần user đồng ý)

- [ ] **Step 1:** Soạn bảng app → ngách → link Artifact demo (từ Notes của mỗi brief) và đưa user xem trong chat.
- [ ] **Step 2:** Chỉ khi user đồng ý: ghi vào cột "Reference funnel" / tab "Trang tính1" của sheet bằng skill `anthropic-skills:google-workspace`. Không tự ghi.

---

## Thứ tự & song song

| Wave | Tasks | Ghi chú |
|---|---|---|
| 0 | Task 0 | Bắt buộc trước mọi task khác |
| 1 | 1–10 | Ưu tiên: ★ có trong plan + UT1 |
| 2 | 11–22 | Nóng ở UT2/UT3 |
| 3 | 23–34 | Tăng/Trống |
| 4 | 35–43 | Giảm/Bão hoà — cắt được |
| — | 44 | Hỏi user, có thể làm song song wave 1 |
| cuối | 45, 46 | Sau mỗi wave có thể export từng đợt |

Trong cùng một wave, các task khác app chạy song song được. Các task cùng app có trường `Reuse:` trỏ tới nhau (vd. 19→27→40, 21→22/23/24/43, 4→20, 16→39) thì chạy tuần tự theo thứ tự đó.

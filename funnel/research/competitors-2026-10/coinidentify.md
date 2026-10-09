# CoinIdentify — đối thủ & luồng funnel (FunnelFox Radar, 2026-10-08)

Project FunnelFox: CoinIdentify: Coin Scanner (`01M3RA21KT26EDYYGD36DFHHRK`) — chưa có product context (điền tại https://app.funnelfox.com/coin-identify/context). Phạm vi: nhận diện + định giá coin, kèm antique, cards, banknotes, stamps, gems.

> **Radar không có walk từng màn hình cho funnel nào.** Chỉ có URL, vài lần bắt giá paywall của CoinIn và ad copy — không đoán màn.

## 1. CoinIn (coininapp.com) — đối thủ coin duy nhất có dữ liệu
Dormant (last seen 07/2026), 81 funnels; không funnel nào có screen, 3 funnel có paywall capture. Mọi page FB coin Radar thấy ("Coin AI Identifier", "Coin App – Value, Identification, Collection", "Coin&Note Scanner", "CoinscanAi", các page CoinIn) đều chạy ads của CoinIn.

**Cách chia traffic qua URL** (`quiz.coininapp.com/…`): theo giới tính (`coin-cio-fin-man-blbc`, `coin-cio-fin-woman-blbc`), góc lịch sử (`coin-cio-history`), mùa vụ (`coin-cio-easter`, `coin-cio-black` / `blackcoinin-…`), theo nước (de, it, es, au, uk-ind, af), test subscription (`sub-cio-c`, `sub-cio-c-v-4`). Trang web2app: `https://info.coininapp.com/landing/w2a/dynamic/white/white`.

**Paywall capture** (Solidgate nếu có):
- `https://funnel.coininapp.com/coin-cio-vlack-bc-dp`: $39.99, $12.99, $1.07, $19.99, $0.67, $99.99, $79.99, $0.27 → có vẻ 3 plan, mỗi plan giá gạch + giá hiện tại + giá/ngày (suy từ số, chưa thấy ảnh).
- `https://funnel.coininapp.com/coin-cio-black`: $12.99, $39.99, $14.99, $59.99, $25.
- `https://coininapp.com`: $12.99, $39.99, $19.99, $79.99, $99.99.
- `https://funnel.coininapp.com/blackcoinin-cio-t-10-2-w-26-de-black-bc-3d`: chỉ "$12,000" — có lẽ là giá trị coin hiển thị, không phải giá plan.
- Có screenshot nhưng không xem được → chưa xác nhận trial, timer, guarantee.

**Ads**: video kể chuyện ngôi thứ nhất, CTA "Learn more"; headline "Take a Quiz Now!" hoặc "Try scanning your coins!". Mạch truyện: thừa kế thú sưu tầm, hộp coin không biết giá → nghĩ bán phức tạp → thử app → biết coin nào phổ thông, coin nào có cầu → bán vài đồng → tự tin hơn.

## 2. RockIn (rockinapp.com) — có vẻ cùng publisher với CoinIn
Nhận diện đá/khoáng, cùng cấu trúc URL. Dormant. `https://quiz.rockinapp.com` (never measured), `https://ios.rockinapp.com/landing/w2a/dynamic/white/white`. Không có screen.

## 3. Coin Identifier (coin-identifier.com)
Seed trong Radar nhưng never measured: không funnel, không ads.

## 4. App scan-định-giá liền kề (active 09/2026; không có screen/paywall)
- **CollX** `https://collx.app` — "Snap a photo of your cards and get the value in seconds"; co-promote giảm giá grading PSA (`https://psacard.com/collx`).
- **Market Movers** `https://marketmoversapp.com/social` — "Track your collection's value… smarter buying and selling".
- **Collectr** `https://app.getcollectr.com`.

## 5. PictureThis (plant ID, cùng mô hình snap-and-identify) — funnel duy nhất được walk
SEO website, không phải quiz: (1) homepage "Instantly identify plants with a snap" + review/download count + "4 reasons" → (2) trang upload ảnh nhận diện miễn phí → (3) rất nhiều trang bài viết loài, mỗi trang CTA "Download the App for Free". `https://picturethisai.com`

## Pattern chung
- **Giá trị/tiền trước, nhận diện sau** — "is my drawer of coins worth money?".
- **Quiz trước paywall, chia theo persona và dịp** (giới tính, mê lịch sử, lễ, quốc gia) thay vì một funnel chung.
- **Paywall 3 tầng, đóng khung giá/ngày** (giá gạch → giá giảm → giá/ngày); bộ giá đổi giữa các funnel (đang test giá).
- **Ads UGC kể chuyện dài**: coin thừa kế → tiền thật → CTA mềm "take the quiz".
- **Web2app dự phòng**: mỗi funnel coin/rock có trang `/landing/w2a/` cho traffic bỏ qua quiz.
- **Lần nhận diện đầu miễn phí làm hook** (PictureThis, CollX), upsell app/subscription sau.

## Gaps
Không có walk quiz/paywall cho brand nào (chỉ vài giá CoinIn). Chỉ một advertiser coin thật và đã dormant từ tháng 7.

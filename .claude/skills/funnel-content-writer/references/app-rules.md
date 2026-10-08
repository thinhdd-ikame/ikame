# App rules (owner decisions, binding)

Rules the product owner set per app. They override the generic defaults in `SKILL.md`, `blocks.md` and `prototype.md`. Read the section for the app before writing a brief or touching a demo. If an app is not listed, use the generic defaults and ask for the app's rules.

## Rules for every app

- **Email gate, email only.** A mandatory email screen sits right before the paywall: one input, validated, with no skip, guest or "later" option. Never add "Continue with Google / Apple" or any other social sign-in. The email is how the backend activates the subscription in the app. Emit `lead` with `S.email` so FunnelFox fills the checkout email (`fox.inputs.setEmail`).
- **Under-18 block has a way back.** The 18+ block screen always has a "Change my birth date" button. It clears the block flag (sessionStorage) and returns to the birth-date input with the fields empty, including after a reload.
- **Paywall is a web page.** The paywall is a long-scroll landing page (see `blocks.md` → Paywall), never a compact app sheet. On first view (375×667 and 430×932) a CTA and the selected plan's price today must be visible: the sticky bottom bar shows from first view whenever no plan-block CTA is on screen.
- **Purchase hands off to the app.** After a purchase comes a get-app screen: 3 steps (download the app, log in with the checkout email, open your result), "Open the app", and store badges that look like the official black badges.
- **No invented proof.** Use no made-up stats, user counts or reviews. Never take a competitor's store reviews, or cut a negative review down to a positive fragment, and present it as our users'. Without real data, use honest product facts ("Why go Plus": 24/7, real limits, real features) and hide the reviews block.
- **Images are real art.** No CSS placeholders, emoji avatars or one image reused for several options; generate them (`gemini/gemini-3.1-flash-image` via the ikame gateway, key passed inline only). People are clearly adult (25+) and clothed. "Sexy" means a glamour-photo look, never nudity.
- **Changing monetization doesn't cut onboarding.** When the monetization changes, change only the monetization screens. Never delete onboarding, opt-in or email screens to move the paywall closer.

## ChatChi: AI Roleplay Chat (folders `chat-ai-character/chai-*`; formerly "Chai")

- **Brand:** "ChatChi: AI Roleplay Chat"; the paid tier is "ChatChi Plus". Competitor references to Chai may stay in research notes only.
- **Legal:** Terms https://squad-xteam.com/termofuse.html · Privacy https://squad-xteam.com/policy.html · support@chatchi.co. Links must be real `<a target="_blank">`, underlined, at least 13px, with a tap area at least 40px tall.
- **Flow:** onboarding/quiz → chat taste of **1-2 chat screens, at most 2 messages from the user** → typing hand-off → mandatory email → **hard paywall**.
  - After the taste the composer locks.
  - Going back into the chat or reloading never re-opens it.
  - There is no free tier and no "Continue free".
  - The web chat exists only for paid users, reached from get_app → "Keep chatting here".
- **Plans** (12 months pre-selected):

  | Plan | First period | Renews at |
  |---|---|---|
  | `m1` | $24.99 | $49.99/month |
  | `m3` | $49.99 | $109.99/3 months |
  | `y12` | $119.99 | $299.99/year |

  Tapping a plan card opens that plan's checkout.
- **Decline flow** (`CONFIG.declineFlow`):

  | Where the user leaves | Goes to |
  |---|---|
  | `m1` / `m3` / `y12` checkout, closed without paying | that plan's sale screen (`sale_m1` / `sale_m3` / `sale_y12`) |
  | Sale screen: accept | the sale checkout |
  | Sale screen: decline, or sale checkout closed | `sale_lifetime` ($99.99, paid once) |
  | `sale_lifetime`: decline, or lifetime checkout closed | **back to the paywall** |
  | Paywall X | `sale_lifetime`, every time |

  Sale prices:

  | Sale | First period | Renews at |
  |---|---|---|
  | `m1_sale` | $22.99 | $49.99 |
  | `m3_sale` | $44.99 | $109.99 |
  | `y12_sale` | $105.99 | $299.99 |
- **After purchase:**
  - A subscription purchase goes to an upsell screen (`upsell_lifetime` is a legacy name) selling a **one-time add-on** ("Bonus character", $22.99, plan key `addon`) through its own checkout. The subscription stays as it is.
  - Add-on paid, skipped or closed → `get_app`.
  - Lifetime buyers skip the upsell.
- **Paddle** (live / sandbox). FunnelFox stores productId = priceId.

  | Plan | Live price ID | Sandbox price ID |
  |---|---|---|
  | `m1` | `pri_01m45kr4bae1at0qtjbrfamg8f` | `pri_01m45jdezhzqs1j1nmt0jt9t8d` |
  | `m3` | `pri_01m45kr42p2y7kcqprd8mrsmdx` | `pri_01m45jdf8ceeh0p30h0719zaj5` |
  | `y12` | `pri_01m45kr3tj3b5e4nky8pmzthds` | `pri_01m45jdfgzxpd1hey8ded2ccfh` |
  | `m1_sale` | `pri_01m45kr3j5tynaz4xdm4tdkwn0` | `pri_01m45jdft6wja9bz2v0wcx6kwy` |
  | `m3_sale` | `pri_01m45kr39s98wt77jybnq7sqsf` | `pri_01m45jdg31jg26r86ccdqbfz2k` |
  | `y12_sale` | `pri_01m45kr31h21qrnzx1egpkbxz6` | `pri_01m45jdgbxym95hnnaeyw1824q` |
  | `lifetime` | `pri_01m45kr2sg5nt5afv8mwmd205d` | `pri_01m45jdgmvqh1xaazrgd8yty64` |
  | `addon` | `pri_01m47nmvmmav229fqtc2hepwem` | `pri_01m47nqdb1wh61skfrhjcb4ye1` |
- **Open the app** (`CONFIG.app`, `openApp()`):
  - **Android → web2app:** `https://chatchi.go.link?adj_t=2567dkvx_256m7zvv_25adl2th&email={{email}}&user_id={{user.id}}&af_adset={{utm_medium}}&c={{utm_campaign}}&af_ad={{utm_content}}&clickid={{fbclid}}&af_channel={{utm_source}}`
  - **iOS and desktop → web2web:** `https://chatchi-app.squad-xteam.com/payment/funnel?` followed by the same parameters (owner, 2026-10-08; was `/?` before, older chai-* funnels still use that).
  - The engine fills the tokens itself, URL-encoded:
    - `email`: the funnel email.
    - `user.id`: the FunnelFox profile id, from `?fpid` or the `ff-user` cookie.
    - utm and fbclid: captured on the first screen into sessionStorage `ikf_attr_<slug>`, because later screens may lose the query.
- **Exception `chai-create-your-ai` + `chai-kpop-idol` (owner, 2026-10-07/08):** clones of Chai's quiz v2. No chat taste (AI scenario + voice pick replace it). Plans are **flat Paddle prices** (same price every period, no intro, no struck price, no % off): `1w` $9.99/week (SKU chai_web_1week, sandbox `pri_01m4cwtwccrrpt8qx1v8bxhg0k`), `4w` $29.99 labelled "every 4 weeks" (SKU chai_web_1month, sandbox `pri_01m4cwtwnn2x83b48y47t0dpyj`), `52w` $117.99/year (SKU chai_web_1year, sandbox `pri_01m4cwtwxxgtvzj3jz1vnkwcrs`); live price IDs pending. The spin wheel awards a real Plus feature (voice notes), never a discount; no countdown or promo code. Add-on $22.99 as other ChatChi funnels. A closed checkout returns to the paywall.
- **Imagery:** glamour-photo style (see `chai-dream-girl/gen_images.py`). When a character funnel can go either way, prefer female leads. Portraits should match the user's picks, e.g. ethnicity × hair colour.
- **FunnelFox:** project "AI Character", custom domain `app.chatchi.co/<alias>`.

## CoinIdentify: Coin Scanner (folders `scanner/coinin*`; formerly "CoinIn")

- **Brand:** "CoinIdentify: Coin Scanner" (short: "CoinIdentify") on every funnel, including the non-coin niches (cards, antique, notes/stamps/gems, plant). Competitor references to CoinIn stay in research notes only.
- **Legal:** Terms https://squad-xteam.com/termofuse.html · Privacy https://squad-xteam.com/policy.html · support email `{{support_email}}` (owner to send).
- **Flow (2026-10-07, "like Starlyn"):** onboarding/quiz and scan → mandatory email → **hard paywall**: no close X, no free path, no free result screen, **no sale or offer on decline**. Purchase → one-time add-on upsell → get_app.
- **Plans** (`4w` pre-selected, badge "Recommended"):

  | Plan | First period | Renews at |
  |---|---|---|
  | `1w` | $12.99 first week | $39.99 every 4 weeks |
  | `4w` | $14.99 first 4 weeks | $39.99 every 4 weeks |
  | `12w` | $39.99 first 12 weeks | $59.99 every 12 weeks |

  Note the 1-week plan renews every **4 weeks**, not weekly.
- **Add-on:** yes, one per niche (plan key `addon`, own one-time checkout, hidden on the paywall). Name, price and Paddle IDs are pending from the owner: price stays `{{addon_price}}` until then.
- **Paddle:** price IDs pending (plans and add-on).
- **Open the app:** links pending (`CONFIG.appUrl` / `appUrlAndroid` empty → "App link coming soon").
- **Under-18:** the scanner funnels have no birth-date input, so no age block.
- **FunnelFox:** project "CoinIdentify: Coin Scanner" (subdomain `coin-identify`), MCP server `funnelfox-coinin`.

## Starlyn: Daily Astrology (folders `nebula/*`; formerly "Nebula")

- **Brand:** "Starlyn: Daily Astrology" everywhere; keep competitor references in research notes only.
- **Legal:** the same squad-xteam Terms and Privacy as ChatChi · support@starlyn.co.
- **Monetization:**
  - **One plan:** 1-week intro **$13.67**, then **$49.99/month**.
  - **Hard paywall:** no purchase, no app; the paywall has no close X, no free path, and no sale or offer screens on decline.
  - Paddle live `pri_01m45krfch92j45sjdemeg9hs1` / sandbox `pri_01m45jdh7m49b5m7w094chv914`.
- **After purchase:**
  - A one-time **add-on, $19.99** (plan key `addon`, its own checkout: live `pri_01m47npxdwfswknfmhq4nj75be` / sandbox `pri_01m47nq9hktz9taxtbsyscd7zr`).
  - Add-on paid, skipped or closed → get_app, with an "added" line when paid.
- **Under-18:** a notice with "Change my birth date".
- **FunnelFox:** project "Astrology", custom domain `app.starlyn.co/<alias>`.

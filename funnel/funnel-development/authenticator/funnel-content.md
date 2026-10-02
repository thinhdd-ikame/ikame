---
niche: authenticator
display_name: Authenticator (2FA codes - iOS)
archetype: diagnostic-utility
subject: person
input: 4 security-habit answers (how codes arrive, what is exposed, password reuse, past lockouts) + email
output: personal Security Risk Score with the 1-3 risks that apply and the fix for each
screens: 13
monetization: hard web subscription paywall (weekly / yearly pre-selected / monthly), app unlocked by the same email
creative_screens:
  hook-a: 1
  hook-b: 2
  hook-c: 4
  reveal: 11
motion: >
  a red risk bar filling to 72/100, then the SMS code card cracking and
  turning into a blue offline code with a countdown ring ticking down
---

# Funnel Content — Authenticator (2FA)

Authenticator is an iOS 2FA app. It generates 6-digit TOTP codes on the device (they work offline), keeps them in an encrypted vault with iCloud backup, and has an Apple Watch app and an app lock. This is a **web funnel** that runs before install. The user answers 4 questions about their security habits and gets a **Security Risk Score**. The score names the risks that actually apply to them and pairs each one with an app feature that fixes it. They then buy on the web and log into the app with the same email. The shape is new to this repo, so it's registered as **diagnostic-utility**. The quiz isn't the product (like astrology) and isn't a transformation input (like a photo). It's a *diagnosis* that turns a utility nobody is excited to buy into a problem the user now owns. There are 13 screens. Screens 1-9 and 11-12 come straight from the Figma file `Funnel / Web Funnel` (section `96:34945`) and are referenced by node id in `Visual:`. Screens 10 (email gate) and 13 (download handoff) are **new**, because a web checkout can't work without them. The look follows the Figma file, not the repo's default dark theme: white background, iOS system type, blue primary `#3B82F6`, rounded 58px CTA with a trailing arrow, real service logos (Google, Microsoft, Facebook) on the code cards. All copy is cut to the repo's mobile limits. The Figma headlines are 10-15 words, and the originals are listed in Notes so design can compare.

---

## A. Hook

### 1. Hook A — Social proof
**Purpose:** Cold ad traffic lands on a security app they've never heard of; borrowed trust has to come before any claim.
**Headline A:** Loved by 1M+ people
**Headline B:** Your codes, one safe app
**Body A:** The 2FA app people trust with every login.
**Body B:** Google, Microsoft, Facebook codes — all in one place.
**Visual:** `96:34946` — tilted iPhone showing the Authenticator token list, floating app icons (Microsoft, Amazon, Google) around it, laurel wreath + 5-star row framing the "1M+ people" line at the bottom.
**Microcopy:** Star row under the laurel: ★★★★★
**CTA:** Continue

### 2. Hook B — All accounts, one place
**Purpose:** Show the product in one glance: live codes for the services the user already uses.
**Headline A:** Secure all your accounts
**Headline B:** Every login, one tap away
**Body A:** Add two-factor codes to every account you own.
**Body B:** One app for Google, Microsoft, Facebook and more.
**Visual:** `96:35006` — stacked code cards (Microsoft 618 321, Google 118 362, Facebook 218 776) with 30s countdown rings, service logos orbiting the stack.
**CTA:** Continue

### 3. Hook C — Encrypted vault
**Purpose:** Answer the first objection before it forms: "what if I lose my phone / my codes?"
**Headline A:** End-to-end encrypted
**Headline B:** Lose your phone, not codes
**Body A:** Codes stay encrypted, even inside your iCloud backup.
**Body B:** Encrypted backup restores every code on a new phone.
**Visual:** `96:35107` — iPhone showing the Settings > Data Backup row, iCloud cloud with a green check badge, shield icon and Apple Watch floating beside it.
**CTA:** Continue

---

## B. Investment

### 4. Quiz intro — The SMS problem
**Purpose:** Turn "nice-to-have app" into "I might have a problem": name the threat (SMS codes, SIM swap), promise a fast personal check, and place a testimonial before the first question.
**Headline A:** SMS codes aren't safe anymore
**Headline B:** Is your login really secure?
**Body A:** 4 quick questions show where your accounts are exposed.
**Body B:** Find your weak spots in under a minute.
**Visual:** `96:35385` — blue-highlighted first line of headline, one Google code card centered, 5-star quote card below.
**Microcopy:** Quote card: ★★★★★ "A must-have for peace of mind" — "Setup took 2 minutes. No more waiting for SMS codes." — App Store user
**CTA:** Check my risk

### 5. Q1 — How codes arrive
**Purpose:** The single answer that drives the biggest part of the score, and the segment for the paywall headline (SMS / email / no-2FA users get the strongest pitch).
**Headline A:** How do login codes reach you?
**Headline B:** Where do your codes come from?
**Body A:** This decides if hackers need your phone — or number.
**Body B:** Pick the one you use most.
**Options:**
- 💬 SMS text
- 📧 Email
- 🔐 Authenticator app
- 🤷 No 2FA / not sure
**Field:** Single select, auto-advance on tap.
**Visual:** `96:35441` — thin progress bar at top (1/4), stacked full-width grey option pills, selected pill turns blue with white text.
**CTA:** (auto-advances on select)

### 6. Q2 — What's exposed
**Purpose:** Makes the stakes concrete and personal; every pick is a real account the user now pictures being lost. Also sets which logos show on the paywall mockup.
**Headline A:** What could a hacker reach?
**Headline B:** What's behind your logins?
**Body A:** Select all that apply.
**Options:**
- 🏦 Banking
- 📧 Main email
- 💬 Social & messaging
- 🪙 Crypto wallets
- 💼 Work & cloud
**Field:** Multi-select with circular checkmarks; CTA disabled until ≥1 pick (Figma `96:35463` disabled state → `96:35513` enabled state).
**Visual:** `96:35463` / `96:35513` — same pill list as Q1 with a right-side radio circle that fills blue with a check; CTA pinned at the bottom.
**CTA:** Continue

### 7. Q3 — Password reuse
**Purpose:** Uncovers the "one leak unlocks everything" risk. Honest self-report works here because the question admits most people reuse.
**Headline A:** Are your passwords unique?
**Headline B:** Be honest: reused passwords?
**Body A:** No judgment — most people reuse a few.
**Body B:** Your answer stays on this page.
**Options:**
- 🟢 All unique
- 🟡 A few reused
- 🔴 Most are shared
**Field:** Single select, auto-advance.
**Visual:** `96:35561` — three pills with a colored dot on the left. **Fix the Figma dot colors:** it has 🔴 on "every account has its own password" (the safe answer) and 🟢 on "most accounts share passwords". Green = safe, red = risky.
**CTA:** (auto-advances on select)

### 8. Q4 — Past incidents
**Purpose:** Last and most emotional question; a "yes" makes the third risk card real rather than hypothetical.
**Headline A:** Ever been locked out?
**Headline B:** Seen a login you didn't make?
**Body A:** Most breaches start quietly, weeks before anyone notices.
**Options:**
- 🚨 Yes
- 👀 Something suspicious
- ✅ No
**Field:** Single select, auto-advance.
**Visual:** `96:35583` — same pill list, progress bar at 4/4.
**CTA:** (auto-advances on select)

---

## D. Anticipation

### 9. Calculating
**Purpose:** Make the score feel computed from *their* answers, and reassure that no device data is read (an obvious worry for a security app).
**Headline A:** Calculating your risk score…
**Headline B:** Checking your weak spots…
**Steps:**
1. Checking how your codes arrive…
2. Weighing password reuse risk…
3. Reviewing past login warnings…
4. Building your protection plan…
**Visual:** `96:35603` — large blue shield-check icon centered with a slow pulse, four rows beneath with a spinner that turns into a blue check one by one.
**Microcopy:** Under headline: "100% private. Based on your answers, not your device."
**CTA:** (auto-advances, ~5-6 seconds)

---

## E. Gate

### 10. Email gate — NEW
**Purpose:** A web checkout needs an identity to hand the purchase to the app. Capture it while curiosity about the score peaks, before it's shown.
**Headline A:** Your score is ready
**Headline B:** Where should we send it?
**Body A:** Enter your email to see your score and plan.
**Body B:** You'll use this email to unlock the app.
**Field:** Email input, native keyboard type `email`, autofocus. Optional "Continue with Apple" button above it.
**Visual:** New screen, same system as `96:35603`: blurred silhouette of the score card (red bar, "?/100") behind a white sheet holding the email field.
**Error state:** "Please enter a valid email."
**Microcopy:** Under CTA: "No spam. We never share your email." + Terms · Privacy links.
**CTA:** Show my score

---

## D. Anticipation (reveal)

### 11. Security Risk Score
**Purpose:** The reveal. A number plus 1-3 named risks, each paired with the exact feature that fixes it, makes the paywall read as "fix this" rather than "buy this".
**Headline A:** Your score: {{score}}/100
**Headline B:** {{risk_level}} risk found
**Body A:** Here's what's exposed — and how to fix it.
**Visual:** `96:35659` — grey card with "SECURITY RISK SCORE", red progress bar, big red number, "High Risk" pill; then one card per triggered risk (bold title, grey explanation, green "FIX:" line). Bar and pill color follow the band: green Low, amber Medium, red High.
**Microcopy:** Risk cards (show only the ones the answers trigger, in this order):
- **Card 1 (Q1 = SMS / Email / No 2FA):** "Your codes travel over the network" · "SMS codes can be stolen by SIM-swap." · FIX: "On-device codes that work offline."
- **Card 2 (Q3 = A few / Most shared):** "One leak opens many accounts" · "Leaked passwords get tried on your other logins." · FIX: "Unique 2FA code on every account."
- **Card 3 (Q4 = Yes / Suspicious):** "Your logins may be targeted" · "Past alerts often mean a password is out there." · FIX: "Lock the app with Face ID."
- **No card triggered (low scorer):** "You're ahead of most people" · "Keep it that way if you change phones." · FIX: "Encrypted backup + Apple Watch codes."
**CTA:** Protect my accounts

---

## F. Monetization

### 12. Paywall
**Purpose:** Close while the risk is fresh, re-using the score's language, product mockup, trust row and FAQ to handle the "is this a scam / can I cancel" objections that a security buyer has.
**Headline A:** Fix your risks today
**Headline B:** Protect {{accounts_count}} account types
**Body A:** Offline 2FA codes, encrypted backup and Face ID lock.
**Body B:** Everything you need to stop SIM-swap attacks.
**Plans:** (prices from the Figma file)
- Weekly — $8.99/week · $1.28/day
- **Yearly — $59.99/year · $0.16/day — pre-selected**, badge "BEST VALUE"
- Monthly — $19.99/month · $0.67/day, badge "MOST POPULAR" (decoy: makes yearly read as the obvious deal)
**Visual:** `96:35693` — shield app icon top, iPhone mockup with a highlighted Google code card (use the Q2-picked service logos if possible), 3 stacked plan cards with radio circles (selected = blue border + filled radio), full-width blue CTA, payment-method logo row (Visa, Amex, Discover, Mastercard, PayPal, G Pay, Apple Pay), feature checklist, one review card with carousel dots, FAQ accordion.
**Microcopy:**
- Trust row under CTA: "Secure encrypted checkout · Cancel anytime in settings"
- Auto-renew line (required): "Renews at {{plan_price}} per {{period}} until you cancel."
- Feature checklist, only features the app ships: "Offline 2FA codes" · "Scan QR in seconds" · "Encrypted iCloud backup" · "Face ID app lock" · "Apple Watch codes"
- Review card: ★★★★★ "Super easy to set up" — "Moved all my accounts in 2 minutes." — App Store user
- FAQ: How does it work? · What's included? · How does billing work? · Can I cancel anytime?
- Proof number must match screen 1 ("1M+"); Figma says "100,000+" here.
**Fallback offer:** On back/exit intent: one bottom sheet showing Yearly with a clearly stated trial (e.g. 3-day free, then $59.99/year), only if billing supports a trial. Otherwise no fallback.
**CTA:** Unlock full protection

---

## G. Payoff

### 13. Download handoff — NEW
**Purpose:** Web buyers who don't install never activate, then refund or charge back. The first action after paying is getting the app open on their phone with the same email.
**Headline A:** You're protected, {{first_name}}
**Headline B:** Last step: get the app
**Body A:** Install the app and sign in with {{email}}.
**Body B:** Your plan is active on this email.
**Visual:** New screen: green check over the shield icon, 3 numbered steps (1 Download · 2 Sign in with this email · 3 Scan your first QR code), App Store badge + QR code for desktop visitors.
**Microcopy:** "Receipt sent to {{email}}" · "Need help? Contact us"
**CTA:** Download on App Store

---

## Notes

**Scoring rubric (score must come from the answers, not a fixed 72).**
Q1: SMS 30 · Email 25 · No 2FA 35 · Authenticator 5. Q2: +4 per pick, max 20. Q3: All unique 0 · A few 12 · Most shared 25. Q4: Yes 20 · Suspicious 12 · No 0. Max 100. Bands: 0-34 Low (green), 35-64 Medium (amber), 65-100 High (red). Treat the Figma 72 as a sample value only. For example, SMS + 3 picks + a few reused + locked out = 30+12+12+20 = 74, High. A funnel that tells everyone "72, High Risk" is a fake diagnosis. Users who already use an authenticator app would see through it, and so would ad reviewers.

**Changes vs. Figma, for design to apply:**
| Screen | Figma today | Change |
|---|---|---|
| 3 | "End-to-End Encryprion", "SECURTY SETTINGS" | Typos → "Encryption", "SECURITY" |
| 4 | "SMS codes aren't safe anymore. Is your account standard security enough?" | Headline ≤6 words; question moves to Body |
| 5-8 | 10-15 word question headlines | Cut to ≤6 words, full question as Body |
| 6 | "If a stranger got into your phone…" | "What could a hacker reach?" SIM-swap attacks don't need your phone, so the old framing contradicted screen 5 |
| 7 | 🔴 on the safe answer, 🟢 on the risky one | Swap colors |
| 11 | Fixed 72/100, all 3 cards always shown | Computed score, cards conditional (rubric above) |
| 11 | "100% offline & un-hackable", "Zero-knowledge encryption" on the Face ID fix | Drop "un-hackable" (absolute claim) and the mislabeled zero-knowledge line |
| 12 | "Limited Time Offer / Expires in 09:59" + struck-through $17.99 / $119.99 / $39.99 | **Remove** unless the offer genuinely ends and those were real prior prices. A timer that resets and invented "was" prices are deceptive-pricing exposure (FTC), and for a *security* brand they're the fastest way to look like a scam |
| 12 | "BEST VALUE — SAVE 50%" (vs. the fake strike price) | "BEST VALUE", or an honest comparison: yearly saves 75% vs. 12× monthly |
| 12 | "1.28$" price format | "$1.28/day" |
| 12 | "Loved by Over 100,000+ Users" vs. "1M+" on screen 1 | Use one real number in both places |

**Verify before launch.** The Figma risk cards and paywall promise an **Encrypted Password Vault**, **Private Browser & Vault** and **Multi-Device Sync**. The app's Settings screen (`96:35107`) shows none of these, only Data Backup, Apple Watch, App password and Data Transfer. If they don't ship, they come out of the fixes and the checklist (this brief already leaves them out). Paying for a feature that isn't in the app means guaranteed refunds.

**Blocks deliberately skipped:** no name capture (a score doesn't need `{{name}}`; first name comes from Apple sign-in if used), no notification opt-in (web, pre-install), no gamified wheel (cheapens a trust product), no post-purchase upsell (one product, no add-on worth selling yet).

**Drop-off risk:** screen 10 (email before score) is the cliff. **First A/B test:** email gate before the score (this brief) vs. after the score, just before the paywall. Second test: Q1-segmented paywall headline ("Stop relying on SMS codes" for SMS users) vs. the generic one.

**Monetization:** one layer, the web subscription. Track paywall conversion, and separately the **install + sign-in rate from screen 13**. A web sale without activation turns into a refund.

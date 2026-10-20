# Final whole-branch review — feat/runtime-sdk-collector (4f13c44..0aa6dfd)

Reviewer scope: cross-task contracts, consent and PII end to end, data-loss paths, CI/deploy, first deploy and first real traffic, TTFB. Read-only. I read every source file in the diff, the spec, the plan's adjustments (A1–A15), Global Constraints and its "Theo sau" checklist. I also checked the funnel corpus (`/Users/daothinh/ikame/funnel/funnel-development`, 69 `demo.html`) for state keys and capture channels.

## Strengths

- **The contract holds end to end.** The SDK event shape, `validateEvent`, `scrubEvent`, the collector enrich step, `toRow` and the DDL all match: ULID regex, `v` ≤ UInt32, `rev` safe-int → UInt64, `screen` ≤ 1e6 → Int32, props/attr string→string, ISO-8601 times with `best_effort`, and `ip_hash` as 64 hex. The real-ClickHouse test checks maps, nulls, ms precision and collapse of equal ids.
- **The PII gate is shared and runs twice.** The same `@ikf/event-schema` code runs in the SDK and in the collector. Path is cut at `?`/`#` and dropped to `/` if it holds an email. `attr` is email-filtered. Playwright drives the funnel's real `#em` input and checks the raw POST bodies.
- **Consent gating is correct.** `aid` comes from `getAid()` and is null before Accept. `_fbc`/`_fbp` are only set in `enableAds`. The Pixel only loads in `enableAds`, and the page_load PageView fires once after Accept with the same `eventID`. Unknown/XX/T1 countries are treated as EEA. The e2e test proves this on a real funnel (DE).
- **The Meta gate is solid (A1).** Funnel `fbq('trackCustom', …)` is swallowed. This was verified against the real `fbevents.js` by inspecting `/tr` requests. `autoConfig false` and `disablePushState` prevent automatic events and per-screen PageViews.
- **Consumer failure handling is right.** Only a 400 is split. 401/403/404/5xx/timeouts retry and never drop. Rejected rows are retried into the DLQ instead of being acked away. Alarm throttling survives SNS failures. The DLQ has 14-day retention and an HTTP pull consumer, and replay sends before it acks.
- **The SDK build is tied to the deploy.** The bundle is not committed. It is rebuilt in `pretest` and in the deploy job, with a content hash and an 8 KB gzip budget. A wrong hash gets a 404, never stale content. HTML is `no-cache`, so a new hash takes effect immediately.
- **TTFB is not affected.** `injectIkf` is synchronous string insertion and adds no await. The collector path returns before route/KV lookup.

## Issues

### Critical

None.

### Important

**I1. Rows rejected by ClickHouse, and bodies `toRow` cannot read, go to the DLQ with no alarm. A systemic 400 sends 100% of traffic there silently, with about 2N−1 inserts per batch.**
`workers/event-consumer/src/index.js:16-21` and `:34-41`.
- **What:** Both "retry to DLQ" paths call `m.retry()` and never alarm. The `dlq` alarm is raised only in the insert-throws branch (`:47`). The test `400 on every row: nothing is acked, every message is retried` confirms there is no alarm.
- **Why:** The ledger ruling made the DLQ plus replay the recovery path for exactly these rows. Nobody is told they are there, so they expire after 14 days. The worst case is the one most likely after a contract change, such as a column type change in the DDL or a collector/consumer mismatch. Every row then gets a 400. Each batch of 100 is bisected into about 199 POSTs, retried 6 times, and lands in the DLQ with zero alarms. Meanwhile ClickHouse takes about 200× the request rate.
- **Fix:**
  - In `handleBatch`, when any message being retried for `row_rejected` has `attempts > MAX_RETRIES`, call `alarm.notify('dlq', …)`.
  - When `rejected.length === rows.length && rows.length > 1`, call `alarm.notify('rows_rejected', …)` (throttled). Optionally short-circuit: if both halves of the first split are fully rejected, stop bisecting and retry the batch.
  - Add two tests.
  - This is the Task 10 deferred minor. Promote it to must-fix.

**I2. Merging ships the SDK, collector and EEA banner to every prod funnel before staging is verified, and the documented order guarantees a window of collector 503s.**
`.github/workflows/edge-router.yml:26-34`, `workers/edge-router/src/collector.js:79-82`, plan "Theo sau" step 3 (plan line 5761).
- **What:**
  - A push to main deploys edge-router to `staging` and then `prod` automatically. The new paths filter includes `packages/sdk/**`. From that moment every prod funnel loads the SDK, and EEA visitors see the banner.
  - The checklist then says "Merge → deploy; `wrangler secret put` các secret; deploy lại". Until `IP_SALT` exists, every `POST /_ikf/c` returns 503.
  - The SDK sends through `sendBeacon` first, which reports success, so those events are never retried (see I3).
  - The event-consumer deploy also runs before `CLICKHOUSE_*`/AWS secrets exist. That part is recoverable via retries and the DLQ, but it is noisy.
  - The runbook (secrets by name, GH variables `CONSUMER_STATE_KV_NAMESPACE_ID`/`ALARM_TOPIC_ARN`/`AWS_REGION`, the DDL, the Free-plan 2-rule limit on the platform zone, and the hand-made `http_ratelimit` rulesets on funnel zones that would conflict) lives only in the plan in another repo.
- **Why:** This is the first-deploy failure mode. Data is lost and a user-visible banner appears in prod before the staging checklist (99% match, Meta Test Events, TTFB) has run.
- **Fix:**
  - (a) Reorder the runbook: Terraform apply → GH vars → ClickHouse DDL → `wrangler secret put IP_SALT` on both edge-router envs, plus consumer secrets → merge. Commit it to `ikf-platform` (for example `docs/runbooks/runtime-sdk.md`).
  - (b) Make prod opt-in until staging signs off. Either confirm the `prod` GitHub environment has required reviewers, or add a var such as `SDK_ENABLED` that gates `injectIkf`'s script tag. The repo cannot show the reviewer setting.
  - (c) Extend `scripts/smoke-edge.sh`. Fetch the SDK URL found in the preview HTML and expect 200. POST an invalid event with a matching Origin and expect 204. That catches a missing `IP_SALT` (503) right after deploy without writing a row.
  - This folds in the Task 12 deferred "runbook" minor. Must fix before merge.

**I3. `sendBeacon` hides collector 503 and 429, so the spec's retry promise only holds on the fetch fallback. The per-IP rate limit can then drop real traffic silently.**
`packages/sdk/src/transport.js:6`, `infra/modules/edge/main.tf:70-75`, `infra/modules/funnel-domains/main.tf` (same rule).
- **What:** `sendBeacon` returns true once the request is queued. A collector 503 (Queue error, missing salt) or a rate-limit 429 is never seen, so the batch is gone. Spec §7 says the SDK keeps up to 200 events on 503 and retries. That only happens when beacon is missing or returns false.
- **Why:** At 30 requests per 10 s per IP (per colo), a mobile carrier CGNAT address shared by more than about 15 active funnel users during an ad burst gets blocked. All of their events are lost with no client retry and no server log, because the WAF answers before the Worker runs. This bears directly on the ≥99% success criterion. The spec itself prescribes beacon first, so this is a spec contradiction rather than an implementation slip.
- **Fix:** Send timer and size flushes with `fetch(…, {keepalive:true})`, whose status is visible and drives the retry path. Use `sendBeacon` only for `pagehide`/`visibilitychange→hidden`. Validate the 30/10 s limit with the planned k6 run from a single IP pool. Consider raising it (for example to 100) or keying on `ip.src` plus a header. Fix before staging sign-off. This one is not merge-blocking if I2(b) gates prod.

**I4. Meta Automatic Advanced Matching can send the funnel's typed email to Meta (hashed), bypassing the "Pixel gets only standard params" rule.**
`packages/sdk/src/pixel.js:47-48`.
- **What:** `autoConfig false` disables automatic events. Automatic Advanced Matching is a separate per-pixel Events Manager setting. When it is on, `fbevents.js` reads email-like form inputs (the funnels' `#em`) and attaches `ud[em]` to later events.
- **Why:** The e2e uses the fake pixel id `123456789012345`, whose remote config has AAM off, so it cannot catch this. The first real pixel could have it on.
- **Fix:** No code change can enforce this reliably.
  - Add a runbook step: turn AAM off for every pixel before `ikf funnel set --pixel`.
  - Add a staging check (checklist step 4): no `/tr` request carries `ud[` parameters after the email screen.
  - Not merge-blocking, because no funnel has a pixel until someone sets one. Must be done before the first pixel is set.

### Minor

- **M1. PII key rules miss DOB/name/place keys that real funnels use.** `packages/event-schema/src/index.js:23-38`, `:69-108`.
  - What: Funnel state has `pdob`/`xdob` (partner or ex DOB as `{m,d,y}`), `pname`, `uname`, `nameP`, `place`/`birth_place`, and `birth.month`/`birth.year`. All of them pass `isPiiKey`, and `{m,d,y}` values are short strings that the value rules ignore.
  - Today's `snapshot()`s are curated (sun signs, booleans), so there is no current leak; the risk is a future funnel that emits raw state.
  - Fix: treat a segment ending in `dob` as PII, and a 1–2 char prefix plus `name` as PII. Add a test using Starlyn's state keys.
- **M2. Preview traffic is stored under the real funnel slug.** `workers/edge-router/src/index.js:27`.
  - What: The SDK sends analytics in preview; only the Pixel is off.
  - Fix: dashboards must filter `host != <preview host>`, or the SDK can skip analytics when `cfg.preview` is set. Document whichever is chosen.
- **M3. Several funnels have no channel the SDK hooks, so they get only `page_load`.** Not an SDK bug.
  - No channel at all: `starlyn` (its `emit(){}` is a no-op), `chatchi`, `nebula/soulmate-sketch`, `moon-reading`, `astrocartography`, `mental-health/calmio`.
  - `authenticator` pushes to `window.__ikf` (`{ev}`).
  - Starlyn and ChatChi are flagship brands. Track this as a funnel-side follow-up.
- **M4. A deploy rollout can 404 the SDK briefly.** `workers/edge-router/src/sdk.js:11`.
  - What: Only the current hash is served. During a deploy, HTML from a new isolate whose SDK request hits an old one (or the reverse) gets a 404 for a few seconds, and that page view has no analytics.
  - Optional fix: serve the current bundle for any 12-hex hash with `max-age=60` instead of `immutable`.
- **M5. The synchronous head script adds a render-blocking same-origin fetch on first visit.** `workers/edge-router/src/inject.js:8`.
  - This is spec-mandated and does not touch TTFB, but it delays FCP by about one RTT in cold in-app browsers.
  - Measure FCP alongside TTFB in checklist step 7.
- **M6. The consent banner works as a consent wall and has no way to change the choice.** `packages/sdk/src/consent.js:40-49`.
  - It is fixed at the bottom with a max z-index, so it covers the funnels' bottom CTA (`.foot .btn`) until the visitor chooses.
  - The copy is English-only on localized funnels, and a saved choice cannot be revisited.
  - This is a product/legal call. The Task 3 a11y minor (focus, aria-modal) belongs here too.
- **M7. Clock skew drops events silently.** `packages/event-schema/src/index.js:203`, `collector.js:94`.
  - What: Devices whose clocks are off by more than 24 h lose every event (`bad_t`). The log only records a count.
  - Fix: log the reasons histogram so skew is visible.
- **M8. The e2e is local-only.** `packages/sdk/e2e/funnels.spec.js:6` defaults to `/Users/daothinh/...`, and the e2e is not in CI. That is acceptable for now; note it in the runbook.

## Deferred-minor triage

| Task | Item | Ruling |
|---|---|---|
| T1 | Exported `PII_KEY_RE` is a stale substring regex | Can wait (delete it when next touched; it misdocuments the rules) |
| T1 | Unused `nextSeg` | Can wait |
| T1 | Numeric phone numbers kept | Can wait (funnel inputs are strings) |
| T2 | Cross-task dedupe gap | Can wait (Task 13 e2e shows correct counts on a real ewa funnel) |
| T2 | Name-only suppression of several same-name `dataLayer` items | Can wait |
| T2 | Queue persisted before send ack | Can wait |
| T2 | No retry backoff | Can wait (5 s cadence, bounded) |
| T2 | `lastDom` unpruned | Can wait (bounded by distinct names) |
| T3 | `readCookie` decode failure overwrites `_fbp` | Can wait |
| T3 | Banner focus / aria-modal | Can wait (fold into M6) |
| T4 | Stub left installed if script creation throws | Can wait |
| T4 | Capture hooks left if a later step throws | Can wait |
| T4 | Ruling B untested | Resolved by Task 13 |
| T4 | Test isolation | Can wait |
| T4 | `start()` guard on any truthy `window.IKF` | Can wait (no funnel defines it) |
| T5 | Over-budget bundle written before exit 1 | Can wait (exit 1 still stops test and deploy) |
| T5 | No IIFE/global-leak assertion | Can wait |
| T6 | `GET /v1/routes/:host` omits `pixel` | Can wait |
| T8 | No pixel regex at the edge | Can wait (DB CHECK + SDK regex) |
| T8 | compat-date warning | Can wait |
| T9 | Missing CF-Connecting-IP hashes to one bucket | Can wait (Cloudflare always sets it) |
| T9 | Origin scheme not compared | Can wait |
| T9 | Event host/funnel not tied to the request host | Can wait (cheap hardening later: drop events where `host` ≠ request host) |
| T10 | Rejected/junk messages reach the DLQ with no `dlq` alarm | **Must fix before merge (I1)** |
| T10 | compat-date fallback | Can wait |
| T11 | Replay has no max messages/rounds cap | Can wait |
| T11 | `decodeBody` passes non-objects | Can wait (`toRow` sends them back to the DLQ) |
| T11 | All-non-JSON pull stop | Can wait |
| T11 | Ack response unchecked | Can wait (`call` throws on non-2xx; re-send collapses in ClickHouse) |
| T12 | Env/secret runbook not in repo; funnel-zone ruleset import; Free-plan rule count | **Must fix before merge (I2)** |

## Declined to judge

- **Cloudflare Queues REST payload details.** I did not verify:
  - `content_type: 'json'` on `messages/batch`;
  - the pull `body` encoding for json messages;
  - whether DLQ'd messages keep `CF-Content-Type`.
  Checklist step 8 (DLQ drill) verifies these against the live API.
- **Whether the `prod` GitHub environment has required reviewers.** That setting is not in the repo.
- **Legal sufficiency of the banner and of treating unknown countries as EEA.**
- **Whether Free-plan zones accept `["ip.src","cf.colo.id"]` with a 10 s mitigation.** The mock-provider tests cannot prove plan entitlements.
- **I did not re-run the suites.** The per-task reviews ran them, and none of my doubts needed a run to settle.

## Verdict

**Ready after fixes.** Fix I1 (DLQ alarm for rejected/unreadable rows, plus the systemic-400 alarm) and I2 (secrets, DDL and runbook before merge, prod gated until staging sign-off, smoke check for the collector) before merging. Fix I3 before staging sign-off. Do I4 before the first `ikf funnel set --pixel`.

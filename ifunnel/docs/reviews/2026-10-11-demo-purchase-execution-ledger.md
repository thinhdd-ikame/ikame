# SDD ledger — plan: /Users/daothinh/ikame-ifunnel/ifunnel/docs/plans/2026-10-11-web-funnel-compat-and-demo-purchase.md
Specs: ifunnel/docs/specs/2026-10-11-web-funnel-sdk-compat-design.md, 2026-10-11-demo-purchase-design.md
Worktree: /Users/daothinh/ikf-platform-demo-purchase, branch feat/demo-purchase from 2cd090a (created by controller; Task 1 skips that step).

## Pre-flight scan
| Pair / task | Produces → consumes | Finding |
|---|---|---|
| T1→T2,T3,T4 | user_id / handoff / deeplink_path / bundle_ids columns | consistent |
| T2→T3,T5,T7 | appForKey.handoff/deeplink_path, APP_BODY.handoff='claim', SDK_APP_BODY | consistent; old claim tests pinned to claim |
| T3→T12 | usesUserId, userAppLinkFor, claimEmail reusable | consistent |
| T4→T5,T8,T12,T13 | sdk-contract.js names, USER_ID_RE, contractJson | consistent (swagger pending — single module) |
| T6 (event-schema UUID scrub) | bundle 8146 → 8154 after T9 | within 8192 |
| T9 shares SDK checkout.js / pay.js with T6 bundle | sequential | OK |
| T10→T12,T13 | createFakePaddle, memoryQueue, DEMO_PRICES | consistent |
| T11→T12,T14 | startTunnel, startProxy, targetOf | consistent |
| T12→T13,T14 | PORTS, startStack purchase, mailbox | consistent |
| per task | tests vs code | plan code replayed byte-identical by author |
Rulings: C1–C9, D1–D13 accepted as written (spec adjustments, all argued). Note D1: guard lives in deploy-config.js not Terraform — acceptable since worker vars aren't in Terraform.
Task 1: implemented 58a612d — core-api 326/0 — review dispatched
Task 1: complete — 58a612d — core-api 326/0 — review approved (minor test gaps parked)
Task 2: implemented 5a08aa6 — core-api 327/0 — review dispatched
Task 2: complete — 5a08aa6 — core-api 327/0 — approved; minors parked (appForKey handoff for web callers — Task 3 usesUserId checks kind, so safe)
Task 3: implemented 62eabfd — core-api 332/0 — review dispatched
Task 3: complete — 62eabfd — core-api 332/0 — approved (opus); minors parked: &quot; escaping in claim email, no log test on email failure, LIMIT 1 w/o ORDER BY
Task 4: implemented 04753b0 — core-api 338/0 — review dispatched
Task 4: review (opus) needs fixes — Important: Fastify body parsing yields 400/413/415 (empty JSON body, bad JSON, __proto__, form-encoded, >4 KB) → SDK keeps stale pro. Ruling: fix in the sdk plugin — lenient parser for any content type (unparseable → {}), plugin-scoped error handler mapping every 4xx to 200 {is_pro:false, expires_at:null} + no-store; 5xx stay 503. Minors: cap/omit raw app_id in log (log only matched app id), hash only UUID-looking values. Rate-limit path is Task 8's (plan).
Task 4: fix round 1 dispatched
Task 4: fix round 1 — 4df6653 (lenient parser + plugin error handler, encapsulated plugin verified by controller) — core-api 340/0. Task 4: complete — 04753b0..4df6653 (offset +2 vs plan from here)
Task 5: implemented b34bba0 — core-api 343/0 (one unidentified flake in a first run, 2 green reruns) — review dispatched
Task 5: complete — b34bba0 — core-api 343/0 ×2 (flake not reproduced) — approved
Task 6: implemented 09b9007 — event-schema 145, sdk 152 (8146 B), edge 101, e2e 11/11; event-consumer 8+27 verified by controller with Docker env — review dispatched
Task 6: complete — 09b9007 — approved; no false positives found in funnels
Task 7: implemented 377d719 — cli 118 — review dispatched
Task 7: complete — 377d719 — cli 118 — approved; minors parked (web ignores handoff flags silently, bundle-ids empty item, user_id undefined on old server)
Task 8: implemented 5cbf01c — core-api 344, tf 10/11 — review dispatched
Task 8: complete — 5cbf01c — approved; spec §4 updated to POST (controller); doc minors carried to final fix wave (handoff 'default' wording, encoded deep_link note)
Task 9: implemented 6741bdf (merge, no conflicts) + 4fbb3c1 — sdk 156, edge 106, demo 45, bundle 8154 — review dispatched (diff from merge commit)
Task 9: complete — 6741bdf + 4fbb3c1 — approved (opus); minors parked: secret-named PADDLE_JS_URL bypass (add runbook smoke check in final wave), SDK test rows for ''/non-string, toStrictEqual
Task 10: implemented c089fe1 — demo 55 — review dispatched
Task 10: complete — c089fe1 — demo 55 — approved; demo-only minors parked (refund cap, list timestamp compare, renew semantics)
Task 11: implemented 3be9684 — demo 63 — review dispatched
Task 11: review needs fixes — Important: proxy does not propagate client abort / no upstream timeout; tunnel child not killed on process exit. Ruling: fix both in Task 11 (demo-only code): abort upstream on client close, 60 s upstream timeout; tunnel registers exit/SIGINT/SIGTERM cleanup + SIGKILL fallback after 3 s. Minors parked.
Task 11: fix round 1 dispatched
Task 11: fix round 1 — d696d46 — demo 68 — controller spot-checked; Task 11: complete
Task 12: implemented 5fdc873 — demo 77 — review dispatched
Task 12: complete — 5fdc873 — demo 77 — approved (opus); minors parked (409 path leaves secret store empty — harmless for user_id handoff; log capture excludes Miniflare/proxy)
Task 13: implemented befb22e — demo 96 — review dispatched
Task 13: complete — befb22e — demo 96 — approved; minors to final wave: readJson over-limit never settles (reject 413), require application/json on POST actions; esc() apostrophe
Task 14: implemented ae84951 — demo 100; real tunnel run OK — review dispatched
Task 14: complete — ae84951 — demo 100 — approved; minors to final wave (try/finally in run.mjs shutdown, README troubleshooting line for cloudflared exit)
Task 15: full rerun by controller at ae84951 — paddle 31, event-schema 145, sdk 156 (8154 B), cli 118, edge 106, event-consumer 8+27, core-api 344, route-match 35, demo 100; tf fmt OK, edge 10, stack 11, envs validate OK; tree clean.
## Final review
Final review (opus) at ae84951: ready after fixes — 0 Critical, 2 Important, fix list 1–12. All suites green.
Rulings: I1 — app_link for user_id apps is served only once the checkout's claim_tokens marker row exists (written after recompute), else 202 pending; spec §2 wording updated by controller — avoids SDK caching FREE — cost: ≤ 2 s extra wait. I2 runbook fix. M2 — proxy answers 403 to /v1/* with an authorization header (admin API never through the tunnel). All 12 items in one fix wave.
Final fix wave dispatched.
Final fix wave: ae84951..d47ebdf (12 commits) — core-api 347, sdk 159, demo 105, all green. Found+fixed: web-funnel/entitlements 500 path logged err.message (could carry user_id). Global error handler still logs err.message on 500s for other routes — follow-up.
Re-review (opus): merge-ready; all 12 addressed; 2 minors (demo body drain; spec wording — fixed by controller). Branch complete at d47ebdf.

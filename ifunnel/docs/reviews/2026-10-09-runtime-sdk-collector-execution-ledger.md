# SDD ledger — plan: ifunnel/docs/plans/2026-10-08-runtime-sdk-collector.md
Code repo: /Users/daothinh/ikf-platform; Task 1 creates branch feat/runtime-sdk-collector from feat/infra-edge-router (4f13c44)
Scope: Tasks 1–13. Task 0 (manual inputs) skipped. No apply/deploy/push during tasks.
Spec: ifunnel/docs/specs/2026-10-08-runtime-sdk-collector-design.md
Preflight: plan author ran every task's code verbatim in a scratch copy of 4f13c44 with the stated test counts; spec gaps resolved in plan table A1–A15. Ruling: no separate preflight scan — the plan was produced by executing it — cost if wrong: conflicts surface in task reviews instead
Env: DOCKER_HOST=unix://$HOME/.colima/default/docker.sock TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock TF_PLUGIN_CACHE_DIR=$HOME/.terraform.d/plugin-cache
Handoff note: platform zone Cloudflare plan must allow 2 rate-limit rules (Free allows 1) — Task 0 Step 5
Task 1: dispatched (base 4f13c44, implementer haiku)
Task 1: Ruling: Important plan-mandated — slash/dot dates (01/05/1990, 1990/05/01, 1.5.1990) leak under neutral keys → widen date rule + strip '/' '.' before digit count; also fix now (cheap, PII gate everything builds on): path stripped of ?/# and dropped/redacted if it contains an email; keys that look like PII values dropped; key regex by segment (camelCase/_/-/.) so tarot_card, zodiacName, plan_name, screenName, birth_chart, cardio, hotel are KEPT while email/e_mail/userEmail/firstName/fullname/surname/birthday/bday/dob/phone/mobile/tel/zip/postcode/address/password/card(as whole segment card number?) are DROPPED; rev must be safe integer — cost if wrong: some analytics keys dropped/kept differently than spec text; spec §3 updated to match
Task 1: fix round 1 dispatched (resume implementer)
Task 1: fix round 1/5 (4 addressed, 1 open — segment split lowercases before camelCase: userEmail leaks, plan_name/name_meaning dropped; tests miss lists; commits ab3b2fc..3a8edca)
Task 1: fix round 2 dispatched (resume implementer)
Task 1: fix round 2/5 (1 addressed, 0 open — camelCase split before lowercase; commits 3a8edca..c15d64c)
Task 1: complete (commits 4f13c44..c15d64c, review clean after 2 fix rounds)
Task 1: minor (deferred): exported PII_KEY_RE is stale substring regex (unused internally); unused nextSeg var; numeric phone numbers (Number type) kept
Task 2: dispatched (base c15d64c, implementer sonnet)
Task 2: complete (commits c15d64c..6cccce7, review clean)
Task 2: minor (deferred; check in Task 13 e2e): dedupe only covers same-task DOM/dataLayer pairs (cross-task 1-50ms double-counts); name-only suppression drops multiple dataLayer items of one name; queue persisted before send ack; no retry backoff; lastDom unpruned
Task 3: dispatched (base 6cccce7, implementer sonnet)
Task 3: complete (commits 6cccce7..e8b38c0, review clean)
Ruling: Task 3 minor 1 (fbclid with ';' injects cookie attributes into _fbc) fixed in Task 4 dispatch: set _fbc only if fbclid matches /^[A-Za-z0-9_-]+$/, with a test; Task 4 also guards the consent onChoice callback — cost: none
Task 3: minor (deferred): readCookie decode failure → _fbp overwritten; banner has no focus move / aria-modal
Task 4: dispatched (base e8b38c0, implementer sonnet)
Task 4: complete (commits e8b38c0..85cd68b, review clean; rulings A/B applied, consent gating verified with 9 added tests)
CARRY into Task 13: e2e must load the REAL fbevents.js (route intercept may serve it or allow network) and assert funnel fbq('trackCustom', …) calls never reach facebook.com, while PageView/Lead/InitiateCheckout with eventID do
Task 4: minor (deferred): stub left installed if script creation throws; capture hooks left if later createSdk step throws; ruling B untested; test isolation (listeners/posted shared); start() guard trips on any truthy window.IKF
Task 5: dispatched (base 85cd68b, implementer haiku)
Task 5: complete (commits 85cd68b..cb4b6f3, review clean; SDK 5363 B gzip)
CARRY into Task 12 (hard requirement): edge-router.yml deploy job must build the SDK (npm run build -w @ikf/sdk) before wrangler deploy, and paths filters must include packages/sdk/** and packages/event-schema/**
Task 5: minor (deferred): over-budget bundle written before exit 1; no IIFE/global-leak assertion
Task 6: dispatched (base cb4b6f3, implementer sonnet)
Task 6: complete (commits cb4b6f3..c46be39, review clean)
Task 6: minor (deferred): GET /v1/routes/:host listRoutes doesn't return pixel
Task 7: dispatched (base c46be39, implementer haiku)
Task 7: complete (commits c46be39..7586bec, review clean)
Task 8: dispatched (base 7586bec, implementer sonnet)
Task 8: complete (commits 7586bec..b7491be, review clean)
Ruling: Task 8 minor 1 fixed in Task 9 dispatch — reserve /_ikf (and /_ikf/…) case-insensitively in edge-router index.js before route matching, with a test — cost: none
Task 8: minor (deferred): no pixel regex check at edge (validated upstream + SDK); compat-date fallback warning in Worker tests
Task 9: dispatched (base b7491be, implementer sonnet)
Task 9: fix round 1 dispatched (ruling test doesn't distinguish old/new behavior)
Task 9: fix round 1/5 (1 addressed, 0 open — ruling test now seeds catch-all route; commits 99dc4b8..d688661)
Task 9: complete (commits b7491be..d688661, review clean after 1 fix round)
Task 9: minor (deferred): missing CF-Connecting-IP hashes to one bucket; Origin scheme not compared; event host/funnel not tied to request host
Task 10: dispatched (base d688661, implementer sonnet)
Task 10: Ruling: Important plan-mandated — split-on-400 acks rejected rows (schema-wide 400 = permanent unrecoverable loss) → rejected messages get message.retry() (reach DLQ after max retries, replayable) and only inserted messages are acked; also fold in: inserter construction inside try (missing secret → logged + alarm path), throttle key removed on SNS publish failure, SNS fetch timeout 5s, read-back test covers received_at/attr/rev/v, DLQ alarm on final attempt = attempts > MAX_RETRIES (CF attempts start at 1, max_retries counts retries) — cost if wrong: a truly-bad row is retried 5 times before landing in DLQ (bounded)
Task 10: fix round 1 dispatched (resume implementer)
Task 10: Ruling: malformed bodies (toRow throws) also retry → DLQ, not ack — a toRow failure is a code/contract bug and DLQ replay after a fix is the recovery path — cost: junk could fill DLQ (14-day retention, alarmed)
Task 10: fix round 1/5 (8 addressed, 0 open; commits f600a19..07bb3ae)
Task 10: complete (commits d688661..07bb3ae, review clean after 1 fix round)
Task 10: minor (triage at final — likely fix): rejected/junk messages reaching DLQ on final attempt raise no `dlq` alarm (only insert-failure path alarms); compat-date fallback in Worker tests
Task 11: dispatched (base 07bb3ae, implementer sonnet)
Task 11: complete (commits 07bb3ae..8f5f86c, review clean)
Task 11: minor (triage at final — likely fix): replay loop has no max messages/rounds cap; decodeBody forwards JSON null/number/string; all-non-JSON pull stops silently-ish; ack response unchecked
Task 12: dispatched (base 8f5f86c, implementer sonnet; CARRY: deploy builds SDK + paths filters)
Task 12: complete (commits 8f5f86c..37dc922, review clean)
Task 12: minor (triage at final — likely fix as docs): env-setup runbook (wrangler secret put IP_SALT/CLICKHOUSE_*/AWS creds, gh variable set) not in ikf-platform repo; onboarding note: import/delete hand-made http_ratelimit ruleset on funnel zones; Free plan funnel zones use their 1 rate-limit rule for /_ikf/c
Task 13: dispatched (base 37dc922, implementer sonnet; CARRY: real fbevents.js check)
Task 13: Ruling: Important plan-mandated — e2e PII check never drives the funnel's real PII path (snapshot()/S.email via #em and date inputs) → fix: fill the funnel's email and date inputs with page.fill and advance so snapshot carries real values, keep assertions; also make the screen-1 double-emit explanation checkable (record emit timestamps, assert/log) — cost: none
Task 13: fix round 1 dispatched (resume implementer)
Task 13: fix round 1/5 (3 addressed, 0 open; commits 565fb91..0aa6dfd)
Task 13: complete (commits 37dc922..0aa6dfd, review clean after 1 fix round)
ALL TASKS 1-13 COMPLETE. Next: final whole-branch review.
Final review: Ready after fixes (final-review.md). I1 rejected/unreadable→DLQ silent; I2 auto-deploy puts SDK/consent live in prod before staging check, collector 503 until IP_SALT set and beacon can't retry; I3 sendBeacon hides 503/429 + per-IP limit vs carrier NAT; I4 Meta Automatic Advanced Matching could hash-send typed email.
Ruling: I1 — consumer raises `dlq` alarm when a rejected/unreadable message is on its final attempt, plus throttled `batch_rejected` alarm when a whole batch is rejected — cost: none
Ruling: I2 — add kill switch: edge-router injects the SDK script only when env var SDK_ENABLED === 'true' (render-config passes vars.SDK_ENABLED, default false) and the collector returns 404 when disabled; commit docs/runbooks/runtime-sdk-collector.md in ikf-platform (order: ClickHouse DDL → secrets → terraform → deploy → staging verify → set SDK_ENABLED per env; Meta AAM off; rate-limit check); smoke-edge.sh fetches the SDK and POSTs a valid event when SDK_ENABLED — cost if wrong: one more env var to flip
Ruling: I3 — SDK uses fetch keepalive for timed/size flushes (sees 503/429 → retain+retry) and sendBeacon only on pagehide/visibilitychange-hidden — cost: none (spec allows fetch path)
Ruling: I4 — runbook step + e2e asserts no Pixel request carries `ud[` params — cost: none
Ruling: PII keys minor — treat single-segment keys matching ^(p|x|u|f|l|s)?(dob|name)$ as PII (pdob, xdob, pname, uname…) with tests — cost: a legit key like `sname` dropped
Ruling: preview traffic stays in ClickHouse (host column = preview host, filterable) — no change; note in runbook
Ruling: funnels emitting nothing capturable (Starlyn, ChatChi, calmio, 3 Nebula) — content-side follow-up for handoff, no code change
Final fix wave: dispatched (base 0aa6dfd)
Final fix wave: re-review clean (commits 0aa6dfd..053769a)

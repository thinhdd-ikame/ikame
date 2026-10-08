# SDD ledger — plan: ifunnel/docs/plans/2026-10-05-ikf-infra-aws.md
Code repo: /Users/daothinh/ikf-platform, branch feat/infra-edge-router (base 610cbb2 on main, empty init commit)
Scope: Tasks 1–13 code + `terraform test` with mock providers only. NO apply to AWS/Cloudflare. Skip Task 0, Task 14.
Spec: ifunnel/docs/plans/2026-10-05-ikame-funnel-platform.md (§11, §12)
Env: terraform 1.16.4, tflint 0.64.0, trivy, docker via colima (DOCKER_HOST unix:///Users/daothinh/.colima/default/docker.sock), node 26.3.0 (plan says >=22).
Ruling: repo created on branch feat/infra-edge-router instead of committing on main as infra Task 1 Step 1 says — SDD forbids implementing on main without consent — cost if wrong: one `git merge` to main later.
Ruling: steps that `terraform apply` real infra (bootstrap apply) are skipped; only init/validate/test run — user scoped execution to code + mock tests — cost if wrong: bootstrap untested against real AWS until Task 14.
Preflight: table + findings in preflight.md (26 interface rows, 13 per-task rows, 7 findings; verified by running plan code in scratch).
Ruling: F1 — add mock_resource defaults (valid ARNs etc., blocks in preflight.md) to tests of Tasks 3, 8, 11, 12 — mocks produce invalid ARNs — cost if wrong: test-only edits.
Ruling: F2 — add dkim_signing_attributes { next_signing_key_length = "RSA_2048_BIT" } and object-shaped mock in Tasks 10, 12 — cost if wrong: minor SES config drift.
Ruling: F3 — use 32-hex zone ids in edge/stack/email tests (Tasks 9, 12); also in edge-router plan Task 12 funnel_domains test — cost if wrong: test-only.
Ruling: F4 — add AVD-AWS-0132 to .trivyignore in Task 1 with reason — cost if wrong: state bucket uses AWS-managed key instead of CMK.
Ruling: F5 — create scripts/smoke.sh in Task 13 (moved from Task 14 Step 1) — cost if wrong: none.
Ruling: N1, N2 — keep plan text; verify at first apply (Task 14), fallbacks in preflight.md — cost if wrong: alarm/ratelimit fix during apply.
Note: set TF_PLUGIN_CACHE_DIR=$HOME/.terraform.d/plugin-cache for implementers.
STATUS: paused before Task 1 dispatch (usage limit). Resume: dispatch infra Task 1.
Task 1: dispatched (base 610cbb2, implementer sonnet)
Task 1: complete (commits 610cbb2..df21119, review clean)
Task 1: minor (deferred): test run "encrypted" asserts no SSE; trust-policy sub/aud not asserted (mock empty JSON); AdministratorAccess on GHA roles (MVP); no prevent_destroy/TLS-only policy on state bucket; bootstrap has no env tag (env-agnostic, undocumented)
Task 2: dispatched (base df21119, implementer haiku)
Task 2: complete (commits df21119..0261547, review clean)
Task 2: minor (deferred): nothing prevents prod + single_nat_gateway=true at module level; no var descriptions/validation on cidr/region; S3 endpoint unnamed; unused mock_data in test
Task 3: dispatched (base 0261547, implementer sonnet, F1 mocks carried)
Task 3: complete (commits 0261547..f66aec4, review clean)
Task 3: minor (deferred): fixed final_snapshot_identifier collides on 2nd destroy; client SG has no egress to proxy (relies on ECS SG egress — check at final review); no rds.force_ssl (proxy-only SG makes it acceptable); engine_version "17" may drift with auto minor upgrade
Ruling: batch Tasks 4,5,6 (cache, queues, security modules) into one dispatch + one review — same shape (verbatim module + mock test), preflight says all pass as written — cost if wrong: one larger review unit
Tasks 4-6: dispatched as batch (base f66aec4, implementer haiku)
Task 4: complete (commits f66aec4..f9ec81b, review clean)
Task 5: complete (commits f9ec81b..8c50cfd, review clean)
Task 6: complete (commits 8c50cfd..9c38d15, review clean)
Tasks 4-6: minor (deferred): Valkey no auth_token (SG-only access); cache test doesn't assert ingress source; max_receive_count no validation; DLQ redrive_allow_policy unset; env var unvalidated in modules
Task 7: dispatched (base 9c38d15, implementer haiku)
Task 7: Ruling: Important (plan-mandated) — pg.Pool lacks pool.on('error') (idle-client drop crashes task) and shutdown has no force-exit timeout — not fixed here because edge-router plan Task 9 replaces server.js wholesale; both fixes are carried into that dispatch — cost if wrong: server.js at infra Task 13 deploy still lacks them until ER Task 9 lands (no prod deploy happens in this run)
Task 7: complete (commits 9c38d15..b5d0a8f, review clean, 2 plan-mandated items deferred by ruling to ER Task 9)
Task 7: minor (deferred): server starts even if initial Redis connect fails (by design, undocumented); relies on Node bundled CAs for RDS Proxy TLS
Task 8: dispatched (base b5d0a8f, implementer sonnet, F1 mocks carried)
Task 8: complete (commits b5d0a8f..9fbd8d7, review clean) — task SG egress all resolves Task 3 client-SG egress concern
Task 8: minor (deferred): egress could be narrowed; origin-auth secret plaintext in state (inherent); empty secret_arns → empty IAM resources on real apply; ignore_changes task_definition (intentional)
Task 9: dispatched (base 9fbd8d7, implementer sonnet, F3 carried)
Task 9: complete (commits 9fbd8d7..f16819b, review clean)
Task 9: minor (deferred): ratelimit test only checks paths; characteristics include cf.colo.id (per-PoP counters); env unvalidated
CROSS-CUTTING minor: every module .terraform.lock.hcl has only darwin_arm64 h1 hash — Linux CI may fail lock check; fix with `terraform providers lock -platform=linux_amd64 -platform=darwin_arm64` (consider in Task 13 / final review)
Task 10: dispatched (base f16819b, implementer sonnet, F2+F3 carried)
Task 10: complete (commits f16819b..92f2fe9, review clean)
Task 10: minor (deferred): DMARC p=none without rua; test checks only dkim[0] name
Task 11: dispatched (base 92f2fe9, implementer sonnet, F1 carried)
Task 11: complete (commits 92f2fe9..2e5527d, review clean)
Task 11: minor (deferred): fixed 10GiB free-storage threshold; alarm_email unvalidated; ok_actions/naming not asserted; SNS email needs manual confirm after apply
Task 12: dispatched (base 2e5527d, implementer sonnet, F1+F2+F3 carried)
Task 12: Ruling: Important plan-mandated — AppSecrets IAM statement omits ikf/<env>/turnstile-secret; master plan puts Turnstile before OTP and checkout, which are core-api endpoints, so core-api verifies tokens and must read it → fix: add aws_secretsmanager_secret.turnstile.arn to AppSecrets + a stack test assertion — cost if wrong: one extra secret readable by core-api task role
Task 12: Ruling: turnstile aws_secretsmanager_secret_version in infra/stack stays — constraint's intent is no literal secret values in code; value is Cloudflare-generated and flows via encrypted state; CI grep scoped to infra/modules deliberately — cost if wrong: secret in S3 state (already true for origin_auth)
Task 12: fix round 1 dispatched (resume implementer)
Task 12: fix round 1/5 (1 addressed, 0 open — turnstile ARN in AppSecrets; commits 4a10658..158e34c)
Task 12: complete (commits 2e5527d..158e34c, review clean after 1 fix round)
Task 12: minor (deferred): stack test covers prod only (no staging profile run); ses:SendEmail on "*"; mock ARNs say staging in prod run
Ruling: Task 13 also regenerates every .terraform.lock.hcl with `terraform providers lock -platform=linux_amd64 -platform=darwin_arm64` — CI runs ubuntu and current locks hold darwin-only h1 hashes — cost if wrong: slightly larger lock files
Task 13: dispatched (base 158e34c, implementer sonnet, F5 + lock ruling carried)
Task 13: Ruling: Important plan-mandated — core-api.yml deploy runs smoke.sh whose step 3 needs `terraform output` (no terraform in that job) → every app deploy red, prod leg cancelled. Fix: smoke.sh takes ALB host from optional 3rd arg or ALB_DNS_NAME env, falls back to terraform output only if terraform on PATH, else skips step 3 with notice; core-api.yml passes vars.ALB_DNS_NAME — cost if wrong: direct-ALB check skipped in app deploys when var unset
Task 13: fix round 1 dispatched (resume implementer)
Task 13: fix round 1/5 (1 addressed, 0 open — smoke.sh ALB host w/o terraform; commits a0a8175..5f105a3)
Task 13: complete (commits 158e34c..5f105a3, review clean after 1 fix round; includes lock regen a0a8175)
Task 13: minor (deferred): secret_version grep scope infra/modules only; no concurrency groups on apply/deploy; actions pinned to tags not SHAs; ALB_DNS_NAME GitHub var must be set per env
Ruling: one final whole-branch review covers both plans (same branch, one execution request) after edge-router Task 14 — cost if wrong: infra-only issues found later rather than now
INFRA PLAN TASKS 1-13: DONE. Next: edge-router plan (see its ledger).
# SDD ledger — plan: ifunnel/docs/plans/2026-10-06-edge-router-publisher.md
Code repo: /Users/daothinh/ikf-platform, branch feat/infra-edge-router; starts after infra plan Tasks 1–13 complete.
Scope: Tasks 1–14. Skip Task 0 (manual inputs) and Task 15 (staging/prod).
Spec: ifunnel/docs/specs/2026-10-06-edge-router-publisher-design.md
CARRY into ER Task 9 server.js: add pool.on('error', e => console.error('pg pool error', e.message)); shutdown force-exit setTimeout(() => process.exit(1), 10_000).unref() and guard against double signal
Preflight: preflight.md (all interfaces agree; T10 and T13 fail as written; others pass; verified fixes give route-match 35, core-api 74, edge-router 28, cli 45)
Ruling: T10 — @cloudflare/vitest-pool-workers ^0.12.0 (0.8.x local runtime rejects cacheTtl 30; prod accepts 30) — cost if wrong: dev-dep bump only
Ruling: T13 — main.test.js 'a@v1' → 'aivideo@v1' (slug needs ≥2 chars) — cost: none
Ruling: T7 — routes.test.js count is 14 not 13 — cost: none
Ruling: T12 — run `terraform fmt -recursive infra` before commit; lock funnel-domains for linux_amd64+darwin_arm64 — cost: none
Ruling: T12 Step 7 — do NOT commit placeholder tfvars values; envs take media_origins from TF_VAR_media_origins (GitHub env var, same pattern as zone_id/zone_name) and funnel_domains defaults to {} — placeholder hosts fail validation and would turn CI red — cost if wrong: Task 0 must set TF_VAR_media_origins per env before first plan
Ruling: T1 Step 7 — bootstrap image cmd uses `-f ../../../services/core-api/Dockerfile` (text fix in infra plan Task 14 only; nothing to run here) — cost: none
Ruling: T14 Step 5 — verify smoke with nebula/tarot (fails on img/card-back.jpg) instead of ai-video-generator (fails at lint) — cost: none
Ruling: T4 Step 6 — data drift (69 demos, 11 missing CONFIG.funnel) is expected; error types unchanged — cost: none
Note: export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock for core-api tests on colima
Note: Task 15 merge order — Task 12 apply + secrets + Worker deploy before Tasks 1–9 reach main (record for handoff)
Task 1: dispatched (base 5f105a3, implementer sonnet)
Task 1: complete (commits 5f105a3..a46312e, review clean)
Task 1: minor (deferred): normalizePath decodes %2F/%2e before collapse — fine for prefixes, never use for file lookups
Task 2: dispatched (base a46312e, implementer haiku)
Task 2: complete (commits a46312e..8ad381b, review clean)
Task 2: minor (deferred): concurrent-migrate test runs on already-migrated DB (doesn't exercise race); URL.pathname vs fileURLToPath; no index on version_id
Task 3: dispatched (base 8ad381b, implementer haiku)
Task 3: Ruling: Important plan-mandated — error handler maps Fastify 4xx (bad JSON, 415, empty body) to 500 → fix: pass through err.statusCode <500 as {error: err.code ?? 'bad_request'} after the body-too-large branch — cost: none
Task 3: fix round 1 dispatched (resume implementer)
Task 3: fix round 1/5 (1 addressed, 0 open — 4xx passthrough; commits f2879bc..1bc101b)
Task 3: complete (commits 8ad381b..1bc101b, review clean after 1 fix round)
Task 3: minor (deferred): ensureToken ignores changed name/roles for same hash; duplicate token name → 500 if unique; weak "not.toContain(token)" assertion
Task 4: dispatched (base 1bc101b, implementer sonnet)
Task 4: complete (commits 1bc101b..177f869, review clean)
Task 4: minor (deferred, triage at final review): validator misses <object data>, SVG <image href>/<use xlink:href>/<script href>, CSS @import "…" and image-set(); srcset split on every comma rejects data: URLs; CONFIG_FUNNEL regex can match a later object's funnel: (false pass) — also in validate-all.js; IMG map backtick/empty values unchecked; <base href>/<meta refresh> unflagged
Task 5: dispatched (base 177f869, implementer haiku)
Task 5: complete (commits 177f869..d637978, review clean)
Task 5: minor (deferred, triage at final): KV fetch has no timeout (hang blocks route set/sync while holding advisory lock); error classes don't set name; no test that secrets absent from errors
Task 6: dispatched (base d637978, implementer sonnet)
Task 6: complete (commits d637978..f37ebba, review clean)
Task 6: minor (deferred): rows[0].id unguarded (no funnel deletion exists); invariant comment could be fuller; no test for R2-ok-then-DB-fail retry
Ruling: R2 put and KV PUT get timeouts (flagged by Task 5 and Task 6 reviews: a hang holds the funnels row lock / advisory lock + a pool connection) — carry into Task 9: createR2Store passes requestHandler requestTimeout 10s (or abortSignal AbortSignal.timeout(10_000)); createKvClient passes signal AbortSignal.timeout(10_000); timeout errors already wrap into Store/KvUnavailableError — cost if wrong: a slow-but-alive R2/KV call >10s fails with 503 and must be retried
Task 7: dispatched (base f37ebba, implementer sonnet)
Task 7: complete (commits f37ebba..d801452, review clean)
Task 7: minor (deferred, triage at final): syncHost reads rev and routes in separate statements (use REPEATABLE READ); trySync swallows non-KV errors as pending; concurrency test can't catch lock removal (fake KV instant); rollback may cross funnels without confirm; listRoutes two snapshots; uppercase host → 400
Note: timed-out KV write landing late is self-healing — kv_synced_rev stays behind so resync (Task 8) rewrites the latest projection; CF KV ~1 write/s/key means bursts end `pending` then resync
Task 8: dispatched (base d801452, implementer haiku)
Task 8: Ruling: Important plan-mandated — startResync has no default log; a throwing/missing logger in catch → unhandled rejection kills process during DB blip → fix now: log = console default, guard log call, test stop() in finally — cost: none
Task 8: fix round 1 dispatched (resume implementer)
Task 8: fix round 1/5 (1 addressed, 0 open — resync log default/guard; commits a2d834e..3941889)
Task 8: complete (commits d801452..3941889, review clean after 1 fix round)
Task 9: dispatched (base 3941889, implementer sonnet, rulings A (pool error + shutdown) and B (R2/KV 10s timeouts) carried)
Task 9: complete (commits 3941889..e911bd6, review clean; rulings A and B applied)
Task 9: minor (deferred, triage at final): S3 requestTimeout only warns without throwOnRequestTimeout (abortSignal enforces); timeout tests don't prove timeout specifically; stopResync doesn't await in-flight tick (force-exit may win); secrets.js hardcodes us-east-1
Task 10: dispatched (base e911bd6, implementer sonnet, pool-workers ^0.12.0 ruling carried)
Task 10: complete (commits e911bd6..dc75ce2, review clean)
Task 10: minor (deferred, triage at final): preview can cache an orphaned (unreferenced, later overwritten) v<n> bundle for 1y — skip cache for previews or never reuse n with different sha; HEAD_OPEN may match inside a leading comment; compat date falls back 2026-09-01→2026-03-10 in local workerd; workerd postinstall not in npm allow-scripts; HEAD does full GET work
Task 11: dispatched (base dc75ce2, implementer haiku)
Task 11: complete (commits dc75ce2..397ea27, review clean)
Task 11: minor (deferred): malformed KV doc (routes not array) → matchRoute throws → CF 1101; 404/405 unlogged
Task 12: dispatched (base 397ea27, implementer sonnet, rulings: no placeholder tfvars/TF_VAR_media_origins, fmt, lock)
Task 12: complete (commits 397ea27..f4a22c2, review clean; infra.yml TF_VAR_* lines accepted as consequence of ruling 1)
Task 12: minor (MUST-FIX at final review): infra.yml `vars.TF_VAR_funnel_domains || '{}'` fallback means an unset prod var plans destruction of every funnel DNS record/route — drop fallback, require explicit `{}`
Task 12: minor (deferred): rollout order — Worker deploy must precede first infra apply (route needs script) — record in runbook/handoff; sync-domains fixed /tmp path + no curl --max-time; edge-router.yml paths miss scripts/smoke-edge.sh
Task 13: dispatched (base f4a22c2, implementer sonnet, 'aivideo@v1' ruling carried)
Task 13: complete (commits f4a22c2..51004b5, review clean)
Task 13: minor (deferred): main-module guard throws when argv[1] undefined; existing ~/.config/ikf not chmod'ed 0700; --token in shell history; CLI fetch no timeout; "~undefined giây" if server omits propagation_seconds; rm prints no propagation note
Ruling: Task 14 publish validates --slug with the same regex as parseVersionRef before interpolating into the URL path (Task 13 reviewer: slug unencoded in /v1/funnels/${slug}/versions) — cost: none
Task 14: dispatched (base 51004b5, implementer sonnet, rulings: slug validation, nebula/tarot for Step 5)
Task 14: complete (commits 51004b5..e016bb2, review clean)
Task 14: minor (deferred): no smoke timeout; temp dir survives SIGINT; tests leave temp dirs
ALL TASKS 1-14 COMPLETE. Next: final whole-branch review (covers infra plan too).
Final review: Ready after fixes (final-review.md). Important: I1 RDS-managed password rotates every 7d but tasks keep startup password; I2 failed core-api deploy reports success (ECS rollback + smoke on old code); I3 prod environment protection is GitHub settings (handoff). MUST-FIX M1 funnel_domains fallback.
Ruling: I1 — pg Pool `password` becomes an async function that reads the RDS master secret from Secrets Manager (new env DB_SECRET_ARN, task-role GetSecretValue on it), cached 10 min and refetched after an auth failure (28P01) — keeps proxy auth unchanged, smaller than IAM auth — cost if wrong: one Secrets Manager call per 10 min per task
Ruling: I2 — deploy-core-api.sh fails unless the service's PRIMARY deployment uses the new task-definition ARN with rolloutState COMPLETED; infra.yml apply and core-api.yml deploy share concurrency group `ikf-deploy-<env>` (no overlap) — cost if wrong: an ordering race can still deploy before apply, but now fails loudly
Ruling: also apply in the same fix wave: pin aquasecurity/trivy-action to a commit SHA; move `id-token: write` to the jobs that need it — cost: none
Ruling: I3 not code — goes to handoff (GitHub env prod: deploy only from main + required reviewers before bootstrap apply)
Final fix wave: dispatched (base e016bb2)
Final fix wave: re-review clean (commits e016bb2..4f13c44)

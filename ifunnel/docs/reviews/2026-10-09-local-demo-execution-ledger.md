# SDD ledger — plan: ifunnel/docs/plans/2026-10-09-local-demo.md
Code: worktree /Users/daothinh/ikf-platform-demo on branch feat/local-demo (cut from feat/runtime-sdk-collector @712ddb7). Billing session works in /Users/daothinh/ikf-platform-billing — never touch it.
Spec: ifunnel/docs/specs/2026-10-09-local-demo-design.md
Preflight: plan author ran every task verbatim on a clean worktree of 4f25cf4 (results recorded in plan). Ruling: no separate preflight — plan produced by executing it — cost if wrong: conflicts surface in task reviews
Pre-step: fixed PR #2 bug (event-consumer named exports rejected by workerd) in 712ddb7 before cutting the demo branch; plan's "bundle only default export" workaround stays harmless
Pre-step review: approved (712ddb7). Ruling: add .wrangler/ to .gitignore as part of demo Task 1 (demo runs miniflare/wrangler locally) — cost: none
Task 1: dispatched (base 712ddb7, implementer sonnet)
Task 1: complete (commits 712ddb7..11fc964, review clean)
Task 1: minor (deferred): docker info failure message drops real stderr; compose up failure lacks logs hint
Task 2: dispatched (base 11fc964, implementer sonnet)
Task 2: Ruling: media server must not crash on malformed percent-escapes (LAN-exposed) — implementer fixes before review: try/catch → 404 + test — cost: none
Task 2: fix round 1 dispatched (symlink escape, stream error crash, srcset rewrite, method check, tests)
Task 2: fix round 1/5 (5 addressed, 0 open; commits c923290..01c1a2a)
Task 2: complete (commits 11fc964..01c1a2a, review clean after 1 fix round)
Task 3: dispatched (base 01c1a2a, implementer sonnet)
Task 3: complete (commits 01c1a2a..cbcef9e, review clean)
Task 4: dispatched (base cbcef9e, implementer sonnet)
Task 4: complete (commits cbcef9e..857082d, review clean)
Task 4: minor (deferred): e2e tests order-dependent; LAN host path not exercised e2e; old LAN-IP hosts stay active; hardcoded default funnels dir
Task 5: dispatched (base 857082d, implementer sonnet)
Task 5: fix round 1 dispatched (second Ctrl-C force-exit, runtime --pixel warning, minors: lowercase country, README 'when online')
Task 5: fix round 1/5 (4 addressed, 0 open; commits d0db5ba..1c38558)
Task 5: complete (commits 857082d..1c38558, review clean after 1 fix round)
ALL TASKS COMPLETE. Next: final whole-branch review (712ddb7..1c38558).
Final review: Ready after fixes. I1 README/error miss `cliPluginsExtraDirs` step for brew docker-compose; I2 default funnels dir hard-coded to /Users/daothinh + funnels only on ikame `funnel` branch + demo.test no skip.
Ruling: fix I1, I2 and two minors in one wave: e2e test uses its own Postgres database + ClickHouse database (not the running demo's); apply every clickhouse/*.sql in order (not only 001) — cost: none
Final fix wave: dispatched (base 1c38558)
Final fix wave: re-review clean (1c38558..5d3627f)

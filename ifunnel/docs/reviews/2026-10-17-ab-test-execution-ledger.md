# SDD ledger — plan: /Users/daothinh/ikame-ifunnel/ifunnel/docs/plans/2026-10-17-ab-test.md
Spec: /Users/daothinh/ikame-ifunnel/ifunnel/docs/specs/2026-10-17-ab-test-design.md
Base: 7d08bc7 (feat/self-care-cancel) — Ruling D3: built in parallel with feat/custom-domains, rebased onto it before PR (only shared file: publisher/routes.js inHostTx) — cost if wrong: one rebase conflict.

## Pre-flight scan
| Pair / task | Produces vs consumes | Finding |
|---|---|---|
| T1→T2 | getExperiment → stats | consistent |
| T1→T3 | start/stop/list → HTTP | consistent |
| T1→T4 | KV arms shape → edge pickArm | consistent (spec §2 shape) |
| T3→T5 | HTTP shapes → CLI/SPA | consistent |
| each | tests vs code | ok |
Ruling D4: Tasks 1–3 batched (core), Task 4 (edge) separate in parallel — different packages, no shared files.
Task 4: complete (4e3de68 + fix c959a1d err.name restore; reviewed by controller: pickArm unbiased, cookie validated, no fallback)
Tasks 1-3: implemented 7cb64de dacf774 a4dec9d (888 tests); review pending
Task 5: implemented 32931c8; review pending
Task 5: complete (32931c8; review ✅/Approved, 5 minors parked → final fix wave: shared-host A/B button grant, rpv precision, hook cleanup)
Fix round 1: 3c761aa (891 tests); re-review pending
Tasks 1-3: complete (7cb64de dacf774 a4dec9d + fix 3c761aa; re-review addressed I1-I3; 013 edited in place OK — never applied anywhere, pre-release)
Task 6: complete (0118757; ab-e2e 2/2 runs green, demo unit 124). Final review after rebase onto feat/custom-domains.
Rebased onto feat/custom-domains (b04987a): conflicts resolved by keeping both sides (migrate.test list 012+013, ErrorNote map, Domains.jsx state/buttons, cli main.js, CLAUDE.md, demo/README). New range b04987a..0e891a1. Final review pending.
Final review: Ready with fixes → fix wave 7b09d9b..7749c1b → re-review Approved. Deferred M7–M9 (PR note).

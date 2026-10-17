# SDD ledger — plan: /Users/daothinh/ikame-ifunnel/ifunnel/docs/plans/2026-10-17-custom-domains.md
Spec: /Users/daothinh/ikame-ifunnel/ifunnel/docs/specs/2026-10-17-custom-domains-design.md
Base: 7d08bc7 (feat/self-care-cancel)

## Pre-flight scan
| Pair / task | Produces vs consumes | Finding |
|---|---|---|
| T1→T2 | createSaasClient/mapDnsStatus/kv.delete → custom.js | consistent |
| T2→T3 | add/check/remove/startDomainChecks → http + server | consistent; platformZone source unknown → T3 resolves (ruling in brief) |
| T3→T4/T5 | HTTP shapes (spec §2) → CLI/SPA | consistent |
| T3→T7 | deps.saas injection → demo fake | consistent (fetch-injected client) |
| T6 | infra only | standalone |
| each task | tests vs code self-consistent | ok |

Ruling D1: tasks 1–3 batched to one implementer (shared core files, sequential interfaces) — fewer handoffs — cost if wrong: a larger review package.
Ruling D2: tasks 4–5 (CLI + SPA) batched to one implementer — same HTTP contract, different files.
Tasks 1-3: implemented 8b44cc0 2ed1a85 c57e7cc (core 940 tests); review pending
Ruling D5: active row → dns_status 'moved' only per spec §1 mapping (hostname moved/deleted or ssl deleted/expired); other non-active states (e.g. pending_renewal) leave dns_status unchanged — avoids false alarms — cost if wrong: a real outage shows later.
Ruling D6: checkDomain/checkDue read Cloudflare BEFORE taking the domain row lock, then lock + apply — publish never waits on Cloudflare — cost if wrong: two concurrent checks write the same result (idempotent).
Tasks 4-5: implemented 3f4bdae 5ad6ec9; review pending
Tasks 4-5: complete (3f4bdae 5ad6ec9; review ✅/Approved, 6 minors → final fix wave: domain_pending/domain_custom messages, stale records after check, button on list failure)
Fix round 1: 2a2b381 (950 tests). Ruling D7: Cloudflare 404 on check → active row dns_status 'moved', pending row 'failed'; goes into final fix wave — cost if wrong: a deleted hostname shows a warning (correct outcome anyway).
Tasks 1-3: complete (8b44cc0 2ed1a85 c57e7cc + fix 2a2b381; re-review addressed D5/D6)
Task 6: complete (c43be84; controller review: resources match spec §5, validate+tests green)
Ruling D8 (spec gap found in Task 6 review): Turnstile widget domains are Terraform-managed (turnstile_extra_domains), so a custom domain would fail Turnstile at checkout and on /_ikf/account. Core owns the widget's domain list for custom hosts: add the host when it turns active, remove it on Gỡ (read-modify-write via Turnstile widget API, account-level; the saas token also needs Account › Turnstile › Edit; env CF_ACCOUNT_ID + TURNSTILE_SITEKEY). Terraform: lifecycle ignore_changes = [domains] on the widget. Runbook: Cloudflare caps hostnames per widget by plan (Turnstile Enterprise for more). Final fix wave — cost if wrong: one more API permission.
Task 7: complete (b4ad9c5; demo:test 149). Note: loop wait 5 min hard-coded → final fix wave makes it configurable (demo 2 s)
Final review: Ready with fixes (C1 D8 Turnstile, I1 D7, I2 loop wait, I3 *\/* bypass hosts, I4 Paddle approval doc). Ruling D9: TURNSTILE_MAX_DOMAINS default 10; at cap addDomain → 409 turnstile_domain_limit — cost if wrong: an admin must raise the env after upgrading the plan.
Final fix wave: 64454fc 90311a7 2a770ff b04987a (C1/D8+D9, I1/D7, I2+M5, I3, I4, M1-M4, M6, M8-M10). M7 ruling: runbook note only — Cloudflare renews non-wildcard proxied custom hostnames pointing at us by HTTP DCV whatever the first method (docs "Renew certificates"); no dns_records refresh on active rows. Token choice: one cf-saas-api-token with Account › Turnstile › Edit added (no separate secret). Suites: core 987, admin 292 + build, cli 284, edge-router 112, terraform edge 18 / stack 13, demo:test 149.

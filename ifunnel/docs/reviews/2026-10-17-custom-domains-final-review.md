# Final whole-branch review: custom domains (feat/custom-domains, 7d08bc7..b4ad9c5)

Reviewer: read-only. Authority: spec `ifunnel/docs/specs/2026-10-17-custom-domains-design.md` + ledger rulings D1–D8.

Tests run here (colima, `TESTCONTAINERS_RYUK_DISABLED=true`, socket override = colima socket):
core-api 89 files / 950 tests green · admin 286 green · cli 283 green · edge-router 112 green. `demo:test` not run (another agent); Task 7 reports 149 green.

## Verdict: **Ready with fixes**

The core, CLI, SPA, Terraform and demo fit together. I found no seam breaks:
- **Core and SPA/CLI:** the shapes agree: `{domain}`, 204, `custom_domains`, `source`/`dns_*`, and `detail.routes`.
- **Core and Terraform:** `CF_SAAS_ZONE_ID = var.zone_id`, `CF_SAAS_CNAME_TARGET = module.edge.fallback_origin`, and the secret is in `secret_names`, which the task role reads.
- **Core and demo:** core's real `createSaasClient` gets a fake `fetch` through `deps.saas`. Nothing in `services/` changed for the demo.

The other areas hold:
- **Locks:** domains rows only, Cloudflare outside the lock (D6).
- **Logs:** codes only, no `err.message`.
- **Audit:** same transaction, no PII.
- **Add race:** adopt on 1406, `ON CONFLICT DO NOTHING`.

The SDK and edge-router are untouched.

One Critical blocks the merge: D8. Without it, a funnel on a custom domain cannot take a payment, which is the point of the feature. Two operability gaps sit next to it: the runbook does not cover the `*/*` side effects or the Paddle website approval. D7 and the loop wait are Important. All of these fit in one fix dispatch.

## Findings

| # | Sev | File:line | Problem | Concrete fix |
|---|---|---|---|---|
| C1 | Critical | `infra/modules/edge/main.tf:195-199` (widget), `services/core-api/src/billing/checkout.js:65`, `src/http/account.js:62` | **D8 not implemented.** The Turnstile widget only knows `zone_name + keys(var.funnel_domains)`. On a custom host the widget does not render or verify, so checkout answers `403 turnstile_failed` and `/_ikf/account` answers `400 turnstile_failed`. A verified custom domain looks publishable but cannot sell. | See fix brief §1 (widget client, reconcile under an advisory lock, Terraform `ignore_changes`, env/permission, per-plan cap). |
| I1 | Important | `services/core-api/src/domains/cloudflare.js:66-68` + `custom.js:127-132`, `loop.js:27,32-35` | **D7 not implemented.** A hostname deleted in the Cloudflare dashboard (or a remove that deleted at Cloudflare but failed to commit) makes `get` throw code `1436`/`http_404`. **Kiểm tra** answers 502 forever, and the loop logs `domain check failed` every 5 min (pending) or 6 h (active). The console never shows anything. | See fix brief §2. |
| I2 | Important | `services/core-api/src/domains/loop.js:14-16, 18, 40` + `demo/lib/stack.mjs:125-127` | **Loop wait is hard-coded** (`interval '5 minutes'` / `'6 hours'`). The demo's 2 s tick does nothing for a new host for 5 min, so the DoD path "within one check" only works through **Kiểm tra**. The e2e backdates `dns_checked_at` in SQL to test the loop (`demo/test/domains-e2e.test.mjs:162`). | See fix brief §3. |
| I3 | Important | `docs/runbooks/admin-console.md:93-107`, `infra/modules/edge/main.tf:72-81` | **`*/*` route side effects are undocumented.** Every proxied hostname on the platform zone that has no more specific route now runs edge-router and answers 404. That includes a hand-made apex or `www`, a status page, or anything else added outside Terraform. Today Terraform covers `api` (bypass), `admin` and `preview` (own routes) and `fallback`. Workers Custom Domains and non-proxied records (ACM, DKIM) are not affected. | Runbook step 0 before the first apply: list the zone's proxied records (`GET /zones/<id>/dns_records?proxied=true`). Every host that is not api, admin, preview, fallback or a funnel host needs a scriptless route. Add `variable "worker_bypass_hosts" { type = list(string), default = [] }` in `modules/edge`, with one scriptless `cloudflare_workers_route` per host (`for_each`), plus a module test. Say in CLAUDE.md that a new non-Worker proxied host on the platform zone needs an entry there. |
| I4 | Important | `docs/runbooks/admin-console.md:109-130` (vs `docs/runbooks/billing-paddle.md:17`) | **Paddle live checkout needs each funnel host approved as a website** (billing runbook l.17). The custom-domain flow and the FunnelFox move steps never say so, so checkout fails in prod on a fresh custom domain even after D8. | Add to §9 "Add a domain" and to "Move a live FunnelFox domain" (before the CNAME switch): approve `https://<host>` in Paddle › Checkout › Website approval (live) and set nothing else. Also add one line to the SPA "Trỏ DNS" card (prod only is fine as plain text: "Checkout cần duyệt website trong Paddle"). |
| M1 | Minor | `apps/admin/src/components/ErrorNote.jsx:3-13`, `packages/cli/src/main.js:681-689` | Parked T4-5 #1: `domain_pending` and `domain_custom` show the raw code. | SPA: `domain_pending: 'Domain chưa xác thực DNS, chưa publish được'`, `domain_custom: 'Domain riêng: trạng thái do kiểm tra DNS quyết định'`. Add the same sentences to the CLI `formatApiError`, plus one test each. |
| M2 | Minor | `apps/admin/src/pages/Domains.jsx:157-168` | Parked T4-5 #2 (corrected): the merge does replace `dns_records` with `null` (core sends the key), but the "Trỏ DNS" card stays open with an empty table after pending → active. | In `check()`, when `r.domain.status === 'active' && !r.domain.dns_records`, drop the host from `open` and set the notice `Đã xác thực ${host}: Publish đã chọn được host này.` Add a test. |
| M3 | Minor | `apps/admin/src/pages/Domains.jsx:280` | Parked T4-5 #3: if the list fails, **Thêm domain** disappears (it renders only after the first answer). | Render the help button when `domains === null && error` too (help text). Add a test. |
| M4 | Minor | `services/core-api/src/domains/custom.js:11-18` | `normalizeHost` accepts IP literals (`127.0.0.1`, `1.2.3.4`). Cloudflare refuses them, and the console shows the misleading `502 cloudflare_unavailable`. | Refuse a last label that is all digits (`/\.\d+$/` → `invalid_host`). Add a test. |
| M5 | Minor | `services/core-api/src/domains/loop.js:14-16` | A `failed` (abandoned) pending row is read every 5 min forever. Each one is 288 Cloudflare GETs a day and holds a slot in the 50-row tick. | With I2, make `dns_status = 'failed'` rows due on the active window (6 h). **Kiểm tra** still forces a read. |
| M6 | Minor | `docs/runbooks/admin-console.md:109-117` vs spec decision #6 | After about 14 days Cloudflare stops DCV (ssl `validation_timed_out`), and a read cannot restart it, so "Kiểm tra retries" (spec) is only true for a host that verifies late. The runbook already says remove and add again, which is correct. | Keep the runbook wording. Change the SPA `failed` badge title to "Chưa xác thực sau 14 ngày: Gỡ rồi thêm lại". The spec text needs no code change. |
| M7 | Minor | `services/core-api/src/domains/custom.js:104-107` | On an active row, a certificate that needs new TXT tokens at renewal (`pending_validation`) leaves `dns_status 'active'` and hides `dns_records` (D5). If Cloudflare cannot renew through HTTP DCV (CNAME not on us), the owner never sees the new TXT before expiry. Expiry is then a `moved` warning with stale records. | Verify against the Cloudflare renewal docs. If TXT renewal is manual, refresh `dns_records` on active rows whenever `cf.records` has a certificate record. Optionally show them without changing `dns_status`. Otherwise add a runbook note. |
| M8 | Minor | `docs/runbooks/admin-console.md:109-130` | Missing operational notes: (a) `sync-domains.sh` exits 1 on `409 domain_custom` if a host in `funnel_domains` already exists as custom; (b) an add whose DB insert failed leaves an orphan Cloudflare hostname (a re-add adopts it; otherwise it counts toward the SaaS hostname quota, 100 on non-Enterprise plans); (c) remove holds the row lock across the Cloudflare DELETE (≤ 10 s; retry is safe). | Add three bullets to §9, including a `curl …/custom_hostnames?hostname=` + `DELETE` recipe for orphans. |
| M9 | Minor | `CLAUDE.md:34` and the "Local demo" paragraph | The test env in CLAUDE.md does not work on colima (needs `TESTCONTAINERS_RYUK_DISABLED=true` and the override = colima socket; noted by re-review fix1). The Local demo paragraph lacks the domains e2e ports and DB and the panel on 8791 without the purchase flow. | Fix the export lines. Add "custom domains: fake Cloudflare SaaS (`demo/lib/fake-cf-saas.mjs`), panel Domains on 8791, e2e `demo/test/domains-e2e.test.mjs` on 8967/8268/8969/8971/8972, database `ikf_domains_test`". |
| M10 | Minor | `services/core-api/test/domains-loop.test.js` | Re-review fix1: no test for the `applyIfDue` skip when a row is no longer due under the lock. | Add it (a second "check" bumps `dns_checked_at` between the candidate read and apply → `checked` excludes it, no audit). |

Parked minors **not** to fix (accepted): T4-5 #4 (shared `recordsError`/`checking`), #5 (CopyButton never resets; 2-label apex heuristic per spec), #6 test hygiene beyond M1–M3; T1-3 `hostParams` case on `check`/`DELETE` (console/CLI send listed hosts), `maxLength` before trim.

## Fix wave brief (one dispatch)

Branch `feat/custom-domains`, TDD, one commit per item group, then the full core/admin/cli/edge suites, `terraform test` in `modules/edge` + `stack`, `terraform fmt -check -recursive infra`, and `npm run demo:test` (only when no other demo run holds the ports).

**1. D8, Turnstile widget domains (C1).** Ruling to record as D9 if the controller agrees: the cap is enforced at add time.
- `services/core-api/src/domains/turnstile.js` (new): `createWidgetClient({ accountId, sitekey, apiToken, fetch })`.
  - `get()` → `{ name, mode, domains }` via `GET /accounts/{account_id}/challenges/widgets/{sitekey}`.
  - `setDomains(domains)` → `PUT` same path with `{ name, mode, domains }` (PUT needs the full body; take name/mode from the `get`).
  - Errors as `CloudflareError`-style codes only, 10 s timeout, no body in messages.
- Reconcile `syncWidgetDomains(pool, widget, { platformZone, log, remove = [] })`:
  - Desired = current widget domains ∪ every `domains.status = 'active'` host (**both sources**: Terraform hosts arrive through `sync-domains.sh`, and Terraform will stop updating the list, see below) that is not the platform zone or under it, minus `remove`.
  - PUT only when the set differs.
  - Serialised across core tasks by `pg_try_advisory_lock(<fixed key>)` on a dedicated connection, released in `finally`. If the lock is not acquired, skip; the next tick retries.
  - No `domains` row lock held during the HTTP calls (as D6).
  - Log `{code}` only.
- Call sites:
  - **Loop:** at the end of each `checkDue` tick, the reconcile self-heals any earlier failure. Run it even when no row was due, but at most every N ticks or on change; one GET per 5 min is fine.
  - **checkDomain:** after a commit that turned the row active, best effort.
  - **removeDomain:** after the commit, `remove: [host]`. On failure log a warning; the entry stays, which is harmless.
- **Cap:** env `TURNSTILE_MAX_DOMAINS` (default `10`, the non-Enterprise per-widget limit; Enterprise raises it). `addDomain` answers `409 turnstile_domain_limit` when `widget.domains.length + (custom rows pending or active not yet on the widget) >= cap`. Widget unreachable during add → `502 cloudflare_unavailable`; don't add blindly. SPA + CLI message: "Đã đủ số domain Turnstile cho phép (gói Cloudflare), liên hệ kỹ thuật".
- **Off switch:** the widget client exists only when `CF_ACCOUNT_ID`, `TURNSTILE_SITEKEY` and the saas token are set. Otherwise core logs `turnstile domains sync disabled, missing: …`, skips the cap check and keeps the feature working (staging without billing). Wire it in `domains/setup.js` / `server.js` / `app.js` deps (`deps.turnstileWidget`).
- **Terraform:**
  - `modules/edge` `cloudflare_turnstile_widget.this`: `lifecycle { ignore_changes = [domains] }` (comment: core owns the list after creation).
  - `stack/main.tf` core env: `TURNSTILE_SITEKEY = module.edge.turnstile_sitekey`. `CF_ACCOUNT_ID` is already there (l.173).
  - Stack test asserts the env.
- **Runbook §9 step 3:**
  - The token also needs **Account › Turnstile › Edit** on the account (or a separate secret `cf-turnstile-api-token`, the least-privilege alternative; pick one and record it).
  - Note the per-plan hostname cap.
  - Terraform `turnstile_extra_domains` is now applied at creation only: later Terraform hosts reach the widget through core once `sync-domains.sh` marks them active.
- **CLAUDE.md:** custom-domains bullet: widget domains are core's; `ignore_changes`.
- **Tests:**
  - Client: method/path/body, error codes.
  - Reconcile: adds an active custom host, keeps the Terraform entries, removes on Gỡ, no PUT when equal, lock not taken → skip.
  - Add refused at the cap.
  - Feature off without sitekey.
  - The demo injects nothing (widget off) unless it is trivial to fake. If it is, add one assertion in `fake-cf-saas` style.

**2. D7, Cloudflare 404 on check (I1).**
- `cloudflare.js` `call`: for op `get`, HTTP 404 (any code, incl. 1436) → `CloudflareError('get', 'not_found')`.
- `custom.js`:
  - `checkDomain` and the loop map `not_found` to a synthetic read, e.g. `cf = { gone: true, records: [] }`.
  - `applyCheck`: `gone` on a pending row → `dns_status 'failed'` (status stays pending, records kept). On an active row → `'moved'` (status stays active; audit `domain.dns_moved` only on entry, as D5).
  - `checkDomain` answers 200 with the row, not 502.
  - The loop logs `domain_check` with the new `dns_status`, not a failure.
- **Tests:** client 404 → `not_found`; check pending/active; loop; the fake already answers 404/1436.
- SPA/CLI need no change (`failed`/`moved` badges exist).

**3. Configurable loop wait (I2, M5).**
- `loop.js`:
  - `checkDue(pool, saas, { now, limit, pendingEveryMs = 300_000, activeEveryMs = 21_600_000 })`.
  - `due(nowParam, pendingParam, activeParam)` uses `($n * interval '1 millisecond')`.
  - Failed pending rows (`dns_status = 'failed'`) use the active window (M5).
  - `applyIfDue` gets the same dueSql and params (`$3,$4,$5`; params `[now, pendingEveryMs, activeEveryMs]`).
  - `startDomainChecks({ …, intervalMs, pendingEveryMs, activeEveryMs })`. Production defaults unchanged; no env.
- `demo/lib/stack.mjs`: pass `pendingEveryMs: domainCheckMs` and `activeEveryMs: 10_000`. Fix the comment at l.125-127.
- e2e:
  - After **Xác thực DNS**, assert the row turns Active **without** Kiểm tra (loop path of the DoD). Keep one Kiểm tra assertion elsewhere, or on a second host if cheap.
  - Replace the SQL backdate at `domains-e2e.test.mjs:162` with waiting for the 10 s active window, or keep it if timing is tight, with a comment.
- README text "within 2 s".
- Tests: due selection with custom windows; `applyIfDue` skip when no longer due (M10).

**4. Operability (I3, I4, M6, M8).**
- `modules/edge`: `worker_bypass_hosts` + scriptless routes + test.
- Runbook §9: step 0, list the proxied records; Paddle website approval in "Add a domain" and in the FunnelFox move (before the CNAME switch); the three M8 notes.
- SPA: the `failed` badge title (M6) and the Paddle hint line in `DnsRecords`.

**5. Parked minors to fix:** M1 (`domain_pending` / `domain_custom` messages, SPA + CLI), M2 (close the card after verify), M3 (button when the list fails), M4 (IP literal → `invalid_host`), M9 (CLAUDE.md test env + Local demo paragraph), M10 (loop skip test). M7: check the Cloudflare docs and either refresh certificate records on active rows or add a runbook note. Record which one in the ledger.

**Do not touch:** `packages/sdk`, `workers/` (the edge-router stays unchanged), migration 012 (no schema change is needed for the items above).

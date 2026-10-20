# Final re-review: custom domains fix wave (64454fc 90311a7 2a770ff b04987a)

Reviewer: read-only, scoped to final-review.md findings C1, I1–I4, M1–M10 and rulings D5–D9.
Tests run here: `npm test -w @ikf/core-api -- domains turnstile` (colima env): 8 files / 132 tests green.
`demo:test` was not run (as instructed). The other suites (core 987, admin 292, cli 284, edge-router 112, terraform
edge 18 / stack 13, demo 149) are as the implementer reported. I did not re-run them.

## Verdict: **Approved**

No Critical or Important finding remains. The minors below are optional follow-ups and do not block the merge.

## Findings checked

| # | Status | Evidence |
|---|---|---|
| C1 / D8 | Fixed | See the Turnstile section below. |
| D9 cap | Fixed | `checkWidgetRoom` (custom.js): `widget.domains.length + uncovered custom pending/active >= max` → `409 turnstile_domain_limit {max}`. The arithmetic is right: 9 listed + 0 waiting, max 10 → allowed. A covered host takes no slot. Widget down → `502 cloudflare_unavailable` before `saas.create` (tested: no Cloudflare call, no row). `TURNSTILE_MAX_DOMAINS` is validated in config (positive integer, default 10). Terraform sets it as `tostring(var)`. |
| I1 / D7 | Fixed | `cfRequester` `notFound` applies to `get` only (DELETE keeps `okStatus: 404`). `readHostname` returns `{gone, records: []}`. `applyCheck` turns pending into `failed` with records kept, and active into `moved` with the audit written only on entry. `checkDomain` answers 200. The loop logs `domain_check`. |
| I2 / M5 / M10 | Fixed | The due SQL is parameterised (`$n::double precision * interval '1 millisecond'`). `failed` pending rows use the active window. `applyIfDue` gets the same predicate with `$3..$5` after host/id, so the parameter order is right. The demo passes 2 s / 10 s. The e2e verifies through the loop alone, with no SQL backdate. |
| I3 | Fixed | `worker_bypass_hosts` is validated and creates one scriptless `cloudflare_workers_route` per host, wired envs → stack → edge. 3 module tests. Runbook step 0 and a CLAUDE.md line. |
| I4 | Fixed | Runbook covers Paddle approval for Add and for the FunnelFox move (before the CNAME switch). The SPA `DnsRecords` shows a Paddle note. |
| M1 | Fixed | SPA and CLI show the same sentences for `domain_pending`, `domain_custom` and `turnstile_domain_limit`. |
| M2 | Fixed | The card closes and the notice shows when the row is active and `!dns_records`. |
| M3 | Fixed | The button renders on `domains !== null \|\| error`. |
| M4 | Fixed | `/\.\d+$/` → `invalid_host`. |
| M6 | Fixed | Badge title updated. |
| M7 | Fixed | Runbook note only, with the ruling recorded in the ledger (HTTP DCV at renewal). Accepted. |
| M8 | Fixed | Three runbook notes. |
| M9 | Fixed | CLAUDE.md colima env and demo paragraph. |

## Turnstile widget sync (special care)

- **Advisory lock:** `pg_try_advisory_lock(WIDGET_LOCK_KEY)` runs on a dedicated pooled connection, so each sync has its own session and concurrent syncs, in-process or across tasks, exclude each other.
  - The unlock is in `finally`. If the unlock fails, `release(true)` destroys the connection, so a session lock never stays on a pooled connection.
  - If `connect` or the try-lock query fails, the outer catch handles it and no lock was taken.
  - No `domains` row lock is held during the HTTP calls (D6).
- **Read-modify-write, not a full rewrite:** desired = the current widget list minus `remove`, plus active hosts that are not under the platform zone and not covered.
  - Entries core does not know about (Terraform `turnstile_extra_domains`, hand-added ones) are never dropped.
  - Only an explicit `remove` takes an entry off.
  - There is no PUT when the set is equal.
  - The PUT sends back name, mode and the known optional settings from the same GET. The widget secret is stripped by `view` and never stored.
  - The widget PUT does not rotate the secret, because rotation is a separate endpoint.
- **Failure handling:** `syncWidgetDomains` never throws. It answers `{error}` or `{skipped}`.
  - The check still answers active when the widget is down (tested).
  - The loop's sync runs after a tick that verified, otherwise every 5 min, with `lastSync` starting at `-Infinity`. A failed add therefore heals by itself (tested in the loop).
- **Logs:** `{code}` only (CloudflareError code or pg code), plus `{count}` on success. No message, body or token is logged.
- **Token scope:** one hand-made `cf-saas-api-token` with Zone › SSL and Certificates › Edit (platform zone) and Account › Turnstile › Edit. This is documented in runbook §9 step 3 and the ledger. The token is not a Terraform resource, so no permission group is missing in IaC.
- **Terraform:**
  - `lifecycle { ignore_changes = [domains] }` is set on `cloudflare_turnstile_widget.this`.
  - A `state_key` test proves a later `turnstile_extra_domains` change is ignored.
  - The stack test asserts `TURNSTILE_SITEKEY`, `TURNSTILE_MAX_DOMAINS` and `CF_ACCOUNT_ID`.
- **Wiring:** `domainsDeps` → `deps.turnstileWidget` is spread into `buildApp`, and `domainsHttp` passes it to add, check and remove. `server.js` passes it to the loop with `platformOf(previewBaseUrl).platformZone`. Without the account id or sitekey, it logs `turnstile domains sync disabled, missing: …` and custom domains still work.

No regression found. Terraform-source rows and the edge-router are untouched. The `get` 404 mapping does not affect `remove` (`okStatus`) or `find`.

## Implementer's concerns

1. **Stale widget entry after a skipped or failed Gỡ sync: accepted (minor).**
   - The window is small: the loop holds the lock for one GET and maybe one PUT, every 5 min per task.
   - The effect is limited:
     - The entry holds one cap slot.
     - A third party who controls that hostname could render our widget. That only yields anti-bot tokens, which is low value.
   - Optional follow-up:
     - In `removeDomain`, take the lock blocking with a short `lock_timeout` (lock_timeout applies to advisory lock waits) instead of try-lock.
     - Add one runbook line: remove a leftover entry in dashboard › Turnstile › widget › Hostname management.
2. **Cap enforced only at add: accepted, per ruling D9.**
   - Known edge: Terraform hosts can push the list past the cap. Every reconcile PUT then fails, including removals, and logs the Cloudflare code every 5 min until someone fixes it by hand.
   - Two concurrent adds can both pass the room check (no lock). This needs two global admins at the same moment, so it is negligible.
3. **Demo runs with the widget sync off: accepted.**
   - The client is covered by unit tests with a fake fetch.
   - The reconcile, cap, add, check, remove and loop paths are covered by integration tests on real Postgres with a fake widget.
   - The demo's Turnstile is fake anyway.
4. **Missing `TURNSTILE_SITEKEY`: accepted.**
   - In staging and prod, Terraform always sets it from `module.edge.turnstile_sitekey`, so the off path is for local or hand-run setups only.
   - It is logged at boot. The runbook says custom domains then cannot pass Turnstile.

## Remaining Critical / Important

None.

## Optional minors (non-blocking)

- m1: `removeDomain` widget sync uses a blocking advisory lock with a short timeout instead of try-lock. Add a runbook recipe for removing a leftover widget entry by hand.
- m2: The PUT carries only the known optional widget settings (`SETTINGS`). A future Cloudflare optional field would be reset to its default on PUT. Revisit if the API grows.

# Custom Domains in Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** a global admin adds a funnel domain from Admin/CLI; Cloudflare for SaaS verifies it; it turns `active` by itself and becomes publishable.

**Architecture:** new `domains.status = 'pending'` + `source` column (migration 012); a Cloudflare custom-hostnames client and `src/domains/custom.js` (add/check/remove + a 5-min check loop) in core-api; three HTTP routes; CLI and SPA on top; Terraform adds the fallback origin and the `*/*` Worker route; the demo gets a fake custom-hostnames API. The edge-router does not change.

**Tech Stack:** Node ESM, Fastify 5, Postgres 17 (Testcontainers via colima: `export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock`), Vitest, React SPA (Vite), Terraform (Cloudflare provider v5), Playwright demo e2e.

**Spec:** `ifunnel/docs/specs/2026-10-17-custom-domains-design.md` (read it first; it is the authority).

**Worktree:** `/Users/daothinh/ikf-platform-domains`, branch `feat/custom-domains` (base `feat/self-care-cancel`, 7d08bc7).

**Ruling P0:** like the self-care plan, this plan is not scratch-verified: tasks give interfaces, files and the tests to write; the implementer writes the code test-first, following the neighbouring code's style.

## Global Constraints

- Logs: never an email, `user_id`, token, `err.message` of third-party/SQL errors, SQL params, IP or UA. Cloudflare errors are logged by Cloudflare error code / HTTP status only.
- Audit: no PII; `audit(c, actor, action, target, details, {app_id})` from `src/audit.js`.
- Lock order: `domains` rows first (`FOR UPDATE`, host ascending), then `funnels` (CLAUDE.md).
- Migrations take `SET LOCAL lock_timeout = '5s'` before an ALTER of a hot table.
- The demo must not change `services/`, `workers/` or `packages/`; fakes enter only through `buildApp({deps})`.
- Commit trailer: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. No bare `git stash`.
- SDK bundle size must not change; every existing test keeps passing.
- Copy in the SPA/CLI is Vietnamese like the rest of the console; error codes English.

## Review Focus

1. A host typed with uppercase, spaces or a trailing dot → normalized or `400 invalid_host`, never a second row for the same host.
2. Two admins add the same host at once → one row, one Cloudflare hostname (unique host PK + adopt-on-duplicate).
3. Cloudflare down during add → no row left behind; during remove → row kept.
4. A live funnel's domain whose DNS moves away is **never** auto-disabled.
5. `sync-domains.sh` re-run after the migration never flips a custom row's status.

---

### Task 1: Migration 012 + Cloudflare SaaS client + `kv.delete`

**Files:**
- Create: `services/core-api/migrations/012_custom_domains.sql` (spec §1 verbatim)
- Create: `services/core-api/src/domains/cloudflare.js`
- Modify: `services/core-api/src/publisher/route-kv.js` (add `delete(key)`, same error style as `put`; 404 = done)
- Test: `services/core-api/test/domains-cloudflare.test.js`, `services/core-api/test/route-kv.test.js` (extend), migration test pattern of `test/migrations*.test.js` if one exists (otherwise a test that applies all migrations and checks the new check constraint accepts `pending` and `source` defaults to `terraform`).

**Interfaces (produces):**
- `createSaasClient({ zoneId, apiToken, cnameTarget, fetch? })` →
  - `create(host)` → `{ id, status, ssl_status, records }`
  - `get(id)` → same shape; `findByHost(host)` → same shape or `null` (`GET /zones/{zone}/custom_hostnames?hostname=<host>`)
  - `remove(id)` → `undefined` (HTTP 404 = done)
  - errors: `class CloudflareError extends Error { code /* cloudflare error code or 'http_<status>' or 'timeout' */ }`; `create` on Cloudflare error code `1406` (duplicate) throws `CloudflareError` with `code: 'duplicate'`.
  - `records`: `[{ type: 'CNAME', name: host, value: cnameTarget, purpose: 'route' }, { type: 'TXT', name, value, purpose: 'ownership' } (from ownership_verification, when present), { type: 'TXT', name: txt_name, value: txt_value, purpose: 'certificate' } (each ssl.validation_records item with txt_name)]`
  - base `https://api.cloudflare.com/client/v4`, header `authorization: Bearer`, `AbortSignal.timeout(10_000)`, POST body exactly spec §2.
- `mapDnsStatus({ status, ssl_status })` → `'active' | 'moved' | 'pending'` (spec §1 mapping).

- [ ] Write failing tests (fake `fetch` capturing method/url/body; record mapping from a realistic Cloudflare payload; 404 delete; duplicate code; timeout → code `timeout`; error message never contains the response body)
- [ ] Run `npm test -w @ikf/core-api -- domains-cloudflare route-kv` → fail
- [ ] Implement; run → pass; run the whole core-api suite
- [ ] Commit `feat(core): custom domains migration 012 + Cloudflare SaaS client`

### Task 2: `src/domains/custom.js` + guards in publish and setDomain + check loop

**Files:**
- Create: `services/core-api/src/domains/custom.js`, `services/core-api/src/domains/loop.js`
- Modify: `services/core-api/src/publisher/routes.js` (`inHostTx`: `pending` → `409 domain_pending`), `services/core-api/src/publisher/domains.js` (`setDomain`: `custom` row + `status` → `409 domain_custom`; `pending` row + `status: 'active'` → `409 domain_pending`; app assignment unchanged)
- Test: `services/core-api/test/domains-custom.test.js`, `services/core-api/test/domains-loop.test.js`, extend the routes/domains tests for the guards

**Interfaces:**
- Consumes: Task 1 client (pass a fake object with the same methods in tests), `mapDnsStatus`, `kv.delete`.
- Produces:
  - `normalizeHost(raw)` → host string or throws `HttpError(400, 'invalid_host')` (trim, lowercase, strip nothing else; regex + ≤ 253; trailing dot → invalid)
  - `addDomain(pool, saas, { host, appId, actor, platformZone, previewHost })` → domain row (shape of `GET /v1/domains` item). Order: validate → reserved/exists checks → `saas.create` (on `duplicate` → `saas.findByHost` and adopt) → one transaction: INSERT `domains (host, status 'pending', source 'custom', cf_hostname_id, dns_status 'pending', dns_records, dns_checked_at now(), app_id)`, INSERT `host_revs`, audit `domain.add`. Unique violation on insert (race) → `409 domain_exists` and **do not** delete the Cloudflare hostname (the other request owns it).
  - `checkDomain(pool, saas, host, { actor, now })` → updated row. `SELECT … FOR UPDATE`; `terraform` → `409 domain_not_custom`; read Cloudflare; pending→active: `status 'active'`, `dns_status 'active'`, `dns_records` kept, audit `domain.verified`; active→moved: `dns_status 'moved'`, status unchanged, audit `domain.dns_moved`; moved→active: `dns_status 'active'`; pending older than 14 days (`created_at`) and not active → `dns_status 'failed'`; always `dns_checked_at = now`.
  - `removeDomain(pool, saas, kv, host, { actor, log })`: lock row; `terraform` → `409 domain_not_custom`; routes exist → `409 domain_has_routes {routes:[{prefix, slug}]}`; `saas.remove` (error → `502 cloudflare_unavailable`, rollback); DELETE `host_revs`, DELETE `domains`; audit `domain.remove`; COMMIT; then `kv.delete(routeKey(host))` (failure → `log.warn({host, code}, 'kv delete failed')`).
  - `checkDue(pool, saas, { log, now, limit = 50 })` → `{ checked }`: rows `source='custom' AND ((status='pending' AND (dns_checked_at IS NULL OR dns_checked_at < now - 5 min)) OR (status='active' AND dns_checked_at < now - 6 h))`, oldest first, `FOR UPDATE SKIP LOCKED` per row (one short transaction per row), Cloudflare error on one row → log code, continue.
  - `startDomainChecks({ pool, saas, log, intervalMs = 300_000 })` → stop function (same shape as `startResync`).
- Actor for the loop: `{ kind: 'system', name: 'domain-check' }` — check `actorOf` in `src/audit.js` accepts it; if the audit actor kinds are constrained by a CHECK (see migrations 005/011), use the existing system/token kind that fits and record the ruling in the report.

- [ ] Failing tests for every row of spec §7 "add", "check", "loop", "remove", "publish", "sync script path" (Postgres via Testcontainers, fake saas, fake kv)
- [ ] Implement; whole core-api suite green
- [ ] Commit `feat(core): add, check and remove custom domains; pending hosts refuse routes`

### Task 3: HTTP routes + config + server wiring

**Files:**
- Modify: `services/core-api/src/http/domains.js` (add `POST /v1/domains`, `POST /v1/domains/:host/check`, `DELETE /v1/domains/:host`, all `requireGrant(pool, 'admin', { app: 'global' })`), the `GET /v1/domains` handler (find it with `grep -rn "'/v1/domains'" services/core-api/src`) adds `custom_domains` and the new item fields (spec §2), `services/core-api/src/config.js` (`CF_SAAS_ZONE_ID`, `CF_SAAS_CNAME_TARGET`, optional), `services/core-api/src/server.js` (secret `cf-saas-api-token`; when zone id, target and token are all present build the client, pass `saas` into `buildApp` deps and `startDomainChecks`; otherwise log `custom domains disabled, missing: …` like the other features), `services/core-api/src/app.js` (thread `deps.saas`, `platformZone` = the zone name already known to config — find how `PREVIEW_BASE_URL`/preview host is derived and derive the platform zone from config; if none exists add `PLATFORM_ZONE` env)
- Test: `services/core-api/test/http-domains.test.js` (extend or create): grants as today (non-global person → 403 on writes), schemas (`host` string ≤ 253, `app_id` pattern), `503 custom_domains_unavailable` without saas, `201` body shape, `custom_domains` flag in the list, new item fields hidden for terraform rows.

- [ ] Tests → fail → implement → pass; full suite
- [ ] Commit `feat(core): custom domain routes and wiring`

### Task 4: CLI

**Files:** `packages/cli/src/main.js` (+ `api.js`): `ikf domain add <host> [--app <id>]` prints the records table and "Trỏ DNS xong thì chạy: ikf domain check <host>"; `ikf domain check <host>`; `ikf domain rm <host> [--yes]` (asks for confirmation like other destructive commands unless `--yes`); `ikf domain ls` adds `source` and `dns_status` columns; USAGE lines. Tests in `packages/cli/test/` following the existing domain command tests.

- [ ] Tests → fail → implement → pass (`npm test -w @ikf/cli`)
- [ ] Commit `feat(cli): ikf domain add/check/rm`

### Task 5: Admin SPA

**Files:** `apps/admin/src/pages/Domains.jsx` (+ a new `components/AddDomain.jsx`, `components/DnsRecords.jsx`), `apps/admin/src/api.js` (`addDomain`, `checkDomain`, `removeDomain`). Behaviour: spec §3 exactly. Copy buttons use `navigator.clipboard.writeText` guarded by try/catch. Tests in `apps/admin/test/` (Testing Library, like the existing Domains tests): form submit + 409 messages (`domain_exists` "Domain đã có", `domain_reserved` "Domain thuộc zone nền tảng, thêm qua Terraform", `invalid_host` "Tên domain không hợp lệ", `cloudflare_unavailable` "Cloudflare không phản hồi, thử lại"), records card, the four badges, apex note, **Gỡ** only for custom rows without routes, `domain_has_routes` lists the routes, feature off → old help text.

- [ ] Tests → fail → implement → pass (`npm test -w @ikf/admin` and `npm run build -w @ikf/admin`)
- [ ] Commit `feat(admin): add, verify and remove custom domains`

### Task 6: Terraform + runbook + CLAUDE.md

**Files:** `infra/modules/edge/main.tf` (+ variables/outputs as needed): resources of spec §5 (provider v5 names: `cloudflare_custom_hostname_fallback_origin` with `zone_id`, `origin`; `cloudflare_workers_route` without `script` for the bypass); `infra/modules/security` secret `cf-saas-api-token` + task-role read (follow how `cf-kv-api-token` is declared); core-api task env `CF_SAAS_ZONE_ID`, `CF_SAAS_CNAME_TARGET` (follow how other env vars reach the task definition); module tests under `infra/modules/edge/tests` if that folder pattern exists; `docs/runbooks/admin-console.md` §9 rewritten: custom domains (enable SaaS on the zone, token permission, fallback origin check, add flow, moving a live FunnelFox domain without downtime: add → TXT records → wait Active → switch CNAME), Terraform hosts unchanged; CLAUDE.md conventions bullet.

- [ ] `terraform -chdir=infra/envs/staging init -backend=false && terraform -chdir=infra/envs/staging validate` and the module tests (`terraform test` where present) pass
- [ ] Commit `feat(infra): Cloudflare for SaaS fallback origin, catch-all route, saas token`

### Task 7: Demo fake + panel + e2e

**Files:** `demo/lib/fake-cf-saas.mjs` (spec §6; shape matches the real API envelope `{success, errors, result}` so the real client parses it), wiring in `demo/lib/purchase.mjs`/`stack.mjs` (inject `saas` built with `createSaasClient({fetch: fakeFetch})` or a base-URL option — prefer passing a `fetch` that routes to the fake; never a flag in `services/`), the check loop interval 2 s in the demo (pass `intervalMs`), control panel section "Domains" with **Xác thực DNS** / **Mất DNS**, `demo/README.md`, e2e `demo/test/domains-e2e.test.mjs` on its own fixed ports (pick a free block, e.g. 8967/8268/8969/8968/8971/8972, database `ikf_domains_test`): sign in → Domains › Thêm domain `shop.example.test` (app starlyn) → "Chờ DNS" + 3 records → panel Xác thực DNS → row Active → publish a funnel at `/` → GET with `Host: shop.example.test` through the edge returns the funnel HTML → remove the route → **Gỡ** → row gone.

- [ ] e2e and `npm run demo:test` green
- [ ] Commit `feat(demo): fake Cloudflare custom hostnames + domains e2e`

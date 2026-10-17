# Custom Domains in Admin — Design Spec

> An admin adds a funnel domain from the console (or `ikf domain add`) instead of editing Terraform. The domain can sit at any registrar: Cloudflare for SaaS issues the certificate once the owner adds the DNS records the console shows. Code lives in `ikf-platform`, branch `feat/custom-domains`, cut from `feat/self-care-cancel` (PR #13). Scope chosen in chat on 2026-10-17 (Cloudflare for SaaS); every other choice below is a ruling.

**Goal:** a new funnel domain goes from "bought" to "publishable" without a Terraform change or an engineer: add it in Admin, copy the records to the registrar, and the console turns it active on its own once Cloudflare has verified it.

**Definition of done:**
- **Demo:** Admin › Domains › **Thêm domain** `shop.example.test` → the row shows "Chờ DNS" with three records (CNAME, two TXT) → the demo panel's **Xác thực DNS** marks the fake Cloudflare hostname active → within one check (or the **Kiểm tra** button) the row turns "Active" → Publish offers the host → the funnel is served on it. **Gỡ** removes it (refused while it has routes). Playwright e2e covers this flow.
- **Old domains:** hosts from Terraform keep working unchanged; `scripts/sync-domains.sh` still works; they cannot be removed from Admin.
- **Old tests:** every existing test passes; the SDK bundle does not change.

## Decisions

| # | Item | Choice |
|---|---|---|
| 1 | Mechanism | Cloudflare for SaaS custom hostnames on the platform zone (chosen in chat). Fallback origin `fallback.<platform_zone>` (proxied `AAAA 100::`), a Worker route `*/*` on the platform zone sends custom-hostname traffic to `edge-router`; a more specific route `api.<platform_zone>/*` with no script keeps the API on the ALB |
| 2 | Who | Global admins only, like domain assignment today (spec admin-console-p4b §2). An optional `app_id` assigns the new host at once |
| 3 | Status | `domains.status` gains `pending` (added, not yet verified). `pending` hosts accept no route (publish → `409 domain_pending`), are not CORS origins (`allowedOrigin` already requires `active`), and cannot be set `active` by hand (`409 domain_pending`) |
| 4 | Source | New column `domains.source`: `terraform` (default, every existing row) or `custom`. Only `custom` rows can be removed from Admin; `PUT /v1/domains/:host {status}` from `sync-domains.sh` never touches a `custom` row's status (`409 domain_custom`) |
| 5 | Validation | TXT validation (`ssl.method = "txt"`, DV, min TLS 1.2), so the owner can get the certificate ready **before** moving the CNAME (no downtime when moving a live domain off FunnelFox). The console shows: `CNAME <host> → fallback.<platform_zone>`, the ownership TXT, the certificate TXT |
| 6 | Check loop | core-api checks every `pending` row every 5 min (`GET custom_hostnames/{id}`), and every `active` custom row every 6 h. `pending` → `active` when hostname `status = active` and `ssl.status = active`. A `pending` row older than 14 days becomes `dns_status = 'failed'` (still `pending`; **Kiểm tra** retries). An `active` row whose Cloudflare status leaves `active` keeps `status = active` (live funnels are never taken down automatically) and shows the warning "DNS không còn trỏ về iFunnel" |
| 7 | Apex | Allowed; the console says an apex needs CNAME flattening / ALIAS at the registrar. No other handling |
| 8 | Reserved hosts | Refused: anything under the platform zone (`409 domain_reserved`, those stay Terraform's), the preview host, an existing host (`409 domain_exists`) |
| 9 | Token | New secret `cf-saas-api-token` (permission: Zone › SSL and Certificates › Edit on the platform zone only), separate from `cf-kv-api-token`. Without it the routes answer `503 custom_domains_unavailable` and the console hides **Thêm domain** behind the old help text |
| 10 | Remove | Only a `custom` row with no routes (`409 domain_has_routes {routes}`). Cloudflare `DELETE` first (404 counts as done); then the row and its `host_revs` row are deleted and the KV key `route:<host>` is deleted (new `kv.delete`; a failure is logged and left: a host with no KV doc already answers 404, and a stale doc lists no routes). Cloudflare failure → `502 cloudflare_unavailable`, nothing changed |

## 1. Data — migration `012_custom_domains.sql`

```sql
SET LOCAL lock_timeout = '5s';
ALTER TABLE domains DROP CONSTRAINT domains_status_check;
ALTER TABLE domains ADD CONSTRAINT domains_status_check CHECK (status IN ('active', 'disabled', 'pending'));
ALTER TABLE domains
  ADD COLUMN source         TEXT NOT NULL DEFAULT 'terraform' CHECK (source IN ('terraform', 'custom')),
  ADD COLUMN cf_hostname_id TEXT NULL,
  ADD COLUMN dns_status     TEXT NULL CHECK (dns_status IN ('pending', 'active', 'failed', 'moved')),
  ADD COLUMN dns_records    JSONB NULL,          -- [{type, name, value, purpose: 'route'|'ownership'|'certificate'}]
  ADD COLUMN dns_checked_at TIMESTAMPTZ NULL,
  ADD COLUMN created_at     TIMESTAMPTZ NOT NULL DEFAULT now();
CREATE UNIQUE INDEX domains_cf_hostname_id ON domains (cf_hostname_id) WHERE cf_hostname_id IS NOT NULL;
```

`dns_status` mapping from Cloudflare: hostname `active` + ssl `active` → `active`; hostname `moved` or ssl `deleted`/`expired` → `moved`; anything else → `pending` (or `failed` after 14 days).

## 2. core-api

**`src/domains/cloudflare.js`** — `createSaasClient({zoneId, apiToken, fetch})`: `create(host)` → `POST /zones/{zone}/custom_hostnames {hostname, ssl: {method: 'txt', type: 'dv', settings: {min_tls_version: '1.2'}}}`; `get(id)`; `remove(id)` (404 = done). Timeout 10 s, no retry on POST (a timeout → `502`; the next **Thêm domain** with the same host sees Cloudflare's "duplicate" error `1406`, then looks it up with `GET ?hostname=` and adopts it). Returns `{id, status, ssl_status, records}` where records are built from `ownership_verification` and `ssl.validation_records`, plus the CNAME. Errors carry Cloudflare's error code only, never the body.

**`src/domains/custom.js`** — `addDomain`, `checkDomain`, `checkDue`, `removeDomain`, all audited (`domain.add`, `domain.verified`, `domain.dns_moved`, `domain.remove`; actor = person, or `system` for the loop).

| Route | Grant | Body | Answer |
|---|---|---|---|
| `POST /v1/domains` | global admin | `{host, app_id?}` | `201 {domain}`; `400 invalid_host`, `409 domain_reserved`, `409 domain_exists`, `404 app_not_found`, `502 cloudflare_unavailable`, `503 custom_domains_unavailable` |
| `POST /v1/domains/:host/check` | global admin | — | `200 {domain}` after one Cloudflare read (`409 domain_not_custom`) |
| `DELETE /v1/domains/:host` | global admin | — | `204`; `409 domain_not_custom`, `409 domain_has_routes {routes}` |

`GET /v1/domains` gains a top-level `custom_domains` (true when the SaaS client is configured); its items gain `source`, `dns_status`, `dns_records` (only for `custom` rows that are not `active`, or `active` with `dns_status = 'moved'`), `dns_checked_at`.

Host check: lowercase, trimmed, the Terraform regex (`^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$`), ≤ 253 chars, no trailing dot.

`publisher/routes.js` `inHostTx`: `pending` → `409 domain_pending` (rollback/delete included: a pending host has no routes anyway). `publisher/domains.js` `setDomain`: a `custom` row refuses a `status` change from the sync script (`409 domain_custom`); `app_id` assignment works as today; a `pending` row refuses `status: 'active'` (`409 domain_pending`).

Loop: `startDomainChecks({pool, saas, log})` in `server.js` beside the KV resync, every 5 min, `FOR UPDATE SKIP LOCKED` on the due rows, one Cloudflare read per row, at most 50 rows per tick. Logs: `domain_check` with host and new `dns_status`; errors by code only.

## 3. Admin console

Domains page: **Thêm domain** (global admin, when `GET /v1/domains` answers `custom_domains: true`) opens a form: host + optional app. After adding, the row expands into a card "Trỏ DNS" with the three records (copy buttons), the apex note when the host has two labels, and **Kiểm tra**. Status badges: `Chờ DNS` (pending), `DNS lỗi` (failed: "Chưa xác thực sau 14 ngày"), `Active`, warning `DNS không còn trỏ về iFunnel` (moved). **Gỡ** on `custom` rows without routes (confirm dialog). Terraform rows show "Terraform" and no **Gỡ**. The old help text stays for when the feature is off.

## 4. CLI

`ikf domain add <host> [--app <id>]` (prints the records), `ikf domain check <host>`, `ikf domain rm <host> [--yes]`. `ikf domain ls` gains a `source` column and `dns_status`.

## 5. Terraform

`modules/edge` (platform zone): `cloudflare_dns_record.fallback` (`fallback.<zone>`, AAAA `100::`, proxied), `cloudflare_custom_hostname_fallback_origin` = that name, `cloudflare_workers_route.saas_catch_all` `*/*` → edge-router, `cloudflare_workers_route.api_bypass` `api.<zone>/*` with no script. `modules/security`: secret `cf-saas-api-token` (value set by hand, like the others) and the task role read on it. core-api env: `CF_SAAS_ZONE_ID`, `CF_SAAS_CNAME_TARGET`. The collector rate limit in `modules/edge` already applies to custom hostnames (they are served by the platform zone's rules). Runbook: create the token, enable Cloudflare for SaaS on the zone (dashboard, one time), check the fallback origin is `active`.

## 6. Demo

`demo/lib/fake-cf-saas.mjs`: an in-memory custom hostnames API (`POST`, `GET /:id`, `GET ?hostname=`, `DELETE`), hostnames start `pending`; the control panel lists them with **Xác thực DNS** (→ `active`/`active`) and **Mất DNS** (→ `moved`). The demo's Miniflare edge serves any host, so the e2e fetches the new host by `Host` header. The check loop runs every 2 s in the demo.

## 7. Testing

| Unit | What |
|---|---|
| SaaS client | request method/path/body; record mapping; 404 on delete = done; duplicate → adopt; error code only |
| add | invalid, reserved, exists, app missing, Cloudflare down → nothing stored, success → pending row + host_revs + audit |
| check | pending → active (audit, status active), stays pending, 14 days → failed, active → moved keeps status active, terraform row refused |
| loop | due selection (5 min / 6 h), 50-row cap, SKIP LOCKED, one failing row does not stop the others |
| remove | terraform refused, routes refused, Cloudflare down → nothing changed, success → rows + KV key gone |
| publish | pending host → `409 domain_pending` |
| sync script path | custom row status change refused; pending → active by hand refused |
| HTTP | grants (non-global 403/404 as today), schemas, 503 without token |
| Admin SPA | add form, records card, badges, remove |
| CLI | add/check/rm/ls |
| Terraform | `terraform validate` + module test (fallback, both routes) |
| Demo e2e | §6 flow |

## 8. Out of scope

App admins adding domains for their own app, buying domains, automatic DNS at registrars (Domain Connect), wildcard hosts, moving a Terraform host to `custom`.

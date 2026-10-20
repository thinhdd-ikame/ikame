# Final whole-branch review: feat/infra-edge-router (610cbb2..e016bb2)

Scope: both plans, infra Tasks 1–13 and edge-router Tasks 1–14. I did not page through review-final.diff (~530KB) line by line. I reviewed in four passes against the checkout at e016bb2 with `git show`/`cat`: (1) core-api source, migration and server wiring; (2) the Worker, route-match and CLI; (3) the Terraform stack, env roots, the core-service/database/cache/security/edge/funnel-domains modules and bootstrap; (4) the CI workflows and scripts, checked against both specs and both ledgers. Per-task reviews already covered module internals, so I looked mainly at the contracts between pieces.

What I ran to check specific doubts (the checkout stayed clean):
- `npm test --workspaces`: route-match 35, cli 46, core-api 80 (Testcontainers), edge-router 28. All pass.
- `terraform test` in infra/stack (6), funnel-domains (5) and core-service (5). All pass.
- `docker build -f services/core-api/Dockerfile .` with the real .dockerignore: it builds. In the image, `@ikf/route-match` resolves and `src/publisher/routes.js` imports. The container exits on missing env, as intended. I removed the image afterwards.
- The lockfile has Linux optional binaries (`@rollup/rollup-linux-x64-gnu`, `@cloudflare/workerd-linux-64`, `@esbuild/linux-x64`), so `npm ci` on ubuntu runners will not hit the darwin-only optional-dep trap.

## Strengths

- **KV contract between core and Worker is exact.** core-api writes `route:<host>` as `{rev, routes:[{prefix,bundle,funnel,v}]}`, sorted with the shared `sortRoutes` (routes.js:150-156). The Worker reads that key with `type:'json', cacheTtl:30` (edge-router/src/routes.js:8) and matches with the same `@ikf/route-match`. Prefix normalisation happens in the CLI (target.js), in core (`checkPrefix`) and in the Worker (`matchRoute`), all through one function. Host case is lowercased or enforced at every layer: TF validation, the Fastify schema, the CLI and the Worker.
- **Bundle key is identical in core and the preview path.** `bundleKey()` in publish.js:6 and the Worker preview branch in index.js:22 both produce `bundles/<slug>/v<n>/index.html`. The preview URL from core (`${PREVIEW_BASE_URL}/${slug}/v${n}`) matches the Worker's `PREVIEW_PATH` and slug regex.
- **Env and secret names line up end to end.** Every name in `config.js` REQUIRED is set in `stack/main.tf:150-165`. `SECRETS_PREFIX = ikf/<env>/` plus the names in `server.js:12` match the security module's `ikf/${env}/${name}`, and the AppSecrets IAM statement covers them, with a stack test asserting it.
- **Failure modes match the spec.** R2 failure gives 503 and no DB row. A KV failure after commit gives 200 + `kv_sync: pending`, and the resync job runs under a per-host advisory lock with a rev and kv_synced_rev watermark. The Worker serves stale routes from isolate memory for up to 10 minutes, then 503 + Retry-After. A missing bundle gives 502 and a log line. Both carried rulings landed: 10s R2/KV timeouts, and in server.js a pool error handler plus forced shutdown.
- **CLI matches the HTTP API.** Paths, bodies, the `confirm_funnel_change` → 409 handling and the query-string `prefix` on DELETE all agree. Retries apply only to the idempotent calls; rollback and rm are never retried. Exit codes: 2 for usage errors, 1 for API and check failures.
- **Auth is clean.** The DB stores only token hashes. `requireRole` runs `onRequest`, before the body is read, so unauthenticated 3MB uploads are refused early. Admin is a superset role and the route role is separate from publish. The ALB refuses any request without the Cloudflare-injected origin header.
- **Dockerfile/workspace layout works.** `npm ci -w @ikf/core-api` succeeds even though the CLI and Worker workspaces are dockerignored.

## Issues

### Critical
None.

### Important

**I1. Core-api will lose DB access about 7 days after each task starts (RDS-managed password rotation).**
- Where: `infra/modules/database/main.tf:64` (`manage_master_user_password = true`), `infra/modules/database/main.tf:115-119` (proxy auth uses that secret), `infra/stack/main.tf:146-149` (DB_PASSWORD injected once at task start), `services/core-api/src/server.js:22-31` (pg.Pool with a static password and `idleTimeoutMillis: 30000`).
- What: RDS-managed master secrets rotate on a 7-day schedule by default. RDS Proxy reads the new value from Secrets Manager. The ECS task keeps the old password, which was injected as an env var at start. The pool drops idle clients after 30s and reconnects with the stale password, so every new connection fails auth at the proxy.
- Why it matters: `/livez`, the ALB health check, does not touch the DB (by design), so the broken tasks are never replaced. Publish, route set/rollback, the resync job and every later core endpoint (OTP, checkout) fail until someone restarts the service. Funnels already on the edge keep serving. This is a cross-task issue: the database module (Task 3), the core-service secrets (Tasks 8/12) and server.js (Task 9) are each fine on their own.
- Fix options:
  - (a) Preferred: proxy IAM auth. Set `iam_auth = "REQUIRED"` on the proxy, grant `rds-db:connect` to the task role, and pass pg `password` as an async function that returns an `@aws-sdk/rds-signer` token.
  - (b) Pass pg `password` as an async function that reads `master_user_secret` through the task role, cached a few minutes and refetched on auth error. Add the master secret ARN to AppSecrets.
  - Either way, add a stack test asserting the chosen wiring.
  - Stop-gap if neither lands before the first deploy: put a calendar note in the runbook to restart the service after each rotation. That is not acceptable for prod.

**I2. A failed core-api deploy reports green.**
- Where: `scripts/deploy-core-api.sh:19-21`, together with `infra/modules/core-service/main.tf:215-218` (`deployment_circuit_breaker { rollback = true }`) and `.github/workflows/core-api.yml:52-53`.
- What: when the new revision crash-loops, the circuit breaker rolls back. The old deployment then becomes the only one and reaches steady state, so `aws ecs wait services-stable` succeeds. The script prints "deployed <new arn>". `smoke.sh` then passes against the old code, and the job moves on to prod.
- How it is likely to happen: one push to main touches both `infra/` and `services/`. core-api.yml and infra.yml run with no ordering between them. deploy-core-api.sh copies the newest family revision, which can be the one from before the env change. The new server.js then exits with "missing env". Any boot-time failure (a bad migration, a missing secret) behaves the same way.
- Fix: after the wait, check `aws ecs describe-services` and fail unless `deployments[?status=='PRIMARY'].taskDefinition == NEW_ARN` and `rolloutState == COMPLETED`. Separately, make core-api.yml wait for infra apply on shared pushes, for example with a shared `concurrency` group or `workflow_run`. Then the copied revision always carries the latest env.

**I3. A prod AWS admin role is reachable from any branch unless GitHub environment rules are set. This is outside the diff; it must be done before bootstrap apply, not before merge.**
- Where: `infra/bootstrap/main.tf:83-87` trusts `repo:<repo>:environment:<env>`, with AdministratorAccess (`:97-101`). The workflows also expose `secrets.CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_WORKERS_TOKEN` to those environments.
- What: any job in any workflow on any branch that declares `environment: prod` gets prod admin plus the Cloudflare tokens. The only guard is the GitHub environment's deployment-branch policy and required reviewers, which live in repo settings rather than code. `plan-staging` already runs PR branches under `environment: staging` with admin by design.
- Fix: add a handoff/runbook step before bootstrap apply. Set `prod` to deployment branches = `main` only, with required reviewers. Set `staging` to `main` + PR refs as intended. Ideally give staging plan its own read-only role, which is already deferred to P2.

### Minor (fix before merge)

**M1. Missing `TF_VAR_funnel_domains` destroys every funnel route (ledger MUST-FIX, confirmed).** `.github/workflows/infra.yml:80` and `:113` use `${{ vars.TF_VAR_funnel_domains || '{}' }}`. If the prod environment var is missing or mistyped, prod apply plans the destruction of every funnel DNS record and Worker route, and auto-approves it. Fix: drop the fallback on both lines and require the var to be explicitly set, `{}` included. Add a guard step, `test -n "$TF_VAR_funnel_domains" || { echo "set TF_VAR_funnel_domains (use {} for none)"; exit 1; }`, because an unset GitHub var expands to `""`. Terraform parse-fails on `""` for a map var, which is already fail-closed, but the explicit message helps.

### Minor (can wait)

- **M2.** `.github/workflows/infra.yml:34`: `aquasecurity/trivy-action@0.28.0` is pinned by tag. That action had tags force-pushed in a 2026 supply-chain incident. Pin it (and ideally all actions) to commit SHAs. Also move `id-token: write` from workflow level (`infra.yml:10-12`, `core-api.yml:10-12`) to the jobs that assume roles. Impact today is low: those jobs hold no secrets and the OIDC trust requires an environment, so this can wait. It is cheap, so doing it now is better.
- **M3.** `infra.yml:127-128`: apply never runs `scripts/sync-domains.sh`. A domain added in Terraform stays unknown to core (`route set` returns 404 `domain_not_found`) until someone runs the script by hand. Add it to the runbook now and to CI later.
- **M4.** `infra/modules/edge/main.tf:95`: the Turnstile widget `domains = [zone_name]` only covers the platform zone. Funnel hosts on other zones will fail Turnstile when OTP/checkout ships. This is cross-plan and only matters for the billing/OTP plan. Feed `keys(var.funnel_domains)` in when that plan starts.
- **M5.** `services/core-api/src/auth.js:13-18`: there is no revoke endpoint, and `ensureToken` only inserts. Rotating `bootstrap-admin-token` leaves the old admin token valid forever, so revoking it needs SQL. Add `DELETE /v1/tokens/:name` or revoke the previous bootstrap hash at boot before prod tokens are handed out.
- **M6.** `.github/workflows/core-api.yml:5,8`: `paths` omit `scripts/deploy-core-api.sh`, `scripts/smoke.sh`, `.dockerignore` and the root `package.json`. A change to those alone does not test or deploy.
- **M7.** The Worker's `PREVIEW_HOST`, `KV_NAMESPACE_ID` and `R2_BUCKET` (edge-router.yml:45-47) are GitHub vars copied by hand from Terraform outputs. A typo makes previews 404 or points the Worker at an empty namespace. Note it in the runbook and add an assertion to smoke-edge later.

## Deferred-minor triage (from both ledgers)

### Must fix before merge
- Task 12 `TF_VAR_funnel_domains || '{}'` fallback (see M1).

### Should do before the first real apply or deploy (runbook items, not code blockers for merge)
- Rollout order: Worker deploy before the first infra apply that creates the routes; secrets filled before the core-api deploy. Merging this branch fires infra, core-api and edge-router on push in no order (see I2/I3).
- `ALB_DNS_NAME` and the other per-env GitHub vars must be set (infra Task 13).
- SNS alarm email subscription must be confirmed by hand (infra Task 11).
- Worker 5xx alarm is manual, per edge-router Task 15 Step 10.

### Can wait
- Infra T1: test does not assert SSE/trust sub; no prevent_destroy/TLS-only on the state bucket; no env tag. Hardening; AdministratorAccess is covered under I3.
- Infra T2: prod + single NAT is not blocked at module level; no var descriptions; unnamed S3 endpoint. The tfvars set this correctly.
- Infra T3: fixed final_snapshot_identifier collides on a second destroy; no force_ssl (the proxy requires TLS); engine "17" drift. Rare or cosmetic.
- Infra T4–6: Valkey has no auth_token (SG-only, TLS on); no validation on redrive or env. Acceptable for MVP.
- Infra T7: server starts if Redis is down (intended; /healthz reports it); bundled CAs. Fine.
- Infra T8: broad egress; origin secret in state; empty secret_arns; ignore_changes. Inherent or intentional.
- Infra T9: per-colo rate-limit counters; ratelimit test checks paths only. Verify at apply (N2).
- Infra T10: DMARC p=none without rua; test only checks dkim[0]. Tighten after mail is warmed up.
- Infra T11: fixed storage threshold; alarm_email unvalidated. Fine.
- Infra T12: stack test is prod-only; `ses:SendEmail` on `*`; mock ARNs. Fine.
- Infra T13: secret-version grep is scoped to modules (deliberate); no concurrency groups (partly I2); tag pinning (M2).
- Infra lock files: already regenerated for linux_amd64.
- ER T1: normalizePath decodes `%2F`. Prefixes only, never file lookups. Fine.
- ER T2: concurrent-migrate test is weak; pathname vs fileURLToPath (no spaces in the container path); no version_id index. Fine at this volume.
- ER T3: ensureToken ignores a role change (see M5); duplicate name is not unique (there is no unique constraint, so no 500); weak assertion.
- ER T4: validator misses `<object data>`, SVG href, CSS `@import "…"`, image-set, `<base>`, meta refresh; the srcset comma split rejects data: URLs; the CONFIG regex can false-pass. Inline `<script>` is allowed by design, so the origin check is hygiene, not a security boundary. Fix the false-rejects (srcset data:) when a real funnel hits them.
- ER T5: KV timeout is fixed in T9; error class names; no secret-leak test. Fine.
- ER T6: unguarded `rows[0]`; R2-ok-then-DB-fail retry is not tested. Fine.
- ER T7: syncHost rev and routes come from separate statements. Self-healing: kv_synced_rev lags, so resync rewrites. trySync swallows non-KV errors; a rollback can cross funnels (expected rollback semantics); uppercase host gives 400 (the CLI lowercases). Fine.
- ER T9: S3 requestTimeout only warns (abortSignal enforces); stopResync does not await. Fine. `secrets.js` hardcodes us-east-1: switch to the ECS-provided `AWS_REGION` when a second region appears.
- ER T10: an orphaned v<n> (R2 ok, DB failed, later overwritten) could be edge-cached for a year under the same key prod uses. This contradicts spec §2 "never overwritten", but needs someone to fetch an unpublished preview URL in that window. Fix later by never reusing n after an R2 write, or `cache:no-store` for previews. HEAD_OPEN inside a comment matters only once the SDK lands. HEAD does a full GET. Compat-date fallback is local only. Fine.
- ER T11: a malformed KV doc gives 1101 (only core writes it); 404/405 not logged. Fine.
- ER T12: sync-domains uses a fixed /tmp path and curl has no --max-time; edge-router.yml paths miss smoke-edge.sh. Fine.
- ER T13: main guard with no argv[1]; existing dir not chmod'ed; `--token` ends up in shell history (`IKF_TOKEN` env already works, so document it); no fetch timeout; `~undefined`; rm prints no propagation note. Fine.
- ER T14: no smoke timeout; temp dir survives SIGINT; tests leave temp dirs. Fine.

## Declined to judge

- R2 S3 API with AWS SDK ≥3.7xx default CRC32 checksums: needs a real R2 PutObject. If staging gets 4xx on publish, set `requestChecksumCalculation: 'WHEN_REQUIRED'` on the S3Client.
- Cache API keyed on the synthetic host `bundles.ikf.internal` while the Worker serves several zones: whether Cloudflare caches it (and per which zone) can only be seen in staging. A miss only costs an R2 read, never correctness.
- Cloudflare provider v5 schemas (zone_setting, ruleset ratelimit, workers_route, turnstile) and the AWS alarm metric math: only mocked here, so they are verified at the first real apply (ledger N1/N2).
- The ≤90s propagation SLA and 400 req/s p95: needs the Task 15 drill and k6.
- Universal SSL coverage for deeper funnel hostnames (`a.b.zone`): depends on which hosts Task 0 picks.

## Verdict

**Ready after fixes.** Must land before merge:
- M1 (funnel_domains fallback).
- I2 (deploy false-green): small and cheap.
- I1 (DB password rotation): fix now, or at the latest before the first staging deploy, because it fails silently about 7 days later.

I3 is a GitHub-settings step that must happen before the bootstrap apply; it does not block merge.

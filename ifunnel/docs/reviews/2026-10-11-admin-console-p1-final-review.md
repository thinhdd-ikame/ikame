# Admin Console đợt 1 — Final whole-branch review

- Repo `ikf-platform`, nhánh `feat/admin-console-p1`, range `d47ebdf..c5c9419` (17 commit, 125 file, +5272/−89).
- Reviewer: Claude Opus (read-only), 2026-10-11. Plan: `docs/plans/2026-10-11-admin-console-p1.md`. Spec: `docs/specs/2026-10-11-admin-console-p1-design.md`.
- Verdict: **Mergeable after the listed Critical/Important fixes.** Fix wave + scoped re-review: see `2026-10-11-admin-console-p1-final-rereview.md`.

## Strengths
- **Sessions:** cookie 32 random bytes, DB stores only sha256 (A1). `touchSession` checks expiry, 7-day cap and `disabled_at` in one atomic `UPDATE … RETURNING`; role changes and disabling take effect on the next request; disabling deletes the person's sessions inside the transaction.
- **CSRF:** enforced in `authenticate()` itself, so every cookie-reachable write route gets it without per-route opt-in; constant-time compare; tokens exempt. `requireRole` runs in `onRequest`, before the 3 MB upload body is read.
- **Google sign-in:** state, nonce, PKCE verifier and return path in an HMAC-signed, short-lived cookie scoped to `/v1/auth/google` (A8). `jwtVerify` checks RS256, `iss`, `aud`, then nonce (constant-time), `email_verified === true` and `hd`. Strangers get `not_allowed` with nothing in audit and no email in logs.
- **CORS:** exactly `deps.admin.origin`, only `/v1/*`, never checkout. Post-login redirect always prefixes the admin origin.
- **Audit:** inside the change's own transaction for versions, routes, pixel, app, domain, funnel, users, prices (ruling applied in `c85c98c`). `actorOf` keeps string-actor callers working.
- **`ADMIN_LOCAL_USER`:** refused in four places (`loadConfig`, `buildApp`, Terraform core-service, `deploy-config`); `server.js` never passes `localUser` into `adminDeps`.
- **Lint:** `@ikf/funnel-lint` linear (~25 ms on 1 MB adversarial input), no dependencies, runs in the browser.
- **SPA:** no XSS sink; the only `dangerouslySetInnerHTML` is the QR SVG from `qrcode`. Lint messages and audit details rendered as text.
- **Demo static server:** `realpath` + root-prefix check closes path traversal.
- **Deploy gate:** `admin.yml` waits until `/v1/auth/me` answers 401.

## Declined to judge
- Whether `SCRIPT_ALLOWLIST` is a security boundary (inline `<script>` is allowed by design; `external_script` is hygiene).
- Whether Cloudflare caches `api.<zone>` JSON reads (zone setting; default does not cache JSON).
- Whether `npm ci -w @ikf/core-api` in the Dockerfile tolerates the absent `apps/*` workspace (sdk/cli already work the same way; `docker build` not run).
- Fastify's default request log records the OAuth callback URL incl. `?code=` (pre-existing; useless without the PKCE verifier).
- Preview host serving unpublished versions to anyone with the URL (pre-existing publisher behaviour the spec relies on).
- Visual design and Vietnamese wording.

## Issues

### Critical
1. **Public demo tunnel gives anyone a full admin session.** `demo/lib/proxy.mjs:21-27`, `demo/run.mjs:42`, `demo/lib/options.mjs` (`DEFAULT_ADMIN_USER`), `services/core-api/src/http/auth.js:28-35`. `--admin-user` has a default, so `npm run demo:purchase` (with `--tunnel`) also registers the credential-less local `GET /v1/auth/google`. The proxy forwards `/v1/*` and blocks only requests with an `Authorization` header; the cookie path bypasses that: `GET <tunnel>/v1/auth/google` → admin cookie → `/v1/auth/me` → CSRF → every admin write. Fix: proxy refuses `/v1/auth/*`, `/v1/admin/*` and any request carrying the admin cookie; admin console off in tunnel mode unless `--admin-user` passed explicitly.

### Important
2. **One upload that passes lint can freeze core-api (incl. checkout) for minutes.** `services/core-api/src/publisher/validate.js:8-11`: `CSS_URL` and `IMG_BLOCK` backtracking regexes. Measured: 1 MB page with `<style>` + repeated `url(` → lint 12 ms, `validateBundle` **350 832 ms**; repeated `/*IMG-START*/` → 12.9 s. Defeats the Task 6 ruling; the branch widens who can upload to every editor. Fix: reuse the linear scanners from `@ikf/funnel-lint`, add the same timing test.
3. **Re-picking the same file after fixing a lint error does nothing.** `apps/admin/src/components/UploadBox.jsx:54` — browsers don't fire `change` for the same file; reset `e.target.value = ''`.
4. **Cookie can be overwritten from editor-controlled same-site pages.** `services/core-api/src/admin/sessions.js:5,11-17,27-29` — `preview.<zone>` serves editor-uploaded inline JS, same-site with `api.<zone>`; it can set `ikf_admin=…; Domain=<zone>; Path=/v1/…` that shadows the real cookie (forced logout, session fixation to an editor's session). Fix: rename to `__Host-ikf_admin` now (cheap before launch).

### Minor
5. `safeReturn` accepts non-ASCII paths → session created, then redirect 500 `ERR_INVALID_CHAR` (`http/auth.js:7`).
6. Login trusts `?return=` (`apps/admin/src/pages/Login.jsx:14-15`); apply the server's rule.
7. Lint misses `<script/src=…>` (no space after tag name) (`packages/funnel-lint/src/index.js:22`); `validateBundle` catches it, so SPA pre-check and server disagree.
8. `ip_hash` is unsalted sha256 of the IP (`admin/sessions.js:37`), trivially reversible for IPv4.
9. Uploads that implicitly create a funnel (CLI first upload) are not audited as `funnel.create` (`publisher/publish.js:21`).
10. `listAudit` ORs on `details->>'slug'`/`'host'` → sequential scan (fine today).

## Triage of deferred per-task minors
Fix before merge: T3 `readCookie` first-cookie (→ Important 4); T4 `safeReturn` non-ASCII; T10 Login `?return=`; T11 file input reset (→ Important 3); T14 `playwright` undeclared + README install line; T15 trailing slash / `curl --max-time` / `timeout-minutes`; T8 add runbook line on recovering from zero admins. Everything else: defer (see execution ledger for the full list).

Rulings reviewed: T2 prices audit in tx — agree; T6 corpus test asserts + skips — agree; T6 linear lint — agree but incomplete until Important 2; T7 no backfill for pre-005 versions (runbook) — agree; stopping the live tunnel before Task 14 — agree.

**Plan issue:** A11's "`--admin-user` always on" plus a proxy rule written before cookie auth existed produced Critical 1; the plan should have restated the tunnel invariant for cookie auth.

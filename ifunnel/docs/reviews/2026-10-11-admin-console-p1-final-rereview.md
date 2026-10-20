# Admin Console đợt 1 — Fix wave + scoped re-review

- Range `c5c9419..e1b92cf` (5 commit), re-reviewer Claude Opus, 2026-10-11. Final review: `2026-10-11-admin-console-p1-final-review.md`.
- Verdict: **all 9 findings addressed**; fix diff has no Important issue; three new minors parked (below).

## Fix wave commits
| SHA | Finding | Change |
|---|---|---|
| 483753b | C1 | `demo/lib/proxy.mjs`: 403 for `/v1/auth/*`, `/v1/admin/*` and any request carrying cookie `ikf_admin` / `__Host-ikf_admin` (name match only; look-alikes pass). `demo/lib/options.mjs`: with `--tunnel`, admin console is off unless `--admin-user` is explicit. README + proxy/options tests. |
| 2da88ac | I2 | `validateBundle` uses `cssUrls`, `imgBlock`, `configFunnel` exported from `@ikf/funnel-lint` (still dependency-free); timing test in `validate.test.js` (1 MB hostile `url(` → 6 ms, `CONFIG={` → 2 ms). |
| c6f0f2f | I3 | `UploadBox`: clears `input.value` after reading; `file.text()` failure shows a message; tests (same file twice → 2 uploads; unreadable file). |
| 13c8508 | I4, m1, m2 | Session cookie `__Host-ikf_admin` (Secure, `Path=/`, no Domain); old name → 401 test; e2e green in Chromium on `http://localhost`. `safeReturn` printable ASCII only; SPA Login honors `?return=` only when it starts with `/` and not `//` (same regex as server). |
| e1b92cf | m3, m4, m5 | Root devDependency `playwright ~1.63.0` + README install line; `admin.yml` `${API_ORIGIN%/}`, `--max-time 20`, `timeout-minutes: 15`; runbook: recovering from zero admins via bootstrap token + `ikf admin add`. |

Totals after the wave: core-api 408, admin SPA 44, funnel-lint 31, cli 129, `demo:test` 113, actionlint clean, tree clean.

## Residual minors (parked, ruling in ledger)
- **I-1** Proxy path rule tests raw `req.url`; find-my-way decodes `%61uth` → `/v1/auth/google`. Only matters with `--tunnel --admin-user x`; the created session cannot be used through the tunnel (cookie and Authorization rules still block). One-line fix: decode before matching + test.
- **I-2** `url( )` degenerate input used to be reported as `media_origin_not_allowed`; linear `cssUrls` yields nothing (matches lint). No error code changed.
- **I-3** Timing test omits the `CONFIG={` input (measured 2 ms).
- Out of scope: Safari acceptance of a `Secure`/`__Host-` cookie on `http://localhost` is unverified (e2e covers Chromium only; `Secure` was already set before this wave).

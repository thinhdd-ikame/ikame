# Final review fix wave: re-review (87090da..0b8b00c)

### Finding Verdicts

- **M2: GET /v1/funnels/:slug leaks an out-of-scope slug in `live[].previous`; Rollback enabled where B14 refuses.** ADDRESSED.
  - services/core-api/src/publisher/catalog.js:79-103: `liveWithPrevious` selects `pf.app_id`. `previous` is null unless `visible(prev_app_id)`, so the slug never enters the body.
  - http/catalog.js:58: GET passes `hasGrant(req.scope,'viewer',appId)`. `req.scope` is set by requireGrant (auth.js:87), and `hasGrant` is imported (line 3).
  - Unassigned funnel (null app): visible to global and default-role callers only, which matches the list route (catalog.js:31).
  - Global and default-role callers are unchanged. The test asserts `all` for `g` and the default viewer `dv`.
  - The only other caller is POST /v1/funnels (catalog.js:51). It keeps the default `() => true`, and a new funnel has no live routes anyway.
  - The same funnel's own previous version is always visible, because the caller already passed the viewer check on that app.
  - No extra DB query: it is one more column in the existing join, not a query per row.
  - Test scope-routes-b.test.js:191-210: the scoped admin, viewer and app token get null, and `/chat|loose/` is absent from the raw body. A viewer of both apps sees `chat` but not `loose`.
  - SPA: FunnelDetail.jsx:104 disables Rollback on `!l.previous`. The new test is funnel-detail-app.test.jsx:53-66, and the mutation check is reported.
- **M5: Docs out of date (B14 sentence, rollback/delete wording, default-role audit/unassigned, app tokens on shared hosts).** ADDRESSED.
  - Runbook §13 (admin-console.md:163-165) now says "not checked against `domain_app_mismatch`" and that who may run it is checked.
  - The B14 paragraph in §14 matches publisher/routes.js:
    - setRoute:81: `allowed(cur.app_id)` runs before the confirm-409 at :82, and `forbidden` has no detail, so no slug is named.
    - rollbackRoute:116 and :128 check both the current funnel and the one put back.
    - removeRoute:150 checks the current funnel.
  - The audit and unassigned funnels are now "global or default role". This matches catalog.js:31 and :81-82 (`hasGrant(…, null)`).
  - App tokens on shared hosts: publish/rollback/delete of their own app's routes is allowed, while sync (global/default only on a shared host, per the existing test at scope-routes-b:212) and domain assignment (G admin) are not. This is accurate.
  - CLAUDE.md:66 and :69 carry the same content.
- **M6: `ikf admin add --role admin` without `--global` silently makes a non-global admin.** ADDRESSED.
  - packages/cli/src/main.js:401-404: the stderr `err(...)` line is emitted only when `role==='admin' && !global`, after the unchanged stdout line, and `return 0` is unchanged.
  - `err` is threaded through main.js:450, and `run` supplies it at :711/:782.
  - Test admin-apps.test.js:37-53 covers stdout and exit code, plus no hint for `--global` or for another role.

### New Breakage in the Fix Diff

None.

### Out-of-Scope Observations

- Minor residual of the M2 SPA half: Rollback is gated on `previous` being present and on admin in the current funnel's app. A caller who is a viewer, but not a router, in the previous funnel's app still sees Rollback enabled, and the server answers 403 (routes.js:128). There is no leak, and the server is correct. This is in the same class as parked M1.
- M1, M3 and M4, and the pre-existing `err.message` logs, remain parked per the ruling.

### Verdict

**Fix round:** All findings addressed, no new Critical/Important breakage. Ready.

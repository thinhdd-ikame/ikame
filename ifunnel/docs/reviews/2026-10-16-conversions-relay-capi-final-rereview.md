# Final re-review — Conversions Relay (Meta CAPI) fix wave

Fix base ab9ea18 → head b19d8ec (6 commits: b4cd290, 1129989, ecafca9, fee2a59, 8c511f6, b19d8ec), 2026-10-16.

| Item | Verdict | Evidence |
|---|---|---|
| 1 renewal `website` without UA | ADDRESSED | `event.js` `website = Boolean(client_url && client_ua)`; tests for swept UA |
| 2 transient Meta codes | ADDRESSED | `TRANSIENT_CODES {1,2,4,17,32,613,80004}`, `is_transient`, 408 → retry before token branch; tests 400+4, 403+17, 408 |
| 3 malformed outbox payload | ADDRESSED | enqueue WHERE guards (txn id, `^[A-Z]{3}$`, integer JSON number in bigint); matches `billing/sync.js` writer; 9 bad shapes test |
| 4a stale event kills chunk | ADDRESSED | claim returns `too_old`; guarded `skipped too_old` write; mixed-chunk test |
| 4b bad client_ip | ADDRESSED | `isIP(ip) !== 0`; IPv4/IPv6 kept, junk → NULL |
| 5 token rotation | ADDRESSED | `tokens.get(app, {notBefore: set_at})`; one Secrets Manager read per rotation; NULL set_at → no read |
| 6 $0 trial | ADDRESSED | `zero_value` in 009 CHECK, enqueue, SPA copy |
| 7 CLI echo | ADDRESSED | fixed message, test with token-like value |
| 8 alarm prefix | ADDRESSED | `createAlarm({prefix})`, conversions uses `ikf conversions` |
| 9 allSettled | ADDRESSED | test: slower group already `sent` when send rejects |
| 10 comment | ADDRESSED | |
| Ruling: skip order no_app, no_pixel, no_consent, zero_value, no_token, too_old | ADDRESSED | a later token never sends a non-consented/$0 purchase; revive test |

New breakage: none Critical/Important. Minor: task clock vs DB clock for `notBefore` (bounded, negligible). Out of scope: malformed outbox rows skipped silently; `analytics/revenue.js:111` casts `amount_minor` unguarded (pre-existing).

**Verdict: all findings addressed — ready.** Tests: core-api 799 (81), cli 275, admin 271 + build, demo 137 (26).

# Final whole-branch review: feat/local-demo (712ddb7..1c38558)

Reviewed in the worktree /Users/daothinh/ikf-platform-demo, read-only.

Checks run:
- `git diff --stat 712ddb7..HEAD -- services workers packages` comes back **empty**, so no production code changed.
- `npm run demo:test` was run once, with colima up and the `ikf-demo` containers already running: **7 files, 42 tests passed in 6.5s**.
- Lockfile: I compared the resolved versions of vitest, vite, wrangler, miniflare, workerd, esbuild, pg and fastify at 712ddb7 and at HEAD. They are identical. The 3300-line churn is hoisting only: root esbuild goes 0.28.2 → 0.25.12 and vite gets a nested 0.28.2.
- The default funnels exist in the ikame repo on `origin/funnel` only. They are not on `origin/main`.
- Miniflare's `/cdn-cgi/explorer` and `/cdn-cgi/handler/*` are opt-in (`unsafeLocalExplorer`, `unsafeTriggerHandlers`), and the demo sets neither.
- The local `~/.docker/config.json` has a hand-added `cliPluginsExtraDirs`.

## Strengths

- **Strict scoping.** All code lives in `demo/`. Production code is reused through its real seams: `buildApp`, `migrate`, `ensureToken`, `setRoute`/`removeRoute`/`listRoutes`, and the publisher's `StoreUnavailableError`/`KvUnavailableError` types. The demo exercises the real publish → R2/KV → edge → queue → consumer → ClickHouse path instead of a parallel fake.
- **LAN exposure is kept small:**
  - Only Miniflare (8787) and the media server (8790) bind 0.0.0.0.
  - core-api (with the fixed admin token) binds 127.0.0.1. Postgres and ClickHouse are published as `127.0.0.1:` in compose, and colima forwards them through ssh on loopback.
  - The media server allows GET/HEAD only, uses an extension allowlist, checks paths with realpath plus `sep`, returns 404 on bad escapes and NUL bytes, and survives stream errors. Tests cover each of these.
  - No Miniflare dev endpoints are enabled.
  - The token is printed to the local console only.
- **Re-runs are designed for:**
  - Postgres persists while Miniflare starts empty, so `publishFunnels` re-puts the immutable bundle even when `created: false`.
  - Routes left over from an earlier funnel set are removed.
  - `pixel_id: null` clears a stale pixel and re-syncs every KV doc.
  - The DDL is idempotent.
  - demo.test.mjs:52 covers the second start against the same Postgres state.
- **Errors say what to do next** (Docker, compose, ports, funnels dir, ClickHouse not up). Ctrl-C shutdown is solid: Miniflare's SIGINT hook is taken over, a second signal force-exits, and there is a 10s watchdog.
- **Test isolation:**
  - The e2e test uses its own ports (8797/8098/8799) and passes with containers already up.
  - The Miniflare test needs no Docker (a fake ClickHouse) and checks the LAN-host routing by Host header.
  - Demo tests are kept out of `npm test` and CI.
- **The billing branch should not break the demo.**
  - The billing plan registers its routes only when `paddle`/`turnstile`/`queue`/`webhookSecret` deps are present. The demo passes none, so they stay off.
  - Its `__IKF` billing keys need `PADDLE_CLIENT_TOKEN` (a secret, not a var) plus an https `API_ORIGIN`. The demo has neither, so `__IKF` keeps its current shape and the exact regex at demo.test.mjs:20 holds.
  - Migration `003_billing.sql` is picked up by `migrate()`.
  - `loadConfig` (which will require `PADDLE_ENV`) is not used by the demo.
  - Billing does not touch `routes.js`, `publish.js`, `validate.js` or the queue shapes.

## Issues

### Critical

None.

### Important

1. **A teammate following the README cannot get `docker compose` working.**
   - Where: demo/README.md:8, demo/README.md:57, demo/lib/docker.mjs:26.
   - With Homebrew, `brew install docker-compose` alone does not make `docker compose` work. Docker only finds the plugin after `"cliPluginsExtraDirs": ["/opt/homebrew/lib/docker/cli-plugins"]` is added to `~/.docker/config.json`; Homebrew prints this as a caveat. It works on this machine because that entry was added by hand.
   - What a teammate sees: they run the suggested `brew install docker-compose`, run `npm run demo` again, and get the same "Install it with: brew install docker-compose" message.
   - Fix: add the config step to the error message and to both README lines. The README:57 parenthetical currently reads as if Docker finds the plugin automatically.

2. **The default funnel source is unreachable for teammates.**
   - Where: demo/lib/funnels.mjs:11, demo/README.md:8-9 and :26, demo/run.mjs:10, demo/test/media.test.mjs:9, demo/test/demo.test.mjs:15.
   - `DEFAULT_FUNNELS_DIR` is hard-coded to `/Users/daothinh/...`. The three default funnels also exist only on the ikame repo's **`funnel` branch**: `origin/main` has no `funnel/funnel-development/{learning/ewa-books,…}`. The README says only "the ikame repo's funnel/funnel-development folder".
   - Effects:
     - `npm run demo` fails on any other machine until `IKF_FUNNELS_DIR` is set. The message is clear, but the README never says where the folder comes from.
     - `npm run demo:test` fails outright, because demo.test has no skip guard. media.test does have one (`describe.skipIf`).
   - The spec chose this default (spec decision #6), so this is a teammate-path gap rather than a deviation.
   - Fix (about 5 lines):
     - Make the default `join(homedir(), 'ikame/funnel/funnel-development')`.
     - In the README, say "an `ikame` checkout on the `funnel` branch" and give a one-line `git clone -b funnel …`.
     - Give demo.test the same `existsSync` skip, or make it fail early with the `IKF_FUNNELS_DIR` hint.

### Minor

3. **The e2e test shares Postgres and ClickHouse with a running demo.** Where: demo/test/demo.test.mjs:15, :34.
   - The test writes `localhost` routes pointing at versions whose images live on 127.0.0.1:8799 (dead after the test), and may remove routes for funnels outside the default set.
   - It also inserts a synthetic `screen_view` for ewa-books into `ikf.events`, which then shows up in `demo:events`.
   - A running demo is unaffected at runtime (its KV is in memory), and its next start rewrites the Postgres routes, so nothing breaks lasting.
   - Fix: one README line ("demo:test writes to the same Postgres/ClickHouse"), or tag the event's `host` as `demo-test` and filter it out in events.mjs.
4. **Version churn.** Where: demo/lib/funnels.mjs:21-24.
   - `rewriteMedia` bakes `mediaBase` into the HTML. Each switch between LAN IP, `--no-lan`/127.0.0.1 and the test's 8799 port therefore creates a new version, so the version number grows over time.
   - This is harmless. It is worth one sentence in the README so `v7` on the second day is not a surprise.
5. **Only `clickhouse/001_events.sql` is applied.** Where: demo/lib/stack.mjs:19, :88.
   - The first ClickHouse migration that adds a column the consumer inserts will break demo inserts silently: the consumer logs and retries, then the event goes to the DLQ.
   - Billing adds none, but the next schema change will.
   - Fix: apply `clickhouse/*.sql` in sorted order.
6. **Lockfile merge with billing.** Where: package-lock.json.
   - Both branches rewrite the lockfile heavily, and this branch's hoisting churn comes from the root `esbuild ^0.25.12` dev dependency.
   - Expect a conflict. Resolve it by taking either side, running `npm install`, then running `npm test` and `npm run demo:test`. Do not merge hunks by hand.
7. **The demo runs an older workerd than production.**
   - Root miniflare is `4.20260310.0` (workerd 1.20260310), while wrangler 4.148 runs workerd 1.20261006. The Workers' `compatibility_date` 2026-09-01 is newer than this workerd supports, so Miniflare falls back to an older date, and that warning is hidden by the default ERROR log level (miniflare.mjs:52).
   - Fine for a demo. Note it so a demo-only behaviour difference is not chased as a production bug.
8. **No progress output on the first run.** Where: demo/lib/docker.mjs:30.
   - `composeUp` buffers `docker compose up` output, so the first pull (ClickHouse is about 600 MB) prints nothing for minutes after "first run pulls images…".
   - Fix: inherit stderr for `up`, or print "pulling postgres/clickhouse images".
9. **`lanIp` can pick a VPN address.** Where: demo/lib/stack.mjs:22.
   - When en0 has no IPv4 (wired Mac on en5/en7, Wi-Fi off), `lanIp` takes the first non-internal IPv4. That can be `utun*` (VPN) or colima's `bridge100`, which a phone cannot reach.
   - Fix: skip `utun*`/`bridge*`/`vmenet*` before the fallback.

## Deferred-minor triage

| Deferred item | Decision |
|---|---|
| T1: a `docker info` failure drops the real stderr | **Fold into Important 1** when touching docker.mjs. Append `stderr.trim()` when it is not a plain "Cannot connect", so a broken context or socket path is visible. Otherwise keep it deferred. |
| T1: a `compose up` failure has no logs hint | Keep deferred. Optionally append "see: docker compose -p ikf-demo logs". |
| T4: e2e tests are order-dependent | Accept. It is a single scripted smoke scenario, `fileParallelism: false`, and the order is intentional (start → event → restart → stop). |
| T4: the LAN host path is not exercised end to end | Accept. Host-header routing for a LAN IP is covered in miniflare.test.mjs:60 and `lanIp` in stack.test.mjs. The remaining risk is the OS firewall, which no test can cover. |
| T4: old LAN-IP hosts stay active | Accept. They exist only in Postgres plus in-memory KV for one run, are reachable only by a client sending that Host header, and serve the same funnels. |
| T4: hard-coded default funnels dir | **Promote to Important 2** (teammate path plus the `funnel` branch). |

## Declined to judge

- Behaviour on Docker Desktop or OrbStack instead of colima. Not tested here; nothing in the code is colima-specific beyond the messages.
- Whether macOS's firewall prompt fires for `workerd` versus `node` on a fresh machine, and whether phones load the funnels. I did not run `npm run demo` against a real phone.
- Visual correctness of the three funnels after `rewriteMedia`. The validator passes and the image fetch is tested, but not a click-through.
- Exact billing merge mechanics, since the billing branch is still in progress. I judged against the billing plan, not its code.

## Verdict

**Ready after fixes.** Fix Important 1 (compose plugin config step in the README and error message) and Important 2 (portable default funnels dir, a README note about the ikame `funnel` branch, and a demo.test skip or early-fail). Both are small, docs-heavy changes. Minors 3–9 can ship as follow-ups. No production code changed, and demo:test passes 42/42.

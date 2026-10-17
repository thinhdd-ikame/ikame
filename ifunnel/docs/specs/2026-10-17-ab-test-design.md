# A/B Test (Traffic Split) — Design Spec

> One live URL (host + prefix) is split between 2–4 variants, each any `funnel@version`, by fixed percentages. A visitor keeps their variant (cookie set by the edge). The console shows visitors, purchases, conversion rate, revenue and a confidence figure per variant; an admin picks the winner, and the URL then serves only that variant. Code lives in `ikf-platform`, branch `feat/ab-test`, cut from `feat/custom-domains`. Scope chosen in chat on 2026-10-17 (variants = any funnel@version on one URL; winner picked by hand); every other choice below is a ruling.

**Goal:** the growth team tests a new paywall, flow or price against the live funnel without engineers, and switches to the winner in one click.

**Definition of done:**
- **Demo:** a live demo URL → **A/B test** → variants `witch-power@v1` (current, 50 %) and `witch-power@v2` (50 %) → **Bắt đầu** → fresh browsers land on both (the response header `x-ikf` names the variant), one browser keeps its variant on reload → after visits and one purchase, the experiment page shows visitors / purchases / CR / revenue per variant → **Chọn thắng** v2 → the URL serves only v2, the experiment shows "Đã dừng". Playwright e2e covers this.
- **No SDK change:** the bundle stays byte-identical; numbers come from data we already collect (events carry `host`, `funnel`, `v`; checkouts carry `funnel_id`, `v`, `client_url`).
- **Old tests:** every existing test passes.

## Decisions

| # | Item | Choice |
|---|---|---|
| 1 | Unit | An experiment belongs to one live route (host + prefix). Its first variant (arm 0, "Gốc") is the version live there when it starts; 1–3 challengers are any `funnel@v` of the **same app** as arm 0's funnel (chosen in chat: any funnel/version) |
| 2 | Split | Integer weights, each ≥ 1, sum = 100. Fixed for the experiment's life (changing weights mid-test skews the numbers: stop and start a new one) |
| 3 | Sticky | Edge cookie `ikfx_<experiment id>=<arm>`; `Path=<prefix>`, `Max-Age=2592000` (30 days), `Secure; HttpOnly; SameSite=Lax`. A missing or invalid cookie → weighted random pick (`crypto.getRandomValues`) and `Set-Cookie`. The preview host never splits |
| 4 | One at a time | At most one running experiment per (host, prefix). While it runs, publish/rollback/delete on that prefix answer `409 experiment_running` (stop it first). Disabling the domain does not stop it |
| 5 | Numbers | Visitors = `uniqExact(sid)` of `events` with `host = H`, `(funnel, v) = arm`, `received_at` in the experiment window. Purchases = `checkouts` with `status = 'completed'`, same `funnel_id`/`v`, `client_url` host = H, `created_at` in the window. Revenue = sum of each such checkout's first paid transaction (`amount_minor`, per currency). The window is `[started_at, ended_at or now]`. A variant also live at another prefix of the same host would have that traffic counted too: the console warns when that is the case |
| 6 | Confidence | Two-proportion z-test of each challenger's conversion rate against arm 0; shown as "Độ tin cậy" = `1 − p` (two-sided) in %, with "Chưa đủ dữ liệu" while either arm has < 100 visitors or < 5 purchases in total. Revenue per visitor is shown but not tested |
| 7 | Winner | **Chọn thắng** (arm n) stops the experiment and sets the route to that arm's version in the same transaction (a `route_events` row + audit `experiment.stop` with the winner); **Dừng, giữ bản gốc** stops it and keeps arm 0. Nothing is ever switched automatically (chosen in chat) |
| 8 | Who | Start/stop: `router` in the app of the experiment (the console shows the buttons to app `admin`s, like Publish). View: `viewer` in that app. App = arm 0's funnel's app (an unassigned funnel cannot be in an experiment: `409 funnel_unassigned`) |
| 9 | Checks at start | Route exists at the prefix (`404 route_not_found`); domain `active`; 1–3 challengers, no duplicate `funnel@v`, each version exists and has no lint errors (`409 version_lint_failed`), each funnel in arm 0's app (`409 experiment_app_mismatch`), and allowed on the host as a publish would be (`409 domain_app_mismatch` on an app's host) |

## 1. Data — migration `013_experiments.sql`

```sql
CREATE TABLE experiments (
  id          BIGSERIAL PRIMARY KEY,
  host        TEXT NOT NULL REFERENCES domains (host) ON DELETE CASCADE,  -- a removed domain takes its experiments; audit keeps start/stop
  path_prefix TEXT NOT NULL,
  app_id      TEXT NOT NULL REFERENCES apps (id),
  name        TEXT NOT NULL,                          -- 1..80 chars, free text ("Paywall mới")
  status      TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'stopped')),
  winner_arm  SMALLINT NULL,
  started_by  TEXT NOT NULL,
  started_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  stopped_by  TEXT NULL,
  ended_at    TIMESTAMPTZ NULL
);
CREATE UNIQUE INDEX experiments_one_running ON experiments (host, path_prefix) WHERE status = 'running';
CREATE INDEX experiments_by_app ON experiments (app_id, id DESC);

CREATE TABLE experiment_arms (
  experiment_id BIGINT NOT NULL REFERENCES experiments (id) ON DELETE CASCADE,
  arm           SMALLINT NOT NULL CHECK (arm BETWEEN 0 AND 3),
  version_id    BIGINT NOT NULL REFERENCES versions (id),
  weight        SMALLINT NOT NULL CHECK (weight BETWEEN 1 AND 99),
  PRIMARY KEY (experiment_id, arm)
);
```

`routes` keeps pointing at arm 0's version while the experiment runs, so listings, the KV doc's `funnel`/`v`/`bundle` and every existing reader stay valid.

## 2. KV document and edge

`syncHost` adds to a route with a running experiment: `exp: <id>` and `arms: [{arm, funnel, v, bundle, pixel, weight}]` (arm 0 first). Old Workers ignore the extra fields.

Edge (`workers/edge-router`): after `matchRoute`, if the route has `arms`, read cookie `ikfx_<exp>`; a value that names an arm of this route → that arm; else pick by weight and add `Set-Cookie`. The chosen arm's `funnel`, `v`, `bundle`, `pixel` become the target (so `__IKF`, the SDK, checkout and the pixel all see the variant). `x-ikf` gains `; exp=<id>:<arm>`. A bundle error for a challenger is a 502 like any bundle error (no fallback to arm 0: a silent fallback would corrupt the numbers). New module `src/experiment.js` (`pickArm(route, cookieHeader, random)` → `{arm, setCookie|null}`), unit-tested with an injected random.

## 3. core-api

`src/experiments/*` + `src/http/experiments.js`:

| Route | Grant | Body | Answer |
|---|---|---|---|
| `POST /v1/experiments` | `router` in the app (resolver: the funnel live at host+prefix) | `{host, prefix, name, arms: [{weight}, {funnel, v, weight}, …]}` (arm 0 has only `weight`: it is the live version) | `201 {experiment}`; errors of decision 9, `409 experiment_running`, `400 bad_weights` |
| `GET /v1/experiments?app=&status=` | `viewer` in some app (`'any'`, filtered to scope) | — | `{experiments: [summary]}` newest first |
| `GET /v1/experiments/:id` | `viewer` in its app (404 same body as missing out of scope) | — | `{experiment, arms: [{arm, funnel, v, weight, visitors, purchases, cr, revenue: [{currency, amount_minor}], rpv, confidence|null, also_live_at: [prefix]}], analytics: 'ok'|'unavailable'}` |
| `POST /v1/experiments/:id/stop` | `router` in its app | `{winner_arm}` (0 = keep the original) | `200 {experiment}`; `409 experiment_stopped` |

Start: one transaction in `inHostTx` order (domain row → funnels FOR SHARE), insert experiment + arms, bump `host_revs`, audit `experiment.start`; then `trySync` like a publish. Stop: same, `UPDATE routes SET version_id = winner's` when winner ≠ 0 (a `route_events` row), status/ended_at/stopped_by/winner_arm, audit `experiment.stop`, sync. `setRoute`, `rollbackRoute`, `deleteRoute`: running experiment on that prefix → `409 experiment_running {experiment_id}`. ClickHouse down → arms come back with `visitors: null`, `analytics: 'unavailable'` (purchases/revenue still from Postgres).

## 4. Admin console

- Funnel host page / Domains route row: button **A/B test** (app admins) opens the start form: name, arm 0 shown (current live version), add 1–3 variants (funnel picker limited to the app, version picker, weight), weights must total 100 (live sum shown), **Bắt đầu**.
- New app page **Thử nghiệm** (`/apps/:id/experiments`, nav entry): list (name, URL, status, started, variants), detail page: table per arm (Gốc / B / C / D, funnel@v, %, visitors, purchases, CR, revenue, revenue/visitor, Độ tin cậy vs Gốc with "Chưa đủ dữ liệu"), the also-live warning, buttons **Chọn thắng** per arm and **Dừng, giữ bản gốc** (confirm dialog naming what the URL will serve).
- Routes listing shows a badge "A/B" on a prefix with a running experiment.

## 5. CLI

`ikf ab start <host>[/prefix] --name <text> --arm <weight> --arm <funnel>@v<n>:<weight> …` (first `--arm` is the live version's weight), `ikf ab ls [--app <id>] [--running]`, `ikf ab show <id>`, `ikf ab stop <id> (--winner <arm> | --keep) [--yes]`.

## 6. Demo

The demo's Miniflare edge splits like production. The e2e uploads a second version of a sample funnel, starts a 50/50 experiment on the demo host, makes fresh-cookie requests until both arms are seen (bounded: 40 requests; with p = 0.5 the chance of missing one is 2⁻³⁹), checks the cookie keeps the arm, visits each arm in a browser so events reach ClickHouse, buys once on one arm (purchase demo path), reads the experiment page numbers, picks the winner, and checks the URL serves only that version.

## 7. Testing

| Unit | What |
|---|---|
| edge `pickArm` | cookie valid / invalid / other experiment's cookie, weighted pick boundaries with injected random, Set-Cookie attributes, no split on preview |
| edge fetch | arms route → variant bundle + `__IKF` + `x-ikf`, challenger bundle missing → 502 |
| syncHost | arms in doc only while running |
| start | every check of decision 9, one running per prefix (unique index race → 409), audit, KV sync |
| stop | winner → route switched + route_events, keep → unchanged, already stopped → 409 |
| publish/rollback/delete | 409 while running |
| stats | ClickHouse query (host/funnel/v/window), checkout counting (client_url host, window, completed only), revenue per currency, z-test numbers against a known example, thresholds, ClickHouse down |
| HTTP | grants/scope (out-of-scope GET = same 404), schemas, weights |
| SPA | start form validation, detail table, stop dialogs, A/B badge |
| CLI | start/ls/show/stop |
| Demo e2e | §6 |

## 8. Out of scope

Multi-page / cross-URL experiments, changing weights while running, automatic winner, bandits, per-screen funnel steps per arm (the funnel's Số liệu tab still has them per version), segment targeting (country/device), holding back a share of traffic from all variants.

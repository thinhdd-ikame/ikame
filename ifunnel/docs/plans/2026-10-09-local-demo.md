# iKame Funnel Platform — Local Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `npm run demo` một lệnh, khoảng 1 phút (lần đầu lâu hơn vì kéo image) có 3 funnel thật chạy trên máy dev: mở bằng trình duyệt hoặc điện thoại cùng wifi, bấm qua các màn, `npm run demo:events` thấy `page_load`, `funnel_start`, `screen_view`… trong ClickHouse. Không cần tài khoản AWS, Cloudflare, Paddle hay Meta. Không sửa code production.

**Architecture:**
- **Docker (Colima) qua `docker compose`** (`demo/compose.yaml`): Postgres 17 (`127.0.0.1:54329`) và ClickHouse 25.8 (`127.0.0.1:18123`), volume có tên.
- **Một process Node** (`demo/run.mjs` → `demo/lib/stack.mjs`):
  - **Miniflare** (API lập trình, `0.0.0.0:8787`) chạy 2 Worker trong một instance: `edge-router` (KV `ROUTES`, R2 `BUNDLES`, producer `EVENTS`) và `event-consumer` (consumer của cùng queue, insert ClickHouse). Mỗi Worker bundle bằng esbuild như wrangler; SDK build trước bằng `packages/sdk/scripts/build.mjs`. `cf.country` lấy từ `--country`.
  - **core-api** `buildApp()` (`127.0.0.1:8080`) với `pool` Postgres container và adapter `store`/`kv` ghi thẳng vào binding R2/KV của Miniflare (`mf.getR2Bucket` / `mf.getKVNamespace`).
  - **Media server** (`0.0.0.0:8790`) phục vụ `img/` của từng funnel; HTML được rewrite trỏ `img/…` sang đó.
  - Publish qua `POST /v1/funnels/:slug/versions`, đăng ký host `localhost` + IP LAN, route `/<slug>`, pixel qua `PUT /v1/funnels/:slug`.

**Tech Stack:** Node.js ≥ 22 (local Node 26) · JavaScript ESM · npm workspaces · Vitest ~3.2 · `miniflare` **4.20260310.0** (đúng bản đã có trong lockfile qua `@cloudflare/vitest-pool-workers` 0.12.21, workerd 1.20260310.1) · esbuild ^0.25.12 (cùng bản `@ikf/sdk`) · `pg` ^8.23.1 · Docker Compose v2 trên Colima · `postgres:17-alpine` · `clickhouse/clickhouse-server:25.8`.

**Spec:** `ifunnel/docs/specs/2026-10-09-local-demo-design.md`. Xây trên PR #1 (Edge Router + Publisher) và PR #2 (Runtime SDK + Collector).

**Repo / nhánh:** code nằm trong `/Users/daothinh/ikf-platform`, nhánh mới `feat/local-demo` cắt từ `feat/runtime-sdk-collector` (HEAD `4f25cf4`). Task 1 tạo nhánh **trong worktree riêng** `/Users/daothinh/ikf-platform-demo`: main checkout có thể đang được session khác dùng, và `feat/billing-paddle` đang code ở `/Users/daothinh/ikf-platform-billing` — không đụng hai chỗ đó.

**Môi trường chạy (local):**
```bash
colima start                                                           # Docker daemon
docker compose version                                                 # cần Compose v2; thiếu thì: brew install docker-compose
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock            # chỉ cần cho Testcontainers của core-api/event-consumer
export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock
```
Máy dev lúc viết plan (2026-10-09) **chưa có** plugin compose (`brew list` chỉ có `colima`, `docker`, `docker-buildx`); `~/.docker/config.json` đã có `cliPluginsExtraDirs: ["/opt/homebrew/lib/docker/cli-plugins"]`, nên `brew install docker-compose` là đủ. Plan được chạy thử với Compose v2.40.3.

## Điều chỉnh so với spec (phát hiện khi chạy thử trên `feat/runtime-sdk-collector@4f25cf4`, 2026-10-09)

| # | Spec | Plan làm | Lý do |
|---|---|---|---|
| A1 | "đăng ký domain `localhost` và IP LAN" qua core | Host + route ghi bằng chính hàm của core: SQL giống hệt `PUT /v1/domains/:host`, rồi `setRoute`/`listRoutes`/`removeRoute` từ `publisher/routes.js` (đã export sẵn). Publish và pixel vẫn đi qua HTTP | `hostParams` của API bắt buộc có dấu chấm → `localhost` bị `400`. `ikf route ls` in ra cho IP LAN (hợp lệ) |
| A2 | Bundle Worker "giống wrangler" | Entry của bundle chỉ re-export `default` của `src/index.js` | `event-consumer/src/index.js` export thêm `MAX_RETRIES`, `FAILING_AFTER`, `handleBatch`; workerd từ chối khởi động: `Uncaught TypeError: Incorrect type for map entry 'FAILING_AFTER'`. **`npx wrangler dev` trong `workers/event-consumer` lỗi y hệt** (wrangler 4.148.0) → nhiều khả năng `wrangler deploy` cũng bị Cloudflare từ chối. Không sửa ở đây (không đổi production); ghi ở "Theo sau" |
| A3 | Volume giữ dữ liệu giữa các lần chạy | Mỗi lần chạy: re-put bundle vào R2 kể cả khi publish trả `created: false`; gỡ route của funnel không còn chọn; luôn `PUT pixel_id` (null khi không có `--pixel`) | Postgres giữ version, còn KV/R2/Queue của Miniflare nằm trong RAM → version cũ không có object → edge `502` (đã thử: bỏ re-put thì test fail `expected 502 to be 200`) |
| A4 | `max_batch_timeout` theo wrangler.json (10s) | Demo dùng `maxBatchTimeout: 1` | Event hiện trong ClickHouse sau ~1s thay vì 10s; các giá trị khác (`max_batch_size`, `max_retries`, DLQ, tên queue) đọc từ wrangler.json |
| A5 | Miniflare "bản đã cài" | Root devDependency `miniflare@4.20260310.0` (exact). workerd của bản này hỗ trợ compat date tới `2026-03-10`, wrangler.json đặt `2026-09-01` → Miniflare tự lùi về `2026-03-10`; log level `ERROR` để cảnh báo không in mỗi lần chạy (`--verbose` hiện lại) | Bản hoisted trong repo là 4.20260310.0 (wrangler 4.148 mang theo 5.x alpha, không dùng) |
| A6 | "đổi map `IMG` và literal `img/…`" | Rewrite mọi `img/` hoặc `./img/` đứng ngay sau `'` `"` `` ` `` `(`: gồm cả key/value map `IMG`, `im('img/…')`, `src=`, `url(img/…)`, template literal `` `img/use-${k}.jpg` ``. Media base = `http://<IP LAN>:8790` (hoặc `127.0.0.1` với `--no-lan`) | Validator chỉ soát literal tĩnh; template literal (`coursiv`, `moon-reading`) vẫn cần chạy được. Điện thoại không tải được ảnh từ `localhost` |
| A7 | "Docker hoặc Colima không chạy → chạy `colima start`" | Thêm 2 thông báo: thiếu CLI `docker` → `brew install docker docker-compose colima`; thiếu plugin compose → `brew install docker-compose` | Máy dev hiện thiếu plugin compose (xem trên) |
| A8 | "Ctrl-C dừng gọn" | `run.mjs` thay handler SIGINT/SIGTERM của Miniflare bằng handler của demo (đóng core, Miniflare, media, pool rồi `exit 0`) | `exit-hook` của Miniflare gọi `process.exit(130)` ngay khi SIGINT, trước mọi cleanup async (đã thấy: không in "Stopping…", core/pool không đóng) |
| A9 | Healthcheck compose là đủ | Sau `up --wait` còn thử `SELECT 1` với user `ikf` tới 30s | Image ClickHouse báo healthy trước khi entrypoint tạo xong user `ikf` (lần đầu: truy vấn ngay sau `--wait` trả rỗng) |
| A10 | `npm run demo:down` dừng container, `--reset` xóa volume | `demo:down` = `node demo/run.mjs --down`; `--reset` dùng được cả với `demo` (xóa rồi chạy lại) và `demo:down` | Một entry, một parser |
| A11 | Smoke test dùng stack | Smoke test dùng cổng riêng `8797/8098/8799`, `lan: false` | Chạy được cả khi `npm run demo` đang mở |
| A12 | `clickhouse/clickhouse-server` | Ghim `:25.8` | Cùng bản Testcontainers của `event-consumer` |

Không export thêm gì từ `services/`, `workers/`, `packages/`: demo chỉ import những gì đã export (`buildApp`, `ensureToken`, `migrate`, `bundleKey`/`sha256Hex` (`publisher/publish.js`), `setRoute`/`listRoutes`/`removeRoute`, `StoreUnavailableError`, `KvUnavailableError`, `validateBundle`, `buildSdk`).

## Global Constraints

- Code trong repo `ikf-platform`, nhánh `feat/local-demo`. Mọi file mới nằm trong `demo/`; ngoài `demo/` chỉ sửa `package.json` (scripts + devDependencies), `package-lock.json`, `.gitignore`. **Không sửa** gì trong `services/`, `workers/`, `packages/`.
- Demo deps là **root devDependencies**: `miniflare@4.20260310.0` (exact), `esbuild@^0.25.12`, `pg@^8.23.1`, `vitest@~3.2.0`.
- Root scripts: `demo`, `demo:events`, `demo:down`, `demo:test`. `demo:test` chỉ chạy local (cần Docker), **không** nằm trong `npm test` hay CI.
- Cổng: Miniflare `0.0.0.0:8787`, core-api `127.0.0.1:8080`, media `0.0.0.0:8790`, Postgres `127.0.0.1:54329`, ClickHouse HTTP `127.0.0.1:18123`. Smoke test: `8797/8098/8799`.
- Credential cố định của demo (không phải secret thật): Postgres/ClickHouse `ikf`/`ikf`, database `ikf`; token admin `ikf_demo_admin` (`ensureToken`); `IP_SALT=ikf-demo-salt`; AWS `demo`/`demo` (alarm SNS chỉ log lỗi).
- Worker vars: `SDK_ENABLED="true"`, `PREVIEW_HOST="preview.localhost"`, các var khác lấy nguyên từ `wrangler.json` (`CLICKHOUSE_DATABASE=ikf`, `WORKER_ENV=local`…). Tên queue/binding đọc từ `wrangler.json`, không hard-code.
- Host được đăng ký: `localhost` + IP LAN (`en0` ưu tiên; `--no-lan` tắt). Route mỗi funnel: prefix `/<slug>`.
- Funnel mặc định (có `CONFIG.funnel` và thư mục `img/`): `ewa-books` (`learning/ewa-books`, `dataLayer` + `ikfunnel:*`), `calmio-calm-kids` (`mental-health/calmio-calm-kids`, có `<head>`, tự gọi `fbq`), `moon-reading` (`nebula/moon-reading`, ảnh dựng bằng template literal). Chọn theo **slug `CONFIG.funnel`**, không theo tên thư mục (`testlibrary/adhd-traits` có slug `testlibrary-adhd`).
- Mọi lỗi người dùng gặp là `DemoError`, in `ikf demo: <thông báo nói rõ phải làm gì>`, exit 1.

## Review Focus

1. **Rewrite media sót một tham chiếu `img/…` → publish `422 media_origin_not_allowed`** (hoặc ảnh vỡ với template literal). Test: Task 2 `default funnels pass the publisher validator after rewriting` (3 funnel thật: trước rewrite `422`, sau rewrite `ok`, không còn `'img/`), `rewrites attributes, css url(), ./img/ and template literals`.
2. **Host từ IP LAN không được đăng ký → điện thoại nhận `404`.** Edge route theo `Host`, nên IP LAN phải có KV doc riêng, và IP phải đúng interface. Test: Task 3 `routes by the Host header: a registered LAN IP works, an unregistered one is 404`; Task 4 `lanIp` (`prefers en0 …`).
3. **Hash SDK lệch giữa module đã build và script được chèn/phục vụ.** Test: Task 3 `serves the funnel with __IKF … and the SDK this instance serves` (hash trong `<script src>` = `buildSdk().hash`, body = `packages/sdk/dist/ikf.min.js`); Task 4 smoke `serves a real funnel with __IKF and the SDK`.
4. **Queue consumer không chạy trong Miniflare** (sai tên queue, sai binding, hoặc workerd từ chối bundle consumer vì named export — A2). Test: Task 3 `POST /_ikf/c goes through the queue to the consumer and into ClickHouse` (ClickHouse giả, kiểm `query`, `database=ikf`, Basic auth, `country`); Task 4 `a POST to /_ikf/c lands in ClickHouse within 15 seconds` (ClickHouse thật).
5. **State cũ của Postgres/ClickHouse giữa các lần chạy làm publish idempotent trỏ vào bundle không tồn tại** (`created: false` + R2 trống → `502`; route của funnel cũ còn trong KV). Test: Task 4 `a second start on the same Postgres state reuses the versions and still serves them` (đã kiểm bằng mutation: bỏ re-put → `expected 502 to be 200`); Task 5 Step 4 (`--funnels moon-reading` → `/ewa-books` trả `404`).

## File Structure (repo `ikf-platform`, phần mới/sửa)

```
ikf-platform/
├── package.json                 # SỬA: scripts demo, demo:events, demo:down, demo:test; devDependencies
├── package-lock.json            # SỬA
├── .gitignore                   # SỬA: demo/.build/
└── demo/                        # MỚI
    ├── compose.yaml             # Postgres 17 + ClickHouse 25.8, volume có tên, healthcheck
    ├── vitest.config.mjs        # demo:test (local, không CI)
    ├── run.mjs                  # npm run demo / demo:down: cờ, in URL, Ctrl-C
    ├── events.mjs               # npm run demo:events
    ├── README.md
    ├── lib/
    │   ├── docker.mjs           # DemoError, ensureDocker, composeUp/Down, checkPortsFree
    │   ├── media.mjs            # rewriteMedia, startMediaServer
    │   ├── adapters.mjs         # miniflareStore(r2), miniflareKv(kv)
    │   ├── miniflare.mjs        # bundleWorker, startMiniflare
    │   ├── funnels.mjs          # findFunnels, pickFunnels, registerHosts, publishFunnels
    │   └── stack.mjs            # startStack, clickhouse(), lanIp()
    └── test/
        ├── docker.test.mjs, media.test.mjs, adapters.test.mjs, miniflare.test.mjs
        ├── funnels.test.mjs, stack.test.mjs
        └── demo.test.mjs        # end-to-end (Docker)
```

---

### Task 1: Nhánh + worktree, deps, `compose.yaml`, kiểm tra Docker/cổng

**Files:**
- Create: `demo/compose.yaml`, `demo/vitest.config.mjs`, `demo/lib/docker.mjs`
- Test: `demo/test/docker.test.mjs`
- Modify: `package.json` (devDependencies, script `demo:test`), `package-lock.json`

**Interfaces:**
- Produces (dùng ở Task 4, 5):
  - `class DemoError extends Error` — mọi lỗi người dùng phải tự xử lý; `run.mjs` in `ikf demo: <message>`.
  - `COMPOSE_FILE: string` (đường dẫn tuyệt đối `demo/compose.yaml`)
  - `run(cmd, args): Promise<{code, stdout, stderr}>` — không bao giờ throw; `code = 127` khi thiếu binary.
  - `ensureDocker({exec = run}?)`, `composeUp({exec}?)`, `composeDown({volumes = false, exec}?)` — throw `DemoError`.
  - `checkPortsFree(ports: Record<port, label>)` — throw `DemoError('Port <p> (<label>) is already in use. …')`.
- Compose project `ikf-demo`, service `postgres` (`127.0.0.1:54329`), `clickhouse` (`127.0.0.1:18123`), volume `pg-data`, `ch-data`.

- [ ] **Step 1: Worktree + nhánh**

Main checkout `/Users/daothinh/ikf-platform` có thể đang được session khác dùng; làm trong worktree riêng:

```bash
git -C /Users/daothinh/ikf-platform fetch origin
git -C /Users/daothinh/ikf-platform worktree add -b feat/local-demo /Users/daothinh/ikf-platform-demo feat/runtime-sdk-collector
cd /Users/daothinh/ikf-platform-demo
git log --oneline -1          # 4f25cf4 docs: CLAUDE.md with layout, test commands and conventions
npm ci
```

Mọi lệnh từ đây chạy trong `/Users/daothinh/ikf-platform-demo`.

- [ ] **Step 2: Deps của demo (root devDependencies) + script test**

```bash
npm install -D --save-exact miniflare@4.20260310.0
npm install -D esbuild@^0.25.12 pg@^8.23.1 vitest@~3.2.0
npm pkg set scripts.demo:test="vitest run --config demo/vitest.config.mjs"
npm ls miniflare esbuild --depth=0
```
Expected: `npm ls` có `├── esbuild@0.25.12` và `└── miniflare@4.20260310.0` ở root (`@ikf/sdk` → `esbuild@0.25.12 deduped`). `npm` 11 có thể in cảnh báo `allow-scripts` cho postinstall của esbuild: bỏ qua (binary lấy từ `@esbuild/darwin-arm64`). `git diff --stat` thấy `package-lock.json` đổi ~3300 dòng: npm 11 sắp lại chỗ hoist của esbuild (`0.25.12` lên root, `vite` giữ `0.28.x` lồng bên trong); bình thường.

- [ ] **Step 3: `demo/compose.yaml` + config Vitest**

```bash
mkdir -p demo/lib demo/test
```

`demo/compose.yaml`:

```yaml
# Local demo data stores. Started by `npm run demo`, stopped by `npm run demo:down`.
name: ikf-demo
services:
  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_DB: ikf
      POSTGRES_USER: ikf
      POSTGRES_PASSWORD: ikf
    ports: ["127.0.0.1:54329:5432"]
    volumes: [pg-data:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ikf -d ikf"]
      interval: 1s
      timeout: 3s
      retries: 60
  clickhouse:
    image: clickhouse/clickhouse-server:25.8
    environment:
      CLICKHOUSE_DB: ikf
      CLICKHOUSE_USER: ikf
      CLICKHOUSE_PASSWORD: ikf
      CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT: "1"
    ports: ["127.0.0.1:18123:8123"]
    volumes: [ch-data:/var/lib/clickhouse]
    ulimits:
      nofile: { soft: 262144, hard: 262144 }
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://127.0.0.1:8123/ping || exit 1"]
      interval: 1s
      timeout: 3s
      retries: 60
volumes:
  pg-data:
  ch-data:
```

`demo/vitest.config.mjs`:

```js
import { defineConfig } from 'vitest/config';

// Local only (needs Docker for test/demo.test.mjs); not part of `npm test` or CI.
export default defineConfig({
  test: {
    root: new URL('.', import.meta.url).pathname,
    include: ['test/**/*.test.mjs'],
    testTimeout: 120_000,
    hookTimeout: 120_000,
    fileParallelism: false,
  },
});
```

```bash
docker compose -f demo/compose.yaml up -d --wait
curl -s -u ikf:ikf 'http://127.0.0.1:18123/?database=ikf' --data 'SELECT version()'
docker compose -f demo/compose.yaml ps --format '{{.Service}} {{.Status}}'
```
Expected: `Container ikf-demo-postgres-1  Healthy`, `Container ikf-demo-clickhouse-1  Healthy` (lần đầu kéo image ~1 phút); `curl` in `25.8.x.y` (lúc viết plan `25.8.33.6`; nếu rỗng thì chờ 2 giây chạy lại — xem A9); `ps` in `clickhouse Up … (healthy)` và `postgres Up … (healthy)`.

- [ ] **Step 4: Viết test fail**

`demo/test/docker.test.mjs`:

```js
import { createServer } from 'node:net';
import { describe, it, expect } from 'vitest';
import { checkPortsFree, composeUp, ensureDocker, DemoError } from '../lib/docker.mjs';

const fakeExec = (answers) => async (cmd, args) => answers[args.slice(0, 2).join(' ')] ?? { code: 0, stdout: '', stderr: '' };

describe('ensureDocker', () => {
  it('tells you to start colima when the daemon is down', async () => {
    const exec = fakeExec({ 'info --format': { code: 1, stdout: '', stderr: 'Cannot connect to the Docker daemon' } });
    await expect(ensureDocker({ exec })).rejects.toThrow(/colima start/);
  });
  it('tells you to install the CLI when docker is missing', async () => {
    const exec = fakeExec({ 'info --format': { code: 127, stdout: '', stderr: '' } });
    await expect(ensureDocker({ exec })).rejects.toThrow(/brew install docker/);
  });
  it('tells you to install docker compose when the plugin is missing', async () => {
    const exec = fakeExec({ 'compose version': { code: 1, stdout: '', stderr: "unknown command: docker compose" } });
    await expect(ensureDocker({ exec })).rejects.toThrow(/brew install docker-compose/);
  });
  it('passes when both answer', async () => {
    await expect(ensureDocker({ exec: fakeExec({}) })).resolves.toBeUndefined();
  });
});

describe('composeUp', () => {
  it('surfaces compose stderr (e.g. a host port taken by another container)', async () => {
    const exec = fakeExec({ 'compose -f': { code: 1, stdout: '', stderr: 'Bind for 127.0.0.1:54329 failed: port is already allocated' } });
    const err = await composeUp({ exec }).catch((e) => e);
    expect(err).toBeInstanceOf(DemoError);
    expect(err.message).toMatch(/54329/);
  });
});

describe('checkPortsFree', () => {
  it('names the busy port and its role', async () => {
    const srv = createServer();
    await new Promise((r) => srv.listen(0, '127.0.0.1', r));
    const { port } = srv.address();
    try {
      await expect(checkPortsFree({ [port]: 'edge (Miniflare)' })).rejects.toThrow(
        new RegExp(`Port ${port} \\(edge \\(Miniflare\\)\\) is already in use`),
      );
    } finally {
      await new Promise((r) => srv.close(r));
    }
  });
  it('passes for a free port', async () => {
    const srv = createServer();
    await new Promise((r) => srv.listen(0, '127.0.0.1', r));
    const { port } = srv.address();
    await new Promise((r) => srv.close(r));
    await expect(checkPortsFree({ [port]: 'x' })).resolves.toBeUndefined();
  });
});
```

Run: `npm run demo:test -- test/docker.test.mjs`
Expected: FAIL `Error: Cannot find module '../lib/docker.mjs' imported from '…/demo/test/docker.test.mjs'` rồi `Tests  no tests`.

- [ ] **Step 5: Implement**

`demo/lib/docker.mjs`:

```js
// Docker / docker compose / port checks for the local demo. Every failure is a DemoError with a
// message that says what to run next.
import { execFile } from 'node:child_process';
import { connect, createServer } from 'node:net';
import { fileURLToPath } from 'node:url';

export class DemoError extends Error {}

export const COMPOSE_FILE = fileURLToPath(new URL('../compose.yaml', import.meta.url));

// Never throws: { code, stdout, stderr }; code 127 when the binary is missing.
export function run(cmd, args) {
  return new Promise((resolve) => {
    execFile(cmd, args, { maxBuffer: 16 * 1024 * 1024 }, (err, stdout, stderr) => {
      const code = err ? (err.code === 'ENOENT' ? 127 : typeof err.code === 'number' ? err.code : 1) : 0;
      resolve({ code, stdout: String(stdout ?? ''), stderr: String(stderr ?? '') });
    });
  });
}

export async function ensureDocker({ exec = run } = {}) {
  const info = await exec('docker', ['info', '--format', '{{.ServerVersion}}']);
  if (info.code === 127) throw new DemoError('Docker CLI not found. Install it with: brew install docker docker-compose colima');
  if (info.code !== 0) throw new DemoError('Docker is not running. Start it with: colima start');
  const compose = await exec('docker', ['compose', 'version']);
  if (compose.code !== 0) throw new DemoError('docker compose is not available. Install it with: brew install docker-compose');
}

export async function composeUp({ exec = run } = {}) {
  const r = await exec('docker', ['compose', '-f', COMPOSE_FILE, 'up', '-d', '--wait']);
  if (r.code !== 0) throw new DemoError(`docker compose up failed:\n${r.stderr.trim()}`);
}

export async function composeDown({ volumes = false, exec = run } = {}) {
  const r = await exec('docker', ['compose', '-f', COMPOSE_FILE, 'down', ...(volumes ? ['--volumes'] : [])]);
  if (r.code !== 0) throw new DemoError(`docker compose down failed:\n${r.stderr.trim()}`);
}

const canConnect = (port) =>
  new Promise((resolve) => {
    const s = connect({ host: '127.0.0.1', port });
    s.once('connect', () => { s.destroy(); resolve(true); });
    s.once('error', () => resolve(false));
  });

const canBind = (port) =>
  new Promise((resolve) => {
    const srv = createServer();
    srv.once('error', () => resolve(false));
    srv.listen({ host: '0.0.0.0', port, exclusive: true }, () => srv.close(() => resolve(true)));
  });

// ports: { 8787: 'edge (Miniflare)', ... }. Busy = something answers on 127.0.0.1 or 0.0.0.0 cannot be bound.
export async function checkPortsFree(ports) {
  for (const [port, label] of Object.entries(ports)) {
    const p = Number(port);
    if ((await canConnect(p)) || !(await canBind(p))) {
      throw new DemoError(`Port ${p} (${label}) is already in use. Find the process with: lsof -nP -iTCP:${p} -sTCP:LISTEN`);
    }
  }
}
```

- [ ] **Step 6: Chạy test**

Run: `npm run demo:test -- test/docker.test.mjs`
Expected: `Tests  7 passed (7)`.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json demo/compose.yaml demo/vitest.config.mjs demo/lib/docker.mjs demo/test/docker.test.mjs
git commit -m "demo: compose stack (Postgres 17, ClickHouse 25.8) and Docker/port checks with actionable errors"
```

---

### Task 2: Media — `rewriteMedia` + server tĩnh cho `img/`

**Files:**
- Create: `demo/lib/media.mjs`
- Test: `demo/test/media.test.mjs`

**Interfaces:**
- Consumes: `validateBundle(html, {slug, mediaOrigins})` từ `services/core-api/src/publisher/validate.js` (chỉ trong test).
- Produces (dùng ở Task 4):
  - `rewriteMedia(html, slug, base): string` — mọi `img/` / `./img/` đứng sau `'` `"` `` ` `` `(` thành `<base>/<slug>/img/`; `data:`, URL tuyệt đối và chữ thường trong văn bản giữ nguyên.
  - `startMediaServer({dirs: Map<slug, funnelDir>, port = 8790, host = '0.0.0.0'}): Promise<{port, close()}>` — `GET|HEAD /<slug>/img/<file>` (ảnh/video theo đuôi, `access-control-allow-origin: *`), còn lại `404`, chặn `..`.

- [ ] **Step 1: Viết test fail**

`demo/test/media.test.mjs`:

```js
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { validateBundle } from '../../services/core-api/src/publisher/validate.js';
import { rewriteMedia, startMediaServer } from '../lib/media.mjs';

const BASE = 'http://10.0.0.7:8790';
const FUNNELS_DIR = process.env.IKF_FUNNELS_DIR || '/Users/daothinh/ikame/funnel/funnel-development';

describe('rewriteMedia', () => {
  it('rewrites the IMG map keys and values and the im() lookups the same way', () => {
    const html = `/*IMG-START*/{'img/a.jpg':'img/a.jpg',"img/b.png":"img/b.png"}/*IMG-END*/; im('img/a.jpg')`;
    expect(rewriteMedia(html, 'ewa-books', BASE)).toBe(
      `/*IMG-START*/{'${BASE}/ewa-books/img/a.jpg':'${BASE}/ewa-books/img/a.jpg',"${BASE}/ewa-books/img/b.png":"${BASE}/ewa-books/img/b.png"}/*IMG-END*/; im('${BASE}/ewa-books/img/a.jpg')`,
    );
  });
  it('rewrites attributes, css url(), ./img/ and template literals', () => {
    const html = '<img src="img/x.jpg"><div style="background:url(img/bg.webp)"></div><img src=\'./img/y.jpg\'><script>s=`img/use-${k}.jpg`</script>';
    expect(rewriteMedia(html, 'coursiv', `${BASE}/`)).toBe(
      `<img src="${BASE}/coursiv/img/x.jpg"><div style="background:url(${BASE}/coursiv/img/bg.webp)"></div><img src='${BASE}/coursiv/img/y.jpg'><script>s=\`${BASE}/coursiv/img/use-\${k}.jpg\`</script>`,
    );
  });
  it('keeps data:, absolute URLs and prose untouched', () => {
    const html = '<img src="data:image/png;base64,AAA"><img src="https://cdn.x.com/img/a.jpg"><p>put photos in <code>img/</code></p>';
    expect(rewriteMedia(html, 'calmio', BASE)).toBe(html);
  });
});

// Review Focus 1: a reference the rewrite misses makes the publisher answer 422.
const DEFAULTS = { 'ewa-books': 'learning/ewa-books', 'calmio-calm-kids': 'mental-health/calmio-calm-kids', 'moon-reading': 'nebula/moon-reading' };
describe.skipIf(!existsSync(FUNNELS_DIR))('default funnels pass the publisher validator after rewriting', () => {
  it.each(Object.entries(DEFAULTS))('%s', (slug, rel) => {
    const html = readFileSync(join(FUNNELS_DIR, rel, 'demo.html'), 'utf8');
    expect(validateBundle(html, { slug, mediaOrigins: [BASE] })).toMatchObject({ ok: false, status: 422 });
    const out = rewriteMedia(html, slug, BASE);
    expect(validateBundle(out, { slug, mediaOrigins: [BASE] })).toMatchObject({ ok: true });
    expect(out).not.toMatch(/['"`(](\.\/)?img\//);
  });
});

describe('startMediaServer', () => {
  let srv;
  let base;
  beforeAll(async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ikf-media-'));
    mkdirSync(join(dir, 'img'));
    writeFileSync(join(dir, 'img', 'a.jpg'), 'JPEGDATA');
    writeFileSync(join(dir, 'demo.html'), '<html>');
    srv = await startMediaServer({ dirs: new Map([['ewa-books', dir]]), port: 0, host: '127.0.0.1' });
    base = `http://127.0.0.1:${srv.port}`;
  });
  afterAll(() => srv.close());

  it('serves a file from the funnel img/ folder with an image type', async () => {
    const res = await fetch(`${base}/ewa-books/img/a.jpg`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/jpeg');
    expect(await res.text()).toBe('JPEGDATA');
  });
  it.each(['/ewa-books/img/missing.jpg', '/other/img/a.jpg', '/ewa-books/img/%2e%2e/demo.html', '/ewa-books/demo.html'])('404 for %s', async (p) => {
    expect((await fetch(base + p)).status).toBe(404);
  });
});
```

Run: `npm run demo:test -- test/media.test.mjs`
Expected: FAIL `Error: Cannot find module '../lib/media.mjs' imported from '…/demo/test/media.test.mjs'` rồi `Tests  no tests`.

- [ ] **Step 2: Implement**

`demo/lib/media.mjs`:

```js
// Local stand-in for the media CDN: serves each funnel's img/ folder at <base>/<slug>/img/<file>,
// and rewrites the funnel HTML so every img/ reference points there (the publisher only accepts
// absolute media URLs under mediaOrigins).
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';

// A quote, backtick or "(" (CSS url()) directly before img/ or ./img/. This covers the IMG map
// keys and values, im('img/x.jpg') calls, src="img/…", url(img/…) and template literals
// (`img/use-${k}.jpg`); prose such as "<code>img/</code>" is left alone.
const IMG_REF = /(['"`(])(?:\.\/)?img\//g;

export function rewriteMedia(html, slug, base) {
  const root = `${base.replace(/\/+$/, '')}/${slug}/img/`;
  return html.replace(IMG_REF, (_, q) => `${q}${root}`);
}

const TYPES = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.avif': 'image/avif', '.mp4': 'video/mp4', '.webm': 'video/webm',
};

// dirs: Map<slug, absolute funnel folder (the one holding demo.html and img/)>.
export async function startMediaServer({ dirs, port = 8790, host = '0.0.0.0' }) {
  const server = createServer(async (req, res) => {
    const m = /^\/([a-z0-9][a-z0-9-]{1,62})\/img\/(.+)$/.exec(decodeURIComponent(new URL(req.url, 'http://x').pathname));
    const dir = m && dirs.get(m[1]);
    const imgDir = dir && resolve(dir, 'img');
    const file = imgDir && resolve(imgDir, m[2]);
    if (!file || !file.startsWith(imgDir + sep) || !TYPES[extname(file).toLowerCase()]) return res.writeHead(404).end();
    try {
      const s = await stat(file);
      if (!s.isFile()) return res.writeHead(404).end();
      res.writeHead(200, {
        'content-type': TYPES[extname(file).toLowerCase()],
        'content-length': s.size,
        'cache-control': 'no-cache',
        'access-control-allow-origin': '*',
      });
      if (req.method === 'HEAD') return res.end();
      createReadStream(file).pipe(res);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((ok, fail) => {
    server.once('error', fail);
    server.listen(port, host, ok);
  });
  return {
    port: server.address().port,
    close: () => new Promise((ok) => { server.closeAllConnections(); server.close(() => ok()); }),
  };
}
```

- [ ] **Step 3: Chạy test**

Run: `npm run demo:test -- test/media.test.mjs`
Expected: `Tests  11 passed (11)`. Không có thư mục funnel (`IKF_FUNNELS_DIR` / `/Users/daothinh/ikame/funnel/funnel-development`) thì `Tests  8 passed | 3 skipped (11)`.

- [ ] **Step 4: Commit**

```bash
git add demo/lib/media.mjs demo/test/media.test.mjs
git commit -m "demo: media server for funnel img/ folders and HTML rewrite to absolute media URLs"
```

---

### Task 3: Miniflare — 2 Worker, queue producer → consumer, adapter R2/KV cho core

**Files:**
- Create: `demo/lib/adapters.mjs`, `demo/lib/miniflare.mjs`
- Test: `demo/test/adapters.test.mjs`, `demo/test/miniflare.test.mjs`
- Modify: `.gitignore` (`demo/.build/`)

**Interfaces:**
- Consumes: `buildSdk()` (`packages/sdk/scripts/build.mjs`, ghi `workers/edge-router/src/sdk-bundle.generated.js` + `packages/sdk/dist/ikf.min.js`), `wrangler.json` của 2 Worker, `StoreUnavailableError`, `KvUnavailableError`.
- Produces (dùng ở Task 4):
  - `miniflareStore(r2)` → `{put(key, body, {sha256})}` (= interface `createR2Store`; lỗi → `StoreUnavailableError` → publish `503 r2_unavailable`).
  - `miniflareKv(kv)` → `{put(key, value)}` (= `createKvClient`; lỗi → `KvUnavailableError` → `kv_sync: 'pending'`).
  - `bundleWorker(dir): Promise<{cfg, outfile}>` — esbuild ESM, `platform: 'neutral'`, conditions `workerd/worker/browser`, ra `demo/.build/<name>.mjs`; entry chỉ re-export `default` (A2).
  - `startMiniflare({host = '0.0.0.0', port = 8787, country = 'VN', clickhouse: {url, user, password}, ipSalt, previewHost = 'preview.localhost', verbose}): Promise<{mf, url, sdkHash, routes /* KVNamespace */, bundles /* R2Bucket */, dispose()}>`.

- [ ] **Step 1: Viết test fail cho adapter**

`demo/test/adapters.test.mjs`:

```js
import { describe, it, expect } from 'vitest';
import { StoreUnavailableError } from '../../services/core-api/src/publisher/bundle-store.js';
import { KvUnavailableError } from '../../services/core-api/src/publisher/route-kv.js';
import { miniflareKv, miniflareStore } from '../lib/adapters.mjs';

const recorder = (fail = false) => {
  const calls = [];
  return {
    calls,
    async put(...args) {
      calls.push(args);
      if (fail) throw new Error('boom');
    },
  };
};

describe('miniflareStore', () => {
  it('puts the bundle with an html content type and the sha256 as custom metadata', async () => {
    const r2 = recorder();
    await miniflareStore(r2).put('bundles/x/v1/index.html', '<html>', { sha256: 'ab'.repeat(32) });
    expect(r2.calls).toEqual([
      ['bundles/x/v1/index.html', '<html>', { httpMetadata: { contentType: 'text/html; charset=utf-8' }, customMetadata: { sha256: 'ab'.repeat(32) } }],
    ]);
  });
  it('throws StoreUnavailableError like createR2Store, so publish answers 503', async () => {
    await expect(miniflareStore(recorder(true)).put('k', 'b', { sha256: 's' })).rejects.toBeInstanceOf(StoreUnavailableError);
  });
});

describe('miniflareKv', () => {
  it('puts the value under the key', async () => {
    const kv = recorder();
    await miniflareKv(kv).put('route:localhost', '{"rev":1,"routes":[]}');
    expect(kv.calls).toEqual([['route:localhost', '{"rev":1,"routes":[]}']]);
  });
  it('throws KvUnavailableError like createKvClient, so route changes report kv_sync pending', async () => {
    await expect(miniflareKv(recorder(true)).put('k', 'v')).rejects.toBeInstanceOf(KvUnavailableError);
  });
});
```

Run: `npm run demo:test -- test/adapters.test.mjs`
Expected: FAIL `Error: Cannot find module '../lib/adapters.mjs' imported from '…/demo/test/adapters.test.mjs'` rồi `Tests  no tests`.

- [ ] **Step 2: Implement adapter**

`demo/lib/adapters.mjs`:

```js
// core-api's publisher writes bundles to R2 (createR2Store) and route docs to KV (createKvClient).
// In the demo both go straight into Miniflare's bindings, with the same interface and error types.
import { StoreUnavailableError } from '../../services/core-api/src/publisher/bundle-store.js';
import { KvUnavailableError } from '../../services/core-api/src/publisher/route-kv.js';

export function miniflareStore(r2) {
  return {
    async put(key, body, { sha256 }) {
      try {
        await r2.put(key, body, { httpMetadata: { contentType: 'text/html; charset=utf-8' }, customMetadata: { sha256 } });
      } catch (err) {
        throw new StoreUnavailableError(`r2 put ${key}: ${err.message}`, { cause: err });
      }
    },
  };
}

export function miniflareKv(kv) {
  return {
    async put(key, value) {
      try {
        await kv.put(key, value);
      } catch (err) {
        throw new KvUnavailableError(`kv put ${key}: ${err.message}`, { cause: err });
      }
    },
  };
}
```

Run: `npm run demo:test -- test/adapters.test.mjs`
Expected: `Tests  4 passed (4)`.

- [ ] **Step 3: Viết test fail cho Miniflare**

Không cần Docker: ClickHouse là một server Node ghi lại mọi request insert.

`demo/test/miniflare.test.mjs`:

```js
// Both Workers in Miniflare, no Docker: ClickHouse is a Node server that records inserts.
import { readFileSync } from 'node:fs';
import { createServer, request } from 'node:http';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { miniflareKv, miniflareStore } from '../lib/adapters.mjs';
import { startMiniflare } from '../lib/miniflare.mjs';

// fetch() cannot set Host; a phone on the LAN sends Host: <lan ip>:8787.
function get(url, host) {
  return new Promise((resolve, reject) => {
    const req = request(url, { headers: { host } }, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

const until = async (fn, ms) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const v = await fn();
    if (v) return v;
    await new Promise((r) => setTimeout(r, 200));
  }
  return fn();
};

describe('edge-router + event-consumer in Miniflare', () => {
  let ch;
  let inserts;
  let stack;
  let origin;

  beforeAll(async () => {
    inserts = [];
    ch = createServer((req, res) => {
      let body = '';
      req.on('data', (c) => { body += c; });
      req.on('end', () => {
        inserts.push({ url: req.url, auth: req.headers.authorization, body });
        res.writeHead(200).end();
      });
    });
    await new Promise((r) => ch.listen(0, '127.0.0.1', r));
    stack = await startMiniflare({
      host: '127.0.0.1',
      port: 0,
      country: 'DE',
      clickhouse: { url: `http://127.0.0.1:${ch.address().port}`, user: 'ikf', password: 'ikf' },
    });
    origin = stack.url.origin;
    const html = '<!doctype html><html><head><title>t</title></head><body><script>CONFIG={funnel:"demo-x"}</script></body></html>';
    await miniflareStore(stack.bundles).put('bundles/demo-x/v1/index.html', html, { sha256: 'x' });
    const doc = JSON.stringify({ rev: 3, routes: [{ prefix: '/demo-x', bundle: 'bundles/demo-x/v1/index.html', funnel: 'demo-x', v: 1, pixel: null }] });
    for (const host of ['localhost', '10.1.2.3']) await miniflareKv(stack.routes).put(`route:${host}`, doc);
  }, 120_000);

  afterAll(async () => {
    await stack?.dispose();
    await new Promise((r) => ch.close(r));
  });

  it('serves the funnel with __IKF (country from the cf flag) and the SDK this instance serves', async () => {
    const res = await get(`${origin}/demo-x`, 'localhost:8787');
    expect(res.status).toBe(200);
    expect(res.body).toContain('window.__IKF={"funnel":"demo-x","v":1,"rev":3,"country":"DE","pixel":null}');
    // Review Focus 3: the script tag hash is the hash of the module built for this run, and it is served.
    const src = /<script src="(\/_ikf\/sdk\.([0-9a-f]{12})\.js)"><\/script>/.exec(res.body);
    expect(src?.[2]).toBe(stack.sdkHash);
    const sdk = await get(`${origin}${src[1]}`, 'localhost:8787');
    expect(sdk.status).toBe(200);
    expect(sdk.body).toBe(readFileSync(new URL('../../packages/sdk/dist/ikf.min.js', import.meta.url), 'utf8'));
  });

  // Review Focus 2: routing is by Host; a phone uses the LAN IP, which must have its own route doc.
  it('routes by the Host header: a registered LAN IP works, an unregistered one is 404', async () => {
    expect((await get(`${origin}/demo-x`, '10.1.2.3:8787')).status).toBe(200);
    expect((await get(`${origin}/demo-x`, '10.9.9.9:8787')).status).toBe(404);
  });

  // Review Focus 4: the producer binding reaches the consumer Worker, which inserts into ClickHouse.
  it('POST /_ikf/c goes through the queue to the consumer and into ClickHouse', async () => {
    const id = '01JA0000000000000000000099';
    const event = { id, sid: '01JA0000000000000000000098', t: Date.now(), name: 'page_load', funnel: 'demo-x', v: 1, rev: 3, host: 'localhost', path: '/demo-x' };
    const res = await fetch(`${origin}/_ikf/c`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin },
      body: JSON.stringify({ events: [event] }),
    });
    expect(res.status).toBe(204);
    const hit = await until(() => inserts.find((i) => i.body.includes(id)), 15_000);
    expect(hit).toBeTruthy();
    const q = new URL(hit.url, 'http://ch').searchParams;
    expect(q.get('query')).toBe('INSERT INTO events FORMAT JSONEachRow');
    expect(q.get('database')).toBe('ikf');
    expect(hit.auth).toBe(`Basic ${btoa('ikf:ikf')}`);
    expect(JSON.parse(hit.body)).toMatchObject({ id, name: 'page_load', funnel: 'demo-x', country: 'DE' });
  });
});
```

Run: `npm run demo:test -- test/miniflare.test.mjs`
Expected: FAIL `Error: Cannot find module '../lib/miniflare.mjs' imported from '…/demo/test/miniflare.test.mjs'` rồi `Tests  no tests`.

- [ ] **Step 4: Implement**

`demo/lib/miniflare.mjs`:

```js
// Runs workers/edge-router and workers/event-consumer in one Miniflare instance, bundled with
// esbuild the way wrangler does, with the queue producer (EVENTS) wired to the consumer.
import { mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { Log, LogLevel, Miniflare } from 'miniflare';
import { buildSdk } from '../../packages/sdk/scripts/build.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
export const BUILD_DIR = join(ROOT, 'demo/.build');

// Same settings wrangler 4 uses for a modules Worker: ESM, workspace imports bundled in.
// Only the default export is kept: workerd treats every named export of the main module as an
// entrypoint and refuses to start on a constant (event-consumer exports MAX_RETRIES, FAILING_AFTER).
export async function bundleWorker(dir) {
  const cfg = JSON.parse(await readFile(join(ROOT, dir, 'wrangler.json'), 'utf8'));
  const outfile = join(BUILD_DIR, `${cfg.name}.mjs`);
  await mkdir(BUILD_DIR, { recursive: true });
  await build({
    stdin: { contents: `export { default } from ${JSON.stringify(join(ROOT, dir, cfg.main))};`, resolveDir: ROOT, sourcefile: `${cfg.name}-entry.mjs` },
    outfile,
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    target: 'es2022',
    conditions: ['workerd', 'worker', 'browser'],
    mainFields: ['workerd', 'worker', 'browser', 'module', 'main'],
    logLevel: 'silent',
  });
  return { cfg, outfile };
}

export async function startMiniflare({
  host = '0.0.0.0',
  port = 8787,
  country = 'VN',
  clickhouse,
  ipSalt = 'ikf-demo-salt',
  previewHost = 'preview.localhost',
  verbose = false,
}) {
  // Writes workers/edge-router/src/sdk-bundle.generated.js, which the edge-router bundle imports.
  const sdk = await buildSdk();
  const edge = await bundleWorker('workers/edge-router');
  const consumer = await bundleWorker('workers/event-consumer');
  const producer = edge.cfg.queues.producers[0];
  const qc = consumer.cfg.queues.consumers[0];
  if (producer.queue !== qc.queue) throw new Error(`queue mismatch: ${producer.queue} vs ${qc.queue}`);

  const mf = new Miniflare({
    host,
    port,
    cf: { country },
    // ERROR by default: the compatibility-date fallback warning would print on every start.
    log: new Log(verbose ? LogLevel.INFO : LogLevel.ERROR),
    workers: [
      {
        name: edge.cfg.name,
        modules: true,
        scriptPath: edge.outfile,
        compatibilityDate: edge.cfg.compatibility_date,
        bindings: { ...edge.cfg.vars, SDK_ENABLED: 'true', PREVIEW_HOST: previewHost, IP_SALT: ipSalt },
        kvNamespaces: { ROUTES: 'ikf-demo-routes' },
        r2Buckets: { BUNDLES: 'ikf-demo-bundles' },
        queueProducers: { [producer.binding]: { queueName: producer.queue } },
      },
      {
        name: consumer.cfg.name,
        modules: true,
        scriptPath: consumer.outfile,
        compatibilityDate: consumer.cfg.compatibility_date,
        bindings: {
          ...consumer.cfg.vars,
          CLICKHOUSE_URL: clickhouse.url,
          CLICKHOUSE_USER: clickhouse.user,
          CLICKHOUSE_PASSWORD: clickhouse.password,
          // SNS alarms cannot reach AWS from the demo; a failed publish is only logged.
          AWS_ACCESS_KEY_ID: 'demo',
          AWS_SECRET_ACCESS_KEY: 'demo',
        },
        kvNamespaces: { STATE: 'ikf-demo-consumer-state' },
        queueConsumers: {
          // 1s instead of 10s so events show up in ClickHouse right away.
          [qc.queue]: { maxBatchSize: qc.max_batch_size, maxBatchTimeout: 1, maxRetries: qc.max_retries, deadLetterQueue: qc.dead_letter_queue },
        },
      },
    ],
  });
  const url = await mf.ready;
  return {
    mf,
    url,
    sdkHash: sdk.hash,
    routes: await mf.getKVNamespace('ROUTES', edge.cfg.name),
    bundles: await mf.getR2Bucket('BUNDLES', edge.cfg.name),
    dispose: () => mf.dispose(),
  };
}
```

Thêm vào cuối `.gitignore`:

```
# local demo (demo/)
demo/.build/
```

- [ ] **Step 5: Chạy test**

Run: `npm run demo:test -- test/adapters.test.mjs test/miniflare.test.mjs`
Expected: `Tests  7 passed (7)`; test queue mất ~1 giây (`maxBatchTimeout: 1`). `git status --short` không liệt kê `demo/.build/` hay `sdk-bundle.generated.js`.

Nếu muốn tự thấy lý do của A2: tạm đổi `stdin` thành `entryPoints: [join(ROOT, dir, cfg.main)]` → `MiniflareCoreError [ERR_RUNTIME_FAILURE]`, stderr `Incorrect type for map entry 'FAILING_AFTER'`. Đổi lại trước khi commit.

- [ ] **Step 6: Commit**

```bash
git add .gitignore demo/lib/adapters.mjs demo/lib/miniflare.mjs demo/test/adapters.test.mjs demo/test/miniflare.test.mjs
git commit -m "demo: edge-router + event-consumer in one Miniflare with queue wiring; R2/KV adapters for core"
```

---

### Task 4: Funnel + stack — publish qua core-api, route `localhost` + IP LAN, smoke test end-to-end

**Files:**
- Create: `demo/lib/funnels.mjs`, `demo/lib/stack.mjs`
- Test: `demo/test/funnels.test.mjs`, `demo/test/stack.test.mjs`, `demo/test/demo.test.mjs`

**Interfaces:**
- Consumes: Task 1 (`DemoError`, `ensureDocker`, `composeUp`, `checkPortsFree`), Task 2 (`rewriteMedia`, `startMediaServer`), Task 3 (`startMiniflare`, `miniflareStore`, `miniflareKv`); core: `buildApp`, `ensureToken`, `migrate`, `bundleKey`, `sha256Hex`, `setRoute`, `listRoutes`, `removeRoute`; `clickhouse/001_events.sql`.
- Produces (dùng ở Task 5):
  - `DEFAULT_FUNNELS = ['ewa-books', 'calmio-calm-kids', 'moon-reading']`, `DEFAULT_FUNNELS_DIR`
  - `findFunnels(dir): Promise<Map<slug, folder>>` (throw `DemoError('Funnels folder not found: …')`), `pickFunnels(index, slugs): {slug, dir}[]`
  - `registerHosts(pool, hosts)`, `publishFunnels({coreUrl, token, pool, store, kv, funnels, hosts, mediaBase, pixel}): Promise<{slug, v, created}[]>`
  - `DEMO_TOKEN = 'ikf_demo_admin'`, `PORTS = {edge: 8787, core: 8080, media: 8790}`, `PG`, `CH`
  - `lanIp(ifaces?): string | null`, `clickhouse(sql, {params}?): Promise<string>` (tham số ClickHouse `{name:Type}` → `param_<name>`)
  - `startStack({funnels, funnelsDir, country = 'VN', lan = true, pixel = null, ports = PORTS, verbose}): Promise<{published: {slug, v, created, urls}[], hosts, lanIp, country, sdkHash, edgeUrl, coreUrl, mediaBase, adminToken, stop()}>` — `stop()` idempotent, đóng theo thứ tự ngược (core → Miniflare → media → pool); lỗi giữa chừng thì dọn phần đã mở rồi throw.

**Thứ tự trong `startStack`:** chọn funnel (thiếu thư mục → lỗi ngay, chưa đụng Docker) → kiểm cổng → Docker + `compose up --wait` → migrate + token → chờ ClickHouse + DDL → media server → Miniflare → core-api listen → publish (re-put bundle, A3) → host + route → pixel.

- [ ] **Step 1: Viết test fail cho chọn funnel**

`demo/test/funnels.test.mjs`:

```js
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { DemoError } from '../lib/docker.mjs';
import { findFunnels, pickFunnels } from '../lib/funnels.mjs';

function tree() {
  const root = mkdtempSync(join(tmpdir(), 'ikf-funnels-'));
  const add = (rel, html) => {
    mkdirSync(join(root, rel), { recursive: true });
    writeFileSync(join(root, rel, 'demo.html'), html);
  };
  add('learning/ewa-books', "<script>CONFIG={\n theme:{a:1},\n funnel:'ewa-books'}</script>");
  add('testlibrary/adhd-traits', '<script>CONFIG = { funnel: "testlibrary-adhd" }</script>');
  add('chat/no-slug', '<script>CONFIG={brand:"x"}</script>');
  mkdirSync(join(root, 'learning/ewa-books/img'));
  return root;
}

describe('findFunnels', () => {
  it('indexes demo.html files by CONFIG.funnel, not by folder name', async () => {
    const root = tree();
    const index = await findFunnels(root);
    expect([...index.keys()].sort()).toEqual(['ewa-books', 'testlibrary-adhd']);
    expect(index.get('testlibrary-adhd')).toBe(join(root, 'testlibrary/adhd-traits'));
  });
  it('says which folder is missing and how to point at the right one', async () => {
    const err = await findFunnels('/nope/funnel-development').catch((e) => e);
    expect(err).toBeInstanceOf(DemoError);
    expect(err.message).toMatch(/Funnels folder not found: \/nope\/funnel-development/);
    expect(err.message).toMatch(/IKF_FUNNELS_DIR/);
  });
});

describe('pickFunnels', () => {
  it('returns the chosen funnels in order', async () => {
    const index = await findFunnels(tree());
    expect(pickFunnels(index, ['testlibrary-adhd', 'ewa-books']).map((f) => f.slug)).toEqual(['testlibrary-adhd', 'ewa-books']);
  });
  it('names unknown slugs and lists some that exist', async () => {
    const index = await findFunnels(tree());
    expect(() => pickFunnels(index, ['ewa-books', 'nope'])).toThrow(/CONFIG.funnel = nope\. Some that exist: ewa-books, testlibrary-adhd/);
  });
});
```

Run: `npm run demo:test -- test/funnels.test.mjs`
Expected: FAIL `Error: Cannot find module '../lib/funnels.mjs' imported from '…/demo/test/funnels.test.mjs'` rồi `Tests  no tests`.

- [ ] **Step 2: Implement `funnels.mjs`**

`demo/lib/funnels.mjs`:

```js
// Picks funnels from the funnel-development folder, publishes them through core-api and routes
// /<slug> on every demo host (localhost + LAN IP).
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { bundleKey, sha256Hex } from '../../services/core-api/src/publisher/publish.js';
import { listRoutes, removeRoute, setRoute } from '../../services/core-api/src/publisher/routes.js';
import { DemoError } from './docker.mjs';
import { rewriteMedia } from './media.mjs';

export const DEFAULT_FUNNELS_DIR = '/Users/daothinh/ikame/funnel/funnel-development';
// Three real funnels with CONFIG.funnel and an img/ folder: a dataLayer + ikfunnel:* funnel, one
// with <head> that calls fbq itself, one that builds image paths in template literals.
export const DEFAULT_FUNNELS = ['ewa-books', 'calmio-calm-kids', 'moon-reading'];
const CONFIG_FUNNEL = /CONFIG\s*=\s*\{[\s\S]*?\bfunnel\s*:\s*(['"])([^'"]+)\1/;
const ACTOR = 'demo';

// Map<slug, folder> for every demo.html below dir whose CONFIG has a funnel slug.
export async function findFunnels(dir) {
  if (!existsSync(dir)) {
    throw new DemoError(`Funnels folder not found: ${dir}\nSet IKF_FUNNELS_DIR (or --funnels-dir) to your ikame/funnel/funnel-development folder.`);
  }
  const found = new Map();
  const walk = async (d) => {
    for (const e of await readdir(d, { withFileTypes: true })) {
      if (e.isDirectory() && e.name !== 'img' && e.name !== 'node_modules' && !e.name.startsWith('.')) await walk(join(d, e.name));
      if (e.isFile() && e.name === 'demo.html') {
        const slug = CONFIG_FUNNEL.exec(await readFile(join(d, e.name), 'utf8'))?.[2];
        if (slug && !found.has(slug)) found.set(slug, d);
      }
    }
  };
  await walk(dir);
  return found;
}

export function pickFunnels(index, slugs) {
  const missing = slugs.filter((s) => !index.has(s));
  if (missing.length) {
    const some = [...index.keys()].sort().slice(0, 12).join(', ');
    throw new DemoError(`No demo.html with CONFIG.funnel = ${missing.join(', ')}. Some that exist: ${some}`);
  }
  return slugs.map((slug) => ({ slug, dir: index.get(slug) }));
}

// Same SQL as PUT /v1/domains/:host. Done directly because core's host schema needs a dot,
// so the API rejects "localhost".
export async function registerHosts(pool, hosts) {
  for (const host of hosts) {
    await pool.query("INSERT INTO domains (host, status) VALUES ($1, 'active') ON CONFLICT (host) DO UPDATE SET status = 'active'", [host]);
    await pool.query('INSERT INTO host_revs (host) VALUES ($1) ON CONFLICT (host) DO NOTHING', [host]);
  }
}

async function api(base, token, method, path, body) {
  const res = await fetch(base + path, {
    method,
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new DemoError(`${method} ${path} -> ${res.status} ${JSON.stringify(json)}`);
  return json;
}

export async function publishFunnels({ coreUrl, token, pool, store, kv, funnels, hosts, mediaBase, pixel = null }) {
  const out = [];
  for (const { slug, dir } of funnels) {
    const html = rewriteMedia(await readFile(join(dir, 'demo.html'), 'utf8'), slug, mediaBase);
    const sha256 = sha256Hex(html);
    const r = await api(coreUrl, token, 'POST', `/v1/funnels/${slug}/versions`, { html, sha256 });
    // Postgres keeps its volume, Miniflare's R2 starts empty: an unchanged funnel (created: false)
    // has its version row but no object in this run's bucket. The key is immutable, so re-put it.
    await store.put(bundleKey(slug, r.v), html, { sha256 });
    out.push({ slug, v: r.v, created: r.created });
  }
  await registerHosts(pool, hosts);
  const wanted = new Set(funnels.map((f) => `/${f.slug}`));
  for (const host of hosts) {
    // Routes left by an earlier run with other funnels point at bundles this run never wrote.
    for (const r of (await listRoutes(pool, host)).routes) {
      if (!wanted.has(r.prefix)) await removeRoute(pool, kv, { host, prefix: r.prefix, actor: ACTOR });
    }
    for (const { slug, v } of out) {
      const s = await setRoute(pool, kv, { host, prefix: `/${slug}`, slug, v, actor: ACTOR, confirmFunnelChange: true });
      if (s.kv_sync !== 'ok') throw new DemoError(`route ${host}/${slug}: KV sync ${s.kv_sync}`);
    }
  }
  // Always set (null clears a pixel left by an earlier run); this re-syncs every host's KV doc.
  for (const { slug } of out) await api(coreUrl, token, 'PUT', `/v1/funnels/${slug}`, { pixel_id: pixel });
  return out;
}
```

Run: `npm run demo:test -- test/funnels.test.mjs`
Expected: `Tests  4 passed (4)`.

- [ ] **Step 3: Viết test fail cho stack (unit `lanIp` + end-to-end)**

`demo/test/stack.test.mjs`:

```js
import { describe, it, expect } from 'vitest';
import { lanIp } from '../lib/stack.mjs';

const v4 = (address, internal = false) => ({ family: 'IPv4', address, internal });
const v6 = (address) => ({ family: 'IPv6', address, internal: false });

// Review Focus 2: the host a phone sends must be the one the demo registers.
describe('lanIp', () => {
  it('prefers en0 (Mac Wi-Fi) over VPN / bridge interfaces', () => {
    expect(lanIp({ lo0: [v4('127.0.0.1', true)], utun4: [v4('10.8.0.2')], bridge100: [v4('192.168.64.1')], en0: [v6('fe80::1'), v4('192.168.1.23')] })).toBe('192.168.1.23');
  });
  it('falls back to the first external IPv4', () => {
    expect(lanIp({ lo0: [v4('127.0.0.1', true)], eth0: [v6('fe80::2'), v4('10.0.0.5')] })).toBe('10.0.0.5');
  });
  it('is null offline', () => {
    expect(lanIp({ lo0: [v4('127.0.0.1', true)] })).toBeNull();
  });
});
```

End-to-end, cần Docker; cổng riêng nên chạy được cả khi `npm run demo` đang mở:

`demo/test/demo.test.mjs`:

```js
// End to end on the real stack (needs Docker): containers, core-api, both Workers in Miniflare.
// Own ports, so it also runs while `npm run demo` is up.
import { describe, it, expect, afterAll } from 'vitest';
import { clickhouse, startStack } from '../lib/stack.mjs';

const PORTS = { edge: 8797, core: 8098, media: 8799 };
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const ulid = () => `01${Array.from({ length: 24 }, () => CROCKFORD[Math.floor(Math.random() * 32)]).join('')}`;

let stack;
afterAll(() => stack?.stop());

describe('npm run demo stack', () => {
  it('serves a real funnel with __IKF and the SDK, and its images', async () => {
    stack = await startStack({ ports: PORTS, lan: false, country: 'VN' });
    expect(stack.published.map((p) => p.slug)).toEqual(['ewa-books', 'calmio-calm-kids', 'moon-reading']);
    const res = await fetch(`http://localhost:${PORTS.edge}/ewa-books`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toMatch(/window\.__IKF=\{"funnel":"ewa-books","v":\d+,"rev":\d+,"country":"VN","pixel":null\}/);
    expect(html).toContain(`<script src="/_ikf/sdk.${stack.sdkHash}.js"></script>`);
    const sdk = await fetch(`http://localhost:${PORTS.edge}/_ikf/sdk.${stack.sdkHash}.js`);
    expect(sdk.status).toBe(200);
    const img = `${stack.mediaBase}/ewa-books/img/hook-books.jpg`;
    expect(html).toContain(img);
    const pic = await fetch(img);
    expect(pic.status).toBe(200);
    expect(pic.headers.get('content-type')).toBe('image/jpeg');
  });

  it('a POST to /_ikf/c lands in ClickHouse within 15 seconds', async () => {
    const id = ulid();
    const origin = `http://localhost:${PORTS.edge}`;
    const event = { id, sid: ulid(), t: Date.now(), name: 'screen_view', funnel: 'ewa-books', v: 1, rev: 1, host: 'localhost', path: '/ewa-books', screen: 2 };
    const res = await fetch(`${origin}/_ikf/c`, {
      method: 'POST',
      headers: { 'content-type': 'text/plain', origin },
      body: JSON.stringify({ events: [event] }),
    });
    expect(res.status).toBe(204);
    const sql = 'SELECT name, funnel, screen, country FROM events WHERE id = {id:String} FORMAT JSONEachRow';
    let row = '';
    for (const end = Date.now() + 15_000; !row && Date.now() < end; ) {
      row = (await clickhouse(sql, { params: { id } })).trim();
      if (!row) await new Promise((r) => setTimeout(r, 500));
    }
    expect(JSON.parse(row)).toEqual({ name: 'screen_view', funnel: 'ewa-books', screen: 2, country: 'VN' });
  });

  // Review Focus 5: Postgres keeps every version across runs, Miniflare starts empty.
  it('a second start on the same Postgres state reuses the versions and still serves them', async () => {
    await stack.stop();
    stack = await startStack({ ports: PORTS, lan: false, country: 'DE' });
    expect(stack.published.every((p) => p.created === false)).toBe(true);
    for (const p of stack.published) {
      const res = await fetch(`http://localhost:${PORTS.edge}/${p.slug}`);
      expect(res.status, p.slug).toBe(200);
      expect(await res.text()).toContain(`"funnel":"${p.slug}","v":${p.v},`);
    }
  });

  it('stop() frees every port', async () => {
    await stack.stop();
    stack = null;
    for (const port of Object.values(PORTS)) {
      await expect(fetch(`http://127.0.0.1:${port}/`)).rejects.toThrow();
    }
  });
});
```

Run: `npm run demo:test -- test/stack.test.mjs test/demo.test.mjs`
Expected: FAIL `Error: Cannot find module '../lib/stack.mjs' imported from '…/demo/test/stack.test.mjs'` ở cả 2 file.

- [ ] **Step 4: Implement `stack.mjs`**

`demo/lib/stack.mjs`:

```js
// The whole local demo in one call: containers, core-api, Miniflare (edge-router + event-consumer),
// media server, published + routed funnels. Used by demo/run.mjs and demo/test/demo.test.mjs.
import { readFile } from 'node:fs/promises';
import { networkInterfaces } from 'node:os';
import pg from 'pg';
import { buildApp } from '../../services/core-api/src/app.js';
import { ensureToken } from '../../services/core-api/src/auth.js';
import { migrate } from '../../services/core-api/src/db/migrate.js';
import { miniflareKv, miniflareStore } from './adapters.mjs';
import { checkPortsFree, composeUp, DemoError, ensureDocker } from './docker.mjs';
import { DEFAULT_FUNNELS, DEFAULT_FUNNELS_DIR, findFunnels, pickFunnels, publishFunnels } from './funnels.mjs';
import { startMediaServer } from './media.mjs';
import { startMiniflare } from './miniflare.mjs';

export const DEMO_TOKEN = 'ikf_demo_admin';
export const PORTS = { edge: 8787, core: 8080, media: 8790 };
export const PG = { host: '127.0.0.1', port: 54329, database: 'ikf', user: 'ikf', password: 'ikf' };
export const CH = { url: 'http://127.0.0.1:18123', user: 'ikf', password: 'ikf', database: 'ikf' };
const DDL = new URL('../../clickhouse/001_events.sql', import.meta.url);

// First non-internal IPv4, en0 (Wi-Fi on a Mac) first.
export function lanIp(ifaces = networkInterfaces()) {
  const names = Object.keys(ifaces).sort((a, b) => (a === 'en0' ? -1 : b === 'en0' ? 1 : 0));
  for (const name of names) {
    for (const a of ifaces[name] ?? []) if (a.family === 'IPv4' && !a.internal) return a.address;
  }
  return null;
}

export async function clickhouse(sql, { params = {} } = {}) {
  const qs = new URLSearchParams({ database: CH.database });
  for (const [k, v] of Object.entries(params)) qs.set(`param_${k}`, v);
  let res;
  try {
    res = await fetch(`${CH.url}/?${qs}`, {
      method: 'POST',
      headers: { authorization: `Basic ${btoa(`${CH.user}:${CH.password}`)}` },
      body: sql,
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    throw new DemoError(`ClickHouse is not reachable at ${CH.url} (${err.cause?.code ?? err.message}). Start the demo first: npm run demo`);
  }
  const text = await res.text();
  if (!res.ok) throw new DemoError(`ClickHouse HTTP ${res.status}: ${text.slice(0, 300)}`);
  return text;
}

// The image reports healthy before its entrypoint has created the ikf user; retry until it answers.
async function waitForClickhouse(ms = 30_000) {
  const end = Date.now() + ms;
  for (;;) {
    try {
      return await clickhouse('SELECT 1');
    } catch (err) {
      if (Date.now() > end) throw err;
      await new Promise((r) => setTimeout(r, 500));
    }
  }
}

export async function startStack({
  funnels = DEFAULT_FUNNELS,
  funnelsDir = process.env.IKF_FUNNELS_DIR || DEFAULT_FUNNELS_DIR,
  country = 'VN',
  lan = true,
  pixel = null,
  ports = PORTS,
  verbose = false,
} = {}) {
  const chosen = pickFunnels(await findFunnels(funnelsDir), funnels);
  await checkPortsFree({ [ports.edge]: 'edge-router (Miniflare)', [ports.core]: 'core-api', [ports.media]: 'media server' });
  await ensureDocker();
  await composeUp();

  const stops = [];
  const stop = async () => {
    while (stops.length) await stops.pop()().catch(() => {});
  };
  try {
    const pool = new pg.Pool({ ...PG, max: 5 });
    stops.push(() => pool.end());
    await migrate(pool);
    await ensureToken(pool, { name: 'demo', roles: ['admin'], token: DEMO_TOKEN });

    await waitForClickhouse();
    await clickhouse(await readFile(DDL, 'utf8'));

    const ip = lan ? lanIp() : null;
    const media = await startMediaServer({ dirs: new Map(chosen.map((f) => [f.slug, f.dir])), port: ports.media });
    stops.push(() => media.close());
    // Phones load images from the LAN IP; the desktop browser can use it too.
    const mediaBase = `http://${ip ?? '127.0.0.1'}:${ports.media}`;

    const edge = await startMiniflare({ port: ports.edge, country, clickhouse: CH, verbose });
    stops.push(() => edge.dispose());
    const store = miniflareStore(edge.bundles);
    const kv = miniflareKv(edge.routes);

    const app = buildApp({
      logger: verbose,
      checks: { db: () => pool.query('select 1') },
      deps: { pool, store, kv, mediaOrigins: [mediaBase], previewBaseUrl: `http://preview.localhost:${ports.edge}` },
    });
    await app.listen({ host: '127.0.0.1', port: ports.core });
    stops.push(() => app.close());
    const coreUrl = `http://127.0.0.1:${app.server.address().port}`;

    const hosts = ['localhost', ...(ip ? [ip] : [])];
    const published = await publishFunnels({ coreUrl, token: DEMO_TOKEN, pool, store, kv, funnels: chosen, hosts, mediaBase, pixel });

    return {
      published: published.map((p) => ({ ...p, urls: hosts.map((h) => `http://${h}:${ports.edge}/${p.slug}`) })),
      hosts,
      lanIp: ip,
      country,
      sdkHash: edge.sdkHash,
      edgeUrl: `http://localhost:${ports.edge}`,
      coreUrl,
      mediaBase,
      adminToken: DEMO_TOKEN,
      stop,
    };
  } catch (err) {
    await stop();
    throw err;
  }
}
```

- [ ] **Step 5: Chạy test**

Run: `npm run demo:test -- test/stack.test.mjs test/demo.test.mjs`
Expected: `Tests  7 passed (7)`, file `demo.test.mjs` ~4 giây (container đã chạy từ Task 1; nếu chưa, `compose up` tự bật).

Kiểm Review Focus 5 bằng mutation (không commit): đổi dòng `await store.put(bundleKey(slug, r.v), html, { sha256 });` thành `if (r.created) await store.put(…)` rồi chạy lại → `a second start on the same Postgres state …` FAIL `ewa-books: expected 502 to be 200`. Hoàn lại.

- [ ] **Step 6: Commit**

```bash
git add demo/lib/funnels.mjs demo/lib/stack.mjs demo/test/funnels.test.mjs demo/test/stack.test.mjs demo/test/demo.test.mjs
git commit -m "demo: startStack publishes real funnels through core-api and routes localhost + LAN IP; e2e smoke test"
```

---

### Task 5: `npm run demo` / `demo:events` / `demo:down`, README, chạy thật end-to-end

**Files:**
- Create: `demo/run.mjs`, `demo/events.mjs`, `demo/README.md`
- Modify: `package.json` (scripts `demo`, `demo:events`, `demo:down`)

**Interfaces:**
- Consumes: `startStack`, `clickhouse`, `DemoError`, `ensureDocker`, `composeDown`.
- Produces: CLI
  - `npm run demo -- [--funnels a,b,c] [--funnels-dir d] [--country CC] [--pixel id] [--no-lan] [--reset] [--verbose] [--help]`
  - `npm run demo:down -- [--reset]`
  - `npm run demo:events -- [--funnel slug]`

Phần này là entry mỏng quanh code đã có test ở Task 1–4; kiểm bằng chạy thật (Step 3–6), mỗi bước có output mong đợi.

- [ ] **Step 1: `run.mjs` + `events.mjs`**

`demo/run.mjs`:

```js
#!/usr/bin/env node
// npm run demo [-- --funnels a,b,c --country DE --pixel <id> --no-lan --reset --verbose]
// npm run demo:down [-- --reset]
import { parseArgs } from 'node:util';
import { composeDown, DemoError, ensureDocker } from './lib/docker.mjs';
import { startStack } from './lib/stack.mjs';

const USAGE = `Usage: npm run demo -- [options]
  --funnels a,b,c     funnel slugs (CONFIG.funnel); default ewa-books,calmio-calm-kids,moon-reading
  --funnels-dir <d>   funnel-development folder; default $IKF_FUNNELS_DIR or /Users/daothinh/ikame/funnel/funnel-development
  --country <CC>      request.cf.country for every request; default VN (DE shows the consent banner)
  --pixel <id>        set this Meta Pixel id on every demo funnel
  --no-lan            only localhost (no LAN IP route, images from 127.0.0.1)
  --reset             wipe Postgres + ClickHouse volumes first
  --verbose           Miniflare + core-api logs
npm run demo:down [-- --reset]   stop the containers (--reset also deletes their volumes)`;

function parse(argv) {
  const { values } = parseArgs({
    args: argv,
    options: {
      funnels: { type: 'string' },
      'funnels-dir': { type: 'string' },
      country: { type: 'string', default: 'VN' },
      pixel: { type: 'string' },
      'no-lan': { type: 'boolean', default: false },
      reset: { type: 'boolean', default: false },
      down: { type: 'boolean', default: false },
      verbose: { type: 'boolean', default: false },
      help: { type: 'boolean', default: false },
    },
  });
  if (!/^[A-Z]{2}$/.test(values.country)) throw new DemoError(`--country must be a 2-letter code, got ${values.country}`);
  return values;
}

async function main() {
  let opts;
  try {
    opts = parse(process.argv.slice(2));
  } catch (err) {
    throw new DemoError(`${err.message}\n\n${USAGE}`);
  }
  if (opts.help) return console.log(USAGE);
  if (opts.down || opts.reset) {
    await ensureDocker();
    await composeDown({ volumes: opts.reset });
    console.log(opts.reset ? 'Containers stopped, volumes deleted.' : 'Containers stopped (data kept).');
    if (opts.down) return;
  }

  console.log('Starting the iFunnel demo (first run pulls images and takes longer)...');
  const stack = await startStack({
    ...(opts.funnels && { funnels: opts.funnels.split(',').map((s) => s.trim()).filter(Boolean) }),
    ...(opts['funnels-dir'] && { funnelsDir: opts['funnels-dir'] }),
    country: opts.country,
    lan: !opts['no-lan'],
    pixel: opts.pixel ?? null,
    verbose: opts.verbose,
  });

  const w = Math.max(...stack.published.map((p) => p.slug.length));
  console.log(`\niFunnel demo is up. SDK ${stack.sdkHash}, country ${stack.country}${opts.pixel ? `, pixel ${opts.pixel}` : ''}\n`);
  for (const p of stack.published) console.log(`  ${p.slug.padEnd(w)}  v${p.v}  ${p.urls.join('   ')}`);
  console.log('');
  if (stack.lanIp) console.log(`  Phone (same wifi): open the http://${stack.lanIp}:8787/... links above`);
  console.log('  Events:   npm run demo:events');
  console.log(`  core-api: ${stack.coreUrl}  token ${stack.adminToken}`);
  if (stack.lanIp) console.log(`            IKF_API=${stack.coreUrl} IKF_TOKEN=${stack.adminToken} npx ikf route ls ${stack.lanIp}`);
  console.log('  Stop:     Ctrl-C (containers keep running; npm run demo:down stops them)\n');

  let stopping = false;
  const shutdown = async () => {
    if (stopping) return;
    stopping = true;
    console.log('\nStopping...');
    setTimeout(() => process.exit(1), 10_000).unref();
    await stack.stop();
    console.log('Stopped. Postgres + ClickHouse keep running: npm run demo:down');
    process.exit(0);
  };
  // Miniflare's exit hook calls process.exit(130) on SIGINT before any async cleanup can run;
  // take the signals over (its 'exit' hook that kills workerd stays) and dispose it in stop().
  for (const sig of ['SIGINT', 'SIGTERM']) {
    process.removeAllListeners(sig);
    process.on(sig, shutdown);
  }
}

main().catch((err) => {
  if (err instanceof DemoError) console.error(`ikf demo: ${err.message}`);
  else console.error(err);
  process.exit(1);
});
```

`demo/events.mjs`:

```js
#!/usr/bin/env node
// npm run demo:events [-- --funnel <slug>]: the 30 newest events and counts per funnel/name/screen.
import { parseArgs } from 'node:util';
import { DemoError } from './lib/docker.mjs';
import { clickhouse } from './lib/stack.mjs';

async function main() {
  const { values } = parseArgs({ args: process.argv.slice(2), options: { funnel: { type: 'string' } } });
  if (values.funnel !== undefined && !/^[a-z0-9][a-z0-9-]{1,62}$/.test(values.funnel)) {
    throw new DemoError(`--funnel must be a funnel slug, got ${values.funnel}`);
  }
  const where = values.funnel ? 'WHERE funnel = {funnel:String}' : '';
  const params = values.funnel ? { funnel: values.funnel } : {};
  const total = (await clickhouse(`SELECT count() FROM events FINAL ${where}`, { params })).trim();
  console.log(`${total} event(s)${values.funnel ? ` for ${values.funnel}` : ''} in ClickHouse (ikf.events)\n`);
  if (total === '0') {
    console.log('Open a funnel URL printed by `npm run demo`, click through a few screens, then run this again.');
    return;
  }
  console.log('Newest 30:');
  process.stdout.write(
    await clickhouse(
      `SELECT formatDateTime(received_at, '%H:%i:%S') AS at, funnel, name, screen, country, ua_class, substring(sid, 1, 10) AS sid
         FROM events FINAL ${where} ORDER BY received_at DESC, t DESC LIMIT 30 FORMAT PrettyCompactMonoBlock`,
      { params },
    ),
  );
  console.log('\nCounts by funnel / name / screen:');
  process.stdout.write(
    await clickhouse(
      `SELECT funnel, name, screen, count() AS events, uniqExact(sid) AS sessions
         FROM events FINAL ${where} GROUP BY funnel, name, screen ORDER BY funnel, screen NULLS FIRST, name FORMAT PrettyCompactMonoBlock`,
      { params },
    ),
  );
}

main().catch((err) => {
  console.error(err instanceof DemoError ? `ikf demo: ${err.message}` : err);
  process.exit(1);
});
```

```bash
npm pkg set scripts.demo="node demo/run.mjs" scripts.demo:events="node demo/events.mjs" scripts.demo:down="node demo/run.mjs --down"
```

- [ ] **Step 2: README**

`demo/README.md`:

````markdown
# Local demo

One command runs real funnels on your machine: edge-router + event-consumer in Miniflare, core-api in
the same Node process, Postgres + ClickHouse in Docker. No AWS / Cloudflare / Paddle / Meta account.

## Run

Needs Node ≥ 22, Colima (`colima start`) and the compose plugin (`brew install docker-compose`), and the
`ikame` repo's `funnel/funnel-development` folder.

```bash
npm ci
npm run demo             # prints a URL per funnel, for localhost and for your LAN IP
npm run demo:events      # newest 30 events + counts per funnel / name / screen (-- --funnel <slug>)
npm run demo:down        # stop the containers (-- --reset also deletes their data)
npm run demo:test        # unit tests + end-to-end smoke test (needs Docker)
```

Open a URL, click through a few screens, then `npm run demo:events` shows `page_load`, `funnel_start`,
`screen_view`, … for that funnel. A phone on the same wifi opens the `http://<LAN IP>:8787/<slug>` link
(macOS may ask once to allow incoming connections for `node` / `workerd`).

| Option | Default | |
|---|---|---|
| `--funnels a,b,c` | `ewa-books,calmio-calm-kids,moon-reading` | `CONFIG.funnel` slugs, not folder names |
| `--funnels-dir <dir>` | `$IKF_FUNNELS_DIR` or `/Users/daothinh/ikame/funnel/funnel-development` | |
| `--country <CC>` | `VN` | `request.cf.country`; `DE`, `GB`, `CH`… show the consent banner |
| `--pixel <id>` | none | sets the Meta Pixel on every demo funnel (`PUT /v1/funnels/:slug`) |
| `--no-lan` | LAN on | only `localhost`; images from 127.0.0.1 |
| `--reset` | | wipe Postgres + ClickHouse volumes before starting |
| `--verbose` | | Miniflare + core-api logs |

Pass options after `--`: `npm run demo -- --country DE --funnels ewa-books`.

## What runs where

| Port | What |
|---|---|
| 8787 (all interfaces) | Miniflare: `edge-router` (routes, `__IKF`, `/_ikf/sdk.<hash>.js`, `POST /_ikf/c`) → Queue → `event-consumer` → ClickHouse |
| 8080 (127.0.0.1) | core-api (`buildApp`): publish, routes, pixel. Admin token `ikf_demo_admin`: `IKF_API=http://127.0.0.1:8080 IKF_TOKEN=ikf_demo_admin npx ikf route ls <LAN IP>` |
| 8790 (all interfaces) | media: each funnel's `img/` at `/<slug>/img/…`; funnel HTML is rewritten to point there |
| 54329 / 18123 (127.0.0.1) | Postgres 17 (`ikf`/`ikf`) / ClickHouse HTTP (`ikf`/`ikf`, database `ikf`) |

Postgres and ClickHouse keep their data between runs (named volumes); KV / R2 / Queue live in memory and
are rebuilt on every start (bundles are re-put, every host's route doc re-synced). Preview URLs are
`http://preview.localhost:8787/<slug>/v<n>` (Chrome resolves `*.localhost`).

With `--pixel`, the browser loads the real `fbevents.js` and sends to Meta: use a test Pixel.
The API rejects `localhost` as a host (no dot), so the demo registers hosts and routes through core's
publisher functions; `ikf route ls` works for the LAN IP.

## Troubleshooting

| Message | Fix |
|---|---|
| `Docker is not running. Start it with: colima start` | `colima start` |
| `docker compose is not available` | `brew install docker-compose` (Docker reads plugins from `/opt/homebrew/lib/docker/cli-plugins`) |
| `Port 8787 (edge-router (Miniflare)) is already in use` | an earlier demo or `wrangler dev`; `lsof -nP -iTCP:8787 -sTCP:LISTEN` |
| `Bind for 127.0.0.1:54329 failed` | another Postgres container uses the port; stop it |
| `Funnels folder not found` | `IKF_FUNNELS_DIR=/path/to/funnel-development npm run demo` |
| Phone cannot open the LAN link | same wifi, no client isolation; allow `node`/`workerd` in macOS firewall |
| `ClickHouse is not reachable` (demo:events) | start the demo first |
````

- [ ] **Step 3: Chạy demo, mở funnel**

Terminal 1:
```bash
npm run demo
```
Expected (IP LAN, `v`, hash SDK thay đổi theo máy; lúc viết plan):
```
Starting the iFunnel demo (first run pulls images and takes longer)...

iFunnel demo is up. SDK 109bf93d90bf, country VN

  ewa-books         v2  http://localhost:8787/ewa-books   http://10.10.20.142:8787/ewa-books
  calmio-calm-kids  v2  http://localhost:8787/calmio-calm-kids   http://10.10.20.142:8787/calmio-calm-kids
  moon-reading      v2  http://localhost:8787/moon-reading   http://10.10.20.142:8787/moon-reading

  Phone (same wifi): open the http://10.10.20.142:8787/... links above
  Events:   npm run demo:events
  core-api: http://127.0.0.1:8080  token ikf_demo_admin
            IKF_API=http://127.0.0.1:8080 IKF_TOKEN=ikf_demo_admin npx ikf route ls 10.10.20.142
  Stop:     Ctrl-C (containers keep running; npm run demo:down stops them)
```
`v2` vì smoke test Task 4 đã publish `v1` với media `127.0.0.1:8799`; HTML đổi (IP LAN / cổng media) thì version tăng, giống hệt khi publish thật. Từ volume trống (`npm run demo -- --reset`, image đã có) banner hiện sau ~4 giây (đo: 3.8s); chạy lại khi container đã lên: ~1.5–2s.

Terminal 2:
```bash
LAN=$(ipconfig getifaddr en0)
for u in http://localhost:8787/ewa-books http://$LAN:8787/moon-reading; do
  curl -s $u | grep -oE 'window.__IKF=[^<]*</script><script src="[^"]*"'
done
H=$(curl -s http://localhost:8787/ewa-books | grep -oE '/_ikf/sdk\.[0-9a-f]{12}\.js')
curl -s -o /dev/null -w "sdk %{http_code} %{content_type}\n" http://localhost:8787$H
curl -s http://localhost:8787/calmio-calm-kids | grep -cE "['\"\`(]img/"
curl -s -o /dev/null -w "img %{http_code} %{content_type}\n" http://$LAN:8790/calmio-calm-kids/img/hook-evening.jpg
IKF_API=http://127.0.0.1:8080 IKF_TOKEN=ikf_demo_admin npx ikf route ls $LAN
```
Expected:
```
window.__IKF={"funnel":"ewa-books","v":2,"rev":18,"country":"VN","pixel":null}</script><script src="/_ikf/sdk.109bf93d90bf.js"
window.__IKF={"funnel":"moon-reading","v":2,"rev":6,"country":"VN","pixel":null}</script><script src="/_ikf/sdk.109bf93d90bf.js"
sdk 200 text/javascript; charset=utf-8
0
img 200 image/jpeg
10.10.20.142 (active) rev 6, KV rev 6
  /calmio-calm-kids        calmio-calm-kids@v2      demo  2026-10-09T03:20:56.072Z
  /moon-reading            moon-reading@v2          demo  2026-10-09T03:20:56.079Z
  /ewa-books               ewa-books@v2             demo  2026-10-09T03:20:56.066Z
```

Mở `http://localhost:8787/ewa-books` trên trình duyệt (hoặc link IP LAN trên điện thoại cùng wifi), bấm qua 3–4 màn.

- [ ] **Step 4: Event vào ClickHouse**

```bash
NOW=$(node -e 'console.log(Date.now())')
curl -s -X POST -H 'content-type: application/json' -H 'origin: http://localhost:8787' -w 'collector %{http_code}\n' \
  http://localhost:8787/_ikf/c \
  -d '{"events":[{"id":"01JZDEM0C0R00000000000001A","sid":"01JZDEM0C0R00000000000002A","t":'$NOW',"name":"funnel_start","funnel":"moon-reading","v":1,"rev":1,"host":"localhost","path":"/moon-reading","screen":0}]}'
sleep 2
npm run demo:events
npm run demo:events -- --funnel moon-reading
```
Expected: `collector 204`; `demo:events` in `N event(s) in ClickHouse (ikf.events)`, bảng "Newest 30" và "Counts by funnel / name / screen". Lúc viết plan, sau khi bấm `ewa-books` 4 màn bằng Chromium (Playwright headless, viewport điện thoại, qua IP LAN) cộng event curl ở trên:
```
9 event(s) in ClickHouse (ikf.events)

Newest 30:
   ┌─at───────┬─funnel───────┬─name─────────┬─screen─┬─country─┬─ua_class─┬─sid────────┐
1. │ 03:21:12 │ moon-reading │ funnel_start │      0 │ VN      │ other    │ 01JZDEM0C0 │
2. │ 03:21:10 │ ewa-books    │ screen_view  │      1 │ VN      │ desktop  │ 01M4FAVH7Q │
3. │ 03:21:10 │ ewa-books    │ screen_view  │      2 │ VN      │ desktop  │ 01M4FAVH7Q │
4. │ 03:21:10 │ ewa-books    │ screen_view  │      1 │ VN      │ desktop  │ 01M4FAVH7Q │
5. │ 03:21:10 │ ewa-books    │ screen_view  │      2 │ VN      │ desktop  │ 01M4FAVH7Q │
6. │ 03:21:10 │ ewa-books    │ screen_view  │      1 │ VN      │ desktop  │ 01M4FAVH7Q │
7. │ 03:21:10 │ ewa-books    │ funnel_start │      1 │ VN      │ desktop  │ 01M4FAVH7Q │
8. │ 03:21:10 │ ewa-books    │ page_load    │   ᴺᵁᴸᴸ │ VN      │ desktop  │ 01M4FAVH7Q │
9. │ 03:20:44 │ ewa-books    │ screen_view  │      2 │ VN      │ other    │ 01HQB02SB2 │
   └──────────┴──────────────┴──────────────┴────────┴─────────┴──────────┴────────────┘

Counts by funnel / name / screen:
   ┌─funnel───────┬─name─────────┬─screen─┬─events─┬─sessions─┐
1. │ ewa-books    │ page_load    │   ᴺᵁᴸᴸ │      1 │        1 │
2. │ ewa-books    │ funnel_start │      1 │      1 │        1 │
3. │ ewa-books    │ screen_view  │      1 │      3 │        1 │
4. │ ewa-books    │ screen_view  │      2 │      3 │        2 │
5. │ moon-reading │ funnel_start │      0 │      1 │        1 │
   └──────────────┴──────────────┴────────┴────────┴──────────┘
```
(`id` phải là ULID hợp lệ — Crockford, không có `I L O U`; id sai bị collector bỏ âm thầm, vẫn `204`, log `events_rejected`.)

- [ ] **Step 5: Lỗi rõ ràng + Ctrl-C**

Khi Terminal 1 còn chạy (cổng được kiểm trước Docker, nên đây là lỗi cổng):
```bash
npm run demo 2>&1 | tail -1
IKF_FUNNELS_DIR=/nope npm run demo 2>&1 | tail -2
npm run demo -- --funnels ewa-books,nope 2>&1 | tail -1
```
Expected:
```
ikf demo: Port 8080 (core-api) is already in use. Find the process with: lsof -nP -iTCP:8080 -sTCP:LISTEN
ikf demo: Funnels folder not found: /nope
Set IKF_FUNNELS_DIR (or --funnels-dir) to your ikame/funnel/funnel-development folder.
ikf demo: No demo.html with CONFIG.funnel = nope. Some that exist: ai-video-generator, astrocartography, aura-tarot, authenticator, ayahpath, ayahpath-arabic, ayahpath-halal-finance, calmio, calmio-burnout, calmio-calm-kids, calmio-hypnosis, calmio-life-planner
```
(Báo `8080` chứ không phải `8787` vì `checkPortsFree` duyệt key số theo thứ tự tăng; cổng nào bận thì báo cổng đó.)

Terminal 1: bấm Ctrl-C. Expected:
```
Stopping...
Stopped. Postgres + ClickHouse keep running: npm run demo:down
```
exit code `0` (gửi SIGINT cho cả process group như terminal: cũng `0`); sau đó `lsof -nP -iTCP -sTCP:LISTEN | grep -E ':(8787|8080|8790)\b'` và `pgrep workerd` không in gì.

Docker không chạy (giả lập bằng socket sai):
```bash
DOCKER_HOST=unix:///tmp/nope.sock npm run demo 2>&1 | tail -1
```
Expected: `ikf demo: Docker is not running. Start it with: colima start`.

Chạy lại với cờ, kiểm A3 (route funnel cũ bị gỡ) + pixel + country:
```bash
npm run demo -- --pixel 123456789012345 --country DE --no-lan --funnels moon-reading
# terminal 2:
curl -s http://localhost:8787/moon-reading | grep -oE 'window.__IKF=[^<]*'
curl -s -o /dev/null -w "ewa-books %{http_code}\n" http://localhost:8787/ewa-books
```
Expected: `window.__IKF={"funnel":"moon-reading","v":<n>,"rev":<n>,"country":"DE","pixel":"123456789012345"}` và `ewa-books 404`. Mở URL trong trình duyệt: banner consent hiện (lúc viết plan kiểm bằng Chromium headless với `npm run demo -- --country DE --no-lan`: `document.getElementById('ikf-consent')` có trên `ewa-books` và `moon-reading`). Ctrl-C.

- [ ] **Step 6: Toàn bộ test demo + test cũ không đổi**

```bash
npm run demo:test
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock
npm test
git status --short
git diff --stat 4f25cf4 -- services workers packages
```
Expected: `demo:test` → `Test Files  7 passed (7)`, `Tests  36 passed (36)`; `npm test` pass như trước nhánh (cli 70, event-schema 138, route-match 35, sdk 109, core-api 104, edge-router 77, event-consumer 7 + 27); `git status` chỉ còn `demo/run.mjs`, `demo/events.mjs`, `demo/README.md`, `package.json` (không có `demo/.build/`, `.wrangler/`, `sdk-bundle.generated.js`); `git diff … -- services workers packages` không in gì.

- [ ] **Step 7: Dừng container + commit**

```bash
npm run demo:down
git add package.json demo/run.mjs demo/events.mjs demo/README.md
git commit -m "demo: npm run demo / demo:events / demo:down with clean Ctrl-C and README"
```
Expected: `Containers stopped (data kept).` (`npm run demo:down -- --reset` thì `Containers stopped, volumes deleted.`).

---

## Theo sau (ngoài phạm vi plan này)

1. **Báo cho PR #2 (`feat/runtime-sdk-collector`) — A2:** `workers/event-consumer/src/index.js` export `MAX_RETRIES`, `FAILING_AFTER`, `handleBatch` cạnh `default`. workerd coi mọi named export của main module là entrypoint: `npx wrangler dev` trong `workers/event-consumer` (wrangler 4.148.0) dừng với `Uncaught TypeError: Incorrect type for map entry 'FAILING_AFTER'`. Test hiện có không bắt được vì vitest-pool-workers không nạp `src/index.js` làm main module. Gần như chắc `wrangler deploy` cũng bị Cloudflare từ chối. Sửa (ở PR #2, không phải ở đây): chuyển `handleBatch` + hằng sang `src/batch.js`, `index.js` chỉ `export default`; thêm một test khởi động Worker bằng Miniflare với bundle thật. Sau khi sửa, `bundleWorker` có thể quay về `entryPoints` (giữ `stdin` cũng không hại).
2. Checkout + Paddle giả khi nhánh `feat/billing-paddle` merge: thêm Worker/route vào `startMiniflare`, thêm cờ `--paddle`.
3. Nâng `miniflare` cùng lúc với `@cloudflare/vitest-pool-workers` (giữ một bản workerd trong repo); khi workerd hỗ trợ `2026-09-01`, cảnh báo compat date tự hết.

---

## Self-Review

**Spec coverage:**

| Spec | Task |
|---|---|
| Mục tiêu: một lệnh, ~1 phút, trình duyệt + điện thoại cùng wifi, event về ClickHouse, không cần tài khoản cloud | 5 (Step 3–4: banner sau 1.5–3.8s, curl qua IP LAN, Chromium bấm 4 màn → `page_load`/`funnel_start`/`screen_view`) |
| Điều kiện xong: `__IKF` + script SDK; `demo:events` thấy event đúng funnel; `demo:test` pass; không sửa production | 3, 4, 5 (Step 6: `git diff 4f25cf4 -- services workers packages` rỗng) |
| QĐ #1 một process Node + 2 container Colima | 1, 4 |
| QĐ #2 Miniflare API lập trình, 2 Worker, KV/R2/Queue, producer `/_ikf/c` → consumer | 3 |
| QĐ #3 `buildApp()` + pool container + adapter store/kv ghi vào binding Miniflare | 3 (adapter), 4 |
| QĐ #4 `postgres:17-alpine` + ClickHouse qua `demo/compose.yaml`, volume có tên | 1 (+A12) |
| QĐ #5 media server + rewrite `IMG`/`img/…` + `mediaOrigins` | 2 (+A6), 4 |
| QĐ #6 3 funnel thật có `CONFIG.funnel`, `--funnels a,b,c`, `IKF_FUNNELS_DIR` | 4, 5 |
| QĐ #7 checkout ngoài phạm vi | "Theo sau" 2 |
| §1 `compose.yaml` (54329, 18123, healthcheck) | 1 |
| §1 `run.mjs` (cờ, compose up --wait, migration + DDL, khởi động, publish + route, in thông tin, Ctrl-C) | 4 (`startStack`), 5 |
| §1 `stack.mjs` `startStack(opts) → {urls, adminToken, stop()}` | 4 (trả thêm `published`, `sdkHash`, `coreUrl`, `mediaBase`…) |
| §1 `miniflare.mjs` (esbuild như wrangler, SDK build trước, binding, vars, `cf.country`) | 3 (+A2, A4, A5) |
| §1 `adapters.mjs` cùng interface `createR2Store`/`createKvClient` | 3 |
| §1 `media.mjs` (cổng 8790, `rewriteMedia(html, slug, base)`) | 2 |
| §1 `funnels.mjs` (chọn, đọc, rewrite, publish `POST /v1/funnels/:slug/versions`, domain `localhost` + IP LAN, route `/<slug>`) | 4 (+A1, A3) |
| §1 `events.mjs` (30 event gần nhất, đếm theo funnel/name/screen) | 5 |
| §1 `demo.test.mjs` (GET có `__IKF` + SDK, POST 204, ≤ 15s có trong ClickHouse, dừng) | 4 |
| §1 `README.md` | 5 |
| §2 Host `0.0.0.0:8787`, `localhost` + IP LAN, `--no-lan`, `preview.localhost` | 3, 4, 5 |
| §2 core-api 8080 chỉ API, token `ikf_demo_admin` qua `ensureToken`, lệnh `ikf route ls` | 4, 5 (lệnh in cho IP LAN, A1) |
| §2 Pixel `--pixel` → `PUT /v1/funnels/:slug`; README ghi `fbevents.js` thật | 4, 5 |
| §2 Consent `--country DE` → banner | 3 (`country":"DE"` trong `__IKF`), 5 (Step 5, `#ikf-consent`) |
| §2 Dừng: Ctrl-C đóng Miniflare/core/media/pool; container còn chạy; `demo:down`; `--reset` | 4 (`stop() frees every port`), 5 (+A8, A10) |
| §2 Lỗi: Docker/Colima, thiếu thư mục funnel, cổng bị chiếm | 1 (unit), 4 (`findFunnels`), 5 (chạy thật) (+A7) |
| §3 Smoke test Vitest timeout 120s, chỉ local | 1 (`vitest.config.mjs`), 4 |
| §3 Unit `rewriteMedia` (map `IMG`, literal `img/`, giữ `data:` + URL tuyệt đối) và 2 adapter | 2, 3 |
| §4 Ngoài phạm vi | không có task (đúng) |

**Placeholder:** không có "TBD"/"tương tự Task N"; mọi file đầy đủ. Toàn bộ code trong plan được trích **từ chính file plan này** và chạy lại theo đúng thứ tự task trên một worktree sạch `feat/runtime-sdk-collector@4f25cf4` (Node 26.3, npm 11.16, Colima + Compose v2.40.3, volume trống): mỗi bước "test fail" fail đúng thông báo ghi trong plan, mỗi bước "chạy test" ra đúng số test ghi trong plan (7 → 11 → 4 + 3 → 4 → 3 + 4; tổng `demo:test` 36), 5 commit thành công, `npm test` toàn repo không đổi.

**Nhất quán tên / kiểu:**
- `DemoError` (Task 1) là lỗi duy nhất `run.mjs`/`events.mjs` in gọn; `findFunnels`, `pickFunnels`, `publishFunnels`, `clickhouse()`, `ensureDocker`, `composeUp/Down`, `checkPortsFree` đều throw nó.
- Adapter: `miniflareStore(r2).put(key, body, {sha256})` ↔ `publishVersion` gọi `store.put(key, html, {sha256})`; `miniflareKv(kv).put(key, value)` ↔ `syncHost` gọi `kv.put(routeKey(host), JSON)`. Lỗi → `StoreUnavailableError` / `KvUnavailableError` như adapter thật.
- `startMiniflare` trả `routes`/`bundles` (Task 3) → `startStack` bọc bằng adapter (Task 4) → `publishFunnels` dùng `store` (re-put) và `kv` (`setRoute`/`removeRoute`) (Task 4).
- `bundleKey(slug, v)` của core = key `publishVersion` ghi = key `syncHost` đưa vào KV (`v.r2_key`) = key edge đọc.
- Cổng `PORTS = {edge, core, media}` (Task 4) ↔ thông báo `checkPortsFree` ↔ README ↔ smoke test `{8797, 8098, 8799}`.
- `CH = {url, user, password, database: 'ikf'}` (Task 4) = `compose.yaml` (`CLICKHOUSE_DB/USER/PASSWORD`) = `CLICKHOUSE_DATABASE` trong `workers/event-consumer/wrangler.json` = query của `events.mjs`.
- `sdkHash` = `buildSdk().hash` (Task 3) = hash trong `<script src>` edge chèn (test Task 3, 4) = banner `run.mjs`.

**Review Focus đã ghim:** 1 → Task 2; 2 → Task 3 + Task 4 (`lanIp`); 3 → Task 3 + Task 4; 4 → Task 3 + Task 4; 5 → Task 4 (+ mutation) + Task 5 Step 5.
